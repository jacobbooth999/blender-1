// Alternative looks for style previews: each sets the global LOOK overrides before drawing and post-processes the
// finished frame (before captions). Selected with --style <name> (globalThis.INK_STYLE).
import { LOOK } from "./ink2d";
import { journalGrade } from "./journal";

export const LOOKS = ["flat", "ink", "comic", "paper", "watercolor", "riso", "sunset", "pixel", "chalk"] as const;
export const lookName = () => (globalThis as { INK_STYLE?: string }).INK_STYLE ?? "flat";

export const setLook = () => {
  for (const k of Object.keys(LOOK)) delete (LOOK as Record<string, unknown>)[k];
  const n = lookName();
  if (n === "ink") { LOOK.vector = false; }
  if (n === "comic") { LOOK.vector = false; LOOK.lineCol = "#000000"; LOOK.wMul = 3; }
  if (n === "paper") { LOOK.vector = false; LOOK.lineCol = "#fffaf0"; LOOK.wMul = 0.9; LOOK.shadow = "rgba(40,25,10,0.45)"; LOOK.shadowPx = 9; }
  if (n === "watercolor") { LOOK.vector = false; LOOK.lineCol = "rgba(70,55,50,0.55)"; LOOK.wMul = 0.7; }
  if (n === "chalk") { LOOK.vector = false; }
};

let grainCache: HTMLCanvasElement | null = null;
const grain = (W: number, H: number) => {
  if (grainCache && grainCache.width === W && grainCache.height === H) return grainCache;
  const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d")!;
  const img = g.createImageData(W, H), d = img.data; let s = 1234567;
  for (let i = 0; i < d.length; i += 4) { s = (s * 16807) % 2147483647; const v = 200 + (s % 56); d[i] = v; d[i + 1] = v - 4; d[i + 2] = v - 12; d[i + 3] = 255; }
  g.putImageData(img, 0, 0);
  // fibres
  g.strokeStyle = "rgba(150,130,100,0.12)"; g.lineWidth = 1;
  for (let k = 0; k < 2500; k++) { s = (s * 16807) % 2147483647; const x = s % W; s = (s * 16807) % 2147483647; const y = s % H; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6 + (s % 12), y + (s % 5) - 2); g.stroke(); }
  grainCache = c; return c;
};
const lum = (d: Uint8ClampedArray, i: number) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];

