// Monde 3D de la promo « Les trucs à ghoster » (rendu image par image : tout dépend de t, rien ne s'accumule).
// Un petit fantôme en style dessin animé (ombrage en aplats + contour noir) ghoste quatre cartes, puis tient
// le panneau Scalify et le panneau « SITE ». Les cartes ont un verso « version Scalify » qui se retourne à la fin.
import * as THREE from 'three';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const eOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
const eInOut = (x) => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const eBack = (x) => { x = clamp(x); const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const UPX = 1920 / (2 * 14 * Math.tan(20 * Math.PI / 180));        // pixels par unité au plan z = 0
const X = (px) => (px - 540) / UPX, Y = (py) => (960 - py) / UPX;
const FR = '"Fredoka", "Arial Rounded MT Bold", sans-serif';
const CO = '"Comic Neue", "Comic Sans MS", cursive';

// ------------------------------------------------------------------ outils de dessin
function tex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function rr(x, X0, Y0, w, h, r) { x.beginPath(); x.moveTo(X0 + r, Y0); x.arcTo(X0 + w, Y0, X0 + w, Y0 + h, r); x.arcTo(X0 + w, Y0 + h, X0, Y0 + h, r); x.arcTo(X0, Y0 + h, X0, Y0, r); x.arcTo(X0, Y0, X0 + w, Y0, r); x.closePath(); }
function txt(x, s, X0, Y0, font, fill, opt = {}) {
  x.font = font; x.textAlign = opt.align || 'center'; x.textBaseline = opt.base || 'middle';
  if (opt.stroke) { x.lineWidth = opt.stroke; x.strokeStyle = opt.strokeColor || '#130a24'; x.lineJoin = 'round'; x.strokeText(s, X0, Y0); }
  x.fillStyle = fill; x.fillText(s, X0, Y0);
}
function check(x, cx, cy, r) {
  x.fillStyle = '#130a24'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
  x.strokeStyle = '#c8ff3e'; x.lineWidth = r * .26; x.lineCap = 'round'; x.lineJoin = 'round';
  x.beginPath(); x.moveTo(cx - r * .45, cy + r * .02); x.lineTo(cx - r * .1, cy + r * .36); x.lineTo(cx + r * .5, cy - r * .34); x.stroke();
}
function logo(x, cx, cy, R) {   // logo Scalify : disque, S, point bleu (mêmes proportions que le SVG officiel)
  const k = R / 200; x.save(); x.translate(cx, cy); x.scale(k, k);
  x.fillStyle = '#fffdf8'; x.strokeStyle = '#161311'; x.lineWidth = 16; x.beginPath(); x.arc(0, 0, 200, 0, 7); x.fill(); x.stroke();
  x.save(); x.translate(0, -42); x.lineWidth = 40; x.lineCap = 'round'; x.lineJoin = 'round';
  x.stroke(new Path2D('M 63 -66 H -30 a 37.5 37.5 0 0 0 0 75 h 56.6 a 37.5 37.5 0 0 1 0 75 H -66')); x.restore();
  x.fillStyle = '#4da2ff'; x.lineWidth = 10; x.beginPath(); x.arc(84, 81, 26, 0, 7); x.fill(); x.stroke();
  x.restore();
}
const CW = 900, CH = 1062;   // texture des cartes (ratio 3,6 × 4,25)

// ----- recto : les quatre trucs à ghoster
function front1(x, w, h) {   // le site du neveu, 2012
  x.fillStyle = '#ece9e2'; x.fillRect(0, 0, w, h);
  const g = x.createLinearGradient(0, 0, 0, 90); g.addColorStop(0, '#5b7fd8'); g.addColorStop(1, '#2f55b8'); x.fillStyle = g; x.fillRect(0, 0, w, 90);
  ['#ff5f57', '#ffbd2e', '#28c840'].forEach((c, i) => { x.fillStyle = c; x.beginPath(); x.arc(50 + i * 44, 45, 15, 0, 7); x.fill(); });
  txt(x, 'Mon site perso', w / 2 + 40, 47, `700 34px ${CO}`, '#ffffff');
  x.fillStyle = '#ffffff'; x.fillRect(24, 106, w - 48, 52); x.strokeStyle = '#9a968e'; x.lineWidth = 3; x.strokeRect(24, 106, w - 48, 52);
  txt(x, 'http://www.mon-commerce-perso.html', 44, 133, `700 26px ${CO}`, '#5a574f', { align: 'left' });
  x.fillStyle = '#00a3a3'; x.fillRect(24, 172, w - 48, h - 196);
  x.fillStyle = 'rgba(255,255,255,.18)'; for (let j = 0; j < 14; j++) for (let i = 0; i < 9; i++) { x.beginPath(); x.arc(60 + i * 96 + (j % 2) * 48, 200 + j * 66, 6, 0, 7); x.fill(); }
  // « BIENVENUE !!! » façon WordArt
  const word = 'BIENVENUE !!!'; x.font = `700 92px ${CO}`;
  const total = x.measureText(word).width; let px = w / 2 - total / 2;
  [...word].forEach((ch, i) => {
    const cw = x.measureText(ch).width, a = (px + cw / 2 - w / 2) / w, yy = 300 + a * a * 260;
    const gg = x.createLinearGradient(0, yy - 50, 0, yy + 40); gg.addColorStop(0, '#ff2e93'); gg.addColorStop(.5, '#ffe600'); gg.addColorStop(1, '#2ee6ff');
    x.save(); x.translate(px + cw / 2, yy); x.rotate(a * .9); x.lineWidth = 10; x.strokeStyle = '#1a1a1a'; x.lineJoin = 'round'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.strokeText(ch, 0, 0); x.fillStyle = gg; x.fillText(ch, 0, 0); x.restore(); px += cw;
  });
  // site en construction
  x.save(); x.beginPath(); x.rect(60, 420, w - 120, 96); x.clip();
  for (let i = -4; i < 30; i++) { x.fillStyle = i % 2 ? '#1a1a1a' : '#ffd400'; x.beginPath(); x.moveTo(60 + i * 40, 420); x.lineTo(100 + i * 40, 420); x.lineTo(60 + i * 40, 516); x.lineTo(20 + i * 40, 516); x.fill(); }
  x.restore(); x.fillStyle = '#ffd400'; rr(x, 150, 438, w - 300, 60, 8); x.fill();
  txt(x, 'Site en construction', w / 2, 469, `700 42px ${CO}`, '#1a1a1a');
  // image cassée
  x.fillStyle = '#d8d8d8'; x.fillRect(90, 560, 330, 250); x.strokeStyle = '#888'; x.lineWidth = 4; x.strokeRect(90, 560, 330, 250);
  x.strokeStyle = '#e02424'; x.lineWidth = 12; x.beginPath(); x.moveTo(200, 640); x.lineTo(310, 740); x.moveTo(310, 640); x.lineTo(200, 740); x.stroke();
  txt(x, 'photo.jpg', 255, 788, `700 24px ${CO}`, '#555');
  txt(x, 'Nos horaires :', 470, 590, `700 34px ${CO}`, '#fff200', { align: 'left' });
  txt(x, 'appelez-nous', 470, 636, `700 32px ${CO}`, '#ffffff', { align: 'left' });
  txt(x, 'Visiteurs :', 470, 704, `700 30px ${CO}`, '#ffffff', { align: 'left' });
  '000042'.split('').forEach((d, i) => { x.fillStyle = '#111'; x.fillRect(470 + i * 52, 728, 46, 64); txt(x, d, 493 + i * 52, 762, `700 44px ${CO}`, '#39ff14'); });
  txt(x, 'Dernière mise à jour : 12/03/2012', w / 2, 880, `700 32px ${CO}`, '#ffffff');
  txt(x, 'Meilleure résolution : 800 × 600', w / 2, 930, `700 26px ${CO}`, 'rgba(255,255,255,.8)');
}
function front2(x, w, h) {   // le devis à 3 000 €
  x.fillStyle = '#fbf8f1'; x.fillRect(0, 0, w, h);
  x.fillStyle = '#e9e3d6'; x.beginPath(); x.moveTo(w - 150, 0); x.lineTo(w, 150); x.lineTo(w - 150, 150); x.fill();
  txt(x, 'DEVIS', 70, 120, `700 104px ${FR}`, '#1b1530', { align: 'left' });
  txt(x, 'N° 2026-117', 74, 196, `500 34px ${FR}`, '#7a7387', { align: 'left' });
  const rows = [['Maquette', '600 €'], ['Site vitrine, 5 pages', '1 800 €'], ['Mise en ligne', '600 €']];
  rows.forEach((r, i) => {
    const yy = 330 + i * 104;
    txt(x, r[0], 74, yy, `500 42px ${FR}`, '#3a3448', { align: 'left' });
    txt(x, r[1], w - 74, yy, `600 42px ${FR}`, '#3a3448', { align: 'right' });
    x.strokeStyle = '#d6cfc2'; x.setLineDash([6, 10]); x.lineWidth = 3; x.beginPath(); x.moveTo(74, yy + 44); x.lineTo(w - 74, yy + 44); x.stroke(); x.setLineDash([]);
  });
  x.fillStyle = '#1b1530'; x.fillRect(74, 668, w - 148, 6);
  txt(x, 'TOTAL', 74, 760, `700 54px ${FR}`, '#1b1530', { align: 'left' });
  txt(x, '3 000 €', w - 74, 760, `700 108px ${FR}`, '#e5243b', { align: 'right' });
  txt(x, 'Délai : 8 à 10 semaines', 74, 870, `500 38px ${FR}`, '#7a7387', { align: 'left' });
  x.save(); x.translate(w - 230, 940); x.rotate(-.18); x.strokeStyle = '#e5243b'; x.lineWidth = 8; rr(x, -170, -50, 340, 100, 18); x.stroke();
  txt(x, 'À RÉGLER', 0, 2, `700 52px ${FR}`, '#e5243b'); x.restore();
}
function front3(x, w, h) {   // deux mois d'attente
  x.fillStyle = '#f4f0ff'; x.fillRect(0, 0, w, h);
  txt(x, 'Mise en ligne prévue', w / 2, 90, `600 50px ${FR}`, '#2b1d4d');
  ['NOVEMBRE', 'DÉCEMBRE'].forEach((mo, k) => {
    const ox = 60 + k * 400, oy = 170;
    x.fillStyle = '#7b4dff'; rr(x, ox, oy, 380, 70, 16); x.fill(); txt(x, mo, ox + 190, oy + 37, `700 36px ${FR}`, '#ffffff');
    const start = k === 0 ? 6 : 1, days = k === 0 ? 30 : 31;   // le 1er novembre 2026 est un dimanche, le 1er décembre un mardi
    for (let d = 0; d < days; d++) {
      const c = (d + start) % 7, r = Math.floor((d + start) / 7), cx = ox + 27 + c * 54, cy = oy + 110 + r * 62;
      txt(x, String(d + 1), cx, cy, `500 26px ${FR}`, '#6b6380');
      x.strokeStyle = 'rgba(229,36,59,.75)'; x.lineWidth = 4; x.beginPath(); x.moveTo(cx - 14, cy - 14); x.lineTo(cx + 14, cy + 14); x.moveTo(cx + 14, cy - 14); x.lineTo(cx - 14, cy + 14); x.stroke();
    }
  });
  // toile d'araignée dans le coin
  x.strokeStyle = 'rgba(43,29,77,.55)'; x.lineWidth = 3;
  for (let i = 0; i < 6; i++) { const a = i / 5 * Math.PI / 2; x.beginPath(); x.moveTo(w, 0); x.lineTo(w - Math.cos(a) * 260, Math.sin(a) * 260); x.stroke(); }
  for (let r = 1; r <= 4; r++) { x.beginPath(); for (let i = 0; i <= 5; i++) { const a = i / 5 * Math.PI / 2, rr2 = r * 60; const px = w - Math.cos(a) * rr2, py = Math.sin(a) * rr2; i ? x.quadraticCurveTo(w - Math.cos(a - .16) * rr2 * .9, Math.sin(a - .16) * rr2 * .9, px, py) : x.moveTo(px, py); } x.stroke(); }
  x.beginPath(); x.moveTo(w - 140, 150); x.lineTo(w - 140, 250); x.stroke(); x.fillStyle = '#2b1d4d'; x.beginPath(); x.arc(w - 140, 262, 16, 0, 7); x.fill();
  // sablier
  const sx = w / 2, sy = 830;
  x.fillStyle = '#2b1d4d'; x.fillRect(sx - 80, sy - 120, 160, 16); x.fillRect(sx - 80, sy + 104, 160, 16);
  x.strokeStyle = '#2b1d4d'; x.lineWidth = 8; x.beginPath(); x.moveTo(sx - 64, sy - 104); x.quadraticCurveTo(sx - 60, sy - 10, sx, sy); x.quadraticCurveTo(sx - 60, sy + 10, sx - 64, sy + 104); x.moveTo(sx + 64, sy - 104); x.quadraticCurveTo(sx + 60, sy - 10, sx, sy); x.quadraticCurveTo(sx + 60, sy + 10, sx + 64, sy + 104); x.stroke();
  x.fillStyle = '#ff8a2a'; x.beginPath(); x.moveTo(sx - 40, sy - 60); x.lineTo(sx + 40, sy - 60); x.lineTo(sx, sy - 6); x.fill(); x.beginPath(); x.moveTo(sx - 54, sy + 100); x.lineTo(sx + 54, sy + 100); x.lineTo(sx, sy + 48); x.fill();
  txt(x, 'Encore 61 jours…', w / 2, 1000, `600 46px ${FR}`, '#2b1d4d');
}
function front4(x, w, h) {   // payer avant de voir
  x.fillStyle = '#fff4ea'; x.fillRect(0, 0, w, h);
  txt(x, 'Acompte', w / 2, 120, `600 56px ${FR}`, '#3a2416');
  txt(x, '50 %', w / 2, 250, `700 170px ${FR}`, '#e5243b');
  txt(x, 'à la commande', w / 2, 370, `600 50px ${FR}`, '#3a2416');
  // œil fermé + cadenas
  const ex = w / 2, ey = 590;
  x.strokeStyle = '#3a2416'; x.lineWidth = 14; x.lineCap = 'round';
  x.beginPath(); x.arc(ex, ey - 60, 150, Math.PI * .18, Math.PI * .82); x.stroke();
  for (let i = -2; i <= 2; i++) { const a = Math.PI / 2 + i * .32, r1 = 150, r2 = 205; x.beginPath(); x.moveTo(ex + Math.cos(a) * r1, ey - 60 + Math.sin(a) * r1); x.lineTo(ex + Math.cos(a) * r2, ey - 60 + Math.sin(a) * r2); x.stroke(); }
  x.fillStyle = '#3a2416'; rr(x, ex + 150, ey + 40, 120, 100, 18); x.fill();
  x.lineWidth = 16; x.beginPath(); x.arc(ex + 210, ey + 40, 38, Math.PI, 0); x.stroke();
  txt(x, 'Maquette visible', w / 2, 830, `600 48px ${FR}`, '#3a2416');
  txt(x, 'après paiement', w / 2, 892, `600 48px ${FR}`, '#3a2416');
  x.fillStyle = '#cfc6bd'; rr(x, 170, 950, w - 340, 80, 40); x.fill(); txt(x, 'Payer maintenant', w / 2, 991, `600 40px ${FR}`, '#ffffff');
}
// ----- verso : la version Scalify
function back(n) {
  return (x, w, h) => {
    x.fillStyle = '#c8ff3e'; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(19,10,36,.06)'; for (let i = 0; i < 40; i++) { x.beginPath(); x.arc((i * 137) % w, (i * 251) % h, 10 + (i % 5) * 6, 0, 7); x.fill(); }
    if (n === 0) {
      txt(x, 'Design', w / 2, 140, `700 104px ${FR}`, '#130a24'); txt(x, 'premium', w / 2, 250, `700 104px ${FR}`, '#130a24');
      x.fillStyle = '#130a24'; rr(x, 150, 360, w - 300, 460, 34); x.fill();
      const g = x.createRadialGradient(w / 2, 700, 10, w / 2, 700, 280); g.addColorStop(0, '#ffb057'); g.addColorStop(.5, '#ff5a1f'); g.addColorStop(1, 'rgba(255,90,31,0)'); x.fillStyle = g; rr(x, 150, 360, w - 300, 460, 34); x.fill();
      txt(x, 'Tison', w / 2, 520, `700 120px ${FR}`, '#fff1dc');
      x.fillStyle = '#fff1dc'; rr(x, w / 2 - 150, 640, 300, 64, 32); x.fill(); txt(x, 'Réserver', w / 2, 673, `600 36px ${FR}`, '#130a24');
    } else if (n === 1) {
      txt(x, '200 €', w / 2, 400, `700 250px ${FR}`, '#130a24');
      txt(x, 'au lieu de 3 000 €', w / 2, 600, `600 56px ${FR}`, 'rgba(19,10,36,.7)');
      x.strokeStyle = 'rgba(19,10,36,.7)'; x.lineWidth = 6; x.beginPath(); x.moveTo(w / 2 + 30, 604); x.lineTo(w / 2 + 300, 598); x.stroke();
      txt(x, 'landing page premium', w / 2, 720, `600 50px ${FR}`, '#130a24');
    } else if (n === 2) {
      x.fillStyle = '#130a24'; x.beginPath(); x.moveTo(w / 2 + 40, 120); x.lineTo(w / 2 - 110, 400); x.lineTo(w / 2 + 10, 400); x.lineTo(w / 2 - 50, 610); x.lineTo(w / 2 + 130, 300); x.lineTo(w / 2 + 10, 300); x.closePath(); x.fill();
      txt(x, '5 jours', w / 2, 740, `700 170px ${FR}`, '#130a24');
      txt(x, 'et c’est en ligne', w / 2, 860, `600 54px ${FR}`, 'rgba(19,10,36,.75)');
    } else {
      txt(x, 'Maquette', w / 2, 150, `700 112px ${FR}`, '#130a24'); txt(x, 'offerte', w / 2, 270, `700 112px ${FR}`, '#130a24');
      const ex = w / 2, ey = 560; x.fillStyle = '#ffffff'; x.strokeStyle = '#130a24'; x.lineWidth = 14;
      x.beginPath(); x.moveTo(ex - 230, ey); x.quadraticCurveTo(ex, ey - 200, ex + 230, ey); x.quadraticCurveTo(ex, ey + 200, ex - 230, ey); x.closePath(); x.fill(); x.stroke();
      x.fillStyle = '#130a24'; x.beginPath(); x.arc(ex, ey, 70, 0, 7); x.fill(); x.fillStyle = '#ffffff'; x.beginPath(); x.arc(ex + 24, ey - 24, 20, 0, 7); x.fill();
      txt(x, 'avant de payer', w / 2, 800, `600 64px ${FR}`, '#130a24');
    }
    check(x, w - 120, h - 120, 70);
  };
}

// ------------------------------------------------------------------ cartes
const CARD_W = 3.6, CARD_H = 4.25;
function roundedPlane(w, h, r) {
  const s = new THREE.Shape(), x0 = -w / 2, y0 = -h / 2;
  s.moveTo(x0 + r, y0); s.lineTo(x0 + w - r, y0); s.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r); s.lineTo(x0 + w, y0 + h - r); s.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h);
  s.lineTo(x0 + r, y0 + h); s.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r); s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0);
  const g = new THREE.ShapeGeometry(s, 12), p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - x0) / w, (p.getY(i) - y0) / h);
  return g;
}
const CARD_FRAG = `uniform sampler2D map; uniform float uGhost, uTime, uOp; varying vec2 vUv;
  void main(){ vec2 uv = vUv; uv.x += sin(uv.y * 16.0 + uTime * 5.0) * .006 * uGhost;
    vec3 c = texture2D(map, uv).rgb; float l = dot(c, vec3(.299, .587, .114));
    vec3 gc = mix(vec3(l), vec3(.86, .83, 1.0), .55) + .08;
    c = mix(c, gc, uGhost);
    gl_FragColor = vec4(c, mix(1.0, .34, uGhost) * uOp); }`;
