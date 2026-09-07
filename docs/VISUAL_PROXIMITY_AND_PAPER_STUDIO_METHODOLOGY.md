# Visual Proximity Pipeline & Living Paper Shadowbox Studio Methodology
**A Unified Framework for Low-Error Place Representation & Procedural Paper Motion**

*Documented for Kanto Tikki, cross-referenced with Kyōjima Gardens of Relation and Eastside/Apricot Studio.*

---

## Executive Overview

Across our urban research and interactive applications (HomeTikki, Kyōjima Gardens of Relation, and Apricot Life), place representation relies on two complementary pillars:

1. **The Visual Proximity Pipeline**: A rigorous evidence and constraint framework designed to achieve **low perceptual proximity error** based on field-verified references, rather than attempting deceptive photorealistic mimicry or pixel-identity digital twins.
2. **The Living Paper Shadowbox Studio Idiom**: A procedural, zero-network, zero-external-asset Canvas 2D engine that renders multi-ply layered paper cutouts with harmonic animation loops, diurnal lighting, 3D mouse parallax, and weather dynamics.

This document compiles the lineage, mathematics, architecture, and step-by-step instructions needed to generalize this system for any transit corridor, neighborhood pocket, or architectural residence in Kanto Tikki.

---

## Part 1: The Visual Proximity Methodology

### 1.1 The Core Thesis: Proximity Error vs. Pixel Identity

> **Key Principle:** The goal is never pixel identity or photographic masquerade. The goal is low perceptual proximity error while the observer always understands that they are viewing a reference-informed interpretive study.

**Expectation-to-Field-Reality Proximity Error** is defined as the gap between:
1. What an everyday resident or renter is likely to believe after viewing an environmental representation; and
2. What dated primary-source records, measurements, municipal filings, and on-site observations actually establish.

There are only two legitimate ways to minimize this gap:
* **Strengthen the on-site evidentiary basis** through verified multi-view photography, building permits, and documented architectural facts.
* **Reduce the implied claim** through visual abstraction, deliberate omission of unverified details, visible structural study cues, and radical provenance disclosure.

```
+-------------------------------------------------------------------------+
|                        THE DIGNITY BOUNDARY                             |
|                                                                         |
|  Photographic Mimicry             Interpretive Visual Study             |
|  [HIGH RISK OF MISREPRESENTATION] [CONTROLLED PROXIMITY ERROR]          |
|  - Hallucinates unverified details - Locks known physical facts         |
|  - Masquerades as current reality  - Explicitly states unasserted scope |
|  - Distorts age/wear into decay   - Respects living community agency    |
+-------------------------------------------------------------------------+
```

### 1.2 The Three Mandatory Invariants
Every reference-informed visual model carries three invariant disclosures across all interfaces:
1. **`INTERPRETIVE STUDY` (外形図 / 想像図)**: Explicitly acknowledges the asset is a generated visual model.
2. **`REFERENCE-INFORMED`**: Confirms that authentic visible exterior previews were supplied to the generator.
3. **`NOT DOCUMENTARY`**: Clarifies that interior conditions, structural engineering defects, habitability, and legal boundaries are not established by the model.

### 1.3 The Reference-Informed Input Packet
Every property or landmark visual pass begins with a structured JSON packet (see [`renders/PACKETS.json`](../renders/PACKETS.json)):

```json
{
  "property_key": "lv01",
  "address_city": "Nihonbashi-Ningyōchō | Chūō",
  "provenance_tier": "V",
  "source_records": [
    {
      "publisher": "Verified Rental Portal",
      "url": "https://example.jp/listing/12345",
      "capture_date": "2026-09-02",
      "permitted_role": "RESEARCH_INPUT_ONLY",
      "local_path": "renders/raw_refs/lv01_street_front.jpg",
      "sha256": "4f53cda18c2..."
    }
  ],
  "structured_facts": {
    "stories": 13,
    "year_built": 2018,
    "structure_type": "RC",
    "facade_material": "grey-tile",
    "roofline": "flat_parapet",
    "window_rhythm": "regular_grid_loggia",
    "street_setback_meters": 1.8,
    "corner_orientation": "north_east"
  },
  "positive_cues": [
    "13-storey reinforced concrete massing",
    "cool grey ceramic tile cladding with darker spandrel accents",
    "recessed balconies with tinted glass railings",
    "ground floor glass entrance lobby with warm interior downlights"
  ],
  "negative_constraints": [
    "no ornate moldings or European balconies",
    "no wooden cladding or pitched gables",
    "no visible exterior fire escape staircases",
    "no invented rooftop water tanks or penthouse additions"
  ]
}
```

