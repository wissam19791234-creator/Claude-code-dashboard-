const { chromium } = require('playwright');
const fs = require('fs');
const [,, outDir, fps = 30, only] = process.argv;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + __dirname + '/index.html?render');
  await p.evaluate(() => document.fonts.ready);
  fs.mkdirSync(outDir, { recursive: true });
  const times = only ? only.split(',').map(Number) : [...Array(20 * fps).keys()].map(i => i / fps);
  for (let i = 0; i < times.length; i++) {
    await p.evaluate(t => seek(t), times[i]);
    await p.screenshot({ path: `${outDir}/f${String(i).padStart(4, '0')}.png` });
  }
  await b.close();
})();
