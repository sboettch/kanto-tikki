#!/usr/bin/env python3
"""HomeTikki KANTO — SD-Turbo diffusion texture pass (Round 9 · MPS / washi edition).

Why the procedural base matters
────────────────────────────────
The Kosmos PIL base is NOT optional decoration. At strength=0.35, the diffusion
can only modify ~35% of the image — the procedural scene constrains:
  · Where the horizon sits, where buildings and ground are
  · Which scene elements appear (arcade vs canal vs viaduct) — tied to
    documented place facts (the recipe's `matched` list)
  · The honesty contract: output reflects each station's real typology

The diffusion pass adds what PIL can't: painterly texture, soft ink bleeds,
watercolour sky variation, photographic warmth — without inventing a different
scene. Together they give "Luminous paper theater", not "generic dark Tokyo".

Style system (from kokogarden Kosmos project)
─────────────────────────────────────────────
  "Luminous Kyojima / Koganecho paper theater — layered washi, cut cardboard,
   fine sumi linework, restrained woodblock color separation, origami-influenced
   folds; meticulous sumi linework with restrained woodblock color separation
   over visibly fibrous washi; indie Japanese architectural sketchbook,
   visibly handmade"

Negative: documentary pretense, ruin-porn, blocky metaverse styling,
          private-interior invention, generic cyberpunk Japan, neon.

Usage
─────
  python3 essence_diffuse.py                    # all stations
  python3 essence_diffuse.py --only ningyocho,yokohama
  python3 essence_diffuse.py --strength 0.30    # override strength
  python3 essence_diffuse.py --steps 3          # override steps
"""
import argparse, hashlib, json, os, sys, time
from PIL import Image

HERE    = os.path.dirname(os.path.abspath(__file__))
SRC     = os.path.join(HERE, "essence")

# ── generation parameters ────────────────────────────────────────────────────
STRENGTH    = 0.35   # geometry preservation vs texture freedom (0.30 = safe, 0.35 = richer)
STEPS       = 4      # SD-Turbo is designed for 1–4; 4 = best quality
WORK_W      = 1024   # native resolution (MPS can handle it; CPU fallback still fine)
WORK_H      = 384

# ── style suffix (from kokogarden Kosmos style system) — kept tight for CLIP ─
# CLIP max = 77 tokens. Per-station scene ≈ 30–40 tokens + this suffix ≈ 20.
STYLE = (
    "washi paper texture, sumi ink linework, woodblock color, "
    "indigo ochre watercolour dusk sky, paper theater, Japanese sketchbook"
)

NEG = (
    "photo, photorealistic, 3d, cgi, neon, anime, watermark, text, "
    "generic cyberpunk japan, ruin, daytime, faces, modern stock photo"
)

