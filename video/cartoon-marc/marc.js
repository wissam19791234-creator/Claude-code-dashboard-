// SCALIFY — « Marc, le boulanger débordé » : cartoon raconté (voix off + sous-titres), rendu image par image via seek(t).
// ?v → 1080×1920 (TikTok/Reels), sinon 1920×1080. La timeline vient de timeline.json (calée sur la voix).
const JOURS = 23;               // lancement le 2 novembre
const VERT = location.search.includes('v');
const W = VERT ? 1080 : 1920, H = VERT ? 1920 : 1080;
const NS = 'http://www.w3.org/2000/svg';
const $ = id => document.getElementById(id);
const sv = $('sv'); sv.setAttribute('width', W); sv.setAttribute('height', H); sv.setAttribute('viewBox', `0 0 ${W} ${H}`);
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const pr = (t, a, b) => cl((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const oc = k => 1 - Math.pow(1 - k, 3);
const io = k => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const win = (t, a, b) => t >= a && t < b;
const spring = k => (k <= 0 ? 0 : k >= 1 ? 1 : 1 - Math.exp(-6 * k) * Math.cos(12 * k));
const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
const A = (e, k, v) => e.setAttribute(k, v);

// ---------------------------------------------------------------- mise en page
const STAGE = VERT ? { x: 0, y: 640, s: 1 } : { x: 860, y: 40, s: .9 };
A($('stage'), 'transform', `translate(${STAGE.x} ${STAGE.y}) scale(${STAGE.s})`);
const toScreen = (x, y) => [STAGE.x + x * STAGE.s, STAGE.y + y * STAGE.s];
const CAP = VERT ? { x: 540, y: 470, max: 1000, size: 104 } : { x: 440, y: 560, max: 820, size: 110 };
// rayures du comptoir
for (let i = 0; i < 11; i++) el('rect', { x: 100 + i * 80, y: 782, width: 40, height: 308, fill: '#ff6fb5', opacity: .85 }, $('stripes'));
// rayons (carton final)
const RC = VERT ? [540, 820] : [700, 560];
for (let i = 0; i < 16; i++) { const a0 = i / 16 * Math.PI * 2, a1 = a0 + Math.PI / 16, R = 3000;
  el('path', { d: `M${RC[0]} ${RC[1]} L${RC[0] + R * Math.cos(a0)} ${RC[1] + R * Math.sin(a0)} L${RC[0] + R * Math.cos(a1)} ${RC[1] + R * Math.sin(a1)} Z`, fill: '#fff', 'fill-opacity': .15 }, $('rayG')); }
// objets avec leur étiquette
const NAMES = [['iLaptop', 'SITE'], ['iPin', 'GOOGLE'], ['iStar', 'AVIS'], ['iCam', 'INSTA'], ['iPhone', 'MESSAGES']];
const ITEMS = NAMES.map(([id, name]) => {
  const g = el('g', { opacity: 0, filter: 'url(#sh)' }, $('items'));
  el('use', { href: '#' + id }, g);
  const lab = el('g', { transform: 'translate(0 96)' }, g);
  const tx = el('text', { 'text-anchor': 'middle', y: 14, class: 't', 'font-size': 38, fill: '#fff', 'stroke-width': 0 }, lab); tx.textContent = name;
  const w = name.length * 24 + 40; lab.insertBefore(el('rect', { x: -w / 2, y: -26, width: w, height: 54, rx: 27, fill: '#1d1b2e' }), tx);
  const ck = el('use', { href: '#check', opacity: 0 }, g);
  return { g, ck };
});
// clients
const CUST = [['#ff6fb5', '#ffcb9a'], ['#7cc6fe', '#c98b5e'], ['#ffd23f', '#ffcb9a'], ['#3bceac', '#8d5a3b'], ['#ff8a3d', '#ffdcb8']].map(([c, s]) => {
  const u = el('use', { href: '#cust', opacity: 0 }, $('queue')); u.style.setProperty('--c', c); u.style.setProperty('--s', s); return u; });
const hearts = CUST.map(() => { const h = el('text', { 'text-anchor': 'middle', class: 't', 'font-size': 64, fill: '#ff5a5f', 'stroke-width': 8, opacity: 0 }, $('fx')); h.textContent = '♥'; return h; });
// éclat « OUPS ! »
const burst = el('g', { opacity: 0 }, $('fx'));
{ let d = ''; for (let i = 0; i < 24; i++) { const r = i % 2 ? 120 : 200, a = i / 24 * Math.PI * 2; d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ' ' + (Math.sin(a) * r).toFixed(1); }
  el('path', { d: d + 'Z', fill: '#ffd23f', class: 'ol', 'stroke-width': 10 }, burst);
  const tb = el('text', { 'text-anchor': 'middle', y: 28, class: 't', 'font-size': 92, fill: '#ff5a5f', 'stroke-width': 12 }, burst); tb.textContent = 'OUPS !'; }
const puffs = []; for (let i = 0; i < 6; i++) puffs.push(el('circle', { r: 30, fill: '#fff', class: 'ol', 'stroke-width': 6, opacity: 0 }, $('fx')));

// ---------------------------------------------------------------- carton final
const FIN = $('final');
const FP = VERT ? { logo: [540, 260], lt: [540, 520], j: [540, 760], badge: [800, 1040], sub: [540, 1240] }
                : { logo: [700, 150], lt: [700, 330], j: [700, 560], badge: [1180, 330], sub: [700, 830] };
function sticker(parent, x, y) { return el('g', { transform: `translate(${x} ${y})`, opacity: 0 }, parent); }
const fLogo = sticker(FIN, ...FP.logo);
el('use', { href: '#sPath', transform: 'translate(-215 -46) scale(3.2)', fill: 'none', stroke: '#1d1b2e', 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, fLogo);
el('use', { href: '#sPath', transform: 'translate(-215 -46) scale(3.2)', fill: 'none', stroke: '#fff', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, fLogo);
{ const t = el('text', { x: 40, y: 34, 'text-anchor': 'middle', class: 't', 'font-size': 104, fill: '#fff', 'stroke-width': 16 }, fLogo); t.textContent = 'Scalify'; }
const fLt = sticker(FIN, ...FP.lt); { const t = el('text', { 'text-anchor': 'middle', class: 't', 'font-size': VERT ? 78 : 70, fill: '#fff', 'stroke-width': 14 }, fLt); t.textContent = 'Lancement dans'; }
const fJ = sticker(FIN, ...FP.j);
{ el('rect', { x: -300, y: -150, width: 600, height: 270, rx: 60, fill: '#ffd23f', class: 'ol', 'stroke-width': 14 }, fJ);
  const t = el('text', { y: 80, 'text-anchor': 'middle', class: 't', 'font-size': 240, fill: '#1d1b2e', 'stroke-width': 0 }, fJ); t.textContent = `J-${JOURS}`; }
const fB = sticker(FIN, ...FP.badge);
{ let d = ''; for (let i = 0; i < 28; i++) { const r = i % 2 ? 128 : 160, a = i / 28 * Math.PI * 2; d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ' ' + (Math.sin(a) * r).toFixed(1); }
  el('path', { d: d + 'Z', fill: '#ff5a5f', class: 'ol', 'stroke-width': 10 }, fB);
  const a = el('text', { y: 10, 'text-anchor': 'middle', class: 't', 'font-size': 92, fill: '#fff', 'stroke-width': 0 }, fB); a.textContent = '-30 %';
  const b = el('text', { y: 62, 'text-anchor': 'middle', class: 't', 'font-size': 30, fill: '#fff', 'stroke-width': 0 }, fB); b.textContent = 'les 15 premiers'; }
const fSub = sticker(FIN, ...FP.sub);
{ el('rect', { x: -290, y: -66, width: 580, height: 120, rx: 60, fill: '#fff', class: 'ol', 'stroke-width': 10 }, fSub);
  const t = el('text', { y: 20, 'text-anchor': 'middle', class: 't', 'font-size': 64, fill: '#7b5cff', 'stroke-width': 0 }, fSub); t.textContent = 'Abonnez-vous 🔔'; }

// ---------------------------------------------------------------- sous-titres
const CAPS = $('caps');
const capG = el('g', {}, CAPS);
const DISP = { 'Scalifaï': 'Scalify', '23 jours': '23 jours', '30 %': '30 %' };
let chunks = [];
function buildChunks(TL) {
  for (const k of ['l1', 'l2', 'l3', 'l4', 'l5', 'l6']) {
    const ws = TL.lines[k].words; const N = VERT ? 4 : 3;
    // coupe aux points / virgules si possible
    let cur = [];
    ws.forEach((w, i) => { cur.push(w); const txt = TL.lines[k].text; if (cur.length >= N || i === ws.length - 1) { chunks.push(cur); cur = []; } });
  }
}
function showCaps(t) {
  capG.innerHTML = '';
  const c = chunks.find((ch, i) => { const nx = chunks[i + 1]; return t >= ch[0].t - .05 && t < (nx ? Math.min(nx[0].t - .05, ch[ch.length - 1].e + .6) : ch[ch.length - 1].e + .6); });
  if (!c) return;
  const tx = el('text', { x: CAP.x, y: CAP.y, 'text-anchor': 'middle', class: 't', 'font-size': CAP.size, 'stroke-width': 16 }, capG);
  c.forEach((w, i) => { const sp = el('tspan', { fill: t >= w.t - .05 && t < w.e + .08 ? '#ffd23f' : '#fff' }, tx); sp.textContent = (i ? ' ' : '') + (DISP[w.w] || w.w); });
  const len = tx.getComputedTextLength(); const s = Math.min(1, CAP.max / len);
  const k = spring(pr(t, c[0].t - .05, c[0].t + .3));
  A(tx, 'transform', `translate(${CAP.x} ${CAP.y}) scale(${s * (.6 + .4 * k)}) rotate(-2) translate(${-CAP.x} ${-CAP.y})`);
}

// ---------------------------------------------------------------- animation
let TL;
const keeper = $('keeper'), blob = $('blob'), blobB = $('blobB');
window.seek = (t, frame = Math.round(t * 30)) => {
  const L = TL.lines, w = (k, i) => L[k].words[i].t;
  const tAppear = [1, 4, 6, 7, 9].map(i => w('l2', i));
  const tCrash = L.l3.end + .05, tLand = w('l4', 4), t5 = L.l5.start, t6 = L.l6.start, t7 = L.l7.start;
  const stress = pr(t, L.l2.start, L.l3.end);
  // fond : légère teinte rouge quand ça stresse
  A($('stressTint'), 'opacity', t < tCrash + .6 ? stress * .16 : 0);
  // ---- commerçant
  const happy = t >= tLand + .4, shocked = win(t, tCrash, tLand + .4);
  let kx = 540, ky = 470, kr = 0;
  if (t < tCrash) kr = Math.sin(t * (5 + stress * 10)) * stress * 3;
  if (shocked) ky = 470 - 30 * Math.sin(Math.PI * pr(t, tCrash, tCrash + .35));
  if (t >= tLand - .3) kx = lerp(540, 330, io(pr(t, tLand - .3, tLand + .3)));
  A(keeper, 'transform', `translate(${kx} ${ky}) rotate(${kr})`);
  const jug = t < tCrash ? Math.sin(t * (6 + stress * 9)) : 0;
  const serving = t >= t6 + .4;
  A($('armL'), 'transform', `translate(-100 40) rotate(${t < tAppear[0] ? 50 + Math.sin(t * 3) * 6 : t < tCrash ? -10 + jug * 22 : shocked ? -30 : 40})`);
  A($('armR'), 'transform', `translate(100 40) rotate(${t < 1.2 ? -40 + Math.sin(t * 9) * 25 : t < tAppear[0] ? -50 : t < tCrash ? 10 - jug * 22 : shocked ? 30 : serving ? 60 + Math.sin(t * 3) * 5 : -40})`);
  A($('bag'), 'opacity', serving ? 1 : 0);
  const blink = (t * .41 % 1) < .035 && !happy;
  A($('eyesO'), 'opacity', happy ? 0 : 1); A($('eyesO'), 'transform', blink ? 'translate(0 -120) scale(1 .1) translate(0 120)' : '');
  A($('eyesH'), 'opacity', happy ? 1 : 0);
  A($('brows'), 'opacity', happy ? 0 : 1);
  A($('brows'), 'd', stress > .2 || shocked ? 'M-64 -176 L-14 -160 M64 -176 L14 -160' : 'M-64 -168 L-14 -172 M64 -168 L14 -172');
  A($('mouthS'), 'opacity', !happy && !shocked && stress > .3 ? 1 : 0);
  A($('mouthO'), 'opacity', shocked ? 1 : 0);
  A($('mouthH'), 'opacity', happy || stress <= .3 && !shocked ? 1 : 0);
  A($('sweat'), 'opacity', stress > .35 && !happy ? 1 : 0); A($('sweat'), 'transform', `translate(0 ${(t * 120) % 50})`);
  const look = t < tCrash ? Math.sin(t * (2 + stress * 10)) * 7 : 0; A($('pL'), 'cx', -38 + look); A($('pR'), 'cx', 38 + look);
  A($('head'), 'transform', `rotate(${t < tCrash ? Math.sin(t * (2 + stress * 11)) * (1 + stress * 4) : Math.sin(t * 2) * 3})`);
  // ---- mascotte
  let bop = 0, bx = 800, by = 760, sx = 1, sy = 1;
  if (t >= tLand - .55) {
    bop = 1; const k = pr(t, tLand - .55, tLand);
    bx = lerp(1350, 790, oc(k)); by = 760 - Math.sin(Math.PI * k) * 420;
    if (k < 1) { sx = .85; sy = 1.2; } else { const l = pr(t, tLand, tLand + .45), q = Math.sin(l * Math.PI * 3) * Math.exp(-l * 3) * .3; sx = 1 + q; sy = 1 - q; }
    if (t > tLand + .45) { const b = Math.abs(Math.sin((t - tLand) * 4)); by = 760 - b * 22; }
  }
  A(blob, 'opacity', bop); A(blob, 'transform', `translate(${bx} ${by})`); A(blobB, 'transform', `scale(${sx} ${sy})`);
  const juggling = win(t, tLand + .1, t6 + .5);
  A($('bArmL'), 'transform', `rotate(${juggling ? Math.sin(t * 7) * 18 : Math.sin(t * 8) * 14} -124 -124)`);
  A($('bArmR'), 'transform', `rotate(${juggling ? -Math.sin(t * 7) * 18 : -Math.sin(t * 8) * 14 - 20} 124 -124)`);
  const bl = Math.sin(t * 2.2) * 8; A($('bpL'), 'cx', -40 + bl); A($('bpR'), 'cx', 52 + bl);
  A($('bEyes'), 'transform', (t * .37 % 1) < .035 ? 'translate(0 -204) scale(1 .1) translate(0 204)' : '');
  // ---- objets
  ITEMS.forEach(({ g, ck }, i) => {
    const ta = tAppear[i]; let op = t >= ta ? 1 : 0, x, y, s, r = 0;
    const sp = 1.6 + stress * 3.2, th = sp * (Math.min(t, tCrash) - L.l2.start) + i * 2 * Math.PI / 5;
    const jx = kx + 320 * Math.cos(th), jy = 90 + 135 * Math.sin(th);
    // apparition : jaillit de derrière le comptoir jusqu'à sa place dans le cercle
    const ka = pr(t, ta, ta + .5); x = lerp(kx + (i - 2) * 60, jx, oc(ka)); y = lerp(560, jy, oc(ka)); s = spring(pr(t, ta, ta + .45)); r = Math.sin(th) * 12 * stress;
    if (t >= tCrash) { const ft = t - tCrash; x = jx + (i - 2) * 90 * ft; y = jy - 300 * ft + 1500 * ft * ft; r = ft * 300 * (i % 2 ? 1 : -1); }
    if (t >= tLand + .05) { // Scalify rattrape tout et jongle tranquillement
      const k = oc(pr(t, tLand + .05, tLand + .6)), th2 = (t - tLand) * 2.1 + i * 2 * Math.PI / 5;
      const bxj = 790 + 230 * Math.cos(th2), byj = 210 + 95 * Math.sin(th2);
      x = lerp(bx + (i - 2) * 120, bxj, k); y = lerp(1250, byj, k); s = .82; r = Math.sin(th2) * 8; op = 1;
    }
    if (t >= t6) { const k = io(pr(t, t6 - .1 + i * .06, t6 + .5 + i * .06)); y -= k * 900; op = 1 - k; }
    A(g, 'opacity', op); A(g, 'transform', `translate(${x} ${y}) rotate(${r}) scale(${Math.max(.001, s)})`);
    const tc = t5 + .35 + i * .42, kc = pr(t, tc, tc + .35);
    A(ck, 'opacity', t >= tc && t < t6 ? 1 : 0); A(ck, 'transform', `translate(66 -62) scale(${spring(kc) * 1.05})`);
  });
  // ---- éclat OUPS + poussière
  const kb = pr(t, tCrash + .15, tCrash + .9);
  A(burst, 'opacity', win(t, tCrash + .15, tCrash + 1.0) ? 1 - pr(t, tCrash + .85, tCrash + 1.0) : 0);
  A(burst, 'transform', `translate(540 120) rotate(${-6 + kb * 6}) scale(${spring(kb) * .9})`);
  puffs.forEach((p, i) => { const k = pr(t, tLand, tLand + .6), a = Math.PI + i / 5 * Math.PI;
    A(p, 'opacity', win(t, tLand, tLand + .6) ? 1 - k : 0); A(p, 'cx', 790 + Math.cos(a) * (60 + 160 * oc(k))); A(p, 'cy', 750 + Math.sin(a) * 40 * oc(k)); A(p, 'r', 30 * (1 - k * .5)); });
  // ---- clients
  CUST.forEach((u, i) => {
    const a = t6 + .3 + i * .32, k = pr(t, a, a + .75), on = win(t, a, t7);
    const slot = 300 + i * 150, x = lerp(1300, slot, oc(k)), y = 1090 - Math.abs(Math.sin(k * Math.PI * 3)) * 60 * (1 - k);
    A(u, 'opacity', on ? 1 : 0); A(u, 'transform', `translate(${x} ${y}) scale(1.1)`);
    const kh = pr(t, a + .8, a + 1.6); A(hearts[i], 'opacity', on && kh > 0 && kh < 1 ? 1 - kh : 0);
    A(hearts[i], 'transform', `translate(${slot} ${860 - kh * 160}) scale(${spring(pr(t, a + .8, a + 1.1))})`);
  });
  // ---- transition vers le carton final + carton
  const DIAG = Math.hypot(W, H); let ir = 0, io_ = 0;
  if (win(t, t7 - .35, t7)) { ir = io(pr(t, t7 - .35, t7)) * DIAG; io_ = 1; }
  if (win(t, t7, t7 + .25)) { ir = DIAG; io_ = 1 - pr(t, t7, t7 + .25); }
  A($('iris'), 'cx', W / 2); A($('iris'), 'cy', H / 2); A($('iris'), 'r', ir); A($('iris'), 'opacity', io_);
  const fin = t >= t7;
  A($('rays'), 'opacity', fin ? 1 : 0); A($('rayG'), 'transform', `rotate(${t * 12} ${RC[0]} ${RC[1]})`);
  for (const id of ['decor', 'counter', 'keeper', 'queue']) A($(id), 'opacity', fin ? 0 : 1);
  if (fin) { A(blob, 'opacity', 1); A(blob, 'transform', `translate(${VERT ? 540 : 760} ${1080 - Math.abs(Math.sin(t * 4.5)) * 60})`); A(blobB, 'transform', `scale(${spring(pr(t, t7, t7 + .5)) * .9})`); }
  A(FIN, 'opacity', fin ? 1 : 0);
  const pop = (g, a, rot = -3) => { const k = spring(pr(t, a, a + .5)); A(g, 'opacity', t >= a ? 1 : 0); const [x, y] = g._p || (g._p = g.getAttribute('transform').match(/[-\d.]+/g).map(Number));
    A(g, 'transform', `translate(${x} ${y}) rotate(${rot + Math.sin(t * 3 + x) * 1.5}) scale(${Math.max(.001, k)})`); };
  pop(fLogo, w('l7', 0) - .1, -2); pop(fLt, w('l7', 1) - .05, -2); pop(fJ, w('l7', 3) - .05, -5); pop(fB, w('l7', 8) - .05, 8); pop(fSub, L.l7.end + .05, 2);
  A($('fade'), 'opacity', pr(t, TL.end - .45, TL.end));
  // ---- sous-titres (pas sur le carton final : il parle de lui-même)
  if (t < t7 - .35) showCaps(t); else capG.innerHTML = '';
};
fetch('timeline.json').then(r => r.json()).then(async j => {
  TL = j; buildChunks(TL);
  await document.fonts.ready; await Promise.all(['40px Lil', '600 40px Fre'].map(f => document.fonts.load(f)));
  window.END = TL.end; window.ready = true;
  if (!location.search.includes('render')) { const t0 = performance.now(); (function loop() { seek(((performance.now() - t0) / 1000) % TL.end); requestAnimationFrame(loop); })(); }
});
