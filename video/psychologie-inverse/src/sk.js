// Boîte à outils partagée (chargée par index.html avant les sous-compositions).
// Tout est déterministe : aucun aléatoire, aucune horloge — uniquement le temps de la timeline.
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var SK = (window.SK = {});

  SK.C = { paper: '#f7f3ea', ink: '#161311', red: '#fb4903', yellow: '#ffd731', mint: '#55db9c', blue: '#4da2ff',
    violet: '#5c4ade', lav: '#e9ccff', sky: '#dceeff', muted: '#857b6d', white: '#ffffff', grey: '#d9d2c3' };

  // Hachage déterministe → [-1, 1]
  SK.hash = function (n, seed) { var x = Math.sin(n * 127.1 + (seed || 1) * 311.7) * 43758.5453; return (x - Math.floor(x)) * 2 - 1; };

  // Rendus « fonction du temps ». La runtime cherche les timelines avec suppressEvents (onUpdate ne part
  // pas au rendu) : on pilote donc tout par une propriété-fonction tweenée, que GSAP appelle à chaque rendu.
  SK.render = function (tl, fn) { (tl.__skRenders || (tl.__skRenders = [])).push(fn); };
  SK.drive = function (tl, dur) {
    var fns = tl.__skRenders || [];
    var proxy = { v: 0, t: function (x) { if (arguments.length) { this.v = x; for (var i = 0; i < fns.length; i++) fns[i](x); } return this.v; } };
    tl.fromTo(proxy, { t: 0 }, { t: dur, duration: dur, ease: 'none' }, 0);
  };

  // « Boil » du dessin animé : petite gigue re-posée toutes les 3 images (fonction pure du temps)
  SK.boil = function (tl, targets, opts) {
    opts = opts || {};
    var amp = opts.amp == null ? 1.6 : opts.amp, rot = opts.rot == null ? 0.5 : opts.rot, drop = opts.drop || 3, seed = opts.seed || 1;
    var els = gsap.utils.toArray(targets);
    SK.render(tl, function (t) {
      var step = Math.floor((t * 30) / drop + 1e-6);
      for (var i = 0; i < els.length; i++) {
        gsap.set(els[i], { x: SK.hash(step * 3 + i * 97, seed) * amp, y: SK.hash(step * 3 + 1 + i * 97, seed) * amp,
          rotation: SK.hash(step * 3 + 2 + i * 97, seed) * rot });
      }
    });
  };

  // Tracé progressif d'un trait SVG (stroke-dashoffset), seek-safe
  SK.drawOn = function (tl, paths, at, dur, opts) {
    opts = opts || {};
    gsap.utils.toArray(paths).forEach(function (p, i) {
      var L = p.getTotalLength ? p.getTotalLength() : 1000;
      gsap.set(p, { strokeDasharray: L + ' ' + (L + 2) });
      tl.fromTo(p, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: dur, ease: opts.ease || 'power2.inOut' }, at + i * (opts.stagger || 0));
    });
  };

  // Secousse d'impact sur 3 images (comme headline-slam)
  SK.shake = function (tl, target, at, px) {
    var F = 1 / 30; px = px || 10;
    tl.to(target, { x: px, y: -px * 0.55, duration: F, ease: 'power2.out' }, at);
    tl.to(target, { x: -px * 0.7, y: px * 0.45, duration: F, ease: 'power2.out' }, at + F);
    tl.to(target, { x: 0, y: 0, duration: F, ease: 'power2.out' }, at + 2 * F);
  };

  // Pivot d'un élément SVG : à poser UNE fois, tant que l'élément n'a aucune transformation.
  // (Si GSAP reçoit un svgOrigin alors que l'élément est déjà transformé, il « compense » et le décale.)
  SK.piv = function (sel, origin) { gsap.set(sel, { svgOrigin: origin }); };

  // Tampon qui claque : grossit, se pose, secoue la scène
  SK.stamp = function (tl, el, at, stage, opts) {
    opts = opts || {};
    var r = opts.rot == null ? -8 : opts.rot;
    if (opts.origin) SK.piv(el, opts.origin);
    tl.fromTo(el, { scale: opts.from || 2.4, opacity: 0, rotation: r - 10 },
      { scale: 1, opacity: 1, rotation: r, duration: 0.2, ease: 'power4.in' }, at);
    if (stage) SK.shake(tl, stage, at + 0.2, opts.px || 12);
  };

  // fromTo sans rendu immédiat (l'état initial est posé par gsap.set) : enchaîner plusieurs tweens sur un même élément
  SK.ft = function (tl) {
    return function (t, a, b, at) { b.immediateRender = false; tl.fromTo(t, a, b, at); };
  };

  // Page de notice : arrive de la droite (0 → 0,5 s), numéro qui saute ; poussée par la suivante à `next`,
  // ou envoyée hors champ à `out` (dernière page).
  SK.page = function (tl, sel, opts) {
    var ft = SK.ft(tl), pg = document.querySelector(sel);
    gsap.set(pg, { x: 1080 });
    gsap.set(pg.querySelector('.e-num'), { scale: 0 });
    ft(pg, { x: 1080, rotation: 2.4 }, { x: 0, rotation: 0, duration: 0.5, ease: 'power3.out' }, 0);
    ft(pg.querySelector('.e-num'), { scale: 0.3, rotation: -25 }, { scale: 1, rotation: 0, duration: 0.36, ease: 'back.out(2.2)' }, 0.14);
    if (opts.next != null) {
      ft(pg, { x: 0 }, { x: -380, duration: 0.5, ease: 'power3.out' }, opts.next);
      ft(pg.querySelector('.e-dim'), { opacity: 0 }, { opacity: 0.2, duration: 0.5, ease: 'power2.out' }, opts.next);
    }
    if (opts.out != null) ft(pg, { x: 0, rotation: 0 }, { x: -1200, rotation: -3, duration: 0.36, ease: 'power3.in' }, opts.out);
  };

  // petit objet qui s'envole en fondant (notes, z…)
  SK.floatUp = function (tl, sel, at, dx1, dx2, r1) {
    var ft = SK.ft(tl);
    ft(sel, { x: 0, y: 0, scale: 0.4, opacity: 0, rotation: 0 }, { x: dx1, y: -58, scale: 1, opacity: 1, rotation: r1, duration: 0.34, ease: 'power2.out' }, at);
    ft(sel, { x: dx1, y: -58, opacity: 1, rotation: r1 }, { x: dx2, y: -146, opacity: 0, rotation: -r1 * 0.6, duration: 0.52, ease: 'sine.in' }, at + 0.34);
  };

  // Mots d'un titre qui montent un par un, calés sur la voix (times = instants locaux, un par mot)
  SK.words = function (tl, sel, times, opts) {
    opts = opts || {};
    var bs = document.querySelectorAll(sel);
    for (var i = 0; i < bs.length; i++) {
      var at = times[Math.min(i, times.length - 1)];
      tl.fromTo(bs[i], { yPercent: 150, rotation: 2 }, { yPercent: 0, rotation: 0, duration: opts.dur || 0.34, ease: opts.ease || 'power3.out' }, at);
    }
  };

  // ------------------------------------------------------------------ le bonhomme pictogramme
  // Origine aux pieds (0,0), y vers le haut négatif. Renvoie le markup SVG ; ids préfixés par `id`.
  // opts : apron, mouth (smile|sad|flat|o|grin), eyes (open|happy|closed), look (décalage du regard), phones
  SK.man = function (id, opts) {
    opts = opts || {};
    var ink = SK.C.ink, apron = opts.apron || SK.C.yellow;
    var s = 'stroke="' + ink + '" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"';
    var mouth = { smile: 'M -17 -283 Q 0 -268 17 -283', sad: 'M -16 -275 Q 0 -289 16 -275', flat: 'M -14 -280 L 14 -280',
      o: 'M -7 -280 a 7 8 0 1 0 14 0 a 7 8 0 1 0 -14 0', grin: 'M -20 -286 Q 0 -262 20 -286 Z' }[opts.mouth || 'smile'];
    var eyes = {
      open: '<circle cx="-16" cy="-302" r="5.5" fill="' + ink + '"/><circle cx="16" cy="-302" r="5.5" fill="' + ink + '"/>',
      happy: '<path d="M -25 -298 Q -16 -311 -7 -298 M 7 -298 Q 16 -311 25 -298" fill="none" stroke="' + ink + '" stroke-width="6" stroke-linecap="round"/>',
      closed: '<path d="M -25 -303 Q -16 -296 -7 -303 M 7 -303 Q 16 -296 25 -303" fill="none" stroke="' + ink + '" stroke-width="6" stroke-linecap="round"/>'
    }[opts.eyes || 'open'];
    var phones = !opts.phones ? '' :
      '<path d="M -55 -296 C -62 -384, 62 -384, 55 -296" fill="none" stroke="' + ink + '" stroke-width="13" stroke-linecap="round"/>' +
      '<rect x="-74" y="-330" width="30" height="62" rx="13" fill="' + SK.C.red + '" ' + s + '/>' +
      '<rect x="44" y="-330" width="30" height="62" rx="13" fill="' + SK.C.red + '" ' + s + '/>';
    return '' +
      '<g id="' + id + '" class="man">' +
      '<g id="' + id + '-legL"><rect x="-21" y="0" width="38" height="122" rx="19" fill="#fff" ' + s + ' transform="translate(-28,-122)"/>' +
      '<ellipse cx="-36" cy="-4" rx="30" ry="13" fill="' + ink + '"/></g>' +
      '<g id="' + id + '-legR"><rect x="-17" y="0" width="38" height="122" rx="19" fill="#fff" ' + s + ' transform="translate(28,-122)"/>' +
      '<ellipse cx="36" cy="-4" rx="30" ry="13" fill="' + ink + '"/></g>' +
      '<g id="' + id + '-body"><path d="M -50 -252 Q 0 -264 50 -252 L 64 -122 Q 0 -108 -64 -122 Z" fill="#fff" ' + s + '/>' +
      '<path d="M -40 -198 L 40 -198 L 54 -122 Q 0 -110 -54 -122 Z" fill="' + apron + '" ' + s + '/>' +
      '<path d="M -40 -198 L -30 -246 M 40 -198 L 30 -246" fill="none" ' + s + '/></g>' +
      '<g id="' + id + '-armL"><rect x="-17" y="0" width="34" height="112" rx="17" fill="#fff" ' + s + ' transform="translate(-54,-244)"/>' +
      '<circle cx="-54" cy="-122" r="19" fill="#fff" ' + s + '/></g>' +
      '<g id="' + id + '-armR"><rect x="-17" y="0" width="34" height="112" rx="17" fill="#fff" ' + s + ' transform="translate(54,-244)"/>' +
      '<circle cx="54" cy="-122" r="19" fill="#fff" ' + s + '/></g>' +
      '<g id="' + id + '-head"><circle cx="0" cy="-300" r="47" fill="#fff" ' + s + '/>' +
      '<path d="M -40 -322 Q -10 -362 34 -334 Q 12 -336 -2 -330 Q -20 -334 -40 -322 Z" fill="' + ink + '"/>' +
      '<g id="' + id + '-eyes" transform="translate(' + (opts.look || 0) + ',0)">' + eyes + '</g>' +
      '<path id="' + id + '-mouth" d="' + mouth + '" fill="' + (opts.mouth === 'grin' ? ink : 'none') + '" ' + s + '/>' + phones + '</g>' +
      '</g>';
  };
  // pivots des membres (coordonnées locales du bonhomme)
  SK.PIV = { armL: '-54 -244', armR: '54 -244', legL: '-28 -122', legR: '28 -122', head: '0 -252', body: '0 -122' };

  // petite silhouette de client (pictogramme simple, couleur pleine) ; jambes et haut séparés pour la marche
  SK.client = function (id, col) {
    col = col || SK.C.blue;
    var s = 'stroke="' + SK.C.ink + '" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"';
    return '<g id="' + id + '">' +
      '<rect id="' + id + '-lL" x="-26" y="-92" width="22" height="92" rx="11" fill="#fff" ' + s + '/>' +
      '<rect id="' + id + '-lR" x="4" y="-92" width="22" height="92" rx="11" fill="#fff" ' + s + '/>' +
      '<g id="' + id + '-up"><path d="M -36 -190 Q 0 -200 36 -190 L 40 -88 Q 0 -80 -40 -88 Z" fill="' + col + '" ' + s + '/>' +
      '<circle cx="0" cy="-226" r="32" fill="#fff" ' + s + '/>' +
      '<circle cx="-10" cy="-228" r="4" fill="' + SK.C.ink + '"/><circle cx="10" cy="-228" r="4" fill="' + SK.C.ink + '"/></g></g>';
  };

  // étoile à 5 branches (d du path)
  SK.starD = function (cx, cy, R) {
    var d = '', r = R * 0.46;
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r : R;
      d += (i ? ' L ' : 'M ') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1);
    }
    return d + ' Z';
  };
  SK.stars = function (x, y, R, gap, n, on) {
    var m = '';
    for (var i = 0; i < n; i++) m += '<path d="' + SK.starD(x + i * gap, y, R) + '" fill="' + (i < on ? SK.C.yellow : 'none') +
      '" stroke="' + SK.C.ink + '" stroke-width="4.5" stroke-linejoin="round"/>';
    return m;
  };

  // note de musique ♪ (origine = tête de la note)
  SK.note = function (id, x, y) {
    return '<g transform="translate(' + x + ',' + y + ')"><g id="' + id + '">' +
      '<ellipse cx="0" cy="0" rx="14" ry="10" transform="rotate(-22)" fill="' + SK.C.ink + '"/>' +
      '<path d="M 11 -4 L 11 -60 Q 30 -50 32 -26" fill="none" stroke="' + SK.C.ink + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g></g>';
  };

  // crée un élément SVG depuis une chaîne
  SK.svg = function (markup, w, h, cls) {
    var d = document.createElement('div');
    d.innerHTML = '<svg xmlns="' + NS + '" viewBox="0 0 ' + w + ' ' + h + '" class="' + (cls || '') + '">' + markup + '</svg>';
    return d.firstChild;
  };
})();
