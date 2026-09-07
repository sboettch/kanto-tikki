#!/usr/bin/env python3
"""HomeTikki KANTO — location-essence generator (Round 9 · paper edition).

The Codex pipeline's two halves, applied to area essences:
  PROCEDURAL (Kosmos side)  — this file. Every scene is composed from
    documented place facts (the recipe's `matched` list); geometry and
    semantics are controlled, nothing is hallucinated. Washi/sumi paper
    aesthetic: watercolour wash sky, ink-edged silhouettes, sumi hatching,
    washi grain, organic animated elements.
  GENERATIVE (StreamDiffusion side) — enhance step: SD-Turbo img2img at
    LOW strength (0.30), same family StreamDiffusion wraps; the procedural
    base constrains layout/geometry, diffusion adds photographic texture.
    (mirrors bayarearealestate/enhance_images.py tier3.)

Outputs per station: essence/{id}.png (base), essence/{id}.json manifest
following docs/VISUAL_PROXIMITY_PIPELINE.md conventions — state SYNTHETIC,
area-typology scope, grade NOT SCORED (no exact-address comparison),
labels for every display surface.
"""
import hashlib, json, math, os, random, sys
from PIL import Image, ImageDraw, ImageFilter, ImageChops

_T = 0.0                       # animation clock 0..1 (0 = the static frame)
def ph(x, y):                  # stable per-element phase from position
    return ((x * 73856093) ^ (y * 19349663)) % 997 / 997.0
def tw(x, y, lo=0.55, hi=1.0):  # twinkle multiplier
    return lo + (hi - lo) * (0.5 + 0.5 * math.sin(2 * math.pi * (_T + ph(int(x), int(y)))))

W, H = 1024, 384
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "essence")
os.makedirs(OUT, exist_ok=True)

# ---------- palettes (warm washi dusk registers) ----------
# Compared to R2.5 palette, reds/ochres pushed warmer, blues less grey
PAL = {
    "shitamachi": dict(
        sky0=(42, 30, 62),   # deep indigo zenith
        sky1=(148, 74, 88),  # warm rose horizon band
        sky2=(236, 148, 72), # ochre/amber at glow
        ink=(22, 18, 32),    # sumi ink (buildings/ground)
        mid=(134, 96, 114),  # mid-tone for far skyline
    ),
    "core": dict(
        sky0=(28, 32, 68),
        sky1=(108, 82, 118),
        sky2=(212, 132, 88),
        ink=(18, 18, 30),
        mid=(100, 86, 118),
    ),
    "bay": dict(
        sky0=(30, 42, 80),
        sky1=(88, 104, 148),
        sky2=(198, 148, 116),
        ink=(16, 20, 34),
        mid=(92, 106, 140),
    ),
    "industry": dict(
        sky0=(32, 28, 56),
        sky1=(110, 76, 80),
        sky2=(192, 116, 78),
        ink=(20, 18, 30),
        mid=(104, 80, 88),
    ),
    "river": dict(
        sky0=(38, 44, 82),
        sky1=(132, 98, 112),
        sky2=(234, 156, 96),
        ink=(22, 24, 38),
        mid=(128, 104, 120),
    ),
}
SHU  = (212, 58, 52)     # Keikyu vermillion (slightly warmer)
ROSE = (238, 76, 148)    # Asakusa line
WARM = (255, 210, 130)   # warm window candlelight
COOL = (148, 200, 234)   # cool reflection

def lerp(a, b, t): return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))
def lerpA(a, b, t): return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(len(a)))

# ---------- PAPER / WASHI AESTHETIC PRIMITIVES ----------

def wash_sky(im, d, pal, rng):
    """Multi-band watercolour wash sky — 4 bleed bands + brushstroke texture."""
    # Band 1: deep indigo zenith → rose
    for y in range(H):
        t = y / H
        if t < 0.35:
            c = lerp(pal["sky0"], pal["sky1"], t / 0.35)
        elif t < 0.62:
            c = lerp(pal["sky1"], pal["sky2"], (t - 0.35) / 0.27)
        else:
            c = lerp(pal["sky2"], lerp(pal["sky2"], (255,240,210), 0.35), (t - 0.62) / 0.38)
        d.line([(0, y), (W, y)], fill=c)

    # Layered translucent wash blobs — simulate wet watercolour bleed
    wash_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    wd = ImageDraw.Draw(wash_layer)

    # Warm glow zone near horizon
    for _ in range(6):
        wx = rng.randint(-80, W + 80)
        wy = rng.randint(int(H * 0.38), int(H * 0.72))
        rw = rng.randint(180, 400); rh = rng.randint(40, 110)
        col = pal["sky2"] + (rng.randint(22, 48),)
        wd.ellipse([wx - rw, wy - rh, wx + rw, wy + rh], fill=col)

    # Cool zenith bloom
    for _ in range(4):
        wx = rng.randint(-60, W + 60)
        wy = rng.randint(0, int(H * 0.30))
        rw = rng.randint(120, 320); rh = rng.randint(30, 80)
        col = lerp(pal["sky0"], (80, 60, 120), 0.5) + (rng.randint(18, 36),)
        wd.ellipse([wx - rw, wy - rh, wx + rw, wy + rh], fill=col)

    wash_layer = wash_layer.filter(ImageFilter.GaussianBlur(28))
    im.paste(wash_layer, (0, 0), wash_layer)

    # Brushstroke streaks (dry-brush texture on sky)
    for _ in range(14):
        sy = rng.randint(int(H * 0.08), int(H * 0.55))
        sx = rng.randint(-40, W - 100)
        sw = rng.randint(60, 320)
        c_lerp = (sy / H - 0.08) / 0.47
        col = lerp(pal["sky0"], pal["sky2"], max(0, min(1, c_lerp)))
        alpha = rng.randint(8, 22)
        streak = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        sd = ImageDraw.Draw(streak)
        sd.rectangle([sx, sy - 1, sx + sw, sy + 1], fill=col + (alpha,))
        streak = streak.filter(ImageFilter.GaussianBlur(rng.randint(2, 5)))
        im.paste(streak, (0, 0), streak)


