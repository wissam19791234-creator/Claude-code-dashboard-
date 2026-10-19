// Studio blanc « produit » : rendu physique, reflets de studio, ombres de contact douces, formes brillantes.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
export { THREE, RoundedBoxGeometry };

export const COL = { ink: '#1d1d1f', grey: '#86868b', ember: '#fb4903', ember3d: '#ff3f00', sun: '#ffd731', mint: '#38d38a', blue: '#4da2ff',
  violet: '#5c4ade', lav: '#e9ccff', graphite: '#3a3a3c', white: '#ffffff', paper: '#f5f5f7' };
export const FONT = '"Inter Tight"';

export function makeRenderer(canvas, W, H) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.setClearColor(0xffffff, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
  scene.environmentIntensity = 0.85;
  const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(-3, 7, 6); scene.add(key);
  const fill = new THREE.DirectionalLight(0xfff4ea, 0.45); fill.position.set(5, 2, 4); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 0.9); rim.position.set(1, 5, -7); scene.add(rim);
  const camera = new THREE.PerspectiveCamera(28, W / H, 0.1, 100);
  return { renderer, scene, camera };
}

// ---------------------------------------------------------------- matières
export const glossy = (color, o = {}) => new THREE.MeshPhysicalMaterial({
  color, roughness: o.r ?? 0.3, metalness: o.m ?? 0, clearcoat: o.cc ?? 1, clearcoatRoughness: o.ccr ?? 0.07,
  transparent: !!o.transparent, opacity: o.opacity ?? 1, side: o.side ?? THREE.FrontSide });
export const gold = () => new THREE.MeshPhysicalMaterial({ color: '#f6c445', metalness: 1, roughness: 0.2, clearcoat: 0.6, clearcoatRoughness: 0.1 });
export const unlit = (map, o = {}) => new THREE.MeshBasicMaterial({ map, transparent: true, toneMapped: false, depthWrite: o.depthWrite ?? true, opacity: o.opacity ?? 1 });

// ---------------------------------------------------------------- formes 2D
export function stadium(w, h) {
  const r = h / 2, s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -r); s.lineTo(w / 2 - r, -r); s.absarc(w / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2, false);
  s.lineTo(-w / 2 + r, r); s.absarc(-w / 2 + r, 0, r, Math.PI / 2, Math.PI * 1.5, false);
  return s;
}
export function roundRect(w, h, r, tail) {
  const s = new THREE.Shape(), x0 = -w / 2, y0 = -h / 2, x1 = w / 2, y1 = h / 2;
  s.moveTo(x0 + r, y0);
  if (tail) { // petite queue de bulle en bas (tail = -1 gauche, +1 droite)
    const tx = tail < 0 ? x0 + r + 0.12 : x1 - r - 0.36;
    s.lineTo(tx, y0); s.lineTo(tx + (tail < 0 ? -0.16 : 0.52), y0 - 0.22); s.lineTo(tx + 0.24, y0);
  }
  s.lineTo(x1 - r, y0); s.quadraticCurveTo(x1, y0, x1, y0 + r); s.lineTo(x1, y1 - r); s.quadraticCurveTo(x1, y1, x1 - r, y1);
  s.lineTo(x0 + r, y1); s.quadraticCurveTo(x0, y1, x0, y1 - r); s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0);
  return s;
}
export function star(R, r) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r : R;
    if (i === 0) s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); else s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  return s;
}
export function heart(sz) {
  const s = new THREE.Shape(), k = sz;
  s.moveTo(0, -0.9 * k);
  s.bezierCurveTo(-0.15 * k, -0.7 * k, -1.0 * k, -0.2 * k, -1.0 * k, 0.25 * k);
  s.bezierCurveTo(-1.0 * k, 0.75 * k, -0.35 * k, 0.95 * k, 0, 0.5 * k);
  s.bezierCurveTo(0.35 * k, 0.95 * k, 1.0 * k, 0.75 * k, 1.0 * k, 0.25 * k);
  s.bezierCurveTo(1.0 * k, -0.2 * k, 0.15 * k, -0.7 * k, 0, -0.9 * k);
  return s;
}
export function circle(r) { const s = new THREE.Shape(); s.absarc(0, 0, r, 0, Math.PI * 2, false); return s; }

// contour échantillonné sans points doublés (un point de départ répété crée une encoche dans le biseau)
function clean(shape, segs) {
  const out = [];
  for (const p of shape.getPoints(segs)) { const q = out[out.length - 1]; if (!q || q.distanceTo(p) > 1e-5) out.push(p); }
  if (out.length > 2 && out[0].distanceTo(out[out.length - 1]) < 1e-5) out.pop();
  return new THREE.Shape(out);
}
// extrusion biseautée, centrée (face avant à z = +depth/2 + biseau)
export function extrude(shape, depth, bevel, curve = 40) {
  const g = new THREE.ExtrudeGeometry(clean(shape, curve), { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.85,
    bevelSegments: 6, curveSegments: 1 });
  g.translate(0, 0, -depth / 2);
  return g;
}
// forme plate avec UV normalisés (pour plaquer une texture canvas)
export function flat(shape, w, h) {
  const g = new THREE.ShapeGeometry(clean(shape, 40), 1), p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w + 0.5, p.getY(i) / h + 0.5);
  return g;
}

// ---------------------------------------------------------------- textures canvas
export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d'); draw && draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  return { canvas: c, ctx, tex };
}
export function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

// ombre de contact douce (disque flou au sol)
let blobTex = null;
export function blob(scene, floorY) {
  if (!blobTex) blobTex = canvasTex(256, 256, (ctx) => {
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(20,20,30,0.55)'); g.addColorStop(0.45, 'rgba(20,20,30,0.28)'); g.addColorStop(1, 'rgba(20,20,30,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  }).tex;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, toneMapped: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = floorY + 0.002; m.renderOrder = -1; scene.add(m);
  // place l'ombre sous un objet : taille et densité selon la hauteur
  m.follow = (x, z, h, size, k = 1) => {
    const lift = Math.max(0, h); m.visible = k > 0.01;
    m.position.x = x; m.position.z = z;
    const s = size * (1 + lift * 0.35); m.scale.set(s, s * 0.62, 1);
    m.material.opacity = k * Math.max(0.12, 1 - lift * 0.22);
  };
  return m;
}

// ---------------------------------------------------------------- temps & courbes
const PE = (n) => window.gsap.parseEase(n);
export const E = { o3: PE('power3.out'), i2: PE('power2.in'), io2: PE('power2.inOut'), io3: PE('power3.inOut'), back: PE('back.out(1.7)'),
  back3: PE('back.out(3)'), bounce: PE('bounce.out'), ela: PE('elastic.out(1, 0.5)'), sio: PE('sine.inOut'), o2: PE('power2.out') };
export const cl = (x) => Math.min(1, Math.max(0, x));
export const u = (t, a, b) => cl((t - a) / (b - a));
export const lerp = (a, b, k) => a + (b - a) * k;
