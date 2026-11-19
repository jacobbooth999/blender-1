// node render.js frames <outdir> [dpr] [fps] [workers] [from] [to]  -> JPEG frames
// node render.js sheet <out.jpg>   -> contact sheet (one frame per shot) for review
// node render.js cues <out.json>   -> sound cue list
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [mode, out, dprA, fpsA, wA, fromA, toA] = process.argv.slice(2);
const url = (dpr) => 'file://' + path.join(__dirname, 'film.html') + `?render=1&dpr=${dpr}`;
async function page(b, dpr){ const p = await b.newPage({ viewport: { width: 1600, height: 900 } }); p.on('pageerror', e => console.error('PAGE ERROR', e.message)); p.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); }); await p.goto(url(dpr)); await p.waitForFunction(() => window.READY); return p; }
const grab = (p, T, q = 0.9) => p.evaluate(([T, q]) => { renderAt(T); return document.getElementById('c').toDataURL('image/jpeg', q); }, [T, q]);
const save = (f, d) => fs.writeFileSync(f, Buffer.from(d.split(',')[1], 'base64'));
(async () => {
  const b = await chromium.launch();
  if (mode === 'cues'){ const p = await page(b, 0.5); fs.writeFileSync(out, JSON.stringify(await p.evaluate(() => cueList()), null, 1)); }
  else if (mode === 'sheet'){
    const p = await page(b, 0.5); const info = await p.evaluate(() => cueList()); const at = (process.env.AT || '0.5').split(',').map(Number);
    fs.mkdirSync('/tmp/sheet', { recursive: true }); const files = [];
    for (const [i, s] of info.shots.entries()) for (const [j, a] of at.entries()){ const f = `/tmp/sheet/${String(i).padStart(2,'0')}_${j}.jpg`; save(f, await grab(p, s.start + s.dur*a, 0.85)); files.push([f, `${i} ${s.name} @${(s.start + s.dur*a).toFixed(1)}`]); }
    fs.writeFileSync('/tmp/sheet/list.json', JSON.stringify(files)); console.log('frames', files.length);
  } else {
    const dpr = +(dprA || 1.2), fps = +(fpsA || 24), N = +(wA || 3); fs.mkdirSync(out, { recursive: true });
    const dur = await (await page(b, 0.3)).evaluate(() => DURATION); const total = Math.ceil(dur*fps), from = +(fromA || 0), to = Math.min(total, +(toA || total));
    let next = from, done = 0; const t0 = Date.now();
    await Promise.all(Array.from({ length: N }, async () => { const p = await page(b, dpr);
      while (next < to){ const i = next++; const f = path.join(out, `f${String(i).padStart(5,'0')}.jpg`); if (fs.existsSync(f)) { done++; continue; }
        save(f, await grab(p, i/fps, 0.92)); if (++done % 48 === 0) console.log(`${done}/${to - from}  ${((Date.now() - t0)/done).toFixed(0)} ms/frame`); } }));
    console.log('total frames', total);
  }
  await b.close();
})();
