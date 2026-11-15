// Our own flat 2D cartoon cast (riflemen, officer, townsfolk, kid, parent) + 2D effects, drawn on a canvas.
// Construction v2 (characters.md, our own cast): superellipse heads (pointed crown 1.75 / full jaw 2.3, chin taper,
// seeded side bulge + tilt), bean torsos, single-stroke limbs with ink-dot hands, a thick-thin plum outline weighted
// away from the light, soft painted crescents, deadpan lidded eyes, no blush, no catchlights.
// Design space 600 x 1000 units (soles at y = 975); the canvas transform scales it.
export const INK = "#241726";
export const SKIN = "#ffe2c2";
const WHITE = "#ffffff";
const MOUTH = "#5a1e28";
const TONGUE = "#e86e78";
type C3 = [number, number, number];
const SH_SKIN: C3 = [0.96, 0.86, 0.84]; // measured shadow/lit ratio on skin heads
const SH_CLOTH: C3 = [0.64, 0.66, 0.74]; // torsos: lit side -> far side ~0.65
const SH_FELT: C3 = [0.62, 0.62, 0.7];

export type Build = "adult" | "stout" | "kid";
export type Outfit = {
  jacket: string; pants: string; boots: string; hat?: string | null; belt?: string | null; buttons?: string; rifle?: boolean;
  sash?: string; sword?: boolean; moustache?: string; skin?: string; head?: number; cap?: string; hair?: string; dress?: string;
  build?: Build;
  /** Roman extras: bare-leg colour, segmented armour bands, big curved shield, beard colour, helmet crest colour */
  legs?: string; lorica?: boolean; shield?: boolean; beard?: string; crest?: string; skirt?: string;
  /** Germanic checked tunic: stripe colour */
  plaid?: string;
};
type P2 = [number, number];

const rad = (d: number) => (d * Math.PI) / 180;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
export const mul = (c: string, m: C3) => {
  const n = parseInt(c.slice(1), 16);
  const ch = (v: number, k: number) => Math.min(255, Math.round(v * k)).toString(16).padStart(2, "0");
  return `#${ch((n >> 16) & 255, m[0])}${ch((n >> 8) & 255, m[1])}${ch(n & 255, m[2])}`;
};
export const shade = (c: string, k: number) => mul(c, [k, k, k]);
export const mix = (a: string, b: string, t: number) => {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((A >> s) & 255) * (1 - t) + ((B >> s) & 255) * t).toString(16).padStart(2, "0");
  return `#${ch(16)}${ch(8)}${ch(0)}`;
};
/** deterministic per-character random in [0, 1) */
const rnd = (seed: number, k: number) => { const x = Math.sin(seed * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const rotPts = (pts: P2[], a: number, cx: number, cy: number): P2[] =>
  pts.map(([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)]);
const rotAbout = (q: P2, a: number, c: P2): P2 => rotPts([q], a, c[0], c[1])[0];
const lerp2 = (a: P2, b: P2, t: number): P2 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/** smooth curve from a through (near) k to b, as a polyline */
const curve = (a: P2, k: P2, b: P2, n = 10): P2[] => {
  const c: P2 = [2 * k[0] - (a[0] + b[0]) / 2, 2 * k[1] - (a[1] + b[1]) / 2], out: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, s = 1 - t;
    out.push([s * s * a[0] + 2 * s * t * c[0] + t * t * b[0], s * s * a[1] + 2 * s * t * c[1] + t * t * b[1]]);
  }
  return out;
};

export const RIFLEMAN: Outfit = { jacket: "#357650", pants: "#3d4440", boots: INK, hat: "shako", belt: "#f1efe6", buttons: "#d9dde0", rifle: true };
export const OFFICER: Outfit = { ...RIFLEMAN, hat: "shako_tall", buttons: "#e8c45a", sash: "#c0353a", sword: true, moustache: "#4a3020", rifle: false, belt: null, build: "stout" };
export const KID: Outfit = { jacket: "#f08a2c", pants: "#3b5b9a", boots: "#f4f1ea", hat: "cap", cap: "#e2453c", build: "kid" };
export const PARENT: Outfit = { jacket: "#7b5ac9", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#5a3b2a" };
export const SKINS = [SKIN, "#f5c9a0", "#ecd0b6", "#c99067"];

export const soldier = (v = 0, extra: Partial<Outfit> = {}): Outfit => {
  const o: Outfit = { ...RIFLEMAN, skin: SKINS[v % 4] };
  if (v % 4 === 1) o.moustache = "#4a3426";
  if (v % 4 === 3) o.moustache = "#2a201a";
  return { ...o, ...extra };
};

// ---- our Roman cast ----
const LEGS_SKIN = (sk: string) => mix(sk, "#7a4b3a", 0.35);
export const legionary = (v = 0, extra: Partial<Outfit> = {}): Outfit => {
  const sk = SKINS[v % 4];
  return { jacket: "#b8322f", pants: "#b8322f", legs: LEGS_SKIN(sk), boots: "#6b4428", hat: "galea", lorica: true, sash: "#6b4428", skin: sk,
    crest: "#d8352f", skirt: "#b8322f", moustache: v % 4 === 1 ? "#4a3426" : undefined, ...extra };
};
export const CAESAR: Outfit = { jacket: "#f3ecdc", pants: "#f3ecdc", dress: "#f3ecdc", legs: LEGS_SKIN(SKIN), boots: "#7a4f33", hat: "laurel", hair: "#5b5048",
  sash: "#6a2c7a", build: "stout", skin: "#f5d6b8" };
export const citizen = (v = 0): Outfit => {
  const tun = ["#d9a441", "#5a8fc2", "#7a9a4a", "#c25a5a", "#9a7ab8", "#e0cfa8"], hair = ["#4a3020", "#2a201a", "#7a5030", "#b08850"];
  const sk = SKINS[v % 4], o: Outfit = { jacket: tun[v % 6], pants: tun[v % 6], legs: LEGS_SKIN(sk), boots: "#7a4f33", hat: "hair", hair: hair[v % 4], skin: sk, sash: "#8a6a4a", skirt: tun[v % 6] };
  return v % 3 === 1 ? { ...o, dress: mix(tun[(v + 2) % 6], "#ffffff", 0.2), sash: undefined } : o;
};
export const tribesman = (v = 0, extra: Partial<Outfit> = {}): Outfit => {
  const tun = ["#5d7a3a", "#9a3f34", "#4f6e6a", "#7a6a3a", "#6a4a5a"], hair = ["#c9a04a", "#8a5a2a", "#d8b870", "#6a4020", "#b06a30"];
  const sk = SKINS[(v + 1) % 3];
  return { jacket: tun[v % 5], pants: "#6b5a44", boots: "#5a3b2a", hat: "longhair", hair: hair[v % 5], beard: v % 4 === 3 ? undefined : hair[v % 5], skin: sk, sash: "#3a2a20", plaid: mix(tun[v % 5], "#f0e0b0", 0.3), ...extra };
};
export const goth = (v = 0): Outfit => ({ ...tribesman(v), plaid: undefined, hat: "spangen", jacket: ["#4a5a6a", "#5a4a3a", "#6a3a3a", "#3a5a4a"][v % 4], shield: false });
export const SHOPKEEPER: Outfit = { jacket: "#e0b25a", pants: "#e0b25a", skirt: "#e0b25a", legs: LEGS_SKIN(SKINS[1]), boots: "#7a4f33", hat: "hair", hair: "#3a2a20", moustache: "#3a2a20",
  skin: SKINS[1], sash: "#f3ecdc", build: "stout" };
export const villageKid = (roman: boolean): Outfit => roman
  ? { jacket: "#c25a5a", pants: "#c25a5a", legs: LEGS_SKIN(SKINS[2]), boots: "#7a4f33", hat: "hair", hair: "#c9a04a", skin: SKINS[2], build: "kid", sash: "#8a6a4a", skirt: "#c25a5a" }
  : { jacket: "#7a6a3a", pants: "#6b5a44", boots: "#5a3b2a", hat: "longhair", hair: "#c9a04a", skin: SKINS[2], build: "kid" };

export const townsfolk = (v = 0): Outfit => {
  const coats = ["#3f6fb5", "#8c3b4a", "#5d7a3a", "#b5653f", "#2f5f6a", "#7b5ac9"];
  const o: Outfit = { jacket: coats[v % 6], pants: "#3b3f52", boots: "#4a3426", skin: SKINS[v % 4] };
  return v % 2 ? { ...o, hat: "bonnet", dress: ["#d9a441", "#c25a7a", "#5a8fc2"][v % 3] } : { ...o, hat: "tophat" };
};

export class Pen {
  g: CanvasRenderingContext2D;
  ol = 12;
  /** [angle, cx, cy] rotation about (cx, cy), optional post-translation [.., dx, dy] */
  rot: number[] | null = null;
  constructor(g: CanvasRenderingContext2D) { this.g = g; }
  P(x: number, y: number): P2 {
    if (!this.rot) return [x, y];
    const r = this.rot, a = r[0], cx = r[1], cy = r[2], dx = r.length > 3 ? r[3] : 0, dy = r.length > 4 ? r[4] : 0, c = Math.cos(a), s = Math.sin(a);
    return [cx + (x - cx) * c - (y - cy) * s + dx, cy + (x - cx) * s + (y - cy) * c + dy];
  }
  path(pts: P2[], close: boolean) {
    const g = this.g;
    g.beginPath();
    pts.forEach((p, i) => { const [x, y] = this.P(p[0], p[1]); if (i) g.lineTo(x, y); else g.moveTo(x, y); });
    if (close) g.closePath();
  }
  /** filled shape with an ink outline; fill=null draws the outline only */
  poly(pts: P2[], fill: string | null, ol?: number) {
    const g = this.g, w = ol ?? this.ol;
    this.path(pts, true);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (w) { g.lineWidth = w; g.strokeStyle = INK; g.lineJoin = "round"; g.stroke(); }
  }
  ell(cx: number, cy: number, rx: number, ry: number, fill: string | null, ol?: number, a0 = 0, a1 = 360, rot = 0) {
    this.poly(ellPts(cx, cy, rx, ry, a0, a1, rot), fill, ol);
  }
  /** thick round-capped limb with an ink rim (effects, rope) */
  line(pts: P2[], fill: string, w: number, ink = true) {
    const g = this.g;
    g.lineCap = "round"; g.lineJoin = "round";
    if (ink) { this.path(pts, false); g.strokeStyle = INK; g.lineWidth = w + 2 * this.ol * 0.9; g.stroke(); }
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
  }
  stroke(pts: P2[], w: number, fill = INK) {
    const g = this.g;
    g.lineCap = "round"; g.lineJoin = "round";
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
  }
  arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, w: number, fill = INK) {
    const pts: P2[] = [];
    for (let i = 0; i <= 24; i++) pts.push([cx + rx * Math.cos(rad(a0 + ((a1 - a0) * i) / 24)), cy + ry * Math.sin(rad(a0 + ((a1 - a0) * i) / 24))]);
    this.stroke(pts, w, fill);
  }
  dot(cx: number, cy: number, r: number, fill = INK) {
    const [x, y] = this.P(cx, cy);
    this.g.beginPath(); this.g.arc(x, y, r, 0, Math.PI * 2); this.g.fillStyle = fill; this.g.fill();
  }
  /** draw with a closed shape as clip */
  clip(pts: P2[], fn: () => void) { const g = this.g; g.save(); this.path(pts, true); g.clip(); fn(); g.restore(); }
  /** flat fill + soft crescent on the side away from the light (light = canvas angle the light comes FROM).
   *  Radial ramp centred `shift` R toward the light: flat out to ~0.6 R on the far side, full shadow by ~0.8 R. */
  shadedFill(pts: P2[], base: string, shadow: string, light: number, R: number, shift = 0.45, r0 = 1.05, r1 = 1.25) {
    const g = this.g, n = pts.length;
    let cx = 0, cy = 0;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; }
    const [gx, gy] = this.P(cx + Math.cos(light) * shift * R, cy + Math.sin(light) * shift * R);
    const gr = g.createRadialGradient(gx, gy, 0, gx, gy, r1 * R);
    gr.addColorStop(0, base); gr.addColorStop(r0 / r1, base); gr.addColorStop(1, shadow);
    this.path(pts, true); g.fillStyle = gr; g.fill();
  }
  /** broad gradient across a shape along the light: lit edge = base, far edge = shadow (torsos, coats) */
  gradFill(pts: P2[], base: string, shadow: string, light: number, flat = 0.22) {
    const g = this.g, dx = Math.cos(light), dy = Math.sin(light), n = pts.length;
    let cx = 0, cy = 0, lo = Infinity, hi = -Infinity;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; const d = x * dx + y * dy; lo = Math.min(lo, d); hi = Math.max(hi, d); }
    const dc = cx * dx + cy * dy;
    const [ax, ay] = this.P(cx + dx * (hi - dc), cy + dy * (hi - dc)), [bx, by] = this.P(cx + dx * (lo - dc), cy + dy * (lo - dc));
    const gr = g.createLinearGradient(ax, ay, bx, by);
    gr.addColorStop(0, base); gr.addColorStop(flat, base); gr.addColorStop(1, shadow);
    this.path(pts, true); g.fillStyle = gr; g.fill();
  }
  /** thick-thin ink ring: w(θ) = w0 (1 + k cos(θ − thick)), θ from the contour centroid (canvas angles) */
  inkRing(pts: P2[], w0: number, thick: number, k = 0.45, col = INK) {
    const n = pts.length;
    let cx = 0, cy = 0;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; }
    const out: P2[] = [], inn: P2[] = [];
    pts.forEach((q, i) => {
      const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
      let nx = b[1] - a[1], ny = a[0] - b[0]; // outward normal for clockwise-on-screen contours
      const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      const h = 0.5 * w0 * (1 + k * Math.cos(Math.atan2(q[1] - cy, q[0] - cx) - thick));
      out.push([q[0] + nx * h, q[1] + ny * h]); inn.push([q[0] - nx * h, q[1] - ny * h]);
    });
    const g = this.g;
    const trace = (r: P2[]) => { r.forEach(([x0, y0], i) => { const [x, y] = this.P(x0, y0); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath(); };
    g.beginPath(); trace(out); trace(inn.reverse());
    g.fillStyle = col; g.fill("evenodd");
  }
  /** flat strap with a thin ink rim (cross belts, sash, rifle, handles) */
  band(pts: P2[], fill: string, w: number, rim: number, cap: CanvasLineCap = "butt") {
    const g = this.g; g.lineCap = cap; g.lineJoin = "round";
    this.path(pts, false); g.strokeStyle = INK; g.lineWidth = w + 2 * rim; g.stroke();
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
    g.lineCap = "round";
  }
}

