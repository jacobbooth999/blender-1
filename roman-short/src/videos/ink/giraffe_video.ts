// "How did giraffes survive in the wild?": the user's script narrated (videos_ink/giraffe), drawn in the 2D ink
// explainer look and animated per frame: slow push-ins, blinks, tail swishes, gallop cycles, a pumping heart,
// flowing dashed lines. Every shot starts on its sentence (timeline.json); long sentences get two shots.
import { Ink, P, INKC, PAPER, RED, BLUE } from "./ink2d";
import { giraffeHead, acacia } from "./animals2d";
import { quad, gaitSpeed, GIRAFFE, CALF, ANCESTOR, LIONESS, ZEBRA, Species } from "./quadruped";
const MIDNECK: Species = { ...GIRAFFE, neckLen: 0.6, neckW0: 0.26, neckW1: 0.11 };
import TL from "../../../videos_ink/giraffe/timeline.json";

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
const sky = (ink: Ink, hor: number, stops: [number, string][]) => { ink.g.fillStyle = ink.vgrad(0, hor, stops); ink.g.fillRect(-200, -200, 2320, hor + 204); };
const ground = (ink: Ink, y0: number, a: string, b: string, tufts = 220, seed = 1) => {
  const pts: P[] = [[-200, y0], [2120, y0], [2120, 1300], [-200, 1300]];
  ink.shape(pts, ink.vgrad(y0, 1080, [[0, a], [1, b]]), null);
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
const savanna = (ink: Ink, t: number, hor = 640, seed = 1) => {
  sky(ink, hor, [[0, "#8fc7e8"], [1, "#e6f2ef"]]);
  sun(ink, 1650, 150, 62); cloud(ink, 300 + t * 6, 140, 1); cloud(ink, 1100 + t * 4, 90, 0.8);
  hills(ink, hor - 20, 28, "#b8b48a", seed + 3, 1.5);
  ground(ink, hor, "#dcc27a", "#c9a55a", 260, seed);
};
const paper = (ink: Ink) => { const g = ink.g; g.fillStyle = PAPER; g.fillRect(-200, -200, 2320, 1480); ink.seed(99); for (let i = 0; i < 300; i++) { g.fillStyle = "rgba(120,110,90,0.035)"; g.fillRect(ink.r() * 1920, ink.r() * 1080, 2, 2); } };
const dashed = (ink: Ink, pts: P[], col = INKC, w = 3, off = 0, dash = [16, 14]) => { const g = ink.g; g.save(); g.setLineDash(dash); g.lineDashOffset = -off; g.strokeStyle = col; g.lineWidth = w; g.lineCap = "round"; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.restore(); };
const arrow = (ink: Ink, a: P, b: P, col = INKC, w = 4) => { ink.line([a, b], w, col, 0.8); const ang = Math.atan2(b[1] - a[1], b[0] - a[0]); for (const s of [-1, 1]) ink.line([b, [b[0] - Math.cos(ang + s * 0.5) * 26, b[1] - Math.sin(ang + s * 0.5) * 26]], w, col, 0.3); };
const check = (ink: Ink, x: number, y: number, s: number) => ink.line([[x - s * 0.5, y], [x - s * 0.15, y + s * 0.4], [x + s * 0.55, y - s * 0.45]], s * 0.14, "#3f9a4f", 0.6);
const cross = (ink: Ink, x: number, y: number, s: number) => { ink.line([[x - s / 2, y - s / 2], [x + s / 2, y + s / 2]], s * 0.14, RED, 0.6); ink.line([[x + s / 2, y - s / 2], [x - s / 2, y + s / 2]], s * 0.14, RED, 0.6); };
const bang = (ink: Ink, x: number, y: number, s: number, k: number) => { if (k <= 0) return; const q = ease(k * 3) * s; ink.shape([[x - q * 0.12, y - q], [x + q * 0.12, y - q], [x + q * 0.06, y - q * 0.3], [x - q * 0.06, y - q * 0.3]], RED, 2.4); ink.ell(x, y - q * 0.1, q * 0.08, q * 0.08, RED, 2.4); };
const speedLines = (ink: Ink, x: number, y: number, n: number, len: number, t: number) => { for (let i = 0; i < n; i++) { const o = ((t * 3 + i * 0.37) % 1) * 120; ink.line([[x - o - len, y + i * 34], [x - o, y + i * 34]], 4, "rgba(255,255,255,0.95)", 0.3); } };
const dust = (ink: Ink, x: number, y: number, t: number) => { for (let i = 0; i < 5; i++) { const k = (t * 1.5 + i * 0.2) % 1; ink.ell(x - k * 160 - i * 20, y - k * 40, 30 + k * 40, 22 + k * 25, `rgba(225,205,160,${(0.8 * (1 - k)).toFixed(3)})`, null); } };
const label = (ink: Ink, s: string, x: number, y: number, size = 56, col = INKC, k = 1) => { ink.g.globalAlpha = clamp01(k); ink.text(s, x, y, size, "Patrick Hand", col); ink.g.globalAlpha = 1; };
const title = (ink: Ink, s: string, x: number, y: number, size: number, k = 1) => { const g = ink.g; g.save(); g.globalAlpha = clamp01(k * 2); g.translate(x, y); const sc = 0.92 + 0.08 * ease(k * 2.5); g.scale(sc, sc); ink.text(s, 0, 0, size, "Bangers", INKC); g.restore(); };

// ---------------- shots ----------------
type Shot = { at: number; push?: [number, number, number]; draw: (ink: Ink, t: number, lt: number, d: number) => void };
const SHOTS: Shot[] = [
  // 0. how do you hide something this tall? (a giraffe "hiding" behind a skinny acacia)
  { at: 0, push: [960, 560, 0.05], draw: (ink, t, lt) => {
    savanna(ink, t);
    acacia(ink, 400, 700, 300, "#7c9a4a", 3); acacia(ink, 1500, 660, 220, "#86a252", 4);
    quad(ink, ZEBRA, 1500, 900, 150, { gait: "graze", t }, true);
    quad(ink, GIRAFFE, 1000, 980, 420, { gait: "stand", t, head: "front", brow: "worried", blink: blink(t, 1), sweat: lt > 1.6 }, true);
    acacia(ink, 960, 990, 330, "#7c9a4a", 5);
    tallGrass(ink, -50, 2000, 1090, 60, 7, "#c9a24a", t);
  } },
  // 1. millions of years ago: a short-necked ancestor in an ancient forest
  { at: at(1), push: [900, 600, 0.04], draw: (ink, t, lt) => {
    sky(ink, 640, [[0, "#b6d3c6"], [1, "#eef1df"]]);
    hills(ink, 560, 40, "#8fae8a", 21, 2);
    for (let i = 0; i < 9; i++) { const x = 60 + i * 230, h = 380 + (i % 3) * 60; ink.shape([[x - 22, 700], [x - 14, 700 - h], [x + 14, 700 - h], [x + 22, 700]], "#7a5a3a", 2.4); for (const [dx, dy, r] of [[0, -h, 120], [-80, -h + 50, 90], [80, -h + 40, 95]]) ink.ell(x + dx, 700 + dy, r, r * 0.75, "#5f8a4a", 2.4); }
    ground(ink, 700, "#93a86a", "#72884e", 200, 22);
    for (let i = 0; i < 8; i++) { const x = 100 + i * 250; for (let k = -3; k <= 3; k++) ink.line(ink.curve([x, 1000], [x + k * 18, 940], [x + k * 40, 900 + Math.abs(k) * 10]), 4, "#4f7a3c", 0.3); }
    quad(ink, ANCESTOR, 620 + lt * gaitSpeed(ANCESTOR, "walk") * 300, 960, 300, { gait: "walk", t: lt, blink: blink(t, 2) });
    label(ink, "MILLIONS OF YEARS AGO", 1500, 140, 64, INKC, lt * 2);
  } },
  // 2a. natural selection: necks get longer
  { at: at(2), push: [960, 560, 0.035], draw: (ink, t, lt) => {
    paper(ink);
    title(ink, "NATURAL SELECTION.", 960, 120, 110, lt);
    const ks = [0, 1, 2];
    ks.forEach((k) => { const show = clamp01((lt - 0.4 - k * 0.9) * 3); if (!show) return; ink.g.globalAlpha = show;
      quad(ink, [ANCESTOR, MIDNECK, GIRAFFE][k], 400 + k * 560, 900, 250, { gait: "stand", t: t + k, blink: blink(t, 10 + k) }); ink.g.globalAlpha = 1; });
    if (lt > 1.3) arrow(ink, [580, 960], [800, 960], INKC, 5);
    if (lt > 2.2) arrow(ink, [1140, 960], [1360, 960], INKC, 5);
    label(ink, "generation after generation...", 960, 1030, 46, "#6a655f", lt - 2.6);
  } },
  // 2b. high leaves only giraffes can reach
  { at: at(2, "allowing"), push: [1100, 400, 0.05], draw: (ink, t, lt) => {
    savanna(ink, t, 700, 5);
    acacia(ink, 1150, 1000, 900, "#7c9a4a", 8);
    quad(ink, ZEBRA, 480, 960, 190, { gait: "graze", t });
    quad(ink, GIRAFFE, 860, 1010, 470, { gait: "eat", t, tongue: 0.6 + 0.4 * Math.sin(t * 3), chew: Math.sin(t * 6) > 0 ? 1 : 0, blink: blink(t, 3) });
    if (lt > 0.8) check(ink, 1500, 230, 80);
    if (lt > 1.4) { cross(ink, 300, 760, 60); label(ink, "too high!", 300, 680, 48, RED, lt - 1.4); }
    tallGrass(ink, -50, 2000, 1090, 50, 9, "#c9a24a", t);
  } },
  // 3. height = another advantage
  { at: at(3), push: [960, 560, 0.035], draw: (ink, t, lt) => {
    paper(ink);
    title(ink, "BONUS: HEIGHT.", 820, 300, 150, lt);
    quad(ink, GIRAFFE, 1450, 1010, 420, { gait: "stand", t, head: "front", brow: "proud", blink: blink(t, 4), neckAdd: 0.2 });
    if (lt > 0.5) { ink.line([[1750, 1000], [1750, 240]], 4, BLUE, 0.4); for (const y of [1000, 240]) ink.line([[1725, y], [1775, y]], 4, BLUE, 0.3); label(ink, "up to 5.5 m", 1750, 200, 50, BLUE, lt - 0.5); }
  } },
  // 4. spotting predators from far away
  { at: at(4), push: [700, 400, 0.04], draw: (ink, t, lt) => {
    savanna(ink, t, 680, 11);
    acacia(ink, 1300, 700, 260, "#86a252", 12);
    quad(ink, GIRAFFE, 380, 1020, 470, { gait: "stand", t, head: "front", brow: "alert", blink: blink(t, 5), neckAdd: 0.2 });
    // the lioness, tiny and far, in the grass
    quad(ink, LIONESS, 1600 - lt * gaitSpeed(LIONESS, "walk") * 46 * 0.6, 770, 46, { gait: "stalk", t: lt * 0.6 }, true);
    tallGrass(ink, 1450, 1720, 775, 30, 13, "#c9a24a", t);
    const k = ease((lt - 0.8) / 1.2);
    if (k > 0) dashed(ink, [[470, 170], [470 + (1540 - 470) * k, 170 + (735 - 170) * k]], RED, 4, t * 60);
    bang(ink, 560, 140, 90, lt - 2.2);
    tallGrass(ink, -50, 2000, 1090, 50, 14, "#c9a24a", t);
  } },
  // 5. ...and they are not slow
  { at: at(5), push: [960, 560, 0.035], draw: (ink, t, lt) => {
    paper(ink);
    title(ink, "NOT EXACTLY SLOW.", 960, 160, 120, lt);
    quad(ink, GIRAFFE, 960, 1000, 380, { gait: "gallop", t, brow: "alert" });
    dust(ink, 760, 1000, t);
  } },
  // 6. up to ~60 km/h, leaving the lioness behind
  { at: at(6), draw: (ink, t, lt) => {
    const vG = gaitSpeed(GIRAFFE, "gallop") * 430, scroll = (lt * vG * 0.45) % 1920; // trees in the middle distance; the ground at full gallop speed
    sky(ink, 640, [[0, "#8fc7e8"], [1, "#e6f2ef"]]); sun(ink, 1650, 150, 62);
    const g = ink.g; g.save(); g.translate(-scroll * 0.2, 0); hills(ink, 620, 28, "#b8b48a", 31, 1.5); g.restore();
    ground(ink, 640, "#dcc27a", "#c9a55a", 0, 32);
    for (let k = 0; k < 2; k++) { g.save(); g.translate(-scroll + k * 1920, 0); acacia(ink, 400, 690, 240, "#86a252", 33); acacia(ink, 1300, 700, 300, "#7c9a4a", 34); g.restore(); }
    for (let k = 0; k < 2; k++) { g.save(); g.translate(-((lt * vG) % 1920) + k * 1920, 0); ink.seed(35); const pts: P[] = [[0, 640], [1920, 640], [1920, 1080], [0, 1080]]; ink.hatch(pts, 160, 18, "rgba(110,90,40,0.5)", 2.4, -Math.PI / 2, 0.7); g.restore(); }
    quad(ink, LIONESS, 330 - lt * 40, 990, 130, { gait: "gallop", t: t * 0.9, mouth: "pant" }); dust(ink, 230 - lt * 40, 990, t + 0.3);
    quad(ink, GIRAFFE, 1050, 1000, 430, { gait: "gallop", t, brow: "proud" });
    speedLines(ink, 760, 520, 5, 220, t); dust(ink, 860, 1000, t);
    // speedometer badge
    ink.ell(1690, 220, 140, 140, PAPER, 4); ink.arc(1690, 240, 105, 105, Math.PI, Math.PI * 2, 6, INKC);
    const needle = Math.PI + Math.PI * (0.15 + 0.7 * ease(lt / 1.6)) + Math.sin(t * 20) * 0.02;
    ink.line([[1690, 240], [1690 + Math.cos(needle) * 90, 240 + Math.sin(needle) * 90]], 7, RED, 0.2); ink.dot(1690, 240, 12);
    ink.text(`~${Math.round(60 * ease(lt / 1.6))} km/h`, 1690, 300, 50, "Patrick Hand", INKC);
  } },
  // 7. the long tough tongue vs thorns
  { at: at(7), push: [1100, 450, 0.05], draw: (ink, t, lt) => {
    sky(ink, 1080, [[0, "#9fd0ea"], [1, "#eef4ea"]]);
    // a thorny acacia branch across the top right
    ink.line(ink.curve([2000, 120], [1500, 230], [1050, 210]), 26, "#6e4a32", 0.6);
    ink.seed(41);
    for (let i = 0; i < 16; i++) { const x = 1100 + i * 55, y = 210 + Math.sin(i) * 20 + (x - 1100) * 0.02; ink.line([[x, y], [x + 18, y - 30]], 3, "#f3eee2", 0.2); ink.line([[x + 10, y + 5], [x + 26, y + 34]], 3, "#f3eee2", 0.2); if (i % 2) ink.shape(ink.ragged(ink.ellPts(x, y - 50, 36, 22), 6, 2), "#7c9a4a", 2.2); }
    const tg = 1.35 + 0.35 * Math.sin(lt * 2.6);
    giraffeHead(ink, 760, 560, 430, { tongue: tg, blink: blink(t, 7), chew: Math.sin(t * 7) > 0.3 ? 1 : 0, brow: "proud" });
    if (lt > 1.5) { label(ink, "thorns", 1590, 370, 50, RED, lt - 1.5); arrow(ink, [1560, 340], [1440, 260], RED, 4); }
    if (lt > 3) { label(ink, "tough tongue", 1350, 640, 50, BLUE, lt - 3); arrow(ink, [1300, 610], [1180, 460], BLUE, 4); }
  } },
  // 8. the real trick is inside
  { at: at(8), push: [960, 560, 0.035], draw: (ink, t, lt) => {
    paper(ink);
    title(ink, "THE SECRET IS INSIDE.", 960, 140, 110, lt);
    ink.g.globalAlpha = 0.35; quad(ink, GIRAFFE, 960, 1010, 420, { gait: "stand", t, blink: true }); ink.g.globalAlpha = 1;
    const beat = 1 + 0.12 * Math.max(0, Math.sin(t * 7.5)) ** 4;
    const hx = 1040, hy = 560; ink.shape(heartPts(hx, hy, 38 * beat), RED, 3);
    if (lt > 0.6) { label(ink, "heart", 1180, 560, 50, RED, lt - 0.6); ink.line([[1090, 560], [1140, 560]], 3, RED, 0.2); }
  } },
  // 9. a heart strong enough to push blood ~2 m up to the brain
  { at: at(9), push: [960, 560, 0.035], draw: (ink, t, lt) => {
    paper(ink);
    // big diagram: neck going up to the head, artery inside
    const base: P = [760, 980], topP: P = [1180, 240];
    ink.shape([[base[0] - 90, base[1]], [topP[0] - 40, topP[1] + 20], [topP[0] + 40, topP[1] + 60], [base[0] + 110, base[1]]], "#f3e1b4", 3);
    giraffeHead(ink, topP[0] + 60, topP[1], 180, { blink: blink(t, 8) });
    const path: P[] = [[base[0], base[1] - 40], [topP[0] + 10, topP[1] + 60]];
    ink.line(path, 18, "#e7b0aa", 0.2);
    dashed(ink, path, RED, 10, t * 140, [20, 26]);
    const beat = 1 + 0.15 * Math.max(0, Math.sin(t * 7.5)) ** 4;
    ink.shape(heartPts(base[0], base[1] - 40, 70 * beat), RED, 3);
    label(ink, "HEART", base[0] - 220, base[1] - 60, 60, RED, lt * 2);
    if (lt > 1) label(ink, "BRAIN", topP[0] + 280, topP[1] - 40, 60, BLUE, lt - 1);
    if (lt > 1.8) { dashed(ink, [[1450, 980], [1450, 280]], INKC, 3, 0); label(ink, "about 2 m of neck", 1640, 640, 48, INKC, lt - 1.8); }
  } },
  // 10. not invincible
  { at: at(10), push: [960, 560, 0.035], draw: (ink, t, lt) => {
    paper(ink);
    title(ink, "NOT INVINCIBLE.", 820, 300, 150, lt);
    quad(ink, GIRAFFE, 1480, 1010, 400, { gait: "stand", t, head: "front", brow: "worried", blink: blink(t, 9), sweat: true });
  } },
  // 11a. lions still hunt them, especially calves
  { at: at(11), push: [900, 700, 0.05], draw: (ink, t, lt) => {
    savanna(ink, t, 660, 51);
    acacia(ink, 1600, 690, 260, "#86a252", 52);
    quad(ink, GIRAFFE, 1250, 1000, 420, { gait: "stand", t, head: "front", brow: "alert", blink: blink(t, 11), neckAdd: 0.15 });
    quad(ink, CALF, 880, 1010, 230, { gait: "stand", t: t + 2, blink: blink(t, 12) });
    quad(ink, LIONESS, 200 + lt * gaitSpeed(LIONESS, "walk") * 150 * 0.5, 1030, 150, { gait: "stalk", t: lt * 0.5, brow: "alert" });
    tallGrass(ink, -50, 700, 1060, 120, 53, "#c9a24a", t);
    tallGrass(ink, -50, 2000, 1095, 45, 54, "#c9a24a", t);
    bang(ink, 1330, 380, 80, lt - 1.2);
  } },
  // 11b. habitat loss and people
  { at: at(11, "and modern"), push: [960, 600, 0.04], draw: (ink, t, lt) => {
    sky(ink, 640, [[0, "#b9c9d6"], [1, "#e9e6dc"]]);
    // town / road on the horizon
    for (let i = 0; i < 9; i++) { const x = 1050 + i * 100, h = 60 + (i % 3) * 40; ink.shape([[x, 640], [x, 640 - h], [x + 80, 640 - h], [x + 80, 640]], ["#c9c1b4", "#b8b0a4", "#d6cfc2"][i % 3], 2.2); }
    ground(ink, 640, "#cdb47a", "#b49a5e", 120, 61);
    ink.shape([[-200, 760], [2120, 720], [2120, 790], [-200, 830]], "#6a6a70", 2.6); for (let x = -100; x < 2100; x += 160) ink.line([[x, 795 - (x + 200) * 0.017], [x + 80, 795 - (x + 280) * 0.017]], 5, "#f2e9c8", 0.2);
    // stumps where trees were
    for (const [x, y, s] of [[300, 980, 1], [620, 900, 0.8], [1500, 960, 0.9], [1750, 880, 0.7]] as const) { ink.shape([[x - 40 * s, y], [x - 34 * s, y - 50 * s], [x + 34 * s, y - 50 * s], [x + 40 * s, y]], "#7a5638", 2.4); ink.ell(x, y - 50 * s, 34 * s, 12 * s, "#d8b88a", 2.2); }
    // fence
    for (let x = 900; x < 2000; x += 120) ink.line([[x, 1000], [x, 860]], 7, "#6e4a32", 0.4);
    for (const y of [890, 930, 970]) ink.line([[900, y], [1990, y]], 2, "#5a5a60", 0.6);
    quad(ink, GIRAFFE, 640, 1060, 380, { gait: "stand", t, head: "front", brow: "worried", blink: blink(t, 13) });
  } },
  // 12. survivors: a giraffe family at sunset
  { at: at(12), push: [960, 560, 0.06], draw: (ink, t, lt) => {
    sky(ink, 700, [[0, "#5b5c94"], [0.55, "#e58f72"], [1, "#ffd08a"]]);
    ink.ell(1300, 560, 120, 120, "#fff1c9", null);
    hills(ink, 690, 30, "#8a6a6e", 71, 1.6);
    // tracking shot: the family walks at its natural cadence, the ground slides past at the same speed (feet stay planted)
    const v = gaitSpeed(GIRAFFE, "walk") * 400, off = lt * v, g = ink.g;
    ground(ink, 700, "#c98a5a", "#7a5a52", 0, 72);
    for (let k = -1; k < 2; k++) { g.save(); g.translate(-(off * 0.35 % 1920) + k * 1920, 0); acacia(ink, 380, 760, 300, "#5a6a3a", 73); acacia(ink, 1300, 745, 200, "#5a6a3a", 75); g.restore(); }
    for (let k = -1; k < 2; k++) { g.save(); g.translate(-(off % 1920) + k * 1920, 0); ink.seed(76); ink.hatch([[0, 700], [1920, 700], [1920, 1080], [0, 1080]], 170, 18, "rgba(70,40,30,0.45)", 2.4, -Math.PI / 2, 0.7); g.restore(); }
    const kC = v / (gaitSpeed(CALF, "walk") * 210);
    quad(ink, GIRAFFE, 520, 990, 380, { gait: "walk", t: lt * (400 / 380) + 0.4, blink: blink(t, 15) });
    quad(ink, GIRAFFE, 1120, 980, 420, { gait: "walk", t: lt * (400 / 420), blink: blink(t, 14), brow: "proud" });
    quad(ink, CALF, 820, 1005, 210, { gait: "walk", t: lt * kC + 0.2, blink: blink(t, 16) });
  } },
];
function heartPts(x: number, y: number, s: number): P[] {
  const pts: P[] = [];
  for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2, hx = 16 * Math.sin(a) ** 3, hy = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a); pts.push([x + (hx / 16) * s, y - (hy / 16) * s]); }
  return pts;
}
for (const s of SHOTS) s.at = Math.max(0, s.at - 0.12); // cut a few frames before the line

export const drawAt = (g: CanvasRenderingContext2D, W: number, H: number, t: number) => {
  let k = 0; while (k + 1 < SHOTS.length && t >= SHOTS[k + 1].at) k++;
  const s = SHOTS[k], lt = t - s.at, d = (SHOTS[k + 1]?.at ?? DURATION) - s.at;
  g.save(); g.scale(W / 1920, H / 1080);
  if (s.push) { const [fx, fy, amt] = s.push, z = 1 + amt * ease(lt / Math.max(1, d)); g.translate(fx, fy); g.scale(z, z); g.translate(-fx, -fy); }
  const ink = new Ink(g, 11); s.draw(ink, t, lt, d);
  g.restore();
  // a quick white flash on the first frames of each card / section
  if (lt < 0.1 && k > 0) { g.fillStyle = `rgba(255,255,255,${(0.6 * (1 - lt / 0.1)).toFixed(3)})`; g.fillRect(0, 0, W, H); }
};
(window as unknown as { INK_VIDEO: unknown }).INK_VIDEO = { duration: DURATION, drawAt, cuts: SHOTS.map((s) => s.at) };
