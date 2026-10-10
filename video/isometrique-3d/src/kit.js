// Primitives du monde isométrique : blocs, îles, textes 3D, cartes, personnage, accessoires.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { toon, C } from './engine.js';
import antonData from './fonts/anton.js';

export const anton = new FontLoader().parse(antonData);

// ---------------------------------------------------------------- utilitaires temps / easing
export const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const seg = (t, a, b) => cl((t - a) / (b - a));
export const ease = {
  lin: x => x,
  in2: x => x * x,
  out2: x => 1 - (1 - x) * (1 - x),
  io2: x => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2),
  out3: x => 1 - Math.pow(1 - x, 3),
  io3: x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  out4: x => 1 - Math.pow(1 - x, 4),
  io4: x => (x < 0.5 ? 8 * x ** 4 : 1 - Math.pow(-2 * x + 2, 4) / 2),
  outExpo: x => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  ioExpo: x => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2),
  outBack: (x, s = 1.25) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2),
  // ressort amorti (≈8 % de dépassement), normalisé pour finir à 1
  spring: x => (x >= 1 ? 1 : 1 - Math.exp(-5.5 * x) * Math.cos(7.2 * x) * (1 - x) - x * Math.exp(-5.5) * Math.cos(7.2)),
};
export const k = (t, a, b, e = ease.io3) => e(seg(t, a, b));
// apparition « pop » : 0 → 1 avec léger ressort
export const pop = (t, t0, d = 0.5) => ease.spring(seg(t, t0, t0 + d));
// chute avec un petit rebond, renvoie {y, sq} (sq = écrasement à l'impact)
export function drop(t, t0, H = 3, d = 0.62) {
  const u = seg(t, t0, t0 + d);
  if (u <= 0) return { y: H, sq: 1, u };
  const f = 0.55;
  if (u < f) { const v = u / f; return { y: H * (1 - v * v), sq: 1 + 0.12 * v * v, u }; }
  const v = (u - f) / (1 - f);
  const b = Math.sin(Math.PI * Math.min(1, v / 0.55)) * H * 0.07 * (v < 0.55 ? 1 : 0);
  const sq = v < 0.25 ? 1 - 0.22 * Math.sin(Math.PI * v / 0.25) : 1;
  return { y: b, sq, u };
}
// PRNG déterministe
export function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ---------------------------------------------------------------- géométries
export function mesh(geo, mat, cast = true, recv = true) {
  const m = new THREE.Mesh(geo, typeof mat === 'string' ? toon(mat) : mat);
  m.castShadow = cast; m.receiveShadow = recv;
  return m;
}
// bloc posé au sol (y de 0 à h), coins éventuellement arrondis
export function blk(w, h, d, col, r = 0, seg = 3) {
  const g = r > 0 ? new RoundedBoxGeometry(w, h, d, seg, r) : new THREE.BoxGeometry(w, h, d);
  g.translate(0, h / 2, 0);
  return mesh(g, col);
}
export function at(o, x = 0, y = 0, z = 0) { o.position.set(x, y, z); return o; }
export function grp(...kids) { const g = new THREE.Group(); kids.forEach(c => c && g.add(c)); return g; }

// ---------------------------------------------------------------- textures canvas
export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const redraw = (...a) => { g.clearRect(0, 0, w, h); draw(g, w, h, ...a); tex.needsUpdate = true; };
  redraw();
  return { tex, canvas: c, g, redraw };
}
export function rrect(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }

// carte plate (rectangle arrondi) avec texture : silhouette propre pour les contours
export function card(w, h, r, texW, draw, { basic = true, color = '#ffffff' } = {}) {
  const sh = new THREE.Shape();
  sh.moveTo(-w / 2 + r, -h / 2);
  sh.lineTo(w / 2 - r, -h / 2); sh.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  sh.lineTo(w / 2, h / 2 - r); sh.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  sh.lineTo(-w / 2 + r, h / 2); sh.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  sh.lineTo(-w / 2, -h / 2 + r); sh.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  const geo = new THREE.ShapeGeometry(sh, 8);
  const p = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + w / 2) / w, (p.getY(i) + h / 2) / h);
  const texH = Math.round(texW * h / w);
  const ct = canvasTex(texW, texH, draw);
  const mat = basic ? new THREE.MeshBasicMaterial({ map: ct.tex, side: THREE.DoubleSide }) : toon(color, { unique: true, params: { map: ct.tex } });
  const m = mesh(geo, mat, false, false);
  m.userData.ct = ct;
  return m;
}

