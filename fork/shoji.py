#!/usr/bin/env python3
"""Shoji Pass — Agnostic CLI Runner & Mini-Tool (shoji.py)

Usage Examples:
  # Health Ping / Status
  python3 shoji.py ping

  # Natural language prompt
  python3 shoji.py "10-storey grey-tile apartment in Nihonbashi at dusk"

  # Preconfigured Kanto listing
  python3 shoji.py --listing lv01 --out lv01_hero.webp

  # Custom architectural parameters
  python3 shoji.py --floors 13 --facade rc --palette shitamachi --out hero.webp

  # Start local HTTP service & Studio UX
  python3 shoji.py serve --port 8765

  # Export tool schema for LLM / Agent integration
  python3 shoji.py schema
"""

import argparse
import io
import json
import os
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path:
    sys.path.insert(0, HERE)

import shoji_engine
import shoji_server


def cmd_ping(args):
    t0 = time.time()
    device = "cpu"
    try:
        import torch
        if torch.backends.mps.is_available():
            device = "mps"
        elif torch.cuda.is_available():
            device = "cuda"
    except ImportError:
        device = "simulated"

    info = {
        "status": "ok",
        "service": "Shoji Pass Studio",
        "pipeline": "Shoji Pass · Kosmos + SD-Turbo dual-layer horizon fuse · Luminous Paper Theater (kokogarden v1)",
        "device": device,
        "version": "1.0.0",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        "latency_ms": round((time.time() - t0) * 1000, 2),
    }
    if args.json:
        print(json.dumps(info, indent=2))
    else:
        print("⛩️  Shoji Pass Studio — Health Pong")
        print(f"  • Status:   {info['status'].upper()}")
        print(f"  • Pipeline: {info['pipeline']}")
        print(f"  • Device:   {info['device']}")
        print(f"  • Latency:  {info['latency_ms']} ms")


def cmd_schema(args):
    print(json.dumps(shoji_server.OPENAI_TOOL_SCHEMA, indent=2))


def cmd_generate(args):
    prompt = args.prompt or ""
    spec = {}

    if args.listing and args.listing in shoji_server.LISTINGS:
        spec = dict(shoji_server.LISTINGS[args.listing])
        print(f"  Found listing '{args.listing}': {spec['name']}")

    if prompt and not spec:
        spec = shoji_engine.parse_prompt_to_spec(prompt)
        print(f"  Parsed prompt facts → floors={spec['floors']}, facade={spec['facade']}, palette={spec['palette']}, lay={spec['lay']}")

    floors = args.floors if args.floors is not None else spec.get("floors", 4)
    facade = args.facade or spec.get("facade", "neutral")
    palette = args.palette or spec.get("palette", "shitamachi")
    lay = args.lay or spec.get("lay", "1LDK")
    seed = args.seed

    print(f"\n⛩️  Running Shoji Pass...")
    print(f"  • Spec: {floors}-storey | {facade} facade | {palette} sky | {lay} layout")
    print(f"  • Horizon Fuse: frac={args.horizon_frac} | feather={args.feather} | sky_str={args.strength_sky} | ground_str={args.strength_building}")

    t0 = time.time()
    online_img = None
    if getattr(args, "provider", None) or os.environ.get("HF_TOKEN") or os.environ.get("OPENAI_API_KEY"):
        provider = getattr(args, "provider", None)
        print(f"  Attempting cloud diffusion synthesis (provider: {provider or 'auto'})...")
        online_img = shoji_engine.generate_online_diffusion(prompt=prompt, provider=provider)

    if online_img is not None:
        fused = online_img
        print(f"  ✓ Successfully synthesized via online diffusion model!")
    else:
        base = shoji_engine.render_kosmos_canvas(
            prompt=prompt,
            floors=floors,
            facade=facade,
            palette=palette,
            lay=lay,
            seed=seed,
        )

        fused, mask, ground_layer, sky_layer = shoji_engine.fuse_shoji_pass(
            base=base,
            horizon_frac=args.horizon_frac,
            feather=args.feather,
            strength_lo=args.strength_building,
            strength_hi=args.strength_sky,
        )

    out_path = args.out or f"shoji_{facade}_{floors}fl.webp"
    fused.save(out_path, format="WEBP", quality=88)

    buf = io.BytesIO()
    fused.save(buf, format="WEBP", quality=88)
    manifest = shoji_engine.create_manifest(
        image_bytes=buf.getvalue(),
        prompt=prompt or f"{floors}-storey building in {palette}",
        spec={"category": spec.get("category", "architecture"), "floors": floors, "facade": facade, "palette": palette, "lay": lay},
        strength_lo=args.strength_building,
        strength_hi=args.strength_sky,
        horizon_frac=args.horizon_frac,
        feather=args.feather,
        device="online-diffusion" if online_img is not None else "simulated",
    )

    manifest_path = os.path.splitext(out_path)[0] + ".json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    elapsed = time.time() - t0
    print(f"  ✓ Output saved to: {out_path} ({elapsed:.2f}s)")
    print(f"  ✓ Provenance Manifest: {manifest_path} (SHA-256: {manifest['provenance']['sha256'][:12]}...)")
    print(f"  ✓ Labeled: {manifest['label']}\n")


