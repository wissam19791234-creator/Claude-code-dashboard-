// Pub Scalify « Combien coûte un commerce invisible ? » — calque 2D posé sur le monde 3D (src/world.js) :
// titres, gros chiffres (rouge = perte, vert = gain), étiquettes manuscrites et Hamsterdam en boulanger ; fond transparent.
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


  var baker = function (id, x, s, o) { return hamOver(id, x, s, Object.assign({ hat: 'toque', apron: true }, o)); };
  var stamp = function (tl, sel, t) { gsap.set(sel, { opacity: 0 }); ft(tl, sel, { opacity: 0, scale: 2.4 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'power3.in' }, t); };
  // logo Scalify : pastille blanche cerclée d'encre, « S » épais, point bleu (repris du site)
  var LOGO = function (id, x, y, s) {
    return G({ transform: T(x, y, s) }, G(id, Ci(0, 0, 200, '#fffdf8', 16, { stroke: '#161311' }) +
      P('M 63 -66 H -30 a 37.5 37.5 0 0 0 0 75 h 56.6 a 37.5 37.5 0 0 1 0 75 H -66', null, 40, { stroke: '#161311', transform: 'translate(0,-42)', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }) +
      Ci(84, 81, 26, '#4da2ff', 10, { stroke: '#161311' })));
  };

  // 1 · « Cette boulangerie perd 20 000 € par an. Et le patron ne le sait même pas. »
  S[1] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s1-t', 540, 270, 'CETTE BOULANGERIE', '#ffffff', 96, -3) + NUM('s1-n', 540, 420, '− 20 000 € / AN', RED, 128, 2) +
        LAB('s1-l', 520, 580, 'et le patron ne le sait même pas…', BLU, 56, -2) + baker('h1', 165, 0.48, { faces: ['sleep'] }) + LAB('s1-z', 300, 900, 'zzz', '#8a8f98', 70, -8);
    }, anim: function (tl, a, b, K) { pop(tl, '#s1-t', a, 0.6); pop(tl, '#s1-n', K('20 000', a)); pop(tl, '#s1-l', K('Et le patron', a), 0.5); pop(tl, '#s1-z', K('Et le patron', a) + 0.3, 0.3); wob(tl, '#s1-z', K('Et le patron', a) + 0.6, b - a); } };
  // 2 · titre
  S[2] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s2-t1', 540, 270, 'COMBIEN COÛTE', YEL, 104, -2) + NUM('s2-t2', 540, 395, 'UN COMMERCE', '#ffffff', 104, -2) + NUM('s2-t3', 540, 560, 'INVISIBLE ?', BLU, 156, -3) +
        hamOver('h2', 165, 0.5, { faces: ['happy'], armR: { a: 80, hand: 'point' } });
    }, anim: function (tl, a, b, K) { pop(tl, '#s2-t1', a, 0.5); pop(tl, '#s2-t2', K('un commerce', a), 0.5); pop(tl, '#s2-t3', K('invisible', a), 0.4); talk(tl, 'h2', 'happy', a, b); } };
  // 3 · « Imagine, c'est ta boulangerie »
  S[3] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return TAG('s3-t', 540, 300, 'TA BOULANGERIE', BLU, 72, -3) + LAB('s3-l', 300, 860, "c'est toi !", PNK, 64, -6) +
        baker('h3', 165, 0.5, { faces: ['happy'], armL: { a: 20 }, armR: { a: 150, hand: 'open' } });
    }, anim: function (tl, a, b, K) { pop(tl, '#s3-t', K("c'est ta", a)); pop(tl, '#s3-l', K("c'est ta", a) + 0.2, 0.5); talk(tl, 'h3', 'happy', a, b);
      ft(tl, '#h3-aR', { rotation: -150 }, { rotation: -120, duration: 0.25, ease: 'sine.inOut', yoyo: true, repeat: 5 }, a); } };
  // 4 · « Chaque jour, des gens tapent : boulangerie près de moi » … « Ta fiche Google n'est pas à jour »
  S[4] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s4-n', 540, 230, 'CHAQUE JOUR', '#ffffff', 96, -3) + TAG('s4-f', 540, 1510, 'TA FICHE GOOGLE : PAS À JOUR', RED, 50, -3) + NUM('s4-q', 250, 1180, 'ET TOI ?', YEL, 84, -8);
    }, anim: function (tl, a, b, K) { pop(tl, '#s4-n', a + 0.05, 0.5); out(tl, '#s4-n', K('moi.', a) + 0.5); pop(tl, '#s4-q', K('moi.', a) + 0.75); pop(tl, '#s4-f', K('Ta fiche Google', a)); } };
  // 5 · 2 clients par jour vont chez le voisin, 15 € le panier
  S[5] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s5-n', 540, 250, '2 CLIENTS / JOUR', RED, 110, -3) + LAB('s5-l', 700, 380, 'vont chez le voisin →', ORA, 62, -2) + TAG('s5-t', 540, 1420, '15 € LE PANIER', RED, 64, 3);
    }, anim: function (tl, a, b, K) { pop(tl, '#s5-n', K('2 clients', a)); pop(tl, '#s5-l', K('vont chez', a), 0.5); pop(tl, '#s5-t', K('15 euros', a)); } };
  // 6 · 900 € par mois
  S[6] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s6-n', 540, 330, '− 900 € / MOIS', RED, 128, -3) + LAB('s6-l', 540, 480, '(exemple)', '#8a8f98', 54, 2);
    }, anim: function (tl, a, b, K) { pop(tl, '#s6-n', K('900', a)); pop(tl, '#s6-l', K('900', a) + 0.3, 0.5); } };
  // 7 · avis sans réponse : 1 client par jour qui part, 450 €
  S[7] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return TAG('s7-t', 540, 200, 'AVIS SANS RÉPONSE', RED, 62, -3) + LAB('s7-l', 540, 310, '1 client / jour qui part', ORA, 58, 2) + NUM('s7-n', 540, 1330, '− 450 € / MOIS', RED, 118, -3);
    }, anim: function (tl, a, b, K) { pop(tl, '#s7-t', a + 0.05); pop(tl, '#s7-l', K('1 client', a), 0.5); pop(tl, '#s7-n', K('450', a)); } };
  // 8 · après 19 h, personne ne répond : 300 € de réservations perdues
  S[8] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return TAG('s8-t', 540, 190, 'APRÈS 19 H', BLU, 66, -3) + LAB('s8-l', 540, 290, 'personne ne répond…', '#222222', 58, 2) +
        NUM('s8-n', 540, 410, '− 300 € / MOIS', RED, 104, -2) + LAB('s8-l2', 250, 1340, 'réservations perdues', ORA, 52, -4);
    }, anim: function (tl, a, b, K) { pop(tl, '#s8-t', K('19 heures', a)); pop(tl, '#s8-l', K('personne', a), 0.5); pop(tl, '#s8-n', K('300', a)); pop(tl, '#s8-l2', K('réservations', a), 0.5); } };
  // 9 · total
  S[9] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s9-t', 540, 240, 'TOTAL', '#ffffff', 110, -3) + NUM('s9-n1', 540, 390, '− 1 650 € / MOIS', RED, 112, 2) + NUM('s9-n2', 540, 550, '≈ − 20 000 € / AN', RED, 116, -3) +
        LAB('s9-l', 540, 680, '(exemple : panier à 15 €)', '#8a8f98', 52, 1);
    }, anim: function (tl, a, b, K) { pop(tl, '#s9-t', a + 0.05, 0.5); pop(tl, '#s9-n1', K('1 650', a)); pop(tl, '#s9-n2', K('Presque', a)); pop(tl, '#s9-l', K('Presque', a) + 0.4, 0.5); } };
  // 10 · « 20 000 ! Je ferme boutique. »
  S[10] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s10-n', 540, 290, '20 000 € !', RED, 170, -4) + LAB('s10-l', 720, 470, 'je ferme boutique…', BLU, 66, 4) +
        baker('h10', 165, 0.5, { faces: ['shock'], sweat: 1, armL: { a: 150, hand: 'open' }, armR: { a: 150, hand: 'open' } });
    }, anim: function (tl, a, b, K) { pop(tl, '#s10-n', a + 0.05); pop(tl, '#s10-l', K('Je ferme', a), 0.5); talk(tl, 'h10', 'shock', a, b);
      ft(tl, '#h10', { x: -6 }, { x: 6, duration: 0.05, ease: 'none', yoyo: true, repeat: 9 }, a + 0.05); } };
  // 11 · « Attends. »
  S[11] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s11-n', 540, 330, 'ATTENDS.', '#ffffff', 170, -4) + baker('h11', 165, 0.5, { faces: ['think'], armR: { a: 160, hand: 'point' } });
    }, anim: function (tl, a, b, K) { pop(tl, '#s11-n', a + 0.02); } };
  // 12 · l'astuce de pro : Scalify
  S[12] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return G({ transform: T(540, 250, 1, -4) }, G('s12-ban', R(-380, -80, 760, 160, 14, '#ffffff', LW) + el('text', { x: 0, y: 6, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Luckiest Guy', 'font-size': 104, fill: RED }, 'ASTUCE DE PRO'))) +
        NUM('s12-n', 540, 1460, 'SCALIFY', '#4da2ff', 150, -3);
    }, anim: function (tl, a, b, K) { pop(tl, '#s12-ban', K("l'astuce", a)); pop(tl, '#s12-n', K('Scalify.', a)); } };
  // 13 · site, fiche Google, avis, posts, IA 24 h / 24
  S[13] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return TAG('s13-t', 540, 200, 'SCALIFY FAIT TOUT', BLU, 62, -3) + NUM('s13-n', 540, 340, '24 H / 24', GRN, 120, 2) +
        LAB('s13-l0', 160, 770, 'ton site', '#222222', 56, -4) + LAB('s13-l1', 920, 830, 'fiche Google', '#222222', 54, 4) +
        LAB('s13-l2', 160, 1220, 'tes avis', '#222222', 56, -3) + LAB('s13-l3', 920, 1240, 'tes posts', '#222222', 56, 3);
    }, anim: function (tl, a, b, K) {
      pop(tl, '#s13-t', a + 0.05); pop(tl, '#s13-n', K('24 heures', a));
      [K('Ton site,', a), K('ta fiche Google,', a), K('tes avis,', a), K('tes posts…', a)].forEach(function (t, k) { pop(tl, '#s13-l' + k, t + 0.15, 0.5); });
    } };
  // 14 · « Un commerce invisible, c'est pas un commerce. C'est un secret. »
  S[14] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return NUM('s14-t1', 540, 250, 'UN COMMERCE', '#ffffff', 104, -3) + NUM('s14-t2', 540, 380, 'INVISIBLE…', BLU, 130, 2) + STAMP('s14-st', 560, 560, "C'EST UN SECRET", RED, -7) +
        baker('h14', 165, 0.5, { faces: ['awk'], blush: 1, armL: { a: 30 }, armR: { a: 135, hand: 'point' } });
    }, anim: function (tl, a, b, K) { pop(tl, '#s14-t1', a + 0.05, 0.5); pop(tl, '#s14-t2', K('invisible,', a), 0.5); stamp(tl, '#s14-st', K("C'est un secret", a)); talk(tl, 'h14', 'awk', a, b); } };
  // 15 · lancement dans 14 jours, −30 % pour les 15 premiers, abonne-toi
  S[15] = { cam: [[540, 960, 1.0, 1.0]], svg: function () {
      return LOGO('s15-lg', 300, 230, 0.42) + NUM('s15-nm', 660, 236, 'SCALIFY', '#ffffff', 112, -2) +
        TAG('s15-t', 540, 1250, 'LANCEMENT DANS 14 JOURS', BLU, 56, -2) + NUM('s15-n', 540, 1370, '− 30 % SUR L\'ANNUEL', GRN, 86, 2) + LAB('s15-l', 540, 1475, 'pour les 15 premiers', ORA, 56, -2) +
        G({ transform: T(540, 1360, 1, -3) }, G('s15-bt', R(-330, -84, 660, 168, 84, RED, LW) + el('text', { x: 0, y: 8, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Luckiest Guy', 'font-size': 100, fill: '#ffffff' }, 'ABONNE-TOI')));
    }, anim: function (tl, a, b, K) {
      var ta = K('Abonne-toi', a);
      pop(tl, '#s15-lg', a + 0.05); pop(tl, '#s15-nm', a + 0.15, 0.5);
      ft(tl, '#s15-lg', { rotation: -200 }, { rotation: 0, duration: 0.6, ease: 'back.out(1.6)' }, a + 0.05);
      pop(tl, '#s15-t', K('Lancement', a)); pop(tl, '#s15-n', K('moins 30', a)); pop(tl, '#s15-l', K('15 premiers', a), 0.5);
      ['#s15-t', '#s15-n', '#s15-l'].forEach(function (s) { out(tl, s, ta - 0.1); });
      pop(tl, '#s15-bt', ta); ft(tl, '#s15-bt', { scale: 1 }, { scale: 1.07, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((b - ta) / 0.3) }, ta + 0.35);
    } };
})();
