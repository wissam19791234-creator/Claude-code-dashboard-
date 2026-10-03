import * as THREE from 'three';
import { TTFLoader } from 'three/addons/loaders/TTFLoader.js';
import { Font } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const END = 21;
const ROT = +(new URLSearchParams(location.search).get('rot') ?? 1) * Math.PI / 2;
const $ = id => document.getElementById(id);

/* ---------- maths ---------- */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const outExpo = k => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));
const outBack = (k, s = 1.9) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
const inOut = k => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const inExpo = k => (k <= 0 ? 0 : Math.pow(2, 10 * k - 10));
const win = (t, a, b) => t >= a && t < b;
function rnd(seed) { const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

/* ---------- photos (Pexels, licence libre) ---------- */
const P = {
  barber: 'ph/1836983.jpg', chef: 'ph/2544829.jpg', bake: 'ph/37970775.jpg', flor: 'ph/3933017.jpg',
  posts: 'ph/7309930.jpg', cash: 'ph/4473496.jpg', open: 'ph/4473398.jpg', grill: 'ph/5251019.jpg', bread: 'ph/16239806.jpg',
};
// plans photo : [image, début, fin, transition d'entrée, zoom départ, zoom fin, dérive x, dérive y]
const SHOTS = [
  ['barber', 0.00, 0.27, 'punch', 1.25, 1.12, 20, 0],
  ['chef',   0.27, 0.55, 'punch', 1.25, 1.12, -20, 0],
  ['bake',   0.55, 0.82, 'punch', 1.25, 1.12, 0, 20],
  ['flor',   0.82, 2.58, 'punch', 1.18, 1.02, -30, 0],
  ['bake',   5.85, 6.55, 'whipL', 1.15, 1.05, 30, 0],
  ['barber', 6.55, 7.40, 'whipR', 1.15, 1.05, -30, 0],
  ['chef',   7.40, 7.95, 'whipL', 1.15, 1.05, 30, 0],
  ['posts',  7.95, 9.35, 'whipR', 1.15, 1.02, -20, 0],
  ['cash',   9.35, 11.88, 'punch', 1.2, 1.05, 0, -30],
  ['open',  17.32, 19.0, 'punch', 1.3, 1.06, 0, -40],
];
const shotEls = SHOTS.map(s => {
  const d = document.createElement('div'); d.className = 'shot';
  const im = document.createElement('img'); im.src = P[s[0]]; d.appendChild(im);
  $('shots').appendChild(d); return d;
});
for (let i = 0; i < 15; i++) $('seats').appendChild(document.createElement('i'));

/* ---------- sous-titres ---------- */
const words = await (await fetch('words.json')).json();
const SHOWN = { 30: '49 €', 38: '30 %' };
const KEY = new Set([2, 4, 6, 8, 9, 18, 21, 28, 30, 34, 38, 43, 44]);
const RED = new Set([2]);
const GROUPS = [[0,1],[2],[3,4],[5,6],[7,8],[9],[10],[11],[12,13],[14],[15],[16,17,18],[19,20,21],[22],[23,24,25],[26,27,28],[29,30],[31,32],[33,34],[35,36],[37,38],[39,40],[41],[42,43],[44]];
const VO_DELAY = 0.10; // la voix démarre 100 ms après l'image
const capEl = $('caps');
function renderCaps(t) {
  const tt = t - VO_DELAY + 0.06; // le texte arrive une fraction avant le mot
  let gi = -1;
  for (let i = 0; i < GROUPS.length; i++) if (words[GROUPS[i][0]].t <= tt) gi = i;
  const g = GROUPS[gi];
  if (!g || tt > words[g[g.length - 1]].t + words[g[g.length - 1]].d + 0.7) { capEl.innerHTML = ''; capEl.dataset.g = ''; return; }
  if (capEl.dataset.g !== String(gi)) {
    capEl.dataset.g = gi;
    capEl.innerHTML = g.map(i => `<span class="w" data-i="${i}">${SHOWN[i] || words[i].w}</span>`).join('');
  }
  const hook = t < 2.6;
  capEl.style.top = hook ? '1180px' : '1330px';
  capEl.style.height = '300px';
  const gs = words[g[0]].t;
  const pk = prog(tt, gs, gs + 0.16);
  capEl.style.transform = `scale(${lerp(.55, 1, outBack(pk, 2.4))}) rotate(${lerp(-4, 0, pk)}deg)`;
  capEl.querySelectorAll('.w').forEach(el => {
    const i = +el.dataset.i, w = words[i];
    const active = tt >= w.t && (i === g[g.length - 1] || tt < words[i + 1].t);
    const done = tt >= w.t + w.d;
    el.style.fontSize = (hook ? 150 : 124) + 'px';
    el.style.color = active ? (RED.has(i) ? '#ff5a3c' : '#ffd731') : (done && KEY.has(i) ? (RED.has(i) ? '#ff5a3c' : '#55db9c') : '#fff');
    const k = prog(tt, w.t, w.t + .12);
    el.style.transform = active ? `scale(${lerp(1.25, 1.1, k)}) rotate(-2deg)` : 'none';
  });
}

/* ---------- 3D ---------- */
const canvas = $('three');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(1080, 1920, false);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = .55;
const cam = new THREE.PerspectiveCamera(32, 1080 / 1920, 0.1, 200);
cam.position.set(0, 0, 30);
const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(6, 10, 12); scene.add(key);
const rim = new THREE.DirectionalLight(0x8f7bff, 3); rim.position.set(-10, -4, -6); scene.add(rim);
scene.add(new THREE.AmbientLight(0xffffff, .35));

const json = await new Promise((res, rej) => new TTFLoader().load('Anton.ttf', res, undefined, rej));
const font = new Font(json);
const mat = (c, o = {}) => new THREE.MeshPhysicalMaterial({ color: c, metalness: .1, roughness: .3, clearcoat: .6, clearcoatRoughness: .12, ...o });
function text3d(str, size, front, side, depth = .9) {
  const g = new TextGeometry(str, { font, size, depth, curveSegments: 10, bevelEnabled: true, bevelThickness: .14, bevelSize: .07, bevelSegments: 5 });
  g.computeBoundingBox(); g.center();
  const m = new THREE.Mesh(g, [mat(front), mat(side, { roughness: .35 })]);
  const grp = new THREE.Group(); grp.add(m); grp.visible = false; scene.add(grp); return grp;
}
const J30 = text3d('J-30', 2.6, 0xffcc00, 0xb86e00, 1.1);
const PRICE = text3d('49€', 3.0, 0xffcc00, 0xb86e00, 1.0);
const PCT = text3d('-30%', 2.3, 0x2fd98a, 0x0f7a4a, 1.0);
const J30b = text3d('J-30', 1.9, 0xffcc00, 0xb86e00, .9);

// pièce logo Scalify
function logoTex(bg = '#fff') {
  const c = document.createElement('canvas'); c.width = c.height = 1024; const x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, 1024, 1024);
  x.scale(32, 32); x.lineCap = x.lineJoin = 'round'; x.lineWidth = 3; x.strokeStyle = '#000';
  x.beginPath(); const p = new Path2D('M21 10.8H13.9a2.85 2.85 0 0 0 0 5.7h4.3a2.85 2.85 0 0 1 0 5.7H11'); x.stroke(p);
  x.fillStyle = '#4da2ff'; x.beginPath(); x.arc(22.4, 21.8, 2, 0, 7); x.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.center.set(.5, .5); t.rotation = ROT; return t;
}
const coinGeo = new THREE.CylinderGeometry(3, 3, .55, 96); coinGeo.rotateX(Math.PI / 2);
const faceMat = mat(0xffffff, { map: logoTex(), metalness: 0, roughness: .3 });
const COIN = new THREE.Group();
COIN.add(new THREE.Mesh(coinGeo, [mat(0x111111, { metalness: .8, roughness: .25 }), faceMat, faceMat]));
// les faces du cylindre regardent ±y avant rotation : on corrige l'orientation de la texture
COIN.children[0].rotation.z = 0; COIN.visible = false; scene.add(COIN);

