// Monde 3D de la promo Scalify (rendu image par image : tout dépend de t, rien ne s'accumule).
// Scène « braises » : étincelle, explosion qui révèle le logo, braises d'ambiance (0-3 s puis 7,2 s → fin).
// Scène « rue » : trois commerces de nuit en montage rapide, puis un téléphone qui cherche… et se brise (3-7,2 s).
import * as THREE from 'three';

const rnd = (s) => () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
const easeInOut = (x) => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const PX = 1920 / (2 * 10 * Math.tan(25 * Math.PI / 180));   // pixels par unité à z = 0 (caméra des braises)
const Y = (px) => (960 - px) / PX;

// ------------------------------------------------------------------ particules (shader commun)
const EMBER_FRAG = `varying vec3 vCol; varying float vA;
  void main(){ vec2 c = gl_PointCoord - .5; float d = length(c); float a = smoothstep(.5, .0, d); a *= a;
    gl_FragColor = vec4(vCol * a * vA, 0.0); }`;
// lumière ajoutée par-dessus le fond HTML : couleur additionnée, alpha du canevas inchangé
const ADD = { blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor };

function burst(n, seed) {
  const r = rnd(seed), g = new THREE.BufferGeometry();
  const dir = new Float32Array(n * 3), att = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    const u = r() * 2 - 1, th = r() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    dir.set([s * Math.cos(th), u * .9, s * Math.sin(th) * .6], i * 3);
    att.set([2 + Math.pow(r(), .6) * 9, .7 + r() * 1.7, 3 + r() * 9, r()], i * 4);   // vitesse, durée de vie, taille, graine
  }
  g.setAttribute('position', new THREE.BufferAttribute(dir, 3));
  g.setAttribute('aAtt', new THREE.BufferAttribute(att, 4));
  const m = new THREE.ShaderMaterial({
    uniforms: { uT: { value: -1 }, uO: { value: new THREE.Vector3() }, uGain: { value: 1 } },
    transparent: true, depthWrite: false, ...ADD,
    vertexShader: `uniform float uT, uGain; uniform vec3 uO; attribute vec4 aAtt; varying vec3 vCol; varying float vA;
      void main(){ float t = max(uT, 0.0); float k = 2.6;
        vec3 p = uO + position * aAtt.x * (1.0 - exp(-k * t)) / k + vec3(0.0, -.55 * t * t, 0.0);
        p.x += sin(t * 3.0 + aAtt.w * 30.0) * .08 * t;
        float life = t / aAtt.y;
        vA = (uT < 0.0 ? 0.0 : 1.0) * (1.0 - smoothstep(.55, 1.0, life)) * uGain;
        vCol = mix(vec3(1.0, .92, .7), vec3(1.0, .32, .06), smoothstep(.0, .45, life));
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = aAtt.z * (1.0 - life * .6) * 10.0 / -mv.z * (1.0 + 2.5 * exp(-t * 9.0));
        gl_Position = projectionMatrix * mv; }`,
    fragmentShader: EMBER_FRAG
  });
  const p = new THREE.Points(g, m); p.frustumCulled = false; return p;
}

