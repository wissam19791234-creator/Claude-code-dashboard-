// Plans 1 à 10 de « Combien rapporte un McDo ? » : décor (svg) + animations calées sur la voix (anim).
// Fast-food générique orange et blanc : aucun logo, aucune couleur de marque.
(function () {
  var A = window.ART, C = A.C, P = A.P, E = A.E, Ci = A.Ci, R = A.R, G = A.G, T = A.T, el = A.el, LW = A.LW;
  var S = A.SCENES = A.SCENES || {};
  var ft = function (tl, t, a, b, at) { A.ft(tl, t, a, b, at); };
  var bg = A.bg = function (c) { return R(-300, -300, 1680, 2520, 0, c, 0); };
  var pop = A.pop = function (tl, sel, t, s0) {
    gsap.set(sel, { scale: s0 == null ? 0 : s0, opacity: 0 });
    ft(tl, sel, { scale: s0 == null ? 0 : s0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2.4)' }, t);
  };
  var hide = A.hide = function (tl, sel, t, d) { ft(tl, sel, { opacity: 1 }, { opacity: 0, duration: d || 0.2, ease: 'none' }, t); };
  // mur rayé + comptoir du fast-food
  A.wall = function (c1, c2, y1) {
    var g = R(-300, -300, 1680, y1 + 300, 0, c1, 0);
    for (var x = -40; x < 1120; x += 160) g += R(x, -300, 80, y1 + 300, 0, c2, 0);
    return g;
  };
  A.counter = function (y) {
    return R(-40, y, 1160, 2000 - y, 0, C.rest, LW) + R(-40, y + 70, 1160, 34, 0, C.w, 0) + R(-40, y - 34, 1160, 50, 14, C.w, LW);
  };
  A.icon = {
    cup: function (x, y, s) { return G({ transform: T(x, y, s) }, P('M -50 -70 L 50 -70 L 38 80 L -38 80 Z', C.w, 8) + R(-58, -96, 116, 28, 10, C.rest, 8) + P('M 10 -96 L 30 -150', null, 9) + R(-46, -10, 92, 36, 0, C.rest, 0) + P('M -50 -70 L 50 -70 L 38 80 L -38 80 Z', null, 8)); },
    patty: function (x, y, s) { return G({ transform: T(x, y, s) }, E(0, 0, 110, 40, C.patty, LW) + P('M -70 -10 Q -40 -22 -10 -10 M 20 -14 Q 50 -24 76 -8', null, 6, { stroke: '#a85a2c' })); },
    bun: function (x, y, s) { return G({ transform: T(x, y, s) }, P('M -110 20 Q -110 -96 0 -98 Q 110 -96 110 20 Z', C.bun, LW) + E(-40, -50, 8, 5, C.w, 0) + E(10, -66, 8, 5, C.w, 0) + E(50, -40, 8, 5, C.w, 0)); },
    oil: function (x, y, s) { return G({ transform: T(x, y, s) }, P('M -46 -60 Q -50 -100 -20 -110 L -20 -150 L 20 -150 L 20 -110 Q 50 -100 46 -60 L 46 90 Q 46 110 26 110 L -26 110 Q -46 110 -46 90 Z', '#ffd84a', LW) + R(-26, -176, 52, 32, 8, C.green2, 8) + R(-30, -20, 60, 70, 10, C.w, 6)); },
    bolt: function (x, y, s, c) { return G({ transform: T(x, y, s) }, P('M 20 -120 L -60 20 L -6 20 L -30 130 L 60 -20 L 6 -20 Z', c || '#ffe03a', LW)); },
    cone: function (x, y, s) { return G({ transform: T(x, y, s) }, P('M -20 -110 L 20 -110 L 60 60 L -60 60 Z', C.rest, LW) + P('M -32 -50 L 32 -50 L 40 -10 L -40 -10 Z', C.w, 0) + R(-80, 50, 160, 30, 8, C.rest, LW)); },
    car: function (x, y, s) { return G({ transform: T(x, y, s) }, P('M -170 20 L -170 -40 Q -160 -70 -110 -74 L -70 -130 Q -60 -140 -40 -140 L 60 -140 Q 80 -140 94 -126 L 130 -74 Q 170 -70 170 -30 L 170 20 Z', '#4c8dff', LW) +
      P('M -60 -120 L 40 -120 L 76 -78 L -88 -78 Z', '#cfefff', 7) + Ci(-100, 26, 40, '#333', LW) + Ci(100, 26, 40, '#333', LW) + Ci(-100, 26, 14, C.steel, 5) + Ci(100, 26, 14, C.steel, 5)); },
    kiosk: function (x, y, s) { return G({ transform: T(x, y, s) }, R(-70, -300, 140, 300, 20, C.w, LW) + R(-52, -276, 104, 150, 10, '#2b2b33', 7) + R(-36, -258, 72, 40, 6, C.rest, 0) + R(-36, -206, 32, 32, 6, C.cheese, 0) + R(4, -206, 32, 32, 6, C.lettuce, 0) + R(-40, -96, 80, 16, 6, C.steel2, 5)); },
    oven: function (x, y, s) { return G({ transform: T(x, y, s) }, R(-110, -180, 220, 180, 16, C.steel, LW) + R(-80, -150, 160, 90, 10, '#2b2b33', 7) + R(-80, -40, 160, 20, 6, C.steel2, 5) + Ci(-60, -168, 0, null, 0)); }
  };

  // ================================================================ 1 · accroche : le plateau et la toute petite pièce
  S[1] = {
    cam: [[540, 1240, 1.16, 1.0], [700, 1360, 1.3, 1.38]],
    svg: function () {
      var g = A.wall('#ffe2bf', '#ffd2a1', 1560);
      g += R(110, 660, 860, 330, 30, '#2b2b33', LW);
      g += R(150, 700, 240, 250, 18, '#ffefd8', 7) + A.burger(270, 850, 0.8) + R(420, 700, 240, 250, 18, '#ffefd8', 7) + A.fries(540, 830, 0.75) + R(690, 700, 240, 250, 18, '#ffefd8', 7) + A.icon.cup(810, 840, 0.8);
      g += A.counter(1560);
      var tray = A.tray(-50, -36, 1, 330) + A.fries(30, -122, 0.6) + A.burger(-130, -84, 0.62);
      g += A.hamster('s1h', 540, 2060, 1.45, {
        faces: ['smile', 'shock'], look: 1,
        armL: { a: 60, item: tray, itemRot: 60 },
        armR: { a: 118, item: A.coin(0, -44, 21) + G('s1-sp', A.sparkle(30, -86, 0.55)), itemRot: 118 }
      });
      return g;
    },
    anim: function (tl, a, b, K) {
      var tShock = K('Entre', a);
      ft(tl, '#s1h', { y: 30 }, { y: 0, duration: 0.45, ease: 'back.out(2)' }, a);
      ft(tl, '#s1-sp', { scale: 0.2, rotation: 0 }, { scale: 1.2, rotation: 90, duration: 0.5, ease: 'sine.inOut', yoyo: true, repeat: 13 }, a);
      A.talk(tl, 's1h', 'smile', a, tShock, 0);
      A.blink(tl, 's1h', [a + 1.6, a + 3.4]);
      A.face(tl, 's1h', 'smile', 'shock', tShock);
      ft(tl, '#s1h', { y: 0 }, { y: -40, duration: 0.14, ease: 'power2.out', yoyo: true, repeat: 1 }, tShock);
      ft(tl, '#s1h-hd', { rotation: 0 }, { rotation: 7, duration: 0.3, ease: 'back.out(2)' }, tShock);
      ft(tl, '#s1h-aR', { rotation: -118 }, { rotation: -128, duration: 0.3, ease: 'back.out(2)' }, tShock);
      ft(tl, '#s1h-itR', { scale: 1 }, { scale: 1.35, duration: 0.25, ease: 'back.out(3)' }, K('et 1', tShock));
    }
  };

  // ================================================================ 2 · « Moi c'est Hamsterdam, et aujourd'hui, j'ouvre un McDo »
  function resto(x, y, s, id) {
    var g = '';
    g += R(-480, -660, 960, 660, 0, C.w, LW);
    g += R(-510, -780, 1020, 150, 30, C.rest, LW) + R(-510, -716, 1020, 26, 0, C.w, 0) + R(-510, -780, 1020, 150, 30, null, LW);
    g += Ci(-330, -860, 92, C.rest, LW) + Ci(-330, -860, 72, C.w, 7) + A.burger(-330, -850, 0.5) + R(-342, -772, 24, 0, 0, null, 0);
    for (var i = 0; i < 2; i++) {
      var wx = i ? 130 : -440;
      g += R(wx, -540, 310, 330, 18, '#bfe9ff', LW) + P('M ' + (wx + 40) + ' -500 L ' + (wx + 110) + ' -500 M ' + (wx + 40) + ' -470 L ' + (wx + 80) + ' -470', null, 10, { stroke: C.w });
      var aw = '';
      for (var k = 0; k < 6; k++) aw += P('M ' + (wx - 10 + k * 55) + ' -600 L ' + (wx + 45 + k * 55) + ' -600 L ' + (wx + 45 + k * 55) + ' -560 Q ' + (wx + 17 + k * 55) + ' -520 ' + (wx - 10 + k * 55) + ' -560 Z', k % 2 ? C.w : C.rest, 7);
      g += aw;
    }
    g += R(-120, -480, 240, 480, 14, C.rest, LW) + R(-92, -450, 184, 300, 10, '#bfe9ff', 7) + R(-92, -120, 184, 26, 6, C.w, 5) + Ci(70, -230, 12, C.w, 5);
    g += R(-480, -70, 960, 70, 0, C.rest, LW);
    return G({ transform: T(x, y, s), id: id }, g);
  }
  A.resto = resto;
  function balloon(id, x, y, c) {
    return G({ transform: T(x, y) }, G(id, P('M 0 0 Q -20 120 10 230', null, 5) + E(0, -70, 62, 76, c, LW) + P('M -10 4 L 10 4 L 0 -10 Z', c, 6) + E(-22, -100, 12, 20, C.w, 0, { opacity: 0.8 })));
  }
  S[2] = {
    cam: [[540, 1240, 1.0, 1.08]],
    svg: function () {
      var g = bg(C.sky);
      g += A.sun('s2-sun', 900, 360, 1);
      g += G('s2-cl1', A.cloud(220, 420, 1)) + G('s2-cl2', A.cloud(700, 620, 0.7));
      g += R(-100, 1530, 1280, 500, 0, '#7ed957', LW) + R(-100, 1560, 1280, 120, 0, '#d8dde3', LW);
      g += resto(540, 1560, 1, 's2-resto');
      g += balloon('s2-b1', 300, 1240, C.rest) + balloon('s2-b2', 220, 1300, C.w) + balloon('s2-b3', 790, 1250, C.red) + balloon('s2-b4', 870, 1300, C.rest);
      g += P('M 120 1330 L 960 1330', null, 26, { stroke: C.red }) + P('M 120 1330 L 960 1330', null, 0);
      var conf = '', r = A.rnd(7);
      for (var i = 0; i < 36; i++) conf += G({ transform: T(Math.round(r() * 1080), -60) }, G('s2-c' + i, R(-9, -16, 18, 32, 3, [C.rest, C.red, '#ffd23f', '#4c8dff', C.w][i % 5], 4)));
      g += conf;
      g += A.hamster('s2h', 540, 1830, 0.98, { faces: ['happy'], armL: { a: 112, hand: 'open' }, armR: { a: 112, hand: 'open' } });
      return g;
    },
    anim: function (tl, a, b, K) {
      var d = b - a + 0.3, r = A.rnd(11);
      ft(tl, '#s2-sun', { rotation: 0 }, { rotation: 40, duration: d, ease: 'none' }, a);
      ft(tl, '#s2-cl1', { x: 0 }, { x: 60, duration: d, ease: 'none' }, a);
      ft(tl, '#s2-cl2', { x: 0 }, { x: -50, duration: d, ease: 'none' }, a);
      ['b1', 'b2', 'b3', 'b4'].forEach(function (k, i) { A.idle(tl, '#s2-' + k, d, 14, 1.4 + i * 0.2, a); });
      ft(tl, '#s2h', { y: 260, scale: 0.85 }, { y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.8)' }, a);
      ft(tl, '#s2h-aL', { rotation: -40 }, { rotation: -112, duration: 0.45, ease: 'back.out(2)' }, a + 0.15);
      ft(tl, '#s2h-aR', { rotation: -40 }, { rotation: -112, duration: 0.45, ease: 'back.out(2)' }, a + 0.15);
      A.talk(tl, 's2h', 'happy', a, b, 0);
      for (var i = 0; i < 36; i++) {
        var t0 = a + r() * 1.6, dur = 1.6 + r() * 1.2;
        ft(tl, '#s2-c' + i, { y: 0, rotation: 0, x: 0 }, { y: 2050, x: (r() - 0.5) * 300, rotation: 360 + r() * 540, duration: dur, ease: 'none' }, t0);
      }
    }
  };

  // ================================================================ 3 · la formation : friteuse, instructeur, calendrier qui s'effeuille
  S[3] = {
    cam: [[540, 1300, 1.02, 1.1], [520, 1420, 1.32, 1.4], [700, 1150, 1.12, 1.06]],
    svg: function () {
      var g = bg('#f4f7fb');
      for (var y = 0; y < 1500; y += 90) g += P('M -100 ' + y + ' L 1180 ' + y, null, 4, { stroke: '#d5dde6' });
      for (var x = 0; x < 1100; x += 90) g += P('M ' + x + ' 0 L ' + x + ' 1500', null, 4, { stroke: '#d5dde6' });
      g += R(-100, 1500, 1280, 520, 0, '#ffcf99', LW);
      for (var k = 0; k < 8; k++) g += P('M ' + (k * 160 - 80) + ' 1500 L ' + (k * 220 - 320) + ' 2000', null, 4, { stroke: '#e8b47c' });
      // calendrier (pages qui s'envolent) et horloge
      g += G({ transform: T(820, 860) }, R(-130, -150, 260, 300, 18, C.w, LW) + R(-130, -150, 260, 70, 18, C.rest, LW) + Ci(-60, -150, 12, C.steel2, 6) + Ci(60, -150, 12, C.steel2, 6));
      var page = function (i) {
        var gr = '';
        for (var r2 = 0; r2 < 4; r2++) for (var c2 = 0; c2 < 5; c2++) gr += R(-100 + c2 * 42, -50 + r2 * 40, 30, 28, 4, (r2 * 5 + c2) % 7 === 3 ? C.rest : '#e3e8ee', 0);
        return G({ transform: T(820, 860) }, G('s3-pg' + i, R(-118, -76, 236, 216, 8, C.w, 6) + gr));
      };
      for (var i = 9; i >= 0; i--) g += page(i);
      g += G({ transform: T(470, 800) }, Ci(0, 0, 92, C.w, LW) + Ci(0, 0, 8, C.k, 0) + G('s3-hh', P('M 0 0 L 0 -48', null, 12)) + G('s3-mh', P('M 0 0 L 0 -72', null, 8, { stroke: C.red })));
      // friteuse
      g += G({ transform: T(860, 1900) }, R(-220, -440, 440, 440, 22, C.steel, LW) + R(-180, -380, 360, 120, 14, C.steel2, 7) + Ci(-120, -150, 22, C.k, 0) + Ci(-50, -150, 22, C.red, 0) +
        R(-200, -500, 400, 80, 16, '#3b3b44', LW) + E(0, -470, 170, 26, '#e8b23a', 0) +
        G('s3-fr', R(-120, -560, 22, 90, 4, C.fry, 5) + R(-80, -580, 22, 110, 4, C.fry, 5, { transform: 'rotate(8 -70 -470)' }) + R(-30, -566, 22, 96, 4, C.fry, 5) + R(20, -584, 22, 114, 4, C.fry, 5, { transform: 'rotate(-6 30 -470)' }) + R(70, -560, 22, 90, 4, C.fry, 5)) +
        P('M -150 -488 L -300 -330', null, 16) + P('M -150 -488 L -300 -330', null, 6, { stroke: C.steel2 }));
      var bub = '';
      for (var j = 0; j < 7; j++) bub += Ci(750 + j * 40 - 120, 1430 + (j % 2) * 10, 10, '#fff3c4', 5, { id: 's3-b' + j });
      g += bub;
      for (var q = 0; q < 3; q++) g += G({ transform: T(780 + q * 70, 1380) }, G('s3-st' + q, Ci(0, 0, 30, C.w, 0, { opacity: 0.9 }) + Ci(26, -10, 22, C.w, 0, { opacity: 0.9 })));
      g += A.person('s3-ins', 170, 1910, 1.12, { shirt: C.rest, cap: C.rest, arms: 'clip', face: 'stern', skin: '#e2ad84', w: 270, collar: 1 });
      g += A.hamster('s3h', 520, 1860, 0.82, { faces: ['worry', 'shock'], apron: 1, sweat: 1, armL: { a: 22 }, armR: { a: 70 } });
      return g;
    },
    anim: function (tl, a, b, K) {
      var d = b - a + 0.3, r = A.rnd(5);
      for (var j = 0; j < 7; j++) ft(tl, '#s3-b' + j, { scale: 0, opacity: 1 }, { scale: 1.4, opacity: 0, duration: 0.5, ease: 'power1.out', repeat: Math.ceil(d / 0.6), repeatDelay: 0.1 }, a + j * 0.09);
      for (var q = 0; q < 3; q++) ft(tl, '#s3-st' + q, { y: 0, opacity: 0.9, scale: 0.6 }, { y: -320, opacity: 0, scale: 1.5, duration: 1.6, ease: 'none', repeat: Math.ceil(d / 1.6) }, a + q * 0.5);
      A.idle(tl, '#s3-fr', d, 8, 0.5, a);
      A.talk(tl, 's3h', 'worry', a, b, 0);
      A.blink(tl, 's3h', [a + 2.2, a + 5.1, a + 7.4]);
      ft(tl, '#s3h-aR', { rotation: -70 }, { rotation: -76, duration: 0.12, ease: 'none', yoyo: true, repeat: Math.ceil(d / 0.12) }, a);
      ft(tl, '#s3h-sw', { y: 0 }, { y: 16, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil(d / 0.6) }, a);
      ft(tl, '#s3-ins-hd', { rotation: -6 }, { rotation: 6, duration: 0.5, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil(d / 0.5) }, a);
      var tm = K('9 et 24', a);
      A.face(tl, 's3h', 'worry', 'shock', tm);
      A.face(tl, 's3h', 'shock', 'worry', tm + 1.4);
      for (var i = 0; i < 10; i++) {
        var t0 = tm + i * 0.22;
        ft(tl, '#s3-pg' + i, { x: 0, y: 0, rotation: 0, opacity: 1 }, { x: 260 + r() * 200, y: -420 - r() * 200, rotation: 60 + r() * 120, opacity: 0, duration: 0.7, ease: 'power2.in' }, t0);
      }
      ft(tl, '#s3-hh', { rotation: 0 }, { rotation: 720, duration: 2.6, ease: 'none' }, tm);
      ft(tl, '#s3-mh', { rotation: 0 }, { rotation: 8640, duration: 2.6, ease: 'none' }, tm);
    }
  };

  // ================================================================ 4 · le plus beau costard, devant le miroir
  S[4] = {
    cam: [[560, 1260, 1.04, 1.14]],
    svg: function () {
      var g = bg('#e9dcff') + R(-100, 1560, 1280, 500, 0, '#cdb4ff', LW);
      for (var x = 40; x < 1080; x += 180) g += P('M ' + x + ' 0 L ' + x + ' 1560', null, 10, { stroke: '#dccbff' });
      g += el('defs', {}, el('clipPath', { id: 's4-clip' }, E(780, 1180, 210, 410, '#fff', 0)));
      g += E(780, 1180, 236, 436, C.wood, LW) + E(780, 1180, 210, 410, '#d6f0ff', LW);
      g += G({ 'clip-path': 'url(#s4-clip)' }, A.hamster('s4r', 780, 1720, 0.82, { faces: ['proud'], flip: 1, shadow: false, armR: { a: -86, len: 128 }, armL: { a: 30 } }) +
        P('M 600 900 L 720 780 M 620 1000 L 800 820', null, 22, { stroke: C.w, opacity: 0.55 }));
      g += R(740, 1600, 80, 0, 0, null, 0);
      g += A.hamster('s4h', 330, 1860, 1.0, { faces: ['proud'], armR: { a: -86, len: 128 }, armL: { a: 30 } });
      [[120, 980, 0.9], [560, 900, 0.7], [520, 1200, 0.5], [110, 1360, 0.6], [600, 1450, 0.45], [300, 820, 0.5]].forEach(function (p, i) { g += G({ transform: T(p[0], p[1], p[2]) }, A.sparkle(0, 0, 1, { id: 's4-sp' + i })); });
      return g;
    },
    anim: function (tl, a, b) {
      ['s4h', 's4r'].forEach(function (h) {
        ft(tl, '#' + h + '-aR', { rotation: 82 }, { rotation: 92, duration: 0.18, ease: 'sine.inOut', yoyo: true, repeat: 9 }, a);
        ft(tl, '#' + h + '-hd', { rotation: 0 }, { rotation: -6, duration: 0.4, ease: 'back.out(2)' }, a + 0.1);
      });
      A.talk(tl, 's4h', 'proud', a, b, 0);
      for (var i = 0; i < 6; i++) ft(tl, '#s4-sp' + i, { scale: 0, rotation: 0 }, { scale: 1, rotation: 90, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 5 }, a + i * 0.11);
    }
  };

  // ================================================================ 5 · la facture : le droit d'entrée, le videur
  S[5] = {
    cam: [[520, 1280, 1.0, 1.06], [420, 1300, 1.2, 1.3]],
    svg: function () {
      var g = bg('#4b3a6b');
      for (var x = -60; x < 1100; x += 120) for (var y = 0; y < 1600; y += 120) g += P('M ' + x + ' ' + (y + 60) + ' L ' + (x + 60) + ' ' + y + ' L ' + (x + 120) + ' ' + (y + 60) + ' L ' + (x + 60) + ' ' + (y + 120) + ' Z', null, 4, { stroke: '#5a4880' });
      g += R(-100, 1600, 1280, 420, 0, '#6b4a33', LW) + P('M 560 1600 L 880 1600 L 1080 1920 L 400 1920 Z', '#c0392b', LW);
      g += G({ transform: T(720, 1610) }, R(-250, -930, 500, 930, 24, '#8b4a22', LW) + R(-216, -890, 200, 860, 12, '#a65c2c', 7) + R(16, -890, 200, 860, 12, '#a65c2c', 7) +
        Ci(-40, -440, 18, C.gold, 7) + Ci(40, -440, 18, C.gold, 7) + Ci(-300, -700, 34, '#ffe08a', LW) + Ci(300, -700, 34, '#ffe08a', LW));
      g += A.person('s5-dm', 715, 1900, 1.2, { w: 440, shirt: '#1d1d24', pants: '#15151b', arms: 'cross', face: 'stern', shades: 1, bald: 1, skin: '#c98b5e', tie: '#111111', hr: 124 });
      g += A.hamster('s5h', 290, 1880, 0.82, { faces: ['worry', 'awk'], sweat: 1, blush: 1, armL: { a: 160 }, armR: { a: 160 } });
      g += G({ transform: T(290, 1250) }, G('s5-bag', A.bag(0, 0, 1.05)));
      var rc = R(-110, 0, 220, 1300, 0, C.w, LW);
      for (var y2 = 60; y2 < 1260; y2 += 52) rc += P('M -80 ' + y2 + ' L ' + (40 + (y2 * 7) % 40) + ' ' + y2, null, 7, { stroke: '#b9c0c8' });
      g += el('defs', {}, el('clipPath', { id: 's5-rcl' }, R(800, -100, 400, 1700, 0, '#fff', 0)));
      g += G({ 'clip-path': 'url(#s5-rcl)' }, G({ transform: T(1000, 0, 1, 4) }, G('s5-rc', rc + P('M -110 1300 L -88 1320 L -66 1300 L -44 1320 L -22 1300 L 0 1320 L 22 1300 L 44 1320 L 66 1300 L 88 1320 L 110 1300', C.w, LW))));
      g += G({ transform: T(1000, -40, 1, 4) }, R(-140, -40, 280, 80, 30, '#d9dde2', LW));
      return g;
    },
    anim: function (tl, a, b, K) {
      var d = b - a + 0.3;
      var tf = K('la facture', a), te = K('45 000', a), tj = K('Juste pour', a);
      ft(tl, '#s5-rc', { y: -1400 }, { y: 0, duration: 1.0, ease: 'bounce.out' }, tf);
      A.talk(tl, 's5h', 'worry', a, tj, 0);
      A.blink(tl, 's5h', [a + 1.2]);
      ft(tl, '#s5-bag', { x: 0, rotation: 0 }, { x: 8, rotation: 2, duration: 0.06, ease: 'none', yoyo: true, repeat: Math.ceil((tj - te) / 0.06) }, te);
      ft(tl, '#s5h', { y: 0 }, { y: 10, duration: 0.12, ease: 'none', yoyo: true, repeat: Math.ceil((tj - te) / 0.12) }, te);
      ft(tl, '#s5-bag', { x: 0, y: 0, scale: 1 }, { x: 330, y: 160, scale: 0.9, duration: 0.5, ease: 'power2.inOut' }, tj);
      ft(tl, '#s5h-aL', { rotation: -160 }, { rotation: -16, duration: 0.4, ease: 'power2.out' }, tj + 0.1);
      ft(tl, '#s5h-aR', { rotation: -160 }, { rotation: -16, duration: 0.4, ease: 'power2.out' }, tj + 0.1);
      A.face(tl, 's5h', 'worry', 'awk', tj + 0.2);
      A.talk(tl, 's5h', 'awk', tj + 0.2, b, 0);
      ft(tl, '#s5-dm-hd', { rotation: 0 }, { rotation: 8, duration: 0.25, ease: 'sine.inOut', yoyo: true, repeat: 1 }, tj + 0.6);
      ft(tl, '#s5h-sw', { y: 0 }, { y: 14, duration: 0.5, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil(d / 0.5) }, a);
    }
  };

  // ================================================================ 6 · le chantier : cuisines, travaux, drive, bornes
  S[6] = {
    cam: [[560, 1200, 1.0, 1.06], [720, 1400, 1.24, 1.3]],
    svg: function () {
      var g = bg('#9fdcff') + A.cloud(200, 560, 0.8);
      g += R(-100, 1440, 1280, 600, 0, '#e0a96d', LW);
      g += P('M 1180 1560 Q 820 1600 700 1760 Q 640 1860 640 2020 L 900 2020 Q 900 1880 960 1800 Q 1040 1710 1180 1700 Z', '#7d8590', LW) +
        P('M 1180 1630 Q 900 1660 820 1780 Q 770 1860 770 2020', null, 10, { stroke: C.w, 'stroke-dasharray': '40 36' });
      // charpente
      var bm = '';
      [400, 600, 800].forEach(function (x) { bm += R(x - 16, 960, 32, 480, 4, C.rest, 7); });
      [960, 1200].forEach(function (y) { bm += R(370, y - 16, 460, 32, 4, C.rest, 7); });
      bm += R(400, 1220, 200, 220, 0, C.w, 7) + R(600, 1220, 200, 220, 0, '#bfe9ff', 7);
      g += bm;
      // grue
      var tw = R(940, 420, 60, 1030, 0, '#ffd23f', LW);
      for (var y = 440; y < 1440; y += 70) tw += P('M 944 ' + y + ' L 996 ' + (y + 70), null, 6);
      g += tw + R(140, 404, 940, 44, 6, '#ffd23f', LW) + R(980, 360, 120, 60, 8, C.steel2, LW);
      g += G({ transform: T(500, 448) }, G('s6-load', P('M 0 0 L 0 330', null, 6) + G({ transform: T(0, 400) }, A.icon.kiosk(0, 70, 0.6))));
      g += A.person('s6-w1', 700, 944, 0.36, { shirt: '#ffb03a', vest: C.rest, hard: 1, arms: 'hip', skin: '#d79c74' });
      g += A.person('s6-w2', 880, 1450, 0.4, { shirt: '#4c8dff', vest: C.rest, hard: 1, arms: 'out', face: 'happy' });
      var ic = { oven: [500, 1430], cone: [740, 1600], car: [940, 1840], kiosk: [1000, 1440] };
      g += G({ transform: T(ic.oven[0], ic.oven[1]) }, G('s6-i1', A.icon.oven(0, 0, 0.8)));
      g += G({ transform: T(ic.cone[0], ic.cone[1]) }, G('s6-i2', A.icon.cone(0, 0, 0.8)));
      g += G({ transform: T(ic.car[0], ic.car[1]) }, G('s6-i3', A.icon.car(0, 0, 0.8)));
      g += G({ transform: T(ic.kiosk[0], ic.kiosk[1]) }, G('s6-i4', A.icon.kiosk(0, 0, 0.75)));
      var bills = '';
      for (var i = 0; i < 10; i++) bills += G({ transform: T(330, 1500) }, G('s6-bl' + i, A.bill(0, 0, 0.55, 0)));
      g += bills;
      g += A.hamster('s6h', 270, 1880, 0.84, { faces: ['worry', 'shock'], hat: 'hard', sweat: 1, armL: { a: 20 }, armR: { a: 64, hand: 'point' } });
      return g;
    },
    anim: function (tl, a, b, K) {
      var d = b - a + 0.3, r = A.rnd(19);
      ft(tl, '#s6-load', { rotation: -9 }, { rotation: 9, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil(d / 1.3) }, a);
      A.idle(tl, '#s6-w1', d, 10, 0.4, a); A.idle(tl, '#s6-w2', d, 12, 0.55, a);
      A.talk(tl, 's6h', 'worry', a, b, 0);
      A.blink(tl, 's6h', [a + 2.8, a + 5.5]);
      var t2 = K('2 millions', a);
      A.face(tl, 's6h', 'worry', 'shock', t2); A.face(tl, 's6h', 'shock', 'worry', t2 + 1.2);
      ft(tl, '#s6h-hd', { y: 0 }, { y: -30, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' }, t2);
      for (var i = 0; i < 10; i++) {
        var n = Math.ceil(d / 1.0);
        ft(tl, '#s6-bl' + i, { x: 0, y: 0, rotation: 0, opacity: 1 }, { x: 380 + r() * 260, y: -500 - r() * 260, rotation: 180 + r() * 360, opacity: 0, duration: 1.0, ease: 'power1.out', repeat: n }, a + i * 0.1);
      }
      ['Les cuisines', 'les travaux', 'le drive', 'les bornes'].forEach(function (w, i) { A.pop(tl, '#s6-i' + (i + 1), K(w, a)); });
    }
  };

  // ================================================================ 7 · les poches vides : douze graines de tournesol
  S[7] = {
    cam: [[540, 1300, 1.0, 1.08], [540, 1700, 1.18, 1.1]],
    svg: function () {
      var g = A.rays('s7-ray', 540, 1300, 18, '#ffcf7a', '#ffc25e') + R(-100, 1870, 1280, 200, 0, '#e8a64f', LW);
      g += A.hamster('s7h', 540, 2010, 1.32, { faces: ['awk', 'shock'], blush: 1, sweat: 1, pockets: 1, armL: { a: 62, hand: 'open' }, armR: { a: 62, hand: 'open' } });
      var r = A.rnd(23), sd = '';
      for (var i = 0; i < 12; i++) {
        var x = (i % 2 ? 540 + 215 : 540 - 215) + (r() - 0.5) * 90;
        sd += G({ transform: T(Math.round(x), 1790) }, A.seed(0, 0, 1.25, Math.round(r() * 360), { id: 's7-sd' + i }));
      }
      return g + sd;
    },
    anim: function (tl, a, b, K) {
      var d = b - a + 0.3, r = A.rnd(29);
      ft(tl, '#s7-ray', { rotation: 0 }, { rotation: 30, duration: d, ease: 'none' }, a);
      var tp = K('de ta poche', a), t12 = K('douze', a);
      gsap.set('#s7h-pk', { opacity: 0 });
      ft(tl, '#s7h-pk', { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 0.25, ease: 'back.out(3)' }, tp);
      A.talk(tl, 's7h', 'awk', a, b, 0);
      A.blink(tl, 's7h', [a + 1.1, a + 3.0]);
      ft(tl, '#s7h-hd', { rotation: -4 }, { rotation: 4, duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil(d / 0.9) }, a);
      for (var i = 0; i < 12; i++) {
        var t0 = t12 + i * 0.09;
        gsap.set('#s7-sd' + i, { opacity: 0 });
        ft(tl, '#s7-sd' + i, { opacity: 0, y: -10 }, { opacity: 1, y: 70 + r() * 30, duration: 0.45, ease: 'bounce.out' }, t0);
      }
    }
  };

  // ================================================================ 8 · la carte de France et ses 1 600 restaurants
  var FR = [[2.37, 51.05], [1.6, 50.7], [1.4, 50.05], [0.1, 49.5], [-0.25, 49.3], [-1.27, 49.67], [-1.95, 49.72], [-1.6, 48.84], [-2.0, 48.65], [-3.05, 48.8],
    [-4.0, 48.72], [-4.78, 48.4], [-4.3, 48.1], [-4.73, 48.03], [-4.37, 47.8], [-3.37, 47.7], [-2.75, 47.5], [-2.2, 47.25], [-2.1, 46.9], [-1.78, 46.5], [-1.15, 46.15],
    [-1.05, 45.6], [-1.25, 44.65], [-1.45, 43.6], [-1.78, 43.37], [-1.4, 43.1], [-0.7, 42.85], [0.0, 42.7], [0.7, 42.82], [1.45, 42.6], [2.0, 42.4], [3.17, 42.43],
    [3.05, 42.7], [3.05, 42.95], [3.2, 43.2], [3.7, 43.4], [4.2, 43.47], [4.6, 43.36], [5.35, 43.25], [5.93, 43.08], [6.65, 43.22], [7.27, 43.68], [7.5, 43.78],
    [7.0, 44.2], [6.9, 44.6], [7.05, 45.1], [6.8, 45.8], [6.15, 46.2], [6.8, 46.42], [6.1, 46.6], [7.0, 47.45], [7.58, 47.58], [7.6, 48.1], [7.8, 48.6], [8.2, 48.97],
    [7.4, 49.17], [6.7, 49.2], [6.36, 49.47], [5.8, 49.55], [4.85, 49.8], [4.82, 50.15], [4.15, 49.98], [3.7, 50.3], [3.2, 50.7], [2.6, 50.85]];
  var CO = [[9.4, 42.98], [9.55, 42.1], [9.2, 41.38], [8.75, 41.6], [8.6, 42.2], [8.7, 42.6], [9.1, 42.75]];
  var proj = function (p) { return [Math.round(90 + (p[0] + 5.2) * 64), Math.round(820 + (51.3 - p[1]) * 92)]; };
  var inside = function (pt, poly) {
    var c = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      if (((poly[i][1] > pt[1]) !== (poly[j][1] > pt[1])) && (pt[0] < (poly[j][0] - poly[i][0]) * (pt[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0])) c = !c;
    }
    return c;
  };
  var PINS = (function () {
    var r = A.rnd(41), out = [], fr = FR.map(proj);
    var cities = [[2.35, 48.86, 14], [4.85, 45.76, 6], [5.37, 43.3, 5], [3.06, 50.63, 5], [1.44, 43.6, 4], [-0.58, 44.84, 4], [-1.55, 47.22, 4], [7.75, 48.58, 3], [7.26, 43.7, 3], [-1.68, 48.11, 3], [3.88, 43.61, 3], [1.1, 49.44, 2]];
    cities.forEach(function (c) { var p = proj(c); for (var k = 0; k < c[2]; k++) out.push([p[0] + Math.round((r() - 0.5) * 70), p[1] + Math.round((r() - 0.5) * 60)]); });
    var tries = 0;
    while (out.length < 130 && tries < 5000) { tries++; var p = [90 + r() * 880, 820 + r() * 860]; if (inside(p, fr)) out.push([Math.round(p[0]), Math.round(p[1])]); }
    for (var k = 0; k < 5; k++) { var c = proj([8.75 + r() * 0.6, 41.6 + r() * 1.1]); out.push(c); }
    return out.sort(function (u, v) { return (u[1] + u[0] * 0.3) - (v[1] + v[0] * 0.3); });
  })();
  S[8] = {
    cam: [[540, 1240, 1.0, 1.04], [420, 1120, 1.3, 1.38]],
    svg: function () {
      var g = bg('#7fd0ff');
      var r = A.rnd(3);
      for (var i = 0; i < 26; i++) { var x = Math.round(r() * 1080), y = Math.round(700 + r() * 1200); g += P('M ' + x + ' ' + y + ' q 16 -14 32 0 q 16 14 32 0', null, 6, { stroke: '#b7e8ff' }); }
      var pts = function (poly) { return poly.map(proj).map(function (p, i) { return (i ? 'L ' : 'M ') + p[0] + ' ' + p[1]; }).join(' ') + ' Z'; };
      g += P(pts(FR), 'rgba(0,0,0,0.12)', 0, { transform: 'translate(12,16)' }) + P(pts(FR), '#ffe7c4', LW) + P(pts(CO), '#ffe7c4', LW);
      var pins = '';
      PINS.forEach(function (p, i) {
        var head = i % 10 !== 4;
        pins += G({ transform: T(p[0], p[1]) }, G('s8-p' + i, P('M 0 0 Q -24 -26 -24 -44 A 24 24 0 1 1 24 -44 Q 24 -26 0 0 Z', C.rest, 6) + Ci(0, -44, 10, C.w, 0)) +
          (head ? G('s8-q' + i, Ci(-14, -60, 9, C.or, 5) + Ci(14, -60, 9, C.or, 5) + Ci(0, -40, 22, C.or, 6) + E(0, -32, 16, 10, C.cr, 0) + Ci(-8, -44, 4, C.k, 0) + Ci(8, -44, 4, C.k, 0)) : ''));
      });
      g += pins;
      g += A.hamster('s8h', 930, 1900, 0.42, { faces: ['happy', 'grin'], armL: { a: 120, hand: 'point' }, armR: { a: 18 } });
      return g;
    },
    anim: function (tl, a, b, K) {
      var tp = K('plus de 1', a), tn = K('presque', a);
      A.talk(tl, 's8h', 'happy', a, tn + 1.2, 0);
      A.face(tl, 's8h', 'happy', 'grin', tn + 1.2);
      A.idle(tl, '#s8h', b - a, 8, 0.8, a);
      PINS.forEach(function (p, i) {
        gsap.set('#s8-p' + i, { scale: 0 });
        ft(tl, '#s8-p' + i, { scale: 0 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' }, tp - 0.1 + i * 0.012);
        if (i % 10 !== 4) {
          gsap.set('#s8-q' + i, { scale: 0 });
          var t = tn + 0.4 + i * 0.01;
          ft(tl, '#s8-p' + i, { scale: 1 }, { scale: 0, duration: 0.14, ease: 'power2.in' }, t);
          ft(tl, '#s8-q' + i, { scale: 0 }, { scale: 1, duration: 0.25, ease: 'back.out(3)' }, t + 0.12);
        }
      });
    }
  };

  // ================================================================ 9 · le tas de billets : « Là, je suis riche »
  S[9] = {
    cam: [[540, 1300, 1.0, 1.06], [540, 1200, 1.26, 1.34]],
    svg: function () {
      var g = A.rays('s9-ray', 540, 1200, 16, '#ffd24a', '#ffbf2a');
      var r = A.rnd(31), pile = P('M -140 2000 Q 120 1400 540 1380 Q 960 1400 1220 2000 Z', C.green, LW);
      for (var i = 0; i < 46; i++) {
        var x = 60 + r() * 960, y = 1430 + r() * 520, hw = 540 - Math.abs(x - 540);
        if (y < 1400 + (540 - hw) * 0.9) continue;
        pile += A.bill(Math.round(x), Math.round(y), 0.8, Math.round((r() - 0.5) * 60));
      }
      g += pile;
      g += A.hamster('s9h', 540, 1560, 0.9, { rot: -6, faces: ['happy', 'grin'], shades: 1, armL: { a: 150, hand: 'open' }, armR: { a: 150, hand: 'open' } });
      var fl = '';
      for (var k = 0; k < 24; k++) fl += G({ transform: T(540, 1040) }, G('s9-f' + k, A.bill(0, 0, 0.7, 0)));
      return g + fl;
    },
    anim: function (tl, a, b, K) {
      var d = b - a + 0.3, r = A.rnd(37);
      ft(tl, '#s9-ray', { rotation: 0 }, { rotation: 45, duration: d, ease: 'none' }, a);
      var tr = K('Là, je suis', a);
      gsap.set('#s9h-shades', { opacity: 0 });
      ft(tl, '#s9h-shades', { y: -500, opacity: 1 }, { y: 0, opacity: 1, duration: 0.5, ease: 'bounce.out' }, tr);
      A.talk(tl, 's9h', 'happy', a, tr, 0);
      A.face(tl, 's9h', 'happy', 'grin', tr + 0.3);
      ft(tl, '#s9h-aL', { rotation: -130 }, { rotation: -165, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil(d / 0.3) }, a);
      ft(tl, '#s9h-aR', { rotation: -165 }, { rotation: -130, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil(d / 0.3) }, a);
      A.idle(tl, '#s9h', d, 10, 0.6, a);
      for (var k = 0; k < 24; k++) {
        var t0 = a + k * (d / 24), side = k % 2 ? 1 : -1, x1 = side * (120 + r() * 320), dur = 2.2 + r() * 0.8;
        var yTop = -560 - r() * 300;
        gsap.set('#s9-f' + k, { opacity: 0 });
        ft(tl, '#s9-f' + k, { x: side * 150, y: 0, rotation: 0, opacity: 1 }, { x: x1, y: yTop, rotation: side * 160, duration: 0.6, ease: 'power2.out' }, t0);
        ft(tl, '#s9-f' + k, { y: yTop, rotation: side * 160 }, { y: 1100, rotation: side * 720, duration: dur, ease: 'power1.in' }, t0 + 0.6);
      }
    }
  };

  // ================================================================ 10 · McDo se sert en premier : la main géante et la tarte en or
  var PIE = { x: 470, y: 1310, r: 300 };
  var wedge = function (i, n, r0) {
    var a0 = i * 2 * Math.PI / n, a1 = (i + 1) * 2 * Math.PI / n, r = r0 || PIE.r;
    return 'M 0 0 L ' + (r * Math.sin(a0)).toFixed(1) + ' ' + (-r * Math.cos(a0)).toFixed(1) + ' A ' + r + ' ' + r + ' 0 0 1 ' + (r * Math.sin(a1)).toFixed(1) + ' ' + (-r * Math.cos(a1)).toFixed(1) + ' Z';
  };
  var mid = function (i, n, k) { var m = (i + 0.5) * 2 * Math.PI / n; return [PIE.x + k * Math.sin(m), PIE.y - k * Math.cos(m)]; };
  var hand = function (closed) {
    var h = R(-70, -1500, 140, 1380, 30, '#6b7280', LW) + R(-82, -170, 164, 60, 16, C.w, LW) + Ci(40, -140, 12, C.gold, 5);
    if (!closed) h += P('M -80 -120 Q -110 -40 -90 20 L -60 110 Q -50 130 -36 110 L -40 30 L -10 130 Q 0 150 14 130 L 10 30 L 40 120 Q 50 140 64 118 L 44 20 L 80 80 Q 96 96 104 78 Q 96 0 80 -120 Z', '#f6c9a2', LW);
    else h += P('M -84 -120 Q -112 -20 -84 50 Q -40 90 30 80 Q 96 70 96 0 Q 100 -60 84 -120 Z', '#f6c9a2', LW) + P('M -50 40 Q -40 10 -50 -20 M -10 56 Q 0 20 -10 -10 M 30 56 Q 40 20 30 -10', null, 6);
    return h;
  };
  S[10] = {
    cam: [[480, 1300, 1.0, 1.04], [480, 1260, 1.12, 1.16], [600, 1400, 1.2, 1.12]],
    svg: function () {
      var g = bg('#ffb24d');
      for (var k = -6; k < 14; k++) g += P('M ' + (k * 160) + ' 0 L ' + (k * 160 + 900) + ' 1920', null, 60, { stroke: '#ffa733' });
      g += E(PIE.x + 14, PIE.y + 360, 380, 50, 'rgba(0,0,0,0.15)', 0);
      g += Ci(PIE.x, PIE.y, 350, C.w, LW) + Ci(PIE.x, PIE.y, 312, '#ffe9c2', 6);
      var sl = '';
      for (var i = 0; i < 20; i++) {
        var a0 = i * Math.PI / 10, a1 = (i + 1) * Math.PI / 10, rr = PIE.r;
        sl += G({ transform: T(PIE.x, PIE.y) }, G('s10-w' + i, P(wedge(i, 20), C.gold, 5, { stroke: '#b9770e' }) +
          P('M ' + (rr * Math.sin(a0)).toFixed(1) + ' ' + (-rr * Math.cos(a0)).toFixed(1) + ' A ' + rr + ' ' + rr + ' 0 0 1 ' + (rr * Math.sin(a1)).toFixed(1) + ' ' + (-rr * Math.cos(a1)).toFixed(1), null, 46, { stroke: '#e89a2c' }) +
          P('M ' + (rr * Math.sin(a0)).toFixed(1) + ' ' + (-rr * Math.cos(a0)).toFixed(1) + ' A ' + rr + ' ' + rr + ' 0 0 1 ' + (rr * Math.sin(a1)).toFixed(1) + ' ' + (-rr * Math.cos(a1)).toFixed(1), null, LW) +
          A.coin(Math.round(170 * Math.sin(a0 + 0.16)), Math.round(-170 * Math.cos(a0 + 0.16)), 16) + A.coin(Math.round(110 * Math.sin(a0 + 0.2)), Math.round(-110 * Math.cos(a0 + 0.2)), 12)));
      }
      g += sl;
      g += G({ transform: T(PIE.x, PIE.y) }, G('s10-miss', P('M 0 0 L 0 -' + PIE.r + ' A ' + PIE.r + ' ' + PIE.r + ' 0 0 1 ' + (PIE.r * Math.sin(0.4 * Math.PI)).toFixed(1) + ' ' + (-PIE.r * Math.cos(0.4 * Math.PI)).toFixed(1) + ' Z', 'rgba(255,59,48,0.28)', 10, { stroke: '#ff3b30', 'stroke-dasharray': '28 18' })));
      var slice = P('M 0 0 L -26 -150 A 150 150 0 0 1 26 -150 Z', C.gold, 7, { transform: 'rotate(180) translate(0,-20)' });
      g += A.hamster('s10h', 880, 1900, 0.7, { faces: ['worry', 'shock', 'sad'], sweat: 1, armL: { a: -30, item: slice, itemRot: 0 }, armR: { a: 18 } });
      g += G('s10-hand', G({ transform: 'scale(1.45)' }, G('s10-ho', hand(false)) + G({ id: 's10-hc', opacity: 0 }, hand(true))));
      return g;
    },
    anim: function (tl, a, b, K) {
      var steps = [[K('pour la marque', a), [0]], [K('pour la pub', a), [1]], [K('pour le loyer', a), [2, 3]]];
      gsap.set('#s10-hand', { x: PIE.x, y: -400 });
      gsap.set('#s10-miss', { opacity: 0 });
      A.talk(tl, 's10h', 'worry', a, steps[0][0], 0);
      steps.forEach(function (s, k) {
        var t = s[0] - 0.25, ids = s[1], c = ids.length > 1 ? [(mid(ids[0], 20, 190)[0] + mid(ids[1], 20, 190)[0]) / 2, (mid(ids[0], 20, 190)[1] + mid(ids[1], 20, 190)[1]) / 2] : mid(ids[0], 20, 190);
        var hx0 = k ? steps[k - 1][2] : PIE.x;
        ft(tl, '#s10-hand', { x: c[0], y: -500 }, { x: c[0], y: c[1] - 30, duration: 0.3, ease: 'power2.in' }, t);
        tl.set('#s10-ho', { opacity: 0 }, t + 0.32); tl.set('#s10-hc', { opacity: 1 }, t + 0.32);
        ft(tl, '#s10-hand', { y: c[1] - 30 }, { y: -900, duration: 0.5, ease: 'power2.in' }, t + 0.42);
        ids.forEach(function (i) { ft(tl, '#s10-w' + i, { y: 0 }, { y: -900 - (c[1] - 30), duration: 0.5, ease: 'power2.in' }, t + 0.42); });
        tl.set('#s10-ho', { opacity: 1 }, t + 0.95); tl.set('#s10-hc', { opacity: 0 }, t + 0.95);
        ft(tl, '#s10h', { x: 0 }, { x: -10, duration: 0.05, ease: 'none', yoyo: true, repeat: 5 }, t + 0.42);
        s[2] = c[0];
      });
      A.face(tl, 's10h', 'worry', 'shock', steps[0][0] + 0.2);
      var tt = K('Au total', a), tm = K('repart directement', a);
      A.face(tl, 's10h', 'shock', 'sad', tt);
      A.talk(tl, 's10h', 'sad', tt, b, 0);
      ft(tl, '#s10-miss', { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'none' }, tt);
      ft(tl, '#s10-miss', { scale: 1 }, { scale: 1.06, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((b - tt) / 0.3) }, tt);
      ft(tl, '#s10h-hd', { rotation: 0 }, { rotation: -8, duration: 0.4, ease: 'sine.out' }, tm);
    }
  };
})();
