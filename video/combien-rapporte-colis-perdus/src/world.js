// Monde 3D de « Ce magasin revend tes colis perdus » : cartons, palettes, entrepôt, étagères, camion, pièces d'or, téléphone.
// Tout est une fonction pure du temps t (secondes) ; les plans suivent les débuts de scène de src/montage.js (window.MCDO).
import { THREE, RoundedBoxGeometry, makeRenderer, glossy, gold, canvasTex, E, u, lerp, extrude, flat, roundRect, heart, stadium } from './kit3d.js';

const TAU = Math.PI * 2;
const FONT = '"Luckiest Guy"';

export function buildWorld(canvas, W, H) {
  const { renderer, scene, camera } = makeRenderer(canvas, W, H);
  const M = window.MCDO, ST = M.starts, K = (p, from) => window.ART.K(p, from);
  const grp = (parent) => { const g = new THREE.Group(); parent.add(g); return g; };
  const add = (parent, geo, mat) => { const m = new THREE.Mesh(geo, mat); parent.add(m); return m; };
  const show = (o, s) => { o.visible = s > 0.002; o.scale.setScalar(Math.max(s, 0.0001)); };
  const rnd = (seed) => { let s = seed % 2147483647 || 1; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; };

  // ---------------------------------------------------------------- matières
  const CARD = new THREE.MeshStandardMaterial({ color: '#c99a62', roughness: 0.82 });
  const CARD2 = new THREE.MeshStandardMaterial({ color: '#b98850', roughness: 0.85 });
  const TAPE = new THREE.MeshStandardMaterial({ color: '#e9c891', roughness: 0.35, metalness: 0.05 });
  const HOLE = new THREE.MeshStandardMaterial({ color: '#4a2f17', roughness: 1 });
  const WOOD = new THREE.MeshStandardMaterial({ color: '#dcae74', roughness: 0.78 });
  const GOLD = gold();
  const tex = (w, h, draw) => canvasTex(w, h, draw).tex;
  const txt = (ctx, s, x, y, size, fill, stroke, sw) => {
    ctx.font = `${size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    if (stroke) { ctx.lineWidth = sw || size * 0.16; ctx.strokeStyle = stroke; ctx.strokeText(s, x, y); }
    ctx.fillStyle = fill; ctx.fillText(s, x, y);
  };
  const TX_Q = tex(256, 256, (c) => { c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(14, 14, 228, 228, 26); c.fill(); c.lineWidth = 8; c.strokeStyle = '#222'; c.stroke(); txt(c, '?', 128, 140, 190, '#ff3b30', '#111', 14); });
  const TX_LABEL = tex(256, 160, (c) => {
    c.fillStyle = '#ffffff'; c.fillRect(0, 0, 256, 160); c.fillStyle = '#111';
    for (let i = 0; i < 34; i++) { const w = [3, 5, 2, 7][i % 4]; c.fillRect(18 + i * 6.4, 18, w, 70); }
    c.fillRect(18, 104, 150, 10); c.fillRect(18, 124, 110, 10); c.fillStyle = '#ff3b30'; c.fillRect(196, 100, 42, 42);
  });
  const TX_ROLL = tex(256, 256, (c) => { c.fillStyle = '#9aa5b1'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#7b8693'; for (let y = 0; y < 256; y += 21) c.fillRect(0, y, 256, 6); });
  const TX_WALL = tex(256, 256, (c) => { c.fillStyle = '#d5dbe2'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#b8c0ca'; for (let x = 0; x < 256; x += 32) c.fillRect(x, 0, 12, 256); });
  TX_WALL.wrapS = TX_WALL.wrapT = THREE.RepeatWrapping; TX_WALL.repeat.set(6, 2);
  const sign = (w, h, s, bg, fg, size) => tex(w, h, (c) => { c.fillStyle = bg; c.beginPath(); c.roundRect(4, 4, w - 8, h - 8, 24); c.fill(); c.lineWidth = 8; c.strokeStyle = '#111'; c.stroke(); txt(c, s, w / 2, h / 2 + 6, size, fg, '#111', size * 0.14); });
  const glowTex = tex(256, 256, (c) => { const g = c.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(255,240,160,1)'); g.addColorStop(0.4, 'rgba(255,214,80,0.55)'); g.addColorStop(1, 'rgba(255,214,80,0)'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); });
  const raysTex = (c1, c2) => tex(512, 512, (c) => { c.fillStyle = c1; c.fillRect(0, 0, 512, 512); c.fillStyle = c2; for (let i = 0; i < 18; i++) { c.beginPath(); c.moveTo(256, 256); c.arc(256, 256, 400, i * TAU / 18, (i + 0.5) * TAU / 18); c.closePath(); c.fill(); } });
  const blobTex = tex(256, 256, (c) => { const g = c.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(40,30,20,0.5)'); g.addColorStop(0.5, 'rgba(40,30,20,0.22)'); g.addColorStop(1, 'rgba(40,30,20,0)'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); });
  const shadow = (parent, x, z, sx, sz) => {
    const m = add(parent, new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, toneMapped: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.003, z); m.scale.set(sx, sz, 1); m.renderOrder = -1; return m;
  };
  const sprite = (map, s) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, toneMapped: false })); sp.scale.set(s, s, 1); return sp; };
  const qTex = tex(256, 256, (c) => txt(c, '?', 128, 140, 220, '#ffe14d', '#111', 22));

  // ---------------------------------------------------------------- carton (pivot au sol, au centre) ; flaps animables pour l'ouvrir
  function box(parent, w, h, d, o = {}) {
    const g = grp(parent);
    add(g, new RoundedBoxGeometry(w, h, d, 3, Math.min(w, h, d) * 0.05), o.dark ? CARD2 : CARD).position.y = h / 2;
    const tape = add(g, new THREE.BoxGeometry(w * 0.24, 0.014, d * 1.004), TAPE); tape.position.y = h + 0.002;
    const tf = add(g, new THREE.BoxGeometry(w * 0.24, h * 0.36, 0.01), TAPE); tf.position.set(0, h - h * 0.18, d / 2 + 0.003);
    if (o.label !== false) {
      const lab = add(g, new THREE.PlaneGeometry(Math.min(w, h) * 0.42, Math.min(w, h) * (o.q ? 0.42 : 0.27)), new THREE.MeshStandardMaterial({ map: o.q ? TX_Q : TX_LABEL, roughness: 0.6 }));
      lab.position.set(w * 0.22, h * 0.42, d / 2 + 0.006); lab.rotation.z = o.q ? -0.08 : 0.04;
    }
    if (o.flaps) {
      const hole = add(g, new THREE.PlaneGeometry(w * 0.92, d * 0.92), HOLE); hole.rotation.x = -Math.PI / 2; hole.position.y = h + 0.004; hole.visible = false;
      const pl = grp(g), pr = grp(g); pl.position.set(-w / 2, h + 0.006, 0); pr.position.set(w / 2, h + 0.006, 0);
      add(pl, new THREE.BoxGeometry(w / 2, 0.02, d * 0.98), CARD).position.x = w / 4;
      add(pr, new THREE.BoxGeometry(w / 2, 0.02, d * 0.98), CARD).position.x = -w / 4;
      g.userData.open = (k) => { tape.visible = k < 0.05; hole.visible = k > 0.05; pl.rotation.z = 2.3 * k; pr.rotation.z = -2.3 * k; };
      g.userData.open(0);
    }
    return g;
  }
  // palette en bois chargée de cartons
  function pallet(parent, seed) {
    const g = grp(parent), r = rnd(seed || 7);
    for (const x of [-0.7, 0, 0.7]) add(g, new THREE.BoxGeometry(0.16, 0.14, 1.2), WOOD).position.set(x, 0.07, 0);
    for (let i = 0; i < 6; i++) add(g, new THREE.BoxGeometry(1.6, 0.05, 0.16), WOOD).position.set(0, 0.165, -0.5 + i * 0.2);
    const lay = [[-0.4, 0.19, -0.28, 0.72, 0.5, 0.52], [0.4, 0.19, -0.28, 0.7, 0.46, 0.52], [-0.4, 0.19, 0.28, 0.72, 0.52, 0.52], [0.38, 0.19, 0.28, 0.68, 0.44, 0.5],
      [-0.36, 0.71, -0.1, 0.6, 0.42, 0.7], [0.34, 0.66, 0.05, 0.66, 0.38, 0.62], [0.0, 1.06, 0.0, 0.62, 0.34, 0.56]];
    lay.forEach((q, i) => { const b = box(g, q[3], q[4], q[5], { dark: i % 3 === 1, q: i === 6 }); b.position.set(q[0], q[1], q[2]); b.rotation.y = (r() - 0.5) * 0.18; });
    shadow(g, 0, 0, 2.2, 1.6);
    return g;
  }
  function rack(parent, seed) {
    const g = grp(parent), r = rnd(seed || 3), BLUE = glossy('#2f6fd6', { r: 0.4 }), ORA = glossy('#ff8a1f', { r: 0.35 });
    for (const x of [-1.6, 1.6]) for (const z of [-0.45, 0.45]) add(g, new THREE.BoxGeometry(0.1, 3.2, 0.1), BLUE).position.set(x, 1.6, z);
    for (const y of [0.12, 1.15, 2.2]) { for (const z of [-0.45, 0.45]) add(g, new THREE.BoxGeometry(3.3, 0.12, 0.08), ORA).position.set(0, y, z); add(g, new THREE.BoxGeometry(3.2, 0.03, 0.9), WOOD).position.set(0, y + 0.06, 0); }
    for (const y of [0.2, 1.23, 2.28]) for (let i = 0; i < 4; i++) {
      const w = 0.55 + r() * 0.2, h = 0.4 + r() * 0.35, b = box(g, w, h, 0.6, { dark: (i + y) % 2 > 1, q: r() > 0.7 });
      b.position.set(-1.15 + i * 0.77 + (r() - 0.5) * 0.08, y, 0); b.rotation.y = (r() - 0.5) * 0.2;
    }
    shadow(g, 0, 0, 4.2, 1.6);
    return g;
  }
  function warehouse(parent) {
    const g = grp(parent);
    add(g, new THREE.BoxGeometry(6, 3, 4), new THREE.MeshStandardMaterial({ map: TX_WALL, roughness: 0.7 })).position.y = 1.5;
    const tri = new THREE.Shape(); tri.moveTo(-3.25, 0); tri.lineTo(3.25, 0); tri.lineTo(0, 1.1); tri.closePath();
    const roof = add(g, new THREE.ExtrudeGeometry(tri, { depth: 4.3, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: '#8a94a6', roughness: 0.6 }));
    roof.position.set(0, 3, -2.15);
    add(g, new THREE.PlaneGeometry(2.4, 2.3), new THREE.MeshStandardMaterial({ map: TX_ROLL, roughness: 0.5, metalness: 0.2 })).position.set(-0.9, 1.15, 2.006);
    add(g, new THREE.PlaneGeometry(0.9, 2.0), new THREE.MeshStandardMaterial({ color: '#2f6fd6', roughness: 0.4 })).position.set(1.7, 1.0, 2.006);
    const sg = add(g, new THREE.PlaneGeometry(3.4, 0.7), new THREE.MeshBasicMaterial({ map: sign(680, 140, 'ENTREPÔT', '#ffd23f', '#ffffff', 92), transparent: true, toneMapped: false }));
    sg.position.set(0, 3.35, 2.25);
    const ap = add(g, new THREE.PlaneGeometry(9, 3.6), new THREE.MeshStandardMaterial({ color: '#cfd3d8', roughness: 0.95 })); ap.rotation.x = -Math.PI / 2; ap.position.set(0, 0.002, 3.6);
    shadow(g, 0, 0.4, 8, 6);
    return g;
  }
  function truck(parent) {
    const g = grp(parent), WHITE = glossy('#ffffff', { r: 0.25 }), ORA = glossy('#ff7a1a', { r: 0.25 }), DARK = glossy('#1d2433', { r: 0.15 });
    add(g, new RoundedBoxGeometry(3.0, 1.9, 1.7, 4, 0.12), WHITE).position.set(-0.4, 1.45, 0);
    add(g, new THREE.PlaneGeometry(2.6, 0.62), new THREE.MeshBasicMaterial({ map: sign(640, 150, 'COLIS PERDUS', '#ff7a1a', '#ffffff', 86), transparent: true, toneMapped: false })).position.set(-0.4, 1.55, 0.856);
    add(g, new RoundedBoxGeometry(1.3, 1.5, 1.65, 4, 0.22), ORA).position.set(1.75, 1.15, 0);
    add(g, new RoundedBoxGeometry(0.06, 0.62, 1.4, 2, 0.02), DARK).position.set(2.39, 1.45, 0);
    add(g, new THREE.PlaneGeometry(0.62, 0.5), DARK).position.set(1.85, 1.45, 0.83);
    for (const x of [-1.3, 0.6, 1.8]) for (const z of [-0.8, 0.8]) {
      const w = add(g, new THREE.CylinderGeometry(0.36, 0.36, 0.26, 32), glossy('#222', { r: 0.6 })); w.rotation.x = Math.PI / 2; w.position.set(x, 0.36, z);
      const hb = add(g, new THREE.CylinderGeometry(0.16, 0.16, 0.28, 24), glossy('#c3c8d0', { m: 0.8, r: 0.3 })); hb.rotation.x = Math.PI / 2; hb.position.set(x, 0.36, z);
    }
    shadow(g, 0.2, 0, 5.2, 2.6);
    return g;
  }
  function coinStack(parent, n) {
    const g = grp(parent), coins = [];
    for (let i = 0; i < n; i++) { const c = add(g, new THREE.CylinderGeometry(0.36, 0.36, 0.11, 40), GOLD); c.position.y = 0.06 + i * 0.115; c.rotation.y = i * 0.7; coins.push(c); }
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
  function drawScreen(scr, views, rec) {
    const c = scr.ctx, w = 400, h = 820;
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a2f45'); gr.addColorStop(1, '#141824'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = '#c99a62'; c.fillRect(70, 330, 260, 200); c.fillStyle = '#e9c891'; c.fillRect(170, 330, 60, 200);
    c.fillStyle = '#4a2f17'; c.fillRect(80, 320, 240, 24);
    const gl = c.createRadialGradient(200, 300, 0, 200, 300, 160); gl.addColorStop(0, 'rgba(255,230,120,0.9)'); gl.addColorStop(1, 'rgba(255,230,120,0)'); c.fillStyle = gl; c.fillRect(0, 120, w, 360);
    c.fillStyle = '#111'; c.beginPath(); c.roundRect(150, 170, 100, 170, 16); c.fill(); c.fillStyle = '#6fc3ff'; c.fillRect(160, 182, 80, 146);
    if (rec) { c.fillStyle = '#ff3b30'; c.beginPath(); c.arc(50, 60, 14, 0, TAU); c.fill(); txt(c, 'REC', 110, 62, 34, '#ffffff'); }
    c.fillStyle = 'rgba(0,0,0,0.45)'; c.beginPath(); c.roundRect(30, 640, 340, 120, 24); c.fill();
    txt(c, Math.round(views).toLocaleString('fr-FR').replace(/ | /g, ' '), 200, 680, 52, '#ffffff', '#111', 8);
    txt(c, 'VUES', 200, 734, 34, '#ffd23f');
    scr.tex.needsUpdate = true;
  }
  function tag(parent, s) {
    const g = grp(parent);
    add(g, extrude(roundRect(0.9, 0.5, 0.1), 0.05, 0.02), glossy('#ffffff', { r: 0.3 }));
    add(g, new THREE.PlaneGeometry(0.86, 0.46), new THREE.MeshBasicMaterial({ map: sign(344, 184, s, '#ffffff', '#ff3b30', 110), transparent: true, toneMapped: false })).position.z = 0.051;
    return g;
  }
  const caseMat = ['#ff6fb5', '#6fc3ff', '#8be07a', '#c69cff'].map((c) => glossy(c, { r: 0.3 }));
  function phoneCase(parent, i) {
    const g = grp(parent);
    add(g, new RoundedBoxGeometry(0.62, 1.2, 0.1, 3, 0.08), caseMat[i % 4]);
    add(g, new RoundedBoxGeometry(0.22, 0.3, 0.06, 2, 0.04), glossy('#222', { r: 0.4 })).position.set(-0.14, 0.38, 0.06);
    return g;
  }
  function cable(parent) {
    const pts = []; for (let i = 0; i <= 80; i++) { const a = i / 80 * TAU * 3; pts.push(new THREE.Vector3(Math.cos(a) * 0.35, i / 80 * 0.3, Math.sin(a) * 0.35)); }
    const g = grp(parent); add(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 200, 0.035, 8, false), glossy('#ffffff', { r: 0.4 }));
    add(g, new RoundedBoxGeometry(0.14, 0.24, 0.1, 2, 0.03), glossy('#f2f2f2', { r: 0.3 })).position.set(0.35, 0.36, 0);
    return g;
  }
  function backdrop(parent, c1, c2) {
    const m = add(parent, new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ map: raysTex(c1, c2), toneMapped: false, depthWrite: false }));
    m.position.set(0, 2, -8); m.renderOrder = -2; return m;
  }

  // ================================================================ les plans (index = numéro de scène - 1)
  const S = [];
  const scn = (cam, build, up) => { const g = grp(scene); g.visible = false; const st = build(g) || {}; S.push({ g, cam, up: (t, a, b) => up(t, a, b, st) }); };

  // 1 · « Ton colis perdu ? » : un carton tombe sur la pile, une étiquette « 20 € » vient s'y accrocher
  scn((t, a) => ({ p: [2.2 + 0.8 * Math.sin((t - a) * 0.3), 4.2, 13], q: [0, 1.25, 0] }), (g) => {
    const r = rnd(5);
    [[-1.0, 0, -0.3, 0.9, 0.7, 0.8], [0.9, 0, -0.5, 0.8, 0.6, 0.7], [-0.2, 0, -1.2, 1.0, 0.8, 0.8], [1.3, 0, 0.6, 0.6, 0.45, 0.6], [-1.4, 0, 0.8, 0.6, 0.5, 0.5], [0.3, 0.8, -1.2, 0.7, 0.5, 0.6]].forEach((q, i) => {
      const b = box(g, q[3], q[4], q[5], { dark: i % 2 === 1, q: i === 2 }); b.position.set(q[0], q[1], q[2]); b.rotation.y = (r() - 0.5) * 0.6;
    });
    shadow(g, 0, -0.2, 4.4, 3);
    const hero = box(g, 1.0, 0.75, 0.85, { q: true }); const tg = tag(hero, '20 €'); tg.position.set(0.55, 0.9, 0.3);
    const qs = [0, 1, 2].map((i) => { const s = sprite(qTex, 0.6); g.add(s); return s; });
    return { hero, tg, qs };
  }, (t, a, b, s) => {
    const k = u(t, a, a + 0.55), y = k < 1 ? lerp(4.2, 0, E.i2(k)) : 0.12 * Math.abs(Math.sin((t - a - 0.55) * 9)) * Math.exp(-(t - a - 0.55) * 5);
    s.hero.position.set(0.1, y, 0.9); s.hero.rotation.set(0, -0.35 + 0.1 * Math.sin(t), (1 - E.o3(u(t, a, a + 0.6))) * 0.4);
    const tk = E.back(u(t, K('20 euros', a) - 0.1, K('20 euros', a) + 0.35)); show(s.tg, tk); s.tg.rotation.z = 0.25 * Math.sin((t - a) * 4) * Math.exp(-(t - K('20 euros', a)) * 2.5);
    s.qs.forEach((q, i) => { const k2 = E.back(u(t, a + 0.7 + i * 0.25, a + 1.0 + i * 0.25)); q.visible = k2 > 0.01; q.scale.setScalar(0.65 * k2); q.position.set(-1.2 + i * 1.2, 2.2 + 0.25 * Math.sin(t * 2 + i), 0.5); });
  });

  // 2 · titre : l'étagère du magasin, pleine de cartons
  scn((t, a) => ({ p: [lerp(-1.6, 1.6, u(t, a, a + 3)), 2.2, 15.5], q: [0, 2.3, 0] }), (g) => {
    rack(g, 9);
  }, () => {});

  // 3 · l'entrepôt (3 000 €/mois) puis la palette de 200 colis (1 500 €)
  scn((t, a, b) => { const k = E.io2(u(t, K('Tu achètes', a) - 0.2, K('Tu achètes', a) + 0.8)); return { p: [lerp(6, 2.6, k), lerp(5, 2.8, k), lerp(25, 11.5, k)], q: [lerp(0, 0.8, k), lerp(2.6, 1.2, k), lerp(0, 3, k)] }; }, (g) => {
    warehouse(g);
    const p = pallet(g, 11); p.position.set(0.8, 0, 3.0);
    return { p };
  }, (t, a, b, s) => {
    const k = E.o3(u(t, K('palette', a) - 0.2, K('palette', a) + 0.5)); s.p.visible = k > 0.001; s.p.position.x = lerp(6, 0.8, k); s.p.rotation.y = lerp(-0.6, -0.25, k);
  });

  // 4 · « Personne ne sait ce qu'il y a dedans » : le carton tremble, des « ? » partout
  scn((t, a) => ({ p: [-0.4 + 0.8 * Math.sin((t - a) * 0.4), 1.9, 7.6], q: [0, 0.95, 0] }), (g) => {
    const hero = box(g, 1.2, 0.9, 1.0, { q: true }); shadow(g, 0.5, 0, 1.9, 1.5);
    const qs = []; const r = rnd(17);
    for (let i = 0; i < 7; i++) { const s = sprite(qTex, 0.5); s.userData = { x: (r() - 0.5) * 2.4, y: 1.0 + r() * 0.9, z: (r() - 0.5) * 1, d: r() }; g.add(s); qs.push(s); }
    return { hero, qs };
  }, (t, a, b, s) => {
    s.hero.rotation.set(0.05 * Math.sin(t * 31), -0.4 + 0.06 * Math.sin(t * 23), 0.05 * Math.sin(t * 27)); s.hero.position.set(0.25, 0.03 * Math.abs(Math.sin(t * 17)), 0);
    s.qs.forEach((q, i) => { const k = E.back(u(t, a + 0.15 + i * 0.18, a + 0.45 + i * 0.18)); q.visible = k > 0.01; const d = q.userData; q.scale.setScalar(0.55 * k); q.scale.setScalar(0.42 * k); q.position.set(d.x * 0.7 + 0.3, d.y + 0.12 * Math.sin(t * 2 + d.d * 6), d.z); });
  });

  // 5 · revendus fermés, 20 € le colis : une rangée de cartons, une étiquette chacun
  scn((t, a) => ({ p: [0.6 * Math.sin((t - a) * 0.4), 3.6, 19], q: [0, 1.9, 0] }), (g) => {
    const tb = add(g, new RoundedBoxGeometry(5.2, 0.16, 1.4, 2, 0.04), WOOD); tb.position.y = 0.92;
    for (const x of [-2.3, 2.3]) for (const z of [-0.55, 0.55]) add(g, new THREE.BoxGeometry(0.12, 0.92, 0.12), WOOD).position.set(x, 0.46, z);
    shadow(g, 0, 0, 6, 2.2);
    const bs = [], tgs = [];
    for (let i = 0; i < 5; i++) { const b = box(g, 0.75, 0.55 + (i % 2) * 0.12, 0.65, { dark: i % 2 === 1, q: i === 2 }); b.position.set(-2.0 + i, 1.0, 0); b.rotation.y = (i - 2) * 0.08; bs.push(b); const tg = tag(b, '20 €'); tg.position.set(0, 1.05, 0.2); tg.scale.setScalar(0.7); tgs.push(tg); }
    return { bs, tgs };
  }, (t, a, b, s) => {
    const t20 = K('20 euros le', a);
    s.bs.forEach((bx, i) => { const k = E.back(u(t, a + 0.1 + i * 0.12, a + 0.45 + i * 0.12)); show(bx, k); });
    s.tgs.forEach((tg, i) => { const k = E.back(u(t, t20 + i * 0.1, t20 + 0.3 + i * 0.1)); tg.visible = k > 0.01; tg.scale.setScalar(0.7 * Math.max(k, 0.0001)); tg.rotation.z = 0.18 * Math.sin(t * 3 + i); });
  });

  // 6 · 8 palettes par mois
  scn((t, a) => ({ p: [lerp(-1.5, 1.5, u(t, a, a + 2.5)), 10, 13], q: [0, 1.4, -2.6] }), (g) => {
    const ps = []; for (let i = 0; i < 8; i++) { const p = pallet(g, 20 + i); p.position.set(-1.15 + (i % 2) * 2.3, 0, -5.4 + Math.floor(i / 2) * 2.0); p.rotation.y = (i % 3 - 1) * 0.12; ps.push(p); }
    return { ps };
  }, (t, a, b, s) => { s.ps.forEach((p, i) => { const k = E.back(u(t, a + 0.1 + i * 0.1, a + 0.4 + i * 0.1)); show(p, k); }); });

  // 7 · « Je m'achète un camion » : le camion arrive sur fond rayonnant
  scn((t, a) => ({ p: [0.85, 1.8, 23.5], q: [0.3, 0.75, 0] }), (g) => {
    const bd = backdrop(g, '#ffe27a', '#fff6cf');
    const tr = truck(g); return { bd, tr };
  }, (t, a, b, s) => {
    s.bd.rotation.z = (t - a) * 0.12;
    const tc = K('camion', a), k = E.o3(u(t, tc - 0.7, tc + 0.1)); s.tr.position.set(lerp(-9, 0.6, k), 0, 0); s.tr.rotation.y = -0.35;
    s.tr.children[0].position.y = 1.45 + 0.04 * Math.sin(t * 20) * (1 - k);
  });

  // 8 · « Attends » : la tour de pièces (1 pièce = 1 000 €) fond poste par poste jusqu'à ≈ 6 000 €
  scn((t, a) => ({ p: [0, 3.2, 15.5], q: [0, 1.2, 0] }), (g) => {
    const stacks = [0, 1, 2, 3].map((i) => { const s = coinStack(g, 8); s.position.set(-1.5 + i * 1.0, 0, (i % 2) * 0.3); return s; });
    return { coins: stacks.flatMap((s) => s.userData.coins).sort((p, q) => q.position.y - p.position.y) };
  }, (t, a, b, s) => {
    const cuts = [[K('TVA', a), 5], [K('les palettes,', a), 12], [K('le loyer', a), 3], [K('salariés', a), 5], [K('environ 6', a), 1]];
    const out = []; let n = 0; cuts.forEach(([tc, m]) => { for (let i = 0; i < m; i++) out.push(tc + i * 0.03); n += m; });
    s.coins.forEach((c, i) => {
      const base = c.userData.y0 ?? (c.userData.y0 = c.position.y);
      if (i < out.length && t > out[i]) { const k = u(t, out[i], out[i] + 0.55); c.position.y = base + 4 * E.i2(k); c.position.x = (i % 2 ? 1 : -1) * 2.5 * k; c.visible = k < 1; }
      else { c.position.y = base; c.position.x = 0; c.visible = true; }
    });
  });

  // 9 · l'astuce de pro : coque, câble… et parfois un téléphone qui brille
  scn((t, a) => ({ p: [0, 3.0, 14.5], q: [0, 1.5, 0] }), (g) => {
    const bs = [-1.35, 0, 1.35].map((x, i) => { const b = box(g, 0.95, 0.75, 0.85, { flaps: true, q: i === 2 }); b.position.set(x, 0, 0); b.rotation.y = -x * 0.08; shadow(g, x, 0, 1.6, 1.3); return b; });
    const cs = phoneCase(g, 0); const cb = cable(g); const ph = phone(g); ph.scale.setScalar(0.42);
    const gl = sprite(glowTex, 3.2); g.add(gl);
    return { bs, cs, cb, ph, gl };
  }, (t, a, b, s) => {
    const opens = [K('colis,', a), K('câbles.', a), K('téléphone.', a)];
    s.bs.forEach((bx, i) => bx.userData.open(E.back(u(t, opens[i] - 0.15, opens[i] + 0.2))));
    const up = (i) => E.back(u(t, opens[i], opens[i] + 0.5));
    s.cs.position.set(-1.35, 0.2 + 1.3 * up(0), 0); s.cs.rotation.set(0.2, (t - a) * 1.5, 0.2); s.cs.visible = t > opens[0];
    s.cb.position.set(0, 0.2 + 1.1 * up(1), 0); s.cb.rotation.y = (t - a) * 1.2; s.cb.visible = t > opens[1];
    s.ph.position.set(1.35, 0.2 + 1.7 * up(2), 0.1); s.ph.rotation.set(0, (t - opens[2]) * 2.2, 0); s.ph.visible = t > opens[2];
    s.gl.visible = t > opens[2]; s.gl.position.set(1.35, 1.9, -0.2); s.gl.scale.setScalar(3.4 * up(2) * (1 + 0.08 * Math.sin(t * 6)));
    if (s.ph.visible) drawScreen(s.ph.userData.scr, 0, false);
  });

  // 10 · le client filme : 2 millions de vues, des cœurs s'envolent
  scn((t, a) => ({ p: [0.5 * Math.sin((t - a) * 0.5), 1.6, 15], q: [0, 1.5, 0] }), (g) => {
    const ph = phone(g); ph.position.set(0, 1.0, 0); ph.rotation.set(0, -0.15, 0);
    const hm = glossy('#ff3b5c', { r: 0.25 }), hs = [];
    for (let i = 0; i < 9; i++) { const h = add(g, extrude(heart(0.22), 0.1, 0.04), hm); hs.push(h); }
    return { ph, hs };
  }, (t, a, b, s) => {
    const tv = K('2 millions', a), views = 2e6 * E.o3(u(t, tv - 0.6, tv + 0.6));
    drawScreen(s.ph.userData.scr, views, Math.floor(t * 2) % 2 === 0);
    s.ph.rotation.y = -0.15 + 0.12 * Math.sin((t - a) * 0.9);
    s.hs.forEach((h, i) => { const t0 = tv - 0.4 + i * 0.22, k = u(t, t0, t0 + 1.6); h.visible = k > 0 && k < 1; h.position.set(1.0 + Math.sin(i * 2.3) * 0.5 + 0.4 * k, 0.6 + 3.2 * k, 0.4); h.rotation.set(0, 0, 0.3 * Math.sin(t * 3 + i)); h.scale.setScalar(0.6 + 0.6 * Math.sin(Math.PI * k)); });
  });

  // 11 · 16 palettes par mois, sans payer une seule pub
  scn((t, a) => ({ p: [lerp(-2, 2, u(t, a, a + 5)), 15, 21], q: [0, -0.4, -1.2] }), (g) => {
    const ps = []; for (let i = 0; i < 16; i++) { const p = pallet(g, 40 + i); p.position.set(-3.3 + (i % 4) * 2.2, 0, -3.3 + Math.floor(i / 4) * 2.2); p.rotation.y = (i % 3 - 1) * 0.1; ps.push(p); }
    return { ps };
  }, (t, a, b, s) => { s.ps.forEach((p, i) => { const k = E.back(u(t, a + 0.1 + i * 0.06, a + 0.4 + i * 0.06)); show(p, k); }); });

  // 12 · « C'est un ticket de loto » : le carton tourne et montre son ticket
  scn((t, a) => ({ p: [0, 2.0, 8.4], q: [0, 1.05, 0] }), (g) => {
    const hero = box(g, 1.3, 1.0, 1.1, { q: true }); shadow(g, 0, 0, 2.1, 1.7);
    const tk = add(hero, new THREE.PlaneGeometry(1.1, 0.8), new THREE.MeshStandardMaterial({ roughness: 0.5, map: tex(440, 320, (c) => {
      c.fillStyle = '#fff4c2'; c.beginPath(); c.roundRect(6, 6, 428, 308, 20); c.fill(); c.lineWidth = 8; c.strokeStyle = '#111'; c.stroke();
      c.setLineDash([12, 10]); c.strokeStyle = '#ff3b30'; c.lineWidth = 6; c.strokeRect(22, 22, 396, 276); c.setLineDash([]);
      txt(c, 'TICKET', 220, 80, 70, '#ff3b30', '#111', 8);
      for (let r = 0; r < 3; r++) for (let q = 0; q < 6; q++) { c.fillStyle = (r * 6 + q) % 5 === 2 ? '#ffd23f' : '#ffffff'; c.beginPath(); c.arc(70 + q * 60, 160 + r * 52, 20, 0, TAU); c.fill(); c.lineWidth = 4; c.strokeStyle = '#111'; c.stroke(); }
    }) }));
    tk.position.set(0.651, 0.5, 0); tk.rotation.y = Math.PI / 2;
    const st = []; for (let i = 0; i < 6; i++) { const s = sprite(glowTex, 0.6); g.add(s); st.push(s); }
    return { hero, st };
  }, (t, a, b, s) => {
    const k = E.io3(u(t, a + 0.2, K("C'est un ticket", a))); s.hero.rotation.y = lerp(0.3, -1.45, k); s.hero.position.y = 0.05 * Math.sin(t * 3);
    s.st.forEach((sp, i) => { const ang = i / 6 * TAU + (t - a) * 1.4; sp.position.set(Math.cos(ang) * 1.3, 0.9 + Math.sin(ang * 2) * 0.4, Math.sin(ang) * 0.9); sp.visible = t > K("C'est un ticket", a) - 0.2; sp.scale.setScalar(0.5 + 0.2 * Math.sin(t * 5 + i)); });
  });
  // 13 · conclusion : tout en 2D
  scn(() => ({ p: [0, 2, 10], q: [0, 1, 0] }), () => {}, () => {});

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
