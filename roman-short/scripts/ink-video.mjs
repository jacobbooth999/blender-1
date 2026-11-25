// Render a 2D ink video: bundles an entry that sets window.INK_VIDEO = { duration, drawAt(g, W, H, t), cuts },
// draws every frame on a 2D canvas in Chromium and pipes JPEG frames into ffmpeg.
// usage: node scripts/ink-video.mjs <entry.ts> <out.mp4> [fps=30] [width=1920] [height=1080]
//        node scripts/ink-video.mjs <entry.ts> <outPrefix> --stills t1,t2,...   (preview frames)
import { build } from "esbuild";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const { chromium } = createRequire(import.meta.url)("playwright");
const args = process.argv.slice(2), entry = args[0], out = args[1];
const si = args.indexOf("--stills"), stills = si >= 0 ? args[si + 1].split(",").map(Number) : null;
const sti = args.indexOf("--style"), style = sti >= 0 ? args[sti + 1] : null;
const rest = args.slice(2).filter((a, i, all) => !["--stills", "--style"].includes(a) && !["--stills", "--style"].includes(all[i - 1]));
const [fps = 30, W = 1920, H = 1080] = rest.map(Number);
const js = (await build({ entryPoints: [entry], bundle: true, write: false, format: "iife", logLevel: "warning" })).outputFiles[0].text;
const font = (pkg, file, fam) => `@font-face{font-family:"${fam}";src:url(data:font/woff2;base64,${fs.readFileSync(path.resolve("node_modules/@fontsource", pkg, "files", file)).toString("base64")}) format("woff2");}`;
const css = font("patrick-hand", "patrick-hand-latin-400-normal.woff2", "Patrick Hand") + font("gochi-hand", "gochi-hand-latin-400-normal.woff2", "Gochi Hand") + font("bangers", "bangers-latin-400-normal.woff2", "Bangers");
const b = await chromium.launch();
const p = await b.newPage();
p.on("pageerror", (e) => console.log("ERR", e.message));
await p.setContent(`<html><head><style>${css} body{margin:0}</style></head><body></body></html>`);
if (style) await p.evaluate((s) => { globalThis.INK_STYLE = s; }, style);
await p.addScriptTag({ content: js });
await p.evaluate(async ([W, H]) => { for (const f of ["Patrick Hand", "Gochi Hand", "Bangers"]) await document.fonts.load(`40px "${f}"`); const c = document.createElement("canvas"); c.width = W; c.height = H; window.__c = c; }, [W, H]);
const frame = (t) => p.evaluate(([t, W, H]) => { const g = window.__c.getContext("2d"); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); window.INK_VIDEO.drawAt(g, W, H, t); return window.__c.toDataURL("image/jpeg", 0.93); }, [t, W, H]);
const duration = await p.evaluate(() => window.INK_VIDEO.duration);
if (stills) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  for (const t of stills) fs.writeFileSync(`${out}${t.toFixed(2)}.jpg`, Buffer.from((await frame(t)).split(",")[1], "base64"));
  console.log("stills", stills.length);
} else {
  const n = Math.ceil(duration * fps);
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", out], { stdio: ["pipe", "inherit", "inherit"] });
  const t0 = Date.now();
  for (let f = 0; f < n; f++) {
    const buf = Buffer.from((await frame(f / fps)).split(",")[1], "base64");
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (f % 300 === 0) console.log("frame", f, "/", n, ((Date.now() - t0) / 1000).toFixed(0) + "s");
  }
  ff.stdin.end(); await new Promise((r) => ff.on("close", r));
  console.log("video", out, n, "frames", ((Date.now() - t0) / 1000).toFixed(0) + "s");
}
await b.close();
