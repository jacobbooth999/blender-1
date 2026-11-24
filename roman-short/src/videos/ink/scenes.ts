// "From Wolf to Golden" in the 2D ink explainer look: ten 16:9 frames (painted scenes + paper info cards).
// Story, characters and wording are our own; only the drawing style follows references/INK_STYLE.md.
import { Ink, P, INKC, PAPER, RED, BLUE } from "./ink2d";
import { figure } from "./figure";
import { dogSide, dogFront, WOLF2, EARLY2, WATER2, TWEED2, NOUS2, PUP2, GOLDEN2 } from "./dog2d";

type Shot = { name: string; draw: (g: CanvasRenderingContext2D, W: number, H: number) => void };

// ---------------- painted scenery helpers (1920 x 1080 design space) ----------------
const sky = (ink: Ink, hor: number, stops: [number, string][]) => { ink.g.fillStyle = ink.vgrad(0, hor, stops); ink.g.fillRect(0, 0, 1920, hor + 4); };
const band = (ink: Ink, y0: number, cols: [string, string], tufts = 0, tuftCol = "rgba(60,70,30,0.45)", y1 = 1080) => {
  const pts: P[] = [[-20, y0], [1940, y0], [1940, y1 + 20], [-20, y1 + 20]];
  ink.shape(pts, ink.vgrad(y0, y1, [[0, cols[0]], [1, cols[1]]]), null);
  if (tufts) ink.hatch(pts, tufts, 16, tuftCol, 2.2, -Math.PI / 2, 0.7);
};
const ridge = (ink: Ink, y: number, amp: number, col: string | CanvasGradient, seed: number, outline = true, freq = 3) => {
  ink.seed(seed);
  const pts: P[] = [[-20, 1100]];
  const ph = ink.r() * 6, ph2 = ink.r() * 6;
  for (let x = -20; x <= 1940; x += 24) pts.push([x, y - amp * (0.55 * Math.sin((x / 1920) * Math.PI * freq + ph) + 0.35 * Math.sin((x / 1920) * Math.PI * freq * 2.3 + ph2))]);
  pts.push([1940, 1100]);
  ink.shape(pts, col, outline ? 2.6 : null);
};
const pine = (ink: Ink, x: number, y: number, h: number, col = "#3f6b4e", snow = false, outline = 2.4) => {
  ink.line([[x, y], [x, y - h * 0.25]], h * 0.05, "#5e4330", 0.3);
  for (let i = 0; i < 4; i++) {
    const w = h * (0.34 - i * 0.07), b = y - h * (0.12 + i * 0.2), t = b - h * 0.32;
    const tier: P[] = [[x - w, b], [x - w * 0.3, b - h * 0.04], [x, t], [x + w * 0.3, b - h * 0.04], [x + w, b], [x + w * 0.5, b + h * 0.02], [x, b - h * 0.01], [x - w * 0.5, b + h * 0.02]];
    ink.shape(tier, col, outline);
    if (snow) ink.shape([[x - w * 0.5, b - h * 0.08], [x, t + h * 0.02], [x + w * 0.5, b - h * 0.08], [x, b - h * 0.12]], "#f2f5f8", null);
  }
};
const tree = (ink: Ink, x: number, y: number, h: number, leaf = "#6b9b4c", dark = "#4f7c3c") => {
  ink.shape([[x - h * 0.04, y], [x - h * 0.025, y - h * 0.5], [x + h * 0.025, y - h * 0.5], [x + h * 0.04, y]], "#7a5638", 2.4);
  const lobes: [number, number, number][] = [[0, -0.72, 0.3], [-0.22, -0.58, 0.22], [0.23, -0.6, 0.23], [-0.1, -0.88, 0.2], [0.14, -0.86, 0.2]];
  for (const [dx, dy, r] of lobes) ink.ell(x + dx * h, y + dy * h, r * h, r * h * 0.85, leaf, 2.4);
  for (const [dx, dy, r] of lobes.slice(0, 3)) ink.ell(x + dx * h + r * h * 0.2, y + dy * h + r * h * 0.3, r * h * 0.55, r * h * 0.35, dark, null);
};
const rock = (ink: Ink, x: number, y: number, w: number, h: number, col = "#9a948c", snow = false) => {
  const pts = ink.curvePoly([[x - w / 2, y], [x - w * 0.45, y - h * 0.6], [x - w * 0.15, y - h], [x + w * 0.25, y - h * 0.92], [x + w / 2, y - h * 0.4], [x + w / 2, y]], 2);
  ink.shape(pts, col, 2.6);
  ink.texture(pts, ["#6f6a64", "#c4beb5"], 14, w * 0.05, w * 0.15, 0.25);
  ink.line([[x - w * 0.1, y - h * 0.75], [x + w * 0.05, y - h * 0.45], [x - w * 0.02, y - h * 0.2]], 2, "rgba(40,35,30,0.6)");
  if (snow) ink.shape(ink.curvePoly([[x - w * 0.4, y - h * 0.62], [x - w * 0.15, y - h * 1.0], [x + w * 0.25, y - h * 0.93], [x + w * 0.42, y - h * 0.5], [x + w * 0.1, y - h * 0.72]], 2), "#f4f6f9", 2);
};
const glow = (ink: Ink, x: number, y: number, r: number, col: string, a = 0.55) => {
  const g = ink.g, gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, col.replace("A", String(a))); gr.addColorStop(1, col.replace("A", "0"));
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
};
const fire = (ink: Ink, x: number, y: number, s: number) => {
  for (const a of [-0.5, 0.5, 0]) ink.shape(ink.ellPts(x, y - s * 0.05, s * 0.6, s * 0.08, a * 0.6), "#6e4a32", 2.4);
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; ink.ell(x + Math.cos(a) * s * 0.75, y + Math.sin(a) * s * 0.18, s * 0.13, s * 0.09, "#8f8a84", 2); }
  ink.shape([[x - s * 0.45, y - s * 0.05], [x - s * 0.3, y - s * 0.6], [x - s * 0.12, y - s * 0.45], [x, y - s * 1.15], [x + s * 0.16, y - s * 0.55], [x + s * 0.32, y - s * 0.75], [x + s * 0.45, y - s * 0.05]], "#f08a24", 2.4);
  ink.shape([[x - s * 0.22, y - s * 0.05], [x - s * 0.08, y - s * 0.45], [x + s * 0.02, y - s * 0.35], [x + s * 0.12, y - s * 0.62], [x + s * 0.24, y - s * 0.05]], "#ffd85a", null);
};
const hideTent = (ink: Ink, x: number, y: number, s: number) => {
  const pts: P[] = [[x - s, y], [x - s * 0.15, y - s * 1.45], [x + s * 0.15, y - s * 1.45], [x + s, y]];
  ink.shape(pts, ink.vgrad(y - s * 1.45, y, [[0, "#b08a62"], [1, "#94704c"]]), 2.6);
  ink.hatch(pts, 30, s * 0.12, "rgba(70,45,30,0.45)", 2, Math.PI / 2, 0.3);
  ink.shape([[x - s * 0.28, y], [x, y - s * 0.75], [x + s * 0.28, y]], "#3a2a24", 2.4);
  for (const d of [-0.08, 0.02, 0.12]) ink.line([[x + d * s, y - s * 1.4], [x + d * s * 3, y - s * 1.75]], 3, "#5e4330");
};
const paper = (ink: Ink) => { const g = ink.g; g.fillStyle = PAPER; g.fillRect(0, 0, 1920, 1080); ink.seed(99); for (let i = 0; i < 300; i++) { g.fillStyle = "rgba(120,110,90,0.035)"; g.fillRect(ink.r() * 1920, ink.r() * 1080, 2, 2); } };
const check = (ink: Ink, x: number, y: number, s: number) => ink.line([[x - s * 0.5, y], [x - s * 0.15, y + s * 0.4], [x + s * 0.55, y - s * 0.45]], s * 0.14, "#3f9a4f", 0.6);
const cross = (ink: Ink, x: number, y: number, s: number) => { ink.line([[x - s / 2, y - s / 2], [x + s / 2, y + s / 2]], s * 0.14, RED, 0.6); ink.line([[x + s / 2, y - s / 2], [x - s / 2, y + s / 2]], s * 0.14, RED, 0.6); };
const dashed = (ink: Ink, a: P, b: P, col = INKC, w = 3) => { const g = ink.g; g.save(); g.setLineDash([16, 14]); g.strokeStyle = col; g.lineWidth = w; g.lineCap = "round"; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); g.restore(); };
const arrow = (ink: Ink, a: P, b: P, col = INKC, w = 4) => { ink.line([a, b], w, col, 0.8); const ang = Math.atan2(b[1] - a[1], b[0] - a[0]); for (const s of [-1, 1]) ink.line([b, [b[0] - Math.cos(ang + s * 0.5) * 26, b[1] - Math.sin(ang + s * 0.5) * 26]], w, col, 0.3); };
const stars = (ink: Ink, n: number, y1: number, seed: number) => { ink.seed(seed); for (let i = 0; i < n; i++) { const x = ink.r() * 1920, y = ink.r() * y1, r = 1 + ink.r() * 2.2; ink.dot(x, y, r, "rgba(255,250,230,0.9)"); } };
const windLines = (ink: Ink, x: number, y: number, n: number, len: number, col = "#ffffff") => { for (let i = 0; i < n; i++) ink.line(ink.curve([x, y + i * 26], [x + len * 0.5, y + i * 26 - 14], [x + len, y + i * 26 + 4]), 3, col, 0.4); };

