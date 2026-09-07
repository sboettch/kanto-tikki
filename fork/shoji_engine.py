#!/usr/bin/env python3
"""Shoji Pass Core Engine (shoji_engine.py)

Pipeline:
  Procedural Kosmos Base (geometry + place + subject facts locked)
    → Dual-Pass SD-Turbo img2img (Sky/Background 0.50 / Subject/Ground 0.35)
    → Sigmoid Horizon & Depth Fuse Composite
    → Luminous Paper Theater Style (kokogarden v1)

Universal Synthesis: Supports architectural scenes, human figures / character portraits,
landscapes, and zen gardens in the signature Luminous Paper Theater aesthetic.
"""

import base64
import hashlib
import io
import json
import math
import os
import random
import re
import sys
import time
from typing import Any, Dict, Optional, Tuple

try:
    from PIL import Image, ImageDraw, ImageFilter
except ImportError:
    Image = None
    ImageDraw = None
    ImageFilter = None

WORK_W, WORK_H = 1024, 576  # 16:9 Cinematic Canvas

PALETTES = {
    "grey-tile": {"wall": (122, 126, 134), "trim": (94, 98, 108), "win": (44, 56, 80), "lit": (255, 214, 140)},
    "rc":        {"wall": (162, 160, 152), "trim": (134, 132, 124), "win": (48, 60, 84), "lit": (255, 214, 140)},
    "steel":     {"wall": (172, 178, 186), "trim": (144, 152, 162), "win": (46, 58, 82), "lit": (255, 214, 140)},
    "wood":      {"wall": (182, 146, 106), "trim": (146, 112, 78), "win": (50, 58, 78), "lit": (255, 214, 140)},
    "neutral":   {"wall": (168, 162, 152), "trim": (140, 136, 126), "win": (48, 58, 82), "lit": (255, 214, 140)},
}

SKY_PAL = {
    "core":       {"sky0": (28, 32, 68), "sky1": (108, 82, 118), "sky2": (212, 132, 88), "ink": (18, 18, 30), "mid": (100, 86, 118)},
    "shitamachi": {"sky0": (42, 30, 62), "sky1": (148, 74, 88), "sky2": (236, 148, 72), "ink": (22, 18, 32), "mid": (134, 96, 114)},
    "bay":        {"sky0": (30, 42, 80), "sky1": (88, 104, 148), "sky2": (198, 148, 116), "ink": (16, 20, 34), "mid": (92, 106, 140)},
}

WARM_LIGHT = (255, 210, 130)


def _lerp(a: Tuple[int, ...], b: Tuple[int, ...], t: float) -> Tuple[int, ...]:
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(min(len(a), len(b))))


def parse_prompt_to_spec(prompt: str) -> Dict[str, Any]:
    """Universal prompt analyzer that classifies subject and extracts physical attributes."""
    p_lower = prompt.lower()
    
    # 1. Subject Category Classification
    is_person = any(w in p_lower for w in [
        "person", "man", "woman", "human", "portrait", "character", "girl", "boy",
        "figure", "face", "artisan", "samurai", "traveler", "people", "walker", "pedestrian"
    ])
    is_landscape = any(w in p_lower for w in [
        "garden", "zen", "mountain", "fuji", "forest", "tree", "river", "lake", "park",
        "nature", "temple garden", "bamboo", "blossom", "meadow"
    ])
    is_document = any(w in p_lower for w in [
        "contract", "deed", "document", "manuscript", "scroll", "paper deed", "kanji text",
        "stamp", "hanko", "seal", "letter", "calligraphy", "certificate", "passport"
    ])
    is_building = any(w in p_lower for w in [
        "building", "apartment", "tower", "house", "mansion", "facade", "storeys",
        "storey", "floor", "floors", "residence", "machiya", "condo", "block"
    ])

    if is_document and not is_building:
        category = "document"
    elif is_person and not is_building:
        category = "figure"
    elif is_landscape and not is_building:
        category = "landscape"
    else:
        category = "architecture"

    # 2. Extract architectural facts (if applicable)
    floors = 4
    floor_match = re.search(r'(\d+)\s*(?:-|–|\s)*(?:storey|story|floor|階|fl)', p_lower)
    if floor_match:
        try:
            floors = max(1, min(25, int(floor_match.group(1))))
        except ValueError:
            pass

    facade = "neutral"
    if "grey" in p_lower or "gray" in p_lower or "tile" in p_lower:
        facade = "grey-tile"
    elif "wood" in p_lower or "timber" in p_lower or "cedar" in p_lower:
        facade = "wood"
    elif "steel" in p_lower or "metal" in p_lower:
        facade = "steel"
    elif "rc" in p_lower or "concrete" in p_lower or "brutalist" in p_lower:
        facade = "rc"

    palette = "shitamachi"
    if "bay" in p_lower or "yokohama" in p_lower or "tsurumi" in p_lower or "port" in p_lower:
        palette = "bay"
    elif "core" in p_lower or "nihonbashi" in p_lower or "shinjuku" in p_lower or "ginza" in p_lower:
        palette = "core"

    lay = "1LDK"
    if "studio" in p_lower or "1r" in p_lower:
        lay = "1R"
    elif "1k" in p_lower:
        lay = "1K"
    elif "2ldk" in p_lower or "family" in p_lower:
        lay = "2LDK"
    elif "3ldk" in p_lower:
        lay = "3LDK"

    # String hash for determinism
    hash_val = 0
    for char in prompt:
        hash_val = ((hash_val << 5) - hash_val) + ord(char)
        hash_val &= 0xFFFFFFFF

    return {
        "category": category,
        "floors": floors,
        "facade": facade,
        "palette": palette,
        "lay": lay,
        "seed": hash_val or 42,
        "prompt": prompt,
    }


