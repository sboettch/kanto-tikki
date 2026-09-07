#!/usr/bin/env python3
"""Shoji Pass Standalone Server & Agent/MCP Endpoint (shoji_server.py)

A zero-dependency HTTP service providing:
  • GET  /ping               → Health probe, device capabilities, and pipeline signature
  • GET  /tools/schema.json  → OpenAI / Anthropic function calling tool schema
  • GET  /mcp/tools          → Model Context Protocol (MCP) tool definitions
  • POST /v1/shoji/generate  → Unified agnostic generation endpoint
  • GET  /api/listings       → Standard listing catalog (Kanto lv01–lv30)
  • GET  /                   → Embedded Shoji Studio UI
"""

import http.server
import io
import json
import os
import socketserver
import sys
import time
import urllib.parse
from typing import Any, Dict

# Ensure local directory is on path
HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path:
    sys.path.insert(0, HERE)

import shoji_engine

# Listing database from Kanto facts
LISTINGS = {
    "lv01": {"name": "BAUS FLATS Nihonbashi-hamacho", "floors": 10, "facade": "grey-tile", "area": "Nihombashihamacho, Chūō-ku", "palette": "core", "lay": "1LDK", "prompt": "10-storey RC apartment building dusk, grey tiled stylish exterior, Nihombashi Hamacho shitamachi area"},
    "lv12": {"name": "JMF Residence Kitashinagawa", "floors": 13, "facade": "rc", "area": "Kitashinagawa, Shinagawa-ku", "palette": "shitamachi", "lay": "1K", "prompt": "13-storey RC apartment tower dusk, Kitashinagawa shitamachi, warm amber windows"},
    "lv13": {"name": "Belc", "floors": 3, "facade": "neutral", "area": "Shinagawa-ku", "palette": "shitamachi", "lay": "1LDK", "prompt": "3-storey low-rise apartment building dusk, neutral facade, Shinagawa quiet residential lane"},
    "lv14": {"name": "ST Residence Minami-shinagawa", "floors": 6, "facade": "neutral", "area": "Minami-shinagawa, Shinagawa-ku", "palette": "shitamachi", "lay": "1LDK", "prompt": "6-storey RC mid-rise dusk, neutral facade, Minami-shinagawa residential"},
    "lv15": {"name": "Azalea Kashima", "floors": 3, "facade": "neutral", "area": "Ōta-ku", "palette": "shitamachi", "lay": "2LDK", "prompt": "3-storey low-rise new build dusk, neutral facade, Ota-ku quiet street"},
    "lv16": {"name": "Rising place Kamata-minami", "floors": 7, "facade": "rc", "area": "Nakarokugō, Ōta-ku", "palette": "shitamachi", "lay": "1K", "prompt": "7-storey RC apartment dusk, Namarokugō Ota-ku shitamachi"},
    "lv27": {"name": "La Pralle Tsurumi", "floors": 3, "facade": "steel", "area": "Ushiodachō, Tsurumi-ku", "palette": "bay", "lay": "2LDK", "prompt": "3-storey steel-frame new build dusk, Tsurumi-ku bay area"},
    "lv28": {"name": "Rowateru", "floors": 3, "facade": "neutral", "area": "Yokohama", "palette": "bay", "lay": "2LDK", "prompt": "3-storey new construction dusk, neutral facade, Yokohama bay area residential"},
    "lv29": {"name": "Le Lien", "floors": 4, "facade": "neutral", "area": "Yokohama", "palette": "bay", "lay": "1LDK", "prompt": "4-storey apartment dusk, neutral facade, Yokohama quiet lane"},
    "lv30": {"name": "Koyasu 6-min 1R", "floors": 3, "facade": "wood", "area": "Koyasu, Kanagawa-ku", "palette": "bay", "lay": "1R", "prompt": "3-storey wood-frame new build dusk, warm timber exterior, Koyasu Kanagawa-ku"},
}