def main():
    parser = argparse.ArgumentParser(description="Shoji Pass — Agnostic Image Synthesis Tool")
    subparsers = parser.add_subparsers(dest="command", help="Sub-commands")

    # ping
    ping_p = subparsers.add_parser("ping", help="Ping status probe")
    ping_p.add_argument("--json", action="store_true", help="Output raw JSON")

    # schema
    subparsers.add_parser("schema", help="Print LLM function calling tool schema")

    # serve
    serve_p = subparsers.add_parser("serve", help="Start Shoji Pass HTTP server & UX")
    serve_p.add_argument("--port", type=int, default=8765, help="Port to listen on (default: 8765)")

    # generate / default
    gen_p = subparsers.add_parser("generate", help="Generate Shoji Pass image")
    gen_p.add_argument("prompt", nargs="?", default="", help="Natural language description")
    gen_p.add_argument("--provider", choices=["huggingface", "openai", "replicate", "local", "simulated"], help="Diffusion engine provider")
    gen_p.add_argument("--listing", type=str, help="Preconfigured listing ID (lv01, lv12, etc.)")
    gen_p.add_argument("--floors", type=int, help="Building storey count (1-25)")
    gen_p.add_argument("--facade", choices=["grey-tile", "rc", "steel", "wood", "neutral"], help="Facade type")
    gen_p.add_argument("--palette", choices=["shitamachi", "core", "bay"], help="Sky palette mood")
    gen_p.add_argument("--lay", choices=["1R", "1K", "1LDK", "2LDK", "3LDK"], help="Layout typology")
    gen_p.add_argument("--seed", type=int, default=42, help="Random seed")
    gen_p.add_argument("--strength-sky", type=float, default=0.50, help="Sky diffusion strength")
    gen_p.add_argument("--strength-building", type=float, default=0.35, help="Building diffusion strength")
    gen_p.add_argument("--horizon-frac", type=float, default=0.68, help="Horizon height ratio (0.0-1.0)")
    gen_p.add_argument("--feather", type=float, default=0.18, help="Sigmoid feather factor")
    gen_p.add_argument("--out", type=str, help="Output image file path (.webp/.png)")

    # Allow direct shorthand invocation like `python3 shoji.py "10-storey..."`
    if len(sys.argv) > 1 and sys.argv[1] not in ("ping", "schema", "serve", "generate", "-h", "--help"):
        # Synthesize generate command
        args = parser.parse_args(["generate"] + sys.argv[1:])
    else:
        args = parser.parse_args()

    if args.command == "ping":
        cmd_ping(args)
    elif args.command == "schema":
        cmd_schema(args)
    elif args.command == "serve":
        shoji_server.run_server(args.port)
    elif args.command == "generate":
        cmd_generate(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
