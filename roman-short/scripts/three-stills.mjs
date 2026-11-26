// usage: node scripts/three-stills.mjs <entry.ts> <outPrefix> [W H] [shots e.g. 0,1,2]
// Bundles a three.js scene that sets window.RENDER3D(shot, W, H) -> jpeg data URL and saves each shot.
import { build } from "esbuild";
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import fs from "node:fs";
import path from "node:path";
const [entry, out, W = "1080", H = "1920", list] = process.argv.slice(2);
const js = (await build({ entryPoints: [entry], bundle: true, write: false, format: "iife", logLevel: "warning" })).outputFiles[0].text;
const font = fs.readFileSync(path.resolve("node_modules/@fontsource/bangers/files/bangers-latin-400-normal.woff2")).toString("base64");
const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const p = await b.newPage();
p.on("pageerror", (e) => console.log("ERR", e.message));
p.on("console", (m) => { if (m.type() === "error") console.log("console:", m.text().slice(0, 300)); });
await p.setContent(`<html><head><style>@font-face{font-family:"Bangers";src:url(data:font/woff2;base64,${font}) format("woff2");}body{margin:0}</style></head><body></body></html>`);
await p.addScriptTag({ content: js });
await p.evaluate(async () => { await document.fonts.load('40px "Bangers"'); });
const n = await p.evaluate(() => window.N3D);
const shots = list ? list.split(",").map(Number) : [...Array(n).keys()];
fs.mkdirSync(path.dirname(out), { recursive: true });
for (const k of shots) {
  const t0 = Date.now();
  const url = await p.evaluate(([k, W, H]) => window.RENDER3D(k, W, H), [k, Number(W), Number(H)]);
  fs.writeFileSync(`${out}${k}.jpg`, Buffer.from(url.split(",")[1], "base64"));
  console.log("shot", k, ((Date.now() - t0) / 1000).toFixed(1) + "s");
}
await b.close();
