// Monde 3D de « Combien ça rapporte de pousser les caddies des autres ? » : parking de supermarché, caddies (grille,
// poignée, monnayeur), voitures dont le coffre s'ouvre, potes en gilet fluo, directeur, mamie, pièce de 1 €, caddie en or,
// pluie et parapluie géant, pack d'eau « meilleur commercial ». Tout est une fonction pure du temps t (window.MCDO.starts).
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
  // parking : bitume et lignes blanches
  const TX_ASPH = tex(512, 512, (c) => {
    c.fillStyle = '#6b7280'; c.fillRect(0, 0, 512, 512); const r = rnd(3);
    for (let i = 0; i < 1400; i++) { c.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'; c.fillRect(r() * 512, r() * 512, 2, 2); }
    c.fillStyle = '#f4f4f4'; for (let x = 0; x < 512; x += 128) c.fillRect(x, 0, 8, 300); c.fillRect(0, 300, 512, 8);
  });
  TX_ASPH.wrapS = TX_ASPH.wrapT = THREE.RepeatWrapping; TX_ASPH.repeat.set(5, 5);
  const parking = (parent, w = 30, d = 24, col = '#ffffff') => { const m = add(parent, new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: TX_ASPH, roughness: 0.9, color: col })); m.rotation.x = -Math.PI / 2; m.position.z = -2; return m; };
  // supermarché générique
  function store(parent) {
    const g = grp(parent);
    add(g, new THREE.BoxGeometry(16, 4.2, 4), new THREE.MeshStandardMaterial({ color: '#f2f1ec', roughness: 0.8 })).position.y = 2.1;
    add(g, new THREE.BoxGeometry(16.2, 0.9, 4.2), new THREE.MeshStandardMaterial({ color: '#2f8cff', roughness: 0.5 })).position.y = 4.25;
    plane(g, 6, 0.8, sign(900, 120, 'SUPERMARCHÉ', '#2f8cff', '#ffffff', 92)).position.set(0, 4.25, 2.12);
    for (const x of [-1.2, 1.2]) add(g, new THREE.PlaneGeometry(2.2, 2.6), new THREE.MeshPhysicalMaterial({ color: '#2a4a6e', roughness: 0.1, metalness: 0.3, clearcoat: 1 })).position.set(x, 1.3, 2.01);
    for (const x of [-6, -4, 4, 6]) add(g, new THREE.PlaneGeometry(1.6, 1.8), new THREE.MeshPhysicalMaterial({ color: '#3b5f86', roughness: 0.15, clearcoat: 1 })).position.set(x, 1.9, 2.01);
    return g;
  }
  // caddie : grille, cadre chromé, poignée rouge avec monnayeur, roulettes ; o.gold = caddie en or
  const TX_GRID = tex(256, 256, (c) => { c.clearRect(0, 0, 256, 256); c.strokeStyle = '#ffffff'; c.lineWidth = 7; for (let i = 0; i <= 256; i += 32) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 256); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(256, i); c.stroke(); } });
  function cart(parent, o = {}) {
    const g = grp(parent), CH = o.gold ? GOLD : glossy('#d7dde5', { m: 0.85, r: 0.25 }), RED = o.gold ? GOLD : glossy('#e0322b', { r: 0.3 });
    const GR = new THREE.MeshStandardMaterial({ map: TX_GRID, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide, metalness: 0.7, roughness: 0.3, color: o.gold ? '#f6c445' : '#e6ebf2' });
    const bw = 1.0, bh = 0.6, bd = 0.62, by = 0.95, bx = 0.1;
    const face = (w, h, x, y, z, rx, ry) => { const m = add(g, new THREE.PlaneGeometry(w, h), GR); m.position.set(x, y, z); m.rotation.set(rx || 0, ry || 0, 0); };
    face(bw, bd, bx, by - bh / 2, 0, -Math.PI / 2); face(bw, bh, bx, by, bd / 2); face(bw, bh, bx, by, -bd / 2); face(bd, bh, bx + bw / 2, by, 0, 0, Math.PI / 2); face(bd, bh, bx - bw / 2, by, 0, 0, Math.PI / 2);
    const edge = (l, x, y, z, ax) => { const m = add(g, new THREE.CylinderGeometry(0.018, 0.018, l, 6), CH); m.position.set(x, y, z); if (ax === 'x') m.rotation.z = Math.PI / 2; if (ax === 'z') m.rotation.x = Math.PI / 2; };
    for (const y of [by - bh / 2, by + bh / 2]) for (const z of [-bd / 2, bd / 2]) edge(bw, bx, y, z, 'x');
    for (const y of [by - bh / 2, by + bh / 2]) for (const x of [bx - bw / 2, bx + bw / 2]) edge(bd, x, y, 0, 'z');
    for (const x of [bx - bw / 2, bx + bw / 2]) for (const z of [-bd / 2, bd / 2]) edge(bh, x, by, z);
    for (const z of [-0.26, 0.26]) { const p = add(g, new THREE.CylinderGeometry(0.02, 0.02, 0.7, 6), CH); p.position.set(-0.32, 1.25, z); p.rotation.z = 0.45; }
    const hd = add(g, new THREE.CylinderGeometry(0.035, 0.035, 0.66, 12), RED); hd.rotation.x = Math.PI / 2; hd.position.set(-0.5, 1.52, 0);
    const slot = add(g, new RoundedBoxGeometry(0.16, 0.1, 0.12, 2, 0.02), RED); slot.position.set(-0.5, 1.6, 0);
    for (const z of [-0.26, 0.26]) { edge(0.95, 0.08, 0.13, z, 'x'); const s2 = add(g, new THREE.CylinderGeometry(0.02, 0.02, 0.55, 6), CH); s2.position.set(-0.35, 0.4, z); s2.rotation.z = 0.3; }
    for (const x of [-0.35, 0.5]) for (const z of [-0.24, 0.24]) { const w = add(g, new THREE.CylinderGeometry(0.075, 0.075, 0.05, 16), glossy('#1d1d1f', { r: 0.6 })); w.rotation.x = Math.PI / 2; w.position.set(x, 0.075, z); }
    shadow(g, 0.05, 0, 1.6, 1.0);
    g.userData.load = grp(g); g.userData.load.position.set(bx, by - bh / 2 + 0.02, 0);
    return g;
  }
  // courses
  function bag(parent, col) {
    const g = grp(parent), m = new THREE.MeshStandardMaterial({ color: col || '#f2e3c6', roughness: 0.8 });
    add(g, new THREE.BoxGeometry(0.34, 0.4, 0.2), m).position.y = 0.2;
    const h = add(g, new THREE.TorusGeometry(0.08, 0.012, 6, 16, Math.PI), m); h.position.set(0, 0.4, 0);
    const bg = add(g, new THREE.CapsuleGeometry(0.035, 0.32, 4, 8), glossy('#d9923c', { r: 0.6, cc: 0.2 })); bg.position.set(0.06, 0.45, 0.02); bg.rotation.z = -0.3;
    return g;
  }
  const BOTTLE = new THREE.MeshPhysicalMaterial({ color: '#8fd0ff', roughness: 0.08, transmission: 0.4, transparent: true, opacity: 0.85, clearcoat: 1 });
  function waterPack(parent) {
    const g = grp(parent);
    for (let i = 0; i < 6; i++) { const x = (i % 3 - 1) * 0.15, z = (Math.floor(i / 3) - 0.5) * 0.15; add(g, new THREE.CylinderGeometry(0.07, 0.07, 0.42, 16), BOTTLE).position.set(x, 0.21, z); add(g, new THREE.CylinderGeometry(0.025, 0.025, 0.05, 10), glossy('#2f8cff')).position.set(x, 0.45, z); }
    add(g, new THREE.BoxGeometry(0.47, 0.18, 0.32), new THREE.MeshStandardMaterial({ color: '#2f8cff', roughness: 0.4, transparent: true, opacity: 0.85 })).position.y = 0.2;
    return g;
  }
  // voiture citadine (avant vers +x) ; userData.lid = hayon (s'ouvre en tournant)
  function car(parent, col) {
    const g = grp(parent), P = glossy(col, { r: 0.22 }), GL = new THREE.MeshPhysicalMaterial({ color: '#25344a', roughness: 0.08, metalness: 0.2, clearcoat: 1 }), TY = glossy('#1d1d1f', { r: 0.6 });
    add(g, new RoundedBoxGeometry(3.3, 0.72, 1.6, 4, 0.2), P).position.y = 0.62;
    add(g, new RoundedBoxGeometry(1.8, 0.62, 1.42, 4, 0.2), GL).position.set(0.05, 1.24, 0);
    add(g, new RoundedBoxGeometry(1.75, 0.1, 1.46, 3, 0.05), P).position.set(0.05, 1.56, 0);
    const lid = grp(g); lid.position.set(-0.9, 1.58, 0);
    add(lid, new RoundedBoxGeometry(0.12, 0.66, 1.42, 2, 0.04), P).position.set(-0.12, -0.32, 0);
    const rw = add(lid, new THREE.PlaneGeometry(0.4, 1.2), GL); rw.position.set(-0.19, -0.25, 0); rw.rotation.y = -Math.PI / 2;
    add(g, new THREE.BoxGeometry(0.6, 0.5, 1.3), new THREE.MeshStandardMaterial({ color: '#2b2b2f', roughness: 0.9 })).position.set(-1.3, 0.9, 0);
    for (const x of [-1.05, 1.05]) for (const z of [-0.72, 0.72]) { const w = add(g, new THREE.CylinderGeometry(0.33, 0.33, 0.24, 24), TY); w.rotation.x = Math.PI / 2; w.position.set(x, 0.33, z); const h = add(g, new THREE.CylinderGeometry(0.17, 0.17, 0.26, 16), glossy('#c3c8d0', { m: 0.8, r: 0.3 })); h.rotation.x = Math.PI / 2; h.position.set(x, 0.33, z); }
    for (const z of [-0.5, 0.5]) { add(g, new THREE.SphereGeometry(0.1, 12, 8), new THREE.MeshBasicMaterial({ color: '#fff7d6' })).position.set(1.64, 0.72, z); add(g, new THREE.BoxGeometry(0.04, 0.14, 0.24), new THREE.MeshBasicMaterial({ color: '#ff3b30' })).position.set(-1.64, 0.8, z); }
    shadow(g, 0, 0, 4.2, 2.2);
    g.userData.lid = lid; return g;
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
  // pièce de 1 € (couronne dorée, cœur argenté)
  function euro(parent) {
    const g = grp(parent);
    const r = add(g, new THREE.CylinderGeometry(0.3, 0.3, 0.06, 40), GOLD); r.rotation.x = Math.PI / 2;
    const c = add(g, new THREE.CylinderGeometry(0.2, 0.2, 0.064, 32), glossy('#d7dde5', { m: 0.9, r: 0.2 })); c.rotation.x = Math.PI / 2;
    for (const s of [1, -1]) { const f = plane(g, 0.32, 0.32, tex(128, 128, (cc) => txt(cc, '1', 64, 68, 96, '#8a8f98'))); f.position.z = s * 0.034; if (s < 0) f.rotation.y = Math.PI; }
    return g;
  }
  // parapluie géant (rayé rouge et blanc)
  function umbrella(parent) {
    const g = grp(parent);
    const T = tex(512, 64, (c) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#e0322b'; c.fillRect(i * 64, 0, 64, 64); } });
    add(g, new THREE.SphereGeometry(1.7, 32, 10, 0, TAU, 0, Math.PI * 0.4), new THREE.MeshStandardMaterial({ map: T, roughness: 0.5, side: THREE.DoubleSide })).position.y = 1.0;
    add(g, new THREE.CylinderGeometry(0.03, 0.03, 2.6, 8), glossy('#444', { m: 0.6 })).position.y = 1.4;
    const h = add(g, new THREE.TorusGeometry(0.1, 0.025, 8, 16, Math.PI), glossy('#6b4226')); h.position.y = 0.1; h.rotation.z = Math.PI;
    return g;
  }
  // pluie : gouttes allongées (instances) qui tombent en boucle
  function rain(parent, n, w, h, d, col) {
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.013, 0.34, 0.013), new THREE.MeshBasicMaterial({ color: col || '#eaf2ff', transparent: true, opacity: 0.8, toneMapped: false, depthWrite: false }), n);
    im.frustumCulled = false; parent.add(im);
    const r = rnd(91), seeds = [], m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0.1)), sc = new THREE.Vector3(1, 1, 1), p = new THREE.Vector3();
    for (let i = 0; i < n; i++) seeds.push([(r() - 0.5) * w, r() * h, (r() - 0.5) * d, 5 + r() * 3]);
    return (t) => { seeds.forEach((s, i) => { const y = ((s[1] - t * s[3]) % h + h) % h; p.set(s[0] - 0.1 * y, y, s[2]); m4.compose(p, q, sc); im.setMatrixAt(i, m4); }); im.instanceMatrix.needsUpdate = true; };
  }
  // ciel d'orage derrière les plans de pluie
  const TX_STORM = tex(16, 256, (c) => { const gr = c.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#56657c'); gr.addColorStop(1, '#a3b0c2'); c.fillStyle = gr; c.fillRect(0, 0, 16, 256); });
  const storm = (parent) => { const m = add(parent, new THREE.PlaneGeometry(70, 30), new THREE.MeshBasicMaterial({ map: TX_STORM, toneMapped: false, depthWrite: false })); m.position.set(0, 6, -14); m.renderOrder = -2; return m; };
  const sunTex = radial([[0, 'rgba(255,236,110,1)'], [0.34, 'rgba(255,205,60,1)'], [0.36, 'rgba(255,215,90,0.45)'], [1, 'rgba(255,225,120,0)']]);
  const puddle = (parent, x, z, s) => { const m = add(parent, new THREE.CircleGeometry(1, 32), new THREE.MeshPhysicalMaterial({ color: '#3d4a5c', roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.8 })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.006, z); m.scale.set(s, s * 0.6, 1); return m; };
  function coin(parent) { return add(parent, new THREE.CylinderGeometry(0.36, 0.36, 0.11, 40), GOLD); }
  function coinStack(parent, n) {
    const g = grp(parent), coins = [];
    for (let i = 0; i < n; i++) { const c = coin(g); c.position.y = 0.06 + i * 0.115; c.rotation.y = i * 0.7; coins.push(c); }
    shadow(g, 0, 0, 1.2, 1.0);
    g.userData.coins = coins; return g;
  }

  // ================================================================ les plans (index = numéro de scène - 1)
  const S = [];
  const scn = (cam, build, up) => { const g = grp(scene); g.visible = false; const st = build(g) || {}; S.push({ g, cam, up: (t, a, b) => up(t, a, b, st) }); };
  const T_STOP = 0.45;

  // 1 · accroche : un caddie fou fonce vers l'écran, la mamie court derrière, un pote en gilet fluo plonge et l'arrête
  const P0 = [-0.8, -1.8], P1 = [0.05, 1.9], CANG = Math.atan2(-(P1[1] - P0[1]), P1[0] - P0[0]);
  scn((t) => {
    const sh = 0.1 * Math.exp(-Math.max(0, t - T_STOP) * 6) * Math.sin((t - T_STOP) * 60) * (t > T_STOP), kz = E.io2(u(t, 2.6, 5.0));
    return { p: [0.4 + sh + 0.3 * kz, 2.6 + sh + 0.2 * kz, lerp(8.4, 9.6, kz)], q: [0, lerp(0.6, 0.3, kz), lerp(0, -0.4, kz)], f: 34 };
  }, (g) => {
    parking(g); const st = store(g); st.position.set(0, 0, -10);
    const cr = cart(g); const ld = cr.userData.load; const wp = waterPack(ld); wp.position.set(-0.15, 0, 0); const b1 = bag(ld, '#ffd9a8'); b1.position.set(0.25, 0, 0.05);
    const mamie = person(g, 1, { mamie: true, arms: true });
    const p1 = person(g, 2, { vest: true, cap: '#ff3b5c', arms: true }); const p2 = person(g, 0, { vest: true, cap: '#2f8cff', arms: true });
    const c1 = car(g, '#ff8a1f'); c1.position.set(-2.1, 0, -3.6); c1.rotation.y = Math.PI / 2; const c2 = car(g, '#2fbf4a'); c2.position.set(2.3, 0, -4.4); c2.rotation.y = Math.PI / 2;
    return { cr, mamie, p1, p2 };
  }, (t, a, b, s) => {
    const k = u(t, 0, T_STOP), wob = t > T_STOP ? 0.1 * Math.sin((t - T_STOP) * 18) * Math.exp(-(t - T_STOP) * 6) : 0;
    s.cr.position.set(lerp(P0[0], P1[0], k), 0, lerp(P0[1], P1[1], k) + wob); s.cr.rotation.set(0, CANG + (t > T_STOP ? 0.35 * E.o3(u(t, T_STOP, T_STOP + 0.4)) : 0), t < T_STOP ? 0.07 * Math.sin(t * 45) : -0.12 * Math.exp(-(t - T_STOP) * 5) * Math.cos((t - T_STOP) * 14));
    const km = E.o2(u(t, 0, 1.9)); s.mamie.position.set(lerp(-1.7, -0.75, km), 0, lerp(-5.5, 1.0, km)); s.mamie.rotation.y = 0.15; bob(s.mamie, t, 0, 1.4 * (1 - u(t, 1.7, 2.0)));
    const kd = E.o3(u(t, T_STOP - 0.28, T_STOP)); s.p1.position.set(lerp(2.4, 0.72, kd), 0.22 * Math.sin(Math.PI * kd), lerp(2.6, 2.05, kd)); s.p1.rotation.set(0, -Math.PI / 2 + 0.3, lerp(0, -0.55, kd) * (1 - u(t, T_STOP + 0.2, T_STOP + 0.6)));
    const k2 = E.o3(u(t, 1.5, 2.4)); s.p2.position.set(lerp(3.2, 1.0, k2), 0, lerp(-1.5, 0.7, k2)); s.p2.rotation.y = -Math.PI / 2 - 0.5; bob(s.p2, t, 1, 1 - u(t, 2.3, 2.5));
  });

  // 2 · titre : un pote pousse un train de caddies vers l'écran
  scn((t, a, b) => ({ p: [lerp(3.4, 2.6, u(t, a, b)), 2.5, 7.6], q: [0, 0.7, -1.2], f: 34 }), (g) => {
    parking(g, 40, 40);
    [['#ff8a1f', -2.8, -4.5], ['#2f8cff', 2.9, -5.5], ['#ffffff', -3.0, -8.5]].forEach(([c, x, z]) => { const v = car(g, c); v.position.set(x, 0, z); v.rotation.y = Math.PI / 2; });
    const crs = []; for (let i = 0; i < 7; i++) { const c = cart(g); c.rotation.y = -Math.PI / 2; crs.push(c); }
    const p1 = person(g, 2, { vest: true, cap: '#ff3b5c', arms: true });
    return { crs, p1 };
  }, (t, a, b, s) => {
    const z0 = lerp(-0.6, 1.3, u(t, a, b));
    s.crs.forEach((c, i) => { c.position.set(0, 0, z0 - i * 0.36); c.rotation.z = 0.02 * Math.sin(t * 20 + i); });
    s.p1.position.set(0, 0, z0 - 6 * 0.36 - 0.9); s.p1.rotation.y = 0; bob(s.p1, t, 0, 1);
  });

  // 3 · le directeur dit oui… pendant qu'un pote range ses caddies derrière lui
  scn((t, a) => ({ p: [0.25 * Math.sin((t - a) * 0.4), 1.5, 7], q: [0, 0.8, -1], f: 34 }), (g) => {
    parking(g); const st = store(g); st.position.set(0, 0, -5.2);
    const boss = person(g, 0, { boss: true }); boss.position.set(-0.6, 0, -0.2); boss.scale.setScalar(1.3);
    const crs = []; for (let i = 0; i < 4; i++) { const c = cart(g); c.rotation.y = Math.PI; crs.push(c); }
    const p1 = person(g, 2, { vest: true, cap: '#ff3b5c', arms: true });
    return { boss, crs, p1 };
  }, (t, a, b, s) => {
    const to = K('Il dit oui…', a); s.boss.userData.body.rotation.x = 0.18 * Math.max(0, Math.sin((t - to) * 10)) * (t > to && t < to + 1.2);
    s.boss.rotation.y = 0.15;
    const tg = K('parce', a), k = E.o2(u(t, tg, tg + 1.8)), x0 = lerp(4.8, -0.6, k);
    s.crs.forEach((c, i) => c.position.set(x0 + i * 0.3, 0, -2.0));
    s.p1.position.set(x0 + 3 * 0.3 + 0.9, 0, -2.0); s.p1.rotation.y = -Math.PI / 2; bob(s.p1, t, 0, k > 0 && k < 0.98 ? 1 : 0);
  });

  // 4 · deux gilets fluo, une pancarte « On charge votre coffre : 2 € »
  scn((t, a) => ({ p: [0.3 * Math.sin((t - a) * 0.6), 1.7, 7.5], q: [0, 1.05, 0] }), (g) => {
    parking(g); const st = store(g); st.position.set(0, 0, -7);
    const p1 = person(g, 2, { vest: true, cap: '#ff3b5c' }); p1.position.set(-0.72, 0, 0); const p2 = person(g, 0, { vest: true, cap: '#2f8cff' }); p2.position.set(0.72, 0, 0);
    const pc = grp(g); pc.position.set(0, 0, 0.35);
    add(pc, new THREE.CylinderGeometry(0.025, 0.025, 1.1, 8), new THREE.MeshStandardMaterial({ color: '#8a5a36' })).position.set(0, 0.55, -0.04);
    plane(pc, 1.3, 0.75, tex(560, 320, (c) => { c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(6, 6, 548, 308, 26); c.fill(); c.lineWidth = 10; c.strokeStyle = '#111'; c.stroke(); txt(c, 'ON CHARGE', 280, 80, 64, '#2f8cff'); txt(c, 'VOTRE COFFRE', 280, 160, 60, '#2f8cff'); txt(c, '2 €', 280, 250, 84, '#2fbf4a', '#111', 8); })).position.set(0, 1.45, 0.02);
    return { p1, p2, pc };
  }, (t, a, b, s) => {
    show(s.p1, E.back(u(t, K('gilets', a) - 0.25, K('gilets', a) + 0.1))); show(s.p2, E.back(u(t, K('gilets', a) - 0.1, K('gilets', a) + 0.25)));
    show(s.pc, E.back(u(t, K('pancarte:', a) - 0.1, K('pancarte:', a) + 0.25))); s.pc.rotation.z = 0.05 * Math.sin(t * 3);
    bob(s.p1, t, 0, 0.4); bob(s.p2, t, 1, 0.4);
  });

  // 5 · ton pote pousse le caddie jusqu'au coffre ouvert, toi tu charges, puis il ramène le caddie
  scn((t, a) => ({ p: [-0.15 + 0.2 * Math.sin((t - a) * 0.5), 2.4, 7.6], q: [0.05, 0.85, -0.2], f: 40 }), (g) => {
    parking(g); const c = car(g, '#ff8a1f'); c.position.set(0.55, 0, -1.3); c.rotation.y = Math.PI / 2;
    const cr = cart(g); const ld = cr.userData.load; const items = [waterPack(ld), bag(ld, '#ffd9a8'), bag(ld, '#c9f2d6')];
    items[0].position.set(-0.2, 0, 0); items[1].position.set(0.15, 0, 0.1); items[2].position.set(0.3, 0, -0.12);
    const fly = [waterPack(g), bag(g, '#ffd9a8'), bag(g, '#c9f2d6')];
    const p1 = person(g, 2, { vest: true, cap: '#ff3b5c', arms: true }); const p2 = person(g, 0, { vest: true, cap: '#2f8cff', arms: true });
    return { c, cr, items, fly, p1, p2 };
  }, (t, a, b, s) => {
    const tp = K('pousse', a), tc = K('charges', a), tr = K('ramenez', a);
    const kp = E.io2(u(t, tp - 0.3, tp + 0.8)), kr = E.i2(u(t, tr - 0.1, tr + 0.9));
    s.cr.position.set(lerp(-4.2, -0.55, kp) - 4.5 * kr, 0, 0.95); s.cr.rotation.y = 0;
    const back = kr > 0; s.p1.position.set(s.cr.position.x + (back ? -1.0 : -0.85), 0, 0.95); s.p1.rotation.y = back ? -Math.PI / 2 : Math.PI / 2; bob(s.p1, t, 0, (kp > 0 && kp < 1) || (kr > 0 && kr < 1) ? 1 : 0.2);
    s.c.userData.lid.rotation.z = -1.5 * E.back(u(t, tc - 0.5, tc - 0.1));
    s.p2.position.set(0.95, 0, 1.15); s.p2.rotation.y = Math.PI * 0.8; bob(s.p2, t, 2, 0.5);
    s.p2.userData.arms.forEach((ar, j) => { ar.rotation.x = -1.3 - 0.8 * Math.max(0, Math.sin((t - tc) * 9 + j)) * (t > tc - 0.2 && t < tc + 0.9); });
    s.items.forEach((it, i) => {
      const t0 = tc - 0.1 + i * 0.25, k = u(t, t0, t0 + 0.45), f = s.fly[i];
      it.visible = k <= 0; f.visible = k > 0;
      const from = new THREE.Vector3(-0.55 + 0.15 * i - 0.1, 0.7, 0.95), to = new THREE.Vector3(0.3 + 0.32 * i, 0.72, -0.05);
      f.position.lerpVectors(from, to, E.io2(k)); f.position.y += 1.0 * Math.sin(Math.PI * k); f.rotation.y = k * 3;
    });
  });

  // 6 · la pièce de 1 € sort du caddie : « Gardez-la, les jeunes. » À chaque fois.
  scn((t, a) => ({ p: [0.5 + 0.3 * Math.sin((t - a) * 0.6), 3.6, 5.0], q: [-0.2, 1.7, 0], f: 32 }), (g) => {
    parking(g, 70, 70, '#a4a8b0'); const cr = cart(g); cr.rotation.y = -0.6;
    const e1 = euro(g); const es = [0, 1, 2, 3, 4].map(() => euro(g));
    const gl = sprite(glowTex, 1.4); g.add(gl);
    return { cr, e1, es, gl };
  }, (t, a, b, s) => {
    const tp = K('pièce', a), k = E.o3(u(t, tp - 0.1, tp + 0.5));
    s.e1.position.set(lerp(-0.41, -0.15, k), lerp(1.6, 1.95, k) + 0.05 * Math.sin(t * 3), lerp(-0.28, 0.4, k)); s.e1.rotation.set(0, (t - a) * 3, 0); s.e1.visible = t > tp - 0.1;
    s.gl.position.copy(s.e1.position); s.gl.visible = s.e1.visible; s.gl.material.opacity = 0.6;
    const tf = K('À chaque fois.', a);
    s.es.forEach((e, i) => { const kk = E.back(u(t, tf - 0.1 + i * 0.08, tf + 0.2 + i * 0.08)); show(e, 0.7 * kk); const ang = i / 5 * TAU + (t - a) * 1.5; e.position.set(-0.15 + Math.cos(ang) * 0.5, 1.95 + Math.sin(ang) * 0.24, 0.4 + Math.sin(ang) * 0.2); e.rotation.y = t * 4 + i; });
  });

  // 7 · un client toutes les 12 minutes, de 10 h à 18 h : le parking s'agite
  scn((t, a, b) => ({ p: [lerp(-1, 1, u(t, a, b)), 8.5, 12.5], q: [0, 0, -1.2] }), (g) => {
    parking(g, 34, 26); const st = store(g); st.position.set(0, 0, -10);
    const cols = ['#ff8a1f', '#2f8cff', '#ffffff', '#e0322b', '#2fbf4a', '#8e5bd8', '#ffd23f'];
    for (let i = 0; i < 7; i++) { const v = car(g, cols[i]); v.position.set(-6 + i * 2, 0, -4.6); v.rotation.y = Math.PI / 2; }
    const mv = [car(g, '#ff4fa8'), car(g, '#00b3a4')];
    const duo = [0, 1].map((i) => { const c = cart(g); const p = person(g, 2 - i * 2, { vest: true, cap: i ? '#2f8cff' : '#ff3b5c', arms: true }); return { c, p }; });
    return { mv, duo };
  }, (t, a, b, s) => {
    s.mv.forEach((v, i) => { const k = ((t - a) * 0.18 + i * 0.5) % 1; v.position.set(lerp(-11, 11, k) * (i ? -1 : 1), 0, -2.0 + i * 1.4); v.rotation.y = i ? Math.PI : 0; });
    s.duo.forEach(({ c, p }, i) => { const ph = (t - a) * 0.9 + i * Math.PI; const x = 1.5 * Math.sin(ph), z = 2.2 + 0.6 * Math.cos(ph * 0.5) + i * 0.5; const dx = Math.cos(ph); c.position.set(x, 0, z); c.rotation.y = dx >= 0 ? 0 : Math.PI; p.position.set(x - 0.85 * Math.sign(dx || 1), 0, z); p.rotation.y = dx >= 0 ? Math.PI / 2 : -Math.PI / 2; bob(p, t, i); });
  });

  // 8 · « 120 ! Je m'achète un caddie en or »
  scn((t, a) => ({ p: [0.6, 1.8, 7.5], q: [0.3, 1.0, 0] }), (g) => {
    const bd = backdrop(g, '#ffd27a', '#fff3c4'); const cr = cart(g, { gold: true });
    const sp = []; for (let i = 0; i < 8; i++) { const s2 = sprite(glowTex, 0.5); g.add(s2); sp.push(s2); }
    return { bd, cr, sp };
  }, (t, a, b, s) => {
    s.bd.rotation.z = (t - a) * 0.12; const tj = K('Je', a), to = K('caddie', a), k = E.o3(u(t, tj - 0.5, tj + 0.4));
    s.cr.position.set(lerp(-6, 0.5, k), 0, 0); s.cr.rotation.set(0, lerp(0, -0.6, k) + 0.15 * Math.sin((t - a) * 1.2), 0);
    s.sp.forEach((q, i) => { const ang = i / 8 * TAU + (t - a) * 1.4; q.position.set(0.5 + Math.cos(ang) * 1.0, 1.0 + Math.sin(ang) * 0.8, 0.6); q.visible = t > to - 0.2; q.scale.setScalar(0.4 + 0.2 * Math.sin(t * 6 + i)); });
  });

  // 9 · « Attends. Vous êtes deux » : 24 pièces (1 pièce = 5 €) en 2 piles de 12, puis − 1 pièce chacun (gilets, pancarte, goûter) → 11 = 55 €
  scn(() => ({ p: [0, 2.0, 7.5], q: [0, 1.0, 0], f: 34 }), (g) => {
    const L = coinStack(g, 12), R = coinStack(g, 12);
    return { L, R };
  }, (t, a, b, s) => {
    const td = K('deux.', a), k = E.io2(u(t, td - 0.2, td + 0.5)), tg = K('goûter:', a);
    s.L.position.x = lerp(-0.37, -0.75, k); s.R.position.x = lerp(0.37, 0.75, k);
    [s.L, s.R].forEach((st, j) => { const top = st.userData.coins[11], kk = u(t, tg + j * 0.1, tg + 0.55 + j * 0.1); top.position.set((j ? 1 : -1) * 1.2 * kk, 0.06 + 11 * 0.115 + 3 * E.i2(kk), 0); top.visible = kk < 1; });
  });

  // 10 · l'astuce de pro : quand il pleut, le parapluie géant
  scn((t, a) => ({ p: [0.2 + 0.2 * Math.sin((t - a) * 0.5), 1.9, 8], q: [-0.2, 1.15, 0], f: 34 }), (g) => {
    storm(g); parking(g);
    const um = umbrella(g); um.scale.setScalar(0.75); const mamie = person(g, 1, { mamie: true, arms: true }); const cr = cart(g); const p1 = person(g, 2, { vest: true, cap: '#ff3b5c', arms: true });
    puddle(g, -1.2, 1.6, 0.6); puddle(g, 1.1, 0.6, 0.5); const rg = grp(g); rg.position.set(0, 0, 1); const rn = rain(rg, 420, 6, 6, 6);
    return { um, mamie, cr, p1, rn };
  }, (t, a, b, s) => {
    s.rn(t); const tu = K('parapluie', a), ku = E.back(u(t, tu - 0.2, tu + 0.25));
    const x = lerp(-0.9, 0.3, u(t, a, b)); s.cr.position.set(x + 0.5, 0, 0.3); s.mamie.position.set(x - 0.4, 0, 0.3); s.mamie.rotation.y = Math.PI / 2; bob(s.mamie, t, 0, 0.6);
    s.p1.position.set(x - 0.4, 0, -0.55); s.p1.rotation.y = Math.PI / 2; bob(s.p1, t, 1, 0.6);
    show(s.um, 0.75 * ku); s.um.position.set(x - 0.1, 0.3, -0.1); s.um.rotation.z = 0.08 * Math.sin(t * 2);
  });

  // 11 · personne ne veut courir sous la pluie : les pourboires doublent (3 pièces au soleil, 6 sous la pluie)
  scn(() => ({ p: [0, 2.0, 7.5], q: [0, 0.85, 0], f: 34 }), (g) => {
    const rg = grp(g); rg.position.set(0.8, 0, 0); const rn = rain(rg, 170, 1.7, 3.6, 2, '#3f6fae');
    const L = coinStack(g, 3); L.position.set(-0.75, 0, 0); const R = coinStack(g, 6); R.position.set(0.75, 0, 0);
    const um = umbrella(g); um.scale.setScalar(0.42); um.position.set(0.75, 0.75, -0.1);
    const sun = sprite(sunTex, 1.3); sun.position.set(-0.75, 2.2, -0.5); g.add(sun);
    return { rn, R, sun };
  }, (t, a, b, s) => {
    s.rn(t); const td = K('Les pourboires', a);
    s.R.userData.coins.forEach((c, i) => { if (i < 3) return; const y0 = 0.06 + i * 0.115, k = E.o3(u(t, td - 0.15 + (i - 3) * 0.1, td + 0.1 + (i - 3) * 0.1)); c.visible = k > 0.01; c.position.y = y0 + (1 - k) * 2; });
    s.sun.material.rotation = (t - a) * 0.5; s.sun.scale.setScalar(1.3 + 0.06 * Math.sin(t * 4));
  });

  // 12 · « Votre meilleur commercial ? Le pack d'eau de 9 kilos. »
  scn((t, a) => ({ p: [0.1 + 0.25 * Math.sin((t - a) * 0.6), 1.2, 4.6], q: [0.1, 0.55, 0] }), (g) => {
    parking(g); const wp = waterPack(g); wp.scale.setScalar(2.2); wp.position.x = 0.1;
    for (const s of [-1, 1]) { add(wp, new THREE.SphereGeometry(0.05, 14, 10), glossy('#ffffff', { r: 0.2 })).position.set(s * 0.07, 0.33, 0.17); add(wp, new THREE.SphereGeometry(0.025, 10, 8), new THREE.MeshBasicMaterial({ color: '#111' })).position.set(s * 0.07, 0.335, 0.215); }
    const tie = grp(wp); tie.position.set(0, 0.24, 0.17); add(tie, new THREE.ConeGeometry(0.025, 0.04, 4), glossy('#e0322b')).rotation.x = Math.PI; const tb = add(tie, new THREE.ConeGeometry(0.035, 0.16, 4), glossy('#e0322b')); tb.position.y = -0.1; tb.rotation.x = Math.PI;
    const bd = tag(wp, 'TOP VENDEUR', '#2f8cff', 1.8); bd.scale.setScalar(0.12); bd.position.set(0.125, 0.13, 0.175);
    const sp = []; for (let i = 0; i < 6; i++) { const s2 = sprite(glowTex, 0.35, 0.7); g.add(s2); sp.push(s2); }
    return { wp, tie, bd, sp };
  }, (t, a, b, s) => {
    const tk = K('Le pack', a); s.wp.rotation.y = 0.22 * Math.sin((t - a) * 1.3); s.wp.position.y = 0.04 * Math.abs(Math.sin(t * 6));
    show(s.tie, E.back(u(t, a + 0.3, a + 0.6))); show(s.bd, 0.12 * E.back(u(t, tk, tk + 0.3)));
    s.sp.forEach((q, i) => { const ang = i / 6 * TAU + (t - a) * 1.4; q.position.set(0.1 + Math.cos(ang) * 0.75, 0.55 + Math.sin(ang * 2) * 0.35, Math.sin(ang) * 0.5); q.visible = t > tk - 0.2; q.scale.setScalar(0.3 + 0.12 * Math.sin(t * 6 + i)); });
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
    const f = c.f || 28; if (camera.fov !== f) { camera.fov = f; camera.updateProjectionMatrix(); }
    camera.position.set(c.p[0], c.p[1], c.p[2] * (1 + 0.08 * punch)); camera.lookAt(c.q[0], c.q[1], c.q[2]);
    renderer.render(scene, camera);
  }
  return { renderAt, renderer, scene, camera };
}