const ellPts = (cx: number, cy: number, rx: number, ry: number, a0 = 0, a1 = 360, rot = 0, n = 48): P2[] => {
  const r = rad(rot), pts: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const a = rad(a0 + ((a1 - a0) * i) / n), x = rx * Math.cos(a), y = ry * Math.sin(a);
    pts.push([cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)]);
  }
  return pts;
};

const rrect = (x0: number, y0: number, x1: number, y1: number, r: number, n = 8): P2[] => {
  const pts: P2[] = [];
  for (const [cx, cy, a] of [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]])
    for (let i = 0; i <= n; i++) pts.push([cx + r * Math.cos(rad(a + (90 * i) / n)), cy + r * Math.sin(rad(a + (90 * i) / n))]);
  return pts;
};

/** tapered stroke, thick end at a: brows, moustache halves */
const taper = (p: Pen, a: P2, b: P2, wa: number, wb: number, col = INK) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  p.poly([[a[0] + nx * wa / 2, a[1] + ny * wa / 2], [b[0] + nx * wb / 2, b[1] + ny * wb / 2],
    [b[0] - nx * wb / 2, b[1] - ny * wb / 2], [a[0] - nx * wa / 2, a[1] - ny * wa / 2]], col, 0);
  p.dot(a[0], a[1], wa / 2, col); p.dot(b[0], b[1], wb / 2, col);
};

// ---------------- contours ----------------
export type Blob = { a: number; b: number; nTop: number; nBot: number; egg: number; asym: number; rot: number; noise: number; seed: number };

/** superellipse "bean": separate crown / jaw exponents, egg taper (neg = narrower chin), one-side bulge, soft noise.
 *  Points run right -> down -> left -> up (clockwise on screen). */
export const blobPts = (cx: number, cy: number, B: Blob, n = 72): P2[] => {
  const ph = [rnd(B.seed, 11), rnd(B.seed, 12), rnd(B.seed, 13)].map((v) => v * Math.PI * 2);
  const pts: P2[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t), e = 2 / (s < 0 ? B.nTop : B.nBot);
    let X = Math.sign(c) * Math.abs(c) ** e;
    const Y = Math.sign(s) * Math.abs(s) ** e;
    X *= (1 + B.egg * Y) * (1 + B.asym * Math.sign(X));
    const r = 1 + B.noise * (Math.cos(2 * t + ph[0]) + 0.7 * Math.cos(3 * t + ph[1]) + 0.5 * Math.cos(4 * t + ph[2]));
    const x = B.a * X * r, y = B.b * Y * r;
    pts.push([cx + x * Math.cos(B.rot) - y * Math.sin(B.rot), cy + x * Math.sin(B.rot) + y * Math.cos(B.rot)]);
  }
  return pts;
};

/** measured head: H/W 0.94, slightly pointed crown (1.75), fuller jaw (2.3), chin taper -0.12, 8 % bulge to the facing side */
export const headBlob = (seed: number, a = 118, facing = 0): Blob => ({
  a, b: a * (0.94 + 0.08 * (rnd(seed, 1) - 0.5)),
  nTop: 1.75 + 0.3 * (rnd(seed, 2) - 0.5), nBot: 2.3 + 0.3 * (rnd(seed, 3) - 0.5),
  egg: -0.12 + 0.06 * (rnd(seed, 4) - 0.5),
  asym: (0.06 + 0.04 * rnd(seed, 5)) * (facing || (rnd(seed, 6) < 0.5 ? -1 : 1)),
  rot: rad(8 * (rnd(seed, 7) - 0.5)), noise: 0.008, seed,
});

/** thickest outline direction: away from the light, pulled toward the ground (64 deg measured for upper-left light) */
export const thickAngle = (light: number) => Math.atan2(-Math.sin(light) + 0.8, -Math.cos(light));
const DEF_LIGHT = rad(-120);

// ---------------- faces ----------------
export type Expr = "neutral" | "stern" | "grin" | "laugh" | "whistle" | "nervous" | "shock" | "relief" | "relief_open" | "dazed"
  | "pained" | "smile" | "smile_closed" | "lick";
type EyeK = "dot" | "small" | "lid" | "slit" | "happy" | "dash" | "squeeze" | "shock" | "shockHalf" | "spiral";
type MouthK = "dash" | "frown" | "smirk" | "smile" | "smileWide" | "grin" | "laugh" | "o" | "O" | "wave" | "teeth" | "lick";
/** eyes [back, front], brows [inner, outer] offsets in u (+ = down), mouth kind */
const FACE: Record<Expr, { eye: [EyeK, EyeK]; brow: [number, number]; mouth: MouthK }> = {
  neutral: { eye: ["lid", "lid"], brow: [0, -1], mouth: "dash" },
  stern: { eye: ["lid", "lid"], brow: [3, -2], mouth: "frown" },
  grin: { eye: ["happy", "happy"], brow: [-3, -3], mouth: "grin" },
  laugh: { eye: ["squeeze", "squeeze"], brow: [-4, -4], mouth: "laugh" },
  whistle: { eye: ["dash", "dash"], brow: [-2, -4], mouth: "o" },
  nervous: { eye: ["small", "small"], brow: [-3, 2], mouth: "wave" },
  shock: { eye: ["shock", "shock"], brow: [-7, -6], mouth: "O" },
  relief: { eye: ["happy", "happy"], brow: [-2, 1], mouth: "smileWide" },
  relief_open: { eye: ["happy", "happy"], brow: [-2, 1], mouth: "grin" },
  dazed: { eye: ["spiral", "spiral"], brow: [-3, 2], mouth: "wave" },
  pained: { eye: ["squeeze", "lid"], brow: [-3, 2], mouth: "teeth" },
  smile: { eye: ["dot", "dot"], brow: [0, -1], mouth: "smirk" },
  smile_closed: { eye: ["happy", "happy"], brow: [0, -1], mouth: "smile" },
  lick: { eye: ["dot", "dot"], brow: [0, -1], mouth: "lick" },
};
const halfLid = (k: EyeK): EyeK => (k === "dot" || k === "small" ? "lid" : k === "lid" ? "slit" : k === "shock" ? "shockHalf" : k);
const eyeKind = (k: EyeK, lid: number): EyeK =>
  lid >= 1 && k !== "happy" && k !== "squeeze" && k !== "spiral" ? "dash" : lid > 0 ? halfLid(k) : k;
const lidOf = (b: boolean | number | undefined) => (b === true ? 1 : Number(b) || 0);

const eye = (p: Pen, kind: EyeK, x: number, ey: number, u: number, side: number, look: number, skin: string) => {
  const lx = x + look * 3 * u, lw = 3.8 * u;
  switch (kind) {
    case "dot": p.ell(lx, ey, 3.8 * u, 5.5 * u, INK, 0); break;
    case "small": p.ell(lx, ey, 3 * u, 4.4 * u, INK, 0); break;
    case "lid": p.ell(lx, ey - u, 7 * u, 6 * u, INK, 0, 0, 180); p.stroke([[x - 9 * u, ey - u], [x + 9 * u, ey - u]], lw); break;
    case "slit": p.ell(lx, ey, 7 * u, 2.6 * u, INK, 0, 0, 180); p.stroke([[x - 9 * u, ey], [x + 9 * u, ey]], lw); break;
    case "happy": p.arc(x, ey + 3 * u, 8 * u, 6 * u, 200, 340, lw); break;
    case "dash": p.stroke([[x - 8.5 * u, ey], [x + 8.5 * u, ey]], lw); break;
    case "squeeze": p.stroke([[x + 6 * u * side, ey - 5 * u], [x - 6 * u * side, ey], [x + 6 * u * side, ey + 5 * u]], lw); break;
    case "shock": case "shockHalf":
      p.ell(x, ey, 11 * u, 11 * u, WHITE, 2.6 * u); p.dot(lx - side * 1.5 * u, ey + 1.5 * u, 3 * u);
      if (kind === "shockHalf") { p.ell(x, ey, 11 * u, 11 * u, skin, 0, 180, 360); p.stroke([[x - 11 * u, ey], [x + 11 * u, ey]], 2.6 * u); }
      break;
    default: {
      const s: P2[] = [];
      for (let t = 1; t < 15; t++) s.push([x + Math.cos(t * 0.9) * t * 0.55 * u, ey + Math.sin(t * 0.9) * t * 0.55 * u]);
      p.stroke(s, 2.4 * u);
    }
  }
};

/** open "D" mouth with a white teeth band (+ tongue) */
const dmouth = (p: Pen, mx: number, y: number, rx: number, ry: number, u: number, tongue = false) => {
  p.ell(mx, y, rx, ry, MOUTH, 0, 0, 180);
  p.clip([[mx - rx, y], [mx + rx, y], [mx + rx, y + 3 * u], [mx - rx, y + 3 * u]], () => p.ell(mx, y, rx, ry, WHITE, 0, 0, 180));
  if (tongue) p.ell(mx + 2 * u, y + 0.62 * ry, 0.4 * rx, 0.28 * ry, TONGUE, 0);
  p.ell(mx, y, rx, ry, null, 3 * u, 0, 180);
};

const mouth = (p: Pen, kind: MouthK, mx: number, my: number, u: number, k = 1) => {
  const mw = 4 * u;
  switch (kind) {
    case "dash": p.stroke([[mx - 5.5 * u * k, my], [mx + 5.5 * u * k, my - 0.8 * u]], mw); break;
    case "frown": p.arc(mx, my + 3 * u, 6.5 * u * k, 3.5 * u, 200, 340, mw); break;
    case "smirk": p.arc(mx + u, my - 3 * u, 7 * u * k, 4 * u, 10, 150, mw); break;
    case "smile": p.arc(mx, my - 3 * u, 8 * u * k, 4.5 * u, 20, 160, mw); break;
    case "smileWide": p.arc(mx, my - 4 * u, 11 * u * k, 6 * u, 15, 165, mw); break;
    case "grin": dmouth(p, mx, my - u, 12 * u * k, 8 * u, u); break;
    case "laugh": dmouth(p, mx, my, 16 * u * k, 11 * u, u, true); break;
    case "o": p.ell(mx + 4 * u, my, 3.5 * u, 4 * u, MOUTH, 2.8 * u); break;
    case "O": p.ell(mx, my + 2 * u, 9 * u * k, 11 * u, MOUTH, 3.2 * u); break;
    case "wave": { const s: P2[] = []; for (let i = 0; i <= 12; i++) s.push([mx - 9 * u * k + i * 1.5 * u * k, my + 1.5 * u * Math.sin(i * 1.3)]); p.stroke(s, 3 * u); break; }
    case "teeth":
      p.poly([[mx - 12 * u * k, my - 4 * u], [mx + 12 * u * k, my - 4 * u], [mx + 11 * u * k, my + 4 * u], [mx - 11 * u * k, my + 4 * u]], WHITE, 3 * u);
      for (const j of [-1, 0, 1]) p.stroke([[mx + j * 6 * u * k, my - 4 * u], [mx + j * 6 * u * k, my + 4 * u]], 1.5 * u);
      break;
    case "lick": p.arc(mx, my - 3 * u, 8 * u * k, 4.5 * u, 20, 160, mw); p.ell(mx + 6 * u * k, my + 3 * u, 3.6 * u, 4.6 * u, TONGUE, 2.4 * u); break;
  }
};

/** face v2 (front / 3-4). u = 1 % of the head path width W. Eyes 26u apart on the centre line, brows 20u up, mouth 20u
 *  down, everything slid toward the facing side. No blush, no catchlights. */
const faceFront = (p: Pen, cx: number, cy: number, W: number, expr: Expr, facing: number, look: number, lid: number, brim: boolean,
  skin: string, moustache?: string, stout = false) => {
  const u = W / 100, F = FACE[expr], fx = cx + 7 * u * facing;
  const ex = (F.eye[0] === "shock" ? 12 : 13) * u, ey = cy;
  for (const side of [-1, 1]) {
    const x = fx + side * ex;
    const kind = eyeKind(F.eye[(facing ? side === facing : side > 0) ? 1 : 0], lid);
    eye(p, kind, x, ey, u, side, look, skin);
    const [dI, dO] = F.brow, by = ey - (brim ? 17 : 20) * u;
    if (kind === "shock" || kind === "shockHalf") p.arc(x, by - 6 * u, 9 * u, 3 * u, 200, 340, 4 * u);
    else taper(p, [x - side * 8.5 * u, by + dI * u], [x + side * 8.5 * u, by + dO * u], 5 * u, 2.5 * u);
  }
  const mx = cx + 8 * u * facing, my = cy + 20 * u;
  mouth(p, F.mouth, mx, my, u);
  if (moustache) for (const s of [-1, 1])
    taper(p, [mx + s * 1.5 * u, cy + 12.5 * u], [mx + s * (stout ? 19 : 15) * u, cy + (stout ? 10.5 : 15) * u], stout ? 5.5 * u : 4.5 * u, 1.6 * u, moustache);
  if (expr === "nervous") p.ell(cx + 40 * u * (facing || 1), cy - 22 * u, 3 * u, 5 * u, "#9fd4ff", 2 * u);
};

/** profile face (facing screen-right): one eye, brow, nose tick, mouth near the front edge; no skin bump nose, no ear */
const faceSide = (p: Pen, hx: number, hy: number, W: number, expr: Expr, lid: number, brim: boolean, skin: string, moustache?: string, stout = false) => {
  const u = W / 100, F = FACE[expr], ex = hx + 27 * u, ey = hy;
  const kind = eyeKind(F.eye[1], lid);
  eye(p, kind, ex, ey, u, 1, 0.6, skin);
  const by = ey - (brim ? 17 : 20) * u, [dI, dO] = F.brow;
  if (kind === "shock" || kind === "shockHalf") p.arc(ex, by - 6 * u, 9 * u, 3 * u, 200, 340, 4 * u);
  else taper(p, [ex + 8 * u, by + dI * u], [ex - 7 * u, by - u + dO * u], 5 * u, 2.5 * u);
  p.stroke([[hx + 44 * u, hy + 4 * u], [hx + 47.5 * u, hy + 9 * u], [hx + 43 * u, hy + 10 * u]], 3 * u);
  mouth(p, F.mouth, hx + 33 * u, hy + 21 * u, u, 0.62);
  if (moustache) taper(p, [hx + 41 * u, hy + 13.5 * u], [hx + 25 * u, hy + (stout ? 11.5 : 16) * u], stout ? 5.5 * u : 4.5 * u, 1.6 * u, moustache);
  if (expr === "nervous") p.ell(hx - 30 * u, hy - 24 * u, 3 * u, 5 * u, "#9fd4ff", 2 * u);
};

