import * as THREE from 'three';
import { TTFLoader } from 'three/addons/loaders/TTFLoader.js';
import { Font } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const END = 27.6;
const VO = 0.10; // décalage de la voix off
const $ = id => document.getElementById(id);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const outExpo = k => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));
const outBack = (k, s = 1.9) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
const inOut = k => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const inExpo = k => (k <= 0 ? 0 : Math.pow(2, 10 * k - 10));
const win = (t, a, b) => t >= a && t < b;
const rnd = s => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const words = await (await fetch('words.json')).json();
const W = i => words[i].t + VO; // instant (vidéo) où le mot i est prononcé

/* ---------- 14 outils (source : site Scalify) ---------- */
const TOOLS = [
  [19, '🌐', 'Site internet', 'Prêt en 7 jours, traduit', 'Inclus', '#dceeff', 'ph/37970775.jpg'],
  [21, '📍', 'Fiche Google', 'Vous sortez sur Google Maps', 'Inclus', '#c9f5dc', 'ph/31846864.jpg'],
  [23, '⭐', 'Avis Google', 'Une réponse à chaque avis', 'Inclus', '#fff3b8', 'ph/2544829.jpg'],
  [24, '📸', 'Réseaux sociaux', 'Instagram · Facebook · TikTok', 'Inclus', '#ffd6ec', 'ph/7309930.jpg'],
  [26, '🤖', 'Assistant IA 24/7', 'Répond et réserve, même la nuit', 'Dès Pro', '#e9ccff', 'ph/4473496.jpg'],
  [31, '🔁', 'Relances auto', 'Rappels de RDV, demandes d’avis', 'Dès Pro', '#dceeff', 'ph/7446915.jpg'],
  [33, '📣', 'Pub Google & Insta', 'Campagnes créées et gérées', 'Dès Premium', '#ffe1d6', 'ph/36730466.jpg'],
  [37, '📞', 'Standard tél. IA', 'Décroche 24 h/24', 'Option', '#fff3b8', 'ph/6870324.jpg'],
  [39, '🧾', 'Devis auto', 'L’IA prépare, vous validez', 'Option', '#c9f5dc', 'ph/8486978.jpg'],
  [40, '🛍️', 'Commande en ligne', 'Click & collect, 0 commission', 'Option', '#ffd6ec', 'ph/5953500.jpg'],
  [43, '📅', 'Réservations', 'Avec acompte : fini les lapins', 'Option', '#e9ccff', 'ph/1836983.jpg'],
  [44, '💳', 'Carte de fidélité', 'Dans le téléphone du client', 'Option', '#dceeff', 'ph/34255748.jpg'],
  [47, '🎬', 'Vidéos TikTok', '4 vidéos pro par mois', 'Option', '#ffe1d6', 'ph/3933017.jpg'],
  [49, '📦', 'Boutique en ligne', 'E-commerce clé en main', 'Option', '#fff3b8', 'ph/5717839.jpg'],
];
const TAGC = { 'Inclus': '#55db9c', 'Dès Pro': '#e9ccff', 'Dès Premium': '#dceeff', 'Option': '#ffd731' };
const LIST_START = W(19) - .12, LIST_END = W(52) - .1;
const TT = TOOLS.map(x => W(x[0]) - .08); // apparition de chaque carte

/* ---------- photos ---------- */
// [src, début, fin, entrée]
const SHOTS = TOOLS.map((x, i) => [x[6], TT[i], i + 1 < TOOLS.length ? TT[i + 1] : LIST_END, ['whipL', 'punch', 'whipR', 'zoomOut'][i % 4]]);
const shotEls = SHOTS.map(s => { const d = document.createElement('div'); d.className = 'shot'; d.innerHTML = `<img src="${s[0]}">`; $('shots').appendChild(d); return d; });
for (let i = 0; i < 14; i++) $('bar').appendChild(document.createElement('i'));
for (let i = 0; i < 15; i++) $('seats').appendChild(document.createElement('i'));
TOOLS.forEach(x => { const d = document.createElement('div'); d.style.background = x[5]; d.innerHTML = `<span class="emo">${x[1]}</span>`; $('wall').appendChild(d); });

