#!/usr/bin/env python3
"""export_runtime.py — Compiles master inventory database into runtime frontend assets."""
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Any

FORK_DIR = Path("/Volumes/T9/kanto-tikki/fork")
DATA_DIR = FORK_DIR / "data"
MASTER_FILE = DATA_DIR / "kanto_master_inventory.json"
DATASET_FILE = FORK_DIR / "kanto_1000_dataset.json"


def export_runtime_assets(items: List[Dict[str, Any]]):
    print(f"=== Compiling Runtime Assets for {len(items)} Listings ===")

    # 1. Save dataset JSON
    with open(DATASET_FILE, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(items)} items to {DATASET_FILE}")

    # Group by corridor
    by_corr = {}
    for it in items:
        c = it.get("corridor", "toyoko")
        by_corr.setdefault(c, []).append(it)

    # 2. Update kanto_corridors_data.js cleanly using Node.js helper
    export_corridors_script = DATA_DIR / "_export_corridors_helper.js"
    with open(export_corridors_script, "w", encoding="utf-8") as f:
        f.write("""const fs = require('fs');
const vm = require('vm');

const datasetPath = '/Volumes/T9/kanto-tikki/fork/kanto_1000_dataset.json';
const corridorsDataPath = '/Volumes/T9/kanto-tikki/fork/kanto_corridors_data.js';

const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
const by_corr = {};
dataset.forEach(h => {
  const c = h.corridor || 'toyoko';
  by_corr[c] = by_corr[c] || [];
  by_corr[c].push(h);
});

const ctx = vm.createContext({ console, window: {} });
const code = fs.readFileSync(corridorsDataPath, 'utf8');
const data = vm.runInContext(code + '\\n;(() => CORRIDORS_DATA)()', ctx);

for (const [c_id, homes] of Object.entries(by_corr)) {
  if (data[c_id]) {
    data[c_id].homes = homes;
  }
}

const header = `/* HomeTikki · KANTO — Multi-Corridor Data Architecture (Continuous Ingestion Pipeline)
   Corridors:
     1. keikyu:      Keikyu Main & Toei Asakusa Through-Run (Ningyōchō → Yokohama → Yokosuka)
     2. toyoko:      Tōkyū Tōyoko Line & JR Yokosuka Commuter (Shibuya → Hiyoshi → Yokohama → Yokosuka)
     3. hibiya:      Tokyo Metro Hibiya Line (Naka-Meguro → Kita-Senju)
     4. denentoshi:  Tōkyū Den-en-toshi Line (Shibuya → Chūō-Rinkan)
     5. odakyu:      Odakyū Odawara Line (Shinjuku → Machida)
*/\\n\\n`;

fs.writeFileSync(corridorsDataPath, header + 'const CORRIDORS_DATA = ' + JSON.stringify(data, null, 2) + ';\\n', 'utf8');
console.log('Successfully updated kanto_corridors_data.js with ' + dataset.length + ' listings across all corridors!');
for (const [c_id, homes] of Object.entries(by_corr)) {
  console.log('  ' + c_id + ': ' + homes.length + ' listings');
}
""")

    subprocess.run(["node", str(export_corridors_script)], check=True)
    if export_corridors_script.exists():
        export_corridors_script.unlink()

    # 3. Update individual corridor live files
    corr_live_map = {
        "keikyu": FORK_DIR / "kanto_live.js",
        "toyoko": FORK_DIR / "toyoko_live.js",
        "hibiya": FORK_DIR / "hibiya_live.js",
        "denentoshi": FORK_DIR / "denentoshi_live.js",
        "odakyu": FORK_DIR / "odakyu_live.js",
    }

    for c_id, live_path in corr_live_map.items():
        if not live_path.exists():
            continue
        c_homes = by_corr.get(c_id, [])
        with open(live_path, "r", encoding="utf-8") as f:
            live_txt = f.read()
        live_replace = "const LIVE = " + json.dumps(c_homes, ensure_ascii=False, indent=2) + ";"
        if "const LIVE = [" in live_txt:
            live_txt = re.sub(r"const LIVE\s*=\s*\[.*?\];", live_replace, live_txt, flags=re.DOTALL)
        else:
            live_txt = live_replace + "\n" + live_txt
        with open(live_path, "w", encoding="utf-8") as f:
            f.write(live_txt)
        print(f"Updated {live_path.name} with {len(c_homes)} listings.")

    # 4. Save stats
    live_count = sum(1 for x in items if x.get("status") == "LIVE")
    filled_count = sum(1 for x in items if x.get("status") == "FILLED")
    stats = {
        "total": len(items),
        "live": live_count,
        "filled": filled_count,
        "by_corridor": {c: len(l) for c, l in by_corr.items()}
    }
    with open(DATA_DIR / "kanto_stats.json", "w", encoding="utf-8") as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    print(f"Stats saved: {json.dumps(stats, ensure_ascii=False)}")


if __name__ == "__main__":
    from pipeline.inventory_manager import MasterInventory
    inv = MasterInventory()
    export_runtime_assets(list(inv.items.values()))