// ---------------- hats ----------------
const BONNET = "#e9cf8f", BONNET_BRIM = "#d6b46a";
/** parts of a hat that sit behind the head (bonnet) */
const hatBehind = (p: Pen, o: Outfit, H: Blob, cx: number, hc: number, light: number, thick: number, ow: number, side: boolean) => {
  if (o.hat !== "bonnet") return;
  const bb = blobPts(cx - (side ? 12 : 0) * (H.a / 50), hc - 0.07 * 2 * H.b, { ...H, a: H.a * 1.17, b: H.b * 1.13, asym: 0, egg: 0.04, seed: H.seed + 3 });
  p.shadedFill(bb, BONNET, mul(BONNET, SH_CLOTH), light, H.a * 1.17);
  p.inkRing(bb, ow * 0.85, thick);
};

const hatOn = (p: Pen, o: Outfit, hp: P2[], H: Blob, cx: number, hc: number, light: number, seed: number, facing: number, side: boolean) => {
  const W = 2 * H.a, HH = 2 * H.b, u = W / 100, crown = hc - H.b, ow = 0.85 * 5 * u;
  const a = H.rot + rad(4 * (rnd(seed, 20) - 0.5)); // tilt with the head, +-2 deg extra
  const R = (pts: P2[]) => rotPts(pts, a, cx, hc);
  const sag = (yb: number, wb: number): P2[] => {
    const base: P2[] = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; base.push([cx + wb * (2 * t - 1), yb + 3 * u * (1 - (2 * t - 1) ** 2)]); }
    return base;
  };
  if (o.hat === "shako" || o.hat === "shako_tall") {
    const tall = o.hat === "shako_tall", yb = crown + 0.25 * HH, ht = (tall ? 0.66 : 0.56) * HH, wb = 46 * u, wt = 52 * u;
    const body = R([...sag(yb, wb).reverse(), [cx - wt, yb - ht], [cx + wt, yb - ht]]);
    p.shadedFill(body, "#3a3d47", "#24262d", light, wt, 0.4);
    if (tall) p.clip(body, () => p.band(R([[cx - wt - 5 * u, yb - ht + 0.07 * HH], [cx + wt + 5 * u, yb - ht + 0.07 * HH]]), "#e8c45a", 0.06 * HH, 1.5 * u));
    p.poly(body, null, ow);
    const deg = (a * 180) / Math.PI;
    if (side) {
      p.poly(R([[cx + 36 * u, yb - 1 * u], [cx + 60 * u, yb + 8 * u], [cx + 34 * u, yb + 6 * u]]), "#16171b", 2.5 * u);
      const [tx, ty] = R([[cx + 24 * u, yb - ht - 6 * u]])[0];
      p.ell(tx, ty, 7 * u, 7 * u, "#2b7a4b", 2.5 * u);
    } else {
      const [px, py] = R([[cx + 3 * u * facing, yb + 3 * u]])[0];
      p.ell(px, py, 34 * u, 0.045 * HH, "#16171b", 2.5 * u, 0, 180, deg); // peak
      const [bx, by] = R([[cx, yb - 0.45 * ht]])[0];
      p.ell(bx, by, 7 * u, 6 * u, tall ? "#e8c45a" : "#c9ccd2", 2 * u, 0, 360, deg); // badge plate
      p.arc(bx, by, 3.5 * u, 2.8 * u, 200, 500, 1.6 * u);
      const [tx, ty] = R([[cx, yb - ht - 6 * u]])[0];
      p.ell(tx, ty, 7 * u, 7 * u, "#2b7a4b", 2.5 * u); // green tuft
    }
  } else if (o.hat === "cap" || o.hat === "hair") {
    const cut = crown + (o.hat === "cap" ? 0.3 : 0.42) * HH;
    const keep = (x: number, y: number) => y < cut || (side && o.hat === "hair" && x < cx - 6 * u && y < hc + 0.42 * H.b);
    // start the arc at the first kept point after a dropped one, so the kept run is contiguous and the cut closes it
    const n = hp.length, startIdx = Math.max(0, hp.findIndex(([x, y], i) => keep(x, y) && !keep(hp[(i + n - 1) % n][0], hp[(i + n - 1) % n][1])));
    const arc = [...hp.slice(startIdx), ...hp.slice(0, startIdx)].filter(([x, y]) => keep(x, y))
      .map(([x, y]) => [cx + (x - cx) * 1.03, hc + (y - hc) * 1.03] as P2);
    if (arc.length < 3) return;
    if (o.hat === "hair") { // scalloped lower edge
      const [x0, y0] = arc[arc.length - 1], [x1, y1] = arc[0];
      for (let i = 1; i < 6; i++) arc.push([x0 + ((x1 - x0) * i) / 6, y0 + ((y1 - y0) * i) / 6 + (i % 2 ? 4 * u : 0)]);
    }
    const col = o.hat === "cap" ? o.cap! : o.hair!;
    p.shadedFill(arc, col, mul(col, SH_FELT), light, H.a, 0.35);
    p.poly(arc, null, ow);
    if (o.hat === "hair") {
      const s = side ? -1 : facing || 1;
      p.stroke([[cx + s * 10 * u, cut - 30 * u], [cx + s * 2 * u, cut - 12 * u]], 1.2 * u);
    }
    if (o.hat === "cap") {
      const deg = (a * 180) / Math.PI;
      if (side) p.poly(R([[cx + 40 * u, cut - 2 * u], [cx + 74 * u, cut + 4 * u], [cx + 40 * u, cut + 6 * u]]), shade(col, 0.8), ow);
      else {
        const s = facing || (rnd(seed, 21) < 0.5 ? -1 : 1), [px, py] = R([[cx + s * 4 * u, cut + 1.5 * u]])[0];
        p.ell(px, py, 32 * u, 0.06 * HH, shade(col, 0.8), ow, 0, 180, deg);
      }
    }
  } else if (o.hat === "tophat") {
    const yb = crown + 0.22 * HH, ht = 0.8 * HH, wb = 0.31 * W, wt = 0.33 * W, col = "#2e2a36";
    const body = R([...sag(yb, wb).reverse(), [cx - wt, yb - ht], [cx + wt, yb - ht]]);
    p.shadedFill(body, col, mul(col, SH_FELT), light, wt, 0.4);
    p.clip(body, () => p.band(R([[cx - wt - 4 * u, yb - 0.13 * HH], [cx + wt + 4 * u, yb - 0.13 * HH]]), shade(o.jacket, 0.9), 0.14 * HH, 0.8 * u));
    p.poly(body, null, ow);
    const [bx, by] = R([[cx, yb + 1 * u]])[0];
    p.ell(bx, by, 0.45 * W, 0.05 * HH, "#1d1b22", ow, 0, 360, (a * 180) / Math.PI);
  } else if (o.hat === "galea") {
    // Roman helmet: iron bowl above the brow, bronze brow band, cheek guards, neck guard, red horsehair crest
    const cut = crown + 0.36 * HH, iron = "#bdb8ae", bronze = "#d6a54c", crest = o.crest ?? "#d8352f";
    const n = hp.length, keep = (_x: number, y: number) => y < cut;
    const si = Math.max(0, hp.findIndex(([x, y], i) => keep(x, y) && !keep(hp[(i + n - 1) % n][0], hp[(i + n - 1) % n][1])));
    const bowl = [...hp.slice(si), ...hp.slice(0, si)].filter(([x, y]) => keep(x, y)).map(([x, y]) => [cx + (x - cx) * 1.07, hc + (y - hc) * 1.07] as P2);
    if (bowl.length < 3) return;
    const deg = (a * 180) / Math.PI;
    if (side) {
      // crest front-to-back over the top, drawn behind the bowl
      const cr: P2[] = [];
      for (let i = 0; i <= 16; i++) { const t = rad(195 + (i / 16) * 150); cr.push([cx - 4 * u + 0.5 * W * 0.98 * Math.cos(t), crown + 0.2 * HH + 0.38 * HH * Math.sin(t)]); }
      for (let i = 16; i >= 0; i--) { const t = rad(195 + (i / 16) * 150); cr.push([cx - 4 * u + 0.5 * W * 0.78 * Math.cos(t), crown + 0.2 * HH + 0.22 * HH * Math.sin(t)]); }
      p.shadedFill(R(cr), crest, mul(crest, SH_FELT), light, H.a, 0.3); p.poly(R(cr), null, ow * 0.8);
      p.poly(R([[cx - 0.46 * W, cut - 0.02 * HH], [cx - 0.66 * W, cut + 0.13 * HH], [cx - 0.44 * W, cut + 0.12 * HH]]), iron, ow * 0.8); // neck guard
    } else {
      // crest seen end-on: a tall horsehair brush on a bronze stem, bristle ticks
      const st = R([[cx - 0.05 * W, crown + 0.02 * HH], [cx + 0.05 * W, crown + 0.02 * HH], [cx + 0.04 * W, crown - 0.08 * HH], [cx - 0.04 * W, crown - 0.08 * HH]]);
      p.poly(st, bronze, ow * 0.6);
      const br: P2[] = [];
      for (let i = 0; i <= 20; i++) { const t = rad(180 + i * 9); br.push([cx + 0.1 * W * Math.cos(t), crown - 0.08 * HH + 0.42 * HH * Math.sin(t) * (Math.sin(t) < 0 ? 1 : 0.1)]); }
      p.shadedFill(R(br), crest, mul(crest, SH_FELT), light, 0.14 * W, 0.3); p.poly(R(br), null, ow * 0.8);
      for (const k of [-0.045, 0, 0.045]) p.stroke(R([[cx + k * W, crown - 0.12 * HH], [cx + k * 1.2 * W, crown - 0.4 * HH]]), 1.4 * u, mul(crest, [0.6, 0.6, 0.6]));
    }
    p.shadedFill(bowl, iron, mul(iron, SH_FELT), light, H.a, 0.35);
    p.poly(bowl, null, ow);
    const x0 = Math.min(...bowl.map((q) => q[0])), x1 = Math.max(...bowl.map((q) => q[0]));
    p.band(R([[x0 + 3 * u, cut - 2 * u], [x1 - 3 * u, cut - 2 * u]]), bronze, 0.05 * HH, 1.4 * u);
    const plate = (pts: P2[]) => { p.shadedFill(R(pts), iron, mul(iron, SH_FELT), light, H.a * 0.4, 0.3); p.poly(R(pts), null, ow * 0.7); };
    if (side) plate([[cx - 0.2 * W, cut], [cx - 0.06 * W, cut], [cx - 0.08 * W, hc + 0.22 * HH], [cx - 0.17 * W, hc + 0.25 * HH]]);
    else for (const sg of [-1, 1]) {
      plate([[cx + sg * 0.35 * W, cut], [cx + sg * 0.53 * W, cut], [cx + sg * 0.5 * W, hc + 0.3 * HH], [cx + sg * 0.38 * W, hc + 0.35 * HH]]);
      p.poly(R([[cx + sg * 0.5 * W, cut + 0.02 * HH], [cx + sg * 0.64 * W, cut + 0.12 * HH], [cx + sg * 0.5 * W, cut + 0.1 * HH]]), iron, ow * 0.7);
    }
  } else if (o.hat === "laurel") {
    hatOn(p, { ...o, hat: "hair" }, hp, H, cx, hc, light, seed, facing, side);
    const yb = crown + 0.34 * HH, leaf = "#6a9a3a";
    const leafAt = (x: number, y: number, ang: number) => p.ell(x, y, 9 * u, 4.4 * u, leaf, 1.6 * u, 0, 360, ang);
    if (side) for (let i = 0; i < 7; i++) { const t = i / 6; leafAt(cx - 0.42 * W + t * 0.7 * W, yb + 0.03 * HH * Math.sin(t * 3), i % 2 ? 30 : -30); }
    else for (const sg of [-1, 1]) for (let i = 0; i < 5; i++) {
      const t = rad(sg > 0 ? 10 + i * 14 : 170 - i * 14), [x, y] = R([[cx + 0.52 * W * Math.cos(t), yb + 0.1 * HH * Math.sin(t) - i * 1.5 * u]])[0];
      leafAt(x, y, sg * (25 + i * 12));
    }
  } else if (o.hat === "longhair" || o.hat === "spangen") {
    const col = o.hair ?? "#8a5a2a";
    const lock = (pts: P2[]) => { p.shadedFill(R(pts), col, mul(col, SH_FELT), light, H.a * 0.5, 0.3); p.poly(R(pts), null, ow * 0.8); };
    if (side) lock([[cx - 0.2 * W, crown + 0.3 * HH], [cx - 0.52 * W, hc + 0.1 * HH], [cx - 0.48 * W, hc + 0.6 * HH], [cx - 0.24 * W, hc + 0.56 * HH], [cx - 0.08 * W, hc + 0.1 * HH]]);
    else for (const sg of [-1, 1]) lock([[cx + sg * 0.4 * W, crown + 0.3 * HH], [cx + sg * 0.57 * W, hc + 0.12 * HH], [cx + sg * 0.55 * W, hc + 0.62 * HH], [cx + sg * 0.39 * W, hc + 0.5 * HH]]);
    hatOn(p, { ...o, hat: "hair" }, hp, H, cx, hc, light, seed, facing, side);
    if (o.hat === "spangen") {
      const yb = crown + 0.3 * HH, iron = "#8f949c";
      const body = R([[cx - 0.54 * W, yb], [cx + 0.54 * W, yb], [cx + 0.2 * W, crown - 0.12 * HH], [cx, crown - 0.32 * HH], [cx - 0.2 * W, crown - 0.12 * HH]]);
      p.shadedFill(body, iron, mul(iron, SH_FELT), light, 0.5 * W, 0.35); p.poly(body, null, ow);
      p.band(R([[cx - 0.54 * W, yb - 2 * u], [cx + 0.54 * W, yb - 2 * u]]), "#c99a48", 0.06 * HH, 1.4 * u);
      p.band(R([[cx, yb - 4 * u], [cx, crown - 0.28 * HH]]), "#c99a48", 0.035 * HH, 1.2 * u);
    }
  } else if (o.hat === "bonnet") {
    const [bx, by] = R([[cx + (side ? 6 * u : 0), crown + 0.16 * HH]])[0];
    p.arc(bx, by, 0.5 * W, 0.2 * HH, 200, 340, 7 * u, BONNET_BRIM);
    p.arc(bx, by, 0.5 * W + 3.5 * u, 0.2 * HH + 3.5 * u, 200, 340, 1.2 * u);
    const cy = hc + H.b * 0.98;
    p.stroke([[cx - 14 * u, cy - 4 * u], [cx, cy + 2 * u], [cx + 14 * u, cy - 4 * u]], 2 * u, BONNET_BRIM);
  }
};

