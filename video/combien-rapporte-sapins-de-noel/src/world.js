// Monde 3D de « Combien ça rapporte de louer des sapins de Noël ? » : sapins en pot (décorés ou non), maisons dont la
// fenêtre s'allume, camionnette de livraison, traîneau, champ qui reverdit, pièces d'or, étiquette « Gérard », neige.
// Tout est une fonction pure du temps t (secondes) ; les plans suivent les débuts de scène de src/montage.js (window.MCDO).
import { THREE, RoundedBoxGeometry, makeRenderer, glossy, gold, canvasTex, E, u, lerp, extrude, roundRect, heart, star } from './kit3d.js';

const TAU = Math.PI * 2;
const FONT = '"Luckiest Guy"';

export function buildWorld(canvas, W, H) {
  const { renderer, scene, camera } = makeRenderer(canvas, W, H);
  const M = window.MCDO, ST = M.starts, K = (p, from) => window.ART.K(p, from);
  const grp = (parent) => { const g = new THREE.Group(); parent.add(g); return g; };
  const add = (parent, geo, mat) => { const m = new THREE.Mesh(geo, mat); parent.add(m); return m; };
  const show = (o, s) => { o.visible = s > 0.002; o.scale.setScalar(Math.max(s, 0.0001)); };
  const rnd = (seed) => { let s = seed % 2147483647 || 1; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; };

  // ---------------------------------------------------------------- textures et petits objets
  const GOLD = gold();
  const tex = (w, h, draw) => canvasTex(w, h, draw).tex;
  const txt = (ctx, s, x, y, size, fill, stroke, sw) => {
    ctx.font = `${size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    if (stroke) { ctx.lineWidth = sw || size * 0.16; ctx.strokeStyle = stroke; ctx.strokeText(s, x, y); }
    ctx.fillStyle = fill; ctx.fillText(s, x, y);
  };
  const sign = (w, h, s, bg, fg, size) => tex(w, h, (c) => { c.fillStyle = bg; c.beginPath(); c.roundRect(4, 4, w - 8, h - 8, 24); c.fill(); c.lineWidth = 8; c.strokeStyle = '#111'; c.stroke(); txt(c, s, w / 2, h / 2 + 6, size, fg, '#111', size * 0.14); });
  const glowTex = tex(256, 256, (c) => { const g = c.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(255,240,160,1)'); g.addColorStop(0.4, 'rgba(255,214,80,0.55)'); g.addColorStop(1, 'rgba(255,214,80,0)'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); });
  const raysTex = (c1, c2) => tex(512, 512, (c) => { c.fillStyle = c1; c.fillRect(0, 0, 512, 512); c.fillStyle = c2; for (let i = 0; i < 18; i++) { c.beginPath(); c.moveTo(256, 256); c.arc(256, 256, 400, i * TAU / 18, (i + 0.5) * TAU / 18); c.closePath(); c.fill(); } });
  const blobTex = tex(256, 256, (c) => { const g = c.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(40,30,20,0.5)'); g.addColorStop(0.5, 'rgba(40,30,20,0.22)'); g.addColorStop(1, 'rgba(40,30,20,0)'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); });
  const flakeTex = tex(64, 64, (c) => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.55, 'rgba(214,232,250,0.95)'); g.addColorStop(0.8, 'rgba(150,185,225,0.6)'); g.addColorStop(1, 'rgba(150,185,225,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
  const shadow = (parent, x, z, sx, sz) => {
    const m = add(parent, new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, toneMapped: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.003, z); m.scale.set(sx, sz, 1); m.renderOrder = -1; return m;
  };
  const sprite = (map, s) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, toneMapped: false })); sp.scale.set(s, s, 1); return sp; };
  const plane = (parent, w, h, map) => add(parent, new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, transparent: true, toneMapped: false }));
  function backdrop(parent, c1, c2) {
    const m = add(parent, new THREE.PlaneGeometry(60, 60), new THREE.MeshBasicMaterial({ map: raysTex(c1, c2), toneMapped: false, depthWrite: false }));
    m.position.set(0, 2, -10); m.renderOrder = -2; return m;
  }
  function tag(parent, s, fg, w = 0.9) {
    const g = grp(parent), cw = Math.round(w * 382);
    add(g, extrude(roundRect(w, 0.5, 0.1), 0.05, 0.02), glossy('#ffffff', { r: 0.3 }));
    plane(g, w - 0.04, 0.46, sign(cw, 184, s, '#ffffff', fg || '#ff3b30', 104)).position.z = 0.051;
    return g;
  }
  function coin(parent) { return add(parent, new THREE.CylinderGeometry(0.36, 0.36, 0.11, 40), GOLD); }
  function coinStack(parent, n) {
    const g = grp(parent), coins = [];
    for (let i = 0; i < n; i++) { const c = coin(g); c.position.y = 0.06 + i * 0.115; c.rotation.y = i * 0.7; coins.push(c); }
    shadow(g, 0, 0, 1.2, 1.0);
    g.userData.coins = coins; return g;
  }
  // neige : points qui tombent en boucle (fonction pure de t)
  function snow(parent, n, w, h, d, y0 = 0) {
    const geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), r = rnd(77), seeds = [];
    for (let i = 0; i < n; i++) seeds.push([(r() - 0.5) * w, r() * h, (r() - 0.5) * d, 0.35 + r() * 0.45, r() * TAU]);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.2, map: flakeTex, transparent: true, depthWrite: false, toneMapped: false }));
    parent.add(pts);
    pts.userData.at = (t) => {
      seeds.forEach((s, i) => { pos[i * 3] = s[0] + 0.18 * Math.sin(t * 0.9 + s[4]); pos[i * 3 + 1] = y0 + (((s[1] - t * s[3]) % h) + h) % h; pos[i * 3 + 2] = s[2]; });
      geo.attributes.position.needsUpdate = true;
    };
    return pts;
  }

  // ---------------------------------------------------------------- sapin (pivot au sol) : pot, tronc, 4 étages ; boules et étoile en option
  const NEEDLE = ['#1d7a3e', '#22874a', '#26924f', '#2b9c57'].map((c) => glossy(c, { r: 0.5, cc: 0.35 }));
  const BALL = ['#e0322b', '#f6c445', '#2f8cff', '#ffffff', '#ff6fb5'].map((c, i) => glossy(c, { r: 0.2, m: i === 1 ? 0.8 : 0.1 }));
  const POT = glossy('#c8553d', { r: 0.45, cc: 0.5 }), SOIL = new THREE.MeshStandardMaterial({ color: '#4a2f17', roughness: 1 }), BARK = new THREE.MeshStandardMaterial({ color: '#6b4226', roughness: 0.9 });
  const STAR = glossy('#ffd23f', { r: 0.2, m: 0.5 });
  const TIERS = [[0.62, 0.8, 1.02], [0.5, 0.7, 1.42], [0.37, 0.6, 1.78], [0.24, 0.46, 2.08]];
  function tree(parent, o = {}) {
    const g = grp(parent), r = rnd(o.seed || 3);
    if (o.pot !== false) {
      add(g, new THREE.CylinderGeometry(0.38, 0.29, 0.52, 32), o.potMat || POT).position.y = 0.26;
      const rim = add(g, new THREE.TorusGeometry(0.38, 0.055, 10, 32), o.potMat || POT); rim.rotation.x = Math.PI / 2; rim.position.y = 0.52;
      add(g, new THREE.CylinderGeometry(0.35, 0.35, 0.04, 32), SOIL).position.y = 0.5;
    }
    add(g, new THREE.CylinderGeometry(0.07, 0.09, 0.4, 12), BARK).position.y = 0.66;
    const tiers = TIERS.map(([rad, h, y], i) => { const c = add(g, new THREE.ConeGeometry(rad, h, 28), NEEDLE[i]); c.position.y = y; c.rotation.y = r() * TAU; return c; });
    if (o.deco) {
      TIERS.forEach(([rad, h, y], i) => { for (let k = 0; k < 7 - i; k++) { const a = k / (7 - i) * TAU + i * 0.6, b = add(g, new THREE.SphereGeometry(0.065, 14, 10), BALL[(k + i) % 5]); b.position.set(Math.cos(a) * rad * 0.9, y - h / 2 + 0.09, Math.sin(a) * rad * 0.9); } });
      const st = add(g, extrude(star(0.17, 0.075), 0.05, 0.02), STAR); st.position.y = 2.42;
    }
    shadow(g, 0, 0, 1.4, 1.2);
    g.userData.tiers = tiers; return g;
  }
  // maison : fenêtre éteinte ou allumée avec un sapin derrière
  const TX_WIN_OFF = tex(128, 112, (c) => { c.fillStyle = '#5d6b7d'; c.fillRect(0, 0, 128, 112); c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(14, 10, 20, 92); c.fillStyle = '#ffffff'; c.fillRect(60, 0, 8, 112); c.fillRect(0, 52, 128, 8); });
  const TX_WIN_ON = tex(128, 112, (c) => {
    const g = c.createRadialGradient(64, 60, 4, 64, 60, 90); g.addColorStop(0, '#fff3b0'); g.addColorStop(1, '#ffb347'); c.fillStyle = g; c.fillRect(0, 0, 128, 112);
    c.fillStyle = '#1d7a3e'; c.beginPath(); c.moveTo(64, 14); c.lineTo(100, 100); c.lineTo(28, 100); c.closePath(); c.fill();
    ['#e0322b', '#2f8cff', '#ffffff', '#e0322b'].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.arc(50 + (i % 2) * 28, 50 + i * 12, 5, 0, TAU); c.fill(); });
    c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(64, 14, 7, 0, TAU); c.fill();
    c.fillStyle = '#ffffff'; c.fillRect(60, 0, 8, 112); c.fillRect(0, 52, 128, 8);
  });
  function house(parent, o = {}) {
    const g = grp(parent);
    add(g, new RoundedBoxGeometry(2.0, 1.5, 1.6, 3, 0.05), new THREE.MeshStandardMaterial({ color: o.wall || '#fbe6c8', roughness: 0.8 })).position.y = 0.75;
    const tri = new THREE.Shape(); tri.moveTo(-1.18, 0); tri.lineTo(1.18, 0); tri.lineTo(0, 0.95); tri.closePath();
    const roof = add(g, new THREE.ExtrudeGeometry(tri, { depth: 1.8, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 }), glossy(o.roof || '#c0392b', { r: 0.45, cc: 0.3 })); roof.position.set(0, 1.5, -0.9);
    const snowCap = add(g, new THREE.ExtrudeGeometry((() => { const s = new THREE.Shape(); s.moveTo(-0.7, 0.4); s.lineTo(0.7, 0.4); s.lineTo(0, 0.99); s.closePath(); return s; })(), { depth: 1.86, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: '#f7fbff', roughness: 0.7 }));
    snowCap.position.set(0, 1.52, -0.93);
    add(g, new THREE.BoxGeometry(0.28, 0.6, 0.28), new THREE.MeshStandardMaterial({ color: '#9b4a32', roughness: 0.8 })).position.set(0.55, 2.2, -0.25);
    add(g, new THREE.PlaneGeometry(0.46, 0.92), new THREE.MeshStandardMaterial({ color: '#7a4a2e', roughness: 0.6 })).position.set(0.48, 0.46, 0.81);
    const wOff = add(g, new THREE.PlaneGeometry(0.66, 0.58), new THREE.MeshBasicMaterial({ map: TX_WIN_OFF, toneMapped: false })); wOff.position.set(-0.42, 0.92, 0.805);
    const wOn = add(g, new THREE.PlaneGeometry(0.66, 0.58), new THREE.MeshBasicMaterial({ map: TX_WIN_ON, toneMapped: false })); wOn.position.set(-0.42, 0.92, 0.806);
    const gl = sprite(glowTex, 1.4); gl.position.set(-0.42, 0.92, 0.95); g.add(gl);
    shadow(g, 0, 0.1, 3.2, 2.6);
    g.userData.lit = (k) => { wOn.visible = k > 0.5; wOff.visible = !wOn.visible; gl.visible = k > 0.5; gl.material.opacity = 0.7 * Math.min(1, (k - 0.5) * 3); };
    g.userData.lit(0);
    return g;
  }
  // camionnette « SAPINS À LOUER »
  function van(parent) {
    const g = grp(parent), WHITE = glossy('#ffffff', { r: 0.25 }), GRN = glossy('#22874a', { r: 0.25 }), DARK = glossy('#1d2433', { r: 0.15 });
    add(g, new RoundedBoxGeometry(2.4, 1.5, 1.5, 4, 0.12), WHITE).position.set(-0.35, 1.2, 0);
    plane(g, 2.1, 0.52, sign(620, 150, 'SAPINS À LOUER', '#22874a', '#ffffff', 74)).position.set(-0.35, 1.25, 0.756);
    add(g, new RoundedBoxGeometry(1.1, 1.15, 1.45, 4, 0.2), GRN).position.set(1.35, 0.98, 0);
    add(g, new RoundedBoxGeometry(0.06, 0.5, 1.2, 2, 0.02), DARK).position.set(1.89, 1.2, 0);
    add(g, new THREE.PlaneGeometry(0.5, 0.42), DARK).position.set(1.45, 1.2, 0.73);
    for (const x of [-1.1, 1.3]) for (const z of [-0.7, 0.7]) {
      const w = add(g, new THREE.CylinderGeometry(0.3, 0.3, 0.22, 28), glossy('#222', { r: 0.6 })); w.rotation.x = Math.PI / 2; w.position.set(x, 0.3, z);
      const hb = add(g, new THREE.CylinderGeometry(0.13, 0.13, 0.24, 20), glossy('#c3c8d0', { m: 0.8, r: 0.3 })); hb.rotation.x = Math.PI / 2; hb.position.set(x, 0.3, z);
    }
    const tr = tree(g, { seed: 9 }); tr.scale.setScalar(0.5); tr.position.set(-0.6, 1.95, 0); tr.rotation.z = 0.0;
    shadow(g, 0.2, 0, 4.4, 2.2);
    return g;
  }
  // traîneau rouge, patins dorés, cadeaux
  function sleigh(parent) {
    const g = grp(parent), RED = glossy('#d62828', { r: 0.3 }), GLD = glossy('#f6c445', { m: 0.9, r: 0.25 });
    const sh = new THREE.Shape();
    sh.moveTo(-1.3, 0.3); sh.lineTo(0.9, 0.3); sh.quadraticCurveTo(1.5, 0.35, 1.45, 0.95); sh.quadraticCurveTo(1.4, 1.3, 1.08, 1.2);
    sh.quadraticCurveTo(1.28, 0.95, 1.0, 0.75); sh.lineTo(-0.6, 0.75); sh.lineTo(-0.78, 1.25); sh.quadraticCurveTo(-1.32, 1.3, -1.3, 0.85); sh.closePath();
    const body = add(g, new THREE.ExtrudeGeometry(sh, { depth: 1.1, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 3, curveSegments: 16 }), RED); body.position.z = -0.55;
    for (const z of [-0.5, 0.5]) {
      const pts = [[-1.4, 0.06], [0, 0.06], [1.1, 0.06], [1.55, 0.18], [1.62, 0.42], [1.45, 0.5]].map(([x, y]) => new THREE.Vector3(x, y, z));
      add(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.045, 10, false), GLD);
      for (const x of [-0.9, 0.6]) add(g, new THREE.CylinderGeometry(0.03, 0.03, 0.26, 8), GLD).position.set(x, 0.18, z);
    }
    [[-0.75, 1.0, 0, '#2f8cff', 0.5], [-0.15, 0.95, 0.1, '#2b9c57', 0.42], [0.4, 0.92, -0.1, '#f6c445', 0.36]].forEach(([x, y, z, col, s]) => {
      const b = grp(g); b.position.set(x, y + s / 2, z); b.rotation.y = x;
      add(b, new RoundedBoxGeometry(s, s, s, 2, 0.03), glossy(col, { r: 0.3 }));
      add(b, new THREE.BoxGeometry(s * 1.02, s * 1.02, s * 0.2), glossy('#ffffff', { r: 0.3 })); add(b, new THREE.BoxGeometry(s * 0.2, s * 1.02, s * 1.02), glossy('#ffffff', { r: 0.3 }));
    });
    shadow(g, 0, 0, 4, 2);
    return g;
  }

  // ================================================================ les plans (index = numéro de scène - 1)
  const S = [];
  const scn = (cam, build, up) => { const g = grp(scene); g.visible = false; const st = build(g) || {}; S.push({ g, cam, up: (t, a, b) => up(t, a, b, st) }); };

  // 1 · « Ce gars loue le même sapin de Noël à la même famille. Chaque année. »
  scn((t, a) => ({ p: [0.4 + 0.6 * Math.sin((t - a) * 0.4), 3.0, 16.5], q: [0.05, 1.3, 0] }), (g) => {
    const hs = house(g); hs.position.set(-0.75, 0, -0.6); hs.userData.lit(1);
    const tr = tree(g, { deco: true, seed: 4 }); tr.position.set(1.15, 0, 0.6);
    const tg = tag(tr, 'LOUÉ', '#22874a'); tg.position.set(0.55, 1.3, 0.45); tg.scale.setScalar(0.85);
    const sn = snow(g, 140, 9, 6, 4); return { tr, tg, sn };
  }, (t, a, b, s) => {
    s.sn.userData.at(t); s.tr.rotation.y = 0.2 * Math.sin((t - a) * 1.2);
    const tk = E.back(u(t, K('Chaque année.', a) - 0.1, K('Chaque année.', a) + 0.25)); show(s.tg, 0.85 * tk); s.tg.rotation.z = 0.25 * Math.sin((t - a) * 4);
  });

  // 2 · titre : la pépinière de sapins en pot
  scn((t, a) => ({ p: [lerp(-1.2, 1.2, u(t, a, a + 2.5)), 2.6, 15], q: [0.6, 1.3, 0] }), (g) => {
    for (let i = 0; i < 5; i++) { const tr = tree(g, { seed: 20 + i }); tr.position.set(-1.6 + i * 1.15, 0, (i % 2) * -0.5); tr.scale.setScalar(0.85 + (i % 3) * 0.08); }
  }, () => {});

  // 3 · 300 sapins à 25 € : la pépinière se remplit
  scn((t, a, b) => ({ p: [lerp(-1.5, 1.5, u(t, a, b)), 9, 16], q: [0, 0.6, -1.8] }), (g) => {
    const trs = []; for (let i = 0; i < 30; i++) { const tr = tree(g, { seed: 40 + i }); tr.position.set(-2.5 + (i % 6) * 1.0, 0, -4.2 + Math.floor(i / 6) * 1.0); tr.scale.setScalar(0.62); trs.push(tr); }
    return { trs };
  }, (t, a, b, s) => { const t0 = K('300', a); s.trs.forEach((tr, i) => show(tr, 0.62 * E.back(u(t, t0 - 0.6 + i * 0.03, t0 - 0.3 + i * 0.03)))); });

  // 4 · loué 45 € pour décembre, livré puis repris en janvier
  scn((t, a) => ({ p: [-0.2 + 0.4 * Math.sin((t - a) * 0.4), 3.6, 23], q: [-0.3, 1.1, 0] }), (g) => {
    const hs = house(g); hs.position.set(1.2, 0, -0.8); hs.userData.lit(1);
    const vn = van(g); vn.scale.setScalar(0.8);
    const tr = tree(g, { deco: true, seed: 5 }); tr.scale.setScalar(0.75);
    const tg = tag(tr, '45 €', '#22874a'); tg.position.set(0.6, 1.6, 0.4); tg.scale.setScalar(1.05);
    const sn = snow(g, 110, 10, 6, 4); return { vn, tr, tg, sn };
  }, (t, a, b, s) => {
    s.sn.userData.at(t);
    const kin = E.o3(u(t, a, a + 1.2)); s.vn.position.set(lerp(-9, -1.9, kin), 0, 0.9); s.vn.rotation.y = 0;
    const tl = K('livrés', a), tr = K('repris', a), kd = E.io2(u(t, tl - 0.3, tl + 0.5)), kb = E.io2(u(t, tr - 0.2, tr + 0.6));
    const x = kb > 0 ? lerp(0.75, -2.38, kb) : lerp(-2.38, 0.75, kd), y = kb > 0 ? lerp(0, 1.55, kb) : lerp(1.55, 0, kd);
    s.tr.position.set(x, y + 0.12 * Math.sin(Math.PI * (kb > 0 ? kb : kd)), 0.55); s.tr.visible = kd > 0.02;
    show(s.tg, 1.05 * E.back(u(t, K('45', a) - 0.1, K('45', a) + 0.25))); s.tg.rotation.z = 0.2 * Math.sin(t * 3);
  });

  // 5 · 300 sapins loués : le village s'allume
  scn((t, a, b) => ({ p: [lerp(-1.2, 1.2, u(t, a, b)), 5.5, 22], q: [0, 0.9, -1.6] }), (g) => {
    const hs = []; const cols = ['#fbe6c8', '#dff1ff', '#ffe0e8', '#e8f6dc', '#fff3c4'];
    for (let i = 0; i < 9; i++) { const h = house(g, { wall: cols[i % 5], roof: i % 2 ? '#2f6fd6' : '#c0392b' }); h.position.set(-2.8 + (i % 3) * 2.8, 0, -4.4 + Math.floor(i / 3) * 2.7); h.scale.setScalar(0.85); hs.push(h); }
    const sn = snow(g, 160, 12, 7, 9, 0); return { hs, sn };
  }, (t, a, b, s) => { s.sn.userData.at(t); s.hs.forEach((h, i) => h.userData.lit(u(t, a + 0.3 + i * 0.16, a + 0.4 + i * 0.16) * 1.0)); });

  // 6 · « 13 500 ! Je m'achète un traîneau »
  scn((t, a) => ({ p: [0.85, 1.8, 18], q: [0.3, 0.9, 0] }), (g) => {
    const bd = backdrop(g, '#ffe27a', '#fff6cf'); const sl = sleigh(g); return { bd, sl };
  }, (t, a, b, s) => {
    s.bd.rotation.z = (t - a) * 0.12;
    const tc = K('traîneau.', a), k = E.o3(u(t, tc - 0.7, tc + 0.1));
    s.sl.position.set(lerp(-9, 1.0, k), 0.3 * Math.sin(Math.PI * k), 0); s.sl.rotation.set(0, -0.35, 0.08 * Math.sin((t - a) * 6) * (1 - k));
  });

  // 7 · « Attends » : 13 pièces (1 pièce = 1 000 €) ; sapins −7, camionnette −1, essence −1 → 4
  scn((t, a) => ({ p: [0, 3.0, 11.5], q: [0, 0.7, 0] }), (g) => {
    const stacks = [5, 4, 4].map((n, i) => { const st = coinStack(g, n); st.position.set(-1.1 + i * 1.1, 0, (i % 2) * 0.3); return st; });
    return { coins: stacks.flatMap((st) => st.userData.coins).sort((p, q) => q.position.y - p.position.y) };
  }, (t, a, b, s) => {
    const cuts = [[K('sapins,', a), 7], [K('la camionnette', a), 1], [K("l'essence:", a), 1]];
    const out = []; cuts.forEach(([tc, m]) => { for (let i = 0; i < m; i++) out.push(tc + i * 0.05); });
    s.coins.forEach((c, i) => {
      const base = c.userData.y0 ?? (c.userData.y0 = c.position.y);
      if (i < out.length && t > out[i]) { const k = u(t, out[i], out[i] + 0.55); c.position.y = base + 4 * E.i2(k); c.position.x = (i % 2 ? 1 : -1) * 2.5 * k; c.visible = k < 1; }
      else { c.position.y = base; c.position.x = 0; c.visible = true; }
    });
  });

  // 8 · l'astuce de pro : on replante dans un champ, la neige fond, ils grandissent
  scn((t, a) => ({ p: [0.5 * Math.sin((t - a) * 0.3), 6.2, 15], q: [0, 0.6, 0] }), (g) => {
    const gm = new THREE.MeshStandardMaterial({ color: '#f4f8fc', roughness: 0.9 });
    add(g, new RoundedBoxGeometry(7.2, 0.4, 4.6, 3, 0.1), gm).position.y = -0.2;
    const trs = []; for (let i = 0; i < 12; i++) { const tr = tree(g, { pot: false, seed: 60 + i }); tr.position.set(-2.55 + (i % 4) * 1.7, 0, -1.4 + Math.floor(i / 4) * 1.4); trs.push(tr); }
    const sp = []; for (let i = 0; i < 8; i++) { const s2 = sprite(glowTex, 0.6); g.add(s2); sp.push(s2); }
    return { gm, trs, sp };
  }, (t, a, b, s) => {
    const tp = K('Tu replantes', a), tg = K('et ils', a);
    s.gm.color.set('#f4f8fc').lerp(new THREE.Color('#86c96f'), E.io2(u(t, tg - 0.2, tg + 0.8)));
    s.trs.forEach((tr, i) => {
      const k = u(t, tp - 0.2 + i * 0.08, tp + 0.2 + i * 0.08), grow = E.o3(u(t, tg + i * 0.04, tg + 0.9 + i * 0.04));
      tr.visible = k > 0; tr.position.y = lerp(3, 0, E.i2(k)); tr.scale.setScalar(Math.max(0.0001, 0.45 + 0.4 * grow));
    });
    s.sp.forEach((q, i) => { const ang = i / 8 * TAU + (t - a); q.position.set(Math.cos(ang) * 3, 1.6 + 0.4 * Math.sin(ang * 2), Math.sin(ang) * 1.6); q.visible = t > tg; q.scale.setScalar(0.5 + 0.2 * Math.sin(t * 6 + i)); });
  });

  // 9 · l'année d'après : on reloue les mêmes, presque rien à racheter → plus de 10 000 €
  scn((t, a) => ({ p: [0.4 * Math.sin((t - a) * 0.5), 3.4, 15], q: [0, 1.2, 0] }), (g) => {
    for (let i = 0; i < 3; i++) { const tr = tree(g, { seed: 80 + i }); tr.position.set(-1.6 + i * 1.6, 0, -1.6); tr.scale.setScalar(0.8); }
    const stacks = [0, 1].map((i) => { const st = coinStack(g, 5); st.position.set(-0.6 + i * 1.2, 0, 0.6); return st; });
    return { coins: stacks.flatMap((st, j) => st.userData.coins.map((c, k) => ({ c, k: j * 5 + k }))) };
  }, (t, a, b, s) => {
    const t0 = K('il te reste', a);
    s.coins.forEach(({ c, k }) => { const y0 = c.userData.y0 ?? (c.userData.y0 = c.position.y), kk = E.o3(u(t, t0 + (k % 5) * 0.12 + Math.floor(k / 5) * 0.06, t0 + 0.25 + (k % 5) * 0.12 + Math.floor(k / 5) * 0.06)); c.visible = kk > 0.01; c.position.y = y0 + (1 - kk) * 2.5; });
  });

  // 10 · les familles redemandent le même sapin… qui s'appelle Gérard
  scn((t, a) => ({ p: [0.4 * Math.sin((t - a) * 0.6), 1.9, 11], q: [0, 1.25, 0] }), (g) => {
    const tr = tree(g, { deco: true, seed: 4 }); tr.position.x = 0.35;
    const tg = grp(tr); tg.position.set(0.45, 1.5, 0.55);
    const str = add(tg, new THREE.CylinderGeometry(0.008, 0.008, 0.3, 6), new THREE.MeshBasicMaterial({ color: '#8a5a36' })); str.position.y = 0.0;
    const card = tag(tg, 'GÉRARD', '#e0322b', 1.3); card.position.y = -0.35; card.scale.setScalar(0.8);
    const hm = glossy('#ff3b5c', { r: 0.25 }), hs = []; for (let i = 0; i < 7; i++) hs.push(add(g, extrude(heart(0.16), 0.08, 0.03), hm));
    return { tr, tg, hs };
  }, (t, a, b, s) => {
    s.tr.rotation.y = 0.25 * Math.sin((t - a) * 1.1);
    const tn = K('prénom.', a); show(s.tg, E.back(u(t, tn - 0.5, tn - 0.15))); s.tg.rotation.z = 0.3 * Math.sin((t - a) * 3.5) * Math.exp(-(t - tn) * 1.5 * (t > tn));
    s.hs.forEach((h, i) => { const t0 = K('redemandent', a) + i * 0.3, k = u(t, t0, t0 + 1.8); h.visible = k > 0 && k < 1; h.position.set(-1.3 + Math.sin(i * 2.1) * 0.5 + 0.3 * k, 0.6 + 2.4 * k, 0.4); h.rotation.z = 0.3 * Math.sin(t * 3 + i); h.scale.setScalar(0.5 + 0.6 * Math.sin(Math.PI * k)); });
  });

  // 11 · « C'est un abonnement » : le sapin tourne, des étincelles
  scn((t, a) => ({ p: [0, 2.0, 10.5], q: [0, 1.25, 0] }), (g) => {
    const tr = tree(g, { deco: true, seed: 6 }); tr.position.x = 0.35;
    const st = []; for (let i = 0; i < 6; i++) { const s2 = sprite(glowTex, 0.6); g.add(s2); st.push(s2); }
    return { tr, st };
  }, (t, a, b, s) => {
    s.tr.rotation.y = (t - a) * 1.4; s.tr.position.y = 0.04 * Math.sin(t * 3);
    s.st.forEach((sp, i) => { const ang = i / 6 * TAU + (t - a) * 1.4; sp.position.set(0.35 + Math.cos(ang) * 1.1, 1.2 + Math.sin(ang * 2) * 0.7, Math.sin(ang) * 0.8); sp.visible = t > K('abonnement.', a) - 0.3; sp.scale.setScalar(0.5 + 0.2 * Math.sin(t * 5 + i)); });
  });

  // 12 · conclusion : la neige tombe sur le dessin 2D
  scn(() => ({ p: [0, 2, 10], q: [0, 2, 0] }), (g) => ({ sn: snow(g, 120, 7, 7, 3, -1.5) }), (t, a, b, s) => { s.sn.userData.at(t); });

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
