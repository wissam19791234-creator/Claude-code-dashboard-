// Point d'entrée : construit le monde 3D une fois les polices prêtes, puis rend chaque temps demandé.
import { buildWorld } from './world.js';
const root = document.getElementById('root');
const W = +root.dataset.width, H = +root.dataset.height;
window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
let world = null, pending = null;
window.addEventListener('hf-seek', e => { if (world) world.renderAt(e.detail.time); else pending = e.detail.time; });
window.__hf.buildReady['scalify-iso-world'] = (async () => {
  await Promise.all([document.fonts.load('400 80px "Anton"'), document.fonts.load('500 40px "JBM"')]);
  world = buildWorld(document.getElementById('gl'), W, H);
  window.__isoWorld = world;
  world.renderAt(pending ?? window.__hfThreeTime ?? 0);
})();
