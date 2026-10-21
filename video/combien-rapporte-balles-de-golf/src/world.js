// Monde 3D de « Combien ça rapporte de repêcher les balles de golf ? » : lac de golf, plongeur (masque, tuba, bouteille),
// filet plein de balles, tapis de milliers de balles au fond de l'eau, contrat, voiturette en or, green sur une île, golfeur
// maladroit. Tout est une fonction pure du temps t (window.MCDO.starts).
import { THREE, RoundedBoxGeometry, makeRenderer, glossy, gold, canvasTex, E, u, lerp, extrude, roundRect } from './kit3d.js';

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
  const radial = (stops) => tex(256, 256, (c) => { const g = c.createRadialGradient(128, 128, 0, 128, 128, 128); stops.forEach(([o, col]) => g.addColorStop(o, col)); c.fillStyle = g; c.fillRect(0, 0, 256, 256); });
  const glowTex = radial([[0, 'rgba(255,240,160,1)'], [0.4, 'rgba(255,190,70,0.55)'], [1, 'rgba(255,170,60,0)']]);
  const blobTex = radial([[0, 'rgba(20,20,30,0.5)'], [0.5, 'rgba(20,20,30,0.22)'], [1, 'rgba(20,20,30,0)']]);
  const raysTex = (c1, c2) => tex(512, 512, (c) => { c.fillStyle = c1; c.fillRect(0, 0, 512, 512); c.fillStyle = c2; for (let i = 0; i < 18; i++) { c.beginPath(); c.moveTo(256, 256); c.arc(256, 256, 400, i * TAU / 18, (i + 0.5) * TAU / 18); c.closePath(); c.fill(); } });
  const shadow = (parent, x, z, sx, sz) => {
    const m = add(parent, new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, toneMapped: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.003, z); m.scale.set(sx, sz, 1); m.renderOrder = -1; return m;
  };
  const sprite = (map, s, o = 1) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, toneMapped: false, opacity: o })); sp.scale.set(s, s, 1); return sp; };
  const plane = (parent, w, h, map) => add(parent, new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, transparent: true, toneMapped: false }));
  function backdrop(parent, c1, c2) {
    const m = add(parent, new THREE.PlaneGeometry(60, 60), new THREE.MeshBasicMaterial({ map: raysTex(c1, c2), toneMapped: false, depthWrite: false }));
    m.position.set(0, 2, -10); m.renderOrder = -2; return m;
  }
  function tag(parent, s, fg, w = 0.9) {
    const g = grp(parent);
    add(g, extrude(roundRect(w, 0.5, 0.1), 0.05, 0.02), glossy('#ffffff', { r: 0.3 }));
    plane(g, w - 0.04, 0.46, sign(Math.round(w * 382), 184, s, '#ffffff', fg || '#ff3b30', 104)).position.z = 0.051;
    return g;
  }
  // personnages : capsule + tête ; o.vest gilet fluo, o.cap casquette, o.arms bras tendus, o.mamie, o.boss
  const SKIN = ['#f3c39b', '#c98b5e', '#e2ad84', '#8d5a3b'], HAIR = ['#3b2414', '#111111', '#d9a04a', '#6b3a1e'], SHIRT = ['#ff4fa8', '#2f8cff', '#ffb03a', '#2fbf4a', '#ffffff', '#8e5bd8'];
  const VEST = glossy('#d7ff3a', { r: 0.4, cc: 0.5 }), STRIPE = glossy('#c9ccd2', { m: 0.6, r: 0.3 });
  function person(parent, i, o = {}) {
    const g = grp(parent), body = grp(g);
    add(body, new THREE.CapsuleGeometry(0.21, 0.34, 6, 18), glossy(o.boss ? '#2b2d42' : o.mamie ? '#a05ab8' : SHIRT[i % 6], { r: 0.45, cc: 0.4 })).position.y = 0.43;
    add(body, new THREE.SphereGeometry(0.2, 24, 18), glossy(SKIN[i % 4], { r: 0.55, cc: 0.2 })).position.y = 0.95;
    if (!o.boss) add(body, new THREE.SphereGeometry(0.212, 24, 12, 0, TAU, 0, Math.PI * 0.42), glossy(o.mamie ? '#e9e9ef' : HAIR[i % 4], { r: 0.6, cc: 0.2 })).position.y = 0.97;
    if (o.mamie) add(body, new THREE.SphereGeometry(0.09, 14, 10), glossy('#e9e9ef', { r: 0.6 })).position.set(0, 1.12, -0.12);
    for (const s of [-1, 1]) add(body, new THREE.SphereGeometry(0.028, 10, 8), new THREE.MeshBasicMaterial({ color: '#111111' })).position.set(s * 0.07, 0.97, 0.18);
    if (o.mamie || o.boss) for (const s of [-1, 1]) { const gl = add(body, new THREE.TorusGeometry(0.05, 0.01, 6, 16), new THREE.MeshBasicMaterial({ color: '#111111' })); gl.position.set(s * 0.07, 0.97, 0.19); }
    if (o.boss) { const tie = add(body, new THREE.ConeGeometry(0.05, 0.3, 4), glossy('#e0322b')); tie.rotation.x = Math.PI; tie.position.set(0, 0.6, 0.2); }
    if (o.vest) { add(body, new THREE.CapsuleGeometry(0.222, 0.22, 6, 18), VEST).position.y = 0.48; for (const y of [0.42, 0.56]) { const st = add(body, new THREE.TorusGeometry(0.225, 0.018, 6, 28), STRIPE); st.rotation.x = Math.PI / 2; st.position.y = y; } }
    if (o.cap) { add(body, new THREE.CylinderGeometry(0.205, 0.215, 0.12, 20), glossy(o.cap, { r: 0.4 })).position.y = 1.1; const br = add(body, new THREE.BoxGeometry(0.2, 0.025, 0.2), glossy(o.cap, { r: 0.4 })); br.position.set(0, 1.06, 0.2); }
    const arms = [-1, 1].map((s) => { const a = grp(body); a.position.set(s * 0.22, 0.62, 0); add(a, new THREE.CapsuleGeometry(0.055, 0.28, 4, 10), o.vest ? VEST : glossy(o.boss ? '#2b2d42' : o.mamie ? '#a05ab8' : SHIRT[i % 6], { r: 0.45 })).position.y = -0.18; a.rotation.x = o.arms ? -1.3 : 0; return a; });
    shadow(g, 0, 0, 0.7, 0.55);
    g.userData = { body, arms }; return g;
  }
  const bob = (p, t, k, amp = 1) => { p.userData.body.position.y = 0.05 * amp * Math.abs(Math.sin(t * 10 + k)); p.userData.body.rotation.z = 0.06 * amp * Math.sin(t * 5 + k); };
  function coin(parent) { return add(parent, new THREE.CylinderGeometry(0.36, 0.36, 0.11, 40), GOLD); }
  function coinStack(parent, n) {
    const g = grp(parent), coins = [];
    for (let i = 0; i < n; i++) { const c = coin(g); c.position.y = 0.06 + i * 0.115; c.rotation.y = i * 0.7; coins.push(c); }
    shadow(g, 0, 0, 1.2, 1.0);
    g.userData.coins = coins; return g;
  }

  // ---------------------------------------------------------------- golf : gazon, lac, balles, drapeau, arbres
  const TX_GRASS = tex(512, 512, (c) => {
    for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#5cb948' : '#6cc955'; c.fillRect(0, i * 64, 512, 64); }
    const r = rnd(5); for (let i = 0; i < 2600; i++) { c.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,60,0,0.08)'; c.fillRect(r() * 512, r() * 512, 2, 3); }
  });
  TX_GRASS.wrapS = TX_GRASS.wrapT = THREE.RepeatWrapping; TX_GRASS.repeat.set(7, 7);
  const grass = (parent, w = 44, d = 44) => { const m = add(parent, new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: TX_GRASS, roughness: 0.95 })); m.rotation.x = -Math.PI / 2; m.position.z = -6; return m; };
  const TX_WATER = tex(512, 512, (c) => {
    const gr = c.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#3db6dd'); gr.addColorStop(1, '#2188bd'); c.fillStyle = gr; c.fillRect(0, 0, 512, 512);
    const r = rnd(8); c.strokeStyle = 'rgba(255,255,255,0.28)'; c.lineWidth = 4;
    for (let i = 0; i < 80; i++) { const x = r() * 512, y = r() * 512, w = 20 + r() * 60; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + w / 2, y - 7, x + w, y); c.stroke(); }
  });
  TX_WATER.wrapS = TX_WATER.wrapT = THREE.RepeatWrapping;
  function lake(parent, rx, rz, x = 0, z = 0) {
    const g = grp(parent); g.position.set(x, 0, z);
    const bank = add(g, new THREE.CircleGeometry(1, 64), new THREE.MeshStandardMaterial({ color: '#4f9a3c', roughness: 0.9 })); bank.rotation.x = -Math.PI / 2; bank.scale.set(rx + 0.18, rz + 0.18, 1); bank.position.y = 0.004;
    const tx = TX_WATER.clone(); tx.repeat.set(rx / 2.2, rz / 2.2); tx.needsUpdate = true;
    const w = add(g, new THREE.CircleGeometry(1, 64), new THREE.MeshPhysicalMaterial({ map: tx, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05 })); w.rotation.x = -Math.PI / 2; w.scale.set(rx, rz, 1); w.position.y = 0.008;
    g.userData = { tx, rx, rz }; return g;
  }
  const ripple = (lk, t) => lk.userData.tx.offset.set(t * 0.02, t * 0.035);
  const inLake = (lk, x, z) => ((x - lk.position.x) / lk.userData.rx) ** 2 + ((z - lk.position.z) / lk.userData.rz) ** 2 < 1;
  // balle de golf (alvéoles en relief) ; version allégée pour les tapis de milliers de balles
  const TX_DIMPLE = tex(256, 128, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 256, 128); c.fillStyle = '#9a9a9a'; for (let y = 6; y < 128; y += 12) for (let x = (y / 12 % 2) * 6; x < 256; x += 12) { c.beginPath(); c.arc(x, y, 3.6, 0, TAU); c.fill(); } });
  const BALL = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.35, bumpMap: TX_DIMPLE, bumpScale: 0.8 });
  const BGEO = new THREE.SphereGeometry(0.085, 18, 12), BGEO_L = new THREE.SphereGeometry(0.085, 9, 6);
  const ball = (parent) => add(parent, BGEO, BALL);
  const M4 = new THREE.Matrix4(), V3 = new THREE.Vector3(), Q4 = new THREE.Quaternion(), S3 = new THREE.Vector3();
  const setI = (im, i, x, y, z, s = 1) => { V3.set(x, y, z); S3.setScalar(s); M4.compose(V3, Q4, S3); im.setMatrixAt(i, M4); };
  const field = (parent, n, light) => { const im = new THREE.InstancedMesh(light ? BGEO_L : BGEO, BALL, n); im.frustumCulled = false; parent.add(im); return im; };
  // hauteur d'une balle lâchée de h0 (rebonds amortis), s = temps depuis le lâcher
  function bounceY(s, h0, e = 0.42) {
    if (s <= 0) return h0;
    const t1 = Math.sqrt(2 * h0 / 9.8); if (s < t1) return h0 - 4.9 * s * s;
    s -= t1; let v = 9.8 * t1 * e;
    for (let k = 0; k < 4; k++) { const d = 2 * v / 9.8; if (s < d) return v * s - 4.9 * s * s; s -= d; v *= e; }
    return 0;
  }
  // gerbe d'eau : anneau, couronne, gouttes ; userData.up(k) avec k = temps depuis l'impact
  const DROP = new THREE.MeshBasicMaterial({ color: '#e6f7ff', toneMapped: false });
  function splash(parent, n = 18, seed = 1) {
    const g = grp(parent);
    const ring = add(g, new THREE.RingGeometry(0.75, 1, 40), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, depthWrite: false, toneMapped: false })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02;
    const crown = add(g, new THREE.CylinderGeometry(0.5, 0.28, 1, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#eaf8ff', transparent: true, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
    const r = rnd(17 + seed * 13), drops = [];
    for (let i = 0; i < n; i++) { const d = add(g, new THREE.SphereGeometry(0.05, 8, 6), DROP); const a = r() * TAU, sp = 0.5 + r() * 1.1; drops.push({ d, vx: Math.cos(a) * sp, vz: Math.sin(a) * sp, vy: 2.4 + r() * 2.6 }); }
    g.userData.up = (k) => {
      const on = k >= 0 && k < 1.4; g.visible = on; if (!on) return;
      ring.scale.setScalar(0.25 + k * 1.5); ring.material.opacity = 0.85 * Math.max(0, 1 - k / 1.2);
      const h = Math.max(0.01, Math.sin(Math.min(1, k / 0.55) * Math.PI) * 0.9); crown.scale.set(0.5 + Math.min(1, k / 0.25) * 0.7, h, 0.5 + Math.min(1, k / 0.25) * 0.7); crown.position.y = h / 2; crown.material.opacity = 0.75 * Math.max(0, 1 - k / 0.55);
      drops.forEach((o) => { const y = o.vy * k - 4.9 * k * k; o.d.visible = y > 0; o.d.position.set(o.vx * k, y, o.vz * k); });
    };
    return g;
  }
  function flag(parent, col = '#e0322b') {
    const g = grp(parent);
    add(g, new THREE.CylinderGeometry(0.025, 0.025, 1.8, 8), glossy('#ffffff')).position.y = 0.9;
    const fl = grp(g); fl.position.set(0, 1.6, 0);
    const f = add(fl, new THREE.PlaneGeometry(0.56, 0.36), new THREE.MeshStandardMaterial({ color: col, side: THREE.DoubleSide, roughness: 0.6 })); f.position.x = 0.29;
    const hole = add(g, new THREE.CircleGeometry(0.1, 20), new THREE.MeshBasicMaterial({ color: '#1a1a1a' })); hole.rotation.x = -Math.PI / 2; hole.position.y = 0.013;
    g.userData.fl = fl; return g;
  }
  const wave = (fg, t) => { fg.userData.fl.rotation.y = 0.3 * Math.sin(t * 3.2); };
  const disc = (parent, r, col, y, x = 0, z = 0, sx = 1) => { const m = add(parent, new THREE.CircleGeometry(r, 48), new THREE.MeshStandardMaterial({ color: col, roughness: 0.9 })); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.scale.x = sx; return m; };
  function tree(parent, x, z, s = 1, k = 0) {
    const g = grp(parent); g.position.set(x, 0, z); g.scale.setScalar(s);
    add(g, new THREE.CylinderGeometry(0.08, 0.11, 0.7, 8), glossy('#7a4a26', { r: 0.8, cc: 0 })).position.y = 0.35;
    const c = add(g, new THREE.SphereGeometry(0.55, 16, 12), glossy(k % 2 ? '#3e9e3a' : '#2c8a3c', { r: 0.7, cc: 0.2 })); c.position.y = 1.05; c.scale.y = 1.15;
    return g;
  }
  const trees = (parent, list) => list.forEach(([x, z, s], k) => tree(parent, x, z, s, k));
  // plongeur : combinaison, cagoule, masque, tuba, bouteille, palmes (bras longs pour brandir le filet)
  const SUIT = glossy('#1f2430', { r: 0.35, cc: 0.6 }), YELM = glossy('#ffd23f', { r: 0.3 }), ORGM = glossy('#ff8a1f', { r: 0.3 });
  const GLASS = new THREE.MeshPhysicalMaterial({ color: '#a8e2ff', roughness: 0.05, transparent: true, opacity: 0.45, clearcoat: 1 });
  function diver(parent) {
    const g = grp(parent), body = grp(g);
    add(body, new THREE.CapsuleGeometry(0.21, 0.34, 6, 18), SUIT).position.y = 0.43;
    const st = add(body, new THREE.TorusGeometry(0.214, 0.02, 6, 28), glossy('#2f8cff')); st.rotation.x = Math.PI / 2; st.position.y = 0.52;
    add(body, new THREE.SphereGeometry(0.2, 24, 18), glossy('#f3c39b', { r: 0.55, cc: 0.2 })).position.y = 0.95;
    add(body, new THREE.SphereGeometry(0.214, 24, 12, 0, TAU, 0, Math.PI * 0.46), SUIT).position.y = 0.97;
    add(body, new RoundedBoxGeometry(0.32, 0.17, 0.08, 3, 0.04), YELM).position.set(0, 0.99, 0.16);
    add(body, new RoundedBoxGeometry(0.26, 0.12, 0.02, 2, 0.03), GLASS).position.set(0, 0.99, 0.205);
    for (const s of [-1, 1]) add(body, new THREE.SphereGeometry(0.027, 10, 8), new THREE.MeshBasicMaterial({ color: '#111111' })).position.set(s * 0.06, 0.99, 0.19);
    add(body, new THREE.CylinderGeometry(0.022, 0.022, 0.42, 10), ORGM).position.set(0.21, 1.1, 0.03);
    add(body, new THREE.CapsuleGeometry(0.1, 0.36, 6, 14), YELM).position.set(0, 0.6, -0.27);
    add(body, new THREE.CylinderGeometry(0.03, 0.03, 0.08, 10), glossy('#c3c8d0', { m: 0.8 })).position.set(0, 0.92, -0.27);
    const arms = [-1, 1].map((s) => { const a = grp(body); a.position.set(s * 0.22, 0.62, 0); add(a, new THREE.CapsuleGeometry(0.056, 0.36, 4, 10), SUIT).position.y = -0.23; return a; });
    for (const s of [-1, 1]) add(body, new RoundedBoxGeometry(0.15, 0.03, 0.34, 2, 0.012), YELM).position.set(s * 0.09, 0.02, 0.12);
    g.userData = { body, arms }; return g;
  }
  // filet de plongée rempli de balles (anneau en haut à y ≈ 0.98)
  const TX_NET = tex(256, 256, (c) => { c.clearRect(0, 0, 256, 256); c.strokeStyle = '#ffffff'; c.lineWidth = 7; for (let i = -256; i <= 512; i += 30) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 256, 256); c.stroke(); c.beginPath(); c.moveTo(i, 256); c.lineTo(i + 256, 0); c.stroke(); } });
  TX_NET.wrapS = TX_NET.wrapT = THREE.RepeatWrapping; TX_NET.repeat.set(3, 2);
  function netBag(parent, n = 120) {
    const g = grp(parent);
    const bag = add(g, new THREE.SphereGeometry(0.42, 24, 16), new THREE.MeshStandardMaterial({ map: TX_NET, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, color: '#ffb02e', roughness: 0.6 })); bag.scale.y = 1.12; bag.position.y = 0.48;
    const ring = add(g, new THREE.TorusGeometry(0.17, 0.025, 8, 24), glossy('#555555', { m: 0.6 })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.97;
    if (n) { const im = field(g, n); const r = rnd(31); for (let i = 0; i < n; i++) { let x, y, z; do { x = r() * 2 - 1; y = r() * 2 - 1; z = r() * 2 - 1; } while (x * x + y * y + z * z > 1); setI(im, i, x * 0.33, 0.46 + y * 0.37, z * 0.33); } im.instanceMatrix.needsUpdate = true; }
    return g;
  }
  // golfeur : personnage + club tenu à deux mains ; userData.club pivote autour des mains
  function golfer(parent, i, cap) {
    const p = person(parent, i, { cap: cap || '#ffffff' });
    const club = grp(p.userData.body); club.position.set(0, 0.5, 0.24);
    add(club, new THREE.CylinderGeometry(0.014, 0.014, 0.5, 8), glossy('#c3c8d0', { m: 0.8 })).position.y = -0.25;
    add(club, new RoundedBoxGeometry(0.16, 0.06, 0.07, 2, 0.02), glossy('#2b2b2f')).position.set(0.05, -0.5, 0);
    p.userData.arms.forEach((a) => { a.rotation.x = -0.5; });
    p.userData.club = club; return p;
  }
  // swing : recul (ti - 0.55 → ti - 0.12), frappe à ti, accompagnement
  const swingAng = (t, ti) => t < ti - 0.55 ? 0 : t < ti - 0.12 ? 2.3 * E.io2(u(t, ti - 0.55, ti - 0.12)) : t < ti ? lerp(2.3, 0, E.i2(u(t, ti - 0.12, ti))) : -2.2 * E.o3(u(t, ti, ti + 0.25));
  // trajectoire en cloche d'une balle frappée
  const arc = (o, from, to, h, k) => o.position.set(lerp(from[0], to[0], k), lerp(from[1], to[1], k) + h * Math.sin(Math.PI * k), lerp(from[2], to[2], k));
  // voiturette de golf (o.gold : tout en or)
  function buggy(parent, M) {
    const g = grp(parent), TY = glossy('#1d1d1f', { r: 0.6 });
    add(g, new RoundedBoxGeometry(1.7, 0.3, 0.95, 3, 0.08), M).position.y = 0.45;
    add(g, new RoundedBoxGeometry(0.55, 0.3, 0.85, 3, 0.08), M).position.set(-0.25, 0.75, 0);
    add(g, new RoundedBoxGeometry(0.12, 0.45, 0.85, 3, 0.05), M).position.set(-0.52, 0.98, 0);
    for (const x of [-0.65, 0.6]) for (const z of [-0.42, 0.42]) add(g, new THREE.CylinderGeometry(0.025, 0.025, 1.15, 8), M).position.set(x, 1.17, z);
    add(g, new RoundedBoxGeometry(1.5, 0.07, 1.05, 2, 0.03), M).position.set(0, 1.76, 0);
    const sw = add(g, new THREE.TorusGeometry(0.13, 0.025, 8, 24), TY); sw.position.set(0.3, 1.0, 0.18); sw.rotation.set(0, Math.PI / 2, 0); sw.rotation.z = 0.5;
    for (const x of [-0.55, 0.55]) for (const z of [-0.47, 0.47]) { const w = add(g, new THREE.CylinderGeometry(0.21, 0.21, 0.14, 20), TY); w.rotation.x = Math.PI / 2; w.position.set(x, 0.21, z); }
    const bagG = grp(g); bagG.position.set(-0.85, 0.85, 0); add(bagG, new THREE.CylinderGeometry(0.16, 0.14, 0.75, 16), M);
    for (let i = 0; i < 4; i++) add(bagG, new THREE.CylinderGeometry(0.012, 0.012, 0.4, 6), glossy('#c3c8d0', { m: 0.8 })).position.set(-0.05 + i * 0.035, 0.5, (i % 2) * 0.05);
    shadow(g, 0, 0, 2.2, 1.4);
    return g;
  }
  // fond sous-marin : dégradé, sol vaseux, tapis de balles, rayons de lumière, algues, bulles
  const TX_DEEP = tex(16, 256, (c) => { const gr = c.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#7fe0ee'); gr.addColorStop(0.4, '#239bb3'); gr.addColorStop(1, '#0b4757'); c.fillStyle = gr; c.fillRect(0, 0, 16, 256); });
  const TX_RAY = tex(64, 256, (c) => { const gr = c.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 256); });
  const TX_MUD = tex(256, 256, (c) => { c.fillStyle = '#7a7650'; c.fillRect(0, 0, 256, 256); const r = rnd(12); for (let i = 0; i < 900; i++) { c.fillStyle = r() > 0.5 ? 'rgba(255,255,230,0.07)' : 'rgba(40,30,10,0.12)'; c.beginPath(); c.arc(r() * 256, r() * 256, 1 + r() * 4, 0, TAU); c.fill(); } });
  TX_MUD.wrapS = TX_MUD.wrapT = THREE.RepeatWrapping; TX_MUD.repeat.set(8, 8);
  function seabed(parent, n, w = 9, z0 = 3, z1 = -9) {
    const g = grp(parent);
    const bg = add(g, new THREE.PlaneGeometry(90, 50), new THREE.MeshBasicMaterial({ map: TX_DEEP, toneMapped: false, depthWrite: false, fog: false })); bg.position.set(0, 6, -18); bg.renderOrder = -2;
    const fl = add(g, new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ map: TX_MUD, roughness: 1 })); fl.rotation.x = -Math.PI / 2; fl.position.z = -8;
    const im = field(g, n, true), r = rnd(77), pos = [];
    for (let i = 0; i < n; i++) { const x = (r() - 0.5) * w, z = z0 + (z1 - z0) * Math.sqrt(r()), y = 0.08 + (r() < 0.25 ? 0.13 : 0) + 0.02 * r(); pos.push([x, y, z]); setI(im, i, x, y, z); }
    im.instanceMatrix.needsUpdate = true;
    const rays = []; for (let i = 0; i < 6; i++) { const m = add(g, new THREE.PlaneGeometry(0.9 + r(), 9), new THREE.MeshBasicMaterial({ map: TX_RAY, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false })); m.position.set(-4 + i * 1.6 + r(), 4.5, -3 - r() * 4); m.rotation.z = 0.35; rays.push(m); }
    const weeds = []; const WM = glossy('#2f9a4a', { r: 0.6, cc: 0.1, side: THREE.DoubleSide });
    for (let i = 0; i < 14; i++) { const wd = grp(g); wd.position.set((r() - 0.5) * 8, 0, 1.5 - r() * 9); for (let k = 0; k < 3; k++) { const b = add(wd, new THREE.PlaneGeometry(0.12, 0.9 + r() * 0.8), WM); b.position.set((k - 1) * 0.07, 0.5, 0); b.rotation.y = k; } weeds.push(wd); }
    const bub = new THREE.InstancedMesh(new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshBasicMaterial({ color: '#dff7ff', transparent: true, opacity: 0.8, toneMapped: false }), 60); bub.frustumCulled = false; g.add(bub);
    const bs = []; for (let i = 0; i < 60; i++) bs.push([(r() - 0.5) * 6, r() * 4, 1 - r() * 6, 0.6 + r() * 0.8]);
    g.userData = { im, pos, rays, weeds, bub, bs };
    g.userData.up = (t) => {
      rays.forEach((m, i) => { m.material.opacity = 0.55 + 0.35 * Math.sin(t * 1.3 + i * 1.7); });
      weeds.forEach((wd, i) => { wd.rotation.z = 0.12 * Math.sin(t * 1.4 + i); });
      bs.forEach((b, i) => { const y = (b[1] + t * b[3]) % 4.5; setI(bub, i, b[0] + 0.05 * Math.sin(t * 3 + i), y, b[2], 0.6 + 0.8 * (i % 3) / 2); }); bub.instanceMatrix.needsUpdate = true;
    };
    return g;
  }
  // petit poisson orange
  function fish(parent, col = '#ff8a1f') {
    const g = grp(parent), M = glossy(col, { r: 0.3 });
    const b = add(g, new THREE.SphereGeometry(0.16, 18, 12), M); b.scale.set(1.5, 1, 0.7);
    const tl = add(g, new THREE.ConeGeometry(0.12, 0.2, 4), M); tl.rotation.z = Math.PI / 2; tl.position.x = -0.3; tl.scale.z = 0.4;
    for (const s of [-1, 1]) add(g, new THREE.SphereGeometry(0.03, 10, 8), new THREE.MeshBasicMaterial({ color: '#111' })).position.set(0.14, 0.04, s * 0.09);
    return g;
  }
  // feuille de contrat
  const TX_CONTRACT = tex(360, 480, (c) => {
    c.fillStyle = '#fffdf6'; c.fillRect(0, 0, 360, 480); c.strokeStyle = '#111'; c.lineWidth = 8; c.strokeRect(4, 4, 352, 472);
    txt(c, 'CONTRAT', 180, 62, 56, '#2f8cff'); c.fillStyle = '#c9c9c9'; for (let y = 120; y < 300; y += 28) c.fillRect(40, y, 280 - (y % 3) * 20, 10);
    txt(c, '10 CTS / BALLE', 180, 340, 38, '#e0322b'); c.fillStyle = '#111'; c.fillRect(40, 430, 280, 5);
  });
  const TX_SIGN = tex(280, 80, (c) => { c.strokeStyle = '#1d3fb8'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(10, 50); c.bezierCurveTo(40, 0, 60, 80, 90, 30); c.bezierCurveTo(110, 5, 130, 70, 160, 40); c.bezierCurveTo(190, 15, 210, 60, 270, 30); c.stroke(); });

  // ================================================================ les plans (index = numéro de scène - 1)
  const S = [];
  const scn = (cam, build, up) => { const g = grp(scene); g.visible = false; const st = build(g) || {}; S.push({ g, cam, up: (t, a, b) => up(t, a, b, st) }); };
  const FOG = ['#2a9fb6', 1.5, 12];
  const T_IN = 0.34;   // le plongeur touche l'eau

  // 1 · accroche : plongeon, il ressort avec un filet plein de balles… puis il pleut 3 000 balles
  scn((t) => {
    const tu = K('ressort', 0) - 0.25, sh = (t0) => (t > t0 ? 0.09 * Math.exp(-(t - t0) * 6) * Math.sin((t - t0) * 55) : 0), s = sh(T_IN) + sh(tu);
    return { p: [0.25 + s, 2.0 + s, lerp(5.6, 5.0, u(t, 0.4, 3.6))], q: [0, 0.8, -0.6], f: 38 };
  }, (g) => {
    grass(g); const lk = lake(g, 3.2, 2.6, 0, -1.6);
    trees(g, [[-3.2, -6.5, 1.3], [-1.6, -7.2, 1.1], [0.4, -7.8, 1.4], [2.4, -7.0, 1.2], [3.8, -6.2, 1.3]]);
    disc(g, 1.0, '#8fe06a', 0.006, 0.95, -5.2, 1.3); const fg = flag(g); fg.position.set(0.95, 0, -5.2);
    const dv = diver(g); const bag = netBag(dv.userData.body, 150); bag.position.set(0.47, 0.04, 0.02);
    const sp1 = splash(g, 22, 1); sp1.position.set(0.15, 0, -1.4); sp1.scale.setScalar(1.2);
    const sp2 = splash(g, 26, 2); sp2.position.set(0.1, 0, -0.6); sp2.scale.setScalar(1.4);
    const bub = []; for (let i = 0; i < 8; i++) { const b = add(g, new THREE.SphereGeometry(0.05, 10, 8), GLASS); bub.push(b); }
    const N = 380, rain = field(g, N), r = rnd(55), rs = [];
    for (let i = 0; i < N; i++) rs.push({ t0: K('Littéralement.', 0) - 0.15 + 0.8 * r(), x: (r() - 0.5) * 3.2, z: -2.2 + r() * 4.6, h: 2.4 + r() * 1.4, vx: (r() - 0.5) * 0.3 });
    return { lk, fg, dv, bag, sp1, sp2, bub, rain, rs };
  }, (t, a, b, s) => {
    ripple(s.lk, t); wave(s.fg, t);
    const tu = K('ressort', a) - 0.25, d = s.dv, B = d.userData.body;
    if (t < tu) {
      const k = u(t, 0, 0.5); d.position.set(lerp(-1.05, 0.05, k), lerp(2.6, -1.4, k * k), -1.35); d.rotation.set(0, 0.3, lerp(-2.1, -2.75, k));
      d.userData.arms.forEach((ar) => { ar.rotation.set(0, 0, 0); ar.rotation.x = Math.PI; }); s.bag.visible = false; d.visible = t < 0.55;
    } else {
      const k = E.back(u(t, tu, tu + 0.35)); d.visible = true; d.position.set(0, lerp(-1.6, -0.3, k) + 0.04 * Math.sin((t - tu) * 4), -0.6); d.rotation.set(0, -0.15, 0);
      s.bag.visible = true; d.userData.arms[1].rotation.set(0, 0, 2.6); d.userData.arms[0].rotation.set(0, 0, -2.3 + 0.35 * Math.sin((t - tu) * 9));
      B.rotation.z = 0.05 * Math.sin((t - tu) * 5);
    }
    s.sp1.userData.up(t - T_IN); s.sp2.userData.up(t - tu);
    s.bub.forEach((bb, i) => { const t0 = 0.5 + i * 0.17, k = (t - t0) / 0.5; bb.visible = t < tu && k > 0 && k < 1; bb.position.set(0.15 + 0.12 * Math.sin(i * 2.1), 0.02 + 0.03 * Math.sin(k * Math.PI), -1.4 + 0.1 * Math.cos(i)); bb.scale.setScalar(1 - k * 0.5); });
    s.rs.forEach((o, i) => {
      const st = t - o.t0; if (st <= 0) { setI(s.rain, i, 0, -5, 0, 0.0001); return; }
      const wet = inLake(s.lk, o.x, o.z), y = wet ? o.h - 4.9 * st * st : bounceY(st, o.h);
      if (wet && y < -0.1) { setI(s.rain, i, 0, -5, 0, 0.0001); return; }
      setI(s.rain, i, o.x + o.vx * Math.min(st, 1.2), 0.085 + y, o.z);
    });
    s.rain.instanceMatrix.needsUpdate = true;
  });

  // 2 · titre : un golfeur tape… plouf dans le lac ; un plongeur sort la tête, pouce levé
  scn((t, a, b) => ({ p: [lerp(0.9, 0.5, u(t, a, b)), 1.9, 6.4], q: [0.4, 0.8, -1.0], f: 36 }), (g) => {
    grass(g); const lk = lake(g, 2.6, 1.8, 1.0, -2.6);
    trees(g, [[-2.4, -6, 1.2], [-0.6, -7, 1.3], [1.6, -7.4, 1.2], [3.4, -6.3, 1.3], [-3.6, -3, 1.1]]);
    disc(g, 1.0, '#8fe06a', 0.006, 1.4, -6.0, 1.3); const fg = flag(g); fg.position.set(1.4, 0, -6.0);
    const gf = golfer(g, 1, '#ffffff'); gf.position.set(-0.12, 0, 1.3); gf.rotation.y = 0.25;
    const bl = ball(g); const sp = splash(g, 14, 3); sp.position.set(0.7, 0, -2.9); sp.scale.setScalar(0.7);
    const dv = diver(g); dv.position.set(0.7, -1.3, -2.9);
    return { lk, fg, gf, bl, sp, dv };
  }, (t, a, b, s) => {
    ripple(s.lk, t); wave(s.fg, t);
    const tl = K('golf?', a) - 0.05, ti = tl - 0.85;
    s.gf.userData.club.rotation.z = swingAng(t, ti); s.gf.userData.body.rotation.y = 0.25 * Math.sin(s.gf.userData.club.rotation.z * 0.5);
    const k = u(t, ti, tl); s.bl.visible = t < tl; if (t < ti) s.bl.position.set(0.0, 0.085, 1.62); else arc(s.bl, [0.0, 0.085, 1.62], [0.7, 0, -2.9], 2.4, k);
    s.sp.userData.up(t - tl);
    const kd = E.back(u(t, tl + 0.12, tl + 0.42)); s.dv.position.y = lerp(-1.3, -0.68, kd) + 0.03 * Math.sin(t * 4); s.dv.visible = kd > 0;
    s.dv.userData.arms[1].rotation.set(0, 0, 2.7); s.dv.userData.arms[0].rotation.set(0, 0, 0);
  });

  // 3 · sous l'eau : un seul lac avale jusqu'à 50 000 balles par an
  scn((t, a, b) => { const k = E.sio(u(t, a, b)); return { p: [lerp(-0.5, 0.4, k), lerp(2.3, 1.3, k), lerp(4.2, 2.6, k)], q: [0, 0.1, -3], f: 40, fog: FOG }; }, (g) => {
    const sb = seabed(g, 3200);
    const sink = []; for (let i = 0; i < 6; i++) sink.push(ball(g));
    const fs = [fish(g), fish(g, '#ffd23f')];
    return { sb, sink, fs };
  }, (t, a, b, s) => {
    s.sb.userData.up(t);
    s.sink.forEach((o, i) => { const t0 = a + 0.2 + i * 0.5, k = u(t, t0, t0 + 1.6); o.visible = t > t0; o.position.set(-1.2 + i * 0.5, lerp(3.2, 0.09, E.o2(k)), -0.5 - (i % 3) * 0.6); });
    s.fs.forEach((f, i) => { const ph = (t - a) * 0.35 + i * 0.5; f.position.set(lerp(-3, 3, ph % 1) * (i ? -1 : 1), 1.1 + i * 0.5 + 0.1 * Math.sin(t * 3 + i), -1.5 - i * 1.5); f.rotation.y = i ? Math.PI : 0; f.rotation.z = 0.1 * Math.sin(t * 8 + i); });
  });

  // 4 · le contrat avec le golf : 10 centimes par balle
  scn((t, a) => ({ p: [0.2 * Math.sin((t - a) * 0.5), 1.55, 5.4], q: [0, 1.05, 0], f: 34 }), (g) => {
    grass(g); const lk = lake(g, 3.6, 1.6, 0, -3.6); trees(g, [[-2.6, -6.5, 1.2], [-0.8, -7.3, 1.3], [1.4, -7.0, 1.2], [3.0, -6.2, 1.3]]);
    const dir = person(g, 3, { cap: '#ffffff' }); dir.position.set(-0.62, 0, 0); dir.rotation.y = 0.55; dir.scale.setScalar(1.15);
    const dv = diver(g); dv.position.set(0.62, 0, 0); dv.rotation.y = -0.55;
    const ct = grp(g); ct.position.set(0, 1.3, 0.5); plane(ct, 0.66, 0.88, TX_CONTRACT);
    const sg = plane(ct, 0.5, 0.14, TX_SIGN); sg.position.set(0.0, -0.31, 0.01); sg.material.depthWrite = false; sg.renderOrder = 2;
    const cs = [0, 1, 2].map(() => { const c = coin(g); c.scale.setScalar(0.35); c.rotation.x = Math.PI / 2; return c; });
    return { lk, dir, dv, ct, sg, cs };
  }, (t, a, b, s) => {
    ripple(s.lk, t); s.ct.rotation.y = 0.12 * Math.sin((t - a) * 1.2); s.ct.position.y = 1.3 + 0.04 * Math.sin(t * 2);
    const ts = K('signe', a), k = u(t, ts, ts + 0.6); s.sg.visible = k > 0; s.sg.scale.set(Math.max(0.001, k), 1, 1); s.sg.position.x = -0.25 * (1 - k);
    s.dv.userData.arms[1].rotation.set(-0.9 * (k > 0 && k < 1 ? 1 : 0), 0, 0); bob(s.dir, t, 0, 0.3);
    const tc = K('10 centimes', a);
    s.cs.forEach((c, i) => { const kc = u(t, tc + i * 0.25, tc + 0.45 + i * 0.25); c.visible = kc > 0 && kc < 1; arc(c, [0.55, 0.9, 0.1], [-0.6, 0.9, 0.1], 0.5, E.io2(kc)); c.rotation.z = t * 6; });
  });

  // 5 · le matériel : combinaison, bouteille, filet
  scn((t, a) => ({ p: [0.2 * Math.sin((t - a) * 0.6), 1.05, 6.4], q: [0, 0.62, 0], f: 34 }), (g) => {
    const bd = backdrop(g, '#7fd3ff', '#c9efff');
    const su = grp(g); add(su, new THREE.CapsuleGeometry(0.21, 0.34, 6, 18), SUIT).position.y = 0.43; const st = add(su, new THREE.TorusGeometry(0.214, 0.02, 6, 28), glossy('#2f8cff')); st.rotation.x = Math.PI / 2; st.position.y = 0.52;
    for (const sx of [-1, 1]) { const ar = add(su, new THREE.CapsuleGeometry(0.056, 0.36, 4, 10), SUIT); ar.position.set(sx * 0.26, 0.45, 0); ar.rotation.z = sx * 0.25; }
    add(su, new THREE.TorusGeometry(0.14, 0.02, 8, 20, Math.PI), glossy('#c3c8d0', { m: 0.8 })).position.y = 0.88;
    const tk = grp(g); add(tk, new THREE.CapsuleGeometry(0.15, 0.5, 6, 16), YELM).position.y = 0.42; add(tk, new THREE.CylinderGeometry(0.04, 0.04, 0.12, 10), glossy('#c3c8d0', { m: 0.8 })).position.y = 0.82; const gz = add(tk, new THREE.CylinderGeometry(0.07, 0.07, 0.03, 16), glossy('#ffffff')); gz.position.set(0.09, 0.86, 0); gz.rotation.z = Math.PI / 2;
    const nb = netBag(g, 60); nb.scale.setScalar(0.85);
    [su, tk, nb].forEach((o, i) => { o.position.set(-0.6 + i * 0.6, 0, 0); });
    return { bd, items: [su, tk, nb] };
  }, (t, a, b, s) => {
    s.bd.rotation.z = (t - a) * 0.1;
    ['Combinaison,', 'bouteille,', 'filet:'].forEach((w, i) => { const tw = K(w, a), o = s.items[i]; show(o, E.back(u(t, tw - 0.15, tw + 0.2))); o.rotation.y = 0.5 * Math.sin((t - a) * 1.4 + i); });
  });

  // 6 · une plongée : il ratisse le fond, le filet se remplit (3 000 balles)
  scn((t, a, b) => { const x = lerp(-2.6, 1.8, u(t, a, b)); return { p: [x + 0.3, 1.5, 6.6], q: [x, 0.45, 0], f: 40, fog: FOG }; }, (g) => {
    const sb = seabed(g, 2600, 8, 2.5, -7);
    const dv = diver(g); dv.rotation.z = -Math.PI / 2 + 0.15;
    const nb = netBag(g, 150);
    const tr = []; for (let i = 0; i < 10; i++) tr.push(add(g, new THREE.SphereGeometry(0.035, 8, 6), GLASS));
    return { sb, dv, nb, tr };
  }, (t, a, b, s) => {
    s.sb.userData.up(t); const k = u(t, a, b), x = lerp(-2.6, 1.8, k);
    s.dv.position.set(x, 0.45 + 0.06 * Math.sin(t * 3), 0.2); s.dv.userData.arms.forEach((ar, i) => { ar.rotation.set(0, 0, (i ? 1 : -1) * (0.4 + 0.3 * Math.sin(t * 6 + i))); });
    s.nb.position.set(x - 0.8, 0.12, 0.25); s.nb.scale.setScalar(lerp(0.5, 0.95, k)); s.nb.rotation.z = 0.25;
    const P = s.sb.userData.pos, im = s.sb.userData.im;
    for (let i = 0; i < P.length; i++) { const p = P[i]; const gone = Math.abs(p[2] - 0.2) < 0.55 && p[0] < x - 0.2 && p[0] > -2.8; setI(im, i, p[0], p[1], p[2], gone ? 0.0001 : 1); }
    im.instanceMatrix.needsUpdate = true;
    s.tr.forEach((o, i) => { const kk = ((t * 1.3 + i * 0.1) % 1); o.position.set(x + 0.6 + 0.08 * Math.sin(i), 0.9 + kk * 2.2, 0.2); o.scale.setScalar(0.6 + (i % 3) * 0.3); });
  });

  // 7 · on les lave, on les revend 1 € pièce
  scn((t, a) => ({ p: [0.15 * Math.sin((t - a) * 0.6), 1.7, 6.6], q: [0, 0.72, 0], f: 34 }), (g) => {
    const bd = backdrop(g, '#bfeaff', '#e9f8ff');
    const tub = grp(g); tub.position.set(-0.52, 0, 0);
    add(tub, new THREE.CylinderGeometry(0.46, 0.4, 0.55, 32, 1, true), glossy('#2f8cff', { side: THREE.DoubleSide })).position.y = 0.28;
    add(tub, new THREE.CylinderGeometry(0.4, 0.4, 0.02, 32), glossy('#2f8cff')).position.y = 0.01;
    disc(tub, 0.44, '#8fd8f5', 0.45);
    const foam = []; for (let i = 0; i < 16; i++) { const f = add(tub, new THREE.SphereGeometry(0.07 + (i % 4) * 0.02, 12, 8), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 })); foam.push(f); }
    const tb = []; for (let i = 0; i < 9; i++) tb.push(ball(tub));
    const trays = grp(g); trays.position.set(0.55, 0, 0.1);
    for (let l = 0; l < 3; l++) { const tr = grp(trays); tr.position.y = l * 0.2; add(tr, new RoundedBoxGeometry(0.62, 0.08, 0.46, 2, 0.02), glossy('#f2f2f2', { r: 0.5 })).position.y = 0.04; for (let i = 0; i < 12; i++) ball(tr).position.set(-0.24 + (i % 4) * 0.16, 0.13, -0.16 + Math.floor(i / 4) * 0.16); }
    const pt = tag(g, '1 € PIÈCE', '#1e8f3a', 1.3); pt.scale.setScalar(0.62); pt.position.set(0.55, 0.95, 0.3);
    const cs = []; for (let i = 0; i < 10; i++) { const c = coin(g); c.scale.setScalar(0.4); cs.push(c); }
    return { bd, foam, tb, trays, pt, cs };
  }, (t, a, b, s) => {
    s.bd.rotation.z = (t - a) * 0.1;
    s.foam.forEach((f, i) => { const an = i * 2.4 + t * 0.6; f.position.set(Math.cos(an) * 0.28 * ((i % 3) / 3 + 0.4), 0.5 + 0.03 * Math.sin(t * 5 + i), Math.sin(an) * 0.25); });
    s.tb.forEach((o, i) => { const an = i * 0.7 + t * 1.5; o.position.set(Math.cos(an) * 0.22, 0.47 + 0.05 * Math.abs(Math.sin(t * 6 + i)), Math.sin(an) * 0.2); });
    const tr = K('revends', a); show(s.trays, E.back(u(t, tr - 0.2, tr + 0.2))); show(s.pt, 0.62 * E.back(u(t, tr + 0.2, tr + 0.5)));
    const te = K('3 000 euros.', a);
    s.cs.forEach((c, i) => { const kc = u(t, te + i * 0.05, te + 0.9 + i * 0.05), an = i / 10 * TAU; c.visible = kc > 0 && kc < 1; c.position.set(Math.cos(an) * 0.8 * kc, 0.9 + 2.2 * kc - 2.6 * kc * kc, 0.5 + Math.sin(an) * 0.4 * kc); c.rotation.set(t * 5 + i, 0, t * 3); });
  });

  // 8 · « 3 000 ! Je m'achète un golf » : voiturette en or
  scn(() => ({ p: [0.6, 1.7, 7.5], q: [0.35, 0.8, 0], f: 32 }), (g) => {
    const bd = backdrop(g, '#ffd27a', '#fff3c4'); const bg = buggy(g, GOLD); bg.rotation.y = -0.5; bg.scale.setScalar(0.72);
    const sp = []; for (let i = 0; i < 8; i++) { const s2 = sprite(glowTex, 0.5); g.add(s2); sp.push(s2); }
    return { bd, bg, sp };
  }, (t, a, b, s) => {
    s.bd.rotation.z = (t - a) * 0.12; const tj = K('Je', a), to = K('golf.', a), k = E.o3(u(t, tj - 0.5, tj + 0.4));
    s.bg.position.set(lerp(-6, 0.5, k), 0.03 * Math.abs(Math.sin(t * 9)) * (k < 1 ? 1 : 0), 0); s.bg.rotation.y = -0.5 + 0.12 * Math.sin((t - a) * 1.2);
    s.sp.forEach((q, i) => { const ang = i / 8 * TAU + (t - a) * 1.4; q.position.set(0.5 + Math.cos(ang) * 1.2, 1.0 + Math.sin(ang) * 0.85, 0.7); q.visible = t > to - 0.2; q.scale.setScalar(0.4 + 0.2 * Math.sin(t * 6 + i)); });
  });

  // 9 · « Attends. » 30 pièces (1 pièce = 100 €) : − 3 (part du golf), − 7 (balles abîmées), − 1 (essence) → 19 = 1 900 €
  scn(() => ({ p: [0, 2.0, 7.5], q: [0, 1.0, 0], f: 34 }), (g) => {
    const st = [-0.8, 0, 0.8].map((x) => { const c = coinStack(g, 10); c.position.x = x; return c; });
    return { st };
  }, (t, a, b, s) => {
    const C = s.st[2].userData.coins, B = s.st[1].userData.coins;
    const out = [[K('golf,', a), [C[9], C[8], C[7]]], [K('abîmées', a), [C[6], C[5], C[4], C[3], C[2], C[1], C[0]]], [K("l'essence:", a), [B[9]]]];
    out.forEach(([t0, cs]) => cs.forEach((c, j) => { const y0 = c.userData.y0 ?? (c.userData.y0 = c.position.y); const kk = u(t, t0 + j * 0.06, t0 + 0.5 + j * 0.06); c.visible = kk < 1; c.position.set(2.4 * E.i2(kk), y0 + 2.6 * E.i2(kk), 0); }));
  });

  // 10 · l'astuce de pro : le trou le plus dur, un green sur une île
  const island = (g) => {
    grass(g); const lk = lake(g, 4.6, 3.4, 0, -1.2);
    disc(g, 1.35, '#e8d49a', 0.012, 0, -1.2); disc(g, 1.15, '#8fe06a', 0.016, 0, -1.2); const fg = flag(g); fg.position.set(0.15, 0.016, -1.2);
    trees(g, [[-3.8, -6, 1.3], [-1.8, -6.6, 1.2], [0.6, -6.9, 1.4], [2.8, -6.4, 1.2], [4.6, -4.4, 1.3], [-4.8, -3.6, 1.2]]);
    return { lk, fg };
  };
  scn((t, a, b) => { const f = lerp(-0.35, 0.25, u(t, a, b)); return { p: [6.2 * Math.sin(f), 4.4, -1.2 + 6.2 * Math.cos(f)], q: [0, 0.2, -1.4], f: 36 }; }, (g) => island(g), (t, a, b, s) => { ripple(s.lk, t); wave(s.fg, t); });

  // 11 · tout le monde rate : les balles pleuvent autour de l'île (× 10)
  scn((t, a) => ({ p: [0.4 * Math.sin((t - a) * 0.4), 3.2, 4.8], q: [0, 0.3, -1.3], f: 38 }), (g) => {
    const st = island(g); const r = rnd(66), bs = [];
    for (let i = 0; i < 12; i++) { const an = r() * TAU, rr = 1.55 + r() * 1.3; const o = { b: ball(g), sp: splash(g, 10, 20 + i), x: Math.cos(an) * rr * 1.2, z: -1.2 + Math.sin(an) * rr * 0.75, i }; o.sp.position.set(o.x, 0, o.z); o.sp.scale.setScalar(0.5); bs.push(o); }
    return Object.assign(st, { bs });
  }, (t, a, b, s) => {
    ripple(s.lk, t); wave(s.fg, t); const tr = K('rate.', a), offs = [-0.5, -0.15, 0.2];
    s.bs.forEach((o) => { const tl = o.i < 3 ? tr + offs[o.i] : a + 0.3 + o.i * 0.2, k = u(t, tl - 0.7, tl); o.b.visible = k > 0 && k < 1; o.b.position.set(o.x - 1.5 * (1 - k), 0.085 + 3.5 * (1 - k * k), o.z + 1.8 * (1 - k)); o.sp.userData.up(t - tl); });
  });

  // 12 · le pire joueur du club : plouf… et le plongeur lève le pouce
  scn((t, a) => ({ p: [0.25 + 0.15 * Math.sin((t - a) * 0.5), 1.6, 6.3], q: [0.15, 0.8, -0.5], f: 36 }), (g) => {
    grass(g); const lk = lake(g, 3.2, 1.6, 0.3, -2.4); trees(g, [[-2.6, -6, 1.2], [-0.6, -6.8, 1.3], [1.6, -6.6, 1.2], [3.3, -5.8, 1.3]]);
    const gf = golfer(g, 2, '#e0322b'); gf.position.set(-0.4, 0, 0.9); gf.rotation.y = 0.35; gf.scale.setScalar(1.1);
    const bl = ball(g), bl2 = ball(g); const sp = splash(g, 14, 9); sp.position.set(0.55, 0, -1.9); sp.scale.setScalar(0.7); const sp2 = splash(g, 12, 10); sp2.position.set(0.0, 0, -2.2); sp2.scale.setScalar(0.6);
    const dv = diver(g); dv.position.set(0.6, -1.3, -1.8);
    return { lk, gf, bl, bl2, sp, sp2, dv };
  }, (t, a, b, s) => {
    ripple(s.lk, t); const tc = K('club?', a), ti = tc - 0.29, tl = tc + 0.15, ti2 = tl + 0.95, tl2 = ti2 + 0.45;
    const sw = t < ti2 - 0.6 ? swingAng(t, ti) : swingAng(t, ti2); s.gf.userData.club.rotation.z = sw; s.gf.userData.body.rotation.y = 0.25 * Math.sin(sw * 0.5);
    const k = u(t, ti, tl); s.bl.visible = t < tl; if (t < ti) s.bl.position.set(-0.2, 0.085, 1.25); else arc(s.bl, [-0.2, 0.085, 1.25], [0.55, 0, -1.9], 1.2, k);
    const k2 = u(t, ti2, tl2); s.bl2.visible = t > ti2 - 0.6 && t < tl2; if (t < ti2) s.bl2.position.set(-0.2, 0.085, 1.25); else arc(s.bl2, [-0.2, 0.085, 1.25], [0.0, 0, -2.2], 1.0, k2);
    s.sp.userData.up(t - tl); s.sp2.userData.up(t - tl2);
    s.gf.userData.body.rotation.x = t > tl ? 0.15 : 0;
    const kd = E.back(u(t, tl + 0.3, tl + 0.65)); s.dv.visible = kd > 0; s.dv.position.y = lerp(-1.3, -0.62, kd) + 0.03 * Math.sin(t * 4);
    s.dv.userData.arms[1].rotation.set(0, 0, 2.7); s.dv.userData.arms[0].rotation.set(0, 0, -0.3);
  });

  // 13 · conclusion : tout en 2D
  scn(() => ({ p: [0, 2, 10], q: [0, 1, 0] }), () => {}, () => {});

  // ================================================================ rendu à l'instant t
  function renderAt(t) {
    let i = 0; for (let k = 0; k < ST.length; k++) if (t >= ST[k]) i = k;
    const a = ST[i], b = i + 1 < ST.length ? ST[i + 1] : M.end;
    S.forEach((s, k) => { s.g.visible = k === i; });
    const sc = S[i]; sc.up(t, a, b);
    const c = sc.cam(t, a, b), punch = i === 0 ? 0 : 1 - E.o3(u(t, a, a + 0.45));
    scene.fog = c.fog ? new THREE.Fog(c.fog[0], c.fog[1], c.fog[2]) : null;
    const f = c.f || 28; if (camera.fov !== f) { camera.fov = f; camera.updateProjectionMatrix(); }
    camera.position.set(c.p[0], c.p[1], c.p[2] * (1 + 0.08 * punch)); camera.lookAt(c.q[0], c.q[1], c.q[2]);
    renderer.render(scene, camera);
  }
  return { renderAt, renderer, scene, camera };
}
