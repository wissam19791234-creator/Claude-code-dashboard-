// Monde 3D de la promo « Le suspect » (rendu image par image : tout dépend de t).
// Scène 1 : rue commerçante de nuit vue par une caméra de surveillance ; le suspect (un commerçant, visage flouté)
// court au ralenti sous les gyrophares et le projecteur. Scène 3 : séance d'identification (toise, flashs), puis
// son « complice » Scalify entre dans le cadre.
import * as THREE from 'three';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const eOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
const eInOut = (x) => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const rnd = (s) => () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
const AN = '"Anton", "Impact", sans-serif';
const TW = '"Special Elite", "Courier New", monospace';

function tex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function txt(x, s, X0, Y0, font, fill, align = 'center') { x.font = font; x.textAlign = align; x.textBaseline = 'middle'; x.fillStyle = fill; x.fillText(s, X0, Y0); }
function logo(x, cx, cy, R) {
  const k = R / 200; x.save(); x.translate(cx, cy); x.scale(k, k);
  x.fillStyle = '#fffdf8'; x.strokeStyle = '#161311'; x.lineWidth = 16; x.beginPath(); x.arc(0, 0, 200, 0, 7); x.fill(); x.stroke();
  x.save(); x.translate(0, -42); x.lineWidth = 40; x.lineCap = 'round'; x.lineJoin = 'round'; x.stroke(new Path2D('M 63 -66 H -30 a 37.5 37.5 0 0 0 0 75 h 56.6 a 37.5 37.5 0 0 1 0 75 H -66')); x.restore();
  x.fillStyle = '#4da2ff'; x.lineWidth = 10; x.beginPath(); x.arc(84, 81, 26, 0, 7); x.fill(); x.stroke(); x.restore();
}
const glowTex = tex(256, 256, (x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
const glow = (c, s, o) => new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ map: glowTex, color: c, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: o }));