#### Privacy & Rights Boundary:
* **Private Local References**: Raw listing and street-level photographs are research-only inputs. They remain strictly on local storage and are **never** bundled into public repositories, web distributions, or Cloudflare edge workers.
* **Integrity Validation**: Deployment pipelines verify the cryptographic hash (SHA-256) of references without packaging the pixel binaries.

### 1.4 Proximity Review Rubric & Evaluation Tiers

Models are reviewed side-by-side against visible primary-source inputs along six physical axes:
1. **Massing & Story Count**: Ratio of width to height, step-backs, and total floors.
2. **Roofline & Silhouette**: Pitch, parapet, cornice details, mechanical penthouse profile.
3. **Cladding & Color Family**: Dominant materials (RC concrete, Galvalume steel, ceramic tile, cedar timber) and color temperature.
4. **Fenestration Rhythm**: Window-to-wall ratio, balcony recess depth, and vertical division bays.
5. **Ground Interface**: Entrance relationship, parking bay, sidewalk threshold, and setback greenery.
6. **Hallucination Check**: Absence of invented decorative elements.

#### Proximity Tier Scale:
* **`HIGH` (P3 — Measured & Corroborated)**: No massing errors; principal facade cues, openings, and materials are recognizable.
* **`MEDIUM` (P2 — Reference-Informed)**: Massing and typology are structurally plausible, but secondary facade cues show minor drift. (Eligible for listing card headers).
* **`LOW` (P1 — Typological Only)**: District-scale rhythm or architectural type only; not address-specific. (Fails closed: withheld from listing hero).
* **`NOT SCORED` (P0 — Abstract / Procedural)**: Stylized procedural study making no property-specific claims.
* **`WITHHELD` (W)**: Information exists but is private, sensitive, or unlicensed.

---

## Part 2: The Living Paper Shadowbox Studio Idiom

### 2.1 Technical Lineage
The procedural paper animation system evolved across three distinct milestones:

```
[Kyōjima Gardens of Relation] (2026-08)
  └── Luminous Paper Theater, washi paper textures, multi-ply architectural cutouts
        │
        ├── [Kanto Studio (Shoji)] (2026-09)
        │     └── 33 station skylines, Keikyu red express trains, lanterns, canal skiffs
        │
        └── [Eastside Studio (Apricot Life)] (2026-09)
              └── Extracted into pure standalone engine (`eastside-engine.js`), 
                  seed-based PRNG, weather/diurnal modulation, dog/folk puppets
```

### 2.2 Core Philosophy: Procedural, Zero-Asset, Canvas 2D
* **Zero Network, Zero Asset Bloat**: Renders entirely via native HTML5 Canvas 2D API calls (`ctx.arc`, `ctx.bezierCurveTo`, `ctx.fill`). No external PNGs, WebGL textures, or fonts are required.
* **Deterministic Pseudo-Random Generation (`mulberry32`)**: Every district, pocket, and building seed generates reproducible geometry and foliage layouts using a deterministic 32-bit PRNG:

```javascript
function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
```

### 2.3 Layer Depth Hierarchy & 3D Mouse Parallax
The scene is structured into discrete physical "plies" of paper, each assigned a depth value ($z \in [0.0, 1.0]$). During mouse movement or gyroscopic tilt, the canvas applies an offset proportional to depth:

$$\Delta x_i = (x_{\text{mouse}} - x_{\text{center}}) \cdot z_i \cdot k_{\text{parallax}}$$

```
[Camera / Viewer]
   │
   ├─► Depth 1.00: Framing Matsui & Vignette (Drop shadow inward)
   ├─► Depth 0.85: Foreground Pedestrians, Bicycles, Streetlamps, Reeds
   ├─► Depth 0.65: Focal Architecture (Listing Facade / Station Arcade)
   ├─► Depth 0.45: Midground Transit Viaduct & Moving Express Train
   ├─► Depth 0.25: Secondary Urban Fabric / Hillside / Canal Water
   ├─► Depth 0.10: Distant Mountain / Megacity Skyline Silhouette
   └─► Depth 0.00: Multi-wash Watercolor Sky & Backlight Glow
```