/* ---------- notifications de l'accroche ---------- */
const NOTIFS = [
  [0.12, '📅', '#e9ccff', 'Réservation', 'Table pour 4 · samedi 20 h · acompte payé'],
  [0.55, '⭐', '#fff3b8', 'Avis Google', '★★★★★ « Au top ! » · réponse envoyée'],
  [0.98, '💬', '#c9f5dc', 'Assistant IA', '3 clients ont eu leur réponse'],
  [1.38, '🛍️', '#ffd6ec', 'Commande', 'Click & collect · 24,50 €'],
  [1.78, '📞', '#dceeff', 'Standard IA', 'Appel décroché · RDV mardi 10 h'],
];
const POOL = NOTIFS.map(n => n.slice(1));
for (let k = 0; k < 9; k++) NOTIFS.push([2.08 + k * .13, ...POOL[(k + 2) % POOL.length]]);
const ntEls = NOTIFS.map(([, e, c, a, s]) => {
  const d = document.createElement('div'); d.className = 'nt';
  d.innerHTML = `<span class="ic emo" style="background:${c}">${e}</span><span class="tx"><b>${a}<small>maintenant</small></b><span>${s}</span></span>`;
  $('notifs').appendChild(d); return d;
});
const NOTIF_T = NOTIFS.map(n => n[0]);

/* ---------- sous-titres ---------- */
const SHOWN = { 0: '3', 15: 'Scalify', 53: '2', 60: '49 €', 70: '30 %' };
const KEY = new Set([3, 5, 10, 15, 54, 58, 60, 65, 70, 71]);
const GROUPS = [[0,1],[2,3],[4,5],[6,7,8],[9,10],[11,12,13,14],[15,16,17,18],[52],[53,54],[55,56],[57,58],[59,60],[61,62],[63],[64,65],[66,67],[68,69,70],[71]];
const capEl = $('caps');
function renderCaps(t) {
  const tt = t - VO + .06;
  let gi = -1; GROUPS.forEach((g, i) => { if (words[g[0]].t <= tt) gi = i; });
  const g = GROUPS[gi];
  const last = g && words[g[g.length - 1]];
  if (!g || tt > last.t + last.d + .6 || win(t, LIST_START, LIST_END)) { capEl.innerHTML = ''; capEl.dataset.g = ''; return; }
  if (capEl.dataset.g !== String(gi)) { capEl.dataset.g = gi; capEl.innerHTML = g.map(i => `<span class="w" data-i="${i}">${SHOWN[i] || words[i].w}</span>`).join(''); }
  capEl.style.top = t < 4 ? '1420px' : '1360px';
  const pk = prog(tt, words[g[0]].t, words[g[0]].t + .16);
  capEl.style.transform = `scale(${lerp(.55, 1, outBack(pk, 2.4))}) rotate(${lerp(-4, 0, pk)}deg)`;
  capEl.querySelectorAll('.w').forEach(el => {
    const i = +el.dataset.i, w = words[i];
    const active = tt >= w.t && (i === g[g.length - 1] || tt < words[i + 1].t);
    el.style.fontSize = (t < 4 ? 140 : 124) + 'px';
    el.style.color = active ? '#ffd731' : (tt >= w.t + w.d && KEY.has(i) ? '#55db9c' : '#fff');
    el.style.transform = active ? `scale(${lerp(1.25, 1.1, prog(tt, w.t, w.t + .12))}) rotate(-2deg)` : 'none';
  });
}