// épingle de carte
const PIN = new THREE.Group();
{
  const pinMat = mat(0xfb4903);
  const head = new THREE.Mesh(new THREE.SphereGeometry(1.2, 48, 32), pinMat);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(1.02, 2.1, 48), pinMat); tip.rotation.x = Math.PI; tip.position.y = -1.25;
  const dot = new THREE.Mesh(new THREE.SphereGeometry(.45, 32, 16), mat(0xffffff)); dot.position.z = 1.0;
  PIN.add(head, tip, dot);
}
PIN.visible = false; scene.add(PIN);

// téléphone 3D + écrans dessinés
const SCR = { w: 640, h: 1340 };
const scrCanvas = document.createElement('canvas'); scrCanvas.width = SCR.w; scrCanvas.height = SCR.h;
const scrTex = new THREE.CanvasTexture(scrCanvas); scrTex.colorSpace = THREE.SRGBColorSpace; scrTex.anisotropy = 8;
const PHONE = new THREE.Group();
{
  const body = new THREE.Mesh(new RoundedBoxGeometry(5.6, 11.4, .55, 8, .7), mat(0x0e0e12, { metalness: .7, roughness: .2 }));
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(5.1, 10.7), new THREE.MeshBasicMaterial({ map: scrTex, toneMapped: false }));
  screen.position.z = .29;
  PHONE.add(body, screen);
}
PHONE.visible = false; scene.add(PHONE);
const imgs = {};
await Promise.all(Object.entries(P).map(([k, src]) => new Promise(r => { const i = new Image(); i.onload = r; i.src = src; imgs[k] = i; })));
await document.fonts.load('800 40px IT'); await document.fonts.load('40px Anton'); await document.fonts.load('40px "Noto Color Emoji"');