TIME_PALETTES = {
    "morning": {"sky0": (54, 76, 128), "sky1": (168, 138, 126), "sky2": (255, 218, 150), "ink": (24, 28, 42), "mid": (118, 102, 124)},
    "day":     {"sky0": (70, 120, 186), "sky1": (140, 185, 230), "sky2": (230, 242, 255), "ink": (30, 36, 48), "mid": (100, 130, 160)},
    "dusk":    {"sky0": (28, 32, 68),   "sky1": (108, 82, 118),  "sky2": (212, 132, 88),  "ink": (18, 18, 30), "mid": (100, 86, 118)},
    "night":   {"sky0": (12, 14, 28),   "sky1": (22, 26, 46),    "sky2": (38, 42, 68),    "ink": (10, 10, 18), "mid": (48, 46, 68)},
}


def render_kosmos_sky(
    im: Any,
    d: Any,
    pal: Dict[str, Any],
    rng: random.Random,
    width: int,
    height: int,
    time_of_day: str = "dusk",
    weather: str = "clear",
):
    """Multi-wash washi watercolor sky with dynamic time-of-day and weather overlays."""
    t_pal = TIME_PALETTES.get(time_of_day, pal)

    for y in range(height):
        t = y / height
        if t < 0.38:
            c = _lerp(t_pal["sky0"], t_pal["sky1"], t / 0.38)
        elif t < 0.65:
            c = _lerp(t_pal["sky1"], t_pal["sky2"], (t - 0.38) / 0.27)
        else:
            c = _lerp(t_pal["sky2"], _lerp(t_pal["sky2"], (255, 240, 210), 0.35), (t - 0.65) / 0.35)
        d.line([(0, y), (width, y)], fill=c)

    # Watercolour wash blooms
    wash = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    wd = ImageDraw.Draw(wash)
    for _ in range(7):
        wx = rng.randint(-60, width + 60)
        wy = rng.randint(int(height * 0.25), int(height * 0.65))
        rw, rh = rng.randint(160, 440), rng.randint(40, 120)
        wd.ellipse([wx - rw, wy - rh, wx + rw, wy + rh], fill=t_pal["sky2"] + (rng.randint(20, 44),))
    wash = wash.filter(ImageFilter.GaussianBlur(32))
    im.paste(wash, (0, 0), wash)

    # Weather Overlays
    if weather == "rain":
        rain = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        rd = ImageDraw.Draw(rain)
        for _ in range(120):
            rx = rng.randint(0, width)
            ry = rng.randint(0, height)
            rd.line([(rx, ry), (rx - 4, ry + 16)], fill=(200, 215, 240, rng.randint(50, 130)), width=1)
        im.paste(rain, (0, 0), rain)
    elif weather == "snow":
        snow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        sd = ImageDraw.Draw(snow)
        for _ in range(90):
            sx = rng.randint(0, width)
            sy = rng.randint(0, height)
            sr = rng.randint(1, 3)
            sd.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=(255, 255, 255, rng.randint(100, 200)))
        im.paste(snow, (0, 0), snow)
    elif weather == "mist":
        mist = Image.new("RGBA", (width, height), (240, 242, 248, 55))
        im.paste(mist, (0, 0), mist)

    # Stars (night / dusk only)
    if time_of_day in ("night", "dusk") and weather == "clear":
        for _ in range(35):
            sx = rng.randint(0, width)
            sy = rng.randint(0, int(height * 0.42))
            al = rng.randint(60, 160)
            d.ellipse([sx - 1, sy - 1, sx + 1, sy + 1], fill=(255, 245, 220, al))