// ---------------- Roman props ----------------
const drawLong = (p: Pen, kind: string, a: P2, b: P2, u: number) => {
  p.band([a, b], "#8a5a34", 4.6 * u, 1.4 * u, "round");
  if (kind === "shovel") {
    p.poly([[a[0] - 12 * u, a[1] - 30 * u], [a[0] + 12 * u, a[1] - 30 * u], [a[0] + 10 * u, a[1] + 2 * u], [a[0] - 10 * u, a[1] + 2 * u]], "#9aa0a8", 2 * u);
    p.band([[b[0] - 9 * u, b[1]], [b[0] + 9 * u, b[1]]], "#8a5a34", 4 * u, 1.4 * u, "round");
  } else if (kind === "spear") {
    p.poly([[b[0], b[1] - 30 * u], [b[0] + 7 * u, b[1] - 10 * u], [b[0], b[1] + 4 * u], [b[0] - 7 * u, b[1] - 10 * u]], "#c3c7cd", 2 * u);
  } else {
    p.band([[b[0] - 50 * u, b[1] + 6 * u], [b[0] + 4 * u, b[1] + 6 * u]], "#8a5a34", 3 * u, 1.2 * u, "round");
    p.poly([[b[0] - 46 * u, b[1] + 8 * u], [b[0] - 2 * u, b[1] + 8 * u], [b[0] - 2 * u, b[1] + 60 * u], [b[0] - 46 * u, b[1] + 60 * u]], "#b8322f", 2 * u);
    p.poly([[b[0] - 40 * u, b[1] + 14 * u], [b[0] - 8 * u, b[1] + 14 * u], [b[0] - 8 * u, b[1] + 54 * u], [b[0] - 40 * u, b[1] + 54 * u]], null, 1.8 * u);
    p.ell(b[0] - 24 * u, b[1] + 34 * u, 8 * u, 8 * u, "#e8c45a", 1.6 * u);
    p.ell(b[0], b[1] - 6 * u, 7 * u, 7 * u, "#e8c45a", 1.8 * u);
  }
};
/** marching pole over the shoulder: bundle, cooking pot, bag */
export const drawFurca = (p: Pen, a: P2, b: P2, u: number, lvl = 3) => {
  if (lvl >= 3) { // spade strapped along the pole
    const c = lerp2(a, b, 0.55);
    p.band([lerp2(a, b, 0.2), lerp2(a, b, 0.95)], "#9a6a3a", 3.4 * u, 1.2 * u, "round");
    p.poly([[c[0] - 10 * u, c[1] - 4 * u], [c[0] + 12 * u, c[1] - 8 * u], [c[0] + 14 * u, c[1] + 16 * u], [c[0] - 8 * u, c[1] + 20 * u]], "#9aa0a8", 2 * u);
  }
  p.band([a, b], "#8a5a34", 4 * u, 1.4 * u, "round");
  p.ell(b[0] - 6 * u, b[1] + 22 * u, 20 * u, 14 * u, "#c9a46a", 2 * u);
  if (lvl >= 2) { p.ell(b[0] + 14 * u, b[1] + 40 * u, 13 * u, 11 * u, "#4a4a52", 2 * u); p.stroke([[b[0] + 14 * u, b[1] + 29 * u], [b[0] + 4 * u, b[1] + 8 * u]], 1.6 * u); }
  p.ell(b[0] - 18 * u, b[1] + 44 * u, 11 * u, 14 * u, "#8a6a4a", 2 * u);
};
/** curved Roman shield (scutum), front view */
const drawScutum = (p: Pen, cx: number, y0: number, y1: number, w: number, light: number, u: number) => {
  const pts = rrect(cx - w / 2, y0, cx + w / 2, y1, 10 * u);
  p.gradFill(pts, "#c0362f", "#7e2420", light, 0.4);
  p.poly(pts, null, 4 * u);
  p.poly(rrect(cx - w / 2 + 7 * u, y0 + 7 * u, cx + w / 2 - 7 * u, y1 - 7 * u, 7 * u), null, 2.4 * u);
  p.clip(pts, () => {
    p.band([[cx - w / 2 + 7 * u, y0 + 7 * u], [cx + w / 2 - 7 * u, y0 + 7 * u], [cx + w / 2 - 7 * u, y1 - 7 * u], [cx - w / 2 + 7 * u, y1 - 7 * u], [cx - w / 2 + 7 * u, y0 + 7 * u]], "#e8c45a", 3 * u, 0);
  });
  const cy = (y0 + y1) / 2;
  for (const s of [-1, 1]) p.stroke([[cx, cy + s * 18 * u], [cx + 14 * u, cy + s * 40 * u], [cx - 6 * u, cy + s * 52 * u], [cx + 8 * u, cy + s * 70 * u]], 3 * u, "#e8c45a");
  p.ell(cx, cy, 13 * u, 13 * u, "#d8b45a", 2.6 * u);
};

// ---------------- bodies ----------------
export type Arms = [P2[], P2[]];
/** held prop; for the hammer the number is the strike 0 (raised) .. 1 (struck) */
export type Prop = null | "icecream" | "shako" | ["hammer", number] | "gladius" | "shovel" | ["dig", number] | ["furca", number] | "pizza" | "scroll" | "coins"
  | "sack" | "torch" | "spear" | "banner" | "cheer" | "arms" | "shrug";
const LONG = new Set(["shovel", "spear", "banner"]);
const TWO = new Set(["pizza", "cheer", "arms", "shrug"]);

const BUILD: Record<Build, { a: number; torso: number; legs: number; tw: number }> = {
  adult: { a: 118, torso: 1.1, legs: 1.4, tw: 0.8 },
  stout: { a: 118, torso: 1.15, legs: 1.32, tw: 0.92 },
  kid: { a: 112, torso: 0.85, legs: 1.0, tw: 0.72 },
};

export type FrontOpts = {
  phase?: number; expr?: Expr; mode?: "march" | "stroll" | "stand" | "sit" | "fall"; look?: number; blink?: boolean | number; lift?: number;
  prop?: Prop; tilt?: number; headTilt?: number; wave?: number;
  /** canvas angle the key light comes FROM (painted crescent + thick outline side) */
  light?: number; facing?: -1 | 0 | 1; seed?: number;
};

const footStroke = (p: Pen, a: P2, b: P2, w: number, col: string) => {
  if (col !== INK) p.stroke([a, b], w + 3, INK);
  p.stroke([a, b], w, col);
};