function cover(x, im, dx, dy, dw, dh) {
  const r = Math.max(dw / im.width, dh / im.height), w = im.width * r, h = im.height * r;
  x.save(); x.beginPath(); x.rect(dx, dy, dw, dh); x.clip(); x.drawImage(im, dx + (dw - w) / 2, dy + (dh - h) / 2, w, h); x.restore();
}
function rr(x, a, b, w, h, r, fill) { x.beginPath(); x.roundRect(a, b, w, h, r); x.fillStyle = fill; x.fill(); }
let lastScreen = '';
function drawScreen(kind, t) {
  const key = kind + (kind === 'gmap' ? Math.round(t * 10) : '');
  if (key === lastScreen) return; lastScreen = key;
  const x = scrCanvas.getContext('2d'); const W = SCR.w, H = SCR.h;
  x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
  x.fillStyle = '#000'; x.font = '700 26px IT'; x.fillText('9:41', 40, 52);
  if (kind === 'site') {
    cover(x, imgs.bake, 0, 80, W, 560);
    const gr = x.createLinearGradient(0, 380, 0, 640); gr.addColorStop(0, '#0000'); gr.addColorStop(1, '#000c'); x.fillStyle = gr; x.fillRect(0, 380, W, 260);
    x.fillStyle = '#fff'; x.font = '64px Anton'; x.fillText('BOULANGERIE', 40, 560); x.fillText('DU COIN', 40, 625);
    rr(x, 40, 690, W - 80, 100, 50, '#ffd731'); x.fillStyle = '#000'; x.font = '800 36px IT'; x.fillText('Commander en ligne', 150, 752);
    ['🥐  Viennoiseries', '🍞  Pains au levain', '🎂  Gâteaux sur commande'].forEach((s, i) => {
      rr(x, 40, 830 + i * 130, W - 80, 110, 28, '#f3f0ff'); x.fillStyle = '#000'; x.font = '700 34px IT'; x.fillText(s, 70, 897 + i * 130);
    });
  } else if (kind === 'gmap') {
    x.fillStyle = '#e8eef3'; x.fillRect(0, 80, W, 700);
    x.strokeStyle = '#fff'; x.lineWidth = 26; [[0, 300, W, 420], [200, 80, 340, 780], [0, 620, W, 560], [480, 80, 420, 780]].forEach(([a, b, c, d]) => { x.beginPath(); x.moveTo(a, b); x.lineTo(c, d); x.stroke(); });
    x.fillStyle = '#c9e7c4'; x.fillRect(380, 120, 180, 140);
    const bounce = Math.abs(Math.sin(t * 6)) * 18;
    x.fillStyle = '#fb4903'; x.beginPath(); x.arc(W / 2, 400 - bounce, 46, Math.PI, 0); x.lineTo(W / 2, 500 - bounce); x.closePath(); x.fill();
    x.fillStyle = '#fff'; x.beginPath(); x.arc(W / 2, 400 - bounce, 18, 0, 7); x.fill();
    x.fillStyle = '#000'; x.font = '800 44px IT'; x.fillText('Boulangerie du Coin', 40, 860);
    x.font = '700 34px IT'; x.fillStyle = '#e8a400'; x.fillText('★★★★★', 40, 915); x.fillStyle = '#444'; x.fillText('4,9 · 212 avis', 230, 915);
    x.fillStyle = '#0a7a46'; x.fillText('Ouvert · Ferme à 20 h', 40, 970);
    ['Itinéraire', 'Appeler', 'Site web'].forEach((s, i) => { rr(x, 40 + i * 192, 1010, 176, 84, 42, i ? '#eef3ff' : '#5c4ade'); x.fillStyle = i ? '#5c4ade' : '#fff'; x.font = '800 28px IT'; x.fillText(s, 62 + i * 192, 1063); });
    cover(x, imgs.bake, 40, 1130, 270, 180); cover(x, imgs.bread, 330, 1130, 270, 180);
  } else if (kind === 'avis') {
    x.fillStyle = '#000'; x.font = '64px Anton'; x.fillText('AVIS CLIENTS', 40, 160);
    [['Julie M.', 'Le meilleur croissant du quartier !', 'Merci Julie, à très vite ! 🙏'], ['Karim B.', 'Accueil top, pain toujours frais.', 'Merci Karim, ça nous touche ! 😊'], ['Léa P.', 'Commande prête à l’heure, parfait.', 'Merci Léa, bonne dégustation !']].forEach(([n, r, a], i) => {
      const y = 220 + i * 370;
      rr(x, 30, y, W - 60, 340, 30, '#f6f6f6');
      x.fillStyle = '#000'; x.font = '800 34px IT'; x.fillText(n, 60, y + 60);
      x.fillStyle = '#e8a400'; x.font = '700 30px IT'; x.fillText('★★★★★', 360, y + 60);
      x.fillStyle = '#222'; x.font = '600 30px IT'; x.fillText(r, 60, y + 115);
      rr(x, 60, y + 150, W - 120, 160, 24, '#e9ccff');
      x.fillStyle = '#5c4ade'; x.font = '800 24px IT'; x.fillText('RÉPONSE AUTOMATIQUE', 90, y + 195);
      x.fillStyle = '#000'; x.font = '600 30px "IT","Noto Color Emoji"'; x.fillText(a, 90, y + 250);
    });
  } else if (kind === 'posts') {
    x.fillStyle = '#000'; x.font = '800 36px IT'; x.fillText('boulangerieducoin', 40, 140);
    x.font = '600 28px IT'; x.fillStyle = '#444'; x.fillText('3 posts / semaine · publiés pour vous', 40, 190);
    const list = ['bake', 'bread', 'flor', 'chef', 'posts', 'barber', 'grill', 'cash', 'open'];
    list.forEach((k, i) => cover(x, imgs[k], 10 + (i % 3) * 210, 230 + Math.floor(i / 3) * 290, 200, 280));
    rr(x, 40, 1140, W - 80, 110, 55, '#55db9c'); x.fillStyle = '#000'; x.font = '800 36px IT'; x.fillText('✓ Programmé : demain 12 h', 90, 1207);
  }
  scrTex.needsUpdate = true;
}