/* ---------- 3D ---------- */
const renderer = new THREE.WebGLRenderer({ canvas: $('three'), alpha: true, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(1080, 1920, false);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = .55;
const cam = new THREE.PerspectiveCamera(32, 1080 / 1920, .1, 200); cam.position.set(0, 0, 30);
const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(6, 10, 12); scene.add(key);
const rim = new THREE.DirectionalLight(0x8f7bff, 3); rim.position.set(-10, -4, -6); scene.add(rim);
scene.add(new THREE.AmbientLight(0xffffff, .35));
const font = new Font(await new Promise((res, rej) => new TTFLoader().load('Anton.ttf', res, undefined, rej)));
const mat = (c, o = {}) => new THREE.MeshPhysicalMaterial({ color: c, metalness: .1, roughness: .3, clearcoat: .6, clearcoatRoughness: .12, ...o });
function text3d(str, size, front, side, depth = 1) {
  const g = new TextGeometry(str, { font, size, depth, curveSegments: 10, bevelEnabled: true, bevelThickness: .14, bevelSize: .07, bevelSegments: 5 });
  g.computeBoundingBox(); g.center();
  const grp = new THREE.Group(); grp.add(new THREE.Mesh(g, [mat(front), mat(side, { roughness: .35 })])); grp.visible = false; scene.add(grp); return grp;
}
const YEL = [0xffcc00, 0xb86e00], GRN = [0x2fd98a, 0x0f7a4a];
const TWO = text3d('2 MIN', 2.3, ...GRN), PRICE = text3d('49€', 3.0, ...YEL), J30 = text3d('J-30', 2.6, ...YEL), J30b = text3d('J-30', 1.9, ...YEL);
function logoTex() {
  const c = document.createElement('canvas'); c.width = c.height = 1024; const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, 1024, 1024); x.scale(32, 32); x.lineCap = x.lineJoin = 'round'; x.lineWidth = 3; x.strokeStyle = '#000';
  x.stroke(new Path2D('M21 10.8H13.9a2.85 2.85 0 0 0 0 5.7h4.3a2.85 2.85 0 0 1 0 5.7H11'));
  x.fillStyle = '#4da2ff'; x.beginPath(); x.arc(22.4, 21.8, 2, 0, 7); x.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.center.set(.5, .5); t.rotation = Math.PI / 2; return t;
}
const coinGeo = new THREE.CylinderGeometry(3, 3, .55, 96); coinGeo.rotateX(Math.PI / 2);
const face = mat(0xffffff, { map: logoTex(), metalness: 0, roughness: .3 });
const COIN = new THREE.Group(); COIN.add(new THREE.Mesh(coinGeo, [mat(0x111111, { metalness: .8, roughness: .25 }), face, face])); COIN.visible = false; scene.add(COIN);
const PART = new THREE.Group();
for (let i = 0; i < 70; i++) {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(.08 + rnd(i) * .18, 1), new THREE.MeshBasicMaterial({ color: [0xffd731, 0x55db9c, 0xe9ccff, 0xffffff][i % 4] }));
  m.position.set((rnd(i + 1) - .5) * 22, 0, -rnd(i + 3) * 25); m.userData.v = .3 + rnd(i + 4); PART.add(m);
}
scene.add(PART);

await Promise.all(SHOTS.map(s => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = s[0]; })));
await document.fonts.load('800 40px IT'); await document.fonts.load('40px Anton'); await document.fonts.load('40px "Noto Color Emoji"');

/* ---------- effets ---------- */
const grainCtx = $('grain').getContext('2d'), grainImg = grainCtx.createImageData(360, 640);
function grain(f) { const d = grainImg.data; let s = f * 9301 + 49297; for (let i = 0; i < d.length; i += 4) { s = (s * 1103515245 + 12345) & 0x7fffffff; d[i] = d[i + 1] = d[i + 2] = (s >> 16) & 255; d[i + 3] = 255; } grainCtx.putImageData(grainImg, 0, 0); }
const setUI = (id, op, tf = '') => { const e = $(id); e.style.opacity = op; e.style.transform = tf; };
const pop = (t, t0, d = .35) => { const k = prog(t, t0, t0 + d); return { op: k > 0 ? 1 : 0, s: lerp(.2, 1, outBack(k)), k }; };
const S2 = 3.95, S4 = LIST_END, S5 = W(59) - .15, S6 = W(63) - .15, S7 = W(71) - .2;
const IMPACTS = [W(10), 4.15, W(54), W(60), W(65), W(70), S7];
const FLASHES = [[0, .1], [W(10) - .02, .25], [S4, .18], [S5, .14], [S6, .18], [S7, .2]];
const LEAKS = [[S2 - .1, S2 + 1.1], [S4 - .3, S4 + .8], [S6 - .3, S6 + .9], [S7 - .2, END]];

