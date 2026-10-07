// SCALIFY — film de lancement, direction « Matière & lumière ».
// Rendu déterministe image par image via seek(t). ?v → composition verticale 1080×1920.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { TTFLoader } from 'three/addons/loaders/TTFLoader.js';
import { Font } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const VERT = location.search.includes('v');
const W = VERT ? 1080 : 1920, H = VERT ? 1920 : 1080, END = 33;
const root = document.documentElement.style;
root.setProperty('--W', W + 'px'); root.setProperty('--H', H + 'px'); root.setProperty('--u', (VERT ? 1.02 : 1) + 'px');
const $ = id => document.getElementById(id);
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const pr = (t, a, b) => cl((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const io = k => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const oe = k => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));
const oc = k => 1 - Math.pow(1 - k, 3);
const ic = k => k * k * k;
const ob = (k, s = 1.6) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
const win = (t, a, b) => t >= a && t < b;
let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// ---------------------------------------------------------------- moteur
const canvas = $('c'); canvas.width = W; canvas.height = H;
const R = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
R.setSize(W, H, false); R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05; R.outputColorSpace = THREE.SRGBColorSpace;
const S = new THREE.Scene();
const pm = new THREE.PMREMGenerator(R); S.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
const cam = new THREE.PerspectiveCamera(VERT ? 52 : 30, W / H, .1, 200);
const bgc = document.createElement('canvas'); bgc.width = 4; bgc.height = 256; const bgx = bgc.getContext('2d');
const bgTex = new THREE.CanvasTexture(bgc); bgTex.colorSpace = THREE.SRGBColorSpace; S.background = bgTex;
const key = new THREE.DirectionalLight('#ffb27a', 3); key.position.set(-4, 3, 5); S.add(key);
const rim = new THREE.DirectionalLight('#ffffff', 2); rim.position.set(5, -2, 3); S.add(rim);
const fill = new THREE.AmbientLight('#ffffff', .25); S.add(fill);
const comp = new EffectComposer(R); comp.setSize(W, H);
comp.addPass(new RenderPass(S, cam));
const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), .22, .5, .96); comp.addPass(bloom);
comp.addPass(new OutputPass());

// fond : trois teintes selon la scène
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const PAL = { night: ['#030405', '#07090c', '#0d1016'], warm: ['#1b0d0a', '#5a1f12', '#e0773a'], ember: ['#050303', '#170a06', '#3a160b'] };
function setBg(a, b, k) {
  const g = bgx.createLinearGradient(0, 0, 0, 256);
  [0, .55, 1].forEach((s, i) => { const A = hex(PAL[a][i]), B = hex(PAL[b][i]); g.addColorStop(s, `rgb(${A.map((v, j) => Math.round(lerp(v, B[j], k))).join(',')})`); });
  bgx.fillStyle = g; bgx.fillRect(0, 0, 4, 256); bgTex.needsUpdate = true;
}

// ---------------------------------------------------------------- logo chromé
const chrome = new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: 1, roughness: .12, clearcoat: 1 });
const logo = new THREE.Group();
{
  const svg = new SVGLoader().parse('<svg viewBox="0 0 32 32"><path d="M21 10.8H13.9a2.85 2.85 0 0 0 0 5.7h4.3a2.85 2.85 0 0 1 0 5.7H11"/></svg>');
  const pts = svg.paths[0].subPaths[0].getPoints(120).map(v => new THREE.Vector3(v.x - 16, -(v.y - 16.3), 0));
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  logo.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 400, 1.55, 48, false), chrome));
  for (const e of [pts[0], pts[pts.length - 1]]) { const s = new THREE.Mesh(new THREE.SphereGeometry(1.55, 48, 32), chrome); s.position.copy(e); logo.add(s); }
  logo.scale.setScalar(.16);
}
const logoPivot = new THREE.Group(); logoPivot.add(logo); S.add(logoPivot);