const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
function card(frontDraw, backDraw) {
  const g = new THREE.Group();
  const geo = roundedPlane(CARD_W, CARD_H, .32), edge = roundedPlane(CARD_W + .16, CARD_H + .16, .4);
  const mk = (draw) => new THREE.ShaderMaterial({ uniforms: { map: { value: tex(CW, CH, draw) }, uGhost: { value: 0 }, uTime: { value: 0 }, uOp: { value: 1 } }, vertexShader: VERT, fragmentShader: CARD_FRAG, transparent: true, depthWrite: false });
  const fm = mk(frontDraw), bm = mk(backDraw);
  const em = new THREE.MeshBasicMaterial({ color: 0x130a24, transparent: true, depthWrite: false });
  const shadow = new THREE.Mesh(edge, new THREE.MeshBasicMaterial({ color: 0x130a24, transparent: true, opacity: .45, depthWrite: false }));
  shadow.position.set(.12, -.16, -.03); g.add(shadow);
  const e1 = new THREE.Mesh(edge, em); e1.position.z = -.01; g.add(e1);
  const f = new THREE.Mesh(geo, fm); f.position.z = .01; g.add(f);
  const b = new THREE.Mesh(geo, bm); b.rotation.y = Math.PI; b.position.z = -.02; g.add(b);
  const e2 = new THREE.Mesh(edge, em); e2.rotation.y = Math.PI; e2.position.z = -.015; g.add(e2);
  g.userData = { fm, bm, em, shadow };
  return g;
}