# ── per-station prompts (place facts → scene brief → style) ─────────────────
# Structure: "<documented typology> · dusk · <style>"
# Each references only publicly documented area character (matched attributes).
PROMPTS = {
    "ningyocho":   "shitamachi shotengai arcade, red lanterns glowing amber, subway entrance pink marker, dark street warm shop light",
    "nihombashi":  "office canyon towers dusk, expressway flyover, pinpoint window lights, indigo sky above concrete canyon",
    "takaracho":   "quiet Ginza-edge mid-rises, soft amber windows, underground line marker glow, indigo dusk",
    "hgashiginza": "Kabukiza pagoda roofline dusk, lantern arcade glow, Tsukiji amber lights, warm ochre horizon",
    "shimbashi":   "rail viaduct girders dusk, izakaya lanterns beneath tracks, warm shop glow, train streak overhead",
    "daimon":      "Zojoji temple gate dusk, Tokyo Tower vermillion lattice right, cedar trees, warm amber doorway",
    "mita":        "campus block dusk, embassy slope trees, tower silhouettes, cedar trees, quiet blue-hour",
    "sengakuji":   "Sengakuji temple gate dusk, Takanawa towers behind, cedar roofline, deep indigo sky",
    "shinagawa":   "mega-terminal glass concourse dusk, amber hall windows, shinkansen streak, tower silhouettes",
    "kitashina":   "machiya lane dusk, low traditional rooflines, canal boat silhouette, warm amber shop fronts",
    "shimbamba":   "shrine hilltop silhouette left, shotengai arcade right, warm lanterns, indigo dusk",
    "aomono":      "shotengai arcade under Keikyu viaduct, vermillion train above, lanterns glowing, amber pavement",
    "samezu":      "working boat basin dusk, mast silhouettes, dark water warm reflections, low shitamachi skyline",
    "tachiaigawa": "fishing boats river mouth, mast silhouettes, vermillion torii right, dark water reflections",
    "omorikaigan": "bayside park edge dusk, monorail beam silhouette, water ripples, aircraft red light",
    "heiwajima":   "industrial island silhouettes, storage tanks, cranes, blinking chimney, aircraft, indigo horizon",
    "omorimachi":  "low shotengai dusk, amber shop glow arcade, sento chimney silhouette right",
    "umeyashiki":  "garden shotengai dusk, warm lanterns, temple silhouette cedar trees right, quiet indigo",
    "kamata":      "junction viaduct dusk, vermillion Keikyu train overhead, gyoza steam, warm arcade lanterns",
    "zoshiki":     "kilometre shotengai arcade tunnel, amber shop glow depth, roof silhouette, indigo sky beyond",
    "rokugodote":  "Tama river levee dusk, river glint, bridge viaduct red train, ochre horizon, fisherman silhouette",
    "kawasaki":    "station towers dusk, cinema amber glow, factory chimneys, blinking stacks, city glow indigo",
    "hatcho":      "branch-line junction platform dusk, low-rise silhouettes, yellow subway marker, red train viaduct",
    "ichiba":      "old market street dusk, cedar milestone mound right, amber shop glow, quiet shitamachi",
    "tsurumi":     "Okinawa lanterns Nakadori dusk, twin towers right, warm amber arcade left",
    "kagetsu":     "Sojiji temple enormous roof dusk, cedar forest, deep indigo sky, amber doorway, zen stillness",
    "namamugi":    "brewery tanks dusk, fish-market sheds, canal masts nets, dark freight waterfront indigo",
    "shinkoyasu":  "tower highway stack dusk, bay-bridge sightline, canal below, cranes, ochre horizon",
    "koyasu":      "fishing boat canal dusk, masts net poles, dark water reflections, low shitamachi, blue-gray",
    "shimmachi":   "Keikyu depot vermillion trains two viaducts dusk, depot silhouettes, shitamachi indigo sky",
    "hkanagawa":   "two-terminal seam dusk, torii left, terminal right, layered silhouettes, ochre horizon",
    "kanagawa":    "post-road slope dusk, Portside towers right, old arcade lane left, blue-hour calm",
    "yokohama":    "Minato Mirai ferris wheel glowing right, harbor towers, terminal amber windows, dark water reflections",
    # ── 17 local pockets ──
    "pk_amazake":    "shitamachi lane, glowing red paper lanterns, cedar machiya shopfronts, sweet sake wooden counter, warm amber dusk",
    "pk_hamacho":    "Sumida river terrace, Kiyosu suspension bridge silhouette, morning water ripples, willow trees, warm indigo sky",
    "pk_ginzaeast":  "Kabukiza theater tiled gables, Ginza neon spill, quiet print shop alley, amber window glow, dusk",
    "pk_shimbamba":  "Shinagawa shrine cedar slope, stone torii gate, fuji-zuka mound silhouette, old Tokaido post road machiya",
    "pk_tennozu":    "harbor loft brick warehouses, wooden canal boardwalk, craft brewery lights, water reflection dusk",
    "pk_tachiai":    "wooden fishing skiffs moored in tidal creek, Sakamoto Ryoma statue silhouette, morning sea breeze light",
    "pk_umeyashiki": "quiet residential machiya back grid, plum branches, tall sento brick chimney, laundry lines, twilight",
    "pk_kamataeast": "bustling gyoza alley steam, dense red glowing lanterns, vibrant retro shotengai, evening izakaya warmth",
    "pk_rokugo":     "wide grassy Tama river embankment, open tidal water, iron railway bridge span, twilight horizon",
    "pk_daishi":     "Kawasaki Daishi five-story pagoda silhouette, daruma prayer flags, temple street lantern glow, candy stalls",
    "pk_nakadori":   "Okinawa town palm silhouettes along canal, Ryukyu red-tiled eaves, festive sanshin bar paper lanterns",
    "pk_koyasu":     "weathered wooden stilt shacks over tidal canal, plank walkways, moored skiffs, fishing nets",
    "pk_kagurazaka": "sloping stone steps ishidatami, black cedar geisha walls, glowing paper lanterns, chic bistro awnings",
    "pk_kyojima":    "Kirakira Tachibana covered arcade, narrow post-war wooden alleys, glowing Tokyo Skytree spire in dusk sky",
    "pk_koganecho":  "Keikyu railway viaduct arches artist studios, riverbank willow promenade, Ooka river reflections",
    "pk_minatomirai":"Cosmo Clock illuminated ferris wheel, Landmark Tower skyline, coastal wooden boardwalk, harbor water glow",
    "pk_noge":       "retro neon drinking alleys under cliff, jazz club signs, red paper lanterns, vibrant yokocho warmth",
}


