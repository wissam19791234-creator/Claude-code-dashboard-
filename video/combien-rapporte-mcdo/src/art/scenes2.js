// Plans 11 à 19 de « Combien rapporte un McDo ? ».
(function () {
  var A = window.ART, C = A.C, P = A.P, E = A.E, Ci = A.Ci, R = A.R, G = A.G, T = A.T, el = A.el, LW = A.LW;
  var S = A.SCENES = A.SCENES || {};
  var ft = function (tl, t, a, b, at) { A.ft(tl, t, a, b, at); };
  var tiles = function (c1, c2, y1) {
    var g = R(-300, -300, 1680, y1 + 300, 0, c1, 0);
    for (var y = 0; y < y1; y += 90) g += P('M -100 ' + y + ' L 1180 ' + y, null, 4, { stroke: c2 });
    for (var x = 0; x < 1100; x += 90) g += P('M ' + x + ' 0 L ' + x + ' ' + y1, null, 4, { stroke: c2 });
    return g;
  };
  var fly = function (id) {
    return G(id, G({ transform: 'scale(2.2)' }, G(id + '-w', E(-14, -14, 16, 10, 'rgba(200,235,255,0.9)', 4, { transform: 'rotate(-30 -14 -14)' }) + E(14, -14, 16, 10, 'rgba(200,235,255,0.9)', 4, { transform: 'rotate(30 14 -14)' })) +
      E(0, 0, 13, 17, '#222', 4) + Ci(-6, -12, 5, C.red, 0) + Ci(6, -12, 5, C.red, 0)));
  };
  var spatula = G({}, R(-8, -150, 16, 120, 6, C.wood, 6) + R(-34, -200, 68, 60, 8, C.steel, 7) + P('M -16 -190 L -16 -150 M 0 -190 L 0 -150 M 16 -190 L 16 -150', null, 4, { stroke: C.steel2 }));
  var window_ = function (x, y, w, h, inner, id) {
    return el('defs', {}, el('clipPath', { id: id }, R(x, y, w, h, 0, '#fff', 0))) + G({ 'clip-path': 'url(#' + id + ')' }, inner) +
      R(x, y, w, h, 10, null, 22, { stroke: C.w }) + R(x - 11, y - 11, w + 22, h + 22, 14, null, LW) + R(x + 11, y + 11, w - 22, h - 22, 6, null, 6) +
      P('M ' + (x + w / 2) + ' ' + y + ' L ' + (x + w / 2) + ' ' + (y + h), null, 16, { stroke: C.w });
  };

  // ================================================================ 11 · 500 000 € partis avant le premier steak : le grill vide et la mouche
  var FLY = [[700, 1020], [820, 1120], [700, 1230], [520, 1180], [380, 1060], [470, 940], [640, 900], [760, 1000], [620, 1130], [420, 1150], [330, 1000], [520, 960]];
  S[11] = {
    cam: [[540, 1240, 1.0, 1.05], [560, 1200, 1.24, 1.3]],
    svg: function () {
      var g = tiles('#fff6ea', '#f0dcc4', 1500) + R(-100, 1500, 1280, 520, 0, '#ffcf99', LW);
      g += P('M 180 640 L 900 640 L 1000 860 L 80 860 Z', C.steel, LW) + R(60, 860, 960, 40, 10, C.steel2, LW);
      g += A.hamster('s11h', 540, 1680, 0.98, { faces: ['tired', 'sad'], armL: { a: 18 }, armR: { a: 48, item: spatula, itemRot: 30 } });
      g += P('M 150 1420 L 930 1420 L 980 1510 L 100 1510 Z', '#4a4f58', LW) + P('M 260 1450 L 420 1450 M 560 1470 L 820 1470', null, 8, { stroke: '#6b7280' });
      g += R(100, 1510, 880, 420, 18, C.steel, LW) + R(140, 1560, 800, 90, 12, C.steel2, 7);
      for (var i = 0; i < 4; i++) g += Ci(240 + i * 200, 1760, 34, '#3b3b44', LW) + P('M ' + (240 + i * 200) + ' 1740 L ' + (240 + i * 200) + ' 1772', null, 8, { stroke: C.w });
      g += G({ transform: T(FLY[0][0], FLY[0][1]) }, fly('s11-fly'));
      return g;
    },
    anim: function (tl, a, b, K) {
      var d = b - a + 0.3, ts = K('un seul steak', a);
      ft(tl, '#s11-fly-w', { scaleY: 1 }, { scaleY: 0.3, duration: 0.04, ease: 'none', yoyo: true, repeat: Math.ceil(d / 0.04) }, a);
      var t = a, k = 0;
      while (t < ts - 0.2) {
        var p = FLY[k % FLY.length], q = FLY[(k + 1) % FLY.length];
        ft(tl, '#s11-fly', { x: p[0] - FLY[0][0], y: p[1] - FLY[0][1] }, { x: q[0] - FLY[0][0], y: q[1] - FLY[0][1], duration: 0.32, ease: 'sine.inOut' }, t);
        t += 0.32; k++;
      }
      var last = FLY[k % FLY.length];
      ft(tl, '#s11-fly', { x: last[0] - FLY[0][0], y: last[1] - FLY[0][1] }, { x: 700 - FLY[0][0], y: 1450 - FLY[0][1], duration: 0.6, ease: 'power2.inOut' }, t);
      A.talk(tl, 's11h', 'tired', a, ts, 0);
      A.face(tl, 's11h', 'tired', 'sad', ts);
      A.talk(tl, 's11h', 'sad', ts, b, 0);
      ft(tl, '#s11h-hd', { rotation: -3 }, { rotation: 3, duration: 0.8, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil(d / 0.8) }, a);
      ft(tl, '#s11h-aR', { rotation: -48 }, { rotation: -40, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil(d / 0.6) }, a);
    }
  };

  // ================================================================ 12 · 48 salariés qui tendent la main
  var ROWS = [10, 9, 9, 8, 7, 5];
  S[12] = {
    cam: [[540, 1200, 1.0, 1.08]],
    svg: function () {
      var g = A.wall('#ffe2bf', '#ffd2a1', 1920);
      var skins = ['#f3c39b', '#e2ad84', '#c98b5e', '#8d5a3b', '#f6d2b4', '#b67a52'], hairs = ['#3b2414', '#111', '#7a4a20', '#d9a04a'];
      var r = A.rnd(53), n = 0;
      ROWS.forEach(function (cnt, k) {
        var s = 0.46 + k * 0.1, y = 860 + k * 128, row = '';
        for (var i = 0; i < cnt; i++) {
          var x = Math.round((i + 0.5) * 1080 / cnt + (k % 2 ? 18 : -18));
          row += A.bust('s12-e' + n, x, y, s, { cap: C.rest, hands: 1, skin: skins[Math.floor(r() * skins.length)], hair: hairs[n % 4] });
          n++;
        }
        g += G('s12-r' + k, row);
      });
      g += A.hamster('s12h', 540, 2010, 1.0, { faces: ['worry', 'shock'], sweat: 1, armL: { a: 40, hand: 'open' }, armR: { a: 40, hand: 'open' } });
      return g;
    },
    anim: function (tl, a, b, K) {
      var d = b - a + 0.3;
      ROWS.forEach(function (c, k) {
        gsap.set('#s12-r' + k, { opacity: 0 });
        ft(tl, '#s12-r' + k, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.25, ease: 'back.out(2.5)' }, a + 0.05 + k * 0.1);
        ft(tl, '#s12-r' + k, { y: 0 }, { y: -8, duration: 0.3 + k * 0.03, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil(d / 0.3), immediateRender: false }, a + 0.7 + k * 0.1);
      });
      var t48 = K('48', a);
      A.talk(tl, 's12h', 'worry', a, t48, 0);
      A.face(tl, 's12h', 'worry', 'shock', t48);
      ft(tl, '#s12h', { y: 0 }, { y: -36, duration: 0.14, ease: 'power2.out', yoyo: true, repeat: 1 }, t48);
    }
  };

  // ================================================================ 13 · la viande, le pain, les frites, l'huile, l'électricité
  S[13] = {
    cam: [[540, 1240, 1.0, 1.06], [560, 1400, 1.22, 1.28]],
    svg: function () {
      var g = tiles('#fff1dd', '#f0d7b6', 1400);
      var sky = R(70, 700, 340, 300, 0, C.sky, 0) + G('s13-night', R(70, 700, 340, 300, 0, '#1d2a5a', 0) + Ci(130, 760, 4, C.w, 0) + Ci(330, 740, 3, C.w, 0) + Ci(250, 800, 4, C.w, 0)) +
        G('s13-sun', Ci(240, 820, 54, '#ffd23f', LW)) + G('s13-moon', P('M 260 760 A 56 56 0 1 0 320 840 A 44 44 0 1 1 260 760 Z', '#fff3b0', LW));
      g += window_(70, 700, 340, 300, sky, 's13-win');
      // compteur électrique
      g += G({ transform: T(860, 880) }, R(-150, -190, 300, 380, 24, C.w, LW) + Ci(0, -50, 108, '#d6f0ff', LW) + R(-90, 90, 180, 60, 10, '#2b2b33', 7) +
        G({ transform: T(0, -50) }, G('s13-disc', E(0, 0, 80, 16, C.steel2, 6) + R(-8, -16, 16, 32, 0, C.red, 0))) +
        G({ transform: T(0, -50) }, G('s13-needle', P('M 0 0 L 0 -84', null, 8, { stroke: C.red }) + Ci(0, 0, 10, C.k, 0))));
      g += G({ transform: T(860, 560) }, G('s13-z1', A.icon.bolt(-120, 0, 0.6))) + G({ transform: T(860, 600) }, G('s13-z2', A.icon.bolt(130, 0, 0.5)));
      // friteuse en gros plan
      g += R(60, 1320, 960, 720, 30, C.steel, LW) + R(110, 1600, 860, 120, 16, C.steel2, 7) + Ci(220, 1820, 34, C.k, 0) + Ci(330, 1820, 34, C.red, 0);
      g += R(40, 1250, 1000, 110, 30, '#3b3b44', LW) + E(540, 1300, 450, 46, '#e8b23a', 0);
      var fr = '', r = A.rnd(61);
      for (var i = 0; i < 26; i++) { var x = 150 + i * 30 + r() * 20, h = 90 + r() * 90; fr += R(Math.round(x), Math.round(1300 - h), 24, Math.round(h + 20), 4, C.fry, 5, { transform: 'rotate(' + Math.round((r() - 0.5) * 30) + ' ' + Math.round(x) + ' 1300)' }); }
      g += G('s13-fr', fr) + P('M 160 1296 L 920 1296', null, 0) + R(40, 1300, 1000, 60, 20, '#3b3b44', LW);
      for (var j = 0; j < 10; j++) g += Ci(170 + j * 80, 1300 + (j % 3) * 8 - 8, 14, '#fff3c4', 5, { id: 's13-b' + j });
      for (var q = 0; q < 4; q++) g += G({ transform: T(260 + q * 180, 1200) }, G('s13-st' + q, Ci(0, 0, 40, C.w, 0, { opacity: 0.85 }) + Ci(34, -14, 30, C.w, 0, { opacity: 0.85 })));
      // ingrédients qui tombent dans la friteuse
      var ic = [A.icon.patty(0, 0, 1.1), A.icon.bun(0, 20, 1.1), A.fries(0, 30, 1.2), A.icon.oil(0, 0, 1.0), A.icon.bolt(0, 0, 1.1)];
      ic.forEach(function (s, k) { g += G({ transform: T(540, 1000) }, G('s13-i' + k, s)); });
      return g;
    },
    anim: function (tl, a, b, K) {
      var d = b - a + 0.3;
      for (var j = 0; j < 10; j++) ft(tl, '#s13-b' + j, { scale: 0, opacity: 1 }, { scale: 1.6, opacity: 0, duration: 0.45, ease: 'power1.out', repeat: Math.ceil(d / 0.55), repeatDelay: 0.1 }, a + j * 0.07);
      for (var q = 0; q < 4; q++) ft(tl, '#s13-st' + q, { y: 0, opacity: 0.85, scale: 0.6 }, { y: -360, opacity: 0, scale: 1.6, duration: 1.4, ease: 'none', repeat: Math.ceil(d / 1.4) }, a + q * 0.35);
      A.idle(tl, '#s13-fr', d, 10, 0.4, a);
      ft(tl, '#s13-disc', { scaleX: 1 }, { scaleX: -1, duration: 0.09, ease: 'none', yoyo: true, repeat: Math.ceil(d / 0.09) }, a);
      ft(tl, '#s13-needle', { rotation: -50 }, { rotation: 70, duration: 0.25, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil(d / 0.25) }, a);
      ['#s13-z1', '#s13-z2'].forEach(function (z, i) { ft(tl, z, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1.1, duration: 0.12, ease: 'none', yoyo: true, repeat: Math.ceil(d / 0.12) }, a + i * 0.15); });
      var words = ['La viande', 'le pain', 'les frites', "l'huile", "l'électricité"];
      words.forEach(function (w, k) {
        var t = K(w, a);
        A.pop(tl, '#s13-i' + k, t - 0.05, 0.2);
        if (k < 4) ft(tl, '#s13-i' + k, { y: 0, scale: 1, opacity: 1 }, { y: 300, scale: 0.3, opacity: 0, duration: 0.4, ease: 'power2.in' }, t + 0.55);
        else ft(tl, '#s13-i' + k, { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 320, y: -120, scale: 0.4, opacity: 0, duration: 0.4, ease: 'power2.in' }, t + 0.7);
      });
      var tm = K('du matin', a);
      gsap.set('#s13-night', { opacity: 0 }); gsap.set('#s13-moon', { y: 200 });
      ft(tl, '#s13-sun', { y: 0 }, { y: 220, duration: 1.4, ease: 'power1.in' }, tm);
      ft(tl, '#s13-night', { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'none' }, tm + 0.4);
      ft(tl, '#s13-moon', { y: 200 }, { y: 0, duration: 1.2, ease: 'power1.out' }, tm + 0.6);
    }
  };

  // ================================================================ 14 · ce qui reste : la loupe sur le petit tas de pièces
  var LZ = [345, 1392, 104], PAW = [578, 1492];
  S[14] = {
    cam: [[560, 1300, 1.0, 1.05], [440, 1360, 1.3, 1.36]],
    svg: function () {
      var g = bg_('#dcecff');
      g += R(80, 660, 300, 360, 16, C.w, LW) + P('M 120 960 L 180 880 L 240 920 L 320 780', null, 12, { stroke: C.red }) + P('M 296 780 L 320 780 L 320 804', null, 10, { stroke: C.red });
      var table = P('M -60 1380 L 760 1380 L 760 1520 L -60 1520 Z', C.wood, LW) + R(-60, 1520, 820, 40, 0, C.wood2, LW) + R(40, 1560, 60, 400, 6, C.wood2, LW) + R(640, 1560, 60, 400, 6, C.wood2, LW);
      var pile = A.coinPile(340, 1430, 0.55, 6);
      g += table + pile;
      var dx = PAW[0] - LZ[0], dy = PAW[1] - LZ[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      var h0 = (LZ[2] * ux).toFixed(0) + ' ' + (LZ[2] * uy).toFixed(0), h1 = dx + ' ' + dy;
      var big = G({ transform: 'scale(1.9) translate(' + (-LZ[0]) + ',' + (-LZ[1]) + ')' }, R(-200, 1100, 1200, 280, 0, '#dcecff', 0) + table + pile);
      g += el('defs', {}, el('clipPath', { id: 's14-lc' }, Ci(0, 0, LZ[2], '#fff', 0)));
      g += G({ transform: T(LZ[0], LZ[1]) }, G('s14-mag', P('M ' + h0 + ' L ' + h1, null, 40) + P('M ' + h0 + ' L ' + h1, null, 22, { stroke: '#3b3b44' }) +
        G({ 'clip-path': 'url(#s14-lc)' }, big) + Ci(0, 0, LZ[2], 'rgba(200,235,255,0.22)', 0) + Ci(0, 0, LZ[2], null, 24, { stroke: '#2b2b33' }) +
        P('M -56 -50 Q -36 -74 -6 -80', null, 10, { stroke: C.w })));
      g += A.hamster('s14h', 860, 1880, 1.0, { faces: ['think', 'happy'], look: -1, armL: { a: 100 }, armR: { a: 20 } });
      return g;
    },
    anim: function (tl, a, b, K) {
      var d = b - a + 0.3, ts = K('Soit entre', a);
      ft(tl, '#s14-mag', { x: -14, y: 0 }, { x: 14, y: -6, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil(d / 1.1) }, a);
      ft(tl, '#s14h-aL', { rotation: -97 }, { rotation: -103, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil(d / 1.1) }, a);
      A.talk(tl, 's14h', 'think', a, ts, 0);
      A.blink(tl, 's14h', [a + 1.4, a + 3.6]);
      A.face(tl, 's14h', 'think', 'happy', ts);
      A.talk(tl, 's14h', 'happy', ts, b, 0);
      ft(tl, '#s14h-hd', { rotation: 0 }, { rotation: -6, duration: 0.4, ease: 'back.out(2)' }, ts);
    }
  };
  function bg_(c) { return R(-300, -300, 1680, 2520, 0, c, 0); }

  // ================================================================ 15 · 700 clients par jour : la file qui fait le tour du quartier
  var QP = [[60, 1210], [300, 1200], [560, 1185], [820, 1170], [960, 1110], [760, 1060], [480, 1050], [200, 1040], [90, 980], [340, 950], [620, 935], [900, 920], [940, 860], [640, 845], [360, 835], [120, 820]];
  var QL = (function () { var L = [0]; for (var i = 1; i < QP.length; i++) L.push(L[i - 1] + Math.hypot(QP[i][0] - QP[i - 1][0], QP[i][1] - QP[i - 1][1])); return L; })();
  var qAt = function (u) {
    var tot = QL[QL.length - 1]; u = Math.max(0, Math.min(tot, u));
    for (var i = 1; i < QL.length; i++) if (u <= QL[i]) { var f = (u - QL[i - 1]) / (QL[i] - QL[i - 1]); return [QP[i - 1][0] + f * (QP[i][0] - QP[i - 1][0]), QP[i - 1][1] + f * (QP[i][1] - QP[i - 1][1])]; }
    return QP[QP.length - 1];
  };
  var NQ = 46, GAP = 95;
  var tiny = function (id, c) { return G(id, R(-16, -10, 32, 46, 12, c, 5) + Ci(0, -26, 16, '#f3c39b', 5) + P('M -16 -32 Q 0 -50 16 -32', null, 8, { stroke: '#3b2414' })); };
  S[15] = {
    cam: [[540, 1200, 1.0, 1.05], [520, 1020, 1.3, 1.36], [760, 1380, 1.22, 1.16]],
    svg: function () {
      var g = A.wall('#ffe2bf', '#ffd2a1', 1500);
      var out = R(70, 640, 940, 700, 0, C.sky, 0) + A.cloud(260, 720, 0.6) + R(70, 800, 940, 540, 0, '#9aa5b1', 0) + R(70, 790, 940, 20, 0, '#7ed957', 0) + P('M 70 1000 L 1010 1000 M 70 1140 L 1010 1140', null, 6, { stroke: C.w, 'stroke-dasharray': '30 30' });
      var cols = [C.red, '#4c8dff', '#8e5bd8', C.green, '#ffb03a', '#e84a8a', '#2bb3a8'];
      for (var i = 0; i < NQ; i++) out += G({ id: 's15-q' + i }, tiny('s15-qq' + i, cols[i % cols.length]));
      g += window_(70, 640, 940, 700, out, 's15-win');
      var inside = [[140, 1450, 0.7, '#4c8dff'], [320, 1470, 0.76, C.red], [500, 1490, 0.8, '#8e5bd8']];
      inside.forEach(function (c, k) { g += A.bust('s15-c' + k, c[0], c[1], c[2], { shirt: c[3], skin: ['#e2ad84', '#f3c39b', '#8d5a3b'][k] }); });
      g += A.hamster('s15h', 800, 1730, 0.86, { faces: ['worry', 'shock'], sweat: 1, armL: { a: 40 }, armR: { a: 40 } });
      g += A.counter(1560);
      return g;
    },
    anim: function (tl, a, b, K) {
      var d = b - a + 0.3;
      var place = function (p) {      // la file avance par petits pas : un demi-client, une pause, un demi-client…
        var step = Math.floor(p), f = p - step, sm = f < 0.4 ? 0 : (f - 0.4) / 0.6;
        var shift = (step + sm * sm * (3 - 2 * sm)) * GAP * 0.5;
        for (var i = 0; i < NQ; i++) {
          var u = i * GAP - shift, xy = qAt(u), s = 0.55 + 0.75 * Math.max(0, Math.min(1, (xy[1] - 820) / 390));
          var e = document.getElementById('s15-q' + i);
          if (e) e.setAttribute('transform', 'translate(' + xy[0].toFixed(1) + ',' + xy[1].toFixed(1) + ') scale(' + s.toFixed(3) + ')' + (u < 0 ? ' scale(0)' : ''));
        }
      };
      place(0);
      var px = { v: 0, p: function (x) { if (arguments.length) { this.v = x; place(x); } return this.v; } };
      ft(tl, px, { p: 0 }, { p: d / 0.7, duration: d, ease: 'none' }, a);
      for (var k = 0; k < 3; k++) ft(tl, '#s15-c' + k, { y: 0 }, { y: -10, duration: 0.35, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil(d / 0.35) }, a + k * 0.12);
      ft(tl, '#s15h-aL', { rotation: -30 }, { rotation: -80, duration: 0.18, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil(d / 0.18) }, a);
      ft(tl, '#s15h-aR', { rotation: -80 }, { rotation: -30, duration: 0.18, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil(d / 0.18) }, a);
      ft(tl, '#s15h-sw', { y: 0 }, { y: 14, duration: 0.4, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil(d / 0.4) }, a);
      var tj = K('Par jour', a);
      A.talk(tl, 's15h', 'worry', a, tj, 0);
      A.face(tl, 's15h', 'worry', 'shock', tj);
      ft(tl, '#s15h', { y: 0 }, { y: -40, duration: 0.14, ease: 'power2.out', yoyo: true, repeat: 1 }, tj);
    }
  };

  // ================================================================ 16 · la nuit, même le dimanche : endormi debout, la sonnette
  S[16] = {
    cam: [[560, 1250, 1.04, 1.14]],
    svg: function () {
      var g = A.wall('#5b4b7a', '#52436f', 1560);
      var sky = R(70, 660, 940, 640, 0, '#1d2a5a', 0) + P('M 820 760 A 70 70 0 1 0 900 860 A 56 56 0 1 1 820 760 Z', '#fff3b0', LW);
      var r = A.rnd(71);
      for (var i = 0; i < 16; i++) sky += G({ transform: T(Math.round(100 + r() * 860), Math.round(690 + r() * 560)) }, A.sparkle(0, 0, 0.22 + r() * 0.2, { id: 's16-st' + i }));
      g += window_(70, 660, 940, 640, sky, 's16-win');
      g += A.hamster('s16h', 600, 1740, 0.92, { faces: ['sleep', 'shock'], armL: { a: 10 }, armR: { a: 10 } });
      g += G({ transform: T(640, 1330) }, G('s16-bub', Ci(0, 0, 34, 'rgba(190,235,255,0.8)', 6) + Ci(-10, -12, 8, C.w, 0)));
      g += A.counter(1560);
      g += G({ transform: T(330, 1520) }, R(-60, -10, 120, 24, 8, '#c9a227', 6) + P('M -50 -10 Q -50 -70 0 -72 Q 50 -70 50 -10 Z', C.gold, LW) + Ci(0, -80, 10, C.gold, 6) +
        G('s16-ring', P('M -90 -90 L -120 -120 M 90 -90 L 120 -120 M 0 -120 L 0 -160', null, 8)));
      g += A.person('s16-cu', 130, 2050, 0.82, { shirt: '#2bb3a8', arms: 'down', skin: '#c98b5e', hair: '#111' });
      g += G('s16-hand', Ci(330, 1400, 34, '#c98b5e', LW) + R(316, 1400, 28, 0, 0, null, 0));
      g += R(-100, -100, 1280, 2120, 0, 'rgba(20,16,60,0.28)', 0);
      return g;
    },
    anim: function (tl, a, b, K) {
      var d = b - a + 0.3, td = K('Même le dimanche', a) + 0.5;
      for (var i = 0; i < 16; i++) ft(tl, '#s16-st' + i, { scale: 0.4 }, { scale: 1.2, duration: 0.35, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil(d / 0.35) }, a + (i % 5) * 0.08);
      ft(tl, '#s16-bub', { scale: 0.35 }, { scale: 1.15, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((td - a) / 0.6) }, a);
      ft(tl, '#s16-bub', { opacity: 1 }, { opacity: 0, scale: 1.8, duration: 0.12, ease: 'none' }, td);
      ft(tl, '#s16-hand', { y: -40 }, { y: 70, duration: 0.11, ease: 'power2.in', yoyo: true, repeat: Math.ceil(d / 0.11) }, a);
      ft(tl, '#s16-ring', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1.2, duration: 0.11, ease: 'none', yoyo: true, repeat: Math.ceil(d / 0.11) }, a + 0.11);
      ft(tl, '#s16h-hd', { rotation: -10 }, { rotation: -4, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((td - a) / 0.6) }, a);
      A.face(tl, 's16h', 'sleep', 'shock', td);
      ft(tl, '#s16h', { y: 0 }, { y: -60, duration: 0.15, ease: 'power2.out', yoyo: true, repeat: 1 }, td);
    }
  };

  // ================================================================ 17 · plateau après plateau… puis une bouchée de son propre burger
  var NT = 16;
  S[17] = {
    cam: [[540, 1300, 1.0, 1.05], [420, 1450, 1.2, 1.26], [700, 1250, 1.24, 1.32]],
    svg: function () {
      var g = A.wall('#ffe2bf', '#ffd2a1', 1560);
      g += R(120, 640, 840, 300, 30, '#2b2b33', LW) + A.burger(300, 820, 0.7) + A.fries(540, 800, 0.66) + A.icon.cup(780, 810, 0.7);
      var bw = G({ id: 's17-bw', opacity: 0 }, A.burger(0, 0, 0.7)), bb = G({ id: 's17-bb', opacity: 0 }, A.burger(0, 0, 0.7, '#ffe2bf'));
      g += A.hamster('s17h', 680, 1740, 0.94, { faces: ['smile', 'happy'], armL: { a: 30 }, armR: { a: -40, item: bw + bb, itemRot: -40 } });
      g += A.counter(1560);
      g += G({ transform: T(930, 1530) }, P('M -70 -170 L 70 -170 L 70 0 Q 70 20 50 20 L -50 20 Q -70 20 -70 0 Z', 'rgba(220,240,255,0.85)', LW) + R(-80, -190, 160, 30, 10, C.steel2, 7) +
        el('defs', {}, el('clipPath', { id: 's17-jc' }, R(-64, -164, 128, 180, 0, '#fff', 0))) +
        G({ 'clip-path': 'url(#s17-jc)' }, G('s17-lvl', R(-70, 0, 140, 200, 0, C.gold, 6) + P('M -60 10 L 60 10', null, 5, { stroke: C.gold2 }))));
      for (var i = 0; i < NT; i++) g += G({ transform: T(560, 1525) }, G('s17-t' + i, A.tray(0, 0, 0.9, 300) + A.burger(-50, -50, 0.5) + A.fries(70, -66, 0.5)));
      for (var j = 0; j < NT; j++) g += G({ transform: T(560, 1440) }, G('s17-c' + j, A.coin(0, 0, 16)));
      return g;
    },
    anim: function (tl, a, b, K) {
      var tb = K('juste pour te', a), step = (tb - 0.3 - a) / NT;
      gsap.set('#s17-lvl', { y: 0 });
      for (var i = 0; i < NT; i++) {
        var t = a + i * step;
        gsap.set('#s17-t' + i, { opacity: 0 }); gsap.set('#s17-c' + i, { opacity: 0 });
        ft(tl, '#s17-t' + i, { x: 80, opacity: 0, scale: 0.6 }, { x: 0, opacity: 1, scale: 1, duration: 0.18, ease: 'back.out(2)' }, t);
        ft(tl, '#s17-t' + i, { x: 0 }, { x: -900, duration: 0.7, ease: 'power2.in' }, t + 0.22);
        ft(tl, '#s17-c' + i, { x: 0, y: 0, opacity: 1, scale: 1 }, { x: 370, y: -60, opacity: 1, scale: 0.7, duration: 0.45, ease: 'power1.out' }, t + 0.25);
        tl.set('#s17-c' + i, { opacity: 0 }, t + 0.7);
        ft(tl, '#s17-lvl', { y: -i * 9 }, { y: -(i + 1) * 9, duration: 0.2, ease: 'power2.out' }, t + 0.7);
      }
      ft(tl, '#s17h-aL', { rotation: -30 }, { rotation: -70, duration: step / 2, ease: 'sine.inOut', yoyo: true, repeat: NT * 2 - 1 }, a);
      A.talk(tl, 's17h', 'smile', a, tb, 0);
      A.blink(tl, 's17h', [a + 2.1, a + 4.6]);
      A.pop(tl, '#s17-bw', tb, 0.3);
      ft(tl, '#s17h-aR', { rotation: 40 }, { rotation: 75, duration: 0.3, ease: 'back.out(2)' }, tb);
      tl.set('#s17-bw', { opacity: 0 }, tb + 0.8); tl.set('#s17-bb', { opacity: 1 }, tb + 0.8);
      A.face(tl, 's17h', 'smile', 'happy', tb + 0.8);
      ft(tl, '#s17h-hd', { y: 0 }, { y: 6, duration: 0.12, ease: 'none', yoyo: true, repeat: 7 }, tb + 0.85);
    }
  };

  // ================================================================ 18 · « c'est solide »… mais pas de clients, pas de frites
  S[18] = {
    cam: [[560, 1260, 1.0, 1.06], [560, 1350, 1.18, 1.24], [560, 1420, 1.34, 1.42]],
    svg: function () {
      var g = A.wall('#ffe2bf', '#ffd2a1', 1500) + R(-100, 1500, 1280, 520, 0, '#f6e7d4', LW);
      for (var x = -60; x < 1100; x += 120) for (var y = 1500; y < 1940; y += 120) if (((x + y) / 120) % 2 === 0) g += R(x, y, 120, 120, 0, '#e9cfae', 0);
      [[160, 1480], [920, 1480]].forEach(function (p) { g += E(p[0], p[1] - 110, 120, 22, C.w, LW) + R(p[0] - 14, p[1] - 100, 28, 100, 6, C.steel2, 6) + R(p[0] - 70, p[1] - 6, 140, 16, 6, C.steel2, 6); });
      g += A.hamster('s18h', 560, 1760, 0.86, { faces: ['proud', 'sad'], armL: { a: 20 }, armR: { a: 150, hand: 'thumb' } });
      g += R(160, 1500, 760, 40, 14, C.wood, LW) + R(500, 1540, 80, 420, 8, C.wood2, LW);
      g += G('s18-coins', A.coinPile(330, 1505, 0.75, 15));
      g += G('s18-tray', A.tray(400, 1494, 0.8, 300) + R(384, 1404, 28, 96, 5, C.fry, 6, { transform: 'rotate(-14 398 1480)' }));
      g += G({ transform: T(-200, 1820) }, G('s18-tw', Ci(0, 0, 70, null, 7, { stroke: '#a4743c' }) + P('M -50 -30 Q 0 40 50 -20 M -40 30 Q 10 -50 50 30 M -60 0 Q 0 -20 60 10', null, 6, { stroke: '#a4743c' })));
      g += P('M -300 -300 L 1380 -300 L 1380 2220 L -300 2220 Z M 560 1260 m -360 0 a 360 440 0 1 0 720 0 a 360 440 0 1 0 -720 0 Z', 'rgba(15,12,40,0.62)', 0, { id: 's18-dim', 'fill-rule': 'evenodd' });
      return g;
    },
    anim: function (tl, a, b, K) {
      var tm = K("Mais c'est", a), tp = K('Pas de clients', a);
      gsap.set('#s18-dim', { opacity: 0 }); gsap.set('#s18-tray', { opacity: 0 });
      A.talk(tl, 's18h', 'proud', a, tm, 0);
      A.blink(tl, 's18h', [a + 1.5]);
      A.pop(tl, '#s18-coins', a + 0.3, 0.4);
      ft(tl, '#s18h-aR', { rotation: -150 }, { rotation: -160, duration: 0.25, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((tm - a) / 0.25) }, a);
      ft(tl, '#s18-dim', { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'none' }, tm);
      ft(tl, '#s18h-aR', { rotation: -150 }, { rotation: -14, duration: 0.4, ease: 'power2.inOut' }, tm);
      A.face(tl, 's18h', 'proud', 'sad', tm + 0.2);
      A.talk(tl, 's18h', 'sad', tm + 0.2, b, 0);
      ft(tl, '#s18-coins', { opacity: 1 }, { opacity: 0, duration: 0.3, ease: 'none' }, tp - 0.2);
      A.pop(tl, '#s18-tray', tp, 0.5);
      ft(tl, '#s18-tw', { x: 0, rotation: 0 }, { x: 1500, rotation: 720, duration: 2.6, ease: 'none' }, tm + 0.3);
      ft(tl, '#s18h-hd', { rotation: 0 }, { rotation: 8, duration: 0.6, ease: 'sine.out' }, tp);
    }
  };

  // ================================================================ 19 · « Quel business je calcule la prochaine fois ? Dis-le en commentaire. »
  S[19] = {
    cam: [[540, 1260, 1.0, 1.08]],
    svg: function () {
      var g = A.rays('s19-ray', 540, 1300, 18, '#ff9a2e', '#ff8c1a');
      g += G({ transform: T(260, 1150) }, G('s19-cm', P('M -150 -100 Q -150 -150 -100 -150 L 100 -150 Q 150 -150 150 -100 L 150 20 Q 150 70 100 70 L -20 70 L -90 130 L -70 70 L -100 70 Q -150 70 -150 20 Z', C.w, LW) +
        Ci(-60, -40, 18, C.rest, 0, { id: 's19-d0' }) + Ci(0, -40, 18, C.rest, 0, { id: 's19-d1' }) + Ci(60, -40, 18, C.rest, 0, { id: 's19-d2' })));
      g += G({ transform: T(860, 1020) }, G('s19-ht', P('M 0 40 Q -70 -10 -60 -50 Q -50 -90 0 -60 Q 50 -90 60 -50 Q 70 -10 0 40 Z', C.red, LW)));
      g += A.hamster('s19h', 560, 1880, 1.16, { faces: ['happy', 'grin'], armL: { a: 18 }, armR: { a: 166, hand: 'point' } });
      return g;
    },
    anim: function (tl, a, b, K) {
      var d = b - a + 0.3, td = K('Dis-le', a);
      ft(tl, '#s19-ray', { rotation: 0 }, { rotation: 30, duration: d, ease: 'none' }, a);
      ft(tl, '#s19h', { y: 200, scale: 0.9 }, { y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.8)' }, a);
      ft(tl, '#s19h-aR', { rotation: -140 }, { rotation: -166, duration: 0.35, ease: 'back.out(3)' }, a + 0.2);
      A.talk(tl, 's19h', 'happy', a, b, 0);
      A.blink(tl, 's19h', [a + 1.3]);
      A.pop(tl, '#s19-cm', td - 0.05);
      A.pop(tl, '#s19-ht', td + 0.3);
      for (var i = 0; i < 3; i++) ft(tl, '#s19-d' + i, { y: 0 }, { y: -16, duration: 0.25, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((b - td) / 0.25) }, td + 0.3 + i * 0.1);
      ft(tl, '#s19-ht', { scale: 1 }, { scale: 1.15, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((b - td) / 0.3) }, td + 0.7);
    }
  };
})();
