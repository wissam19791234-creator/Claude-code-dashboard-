// Hamsterdam et ses accessoires, dessinés en SVG : traits noirs épais, aplats francs, aucun ombrage, aucun texte ni logo.
// Chaque fonction renvoie du balisage SVG (chaîne). Les groupes animables n'ont pas d'attribut transform :
// leur pivot est leur (0, 0) local, placé par un groupe parent (voir ART.piv).
(function () {
  var A = window.ART = window.ART || {};
  var C = A.C = {
    or: '#f7931e', cr: '#fff4e0', pk: '#f59aa6', k: '#141414', suit: '#2a2a33', suit2: '#4a4a58', w: '#ffffff',
    red: '#e3262f', mouth: '#8c1c25', tongue: '#ff7a8c', gold: '#ffc83d', gold2: '#e5a11c', green: '#5cc46c', green2: '#2f8f45',
    bun: '#f2a947', patty: '#7a3e1d', cheese: '#ffd23f', lettuce: '#6cc04a', fry: '#ffd65a', sky: '#86d6ff', sweat: '#7fd0ff',
    rest: '#ff8c1a', rest2: '#ffe2bf', steel: '#cfd6de', steel2: '#9aa5b1', wood: '#c97a3c', wood2: '#a85f2a'
  };
  var LW = A.LW = 9;
  A.ft = function (tl, t, a, b, at) { b.immediateRender = false; tl.fromTo(t, a, b, at); };
  // hasard déterministe (même dessin à chaque rendu)
  A.rnd = function (seed) { var s = seed % 2147483647 || 1; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; };
  var pend = [];          // poses initiales (rotation, échelle) appliquées après l'injection du SVG

  function at(o) {
    var s = '';
    for (var k in o) if (o[k] !== undefined && o[k] !== null && o[k] !== false) s += ' ' + k + '="' + o[k] + '"';
    return s;
  }
  var el = A.el = function (tag, o, inner) { return '<' + tag + at(o) + (inner == null ? '/>' : '>' + inner + '</' + tag + '>'); };
  var st = function (o, fill, sw) {
    o.fill = fill == null ? 'none' : fill;
    if (sw !== 0) { o.stroke = C.k; o['stroke-width'] = sw == null ? LW : sw; o['stroke-linejoin'] = 'round'; o['stroke-linecap'] = 'round'; }
    return o;
  };
  var P = A.P = function (d, fill, sw, ex) { return el('path', Object.assign(st({ d: d }, fill, sw), ex || {})); };
  var E = A.E = function (cx, cy, rx, ry, fill, sw, ex) { return el('ellipse', Object.assign(st({ cx: cx, cy: cy, rx: rx, ry: ry }, fill, sw), ex || {})); };
  var Ci = A.Ci = function (cx, cy, r, fill, sw, ex) { return el('circle', Object.assign(st({ cx: cx, cy: cy, r: r }, fill, sw), ex || {})); };
  var R = A.R = function (x, y, w, h, rx, fill, sw, ex) { return el('rect', Object.assign(st({ x: x, y: y, width: w, height: h, rx: rx }, fill, sw), ex || {})); };
  var G = A.G = function (o, inner) { return el('g', typeof o === 'string' ? { id: o } : o, inner); };
  var T = A.T = function (x, y, s, r) { return 'translate(' + x + ',' + y + ')' + (s && s !== 1 ? ' scale(' + s + ')' : '') + (r ? ' rotate(' + r + ')' : ''); };
  // groupe animable « id » dont le pivot est (x, y) dans le repère parent
  var piv = A.pivG = function (id, x, y, inner, cls) { return G({ transform: 'translate(' + x + ',' + y + ')' }, G({ id: id, class: cls }, inner)); };
  A.set = function (sel, v) { pend.push([sel, v]); };
  A.flush = function () {
    pend.forEach(function (p) { gsap.set(p[0], p[1]); });
    pend = [];
  };
  // pivot SVG fixé une fois, à l'identité, avant toute transformation (sinon GSAP décale l'élément)
  A.piv = function (root) {
    root.querySelectorAll('g[id]').forEach(function (g) { if (!g.getAttribute('transform')) gsap.set(g, { svgOrigin: '0 0' }); });
  };

  // ------------------------------------------------------------------ Hamsterdam
  var HEAD = 'M 0 -692 C 70 -692 150 -672 172 -610 C 190 -560 208 -520 206 -470 C 204 -405 150 -356 0 -354 ' +
    'C -150 -356 -204 -405 -206 -470 C -208 -520 -190 -560 -172 -610 C -150 -672 -70 -692 0 -692 Z';
  var MASK = 'M -205 -480 C -190 -515 -140 -522 -110 -502 C -85 -486 -52 -486 -32 -512 C -18 -530 18 -530 32 -512 ' +
    'C 52 -486 85 -486 110 -502 C 140 -522 190 -515 205 -480 C 206 -405 150 -356 0 -354 C -150 -356 -206 -405 -205 -480 Z';
  var mir = function (f) { return f(1) + f(-1); };

  function eye(id, kind, cx, cy, look) {
    var lx = (look || 0) * 6, s = '';
    if (kind === 'n') s = G({ transform: T(cx + lx, cy) }, G({ class: 'bl-' + id }, E(0, 0, 34, 42, C.k, 0) + E(10 - lx * 0.4, -15, 12, 13, C.w, 0) + Ci(-11, 14, 5.5, C.w, 0)));
    else if (kind === 'shock') s = E(cx, cy, 41, 48, C.w, 8) + Ci(cx + lx * 1.6, cy + 4, 15, C.k, 0) + Ci(cx + lx * 1.6 + 5, cy - 2, 4.5, C.w, 0);
    else if (kind === 'happy') s = P('M ' + (cx - 30) + ' ' + (cy + 8) + ' Q ' + cx + ' ' + (cy - 32) + ' ' + (cx + 30) + ' ' + (cy + 8), null, 11);
    else if (kind === 'sleep') s = P('M ' + (cx - 30) + ' ' + (cy - 2) + ' Q ' + cx + ' ' + (cy + 22) + ' ' + (cx + 30) + ' ' + (cy - 2), null, 10);
    else if (kind === 'half') s = G({ transform: T(cx + lx, cy) }, E(0, 0, 34, 42, C.k, 0) + E(10, -2, 10, 10, C.w, 0) +
      P('M -40 -46 L 40 -46 L 40 -4 Q 0 4 -40 -4 Z', C.or, 0) + P('M -36 -5 Q 0 3 36 -5', null, 8));
    return s;
  }
  function brows(kind) {
    if (kind === 'up') return mir(function (s) { return P('M ' + (s * -104) + ' -584 Q ' + (s * -74) + ' -604 ' + (s * -44) + ' -588', null, 9); });
    if (kind === 'high') return mir(function (s) { return P('M ' + (s * -104) + ' -598 Q ' + (s * -74) + ' -622 ' + (s * -44) + ' -604', null, 9); });
    if (kind === 'worry') return mir(function (s) { return P('M ' + (s * -104) + ' -566 L ' + (s * -48) + ' -592', null, 10); });
    if (kind === 'angry') return mir(function (s) { return P('M ' + (s * -106) + ' -594 L ' + (s * -48) + ' -570', null, 10); });
    if (kind === 'one') return P('M -104 -572 L -46 -576', null, 9) + P('M 46 -594 Q 74 -614 104 -598', null, 9);
    return '';
  }
  var TEETH = R(-13, -437, 26, 24, 4, C.w, 5) + P('M 0 -437 L 0 -414', null, 4);
  var MOUTH = {
    w: TEETH + P('M -32 -442 Q -16 -425 0 -438 Q 16 -425 32 -442', null, 7),
    open: P('M -40 -442 Q 0 -432 40 -442 Q 36 -384 0 -378 Q -36 -384 -40 -442 Z', C.mouth, 7) +
      P('M -24 -394 Q 0 -414 24 -394 Q 16 -381 0 -381 Q -16 -381 -24 -394 Z', C.tongue, 0) +
      R(-15, -440, 14, 17, 3, C.w, 4) + R(1, -440, 14, 17, 3, C.w, 4),
    O: E(0, -408, 27, 37, C.mouth, 7) + E(0, -385, 16, 9, C.tongue, 0) + R(-13, -446, 26, 14, 3, C.w, 4),
    wavy: R(-11, -432, 22, 17, 3, C.w, 4) + P('M -34 -428 Q -17 -446 0 -432 Q 17 -418 34 -434', null, 7),
    smallO: E(0, -422, 14, 17, C.mouth, 6),
    frown: P('M -30 -416 Q 0 -446 30 -416', null, 7) + R(-10, -441, 20, 14, 3, C.w, 4),
    grin: P('M -76 -452 Q 0 -438 76 -452 Q 64 -374 0 -370 Q -64 -374 -76 -452 Z', C.w, 7) +
      P('M -68 -414 Q 0 -402 68 -414', null, 4) + P('M -40 -446 L -40 -380 M -14 -443 L -14 -372 M 14 -443 L 14 -372 M 40 -446 L 40 -380', null, 4),
    smirk: R(-12, -436, 24, 20, 3, C.w, 4) + P('M -34 -434 Q 0 -420 42 -450', null, 7),
    grim: P('M -48 -446 L 48 -446 Q 50 -416 42 -410 L -42 -410 Q -50 -416 -48 -446 Z', C.w, 6) + P('M -46 -428 L 46 -428 M -24 -446 L -24 -410 M 0 -446 L 0 -410 M 24 -446 L 24 -410', null, 4),
    sleep: E(0, -424, 10, 12, C.mouth, 5),
    small: TEETH + P('M -18 -438 Q 0 -432 18 -440', null, 7)
  };
  // visages : yeux, sourcils, bouche fermée, bouche « parle » (facultative)
  var FACES = {
    smile: ['n', '', 'w', 'open'], happy: ['n', 'up', 'open', 'w'], shock: ['shock', 'high', 'O'], worry: ['n', 'worry', 'wavy', 'smallO'],
    sad: ['n', 'worry', 'frown', 'smallO'], grin: ['happy', '', 'grin'], proud: ['n', 'angry', 'smirk', 'open'], sleep: ['sleep', '', 'sleep'],
    awk: ['n', 'worry', 'grim', 'smallO'], think: ['n', 'one', 'small'], tired: ['half', 'worry', 'wavy', 'smallO'], joy: ['happy', 'up', 'open']
  };
  function face(id, name, look, vis) {
    var f = FACES[name], s = brows(f[1]) + eye(id, f[0], -72, -512, look) + eye(id, f[0], 72, -512, look);
    s += P('M -16 -470 Q 0 -479 16 -470 Q 12 -455 0 -450 Q -12 -455 -16 -470 Z', C.pk, 6);
    s += G({ id: id + '-' + name + '-mc' }, MOUTH[f[2]]);
    if (f[3]) s += G({ id: id + '-' + name + '-mo', opacity: 0 }, MOUTH[f[3]]);
    return G({ id: id + '-' + name, opacity: vis ? 1 : 0 }, s);
  }
  A.FACES = FACES;

  // bras : o = { a: ouverture vers l'extérieur (°), hand: 'paw'|'point'|'open', item: svg tenu, itemBack: objet derrière la patte, len }
  function arm(id, side, o) {
    var L = o.len || 118, s = '';
    var sleeve = 'M -27 0 A 27 27 0 0 1 27 0 C 30 40 28 ' + (L - 34) + ' 24 ' + (L - 10) + ' L -24 ' + (L - 10) + ' C -28 ' + (L - 34) + ' -30 40 -27 0 Z';
    var paw = '';
    if (o.hand === 'point') paw = R(-12, L + 8, 24, 78, 12, C.or, 7) + Ci(0, L + 8, 28, C.or, 8) + P('M -12 ' + (L + 24) + ' L 10 ' + (L + 24), null, 5);
    else if (o.hand === 'open') paw = E(0, L + 10, 33, 27, C.or, 8) + P('M -14 ' + (L + 30) + ' L -16 ' + (L + 38) + ' M 0 ' + (L + 33) + ' L 0 ' + (L + 42) + ' M 14 ' + (L + 30) + ' L 16 ' + (L + 38), null, 5);
    else if (o.hand === 'thumb') paw = Ci(0, L + 8, 29, C.or, 8) + R(-34, L - 18, 20, 40, 10, C.or, 7);
    else paw = Ci(0, L + 8, 29, C.or, 8) + P('M -10 ' + (L + 24) + ' L -10 ' + (L + 36) + ' M 10 ' + (L + 24) + ' L 10 ' + (L + 36), null, 5);
    var item = o.item ? G({ transform: 'translate(0,' + (L + 8) + ') rotate(' + (o.itemRot || 0) + ')' }, G({ id: id + '-it' + (side < 0 ? 'L' : 'R') }, o.item)) : '';
    s = (o.itemBack ? item : '') + P(sleeve, C.suit, 8) + P('M -20 ' + (L - 22) + ' L 20 ' + (L - 22), null, 4, { stroke: C.suit2 }) + paw + (o.itemBack ? '' : item);
    var aid = id + '-a' + (side < 0 ? 'L' : 'R');
    A.set('#' + aid, { rotation: -(o.a == null ? 14 : o.a) });
    return G({ transform: 'translate(' + (side * 158) + ',-366)' + (side < 0 ? ' scale(-1,1)' : '') }, G({ id: aid }, s));
  }

  // Hamsterdam. o : faces ['smile', ...] (la 1re visible), look, armL/armR {a, hand, item}, apron, hat, pockets, blush, sweat, shadow
  A.hamster = function (id, x, y, s, o) {
    o = o || {};
    var faces = o.faces || ['smile'];
    var b = '';
    if (o.shadow !== false) b += E(0, 4, 190, 26, 'rgba(0,0,0,0.18)', 0);
    // pieds, corps, ventre
    b += mir(function (s2) { return E(s2 * 80, -16, 60, 26, C.cr, 8) + P('M ' + (s2 * 64 + 30 * s2) + ' -24 L ' + (s2 * 64 + 30 * s2) + ' -6 M ' + (s2 * 64 + 10 * s2) + ' -24 L ' + (s2 * 64 + 10 * s2) + ' -6', null, 4); });
    b += P('M -150 -400 C -196 -330 -200 -170 -186 -98 C -172 -40 -104 -24 0 -24 C 104 -24 172 -40 186 -98 C 200 -170 196 -330 150 -400 Z', C.or, LW);
    b += E(0, -108, 120, 76, C.cr, 0);
    b += P('M -150 -400 C -196 -330 -200 -170 -186 -98 C -172 -40 -104 -24 0 -24 C 104 -24 172 -40 186 -98 C 200 -170 196 -330 150 -400', null, LW);
    // veste, chemise, cravate
    b += P('M -152 -398 C -198 -330 -204 -230 -196 -168 C -150 -150 -80 -150 -30 -160 L 0 -202 L 30 -160 C 80 -150 150 -150 196 -168 C 204 -230 198 -330 152 -398 C 110 -414 -110 -414 -152 -398 Z', C.suit, LW);
    b += P('M -64 -404 L 0 -252 L 64 -404 Z', C.w, 6);
    b += P('M -66 -404 L -84 -338 L -50 -330 L 0 -252 Z', C.suit, 6) + P('M 66 -404 L 84 -338 L 50 -330 L 0 -252 Z', C.suit, 6);
    b += P('M -62 -406 L -8 -394 L -36 -362 Z', C.w, 6) + P('M 62 -406 L 8 -394 L 36 -362 Z', C.w, 6);
    b += P('M -14 -396 L 14 -396 L 10 -372 L -10 -372 Z', C.red, 6) + P('M -10 -372 L 10 -372 L 21 -292 L 0 -264 L -21 -292 Z', C.red, 6);
    b += Ci(0, -226, 7, C.suit2, 4) + P('M -150 -300 L -104 -300', null, 5, { stroke: C.suit2 });
    if (o.apron) b += P('M -100 -330 L 100 -330 L 128 -70 Q 0 -48 -128 -70 Z', C.w, 8) + P('M -100 -330 L -54 -398 M 100 -330 L 54 -398', null, 7) +
      R(-46, -230, 92, 60, 10, C.w, 6) + P('M -128 -250 L 128 -250', null, 0) ;
    if (o.pockets) b += G({ id: id + '-pk' }, mir(function (s2) { return P('M ' + (s2 * 160 - 34) + ' -172 Q ' + (s2 * 160 - 38) + ' -110 ' + (s2 * 160) + ' -100 Q ' + (s2 * 160 + 38) + ' -110 ' + (s2 * 160 + 34) + ' -172 Z', C.w, 7); }));
    // tête
    var h = '';
    h += mir(function (s2) { return Ci(s2 * 142, -676, 52, C.or, LW) + Ci(s2 * 142, -684, 30, C.pk, 0); });
    h += P('M -26 -684 L -12 -708 L 0 -688 L 12 -710 L 26 -684 Z', C.or, 7);
    h += mir(function (s2) { return P('M ' + (s2 * 196) + ' -508 L ' + (s2 * 226) + ' -494 L ' + (s2 * 204) + ' -478 L ' + (s2 * 226) + ' -462 L ' + (s2 * 200) + ' -448 Z', C.cr, 7); });
    h += P(HEAD, C.or, 0) + P(MASK, C.cr, 0) + P(HEAD, null, LW);
    h += mir(function (s2) { return P('M ' + (s2 * 150) + ' -456 L ' + (s2 * 244) + ' -476 M ' + (s2 * 154) + ' -440 L ' + (s2 * 250) + ' -440 M ' + (s2 * 150) + ' -424 L ' + (s2 * 240) + ' -404', null, 4); });
    if (o.blush) h += G({ id: id + '-blush' }, E(-128, -440, 28, 14, C.pk, 0, { opacity: 0.9 }) + E(128, -440, 28, 14, C.pk, 0, { opacity: 0.9 }));
    faces.forEach(function (f, i) { h += face(id, f, o.look, i === 0); });
    if (o.sweat) h += G({ id: id + '-sw' }, P('M -214 -630 Q -198 -606 -214 -594 Q -230 -606 -214 -630 Z', C.sweat, 5) + P('M 222 -584 Q 236 -562 222 -552 Q 208 -562 222 -584 Z', C.sweat, 5));
    if (o.hat === 'hard') h += P('M -176 -632 Q -176 -772 0 -776 Q 176 -772 176 -632 Z', '#ffd23f', LW) + P('M -214 -636 Q 0 -652 214 -636 L 214 -612 Q 0 -628 -214 -612 Z', '#ffd23f', 8) + P('M -20 -770 L -20 -640 M 20 -770 L 20 -640', null, 7);
    if (o.hat === 'cap') h += P('M -168 -630 Q -168 -760 0 -764 Q 168 -760 168 -630 Z', C.rest, LW) + P('M -170 -640 Q -40 -650 30 -640 Q 140 -650 240 -612 Q 150 -600 30 -616 L -170 -612 Z', C.rest, 8) + Ci(0, -762, 10, C.rest, 6);
    if (o.hat === 'toque') h += P('M -150 -628 L -158 -712 Q -246 -742 -214 -826 Q -182 -900 -96 -872 Q -40 -952 40 -900 Q 112 -944 176 -866 Q 246 -800 158 -712 L 150 -628 Q 0 -646 -150 -628 Z', C.w, LW) +
      P('M -156 -700 Q 0 -718 156 -700', null, 7) + P('M -70 -720 Q -84 -800 -60 -850 M 40 -722 Q 50 -800 30 -860', null, 5, { stroke: '#d9d4c8' });
    if (o.hat === 'noel') h += P('M -150 -690 C -140 -820 -40 -930 80 -930 C 170 -930 240 -890 262 -830 L 214 -812 C 190 -850 150 -860 120 -850 C 120 -800 140 -740 150 -690 Z', '#e0322b', LW) +
      P('M -172 -640 Q 0 -664 172 -640 L 170 -704 Q 0 -728 -170 -704 Z', C.w, LW) + Ci(258, -826, 44, C.w, LW);
    if (o.shades) h += G({ id: id + '-shades' }, P('M -132 -548 L 132 -548 L 124 -500 Q 80 -470 30 -500 L 18 -530 L -18 -530 L -30 -500 Q -80 -470 -124 -500 Z', C.k, 6) + P('M -110 -538 L -70 -538', null, 6, { stroke: '#666' }));
    var head = G({ transform: 'translate(0,-372)' }, G({ id: id + '-hd' }, G({ transform: 'translate(0,372)' }, h)));
    var arms = arm(id, -1, o.armL || {}) + arm(id, 1, o.armR || {});
    var body = o.armsBack ? arms + G({ id: id + '-bd' }, b) + head : G({ id: id + '-bd' }, b) + head + arms;
    return G({ transform: T(x, y, s, o.rot) + (o.flip ? ' scale(-1,1)' : '') }, G({ id: id }, body + (o.extra || '')));
  };
  // change d'expression (le visage visible est remplacé)
  A.face = function (tl, id, from, to, t) {
    tl.set('#' + id + '-' + from, { opacity: 0 }, t); tl.set('#' + id + '-' + to, { opacity: 1 }, t);
  };
  A.blink = function (tl, id, times) {
    times.forEach(function (t) {
      tl.fromTo('.bl-' + id, { scaleY: 1 }, { scaleY: 0.08, duration: 0.06, ease: 'none', immediateRender: false }, t);
      tl.fromTo('.bl-' + id, { scaleY: 0.08 }, { scaleY: 1, duration: 0.08, ease: 'none', immediateRender: false }, t + 0.06);
    });
  };
  // bouche qui parle, calée sur l'enveloppe de la voix (A.MOUTH = [[début, fin], ...] en secondes absolues)
  A.talk = function (tl, id, faceName, a, b, off) {
    var mc = '#' + id + '-' + faceName + '-mc', mo = '#' + id + '-' + faceName + '-mo';
    (A.MOUTH || []).forEach(function (m) {
      if (m[1] <= a || m[0] >= b) return;
      var t0 = Math.max(m[0], a) - off, t1 = Math.min(m[1], b) - off;
      tl.set(mo, { opacity: 1 }, t0); tl.set(mc, { opacity: 0 }, t0);
      tl.set(mo, { opacity: 0 }, t1); tl.set(mc, { opacity: 1 }, t1);
    });
  };
  // respiration / balancement doux, déterministe
  A.idle = function (tl, sel, d, amp, per, t0) {
    per = per || 1.6; amp = amp || 6;
    var n = Math.max(1, Math.ceil(d / per));
    tl.fromTo(sel, { y: 0 }, { y: -amp, duration: per / 2, ease: 'sine.inOut', yoyo: true, repeat: n * 2 - 1, immediateRender: false }, t0 || 0);
  };

  // ------------------------------------------------------------------ accessoires
  A.burger = function (x, y, s, bite) {
    var b = P('M -96 18 L 96 18 Q 96 56 70 58 L -70 58 Q -96 56 -96 18 Z', C.bun, 8) +
      R(-104, -10, 208, 32, 16, C.patty, 8) +
      P('M -102 -12 L 102 -12 L 86 6 L 60 -6 L 26 12 L -6 -4 L -40 12 L -72 -4 L -96 6 Z', C.cheese, 7) +
      P('M -110 -14 Q -96 -32 -80 -16 Q -64 -32 -48 -16 Q -32 -32 -16 -16 Q 0 -32 16 -16 Q 32 -32 48 -16 Q 64 -32 80 -16 Q 96 -32 110 -14 L 102 -28 L -102 -28 Z', C.lettuce, 7) +
      P('M -102 -24 Q -102 -112 0 -114 Q 102 -112 102 -24 Z', C.bun, 8) +
      E(-46, -70, 7, 4, C.w, 0, { transform: 'rotate(-20 -46 -70)' }) + E(-6, -88, 7, 4, C.w, 0) + E(36, -72, 7, 4, C.w, 0, { transform: 'rotate(20 36 -72)' }) + E(60, -52, 7, 4, C.w, 0) + E(-70, -46, 7, 4, C.w, 0);
    if (bite) b += Ci(96, -70, 34, bite, 0) + Ci(108, -24, 26, bite, 0) + P('M 76 -112 Q 58 -84 70 -58 Q 62 -40 80 -20 Q 76 0 86 18', null, 7);
    return G({ transform: T(x, y, s) }, b);
  };
  A.fries = function (x, y, s) {
    var f = '';
    [[-44, -112, -8], [-20, -128, -3], [4, -120, 4], [28, -132, 9], [46, -106, 14], [-32, -96, -14], [16, -100, 2]].forEach(function (q) {
      f += R(q[0] - 10, q[1], 20, 130, 4, C.fry, 6, { transform: 'rotate(' + q[2] + ' ' + q[0] + ' ' + (q[1] + 120) + ')' });
    });
    f += P('M -66 -20 L 66 -20 L 52 96 L -52 96 Z', C.w, 8) + P('M -40 -20 L -32 96 M 0 -20 L 0 96 M 40 -20 L 32 96', null, 14, { stroke: C.rest }) + P('M -66 -20 L 66 -20 L 52 96 L -52 96 Z', null, 8);
    return G({ transform: T(x, y, s) }, f);
  };
  A.tray = function (x, y, s, w) {
    w = w || 360;
    return G({ transform: T(x, y, s) }, R(-w / 2, -16, w, 32, 14, C.wood, 8) + R(-w / 2 + 26, -24, w - 52, 14, 4, C.w, 5));
  };
  A.coin = function (x, y, r, ex) {
    return G(Object.assign({ transform: T(x, y) }, ex || {}), Ci(0, 0, r, C.gold, Math.max(4, r * 0.16)) + Ci(0, 0, r * 0.66, null, Math.max(3, r * 0.1), { stroke: C.gold2 }) +
      P('M ' + (-r * 0.42) + ' ' + (-r * 0.2) + ' Q ' + (-r * 0.36) + ' ' + (-r * 0.4) + ' ' + (-r * 0.16) + ' ' + (-r * 0.46), null, Math.max(3, r * 0.12), { stroke: C.w }));
  };
  A.coinSide = function (x, y, r) { return G({ transform: T(x, y) }, R(-r, -r * 0.18, r * 2, r * 0.36, r * 0.16, C.gold2, Math.max(4, r * 0.14)) + E(0, -r * 0.18, r, r * 0.26, C.gold, Math.max(4, r * 0.14))); };
  A.coinPile = function (x, y, s, n) {
    var g = '', k = 0, rows = [5, 4, 3, 2, 1];
    for (var r = 0; r < rows.length && k < n; r++) for (var i = 0; i < rows[r] && k < n; i++, k++) g += A.coinSide((i - (rows[r] - 1) / 2) * 52, -r * 18, 26);
    return G({ transform: T(x, y, s) }, g);
  };
  A.bill = function (x, y, s, r, ex) {
    return G(Object.assign({ transform: T(x, y, s, r) }, ex || {}), R(-70, -36, 140, 72, 8, C.green, 7) + R(-54, -22, 108, 44, 6, null, 4, { stroke: C.green2 }) + Ci(0, 0, 14, '#9be0a5', 4, { stroke: C.green2 }));
  };
  A.stack = function (x, y, s) {   // liasse de billets
    return G({ transform: T(x, y, s) }, R(-80, -14, 160, 40, 8, C.green2, 7) + R(-80, -34, 160, 40, 8, C.green, 7) + R(-26, -36, 52, 44, 4, '#fff1c9', 5) + Ci(-50, -14, 9, '#9be0a5', 3, { stroke: C.green2 }) + Ci(50, -14, 9, '#9be0a5', 3, { stroke: C.green2 }));
  };
  A.bag = function (x, y, s) {   // gros sac d'argent
    return G({ transform: T(x, y, s) },
      A.bill(-56, -196, 0.7, -24) + A.bill(40, -206, 0.7, 18) + A.bill(-8, -220, 0.7, -4) +
      P('M -64 -176 Q -150 -110 -150 -10 Q -150 70 0 72 Q 150 70 150 -10 Q 150 -110 64 -176 Z', '#d9a663', LW) +
      P('M -72 -186 Q 0 -160 72 -186 L 64 -150 Q 0 -132 -64 -150 Z', '#c48b45', 8) + P('M -60 -40 Q -40 20 0 30', null, 6, { stroke: '#b07a38' }) +
      Ci(40, -30, 34, C.gold, 7) + Ci(40, -30, 22, null, 5, { stroke: C.gold2 }));
  };
  A.seed = function (x, y, s, r, ex) {
    return G(Object.assign({ transform: T(x, y, s, r) }, ex || {}), P('M 0 -24 Q 15 -4 0 24 Q -15 -4 0 -24 Z', '#2f2f35', 5) + P('M -4 -12 Q -6 2 -3 16 M 4 -12 Q 6 2 3 16', null, 3, { stroke: '#e9e9ee' }));
  };
  A.sparkle = function (x, y, s, ex) {
    return G(Object.assign({ transform: T(x, y, s) }, ex || {}), P('M 0 -40 Q 6 -6 40 0 Q 6 6 0 40 Q -6 6 -40 0 Q -6 -6 0 -40 Z', C.w, 6));
  };
  A.cloud = function (x, y, s) {
    return G({ transform: T(x, y, s) }, P('M -120 30 Q -150 30 -150 0 Q -150 -36 -110 -36 Q -100 -84 -46 -80 Q -20 -116 30 -100 Q 76 -110 90 -60 Q 150 -64 150 -10 Q 150 30 110 30 Z', C.w, 8));
  };
  A.sun = function (id, x, y, s) {
    var rays = '';
    for (var i = 0; i < 12; i++) rays += P('M 0 -120 L 0 -170', null, 14, { stroke: '#ffb300', transform: 'rotate(' + i * 30 + ')' });
    return G({ transform: T(x, y, s) }, G({ id: id }, rays) + Ci(0, 0, 92, '#ffd23f', LW));
  };
  // rayons tournants (fond « victoire »)
  A.rays = function (id, cx, cy, n, c1, c2) {
    var g = Ci(0, 0, 2200, c1, 0);
    for (var i = 0; i < n; i++) {
      var a0 = (i * 2) * Math.PI / n, a1 = (i * 2 + 1) * Math.PI / n;
      g += P('M 0 0 L ' + (2400 * Math.sin(a0)).toFixed(1) + ' ' + (-2400 * Math.cos(a0)).toFixed(1) + ' L ' + (2400 * Math.sin(a1)).toFixed(1) + ' ' + (-2400 * Math.cos(a1)).toFixed(1) + ' Z', c2, 0);
    }
    return G({ transform: T(cx, cy) }, G({ id: id }, g));
  };

  // ------------------------------------------------------------------ humains (vue de face), pieds en (0, 0), ~1000 de haut
  // o : skin, shirt, pants, hair, cap (couleur), hard (casque), w (largeur), arms 'down'|'out'|'cross'|'clip'|'hip', face 'smile'|'stern'|'happy', shades, tie, bald, vest
  A.person = function (id, x, y, s, o) {
    o = o || {};
    var sk = o.skin || '#f3c39b', sh = o.shirt || '#4c8dff', pa = o.pants || '#2f3a56', w = o.w || 300, g = '';
    var hw = w / 2;
    g += E(0, 6, hw + 40, 24, 'rgba(0,0,0,0.16)', 0);
    g += R(-hw * 0.62, -330, hw * 0.56, 320, 20, pa, LW) + R(hw * 0.06, -330, hw * 0.56, 320, 20, pa, LW);
    g += E(-hw * 0.36, -8, hw * 0.42, 26, C.k, 0) + E(hw * 0.36, -8, hw * 0.42, 26, C.k, 0);
    var torso = 'M ' + (-hw) + ' -560 Q ' + (-hw) + ' -660 ' + (-hw + 60) + ' -660 L ' + (hw - 60) + ' -660 Q ' + hw + ' -660 ' + hw + ' -560 L ' + (hw - 10) + ' -300 L ' + (-hw + 10) + ' -300 Z';
    var armS = function (sd) {
      var ax = sd * (hw - 18);
      if (o.arms === 'out') return P('M ' + ax + ' -630 Q ' + (ax + sd * 40) + ' -520 ' + (sd * (hw * 0.55)) + ' -470', null, 54, { stroke: C.k }) + P('M ' + ax + ' -630 Q ' + (ax + sd * 40) + ' -520 ' + (sd * (hw * 0.55)) + ' -470', null, 38, { stroke: sh }) +
        E(sd * hw * 0.5, -474, 46, 26, sk, 8) + P('M ' + (sd * hw * 0.5 - 30) + ' -488 Q ' + (sd * hw * 0.5) + ' -470 ' + (sd * hw * 0.5 + 30) + ' -488', null, 5);
      if (o.arms === 'hip') return P('M ' + ax + ' -630 L ' + (ax + sd * 70) + ' -500 L ' + (sd * (hw - 30)) + ' -400', null, 54, { stroke: C.k }) + P('M ' + ax + ' -630 L ' + (ax + sd * 70) + ' -500 L ' + (sd * (hw - 30)) + ' -400', null, 38, { stroke: sh }) + Ci(sd * (hw - 26), -398, 28, sk, 8);
      return P('M ' + ax + ' -630 Q ' + (ax + sd * 34) + ' -500 ' + (ax + sd * 14) + ' -380', null, 54, { stroke: C.k }) + P('M ' + ax + ' -630 Q ' + (ax + sd * 34) + ' -500 ' + (ax + sd * 14) + ' -380', null, 38, { stroke: sh }) + Ci(ax + sd * 14, -364, 30, sk, 8);
    };
    var arms = o.arms === 'cross' ? '' : (o.arms === 'clip' ? armS(-1) : armS(-1) + armS(1));
    g += P(torso, sh, LW);
    if (o.vest) g += P('M ' + (-hw + 20) + ' -640 L -40 -640 L -40 -310 L ' + (-hw + 18) + ' -310 Z', o.vest, 7) + P('M ' + (hw - 20) + ' -640 L 40 -640 L 40 -310 L ' + (hw - 18) + ' -310 Z', o.vest, 7) +
      P('M ' + (-hw + 22) + ' -420 L -40 -420 M ' + (hw - 22) + ' -420 L 40 -420', null, 14, { stroke: '#e8f0f0' });
    if (o.tie) g += P('M -44 -660 L 0 -560 L 44 -660 Z', C.w, 6) + P('M -10 -650 L 10 -650 L 18 -560 L 0 -540 L -18 -560 Z', o.tie, 6);
    if (o.collar) g += P('M -50 -662 L 0 -626 L 50 -662', null, 7);
    g += arms;
    if (o.arms === 'cross') g += P('M ' + (-hw + 6) + ' -560 Q 0 -500 ' + (hw - 6) + ' -560 L ' + (hw - 10) + ' -470 Q 0 -420 ' + (-hw + 10) + ' -470 Z', sh, LW) +
      Ci(-hw * 0.5, -500, 34, sk, 8) + Ci(hw * 0.5, -500, 34, sk, 8);
    if (o.arms === 'clip') g += A.clipboard(hw * 0.2, -500, 1) + P('M ' + (hw - 18) + ' -630 Q ' + (hw + 10) + ' -520 ' + (hw * 0.5) + ' -470', null, 54, { stroke: C.k }) +
      P('M ' + (hw - 18) + ' -630 Q ' + (hw + 10) + ' -520 ' + (hw * 0.5) + ' -470', null, 38, { stroke: sh }) + Ci(hw * 0.46, -468, 28, sk, 8);
    // tête
    var hy = -790, hr = o.hr || 118, f = '';
    f += R(-34, -700, 68, 60, 10, sk, 8);
    f += Ci(0, hy, hr, sk, LW) + Ci(-hr, hy + 10, 22, sk, 8) + Ci(hr, hy + 10, 22, sk, 8) + Ci(0, hy, hr, sk, 0);
    if (!o.bald && !o.cap && !o.hard) f += P('M ' + (-hr - 4) + ' ' + (hy + 6) + ' Q ' + (-hr - 6) + ' ' + (hy - hr - 20) + ' 0 ' + (hy - hr - 14) + ' Q ' + (hr + 6) + ' ' + (hy - hr - 20) + ' ' + (hr + 4) + ' ' + (hy + 6) + ' Q ' + (hr - 20) + ' ' + (hy - 60) + ' ' + (hr * 0.3) + ' ' + (hy - 64) + ' Q 0 ' + (hy - 40) + ' ' + (-hr * 0.5) + ' ' + (hy - 66) + ' Q ' + (-hr + 20) + ' ' + (hy - 50) + ' ' + (-hr - 4) + ' ' + (hy + 6) + ' Z', o.hair || '#4a2c1a', 8);
    if (o.cap) f += P('M ' + (-hr + 4) + ' ' + (hy - 44) + ' Q ' + (-hr + 6) + ' ' + (hy - hr - 34) + ' 0 ' + (hy - hr - 34) + ' Q ' + (hr - 6) + ' ' + (hy - hr - 34) + ' ' + (hr - 4) + ' ' + (hy - 44) + ' Z', o.cap, 8) +
      P('M ' + (-hr + 2) + ' ' + (hy - 52) + ' L ' + (hr + 60) + ' ' + (hy - 52) + ' Q ' + (hr + 62) + ' ' + (hy - 32) + ' ' + (hr + 8) + ' ' + (hy - 34) + ' L ' + (-hr + 2) + ' ' + (hy - 34) + ' Z', o.cap, 8);
    if (o.hard) f += P('M ' + (-hr - 6) + ' ' + (hy - 30) + ' Q ' + (-hr) + ' ' + (hy - hr - 40) + ' 0 ' + (hy - hr - 44) + ' Q ' + hr + ' ' + (hy - hr - 40) + ' ' + (hr + 6) + ' ' + (hy - 30) + ' Z', '#ffd23f', 8) + R(-hr - 30, hy - 40, hr * 2 + 60, 22, 10, '#ffd23f', 7);
    var fy = hy + 10;
    if (o.shades) f += P('M -92 ' + (fy - 34) + ' L 92 ' + (fy - 34) + ' L 84 ' + (fy + 4) + ' Q 50 ' + (fy + 22) + ' 14 ' + (fy + 2) + ' L 10 ' + (fy - 16) + ' L -10 ' + (fy - 16) + ' L -14 ' + (fy + 2) + ' Q -50 ' + (fy + 22) + ' -84 ' + (fy + 4) + ' Z', C.k, 6);
    else if (o.face === 'happy') f += P('M -64 ' + (fy - 8) + ' Q -42 ' + (fy - 34) + ' -20 ' + (fy - 8) + ' M 20 ' + (fy - 8) + ' Q 42 ' + (fy - 34) + ' 64 ' + (fy - 8), null, 9);
    else f += Ci(-42, fy - 14, 13, C.k, 0) + Ci(42, fy - 14, 13, C.k, 0) + Ci(-38, fy - 18, 4, C.w, 0) + Ci(46, fy - 18, 4, C.w, 0);
    if (o.face === 'stern') f += P('M -66 ' + (fy - 52) + ' L -20 ' + (fy - 38) + ' M 66 ' + (fy - 52) + ' L 20 ' + (fy - 38), null, 10) + P('M -36 ' + (fy + 56) + ' L 36 ' + (fy + 56), null, 8);
    else if (o.face === 'happy') f += P('M -46 ' + (fy + 34) + ' Q 0 ' + (fy + 40) + ' 46 ' + (fy + 34) + ' Q 40 ' + (fy + 90) + ' 0 ' + (fy + 92) + ' Q -40 ' + (fy + 90) + ' -46 ' + (fy + 34) + ' Z', C.mouth, 7) + P('M -30 ' + (fy + 36) + ' L 30 ' + (fy + 36) + ' L 26 ' + (fy + 52) + ' L -26 ' + (fy + 52) + ' Z', C.w, 0);
    else f += P('M -40 ' + (fy + 40) + ' Q 0 ' + (fy + 74) + ' 40 ' + (fy + 40), null, 8);
    f += P('M -8 ' + (fy + 6) + ' Q 0 ' + (fy + 24) + ' 10 ' + (fy + 14), null, 6);
    if (o.mous) f += P('M -50 ' + (fy + 34) + ' Q 0 ' + (fy + 10) + ' 50 ' + (fy + 34) + ' Q 0 ' + (fy + 26) + ' -50 ' + (fy + 34) + ' Z', o.hair || '#4a2c1a', 6);
    g += G({ transform: 'translate(0,' + (hy + 90) + ')' }, G({ id: id + '-hd' }, G({ transform: 'translate(0,' + (-hy - 90) + ')' }, f)));
    return G({ transform: T(x, y, s) + (o.flip ? ' scale(-1,1)' : '') }, G({ id: id }, g + (o.extra || '')));
  };
  A.clipboard = function (x, y, s) {
    return G({ transform: T(x, y, s) }, R(-70, -96, 140, 190, 12, C.wood, 8) + R(-56, -76, 112, 160, 6, C.w, 6) + R(-30, -106, 60, 30, 8, C.steel2, 6) +
      P('M -38 -40 L 38 -40 M -38 -10 L 38 -10 M -38 20 L 20 20 M -38 50 L 30 50', null, 5, { stroke: '#9aa5b1' }));
  };
  // tête + épaules (foules)
  A.bust = function (id, x, y, s, o) {
    o = o || {};
    var sk = o.skin || '#f3c39b', sh = o.shirt || C.rest, g = '';
    g += P('M -120 120 Q -120 30 -60 26 L 60 26 Q 120 30 120 120 Z', sh, 8);
    g += Ci(0, -40, 74, sk, 8);
    if (o.cap) g += P('M -76 -50 Q -76 -128 0 -128 Q 76 -128 76 -50 Z', o.cap, 7) + P('M -80 -54 L 112 -54 Q 112 -36 70 -38 L -80 -38 Z', o.cap, 7);
    else g += P('M -76 -36 Q -80 -124 0 -120 Q 80 -124 76 -36 Q 60 -80 0 -84 Q -60 -80 -76 -36 Z', o.hair || '#3b2414', 7);
    g += Ci(-26, -30, 9, C.k, 0) + Ci(26, -30, 9, C.k, 0) + P('M -30 2 Q 0 28 30 2', null, 7);
    if (o.hands) g += E(-96, 70, 32, 20, sk, 7) + E(96, 70, 32, 20, sk, 7);
    return G({ transform: T(x, y, s) }, G({ id: id }, g));
  };
})();
