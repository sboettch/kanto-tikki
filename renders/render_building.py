#!/usr/bin/env python3
"""Provider-neutral building reconstruction — the generate_reconstruction()
adapter from docs/VISUAL_PROXIMITY_PIPELINE.md, for Kanto listings.

  generate_reconstruction(property_key, reference_image_paths[],
      structured_facts, preserve_attributes[], forbidden_inventions[],
      output_profile, provider)

Providers:
  openai   — gpt-image edit/generation with reference images (autoregressive;
             needs OPENAI_API_KEY where policy allows reference inputs)
  sd       — SD/StreamDiffusion img2img over the primary exterior reference at
             LOW strength (0.30): reference constrains geometry, diffusion
             cleans texture (same setting as bayarearealestate tier3)

Every output is written next to a manifest in the SAME schema as
assets/generated/*-reference-reconstruction-*.json, with:
  state SYNTHETIC · display labels for every surface ·
  visual_proximity.status REVIEWED_ADDRESS_REFERENCE only AFTER a human
  side-by-side review sets grade HIGH/MEDIUM (until then: PENDING_REVIEW,
  and the app registry refuses the entry — fail closed).
"""
import argparse, hashlib, json, os, sys, datetime

HERE = os.path.dirname(os.path.abspath(__file__))

def build_prompt(p):
    f = p["structured_facts"]
    keep = " · ".join(p.get("preserve_attributes", []))
    forbid = " · ".join(p.get("forbidden_inventions", []))
    return (f"Street-facing exterior of the exact building in the reference photos. "
            f"{f.get('total_floors','?')}-storey {f.get('structure','')} built {f.get('built','')}. "
            f"Preserve: {keep}. Never invent: {forbid}. "
            f"Neutral overcast light, no people, no text, photographic.")

def run_openai(p, refs, out_png):
    from openai import OpenAI
    client = OpenAI()
    imgs = [open(r, "rb") for r in refs]
    r = client.images.edit(model=os.environ.get("HT_IMAGE_MODEL", "gpt-image-1.5"),
                           image=imgs, prompt=build_prompt(p), size="1024x1024")
    import base64
    open(out_png, "wb").write(base64.b64decode(r.data[0].b64_json))

def run_sd(p, refs, out_png):
    import torch
    from diffusers import AutoPipelineForImage2Image
    from PIL import Image
    pipe = AutoPipelineForImage2Image.from_pretrained("stabilityai/sd-turbo", torch_dtype=torch.float32)
    pipe.to("cpu"); pipe.set_progress_bar_config(disable=True)
    base = Image.open(refs[0]).convert("RGB").resize((768, 576))
    out = pipe(prompt=build_prompt(p), image=base, strength=0.30,
               num_inference_steps=3, guidance_scale=0.0).images[0]
    out.save(out_png)

def manifest_for(p, out_png, provider):
    f = p["structured_facts"]
    return {
        "asset_id": f"kanto-{p['listing_id']}-reference-reconstruction-v1",
        "property_key": p["property_key"],
        "state": "SYNTHETIC",
        "display_label": "Reference-informed AI reconstruction — not a listing photograph",
        "card_label": "SYNTHETIC · reference-informed exterior reconstruction",
        "detail_label": "SYNTHETIC · reference-informed exterior reconstruction · not a listing photograph",
        "generated_at": datetime.date.today().isoformat(),
        "generator": {"openai": "OpenAI gpt-image (autoregressive); adapter replaceable",
                       "sd": "SD-Turbo img2img strength 0.30 (StreamDiffusion family); adapter replaceable"}[provider],
        "method": "reference reconstruction v1 from exact-listing exterior previews + structured facts",
        "output": {"local_path": os.path.relpath(out_png, os.path.dirname(HERE)),
                    "sha256": hashlib.sha256(open(out_png, "rb").read()).hexdigest()},
        "source_records": [{"source_page_url": p["source_page_url"], "observed_at": p["observed_at"],
                             "role": "listing facts + reference discovery"}],
        "image_inputs": [{k: v for k, v in i.items() if k != "url_pattern"}
                          for i in p.get("image_inputs_discovered", []) if i.get("local_path")],
        "structured_facts": f,
        "visual_proximity": {
            "status": "PENDING_REVIEW",
            "grade": None,
            "score_basis": "REQUIRED: manual side-by-side review against every fetched exterior reference before any display",
            "matched_attributes": [], "not_asserted": [
                "survey-accurate dimensions", "hidden elevations", "interior configuration", "present condition"]
        },
        "expectation_contract": [
            "Labeled synthetic at every display surface.",
            "References remain local research inputs; never displayed.",
            "The app registry (kanto_visuals.js) accepts this asset only after grade HIGH or MEDIUM is recorded here.",
            "A LOW or ungraded result stays out of the app — fail closed."
        ],
    }

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("listing_ids", nargs="*")
    ap.add_argument("--provider", choices=["openai", "sd"], default="sd")
    a = ap.parse_args()
    data = json.load(open(os.path.join(HERE, "PACKETS.json")))
    for p in data["packets"]:
        lid = p.get("listing_id")
        if not lid or (a.listing_ids and lid not in a.listing_ids): continue
        refs = [os.path.join(HERE, i["local_path"]) for i in p.get("image_inputs_discovered", []) if i.get("local_path")]
        if not refs:
            print(f"  – {lid}: no fetched references (run fetch_references.py first) — skipping, fail closed"); continue
        out_png = os.path.join(HERE, f"{lid}-reference-reconstruction-v1.png")
        (run_openai if a.provider == "openai" else run_sd)(p, refs, out_png)
        m = manifest_for(p, out_png, a.provider)
        json.dump(m, open(out_png.replace(".png", ".json"), "w"), ensure_ascii=False, indent=1)
        print(f"  ✓ {lid} rendered ({a.provider}) → PENDING_REVIEW; grade it, then register in kanto_visuals.js")

if __name__ == "__main__":
    main()