OPENAI_TOOL_SCHEMA = {
    "type": "function",
    "function": {
        "name": "shoji_pass_generate",
        "description": "Generate an architectural illustration using the Shoji Pass dual-layer horizon fuse technique (Kosmos base + SD-Turbo dual-pass). Produces Luminous Paper Theater style outputs with strict geometric preservation and rich atmospheric skies.",
        "parameters": {
            "type": "object",
            "properties": {
                "prompt": {
                    "type": "string",
                    "description": "Natural language prompt or architectural description (e.g. '8-storey apartment building in Nihonbashi at dusk with warm windows')"
                },
                "listing_id": {
                    "type": "string",
                    "description": "Optional preconfigured listing ID (e.g. 'lv01', 'lv12', 'lv30')",
                    "enum": list(LISTINGS.keys())
                },
                "floors": {
                    "type": "integer",
                    "description": "Exact building storey count (1-25)",
                    "default": 4
                },
                "facade": {
                    "type": "string",
                    "description": "Facade architectural material",
                    "enum": ["grey-tile", "rc", "steel", "wood", "neutral"],
                    "default": "neutral"
                },
                "palette": {
                    "type": "string",
                    "description": "Atmospheric sky mood palette",
                    "enum": ["shitamachi", "core", "bay"],
                    "default": "shitamachi"
                },
                "typology": {
                    "type": "string",
                    "description": "Unit layout typology (affects window bay distribution and balcony railings)",
                    "enum": ["1R", "1K", "1LDK", "2LDK", "3LDK"],
                    "default": "1LDK"
                },
                "strength_sky": {
                    "type": "number",
                    "description": "Denoising strength for atmospheric sky pass (0.30 - 0.70)",
                    "default": 0.50
                },
                "strength_building": {
                    "type": "number",
                    "description": "Denoising strength for building structure pass (0.20 - 0.45)",
                    "default": 0.35
                },
                "horizon_frac": {
                    "type": "number",
                    "description": "Normalized vertical position of the horizon fuse line (0.40 - 0.85)",
                    "default": 0.68
                }
            },
            "required": []
        }
    }
}

MCP_TOOLS = [
    {
        "name": "shoji_generate",
        "description": "Executes the Shoji Pass dual-pass horizon fuse rendering pipeline to create a Luminous Paper Theater architectural portrait.",
        "inputSchema": OPENAI_TOOL_SCHEMA["function"]["parameters"]
    },
    {
        "name": "shoji_ping",
        "description": "Probes the Shoji Pass studio service health, active device, and pipeline metadata.",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    }
]


class ShojiRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def _send_json(self, data: Any, status: int = 200):
        body = json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path in ("/ping", "/health"):
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

            self._send_json({
                "status": "ok",
                "service": "Shoji Pass Studio",
                "pipeline": "Shoji Pass · Kosmos + SD-Turbo dual-layer horizon fuse · Luminous Paper Theater (kokogarden v1)",
                "device": device,
                "version": "1.0.0",
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
                "endpoints": {
                    "ping": "/ping",
                    "schema": "/tools/schema.json",
                    "mcp": "/mcp/tools",
                    "generate": "/v1/shoji/generate",
                    "listings": "/api/listings",
                    "studio_ui": "/"
                },
                "latency_ms": round((time.time() - t0) * 1000, 2)
            })
            return

        if path in ("/tools/schema.json", "/schema"):
            self._send_json(OPENAI_TOOL_SCHEMA)
            return

        if path == "/mcp/tools":
            self._send_json({"tools": MCP_TOOLS})
            return

        if path == "/api/listings":
            self._send_json({"listings": LISTINGS, "count": len(LISTINGS)})
            return

        if path in ("/", "/ui", "/index.html"):
            ui_path = os.path.join(HERE, "shoji_ui.html")
            if os.path.exists(ui_path):
                content = open(ui_path, "rb").read()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(content)))
                self.end_headers()
                self.wfile.write(content)
                return
            else:
                self._send_json({"error": "shoji_ui.html not found"}, status=404)
                return

        self.send_error(404, "Endpoint not found")

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path in ("/v1/shoji/generate", "/api/generate"):
            try:
                content_len = int(self.headers.get("Content-Length", 0))
                raw_body = self.rfile.read(content_len).decode("utf-8")
                req = json.loads(raw_body) if raw_body else {}
            except Exception as e:
                self._send_json({"error": f"Invalid JSON payload: {str(e)}"}, status=400)
                return

            # Check if listing_id provided
            lid = req.get("listing_id")
            spec = {}
            if lid and lid in LISTINGS:
                spec = dict(LISTINGS[lid])
            
            prompt = req.get("prompt", "")
            if prompt and not spec:
                parsed_spec = shoji_engine.parse_prompt_to_spec(prompt)
                spec.update(parsed_spec)

            # Override with explicit parameters if passed
            floors = int(req.get("floors", spec.get("floors", 4)))
            facade = req.get("facade", spec.get("facade", "neutral"))
            palette = req.get("palette", spec.get("palette", "shitamachi"))
            lay = req.get("typology", req.get("lay", spec.get("lay", "1LDK")))
            seed = int(req.get("seed", 42))

            strength_lo = float(req.get("strength_building", req.get("strength_lo", 0.35)))
            strength_hi = float(req.get("strength_sky", req.get("strength_hi", 0.50)))
            horizon_frac = float(req.get("horizon_frac", 0.68))
            feather = float(req.get("feather", 0.18))
            include_layers = bool(req.get("include_layers", True))

            category = req.get("category", spec.get("category"))

            t0 = time.time()
            try:
                # 1. Procedural Kosmos Base (Dynamic Subject & Geometry)
                base = shoji_engine.render_kosmos_canvas(
                    prompt=prompt,
                    category=category,
                    floors=floors,
                    facade=facade,
                    palette=palette,
                    lay=lay,
                    seed=seed,
                )

                # 2. Dual-Pass Horizon & Depth Fuse
                fused, mask, ground_layer, sky_layer = shoji_engine.fuse_shoji_pass(
                    base=base,
                    horizon_frac=horizon_frac,
                    feather=feather,
                    strength_lo=strength_lo,
                    strength_hi=strength_hi,
                )

                # 3. Create Manifest
                buf = io.BytesIO()
                fused.save(buf, format="WEBP", quality=88)
                img_bytes = buf.getvalue()

                manifest = shoji_engine.create_manifest(
                    image_bytes=img_bytes,
                    prompt=prompt or spec.get("prompt", "Shoji Pass synthesis"),
                    spec={"category": category or "architecture", "floors": floors, "facade": facade, "palette": palette, "lay": lay},
                    strength_lo=strength_lo,
                    strength_hi=strength_hi,
                    horizon_frac=horizon_frac,
                    feather=feather,
                )

                res = {
                    "status": "success",
                    "pipeline": manifest["pipeline"],
                    "elapsed_sec": round(time.time() - t0, 3),
                    "manifest": manifest,
                    "image": shoji_engine.image_to_base64_data_uri(fused, "WEBP"),
                }

                if include_layers:
                    res["layers"] = {
                        "kosmos_base": shoji_engine.image_to_base64_data_uri(base, "PNG"),
                        "ground_pass": shoji_engine.image_to_base64_data_uri(ground_layer, "PNG"),
                        "sky_pass": shoji_engine.image_to_base64_data_uri(sky_layer, "PNG"),
                        "horizon_mask": shoji_engine.image_to_base64_data_uri(mask, "PNG"),
                    }

                self._send_json(res)
            except Exception as e:
                self._send_json({"error": f"Generation failed: {str(e)}"}, status=500)
            return

        self.send_error(404, "Endpoint not found")


def run_server(port: int = 8765):
    class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
        daemon_threads = True

    server = ThreadingHTTPServer(("0.0.0.0", port), ShojiRequestHandler)
    print(f"  ⛩️  Shoji Pass Studio Server running at http://localhost:{port}")
    print(f"  • Ping Probe:   http://localhost:{port}/ping")
    print(f"  • Agent Schema: http://localhost:{port}/tools/schema.json")
    print(f"  • MCP Tools:    http://localhost:{port}/mcp/tools")
    print(f"  • REST API:     http://localhost:{port}/v1/shoji/generate\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        server.server_close()


if __name__ == "__main__":
    port = 8765
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])
    run_server(port)
