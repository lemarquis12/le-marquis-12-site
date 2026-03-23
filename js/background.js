
(function () {
  'use strict';

  /* ── Respect des préférences système ── */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });

  /* ── Palette ── */
  const C = {
    dark:  '#03030a',
    red:   '#cc0022',
    red2:  '#ff1a35',
    blue:  '#0a4fff',
    blue2: '#3d7aff',
  };

  let W = 0, H = 0;
  let offscreen, offCtx;      // canvas statique
  let stars = [], particles = [], windows = [];
  let rafId = null;
  let lastFrame = 0;
  const FPS_TARGET = 30;
  const FRAME_MS   = 1000 / FPS_TARGET;

  /*RESIZE (debounced)*/
  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      buildOffscreen();
      buildStars();
      buildWindows();
      buildParticles();
    }, 100);
  }
  window.addEventListener('resize', onResize, { passive: true });

  /* CANVAS OFFSCREEN (éléments statiques)*/
  function buildOffscreen() {
    offscreen = document.createElement('canvas');
    offscreen.width  = W;
    offscreen.height = H;
    offCtx = offscreen.getContext('2d', { alpha: false });

    offCtx.fillStyle = C.dark;
    offCtx.fillRect(0, 0, W, H);

    drawGridCeiling(offCtx);
    drawGridFloor(offCtx);
    drawSun(offCtx);
    drawCity(offCtx);
    drawHorizon(offCtx);
    drawVignette(offCtx);
    drawScanlines(offCtx);
  }

  /* ════════════════════════════════════════
     GRILLES
  ════════════════════════════════════════ */
  function drawGridFloor(c) {
    const hy = H * 0.58, vx = W / 2;
    const cols = 20, rows = 14;

    for (let i = 0; i <= cols; i++) {
      const t      = i / cols;
      const bx     = t * W;
      const center = Math.abs(t - 0.5);
      c.beginPath();
      c.moveTo(vx, hy);
      c.lineTo(bx, H + 20);
      c.strokeStyle = center < 0.08
        ? `rgba(204,0,34,0.45)`
        : `rgba(204,0,34,0.09)`;
      c.lineWidth   = center < 0.08 ? 1.2 : 0.4;
      c.stroke();
    }

    for (let j = 0; j <= rows; j++) {
      const t  = Math.pow(j / rows, 1.8);
      const y  = hy + t * (H - hy + 20);
      const xl = vx - vx * t;
      const xr = vx + (W - vx) * t;
      const a  = j === 0 ? 0.55 : 0.06 + t * 0.18;
      c.beginPath();
      c.moveTo(xl, y); c.lineTo(xr, y);
      c.strokeStyle = j % 4 === 0
        ? `rgba(204,0,34,${a + 0.12})`
        : `rgba(10,79,255,${a})`;
      c.lineWidth   = j % 4 === 0 ? 0.9 : 0.4;
      c.stroke();
    }
  }

  function drawGridCeiling(c) {
    const hy = H * 0.42, vx = W / 2;
    const cols = 20, rows = 10;

    for (let i = 0; i <= cols; i++) {
      const t = i / cols, bx = t * W;
      c.beginPath();
      c.moveTo(vx, hy); c.lineTo(bx, -20);
      c.strokeStyle = `rgba(10,79,255,${0.04 + Math.abs(t - 0.5) * 0.04})`;
      c.lineWidth   = 0.35;
      c.stroke();
    }

    for (let j = 0; j <= rows; j++) {
      const t  = Math.pow(j / rows, 1.8);
      const y  = hy - t * hy;
      const xl = vx - vx * t;
      const xr = vx + (W - vx) * t;
      c.beginPath();
      c.moveTo(xl, y); c.lineTo(xr, y);
      c.strokeStyle = `rgba(10,79,255,${0.035 + t * 0.08})`;
      c.lineWidth   = 0.35;
      c.stroke();
    }
  }

  /* ════════════════════════════════════════
     SOLEIL
  ════════════════════════════════════════ */
  function drawSun(c) {
    const sx = W / 2, sy = H * 0.5;
    const r  = Math.min(W, H) * 0.072;

    /* halo */
    const halo = c.createRadialGradient(sx, sy, r * 0.5, sx, sy, r * 2.2);
    halo.addColorStop(0, 'rgba(10,79,255,0.1)');
    halo.addColorStop(1, 'rgba(10,79,255,0)');
    c.fillStyle = halo;
    c.beginPath(); c.arc(sx, sy, r * 2.2, 0, Math.PI * 2); c.fill();

    /* demi-disque rouge */
    c.save();
    c.beginPath(); c.arc(sx, sy, r, Math.PI, 0, false); c.closePath();
    c.fillStyle = C.red; c.fill();

    /* scanlines */
    c.clip();
    for (let i = 0; i < 12; i++) {
      const ly = sy - r + r * 0.05 + i * (r / 6);
      if (ly < sy) { c.fillStyle = 'rgba(0,0,5,0.45)'; c.fillRect(sx - r - 4, ly, (r + 4) * 2, 3); }
    }
    c.restore();

    /* contours */
    c.beginPath(); c.arc(sx, sy, r, Math.PI, 0, false);
    c.strokeStyle = C.red2; c.lineWidth = 1.8; c.stroke();

    c.beginPath(); c.arc(sx, sy, r, 0, Math.PI, false);
    c.strokeStyle = C.blue2; c.lineWidth = 0.8; c.globalAlpha = 0.5; c.stroke();
    c.globalAlpha = 1;
  }

  /* ════════════════════════════════════════
     HORIZON
  ════════════════════════════════════════ */
  function drawHorizon(c) {
    const hy = H * 0.5;
    const g  = c.createLinearGradient(0, hy - 14, 0, hy + 14);
    g.addColorStop(0,   'rgba(255,26,53,0)');
    g.addColorStop(0.5, 'rgba(255,26,53,0.62)');
    g.addColorStop(1,   'rgba(255,26,53,0)');
    c.fillStyle = g; c.fillRect(0, hy - 14, W, 28);

    c.beginPath(); c.moveTo(0, hy); c.lineTo(W, hy);
    c.strokeStyle = C.red2; c.lineWidth = 1.5; c.stroke();

    c.beginPath(); c.moveTo(0, hy + 3); c.lineTo(W, hy + 3);
    c.strokeStyle = C.blue2; c.lineWidth = 0.7; c.globalAlpha = 0.55; c.stroke();
    c.globalAlpha = 1;
  }

  /* ════════════════════════════════════════
     VILLE
  ════════════════════════════════════════ */
  const BLDG = [
    {rx:0.00,w:0.065,h:0.10},{rx:0.06,w:0.040,h:0.16},{rx:0.09,w:0.030,h:0.09},
    {rx:0.11,w:0.050,h:0.20},{rx:0.15,w:0.022,h:0.13},{rx:0.17,w:0.040,h:0.08},
    {rx:0.20,w:0.048,h:0.24},{rx:0.24,w:0.022,h:0.15},{rx:0.26,w:0.058,h:0.17},
    {rx:0.31,w:0.018,h:0.10},{rx:0.32,w:0.062,h:0.27},{rx:0.38,w:0.022,h:0.13},
    {rx:0.40,w:0.052,h:0.19},{rx:0.44,w:0.026,h:0.11},{rx:0.46,w:0.048,h:0.23},
    {rx:0.50,w:0.030,h:0.14},{rx:0.53,w:0.056,h:0.18},{rx:0.58,w:0.036,h:0.10},
    {rx:0.61,w:0.052,h:0.15},{rx:0.66,w:0.040,h:0.13},{rx:0.70,w:0.060,h:0.20},
    {rx:0.75,w:0.030,h:0.08},{rx:0.78,w:0.048,h:0.16},{rx:0.82,w:0.022,h:0.11},
    {rx:0.84,w:0.055,h:0.22},{rx:0.89,w:0.030,h:0.09},{rx:0.92,w:0.050,h:0.14},
    {rx:0.96,w:0.040,h:0.10},
  ];

  function buildWindows() {
    windows = [];
    const hy = H * 0.5;
    BLDG.forEach(b => {
      const bx = b.rx * W, bw = b.w * W, bh = b.h * H;
      const cols = Math.max(1, Math.floor(bw / (W * 0.012)));
      const rows = Math.max(1, Math.floor(bh / (H * 0.028)));
      for (let r = 1; r < rows; r++) {
        for (let cc = 0; cc < cols; cc++) {
          if (Math.random() > 0.52) {
            windows.push({
              x: bx + cc * (W * 0.012) + (W * 0.002),
              y: hy - bh + r * (H * 0.028) + (H * 0.005),
              w: W * 0.007, h: H * 0.012,
              col: Math.random() > 0.55
                ? `rgba(61,122,255,${(.5 + Math.random() * .4).toFixed(2)})`
                : `rgba(255,26,53,${(.35 + Math.random() * .35).toFixed(2)})`,
            });
          }
        }
      }
    });
  }

  function drawCity(c) {
    const hy = H * 0.5;
    c.fillStyle = '#020208';
    BLDG.forEach(b => c.fillRect(b.rx * W, hy - b.h * H, b.w * W, b.h * H));

    windows.forEach(w => { c.fillStyle = w.col; c.fillRect(w.x, w.y, w.w, w.h); });

    c.strokeStyle = 'rgba(204,0,34,0.32)'; c.lineWidth = 0.7;
    BLDG.forEach(b => {
      c.beginPath();
      c.moveTo(b.rx * W, H * 0.5 - b.h * H);
      c.lineTo(b.rx * W + b.w * W, H * 0.5 - b.h * H);
      c.stroke();
    });
  }

  /* ════════════════════════════════════════
     VIGNETTE + SCANLINES (statiques)
  ════════════════════════════════════════ */
  function drawVignette(c) {
    const g = c.createRadialGradient(W/2,H/2,H*.18,W/2,H/2,H*.9);
    g.addColorStop(0,'rgba(0,0,0,0)');
    g.addColorStop(1,'rgba(0,0,0,0.7)');
    c.fillStyle = g; c.fillRect(0,0,W,H);
  }

  function drawScanlines(c) {
    c.fillStyle = 'rgba(0,0,0,0.09)';
    for (let y = 0; y < H; y += 4) c.fillRect(0, y, W, 2);
  }

  /* ════════════════════════════════════════
     ÉTOILES (statiques, redessinées sur offscreen)
  ════════════════════════════════════════ */
  function buildStars() {
    stars = Array.from({length: 140}, () => ({
      x: Math.random() * W,
      y: Math.random() * H * 0.44,
      r: Math.random() * 1.4 + 0.2,
      col: Math.random() > .65 ? C.red2 : (Math.random() > .5 ? C.blue2 : '#fff'),
      a: Math.random() * .75 + .15,
    }));
  }

  function drawStarsOnOff() {
    stars.forEach(s => {
      offCtx.save();
      offCtx.globalAlpha = s.a;
      offCtx.fillStyle   = s.col;
      offCtx.beginPath(); offCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2); offCtx.fill();
      offCtx.restore();
    });
  }

  /* ════════════════════════════════════════
     PARTICULES (animées chaque frame)
  ════════════════════════════════════════ */
  function buildParticles() {
    particles = Array.from({length:32}, () => mkParticle(true));
  }

  function mkParticle(randomY) {
    return {
      x:    Math.random() * W,
      y:    randomY ? H * 0.5 + Math.random() * H * 0.45 : H * 0.95,
      vx:   (Math.random() - 0.5) * 0.45,
      vy:   -(Math.random() * 0.6 + 0.15),
      r:    Math.random() * 1.6 + 0.4,
      col:  Math.random() > .5 ? C.red2 : C.blue2,
      a:    Math.random() * .55 + .2,
      life: randomY ? Math.random() : 0,
    };
  }

  function tickParticles(c) {
    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy; p.life += 0.0025;
      if (p.y < H * 0.08 || p.life >= 1) particles[i] = mkParticle(false);

      c.save();
      c.globalAlpha = p.a * (1 - p.life);
      c.fillStyle   = p.col;
      c.beginPath(); c.arc(p.x, p.y, p.r, 0, Math.PI * 2); c.fill();
      c.restore();
    });
  }

  /* ════════════════════════════════════════
     BOUCLE PRINCIPALE (delta-time limité)
  ════════════════════════════════════════ */
  function render(ts) {
    rafId = requestAnimationFrame(render);

    const delta = ts - lastFrame;
    if (delta < FRAME_MS) return;         // skip frame si trop tôt
    lastFrame = ts - (delta % FRAME_MS);  // rattrapage précis

    /* copie le canvas statique */
    ctx.drawImage(offscreen, 0, 0);

    /* dessine uniquement les particules (layer dynamique) */
    tickParticles(ctx);
  }

  /* ════════════════════════════════════════
     PAUSE / REPRISE (visibilitychange)
  ════════════════════════════════════════ */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      lastFrame = 0;
      rafId = requestAnimationFrame(render);
    }
  });

  /* ════════════════════════════════════════
     INIT
  ════════════════════════════════════════ */
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;

  buildStars();
  buildWindows();
  buildParticles();
  buildOffscreen();
  drawStarsOnOff(); // étoiles sur le canvas statique

  rafId = requestAnimationFrame(render);

})();
