// Le monde isométrique Scalify : tout l'état visuel est une fonction pure du temps t.
import * as THREE from 'three';
import { createEngine, toon, C, ISO_AZ, ISO_EL } from './engine.js';
import {
  cl, lerp, seg, ease, k, pop, drop, rng, mesh, blk, at, grp, canvasTex, rrect, card, text3d,
  island, person, walkPose, scalifyCoin, croissant, star3d, pin, tree, cloud, lamp,
} from './kit.js';
import { T, DUR } from './timeline.js';

const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const FD = 'Anton', FM = 'JBM';
function txt(g, s, x, y, size, col, { font = FD, weight = 400, align = 'left', base = 'alphabetic' } = {}) {
  g.font = `${weight} ${size}px ${font === FD ? '"Anton"' : '"JBM"'}`;
  g.fillStyle = col; g.textAlign = align; g.textBaseline = base; g.fillText(s, x, y);
  return g.measureText(s).width;
}
// texte réduit si nécessaire pour tenir dans maxW
function fitTxt(g, s, x, y, maxW, size, col, opts = {}) {
  g.font = `${opts.weight || 400} ${size}px ${(opts.font || FD) === FD ? '"Anton"' : '"JBM"'}`;
  const w = g.measureText(s).width;
  return txt(g, s, x, y, w > maxW ? size * maxW / w : size, col, opts);
}
function starPath(g, cx, cy, r) {
  g.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; i ? g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : g.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
  g.closePath();
}
function heartShape(s = 1) {
  const h = new THREE.Shape();
  h.moveTo(0, -0.35 * s);
  h.bezierCurveTo(-0.55 * s, 0.05 * s, -0.3 * s, 0.45 * s, 0, 0.2 * s);
  h.bezierCurveTo(0.3 * s, 0.45 * s, 0.55 * s, 0.05 * s, 0, -0.35 * s);
  return h;
}

