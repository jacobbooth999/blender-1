// Usage:
//   node render.mjs stills <outPrefix> <f1,f2,...> [w h]      -> <outPrefix><f>.jpg
//   node render.mjs video <out.mp4> <startFrame> <endFrame> [w h]   (end exclusive; frames piped to ffmpeg)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const [mode, out, a, b, w0, h0] = process.argv.slice(2);
const W = +(mode === 'stills' ? (b || 1080) : (w0 || 1080)), H = +(mode === 'stills' ? (w0 || 1920) : (h0 || 1920));
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
const page = await browser.newPage({ viewport: { width: Math.min(W, 1200), height: Math.min(H, 1200) } });
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.error('[page]', m.text()); });
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
await page.goto(`http://localhost:${port}/${process.env.PAGE || 'src/index.html'}?w=${W}&h=${H}`);
await page.waitForFunction(() => window.booted && window.ready, null, { timeout: 120000 });
await page.evaluate(() => window.ready);

async function grab(f) {
  const url = await page.evaluate((f) => { window.renderFrame(f); return document.getElementById('out').toDataURL('image/jpeg', .94); }, f);
  return Buffer.from(url.split(',')[1], 'base64');
}

if (mode === 'events') {
  fs.writeFileSync(out, JSON.stringify(await page.evaluate(() => window.EVENTS), null, 0));
} else if (mode === 'stills') {
  const frames = a.split(',').map(Number);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  for (const f of frames) { const t0 = Date.now(); fs.writeFileSync(`${out}${f}.jpg`, await grab(f)); console.log('frame', f, Date.now() - t0, 'ms'); }
} else {
  const s = +a, e = +b;
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = s; f < e; f++) {
    const buf = await grab(f);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if ((f - s) % 30 === 0) console.log(`frame ${f} (${((Date.now() - t0) / (f - s + 1)).toFixed(0)} ms/f)`);
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log('done', out, ((Date.now() - t0) / 1000).toFixed(0), 's');
}
await browser.close(); server.close();
