// Monde 3D de « Combien ça rapporte une maison hantée pour Halloween ? » : maison hantée sous la lune, fantôme qui fonce
// sur l'écran, citrouilles-lanternes, chauves-souris, brume, zombies, visiteurs en file d'attente, pass VIP doré,
// photo du cri, pièces d'or. Tout est une fonction pure du temps t ; les plans suivent window.MCDO.starts.
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
  const fogTex = radial([[0, 'rgba(235,225,255,0.75)'], [0.5, 'rgba(220,210,250,0.35)'], [1, 'rgba(220,210,250,0)']]);
  const flashTex = radial([[0, 'rgba(255,255,255,1)'], [0.35, 'rgba(255,255,255,0.8)'], [1, 'rgba(255,255,255,0)']]);
  const blobTex = radial([[0, 'rgba(20,10,30,0.55)'], [0.5, 'rgba(20,10,30,0.25)'], [1, 'rgba(20,10,30,0)']]);
  const moonTex = tex(512, 512, (c) => {
    const g = c.createRadialGradient(256, 256, 120, 256, 256, 256); g.addColorStop(0, 'rgba(255,240,190,0.55)'); g.addColorStop(1, 'rgba(255,240,190,0)'); c.fillStyle = g; c.fillRect(0, 0, 512, 512);
    c.fillStyle = '#fff3c4'; c.beginPath(); c.arc(256, 256, 150, 0, TAU); c.fill();
    c.fillStyle = 'rgba(214,196,140,0.55)'; [[200, 210, 30], [300, 290, 40], [230, 320, 18], [320, 200, 16]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); });
  });
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
  function coin(parent) { return add(parent, new THREE.CylinderGeometry(0.36, 0.36, 0.11, 40), GOLD); }
  function coinStack(parent, n) {
    const g = grp(parent), coins = [];
    for (let i = 0; i < n; i++) { const c = coin(g); c.position.y = 0.06 + i * 0.115; c.rotation.y = i * 0.7; coins.push(c); }
    shadow(g, 0, 0, 1.2, 1.0);
    g.userData.coins = coins; return g;
  }
  // brume : grands sprites pâles qui glissent au ras du sol
  function fog(parent, n, w, d, seed = 5) {
    const r = rnd(seed), sp = [];
    for (let i = 0; i < n; i++) { const s = sprite(fogTex, 2.4 + r() * 1.6, 0.3); s.userData = { x: (r() - 0.5) * w, z: (r() - 0.5) * d, v: 0.15 + r() * 0.2, p: r() * TAU }; parent.add(s); sp.push(s); }
    return (t) => sp.forEach((s) => { const q = s.userData; s.position.set(((q.x + t * q.v + w / 2) % w) - w / 2, 0.35 + 0.08 * Math.sin(t + q.p), q.z); });
  }

  // ---------------------------------------------------------------- citrouille (lanterne en option)
  const PUMP = glossy('#ff8a1f', { r: 0.4, cc: 0.4 }), STEM = new THREE.MeshStandardMaterial({ color: '#5b7a2a', roughness: 0.8 });
  const FACE = new THREE.MeshBasicMaterial({ color: '#ffd23f', toneMapped: false, side: THREE.DoubleSide });
  const faceGeo = (() => {
    const shapes = [];
    for (const sx of [-1, 1]) { const s = new THREE.Shape(); s.moveTo(sx * 0.08, 0.05); s.lineTo(sx * 0.26, 0.05); s.lineTo(sx * 0.17, 0.22); s.closePath(); shapes.push(s); }
    const m = new THREE.Shape(); m.moveTo(-0.3, -0.06);
    [[-0.2, -0.12], [-0.14, -0.06], [-0.06, -0.14], [0.02, -0.06], [0.1, -0.14], [0.18, -0.06], [0.3, -0.06], [0.2, -0.26], [-0.2, -0.26]].forEach(([x, y]) => m.lineTo(x, y)); m.closePath(); shapes.push(m);
    return new THREE.ShapeGeometry(shapes);
  })();
  function pumpkin(parent, o = {}) {
    const g = grp(parent), body = grp(g);
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, lobe = add(body, new THREE.SphereGeometry(0.5, 22, 16), PUMP); lobe.scale.set(0.5, 0.78, 0.66); lobe.position.set(Math.cos(a) * 0.24, 0.4, Math.sin(a) * 0.24); lobe.rotation.y = -a; }
    const st = add(g, new THREE.CylinderGeometry(0.05, 0.07, 0.24, 10), STEM); st.position.set(0.02, 0.86, 0); st.rotation.z = -0.25;
    if (o.lantern) { const f = add(g, faceGeo, FACE); f.position.set(0, 0.42, 0.56); const gl = sprite(glowTex, 1.5, 0.75); gl.position.set(0, 0.45, 0.4); g.add(gl); }
    shadow(g, 0, 0, 1.3, 1.1);
    return g;
  }
  // chauve-souris : corps + deux ailes qui battent
  const BAT = new THREE.MeshStandardMaterial({ color: '#1b1226', roughness: 0.6, side: THREE.DoubleSide });
  const wingGeo = (() => { const s = new THREE.Shape(); s.moveTo(0, 0.05); s.quadraticCurveTo(0.3, 0.28, 0.62, 0.18); s.lineTo(0.5, 0.02); s.lineTo(0.42, 0.08); s.lineTo(0.32, -0.06); s.lineTo(0.22, 0.02); s.lineTo(0.12, -0.08); s.lineTo(0, -0.05); s.closePath(); return new THREE.ShapeGeometry(s); })();
  function bat(parent) {
    const g = grp(parent);
    add(g, new THREE.SphereGeometry(0.11, 14, 10), BAT).scale.set(1, 1.2, 1);
    for (const s of [-1, 1]) add(g, new THREE.ConeGeometry(0.035, 0.09, 6), BAT).position.set(s * 0.05, 0.15, 0);
    for (const s of [-1, 1]) add(g, new THREE.SphereGeometry(0.018, 8, 6), new THREE.MeshBasicMaterial({ color: '#ff3b30' })).position.set(s * 0.04, 0.05, 0.1);
    const wl = grp(g), wr = grp(g); add(wl, wingGeo, BAT).scale.x = -1; add(wr, wingGeo, BAT);
    g.userData.flap = (t) => { const a = 0.9 * Math.sin(t * 16); wl.rotation.y = a; wr.rotation.y = -a; };
    return g;
  }
  const flyBats = (bs, t, cx, cy, rx, ry) => bs.forEach((b, i) => { const ang = t * (0.7 + i * 0.13) + i * 2.1; b.position.set(cx + Math.cos(ang) * rx * (0.6 + 0.2 * (i % 3)), cy + Math.sin(ang * 1.7) * ry, 0.5 + Math.sin(ang) * 1.2); b.rotation.y = Math.sin(ang) * 0.4; b.userData.flap(t + i); });
  // fantôme : tour (lathe) au bas ondulé, yeux et bouche noirs, petits bras
  const ghostGeo = (() => {
    const pts = [[0, 1.62], [0.3, 1.58], [0.5, 1.42], [0.6, 1.15], [0.62, 0.7], [0.66, 0.3], [0.72, 0.02]].map(([x, y]) => new THREE.Vector2(x, y));
    const g = new THREE.LatheGeometry(pts, 56), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y < 0.35) p.setY(i, y + (0.35 - y) / 0.35 * 0.1 * Math.sin(6 * Math.atan2(p.getZ(i), p.getX(i)))); }
    g.computeVertexNormals(); return g;
  })();
  function ghost(parent) {
    const g = grp(parent), WH = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.35, clearcoat: 0.6, emissive: '#d9ccff', emissiveIntensity: 0.25, side: THREE.DoubleSide });
    add(g, ghostGeo, WH);
    const INK = new THREE.MeshBasicMaterial({ color: '#160d22' });
    for (const s of [-1, 1]) { const e = add(g, new THREE.SphereGeometry(0.1, 16, 12), INK); e.scale.set(0.8, 1.25, 0.5); e.position.set(s * 0.2, 1.18, 0.55); }
    const mo = add(g, new THREE.SphereGeometry(0.12, 16, 12), INK); mo.scale.set(0.9, 1.3, 0.5); mo.position.set(0, 0.88, 0.6);
    for (const s of [-1, 1]) { const a = add(g, new THREE.CapsuleGeometry(0.1, 0.3, 4, 10), WH); a.position.set(s * 0.68, 0.85, 0.1); a.rotation.z = s * 1.1; }
    const gl = sprite(fogTex, 3.2, 0.5); gl.position.y = 0.9; g.add(gl);
    return g;
  }
  // personnages (capsule + tête) : visiteurs ou zombies (peau verte, bras tendus)
  const SKIN = ['#f3c39b', '#c98b5e', '#e2ad84', '#8d5a3b'], HAIR = ['#3b2414', '#111111', '#d9a04a', '#6b3a1e'], SHIRT = ['#ff4fa8', '#2f8cff', '#ffb03a', '#2fbf4a', '#ffffff', '#ff3b30'];
  function person(parent, i, zombie) {
    const g = grp(parent), body = grp(g);
    add(body, new THREE.CapsuleGeometry(0.21, 0.34, 6, 18), glossy(zombie ? ['#6b5a8a', '#7a5a3a', '#4a6a7a'][i % 3] : SHIRT[i % 6], { r: 0.45, cc: 0.4 })).position.y = 0.43;
    add(body, new THREE.SphereGeometry(0.2, 24, 18), glossy(zombie ? '#8fd16a' : SKIN[i % 4], { r: 0.55, cc: 0.2 })).position.y = 0.95;
    add(body, new THREE.SphereGeometry(0.212, 24, 12, 0, TAU, 0, Math.PI * 0.42), glossy(zombie ? '#2b2b2b' : HAIR[i % 4], { r: 0.6, cc: 0.2 })).position.y = 0.97;
    for (const s of [-1, 1]) add(body, new THREE.SphereGeometry(zombie ? 0.04 : 0.028, 10, 8), new THREE.MeshBasicMaterial({ color: zombie ? '#ffffff' : '#111111' })).position.set(s * 0.07, 0.97, 0.18);
    if (zombie) for (const s of [-1, 1]) { const a = add(body, new THREE.CapsuleGeometry(0.06, 0.32, 4, 10), glossy('#8fd16a', { r: 0.55, cc: 0.2 })); a.rotation.x = Math.PI / 2; a.position.set(s * 0.16, 0.66, 0.26); }
    shadow(g, 0, 0, 0.7, 0.55);
    g.userData.body = body; return g;
  }
  const bob = (p, t, k) => { p.userData.body.position.y = 0.05 * Math.abs(Math.sin(t * 9 + k)); p.userData.body.rotation.z = 0.07 * Math.sin(t * 4.5 + k); };
  // maison hantée (pivot au sol, façade vers +z)
  const WIN = new THREE.MeshBasicMaterial({ color: '#ffb84a', toneMapped: false });
  function haunted(parent) {
    const g = grp(parent), WALL = new THREE.MeshStandardMaterial({ color: '#5a4b78', roughness: 0.75 }), DARK = new THREE.MeshStandardMaterial({ color: '#2a2140', roughness: 0.7 }), TRIM = new THREE.MeshStandardMaterial({ color: '#1d1530', roughness: 0.6 });
    add(g, new RoundedBoxGeometry(6.4, 0.24, 4.4, 3, 0.07), new THREE.MeshStandardMaterial({ color: '#4d5a3c', roughness: 0.95 })).position.set(0, -0.12, 0.6);
    const f1 = add(g, new RoundedBoxGeometry(3.2, 2.4, 2.2, 2, 0.04), WALL); f1.position.y = 1.2;
    const f2 = add(g, new RoundedBoxGeometry(2.5, 1.6, 2.0, 2, 0.04), WALL); f2.position.set(-0.15, 3.2, 0); f2.rotation.z = -0.04;
    const r1 = add(g, new THREE.ConeGeometry(2.0, 1.6, 4), DARK); r1.position.set(-0.15, 4.75, 0); r1.rotation.y = Math.PI / 4; r1.scale.set(1, 1, 0.82);
    const tw = add(g, new THREE.CylinderGeometry(0.62, 0.66, 4.2, 20), new THREE.MeshStandardMaterial({ color: '#6a5a88', roughness: 0.75 })); tw.position.set(1.85, 2.1, 0.35);
    const tr = add(g, new THREE.ConeGeometry(0.85, 1.7, 20), DARK); tr.position.set(1.85, 5.05, 0.35); tr.rotation.z = 0.08;
    add(g, new THREE.BoxGeometry(3.4, 0.12, 2.4), TRIM).position.set(0, 2.42, 0);
    const wins = [[-0.95, 1.35, 1.105, 0.6, 0.75], [0.55, 1.35, 1.105, 0.6, 0.75], [-0.75, 3.25, 1.01, 0.5, 0.6], [0.4, 3.25, 1.01, 0.5, 0.6], [1.85, 3.3, 0.98, 0.42, 0.62]];
    wins.forEach(([x, y, z, w, h]) => { add(g, new THREE.PlaneGeometry(w + 0.1, h + 0.1), TRIM).position.set(x, y, z - 0.002); add(g, new THREE.PlaneGeometry(w, h), WIN).position.set(x, y, z); add(g, new THREE.PlaneGeometry(0.05, h), TRIM).position.set(x, y, z + 0.002); add(g, new THREE.PlaneGeometry(w, 0.05), TRIM).position.set(x, y + 0.04, z + 0.002); });
    const dshape = new THREE.Shape(); dshape.moveTo(-0.4, 0); dshape.lineTo(0.4, 0); dshape.lineTo(0.4, 0.95); dshape.absarc(0, 0.95, 0.4, 0, Math.PI, false); dshape.closePath();
    add(g, new THREE.ShapeGeometry(dshape), new THREE.MeshStandardMaterial({ color: '#2b1a12', roughness: 0.7 })).position.set(-0.2, 0.02, 1.106);
    add(g, new THREE.BoxGeometry(1.3, 0.12, 0.5), TRIM).position.set(-0.2, 0.06, 1.35);
    const sg = grp(g); sg.position.set(-2.55, 0, 1.9);
    for (const x of [-0.55, 0.55]) add(sg, new THREE.BoxGeometry(0.08, 1.1, 0.08), new THREE.MeshStandardMaterial({ color: '#6b4226', roughness: 0.9 })).position.set(x, 0.55, 0);
    const board = plane(sg, 1.5, 0.42, sign(600, 168, 'MAISON HANTÉE', '#ff8a1f', '#1b1226', 70)); board.position.set(0, 1.0, 0.05); board.rotation.z = 0.06;
    [[1.6, 1.9, true], [2.3, 1.6, false], [-1.4, 1.75, true]].forEach(([x, z, l]) => { const p = pumpkin(g, { lantern: l }); p.position.set(x, 0, z); p.scale.setScalar(0.55); });
    for (const x of [-0.95, 0.55]) { const gl = sprite(glowTex, 1.3, 0.5); gl.position.set(x, 1.35, 1.3); g.add(gl); }
    shadow(g, 0, 0.6, 8, 5.6);
    return g;
  }
  function warehouse(parent) {
    const g = grp(parent);
    const TXW = tex(256, 256, (c) => { c.fillStyle = '#6d6a80'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#585570'; for (let x = 0; x < 256; x += 32) c.fillRect(x, 0, 12, 256); c.fillStyle = 'rgba(120,70,40,0.35)'; c.fillRect(30, 150, 60, 100); c.fillRect(170, 20, 40, 80); });
    TXW.wrapS = TXW.wrapT = THREE.RepeatWrapping; TXW.repeat.set(5, 2);
    add(g, new THREE.BoxGeometry(6, 3, 4), new THREE.MeshStandardMaterial({ map: TXW, roughness: 0.8 })).position.y = 1.5;
    const tri = new THREE.Shape(); tri.moveTo(-3.25, 0); tri.lineTo(3.25, 0); tri.lineTo(0, 1.1); tri.closePath();
    add(g, new THREE.ExtrudeGeometry(tri, { depth: 4.3, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: '#4a4660', roughness: 0.7 })).position.set(0, 3, -2.15);
    add(g, new THREE.PlaneGeometry(2.4, 2.3), new THREE.MeshStandardMaterial({ color: '#3d3a52', roughness: 0.6 })).position.set(-0.9, 1.15, 2.006);
    add(g, new THREE.PlaneGeometry(0.8, 0.5), WIN).position.set(1.6, 2.0, 2.006);
    add(g, new RoundedBoxGeometry(8, 0.2, 5, 2, 0.06), new THREE.MeshStandardMaterial({ color: '#4d5a3c', roughness: 0.95 })).position.set(0, -0.1, 1);
    shadow(g, 0, 0.4, 8, 6);
    return g;
  }
  // pass VIP doré et photo du cri
  function vipPass(parent) {
    const g = grp(parent);
    add(g, new RoundedBoxGeometry(1.9, 0.95, 0.05, 3, 0.08), GOLD);
    const face = tex(760, 380, (c) => {
      const gr = c.createLinearGradient(0, 0, 760, 380); gr.addColorStop(0, '#ffe58a'); gr.addColorStop(0.5, '#f6c445'); gr.addColorStop(1, '#d9a21b'); c.fillStyle = gr; c.beginPath(); c.roundRect(4, 4, 752, 372, 34); c.fill();
      c.setLineDash([16, 12]); c.lineWidth = 6; c.strokeStyle = '#1b1226'; c.beginPath(); c.roundRect(24, 24, 712, 332, 24); c.stroke(); c.setLineDash([]);
      txt(c, 'PASS VIP', 380, 150, 130, '#1b1226'); txt(c, 'SANS ATTENTE', 380, 270, 66, '#7a2fd0');
    });
    for (const s of [1, -1]) { const p = plane(g, 1.84, 0.9, face); p.position.z = s * 0.03; if (s < 0) p.rotation.y = Math.PI; }
    return g;
  }
  function photo(parent) {
    const g = grp(parent);
    add(g, new RoundedBoxGeometry(1.5, 1.8, 0.04, 2, 0.02), glossy('#ffffff', { r: 0.4 }));
    plane(g, 1.3, 1.3, tex(520, 520, (c) => {
      c.fillStyle = '#3a2a5c'; c.fillRect(0, 0, 520, 520);
      [[160, 280, '#f3c39b', '#3b2414'], [360, 290, '#c98b5e', '#111111']].forEach(([x, y, sk, hr]) => {
        c.fillStyle = hr; c.beginPath(); c.arc(x, y - 30, 100, Math.PI, 0); c.fill();
        c.fillStyle = sk; c.beginPath(); c.ellipse(x, y, 92, 110, 0, 0, TAU); c.fill();
        c.fillStyle = '#ffffff'; for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * 34, y - 30, 22, 0, TAU); c.fill(); }
        c.fillStyle = '#111'; for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * 34, y - 30, 8, 0, TAU); c.fill(); }
        c.fillStyle = '#5a1020'; c.beginPath(); c.ellipse(x, y + 50, 30, 46, 0, 0, TAU); c.fill();
        c.fillStyle = sk; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(x + s * 98, y + 30, 26, 44, s * 0.3, 0, TAU); c.fill(); }
      });
      txt(c, 'AAAAH !', 260, 80, 80, '#ffd23f', '#111', 12);
    })).position.set(0, 0.17, 0.025);
    plane(g, 1.3, 0.3, tex(520, 120, (c) => txt(c, 'Maison hantée · 31/10', 260, 60, 46, '#3a2a5c'))).position.set(0, -0.68, 0.025);
    return g;
  }

  // ================================================================ les plans (index = numéro de scène - 1)
  const S = [];
  const scn = (cam, build, up) => { const g = grp(scene); g.visible = false; const st = build(g) || {}; S.push({ g, cam, up: (t, a, b) => up(t, a, b, st) }); };
  const moon = (g, x, y, s) => { const m = sprite(moonTex, s); m.position.set(x, y, -6); g.add(m); return m; };

  // 1 · accroche : « BOUH ! » — le fantôme jaillit de la porte et fonce sur l'écran, puis s'envole
  scn((t, a) => { const sh = 0.18 * Math.exp(-(t - a) * 5) * Math.sin((t - a) * 70); return { p: [0.4 + sh, 3.0 + sh * 0.6, 17], q: [0.1, 2.2, 0] }; }, (g) => {
    moon(g, 2.6, 6.2, 4.2); const hs = haunted(g); const gh = ghost(g);
    const bs = [0, 1, 2, 3, 4].map(() => bat(g)); const fg = fog(g, 7, 9, 3); return { gh, bs, fg };
  }, (t, a, b, s) => {
    const k = E.o3(u(t, a, a + 0.42)), away = E.io2(u(t, a + 0.75, a + 1.5));
    s.gh.position.set(lerp(-0.2, 0.28, k) + lerp(0, -3.5, away), lerp(0.3, 1.41, k) + lerp(0, 5, away), lerp(1.2, 10, k) - lerp(0, 6, away));
    s.gh.scale.setScalar(lerp(0.5, 1.2, k)); s.gh.rotation.set(0.15 * Math.sin(t * 3), 0.2 * Math.sin(t * 2), 0.1 * Math.sin(t * 4)); s.gh.visible = away < 0.99;
    flyBats(s.bs, t - a, 0.3, 3.6, 3.2, 0.8); s.fg(t);
  });

  // 2 · titre : la maison hantée sous la lune
  scn((t, a) => ({ p: [lerp(1.6, -0.4, u(t, a, a + 2.4)), 2.6, 19.5], q: [0.6, 2.4, 0] }), (g) => {
    moon(g, 3.2, 6.6, 4.2); haunted(g); const bs = [0, 1, 2].map(() => bat(g)); const fg = fog(g, 6, 9, 3, 8); return { bs, fg };
  }, (t, a, b, s) => { flyBats(s.bs, t - a + 3, 0.6, 4.4, 3.0, 0.6); s.fg(t); });

  // 3 · le vieil entrepôt pour le mois d'octobre
  scn((t, a) => ({ p: [lerp(5, 2.5, u(t, a, a + 3)), 4.5, 21], q: [0, 1.8, 0] }), (g) => {
    moon(g, -2.8, 6.4, 3.4); warehouse(g); const bs = [0, 1].map(() => bat(g)); return { bs };
  }, (t, a, b, s) => { flyBats(s.bs, t - a, 0.5, 4.3, 3.0, 0.5); });

  // 4 · décors, fumée, citrouilles
  scn((t, a) => ({ p: [0.5 * Math.sin((t - a) * 0.5), 3.0, 12], q: [0, 0.9, 0] }), (g) => {
    const ps = [[-1.7, 0.4, 0.8], [-0.55, -0.3, 1.1], [0.65, 0.2, 1.0], [1.75, -0.4, 0.75], [0.0, -1.3, 0.7]].map(([x, z, s], i) => { const p = pumpkin(g, { lantern: i % 2 === 0 || i === 3 }); p.position.set(x, 0, z); p.userData.s = s; return p; });
    const fg = fog(g, 9, 7, 3, 3); return { ps, fg };
  }, (t, a, b, s) => {
    const tc = K('citrouilles:', a); s.fg(t);
    s.ps.forEach((p, i) => { show(p, p.userData.s * E.back(u(t, tc - 0.4 + i * 0.1, tc - 0.1 + i * 0.1))); p.rotation.y = 0.3 * Math.sin(t * 1.4 + i); });
  });

  // 5 · 10 étudiants déguisés en zombies
  scn((t, a) => ({ p: [0.4 * Math.sin((t - a) * 0.5), 3.2, 12.5], q: [0, 0.8, 0] }), (g) => {
    const zs = []; for (let i = 0; i < 10; i++) { const z = person(g, i, true); z.position.set(-2.2 + (i % 5) * 1.1, 0, -0.9 + Math.floor(i / 5) * 1.2 + (i % 2) * 0.15); zs.push(z); }
    const fg = fog(g, 7, 7, 3, 6); return { zs, fg };
  }, (t, a, b, s) => {
    const t0 = K('10', a); s.fg(t);
    s.zs.forEach((z, i) => { show(z, 1.15 * E.back(u(t, t0 - 0.2 + i * 0.06, t0 + 0.1 + i * 0.06))); bob(z, t, i); z.position.z = (-0.9 + Math.floor(i / 5) * 1.2 + (i % 2) * 0.15) + 0.15 * (t - a); z.rotation.y = 0.15 * Math.sin(t * 1.5 + i); });
  });

  // 6 · 12 soirs, 300 visiteurs par soir : la file entre dans la maison
  scn((t, a) => ({ p: [lerp(-2, 1, u(t, a, a + 4.5)), 6.5, 21], q: [0, 1.6, 0] }), (g) => {
    haunted(g); const vs = []; for (let i = 0; i < 16; i++) vs.push(person(g, i)); return { vs };
  }, (t, a, b, s) => {
    s.vs.forEach((p, i) => {
      const k = ((t - a) * 0.12 + i / 16) % 1, x = lerp(4.5, -0.2, k), z = 4.6 - 3.2 * k + 0.5 * Math.sin(k * 7);
      p.position.set(x, 0, z); p.rotation.y = Math.atan2(-4.7, -3.2); p.visible = k < 0.97; bob(p, t, i);
    });
  });

  // 7 · « 72 000 ! Je m'achète un manoir » : la maison arrive sur fond rayonnant
  scn((t, a) => ({ p: [0.8, 2.6, 22], q: [0.9, 2.4, 0] }), (g) => {
    const bd = backdrop(g, '#ffb347', '#ffe08a'); const hs = haunted(g); return { bd, hs };
  }, (t, a, b, s) => {
    s.bd.rotation.z = (t - a) * 0.12; const tc = K('manoir.', a), k = E.back(u(t, tc - 0.55, tc + 0.1));
    show(s.hs, 0.85 * k); s.hs.position.set(1.4, 0, 0); s.hs.rotation.y = lerp(-1.5, -0.25, k);
  });

  // 8 · « Attends » : 18 pièces (1 pièce = 4 000 €) ; TVA −2, entrepôt −1, décors −1, zombies −2, sécurité −2 → 10
  scn((t, a) => ({ p: [0, 3.0, 12], q: [0, 0.8, 0] }), (g) => {
    const stacks = [0, 1, 2].map((i) => { const st = coinStack(g, 6); st.position.set(-1.1 + i * 1.1, 0, (i % 2) * 0.3); return st; });
    return { coins: stacks.flatMap((st) => st.userData.coins).sort((p, q) => q.position.y - p.position.y) };
  }, (t, a, b, s) => {
    const cuts = [[K('TVA,', a), 2], [K("l'entrepôt,", a), 1], [K('les décors,', a), 1], [K('les zombies', a), 2], [K('la sécurité:', a), 2]];
    const out = []; cuts.forEach(([tc, m]) => { for (let i = 0; i < m; i++) out.push(tc + i * 0.06); });
    s.coins.forEach((c, i) => {
      const base = c.userData.y0 ?? (c.userData.y0 = c.position.y);
      if (i < out.length && t > out[i]) { const k = u(t, out[i], out[i] + 0.55); c.position.y = base + 4 * E.i2(k); c.position.x = (i % 2 ? 1 : -1) * 2.5 * k; c.visible = k < 1; }
      else { c.position.y = base; c.position.x = 0; c.visible = true; }
    });
  });

  // 9 · l'astuce de pro : la file d'attente, de plus en plus longue
  scn((t, a) => ({ p: [lerp(1.5, -1, u(t, a, a + 4)), 9.5, 18], q: [0, 0.6, 1.4] }), (g) => {
    const hs = haunted(g); hs.position.set(0, 0, -2.2); hs.scale.setScalar(0.8);
    const vs = []; for (let i = 0; i < 34; i++) vs.push(person(g, i));
    const path = new THREE.CatmullRomCurve3([[-0.2, 0, -0.9], [-0.2, 0, 0.6], [2.6, 0, 1.0], [2.6, 0, 2.2], [-2.6, 0, 2.4], [-2.6, 0, 3.6], [2.8, 0, 3.9], [3.2, 0, 5.2]].map((q) => new THREE.Vector3(...q)));
    return { vs, path };
  }, (t, a, b, s) => {
    const n = Math.round(lerp(10, 34, E.io2(u(t, a + 0.2, K('rapporte.', a)))));
    s.vs.forEach((p, i) => {
      const k = i / 34; const q = s.path.getPointAt(Math.min(0.999, Math.max(0.001, k + 0.003 * Math.sin(t * 2 + i)))), q2 = s.path.getPointAt(Math.max(0, k - 0.01));
      p.position.copy(q); p.rotation.y = Math.atan2(q2.x - q.x, q2.z - q.z); p.visible = i < n; bob(p, t, i);
    });
  });

  // 10 · le pass VIP sans attente à 10 €
  scn((t, a) => ({ p: [0.4 * Math.sin((t - a) * 0.5), 1.4, 9], q: [0, 1.3, 0] }), (g) => {
    const vp = vipPass(g); const tg = tag(g, '10 €', '#22874a'); const gl = sprite(glowTex, 4, 0.7); gl.position.set(0, 1.3, -0.6); g.add(gl);
    const sp = []; for (let i = 0; i < 7; i++) { const s2 = sprite(glowTex, 0.5); g.add(s2); sp.push(s2); }
    return { vp, tg, sp };
  }, (t, a, b, s) => {
    const k = E.back(u(t, a, a + 0.5)); show(s.vp, k); s.vp.position.set(0, 1.35 + 0.06 * Math.sin(t * 2.5), 0); s.vp.rotation.set(0.15 * Math.sin(t * 1.3), (1 - E.o3(u(t, a, a + 1.2))) * TAU + 0.35 * Math.sin((t - a) * 1.4), 0);
    show(s.tg, E.back(u(t, K('10 euros.', a) - 0.1, K('10 euros.', a) + 0.25))); s.tg.position.set(0.7, 2.05, 0.4); s.tg.rotation.z = 0.2 * Math.sin(t * 3);
    s.sp.forEach((q, i) => { const ang = i / 7 * TAU + (t - a) * 1.2; q.position.set(Math.cos(ang) * 1.3, 1.35 + Math.sin(ang) * 0.9, 0.3); q.scale.setScalar(0.4 + 0.2 * Math.sin(t * 6 + i)); });
  });

  // 11 · à la sortie, la photo de ton cri (flash)
  scn((t, a) => ({ p: [0.4 * Math.sin((t - a) * 0.5), 1.4, 9.5], q: [0, 1.25, 0] }), (g) => {
    const ph = photo(g); const tg = tag(g, '8 €', '#22874a'); const fl = sprite(flashTex, 9, 1); fl.position.set(0, 1.3, 2); g.add(fl);
    return { ph, tg, fl };
  }, (t, a, b, s) => {
    const tp = K('photo', a), k = E.back(u(t, tp - 0.1, tp + 0.35));
    show(s.ph, k); s.ph.position.set(0, 1.3 + 0.05 * Math.sin(t * 2.2), 0); s.ph.rotation.set(0, 0.25 * Math.sin((t - a) * 0.9), -0.06 + 0.04 * Math.sin(t * 1.7));
    const f = u(t, tp - 0.05, tp + 0.35); s.fl.visible = f > 0 && f < 1; s.fl.material.opacity = 1 - f;
    show(s.tg, E.back(u(t, K('8 euros.', a) - 0.1, K('8 euros.', a) + 0.25))); s.tg.position.set(0.85, 2.25, 0.4); s.tg.rotation.z = 0.2 * Math.sin(t * 3);
  });

  // 12 · « Le vrai monstre de la maison hantée ? C'est la file d'attente. »
  scn((t, a) => ({ p: [0.5 * Math.sin((t - a) * 0.4), 3.4, 13], q: [0.4, 1.2, 0] }), (g) => {
    const vs = []; for (let i = 0; i < 9; i++) { const p = person(g, i + 3); p.position.set(-2.6 + i * 0.75, 0, 0.4 - (i % 2) * 0.2); p.rotation.y = Math.PI / 2; vs.push(p); }
    const gh = ghost(g); gh.scale.setScalar(0.7); return { vs, gh };
  }, (t, a, b, s) => {
    s.vs.forEach((p, i) => bob(p, t * 0.4, i));
    s.gh.position.set(0.8 + 0.5 * Math.sin((t - a) * 1.2), 2.2 + 0.2 * Math.sin(t * 2), -0.6); s.gh.rotation.y = 0.3 * Math.sin(t);
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
    camera.position.set(c.p[0], c.p[1], c.p[2] * (1 + 0.08 * punch)); camera.lookAt(c.q[0], c.q[1], c.q[2]);
    renderer.render(scene, camera);
  }
  return { renderAt, renderer, scene, camera };
}