export function buildWorld(canvas, W, H) {
  const E = createEngine(canvas, W, H);
  const S = E.scene, cam = E.camera;
  const PORTRAIT = H > W;
  const ups = []; // mises à jour (t) dans l'ordre

  // ====================================================================== VILLE (plans A–B)
  const town = new THREE.Group(); S.add(town);
  const KD = -5; // décalage d'illusion le long de l'axe de vue (1,1,1)
  const eq = (x, y, z) => V3(x + KD, y + KD, z + KD);

  // --- île de la boutique (sol y = 0) : x ∈ [-1, 6.4], z ∈ [-3.2, 3.0]
  const shopIsl = island({ w: 7.4, d: 6.2, top: C.mint, side: '#3cbf86', h: 1.25, rocks: 6, seed: 11 });
  shopIsl.position.set(2.7, 0, -0.1); town.add(shopIsl);

  // --- île « en ligne » du client (vraie position décalée de KD·(1,1,1))
  const gridTex = canvasTex(512, 512, g => {
    g.fillStyle = '#dceeff'; g.fillRect(0, 0, 512, 512);
    g.strokeStyle = '#9cc8f5'; g.lineWidth = 3;
    for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 512); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(512, i * 64); g.stroke(); }
  }).tex;
  const custIsl = island({ w: 4.8, d: 3.4, top: '#ffffff', side: C.blue, h: 1.0, rocks: 4, seed: 5, topMap: gridTex });
  custIsl.position.copy(eq(-3.4, 0, 1.0)); town.add(custIsl);

  // --- chemin : dalles crème (8 × 0.12 × 0.9)
  const tileMat = i => toon('#fff3dc', { unique: true });
  const tiles = [];
  const addTile = (p, w = 0.88, d = 0.88) => { const m = blk(w, 0.12, d, tileMat()); m.position.copy(p); town.add(m); tiles.push(m); return m; };
  // côté boutique (vrai = équivalent)
  for (const x of [-0.5, 0.5, 1.5, 2.5, 3.5]) addTile(V3(x, 0, 1));
  addTile(V3(3.5, 0, 0.12), 0.88, 0.6); // paillasson devant la porte
  // côté client (équivalent x = -1.5 … -5.5)
  const custTiles = [];
  for (const x of [-1.5, -2.5, -3.5, -4.5, -5.3]) custTiles.push(addTile(eq(x, 0, 1)));

  // --- boulangerie
  const shop = new THREE.Group(); shop.position.set(3.7, 0, -1.5); town.add(shop);
  shop.add(blk(3.2, 2.1, 2.6, C.paper));
  shop.add(at(blk(3.5, 0.3, 2.9, C.ember, 0.05), 0, 2.1, 0));
  shop.add(at(blk(3.25, 0.16, 2.65, C.lavender), 0, 1.92, 0));
  // socle de vitrine
  shop.add(at(blk(3.24, 0.32, 2.64, C.lavender), 0, 0, 0));
  // porte (face avant z = +1.3)
  const door = blk(0.78, 1.38, 0.1, C.violet); door.position.set(-0.2, 0.0, 1.31); shop.add(door);
  const doorWin = mesh(new THREE.BoxGeometry(0.42, 0.42, 0.04), new THREE.MeshBasicMaterial({ color: '#bfe0ff' }), false, false);
  doorWin.position.set(-0.2, 1.0, 1.37); shop.add(doorWin);
  // vitrine (cible du zoom) : MeshBasic, sa couleur finale = dessus de la plaque n°1
  const winMat = new THREE.MeshBasicMaterial({ color: '#bfe0ff' });
  const vitrine = mesh(new THREE.BoxGeometry(1.3, 0.82, 0.06), winMat, false, false);
  vitrine.position.set(0.9, 0.78, 1.33); shop.add(vitrine);
  const vitFrame = blk(1.4, 0.1, 0.14, C.ink); vitFrame.position.set(0.9, 0.3, 1.32); shop.add(vitFrame);
  // fenêtres latérales (face +x)
  const sideWins = [];
  for (const z of [-0.65, 0.45]) { const w = mesh(new THREE.BoxGeometry(0.06, 0.62, 0.62), new THREE.MeshBasicMaterial({ color: '#bfe0ff' }), false, false); w.position.set(1.62, 1.15, z); shop.add(w); sideWins.push(w); }
  // store rayé
  const awning = new THREE.Group(); awning.position.set(0.35, 1.98, 1.32); shop.add(awning);
  for (let i = 0; i < 7; i++) {
    const st = mesh(new THREE.BoxGeometry(0.4, 0.07, 0.72), i % 2 ? C.paper : C.ember);
    st.position.set(-1.2 + i * 0.4, -0.1, 0.26); st.rotation.x = 0.42; st.scale.z = 0.8; awning.add(st);
  }
  // enseigne
  const sign = card(2.5, 0.52, 0.06, 1024, (g, w, h) => {
    g.fillStyle = C.ink; g.fillRect(0, 0, w, h);
    g.font = '400 150px "Anton"'; const fs = Math.min(150, 150 * (w * 0.9) / g.measureText('BOULANGERIE DUPAIN').width);
    txt(g, 'BOULANGERIE DUPAIN', w / 2, h * 0.5 + fs * 0.36, fs, '#fffaf1', { align: 'center' });
  });
  sign.position.set(0.0, 2.55, 1.32); shop.add(sign);
  // croissant sur le toit
  const crois = croissant(1.5, 0.36, '#f0a238'); crois.position.set(0.1, 2.62, -0.1); crois.rotation.y = 0.3; shop.add(crois);
  // décor
  const tr1 = tree(1.15); tr1.position.set(0.6, 0, -2.3); town.add(tr1);
  const tr2 = tree(0.95, '#27a874'); tr2.position.set(5.85, 0, 2.2); town.add(tr2);
  const tr3 = tree(0.75); tr3.position.set(1.0, 0, 2.45); town.add(tr3);
  const lp = lamp(1); lp.position.set(2.0, 0, 1.75); town.add(lp);
  const bench = grp(at(blk(1.0, 0.1, 0.36, C.ember), 0, 0.32, 0), at(blk(0.08, 0.32, 0.3, C.ink), -0.42, 0, 0), at(blk(0.08, 0.32, 0.3, C.ink), 0.42, 0, 0));
  bench.position.set(5.2, 0, 0.55); bench.rotation.y = Math.PI / 2; town.add(bench);

  // --- barre de recherche (côté client, face à la caméra)
  const QUERY = 'boulangerie près de moi';
  let searchKey = '';
  const search = card(5.2, 1.04, 0.52, 1280, () => {});
  const drawSearch = (n, caret) => {
    const ct = search.userData.ct, g = ct.g, w = ct.canvas.width, h = ct.canvas.height;
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
    g.strokeStyle = C.ink; g.lineWidth = 14;
    g.beginPath(); g.arc(128, h / 2 - 8, 46, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(162, h / 2 + 26); g.lineTo(200, h / 2 + 64); g.stroke();
    const s = QUERY.slice(0, n);
    const tw = txt(g, s, 250, h / 2 + 30, 86, C.ink, { font: FM, weight: 500 });
    if (caret) { g.fillStyle = C.blue; g.fillRect(256 + tw, h / 2 - 46, 8, 92); }
    ct.tex.needsUpdate = true;
  };
  const searchG = new THREE.Group(); searchG.add(search); search.position.y = 0;
  searchG.position.copy(eq(-3.0, 1.95, -0.2)); town.add(searchG);
  const searchStem = blk(0.12, 1.5, 0.12, C.ink); searchStem.position.copy(eq(-3.0, 0, -0.2)); town.add(searchStem);
  // carte de résultat
  let resKey = '';
  const result = card(4.5, 0.78, 0.18, 1024, () => {});
  const drawResult = found => {
    const ct = result.userData.ct, g = ct.g, w = ct.canvas.width, h = ct.canvas.height;
    g.clearRect(0, 0, w, h);
    g.fillStyle = found ? '#e9fff3' : '#fff1ea'; g.fillRect(0, 0, w, h);
    if (found) {
      g.fillStyle = C.mint; g.beginPath(); g.arc(70, h / 2, 34, 0, Math.PI * 2); g.fill();
      g.strokeStyle = C.ink; g.lineWidth = 9; g.beginPath(); g.moveTo(52, h / 2); g.lineTo(66, h / 2 + 15); g.lineTo(92, h / 2 - 16); g.stroke();
      txt(g, 'Boulangerie Dupain · 120 m', 128, h / 2 + 22, 60, C.ink, { font: FM, weight: 500 });
    } else {
      g.strokeStyle = C.ember; g.lineWidth = 10;
      g.beginPath(); g.moveTo(46, h / 2 - 24); g.lineTo(94, h / 2 + 24); g.moveTo(94, h / 2 - 24); g.lineTo(46, h / 2 + 24); g.stroke();
      txt(g, 'Aucun résultat', 128, h / 2 + 22, 64, C.ember, { font: FM, weight: 500 });
    }
    ct.tex.needsUpdate = true;
  };
  const resultG = new THREE.Group(); resultG.add(result); resultG.position.copy(eq(-3.0, 1.05, -0.2)); town.add(resultG);

  // --- client
  const cust = person({ body: C.ember, legs: C.violet }); town.add(cust);
  const ask = card(0.8, 0.8, 0.4, 256, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); txt(g, '?', w / 2, h * 0.8, 200, C.ember, { align: 'center' }); });
  town.add(ask);

  // --- pièce Scalify + onde
  const coin = scalifyCoin(0.95, 0.24); town.add(coin);
  const ring = mesh(new THREE.TorusGeometry(1, 0.05, 8, 64), new THREE.MeshBasicMaterial({ color: C.ember, transparent: true }), false, false);
  ring.rotation.x = Math.PI / 2; town.add(ring);
  const inlay = scalifyCoin(0.36, 0.05); inlay.position.set(-0.5, 0.125, 1); town.add(inlay);

  // --- notification + confettis
  const notif = card(3.3, 0.98, 0.22, 1024, (g, w, h) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
    g.fillStyle = C.mint; g.beginPath(); g.arc(92, h / 2, 50, 0, Math.PI * 2); g.fill();
    txt(g, '+1', 92, h / 2 + 22, 64, C.ink, { align: 'center' });
    txt(g, 'Nouveau client !', 170, h / 2 + 30, 92, C.ink);
  });
  notif.position.set(3.7, 4.1, -0.6); town.add(notif);
  const confetti = [];
  { const R = rng(42), cols = [C.ember, C.sun, C.mint, C.blue, C.violet, C.lavender];
    for (let i = 0; i < 22; i++) {
      const m = mesh(new THREE.BoxGeometry(0.11, 0.11, 0.04), cols[i % cols.length], false, false);
      m.userData = { a: R() * Math.PI * 2, v: 2.2 + R() * 2.2, up: 3.2 + R() * 2.6, spin: (R() - 0.5) * 14 };
      town.add(m); confetti.push(m);
    } }

  // --- nuages


  // ====================================================================== PILE DE SERVICES (plans C–F)
  const OB = V3(300, 0, 0);
  const stack = new THREE.Group(); stack.position.copy(OB); S.add(stack);
  const STEP = 3.1, PT = 0.5;
  const plateCols = [C.sun, C.mint, C.lavender, C.blue, C.violet];
  const plates = plateCols.map((col, i) => {
    const g = new THREE.Group();
    const slab = mesh(new THREE.BoxGeometry(6, PT, 6), col); slab.position.y = PT / 2; g.add(slab);
    // liseré encre sous le dessus (lisibilité de l'empilement)
    g.userData.content = new THREE.Group(); g.userData.content.position.y = PT; g.add(g.userData.content);
    stack.add(g);
    return g;
  });
  const cont = i => plates[i].userData.content;

  // --- P1 : le site
  const page = blk(4.6, 0.1, 3.9, C.paper); cont(0).add(page);
  const header = new THREE.Group(); cont(0).add(header);
  { const b = mesh(new THREE.BoxGeometry(4.6, 0.16, 0.62), [toon(C.ink), toon(C.ink), toon(C.ink, { unique: true, params: { map: canvasTex(1024, 140, (g, w, h) => { g.fillStyle = C.ink; g.fillRect(0, 0, w, h); txt(g, 'DUPAIN', 40, h * 0.74, 96, '#fffaf1'); for (let i = 0; i < 3; i++) { g.fillStyle = '#fffaf1'; g.fillRect(w - 260 + i * 80, h / 2 - 6, 52, 12); } }).tex } }), toon(C.ink), toon(C.ink), toon(C.ink)]);
    b.position.y = 0.08; b.castShadow = b.receiveShadow = true; header.add(b); }
  header.position.set(0, 0.1, -1.6);
  const hero = new THREE.Group(); hero.add(blk(2.7, 0.3, 1.45, C.blue)); const miniC = croissant(1.1, 0.26, '#f0a238'); miniC.position.y = 0.38; miniC.rotation.y = 0.5; hero.add(miniC);
  hero.position.set(-0.8, 0.1, -0.45); cont(0).add(hero);
  const lines = [0, 1, 2].map(i => { const m = blk(1.25 - i * 0.2, 0.09, 0.2, C.lavender); m.position.set(1.45 - i * 0.1, 0.1, -0.95 + i * 0.36); cont(0).add(m); return m; });
  const btnTex = canvasTex(512, 180, (g, w, h) => { g.fillStyle = C.ember; g.fillRect(0, 0, w, h); txt(g, 'RÉSERVER', w / 2, h * 0.72, 110, '#ffffff', { align: 'center' }); }).tex;
  const button = mesh(new THREE.BoxGeometry(1.7, 0.26, 0.58), [toon(C.ember), toon(C.ember), toon(C.ember, { unique: true, params: { map: btnTex } }), toon(C.ember), toon(C.ember), toon(C.ember)]);
  button.geometry.translate(0, 0.13, 0);
  const buttonG = new THREE.Group(); buttonG.add(button); buttonG.position.set(-0.8, 0.1, 0.72); cont(0).add(buttonG);
  const prods = [-1.45, 0, 1.45].map((x, i) => { const g = grp(blk(1.15, 0.22, 0.75, C.paper), at(blk(0.95, 0.06, 0.5, [C.sun, C.mint, C.lavender][i]), 0, 0.22, 0)); g.position.set(x, 0.1, 1.5); cont(0).add(g); return g; });
  const cursor = new THREE.Group();
  { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0, -0.62); sh.lineTo(0.16, -0.48); sh.lineTo(0.27, -0.72); sh.lineTo(0.37, -0.67); sh.lineTo(0.26, -0.44); sh.lineTo(0.46, -0.44); sh.closePath();
    const m = mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.08, bevelEnabled: false }), '#ffffff', true, false); m.scale.setScalar(1.1); cursor.add(m); }
  cont(0).add(cursor);

  // --- P2 : fiche Google (mini-carte + épingle + carte d'info)
  const mapTex = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = '#f4fbf6'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#bfe8cf'; g.fillRect(620, 80, 300, 260);
    g.fillStyle = '#cfe6ff'; g.beginPath(); g.moveTo(0, 760); g.bezierCurveTo(300, 700, 520, 900, 1024, 820); g.lineTo(1024, 940); g.bezierCurveTo(520, 1010, 300, 820, 0, 880); g.fill();
    g.strokeStyle = '#ffffff'; g.lineWidth = 64;
    g.beginPath(); g.moveTo(0, 470); g.lineTo(1024, 470); g.moveTo(420, 0); g.lineTo(420, 1024); g.stroke();
    g.strokeStyle = '#d8d2c6'; g.lineWidth = 6;
    [[0, 438, 1024, 438], [0, 502, 1024, 502], [388, 0, 388, 1024], [452, 0, 452, 1024]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); });
  }).tex;
  const mapSlab = mesh(new THREE.BoxGeometry(4.9, 0.08, 4.9), [toon('#f4fbf6'), toon('#f4fbf6'), toon('#ffffff', { unique: true, params: { map: mapTex } }), toon('#f4fbf6'), toon('#f4fbf6'), toon('#f4fbf6')]);
  mapSlab.position.y = 0.04; mapSlab.receiveShadow = true; cont(1).add(mapSlab);
  const bldg = [[-1.4, -1.5, C.lavender, 0.9], [1.3, -1.6, C.paper, 0.7], [1.5, 1.2, C.lavender, 1.0], [-1.6, 1.3, C.paper, 0.6]].map(([x, z, c, h]) => { const m = blk(0.9, h, 0.9, c); m.position.set(x, 0.08, z); cont(1).add(m); return m; });
  const gBak = grp(blk(1.1, 0.75, 1.0, C.paper), at(blk(1.2, 0.14, 1.1, C.ember), 0, 0.75, 0)); gBak.position.set(-0.05, 0.08, -0.05); cont(1).add(gBak);
  const bigPin = pin(C.ember, 1.15); bigPin.position.set(-0.05, 0.98, -0.05); cont(1).add(bigPin);
  const pinRing = mesh(new THREE.TorusGeometry(1, 0.045, 8, 64), new THREE.MeshBasicMaterial({ color: C.ember, transparent: true }), false, false);
  pinRing.rotation.x = Math.PI / 2; pinRing.position.set(-0.05, 0.12, -0.05); cont(1).add(pinRing);
  const fiche = card(3.9, 1.72, 0.16, 1024, (g, w, h) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
    fitTxt(g, 'Boulangerie Dupain', 48, 118, w - 96, 88, C.ink, { font: FM, weight: 500 });
    for (let i = 0; i < 5; i++) { starPath(g, 84 + i * 96, 205, 38); g.fillStyle = C.sun; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 4; g.stroke(); }
    g.fillStyle = C.mint; rrect(g, 48, 280, 290, 110, 55); g.fill(); fitTxt(g, 'Ouvert', 193, 356, 240, 66, C.ink, { font: FM, weight: 500, align: 'center' });
    g.strokeStyle = C.ink; g.lineWidth = 6; rrect(g, 366, 280, 400, 110, 55); g.stroke(); fitTxt(g, 'Itinéraire', 566, 356, 350, 66, C.ink, { font: FM, weight: 500, align: 'center' });
  });
  cont(1).add(fiche);

  // --- P3 : avis (étoiles + avis + réponse)
  const stars = [0, 1, 2, 3, 4].map(i => { const s = star3d(0.42, 0.16, C.yellow); cont(2).add(s); return s; });
  const review = card(4.3, 1.62, 0.16, 1024, (g, w, h) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 5; i++) { starPath(g, 74 + i * 84, 78, 34); g.fillStyle = C.sun; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 4; g.stroke(); }
    fitTxt(g, '« Meilleur croissant', 44, 214, w - 88, 84, C.ink, { font: FM, weight: 500 });
    fitTxt(g, 'du quartier ! »', 44, 314, w - 88, 84, C.ink, { font: FM, weight: 500 });
    fitTxt(g, '— Julie', w - 44, 314, 300, 62, '#7a6f62', { font: FM, weight: 500, align: 'right' });
  });
  cont(2).add(review);
  const reply = card(3.7, 1.05, 0.16, 1024, (g, w, h) => {
    g.fillStyle = C.ember; g.fillRect(0, 0, w, h);
    fitTxt(g, 'Merci Julie, à demain !', 44, 132, w - 88, 84, '#ffffff', { font: FM, weight: 500 });
    fitTxt(g, 'RÉPONDU PAR SCALIFY', 44, 232, w - 88, 52, '#ffe1d3', { font: FM, weight: 500 });
  });
  cont(2).add(reply);

  // --- P4 : posts (cartes en éventail + cœurs)
  const postDraw = kind => (g, w, h) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
    const ph = h * 0.66;
    g.fillStyle = ['#ffe7a8', '#dceeff', '#e9ccff'][kind]; g.fillRect(28, 28, w - 56, ph);
    g.save(); g.translate(w / 2, 28 + ph / 2);
    if (kind === 0) { // croissant stylisé
      g.fillStyle = '#f0a238'; g.strokeStyle = C.ink; g.lineWidth = 8;
      for (let i = -2; i <= 2; i++) { g.beginPath(); g.ellipse(i * 52, Math.abs(i) * 22 - 10, 40 - Math.abs(i) * 6, 62 - Math.abs(i) * 12, i * 0.35, 0, Math.PI * 2); g.fill(); g.stroke(); }
    } else if (kind === 1) { // tasse
      g.fillStyle = C.ember; g.strokeStyle = C.ink; g.lineWidth = 8;
      g.beginPath(); g.roundRect(-90, -50, 160, 150, 26); g.fill(); g.stroke();
      g.beginPath(); g.arc(80, 20, 38, -1.2, 1.2); g.stroke();
      g.strokeStyle = '#8a7a6a'; g.lineWidth = 7; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-50 + i * 40, -70); g.bezierCurveTo(-70 + i * 40, -110, -30 + i * 40, -130, -50 + i * 40, -170); g.stroke(); }
    } else { // baguettes
      g.fillStyle = '#e8a54a'; g.strokeStyle = C.ink; g.lineWidth = 8;
      for (let i = 0; i < 3; i++) { g.save(); g.rotate(-0.5 + i * 0.12); g.beginPath(); g.ellipse(0, i * 46 - 46, 170, 30, 0, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore(); }
    }
    g.restore();
    txt(g, ['Croissants tout chauds', 'Le café est prêt', 'Baguettes du jour'][kind], 34, ph + 100, 50, C.ink, { font: FM, weight: 500 });
    g.fillStyle = C.ember; const hx = 50, hy = ph + 160;
    g.beginPath(); g.moveTo(hx, hy + 18); g.bezierCurveTo(hx - 30, hy - 4, hx - 16, hy - 26, hx, hy - 10); g.bezierCurveTo(hx + 16, hy - 26, hx + 30, hy - 4, hx, hy + 18); g.fill();
    txt(g, ['248', '173', '312'][kind], 92, hy + 18, 46, C.ink, { font: FM, weight: 500 });
  };
  const posts = [0, 1, 2].map(i => { const c = card(1.6, 2.05, 0.1, 600, postDraw(i)); cont(3).add(c); return c; });
  const hearts = [];
  { const geo = new THREE.ExtrudeGeometry(heartShape(0.5), { depth: 0.1, bevelEnabled: false }); geo.translate(0, 0, -0.05);
    for (let i = 0; i < 7; i++) { const m = mesh(geo, C.ember, false, false); cont(3).add(m); hearts.push(m); } }

  // --- P5 : assistant IA (bulles + cadran jour/nuit)
  const qBub = card(3.7, 0.96, 0.4, 1024, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); fitTxt(g, 'Ouvert dimanche ?', 70, h * 0.66, w - 140, 96, C.ink, { font: FM, weight: 500 }); });
  const dots = card(1.25, 0.64, 0.32, 512, () => {});
  const aBub = card(3.9, 1.5, 0.36, 1024, (g, w, h) => {
    g.fillStyle = C.mint; g.fillRect(0, 0, w, h);
    g.fillStyle = C.ink; rrect(g, 60, 52, 120, 82, 22); g.fill(); txt(g, 'IA', 120, 116, 64, '#ffffff', { align: 'center' });
    fitTxt(g, 'Oui ! De 7 h à 13 h.', 212, 120, w - 260, 84, C.ink, { font: FM, weight: 500 });
    fitTxt(g, 'À dimanche !', 60, 262, w - 120, 84, C.ink, { font: FM, weight: 500 });
  });
  cont(4).add(qBub, dots, aBub);
  const dial = new THREE.Group(); cont(4).add(dial);
  const dialDisc = mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.14, 48), C.paper, false, true); dialDisc.rotation.x = Math.PI / 2; dial.add(dialDisc);
  const sunB = mesh(new THREE.SphereGeometry(0.26, 24, 16), C.yellow, false, false); const moonB = mesh(new THREE.SphereGeometry(0.22, 24, 16), C.lavender, false, false);
  const orbit = new THREE.Group(); orbit.add(sunB, moonB); sunB.position.set(0, 0.64, 0.12); moonB.position.set(0, -0.64, 0.12); dial.add(orbit);
  const drawDots = (n) => { const ct = dots.userData.ct, g = ct.g, w = ct.canvas.width, h = ct.canvas.height; g.clearRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); for (let i = 0; i < 3; i++) { g.fillStyle = i === n ? C.ink : '#c9c2b8'; g.beginPath(); g.arc(w / 2 + (i - 1) * 110, h / 2, 34, 0, Math.PI * 2); g.fill(); } ct.tex.needsUpdate = true; };
  let dotsKey = -1;

  // --- étiquettes de la vue éclatée
  const tagTxt = ['01 · SITE', '02 · FICHE GOOGLE', '03 · AVIS', '04 · POSTS', '05 · IA 24/7'];
  const tags = tagTxt.map((s, i) => { const c = card(4.2, 0.86, 0.12, 1024, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = plateCols[i]; g.fillRect(0, 0, 36, h); txt(g, s, 78, h * 0.68, 92, C.ink, { font: FM, weight: 500 }); }); stack.add(c); return c; });

  // --- prix
  const priceG = new THREE.Group(); stack.add(priceG);
  const price = text3d('49€', 2.3, 0.7, C.ember, { bevel: 0.04 }); priceG.add(price);

  // --- île des fondateurs
  const fIsl = island({ w: 14.4, d: 10.4, top: C.mint, side: '#3cbf86', h: 1.4, rocks: 8, seed: 23 });
  fIsl.position.set(0, 0, 0); stack.add(fIsl);
  const plots = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
    const n = r * 5 + c + 1;
    const tex = canvasTex(256, 256, (g, w, h) => {
      g.fillStyle = '#fffaf1'; g.fillRect(0, 0, w, h);
      g.setLineDash([22, 16]); g.strokeStyle = '#b9ab95'; g.lineWidth = 10; g.strokeRect(22, 22, w - 44, h - 44); g.setLineDash([]);
      txt(g, String(n), w / 2, h * 0.68, 120, C.ink, { align: 'center' });
    }).tex;
    const m = mesh(new THREE.BoxGeometry(1.55, 0.26, 1.55), [toon('#efe4d0'), toon('#efe4d0'), toon('#ffffff', { unique: true, params: { map: tex } }), toon('#efe4d0'), toon('#efe4d0'), toon('#efe4d0')]);
    m.geometry.translate(0, 0.13, 0);
    const g = new THREE.Group(); g.add(m); g.userData = { n, r, c, top: m.material[2] };
    g.position.set(-1.2 + c * 1.95, 0, -0.6 + r * 1.95); stack.add(g); plots.push(g);
  }
  // calendrier
  const calTex = canvasTex(512, 600, (g, w, h) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
    g.fillStyle = C.ember; g.fillRect(0, 0, w, 150); txt(g, 'NOVEMBRE', w / 2, 112, 96, '#ffffff', { align: 'center' });
    txt(g, '2', w / 2, 470, 340, C.ink, { align: 'center' });
    txt(g, 'LUNDI', w / 2, 560, 70, C.ink, { font: FM, weight: 500, align: 'center' });
  }).tex;
  const calendar = new THREE.Group(); stack.add(calendar);
  { const b = mesh(new THREE.BoxGeometry(2.0, 2.35, 0.45), [toon(C.paper), toon(C.paper), toon(C.paper), toon(C.paper), new THREE.MeshBasicMaterial({ map: calTex }), toon(C.paper)]);
    b.geometry.translate(0, 1.175, 0); calendar.add(b);
    for (const x of [-0.55, 0.55]) calendar.add(at(blk(0.12, 0.35, 0.12, C.ink), x, 2.25, 0)); }
  const jTag = card(2.1, 0.86, 0.14, 512, (g, w, h) => { g.fillStyle = C.ink; g.fillRect(0, 0, w, h); txt(g, 'J-23', w / 2, h * 0.75, 150, C.yellow, { align: 'center' }); });
  stack.add(jTag);
  const off30 = text3d('-30%', 1.35, 0.42, C.violet, { bevel: 0.03 }); stack.add(off30);
  const ctaCoin = scalifyCoin(0.75, 0.2); stack.add(ctaCoin);
  const mini = shop.clone(true); mini.scale.setScalar(0.32); stack.add(mini);
  const placeTag = card(2.3, 0.62, 0.12, 768, (g, w, h) => { g.fillStyle = C.yellow; g.fillRect(0, 0, w, h); txt(g, 'VOTRE PLACE', w / 2, h * 0.72, 120, C.ink, { align: 'center' }); });
  stack.add(placeTag);

  // ====================================================================== CAMÉRA (cadrage calculé)
  const ASP = W / H;
  // zone écran (NDC) réservée au sujet 3D : sous les titres en 9:16, à droite en 16:9
  const RECT = PORTRAIT ? { x0: -0.9, x1: 0.9, y0: -0.62, y1: 0.3 } : { x0: 0.0, x1: 0.93, y0: -0.84, y1: 0.8 };
  const camBasis = (az, el) => {
    const dir = V3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
    const r = V3(Math.cos(az), 0, -Math.sin(az));
    const u = V3().crossVectors(dir, r).normalize();
    return { dir, r, u };
  };
  const boxPts = (x0, x1, y0, y1, z0, z1, o = V3()) => { const a = []; for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) a.push(V3(x + o.x, y + o.y, z + o.z)); return a; };
  // panneau face caméra : points le long de l'axe droit de la caméra
  const bbPts = (c, hw, hh, az, el) => { const { r, u } = camBasis(az, el); return [c.clone().addScaledVector(r, -hw).addScaledVector(u, -hh), c.clone().addScaledVector(r, hw).addScaledVector(u, hh)]; };
  function fit(pts, az, el, pad = 1.0, rect = RECT) {
    const { dir, r, u } = camBasis(az, el);
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, dz = 0;
    for (const p of pts) { const sx = p.dot(r), sy = p.dot(u); x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy); dz += p.dot(dir); }
    dz /= pts.length;
    const half = Math.max((x1 - x0) / ((rect.x1 - rect.x0) * ASP), (y1 - y0) / (rect.y1 - rect.y0)) * pad;
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rcx = (rect.x0 + rect.x1) / 2, rcy = (rect.y0 + rect.y1) / 2;
    const T = V3().addScaledVector(r, cx - rcx * half * ASP).addScaledVector(u, cy - rcy * half).addScaledVector(dir, dz);
    return { T, half, az, el };
  }
  const point = (T, half, az, el) => ({ T, half, az, el });

  const A_AZ = ISO_AZ - 0.16, A_EL = ISO_EL + 0.19; // angle choisi pour que le trou s'ouvre le long du chemin
  const shopIslPts = boxPts(-1, 6.4, -0.4, 0, -3.2, 3.0);
  const shopPts = boxPts(2.1, 5.3, 0, 3.4, -2.8, -0.2);
  const custPts = boxPts(-5.8 + KD, -1.0 + KD, -0.4 + KD, KD, -0.7 + KD, 2.7 + KD);
  const searchC = eq(-3.0, 1.75, -0.2);
  const townPts = (az, el) => [...shopIslPts, ...shopPts, ...custPts, ...bbPts(searchC, 2.6, 0.9, az, el)];
  const WIN_PT = V3(4.6, 0.62, -0.14);
  const stAz = [ISO_AZ - 0.06, ISO_AZ + 0.06, ISO_AZ - 0.04, ISO_AZ + 0.07, ISO_AZ - 0.05];
  const TOPS = [1.7, 4.3, 4.05, 4.4, 4.2];
  const SP = PORTRAIT ? 0.86 : 1.0;
  const stPts = i => { const { r, u } = camBasis(stAz[i], ISO_EL); const c = V3(OB.x, i * STEP + PT, OB.z);
    return [...boxPts(-3, 3, i * STEP - 0.25, i * STEP + PT, -3, 3, OB), c.clone().addScaledVector(u, TOPS[i]).addScaledVector(r, 2.6), c.clone().addScaledVector(u, TOPS[i]).addScaledVector(r, -2.6)]; };
    const ovPts = (() => { const { r, u } = camBasis(ISO_AZ, ISO_EL); const a = boxPts(-3, 3, -0.25, 4 * STEP + PT, -3, 3, OB);
    for (const i of [0, 4]) a.push(V3(OB.x, i * STEP + PT, OB.z).addScaledVector(r, 6.8).addScaledVector(u, 0.85)); return a; })();
  const pricePts = boxPts(-3, 3, 0, 5.3, -3, 3, OB);
  const foundPts = [...boxPts(-5.8, 8.6, -1.0, 0.4, -4.8, 5.6, OB), ...boxPts(3.0, 5.8, 0, 4.9, -4.1, -2.7, OB)];
  const off30C = V3(OB.x - 4.3, 0.7, OB.z + 3.6);
  const endPts = [...boxPts(-5.0, 8.6, -0.6, 0.4, -2.4, 5.6, OB), ...boxPts(-1.9, -0.5, 0, 3.0, -1.3, 0.1, OB), ...boxPts(3.4, 5.4, 0, 4.9, -3.9, -2.9, OB), ...bbPts(off30C, 2.5, 0.8, ISO_AZ + 0.02, ISO_EL)];
  const CTA_RECT = PORTRAIT ? { x0: -0.9, x1: 0.9, y0: -0.4, y1: 0.27 } : RECT;
  const CK = [
    { t: 0, f: fit(townPts(A_AZ, A_EL), A_AZ, A_EL, 0.9) },
    { t: 4.3, f: fit(townPts(A_AZ, A_EL), A_AZ, A_EL, 0.86), e: ease.io2 },
    { t: T.align, f: fit(townPts(ISO_AZ, ISO_EL), ISO_AZ, ISO_EL, 0.94), e: ease.io3 },
    { t: T.align + 0.5, f: fit(townPts(ISO_AZ, ISO_EL), ISO_AZ, ISO_EL, 0.92), e: ease.io2 },
    { t: 8.3, f: fit([...shopIslPts, ...shopPts, ...boxPts(2.5, 5, 3.6, 4.6, -1, 0)], ISO_AZ + 0.05, ISO_EL, 0.95), e: ease.io2 },
    { t: T.zoom[0], f: fit([...shopIslPts, ...shopPts, ...boxPts(2.5, 5, 3.6, 4.6, -1, 0)], ISO_AZ + 0.07, ISO_EL, 0.93), e: ease.io2 },
    { t: T.CUT, f: point(WIN_PT, 0.035, ISO_AZ + 0.16, ISO_EL), e: ease.ioExpo, zoom: true },
    { t: T.CUT, f: point(V3(OB.x + 0.4, PT, OB.z + 0.4), 0.035, stAz[0], ISO_EL) },
    { t: T.CUT + 0.95, f: fit(stPts(0), stAz[0], ISO_EL, SP), e: ease.outExpo, zoom: true },
  ];
  for (let i = 1; i < 5; i++) {
    CK.push({ t: T.P[i], f: fit(stPts(i - 1), stAz[i - 1], ISO_EL, SP) });
    CK.push({ t: T.P[i] + 0.62, f: fit(stPts(i), stAz[i], ISO_EL, SP), e: ease.io3 });
  }
  CK.push({ t: T.overview[0], f: fit(stPts(4), stAz[4], ISO_EL, SP) });
  CK.push({ t: T.overview[1], f: fit(ovPts, ISO_AZ, ISO_EL, 1.0), e: ease.io3 });
  CK.push({ t: T.collapse[0] - 0.05, f: fit(ovPts, ISO_AZ, ISO_EL, 1.0) });
  CK.push({ t: T.collapse[1] + 0.3, f: fit(pricePts, ISO_AZ, ISO_EL, 1.0), e: ease.io3 });
  CK.push({ t: T.pull[0], f: fit(pricePts, ISO_AZ, ISO_EL, 1.0), e: ease.io2 });
  CK.push({ t: T.pull[1] + 0.6, f: fit(foundPts, ISO_AZ + 0.05, ISO_EL, 1.0), e: ease.out4 });
  CK.push({ t: T.ctaCoin - 0.2, f: fit(foundPts, ISO_AZ + 0.05, ISO_EL, 0.99), e: ease.io2 });
  CK.push({ t: T.ctaCoin + 0.9, f: fit(endPts, ISO_AZ + 0.03, ISO_EL, 1.0, CTA_RECT), e: ease.io3 });
  CK.push({ t: DUR, f: fit(endPts, ISO_AZ + 0.02, ISO_EL, 0.95, CTA_RECT), e: ease.io2 });

  function camState(t) {
    if (t <= CK[0].t) return CK[0].f;
    for (let i = 0; i < CK.length - 1; i++) {
      const A = CK[i], B = CK[i + 1];
      if (B.t - A.t < 1e-6 || t < A.t || t >= B.t) continue;
      const u = (B.e || ease.io3)(cl((t - A.t) / (B.t - A.t)));
      return {
        T: A.f.T.clone().lerp(B.f.T, B.zoom ? ease.io3(cl((t - A.t) / (B.t - A.t) / 0.62)) : u),
        half: Math.exp(lerp(Math.log(A.f.half), Math.log(B.f.half), u)),
        az: lerp(A.f.az, B.f.az, B.zoom ? ease.io3(cl((t - A.t) / (B.t - A.t) / 0.62)) : u),
        el: lerp(A.f.el, B.f.el, u),
      };
    }
    return CK[CK.length - 1].f;
  }
  function applyCam(t) {
    const st = camState(t);
    const { r, u } = camBasis(st.az, st.el);
    // micro-dérive continue (la caméra respire)
    const target = st.T.clone().addScaledVector(r, Math.sin(t * 0.83) * 0.004 * st.half * ASP).addScaledVector(u, Math.sin(t * 0.83 * 1.31) * 0.003 * st.half);
    E.setCamera({ target, az: st.az, el: st.el, half: st.half });
    return st;
  }

  // ====================================================================== ANIMATION
  const tmp = V3();
  const faceCam = o => o.quaternion.copy(cam.quaternion);
  const show = (o, v) => { o.visible = v; };
  function scaleIn(o, s) { o.scale.setScalar(Math.max(1e-4, s)); o.visible = s > 0.002; }

  function animTown(t) {
    const inTown = t < T.CUT;
    town.visible = inTown;
    if (!inTown) return;
    // barre de recherche : frappe + curseur
    const n = Math.round(QUERY.length * seg(t, T.type[0], T.type[1]));
    const caret = t < T.type[1] + 0.25 || Math.floor(t * 2.4) % 2 === 0;
    const key = n + ':' + (caret ? 1 : 0);
    if (key !== searchKey) { drawSearch(n, caret); searchKey = key; }
    const found = t >= T.found;
    const rk = found ? 'f' : 'n';
    if (rk !== resKey) { drawResult(found); resKey = rk; }
    const rs = t < T.found ? pop(t, T.noResult, 0.45) : (t < T.found + 0.12 ? 1 - seg(t, T.found - 0.0, T.found + 0.12) * 0.15 : pop(t, T.found + 0.05, 0.4));
    scaleIn(resultG, t >= T.noResult ? Math.max(0.02, rs) : 0);
    searchG.rotation.y = cam.rotation.y; resultG.quaternion.copy(cam.quaternion); searchG.quaternion.copy(cam.quaternion);
    searchG.scale.setScalar(pop(t, 0.0, 0.01) || 1);

    // client : marche 1 (jusqu'au bord), arrêt, marche 2 (traversée impossible)
    const A = V3(-5.0, 0, 1), B = V3(-1.35, 0, 1);
    const path2 = [V3(-1.35, 0, 1), V3(3.5, 0, 1), V3(3.5, 0, -0.05)];
    let pe, heading = 0, moving = 0, dist = 0;
    if (t < T.walk2[0]) {
      const u = ease.io2(seg(t, T.walk1[0], T.walk1[1]));
      pe = A.clone().lerp(B, u); dist = u * A.distanceTo(B);
      moving = seg(t, T.walk1[0], T.walk1[0] + 0.25) * (1 - seg(t, T.walk1[1] - 0.25, T.walk1[1]));
    } else {
      const L1 = path2[0].distanceTo(path2[1]), L2 = path2[1].distanceTo(path2[2]);
      const u = ease.io2(seg(t, T.walk2[0], T.walk2[1]));
      const d = u * (L1 + L2);
      if (d < L1) { pe = path2[0].clone().lerp(path2[1], d / L1); heading = 0; }
      else { pe = path2[1].clone().lerp(path2[2], (d - L1) / L2); heading = Math.PI / 2 * ease.io2(cl((d - L1) / 0.35)); }
      if (d > L1 - 0.3 && d < L1) heading = Math.PI / 2 * ease.io2((d - (L1 - 0.3)) / 0.6);
      dist = 3.65 + d;
      moving = seg(t, T.walk2[0], T.walk2[0] + 0.2) * (1 - seg(t, T.walk2[1] - 0.15, T.walk2[1]));
    }
    // téléportation invisible au point de jonction (x équivalent = -1)
    const truePos = pe.x < -1.0 ? pe.clone().addScalar(KD) : pe.clone();
    cust.position.copy(truePos);
    cust.rotation.y = heading;
    const lookPhone = t < T.walk1[1] + 0.1 ? 1 : 1 - seg(t, T.found, T.found + 0.3);
    walkPose(cust, dist * 5.2, moving, lookPhone);
    // entre dans la boutique
    const enter = seg(t, T.walk2[1] - 0.05, T.walk2[1] + 0.22);
    cust.scale.setScalar(Math.max(1e-4, 1 - ease.in2(enter)));
    cust.visible = enter < 1;
    door.rotation.y = -1.2 * ease.out3(seg(t, T.walk2[1] - 0.35, T.walk2[1] - 0.05)) * (1 - ease.io2(seg(t, T.walk2[1] + 0.25, T.walk2[1] + 0.6)));
    // point d'interrogation
    const aIn = pop(t, T.ask, 0.4), aOut = seg(t, T.coin + 0.3, T.coin + 0.55);
    scaleIn(ask, aIn * (1 - ease.in2(aOut)) * 0.9);
    ask.position.copy(cust.position).add(V3(0, 1.45 + 0.05 * Math.sin(t * 5), 0)); faceCam(ask);

    // pièce Scalify : chute, onde, guide la rotation puis s'incruste dans la dalle de jonction
    const jx = V3(-0.5, 0, 1);
    const cd = drop(t, T.coin, 4.5, 0.55);
    const hover = 1.75 + 0.08 * Math.sin((t - T.coin) * 4.0);
    const settle = ease.io3(seg(t, T.align - 0.05, T.align + 0.45));
    const cpos = V3(jx.x, lerp(hover + cd.y, 0.2, settle), jx.z);
    coin.position.copy(cpos);
    const spin = (1 - ease.out3(seg(t, T.coin, T.coin + 0.9))) * 9 + (t > T.orbit[0] ? (t < T.align ? (t - T.orbit[0]) * 3.2 : (T.align - T.orbit[0]) * 3.2) : 0);
    coin.rotation.set(Math.PI / 2 * (1 - settle) * 0.0 + (1 - settle) * 0.0, spin * (1 - settle), 0);
    coin.rotation.x = (1 - settle) * 1.25;
    coin.scale.setScalar(t < T.coin ? 1e-4 : lerp(1, 0.38, settle) * (cd.sq || 1));
    coin.visible = t >= T.coin && t < T.align + 0.45;
    inlay.visible = t >= T.align + 0.45;
    const rp = seg(t, T.pulse, T.pulse + 0.7);
    ring.visible = rp > 0 && rp < 1; ring.position.copy(cpos).add(V3(0, -0.1, 0)); ring.scale.setScalar(0.6 + rp * 3.2); ring.material.opacity = 1 - rp;
    const rp2 = seg(t, T.align + 0.3, T.align + 1.0);
    if (rp2 > 0 && rp2 < 1) { ring.visible = true; ring.position.set(jx.x, 0.16, jx.z); ring.scale.setScalar(0.4 + rp2 * 3.6); ring.material.opacity = 1 - rp2; ring.material.color.set(C.mint); }
    else ring.material.color.set(C.ember);

    // vague de lumière sur le chemin à l'alignement
    const order = [...custTiles].reverse().concat(tiles.slice(0, 6));
    order.forEach((m, i) => {
      const w = seg(t, T.wave[0] + i * 0.055, T.wave[0] + i * 0.055 + 0.3);
      const b = Math.sin(Math.PI * w);
      m.material.color.set('#fff3dc').lerp(new THREE.Color(C.yellow), b * 0.85);
      m.scale.y = 1 + b * 1.4;
    });
    // lumières de la boutique
    const lit = ease.out2(seg(t, T.lights, T.lights + 0.35));
    const glass = new THREE.Color('#bfe0ff');
    winMat.color.copy(glass).lerp(WIN_LIT, lit);
    sideWins.forEach(w => w.material.color.copy(glass).lerp(WIN_LIT, lit));
    doorWin.material.color.copy(glass).lerp(WIN_LIT, lit);
    // notification
    const nIn = pop(t, T.notif, 0.45);
    scaleIn(notif, nIn); notif.position.y = 4.0 + 0.25 * ease.out3(seg(t, T.notif, T.notif + 0.6)); faceCam(notif);
    // confettis (balistique pure)
    confetti.forEach(m => {
      const u = t - T.lights;
      if (u <= 0 || u > 1.6) { m.visible = false; return; }
      const d = m.userData; m.visible = true;
      m.position.set(3.5 + Math.cos(d.a) * d.v * u * 0.55, 1.2 + d.up * u - 4.9 * u * u, 0.1 + Math.sin(d.a) * d.v * u * 0.55);
      m.rotation.set(d.spin * u, d.spin * 0.7 * u, 0);
      m.scale.setScalar(Math.max(1e-4, 1 - seg(u, 1.1, 1.6)));
    });
    // nuages
  }

  const WIN_LIT = new THREE.Color(C.sun); // réglé plus bas pour coller au dessus de la plaque 1

  function animStack(t) {
    const on = t >= T.CUT;
    stack.visible = on;
    if (!on) return;
    // plaques : chute à leur station, puis repli en bloc
    const col = ease.in2(seg(t, T.collapse[0], T.collapse[1]));
    const impact = seg(t, T.collapse[1], T.collapse[1] + 0.35);
    plates.forEach((g, i) => {
      const yStation = i * STEP, yBlock = i * PT;
      let y = yStation;
      if (i > 0) { const d = drop(t, T.P[i], 7.0, 0.6); y += d.y; g.scale.set(1, d.u > 0 ? d.sq : 1, 1); g.visible = t >= T.P[i]; }
      y = lerp(y, yBlock, col);
      g.position.y = y + (impact > 0 && impact < 1 ? -Math.sin(Math.PI * impact) * 0.08 * (i + 1) / 5 : 0);
    });
    // rangement des contenus avant le repli
    const pk = ease.in2(seg(t, T.pack[0], T.pack[1]));
    plates.forEach(g => { g.userData.content.scale.setScalar(Math.max(1e-4, 1 - pk)); g.userData.content.visible = pk < 1; });

    // P1 — site
    const t0 = T.P[0];
    const d1 = (o, at0, H = 2.6) => { const d = drop(t, at0, H, 0.5); o.position.y = 0.1 + d.y; o.visible = t >= at0; return d; };
    { const d = drop(t, t0 + 0.25, 2.6, 0.5); page.position.y = d.y; page.visible = t >= t0 + 0.25; }
    d1(header, t0 + 0.4); d1(hero, t0 + 0.55); lines.forEach((m, i) => d1(m, t0 + 0.68 + i * 0.07)); d1(buttonG, t0 + 0.9);
    prods.forEach((g, i) => d1(g, t0 + 1.0 + i * 0.08));
    const cm = ease.io3(seg(t, t0 + 1.15, t0 + 1.6));
    cursor.visible = t > t0 + 1.1 && t < T.P[1] + 0.8;
    cursor.position.set(lerp(1.8, -0.55, cm), 0.75 + 0.35 * (1 - cm), lerp(2.6, 0.85, cm));
    cursor.rotation.set(-Math.PI / 2, 0, 0.6);
    const press = Math.sin(Math.PI * seg(t, t0 + 1.62, t0 + 1.82));
    button.scale.y = 1 - press * 0.45; cursor.position.y -= press * 0.18;

    // repère écran courant (pour poser les panneaux face caméra comme sur une page)
    const e = cam.matrixWorld.elements;
    const R = V3(e[0], e[1], e[2]), U = V3(e[4], e[5], e[6]), D = V3(e[8], e[9], e[10]);
    const lay = (o, dx, dy, dz = 1.2) => { o.position.set(0, 0, 0).addScaledVector(R, dx).addScaledVector(U, dy).addScaledVector(D, dz); faceCam(o); };

    // les panneaux d'une plaque s'effacent quand la suivante tombe
    const gone = i => 1 - ease.in2(seg(t, (i < 4 ? T.P[i + 1] : T.overview[0]) - 0.02, (i < 4 ? T.P[i + 1] : T.overview[0]) + 0.22));
    // P2 — fiche Google
    const t1 = T.P[1];
    mapSlab.visible = t >= t1 + 0.3;
    mapSlab.position.y = 0.04 + drop(t, t1 + 0.3, 1.5, 0.45).y;
    bldg.forEach((m, i) => { const s = pop(t, t1 + 0.45 + i * 0.06, 0.4); m.scale.set(1, Math.max(1e-4, s), 1); m.visible = s > 0.01; });
    { const s = pop(t, t1 + 0.5, 0.4); gBak.scale.set(1, Math.max(1e-4, s), 1); gBak.visible = s > 0.01; }
    { const d = drop(t, t1 + 0.65, 4.0, 0.55); bigPin.position.y = 0.98 + d.y; bigPin.visible = t >= t1 + 0.65; bigPin.scale.set(1, d.sq, 1); bigPin.rotation.y = (1 - ease.out3(seg(t, t1 + 0.65, t1 + 1.3))) * 4; }
    { const r = seg(t, t1 + 1.05, t1 + 1.75); pinRing.visible = r > 0 && r < 1; pinRing.scale.setScalar(0.3 + r * 2.6); pinRing.material.opacity = 1 - r; }
    { const s = pop(t, t1 + 1.05, 0.5) * gone(1); scaleIn(fiche, s); lay(fiche, 1.1, 3.45 + 0.15 * ease.out3(seg(t, t1 + 1.05, t1 + 1.6)), 1.6); }

    // P3 — avis
    const t2 = T.P[2];
    stars.forEach((st, i) => {
      const p = pop(t, t2 + 0.4 + i * 0.1, 0.5);
      scaleIn(st, p);
      st.scale.multiplyScalar(gone(2) * 0.999 + 0.001);
      lay(st, (i - 2) * 0.98, 0.95 + 0.32 * Math.cos((i - 2) * 0.6) + 0.12 * ease.out3(seg(t, t2 + 0.4 + i * 0.1, t2 + 1.0 + i * 0.1)), 1.3);
      st.rotateY((1 - ease.out3(seg(t, t2 + 0.4 + i * 0.1, t2 + 1.0 + i * 0.1))) * Math.PI * 2);
    });
    { const s = pop(t, t2 + 0.95, 0.45) * gone(2); scaleIn(review, s); lay(review, -0.45, 3.55, 1.5); }
    { const s = pop(t, t2 + 1.4, 0.45) * gone(2); scaleIn(reply, s); lay(reply, 1.05, 2.12, 1.7); }

    // P4 — posts
    const t3 = T.P[3];
    posts.forEach((c, i) => {
      const s = pop(t, t3 + 0.35, 0.5) * gone(3);
      const f = ease.out3(seg(t, t3 + 0.5, t3 + 1.0));
      scaleIn(c, s);
      lay(c, (i - 1) * 1.78 * f, 2.05 + (i === 1 ? 0.22 * f : 0), 1.3 + (i === 1 ? 0.05 : 0));
      c.rotateZ(-(i - 1) * 0.12 * f);
    });
    hearts.forEach((h, i) => {
      const u = t - (t3 + 1.0 + i * 0.12);
      if (u <= 0 || u > 1.1) { h.visible = false; return; }
      h.visible = true;
      lay(h, ((i % 3) - 1) * 1.78 + Math.sin(u * 6 + i) * 0.2, 3.2 + u * 1.5, 1.6);
      h.scale.setScalar(Math.max(1e-4, Math.sin(Math.PI * cl(u / 1.1)) * 1.1 * gone(3)));
    });

    // P5 — assistant IA
    const t4 = T.P[4];
    { const s = pop(t, t4 + 0.3, 0.45) * gone(4); scaleIn(qBub, s); lay(qBub, 0.75, 3.75, 1.5); }
    { const s = pop(t, t4 + 0.7, 0.3) * (1 - seg(t, t4 + 1.05, t4 + 1.15)); scaleIn(dots, s); lay(dots, 1.7, 2.45, 1.5);
      const dn = Math.floor((t - t4) * 7) % 3; if (dn !== dotsKey) { drawDots(dn); dotsKey = dn; } }
    { const s = pop(t, t4 + 1.1, 0.5) * gone(4); scaleIn(aBub, s); lay(aBub, 0.95, 2.25, 1.6); }
    lay(dial, -2.35, 2.3, 0.9);
    { const s = pop(t, t4 + 0.15, 0.45) * gone(4); dial.scale.setScalar(Math.max(1e-4, s)); dial.visible = s > 0.01; }
    orbit.rotation.z = -Math.PI * 2 * ease.io2(seg(t, t4 + 0.4, t4 + 2.4));

    // étiquettes de la vue éclatée
    tags.forEach((c, i) => {
      const s = pop(t, T.overview[0] + 0.12 + i * 0.07, 0.4) * (1 - ease.in2(seg(t, T.pack[0], T.pack[1])));
      scaleIn(c, s);
      c.position.set(0, plates[i].position.y + PT, 0).addScaledVector(R, 4.6).addScaledVector(U, 0.35).addScaledVector(D, 2.5); faceCam(c);
    });

    // bloc → prix
    const pr = drop(t, T.price, 3.8, 0.55);
    priceG.visible = t >= T.price;
    priceG.position.set(0, 5 * PT + pr.y, 0); priceG.rotation.y = ISO_AZ; priceG.scale.set(1, pr.sq, 1);
    // recul : l'île monte, le bloc rétrécit en monument
    const up = ease.outExpo(seg(t, T.pull[0], T.pull[0] + 0.9));
    fIsl.visible = t >= T.pull[0];
    fIsl.position.set(1.4, lerp(-14, 0, up) - 0.001, 0.4);
    const shrink = ease.io3(seg(t, T.pull[0], T.pull[0] + 1.0));
    const sBlk = lerp(1, 0.42, shrink);
    const blockPos = V3(lerp(0, -3.6, shrink), 0, lerp(0, -2.4, shrink));
    plates.forEach((g, i) => { g.position.x = blockPos.x; g.position.z = blockPos.z; g.scale.x = sBlk; g.scale.z = sBlk; g.position.y = (t >= T.collapse[1] ? i * PT * sBlk : g.position.y); g.scale.y = t >= T.collapse[1] ? sBlk : g.scale.y; });
    priceG.position.x = blockPos.x; priceG.position.z = blockPos.z; priceG.position.y = 5 * PT * sBlk + pr.y * sBlk;
    priceG.scale.set(sBlk, pr.sq * sBlk, sBlk);
    // îlots numérotés : vague 1 → 15
    plots.forEach((g, i) => {
      const s = pop(t, T.plots[0] + i * 0.055, 0.42);
      g.visible = t >= T.pull[0] + 0.5; g.scale.set(1, Math.max(0.06, s), 1);
      g.position.y = 0;
      const glow = i === 0 ? ease.out2(seg(t, T.ctaCoin + 0.45, T.ctaCoin + 0.8)) : 0;
      g.userData.top.color.set('#ffffff').lerp(new THREE.Color(C.yellow), glow);
    });
    // calendrier + J-23
    { const d = drop(t, T.calendar, 5, 0.55); calendar.visible = t >= T.calendar; calendar.position.set(4.4, d.y, -3.4); calendar.rotation.y = ISO_AZ; calendar.scale.set(1.35, 1.35 * d.sq, 1.35); }
    { const s = pop(t, T.calendar + 0.55, 0.45); scaleIn(jTag, s); jTag.position.set(4.4, 4.3, -3.4); faceCam(jTag); }
    { const d = drop(t, T.off30, 5, 0.55); off30.visible = t >= T.off30; off30.position.set(-4.3, d.y, 3.6); off30.rotation.y = ISO_AZ; off30.scale.set(1, d.sq, 1); }
    // pièce Scalify sur la place n°1 + mini-boutique
    { const d = drop(t, T.ctaCoin, 6, 0.6); ctaCoin.visible = t >= T.ctaCoin && t < T.miniShop + 0.1;
      const p0 = plots[0].position; ctaCoin.position.set(p0.x, 0.27 + 0.12 + d.y, p0.z); ctaCoin.rotation.x = (1 - ease.out3(seg(t, T.ctaCoin, T.ctaCoin + 0.6))) * 1.2; ctaCoin.scale.setScalar(1 - ease.in2(seg(t, T.miniShop - 0.1, T.miniShop + 0.1)) * 0.99); }
    { const s = pop(t, T.miniShop, 0.5); const p0 = plots[0].position; mini.visible = s > 0.01; mini.position.set(p0.x - 0.15, 0.26, p0.z + 0.3); mini.scale.set(0.32 * s, 0.32 * Math.max(1e-4, s), 0.32 * s); mini.rotation.y = 0; }
    { const s = pop(t, T.miniShop + 0.35, 0.45); scaleIn(placeTag, s); const p0 = plots[0].position; placeTag.position.set(p0.x, 0.4, p0.z).addScaledVector(U, 1.55 + 0.06 * Math.sin((t - T.miniShop) * 3)).addScaledVector(R, 1.7).addScaledVector(D, 2.0); faceCam(placeTag); }
  }

  function renderAt(t) {
    t = cl(t, 0, DUR);
    applyCam(t);
    animTown(t);
    animStack(t);
    E.renderFrame(t);
  }

  // couleur de la vitrine allumée = rendu du dessus de la plaque n°1 (calibré par la lumière)
  function calibrate(factor) { WIN_LIT.set(C.sun).multiplyScalar(factor); WIN_LIT.r *= 1.038; WIN_LIT.g *= 0.989; WIN_LIT.b *= 0.9; }
  calibrate(1.0);

  return { renderAt, E, calibrate };
}