window.seek = (t, frame = Math.round(t * 30)) => {
  // secousses (impacts + vibrations du téléphone)
  let a = 0;
  IMPACTS.forEach(i => { const k = t - i; if (k >= 0 && k < .35) a += (1 - k / .35) ** 2 * 24; });
  NOTIF_T.forEach(i => { const k = t - i; if (t < S2 && k >= 0 && k < .15) a += 7; });
  TT.forEach(i => { const k = t - i; if (k >= 0 && k < .2) a += (1 - k / .2) * 9; });
  $('stage').style.transform = `translate(${(rnd(frame) - .5) * a}px,${(rnd(frame + 7) - .5) * a}px) rotate(${(rnd(frame + 3) - .5) * a * .04}deg)`;

  /* accroche : écran verrouillé */
  const lockOn = t < S2;
  const lk = $('lock'); lk.style.opacity = lockOn ? 1 : 0;
  if (lockOn) {
    const wake = prog(t, 0, .25); // l'écran s'allume
    lk.style.filter = `brightness(${lerp(.1, 1, outExpo(wake))})`;
    const exit = prog(t, W(10) - .05, S2); // « bosse » : on plonge dans l'écran
    lk.style.transform = `scale(${lerp(1.06, 1, outExpo(wake)) * lerp(1, 2.6, inExpo(exit))})`;
    lk.style.opacity = 1 - inExpo(exit) * .9;
    // pile de notifications : la plus récente en haut
    const arrived = NOTIF_T.filter(x => x <= t).length;
    ntEls.forEach((el, i) => {
      if (i >= arrived) { el.style.opacity = 0; return; }
      const depth = arrived - 1 - i; // 0 = la plus récente
      const k = prog(t, NOTIF_T[i], NOTIF_T[i] + .22);
      const y = depth < 4 ? depth * 205 : 3 * 205 + (depth - 3) * 18;
      const sc = depth < 4 ? 1 : Math.max(.8, 1 - (depth - 3) * .04);
      el.style.opacity = depth < 7 ? clamp(k * 3) : 0;
      el.style.zIndex = 100 - depth;
      el.style.transform = `translateY(${lerp(-40, y, outExpo(k))}px) scale(${sc * lerp(.85, 1, outBack(k))})`;
      el.style.filter = depth >= 4 ? `brightness(${1 - (depth - 3) * .12})` : '';
    });
    const extra = Math.max(0, arrived - 5);
    $('nNum').textContent = '+' + (extra + 5);
    const c = pop(t, 2.1, .25); setUI('nCount', t > 2.1 ? 1 : 0, `scale(${c.s * (1 + (rnd(arrived) - .5) * .02)})`);
  }

  /* fonds */
  const dark = win(t, S2, LIST_START) || t >= S4;
  $('bg').style.opacity = dark ? 1 : 0;
  let anyShot = false;
  SHOTS.forEach(([, a0, b0, fx], i) => {
    const el = shotEls[i];
    if (!win(t, a0, b0)) { el.style.opacity = 0; return; }
    anyShot = true;
    const k = prog(t, a0, b0), e = outExpo(prog(t, a0, a0 + .2));
    let s = lerp(1.14, 1.04, inOut(k)), x = (i % 2 ? -30 : 30) * k, blur = 0, skew = 0;
    if (fx === 'punch') { s *= lerp(1.35, 1, e); blur = lerp(14, 0, e); }
    if (fx === 'zoomOut') { s *= lerp(.75, 1, e); blur = lerp(10, 0, e); }
    if (fx.startsWith('whip')) { const d = fx === 'whipL' ? 1 : -1; x += d * lerp(900, 0, e); blur = lerp(22, 0, e); skew = d * lerp(-12, 0, e); }
    el.style.opacity = 1;
    el.style.filter = `contrast(1.14) saturate(1.28) brightness(.9) blur(${blur.toFixed(1)}px)`;
    el.style.transform = `translate(${x}px,0) scale(${s}) skewX(${skew}deg)`;
  });
  $('grade').style.opacity = anyShot ? .85 : 0; $('shade').style.opacity = anyShot ? 1 : 0;

  /* liste des outils */
  const inList = win(t, LIST_START, LIST_END);
  let cur = -1; TT.forEach((x, i) => { if (t >= x) cur = i; });
  setUI('counter', inList ? 1 : 0, `scale(${inList && cur >= 0 ? lerp(1.4, 1, outBack(prog(t, TT[cur], TT[cur] + .2))) : 1})`);
  setUI('bar', inList ? 1 : 0);
  $('cardWrap').style.opacity = inList && cur >= 0 ? 1 : 0;
  if (inList && cur >= 0) {
    const [, e, name, sub, tag, col] = TOOLS[cur];
    $('cNum').textContent = String(cur + 1).padStart(2, '0');
    [...$('bar').children].forEach((b, i) => b.classList.toggle('on', i <= cur));
    $('cEmo').textContent = e; $('cEmo').parentElement.style.background = col;
    $('cName').textContent = name; $('cSub').textContent = sub;
    $('cTag').textContent = tag; $('cTag').style.background = TAGC[tag];
    $('cBg').textContent = String(cur + 1).padStart(2, '0');
    const k = prog(t, TT[cur], TT[cur] + .32), dir = cur % 2 ? -1 : 1;
    const ex = cur + 1 < TT.length ? prog(t, TT[cur + 1] - .1, TT[cur + 1]) : prog(t, LIST_END - .15, LIST_END);
    $('card').style.transform = `translateZ(${lerp(-500, 0, outExpo(k))}px) rotateY(${dir * lerp(-80, 0, outBack(k, 1.4)) + dir * ex * 70 + Math.sin(t * 2) * 4}deg) rotateX(${Math.sin(t * 1.6) * 3}deg)`;
    $('card').style.opacity = 1 - ex;
  }

  /* mur des 14 + 2 min */
  const wallOn = win(t, S4, S5);
  $('wall').style.opacity = wallOn ? 1 : 0;
  if (wallOn) {
    const w0 = prog(t, S4, S4 + .45), dim = prog(t, W(53) - .1, W(53) + .2);
    $('wall').style.transform = `rotateX(${lerp(55, 18, outExpo(w0))}deg) scale(${lerp(1.6, .92, outExpo(w0)) - dim * .1}) translateY(${-dim * 60}px)`;
    $('wall').style.filter = `blur(${dim * 6}px) brightness(${1 - dim * .6})`;
    [...$('wall').children].forEach((d, i) => { const p = pop(t, S4 + i * .025, .3); d.style.opacity = p.op; d.style.transform = `scale(${p.s})`; });
  }
  { const a1 = pop(t, W(55) - .05, .3); setUI('perWeek', wallOn ? a1.op : 0, `translateY(${lerp(50, 0, outExpo(a1.k))}px)`);
    const a2 = pop(t, W(57) - .05, .3); setUI('wa', wallOn ? a2.op : 0, `scale(${a2.s})`); }
  /* prix */
  { const on = win(t, S5, S6); const a1 = pop(t, W(61) - .05, .3); setUI('perMonth', on ? a1.op : 0, `translateY(${lerp(50, 0, outExpo(a1.k))}px)`);
    const a2 = pop(t, W(62), .3); setUI('note', on ? a2.op * .85 : 0); }
  /* J-30 + offre */
  { const on = win(t, S6, S7);
    const a1 = pop(t, S6 + .05, .3); setUI('launch', on ? a1.op : 0, `scale(${a1.s})`);
    $('seats').style.opacity = on ? 1 : 0;
    [...$('seats').children].forEach((d, i) => { const p = pop(t, W(67) + i * .035, .25); d.style.opacity = p.op; d.style.transform = `scale(${p.s})`; });
    const a2 = pop(t, W(70) - .1, .35); setUI('offer', on ? a2.op : 0, `rotate(-3deg) scale(${lerp(2.2, 1, outExpo(a2.k))})`); }
  /* fin */
  { const on = t >= S7; const a1 = pop(t, S7 + .3, .35); setUI('endTag', on ? a1.op : 0, `translateY(${lerp(40, 0, outExpo(a1.k))}px)`);
    const a2 = pop(t, S7 + .45, .35); const pulse = 1 + Math.max(0, Math.sin((t - S7 - .9) * 7)) * .06 * (t > S7 + .9);
    setUI('follow', on ? a2.op : 0, `scale(${a2.s * pulse})`); }
  /* intro marque */
  { const on = win(t, S2, LIST_START); const a1 = pop(t, S2 + .15, .4); setUI('brand', on ? a1.op : 0, `translateY(${lerp(80, 0, outExpo(a1.k))}px)`);
    $('brand').style.letterSpacing = lerp(.4, .02, outExpo(a1.k)) + 'em';
    const a2 = pop(t, W(12) - .05, .3); setUI('tools', on ? a2.op : 0, `scale(${a2.s})`); }

  /* 3D */
  [TWO, PRICE, J30, J30b, COIN].forEach(o => (o.visible = false));
  PART.visible = dark && !wallOn;
  PART.children.forEach((m, i) => { m.position.y = ((rnd(i + 2) - .5) * 38 + t * m.userData.v * 1.5 + 19) % 38 - 19; m.rotation.x = t * m.userData.v; });
  if (win(t, S2, LIST_START)) {
    COIN.visible = true; const k = prog(t, S2, S2 + .7);
    COIN.position.set(0, lerp(9, 3, outBack(prog(t, S2, S2 + .4), 1.4)), 0);
    COIN.rotation.set(.12, lerp(Math.PI * 6, 0, outExpo(k)) + Math.sin(t * 2) * .12, 0); COIN.scale.setScalar(1);
  }
  if (wallOn && t > W(54) - .25) {
    TWO.visible = true; const k = prog(t, W(54) - .2, W(54) + .05);
    TWO.position.set(0, .5, lerp(-70, 0, outExpo(k)));
    TWO.rotation.set(Math.sin(t * 1.4) * .08, lerp(-1.2, 0, outExpo(k)) + Math.sin(t * 1.1) * .2, 0);
  }
  if (win(t, S5, S6)) {
    PRICE.visible = true; const k = prog(t, W(60) - .2, W(60) + .1);
    PRICE.position.set(0, 3.2, lerp(-70, 0, outExpo(k)));
    PRICE.rotation.set(Math.sin(t * 1.4) * .08, lerp(-1.4, 0, outExpo(k)) + Math.sin(t * 1.1) * .22, 0);
  }
  if (win(t, S6, S7)) {
    J30.visible = true; const k = prog(t, W(65) - .25, W(65) + .02);
    J30.position.set(0, 3.6, lerp(-80, 0, outExpo(k)));
    J30.rotation.set(Math.sin(t * 2) * .05, inOut(prog(t, W(68), W(68) + .4)) * Math.PI * 2 + Math.sin(t * 1.6) * .2, 0);
  }
  if (t >= S7) {
    COIN.visible = J30b.visible = true; const k = prog(t, S7, S7 + .5);
    COIN.position.set(0, lerp(14, 5.4, outBack(k, 1.3)), 0); COIN.scale.setScalar(.65);
    COIN.rotation.set(.1, lerp(Math.PI * 4, 0, outExpo(k)) + Math.sin(t * 2) * .15, 0);
    const b = prog(t, S7 + .15, S7 + .5);
    J30b.position.set(0, 1.7, lerp(-60, 0, outExpo(b))); J30b.rotation.set(Math.sin(t * 1.5) * .07, Math.sin(t * 1.2) * .3, 0);
  }
  renderer.render(scene, cam);

  /* lumière */
  let leak = 0; LEAKS.forEach(([a0, b0]) => { if (win(t, a0, b0)) leak = Math.max(leak, Math.sin(prog(t, a0, b0) * Math.PI)); });
  $('leak').style.opacity = leak * .85; $('leak').style.transform = `translateX(${Math.sin(t * .9) * 60}px) scale(1.2)`;
  let fl = 0; FLASHES.forEach(([a0, d]) => { if (win(t, a0, a0 + d)) fl = Math.max(fl, 1 - prog(t, a0, a0 + d)); });
  TT.forEach(x => { if (win(t, x - .02, x + .07)) fl = Math.max(fl, .3); });
  $('flash').style.opacity = fl;
  grain(frame);
  renderCaps(t);
};
window.TIMES = { S2, LIST_START, TT, S4, S5, S6, S7, END, NOTIF_T, W: words.map(w => w.t + VO) };
window.ready = true;
if (!location.search.includes('render')) { const t0 = performance.now(); (function loop() { seek(((performance.now() - t0) / 1000) % END); requestAnimationFrame(loop); })(); }