### 2.4 Four Cohesive Render Modes from a Single Geometry
The exact same geometric dataset can be re-interpreted in four aesthetic styles:

1. **`shadowbox` (3D Paper Shadowbox)**: Soft Gaussian drop-shadows cast between plies (`ctx.shadowColor = "rgba(0,0,0,0.45)"`, `ctx.shadowBlur = 12 * depth`). Emulates physical laser-cut museum shadowboxes.
2. **`cutout` (Flat Paper Cutouts)**: Flat, saturated color fills with crisp, razor-sharp edges and zero blur. Emulates mid-century Japanese woodblock and paper-cut art (*kiri-e* 切絵).
3. **`outline` (Laser Vector Outline)**: Fine, monoline vector strokes (`ctx.lineWidth = 1.2`) on an off-white washi background, resembling architectural laser-engraving schematics.
4. **`backlight` (Ambient Backlight)**: Dark foreground plies rendered as near-black silhouette paper, illuminated by warm glowing light radiating through windows and from behind skyline edges.

### 2.5 Harmonic Motion Dynamics (60 FPS)
Living movement is computed parametrically against requestAnimationFrame timestamp `t` (in seconds):

* **Express Train Movement**: Continuous linear translation with periodic headway:
  $$x_{\text{train}}(t) = ((v \cdot t) \pmod{W + L_{\text{train}}}) - L_{\text{train}}$$
* **Swaying Lanterns & Shop Banners**: Pendulum harmonic oscillation:
  $$\theta(t) = \theta_{\text{max}} \cdot \sin(2\pi f t + \phi) \cdot k_{\text{wind}}$$
* **Water Surface Shimmer**: Sum of low-frequency sine waves:
  $$y_{\text{wave}}(x, t) = A_1 \sin(k_1 x - \omega_1 t) + A_2 \sin(k_2 x - \omega_2 t)$$
* **Steam & Particle Physics**: Plumes drift upward with wind deflection:
  $$x(t) = x_0 + v_w \cdot t + A \sin(\omega t), \quad y(t) = y_0 - v_y \cdot t$$

---

## Part 3: Generalizing for Kanto Tikki

To generalize this methodology for any station, neighborhood pocket, or rental listing in Kanto Tikki, follow this structured four-step implementation:

```
[Listing Reference Packet] ──► [Acoustic & Fact Extraction] ──► [Procedural Canvas Engine] ──► [Living Motion Loop]
  (Field photos + souba)       (Noise layer + massing facts)    (Shoji / Paper Shadowbox)        (6s WebM loop / Card UI)
```

### Step 1: Formulate the Listing Reference Packet
When a new rental listing or neighborhood pocket is ingested:
1. Store research-only reference photos in `renders/raw_refs/<listing_id>/`.
2. Extract physical building dimensions from municipal property records or listing disclosures:
   * Story count, structural type (RC, Wood, Steel), cladding material.
3. Compute noise and sensory context from [`NOISE_BENCHMARKS_METHODOLOGY.md`](NOISE_BENCHMARKS_METHODOLOGY.md):
   * Proximity to viaduct, train horn frequency, local commercial shotengai noise.
4. Add the entry to `renders/PACKETS.json`.

### Step 2: Configure the Typology Registry in `shoji_engine.py`
Map the building’s architectural style to the procedural generator:

```python
# In shoji_engine.py
TYPOLOGY_SPECS = {
    "rc_midrise": {
        "floors_range": (4, 9),
        "facade": "grey-tile",
        "balcony_depth": 1.5,
        "fenestration": "grid",
        "roof": "parapet"
    },
    "tokyo_machiya": {
        "floors_range": (2, 2),
        "facade": "wood",
        "balcony_depth": 0.0,
        "fenestration": "lattice_koshi",
        "roof": "kawara_tile_gable"
    },
    "koyasu_stilt_canal": {
        "floors_range": (2, 3),
        "facade": "weathered_cedar",
        "foundation": "wood_stilts_over_water",
        "water_reflection": True
    }
}
```

