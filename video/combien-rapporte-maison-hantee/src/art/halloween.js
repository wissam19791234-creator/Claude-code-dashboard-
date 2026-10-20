// « Combien ça rapporte une maison hantée pour Halloween ? » — calque 2D posé sur le monde 3D (src/world.js) :
// « BOUH ! », titres, gros chiffres (rouge = dépense, vert = gain), étiquettes et Hamsterdam en chapeau de sorcier ; fond transparent sauf le dernier plan.
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


  var LBL = '#9fe0ff';
  // sur le fond violet, les étiquettes manuscrites gardent un contour sombre (au lieu du halo blanc)
  LAB = function (id, x, y, txt, col, fs, rot) {
    fs = fs || 64;
    return G({ transform: T(x, y, 1, rot || 0) }, G(id, el('text', { x: 0, y: 0, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Patrick Hand', 'font-size': fs,
      fill: col || '#ffffff', stroke: '#1b1226', 'stroke-width': 9, 'stroke-linejoin': 'round', 'paint-order': 'stroke' }, esc(txt))));
  };
  var witch = function (id, x, s, o) { return hamOver(id, x, s, Object.assign({ hat: 'sorcier' }, o)); };
  var stamp = function (tl, sel, t) { gsap.set(sel, { opacity: 0 }); ft(tl, sel, { opacity: 0, scale: 2.4 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'power3.in' }, t); };

  // 1 · accroche : « BOUH ! » puis « Ils paient 20 €… pour avoir peur. Et ils font 2 heures de queue. »
  S[1] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s1-b', 540, 1440, 'BOUH !', '#ffffff', 260, -6) +
        NUM('s1-t', 540, 250, 'ILS PAIENT 20 €', YEL, 118, -3) + NUM('s1-n', 540, 400, 'POUR AVOIR PEUR', ORA, 104, 2) + LAB('s1-l', 560, 530, '…et 2 h de queue !', LBL, 64, -3) +
        witch('h1', 165, 0.5, { faces: ['shock'], sweat: 1, armL: { a: 150, hand: 'open' }, armR: { a: 150, hand: 'open' } });
    }, anim: function (tl, a, b, K) {
      gsap.set('#s1-b', { scale: 0.2, opacity: 0 });
      ft(tl, '#s1-b', { scale: 0.2, opacity: 0 }, { scale: 1.15, opacity: 1, duration: 0.14, ease: 'back.out(3)' }, a + 0.02);
      ft(tl, '#s1-b', { x: -14 }, { x: 14, duration: 0.04, ease: 'none', yoyo: true, repeat: 9 }, a + 0.06);
      ft(tl, '#s1-b', { opacity: 1, scale: 1.15 }, { opacity: 0, scale: 1.6, duration: 0.2, ease: 'power2.in' }, a + 0.62);
      ft(tl, '#h1', { y: 0 }, { y: -120, duration: 0.16, ease: 'power2.out', yoyo: true, repeat: 1 }, a + 0.02);
      ft(tl, '#h1', { x: -8 }, { x: 8, duration: 0.05, ease: 'none', yoyo: true, repeat: 11 }, a + 0.04);
      pop(tl, '#s1-t', K('20 euros…', a)); pop(tl, '#s1-n', K('pour avoir', a)); pop(tl, '#s1-l', K('Et ils font', a), 0.5);
    } };
  // 2 · titre
  S[2] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s2-t1', 540, 250, 'COMBIEN ÇA RAPPORTE', YEL, 92, -2) + NUM('s2-t2', 540, 380, 'UNE MAISON HANTÉE', ORA, 104, -3) + NUM('s2-t3', 540, 510, 'POUR HALLOWEEN ?', '#ffffff', 96, 2) +
        witch('h2', 165, 0.5, { faces: ['happy'], armR: { a: 80, hand: 'point' } });
    }, anim: function (tl, a, b, K) { pop(tl, '#s2-t1', a, 0.5); pop(tl, '#s2-t2', K('une maison', a), 0.4); pop(tl, '#s2-t3', K('pour Halloween?', a), 0.5); talk(tl, 'h2', 'happy', a, b); } };
  // 3 · l'entrepôt
  S[3] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return LAB('s3-l', 540, 250, 'un vieil entrepôt', LBL, 66, -2) + TAG('s3-t', 540, 370, 'OCTOBRE', ORA, 70, 3) + NUM('s3-n', 540, 1380, '− 4 000 €', RED, 140, -3);
    }, anim: function (tl, a, b, K) { pop(tl, '#s3-l', K('un vieil', a), 0.5); pop(tl, '#s3-t', K("d'octobre:", a)); pop(tl, '#s3-n', K('4 000', a)); } };
  // 4 · décors, fumée, citrouilles
  S[4] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return LAB('s4-l0', 270, 260, 'décors', LBL, 68, -5) + LAB('s4-l1', 540, 300, 'fumée', LBL, 68, 3) + LAB('s4-l2', 820, 260, 'citrouilles', ORA, 68, -3) + NUM('s4-n', 540, 450, '− 3 000 €', RED, 140, -3);
    }, anim: function (tl, a, b, K) { pop(tl, '#s4-l0', a + 0.05, 0.5); pop(tl, '#s4-l1', K('fumée,', a), 0.5); pop(tl, '#s4-l2', K('citrouilles:', a), 0.5); pop(tl, '#s4-n', K('3 000', a)); } };
  // 5 · 10 zombies
  S[5] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s5-t', 540, 250, '10 ZOMBIES', GRN, 130, -3) + LAB('s5-l', 540, 380, '(des étudiants déguisés)', LBL, 58, 2) + NUM('s5-n', 540, 1390, '− 9 000 €', RED, 140, 3);
    }, anim: function (tl, a, b, K) { pop(tl, '#s5-t', K('10', a)); pop(tl, '#s5-l', K('étudiants', a), 0.5); pop(tl, '#s5-n', K('9 000', a)); } };
  // 6 · 12 soirs × 300 visiteurs × 20 € = 72 000 €
  S[6] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return TAG('s6-t0', 300, 230, '12 SOIRS', ORA, 62, -4) + TAG('s6-t1', 760, 230, '300 / SOIR', BLU, 60, 4) + TAG('s6-t2', 540, 345, '× 20 €', GRN, 62, -2) + NUM('s6-n', 540, 490, '72 000 €', GRN, 150, 2);
    }, anim: function (tl, a, b, K) { pop(tl, '#s6-t0', K('12', a)); pop(tl, '#s6-t1', K('300', a)); pop(tl, '#s6-t2', K('20 euros:', a)); pop(tl, '#s6-n', K('72 000', a)); } };
  // 7 · « 72 000 ! Je m'achète un manoir »
  S[7] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s7-n', 540, 300, '72 000 €', GRN, 170, -4) + LAB('s7-l', 760, 480, 'un manoir !', '#ffffff', 74, 6) +
        witch('h7', 165, 0.55, { faces: ['grin'], shades: 1, armL: { a: 140, hand: 'open' }, armR: { a: 150, hand: 'open' } });
    }, anim: function (tl, a, b, K) { pop(tl, '#s7-n', a + 0.05); pop(tl, '#s7-l', K('manoir.', a), 0.5);
      ft(tl, '#h7-aL', { rotation: -130 }, { rotation: -165, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 7 }, a);
      ft(tl, '#h7-aR', { rotation: -165 }, { rotation: -130, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 7 }, a); } };
  // 8 · « Attends » : TVA, entrepôt, décors, zombies, sécurité → ≈ 40 000 € pour un mois
  S[8] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s8-a', 540, 380, 'ATTENDS.', '#ffffff', 170, -4) +
        TAG('s8-t0', 175, 230, '− TVA', RED, 50, -4) + TAG('s8-t1', 490, 230, '− ENTREPÔT', RED, 48, 3) + TAG('s8-t2', 850, 230, '− DÉCORS', RED, 48, -3) +
        TAG('s8-t3', 330, 345, '− ZOMBIES', RED, 48, 2) + TAG('s8-t4', 730, 345, '− SÉCURITÉ', RED, 48, -3) +
        NUM('s8-n', 540, 500, '≈ 40 000 €', GRN, 130, -2) + LAB('s8-l', 800, 625, 'pour un mois !', YEL, 62, 5) + LAB('s8-c', 250, 660, '1 pièce = 4 000 €', LBL, 50, -4);
    }, anim: function (tl, a, b, K) {
      var te = K('Enlève', a);
      pop(tl, '#s8-a', a + 0.02); out(tl, '#s8-a', te - 0.1); pop(tl, '#s8-c', te, 0.5);
      [K('TVA,', a), K("l'entrepôt,", a), K('les décors,', a), K('les zombies', a), K('la sécurité:', a)].forEach(function (t, k) { pop(tl, '#s8-t' + k, t); });
      pop(tl, '#s8-n', K('40 000', a)); pop(tl, '#s8-l', K('Pour un mois.', a), 0.5);
    } };
  // 9 · l'astuce de pro : la file d'attente
  S[9] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return G({ transform: T(540, 230, 1, -4) }, G('s9-ban', R(-380, -80, 760, 160, 14, '#ffffff', LW) + el('text', { x: 0, y: 6, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Luckiest Guy', 'font-size': 104, fill: RED }, 'ASTUCE DE PRO'))) +
        NUM('s9-n', 540, 390, "LA FILE D'ATTENTE", ORA, 100, 2) + LAB('s9-l', 540, 1420, 'plus elle est longue, plus ça rapporte', YEL, 54, -2);
    }, anim: function (tl, a, b, K) { pop(tl, '#s9-ban', K("l'astuce", a)); pop(tl, '#s9-n', K("la file", a)); pop(tl, '#s9-l', K('Plus elle', a), 0.5); } };
  // 10 · pass VIP sans attente : 10 €, 1 visiteur sur 3, + 12 000 €
  S[10] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return LAB('s10-l', 540, 250, '1 visiteur sur 3 le prend', LBL, 60, -2) + NUM('s10-n', 540, 390, '+ 12 000 €', GRN, 140, 2) + LAB('s10-l2', 540, 1420, 'sans faire la queue', YEL, 62, -3);
    }, anim: function (tl, a, b, K) { pop(tl, '#s10-l2', K('sans attente', a), 0.5); pop(tl, '#s10-l', K('Un visiteur', a), 0.5); pop(tl, '#s10-n', K('12 000', a)); } };
  // 11 · la photo de ton cri : 8 €, 1 visiteur sur 2, + 14 000 €
  S[11] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s11-t', 540, 240, 'LA PHOTO DE TON CRI', '#ffffff', 92, -3) + LAB('s11-l', 540, 360, '1 visiteur sur 2 l\'achète', LBL, 60, 2) + NUM('s11-n', 540, 1400, '+ 14 000 €', GRN, 140, -3);
    }, anim: function (tl, a, b, K) { pop(tl, '#s11-t', K('la photo', a), 0.5); pop(tl, '#s11-l', K('Un visiteur', a), 0.5); pop(tl, '#s11-n', K('14 000', a)); } };
  // 12 · « Le vrai monstre de la maison hantée ? C'est la file d'attente. »
  S[12] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s12-n', 540, 280, 'LE VRAI MONSTRE ?', '#ffffff', 108, -3) + STAMP('s12-st', 560, 470, "LA FILE D'ATTENTE", RED, -6) +
        witch('h12', 150, 0.46, { faces: ['proud'], armR: { a: 150, hand: 'thumb' } });
    }, anim: function (tl, a, b, K) { pop(tl, '#s12-n', a + 0.05, 0.5); talk(tl, 'h12', 'proud', a, b); stamp(tl, '#s12-st', K("C'est la file", a)); } };
  // 13 · « Quel business je calcule la prochaine fois ? » (plan entièrement 2D)
  S[13] = { cam: [[540, 1100, 1.0, 1.08]], svg: function () {
      var g = burst('s13-ray', '#ffb347', '#ffe0a8', 540, 1200);
      g += G({ transform: T(260, 1000) }, G('s13-cm', P('M -150 -100 Q -150 -150 -100 -150 L 100 -150 Q 150 -150 150 -100 L 150 20 Q 150 70 100 70 L -20 70 L -90 130 L -70 70 L -100 70 Q -150 70 -150 20 Z', C.w, LW) +
        Ci(-60, -40, 18, '#7a2fd0', 0, { id: 's13-d0' }) + Ci(0, -40, 18, '#7a2fd0', 0, { id: 's13-d1' }) + Ci(60, -40, 18, '#7a2fd0', 0, { id: 's13-d2' })));
      g += NUM('s13-q', 830, 760, '?', '#7a2fd0', 220, 10);
      return g + A.hamster('h13', 560, 1880, 1.1, { hat: 'sorcier', faces: ['happy'], armL: { a: 18 }, armR: { a: 166, hand: 'point' } });
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
