// Rend la vidéo image par image : node render.js <dossier> <fps> [t1,t2,...]
const { chromium } = require(process.env.PW || 'playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const [,, outDir, fps = 30, only] = process.argv;
const END = 10;
const types = { '.png': 'image/png', '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };
const srv = http.createServer((q, r) => {
  const f = path.join(__dirname, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); });
}).listen(0, async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('console', m => m.type() === 'error' && console.log('console:', m.text()));
  p.on('pageerror', e => console.log('pageerror:', e.message));
  await p.goto(`http://localhost:${srv.address().port}/index.html?render${process.env.QS || ""}`);
  await p.waitForFunction(() => window.ready === true, null, { timeout: 120000 });
  await p.evaluate(async () => { await document.fonts.ready; await document.fonts.load('40px "Noto Color Emoji"'); });
  fs.mkdirSync(outDir, { recursive: true });
  const times = only ? only.split(',').map(Number) : [...Array(Math.round(END * fps)).keys()].map(i => i / fps);
  const [sk, sn] = (process.env.SHARD || '0/1').split('/').map(Number);
  for (let i = sk; i < times.length; i += sn) {
    if (!only && fs.existsSync(`${outDir}/f${String(i).padStart(4, '0')}.png`)) continue;
    const a0 = Date.now();
    await p.evaluate(([t, f]) => seek(t, f), [times[i], Math.round(times[i] * 30)]);
    const a1 = Date.now();
    await p.screenshot({ path: `${outDir}/f${String(i).padStart(4, '0')}.png`, type: 'png', omitBackground: true });
    if (process.env.PROF || i % 60 === 0) console.log('frame', i, times[i], 'seek', a1 - a0, 'shot', Date.now() - a1);
  }
  await b.close(); srv.close();
});
