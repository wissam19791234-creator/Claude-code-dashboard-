// « Ta salle de sport veut que tu ne viennes jamais » — série « business pas très éthique (mais légal) ».
// Même format court : fond clair et ligne de sol, gros chiffres (rouge = dépense, vert = gain), étiquettes manuscrites,
// plans « réaction » sur fond rayonnant. Salle de sport générique, aucune marque.
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
  var TXT = function (x, y, txt, fs, col, ex) { return el('text', Object.assign({ x: x, y: y, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Luckiest Guy', 'font-size': fs, fill: col }, ex || {}), esc(txt)); };
  // canapé vu de face ; le dossier se dessine derrière Hamsterdam (sofaBack), l'assise et les accoudoirs devant (sofaFront)
  var SOFA = '#e2574c', SOFA2 = '#c4433a';
  var sofaBack = function (x, y, s) { return G({ transform: T(x, y, s) }, R(-330, -420, 660, 300, 60, SOFA, LW) + P('M -110 -400 L -110 -140 M 110 -400 L 110 -140', null, 6, { stroke: SOFA2 })); };
  var sofaFront = function (x, y, s) {
    return G({ transform: T(x, y, s) }, R(-300, -190, 600, 120, 30, SOFA, LW) + R(-380, -260, 110, 230, 40, SOFA, LW) + R(270, -260, 110, 230, 40, SOFA, LW) + R(-330, -80, 660, 70, 20, SOFA2, LW) +
      R(-300, -14, 30, 30, 6, '#6b3d2a', 6) + R(270, -14, 30, 30, 6, '#6b3d2a', 6));
  };
  var chips = G({}, P('M -60 -90 L 60 -90 L 70 90 L -70 90 Z', '#ffd23f', 7) + P('M -60 -90 Q 0 -110 60 -90', null, 6) + Ci(0, 10, 34, C.red, 6) +
    E(-30, -100, 18, 12, '#f2c14e', 5) + E(10, -108, 18, 12, '#f2c14e', 5) + E(40, -98, 16, 11, '#f2c14e', 5));
  var remote = G({}, R(-18, -70, 36, 140, 12, '#2b2b33', 6) + Ci(0, -46, 8, C.red, 0) + R(-9, -20, 18, 10, 3, '#9aa5b1', 0) + R(-9, 0, 18, 10, 3, '#9aa5b1', 0) + R(-9, 20, 18, 10, 3, '#9aa5b1', 0));
  var tv = function (x, y, s) { return G({ transform: T(x, y, s) }, R(-200, -260, 400, 250, 16, '#2b2b33', LW) + R(-176, -238, 352, 206, 8, '#4c8dff', 0) + P('M -60 0 L -90 60 M 60 0 L 90 60', null, 10) + R(-120, 56, 240, 20, 8, '#6b3d2a', 6)); };
  var card = function (x, y, s, r, id) {
    return G({ transform: T(x, y, s, r || 0) }, G(id || {}, R(-170, -105, 340, 210, 22, '#2f8cff', LW) + R(-170, -56, 340, 36, 0, '#1f6fd6', 0) + R(-130, 10, 90, 64, 10, '#ffd23f', 6) +
      TXT(60, 40, 'ABONNÉ', 44, '#ffffff', { stroke: '#111', 'stroke-width': 6, 'paint-order': 'stroke' })));
  };
  var gym = function (x, y, s, id) {
    var g = R(-420, -620, 840, 620, 0, '#ffffff', LW) + R(-450, -720, 900, 120, 26, '#2f8cff', LW) + TXT(0, -660, 'SALLE DE SPORT 24/7', 64, '#ffffff', { stroke: '#111', 'stroke-width': 8, 'paint-order': 'stroke' });
    g += R(-380, -560, 470, 380, 16, '#bfe9ff', LW) + R(130, -470, 220, 470, 14, '#3b3b44', LW) + R(150, -450, 180, 300, 8, '#bfe9ff', 6);
    g += G({ transform: T(-145, -300) }, P('M -120 0 L 120 0', null, 16) + R(-150, -40, 30, 80, 8, '#3b3b44', 6) + R(120, -40, 30, 80, 8, '#3b3b44', 6));
    g += R(-420, -60, 840, 60, 0, '#2f8cff', LW);
    return G({ transform: T(x, y, s) }, G(id || {}, g));
  };
  var depot = function (x, y, s) {
    var g = P('M -440 0 L -440 -560 L 0 -700 L 440 -560 L 440 0 Z', '#c3c8d0', LW);
    for (var i = -380; i <= 380; i += 60) g += P('M ' + i + ' -20 L ' + i + ' ' + (-560 - (440 - Math.abs(i)) * 0.31), null, 4, { stroke: '#9aa5b1' });
    g += R(-200, -380, 400, 380, 8, '#8a94a6', LW);
    for (var k = 1; k < 8; k++) g += P('M -200 ' + (-380 + k * 47) + ' L 200 ' + (-380 + k * 47), null, 5, { stroke: '#6b7280' });
    return G({ transform: T(x, y, s) }, g);
  };
  var treadmill = function (x, y, s, id) {
    return G({ transform: T(x, y, s) }, G(id || {}, R(-160, -40, 320, 40, 14, '#3b3b44', LW) + R(-140, -60, 280, 24, 10, '#6b7280', 6) + P('M 120 -60 L 150 -300', null, 16) +
      R(90, -330, 120, 50, 12, '#2b2b33', 6) + R(104, -320, 60, 26, 4, '#7dff9a', 0)));
  };
  var bike = function (x, y, s, id) {
    return G({ transform: T(x, y, s) }, G(id || {}, R(-120, -30, 240, 30, 12, '#3b3b44', LW) + P('M -60 -30 L -20 -200 M 60 -30 L 40 -180 L -40 -180', null, 16) +
      Ci(60, -120, 50, '#9aa5b1', LW) + R(-60, -220, 80, 26, 12, '#2b2b33', 6) + P('M 40 -180 L 70 -260 L 110 -260', null, 12) + Ci(0, -110, 16, C.red, 5)));
  };
  var dumbbell = function (x, y, s, r, id) {
    return G({ transform: T(x, y, s, r || 0) }, G(id || {}, R(-90, -10, 180, 20, 8, '#9aa5b1', 6) + R(-130, -45, 40, 90, 10, '#2b2b33', 6) + R(90, -45, 40, 90, 10, '#2b2b33', 6) +
      R(-160, -32, 30, 64, 8, '#2b2b33', 6) + R(130, -32, 30, 64, 8, '#2b2b33', 6)));
  };
  var medal = G({}, P('M -50 -260 L -10 -80 L 10 -80 L 50 -260 Z', C.red, 6) + P('M -50 -260 L -30 -260 L 0 -110 Z', '#2f8cff', 0) + Ci(0, -20, 80, C.gold, LW) + Ci(0, -20, 58, null, 8, { stroke: C.gold2 }) +
    TXT(0, -16, '1', 80, C.gold2, { stroke: '#111', 'stroke-width': 6, 'paint-order': 'stroke' }));
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
  // billets qui partent du canapé vers la salle (prélèvement mensuel)
  var flow = function (tl, pre, n, a, b, dx, dy) {
    var r = A.rnd(5), per = Math.max(0.25, (b - a) / n);
    for (var k = 0; k < n; k++) {
      gsap.set('#' + pre + k, { opacity: 0 });
      ft(tl, '#' + pre + k, { x: 0, y: 0, rotation: 0, opacity: 1 }, { x: dx, y: dy - 120 * r(), rotation: 200, opacity: 1, duration: 0.9, ease: 'power1.inOut' }, a + k * per);
      ft(tl, '#' + pre + k, { opacity: 1 }, { opacity: 0, duration: 0.1, ease: 'none' }, a + k * per + 0.9);
    }
  };
  var couch = function (pre, x, s, face, o) {   // Hamsterdam affalé dans son canapé, chips et télécommande
    o = o || {};
    return sofaBack(x, GY, s) + A.hamster(pre, x, GY - 70 * s, s * 0.95, Object.assign({ faces: [face || 'smile'], shadow: false,
      armL: { a: 40, item: remote, itemRot: 40 }, armR: { a: 50, item: chips, itemRot: 50 } }, o)) + sofaFront(x, GY, s);
  };

  // ================================================================ 1 · accroche : « Ta salle de sport veut que tu ne viennes jamais »
  S[1] = {
    cam: [[540, 1050, 1.08, 1.0]],
    svg: function () {
      var g = bg('#ffe9d6') + ground('#f2dcc4');
      g += tv(860, 1180, 0.8);
      g += couch('h1', 360, 0.78, 'smile');
      g += card(600, 930, 0.62, -10, 's1-card');
      g += bills('s1-b', 8, 600, 930);
      g += G({ transform: T(850, 830, 0.38) }, G('s1-gym', gym(0, 0, 1)));
      g += NUM('s1-t1', 540, 260, 'TA SALLE DE SPORT', '#ffffff', 92, -3) + NUM('s1-t2', 540, 390, 'VEUT QUE TU NE', YEL, 100, -3) + NUM('s1-t3', 540, 520, 'VIENNES JAMAIS', RED, 120, -3);
      return g;
    },
    anim: function (tl, a, b, K) {
      pop(tl, '#s1-t1', a, 0.6); pop(tl, '#s1-t2', K('veut', a), 0.6); pop(tl, '#s1-t3', K('viennes', a), 0.4);
      ft(tl, '#s1-t3', { x: 0 }, { x: 8, duration: 0.05, ease: 'none', yoyo: true, repeat: 7 }, K('viennes', a) + 0.3);
      talk(tl, 'h1', 'smile', a, b);
      ft(tl, '#h1-aR', { rotation: -50 }, { rotation: -80, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 9 }, a);
      pop(tl, '#s1-card', a + 0.3, 0.5); pop(tl, '#s1-gym', K('devient', a) - 0.3, 0.5);
      flow(tl, 's1-b', 8, K('devient', a) - 0.2, b, 250, -150);
    }
  };

  // ================================================================ 2 · titre
  S[2] = {
    cam: [[540, 1000, 1.0, 1.05]],
    svg: function () {
      var g = bg('#bfe6ff') + A.cloud(180, 640, 0.6) + ground('#d8dde3');
      g += gym(600, GY, 0.82, 's2-gym');
      g += ham('h2', 190, 0.6, { faces: ['happy'], armR: { a: 150, item: dumbbell(0, 0, 0.6, 0), itemRot: 150 } });
      g += NUM('s2-t1', 540, 300, 'COMBIEN ÇA RAPPORTE', YEL, 92, -2) + NUM('s2-t2', 540, 420, "D'ÊTRE PROPRIÉTAIRE", '#ffffff', 92, -2) +
        G({ transform: T(540, 600, 1, -3) }, G('s2-t3', NUM('', 0, 0, "D'UNE SALLE", PNK, 130, 0) + NUM('', 0, 145, 'DE SPORT ?', BLU, 150, 0)));
      return g;
    },
    anim: function (tl, a, b, K) {
      pop(tl, '#s2-t1', a, 0.5); pop(tl, '#s2-t2', K("d'être", a), 0.5); pop(tl, '#s2-t3', K("d'une", a), 0.4);
      talk(tl, 'h2', 'happy', a, b);
      ft(tl, '#h2-aR', { rotation: -150 }, { rotation: -175, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 7 }, a);
    }
  };

  // ================================================================ 3 · l'entrepôt 15 000 €/mois, 150 machines à 400 000 € à crédit
  S[3] = {
    cam: [[540, 1000, 1.0, 1.05]],
    svg: function () {
      var g = bg() + ground();
      g += depot(330, GY, 0.62) + TAG('s3-t1', 330, 760, '15 000 € / MOIS', RED, 52, -4) + LAB('s3-l1', 330, 870, 'le loyer', ORA, 60, -2);
      var mach = treadmill(-150, 0, 0.72) + bike(60, 0, 0.8) + treadmill(250, 0, 0.72) + dumbbell(40, -340, 0.75, -10);
      g += G({ transform: T(780, GY) }, G('s3-m', mach));
      g += LAB('s3-l2', 790, 1060, '150 machines', BLU, 64, 3) + NUM('s3-n', 780, 620, '400 000 €', RED, 110, -2) + STAMP('s3-st', 780, 800, 'À CRÉDIT', RED, -9);
      return g;
    },
    anim: function (tl, a, b, K) {
      pop(tl, '#s3-t1', K('15 000', a)); pop(tl, '#s3-l1', K('15 000', a) + 0.3, 0.5);
      pop(tl, '#s3-m', K('150', a) - 0.1, 0.4); pop(tl, '#s3-l2', K('150', a) + 0.2, 0.5); pop(tl, '#s3-n', K('400 000', a));
      gsap.set('#s3-st', { opacity: 0 }); ft(tl, '#s3-st', { opacity: 0, scale: 2.4 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'power3.in' }, K('à crédit', a));
    }
  };

  // ================================================================ 4 · crédit, électricité, ménage, 4 salariés : 45 000 € par mois
  S[4] = {
    cam: [[540, 1000, 1.0, 1.05]],
    svg: function () {
      var g = bg() + ground();
      var it = [
        [G({}, R(-90, -120, 180, 150, 12, '#ffffff', LW) + TXT(0, -45, '€', 110, C.red, { stroke: '#111', 'stroke-width': 8, 'paint-order': 'stroke' })), 'crédit'],
        [G({}, P('M 20 -150 L -60 -10 L -6 -10 L -30 100 L 60 -50 L 6 -50 Z', '#ffe03a', LW)), 'électricité'],
        [G({}, P('M -70 -120 L 70 -120 L 56 20 L -56 20 Z', '#4c8dff', LW) + R(-8, -420, 16, 300, 6, C.wood, 6)), 'ménage'],
        [G({}, A.bust('', -50, -90, 0.5, { shirt: '#2f8cff' }) + A.bust('', 50, -90, 0.5, { shirt: '#2f8cff', skin: '#c98b5e' }) + A.bust('', 0, -20, 0.55, { shirt: '#2f8cff', skin: '#e2ad84' })), '4 salariés']
      ];
      it.forEach(function (q, k) {
        g += G({ transform: T(170 + k * 245, 1290) }, G('s4-i' + k, q[0] + el('text', { x: 0, y: 110, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Patrick Hand', 'font-size': 52, fill: ORA, stroke: '#fff', 'stroke-width': 8, 'paint-order': 'stroke' }, q[1])));
      });
      g += NUM('s4-n', 540, 640, '45 000 € / MOIS', RED, 116, -2) + LAB('s4-l', 540, 770, 'de charges', '#222', 64, 2);
      return g;
    },
    anim: function (tl, a, b, K) {
      pop(tl, '#s4-i0', K('le crédit', a)); pop(tl, '#s4-i1', K("l'électricité", a)); pop(tl, '#s4-i2', K('le ménage', a)); pop(tl, '#s4-i3', K('4 salariés', a));
      pop(tl, '#s4-n', K('45 000', a)); pop(tl, '#s4-l', K('charges', a), 0.5);
    }
  };

  // ================================================================ 5 · 300 places → logiquement 300 abonnements
  S[5] = {
    cam: [[540, 1000, 1.0, 1.04]],
    svg: function () {
      var g = bg() + ground();
      var crowd = '';
      for (var i = 0; i < 60; i++) crowd += G({ transform: T(130 + (i % 12) * 74, 920 + Math.floor(i / 12) * 90) }, Ci(0, -18, 18, '#c3c8d0', 5) + P('M -26 26 Q -26 0 0 0 Q 26 0 26 26 Z', '#c3c8d0', 5));
      g += R(80, 860, 920, 480, 30, null, 8, { stroke: '#2f8cff', 'stroke-dasharray': '30 20' }) + G('s5-cr', crowd);
      g += NUM('s5-n', 540, 640, '300 PLACES', BLU, 130, -3) + TAG('s5-t', 540, 1450 - 40, '300 ABONNEMENTS ?', '#111', 54, 3);
      return g;
    },
    anim: function (tl, a, b, K) {
      pop(tl, '#s5-n', K('300', a)); pop(tl, '#s5-cr', K('300', a) + 0.2, 0.6); pop(tl, '#s5-t', K('300 abonnements', a));
    }
  };

  // ================================================================ 6 · « Faux. » 4 000 abonnements × 20 € = 80 000 € par mois
  S[6] = {
    cam: [[540, 1000, 1.0, 1.05]],
    svg: function () {
      var g = bg() + ground();
      g += NUM('s6-o', 540, 520, '300', BLU, 140, -3) + CROSS('s6-x', 540, 520, 0.9);
      var cards = '';
      for (var i = 0; i < 14; i++) cards += card(170 + (i % 7) * 125, 1130 + Math.floor(i / 7) * 150, 0.42, (i % 3 - 1) * 8, 's6-c' + i);
      g += cards;
      g += NUM('s6-n1', 540, 720, '4 000 ABONNÉS', RED, 120, 2) + TAG('s6-t', 820, 860, '× 20 € / MOIS', BLU, 50, 4) + NUM('s6-n2', 540, 990, '80 000 € / MOIS', GRN, 110, -2);
      return g;
    },
    anim: function (tl, a, b, K) {
      var tf = K('Faux.', a);
      pop(tl, '#s6-o', a + 0.02, 0.6);
      gsap.set('#s6-x', { opacity: 0 }); ft(tl, '#s6-x', { opacity: 0, scale: 1.8 }, { opacity: 1, scale: 1, duration: 0.15, ease: 'power3.in' }, tf);
      var t4 = K('4 000', a);
      pop(tl, '#s6-n1', t4);
      for (var i = 0; i < 14; i++) pop(tl, '#s6-c' + i, t4 + i * 0.04, 0.3);
      pop(tl, '#s6-t', K('20 euros', a)); pop(tl, '#s6-n2', K('80 000', a));
    }
  };

  // ================================================================ 7 · « 80 000 ! Je m'ouvre une deuxième salle »
  S[7] = {
    cam: [[540, 1100, 1.0, 1.08]],
    svg: function () {
      var g = burst('s7-ray', '#fff0a8', '#fffbe6', 540, 1200);
      g += G({ transform: T(820, 1000, 0.42) }, G('s7-g2', gym(0, 0, 1)));
      g += A.hamster('h7', 440, 1900, 1.0, { faces: ['grin'], shades: 1, armL: { a: 140, hand: 'open' }, armR: { a: 150, hand: 'open' } });
      g += bills('s7-b', 14, 540, 1150);
      g += NUM('s7-n', 540, 520, '80 000 €', GRN, 170, -4) + LAB('s7-l', 820, 1080, '2e salle !', BLU, 70, 6);
      return g;
    },
    anim: function (tl, a, b, K) {
      ft(tl, '#s7-ray', { rotation: 0 }, { rotation: 30, duration: b - a + 0.2, ease: 'none' }, a);
      pop(tl, '#s7-n', a + 0.05); pop(tl, '#s7-g2', K('deuxième', a) - 0.1, 0.3); pop(tl, '#s7-l', K('deuxième', a) + 0.2, 0.5);
      ft(tl, '#h7-aL', { rotation: -130 }, { rotation: -165, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 9 }, a);
      ft(tl, '#h7-aR', { rotation: -165 }, { rotation: -130, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 9 }, a);
      rain(tl, 's7-b', 14, a, b, 41);
    }
  };

  // ================================================================ 8 · « Attends » : si les 4 000 viennent en même temps, la salle explose
  S[8] = {
    cam: [[540, 1000, 1.0, 1.06]],
    svg: function () {
      var g = bg() + ground();
      var skins = ['#f3c39b', '#e2ad84', '#c98b5e', '#8d5a3b'], cols = [C.red, BLU, '#8e5bd8', C.green, '#ffb03a', PNK], r = A.rnd(61), pp = '';
      for (var i = 0; i < 38; i++) pp += A.bust('s8-p' + i, Math.round(200 + r() * 680), Math.round(820 + r() * 520), 0.42 + r() * 0.12, { shirt: cols[i % 6], skin: skins[i % 4], hair: ['#3b2414', '#111', '#d9a04a'][i % 3] });
      g += G({ transform: T(540, GY) }, G('s8-gym', gym(0, 0, 0.92) + G({ transform: T(-540, -GY) }, pp)));
      g += G({ transform: T(540, 980) }, G('s8-boom', P('M 0 -330 L 90 -150 L 290 -230 L 190 -40 L 380 40 L 170 100 L 240 300 L 40 170 L -60 360 L -110 150 L -330 230 L -200 40 L -380 -60 L -170 -110 L -250 -300 L -60 -170 Z', YEL, LW) +
        TXT(0, 20, 'BOUM !', 150, RED, { stroke: '#111', 'stroke-width': 14, 'paint-order': 'stroke', 'stroke-linejoin': 'round' })));
      g += NUM('s8-n', 540, 420, '4 000 EN MÊME TEMPS', RED, 86, -3);
      return g;
    },
    anim: function (tl, a, b, K) {
      var t4 = K('les 4 000', a), te = K('explose', a);
      pop(tl, '#s8-n', t4);
      for (var i = 0; i < 38; i++) pop(tl, '#s8-p' + i, t4 + i * 0.035, 0.3);
      ft(tl, '#s8-gym', { x: 0 }, { x: 10, duration: 0.05, ease: 'none', yoyo: true, repeat: Math.ceil((b - t4) / 0.05) }, t4 + 0.6);
      ft(tl, '#s8-gym', { scaleX: 1, scaleY: 1 }, { scaleX: 1.04, scaleY: 0.98, duration: 0.12, ease: 'sine.inOut', yoyo: true, repeat: 9 }, t4 + 0.6);
      pop(tl, '#s8-boom', te, 0.2);
    }
  };

  // ================================================================ 9 · l'astuce de pro : janvier plein, mars à moitié vide
  S[9] = {
    cam: [[540, 1000, 1.0, 1.04]],
    svg: function () {
      var g = burst('s9-ray', '#fff0a8', '#fffbe6', 540, 1100);
      g += G({ transform: T(540, 430, 1, -4) }, G('s9-ban', R(-380, -80, 760, 160, 14, '#ffffff', LW) + TXT(0, 6, 'ASTUCE DE PRO', 104, RED)));
      g += P('M 170 1440 L 170 760 M 170 1440 L 950 1440', null, 10);
      var bars = [['JANV.', 600, GRN], ['FÉV.', 420, ORA], ['MARS', 260, RED]];
      bars.forEach(function (q, k) {
        var x = 300 + k * 240;
        g += G({ transform: T(x, 1440) }, G('s9-b' + k, R(-80, -q[1], 160, q[1], 12, q[2], LW))) + TXT(x, 1500, q[0], 56, '#111');
      });
      g += TAG('s9-t', 780, 900, '− DE LA MOITIÉ', RED, 52, 5) + ARROW('s9-a', 360, 860, 760, 1150, RED);
      return g;
    },
    anim: function (tl, a, b, K) {
      ft(tl, '#s9-ray', { rotation: 0 }, { rotation: 20, duration: b - a + 0.2, ease: 'none' }, a);
      pop(tl, '#s9-ban', K("l'astuce", a));
      [K('janvier', a), K('En mars', a) - 0.3, K('En mars', a)].forEach(function (t, k) {
        gsap.set('#s9-b' + k, { scaleY: 0 }); ft(tl, '#s9-b' + k, { scaleY: 0 }, { scaleY: 1, duration: 0.4, ease: 'back.out(1.6)' }, t);
      });
      pop(tl, '#s9-a', K('plus de la moitié', a), 0.5); pop(tl, '#s9-t', K('plus de la moitié', a) + 0.2);
    }
  };

  // ================================================================ 10 · ils continuent de payer, chaque mois, sans venir
  S[10] = {
    cam: [[540, 1000, 1.0, 1.05]],
    svg: function () {
      var g = bg('#ffe9d6') + ground('#f2dcc4');
      g += G({ transform: T(840, 760, 0.5) }, gym(0, 0, 1));
      g += couch('h10', 330, 0.74, 'smile');
      g += bills('s10-b', 10, 330, 900);
      g += G({ transform: T(330, 520) }, G('s10-cal', R(-130, -150, 260, 300, 18, C.w, LW) + R(-130, -150, 260, 74, 18, C.red, LW) + TXT(0, 30, '−20 €', 84, RED)));
      g += LAB('s10-l', 760, 1080, 'chaque mois…', BLU, 64, -3);
      return g;
    },
    anim: function (tl, a, b, K) {
      talk(tl, 'h10', 'smile', a, b);
      flow(tl, 's10-b', 10, a + 0.2, b, 480, -200);
      pop(tl, '#s10-cal', K('Chaque mois', a) - 0.2);
      ft(tl, '#s10-cal', { rotation: 0 }, { rotation: 8, duration: 0.15, ease: 'sine.inOut', yoyo: true, repeat: 7 }, K('Chaque mois', a) + 0.2);
      pop(tl, '#s10-l', K('Chaque mois', a), 0.5);
      ft(tl, '#h10-aR', { rotation: -50 }, { rotation: -80, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 9 }, a);
    }
  };

  // ================================================================ 11 · TVA et charges en moins : ≈ 22 000 € par mois
  S[11] = {
    cam: [[540, 1000, 1.0, 1.04]],
    svg: function () {
      var g = bg() + ground();
      g += NUM('s11-n1', 540, 520, '80 000 €', GRN, 140, -2) + CROSS('s11-x', 540, 520, 1.3);
      g += TAG('s11-t1', 300, 680, '− TVA', RED, 56, -4) + TAG('s11-t2', 760, 680, '− 45 000 € DE CHARGES', RED, 44, 4);
      g += NUM('s11-n2', 540, 900, '≈ 22 000 € / MOIS', GRN, 110, 2);
      g += ham('h11', 540, 0.6, { faces: ['proud'], armR: { a: 150, hand: 'thumb' } });
      return g;
    },
    anim: function (tl, a, b, K) {
      pop(tl, '#s11-n1', a + 0.03, 0.6); pop(tl, '#s11-t1', K('TVA', a)); pop(tl, '#s11-t2', K('45 000', a));
      gsap.set('#s11-x', { opacity: 0 }); ft(tl, '#s11-x', { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.15, ease: 'power3.in' }, K('il te reste', a) - 0.1);
      pop(tl, '#s11-n2', K('22 000', a));
      talk(tl, 'h11', 'proud', a, b);
    }
  };

  // ================================================================ 12 · les meilleurs clients : ceux qui ne viennent jamais
  S[12] = {
    cam: [[540, 1000, 1.0, 1.05]],
    svg: function () {
      var g = bg('#ffe9d6') + ground('#f2dcc4');
      g += couch('h12', 760, 0.66, 'smile');
      var lst = [['ils paient', 'ils paient,'], ['ils n\'usent pas les machines', "n'usent"], ['ils ne prennent pas de place', 'prennent']];
      lst.forEach(function (q, k) {
        g += G({ transform: T(0, 0) }, G('s12-c' + k, G({ transform: T(110, 560 + k * 150, 0.42) }, P('M -90 0 L -26 64 L 100 -80', null, 46, { stroke: '#111' }) + P('M -90 0 L -26 64 L 100 -80', null, 30, { stroke: GRN })) +
          el('text', { x: 170, y: 560 + k * 150, 'dominant-baseline': 'central', 'font-family': 'Patrick Hand', 'font-size': 66, fill: '#222', stroke: '#fff', 'stroke-width': 8, 'paint-order': 'stroke' }, esc(q[0]))));
      });
      g += NUM('s12-n', 540, 380, 'MEILLEURS CLIENTS', BLU, 104, -3);
      return g;
    },
    anim: function (tl, a, b, K) {
      pop(tl, '#s12-n', K('meilleurs', a), 0.5);
      [K('ils paient', a), K("n'usent", a), K('prennent', a)].forEach(function (t, k) { gsap.set('#s12-c' + k, { opacity: 0 }); ft(tl, '#s12-c' + k, { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.25, ease: 'back.out(2)' }, t); });
      talk(tl, 'h12', 'smile', a, b);
    }
  };

  // ================================================================ 13 · « bravo, t'es son client préféré »
  S[13] = {
    cam: [[540, 1100, 1.0, 1.08]],
    svg: function () {
      var g = burst('s13-ray', '#ffd1dc', '#fff4f6', 540, 1200);
      g += couch('h13', 540, 0.92, 'grin');
      g += G({ transform: T(540, 1280) }, G('s13-m', medal));
      var conf = '', r = A.rnd(7);
      for (var i = 0; i < 30; i++) conf += G({ transform: T(Math.round(r() * 1080), -60) }, G('s13-c' + i, R(-9, -16, 18, 32, 3, [C.rest, C.red, '#ffd23f', '#4c8dff', '#2fbf4a'][i % 5], 4)));
      g += conf + NUM('s13-n', 540, 480, 'CLIENT PRÉFÉRÉ', PNK, 120, -3);
      return g;
    },
    anim: function (tl, a, b, K) {
      var r = A.rnd(13), tb = K('bravo', a);
      ft(tl, '#s13-ray', { rotation: 0 }, { rotation: -25, duration: b - a + 0.2, ease: 'none' }, a);
      gsap.set('#s13-m', { opacity: 0 }); ft(tl, '#s13-m', { opacity: 1, y: -900 }, { opacity: 1, y: 0, duration: 0.5, ease: 'bounce.out' }, tb - 0.1);
      pop(tl, '#s13-n', K('client préféré', a));
      for (var i = 0; i < 30; i++) ft(tl, '#s13-c' + i, { y: 0, rotation: 0, x: 0 }, { y: 2050, x: (r() - 0.5) * 300, rotation: 360 + r() * 540, duration: 1.8 + r(), ease: 'none' }, tb + r() * 1.2);
    }
  };

  // ================================================================ 14 · « Quel business louche je calcule la prochaine fois ? »
  S[14] = {
    cam: [[540, 1100, 1.0, 1.08]],
    svg: function () {
      var g = burst('s14-ray', '#bfe6ff', '#e6f5ff', 540, 1200);
      g += G({ transform: T(260, 1000) }, G('s14-cm', P('M -150 -100 Q -150 -150 -100 -150 L 100 -150 Q 150 -150 150 -100 L 150 20 Q 150 70 100 70 L -20 70 L -90 130 L -70 70 L -100 70 Q -150 70 -150 20 Z', C.w, LW) +
        Ci(-60, -40, 18, BLU, 0, { id: 's14-d0' }) + Ci(0, -40, 18, BLU, 0, { id: 's14-d1' }) + Ci(60, -40, 18, BLU, 0, { id: 's14-d2' })));
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