def paper_grain(im, rng, strength=18):
    """Washi paper texture — fine grain + soft long-fibre streaks."""
    grain_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    pixels = []
    for _ in range(W * H):
        v = rng.randint(0, strength)
        sign = 1 if rng.random() < 0.5 else -1
        pixels.append((0, 0, 0, v) if sign < 0 else (255, 255, 240, v // 2))
    grain_layer.putdata(pixels)

    # Long horizontal fibres (washi characteristic)
    fd = ImageDraw.Draw(grain_layer)
    for _ in range(22):
        fy = rng.randint(0, H)
        fx0 = rng.randint(0, W // 2)
        fw = rng.randint(40, W)
        fd.line([(fx0, fy), (fx0 + fw, fy + rng.randint(-2, 2))],
                fill=(255, 248, 220, rng.randint(4, 10)), width=1)

    im.paste(grain_layer, (0, 0), grain_layer)


def ink_edge(im, d, shapes, rng, weight=1, jitter=1):
    """Ink-line pass: draw irregular sumi outlines along shape edges.

    shapes = list of (x0, y0, x1, y1) bounding rects to outline.
    Jitter simulates hand-drawn variation in the stroke weight.
    """
    edge_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ed = ImageDraw.Draw(edge_layer)
    for (x0, y0, x1, y1) in shapes:
        for segment in [
            [(x0, y0), (x1, y0)],
            [(x1, y0), (x1, y1)],
            [(x0, y1), (x1, y1)],
            [(x0, y0), (x0, y1)],
        ]:
            p0, p1 = segment
            # Slight hand-jitter on each point
            jp0 = (p0[0] + rng.randint(-jitter, jitter),
                   p0[1] + rng.randint(-jitter, jitter))
            jp1 = (p1[0] + rng.randint(-jitter, jitter),
                   p1[1] + rng.randint(-jitter, jitter))
            alpha = rng.randint(90, 160)
            w = weight + rng.randint(0, 1)
            ed.line([jp0, jp1], fill=(16, 12, 22, alpha), width=w)
    edge_layer = edge_layer.filter(ImageFilter.GaussianBlur(0.5))
    im.paste(edge_layer, (0, 0), edge_layer)


def sumi_hatch(d, x0, y0, x1, y1, rng, angle=12, spacing=9, alpha_base=28):
    """Sumi ink hatching inside a rectangle — parallel ink strokes at angle."""
    dx = math.tan(math.radians(angle))
    for xi in range(x0 - (y1 - y0), x1 + (y1 - y0), spacing):
        lx0 = xi; ly0 = y0
        lx1 = xi + int((y1 - y0) * dx); ly1 = y1
        # Clip to rect
        lx0c = max(lx0, x0); lx1c = min(lx1, x1)
        if lx0c >= lx1c:
            continue
        t0 = (lx0c - lx0) / max(1, lx1 - lx0)
        t1 = (lx1c - lx0) / max(1, lx1 - lx0)
        py0 = int(ly0 + (ly1 - ly0) * t0)
        py1 = int(ly0 + (ly1 - ly0) * t1)
        alpha = alpha_base + rng.randint(-8, 8)
        d.line([(lx0c, py0), (lx1c, py1)],
               fill=(16, 14, 22, max(0, min(255, alpha))), width=1)


def wash_rect(im, x0, y0, x1, y1, color, alpha, blur=8):
    """Soft watercolour wash in a rectangle."""
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    ld.rectangle([x0, y0, x1, y1], fill=color + (alpha,))
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    im.paste(layer, (0, 0), layer)


# ---------- scene primitives (all upgraded for paper aesthetic) ----------

def sky(d, pal):
    """Legacy flat sky — kept for compatibility but wash_sky is preferred."""
    for y in range(H):
        t = y / H
        if t < 0.45:
            c = lerp(pal["sky0"], pal["sky1"], t / 0.45)
        else:
            c = lerp(pal["sky1"], pal["sky2"], (t - 0.45) / 0.55)
        d.line([(0, y), (W, y)], fill=c)


def stars(d, rng, n=52):
    """Stars as soft feathered dots — varying size, warmer tones."""
    for _ in range(n):
        x = rng.randint(0, W)
        y = rng.randint(0, int(H * 0.40))
        sz = rng.random()
        base_alpha = int(rng.randint(55, 140) * tw(x, y, 0.28))
        if sz > 0.85:
            # larger star with soft halo
            d.ellipse([x - 2, y - 2, x + 2, y + 2],
                      fill=(255, 248, 225, base_alpha))
            d.ellipse([x - 4, y - 4, x + 4, y + 4],
                      fill=(255, 240, 200, base_alpha // 4))
        else:
            d.ellipse([x - 1, y - 1, x + 1, y + 1],
                      fill=(255, 245, 220, base_alpha))


def far_skyline(d, rng, pal, height=.42, towers=14):
    """Far silhouette — sumi wash with subtle hatch, ink-edged."""
    base = int(H * 0.62)
    col = lerp(pal["ink"], pal["mid"], 0.28)
    x = -20
    rects = []
    while x < W + 20:
        w = rng.randint(28, 90)
        h = rng.randint(int(H * 0.08), int(H * height * 0.5))
        d.rectangle([x, base - h, x + w, base], fill=col)
        sumi_hatch(d, x, base - h, x + w, base, rng, angle=8, spacing=11, alpha_base=18)
        rects.append((x, base - h, x + w, base))
        # window dots — warm ink brush circles
        for _ in range(max(1, (w * h) // 900)):
            wx = x + rng.randint(3, max(4, w - 6))
            wy = base - rng.randint(6, max(7, h - 4))
            if rng.random() < 0.5:
                al = int(rng.randint(80, 185) * tw(wx, wy, 0.7))
                r = 2 if rng.random() < 0.4 else 1
                d.ellipse([wx - r, wy - r, wx + r, wy + r],
                          fill=WARM + (al,))
        x += w + rng.randint(6, 26)


def ground(im, d, pal, y=.86):
    """Washi ground plane — dark ink wash with paper grain."""
    gy = int(H * y)
    d.rectangle([0, gy, W, H], fill=pal["ink"])
    # Faint warm pavement wash
    wash_rect(im, 0, gy, W, H, lerp(pal["ink"], (80, 60, 40), 0.18), 40, blur=6)
    # Ground grain streaks
    gd = ImageDraw.Draw(im, "RGBA")
    for _ in range(18):
        gx = random.randint(0, W)
        gd.line([(gx, gy + random.randint(2, H - gy - 2)),
                 (gx + random.randint(-40, 40), gy + random.randint(2, H - gy - 2))],
                fill=(255, 240, 200, random.randint(4, 14)), width=1)


def lamps(d, rng, n=4):
    """Street lamps — ink-line poles with warm ink wash glow haloes."""
    gy = int(H * 0.86)
    for i in range(n):
        x = int(W * (i + .5) / n) + rng.randint(-30, 30)
        # pole — tapered ink stroke
        d.line([(x, gy), (x - 1, gy - 56)], fill=(28, 26, 40), width=3)
        d.line([(x - 1, gy - 56), (x - 1, gy - 64)], fill=(28, 26, 40), width=2)
        # lamp cap — warm circle
        glow_a = int(220 * tw(x, gy, 0.6))
        d.ellipse([x - 5, gy - 74, x + 5, gy - 64],
                  fill=WARM + (glow_a,))
        # warm halo
        for r in (9, 14, 20):
            ha = glow_a // (r // 3 + 1)
            d.ellipse([x - r, gy - 74 - r // 2, x + r, gy - 64 + r // 2],
                      fill=WARM + (ha // 4,))


def people(d, rng, n=5):
    """Pedestrian silhouettes — soft ink brush strokes."""
    gy = int(H * 0.865)
    for _ in range(n):
        x = rng.randint(30, W - 30)
        h = rng.randint(14, 20)
        # body — tapered sumi stroke
        d.line([(x, gy), (x, gy - h)], fill=(14, 10, 22), width=3)
        # head — small filled ellipse
        d.ellipse([x - 3, gy - h - 5, x + 3, gy - h + 1],
                  fill=(14, 10, 22))


def viaduct(d, rng, y=.60, train=True, color=SHU):
    """Keikyu viaduct — ink structure with paper train body."""
    top = int(H * y)
    bh = 34
    # Girder body
    d.rectangle([0, top, W, top + bh], fill=(26, 24, 40))
    # Ink-hatch on viaduct face
    sumi_hatch(d, 0, top, W, top + bh, rng, angle=0, spacing=12, alpha_base=22)
    # Support columns
    for x in range(0, W, 90):
        d.rectangle([x + 30, top + bh, x + 44, int(H * 0.86)],
                    fill=(22, 20, 36))
        d.line([(x + 30, top + bh), (x + 30, int(H * 0.86))],
               fill=(14, 12, 24), width=1)

    if train:
        tx0 = rng.randint(80, W - 380)
        tx = int((tx0 + _T * (W + 460)) % (W + 460)) - 380
        # Train body — warm off-white washi
        d.rounded_rectangle([tx, top - 26, tx + 320, top - 2], 5,
                             fill=(238, 232, 218))
        # Colour band — painted with slight brush edge
        d.rectangle([tx, top - 26, tx + 320, top - 17], fill=color)
        d.line([(tx, top - 17), (tx + 320, top - 17)],
               fill=(200, 50, 42), width=1)
        # Windows — ink-bordered warm panes
        for wx in range(tx + 12, tx + 312, 32):
            d.rectangle([wx, top - 15, wx + 20, top - 5],
                        fill=(60, 80, 110))
            al = int(180 * tw(wx, top, 0.7))
            d.rectangle([wx + 1, top - 14, wx + 19, top - 6],
                        fill=WARM + (al,))
            d.line([(wx, top - 15), (wx + 20, top - 15),
                    (wx + 20, top - 5), (wx, top - 5), (wx, top - 15)],
                   fill=(20, 18, 30, 80), width=1)


def subway_mouth(d, x=.12, line_color=ROSE):
    """Subway entrance — ink architecture with line circle."""
    gx = int(W * x); gy = int(H * 0.86)
    d.rectangle([gx, gy - 44, gx + 120, gy], fill=(16, 14, 28))
    # Interior warm glow
    d.rectangle([gx + 8, gy - 36, gx + 112, gy - 8],
                fill=(255, 232, 190, 55))
    # Pillar
    d.rectangle([gx - 10, gy - 72, gx - 2, gy], fill=(36, 36, 52))
    # Line circle — clean ink ring with colour fill
    d.ellipse([gx - 16, gy - 88, gx + 4, gy - 68],
              outline=line_color, width=5)
    d.ellipse([gx - 13, gy - 85, gx + 1, gy - 71],
              fill=line_color + (60,))


def arcade(d, rng, x0=.30, x1=.98, lanterns=True):
    """Shōtengai arcade — ink roof, warm shop glow, swaying lanterns."""
    top = int(H * 0.55); base = int(H * 0.86)
    x0i = int(W * x0); x1i = int(W * x1)
    # Roof edge — ink-painted gabled fascia
    d.polygon([(x0i, top + 20), (x0i + int(W * 0.04), top),
               (x1i, top), (x1i, top + 20)], fill=(44, 36, 54))
    d.rectangle([x0i, top + 20, x1i, top + 28],
                fill=(190, 158, 108, 80))

    # Shop bays
    for x in range(x0i + 20, x1i - 10, 46):
        # Bay — dark ink fill with sumi texture
        d.rectangle([x, top + 30, x + 34, base], fill=(28, 24, 42))
        sumi_hatch(d, x, top + 30, x + 34, base, rng,
                   angle=0, spacing=16, alpha_base=14)
        # Shop glow — warm wash
        al = int(rng.randint(110, 210) * tw(x, top, 0.82))
        d.rectangle([x + 4, top + 44, x + 30, base - 8],
                    fill=WARM + (al,))
        # Ink window frame
        d.line([(x + 4, top + 44), (x + 30, top + 44),
                (x + 30, base - 8), (x + 4, base - 8), (x + 4, top + 44)],
               fill=(16, 12, 26, 90), width=1)

        if lanterns and rng.random() < 0.62:
            # Lantern — swaying with sumi outline, warm inner glow
            sway = 3.2 * math.sin(2 * math.pi * (_T + ph(x, top)))
            lx = x + 17 + sway; ly = top + 32
            # Lantern body
            d.ellipse([lx - 8, ly, lx + 8, ly + 20],
                      fill=(240, 112, 82, 220))
            d.ellipse([lx - 6, ly + 2, lx + 6, ly + 18],
                      fill=(255, 200, 160, 180))
            # Ink outline
            d.ellipse([lx - 8, ly, lx + 8, ly + 20],
                      outline=(30, 14, 10, 160), width=1)
            # Top/bottom cap marks
            d.line([(lx - 5, ly), (lx + 5, ly)],
                   fill=(30, 14, 10, 140), width=2)
            d.line([(lx - 4, ly + 20), (lx + 4, ly + 20)],
                   fill=(30, 14, 10, 120), width=2)
            # Hanging cord
            d.line([(lx, top + 28), (lx, ly)],
                   fill=(30, 28, 44, 180), width=1)


def canal(d, rng, y=.72, boats=2, nets=False):
    """Canal — ink water with warm oil-lamp reflections, painted boats."""
    top = int(H * y)
    # Water body — dark indigo wash
    d.rectangle([0, top, W, int(H * 0.86)], fill=(26, 38, 60))

    # Reflection ripples — organic painted dashes
    for _ in range(70):
        x0 = rng.randint(0, W)
        yy = rng.randint(top + 4, int(H * 0.85))
        ln = rng.randint(4, 22)
        col = WARM if rng.random() < 0.5 else COOL
        al = int(rng.randint(30, 100) * tw(x0, yy, 0.40))
        # Slight horizontal drift animated
        x = (x0 + _T * 50) % W
        # Wavy ripple via small y offset at midpoint
        mid = x + ln // 2
        ymid = yy + rng.randint(-2, 2)
        d.line([(x, yy), (mid, ymid), (x + ln, yy)],
               fill=col + (int(al),), width=1)

    # Boats — ink silhouettes with faint brushed masts
    for i in range(boats):
        bx = rng.randint(40, W - 160); by = top + rng.randint(8, 26)
        # Hull — ink wash polygon
        d.polygon([(bx, by + 14), (bx + 12, by),
                   (bx + 110, by), (bx + 122, by + 14)],
                  fill=(18, 18, 32))
        # Mast — ink stroke
        d.line([(bx + 30, by), (bx + 30, by - 28)],
               fill=(16, 16, 28), width=2)
        if nets:
            # Net lines — fine ink thread
            for nh in range(3):
                d.line([(bx + 30, by - 28 + nh * 10),
                        (bx + 90, by - 2 + nh * 5)],
                       fill=(55, 58, 74, 160), width=1)


def temple(d, x=.62, scale=1.0, cedars=True):
    """Temple/shrine roof — layered ink silhouettes with paper grain."""
    cx = int(W * x); base = int(H * 0.62)
    w = int(240 * scale); rh = int(70 * scale)
    # Main roof — dark ink polygon with slight warm edge
    d.polygon([(cx - w // 2, base), (cx, base - rh), (cx + w // 2, base)],
              fill=(24, 20, 36))
    d.polygon([(cx - w // 2 - 18, base + 2),
               (cx - w // 2 + 30, base - 18),
               (cx + w // 2 - 30, base - 18),
               (cx + w // 2 + 18, base + 2)],
              fill=(30, 26, 42))
    # Body
    d.rectangle([cx - w // 3, base, cx + w // 3, base + int(56 * scale)],
                fill=(20, 18, 32))
    # Warm doorway glow
    al = int(160 * tw(cx, base, 0.5))
    d.rectangle([cx - 9, base + 10, cx + 9, base + int(56 * scale)],
                fill=WARM + (al,))
    # Ink roof edge lines
    d.line([(cx - w // 2, base), (cx, base - rh)], fill=(12, 10, 20, 140), width=1)
    d.line([(cx + w // 2, base), (cx, base - rh)], fill=(12, 10, 20, 140), width=1)

    if cedars:
        for tx in (cx - w, cx - w // 2 - 60, cx + w // 2 + 60, cx + w):
            # Cedar silhouette — tapered ink triangle
            d.polygon([(tx, int(H * 0.70)), (tx - 28, int(H * 0.70)),
                       (tx - 14, int(H * 0.37))], fill=(16, 24, 28))
            # Slight sumi texture
            d.line([(tx - 14, int(H * 0.37)), (tx - 14, int(H * 0.70))],
                   fill=(12, 20, 24, 100), width=1)


def torii(d, x=.18, scale=1.0):
    """Torii gate — vermillion ink."""
    cx = int(W * x); base = int(H * 0.70)
    h = int(90 * scale); w = int(90 * scale)
    c = (188, 56, 46)  # deeper vermillion
    d.rectangle([cx - w // 2, base - h, cx - w // 2 + 10, base], fill=c)
    d.rectangle([cx + w // 2 - 10, base - h, cx + w // 2, base], fill=c)
    d.rectangle([cx - w // 2 - 14, base - h, cx + w // 2 + 14, base - h + 10], fill=c)
    d.rectangle([cx - w // 2 - 4, base - h + 18, cx + w // 2 + 4, base - h + 26], fill=c)
    # Ink outlines on torii
    d.rectangle([cx - w // 2 - 14, base - h, cx + w // 2 + 14, base - h + 10],
                outline=(30, 14, 10, 120), width=1)


def towers(d, rng, x0=.55, n=5, tall=.55):
    """Tower block silhouettes — ink wash with warm-windowed facades."""
    base = int(H * 0.86)
    for i in range(n):
        x = int(W * x0) + i * rng.randint(60, 90)
        w = rng.randint(44, 70)
        h = rng.randint(int(H * tall * 0.6), int(H * tall))
        d.rectangle([x, base - h, x + w, base], fill=(24, 28, 46))
        sumi_hatch(d, x, base - h, x + w, base, rng,
                   angle=6, spacing=13, alpha_base=16)
        # Windows — scattered ink-framed warm panes
        for wy in range(base - h + 8, base - 8, 12):
            for wx in range(x + 5, x + w - 6, 11):
                if rng.random() < 0.42:
                    al = int(rng.randint(60, 180) * tw(wx, wy, 0.78))
                    d.rectangle([wx, wy, wx + 5, wy + 4],
                                fill=WARM + (al,))


def terminal(d, rng, x=.30, wide=.42):
    """Station terminal — broad ink mass with warm hall windows."""
    base = int(H * 0.86)
    x0 = int(W * x); x1 = x0 + int(W * wide)
    d.rectangle([x0, int(H * 0.58), x1, base], fill=(22, 26, 42))
    sumi_hatch(d, x0, int(H * 0.58), x1, base, rng,
               angle=0, spacing=18, alpha_base=12)
    d.rectangle([x0 + 10, int(H * 0.62), x1 - 10, int(H * 0.70)],
                fill=WARM + (120,))
    d.rectangle([x0 + 10, int(H * 0.74), x1 - 10, base - 8],
                fill=(255, 236, 195, 45))
    # Ink mullion lines on hall windows
    for mx in range(x0 + 20, x1 - 10, 30):
        d.line([(mx, int(H * 0.62)), (mx, int(H * 0.70))],
               fill=(16, 14, 28, 70), width=1)


def industry(d, rng, tanks=3, cranes=2, stacks=2):
    """Industrial silhouettes — ink tanks, cranes, blinking chimney stacks."""
    base = int(H * 0.86)
    for i in range(tanks):
        x = rng.randint(40, W - 140); r = rng.randint(30, 46)
        d.ellipse([x, base - r, x + r * 2, base + r // 2], fill=(28, 28, 42))
        d.rectangle([x, base - r // 2, x + r * 2, base], fill=(28, 28, 42))
        d.ellipse([x, base - r, x + r * 2, base + r // 2],
                  outline=(16, 14, 26, 100), width=1)
    for i in range(cranes):
        x = rng.randint(60, W - 100); h = rng.randint(70, 120)
        d.line([(x, base), (x, base - h)], fill=(24, 24, 38), width=5)
        d.line([(x, base - h), (x + 90, base - h + 26)],
               fill=(24, 24, 38), width=4)
        d.line([(x, base - h), (x + 90, base - h + 26)],
               fill=(18, 18, 30, 140), width=1)
    for i in range(stacks):
        x = rng.randint(80, W - 80); h = rng.randint(90, 150)
        d.rectangle([x, base - h, x + 14, base], fill=(26, 24, 38))
        blink_phase = (_T * 2 + ph(x, h)) % 1.0
        blink_al = 255 if blink_phase < 0.55 else 60
        d.ellipse([x + 3, base - h - 7, x + 11, base - h + 2],
                  fill=(255, 72, 62, blink_al))


def levee(d, rng):
    """River levee — ink water with warm ripple reflections and silhouettes."""
    d.rectangle([0, int(H * 0.70), W, int(H * 0.78)], fill=(28, 42, 66))
    for _ in range(50):
        x0 = rng.randint(0, W)
        yy = rng.randint(int(H * 0.70) + 3, int(H * 0.77))
        ln = rng.randint(6, 22)
        al = int(rng.randint(24, 84) * tw(x0, yy, 0.45))
        x = (x0 + _T * 38) % W
        d.line([(x, yy), (x + ln, yy)],
               fill=WARM + (int(al),), width=1)
    d.polygon([(0, int(H * 0.86)), (W, int(H * 0.86)),
               (W, int(H * 0.78)), (0, int(H * 0.80))],
              fill=(20, 32, 28))
    for i in range(4):
        x = rng.randint(60, W - 60)
        d.line([(x - 8, int(H * 0.81)), (x + 8, int(H * 0.81))],
               fill=(10, 10, 18), width=3)
        d.ellipse([x - 2, int(H * 0.796), x + 2, int(H * 0.807)],
                  fill=(10, 10, 18))


def ferris(d, x=.84, r=70):
    """Minato Mirai ferris wheel — ink ring with warm gondolas."""
    cx = int(W * x); cy = int(H * 0.48)
    # Outer ring
    d.ellipse([cx - r, cy - r, cx + r, cy + r],
              outline=(110, 152, 206), width=3)
    rot = _T * 60.0
    for a in range(0, 360, 30):
        px = cx + r * math.cos(math.radians(a + rot))
        py = cy + r * math.sin(math.radians(a + rot))
        d.line([(cx, cy), (px, py)], fill=(110, 152, 206), width=1)
        # Gondola — warm ellipse
        d.ellipse([px - 5, py - 5, px + 5, py + 5],
                  fill=(240, 118, 98, 200))
        d.ellipse([px - 5, py - 5, px + 5, py + 5],
                  outline=(30, 14, 10, 100), width=1)


def plane(d, x=.8, y=.16):
    """Aircraft silhouette — ink wash with warm fuselage."""
    px = int(W * x - 40 + _T * 80); py = int(H * y)
    d.polygon([(px, py), (px + 34, py + 6), (px, py + 12)],
              fill=(216, 220, 234))
    d.ellipse([px + 30, py + 2, px + 36, py + 8],
              fill=(255, 110, 92))


def grain_vignette(im, rng):
    """Washi grain + edge vignette pass."""
    # Grain (darker speckling for washi texture)
    g = Image.new("L", (W, H))
    g.putdata([rng.randint(0, 32) for _ in range(W * H)])

    # Composite grain as subtle dark speckling
    grain_rgba = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grain_rgba)
    pixels_rgba = []
    for v in g.getdata():
        pixels_rgba.append((8, 6, 14, v))
    grain_rgba.putdata(pixels_rgba)
    im = im.convert("RGBA")
    im = Image.alpha_composite(im, grain_rgba)
    im = im.convert("RGB")

    # Vignette — soft oval edge darkening
    vig = Image.new("L", (W, H), 0)
    dv = ImageDraw.Draw(vig)
    dv.ellipse([-W * 0.28, -H * 0.45, W * 1.28, H * 1.45], fill=255)
    vig = vig.filter(ImageFilter.GaussianBlur(72))
    black = Image.new("RGB", (W, H), (6, 4, 12))
    return Image.composite(im, black, vig.point(lambda v: 195 + v // 5))


# ---------- station recipes: elements = documented place facts ----------
R = [
 ("ningyocho","shitamachi", ["subway","arcade_lan"], "low-rise shitamachi lanes · Amazake Yokochō shop glow · Hibiya/Asakusa subway mouth",
   lambda d,rng: (far_skyline(d,rng,PAL["shitamachi"],.30,10), arcade(d,rng,.34,.98), subway_mouth(d,.10,ROSE))),
 ("nihombashi","core", ["towers","subway"], "office-canyon towers · expressway-era canyon · kilometer-zero core",
   lambda d,rng: (towers(d,rng,.06,9,.62), subway_mouth(d,.80,ROSE))),
 ("takaracho","core", ["towers","subway"], "quiet office seam · gallery-block mid-rises",
   lambda d,rng: (far_skyline(d,rng,PAL["core"],.5,12), towers(d,rng,.55,4,.5), subway_mouth(d,.12,ROSE))),
 ("hgashiginza","core", ["theater","arcade_lan"], "Kabukiza-scale theater roofline · Ginza-edge glow · Tsukiji lanterns",
   lambda d,rng: (far_skyline(d,rng,PAL["core"],.5,10), temple(d,.30,1.2,False), arcade(d,rng,.60,.98))),
 ("shimbashi","core", ["viaduct","izakaya"], "girder viaduct · izakaya lanterns beneath the tracks",
   lambda d,rng: (far_skyline(d,rng,PAL["core"],.55,12), viaduct(d,rng,.52,True,(90,162,82)), arcade(d,rng,.05,.95))),
 ("daimon","core", ["temple","tower"], "Zōjō-ji gate + Tokyo Tower silhouette pairing",
   lambda d,rng: (far_skyline(d,rng,PAL["core"],.4,8), temple(d,.34,1.3),
    d.polygon([(int(W*.76),int(H*.62)),(int(W*.80),int(H*.10)),(int(W*.84),int(H*.62))], fill=(148,56,48)),
    d.line([(int(W*.80),int(H*.10)),(int(W*.80),int(H*.62))], fill=(255,110,88), width=2))),
 ("mita","core", ["slope","campus"], "campus block + embassy slope greens",
   lambda d,rng: (far_skyline(d,rng,PAL["core"],.5,10), towers(d,rng,.08,3,.45), temple(d,.70,.8,True))),
 ("sengakuji","core", ["temple","towers"], "Sengakuji temple gate · new Takanawa towers behind",
   lambda d,rng: (towers(d,rng,.60,5,.62), temple(d,.24,1.1))),
 ("shinagawa","core", ["terminal","shinkansen"], "mega-terminal glass + a shinkansen streak",
   lambda d,rng: (far_skyline(d,rng,PAL["core"],.6,12), terminal(d,rng,.22,.56),
    d.rounded_rectangle([int(W*.10),int(H*.44),int(W*.52),int(H*.47)],4,fill=(232,236,244)),
    d.rectangle([int(W*.10),int(H*.44),int(W*.52),int(H*.452)],fill=(26,60,146)))),
 ("kitashina","shitamachi", ["machiya","canal"], "old-Tōkaidō machiya lane · canal mouth",
   lambda d,rng: (far_skyline(d,rng,PAL["shitamachi"],.35,8), arcade(d,rng,.08,.72,False), canal(d,rng,.76,1))),
 ("shimbamba","shitamachi", ["shrine","arcade_lan"], "Shinagawa shrine hill + working shōtengai",
   lambda d,rng: (temple(d,.16,.9), arcade(d,rng,.40,.98))),
 ("aomono","shitamachi", ["arcade_lan","viaduct"], "arcade crossroads under the Keikyu viaduct",
   lambda d,rng: (viaduct(d,rng,.50), arcade(d,rng,.06,.96))),
 ("samezu","bay", ["canal","boats"], "boat basin water · sculling club masts",
   lambda d,rng: (far_skyline(d,rng,PAL["bay"],.35,8), canal(d,rng,.66,3,True))),
 ("tachiaigawa","bay", ["boats","statue"], "fishing boats at the river mouth · Ryōma-quarter lanes",
   lambda d,rng: (far_skyline(d,rng,PAL["bay"],.35,8), canal(d,rng,.68,3,True), torii(d,.90,.7))),
 ("omorikaigan","bay", ["monorail","park"], "bayside park edge · monorail beam · aquarium quarter",
   lambda d,rng: (far_skyline(d,rng,PAL["bay"],.4,9), viaduct(d,rng,.56,False), canal(d,rng,.74,1), plane(d,.86,.14))),
 ("heiwajima","industry", ["logistics","onsen"], "reclaimed-island big-boxes · 24h onsen chimney · keirin bowl",
   lambda d,rng: (industry(d,rng,2,2,1), terminal(d,rng,.55,.30), plane(d,.90,.12))),
 ("omorimachi","shitamachi", ["arcade_lan","sento"], "low shōtengai + sentō chimney",
   lambda d,rng: (arcade(d,rng,.10,.80),
    d.rectangle([int(W*.86),int(H*.40),int(W*.885),int(H*.86)], fill=(28,26,40)))),
 ("umeyashiki","shitamachi", ["arcade_lan","plum"], "garden-pace shōtengai · plum-park remnant",
   lambda d,rng: (arcade(d,rng,.06,.86), temple(d,.93,.55,True))),
 ("kamata","shitamachi", ["viaduct","gyoza","onsen"], "junction viaduct + gyōza-alley steam + kuroyu sentō sign",
   lambda d,rng: (viaduct(d,rng,.50), arcade(d,rng,.05,.97), plane(d,.88,.10))),
 ("zoshiki","shitamachi", ["arcade_lan"], "the kilometre-long covered shōtengai itself",
   lambda d,rng: (far_skyline(d,rng,PAL["shitamachi"],.3,7), arcade(d,rng,.02,.98))),
 ("rokugodote","river", ["levee","bridge"], "Tama levee grass · river glint · Rokugō bridge line",
   lambda d,rng: (far_skyline(d,rng,PAL["river"],.3,7), levee(d,rng), viaduct(d,rng,.62,True))),
 ("kawasaki","industry", ["terminal","cinema","factory_glow"], "terminal towers · cinema-city glow · factory horizon",
   lambda d,rng: (industry(d,rng,2,1,2), towers(d,rng,.30,5,.60), terminal(d,rng,.06,.24))),
 ("hatcho","industry", ["junction","poem"], "branch-line junction platform · borderland low-rise",
   lambda d,rng: (far_skyline(d,rng,PAL["industry"],.35,9), viaduct(d,rng,.58,True), subway_mouth(d,.80,(255,214,0)))),
 ("ichiba","shitamachi", ["market","milestone"], "old market street · ichirizuka milestone mound",
   lambda d,rng: (arcade(d,rng,.10,.84,False), temple(d,.92,.5,True))),
 ("tsurumi","shitamachi", ["okinawa","towers"], "Okinawa-town lanterns on Nakadōri · twin-station towers",
   lambda d,rng: (towers(d,rng,.62,4,.55), arcade(d,rng,.04,.58))),
 ("kagetsu","shitamachi", ["zen","cedars"], "Sōji-ji cedar forest + great temple roof",
   lambda d,rng: (temple(d,.50,1.6,True),)),
 ("namamugi","industry", ["brewery","fishmarket"], "brewery tanks · dawn fish-market sheds · freight edge",
   lambda d,rng: (industry(d,rng,4,1,1), canal(d,rng,.76,2,True))),
 ("shinkoyasu","industry", ["towers","bay"], "tower-and-highway stack · bay-bridge sightline",
   lambda d,rng: (industry(d,rng,1,2,1), towers(d,rng,.08,4,.62), canal(d,rng,.78,0))),
 ("koyasu","bay", ["fishing","canal"], "the working fishing-boat canal — masts, nets, sheds",
   lambda d,rng: (far_skyline(d,rng,PAL["bay"],.3,6), canal(d,rng,.60,4,True))),
 ("shimmachi","shitamachi", ["depot"], "Keikyu depot rows — stabled vermillion trains",
   lambda d,rng: (far_skyline(d,rng,PAL["shitamachi"],.3,7), viaduct(d,rng,.66,True), viaduct(d,rng,.58,True))),
 ("hkanagawa","core", ["seam","legend"], "two-terminal seam · Urashima-legend lanes",
   lambda d,rng: (far_skyline(d,rng,PAL["core"],.45,10), terminal(d,rng,.60,.26), torii(d,.14,.8))),
 ("kanagawa","core", ["postroad","portside"], "Kanagawa-juku post-road slope · Portside towers north",
   lambda d,rng: (towers(d,rng,.66,4,.6), arcade(d,rng,.06,.52,False))),
 ("yokohama","bay", ["terminal","ferris","harbor"], "five-line terminal · Minato Mirai ferris glow · harbor air",
   lambda d,rng: (towers(d,rng,.05,6,.66), ferris(d,.84,74), terminal(d,rng,.30,.34), canal(d,rng,.80,1))),
]


def build(station, palname, tags, matched, painter, seed=7):
    rng = random.Random(hash(station) & 0xffff | seed)
    pal = PAL[palname]
    im = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(im, "RGBA")
    # Paper sky — wash replaces flat gradient
    wash_sky(im, d, pal, rng)
    stars(d, rng)
    painter(d, rng)
    ground(im, d, pal)
    lamps(d, rng)
    people(d, rng, rng.randint(3, 7))
    paper_grain(im, rng)
    im = grain_vignette(im, rng)
    p = os.path.join(OUT, f"{station}.png")
    im.save(p, "PNG")
    return p


def sha(p):
    with open(p, "rb") as f: return hashlib.sha256(f.read()).hexdigest()


def manifest(station, png, matched, method_extra=""):
    st_png = os.path.basename(png)
    m = {
        "asset_id": f"kanto-{station}-area-essence-v1",
        "area_key": station,
        "state": "SYNTHETIC",
        "display_label": "Area essence — synthetic editorial illustration, not a photograph, not this home",
        "card_label": "SYNTHETIC · area essence 想像図",
        "detail_label": "SYNTHETIC · area essence — editorial illustration of the station area's documented typology · not a photograph · not any specific building",
        "generated_at": "2026-09-02",
        "generator": "washi/sumi paper procedural scene (PIL r9)" + method_extra + "; adapter is replaceable (StreamDiffusion / OpenAI per docs/VISUAL_PROXIMITY_PIPELINE.md)",
        "method": "procedural composition from documented place facts; paper aesthetic: wash sky, sumi hatching, washi grain, ink outlines" + (" + SD-Turbo img2img strength 0.30 texture pass (StreamDiffusion family)" if method_extra else ""),
        "output": {"local_path": f"kanto/essence/{st_png}", "format": st_png.split('.')[-1].upper(), "width_px": W, "height_px": H, "sha256": sha(png)},
        "visual_proximity": {
            "status": "AREA_TYPOLOGY_EDITORIAL",
            "grade": "NOT SCORED",
            "score_basis": "no exact-address reference used; scene elements are drawn only from documented area facts listed in matched_attributes; stylized washi/sumi register chosen deliberately — without ground-truth photos, illustration carries lower expectation error than photorealism",
            "matched_attributes": [s.strip() for s in matched.split("·")],
            "not_asserted": ["any specific building or storefront", "current condition", "season or weather", "exact geometry or distances"],
        },
        "expectation_contract": [
            "The essence is synthetic and labeled at every display surface.",
            "It illustrates the station area's documented typology, never a listable property.",
            "The floor-plan glyph remains the property-level hero; the essence is context only.",
            "A StreamDiffusion/OpenAI reference-informed upgrade replaces this asset through the same manifest contract (render queue).",
        ],
    }
    with open(os.path.join(OUT, f"{station}.json"), "w") as f:
        json.dump(m, f, ensure_ascii=False, indent=1)
    return m


FRAMES, FPS = 36, 12


def build_frame(station, palname, painter, t):
    global _T
    _T = t
    rng = random.Random(hash(station) & 0xffff | 7)
    pal = PAL[palname]
    im = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(im, "RGBA")
    wash_sky(im, d, pal, rng)
    stars(d, rng)
    painter(d, rng)
    ground(im, d, pal)
    lamps(d, rng)
    people(d, rng, rng.randint(3, 7))
    paper_grain(im, random.Random(int(t * 9973)))  # per-frame grain variation
    im = grain_vignette(im, random.Random(int(t * 9973)))
    _T = 0.0
    return im


def build_anim(station, palname, painter):
    frames = [build_frame(station, palname, painter, i / FRAMES) for i in range(FRAMES)]
    p = os.path.join(OUT, f"{station}_live.webp")
    frames[0].save(p, "WEBP", save_all=True, append_images=frames[1:],
                   duration=int(1000 / FPS), loop=0, quality=64, method=4)
    return p


def add_anim_manifest(station, path):
    mp = os.path.join(OUT, f"{station}.json")
    m = json.load(open(mp))
    m["animated_output"] = {
        "local_path": f"kanto/essence/{station}_live.webp", "format": "WEBP_ANIM",
        "frames": FRAMES, "fps": FPS, "loop": True, "sha256": sha(path),
        "note": "same scene, ambient motion only — a train passing, lantern sway, canal shimmer, star twinkle; motion is editorial texture and claims no event",
    }
    json.dump(m, open(mp, "w"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    only = sys.argv[sys.argv.index("--only") + 1].split(",") if "--only" in sys.argv else None
    anim = "--anim" in sys.argv
    made = []
    for station, palname, tags, matched, painter in R:
        if only and station not in only: continue
        if anim:
            p = build_anim(station, palname, painter)
            add_anim_manifest(station, p)
        else:
            p = build(station, palname, tags, matched, painter)
            manifest(station, p, matched)
        made.append(station)
    print(("animated " if anim else "built ") + f"{len(made)}: {', '.join(made)}")
