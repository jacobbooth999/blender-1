// Render the 2D ink-explainer stills: bundles an entry that sets window.INK_SHOTS = [{ name, draw(g, W, H) }],
// draws each at W x H in Chromium (2D canvas, no WebGL) and writes JPEGs.
// usage: node scripts/ink-stills.mjs <entry.ts> <outPrefix> [width=1920] [height=1080] [only=comma list of indices]
import { build } from "esbuild";
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import fs from "node:fs";
import path from "node:path";
const [entry, prefix, w = "1920", h = "1080", only = ""] = process.argv.slice(2);
const out = await build({ entryPoints: [entry], bundle: true, write: false, format: "iife", logLevel: "warning" });
const font = (pkg, file, fam) => `@font-face{font-family:"${fam}";src:url(data:font/woff2;base64,${fs.readFileSync(path.resolve("node_modules/@fontsource", pkg, "files", file)).toString("base64")}) format("woff2");}`;
const css = font("patrick-hand", "patrick-hand-latin-400-normal.woff2", "Patrick Hand") + font("gochi-hand", "gochi-hand-latin-400-normal.woff2", "Gochi Hand") + font("bangers", "bangers-latin-400-normal.woff2", "Bangers");
const b = await chromium.launch();
const p = await b.newPage();
p.on("pageerror", (e) => console.log("ERR", e.message));
p.on("console", (m) => console.log(m.text()));
await p.setContent(`<html><head><style>${css} body{margin:0}</style></head><body></body></html>`);
await p.addScriptTag({ content: out.outputFiles[0].text });
await p.evaluate(async () => { for (const f of ["Patrick Hand", "Gochi Hand", "Bangers"]) await document.fonts.load(`40px "${f}"`); });
const n = await p.evaluate(() => window.INK_SHOTS.length);
const pick = only ? only.split(",").map(Number) : [...Array(n).keys()];
fs.mkdirSync(path.dirname(prefix), { recursive: true });
for (const i of pick) {
  const t0 = Date.now();
  const url = await p.evaluate(([i, W, H]) => {
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d"); window.INK_SHOTS[i].draw(g, W, H);
    return c.toDataURL("image/jpeg", 0.92);
  }, [i, Number(w), Number(h)]);
  const name = await p.evaluate((i) => window.INK_SHOTS[i].name, i);
  fs.writeFileSync(`${prefix}${String(i).padStart(2, "0")}_${name}.jpg`, Buffer.from(url.split(",")[1], "base64"));
  console.log("still", i, name, Date.now() - t0, "ms");
}
await b.close();
