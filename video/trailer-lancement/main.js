// SCALIFY — trailer de lancement. Rendu déterministe image par image via seek(t).
// ?v → composition verticale 1080×1920 (même timeline, cadrages recentrés).
const VERT = location.search.includes('v');
const W = VERT ? 1080 : 1920, H = VERT ? 1920 : 1080, END = 40;
document.documentElement.style.setProperty('--W', W + 'px');
document.documentElement.style.setProperty('--H', H + 'px');
if (VERT) { document.documentElement.style.setProperty('--u', '1.15px'); document.addEventListener('DOMContentLoaded', () => { $('cop').style.width = '1010px'; $('cop').style.fontSize = '25px'; document.querySelectorAll('.toast').forEach(e => (e.style.bottom = '20%')); $('hl').style.top = '9%'; }); }
const $ = id => document.getElementById(id);
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const pr = (t, a, b) => cl((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const io = k => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const oe = k => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));
const oc = k => 1 - Math.pow(1 - k, 3);
const ic = k => k * k * k;
const win = (t, a, b) => t >= a && t < b;
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const fr = n => n.toLocaleString('fr-FR').replace(/ | /g, ' ');
const vis = (el, op, tf, blur) => { el.style.opacity = op; if (tf !== undefined) el.style.transform = tf; if (blur !== undefined) el.style.filter = blur > .05 ? `blur(${blur}px)` : 'none'; };

// ---------------------------------------------------------------- fragments de données (scène 1–2)
const cv = $('cv'); cv.width = W; cv.height = H; const cx = cv.getContext('2d');
const WORDS = ['12 nouveaux messages', 'Objectif non atteint', 'Rapport en retard', 'Stock bas', '3 avis non lus', 'Facture impayée', 'Réunion 14:00',
  'Taux de conversion ↓', 'Relance client', 'Budget dépassé', 'Campagne en pause', 'Export terminé', '27 tâches', 'Nouveau devis', 'Alerte trafic', 'Panier abandonné'];
