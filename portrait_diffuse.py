#!/usr/bin/env python3
"""HomeTikki KANTO — Shoji Pass for listing hero images (portrait_diffuse.py).

Shoji Pass pipeline
────────────────────
Named for the layered translucent paper screens of Japanese architecture —
two diffusion layers composited through a soft gradient, grounded by the
Kosmos procedural base behind them.

  Kosmos PIL base  →  SD-Turbo 0.35 (building zone, geometry-safe)  ┐
                   →  SD-Turbo 0.50 (sky zone, richer atmosphere)    ┤ → horizon fuse
                                                                      ┘

Style system: Luminous Paper Theater (kokogarden Kosmos v1)
Model: stabilityai/sd-turbo (CFG-free, 1–6 steps on MPS)

Hero images are 1024×576 (16:9). Buildings fill more of the frame than
essences (1024×384), so the horizon fuse sits higher (~68% down).

Usage
─────
  python3 portrait_diffuse.py                    # all 10 listings
  python3 portrait_diffuse.py --only lv01,lv30
"""
import argparse, hashlib, json, os, time
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC  = os.path.join(HERE, "portraits")

WORK_W, WORK_H = 1024, 576

STYLE = (
    "washi paper texture, sumi ink linework, woodblock color, "
    "indigo ochre watercolour dusk sky, paper theater, Japanese sketchbook"
)

NEG = (
    "photo, photorealistic, 3d, cgi, neon, anime, watermark, text, "
    "generic cyberpunk japan, ruin, daytime, faces, modern stock photo"
)

# Per-listing prompts — grounded in listing facts only.
# Building scale, structure type, area typology. No invented specifics.
PROMPTS = {
    "lv01": "10-storey RC apartment building dusk, grey tiled stylish exterior, Nihombashi Hamacho shitamachi area, warm lit windows, dark indigo sky",
    "lv04": "7-storey RC apartment building dusk, modern tiled facade, Nihombashi Hamacho area, warm lit windows, dark indigo sky",
    "lv12": "13-storey RC apartment tower dusk, Kitashinagawa shitamachi, warm amber windows, dark ground, indigo sky",
    "lv13": "3-storey low-rise apartment building dusk, neutral facade, Shinagawa quiet residential lane, warm windows, dusk sky",
    "lv14": "6-storey RC mid-rise dusk, neutral facade, Minami-shinagawa residential, warm lit windows, lamp glow, blue-hour",
    "lv15": "3-storey low-rise new build dusk, neutral facade, Ota-ku quiet street, warm windows, indigo dusk sky",
    "lv16": "7-storey RC apartment dusk, Namarokugō Ota-ku shitamachi, warm amber windows, lamp posts, indigo sky",
    "lv27": "3-storey steel-frame new build dusk, Tsurumi-ku bay area, warm lit windows, blue-hour sky, street lamps",
    "lv28": "3-storey new construction dusk, neutral facade, Yokohama bay area residential, warm windows, dusk sky",
    "lv29": "4-storey apartment dusk, neutral facade, Yokohama quiet lane, warm amber windows, lamp glow, blue-hour",
    "lv30": "3-storey wood-frame new build dusk, warm timber exterior, Koyasu Kanagawa-ku, warm windows, street lamp, indigo sky",
    "lv34": "14-storey high-rise apartment tower dusk, Shimbashi Minato city center, elegant stone tile facade, warm glowing windows, twilight indigo sky",
    "lv36": "12-storey mid-rise apartment tower dusk, Shiba Park Shimbashi area, grey tile facade, warm amber windows, dusk sky",
    "lv53": "8-storey luxury residence dusk, Gotenyama Kitashinagawa hill, refined modern architecture, serene leafy precinct, amber glow",
    "lv108": "10-storey modern residential building dusk, Yokohama Nishi-ku, sleek facade, glowing warm windows, coastal dusk sky",
}


def _diffuse(pipe, base, lid, strength, steps):
    if lid in PROMPTS:
        place_prompt = PROMPTS[lid]
    else:
        mp = os.path.join(SRC, f"{lid}_hero.json")
        if os.path.exists(mp):
            try:
                m = json.load(open(mp))
                matches = m.get("visual_proximity", {}).get("matched_attributes", [])
                place_prompt = f"apartment building dusk, {', '.join(matches[:2])}, warm windows, dusk sky"
            except Exception:
                place_prompt = "apartment building dusk, Japanese residential street, warm windows, twilight sky"
        else:
            place_prompt = "apartment building dusk, Japanese residential street, warm windows, twilight sky"
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


