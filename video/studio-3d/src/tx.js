// Typographie animée façon keynote : chaque mot arrive en fondu, net, calé sur la voix ; le bloc repart flouté.
// Tout passe par des tweens GSAP (aucun onUpdate : la runtime cherche les timelines avec suppressEvents).
(function () {
  var TX = (window.TX = {});
  // fromTo sans rendu immédiat : l'état initial est posé une fois avec gsap.set
  TX.ft = function (tl) { return function (t, a, b, at) { b.immediateRender = false; tl.fromTo(t, a, b, at); }; };
  // mots d'un bloc (sel = '#bloc .w'), un instant par mot ; base = début de la sous-composition
  TX.words = function (tl, sel, times, base, opts) {
    opts = opts || {};
    var ws = document.querySelectorAll(sel), ft = TX.ft(tl);
    gsap.set(ws, { opacity: 0, yPercent: 38, filter: 'blur(14px)' });
    for (var i = 0; i < ws.length; i++) {
      var at = times[Math.min(i, times.length - 1)] - base;
      ft(ws[i], { opacity: 0, yPercent: 38, filter: 'blur(14px)' },
        { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: opts.dur || 0.5, ease: 'power3.out' }, at);
    }
  };
  // sortie du bloc entier
  TX.out = function (tl, sel, at, base) {
    TX.ft(tl)(sel, { opacity: 1, y: 0, filter: 'blur(0px)' }, { opacity: 0, y: -26, filter: 'blur(12px)', duration: 0.32, ease: 'power2.in' }, at - base);
  };
  // entrée d'un bloc entier (pastilles, logo…)
  TX.inn = function (tl, sel, at, base, from) {
    gsap.set(sel, { opacity: 0 });
    TX.ft(tl)(sel, Object.assign({ opacity: 0, y: 30, filter: 'blur(10px)' }, from || {}),
      { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' }, at - base);
  };
})();