const NUMS = ['+3,2 %', '48 260 €', '−12 %', '1 284', 'ROI 4,1', 'CTR 2,8 %', '0,74', '−4,9 %', '312 €', '17:42', '+0,8 pt', '9 412', '63 %', 'Q3', '2 140 €', '−1,2 %', '88/100', '4,6 ★'];
function frag(type) {
  const c = document.createElement('canvas'), g = c.getContext('2d'); let w = 200, h = 60;
  const bright = rnd() < .55, col = bright ? '#f4f3ef' : '#b4b5b9';
  if (type === 'num') { const s = NUMS[Math.floor(rnd() * NUMS.length)]; g.font = '500 30px JM'; w = g.measureText(s).width + 8; h = 40; c.width = w; c.height = h; g.font = '500 30px JM'; g.fillStyle = col; g.fillText(s, 4, 30); }
  else if (type === 'note') { const s = WORDS[Math.floor(rnd() * WORDS.length)]; g.font = '400 22px IT'; w = g.measureText(s).width + 62; h = 50; c.width = w; c.height = h;
    g.fillStyle = '#16171bcc'; g.strokeStyle = '#ffffff22'; g.lineWidth = 1.5; g.beginPath(); g.roundRect(1, 1, w - 2, h - 2, 14); g.fill(); g.stroke();
    g.fillStyle = rnd() < .3 ? '#e79b8f' : '#e7c58a'; g.beginPath(); g.arc(24, 25, 5, 0, 7); g.fill(); g.font = '400 22px IT'; g.fillStyle = col; g.fillText(s, 40, 32); }
  else if (type === 'spark') { w = 220; h = 70; c.width = w; c.height = h; g.strokeStyle = col; g.lineWidth = 2.5; g.beginPath(); let y = 35;
    for (let x = 0; x <= w; x += 11) { y = cl(y + (rnd() - .5) * 26, 6, 64); x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  else if (type === 'bars') { w = 160; h = 90; c.width = w; c.height = h; g.fillStyle = col; for (let i = 0; i < 8; i++) { const bh = 10 + rnd() * 76; g.fillRect(i * 20, h - bh, 13, bh); } }
  else if (type === 'table') { w = 260; h = 130; c.width = w; c.height = h; g.font = '400 17px JM'; g.fillStyle = col;
    for (let r = 0; r < 5; r++) for (let k = 0; k < 3; k++) g.fillText(String(Math.floor(rnd() * 99999)).padStart(5, ' '), 4 + k * 86, 22 + r * 25);
    g.fillStyle = '#ffffff18'; for (let r = 0; r < 5; r++) g.fillRect(0, 28 + r * 25, w, 1); }
  else { w = 110; h = 110; c.width = w; c.height = h; let a = -1.57; g.lineWidth = 12;
    for (const p of [.45, .25, .18, .12]) { g.strokeStyle = p === .45 ? col : '#ffffff' + ['30', '20', '14'][Math.floor(rnd() * 3)]; g.beginPath(); g.arc(55, 55, 42, a, a + p * 6.28 - .06); g.stroke(); a += p * 6.28; } }
  // trois niveaux de flou précalculés (profondeur de champ)
  const lv = [0, 3, 8].map(b => { const o = document.createElement('canvas'); o.width = w + 40; o.height = h + 40; const q = o.getContext('2d'); q.filter = b ? `blur(${b}px)` : 'none'; q.drawImage(c, 20, 20); return o; });
  return { lv, w, h };
}
let FR = [];
function buildFrags() {
  seed = 11; const T = ['num', 'num', 'note', 'note', 'spark', 'bars', 'table', 'pie'];
  for (let i = 0; i < 340; i++) {
    const u = rnd();
    FR.push({ img: frag(T[Math.floor(rnd() * T.length)]), ts: .25 + 4.6 * Math.pow(u, 1 / 2.4),
      x: (rnd() * 2 - 1) * (VERT ? .75 : 1.35), y: (rnd() * 2 - 1) * (VERT ? 1.35 : .8), z: .55 + rnd() * 2.6, vx: (rnd() - .5) * .04, vy: (rnd() - .5) * .03, s: .55 + rnd() * .7 });
  }
}
const F = Math.min(W, H) * .62; // focale
function project(f, t) {
  const camZ = .32 * Math.pow(t / 5, 2);
  const z = f.z - camZ; if (z < .22) return null;
  const sc = F / z * f.s / 700;
  return { x: W / 2 + (f.x + f.vx * t) * F / z, y: H / 2 + (f.y + f.vy * t) * F / z, sc, z };
}
function drawFrags(t, mode) {
  cx.clearRect(0, 0, W, H);
  const tf = Math.min(t, 4.95);
  for (const f of FR) {
    if (tf < f.ts) continue;
    const p = project(f, tf); if (!p) continue;
    const dz = Math.abs(p.z - 1.15); const L = dz < .35 ? 0 : dz < .9 ? 1 : 2;
    let a = cl((tf - f.ts) / .3) * (L === 2 ? .7 : 1) * cl(1.7 - p.z * .3, .4, 1);
    let x = p.x, y = p.y, sc = p.sc;
    if (mode === 'pulse') { // impulsion lumineuse, puis attraction vers le centre
      const band = lerp(-.15 * W, 1.15 * W, oc(pr(t, 5.35, 5.8)));
      const lit = Math.exp(-Math.pow((x - band) / (W * .06), 2));
      a = a * .28 + lit * .7 + (t > 5.8 ? .25 : 0) * (x < band ? 1 : 0);
      const k = ic(pr(t, 5.75, 6.6));
      const ang = k * .9, dx = x - W / 2, dy = y - H / 2;
      const r = 1 - k;
      for (let g = 2; g >= 0; g--) { // traînées de mouvement
        const kk = Math.max(0, k - g * .045), rr = 1 - kk, an = kk * .9;
        const gx = W / 2 + (dx * Math.cos(an) - dy * Math.sin(an)) * rr, gy = H / 2 + (dx * Math.sin(an) + dy * Math.cos(an)) * rr;
        cx.globalAlpha = cl(a) * (g ? .18 : 1) * (1 - pr(t, 6.45, 6.62));
        const s2 = sc * (1 - kk * .85), im = f.img.lv[Math.min(2, L + (k > .3 ? 1 : 0))];
        cx.drawImage(im, gx - im.width * s2 / 2, gy - im.height * s2 / 2, im.width * s2, im.height * s2);
      }
      continue;
    }
    cx.globalAlpha = cl(a); const im = f.img.lv[L];
    cx.drawImage(im, x - im.width * sc / 2, y - im.height * sc / 2, im.width * sc, im.height * sc);
  }
  cx.globalAlpha = 1;
  // zone calme derrière les titres « Trop de données. / Pas assez de clarté. »
  const dk = pr(t, 2.1, 2.5) * (1 - pr(t, 4.95, 5));
  if (mode === 'chaos' && dk > 0) { const g = cx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.min(W, H) * .42);
    g.addColorStop(0, `rgba(4,4,5,${.92 * dk})`); g.addColorStop(.55, `rgba(4,4,5,${.6 * dk})`); g.addColorStop(1, 'rgba(4,4,5,0)'); cx.fillStyle = g; cx.fillRect(0, 0, W, H); }
  if (mode === 'pulse') {
    const band = lerp(-.15 * W, 1.15 * W, oc(pr(t, 5.35, 5.8)));
    if (t < 5.85) { const g = cx.createLinearGradient(band - 80, 0, band + 80, 0); g.addColorStop(0, '#fff0'); g.addColorStop(.5, '#ffffff38'); g.addColorStop(1, '#fff0'); cx.fillStyle = g; cx.fillRect(band - 80, 0, 160, H); }
    const fk = pr(t, 6.55, 7.2); if (fk > 0 && fk < 1) { // point de convergence
      const r = lerp(4, Math.min(W, H) * .35, oe(fk)), g = cx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, r);
      g.addColorStop(0, `rgba(255,250,240,${.9 * (1 - fk)})`); g.addColorStop(.25, `rgba(231,197,138,${.25 * (1 - fk)})`); g.addColorStop(1, 'rgba(0,0,0,0)'); cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    }
  }
}

