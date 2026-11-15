// usage: node scripts/render.mjs <out.mp4> [scale] [frameFrom-frameTo] [concurrency]
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [out, scale = "1", range, conc = "4"] = process.argv.slice(2);
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const chromiumOptions = { gl: process.env.GL || "swangle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const inputProps = process.env.DPR ? { post: { dpr: Number(process.env.DPR) } } : {};
const composition = await selectComposition({ serveUrl, id: "RomeShort", browserExecutable, chromiumOptions, inputProps });
const frameRange = range ? range.split("-").map(Number) : null;
const t0 = Date.now();
let last = 0;
await renderMedia({
  composition, serveUrl, codec: "h264", crf: 16, outputLocation: out, scale: Number(scale), browserExecutable, chromiumOptions,
  concurrency: Number(conc), frameRange, inputProps, timeoutInMilliseconds: 600000, muted: true, imageFormat: "jpeg", jpegQuality: 92,
  onProgress: ({ renderedFrames, progress }) => {
    if (renderedFrames - last >= 20 || progress === 1) { last = renderedFrames; console.log(`frames ${renderedFrames} ${(progress * 100).toFixed(1)}% ${((Date.now() - t0) / 1000).toFixed(0)}s`); }
  },
});
console.log("done", ((Date.now() - t0) / 1000).toFixed(0) + "s");
process.exit(0);
