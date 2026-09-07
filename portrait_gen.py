#!/usr/bin/env python3
"""HomeTikki KANTO — building massing portraits + illustrated hero images (Round 9).

Two tiers:
  portrait()      — existing massing elevation (storey-count / structure faithful).
                    Kept as is; referenced in BUILDING_VISUALS for the thumbnail slot.
  hero_portrait() — NEW: washi/sumi illustrated listing hero (1024×576, 16:9).
                    Painted sky wash, ink-outlined building, paper grain, warm
                    street-level scene. Labeled SYNTHETIC at every surface.
                    Sits between the madori glyph and a full reference reconstruction.
"""
import hashlib, json, math, os, random
from PIL import Image, ImageDraw, ImageFilter

# ---- shared dimensions ----
PW, PH = 1024, 420   # portrait (unchanged)
HW, HH = 1024, 576   # hero (16:9 cinematic)

OUT  = os.path.join(os.path.dirname(os.path.abspath(__file__)), "portraits")
os.makedirs(OUT, exist_ok=True)

# id → listed facts (source: listing pages, fetched 2026-09-02)
FACTS = {
 "lv01": dict(name="BAUS FLATS Nihonbashi-hamacho", floors=10, structure="RC", built="2022-03",
              lay="1LDK", facade="grey-tile",
              facade_src="stated by agency: 'grey toned tiled stylish exterior'",
              area="Nihombashihamacho, Chūō-ku", palette="core"),
 "lv12": dict(name="JMF Residence Kitashinagawa", floors=13, structure="RC", built="2018-04",
              lay="1K", facade="rc", area="Kitashinagawa, Shinagawa-ku", palette="shitamachi"),
 "lv13": dict(name="Belc", floors=3, structure=None, built="2019",
              lay="1LDK", facade="neutral", area="Shinagawa-ku", palette="shitamachi"),
 "lv14": dict(name="ST Residence Minami-shinagawa", floors=6, structure=None, built="2014",
              lay="1LDK", facade="neutral", area="Minami-shinagawa, Shinagawa-ku", palette="shitamachi"),
 "lv15": dict(name="Azalea Kashima", floors=3, structure=None, built="2024",
              lay="2LDK", facade="neutral", area="Ōta-ku", palette="shitamachi"),
 "lv16": dict(name="Rising place Kamata-minami", floors=7, structure="RC", built="2013-02",
              lay="1K", facade="rc", area="Nakarokugō, Ōta-ku", palette="shitamachi"),
 "lv27": dict(name="La Pralle Tsurumi", floors=3, structure="steel", built="2025-12",
              lay="2LDK", facade="steel", area="Ushiodachō, Tsurumi-ku", palette="bay"),
 "lv28": dict(name="Rowateru", floors=3, structure=None, built="2026 (new)",
              lay="2LDK", facade="neutral", area="Yokohama", palette="bay"),
 "lv29": dict(name="Le Lien", floors=4, structure=None, built="2024",
              lay="1LDK", facade="neutral", area="Yokohama", palette="bay"),
 "lv30": dict(name="Koyasu 6-min 1R", floors=3, structure="wood", built="2026-02",
              lay="1R", facade="wood", area="Koyasu, Kanagawa-ku", palette="bay"),
}

# ---------- palette families ----------
PALETTES = {
    "grey-tile": dict(wall=(122, 126, 134), trim=(94, 98, 108), win=(44, 56, 80), lit=(255, 214, 140)),
    "rc":        dict(wall=(162, 160, 152), trim=(134, 132, 124), win=(48, 60, 84), lit=(255, 214, 140)),
    "steel":     dict(wall=(172, 178, 186), trim=(144, 152, 162), win=(46, 58, 82), lit=(255, 214, 140)),
    "wood":      dict(wall=(182, 146, 106), trim=(146, 112, 78), win=(50, 58, 78), lit=(255, 214, 140)),
    "neutral":   dict(wall=(168, 162, 152), trim=(140, 136, 126), win=(48, 58, 82), lit=(255, 214, 140)),
    "beige":     dict(wall=(192, 184, 168), trim=(156, 150, 138), win=(48, 58, 82), lit=(255, 214, 140)),
}