def load_pipe(model_id="stabilityai/sd-turbo"):
    import torch
    from diffusers import AutoPipelineForImage2Image

    device = (
        "mps"   if torch.backends.mps.is_available() else
        "cuda"  if torch.cuda.is_available()         else
        "cpu"
    )
    dtype = torch.float16 if device in ("mps", "cuda") else torch.float32
    print(f"  loading {model_id} → {device} ({dtype})")
    pipe = AutoPipelineForImage2Image.from_pretrained(
        model_id, torch_dtype=dtype, variant="fp16" if device != "cpu" else None,
        use_safetensors=True,
    )
    pipe.to(device)
    pipe.set_progress_bar_config(disable=True)
    return pipe, device


def _diffuse(pipe, base, station, strength, steps):
    """Single diffusion pass → PIL Image."""
    place_prompt = PROMPTS.get(station, "quiet Japanese shitamachi street at dusk")
    full_prompt = f"{place_prompt}, {STYLE}"
    out = pipe(
        prompt=full_prompt,
        negative_prompt=NEG,
        image=base,
        strength=strength,
        num_inference_steps=steps,
        guidance_scale=0.0,
    ).images[0]
    return out.resize((WORK_W, WORK_H), Image.LANCZOS)


def _horizon_mask(w, h, horizon_frac=0.58, feather=0.18):
    """Soft vertical gradient mask (white = sky zone / use hi-strength,
    black = ground zone / use lo-strength). Sigmoid-blended at horizon.
    horizon_frac: where sky ends as fraction of image height (0.58 = 58% down).
    feather: blend band width as fraction of height.
    """
    import math
    mask = Image.new("L", (w, h))
    pixels = []
    for y in range(h):
        t = (y / h - horizon_frac) / feather   # -∞…0 = sky, 0…+∞ = ground
        sig = 1.0 / (1.0 + math.exp(-t * 6))   # sigmoid: 0=sky(white), 1=ground(black)
        v = int((1.0 - sig) * 255)              # sky → 255 (keep hi), ground → 0 (keep lo)
        pixels.append(v)
    # Spread each row value across the width
    mask_arr = []
    for y in range(h):
        v = pixels[y]
        mask_arr.extend([v] * w)
    mask.putdata(mask_arr)
    return mask


