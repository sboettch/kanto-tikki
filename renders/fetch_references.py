#!/usr/bin/env python3
"""Fetch reference images for the building-reconstruction packets — RUN THIS
WHERE THE RIGHTS POSTURE ALLOWS (Sophia's machine / the Codex env), not in a
restricted sandbox. Mirrors the bayarearealestate rules:

  · references land in renders/references/{listing_id}/ as LOCAL, research-only
    model inputs (REFERENCE_ONLY_NO_REUSE_RIGHTS_ASSERTED)
  · they are never displayed, hotlinked, exported, or published by the app
  · each download is hashed into the packet so the render manifest can carry
    the same evidence chain as assets/generated/*.json in the main repo

Usage:  python3 fetch_references.py            # fetch all discovered inputs
        python3 fetch_references.py lv01 lv12  # just these listings
"""
import hashlib, json, os, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
PACKETS = os.path.join(HERE, "PACKETS.json")

def fetch(url, dst):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (reference fetch; local research use)"})
    with urllib.request.urlopen(req, timeout=30) as r, open(dst, "wb") as f:
        f.write(r.read())

def main(only):
    data = json.load(open(PACKETS))
    for p in data["packets"]:
        lid = p.get("listing_id")
        if not lid or (only and lid not in only): continue
        outdir = os.path.join(HERE, "references", lid)
        os.makedirs(outdir, exist_ok=True)
        for i, inp in enumerate(p.get("image_inputs_discovered", [])):
            url = inp.get("url")
            if not url: continue
            dst = os.path.join(outdir, f"ref_{i}.jpg")
            try:
                fetch(url, dst)
                h = hashlib.sha256(open(dst, "rb").read()).hexdigest()
                inp["local_path"] = os.path.relpath(dst, HERE)
                inp["sha256"] = h
                print(f"  ✓ {lid} ref_{i} ({h[:12]}…) — LOCAL RESEARCH ONLY, not for display")
            except Exception as e:
                print(f"  ✗ {lid} ref_{i}: {e}")
        p["status"] = "REFERENCES_FETCHED_LOCAL — generate + manual review pending"
    json.dump(data, open(PACKETS, "w"), ensure_ascii=False, indent=1)
    print("packet hashes updated — next: render_building.py, then grade the outputs by side-by-side review")

if __name__ == "__main__":
    main(set(sys.argv[1:]))