/** the frame draws in 1920 x 1080 design units; scale to the output size */
const frame = (fn: (ink: Ink) => void) => (g: CanvasRenderingContext2D, W: number, H: number) => {
  g.save(); g.scale(W / 1920, H / 1080); const ink = new Ink(g, 11); fn(ink); g.restore();
};

export const SHOTS: Shot[] = [
  // 0. title card
  { name: "title", draw: frame((ink) => {
    paper(ink);
    ink.text("FROM WOLF TO GOLDEN.", 960, 250, 150, "Bangers", INKC);
    dogFront(ink, WOLF2, { pose: "sit", mouth: "stern", brow: "proud" }, 520, 860, 300);
    dogFront(ink, GOLDEN2, { pose: "sit", mouth: "open", eye: "happy", brow: "happy", wag: 18, wagLines: true }, 1400, 860, 300);
    dashed(ink, [700, 640], [1180, 640], INKC, 4); arrow(ink, [1150, 640], [1200, 640], INKC, 5);
    ink.text("30,000+ YEARS", 950, 590, 64, "Patrick Hand", RED);
    ink.text("(give or take a few thousand)", 950, 700, 40, "Patrick Hand", "#7a7570");
  }) },
  // 1. Ice Age dusk: a wolf howls from a snowy rock
  { name: "wolves", draw: frame((ink) => {
    sky(ink, 700, [[0, "#2c3a6b"], [0.55, "#8c6a8e"], [1, "#f0a77a"]]);
    stars(ink, 90, 380, 3);
    ink.ell(1500, 230, 85, 85, "#f6efd8", 2.6); ink.ell(1475, 215, 16, 13, "#e5dcc0", null); ink.ell(1525, 255, 22, 15, "#e5dcc0", null);
    ridge(ink, 640, 70, "#6c6f96", 4, true, 2.2);
    for (let i = 0; i < 26; i++) pine(ink, 40 + i * 76, 690 + (i % 3) * 10, 170 + (i % 4) * 30, "#2f4a4e", true, 2);
    band(ink, 760, ["#dfe5f0", "#b9c4dc"], 0);
    rock(ink, 1180, 840, 520, 300, "#8e8aa0", true);
    dogSide(ink, WOLF2, { pose: "howl", mouth: "O", eye: "happy" }, 1180, 560, 165, false, 5);
    dogSide(ink, WOLF2, { pose: "stand", eye: "dot", brow: "alert", headTilt: -18 }, 560, 960, 190, false, 6);
    dogFront(ink, WOLF2, { pose: "stand", mouth: "stern", eye: "glow", brow: "proud" }, 260, 1010, 170, 7);
    ink.line(ink.curve([1330, 400], [1380, 370], [1430, 395]), 3, "#ffffff"); ink.line(ink.curve([1345, 360], [1400, 320], [1455, 352]), 3, "#ffffff");
  }) },
  // 2. night camp: a kid tosses a bone to a wolf at the edge of the firelight
  { name: "campfire", draw: frame((ink) => {
    sky(ink, 640, [[0, "#121a33"], [1, "#2c3558"]]);
    stars(ink, 140, 560, 9);
    for (let i = 0; i < 24; i++) pine(ink, 20 + i * 84, 650, 210 + (i % 3) * 40, "#17232a", false, 0);
    band(ink, 640, ["#3a3a4a", "#2a2a36"], 0);
    glow(ink, 820, 820, 620, "rgba(255,170,80,A)", 0.55);
    hideTent(ink, 330, 760, 230);
    fire(ink, 820, 860, 150);
    figure(ink, { x: 1060, y: 900, h: 330, pose: "throw", face: "determined", hair: "messy", outfit: "fur", look: 1, seed: 21 });
    figure(ink, { x: 600, y: 880, h: 400, pose: "stand", face: "worried", hair: "messyLong", outfit: "furDress", look: 1, seed: 22 });
    // the bone mid-air
    ink.shape(ink.ellPts(1330, 640, 34, 9, 0.6), "#f3eee2", 2.2); for (const s of [-1, 1]) ink.ell(1330 + s * 30, 640 + s * 20, 10, 10, "#f3eee2", 2);
    ink.line(ink.curve([1120, 640], [1210, 590], [1290, 625]), 3, "rgba(255,255,255,0.8)");
    // wolf just out of the light: face-on, eyes glowing
    ink.g.globalAlpha = 0.92; dogFront(ink, WOLF2, { pose: "stand", mouth: "closed", eye: "glow", brow: "worried", headTilt: 10 }, 1580, 930, 230, 8); ink.g.globalAlpha = 1;
    const g = ink.g, gr = g.createLinearGradient(1300, 0, 1920, 0); gr.addColorStop(0, "rgba(10,14,30,0)"); gr.addColorStop(1, "rgba(10,14,30,0.45)"); g.fillStyle = gr; g.fillRect(1300, 0, 620, 1080);
  }) },
  // 3. day camp: the first dogs join the family
  { name: "first_dog", draw: frame((ink) => {
    sky(ink, 620, [[0, "#9fd0ea"], [1, "#e5f2f4"]]);
    ink.ell(300, 170, 70, 70, "#fbe7a1", 2.4);
    ridge(ink, 600, 50, "#a9b7a0", 2, true, 2);
    band(ink, 620, ["#d8c27a", "#c9a95c"], 260, "rgba(120,100,40,0.5)");
    hideTent(ink, 1500, 700, 220); hideTent(ink, 1780, 680, 170);
    // drying rack
    for (const x of [200, 470]) ink.line([[x, 760], [x, 520]], 6, "#6e4a32"); ink.line([[190, 540], [480, 540]], 6, "#6e4a32");
    for (let i = 0; i < 5; i++) ink.shape([[220 + i * 52, 545], [250 + i * 52, 545], [244 + i * 52, 650], [228 + i * 52, 655]], "#8a3c2c", 2);
    figure(ink, { x: 1200, y: 960, h: 440, pose: "stand", face: "happy", hair: "messyLong", outfit: "furDress", prop: "spear", look: -1, seed: 31 });
    figure(ink, { x: 700, y: 990, h: 380, pose: "hug", face: "content", hair: "messy", outfit: "fur", seed: 32 });
    dogFront(ink, EARLY2, { pose: "sit", mouth: "open", eye: "happy", brow: "happy", wag: 20, wagLines: true, headTilt: -6 }, 900, 990, 260, 9);
    for (const [hx, hy, k] of [[780, 560, 1], [840, 520, 0.7]] as const) ink.shape(ink.curvePoly([[hx, hy + 22 * k], [hx - 22 * k, hy], [hx - 12 * k, hy - 14 * k], [hx, hy - 6 * k], [hx + 12 * k, hy - 14 * k], [hx + 22 * k, hy]], 2), "#e2453c", 2);
  }) },
  // 4. info card: why the friendly ones won
  { name: "card_friendly", draw: frame((ink) => {
    paper(ink);
    ink.text("WHY THE FRIENDLY ONES WON", 960, 120, 84, "Patrick Hand", INKC);
    dashed(ink, [960, 210], [960, 960], "#9a948c", 3);
    ink.text("GROWLS AT HUMANS", 480, 250, 60, "Patrick Hand", RED);
    dogFront(ink, WOLF2, { pose: "stand", mouth: "stern", eye: "dot", brow: "proud" }, 480, 760, 260, 12);
    cross(ink, 480, 880, 70); ink.text("no leftovers", 480, 960, 48, "Patrick Hand", "#6a655f");
    ink.text("WAGS AT HUMANS", 1440, 250, 60, "Patrick Hand", "#3f9a4f");
    dogFront(ink, EARLY2, { pose: "sit", mouth: "open", eye: "happy", brow: "happy", wag: 18, wagLines: true }, 1440, 760, 260, 13);
    check(ink, 1440, 880, 70); ink.text("all the leftovers", 1440, 960, 48, "Patrick Hand", "#6a655f");
    ink.shape(ink.ellPts(1700, 700, 40, 11, -0.4), "#f3eee2", 2.2); for (const s of [-1, 1]) ink.ell(1700 + s * 36, 700 - s * 16, 12, 12, "#f3eee2", 2);
  }) },
  // 5. Newfoundland: a water dog swims a fish back to the dock
  { name: "newfoundland", draw: frame((ink) => {
    sky(ink, 520, [[0, "#7fb5e0"], [1, "#d7ebf5"]]);
    for (const [x, y] of [[300, 140], [1180, 110], [1600, 190]] as const) { for (const [dx, dy, r] of [[0, 0, 50], [55, -18, 60], [115, 0, 48]]) ink.ell(x + dx, y + dy, r, r * 0.7, "#ffffff", null); }
    ridge(ink, 520, 60, "#6f9a68", 8, true, 1.6);
    ink.shape([[1500, 470], [1540, 330], [1580, 470]], "#f3efe6", 2.4); ink.shape([[1530, 360], [1550, 360], [1546, 330], [1534, 330]], "#c43a34", 2);
    ink.shape([[-20, 520], [1940, 520], [1940, 1100], [-20, 1100]], ink.vgrad(520, 1080, [[0, "#3f86b8"], [1, "#1f5a86"]]), null);
    for (let i = 0; i < 40; i++) { ink.seed(200 + i); const x = ink.r() * 1920, y = 560 + ink.r() * 500, l = 40 + ink.r() * 60; ink.line([[x, y], [x + l, y]], 2.4, "rgba(220,240,255,0.55)", 0.5); }
    // dock from the left
    const deck: P[] = [[-20, 760], [900, 760], [900, 800], [-20, 800]];
    ink.shape(deck, "#b98a58", 3); for (let x = 40; x < 900; x += 70) ink.line([[x, 762], [x, 798]], 2, "rgba(60,40,25,0.6)");
    for (const x of [60, 340, 620, 870]) ink.shape([[x - 14, 800], [x + 14, 800], [x + 14, 1100], [x - 14, 1100]], "#6e5038", 2.6);
    ink.shape([[120, 760], [220, 760], [220, 690], [120, 690]], "#a77b4c", 2.4); ink.shape([[230, 760], [310, 760], [310, 705], [230, 705]], "#9a6e42", 2.4);
    // rowboat
    ink.shape(ink.curvePoly([[1250, 640], [1650, 640], [1600, 700], [1300, 700]], 2), "#c4453a", 2.6); ink.line([[1270, 655], [1630, 655]], 3, "#f1ece0");
    figure(ink, { x: 600, y: 760, h: 420, pose: "cheer", face: "laugh", hat: "souwester", hatCol: "#e7b43a", outfit: "oilskin", beard: "#8a7a70", shoes: "#2a2a2a", bottom: "#3b4a6a", seed: 41, look: -1 });
    dogSide(ink, WATER2, { pose: "swim", mouth: "fish", brow: "proud", waterline: false }, 1150, 940, 210, true, 10);
    ink.shape([[860, 790], [1470, 790], [1470, 1100], [860, 1100]], ink.vgrad(520, 1080, [[0, "#3f86b8"], [1, "#1f5a86"]]), null);
    for (const [a, b] of [[900, 1010], [1050, 1180], [1300, 1440]]) ink.line(ink.curve([a, 791], [(a + b) / 2, 778], [b, 791]), 3, "#e8f6ff", 0.3);
    ink.line(ink.curve([1380, 900], [1460, 880], [1540, 905]), 3, "#e8f6ff"); ink.line(ink.curve([1400, 935], [1490, 915], [1580, 940]), 3, "#e8f6ff");
  }) },
  // 6. Guisachan, 1868: the first litter on the lawn
  { name: "guisachan", draw: frame((ink) => {
    sky(ink, 560, [[0, "#86b9e3"], [1, "#e1eef6"]]);
    ridge(ink, 470, 90, "#7f9a86", 13, true, 1.4);
    for (let i = 0; i < 18; i++) pine(ink, 30 + i * 110 + (i % 2) * 30, 560, 160 + (i % 3) * 40, "#3f5f4a", false, 2);
    // the lodge
    const hx = 960;
    ink.shape([[hx - 480, 600], [hx + 480, 600], [hx + 480, 320], [hx - 480, 320]], "#ece2cc", 3);
    ink.shape([[hx - 520, 330], [hx, 200], [hx + 520, 330]], "#6f6a78", 3);
    for (let i = 0; i < 7; i++) for (let j = 0; j < 2; j++) { const x = hx - 420 + i * 140, y = 360 + j * 120; ink.shape([[x, y], [x + 60, y], [x + 60, y + 80], [x, y + 80]], "#9fc0e0", 2.4); ink.line([[x + 30, y], [x + 30, y + 80]], 2); ink.line([[x, y + 40], [x + 60, y + 40]], 2); }
    ink.shape([[hx - 50, 600], [hx + 50, 600], [hx + 50, 480], [hx - 50, 480]], "#5a3d2a", 2.6);
    band(ink, 600, ["#8cbf63", "#6aa24a"], 320, "rgba(40,80,30,0.45)");
    ink.shape([[hx - 70, 600], [hx + 70, 600], [hx + 260, 1080], [hx - 260, 1080]], "#e3d6b8", 2.4);
    figure(ink, { x: 1600, y: 960, h: 470, pose: "point", face: "happy", hat: "tophat", outfit: "coat", moustache: "#cfc8bd", bottom: "#4a4a40", shoes: "#2a201a", flip: true, seed: 51, look: -1 });
    dogSide(ink, NOUS2, { pose: "sit", mouth: "closed", brow: "proud" }, 1290, 900, 200, true, 14);
    dogSide(ink, TWEED2, { pose: "sit", mouth: "open", brow: "happy" }, 400, 910, 185, false, 15);
    dogFront(ink, PUP2, { pose: "sit", mouth: "open", brow: "happy", headTilt: -12 }, 640, 1030, 130, 16);
    dogFront(ink, PUP2, { pose: "sit", mouth: "closed", brow: "worried", headTilt: 14 }, 800, 1040, 130, 17);
    dogFront(ink, PUP2, { pose: "stand", mouth: "open", eye: "happy", wag: 20 }, 960, 1035, 130, 18);
    dogSide(ink, PUP2, { pose: "walk", mouth: "open", wag: 25, wagLines: true }, 1110, 1060, 110, true, 19);
  }) },
  // 7. info card: the family tree
  { name: "card_family", draw: frame((ink) => {
    paper(ink);
    ink.text("1868: THE FIRST GOLDENS.", 960, 120, 110, "Bangers", INKC);
    dogSide(ink, NOUS2, { pose: "stand", mouth: "closed", brow: "proud" }, 480, 560, 190, false, 21);
    ink.text("NOUS", 480, 620, 60, "Patrick Hand", INKC); ink.text("yellow, wavy coat", 480, 675, 40, "Patrick Hand", "#7a7570");
    ink.text("+", 960, 430, 120, "Patrick Hand", RED);
    dogSide(ink, TWEED2, { pose: "stand", mouth: "open", brow: "happy" }, 1440, 560, 180, true, 22);
    ink.text("BELLE", 1440, 620, 60, "Patrick Hand", INKC); ink.text("curly Tweed Water Spaniel", 1440, 675, 40, "Patrick Hand", "#7a7570");
    arrow(ink, [960, 560], [960, 760], INKC, 5);
    const names = ["CROCUS", "COWSLIP", "PRIMROSE", "ADA"];
    names.forEach((n, i) => { const x = 600 + i * 240; dogFront(ink, PUP2, { pose: "sit", mouth: i % 2 ? "closed" : "open", brow: "happy", headTilt: (i - 1.5) * 8 }, x, 960, 105, 30 + i); ink.text(n, x, 1020, 40, "Patrick Hand", BLUE); });
  }) },
  // 8. marsh at sunset: the gamekeeper's golden brings back a duck
  { name: "marsh", draw: frame((ink) => {
    sky(ink, 600, [[0, "#5b5c94"], [0.5, "#e58f72"], [1, "#ffd08a"]]);
    ink.ell(1250, 520, 95, 95, "#fff1c9", null); glow(ink, 1250, 520, 400, "rgba(255,220,150,A)", 0.4);
    ridge(ink, 590, 40, "#6b5a6e", 21, true, 2);
    ink.shape([[-20, 600], [1940, 600], [1940, 1100], [-20, 1100]], ink.vgrad(600, 1080, [[0, "#f2b483"], [1, "#6c6a9a"]]), null);
    ink.shape([[1150, 610], [1350, 610], [1320, 640], [1180, 640]], "rgba(255,240,200,0.6)", null);
    band(ink, 880, ["#7a6a4a", "#4f4636"], 120, "rgba(30,25,20,0.5)");
    const reeds = (x0: number, n: number, y: number, h: number) => { ink.seed(x0); for (let i = 0; i < n; i++) { const x = x0 + ink.r() * 220, hh = h * (0.6 + ink.r() * 0.5); ink.line(ink.curve([x, y], [x + 6, y - hh * 0.5], [x + (ink.r() - 0.5) * 30, y - hh]), 3, "#4a4a2c", 0.3); if (i % 3 === 0) ink.shape(ink.ellPts(x + 4, y - hh * 0.75, 7, 22), "#6b4a2e", 1.6); } };
    reeds(-40, 26, 900, 300); reeds(1680, 26, 900, 320); reeds(380, 12, 640, 120); reeds(1500, 12, 640, 110);
    figure(ink, { x: 400, y: 950, h: 470, pose: "hips", face: "happy", hat: "flatcap", hatCol: "#6a5634", outfit: "tweed", moustache: "#5a3b2a", shoes: "#3a2a20", bottom: "#6a5a3a", prop: "shotgun", look: -1, flip: true, seed: 61 });
    dogSide(ink, NOUS2, { pose: "walk", mouth: "duck", brow: "proud", wag: 12 }, 1000, 900, 210, true, 23);
    for (const [a, b] of [[860, 960], [1060, 1170]]) ink.line(ink.curve([a, 905], [(a + b) / 2, 890], [b, 905]), 3, "#fff3dc", 0.3);
    for (let i = 0; i < 6; i++) ink.ell(880 + i * 50, 870 - (i % 2) * 20, 7, 9, "#bfe8ff", 1.6);
  }) },
  // 9. today: the family golden in the living room
  { name: "today", draw: frame((ink) => {
    const g = ink.g;
    g.fillStyle = ink.vgrad(0, 760, [[0, "#f3e6c8"], [1, "#ead7b0"]]); g.fillRect(0, 0, 1920, 760);
    band(ink, 760, ["#a8754a", "#8a5c38"], 0); for (let y = 790; y < 1080; y += 60) ink.line([[0, y], [1920, y]], 2, "rgba(60,35,20,0.35)", 0.3);
    // window with garden view
    ink.shape([[1340, 140], [1760, 140], [1760, 500], [1340, 500]], ink.vgrad(140, 500, [[0, "#9fd0ea"], [0.7, "#d8eef4"], [1, "#9cc472"]]), 4);
    ink.line([[1550, 140], [1550, 500]], 4); ink.line([[1340, 320], [1760, 320]], 4); tree(ink, 1460, 500, 220);
    // sofa
    ink.shape(ink.curvePoly([[200, 520], [900, 520], [920, 600], [180, 600]], 1), "#5c7fb0", 3);
    ink.shape([[170, 600], [930, 600], [930, 790], [170, 790]], "#4f6f9e", 3);
    for (const x of [150, 900]) ink.shape(ink.curvePoly([[x, 560], [x + 70, 560], [x + 70, 800], [x, 800]], 1), "#5c7fb0", 3);
    ink.line([[550, 610], [550, 760]], 2.4, "rgba(20,30,50,0.5)");
    // plant + lamp
    ink.shape([[1180, 760], [1260, 760], [1250, 680], [1190, 680]], "#c66a3e", 2.6);
    for (const a of [-0.9, -0.4, 0, 0.45, 0.9]) ink.shape(ink.ellPts(1220 + Math.sin(a) * 60, 610 - Math.cos(a) * 30, 22, 60, a), "#5e9a4e", 2.2);
    // the rug
    ink.shape(ink.ellPts(980, 960, 520, 90), "#c9504a", 3); ink.shape(ink.ellPts(980, 960, 440, 66), "#e0a04a", 2);
    figure(ink, { x: 520, y: 760, h: 430, pose: "sofa", face: "laugh", hair: "short", hairCol: "#2a2220", outfit: "modern", top: "#3fae7a", bottom: "#555a66", shoes: "#f2f2f2", seed: 71 });
    dogFront(ink, GOLDEN2, { pose: "sit", mouth: "open", eye: "happy", brow: "happy", wag: 22, wagLines: true, headTilt: -6, }, 1010, 1000, 270, 24);
    ink.ell(1230, 990, 26, 26, "#d8e84a", 2.4); ink.arc(1215, 990, 20, 24, -1, 1, 2.4, "#f8fbe8");
  }) },
];
(window as unknown as { INK_SHOTS: Shot[] }).INK_SHOTS = SHOTS;