// ---------------------------------------------------------------- textures d'interface (canvas)
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
function txt(g, s, x, y, font, col, align = 'left') { g.font = font; g.fillStyle = col; g.textAlign = align; g.fillText(s, x, y); }
function pill(g, s, x, y, bg, fg, font = '600 40px IT') { g.font = font; const w = g.measureText(s).width + 56; rr(g, x, y, w, 70, 35); g.fillStyle = bg; g.fill(); txt(g, s, x + 28, y + 48, font, fg); return w; }
function bubble(g, s, x, y, w, dark, a) {
  if (a <= 0) return 0; g.save(); g.globalAlpha = a; g.translate(0, (1 - a) * 24);
  g.font = '500 44px IT'; const words = s.split(' '); const lines = []; let L = '';
  for (const wd of words) { const tst = L ? L + ' ' + wd : wd; if (g.measureText(tst).width > w - 72) { lines.push(L); L = wd; } else L = tst; } lines.push(L);
  const h = 44 + lines.length * 58; const bx = dark ? 2048 - 110 - w : 110;
  rr(g, bx, y, w, h, 36); g.fillStyle = dark ? '#16171b' : '#efebe5'; g.fill();
  lines.forEach((l, i) => txt(g, l, bx + 36, y + 70 + i * 58, '500 44px IT', dark ? '#fff' : '#1b1c20'));
  g.restore(); return h;
}
const IMG = {}; for (const n of ['bread', 'latte']) { const im = new Image(); im.src = `ph_${n}.jpg`; IMG[n] = im; }
const DRAW = [
  (g, p) => { // 01 avis
    txt(g, 'Avis Google', 110, 170, '600 70px IT', '#121316'); txt(g, '★ 4,8 · 212 avis', 1940, 170, '500 50px IT', '#b8862f', 'right');
    rr(g, 110, 250, 1828, 420, 40); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = '#0000000f'; g.lineWidth = 3; g.stroke();
    txt(g, '★★★★★', 170, 350, '60px IT', '#e3a72f'); txt(g, 'Julie · il y a 2 min', 1880, 345, '400 40px IT', '#7a7b80', 'right');
    txt(g, '« Les meilleurs croissants du quartier ! »', 170, 500, 'italic 92px IS', '#16171b');
    const a = oc(cl((p - .25) / .2)); bubble(g, 'Merci Julie ! On vous garde les plus dorés pour samedi.', 0, 730, 1300, true, a);
    if (p > .5) { g.save(); g.globalAlpha = oc(cl((p - .5) / .15)); pill(g, '✓ Répondu par Scalify en 30 s', 110, 1100, '#178a5520', '#137a4a', '600 46px IT'); g.restore(); }
  },
  (g, p) => { // 02 messages de nuit
    txt(g, 'Messages', 110, 170, '600 70px IT', '#121316'); txt(g, '23:47', 1940, 170, '500 50px JM', '#7a7b80', 'right');
    let y = 250;
    y += bubble(g, 'Bonsoir ! Il vous reste une table samedi soir ?', 0, y, 1300, false, oc(cl((p - .08) / .15))) + 34;
    y += bubble(g, 'Oui ! Table pour 4 à 20 h, je vous la réserve ?', 0, y, 1300, true, oc(cl((p - .3) / .15))) + 34;
    y += bubble(g, 'Parfait, merci !', 0, y, 700, false, oc(cl((p - .48) / .15))) + 50;
    if (p > .62) { g.save(); g.globalAlpha = oc(cl((p - .62) / .15)); pill(g, '✓ Réservation confirmée · samedi 20 h', 110, Math.min(y, 1130), '#178a5520', '#137a4a', '600 46px IT'); g.restore(); }
  },
  (g, p) => { // 03 site + fiche Google
    rr(g, 110, 110, 1060, 1060, 40); g.save(); g.clip();
    if (IMG.bread.complete) { const im = IMG.bread, s = Math.max(1060 / im.width, 1060 / im.height); g.drawImage(im, 110 + (1060 - im.width * s) / 2, 110 + (1060 - im.height * s) / 2, im.width * s, im.height * s); }
    const gr = g.createLinearGradient(0, 600, 0, 1170); gr.addColorStop(0, '#0000'); gr.addColorStop(1, '#000c'); g.fillStyle = gr; g.fillRect(110, 110, 1060, 1060);
    g.fillStyle = '#ffffffe8'; g.fillRect(110, 110, 1060, 80); txt(g, 'boulangerie-martin.fr', 170, 165, '500 36px IT', '#55565b');
    txt(g, 'Boulangerie', 170, 960, 'italic 96px IS', '#fff'); txt(g, 'Martin', 170, 1060, 'italic 96px IS', '#fff'); g.restore();
    const a = oc(cl((p - .15) / .2)); g.save(); g.globalAlpha = a; g.translate((1 - a) * 40, 0);
    rr(g, 1230, 110, 710, 1060, 40); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = '#0000000f'; g.lineWidth = 3; g.stroke();
    txt(g, 'Google', 1290, 200, '600 44px IT', '#4a4b50'); txt(g, 'Boulangerie Martin', 1290, 300, '600 56px IT', '#121316');
    txt(g, '4,8 ★★★★★ (212)', 1290, 380, '500 42px IT', '#b8862f'); txt(g, 'Ouvert · Ferme à 19 h', 1290, 460, '500 42px IT', '#178a55');
    ['Itinéraire', 'Appeler', 'Site web'].forEach((s, i) => { rr(g, 1290, 540 + i * 110, 590, 84, 42); g.fillStyle = '#f1eee9'; g.fill(); txt(g, s, 1585, 595 + i * 110, '600 40px IT', '#16171b', 'center'); });
    g.restore();
    if (p > .45) { g.save(); g.globalAlpha = oc(cl((p - .45) / .15)); pill(g, '✓ Mis à jour par Scalify', 1290, 1000, '#178a5520', '#137a4a', '600 40px IT'); g.restore(); }
  },
];
function makePanel(draw) {
  const c = document.createElement('canvas'); c.width = 2048; c.height = 1280; const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const grp = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(3.2, 2.0, .1, 6, .1), new THREE.MeshPhysicalMaterial({ color: '#d9cfc6', roughness: .35, clearcoat: 1, clearcoatRoughness: .08, transparent: true }));
  const shape = new THREE.Shape(); const w = 3.06, h = 1.913, r = .08;
  shape.moveTo(-w / 2 + r, -h / 2); shape.lineTo(w / 2 - r, -h / 2); shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); shape.lineTo(w / 2, h / 2 - r); shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  shape.lineTo(-w / 2 + r, h / 2); shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); shape.lineTo(-w / 2, -h / 2 + r); shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  const sg = new THREE.ShapeGeometry(shape, 12); const uv = sg.attributes.uv, ps = sg.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, ps.getX(i) / w + .5, ps.getY(i) / h + .5);
  const face = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
  face.position.z = .052; grp.add(body, face); grp.visible = false; S.add(grp);
  return { grp, body, face, g, tex, draw, last: -1 };
}
const PANELS = DRAW.map(makePanel);
// barres chromées (04 croissance)
const bars = new THREE.Group(); const BH = [.35, .45, .42, .6, .72, .85, 1.05, 1.35];
BH.forEach((h, i) => { const m = new THREE.Mesh(new RoundedBoxGeometry(.26, 1, .26, 4, .06), chrome); m.position.x = (i - 3.5) * .38; bars.add(m); });
bars.visible = false; S.add(bars);