def render_kosmos_figure(
    prompt: str = "a picture of a person",
    palette: str = "shitamachi",
    seed: int = 42,
    width: int = WORK_W,
    height: int = WORK_H,
) -> Any:
    """Procedurally renders a character portrait / human figure in Luminous Paper Theater style."""
    if Image is None:
        raise RuntimeError("Pillow is required.")

    rng = random.Random(seed)
    pal = SKY_PAL.get(palette, SKY_PAL["shitamachi"])

    im = Image.new("RGB", (width, height))
    d = ImageDraw.Draw(im, "RGBA")

    # 1. Sky & Atmospheric Twilight Backdrop
    render_kosmos_sky(im, d, pal, rng, width, height)

    ground_y = int(height * 0.88)

    # 2. Distant background silhouetted trees/lanes
    d.rectangle([0, ground_y - 40, width, ground_y], fill=_lerp(pal["ink"], pal["mid"], 0.35))

    # 3. Human Figure Silhouette & Sumi Brush Contours (Centered Cinematic Composition)
    cx = width // 2
    head_y = int(height * 0.30)
    head_r = 32

    # Warm Lantern / Paper Light Glow near subject
    lantern_x = cx + 80
    lantern_y = int(height * 0.45)
    for lr in (40, 70, 110):
        d.ellipse([lantern_x - lr, lantern_y - lr, lantern_x + lr, lantern_y + lr], fill=WARM_LIGHT + (25 // (lr // 30 + 1),))

    # Garment / Body Contour (Kimono / Coat / Robe in Sumi Ink)
    torso_top = head_y + head_r + 6
    shoulder_w = 64
    hip_w = 90
    bottom_w = 120

    # Body fill (rich indigo sumi ink wash)
    robe_points = [
        (cx - shoulder_w, torso_top + 14),
        (cx - head_r // 2, torso_top),
        (cx + head_r // 2, torso_top),
        (cx + shoulder_w, torso_top + 14),
        (cx + hip_w, int(height * 0.62)),
        (cx + bottom_w, ground_y),
        (cx - bottom_w, ground_y),
        (cx - hip_w, int(height * 0.62)),
    ]
    d.polygon(robe_points, fill=(24, 26, 38))

    # Fold hatching lines (washi paper linework)
    d.line([(cx - 8, torso_top + 10), (cx + 20, int(height * 0.58))], fill=(48, 52, 70), width=2)
    d.line([(cx + 8, torso_top + 10), (cx - 18, int(height * 0.58))], fill=(48, 52, 70), width=2)
    d.line([(cx, int(height * 0.58)), (cx - 10, ground_y - 10)], fill=(40, 44, 60), width=2)

    # Head & Hair / Hat (Sumi ink)
    # Head silhouette
    d.ellipse([cx - head_r, head_y, cx + head_r, head_y + head_r * 2], fill=(235, 205, 175)) # warm skin base
    d.ellipse([cx - head_r - 2, head_y - 4, cx + head_r + 2, head_y + head_r + 4], fill=(20, 18, 26)) # hair
    d.line([(cx - head_r, head_y + head_r), (cx - head_r - 4, torso_top + 8)], fill=(20, 18, 26), width=3)
    d.line([(cx + head_r, head_y + head_r), (cx + head_r + 4, torso_top + 8)], fill=(20, 18, 26), width=3)

    # Paper Umbrella / Parasol (if traveler or prompt implies)
    has_umbrella = any(w in prompt.lower() for w in ["umbrella", "rain", "traveler", "gion", "dusk", "walk"]) or rng.random() > 0.4
    if has_umbrella:
        ux, uy = cx - 30, head_y - 20
        d.line([(ux, uy + 10), (cx + 10, torso_top + 30)], fill=(28, 24, 34), width=3) # handle
        d.ellipse([ux - 90, uy - 35, ux + 90, uy + 25], fill=(185, 82, 64)) # red washi umbrella
        d.ellipse([ux - 90, uy - 35, ux + 90, uy + 25], outline=(20, 18, 24), width=2)
        for ang in range(-80, 81, 20):
            d.line([(ux, uy - 10), (ux + ang, uy + 15)], fill=(130, 50, 40), width=1)

    # Sumi ink outline around figure
    d.polygon(robe_points, outline=(16, 12, 22), width=2)

    # 4. Ground Plane & Lantern Reflection
    d.rectangle([0, ground_y, width, height], fill=pal["ink"])
    for gx in range(0, width, 40):
        d.line([(gx, ground_y + 6), (gx + 30, height - 6)], fill=(255, 240, 200, 12), width=1)

    # 5. Handheld / Standing Paper Lantern
    d.rectangle([lantern_x - 10, lantern_y - 18, lantern_x + 10, lantern_y + 18], fill=WARM_LIGHT + (230,))
    d.rectangle([lantern_x - 10, lantern_y - 18, lantern_x + 10, lantern_y + 18], outline=(24, 20, 30), width=2)
    d.line([(lantern_x, lantern_y - 28), (lantern_x, lantern_y - 18)], fill=(24, 20, 30), width=2)

    # 6. Washi Fibres & Grain
    grain = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grain)
    for _ in range(24):
        fy = rng.randint(0, height)
        gd.line([(rng.randint(0, width // 2), fy), (rng.randint(width // 2, width), fy + rng.randint(-3, 3))], fill=(255, 248, 220, 8), width=1)
    im.paste(grain, (0, 0), grain)

    return im


def render_kosmos_landscape(
    prompt: str = "zen stone garden",
    palette: str = "shitamachi",
    seed: int = 42,
    width: int = WORK_W,
    height: int = WORK_H,
) -> Any:
    """Procedurally renders a zen landscape / garden in Luminous Paper Theater style."""
    if Image is None:
        raise RuntimeError("Pillow is required.")

    rng = random.Random(seed)
    pal = SKY_PAL.get(palette, SKY_PAL["shitamachi"])

    im = Image.new("RGB", (width, height))
    d = ImageDraw.Draw(im, "RGBA")

    # 1. Sky
    render_kosmos_sky(im, d, pal, rng, width, height)

    # 2. Mountain silhouette in distance
    d.polygon([(0, int(height * 0.65)), (int(width * 0.35), int(height * 0.32)), (int(width * 0.7), int(height * 0.68)), (0, int(height * 0.68))], fill=_lerp(pal["sky0"], pal["mid"], 0.45))
    d.polygon([(int(width * 0.4), int(height * 0.68)), (int(width * 0.78), int(height * 0.28)), (width, int(height * 0.62)), (width, int(height * 0.68))], fill=_lerp(pal["sky0"], pal["mid"], 0.55))

    ground_y = int(height * 0.72)
    d.rectangle([0, ground_y, width, height], fill=pal["ink"])

    # 3. Pine Trees / Maple Foliage (Sumi ink)
    for tx in [int(width * 0.18), int(width * 0.82)]:
        # Trunk
        d.line([(tx, ground_y), (tx - 10, ground_y - 120)], fill=(32, 28, 38), width=6)
        d.line([(tx - 10, ground_y - 120), (tx + 15, ground_y - 180)], fill=(32, 28, 38), width=4)
        # Branches & needles
        for by in range(ground_y - 190, ground_y - 90, 25):
            d.ellipse([tx - 60, by - 15, tx + 50, by + 15], fill=(38, 54, 48))
            d.ellipse([tx - 60, by - 15, tx + 50, by + 15], outline=(18, 24, 20), width=1)

    # 4. Stone Lantern (Toro)
    lx = int(width * 0.42)
    d.rectangle([lx - 12, ground_y - 65, lx + 12, ground_y], fill=(95, 98, 106))
    d.rectangle([lx - 16, ground_y - 75, lx + 16, ground_y - 65], fill=WARM_LIGHT + (220,))
    d.rectangle([lx - 22, ground_y - 82, lx + 22, ground_y - 75], fill=(75, 78, 86)) # cap

    # 5. Raked Gravel Ripples
    for ry in range(ground_y + 15, height - 10, 14):
        d.line([(0, ry), (width, ry)], fill=(140, 142, 150, 40), width=1)

    return im


def render_kosmos_document(
    prompt: str = "Japanese property deed contract",
    palette: str = "shitamachi",
    seed: int = 42,
    width: int = WORK_W,
    height: int = WORK_H,
) -> Any:
    """Procedurally renders a Japanese manuscript deed / contract with calligraphy & hanko seal stamps."""
    if Image is None:
        raise RuntimeError("Pillow is required.")

    rng = random.Random(seed)
    pal = SKY_PAL.get(palette, SKY_PAL["shitamachi"])

    im = Image.new("RGB", (width, height))
    d = ImageDraw.Draw(im, "RGBA")

    # 1. Dark Tatami / Wooden Desk Background
    d.rectangle([0, 0, width, height], fill=(28, 24, 30))
    for tx in range(0, width, 18):
        d.line([(tx, 0), (tx, height)], fill=(36, 32, 40), width=1)

    # 2. Main Washi Paper Document / Scroll Sheet
    doc_margin_x = int(width * 0.18)
    doc_margin_y = int(height * 0.10)
    doc_w = width - (doc_margin_x * 2)
    doc_h = height - (doc_margin_y * 2)
    doc_x0 = doc_margin_x
    doc_y0 = doc_margin_y
    doc_x1 = doc_x0 + doc_w
    doc_y1 = doc_y0 + doc_h

    # Aged Mulberry Washi Paper
    d.rectangle([doc_x0, doc_y0, doc_x1, doc_y1], fill=(242, 234, 214))
    d.rectangle([doc_x0, doc_y0, doc_x1, doc_y1], outline=(140, 130, 110), width=2)

    # Paper Fiber Texture
    for _ in range(40):
        fx = rng.randint(doc_x0, doc_x1)
        fy = rng.randint(doc_y0, doc_y1)
        d.line([(fx, fy), (fx + rng.randint(-15, 15), fy + rng.randint(-4, 4))], fill=(210, 198, 175, 80), width=1)

    # 3. Vertical Columns & Calligraphy Lines (Traditional Right-to-Left format)
    col_width = 36
    cols = (doc_w - 60) // col_width
    for c in range(cols):
        cx = doc_x1 - 35 - (c * col_width)
        # Column line
        d.line([(cx, doc_y0 + 20), (cx, doc_y1 - 20)], fill=(220, 210, 190), width=1)
        # Sumi ink text stroke glyphs
        for gy in range(doc_y0 + 35, doc_y1 - 35, 18):
            if rng.random() > 0.15:
                glyph_w = rng.randint(8, 16)
                glyph_h = rng.randint(4, 10)
                d.rectangle([cx - glyph_w // 2, gy, cx + glyph_w // 2, gy + glyph_h], fill=(24, 22, 28, 220))
                if rng.random() > 0.4:
                    d.line([(cx - 4, gy + 2), (cx + 6, gy + 8)], fill=(18, 16, 22), width=1)

    # 4. Vermillion Red Hanko / Government Seal Stamps
    seal_positions = [
        (doc_x1 - 60, doc_y0 + 45, 26, "square"),
        (doc_x0 + 80, doc_y1 - 60, 32, "square"),
        (doc_x0 + 130, doc_y1 - 55, 20, "circle"),
    ]
    for sx, sy, s_size, s_type in seal_positions:
        vermillion = (195, 45, 35, 230)
        vermillion_dark = (160, 35, 25, 255)
        if s_type == "square":
            d.rectangle([sx - s_size // 2, sy - s_size // 2, sx + s_size // 2, sy + s_size // 2], fill=vermillion)
            d.rectangle([sx - s_size // 2, sy - s_size // 2, sx + s_size // 2, sy + s_size // 2], outline=vermillion_dark, width=2)
            # Internal seal character glyphs
            d.line([(sx - s_size // 3, sy), (sx + s_size // 3, sy)], fill=(242, 234, 214, 200), width=2)
            d.line([(sx, sy - s_size // 3), (sx, sy + s_size // 3)], fill=(242, 234, 214, 200), width=2)
        else:
            d.ellipse([sx - s_size // 2, sy - s_size // 2, sx + s_size // 2, sy + s_size // 2], fill=vermillion)
            d.ellipse([sx - s_size // 2, sy - s_size // 2, sx + s_size // 2, sy + s_size // 2], outline=vermillion_dark, width=2)

    # 5. Ambient Warm Lantern Light Wash (Across top-right)
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([int(width * 0.7) - 180, -50, int(width * 0.7) + 180, 250], fill=WARM_LIGHT + (35,))
    im.paste(glow, (0, 0), glow)

    return im


def render_kosmos_canvas(
    prompt: str = "",
    category: Optional[str] = None,
    floors: int = 6,
    facade: str = "grey-tile",
    palette: str = "shitamachi",
    lay: str = "1LDK",
    seed: int = 42,
    width: int = WORK_W,
    height: int = WORK_H,
) -> Any:
    """Universal dispatcher that renders the proper procedural Kosmos base for any prompt."""
    if not category:
        spec = parse_prompt_to_spec(prompt)
        category = spec.get("category", "architecture")
        if not floors:
            floors = spec.get("floors", 6)
        if not facade or facade == "neutral":
            facade = spec.get("facade", "neutral")
        if not palette or palette == "shitamachi":
            palette = spec.get("palette", "shitamachi")
        if not lay or lay == "1LDK":
            lay = spec.get("lay", "1LDK")
        seed = spec.get("seed", seed)

    if category == "document":
        return render_kosmos_document(prompt=prompt, palette=palette, seed=seed, width=width, height=height)
    elif category == "figure":
        return render_kosmos_figure(prompt=prompt, palette=palette, seed=seed, width=width, height=height)
    elif category == "landscape":
        return render_kosmos_landscape(prompt=prompt, palette=palette, seed=seed, width=width, height=height)
    else:
        return render_kosmos_base(floors=floors, facade=facade, palette=palette, lay=lay, seed=seed, width=width, height=height)


def render_kosmos_base(
    floors: int = 6,
    facade: str = "grey-tile",
    palette: str = "shitamachi",
    lay: str = "1LDK",
    seed: int = 42,
    width: int = WORK_W,
    height: int = WORK_H,
) -> Any:
    """Procedurally renders the deterministic Kosmos architectural massing base."""
    if Image is None:
        raise RuntimeError("Pillow is required.")

    rng = random.Random(seed)
    pal = SKY_PAL.get(palette, SKY_PAL["shitamachi"])
    fpal = PALETTES.get(facade, PALETTES["neutral"])

    im = Image.new("RGB", (width, height))
    d = ImageDraw.Draw(im, "RGBA")

    # 1. Sky Gradient
    render_kosmos_sky(im, d, pal, rng, width, height)

    ground_y = int(height * 0.84)

    # 2. Far atmospheric haze
    haze = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    hd = ImageDraw.Draw(haze)
    hd.rectangle([0, int(height * 0.50), width, ground_y], fill=_lerp(pal["sky2"], (255, 230, 190), 0.4) + (30,))
    haze = haze.filter(ImageFilter.GaussianBlur(24))
    im.paste(haze, (0, 0), haze)

    # 3. Flanking neighbor silhouettes
    nx = 0
    while nx < width * 0.18:
        nbw = rng.randint(36, 80)
        nbh = rng.randint(40, int(height * 0.28))
        d.rectangle([nx, ground_y - nbh, nx + nbw, ground_y], fill=_lerp(pal["ink"], pal["mid"], 0.3))
        nx += nbw + rng.randint(4, 18)

    nx = int(width * 0.82)
    while nx < width:
        nbw = rng.randint(36, 80)
        nbh = rng.randint(35, int(height * 0.25))
        d.rectangle([nx, ground_y - nbh, nx + nbw, ground_y], fill=_lerp(pal["ink"], pal["mid"], 0.28))
        nx += nbw + rng.randint(4, 18)

    # 4. Main Building Massing
    fam = lay in ("1LDK", "2LDK", "3LDK", "1SLDK")
    fh = min(48 if floors <= 4 else 32 if floors <= 8 else 26, int((ground_y - 60) / max(1, floors)))
    bw = 280 if floors >= 10 else 340 if floors >= 6 else 420
    bh = fh * floors
    bx0 = (width - bw) // 2
    by0 = ground_y - bh

    # Wall base
    d.rectangle([bx0, by0, bx0 + bw, ground_y], fill=fpal["wall"])

    # Sumi ink hatching
    for xi in range(bx0, bx0 + bw, 11):
        lx0, ly0 = xi, by0
        lx1, ly1 = xi + int((ground_y - by0) * 0.12), ground_y
        d.line([(lx0, ly0), (lx1, ly1)], fill=(16, 14, 22, 20 + rng.randint(-6, 6)), width=1)

    # Facade specific grid
    if facade == "grey-tile":
        for gx in range(bx0, bx0 + bw, 14):
            d.line([(gx, by0), (gx, ground_y)], fill=fpal["trim"] + (55,), width=1)
        for gy in range(by0, ground_y, 24):
            d.line([(bx0, gy), (bx0 + bw, gy)], fill=fpal["trim"] + (35,), width=1)
    elif facade == "wood":
        for gy in range(by0, ground_y, 8):
            d.line([(bx0, gy), (bx0 + bw, gy)], fill=fpal["trim"] + (80,), width=1)
    elif facade == "steel":
        for gx in range(bx0, bx0 + bw, 44):
            d.line([(gx, by0), (gx, ground_y)], fill=fpal["trim"] + (100,), width=2)
        for gy in range(by0, ground_y, 40):
            d.line([(bx0, gy), (bx0 + bw, gy)], fill=fpal["trim"] + (40,), width=1)

    # Parapet
    d.rectangle([bx0, by0 - 10, bx0 + bw, by0], fill=fpal["trim"])

    # 5. Windows & Illumination
    bays = 3 if fam else 4 if bw < 350 else 5
    bwid_w = bw // (bays + 1) - 4
    for fl in range(floors):
        wy = ground_y - (fl + 1) * fh + 5
        for b in range(bays):
            wx = bx0 + int((b + 0.55) * bw / bays)
            lit = ((fl * 7 + b * 13 + seed) % 10) < 5 and fl > 0
            win_col = fpal["lit"] if lit else fpal["win"]
            d.rectangle([wx, wy, wx + bwid_w, wy + fh - 10], fill=win_col)
            d.rectangle([wx, wy, wx + bwid_w, wy + fh - 10], outline=(16, 12, 22, 140), width=1)
            if fam and fl > 0:
                d.rectangle([wx - 5, wy + fh - 12, wx + bwid_w + 5, wy + fh - 9], fill=fpal["trim"])

    # Entrance
    ex = bx0 + bw // 2 - 36
    d.rectangle([ex, ground_y - 52, ex + 72, ground_y], fill=fpal["win"])
    d.rectangle([ex + 6, ground_y - 44, ex + 66, ground_y], fill=(255, 232, 188, 140))
    d.rectangle([ex - 14, ground_y - 60, ex + 86, ground_y - 52], fill=fpal["trim"])
    d.rectangle([ex, ground_y - 52, ex + 72, ground_y], outline=(16, 12, 22, 150), width=1)

    # Building edge
    d.rectangle([bx0, by0 - 10, bx0 + bw, ground_y], outline=(16, 12, 22, 160), width=2)

    # 6. Ground Plane & Street Lamps
    d.rectangle([0, ground_y, width, height], fill=pal["ink"])
    for lp in [bx0 - 60, bx0 + bw + 60]:
        if 0 < lp < width:
            d.line([(lp, ground_y), (lp - 2, ground_y - 70)], fill=(26, 24, 38), width=3)
            d.ellipse([lp - 5, ground_y - 80, lp + 5, ground_y - 70], fill=WARM_LIGHT + (210,))
            d.ellipse([lp - 16, ground_y - 90, lp + 16, ground_y - 60], fill=WARM_LIGHT + (35,))

    # 7. Washi Fibres
    grain = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grain)
    for _ in range(24):
        fy = rng.randint(0, height)
        gd.line([(rng.randint(0, width // 2), fy), (rng.randint(width // 2, width), fy + rng.randint(-3, 3))], fill=(255, 248, 220, 8), width=1)
    im.paste(grain, (0, 0), grain)

    return im


def generate_horizon_mask(
    width: int = WORK_W,
    height: int = WORK_H,
    horizon_frac: float = 0.68,
    feather: float = 0.18,
) -> Any:
    """Computes the sigmoid feathered transition mask."""
    if Image is None:
        raise RuntimeError("Pillow is required.")

    pixels = []
    for y in range(height):
        t = (y / height - horizon_frac) / max(0.01, feather)
        sig = 1.0 / (1.0 + math.exp(-t * 6))
        pixels.append(int((1.0 - sig) * 255))
    
    mask_arr = []
    for y in range(height):
        mask_arr.extend([pixels[y]] * width)
        
    mask = Image.new("L", (width, height))
    mask.putdata(mask_arr)
    return mask


def simulate_shoji_diffusion_layers(
    base: Any,
    strength_lo: float = 0.35,
    strength_hi: float = 0.50,
) -> Tuple[Any, Any]:
    """Generates the dual diffusion layers (geometry/subject safe ground pass + atmospheric sky pass)."""
    ground_pass = base.copy()
    g_tint = Image.new("RGB", base.size, (20, 18, 24))
    ground_pass = Image.blend(ground_pass, g_tint, 0.08)
    ground_pass = ground_pass.filter(ImageFilter.UnsharpMask(radius=2, percent=130, threshold=3))

    sky_pass = base.copy()
    s_tint = Image.new("RGB", base.size, (45, 30, 75))
    sky_pass = Image.blend(sky_pass, s_tint, 0.22)
    sky_pass = sky_pass.filter(ImageFilter.GaussianBlur(1.2))
    sky_pass = sky_pass.filter(ImageFilter.UnsharpMask(radius=3, percent=110, threshold=2))

    return ground_pass, sky_pass


def fuse_shoji_pass(
    base: Any,
    sky_layer: Optional[Any] = None,
    ground_layer: Optional[Any] = None,
    horizon_frac: float = 0.68,
    feather: float = 0.18,
    strength_lo: float = 0.35,
    strength_hi: float = 0.50,
) -> Tuple[Any, Any, Any, Any]:
    """Executes the horizon-fuse composite."""
    if sky_layer is None or ground_layer is None:
        ground_layer, sky_layer = simulate_shoji_diffusion_layers(base, strength_lo, strength_hi)

    mask = generate_horizon_mask(base.width, base.height, horizon_frac, feather)
    fused = Image.composite(sky_layer, ground_layer, mask)
    return fused, mask, ground_layer, sky_layer


def image_to_base64_data_uri(im: Any, format: str = "WEBP", quality: int = 88) -> str:
    buf = io.BytesIO()
    im.save(buf, format=format, quality=quality)
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    mime = "image/webp" if format.upper() == "WEBP" else "image/png"
    return f"data:{mime};base64,{b64}"


def build_shoji_prompt(user_prompt: str) -> str:
    """Formats any arbitrary prompt into the signature Shoji Pass / Luminous Paper Theater style formula."""
    style_suffix = (
        "Shoji Pass style, Luminous Paper Theater, washi paper texture, "
        "delicate sumi ink linework, layered translucent paper screens, "
        "woodblock color palette, indigo ochre watercolour dusk sky, "
        "warm amber lantern illumination, Japanese sketchbook illustration, kokogarden v1"
    )
    return f"{user_prompt}, {style_suffix}"


def generate_online_diffusion(
    prompt: str,
    provider: Optional[str] = None,
    width: int = WORK_W,
    height: int = WORK_H,
) -> Optional[Any]:
    """Attempts to generate a real AI diffusion artwork via available cloud APIs (HuggingFace, Replicate, OpenAI)."""
    if Image is None:
        return None

    import urllib.request
    import urllib.error

    full_prompt = build_shoji_prompt(prompt)

    # 1. HuggingFace Inference API (SD-Turbo or SDXL)
    hf_token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACE_API_KEY")
    if (provider == "huggingface" or (provider is None and hf_token)) and hf_token:
        try:
            url = "https://api-inference.huggingface.co/models/stabilityai/sd-turbo"
            headers = {
                "Authorization": f"Bearer {hf_token}",
                "Content-Type": "application/json",
            }
            payload = json.dumps({"inputs": full_prompt}).encode("utf-8")
            req = urllib.request.Request(url, data=payload, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as resp:
                raw_bytes = resp.read()
                im = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
                return im.resize((width, height), Image.LANCZOS)
        except Exception as e:
            sys.stderr.write(f"HuggingFace inference failed: {e}\n")

    # 2. OpenAI DALL-E 3 API
    openai_key = os.environ.get("OPENAI_API_KEY")
    if (provider == "openai" or (provider is None and openai_key)) and openai_key:
        try:
            url = "https://api.openai.com/v1/images/generations"
            headers = {
                "Authorization": f"Bearer {openai_key}",
                "Content-Type": "application/json",
            }
            payload = json.dumps({
                "model": "dall-e-3",
                "prompt": full_prompt,
                "n": 1,
                "size": "1024x1024",
                "response_format": "b64_json"
            }).encode("utf-8")
            req = urllib.request.Request(url, data=payload, headers=headers)
            with urllib.request.urlopen(req, timeout=45) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                b64_img = data["data"][0]["b64_json"]
                im = Image.open(io.BytesIO(base64.b64decode(b64_img))).convert("RGB")
                return im.resize((width, height), Image.LANCZOS)
        except Exception as e:
            sys.stderr.write(f"OpenAI generation failed: {e}\n")

    return None


def create_manifest(
    image_bytes: bytes,
    prompt: str,
    spec: Dict[str, Any],
    strength_lo: float = 0.35,
    strength_hi: float = 0.50,
    horizon_frac: float = 0.68,
    feather: float = 0.18,
    device: str = "simulated",
) -> Dict[str, Any]:
    sha = hashlib.sha256(image_bytes).hexdigest()
    return {
        "label": "SYNTHETIC",
        "pipeline": "Shoji Pass · Kosmos + SD-Turbo dual-layer horizon fuse · Luminous Paper Theater (kokogarden v1)",
        "model": "stabilityai/sd-turbo" if device != "simulated" else "kosmos-luminous-paper-theater-v1",
        "device": device,
        "method": "dual-pass horizon fuse",
        "prompt": prompt,
        "subject_category": spec.get("category", "architecture"),
        "place_facts": spec,
        "parameters": {
            "strength_sky": strength_hi,
            "strength_building": strength_lo,
            "horizon_frac": horizon_frac,
            "feather": feather,
            "dimensions": f"{WORK_W}x{WORK_H}",
            "aspect_ratio": "16:9",
        },
        "provenance": {
            "sha256": sha,
            "created_at": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
            "watermark": "SYNTHETIC",
        },
    }

