import * as THREE from 'three';
import { TTFLoader } from 'three/addons/loaders/TTFLoader.js';
import { Font } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const $ = id => document.getElementById(id);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const outExpo = k => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));
const outBack = (k, s = 1.7) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
const inOut = k => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const sine = k => Math.sin(clamp(k) * Math.PI);
const win = (t, a, b) => t >= a && t < b;
const rnd = s => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const TL = await (await fetch('timeline.json')).json();
const E = TL.E, SUBS = TL.subs, M = E.montage;
const END = E.end;

/* ---------- plans ---------- */
// [image, début, fin, étalonnage, zoom départ, zoom fin, fondu d'entrée (s), texte d'interface]
const G = {
  dawn: 'contrast(1.1) saturate(.75) brightness(.8) hue-rotate(-8deg)',
  night: 'contrast(1.2) saturate(.45) brightness(.55)',
  cold: 'contrast(1.25) saturate(.35) brightness(.5)',
  warm: 'contrast(1.15) saturate(1.25) brightness(.92)',
  glow: 'contrast(1.2) saturate(1.35) brightness(.95)',
};
const SHOTS = [
  ['ph/16239806.jpg', 1.2, 4.3, 'dawn', 1.02, 1.12, .7],
  ['ph/4473496.jpg', 3.95, 7.95, 'night', 1.14, 1.04, .4],
  ['ph/2544829.jpg', 7.95, 9.95, 'cold', 1.18, 1.08, 0, '★★☆☆☆  ·  Avis sans réponse'],
  ['ph/7309930.jpg', 9.95, 11.6, 'cold', 1.18, 1.08, 0, 'Dernier post : il y a 8 mois'],
  ['ph/3933017.jpg', 11.6, 13.6, 'cold', 1.2, 1.1, 0, '« Pas de site… je vais ailleurs »'],
  ['ph/37970775.jpg', M[0] - .06, M[1] - .06, 'warm', 1.25, 1.08, 0],
  ['ph/4473398.jpg', M[1] - .06, M[2] - .06, 'warm', 1.25, 1.08, 0],
  ['ph/1836983.jpg', M[2] - .06, M[3] - .06, 'warm', 1.25, 1.08, 0],
  ['ph/7446915.jpg', M[3] - .06, M[4] - .06, 'warm', 1.25, 1.08, 0],
  ['ph/6870324.jpg', M[4] - .06, E.hope - .15, 'warm', 1.25, 1.08, 0],
  ['ph/31846864.jpg', E.hope - .15, E.logo - .05, 'glow', 1.04, 1.16, .35],
];
const BEATS = [['Votre site', 'En ligne en 7 jours'], ['Fiche Google', 'Toujours à jour'], ['Vos avis', 'Une réponse à chaque avis'], ['Vos réseaux', 'Des posts chaque semaine'], ['IA 24/7', 'Répond même la nuit']];
const shotEls = SHOTS.map(s => { const d = document.createElement('div'); d.className = 'shot'; d.innerHTML = `<img src="${s[0]}">`; $('shots').appendChild(d); return d; });