def _horizon_mask(w, h, horizon_frac=0.68, feather=0.18):
    """Soft vertical gradient mask.
    For hero images the building fills more of the frame so horizon sits higher.
    mask=255 → sky image (hi-strength), mask=0 → building image (lo-strength).
    """
    import math
    pixels = []
    for y in range(h):
        t = (y / h - horizon_frac) / feather
        sig = 1.0 / (1.0 + math.exp(-t * 6))
        pixels.append(int((1.0 - sig) * 255))
    mask_arr = []
    for y in range(h):
        mask_arr.extend([pixels[y]] * w)
    mask = Image.new("L", (w, h))
    mask.putdata(mask_arr)
    return mask


def run(pipe, lid, strength_lo=0.35, steps_lo=4, strength_hi=0.50, steps_hi=6):
    """Shoji Pass dual-fuse for a listing hero image."""
    src = os.path.join(SRC, f"{lid}_hero.webp")
    if not os.path.exists(src):
        print(f"  ✗ {lid}: no hero webp found — run portrait_gen.py first")
        return None

    base = Image.open(src).convert("RGB").resize((WORK_W, WORK_H), Image.LANCZOS)

    t0 = time.time()
    img_lo = _diffuse(pipe, base, lid, strength_lo, steps_lo)   # building-faithful
    img_hi = _diffuse(pipe, base, lid, strength_hi, steps_hi)   # richer sky

    mask = _horizon_mask(WORK_W, WORK_H, horizon_frac=0.68, feather=0.18)
    fused = Image.composite(img_hi, img_lo, mask)

    dst = os.path.join(SRC, f"{lid}_hero.webp")
    fused.save(dst, "WEBP", quality=88)
    elapsed = time.time() - t0

    _update_manifest(lid, dst, strength_lo, strength_hi)
    print(f"  ✓ {lid} — {elapsed:.0f}s · Shoji Pass ({strength_lo}+{strength_hi}) · labeled SYNTHETIC")
    return dst


def _update_manifest(lid, webp_path, strength_lo, strength_hi):
    mp = os.path.join(SRC, f"{lid}_hero.json")
    if not os.path.exists(mp):
        return
    m = json.load(open(mp))
    sha = hashlib.sha256(open(webp_path, "rb").read()).hexdigest()
    if "output" in m:
        m["output"]["sha256"] = sha
        m["output"]["shoji_pass"] = {
            "pipeline": "Shoji Pass · Kosmos + SD-Turbo dual-layer horizon fuse · Luminous Paper Theater (kokogarden v1)",
            "model": "stabilityai/sd-turbo",
            "method": "dual-pass horizon fuse",
            "strength_sky": strength_hi,
            "strength_building": strength_lo,
            "horizon_frac": 0.68,
            "applied_at": time.strftime("%Y-%m-%d"),
        }
    json.dump(m, open(mp, "w"), ensure_ascii=False, indent=1)


def load_pipe(model_id="stabilityai/sd-turbo"):
    import torch
    from diffusers import AutoPipelineForImage2Image
    device = (
        "mps"  if torch.backends.mps.is_available() else
        "cuda" if torch.cuda.is_available()         else
        "cpu"
    )
    dtype = torch.float16 if device in ("mps", "cuda") else torch.float32
    print(f"  loading {model_id} → {device} ({dtype})")
    pipe = AutoPipelineForImage2Image.from_pretrained(
        model_id, torch_dtype=dtype,
        variant="fp16" if device != "cpu" else None,
        use_safetensors=True,
    )
    pipe.to(device)
    pipe.set_progress_bar_config(disable=True)
    return pipe, device


def main():
    parser = argparse.ArgumentParser(description="Shoji Pass — SD-Turbo hero image fuse")
    parser.add_argument("--only",        default=None)
    parser.add_argument("--strength-lo", type=float, default=0.35, dest="slo")
    parser.add_argument("--strength-hi", type=float, default=0.50, dest="shi")
    parser.add_argument("--steps-lo",    type=int,   default=4,    dest="nlo")
    parser.add_argument("--steps-hi",    type=int,   default=6,    dest="nhi")
    parser.add_argument("--model",       default="stabilityai/sd-turbo")
    args = parser.parse_args()

    listings = args.only.split(",") if args.only else list(PROMPTS)
    pipe, device = load_pipe(args.model)
    print(f"  Shoji Pass · sky={args.shi}×{args.nhi}  building={args.slo}×{args.nlo}  device={device}")
    print(f"  horizon fuse at 68% height (hero 16:9 frame)")
    print(f"  running {len(listings)} listing heroes…\n")

    for lid in listings:
        run(pipe, lid, args.slo, args.nlo, args.shi, args.nhi)

    print(f"\ndone — {len(listings)} heroes · Shoji Pass · all labeled SYNTHETIC")


if __name__ == "__main__":
    main()
