// « Combien ça rapporte de louer des sapins de Noël ? » — calque 2D posé sur le monde 3D (src/world.js) :
// titres, gros chiffres (rouge = dépense, vert = gain), étiquettes manuscrites et Hamsterdam en bonnet de Noël ; fond transparent sauf le dernier plan.
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


  var shade = function (x, s) { return E(x, GY + 16, 190 * s, 26 * s, 'rgba(40,30,20,0.18)', 0); };
  var hamOver = function (id, x, s, o) { return shade(x, s) + A.hamster(id, x, GY + 14, s, Object.assign({ shadow: false }, o)); };
  var GY2 = 1500;


  var noel = function (id, x, s, o) { return hamOver(id, x, s, Object.assign({ hat: 'noel' }, o)); };
  var stamp = function (tl, sel, t) { gsap.set(sel, { opacity: 0 }); ft(tl, sel, { opacity: 0, scale: 2.4 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'power3.in' }, t); };

  // 1 · « Ce gars loue le même sapin de Noël à la même famille. Chaque année. »
  S[1] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s1-t', 540, 270, 'IL LOUE LE MÊME SAPIN', '#ffffff', 90, -3) + LAB('s1-l', 540, 400, 'à la même famille…', BLU, 62, -2) + NUM('s1-n', 540, 530, 'CHAQUE ANNÉE', RED, 130, 3);
    }, anim: function (tl, a, b, K) { pop(tl, '#s1-t', a, 0.6); pop(tl, '#s1-l', K('à la même', a), 0.5); stamp(tl, '#s1-n', K('Chaque année.', a)); } };
  // 2 · titre
  S[2] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s2-t1', 540, 260, 'COMBIEN ÇA RAPPORTE', YEL, 92, -2) + NUM('s2-t2', 540, 380, 'DE LOUER DES', '#ffffff', 96, -2) + NUM('s2-t3', 540, 540, 'SAPINS DE NOËL ?', GRN, 124, -3) +
        noel('h2', 165, 0.5, { faces: ['happy'], armR: { a: 80, hand: 'point' } });
    }, anim: function (tl, a, b, K) { pop(tl, '#s2-t1', a, 0.5); pop(tl, '#s2-t2', K('de louer', a), 0.5); pop(tl, '#s2-t3', K('sapins de Noël?', a), 0.4); talk(tl, 'h2', 'happy', a, b); } };
  // 3 · 300 sapins en pot à 25 € : 7 500 €
  S[3] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return LAB('s3-l', 540, 250, 'des sapins en pot', ORA, 62, -2) + NUM('s3-n', 540, 380, '300 SAPINS', BLU, 120, -3) + TAG('s3-t', 300, 1350, '25 € PIÈCE', RED, 62, -4) + NUM('s3-n2', 760, 1360, '− 7 500 €', RED, 110, 3);
    }, anim: function (tl, a, b, K) { pop(tl, '#s3-l', K('en pot', a), 0.5); pop(tl, '#s3-n', K('300', a)); pop(tl, '#s3-t', K('25', a)); pop(tl, '#s3-n2', K('7 500', a)); } };
  // 4 · loué 45 € pour décembre, livré et repris en janvier
  S[4] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s4-n', 540, 280, '45 € / DÉCEMBRE', GRN, 112, -3) + LAB('s4-l1', 300, 420, 'livré…', ORA, 66, -4) + LAB('s4-l2', 720, 430, '…et repris en janvier', ORA, 60, 3);
    }, anim: function (tl, a, b, K) { pop(tl, '#s4-n', K('45', a)); pop(tl, '#s4-l1', K('livrés', a), 0.5); pop(tl, '#s4-l2', K('repris', a), 0.5); } };
  // 5 · 300 sapins loués : 13 500 €
  S[5] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return TAG('s5-t', 540, 250, '300 SAPINS × 45 €', BLU, 62, -3) + NUM('s5-n', 540, 400, '13 500 €', GRN, 150, 2);
    }, anim: function (tl, a, b, K) { pop(tl, '#s5-t', a + 0.05); pop(tl, '#s5-n', K('13 500', a)); } };
  // 6 · « 13 500 ! Je m'achète un traîneau »
  S[6] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s6-n', 540, 330, '13 500 €', GRN, 170, -4) + LAB('s6-l', 760, 520, 'un traîneau !', BLU, 74, 6) +
        noel('h6', 165, 0.55, { faces: ['grin'], shades: 1, armL: { a: 140, hand: 'open' }, armR: { a: 150, hand: 'open' } });
    }, anim: function (tl, a, b, K) { pop(tl, '#s6-n', a + 0.05); pop(tl, '#s6-l', K('traîneau.', a), 0.5);
      ft(tl, '#h6-aL', { rotation: -130 }, { rotation: -165, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 7 }, a);
      ft(tl, '#h6-aR', { rotation: -165 }, { rotation: -130, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 7 }, a); } };
  // 7 · « Attends » : sapins, camionnette, essence → 4 000 € pour un mois
  S[7] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s7-a', 540, 360, 'ATTENDS.', '#ffffff', 170, -4) +
        TAG('s7-t0', 300, 290, '− SAPINS', RED, 56, -4) + TAG('s7-t1', 760, 290, '− CAMIONNETTE', RED, 50, 4) + TAG('s7-t2', 540, 410, '− ESSENCE', RED, 54, -2) +
        NUM('s7-n', 540, 570, '4 000 €', GRN, 140, -2) + LAB('s7-l', 800, 700, 'pour un mois !', BLU, 62, 5) + LAB('s7-c', 260, 760, '1 pièce = 1 000 €', '#222', 52, -4);
    }, anim: function (tl, a, b, K) {
      var te = K('Enlève', a);
      pop(tl, '#s7-a', a + 0.02); out(tl, '#s7-a', te - 0.1); pop(tl, '#s7-c', te, 0.5);
      [K('sapins,', a), K('la camionnette', a), K("l'essence:", a)].forEach(function (t, k) { pop(tl, '#s7-t' + k, t); });
      pop(tl, '#s7-n', K('4 000', a)); pop(tl, '#s7-l', K('Pour un mois.', a), 0.5);
    } };
  // 8 · l'astuce de pro : on replante, ils grandissent
  S[8] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return G({ transform: T(540, 250, 1, -4) }, G('s8-ban', R(-380, -80, 760, 160, 14, '#ffffff', LW) + el('text', { x: 0, y: 6, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Luckiest Guy', 'font-size': 104, fill: RED }, 'ASTUCE DE PRO'))) +
        LAB('s8-l0', 540, 400, 'en janvier : on ne jette rien !', BLU, 60, -2) + TAG('s8-t', 300, 1380, 'REPLANTÉS', GRN, 62, -4) + LAB('s8-l1', 760, 1390, 'ils grandissent…', GRN, 64, 4);
    }, anim: function (tl, a, b, K) { pop(tl, '#s8-ban', K("l'astuce", a)); pop(tl, '#s8-l0', K('tu ne jettes', a), 0.5); pop(tl, '#s8-t', K('Tu replantes', a)); pop(tl, '#s8-l1', K('grandissent.', a), 0.5); } };
  // 9 · l'année d'après : plus de 10 000 €, toujours pour un mois
  S[9] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return TAG('s9-t', 540, 240, "L'ANNÉE D'APRÈS", BLU, 64, -3) + LAB('s9-l0', 540, 360, 'presque rien à racheter', ORA, 60, 2) + NUM('s9-n', 540, 500, '+ DE 10 000 €', GRN, 124, -3) +
        LAB('s9-l1', 540, 1400, 'toujours pour un mois !', BLU, 64, -3);
    }, anim: function (tl, a, b, K) { pop(tl, '#s9-t', a + 0.05); pop(tl, '#s9-l0', K("n'achètes", a), 0.5); pop(tl, '#s9-n', K('10 000', a)); pop(tl, '#s9-l1', K('Toujours', a), 0.5); } };
  // 10 · les familles redemandent le même sapin… il s'appelle Gérard
  S[10] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return LAB('s10-l', 540, 260, '« on veut le même ! »', PNK, 72, -3) + NUM('s10-n', 540, 400, 'IL A UN PRÉNOM', '#ffffff', 100, 2) +
        noel('h10', 165, 0.5, { faces: ['joy'], armL: { a: 30 }, armR: { a: 150, hand: 'open' } });
    }, anim: function (tl, a, b, K) { pop(tl, '#s10-l', K('redemandent', a), 0.5); pop(tl, '#s10-n', K('prénom.', a)); talk(tl, 'h10', 'joy', a, b); } };
  // 11 · « C'est un abonnement »
  S[11] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s11-n', 540, 330, 'UN SAPIN À 45 € ?', '#ffffff', 100, -3) + STAMP('s11-st', 540, 520, 'UN ABONNEMENT', RED, -6) +
        noel('h11', 150, 0.46, { faces: ['proud'], armR: { a: 150, hand: 'thumb' } });
    }, anim: function (tl, a, b, K) { pop(tl, '#s11-n', a + 0.05, 0.5); talk(tl, 'h11', 'proud', a, b); stamp(tl, '#s11-st', K('abonnement.', a)); } };
  // 12 · « Quel business je calcule la prochaine fois ? » (plan 2D, la neige 3D tombe derrière)
  S[12] = { cam: [[540, 1100, 1.0, 1.08]], svg: function () {
      var g = burst('s12-ray', '#d9f0dc', '#f2fbf2', 540, 1200);
      g += G({ transform: T(260, 1000) }, G('s12-cm', P('M -150 -100 Q -150 -150 -100 -150 L 100 -150 Q 150 -150 150 -100 L 150 20 Q 150 70 100 70 L -20 70 L -90 130 L -70 70 L -100 70 Q -150 70 -150 20 Z', C.w, LW) +
        Ci(-60, -40, 18, GRN, 0, { id: 's12-d0' }) + Ci(0, -40, 18, GRN, 0, { id: 's12-d1' }) + Ci(60, -40, 18, GRN, 0, { id: 's12-d2' })));
      g += NUM('s12-q', 830, 760, '?', YEL, 220, 10);
      return g + A.hamster('h12', 560, 1880, 1.1, { hat: 'noel', faces: ['happy'], armL: { a: 18 }, armR: { a: 166, hand: 'point' } });
    }, anim: function (tl, a, b, K) {
      var td = K('Dis-le', a);
      ft(tl, '#s12-ray', { rotation: 0 }, { rotation: 30, duration: b - a + 0.3, ease: 'none' }, a);
      ft(tl, '#h12', { y: 200 }, { y: 0, duration: 0.4, ease: 'back.out(1.8)' }, a);
      pop(tl, '#s12-q', a + 0.3); wob(tl, '#s12-q', a + 0.6, b - a);
      talk(tl, 'h12', 'happy', a, b);
      pop(tl, '#s12-cm', td - 0.05);
      for (var i = 0; i < 3; i++) ft(tl, '#s12-d' + i, { y: 0 }, { y: -16, duration: 0.25, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((b - td) / 0.25) }, td + 0.3 + i * 0.1);
    } };
})();