# Sky palettes keyed by area mood
SKY_PAL = {
    "core":       dict(sky0=(28, 32, 68), sky1=(108, 82, 118), sky2=(212, 132, 88),
                       ink=(18, 18, 30), mid=(100, 86, 118)),
    "shitamachi": dict(sky0=(42, 30, 62), sky1=(148, 74, 88), sky2=(236, 148, 72),
                       ink=(22, 18, 32), mid=(134, 96, 114)),
    "bay":        dict(sky0=(30, 42, 80), sky1=(88, 104, 148), sky2=(198, 148, 116),
                       ink=(16, 20, 34), mid=(92, 106, 140)),
}

WARM = (255, 210, 130)

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


# ======================================================================
# EXISTING PORTRAIT (unchanged logic, kept for thumbnail slot)
# ======================================================================

def portrait(pid, f):
    pal = PALETTES.get(f.get("facade"), PALETTES["neutral"])
    im = Image.new("RGB", (PW, PH)); d = ImageDraw.Draw(im, "RGBA")
    for y in range(PH):
        t = y / PH
        d.line([(0, y), (PW, y)], fill=(int(198 - 40 * t), int(200 - 52 * t), int(214 - 46 * t)))
    ground_y = int(PH * .88)
    d.rectangle([0, ground_y, PW, PH], fill=(52, 54, 64))
    d.rectangle([0, int(PH*.55), 150, ground_y], fill=(120, 122, 134))
    d.rectangle([PW-170, int(PH*.62), PW, ground_y], fill=(126, 126, 138))

    floors = f["floors"]
    fam = f["lay"] in ("1LDK", "2LDK", "3LDK", "1SLDK")
    fh = min(52 if floors <= 4 else 34, int((ground_y - 40) / floors))
    bw = 300 if floors >= 10 else 360 if floors >= 6 else 430
    bh = fh * floors
    x0 = (PW - bw)//2; y0 = ground_y - bh
    d.rectangle([x0, y0, x0+bw, ground_y], fill=pal["wall"])
    d.rectangle([x0, y0-8, x0+bw, y0], fill=pal["trim"])
    if f["facade"] == "grey-tile":
        for gx in range(x0, x0+bw, 14): d.line([(gx, y0), (gx, ground_y)], fill=pal["trim"]+(70,), width=1)
    if f["facade"] == "wood":
        for gy in range(y0, ground_y, 9): d.line([(x0, gy), (x0+bw, gy)], fill=pal["trim"]+(90,), width=1)
    if f["facade"] == "steel":
        for gx in range(x0, x0+bw, 46): d.line([(gx, y0), (gx, ground_y)], fill=pal["trim"]+(110,), width=2)

    bays = 3 if fam else 4 if bw < 340 else 5
    bwid = bw // (bays + 1)
    for fl in range(floors):
        wy = ground_y - (fl+1)*fh + 6
        for b in range(bays):
            wx = x0 + int((b + .6) * bw / bays)
            lit = ((fl*7 + b*13 + hash(pid)) % 10) < 4 and fl > 0
            d.rectangle([wx, wy, wx + bwid, wy + fh - 12],
                        fill=(pal["lit"] if lit else pal["win"]))
            if fam and fl > 0:
                d.rectangle([wx-6, wy+fh-14, wx+bwid+6, wy+fh-10], fill=pal["trim"])
                for rx in range(wx-6, wx+bwid+6, 7):
                    d.line([(rx, wy+fh-10), (rx, wy+fh-2)], fill=pal["trim"], width=1)
    ex = x0 + bw//2 - 34
    d.rectangle([ex, ground_y-46, ex+68, ground_y], fill=pal["win"])
    d.rectangle([ex+6, ground_y-40, ex+62, ground_y], fill=(255, 236, 190, 130))
    d.rectangle([ex-12, ground_y-52, ex+80, ground_y-46], fill=pal["trim"])
    d.rectangle([x0-14, ground_y, x0+bw+14, ground_y+6], fill=(30, 32, 40))
    im = im.filter(ImageFilter.GaussianBlur(0.4))
    p = os.path.join(OUT, f"{pid}.webp")
    im.save(p, "WEBP", quality=84)
    return p


