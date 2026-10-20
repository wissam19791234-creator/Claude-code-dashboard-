// « Combien ça rapporte de pousser les caddies des autres ? » — calque 2D posé sur le monde 3D (src/world.js) :
// « STOP ! », titres, gros chiffres, étiquettes, bulle « Gardez-la, les jeunes » et Hamsterdam en casquette et gilet fluo ; fond transparent sauf le dernier plan.
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


  var pote = function (id, x, s, o) { return hamOver(id, x, s, Object.assign({ hat: 'cap', vest: 1 }, o)); };
  var stamp = function (tl, sel, t) { gsap.set(sel, { opacity: 0 }); ft(tl, sel, { opacity: 0, scale: 2.4 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'power3.in' }, t); };
  // bulle de BD avec texte
  var BUBBLE = function (id, x, y, w, h, txt, fs, tail) {
    var tx = tail || -1, p = 'M ' + (-w / 2) + ' ' + (-h / 2) + ' Q ' + (-w / 2) + ' ' + (-h / 2 - 20) + ' ' + (-w / 2 + 30) + ' ' + (-h / 2 - 20) + ' L ' + (w / 2 - 30) + ' ' + (-h / 2 - 20) +
      ' Q ' + (w / 2) + ' ' + (-h / 2 - 20) + ' ' + (w / 2) + ' ' + (-h / 2) + ' L ' + (w / 2) + ' ' + (h / 2) + ' Q ' + (w / 2) + ' ' + (h / 2 + 20) + ' ' + (w / 2 - 30) + ' ' + (h / 2 + 20) +
      ' L ' + (tx * 40) + ' ' + (h / 2 + 20) + ' L ' + (tx * 90) + ' ' + (h / 2 + 90) + ' L ' + (tx * 100) + ' ' + (h / 2 + 20) + ' L ' + (-w / 2 + 30) + ' ' + (h / 2 + 20) + ' Q ' + (-w / 2) + ' ' + (h / 2 + 20) + ' ' + (-w / 2) + ' ' + (h / 2) + ' Z';
    return G({ transform: T(x, y) }, G(id, P(p, C.w, LW) + el('text', { x: 0, y: 4, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Patrick Hand', 'font-size': fs, fill: '#222222' }, esc(txt))));
  };

  // 1 · accroche : STOP ! puis « Toi et ton pote, même à 14 ans, 120 € chaque samedi… sur un parking de supermarché. »
  S[1] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s1-b', 540, 700, 'STOP !', '#ffffff', 220, -6) +
        LAB('s1-l', 540, 230, 'toi et ton pote…', BLU, 70, -2) + NUM('s1-a', 540, 350, 'MÊME À 14 ANS', ORA, 110, 2) + NUM('s1-n', 540, 500, '120 € / SAMEDI', GRN, 128, -3);
    }, anim: function (tl, a, b, K) {
      gsap.set('#s1-b', { scale: 0.2, opacity: 0 });
      ft(tl, '#s1-b', { scale: 0.2, opacity: 0 }, { scale: 1.1, opacity: 1, duration: 0.12, ease: 'back.out(3)' }, 0.45);
      ft(tl, '#s1-b', { x: -12 }, { x: 12, duration: 0.04, ease: 'none', yoyo: true, repeat: 7 }, 0.48);
      ft(tl, '#s1-b', { opacity: 1, scale: 1.1 }, { opacity: 0, scale: 1.5, duration: 0.2, ease: 'power2.in' }, 0.95);
      pop(tl, '#s1-l', K('Toi et', a), 0.5); pop(tl, '#s1-a', K('même à', a)); pop(tl, '#s1-n', K('120', a));
    } };
  // 2 · titre
  S[2] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s2-t1', 540, 230, 'COMBIEN ÇA RAPPORTE', YEL, 92, -2) + NUM('s2-t2', 540, 360, 'DE POUSSER LES CADDIES', '#ffffff', 84, -2) + NUM('s2-t3', 540, 490, 'DES AUTRES ?', ORA, 130, 2) +
        pote('h2', 165, 0.5, { faces: ['happy'], armR: { a: 80, hand: 'point' } });
    }, anim: function (tl, a, b, K) { pop(tl, '#s2-t1', a, 0.5); pop(tl, '#s2-t2', K('de pousser', a), 0.5); pop(tl, '#s2-t3', K('des autres?', a), 0.4); talk(tl, 'h2', 'happy', a, b); } };
  // 3 · le directeur dit oui… parce que les caddies sont rangés gratos
  S[3] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return TAG('s3-t', 540, 230, 'DEMANDE AU DIRECTEUR', BLU, 60, -3) + NUM('s3-n', 540, 360, 'IL DIT OUI', GRN, 120, 2) + LAB('s3-l', 560, 1420, '…vous rangez ses caddies gratos !', '#222222', 58, -2);
    }, anim: function (tl, a, b, K) { pop(tl, '#s3-t', K('demande', a)); pop(tl, '#s3-n', K('Il dit oui…', a)); pop(tl, '#s3-l', K('parce que', a), 0.5); } };
  // 4 · deux gilets fluo, une pancarte
  S[4] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return TAG('s4-t0', 300, 240, '2 GILETS FLUO', '#d9480f', 58, -4) + TAG('s4-t1', 780, 240, '1 PANCARTE', BLU, 58, 4) + NUM('s4-n', 540, 1420, '2 € LE COFFRE', GRN, 116, -2);
    }, anim: function (tl, a, b, K) { pop(tl, '#s4-t0', K('gilets', a)); pop(tl, '#s4-t1', K('pancarte:', a)); pop(tl, '#s4-n', K('2 euros', a)); } };
  // 5 · l'un pousse, l'autre charge, et on ramène le caddie
  S[5] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return LAB('s5-l0', 300, 250, 'ton pote pousse', BLU, 64, -4) + LAB('s5-l1', 780, 250, 'toi, tu charges', PNK, 64, 4) + TAG('s5-t', 540, 380, 'ET ON RAMÈNE LE CADDIE', '#1e8f3a', 52, -2);
    }, anim: function (tl, a, b, K) { pop(tl, '#s5-l0', K('pousse', a), 0.5); pop(tl, '#s5-l1', K('toi tu', a), 0.5); pop(tl, '#s5-t', K('Puis vous', a)); } };
  // 6 · la pièce de 1 € : « Gardez-la, les jeunes. » À chaque fois.
  S[6] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s6-n', 540, 240, 'LA PIÈCE DE 1 € ?', '#ffffff', 104, -3) + BUBBLE('s6-b', 560, 1250, 620, 130, '« Gardez-la, les jeunes ! »', 60, -1) + STAMP('s6-st', 540, 400, 'À CHAQUE FOIS', RED, -6);
    }, anim: function (tl, a, b, K) { pop(tl, '#s6-n', K('la pièce', a), 0.5); pop(tl, '#s6-b', K('Gardez-la,', a), 0.4); stamp(tl, '#s6-st', K('À chaque fois.', a)); } };
  // 7 · 1 client / 12 min, 10 h → 18 h : 40 clients × 3 € = 120 €
  S[7] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return TAG('s7-t0', 300, 230, '1 CLIENT / 12 MIN', BLU, 52, -4) + TAG('s7-t1', 790, 230, '10 H → 18 H', '#d9480f', 52, 4) + NUM('s7-n0', 540, 370, '40 CLIENTS × 3 €', '#ffffff', 92, -2) + NUM('s7-n1', 540, 510, '120 €', GRN, 160, 2) +
        LAB('s7-l', 540, 650, '(2 € + la pièce du caddie)', '#222222', 56, -2);
    }, anim: function (tl, a, b, K) { pop(tl, '#s7-t0', K('12', a)); pop(tl, '#s7-t1', K('10', a)); pop(tl, '#s7-n0', K('40', a)); pop(tl, '#s7-l', K('3 euros.', a), 0.5); pop(tl, '#s7-n1', K('120 euros.', a)); } };
  // 8 · « 120 ! Je m'achète un caddie en or »
  S[8] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s8-n', 540, 280, '120 € !', GRN, 180, -4) + LAB('s8-l', 760, 460, 'un caddie en or !', ORA, 70, 5) +
        pote('h8', 165, 0.55, { faces: ['grin'], shades: 1, armL: { a: 140, hand: 'open' }, armR: { a: 150, hand: 'open' } });
    }, anim: function (tl, a, b, K) { pop(tl, '#s8-n', a + 0.05); pop(tl, '#s8-l', K('or.', a), 0.5);
      ft(tl, '#h8-aL', { rotation: -130 }, { rotation: -165, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 7 }, a);
      ft(tl, '#h8-aR', { rotation: -165 }, { rotation: -130, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 7 }, a); } };
  // 9 · « Attends. Vous êtes deux. » : 60 € chacun, − gilets, pancarte, goûter → 55 €
  S[9] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s9-a', 540, 380, 'ATTENDS.', '#ffffff', 170, -4) + NUM('s9-d', 540, 230, 'VOUS ÊTES 2', '#ffffff', 110, -3) +
        TAG('s9-t0', 230, 360, '− GILETS', RED, 46, -4) + TAG('s9-t1', 540, 360, '− PANCARTE', RED, 46, 3) + TAG('s9-t2', 850, 360, '− GOÛTER', RED, 46, -3) +
        NUM('s9-n', 540, 510, '55 € CHACUN', GRN, 130, -2) + LAB('s9-l', 800, 640, 'en une journée !', BLU, 62, 5) + LAB('s9-c', 250, 650, '1 pièce = 5 €', '#222222', 50, -4) +
        LAB('s9-p0', 240, 1400, 'ton pote', '#222222', 60, -3) + LAB('s9-p1', 840, 1400, 'toi', '#222222', 60, 3);
    }, anim: function (tl, a, b, K) {
      var td = K('Vous êtes', a);
      pop(tl, '#s9-a', a + 0.02); out(tl, '#s9-a', td - 0.1); pop(tl, '#s9-d', td); out(tl, '#s9-d', K('Enlève', a) - 0.05);
      pop(tl, '#s9-p0', K('deux.', a) + 0.3, 0.5); pop(tl, '#s9-p1', K('deux.', a) + 0.4, 0.5); pop(tl, '#s9-c', K('Enlève', a), 0.5);
      [K('gilets,', a), K('la pancarte', a), K('goûter:', a)].forEach(function (t, k) { pop(tl, '#s9-t' + k, t); });
      pop(tl, '#s9-n', K('55', a)); pop(tl, '#s9-l', K('En une journée.', a), 0.5);
    } };
  // 10 · l'astuce de pro : le parapluie géant
  S[10] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return G({ transform: T(540, 230, 1, -4) }, G('s10-ban', R(-380, -80, 760, 160, 14, '#ffffff', LW) + el('text', { x: 0, y: 6, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Luckiest Guy', 'font-size': 104, fill: RED }, 'ASTUCE DE PRO'))) +
        LAB('s10-l', 540, 370, 'quand il pleut…', BLU, 70, 2) + NUM('s10-n', 540, 1420, 'LE PARAPLUIE GÉANT', ORA, 96, -3);
    }, anim: function (tl, a, b, K) { pop(tl, '#s10-ban', K("l'astuce", a)); pop(tl, '#s10-l', K('quand il', a), 0.5); pop(tl, '#s10-n', K('parapluie', a)); } };
  // 11 · les pourboires doublent
  S[11] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return LAB('s11-l', 540, 240, 'personne ne veut courir sous la pluie', '#222222', 54, -2) + NUM('s11-n', 540, 390, 'POURBOIRES × 2', GRN, 120, 2) +
        LAB('s11-a', 240, 1300, 'soleil', '#222222', 60, -3) + LAB('s11-b', 840, 1300, 'pluie', BLU, 60, 3);
    }, anim: function (tl, a, b, K) { pop(tl, '#s11-l', a + 0.05, 0.5); pop(tl, '#s11-a', a + 0.3, 0.5); pop(tl, '#s11-b', a + 0.45, 0.5); pop(tl, '#s11-n', K('pourboires', a)); } };
  // 12 · « Votre meilleur commercial ? Le pack d'eau de 9 kilos. »
  S[12] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s12-n', 540, 250, 'VOTRE MEILLEUR', '#ffffff', 100, -3) + NUM('s12-n2', 540, 370, 'COMMERCIAL ?', YEL, 110, 2) + STAMP('s12-st', 560, 1380, "LE PACK D'EAU (9 KG)", RED, -5) +
        pote('h12', 150, 0.46, { faces: ['proud'], armR: { a: 150, hand: 'thumb' } });
    }, anim: function (tl, a, b, K) { pop(tl, '#s12-n', a + 0.05, 0.5); pop(tl, '#s12-n2', K('commercial?', a), 0.5); talk(tl, 'h12', 'proud', a, b); stamp(tl, '#s12-st', K('Le pack', a)); } };
  // 13 · « Quelle technique je calcule la prochaine fois ? » (plan entièrement 2D)
  S[13] = { cam: [[540, 1100, 1.0, 1.08]], svg: function () {
      var g = burst('s13-ray', '#9fd8ff', '#e6f6ff', 540, 1200);
      g += G({ transform: T(260, 1000) }, G('s13-cm', P('M -150 -100 Q -150 -150 -100 -150 L 100 -150 Q 150 -150 150 -100 L 150 20 Q 150 70 100 70 L -20 70 L -90 130 L -70 70 L -100 70 Q -150 70 -150 20 Z', C.w, LW) +
        Ci(-60, -40, 18, BLU, 0, { id: 's13-d0' }) + Ci(0, -40, 18, BLU, 0, { id: 's13-d1' }) + Ci(60, -40, 18, BLU, 0, { id: 's13-d2' })));
      g += NUM('s13-q', 830, 760, '?', YEL, 220, 10);
      return g + A.hamster('h13', 560, 1880, 1.1, { hat: 'cap', vest: 1, faces: ['happy'], armL: { a: 18 }, armR: { a: 166, hand: 'point' } });
    }, anim: function (tl, a, b, K) {
      var td = K('Dis-le', a);
      ft(tl, '#s13-ray', { rotation: 0 }, { rotation: 30, duration: b - a + 0.3, ease: 'none' }, a);
      ft(tl, '#h13', { y: 200 }, { y: 0, duration: 0.4, ease: 'back.out(1.8)' }, a);
      pop(tl, '#s13-q', a + 0.3); wob(tl, '#s13-q', a + 0.6, b - a);
      talk(tl, 'h13', 'happy', a, b);
      pop(tl, '#s13-cm', td - 0.05);
      for (var i = 0; i < 3; i++) ft(tl, '#s13-d' + i, { y: 0 }, { y: -16, duration: 0.25, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((b - td) / 0.25) }, td + 0.3 + i * 0.1);
    } };
})();