// ------------------------------------------------------------------ le suspect (mannequin articulé)
function suspect() {
  const G = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0xd9a37e, roughness: .7 });
  const shirt = new THREE.MeshStandardMaterial({ color: 0x3e5c8a, roughness: .8 });
  const pants = new THREE.MeshStandardMaterial({ color: 0x2b2b33, roughness: .85 });
  const shoe = new THREE.MeshStandardMaterial({ color: 0x111114, roughness: .5 });
  const apronT = tex(256, 512, (x, w, h) => { x.fillStyle = '#f2ead8'; x.fillRect(0, 0, w, h); x.fillStyle = '#d9cdb4'; x.fillRect(40, 260, w - 80, 110); x.strokeStyle = '#b9ab8e'; x.lineWidth = 6; x.strokeRect(40, 260, w - 80, 110); x.fillStyle = '#c0392b'; x.fillRect(0, 0, w, 14); });
  const apron = new THREE.MeshStandardMaterial({ map: apronT, roughness: .9, side: THREE.DoubleSide });
  const cap = (r, l, m) => new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 6, 14), m);
  const hips = new THREE.Group(); hips.position.y = 1.0; G.add(hips);
  const torso = cap(.27, .55, shirt); torso.position.y = .42; hips.add(torso);
  const apr = new THREE.Mesh(new THREE.PlaneGeometry(.52, .95), apron); apr.position.set(0, .2, .29); hips.add(apr);
  const neck = new THREE.Group(); neck.position.y = .92; hips.add(neck);
  // tête : visage flouté (mosaïque)
  const r = rnd(9);
  const faceT = tex(256, 128, (x, w, h) => {
    for (let j = 0; j < 8; j++) for (let i = 0; i < 16; i++) { const v = 150 + r() * 70; x.fillStyle = `rgb(${v + 40},${v - 10},${v - 45})`; x.fillRect(i * 16, j * 16, 16, 16); }
    x.fillStyle = 'rgba(40,25,20,.55)'; for (let i = 0; i < 6; i++) x.fillRect(96 + (i % 3) * 16, 48 + Math.floor(i / 3) * 16, 16, 16);
  });
  faceT.magFilter = THREE.NearestFilter; faceT.minFilter = THREE.NearestFilter;
  const head = new THREE.Mesh(new THREE.SphereGeometry(.21, 24, 18), new THREE.MeshStandardMaterial({ map: faceT, roughness: .8 })); head.position.y = .2; head.rotation.y = -Math.PI / 2; neck.add(head);
  const hat = new THREE.Mesh(new THREE.CylinderGeometry(.2, .22, .1, 20), pants); hat.position.y = .38; neck.add(hat);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(.24, .24, .02, 20), pants); brim.position.set(0, .33, .06); neck.add(brim);
  const limb = (parent, x, y, r1, l1, m1, r2, l2, m2, endM) => {
    const up = new THREE.Group(); up.position.set(x, y, 0); parent.add(up);
    const a = cap(r1, l1, m1); a.position.y = -l1 / 2 - r1 * .3; up.add(a);
    const low = new THREE.Group(); low.position.y = -l1 - r1 * .4; up.add(low);
    const b = cap(r2, l2, m2); b.position.y = -l2 / 2 - r2 * .3; low.add(b);
    const end = new THREE.Mesh(new THREE.SphereGeometry(r2 * 1.25, 12, 10), endM); end.position.set(0, -l2 - r2, endM === shoe ? .06 : 0); end.scale.set(1, .8, endM === shoe ? 1.6 : 1); low.add(end);
    return { up, low };
  };
  const armL = limb(hips, -.36, .78, .085, .28, shirt, .075, .26, skin, skin), armR = limb(hips, .36, .78, .085, .28, shirt, .075, .26, skin, skin);
  const legL = limb(hips, -.14, 0, .11, .36, pants, .095, .36, pants, shoe), legR = limb(hips, .14, 0, .11, .36, pants, .095, .36, pants, shoe);
  // pancarte d'identification
  const plaque = new THREE.Group(); plaque.position.set(0, .28, .36); hips.add(plaque);
  const plT = tex(600, 300, (x, w, h) => {
    x.fillStyle = '#111'; x.fillRect(0, 0, w, h); x.strokeStyle = '#ffd60a'; x.lineWidth = 10; x.strokeRect(10, 10, w - 20, h - 20);
    txt(x, 'RETROUVÉ', w / 2, 95, `120px ${AN}`, '#ffd60a'); txt(x, 'EN LIGNE · DOSSIER 200', w / 2, 215, `54px ${AN}`, '#ffffff');
  });
  plaque.add(new THREE.Mesh(new THREE.PlaneGeometry(.78, .39), new THREE.MeshBasicMaterial({ map: plT })));
  // pose : course au ralenti ou debout
  function pose(t, o) {
    const ph = o.phase, run = o.run ?? 1;
    const s = Math.sin(ph), c = Math.cos(ph);
    legL.up.rotation.x = s * .75 * run; legR.up.rotation.x = -s * .75 * run;
    legL.low.rotation.x = Math.max(0, -c) * 1.1 * run + .05; legR.low.rotation.x = Math.max(0, c) * 1.1 * run + .05;
    armL.up.rotation.x = -s * .7 * run; armR.up.rotation.x = s * .7 * run;
    armL.low.rotation.x = -1.1 * run - (1 - run) * (o.hold ? 1.35 : .1); armR.low.rotation.x = -1.1 * run - (1 - run) * (o.hold ? 1.35 : .1);
    if (o.hold) { armL.up.rotation.x = -.55; armR.up.rotation.x = -.55; armL.up.rotation.z = .25; armR.up.rotation.z = -.25; } else { armL.up.rotation.z = .12; armR.up.rotation.z = -.12; }
    hips.position.y = 1.0 + Math.abs(Math.sin(ph)) * .08 * run;
    hips.rotation.x = .16 * run; neck.rotation.x = -.12 * run;
    hips.rotation.y = Math.sin(ph) * .12 * run;
    plaque.visible = !!o.hold;
  }
  return { G, pose };
}

