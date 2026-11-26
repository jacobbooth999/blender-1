// "Why Lions Are Scared of Giraffes": a 34 s vertical Short rebuilt from retention research (paradox hook in the first
// 2 s, a fresh beat every 1-3 s, an open question mid-way, the kick as payoff, and a last line that loops into the
// first). Helpers below are shared with the long giraffe video. Original note:
// explainer look and animated per frame: slow push-ins, blinks, tail swishes, gallop cycles, a pumping heart,
// flowing dashed lines. Every shot starts on its sentence (timeline.json); long sentences get two shots.
import { Ink, P, INKC, PAPER, RED, BLUE } from "./ink2d";
import { giraffeHead, acacia } from "./animals2d";
import { quad, gaitSpeed, GIRAFFE, CALF, ANCESTOR, LIONESS, ZEBRA, Species } from "./quadruped";
const MIDNECK: Species = { ...GIRAFFE, neckLen: 0.6, neckW0: 0.26, neckW1: 0.11 };
import TL from "../../../videos_ink/giraffe2/timeline.json";
import WORDS from "../../../videos_ink/giraffe2/words.json";
import { buildChunks, drawCaptions, DEFAULT_STYLE, CapWord } from "./captions";
import { setLook, postLook } from "./styles";
// this Short uses the ink-outline look (style option 2); --style overrides it
(globalThis as { INK_STYLE?: string }).INK_STYLE ??= "ink";
const STYLE = () => (globalThis as { INK_STYLE?: string }).INK_STYLE ?? "classic";
/** "short" = vertical 9:16 re-framing of every shot (1080 x 1920 output) */
const SHORTV = () => (globalThis as { INK_FORMAT?: string }).INK_FORMAT === "short";
const CAPS = buildChunks(WORDS.words as CapWord[]);
const CAP_STYLE = DEFAULT_STYLE(["lions", "scared", "climb", "hide", "dies", "splits", "hour", "six", "lookout", "zebras", "alarm", "sixty", "run", "kick", "kill", "babies"]);
/** onset (s) of the n-th occurrence of a script word in sentence i (from words.json) */
const wt = (i: number, w: string, n = 1) => { let k = 0; for (const x of WORDS.words as CapWord[]) if (x.i === i && x.word.toLowerCase().replace(/[^a-z0-9']/g, "") === w) { k++; if (k === n) return x.start; } throw new Error(`no word ${w} in ${i}`); };

type S = { i: number; text: string; start: number; end: number };
const SEN = TL.sentences as S[];
export const DURATION = TL.duration;
/** time (s) at a fraction of a sentence, by characters before `word` (e.g. split a long line at "allowing") */
const at = (i: number, word?: string) => { const s = SEN[i]; if (!word) return s.start; const k = s.text.indexOf(word); return s.start + (s.end - s.start) * (k / s.text.length); };
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const hash = (n: number) => { const v = Math.sin(n * 127.1) * 43758.5453; return v - Math.floor(v); };
/** blink: shut for ~0.12 s every 2-4 s */
const blink = (t: number, seed: number) => { const p = 2.2 + hash(seed) * 1.8; return ((t + hash(seed + 1) * p) % p) < 0.12; };

// ---------------- scenery ----------------
const sky = (ink: Ink, hor: number, stops: [number, string][]) => { ink.g.fillStyle = ink.vgrad(0, hor, stops); ink.g.fillRect(-2000, -3000, 6000, hor + 6000); };
const ground = (ink: Ink, y0: number, a: string, b: string, tufts = 220, seed = 1) => {
  const pts: P[] = [[-200, y0], [2120, y0], [2120, 1300], [-200, 1300]];
  ink.shape([[-2000, y0], [4000, y0], [4000, 4000], [-2000, 4000]], ink.vgrad(y0, 1080, [[0, a], [1, b]]), null);
  ink.seed(seed); ink.hatch(pts, tufts, 16, "rgba(110,90,40,0.45)", 2.2, -Math.PI / 2, 0.7);
};
const hills = (ink: Ink, y: number, amp: number, col: string, seed: number, freq = 2) => {
  ink.seed(seed); const ph = ink.r() * 6, ph2 = ink.r() * 6, pts: P[] = [[-200, 1300]];
  for (let x = -200; x <= 2120; x += 30) pts.push([x, y - amp * (0.6 * Math.sin((x / 1920) * Math.PI * freq + ph) + 0.4 * Math.sin((x / 1920) * Math.PI * freq * 2.7 + ph2))]);
  pts.push([2120, 1300]); ink.shape(pts, col, 2.4);
};
const sun = (ink: Ink, x: number, y: number, r: number, col = "#fbe39a") => ink.ell(x, y, r, r, col, 2.4);
const cloud = (ink: Ink, x: number, y: number, s: number) => { for (const [dx, dy, r] of [[0, 0, 50], [55, -18, 60], [115, 0, 48]]) ink.ell(x + dx * s, y + dy * s, r * s, r * s * 0.7, "#ffffff", null); };
const tallGrass = (ink: Ink, x0: number, x1: number, y: number, h: number, seed: number, col = "#c9a24a", t = 0) => {
  ink.seed(seed);
  for (let x = x0; x < x1; x += 7) { const hh = h * (0.6 + ink.r() * 0.6), sw = Math.sin(t * 1.5 + x * 0.02) * 6; ink.line(ink.curve([x, y], [x + 3 + sw * 0.5, y - hh * 0.5], [x + (ink.r() - 0.5) * 20 + sw, y - hh]), 3, ink.r() < 0.5 ? col : "#a8823a", 0.2); }
};
// ---- richer savanna backdrop: layered depth (haze mountain, ridges, tree line, herds, rocks, bushes, foreground) ----
const rnd = (seed: number) => { let x = seed * 9301 + 49297; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; };
const farTree = (ink: Ink, x: number, y: number, h: number, col: string) => {
  ink.line([[x, y], [x + h * 0.05, y - h * 0.55]], Math.max(2, h * 0.07), col, 0.1);
  ink.line([[x + h * 0.03, y - h * 0.4], [x - h * 0.25, y - h * 0.75]], Math.max(1.5, h * 0.04), col, 0.1);
  ink.line([[x + h * 0.04, y - h * 0.45], [x + h * 0.3, y - h * 0.78]], Math.max(1.5, h * 0.04), col, 0.1);
  ink.ell(x + h * 0.02, y - h * 0.82, h * 0.62, h * 0.16, col, null);
};
const farElephant = (ink: Ink, x: number, y: number, s: number, col: string, t: number) => {
  const sw = Math.sin(t * 3) * s * 0.06;
  for (const [dx, ph] of [[-0.32, 0], [-0.18, 1], [0.18, 1], [0.32, 0]] as const) ink.shape([[x + dx * s - s * 0.06, y - s * 0.4], [x + dx * s + s * 0.06, y - s * 0.4], [x + dx * s + s * 0.06 + (ph ? sw : -sw), y], [x + dx * s - s * 0.06 + (ph ? sw : -sw), y]], col, null);
  ink.ell(x, y - s * 0.55, s * 0.48, s * 0.28, col, null);
  ink.ell(x + s * 0.5, y - s * 0.6, s * 0.2, s * 0.2, col, null);
  ink.line([[x + s * 0.64, y - s * 0.55], [x + s * 0.72, y - s * 0.25], [x + s * 0.68, y - s * 0.08]], s * 0.08, col, 0.1);
  ink.ell(x + s * 0.4, y - s * 0.62, s * 0.14, s * 0.2, col, null);
};
const bird = (ink: Ink, x: number, y: number, s: number, t: number) => { const f = Math.sin(t * 9) * s * 0.35; ink.line([[x - s, y - f], [x - s * 0.4, y - s * 0.25], [x, y + s * 0.05]], 3, "#4d5b66", 0.1); ink.line([[x, y + s * 0.05], [x + s * 0.4, y - s * 0.25], [x + s, y - f]], 3, "#4d5b66", 0.1); };
const kopje = (ink: Ink, x: number, y: number, s: number) => {
  for (const [dx, dy, rx, ry, c] of [[-0.55, 0, 0.5, 0.32, "#a78e70"], [0.35, 0, 0.62, 0.4, "#b39a7a"], [-0.05, -0.38, 0.5, 0.36, "#bda483"], [0.55, -0.5, 0.32, 0.26, "#c4ab8a"]] as const) {
    ink.ell(x + dx * s, y + dy * s - ry * s * 0.6, rx * s, ry * s, c, null);
    ink.ell(x + dx * s + rx * s * 0.25, y + dy * s - ry * s * 0.35, rx * s * 0.7, ry * s * 0.55, "rgba(90,70,50,0.18)", null);
  }
};
const termite = (ink: Ink, x: number, y: number, h: number) => { ink.shape([[x - h * 0.3, y], [x - h * 0.16, y - h * 0.55], [x - h * 0.06, y - h], [x + h * 0.05, y - h * 0.92], [x + h * 0.12, y - h * 0.6], [x + h * 0.2, y - h * 0.4], [x + h * 0.32, y]], "#c88d5c", null); ink.shape([[x + h * 0.05, y - h * 0.9], [x + h * 0.12, y - h * 0.6], [x + h * 0.2, y - h * 0.4], [x + h * 0.32, y], [x + h * 0.08, y]], "rgba(120,60,30,0.22)", null); };
const bush = (ink: Ink, x: number, y: number, s: number, col: string) => { for (const [dx, dy, r] of [[-0.5, -0.3, 0.45], [0.1, -0.55, 0.55], [0.6, -0.3, 0.42], [0, -0.2, 0.5]] as const) ink.ell(x + dx * s, y + dy * s, r * s, r * s * 0.8, col, null); ink.ell(x + 0.15 * s, y - 0.12 * s, 0.9 * s, 0.22 * s, "rgba(60,60,20,0.18)", null); };
const savanna = (ink: Ink, t: number, hor = 640, seed = 1, scroll = 0) => {
  const g = ink.g, R = rnd(seed), par = (k: number, x: number) => { const span = 3400, v = (((x - scroll * k) % span) + span) % span; return v - 800; };
  // sky: warm haze at the horizon, a second cloud layer, birds
  sky(ink, hor, [[0, "#64ace0"], [0.55, "#a7d4ee"], [0.9, "#f3e6c6"], [1, "#f6dcb0"]]);
  sun(ink, 1650, 150, 62); g.save(); g.globalAlpha = 0.35; ink.ell(1650, 150, 110, 110, "#fff4c8", null); g.restore();
  for (const [x, y, sc, v] of [[-300, 40, 1.3, 3], [300, 140, 1, 6], [1100, 90, 0.8, 4], [1500, 260, 0.6, 2], [700, -120, 1.4, 5], [-100, -260, 1.1, 3], [1300, -200, 1.2, 4]]) {
    const cx = par(0.05, x + t * v); g.save(); g.globalAlpha = 0.95; cloud(ink, cx, y, sc); g.globalAlpha = 0.25; ink.ell(cx + 60 * sc, y + 22 * sc, 120 * sc, 18 * sc, "#9ab7cf", null); g.restore();
  }
  for (let k = 0; k < 5; k++) bird(ink, par(0.1, 200 + k * 70 + t * 60 + (k % 2) * 30), hor - 360 + (k % 3) * 28 - k * 6, 14 - k, t + k * 0.4);
  // far: a hazy snow-capped mountain and two ridges
  const mx = par(0.08, 1250 + R() * 300);
  ink.shape([[mx - 700, hor], [mx - 260, hor - 190], [mx - 120, hor - 235], [mx + 110, hor - 240], [mx + 260, hor - 200], [mx + 760, hor]], "#aebcd0", null);
  ink.shape([[mx - 150, hor - 228], [mx - 120, hor - 235], [mx + 110, hor - 240], [mx + 150, hor - 225], [mx + 90, hor - 205], [mx + 30, hor - 218], [mx - 40, hor - 200], [mx - 100, hor - 215]], "#eef3f7", null);
  g.save(); g.translate(-((scroll * 0.15) % 1920), 0); for (const k of [-1, 0, 1, 2]) { g.save(); g.translate(k * 1920, 0); hills(ink, hor - 30, 34, "#c2bfa0", seed + 3, 1.5); g.restore(); } g.restore();
  g.save(); g.translate(-((scroll * 0.25) % 1920), 0); for (const k of [-1, 0, 1, 2]) { g.save(); g.translate(k * 1920, 0); hills(ink, hor - 6, 18, "#b4ae82", seed + 7, 2.4); g.restore(); } g.restore();
  // ground with dry patches
  ground(ink, hor, "#dcc27a", "#c9a55a", 0, seed);
  for (let k = 0; k < 14; k++) { const x = par(0.9, R() * 3400 - 600), y = hor + 40 + R() * 900, w = 120 + R() * 260; ink.ell(x, y, w * (0.6 + (y - hor) / 900), w * 0.05 * (0.5 + (y - hor) / 600), R() < 0.5 ? "rgba(176,140,70,0.2)" : "rgba(238,214,150,0.28)", null); }
  // distant tree line and a herd
  for (let k = 0; k < 16; k++) { const x = par(0.3, R() * 3400 - 600), h = 26 + R() * 40; farTree(ink, x, hor + 2, h, "#8f9a66"); }
  for (let k = 0; k < 4; k++) farElephant(ink, par(0.35, 300 + k * 46 + (k % 2) * 12 - t * 8), hor + 8 + (k % 2) * 3, 26 - (k % 2) * 6, "#8b8572", t + k);
  // mid-ground: kopje, termite mounds, bushes
  kopje(ink, par(0.5, 1700 + R() * 200), hor + 30, 110);
  termite(ink, par(0.6, 250 + R() * 200), hor + 60, 90); termite(ink, par(0.6, 1450 + R() * 200), hor + 40, 55);
  for (let k = 0; k < 7; k++) { const x = par(0.6, R() * 3400 - 600), y = hor + 30 + R() * 90; bush(ink, x, y, 26 + (y - hor) * 0.35, R() < 0.5 ? "#8aa457" : "#7a9650"); }
  // grass texture, denser and longer towards the camera, plus pebbles and a few flowers down front
  ink.seed(seed); g.save(); g.translate(-((scroll * 0.9) % 1920), 0);
  for (const k of [-1, 0, 1]) { g.save(); g.translate(k * 1920, 0); ink.hatch([[0, hor], [1920, hor], [1920, hor + 260], [0, hor + 260]], 200, 12, "rgba(110,90,40,0.4)", 2, -Math.PI / 2, 0.7); ink.hatch([[0, hor + 260], [1920, hor + 260], [1920, hor + 1200], [0, hor + 1200]], 520, 26, "rgba(110,90,40,0.45)", 2.6, -Math.PI / 2, 0.8); g.restore(); }
  g.restore();
  for (let k = 0; k < 26; k++) { const x = par(1.1, R() * 3400 - 600), y = hor + 520 + R() * 900, r = 6 + R() * 14; ink.ell(x, y, r * 1.5, r, R() < 0.5 ? "#b8a888" : "#a8977a", null); ink.ell(x - r * 0.3, y - r * 0.3, r * 0.6, r * 0.35, "rgba(255,255,255,0.35)", null); }
  for (let k = 0; k < 7; k++) { const x = par(1.0, R() * 3400 - 600), y = hor + 500 + R() * 900, sc = 0.6 + (y - hor) / 900; bush(ink, x, y, 40 * sc, R() < 0.5 ? "#9aac5a" : "#86a050"); }
  for (let k = 0; k < 44; k++) { const x = par(1.1, R() * 3400 - 600), y = hor + 420 + R() * 1000, sc = 0.6 + (y - hor) / 700; tallGrass(ink, x, x + (40 + R() * 50) * sc, y, (45 + R() * 45) * sc, seed + k, "#c9a24a", t); if (R() < 0.35) for (let f = 0; f < 3; f++) ink.ell(x + 10 + f * 14, y - 40 - f * 9, 6, 6, R() < 0.5 ? "#f4f0e6" : "#f2c14e", null); }
};
const paper = (ink: Ink) => { const g = ink.g; g.fillStyle = PAPER; g.fillRect(-2000, -3000, 6000, 8000); ink.seed(99); for (let i = 0; i < 300; i++) { g.fillStyle = "rgba(120,110,90,0.035)"; g.fillRect(ink.r() * 1920, ink.r() * 1080, 2, 2); } };
const dashed = (ink: Ink, pts: P[], col = INKC, w = 3, off = 0, dash = [16, 14]) => { const g = ink.g; g.save(); g.setLineDash(dash); g.lineDashOffset = -off; g.strokeStyle = col; g.lineWidth = w; g.lineCap = "round"; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.restore(); };
const arrow = (ink: Ink, a: P, b: P, col = INKC, w = 4) => { ink.line([a, b], w, col, 0.8); const ang = Math.atan2(b[1] - a[1], b[0] - a[0]); for (const s of [-1, 1]) ink.line([b, [b[0] - Math.cos(ang + s * 0.5) * 26, b[1] - Math.sin(ang + s * 0.5) * 26]], w, col, 0.3); };
const check = (ink: Ink, x: number, y: number, s: number) => ink.line([[x - s * 0.5, y], [x - s * 0.15, y + s * 0.4], [x + s * 0.55, y - s * 0.45]], s * 0.14, "#3f9a4f", 0.6);
const cross = (ink: Ink, x: number, y: number, s: number) => { ink.line([[x - s / 2, y - s / 2], [x + s / 2, y + s / 2]], s * 0.14, RED, 0.6); ink.line([[x + s / 2, y - s / 2], [x - s / 2, y + s / 2]], s * 0.14, RED, 0.6); };
const bang = (ink: Ink, x: number, y: number, s: number, k: number) => { if (k <= 0) return; const q = ease(k * 3) * s; ink.shape([[x - q * 0.12, y - q], [x + q * 0.12, y - q], [x + q * 0.06, y - q * 0.3], [x - q * 0.06, y - q * 0.3]], RED, 2.4); ink.ell(x, y - q * 0.1, q * 0.08, q * 0.08, RED, 2.4); };
const speedLines = (ink: Ink, x: number, y: number, n: number, len: number, t: number) => { for (let i = 0; i < n; i++) { const o = ((t * 3 + i * 0.37) % 1) * 120; ink.line([[x - o - len, y + i * 34], [x - o, y + i * 34]], 4, "rgba(255,255,255,0.95)", 0.3); } };
const dust = (ink: Ink, x: number, y: number, t: number) => { for (let i = 0; i < 5; i++) { const k = (t * 1.5 + i * 0.2) % 1; ink.ell(x - k * 160 - i * 20, y - k * 40, 30 + k * 40, 22 + k * 25, `rgba(225,205,160,${(0.8 * (1 - k)).toFixed(3)})`, null); } };
const shake = (g: CanvasRenderingContext2D, t: number, amt: number) => g.translate(Math.sin(t * 61) * amt, Math.cos(t * 47) * amt * 0.7);
/** big red X stamp: slams in with overshoot, holds, fades */
const stamp = (ink: Ink, x: number, y: number, k: number) => {
  if (k < 0 || k > 0.75) return;
  const g = ink.g, s = k < 0.08 ? 1.8 - 0.8 * (k / 0.08) : 1, a = k > 0.55 ? 1 - (k - 0.55) / 0.2 : 1;
  g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(-0.12); g.scale(s, s);
  for (const [w, c] of [[44, "#ffffff"], [26, RED]] as const) { ink.line([[-110, -110], [110, 110]], w, c, 0.4); ink.line([[110, -110], [-110, 110]], w, c, 0.4); }
  g.restore();
};
const label = (ink: Ink, s: string, x: number, y: number, size = 56, col = INKC, k = 1) => { ink.g.globalAlpha = clamp01(k); ink.text(s, x, y, size, "Patrick Hand", col); ink.g.globalAlpha = 1; };
const title = (ink: Ink, s: string, x: number, y: number, size: number, k = 1) => { const g = ink.g; g.save(); g.globalAlpha = clamp01(k * 2); g.translate(x, y); const sc = 0.92 + 0.08 * ease(k * 2.5); g.scale(sc, sc); ink.text(s, 0, 0, size, "Bangers", INKC); g.restore(); };

// ---------------- shots ----------------

type Shot = { at: number; whip?: boolean; frame: (lt: number, d: number) => [number, number, number]; draw: (ink: Ink, t: number, lt: number, d: number) => void };
const stars = (ink: Ink, x: number, y: number, r: number, t: number) => { for (let k = 0; k < 3; k++) { const a = t * 5 + (k * Math.PI * 2) / 3, sx = x + Math.cos(a) * r, sy = y + Math.sin(a) * r * 0.35, s2 = r * 0.22; ink.shape([[sx, sy - s2], [sx + s2 * 0.3, sy - s2 * 0.3], [sx + s2, sy], [sx + s2 * 0.3, sy + s2 * 0.3], [sx, sy + s2], [sx - s2 * 0.3, sy + s2 * 0.3], [sx - s2, sy], [sx - s2 * 0.3, sy - s2 * 0.3]], "#ffd33d", null); } };
const clock = (ink: Ink, x: number, y: number, r: number, k: number) => {
  ink.ell(x, y, r, r, PAPER, 5); for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; ink.line([[x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8], [x + Math.cos(a) * r * 0.92, y + Math.sin(a) * r * 0.92]], 4, INKC, 0.1); }
  const g = ink.g; g.save(); g.globalAlpha = 0.25; g.fillStyle = RED; g.beginPath(); g.moveTo(x, y); g.arc(x, y, r * 0.75, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); g.closePath(); g.fill(); g.restore();
  const a = -Math.PI / 2 + Math.PI * 2 * k; ink.line([[x, y], [x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7]], 8, RED, 0.1); ink.line([[x, y], [x, y - r * 0.45]], 9, INKC, 0.1); ink.dot(x, y, 10);
};
/** opening / closing frame: a lioness cowering under a giraffe so tall it leaves the top of the frame (also the loop point) */
const lionScared = (ink: Ink, t: number, lt: number) => {
  savanna(ink, t, 660, 101);
  acacia(ink, 380, 700, 260, "#86a252", 102);
  quad(ink, GIRAFFE, 1330, 1040, 820, { gait: "stand", t, emotion: "smug", blink: blink(t, 31) });
  quad(ink, LIONESS, 760, 1040, 230, { gait: "stand", t: t * 0.5, emotion: "scared" }, false);
  tallGrass(ink, -50, 2000, 1095, 50, 103, "#c9a24a", t);
};
const W0 = (i: number, w: string, n = 1) => wt(i, w, n) - 0.1;
const SHOTS: Shot[] = [
  // A. "Lions are scared of an animal..." (reversal hook: the predator is the scared one)
  { at: 0, frame: (lt) => [1000, 640, 0.95 + 0.06 * ease(lt / 1.6)], draw: (ink, t, lt) => lionScared(ink, t, lt) },
  // B. "...can't climb," (rears up an acacia, slips)
  { at: W0(0, "can't"), whip: true, frame: () => [820, 600, 1.15], draw: (ink, t, lt) => {
    const g = ink.g; shake(g, t, 4);
    savanna(ink, t, 640, 91);
    const sway = Math.sin(lt * 22) * 0.05; g.save(); g.translate(1180, 1000); g.rotate(sway); g.translate(-1180, -1000); acacia(ink, 1180, 1000, 720, "#7c9a4a", 93); g.restore();
    ink.seed(94); for (let k = 0; k < 9; k++) { const fx = 900 + ink.r() * 600, fy = 330 + ((lt * (300 + ink.r() * 200) + ink.r() * 200) % 700); ink.ell(fx + Math.sin(lt * 6 + k) * 20, fy, 14, 7, "#7c9a4a", 2, lt * 4 + k); }
    const up = lt < 0.5 ? ease(lt / 0.2) : 1 - ease((lt - 0.5) / 0.18), px = 760 - 0.33 * 360;
    g.save(); g.translate(px, 1000); g.rotate(-0.62 * up); g.translate(-px, -1000);
    quad(ink, GIRAFFE, 760, 1000, 360, { emotion: "scared", gait: "stand", t, blink: false }); g.restore();
    stamp(ink, 960, 280, t - wt(0, "climb") - 0.15);
  } },
  // C. "...can't hide," (a tree far too small)
  { at: W0(0, "can't", 2), whip: true, frame: () => [930, 600, 1.15], draw: (ink, t, lt) => {
    savanna(ink, t); acacia(ink, 1500, 660, 220, "#86a252", 4);
    quad(ink, GIRAFFE, 1000, 980, 420, { emotion: "scared", gait: "stand", t, head: "front", blink: false, sweat: true }, true);
    acacia(ink, 960, 990, 330, "#7c9a4a", 5);
    tallGrass(ink, -50, 2000, 1090, 60, 7, "#c9a24a", t);
    stamp(ink, 960, 260, t - wt(0, "hide") - 0.2);
  } },
  // D. "...and nearly dies every time it drinks." (splayed at the waterhole, a lioness creeping up)
  { at: W0(0, "and"), whip: true, frame: () => [880, 640, 1.0], draw: (ink, t, lt) => {
    const g = ink.g, danger = t - wt(0, "drinks");
    if (danger > 0) shake(g, t, Math.max(0, 8 - danger * 10));
    savanna(ink, t, 600, 41); acacia(ink, 300, 640, 230, "#86a252", 42);
    ink.shape(ink.ellPts(1150, 845, 520, 80), "#9c7a52", null);
    ink.shape(ink.ellPts(1150, 848, 470, 62), ink.vgrad(790, 910, [[0, "#6fb2d6"], [1, "#3f86b8"]]), 2.4);
    quad(ink, GIRAFFE, 880, 815, 430, { emotion: "scared", gait: "drink", t, blink: false });
    quad(ink, LIONESS, 120 + lt * gaitSpeed(LIONESS, "walk") * 150 * 0.6, 880, 150, { emotion: "smug", gait: "stalk", t: lt * 0.6 });
    tallGrass(ink, -50, 560, 905, 100, 44, "#c9a24a", t);
    bang(ink, 1080, 330, 110, danger); stamp(ink, 960, 240, danger - 0.1);
  } },
  // E. "To drink, a giraffe has to do the splits," (big side view of the splits)
  { at: W0(1, "to"), whip: true, frame: (lt) => [980, 700, 1.05 + 0.08 * ease(lt / 2.2)], draw: (ink, t, lt) => {
    savanna(ink, t, 560, 51);
    ink.shape(ink.ellPts(1100, 905, 560, 85), "#9c7a52", null);
    ink.shape(ink.ellPts(1100, 908, 510, 66), ink.vgrad(850, 970, [[0, "#6fb2d6"], [1, "#3f86b8"]]), 2.4);
    const rip = (lt * 1.2) % 1; ink.arc(1230, 900, 30 + rip * 90, 7 + rip * 18, 0, Math.PI * 2, 3, `rgba(230,246,255,${(1 - rip).toFixed(2)})`);
    quad(ink, GIRAFFE, 820, 875, 520, { emotion: "neutral", gait: "drink", t });
    if (lt > 0.9) { label(ink, "THE SPLITS", 1320, 330, 70, RED, (lt - 0.9) * 3); arrow(ink, [1240, 380], [1060, 640], RED, 5); }
  } },
  // F. "...so it checks for lions for up to an hour first." (head up, eyes darting; a clock sweeps to 1 hour)
  { at: W0(1, "so"), whip: true, frame: () => [1000, 560, 0.9], draw: (ink, t, lt, d) => {
    savanna(ink, t, 640, 61); acacia(ink, 360, 690, 240, "#86a252", 62);
    quad(ink, GIRAFFE, 1150, 1010, 440, { emotion: "neutral", gait: "stand", t, head: "front", look: Math.sin(lt * 3.2) > 0 ? 1 : -1, neckAdd: 0.15 });
    clock(ink, 760, 330, 150, ease(lt / Math.max(0.5, d - 0.3)));
    label(ink, "UP TO 1 HOUR", 760, 535, 62, INKC, lt * 3);
  } },
  // G. "But at nearly six metres tall, it's the best lookout on the savanna." (height + a sight line to a far lion)
  { at: W0(2, "but"), whip: true, frame: () => [920, 560, 0.72], draw: (ink, t, lt) => {
    savanna(ink, t, 700, 71); acacia(ink, 1500, 730, 200, "#86a252", 72);
    quad(ink, GIRAFFE, 600, 1030, 470, { emotion: lt > 2 ? "surprised" : "neutral", gait: "stand", t, head: "front", neckAdd: 0.2, look: 1 });
    ink.line([[290, 1030], [290, 160]], 6, BLUE, 0.3); for (const y of [1030, 160]) ink.line([[260, y], [320, y]], 6, BLUE, 0.2);
    label(ink, "~6 m", 360, 140, 70, BLUE, lt * 3);
    quad(ink, LIONESS, 1420, 800, 50, { gait: "stalk", t: lt * 0.6 }, true); tallGrass(ink, 1330, 1560, 805, 30, 73, "#c9a24a", t);
    const k = ease((lt - 1.1) / 0.9); if (k > 0) dashed(ink, [[700, 200], [700 + (1390 - 700) * k, 200 + (770 - 200) * k]], RED, 5, t * 60);
  } },
  // H. "Zebras even follow giraffes around, just to use them as an alarm." (tracking shot, then the alarm)
  { at: W0(3, "zebras"), whip: true, frame: () => [900, 620, 0.95], draw: (ink, t, lt) => {
    const alarm = t - wt(3, "alarm"), walking = alarm < 0, g = ink.g;
    const v = walking ? gaitSpeed(GIRAFFE, "walk") * 400 : 0, off = Math.min(lt, wt(3, "alarm") - (SHOTS_AT.H)) * gaitSpeed(GIRAFFE, "walk") * 400;
    savanna(ink, t, 640, 81, off);
    for (let k = -1; k < 2; k++) { g.save(); g.translate(-((off * 0.6) % 1920) + k * 1920, 0); acacia(ink, 300, 700, 230, "#86a252", 83); acacia(ink, 1250, 710, 270, "#7c9a4a", 84); g.restore(); }
    void v;
    const tw = walking ? lt : wt(3, "alarm") - SHOTS_AT.H, kz = gaitSpeed(GIRAFFE, "walk") * 400 / (gaitSpeed(ZEBRA, "walk") * 170);
    quad(ink, ZEBRA, 560, 1000, 170, { gait: walking ? "walk" : "stand", t: tw * kz + 0.3 });
    quad(ink, GIRAFFE, 1050, 990, 400, { gait: walking ? "walk" : "stand", t: walking ? lt : t, emotion: walking ? "happy" : "surprised", neckAdd: walking ? 0 : 0.2 });
    quad(ink, ZEBRA, 760, 1035, 190, { gait: walking ? "walk" : "stand", t: tw * kz * 0.95 });
    if (!walking) { bang(ink, 1250, 260, 120, alarm); for (let r = 0; r < 3; r++) { const rr = ((alarm * 1.5 + r / 3) % 1); ink.arc(1200, 280, 60 + rr * 260, 60 + rr * 260, -1.2, -0.2, 6, `rgba(208,69,58,${(1 - rr).toFixed(2)})`); } }
  } },
  // I. "If a lion gets close, it can sprint at sixty kilometres an hour." (gallop, speedometer climbing)
  { at: W0(4, "if"), whip: true, frame: () => [1000, 620, 0.8], draw: (ink, t, lt) => {
    const g = ink.g, vG = gaitSpeed(GIRAFFE, "gallop") * 430, scroll = (lt * vG * 0.45) % 1920;
    savanna(ink, t, 640, 31, lt * vG);
    for (let k = 0; k < 2; k++) { g.save(); g.translate(-((lt * vG * 0.6) % 1920) + k * 1920, 0); acacia(ink, 400, 700, 240, "#86a252", 33); acacia(ink, 1300, 710, 300, "#7c9a4a", 34); g.restore(); }
    quad(ink, LIONESS, 380 - lt * 60, 990, 130, { gait: "gallop", t: t * 0.9, emotion: "sad" }); dust(ink, 290 - lt * 60, 990, t + 0.3);
    quad(ink, GIRAFFE, 1050, 1000, 430, { gait: "gallop", t, emotion: "determined" });
    speedLines(ink, 760, 520, 5, 220, t); dust(ink, 860, 1000, t);
    g.save(); g.translate(1250, 150); g.scale(1.3, 1.3); g.translate(-1690, -220);
    ink.ell(1690, 220, 140, 140, PAPER, 4); ink.arc(1690, 240, 105, 105, Math.PI, Math.PI * 2, 6, INKC);
    const needle = Math.PI + Math.PI * (0.15 + 0.7 * ease((t - wt(4, "sprint")) / 1.2)) + Math.sin(t * 20) * 0.02;
    ink.line([[1690, 240], [1690 + Math.cos(needle) * 90, 240 + Math.sin(needle) * 90]], 7, RED, 0.2); ink.dot(1690, 240, 12);
    ink.text(`${Math.round(60 * ease((t - wt(4, "sprint")) / 1.2))} km/h`, 1690, 300, 52, "Patrick Hand", INKC); g.restore();
  } },
  // J. "And if it can't run?" (cornered: the lioness lunges, time slows)
  { at: W0(5, "and"), whip: true, frame: (lt) => [960, 640, 0.9 + 0.12 * ease(lt / 1.6)], draw: (ink, t, lt) => {
    const g = ink.g;
    savanna(ink, t, 640, 111); acacia(ink, 1600, 690, 240, "#7c9a4a", 112);
    quad(ink, GIRAFFE, 1150, 1010, 420, { gait: "stand", t, emotion: "scared", head: "front", sweat: true }, true);
    const k = ease(lt / 1.4), lx = 520 + k * 260;
    g.save(); g.translate(lx, 1020); g.rotate(-0.18 * k); g.translate(-lx, -1020);
    quad(ink, LIONESS, lx, 1020 - k * 60, 200, { gait: "gallop", t: 0.1 + lt * 0.15, emotion: "angry" }); g.restore();
    const vg = g.createRadialGradient(960, 560, 300, 960, 560, 1200); vg.addColorStop(0, "rgba(20,10,30,0)"); vg.addColorStop(1, `rgba(20,10,30,${(0.3 * k).toFixed(2)})`); g.fillStyle = vg; g.fillRect(-1000, -1500, 4000, 4500);
  } },
  // K. "One kick from an adult giraffe can kill a lion." (the payoff)
  { at: W0(6, "one"), whip: true, frame: () => [960, 620, 0.85], draw: (ink, t, lt) => {
    const g = ink.g, hit = t - (wt(6, "kick") + 0.08);
    if (hit > 0) shake(g, t, Math.max(0, 14 - hit * 18));
    savanna(ink, t, 640, 121); acacia(ink, 1650, 690, 240, "#7c9a4a", 122);
    const kick = hit < -0.25 ? 0 : hit < 0 ? ease((hit + 0.25) / 0.25) : hit < 0.35 ? 1 : 1 - ease((hit - 0.35) / 0.3);
    quad(ink, GIRAFFE, 1120, 1010, 430, { gait: "stand", t, emotion: hit > 0.6 ? "smug" : "determined", kick });
    // the lioness: lunging in, then knocked flying and dazed on the ground
    if (hit < 0) quad(ink, LIONESS, 520 + ease((hit + 1) / 1) * 150, 1010, 190, { gait: "gallop", t: t * 0.9, emotion: "angry" });
    else { const fly = Math.min(1, hit / 0.6), lx = 640 - fly * 210, ly = 1010 - Math.sin(fly * Math.PI) * 260;
      g.save(); g.translate(lx, ly - 90); g.rotate(-fly * 2.4 - (hit > 0.6 ? 0.6 : 0)); g.translate(-lx, -(ly - 90));
      quad(ink, LIONESS, lx, ly, 220, { gait: "stand", t, emotion: hit > 0.6 ? "confused" : "scared", shadow: hit > 0.6 }); g.restore();
      if (hit > 0.6) stars(ink, lx, ly - 40, 110, t); }
    if (hit > 0 && hit < 0.35) { const k = hit / 0.35; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; ink.line([[700 + Math.cos(a) * (40 + k * 60), 820 + Math.sin(a) * (40 + k * 60)], [700 + Math.cos(a) * (90 + k * 140), 820 + Math.sin(a) * (90 + k * 140)]], 10, "#ffd33d", 0.2); } ink.text("WHAM!", 700, 650, 130, "Bangers", RED, "center", 16, "#ffffff"); }
  } },
  // L. "That's why lions mostly go after the babies," (mother shields her calf)
  { at: W0(7, "that's"), whip: true, frame: () => [900, 660, 0.95], draw: (ink, t, lt) => {
    savanna(ink, t, 660, 51); acacia(ink, 1600, 690, 260, "#86a252", 52);
    quad(ink, CALF, 1180, 1010, 240, { gait: "stand", t: t + 2, emotion: "happy", blink: blink(t, 12) });
    quad(ink, GIRAFFE, 900, 1000, 430, { gait: "stand", t, head: "front", emotion: "angry" });
    quad(ink, LIONESS, 200 + lt * gaitSpeed(LIONESS, "walk") * 150 * 0.5, 1030, 150, { emotion: "smug", gait: "stalk", t: lt * 0.5 });
    tallGrass(ink, -50, 620, 1060, 110, 53, "#c9a24a", t);
  } },
  // M. "...and it's exactly why" -> the opening frame again, so the last line runs into "Lions are scared of..."
  { at: W0(7, "and"), whip: true, frame: (lt, d) => [1000, 640, 1.01 - 0.06 * ease(lt / Math.max(0.4, d))], draw: (ink, t, lt) => lionScared(ink, t, lt) },
];
const SHOTS_AT = { H: SHOTS[7].at };
const CAPS_V = buildChunks(WORDS.words as CapWord[], 2, 13);
export const drawAt = (g: CanvasRenderingContext2D, W: number, H: number, t: number) => {
  let k = 0; while (k + 1 < SHOTS.length && t >= SHOTS[k + 1].at) k++;
  const s = SHOTS[k], lt = t - s.at, d = (SHOTS[k + 1]?.at ?? DURATION) - s.at;
  g.save();
  const [fx, fy, z] = s.frame(lt, d);
  g.translate(W / 2, H / 2); g.scale((z * W) / 1080, (z * W) / 1080); g.translate(-fx, -fy);
  if (s.whip && k > 0) { const zz = 1 + 0.22 * (1 - ease(lt / 0.16)); g.translate(fx, fy); g.scale(zz, zz); g.translate(-fx, -fy); }
  setLook(); const ink = new Ink(g, 11); s.draw(ink, t, lt, d);
  g.restore();
  postLook(g, W, H, t);
  g.save();
  if (s.whip && k > 0 && lt < 0.12) { const a = 1 - lt / 0.12; for (let i = 0; i < 18; i++) { const y = ((i * 107 + 40) % 1920) * H / 1920; g.fillStyle = `rgba(255,255,255,${(0.5 * a).toFixed(3)})`; g.fillRect(0, y, W, (10 + (i % 3) * 8) * W / 1080); } }
  g.scale(W / 1080, H / 1920); drawCaptions(g, CAPS_V, t, { ...CAP_STYLE, cx: 540, y: 1370, size: 118 });
  g.restore();
};
(window as unknown as { INK_VIDEO: unknown }).INK_VIDEO = { duration: DURATION, drawAt, cuts: SHOTS.map((s) => s.at) };
