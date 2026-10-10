// SCALIFY — « Cette nuit, dans votre commerce… » (16 s). Direction « Matière & lumière ».
// Rendu image par image via seek(t). ?v → 1080×1920 (format principal TikTok/Reels).
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

const JOURS = '23';             // compte à rebours (lancement le 2 novembre)
const VERT = location.search.includes('v');
const W = VERT ? 1080 : 1920, H = VERT ? 1920 : 1080, END = 16;
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
const rim = new THREE.DirectionalLight('#9fb8ff', 1.6); rim.position.set(5, -2, 3); S.add(rim);
S.add(new THREE.AmbientLight('#ffffff', .25));
const comp = new EffectComposer(R); comp.setSize(W, H); comp.addPass(new RenderPass(S, cam));
const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), .22, .5, .96); comp.addPass(bloom); comp.addPass(new OutputPass());
// fond : nuit bleutée → aube cuivrée
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const PAL = { night: ['#03040a', '#0a1022', '#1a2240'], dawn: ['#1b0d0a', '#5a1f12', '#e0773a'], ember: ['#050303', '#170a06', '#3a160b'] };
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
  logo.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'centripetal'), 400, 1.55, 48, false), chrome));
  for (const e of [pts[0], pts[pts.length - 1]]) { const s = new THREE.Mesh(new THREE.SphereGeometry(1.55, 48, 32), chrome); s.position.copy(e); logo.add(s); }
  logo.scale.setScalar(.16);
}
const logoPivot = new THREE.Group(); logoPivot.add(logo); S.add(logoPivot);

// ---------------------------------------------------------------- cartes en verre : ce que Scalify a fait cette nuit
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
function txt(g, s, x, y, font, col, align = 'left') { g.font = font; g.fillStyle = col; g.textAlign = align; g.fillText(s, x, y); }
const CARDS = [
  { n: '3', l: 'avis répondus', s: '« Merci Julie, à samedi ! »', h: '23:47' },
  { n: '2', l: 'réservations prises', s: 'Table pour 4 · samedi 20 h', h: '00:32' },
  { n: '1', l: 'post publié', s: 'Instagram · Facebook · Google', h: '06:00' },
  { n: '✓', l: 'fiche Google à jour', s: 'Horaires du jour vérifiés', h: '06:30' },
];
const CT = [2.3, 4.0, 5.7, 7.4];           // arrivée de chaque carte
const cards = CARDS.map(c => {
  const cv = document.createElement('canvas'); cv.width = 2048; cv.height = 640; const g = cv.getContext('2d');
  rr(g, 0, 0, 2048, 640, 90); g.fillStyle = '#ece5dc'; g.fill();
  txt(g, c.n, 230, 450, 'italic 400px IS', '#16171b', 'center');
  g.fillStyle = '#00000014'; g.fillRect(430, 120, 4, 400);
  txt(g, c.l, 520, 300, '600 104px IT', '#16171b'); txt(g, c.s, 520, 430, '500 66px IT', '#5d5e63');
  txt(g, c.h, 1930, 150, '500 58px JM', '#9a8f84', 'right');
  rr(g, 520, 480, 520, 84, 42); g.fillStyle = '#178a5520'; g.fill(); txt(g, '✓ fait par Scalify', 556, 538, '600 46px IT', '#137a4a');
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const grp = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(3.2, 1.0, .09, 6, .1), new THREE.MeshPhysicalMaterial({ color: '#d9cfc6', roughness: .35, clearcoat: 1, clearcoatRoughness: .08, transparent: true }));
  const face = new THREE.Mesh(new THREE.PlaneGeometry(3.08, .9625), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
  face.position.z = .047; grp.add(body, face); grp.visible = false; S.add(grp);
  return { grp, body, face };
});

// ---------------------------------------------------------------- chiffre chromé
let num = null;
async function buildNum() {
  const data = await new Promise(r => new TTFLoader().load('fonts/InstrumentSerif-normal.ttf', r));
  const geo = new TextGeometry(JOURS, { font: new Font(data), size: 2.2, depth: .45, curveSegments: 24, bevelEnabled: true, bevelThickness: .06, bevelSize: .035, bevelSegments: 6 });
  geo.center(); num = new THREE.Mesh(geo, chrome); num.visible = false; S.add(num);
}

// ---------------------------------------------------------------- titres HTML
function show(el, t, a, b, { dy = 18, blur = 12 } = {}) {
  if (!win(t, a, b)) { el.style.opacity = 0; return; }
  const k = oc(pr(t, a, a + .55)), o = pr(t, b - .3, b);
  el.style.opacity = k * (1 - o); el.style.transform = `translateY(${(1 - k) * dy - o * 8}px)`; el.style.filter = `blur(${(1 - k) * blur + o * 6}px)`;
}
function place() {
  const P = VERT ? { h1: 40, h2: 16, h3: 74, lt: 30, jrs: 62, offre: 70, fin1: 47, fin2: 57 } : { h1: 38, h2: 9, h3: 79, lt: 17, jrs: 75, offre: 83, fin1: 42, fin2: 60 };
  for (const [id, v] of Object.entries(P)) $(id).style.top = v + '%';
  if (VERT) for (const id of ['h1', 'h2', 'h3', 'fin2', 'offre']) $(id).style.cssText += ';white-space:normal;padding:0 7%';
  else for (const id of ['h2', 'h3', 'fin1', 'fin2', 'offre']) $(id).style.whiteSpace = 'nowrap';
}
const gr = $('grain'), gx = gr.getContext('2d'), gimg = gx.createImageData(480, 270);
function grain(f) { let s = 1000 + f; const d = gimg.data; for (let i = 0; i < d.length; i += 4) { s = (s * 16807) % 2147483647; const v = s / 2147483647 * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } gx.putImageData(gimg, 0, 0); }