// ------------------------------------------------------------------ enseignes et vitrines
function signTex(label, bg, ink) {
  return tex(1024, 180, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, bg[0]); g.addColorStop(1, bg[1]); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(255,255,255,.2)'; x.lineWidth = 6; x.strokeRect(10, 10, w - 20, h - 20);
    x.font = `110px ${AN}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = ink; x.shadowBlur = 26; x.fillStyle = ink; x.fillText(label, w / 2, h / 2 + 4);
    x.shadowBlur = 0; x.fillStyle = '#fff8ec'; x.fillText(label, w / 2, h / 2 + 4);
  });
}
function windowTex(seed) {
  const r = rnd(seed);
  return tex(768, 440, (x, w, h) => {
    const g = x.createRadialGradient(w * .5, h * .35, 20, w * .5, h * .5, w * .7); g.addColorStop(0, '#ffe2a8'); g.addColorStop(1, '#7a4a1e'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let k = 0; k < 4; k++) { x.fillStyle = 'rgba(60,30,12,.85)'; x.fillRect(40, 90 + k * 85, w - 80, 10); for (let i = 0; i < 9; i++) { x.fillStyle = `hsl(${r() * 60 + 10},${50 + r() * 30}%,${35 + r() * 25}%)`; x.fillRect(60 + i * 74, 40 + k * 85, 46, 50); } }
  });
}

export function buildWorld(canvas, W, H) {
  const D = window.SUSPECT || {};
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = false;

  // ===== rue de nuit
  const sA = new THREE.Scene(); sA.background = new THREE.Color(0x05070d); sA.fog = new THREE.Fog(0x05070d, 16, 46);
  const camA = new THREE.PerspectiveCamera(46, W / H, .1, 120);
  sA.add(new THREE.HemisphereLight(0x5a6c98, 0x120d0a, .55));
  const road = new THREE.Mesh(new THREE.PlaneGeometry(26, 120), new THREE.MeshStandardMaterial({ color: 0x0d0d11, roughness: .35, metalness: .35 })); road.rotation.x = -Math.PI / 2; road.position.z = -30; sA.add(road);
  [-1, 1].forEach((sd) => { const w = new THREE.Mesh(new THREE.BoxGeometry(4, .2, 120), new THREE.MeshStandardMaterial({ color: 0x24211f, roughness: .9 })); w.position.set(sd * 6.5, .1, -30); sA.add(w); });
  const SHOPS = [
    ['ÉPICERIE FINE', ['#6b3a12', '#3a1f08'], '#ffb057', -1, -6],
    ['FLEURISTE', ['#1e4a34', '#0f2a1d'], '#8fe0a8', -1, -18],
    ['BOULANGERIE', ['#5a1d24', '#331014'], '#ff8a8a', 1, -10],
    ['COIFFEUR', ['#203654', '#101c30'], '#7fb4ff', 1, -22],
    ['LIBRAIRIE', ['#3c2d58', '#211835'], '#c6a8ff', -1, -30]
  ];
  SHOPS.forEach(([label, bg, ink, side, z], i) => {
    const g = new THREE.Group(); g.position.set(side * 8.6, 0, z); g.rotation.y = -side * Math.PI / 2; sA.add(g);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(11.6, 9, .6), new THREE.MeshStandardMaterial({ color: [0x2e211b, 0x22262c, 0x2a2620][i % 3], roughness: .9 })); wall.position.set(0, 4.5, -.3); g.add(wall);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 2.9), new THREE.MeshBasicMaterial({ map: windowTex(30 + i) })); win.position.set(-1.6, 2.1, .02); g.add(win);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 1.45), new THREE.MeshBasicMaterial({ map: signTex(label, bg, ink) })); sign.position.set(0, 4.5, .05); g.add(sign);
    const sg = glow(new THREE.Color(ink), 11, .22); sg.scale.y = .4; sg.position.set(0, 4.5, .3); g.add(sg);
    const pl = new THREE.PointLight(0xffa860, 9, 10, 1.6); pl.position.set(-1.5, 2.4, 2); g.add(pl);
  });
  // gyrophares (hors champ) et projecteur d'hélicoptère
  const red = new THREE.PointLight(0xff2d3c, 0, 40, 1.2); red.position.set(-5, 2.5, 4); sA.add(red);
  const blue = new THREE.PointLight(0x2f6bff, 0, 40, 1.2); blue.position.set(5, 2.5, 4); sA.add(blue);
  const spot = new THREE.SpotLight(0xf2f6ff, 260, 60, .22, .45, 1.2); spot.position.set(0, 26, 0); sA.add(spot); sA.add(spot.target);
  const beam = new THREE.Mesh(new THREE.ConeGeometry(2.6, 26, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0xdfe8ff, transparent: true, opacity: .07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  sA.add(beam);
  const pool = glow(0xf2f6ff, 6, .55); pool.rotation.x = -Math.PI / 2; sA.add(pool);
  const sus = suspect(); sA.add(sus.G);
  const shadowBlob = new THREE.Mesh(new THREE.CircleGeometry(.7, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .55, depthWrite: false })); shadowBlob.rotation.x = -Math.PI / 2; shadowBlob.position.y = .02; sA.add(shadowBlob);

  // ===== séance d'identification
  const sB = new THREE.Scene(); sB.background = new THREE.Color(0x15171c);
  const camB = new THREE.PerspectiveCamera(36, W / H, .1, 60); camB.position.set(0, 1.55, 8.2); camB.lookAt(0, 1.55, 0);
  const wallT = tex(1024, 1400, (x, w, h) => {
    x.fillStyle = '#c9cdd3'; x.fillRect(0, 0, w, h);
    for (let cm = 120; cm <= 220; cm += 5) {
      const y = h - (cm - 100) / 130 * h; const major = cm % 10 === 0;
      x.fillStyle = '#2b2f36'; x.fillRect(0, y - (major ? 3 : 1.5), major ? w : w * .12, major ? 6 : 3); x.fillRect(w - (major ? 0 : w * .12), y - 1.5, w * .12, 3);
      if (major) { [250, 512, 774].forEach((xx) => txt(x, String(cm), xx, y - 26, `44px ${AN}`, '#2b2f36')); }
    }
  });
  const wallB = new THREE.Mesh(new THREE.PlaneGeometry(7.3, 10), new THREE.MeshStandardMaterial({ map: wallT, roughness: .9 })); wallB.position.set(0, 3.0, -.4); sB.add(wallB);
  const floorB = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), new THREE.MeshStandardMaterial({ color: 0x3a3d44, roughness: .9 })); floorB.rotation.x = -Math.PI / 2; floorB.position.z = 3; sB.add(floorB);
  const keyB = new THREE.DirectionalLight(0xffffff, 1.6); keyB.position.set(1, 4, 6); sB.add(keyB);
  const ambB = new THREE.AmbientLight(0xffffff, .55); sB.add(ambB);
  const flashL = new THREE.PointLight(0xffffff, 0, 20, 1.2); flashL.position.set(0, 2, 5); sB.add(flashL);
  const sus2 = suspect(); sB.add(sus2.G);
  // le complice : le logo Scalify
  const comp = new THREE.Group(); sB.add(comp);
  const lgT = tex(512, 512, (x, w, h) => { logo(x, w / 2, h / 2, 240); });
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(.63, .63, .1, 48), new THREE.MeshStandardMaterial({ color: 0x161311 })); rim.rotation.x = Math.PI / 2; rim.position.y = 1.75; comp.add(rim);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(.62, 64), new THREE.MeshBasicMaterial({ map: lgT })); disc.position.set(0, 1.75, .056); comp.add(disc);
  const cpT = tex(600, 220, (x, w, h) => { x.fillStyle = '#111'; x.fillRect(0, 0, w, h); x.strokeStyle = '#ffd60a'; x.lineWidth = 10; x.strokeRect(10, 10, w - 20, h - 20); txt(x, 'COMPLICE', w / 2, h / 2 + 4, `130px ${AN}`, '#ffd60a'); });
  const cplate = new THREE.Mesh(new THREE.PlaneGeometry(.95, .35), new THREE.MeshBasicMaterial({ map: cpT })); cplate.position.set(0, .95, .06); comp.add(cplate);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1.1, 8), new THREE.MeshStandardMaterial({ color: 0x222 })); pole.position.set(0, .55, -.05); comp.add(pole);

  const S1 = D.board || 5.15, S3 = D.lineup || 15.75, S3e = D.dossier || 20.45;
  const FL = D.flashes || [16.0, 16.95, 19.55];

  function renderStreet(t) {
    // suspect qui court au ralenti ; arrêt sur image au mot « commerçant »
    const fz0 = D.freeze ? D.freeze[0] : 1.0, fz1 = D.freeze ? D.freeze[1] : 1.55;
    const tt = t < fz0 ? t : t < fz1 ? fz0 : t - (fz1 - fz0);
    const cam2 = t >= (D.cam2 || 2.15);
    let x, z, heading;
    if (!cam2) { z = -11 + tt * 2.6; x = .5 + Math.sin(tt * .7) * .3; heading = 0; }
    else { const u = t - (D.cam2 || 2.15); z = -3.4; x = -5.6 + u * 1.45; heading = Math.PI / 2; }
    sus.G.position.set(x, 0, z); sus.G.rotation.y = heading; sus.pose(tt, { phase: tt * 4.2, run: 1 });
    shadowBlob.position.set(x, .02, z);
    // projecteur qui suit
    spot.position.set(x + Math.sin(t * .8) * .6, 26, z + 2); spot.target.position.set(x, 0, z);
    beam.position.set((spot.position.x + x) / 2, 13, (spot.position.z + z) / 2); beam.lookAt(x, 0, z); beam.rotateX(-Math.PI / 2);
    pool.position.set(x, .03, z);
    // gyrophares en alternance
    const ph = (t * 2.6) % 1; red.intensity = (ph < .5 ? 1 : .08) * 60 * (.7 + .3 * Math.sin(t * 40)); blue.intensity = (ph >= .5 ? 1 : .08) * 60;
    if (!cam2) { camA.position.set(-2.4, 5.2, 4.5); camA.lookAt(.4, 1.3, -6.5); camA.fov = 34; }
    else { camA.position.set(4.2, 2.6, 6.8); camA.lookAt(-5.3, 2.4, -5.6); camA.fov = 46; }
    camA.updateProjectionMatrix();
    renderer.render(sA, camA);
  }
  function renderLineup(t) {
    const u = t - S3;
    const turn = smooth(FL[1] - .15, FL[1] + .15, t) * (1 - smooth(FL[1] + .75, FL[1] + 1.0, t));
    sus2.G.position.set(lerp(-3.6, -.8, eOut(u / .6)), 0, 0);
    sus2.G.rotation.y = turn * Math.PI / 2;
    sus2.pose(t, { phase: u < .6 ? u * 6 : 0, run: u < .6 ? 1 - u / .6 : 0, hold: u > .45 });
    const cIn = eOut((t - (FL[2] - .9)) / .7);
    comp.visible = t > FL[2] - .95; comp.position.set(lerp(3.8, .85, cIn), 0, .1); comp.rotation.y = Math.sin(t * 1.4) * .15;
    let f = 0; FL.forEach((a) => { const d = t - a; if (d >= 0 && d < .35) f = Math.max(f, 1 - d / .35); });
    flashL.intensity = f * 45; ambB.intensity = .55 + f * .45;
    camB.position.set(Math.sin(t * .5) * .05, 1.55, lerp(10.2, 9.3, eOut(u / 1.2))); camB.lookAt(0, 1.5, 0);
    renderer.render(sB, camB);
  }
  function renderAt(t) {
    if (t < S1) renderStreet(t);
    else if (t >= S3 && t < S3e) renderLineup(t);
    else { renderer.setClearColor(0x000000, 1); renderer.clear(); }
  }
  return { renderAt, renderer };
}
