// Monte les 19 plans dessinés dans la timeline « scenes » : dessin SVG, animations internes, caméra et fondus.
(function () {
  var A = window.ART;
  var M = window.MCDO;
  var norm = function (w) { return w.toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9àâçéèêëîïôûùüÿœ'%]/g, ''); };
  var NW = M.words.map(function (w) { return norm(w[0]); });
  // heure (s, absolue) du 1er mot de « phrase » dans le script, cherchée à partir de « from » (s)
  A.K = function (phrase, from) {
    var p = phrase.split(/\s+/).map(norm);
    for (var i = 0; i <= NW.length - p.length; i++) {
      if (M.words[i][1] < (from || 0) - 0.01) continue;
      var ok = true;
      for (var k = 0; k < p.length && ok; k++) ok = NW[i + k] === p[k];
      if (ok) return M.words[i][1];
    }
    throw new Error('mot introuvable : ' + phrase);
  };
  A.MOUTH = M.mouth;

  // caméra : chaque « plan » de la scène cadre un point (fx, fy) à l'écran (540, 1180) avec un zoom qui glisse de s0 à s1
  function cam(tl, n, a, b, cams) {
    cams = cams || [[540, 1100, 1.0, 1.06]];
    var h = (b - a) / cams.length;
    var tr = function (fx, fy, s) {
      var x = 540 - s * fx, y = 1180 - s * fy;
      x = Math.min(0, Math.max(1080 - 1080 * s, x)); y = Math.min(0, Math.max(1920 - 1920 * s, y));
      return { scale: s, x: x, y: y };
    };
    cams.forEach(function (c, q) {
      var from = tr(c[0], c[1], c[2]), to = tr(c[4] == null ? c[0] : c[4], c[5] == null ? c[1] : c[5], c[3]);
      to.duration = h + (q === cams.length - 1 ? 0.25 : 0); to.ease = 'sine.inOut';
      A.ft(tl, '#k' + n, from, to, a + q * h);
    });
  }

  A.buildScenes = function (tl, SC) {
    SC.forEach(function (s, i) {
      var n = s[0], a = s[1], b = s[2], def = A.SCENES[n];
      var svg = document.getElementById('g' + n);
      svg.innerHTML = def.svg();
      A.piv(svg); A.flush();
      gsap.set('#s' + n, { opacity: 0 });
      A.ft(tl, '#s' + n, { opacity: 0 }, { opacity: 1, duration: i ? 0.12 : 0.01, ease: 'none' }, a);
      A.ft(tl, '#s' + n, { opacity: 1 }, { opacity: 0, duration: 0.01, ease: 'none' }, b + 0.14);
      cam(tl, n, a, b, def.cam);
      if (i) A.ft(tl, '#s' + n, { rotation: i % 2 ? 0.9 : -0.9, transformOrigin: '50% 60%' }, { rotation: 0, duration: 0.35, ease: 'power2.out' }, a);
      def.anim(tl, a, b, A.K);
    });
  };
})();
