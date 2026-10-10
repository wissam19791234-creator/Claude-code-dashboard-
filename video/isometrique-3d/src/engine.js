// Moteur de rendu « ligne claire » isométrique : cel-shading + contours encre + papier quadrillé.
// Tout est piloté par le temps HyperFrames (aucune horloge) : renderFrame() rend exactement l'état demandé.
import * as THREE from 'three';

export const ISO_EL = Math.atan(1 / Math.SQRT2); // 35.264° : élévation isométrique exacte
export const ISO_AZ = Math.PI / 4;               // 45°

export const C = {
  cream: '#f3eadb', ink: '#161311', paper: '#fffaf1', sky: '#dceeff', mint: '#55db9c', lavender: '#e9ccff',
  ember: '#fb4903', sun: '#f6b431', yellow: '#ffd731', violet: '#5c4ade', blue: '#4da2ff', white: '#ffffff',
};

// Dégradé toon : 3 paliers (ombre / face gauche / dessus).
function toonRamp() {
  const n = 64, data = new Uint8Array(n * 4);
  for (let i = 0; i < n; i++) {
    const x = i / (n - 1); // = dotNL*0.5+0.5
    const v = x < 0.5 ? 0 : x < 0.84 ? 0.5 : 1;
    data.set([v * 255, v * 255, v * 255, 255], i * 4);
  }
  const t = new THREE.DataTexture(data, n, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true;
  return t;
}
const RAMP = toonRamp();
const matCache = new Map();
export function toon(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!opts.unique && matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshToonMaterial({ color, gradientMap: RAMP, ...opts.params });
  if (!opts.unique) matCache.set(key, m);
  return m;
}

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const COMPOSITE = `
precision highp float;
varying vec2 vUv;
uniform sampler2D tColor; uniform sampler2D tNormal; uniform sampler2D tDepth;
uniform vec2 res; uniform float lineW; uniform float boil; uniform float time;
uniform vec3 ink; uniform vec3 paperA; uniform vec3 paperB; uniform vec3 dotCol;
uniform vec3 camT; uniform vec3 camR; uniform vec3 camU; uniform vec3 camF; uniform vec2 halfView; uniform float gridY;
uniform float depthThr; uniform float creaseK; uniform float zoom; uniform float near; uniform float far; uniform float vignette; uniform float fade; uniform vec3 fadeCol;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }

// Grille de points isométrique posée sur un plan horizontal (y = gridY), multi-échelle pour le zoom infini.
float dotsAt(vec2 g, float spacing, float radiusPx, float pxPerUnit){
  vec2 q = g / spacing; vec2 f = fract(q) - 0.5;
  // distance en unités monde -> pixels (approx. isotrope)
  float d = length(f * spacing) * pxPerUnit;
  return 1.0 - smoothstep(radiusPx - 0.8, radiusPx + 0.8, d);
}

void main(){
  vec2 uv = vUv;
  vec4 col = texture2D(tColor, uv);
  float dC = texture2D(tDepth, uv).r;

  // --- contours : silhouettes (laplacien de profondeur, côté objet) + plis (normales) sur 6 axes ---
  float jit = boil * (noise(uv * 9.0 + floor(time * 10.0) * 7.31) - 0.5);
  float r = lineW + jit;
  vec3 nC = texture2D(tNormal, uv).xyz * 2.0 - 1.0;
  float isObj = step(dC, 0.999999);
  float sil = 0.0, cre = 0.0;
  for (int i = 0; i < 6; i++) {
    float a = float(i) * 0.5235988;
    vec2 o = vec2(cos(a), sin(a)) * r / res;
    float dP = texture2D(tDepth, uv + o).r;
    float dM = texture2D(tDepth, uv - o).r;
    sil += step(depthThr, dP + dM - 2.0 * dC) * isObj;
    vec2 o2 = o * 0.55;
    vec3 nP = texture2D(tNormal, uv + o2).xyz * 2.0 - 1.0;
    vec3 nM = texture2D(tNormal, uv - o2).xyz * 2.0 - 1.0;
    float okP = step(texture2D(tDepth, uv + o2).r, 0.999999);
    float okM = step(texture2D(tDepth, uv - o2).r, 0.999999);
    cre += max(step(dot(nC, nP), 0.82) * okP, step(dot(nC, nM), 0.82) * okM) * isObj;
  }
  float edge = max(smoothstep(0.3, 2.2, sil), smoothstep(0.5, 2.6, cre) * creaseK);

  // --- fond papier ---
  vec2 s = (uv - 0.5) * 2.0 * halfView;           // coordonnées écran en unités monde
  vec3 P0 = camT + camR * s.x + camU * s.y;       // point sur le plan image passant par la cible
  float t = (gridY - P0.y) / camF.y;              // intersection avec le plan y = gridY
  vec3 G = P0 + camF * t;
  float pxPerUnit = res.y / (2.0 * halfView.y);
  float lz = log2(max(pxPerUnit, 1e-3) / 60.0) / 2.0; // un palier tous les x4
  float lvl = floor(lz); float fr = lz - lvl;
  float sp1 = 0.5 * pow(4.0, -lvl);
  float g1 = dotsAt(G.xz, sp1, 2.2, pxPerUnit) * (1.0 - smoothstep(0.55, 1.0, fr));
  float g2 = dotsAt(G.xz, sp1 * 0.25, 2.2, pxPerUnit) * smoothstep(0.0, 0.45, fr);
  vec2 pc = (uv - 0.5) * vec2(res.x / res.y, 1.0);
  vec3 bg = mix(paperA, paperB, smoothstep(0.15, 0.95, length(pc) * 1.1));
  bg = mix(bg, dotCol, clamp(g1 + g2, 0.0, 1.0) * 0.55);
  // fibres du papier (statiques) + grain très léger (10 i/s)
  float fib = noise(uv * res / 3.0) * 0.6 + noise(uv * res / 11.0) * 0.4;
  bg *= 0.985 + 0.03 * fib;

  vec3 c = mix(bg, col.rgb / max(col.a, 1e-4), col.a);
  c = mix(c, ink, edge);
  float gr = hash(uv * res + floor(time * 10.0) * 13.7) - 0.5;
  c += gr * 0.018;
  c *= 1.0 - vignette * smoothstep(0.45, 1.05, length(pc));
  c = mix(c, fadeCol, fade);
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}`;

export function createEngine(canvas, W, H) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;

  const rtColor = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
  const depthTexture = new THREE.DepthTexture(W, H);
  depthTexture.type = THREE.FloatType;
  const rtNormal = new THREE.WebGLRenderTarget(W, H, { depthTexture, type: THREE.HalfFloatType });
  const normalMat = new THREE.MeshNormalMaterial();

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 400);
  scene.add(camera);

  // Lumières : dessus = couleur de marque, face gauche = palier moyen, face droite = ombre teintée lavande.
  const hemi = new THREE.HemisphereLight('#ffffff', '#9d8bc9', 1.6);
  scene.add(hemi);
  const sunLight = new THREE.DirectionalLight('#fff4e2', 1.66);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.bias = -0.0004;
  sunLight.shadow.normalBias = 0.02;
  sunLight.shadow.radius = 3;
  scene.add(sunLight); scene.add(sunLight.target);
  const LIGHT_DIR = new THREE.Vector3(-0.42, 1.0, 0.62).normalize();

  const uniforms = {
    tColor: { value: rtColor.texture }, tNormal: { value: rtNormal.texture }, tDepth: { value: depthTexture },
    res: { value: new THREE.Vector2(W, H) }, lineW: { value: 2.6 * Math.min(W, H) / 1080 }, boil: { value: 0.0 }, time: { value: 0 },
    ink: { value: new THREE.Color(C.ink) }, paperA: { value: new THREE.Color('#f7f0e4') }, paperB: { value: new THREE.Color('#ecdfc9') },
    dotCol: { value: new THREE.Color('#cdbb9f') },
    camT: { value: new THREE.Vector3() }, camR: { value: new THREE.Vector3() }, camU: { value: new THREE.Vector3() }, camF: { value: new THREE.Vector3() },
    halfView: { value: new THREE.Vector2(1, 1) }, depthThr: { value: 0.0002 }, creaseK: { value: 0.9 }, gridY: { value: -6 }, zoom: { value: 1 }, near: { value: 0.1 }, far: { value: 400 },
    vignette: { value: 0.10 }, fade: { value: 0 }, fadeCol: { value: new THREE.Color(C.cream) },
  };
  const quadMat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: COMPOSITE, uniforms, depthTest: false, depthWrite: false });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), quadMat);
  const quadScene = new THREE.Scene(); quadScene.add(quad);
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const aspect = W / H;
  const tmpF = new THREE.Vector3();

  // Caméra orthographique : cible, azimut, élévation, demi-hauteur visible (unités monde), roulis.
  function setCamera({ target, az = ISO_AZ, el = ISO_EL, half = 6, roll = 0, dist = 120 }) {
    const dir = new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
    camera.position.copy(target).addScaledVector(dir, dist);
    camera.up.set(0, 1, 0);
    camera.lookAt(target);
    if (roll) camera.rotateZ(roll);
    camera.left = -half * aspect; camera.right = half * aspect; camera.top = half; camera.bottom = -half;
    camera.near = 0.1; camera.far = dist * 2 + 60;
    camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    // ombre : cadre serré sur la zone visible
    const span = half * Math.max(1, aspect) * 1.9 + 2;
    sunLight.position.copy(target).addScaledVector(LIGHT_DIR, 60);
    sunLight.target.position.copy(target);
    const sc = sunLight.shadow.camera;
    sc.left = -span; sc.right = span; sc.top = span; sc.bottom = -span; sc.near = 1; sc.far = 160;
    sc.updateProjectionMatrix();
    const e = camera.matrixWorld.elements;
    uniforms.camR.value.set(e[0], e[1], e[2]);
    uniforms.camU.value.set(e[4], e[5], e[6]);
    camera.getWorldDirection(tmpF); uniforms.camF.value.copy(tmpF);
    uniforms.camT.value.copy(target);
    uniforms.halfView.value.set(half * aspect, half);
    uniforms.near.value = camera.near; uniforms.far.value = camera.far;
    const worldPerPx = (2 * half) / H, oWorld = uniforms.lineW.value * worldPerPx;
    uniforms.depthThr.value = (0.035 + 0.9 * oWorld) / (camera.far - camera.near);
  }

  function renderFrame(time) {
    uniforms.time.value = time;
    renderer.shadowMap.needsUpdate = true;
    renderer.setRenderTarget(rtColor);
    renderer.setClearColor(0x000000, 0); renderer.clear();
    renderer.render(scene, camera);
    // passe normales + profondeur (sans ombres)
    const ov = scene.overrideMaterial; scene.overrideMaterial = normalMat;
    renderer.setRenderTarget(rtNormal);
    renderer.setClearColor(0x000000, 0); renderer.clear();
    renderer.render(scene, camera);
    scene.overrideMaterial = ov;
    renderer.setRenderTarget(null);
    renderer.render(quadScene, quadCam);
  }

  return { THREE, renderer, scene, camera, uniforms, setCamera, renderFrame, sunLight, hemi, aspect, W, H };
}