export const bodyFront = (p: Pen, o: Outfit, opts: FrontOpts) => {
  const { phase = 0, expr = "neutral", mode = "march", look = 0, blink = false, lift = 60, prop = null, tilt = 0, headTilt = 0, wave,
    light = DEF_LIGHT, facing = 0, seed = 1 } = opts;
  const Bd = BUILD[o.build ?? "adult"], skin = o.skin ?? SKIN, two = Math.PI * 2, lid = lidOf(blink);
  const H = headBlob(seed, Bd.a, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const tall = (1 + Bd.torso + Bd.legs) * HH, sole = 975;
  // body bob 5 % (march) / 3 % (stroll) of the height, lowest at contact (phase 0 and 0.5)
  const bob = mode === "march" ? 0.025 * tall * Math.cos(2 * two * phase) : mode === "stroll" ? 0.015 * tall * Math.cos(2 * two * phase) : 0;
  const torsoBot = mode === "sit" ? sole - 0.2 * HH : sole - Bd.legs * HH + bob;
  const chin = torsoBot - Bd.torso * HH, hc = chin - H.b, crown = hc - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u;
  const legCol = o.legs ?? mix(o.pants, INK, 0.55), armCol = o.dress && o.legs ? o.legs : mix(o.jacket, INK, 0.5), footCol = o.boots;
  const legW = 8.6 * u, footW = 9.5 * u;
  // ---- legs + feet (not rotated) ----
  p.rot = null;
  if (mode === "sit") {
    for (const side of [-1, 1]) {
      const h: P2 = [300 + side * 15 * u, hipY], k: P2 = [300 + side * 36 * u, hipY + 0.2 * HH], f: P2 = [300 + side * 44 * u, sole - 8 * u];
      p.stroke(curve(h, k, f), legW, legCol);
      footStroke(p, [f[0] - side * 2 * u, f[1]], [f[0] + side * 12 * u, f[1] - 5 * u], footW, footCol);
    }
  } else if (mode === "fall") {
    const legs: [P2, P2, P2][] = [
      [[300 - 15 * u, hipY], [300 - 46 * u, hipY + 0.5 * HH], [300 - 70 * u, hipY + 0.72 * HH]],
      [[300 + 15 * u, hipY], [300 + 50 * u, hipY + 0.45 * HH], [300 + 76 * u, hipY + 0.22 * HH]],
    ];
    legs.forEach(([h, k, f], i) => {
      p.stroke(curve(h, k, f), legW, legCol);
      footStroke(p, f, [f[0] + (i ? 14 : -14) * u, f[1] + (i ? -6 : 4) * u], footW, footCol);
    });
  } else if (o.dress) {
    for (const side of [-1, 1]) {
      const fx = 300 + side * 12 * u, fy = sole - 4 * u;
      p.stroke([[fx, sole - 0.4 * HH], [fx + side * u, fy]], legW, legCol);
      footStroke(p, [fx - side * 3 * u, fy], [fx + side * 12 * u, fy + u], footW, footCol);
    }
  } else {
    const L = mode === "march" ? lift * 1.25 : mode === "stroll" ? lift * 0.55 : 0;
    for (const [side, ph] of [[-1, 0], [1, 0.5]] as const) {
      const up = Math.max(0, Math.sin(two * (phase + ph))) * L;
      const hx = 300 + side * 15 * u, fx = 300 + side * 22 * u, fy = sole - 4 * u - up;
      const k: P2 = [(hx + fx) / 2 + side * (1.5 * u + up * 0.16), (hipY + fy) / 2 - up * 0.08];
      p.stroke(curve([hx, hipY], k, [fx, fy]), legW, legCol);
      if (o.legs && o.build !== "kid") for (const dy of [9, 19]) p.stroke([[fx - 4.2 * u + side * 0.1 * dy * u, fy - dy * u], [fx + 4.2 * u + side * 0.1 * dy * u, fy - dy * u + 1.5 * u]], 2.6 * u, footCol);
      footStroke(p, [fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u], footW, footCol);
    }
  }
  // ---- upper body: rotates about the hips (tilt + a small weight-shift sway on every step) ----
  const sway = mode === "march" ? 1.6 * Math.sin(two * phase) : mode === "stroll" ? 1.0 * Math.sin(two * phase) : 0;
  const A = tilt + sway;
  p.rot = A ? [rad(A), 300, hipY] : null;
  const dress = !!o.dress && mode !== "sit" && mode !== "fall";
  const T: Blob = { a: ((Bd.tw / 2) * W) / 1.06, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: o.build === "stout" ? 0.17 : 0.12,
    asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = 300 + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const sh = (side: number): P2 => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];
  const hang = (side: number, fwd: number): [P2, P2, P2] => {
    const S = sh(side), ex = tcx + side * (1.12 * T.a + 4 * u);
    const hx = ex + side * 3 * u - side * 6 * u * Math.max(0, fwd) + side * 4 * u * Math.max(0, -fwd);
    return [S, [ex, S[1] + 0.48 * HH], [hx, chin + 1.04 * HH - Math.abs(fwd) * 9 * u]];
  };
  const sw = mode === "march" || mode === "stroll" ? Math.sin(two * phase) : 0;
  // rifle at the order: butt by the right hip, held by the hanging right hand, muzzle past the crown
  const R0: P2 = [300 + 47 * u, torsoBot + 0.12 * HH], R1: P2 = [300 + 64 * u, crown - 0.32 * HH];
  const longP = typeof prop === "string" && LONG.has(prop) ? prop : null;
  const rifle = (!!o.rifle || !!longP) && (mode === "march" || mode === "stand" || mode === "stroll");
  // long props stand on the ground beside the right foot, gripped by the hanging right hand
  const L0: P2 = longP ? [300 + 50 * u, sole - 8 * u] : R0;
  const L1: P2 = longP === "shovel" ? [300 + 58 * u, chin + 0.02 * HH] : longP ? [300 + 62 * u, crown - (longP === "banner" ? 0.85 : 0.55) * HH] : R1;
  const grip = longP === "shovel" ? 0.62 : longP ? 0.4 : 0.1;
  type Arm = { pts: [P2, P2, P2]; front: boolean };
  const arms: Arm[] = [];
  if (mode === "sit") for (const side of [-1, 1]) arms.push({ pts: [sh(side), [tcx + side * (1.1 * T.a + 6 * u), sh(side)[1] + 0.4 * HH], [tcx + side * (1.2 * T.a + 10 * u), torsoBot + 0.04 * HH]], front: false });
  else if (mode === "fall") for (const side of [-1, 1]) arms.push({ pts: [sh(side), [tcx + side * (1.15 * T.a + 12 * u), sh(side)[1] - 0.25 * HH], [tcx + side * (1.3 * T.a + 24 * u), sh(side)[1] - 0.68 * HH]], front: false });
  else if (Array.isArray(prop) && prop[0] === "dig") {
    const k = clamp(prop[1], 0, 1), top: P2 = [300 + 34 * u, chin + 0.42 * HH - k * 0.22 * HH], bot: P2 = [300 - 46 * u, sole - 6 * u - k * 0.5 * HH];
    const h1 = lerp2(top, bot, 0.08), h2 = lerp2(top, bot, 0.42);
    arms.push({ pts: [sh(1), [tcx + 1.05 * T.a + 2 * u, sh(1)[1] + 0.32 * HH], h1], front: true });
    arms.push({ pts: [sh(-1), [tcx - 0.9 * T.a, sh(-1)[1] + 0.42 * HH], h2], front: true });
  } else if (typeof prop === "string" && TWO.has(prop)) {
    for (const sd of [-1, 1]) {
      const S = sh(sd);
      if (prop === "pizza") arms.push({ pts: [S, [tcx + sd * (1.1 * T.a + 4 * u), S[1] + 0.3 * HH], [tcx + sd * 0.66 * T.a, chin + 0.4 * HH]], front: true });
      else if (prop === "cheer") arms.push({ pts: [S, [tcx + sd * (1.15 * T.a + 12 * u), S[1] - 0.2 * HH], [tcx + sd * (1.3 * T.a + 22 * u), S[1] - 0.62 * HH]], front: false });
      else if (prop === "arms") arms.push({ pts: [S, [tcx + sd * (1.12 * T.a + 4 * u), S[1] + 0.4 * HH], [tcx - sd * 0.3 * T.a, chin + 0.42 * HH]], front: true });
      else arms.push({ pts: [S, [tcx + sd * (1.1 * T.a + 6 * u), S[1] + 0.42 * HH], [tcx + sd * (1.3 * T.a + 22 * u), chin + 0.48 * HH]], front: false });
    }
  } else {
    arms.push({ pts: prop === "shako" ? hang(-1, 0) : hang(-1, -sw), front: false });
    if (prop === "gladius" || prop === "torch") {
      const S = sh(1);
      arms.push({ pts: [S, [tcx + 1.15 * T.a + 8 * u, S[1] - 0.18 * HH], [tcx + 1.22 * T.a + 12 * u, S[1] - 0.6 * HH]], front: true });
    } else if ((Array.isArray(prop) && prop[0] === "furca") || prop === "sack") {
      const S = sh(1);
      const fur = Array.isArray(prop);
      arms.push({ pts: [S, [tcx + 1.2 * T.a + 6 * u, S[1] + 0.25 * HH], fur ? [tcx + 0.62 * T.a, chin + 0.2 * HH] : [tcx + 0.85 * T.a, chin + 0.02 * HH]], front: fur });
    } else if (prop === "scroll") {
      const S = sh(1);
      arms.push({ pts: [S, [tcx + 1.05 * T.a + 4 * u, S[1] + 0.45 * HH], [tcx + 0.45 * T.a, S[1] + 0.42 * HH]], front: true });
    } else if (rifle) {
      const G = lerp2(L0, L1, grip);
      arms.push({ pts: [sh(1), [tcx + 1.12 * T.a + 5 * u, sh(1)[1] + 0.45 * HH], G], front: false });
    } else if (wave !== undefined) {
      const S = sh(1);
      arms.push({ pts: [S, [tcx + 1.1 * T.a + 10 * u + 3 * u * wave, S[1] - 0.22 * HH], [tcx + 1.18 * T.a + 16 * u + 12 * u * wave, S[1] - 0.6 * HH]], front: false });
    } else if (prop === "icecream") {
      const S = sh(1);
      arms.push({ pts: [S, [tcx + 1.05 * T.a + 4 * u, S[1] + 0.45 * HH], [tcx + 0.5 * T.a, S[1] + 0.4 * HH]], front: true });
    } else if (Array.isArray(prop) && prop[0] === "hammer") {
      const S = sh(1), k = clamp(prop[1], 0, 1);
      const E = lerp2([tcx + 1.1 * T.a + 10 * u, S[1] - 0.15 * HH], [tcx + 1.2 * T.a + 10 * u, S[1] + 0.3 * HH], k);
      const Hd = lerp2([tcx + 1.15 * T.a + 14 * u, S[1] - 0.55 * HH], [tcx + 1.45 * T.a + 22 * u, S[1] + 0.35 * HH], k);
      arms.push({ pts: [S, E, Hd], front: true });
    } else arms.push({ pts: hang(1, sw), front: false });
  }
  const drawArm = (a: Arm) => { p.stroke(curve(a.pts[0], a.pts[1], a.pts[2]), 5.2 * u, armCol); p.dot(a.pts[2][0], a.pts[2][1], 5.5 * u); };
  // behind the body: rifle, sword, arms
  if (rifle && !longP) {
    p.band([R0, R1], "#7a4b2a", 5 * u, 1.5 * u, "round");
    p.band([lerp2(R0, R1, 0.6), R1], "#8d949c", 2.4 * u, 1.2 * u, "round");
  }
  if (rifle && longP) drawLong(p, longP, L0, L1, u);
  if (o.sword && mode !== "sit") {
    const s0: P2 = [tcx - 0.75 * T.a, torsoBot - 0.2 * HH];
    p.band([s0, [s0[0] - Math.sin(rad(25)) * 0.8 * HH, s0[1] + Math.cos(rad(25)) * 0.8 * HH]], "#c9ccd2", 3 * u, 1.2 * u, "round");
  }
  for (const a of arms) if (!a.front) drawArm(a);
  // torso / dress: shaded fill -> clothing clipped to it -> thick-thin ink ring
  if (dress) {
    const D: Blob = { a: 0.5 * W * 0.98, b: 0.5 * ((sole - 0.35 * HH) - (chin - 0.2 * HH)), nTop: 2.0, nBot: 3.0, egg: 0.35, asym: 0.03 * facing, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(300, sole - 0.35 * HH - D.b, D);
    p.gradFill(dp, o.dress!, mul(o.dress!, SH_CLOTH), light);
    p.clip(dp, () => {
      // toga drape: folds, and (with a sash colour) the coloured border swept from the left shoulder to the right hip
      for (const k of [-0.18, 0.12, 0.38]) p.stroke(curve([300 + k * W, chin + 0.35 * HH], [300 + (k + 0.08) * W, chin + 0.9 * HH], [300 + (k + 0.02) * W, sole - 0.5 * HH], 8), 1.8 * u, mul(o.dress!, [0.72, 0.72, 0.78]));
      if (o.sash) p.band(curve([300 - 0.42 * W, chin + 0.05 * HH], [300 + 0.02 * W, chin + 0.62 * HH], [300 + 0.55 * W, chin + 1.25 * HH], 12), o.sash, 0.11 * HH, 1.6 * u);
    });
    p.inkRing(dp, ow, thick);
    const Sw: Blob = { a: 0.37 * W, b: 0.3 * HH, nTop: 2.2, nBot: 2.4, egg: 0.1, asym: 0, rot: 0, noise: 0.006, seed: seed + 8 };
    const sp = blobPts(300, chin + 0.12 * HH, Sw);
    p.gradFill(sp, o.jacket, mul(o.jacket, SH_CLOTH), light);
    p.inkRing(sp, ow * 0.9, thick);
  } else {
    if (o.skirt && mode !== "sit") {
      const y0 = torsoBot - 0.3 * HH, y1 = torsoBot + 0.42 * HH, sk: P2[] = [[tcx - 0.85 * T.a, y0], [tcx + 0.85 * T.a, y0], [tcx + 1.04 * T.a, y1], [tcx - 1.04 * T.a, y1]];
      p.gradFill(sk, o.skirt, mul(o.skirt, SH_CLOTH), light);
      if (o.lorica) for (let i = -3; i <= 3; i++) p.band([[tcx + i * 0.27 * T.a, y0 + 0.12 * HH], [tcx + i * 0.31 * T.a, y1 - 2 * u]], "#7a4f33", 4 * u, 1.2 * u);
      p.poly(sk, null, 4 * u);
    }
    p.gradFill(tp, o.jacket, mul(o.jacket, SH_CLOTH), light);
    p.clip(tp, () => {
      if (o.belt) {
        for (const s of [-1, 1]) p.band([[tcx - s * 0.75 * T.a, chin - 0.05 * HH], [tcx + s * 0.8 * T.a, torsoBot - 0.1 * HH]], o.belt!, 5.5 * u, 1.8 * u);
        const xc = tcx + 0.025 * T.a, yc = chin - 0.05 * HH + (torsoBot - 0.1 * HH - (chin - 0.05 * HH)) * (0.75 / 1.55);
        p.poly([[xc - 3.5 * u, yc - 3.5 * u], [xc + 3.5 * u, yc - 3.5 * u], [xc + 3.5 * u, yc + 3.5 * u], [xc - 3.5 * u, yc + 3.5 * u]], "#d9dde0", 1.5 * u);
      }
      if (o.lorica) for (let i = 0; i < 5; i++) {
        const y0 = chin - 0.12 * HH + i * 0.15 * HH, c = i % 2 ? "#a9aeb6" : "#c3c7cd";
        p.poly([[tcx - 1.4 * T.a, y0], [tcx + 1.4 * T.a, y0], [tcx + 1.4 * T.a, y0 + 0.15 * HH], [tcx - 1.4 * T.a, y0 + 0.15 * HH]], c, 1.4 * u);
      }
      if (o.plaid) for (let i = -2; i <= 2; i++) {
        p.stroke([[tcx + (i + 0.5) * 0.6 * T.a, chin - 0.3 * HH], [tcx + (i + 0.5) * 0.6 * T.a, torsoBot + 0.1 * HH]], 3 * u, o.plaid);
        p.stroke([[tcx - 1.4 * T.a, chin + (i + 2.6) * 0.26 * HH], [tcx + 1.4 * T.a, chin + (i + 2.6) * 0.26 * HH]], 3 * u, o.plaid);
      }
      if (o.sash) p.band([[tcx - 1.3 * T.a, torsoBot - 0.32 * HH], [tcx + 1.3 * T.a, torsoBot - 0.32 * HH]], o.sash, 0.13 * HH, 1.8 * u);
      if (!o.lorica && o.buttons) for (let i = 0; i < 4; i++) {
        const y = chin + 0.12 * HH + i * 0.2 * HH;
        if (o.sash && Math.abs(y - (torsoBot - 0.32 * HH)) < 0.08 * HH) continue;
        p.dot(tcx + 2 * u * facing, y, 2.2 * u + 0.8 * u, INK); p.dot(tcx + 2 * u * facing, y, 2.2 * u, o.buttons ?? shade(o.jacket, 0.7));
      }
    });
    if (o.sash && !o.lorica) { const s = facing || 1; p.poly([[tcx + s * 0.55 * T.a, torsoBot - 0.3 * HH], [tcx + s * 0.75 * T.a, torsoBot + 0.05 * HH], [tcx + s * 0.45 * T.a, torsoBot + 0.02 * HH]], o.sash, 1.6 * u); }
    p.inkRing(tp, ow, thick);
  }
  // marching pole over the right shoulder, in front of the torso (behind the head) so the whole pole reads
  if (Array.isArray(prop) && prop[0] === "furca") drawFurca(p, [tcx + 0.15 * T.a, chin + 0.42 * HH], [300 + 200 * (u / 2.36), chin - 0.3 * HH], u * 1.5, prop[1]);
  if (o.shield && mode !== "sit" && mode !== "fall") drawScutum(p, tcx - 0.62 * T.a, chin + 0.02 * HH, torsoBot + 0.5 * HH, 0.74 * W, light, u);
  // in front of the body: hands holding props
  for (const a of arms) if (a.front) {
    drawArm(a);
    const [hx, hy] = a.pts[2];
    if (prop === "icecream") {
      p.poly([[hx - 8 * u, hy - 12 * u], [hx + 8 * u, hy - 12 * u], [hx, hy + 7 * u]], "#e0a35a", 1.8 * u);
      p.ell(hx, hy - 19 * u, 11 * u, 10 * u, "#f7c6d9", 2.2 * u);
      p.dot(hx, hy, 5.5 * u);
    } else if (prop === "gladius") {
      p.poly([[hx - 3.5 * u, hy - 6 * u], [hx + 3.5 * u, hy - 6 * u], [hx + 4 * u, hy - 58 * u], [hx, hy - 66 * u], [hx - 4 * u, hy - 58 * u]], "#d9dde2", 2 * u);
      p.poly([[hx - 12 * u, hy - 9 * u], [hx + 12 * u, hy - 9 * u], [hx + 12 * u, hy - 4 * u], [hx - 12 * u, hy - 4 * u]], "#c99a48", 1.6 * u);
      p.dot(hx, hy, 5.5 * u); p.ell(hx, hy + 8 * u, 4.5 * u, 4.5 * u, "#c99a48", 1.5 * u);
    } else if (prop === "torch") {
      p.band([[hx, hy + 16 * u], [hx + 2 * u, hy - 30 * u]], "#7a4b2a", 5 * u, 1.5 * u, "round");
      p.poly([[hx - 9 * u, hy - 34 * u], [hx + 11 * u, hy - 34 * u], [hx + 9 * u, hy - 28 * u], [hx - 7 * u, hy - 28 * u]], "#5a3b2a", 1.8 * u); // pitch wrap
      p.poly([[hx - 16 * u, hy - 34 * u], [hx + 20 * u, hy - 34 * u], [hx + 22 * u, hy - 60 * u], [hx + 10 * u, hy - 76 * u], [hx + 8 * u, hy - 100 * u],
        [hx - 6 * u, hy - 74 * u], [hx - 14 * u, hy - 84 * u], [hx - 20 * u, hy - 58 * u]], "#f3842c", 2.4 * u);
      p.poly([[hx - 8 * u, hy - 36 * u], [hx + 12 * u, hy - 36 * u], [hx + 10 * u, hy - 56 * u], [hx + 4 * u, hy - 74 * u], [hx - 6 * u, hy - 56 * u]], "#ffd85a", 0);
      p.dot(hx, hy, 5.5 * u);
    } else if (prop === "scroll") {
      p.poly([[hx - 16 * u, hy - 8 * u], [hx + 16 * u, hy - 12 * u], [hx + 17 * u, hy - 2 * u], [hx - 15 * u, hy + 2 * u]], "#f1e6c8", 1.8 * u);
      p.ell(hx - 16 * u, hy - 3 * u, 3 * u, 5.5 * u, "#c9b88a", 1.6 * u); p.ell(hx + 17 * u, hy - 7 * u, 3 * u, 5.5 * u, "#c9b88a", 1.6 * u);
      p.dot(hx, hy, 5.5 * u);
    } else if (Array.isArray(prop) && prop[0] === "dig") {
      // drawn once after the loop (two hands share one shovel)
    } else if (prop === "pizza") {
      // drawn once after the loop
    } else if (prop === "arms") {
      // crossed arms: nothing held
    } else if (Array.isArray(prop) && prop[0] === "hammer") {
      const ang = rad(-70 + 105 * clamp(prop[1], 0, 1));
      const Rh = (pts: P2[]) => rotPts(pts, ang, hx, hy);
      p.band(Rh([[hx, hy + 12 * u], [hx, hy - 44 * u]]), "#8a5a34", 5 * u, 1.5 * u, "round");
      p.poly(Rh([[hx - 12 * u, hy - 58 * u], [hx + 20 * u, hy - 58 * u], [hx + 20 * u, hy - 42 * u], [hx - 12 * u, hy - 42 * u]]), "#7d848c", 2.2 * u);
      p.dot(hx, hy, 5.5 * u);
    }
  }
  if (Array.isArray(prop) && prop[0] === "dig") {
    const k = clamp(prop[1], 0, 1), top: P2 = [300 + 34 * u, chin + 0.42 * HH - k * 0.22 * HH], bot: P2 = [300 - 46 * u, sole - 6 * u - k * 0.5 * HH];
    p.band([top, bot], "#8a5a34", 4.6 * u, 1.4 * u, "round");
    const ang = Math.atan2(bot[1] - top[1], bot[0] - top[0]) - Math.PI / 2;
    const B = (pts: P2[]) => rotPts(pts, ang, bot[0], bot[1]);
    p.poly(B([[bot[0] - 13 * u, bot[1] - 6 * u], [bot[0] + 13 * u, bot[1] - 6 * u], [bot[0] + 11 * u, bot[1] + 22 * u], [bot[0] - 11 * u, bot[1] + 22 * u]]), "#9aa0a8", 2 * u);
    if (k > 0.45) p.ell(bot[0], bot[1] + 2 * u, 15 * u, 9 * u, "#7a5a3a", 2 * u);
    for (const a of arms) p.dot(a.pts[2][0], a.pts[2][1], 5.5 * u);
  }
  if (prop === "pizza") {
    const bx = tcx, by = chin + 0.38 * HH, bw = 0.6 * W, bh = 0.07 * HH;
    p.poly([[bx - bw, by - bh], [bx + bw, by - bh], [bx + bw * 0.9, by - bh * 2.6], [bx - bw * 0.9, by - bh * 2.6]], "#e6c48a", 2 * u);
    p.poly([[bx - bw, by - bh], [bx + bw, by - bh], [bx + bw, by + bh], [bx - bw, by + bh]], "#d4ad6e", 2 * u);
    p.ell(bx, by - bh * 1.8, 0.25 * bw, 0.5 * bh, "#c0442f", 0);
    for (const a of arms) p.dot(a.pts[2][0], a.pts[2][1], 5.5 * u);
  }
  if (prop === "coins") {
    const [hx, hy] = arms[arms.length - 1].pts[2];
    p.ell(hx, hy + 16 * u, 13 * u, 14 * u, "#8a5a34", 2 * u); p.stroke([[hx - 6 * u, hy + 3 * u], [hx + 6 * u, hy + 3 * u]], 2.5 * u, "#e8c45a");
    p.dot(hx, hy, 5.5 * u);
  }
  if (prop === "sack") {
    const sx = tcx + 0.72 * T.a, sy = chin - 0.12 * HH;
    p.poly(blobPts(sx, sy, { a: 0.4 * W, b: 0.27 * HH, nTop: 2.2, nBot: 2.4, egg: 0.1, asym: 0, rot: rad(-12), noise: 0.02, seed: seed + 31 }), "#d9c08a", 2.4 * u);
    p.stroke([[sx - 0.36 * W, sy - 0.06 * HH], [sx - 0.46 * W, sy - 0.12 * HH]], 3 * u); p.stroke([[sx - 0.05 * W, sy - 0.1 * HH], [sx + 0.08 * W, sy + 0.08 * HH]], 1.6 * u, "#a8905a");
  }
  if (prop === "shako") { // carried by the left hand
    const [hx, hy] = arms[0].pts[2];
    p.poly([[hx - 14 * u, hy + 3 * u], [hx + 14 * u, hy + 3 * u], [hx + 16 * u, hy + 30 * u], [hx - 16 * u, hy + 30 * u]], "#3a3d47", 2.2 * u);
    p.ell(hx, hy + 31 * u, 3.5 * u, 3.5 * u, "#2b7a4b", 1.5 * u);
    p.dot(hx, hy, 5.5 * u);
  }
  // ---- head: rotates with the body, plus its own tilt about the chin ----
  const Ah = A + headTilt, [cpx, cpy] = rotAbout([300, chin], rad(A), [300, hipY]);
  p.rot = Ah ? [rad(Ah), 300, chin, cpx - 300, cpy - chin] : null;
  hatBehind(p, o, H, 300, hc, light, thick, ow, false);
  const hp = blobPts(300, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  hatOn(p, o, hp, H, 300, hc, light, seed, facing, false);
  if (o.beard) {
    const fx = 300 + 5 * u * facing;
    p.poly([[fx - 0.42 * W, hc + 0.06 * HH], [fx - 0.44 * W, hc + 0.26 * HH], [fx - 0.22 * W, hc + 0.54 * HH], [fx, hc + 0.64 * HH], [fx + 0.22 * W, hc + 0.54 * HH],
      [fx + 0.44 * W, hc + 0.26 * HH], [fx + 0.42 * W, hc + 0.06 * HH], [fx + 0.24 * W, hc + 0.3 * HH], [fx, hc + 0.34 * HH], [fx - 0.24 * W, hc + 0.3 * HH]], o.beard, 3 * u);
  }
  const brim = !!o.hat && o.hat !== "hair" && o.hat !== "bonnet" && o.hat !== "cap";
  faceFront(p, 300, hc, W, expr, facing, look, lid, brim, skin, o.moustache, o.build === "stout");
  p.rot = null;
};

export type SideOpts = {
  phase?: number; expr?: Expr; mode?: "march" | "stand" | "swing" | "push"; blink?: boolean | number; stomp?: number; pose?: number;
  /** step length as a multiple of 0.8 m (370 units): matches 1.6 m/s at 2 steps/s; scale by the view's foreshortening */
  stride?: number; light?: number; seed?: number;
  /** push mode: where the hands land at pose 1, in final canvas units (e.g. the swing kid's back) */
  hand?: [number, number];
  /** Roman side props + a running lean */
  prop?: Prop; run?: boolean;
};

/** two-bone leg, knee bending forward (+x) */
const ik = (hip: P2, ank: P2, l1: number, l2: number): P2 => {
  const dx = ank[0] - hip[0], dy = ank[1] - hip[1], d = clamp(Math.hypot(dx, dy), 1, l1 + l2 - 0.01);
  const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), k = Math.atan2(dy, dx) - A;
  return [hip[0] + l1 * Math.cos(k), hip[1] + l1 * Math.sin(k)];
};

/** hip height of the seated kid in `swing` mode (design units); swingKid seats the torso bottom on the plank */
const SWING_HIP = 733;

/** side view facing screen-right; march footfalls land at phase 0 (near foot) and 0.5 (far foot), like the front view.
 *  The stance foot is planted: it slides back at exactly the walking speed while the hip rises and falls over it. */
export const bodySide = (p: Pen, o: Outfit, opts: SideOpts) => {
  const { phase = 0, expr = "neutral", mode = "march", blink = false, stomp = 1, pose = 0, stride = 1, light = DEF_LIGHT, seed = 1 } = opts;
  const Bd = BUILD[o.build ?? "adult"], skin = o.skin ?? SKIN, two = Math.PI * 2, lid = lidOf(blink);
  const H: Blob = { ...headBlob(seed, Bd.a, 1), asym: 0.12, rot: rad(3 + 3 * (rnd(seed, 7) - 0.5)) };
  const W = 2 * H.a, HH = 2 * H.b, u = W / 100, sole = 975, ankY = sole - 4 * u;
  const thick = thickAngle(light), ow = 5 * u;
  const legLen = (Bd.legs + 0.12) * HH - 4 * u, l1 = legLen / 2, l2 = legLen / 2;
  const nearCol = o.legs ?? mix(o.pants, INK, 0.55), farCol = o.legs ? shade(o.legs, 0.8) : mix(o.pants, INK, 0.75), footCol = o.boots;
  type LegS = { ank: P2; pitch: number; near: boolean };
  const legs: LegS[] = [];
  let hipY = ankY - legLen * 0.995, lean = 0, nearFwd = 0;
  if (mode === "march") {
    const S = 370 * stride, liftH = Math.max(22, 40 + 70 * (stomp - 1));
    const st = (ph: number) => {
      const c = (((phase + ph) % 1) + 1) % 1;
      if (c < 0.5) { const s = c / 0.5; return { x: S / 2 - S * s, h: 0, stance: true, s }; }
      const s = (c - 0.5) / 0.5; // swing: cycloid in world space, so the foot leaves and lands at zero ground speed
      return { x: -S / 2 + S * s - (S / Math.PI) * Math.sin(2 * Math.PI * s), h: liftH * Math.sin(Math.PI * s), stance: false, s };
    };
    const nL = st(0), fL = st(0.5), stance = nL.stance ? nL : fL;
    const Leff = legLen * (1 - 0.035 * Math.sin(Math.PI * stance.s));
    hipY = ankY - Math.sqrt(Math.max(1, Leff * Leff - stance.x * stance.x));
    for (const [L, near] of [[fL, false], [nL, true]] as const)
      legs.push({ ank: [300 + L.x, ankY - L.h], pitch: L.stance ? 0 : rad(35 * Math.sin(Math.PI * L.s) * (1 - 1.6 * L.s)), near });
    lean = 4 + 3 * Math.cos(2 * two * phase) + (opts.run ? 9 : 0); // 7 deg at contact, 1 deg at passing
    nearFwd = nL.x / (S / 2);
  } else if (mode === "push") {
    hipY = ankY - 0.87 * legLen;
    legs.push({ ank: [300 - 0.5 * legLen, ankY], pitch: rad(-8), near: false }, { ank: [300 + 0.32 * legLen, ankY], pitch: 0, near: true });
    lean = 14 * pose;
  } else if (mode === "swing") {
    hipY = SWING_HIP;
    const a = rad(60 * pose);
    for (const [dx, near] of [[-6, false], [0, true]] as const) {
      const knee: P2 = [300 + l1 * 0.98 + dx * u, hipY + 6 * u];
      legs.push({ ank: [knee[0] + l2 * Math.sin(a), knee[1] + l2 * Math.cos(a)], pitch: -a * 0.5, near });
    }
  } else {
    legs.push({ ank: [300 - 4 * u, ankY], pitch: 0, near: false }, { ank: [300 + 4 * u, ankY], pitch: 0, near: true });
  }
  const torsoBot = hipY + 0.12 * HH, chin = torsoBot - Bd.torso * HH, hc = chin - H.b, crown = hc - H.b, hip: P2 = [300, hipY];
  p.rot = null;
  for (const L of legs) {
    const knee = mode === "swing" ? ([300 + l1 * 0.98 + (L.near ? 0 : -6 * u), hipY + 6 * u] as P2) : ik(hip, L.ank, l1, l2);
    const hp0: P2 = [300 + (L.near ? 0 : -5 * u), hipY];
    p.stroke([hp0, knee, L.ank], 8.6 * u, L.near ? nearCol : farCol);
    const c = Math.cos(L.pitch), s = Math.sin(L.pitch);
    footStroke(p, [L.ank[0] - 3 * u * c, L.ank[1] - 3 * u * s], [L.ank[0] + 13 * u * c, L.ank[1] + 13 * u * s + 0.5 * u],
      9 * u, L.near ? footCol : footCol === INK ? INK : shade(footCol, 0.82));
  }
  // ---- upper body leans about the hip ----
  p.rot = lean ? [rad(lean), 300, hipY] : null;
  const T: Blob = { a: (o.build === "stout" ? 0.36 : 0.31) * W, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.5, egg: 0.1, asym: 0.06,
    rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = 300 + 2 * u, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const armCol = o.dress && o.legs ? o.legs : mix(o.jacket, INK, 0.5), farArm = o.dress && o.legs ? shade(o.legs, 0.82) : mix(o.jacket, INK, 0.68);
  const S: P2 = [tcx + 0.05 * T.a, chin + 0.14 * HH], aLen = 0.95 * HH;
  const swingArm = (ang: number): [P2, P2, P2] => {
    const e: P2 = [S[0] + Math.sin(ang) * aLen * 0.5, S[1] + Math.cos(ang) * aLen * 0.5], a2 = ang + rad(16) * Math.sign(ang || 1);
    return [S, e, [e[0] + Math.sin(a2) * aLen * 0.5, e[1] + Math.cos(a2) * aLen * 0.5]];
  };
  const sp = opts.prop ?? null;
  const rifle = (!!o.rifle || sp === "shovel") && (mode === "march" || mode === "stand");
  const B0: P2 = [tcx + 0.72 * T.a, chin + 0.58 * HH], B1: P2 = [tcx - 0.95 * T.a - 22 * u, crown - 0.4 * HH];
  let near: [P2, P2, P2], far: [P2, P2, P2] | null;
  if (mode === "swing") { near = [S, [S[0] + 12 * u, S[1] - 0.16 * HH], [300 + 6 * u, chin - 0.3 * HH]]; far = [S, [S[0] + 8 * u, S[1] - 0.18 * HH], [300 + 2 * u, chin - 0.36 * HH]]; }
  else if (mode === "push") {
    const reach = 0.55 * HH + 0.45 * HH * pose;
    let hN: P2 = [S[0] + reach, S[1] + 0.06 * HH];
    if (opts.hand) {
      // target is in final canvas units; the arm is drawn inside the lean rotation, so undo it
      const th = -rad(lean), dx = opts.hand[0] - 300, dy = opts.hand[1] - hipY;
      const tg: P2 = [300 + dx * Math.cos(th) - dy * Math.sin(th), hipY + dx * Math.sin(th) + dy * Math.cos(th)];
      hN = [hN[0] + (tg[0] - hN[0]) * pose, hN[1] + (tg[1] - hN[1]) * pose];
    }
    near = [S, [(S[0] + hN[0]) / 2, (S[1] + hN[1]) / 2 + 0.06 * HH], hN];
    far = [S, [(S[0] + hN[0]) / 2 - 4 * u, (S[1] + hN[1]) / 2 - 0.02 * HH], [hN[0] - 6 * u, hN[1] - 0.08 * HH]];
  } else if (rifle) { near = [S, [S[0] - 4 * u, S[1] + 0.42 * HH], B0]; far = mode === "march" ? swingArm(rad(30) * nearFwd) : swingArm(0); }
  else if (sp === "pizza" || sp === "scroll") { const hN: P2 = [S[0] + 0.5 * HH, chin + 0.42 * HH]; near = [S, [S[0] + 0.18 * HH, S[1] + 0.4 * HH], hN]; far = sp === "pizza" ? [S, [S[0] + 0.14 * HH, S[1] + 0.36 * HH], [hN[0] - 6 * u, hN[1] - 4 * u]] : swingArm(rad(30) * nearFwd); }
  else if (Array.isArray(sp) && sp[0] === "furca" || sp === "sack") { near = [S, [S[0] + 0.32 * HH, S[1] + 0.22 * HH], [tcx + 0.85 * T.a, chin + 0.02 * HH]]; far = mode === "march" ? swingArm(rad(30) * nearFwd) : null; }
  else if (sp === "spear") { near = [S, [S[0] + 0.12 * HH, S[1] + 0.42 * HH], [S[0] + 0.42 * HH, S[1] + 0.3 * HH]]; far = mode === "march" ? swingArm(rad(30) * nearFwd) : null; }
  else { near = swingArm(rad(-30) * nearFwd); far = mode === "march" ? swingArm(rad(30) * nearFwd) : null; }
  if (Array.isArray(sp) && sp[0] === "furca") drawFurca(p, [tcx + 0.8 * T.a, chin + 0.04 * HH], [tcx - 1.25 * T.a - 40 * u, chin - 0.22 * HH], u * 1.35, sp[1]);
  if (o.shield) { const sx = tcx - 0.1 * T.a; p.poly(rrect(sx - 0.2 * W, chin + 0.02 * HH, sx + 0.12 * W, torsoBot + 0.45 * HH, 8 * u), "#a8302a", 3.5 * u); }
  if (far) { p.stroke(curve(far[0], far[1], far[2]), 5.2 * u, farArm); p.dot(far[2][0], far[2][1], 5.5 * u); }
  if (o.skirt && !o.dress) {
    const y0 = torsoBot - 0.3 * HH, y1 = torsoBot + 0.42 * HH, sk: P2[] = [[tcx - 0.9 * T.a, y0], [tcx + 0.9 * T.a, y0], [tcx + 1.1 * T.a, y1], [tcx - 1.05 * T.a, y1]];
    p.gradFill(sk, o.skirt, mul(o.skirt, SH_CLOTH), light);
    if (o.lorica) for (let i = -2; i <= 2; i++) p.band([[tcx + i * 0.32 * T.a, y0 + 0.12 * HH], [tcx + i * 0.38 * T.a, y1 - 2 * u]], "#7a4f33", 4 * u, 1.2 * u);
    p.poly(sk, null, 4 * u);
  }
  p.gradFill(tp, o.jacket, mul(o.jacket, SH_CLOTH), light);
  p.clip(tp, () => {
    if (o.belt) p.band([[tcx - 0.65 * T.a, chin - 0.05 * HH], [tcx + 0.75 * T.a, torsoBot - 0.1 * HH]], o.belt!, 5.5 * u, 1.8 * u);
    if (o.plaid) for (let i = -2; i <= 2; i++) {
      p.stroke([[tcx + (i + 0.5) * 0.6 * T.a, chin - 0.3 * HH], [tcx + (i + 0.5) * 0.6 * T.a, torsoBot + 0.1 * HH]], 3 * u, o.plaid);
      p.stroke([[tcx - 1.4 * T.a, chin + (i + 2.6) * 0.26 * HH], [tcx + 1.4 * T.a, chin + (i + 2.6) * 0.26 * HH]], 3 * u, o.plaid);
    }
    if (o.sash) p.band([[tcx - 1.3 * T.a, torsoBot - 0.32 * HH], [tcx + 1.3 * T.a, torsoBot - 0.32 * HH]], o.sash, 0.13 * HH, 1.8 * u);
    if (o.lorica) for (let i = 0; i < 5; i++) {
      const y0 = chin - 0.12 * HH + i * 0.15 * HH, c = i % 2 ? "#a9aeb6" : "#c3c7cd";
      p.poly([[tcx - 1.4 * T.a, y0], [tcx + 1.4 * T.a, y0], [tcx + 1.4 * T.a, y0 + 0.15 * HH], [tcx - 1.4 * T.a, y0 + 0.15 * HH]], c, 1.4 * u);
    }
    if (!o.dress && o.buttons) for (let i = 0; i < 3; i++) { const y = chin + 0.16 * HH + i * 0.24 * HH; p.dot(tcx + 0.8 * T.a, y, 3 * u, INK); p.dot(tcx + 0.8 * T.a, y, 2.2 * u, o.buttons ?? shade(o.jacket, 0.7)); }
  });
  p.inkRing(tp, ow, thick);
  if (o.dress) {
    // long tunic / toga: a bell from the shoulders to just above the ankles, legs swing out beneath
    const D: Blob = { a: 0.36 * W, b: 0.5 * ((sole - 0.32 * HH) - (chin - 0.2 * HH)), nTop: 2.0, nBot: 3.0, egg: 0.3, asym: 0.05, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(tcx, sole - 0.32 * HH - D.b, D);
    p.gradFill(dp, o.dress, mul(o.dress, SH_CLOTH), light);
    p.clip(dp, () => {
      for (const k of [-0.12, 0.14]) p.stroke(curve([tcx + k * W, chin + 0.4 * HH], [tcx + (k + 0.05) * W, chin + 0.9 * HH], [tcx + k * W, sole - 0.45 * HH], 8), 1.8 * u, mul(o.dress!, [0.72, 0.72, 0.78]));
      if (o.sash) p.band(curve([tcx - 0.3 * W, chin + 0.02 * HH], [tcx + 0.05 * W, chin + 0.6 * HH], [tcx + 0.4 * W, chin + 1.2 * HH], 12), o.sash, 0.11 * HH, 1.6 * u);
    });
    p.inkRing(dp, ow, thick);
  }
  if (rifle && sp !== "shovel") {
    p.band([B0, B1], "#7a4b2a", 5 * u, 1.5 * u, "round");
    p.band([lerp2(B0, B1, 0.6), B1], "#8d949c", 2.4 * u, 1.2 * u, "round");
  }
  if (sp === "shovel") {
    p.band([B0, B1], "#8a5a34", 4.6 * u, 1.4 * u, "round");
    const ang = Math.atan2(B1[1] - B0[1], B1[0] - B0[0]) + Math.PI / 2, Rb = (pts: P2[]) => rotPts(pts, ang, B1[0], B1[1]);
    p.poly(Rb([[B1[0] - 12 * u, B1[1]], [B1[0] + 12 * u, B1[1]], [B1[0] + 10 * u, B1[1] - 30 * u], [B1[0] - 10 * u, B1[1] - 30 * u]]), "#9aa0a8", 2 * u);
  }
  if (sp === "spear") {
    const a: P2 = [S[0] + 0.3 * HH, sole - 0.15 * HH], b: P2 = [S[0] + 0.55 * HH, crown - 0.6 * HH];
    p.band([a, b], "#8a5a34", 4.2 * u, 1.4 * u, "round");
    p.poly([[b[0], b[1] - 30 * u], [b[0] + 7 * u, b[1] - 10 * u], [b[0], b[1] + 4 * u], [b[0] - 7 * u, b[1] - 10 * u]], "#c3c7cd", 2 * u);
  }
  if (sp === "sack") p.poly(blobPts(tcx - 0.2 * T.a, chin - 0.12 * HH, { a: 0.38 * W, b: 0.26 * HH, nTop: 2.2, nBot: 2.4, egg: 0.1, asym: 0, rot: rad(10), noise: 0.02, seed: seed + 31 }), "#d9c08a", 2.4 * u);
  p.stroke(curve(near[0], near[1], near[2]), 5.2 * u, armCol); p.dot(near[2][0], near[2][1], 5.5 * u);
  if (sp === "pizza") {
    const [hx, hy] = near[2];
    p.poly([[hx - 0.32 * HH, hy - 0.06 * HH], [hx + 0.1 * HH, hy - 0.06 * HH], [hx + 0.1 * HH, hy + 0.02 * HH], [hx - 0.32 * HH, hy + 0.02 * HH]], "#d4ad6e", 2 * u);
    p.dot(hx, hy, 5.5 * u);
  }
  if (sp === "scroll") {
    const [hx, hy] = near[2];
    p.poly([[hx - 6 * u, hy - 24 * u], [hx + 6 * u, hy - 24 * u], [hx + 6 * u, hy + 24 * u], [hx - 6 * u, hy + 24 * u]], "#f1e6c8", 1.8 * u);
    p.ell(hx, hy - 24 * u, 8 * u, 3.5 * u, "#c9b88a", 1.6 * u); p.ell(hx, hy + 24 * u, 8 * u, 3.5 * u, "#c9b88a", 1.6 * u); p.dot(hx, hy, 5.5 * u);
  }
  if (sp === "coins") {
    const [hx, hy] = near[2];
    p.ell(hx, hy + 18 * u, 14 * u, 15 * u, "#8a5a34", 2 * u); p.stroke([[hx - 7 * u, hy + 4 * u], [hx + 7 * u, hy + 4 * u]], 2.5 * u, "#e8c45a");
    p.dot(hx + 9 * u, hy + 9 * u, 3 * u, "#e8c45a"); p.dot(hx, hy, 5.5 * u);
  }
  // ---- head ----
  const hx = 300 + 4 * u;
  hatBehind(p, o, H, hx, hc, light, thick, ow, true);
  const hp = blobPts(hx, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  hatOn(p, o, hp, H, hx, hc, light, seed, 1, true);
  if (o.beard) p.poly([[hx - 0.02 * W, hc + 0.18 * HH], [hx + 0.16 * W, hc + 0.27 * HH], [hx + 0.44 * W, hc + 0.26 * HH], [hx + 0.38 * W, hc + 0.5 * HH], [hx + 0.14 * W, hc + 0.58 * HH], [hx - 0.08 * W, hc + 0.4 * HH]], o.beard, 3 * u);
  const brim = !!o.hat && o.hat !== "hair" && o.hat !== "bonnet" && o.hat !== "cap";
  faceSide(p, hx, hc, W, expr, lid, brim, skin, o.moustache, o.build === "stout");
  p.rot = null;
};

/** rope + seat + seated kid on a 700 x 2300 canvas; the pivot is design (350, 20); kid drawn at 0.92 scale */
export const swingKid = (p: Pen, o: Outfit, kick: number, expr: Expr, light = DEF_LIGHT, blink: number = 0) => {
  const rope = 1830, k = 1.1, HH = 2 * headBlob(5, BUILD[o.build ?? "adult"].a, 1).b;
  // two ropes from the pivot to the ends of a wide plank, the kid framed between them: a single rope behind the kid
  // ended at the cap and read as a hanging. Far rope behind the kid, near rope drawn over (clear of the face).
  const seat = rope + 18, x0 = 150, x1 = 550;
  p.line([[350, 20], [x0 + 16, seat + 4]], "#a07a4c", 10);
  p.poly(rrect(x0, seat, x1, seat + 36, 10), "#b5653f", 9);
  const g = p.g;
  g.save();
  g.translate(350 - 300 * k, rope + 18 - (SWING_HIP + 0.12 * HH) * k);
  g.scale(k, k);
  bodySide(new Pen(g), o, { expr, mode: "swing", pose: kick, light, seed: 5, blink });
  g.restore();
  p.line([[350, 20], [x1 - 16, seat + 4]], "#a07a4c", 10);
};

// ---------------- effects ----------------
export const fxNote = (p: Pen, kind: number, col = "#1f2a44") => {
  p.ell(70, 200, 46, 34, col, 8, 0, 360, -20);
  p.stroke([[110, 190], [110, 40]], 14);
  if (kind === 0) p.poly([[110, 40], [170, 70], [170, 110], [110, 82]], col, 8);
  else {
    p.ell(150, 170, 40, 30, col, 8, 0, 360, -20);
    p.stroke([[186, 160], [186, 20]], 14);
    p.poly([[110, 40], [186, 20], [186, 50], [110, 70]], col, 8);
  }
};

/** spark / impact star on a 500 x 500 canvas; t in 0..1 */
export const fxBurst = (p: Pen, t: number, col = "#fff3b0", rays = 10, r0 = 40, r1 = 230) => {
  const c = 250, e = 1 - (1 - t) ** 3;
  for (let i = 0; i < rays; i++) {
    const a = rad((i * 360) / rays + 7 * (i % 2)), ra = r0 + (r1 - r0) * e * (0.75 + 0.25 * (i % 2));
    p.poly([[c + r0 * 0.5 * Math.cos(a + 0.18), c + r0 * 0.5 * Math.sin(a + 0.18)], [c + ra * Math.cos(a), c + ra * Math.sin(a)],
      [c + r0 * 0.5 * Math.cos(a - 0.18), c + r0 * 0.5 * Math.sin(a - 0.18)]], col, Math.max(3, 8 * (1 - t)));
  }
  if (t < 0.5) p.ell(c, c, r0 * (1.4 - t), r0 * (1.4 - t), WHITE, 8);
};

/** water splash crown on an 800 x 800 canvas; t in 0..1 */
export const fxSplash = (p: Pen, t: number) => {
  const c = 400, size = 800, rise = Math.sin(Math.min(1, t * 1.3) * Math.PI);
  const blue = "#bfe8ff", deep = "#6cc0f0";
  if (rise > 0.02) {
    const pts: P2[] = [];
    for (let i = 0; i < 19; i++) {
      const h = (i % 2 ? 260 : 130) * rise * (0.7 + 0.3 * Math.sin(i * 1.7));
      pts.push([c - 330 + (660 * i) / 18, size - 120 - h]);
    }
    p.poly([...pts, [c + 330, size - 90], [c - 330, size - 90]], blue, 10);
    p.ell(c, size - 100, 360, 46, deep, 10);
  }
  for (let i = 0; i < 8; i++) {
    const a = rad(200 + i * 18), d = 120 + 380 * t, y = size - 160 + d * Math.sin(a) + 520 * t * t, r = 26 * (1 - t) + 6;
    if (t > 0.08 && y < size - 40) p.ell(c + d * Math.cos(a), y, r, r * 1.25, blue, 7);
  }
};

/** dust puff on a 300 x 300 canvas; t in 0..1 */
export const fxPuff = (p: Pen, t: number) => {
  for (let i = 0; i < 5; i++) {
    const a = rad(160 + i * 55), d = 40 + 70 * t, r = (34 + 20 * (i % 2)) * (1 - 0.6 * t);
    p.ell(150 + d * Math.cos(a), 180 + d * 0.45 * Math.sin(a), r, r * 0.8, `rgba(238,225,205,${(1 - t).toFixed(3)})`, 0);
  }
};

/** circling stars on a 420 x 210 canvas */
export const fxStars = (p: Pen, t: number) => {
  for (let i = 0; i < 4; i++) {
    const a = t * Math.PI * 2 + (i * Math.PI) / 2, x = 210 + 150 * Math.cos(a), y = 110 + 40 * Math.sin(a), pts: P2[] = [];
    for (let k = 0; k < 10; k++) { const r = k % 2 ? 14 : 34, b = rad(k * 36 - 90); pts.push([x + r * Math.cos(b), y + r * Math.sin(b)]); }
    p.poly(pts, "#ffd84a", 6);
  }
};

/** three jittering strain ticks on a 300 x 300 canvas */
export const fxCreak = (p: Pen, t: number) => {
  const j = 6 * Math.sin(t * 40);
  for (const a of [-30, 0, 30]) {
    const b = rad(a - 90);
    p.stroke([[150 + 70 * Math.cos(b) + j, 230 + 70 * Math.sin(b)], [150 + 100 * Math.cos(b) + 10 + j, 230 + 100 * Math.sin(b)],
      [150 + 130 * Math.cos(b) + j, 230 + 130 * Math.sin(b)]], 10);
  }
};

/** flat water ring (drawn top-down) on a 600 x 600 canvas; t in 0..1 */
export const fxRing = (p: Pen, t: number) => {
  // thin light water rings (white crest, pale blue trailing rings), thinning as they spread
  const g = p.g;
  for (let k = 0; k < 3; k++) {
    const u = t - k * 0.22;
    if (u <= 0 || u >= 1) continue;
    g.beginPath(); g.ellipse(300, 300, 60 + 230 * u, 60 + 230 * u, 0, 0, Math.PI * 2);
    g.strokeStyle = k === 0 ? "#f6fcff" : "#cfe8fa"; g.lineWidth = 9 * (1 - u) + 3; g.stroke();
  }
};

/** text-free sign on a 700 x 520 canvas: "no marching in step on the bridge". A bridge (deck + arch + piers), four
 *  identical pairs of marching legs in the same stride (in step), a bold red X over all of it. */
export const fxSign = (p: Pen) => {
  const g = p.g, RED = "#d42f2f";
  p.poly(rrect(14, 14, 686, 506, 40), "#f6ecd2", 0);
  p.poly(rrect(14, 14, 686, 506, 40), null, 14);
  // bridge: deck, stone arch underneath, two piers
  p.poly(rrect(70, 352, 630, 384, 8), "#8a5a3a", 9);
  g.beginPath(); g.moveTo(112, 470); g.quadraticCurveTo(350, 300, 588, 470);
  g.strokeStyle = INK; g.lineWidth = 16; g.lineCap = "round"; g.stroke();
  for (const x of [88, 612]) p.poly(rrect(x - 16, 384, x + 16, 470, 4), "#8a5a3a", 9);
  // four identical soldiers' legs mid-stride: same leg forward on every one = in step
  for (const x of [150, 278, 406, 534]) {
    p.poly(rrect(x - 30, 150, x + 30, 214, 14), "#357650", 9);                  // coat hem
    p.stroke([[x - 8, 210], [x + 34, 262], [x + 46, 338]], 15, INK);           // front leg
    p.stroke([[x + 6, 210], [x - 12, 274], [x - 36, 336]], 15, INK);           // back leg
    p.poly(rrect(x + 30, 330, x + 74, 350, 9), INK, 0);                          // boots point forward
    p.poly(rrect(x - 52, 328, x - 8, 348, 9), INK, 0);
  }
  // big red X
  for (const [a, b] of [[[96, 70], [604, 452]], [[604, 70], [96, 452]]] as [[number, number], [number, number]][]) {
    p.stroke([a, b], 58, "#ffffff");
    p.stroke([a, b], 42, RED);
  }
};

/** soft cartoon cloud on a 600 x 300 canvas */
export const fxCloud = (p: Pen, seed: number) => {
  const blobs: [number, number, number][] = [[150, 190, 80], [250, 150, 105], [360, 160, 95], [450, 195, 70], [300, 210, 90]];
  for (const [x, y, r] of blobs) p.ell(x + ((seed * 37) % 20) - 10, y, r, r * 0.8, "#ffffff", 0);
  p.ell(300, 235, 230, 40, "#ffffff", 0);
};

/** cast shadow on a 128 x 256 canvas: dark soft contact pool at the feet (y 205) and a softer tail that runs up the
 *  canvas = away from the sun, fading with distance; multiply colour (sRGB-encoded linear ratio), white = no change */
export const fxShadow = (p: Pen, col: string) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 256);
  g.save(); g.filter = "blur(9px)";
  const lg = g.createLinearGradient(0, 205, 0, 22);
  lg.addColorStop(0, mix(col, WHITE, 0.08)); lg.addColorStop(0.55, mix(col, WHITE, 0.3)); lg.addColorStop(1, mix(col, WHITE, 0.85));
  g.fillStyle = lg;
  g.beginPath(); g.moveTo(40, 205); g.bezierCurveTo(36, 120, 46, 50, 64, 30); g.bezierCurveTo(82, 50, 92, 120, 88, 205); g.closePath(); g.fill();
  g.fillStyle = col; g.beginPath(); g.ellipse(64, 205, 30, 17, 0, 0, Math.PI * 2); g.fill();
  g.restore();
};

/** tight contact shadow right under the feet on a 128 x 128 canvas: dark core, short fall-off (multiply colour) */
export const fxContact = (p: Pen, col: string) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 128);
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [r, k] of [[0, 0], [0.32, 0.02], [0.5, 0.22], [0.66, 0.58], [0.82, 0.88], [1, 1]] as const) gr.addColorStop(r, mix(col, WHITE, k));
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
};

