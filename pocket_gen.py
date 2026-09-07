#!/usr/bin/env python3
"""HomeTikki KANTO — pocket-essence generator (pocket_gen.py).

Creates dedicated washi/sumi paper illustrations for all 17 local pockets
(12 on-corridor + 5 off-corridor gems), closing the visual gap where off-corridor
pockets had blank image strips and on-corridor pockets shared parent station images.

Outputs:
  essence/pk_{id}.webp       — static illustrated essence (1024×384)
  essence/pk_{id}.json       — metadata manifest
  Updates kanto_essence_meta.js to register all pk_* entries in ESSENCE.
"""
import hashlib, json, math, os, random
from PIL import Image, ImageDraw, ImageFilter
from essence_gen import (
    W, H, PAL, OUT, wash_sky, stars, ground, lamps, people, paper_grain,
    grain_vignette, sumi_hatch, ink_edge, torii, temple,
    arcade, viaduct, ferris, towers,
    terminal, canal, levee, far_skyline, lerp, WARM, SHU, COOL
)

def machiya_lane(d, rng, x0=0.05, x1=0.95):
    """Traditional low-rise machiya street front with warm window lattice."""
    base = int(H * 0.86)
    x0i = int(W * x0); x1i = int(W * x1)
    for x in range(x0i, x1i - 30, 52):
        w = rng.randint(40, 50)
        h = rng.randint(65, 95)
        d.rectangle([x, base - h, x + w, base], fill=(26, 22, 34))
        sumi_hatch(d, x, base - h, x + w, base, rng, angle=0, spacing=14, alpha_base=18)
        d.polygon([(x - 6, base - h + 12), (x, base - h), (x + w, base - h), (x + w + 6, base - h + 12)], fill=(38, 32, 48))
        d.rectangle([x + 6, base - h + 24, x + w - 6, base - 8], fill=WARM + (150,))
        for lx in range(x + 12, x + w - 6, 8):
            d.line([(lx, base - h + 24), (lx, base - 8)], fill=(20, 16, 28, 120), width=1)
        for ly in range(base - h + 30, base - 8, 8):
            d.line([(x + 6, ly), (x + w - 6, ly)], fill=(20, 16, 28, 120), width=1)

def hanging_lanterns(d, rng, x0=0.1, x1=0.9, y=0.62, n=12):
    """String of glowing paper lanterns."""
    yi = int(H * y)
    step = int(W * (x1 - x0) / max(1, n))
    for i in range(n):
        lx = int(W * x0) + i * step + rng.randint(-4, 4)
        ly = yi + rng.randint(-3, 3)
        d.ellipse([lx - 8, ly, lx + 8, ly + 20], fill=(235, 90, 60, 220))
        d.ellipse([lx - 5, ly + 2, lx + 5, ly + 18], fill=(255, 210, 140, 200))
        d.ellipse([lx - 8, ly, lx + 8, ly + 20], outline=(35, 15, 15, 180), width=1)
        d.line([(lx - 5, ly), (lx + 5, ly)], fill=(30, 10, 10, 160), width=2)
        d.line([(lx - 4, ly + 20), (lx + 4, ly + 20)], fill=(30, 10, 10, 140), width=2)

