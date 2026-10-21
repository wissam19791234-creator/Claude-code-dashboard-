// « Combien ça rapporte de repêcher les balles de golf ? » — calque 2D posé sur le monde 3D (src/world.js) :
// « PLOUF ! », titres, gros chiffres, étiquettes, tampons et Hamsterdam en masque de plongée et tuba ; fond transparent sauf le dernier plan.
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
  var STAMP = function (id, x, y, txt, col, rot, fs0) {
    var fs = fs0 || 84, w = Math.round(txt.length * fs * 0.62 + 60);
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


  var shade = function (x, s) { return E(x, GY + 16, 190 * s, 26 * s, 'rgba(40,30,20,0.18)', 0); };
  var hamOver = function (id, x, s, o) { return shade(x, s) + A.hamster(id, x, GY + 14, s, Object.assign({ shadow: false }, o)); };
  var GY2 = 1500;


  var pote = function (id, x, s, o) { return hamOver(id, x, s, Object.assign({ hat: 'plongee' }, o)); };
  var stamp = function (tl, sel, t) { gsap.set(sel, { opacity: 0 }); ft(tl, sel, { opacity: 0, scale: 2.4 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'power3.in' }, t); };

  // 1 · accroche : PLOUF ! puis « Il plonge dans un lac de golf… et il ressort avec 3 000 balles. Littéralement. »
  S[1] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s1-p', 540, 1180, 'PLOUF !', '#ffffff', 200, -6) +
        LAB('s1-l', 540, 230, 'il plonge dans un lac de golf…', '#1554c0', 62, -2) + NUM('s1-n', 540, 380, '3 000 BALLES', GRN, 150, -3) + STAMP('s1-st', 540, 560, 'LITTÉRALEMENT', RED, -6);
    }, anim: function (tl, a, b, K) {
      gsap.set('#s1-p', { scale: 0.2, opacity: 0 });
      ft(tl, '#s1-p', { scale: 0.2, opacity: 0 }, { scale: 1.1, opacity: 1, duration: 0.12, ease: 'back.out(3)' }, 0.34);
      ft(tl, '#s1-p', { x: -10 }, { x: 10, duration: 0.04, ease: 'none', yoyo: true, repeat: 7 }, 0.37);
      ft(tl, '#s1-p', { opacity: 1, scale: 1.1 }, { opacity: 0, scale: 1.5, duration: 0.2, ease: 'power2.in' }, 1.0);
      pop(tl, '#s1-l', K('Il plonge', a), 0.5); pop(tl, '#s1-n', K('3 000 balles.', a)); stamp(tl, '#s1-st', K('Littéralement.', a));
    } };
  // 2 · titre
  S[2] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s2-t1', 540, 230, 'COMBIEN ÇA RAPPORTE', YEL, 92, -2) + NUM('s2-t2', 540, 360, 'DE REPÊCHER LES', '#ffffff', 92, -2) + NUM('s2-t3', 540, 490, 'BALLES DE GOLF ?', ORA, 124, 2) +
        pote('h2', 915, 0.5, { faces: ['happy'], armL: { a: 80, hand: 'point' } });
    }, anim: function (tl, a, b, K) { pop(tl, '#s2-t1', a, 0.5); pop(tl, '#s2-t2', K('de repêcher', a), 0.5); pop(tl, '#s2-t3', K('balles de golf?', a), 0.4); talk(tl, 'h2', 'happy', a, b); } };
  // 3 · sous l'eau : 50 000 balles par an
  S[3] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return LAB('s3-l', 540, 230, 'chaque année, dans un seul lac…', '#222222', 60, -2) + NUM('s3-n', 540, 380, '50 000 BALLES', '#ffffff', 140, 2) + LAB('s3-c', 540, 520, 'au fond de l’eau', '#222222', 56, -3);
    }, anim: function (tl, a, b, K) { pop(tl, '#s3-l', a + 0.05, 0.5); pop(tl, '#s3-n', K('50', a)); pop(tl, '#s3-c', K('50', a) + 0.35, 0.5); } };
  // 4 · contrat : 10 centimes par balle
  S[4] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return TAG('s4-t', 540, 230, 'CONTRAT AVEC LE GOLF', BLU, 58, -3) + NUM('s4-n', 540, 370, '10 CTS / BALLE', RED, 120, 2);
    }, anim: function (tl, a, b, K) { pop(tl, '#s4-t', K('signe', a)); pop(tl, '#s4-n', K('10 centimes', a)); } };
  // 5 · le matériel
  S[5] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return TAG('s5-a', 290, 230, 'COMBINAISON', BLU, 54, -4) + TAG('s5-b', 800, 230, 'BOUTEILLE', BLU, 54, 4) + TAG('s5-c', 540, 345, 'FILET', BLU, 54, -2) + NUM('s5-n', 540, 1450, '− 1 500 €', RED, 150, -3);
    }, anim: function (tl, a, b, K) { pop(tl, '#s5-a', K('Combinaison,', a)); pop(tl, '#s5-b', K('bouteille,', a)); pop(tl, '#s5-c', K('filet:', a)); pop(tl, '#s5-n', K('1 500', a)); } };
  // 6 · une plongée : 3 000 balles
  S[6] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return LAB('s6-l', 540, 230, 'en une plongée…', '#222222', 66, -2) + NUM('s6-n', 540, 380, '3 000 BALLES', '#ffffff', 140, -3);
    }, anim: function (tl, a, b, K) { pop(tl, '#s6-l', a + 0.05, 0.5); pop(tl, '#s6-n', K('3 000 balles.', a)); } };
  // 7 · lavées, triées par marque
  S[7] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return LAB('s7-l', 540, 230, 'on les lave…', '#1554c0', 64, -3) + TAG('s7-t', 540, 360, 'TRI PAR MARQUE', '#d9480f', 64, 2);
    }, anim: function (tl, a, b, K) { pop(tl, '#s7-l', K('laves,', a), 0.5); pop(tl, '#s7-t', K('tries', a)); } };
  // 8 · les marques : 30 centimes contre 3 €
  S[8] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return TAG('s8-b0', 270, 230, 'TITLEIST', '#111111', 58, -4) + TAG('s8-b1', 800, 230, 'CALLAWAY', '#111111', 58, 4) + TAG('s8-b2', 540, 345, 'TAYLORMADE', '#111111', 58, -2) +
        NUM('s8-p0', 300, 1330, '0,30 €', RED, 100, -4) + NUM('s8-p1', 800, 1330, '3 €', GRN, 150, 4) +
        LAB('s8-l0', 300, 1450, 'supermarché', '#222222', 56, -3) + LAB('s8-l1', 800, 1460, 'premium', '#222222', 56, 3);
    }, anim: function (tl, a, b, K) {
      pop(tl, '#s8-l0', K('supermarché', a), 0.5); pop(tl, '#s8-p0', K('30 centimes', a));
      pop(tl, '#s8-b0', K('Titleist,', a)); pop(tl, '#s8-b1', K('Callaway', a)); pop(tl, '#s8-b2', K('TaylorMade,', a));
      pop(tl, '#s8-l1', K('Titleist,', a) + 0.2, 0.5); pop(tl, '#s8-p1', K('3 euros.', a));
    } };
  // 9 · en moyenne 1 € pièce : 3 000 €
  S[9] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return LAB('s9-l', 540, 230, 'en moyenne…', '#1554c0', 66, -3) + NUM('s9-n', 540, 390, '3 000 €', GRN, 170, 2) + LAB('s9-x', 540, 1450, '3 000 balles × 1 €', '#222222', 60, -2);
    }, anim: function (tl, a, b, K) { pop(tl, '#s9-l', a + 0.05, 0.5); pop(tl, '#s9-n', K('3 000 euros.', a)); pop(tl, '#s9-x', K('3 000 euros.', a) + 0.2, 0.5); } };
  // 10 · « 3 000 ! Je m'achète un golf »
  S[10] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s10-n', 540, 280, '3 000 € !', GRN, 180, -4) + LAB('s10-l', 740, 460, 'je m’achète un golf !', ORA, 66, 5) +
        pote('h10', 170, 0.55, { faces: ['grin'], armL: { a: 140, hand: 'open' }, armR: { a: 150, hand: 'open' } });
    }, anim: function (tl, a, b, K) { pop(tl, '#s10-n', a + 0.05); pop(tl, '#s10-l', K('golf.', a), 0.5);
      ft(tl, '#h10-aL', { rotation: -130 }, { rotation: -165, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 7 }, a);
      ft(tl, '#h10-aR', { rotation: -165 }, { rotation: -130, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 7 }, a); } };
  // 11 · « Attends. » − part du golf, balles abîmées, essence → 1 900 €
  S[11] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s11-a', 540, 380, 'ATTENDS.', '#ffffff', 170, -4) +
        TAG('s11-t0', 280, 300, '− 300 € GOLF', RED, 46, -4) + TAG('s11-t1', 800, 300, '− 700 € ABÎMÉES', RED, 46, 3) + TAG('s11-t2', 540, 405, '− 100 € ESSENCE', RED, 46, -3) +
        NUM('s11-n', 540, 535, '1 900 €', GRN, 150, -2) + LAB('s11-l', 820, 655, 'en une journée !', '#1554c0', 60, 5) + LAB('s11-c', 250, 655, '1 pièce = 100 €', '#222222', 50, -4);
    }, anim: function (tl, a, b, K) {
      var tm = K('Moins', a);
      pop(tl, '#s11-a', a + 0.02); out(tl, '#s11-a', tm - 0.1); pop(tl, '#s11-c', tm, 0.5);
      [K('golf,', a), K('abîmées', a), K("l'essence:", a)].forEach(function (t, k) { pop(tl, '#s11-t' + k, t); });
      pop(tl, '#s11-n', K('1 900', a)); pop(tl, '#s11-l', K('En une journée.', a), 0.5);
    } };
  // 12 · l'astuce de pro : le trou le plus dur
  S[12] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return G({ transform: T(540, 230, 1, -4) }, G('s12-ban', R(-380, -80, 760, 160, 14, '#ffffff', LW) + el('text', { x: 0, y: 6, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Luckiest Guy', 'font-size': 104, fill: RED }, 'ASTUCE DE PRO'))) +
        LAB('s12-l', 540, 370, 'plonge devant…', '#1554c0', 70, 2) + NUM('s12-n', 540, 1450, 'LE TROU LE PLUS DUR', ORA, 96, -3);
    }, anim: function (tl, a, b, K) { pop(tl, '#s12-ban', K("l'astuce", a)); pop(tl, '#s12-l', K('plonge devant', a), 0.5); pop(tl, '#s12-n', K('le trou', a)); } };
  // 13 · tout le monde rate : × 10
  S[13] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return LAB('s13-l', 540, 240, 'c’est là que tout le monde rate…', '#222222', 58, -2) + NUM('s13-n', 540, 400, '× 10 BALLES', GRN, 150, 2);
    }, anim: function (tl, a, b, K) { pop(tl, '#s13-l', K('tout le monde', a), 0.5); pop(tl, '#s13-n', K('dix fois', a)); } };
  // 14 · « Le pire joueur du club ? C'est ton meilleur fournisseur. »
  S[14] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s14-n', 540, 250, 'LE PIRE JOUEUR', '#ffffff', 104, -3) + NUM('s14-n2', 540, 375, 'DU CLUB ?', YEL, 116, 2) + STAMP('s14-st', 540, 1420, 'TON MEILLEUR FOURNISSEUR', RED, -5, 60);
    }, anim: function (tl, a, b, K) { pop(tl, '#s14-n', a + 0.05, 0.5); pop(tl, '#s14-n2', K('du club?', a), 0.5); stamp(tl, '#s14-st', K("C'est ton", a)); } };
  // 15 · « Quel business je calcule la prochaine fois ? » (plan entièrement 2D)
  S[15] = { cam: [[540, 1100, 1.0, 1.08]], svg: function () {
      var g = burst('s15-ray', '#7fd3ff', '#dff6ff', 540, 1200);
      g += G({ transform: T(260, 1000) }, G('s15-cm', P('M -150 -100 Q -150 -150 -100 -150 L 100 -150 Q 150 -150 150 -100 L 150 20 Q 150 70 100 70 L -20 70 L -90 130 L -70 70 L -100 70 Q -150 70 -150 20 Z', C.w, LW) +
        Ci(-60, -40, 18, BLU, 0, { id: 's15-d0' }) + Ci(0, -40, 18, BLU, 0, { id: 's15-d1' }) + Ci(60, -40, 18, BLU, 0, { id: 's15-d2' })));
      g += NUM('s15-q', 830, 760, '?', YEL, 220, 10);
      return g + A.hamster('h15', 560, 1880, 1.1, { hat: 'plongee', faces: ['happy'], armL: { a: 18 }, armR: { a: 166, hand: 'point' } });
    }, anim: function (tl, a, b, K) {
      var td = K('Dis-le', a);
      ft(tl, '#s15-ray', { rotation: 0 }, { rotation: 30, duration: b - a + 0.3, ease: 'none' }, a);
      ft(tl, '#h15', { y: 200 }, { y: 0, duration: 0.4, ease: 'back.out(1.8)' }, a);
      pop(tl, '#s15-q', a + 0.3); wob(tl, '#s15-q', a + 0.6, b - a);
      talk(tl, 'h15', 'happy', a, b);
      pop(tl, '#s15-cm', td - 0.05);
      for (var i = 0; i < 3; i++) ft(tl, '#s15-d' + i, { y: 0 }, { y: -16, duration: 0.25, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((b - td) / 0.25) }, td + 0.3 + i * 0.1);
    } };
})();