// particules de fond
const PART = new THREE.Group();
for (let i = 0; i < 70; i++) {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(.08 + rnd(i) * .18, 1), new THREE.MeshBasicMaterial({ color: [0xffd731, 0x55db9c, 0xe9ccff, 0xffffff][i % 4], transparent: true, opacity: .8 }));
  m.position.set((rnd(i + 1) - .5) * 22, (rnd(i + 2) - .5) * 38, -rnd(i + 3) * 25);
  m.userData.v = .3 + rnd(i + 4); PART.add(m);
}
scene.add(PART);

/* ---------- utilitaires d'effets ---------- */
function setUI(id, op, tf = '') { const e = $(id); e.style.opacity = op; e.style.transform = tf; }
function popIn(t, t0, dur = .35) { const k = prog(t, t0, t0 + dur); return { op: k > 0 ? 1 : 0, s: lerp(.2, 1, outBack(k)), k }; }
const grainCtx = $('grain').getContext('2d');
const grainImg = grainCtx.createImageData(360, 640);
function grain(frame) {
  const d = grainImg.data; let s = frame * 9301 + 49297;
  for (let i = 0; i < d.length; i += 4) { s = (s * 1103515245 + 12345) & 0x7fffffff; const v = (s >> 16) & 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
  grainCtx.putImageData(grainImg, 0, 0);
}
const IMPACTS = [0, 0.27, 0.55, 0.82, 2.85, 3.7, 4.55, 5.1, 12.12, 13.62, 15.8, 17.38, 19.0];
const WHIPS = [5.85, 6.55, 7.40, 7.95, 4.42, 9.35, 11.88, 14.5];
const FLASHES = [[0, .12], [2.82, .22], [4.42, .2], [11.86, .16], [17.30, .2], [18.98, .18]];
const LEAKS = [[4.35, 5.4], [8.4, 9.4], [16.9, 17.9], [18.9, 20.2]];

/* ---------- rendu d'une image ---------- */
window.seek = (t, frame = Math.round(t * 30)) => {
  // tremblement d'impact
  let shx = 0, shy = 0, shr = 0;
  for (const i of IMPACTS) { const k = t - i; if (k >= 0 && k < .35) { const a = (1 - k / .35) ** 2 * 22; shx += (rnd(frame) - .5) * a; shy += (rnd(frame + 7) - .5) * a; shr += (rnd(frame + 3) - .5) * a * .05; } }
  $('stage').style.transform = `translate(${shx}px,${shy}px) rotate(${shr}deg)`;

  // fonds
  const darkScene = win(t, 2.58, 5.85) || win(t, 11.88, 17.32) || t >= 19.0;
  $('bg').style.opacity = darkScene ? 1 : 0;
  $('bg2').style.opacity = win(t, 14.5, 17.32) ? 1 : 0;

  // photos
  let anyShot = false;
  SHOTS.forEach(([img, a, b, fx, z0, z1, dx, dy], i) => {
    const el = shotEls[i];
    if (!win(t, a, b)) { el.style.opacity = 0; return; }
    anyShot = true;
    const k = prog(t, a, b);
    let s = lerp(z0, z1, inOut(k)), x = dx * k, y = dy * k, blur = 0, skew = 0;
    const e = prog(t, a, a + .2);
    if (fx === 'punch') { s *= lerp(1.35, 1, outExpo(e)); blur = lerp(14, 0, outExpo(e)); }
    if (fx === 'whipL' || fx === 'whipR') { const d = fx === 'whipL' ? 1 : -1; x += d * lerp(900, 0, outExpo(e)); blur = lerp(22, 0, outExpo(e)); skew = d * lerp(-12, 0, outExpo(e)); }
    let filt = `contrast(1.14) saturate(1.28) brightness(.96) blur(${blur.toFixed(1)}px)`;
    if (img === 'flor' && i === 3) { // « invisible » : la boutique s'éteint
      const g = prog(t, 1.2, 2.2);
      filt = `contrast(${lerp(1.14, 1.3, g)}) saturate(${lerp(1.28, 0, g)}) brightness(${lerp(.96, .35, g)}) blur(${lerp(blur, 6, g).toFixed(1)}px)`;
    }
    if (img === 'cash') { const n = prog(t, 10.95, 11.4); filt += ` hue-rotate(${lerp(0, -25, n)}deg) brightness(${lerp(1, .7, n)})`; }
    el.style.opacity = 1;
    el.style.filter = filt;
    el.style.transform = `translate(${x}px,${y}px) scale(${s}) skewX(${skew}deg)`;
  });
  $('grade').style.opacity = anyShot ? .85 : 0;
  $('shade').style.opacity = anyShot ? 1 : 0;
  $('night').style.opacity = win(t, 9.35, 11.88) ? lerp(0, .75, prog(t, 10.95, 11.4)) : 0;

  // glitch RGB sur « invisible sur Google »
  const gOn = (win(t, 1.62, 1.78) || win(t, 1.95, 2.05) || win(t, 2.3, 2.5)) ? 1 : 0;
  const gl = $('glitch'); gl.style.opacity = gOn;
  if (gOn) [...gl.children].forEach((d, j) => {
    d.style.backgroundImage = `url(${P.flor})`;
    const y0 = rnd(frame * 3 + j) * 80, h = 6 + rnd(frame * 5 + j) * 16;
    d.style.clipPath = `inset(${y0}% 0 ${100 - y0 - h}% 0)`;
    d.style.transform = `translateX(${(rnd(frame + j * 13) - .5) * 160}px) scale(1.1)`;
    d.style.filter = ['saturate(0) brightness(.5) sepia(1) hue-rotate(-50deg) saturate(6)', 'saturate(0) brightness(.6) sepia(1) hue-rotate(140deg) saturate(6)', 'grayscale(1) contrast(2)'][j];
    d.style.mixBlendMode = 'screen';
  });

  /* --- 3D --- */
  [J30, PRICE, PCT, J30b, COIN, PIN, PHONE].forEach(o => (o.visible = false));
  cam.position.set(0, 0, 30); cam.rotation.set(0, 0, 0);
  PART.visible = darkScene;
  PART.children.forEach((m, i) => { m.position.y = ((rnd(i + 2) - .5) * 38 + t * m.userData.v * 1.5 + 19) % 38 - 19; m.rotation.x = t * m.userData.v; });

  // épingle : tombe puis disparaît (« invisible »)
  if (win(t, 1.1, 2.58)) {
    PIN.visible = true;
    const d = prog(t, 1.1, 1.45);
    PIN.position.set(0, lerp(14, 3.2, outBack(d, 1.2)), 0);
    PIN.rotation.y = t * 2.4;
    const fade = prog(t, 1.75, 2.35);
    const flick = fade > 0 && fade < 1 ? (rnd(frame) > fade ? 1 : 0) : (fade >= 1 ? 0 : 1);
    PIN.children.forEach(c => { c.material.transparent = true; c.material.opacity = flick; });
    PIN.scale.setScalar(lerp(1, .6, fade));
  }
  // J-30 qui s'écrase vers la caméra
  if (win(t, 2.58, 4.5)) {
    J30.visible = true;
    const a = prog(t, 2.62, 2.85);
    const z = lerp(-80, 0, inExpo(a) * .2 + outExpo(a) * .8);
    J30.position.set(0, 2.2, z);
    const spin = prog(t, 3.62, 4.05); // « c'est fini » : vrille en speed ramp
    J30.rotation.set(lerp(.5, -.12, outExpo(a)) + Math.sin(t * 2) * .05, inOut(spin) * Math.PI * 2 + Math.sin(t * 1.6) * .25, lerp(-.25, 0, outExpo(a)));
    const out = prog(t, 4.1, 4.45);
    J30.position.z += inExpo(out) * 26;
    J30.scale.setScalar(lerp(1, 1.08, prog(t, 2.85, 3.6)));
  }
  // pièce logo
  if (win(t, 4.42, 5.85)) {
    COIN.visible = true;
    const a = prog(t, 4.45, 5.15);
    COIN.position.set(0, lerp(8, 2.6, outBack(prog(t, 4.45, 4.85), 1.4)), 0);
    COIN.rotation.set(.12, lerp(Math.PI * 6, 0, outExpo(a)) + Math.sin(t * 2) * .12, 0);
    COIN.scale.setScalar(1 + Math.max(0, Math.sin(prog(t, 5.08, 5.35) * Math.PI)) * .12);
  }
  // téléphone + écrans
  if (win(t, 5.85, 9.35)) {
    PHONE.visible = true;
    const a = prog(t, 5.85, 6.25);
    const scr = t < 6.55 ? 'site' : t < 7.40 ? 'gmap' : t < 7.95 ? 'avis' : 'posts';
    drawScreen(scr, t);
    PHONE.position.set(0, lerp(-24, -.6, outExpo(a)), 0);
    const flip = [6.55, 7.40, 7.95].reduce((acc, c) => acc + inOut(prog(t, c - .05, c + .25)), 0);
    PHONE.rotation.set(lerp(.6, .05, outExpo(a)), Math.sin(t * 1.3) * .22 - lerp(.9, 0, outExpo(a)) + flip * Math.PI * 2, Math.sin(t) * .04);
    const outk = prog(t, 8.6, 9.35);
    PHONE.scale.setScalar(lerp(1, .82, inOut(outk)));
  }
  // prix 3D
  if (win(t, 11.88, 14.5)) {
    PRICE.visible = true;
    const a = prog(t, 12.0, 12.3);
    PRICE.position.set(0, 3.2, lerp(-70, 0, outExpo(a)));
    PRICE.rotation.set(Math.sin(t * 1.4) * .08, lerp(-1.4, 0, outExpo(a)) + Math.sin(t * 1.1) * .22, 0);
  }
  // -30 %
  if (win(t, 14.5, 17.32)) {
    PCT.visible = true;
    const a = prog(t, 15.66, 15.95);
    PCT.position.set(0, 2.6, lerp(-90, 0, outExpo(a)));
    PCT.rotation.set(Math.sin(t * 1.5) * .07, lerp(2, 0, outExpo(a)) + Math.sin(t * 1.2) * .2, 0);
    PCT.visible = a > 0;
  }
  // fin : logo + J-30
  if (t >= 19.0) {
    COIN.visible = true; J30b.visible = true;
    const a = prog(t, 19.0, 19.5);
    COIN.position.set(0, lerp(14, 5.4, outBack(a, 1.3)), 0);
    COIN.rotation.set(.1, lerp(Math.PI * 4, 0, outExpo(a)) + Math.sin(t * 2) * .15, 0);
    COIN.scale.setScalar(.65);
    const b = prog(t, 19.2, 19.55);
    J30b.position.set(0, 1.7, lerp(-60, 0, outExpo(b)));
    J30b.rotation.set(Math.sin(t * 1.5) * .07, Math.sin(t * 1.2) * .3, 0);
  }
  renderer.render(scene, cam);

  /* --- UI 2D --- */
  // nom de marque
  { const p = popIn(t, 4.6, .4); const vis = win(t, 4.6, 5.85); setUI('brand', vis ? p.op : 0, `translateY(${lerp(80, 0, outExpo(p.k))}px)`); $('brand').style.letterSpacing = lerp(.4, .02, outExpo(p.k)) + 'em'; }
  // étiquette service
  {
    const names = [[5.93, 'Site internet'], [6.62, 'Fiche Google'], [7.45, 'Avis clients'], [7.99, 'Posts réseaux'], [8.6, 'On gère tout']];
    let cur = null; names.forEach(n => { if (t >= n[0]) cur = n; });
    const vis = win(t, 5.93, 9.35) && cur;
    if (cur) $('svcName').textContent = cur[1];
    const p = cur ? popIn(t, cur[0], .3) : { op: 0, s: 1 };
    setUI('svcTag', vis ? 1 : 0, `scale(${p.s})`);
  }
  // chat IA
  { const v = win(t, 9.35, 11.88);
    const a = popIn(t, 9.55, .35), b = popIn(t, 10.05, .35);
    setUI('b1', v ? a.op : 0, `translateY(${lerp(60, 0, outExpo(a.k))}px) scale(${a.s})`);
    setUI('b2', v ? b.op : 0, `translateY(${lerp(60, 0, outExpo(b.k))}px) scale(${b.s})`);
    const night = t >= 11.0;
    $('clockIc').textContent = night ? '🌙' : '☀️'; $('clockT').textContent = night ? '23:47' : '14:02';
    const c = popIn(t, night ? 11.0 : 9.4, .3); setUI('clock', v ? 1 : 0, `scale(${c.s})`);
  }
  // prix
  { const v = win(t, 11.88, 14.5); const a = popIn(t, 12.78, .3); setUI('perMonth', v ? a.op : 0, `translateY(${lerp(50, 0, outExpo(a.k))}px)`);
    const s = popIn(t, 13.62, .32); setUI('stamp', v ? s.op : 0, `rotate(-5deg) scale(${lerp(2.4, 1, outExpo(s.k))})`); }
  // offre fondateurs
  { const v = win(t, 14.5, 17.32); const a = popIn(t, 14.55, .3); setUI('founders', v ? a.op : 0, `scale(${a.s})`);
    const b = popIn(t, 16.5, .3); setUI('annual', v ? b.op : 0, `translateY(${lerp(60, 0, outExpo(b.k))}px)`);
    $('seats').style.opacity = v ? 1 : 0;
    [...$('seats').children].forEach((d, i) => { const p = popIn(t, 14.75 + i * .045, .25); d.style.opacity = p.op; d.style.transform = `scale(${p.s})`;  });
  }
  // fin
  { const v = t >= 19.0; const a = popIn(t, 19.35, .35); setUI('endTag', v ? a.op : 0, `translateY(${lerp(40, 0, outExpo(a.k))}px)`);
    const b = popIn(t, 19.55, .35); const pulse = 1 + Math.max(0, Math.sin((t - 19.9) * 7)) * .06 * (t > 19.9);
    setUI('follow', v ? b.op : 0, `scale(${b.s * pulse})`); }

  // light leaks, flashs, grain
  let leak = 0; LEAKS.forEach(([a, b]) => { if (win(t, a, b)) leak = Math.max(leak, Math.sin(prog(t, a, b) * Math.PI)); });
  $('leak').style.opacity = leak * .85;
  $('leak').style.transform = `translateX(${Math.sin(t * .9) * 60}px) scale(1.2)`;
  let fl = 0; FLASHES.forEach(([a, d]) => { if (win(t, a, a + d)) fl = Math.max(fl, 1 - prog(t, a, a + d)); });
  WHIPS.forEach(a => { if (win(t, a - .03, a + .08)) fl = Math.max(fl, .35); });
  $('flash').style.opacity = fl;
  grain(frame);
  renderCaps(t);
};
window.ready = true;
if (!location.search.includes('render')) {
  const t0 = performance.now();
  (function loop() { seek(((performance.now() - t0) / 1000) % END); requestAnimationFrame(loop); })();
}