/** floating wooden plank, side-on, on a 320 x 110 canvas */
export const fxPlank = (p: Pen) => {
  p.poly(rrect(14, 30, 306, 78, 10), "#a8744a", 9);
  p.line([[40, 46], [150, 44], [270, 50]], "#7d5234", 4);
  p.line([[60, 62], [200, 64], [284, 60]], "#7d5234", 4);
  p.dot(36, 54, 5, INK); p.dot(284, 54, 5, INK);
};

/** floating marching drum (no text) on a 260 x 240 canvas: white shell, red hoops, ink zig-zag cord */
export const fxDrum = (p: Pen) => {
  p.poly(rrect(40, 70, 220, 190, 16), "#f1ece0", 9);
  p.poly(rrect(32, 58, 228, 86, 12), "#c9373a", 8);
  p.poly(rrect(32, 176, 228, 204, 12), "#c9373a", 8);
  p.line([[52, 88], [82, 172], [112, 88], [142, 172], [172, 88], [202, 172]], INK, 6);
  p.ell(130, 58, 98, 18, "#f7f3ea", 8);
};

/** soft ground contact blob on a 128 x 128 canvas, multiply colour (sRGB-encoded linear ratio) in the centre */
export const fxBlob = (p: Pen, col: string) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 128);
  // soft contact shadow: flat core, then a long smooth (roughly gaussian) fall-off to white = no change
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [r, k] of [[0, 0], [0.5, 0.04], [0.64, 0.18], [0.76, 0.42], [0.87, 0.72], [0.95, 0.92], [1, 1]] as const) gr.addColorStop(r, mix(col, WHITE, k));
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
};

