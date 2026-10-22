// Capture déterministe du site (horloge simulée) : défilement scénarisé, image par image, 30 i/s.
// Usage : node capture.cjs <dossier_sortie> [nb_images_max]
const { chromium } = require('/home/user/Claude-code-dashboard-/site/scalify/node_modules/playwright');
const fs = require('fs');
const OUT = process.argv[2]; const MAX = +(process.argv[3] || 1e9);
fs.mkdirSync(OUT, { recursive: true });
const FPS = 30, DUR = 18.6;
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2.5, hasTouch: true, ignoreHTTPSErrors: true });
  const map = require(__dirname + '/cdn/map.json');
  await ctx.route(/^https:\/\//, (route) => { const u = route.request().url(); const f = map[u]; if (!f) return route.abort(); const ct = u.includes('.js') ? 'application/javascript' : u.includes('fonts.googleapis') ? 'text/css' : 'font/woff2'; route.fulfill({ status: 200, body: fs.readFileSync(__dirname + '/' + f), headers: { 'content-type': ct, 'access-control-allow-origin': '*' } }); });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://127.0.0.1:4500/index.html?capture', { waitUntil: 'load' });
  for (let i = 0; i < 200; i++) { const ok = await p.evaluate(() => !!(window.TISON && window.TISON.ready) && document.fonts.status === 'loaded'); if (ok) break; await new Promise((r) => setTimeout(r, 150)); }
  await new Promise((r) => setTimeout(r, 1500));
  await p.evaluate(() => { ScrollTrigger.refresh(); window.TISON.measure(); });
  await p.evaluate(() => { const T = window.TISON; gsap.ticker.remove(gsap.updateRoot); T.base = gsap.ticker.time + 0.5; gsap.updateRoot(T.base); T.intro(); });
  const L = await p.evaluate(() => {
    const top = (s) => document.querySelector(s).getBoundingClientRect().top + scrollY;
    const plats = [...document.querySelectorAll('.plat')].map((e) => e.getBoundingClientRect().top + scrollY);
    const g = document.querySelector('.galerie');
    return { vh: innerHeight, heroEnd: document.querySelector('.hero').offsetHeight - innerHeight, hist: top('#histoire'), carte: top('#carte'), plats, gal: top('.galerie'), galH: g.offsetHeight, avis: top('#avis'), resa: top('#reserver'), form: top('#resa'), go: top('#resa-go'), max: document.documentElement.scrollHeight - innerHeight };
  });
  console.log(JSON.stringify(L));
  const galY = (gg) => L.gal + (gg / 5) * (L.galH - L.vh);
  const K = [
    [0, 0], [2.8, 0], [5.2, L.heroEnd + 40], [6.2, L.carte + 60],
    [7.4, L.plats[1] - 170], [8.4, L.plats[3] - 170], [9.2, L.plats[4] - 120],
    [10.0, galY(-0.1)], [11.2, galY(1.0)], [12.2, galY(2.1)],
    [13.0, L.avis + 30], [13.7, L.avis + 60], [14.2, L.go - L.vh * 0.52], [DUR, L.go - L.vh * 0.52]
  ];
  const ease = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const yAt = (t) => { for (let i = 0; i < K.length - 1; i++) { const [t0, y0] = K[i], [t1, y1] = K[i + 1]; if (t <= t1) return y0 + (y1 - y0) * ease(Math.max(0, (t - t0) / (t1 - t0))); } return K[K.length - 1][1]; };
  const TAP = 14.35;
  const meta = { fps: FPS, dur: DUR, tap: TAP, layout: L, keys: K };
  const NF = Math.min(MAX, Math.round(DUR * FPS));
  const cdp = await ctx.newCDPSession(p);
  const t0 = Date.now();
  for (let f = 0; f < NF; f++) {
    const t = f / FPS;
    const T0 = Date.now();
    if (Math.abs(t - TAP) < 0.5 / FPS) {
      meta.button = await p.evaluate(() => { const r = document.getElementById('resa-go').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
      await p.evaluate(() => document.getElementById('resa').requestSubmit());
    }
    const sy = await p.evaluate(({ y, t }) => new Promise((res) => {
      const T = window.TISON;
      window.scrollTo(0, y); ScrollTrigger.update();
      gsap.updateRoot(T.base + t);
      T.tick(0, 1000 / 30);
      T.frame(t + 3);
      for (const a of document.getAnimations()) { if (a._t0 === undefined) { a._t0 = t; a.pause(); } a.currentTime = (t - a._t0) * 1000; }
      requestAnimationFrame(() => requestAnimationFrame(() => res(window.scrollY)));
    }), { y: Math.round(yAt(t)), t });
    const T3 = Date.now();
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 93, fromSurface: true, clip: { x: 0, y: sy, width: 390, height: 844, scale: 2.5 } });
    fs.writeFileSync(`${OUT}/f${String(f).padStart(4, '0')}.jpg`, Buffer.from(data, 'base64'));
    if (process.env.PROF) console.log('step', T3 - T0, 'shot', Date.now() - T3);
    if (f % 30 === 0) console.log('frame', f, ((Date.now() - t0) / (f + 1) / 1000).toFixed(2) + ' s/img');
  }
  fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify(meta, null, 1));
  console.log('errors', errs.join(' | '));
  await b.close();
})();
