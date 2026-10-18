// « Combien ça rapporte d'être propriétaire d'un McDo ? » — format court, calqué sur les vidéos de référence :
// fond clair et ligne de sol, Hamsterdam à gauche, gros chiffres (rouge = dépense, vert = gain), étiquettes manuscrites,
// plans « réaction » sur fond rayonnant. Fast-food générique orange et blanc : aucun logo, aucune couleur de marque.
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
  var I = {
    oven: function (x, y, s) { return G({ transform: T(x, y, s) }, R(-120, -200, 240, 200, 16, C.steel, LW) + R(-90, -170, 180, 100, 10, '#2b2b33', 7) + R(-90, -50, 180, 22, 6, C.steel2, 5) + R(-100, -250, 200, 60, 12, '#3b3b44', LW) + E(0, -232, 80, 14, '#e8b23a', 0)); },
    car: function (x, y, s) { return G({ transform: T(x, y, s) }, P('M -170 20 L -170 -40 Q -160 -70 -110 -74 L -70 -130 Q -60 -140 -40 -140 L 60 -140 Q 80 -140 94 -126 L 130 -74 Q 170 -70 170 -30 L 170 20 Z', BLU, LW) +
      P('M -60 -120 L 40 -120 L 76 -78 L -88 -78 Z', '#cfefff', 7) + Ci(-100, 26, 40, '#333', LW) + Ci(100, 26, 40, '#333', LW) + Ci(-100, 26, 14, C.steel, 5) + Ci(100, 26, 14, C.steel, 5)); },
    kiosk: function (x, y, s) { return G({ transform: T(x, y, s) }, R(-70, -300, 140, 300, 20, C.w, LW) + R(-52, -276, 104, 150, 10, '#2b2b33', 7) + R(-36, -258, 72, 40, 6, C.rest, 0) + R(-36, -206, 32, 32, 6, C.cheese, 0) + R(4, -206, 32, 32, 6, C.lettuce, 0) + R(-40, -96, 80, 16, 6, C.steel2, 5)); },
    patty: function (x, y, s) { return G({ transform: T(x, y, s) }, E(0, 0, 110, 40, C.patty, LW) + P('M -70 -10 Q -40 -22 -10 -10 M 20 -14 Q 50 -24 76 -8', null, 6, { stroke: '#a85a2c' })); },
    bun: function (x, y, s) { return G({ transform: T(x, y, s) }, P('M -110 20 Q -110 -96 0 -98 Q 110 -96 110 20 Z', C.bun, LW) + E(-40, -50, 8, 5, C.w, 0) + E(10, -66, 8, 5, C.w, 0) + E(50, -40, 8, 5, C.w, 0)); },
    bag: function (x, y, s) { return G({ transform: T(x, y, s) }, P('M -80 -110 L 80 -110 L 96 100 L -96 100 Z', '#e9c79a', LW) + P('M -80 -110 L -60 -150 L 60 -150 L 80 -110', '#d9b07a', 7) + Ci(0, 0, 40, C.rest, 7) + P('M -20 -6 Q 0 -30 20 -6 Z', C.w, 0)); },
    bolt: function (x, y, s) { return G({ transform: T(x, y, s) }, P('M 20 -120 L -60 20 L -6 20 L -30 130 L 60 -20 L 6 -20 Z', '#ffe03a', LW)); },
    mop: function (x, y, s) { return G({ transform: T(x, y, s) }, P('M -70 -120 L 70 -120 L 56 20 L -56 20 Z', '#4c8dff', LW) + P('M -78 -120 Q 0 -150 78 -120', null, 7) + R(-8, -420, 16, 300, 6, C.wood, 6) +
      P('M -50 -110 Q -40 -60 -30 -110 Q -20 -60 -10 -110 Q 0 -60 10 -110 Q 20 -60 30 -110', '#e8e8f0', 6)); },
    soda: function (x, y, s, id) { return G({ transform: T(x, y, s) }, G(id || {}, P('M -64 -110 L 64 -110 L 48 120 L -48 120 Z', C.w, LW) + R(-48, -10, 96, 54, 0, C.rest, 0) + P('M -64 -110 L 64 -110 L 48 120 L -48 120 Z', null, LW) +
      R(-74, -140, 148, 34, 12, '#ffd1a3', LW) + P('M 14 -140 L 40 -230', null, 14) + P('M 14 -140 L 40 -230', null, 7, { stroke: C.red }))); },
    jet: function (x, y, s) { return G({ transform: T(x, y, s) }, P('M -220 0 Q -200 -40 -120 -44 L 160 -44 Q 230 -40 240 0 Q 230 40 160 40 L -120 40 Q -200 40 -220 0 Z', C.w, LW) +
      P('M -40 -40 L 40 -160 L 90 -160 L 60 -40 Z', '#dfe7ef', LW) + P('M -40 40 L 30 140 L 80 140 L 60 40 Z', '#dfe7ef', LW) + P('M -200 -10 L -230 -110 L -180 -110 L -140 -40', '#dfe7ef', LW) +
      Ci(120, -6, 14, '#bfe9ff', 5) + Ci(70, -6, 14, '#bfe9ff', 5) + Ci(20, -6, 14, '#bfe9ff', 5) + R(-120, 10, 260, 10, 4, ORA, 0)); },
    safe: function (x, y, s) { return G({ transform: T(x, y, s) }, R(-150, -300, 300, 300, 18, '#8a94a6', LW) + R(-120, -270, 240, 240, 12, '#a7b0c0', 7) + Ci(30, -150, 50, '#6b7280', LW) + P('M 30 -200 L 30 -100 M -20 -150 L 80 -150', null, 7) +
      R(-110, -360, 220, 70, 10, '#ffffff', 7) + el('text', { x: 0, y: -322, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Luckiest Guy', 'font-size': 56, fill: '#111' }, 'ÉTAT')); },
    cal: function (x, y, s, txt) { return G({ transform: T(x, y, s) }, R(-130, -150, 260, 300, 18, C.w, LW) + R(-130, -150, 260, 74, 18, C.red, LW) + Ci(-60, -150, 12, C.steel2, 6) + Ci(60, -150, 12, C.steel2, 6) +
      el('text', { x: 0, y: 30, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Luckiest Guy', 'font-size': 92, fill: '#111' }, esc(txt || ''))); },
    paper: function (x, y, s, r) { return G({ transform: T(x, y, s, r) }, R(-70, -95, 140, 190, 6, C.w, 7) + P('M -44 -50 L 44 -50 M -44 -16 L 44 -16 M -44 18 L 20 18 M -44 52 L 30 52', null, 6, { stroke: '#aab2bd' })); },
    desk: function (x, y, s) { return G({ transform: T(x, y, s) }, R(-220, -200, 440, 40, 10, C.wood, LW) + R(-200, -160, 400, 160, 6, C.wood2, LW)); },
    scale: function () {   // balance : fléau animable « s15-beam », plateaux suspendus
      return G({ transform: T(640, 820) }, G('s15-beam', R(-300, -16, 600, 32, 14, '#8b5a2b', LW) +
        G({ transform: T(-270, 0) }, G('s15-pl', P('M 0 0 L -100 230 M 0 0 L 100 230', null, 6) + P('M -130 230 L 130 230 Q 104 290 0 292 Q -104 290 -130 230 Z', '#d9dde3', LW))) +
        G({ transform: T(270, 0) }, G('s15-pr', P('M 0 0 L -100 230 M 0 0 L 100 230', null, 6) + P('M -130 230 L 130 230 Q 104 290 0 292 Q -104 290 -130 230 Z', '#d9dde3', LW))))) +
        P('M 640 820 L 600 1440 L 680 1440 Z', '#8b5a2b', LW) + Ci(640, 820, 22, C.gold, 7);
    }
  };
  function resto(x, y, s, id) {
    var g = '';
    g += R(-480, -660, 960, 660, 0, C.w, LW);
    g += R(-510, -780, 1020, 150, 30, C.rest, LW) + R(-510, -716, 1020, 26, 0, C.w, 0) + R(-510, -780, 1020, 150, 30, null, LW);
    g += R(-200, -900, 400, 120, 20, C.w, LW) + el('text', { x: 0, y: -838, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Luckiest Guy', 'font-size': 80, fill: C.rest }, 'BURGERS');
    for (var i = 0; i < 2; i++) {
      var wx = i ? 130 : -440, aw = '';
      g += R(wx, -540, 310, 330, 18, '#bfe9ff', LW) + P('M ' + (wx + 40) + ' -500 L ' + (wx + 110) + ' -500 M ' + (wx + 40) + ' -470 L ' + (wx + 80) + ' -470', null, 10, { stroke: C.w });
      for (var k = 0; k < 6; k++) aw += P('M ' + (wx - 10 + k * 55) + ' -600 L ' + (wx + 45 + k * 55) + ' -600 L ' + (wx + 45 + k * 55) + ' -560 Q ' + (wx + 17 + k * 55) + ' -520 ' + (wx - 10 + k * 55) + ' -560 Z', k % 2 ? C.w : C.rest, 7);
      g += aw;
    }
    g += R(-120, -480, 240, 480, 14, C.rest, LW) + R(-92, -450, 184, 300, 10, '#bfe9ff', 7) + R(-92, -120, 184, 26, 6, C.w, 5) + Ci(70, -230, 12, C.w, 5);
    g += R(-480, -70, 960, 70, 0, C.rest, LW);
    return G({ transform: T(x, y, s), id: id }, g);
  }
  var bills = function (pre, n, x, y) { var s = ''; for (var i = 0; i < n; i++) s += G({ transform: T(x, y) }, G(pre + i, A.bill(0, 0, 0.7, 0))); return s; };
  var rain = function (tl, pre, n, a, b, seed) {   // billets qui volent puis retombent, en boucle sur le plan
    var r = A.rnd(seed || 9), d = b - a;
    for (var k = 0; k < n; k++) {
      var t0 = a + k * (d / n) * 0.9, side = k % 2 ? 1 : -1, yTop = -620 - r() * 280;
      gsap.set('#' + pre + k, { opacity: 0 });
      ft(tl, '#' + pre + k, { x: side * 60, y: 0, rotation: 0, opacity: 1 }, { x: side * (120 + r() * 380), y: yTop, rotation: side * 160, duration: 0.55, ease: 'power2.out' }, t0);
      ft(tl, '#' + pre + k, { y: yTop, rotation: side * 160 }, { y: 1100, rotation: side * 720, duration: 2.2 + r() * 0.8, ease: 'power1.in' }, t0 + 0.55);
    }
  };

  // ================================================================ 1 · titre d'accroche
  S[1] = {
    cam: [[540, 1000, 1.0, 1.05]],
    svg: function () {
      var g = bg('#bfe6ff') + A.cloud(200, 260, 0.7) + A.cloud(900, 330, 0.55) + ground('#d8dde3');
      g += resto(540, GY, 0.74, 's1-r');
      g += ham('s1h', 540, 0.72, { faces: ['happy'], armL: { a: 112, hand: 'open' }, armR: { a: 112, hand: 'open' } });
      g += G({ transform: T(540, 640) }, G('s1-st', P('M 0 -230 L 60 -110 L 190 -170 L 140 -40 L 270 0 L 140 40 L 190 170 L 60 110 L 0 230 L -60 110 L -190 170 L -140 40 L -270 0 L -140 -40 L -190 -170 L -60 -110 Z', YEL, LW, { transform: 'scale(1.6,1)' })));
      g += NUM('s1-t1', 540, 330, 'COMBIEN ÇA RAPPORTE', YEL, 92, -2) + NUM('s1-t2', 540, 460, "D'ÊTRE PROPRIÉTAIRE", '#ffffff', 92, -2) +
        G({ transform: T(540, 640, 1, -3) }, G('s1-t3', el('text', { x: 0, y: 0, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Luckiest Guy', 'font-size': 164,
          stroke: '#111', 'stroke-width': 16, 'stroke-linejoin': 'round', 'paint-order': 'stroke' }, el('tspan', { fill: PNK }, "D'UN ") + el('tspan', { fill: BLU }, 'McDO ?'))));
      return g;
    },
    anim: function (tl, a, b, K) {
      pop(tl, '#s1-t1', a, 0.4); pop(tl, '#s1-t2', K("d'être", a), 0.4); pop(tl, '#s1-st', K("d'un", a) - 0.05, 0.2); pop(tl, '#s1-t3', K("d'un", a), 0.3);
      ft(tl, '#s1-st', { rotation: 0 }, { rotation: 20, duration: b - a, ease: 'none' }, a);
      ft(tl, '#s1h', { y: 200 }, { y: 0, duration: 0.45, ease: 'back.out(1.8)' }, a);
      talk(tl, 's1h', 'happy', a, b);
    }
  };

  // ================================================================ 2 · d'abord, McDo doit t'accepter, puis te former 9 à 24 mois
  S[2] = {
    cam: [[540, 1000, 1.0, 1.04]],
    svg: function () {
      var g = bg() + ground();
      g += A.bust('s2-rh', 850, 1150, 1.1, { shirt: '#4a4f58', skin: '#e2ad84', hair: '#3b2414' }) + P('M 830 1210 L 850 1270 L 870 1210 Z', C.red, 5) + I.desk(820, GY, 1);
      g += LAB('s2-l1', 820, 940, 'le recruteur', BLU, 60, -4);
      g += G({ transform: T(600, 1218) }, G('s2-cv', I.paper(0, -40, 0.8, -8))) + STAMP('s2-ok', 560, 1110, 'ACCEPTÉ', GRN, -12);
      g += ham('s2h', 250, 0.62, { faces: ['smile', 'joy'], armR: { a: 70, item: I.paper(0, -60, 0.6, 0), itemRot: 70 } });
      g += G({ transform: T(540, 640) }, G('s2-cal', I.cal(0, 0, 1, '9-24')));
      g += LAB('s2-l2', 540, 860, 'mois de formation', ORA, 64, 2);
      return g;
    },
    anim: function (tl, a, b, K) {
      var ta = K("t'accepter", a), tm = K('9 à 24', a);
      talk(tl, 's2h', 'smile', a, ta); A.face(tl, 's2h', 'smile', 'joy', ta + 0.1); talk(tl, 's2h', 'joy', ta + 0.1, b);
      pop(tl, '#s2-l1', a + 0.2, 0.5);
      gsap.set('#s2-cv', { opacity: 0 }); ft(tl, '#s2-cv', { opacity: 0, x: -300 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }, a + 0.5);
      gsap.set('#s2-ok', { opacity: 0 }); ft(tl, '#s2-ok', { opacity: 0, scale: 2.4 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'power3.in' }, ta);
      pop(tl, '#s2-cal', tm - 0.1); pop(tl, '#s2-l2', tm + 0.3, 0.5);
      wob(tl, '#s2-cal', tm + 0.3, b - tm);
    }
  };

  // ================================================================ 3 · le droit d'entrée : 45 000 €
  S[3] = {
    cam: [[540, 1000, 1.0, 1.05]],
    svg: function () {
      var g = bg('#efe3ff') + ground('#e2d6f2');
      g += G({ transform: T(760, GY) }, R(-230, -880, 460, 880, 24, '#8b4a22', LW) + R(-200, -850, 180, 820, 12, '#a65c2c', 7) + R(20, -850, 180, 820, 12, '#a65c2c', 7) + Ci(-40, -420, 18, C.gold, 7) + Ci(40, -420, 18, C.gold, 7));
      g += A.person('s3-dm', 760, GY + 20, 0.98, { w: 420, shirt: '#1d1d24', pants: '#15151b', arms: 'cross', face: 'stern', shades: 1, bald: 1, skin: '#c98b5e', tie: '#111111', hr: 124 });
      g += LAB('s3-l1', 960, 1080, 'le videur', BLU, 58, 6);
      g += ham('s3h', 270, 0.66, { faces: ['worry', 'awk'], sweat: 1, armL: { a: 160 }, armR: { a: 160 } });
      g += G({ transform: T(270, 900) }, G('s3-bag', A.bag(0, 0, 0.85)));
      g += NUM('s3-n', 540, 450, '45 000 €', RED, 150, -3) + LAB('s3-l2', 300, 640, "droit d'entrée", ORA, 66, -4);
      return g;
    },
    anim: function (tl, a, b, K) {
      var tn = K('45 000', a), tj = K('Juste pour', a);
      talk(tl, 's3h', 'worry', a, tj);
      pop(tl, '#s3-l1', a + 0.3, 0.5);
      pop(tl, '#s3-n', tn); pop(tl, '#s3-l2', tn + 0.25, 0.5);
      ft(tl, '#s3-bag', { x: 0, rotation: 0 }, { x: 6, rotation: 2, duration: 0.06, ease: 'none', yoyo: true, repeat: Math.ceil((tj - a) / 0.06) }, a);
      ft(tl, '#s3-bag', { x: 0, y: 0, scale: 1 }, { x: 420, y: 260, scale: 0.8, duration: 0.45, ease: 'power2.inOut' }, tj);
      ft(tl, '#s3h-aL', { rotation: -160 }, { rotation: -16, duration: 0.35, ease: 'power2.out' }, tj + 0.1);
      ft(tl, '#s3h-aR', { rotation: -160 }, { rotation: -16, duration: 0.35, ease: 'power2.out' }, tj + 0.1);
      A.face(tl, 's3h', 'worry', 'awk', tj + 0.2); talk(tl, 's3h', 'awk', tj + 0.2, b);
      ft(tl, '#s3-dm-hd', { rotation: 0 }, { rotation: 8, duration: 0.22, ease: 'sine.inOut', yoyo: true, repeat: 1 }, tj + 0.5);
    }
  };

  // ================================================================ 4 · le restaurant : cuisines, drive, bornes — 800 000 € à 2 millions
  S[4] = {
    cam: [[540, 1000, 1.0, 1.05]],
    svg: function () {
      var g = bg() + ground();
      g += ham('s4h', 190, 0.58, { faces: ['smile', 'shock'], armR: { a: 80, hand: 'point' } });
      g += G({ transform: T(470, GY) }, G('s4-i1', I.oven(0, 0, 0.9) + TAG('', 0, -330, 'CUISINES', '#111', 46, -3)));
      g += G({ transform: T(720, GY) }, G('s4-i2', I.car(0, -50, 0.62) + TAG('', 0, -210, 'DRIVE', '#111', 46, 3)));
      g += G({ transform: T(950, GY) }, G('s4-i3', I.kiosk(0, 0, 0.95) + TAG('', 0, -340, 'BORNES', '#111', 46, -3)));
      g += NUM('s4-n1', 540, 560, '800 000 €', RED, 140, -3) + LAB('s4-l1', 540, 680, 'à', '#222', 70) + NUM('s4-n2', 540, 800, '2 MILLIONS €', RED, 120, 2);
      return g;
    },
    anim: function (tl, a, b, K) {
      var t8 = K('800 000', a), t2 = K('2 millions', a);
      talk(tl, 's4h', 'smile', a, t2); A.face(tl, 's4h', 'smile', 'shock', t2);
      pop(tl, '#s4-i1', K('les cuisines', a)); pop(tl, '#s4-i2', K('le drive', a)); pop(tl, '#s4-i3', K('les bornes', a));
      pop(tl, '#s4-n1', t8); pop(tl, '#s4-l1', t8 + 0.4, 0.5); pop(tl, '#s4-n2', t2);
      ft(tl, '#s4-n2', { scale: 1 }, { scale: 1.08, duration: 0.15, ease: 'sine.inOut', yoyo: true, repeat: 5 }, t2 + 0.3);
    }
  };

  // ================================================================ 5 · réaction : « t'as claqué plus d'un million »
  S[5] = {
    cam: [[540, 1100, 1.0, 1.1]],
    svg: function () {
      var g = burst('s5-ray', '#ffd1dc', '#fff4f6', 540, 1200);
      g += A.hamster('s5h', 540, 2120, 1.32, { faces: ['shock'], sweat: 1, armL: { a: 162 }, armR: { a: 162 } });
      g += NUM('s5-n', 540, 560, "+ D'1 MILLION €", RED, 120, -4);
      g += G({ transform: T(540, 760) }, G('s5-b', A.burger(-210, 0, 0.55) + el('text', { x: 40, y: 0, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Patrick Hand', 'font-size': 66, fill: BLU,
        stroke: '#fff', 'stroke-width': 10, 'paint-order': 'stroke' }, 'et 0 burger vendu')));
      return g;
    },
    anim: function (tl, a, b, K) {
      ft(tl, '#s5-ray', { rotation: 0 }, { rotation: 25, duration: b - a + 0.2, ease: 'none' }, a);
      ft(tl, '#s5h', { y: 0 }, { y: -30, duration: 0.12, ease: 'power2.out', yoyo: true, repeat: 1 }, a + 0.05);
      pop(tl, '#s5-n', K('claqué', a)); pop(tl, '#s5-b', K('avant même', a), 0.4);
      ft(tl, '#s5-n', { x: 0 }, { x: 8, duration: 0.05, ease: 'none', yoyo: true, repeat: 9 }, K('claqué', a) + 0.3);
    }
  };

  // ================================================================ 6 · à crédit : la banque prélève 10 000 € par mois pendant 10 ans
  S[6] = {
    cam: [[540, 1000, 1.0, 1.05]],
    svg: function () {
      var g = bg() + ground();
      g += A.person('s6-bk', 820, GY + 20, 0.8, { shirt: '#3b4a6b', pants: '#2a3348', arms: 'hip', face: 'stern', skin: '#f3c39b', tie: C.red, hair: '#7a7a80', mous: 1, collar: 1 });
      g += LAB('s6-l1', 820, 690, 'la banque', BLU, 62, 3);
      g += ham('s6h', 260, 0.64, { faces: ['worry'], sweat: 1, armL: { a: 20 }, armR: { a: 20 } });
      g += STAMP('s6-st', 300, 800, 'À CRÉDIT', RED, -10);
      g += NUM('s6-n', 540, 440, '10 000 € / MOIS', RED, 110, -2) + LAB('s6-l2', 540, 560, 'pendant 10 ans', ORA, 66, 2);
      return g;
    },
    anim: function (tl, a, b, K) {
      var tc = K('crédit,', a), tn = K('10 000', a), ty = K('10 ans', a);
      talk(tl, 's6h', 'worry', a, b);
      pop(tl, '#s6-l1', a + 0.6, 0.5);
      gsap.set('#s6-st', { opacity: 0 }); ft(tl, '#s6-st', { opacity: 0, scale: 2.4 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'power3.in' }, tc);
      pop(tl, '#s6-n', tn); pop(tl, '#s6-l2', ty, 0.5);
    }
  };

  // ================================================================ 7 · 48 salariés : 53 000 € par mois
  S[7] = {
    cam: [[540, 1000, 1.0, 1.05]],
    svg: function () {
      var g = bg() + ground();
      var skins = ['#f3c39b', '#e2ad84', '#c98b5e', '#8d5a3b', '#f6d2b4', '#b67a52'], r = A.rnd(77), rows = [7, 6, 5], n = 0;
      rows.forEach(function (cnt, k) {
        var s = 0.55 + k * 0.12, y = 1120 + k * 130, row = '';
        for (var i = 0; i < cnt; i++) { row += A.bust('s7-e' + n, Math.round(420 + (i + 0.5) * 640 / cnt + (k % 2 ? 16 : -16)), y, s, { cap: C.rest, hands: 1, skin: skins[Math.floor(r() * skins.length)] }); n++; }
        g += G('s7-r' + k, row);
      });
      g += ham('s7h', 200, 0.6, { faces: ['worry'], sweat: 1, armL: { a: 30, hand: 'open' }, armR: { a: 70, hand: 'open' } });
      g += LAB('s7-l1', 700, 880, '48 salariés', BLU, 70, -3) + NUM('s7-n', 540, 620, '53 000 €', RED, 150, -2);
      return g;
    },
    anim: function (tl, a, b, K) {
      var t48 = K('48', a);
      talk(tl, 's7h', 'worry', a, b);
      [0, 1, 2].forEach(function (k) { gsap.set('#s7-r' + k, { opacity: 0 }); ft(tl, '#s7-r' + k, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.22, ease: 'back.out(2.4)' }, t48 - 0.2 + k * 0.08); });
      pop(tl, '#s7-l1', t48, 0.5); pop(tl, '#s7-n', K('53 000', a));
    }
  };

  // ================================================================ 8 · la viande, le pain, les frites, les emballages : 59 000 €
  S[8] = {
    cam: [[540, 1000, 1.0, 1.04]],
    svg: function () {
      var g = bg() + ground();
      g += ham('s8h', 160, 0.56, { faces: ['smile'], armR: { a: 70, hand: 'open' } });
      var it = [[I.patty(0, 0, 0.9), 'viande', 400], [I.bun(0, 10, 0.86), 'pain', 590], [A.fries(0, 20, 1.0), 'frites', 780], [I.bag(0, 0, 0.88), 'emballages', 960]];
      it.forEach(function (q, k) { g += G({ transform: T(q[2], 1260) }, G('s8-i' + k, q[0] + el('text', { x: 0, y: 150, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Patrick Hand', 'font-size': 52, fill: ORA, stroke: '#fff', 'stroke-width': 8, 'paint-order': 'stroke' }, q[1]))); });
      g += NUM('s8-n', 540, 680, '59 000 €', RED, 150, 2);
      return g;
    },
    anim: function (tl, a, b, K) {
      talk(tl, 's8h', 'smile', a, b);
      ['La viande', 'le pain', 'les frites', 'les emballages'].forEach(function (w, k) { pop(tl, '#s8-i' + k, K(w, a)); });
      pop(tl, '#s8-n', K('59 000', a));
    }
  };

  // ================================================================ 9 · l'électricité des friteuses et l'entretien : 13 000 €
  S[9] = {
    cam: [[540, 1000, 1.0, 1.05]],
    svg: function () {
      var g = bg() + ground();
      g += ham('s9h', 190, 0.58, { faces: ['worry'], armR: { a: 60 } });
      g += G({ transform: T(560, GY) }, I.oven(0, 0, 1.2) + G({ transform: T(0, -360) }, G('s9-fr', R(-60, -60, 22, 90, 4, C.fry, 5) + R(-20, -80, 22, 110, 4, C.fry, 5) + R(20, -66, 22, 96, 4, C.fry, 5))));
      g += G({ transform: T(560, 1000) }, G('s9-z', I.bolt(0, 0, 0.9))) + LAB('s9-l1', 560, 1180, 'électricité', BLU, 58, -3);
      g += G({ transform: T(900, GY) }, G('s9-m', I.mop(0, 0, 0.8) + el('text', { x: 0, y: -380, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Patrick Hand', 'font-size': 58, fill: ORA, stroke: '#fff', 'stroke-width': 8, 'paint-order': 'stroke' }, 'entretien')));
      g += NUM('s9-n', 540, 640, '13 000 €', RED, 150, -2);
      return g;
    },
    anim: function (tl, a, b, K) {
      var tz = K("L'électricité", a), d = b - a + 0.2;
      talk(tl, 's9h', 'worry', a, b);
      pop(tl, '#s9-z', tz); pop(tl, '#s9-l1', tz + 0.2, 0.5);
      ft(tl, '#s9-z', { opacity: 1 }, { opacity: 0.35, duration: 0.09, ease: 'none', yoyo: true, repeat: Math.ceil(d / 0.09) }, tz + 0.35);
      A.idle(tl, '#s9-fr', d, 10, 0.4, a);
      pop(tl, '#s9-m', K("l'entretien", a)); pop(tl, '#s9-n', K('13 000', a));
    }
  };

  // ================================================================ 10 · McDo se sert en premier : marque, pub, loyer
  var PIE = { x: 560, y: 1080, r: 260 };
  var wedge = function (i, n, r) {
    var a0 = i * 2 * Math.PI / n, a1 = (i + 1) * 2 * Math.PI / n;
    return 'M 0 0 L ' + (r * Math.sin(a0)).toFixed(1) + ' ' + (-r * Math.cos(a0)).toFixed(1) + ' A ' + r + ' ' + r + ' 0 0 1 ' + (r * Math.sin(a1)).toFixed(1) + ' ' + (-r * Math.cos(a1)).toFixed(1) + ' Z';
  };
  var mid = function (i, k) { var m = (i + 0.5) * Math.PI / 10; return [PIE.x + k * Math.sin(m), PIE.y - k * Math.cos(m)]; };
  var hand = function (closed) {
    var h = R(-70, -1500, 140, 1380, 30, '#6b7280', LW) + R(-82, -170, 164, 60, 16, C.w, LW) + Ci(40, -140, 12, C.gold, 5);
    if (!closed) h += P('M -80 -120 Q -110 -40 -90 20 L -60 110 Q -50 130 -36 110 L -40 30 L -10 130 Q 0 150 14 130 L 10 30 L 40 120 Q 50 140 64 118 L 44 20 L 80 80 Q 96 96 104 78 Q 96 0 80 -120 Z', '#f6c9a2', LW);
    else h += P('M -84 -120 Q -112 -20 -84 50 Q -40 90 30 80 Q 96 70 96 0 Q 100 -60 84 -120 Z', '#f6c9a2', LW) + P('M -50 40 Q -40 10 -50 -20 M -10 56 Q 0 20 -10 -10 M 30 56 Q 40 20 30 -10', null, 6);
    return h;
  };
  S[10] = {
    cam: [[560, 1000, 1.0, 1.04]],
    svg: function () {
      var g = bg() + ground();
      g += E(PIE.x + 10, PIE.y + 300, 320, 40, 'rgba(0,0,0,0.12)', 0) + Ci(PIE.x, PIE.y, 300, C.w, LW) + Ci(PIE.x, PIE.y, 270, '#ffe9c2', 6);
      for (var i = 0; i < 20; i++) {
        var a0 = i * Math.PI / 10, a1 = (i + 1) * Math.PI / 10, rr = PIE.r;
        g += G({ transform: T(PIE.x, PIE.y) }, G('s10-w' + i, P(wedge(i, 20, rr), C.gold, 5, { stroke: '#b9770e' }) +
          P('M ' + (rr * Math.sin(a0)).toFixed(1) + ' ' + (-rr * Math.cos(a0)).toFixed(1) + ' A ' + rr + ' ' + rr + ' 0 0 1 ' + (rr * Math.sin(a1)).toFixed(1) + ' ' + (-rr * Math.cos(a1)).toFixed(1), null, 40, { stroke: '#e89a2c' }) +
          P('M ' + (rr * Math.sin(a0)).toFixed(1) + ' ' + (-rr * Math.cos(a0)).toFixed(1) + ' A ' + rr + ' ' + rr + ' 0 0 1 ' + (rr * Math.sin(a1)).toFixed(1) + ' ' + (-rr * Math.cos(a1)).toFixed(1), null, LW) +
          A.coin(Math.round(150 * Math.sin(a0 + 0.16)), Math.round(-150 * Math.cos(a0 + 0.16)), 14)));
      }
      g += TAG('s10-c0', 880, 760, '−5 % MARQUE', RED, 52, 4) + TAG('s10-c1', 900, 870, '−5 % PUB', RED, 52, -3) + TAG('s10-c2', 880, 980, '−10 % LOYER', RED, 52, 3);
      g += ham('s10h', 150, 0.5, { faces: ['worry', 'shock'], sweat: 1, armL: { a: 20 }, armR: { a: 20 } });
      g += NUM('s10-n', 540, 640, '38 000 €', RED, 150, -2);
      g += G('s10-hand', G({ transform: 'scale(1.3)' }, G('s10-ho', hand(false)) + G({ id: 's10-hc', opacity: 0 }, hand(true))));
      return g;
    },
    anim: function (tl, a, b, K) {
      var steps = [[K('pour la marque', a), [0]], [K('pour la pub', a), [1]], [K('de loyer', a), [2, 3]]];
      gsap.set('#s10-hand', { x: PIE.x, y: -500 });
      talk(tl, 's10h', 'worry', a, steps[0][0]);
      steps.forEach(function (s, k) {
        var t = s[0] - 0.55, ids = s[1], c = ids.length > 1 ? [(mid(2, 170)[0] + mid(3, 170)[0]) / 2, (mid(2, 170)[1] + mid(3, 170)[1]) / 2] : mid(ids[0], 170);
        ft(tl, '#s10-hand', { x: c[0], y: -500 }, { x: c[0], y: c[1] - 90, duration: 0.28, ease: 'power2.in' }, t);
        tl.set('#s10-ho', { opacity: 0 }, t + 0.3); tl.set('#s10-hc', { opacity: 1 }, t + 0.3);
        ft(tl, '#s10-hand', { y: c[1] - 90 }, { y: -900, duration: 0.42, ease: 'power2.in' }, t + 0.38);
        ids.forEach(function (i) { ft(tl, '#s10-w' + i, { y: 0 }, { y: -900 - (c[1] - 90), duration: 0.42, ease: 'power2.in' }, t + 0.38); });
        tl.set('#s10-ho', { opacity: 1 }, t + 0.85); tl.set('#s10-hc', { opacity: 0 }, t + 0.85);
        pop(tl, '#s10-c' + k, s[0]);
      });
      A.face(tl, 's10h', 'worry', 'shock', steps[0][0]);
      pop(tl, '#s10-n', K('38 000', a));
    }
  };

  // ================================================================ 11 · réaction : 173 000 € de charges par mois
  S[11] = {
    cam: [[540, 1100, 1.0, 1.1]],
    svg: function () {
      var g = burst('s11-ray', '#ffd1dc', '#fff4f6', 540, 1200);
      var r = A.rnd(5);
      for (var i = 0; i < 8; i++) g += G({ transform: T(Math.round(140 + r() * 800), Math.round(900 + r() * 500)) }, G('s11-p' + i, I.paper(0, 0, 0.9, Math.round((r() - 0.5) * 50))));
      g += A.hamster('s11h', 540, 2120, 1.3, { faces: ['tired'], sweat: 1, armL: { a: 30 }, armR: { a: 30 } });
      g += NUM('s11-n', 540, 560, '−173 000 €', RED, 150, -3) + LAB('s11-l', 540, 690, 'de charges par mois', '#222', 66, 2);
      return g;
    },
    anim: function (tl, a, b, K) {
      var r = A.rnd(13);
      ft(tl, '#s11-ray', { rotation: 0 }, { rotation: -25, duration: b - a + 0.2, ease: 'none' }, a);
      for (var i = 0; i < 8; i++) { gsap.set('#s11-p' + i, { opacity: 0 }); ft(tl, '#s11-p' + i, { opacity: 0, y: -900, rotation: 0 }, { opacity: 1, y: 0, rotation: (r() - 0.5) * 60, duration: 0.5, ease: 'power2.out' }, a + 0.1 + i * 0.12); }
      talk(tl, 's11h', 'tired', a, b);
      pop(tl, '#s11-n', K('173 000', a)); pop(tl, '#s11-l', K('charges', a), 0.5);
    }
  };

  // ================================================================ 12 · l'ouverture : 700 clients × 10 € = 210 000 € par mois
  S[12] = {
    cam: [[540, 1000, 1.0, 1.05]],
    svg: function () {
      var g = bg('#bfe6ff') + A.cloud(860, 300, 0.6) + ground('#d8dde3');
      g += resto(560, GY, 0.82, 's12-r');
      var cols = [C.red, BLU, '#8e5bd8', C.green, '#ffb03a', PNK];
      for (var i = 0; i < 9; i++) g += A.person('s12-c' + i, 120 + i * 110, GY + 30, 0.36, { shirt: cols[i % cols.length], skin: ['#f3c39b', '#c98b5e', '#e2ad84'][i % 3], hair: ['#3b2414', '#111', '#d9a04a'][i % 3], face: 'happy' });
      g += ham('s12h', 560, 0.5, { faces: ['happy'], armL: { a: 110, hand: 'open' }, armR: { a: 110, hand: 'open' } });
      g += TAG('s12-t1', 330, 560, '700 CLIENTS / JOUR', BLU, 50, -4) + TAG('s12-t2', 860, 560, '× 10 €', BLU, 60, 4);
      g += NUM('s12-n', 540, 390, '210 000 € / MOIS', GRN, 104, -2);
      return g;
    },
    anim: function (tl, a, b, K) {
      var d = b - a + 0.2;
      talk(tl, 's12h', 'happy', a, b);
      for (var i = 0; i < 9; i++) ft(tl, '#s12-c' + i, { y: 0 }, { y: -12, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil(d / 0.3) }, a + i * 0.05);
      pop(tl, '#s12-t1', K('700', a)); pop(tl, '#s12-t2', K('10 euros', a)); pop(tl, '#s12-n', K('210 000', a));
    }
  };

  // ================================================================ 13 · « 210 000 ! Je m'achète un jet privé »
  S[13] = {
    cam: [[540, 1100, 1.0, 1.08]],
    svg: function () {
      var g = burst('s13-ray', '#fff0a8', '#fffbe6', 540, 1200);
      g += G({ transform: T(-500, 1000) }, G('s13-jet', I.jet(0, 0, 1.1)));
      g += A.hamster('s13h', 540, 1900, 1.0, { faces: ['grin'], shades: 1, armL: { a: 150, hand: 'open' }, armR: { a: 150, hand: 'open' } });
      g += bills('s13-b', 16, 540, 1150);
      g += NUM('s13-n', 540, 560, '210 000 €', GRN, 160, -4) + LAB('s13-l', 760, 860, 'jet privé !', BLU, 70, 6);
      return g;
    },
    anim: function (tl, a, b, K) {
      var tj = K('jet privé', a);
      ft(tl, '#s13-ray', { rotation: 0 }, { rotation: 30, duration: b - a + 0.2, ease: 'none' }, a);
      pop(tl, '#s13-n', a + 0.05);
      ft(tl, '#s13-n', { scale: 1 }, { scale: 1.08, duration: 0.18, ease: 'sine.inOut', yoyo: true, repeat: 7 }, a + 0.4);
      ft(tl, '#s13-jet', { x: 0, y: 0, rotation: -8 }, { x: 2100, y: -320, rotation: -12, duration: 1.4, ease: 'none' }, tj - 0.5);
      pop(tl, '#s13-l', tj, 0.5);
      ft(tl, '#s13h-aL', { rotation: -130 }, { rotation: -165, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((b - a) / 0.3) }, a);
      ft(tl, '#s13h-aR', { rotation: -165 }, { rotation: -130, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((b - a) / 0.3) }, a);
      rain(tl, 's13-b', 16, a, b, 21);
    }
  };

  // ================================================================ 14 · « Attends. Enlève la TVA » : 191 000 €
  S[14] = {
    cam: [[540, 1000, 1.0, 1.04]],
    svg: function () {
      var g = bg() + ground();
      g += ham('s14h', 230, 0.64, { faces: ['proud'], armR: { a: 150, hand: 'open' } });
      g += I.safe(860, GY, 0.95);
      g += bills('s14-b', 6, 560, 560);
      g += NUM('s14-n1', 560, 500, '210 000 €', GRN, 140, -2) + CROSS('s14-x', 560, 500, 1.4);
      g += TAG('s14-t', 780, 660, '−19 000 € TVA', RED, 52, 4) + NUM('s14-n2', 560, 840, '191 000 €', GRN, 150, 2);
      return g;
    },
    anim: function (tl, a, b, K) {
      var tv = K('Enlève', a), tr = K('191 000', a), r = A.rnd(3);
      talk(tl, 's14h', 'proud', a, b);
      pop(tl, '#s14-n1', a + 0.05, 0.6);
      pop(tl, '#s14-t', tv + 0.2);
      for (var i = 0; i < 6; i++) { gsap.set('#s14-b' + i, { opacity: 0 }); ft(tl, '#s14-b' + i, { opacity: 1, x: 0, y: 0, rotation: 0 }, { opacity: 0.9, x: 300, y: 620 + r() * 60, rotation: 200, duration: 0.5, ease: 'power2.in' }, tv + 0.3 + i * 0.1); }
      gsap.set('#s14-x', { opacity: 0 }); ft(tl, '#s14-x', { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.15, ease: 'power3.in' }, tr - 0.25);
      pop(tl, '#s14-n2', tr);
    }
  };

  // ================================================================ 15 · ventes moins charges : 18 000 €, pour un resto ouvert 7 j / 7
  S[15] = {
    cam: [[560, 1000, 1.0, 1.04]],
    svg: function () {
      var g = bg() + ground();
      g += I.scale();
      g += G({ transform: T(370, 1050) }, G('s15-v', TAG('', 0, 0, '191 000 €', GRN, 56, 0) + LAB('', 0, -70, 'ventes', '#1e8f3a', 56)));
      g += G({ transform: T(910, 1050) }, G('s15-c', TAG('', 0, 0, '173 000 €', RED, 56, 0) + LAB('', 0, -70, 'charges', RED, 56)));
      g += NUM('s15-n', 600, 560, '18 000 €', GRN, 160, -3);
      g += ham('s15h', 130, 0.46, { faces: ['smile', 'tired'], armR: { a: 40 } });
      g += G({ transform: T(910, 1310) }, G('s15-cal', I.cal(0, 0, 0.62, '7J/7')));
      return g;
    },
    anim: function (tl, a, b, K) {
      var t17 = K('173 000', a), t18 = K('18 000', a), t7 = K('Pour un resto', a);
      talk(tl, 's15h', 'smile', a, t7); A.face(tl, 's15h', 'smile', 'tired', t7); talk(tl, 's15h', 'tired', t7, b);
      pop(tl, '#s15-v', a + 0.1); pop(tl, '#s15-c', t17);
      ft(tl, '#s15-beam', { rotation: 0 }, { rotation: -4, duration: 0.6, ease: 'elastic.out(1, 0.5)' }, t17 + 0.1);
      ft(tl, '#s15-pl', { rotation: 0 }, { rotation: 4, duration: 0.6, ease: 'elastic.out(1, 0.5)' }, t17 + 0.1);
      ft(tl, '#s15-pr', { rotation: 0 }, { rotation: 4, duration: 0.6, ease: 'elastic.out(1, 0.5)' }, t17 + 0.1);
      ft(tl, '#s15-v', { y: 0 }, { y: 22, duration: 0.6, ease: 'elastic.out(1, 0.5)' }, t17 + 0.1);
      ft(tl, '#s15-c', { y: 0 }, { y: -22, duration: 0.6, ease: 'elastic.out(1, 0.5)' }, t17 + 0.1);
      pop(tl, '#s15-n', t18); pop(tl, '#s15-cal', t7 + 0.2);
    }
  };

  // ================================================================ 16 · « l'astuce de pro : le soda »
  S[16] = {
    cam: [[540, 1100, 1.0, 1.08]],
    svg: function () {
      var g = burst('s16-ray', '#fff0a8', '#fffbe6', 540, 1200);
      g += A.hamster('s16h', 420, 1960, 1.08, { faces: ['proud'], armL: { a: 18 }, armR: { a: 120, hand: 'point' } });
      g += I.soda(800, 1220, 1.2, 's16-sd');
      g += G({ transform: T(540, 620, 1, -4) }, G('s16-ban', R(-380, -80, 760, 160, 14, '#ffffff', LW) + el('text', { x: 0, y: 6, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Luckiest Guy', 'font-size': 104, fill: RED }, 'ASTUCE DE PRO')));
      return g;
    },
    anim: function (tl, a, b, K) {
      ft(tl, '#s16-ray', { rotation: 0 }, { rotation: 20, duration: b - a + 0.2, ease: 'none' }, a);
      pop(tl, '#s16-ban', K("l'astuce", a)); pop(tl, '#s16-sd', K('le soda.', a) - 0.05);
      talk(tl, 's16h', 'proud', a, b);
    }
  };

  // ================================================================ 17 · un soda : 25 centimes de coût, vendu 2,50 €
  S[17] = {
    cam: [[540, 1000, 1.0, 1.05]],
    svg: function () {
      var g = bg() + ground();
      g += I.soda(540, 1250, 1.75, 's17-sd');
      g += TAG('s17-t1', 230, 820, '0,25 €', RED, 80, -5) + LAB('s17-l1', 230, 940, 'ça te coûte', RED, 60, -3);
      g += TAG('s17-t2', 860, 820, '2,50 €', GRN, 80, 5) + LAB('s17-l2', 860, 940, 'le client paie', '#1e8f3a', 60, 3);
      g += ARROW('s17-a1', 260, 990, 430, 1120, RED) + ARROW('s17-a2', 830, 990, 660, 1120, GRN);
      g += ham('s17h', 150, 0.48, { faces: ['smile'], armR: { a: 70, hand: 'point' } });
      return g;
    },
    anim: function (tl, a, b, K) {
      talk(tl, 's17h', 'smile', a, b);
      pop(tl, '#s17-sd', a + 0.05, 0.5);
      var t1 = K('25 centimes', a), t2 = K('2 euros 50', a);
      pop(tl, '#s17-t1', t1); pop(tl, '#s17-l1', t1 + 0.2, 0.5); pop(tl, '#s17-a1', t1 + 0.3, 0.6);
      pop(tl, '#s17-t2', t2); pop(tl, '#s17-l2', t2 + 0.2, 0.5); pop(tl, '#s17-a2', t2 + 0.3, 0.6);
    }
  };

  // ================================================================ 18 · un client sur deux : +21 000 € par mois
  S[18] = {
    cam: [[540, 1000, 1.0, 1.05]],
    svg: function () {
      var g = bg() + ground();
      var cols = [C.red, BLU, '#8e5bd8', C.green, '#ffb03a', PNK];
      for (var i = 0; i < 6; i++) g += A.person('s18-c' + i, 380 + i * 128, GY + 20, 0.5, { shirt: cols[i], skin: ['#f3c39b', '#c98b5e', '#e2ad84'][i % 3], hair: ['#3b2414', '#111', '#d9a04a'][i % 3], face: 'happy' });
      for (var j = 0; j < 6; j += 2) g += I.soda(380 + j * 128 + 74, GY - 200, 0.45, 's18-s' + j);
      g += ham('s18h', 150, 0.5, { faces: ['happy'], armR: { a: 80, hand: 'point' } });
      g += LAB('s18-l', 700, 880, '1 client sur 2', BLU, 70, -3) + NUM('s18-n', 540, 640, '+21 000 € / MOIS', GRN, 110, -2);
      return g;
    },
    anim: function (tl, a, b, K) {
      var ts = K('prend un soda', a);
      talk(tl, 's18h', 'happy', a, b);
      pop(tl, '#s18-l', K('La moitié', a), 0.5);
      for (var i = 0; i < 6; i += 2) pop(tl, '#s18-s' + i, ts + i * 0.06);
      pop(tl, '#s18-n', K('21 000', a));
    }
  };

  // ================================================================ 19 · sans les sodas : tu perdrais de l'argent
  S[19] = {
    cam: [[540, 1050, 1.0, 1.06]],
    svg: function () {
      var g = bg() + ground();
      g += I.soda(640, 1200, 1.5, 's19-sd') + CROSS('s19-x', 640, 1120, 1.5);
      g += ham('s19h', 210, 0.6, { faces: ['sad'], armL: { a: 14 }, armR: { a: 14 } });
      g += NUM('s19-n', 540, 620, '−3 000 € / MOIS', RED, 110, -3);
      return g;
    },
    anim: function (tl, a, b, K) {
      talk(tl, 's19h', 'sad', a, b);
      gsap.set('#s19-x', { opacity: 0 }); ft(tl, '#s19-x', { opacity: 0, scale: 1.8 }, { opacity: 1, scale: 1, duration: 0.15, ease: 'power3.in' }, K('sodas,', a));
      pop(tl, '#s19-n', K('perdrais', a));
    }
  };

  // ================================================================ 20 · après les impôts : 13 000 € net par mois, grâce au soda
  S[20] = {
    cam: [[540, 1000, 1.0, 1.05]],
    svg: function () {
      var g = bg() + ground();
      g += NUM('s20-n1', 540, 560, '18 000 €', GRN, 120, -2) + CROSS('s20-x1', 540, 560, 1.1) + TAG('s20-t', 860, 650, '− LES IMPÔTS', RED, 48, 5);
      g += NUM('s20-n2', 540, 820, '13 000 € NET', GRN, 130, 2) + LAB('s20-l', 540, 940, 'par mois', '#222', 64, 0);
      g += I.soda(380, 1300, 0.95, 's20-sd') + CHECK('s20-ok', 380, 1060, 0.9);
      g += A.burger(780, 1310, 1.2) + CROSS('s20-x2', 780, 1260, 0.9);
      g += ham('s20h', 130, 0.44, { faces: ['grin'], armR: { a: 40 } });
      return g;
    },
    anim: function (tl, a, b, K) {
      var ti = K('impôts,', a), t13 = K('13 000', a), tg = K('Grâce au soda', a), tb = K('pas au burger', a);
      pop(tl, '#s20-n1', a + 0.05, 0.6); pop(tl, '#s20-t', ti);
      gsap.set('#s20-x1', { opacity: 0 }); ft(tl, '#s20-x1', { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.15, ease: 'power3.in' }, ti + 0.25);
      pop(tl, '#s20-n2', t13); pop(tl, '#s20-l', t13 + 0.4, 0.5);
      gsap.set('#s20-sd', { opacity: 0 }); pop(tl, '#s20-sd', tg - 0.1); pop(tl, '#s20-ok', tg + 0.2);
      gsap.set('#s20-x2', { opacity: 0 }); ft(tl, '#s20-x2', { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.15, ease: 'power3.in' }, tb + 0.1);
    }
  };

  // ================================================================ 21 · « Quel business je calcule la prochaine fois ? »
  S[21] = {
    cam: [[540, 1100, 1.0, 1.08]],
    svg: function () {
      var g = burst('s21-ray', '#ffc77a', '#ffe2b8', 540, 1200);
      g += G({ transform: T(260, 1000) }, G('s21-cm', P('M -150 -100 Q -150 -150 -100 -150 L 100 -150 Q 150 -150 150 -100 L 150 20 Q 150 70 100 70 L -20 70 L -90 130 L -70 70 L -100 70 Q -150 70 -150 20 Z', C.w, LW) +
        Ci(-60, -40, 18, C.rest, 0, { id: 's21-d0' }) + Ci(0, -40, 18, C.rest, 0, { id: 's21-d1' }) + Ci(60, -40, 18, C.rest, 0, { id: 's21-d2' })));
      g += NUM('s21-q', 830, 760, '?', YEL, 220, 10);
      g += A.hamster('s21h', 560, 1880, 1.1, { faces: ['happy', 'grin'], armL: { a: 18 }, armR: { a: 166, hand: 'point' } });
      return g;
    },
    anim: function (tl, a, b, K) {
      var td = K('Dis-le', a);
      ft(tl, '#s21-ray', { rotation: 0 }, { rotation: 30, duration: b - a + 0.3, ease: 'none' }, a);
      ft(tl, '#s21h', { y: 200 }, { y: 0, duration: 0.4, ease: 'back.out(1.8)' }, a);
      pop(tl, '#s21-q', a + 0.3); wob(tl, '#s21-q', a + 0.6, b - a);
      talk(tl, 's21h', 'happy', a, b);
      pop(tl, '#s21-cm', td - 0.05);
      for (var i = 0; i < 3; i++) ft(tl, '#s21-d' + i, { y: 0 }, { y: -16, duration: 0.25, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((b - td) / 0.25) }, td + 0.3 + i * 0.1);
    }
  };
})();
