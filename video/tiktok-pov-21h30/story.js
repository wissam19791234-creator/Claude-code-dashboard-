// « POV : 21 h 30, vous avez faim » — histoire 100 % écran de téléphone, rendue image par image via seek(t)
const END = 20;
const $ = id => document.getElementById(id);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const outExpo = k => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));
const outBack = (k, s = 1.9) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
const inOut = k => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const win = (t, a, b) => t >= a && t < b;
const set = (el, op, tf) => { el.style.opacity = op; if (tf !== undefined) el.style.transform = tf; };
const popIn = (t, a, d = .35) => { const k = prog(t, a, a + d); return { k, op: k > 0 ? 1 : 0, s: lerp(.6, 1, outBack(k)) }; };

// le doigt suit l'écran (il est dans le téléphone)
const tap = $('tap'); $('screen').appendChild(tap);
const TAPS = [[3.55, 360, 790], [6.75, 360, 1150], [8.1, 540, 1060]]; // [t, x, y] dans l'écran
const CAPS = [[0, 'POV : 21 h 30, vous avez faim 🍕'], [1.6, 'Vous cherchez une pizzeria ouverte…'], [4.0, 'Chez Marco : ça sonne dans le vide 📵'],
  [6.5, 'Chez Bella : tout est là, direct'], [8.4, 'Vous écrivez… l’IA répond en 3 secondes 🤖'], [11.1, 'Pendant ce temps, Bella reçoit ça 👇'], [13.4, null]];
const QUERY = 'pizzeria ouverte';

