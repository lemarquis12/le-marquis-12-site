// ═══════════════════════════════════════════
//   BACKGROUND ANIMÉ — CYBERPUNK NOIR/ROUGE/BLEU
// ═══════════════════════════════════════════

(function () {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const RED   = '#cc0022';
  const RED2  = '#ff1a35';
  const BLUE  = '#0a4fff';
  const BLUE2 = '#3d7aff';
  const DARK  = '#03030a';

  let W, H, animId;

  // ─── Resize ──────────────────────────────
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // ─── Grille sol (perspective) ────────────
  function drawGridFloor() {
    const hy  = H * 0.58;
    const vx  = W / 2;
    const cols = 20;
    const rows = 14;

    // lignes fuyantes
    for (let i = 0; i <= cols; i++) {
      const t  = i / cols;
      const bx = t * W;
      const center = Math.abs(t - 0.5);
      const alpha  = center < 0.08 ? 0.45 : 0.09;
      const lw     = center < 0.08 ? 1.2  : 0.4;
      ctx.beginPath();
      ctx.moveTo(vx, hy);
      ctx.lineTo(bx, H + 20);
      ctx.strokeStyle = `rgba(204,0,34,${alpha})`;
      ctx.lineWidth   = lw;
      ctx.stroke();
    }

    // lignes horizontales
    for (let j = 0; j <= rows; j++) {
      const t  = Math.pow(j / rows, 1.8);
      const y  = hy + t * (H - hy + 20);
      const xl = vx  - vx  * t;
      const xr = vx  + (W - vx) * t;
      const a  = j === 0 ? 0.55 : 0.06 + t * 0.18;
      const isAccent = j % 4 === 0;
      ctx.beginPath();
      ctx.moveTo(xl, y);
      ctx.lineTo(xr, y);
      ctx.strokeStyle = isAccent
        ? `rgba(204,0,34,${a + 0.12})`
        : `rgba(10,79,255,${a})`;
      ctx.lineWidth   = isAccent ? 0.9 : 0.4;
      ctx.stroke();
    }
  }

  // ─── Grille plafond ──────────────────────
  function drawGridCeiling() {
    const hy  = H * 0.42;
    const vx  = W / 2;
    const cols = 20;
    const rows = 10;

    for (let i = 0; i <= cols; i++) {
      const t  = i / cols;
      const bx = t * W;
      ctx.beginPath();
      ctx.moveTo(vx, hy);
      ctx.lineTo(bx, -20);
      ctx.strokeStyle = `rgba(10,79,255,${0.04 + Math.abs(t - 0.5) * 0.04})`;
      ctx.lineWidth   = 0.35;
      ctx.stroke();
    }

    for (let j = 0; j <= rows; j++) {
      const t  = Math.pow(j / rows, 1.8);
      const y  = hy - t * hy;
      const xl = vx  - vx  * t;
      const xr = vx  + (W - vx) * t;
      ctx.beginPath();
      ctx.moveTo(xl, y);
      ctx.lineTo(xr, y);
      ctx.strokeStyle = `rgba(10,79,255,${0.035 + t * 0.08})`;
      ctx.lineWidth   = 0.35;
      ctx.stroke();
    }
  }

  // ─── Soleil couchant ─────────────────────
  function drawSun() {
    const sx = W / 2;
    const sy = H * 0.5;
    const r  = Math.min(W, H) * 0.072;

    // halo externe bleu
    const halo = ctx.createRadialGradient(sx, sy, r * 0.5, sx, sy, r * 2.2);
    halo.addColorStop(0, 'rgba(10,79,255,0.1)');
    halo.addColorStop(1, 'rgba(10,79,255,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(sx, sy, r * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // demi-disque rouge
    ctx.save();
    ctx.beginPath();
    ctx.arc(sx, sy, r, Math.PI, 0, false);
    ctx.closePath();
    ctx.fillStyle = RED;
    ctx.fill();

    // scanlines sur le soleil
    ctx.clip();
    for (let i = 0; i < 12; i++) {
      const ly = sy - r + r * 0.05 + i * (r / 6);
      if (ly < sy) {
        ctx.fillStyle = 'rgba(0,0,5,0.45)';
        ctx.fillRect(sx - r - 4, ly, (r + 4) * 2, 3);
      }
    }
    ctx.restore();

    // contour haut
    ctx.beginPath();
    ctx.arc(sx, sy, r, Math.PI, 0, false);
    ctx.strokeStyle = RED2;
    ctx.lineWidth   = 1.8;
    ctx.stroke();

    // arc bleu bas
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI, false);
    ctx.strokeStyle = BLUE2;
    ctx.lineWidth   = 0.8;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // ─── Ligne horizon ───────────────────────
  function drawHorizon() {
    const hy  = H * 0.5;
    const grd = ctx.createLinearGradient(0, hy - 14, 0, hy + 14);
    grd.addColorStop(0,   'rgba(255,26,53,0)');
    grd.addColorStop(0.5, 'rgba(255,26,53,0.65)');
    grd.addColorStop(1,   'rgba(255,26,53,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, hy - 14, W, 28);

    ctx.beginPath();
    ctx.moveTo(0, hy); ctx.lineTo(W, hy);
    ctx.strokeStyle = RED2;
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, hy + 3); ctx.lineTo(W, hy + 3);
    ctx.strokeStyle = BLUE2;
    ctx.lineWidth   = 0.7;
    ctx.globalAlpha = 0.55;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // ─── Skyline ville ───────────────────────
  const BUILDINGS_BASE = [
    { rx: 0.00, w: 0.065, h: 0.10 },
    { rx: 0.06, w: 0.040, h: 0.16 },
    { rx: 0.09, w: 0.030, h: 0.09 },
    { rx: 0.11, w: 0.050, h: 0.20 },
    { rx: 0.15, w: 0.022, h: 0.13 },
    { rx: 0.17, w: 0.040, h: 0.08 },
    { rx: 0.20, w: 0.048, h: 0.24 },
    { rx: 0.24, w: 0.022, h: 0.15 },
    { rx: 0.26, w: 0.058, h: 0.17 },
    { rx: 0.31, w: 0.018, h: 0.10 },
    { rx: 0.32, w: 0.062, h: 0.27 },
    { rx: 0.38, w: 0.022, h: 0.13 },
    { rx: 0.40, w: 0.052, h: 0.19 },
    { rx: 0.44, w: 0.026, h: 0.11 },
    { rx: 0.46, w: 0.048, h: 0.23 },
    { rx: 0.50, w: 0.030, h: 0.14 },
    { rx: 0.53, w: 0.056, h: 0.18 },
    { rx: 0.58, w: 0.036, h: 0.10 },
    { rx: 0.61, w: 0.052, h: 0.15 },
    { rx: 0.66, w: 0.040, h: 0.13 },
    { rx: 0.70, w: 0.060, h: 0.20 },
    { rx: 0.75, w: 0.030, h: 0.08 },
    { rx: 0.78, w: 0.048, h: 0.16 },
    { rx: 0.82, w: 0.022, h: 0.11 },
    { rx: 0.84, w: 0.055, h: 0.22 },
    { rx: 0.89, w: 0.030, h: 0.09 },
    { rx: 0.92, w: 0.050, h: 0.14 },
    { rx: 0.96, w: 0.040, h: 0.10 },
  ];

  // fenêtres pré-générées (stable entre frames)
  let windows = [];
  function buildWindows() {
    windows = [];
    const hy = H * 0.5;
    BUILDINGS_BASE.forEach(b => {
      const bx = b.rx * W;
      const bw = b.w  * W;
      const bh = b.h  * H;
      const cols = Math.floor(bw / (W * 0.012));
      const rows = Math.floor(bh / (H * 0.028));
      for (let r = 1; r < rows; r++) {
        for (let cc = 0; cc < cols; cc++) {
          if (Math.random() > 0.52) {
            windows.push({
              x: bx + cc * (W * 0.012) + (W * 0.002),
              y: hy - bh + r * (H * 0.028) + (H * 0.005),
              w: W * 0.007, h: H * 0.012,
              col: Math.random() > 0.55
                ? `rgba(61,122,255,${0.5 + Math.random() * 0.4})`
                : `rgba(255,26,53,${0.35 + Math.random() * 0.35})`,
            });
          }
        }
      }
    });
  }

  function drawCity() {
    const hy = H * 0.5;

    // corps bâtiments
    ctx.fillStyle = '#020208';
    BUILDINGS_BASE.forEach(b => {
      ctx.fillRect(b.rx * W, hy - b.h * H, b.w * W, b.h * H);
    });

    // fenêtres
    windows.forEach(win => {
      ctx.fillStyle = win.col;
      ctx.fillRect(win.x, win.y, win.w, win.h);
    });

    // ligne de toit rouge
    ctx.strokeStyle = 'rgba(204,0,34,0.35)';
    ctx.lineWidth   = 0.7;
    BUILDINGS_BASE.forEach(b => {
      ctx.beginPath();
      ctx.moveTo(b.rx * W,           hy - b.h * H);
      ctx.lineTo(b.rx * W + b.w * W, hy - b.h * H);
      ctx.stroke();
    });
  }

  // ─── Étoiles ─────────────────────────────
  let stars = [];
  function buildStars() {
    stars = Array.from({ length: 140 }, () => ({
      x:   Math.random() * W,
      y:   Math.random() * H * 0.44,
      r:   Math.random() * 1.4 + 0.2,
      col: Math.random() > 0.65 ? RED2 : (Math.random() > 0.5 ? BLUE2 : '#fff'),
      a:   Math.random() * 0.75 + 0.15,
    }));
  }

  function drawStars() {
    stars.forEach(s => {
      ctx.save();
      ctx.globalAlpha = s.a;
      ctx.fillStyle   = s.col;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // ─── Particules flottantes ───────────────
  let particles = [];
  function buildParticles() {
    particles = Array.from({ length: 35 }, () => spawnParticle());
  }
  function spawnParticle() {
    return {
      x:    Math.random() * W,
      y:    H * 0.5 + Math.random() * H * 0.4,
      vx:   (Math.random() - 0.5) * 0.45,
      vy:   -(Math.random() * 0.6 + 0.15),
      r:    Math.random() * 1.6 + 0.4,
      col:  Math.random() > 0.5 ? RED2 : BLUE2,
      a:    Math.random() * 0.55 + 0.2,
      life: Math.random(),
    };
  }

  function updateParticles() {
    particles.forEach((p, i) => {
      p.x    += p.vx;
      p.y    += p.vy;
      p.life += 0.0025;
      if (p.y < H * 0.08 || p.life > 1) {
        particles[i] = spawnParticle();
        particles[i].y    = H * 0.95;
        particles[i].life = 0;
      }
    });
  }

  function drawParticles() {
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.a * (1 - p.life);
      ctx.fillStyle   = p.col;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // ─── Vignette ────────────────────────────
  function drawVignette() {
    const grd = ctx.createRadialGradient(W / 2, H / 2, H * 0.18, W / 2, H / 2, H * 0.9);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(1, 'rgba(0,0,0,0.72)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
  }

  // ─── Scanlines ───────────────────────────
  function drawScanlines() {
    for (let y = 0; y < H; y += 4) {
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, y, W, 2);
    }
  }

  // ─── Rebuild on resize ───────────────────
  function rebuild() {
    buildStars();
    buildWindows();
    buildParticles();
  }
  window.addEventListener('resize', rebuild);
  rebuild();

  // ─── Boucle principale ───────────────────
  function render() {
    ctx.fillStyle = DARK;
    ctx.fillRect(0, 0, W, H);

    drawGridCeiling();
    drawGridFloor();
    drawSun();
    drawCity();
    drawHorizon();
    drawStars();
    updateParticles();
    drawParticles();
    drawVignette();
    drawScanlines();

    animId = requestAnimationFrame(render);
  }

  render();

})();