def run(pipe, station, strength_lo, steps_lo, strength_hi, steps_hi):
    """Dual-pass fuse:
      pass A (lo) — geometry-safe, landmarks preserved  → foreground zone
      pass B (hi) — richer texture/atmosphere           → sky zone
    Blended with a soft horizon gradient mask.
    """
    src = os.path.join(SRC, f"{station}.png")
    if not os.path.exists(src):
        print(f"  ✗ {station}: no base PNG found — run essence_gen.py first")
        return None

    base = Image.open(src).convert("RGB").resize((WORK_W, WORK_H), Image.LANCZOS)

    t0 = time.time()
    img_lo = _diffuse(pipe, base, station, strength_lo, steps_lo)   # geometry-faithful
    img_hi = _diffuse(pipe, base, station, strength_hi, steps_hi)   # richer sky

    # Sky/ground composite: hi-strength sky + lo-strength foreground
    mask = _horizon_mask(WORK_W, WORK_H, horizon_frac=0.58, feather=0.20)
    fused = Image.composite(img_hi, img_lo, mask)   # mask=255 → img_hi (sky), mask=0 → img_lo (ground)

    dst_webp = os.path.join(SRC, f"{station}.webp")
    fused.save(dst_webp, "WEBP", quality=86)
    elapsed = time.time() - t0

    _update_manifest(station, dst_webp, strength_lo, strength_hi)
    print(f"  ✓ {station} — {elapsed:.0f}s · fused ({strength_lo}+{strength_hi}) · labeled SYNTHETIC")
    return dst_webp


def _update_manifest(station, webp_path, strength_lo, strength_hi):
    mp = os.path.join(SRC, f"{station}.json")
    if not os.path.exists(mp):
        return
    m = json.load(open(mp))
    sha = hashlib.sha256(open(webp_path, "rb").read()).hexdigest()
    if "output" in m:
        m["output"]["sha256"] = sha
        m["output"]["diffusion_pass"] = {
            "model": "stabilityai/sd-turbo",
            "method": "dual-pass horizon fuse",
            "strength_sky": strength_hi,
            "strength_ground": strength_lo,
            "style_system": "Luminous paper theater (kokogarden Kosmos v1)",
            "applied_at": time.strftime("%Y-%m-%d"),
        }
    json.dump(m, open(mp, "w"), ensure_ascii=False, indent=1)


def main():
    parser = argparse.ArgumentParser(description="SD-Turbo dual-pass horizon fuse for Kanto essences")
    parser.add_argument("--only",        default=None,  help="comma-separated station IDs")
    parser.add_argument("--strength-lo", type=float, default=0.35, dest="slo",
                        help="geometry-safe strength for ground/landmark zone (default 0.35)")
    parser.add_argument("--strength-hi", type=float, default=0.50, dest="shi",
                        help="richer-texture strength for sky zone (default 0.50)")
    parser.add_argument("--steps-lo",    type=int,   default=4,    dest="nlo",
                        help="inference steps for lo pass (default 4)")
    parser.add_argument("--steps-hi",    type=int,   default=6,    dest="nhi",
                        help="inference steps for hi pass (default 6)")
    parser.add_argument("--model",       default="stabilityai/sd-turbo")
    args = parser.parse_args()

    stations = args.only.split(",") if args.only else list(PROMPTS)

    pipe, device = load_pipe(args.model)
    print(f"  sky={args.shi}×{args.nhi}steps  ground={args.slo}×{args.nlo}steps  device={device}")
    print(f"  horizon fuse: 0.50 sky / 0.35 ground · soft blend at 58% height")
    print(f"  running {len(stations)} stations…\n")

    for st in stations:
        run(pipe, st, args.slo, args.nlo, args.shi, args.nhi)

    print(f"\ndone — {len(stations)} stations fused · all labeled SYNTHETIC")


if __name__ == "__main__":
    main()