// ------------------------------------------------------------------ fantôme
function toonGradient() { const d = new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; }
function ghost() {
  const G = new THREE.Group(), GR = toonGradient();
  const prof = [];
  for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI / 2; prof.push(new THREE.Vector2(Math.max(.001, Math.sin(a)), .25 + Math.cos(a))); }
  prof.push(new THREE.Vector2(1.03, -.2), new THREE.Vector2(1.08, -.6), new THREE.Vector2(1.14, -.9), new THREE.Vector2(1.19, -1.08));
  prof.reverse();   // du bas vers le haut : normales vers l'extérieur (le contour noir reste derrière)
  const geo = new THREE.LatheGeometry(prof, 64); geo.computeVertexNormals();
  const base = geo.attributes.position.array.slice();
  const bodyMat = new THREE.MeshToonMaterial({ color: 0xfdf9ff, gradientMap: GR, side: THREE.DoubleSide });
  const body = new THREE.Mesh(geo, bodyMat); G.add(body);
  const outl = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x130a24, side: THREE.BackSide })); outl.scale.setScalar(1.045); outl.position.y = -.01; G.add(outl);
  const inner = new THREE.Mesh(new THREE.CircleGeometry(1.05, 48), new THREE.MeshBasicMaterial({ color: 0xb9a9e6 })); inner.rotation.x = Math.PI / 2; inner.position.y = -.95; G.add(inner);
  const black = new THREE.MeshBasicMaterial({ color: 0x130a24 }), white = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const eyes = [];
  [-1, 1].forEach((s) => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(.15, 24, 16), black); e.scale.set(1, 1.4, .55); e.position.set(s * .34, .45, .9); G.add(e);
    const hl = new THREE.Mesh(new THREE.SphereGeometry(.05, 12, 10), white); hl.position.set(s * .34 - .045, .52, .98); G.add(hl);
    const bl = new THREE.Mesh(new THREE.CircleGeometry(.14, 24), new THREE.MeshBasicMaterial({ color: 0xff9ec7, transparent: true, opacity: .6 }));
    bl.position.set(s * .6, .17, .8); bl.lookAt(s * 1.4, .3, 2.2); G.add(bl);
    eyes.push({ e, hl });
  });
  const mouthO = new THREE.Mesh(new THREE.SphereGeometry(.09, 16, 12), black); mouthO.scale.set(1, 1.15, .4); mouthO.position.set(0, .15, .97); G.add(mouthO);
  const smile = new THREE.Mesh(new THREE.TorusGeometry(.11, .026, 8, 20, Math.PI), black); smile.rotation.z = Math.PI; smile.position.set(0, .22, .965); G.add(smile);
  const arms = [-1, 1].map((s) => {
    const a = new THREE.Group(); a.position.set(s * .98, -.05, .05); G.add(a);
    const m = new THREE.Mesh(new THREE.SphereGeometry(.2, 20, 14), bodyMat); m.scale.set(1.35, .8, .85); m.position.x = s * .16; a.add(m);
    const o = new THREE.Mesh(m.geometry, outl.material); o.scale.set(1.35 * 1.12, .8 * 1.16, .85 * 1.16); o.position.x = s * .16; a.add(o);
    return a;
  });
  const sign = new THREE.Group(); sign.position.set(0, -.62, 1.1); sign.scale.setScalar(.88); G.add(sign);
  // traînée (images rémanentes)
  const trail = [0, 1, 2, 3].map((k) => { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); return m; });
  function pose(t, o) {
    // ourlet ondulant
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const bx = base[i * 3], by = base[i * 3 + 1], bz = base[i * 3 + 2], w = smooth(-.3, -1.08, by), th = Math.atan2(bz, bx);
      p.setXYZ(i, bx * (1 + .04 * w * Math.sin(th * 3 + t * 3)), by + w * .13 * Math.sin(th * 7 + t * 5.5), bz * (1 + .04 * w * Math.sin(th * 3 + t * 3)));
    }
    p.needsUpdate = true;
    const bl = o.blink ?? 1; eyes.forEach(({ e, hl }) => { e.scale.y = 1.4 * bl; hl.visible = bl > .5; });
    mouthO.visible = !!o.oh; smile.visible = !o.oh;
    arms.forEach((a, i) => { const s = i ? 1 : -1; a.rotation.z = s * (o.arms ?? 0) + Math.sin(t * 6 + i) * .08 * s; });
  }
  return { G, pose, arms, sign, trail, body };
}