export const postLook = (g: CanvasRenderingContext2D, W: number, H: number, t: number) => {
  const n = lookName();
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  if (n === "comic") {
    const img = g.getImageData(0, 0, W, H), d = img.data, cell = Math.round(W / 95);
    for (let i = 0; i < d.length; i += 4) for (let c = 0; c < 3; c++) { const v = d[i + c]; d[i + c] = Math.max(0, Math.min(255, (v - 128) * 1.25 + 128 + 6)); }
    g.putImageData(img, 0, 0);
    // halftone dots in the darker tones
    g.fillStyle = "rgba(20,10,40,0.5)";
    for (let y = cell / 2; y < H; y += cell) for (let x = ((y / cell) % 2) * cell / 2; x < W; x += cell) { const i = (Math.floor(y) * W + Math.floor(x)) * 4, L = lum(d, i) / 255; const r = (1 - L) * cell * 0.7 - cell * 0.1; if (r > 0.6) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); } }
  } else if (n === "paper") {
    const img = g.getImageData(0, 0, W, H), d = img.data; for (let i = 0; i < d.length; i += 4) for (let k = 0; k < 3; k++) d[i + k] = Math.round(d[i + k] / 24) * 24 + 8;
    g.putImageData(img, 0, 0);
    g.globalCompositeOperation = "multiply"; g.globalAlpha = 0.85; g.drawImage(grain(W, H), 0, 0);
  } else if (n === "watercolor") {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const cg = c.getContext("2d")!;
    cg.filter = `blur(${Math.round(W / 140)}px) saturate(0.8) brightness(1.08)`; cg.drawImage(g.canvas, 0, 0);
    g.globalAlpha = 0.55; g.drawImage(c, 0, 0); g.globalAlpha = 1;
    // pigment pooling: darken edges by subtracting the blur
    const a = g.getImageData(0, 0, W, H), b = cg.getImageData(0, 0, W, H), d = a.data, e = b.data;
    for (let i = 0; i < d.length; i += 4) for (let k = 0; k < 3; k++) { const diff = d[i + k] - e[i + k]; d[i + k] = Math.max(0, Math.min(255, d[i + k] * 0.82 + 46 + Math.min(0, diff) * 1.6)); }
    g.putImageData(a, 0, 0);
    g.globalCompositeOperation = "multiply"; g.globalAlpha = 0.7; g.drawImage(grain(W, H), 0, 0);
  } else if (n === "riso") {
    journalGrade(g, W, H, t);
  } else if (n === "sunset") {
    const img = g.getImageData(0, 0, W, H), d = img.data;
    const stops: [number, number[]][] = [[0, [38, 20, 60]], [0.35, [120, 40, 90]], [0.6, [232, 98, 76]], [0.8, [250, 170, 90]], [1, [255, 236, 190]]];
    for (let i = 0; i < d.length; i += 4) {
      const L = Math.pow(lum(d, i) / 255, 1.15); let k = 1; while (k < stops.length - 1 && L > stops[k][0]) k++;
      const [a0, c0] = stops[k - 1], [a1, c1] = stops[k], u = Math.max(0, Math.min(1, (L - a0) / (a1 - a0)));
      for (let c = 0; c < 3; c++) d[i + c] = c0[c] + (c1[c] - c0[c]) * u;
    }
    g.putImageData(img, 0, 0);
  } else if (n === "pixel") {
    const f = 10, w = Math.ceil(W / f), h = Math.ceil(H / f), c = document.createElement("canvas"); c.width = w; c.height = h; const cg = c.getContext("2d")!;
    cg.imageSmoothingEnabled = true; cg.drawImage(g.canvas, 0, 0, w, h);
    const img = cg.getImageData(0, 0, w, h), d = img.data; const B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]; for (let i = 0; i < d.length; i += 4) { const p = i / 4, th = (B[((Math.floor(p / w) % 4) * 4) + (p % w) % 4] / 16 - 0.5) * 14; for (let k = 0; k < 3; k++) d[i + k] = Math.round((d[i + k] + th) / 40) * 40; }
    cg.putImageData(img, 0, 0); g.imageSmoothingEnabled = false; g.drawImage(c, 0, 0, W, H); g.imageSmoothingEnabled = true;
  } else if (n === "chalk") {
    const img = g.getImageData(0, 0, W, H), d = img.data, out = g.createImageData(W, H), o = out.data, Lm = new Float32Array(W * H);
    for (let p = 0; p < W * H; p++) Lm[p] = lum(d, p * 4);
    let s = 99;
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const p = y * W + x, gx = Lm[p + 1] - Lm[p - 1] + 0.5 * (Lm[p - W + 1] - Lm[p - W - 1] + Lm[p + W + 1] - Lm[p + W - 1]), gy = Lm[p + W] - Lm[p - W] + 0.5 * (Lm[p + W - 1] - Lm[p - W - 1] + Lm[p + W + 1] - Lm[p - W + 1]);
      s = (s * 16807) % 2147483647; const e = Math.min(1, Math.hypot(gx, gy) / 60) * (0.65 + (s % 100) / 280), i = p * 4;
      for (let c = 0; c < 3; c++) { const board = [38, 62, 52][c], tint = d[i + c] * 0.28 + board * 0.72; o[i + c] = tint + (245 - tint) * e; } o[i + 3] = 255;
    }
    g.putImageData(out, 0, 0);
  }
  g.restore();
};
