// « Combien ça rapporte d'être propriétaire d'une machine à pince ? » — série « business pas très éthique (mais légal) ».
// Même format que la vidéo McDo courte : fond clair et ligne de sol, gros chiffres (rouge = dépense, vert = gain),
// étiquettes manuscrites, plans « réaction » sur fond rayonnant. La machine à pince est animée (pince, ampoules).
(function () {
  var A = window.ART, C = A.C, P = A.P, E = A.E, Ci = A.Ci, R = A.R, G = A.G, T = A.T, el = A.el, LW = A.LW;
  var S = A.SCENES = {};
  var ft = function (tl, t, a, b, at) { A.ft(tl, t, a, b, at); };
  var BG = '#fffaf0', RED = '#ff3b30', GRN = '#2fbf4a', BLU = '#2f8cff', PNK = '#ff4fa8', YEL = '#ffe14d', ORA = '#ff8a1f';
  var GY = 1440;    // ligne de sol
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };

  // ------------------------------------------------------------------ éléments graphiques du format
  var bg = function (c) { return R(-300, -300, 1680, 2520, 0, c || BG, 0); };
  var ground = function (c) {
    return R(-300, GY, 1680, 900, 0, c || '#f4ecdc', 0) + P('M -40 ' + GY + ' Q 200 ' + (GY - 7) + ' 420 ' + (GY + 2) + ' T 820 ' + (GY - 3) + ' T 1120 ' + (GY + 1), null, 8);
  };
  var burst = function (id, c1, c2, cx, cy) { return A.rays(id, cx || 540, cy || 1000, 16, c1, c2); };
  // gros chiffre centré en (x, y) ; l'élément animable « id » a son pivot au centre
  var NUM = function (id, x, y, txt, col, fs, rot) {
    fs = fs || 150;
    return G({ transform: T(x, y, 1, rot || 0) }, G(id, el('text', { x: 0, y: 0, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Luckiest Guy', 'font-size': fs,
      fill: col, stroke: '#111111', 'stroke-width': Math.round(fs * 0.1), 'stroke-linejoin': 'round', 'paint-order': 'stroke' }, esc(txt))));
  };
  // étiquette manuscrite (feutre), sans contour, petit halo blanc pour rester lisible
  var LAB = function (id, x, y, txt, col, fs, rot) {
    fs = fs || 64;
    return G({ transform: T(x, y, 1, rot || 0) }, G(id, el('text', { x: 0, y: 0, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Patrick Hand', 'font-size': fs,
      fill: col || '#222222', stroke: '#ffffff', 'stroke-width': 10, 'stroke-linejoin': 'round', 'paint-order': 'stroke' }, esc(txt))));
  };
  // pancarte : cadre blanc bordé de noir, texte coloré
  var TAG = function (id, x, y, txt, col, fs, rot) {
    fs = fs || 70; var w = Math.round(txt.length * fs * 0.6 + 50), h = Math.round(fs * 1.35);
    return G({ transform: T(x, y, 1, rot == null ? -4 : rot) }, G(id, R(-w / 2, -h / 2, w, h, 10, '#ffffff', 7) +
      el('text', { x: 0, y: 4, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Luckiest Guy', 'font-size': fs, fill: col || '#111111' }, esc(txt))));
  };
  var STAMP = function (id, x, y, txt, col, rot) {
    var fs = 84, w = Math.round(txt.length * fs * 0.62 + 60);
    return G({ transform: T(x, y, 1, rot == null ? -9 : rot) }, G(id, R(-w / 2, -62, w, 124, 14, 'rgba(255,255,255,0.85)', 0) + R(-w / 2, -62, w, 124, 14, null, 12, { stroke: col }) +
      el('text', { x: 0, y: 6, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Luckiest Guy', 'font-size': fs, fill: col }, esc(txt))));
  };
  var CROSS = function (id, x, y, s) {
    var d = 'M -100 -100 L 100 100 M 100 -100 L -100 100';
    return G({ transform: T(x, y, s || 1) }, G(id, P(d, null, 46, { stroke: '#111111' }) + P(d, null, 30, { stroke: RED })));
  };
  var CHECK = function (id, x, y, s) {
    var d = 'M -90 0 L -26 64 L 100 -80';
    return G({ transform: T(x, y, s || 1) }, G(id, P(d, null, 46, { stroke: '#111111' }) + P(d, null, 30, { stroke: GRN })));
  };
  var ARROW = function (id, x1, y1, x2, y2, col) {
    var a = Math.atan2(y2 - y1, x2 - x1), hx = 34;
    var h = 'M ' + (x2 - hx * Math.cos(a - 0.5)).toFixed(0) + ' ' + (y2 - hx * Math.sin(a - 0.5)).toFixed(0) + ' L ' + x2 + ' ' + y2 + ' L ' + (x2 - hx * Math.cos(a + 0.5)).toFixed(0) + ' ' + (y2 - hx * Math.sin(a + 0.5)).toFixed(0);
    return G(id, P('M ' + x1 + ' ' + y1 + ' Q ' + ((x1 + x2) / 2 + 20) + ' ' + ((y1 + y2) / 2 - 30) + ' ' + x2 + ' ' + y2 + ' ' + h, null, 7, { stroke: col || '#222' }));
  };
  var pop = function (tl, sel, t, s0) {
    gsap.set(sel, { scale: s0 == null ? 0 : s0, opacity: 0 });
    ft(tl, sel, { scale: s0 == null ? 0 : s0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2.6)' }, t);
  };
  var out = function (tl, sel, t) { ft(tl, sel, { opacity: 1 }, { opacity: 0, duration: 0.15, ease: 'none' }, t); };
  var wob = function (tl, sel, t, d) { ft(tl, sel, { rotation: -3 }, { rotation: 3, duration: 0.35, ease: 'sine.inOut', yoyo: true, repeat: Math.max(1, Math.ceil(d / 0.35)) }, t); };
  var ham = function (id, x, s, o) { return A.hamster(id, x, GY + 14, s || 0.62, o); };
  var talk = function (tl, id, face, a, b) { if (A.FACES[face][3]) A.talk(tl, id, face, a, b, 0); A.blink(tl, id, [a + 0.9, a + 2.6, a + 4.2].filter(function (t) { return t < b - 0.2; })); };


  // ------------------------------------------------------------------ objets
  var PLC = ['#ff6fb5', '#6fc3ff', '#ffd23f', '#8be07a', '#c69cff', '#ff9a4d'];
  // peluche (ourson) centrée en (x, y)
  var plush = function (x, y, s, c, r, ex) {
    return G(Object.assign({ transform: T(x, y, s, r || 0) }, ex || {}), Ci(-30, -34, 18, c, 6) + Ci(30, -34, 18, c, 6) + Ci(0, 0, 44, c, 7) + E(0, 14, 20, 15, '#fff4e0', 0) +
      Ci(-15, -6, 5, C.k, 0) + Ci(15, -6, 5, C.k, 0) + E(0, 8, 6, 4, C.k, 0) + P('M -7 18 Q 0 24 7 18', null, 4));
  };
  // machine à pince : posée au sol en (0, 0) ; pièces animables : -cl (chariot, x), -cb (câble, scaleY), -hd (tête, y), -fl / -fr (doigts), -pl (peluche tenue)
  var machine = function (id, x, y, s, o) {
    o = o || {};
    var g = '', cab = o.c || '#8e5bd8', r = A.rnd(o.seed || 3);
    g += E(0, 6, 300, 26, 'rgba(0,0,0,0.14)', 0);
    g += R(-260, -500, 520, 500, 18, cab, LW) + R(-230, -470, 460, 70, 12, '#6c3fb8', 7);
    g += R(-200, -380, 150, 130, 12, '#2b2b33', LW) + R(-190, -300, 130, 40, 6, '#4a4f58', 0);
    g += R(110, -380, 80, 120, 12, '#d9dde3', LW) + R(140, -360, 20, 70, 6, '#2b2b33', 0);
    g += R(-40, -460, 110, 46, 10, '#3b3b44', 6) + R(-6, -540, 12, 70, 6, '#3b3b44', 0) + Ci(0, -548, 20, C.red, 6) + Ci(40, -440, 14, '#ffd23f', 5);
    var inside = R(-240, -1120, 480, 620, 0, '#e8f6ff', 0);
    for (var i = 0; i < (o.n || 26); i++) inside += plush(Math.round(-200 + r() * 400), Math.round(-540 - r() * 70 - (i > 16 ? 50 : 0)), 0.8 + r() * 0.2, PLC[i % PLC.length], Math.round((r() - 0.5) * 40));
    g += el('defs', {}, el('clipPath', { id: id + '-clip' }, R(-240, -1120, 480, 620, 0, '#fff', 0))) + G({ 'clip-path': 'url(#' + id + '-clip)' }, G({ id: id + '-in' }, inside));
    g += R(-250, -1130, 500, 640, 10, 'none', LW) + R(-240, -1120, 480, 18, 0, '#cfd6de', 0);
    // pince
    var claw = G({ transform: T(0, 0) }, G({ id: id + '-cb' }, R(-3, 0, 6, 100, 0, '#3b3b44', 0))) +
      G({ transform: T(0, o.L || 160) }, G({ id: id + '-hd' }, (o.hold ? G({ id: id + '-pl' }, plush(0, 70, 0.9, PLC[1])) : '') +
        R(-28, -20, 56, 40, 10, '#9aa5b1', 6) +
        G({ transform: T(-20, 16) }, G({ id: id + '-fl' }, P('M 0 0 Q -34 30 -18 70 L -6 64 Q -16 34 10 8 Z', '#cfd6de', 5))) +
        G({ transform: T(20, 16) }, G({ id: id + '-fr' }, P('M 0 0 Q 34 30 18 70 L 6 64 Q 16 34 -10 8 Z', '#cfd6de', 5)))));
    g += G({ transform: T(0, -1100) }, G({ id: id + '-cl' }, R(-40, -16, 80, 24, 8, '#6b7280', 6) + claw));
    g += P('M -240 -1100 L 240 -1100', null, 6, { stroke: '#6b7280' });
    // fronton et ampoules
    g += R(-270, -1290, 540, 170, 24, cab, LW) + R(-230, -1260, 460, 110, 16, '#ffd1ec', 7) + plush(0, -1205, 0.9, '#ff6fb5');
    var bulbs = '';
    for (var k = 0; k < 9; k++) bulbs += Ci(-240 + k * 60, -1300, 12, k % 2 ? '#ffd23f' : '#fff3b0', 5, { id: id + '-b' + k, class: k % 2 ? 'blo' : 'ble' });
    g += bulbs;
    return G({ transform: T(x, y, s) }, G(id, g));
  };
  // la pince descend, attrape, remonte et lâche (au-dessus de la pile)
  var grab = function (tl, id, t, drop) {
    gsap.set('#' + id + '-pl', { opacity: 0 });
    ft(tl, '#' + id + '-cb', { scaleY: 1.6 }, { scaleY: 4.1, duration: 0.45, ease: 'power1.inOut' }, t);
    ft(tl, '#' + id + '-hd', { y: 0 }, { y: 250, duration: 0.45, ease: 'power1.inOut' }, t);
    ft(tl, '#' + id + '-fl', { rotation: 18 }, { rotation: -8, duration: 0.15, ease: 'none' }, t + 0.45);
    ft(tl, '#' + id + '-fr', { rotation: -18 }, { rotation: 8, duration: 0.15, ease: 'none' }, t + 0.45);
    tl.set('#' + id + '-pl', { opacity: 1, y: 0 }, t + 0.5);
    ft(tl, '#' + id + '-cb', { scaleY: 4.1 }, { scaleY: 1.6, duration: 0.5, ease: 'power1.inOut' }, t + 0.62);
    ft(tl, '#' + id + '-hd', { y: 250 }, { y: 0, duration: 0.5, ease: 'power1.inOut' }, t + 0.62);
    if (drop) {
      ft(tl, '#' + id + '-fl', { rotation: -8 }, { rotation: 22, duration: 0.12, ease: 'none' }, t + drop);
      ft(tl, '#' + id + '-fr', { rotation: 8 }, { rotation: -22, duration: 0.12, ease: 'none' }, t + drop);
      ft(tl, '#' + id + '-pl', { y: 0, rotation: 0 }, { y: 330, rotation: 40, duration: 0.45, ease: 'bounce.out' }, t + drop);
    }
  };
  var bulbs = function (tl, id, a, b) {
    for (var k = 0; k < 9; k++) ft(tl, '#' + id + '-b' + k, { opacity: 1 }, { opacity: 0.25, duration: 0.18, ease: 'none', yoyo: true, repeat: Math.ceil((b - a) / 0.18) }, a + (k % 2) * 0.18);
  };
  var setClaw = function (id) { A.set('#' + id + '-cb', { scaleY: 1.6 }); A.set('#' + id + '-fl', { rotation: 18 }); A.set('#' + id + '-fr', { rotation: -18 }); };
  var bills = function (pre, n, x, y) { var s = ''; for (var i = 0; i < n; i++) s += G({ transform: T(x, y) }, G(pre + i, A.bill(0, 0, 0.7, 0))); return s; };
  var rain = function (tl, pre, n, a, b, seed) {
    var r = A.rnd(seed || 9), d = b - a;
    for (var k = 0; k < n; k++) {
      var t0 = a + k * (d / n) * 0.9, side = k % 2 ? 1 : -1, yTop = -620 - r() * 280;
      gsap.set('#' + pre + k, { opacity: 0 });
      ft(tl, '#' + pre + k, { x: side * 60, y: 0, rotation: 0, opacity: 1 }, { x: side * (120 + r() * 380), y: yTop, rotation: side * 160, duration: 0.55, ease: 'power2.out' }, t0);
      ft(tl, '#' + pre + k, { y: yTop, rotation: side * 160 }, { y: 1100, rotation: side * 720, duration: 2.2 + r() * 0.8, ease: 'power1.in' }, t0 + 0.55);
    }
  };
  var watch = G({}, R(-34, -120, 68, 240, 18, C.gold, 7) + Ci(0, 0, 70, C.gold, LW) + Ci(0, 0, 52, '#fffaf0', 6) + P('M 0 0 L 0 -34 M 0 0 L 24 10', null, 6) + Ci(0, 0, 6, C.k, 0) + A.sparkle(70, -70, 0.5));
  var screen = function (id, x, y, s) {
    return G({ transform: T(x, y, s) }, G(id, R(-210, -120, 420, 240, 18, '#3b3b44', LW) + R(-180, -92, 360, 184, 10, '#10261a', 6) +
      el('text', { x: 0, y: -36, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Luckiest Guy', 'font-size': 46, fill: '#7dff9a' }, 'RÉGLAGE GAIN') +
      el('text', { x: 0, y: 34, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Luckiest Guy', 'font-size': 84, fill: '#7dff9a' }, '1 / 30') +
      Ci(250, 0, 44, '#9aa5b1', LW) + G({ transform: T(250, 0) }, G(id + '-k', P('M 0 0 L 0 -36', null, 9)))));
  };

  // ================================================================ 1 · accroche : la pince lâche la peluche
  S[1] = {
    cam: [[540, 1000, 1.12, 1.0]],
    svg: function () {
      A.set('#m1-cb', { scaleY: 1.6 }); A.set('#m1-fl', { rotation: -8 }); A.set('#m1-fr', { rotation: 8 }); A.set('#m1-cl', { x: 120 });
      var g = bg('#2b1d4a');
      for (var i = 0; i < 40; i++) g += Ci(Math.round((i * 137) % 1080), Math.round((i * 271) % 1920), 3 + (i % 3), '#5c4a8a', 0);
      g += machine('m1', 540, 1640, 1.0, { hold: 1, c: '#ff4fa8' });
      g += A.hamster('h1', 900, 1700, 0.62, { faces: ['smile', 'shock'], armL: { a: 30 }, armR: { a: 14 } });
      g += NUM('t1', 540, 250, 'TU GAGNERAS JAMAIS', YEL, 90, -3) + STAMP('t2', 540, 470, "C'EST FAIT EXPRÈS", RED, -6);
      return g;
    },
    anim: function (tl, a, b, K) {
      bulbs(tl, 'm1', a, b);
      ft(tl, '#m1-cl', { x: 120 }, { x: -60, duration: 0.8, ease: 'power1.inOut' }, a);
      ft(tl, '#m1-fl', { rotation: -8 }, { rotation: 22, duration: 0.12, ease: 'none' }, a + 0.85);
      ft(tl, '#m1-fr', { rotation: 8 }, { rotation: -22, duration: 0.12, ease: 'none' }, a + 0.85);
      ft(tl, '#m1-pl', { y: 0, rotation: 0 }, { y: 330, rotation: 50, duration: 0.5, ease: 'bounce.out' }, a + 0.85);
      pop(tl, '#t1', a, 0.6);
      A.face(tl, 'h1', 'smile', 'shock', a + 0.85);
      ft(tl, '#h1', { y: 0 }, { y: -40, duration: 0.12, ease: 'power2.out', yoyo: true, repeat: 1 }, a + 0.85);
      gsap.set('#t2', { opacity: 0 }); ft(tl, '#t2', { opacity: 0, scale: 2.4 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'power3.in' }, K('fait exprès', a));
    }
  };

  // ================================================================ 2 · titre
  S[2] = {
    cam: [[540, 1000, 1.0, 1.05]],
    svg: function () {
      setClaw('m2');
      var g = bg() + ground();
      g += machine('m2', 560, GY + 10, 0.72, { c: '#8e5bd8' });
      g += ham('h2', 200, 0.6, { faces: ['happy'], armR: { a: 80, hand: 'point' } });
      g += NUM('s2-t1', 540, 300, 'COMBIEN ÇA RAPPORTE', YEL, 92, -2) + NUM('s2-t2', 540, 420, "D'ÊTRE PROPRIÉTAIRE", '#ffffff', 92, -2) +
        G({ transform: T(540, 600, 1, -3) }, G('s2-t3', NUM('', 0, 0, "D'UNE MACHINE", PNK, 124, 0) + NUM('', 0, 140, 'À PINCE ?', BLU, 150, 0)));
      return g;
    },
    anim: function (tl, a, b, K) {
      bulbs(tl, 'm2', a, b);
      pop(tl, '#s2-t1', a, 0.5); pop(tl, '#s2-t2', K("d'être", a), 0.5); pop(tl, '#s2-t3', K("d'une", a), 0.4);
      talk(tl, 'h2', 'happy', a, b);
    }
  };

  // ================================================================ 3 · la machine 4 000 €, 150 peluches à 1 €
  S[3] = {
    cam: [[540, 1000, 1.0, 1.05]],
    svg: function () {
      setClaw('m3');
      var g = bg() + ground();
      g += machine('m3', 400, GY + 10, 0.68, { c: '#8e5bd8' });
      g += TAG('s3-p', 400, 520, '4 000 €', RED, 90, -5);
      var box = R(-160, -150, 320, 150, 10, '#d9a663', LW) + P('M -160 -150 L -120 -200 L 120 -200 L 160 -150', '#c48b45', 7);
      for (var i = 0; i < 7; i++) box += plush(-120 + i * 40, -175 - (i % 2) * 20, 0.6, PLC[i % PLC.length], (i - 3) * 8);
      g += G({ transform: T(840, GY) }, G('s3-box', box));
      g += LAB('s3-l1', 840, 1090, '150 peluches', BLU, 62, -3) + TAG('s3-t', 840, 980, '1 € PIÈCE', RED, 54, 4);
      return g;
    },
    anim: function (tl, a, b, K) {
      bulbs(tl, 'm3', a, b);
      pop(tl, '#s3-p', K('4 000', a)); pop(tl, '#s3-box', K('150', a) - 0.1); pop(tl, '#s3-l1', K('150', a) + 0.1, 0.5); pop(tl, '#s3-t', K('1 euro', a));
    }
  };

  // ================================================================ 4 · dans un bar / bowling : le patron prend 30 %
  S[4] = {
    cam: [[540, 1000, 1.0, 1.05]],
    svg: function () {
      setClaw('m4');
      var g = bg('#2b1d4a') + R(-300, GY, 1680, 900, 0, '#3b2a5c', 0) + P('M -40 ' + GY + ' L 1120 ' + GY, null, 8);
      for (var i = 0; i < 5; i++) g += G({ transform: T(140 + i * 46, 1010) }, P('M 0 -110 Q 20 -110 18 -70 Q 14 -40 24 -10 Q 30 30 0 34 Q -30 30 -24 -10 Q -14 -40 -18 -70 Q -20 -110 0 -110 Z', '#ffffff', 6) + R(-16, -76, 32, 10, 0, C.red, 0));
      g += Ci(180, 1220, 70, '#2f8cff', LW) + Ci(160, 1200, 10, C.k, 0) + Ci(196, 1196, 10, C.k, 0) + Ci(180, 1228, 10, C.k, 0);
      g += R(620, 420, 400, 110, 20, '#ff4fa8', LW) + el('text', { x: 820, y: 481, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Luckiest Guy', 'font-size': 84, fill: '#ffffff' }, 'BOWLING');
      g += machine('m4', 760, GY + 10, 0.56, { c: '#ff9a4d' });
      g += A.person('s4-pt', 300, GY + 20, 0.82, { shirt: '#1d1d24', pants: '#2a3348', arms: 'hip', face: 'stern', skin: '#e2ad84', hair: '#111', mous: 1 });
      g += LAB('s4-l0', 300, 650, 'le patron', '#ffd23f', 64, -3);
      g += TAG('s4-t', 330, 410, '−30 %', RED, 110, -6) + LAB('s4-l1', 330, 540, 'place + électricité', '#ffffff', 56, 2);
      return g;
    },
    anim: function (tl, a, b, K) {
      bulbs(tl, 'm4', a, b);
      pop(tl, '#s4-l0', K('patron', a), 0.5); pop(tl, '#s4-t', K('30', a)); pop(tl, '#s4-l1', K('pour la place', a), 0.5);
      ft(tl, '#s4-pt-hd', { rotation: -4 }, { rotation: 4, duration: 0.4, ease: 'sine.inOut', yoyo: true, repeat: 7 }, a);
    }
  };

  // ================================================================ 5 · les clients : 2 € la partie, 60 parties par jour → 3 600 € par mois
  S[5] = {
    cam: [[540, 1000, 1.0, 1.05]],
    svg: function () {
      setClaw('m5');
      var g = bg() + ground();
      g += machine('m5', 260, GY + 10, 0.58, { c: '#8e5bd8' });
      var cols = [C.red, BLU, '#8e5bd8', C.green, '#ffb03a', PNK];
      for (var i = 0; i < 5; i++) g += A.person('s5-c' + i, 520 + i * 125, GY + 20, 0.44, { shirt: cols[i], skin: ['#f3c39b', '#c98b5e', '#e2ad84'][i % 3], hair: ['#3b2414', '#111', '#d9a04a'][i % 3], face: 'happy' });
      g += A.coin(470, 1060, 34) + TAG('s5-t1', 300, 760, '2 € / PARTIE', BLU, 56, -4) + TAG('s5-t2', 800, 760, '60 PARTIES / JOUR', BLU, 46, 4);
      g += NUM('s5-n', 540, 560, '3 600 € / MOIS', GRN, 120, -2);
      return g;
    },
    anim: function (tl, a, b, K) {
      bulbs(tl, 'm5', a, b);
      for (var i = 0; i < 5; i++) ft(tl, '#s5-c' + i, { y: 0 }, { y: -12, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((b - a) / 0.3) }, a + i * 0.06);
      grab(tl, 'm5', a + 0.4, 1.3); grab(tl, 'm5', a + 2.6, 1.3);
      pop(tl, '#s5-t1', K('2 euros', a)); pop(tl, '#s5-t2', K('60', a)); pop(tl, '#s5-n', K('3 600', a));
    }
  };

  // ================================================================ 6 · « 3 600 ! Je m'achète une montre en or »
  S[6] = {
    cam: [[540, 1100, 1.0, 1.08]],
    svg: function () {
      var g = burst('s6-ray', '#fff0a8', '#fffbe6', 540, 1200);
      g += A.hamster('h6', 540, 1900, 1.0, { faces: ['grin'], shades: 1, armL: { a: 140, hand: 'open' }, armR: { a: 150, item: watch, itemRot: 150 } });
      g += bills('s6-b', 14, 540, 1150);
      g += NUM('s6-n', 540, 560, '3 600 €', GRN, 170, -4) + LAB('s6-l', 300, 860, 'montre en or !', BLU, 70, -6);
      return g;
    },
    anim: function (tl, a, b, K) {
      ft(tl, '#s6-ray', { rotation: 0 }, { rotation: 30, duration: b - a + 0.2, ease: 'none' }, a);
      pop(tl, '#s6-n', a + 0.05); pop(tl, '#s6-l', K('montre', a), 0.5);
      ft(tl, '#h6-aR', { rotation: -150 }, { rotation: -160, duration: 0.25, ease: 'sine.inOut', yoyo: true, repeat: 11 }, a);
      rain(tl, 's6-b', 14, a, b, 31);
    }
  };

  // ================================================================ 7 · « Attends » : si tout le monde gagnait, la machine serait vide en 3 jours
  S[7] = {
    cam: [[540, 1000, 1.0, 1.05]],
    svg: function () {
      setClaw('m7');
      var g = bg() + ground();
      g += machine('m7', 380, GY + 10, 0.66, { c: '#8e5bd8' });
      var fl = '';
      for (var i = 0; i < 12; i++) fl += G({ transform: T(330, 1260) }, G('s7-p' + i, plush(0, 0, 0.9, PLC[i % PLC.length])));
      g += fl;
      g += A.hamster('h7', 880, GY + 14, 0.6, { faces: ['shock'], sweat: 1, armL: { a: 160 }, armR: { a: 160 } });
      g += TAG('s7-t1', 760, 640, '60 PELUCHES / JOUR', RED, 50, 4) + NUM('s7-n', 560, 480, 'VIDE EN 3 JOURS', RED, 104, -3);
      return g;
    },
    anim: function (tl, a, b, K) {
      var r = A.rnd(17), tv = K('vide', a);
      bulbs(tl, 'm7', a, b);
      for (var i = 0; i < 12; i++) {
        var t0 = a + 0.7 + i * 0.32, x1 = 280 + r() * 500;
        gsap.set('#s7-p' + i, { opacity: 0 });
        ft(tl, '#s7-p' + i, { opacity: 1, x: 0, y: 0, rotation: 0 }, { opacity: 1, x: x1, y: -260 - r() * 200, rotation: 200, duration: 0.45, ease: 'power2.out' }, t0);
        ft(tl, '#s7-p' + i, { y: -260 }, { y: 300, duration: 0.6, ease: 'power2.in' }, t0 + 0.45);
      }
      ft(tl, '#m7-in', { y: 0 }, { y: 120, duration: tv - a, ease: 'none' }, a + 0.6);
      pop(tl, '#s7-t1', K('60 peluches', a)); pop(tl, '#s7-n', tv);
    }
  };

  // ================================================================ 8 · l'astuce de pro : le propriétaire règle combien de fois on gagne
  S[8] = {
    cam: [[540, 1000, 1.0, 1.06]],
    svg: function () {
      var g = burst('s8-ray', '#fff0a8', '#fffbe6', 540, 1100);
      g += G({ transform: T(540, 470, 1, -4) }, G('s8-ban', R(-380, -80, 760, 160, 14, '#ffffff', LW) + el('text', { x: 0, y: 6, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Luckiest Guy', 'font-size': 104, fill: RED }, 'ASTUCE DE PRO')));
      g += screen('s8-sc', 560, 900, 1.25);
      g += A.hamster('h8', 300, 1900, 1.0, { faces: ['proud'], armL: { a: 18 }, armR: { a: 110, hand: 'point' } });
      return g;
    },
    anim: function (tl, a, b, K) {
      ft(tl, '#s8-ray', { rotation: 0 }, { rotation: 20, duration: b - a + 0.2, ease: 'none' }, a);
      pop(tl, '#s8-ban', K("l'astuce", a)); pop(tl, '#s8-sc', K('sur beaucoup', a));
      ft(tl, '#s8-sc-k', { rotation: 0 }, { rotation: -120, duration: 0.6, ease: 'power2.out' }, K('règle', a));
      talk(tl, 'h8', 'proud', a, b);
    }
  };

  // ================================================================ 9 · la pince serre mou… sauf une partie sur 30
  S[9] = {
    cam: [[540, 1000, 1.0, 1.04]],
    svg: function () {
      setClaw('m9');
      var g = bg() + ground();
      g += machine('m9', 260, GY + 10, 0.56, { hold: 1, c: '#ff4fa8' });
      var grid = '';
      for (var i = 0; i < 30; i++) {
        var x = 560 + (i % 5) * 92, y = 620 + Math.floor(i / 5) * 92;
        grid += R(x - 38, y - 38, 76, 76, 10, '#ffffff', 5) + (i === 29 ? G({ transform: T(x, y, 0.32) }, G('s9-k', P('M -90 0 L -26 64 L 100 -80', null, 40, { stroke: '#111' }) + P('M -90 0 L -26 64 L 100 -80', null, 26, { stroke: GRN }))) :
          G({ transform: T(x, y, 0.27) }, G('s9-x' + i, P('M -100 -100 L 100 100 M 100 -100 L -100 100', null, 44, { stroke: '#111' }) + P('M -100 -100 L 100 100 M 100 -100 L -100 100', null, 28, { stroke: RED }))));
      }
      g += grid + NUM('s9-n', 744, 1280, '1 SUR 30', GRN, 110, -3);
      return g;
    },
    anim: function (tl, a, b, K) {
      var ts = K('sauf', a), t30 = K('sur 30', a);
      bulbs(tl, 'm9', a, b);
      grab(tl, 'm9', a - 0.62, 0.9);
      for (var i = 0; i < 29; i++) pop(tl, '#s9-x' + i, a + 0.1 + i * ((ts - a) / 29), 0.3);
      pop(tl, '#s9-k', t30); pop(tl, '#s9-n', t30 + 0.2);
    }
  };

  // ================================================================ 10 · 60 parties, 2 gagnants : 2 € de peluches pour 120 € encaissés
  S[10] = {
    cam: [[540, 1000, 1.0, 1.04]],
    svg: function () {
      var g = bg() + ground();
      var crowd = '';
      for (var i = 0; i < 60; i++) {
        var x = 120 + (i % 10) * 94, y = 700 + Math.floor(i / 10) * 100, win = i === 13 || i === 46;
        crowd += G({ transform: T(x, y) }, G(win ? 's10-w' + (i === 13 ? 0 : 1) : 's10-c' + i, Ci(0, -20, 20, win ? GRN : '#c3c8d0', 5) + P('M -30 30 Q -30 0 0 0 Q 30 0 30 30 Z', win ? GRN : '#c3c8d0', 5)));
      }
      g += G('s10-cr', crowd);
      g += LAB('s10-l', 540, 600, '60 parties = 2 gagnants', BLU, 66, -2);
      g += TAG('s10-t1', 300, 1330, '2 € DE PELUCHES', RED, 46, -4) + TAG('s10-t2', 780, 1330, '120 € ENCAISSÉS', GRN, 46, 4);
      return g;
    },
    anim: function (tl, a, b, K) {
      pop(tl, '#s10-cr', a + 0.05, 0.6); pop(tl, '#s10-l', K('60', a), 0.5);
      var tg = K('2 gagnants', a);
      ft(tl, '#s10-w0', { scale: 1 }, { scale: 1.6, duration: 0.2, ease: 'back.out(3)', yoyo: true, repeat: 1 }, tg);
      ft(tl, '#s10-w1', { scale: 1 }, { scale: 1.6, duration: 0.2, ease: 'back.out(3)', yoyo: true, repeat: 1 }, tg + 0.1);
      pop(tl, '#s10-t1', K('2 euros de peluches', a)); pop(tl, '#s10-t2', K('120', a));
    }
  };

  // ================================================================ 11 · il te reste environ 2 400 € par mois, par machine
  S[11] = {
    cam: [[540, 1000, 1.0, 1.05]],
    svg: function () {
      setClaw('m11');
      var g = bg() + ground();
      g += machine('m11', 760, GY + 10, 0.62, { c: '#8e5bd8' });
      g += ham('h11', 260, 0.66, { faces: ['proud'], armR: { a: 70, hand: 'thumb' } });
      g += NUM('s11-n', 540, 480, '≈ 2 400 € / MOIS', GRN, 110, -2) + LAB('s11-l', 540, 600, 'par machine', '#222', 70, 2) + TAG('s11-t', 760, 680, '− PART DU PATRON', RED, 44, 4);
      return g;
    },
    anim: function (tl, a, b, K) {
      bulbs(tl, 'm11', a, b);
      pop(tl, '#s11-t', a + 0.1); pop(tl, '#s11-n', K('2 400', a)); pop(tl, '#s11-l', K('Par machine', a), 0.5);
      out(tl, '#s11-t', K('2 400', a) - 0.1);
      talk(tl, 'h11', 'proud', a, b);
    }
  };

  // ================================================================ 12 · 10 machines : 24 000 € par mois
  S[12] = {
    cam: [[540, 1000, 1.0, 1.06]],
    svg: function () {
      var g = bg('#2b1d4a') + R(-300, GY, 1680, 900, 0, '#3b2a5c', 0) + P('M -40 ' + GY + ' L 1120 ' + GY, null, 8);
      var cols = ['#8e5bd8', '#ff4fa8', '#ff9a4d', '#2f8cff', '#2fbf4a'];
      for (var i = 0; i < 10; i++) { var row = i < 5 ? 0 : 1; setClaw('m12-' + i); g += G({ transform: T(0, 0) }, G('s12-m' + i, machine('m12-' + i, 130 + (i % 5) * 205, (row ? GY + 10 : 1000), row ? 0.36 : 0.3, { c: cols[i % 5], seed: i + 2, n: 9 }))); }
      g += NUM('s12-n', 540, 330, '24 000 € / MOIS', GRN, 120, -3) + TAG('s12-t', 540, 460, 'PELUCHES À 1 €', RED, 56, 3);
      return g;
    },
    anim: function (tl, a, b, K) {
      for (var i = 0; i < 10; i++) pop(tl, '#s12-m' + i, a + 0.05 + i * 0.06, 0.4);
      // ampoules des 10 machines : deux animations groupées (une par moitié), pas 90
      ft(tl, '#g12 .ble', { opacity: 1 }, { opacity: 0.25, duration: 0.18, ease: 'none', yoyo: true, repeat: Math.ceil((b - a) / 0.18) }, a);
      ft(tl, '#g12 .blo', { opacity: 1 }, { opacity: 0.25, duration: 0.18, ease: 'none', yoyo: true, repeat: Math.ceil((b - a) / 0.18) }, a + 0.18);
      pop(tl, '#s12-n', K('24 000', a)); pop(tl, '#s12-t', K('peluches à 1', a));
    }
  };

  // ================================================================ 13 · « c'est pas toi qui es nul : elle est réglée comme ça »
  S[13] = {
    cam: [[540, 1000, 1.0, 1.06]],
    svg: function () {
      setClaw('m13');
      var g = bg() + ground();
      g += machine('m13', 400, GY + 10, 0.66, { hold: 1, c: '#ff4fa8' });
      g += A.person('s13-p', 820, GY + 20, 0.62, { shirt: BLU, skin: '#f3c39b', hair: '#3b2414' });
      g += A.hamster('h13', 960, GY + 14, 0.46, { faces: ['proud'], armL: { a: 120, hand: 'point' } });
      g += STAMP('s13-st', 540, 520, 'RÉGLÉE COMME ÇA', RED, -6);
      return g;
    },
    anim: function (tl, a, b, K) {
      bulbs(tl, 'm13', a, b);
      grab(tl, 'm13', a - 0.3, 1.25);
      ft(tl, '#s13-p-hd', { rotation: 0 }, { rotation: -10, duration: 0.3, ease: 'power2.out' }, a + 1.0);
      gsap.set('#s13-st', { opacity: 0 }); ft(tl, '#s13-st', { opacity: 0, scale: 2.4 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'power3.in' }, K('réglée', a));
      talk(tl, 'h13', 'proud', a, b);
    }
  };

  // ================================================================ 14 · « Quel business louche je calcule la prochaine fois ? »
  S[14] = {
    cam: [[540, 1100, 1.0, 1.08]],
    svg: function () {
      var g = burst('s14-ray', '#c9a8ff', '#eadcff', 540, 1200);
      g += G({ transform: T(260, 1000) }, G('s14-cm', P('M -150 -100 Q -150 -150 -100 -150 L 100 -150 Q 150 -150 150 -100 L 150 20 Q 150 70 100 70 L -20 70 L -90 130 L -70 70 L -100 70 Q -150 70 -150 20 Z', C.w, LW) +
        Ci(-60, -40, 18, PNK, 0, { id: 's14-d0' }) + Ci(0, -40, 18, PNK, 0, { id: 's14-d1' }) + Ci(60, -40, 18, PNK, 0, { id: 's14-d2' })));
      g += NUM('s14-q', 830, 760, '?', YEL, 220, 10);
      g += A.hamster('h14', 560, 1880, 1.1, { faces: ['happy'], armL: { a: 18 }, armR: { a: 166, hand: 'point' } });
      return g;
    },
    anim: function (tl, a, b, K) {
      var td = K('Dis-le', a);
      ft(tl, '#s14-ray', { rotation: 0 }, { rotation: 30, duration: b - a + 0.3, ease: 'none' }, a);
      ft(tl, '#h14', { y: 200 }, { y: 0, duration: 0.4, ease: 'back.out(1.8)' }, a);
      pop(tl, '#s14-q', a + 0.3); wob(tl, '#s14-q', a + 0.6, b - a);
      talk(tl, 'h14', 'happy', a, b);
      pop(tl, '#s14-cm', td - 0.05);
      for (var i = 0; i < 3; i++) ft(tl, '#s14-d' + i, { y: 0 }, { y: -16, duration: 0.25, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((b - td) / 0.25) }, td + 0.3 + i * 0.1);
    }
  };
})();
