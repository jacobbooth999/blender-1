// Renders the 5 still shots: node render_stills.js [dpr] [outdir]
const { chromium } = require('playwright');
const path = require('path');
const dpr = +(process.argv[2] || 2), out = process.argv[3] || path.join(__dirname, 'stills');
const names = ['01_sprint', '02_pancake_flip', '03_kick', '04_rooftop_dance', '05_chop_wood'];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.error('PAGE ERROR', e.message));
  p.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
  for (let i = 0; i < 5; i++) {
    const extra = process.env.T ? `&t=${process.env.T.split(',')[i]}` : '';
    await p.goto('file://' + path.join(__dirname, 'index.html') + `?still=1&scene=${i}&dpr=${dpr}${extra}`);
    await p.waitForFunction(() => document.title === 'ready', null, { timeout: 60000 });
    const data = await p.evaluate(() => document.getElementById('c').toDataURL('image/jpeg', 0.93));
    require('fs').writeFileSync(path.join(out, names[i] + '.jpg'), Buffer.from(data.split(',')[1], 'base64'));
    console.log('wrote', names[i]);
  }
  await b.close();
})();
