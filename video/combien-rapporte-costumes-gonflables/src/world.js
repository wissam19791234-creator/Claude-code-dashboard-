// Monde 3D de « Combien ça rapporte de louer des costumes gonflables ? » : T-Rex gonflable (jean et baskets dessous) qui se
// gonfle et danse, fantôme et citrouille gonflables, boule à facettes, vrai dinosaure, pièces, placard, accessoires de fête.
// Tout est une fonction pure du temps t ; les plans suivent window.MCDO.starts.
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
  const blobTex = radial([[0, 'rgba(20,10,30,0.55)'], [0.5, 'rgba(20,10,30,0.25)'], [1, 'rgba(20,10,30,0)']]);
  const spotTex = (col) => radial([[0, col], [0.5, col.replace(/[\d.]+\)$/, '0.35)')], [1, col.replace(/[\d.]+\)$/, '0)')]]);
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
  const floor = (parent, w, d, col) => add(parent, new RoundedBoxGeometry(w, 0.24, d, 3, 0.07), new THREE.MeshStandardMaterial({ color: col || '#3a2a5c', roughness: 0.8 })).position.y = -0.12;

  // ---------------------------------------------------------------- jambes humaines (jean + baskets) sous les costumes
  const JEAN = glossy('#3b5ba5', { r: 0.6, cc: 0.2 }), SHOE = glossy('#ffffff', { r: 0.35 }), SOLE = new THREE.MeshStandardMaterial({ color: '#ff3b5c', roughness: 0.6 });
  function legs(parent) {
    const ls = [-1, 1].map((s) => {
      const l = grp(parent); l.position.set(s * 0.2, 0.95, 0);
      add(l, new THREE.CapsuleGeometry(0.12, 0.62, 6, 14), JEAN).position.y = -0.45;
      const sh = add(l, new RoundedBoxGeometry(0.26, 0.16, 0.42, 2, 0.06), SHOE); sh.position.set(0, -0.9, 0.08);
      add(l, new THREE.BoxGeometry(0.27, 0.04, 0.43), SOLE).position.set(0, -0.97, 0.08);
      return l;
    });
    return ls;
  }
  // T-Rex gonflable ; o.real = vrai dinosaure (pattes de dino au lieu du jean)
  function trex(parent, o = {}) {
    const g = grp(parent), GR = glossy(o.col || '#5cc85a', { r: 0.16, cc: 1, ccr: 0.04 }), BELLY = glossy('#d4f59a', { r: 0.2, cc: 1 }), DK = glossy('#3f9a43', { r: 0.25 });
    const INK = new THREE.MeshBasicMaterial({ color: '#111111' }), WH = glossy('#ffffff', { r: 0.2 });
    const lg = o.real ? [-1, 1].map((s) => { const l = grp(g); l.position.set(s * 0.32, 0.95, 0); add(l, new THREE.CapsuleGeometry(0.24, 0.55, 8, 16), GR).position.y = -0.45; const f = add(l, new THREE.SphereGeometry(0.28, 16, 12), GR); f.scale.set(1, 0.45, 1.5); f.position.set(0, -0.92, 0.12); return l; }) : legs(g);
    const body = grp(g); body.position.y = 0.95;
    const torso = add(body, new THREE.CapsuleGeometry(0.62, 0.72, 10, 24), GR); torso.position.y = 0.55; torso.rotation.x = -0.2;
    const bl = add(body, new THREE.SphereGeometry(0.5, 20, 14), BELLY); bl.scale.set(0.85, 1.1, 0.42); bl.position.set(0, 0.45, 0.42);
    const tail = add(body, new THREE.ConeGeometry(0.42, 1.5, 22), GR); tail.rotation.x = -Math.PI / 2 - 0.45; tail.position.set(0, 0.15, -0.95);
    for (let i = 0; i < 5; i++) { const sp = add(body, new THREE.ConeGeometry(0.09, 0.2, 10), DK); sp.position.set(0, 1.25 - i * 0.28, -0.42 - i * 0.12); sp.rotation.x = -0.6 - i * 0.12; }
    const head = grp(body); head.position.set(0, 1.42, 0.3);
    const sk = add(head, new THREE.CapsuleGeometry(0.36, 0.75, 8, 20), GR); sk.rotation.x = Math.PI / 2; sk.scale.set(1.05, 1, 0.9); sk.position.z = 0.34;
    const jaw = add(head, new THREE.CapsuleGeometry(0.25, 0.62, 8, 16), BELLY); jaw.rotation.x = Math.PI / 2; jaw.position.set(0, -0.24, 0.36);
    for (let i = 0; i < 9; i++) { const a = (i / 8 - 0.5) * 2.4; const tt = add(head, new THREE.ConeGeometry(0.05, 0.14, 6), WH); tt.rotation.x = Math.PI; tt.position.set(Math.sin(a) * 0.29, -0.1, 0.5 + Math.cos(a) * 0.42); }
    for (const s of [-1, 1]) { add(head, new THREE.SphereGeometry(0.11, 16, 12), WH).position.set(s * 0.27, 0.24, 0.18); add(head, new THREE.SphereGeometry(0.055, 12, 10), INK).position.set(s * 0.31, 0.25, 0.27); add(head, new THREE.SphereGeometry(0.025, 8, 6), INK).position.set(s * 0.1, 0.1, 1.05); }
    const arms = [-1, 1].map((s) => { const a = grp(body); a.position.set(s * 0.45, 0.85, 0.42); const c = add(a, new THREE.CapsuleGeometry(0.075, 0.18, 6, 10), GR); c.position.y = -0.12; a.rotation.x = -0.9; return a; });
    shadow(g, 0, 0, 1.8, 1.5);
    g.userData = { body, head, arms, legs: lg, tail };
    return g;
  }
  // fantôme gonflable (au-dessus du jean)
  const ghostGeo = (() => {
    const pts = [[0, 1.62], [0.3, 1.58], [0.5, 1.42], [0.6, 1.15], [0.62, 0.7], [0.66, 0.3], [0.72, 0.02]].map(([x, y]) => new THREE.Vector2(x, y));
    const g = new THREE.LatheGeometry(pts, 56), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y < 0.35) p.setY(i, y + (0.35 - y) / 0.35 * 0.1 * Math.sin(6 * Math.atan2(p.getZ(i), p.getX(i)))); }
    g.computeVertexNormals(); return g;
  })();
  function ghostSuit(parent) {
    const g = grp(parent), lg = legs(g), body = grp(g); body.position.y = 0.75;
    add(body, ghostGeo, new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.2, clearcoat: 1, side: THREE.DoubleSide })).scale.set(1.15, 1.25, 1.15);
    const INK = new THREE.MeshBasicMaterial({ color: '#160d22' });
    for (const s of [-1, 1]) { const e = add(body, new THREE.SphereGeometry(0.11, 16, 12), INK); e.scale.set(0.8, 1.25, 0.5); e.position.set(s * 0.22, 1.5, 0.63); }
    const mo = add(body, new THREE.SphereGeometry(0.13, 16, 12), INK); mo.scale.set(0.9, 1.3, 0.5); mo.position.set(0, 1.15, 0.7);
    const arms = [-1, 1].map((s) => { const a = grp(body); a.position.set(s * 0.72, 1.1, 0.1); const c = add(a, new THREE.CapsuleGeometry(0.12, 0.32, 6, 12), new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.2, clearcoat: 1 })); c.position.y = -0.2; a.rotation.z = s * 0.9; return a; });
    shadow(g, 0, 0, 1.6, 1.3);
    g.userData = { body, head: body, arms, legs: lg, tail: null };
    return g;
  }
  // citrouille gonflable (avec visage noir)
  const PUMP = glossy('#ff8a1f', { r: 0.18, cc: 1 }), lobeGeo = new THREE.SphereGeometry(0.5, 22, 16);
  const faceGeo = (() => {
    const shapes = [];
    for (const sx of [-1, 1]) { const s = new THREE.Shape(); s.moveTo(sx * 0.08, 0.05); s.lineTo(sx * 0.26, 0.05); s.lineTo(sx * 0.17, 0.22); s.closePath(); shapes.push(s); }
    const m = new THREE.Shape(); m.moveTo(-0.3, -0.06);
    [[-0.2, -0.12], [-0.14, -0.06], [-0.06, -0.14], [0.02, -0.06], [0.1, -0.14], [0.18, -0.06], [0.3, -0.06], [0.2, -0.26], [-0.2, -0.26]].forEach(([x, y]) => m.lineTo(x, y)); m.closePath(); shapes.push(m);
    return new THREE.ShapeGeometry(shapes);
  })();
  function pumpkinSuit(parent) {
    const g = grp(parent), lg = legs(g), body = grp(g); body.position.y = 0.85;
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, lobe = add(body, lobeGeo, PUMP); lobe.scale.set(1.0, 1.55, 1.3); lobe.position.set(Math.cos(a) * 0.48, 0.75, Math.sin(a) * 0.48); lobe.rotation.y = -a; }
    const st = add(body, new THREE.CylinderGeometry(0.08, 0.11, 0.3, 10), new THREE.MeshStandardMaterial({ color: '#5b7a2a' })); st.position.y = 1.6;
    const f = add(body, faceGeo, new THREE.MeshBasicMaterial({ color: '#1b1226', side: THREE.DoubleSide })); f.scale.setScalar(1.6); f.position.set(0, 0.85, 1.12);
    const arms = [-1, 1].map((s) => { const a = grp(body); a.position.set(s * 1.0, 0.85, 0); const c = add(a, new THREE.CapsuleGeometry(0.1, 0.3, 6, 12), PUMP); c.position.y = -0.2; a.rotation.z = s * 0.7; return a; });
    shadow(g, 0, 0, 2.0, 1.6);
    g.userData = { body, head: body, arms, legs: lg, tail: null };
    return g;
  }
  // danse : balancement, petits sauts, jambes et bras qui battent, effet « gonflable » (ça tremblote)
  const dance = (c, t, ph = 0, amp = 1) => {
    const d = c.userData, w = t * 6.5 + ph;
    d.body.rotation.z = 0.14 * amp * Math.sin(w); d.body.position.y = (d.body.userData.y0 ?? (d.body.userData.y0 = d.body.position.y)) + 0.07 * amp * Math.abs(Math.sin(w));
    const inf = d.body.userData.inf || [1, 1]; d.body.userData.inf = null;
    d.body.scale.y = inf[1] * (1 + 0.03 * amp * Math.sin(w * 2)); d.body.scale.x = d.body.scale.z = inf[0] * (1 - 0.015 * amp * Math.sin(w * 2));
    if (d.head !== d.body) d.head.rotation.set(0.12 * amp * Math.sin(w * 2), 0.25 * amp * Math.sin(w * 0.5), 0);
    d.arms.forEach((a, i) => { a.rotation.x = (d.head === d.body ? 0 : -0.9) + 0.5 * amp * Math.sin(w * 2 + i * Math.PI); });
    d.legs.forEach((l, i) => { l.rotation.x = 0.35 * amp * Math.sin(w + i * Math.PI); });
    if (d.tail) d.tail.rotation.z = 0.3 * amp * Math.sin(w);
  };
  // gonflage : le costume part d'une galette au sol
  const inflate = (c, k) => { const b = c.userData.body, kk = Math.max(0, Math.min(1, k)), e = E.o3(kk) + (kk > 0.6 ? 0.12 * Math.sin((kk - 0.6) * 30) * (1 - kk) * 2.5 : 0); const sy = Math.max(0.04, e), sx = 1 + 0.6 * (1 - Math.min(1, e)); b.userData.inf = [sx, sy]; b.scale.set(sx, sy, sx); };
  // boule à facettes + spots colorés
  function disco(parent) {
    const g = grp(parent);
    add(g, new THREE.CylinderGeometry(0.01, 0.01, 1.5, 6), new THREE.MeshBasicMaterial({ color: '#cccccc' })).position.y = 0.75;
    const ball = add(g, new THREE.IcosahedronGeometry(0.45, 2), new THREE.MeshStandardMaterial({ color: '#e8eef8', metalness: 1, roughness: 0.12, flatShading: true }));
    const cols = ['rgba(255,79,168,1)', 'rgba(77,162,255,1)', 'rgba(255,214,63,1)', 'rgba(47,191,74,1)'].map(spotTex);
    const spots = cols.map((m) => { const s = sprite(m, 2.6, 0.55); g.add(s); return s; });
    g.userData = { ball, spots }; return g;
  }
  // placard à deux portes
  function wardrobe(parent) {
    const g = grp(parent), WD = new THREE.MeshStandardMaterial({ color: '#8a5a36', roughness: 0.6 }), DK = new THREE.MeshStandardMaterial({ color: '#1b1226', roughness: 0.9 });
    add(g, new RoundedBoxGeometry(2.4, 3.2, 1.2, 2, 0.05), WD).position.set(0, 1.6, -0.62);
    add(g, new THREE.PlaneGeometry(2.2, 3.0), DK).position.set(0, 1.6, -0.01);
    const doors = [-1, 1].map((s) => { const d = grp(g); d.position.set(s * 1.1, 1.6, 0.02); const p = add(d, new RoundedBoxGeometry(1.1, 3.0, 0.08, 2, 0.03), WD); p.position.x = -s * 0.55; add(d, new THREE.SphereGeometry(0.05, 12, 8), GOLD).position.set(-s * 0.98, 0, 0.06); return d; });
    shadow(g, 0, 0, 3, 1.8);
    g.userData.doors = doors; return g;
  }
  // accessoires : écharpe « FUTUR MARIÉ », chapeau pointu + ballons, confettis, cravate
  function partyHat(parent) {
    const g = grp(parent);
    add(g, new THREE.ConeGeometry(0.2, 0.5, 24), new THREE.MeshStandardMaterial({ roughness: 0.5, map: tex(128, 128, (c) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ff4fa8' : '#ffd23f'; c.fillRect(i * 16, 0, 16, 128); } }) })).position.y = 0.25;
    add(g, new THREE.SphereGeometry(0.07, 12, 8), glossy('#2f8cff')).position.y = 0.52;
    return g;
  }
  function balloons(parent) {
    const g = grp(parent);
    ['#ff3b5c', '#2f8cff', '#ffd23f'].forEach((col, i) => { const b = add(g, new THREE.SphereGeometry(0.28, 20, 16), glossy(col, { r: 0.15 })); b.scale.y = 1.2; b.position.set(-0.35 + i * 0.35, 1.2 + (i % 2) * 0.25, 0); const s = add(g, new THREE.CylinderGeometry(0.006, 0.006, 1.2, 4), new THREE.MeshBasicMaterial({ color: '#dddddd' })); s.position.set(-0.35 + i * 0.35, 0.5 + (i % 2) * 0.12, 0); s.rotation.z = (1 - i) * 0.25; });
    return g;
  }
  function confetti(parent, n) {
    const r = rnd(33), cs = [], cols = ['#ff4fa8', '#2f8cff', '#ffd23f', '#2fbf4a', '#ffffff'].map((c) => new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
    for (let i = 0; i < n; i++) { const m = add(parent, new THREE.PlaneGeometry(0.08, 0.14), cols[i % 5]); m.userData = { x: (r() - 0.5) * 5, z: (r() - 0.5) * 2 + 0.5, y: r() * 4, v: 0.6 + r() * 0.6, s: r() * 9 }; cs.push(m); }
    return (t, on) => cs.forEach((m) => { const q = m.userData; m.visible = on; m.position.set(q.x + 0.2 * Math.sin(t + q.s), 4 - ((t * q.v + q.y) % 4.2), q.z); m.rotation.set(t * 3 + q.s, t * 2 + q.s, 0); });
  }

  // ================================================================ les plans (index = numéro de scène - 1)
  const S = [];
  const scn = (cam, build, up) => { const g = grp(scene); g.visible = false; const st = build(g) || {}; S.push({ g, cam, up: (t, a, b) => up(t, a, b, st) }); };

  // 1 · accroche : le T-Rex se gonfle d'un coup (PFFFT) puis danse ; étiquette « 40 € »
  scn((t, a) => ({ p: [0.3 + 0.4 * Math.sin((t - a) * 0.5), 2.0, 9.5], q: [0, 1.85, 0] }), (g) => {
    floor(g, 7, 5); const tr = trex(g); const tg = tag(g, '40 €', '#ff3b30'); const ds = disco(g); ds.position.set(1.9, 3.6, -1.2);
    return { tr, tg, ds };
  }, (t, a, b, s) => {
    inflate(s.tr, u(t, a, a + 0.55)); dance(s.tr, t, 0, u(t, a + 0.55, a + 0.9));
    s.tr.rotation.y = -0.6 + 0.2 * Math.sin((t - a) * 0.8);
    const t40 = K('40 euros…', a); show(s.tg, 0.9 * E.back(u(t, t40 - 0.1, t40 + 0.25))); s.tg.position.set(0.7, 2.3, 0.7); s.tg.rotation.z = 0.2 * Math.sin(t * 3);
    s.ds.userData.ball.rotation.y = t * 1.5; s.ds.userData.spots.forEach((sp, i) => { const an = t * 0.9 + i * 1.6; sp.position.set(-1.9 + Math.cos(an) * 1.6, -2.4 + Math.sin(an * 1.3) * 1.2, 0.2); });
  });

  // 2 · titre : T-Rex, fantôme et citrouille dansent
  scn((t, a) => ({ p: [lerp(-0.8, 0.8, u(t, a, a + 2.4)), 2.0, 11.5], q: [0.4, 1.4, 0] }), (g) => {
    floor(g, 9, 5); const cs = [trex(g), ghostSuit(g), pumpkinSuit(g)]; [[-0.4, 0], [1.6, -0.6], [-2.2, -0.7]].forEach(([x, z], i) => cs[i].position.set(x, 0, z));
    cs[0].rotation.y = -0.5; cs[1].scale.setScalar(0.9); cs[2].scale.setScalar(0.85); const ds = disco(g); ds.position.set(0.4, 4.1, -1.5);
    return { cs, ds };
  }, (t, a, b, s) => { s.cs.forEach((c, i) => dance(c, t, i * 1.3)); s.ds.userData.ball.rotation.y = t * 1.5; s.ds.userData.spots.forEach((sp, i) => { const an = t * 0.9 + i * 1.6; sp.position.set(Math.cos(an) * 2.2, -2.6 + Math.sin(an * 1.3) * 1.3, 0.2); }); });

  // 3 · 60 costumes à 40 € : la troupe apparaît
  scn((t, a, b) => ({ p: [lerp(-1.2, 1.2, u(t, a, b)), 5.2, 15], q: [0, 1.0, -1.2] }), (g) => {
    floor(g, 10, 7); const cs = [];
    for (let i = 0; i < 15; i++) { const c = [trex, ghostSuit, pumpkinSuit][i % 3](g); c.position.set(-3.2 + (i % 5) * 1.6, 0, -2.8 + Math.floor(i / 5) * 1.6); c.rotation.y = -0.45; c.scale.setScalar(0.62); c.userData.s = 0.62; cs.push(c); }
    return { cs };
  }, (t, a, b, s) => {
    const t0 = K('60', a);
    s.cs.forEach((c, i) => { const k = u(t, t0 - 0.2 + i * 0.07, t0 + 0.25 + i * 0.07); c.visible = k > 0; c.scale.setScalar(c.userData.s); inflate(c, k); dance(c, t, i, 0.6); });
  });

  // 4 · loué 25 € la soirée
  scn((t, a) => ({ p: [0.3 * Math.sin((t - a) * 0.6), 2.0, 11], q: [0.2, 1.7, 0] }), (g) => {
    floor(g, 7, 5); const tr = trex(g); tr.position.x = 0.35; const tg = tag(g, '25 €', '#22874a'); const ds = disco(g); ds.position.set(-1.4, 3.8, -1.2);
    return { tr, tg, ds };
  }, (t, a, b, s) => {
    dance(s.tr, t, 0.5); s.tr.rotation.y = -0.55 + 0.2 * Math.sin((t - a) * 0.9);
    show(s.tg, E.back(u(t, K('25', a) - 0.1, K('25', a) + 0.25))); s.tg.position.set(1.25, 2.9, 0.8); s.tg.rotation.z = 0.2 * Math.sin(t * 3);
    s.ds.userData.ball.rotation.y = t * 1.5; s.ds.userData.spots.forEach((sp, i) => { const an = t * 0.9 + i * 1.6; sp.position.set(1.4 + Math.cos(an) * 1.8, -2.4 + Math.sin(an * 1.3) * 1.2, 0.2); });
  });

  // 5 · la semaine d'Halloween : 6 soirs, 360 locations → la piste de danse se remplit
  scn((t, a, b) => ({ p: [lerp(1, -1, u(t, a, b)), 4.2, 15], q: [0, 1.2, -0.8] }), (g) => {
    floor(g, 10, 6); const cs = [];
    for (let i = 0; i < 12; i++) { const c = [trex, ghostSuit, pumpkinSuit][(i * 2) % 3](g); c.position.set(-3 + (i % 4) * 2, 0, -2.2 + Math.floor(i / 4) * 1.5 + (i % 2) * 0.3); c.rotation.y = -0.4 + (i % 3) * 0.3; c.scale.setScalar(0.7); c.userData.s = 0.7; cs.push(c); }
    const ds = disco(g); ds.position.set(0, 4.6, -1.5); return { cs, ds };
  }, (t, a, b, s) => {
    s.cs.forEach((c, i) => { const k = u(t, a + 0.2 + i * 0.25, a + 0.5 + i * 0.25); c.visible = k > 0; inflate(c, k); dance(c, t, i * 0.9); });
    s.ds.userData.ball.rotation.y = t * 1.5; s.ds.userData.spots.forEach((sp, i) => { const an = t * 0.9 + i * 1.6; sp.position.set(Math.cos(an) * 3, -3.2 + Math.sin(an * 1.3) * 1.4, 0.4); sp.scale.setScalar(3.4); });
  });

  // 6 · « 9 000 ! Je m'achète un vrai dinosaure » : il arrive en tapant des pieds
  scn((t, a) => ({ p: [0.9, 2.6, 22], q: [0.9, 3.1, 0] }), (g) => {
    const bd = backdrop(g, '#a9e86a', '#e6ffc4'); const dn = trex(g, { real: true, col: '#3f8a45' }); dn.scale.setScalar(1.9); return { bd, dn };
  }, (t, a, b, s) => {
    s.bd.rotation.z = (t - a) * 0.12; const td = K('dinosaure.', a), k = E.o3(u(t, td - 0.9, td + 0.1));
    s.dn.position.set(lerp(-9, 1.6, k), 0.12 * Math.abs(Math.sin((t - a) * 9)) * (1 - k * 0.7), 0); s.dn.rotation.y = lerp(1.57, 0.75, k);
    dance(s.dn, t * 0.6, 0, 0.6); s.dn.userData.head.rotation.x = -0.35 * E.back(u(t, td, td + 0.3)) * (t < td + 1.2 ? 1 : 0.5);
  });

  // 7 · « Attends » : 9 pièces (1 pièce = 1 000 €) ; costumes −2, TVA −1, nettoyage −1, piles −1 → 4
  scn((t, a) => ({ p: [0, 3.0, 11.5], q: [0, 0.7, 0] }), (g) => {
    const stacks = [0, 1, 2].map((i) => { const st = coinStack(g, 3); st.position.set(-1.1 + i * 1.1, 0, (i % 2) * 0.3); return st; });
    return { coins: stacks.flatMap((st) => st.userData.coins).sort((p, q) => q.position.y - p.position.y) };
  }, (t, a, b, s) => {
    const cuts = [[K('les costumes,', a), 2], [K('TVA,', a), 1], [K('le nettoyage', a), 1], [K('les piles', a), 1]];
    const out = []; cuts.forEach(([tc, m]) => { for (let i = 0; i < m; i++) out.push(tc + i * 0.06); });
    s.coins.forEach((c, i) => {
      const base = c.userData.y0 ?? (c.userData.y0 = c.position.y);
      if (i < out.length && t > out[i]) { const k = u(t, out[i], out[i] + 0.55); c.position.y = base + 4 * E.i2(k); c.position.x = (i % 2 ? 1 : -1) * 2.5 * k; c.visible = k < 1; }
      else { c.position.y = base; c.position.x = 0; c.visible = true; }
    });
  });

  // 8 · l'astuce de pro : le placard s'ouvre, le T-Rex en jaillit
  scn((t, a) => ({ p: [0.3 * Math.sin((t - a) * 0.5), 2.1, 11], q: [0, 1.6, 0] }), (g) => {
    floor(g, 7, 5); const wd = wardrobe(g); wd.position.z = -0.6; const tr = trex(g); tr.position.z = -0.6; return { wd, tr };
  }, (t, a, b, s) => {
    const tp = K('placard.', a), k = E.back(u(t, tp - 0.3, tp + 0.15));
    s.wd.userData.doors.forEach((d, i) => { d.rotation.y = (i ? -1 : 1) * 1.9 * k; });
    s.tr.visible = k > 0.05; s.tr.rotation.y = -0.35; s.tr.position.set(0, 0, lerp(-0.6, 0.9, E.o3(u(t, tp - 0.1, tp + 0.4)))); inflate(s.tr, u(t, tp - 0.15, tp + 0.35)); dance(s.tr, t, 0, u(t, tp + 0.3, tp + 0.6));
  });

  // 9 · enterrement de vie de garçon, anniversaire, carnaval : les accessoires changent
  scn((t, a) => ({ p: [0.3 * Math.sin((t - a) * 0.6), 2.0, 9.5], q: [0.15, 1.6, 0] }), (g) => {
    floor(g, 7, 5); const tr = trex(g); tr.position.x = 0.2;
    const sash = tag(tr.userData.body, 'FUTUR MARIÉ', '#ff4fa8', 1.6); sash.position.set(0, 0.55, 0.72); sash.rotation.z = -0.25; sash.scale.setScalar(0.75);
    const hat = partyHat(tr.userData.head); hat.position.set(0, 0.32, 0.2); hat.rotation.z = 0.25;
    const bl = balloons(g); bl.position.set(-1.6, 0.6, 0);
    const cf = confetti(g, 70); return { tr, sash, hat, bl, cf };
  }, (t, a, b, s) => {
    dance(s.tr, t, 0.3); s.tr.rotation.y = -0.4; const t1 = K('Enterrements', a), t2 = K('anniversaires,', a), t3 = K('carnaval:', a);
    show(s.sash, 0.75 * E.back(u(t, t1, t1 + 0.3)) * (t < t2 ? 1 : 1 - u(t, t2, t2 + 0.15)));
    show(s.hat, E.back(u(t, t2, t2 + 0.3))); show(s.bl, E.back(u(t, t2 + 0.1, t2 + 0.45))); s.bl.rotation.z = 0.08 * Math.sin(t * 2);
    s.cf(t - a, t > t3 - 0.1);
  });

  // 10 · un costume loué chaque week-end : 1 200 € par an (1 pièce = 100 €)
  scn((t, a) => ({ p: [0.3 * Math.sin((t - a) * 0.5), 2.4, 13.5], q: [0.2, 1.5, 0] }), (g) => {
    floor(g, 8, 5); const tr = trex(g); tr.position.x = -0.55; tr.rotation.y = -0.5;
    const stk = [0, 1].map((i) => { const st = coinStack(g, 6); st.position.set(0.8 + i * 0.8, 0, 0.6 - i * 0.2); return st; });
    return { tr, coins: stk.flatMap((st, j) => st.userData.coins.map((c, k) => ({ c, k: j * 6 + k }))) };
  }, (t, a, b, s) => {
    dance(s.tr, t, 1.1); const t0 = K('chaque week-end:', a);
    s.coins.forEach(({ c, k }) => { const y0 = c.userData.y0 ?? (c.userData.y0 = c.position.y), kk = E.o3(u(t, t0 + k * 0.1, t0 + 0.25 + k * 0.1)); c.visible = kk > 0.01; c.position.y = y0 + (1 - kk) * 2.5; });
  });

  // 11 · « C'est pas un déguisement. C'est un employé. » : cravate et badge
  scn((t, a) => ({ p: [0.3 * Math.sin((t - a) * 0.6), 2.1, 11.5], q: [0.2, 1.75, 0] }), (g) => {
    floor(g, 7, 5); const tr = trex(g); tr.position.x = 0.45; tr.rotation.y = -0.3;
    const tie = grp(tr.userData.body); tie.position.set(0, 1.08, 0.72);
    const RED = glossy('#e0322b', { r: 0.3 }); add(tie, new THREE.ConeGeometry(0.1, 0.12, 4), RED).rotation.x = Math.PI; const bl = add(tie, new THREE.ConeGeometry(0.12, 0.55, 4), RED); bl.position.y = -0.33; bl.rotation.x = Math.PI;
    const bd = tag(tr.userData.body, 'EMPLOYÉ DU MOIS', '#1b1226', 2.7); bd.position.set(0.05, 0.35, 0.8); bd.scale.setScalar(0.34); bd.rotation.z = 0.08;
    return { tr, tie, bd };
  }, (t, a, b, s) => {
    dance(s.tr, t, 0.7, 0.6); const te = K('employé.', a);
    show(s.tie, E.back(u(t, te - 0.3, te))); show(s.bd, 0.34 * E.back(u(t, te - 0.15, te + 0.15)));
  });

  // 12 · conclusion : tout en 2D
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
