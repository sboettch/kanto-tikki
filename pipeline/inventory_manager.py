#!/usr/bin/env python3
"""inventory_manager.py — Master Inventory Database & Listing Lifecycle Engine.

Tracks every listing across Greater Tokyo and Kanagawa transit corridors:
- Status lifecycle: LIVE (active vacancy) vs. FILLED (leased/off-market reference)
- SHA256 fingerprinting based on physical address, building name, layout, and area
- Price adjustment history and observation timestamps (first_seen, last_verified, status_changed_at)
- Atomic JSON persistence and statistics reporting
"""
import datetime
import hashlib
import json
import os
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any

FORK_DIR = Path("/Volumes/T9/kanto-tikki/fork")
DATA_DIR = FORK_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

MASTER_FILE = DATA_DIR / "kanto_master_inventory.json"
DATASET_1000_FILE = FORK_DIR / "kanto_1000_dataset.json"


def iso_now() -> str:
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def compute_fingerprint(item: Dict[str, Any]) -> str:
    """Stable fingerprint identifying physical unit."""
    name_ja = ""
    if isinstance(item.get("name"), dict):
        name_ja = item["name"].get("ja") or item["name"].get("en") or ""
    elif isinstance(item.get("name"), str):
        name_ja = item["name"]

    clean_addr = re.sub(r'[\s　]+', '', str(item.get("address", "")))
    clean_name = re.sub(r'[\s　]+', '', name_ja)
    layout = str(item.get("layout", "1K")).strip().upper()
    try:
        m2 = f"{float(item.get('m2', 20.0)):.1f}"
    except (ValueError, TypeError):
        m2 = "20.0"
    
    fp_raw = f"{clean_addr}|{clean_name}|{layout}|{m2}"
    return hashlib.sha256(fp_raw.encode("utf-8")).hexdigest()[:16]


