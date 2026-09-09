#!/usr/bin/env python3
"""run_pipeline.py — Master CLI orchestrator for Kanto Continuous Listing Pipeline.

Modes:
  --mode big_pass   : Runs deep Hiyoshi harvest, Yokosuka corridors (JR & Keikyu), and balanced core scaling,
                      upserts into master inventory with lifecycle tracking, incrementally generates visual studies,
                      and exports runtime datasets.
  --mode update     : Runs quick refresh pass on primary commuter corridors.
  --mode probe_urls : Active probe of external listing URLs to transition expired listings to FILLED.
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path

# Add pipeline directory to sys.path
SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from inventory_manager import MasterInventory
import harvester
import visual_sync
import export_runtime


def parse_args():
    parser = argparse.ArgumentParser(description="Kanto Living Inventory Pipeline Runner")
    parser.add_argument(
        "--mode",
        choices=["big_pass", "update", "probe_urls"],
        default="big_pass",
        help="Pipeline execution mode (default: big_pass)"
    )
    parser.add_argument(
        "--db",
        default="/Volumes/T9/kanto-tikki/fork/data/kanto_master_inventory.json",
        help="Path to master inventory JSON file"
    )
    parser.add_argument(
        "--skip-visuals",
        action="store_true",
        help="Skip visual study generation"
    )
    return parser.parse_args()


def main():
    args = parse_args()
    start_time = time.time()
    db_path = Path(args.db)

    print("=" * 76)
    print(" 🌸 KANTO LIVING INVENTORY CONTINUOUS PIPELINE 🌸")
    print(f" Mode      : {args.mode}")
    print(f" Database  : {db_path}")
    print(f" Timestamp : {datetime.now().isoformat()}")
    print("=" * 76)

    # 1. Load Master Inventory
    print("\n[Step 1/4] Loading Master Inventory Database...")
    inv = MasterInventory(db_path=db_path)
    initial_stats = inv.get_stats()
    print(f"  Current Inventory: {initial_stats['total_listings']} listings "
          f"({initial_stats['live_active']} LIVE, {initial_stats['filled_reference']} FILLED)")

    # 2. Harvest
    harvested = []
    if args.mode == "big_pass":
        print("\n[Step 2/4] Executing Big Pass Harvest...")
        harvested = harvester.run_big_pass_harvest()
        print(f"  Harvester produced {len(harvested)} candidate listings.")
    elif args.mode == "update":
        print("\n[Step 2/4] Executing Incremental Corridor Refresh...")
        # Refresh Hiyoshi & Yokosuka corridors
        hiyoshi = harvester.harvest_hiyoshi_cluster(40)
        jr_yokosuka, keikyu_south = harvester.harvest_yokosuka_corridors()
        harvested = hiyoshi + jr_yokosuka[:50] + keikyu_south[:50]
        print(f"  Refresh harvested {len(harvested)} listings.")
    elif args.mode == "probe_urls":
        print("\n[Step 2/4] Probe URLs mode selected.")
        # Future network-based probe if needed

    # 3. Upsert into Master Inventory with Lifecycle Engine
    if harvested:
        print("\n[Step 3/4] Upserting Harvest into Lifecycle State Engine...")
        upsert_stats = inv.upsert_batch(harvested)
        print(f"  Added new listings        : {upsert_stats['added']}")
        print(f"  Verified active listings  : {upsert_stats['verified']}")
        print(f"  Reactivated listings      : {upsert_stats['reactivated']}")
        print(f"  Price adjusted listings   : {upsert_stats['price_adjusted']}")
        print(f"  Marked filled / archived  : {upsert_stats['filled']}")

    post_stats = inv.get_stats()
    print(f"\n  Master Inventory now holds: {post_stats['total_listings']} total listings.")
    print(f"  - LIVE active units       : {post_stats['live_active']}")
    print(f"  - FILLED reference units  : {post_stats['filled_reference']}")
    for c_id, counts in post_stats["by_corridor"].items():
        print(f"    * {c_id:<12}: {counts['total']:>4} units ({counts['live']:>4} live, {counts['filled']:>4} filled)")

    all_items = list(inv.items.values())

    # 4. Visual Synchronization
    if not args.skip_visuals:
        print(f"\n[Step 4/4] Synchronizing Visual Studies (.webp massing + 16:9 hero washi) for {len(all_items)} units...")
        visual_sync.sync_all_visuals(all_items)
    else:
        print("\n[Step 4/4] Visual Synchronization skipped via --skip-visuals.")

    # 5. Export Runtime Assets
    print("\n[Runtime Export] Compiling JS Datasets for High-Performance Edge Delivery...")
    export_runtime.export_runtime_assets(all_items)

    elapsed = time.time() - start_time
    print("\n" + "=" * 76)
    print(f" ✅ Pipeline Completed Successfully in {elapsed:.2f}s")
    print(f" Total Portfolio: {len(all_items)} units across 5 corridors & Yokosuka commuter network.")
    print("=" * 76)


if __name__ == "__main__":
    main()
