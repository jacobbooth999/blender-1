// "Why Lions Are Scared of Giraffes" (vertical Short) re-animated in the angular kraft-paper cartoon style the user
// picked (stylekit.ts), over a savanna background drawn in the same style (mountain, ridges, acacias, distant
// elephants, rocks, termite mounds, bushes, grass, clouds, birds) with parallax. Same voice, timing and captions
// as giraffe_short.ts, so the existing music/SFX mix lines up. Drawn directly on a 1080 x 1920 design canvas.
import TL from "../../../videos_ink/giraffe2/timeline.json";
import WORDS from "../../../videos_ink/giraffe2/words.json";
import { buildChunks, drawCaptions, DEFAULT_STYLE, CapWord } from "./captions";
import {
  P, Face, GPose, LINE, G_COAT, lerp, spline, ribbon, ell, group, taper, eye, giraffeFront, giraffeSide, lioness, floor, tree, burst, star, setSeed, rnd, shade,
} from "./stylekit";

const DURATION = TL.duration;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const frac = (x: number) => x - Math.floor(x);
const wt = (i: number, w: string, n = 1) => { let k = 0; for (const x of WORDS.words as CapWord[]) if (x.i === i && x.word.toLowerCase().replace(/[^a-z0-9']/g, "") === w) { k++; if (k === n) return x.start; } throw new Error(`no word ${w}`); };
const W0 = (i: number, w: string, n = 1) => wt(i, w, n) - 0.1;
const CAPS = buildChunks(WORDS.words as CapWord[], 2, 13);
const CAP_STYLE = DEFAULT_STYLE(["lions", "scared", "climb", "hide", "dies", "splits", "hour", "six", "lookout", "zebras", "alarm", "sixty", "run", "kick", "kill", "babies"]);
const blinkLid = (t: number, base: number, off = 0) => { const u = frac((t + off) / 3.1); return u < 0.05 ? 1.3 : base; };
const RED = "#b8402b", INKD = "#2a1f18";

// ---------------- background in the kit style ----------------
const par = (k: number, x: number, scroll: number, span = 2600) => { const v = (((x - scroll * k) % span) + span) % span; return v - 760; };
const cloud = (g: CanvasRenderingContext2D, x: number, y: number, s: number) => {
  const pts: P[] = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + (i / 12) * Math.PI, r = 1 + 0.25 * Math.sin(i * 2.3); pts.push([x + Math.cos(a) * 120 * s * r, y + Math.sin(a) * 50 * s * r]); }
  pts.push([x + 110 * s, y + 8 * s], [x - 110 * s, y + 8 * s]);
  group(g, [{ path: spline(pts, true, 0.5), fill: "#efe3c4", shade: false }], 2, 0);
};
const hills = (g: CanvasRenderingContext2D, y: number, amp: number, col: string, sd: number, scroll: number, k: number, freq = 2) => {
  setSeed(sd); const ph = rnd() * 6, ph2 = rnd() * 6, off = scroll * k, pts: P[] = [];
  for (let x = -80; x <= 1160; x += 40) { const X = x + off; pts.push([x, y - amp * (0.6 * Math.sin((X / 1080) * Math.PI * freq + ph) + 0.4 * Math.sin((X / 1080) * Math.PI * freq * 2.7 + ph2))]); }
  pts.push([1160, y + 400], [-80, y + 400]);
  group(g, [{ path: spline(pts, true, 0.3), fill: col, shade: false }], 1.6, 0);
};
const elephant = (g: CanvasRenderingContext2D, x: number, y: number, s: number, t: number) => {
  g.fillStyle = "#8e7f62"; const sw = Math.sin(t * 2.4) * s * 0.06;
  for (const [dx, p] of [[-0.3, 1], [-0.16, -1], [0.18, -1], [0.32, 1]] as const) g.fill(spline([[x + dx * s - 0.06 * s, y - 0.4 * s], [x + dx * s + 0.06 * s, y - 0.4 * s], [x + dx * s + 0.06 * s + p * sw, y], [x + dx * s - 0.06 * s + p * sw, y]], true, 0.2));
  g.fill(ell(x, y - 0.55 * s, 0.48 * s, 0.28 * s)); g.fill(ell(x + 0.5 * s, y - 0.62 * s, 0.2 * s, 0.2 * s)); g.fill(ell(x + 0.38 * s, y - 0.62 * s, 0.14 * s, 0.2 * s));
  taper(g, [[x + 0.64 * s, y - 0.56 * s], [x + 0.72 * s, y - 0.28 * s], [x + 0.66 * s, y - 0.08 * s]], 0.1 * s, "#8e7f62");
};
const rocks = (g: CanvasRenderingContext2D, x: number, y: number, s: number) => {
  group(g, ([[-0.55, 0, 0.5, 0.32], [0.35, 0, 0.62, 0.4], [-0.05, -0.36, 0.5, 0.34], [0.55, -0.48, 0.3, 0.24]] as const).map(([dx, dy, rx, ry], i) => ({ path: ell(x + dx * s, y + dy * s - ry * s * 0.6, rx * s, ry * s), fill: i % 2 ? "#b5a184" : "#a8937a" })), 2, 5);
};
const termite = (g: CanvasRenderingContext2D, x: number, y: number, h: number) => group(g, [{ path: spline([[x - h * 0.32, y], [x - h * 0.18, y - h * 0.5], [x - h * 0.06, y - h], [x + h * 0.06, y - h * 0.9], [x + h * 0.14, y - h * 0.55], [x + h * 0.32, y]], true, 0.4), fill: "#c08657" }], 2, 4);
const bush = (g: CanvasRenderingContext2D, x: number, y: number, s: number, col = "#8a8c50") => {
  const pts: P[] = []; for (let i = 0; i <= 10; i++) { const a = Math.PI + (i / 10) * Math.PI; pts.push([x + Math.cos(a) * s * (1 + 0.18 * Math.sin(i * 2.1)), y + Math.sin(a) * s * 0.7 * (1 + 0.2 * Math.cos(i * 1.7))]); }
  group(g, [{ path: spline(pts, true, 0.5), fill: col }], 2.2, s * 0.08);
};
const tuft = (g: CanvasRenderingContext2D, x: number, y: number, h: number, t: number, sd: number) => {
  setSeed(sd); for (let i = 0; i < 6; i++) { const dx = (i - 2.5) * h * 0.09, sw = Math.sin(t * 1.6 + x * 0.01 + i) * h * 0.05, hh = h * (0.6 + rnd() * 0.5);
    taper(g, [[x + dx, y], [x + dx * 1.4 + sw * 0.5, y - hh * 0.55], [x + dx * 2 + sw, y - hh]], h * 0.06, i % 2 ? "#6e5330" : "#8a6a3c"); }
};
const bird = (g: CanvasRenderingContext2D, x: number, y: number, s: number, t: number) => { const f = Math.sin(t * 9) * s * 0.4; taper(g, [[x - s, y - f], [x - s * 0.4, y - s * 0.2], [x, y + s * 0.1]], 3.5, INKD); taper(g, [[x, y + s * 0.1], [x + s * 0.4, y - s * 0.2], [x + s, y - f]], 3.5, INKD); };
let grain: HTMLCanvasElement | null = null;
const grainTex = () => {
  if (grain) return grain; grain = document.createElement("canvas"); grain.width = 540; grain.height = 960; const c = grain.getContext("2d")!;
  c.fillStyle = "#808080"; c.fillRect(0, 0, 540, 960); setSeed(77);
  for (let i = 0; i < 9000; i++) { c.fillStyle = rnd() < 0.5 ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.18)"; c.fillRect(rnd() * 540, rnd() * 960, 1, 1); }
  for (let i = 0; i < 70; i++) { c.fillStyle = rnd() < 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"; c.fill(ell(rnd() * 540, rnd() * 960, 30 + rnd() * 90, 20 + rnd() * 60, rnd() * 3)); }
  return grain;
};
/** the savanna in kit style; hor = horizon y, scroll = camera travel in px (parallax) */
const savanna = (g: CanvasRenderingContext2D, t: number, hor: number, sd: number, scroll = 0, opts: { trees?: boolean } = {}) => {
  const sky = g.createLinearGradient(0, -400, 0, hor); sky.addColorStop(0, "#bfc4b0"); sky.addColorStop(0.65, "#d7d0b0"); sky.addColorStop(1, "#ead6a6");
  g.fillStyle = sky; g.fillRect(-600, -1200, 2400, hor + 1200);
  group(g, [{ path: ell(150, hor - 1020, 58, 58), fill: "#f3dc9a", shade: false }], 2, 0);
  for (const [x, y, s, v] of [[150, hor - 820, 1.1, 5], [700, hor - 980, 0.9, 3], [980, hor - 560, 0.7, 4], [-120, hor - 1150, 1.2, 2], [520, hor - 1300, 1.0, 4]]) cloud(g, par(0.04, x + t * v, scroll, 1700), y, s);
  for (let k = 0; k < 5; k++) bird(g, par(0.08, 160 + k * 52 + t * 50 + (k % 2) * 22, scroll, 1800), hor - 420 + (k % 3) * 20 - k * 5, 13 - k, t + k * 0.4);
  // far mountain with snow cap
  const mx = par(0.06, 620, scroll, 2400);
  group(g, [{ path: spline([[mx - 520, hor + 10], [mx - 180, hor - 230], [mx - 80, hor - 270], [mx + 90, hor - 275], [mx + 200, hor - 235], [mx + 560, hor + 10]], true, 0.25), fill: "#a7ab9b", shade: false }], 1.6, 0);
  group(g, [{ path: spline([[mx - 108, hor - 255], [mx - 80, hor - 270], [mx + 90, hor - 275], [mx + 120, hor - 258], [mx + 60, hor - 238], [mx + 15, hor - 250], [mx - 35, hor - 232], [mx - 70, hor - 248]], true, 0.3), fill: "#efe6cf", shade: false }], 1.4, 0);
  hills(g, hor - 34, 34, "#b9ad83", sd + 3, scroll, 0.12, 1.5);
  hills(g, hor - 8, 20, "#ab9c6f", sd + 7, scroll, 0.22, 2.4);
  // ground
  const gr = g.createLinearGradient(0, hor, 0, 2000); gr.addColorStop(0, "#c9ad7e"); gr.addColorStop(1, "#b89a6a"); g.fillStyle = gr; g.fillRect(-600, hor, 2400, 2400);
  setSeed(sd);
  for (let k = 0; k < 14; k++) { const x = par(0.9, rnd() * 2600, scroll), y = hor + 40 + rnd() * 700, w = 80 + rnd() * 220; g.fillStyle = rnd() < 0.5 ? "rgba(150,115,60,0.16)" : "rgba(240,220,170,0.22)"; g.fill(ell(x, y, w * (0.6 + (y - hor) / 700), w * 0.05 * (0.6 + (y - hor) / 400))); }
  // distant acacia line and a herd of elephants
  for (let k = 0; k < 12; k++) { const x = par(0.28, rnd() * 2600, scroll), h = 18 + rnd() * 26; tree(g, x, hor + 3, h); }
  for (let k = 0; k < 4; k++) elephant(g, par(0.32, 240 + k * 34 + (k % 2) * 10 - t * 6, scroll), hor + 6 + (k % 2) * 2, 20 - (k % 2) * 5, t + k);
  // mid-ground
  rocks(g, par(0.45, 900 + rnd() * 200, scroll), hor + 26, 70);
  termite(g, par(0.55, 120 + rnd() * 120, scroll), hor + 50, 70); termite(g, par(0.55, 1500, scroll), hor + 34, 44);
  for (let k = 0; k < 6; k++) { const x = par(0.6, rnd() * 2600, scroll), y = hor + 26 + rnd() * 70; bush(g, x, y, 18 + (y - hor) * 0.3, rnd() < 0.5 ? "#8a8c50" : "#7e8549"); }
  if (opts.trees !== false) { tree(g, par(0.7, 1000, scroll), hor + 60, 95); }
  // grass, pebbles, tufts and flowers, larger towards the camera
  for (let k = 0; k < 120; k++) { const x = par(1, rnd() * 2600, scroll), y = hor + 20 + rnd() * 900, sc = 0.4 + (y - hor) / 450; taper(g, [[x, y], [x + 2 * sc, y - 9 * sc], [x + 4 * sc, y - 16 * sc]], 2.2 * sc, "rgba(90,65,35,0.5)"); }
  for (let k = 0; k < 18; k++) { const x = par(1.05, rnd() * 2600, scroll), y = hor + 300 + rnd() * 700, r = 5 + rnd() * 10; group(g, [{ path: ell(x, y, r * 1.5, r), fill: rnd() < 0.5 ? "#b9a888" : "#a99679" }], 1.4, 2); }
  for (let k = 0; k < 16; k++) { const x = par(1.1, rnd() * 2600, scroll), y = hor + 260 + rnd() * 760, h = 40 + (y - hor) * 0.12; tuft(g, x, y, h, t, sd + k); if (rnd() < 0.35) for (let f = 0; f < 3; f++) group(g, [{ path: ell(x + 8 + f * 12, y - h * 0.7 - f * 6, 5, 5), fill: rnd() < 0.5 ? "#f4eedd" : "#efc456", shade: false }], 1.2, 0); }
};

// ---------------- zebra in kit style ----------------
const zebra = (g: CanvasRenderingContext2D, x: number, y: number, s: number, ph: number, walking: boolean) => {
  g.save(); g.translate(x, y); g.scale(s, s); const lw = 3.4 / s, d = 7 / s, A = walking ? 0.17 : 0, lift = walking ? 0.08 : 0;
  const ft = (hx: number, u: number): P => [hx - A * Math.cos(u), -Math.max(0, Math.sin(u)) * lift];
  const leg = (h: P, u: number, front: boolean) => { const f = ft(h[0], u), m = lerp(h, f, 0.5); return { r: ribbon([h, [m[0] + (front ? -0.02 : 0.04), m[1]], lerp([m[0], m[1]], f, 0.7), f], [0.13, 0.08, 0.07, 0.065]), f }; };
  const L = { nf: leg([0.4, -0.7], ph, true), ff: leg([0.3, -0.7], ph + Math.PI, true), nh: leg([-0.42, -0.7], ph + Math.PI, false), fh: leg([-0.52, -0.7], ph, false) };
  const hoof = (f: P) => spline([[f[0] - 0.04, f[1] - 0.05], [f[0] + 0.04, f[1] - 0.05], [f[0] + 0.05, f[1]], [f[0] - 0.05, f[1]]], true, 0.2);
  const stripesV = (clip: Path2D, x0: number, x1: number, y0: number, y1: number, step: number, w: number) => { g.save(); g.clip(clip); for (let xx = x0; xx < x1; xx += step) taper(g, [[xx, y0], [xx + step * 0.3, (y0 + y1) / 2], [xx - step * 0.1, y1]], w, "#1d1a1c"); g.restore(); };
  const legStripes = (r: P[], h: P, f: P) => { const p = spline(r); return { path: p, fill: "#f4efe2", deco: () => { g.save(); g.clip(p); for (let k = 1; k < 7; k++) { const q = lerp(h, f, k / 7.5); taper(g, [[q[0] - 0.09, q[1] - 0.01], [q[0], q[1] + 0.01], [q[0] + 0.09, q[1]]], 0.035, "#1d1a1c"); } g.restore(); } }; };
  group(g, [legStripes(L.ff.r, [0.3, -0.7], L.ff.f), legStripes(L.fh.r, [-0.52, -0.7], L.fh.f), { path: hoof(L.ff.f), fill: "#2b2420", shade: false }, { path: hoof(L.fh.f), fill: "#2b2420", shade: false }], lw, d);
  const body = spline([[-0.58, -0.72], [-0.56, -0.92], [-0.4, -1.0], [0.0, -0.98], [0.38, -1.02], [0.56, -0.92], [0.56, -0.74], [0.3, -0.62], [-0.35, -0.62]]);
  const neckPts = ribbon([[0.42, -0.9], [0.62, -1.18], [0.78, -1.4]], [0.34, 0.24, 0.2]), neck = spline(neckPts);
  const hc: P = [0.8, -1.42], ha = 1.0, c = Math.cos(ha), sn = Math.sin(ha), H = (p: P): P => [hc[0] + p[0] * c - p[1] * sn, hc[1] + p[0] * sn + p[1] * c];
  const head = spline(([[-0.1, -0.09], [0.1, -0.09], [0.3, -0.06], [0.44, -0.02], [0.45, 0.07], [0.3, 0.09], [0.08, 0.09], [-0.1, 0.06]] as P[]).map(H));
  const muz = spline(([[0.32, -0.06], [0.45, -0.02], [0.46, 0.07], [0.32, 0.09], [0.28, 0.0]] as P[]).map(H));
  const ears = [spline(([[-0.06, -0.08], [-0.12, -0.24], [-0.02, -0.1]] as P[]).map(H), true, 0.4)];
  const mane = spline(ribbon([[0.38, -0.98], [0.56, -1.26], [0.7, -1.5]], [0.08, 0.09, 0.08]));
  const tail = spline(ribbon([[-0.56, -0.9], [-0.64, -0.72], [-0.66, -0.55]], [0.035, 0.03, 0.025]));
  group(g, [{ path: tail, fill: "#f4efe2" }, { path: spline([[-0.69, -0.58], [-0.62, -0.58], [-0.62, -0.46], [-0.67, -0.42], [-0.71, -0.48]]), fill: "#1d1a1c", shade: false },
    legStripes(L.nf.r, [0.4, -0.7], L.nf.f), legStripes(L.nh.r, [-0.42, -0.7], L.nh.f), { path: hoof(L.nf.f), fill: "#2b2420", shade: false }, { path: hoof(L.nh.f), fill: "#2b2420", shade: false },
    { path: mane, fill: "#1d1a1c", shade: false }, { path: neck, fill: "#f4efe2", deco: () => { g.save(); g.clip(neck); g.translate(0.42, -0.9); g.rotate(-0.95); for (let k = 0; k < 7; k++) taper(g, [[0.05 + k * 0.08, -0.25], [0.08 + k * 0.08, 0], [0.05 + k * 0.08, 0.25]], 0.045, "#1d1a1c"); g.restore(); } },
    { path: body, fill: "#f4efe2", deco: () => stripesV(body, -0.6, 0.6, -1.05, -0.6, 0.1, 0.05) },
    ...ears.map((p) => ({ path: p, fill: "#f4efe2" })), { path: head, fill: "#f4efe2", deco: () => { g.save(); g.clip(head); g.translate(hc[0], hc[1]); g.rotate(ha); for (let k = 0; k < 4; k++) taper(g, [[-0.05 + k * 0.08, -0.12], [-0.03 + k * 0.08, 0], [-0.05 + k * 0.08, 0.12]], 0.035, "#1d1a1c"); g.restore(); g.save(); g.clip(head); g.fillStyle = "#3a3330"; g.fill(muz); g.restore(); } }], lw, d);
  eye(g, H([0.06, -0.02]), 0.045, { lid: 0.4, brow: 0, look: [0.6, 0.2] }, "#f4efe2", lw);
  g.restore();
};

// ---------------- props in kit style ----------------
const cross = (g: CanvasRenderingContext2D, x: number, y: number, s: number, k: number) => {
  if (k <= 0) return; const q = s * (k < 0.5 ? 0.6 + ease(k / 0.12) * 0.55 : 1.0);
  const a = spline(ribbon([[x - q / 2, y - q / 2], [x, y], [x + q / 2, y + q / 2]], [q * 0.18, q * 0.2, q * 0.16])), b = spline(ribbon([[x + q / 2, y - q / 2], [x, y], [x - q / 2, y + q / 2]], [q * 0.18, q * 0.2, q * 0.16]));
  group(g, [{ path: a, fill: RED }, { path: b, fill: RED }], 3.6, 6);
};
const bang = (g: CanvasRenderingContext2D, x: number, y: number, s: number, k: number) => { if (k <= 0) return; const q = s * Math.min(1, 0.5 + ease(k * 4) * 0.6); group(g, [{ path: spline([[x - q * 0.12, y - q], [x + q * 0.12, y - q], [x + q * 0.06, y - q * 0.3], [x - q * 0.06, y - q * 0.3]], true, 0.2), fill: RED, shade: false }, { path: ell(x, y - q * 0.08, q * 0.08, q * 0.08), fill: RED, shade: false }], 3.4, 0); };
const label = (g: CanvasRenderingContext2D, txt: string, x: number, y: number, size: number, k: number, col = RED) => { if (k <= 0) return; g.save(); g.globalAlpha = clamp01(k); g.font = `${size}px "Patrick Hand"`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round"; g.lineWidth = size * 0.16; g.strokeStyle = "#f3e7c9"; g.strokeText(txt, x, y); g.fillStyle = col; g.fillText(txt, x, y); g.restore(); };
const arrow = (g: CanvasRenderingContext2D, a: P, b: P, col = RED) => { taper(g, [a, lerp(a, b, 0.5), b], 9, col); const an = Math.atan2(b[1] - a[1], b[0] - a[0]); for (const sgn of [-1, 1]) taper(g, [b, [b[0] - Math.cos(an + sgn * 0.5) * 34, b[1] - Math.sin(an + sgn * 0.5) * 34]], 9, col); };
const clock = (g: CanvasRenderingContext2D, x: number, y: number, r: number, k: number) => {
  group(g, [{ path: ell(x, y, r, r), fill: "#f3e7c9" }], 3.6, 7);
  g.save(); g.fillStyle = "rgba(184,64,43,0.35)"; g.beginPath(); g.moveTo(x, y); g.arc(x, y, r * 0.82, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); g.closePath(); g.fill(); g.restore();
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; taper(g, [[x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78], [x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9]], 6, INKD); }
  const a = -Math.PI / 2 + Math.PI * 2 * k; taper(g, [[x, y], [x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7]], 10, RED); taper(g, [[x, y], [x, y - r * 0.45]], 11, INKD); g.fillStyle = INKD; g.fill(ell(x, y, 10, 10));
};
const speedo = (g: CanvasRenderingContext2D, x: number, y: number, r: number, k: number) => {
  group(g, [{ path: spline([[x - r, y], ...Array.from({ length: 13 }, (_, i) => { const a = Math.PI + (i / 12) * Math.PI; return [x + Math.cos(a) * r, y + Math.sin(a) * r] as P; }), [x + r, y], [x + r, y + r * 0.35], [x - r, y + r * 0.35]], true, 0.2), fill: "#f3e7c9" }], 3.6, 6);
  for (let i = 0; i <= 6; i++) { const a = Math.PI + (i / 6) * Math.PI; taper(g, [[x + Math.cos(a) * r * 0.74, y + Math.sin(a) * r * 0.74], [x + Math.cos(a) * r * 0.88, y + Math.sin(a) * r * 0.88]], 6, INKD); }
  const a = Math.PI + Math.PI * (0.1 + 0.8 * k); taper(g, [[x, y], [x + Math.cos(a) * r * 0.72, y + Math.sin(a) * r * 0.72]], 11, RED); g.fillStyle = INKD; g.fill(ell(x, y, 12, 12));
  label(g, `${Math.round(60 * k)} km/h`, x, y + r * 0.2, 48, 1, INKD);
};
const vignette = (g: CanvasRenderingContext2D, k: number) => { if (k <= 0) return; const v = g.createRadialGradient(540, 900, 300, 540, 900, 1250); v.addColorStop(0, "rgba(30,15,5,0)"); v.addColorStop(1, `rgba(30,15,5,${(0.5 * k).toFixed(2)})`); g.fillStyle = v; g.fillRect(-600, -1000, 2400, 4000); };
const shakeAt = (g: CanvasRenderingContext2D, t: number, amp: number) => { if (amp > 0) g.translate(Math.sin(t * 91) * amp, Math.cos(t * 77) * amp); };

// ---------------- gaits ----------------
type Feet = Partial<Record<"fn" | "ff" | "hn" | "hf", P>>;
const BASE = { fn: 0.44, ff: 0.22, hn: -0.38, hf: -0.58 };
const gait = (kind: "walk" | "gallop", t: number) => {
  const G = kind === "walk" ? { f: 0.85, st: 0.62, A: 0.2, lift: 0.1, ph: { fn: 0, hn: 0.02, ff: 0.5, hf: 0.52 } } : { f: 1.7, st: 0.4, A: 0.42, lift: 0.22, ph: { hf: 0, hn: 0.1, ff: 0.45, fn: 0.55 } };
  const feet: Feet = {};
  for (const k of ["fn", "ff", "hn", "hf"] as const) { const u = frac(t * G.f + G.ph[k]); if (u < G.st) feet[k] = [BASE[k] + G.A - 2 * G.A * (u / G.st), 0]; else { const s2 = (u - G.st) / (1 - G.st); feet[k] = [BASE[k] - G.A + 2 * G.A * ease(s2), -G.lift * Math.sin(Math.PI * s2)]; } }
  const speed = (2 * G.A * G.f) / G.st, cyc = Math.sin(2 * Math.PI * t * G.f * (kind === "walk" ? 2 : 1));
  return { feet, speed, bob: (kind === "walk" ? 0.012 : 0.05) * cyc, neck: (kind === "walk" ? 0.04 : 0.12) * Math.sin(2 * Math.PI * t * G.f + 1) };
};
const giraffeWalk = (g: CanvasRenderingContext2D, x: number, y: number, s: number, kind: "walk" | "gallop", t: number, o: GPose = {}, flip = false) => {
  const G = gait(kind, t); giraffeSide(g, x, y + G.bob * s, s, { ...o, feet: { ...G.feet, ...o.feet }, neckAng: (o.neckAng ?? (kind === "gallop" ? -0.75 : -1.2)) + G.neck }, flip); return G;
};

// ---------------- shots ----------------
type Shot = { at: number; frame?: (lt: number, d: number) => [number, number, number]; draw: (g: CanvasRenderingContext2D, t: number, lt: number, d: number) => void };
const hook = (g: CanvasRenderingContext2D, t: number) => {
  savanna(g, t, 1170, 101, 0, { trees: false });
  floor(g, 580, 1455, 760, 7);
  giraffeFront(g, 610, 1450, 450, { lid: blinkLid(t, 0.55), brow: 0.55, look: [-0.7, 0.8] });
  lioness(g, 235 + Math.sin(t * 47) * 2.5, 1462, 300, "sit", { lid: blinkLid(t, 0, 1.3) === 1.3 ? 1.3 : 0, brow: -0.7, look: [0.6, -0.9], worried: true });
};
const HIT = wt(6, "kick") + 0.08, ALARM = wt(3, "alarm");
const SH: Shot[] = [
  // A. hook
  { at: 0, frame: (lt) => [560, 980, 1 + 0.05 * ease(lt / 1.7)], draw: (g, t) => hook(g, t) },
  // B. can't climb: rears up an acacia and slides back down
  { at: W0(0, "can't"), frame: () => [560, 1000, 1.0], draw: (g, t, lt) => {
    shakeAt(g, t, 3); savanna(g, t, 1170, 91, 0, { trees: false });
    const sway = Math.sin(lt * 20) * 0.04; g.save(); g.translate(820, 1450); g.rotate(sway); g.translate(-820, -1450); tree(g, 820, 1450, 520); g.restore();
    setSeed(4); for (let k = 0; k < 8; k++) { const fx = 600 + rnd() * 500, fy = 950 + ((lt * (260 + rnd() * 160) + rnd() * 160) % 520); group(g, [{ path: ell(fx + Math.sin(lt * 6 + k) * 18, fy, 14, 7, lt * 4 + k), fill: "#8d8f52", shade: false }], 1.6, 0); }
    const up = lt < 0.5 ? ease(lt / 0.22) : 1 - ease((lt - 0.5) / 0.2);
    floor(g, 420, 1455, 520, 8);
    g.save(); g.translate(300, 1450); g.rotate(-0.55 * up); g.translate(-300, -1450);
    giraffeSide(g, 440, 1450, 330, { neckAng: -1.25 - 0.2 * up, headAng: 0.2, feet: { fn: [0.44 + 0.3 * up, -0.35 * up], ff: [0.22 + 0.32 * up, -0.28 * up] }, face: { lid: 0, brow: -0.7, look: [0.8, -0.6] } }); g.restore();
    cross(g, 820, 520, 230, t - wt(0, "climb") - 0.15);
  } },
  // C. can't hide: a tree far too small
  { at: W0(0, "can't", 2), frame: () => [560, 1000, 1.0], draw: (g, t) => {
    savanna(g, t, 1170, 4, 0, { trees: false });
    floor(g, 560, 1455, 600, 9);
    giraffeFront(g, 560, 1450, 400, { lid: 0, brow: -0.7, look: [0.5, 0.2] });
    const sp: P = [700, 380 + ((t * 300) % 80)]; group(g, [{ path: spline([[sp[0], sp[1] - 26], [sp[0] + 16, sp[1] + 4], [sp[0], sp[1] + 18], [sp[0] - 16, sp[1] + 4]], true, 0.5), fill: "#a8d3e6", shade: false }], 2.4, 0);
    tree(g, 560, 1470, 230); bush(g, 560, 1480, 180);
    cross(g, 840, 560, 230, t - wt(0, "hide") - 0.2);
  } },
  // D. nearly dies every time it drinks
  { at: W0(0, "and"), frame: () => [540, 1000, 1.0], draw: (g, t, lt) => {
    const danger = t - wt(0, "drinks"); if (danger > 0) shakeAt(g, t, Math.max(0, 8 - danger * 10));
    savanna(g, t, 1180, 41);
    group(g, [{ path: ell(700, 1440, 330, 56), fill: "#5e93a6" }], 3.6, 5); taper(g, [[540, 1428], [620, 1424], [680, 1426]], 5, "rgba(240,240,230,0.7)");
    floor(g, 340, 1450, 560, 10);
    giraffeSide(g, 320, 1450, 420, { tilt: 0.12, neckAng: 0.62, neckLen: 1.0, headAng: 1.35, feet: { fn: [0.98, 0.05], ff: [0.78, 0.05], hn: [-0.55, 0.04], hf: [-0.76, 0.04] }, bends: { fn: 0.06, ff: 0.06 }, face: { lid: danger > 0 ? 0 : 0.15, brow: -0.4, look: [-1, -0.4] } });
    const ph = lt * 2 * Math.PI * 1.1; lioness(g, -120 + lt * 0.77 * 180 * 0.55, 1478, 180, "walk", { lid: 0.55, brow: 0.7, look: [1, 0] }, false, 0, ph);
    tuft(g, 60, 1500, 90, t, 3); tuft(g, 180, 1510, 70, t, 5);
    bang(g, 560, 900, 130, danger); cross(g, 540, 560, 230, danger - 0.1);
  } },
  // E. the splits, close
  { at: W0(1, "to"), frame: (lt) => [520, 1150, 1.25 + 0.08 * ease(lt / 2.2)], draw: (g, t, lt) => {
    savanna(g, t, 1180, 51);
    group(g, [{ path: ell(700, 1440, 330, 56), fill: "#5e93a6" }], 3.6, 5);
    const rip = frac(lt * 1.1); g.strokeStyle = `rgba(240,245,240,${(1 - rip).toFixed(2)})`; g.lineWidth = 4; g.stroke(ell(760, 1438, 20 + rip * 90, 5 + rip * 18));
    floor(g, 340, 1450, 560, 10);
    giraffeSide(g, 320, 1450, 420, { tilt: 0.12, neckAng: 0.62, neckLen: 1.0, headAng: 1.35 + Math.sin(lt * 2) * 0.03, feet: { fn: [0.98, 0.05], ff: [0.78, 0.05], hn: [-0.55, 0.04], hf: [-0.76, 0.04] }, bends: { fn: 0.06, ff: 0.06 }, face: { lid: blinkLid(t, 0.3), brow: -0.2, look: [-0.6, -0.2] } });
    if (lt > 0.8) { label(g, "THE SPLITS!", 560, 860, 74, (lt - 0.8) * 3); arrow(g, [560, 900], [690, 1270]); arrow(g, [560, 900], [420, 1300]); }
  } },
  // F. checks for lions for up to an hour (eyes darting, clock sweeping)
  { at: W0(1, "so"), frame: () => [560, 980, 1.0], draw: (g, t, lt, d) => {
    savanna(g, t, 1180, 61);
    floor(g, 600, 1455, 560, 11);
    const look = Math.sin(lt * 3.2) > 0 ? 1 : -1;
    giraffeSide(g, 620, 1450, 400, { neckAng: -1.4, neckLen: 1.1, headAng: 0.1 + look * 0.12, face: { lid: 0, brow: -0.2, look: [look, 0] } });
    clock(g, 260, 560, 140, ease(lt / Math.max(0.5, d - 0.3)));
    label(g, "UP TO 1 HOUR", 260, 760, 62, lt * 3, INKD);
  } },
  // G. nearly six metres tall, the best lookout
  { at: W0(2, "but"), frame: () => [540, 980, 1.0], draw: (g, t, lt) => {
    savanna(g, t, 1250, 71, 0, { trees: false }); tree(g, 880, 1252, 85); tree(g, 990, 1252, 55);
    floor(g, 420, 1455, 560, 12);
    giraffeSide(g, 400, 1450, 450, { neckAng: -1.45, neckLen: 1.22, headAng: 0.05, face: { lid: lt > 2 ? 0 : blinkLid(t, 0.5), brow: lt > 2 ? -0.5 : 0.3, look: [1, 0.3] } });
    lioness(g, 915, 1264, 60, "crouch", { lid: 0.5, brow: 0.6, look: [-1, 0] }, true); tuft(g, 870, 1270, 40, t, 9); tuft(g, 950, 1272, 36, t, 10);
    // ruler
    taper(g, [[90, 1450], [90, 900], [90, 330]], 7, "#3d5f86"); for (const yy of [1450, 330]) taper(g, [[60, yy], [120, yy]], 7, "#3d5f86"); label(g, "~6 m", 110, 280, 64, lt * 3, "#3d5f86");
    const k = ease((lt - 1.0) / 0.9); if (k > 0) { g.save(); g.setLineDash([16, 14]); g.strokeStyle = RED; g.lineWidth = 5; g.beginPath(); g.moveTo(560, 330); g.lineTo(560 + (890 - 560) * k, 330 + (1235 - 330) * k); g.stroke(); g.restore(); }
    bang(g, 545, 290, 140, t - wt(2, "lookout"));
  } },
  // H. zebras follow giraffes and use them as an alarm (tracking shot)
  { at: W0(3, "zebras"), frame: () => [540, 1000, 1.0], draw: (g, t, lt) => {
    const sG = 340, walking = t < ALARM, tw = Math.min(lt, ALARM - SH[7].at), Gv = gait("walk", tw).speed * sG, scroll = tw * Gv;
    savanna(g, t, 1180, 81, scroll);
    floor(g, 600, 1452, 500, 13);
    if (walking) giraffeWalk(g, 640, 1450, sG, "walk", tw, { face: { lid: blinkLid(t, 0.4), brow: 0, look: [1, 0] } });
    else giraffeSide(g, 640, 1450, sG, { feet: gait("walk", tw).feet, neckAng: -1.4, headAng: -0.05, face: { lid: 0, brow: -0.7, look: [1, -0.3] } });
    const zf = Gv / (4 * 0.17 * 190), zp = tw * 2 * Math.PI * zf;
    zebra(g, 250, 1470, 190, zp + 0.8, walking); zebra(g, 470, 1530, 210, zp, walking);
    tuft(g, 120 - (scroll * 1.1) % 1200 + 1200, 1560, 110, t, 4);
    if (!walking) { const a = t - ALARM; bang(g, 900, 560, 150, a); for (let r = 0; r < 3; r++) { const rr = frac(a * 1.5 + r / 3); g.strokeStyle = `rgba(184,64,43,${(1 - rr).toFixed(2)})`; g.lineWidth = 7; g.beginPath(); g.arc(860, 590, 60 + rr * 260, -1.3, -0.2); g.stroke(); } }
  } },
  // I. sprint at sixty km/h
  { at: W0(4, "if"), frame: () => [540, 1000, 1.0], draw: (g, t, lt) => {
    const sG = 330, G0 = gait("gallop", t), scroll = lt * G0.speed * sG;
    savanna(g, t, 1180, 31, scroll);
    for (let i = 0; i < 5; i++) { const o = frac(t * 3 + i * 0.37) * 140; taper(g, [[420 - o - 220, 900 + i * 40], [420 - o, 900 + i * 40]], 5, "rgba(250,240,215,0.9)"); }
    floor(g, 620, 1452, 420, 14);
    giraffeWalk(g, 650, 1450, sG, "gallop", t, { headAng: 0.35, face: { lid: 0.35, brow: 0.6, look: [1, 0] } });
    lioness(g, 290 - lt * 70, 1490, 150, "run", { lid: 0.2, brow: -0.6, look: [1, 0], worried: true }, false, 0, t * 2 * Math.PI * 2.6);
    setSeed(Math.floor(t * 12)); for (let i = 0; i < 5; i++) group(g, [{ path: ell(470 - i * 40 - rnd() * 30, 1440 - rnd() * 40, 26 + rnd() * 20, 18 + rnd() * 12), fill: "rgba(232,214,170,0.85)", shade: false }], 0.01, 0);
    speedo(g, 800, 420, 150, ease((t - wt(4, "sprint")) / 1.2));
  } },
  // J. and if it can't run? (cornered, lioness lunging, darkening)
  { at: W0(5, "and"), frame: (lt) => [560, 1050, 1.0 + 0.12 * ease(lt / 1.6)], draw: (g, t, lt) => {
    savanna(g, t, 1180, 111);
    floor(g, 700, 1455, 520, 15);
    giraffeSide(g, 720, 1450, 380, { neckAng: -1.5, headAng: -0.25, face: { lid: 0, brow: -0.8, look: [-1, 0.2] } }, true);
    const k = ease(lt / 1.4); lioness(g, 120 + k * 200, 1470 - Math.sin(k * Math.PI) * 120, 210, "run", { lid: 0.55, brow: 0.9, look: [1, 0] }, false, -0.15 * k, 0.6 + lt * 3);
    vignette(g, k);
  } },
  // K. one kick from an adult giraffe can kill a lion
  { at: W0(6, "one"), frame: () => [560, 1020, 1.0], draw: (g, t) => {
    const hit = t - HIT; if (hit > 0) shakeAt(g, t, Math.max(0, 16 - hit * 20));
    savanna(g, t, 1250, 121, 0, { trees: false }); tree(g, 960, 1252, 105);
    floor(g, 660, 1455, 600, 16);
    const kick = hit < -0.22 ? 0 : hit < 0 ? ease((hit + 0.22) / 0.22) : hit < 0.4 ? 1 : 1 - ease((hit - 0.4) / 0.3);
    giraffeSide(g, 680, 1450, 380, { neckAng: -1.35, headAng: 0.35, feet: { hn: lerp([-0.38, 0], [-1.02, -0.62], kick) }, bends: { hn: 0.05 - 0.11 * kick }, face: { lid: hit > 0.6 ? 0.6 : 0.55, brow: hit > 0.6 ? -0.2 : 0.8, look: [-1, 0.3] } });
    if (hit < 0) { const k = ease((hit + 1.2) / 1.2); lioness(g, 60 + k * 170, 1480, 210, "run", { lid: 0.5, brow: 0.9, look: [1, 0] }, false, 0, t * 16); }
    else if (hit < 0.6) { const fl = hit / 0.6; lioness(g, 360 - fl * 90, 1200 - Math.sin(fl * Math.PI) * 220, 200, "fly", { lid: 0, brow: -0.7, look: [0, 0], worried: true }, false, -0.9 - fl * 2.2); }
    else { lioness(g, 250, 1480, 190, "crouch", { lid: 0.75, brow: -0.4, look: [0, 0] }); const a0 = t * 5; for (let i = 0; i < 3; i++) { const a = a0 + (i * Math.PI * 2) / 3; star(g, 330 + Math.cos(a) * 80, 1340 + Math.sin(a) * 22, 17); } }
    if (hit > 0 && hit < 0.35) { burst(g, 330, 1210, 70 + hit * 160); label(g, "WHAM!", 330, 1000, 120, 1); }
  } },
  // L. that's why lions mostly go after the babies
  { at: W0(7, "that's"), frame: () => [560, 1000, 1.0], draw: (g, t, lt) => {
    savanna(g, t, 1250, 52, 0, { trees: false }); tree(g, 960, 1252, 110);
    floor(g, 640, 1455, 860, 17);
    giraffeSide(g, 600, 1445, 420, { neckAng: -1.45, headAng: 0.55, face: { lid: blinkLid(t, 0.6), brow: 0.85, look: [-0.6, 0.6] } }, true);
    giraffeSide(g, 900, 1462, 245, { neckAng: -1.2 + Math.sin(t * 1.5) * 0.04, neckLen: 0.8, headAng: 0.1, face: { lid: blinkLid(t, 0.1, 1.1), brow: -0.3, look: [-0.8, 0] } }, true);
    lioness(g, -60 + lt * 0.77 * 200 * 0.5, 1482, 200, "walk", { lid: 0.5, brow: 0.6, look: [1, -0.2] }, false, 0, lt * 2 * Math.PI * 0.6);
    tuft(g, 40, 1510, 100, t, 6);
  } },
  // M. ...and it's exactly why -> back to the opening frame (loop)
  { at: W0(7, "and"), frame: (lt, d) => [560, 980, 1.05 - 0.05 * ease(lt / Math.max(0.4, d))], draw: (g, t) => hook(g, t) },
];
void shade; void G_COAT; void LINE; void (null as unknown as Face);

export const drawAt = (g: CanvasRenderingContext2D, W: number, H: number, t: number) => {
  let k = 0; while (k + 1 < SH.length && t >= SH[k + 1].at) k++;
  const s = SH[k], lt = t - s.at, d = (SH[k + 1]?.at ?? DURATION) - s.at;
  g.save(); g.scale(W / 1080, H / 1920);
  g.save();
  const [fx, fy, z] = s.frame ? s.frame(lt, d) : [540, 960, 1];
  const zz = k > 0 ? 1 + 0.18 * (1 - ease(lt / 0.16)) : 1;
  g.translate(540, 960); g.scale(z * zz, z * zz); g.translate(-fx, -fy);
  s.draw(g, t, lt, d);
  g.restore();
  // paper grain over the whole picture
  g.save(); g.globalCompositeOperation = "overlay"; g.globalAlpha = 0.55; g.drawImage(grainTex(), 0, 0, 1080, 1920); g.restore();
  if (k > 0 && lt < 0.12) { const a = 1 - lt / 0.12; for (let i = 0; i < 16; i++) { g.fillStyle = `rgba(250,242,222,${(0.5 * a).toFixed(3)})`; g.fillRect(0, (i * 127 + 40) % 1920, 1080, 10 + (i % 3) * 8); } }
  drawCaptions(g, CAPS, t, { ...CAP_STYLE, cx: 540, y: 1660, size: 112 });
  g.restore();
};
(window as unknown as { INK_VIDEO: unknown }).INK_VIDEO = { duration: DURATION, drawAt, cuts: SH.map((s) => s.at) };