window.seek = (t, frame = Math.round(t * 30)) => {
  // fond qui respire
  $('b1').style.transform = `translate(${Math.sin(t * .5) * 120}px,${Math.cos(t * .4) * 90}px)`;
  $('b2').style.transform = `translate(${Math.cos(t * .45) * 110}px,${Math.sin(t * .35) * 120}px)`;
  $('b3').style.transform = `translate(${Math.sin(t * .3) * 140}px,0)`;
  $('mood').style.opacity = win(t, 4.0, 6.5) ? .85 * Math.min(prog(t, 4, 4.3), 1 - prog(t, 6.3, 6.5)) : 0;

  // légende
  let cap = null; CAPS.forEach(([a, s]) => { if (t >= a) cap = [a, s]; });
  const capEl = $('cap');
  if (cap && cap[1] && t < 13.4) { $('capT').textContent = cap[1]; const p = popIn(t, cap[0], .3); set(capEl, 1, `scale(${p.s})`); }
  else set(capEl, 0);

  // caméra sur le téléphone
  const ph = $('phone');
  const enter = outExpo(prog(t, 0, .7));
  let tx = 0, ty = lerp(1100, 0, enter), sc = 1, rx = lerp(28, 6, enter), ry = -6 + Math.sin(t * .8) * 3, rz = 0;
  if (win(t, 2.0, 4.0)) { const k = inOut(prog(t, 2.0, 3.2)); sc = lerp(1, 1.1, k); ty = lerp(0, -120, k); }
  if (win(t, 5.35, 5.8)) { const s = (1 - prog(t, 5.35, 5.8)) * 18; tx = Math.sin(frame * 2.1) * s; rz = Math.sin(frame * 1.7) * s * .05; }
  if (win(t, 8.4, 11.0)) { const k = inOut(prog(t, 8.4, 9.0)); sc = lerp(1, 1.06, k); ty = lerp(0, -60, k); }
  if (win(t, 10.95, 11.35)) { const k = prog(t, 10.95, 11.35); ry = lerp(-6, 354, inOut(k)); } // le téléphone pivote : on passe chez Bella
  if (t >= 13.3) { const k = inOut(prog(t, 13.3, 13.9)); sc = lerp(1, .5, k); ty = lerp(0, 900, k); rx = lerp(6, 30, k); }
  set(ph, t >= 13.9 ? 0 : 1, `translate(${tx}px,${ty}px) scale(${sc}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`);
  $('clock').textContent = t >= 11.15 ? '21:31' : '21:30';
  $('status').style.color = (win(t, 4.0, 6.5) || t >= 11.15) ? '#fff' : '#000';

  // écrans
  const scr = (id, a, b, mode = 'left') => {
    const el = $(id); if (!win(t, a, b)) { set(el, 0); return; }
    const k = outExpo(prog(t, a, a + .3));
    const tfm = mode === 'up' ? `translateY(${lerp(100, 0, k)}%)` : mode === 'fade' ? `scale(${lerp(1.08, 1, k)})` : `translateX(${lerp(100, 0, k)}%)`;
    set(el, mode === 'fade' ? k : 1, tfm);
  };
  // chaque écran reste visible sous le suivant pendant sa transition (pas d'image blanche)
  scr('sA', 0, 4.35, 'fade'); if (win(t, 6.5, 7.35)) set($('sA'), 1, `translateX(${lerp(-25, 0, outExpo(prog(t, 6.5, 6.8)))}%)`);
  scr('sB', 4.0, 6.8); if (win(t, 6.5, 6.8)) set($('sB'), 1, `translateX(${lerp(0, 100, inOut(prog(t, 6.5, 6.8)))}%)`);
  scr('sD', 7.0, 8.75, 'up'); scr('sE', 8.4, 11.5); scr('sF', 11.15, 13.9, 'fade');

  // A : saisie + résultats
  const nch = Math.floor(QUERY.length * prog(t, .7, 1.5));
  $('typed').textContent = QUERY.slice(0, nch);
  $('caret').style.opacity = t < 1.7 && Math.floor(t * 2.5) % 2 === 0 ? 1 : 0;
  const sh = outExpo(prog(t, 1.65, 2.05)); $('sheet').style.transform = `translateY(${lerp(100, t >= 6.5 ? 0 : 0, sh)}%)`;
  if (t >= 6.5) $('sheet').style.transform = 'translateY(0)';
  const pM = popIn(t, 1.85, .35), pB = popIn(t, 2.05, .35);
  set($('rMarco'), pM.op, `scale(${pM.s})`); set($('rBella'), pB.op, `scale(${pB.s})`);
  $('rBella').style.boxShadow = t > 2.4 ? `0 10px ${30 + 20 * Math.sin(t * 6)}px #ffd73188` : '';

  // B : appel qui échoue
  $('callSub').textContent = t < 5.35 ? 'Appel en cours' + '.'.repeat(1 + Math.floor(t * 3) % 3) : 'Personne ne répond';
  const f = popIn(t, 5.35, .3); set($('callFail'), f.op, `scale(${f.s})`);

  // D : le site défile un peu
  document.querySelector('#site .body').style.transform = `translateY(${-60 * inOut(prog(t, 7.4, 8.2))}px)`;

  // E : conversation avec l'IA
  const MSG = 'Une table pour 2, là maintenant ?';
  const typed = Math.floor(MSG.length * prog(t, 8.55, 9.15));
  $('inpT').textContent = t < 8.55 ? 'Écrire un message…' : t < 9.25 ? MSG.slice(0, typed) : 'Écrire un message…';
  const m1 = popIn(t, 9.25, .3); set($('m1'), m1.op, `translateY(${lerp(40, 0, outExpo(m1.k))}px) scale(${m1.s})`);
  set($('dots'), win(t, 9.55, 10.15) ? 1 : 0); $('dots').style.display = t < 10.15 ? 'flex' : 'none';
  [...$('dots').children].forEach((d, i) => (d.style.transform = `translateY(${Math.sin(t * 12 - i) * 6}px)`));
  const m2 = popIn(t, 10.15, .35); set($('m2'), m2.op, `translateY(${lerp(40, 0, outExpo(m2.k))}px) scale(${m2.s})`);

  // F : notifications chez Bella
  [['n1', 11.6], ['n2', 12.2], ['n3', 12.8]].forEach(([id, a]) => { const p = popIn(t, a, .35); set($(id), p.op, `translateY(${lerp(-80, 0, outExpo(p.k))}px) scale(${p.s})`); });

  // doigt qui tape
  let tp = null; TAPS.forEach(([a, x, y]) => { if (win(t, a - .25, a + .3)) tp = [a, x, y]; });
  if (tp) { const k = prog(t, tp[0] - .25, tp[0]); const r = prog(t, tp[0], tp[0] + .3); tap.style.left = tp[1] + 'px'; tap.style.top = tp[2] + 'px'; set(tap, (1 - r) * Math.min(1, k * 3), `scale(${t < tp[0] ? lerp(1.4, 1, k) : lerp(.9, 1.6, r)})`); }
  else set(tap, 0);

  // G : comparaison + punchline
  const c = popIn(t, 13.6, .4); set($('cmp'), win(t, 13.6, 15.75) ? c.op * (1 - prog(t, 15.5, 15.75)) : 0, `translateY(${lerp(120, 0, outExpo(c.k))}px)`);
  const d1 = popIn(t, 14.3, .3); const diff = $('diff');
  set(diff, win(t, 14.3, 15.75) ? 1 - prog(t, 15.5, 15.75) : 0);
  diff.children[0].style.opacity = d1.op; diff.children[0].style.transform = `scale(${d1.s})`;
  const d2 = popIn(t, 14.85, .3); diff.children[1].style.opacity = d2.op; diff.children[1].style.transform = `scale(${lerp(1.6, 1, outExpo(d2.k))})`;

  // H : fin
  const e = $('end'); set(e, t >= 15.75 ? 1 : 0);
  const st = (id, a) => { const p = popIn(t, a, .35); set($(id), p.op, `translateY(${lerp(60, 0, outExpo(p.k))}px) scale(${p.s})`); };
  const kl = prog(t, 15.75, 16.25); set($('logo'), kl > 0 ? 1 : 0, `scale(${lerp(.2, 1, outBack(kl))}) rotateY(${lerp(540, 0, outExpo(kl))}deg)`);
  st('eName', 15.9); st('eFeat', 16.2); st('ePill', 16.5);
  const pulse = 1 + Math.max(0, Math.sin((t - 17.3) * 6.5)) * .06 * (t > 17.3);
  const pf = popIn(t, 16.8, .35); set($('eFollow'), pf.op, `scale(${pf.s * pulse})`);

  // flash sur les moments clés
  let fl = 0; [[11.15, .5], [14.85, .25], [15.75, .35]].forEach(([a, s]) => { if (win(t, a, a + .18)) fl = Math.max(fl, s * (1 - prog(t, a, a + .18))); });
  $('flash').style.opacity = fl;
};
window.ready = true;
if (!location.search.includes('render')) { const t0 = performance.now(); (function loop() { seek(((performance.now() - t0) / 1000) % END); requestAnimationFrame(loop); })(); }
