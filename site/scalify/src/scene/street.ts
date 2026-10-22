// La rue de nuit (three.js). Tout l'état visible dépend d'UNE variable, la position dans l'histoire `s`
// (0 héros, 1..5 chapitres, 6 nuit, 7 offre, 8 finale), plus une entrée de repos (temps, pointeur) qui garde la
// scène vivante. Aucune boucle propre : le pilote appelle `frame()` depuis gsap.ticker.
import * as THREE from 'three';

export type Idle = { t: number; x: number; y: number };

const SHOPS = [
  { name: 'Le Fournil', kind: 'bakery', facade: '#1f2434', light: '#ffbf66' },
  { name: 'Pétales', kind: 'florist', facade: '#272233', light: '#ffd0a0' },
  { name: 'Le Barbier', kind: 'barber', facade: '#1b2a2c', light: '#ffd28a' },
  { name: 'Café Lumen', kind: 'cafe', facade: '#2b2422', light: '#ffb35a' },
  { name: 'La Page', kind: 'library', facade: '#202638', light: '#ffcf86' },
  { name: 'Votre commerce', kind: 'yours', facade: '#262b35', light: '#ffc46b' },
] as const;
const GAP = 2.6;
const shopX = (i: number) => (i - 2.5) * GAP;
const BLUE = '#4da2ff';
const WARM = '#ffc46b';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (v: number) => { const x = clamp(v); return x * x * (3 - 2 * x); };
const ease = (v: number) => { const x = clamp(v); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const backOut = (v: number) => { const x = clamp(v), c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
// « s'allumer comme une enseigne » : 2 ou 3 battements, puis la lumière tient (déterministe dans k)
function flicker(k: number) {
  if (k <= 0) return 0;
  if (k >= 1) return 1;
  const steps = [0, 0.9, 0.1, 1, 0.25, 1, 0.55, 1];
  return steps[Math.min(steps.length - 1, Math.floor(k * steps.length))];
}
function rnd(seed: number) { let s = seed % 2147483647 || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

function canvasTex(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  draw(cv.getContext('2d')!);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
const glowTex = canvasTex(128, 128, (c) => {
  const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.fillRect(0, 0, 128, 128);
});

// ---------------------------------------------------------------- intérieurs de vitrine (silhouettes chaudes)
function interior(kind: string, light: string) {
  return canvasTex(512, 400, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 400); g.addColorStop(0, light); g.addColorStop(1, '#7a4a1e');
    c.fillStyle = g; c.fillRect(0, 0, 512, 400);
    const ink = 'rgba(70,35,10,0.55)', deep = 'rgba(55,25,8,0.8)';
    c.fillStyle = ink;
    const shelf = (y: number) => c.fillRect(30, y, 452, 10);
    const r = rnd(kind.length * 97);
    if (kind === 'bakery') {
      [120, 220].forEach(shelf);
      for (let i = 0; i < 7; i++) { c.fillStyle = '#b8742c'; c.beginPath(); c.ellipse(70 + i * 62, 104, 26, 13, -0.15, 0, Math.PI * 2); c.fill(); }
      for (let i = 0; i < 6; i++) { c.fillStyle = '#c98a3a'; c.beginPath(); c.arc(80 + i * 70, 205, 22, Math.PI, 0); c.fill(); }
      c.fillStyle = deep; c.fillRect(0, 300, 512, 100);
    } else if (kind === 'florist') {
      for (let i = 0; i < 8; i++) {
        const x = 40 + i * 60, h = 120 + r() * 80; c.fillStyle = 'rgba(40,90,40,0.9)'; c.fillRect(x + 18, 330 - h, 6, h);
        const cols = ['#ff6f91', '#ffd25a', '#ff8a5c', '#f7f0ff', '#d65db1'];
        for (let k = 0; k < 4; k++) { c.fillStyle = cols[(i + k) % 5]; c.beginPath(); c.arc(x + 21 + (r() - 0.5) * 34, 330 - h + (r() - 0.5) * 30, 13 + r() * 6, 0, Math.PI * 2); c.fill(); }
        c.fillStyle = '#5a6a7a'; c.fillRect(x + 4, 320, 36, 50);
      }
    } else if (kind === 'barber') {
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(60, 60, 150, 170); c.fillRect(300, 60, 150, 170);
      c.fillStyle = deep; c.fillRect(90, 250, 90, 70); c.fillRect(80, 220, 110, 34); c.fillRect(330, 250, 90, 70); c.fillRect(320, 220, 110, 34);
      for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#e0322b' : '#f5f5f5'; c.fillRect(244, 40 + i * 30, 24, 30); }
    } else if (kind === 'cafe') {
      c.fillStyle = deep; c.fillRect(0, 270, 512, 130);
      c.fillStyle = '#3a2a22'; c.fillRect(300, 170, 150, 100); c.fillStyle = '#c9ccd2'; c.fillRect(320, 150, 110, 24);
      for (let i = 0; i < 3; i++) { c.fillStyle = 'rgba(255,240,200,0.95)'; c.beginPath(); c.arc(110 + i * 130, 60, 22, 0, Math.PI * 2); c.fill(); c.fillStyle = ink; c.fillRect(108 + i * 130, 0, 4, 40); }
      for (let i = 0; i < 4; i++) { c.fillStyle = '#f2ece0'; c.fillRect(60 + i * 50, 240, 30, 30); }
    } else if (kind === 'library') {
      for (let row = 0; row < 3; row++) {
        shelf(80 + row * 100);
        let x = 34; while (x < 470) { const w = 12 + r() * 16, h = 60 + r() * 26; c.fillStyle = ['#7b2d26', '#2f5d62', '#c48b2f', '#3d3b6e', '#8a5a44', '#2e4a3a'][Math.floor(r() * 6)]; c.fillRect(x, 80 + row * 100 - h, w, h); x += w + 2; }
      }
    } else {
      [140, 240].forEach(shelf);
      c.fillStyle = 'rgba(255,255,255,0.9)'; c.font = '700 54px "Cabinet Grotesk", sans-serif'; c.textAlign = 'center'; c.fillText('OUVERT', 256, 90);
      for (let i = 0; i < 5; i++) { c.fillStyle = ['#2f5d62', '#c48b2f', '#7b2d26', '#3d3b6e', '#e6dccb'][i]; c.fillRect(60 + i * 84, 170, 54, 70); }
    }
  });
}
function signTex(name: string) {
  return canvasTex(1024, 200, (c) => {
    c.fillStyle = '#10131b'; c.fillRect(0, 0, 1024, 200);
    c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 6; c.strokeRect(8, 8, 1008, 184);
    c.fillStyle = '#ffe2ad'; c.font = '800 112px "Cabinet Grotesk", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(name, 512, 108);
  });
}
const shutterTex = canvasTex(64, 256, (c) => {
  c.fillStyle = '#4b5160'; c.fillRect(0, 0, 64, 256);
  for (let y = 0; y < 256; y += 16) { c.fillStyle = '#5c6372'; c.fillRect(0, y, 64, 6); c.fillStyle = '#353a46'; c.fillRect(0, y + 12, 64, 4); }
});
shutterTex.wrapS = shutterTex.wrapT = THREE.RepeatWrapping;

function logoTex() {
  return canvasTex(1024, 320, (c) => {
    c.fillStyle = '#0c0f16'; c.fillRect(0, 0, 1024, 320);
    // logo : pastille blanche cerclée d'encre, « S » épais, point bleu
    c.save(); c.translate(170, 160); c.scale(0.55, 0.55);
    c.fillStyle = '#fffdf8'; c.strokeStyle = '#161311'; c.lineWidth = 16; c.beginPath(); c.arc(0, 0, 200, 0, Math.PI * 2); c.fill(); c.stroke();
    c.lineWidth = 40; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath();
    const p: [number, number][] = []; const A = (cx: number, cy: number, a0: number, a1: number) => { for (let i = 0; i <= 18; i++) { const a = a0 + (a1 - a0) * i / 18; p.push([cx + 37.5 * Math.cos(a), cy + 37.5 * Math.sin(a)]); } };
    p.push([63, -108]); A(-30, -70.5, -Math.PI / 2, -Math.PI * 1.5); A(26.6, 4.5, -Math.PI / 2, Math.PI / 2); p.push([-66, 42]);
    p.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
    c.fillStyle = BLUE; c.lineWidth = 10; c.beginPath(); c.arc(84, 81, 26, 0, Math.PI * 2); c.fill(); c.stroke(); c.restore();
    c.fillStyle = '#ffffff'; c.font = '800 150px "Cabinet Grotesk", sans-serif'; c.textBaseline = 'middle'; c.fillText('Scalify', 330, 172);
  });
}

// ---------------------------------------------------------------- construction
export function createStreet(host: HTMLElement, dprCap = 2) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, dprCap));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.className = 'gl-canvas';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#07090f', 10, 34);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 120);

  scene.add(new THREE.HemisphereLight('#2a3b66', '#07090f', 1.1));
  const moon = new THREE.DirectionalLight('#9fb4ff', 0.9); moon.position.set(-6, 10, 8); scene.add(moon);

  const add = <T extends THREE.Object3D>(o: T, parent: THREE.Object3D = scene) => { parent.add(o); return o; };
  const lam = (color: string, o: THREE.MeshLambertMaterialParameters = {}) => new THREE.MeshLambertMaterial({ color, ...o });
  const basic = (o: THREE.MeshBasicMaterialParameters) => new THREE.MeshBasicMaterial({ toneMapped: false, ...o });
  const glow = (color: string, s: number, o = 1) => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    sp.scale.set(s, s, 1); return sp;
  };

  // sol : chaussée, trottoir, bordure
  const asphalt = canvasTex(512, 512, (c) => {
    c.fillStyle = '#0d1018'; c.fillRect(0, 0, 512, 512); const r = rnd(7);
    for (let i = 0; i < 2500; i++) { c.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.25)'; c.fillRect(r() * 512, r() * 512, 2, 2); }
    c.fillStyle = 'rgba(230,230,210,0.55)'; for (let x = 0; x < 512; x += 128) c.fillRect(x + 20, 250, 70, 10);
  });
  asphalt.wrapS = asphalt.wrapT = THREE.RepeatWrapping; asphalt.repeat.set(10, 2);
  const road = add(new THREE.Mesh(new THREE.PlaneGeometry(60, 12), new THREE.MeshStandardMaterial({ map: asphalt, roughness: 0.42, metalness: 0.25 })));
  // reflets sur la chaussée mouillée (traînées étirées vers la caméra)
  const streak = (color: string, x: number, w: number, len: number, o: number) => { const m = add(new THREE.Mesh(new THREE.PlaneGeometry(w, len), basic({ map: glowTex, color, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending }))); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.012, 1.9 + len / 2); return m.material as THREE.MeshBasicMaterial; };
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0, 7.6);
  const slabs = canvasTex(256, 256, (c) => { c.fillStyle = '#272c38'; c.fillRect(0, 0, 256, 256); c.strokeStyle = '#1a1e28'; c.lineWidth = 4; for (let i = 0; i <= 256; i += 64) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 256); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(256, i); c.stroke(); } });
  slabs.wrapS = slabs.wrapT = THREE.RepeatWrapping; slabs.repeat.set(30, 1);
  const walk = add(new THREE.Mesh(new THREE.PlaneGeometry(60, 1.6), new THREE.MeshLambertMaterial({ map: slabs })));
  walk.rotation.x = -Math.PI / 2; walk.position.set(0, 0.06, 0.8);
  add(new THREE.Mesh(new THREE.BoxGeometry(60, 0.12, 0.12), lam('#3a404e'))).position.set(0, 0.06, 1.62);

  // ville au loin : silhouettes, quelques fenêtres
  const winTex = canvasTex(128, 256, (c) => { c.fillStyle = '#0a0d15'; c.fillRect(0, 0, 128, 256); const r = rnd(11); for (let y = 8; y < 256; y += 22) for (let x = 8; x < 128; x += 20) if (r() < 0.16) { c.fillStyle = r() < 0.7 ? 'rgba(255,196,107,0.85)' : 'rgba(170,200,255,0.7)'; c.fillRect(x, y, 9, 12); } });
  winTex.wrapS = winTex.wrapT = THREE.RepeatWrapping;
  const r0 = rnd(5);
  for (let i = 0; i < 22; i++) {
    const w = 1.6 + r0() * 2.4, h = 5 + r0() * 7, x = -24 + i * 2.3 + r0(), z = -5.5 - r0() * 5;
    const t = winTex.clone(); t.repeat.set(w / 2, h / 4); t.needsUpdate = true;
    add(new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.5), [lam('#0b0e16'), lam('#0b0e16'), lam('#0b0e16'), lam('#0b0e16'), basic({ map: t }), lam('#0b0e16')])).position.set(x, h / 2, z);
  }
  // étoiles
  const starPos: number[] = []; const r1 = rnd(3);
  for (let i = 0; i < 260; i++) starPos.push((r1() - 0.5) * 80, 9 + r1() * 22, -20 - r1() * 20);
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  add(new THREE.Points(sg, new THREE.PointsMaterial({ color: '#cfdcff', size: 0.09, sizeAttenuation: true, transparent: true, opacity: 0.8, fog: false })));

  // lampadaires (toujours allumés : c'est la rue qui est éteinte, pas la ville)
  for (let k = 0; k < 7; k++) {
    const x = shopX(0) - GAP / 2 + k * GAP;
    const g = add(new THREE.Group()); g.position.set(x, 0, 1.45);
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 3.1, 10), lam('#2b303c')), g).position.y = 1.55;
    add(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 0.16), lam('#2b303c')), g).position.set(0.12, 3.1, 0);
    add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), basic({ color: '#fff1d6' })), g).position.set(0.26, 3.02, 0);
    add(glow('#ffd9a0', 1.3, 0.55), g).position.set(0.26, 3.0, 0);
    const cone = add(new THREE.Mesh(new THREE.ConeGeometry(1.1, 3.0, 24, 1, true), basic({ color: '#ffd9a0', transparent: true, opacity: 0.045, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })), g);
    cone.position.set(0.26, 1.5, 0);
    const pool = add(new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), basic({ map: glowTex, color: '#ffcf8a', transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending })), g);
    pool.rotation.x = -Math.PI / 2; pool.position.set(0.26, 0.075, 0);
    streak('#ffd9a0', x + 0.26, 0.5, 4.2, 0.22);
  }

  // commerces
  type Shop = { win: THREE.MeshBasicMaterial; sign: THREE.MeshBasicMaterial; signGlow: THREE.Sprite; shutter: THREE.Mesh; spill: THREE.MeshBasicMaterial; lamp: THREE.PointLight; pin: THREE.Group; stars: THREE.Sprite; upper: THREE.MeshBasicMaterial[]; light: THREE.Color };
  const shops: Shop[] = SHOPS.map((d, i) => {
    const x = shopX(i), g = add(new THREE.Group()); g.position.set(x, 0, 0);
    const body = add(new THREE.Mesh(new THREE.BoxGeometry(GAP - 0.06, 3.7, 2.2), lam(d.facade)), g); body.position.set(0, 1.85, -1.1);
    add(new THREE.Mesh(new THREE.BoxGeometry(GAP + 0.02, 0.14, 0.32), lam('#3a3f4c')), g).position.set(0, 3.72, 0.02);
    add(new THREE.Mesh(new THREE.BoxGeometry(GAP - 0.06, 0.1, 0.18), lam('#3a3f4c')), g).position.set(0, 2.02, 0.05);
    // vitrine + porte
    const light = new THREE.Color(d.light);
    const win = basic({ map: interior(d.kind, d.light), color: new THREE.Color('#0b0d14') });
    add(new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.32), win), g).position.set(-0.36, 0.98, 0.012);
    const door = basic({ color: new THREE.Color('#0b0d14') });
    add(new THREE.Mesh(new THREE.PlaneGeometry(0.62, 1.6), door), g).position.set(0.78, 0.86, 0.012);
    add(new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.05, 0.06), lam('#3a3f4c')), g).position.set(-0.36, 0.3, 0.03);
    // enseigne
    const sign = basic({ map: signTex(d.name), color: new THREE.Color('#2a2e38') });
    add(new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.42, 0.1), [lam('#151820'), lam('#151820'), lam('#151820'), lam('#151820'), sign, lam('#151820')]), g).position.set(0, 2.32, 0.08);
    const signGlow = add(glow(d.light, 2.6, 0), g); signGlow.position.set(0, 2.32, 0.3); signGlow.scale.set(3.4, 1.4, 1);
    // rideau de fer (monte en s'enroulant sous l'enseigne)
    const st = shutterTex.clone(); st.repeat.set(3, 4); st.needsUpdate = true;
    const shutter = add(new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.86), new THREE.MeshLambertMaterial({ map: st })), g);
    shutter.geometry.translate(0, -0.93, 0); shutter.position.set(0, 2.02, 0.05);
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.26, 14), lam('#3d4350')), g).rotation.z = Math.PI / 2;
    g.children[g.children.length - 1].position.set(0, 2.06, 0.12);
    // lumière qui déborde sur le trottoir + lampe intérieure
    const spill = basic({ map: glowTex, color: light, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    const sp = add(new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.4), spill), g); sp.rotation.x = -Math.PI / 2; sp.position.set(0, 0.08, 0.9);
    const lamp = add(new THREE.PointLight(light, 0, 6.5, 1.6), g); lamp.position.set(0, 1.4, 1.0);
    const refl = streak(d.light, x - 0.36, 1.3, 5.0, 0);
    // étage : fenêtres
    const upper: THREE.MeshBasicMaterial[] = []; const r = rnd(31 + i * 7);
    for (let k = 0; k < 3; k++) {
      const m = basic({ color: new THREE.Color(r() < 0.35 ? '#5a4628' : '#0d1018') }); upper.push(m);
      add(new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.62), m), g).position.set(-0.78 + k * 0.78, 2.98, 0.012);
    }
    // épingle de carte + étoiles
    const pin = add(new THREE.Group(), g); pin.position.set(0, 4.35, 0.3);
    const pm = new THREE.MeshStandardMaterial({ color: WARM, emissive: WARM, emissiveIntensity: 0.9, roughness: 0.35, toneMapped: false });
    add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16), pm), pin).position.y = 0.2;
    const tip = add(new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.42, 24), pm), pin); tip.rotation.x = Math.PI; tip.position.y = -0.06;
    add(new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), basic({ color: '#10131b' })), pin).position.set(0, 0.22, 0.17);
    add(glow(WARM, 1.4, 0.55), pin).position.y = 0.1;
    const stars = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(256, 48, (c) => { c.fillStyle = WARM; c.font = '40px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('★★★★★', 128, 26); }), transparent: true, toneMapped: false })), pin);
    stars.scale.set(0.95, 0.18, 1); stars.position.y = 0.66;
    pin.scale.setScalar(0.0001);
    return { win, sign, signGlow, shutter, spill, lamp, pin, stars, upper, light, door, refl } as Shop & { door: THREE.MeshBasicMaterial; refl: THREE.MeshBasicMaterial };
  });

  // panneau Scalify au bout de la rue
  const board = add(new THREE.Group()); board.position.set(shopX(5) + 3.4, 0, -0.4); board.rotation.y = -0.35;
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.0, 10), lam('#2b303c')), board).position.set(0, 2.0, 0);
  const boardMat = basic({ map: logoTex(), color: new THREE.Color('#1c202a') });
  add(new THREE.Mesh(new THREE.BoxGeometry(3.3, 1.03, 0.12), [lam('#151820'), lam('#151820'), lam('#151820'), lam('#151820'), boardMat, lam('#151820')]), board).position.set(0, 4.4, 0);
  const boardGlow = add(glow(BLUE, 3, 0), board); boardGlow.position.set(0, 4.4, 0.3); boardGlow.scale.set(5, 2.2, 1);

  // le point bleu
  const dot = add(new THREE.Group());
  add(new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 20), basic({ color: BLUE })), dot);
  add(new THREE.Mesh(new THREE.SphereGeometry(0.19, 32, 20), basic({ color: '#ffffff', transparent: true, opacity: 0.18 })), dot);
  const dotGlow = add(glow(BLUE, 1.6, 0.9), dot);
  const dotLight = add(new THREE.PointLight(BLUE, 3, 4, 1.6), dot); dotLight.position.y = 0.2;
  const ring = add(new THREE.Mesh(new THREE.RingGeometry(0.2, 0.26, 48), basic({ color: BLUE, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide })));
  ring.rotation.x = -Math.PI / 2;
  const shadowDot = add(new THREE.Mesh(new THREE.CircleGeometry(0.22, 32), basic({ color: '#000', transparent: true, opacity: 0.35, depthWrite: false })));
  shadowDot.rotation.x = -Math.PI / 2;
  const dotRefl = streak(BLUE, 0, 0.5, 3.2, 0.3);

  // ---------------------------------------------------------------- l'histoire : images clés par section
  type Key = { cam: [number, number, number]; look: [number, number, number]; dot: number };
  const keys: Key[] = [
    { cam: [-11.4, 1.5, 7.4], look: [-3.6, 1.7, 0], dot: shopX(0) - 2.2 },              // 0 héros : rue éteinte, au ras du trottoir
    { cam: [shopX(0) - 2.8, 2.3, 7.0], look: [shopX(0) + 0.9, 1.5, 0], dot: shopX(0) },  // 1 site
    { cam: [shopX(1) - 2.8, 2.3, 7.0], look: [shopX(1) + 0.9, 1.5, 0], dot: shopX(1) },  // 2 fiche
    { cam: [shopX(2) - 2.8, 2.3, 7.0], look: [shopX(2) + 0.9, 1.6, 0], dot: shopX(2) },  // 3 avis
    { cam: [shopX(3) - 2.8, 2.3, 7.0], look: [shopX(3) + 0.9, 1.5, 0], dot: shopX(3) },  // 4 posts
    { cam: [shopX(4) - 2.8, 2.3, 7.0], look: [shopX(4) + 0.9, 1.5, 0], dot: shopX(4) },  // 5 nuit (librairie)
    { cam: [shopX(4) - 0.9, 1.45, 3.6], look: [shopX(4) - 0.1, 1.15, 0], dot: shopX(4) + 0.4 }, // 6 03:12, contre la vitrine
    { cam: [shopX(5) - 3.4, 2.6, 7.4], look: [shopX(5) + 0.8, 1.8, 0], dot: shopX(5) },  // 7 votre commerce
    { cam: [1.6, 8.4, 17.5], look: [2.4, 1.9, -0.5], dot: shopX(5) + 1.6 },              // 8 la rue entière + Scalify
  ];
  const level = (s: number, a: number) => clamp((s - a) / 0.5);

  let W = 1, H = 1, portrait = false;
  function resize() {
    W = host.clientWidth || innerWidth; H = host.clientHeight || innerHeight; portrait = H > W;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.fov = portrait ? 56 : 38; camera.updateProjectionMatrix();
  }
  resize();

  const v = new THREE.Vector3(), la = new THREE.Vector3();
  /** s : position dans l'histoire (0..8). intro : 0..1 chute du point au chargement. idle : temps et pointeur. */
  function frame(s: number, intro: number, idle: Idle) {
    s = clamp(s, 0, 8);
    const k = Math.min(7, Math.floor(s)), f = ease(s - k), A = keys[k], B = keys[k + 1];
    const z = portrait ? lerp(k === 0 ? 1.18 : 1.42, 1.42, k === 0 ? f : 1) : 1;
    v.set(lerp(A.cam[0], B.cam[0], f), lerp(A.cam[1], B.cam[1], f), lerp(A.cam[2], B.cam[2], f));
    la.set(lerp(A.look[0], B.look[0], f), lerp(A.look[1], B.look[1], f), lerp(A.look[2], B.look[2], f));
    v.sub(la).multiplyScalar(z).add(la);                       // en portrait la caméra recule
    if (portrait) { v.y += 0.6; la.y += 0.25; }
    v.x += idle.x * 0.5; v.y += -idle.y * 0.25 + Math.sin(idle.t * 0.25) * 0.05;
    camera.position.copy(v); camera.lookAt(la);

    // le point bleu : glisse de commerce en commerce, petit saut entre deux
    const dx = lerp(A.dot, B.dot, f), hop = Math.sin(Math.PI * clamp(s - k)) * 0.28 * (A.dot !== B.dot ? 1 : 0);
    const drop = 1 - backOut(intro);                            // chute depuis le ciel au chargement
    const dy = 0.32 + hop + drop * 7 + Math.abs(Math.sin(idle.t * 2.2)) * 0.04;
    dot.position.set(dx, dy, 0.95);
    dotGlow.scale.setScalar(1.5 + Math.sin(idle.t * 3) * 0.12);
    const ph = (idle.t * 0.7) % 1;
    ring.position.set(dx, 0.085, 0.95); ring.scale.setScalar(1 + ph * 3.2); (ring.material as THREE.MeshBasicMaterial).opacity = 0.65 * (1 - ph) * clamp(intro * 2 - 1);
    shadowDot.position.set(dx, 0.08, 0.95); shadowDot.scale.setScalar(1 / (1 + drop * 3));
    dotRefl.opacity = 0.3 * clamp(intro * 1.5 - 0.3);

    // les commerces s'allument au passage du point
    shops.forEach((sh, i) => {
      const L = i < 5 ? level(s, i + 0.35) : level(s, 6.35);
      const open = ease(L / 0.45), on = flicker((L - 0.3) / 0.45), pin = backOut((L - 0.62) / 0.38);
      const buzz = on >= 1 && Math.sin(idle.t * 9.7 + i * 5.3) > 0.985 ? 0.55 : 1;   // une enseigne grésille de temps en temps
      sh.shutter.scale.y = Math.max(0.04, 1 - open);
      sh.win.color.setScalar(0.06 + 0.94 * on);
      (sh as any).door.color.setScalar(0.05 + 0.6 * on).multiply(sh.light);
      sh.sign.color.setScalar(0.18 + 0.82 * on * buzz);
      (sh.signGlow.material as THREE.SpriteMaterial).opacity = 0.55 * on * buzz;
      sh.spill.opacity = 0.5 * on;
      (sh as any).refl.opacity = 0.32 * on * buzz;
      sh.lamp.intensity = 9 * on;
      sh.pin.scale.setScalar(Math.max(0.0001, pin));
      sh.pin.position.y = 4.35 + Math.sin(idle.t * 1.6 + i) * 0.06;
      sh.pin.rotation.y = Math.sin(idle.t * 0.9 + i) * 0.4;
    });
    const sb = flicker((s - 7.4) / 0.45);
    boardMat.color.setScalar(0.12 + 0.88 * sb);
    (boardGlow.material as THREE.SpriteMaterial).opacity = 0.5 * sb;
    renderer.render(scene, camera);
  }

  function dispose() { renderer.dispose(); renderer.domElement.remove(); }
  return { frame, resize, dispose, renderer, shopCount: SHOPS.length };
}
