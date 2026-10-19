// « Ce magasin revend tes colis perdus » — calque 2D posé sur le monde 3D (src/world.js) :
// titres, gros chiffres (rouge = dépense, vert = gain), étiquettes manuscrites et Hamsterdam ; fond transparent sauf le dernier plan.
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

  // 1 · « Ton colis perdu ? »
  S[1] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('t1', 540, 300, 'TON COLIS PERDU ?', '#ffffff', 108, -3) + NUM('t2', 540, 460, 'REVENDU 20 €', RED, 120, 2) + LAB('t3', 540, 580, 'sans même l\'ouvrir', BLU, 66, -2);
    }, anim: function (tl, a, b, K) { pop(tl, '#t1', a, 0.6); pop(tl, '#t2', K('revend', a)); pop(tl, '#t3', K('sans même', a), 0.5); } };
  // 2 · titre
  S[2] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s2-t1', 540, 270, 'COMBIEN ÇA RAPPORTE', YEL, 92, -2) + NUM('s2-t2', 540, 390, "D'ÊTRE PROPRIÉTAIRE", '#ffffff', 92, -2) +
        G({ transform: T(540, 540, 1, -3) }, G('s2-t3', NUM('', 0, 0, "D'UN MAGASIN DE", PNK, 100, 0) + NUM('', 0, 130, 'COLIS PERDUS ?', BLU, 136, 0))) +
        hamOver('h2', 170, 0.5, { faces: ['happy'], armR: { a: 80, hand: 'point' } });
    }, anim: function (tl, a, b, K) { pop(tl, '#s2-t1', a, 0.5); pop(tl, '#s2-t2', K("d'être", a), 0.5); pop(tl, '#s2-t3', K("d'un", a), 0.4); talk(tl, 'h2', 'happy', a, b); } };
  // 3 · l'entrepôt et la palette
  S[3] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return TAG('s3-t1', 300, 340, '3 000 € / MOIS', RED, 58, -4) + LAB('s3-l1', 300, 450, 'le loyer', ORA, 62, -2) +
        NUM('s3-n', 620, 560, '200 COLIS', BLU, 120, -2) + TAG('s3-t2', 820, 700, '1 500 €', RED, 70, 4) + LAB('s3-l2', 620, 380, 'jamais livrés', ORA, 60, 3);
    }, anim: function (tl, a, b, K) {
      var tp = K('palette', a);
      pop(tl, '#s3-t1', K('3 000', a)); pop(tl, '#s3-l1', K('3 000', a) + 0.3, 0.5);
      out(tl, '#s3-t1', tp - 0.15); out(tl, '#s3-l1', tp - 0.15);
      pop(tl, '#s3-l2', K('jamais livrés', a), 0.5); pop(tl, '#s3-n', K('200', a)); pop(tl, '#s3-t2', K('1 500', a));
    } };
  // 4 · personne ne sait, même pas toi
  S[4] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s4-n', 540, 340, 'QU\'Y A-T-IL DEDANS ?', YEL, 88, -3) + hamOver('h4', 170, 0.5, { faces: ['awk'], blush: 1, armL: { a: 62, hand: 'open' }, armR: { a: 62, hand: 'open' } }) +
        LAB('s4-l', 250, 1060, 'même pas toi !', BLU, 62, -4);
    }, anim: function (tl, a, b, K) { pop(tl, '#s4-n', a + 0.05, 0.5); talk(tl, 'h4', 'awk', a, b); pop(tl, '#s4-l', K('Même pas', a), 0.5); } };
  // 5 · 20 € le colis, 4 000 € la palette
  S[5] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s5-n1', 540, 330, '20 € LE COLIS', RED, 116, -3) + NUM('s5-n2', 540, 480, '4 000 € / PALETTE', GRN, 100, 2) + LAB('s5-l', 540, 600, 'fermés, sans les ouvrir', BLU, 60, -2);
    }, anim: function (tl, a, b, K) { pop(tl, '#s5-l', K('fermés', a), 0.5); pop(tl, '#s5-n1', K('20 euros', a)); pop(tl, '#s5-n2', K('4 000', a)); } };
  // 6 · 8 palettes par mois : 32 000 €
  S[6] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return TAG('s6-t', 540, 330, '× 8 PALETTES / MOIS', BLU, 56, -3) + NUM('s6-n', 540, 480, '32 000 € / MOIS', GRN, 116, 2);
    }, anim: function (tl, a, b, K) { pop(tl, '#s6-t', K('8', a)); pop(tl, '#s6-n', K('32 000', a)); } };
  // 7 · « Je m'achète un camion »
  S[7] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s7-n', 540, 330, '32 000 €', GRN, 170, -4) + LAB('s7-l', 760, 520, 'un camion !', BLU, 74, 6) +
        hamOver('h7', 165, 0.55, { faces: ['grin'], shades: 1, armL: { a: 140, hand: 'open' }, armR: { a: 150, hand: 'open' } });
    }, anim: function (tl, a, b, K) { pop(tl, '#s7-n', a + 0.05); pop(tl, '#s7-l', K('camion', a), 0.5);
      ft(tl, '#h7-aL', { rotation: -130 }, { rotation: -165, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 7 }, a);
      ft(tl, '#h7-aR', { rotation: -165 }, { rotation: -130, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 7 }, a); } };
  // 8 · « Attends » : TVA, palettes, loyer, salariés → ≈ 6 000 €
  S[8] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return TAG('s8-t0', 300, 300, '− TVA', RED, 56, -4) + TAG('s8-t1', 760, 300, '− PALETTES', RED, 52, 4) + TAG('s8-t2', 300, 420, '− LOYER', RED, 52, 3) + TAG('s8-t3', 760, 420, '− 2 SALARIÉS', RED, 48, -3) +
        NUM('s8-n', 540, 590, '≈ 6 000 € / MOIS', GRN, 110, -2) + LAB('s8-l', 820, 760, '1 pièce = 1 000 €', '#222', 54, 4);
    }, anim: function (tl, a, b, K) {
      pop(tl, '#s8-l', a + 0.3, 0.5);
      [K('TVA', a), K('les palettes,', a), K('le loyer', a), K('2 salariés', a)].forEach(function (t, k) { pop(tl, '#s8-t' + k, t); });
      pop(tl, '#s8-n', K('environ 6', a));
    } };
  // 9 · l'astuce de pro
  S[9] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return G({ transform: T(540, 380, 1, -4) }, G('s9-ban', R(-380, -80, 760, 160, 14, '#ffffff', LW) + el('text', { x: 0, y: 6, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Luckiest Guy', 'font-size': 104, fill: RED }, 'ASTUCE DE PRO'))) +
        LAB('s9-l0', 230, 640, 'une coque…', ORA, 60, -4) + LAB('s9-l1', 540, 600, 'un câble…', ORA, 60, 3) + NUM('s9-l2', 830, 640, 'UN TÉLÉPHONE !', GRN, 62, -4);
    }, anim: function (tl, a, b, K) { pop(tl, '#s9-ban', K("l'astuce", a)); pop(tl, '#s9-l0', K('coques', a), 0.5); pop(tl, '#s9-l1', K('câbles.', a), 0.5); pop(tl, '#s9-l2', K('téléphone.', a)); } };
  // 10 · 2 millions de vues, tout le monde vient tenter sa chance
  S[10] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      var g = NUM('s10-n', 540, 330, '2 MILLIONS DE VUES', PNK, 96, -3), cols = [C.red, BLU, '#8e5bd8', C.green, '#ffb03a', PNK];
      for (var i = 0; i < 7; i++) g += A.bust('s10-p' + i, 90 + i * 150, 1560, 0.85, { shirt: cols[i % 6], skin: ['#f3c39b', '#c98b5e', '#e2ad84', '#8d5a3b'][i % 4], hair: ['#3b2414', '#111', '#d9a04a'][i % 3] });
      return g;
    }, anim: function (tl, a, b, K) { pop(tl, '#s10-n', K('2 millions', a)); var tm = K('tout le monde', a); for (var i = 0; i < 7; i++) pop(tl, '#s10-p' + i, tm + i * 0.07, 0.3); } };
  // 11 · 16 palettes, ≈ 18 000 €, 0 € de pub
  S[11] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return TAG('s11-t', 540, 300, '16 PALETTES / MOIS', BLU, 56, -3) + NUM('s11-n', 540, 450, '≈ 18 000 € / MOIS', GRN, 106, 2) + STAMP('s11-st', 540, 610, '0 € DE PUB', RED, -7);
    }, anim: function (tl, a, b, K) { pop(tl, '#s11-t', K('16', a)); pop(tl, '#s11-n', K('18 000', a));
      gsap.set('#s11-st', { opacity: 0 }); ft(tl, '#s11-st', { opacity: 0, scale: 2.4 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'power3.in' }, K('Sans payer', a)); } };
  // 12 · « C'est un ticket de loto »
  S[12] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s12-n', 540, 330, 'UN COLIS À 20 € ?', '#ffffff', 100, -3) + STAMP('s12-st', 540, 520, 'TICKET DE LOTO', RED, -6) +
        hamOver('h12', 150, 0.46, { faces: ['proud'], armR: { a: 150, hand: 'thumb' } });
    }, anim: function (tl, a, b, K) { pop(tl, '#s12-n', a + 0.05, 0.5); talk(tl, 'h12', 'proud', a, b);
      gsap.set('#s12-st', { opacity: 0 }); ft(tl, '#s12-st', { opacity: 0, scale: 2.4 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'power3.in' }, K('ticket', a)); } };
  // 13 · « Quel business louche je calcule la prochaine fois ? » (plan entièrement 2D)
  S[13] = { cam: [[540, 1100, 1.0, 1.08]], svg: function () {
      var g = burst('s13-ray', '#ffd9a8', '#fff1dc', 540, 1200);
      g += G({ transform: T(260, 1000) }, G('s13-cm', P('M -150 -100 Q -150 -150 -100 -150 L 100 -150 Q 150 -150 150 -100 L 150 20 Q 150 70 100 70 L -20 70 L -90 130 L -70 70 L -100 70 Q -150 70 -150 20 Z', C.w, LW) +
        Ci(-60, -40, 18, ORA, 0, { id: 's13-d0' }) + Ci(0, -40, 18, ORA, 0, { id: 's13-d1' }) + Ci(60, -40, 18, ORA, 0, { id: 's13-d2' })));
      g += NUM('s13-q', 830, 760, '?', YEL, 220, 10);
      return g + A.hamster('h13', 560, 1880, 1.1, { faces: ['happy'], armL: { a: 18 }, armR: { a: 166, hand: 'point' } });
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
