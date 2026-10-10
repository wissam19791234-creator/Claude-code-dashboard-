// SCALIFY — « Le commerçant jongleur » : cartoon 16 s, rendu image par image via seek(t).
// ?v → 1080×1920 (TikTok/Reels), sinon 1920×1080.
const JOURS = 23;               // lancement le 2 novembre
const VERT = location.search.includes('v');
const W = VERT ? 1080 : 1920, H = VERT ? 1920 : 1080, END = 16;
const NS = 'http://www.w3.org/2000/svg';
const $ = id => document.getElementById(id);
const sv = $('sv'); sv.setAttribute('width', W); sv.setAttribute('height', H); sv.setAttribute('viewBox', `0 0 ${W} ${H}`);
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const pr = (t, a, b) => cl((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const oc = k => 1 - Math.pow(1 - k, 3);
const io = k => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const ob = (k, s = 2.2) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
const win = (t, a, b) => t >= a && t < b;
// rebond amorti (0 → 1 avec dépassements)
const spring = k => (k <= 0 ? 0 : k >= 1 ? 1 : 1 - Math.exp(-6 * k) * Math.cos(12 * k));

// ---------------------------------------------------------------- mise en page
const stage = $('stage');
stage.setAttribute('transform', VERT ? 'translate(0 640)' : 'translate(790 20) scale(.98)');
const TX = VERT ? 540 : 430;                    // centre des textes
// rayons du fond
const rays = $('rays'); const RC = { x: VERT ? 540 : 1330, y: VERT ? 1300 : 560 };
for (let i = 0; i < 16; i++) { const a0 = i / 16 * Math.PI * 2, a1 = a0 + Math.PI / 16, R = 3000;
  el('path', { d: `M${RC.x} ${RC.y} L${RC.x + R * Math.cos(a0)} ${RC.y + R * Math.sin(a0)} L${RC.x + R * Math.cos(a1)} ${RC.y + R * Math.sin(a1)} Z`, fill: '#fff', 'fill-opacity': .13 }, rays); }
// store de la boutique
const awn = $('awn'); for (let i = 0; i < 8; i++) el('path', { d: `M${250 + i * 72.5} 430 h72.5 v70 q-36 30 -72.5 0 z`, fill: i % 2 ? '#fff' : '#ff6fb5', class: 'ol', 'stroke-width': 6 }, awn);
// objets
const ITEMS = ['iPhone', 'iLaptop', 'iPin', 'iCam', 'iMail'].map((id, i) => ({ u: el('use', { href: '#' + id }, $('items')), i }));
// clients
const CUST = ['#ff6fb5', '#7cc6fe', '#ffd23f', '#3bceac', '#ff8a3d', '#7b5cff', '#ff5a5f', '#7cc6fe'].map((c, i) => { const u = el('use', { href: '#cust' }, $('queue')); u.style.setProperty('--c', c); return u; });
// effets : étoiles, cœurs, éclat « BOING »
const fx = $('fx');
const burst = el('g', { opacity: 0 }, fx);
{ let d = ''; for (let i = 0; i < 24; i++) { const r = i % 2 ? 120 : 210, a = i / 24 * Math.PI * 2; d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ' ' + (Math.sin(a) * r).toFixed(1); }
  el('path', { d: d + 'Z', fill: '#ffd23f', class: 'ol', 'stroke-width': 10 }, burst);
  const tb = el('text', { 'text-anchor': 'middle', y: 26, class: 't', 'font-size': 86, fill: '#ff5a5f', 'stroke-width': 12 }, burst); tb.textContent = 'BOING!'; }
const sparks = []; for (let i = 0; i < 14; i++) { const s = el('text', { 'text-anchor': 'middle', 'font-size': 60, class: 't', 'stroke-width': 8, fill: ['#ffd23f', '#ff6fb5', '#fff'][i % 3] }, fx); s.textContent = i % 3 === 1 ? '♥' : '★'; sparks.push(s); }
const counter = el('g', { opacity: 0 }, stage);
el('rect', { x: -210, y: -70, width: 420, height: 130, rx: 30, fill: '#fff', class: 'ol' }, counter);
const ctxt = el('text', { 'text-anchor': 'middle', y: 6, class: 't', 'font-size': 46, fill: '#1d1b2e', 'stroke-width': 0 }, counter);
const cnum = el('text', { 'text-anchor': 'middle', y: 50, class: 't', 'font-size': 40, fill: '#3bceac', 'stroke-width': 0 }, counter);

// ---------------------------------------------------------------- textes
const TXT = $('txt');
function T(a, b, lines, { size = 92, fill = '#fff', y = 0, rot = -3, sw = 16, cls = 't' } = {}) {
  const g = el('g', { opacity: 0 }, TXT);
  lines.forEach((s, i) => { const tt = el('text', { y: i * size * 1.05, class: cls, 'font-size': size, fill, 'stroke-width': sw }, g); tt.innerHTML = s; });
  return { g, a, b, y, rot, n: lines.length, size };
}
const V = VERT;
const TEXTS = [
  T(.15, 1.95, V ? ['Site. Google.', 'Insta. Téléphone.', 'Messages…'] : ['Site. Google.', 'Insta.', 'Téléphone.', 'Messages…'], { y: V ? 230 : 330, size: V ? 104 : 96 }),
  T(2.0, 3.95, V ? ['Il fait TOUT', 'tout seul. 😵'] : ['Il fait TOUT', 'tout seul. 😵'], { y: V ? 280 : 400, size: V ? 120 : 110, fill: '#ffd23f' }),
  T(4.0, 4.55, ['AÏE…'], { y: V ? 330 : 520, size: 170, fill: '#ff5a5f', rot: 4 }),
  T(4.95, 7.3, V ? ['Voici Scalify !'] : ['Voici', 'Scalify !'], { y: V ? 300 : 420, size: V ? 128 : 130, fill: '#fff' }),
  T(7.35, 9.05, V ? ['Il gère tout ça.', 'Vous, vous soufflez. ☕'] : ['Il gère tout ça.', 'Vous, vous', 'soufflez. ☕'], { y: V ? 250 : 380, size: V ? 92 : 92, fill: '#fff' }),
  T(9.1, 12.0, V ? ['Moins de boulot.', 'Plus de clients !'] : ['Moins de', 'boulot.', 'Plus de', 'clients !'], { y: V ? 230 : 300, size: V ? 110 : 104, fill: '#ffd23f' }),
  T(12.1, 16.2, ['Lancement dans'], { y: V ? 190 : 200, size: V ? 76 : 70, fill: '#fff', rot: -2 }),
  T(12.35, 16.2, [`J-${JOURS}`], { y: V ? 430 : 470, size: V ? 300 : 260, fill: '#ffd23f', rot: -6, sw: 22 }),
  T(13.0, 16.2, ['15 places fondateurs · -30 %'], { y: V ? 560 : 590, size: V ? 56 : 44, fill: '#fff', rot: -2, sw: 12, cls: 'f' }),
  T(13.6, 16.2, ['Abonnez-vous 🔔'], { y: V ? 1790 : 770, size: V ? 72 : 64, fill: '#7b5cff', rot: 2, sw: 0 }),
];
// fond blanc derrière « Abonnez-vous »
const subBg = el('rect', { rx: 50, fill: '#fff', class: 'ol', opacity: 0 }, TXT); TXT.insertBefore(subBg, TEXTS[9].g);
function showText(o, t) {
  if (!win(t, o.a, o.b)) { o.g.setAttribute('opacity', 0); return; }
  const k = pr(t, o.a, o.a + .45), out = pr(t, o.b - .18, o.b);
  const s = spring(k) * (1 - out * .7);
  const wob = Math.sin(t * 5 + o.a) * 1.4;
  const yc = o.y - (o.n - 1) * o.size * 1.05 / 2;
  o.g.setAttribute('opacity', k > 0 ? 1 - out : 0);
  o.g.setAttribute('transform', `translate(${TX} ${yc}) rotate(${o.rot + wob}) scale(${Math.max(.001, s)})`);
}

// ---------------------------------------------------------------- timeline
const BG = [[0, '#ff8a3d'], [2.0, '#ff5a5f'], [4.6, '#7b5cff'], [7.3, '#3bceac'], [9.05, '#ffb02e'], [12.05, '#ff6fb5']];
const keeper = $('keeper'), armL = $('armL'), armR = $('armR'), head = $('head'), blob = $('blob'), blobB = $('blobB');
window.seek = (t, frame = Math.round(t * 30)) => {
  // fond qui change de couleur à chaque temps fort (coupe franche, façon dessin animé)
  // fond : la nouvelle couleur s'ouvre en cercle depuis le centre (plus de coupe sèche)
  let bi = 0; BG.forEach(([a], i) => { if (t >= a) bi = i; });
  const wk = pr(t, BG[bi][0], BG[bi][0] + .4), DIAG = Math.hypot(W, H);
  $('bg').setAttribute('fill', bi > 0 && wk < 1 ? BG[bi - 1][1] : BG[bi][1]);
  const wp = $('wipe'); wp.setAttribute('cx', RC.x); wp.setAttribute('cy', RC.y); wp.setAttribute('fill', BG[bi][1]);
  wp.setAttribute('r', bi > 0 && wk < 1 ? oc(wk) * DIAG : 0);
  // changement de scène (9,05 s et 12,05 s) : un disque de couleur couvre tout, puis s'efface
  const ir = $('iris'); let irr = 0, iro = 0, irc = '#ffb02e';
  for (const [a, c] of [[9.05, '#ffb02e'], [12.05, '#ff6fb5']]) {
    if (win(t, a - .3, a)) { irr = io(pr(t, a - .3, a)) * DIAG; iro = 1; irc = c; }
    if (win(t, a, a + .25)) { irr = DIAG; iro = 1 - pr(t, a, a + .25); irc = c; }
  }
  ir.setAttribute('cx', W / 2); ir.setAttribute('cy', H / 2); ir.setAttribute('r', irr); ir.setAttribute('opacity', iro); ir.setAttribute('fill', irc);
  $('rays').setAttribute('transform', `rotate(${t * (t < 4 ? 8 + t * 6 : 10)} ${RC.x} ${RC.y})`);
  // ---- commerçant
  const stress = t < 4.6, happy = t >= 5.2;
  let kx = 540, ky = 760, kr = 0, ks = 1;
  if (t < 4.0) { kr = Math.sin(t * (6 + t * 3)) * (1 + t) * .8; }
  if (win(t, 4.0, 4.6)) { kr = -8 * oc(pr(t, 4.0, 4.3)); ky = 760 + 30 * oc(pr(t, 4.0, 4.3)); }
  if (t >= 4.6) { kx = lerp(540, VERT ? 290 : 300, io(pr(t, 4.6, 5.3))); ky = 760; kr = Math.sin(t * 2) * 1.5; }
  const kvis = t < 9.05 || t >= 12.05; keeper.setAttribute('opacity', kvis ? 1 : 0);
  if (t >= 12.05) { kx = VERT ? 290 : 310; ks = spring(pr(t, 12.1, 12.6)) * .9; ky = 790; }
  keeper.setAttribute('transform', `translate(${kx} ${ky}) rotate(${kr}) scale(${Math.max(.001, ks)})`);
  const jug = t < 4.0 ? Math.sin(t * (9 + t * 4)) : 0;
  armL.setAttribute('transform', `translate(-95 40) rotate(${stress ? -10 + jug * 25 : (happy ? -40 : 0)})`);
  armR.setAttribute('transform', `translate(95 40) rotate(${stress ? 10 - jug * 25 : (happy ? 18 : 0)})`);
  $('eyesStress').setAttribute('opacity', happy ? 0 : 1); $('eyesHappy').setAttribute('opacity', happy ? 1 : 0);
  $('mouthS').setAttribute('opacity', happy ? 0 : 1); $('mouthH').setAttribute('opacity', happy ? 1 : 0);
  $('cup').setAttribute('opacity', happy ? 1 : 0); $('cup').setAttribute('transform', `translate(122 ${-83 + Math.sin(t * 3) * 6})`);
  const sw = stress ? 1 : 0; $('sweat').setAttribute('opacity', sw * (t > .8 ? 1 : 0)); $('sweat').setAttribute('transform', `translate(0 ${(t * 120) % 50})`);
  const look = Math.sin(t * 11) * 6; $('pL').setAttribute('cx', -38 + look); $('pR').setAttribute('cx', 38 + look);
  head.setAttribute('transform', `rotate(${stress ? Math.sin(t * 13) * 4 : Math.sin(t * 2) * 3})`);
  // ---- mascotte
  let bx = VERT ? 790 : 800, by = 1010, bsx = 1, bsy = 1, bop = 0;
  if (t >= 4.45 && t < 9.05) {
    bop = 1; const k = pr(t, 4.45, 4.95);
    bx = lerp(1300, VERT ? 790 : 800, oc(k)); by = 1010 - Math.sin(Math.PI * cl(k)) * 380;
    const land = pr(t, 4.95, 5.35); const sq = Math.sin(land * Math.PI * 3) * Math.exp(-land * 3) * .28;
    bsx = 1 + sq; bsy = 1 - sq; if (k < 1) { bsx = .86; bsy = 1.18; }
    if (t > 5.35) { const b = Math.abs(Math.sin((t - 5.35) * 4.2)); by = 1010 - b * 26; bsy = 1 + (b - .5) * .06; bsx = 1 - (b - .5) * .06; }
  }
  if (win(t, 9.05, 12.05)) { const kj = pr(t, 9.45, 9.9); bop = t >= 9.45 ? 1 : 0; bx = lerp(900, 540, oc(kj)); by = lerp(1010, 340, oc(kj)) - Math.sin(Math.PI * kj) * 160 - (kj >= 1 ? Math.abs(Math.sin(t * 4)) * 18 : 0); bsx = bsy = .72; } // saute sur le toit
  if (t >= 12.05) { bop = 1; const k = spring(pr(t, 12.3, 12.9)); bx = VERT ? 790 : 790; by = 1010 - Math.abs(Math.sin(t * 4.5)) * 70; bsx = bsy = Math.max(.001, k * .95); }
  blob.setAttribute('opacity', bop); blob.setAttribute('transform', `translate(${bx} ${by})`);
  blobB.setAttribute('transform', `scale(${bsx} ${bsy})`);
  const wave = Math.sin(t * 8) * 14;
  $('bArmL').setAttribute('transform', t >= 5.35 && t < 9.05 ? `rotate(${Math.sin(t * 7) * 18} -120 -120)` : `rotate(${wave} -120 -120)`);
  $('bArmR').setAttribute('transform', t >= 5.35 && t < 9.05 ? `rotate(${-Math.sin(t * 7) * 18} 120 -120)` : `rotate(${-wave - 20} 120 -120)`);
  const bl = Math.sin(t * 2.2) * 8; $('bpL').setAttribute('cx', -38 + bl); $('bpR').setAttribute('cx', 50 + bl);
  // ---- objets jonglés
  ITEMS.forEach(({ u, i }) => {
    const appear = .2 + i * .4; let x, y, s = 1, r = 0, op = t >= appear ? 1 : 0;
    const sp = 2.2 + Math.min(t, 4) * .9, th = sp * Math.min(t, 4) + i * 2 * Math.PI / 5;
    const cx = kx, cyy = 290;
    x = cx + 230 * Math.cos(th); y = cyy + 170 * Math.sin(th); r = th * 40; s = spring(pr(t, appear, appear + .4));
    if (t >= 4.0 && t < 4.95) { // ça tombe…
      const ft = t - 4.0; x += (i - 2) * 60 * ft; y += 900 * ft * ft; r += ft * 400;
    }
    if (t >= 4.5 && t < 4.95) { // … rattrapé par Scalify
      const k = io(pr(t, 4.55, 4.95)); x = lerp(x, bx, k); y = lerp(y, by - 300, k); s = lerp(1, .5, k);
    }
    if (t >= 4.95 && t < 9.05) { // Scalify jongle, tranquille
      const th2 = (t - 4.95) * 2.4 + i * 2 * Math.PI / 5;
      x = bx + 200 * Math.cos(th2); y = (by - 470) + 110 * Math.sin(th2); s = lerp(.5, .85, oc(pr(t, 4.95, 5.4))); r = Math.sin(th2) * 15;
    }
    if (t >= 9.05) op = 0;
    u.setAttribute('opacity', op); u.setAttribute('transform', `translate(${x} ${y}) rotate(${r}) scale(${Math.max(.001, s)})`);
  });
  // ---- éclat BOING
  const kb = pr(t, 4.92, 5.6); burst.setAttribute('opacity', win(t, 4.92, 5.6) ? 1 - pr(t, 5.4, 5.6) : 0);
  burst.setAttribute('transform', `translate(${(VERT ? 790 : 800) + 40} 560) rotate(${-8 + kb * 10}) scale(${spring(kb) * .9})`);
  // ---- boutique et clients
  const shopOn = win(t, 9.05, 12.05); $('shop').setAttribute('opacity', shopOn ? 1 : 0);
  $('shop').setAttribute('transform', `translate(540 1010) scale(${shopOn ? spring(pr(t, 9.05, 9.5)) : 1}) translate(-540 -1010)`);
  let entered = 0;
  CUST.forEach((u, i) => {
    const a = 9.35 + i * .3, k = pr(t, a, a + 1.0); const vis = shopOn && t >= a && k < 1;
    if (shopOn && k >= 1) entered++;
    const x = lerp(1250, 680, k), y = 1010 - Math.abs(Math.sin(k * Math.PI * 4)) * 50;
    u.setAttribute('opacity', vis ? 1 : 0); u.setAttribute('transform', `translate(${x} ${y}) scale(${k > .85 ? 1 - (k - .85) / .15 : 1})`);
  });
  counter.setAttribute('opacity', shopOn ? 1 : 0);
  counter.setAttribute('transform', `translate(540 ${VERT ? 160 : 160}) rotate(-3) scale(${spring(pr(t, 9.3, 9.7))})`);
  ctxt.textContent = 'Clients du jour'; cnum.textContent = `${12 + entered * 5} 🎉`;
  // ---- étincelles
  sparks.forEach((s, i) => {
    const bursts = [5.0, 9.1, 12.4]; let b = -1; for (const a of bursts) if (t >= a && t < a + 1.2) b = a;
    if (b < 0) { s.setAttribute('opacity', 0); return; }
    const k = pr(t, b, b + 1.2), ang = i / sparks.length * Math.PI * 2 + b, d = 120 + 380 * oc(k);
    const ox = b === 5.0 ? (VERT ? 790 : 800) : 540, oy = b === 5.0 ? 700 : (b === 9.1 ? 600 : 650);
    s.setAttribute('opacity', 1 - k); s.setAttribute('transform', `translate(${ox + Math.cos(ang) * d} ${oy + Math.sin(ang) * d + 300 * k * k}) rotate(${k * 200}) scale(${1 - k * .4})`);
  });
  // ---- textes
  TEXTS.forEach(o => showText(o, t));
  const sb = TEXTS[9]; const k9 = pr(t, sb.a, sb.a + .45);
  subBg.setAttribute('opacity', win(t, sb.a, sb.b) && k9 > 0 ? 1 : 0);
  if (win(t, sb.a, sb.b)) { const bb = sb.g.getBBox(); subBg.setAttribute('x', bb.x - 40); subBg.setAttribute('y', bb.y - 18); subBg.setAttribute('width', bb.width + 80); subBg.setAttribute('height', bb.height + 36); subBg.setAttribute('transform', sb.g.getAttribute('transform')); }
  // ---- flash
  let fl = 0; for (const [a, s] of []) if (win(t, a, a + .15)) fl = Math.max(fl, s * (1 - pr(t, a, a + .15)));
  $('flash').setAttribute('opacity', fl + pr(t, 15.6, 16) );
  $('flash').setAttribute('fill', t > 15 ? '#1d1b2e' : '#fff');
};
document.fonts.ready.then(async () => {
  await Promise.all(['40px Lil', '600 40px Fre'].map(f => document.fonts.load(f)));
  window.ready = true;
  if (!location.search.includes('render')) { const t0 = performance.now(); (function loop() { seek(((performance.now() - t0) / 1000) % END); requestAnimationFrame(loop); })(); }
});