### Step 3: Embed the Living Shadowbox Component in Web UI
Use the lightweight Canvas 2D factory pattern (adapted from `eastside-engine.js` and `shoji_ui.html`):

```javascript
// Example: Mounting a Kanto Shadowbox onto any listing card
import { KantoShadowbox } from './kanto-shadowbox-engine.js';

const container = document.getElementById('listing-visual-lv01');
const canvas = document.createElement('canvas');
canvas.width = 1024;
canvas.height = 576;
container.appendChild(canvas);

const engine = KantoShadowbox.create(canvas, {
  corridor: 'keikyu',
  station: 'koyasu',
  typology: 'koyasu_stilt_canal',
  timeOfDay: 'twilight',
  weather: 'clear',
  mode: 'shadowbox',
  enableParallax: true,
  enableLivingMotion: true
});

// Run 60 FPS animation
function loop(timestamp) {
  engine.render(timestamp / 1000);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
```

### Step 4: Video Loop Export (Offline Staging for Production)
For production deployment to edge workers where client-side CPU is constrained or battery preservation is prioritized:
1. Open `shoji_ui.html` in a local browser via `Play Kanto Tikki.command`.
2. Select the target district or listing.
3. Click **"Save 6s Loop"**. The engine utilizes `canvas.captureStream(60)` and `MediaRecorder` with VP9 codec:
   ```javascript
   const stream = canvas.captureStream(60);
   const recorder = new MediaRecorder(stream, {
     mimeType: 'video/webm; codecs=vp9',
     videoBitsPerSecond: 6000000
   });
   ```
4. Place the resulting `.webm` / `.mp4` into `essence/` or `portraits/`.
5. The static app in `index.html` seamlessly serves the looping video with immediate fallback to a high-resolution `.webp` still frame.

---

## Part 4: File & Resource Map

| Component | Path | Description |
| :--- | :--- | :--- |
| **Pipeline Contract** | [`bayarearealestate/docs/VISUAL_PROXIMITY_PIPELINE.md`](file:///Volumes/T9/bayarearealestate/docs/VISUAL_PROXIMITY_PIPELINE.md) | The original foundational specification for proximity error grading. |
| **Kyōjima Framework** | [`kyojimakokogarden/.../PROXIMITY_ERROR_FRAMEWORK.md`](file:///Volumes/T9/makingpancakes/context/kyojimakokogarden/fork-20260901/world/research/PROXIMITY_ERROR_FRAMEWORK.md) | Cultural ethics, dignity boundaries, and layer-by-layer rubric. |
| **Kanto Studio UI** | [`kanto-tikki/shoji_ui.html`](file:///Volumes/T9/kanto-tikki/shoji_ui.html) | Interactive 3D paper shadowbox studio with 33 station skylines & weather controls. |
| **Kanto Shoji Engine** | [`kanto-tikki/shoji_engine.py`](file:///Volumes/T9/kanto-tikki/shoji_engine.py) | Python CLI & procedural renderer for architectural paper studies. |
| **Apricot Studio** | [`apricotlife/apricot-site/lab/eastside-studio.html`](file:///Volumes/T9/apricotlife/apricot-site/lab/eastside-studio.html) | Standalone living paper studio with seed PRNG and character kinematics. |
| **Apricot Engine** | [`apricotlife/apricot-site/eastside/eastside-engine.js`](file:///Volumes/T9/apricotlife/apricot-site/eastside/eastside-engine.js) | Embeddable, zero-dependency Canvas 2D paper shadowbox factory. |
| **Listing Packets** | [`kanto-tikki/renders/PACKETS.json`](file:///Volumes/T9/kanto-tikki/renders/PACKETS.json) | Production registry of structured property facts and positive/negative cues. |
| **Acoustic Standards**| [`kanto-tikki/NOISE_BENCHMARKS_METHODOLOGY.md`](file:///Volumes/T9/kanto-tikki/NOISE_BENCHMARKS_METHODOLOGY.md) | Field-verified soundscape classifications and municipal citations. |

---

*Authored for the Kanto Tikki Project. Grounded in community dignity, empirical accuracy, and craftsmanship.*
