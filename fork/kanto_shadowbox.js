/**
 * kanto_shadowbox.js — Living 3D Animated Paper Shadowbox Engine (Canvas 2D)
 *
 * Renders a handcrafted, multi-layered washi paper theater with:
 *  - Procedural architectural cutout facade matching real listing facts (floors, structure, layout)
 *  - 60 FPS harmonic breathing warm window lighting
 *  - 3D mouse parallax tracking
 *  - Dynamic day/night and atmospheric illumination
 * Zero external dependencies.
 */
(function(global){
  "use strict";

  const WORK_W = 1024;
  const WORK_H = 576;

  const PALETTES = {
    "grey-tile": { wall: [122, 126, 134], trim: [94, 98, 108], win: [44, 56, 80], lit: [255, 214, 140] },
    "rc":        { wall: [162, 160, 152], trim: [134, 132, 124], win: [48, 60, 84], lit: [255, 214, 140] },
    "steel":     { wall: [172, 178, 186], trim: [144, 152, 162], win: [46, 58, 82], lit: [255, 214, 140] },
    "wood":      { wall: [182, 146, 106], trim: [146, 112, 78],  win: [50, 58, 78], lit: [255, 214, 140] },
    "neutral":   { wall: [168, 162, 152], trim: [140, 136, 126], win: [48, 58, 82], lit: [255, 214, 140] }
  };

  const SKY_PAL = {
    morning: { sky0: [40, 55, 95],   sky1: [140, 110, 130], sky2: [250, 170, 120], ink: [24, 20, 32], mid: [110, 95, 120] },
    day:     { sky0: [50, 110, 180], sky1: [130, 180, 220], sky2: [220, 235, 245], ink: [30, 35, 45], mid: [90, 105, 125] },
    dusk:    { sky0: [28, 32, 68],   sky1: [108, 82, 118],  sky2: [212, 132, 88],  ink: [18, 18, 30], mid: [100, 86, 118] },
    night:   { sky0: [10, 12, 28],   sky1: [20, 24, 48],    sky2: [45, 40, 65],    ink: [8, 8, 16],   mid: [35, 35, 55] }
  };

  function lerp(a, b, t) {
    return Math.round(a + (b - a) * t);
  }

  function lerpColor(c0, c1, t) {
    return `rgb(${lerp(c0[0], c1[0], t)}, ${lerp(c0[1], c1[1], t)}, ${lerp(c0[2], c1[2], t)})`;
  }

  class ShadowboxPlayer {
    constructor(canvas, bldgSpec, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.spec = bldgSpec || {};
      this.timeOfDay = options.timeOfDay || 'dusk';
      this.weather = options.weather || 'clear';
      
      this.floors = Math.max(2, Math.min(25, parseInt(this.spec.floors || 5, 10)));
      this.structure = this.spec.structure || 'RC';
      this.facadeKey = this.spec.facade || (this.structure === 'wood' ? 'wood' : (this.structure === 'steel' ? 'steel' : 'rc'));
      this.facade = PALETTES[this.facadeKey] || PALETTES.rc;
      
      this.running = false;
      this.animId = null;
      this.startTime = performance.now();
      
      this.targetParallaxX = 0;
      this.currentParallaxX = 0;
      this.targetParallaxY = 0;
      this.currentParallaxY = 0;

      this.stars = [];
      for (let i = 0; i < 45; i++) {
        this.stars.push({
          x: Math.random() * WORK_W,
          y: Math.random() * (WORK_H * 0.45),
          r: Math.random() * 1.5 + 0.5,
          phase: Math.random() * Math.PI * 2
        });
      }

      this._onMouseMove = this._onMouseMove.bind(this);
      this._onMouseLeave = this._onMouseLeave.bind(this);
      
      this._bindEvents();
      this.start();
    }

    _bindEvents() {
      const parent = this.canvas.parentElement || this.canvas;
      parent.addEventListener('mousemove', this._onMouseMove);
      parent.addEventListener('mouseleave', this._onMouseLeave);
    }

    _unbindEvents() {
      const parent = this.canvas.parentElement || this.canvas;
      parent.removeEventListener('mousemove', this._onMouseMove);
      parent.removeEventListener('mouseleave', this._onMouseLeave);
    }

    _onMouseMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      this.targetParallaxX = nx * 38;
      this.targetParallaxY = ny * 18;
    }

    _onMouseLeave() {
      this.targetParallaxX = 0;
      this.targetParallaxY = 0;
    }

    setTimeOfDay(tod) {
      if (SKY_PAL[tod]) {
        this.timeOfDay = tod;
      }
    }

    start() {
      if (this.running) return;
      this.running = true;
      const loop = (t) => {
        if (!this.running) return;
        this.render(t);
        this.animId = requestAnimationFrame(loop);
      };
      this.animId = requestAnimationFrame(loop);
    }

    stop() {
      this.running = false;
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
      this._unbindEvents();
    }

    render(timestamp) {
      const t = (timestamp - this.startTime) / 1000;
      const ctx = this.ctx;

      // Parallax smoothing
      this.currentParallaxX += (this.targetParallaxX - this.currentParallaxX) * 0.08;
      this.currentParallaxY += (this.targetParallaxY - this.currentParallaxY) * 0.08;

      ctx.clearRect(0, 0, WORK_W, WORK_H);

      const sky = SKY_PAL[this.timeOfDay] || SKY_PAL.dusk;

      // 1. Sky Wash
      this._drawSky(ctx, sky);

      // 2. Stars
      if (this.timeOfDay === 'dusk' || this.timeOfDay === 'night') {
        this._drawStars(ctx, t);
      }

      // 3. Horizon Atmosphere Glow
      this._drawHorizonGlow(ctx, sky, this.currentParallaxX * 0.2);

      // 4. Distant Silhouettes (Layer 1)
      this._drawDistantSilhouettes(ctx, sky, this.currentParallaxX * 0.35);

      // 5. Street & Ground Level (Layer 2)
      const groundY = WORK_H * 0.82;
      this._drawGround(ctx, sky, groundY);

      // 6. Flanking Neighbor Silhouettes (Layer 3)
      this._drawNeighborSilhouettes(ctx, sky, groundY, this.currentParallaxX * 0.6);

      // 7. Main Building Facade with Breathing Shoji Windows (Layer 4)
      this._drawBuilding(ctx, t, groundY, this.currentParallaxX * 1.0, this.currentParallaxY * 0.6);

      // 8. Foreground Street Lamps & Trees (Layer 5)
      this._drawForeground(ctx, t, groundY, this.currentParallaxX * 1.3);

      // 9. Luminous Paper Vignette Frame
      this._drawPaperFrame(ctx);
    }

    _drawSky(ctx, sky) {
      const grad = ctx.createLinearGradient(0, 0, 0, WORK_H * 0.8);
      grad.addColorStop(0, `rgb(${sky.sky0.join(',')})`);
      grad.addColorStop(0.5, `rgb(${sky.sky1.join(',')})`);
      grad.addColorStop(1, `rgb(${sky.sky2.join(',')})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, WORK_W, WORK_H);
    }

    _drawStars(ctx, t) {
      const alphaBase = (this.timeOfDay === 'night') ? 0.8 : 0.45;
      this.stars.forEach(s => {
        const flicker = alphaBase + 0.2 * Math.sin(t * 3 + s.phase);
        ctx.fillStyle = `rgba(255, 248, 220, ${Math.max(0, flicker)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    _drawHorizonGlow(ctx, sky, px) {
      const gy = WORK_H * 0.76;
      const grad = ctx.createRadialGradient(WORK_W * 0.5 + px, gy, 40, WORK_W * 0.5 + px, gy, 480);
      grad.addColorStop(0, `rgba(${sky.sky2.join(',')}, 0.55)`);
      grad.addColorStop(0.6, `rgba(${sky.sky1.join(',')}, 0.20)`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, WORK_H * 0.35, WORK_W, WORK_H * 0.5);
    }

    _drawDistantSilhouettes(ctx, sky, px) {
      ctx.fillStyle = `rgb(${sky.ink[0] + 15}, ${sky.ink[1] + 15}, ${sky.ink[2] + 25})`;
      const base = WORK_H * 0.78;
      
      ctx.beginPath();
      ctx.moveTo(0, WORK_H);
      for (let x = -40; x <= WORK_W + 40; x += 45) {
        const h = 30 + Math.sin(x * 0.015) * 20 + Math.cos(x * 0.04) * 15;
        ctx.lineTo(x + px, base - h);
      }
      ctx.lineTo(WORK_W + 50, WORK_H);
      ctx.closePath();
      ctx.fill();
    }

    _drawGround(ctx, sky, gy) {
      ctx.fillStyle = `rgb(${sky.ink[0]}, ${sky.ink[1]}, ${sky.ink[2]})`;
      ctx.fillRect(0, gy, WORK_W, WORK_H - gy);

      // Pavement curb line
      ctx.strokeStyle = `rgba(255, 230, 180, 0.25)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, gy + 1);
      ctx.lineTo(WORK_W, gy + 1);
      ctx.stroke();
    }

    _drawNeighborSilhouettes(ctx, sky, gy, px) {
      const col = `rgb(${sky.ink[0] + 8}, ${sky.ink[1] + 8}, ${sky.ink[2] + 14})`;
      ctx.fillStyle = col;

      // Left cluster
      let lx = -20 + px;
      while (lx < WORK_W * 0.22) {
        const bw = 48 + (Math.sin(lx) * 20);
        const bh = 90 + (Math.cos(lx * 0.8) * 45);
        ctx.fillRect(lx, gy - bh, bw, bh);
        lx += bw + 8;
      }

      // Right cluster
      let rx = WORK_W * 0.78 + px;
      while (rx < WORK_W + 30) {
        const bw = 52 + (Math.sin(rx) * 20);
        const bh = 85 + (Math.cos(rx * 0.8) * 40);
        ctx.fillRect(rx, gy - bh, bw, bh);
        rx += bw + 8;
      }
    }

    _drawBuilding(ctx, t, gy, px, py) {
      const f = this.facade;
      const floors = this.floors;
      
      // Building dimensions
      const bldgW = Math.min(360, Math.max(220, 180 + floors * 6));
      const storeyH = Math.min(42, Math.max(16, (WORK_H * 0.58) / floors));
      const bldgH = storeyH * floors;
      const bx0 = (WORK_W - bldgW) / 2 + px;
      const by0 = gy - bldgH + py;

      // 1. Facade Main Wall
      ctx.fillStyle = `rgb(${f.wall.join(',')})`;
      ctx.fillRect(bx0, by0, bldgW, bldgH);

      // 2. Facade Trim & Cornice
      ctx.fillStyle = `rgb(${f.trim.join(',')})`;
      ctx.fillRect(bx0 - 6, by0 - 8, bldgW + 12, 8); // roof parapet
      ctx.fillRect(bx0, by0, 6, bldgH);             // left corner pier
      ctx.fillRect(bx0 + bldgW - 6, by0, 6, bldgH); // right corner pier

      // Floor horizontal stringcourses
      for (let s = 1; s < floors; s++) {
        const fy = by0 + s * storeyH;
        ctx.fillRect(bx0, fy - 2, bldgW, 3);
      }

      // 3. Windows & Luminous Shoji Lighting
      const bays = Math.max(2, Math.min(6, Math.floor(bldgW / 48)));
      const bayW = (bldgW - 24) / bays;
      const winW = bayW * 0.68;
      const winH = storeyH * 0.55;

      const isNightOrDusk = (this.timeOfDay === 'dusk' || this.timeOfDay === 'night');

      for (let fl = 0; fl < floors; fl++) {
        const sy = by0 + fl * storeyH + (storeyH - winH) / 2;
        
        for (let b = 0; b < bays; b++) {
          const sx = bx0 + 12 + b * bayW + (bayW - winW) / 2;
          
          // Dark window glass
          ctx.fillStyle = `rgb(${f.win.join(',')})`;
          ctx.fillRect(sx, sy, winW, winH);

          // Glowing light
          if (isNightOrDusk) {
            // Harmonic breathing light per window
            const wave = Math.sin(t * 1.8 + fl * 1.2 + b * 2.3);
            const isLit = (wave > -0.3);
            
            if (isLit) {
              const intensity = 0.72 + 0.28 * Math.sin(t * 2.5 + fl + b * 1.7);
              ctx.fillStyle = `rgba(${f.lit.join(',')}, ${intensity})`;
              ctx.fillRect(sx + 2, sy + 2, winW - 4, winH - 4);

              // Warm window frame lattice
              ctx.strokeStyle = `rgba(80, 50, 20, 0.45)`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(sx + winW / 2, sy + 2);
              ctx.lineTo(sx + winW / 2, sy + winH - 2);
              ctx.moveTo(sx + 2, sy + winH / 2);
              ctx.lineTo(sx + winW - 2, sy + winH / 2);
              ctx.stroke();

              // Window Bloom glow
              const glow = ctx.createRadialGradient(sx + winW/2, sy + winH/2, 2, sx + winW/2, sy + winH/2, winW);
              glow.addColorStop(0, `rgba(${f.lit.join(',')}, 0.25)`);
              glow.addColorStop(1, 'rgba(0,0,0,0)');
              ctx.fillStyle = glow;
              ctx.fillRect(sx - winW * 0.4, sy - winH * 0.4, winW * 1.8, winH * 1.8);
            }
          }

          // Window frame outline
          ctx.strokeStyle = `rgb(${f.trim.join(',')})`;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(sx, sy, winW, winH);
        }
      }

      // 4. Ground Entrance & Canopy
      const entW = Math.min(70, bldgW * 0.35);
      const entH = Math.min(storeyH * 0.9, 36);
      const entX = bx0 + (bldgW - entW) / 2;
      const entY = gy - entH;

      ctx.fillStyle = `rgba(25, 20, 30, 0.95)`;
      ctx.fillRect(entX, entY, entW, entH);

      // Entrance Warm Lantern Glow
      if (isNightOrDusk) {
        ctx.fillStyle = `rgba(255, 210, 130, 0.9)`;
        ctx.fillRect(entX + entW/2 - 4, entY + 4, 8, 10);

        const entGlow = ctx.createRadialGradient(entX + entW/2, entY + 8, 2, entX + entW/2, entY + 8, 60);
        entGlow.addColorStop(0, 'rgba(255, 214, 140, 0.55)');
        entGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = entGlow;
        ctx.fillRect(entX - 30, entY - 20, entW + 60, entH + 40);
      }

      // Building Hand-inked Outlines
      ctx.strokeStyle = `rgba(18, 14, 24, 0.65)`;
      ctx.lineWidth = 2;
      ctx.strokeRect(bx0, by0, bldgW, bldgH);
    }

    _drawForeground(ctx, t, gy, px) {
      // Left street lamp
      const lx = WORK_W * 0.24 + px;
      this._drawStreetLamp(ctx, t, lx, gy);

      // Right street lamp
      const rx = WORK_W * 0.76 + px;
      this._drawStreetLamp(ctx, t, rx, gy);
    }

    _drawStreetLamp(ctx, t, x, gy) {
      const poleH = 68;
      ctx.strokeStyle = `rgba(20, 20, 28, 0.95)`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, gy);
      ctx.lineTo(x, gy - poleH);
      ctx.lineTo(x + 8, gy - poleH - 6);
      ctx.stroke();

      if (this.timeOfDay === 'dusk' || this.timeOfDay === 'night') {
        const pulse = 0.85 + 0.15 * Math.sin(t * 3.2 + x);
        ctx.fillStyle = `rgba(255, 220, 140, ${pulse})`;
        ctx.beginPath();
        ctx.arc(x + 8, gy - poleH - 6, 4, 0, Math.PI * 2);
        ctx.fill();

        const glow = ctx.createRadialGradient(x + 8, gy - poleH - 6, 2, x + 8, gy - poleH - 6, 45);
        glow.addColorStop(0, `rgba(255, 214, 130, ${0.45 * pulse})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(x - 40, gy - poleH - 50, 95, 95);
      }
    }

    _drawPaperFrame(ctx) {
      // Shadowbox Inner Border & Vignette
      const frameGrad = ctx.createRadialGradient(WORK_W/2, WORK_H/2, WORK_H * 0.4, WORK_W/2, WORK_H/2, WORK_W * 0.7);
      frameGrad.addColorStop(0, 'rgba(0,0,0,0)');
      frameGrad.addColorStop(0.85, 'rgba(5, 7, 12, 0.45)');
      frameGrad.addColorStop(1, 'rgba(3, 4, 8, 0.92)');
      ctx.fillStyle = frameGrad;
      ctx.fillRect(0, 0, WORK_W, WORK_H);

      // Washi Paper Deckle Border
      ctx.strokeStyle = 'rgba(245, 235, 215, 0.18)';
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, WORK_W - 8, WORK_H - 8);

      ctx.strokeStyle = 'rgba(215, 175, 110, 0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, WORK_W - 20, WORK_H - 20);
    }
  }

  let activePlayer = null;

  // Global mounting API
  global.KantoShadowbox = {
    mount(container, bldgSpec, options) {
      const el = typeof container === 'string' ? document.getElementById(container) : container;
      if (!el) return null;
      if (activePlayer) {
        activePlayer.stop();
        activePlayer = null;
      }
      el.innerHTML = '';
      const canvas = document.createElement('canvas');
      canvas.width = WORK_W;
      canvas.height = WORK_H;
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      canvas.style.display = 'block';
      canvas.style.borderRadius = '8px';
      canvas.className = 'shadowbox-canvas';
      el.appendChild(canvas);
      activePlayer = new ShadowboxPlayer(canvas, bldgSpec, options);
      return activePlayer;
    },
    unmount() {
      if (activePlayer) {
        activePlayer.stop();
        activePlayer = null;
      }
    },
    getActivePlayer() {
      return activePlayer;
    }
  };

})(window);
