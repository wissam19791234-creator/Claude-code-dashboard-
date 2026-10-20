// Point d'entrée 3D : construit le monde une fois les polices prêtes, puis rend chaque temps demandé par HyperFrames.
import { buildWorld } from './world.js';
const root = document.getElementById('root');
const W = +root.dataset.width, H = +root.dataset.height;
window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
let world = null, pending = null;
window.addEventListener('hf-seek', (e) => { if (world) world.renderAt(e.detail.time); else pending = e.detail.time; });
window.__hf.buildReady['halloween-3d'] = (async () => {
  await Promise.all([document.fonts.load('80px "Luckiest Guy"'), document.fonts.load('60px "Patrick Hand"')]);
  world = buildWorld(document.getElementById('gl'), W, H);
  window.__world = world;
  world.renderAt(pending ?? window.__hfThreeTime ?? 0);
})();