function signMesh(draw, w, h) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(roundedPlane(w, h, .22), new THREE.MeshBasicMaterial({ map: tex(Math.round(w * 220), Math.round(h * 220), draw), transparent: true, depthTest: false }));
  const e = new THREE.Mesh(roundedPlane(w + .14, h + .14, .28), new THREE.MeshBasicMaterial({ color: 0x130a24, depthTest: false })); e.position.z = -.01;
  e.renderOrder = 20; m.renderOrder = 21;   // le panneau passe toujours devant le corps du fantôme
  g.add(e); g.add(m); return g;
}

function pumpkin(GR) {
  const g = new THREE.Group();
  const geo = new THREE.SphereGeometry(1, 32, 20); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), th = Math.atan2(z, x); const k = 1 - .07 * Math.pow(Math.abs(Math.cos(th * 4)), .5); p.setXYZ(i, x * k, y * .78, z * k); }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ color: 0xff8a2a, gradientMap: GR })); g.add(m);
  const o = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x130a24, side: THREE.BackSide })); o.scale.setScalar(1.06); g.add(o);
  const st = new THREE.Mesh(new THREE.CylinderGeometry(.09, .13, .4, 8), new THREE.MeshToonMaterial({ color: 0x4a9b3a, gradientMap: GR })); st.position.y = .9; st.rotation.z = .25; g.add(st);
  const face = new THREE.MeshBasicMaterial({ color: 0x3a1206 });
  [-1, 1].forEach((s) => { const e = new THREE.Mesh(new THREE.CircleGeometry(.17, 3), face); e.position.set(s * .33, .2, .97); e.rotation.z = Math.PI / 2; g.add(e); });
  const mo = new THREE.Mesh(new THREE.CircleGeometry(.36, 24, 0, Math.PI), face); mo.rotation.z = Math.PI; mo.position.set(0, -.12, .96); g.add(mo);
  return g;
}