// ---------------------------------------------------------------- timeline
// 0–2,3 nuit + accroche · 2,3–9,2 quatre cartes (la nuit devient aube) · 9,2–11 « Vous, vous avez dormi. / Scalify, non. »
// 11–14,3 « LANCEMENT DANS 23 JOURS » · 14,3–16 fin
const STEP = VERT ? 1.12 : 1.13;           // espacement vertical de la pile
window.seek = (t, frame = Math.round(t * 30)) => {
  if (t < 11) setBg('night', 'dawn', io(pr(t, 3.0, 9.6))); else setBg('dawn', 'ember', io(pr(t, 10.6, 11.3)));
  // caméra : lente montée qui suit la pile, puis recul
  const stackK = io(pr(t, 2.3, 9.0));
  let cz = VERT ? lerp(8.0, 10.6, stackK) : lerp(7.4, 10.2, stackK), cy = lerp(0, -1.5 * STEP, stackK);
  if (t < 2.3) { cz = lerp(9.5, 8.0 * (VERT ? 1 : .925), oc(pr(t, 0, 2.3))); cy = 0; }
  if (t >= 9.2) { cz = lerp(VERT ? 9.0 : 8.4, VERT ? 8.2 : 7.6, io(pr(t, 9.2, 16))); cy = 0; }
  cam.position.set(Math.sin(t * .35) * .25, cy + .1, cz); cam.lookAt(0, cy, 0);
  key.position.set(-4 + Math.sin(t * .4) * 1.5, 3, 5);
  // cartes : arrivent du fond, s'empilent ; partent en s'écartant à 9,2 s
  cards.forEach((C, i) => {
    const a = CT[i], on = win(t, a - .05, 9.9); C.grp.visible = on; if (!on) return;
    const k = oe(pr(t, a, a + .85)), out = ic(pr(t, 9.1, 9.85));
    const y = -i * STEP, side = i % 2 ? 1 : -1;
    C.grp.position.set(lerp(side * 2.5, 0, k) + side * out * 5, y + (1 - k) * -.6, lerp(-5, 0, k) + out * 2);
    C.grp.rotation.set(lerp(.5, .05, k) + Math.sin(t * .7 + i) * .02, lerp(-side * .9, side * .06, k) + side * out * .8, lerp(side * .1, 0, k));
    C.grp.scale.setScalar(VERT ? .98 : 1);
    const op = cl(k * 1.5) * (1 - out); C.body.material.opacity = op; C.face.material.opacity = op;
  });
  // logo
  let lv = false, ls = 1, lpy = .2, lry = 0;
  if (win(t, 9.5, 11.1)) { lv = true; ls = ob(pr(t, 9.6, 10.3), 1.3) * (1 - pr(t, 10.85, 11.1)) * (VERT ? 1 : .78); lry = lerp(-2.2, -.4, oe(pr(t, 9.6, 10.6))); lpy = VERT ? .5 : .25; }
  if (t >= 14.3) { lv = true; ls = oc(pr(t, 14.35, 15)) * .55; lry = -.3 + Math.sin(t * .6) * .2; lpy = VERT ? 2.1 : 1.2; }
  logoPivot.visible = lv; logoPivot.scale.setScalar(Math.max(.001, ls)); logoPivot.position.set(0, lpy, 0); logoPivot.rotation.set(-.12, lry, .04);
  // chiffre
  if (num) { const on = win(t, 11.4, 14.35); num.visible = on;
    if (on) { const k = oe(pr(t, 11.4, 11.75)); num.position.set(0, VERT ? .2 : .05, lerp(-14, 0, k));
      num.rotation.set(-.08, lerp(.9, -.18, oe(pr(t, 11.4, 12.1))) + Math.sin(t * .5) * .06, 0);
      num.scale.setScalar(lerp(1.15, 1, pr(t, 11.4, 14.3)) * (VERT ? .78 : .72) * (1 - pr(t, 14.1, 14.35))); } }
  // textes
  show($('h1'), t, .15, 2.25); show($('h2'), t, 9.25, 11.0); show($('h3'), t, 9.9, 11.0);
  show($('lt'), t, 11.05, 14.2, { blur: 8 }); show($('jrs'), t, 11.7, 14.2, { blur: 8 }); show($('offre'), t, 12.4, 14.2);
  show($('fin1'), t, 14.6, 16.5); show($('fin2'), t, 15.0, 16.5);
  $('demo').style.opacity = win(t, 2.4, 9.1) ? .9 : 0;
  let bl = 0; if (win(t, 11.0, 11.4)) bl = 1; bl = Math.max(bl, pr(t, 15.4, 16)); $('black').style.opacity = bl;
  let fl = 0; for (const [a, s] of [[9.6, .7], [11.4, 1]]) if (win(t, a, a + .6)) fl = Math.max(fl, s * Math.pow(1 - pr(t, a, a + .6), 2));
  $('flash').style.opacity = fl; bloom.strength = .2 + fl * .7; $('vig').style.opacity = .75;
  comp.render(); grain(frame);
};
await document.fonts.ready;
await Promise.all(['italic 40px IS', '40px IS', '500 40px IT', '600 40px IT', '400 40px IT', '40px JM'].map(f => document.fonts.load(f)));
place(); await buildNum();
window.ready = true;
if (!location.search.includes('render')) { const t0 = performance.now(); (function loop() { seek(((performance.now() - t0) / 1000) % END); requestAnimationFrame(loop); })(); }
