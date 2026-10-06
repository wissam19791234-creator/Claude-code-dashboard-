// Calque transparent (textes, cartes, transition) — rendu image par image via seek(t)
const END = 17.5, DROP = 7.5;
const $ = id => document.getElementById(id);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const outExpo = k => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));
const outBack = (k, s = 2.2) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
const win = (t, a, b) => t >= a && t < b;
const rnd = s => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const set = (el, op, tf = '') => { el.style.opacity = op; el.style.transform = tf; };
// apparition « pop » + sortie rapide
function pop(el, t, a, b, { from = 70, dx = 0, s0 = .6 } = {}) {
  if (!win(t, a, b)) { set(el, 0); return; }
  const k = prog(t, a, a + .32), o = prog(t, b - .12, b);
  set(el, 1 - o, `translate(${dx * (1 - outExpo(k))}px,${from * (1 - outExpo(k)) - o * 40}px) scale(${lerp(s0, 1, outBack(k)) * (1 - o * .1)})`);
}

window.seek = (t, frame = Math.round(t * 30)) => {
  // accroche
  pop($('hook'), t, .05, 1.95, { from: 40, s0: .8 });
  // titre de section
  const head = $('head'), ht = $('headTxt');
  if (win(t, 2, DROP - .15)) { ht.textContent = 'La formule du commerce vide :'; pop(head, t, 2, DROP - .15, { from: -30, s0: .9 }); }
  else if (win(t, DROP + .05, 13.45)) { ht.textContent = 'Le même commerce + Scalify :'; pop(head, t, DROP + .05, 13.45, { from: -30, s0: .9 }); }
  else set(head, 0);
  // équation (avant)
  const eqOn = win(t, 2, DROP - .1);
  set($('eq'), eqOn ? 1 : 0);
  [['r1', 2.05], ['r2', 3.55], ['r3', 5.05]].forEach(([id, a]) => pop($(id), t, a, DROP - .1, { from: 0, dx: -260, s0: .85 }));
  // = 😬 (avec tremblement nerveux)
  if (win(t, 6.5, DROP - .05)) { const k = prog(t, 6.5, 6.8); const j = (rnd(frame) - .5) * 14 * (t > 6.9); set($('face'), 1, `translate(${j}px,${(rnd(frame + 5) - .5) * 10 * (t > 6.9)}px) scale(${lerp(.3, 1, outBack(k, 2.6))})`); }
  else set($('face'), 0);
  // cartes « après », une par seconde, calées sur le beat
  [['u1', 7.55], ['u2', 8.5], ['u3', 9.5], ['u4', 10.5], ['u5', 11.5], ['u6', 12.5]].forEach(([id, a], i) => pop($(id), t, a, a + .98, { from: 120, s0: .7 }));
  $('score').textContent = (3.8 + 1.1 * outExpo(prog(t, 7.6, 8.1))).toFixed(1).replace('.', ',');
  // = GLOW-UP
  if (win(t, 13.5, 15.02)) {
    const k1 = prog(t, 13.5, 13.75), k2 = prog(t, 13.75, 14.05);
    const g = $('glow'); g.style.opacity = 1; g.style.transform = '';
    g.querySelector('.eq').style.transform = `scale(${lerp(.2, 1, outBack(k1))})`; g.querySelector('.eq').style.opacity = k1 > 0 ? 1 : 0;
    const w = g.querySelector('.w'); w.style.opacity = k2 > 0 ? 1 : 0;
    w.style.transform = `scale(${lerp(2.4, 1, outExpo(k2)) * (1 + .03 * Math.sin(t * 9))}) rotate(${lerp(-6, -2, outExpo(k2))}deg)`;
    w.style.letterSpacing = lerp(.3, -.01, outExpo(k2)) + 'em';
  } else set($('glow'), 0);
  // fin
  if (t >= 15) {
    set($('end'), 1);
    const st = (id, a, extra = '') => { const k = prog(t, a, a + .35); set($(id), k > 0 ? 1 : 0, `translateY(${60 * (1 - outExpo(k))}px) scale(${lerp(.7, 1, outBack(k))})${extra}`); };
    const kl = prog(t, 15, 15.5); set($('logo'), kl > 0 ? 1 : 0, `scale(${lerp(.2, 1, outBack(kl))}) rotateY(${lerp(540, 0, outExpo(kl))}deg)`);
    st('endName', 15.15); st('endTag', 15.4); st('endPill', 15.65);
    const pulse = 1 + Math.max(0, Math.sin((t - 16.3) * 7)) * .06 * (t > 16.3);
    st('endFollow', 15.9, ` scale(${pulse})`);
  } else set($('end'), 0);
  // transition « pale de ventilateur » sur le drop
  const fan = $('fan');
  if (win(t, DROP - .22, DROP + .22)) { const k = prog(t, DROP - .22, DROP + .22); fan.style.opacity = 1; fan.style.setProperty('--a', lerp(-250, 150, k) + 'deg'); fan.style.filter = 'blur(6px)'; }
  else fan.style.opacity = 0;
  // flashs
  let fl = 0; [[DROP, .6], [13.75, .45], [15, .35]].forEach(([a, s]) => { if (win(t, a, a + .2)) fl = Math.max(fl, s * (1 - prog(t, a, a + .2))); });
  $('flash').style.opacity = fl;
};
window.ready = true;
if (!location.search.includes('render')) { const t0 = performance.now(); (function loop() { seek(((performance.now() - t0) / 1000) % END); requestAnimationFrame(loop); })(); }