function ambient(n, seed) {
  const r = rnd(seed), g = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3), att = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    pos.set([(r() * 2 - 1) * 3.4, (r() * 2 - 1) * 5.6, -4 + r() * 6.5], i * 3);
    att.set([.15 + r() * .45, 1.5 + r() * 5, r(), .6 + r() * 1.6], i * 4);   // vitesse, taille, graine, rayon d'orbite
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aAtt', new THREE.BufferAttribute(att, 4));
  const m = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uAmb: { value: 0 }, uSwirl: { value: 0 }, uC: { value: new THREE.Vector3(0, 2.4, 0) }, uRise: { value: 0 } },
    transparent: true, depthWrite: false, ...ADD,
    vertexShader: `uniform float uTime, uAmb, uSwirl, uRise; uniform vec3 uC; attribute vec4 aAtt; varying vec3 vCol; varying float vA;
      void main(){ vec3 p = position; float sp = aAtt.x;
        p.y = mod(p.y + 5.6 + uTime * sp * (1.0 + uRise * 2.5), 11.2) - 5.6;
        p.x += sin(uTime * .7 * sp + aAtt.z * 40.0) * .35;
        float ang = aAtt.z * 6.2832 + uTime * (.5 + aAtt.z * .6);
        vec3 orb = uC + vec3(cos(ang) * aAtt.w * 1.35, sin(ang) * aAtt.w * .55 + sin(uTime + aAtt.z * 9.0) * .08, sin(ang) * aAtt.w * .8);
        p = mix(p, orb, uSwirl * step(.45, aAtt.z));
        float tw = .55 + .45 * sin(uTime * (2.0 + aAtt.z * 3.0) + aAtt.z * 50.0);
        vA = uAmb * tw * smoothstep(-5.6, -3.5, p.y) * (1.0 - smoothstep(4.0, 5.6, p.y) * (1.0 - uSwirl));
        vCol = mix(vec3(1.0, .78, .45), vec3(1.0, .33, .08), aAtt.z);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = aAtt.y * 10.0 / -mv.z * 1.6;
        gl_Position = projectionMatrix * mv; }`,
    fragmentShader: EMBER_FRAG
  });
  const p = new THREE.Points(g, m); p.frustumCulled = false; return p;
}

