
(function () {
  // =========================================================================
  //  DEFAULTS — paste the JSON from "Copy settings" over this object to bake
  //  your look into the file. Every value here is live-editable in the panel.
  // =========================================================================
  const DEFAULTS = {
    "beamX": 0.18,
    "beamTilt": 0,
    "coreWidth": 2,
    "coreBrightness": 0.3,
    "flicker": 0.14,
    "glow": 0.4,
    "hazeWidth": 0,
    "hazeBlur": 0,
    "hazeIntensity": 0,
    "filaments": 8,
    "filamentAmp": 10,
    "filamentWidth": 1.2,
    "filamentBrightness": 1,
    "twistSpeed": 0.45,
    "twistLength": 0.27,
    "pinch": 1,
    "nodes": 5,
    "nodeMin": 24,
    "nodeMax": 48,
    "nodeBrightness": 1,
    "nodeHalo": 0.8,
    "nodePulse": 2.2,
    "nodeLife": 11,
    "nodeDrift": 0.12,
    "nodeWobble": 2.5,
    "nodeSpread": 0.12,
    "particles": 45,
    "moteSize": 0.2,
    "moteSpeed": 0.7,
    "moteRise": 0.6,
    "moteTwinkle": 4,
    "moteBrightness": 2,
    "clouds": 0,
    "cloudAlpha": 0,
    "cloudSize": 0.2,
    "vignette": 0.31,
    "backgroundOpacity": 0.25,
    "mousePull": 0.1,
    "mouseReach": 0.45,
    "motePull": 0.011,
    "easing": 0.06,
    "speed": 1,
    "paused": false,
    "colBg": "#050c1e",
    "colCloud": "#163069",
    "colGold": "#ffa040",
    "colWarm": "#ffc878",
    "colHot": "#fff8e8"
};

  // Panel schema: [key, label, min, max, step] or ['section', name]
  const SCHEMA = [
    ['section', 'Beam', true],
    ['beamX', 'Height (bottom to top)', 0, 1, 0.005],
    ['beamTilt', 'Tilt', -0.6, 0.6, 0.01],
    ['coreWidth', 'Core width', 0.5, 8, 0.1],
    ['coreBrightness', 'Core brightness', 0, 2, 0.05],
    ['flicker', 'Flicker', 0, 0.5, 0.01],
    ['glow', 'Glow', 0, 3, 0.05],
    ['hazeWidth', 'Haze width', 0, 400, 5],
    ['hazeBlur', 'Haze softness', 0, 120, 1],
    ['hazeIntensity', 'Haze intensity', 0, 0.8, 0.01],
    ['section', 'Filaments'],
    ['filaments', 'Strands', 0, 16, 1],
    ['filamentAmp', 'Spread', 0, 60, 1],
    ['filamentWidth', 'Thickness', 0.3, 8, 0.1],
    ['filamentBrightness', 'Brightness', 0, 2, 0.05],
    ['twistSpeed', 'Twist speed', -3, 3, 0.05],
    ['twistLength', 'Twist length', 0.05, 1, 0.01],
    ['pinch', 'Pinch', 0, 1, 0.05],
    ['section', 'Points of light'],
    ['nodes', 'Count', 0, 20, 1],
    ['nodeMin', 'Min size', 4, 120, 1],
    ['nodeMax', 'Max size', 4, 160, 1],
    ['nodeBrightness', 'Brightness', 0, 2, 0.05],
    ['nodeHalo', 'Halo size', 0, 3, 0.05],
    ['nodePulse', 'Pulse speed', 0, 8, 0.1],
    ['nodeLife', 'Lifetime (s)', 1, 40, 0.5],
    ['nodeDrift', 'Drift', 0, 1, 0.01],
    ['nodeWobble', 'Wobble', 0, 20, 0.5],
    ['nodeSpread', 'Min spacing', 0, 0.4, 0.01],
    ['section', 'Motes'],
    ['particles', 'Count', 0, 400, 1],
    ['moteSize', 'Size', 0.2, 4, 0.1],
    ['moteSpeed', 'Speed', 0, 5, 0.1],
    ['moteRise', 'Rise', -3, 3, 0.1],
    ['moteTwinkle', 'Twinkle', 0, 4, 0.1],
    ['moteBrightness', 'Brightness', 0, 2, 0.05],
    ['section', 'Atmosphere'],
    ['backgroundOpacity', 'Background tint', 0, 1, 0.01],
    ['clouds', 'Nebula clouds', 0, 16, 1],
    ['cloudAlpha', 'Cloud opacity', 0, 0.8, 0.01],
    ['cloudSize', 'Cloud size', 0.2, 3, 0.1],
    ['vignette', 'Vignette', 0, 1, 0.01],
    ['section', 'Interaction'],
    ['mousePull', 'Beam pull', 0, 1, 0.01],
    ['mouseReach', 'Pull reach', 0.05, 2, 0.01],
    ['motePull', 'Mote pull', 0, 0.08, 0.001],
    ['easing', 'Easing', 0.005, 0.3, 0.005],
    ['section', 'Motion'],
    ['speed', 'Time scale', 0, 4, 0.05],
    ['paused', 'Pause', 'check'],
    ['section', 'Colors'],
    ['colBg', 'Background', 'color'],
    ['colCloud', 'Nebula', 'color'],
    ['colGold', 'Gold', 'color'],
    ['colWarm', 'Warm glow', 'color'],
    ['colHot', 'Hot core', 'color'],
  ];

  const CONFIG = Object.assign({}, DEFAULTS);
  try {
    const saved = JSON.parse(localStorage.getItem('moira-horizontal-beam-settings-v2') || 'null');
    // Update this one approved value while retaining other saved adjustments.
    if(saved && !localStorage.getItem('moira-beam-pull-010')){saved.mousePull=0.1;localStorage.setItem('moira-horizontal-beam-settings-v2',JSON.stringify(saved));}
    localStorage.setItem('moira-beam-pull-010','1');
    if(saved && !localStorage.getItem('moira-motes-45-02-4-011')){Object.assign(saved,{particles:45,moteSize:0.2,moteTwinkle:4,motePull:0.011});localStorage.setItem('moira-horizontal-beam-settings-v2',JSON.stringify(saved));}
    localStorage.setItem('moira-motes-45-02-4-011','1');
    if (saved && typeof saved === 'object') for (const k in DEFAULTS) if (k in saved) CONFIG[k] = saved[k];
  } catch (e) { /* storage unavailable; defaults are fine */ }

  // ---------- helpers ----------
  const canvas=document.createElement('canvas');canvas.id='landing-golden-beam';
  canvas.setAttribute('aria-hidden','true');
  canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:50000;pointer-events:none;opacity:0;transition:opacity 1.4s ease';
  document.querySelector('.background').appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, DPR = 1;
  let particles = [], clouds = [], nodes = [];
  const C = {}; // parsed rgb colors

  function rand(a, b) { return a + Math.random() * (b - a); }
  function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function rgba(rgb, a) { return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${Math.max(0, Math.min(1, a)).toFixed(4)})`; }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t].map(Math.round); }
  function parseColors() {
    C.bg = hexToRgb(CONFIG.colBg); C.cloud = hexToRgb(CONFIG.colCloud);
    C.gold = hexToRgb(CONFIG.colGold); C.warm = hexToRgb(CONFIG.colWarm); C.hot = hexToRgb(CONFIG.colHot);
    C.goldDeep = mix(C.gold, [0, 0, 0], 0.15);
  }
  parseColors();

  // Light falloff: alpha = 1/(1+(r/knee)^2), sampled into stops so no edge ever shows
  function glowEllipse(x, y, rx, ry, alpha, rgb, knee) {
    if (rx <= 0 || ry <= 0 || alpha <= 0) return;
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    const N = 14;
    for (let i = 0; i <= N; i++) {
      const s = i / N;
      const a = alpha / (1 + Math.pow(s / knee, 2)) * (1 - s * s);
      g.addColorStop(s, rgba(rgb, a));
    }
    ctx.save(); ctx.translate(x, y); ctx.scale(rx, ry);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // ---------- pointer ----------
  const mouse = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, active: 0, tActive: 0 };
  function setPointer(e) {
    if (e.target && e.target.closest && e.target.closest('#beam-panel, #beam-toggle')) { mouse.tActive = 0; return; }
    const p = e.touches ? e.touches[0] : e;
    if (!p) return;
    mouse.tx = innerHeight-p.clientY; mouse.ty = p.clientX; mouse.tActive = 1;
  }
  window.addEventListener('mousemove', setPointer, { passive: true });
  window.addEventListener('touchmove', setPointer, { passive: true });
  window.addEventListener('touchstart', setPointer, { passive: true });
  window.addEventListener('touchend', () => { mouse.tActive = 0; });
  document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) mouse.tActive = 0; });

  function beamX(y) {
    const x0 = W * CONFIG.beamX + (y - H / 2) * CONFIG.beamTilt;
    if (mouse.active < 0.001 || CONFIG.mousePull === 0) return x0;
    const reach = H * CONFIG.mouseReach;
    const d = (y - mouse.y) / reach;
    const w = Math.exp(-d * d * 2);
    return x0 + (mouse.x - x0) * CONFIG.mousePull * w * mouse.active;
  }

  // ---------- seeding ----------
  function makeParticle() {
    return { x: rand(0, W), y: rand(0, H), r: rand(0.6, 2.8), vx: rand(-0.06, 0.06), vy: rand(0.04, 0.16),
             phase: rand(0, Math.PI * 2), speed: rand(0.4, 1.4), depth: rand(0.3, 1) };
  }
  function makeCloud() {
    const m = Math.min(W, H);
    return { x: rand(0, W), y: rand(0, H), r: rand(m * 0.35, m * 0.7), vx: rand(-0.05, 0.05), vy: rand(-0.03, 0.03), a: rand(0.7, 1.3) };
  }
  function respawnNode(n, initial) {
    let y, tries = 0;
    do { y = rand(H * 0.05, H * 0.95); tries++; }
    while (tries < 12 && nodes.some(o => o !== n && Math.abs(o.y - y) < H * CONFIG.nodeSpread));
    const lo = Math.min(CONFIG.nodeMin, CONFIG.nodeMax), hi = Math.max(CONFIG.nodeMin, CONFIG.nodeMax);
    n.y = y; n.vy = rand(-1, 1); n.size = rand(lo, hi); n.wobble = rand(0, 1);
    n.pulseSpeed = rand(0.55, 1.55); n.phase = rand(0, Math.PI * 2);
    n.life = CONFIG.nodeLife * rand(0.55, 1.45); n.fadeIn = rand(1.2, 3); n.fadeOut = rand(1.5, 3.5);
    n.age = initial ? rand(0, n.life * 0.8) : 0;
  }
  function syncCounts() {
    while (particles.length < CONFIG.particles) particles.push(makeParticle());
    particles.length = Math.min(particles.length, CONFIG.particles);
    while (clouds.length < CONFIG.clouds) clouds.push(makeCloud());
    clouds.length = Math.min(clouds.length, CONFIG.clouds);
    while (nodes.length < CONFIG.nodes) { const n = {}; nodes.push(n); respawnNode(n, true); }
    nodes.length = Math.min(nodes.length, CONFIG.nodes);
  }
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    W = canvas.clientHeight; H = canvas.clientWidth;
    canvas.width = Math.floor(H * DPR); canvas.height = Math.floor(W * DPR);
    ctx.setTransform(0, -DPR, DPR, 0, 0, W * DPR);
    particles = []; clouds = []; nodes = [];
    syncCounts();
  }

  // ---------- drawing ----------
  function drawBackground(t, dt) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = rgba(C.bg, CONFIG.backgroundOpacity);
    ctx.fillRect(0, 0, W, H);
    for (const c of clouds) {
      c.x += c.vx * dt; c.y += c.vy * dt;
      const r = c.r * CONFIG.cloudSize;
      if (c.x < -r) c.x = W + r; if (c.x > W + r) c.x = -r;
      if (c.y < -r) c.y = H + r; if (c.y > H + r) c.y = -r;
      const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r);
      g.addColorStop(0, rgba(C.cloud, CONFIG.cloudAlpha * c.a));
      g.addColorStop(1, rgba(C.cloud, 0));
      ctx.fillStyle = g; ctx.fillRect(c.x - r, c.y - r, r * 2, r * 2);
    }
    if (CONFIG.vignette > 0) {
      const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.8);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${CONFIG.vignette})`);
      ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    }
  }

  function drawParticles(t, dt) {
    ctx.globalCompositeOperation = 'lighter';
    for (const p of particles) {
      if (mouse.active > 0.001 && CONFIG.motePull > 0) {
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy) + 1;
        const reach = Math.min(W, H) * 0.5;
        const pull = CONFIG.motePull * mouse.active * Math.max(0, 1 - dist / reach);
        p.x += (dx / dist) * pull * 60 * p.depth * dt;
        p.y += (dy / dist) * pull * 60 * p.depth * dt;
      }
      p.x += p.vx * CONFIG.moteSpeed * dt;
      p.y -= p.vy * CONFIG.moteSpeed * CONFIG.moteRise * dt;
      if (p.y < -10) { p.y = H + 10; p.x = rand(0, W); }
      if (p.y > H + 10) { p.y = -10; p.x = rand(0, W); }
      if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
      const tw = 1 - CONFIG.moteTwinkle * 0.45 * (0.5 - 0.5 * Math.sin(t * p.speed + p.phase));
      const a = tw * p.depth * CONFIG.moteBrightness;
      const r = p.r * CONFIG.moteSize;
      glowEllipse(p.x, p.y, r * 5, r * 5, a * 0.5, C.gold, 0.5);
      glowEllipse(p.x, p.y, r * 1.6, r * 1.6, a, C.warm, 0.45);
    }
  }

  function drawBeam(t, dt) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const segs = Math.max(80, Math.floor(H / 4));
    function tracePath(offsetFn) {
      ctx.beginPath();
      for (let s = 0; s <= segs; s++) {
        const y = -10 + (s / segs) * (H + 20);
        const x = beamX(y) + (offsetFn ? offsetFn(y) : 0);
        if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
    }

    // 1. ambient haze
    if (CONFIG.hazeWidth > 0 && CONFIG.hazeIntensity > 0) {
      ctx.save();
      ctx.filter = `blur(${CONFIG.hazeBlur}px)`;
      tracePath(); ctx.lineWidth = CONFIG.hazeWidth;
      ctx.strokeStyle = rgba(C.gold, CONFIG.hazeIntensity * CONFIG.glow); ctx.stroke();
      ctx.filter = `blur(${CONFIG.hazeBlur / 3}px)`;
      ctx.lineWidth = CONFIG.hazeWidth / 3;
      ctx.strokeStyle = rgba(C.gold, CONFIG.hazeIntensity * 0.8 * CONFIG.glow); ctx.stroke();
      ctx.restore();
    }

    // 2. twisting filaments
    const freq = (2 * Math.PI) / (H * CONFIG.twistLength);
    for (let i = 0; i < CONFIG.filaments; i++) {
      const f = i / CONFIG.filaments;
      const amp = CONFIG.filamentAmp * (0.5 + ((i * 7) % CONFIG.filaments) / CONFIG.filaments);
      const phase = f * Math.PI * 2;
      const speed = CONFIG.twistSpeed * (0.8 + 0.4 * f);
      const alpha = (0.22 + 0.3 * (1 - f)) * CONFIG.filamentBrightness;
      tracePath((y) => {
        const ang = y * freq - t * speed + phase;
        const envelope = 1 - CONFIG.pinch + CONFIG.pinch * Math.sin(y * freq * 0.5 + t * 0.3);
        return Math.sin(ang) * amp * envelope;
      });
      ctx.strokeStyle = rgba(C.gold, alpha * CONFIG.glow);
      ctx.lineWidth = CONFIG.filamentWidth;
      ctx.shadowColor = rgba(C.gold, 0.9); ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.strokeStyle = rgba(C.warm, alpha * 0.9);
      ctx.lineWidth = CONFIG.filamentWidth * 0.35;
      ctx.shadowBlur = 0;
      ctx.stroke();
    }

    // 3. core
    const flicker = 1 - CONFIG.flicker + CONFIG.flicker * Math.sin(t * 9.1) * Math.sin(t * 3.7);
    const cb = CONFIG.coreBrightness;
    const layers = [
      [26, rgba(C.goldDeep, 0.10 * CONFIG.glow * cb)],
      [12, rgba(C.gold, 0.28 * CONFIG.glow * cb)],
      [5, rgba(C.warm, 0.55 * flicker * cb)],
      [CONFIG.coreWidth, rgba(C.hot, 0.95 * flicker * cb)],
    ];
    for (const [w, col] of layers) { tracePath(); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke(); }

    // 4. points of light
    for (const n of nodes) {
      n.age += dt / 60;
      n.y += n.vy * CONFIG.nodeDrift * dt;
      if (n.age > n.life || n.y < -80 || n.y > H + 80) respawnNode(n, false);
      const env = Math.max(0, Math.min(Math.min(1, n.age / n.fadeIn), Math.min(1, (n.life - n.age) / n.fadeOut)));
      const pulse = env * (0.7 + 0.3 * Math.sin(t * n.pulseSpeed * CONFIG.nodePulse + n.phase)) * (0.9 + 0.1 * Math.sin(t * 11 + n.phase * 3)) * CONFIG.nodeBrightness;
      if (pulse <= 0.01) continue;
      const R = n.size * (0.85 + 0.15 * pulse);
      const x = beamX(n.y) + Math.sin(t * 0.6 + n.phase) * n.wobble * CONFIG.nodeWobble;
      const hs = CONFIG.nodeHalo;
      glowEllipse(x, n.y, R * 1.5 * hs, R * 1.25 * hs, pulse * 0.28, C.gold, 0.45);
      glowEllipse(x, n.y, R * 0.55, R * 0.5, pulse * 0.75, C.warm, 0.4);
      glowEllipse(x, n.y, R * 0.16, R * 0.15, pulse, C.hot, 0.4);
    }
    ctx.shadowBlur = 0;
  }

  // ---------- loop ----------
  let simT = 0, last = performance.now(), fpsAcc = 0, fpsN = 0, fpsLast = 0;
  const fpsEl = document.getElementById('beam-fps');
  let animation,running=false,hideTimer,lastDraw=0;
  function frame(now) {
    if(!running)return;
    if(now-lastDraw<1000/30){animation=requestAnimationFrame(frame);return;}
    lastDraw=now;
    const real = Math.min(0.05, (now - last) / 1000); last = now;
    const scale = (reduceMotion || CONFIG.paused) ? 0 : CONFIG.speed;
    simT += real * scale;
    const dt = real * 60 * scale; // in "frames at 60fps" units
    const e = CONFIG.easing;
    if (mouse.tActive) { mouse.x += (mouse.tx - mouse.x) * e; mouse.y += (mouse.ty - mouse.y) * e; }
    if (mouse.x < -5000) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
    mouse.active += (mouse.tActive - mouse.active) * e * 0.7;

    drawBackground(simT, dt);
    drawParticles(simT, dt);
    drawBeam(simT, dt);

    fpsAcc += real; fpsN++;
    if (now - fpsLast > 500) { fpsEl.textContent = Math.round(fpsN / fpsAcc) + ' fps'; fpsAcc = 0; fpsN = 0; fpsLast = now; }
    animation=requestAnimationFrame(frame);
  }

  // ---------- panel ----------
  const controls = document.getElementById('beam-controls');
  const inputs = {};
  function fmt(v, step) { const d = step >= 1 ? 0 : step >= 0.1 ? 1 : step >= 0.01 ? 2 : 3; return Number(v).toFixed(d); }
  function buildPanel() {
    controls.innerHTML = '';
    let group = null;
    for (const item of SCHEMA) {
      if (item[0] === 'section') {
        const d = document.createElement('details'); d.open = !!item[2];
        const s = document.createElement('summary'); s.textContent = item[1];
        group = document.createElement('div'); group.className = 'group';
        d.append(s, group); controls.append(d); continue;
      }
      const [key, label, a, b, step] = item;
      const row = document.createElement('div'); row.className = 'row';
      const id = 'ctl-' + key;
      const lab = document.createElement('label'); lab.htmlFor = id; lab.textContent = label;
      if (a === 'color') {
        row.classList.add('color');
        const inp = document.createElement('input'); inp.type = 'color'; inp.id = id; inp.value = CONFIG[key];
        inp.addEventListener('input', () => { CONFIG[key] = inp.value; parseColors(); persist(); });
        row.append(lab, inp); inputs[key] = inp;
      } else if (a === 'check') {
        row.classList.add('check');
        const inp = document.createElement('input'); inp.type = 'checkbox'; inp.id = id; inp.checked = !!CONFIG[key];
        inp.addEventListener('change', () => { CONFIG[key] = inp.checked; persist(); });
        row.append(lab, inp); inputs[key] = inp;
      } else {
        const out = document.createElement('output'); out.htmlFor = id; out.textContent = fmt(CONFIG[key], step);
        const inp = document.createElement('input'); inp.type = 'range'; inp.id = id; inp.min = a; inp.max = b; inp.step = step; inp.value = CONFIG[key];
        inp.addEventListener('input', () => {
          CONFIG[key] = parseFloat(inp.value); out.textContent = fmt(CONFIG[key], step);
          if (key === 'particles' || key === 'clouds' || key === 'nodes') syncCounts();
          persist();
        });
        row.append(lab, out, inp); inputs[key] = { inp, out, step };
      }
      group.append(row);
    }
  }
  function refreshPanel() {
    for (const item of SCHEMA) {
      if (item[0] === 'section') continue;
      const [key, , a, , step] = item; const c = inputs[key];
      if (a === 'color') c.value = CONFIG[key];
      else if (a === 'check') c.checked = !!CONFIG[key];
      else { c.inp.value = CONFIG[key]; c.out.textContent = fmt(CONFIG[key], step); }
    }
  }
  let persistTimer = 0;
  function persist() {
    clearTimeout(persistTimer);
    persistTimer = setTimeout(() => { try { localStorage.setItem('moira-horizontal-beam-settings-v2', JSON.stringify(CONFIG)); } catch (e) { /* ignore */ } }, 200);
  }
  function toast(msg) {
    const el = document.getElementById('beam-toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 1800);
  }

  document.getElementById('beam-btn-reset').addEventListener('click', () => {
    Object.assign(CONFIG, DEFAULTS); parseColors(); syncCounts(); refreshPanel(); persist(); toast('Settings reset');
  });
  document.getElementById('beam-btn-random').addEventListener('click', () => {
    for (const item of SCHEMA) {
      if (item[0] === 'section') continue;
      const [key, , a, b, step] = item;
      if (a === 'color' || a === 'check' || key === 'speed' || key === 'beamX' || key === 'easing') continue;
      // random, but biased toward the default so it stays tasteful
      const d = DEFAULTS[key], span = (b - a) * 0.35;
      let v = d + rand(-span, span); v = Math.max(a, Math.min(b, v));
      CONFIG[key] = Math.round(v / step) * step;
    }
    // gentle hue shift on the gold family
    const shift = rand(-18, 18);
    for (const k of ['colGold', 'colWarm']) CONFIG[k] = shiftHue(DEFAULTS[k], shift);
    parseColors(); syncCounts(); refreshPanel(); persist(); toast('Randomized');
  });
  document.getElementById('beam-btn-copy').addEventListener('click', () => {
    const json = JSON.stringify(CONFIG, null, 2);
    const done = () => toast('Beam settings copied — send them to set the defaults.');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(json).then(done).catch(() => fallbackCopy(json, done));
    } else fallbackCopy(json, done);
  });
  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.append(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { toast('Copy failed. Select and copy manually.'); ta.style.opacity = '1'; return; }
    ta.remove();
  }
  function shiftHue(hex, deg) {
    let [r, g, b] = hexToRgb(hex).map(v => v / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6;
    }
    h = (h + deg / 360 + 1) % 1;
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    return '#' + [f(h + 1 / 3), f(h), f(h - 1 / 3)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
  }

  const toggle = document.getElementById('beam-toggle');
  function setOpen(open) {
    document.body.classList.toggle('beam-panel-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.getElementById('beam-panel').inert=!open;
  }
  toggle.addEventListener('click', () => setOpen(!document.body.classList.contains('beam-panel-open')));
  window.addEventListener('keydown', (e) => {
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    if (e.key === 's' || e.key === 'S') setOpen(!document.body.classList.contains('beam-panel-open'));
    if (e.key === 'Escape') setOpen(false);

  });

  buildPanel();setOpen(false);
  function show(){
    if(window.moiraScene)return;
    clearTimeout(hideTimer);canvas.style.opacity='1';
    if(!running){running=true;last=performance.now();animation=requestAnimationFrame(frame);}
  }
  function hide(){
    canvas.style.opacity='0';clearTimeout(hideTimer);
    hideTimer=setTimeout(()=>{running=false;cancelAnimationFrame(animation);},1400);
  }
  document.getElementById('open-video').addEventListener('ended',show);
  window.addEventListener('moira-scene-change',hide);
  window.addEventListener('moira-scene-settled',event=>{if(event.detail==='main')show();});
  window.addEventListener('moira-background-reset',hide);
  window.addEventListener('resize',resize);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)cancelAnimationFrame(animation);
    else if(running){last=performance.now();animation=requestAnimationFrame(frame);}
  });
  resize();
})();