// ---------------------------------------------------------------- texte 3D (Anton)
export function text3d(str, size, depth, col, { bevel = 0.025, align = 'center', curve = 6 } = {}) {
  const g = new TextGeometry(str, {
    font: anton, size, depth, curveSegments: curve,
    bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * 0.7, bevelSegments: 2,
  });
  g.computeBoundingBox();
  const bb = g.boundingBox;
  const ox = align === 'center' ? -(bb.max.x + bb.min.x) / 2 : align === 'right' ? -bb.max.x : -bb.min.x;
  g.translate(ox, -bb.min.y, -depth / 2);
  const m = mesh(g, col);
  m.userData.w = bb.max.x - bb.min.x; m.userData.h = bb.max.y - bb.min.y;
  return m;
}

// ---------------------------------------------------------------- île flottante
export function island({ w, d, top = C.mint, side = null, topH = 0.34, h = 1.1, rocks = 5, seed = 3, topMap = null }) {
  const g = new THREE.Group();
  let topMat = top;
  if (topMap) topMat = toon(top, { unique: true, params: { map: topMap } });
  const slab = mesh(new RoundedBoxGeometry(w, topH, d, 3, 0.07), topMat);
  slab.position.y = -topH / 2; g.add(slab);
  const body = blk(w - 0.36, h, d - 0.36, side || top, 0.05);
  body.position.y = -topH - h; g.add(body);
  const R = rng(seed);
  for (let i = 0; i < rocks; i++) {
    const rr = 0.35 + R() * 0.55, hh = 0.7 + R() * 1.1;
    const cone = mesh(new THREE.ConeGeometry(rr, hh, 4), side || top);
    cone.rotation.x = Math.PI; cone.rotation.y = Math.PI / 4 + (R() - 0.5) * 0.3;
    cone.position.set((R() - 0.5) * (w - 1.6), -topH - h - hh / 2 + 0.05, (R() - 0.5) * (d - 1.6));
    g.add(cone);
  }
  return g;
}

// ---------------------------------------------------------------- personnage
export function person({ body = C.ember, legs = C.violet, skin = '#f2c6a0', hair = C.ink, phone = true } = {}) {
  const root = new THREE.Group();
  const hips = new THREE.Group(); hips.position.y = 0.42; root.add(hips);
  const legGeo = new THREE.CapsuleGeometry(0.075, 0.26, 4, 12); legGeo.translate(0, -0.17, 0);
  const lL = mesh(legGeo, legs), lR = mesh(legGeo, legs);
  lL.position.set(0, 0, 0.1); lR.position.set(0, 0, -0.1);
  hips.add(lL, lR);
  const torso = mesh(new THREE.CapsuleGeometry(0.19, 0.26, 6, 16), body); torso.position.y = 0.26; hips.add(torso);
  const head = mesh(new THREE.SphereGeometry(0.17, 24, 16), skin); head.position.y = 0.64; hips.add(head);
  const hairM = mesh(new THREE.SphereGeometry(0.178, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.52), hair);
  hairM.position.y = 0.655; hairM.rotation.z = -0.25; hips.add(hairM);
  for (const ez of [0.065, -0.065]) { const e = mesh(new THREE.SphereGeometry(0.026, 10, 8), C.ink, false, false); e.position.set(0.158, 0.655, ez); hips.add(e); }
  const armGeo = new THREE.CapsuleGeometry(0.055, 0.24, 4, 10); armGeo.translate(0, -0.14, 0);
  const aL = mesh(armGeo, body), aR = mesh(armGeo, body);
  aL.position.set(0, 0.42, 0.23); aR.position.set(0, 0.42, -0.23);
  hips.add(aL, aR);
  let ph = null;
  if (phone) { ph = mesh(new THREE.BoxGeometry(0.05, 0.2, 0.12), C.ink); ph.position.set(0.05, -0.27, 0); aL.add(ph); }
  root.userData = { hips, lL, lR, aL, aR, head, ph };
  return root;
}
// pose de marche : phase en radians, amp 0..1
export function walkPose(p, phase, amp, phoneUp = 0) {
  const u = p.userData, s = Math.sin(phase);
  u.lL.rotation.z = s * 0.55 * amp; u.lR.rotation.z = -s * 0.55 * amp;
  u.aR.rotation.z = s * 0.45 * amp;
  u.aL.rotation.z = -s * 0.45 * amp * (1 - phoneUp) - 1.15 * phoneUp;
  u.hips.position.y = 0.42 + Math.abs(Math.cos(phase)) * 0.035 * amp;
}