def suspension_bridge(d, rng, x0=0.15, x1=0.85):
    """Suspension bridge silhouette (Kiyosu-bashi style)."""
    base = int(H * 0.86)
    x0i = int(W * x0); x1i = int(W * x1)
    d.line([(x0i, base - 16), (x1i, base - 16)], fill=(28, 32, 48), width=5)
    t1x = x0i + int((x1i - x0i) * 0.3); t2x = x0i + int((x1i - x0i) * 0.7)
    th = 90
    for tx in (t1x, t2x):
        d.line([(tx - 6, base), (tx - 4, base - th)], fill=(22, 26, 42), width=3)
        d.line([(tx + 6, base), (tx + 4, base - th)], fill=(22, 26, 42), width=3)
        d.line([(tx - 8, base - th), (tx + 8, base - th)], fill=(22, 26, 42), width=4)
        d.line([(tx - 8, base - th // 2), (tx + 8, base - th // 2)], fill=(22, 26, 42), width=2)
    # Suspension cable curve
    for x in range(x0i, x1i, 8):
        rel = (x - x0i) / (x1i - x0i)
        cy = base - th + int(th * 0.75 * math.sin(rel * math.pi))
        d.line([(x, cy), (x + 8, cy)], fill=(34, 38, 54), width=2)
        if x % 24 == 0:
            d.line([(x, cy), (x, base - 16)], fill=(34, 38, 54, 180), width=1)

def pagoda_5f(d, x=0.45, base_y=0.86, scale=1.0):
    """Five-story pagoda silhouette."""
    cx = int(W * x); by = int(H * base_y)
    for f in range(5):
        w = int((64 - f * 8) * scale)
        h = int(14 * scale)
        fy = by - int((f * 20 + 10) * scale)
        d.polygon([(cx - w // 2 - 8, fy + 4), (cx, fy - 6), (cx + w // 2 + 8, fy + 4)], fill=(22, 18, 30))
        d.rectangle([cx - w // 4, fy + 4, cx + w // 4, fy + 18], fill=(18, 14, 24))
    # Spire (sorin)
    top_y = by - int(115 * scale)
    d.line([(cx, by - int(105 * scale)), (cx, top_y)], fill=(22, 18, 30), width=2)

POCKETS = [
    ("pk_amazake", "shitamachi", "Amazake Yokochō",
     "sweet-sake counter · doll-maker woodcraft · lantern-lit cedar lanes",
     lambda d, rng: (
         far_skyline(d, rng, PAL["shitamachi"], 0.25, 8),
         machiya_lane(d, rng, 0.05, 0.95),
         hanging_lanterns(d, rng, 0.08, 0.92, 0.60, 14),
     )),

    ("pk_hamacho", "river", "Hamachō riverside",
     "Sumida river terrace · Kiyosu suspension bridge silhouette · morning water glow",
     lambda d, rng: (
         far_skyline(d, rng, PAL["river"], 0.40, 9),
         suspension_bridge(d, rng, 0.10, 0.88),
         canal(d, rng, 0.68, 3),
     )),

    ("pk_ginzaeast", "core", "Ginza East · Shintomi",
     "Kabukiza theater roofline · Ginza neon spill · quiet artisan printing quarter",
     lambda d, rng: (
         towers(d, rng, 0.60, 5, 0.70),
         temple(d, 0.28, 0.85, False),
         arcade(d, rng, 0.05, 0.55, False),
     )),

    ("pk_shimbamba", "shitamachi", "Shimbamba shukuba lanes",
     "Shinagawa shrine forested slope · fuji-zuka stone mound · old post-town grid",
     lambda d, rng: (
         far_skyline(d, rng, PAL["shitamachi"], 0.28, 6),
         temple(d, 0.42, 0.8, True),
         torii(d, 0.18, 0.9),
         machiya_lane(d, rng, 0.55, 0.95),
     )),

    ("pk_tennozu", "bay", "Tennōzu canalside",
     "harbor loft warehouses · wooden canal boardwalk · craft brewery twilight",
     lambda d, rng: (
         towers(d, rng, 0.06, 4, 0.55),
         towers(d, rng, 0.65, 5, 0.60),
         canal(d, rng, 0.62, 3),
     )),

    ("pk_tachiai", "river", "Tachiaigawa boat basin",
     "working fishing skiffs · tidal creek mooring · Sakamoto Ryōma bronze statue",
     lambda d, rng: (
         far_skyline(d, rng, PAL["river"], 0.30, 6),
         canal(d, rng, 0.64, 4),
         # Statue silhouette
         d.polygon([(int(W * 0.16), int(H * 0.86)), (int(W * 0.18), int(H * 0.68)), (int(W * 0.20), int(H * 0.86))], fill=(18, 16, 26)),
     )),

    ("pk_umeyashiki", "shitamachi", "Umeyashiki back grid",
     "plum-garden pace · sentō brick chimney · residential laundry-line dusk",
     lambda d, rng: (
         far_skyline(d, rng, PAL["shitamachi"], 0.28, 6),
         machiya_lane(d, rng, 0.05, 0.95),
         # Sentō brick chimney silhouette
         d.rectangle([int(W * 0.45), int(H * 0.30), int(W * 0.48), int(H * 0.86)], fill=(24, 18, 30)),
     )),

    ("pk_kamataeast", "shitamachi", "Kamata east maze",
     "gyōza pilgrimage grid · retro alley steam · 24h illuminated shōtengai",
     lambda d, rng: (
         arcade(d, rng, 0.05, 0.95, True),
         hanging_lanterns(d, rng, 0.06, 0.94, 0.55, 16),
     )),

    ("pk_rokugo", "river", "Rokugō levee terrace",
     "grassy Tama embankment · open tidal water · Keikyu river bridge span",
     lambda d, rng: (
         levee(d, rng),
         viaduct(d, rng, 0.60, True, SHU),
     )),

    ("pk_daishi", "shitamachi", "Daishi shōtengai",
     "Kawasaki Daishi five-story pagoda silhouette · prayer flags · tatsuame candy craft",
     lambda d, rng: (
         far_skyline(d, rng, PAL["shitamachi"], 0.26, 6),
         pagoda_5f(d, 0.25, 0.86, 0.9),
         temple(d, 0.65, 0.75, True),
         hanging_lanterns(d, rng, 0.40, 0.95, 0.65, 8),
     )),

    ("pk_nakadori", "bay", "Okinawa-town Nakadōri",
     "Ryukyu red-tiled eaves · palm canal silhouettes · sanshin bar lanterns",
     lambda d, rng: (
         far_skyline(d, rng, PAL["bay"], 0.28, 6),
         machiya_lane(d, rng, 0.06, 0.94),
         hanging_lanterns(d, rng, 0.10, 0.90, 0.58, 12),
     )),

    ("pk_koyasu", "bay", "Koyasu fishing canal",
     "weathered stilt shacks · wooden gangways over tidal water · moored skiffs",
     lambda d, rng: (
         canal(d, rng, 0.62, 5, True),
     )),

    # ── 5 OFF-CORRIDOR GEMS ───────────────────────────────────────────
    ("pk_kagurazaka", "core", "Kagurazaka",
     "sloping Edo stone steps · black cedar geisha walls · glowing paper lanterns",
     lambda d, rng: (
         far_skyline(d, rng, PAL["core"], 0.28, 7),
         machiya_lane(d, rng, 0.05, 0.95),
         hanging_lanterns(d, rng, 0.12, 0.88, 0.56, 14),
     )),

    ("pk_kyojima", "shitamachi", "Kyōjima · Kirakira Tachibana",
     "Kirakira Tachibana arcade · post-war wooden alleys · Tokyo Skytree glow above",
     lambda d, rng: (
         # Skytree slender needle silhouette
         d.line([(int(W * 0.76), int(H * 0.86)), (int(W * 0.76), int(H * 0.10))], fill=(20, 18, 30), width=5),
         d.line([(int(W * 0.76), int(H * 0.10)), (int(W * 0.76), int(H * 0.03))], fill=(24, 22, 34), width=2),
         arcade(d, rng, 0.05, 0.68, True),
     )),

    ("pk_koganecho", "bay", "Koganechō arts district",
     "railway viaduct studio arches · riverbank willow walk · Ōoka river reflections",
     lambda d, rng: (
         viaduct(d, rng, 0.58, False),
         canal(d, rng, 0.68, 2),
     )),

    ("pk_minatomirai", "bay", "Minato Mirai",
     "Cosmo Clock illuminated ferris wheel · Landmark Tower skyline · harbor boardwalk",
     lambda d, rng: (
         towers(d, rng, 0.08, 6, 0.72),
         ferris(d, 0.76, 76),
         canal(d, rng, 0.70, 2),
     )),

    ("pk_noge", "bay", "Noge",
     "retro drink alleys under the cliff · neon jazz signs · red paper lanterns",
     lambda d, rng: (
         arcade(d, rng, 0.06, 0.94, True),
         hanging_lanterns(d, rng, 0.08, 0.92, 0.54, 16),
     )),
]

def build_pocket(pk_id, palname, name, matched, painter, seed=42):
    rng = random.Random(hash(pk_id) & 0xFFFF | seed)
    pal = PAL[palname]
    im = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(im, "RGBA")
    wash_sky(im, d, pal, rng)
    stars(d, rng)
    painter(d, rng)
    ground(im, d, pal)
    lamps(d, rng)
    people(d, rng, rng.randint(4, 8))
    paper_grain(im, rng)
    im = grain_vignette(im, rng)

    png_path = os.path.join(OUT, f"{pk_id}.png")
    webp_path = os.path.join(OUT, f"{pk_id}.webp")
    im.save(png_path, "PNG")
    im.save(webp_path, "WEBP", quality=82)

    sha = hashlib.sha256(open(webp_path, "rb").read()).hexdigest()
    m = {
        "asset_id": f"kanto-{pk_id}-pocket-essence-v1",
        "area_key": pk_id,
        "state": "SYNTHETIC",
        "display_label": f"Pocket essence — {name}. Synthetic editorial illustration, not a photograph.",
        "card_label": "SYNTHETIC · pocket essence 地域図",
        "detail_label": f"SYNTHETIC · pocket essence — editorial illustration of {name} typology · not a photograph",
        "generated_at": "2026-09-02",
        "generator": "washi/sumi paper procedural scene (pocket_gen.py)",
        "method": "procedural composition from documented pocket facts",
        "output": {"local_path": f"kanto/essence/{pk_id}.webp", "format": "WEBP", "width_px": W, "height_px": H, "sha256": sha},
        "visual_proximity": {
            "status": "AREA_TYPOLOGY_EDITORIAL", "grade": "NOT SCORED",
            "matched_attributes": [s.strip() for s in matched.split("·")],
            "not_asserted": ["specific storefronts", "current weather", "exact geometry"],
        },
    }
    with open(os.path.join(OUT, f"{pk_id}.json"), "w") as f:
        json.dump(m, f, ensure_ascii=False, indent=1)
    return m

def main():
    print(f"Building dedicated essence illustrations for {len(POCKETS)} pockets...")
    new_meta = {}
    for pk_id, palname, name, matched, painter in POCKETS:
        m = build_pocket(pk_id, palname, name, matched, painter)
        new_meta[pk_id] = {
            "card": m["card_label"],
            "detail": m["detail_label"],
            "matched": m["visual_proximity"]["matched_attributes"],
            "grade": "NOT SCORED",
            "status": "AREA_TYPOLOGY_EDITORIAL",
            "method": "procedural composition from documented pocket facts",
            "gen": "2026-09-02",
            "anim": False,
        }
        print(f"  ✓ {pk_id}: {name}")

    meta_path = os.path.join(os.path.dirname(OUT), "kanto_essence_meta.js")
    existing = {}
    if os.path.exists(meta_path):
        txt = open(meta_path, "r", encoding="utf-8").read()
        import re
        m = re.search(r"const\s+ESSENCE\s*=\s*(\{[\s\S]*?\});", txt)
        if m:
            existing = json.loads(m.group(1))

    existing.update(new_meta)
    js = "/* generated from essence/*.json manifests — do not hand-edit */\nconst ESSENCE = " + json.dumps(existing, ensure_ascii=False) + ";\n"
    with open(meta_path, "w", encoding="utf-8") as f:
        f.write(js)
    print(f"Registered {len(existing)} essences (stations + pockets) in kanto_essence_meta.js.")

if __name__ == "__main__":
    main()