class MasterInventory:
    def __init__(self, db_path: Optional[Path] = None):
        self.db_path = db_path or MASTER_FILE
        self.items: Dict[str, Dict[str, Any]] = {}
        self.fingerprints: Dict[str, str] = {} # fingerprint -> id
        self.load()

    def load(self):
        """Load from master JSON, or bootstrap from existing kanto_1000_dataset.json."""
        if self.db_path.exists():
            try:
                with open(self.db_path, "r", encoding="utf-8") as f:
                    raw_items = json.load(f)
                if isinstance(raw_items, list):
                    self.items = {item["id"]: item for item in raw_items if "id" in item}
                elif isinstance(raw_items, dict):
                    self.items = raw_items
                print(f"Loaded master database from {self.db_path}: {len(self.items)} listings.")
            except Exception as e:
                print(f"Error reading master DB {self.db_path}: {e}. Initializing fresh.")
                self.items = {}
        elif DATASET_1000_FILE.exists():
            print(f"Bootstrapping master database from existing {DATASET_1000_FILE}...")
            with open(DATASET_1000_FILE, "r", encoding="utf-8") as f:
                initial_list = json.load(f)
            now = iso_now()
            for h in initial_list:
                fp = compute_fingerprint(h)
                h.setdefault("fingerprint", fp)
                h.setdefault("status", "LIVE")
                h.setdefault("tier", "LIVE")
                h.setdefault("first_seen", now)
                h.setdefault("last_verified", now)
                h.setdefault("status_changed_at", now)
                h.setdefault("price_history", [{
                    "date": now,
                    "rent": h.get("rent", 100000),
                    "mgmt": h.get("mgmt", 5000)
                }])
                self.items[h["id"]] = h
            self.save()
            print(f"Bootstrapped {len(self.items)} listings into master database.")

        self._reindex_fingerprints()

    def _reindex_fingerprints(self):
        self.fingerprints = {}
        for item_id, item in self.items.items():
            fp = item.get("fingerprint") or compute_fingerprint(item)
            item["fingerprint"] = fp
            self.fingerprints[fp] = item_id

    def save(self):
        """Save atomically to disk."""
        tmp_path = self.db_path.with_suffix(".tmp")
        items_list = list(self.items.values())
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(items_list, f, ensure_ascii=False, indent=2)
        tmp_path.replace(self.db_path)
        print(f"Saved {len(items_list)} listings to {self.db_path}")

    def upsert_batch(self, new_items: List[Dict[str, Any]], mark_missing_filled_in_stations: bool = False) -> Dict[str, int]:
        """Ingest or update a batch of listings with lifecycle state transitions."""
        now = iso_now()
        stats = {"added": 0, "verified": 0, "reactivated": 0, "price_adjusted": 0, "filled": 0}
        scanned_stations = set()
        seen_ids_in_batch = set()

        for raw_item in new_items:
            fp = raw_item.get("fingerprint") or compute_fingerprint(raw_item)
            raw_item["fingerprint"] = fp
            st_id = raw_item.get("st")
            if st_id:
                scanned_stations.add(st_id)

            # Check if existing item matches fingerprint
            existing_id = self.fingerprints.get(fp) or (raw_item.get("id") if raw_item.get("id") in self.items else None)

            if existing_id and existing_id in self.items:
                target = self.items[existing_id]
                seen_ids_in_batch.add(existing_id)
                target["last_verified"] = now

                # State transition: was FILLED, now reappeared -> reactivate to LIVE
                if target.get("status") == "FILLED":
                    target["status"] = "LIVE"
                    target["tier"] = "LIVE"
                    target["status_changed_at"] = now
                    stats["reactivated"] += 1
                else:
                    stats["verified"] += 1

                # Price adjustment check
                old_rent = target.get("rent")
                new_rent = raw_item.get("rent")
                if new_rent and old_rent and new_rent != old_rent:
                    target.setdefault("price_history", []).append({
                        "date": now,
                        "rent": new_rent,
                        "mgmt": raw_item.get("mgmt", target.get("mgmt", 0))
                    })
                    target["rent"] = new_rent
                    if "mgmt" in raw_item: target["mgmt"] = raw_item["mgmt"]
                    stats["price_adjusted"] += 1

                # Update live URL if fresher
                if raw_item.get("url"):
                    target["url"] = raw_item["url"]
                if raw_item.get("mapUrl"):
                    target["mapUrl"] = raw_item["mapUrl"]
            else:
                # Brand new listing
                item_id = raw_item.get("id")
                if not item_id or item_id in self.items:
                    # Allocate sequential id
                    prefix = raw_item.get("corridor_prefix", "un")
                    item_id = self._generate_new_id(prefix)
                raw_item["id"] = item_id
                raw_item["status"] = "LIVE"
                raw_item["tier"] = "LIVE"
                raw_item["first_seen"] = now
                raw_item["last_verified"] = now
                raw_item["status_changed_at"] = now
                raw_item.setdefault("price_history", [{
                    "date": now,
                    "rent": raw_item.get("rent", 100000),
                    "mgmt": raw_item.get("mgmt", 5000)
                }])
                self.items[item_id] = raw_item
                self.fingerprints[fp] = item_id
                seen_ids_in_batch.add(item_id)
                stats["added"] += 1

        # If requested, mark missing listings as FILLED for stations scanned in this batch
        if mark_missing_filled_in_stations and scanned_stations:
            for item_id, item in self.items.items():
                if item.get("st") in scanned_stations and item.get("status") == "LIVE":
                    if item_id not in seen_ids_in_batch and item.get("id") != "ty_hiyoshi_annex":
                        item["status"] = "FILLED"
                        item["tier"] = "REP" # Displayed as reference benchmark
                        item["status_changed_at"] = now
                        stats["filled"] += 1

        self.save()
        return stats

    def _generate_new_id(self, prefix: str) -> str:
        max_num = 0
        for k in self.items.keys():
            if k.startswith(prefix):
                m = re.search(r'\d+', k[len(prefix):])
                if m:
                    max_num = max(max_num, int(m.group()))
        return f"{prefix}{max_num + 1:04d}"

    def mark_url_status(self, item_id: str, is_active: bool):
        """Directly toggle listing status based on URL probe."""
        if item_id in self.items:
            now = iso_now()
            item = self.items[item_id]
            new_status = "LIVE" if is_active else "FILLED"
            if item.get("status") != new_status:
                item["status"] = new_status
                item["tier"] = "LIVE" if is_active else "REP"
                item["status_changed_at"] = now
            item["last_verified"] = now

    def get_stats(self) -> Dict[str, Any]:
        total = len(self.items)
        live_count = sum(1 for x in self.items.values() if x.get("status") == "LIVE")
        filled_count = sum(1 for x in self.items.values() if x.get("status") == "FILLED")
        by_corr = {}
        for x in self.items.values():
            c = x.get("corridor", "other")
            stt = x.get("status", "LIVE")
            by_corr.setdefault(c, {"total": 0, "live": 0, "filled": 0})
            by_corr[c]["total"] += 1
            if stt == "LIVE":
                by_corr[c]["live"] += 1
            else:
                by_corr[c]["filled"] += 1

        return {
            "total_listings": total,
            "live_active": live_count,
            "filled_reference": filled_count,
            "by_corridor": by_corr
        }


if __name__ == "__main__":
    inv = MasterInventory()
    stats = inv.get_stats()
    print(json.dumps(stats, ensure_ascii=False, indent=2))
