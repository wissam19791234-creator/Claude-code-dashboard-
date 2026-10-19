// Monde 3D de la pub Scalify « Combien coûte un commerce invisible ? » : boulangerie (vitrine, store, rideau métallique),
// passants, épingles de carte, téléphone, panier, pièces d'or, horloge, bulles, balance et logo Scalify.
// Tout est une fonction pure du temps t (secondes) ; les plans suivent les débuts de scène de src/montage.js (window.MCDO).
import { THREE, RoundedBoxGeometry, makeRenderer, glossy, gold, canvasTex, E, u, lerp, extrude, flat, roundRect, heart, stadium, star } from './kit3d.js';

const TAU = Math.PI * 2;
const FONT = '"Luckiest Guy"', HAND = '"Patrick Hand"', SANS = 'Arial, "Liberation Sans", "DejaVu Sans", sans-serif';

export function buildWorld(canvas, W, H) {
  const { renderer, scene, camera } = makeRenderer(canvas, W, H);
  const M = window.MCDO, ST = M.starts, K = (p, from) => window.ART.K(p, from);
  const grp = (parent) => { const g = new THREE.Group(); parent.add(g); return g; };
  const add = (parent, geo, mat) => { const m = new THREE.Mesh(geo, mat); parent.add(m); return m; };
  const show = (o, s) => { o.visible = s > 0.002; o.scale.setScalar(Math.max(s, 0.0001)); };
  const rnd = (seed) => { let s = seed % 2147483647 || 1; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; };

  // ---------------------------------------------------------------- textures
  const GOLD = gold();
  const tex = (w, h, draw) => canvasTex(w, h, draw).tex;
  const txt = (ctx, s, x, y, size, fill, stroke, sw, font) => {
    ctx.font = font === 'sans' ? `700 ${size}px ${SANS}` : `${size}px ${font || FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    if (stroke) { ctx.lineWidth = sw || size * 0.16; ctx.strokeStyle = stroke; ctx.strokeText(s, x, y); }
    ctx.fillStyle = fill; ctx.fillText(s, x, y);
  };
  const sign = (w, h, s, bg, fg, size) => tex(w, h, (c) => { c.fillStyle = bg; c.beginPath(); c.roundRect(4, 4, w - 8, h - 8, 24); c.fill(); c.lineWidth = 8; c.strokeStyle = '#111'; c.stroke(); txt(c, s, w / 2, h / 2 + 6, size, fg, '#111', size * 0.14); });
  const glowTex = tex(256, 256, (c) => { const g = c.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(255,240,160,1)'); g.addColorStop(0.4, 'rgba(255,214,80,0.55)'); g.addColorStop(1, 'rgba(255,214,80,0)'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); });
  const blueGlow = tex(256, 256, (c) => { const g = c.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(200,230,255,1)'); g.addColorStop(0.4, 'rgba(77,162,255,0.5)'); g.addColorStop(1, 'rgba(77,162,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); });
  const raysTex = (c1, c2) => tex(512, 512, (c) => { c.fillStyle = c1; c.fillRect(0, 0, 512, 512); c.fillStyle = c2; for (let i = 0; i < 18; i++) { c.beginPath(); c.moveTo(256, 256); c.arc(256, 256, 400, i * TAU / 18, (i + 0.5) * TAU / 18); c.closePath(); c.fill(); } });
  const blobTex = tex(256, 256, (c) => { const g = c.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(40,30,20,0.5)'); g.addColorStop(0.5, 'rgba(40,30,20,0.22)'); g.addColorStop(1, 'rgba(40,30,20,0)'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); });
  const shadow = (parent, x, z, sx, sz) => {
    const m = add(parent, new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, toneMapped: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.003, z); m.scale.set(sx, sz, 1); m.renderOrder = -1; return m;
  };
  const sprite = (map, s) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, toneMapped: false })); sp.scale.set(s, s, 1); return sp; };
  const plane = (parent, w, h, map) => add(parent, new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, transparent: true, toneMapped: false }));

  // vitrine de boulangerie : baguettes en haut, croissants et boules en bas, reflets
  const bread = (c, x, y, w, h) => {
    c.fillStyle = '#d38b3a'; c.strokeStyle = '#6e4018'; c.lineWidth = 4; c.beginPath(); c.roundRect(x, y, w, h, w / 2); c.fill(); c.stroke();
    c.strokeStyle = '#f6cd8a'; c.lineWidth = 5; for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(x + 7, y + k * h / 5 - 6); c.lineTo(x + w - 7, y + k * h / 5 + 6); c.stroke(); }
  };
  const croissant = (c, x, y) => {
    c.fillStyle = '#e39c45'; c.strokeStyle = '#6e4018'; c.lineWidth = 4;
    [[-30, 8, 18, 12, 0.6], [30, 8, 18, 12, -0.6], [-16, -2, 22, 17, 0.3], [16, -2, 22, 17, -0.3], [0, -8, 26, 20, 0]].forEach((e) => { c.beginPath(); c.ellipse(x + e[0], y + e[1], e[2], e[3], e[4], 0, TAU); c.fill(); c.stroke(); });
  };
  const loaf = (c, x, y) => { c.fillStyle = '#c47a35'; c.strokeStyle = '#6e4018'; c.lineWidth = 4; c.beginPath(); c.ellipse(x, y, 40, 30, 0, 0, TAU); c.fill(); c.stroke(); c.strokeStyle = '#f6cd8a'; c.lineWidth = 5; c.beginPath(); c.moveTo(x - 18, y - 6); c.lineTo(x + 18, y + 6); c.moveTo(x - 18, y + 8); c.lineTo(x + 18, y - 4); c.stroke(); };
  const TX_DISPLAY = tex(512, 384, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 384); g.addColorStop(0, '#fff0c4'); g.addColorStop(1, '#ffc76a'); c.fillStyle = g; c.fillRect(0, 0, 512, 384);
    c.fillStyle = '#8a5a36'; c.fillRect(0, 176, 512, 14); c.fillRect(0, 344, 512, 40);
    for (let i = 0; i < 7; i++) { c.save(); c.translate(52 + i * 68, 100); c.rotate(-0.3); bread(c, -17, -78, 34, 156); c.restore(); }
    for (let i = 0; i < 5; i++) (i % 2 ? loaf : croissant)(c, 58 + i * 99, 300);
    c.fillStyle = 'rgba(255,255,255,0.32)';
    [[300, 60], [392, 26]].forEach(([x, w]) => { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + w, 0); c.lineTo(x + w - 170, 384); c.lineTo(x - 170, 384); c.fill(); });
  });
  const stripes = (a, b) => tex(512, 128, (c) => { for (let i = 0; i < 9; i++) { c.fillStyle = i % 2 ? b : a; c.fillRect(i * 512 / 9, 0, 512 / 9 + 1, 128); } });
  const valance = (a, b) => tex(512, 80, (c) => {
    const n = 9, w = 512 / n;
    for (let i = 0; i < n; i++) { c.fillStyle = i % 2 ? b : a; c.beginPath(); c.moveTo(i * w, 0); c.lineTo((i + 1) * w, 0); c.lineTo((i + 1) * w, 30); c.arc(i * w + w / 2, 30, w / 2, 0, Math.PI); c.closePath(); c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,0.35)'; c.stroke(); }
  });
  const TX_STRIPE_A = stripes('#ff5e52', '#fffaf0'), TX_VAL_A = valance('#ff5e52', '#fffaf0');
  const TX_STRIPE_B = stripes('#2f8cff', '#ffffff'), TX_VAL_B = valance('#2f8cff', '#ffffff');
  const SIGN_A = sign(900, 180, 'BOULANGERIE', '#7a4b2a', '#ffe9b8', 108);
  const SIGN_B = sign(900, 180, 'AU BON PAIN', '#2f6fd6', '#ffffff', 112);
  const TX_OPEN = sign(256, 120, 'OUVERT', '#2fbf4a', '#ffffff', 58), TX_SHUT = sign(256, 120, 'FERMÉ', '#ff3b30', '#ffffff', 60);
  const TX_CHALK = tex(256, 320, (c) => {
    c.fillStyle = '#a0703f'; c.fillRect(0, 0, 256, 320); c.fillStyle = '#26332c'; c.fillRect(16, 16, 224, 288);
    txt(c, 'PAIN', 128, 110, 70, '#ffffff'); txt(c, 'CHAUD', 128, 200, 62, '#ffe14d');
  });
  const TX_ROLL = tex(256, 256, (c) => { c.fillStyle = '#a9b3bf'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#7f8a97'; for (let y = 0; y < 256; y += 21) c.fillRect(0, y, 256, 6); c.fillStyle = '#c9d1da'; for (let y = 8; y < 256; y += 21) c.fillRect(0, y, 256, 3); });
  TX_ROLL.wrapS = TX_ROLL.wrapT = THREE.RepeatWrapping; TX_ROLL.repeat.set(1, 2.2);
  const TX_WICKER = tex(256, 128, (c) => { c.fillStyle = '#c98b4a'; c.fillRect(0, 0, 256, 128); c.strokeStyle = '#8f5a27'; c.lineWidth = 4; for (let y = 8; y < 128; y += 16) { c.beginPath(); for (let x = 0; x <= 256; x += 16) c.lineTo(x, y + ((x / 16 + y / 16) % 2 ? 4 : -4)); c.stroke(); } for (let x = 0; x < 256; x += 32) { c.fillStyle = 'rgba(110,64,24,0.35)'; c.fillRect(x, 0, 5, 128); } });
  TX_WICKER.wrapS = THREE.RepeatWrapping; TX_WICKER.repeat.set(3, 1);
  const TX_CLOCK = tex(512, 512, (c) => {
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(256, 256, 250, 0, TAU); c.fill();
    for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, r0 = i % 5 ? 222 : 200; c.strokeStyle = '#1d1d1f'; c.lineWidth = i % 5 ? 4 : 12; c.beginPath(); c.moveTo(256 + Math.sin(a) * r0, 256 - Math.cos(a) * r0); c.lineTo(256 + Math.sin(a) * 238, 256 - Math.cos(a) * 238); c.stroke(); }
    [['12', 0], ['3', 3], ['6', 6], ['9', 9]].forEach(([s, h]) => { const a = h / 12 * TAU; txt(c, s, 256 + Math.sin(a) * 150, 262 - Math.cos(a) * 150, 76, '#1d1d1f'); });
  });
  const TX_HOLE = tex(256, 256, (c) => { const g = c.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(20,14,10,1)'); g.addColorStop(0.62, 'rgba(32,22,16,1)'); g.addColorStop(0.72, 'rgba(70,50,35,0.9)'); g.addColorStop(1, 'rgba(70,50,35,0)'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); });
  const qTex = tex(256, 256, (c) => txt(c, '?', 128, 140, 220, '#ffe14d', '#111', 22));
  const exTex = tex(256, 256, (c) => txt(c, '!', 128, 140, 220, '#ff3b30', '#111', 22));
  const textTex = (w, h, lines, o = {}) => tex(w, h, (c) => {
    lines.forEach((l, i) => txt(c, l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * (o.lh || o.size * 1.15), o.size, o.fg || '#1d1d1f', o.stroke, o.sw, o.font));
  });

  // ---------------------------------------------------------------- boulangerie (pivot au sol, façade vers +z)
  // userData : lights(k) vitrine allumée, ghost(k) commerce « invisible », shutter(k) rideau baissé, door('ouvert'|'ferme')
  function bakery(parent, o = {}) {
    const g = grp(parent), mats = [];
    const reg = (m) => { m.transparent = true; mats.push(m); return m; };
    const std = (c, r, x = {}) => reg(new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: r ?? 0.7 }, x)));
    const bas = (map) => reg(new THREE.MeshBasicMaterial({ map, toneMapped: false }));
    const TRIM = o.trim || '#6b4430';
    add(g, new RoundedBoxGeometry(5.0, 0.24, 3.4, 3, 0.07), std('#e8decd', 0.9)).position.set(0, -0.12, 0.55);
    add(g, new RoundedBoxGeometry(3.6, 2.9, 2.0, 3, 0.05), std(o.wall || '#fff1d6', 0.8)).position.set(0, 1.45, 0);
    add(g, new RoundedBoxGeometry(3.9, 0.22, 2.24, 2, 0.06), std(TRIM, 0.55)).position.set(0, 3.0, 0);
    add(g, new THREE.BoxGeometry(2.3, 0.42, 2.04), std(TRIM, 0.6)).position.set(-0.65, 0.21, 0);
    add(g, new THREE.PlaneGeometry(3.2, 0.64), bas(o.sign || SIGN_A)).position.set(0, 2.6, 1.012);
    add(g, new RoundedBoxGeometry(1.95, 1.5, 0.1, 2, 0.03), std(TRIM, 0.5)).position.set(-0.72, 1.18, 1.0);
    const dispMat = bas(TX_DISPLAY); add(g, new THREE.PlaneGeometry(1.75, 1.3), dispMat).position.set(-0.72, 1.18, 1.056);
    add(g, new RoundedBoxGeometry(0.92, 1.8, 0.1, 2, 0.03), std('#7a4a2e', 0.55)).position.set(1.12, 0.9, 1.0);
    const glassMat = reg(new THREE.MeshBasicMaterial({ color: '#ffe3a0', toneMapped: false })); add(g, new THREE.PlaneGeometry(0.62, 0.8), glassMat).position.set(1.12, 1.32, 1.056);
    add(g, new THREE.SphereGeometry(0.05, 16, 12), std('#f6c445', 0.25, { metalness: 0.9 })).position.set(0.8, 0.92, 1.08);
    const dOpen = add(g, new THREE.PlaneGeometry(0.46, 0.22), bas(TX_OPEN)); dOpen.position.set(1.12, 1.18, 1.064);
    const dShut = add(g, new THREE.PlaneGeometry(0.46, 0.22), bas(TX_SHUT)); dShut.position.set(1.12, 1.18, 1.065); dShut.visible = false;
    const aw = add(g, new THREE.PlaneGeometry(3.6, 0.72), std('#ffffff', 0.7, { map: o.stripes || TX_STRIPE_A, side: THREE.DoubleSide })); aw.position.set(0, 2.1, 1.33); aw.rotation.x = -1.138;
    add(g, new THREE.PlaneGeometry(3.6, 0.26), bas(o.valance || TX_VAL_A)).position.set(0, 1.83, 1.662);
    // ardoise « pain chaud » et pot de fleurs sur le trottoir
    const ch = grp(g); ch.position.set(2.0, 0, 1.55); ch.rotation.y = -0.35;
    for (const sd of [1, -1]) {
      const pn = grp(ch); pn.position.z = 0.18 * sd; pn.rotation.x = -0.2 * sd;
      add(pn, new THREE.BoxGeometry(0.62, 0.86, 0.04), std('#a0703f', 0.7)).position.y = 0.43;
      if (sd > 0) add(pn, new THREE.PlaneGeometry(0.56, 0.78), bas(TX_CHALK)).position.set(0, 0.43, 0.022);
    }
    const pot = grp(g); pot.position.set(-2.05, 0, 1.45);
    add(pot, new THREE.CylinderGeometry(0.26, 0.2, 0.4, 24), std('#d9733f', 0.6)).position.y = 0.2;
    add(pot, new THREE.SphereGeometry(0.36, 20, 14), std('#4fb35a', 0.8)).position.y = 0.62;
    add(pot, new THREE.SphereGeometry(0.07, 10, 8), std('#ff6fb5', 0.5)).position.set(0.12, 0.86, 0.26);
    add(pot, new THREE.SphereGeometry(0.07, 10, 8), std('#ffe14d', 0.5)).position.set(-0.16, 0.76, 0.28);
    // rideau métallique, enroulé sous le store
    const sh = grp(g); sh.position.set(-0.03, 2.2, 1.17);
    add(sh, new THREE.PlaneGeometry(3.52, 2.2), std('#ffffff', 0.45, { map: TX_ROLL, metalness: 0.3 })).position.y = -1.1;
    const shd = shadow(g, 0, 0.55, 6.6, 4.8); shd.material.transparent = true;
    g.userData.lights = (k) => { dispMat.color.setScalar(lerp(0.36, 1, k)); glassMat.color.set('#3a3632').lerp(new THREE.Color('#ffe3a0'), k); };
    g.userData.ghost = (k) => { mats.forEach((m) => { m.opacity = 1 - 0.86 * k; m.depthWrite = k < 0.02; }); shd.material.opacity = 1 - k; };
    g.userData.shutter = (k) => { sh.visible = k > 0.003; sh.scale.y = Math.max(k, 0.001); };
    g.userData.door = (s) => { dOpen.visible = s !== 'ferme'; dShut.visible = s === 'ferme'; };
    g.userData.shutter(0);
    return g;
  }
  // passant (capsule + tête), regarde vers +z
  const SKIN = ['#f3c39b', '#c98b5e', '#e2ad84', '#8d5a3b'], HAIR = ['#3b2414', '#111111', '#d9a04a', '#6b3a1e'], SHIRT = ['#ff4fa8', '#2f8cff', '#8e5bd8', '#2fbf4a', '#ffb03a', '#ff3b30'];
  function person(parent, i) {
    const g = grp(parent), body = grp(g);
    add(body, new THREE.CapsuleGeometry(0.21, 0.34, 6, 18), glossy(SHIRT[i % 6], { r: 0.45, cc: 0.4 })).position.y = 0.43;
    add(body, new THREE.SphereGeometry(0.2, 24, 18), glossy(SKIN[i % 4], { r: 0.55, cc: 0.2 })).position.y = 0.95;
    add(body, new THREE.SphereGeometry(0.212, 24, 12, 0, TAU, 0, Math.PI * 0.42), glossy(HAIR[i % 4], { r: 0.6, cc: 0.2 })).position.y = 0.97;
    for (const s of [-1, 1]) add(body, new THREE.SphereGeometry(0.028, 10, 8), new THREE.MeshBasicMaterial({ color: '#111111' })).position.set(s * 0.07, 0.97, 0.18);
    shadow(g, 0, 0, 0.7, 0.55);
    g.userData.body = body; return g;
  }
  // marche de (x0, z0) à (x1, z1) entre t0 et t1 (rebond des pas, orientation)
  const walk = (p, t, t0, t1, x0, z0, x1, z1) => {
    const k = u(t, t0, t1); p.position.set(lerp(x0, x1, k), 0, lerp(z0, z1, k)); p.rotation.y = Math.atan2(x1 - x0, z1 - z0);
    p.userData.body.position.y = k > 0 && k < 1 ? 0.05 * Math.abs(Math.sin(t * 11)) : 0;
    p.userData.body.rotation.z = k > 0 && k < 1 ? 0.06 * Math.sin(t * 11) : 0;
  };
  // épingle de carte
  function pin(parent, col) {
    const g = grp(parent), m = glossy(col, { r: 0.25 });
    add(g, new THREE.SphereGeometry(0.34, 32, 24), m).position.y = 1.0;
    const cn = add(g, new THREE.ConeGeometry(0.3, 0.78, 32), m); cn.rotation.x = Math.PI; cn.position.y = 0.53;
    add(g, new THREE.SphereGeometry(0.13, 20, 16), glossy('#ffffff', { r: 0.3 })).position.set(0, 1.02, 0.25);
    return g;
  }
  function coin(parent) { const c = add(parent, new THREE.CylinderGeometry(0.36, 0.36, 0.11, 40), GOLD); return c; }
  function coinStack(parent, n) {
    const g = grp(parent), coins = [];
    for (let i = 0; i < n; i++) { const c = coin(g); c.position.y = 0.06 + i * 0.115; c.rotation.y = i * 0.7; coins.push(c); }
    shadow(g, 0, 0, 1.2, 1.0);
    g.userData.coins = coins; return g;
  }
  function phone(parent) {
    const PW = 1.62, PH = 3.3, SWU = PW - 0.17, SHU = PH - 0.17;
    const g = grp(parent);
    add(g, extrude(roundRect(PW, PH, 0.27), 0.12, 0.05), glossy('#2c2c31', { m: 0.7, r: 0.32 }));
    add(g, flat(roundRect(PW - 0.07, PH - 0.07, 0.23), PW, PH), new THREE.MeshPhysicalMaterial({ color: '#060606', roughness: 0.2, clearcoat: 1 })).position.z = 0.111;
    const scr = canvasTex(400, 820);
    add(g, flat(roundRect(SWU, SHU, 0.17), SWU, SHU), new THREE.MeshPhysicalMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: scr.tex, roughness: 0.12, clearcoat: 1, toneMapped: false })).position.z = 0.113;
    add(g, flat(stadium(0.42, 0.12), 0.42, 0.12), new THREE.MeshBasicMaterial({ color: '#000000' })).position.set(0, SHU / 2 - 0.1, 0.116);
    g.userData.scr = scr; return g;
  }
  // ---- écrans du téléphone (canvas 400 × 820)
  const ui = (c, s, x, y, size, col, align, weight) => { c.font = `${weight || 700} ${size}px ${SANS}`; c.textAlign = align || 'left'; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(s, x, y); };
  const pin2d = (c, x, y, col, s) => {
    s = s || 1; c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = col; c.strokeStyle = '#111'; c.lineWidth = 4; c.beginPath(); c.arc(0, -40, 22, Math.PI * 0.85, Math.PI * 0.15); c.lineTo(0, 0); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(0, -40, 8, 0, TAU); c.fill(); c.restore();
  };
  const stars2d = (c, x, y, n, sz) => { for (let i = 0; i < 5; i++) { c.save(); c.translate(x + i * sz * 2.2, y); c.fillStyle = i < n ? '#ffb400' : '#d5d8de'; c.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? sz * 0.45 : sz; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.restore(); } };
  function drawSearch(scr, typed, mapK, t) {
    const c = scr.ctx;
    c.fillStyle = '#f4f5f8'; c.fillRect(0, 0, 400, 820);
    c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(20, 46, 360, 74, 37); c.fill(); c.lineWidth = 3; c.strokeStyle = '#d5d8de'; c.stroke();
    c.strokeStyle = '#5f6368'; c.lineWidth = 5; c.beginPath(); c.arc(62, 80, 13, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(72, 90); c.lineTo(84, 102); c.stroke();
    const q = 'boulangerie près de moi', s = q.slice(0, Math.round(q.length * typed));
    ui(c, s, 98, 83, 25, '#202124', 'left', 600);
    if (typed < 1 && Math.floor(t * 3) % 2 === 0) { c.font = `600 25px ${SANS}`; c.fillStyle = '#2f8cff'; c.fillRect(100 + c.measureText(s).width, 66, 3, 34); }
    if (mapK <= 0) return void (scr.tex.needsUpdate = true);
    c.globalAlpha = Math.min(1, mapK * 2);
    c.fillStyle = '#ece4d3'; c.beginPath(); c.roundRect(20, 140, 360, 420, 22); c.fill();
    c.save(); c.beginPath(); c.roundRect(20, 140, 360, 420, 22); c.clip();
    c.fillStyle = '#c8e6b0'; c.fillRect(250, 150, 140, 120); c.fillStyle = '#a9d4f5'; c.beginPath(); c.moveTo(20, 470); c.bezierCurveTo(140, 430, 220, 560, 380, 500); c.lineTo(380, 560); c.lineTo(20, 560); c.fill();
    c.strokeStyle = '#ffffff'; c.lineWidth = 16; [[20, 260, 380, 300], [130, 140, 170, 560], [20, 400, 380, 360], [290, 140, 260, 560]].forEach((l) => { c.beginPath(); c.moveTo(l[0], l[1]); c.lineTo(l[2], l[3]); c.stroke(); });
    c.restore();
    [[95, 240, 0.1], [228, 340, 0.25], [318, 230, 0.4]].forEach(([x, y, d]) => { const k = E.back(Math.min(1, Math.max(0, (mapK - d) / 0.3))); if (k > 0.01) pin2d(c, x, y, '#ff3b30', 1.3 * k); });
    // « ta » boulangerie : absente de la carte
    const kq = Math.min(1, Math.max(0, (mapK - 0.6) / 0.3));
    if (kq > 0) { c.globalAlpha = kq; c.setLineDash([10, 8]); c.strokeStyle = '#8a8f98'; c.lineWidth = 5; c.beginPath(); c.arc(150, 470, 34, 0, TAU); c.stroke(); c.setLineDash([]); txt(c, '?', 150, 476, 52, '#8a8f98'); c.globalAlpha = Math.min(1, mapK * 2); }
    [['Au Bon Pain', 4.8, 590], ['Maison Lucas', 4.6, 700]].forEach(([n, r, y], i) => {
      const k = Math.min(1, Math.max(0, (mapK - 0.3 - i * 0.15) / 0.3)); if (k <= 0) return;
      c.globalAlpha = k; c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(20, y, 360, 96, 18); c.fill();
      pin2d(c, 58, y + 72, '#ff3b30', 0.9); ui(c, n, 92, y + 30, 26, '#202124'); stars2d(c, 100, y + 64, 5, 11);
      ui(c, String(r).replace('.', ','), 220, y + 65, 22, '#5f6368', 'left', 600); ui(c, 'Ouvert', 372, y + 65, 22, '#1e9e45', 'right');
    });
    c.globalAlpha = 1; scr.tex.needsUpdate = true;
  }
  function drawReviews(scr, k) {
    const c = scr.ctx;
    c.fillStyle = '#f4f5f8'; c.fillRect(0, 0, 400, 820);
    ui(c, 'Avis clients', 28, 80, 34, '#202124', 'left', 800);
    [['Julie M.', 1, 'Personne ne répond', 'au téléphone…', '#ff4fa8'], ['Karim B.', 2, 'Horaires faux sur', 'internet. Fermé !', '#2f8cff'], ['Léa P.', 1, 'Message envoyé,', 'jamais de réponse.', '#8e5bd8']].forEach(([n, s, l1, l2, col], i) => {
      const kk = Math.min(1, Math.max(0, (k - i * 0.22) / 0.25)); if (kk <= 0) return;
      const y = 130 + i * 222 + (1 - E.o3(kk)) * 40; c.globalAlpha = kk;
      c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(18, y, 364, 204, 20); c.fill();
      c.fillStyle = col; c.beginPath(); c.arc(56, y + 42, 22, 0, TAU); c.fill(); ui(c, n[0], 56, y + 43, 22, '#ffffff', 'center', 800);
      ui(c, n, 92, y + 32, 24, '#202124'); stars2d(c, 100, y + 60, s, 10);
      ui(c, l1, 34, y + 100, 23, '#3c4043', 'left', 500); ui(c, l2, 34, y + 130, 23, '#3c4043', 'left', 500);
      c.fillStyle = '#ffe1df'; c.beginPath(); c.roundRect(34, y + 154, 176, 36, 18); c.fill(); ui(c, 'Sans réponse', 122, y + 173, 20, '#e0261b', 'center', 800);
    });
    c.globalAlpha = 1; scr.tex.needsUpdate = true;
  }
  const S_PATH = (() => {   // le « S » du logo Scalify (repère SVG de 400 px, axe y vers le bas)
    const p = [], A = (cx, cy, a0, a1) => { for (let i = 0; i <= 18; i++) { const a = a0 + (a1 - a0) * i / 18; p.push([cx + 37.5 * Math.cos(a), cy + 37.5 * Math.sin(a)]); } };
    p.push([63, -108]); A(-30, -70.5, -Math.PI / 2, -Math.PI * 1.5); A(26.6, 4.5, -Math.PI / 2, Math.PI / 2); p.push([-66, 42]);
    return p;
  })();
  function logoCanvas(c, x, y, r) {   // logo Scalify dessiné dans un canvas (centre x, y ; rayon r)
    const s = r / 200; c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = '#fffdf8'; c.strokeStyle = '#161311'; c.lineWidth = 16; c.beginPath(); c.arc(0, 0, 200, 0, TAU); c.fill(); c.stroke();
    c.lineWidth = 40; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); S_PATH.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.stroke();
    c.fillStyle = '#4da2ff'; c.lineWidth = 10; c.beginPath(); c.arc(84, 81, 26, 0, TAU); c.fill(); c.stroke(); c.restore();
  }
  function drawDash(scr, ks) {
    const c = scr.ctx;
    c.fillStyle = '#f3eadb'; c.fillRect(0, 0, 400, 820);
    c.fillStyle = '#161311'; c.fillRect(0, 0, 400, 150); logoCanvas(c, 70, 92, 38); ui(c, 'Scalify', 124, 94, 40, '#ffffff', 'left', 800);
    [['Site à jour', '#2f8cff'], ['Fiche Google à jour', '#ff3b30'], ['Avis : réponse envoyée', '#ffb400'], ['Post publié', '#ff4fa8'], ['IA : client répondu', '#8e5bd8']].forEach(([l, col], i) => {
      const k = ks[i] || 0, y = 186 + i * 118;
      c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(18, y, 364, 100, 20); c.fill();
      c.fillStyle = col; c.beginPath(); c.arc(64, y + 50, 26, 0, TAU); c.fill();
      ui(c, l, 104, y + 50, 23, '#202124', 'left', 700);
      if (k > 0.01) { c.save(); c.translate(346, y + 50); c.scale(E.back(Math.min(1, k)), E.back(Math.min(1, k))); c.fillStyle = '#2fbf4a'; c.beginPath(); c.arc(0, 0, 22, 0, TAU); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-10, 0); c.lineTo(-3, 8); c.lineTo(11, -8); c.stroke(); c.restore(); }
    });
    scr.tex.needsUpdate = true;
  }
  // panier de pains
  function basket(parent) {
    const g = grp(parent), W2 = new THREE.MeshStandardMaterial({ map: TX_WICKER, roughness: 0.85, side: THREE.DoubleSide });
    add(g, new THREE.CylinderGeometry(0.9, 0.68, 0.55, 40, 1, true), W2).position.y = 0.3;
    const bt = add(g, new THREE.CircleGeometry(0.68, 40), new THREE.MeshStandardMaterial({ color: '#8f5a27', roughness: 0.9 })); bt.rotation.x = -Math.PI / 2; bt.position.y = 0.04;
    const rim = add(g, new THREE.TorusGeometry(0.9, 0.06, 12, 48), new THREE.MeshStandardMaterial({ color: '#a96d35', roughness: 0.7 })); rim.rotation.x = Math.PI / 2; rim.position.y = 0.58;
    const crust = glossy('#d9923c', { r: 0.55, cc: 0.3 });
    [[-0.25, 0.75, 0.1, 0.5, 0.35], [0.1, 0.8, -0.15, 0.25, -0.3], [0.32, 0.72, 0.2, 0.62, 0.15]].forEach((q) => { const b = add(g, new THREE.CapsuleGeometry(0.12, 1.3, 6, 16), crust); b.position.set(q[0], q[1], q[2]); b.rotation.set(q[3], 0, q[4]); });
    const cr = add(g, new THREE.TorusGeometry(0.2, 0.1, 14, 28, Math.PI * 1.3), glossy('#e6a24b', { r: 0.5, cc: 0.3 })); cr.position.set(-0.35, 0.68, 0.45); cr.rotation.set(-1.0, 0, 0.6);
    shadow(g, 0, 0, 2.2, 1.8);
    return g;
  }
  function tag(parent, s, fg) {
    const g = grp(parent);
    add(g, extrude(roundRect(0.9, 0.5, 0.1), 0.05, 0.02), glossy('#ffffff', { r: 0.3 }));
    plane(g, 0.86, 0.46, sign(344, 184, s, '#ffffff', fg || '#ff3b30', 110)).position.z = 0.051;
    return g;
  }
  function clock(parent) {
    const g = grp(parent);
    const body = add(g, new THREE.CylinderGeometry(1, 1, 0.22, 64), glossy('#ff5e52', { r: 0.3 })); body.rotation.x = Math.PI / 2;
    add(g, new THREE.CircleGeometry(0.88, 64), new THREE.MeshStandardMaterial({ map: TX_CLOCK, roughness: 0.4 })).position.z = 0.112;
    const ink = glossy('#1d1d1f', { r: 0.3 });
    const hh = grp(g); hh.position.z = 0.13; add(hh, new THREE.BoxGeometry(0.09, 0.5, 0.03), ink).position.y = 0.2;
    const mh = grp(g); mh.position.z = 0.15; add(mh, new THREE.BoxGeometry(0.06, 0.74, 0.03), ink).position.y = 0.32;
    add(g, new THREE.SphereGeometry(0.07, 16, 12), ink).position.z = 0.16;
    g.userData.time = (h) => { hh.rotation.z = -(h % 12) / 12 * TAU; mh.rotation.z = -(h % 1) * TAU; };
    return g;
  }
  function bubble(parent, lines, w, h, o = {}) {
    const g = grp(parent);
    add(g, extrude(roundRect(w, h, 0.2, o.tail || -1), 0.08, 0.04), glossy(o.bg || '#ffffff', { r: 0.35 }));
    plane(g, w - 0.12, h - 0.08, textTex(Math.round((w - 0.12) * 200), Math.round((h - 0.08) * 200), lines, { size: o.size || 46, fg: o.fg || '#1d1d1f', font: o.font })).position.z = 0.09;
    return g;
  }
  // logo Scalify en relief : pastille blanche cerclée d'encre, « S » en tube, point bleu (les deux faces)
  function logo3d(parent) {
    const g = grp(parent), INK = glossy('#161311', { r: 0.4 }), WH = glossy('#fffdf8', { r: 0.22 }), BL = glossy('#4da2ff', { r: 0.2 });
    const body = add(g, new THREE.CylinderGeometry(1, 1, 0.24, 72), INK); body.rotation.x = Math.PI / 2;
    const path = new THREE.CurvePath(), P3 = S_PATH.map(([x, y]) => new THREE.Vector3(x / 200, -y / 200, 0));
    for (let i = 0; i < P3.length - 1; i++) path.add(new THREE.LineCurve3(P3[i], P3[i + 1]));
    const sgeo = new THREE.TubeGeometry(path, 320, 0.1, 14, false);
    for (const side of [1, -1]) {
      const f = grp(g); if (side < 0) f.rotation.y = Math.PI;
      add(f, new THREE.CircleGeometry(0.93, 72), WH).position.z = 0.121;
      const s = add(f, sgeo, INK); s.position.z = 0.13;
      for (const p of [P3[0], P3[P3.length - 1]]) add(f, new THREE.SphereGeometry(0.1, 16, 12), INK).position.set(p.x, p.y, 0.13);
      add(f, new THREE.SphereGeometry(0.13, 24, 16), BL).position.set(0.42, -0.405, 0.13);
      const ring = add(f, new THREE.TorusGeometry(0.13, 0.025, 10, 32), INK); ring.position.set(0.42, -0.405, 0.15);
    }
    return g;
  }
  // balance : plateau gauche / plateau droit suspendus aux bouts du fléau
  function balance(parent) {
    const g = grp(parent), MET = glossy('#c3c9d2', { m: 0.7, r: 0.28 }), DK = glossy('#2c2c31', { r: 0.4 });
    add(g, new THREE.CylinderGeometry(0.55, 0.8, 0.22, 48), DK).position.y = 0.11;
    add(g, new THREE.CylinderGeometry(0.08, 0.1, 2.5, 24), MET).position.y = 1.4;
    add(g, new THREE.SphereGeometry(0.15, 24, 16), glossy('#f6c445', { m: 0.9, r: 0.25 })).position.y = 2.72;
    const beam = grp(g); beam.position.y = 2.62; add(beam, new THREE.BoxGeometry(3.3, 0.1, 0.14), MET);
    const pans = [-1, 1].map(() => {
      const p = grp(g); add(p, new THREE.CylinderGeometry(0.018, 0.018, 1.2, 8), MET).position.y = -0.6;
      add(p, new THREE.CylinderGeometry(0.72, 0.5, 0.12, 40), MET).position.y = -1.22;
      return p;
    });
    shadow(g, 0, 0, 3.6, 1.6);
    g.userData.tilt = (a) => { beam.rotation.z = a; pans.forEach((p, i) => { const s = i ? 1 : -1; p.position.set(s * 1.55 * Math.cos(a), 2.62 + s * 1.55 * Math.sin(a), 0); }); };
    g.userData.pans = pans; g.userData.tilt(0);
    return g;
  }
  // icônes des services
  function siteCard(parent) {
    const g = grp(parent);
    add(g, new RoundedBoxGeometry(1.2, 0.9, 0.08, 3, 0.05), glossy('#ffffff', { r: 0.3 }));
    plane(g, 1.12, 0.82, tex(448, 328, (c) => {
      c.fillStyle = '#e8ecf2'; c.fillRect(0, 0, 448, 56); [['#ff5f57', 30], ['#febc2e', 58], ['#28c840', 86]].forEach(([col, x]) => { c.fillStyle = col; c.beginPath(); c.arc(x, 28, 10, 0, TAU); c.fill(); });
      c.fillStyle = '#ffd9a8'; c.fillRect(20, 76, 408, 120); txt(c, 'BOULANGERIE', 224, 138, 52, '#7a4b2a');
      c.fillStyle = '#c9d1da'; c.fillRect(20, 218, 260, 18); c.fillRect(20, 250, 200, 18); c.fillStyle = '#2f8cff'; c.beginPath(); c.roundRect(300, 222, 128, 50, 25); c.fill(); txt(c, 'RÉSERVER', 364, 250, 24, '#ffffff');
    })).position.z = 0.045;
    return g;
  }
  function starIcon(parent) { const g = grp(parent); add(g, extrude(star(0.5, 0.22), 0.14, 0.05), glossy('#ffc531', { r: 0.2, m: 0.2 })); return g; }
  function postCard(parent) {
    const g = grp(parent);
    add(g, new RoundedBoxGeometry(0.95, 1.15, 0.07, 3, 0.05), glossy('#ffffff', { r: 0.3 }));
    plane(g, 0.87, 0.75, tex(348, 300, (c) => { const gr = c.createLinearGradient(0, 0, 0, 300); gr.addColorStop(0, '#ffe7b8'); gr.addColorStop(1, '#ffc56a'); c.fillStyle = gr; c.fillRect(0, 0, 348, 300); croissant(c, 174, 160); c.save(); c.translate(174, 160); c.scale(2.2, 2.2); croissant(c, 0, 0); c.restore(); })).position.set(0, 0.14, 0.04);
    const ht = add(g, extrude(heart(0.16), 0.06, 0.03), glossy('#ff3b5c', { r: 0.25 })); ht.position.set(-0.3, -0.42, 0.06);
    return g;
  }
  function backdrop(parent, c1, c2) {
    const m = add(parent, new THREE.PlaneGeometry(60, 60), new THREE.MeshBasicMaterial({ map: raysTex(c1, c2), toneMapped: false, depthWrite: false }));
    m.position.set(0, 2, -10); m.renderOrder = -2; return m;
  }
  // pièces qui s'envolent en arc (boucle) : départ (x0, y0, z0), vers +x
  function coinStream(parent, n) { const cs = []; for (let i = 0; i < n; i++) cs.push(coin(parent)); return cs; }
  const flyCoins = (cs, t, t0, x0, y0, z0, dx, h, per) => cs.forEach((c, i) => {
    const ph = (t - t0) / per - i / cs.length; if (ph < 0) { c.visible = false; return; }
    const k = ph % 1; c.visible = true;
    c.position.set(x0 + dx * k, y0 + h * Math.sin(Math.PI * k) - 1.2 * k * k, z0 + 0.6 * k); c.rotation.set(k * 9 + i, i, k * 6);
  });

  // ================================================================ les plans (index = numéro de scène - 1)
  const S = [];
  const scn = (cam, build, up) => { const g = grp(scene); g.visible = false; const st = build(g) || {}; S.push({ g, cam, up: (t, a, b) => up(t, a, b, st) }); };

  // 1 · « Cette boulangerie perd 20 000 € par an » : l'argent s'envole par la porte
  scn((t, a) => ({ p: [0.6 + 0.6 * Math.sin((t - a) * 0.35), 4.6, 24], q: [-0.35, 1.75, 0] }), (g) => {
    const bk = bakery(g); const cs = coinStream(g, 12); return { bk, cs };
  }, (t, a, b, s) => { s.bk.userData.lights(1); flyCoins(s.cs, t, a + 0.25, 1.12, 0.8, 1.3, 3.6, 2.4, 1.5); });

  // 2 · titre « Combien coûte un commerce invisible ? » : la boutique devient transparente
  scn((t, a) => ({ p: [lerp(1.4, -0.6, u(t, a, a + 2.4)), 4.2, 21], q: [-0.4, 1.5, 0] }), (g) => ({ bk: bakery(g) }), (t, a, b, s) => {
    s.bk.userData.lights(1); s.bk.userData.ghost(E.io2(u(t, K('invisible sur', a) - 0.25, K('invisible sur', a) + 0.45)));
  });

  // 3 · « Imagine, c'est ta boulangerie »
  scn((t, a) => ({ p: [lerp(-1.0, 0.0, u(t, a, a + 1.8)), 3.4, 21], q: [-0.35, 1.6, 0] }), (g) => ({ bk: bakery(g) }), (t, a, b, s) => { s.bk.userData.lights(1); });

  // 4 · « Chaque jour, des gens tapent : boulangerie près de moi » … ta fiche Google n'est pas à jour
  scn((t, a) => ({ p: [0.5 * Math.sin((t - a) * 0.5), 1.8, 11.5], q: [0, 1.3, 0] }), (g) => {
    const ph = phone(g); ph.position.set(0, 1.25, 0); const pins = [0, 1, 2].map(() => pin(g, '#ff3b30')); return { ph, pins };
  }, (t, a, b, s) => {
    const t0 = K('boulangerie près', a), typed = u(t, K('tapent:', a) - 0.1, t0 + 0.6), mapK = u(t, t0 + 0.6, t0 + 1.6);
    s.ph.rotation.set(-0.08, -0.22 + 0.1 * Math.sin((t - a) * 0.8), 0.02);
    drawSearch(s.ph.userData.scr, typed, mapK, t);
    s.pins.forEach((p, i) => { const k = E.back(u(t, t0 + 0.75 + i * 0.15, t0 + 1.05 + i * 0.15)); show(p, 0.5 * k); const pp = [[-1.12, 2.05], [1.12, 2.45], [1.15, 0.75]][i]; p.position.set(pp[0], pp[1] + 0.3 * k + 0.06 * Math.sin(t * 3 + i), 0.5); p.rotation.y = 0.3 * Math.sin(t * 2 + i); });
  });

  // 5 · 2 clients par jour vont chez le voisin, 15 € le panier chacun
  scn((t, a) => ({ p: [lerp(-1.0, 1.0, u(t, a, a + 3)), 8, 31], q: [0, 1.4, 0.5] }), (g) => {
    const me = bakery(g); me.position.x = -2.2; me.scale.setScalar(0.78); me.userData.lights(0.75); me.userData.door('ferme');
    const nb = bakery(g, { sign: SIGN_B, stripes: TX_STRIPE_B, valance: TX_VAL_B, wall: '#eef6ff', trim: '#2d4a7a' }); nb.position.x = 2.2; nb.scale.setScalar(0.78); nb.userData.lights(1);
    const pm = pin(g, '#9aa0a8'); pm.position.set(-2.2, 3.05, 0); pm.scale.setScalar(0.85);
    const pn = pin(g, '#2fbf4a'); pn.position.set(2.2, 3.05, 0); pn.scale.setScalar(0.85);
    const tg = tag(g, 'FERMÉ'); tg.position.set(-1.4, 4.15, 0.2); tg.scale.setScalar(0.9);
    const ppl = [0, 1].map((i) => person(g, i + 1));
    const tgs = ppl.map((p) => { const x = tag(p, '15 €'); x.position.set(0, 1.55, 0); return x; });
    return { pm, pn, tg, ppl, tgs };
  }, (t, a, b, s) => {
    s.pm.position.y = 3.05 + 0.08 * Math.sin(t * 2.4); s.pn.position.y = 3.05 + 0.12 * Math.abs(Math.sin(t * 4));
    show(s.tg, E.back(u(t, a, a + 0.35)) * 0.9); s.tg.rotation.z = 0.15 * Math.sin(t * 3);
    const tw = K('2 clients', a), t15 = K('15 euros', a);
    walk(s.ppl[0], t, tw - 0.1, tw + 2.4, -1.6, 4.2, 2.05, 1.5);
    walk(s.ppl[1], t, tw + 0.2, tw + 2.7, -0.6, 4.6, 2.6, 1.6);
    s.tgs.forEach((x, i) => { show(x, 0.75 * E.back(u(t, t15 - 0.1 + i * 0.12, t15 + 0.25 + i * 0.12))); x.rotation.set(0, -s.ppl[i].rotation.y, 0.2 * Math.sin(t * 3 + i)); });
    s.ppl.forEach((p) => { p.visible = true; });
  });

  // 6 · « ça fait 900 € par mois » : les piles de pièces filent chez le voisin
  scn((t, a) => ({ p: [0.4 * Math.sin((t - a) * 0.6), 4.0, 14], q: [0, 1.1, 0] }), (g) => {
    const stacks = [0, 1, 2].map((i) => { const st = coinStack(g, 10); st.position.set(-1.0 + i * 1.0, 0, (i % 2) * 0.3 - 0.1); return st; });
    return { stacks, coins: stacks.flatMap((st) => st.userData.coins) };
  }, (t, a, b, s) => {
    const t9 = K('900', a);
    s.coins.forEach((c, i) => {
      const y0 = c.userData.y0 ?? (c.userData.y0 = c.position.y), j = i % 10, ti = a + 0.05 + j * 0.035, k = E.o3(u(t, ti, ti + 0.22));
      const go = u(t, t9 + 0.35 + (9 - j) * 0.045 + Math.floor(i / 10) * 0.05, t9 + 0.95 + (9 - j) * 0.045 + Math.floor(i / 10) * 0.05);
      c.visible = k > 0.01 && go < 1; c.position.set(go * 5.5, y0 + (1 - k) * 2 + 1.6 * Math.sin(Math.PI * go), 0); c.rotation.z = go * 6;
    });
  });

  // 7 · avis sans réponse
  scn((t, a) => ({ p: [0.5 * Math.sin((t - a) * 0.4), 1.6, 13.5], q: [0, 1.4, 0] }), (g) => {
    const ph = phone(g); ph.position.set(0, 1.2, 0); ph.scale.setScalar(0.85);
    const GR = glossy('#d5d8de', { r: 0.3 }), GD = glossy('#ffc531', { r: 0.2, m: 0.2 });
    const sts = [0, 1, 2, 3, 4].map((i) => { const m = add(g, extrude(star(0.26, 0.11), 0.08, 0.03), i === 0 ? GD : GR); return m; });
    return { ph, sts };
  }, (t, a, b, s) => {
    s.ph.rotation.set(-0.05, 0.18 + 0.08 * Math.sin((t - a) * 0.7), -0.02);
    drawReviews(s.ph.userData.scr, u(t, a + 0.1, a + 1.3));
    s.sts.forEach((m, i) => { const k = E.back(u(t, a + 0.3 + i * 0.1, a + 0.6 + i * 0.1)); show(m, k); const ang = Math.PI * (0.85 - i * 0.175); m.position.set(Math.cos(ang) * 1.35, 2.85 + Math.sin(ang) * 0.3, 0.4); m.rotation.y = 0.45 * Math.sin((t - a) * 2 + i); });
  });

  // 8 · après 19 h : personne ne répond aux messages
  scn((t, a) => ({ p: [0.4 * Math.sin((t - a) * 0.5), 2.4, 15], q: [0, 2.0, 0] }), (g) => {
    const ck = clock(g); ck.position.set(-1.05, 2.9, 0); ck.scale.setScalar(0.85);
    const bl = [['Vous êtes ouverts', 'demain ?'], ['Une table pour 4', 'ce soir ?'], ['Allô ??']].map((l, i) =>
      bubble(g, l, 2.1, 0.62 + 0.2 * (l.length - 1), { tail: i % 2 ? 1 : -1, size: 38, font: 'sans' }));
    const ex = sprite(exTex, 0.9); g.add(ex);
    return { ck, bl, ex };
  }, (t, a, b, s) => {
    s.ck.userData.time(19 + 4 * E.io2(u(t, a, b)));
    s.ck.rotation.y = 0.25 * Math.sin((t - a) * 0.8);
    s.bl.forEach((bb, i) => { const t0 = a + 0.9 + i * 0.8, k = E.back(u(t, t0, t0 + 0.3)); show(bb, k * 0.95); bb.position.set(0.85 + (i % 2) * 0.25, 2.55 - i * 0.92 + 0.05 * Math.sin(t * 2 + i), 0.2 + i * 0.05); bb.rotation.set(0, -0.2, (i % 2 ? 1 : -1) * 0.04); });
    const ke = E.back(u(t, a + 3.4, a + 3.7)); s.ex.visible = ke > 0.01; s.ex.scale.setScalar(0.9 * ke); s.ex.position.set(1.65, 2.95, 0.6);
  });

  // 9 · total : les pièces tombent dans un trou
  scn((t, a) => ({ p: [0, 6.5, 13], q: [0, 0.9, 0] }), (g) => {
    const hole = add(g, new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ map: TX_HOLE, transparent: true, depthWrite: false, toneMapped: false })); hole.rotation.x = -Math.PI / 2; hole.position.y = 0.01;
    const cs = coinStream(g, 26); return { cs };
  }, (t, a, b, s) => {
    const r = rnd(9);
    s.cs.forEach((c, i) => {
      const x0 = (r() - 0.5) * 3.2, z0 = (r() - 0.5) * 1.2, rx = r() * 6, t0 = a + 0.1 + i * 0.13, k = u(t, t0, t0 + 0.85), kin = u(t, t0 + 0.85, t0 + 1.05);
      c.visible = k > 0 && kin < 1; c.position.set(lerp(x0, 0, E.i2(k)), lerp(3.4, 0.05, E.i2(k)) - kin * 0.3, lerp(z0, 0, E.i2(k))); c.rotation.set(rx + k * 7, 0, k * 4);
      c.scale.setScalar(Math.max(0.0001, Math.min(1, k * 6) * (1 - kin)));
    });
  });

  // 10 · « 20 000 ! Je ferme boutique » : le rideau tombe
  scn((t, a) => ({ p: [0.6, 3.4, 19], q: [-0.8, 1.7, 0] }), (g) => {
    const bd = backdrop(g, '#ffd2c8', '#fff1ec'); const bk = bakery(g); return { bd, bk };
  }, (t, a, b, s) => {
    s.bd.rotation.z = (t - a) * 0.1; const tf = K('Je ferme', a);
    s.bk.userData.shutter(E.bounce(u(t, tf + 0.1, tf + 0.9))); s.bk.userData.lights(1 - u(t, tf + 0.6, tf + 0.9)); s.bk.userData.door('ferme');
  });

  // 11 · « Attends. » : le rideau remonte un peu
  scn((t, a) => ({ p: [0.6, 3.4, 18], q: [-0.8, 1.7, 0] }), (g) => {
    const bd = backdrop(g, '#ffe27a', '#fff6cf'); const bk = bakery(g); return { bd, bk };
  }, (t, a, b, s) => { s.bd.rotation.z = (t - a) * 0.1; s.bk.userData.shutter(1 - 0.45 * E.back(u(t, a + 0.15, a + 0.6))); s.bk.userData.lights(0.3); });

  // 12 · l'astuce de pro : Scalify
  scn((t, a) => ({ p: [0, 1.6, 10.5], q: [0, 1.65, 0] }), (g) => {
    const bd = backdrop(g, '#dceeff', '#f6fbff'); const lg = logo3d(g);
    const gl = sprite(blueGlow, 4.2); g.add(gl); gl.position.set(0, 1.5, -0.6);
    const sp = []; for (let i = 0; i < 7; i++) { const s2 = sprite(glowTex, 0.5); g.add(s2); sp.push(s2); }
    return { bd, lg, gl, sp };
  }, (t, a, b, s) => {
    s.bd.rotation.z = -(t - a) * 0.12; const ts = K('Scalify.', a), k = E.o3(u(t, a + 0.1, ts + 0.15));
    s.lg.position.set(0, 1.5 + 0.06 * Math.sin(t * 2.5), 0); s.lg.rotation.set(0.12 * Math.sin(t * 1.3), (1 - k) * TAU * 2 + 0.25 * Math.sin((t - a) * 1.6) * k, 0); show(s.lg, 0.2 + 0.8 * E.back(u(t, a, a + 0.5)));
    s.gl.material.opacity = 0.5 + 0.5 * u(t, ts - 0.2, ts + 0.3);
    s.sp.forEach((q, i) => { const ang = i / 7 * TAU + (t - a) * 1.2; q.position.set(Math.cos(ang) * 1.6, 1.5 + Math.sin(ang) * 1.6, 0.3); q.visible = t > ts - 0.25; q.scale.setScalar(0.45 + 0.2 * Math.sin(t * 6 + i)); });
  });

  // 13 · site, fiche Google, avis, posts, IA 24/7
  scn((t, a) => ({ p: [0.4 * Math.sin((t - a) * 0.35), 1.8, 14.5], q: [0, 1.55, 0] }), (g) => {
    const ph = phone(g); ph.position.set(0, 1.4, -0.3);
    const ic = [siteCard(g), pin(g, '#ff3b30'), starIcon(g), postCard(g), bubble(g, ['IA 24/7'], 1.5, 0.7, { bg: '#4da2ff', fg: '#ffffff', size: 56, tail: 1 })];
    return { ph, ic };
  }, (t, a, b, s) => {
    const ts = [K('Ton site,', a), K('ta fiche Google,', a), K('tes avis,', a), K('tes posts…', a), K('une IA', a)];
    drawDash(s.ph.userData.scr, ts.map((x) => u(t, x + 0.1, x + 0.4)));
    s.ph.rotation.set(-0.04, 0.12 * Math.sin((t - a) * 0.6), 0);
    const pos = [[-1.3, 2.85], [1.3, 2.95], [-1.3, 1.15], [1.3, 1.2], [0, -0.3]];
    s.ic.forEach((m, i) => { const k = E.back(u(t, ts[i] - 0.05, ts[i] + 0.3)); show(m, k * [0.78, 0.75, 0.9, 0.85, 0.9][i]); m.position.set(pos[i][0], pos[i][1] + (i === 1 ? -0.55 : 0) + 0.07 * Math.sin(t * 2.2 + i), 0.5); m.rotation.y = (i === 2 ? (t - a) * 1.6 : 0.25 * Math.sin(t * 1.5 + i)); });
  });

  // 14 · « Un commerce invisible, c'est pas un commerce. C'est un secret. »
  scn((t, a, b) => ({ p: [lerp(1.0, -0.4, u(t, a, b)), 3.8, 21], q: [-0.4, 1.6, 0] }), (g) => ({ bk: bakery(g) }), (t, a, b, s) => {
    s.bk.userData.lights(1); s.bk.userData.ghost(0.85 + 0.1 * Math.sin((t - a) * 3));
  });

  // 15 · lancement : la boutique bien visible, épingle Scalify, les clients entrent
  scn((t, a) => ({ p: [lerp(0.8, -0.4, u(t, a, a + 6)), 3.6, 24], q: [0, 1.35, 0] }), (g) => {
    const bk = bakery(g); const pn = pin(g, '#4da2ff'); pn.scale.setScalar(0.9);
    const gl = sprite(blueGlow, 2.6); g.add(gl);
    const ppl = [0, 1, 2].map((i) => person(g, i + 3));
    return { bk, pn, gl, ppl };
  }, (t, a, b, s) => {
    s.bk.userData.lights(1);
    const k = E.bounce(u(t, a + 0.1, a + 0.8)); s.pn.position.set(0.1, lerp(7, 3.25, k) + 0.1 * Math.sin(t * 3) * u(t, a + 0.8, a + 1.2), 0.3); s.pn.rotation.y = (t - a) * 1.2;
    s.gl.position.set(0.1, 4.25, 0.1); s.gl.material.opacity = u(t, a + 0.6, a + 1);
    [[0.2, -3.2, 4.0], [0.9, 3.4, 4.2], [1.7, -2.6, 4.4]].forEach(([d, x0, z0], i) => { const p = s.ppl[i]; walk(p, t, a + d, a + d + 2.6, x0, z0, 1.12, 1.45); p.visible = u(t, a + d + 2.6, a + d + 2.9) < 1; if (t > a + d + 2.6) p.userData.body.scale.setScalar(Math.max(0.001, 1 - u(t, a + d + 2.6, a + d + 2.9))); });
  });

  // ================================================================ rendu à l'instant t
  function renderAt(t) {
    let i = 0; for (let k = 0; k < ST.length; k++) if (t >= ST[k]) i = k;
    const a = ST[i], b = i + 1 < ST.length ? ST[i + 1] : M.end;
    S.forEach((s, k) => { s.g.visible = k === i; });
    const sc = S[i]; sc.up(t, a, b);
    const c = sc.cam(t, a, b), punch = 1 - E.o3(u(t, a, a + 0.45));
    camera.position.set(c.p[0], c.p[1], c.p[2] * (1 + 0.08 * punch)); camera.lookAt(c.q[0], c.q[1], c.q[2]);
    renderer.render(scene, camera);
  }
  return { renderAt, renderer, scene, camera };
}
