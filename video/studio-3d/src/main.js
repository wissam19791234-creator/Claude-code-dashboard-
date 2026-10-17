// Point d'entrée : construit le studio une fois la police prête, puis rend chaque temps demandé par HyperFrames.
import { buildWorld } from './world.js';
const root = document.getElementById('root');
const W = +root.dataset.width, H = +root.dataset.height;
window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
let world = null, pending = null;
window.addEventListener('hf-seek', (e) => { if (world) world.renderAt(e.detail.time); else pending = e.detail.time; });
window.__hf.buildReady['scalify-studio'] = (async () => {
  await Promise.all(['600', '700', '800'].map((w) => document.fonts.load(`${w} 60px "Inter Tight"`)));
  world = buildWorld(document.getElementById('gl'), W, H);
  window.__studio = world;
  world.renderAt(pending ?? window.__hfThreeTime ?? 0);
})();