/* ---------- 3D ---------- */
const renderer = new THREE.WebGLRenderer({ canvas: $('three'), alpha: true, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(1080, 1920, false);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;
scene.environmentIntensity = .5;
const cam = new THREE.PerspectiveCamera(32, 1080 / 1920, .1, 200); cam.position.set(0, 0, 30);
const key = new THREE.DirectionalLight(0xfff1d6, 2.6); key.position.set(4, 9, 12); scene.add(key);
const rim = new THREE.DirectionalLight(0x6f8cff, 3.2); rim.position.set(-9, -3, -6); scene.add(rim);
scene.add(new THREE.AmbientLight(0xffffff, .25));
const font = new Font(await new Promise((res, rej) => new TTFLoader().load('Anton.ttf', res, undefined, rej)));
const mat = (c, o = {}) => new THREE.MeshPhysicalMaterial({ color: c, metalness: .35, roughness: .28, clearcoat: .7, clearcoatRoughness: .1, ...o });
const GOLD = [mat(0xffc21a), mat(0x9a5a00, { roughness: .4 })];
function glyph(str, size = 3) {
  const g = new TextGeometry(str, { font, size, depth: 1.0, curveSegments: 10, bevelEnabled: true, bevelThickness: .12, bevelSize: .06, bevelSegments: 4 });
  g.computeBoundingBox(); const bb = g.boundingBox;
  g.translate(-(bb.min.x + bb.max.x) / 2, -(bb.min.y + bb.max.y) / 2, -.5);
  const m = new THREE.Mesh(g, GOLD); m.userData.w = bb.max.x - bb.min.x; return m;
}
// machine à sous « J-?? »
const SLOT = new THREE.Group(); scene.add(SLOT);
const JM = glyph('J-'); SLOT.add(JM);
const CH = '0123456789?'.split('');
const slots = [0, 1].map(() => { const g = new THREE.Group(); CH.forEach(c => { const m = glyph(c); m.visible = false; g.add(m); }); SLOT.add(g); return g; });
const dw = Math.max(...slots[0].children.map(m => m.userData.w)) + .25;
const totalW = JM.userData.w + .35 + dw * 2;
JM.position.x = -totalW / 2 + JM.userData.w / 2;
slots.forEach((g, i) => (g.position.x = -totalW / 2 + JM.userData.w + .35 + dw * (i + .5)));
SLOT.visible = false;
// pièce logo
function logoTex() {
  const c = document.createElement('canvas'); c.width = c.height = 1024; const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, 1024, 1024); x.scale(32, 32); x.lineCap = x.lineJoin = 'round'; x.lineWidth = 3; x.strokeStyle = '#000';
  x.stroke(new Path2D('M21 10.8H13.9a2.85 2.85 0 0 0 0 5.7h4.3a2.85 2.85 0 0 1 0 5.7H11'));
  x.fillStyle = '#4da2ff'; x.beginPath(); x.arc(22.4, 21.8, 2, 0, 7); x.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.center.set(.5, .5); t.rotation = Math.PI / 2; return t;
}
const coinGeo = new THREE.CylinderGeometry(3, 3, .55, 96); coinGeo.rotateX(Math.PI / 2);
const face = mat(0xffffff, { map: logoTex(), metalness: 0, roughness: .3 });
const COIN = new THREE.Group(); COIN.add(new THREE.Mesh(coinGeo, [mat(0x111111, { metalness: .9, roughness: .2 }), face, face])); COIN.visible = false; scene.add(COIN);
// poussières en suspension
const DUST = new THREE.Group();
for (let i = 0; i < 120; i++) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(.03 + rnd(i) * .06, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffe2b0, transparent: true, opacity: .35 + rnd(i + 9) * .5 }));
  m.position.set((rnd(i + 1) - .5) * 20, (rnd(i + 2) - .5) * 36, (rnd(i + 3) - .5) * 14); m.userData.v = .15 + rnd(i + 4) * .4; DUST.add(m);
}
scene.add(DUST);

await Promise.all(SHOTS.map(s => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = s[0]; })));
await document.fonts.load('800 40px IT'); await document.fonts.load('40px Anton'); await document.fonts.load('40px "Noto Color Emoji"');

/* ---------- effets ---------- */
const gctx = $('grain').getContext('2d'), gimg = gctx.createImageData(360, 640);
function grain(f) { const d = gimg.data; let s = f * 9301 + 49297; for (let i = 0; i < d.length; i += 4) { s = (s * 1103515245 + 12345) & 0x7fffffff; d[i] = d[i + 1] = d[i + 2] = (s >> 16) & 255; d[i + 3] = 255; } gctx.putImageData(gimg, 0, 0); }
const card = (id, op, tf = '', extra = {}) => { const e = $(id); e.style.opacity = op; e.style.transform = tf; Object.assign(e.style, extra); };
const HITS = [E.braam, M[0], M[1], M[2], M[3], M[4], E.logo, E.launch[1] - .02, E.follow - .1];
const SOFT = [7.95, 9.95, 11.6];
const FLARES = [[1.4, 3.4, .35], [E.hope + .6, E.hope + 2.6, .7], [E.logo, E.logo + 1.6, 1], [E.launch[1] - .05, E.launch[1] + 1.1, .8]];