// ---------------- Roman extras: the mule and effect cards ----------------
/** side view mule (facing screen-right) drawn at 0.62 scale in the 600 x 1000 body canvas (place it at scale 1/0.62).
 *  expr "lid" = offended half-lidded stare. */
export const MULE_K = 0.62;
export const muleSide = (p: Pen, phase: number, offended: boolean, blink = 0, light = DEF_LIGHT) => {
  const g = p.g;
  g.save(); g.translate(300 * (1 - MULE_K), 975 * (1 - MULE_K)); g.scale(MULE_K, MULE_K);
  const q = new Pen(g), coat = "#8d7b69", dark = "#5e5045", belly = "#cdbba6", two = Math.PI * 2, sole = 975;
  // legs (4), walking
  const legs: [number, number, boolean][] = [[170, 0, false], [420, 0.5, false], [200, 0.5, true], [450, 0, true]];
  for (const [x, ph, near] of legs) {
    const s = Math.sin(two * (phase + ph)), lift = Math.max(0, s) * 40, swing = 30 * Math.cos(two * (phase + ph));
    const col = near ? coat : shade(coat, 0.78);
    q.stroke([[x, 610], [x + swing * 0.5, 800 - lift * 0.5], [x + swing, sole - 22 - lift]], 46, INK);
    q.stroke([[x, 610], [x + swing * 0.5, 800 - lift * 0.5], [x + swing, sole - 22 - lift]], 32, col);
    q.poly([[x + swing - 20, sole - 30 - lift], [x + swing + 20, sole - 30 - lift], [x + swing + 24, sole - lift], [x + swing - 22, sole - lift]], "#2e2622", 7);
  }
  // tail
  q.stroke([[110, 560], [70, 650], [80, 720]], 10, dark);
  q.ell(80, 735, 14, 22, "#3a302a", 4);
  // body + pack saddle
  const body = blobPts(300, 590, { a: 215, b: 105, nTop: 2.2, nBot: 2.4, egg: 0, asym: 0.04, rot: 0, noise: 0.01, seed: 4 });
  q.gradFill(body, coat, mul(coat, SH_CLOTH), light);
  q.clip(body, () => q.ell(300, 690, 200, 50, belly, 0));
  q.inkRing(body, 12, thickAngle(light));
  q.poly([[210, 500], [380, 500], [395, 620], [200, 620]], "#9a6a3a", 9);
  q.ell(250, 470, 55, 38, "#c9a46a", 9); q.ell(345, 478, 48, 34, "#b58a52", 9);
  // neck + head
  q.poly([[430, 540], [520, 380], [585, 410], [520, 600]], coat, 0);
  const head = blobPts(570, 380, { a: 78, b: 52, nTop: 2.2, nBot: 2.2, egg: 0.25, asym: 0.15, rot: rad(28), noise: 0.01, seed: 9 });
  q.shadedFill(head, coat, mul(coat, SH_CLOTH), light, 78);
  q.inkRing(head, 11, thickAngle(light));
  q.stroke([[430, 540], [520, 380]], 11); q.stroke([[520, 600], [585, 440]], 11);
  q.line([[440, 520], [470, 470], [500, 420], [528, 372]], dark, 22); // short upright mane
  q.ell(625, 420, 34, 26, belly, 9, 0, 360, 28); // muzzle
  q.dot(640, 412, 5);
  for (const [x, a] of [[540, -18], [565, 4]] as const) q.ell(x, 285, 18, 60, coat, 9, 0, 360, a); // long ears
  q.ell(560, 292, 7, 38, "#d9b8a6", 0, 0, 360, 4);
  // eye: offended = half lid + flat brow, else a dot
  const ex = 582, ey = 360;
  if (blink >= 1) q.stroke([[ex - 14, ey], [ex + 14, ey]], 7);
  else if (offended) { q.ell(ex, ey + 2, 13, 10, INK, 0, 0, 180); q.stroke([[ex - 16, ey], [ex + 16, ey - 2]], 7); q.stroke([[ex - 18, ey - 26], [ex + 16, ey - 18]], 8); }
  else q.ell(ex, ey, 8, 10, INK, 0);
  q.arc(632, 450, 18, 8, 200, 330, 6); // flat unimpressed mouth
  g.restore();
};
/** torch / campfire flame, t = flicker phase 0..1 (300 x 400 canvas) */
export const fxFlame = (p: Pen, t: number) => {
  const w = 1 + 0.12 * Math.sin(t * 6.28 * 2), h = 1 + 0.15 * Math.sin(t * 6.28 * 3 + 1);
  p.poly([[150 - 90 * w, 380], [150 + 90 * w, 380], [150 + 70 * w, 250], [175, 120 - 40 * h], [130, 200], [110, 90 - 30 * h], [80, 250]], "#f08a24", 10);
  p.poly([[150 - 48 * w, 370], [150 + 48 * w, 370], [160, 230 - 20 * h], [140, 250]], "#ffd85a", 0);
};
/** rising steam squiggles, t 0..1 loop (300 x 400) */
export const fxSteam = (p: Pen, t: number) => {
  for (let k = 0; k < 3; k++) {
    const u = (t + k / 3) % 1, x0 = 80 + k * 70, y0 = 380 - u * 260, a = 1 - u;
    const pts: P2[] = [];
    for (let i = 0; i <= 10; i++) pts.push([x0 + 14 * Math.sin(i * 0.9 + u * 6), y0 - i * 10]);
    p.g.globalAlpha = a; p.stroke(pts, 12, "#ffffff"); p.g.globalAlpha = 1;
  }
};
/** speed lines (400 x 200) */
export const fxSpeed = (p: Pen, t: number) => {
  for (let k = 0; k < 5; k++) { const y = 30 + k * 34, x = ((t * 3 + k * 0.37) % 1) * 160; p.stroke([[x, y], [x + 200, y]], 9, "#ffffff"); }
};
/** sweat drop (120 x 160) */
export const fxSweat = (p: Pen) => p.poly([[60, 10], [95, 90], [60, 150], [25, 90]], "#9fd4ff", 7);
/** pop puff for transformations (500 x 500), t 0..1 */
export const fxPop = (p: Pen, t: number) => {
  const r = 60 + 170 * t, a = 1 - t;
  p.g.globalAlpha = Math.max(0, a);
  for (let k = 0; k < 7; k++) { const an = (k / 7) * Math.PI * 2; p.ell(250 + Math.cos(an) * r * 0.7, 250 + Math.sin(an) * r * 0.7, 55 * (1 - 0.5 * t), 55 * (1 - 0.5 * t), "#ffffff", 8); }
  p.g.globalAlpha = 1;
};
/** dirt clods thrown up (400 x 400), t 0..1 */
export const fxDirt = (p: Pen, t: number) => {
  for (let k = 0; k < 6; k++) {
    const vx = (k - 2.5) * 50, vy = 260 + (k % 3) * 60, x = 200 + vx * t, y = 360 - vy * t + 420 * t * t;
    p.ell(x, y, 16 - k, 13 - k * 0.5, "#7a5a3a", 5);
  }
};