// ---------------------------------------------------------------- dashboard
const dash = $('dash'), cam = $('cam');
const DS = VERT ? 1.3 : 1.12;
cam.style.top = VERT ? '55%' : '58%';
const KEYS = [ // t, x, y, échelle, rotX, rotY
  [9.0, 470, 215, 2.0, 26, -14], [10.5, 1020, 215, 1.85, 20, -8], [12.0, 1560, 240, 1.7, 15, -2],
  [13.5, 1250, 520, 1.3, 10, 4], [15.0, 900, 800, 1.15, 8, 3], [16.5, 1300, 900, 1.0, 6, -2], [18.2, 1070, 640, .74, 4, 0]];
function camAt(t) {
  t = cl(t, KEYS[0][0], KEYS[KEYS.length - 1][0]);
  let i = 0; while (i < KEYS.length - 2 && t > KEYS[i + 1][0]) i++;
  const k = (t - KEYS[i][0]) / (KEYS[i + 1][0] - KEYS[i][0]);
  const P = j => KEYS[cl(j, 0, KEYS.length - 1)];
  const cr = (a, b, c, d, u) => .5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
  return [1, 2, 3, 4, 5].map(n => cr(P(i - 1)[n], P(i)[n], P(i + 1)[n], P(i + 2)[n], k));
}
const CARDS = [...dash.querySelectorAll('.card')].map(el => ({ el, x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight / 2 }));
// données de démonstration (déterministes)
seed = 3; const D1 = [], D2 = []; let v = 1200, v2 = 1180;
for (let i = 0; i < 30; i++) { v += (rnd() - .35) * 150 + i * 5; v2 += (rnd() - .5) * 110; D1.push(v); D2.push(v2); }
const mx = Math.max(...D1, ...D2) * 1.08, mn = Math.min(...D1, ...D2) * .9;
const PX = i => i / 29 * 1175, PY = y => 290 - (y - mn) / (mx - mn) * 270;
$('grid').innerHTML = [0, 1, 2, 3, 4].map(i => `<line x1="0" x2="1175" y1="${20 + i * 67}" y2="${20 + i * 67}" stroke="#0000000d"/>`).join('');
$('l2').setAttribute('d', D2.map((y, i) => (i ? 'L' : 'M') + PX(i) + ' ' + PY(y)).join(''));
seed = 20; let yy = 34; const SP1 = Array.from({ length: 24 }, (_, i) => (yy = cl(yy - .9 + (rnd() - .5) * 9, 3, 41)));
function partial(pts, k, X, Y) { const n = Math.max(2, Math.floor(1 + k * (pts.length - 1))); return pts.slice(0, n).map((y, i) => (i ? 'L' : 'M') + X(i) + ' ' + Y(y)).join(''); }
const pop = (el, t, a, d = .45, dy = 14) => { const k = oc(pr(t, a, a + d)); el.style.opacity = k; el.style.transform = `translateY(${(1 - k) * dy}px) scale(${lerp(.96, 1, k)})`; };

