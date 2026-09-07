# HomeTikki · Kanto (関東)

Living corridor rental discovery across Tokyo and Kanagawa transit networks, tuned around a **26.5-minute commute boundary**.

Live preview: **[kanto.preattention.ai](https://kanto.preattention.ai)**

---

## Overview

HomeTikki Kanto is an exploratory housing and neighborhood intelligence platform designed for everyday renters, commuters, and residents navigating the Greater Tokyo rail ecosystem. Rather than filtering solely by arbitrary price ceilings or isolated station names, HomeTikki evaluates homes through **living transit corridors**, holistic travel boundaries, neighborhood sensory textures, and empirical micro-climate noise benchmarks.

Primary language: English (`en`)  
Secondary language: Japanese (`ja`)

---

## 5 Active Living Corridors

HomeTikki covers five major transit routes connecting central employment centers with residential neighborhoods:

| Corridor | Primary Railway Line | Primary Span | Key Character & Pockets |
| :--- | :--- | :--- | :--- |
| ⛩ **Keikyū** | Toei Asakusa & Keikyū Main Line Through-Run | Ningyōchō ↔ Yokohama | Waterfront canals, retro shotengai, Haneda access, post-towns (Koyasu, Rokugōdote, Umeyashiki) |
| 🌸 **Tōyoko** | Tōkyū Tōyoko Line / Minatomirai Line | Shibuya ↔ Motomachi-Chūkagai | Elevated terrace shopping, independent cafes, creative pockets (Daikanyama, Gakugei-daigaku, Hiyoshi) |
| 🌹 **Hibiya** | Tokyo Metro Hibiya Line | Naka-Meguro ↔ Kita-Senju | Canal side paths, craft culinary corridors, retro alleys (Roppongi, Tsukiji, Ningyōchō, Minami-Senju) |
| 🌿 **Den-en-toshi** | Tōkyū Den-en-toshi Line | Shibuya ↔ Chūō-Rinkan | Tree-lined parkways, family residential districts, quiet green belts (Sangenjaya, Futako-Tamagawa, Tama-Plaza) |
| 🗻 **Odakyū** | Odakyū Odawara Line | Shinjuku ↔ Machida / Odawara | Student culture, indie live houses, quiet suburban ravines (Shimokitazawa, Kyōdō, Seijōgakuen-mae) |

---

## Core Features

* **26.5-Minute Commute Boundary**: Live commute calculation evaluating actual transfer times and express versus local schedules to key employment destinations.
* **33 Verified Real Listings**: Field-documented rental residences featuring verified lease parameters, unit layouts, exact pricing, and direct primary source citations.
* **17 Neighborhood Pockets**: Distinct micro-neighborhoods categorized across 9 lifestyle dimensions (tranquility, market vitality, green access, culinary density, etc.) with an interactive 8-question finder.
* **Empirical Acoustic / Noise-Watch Layer**: Rigorous noise benchmarks categorized by sound profile and municipal citations (see [`NOISE_BENCHMARKS_METHODOLOGY.md`](NOISE_BENCHMARKS_METHODOLOGY.md)), from mobile seasonal megaphones to night dining alleys and rail viaduct resonance.
* **Living Motion Studies & Massing Portraits**: 33 looping atmospheric scene studies (`essence/`) and architectural massing studies (`portraits/`), providing spatial context for prospective residents.
* **Tikki Radio**: Built-in streaming ambient audio player evocative of neighborhood atmosphere and coastal breezes.
* **Lines Topology View**: Interactive topological transit graph depicting express stops, local junctions, and interline through-runs.

---

## Project Structure

```text
kanto-tikki/
├── index.html                   # Primary 5-corridor application (Round 21 build)
├── denentoshi.html              # Dedicated Den-en-toshi corridor view
├── hibiya.html                  # Dedicated Hibiya corridor view
├── odakyu.html                  # Dedicated Odakyū corridor view
├── toyoko.html                  # Dedicated Tōyoko corridor view
├── kanto.css                    # Unified design system & responsive layout
├── kanto.js                     # Core application engine & UI interactivity
│
├── [Transit & Corridor Data]
│   ├── kanto_data.js            # Station souba benchmarks & commute engine
│   ├── kanto_corridors_data.js  # 5-corridor metadata & route definitions
│   ├── kanto_live.js            # 33 verified listing records & quotes
│   ├── kanto_areas.js           # Sensory notes, grocers, and noise overlays
│   ├── kanto_topology.js        # Transit lines graph & junction models
│   ├── kanto_pockets.js         # 17 neighborhood pockets & 9-axis matcher
│   ├── kanto_i18n.js            # English / Japanese localization dictionary
│   ├── kanto_essence_meta.js    # Visual study manifests & metadata
│   ├── kanto_visuals.js         # Building visual registry & fallback guards
│   ├── denentoshi_*.js          # Den-en-toshi specific data modules
│   ├── hibiya_*.js              # Hibiya specific data modules
│   ├── odakyu_*.js              # Odakyū specific data modules
│   └── toyoko_*.js              # Tōyoko specific data modules
│
├── [Visual Studies & Media]
│   ├── essence/                 # 33 looping atmospheric video studies (.mp4/.webm) & posters
│   ├── portraits/               # Building massing architectural studies (.webp)
│   └── renders/                 # Reference packets and rendering utilities
│
├── [Tools & Scrapers]
│   ├── shoji.py                 # Shoji visual rendering pass CLI
│   ├── shoji_engine.py          # Shoji visual engine
│   ├── shoji_server.py          # Local studio inspector server
│   ├── shoji_ui.html            # Studio inspector interface
│   ├── essence_gen.py           # Atmospheric prompt generator
│   ├── essence_diffuse.py       # Stable diffusion img2img pass
│   ├── portrait_gen.py          # Building massing generator
│   ├── pocket_gen.py            # Pocket metadata generator
│   └── scripts/                 # Scraper utilities & data maintenance
│
├── [Cloudflare Worker Deployment]
│   └── deploy/
│       ├── wrangler.jsonc       # Worker configuration (kanto-tikki)
│       ├── build.sh             # Production asset staging script
│       ├── DEPLOY.md            # Deployment guide
│       └── src/index.ts         # Edge handler with strict security headers
│
├── NOISE_BENCHMARKS_METHODOLOGY.md # Acoustic framework & municipal citations
├── Play Kanto Tikki.command     # macOS one-click launcher (port 8936)
└── .gitignore                   # Git exclusion rules
```

---

## Running Locally

### Option A: macOS One-Click Launcher
Double-click `Play Kanto Tikki.command` in Finder. This will:
1. Clear any lingering process on port `8936`.
2. Launch a local web server bound to `127.0.0.1:8936`.
3. Open `http://127.0.0.1:8936/#corridor` automatically in your default browser.

### Option B: Command Line
```bash
python3 -m http.server 8936 --bind 127.0.0.1
```
Then visit `http://127.0.0.1:8936` in your browser.

---

## Deploying to Cloudflare Workers

The project deploys as an edge-rendered static application via Cloudflare Workers (`kanto-tikki`):

```bash
cd deploy
bash build.sh          # Stages clean application assets into ./public
npx wrangler login     # Log in to Cloudflare account (if not already authenticated)
npx wrangler deploy    # Publishes to kanto.preattention.ai
```

The edge worker (`deploy/src/index.ts`) enforces strict security headers, including `X-Robots-Tag: noindex, nofollow, noarchive` and content security policies protecting media assets.

---

## Data Provenance & Ethics Protocol

1. **Tiered Verification**:
   * **V** — Verified Pull: Primary field-verified source records.
   * **S** — Souba Benchmark: Published market baselines (e.g. LIFULL weekly benchmarks).
   * **P** — Modeled / Computed: Explicitly documented mathematical and spatial formulas.
   * **E** — Editorial Verified: Confirmed through on-site inspection or municipal records.
   * **Q** — Adapter Queued: Pending public data ingestion.
2. **Visual Transparency**:
   All architectural visual models are explicitly labeled as interpretive studies (*外形図* / *想像図*). Reference photos remain strictly local research inputs and are never directly published or displayed.
3. **Inclusive Languaging**:
   All documentation and user interfaces prioritize welcoming, human-centered language rooted in living neighborhoods, free of exclusionary jargon.

---

## License & Attribution

Designed and maintained for community transit exploration and neighborhood intelligence.