window.seek = (t, frame = Math.round(t * 30)) => {
  // secousses
  let a = 0;
  HITS.forEach(h => { const k = t - h; if (k >= 0 && k < .45) a += (1 - k / .45) ** 2 * 26; });
  SOFT.forEach(h => { const k = t - h; if (k >= 0 && k < .25) a += (1 - k / .25) * 10; });
  const drift = Math.sin(t * .7) * 3; // caméra à l'épaule très légère
  $('stage').style.transform = `translate(${(rnd(frame) - .5) * a + drift}px,${(rnd(frame + 7) - .5) * a + Math.cos(t * .5) * 2}px)`;

  // letterbox
  const bar = lerp(0, 230, outExpo(prog(t, .1, 1.3))) - (win(t, M[0], E.hope) ? 60 * sine(prog(t, M[0], E.hope)) : 0);
  $('bars').style.setProperty('--bar', bar + 'px');

  // photos
  let any = false, gradeMode = '';
  SHOTS.forEach(([src, a0, b0, g, z0, z1, fin, ui], i) => {
    const el = shotEls[i];
    const fadeOut = i + 1 < SHOTS.length && SHOTS[i + 1][6] > 0 && Math.abs(SHOTS[i + 1][1] - b0) < .5 ? SHOTS[i + 1][6] : 0;
    if (!win(t, a0, b0 + fadeOut)) { el.style.opacity = 0; return; }
    any = true; gradeMode = g;
    const k = prog(t, a0, b0);
    let op = fin ? outExpo(prog(t, a0, a0 + fin)) : 1;
    let s = lerp(z0, z1, inOut(k)), blur = 0;
    if (!fin) { const e = outExpo(prog(t, a0, a0 + .22)); s *= lerp(1.18, 1, e); blur = lerp(12, 0, e); }
    let f = G[g];
    if (i === 1) f += ` brightness(${lerp(1, .6, prog(t, 6.6, 7.7))})`;
    el.style.opacity = op; el.style.zIndex = i;
    el.style.filter = `${f} blur(${blur.toFixed(1)}px)`;
    el.style.transform = `scale(${s}) translate(${Math.sin(i * 1.7) * 12 * k}px,${Math.cos(i) * 10 * k}px)`;
  });
  $('grade').style.opacity = any ? (gradeMode === 'warm' || gradeMode === 'glow' ? .55 : .8) : 0;
  $('tint').style.opacity = any && (gradeMode === 'cold' || gradeMode === 'night' || gradeMode === 'dawn') ? .45 : 0;
  $('shade').style.opacity = any ? 1 : 0;

  // texte d'interface sur les plans « problèmes »
  const uiShot = SHOTS.find(s => s[7] && win(t, s[1], s[2]));
  if (uiShot) {
    const k = prog(t, uiShot[1] + .25, uiShot[1] + .55); const g = rnd(frame) > .85 && k < 1 ? (rnd(frame + 3) - .5) * 30 : 0;
    $('uiText').textContent = uiShot[7]; card('ui', k > 0 ? 1 : 0, `translate(${g}px,${lerp(30, 0, outExpo(k))}px)`);
  } else card('ui', 0);

  // cartes titre
  card('present', sine(prog(t, .15, 1.55)) ** .6, `scale(${lerp(.96, 1.02, prog(t, .15, 1.55))})`, { letterSpacing: lerp(.3, .62, prog(t, .15, 1.55)) + 'em' });
  { const k = prog(t, E.braam + .05, E.l4 - .1); card('etsi', win(t, E.braam, E.l4) ? sine(k) ** .5 : 0, `scale(${lerp(.92, 1.08, k)})`, { filter: `blur(${lerp(8, 0, outExpo(prog(t, E.braam, E.braam + .4)))}px)` }); }
  // montage : mots qui claquent
  let bi = -1; M.forEach((m, i) => { if (t >= m - .06) bi = i; });
  if (bi >= 0 && t < E.hope - .15) {
    const k = prog(t, M[bi] - .06, M[bi] + .2);
    $('beat').textContent = BEATS[bi][0]; $('beatSub').textContent = BEATS[bi][1];
    card('beat', 1, `scale(${lerp(1.5, 1, outExpo(k))})`, { letterSpacing: lerp(.25, .02, outExpo(k)) + 'em', filter: `blur(${lerp(10, 0, outExpo(k))}px)` });
    card('beatSub', prog(t, M[bi] + .15, M[bi] + .4), `translateY(${lerp(20, 0, outExpo(prog(t, M[bi] + .15, M[bi] + .45)))}px)`);
  } else { card('beat', 0); card('beatSub', 0); }
  // logo + marque
  const brandK = prog(t, E.logo + .5, E.logo + 1.3);
  card('brand', win(t, E.logo, E.launch[0] - .1) ? outExpo(brandK) : 0, '', { letterSpacing: lerp(.6, .04, outExpo(brandK)) + 'em' });
  card('launchTop', win(t, E.launch[0], E.follow - .1) ? outExpo(prog(t, E.launch[0], E.launch[0] + .5)) : 0, '', { letterSpacing: lerp(.8, .45, outExpo(prog(t, E.launch[0], E.launch[0] + .8))) + 'em' });
  card('offer', win(t, E.launch[1], E.follow - .1) ? outExpo(prog(t, E.launch[1] + .1, E.launch[1] + .5)) : 0, `scale(${lerp(.8, 1, outBack(prog(t, E.launch[1] + .1, E.launch[1] + .5)))})`);
  card('soon', t >= E.follow - .1 ? outExpo(prog(t, E.follow - .1, E.follow + .5)) : 0, '', { letterSpacing: lerp(.9, .5, outExpo(prog(t, E.follow - .1, E.follow + 1))) + 'em' });
  { const k = prog(t, E.follow, E.follow + .4); const pulse = 1 + Math.max(0, Math.sin((t - E.follow - .6) * 6)) * .05 * (t > E.follow + .6); card('follow', t >= E.follow ? 1 : 0, `scale(${lerp(.3, 1, outBack(k)) * pulse})`); }

  // rayons + halo (sections « espoir » et logo)
  const raysOn = win(t, E.l4 - .3, M[0] - .1) ? sine(prog(t, E.l4 - .3, M[0])) : t >= E.logo ? outExpo(prog(t, E.logo, E.logo + .8)) * .9 : 0;
  $('rays').style.opacity = raysOn; $('rays').style.transform = `rotate(${Math.sin(t * .3) * 4}deg) scale(1.3)`;
  $('glow').style.opacity = t >= E.logo ? .9 : raysOn * .6;

  /* --- 3D --- */
  COIN.visible = SLOT.visible = false;
  DUST.visible = !any || gradeMode === 'glow';
  DUST.children.forEach((m, i) => { m.position.y = ((rnd(i + 2) - .5) * 36 + t * m.userData.v + 18) % 36 - 18; m.position.x += Math.sin(t + i) * .002; });
  if (win(t, E.logo, E.launch[0])) {
    COIN.visible = true; const k = prog(t, E.logo, E.logo + 1.4);
    COIN.position.set(0, lerp(-6, 2.6, outExpo(k)), lerp(-10, 0, outExpo(k)));
    COIN.rotation.set(.15 - .1 * k, lerp(Math.PI * 5, 0, outExpo(k)) + Math.sin(t * 1.5) * .12, 0);
    COIN.scale.setScalar(1);
  }
  if (win(t, E.launch[0], E.follow - .1)) {
    SLOT.visible = true;
    const k = prog(t, E.launch[0], E.launch[0] + .5);
    SLOT.position.set(0, 1.2, lerp(-40, 0, outExpo(k)));
    SLOT.rotation.set(Math.sin(t * 1.3) * .06, Math.sin(t * .9) * .25, 0);
    const locks = [E.launch[1] - .32, E.launch[1] - .02];
    slots.forEach((g, si) => {
      const locked = t >= locks[si];
      const idx = locked ? 10 : Math.floor(rnd(frame * 3 + si * 17) * 10);
      g.children.forEach((m, ci) => (m.visible = ci === idx));
      const lk = prog(t, locks[si], locks[si] + .25);
      g.scale.set(1, locked ? lerp(1.35, 1, outBack(lk, 2.5)) : 1.18, 1);
      g.position.y = locked ? 0 : (rnd(frame + si) - .5) * .5;
    });
  }
  if (t >= E.follow - .1) {
    COIN.visible = true; const k = prog(t, E.follow - .1, E.follow + .5);
    COIN.position.set(0, lerp(9, 4.4, outBack(k, 1.2)), 0); COIN.scale.setScalar(.55);
    COIN.rotation.set(.1, lerp(Math.PI * 3, 0, outExpo(k)) + Math.sin(t * 1.8) * .15, 0);
  }
  renderer.render(scene, cam);

  // flares anamorphiques, light leaks, flash, noir
  let fl = 0, fx = .5;
  FLARES.forEach(([a0, b0, s]) => { if (win(t, a0, b0)) { const k = prog(t, a0, b0); fl = Math.max(fl, sine(k) * s); fx = lerp(.1, .9, k); } });
  $('flare').style.opacity = fl * .8; $('flare').style.transform = `translateY(${t >= E.logo ? -150 : -260}px)`;
  const fd = $('flareDot'); fd.style.opacity = fl; fd.style.left = fx * 1080 + 'px'; fd.style.top = (960 + (t >= E.logo ? -150 : -260)) + 'px';
  let lk = 0; [[E.hope, E.logo], [E.logo - .2, E.logo + 1.5], [E.follow - .3, END]].forEach(([a0, b0]) => { if (win(t, a0, b0)) lk = Math.max(lk, sine(prog(t, a0, b0))); });
  $('leak').style.opacity = lk * .55; $('leak').style.transform = `translateX(${Math.sin(t * .6) * 70}px) scale(1.3)`;
  let flash = 0; HITS.forEach(h => { if (win(t, h - .02, h + .18)) flash = Math.max(flash, 1 - prog(t, h - .02, h + .18)); });
  $('flash').style.opacity = flash * .85;
  $('black').style.opacity = Math.max(win(t, 13.6, E.braam) ? 1 : 0, prog(t, END - .6, END));
  grain(frame);

  // sous-titres cinéma (phrase à phrase, mot révélé quand il est dit)
  const hideSubs = win(t, M[0] - .1, E.hope - .2) || t >= E.logo;
  const s = SUBS.find(x => t >= x.t - .05 && t < x.e + .35);
  const subs = $('subs');
  if (!s || hideSubs) { subs.innerHTML = ''; subs.dataset.k = ''; }
  else {
    if (subs.dataset.k !== String(s.t)) { subs.dataset.k = s.t; subs.innerHTML = s.words.map(w => `<b>${w.w}</b>`).join(' '); }
    [...subs.children].forEach((b, i) => (b.style.opacity = t >= s.words[i].t - .04 ? 1 : .28));
    subs.style.opacity = 1 - prog(t, s.e + .1, s.e + .35);
  }
};
window.TIMES = E;
window.ready = true;
if (!location.search.includes('render')) { const t0 = performance.now(); (function loop() { seek(((performance.now() - t0) / 1000) % END); requestAnimationFrame(loop); })(); }
