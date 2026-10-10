// Rendu image par image : node render.js <dossier> [t1,t2,...]   (VERT=1 → 1080×1920, SHARD=k/n)
const { chromium } = require(process.env.PW || 'playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const [,, outDir, only] = process.argv;
const VERT = !!process.env.VERT, W = VERT ? 1080 : 1920, H = VERT ? 1920 : 1080, FPS = 30, END = 16;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const f = path.join(__dirname, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); }).listen(0, async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H } });
  p.on('pageerror', e => console.log('pageerror:', e.message)); p.on('console', m => m.type() === 'error' && console.log('console:', m.text()));
  await p.goto(`http://localhost:${srv.address().port}/cartoon.html?render${VERT ? '&v' : ''}`);
  await p.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
  await p.evaluate(() => document.fonts.load('40px "Noto Color Emoji"'));
  fs.mkdirSync(outDir, { recursive: true });
  const times = only ? only.split(',').map(Number) : [...Array(END * FPS).keys()].map(i => i / FPS);
  const [sk, sn] = (process.env.SHARD || '0/1').split('/').map(Number);
  for (let i = sk; i < times.length; i += sn) {
    const out = only ? `${outDir}/t${times[i]}.jpg` : `${outDir}/f${String(i).padStart(4, '0')}.jpg`;
    if (!only && fs.existsSync(out)) continue;
    await p.evaluate(([t, f]) => seek(t, f), [times[i], Math.round(times[i] * FPS)]);
    await p.screenshot({ path: out, type: 'jpeg', quality: 94 });
  }
  await b.close(); srv.close();
});