// ---------------------------------------------------------------- logo Scalify (disque, S, point bleu)
export function scalifyCoin(r = 1, h = 0.24) {
  const g = new THREE.Group();
  const disc = mesh(new THREE.CylinderGeometry(r, r, h, 64), C.paper); g.add(disc);
  const svg = new SVGLoader().parse('<svg viewBox="0 0 32 32"><path d="M21 10.8H13.9a2.85 2.85 0 0 0 0 5.7h4.3a2.85 2.85 0 0 1 0 5.7H11"/></svg>');
  const s = r / 15.2;
  const pts = svg.paths[0].subPaths[0].getPoints(90).map(v => new THREE.Vector3((v.x - 16) * s, h / 2 + 0.02, (v.y - 16) * s));
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const tubeR = 1.5 * s;
  g.add(mesh(new THREE.TubeGeometry(curve, 220, tubeR, 16, false), C.ink));
  for (const e of [pts[0], pts[pts.length - 1]]) { const b = mesh(new THREE.SphereGeometry(tubeR, 16, 12), C.ink); b.position.copy(e); g.add(b); }
  const dot = mesh(new THREE.SphereGeometry(2 * s, 24, 16), C.blue);
  dot.position.set((22.4 - 16) * s, h / 2 + 0.02, (21.8 - 16) * s); dot.scale.y = 0.6; g.add(dot);
  return g;
}

// ---------------------------------------------------------------- croissant (tube à rayon variable)
export function croissant(len = 1.2, thick = 0.28, col = '#f0a238') {
  const arc = new THREE.CatmullRomCurve3([...Array(9)].map((_, i) => {
    const a = -1.05 + (i / 8) * 2.1; return new THREE.Vector3(Math.sin(a) * len * 0.5, 0, -Math.cos(a) * len * 0.42);
  }));
  const segs = 64, rad = 18;
  const geo = new THREE.TubeGeometry(arc, segs, 1, rad, false);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i <= segs; i++) {
    const u = i / segs;
    arc.getPointAt(u, c);
    const rr = thick * (0.32 + 0.68 * Math.pow(Math.sin(Math.PI * u), 0.8)) * (1 + 0.13 * Math.cos(u * Math.PI * 10));
    for (let j = 0; j <= rad; j++) {
      const idx = i * (rad + 1) + j;
      v.fromBufferAttribute(pos, idx).sub(c).multiplyScalar(rr);
      v.y *= 0.82;
      pos.setXYZ(idx, c.x + v.x, c.y + v.y, c.z + v.z);
    }
  }
  geo.computeVertexNormals();
  return mesh(geo, col);
}

// ---------------------------------------------------------------- étoile extrudée
export function star3d(r = 0.5, depth = 0.18, col = C.sun) {
  const sh = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
    const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
    i ? sh.lineTo(x, y) : sh.moveTo(x, y);
  }
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 });
  g.translate(0, 0, -depth / 2);
  return mesh(g, col);
}

// ---------------------------------------------------------------- épingle de carte
export function pin(col = C.ember, s = 1) {
  const g = new THREE.Group();
  const head = mesh(new THREE.SphereGeometry(0.42 * s, 32, 20), col); head.position.y = 1.05 * s; g.add(head);
  const cone = mesh(new THREE.ConeGeometry(0.3 * s, 0.85 * s, 24), col); cone.rotation.x = Math.PI; cone.position.y = 0.5 * s; g.add(cone);
  const hole = mesh(new THREE.SphereGeometry(0.16 * s, 20, 14), C.paper); hole.position.set(0, 1.12 * s, 0); hole.scale.set(1, 1, 1); g.add(hole);
  return g;
}

// ---------------------------------------------------------------- arbre, nuage, lampadaire
export function tree(s = 1, col = '#2fb47c') {
  const g = new THREE.Group();
  g.add(at(blk(0.16 * s, 0.5 * s, 0.16 * s, '#9a5b3c'), 0, 0, 0));
  const c1 = mesh(new THREE.SphereGeometry(0.42 * s, 20, 14), col); c1.position.y = 0.78 * s; g.add(c1);
  const c2 = mesh(new THREE.SphereGeometry(0.3 * s, 20, 14), col); c2.position.set(0.18 * s, 1.08 * s, 0.05 * s); g.add(c2);
  return g;
}
export function cloud(s = 1) {
  const g = new THREE.Group();
  const parts = [[0, 0, 0, 1.3, 0.42, 0.8], [0.45, 0.28, 0.05, 0.75, 0.42, 0.62], [-0.38, 0.22, -0.05, 0.6, 0.36, 0.55]];
  for (const [x, y, z, w, h, d] of parts) { const m = mesh(new RoundedBoxGeometry(w * s, h * s, d * s, 3, 0.16 * s), C.paper, false, false); m.position.set(x * s, y * s, z * s); g.add(m); }
  return g;
}
export function lamp(s = 1) {
  const g = new THREE.Group();
  g.add(blk(0.07 * s, 1.3 * s, 0.07 * s, C.ink));
  const h = mesh(new THREE.SphereGeometry(0.13 * s, 16, 12), C.yellow); h.position.y = 1.36 * s; g.add(h);
  return g;
}