// ------------------------------------------------------------------ monde
export function buildWorld(canvas, W, H) {
  const T = window.GHOST || {};
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.setClearColor(0x000000, 0); renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(40, W / H, .1, 100); cam.position.set(0, 0, 14);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a6cff, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-4, 6, 8); scene.add(key);
  const GR = toonGradient();

  const fronts = [front1, front2, front3, front4];
  const cards = fronts.map((f, i) => { const c = card(f, back(i)); scene.add(c); return c; });
  const gh = ghost(); scene.add(gh.G); gh.trail.forEach((m) => scene.add(m));
  const logoSign = signMesh((x, w, h) => { x.fillStyle = '#fffaf2'; x.fillRect(0, 0, w, h); logo(x, w / 2, h * .42, h * .3); txt(x, 'Scalify', w / 2, h * .84, `700 ${Math.round(h * .17)}px ${FR}`, '#130a24'); }, 2.3, 1.9);
  const siteSign = signMesh((x, w, h) => { x.fillStyle = '#c8ff3e'; x.fillRect(0, 0, w, h); txt(x, 'SITE', w / 2, h * .54, `700 ${Math.round(h * .62)}px ${FR}`, '#130a24'); }, 2.9, 1.35);
  gh.sign.add(logoSign); gh.sign.add(siteSign);
  const pumps = [[-3.4, 3.6, -3, .55, .3], [3.5, -3.4, -2.5, .7, 1.7], [-3.3, -4.4, -4, .6, 3.1], [3.6, 4.6, -5, .5, 4.4]].map((p) => { const g = pumpkin(GR); g.position.set(p[0], p[1], p[2]); g.scale.setScalar(p[3]); g.userData.ph = p[4]; scene.add(g); return g; });

  // repères de montage (heures venues de src/data.js)
  const C = T.cards || [];            // [{in, swoop, tray}]
  const FL = T.flips || [];            // heures des retournements
  const TW = T.twist || 15.0, PR = T.proof || 16.9, GRD = T.grid || 18.95, CTA = T.cta || 22.4;
  const slot = (i) => [X(270 + i * 180), Y(1492)];
  const cell = (i) => [X(i % 2 ? 735 : 345), Y(i < 2 ? 760 : 1185)];

  function cardState(i, t) {
    const c = C[i] || { in: 99, swoop: 99, tray: 99 }; const g = cards[i], U = g.userData;
    let x = 0, y = Y(980), z = 0, s = 1, rx = 0, ry = 0, rz = 0, ghostV = 0, op = 1, vis = t >= c.in;
    if (t < c.in) vis = false;
    // entrée : monte et se pose en tournant
    const ein = eBack((t - c.in) / .55);
    y = lerp(Y(2300), Y(980), clamp((t - c.in) / .45) ** .6); rz = (1 - ein) * .35; rx = (1 - eOut((t - c.in) / .5)) * -.6;
    s = .6 + .4 * ein;
    // repos : léger flottement
    rz += Math.sin(t * 2.1 + i) * .025; ry += Math.sin(t * 1.6 + i) * .06;
    // ghosté
    ghostV = smooth(c.swoop + .12, c.swoop + .4, t);
    // range dans le plateau
    const k = eInOut((t - c.tray) / .45);
    if (t > c.tray) { const [sx, sy] = slot(i); x = lerp(x, sx, k); y = lerp(y, sy, k); s = lerp(s, .2, k); rz = lerp(rz, (i % 2 ? .08 : -.08), k); }
    // vers la grille, puis retournement
    const kg = eInOut((t - GRD - i * .06) / .45);
    if (t > GRD) { const [sx, sy] = slot(i), [gx, gy] = cell(i); x = lerp(sx, gx, kg); y = lerp(sy, gy, kg); s = lerp(.2, .5, kg); rz = lerp(i % 2 ? .08 : -.08, (i % 2 ? .04 : -.04), kg) + Math.sin(t * 2 + i) * .015; }
    const f = FL[i] ?? 99, kf = eBack((t - f) / .42);
    if (t > f) { ry = Math.PI * clamp(kf, 0, 1.08); ghostV *= 1 - clamp((t - f) / .2); }
    // sortie avant l'appel à l'action
    const ko = eInOut((t - CTA + .1 - i * .04) / .4);
    if (t > CTA - .1) { y += ko * 9; rz += ko * .5; }
    if (t > CTA + .6) vis = false;
    g.visible = vis; g.position.set(x, y, z); g.scale.setScalar(s); g.rotation.set(rx, ry, rz);
    [U.fm, U.bm].forEach((m) => { m.uniforms.uGhost.value = ghostV; m.uniforms.uTime.value = t; m.uniforms.uOp.value = op; });
    U.em.opacity = 1 - ghostV * .62; U.shadow.material.opacity = .45 * (1 - ghostV * .7);
  }

  // trajectoire du fantôme
  function ghostState(t) {
    let x = X(540), y = Y(1180), z = 1.5, s = 1.7, ry = 0, rz = 0, arms = .3, oh = false, sx = 1, sy = 1;
    const bob = Math.sin(t * 2.4) * .12;
    const sw = C.map((c) => c.swoop);
    // accroche : surgit du bas
    if (t < 2.6) {
      const k = eBack((t + .15) / .5); y = lerp(Y(1720), Y(1230), clamp(t / .32) ** .7) + bob; s = 1.75; oh = t < .7 || (t > 1.3 && t < 1.65); arms = .5 + Math.sin(t * 8) * .25 * smooth(.4, .7, t);
      sx = 1 + (1 - k) * .25; sy = 1 - (1 - k) * .2; rz = Math.sin(t * 3) * .06;
    } else if (t < 2.9) { const k = eInOut((t - 2.6) / .3); x = lerp(X(540), X(900), k); y = lerp(Y(1230), Y(650), k); s = lerp(1.75, .62, k); z = lerp(1.5, 2.2, k); }
    else { x = X(900); y = Y(650) + bob * .6; s = .62; z = 2.2; ry = -.5; rz = .18; arms = .15; }
    // les quatre passages à travers les cartes
    for (let i = 0; i < 4; i++) {
      const a = sw[i]; if (a === undefined) continue;
      if (t >= a - .25 && t < a + .75) {
        const k = clamp((t - a) / .5), kk = eInOut(k);
        if (t < a) { const p = eInOut((t - a + .25) / .25); x = lerp(X(900), X(1320), p); y = lerp(Y(650), Y(860), p); s = .62 + p * .4; ry = -.5 - p * .6; }
        else if (t < a + .5) { x = lerp(X(1320), X(-260), kk); y = Y(900) + Math.sin(k * Math.PI) * .9; s = 1.05; z = 2.6; ry = -1.2; rz = -.15; sx = 1.18; sy = .88; oh = true; arms = 1.1; }
        else { const p = eOut((t - a - .5) / .25); x = lerp(X(-260), X(900), p); y = lerp(Y(900), Y(650), p); s = lerp(1.05, .62, p); z = 2.2; ry = lerp(-1.2, -.5, p); }
      }
    }
    // retournement : il tient le panneau Scalify
    const t0 = Math.max(TW - .55, (sw[3] ?? 0) + .76);
    if (t >= t0) {
      const k = eOut((t - t0) / .55);
      x = lerp(X(900), X(540), k); y = lerp(Y(650), Y(1010), k) + bob; s = lerp(.62, 1.3, k); z = lerp(2.2, 1.2, k); ry = lerp(-.5, 0, k); rz = 0; arms = lerp(.15, -.65, k); oh = t > TW + .3 && t < TW + .7;
    }
    if (t >= PR - .25) { const k = eInOut((t - PR + .25) / .5); x = lerp(X(540), X(150), k); y = lerp(Y(1010), Y(1240), k) + bob; s = lerp(1.3, .85, k); z = lerp(1.2, -1.0, k); ry = lerp(0, .7, k); arms = lerp(-.65, .5, k); }
    if (t >= GRD - .2) { const k = eInOut((t - GRD + .2) / .5); x = lerp(X(150), X(900), k); y = lerp(Y(1240), Y(1530), k) + bob; s = lerp(.85, .7, k); z = lerp(-1.0, 2.0, k); ry = lerp(.7, -.45, k); arms = lerp(.5, 1.25, k) + Math.sin(t * 10) * .15; oh = false; }
    if (t >= CTA - .1) { const k = eOut((t - CTA + .1) / .6); x = lerp(X(900), X(540), k); y = lerp(Y(1530), Y(745), k) + bob; s = lerp(.7, 1.15, k); z = lerp(2.0, 1.0, k); ry = lerp(-.45, 0, k); arms = lerp(1.25, -.7, k); }
    // clignements
    let blink = 1; [1.9, 4.6, 8.3, 12.1, 16.2, 20.6, 24.0, 26.3].forEach((b) => { const d = Math.abs(t - b); if (d < .08) blink = Math.min(blink, d / .08); });
    return { x, y, z, s, ry, rz, arms, oh, sx, sy, blink };
  }

  function renderAt(t) {
    cards.forEach((_, i) => cardState(i, t));
    const g = ghostState(t);
    gh.pose(t, g);
    gh.G.position.set(g.x, g.y, g.z); gh.G.rotation.set(0, g.ry, g.rz); gh.G.scale.set(g.s * g.sx, g.s * g.sy, g.s);
    // panneaux : Scalify pendant le retournement, SITE pendant l'appel à l'action
    const ls = smooth(TW + .05, TW + .35, t) * (1 - smooth(PR - .25, PR, t));
    logoSign.visible = ls > .01; logoSign.scale.setScalar(eBack(ls)); logoSign.position.set(0, 0, 0);
    const ss = smooth(CTA + .45, CTA + .75, t); siteSign.visible = ss > .01; siteSign.scale.setScalar(eBack(ss)); siteSign.position.set(0, -.05, 0);
    gh.sign.rotation.set(-gh.G.rotation.x, -g.ry, -g.rz * .5);
    // traînée pendant les passages
    const sw = C.map((c) => c.swoop); let trailOn = 0, ta = 0;
    sw.forEach((a) => { if (t >= a && t < a + .5) { trailOn = 1; ta = a; } });
    gh.trail.forEach((m, k) => {
      const tt = t - (k + 1) * .045; m.visible = !!trailOn && tt > ta;
      if (m.visible) { const gs = ghostState(tt); m.position.set(gs.x, gs.y, gs.z - .1); m.rotation.set(0, gs.ry, gs.rz); m.scale.set(gs.s * 1.18, gs.s * .88, gs.s); m.material.opacity = .22 - k * .045; }
    });
    pumps.forEach((p, i) => { const ph = p.userData.ph; p.rotation.set(Math.sin(t * .8 + ph) * .15, t * .35 + ph, Math.sin(t * .6 + ph) * .12); p.position.y = [3.6, -3.4, -4.4, 4.6][i] + Math.sin(t * 1.3 + ph) * .18; });
    // petits secousses aux impacts
    let sh = 0; (T.shakes || []).forEach((a) => { const d = t - a; if (d > 0 && d < .3) sh = Math.max(sh, (1 - d / .3) * .09); });
    cam.position.set(Math.sin(t * 61) * sh, Math.cos(t * 53) * sh, 14); cam.lookAt(Math.sin(t * 61) * sh * .5, Math.cos(t * 53) * sh * .5, 0);
    renderer.render(scene, cam);
  }
  return { renderAt, renderer };
}