function drawDash(t) {
  const [px, py, s0, rx, ry] = camAt(t), s = s0 * DS;
  dash.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(${s}) translate(${-px}px,${-py}px)`;
  const cop = pr(t, 17.8, 18.5);
  for (const c of CARDS) {
    const d = Math.hypot((c.x - px) * s / W, (c.y - py) * s / H * (VERT ? .6 : 1));
    c.el.style.filter = `blur(${(cl((d - .3) / .4) * 3.5 + cop * 8).toFixed(2)}px)`;
  }
  // fiche Google
  $('vViews').textContent = fr(Math.round(1240 * oc(pr(t, 9.3, 11)))) ;
  $('sp1').setAttribute('d', partial(SP1, oc(pr(t, 9.4, 11.2)), j => j / 23 * 340, y => y));
  // note Google
  $('vNote').textContent = (4.8 * oc(pr(t, 9.6, 11.0))).toFixed(1).replace('.', ',');
  $('stars').style.backgroundImage = ''; $('stars').style.opacity = .25 + .75 * pr(t, 9.7, 11.0);
  // réservations IA
  $('vRes').textContent = Math.round(12 * oc(pr(t, 11.3, 12.6)));
  // chiffre d'affaires
  const kl = io(pr(t, 12.6, 14.8)); const live = D1.map((y, i) => i === 29 ? y + Math.sin(t * 3) * 25 * (t > 14.8) : y);
  const l1 = partial(live, kl, PX, PY); $('l1').setAttribute('d', l1);
  const n = Math.max(2, Math.floor(1 + kl * 29)); $('area').setAttribute('d', l1 + `L${PX(n - 1)} 300L0 300Z`);
  $('pt').setAttribute('cx', PX(n - 1)); $('pt').setAttribute('cy', PY(live[n - 1]));
  $('l2').style.opacity = pr(t, 12.2, 12.8);
  $('vGro').textContent = '+' + (18.4 * oc(pr(t, 12.8, 14.8))).toFixed(1).replace('.', ',') + ' %';
  // avis : la réponse automatique apparaît
  [0, 1, 2].forEach(i => pop($('ok' + i), t, 13.3 + i * .45, .35, 8));
  // site, posts, assistant
  $('vVis').textContent = fr(Math.round(2300 * oc(pr(t, 14.6, 16.2))));
  dash.querySelectorAll('.pg i').forEach((e, i) => pop(e, t, 14.9 + i * .25, .4, 20));
  $('vPosts').textContent = Math.round(3 * pr(t, 14.9, 15.6));
  ['b0', 'b1', 'b2'].forEach((id, i) => pop($(id), t, 15.2 + i * .6, .4, 12));
}

// ---------------------------------------------------------------- grain
const gr = $('grain'), gx = gr.getContext('2d'), gimg = gx.createImageData(480, 270);
function grain(frame, amt) {
  seed = 1000 + frame; const d = gimg.data;
  for (let i = 0; i < d.length; i += 4) { const v = rnd() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
  gx.putImageData(gimg, 0, 0); gr.style.opacity = amt; gr.style.mixBlendMode = 'overlay';
}

// ---------------------------------------------------------------- timeline
const mp = $('mp'); let ML = 60;
function title(el, t, a, b, { up = 10, bl = 10 } = {}) {
  if (!win(t, a, b)) { el.style.opacity = 0; return; }
  const k = oc(pr(t, a, a + .55)), o = pr(t, b - .35, b);
  vis(el, k * (1 - o), (el.classList.contains('t1') ? 'translateY(-50%) ' : '') + `translateY(${(1 - k) * up}px)`, (1 - k) * bl + o * 6);
}
function toast(el, t, a, b) {
  if (!win(t, a, b)) { el.style.opacity = 0; return; }
  const k = oe(pr(t, a, a + .45)), o = pr(t, b - .3, b);
  vis(el, k * (1 - o), `translateX(-50%) translateY(${(1 - k) * -24 - o * 10}px) scale(${lerp(.96, 1, k)})`);
}
window.seek = (t, frame = Math.round(t * 30)) => {
  // scènes 1–2 : fragments
  if (t < 5.0) drawFrags(t, 'chaos');
  else if (t < 5.35) cx.clearRect(0, 0, W, H);
  else if (t < 7.3) drawFrags(t, 'pulse');
  else cx.clearRect(0, 0, W, H);
  title($('x1'), t, 2.3, 3.75, { up: 0, bl: 14 });
  title($('x2'), t, 3.8, 5.0, { up: 0, bl: 14 });
  // logo
  const L = $('logo'), word = $('word'), voici = $('voici'), tag = $('tag');
  let lop = 0, lsc = 1, lbl = 0;
  mp.style.strokeDasharray = ML; mp.style.strokeDashoffset = ML * (1 - io(pr(t, 6.7, 7.7)));
  if (win(t, 6.65, 9.1)) { lop = 1 - pr(t, 8.75, 9.1); lsc = lerp(1, 1.05, pr(t, 8.6, 9.1)); lbl = pr(t, 8.75, 9.1) * 8; }
  const kw = oc(pr(t, 7.3, 8.2)); word.style.opacity = kw; word.style.letterSpacing = word.style.paddingLeft = lerp(.9, .42, kw) + 'em'; word.style.filter = `blur(${(1 - kw) * 10}px)`;
  voici.style.opacity = oc(pr(t, 8.0, 8.5)) * (t < 9.2); tag.style.opacity = 0;
  if (win(t, 23.5, 28.05)) { // logo seul, voix off
    lop = oc(pr(t, 23.6, 24.6)) * (1 - pr(t, 27.85, 28.05)); lsc = lerp(.82, .86, pr(t, 23.6, 28)); mp.style.strokeDashoffset = 0; word.style.opacity = 1; word.style.filter = 'none'; word.style.letterSpacing = word.style.paddingLeft = '.42em'; voici.style.opacity = 0;
  }
  if (win(t, 28.3, 31.9)) { // révélation
    const k = oe(pr(t, 28.3, 28.9)); lop = k * (1 - pr(t, 31.4, 31.9)); lsc = lerp(1.32, 1.12, io(pr(t, 28.3, 31.6))); lbl = (1 - k) * 16;
    mp.style.strokeDashoffset = 0; word.style.opacity = 1; word.style.filter = 'none'; word.style.letterSpacing = word.style.paddingLeft = '.42em'; voici.style.opacity = 0;
    tag.style.opacity = oc(pr(t, 29.3, 30.1)); voici.style.display = 'none';
  } else voici.style.display = '';
  vis(L, lop, `translate(-50%,-50%) scale(${lsc})`, lbl);
  $('sweep').style.opacity = win(t, 7.9, 8.8) || win(t, 28.6, 29.6) ? 1 : 0;
  $('sweep').style.transform = `translateX(${lerp(-60, 60, t < 20 ? pr(t, 7.9, 8.8) : pr(t, 28.6, 29.6))}%)`;
  $('light').style.opacity = Math.max(pr(t, 7, 8) * (1 - pr(t, 8.6, 9.1)), pr(t, 28.3, 28.8) * (1 - pr(t, 31.3, 31.9)) * 1.2, pr(t, 33.4, 33.9) * (1 - pr(t, 35.5, 36.1)));
  // dashboard
  const dOp = pr(t, 8.9, 9.6) * (1 - pr(t, 22.9, 23.7));
  cam.style.opacity = dOp * (t >= 18 ? lerp(1, .45, pr(t, 17.8, 18.5)) : 1);
  if (dOp > 0) drawDash(t);
  toast($('t1'), t, 13.0, 14.7); toast($('t2'), t, 15.4, 16.9); toast($('t3'), t, 16.95, 17.95);
  // copilote
  const C = $('cop');
  if (win(t, 17.9, 23.4)) {
    const k = oe(pr(t, 17.9, 18.6)), o = pr(t, 22.9, 23.4);
    vis(C, k * (1 - o), `translate(-50%,${VERT ? -50 : -43}%) perspective(1600px) rotateX(${lerp(14, 0, k)}deg) scale(${lerp(.94, 1, k) * lerp(1, VERT ? 1.0 : 1.06, pr(t, 18.5, 23)) * (VERT ? .98 : 1.06)})`, o * 8);
    const Q = 'Que se passe-t-il dans ma boutique ?';
    $('qt').textContent = Q.slice(0, Math.floor(Q.length * pr(t, 18.55, 19.65)));
    $('car').style.opacity = t < 19.9 && Math.floor(t * 2.4) % 2 === 0 ? 1 : 0;
    const sc = $('scan'); sc.style.opacity = win(t, 19.75, 20.35) ? 1 : 0; sc.style.backgroundPosition = `${lerp(-60, 160, pr(t, 19.75, 20.35))}% 0`;
    ['r1', 'r2', 'r3'].forEach((id, i) => { const kk = oc(pr(t, 20.3 + i * .42, 20.75 + i * .42)); vis($(id), kk, `translateY(${(1 - kk) * 14}px)`); $(id).style.maxHeight = kk * 90 + 'px'; $(id).style.paddingTop = $(id).style.paddingBottom = kk * 14 + 'px'; });
    const kr = oc(pr(t, 21.6, 22.1)); vis($('rec'), kr, `translateY(${(1 - kr) * 14}px)`); $('rec').style.maxHeight = kr * 260 + 'px';
    $('scan').style.marginBottom = (oc(pr(t, 20.3, 20.75)) * 6) + 'px';
    $('rec').querySelector('.b').style.opacity = oc(pr(t, 21.95, 22.4));
  } else C.style.opacity = 0;
  // voix off sous-titrée
  title($('v1'), t, 24.15, 26.05, { up: 6, bl: 6 }); title($('v2'), t, 26.45, 28.0, { up: 6, bl: 6 });
  // lancement
  const Lc = $('launch');
  if (win(t, 32.1, 36.2)) {
    Lc.style.opacity = 1 - pr(t, 35.8, 36.2);
    const kt = io(pr(t, 32.2, 33.2)); vis($('lt'), kt, undefined, (1 - kt) * 8); $('lt').style.letterSpacing = $('lt').style.paddingLeft = lerp(.8, .5, kt) + 'em';
    const kn = oe(pr(t, 33.4, 33.75)); vis($('num'), kn > 0 ? 1 : 0, `scale(${lerp(1.1, 1, kn) * lerp(1, 1.03, pr(t, 33.4, 36))})`, (1 - kn) * 24);
    const kj = oc(pr(t, 33.65, 34.1)); vis($('jrs'), kj, undefined, (1 - kj) * 8);
    const kp = oc(pr(t, 34.6, 35.2)); vis($('prep'), kp, `translateY(${(1 - kp) * 8}px)`);
  } else Lc.style.opacity = 0;
  // final
  const Fn = $('fin');
  if (t >= 36.3) {
    Fn.style.opacity = 1 - pr(t, 39.2, 39.9);
    const st = (el, a) => { const k = oc(pr(t, a, a + .7)); vis(el, k, `translateY(${(1 - k) * 8}px)`, (1 - k) * 6); };
    st(Fn.querySelector('svg'), 36.4); st(Fn.querySelector('.a'), 36.9); st(Fn.querySelector('.b'), 37.8);
  } else Fn.style.opacity = 0;
  // lumière : le chaos est sombre, la clarté est lumineuse
  const Lg = pr(t, 6.6, 6.7) * (1 - pr(t, 22.9, 23.6));
  $('lightbg').style.opacity = Lg; $('vig').style.opacity = 1 - .75 * Lg;
  const cc = Math.round(lerp(244, 18, Lg)); L.style.color = `rgb(${cc},${cc - 1},${cc - 3})`;
  $('light').style.opacity = parseFloat($('light').style.opacity || 0) * (1 - Lg);
  // titres explicatifs
  const HL = [[9.3, 12.45, 'Votre site, votre fiche Google, vos avis.<br>Un seul écran.'], [12.5, 15.0, 'Scalify répond à vos avis. Automatiquement.'], [15.05, 17.95, 'Et à vos clients. Même la nuit.'], [18.05, 22.85, 'Une question ? Scalify vous dit quoi faire.']];
  const hc = HL.find(([a, b]) => win(t, a, b)), hl = $('hl');
  if (hc) { if (hl.dataset.k != hc[0]) { hl.innerHTML = hc[2]; hl.dataset.k = hc[0]; } const k = oc(pr(t, hc[0], hc[0] + .5)), o = pr(t, hc[1] - .3, hc[1]); vis(hl, k * (1 - o), `translateY(${(1 - k) * 16}px)`, (1 - k) * 8); } else hl.style.opacity = 0;
  $('hlbg').style.opacity = pr(t, 9.1, 9.5) * (1 - pr(t, 22.7, 23.1));
  grain(frame, .07 * (1 - .7 * Lg));
};
document.fonts.ready.then(async () => {
  await Promise.all(['300 20px IT', '400 20px IT', '500 20px IT', '400 20px JM', '500 20px JM'].map(f => document.fonts.load(f)));
  ML = mp.getTotalLength() + 1; buildFrags(); window.ready = true;
  if (!location.search.includes('render')) { const t0 = performance.now(); (function loop() { seek(((performance.now() - t0) / 1000) % END); requestAnimationFrame(loop); })(); }
});