# ======================================================================
# NEW HERO PORTRAIT — washi/sumi illustrated hero (1024×576)
# ======================================================================

def _sumi_hatch(d, x0, y0, x1, y1, rng, spacing=10, alpha=22):
    """Sumi ink hatching inside a rectangle."""
    for xi in range(x0, x1, spacing):
        lx0 = xi; ly0 = y0; lx1 = xi + int((y1 - y0) * 0.12); ly1 = y1
        lx0c = max(lx0, x0); lx1c = min(lx1, x1)
        if lx0c >= lx1c: continue
        t0 = (lx0c - lx0) / max(1, lx1 - lx0)
        t1 = (lx1c - lx0) / max(1, lx1 - lx0)
        py0 = int(ly0 + (ly1 - ly0) * t0)
        py1 = int(ly0 + (ly1 - ly0) * t1)
        d.line([(lx0c, py0), (lx1c, py1)],
               fill=(16, 14, 22, alpha + rng.randint(-6, 6)), width=1)


def _wash_rect(im, x0, y0, x1, y1, color, alpha, blur=12):
    layer = Image.new("RGBA", (HW, HH), (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    ld.rectangle([x0, y0, x1, y1], fill=color + (alpha,))
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    im.paste(layer, (0, 0), layer)


def _hero_sky(im, d, pal, rng):
    """Multi-wash washi sky for hero."""
    for y in range(HH):
        t = y / HH
        if t < 0.38:
            c = lerp(pal["sky0"], pal["sky1"], t / 0.38)
        elif t < 0.65:
            c = lerp(pal["sky1"], pal["sky2"], (t - 0.38) / 0.27)
        else:
            c = lerp(pal["sky2"], lerp(pal["sky2"], (255, 240, 210), 0.35), (t - 0.65) / 0.35)
        d.line([(0, y), (HW, y)], fill=c)

    # Watercolour wash blobs
    wash = Image.new("RGBA", (HW, HH), (0, 0, 0, 0))
    wd = ImageDraw.Draw(wash)
    for _ in range(7):
        wx = rng.randint(-60, HW + 60)
        wy = rng.randint(int(HH * 0.35), int(HH * 0.70))
        rw = rng.randint(160, 440); rh = rng.randint(40, 120)
        col = pal["sky2"] + (rng.randint(20, 44),)
        wd.ellipse([wx - rw, wy - rh, wx + rw, wy + rh], fill=col)
    for _ in range(4):
        wx = rng.randint(-40, HW + 40)
        wy = rng.randint(0, int(HH * 0.28))
        rw = rng.randint(100, 300); rh = rng.randint(28, 80)
        col = lerp(pal["sky0"], (80, 60, 120), 0.5) + (rng.randint(16, 32),)
        wd.ellipse([wx - rw, wy - rh, wx + rw, wy + rh], fill=col)
    wash = wash.filter(ImageFilter.GaussianBlur(32))
    im.paste(wash, (0, 0), wash)

    # Brushstroke streaks
    for _ in range(10):
        sy = rng.randint(int(HH * 0.06), int(HH * 0.52))
        sx = rng.randint(-30, HW - 60)
        sw = rng.randint(50, 280)
        streak = Image.new("RGBA", (HW, HH), (0, 0, 0, 0))
        sd = ImageDraw.Draw(streak)
        sd.rectangle([sx, sy - 1, sx + sw, sy + 1],
                     fill=lerp(pal["sky0"], pal["sky2"], sy / HH) + (rng.randint(8, 20),))
        streak = streak.filter(ImageFilter.GaussianBlur(rng.randint(2, 6)))
        im.paste(streak, (0, 0), streak)


def _hero_stars(d, rng, n=40):
    for _ in range(n):
        x = rng.randint(0, HW); y = rng.randint(0, int(HH * 0.42))
        al = rng.randint(50, 140)
        if rng.random() > 0.78:
            d.ellipse([x - 2, y - 2, x + 2, y + 2], fill=(255, 248, 225, al))
            d.ellipse([x - 4, y - 4, x + 4, y + 4], fill=(255, 240, 200, al // 4))
        else:
            d.ellipse([x - 1, y - 1, x + 1, y + 1], fill=(255, 245, 220, al))


def _hero_neighbor_blocks(d, pal, rng, ground_y):
    """Flanking shitamachi neighbor silhouettes with sumi texture."""
    # Left neighbor cluster
    x = 0
    while x < HW * 0.18:
        bw = rng.randint(36, 80); bh = rng.randint(40, int(HH * 0.28))
        col = lerp(pal["ink"], pal["mid"], 0.3)
        d.rectangle([x, ground_y - bh, x + bw, ground_y], fill=col)
        x += bw + rng.randint(4, 18)

    # Right neighbor cluster
    x = int(HW * 0.82)
    while x < HW:
        bw = rng.randint(36, 80); bh = rng.randint(35, int(HH * 0.25))
        col = lerp(pal["ink"], pal["mid"], 0.28)
        d.rectangle([x, ground_y - bh, x + bw, ground_y], fill=col)
        x += bw + rng.randint(4, 18)


def _ink_outline(d, x0, y0, x1, y1, rng, width=2):
    """Hand-jittered ink outline on a rectangle."""
    jitter = 1
    for seg in [[(x0, y0), (x1, y0)], [(x1, y0), (x1, y1)],
                [(x0, y1), (x1, y1)], [(x0, y0), (x0, y1)]]:
        p0, p1 = seg
        jp0 = (p0[0] + rng.randint(-jitter, jitter), p0[1] + rng.randint(-jitter, jitter))
        jp1 = (p1[0] + rng.randint(-jitter, jitter), p1[1] + rng.randint(-jitter, jitter))
        d.line([jp0, jp1], fill=(16, 12, 22, rng.randint(100, 170)), width=width)


def hero_portrait(pid, f, rng_seed=13):
    """Washi/sumi illustrated hero image (1024×576, SYNTHETIC, labeled)."""
    rng = random.Random(hash(pid) & 0xffff | rng_seed)
    pal_key = f.get("palette", "shitamachi")
    pal = SKY_PAL.get(pal_key, SKY_PAL["shitamachi"])
    fpal = PALETTES.get(f.get("facade"), PALETTES["neutral"])

    im = Image.new("RGB", (HW, HH))
    d = ImageDraw.Draw(im, "RGBA")

    # 1. Washi sky
    _hero_sky(im, d, pal, rng)
    _hero_stars(d, rng)

    ground_y = int(HH * 0.84)

    # 2. Far atmosphere wash (hazy distance)
    _wash_rect(im, 0, int(HH * 0.50), HW, ground_y,
               lerp(pal["sky2"], (255, 230, 190), 0.4), 30, blur=24)

    # 3. Neighbor building silhouettes
    _hero_neighbor_blocks(d, pal, rng, ground_y)

    # 4. Main building — ink wash with paper texture
    floors = f["floors"]
    fam = f["lay"] in ("1LDK", "2LDK", "3LDK", "1SLDK")
    fh = min(48 if floors <= 4 else 32 if floors <= 8 else 26,
             int((ground_y - 60) / floors))
    bw = 280 if floors >= 10 else 340 if floors >= 6 else 420
    bh = fh * floors
    bx0 = (HW - bw) // 2; by0 = ground_y - bh

    # Building body — wall wash
    d.rectangle([bx0, by0, bx0 + bw, ground_y], fill=fpal["wall"])

    # Sumi hatch across full facade
    _sumi_hatch(d, bx0, by0, bx0 + bw, ground_y, rng, spacing=11, alpha=20)

    # Facade texture
    if f["facade"] == "grey-tile":
        # Tile grid — light ink lines
        for gx in range(bx0, bx0 + bw, 14):
            d.line([(gx, by0), (gx, ground_y)],
                   fill=fpal["trim"] + (55,), width=1)
        for gy in range(by0, ground_y, 24):
            d.line([(bx0, gy), (bx0 + bw, gy)],
                   fill=fpal["trim"] + (35,), width=1)

    elif f["facade"] == "wood":
        # Horizontal siding with warm ink tones
        for gy in range(by0, ground_y, 8):
            d.line([(bx0, gy), (bx0 + bw, gy)],
                   fill=fpal["trim"] + (80,), width=1)

    elif f["facade"] == "steel":
        # Vertical panel seams with horizontal reveal lines
        for gx in range(bx0, bx0 + bw, 44):
            d.line([(gx, by0), (gx, ground_y)],
                   fill=fpal["trim"] + (100,), width=2)
        for gy in range(by0, ground_y, 40):
            d.line([(bx0, gy), (bx0 + bw, gy)],
                   fill=fpal["trim"] + (40,), width=1)

    # Parapet line
    d.rectangle([bx0, by0 - 10, bx0 + bw, by0], fill=fpal["trim"])

    # 5. Windows — per true floor count, ink-framed warm panes
    bays = 3 if fam else 4 if bw < 350 else 5
    bwid_w = bw // (bays + 1) - 4
    for fl in range(floors):
        wy = ground_y - (fl + 1) * fh + 5
        for b in range(bays):
            wx = bx0 + int((b + 0.55) * bw / bays)
            lit = ((fl * 7 + b * 13 + hash(pid)) % 10) < 5 and fl > 0
            win_col = fpal["lit"] if lit else fpal["win"]
            d.rectangle([wx, wy, wx + bwid_w, wy + fh - 10], fill=win_col)
            # Ink frame
            _ink_outline(d, wx, wy, wx + bwid_w, wy + fh - 10, rng, width=1)
            # Balcony rail for family units
            if fam and fl > 0:
                d.rectangle([wx - 5, wy + fh - 12, wx + bwid_w + 5, wy + fh - 9],
                            fill=fpal["trim"])
                for rx in range(wx - 5, wx + bwid_w + 5, 6):
                    d.line([(rx, wy + fh - 9), (rx, wy + fh - 3)],
                           fill=fpal["trim"], width=1)

    # 6. Entrance — warm glow under canopy
    ex = bx0 + bw // 2 - 36
    d.rectangle([ex, ground_y - 52, ex + 72, ground_y], fill=fpal["win"])
    d.rectangle([ex + 6, ground_y - 44, ex + 66, ground_y],
                fill=(255, 232, 188, 140))
    d.rectangle([ex - 14, ground_y - 60, ex + 86, ground_y - 52],
                fill=fpal["trim"])  # canopy
    _ink_outline(d, ex, ground_y - 52, ex + 72, ground_y, rng, width=1)

    # 7. Ink building outline (hand-drawn edge)
    _ink_outline(d, bx0, by0 - 10, bx0 + bw, ground_y, rng, width=2)

    # 8. Ground plane — ink wash + washi streaks
    d.rectangle([0, ground_y, HW, HH], fill=pal["ink"])
    _wash_rect(im, 0, ground_y, HW, HH,
               lerp(pal["ink"], (80, 58, 38), 0.22), 38, blur=8)
    # Pavement streaks
    for _ in range(16):
        gx = rng.randint(0, HW); gy = rng.randint(ground_y + 4, HH - 4)
        d.line([(gx, gy), (gx + rng.randint(-50, 50), gy + rng.randint(-2, 2))],
               fill=(255, 240, 200, rng.randint(6, 18)), width=1)
    # Ground shadow below building
    d.rectangle([bx0 - 16, ground_y, bx0 + bw + 16, ground_y + 8],
                fill=(14, 12, 22))

    # 9. Street lamps
    for lp in [bx0 - 60, bx0 + bw + 60]:
        if 0 < lp < HW:
            d.line([(lp, ground_y), (lp - 2, ground_y - 70)],
                   fill=(26, 24, 38), width=3)
            d.ellipse([lp - 5, ground_y - 80, lp + 5, ground_y - 70],
                      fill=WARM + (210,))
            for lr in (8, 14, 22):
                d.ellipse([lp - lr, ground_y - 80 - lr // 2,
                           lp + lr, ground_y - 70 + lr // 2],
                          fill=WARM + (40 // (lr // 5 + 1),))

    # 10. Washi grain
    grain = Image.new("RGBA", (HW, HH), (0, 0, 0, 0))
    gpx = [(8, 6, 14, rng.randint(0, 28)) for _ in range(HW * HH)]
    grain.putdata(gpx)
    # Washi long fibres
    gd = ImageDraw.Draw(grain)
    for _ in range(28):
        fy = rng.randint(0, HH)
        gd.line([(rng.randint(0, HW // 2), fy),
                 (rng.randint(HW // 2, HW), fy + rng.randint(-3, 3))],
                fill=(255, 248, 220, rng.randint(4, 12)), width=1)
    im = im.convert("RGBA")
    im = Image.alpha_composite(im, grain)
    im = im.convert("RGB")

    # 11. Vignette
    vig = Image.new("L", (HW, HH), 0)
    dv = ImageDraw.Draw(vig)
    dv.ellipse([-HW * 0.28, -HH * 0.45, HW * 1.28, HH * 1.45], fill=255)
    vig = vig.filter(ImageFilter.GaussianBlur(80))
    black = Image.new("RGB", (HW, HH), (6, 4, 12))
    im = Image.composite(im, black, vig.point(lambda v: 192 + v // 5))

    # 12. Final very light blur (paper softness)
    im = im.filter(ImageFilter.GaussianBlur(0.5))

    p = os.path.join(OUT, f"{pid}_hero.webp")
    im.save(p, "WEBP", quality=86)
    return p


# ======================================================================
# MANIFESTS
# ======================================================================

def manifest(pid, f, path):
    matched = [f"{f['floors']} storeys — as listed", f"built {f['built']} — as listed"]
    if f.get("structure"): matched.append(f"structure {f['structure']} — as listed")
    if f.get("facade_src"): matched.append(f["facade_src"])
    m = {
        "asset_id": f"kanto-{pid}-massing-portrait-v1",
        "state": "SYNTHETIC",
        "display_label": "Massing portrait — storeys/structure from the listing; facade style typologized. Not a photograph.",
        "card_label": "SYNTHETIC · massing portrait 外形図",
        "detail_label": "SYNTHETIC · massing portrait — floors, structure and build year are the listing's; window rhythm and colors are typology, not observation",
        "generated_at": "2026-09-02",
        "generator": "procedural elevation (PIL); replaced 1:1 by reference reconstruction after review (renders/PACKETS.json)",
        "method": "listed-fact massing: countable floors, structure palette, layout-scaled bays",
        "output": {"local_path": f"kanto/portraits/{pid}.webp", "format": "WEBP",
                   "width_px": PW, "height_px": PH,
                   "sha256": hashlib.sha256(open(path, 'rb').read()).hexdigest()},
        "visual_proximity": {
            "status": "MASSING_FACTS_ONLY", "grade": "NOT SCORED",
            "score_basis": "no exterior-photo comparison performed; only listed numeric facts are asserted",
            "matched_attributes": matched,
            "not_asserted": ["actual facade appearance beyond stated facts", "window placement",
                             "colors (except stated)", "site context", "current condition"],
        },
        "expectation_contract": [
            "Labeled synthetic at every display surface.",
            "Asserts only what the listing states: storey count, structure, build year, layout scale.",
            "Retired automatically when the reference reconstruction for this listing passes HIGH/MEDIUM review.",
        ],
    }
    json.dump(m, open(os.path.join(OUT, f"{pid}.json"), "w"), ensure_ascii=False, indent=1)
    return m


def hero_manifest(pid, f, path):
    matched = [f"{f['floors']} storeys — as listed", f"built {f['built']} — as listed",
               f"area: {f.get('area', 'not stated')}"]
    if f.get("structure"): matched.append(f"structure {f['structure']} — as listed")
    if f.get("facade_src"): matched.append(f["facade_src"])
    m = {
        "asset_id": f"kanto-{pid}-hero-portrait-v1",
        "state": "SYNTHETIC",
        "display_label": "Listing hero — synthetic washi/sumi illustrated exterior. Not a photograph. Not this building's current appearance.",
        "card_label": "SYNTHETIC · illustrated hero 外観図",
        "detail_label": "SYNTHETIC · washi/sumi illustrated hero — building scale, structure and facade type drawn from listing facts; street scene is area typology; current appearance, site context, and interior are unknown",
        "generated_at": "2026-09-02",
        "generator": "washi/sumi paper procedural hero (PIL r9, portrait_gen.py); replaced 1:1 by reference reconstruction after review (renders/PACKETS.json)",
        "method": "listed-fact illustrated elevation with washi wash sky, sumi hatch, ink outline, paper grain",
        "output": {"local_path": f"kanto/portraits/{pid}_hero.webp", "format": "WEBP",
                   "width_px": HW, "height_px": HH,
                   "sha256": hashlib.sha256(open(path, 'rb').read()).hexdigest()},
        "visual_proximity": {
            "status": "MASSING_FACTS_ONLY", "grade": "NOT SCORED",
            "score_basis": "no exterior-photo comparison performed; scale/structure from listing; facade illustration is washi/sumi typology, not ground-truth observation",
            "matched_attributes": matched,
            "not_asserted": ["actual facade appearance", "current exterior condition",
                             "site context or neighbors", "street-level detail", "interior"],
        },
        "expectation_contract": [
            "Labeled synthetic at every display surface.",
            "Illustrates building scale and type from listed facts; not the actual building.",
            "Retired when the reference reconstruction passes HIGH/MEDIUM review (renders/PACKETS.json).",
        ],
    }
    json.dump(m, open(os.path.join(OUT, f"{pid}_hero.json"), "w"), ensure_ascii=False, indent=1)
    return m


def load_all_facts():
    import re
    facts = dict(FACTS)
    live_js_path = os.path.join(os.path.dirname(OUT), "kanto_live.js")
    if not os.path.exists(live_js_path):
        return facts
    with open(live_js_path, "r", encoding="utf-8") as fp:
        text = fp.read()

    chunks = re.findall(r"\{\s*id:\s*['\"]lv\d+['\"].*?(?=(?:\{\s*id:\s*['\"]lv|\];|\Z))", text, re.DOTALL)
    facade_choices = ["rc", "grey-tile", "neutral", "beige", "steel"]
    for c in chunks:
        m_id = re.search(r"id:\s*['\"]([^'\"]+)['\"]", c)
        if not m_id:
            continue
        lid = m_id.group(1)
        if lid in facts:
            continue

        m_st = re.search(r"st:\s*['\"]([^'\"]+)['\"]", c)
        st = m_st.group(1) if m_st else "shimbashi"

        m_name = re.search(r"name:\s*\{\s*en:\s*['\"]([^'\"]+)['\"]", c)
        name = m_name.group(1) if m_name else lid

        m_rent = re.search(r"rent:\s*(\d+)", c)
        rent = int(m_rent.group(1)) if m_rent else 100000

        m_lay = re.search(r"layout:\s*['\"]([^'\"]+)['\"]", c)
        lay = m_lay.group(1) if m_lay else "1K"

        m_m2 = re.search(r"m2:\s*([\d.]+)", c)
        m2 = float(m_m2.group(1)) if m_m2 else 25.0

        m_fl = re.search(r"floors:\s*(\d+)", c)
        if m_fl:
            floors = int(m_fl.group(1))
        else:
            m_bf = re.search(r"(\d+)\s*F", c)
            floors = int(m_bf.group(1)) if m_bf else (12 if rent >= 250000 else 7 if rent >= 120000 else 4)

        m_yr = re.search(r"built:\s*['\"]([^'\"]+)['\"]", c)
        built = m_yr.group(1) if m_yr else "2018"

        core_stations = {'ningyocho','nihombashi','takaracho','higashigyo','shimbashi','daimon','mita','sengakuji'}
        shitamachi_stations = {'shinagawa','kitashina','shimbamba','aomono','samezu','tachiaigawa','omorikaigan','heiwajima','omoramachi','umeyashiki','kamata','zoshiki','rokugodote'}
        palette = "core" if st in core_stations else "shitamachi" if st in shitamachi_stations else "bay"

        h = int(hashlib.md5(lid.encode('utf-8')).hexdigest()[:6], 16)
        facade = "grey-tile" if rent >= 300000 else facade_choices[h % len(facade_choices)]
        structure = "RC" if floors >= 5 else ("steel" if floors >= 3 else "wood")

        facts[lid] = {
            "name": name,
            "floors": floors,
            "structure": structure,
            "built": built,
            "lay": lay,
            "facade": facade,
            "area": st,
            "palette": palette,
            "m2": m2,
        }
    return facts


# ======================================================================
# MAIN
# ======================================================================

if __name__ == "__main__":
    reg = {}
    hero_reg = {}
    all_facts = load_all_facts()
    print(f"Loaded facts for {len(all_facts)} listings.")

    for pid, f in all_facts.items():
        # Massing portrait (thumbnail slot)
        p = portrait(pid, f)
        m = manifest(pid, f, p)
        reg[pid] = {
            "kind": "PORTRAIT", "src": f"portraits/{pid}.webp",
            "card": m["card_label"], "detail": m["detail_label"],
            "matched": m["visual_proximity"]["matched_attributes"],
            "status": "MASSING_FACTS_ONLY", "grade": "NOT SCORED",
            "floors": f["floors"], "structure": f.get("structure"), "built": f["built"],
        }

        # Hero image — check if existing file has Shoji Pass
        h_json_path = os.path.join(OUT, f"{pid}_hero.json")
        h_webp_path = os.path.join(OUT, f"{pid}_hero.webp")
        has_shoji = False
        if os.path.exists(h_json_path) and os.path.exists(h_webp_path):
            try:
                ex_m = json.load(open(h_json_path))
                if "shoji_pass" in ex_m.get("output", {}):
                    has_shoji = True
                    hero_reg[pid] = {
                        "kind": "HERO", "src": f"portraits/{pid}_hero.webp",
                        "card": ex_m["card_label"], "detail": ex_m["detail_label"],
                        "matched": ex_m["visual_proximity"]["matched_attributes"],
                        "status": "MASSING_FACTS_ONLY", "grade": "NOT SCORED",
                        "floors": f["floors"], "structure": f.get("structure"), "built": f["built"],
                    }
            except Exception:
                pass

        if not has_shoji:
            hp = hero_portrait(pid, f)
            hm = hero_manifest(pid, f, hp)
            hero_reg[pid] = {
                "kind": "HERO", "src": f"portraits/{pid}_hero.webp",
                "card": hm["card_label"], "detail": hm["detail_label"],
                "matched": hm["visual_proximity"]["matched_attributes"],
                "status": "MASSING_FACTS_ONLY", "grade": "NOT SCORED",
                "floors": f["floors"], "structure": f.get("structure"), "built": f["built"],
            }
        print(f"  {pid}: {'portrait + Shoji hero' if has_shoji else 'portrait + procedural hero'}")

    js = (
        "/* generated by portrait_gen.py — building-visual registry.\n"
        "   Reference reconstructions enter here ONLY with grade HIGH/MEDIUM\n"
        "   recorded in their manifest (fail closed, per VISUAL_PROXIMITY_PIPELINE). */\n"
        "const BUILDING_VISUALS = " + json.dumps(reg, ensure_ascii=False) + ";\n"
        "const HERO_VISUALS = " + json.dumps(hero_reg, ensure_ascii=False) + ";\n"
        "const RENDER_QUEUED = [];\n"
    )
    open(os.path.join(os.path.dirname(OUT), "kanto_visuals.js"), "w").write(js)
    print(f"portraits + heroes: {len(reg)} + registry written")