// ---------------------------------------------------------------- tuiles du chaos
const NOTES = ['Nouvel avis · 1 ★', 'Appel manqué', 'Message Instagram', 'Commande en attente', 'Fiche Google : horaires ?', '3 messages non lus', 'Devis à envoyer', 'Avis sans réponse',
  'Post à publier', 'Réservation ?', 'Stock farine bas', 'Facture fournisseur', 'Appel manqué (2)', 'Nouveau message', 'Avis · 2 ★', 'Rappeler M. Petit'];
const tiles = [];
function noteTex(s, hot) {
  const c = document.createElement('canvas'); c.width = 640; c.height = 200; const g = c.getContext('2d');
  rr(g, 4, 4, 632, 192, 40); g.fillStyle = '#17181cee'; g.fill(); g.strokeStyle = '#ffffff22'; g.lineWidth = 3; g.stroke();
  g.fillStyle = hot ? '#ff7a4d' : '#ffd9b8'; g.beginPath(); g.arc(70, 100, 16, 0, 7); g.fill();
  txt(g, s, 110, 116, '500 46px IT', '#f3efe9');
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function buildTiles() {
  seed = 9; const geo = new RoundedBoxGeometry(1.6, .5, .03, 3, .06);
  for (let i = 0; i < 64; i++) {
    const s = NOTES[i % NOTES.length], mat = new THREE.MeshStandardMaterial({ map: noteTex(s, rnd() < .3), roughness: .4, metalness: .1, emissive: '#ffffff', emissiveIntensity: .25, transparent: true });
    mat.emissiveMap = mat.map; const m = new THREE.Mesh(geo, mat);
    const a = rnd() * 6.283, rad = 1.6 + rnd() * 4.2;
    tiles.push({ m, x: Math.cos(a) * rad * (VERT ? .55 : 1.3), y: (rnd() - .5) * (VERT ? 9 : 5), z: -7 + rnd() * 10, rs: (rnd() - .5) * 2, ts: .2 + Math.pow(rnd(), .5) * 3.8, ph: rnd() * 6 });
    S.add(m);
  }
}
// ---------------------------------------------------------------- « 26 » chromé
let num = null;
async function buildNum() {
  const data = await new Promise(r => new TTFLoader().load('fonts/InstrumentSerif-normal.ttf', r));
  const geo = new TextGeometry('26', { font: new Font(data), size: 2.2, depth: .45, curveSegments: 24, bevelEnabled: true, bevelThickness: .06, bevelSize: .035, bevelSegments: 6 });
  geo.center(); num = new THREE.Mesh(geo, chrome); num.visible = false; S.add(num);
}

// ---------------------------------------------------------------- titres HTML
function show(el, t, a, b, { dy = 18, blur = 12, x = 0 } = {}) {
  if (!win(t, a, b)) { el.style.opacity = 0; return; }
  const k = oc(pr(t, a, a + .6)), o = pr(t, b - .35, b);
  el.style.opacity = k * (1 - o); el.style.transform = `translate(${x}px,${(1 - k) * dy - o * 8}px)`; el.style.filter = `blur(${(1 - k) * blur + o * 6}px)`;
}
function place() {
  const sideL = VERT ? 'left:7%;right:7%;top:9%;text-align:center' : 'left:5.5%;top:31%;width:38%';
  for (const id of ['p1', 'p2', 'p3', 'p4']) $(id).style.cssText = sideL;
  $('c1').style.top = '44%'; $('c2').style.top = '44%';
  $('voici').style.top = VERT ? '64%' : '70%'; $('voiciS').style.top = VERT ? '71%' : '82%';
  $('v1').style.bottom = $('v2').style.bottom = VERT ? '24%' : '14%';
  $('lt').style.top = VERT ? '30%' : '17%'; $('jrs').style.top = VERT ? '62%' : '75%'; $('prep').style.top = VERT ? '70%' : '83%';
  $('fin1').style.top = VERT ? '46%' : '40%'; $('fin2').style.top = VERT ? '56%' : '58%'; $('fin3').style.top = VERT ? '64%' : '70%';
  if (VERT) { for (const id of ['c1', 'c2']) $(id).style.cssText += ';white-space:normal;padding:0 8%'; $('fin2').style.cssText += ';padding:0 8%'; $('fin3').style.cssText += ';padding:0 6%;line-height:1.6'; }
  else for (const id of ['c1', 'c2', 'voici', 'fin1', 'fin2']) $(id).style.whiteSpace = 'nowrap';
}

// ---------------------------------------------------------------- grain
const gr = $('grain'), gx = gr.getContext('2d'), gimg = gx.createImageData(480, 270);
function grain(f) { let s = 1000 + f; const d = gimg.data; for (let i = 0; i < d.length; i += 4) { s = (s * 16807) % 2147483647; const v = s / 2147483647 * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } gx.putImageData(gimg, 0, 0); }

// ---------------------------------------------------------------- timeline
const PT = [[8.6, 11.8], [11.8, 15.0], [15.0, 18.2], [18.2, 21.2]];
const PX = VERT ? 0 : 1.7, PY = VERT ? -.95 : -.12;
window.seek = (t, frame = Math.round(t * 30)) => {
  // ---- fond
  if (t < 4.8) setBg('night', 'night', 0);
  else if (t < 21.2) setBg('night', 'warm', oc(pr(t, 5.6, 7.0)));
  else setBg('warm', 'ember', io(pr(t, 21.0, 22.0)));
  // ---- caméra
  let cz = 9, cx = 0, cy = 0, lx = 0, ly = 0;
  if (t < 4.8) { cz = lerp(10, 4.2, ic(pr(t, 0, 4.5)) * .7 + pr(t, 0, 4.5) * .3); cx = Math.sin(t * .6) * .4; cy = Math.cos(t * .5) * .2; }
  else if (t < 8.6) { cz = lerp(8.4, 7.4, io(pr(t, 4.8, 8.6))); }
  else if (t < 21.2) { const i = PT.findIndex(([a, b]) => win(t, a, b)), [a, b] = PT[i]; cz = lerp(VERT ? 8.6 : 8.2, VERT ? 7.9 : 7.5, io(pr(t, a, b))); cx = lerp(-.25, .25, pr(t, a, b)) * (i % 2 ? -1 : 1); lx = PX * .35; }
  else if (t < 26.9) { cz = lerp(8.2, 7.0, io(pr(t, 21.2, 26.9))); }
  else if (t < 30.2) { cz = lerp(9.5, 8.6, oc(pr(t, 26.9, 30.2))); }
  else { cz = lerp(8.4, 7.8, io(pr(t, 30.2, 33))); }
  cam.position.set(cx, cy, cz); cam.lookAt(lx, ly, 0);
  key.position.set(-4 + Math.sin(t * .3) * 1.5, 3, 5);
  // ---- tuiles du chaos
  for (const T of tiles) {
    const vis = t < 4.5 ? t >= T.ts : win(t, 4.8, 6.6);
    T.m.visible = vis; if (!vis) continue;
    const tt = Math.min(t, 4.5), spin = tt * (.4 + 1.6 * pr(tt, 1.5, 4.5));
    let x = T.x + Math.sin(tt * .7 + T.ph) * .3, y = T.y + Math.cos(tt * .5 + T.ph) * .2, z = T.z;
    T.m.rotation.set(Math.sin(T.ph + spin * T.rs) * .6, spin * T.rs, Math.cos(T.ph) * .2);
    let sc = oc(pr(t, T.ts, T.ts + .35));
    if (t >= 4.8) { // aspiration vers le centre
      const k = ic(pr(t, 4.85, 6.3)); x = lerp(x, 0, k); y = lerp(y, .35, k); z = lerp(z, 0, k); sc = 1 - k;
      T.m.rotation.y += k * 6;
    }
    T.m.position.set(x, y, z); T.m.scale.setScalar(Math.max(.001, sc));
    T.m.material.opacity = t >= 4.8 ? 1 - pr(t, 6.1, 6.4) : 1;
  }
  // ---- logo
  let lv = false, ls = 1, lpx = 0, lpy = .35, lry = 0;
  if (win(t, 5.9, 8.75)) { lv = true; const k = ob(pr(t, 6.05, 6.85), 1.4); ls = Math.max(.001, k) * lerp(1, 1.06, pr(t, 6.8, 8.6)); lry = lerp(-2.4, -.45, oe(pr(t, 6.05, 7.2))) + Math.sin(t * .8) * .05; ls *= 1 - pr(t, 8.4, 8.75); }
  if (win(t, 21.2, 26.6)) { lv = true; ls = oc(pr(t, 21.25, 22.3)) * lerp(.9, 1.0, pr(t, 21.2, 26.6)) * (1 - pr(t, 26.4, 26.6)); lry = -.45 + Math.sin(t * .5) * .25; lpy = VERT ? .55 : .3; }
  if (t >= 30.2) { lv = true; ls = oc(pr(t, 30.25, 31)) * .55; lry = -.3 + Math.sin(t * .6) * .2; lpy = VERT ? 2.05 : 1.15; }
  logoPivot.visible = lv; logoPivot.scale.setScalar(Math.max(.001, ls)); logoPivot.position.set(lpx, lpy, 0); logoPivot.rotation.set(-.12, lry, .04);
  // ---- panneaux
  PANELS.forEach((P, i) => {
    const [a, b] = PT[i]; const on = win(t, a - .1, b + .05); P.grp.visible = on; if (!on) return;
    const kin = oe(pr(t, a, a + .9)), kout = ic(pr(t, b - .45, b + .05)), p = pr(t, a + .3, b - .4);
    P.grp.position.set(PX + (1 - kin) * 1.2 - kout * 3.2, PY + (1 - kin) * -.3, lerp(-4, 0, kin));
    P.grp.rotation.set(lerp(.25, .04, kin) + Math.sin(t * .6) * .015, lerp(VERT ? .4 : -.7, VERT ? -.06 : -.16, kin) + kout * .5 + Math.sin(t * .5) * .02, 0);
    P.grp.scale.setScalar((VERT ? 1.02 : 1.04));
    const op = cl(kin * 1.4) * (1 - kout); P.body.material.opacity = op; P.face.material.opacity = op;
    const q = Math.round(p * 60); if (q !== P.last) { P.last = q; P.g.clearRect(0, 0, 2048, 1280); rr(P.g, 0, 0, 2048, 1280, 70); P.g.fillStyle = '#ece5dc'; P.g.fill(); P.draw(P.g, p); P.tex.needsUpdate = true; }
  });
  // barres
  { const [a, b] = PT[3]; const on = win(t, a - .1, b + .05); bars.visible = on;
    if (on) { const kout = ic(pr(t, b - .45, b + .05)); bars.position.set(PX + .1 - kout * 3, PY - .95, 0); bars.rotation.set(.12, -.35 + Math.sin(t * .4) * .08 + kout * .5, 0);
      bars.children.forEach((m, i) => { const k = oe(pr(t, a + .2 + i * .12, a + .9 + i * .12)); const h = Math.max(.001, BH[i] * 1.6 * k); m.scale.y = h; m.position.y = h / 2; }); } }
  // ---- « 26 »
  if (num) { const on = win(t, 26.9, 30.25); num.visible = on;
    if (on) { const k = oe(pr(t, 26.9, 27.25)); num.position.set(0, VERT ? .2 : .05, lerp(-14, 0, k)); num.rotation.set(-.08, lerp(.9, -.18, oe(pr(t, 26.9, 27.6))) + Math.sin(t * .5) * .06, 0);
      num.scale.setScalar(lerp(1.15, 1, pr(t, 26.9, 30.2)) * (VERT ? .95 : 1) * (1 - pr(t, 30.0, 30.25))); } }
  // ---- textes
  show($('c1'), t, 1.0, 2.9); show($('c2'), t, 2.95, 4.5, { blur: 14 });
  show($('voici'), t, 6.9, 8.55); show($('voiciS'), t, 7.4, 8.55);
  ['p1', 'p2', 'p3', 'p4'].forEach((id, i) => show($(id), t, PT[i][0] + .25, PT[i][1] - .05, { dy: 24 }));
  $('demo').style.opacity = win(t, 8.8, 18.1) ? .9 : 0;
  show($('v1'), t, 21.6, 23.9); show($('v2'), t, 24.0, 26.45);
  show($('lt'), t, 26.55, 30.1, { blur: 8 }); show($('jrs'), t, 27.2, 30.1, { blur: 8 }); show($('prep'), t, 28.0, 30.1);
  show($('fin1'), t, 30.6, 33.5); show($('fin2'), t, 31.1, 33.5); show($('fin3'), t, 31.7, 33.5);
  // ---- lumière, coupures, éclairs
  let bl = 0; if (win(t, 4.5, 4.8)) bl = 1; if (win(t, 26.45, 26.9)) bl = 1; bl = Math.max(bl, pr(t, 32.3, 33));
  $('black').style.opacity = bl;
  let fl = 0; for (const [a, s] of [[6.3, .9], [26.9, 1]]) if (win(t, a, a + .6)) fl = Math.max(fl, s * Math.pow(1 - pr(t, a, a + .6), 2));
  $('flash').style.opacity = fl;
  bloom.strength = .2 + fl * .7;
  $('vig').style.opacity = t < 4.8 ? 1 : .7;
  comp.render(); grain(frame);
};
await document.fonts.ready;
await Promise.all(['italic 40px IS', '40px IS', '500 40px IT', '600 40px IT', '400 40px IT', '40px JM'].map(f => document.fonts.load(f)));
await Promise.all(Object.values(IMG).map(im => im.complete ? 0 : new Promise(r => (im.onload = r))));
place(); buildTiles(); await buildNum();
window.ready = true;
if (!location.search.includes('render')) { const t0 = performance.now(); (function loop() { seek(((performance.now() - t0) / 1000) % END); requestAnimationFrame(loop); })(); }
