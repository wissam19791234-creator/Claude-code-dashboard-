// Point d'entrée 3D : construit le monde une fois les polices prêtes (elles servent aux textures des cartes), puis rend chaque instant demandé.
import { buildWorld } from './world.js';
const root = document.getElementById('root');
const W = +root.dataset.width, H = +root.dataset.height;
window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
let world = null, pending = null;
window.addEventListener('hf-seek', (e) => { if (world) world.renderAt(e.detail.time); else pending = e.detail.time; });
window.__hf.buildReady['ghost-3d'] = (async () => {
  await Promise.all(['700 80px "Fredoka"', '600 60px "Fredoka"', '500 40px "Fredoka"', '700 60px "Comic Neue"'].map((f) => document.fonts.load(f)));
  world = buildWorld(document.getElementById('gl'), W, H);
  window.__world = world;
  world.renderAt(pending ?? window.__hfThreeTime ?? 0);
})();