function spark() {
  const n = 46, g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  g.setAttribute('aK', new THREE.BufferAttribute(new Float32Array([...Array(n).keys()].map((i) => i / (n - 1))), 1));
  const m = new THREE.ShaderMaterial({
    uniforms: { uOn: { value: 0 } }, transparent: true, depthWrite: false, ...ADD,
    vertexShader: `uniform float uOn; attribute float aK; varying vec3 vCol; varying float vA;
      void main(){ vA = uOn * pow(1.0 - aK, 1.6); vCol = mix(vec3(1.0,.95,.8), vec3(1.0,.35,.08), aK);
        vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = mix(46.0, 6.0, sqrt(aK)) * 10.0 / -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: EMBER_FRAG
  });
  const p = new THREE.Points(g, m); p.frustumCulled = false; return p;
}

// ------------------------------------------------------------------ textures dessinées
function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
const FONT = '"Cabinet Grotesk", "Helvetica Neue", Arial, sans-serif';

function signTex(label, bg, ink) {
  return canvasTex(1024, 180, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, bg[0]); g.addColorStop(1, bg[1]); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = 6; x.strokeRect(10, 10, w - 20, h - 20);
    x.font = `800 112px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.shadowColor = ink; x.shadowBlur = 28; x.fillStyle = ink; x.fillText(label, w / 2, h / 2 + 6);
    x.shadowBlur = 0; x.fillStyle = '#fff8ec'; x.fillText(label, w / 2, h / 2 + 6);
  });
}
function windowTex(kind, seed) {
  const r = rnd(seed);
  return canvasTex(768, 440, (x, w, h) => {
    const g = x.createRadialGradient(w * .5, h * .35, 20, w * .5, h * .5, w * .7);
    g.addColorStop(0, kind === 'coiffeur' ? '#ffe9c9' : '#ffd08a'); g.addColorStop(1, kind === 'coiffeur' ? '#8a5a3c' : '#7a3a14'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(40,18,8,.78)';
    if (kind === 'restaurant') {
      for (let i = 0; i < 3; i++) { const cx = 120 + i * 260; x.beginPath(); x.ellipse(cx, 330, 95, 18, 0, 0, 7); x.fill(); x.fillRect(cx - 8, 330, 16, 110); x.fillRect(cx - 120, 300, 18, 140); x.fillRect(cx + 102, 300, 18, 140);
        x.fillStyle = 'rgba(255,240,200,.95)'; x.beginPath(); x.arc(cx, 110, 26, 0, 7); x.fill(); x.fillStyle = 'rgba(40,18,8,.78)'; x.fillRect(cx - 2, 0, 4, 90); }
    } else if (kind === 'coiffeur') {
      for (let i = 0; i < 3; i++) { const cx = 130 + i * 255; x.fillStyle = 'rgba(255,255,255,.55)'; x.fillRect(cx - 70, 70, 140, 190); x.fillStyle = 'rgba(40,18,8,.8)'; x.fillRect(cx - 55, 300, 110, 30); x.fillRect(cx - 12, 330, 24, 110); x.fillRect(cx - 48, 220, 96, 85); }
    } else {
      x.fillRect(60, 300, w - 120, 30); x.fillRect(90, 330, 22, 110); x.fillRect(w - 112, 330, 22, 110);
      for (let i = 0; i < 9; i++) { x.fillStyle = `rgba(${90 + r() * 60},${50 + r() * 30},20,.9)`; x.fillRect(80 + i * 66, 90 + r() * 40, 40, 200); }
      x.fillStyle = 'rgba(255,240,200,.9)'; x.beginPath(); x.arc(w / 2, 60, 30, 0, 7); x.fill();
    }
    for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(255,255,255,${r() * .06})`; x.fillRect(r() * w, r() * h, 2 + r() * 60, 2); }
  });
}

// ------------------------------------------------------------------ monde
export function buildWorld(canvas, W, H) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // ===== scène des braises
  const sA = new THREE.Scene();
  const camA = new THREE.PerspectiveCamera(50, W / H, .1, 100); camA.position.set(0, 0, 10);
  const amb = ambient(520, 7); sA.add(amb);
  const sp = spark(); sA.add(sp);
  const b1 = burst(1100, 11); b1.material.uniforms.uO.value.set(0, Y(560), 0); sA.add(b1);
  const T200 = (window.PROMO && window.PROMO.t200) || 26.22;
  const b2 = burst(900, 23); b2.material.uniforms.uO.value.set(0, Y(1000), 0); sA.add(b2);
  const ring = new THREE.Mesh(new THREE.RingGeometry(.92, 1, 96), new THREE.MeshBasicMaterial({ color: 0xffb066, transparent: true, depthWrite: false, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor }));
  ring.position.set(0, Y(560), 0); sA.add(ring);
  const ring2 = ring.clone(); ring2.material = ring.material.clone(); ring2.position.set(0, Y(1000), 0); sA.add(ring2);

  // ===== scène de la rue
  const sB = new THREE.Scene();
  sB.background = new THREE.Color(0x07080d);
  sB.fog = new THREE.Fog(0x07080d, 14, 34);
  const camB = new THREE.PerspectiveCamera(50, W / H, .1, 80); sB.add(camB);
  sB.add(new THREE.HemisphereLight(0x5a6a90, 0x120c08, .55));
  const moon = new THREE.DirectionalLight(0x8fa4d8, .5); moon.position.set(-6, 10, 8); sB.add(moon);
  const street = new THREE.Mesh(new THREE.PlaneGeometry(80, 30), new THREE.MeshStandardMaterial({ color: 0x0c0b0d, roughness: .32, metalness: .35 }));
  street.rotation.x = -Math.PI / 2; street.position.set(0, 0, 8); sB.add(street);
  const walk = new THREE.Mesh(new THREE.BoxGeometry(80, .22, 3.2), new THREE.MeshStandardMaterial({ color: 0x2a2624, roughness: .85 }));
  walk.position.set(0, .11, 1.6); sB.add(walk);
  const SH = [
    { x: -11, label: 'RESTAURANT', bg: ['#6b2412', '#3c1208'], ink: '#ff9a4a', wall: 0x2e211b, kind: 'restaurant', awn: true },
    { x: 0, label: 'COIFFEUR', bg: ['#203654', '#101c30'], ink: '#7fb4ff', wall: 0x1f252d, kind: 'coiffeur' },
    { x: 11, label: 'MENUISERIE', bg: ['#244534', '#10241a'], ink: '#8fe0a8', wall: 0x2a2620, kind: 'menuiserie' }
  ];
  const glowMat = (c) => new THREE.MeshBasicMaterial({ color: c, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .5 });
  const glowTex = canvasTex(256, 256, (x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  const glow = (c, s, o) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ map: glowTex, color: c, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: o })); return m; };
  SH.forEach((s, i) => {
    const g = new THREE.Group(); g.position.x = s.x; sB.add(g);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(8.6, 7.4, .6), new THREE.MeshStandardMaterial({ color: s.wall, roughness: .9 }));
    wall.position.set(0, 3.7, -.3); g.add(wall);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.65), new THREE.MeshBasicMaterial({ map: windowTex(s.kind, 31 + i) }));
    win.position.set(-1.05, 1.95, .02); g.add(win);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(4.85, 2.9, .1), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: .5, metalness: .6 }));
    frame.position.set(-1.05, 1.95, -.08); g.add(frame);
    const door = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.7), new THREE.MeshStandardMaterial({ color: 0x1a120d, roughness: .7 }));
    door.position.set(2.55, 1.35, .02); g.add(door);
    const dglass = new THREE.Mesh(new THREE.PlaneGeometry(.9, 1.4), new THREE.MeshBasicMaterial({ color: 0xffc27a }));
    dglass.position.set(2.55, 1.75, .03); g.add(dglass);
    const sign = new THREE.Mesh(new THREE.BoxGeometry(6.4, 1.12, .16), [0, 1, 2, 3].map(() => new THREE.MeshStandardMaterial({ color: 0x111111 })).concat([new THREE.MeshBasicMaterial({ map: signTex(s.label, s.bg, s.ink) }), new THREE.MeshStandardMaterial({ color: 0x111111 })]));
    sign.position.set(0, 4.05, .12); g.add(sign);
    const sg = glow(new THREE.Color(s.ink), 9, .22); sg.position.set(0, 4.05, .3); sg.scale.y = .45; g.add(sg);
    const wg = glow(0xffb36b, 7, .3); wg.position.set(-1.05, 1.9, .4); wg.scale.y = .6; g.add(wg);
    for (let k = 0; k < 2; k++) {
      const up = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.4), new THREE.MeshBasicMaterial({ color: k === i % 2 ? 0x5a3a20 : 0x1a1612 }));
      up.position.set(-2 + k * 4, 5.9, .02); g.add(up);
    }
    if (s.awn) {
      const at = canvasTex(512, 64, (x, w, h) => { for (let j = 0; j < 16; j++) { x.fillStyle = j % 2 ? '#f1e6d6' : '#8f2a14'; x.fillRect(j * 32, 0, 32, h); } });
      const aw = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 1.2), new THREE.MeshStandardMaterial({ map: at, roughness: .8, side: THREE.DoubleSide }));
      aw.position.set(-1.05, 3.25, .65); aw.rotation.x = -.95; g.add(aw);
    }
    const pl = new THREE.PointLight(0xffa860, 14, 9, 1.6); pl.position.set(-1, 2.4, 1.6); g.add(pl);
    // reflet mouillé de la vitrine et de l'enseigne
    const r1 = glow(0xffa860, 4, .16); r1.rotation.x = -Math.PI / 2; r1.scale.set(.7, 3.2, 1); r1.position.set(-1.05, .02, 4.2); g.add(r1);
    const r2 = glow(new THREE.Color(s.ink), 4, .12); r2.rotation.x = -Math.PI / 2; r2.scale.set(1.1, 3.0, 1); r2.position.set(0, .02, 5.6); g.add(r2);
  });
  [-5.5, 5.5].forEach((x) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.07, .09, 5.4, 10), new THREE.MeshStandardMaterial({ color: 0x1d1d22, metalness: .6, roughness: .4 }));
    pole.position.set(x, 2.7, 2.8); sB.add(pole);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.24, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffe2b0 }));
    head.position.set(x, 5.45, 2.8); sB.add(head);
    const hg = glow(0xffc884, 3.4, .6); hg.position.set(x, 5.45, 2.9); sB.add(hg);
    const rl = glow(0xffc884, 3, .14); rl.rotation.x = -Math.PI / 2; rl.scale.set(.4, 4, 1); rl.position.set(x, .03, 6.5); sB.add(rl);
  });

  // ----- téléphone (enfant de la caméra de la rue)
  const phone = new THREE.Group(); camB.add(phone);
  const PW = 2.18, PH = 4.62, PR = .34;
  const shape = new THREE.Shape();
  shape.moveTo(-PW / 2 + PR, -PH / 2); shape.lineTo(PW / 2 - PR, -PH / 2); shape.quadraticCurveTo(PW / 2, -PH / 2, PW / 2, -PH / 2 + PR);
  shape.lineTo(PW / 2, PH / 2 - PR); shape.quadraticCurveTo(PW / 2, PH / 2, PW / 2 - PR, PH / 2); shape.lineTo(-PW / 2 + PR, PH / 2);
  shape.quadraticCurveTo(-PW / 2, PH / 2, -PW / 2, PH / 2 - PR); shape.lineTo(-PW / 2, -PH / 2 + PR); shape.quadraticCurveTo(-PW / 2, -PH / 2, -PW / 2 + PR, -PH / 2);
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: .2, bevelEnabled: true, bevelSize: .045, bevelThickness: .05, bevelSegments: 4, curveSegments: 10 }),
    new THREE.MeshStandardMaterial({ color: 0x1b1c20, metalness: .75, roughness: .3 }));
  body.position.z = -.22; phone.add(body);
  const keyL = new THREE.DirectionalLight(0xbfd2ff, 1.4); keyL.position.set(-3, 4, 3); camB.add(keyL);
  // écran : grille de triangles (pour la casse), texture redessinée à chaque image
  const SW = 1.98, SHh = 4.29, scr = document.createElement('canvas'); scr.width = 540; scr.height = 1170;
  const sctx = scr.getContext('2d'); const stex = new THREE.CanvasTexture(scr); stex.colorSpace = THREE.SRGBColorSpace;
  const shard = (() => {
    const r = rnd(5), C = 7, R = 15, pts = [];
    for (let j = 0; j <= R; j++) for (let i = 0; i <= C; i++) {
      const edge = i === 0 || j === 0 || i === C || j === R;
      pts.push([(i / C - .5) * SW + (edge ? 0 : (r() - .5) * SW / C * .7), (j / R - .5) * SHh + (edge ? 0 : (r() - .5) * SHh / R * .7)]);
    }
    const P = [], UV = [], CEN = [], VEL = [], AX = [];
    const IMP = [.12, .42];
    const tri = (a, b, c) => {
      const cx = (a[0] + b[0] + c[0]) / 3, cy = (a[1] + b[1] + c[1]) / 3;
      const dx = cx - IMP[0], dy = cy - IMP[1], d = Math.hypot(dx, dy) + .2;
      const v = [dx / d * (1.5 + r() * 2.5), dy / d * (1.5 + r() * 2.5) - .5, 3 + r() * 6];
      const ax = [r() - .5, r() - .5, r() - .5]; const al = Math.hypot(...ax); ax.forEach((_, k) => { ax[k] /= al; });
      const w = (r() - .5) * 14, delay = d * .045;
      [a, b, c].forEach((p) => { P.push(p[0], p[1], 0); UV.push(p[0] / SW + .5, p[1] / SHh + .5); CEN.push(cx, cy, delay); VEL.push(...v); AX.push(...ax, w); });
    };
    for (let j = 0; j < R; j++) for (let i = 0; i < C; i++) {
      const a = pts[j * (C + 1) + i], b = pts[j * (C + 1) + i + 1], c = pts[(j + 1) * (C + 1) + i], d = pts[(j + 1) * (C + 1) + i + 1];
      tri(a, b, d); tri(a, d, c);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2));
    g.setAttribute('aCen', new THREE.Float32BufferAttribute(CEN, 3)); g.setAttribute('aVel', new THREE.Float32BufferAttribute(VEL, 3)); g.setAttribute('aAx', new THREE.Float32BufferAttribute(AX, 4));
    const m = new THREE.ShaderMaterial({
      uniforms: { map: { value: stex }, uB: { value: 0 } }, transparent: true, side: THREE.DoubleSide,
      vertexShader: `uniform float uB; attribute vec3 aCen; attribute vec3 aVel; attribute vec4 aAx; varying vec2 vUv; varying float vA; varying float vEdge;
        vec3 rot(vec3 v, vec3 k, float a){ return v * cos(a) + cross(k, v) * sin(a) + k * dot(k, v) * (1.0 - cos(a)); }
        void main(){ vUv = uv; float t = max(uB - aCen.z, 0.0);
          vec3 c = vec3(aCen.xy, 0.0); vec3 l = position - c;
          vec3 p = c + aVel * t + vec3(0.0, -4.0 * t * t, 0.0) + rot(l, aAx.xyz, aAx.w * t);
          vA = 1.0 - smoothstep(.35, .8, t); vEdge = step(.001, t);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
      fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vA; varying float vEdge;
        void main(){ vec3 c = texture2D(map, vUv).rgb; c = mix(c, c * .7 + vec3(.25, .3, .38), vEdge * .35); gl_FragColor = vec4(c, vA); }`
    });
    const mesh = new THREE.Mesh(g, m); mesh.position.z = .04; mesh.renderOrder = 2; return mesh;
  })();
  phone.add(shard);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(.055, 24), new THREE.MeshBasicMaterial({ color: 0x050505 }));
  lens.position.set(0, SHh / 2 - .14, .05); phone.add(lens);

  // ----- dessin de l'écran du téléphone (moteur de recherche générique, sans marque)
  const UIF = '"Cabinet Grotesk", "Helvetica Neue", Arial, sans-serif';
  function rr(x, X, Yy, w, h, r) { x.beginPath(); x.moveTo(X + r, Yy); x.arcTo(X + w, Yy, X + w, Yy + h, r); x.arcTo(X + w, Yy + h, X, Yy + h, r); x.arcTo(X, Yy + h, X, Yy, r); x.arcTo(X, Yy, X + w, Yy, r); x.closePath(); }
  function loupe(x, X, Yy, s, col) { x.strokeStyle = col; x.lineWidth = s * .14; x.beginPath(); x.arc(X, Yy, s * .38, 0, 7); x.stroke(); x.beginPath(); x.moveTo(X + s * .27, Yy + s * .27); x.lineTo(X + s * .55, Yy + s * .55); x.stroke(); }
  const QUERY = 'restaurant ce soir';
  function drawScreen(t) {
    const x = sctx, w = scr.width, h = scr.height;
    x.fillStyle = '#f6f5f2'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#1b1b1f'; x.font = `600 26px ${UIF}`; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText('18:42', 40, 44);
    x.fillRect(w - 92, 34, 46, 22); x.fillRect(w - 44, 40, 4, 10); x.fillStyle = '#f6f5f2'; x.fillRect(w - 88, 38, 14, 14);
    const typed = QUERY.slice(0, Math.round(clamp((t - 4.75) / .8) * QUERY.length));
    const searched = t >= 5.62;
    rr(x, 30, 110, w - 60, 86, 43); x.fillStyle = '#ffffff'; x.fill(); x.strokeStyle = '#d9d6cf'; x.lineWidth = 3; x.stroke();
    loupe(x, 82, 152, 40, '#6d6a64');
    x.fillStyle = typed ? '#1b1b1f' : '#9a968e'; x.font = `500 34px ${UIF}`; x.fillText(typed || 'Rechercher', 122, 154);
    if (!searched && Math.floor(t * 2.6) % 2 === 0) { const tw = x.measureText(typed).width; x.fillStyle = '#e8622a'; x.fillRect(124 + tw + 3, 132, 3, 44); }
    if (!searched) {
      const sug = ['restaurant ce soir près de moi', 'restaurant ouvert maintenant', 'réserver une table ce soir'];
      sug.forEach((s, i) => { if (typed.length < 4 + i * 3) return; x.fillStyle = '#5a574f'; x.font = `500 30px ${UIF}`; loupe(x, 64, 270 + i * 84, 28, '#b3afa6'); x.fillText(s, 104, 272 + i * 84); x.fillStyle = '#e6e2da'; x.fillRect(40, 312 + i * 84, w - 80, 2); });
      return;
    }
    const lp = clamp((t - 5.62) / .3);
    if (lp < 1) { x.fillStyle = '#e6e2da'; x.fillRect(0, 214, w, 6); x.fillStyle = '#e8622a'; x.fillRect(0, 214, w * easeOut(lp), 6); return; }
    // page vide
    const a = smooth(5.92, 6.1, t);
    x.globalAlpha = a;
    x.fillStyle = '#ece9e2'; x.beginPath(); x.arc(w / 2, 520, 120, 0, 7); x.fill();
    loupe(x, w / 2 - 12, 508, 120, '#a29e95');
    x.strokeStyle = '#d2452a'; x.lineWidth = 12; x.beginPath(); x.moveTo(w / 2 + 52, 440); x.lineTo(w / 2 + 112, 500); x.moveTo(w / 2 + 112, 440); x.lineTo(w / 2 + 52, 500); x.stroke();
    x.textAlign = 'center'; x.fillStyle = '#1b1b1f'; x.font = `800 50px ${UIF}`; x.fillText('Aucun site trouvé', w / 2, 730);
    x.fillStyle = '#7c786f'; x.font = `500 30px ${UIF}`; x.fillText('0 résultat pour', w / 2, 800); x.fillText('« ' + QUERY + ' »', w / 2, 842);
    x.globalAlpha = 1;
    // fissures
    const cr = smooth(6.42, 6.6, t);
    if (cr > 0) {
      const r = rnd(77), ix = w * (.5 + .12 / SW), iy = h * (.5 - .42 / SHh);
      x.strokeStyle = 'rgba(255,255,255,.95)'; x.lineCap = 'round';
      for (let k = 0; k < 13; k++) {
        let px = ix, py = iy, ang = k / 13 * Math.PI * 2 + r() * .4; x.lineWidth = 2.6;
        x.beginPath(); x.moveTo(px, py);
        const len = (260 + r() * 520) * cr, st = 9;
        for (let s = 0; s < st; s++) { ang += (r() - .5) * .5; px += Math.cos(ang) * len / st; py += Math.sin(ang) * len / st; x.lineTo(px, py); }
        x.stroke();
      }
      x.fillStyle = `rgba(255,255,255,${.5 * cr})`; x.beginPath(); x.arc(ix, iy, 26 * cr, 0, 7); x.fill();
    }
  }

  // ------------------------------------------------------------------ rendu à l'instant t
  function renderAt(t) {
    if (t >= 3.0 && t < 7.25) {
      // montage des trois commerces puis le téléphone
      const shots = [[3.0, 3.5, 0], [3.62, 4.05, 1], [4.17, 7.25, 2]];
      let x, z, y = 2.3;
      if (t < 3.5) { const k = easeOut((t - 3.0) / .5); x = SH[0].x - .9 + k * .6; z = 14.2 - k * 1.8; }
      else if (t < 3.62) { const k = easeInOut((t - 3.5) / .12); x = lerp(SH[0].x - .3, SH[1].x - .9, k); z = 12.4; }
      else if (t < 4.05) { const k = easeOut((t - 3.62) / .43); x = SH[1].x - .9 + k * .6; z = 14.2 - k * 1.8; }
      else if (t < 4.17) { const k = easeInOut((t - 4.05) / .12); x = lerp(SH[1].x - .3, SH[2].x - .9, k); z = 12.4; }
      else { const k = easeOut((t - 4.17) / 1.2); x = SH[2].x - .9 + k * .8; z = 14.2 - k * 2.4; }
      camB.position.set(x, y + Math.sin(t * 7) * .015, z); camB.lookAt(x + .1, 2.9, 0);
      // téléphone : monte dans le cadre, recherche, page vide, casse
      const up = easeOut((t - 4.5) / .55), fall = clamp((t - 6.66) / .55);
      phone.visible = t > 4.45;
      phone.position.set(.05 + Math.sin(t * 1.3) * .03, lerp(-6.4, .38, up) - fall * fall * 5, -7.6 + up * .3);
      phone.rotation.set(lerp(.35, -.05, up) + fall * .9, lerp(-.25, .1, up) + Math.sin(t * .9) * .04, lerp(.12, -.02, up) + fall * .4);
      shard.material.uniforms.uB.value = Math.max(0, t - 6.66);
      body.visible = fall < .98;
      if (phone.visible) { drawScreen(t); stex.needsUpdate = true; }
      sB.fog.near = lerp(16, 7, smooth(4.5, 5.2, t)); sB.fog.far = lerp(36, 19, smooth(4.5, 5.2, t));
      renderer.render(sB, camB);
      return;
    }
    // scène des braises
    const U = amb.material.uniforms;
    U.uTime.value = t;
    U.uAmb.value = t < 3 ? smooth(.5, 1.2, t) * .55 * (1 - smooth(2.7, 3.0, t)) : smooth(7.3, 8.6, t) * (t > 31 ? 1.15 : .9);
    U.uSwirl.value = smooth(31.1, 32.6, t);
    U.uRise.value = smooth(8.8, 9.6, t) * (1 - smooth(10.0, 10.6, t));
    // étincelle qui monte puis explose
    const k = clamp((t - .05) / .4), pos = sp.geometry.attributes.position, n = pos.count;
    for (let i = 0; i < n; i++) { const kk = Math.max(0, k - i * .006); const e = 1 - Math.pow(1 - kk, 2.2); pos.setXYZ(i, Math.sin(e * 3.2) * .35 * (1 - e), lerp(-6.2, Y(560), e), 0); }
    pos.needsUpdate = true; sp.material.uniforms.uOn.value = t > .05 && t < .47 ? 1 : 0;
    b1.material.uniforms.uT.value = t < .45 ? -1 : t - .45;
    b1.material.uniforms.uGain.value = 1 - smooth(2.6, 3.0, t);
    b2.material.uniforms.uT.value = t < T200 ? -1 : t - T200;
    b2.material.uniforms.uGain.value = 1 - smooth(30.6, 31.1, t);
    const rk = clamp((t - .45) / .7); ring.scale.setScalar(.2 + easeOut(rk) * 4.2); ring.material.opacity = t > .45 ? (1 - rk) * .9 : 0;
    const rk2 = clamp((t - T200) / .7); ring2.scale.setScalar(.2 + easeOut(rk2) * 4.6); ring2.material.opacity = t > T200 ? (1 - rk2) * .8 : 0;
    camA.position.set(Math.sin(t * .3) * .2, Math.cos(t * .23) * .12, 10); camA.lookAt(0, 0, 0);
    renderer.render(sA, camA);
  }
  return { renderAt, renderer };
}
