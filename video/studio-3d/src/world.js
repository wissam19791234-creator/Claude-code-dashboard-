// Le studio : objets brillants, poses et caméra, tout en fonction pure du temps t (secondes).
import { THREE, RoundedBoxGeometry, COL, FONT, makeRenderer, glossy, gold, unlit, stadium, roundRect, star, heart, circle, extrude, flat,
  canvasTex, blob, E, u, lerp } from './kit3d.js';
import { drawScreen, SW, SH, thumb, CHAT } from './screen.js';

const FLOOR = -1.8;
const TAU = Math.PI * 2;

export function buildWorld(canvas, W, H) {
  const { renderer, scene, camera } = makeRenderer(canvas, W, H);
  const grp = (parent = scene) => { const g = new THREE.Group(); parent.add(g); return g; };
  const add = (parent, geo, mat) => { const m = new THREE.Mesh(geo, mat); parent.add(m); return m; };
  const label = (w, h, pw, ph, draw) => { const c = canvasTex(w, h, draw); return { ...c, geo: (shape) => flat(shape, pw, ph) }; };
  const show = (o, s) => { o.visible = s > 0.002; o.scale.setScalar(Math.max(s, 0.0001)); };

  // ================================================================ interrupteur (début et fin)
  const tog = grp(), togIn = grp(tog);
  const trackMat = glossy(COL.graphite, { r: 0.34 });
  add(togIn, extrude(stadium(3.0, 1.5), 0.42, 0.16), trackMat);
  const knob = add(togIn, new THREE.SphereGeometry(0.62, 64, 40), glossy('#ffffff', { r: 0.2 }));
  knob.scale.z = 0.8; knob.position.z = 0.32;
  const OFF = new THREE.Color(COL.graphite), ON = new THREE.Color(COL.mint);

  // ================================================================ téléphone
  const PW = 1.62, PH = 3.3, SWU = PW - 0.17, SHU = PH - 0.17;
  const phone = grp(), ph = grp(phone);
  add(ph, extrude(roundRect(PW, PH, 0.27), 0.12, 0.05), glossy('#2c2c31', { m: 0.7, r: 0.32 }));
  const bez = add(ph, flat(roundRect(PW - 0.07, PH - 0.07, 0.23), PW, PH), new THREE.MeshPhysicalMaterial({ color: '#060606', roughness: 0.2, clearcoat: 1 }));
  bez.position.z = 0.111;
  const scr = canvasTex(SW, SH);
  const screen = add(ph, flat(roundRect(SWU, SHU, 0.17), SWU, SHU), new THREE.MeshPhysicalMaterial({ color: 0x000000, emissive: 0xffffff,
    emissiveMap: scr.tex, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.04, toneMapped: false }));
  screen.position.z = 0.113;
  const island = add(ph, flat(stadium(0.42, 0.12), 0.42, 0.12), new THREE.MeshBasicMaterial({ color: '#000000' }));
  island.position.set(0, SHU / 2 - 0.1, 0.116);
  // blocs qui viennent se ranger dans le site
  const BLK = [[COL.blue, [-2.4, 1.7, 1.6], [-0.36, -0.2]], [COL.sun, [2.4, 1.3, 1.8], [0.36, -0.2]], [COL.mint, [-2.2, -1.4, 2.2], [0, -0.85]]];
  const blocks = BLK.map(([c]) => add(ph, new RoundedBoxGeometry(0.34, 0.34, 0.34, 4, 0.08), glossy(c, { r: 0.25 })));

  // ================================================================ avis : étoiles en orbite + bulle cochée
  const starGeo = extrude(star(0.36, 0.165), 0.1, 0.06, 6), starMat = glossy('#ffc21a', { r: 0.22, m: 0.15 });
  const stars = [0, 1, 2, 3, 4].map(() => add(scene, starGeo, starMat));
  const bub = grp(), bubIn = grp(bub);
  add(bubIn, extrude(roundRect(1.1, 0.74, 0.3, -1), 0.1, 0.06), glossy(COL.mint, { r: 0.28 }));
  const chk = new THREE.CurvePath();
  chk.add(new THREE.LineCurve3(new THREE.Vector3(-0.26, 0.0, 0), new THREE.Vector3(-0.07, -0.18, 0)));
  chk.add(new THREE.LineCurve3(new THREE.Vector3(-0.07, -0.18, 0), new THREE.Vector3(0.27, 0.17, 0)));
  const chkGeo = new THREE.TubeGeometry(chk, 40, 0.07, 12, false);
  const check = add(bubIn, chkGeo, glossy('#ffffff', { r: 0.2 })); check.position.z = 0.2;

  // ================================================================ fiche : épingle + ondes au sol
  const pts = [];
  for (let i = 0; i <= 48; i++) {
    const y = (i / 48) * 1.6;
    const r = y <= 0.95 ? 0.48 * Math.pow(y / 0.95, 0.85) : Math.sqrt(Math.max(0, 0.25 - (y - 1.1) ** 2));
    pts.push(new THREE.Vector2(Math.max(r, 0.0001), y));
  }
  const pin = grp(), pinIn = grp(pin);
  add(pinIn, new THREE.LatheGeometry(pts, 72), glossy(COL.ember3d, { r: 0.26 }));
  const dot = add(pinIn, new THREE.SphereGeometry(0.19, 40, 24), glossy('#ffffff', { r: 0.2 })); dot.position.set(0, 1.12, 0.38); dot.scale.z = 0.55;
  const ringMat = () => new THREE.MeshBasicMaterial({ color: COL.ember, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  const ripples = [0, 1, 2, 3].map(() => { const m = add(scene, new THREE.RingGeometry(0.93, 1.0, 96), ringMat()); m.rotation.x = -Math.PI / 2; m.position.y = FLOOR + 0.004; return m; });

  // ================================================================ posts : cartes qui s'envolent du téléphone
  const cardGeo = extrude(roundRect(0.95, 0.95, 0.13), 0.03, 0.025, 12);
  const heartGeo = extrude(heart(0.15), 0.05, 0.03, 16), heartMat = glossy('#ff3b5c', { r: 0.25 });
  const cards = [0, 1, 2, 3, 4].map((i) => {
    const g = grp(), gi = grp(g);
    add(gi, cardGeo, glossy('#ffffff', { r: 0.25 }));
    const tx = canvasTex(256, 256, (ctx) => thumb(ctx, 0, 0, 256, [0, 4, 2, 7, 3][i]));
    const img = add(gi, flat(roundRect(0.85, 0.85, 0.1), 0.85, 0.85), unlit(tx.tex)); img.position.z = 0.072;
    const h = add(gi, heartGeo, heartMat); h.position.set(0.3, -0.3, 0.12);
    return { g, gi, h };
  });

  // ================================================================ IA : bulles de conversation + horloge 3 h
  const bubbles = CHAT.map((m) => {
    const g = grp(), gi = grp(g), ia = m.who === 'ia';
    add(gi, extrude(roundRect(1.5, 0.6, 0.26, ia ? 1 : -1), 0.08, 0.05), glossy(ia ? COL.mint : '#ffffff', { r: 0.26 }));
    const tx = canvasTex(600, 240, (ctx) => {
      ctx.font = `700 64px ${FONT}`; ctx.fillStyle = ia ? '#ffffff' : COL.ink; ctx.textBaseline = 'middle';
      ctx.fillText(m.l[0], 30, 76); ctx.fillText(m.l[1], 30, 164);
    });
    const p = add(gi, flat(roundRect(1.5, 0.6, 0.2), 1.5, 0.6), unlit(tx.tex)); p.position.z = 0.096;
    return g;
  });
  const clock = grp(), clockIn = grp(clock);
  add(clockIn, extrude(circle(0.5), 0.1, 0.06), glossy('#ffffff', { r: 0.2 }));
  const rimc = add(clockIn, new THREE.TorusGeometry(0.53, 0.055, 20, 96), glossy(COL.ember, { r: 0.25 }));
  rimc.position.z = 0.02;
  const face = canvasTex(256, 256, (ctx) => {
    ctx.strokeStyle = COL.ink; ctx.lineCap = 'round';
    for (let k = 0; k < 12; k++) { const a = (k * TAU) / 12; ctx.lineWidth = k % 3 ? 5 : 10;
      ctx.beginPath(); ctx.moveTo(128 + Math.sin(a) * 96, 128 - Math.cos(a) * 96); ctx.lineTo(128 + Math.sin(a) * (k % 3 ? 108 : 112), 128 - Math.cos(a) * (k % 3 ? 108 : 112)); ctx.stroke(); }
  });
  const fp = add(clockIn, flat(circle(0.47), 0.94, 0.94), unlit(face.tex)); fp.position.z = 0.112;
  const handMat = glossy(COL.ink, { r: 0.3 });
  const hourH = grp(clockIn), minH = grp(clockIn);
  add(hourH, new THREE.BoxGeometry(0.06, 0.27, 0.03), handMat).position.y = 0.11;
  add(minH, new THREE.BoxGeometry(0.04, 0.38, 0.03), handMat).position.y = 0.17;
  hourH.position.z = 0.13; minH.position.z = 0.15;
  add(clockIn, new THREE.CylinderGeometry(0.05, 0.05, 0.06, 24), glossy(COL.ember)).rotation.x = Math.PI / 2;

  // ================================================================ temps libre : tasse fumante + ballon de plage
  const cup = grp(), cupIn = grp(cup), ceramic = glossy('#fbfaf7', { r: 0.16 });
  const cp = [[0, 0.06], [0.3, 0.06], [0.34, 0.1], [0.42, 0.5], [0.47, 0.74], [0.5, 0.78], [0.47, 0.79], [0.43, 0.72], [0.36, 0.3], [0.3, 0.16], [0.0001, 0.16]]
    .map(([x, y]) => new THREE.Vector2(x, y));
  add(cupIn, new THREE.LatheGeometry(cp, 72), ceramic);
  add(cupIn, new THREE.CylinderGeometry(0.78, 0.62, 0.06, 72), ceramic).position.y = 0.03;
  const coffee = add(cupIn, new THREE.CircleGeometry(0.43, 48), glossy('#6b4228', { r: 0.25 })); coffee.rotation.x = -Math.PI / 2; coffee.position.y = 0.68;
  const handle = add(cupIn, new THREE.TorusGeometry(0.17, 0.05, 20, 48, Math.PI * 1.25), ceramic);
  handle.position.set(0.47, 0.44, 0); handle.rotation.z = -Math.PI * 0.62;
  const steamMat = new THREE.MeshBasicMaterial({ color: '#b9b9c3', transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const steam = [0, 1, 2].map((i) => {
    const c = new THREE.CatmullRomCurve3(Array.from({ length: 12 }, (_, k) => new THREE.Vector3(Math.sin(k * 0.7 + i * 2) * 0.07, k * 0.07, 0)));
    const m = add(cupIn, new THREE.TubeGeometry(c, 48, 0.04, 10, false), steamMat.clone()); m.position.set((i - 1) * 0.17, 0.82, 0); return m;
  });
  const ballGeo = new THREE.SphereGeometry(0.52, 64, 40), bc = [], BCOL = [COL.ember, '#ffffff', COL.sun, COL.blue, '#ffffff', COL.mint].map((c) => new THREE.Color(c));
  const bp = ballGeo.attributes.position, tmp = new THREE.Color();
  for (let i = 0; i < bp.count; i++) {
    const x = bp.getX(i), y = bp.getY(i), z = bp.getZ(i);
    tmp.copy(Math.abs(y) > 0.47 ? BCOL[1] : BCOL[Math.floor(((Math.atan2(z, x) + Math.PI) / TAU) * 6) % 6]);
    tmp.convertSRGBToLinear(); bc.push(tmp.r, tmp.g, tmp.b);
  }
  ballGeo.setAttribute('color', new THREE.Float32BufferAttribute(bc, 3));
  const ballMat = glossy('#ffffff', { r: 0.22 }); ballMat.vertexColors = true;
  const ball = grp(), ballIn = grp(ball); add(ballIn, ballGeo, ballMat);

  // ================================================================ prix : pièce « € » qui se retourne en « −30 % » + 15 places
  const coin = grp(), coinIn = grp(coin);
  add(coinIn, extrude(circle(0.82), 0.14, 0.08), glossy(COL.ember3d, { r: 0.24 }));
  const cf = canvasTex(512, 512, (ctx) => {
    ctx.fillStyle = COL.ember; ctx.beginPath(); ctx.arc(256, 256, 256, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = `800 330px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('€', 256, 276);
  });
  const cb = canvasTex(512, 512, (ctx) => {
    ctx.fillStyle = COL.violet; ctx.beginPath(); ctx.arc(256, 256, 256, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `800 160px ${FONT}`; ctx.fillText('−30 %', 256, 236); ctx.font = `700 46px ${FONT}`; ctx.fillText("sur l'annuel", 256, 352);
  });
  const coinF = add(coinIn, flat(circle(0.8), 1.6, 1.6), unlit(cf.tex)); coinF.position.z = 0.152;
  const coinB = add(coinIn, flat(circle(0.8), 1.6, 1.6), unlit(cb.tex)); coinB.position.z = -0.152; coinB.rotation.y = Math.PI;
  const coinRim = add(coinIn, new THREE.TorusGeometry(0.82, 0.05, 16, 96), glossy(COL.violet, { r: 0.24 })); coinRim.visible = false;
  const tokGeo = new THREE.SphereGeometry(0.12, 32, 20), tokMat = glossy(COL.ember3d, { r: 0.22 });
  const tokens = Array.from({ length: 15 }, () => add(scene, tokGeo, tokMat));

  // ================================================================ fin : bouton « lien en bio »
  const btn = grp(), btnIn = grp(btn);
  add(btnIn, extrude(stadium(2.5, 0.84), 0.2, 0.09), glossy('#e83300', { r: 0.24 }));
  const bt = canvasTex(1024, 320, (ctx) => {
    ctx.fillStyle = '#ffffff'; ctx.font = `800 150px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Lien en bio', 512, 170);
  });
  const btText = add(btnIn, flat(stadium(2.3, 0.72), 2.3, 0.72), unlit(bt.tex)); btText.position.z = 0.196;
  const halo = canvasTex(256, 256, (ctx) => { const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(255,90,20,0.75)'); g.addColorStop(0.5, 'rgba(255,90,20,0.25)'); g.addColorStop(1, 'rgba(255,90,20,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256); });
  const bring = add(scene, new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: halo.tex, transparent: true, depthWrite: false, toneMapped: false }));
  bring.renderOrder = -1;

  // ombres de contact
  const sh = { tog: blob(scene, FLOOR), phone: blob(scene, FLOOR), pin: blob(scene, FLOOR), cup: blob(scene, FLOOR), ball: blob(scene, FLOOR),
    coin: blob(scene, FLOOR), btn: blob(scene, FLOOR), bub: blob(scene, FLOOR) };

  // ================================================================ rendu à l'instant t
  const POSES = [[3.8, 0, 0, -0.22], [6.7, 0, 0.05, 0.12], [9.1, -0.72, 0, 0.32], [11.85, 0.66, 0, -0.34], [14.4, 0, -0.1, -0.12]];
  function phonePose(t) {
    let i = 0; for (let k = 0; k < POSES.length; k++) if (t >= POSES[k][0]) i = k;
    const a = POSES[Math.max(0, i - 1)], b = POSES[i], k = i ? E.io3(u(t, b[0], b[0] + 0.7)) : 1;
    return { x: lerp(a[1], b[1], k), y: lerp(a[2], b[2], k), ry: lerp(a[3], b[3], k) };
  }

  function renderAt(t) {
    // ---- caméra : légère dérive, poussée vers la tasse sur « temps libre »
    const push = E.io2(u(t, 18.5, 21.0)) * (1 - E.io2(u(t, 21.15, 21.95)));
    const dist = 15.5 - 2.6 * push, az = 0.11 * Math.sin(t * 0.33), el = 0.04 * Math.sin(t * 0.27 + 1);
    const tx = 0.35 * push, ty = 0.45 - 0.75 * push;
    camera.position.set(tx + dist * Math.sin(az), ty + 0.5 + dist * Math.sin(el), dist * Math.cos(az));
    camera.lookAt(tx, ty, 0);

    // ---- interrupteur : éteint → s'allume tout seul sur « place » ; revient allumé à la fin
    const a1 = E.back(u(t, 0.15, 0.75)) * (1 - E.i2(u(t, 3.6, 3.95)));
    const a2 = E.back(u(t, 25.75, 26.35));
    const sTog = Math.max(a1, a2 * 0.86);
    show(tog, sTog);
    if (tog.visible) {
      const on = t > 20 ? 1 : E.io3(u(t, 2.95, 3.3));
      knob.position.x = lerp(-0.75, 0.75, on);
      knob.scale.x = 1 + 0.18 * Math.sin(Math.PI * u(t, 2.95, 3.3)); knob.scale.y = 1 - 0.08 * Math.sin(Math.PI * u(t, 2.95, 3.3));
      trackMat.color.copy(OFF).lerp(ON, t > 20 ? 1 : E.io2(u(t, 3.0, 3.32)));
      const late = t > 20, up = E.io3(u(t, 27.5, 28.0));
      tog.position.set(0, late ? lerp(0.7, 1.05, up) : 0.05 + 0.6 * E.i2(u(t, 3.6, 3.95)), 0);
      togIn.position.y = 0.06 * Math.sin(t * 1.6);
      togIn.rotation.set(0.12 + 0.03 * Math.sin(t * 1.1), late ? -0.18 + 0.05 * Math.sin(t * 0.8) : lerp(-0.7, -0.2, E.o3(u(t, 0.15, 0.9))) + 0.6 * E.i2(u(t, 3.6, 3.95)), 0);
      knob.position.y = late ? 0.04 * Math.max(0, Math.sin(Math.PI * u(t, 28.12, 28.34))) : 0;
    }
    sh.tog.follow(0, 0.2, (tog.position.y + togIn.position.y) - FLOOR - 0.75, 3.4, sTog);

    // ---- téléphone (3,8 → 18 s)
    const pIn = E.o3(u(t, 3.75, 4.45)), pOut = E.i2(u(t, 17.65, 18.15));
    const pVis = t >= 3.75 && t < 18.2;
    phone.visible = pVis;
    if (pVis) {
      const P = phonePose(t);
      phone.position.set(P.x, P.y - 4.4 * (1 - pIn) - 4.6 * pOut + 0.05 * Math.sin(t * 1.3), 0);
      phone.rotation.set(0.04 + 0.5 * pOut, P.ry + 0.9 * (1 - pIn), 0.02 * Math.sin(t * 0.9));
      drawScreen(scr.ctx, t); scr.tex.needsUpdate = true;
      BLK.forEach(([, from, to], i) => {
        const k = u(t, 4.85 + i * 0.25, 5.25 + i * 0.25), b = blocks[i];
        b.visible = k > 0 && k < 1;
        if (b.visible) {
          const e = E.i2(k);
          b.position.set(lerp(from[0], to[0], e), lerp(from[1], to[1], e) + Math.sin(Math.PI * k) * 0.4, lerp(from[2], 0.2, e));
          b.rotation.set(k * 5, k * 4, 0); b.scale.setScalar(lerp(1.3, 0.25, e));
        }
      });
    }
    sh.phone.follow(phone.position.x, 0.1, phone.position.y + 1.65 - FLOOR - 0.2, 1.9, pVis ? pIn * (1 - pOut) : 0);

    // ---- étoiles en orbite autour du téléphone (avis)
    stars.forEach((s, i) => {
      const a = E.back(u(t, 7.0 + i * 0.08, 7.5 + i * 0.08)), o = E.i2(u(t, 8.95, 9.3));
      const sc = a * (1 - o); s.visible = sc > 0.002 && t < 9.4;
      if (!s.visible) return;
      const th = (i * TAU) / 5 + t * 0.85, R = 1.55 * a + 1.2 * o;
      s.position.set(R * Math.cos(th), 0.25 + 0.35 * Math.sin(th + 0.6), R * 0.62 * Math.sin(th));
      s.rotation.set(0, t * 2.2 + i, 0.1 * Math.sin(t + i)); s.scale.setScalar(sc);
    });
    const sb = E.back3(u(t, 7.55, 7.95)) * (1 - E.i2(u(t, 8.95, 9.25)));
    show(bub, sb);
    if (bub.visible) {
      bub.position.set(1.08, 1.22 + 0.05 * Math.sin(t * 1.5), 0.75); bubIn.rotation.set(0.05, -0.25 + 0.05 * Math.sin(t), 0.04);
      const cnt = Math.floor(u(t, 7.75, 8.1) * 40) * 12 * 6; chkGeo.setDrawRange(0, cnt);
    }
    sh.bub.follow(1.08, 0.75, bub.position.y - FLOOR, 1.1, sb * 0.5);

    // ---- épingle qui tombe + ondes (fiche)
    const pd = u(t, 9.62, 10.32), po = E.i2(u(t, 11.65, 11.95));
    const sPin = (t >= 9.62 ? 1 : 0) * (1 - po);
    show(pin, sPin);
    if (pin.visible) {
      pin.position.set(1.12, FLOOR + 5.6 * (1 - E.bounce(pd)) + 0.25 * po, 0.5);
      pinIn.rotation.y = TAU * 2 * (1 - E.o3(pd)) + 0.35 * Math.sin(t * 1.2);
    }
    sh.pin.follow(1.12, 0.5, pin.position.y - FLOOR, 0.95, sPin);
    ripples.forEach((m, i) => {
      const t0 = [9.88, 10.1, 10.62, 10.84][i], k = u(t, t0, t0 + 1.0);
      m.visible = k > 0 && k < 1; m.position.set(1.12, FLOOR + 0.004, 0.5);
      m.scale.setScalar(0.4 + 2.4 * E.o2(k)); m.material.opacity = 0.55 * (1 - k);
    });

    // ---- posts qui s'envolent (posts)
    const TG = [[-1.05, 1.15, 0.7, 0.16], [-1.48, 0.12, 1.0, 0.06], [-1.18, -0.9, 0.7, -0.1], [-0.3, 1.55, 0.35, 0.05], [-0.42, -1.42, 1.1, -0.14]];
    cards.forEach(({ g, gi, h }, i) => {
      const k = u(t, 12.28 + i * 0.08, 12.88 + i * 0.08), o = E.i2(u(t, 14.2 + i * 0.04, 14.6 + i * 0.04));
      g.visible = k > 0 && o < 1;
      if (!g.visible) return;
      const e = E.o3(k), T = TG[i];
      g.position.set(lerp(0.66, T[0], e) - 4.2 * o, lerp(0, T[1], e) + 0.45 * Math.sin(Math.PI * e) + 0.05 * Math.sin(t * 1.4 + i), lerp(0.2, T[2], e));
      g.rotation.set(0.1 * Math.sin(t + i), 0.3 + (1 - e) * 2.4 - 0.8 * o, T[3]); g.scale.setScalar(lerp(0.3, 1, e));
      const hk = E.back3(u(t, 13.05 + i * 0.07, 13.4 + i * 0.07)); h.visible = hk > 0.01; h.scale.setScalar(Math.max(0.001, hk));
      gi.rotation.y = 0.04 * Math.sin(t * 1.7 + i);
    });

    // ---- bulles de conversation + horloge (IA)
    const BP = [[-0.95, -1.0, 0.8], [0.95, -0.38, 0.9], [-0.95, 0.24, 0.8], [0.95, 0.86, 0.9]];
    bubbles.forEach((g, i) => {
      const k = E.back(u(t, CHAT[i].t, CHAT[i].t + 0.5)), o = E.i2(u(t, 17.5 + i * 0.03, 17.9 + i * 0.03));
      const s = k * (1 - o); show(g, s);
      if (!g.visible) return;
      const drift = 0.1 * Math.max(0, t - CHAT[i].t), P = BP[i];
      g.position.set(lerp(0, P[0], k), lerp(-0.1, P[1], k) + drift + 0.6 * o, lerp(0.25, P[2], k));
      g.rotation.set(0.04 * Math.sin(t + i), (P[0] < 0 ? 0.22 : -0.22) + 0.04 * Math.sin(t * 1.3 + i), 0);
    });
    const ck = E.back(u(t, 16.22, 16.72)) * (1 - E.i2(u(t, 17.5, 17.85)));
    show(clock, ck);
    if (clock.visible) {
      clock.position.set(-1.18, 1.38 + 0.05 * Math.sin(t * 1.4), 0.4);
      clockIn.rotation.set(0.08, 0.35 + TAU * (1 - E.o3(u(t, 16.22, 16.9))), 0);
      const hk = E.o3(u(t, 16.3, 16.95));
      hourH.rotation.z = -lerp(-Math.PI / 6, Math.PI / 2, hk); minH.rotation.z = -TAU * 4 * hk;
    }

    // ---- tasse fumante, puis ballon de plage sur « Beaucoup » (temps libre)
    const cIn = u(t, 18.95, 19.5), cOut = E.i2(u(t, 21.15, 21.45));
    const sCup = (t >= 18.95 ? 1 : 0) * (1 - cOut); show(cup, sCup);
    if (cup.visible) {
      cup.position.set(-0.3, FLOOR + 3.6 * (1 - E.bounce(cIn)), 0.3); cup.scale.setScalar(1.3 * sCup);
      cupIn.rotation.y = -0.5 + 0.15 * Math.sin(t * 0.7);
      steam.forEach((m, i) => {
        const ph = ((t - 19.4) * 0.45 + i / 3) % 1, on = u(t, 19.35, 19.8);
        m.material.opacity = on * 0.7 * Math.sin(Math.PI * Math.max(0, ph)); m.position.y = 0.82 + ph * 0.4; m.rotation.y = t * 0.6 + i;
      });
    }
    sh.cup.follow(cup.position.x, 0.3, cup.position.y - FLOOR, 2.2, sCup);
    const bk = u(t, 19.95, 20.85), bOut = E.i2(u(t, 21.15, 21.45));
    const sBall = (t >= 19.95 ? 1 : 0) * (1 - bOut); show(ball, sBall);
    if (ball.visible) {
      const bx = lerp(2.9, 0.98, E.o2(bk)), hop = Math.abs(Math.sin(Math.PI * bk * 2.5)) * 1.3 * (1 - bk);
      ball.position.set(bx, FLOOR + 0.52 + hop, 0.6); ballIn.rotation.set(0.4, 0, (2.9 - bx) / 0.52);
    }
    sh.ball.follow(ball.position.x, 0.6, ball.position.y - 0.52 - FLOOR, 1.05, sBall);

    // ---- pièce « € » qui se retourne en « −30 % », puis les 15 places (prix)
    const coA = E.back(u(t, 21.75, 22.3)), coO = E.i2(u(t, 25.45, 25.8));
    const sCoin = coA * (1 - coO); show(coin, sCoin);
    if (coin.visible) {
      const fl = E.io3(u(t, 23.15, 23.8));
      coin.position.set(lerp(0, -0.82, fl), 0.28 + 0.07 * Math.sin(t * 1.5) + 0.35 * Math.sin(Math.PI * fl), 0.2);
      coinIn.rotation.set(0.08, -0.25 + 0.2 * Math.sin(t * 0.8) + (Math.PI * 3) * fl + 0.4 * (1 - coA), 0);
      coinIn.children[0].material.color.set(fl > 0.5 ? COL.violet : COL.ember);
    }
    sh.coin.follow(coin.position.x, 0.2, coin.position.y + 0.8 - FLOOR, 1.7, sCoin * 0.8);
    tokens.forEach((m, i) => {
      const k = E.back3(u(t, 24.42 + i * 0.035, 24.72 + i * 0.035)), o = E.i2(u(t, 25.45, 25.75));
      const s = k * (1 - o); m.visible = s > 0.002;
      if (!m.visible) return;
      const c = i % 5, r = Math.floor(i / 5);
      m.position.set(0.32 + c * 0.34, 0.62 - r * 0.34 + 0.04 * Math.sin(t * 2 + i), 0.3); m.scale.setScalar(s);
    });

    // ---- bouton « Lien en bio » pressé sur « bio » (fin)
    const bA = E.back(u(t, 27.62, 28.05)); show(btn, bA);
    if (btn.visible) {
      const press = Math.sin(Math.PI * u(t, 28.12, 28.36));
      btn.position.set(0, -0.82 + 0.05 * Math.sin(t * 1.4) - 0.06 * press, 0.3);
      btnIn.rotation.set(0.1, -0.12 + 0.04 * Math.sin(t * 0.9), 0);
      btnIn.scale.set(1 - 0.03 * press, 1 - 0.06 * press, 1 - 0.45 * press);
    }
    sh.btn.follow(0, 0.3, btn.position.y + 0.42 - FLOOR, 2.7, bA * 0.8);
    const rk = u(t, 28.12, 28.9); bring.visible = rk > 0 && rk < 1;
    bring.position.set(0, -0.82, 0.05);
    bring.scale.set(3.2 + 2.6 * E.o2(rk), 1.4 + 1.6 * E.o2(rk), 1); bring.material.opacity = Math.sin(Math.PI * Math.min(1, rk * 1.6)) * (1 - rk);

    renderer.render(scene, camera);
  }
  return { renderAt, renderer, scene, camera };
}
