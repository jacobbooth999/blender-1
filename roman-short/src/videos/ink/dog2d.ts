// Dogs (and the wolf) for the ink explainer look: natural proportions, flat colour, thin wobbly ink outline and a
// few fur strokes (the look's animals are drawn more naturally than its stick people). Side view faces screen
// right (flip for left); face-on view looks into the lens. Drawn in units of the shoulder height (u px).
import { Ink, P, INKC } from "./ink2d";

export type Breed = {
  coat: string; belly: string; dark: string; chest?: string; saddle?: string;
  ear: "prick" | "drop" | "semi"; fur: "smooth" | "feather" | "curly" | "shaggy"; tail: "bushy" | "plume" | "otter" | "curl";
  muzzle: number; puppy?: boolean;
};
export const WOLF2: Breed = { coat: "#9a958f", belly: "#e6e0d6", dark: "#5f5a58", saddle: "#6c6764", ear: "prick", fur: "shaggy", tail: "bushy", muzzle: 1.15 };
export const EARLY2: Breed = { coat: "#c9a066", belly: "#f1e2c4", dark: "#8c6640", ear: "semi", fur: "smooth", tail: "curl", muzzle: 1.0 };
export const WATER2: Breed = { coat: "#2f2d33", belly: "#2f2d33", dark: "#1c1b1f", chest: "#f2eee6", ear: "drop", fur: "smooth", tail: "otter", muzzle: 0.95 };
export const TWEED2: Breed = { coat: "#8c5636", belly: "#a36a46", dark: "#5c331f", ear: "drop", fur: "curly", tail: "otter", muzzle: 0.9 };
export const NOUS2: Breed = { coat: "#e2b25e", belly: "#f3d9a2", dark: "#c08a3e", ear: "drop", fur: "feather", tail: "plume", muzzle: 0.95 };
export const PUP2: Breed = { coat: "#efcb82", belly: "#f9e7bf", dark: "#d29d52", ear: "drop", fur: "smooth", tail: "plume", muzzle: 0.6, puppy: true };
export const GOLDEN2: Breed = { coat: "#e3a650", belly: "#f5d9a0", dark: "#c3863a", ear: "drop", fur: "feather", tail: "plume", muzzle: 0.95 };

export type DogPose = {
  pose: "stand" | "walk" | "sit" | "run" | "howl" | "swim";
  mouth?: "closed" | "open" | "O" | "duck" | "fish" | "ball" | "bone";
  eye?: "dot" | "happy" | "wide"; brow?: "soft" | "happy" | "worried" | "proud" | "alert";
  headTilt?: number; wag?: number; wagLines?: boolean;
  /** swim: draw the default water band over the body (false = the scene paints its own water) */
  waterline?: boolean;
};
export type DogFront = {
  pose: "sit" | "stand"; mouth?: "closed" | "open" | "stern" | "ball";
  eye?: "dot" | "happy" | "glow"; brow?: DogPose["brow"]; headTilt?: number; wag?: number; wagLines?: boolean;
};

const rot = (pts: P[], a: number, c: P): P[] => pts.map(([x, y]) => [c[0] + (x - c[0]) * Math.cos(a) - (y - c[1]) * Math.sin(a), c[1] + (x - c[0]) * Math.sin(a) + (y - c[1]) * Math.cos(a)]);
const mixc = (a: string, b: string, t: number) => {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((A >> s) & 255) * (1 - t) + ((B >> s) & 255) * t).toString(16).padStart(2, "0");
  return `#${ch(16)}${ch(8)}${ch(0)}`;
};
const begin = (ink: Ink, x: number, y: number, u: number, flip: boolean) => {
  const g = ink.g; g.save(); g.translate(x, y); g.scale(flip ? -u : u, u);
  const saved = { unit: ink.unit, w: ink.w }; ink.unit = 1 / u; ink.w = Math.max(2.2, u * 0.012) / u;
  return () => { g.restore(); ink.unit = saved.unit; ink.w = saved.w; };
};
const brow = (ink: Ink, ex: number, ey: number, k: number, kind: DogPose["brow"], dir: number) => {
  const [o, m, i] = kind === "worried" ? [0.02, -0.01, -0.04] : kind === "proud" ? [-0.025, -0.02, 0.02] : kind === "alert" ? [-0.035, -0.045, -0.035] : kind === "happy" ? [-0.01, -0.04, -0.01] : [0, -0.015, 0];
  const y = ey - 0.075 * k, w = 0.05 * k;
  ink.line([[ex - w * dir, y + o * k], [ex, y + m * k], [ex + w * dir, y + i * k]], ink.w * 1.1, INKC, 0.3);
};

/** side view; (x, y) = point on the ground under the middle of the dog, u = shoulder height in px */
export const dogSide = (ink: Ink, d: Breed, o: DogPose, x: number, y: number, u: number, flip = false, seed = 3) => {
  ink.seed(seed);
  const done = begin(ink, x, y, u, flip), W = ink.w, pup = !!d.puppy;
  const hs = pup ? 1.45 : 1, legK = pup ? 0.78 : 1;
  const far = mixc(d.coat, "#3a3550", 0.28), feather = d.fur === "feather";
  const sit = o.pose === "sit", run = o.pose === "run", swim = o.pose === "swim";
  const B = (pts: P[]) => ink.curvePoly(pts);
  // ---- body outline (stand), y up = negative ----
  const top = -1.0 * legK - (pup ? 0.0 : 0), bel = -0.5 * legK;
  let body: P[] = B([[0.42, top], [0.0, top + 0.03], [-0.45, top + 0.01], [-0.62, top + 0.14], [-0.62, bel - 0.08], [-0.35, bel + 0.02], [0.1, bel], [0.45, bel], [0.64, bel - 0.22], [0.6, top + 0.02]]);
  let neckBase: P = [0.5, top + 0.02], headC: P = [0.84, top - 0.36 * (pup ? 0.8 : 1)], tailRoot: P = [-0.6, top + 0.08];
  type Leg = { pts: P[]; near: boolean };
  const legs: Leg[] = [];
  const fl = (dx: number, sw = 0, lift = 0): P[] => [[dx, bel - 0.05], [dx + sw * 0.4, bel * 0.45 - lift * 0.5], [dx + sw, -lift]];
  const hl = (dx: number, sw = 0, lift = 0): P[] => [[dx, bel - 0.1], [dx + 0.09 + sw * 0.3, bel * 0.55], [dx - 0.06 + sw * 0.8, bel * 0.22 - lift * 0.6], [dx - 0.02 + sw, -lift]];
  if (sit) {
    const L = legK;
    body = B([[0.36, -0.6 * L], [0.42, -0.95 * L], [0.24, -1.22 * L], [-0.02, -1.02 * L], [-0.36, -0.6 * L], [-0.46, -0.22 * L], [-0.3, -0.03], [0.12, -0.06], [0.32, -0.32 * L]]);
    neckBase = [0.3, -1.12 * L]; headC = [0.5, -1.5 * L]; tailRoot = [-0.42, -0.1];
    legs.push({ pts: [[0.33, -0.72 * legK], [0.34, -0.35 * legK], [0.35, 0]], near: false }, { pts: [[0.25, -0.74 * legK], [0.26, -0.35 * legK], [0.27, 0]], near: true });
  } else if (run || swim) {
    body = rot(body, run ? -0.08 : -0.05, [0, bel]);
    legs.push({ pts: hl(-0.48, -0.42, 0.3), near: false }, { pts: fl(0.5, 0.55, 0.42), near: false }, { pts: hl(-0.4, -0.6, 0.12), near: true }, { pts: fl(0.42, 0.62, 0.22), near: true });
    headC = [0.95, top - 0.22]; neckBase = [0.55, top - 0.02];
  } else {
    const wk = o.pose === "walk" ? 0.12 : 0;
    legs.push({ pts: hl(-0.42, wk), near: false }, { pts: fl(0.5, -wk), near: false }, { pts: hl(-0.5, -wk), near: true }, { pts: fl(0.4, wk, wk ? 0.06 : 0), near: true });
    if (o.pose === "howl") headC = [0.72, top - 0.55];
  }
  // ---- tail ----
  const tr = tailRoot, wag = ((o.wag ?? 0) * Math.PI) / 180;
  let tail: P[];
  if (d.tail === "bushy") tail = B([[tr[0], tr[1] - 0.05], [tr[0] - 0.22, tr[1] + 0.12], [tr[0] - 0.3, tr[1] + 0.5], [tr[0] - 0.18, tr[1] + 0.56], [tr[0] - 0.08, tr[1] + 0.2], [tr[0] + 0.05, tr[1] + 0.06]]);
  else if (d.tail === "curl") tail = B([[tr[0], tr[1]], [tr[0] - 0.12, tr[1] - 0.25], [tr[0] + 0.05, tr[1] - 0.38], [tr[0] + 0.12, tr[1] - 0.26], [tr[0] + 0.02, tr[1] - 0.22], [tr[0] + 0.06, tr[1] + 0.06]]);
  else if (d.tail === "otter") tail = B([[tr[0], tr[1] - 0.04], [tr[0] - 0.3, tr[1] + 0.1], [tr[0] - 0.46, tr[1] + 0.22], [tr[0] - 0.28, tr[1] + 0.16], [tr[0] + 0.02, tr[1] + 0.1]]);
  else tail = B(sit ? [[tr[0], tr[1] - 0.05], [tr[0] - 0.3, tr[1] - 0.02], [tr[0] - 0.5, tr[1] + 0.02], [tr[0] - 0.3, tr[1] + 0.08], [tr[0], tr[1] + 0.06]]
    : [[tr[0], tr[1] - 0.04], [tr[0] - 0.24, tr[1] + 0.02], [tr[0] - 0.44, tr[1] + 0.2], [tr[0] - 0.36, tr[1] + 0.3], [tr[0] - 0.2, tr[1] + 0.2], [tr[0] - 0.02, tr[1] + 0.1]]);
  if (wag) tail = rot(tail, -wag, tr);
  if (feather || d.tail === "bushy") tail = ink.ragged(tail, 0.025, 3);
  if (o.wagLines) for (const r of [0.55, 0.68]) ink.arc(tr[0], tr[1], r, r, Math.PI * 1.05 - wag, Math.PI * 1.3 - wag, W);
  ink.shape(tail, d.coat, W);
  if (d.tail === "bushy") { const g = ink.g; g.save(); g.beginPath(); tail.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.clip(); ink.ell(tr[0] - 0.24, tr[1] + 0.52, 0.12, 0.1, d.dark, null); g.restore(); }
  // ---- legs ----
  const legW = (pup ? 0.13 : 0.1);
  const drawLeg = (l: Leg) => {
    const col = l.near ? d.coat : far;
    ink.line(l.pts, legW + W * 2, INKC, 0.4); ink.line(l.pts, legW, col, 0.4);
    const ft = l.pts[l.pts.length - 1];
    ink.ell(ft[0] + 0.03, ft[1] - 0.025, legW * 0.75, legW * 0.36, col, W * 0.9);
    if (feather && !pup) { const a = l.pts[0], b = l.pts[1]; ink.shape(ink.ragged(B([[a[0] - 0.04, a[1] + 0.05], [b[0] - 0.09, b[1]], [b[0] - 0.02, b[1] + 0.02]]), 0.02, 2), col, null); }
  };
  for (const l of legs) if (!l.near) drawLeg(l);
  // ---- body ----
  if (feather && !sit) ink.shape(ink.ragged(B([[-0.4, bel - 0.06], [0.42, bel - 0.06], [0.3, bel + 0.09], [-0.25, bel + 0.08]]), 0.03, 2), d.coat, W * 0.8);
  ink.shape(body, d.coat, W);
  ink.texture(body, [d.dark, d.belly], 10, 0.08, 0.22, 0.16);
  const g = ink.g;
  g.save(); g.beginPath(); body.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.clip();
  ink.ell(sit ? 0.3 : 0.05, sit ? -0.7 * legK : bel + 0.02, sit ? 0.12 : 0.48, sit ? 0.3 : 0.12, d.belly, null);
  if (d.saddle) ink.ell(-0.1, top + 0.0, 0.45, 0.14, d.saddle, null);
  g.restore();
  if (d.fur === "curly") for (let i = 0; i < 30; i++) { const px = -0.5 + ink.r() * 1.0, py = top + 0.08 + ink.r() * 0.38; if (!sit || px < 0.3) ink.arc(px, sit ? py + 0.25 : py, 0.035, 0.03, ink.r() * 6, ink.r() * 6 + 4.5, W * 0.7, d.dark); }
  else ink.hatch(body, d.fur === "shaggy" ? 26 : 14, 0.07, "rgba(40,28,22,0.45)", W * 0.6, Math.PI * 0.8, 0.5);
  if (sit) { // haunch
    const hp = B([[-0.5, -0.04], [-0.52, -0.38 * legK], [-0.26, -0.58 * legK], [0.0, -0.4 * legK], [0.04, -0.04]]);
    ink.shape(hp, d.coat, W); ink.hatch(hp, 8, 0.07, "rgba(40,28,22,0.4)", W * 0.6, Math.PI * 0.8, 0.5);
    ink.ell(0.05, -0.04, 0.12, 0.05, d.coat, W * 0.9);
  }
  for (const l of legs) if (l.near) drawLeg(l);
  // ---- neck ----
  const hc: P = headC;
  const neck = B([[neckBase[0] - 0.2, neckBase[1] + 0.02], [hc[0] - 0.18 * hs, hc[1] - 0.04], [hc[0] + 0.02, hc[1] + 0.12 * hs], [neckBase[0] + 0.16, neckBase[1] + 0.3]]);
  ink.shape(neck, d.coat, null);
  ink.line([neck[Math.floor(neck.length * 0.05)], neck[Math.floor(neck.length * 0.22)]], W);
  ink.line([neck[Math.floor(neck.length * 0.55)], neck[Math.floor(neck.length * 0.72)]], W);
  if (d.chest) ink.ell(neckBase[0] + 0.1, neckBase[1] + 0.2, 0.07, 0.12, d.chest, null, -0.3);
  if (d.fur === "shaggy") ink.shape(ink.ragged(ink.ellPts(hc[0] - 0.12, hc[1] + 0.14, 0.17, 0.2), 0.04, 2), mixc(d.coat, d.belly, 0.35), W);
  if (feather && !pup) ink.shape(ink.ragged(B([[neckBase[0] + 0.05, neckBase[1] + 0.05], [neckBase[0] + 0.2, neckBase[1] + 0.12], [neckBase[0] + 0.14, neckBase[1] + 0.34]]), 0.025, 2), d.coat, null);
  // ---- head ----
  const tilt = ((o.headTilt ?? 0) * Math.PI) / 180 + (o.pose === "howl" ? -0.85 : 0) + (swim ? -0.15 : 0);
  g.save(); g.translate(hc[0], hc[1]); g.rotate(tilt);
  const hr = 0.19 * hs, m = d.muzzle * (pup ? 0.8 : 1);
  // far ear
  if (d.ear === "drop") ink.shape(B([[-0.02, -hr * 0.85], [0.06, -hr * 0.6], [0.05, hr * 0.4], [0.0, hr * 0.5]]), d.dark, W * 0.9);
  else ink.shape([[0.0, -hr * 0.7], [0.1, -hr * 0.75], [0.04, -hr * 1.8]], d.dark, W * 0.9);
  const ml = 0.12 + 0.17 * m;
  const open = o.mouth === "open" || o.mouth === "O";
  if (open) { ink.shape(B([[hr * 0.4, hr * 0.35], [hr * 0.6 + ml, hr * 0.3], [hr * 0.5 + ml * 0.8, hr * 0.85], [hr * 0.3, hr * 0.7]]), "#5a1e28", W);
    if (o.mouth === "open") ink.shape(B([[hr * 0.5, hr * 0.5], [hr * 0.6 + ml * 0.5, hr * 0.6], [hr * 0.55 + ml * 0.45, hr * 1.25], [hr * 0.42, hr * 1.2]]), "#e86e78", W * 0.8); }
  const skull = ink.ellPts(0, 0, hr * 1.05, hr * 0.92, -0.1);
  const muz = B([[hr * 0.35, -hr * 0.45], [hr * 0.6 + ml, -hr * 0.18], [hr * 0.62 + ml, hr * 0.28], [hr * 0.4, hr * 0.48]]);
  ink.shape(skull, d.coat, W);
  ink.shape(muz, mixc(d.coat, d.belly, 0.5), W);
  ink.dot(hr * 0.58 + ml, -hr * 0.14, hr * 0.17);
  if (!open) ink.line([[hr * 0.55 + ml * 0.95, hr * 0.12], [hr * 0.6 + ml * 0.5, hr * 0.26], [hr * 0.45, hr * 0.24]], W * 0.9, INKC, 0.3);
  if (d.fur === "curly") for (let i = 0; i < 8; i++) ink.arc(-hr * 0.5 + (i % 4) * hr * 0.3, -hr * 0.6 + Math.floor(i / 4) * hr * 0.25, 0.03, 0.026, i, i + 4.5, W * 0.7, d.dark);
  // eye + brow
  const ex = hr * 0.3, ey = -hr * 0.22, k = pup ? 1.4 : 1;
  if (o.eye === "happy") ink.arc(ex, ey + 0.012, 0.028 * k, 0.02 * k, Math.PI * 1.1, Math.PI * 1.9, W);
  else if (o.eye === "wide") { ink.ell(ex, ey, 0.03 * k, 0.034 * k, "#ffffff", W * 0.7); ink.dot(ex + 0.006, ey, 0.014 * k); }
  else ink.dot(ex, ey, 0.019 * k);
  brow(ink, ex, ey, k, o.brow ?? "soft", 1);
  // near ear
  if (d.ear === "drop") { const ear = B([[-hr * 0.35, -hr * 0.9], [-hr * 0.05, -hr * 0.75], [-hr * 0.2, hr * 0.55], [-hr * 0.5, hr * 0.5], [-hr * 0.55, -hr * 0.3]]); ink.shape(feather ? ink.ragged(ear, 0.015, 3) : ear, d.dark, W); }
  else { const tip: P = d.ear === "semi" ? [-hr * 0.05, -hr * 1.75] : [-hr * 0.25, -hr * 1.95]; ink.shape([[-hr * 0.6, -hr * 0.55], [hr * 0.05, -hr * 0.8], tip], d.coat, W); ink.shape([[-hr * 0.45, -hr * 0.65], [-hr * 0.08, -hr * 0.78], [tip[0] - 0.005, tip[1] + 0.07]], "#d9aaa2", null);
    if (d.ear === "semi") ink.shape([tip, [tip[0] + 0.08, tip[1] + 0.06], [tip[0] + 0.02, tip[1] + 0.09]], d.dark, W * 0.8); }
  // held items
  const mx = hr * 0.5 + ml * 0.75, my = hr * 0.3;
  if (o.mouth === "duck") {
    ink.ell(mx - 0.02, my + 0.2, 0.17, 0.1, "#8a6e4c", W, -1.25); ink.ell(mx - 0.04, my + 0.17, 0.09, 0.04, "#5d6f8f", W * 0.8, -1.25);
    ink.line([[mx + 0.06, my + 0.02], [mx + 0.11, my - 0.06]], 0.05, INKC, 0.2); ink.line([[mx + 0.06, my + 0.02], [mx + 0.11, my - 0.06]], 0.03, "#f2f0e8", 0.2);
    ink.ell(mx + 0.14, my - 0.1, 0.065, 0.055, "#2f7a4a", W); ink.shape([[mx + 0.19, my - 0.11], [mx + 0.27, my - 0.13], [mx + 0.26, my - 0.08]], "#f0b13c", W * 0.8);
  } else if (o.mouth === "fish") {
    ink.shape(B([[mx - 0.22, my], [mx, my - 0.06], [mx + 0.18, my], [mx, my + 0.06]]), "#c9d6df", W);
    ink.shape([[mx - 0.2, my], [mx - 0.3, my - 0.07], [mx - 0.29, my + 0.07]], "#9fb3c2", W); ink.dot(mx + 0.12, my - 0.01, 0.012);
  } else if (o.mouth === "ball") { ink.ell(mx + 0.02, my, 0.075, 0.075, "#d8e84a", W); ink.arc(mx - 0.03, my, 0.06, 0.07, -1, 1, W * 0.8, "#f8fbe8"); }
  else if (o.mouth === "bone") { ink.ell(mx, my, 0.14, 0.03, "#f3eee2", W, 0.1); for (const s of [-1, 1]) for (const t of [-1, 1]) ink.ell(mx + s * 0.14, my + t * 0.025, 0.03, 0.03, "#f3eee2", W * 0.8); }
  g.restore();
  if (swim && o.waterline !== false) { // water line across the body
    ink.shape([[-1.2, -0.62], [1.4, -0.62], [1.4, 0.2], [-1.2, 0.2]], "rgba(70,140,190,0.78)", null);
    for (const [a, b] of [[-0.9, -0.3], [0.6, 1.1], [-0.2, 0.2]]) ink.line(ink.curve([a, -0.63], [(a + b) / 2, -0.7], [b, -0.63]), W, "#e8f6ff", 0.3);
  }
  done();
};

/** face-on view; (x, y) = point on the ground under the dog, u = shoulder height in px */
export const dogFront = (ink: Ink, d: Breed, o: DogFront, x: number, y: number, u: number, seed = 4) => {
  ink.seed(seed);
  const done = begin(ink, x, y, u, false), W = ink.w, pup = !!d.puppy, g = ink.g;
  const hs = pup ? 1.5 : 1.15, sit = o.pose === "sit", far = mixc(d.coat, "#3a3550", 0.25), feather = d.fur === "feather";
  const B = (pts: P[]) => ink.curvePoly(pts);
  const chestTop = sit ? -1.15 : -1.0, chestW = pup ? 0.28 : 0.3;
  // tail
  const tr: P = sit ? [0.25, -0.12] : [0.2, -0.85], wag = ((o.wag ?? 0) * Math.PI) / 180;
  let tail = d.tail === "bushy" ? B([[tr[0], tr[1]], [tr[0] + 0.3, tr[1] + 0.05], [tr[0] + 0.42, tr[1] + 0.3], [tr[0] + 0.3, tr[1] + 0.34], [tr[0] + 0.05, tr[1] + 0.12]])
    : d.tail === "curl" ? B([[tr[0], tr[1]], [tr[0] + 0.3, tr[1] - 0.25], [tr[0] + 0.2, tr[1] - 0.45], [tr[0] + 0.12, tr[1] - 0.3], [tr[0] + 0.02, tr[1] + 0.06]])
    : B([[tr[0], tr[1]], [tr[0] + 0.3, tr[1] - 0.15], [tr[0] + 0.46, tr[1] - 0.42], [tr[0] + 0.36, tr[1] - 0.45], [tr[0] + 0.22, tr[1] - 0.2], [tr[0] + 0.02, tr[1] + 0.08]]);
  if (wag) tail = rot(tail, -wag, tr);
  if (feather || d.tail === "bushy") tail = ink.ragged(tail, 0.025, 3);
  if (o.wagLines) for (const r of [0.6, 0.72]) ink.arc(tr[0], tr[1], r, r, -1.0 - wag, -0.45 - wag, W);
  ink.shape(tail, d.coat, W);
  if (sit) for (const s of [-1, 1]) { // haunches + hind paws
    const hp = B([[s * 0.1, 0], [s * 0.1, -0.4], [s * 0.3, -0.5], [s * 0.45, -0.3], [s * 0.44, 0]]);
    ink.shape(hp, s < 0 ? d.coat : far, W);
    ink.ell(s * 0.42, -0.03, 0.1, 0.045, d.coat, W * 0.9);
  } else {
    const back = B([[-0.36, chestTop + 0.05], [0.36, chestTop + 0.05], [0.34, chestTop + 0.45], [-0.34, chestTop + 0.45]]);
    ink.shape(back, far, W);
    for (const s of [-1, 1]) { const pts: P[] = [[s * 0.25, chestTop + 0.4], [s * 0.27, -0.25], [s * 0.25, 0]]; ink.line(pts, 0.1 + W * 2, INKC, 0.4); ink.line(pts, 0.1, far, 0.4); ink.ell(s * 0.25, -0.03, 0.08, 0.04, far, W * 0.9); }
  }
  // chest
  const chest = B([[-chestW, chestTop + 0.1], [0, chestTop - 0.05], [chestW, chestTop + 0.1], [chestW * 0.95, sit ? -0.3 : -0.5], [0, sit ? -0.2 : -0.42], [-chestW * 0.95, sit ? -0.3 : -0.5]]);
  ink.shape(chest, d.coat, W);
  g.save(); g.beginPath(); chest.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.clip();
  ink.ell(0, chestTop + 0.35, chestW * 0.55, 0.3, d.chest ?? mixc(d.coat, d.belly, 0.7), null);
  g.restore();
  if (d.fur === "curly") for (let i = 0; i < 16; i++) ink.arc(-0.22 + ink.r() * 0.44, chestTop + 0.15 + ink.r() * 0.6, 0.035, 0.03, ink.r() * 6, ink.r() * 6 + 4.5, W * 0.7, d.dark);
  else ink.hatch(chest, 12, 0.07, "rgba(40,28,22,0.4)", W * 0.6, Math.PI / 2, 0.4);
  if (feather && !pup) ink.shape(ink.ragged(B([[-0.2, chestTop + 0.5], [0.2, chestTop + 0.5], [0.12, chestTop + 0.7], [-0.12, chestTop + 0.7]]), 0.03, 2), d.coat, null);
  // front legs
  for (const s of [-1, 1]) {
    const lw = pup ? 0.13 : 0.11, pts: P[] = [[s * 0.13, chestTop + (sit ? 0.5 : 0.55)], [s * 0.14, -0.3], [s * 0.15, -0.02]];
    ink.line(pts, lw + W * 2, INKC, 0.4); ink.line(pts, lw, s < 0 ? d.coat : mixc(d.coat, far, 0.5), 0.4);
    ink.ell(s * 0.15, -0.035, lw * 0.75, lw * 0.4, d.coat, W * 0.9);
    for (const t of [-1, 1]) ink.line([[s * 0.15 + t * lw * 0.22, -0.05], [s * 0.15 + t * lw * 0.22, -0.01]], W * 0.7, INKC, 0.1);
  }
  if (o.mouth === "ball") { ink.ell(0.42, -0.08, 0.08, 0.08, "#d8e84a", W); ink.arc(0.37, -0.08, 0.06, 0.07, -1, 1, W * 0.8, "#f8fbe8"); }
  // head
  const hc: P = [0, chestTop - 0.18 * hs];
  g.save(); g.translate(hc[0], hc[1]); g.rotate(((o.headTilt ?? 0) * Math.PI) / 180);
  const hr = 0.2 * hs;
  const ears = () => { for (const s of [-1, 1]) {
    if (d.ear === "drop") { const ear = B([[s * hr * 0.6, -hr * 0.85], [s * hr * 1.1, -hr * 0.5], [s * hr * 1.12, hr * 0.5], [s * hr * 0.85, hr * 0.62], [s * hr * 0.7, -hr * 0.2]]); ink.shape(feather ? ink.ragged(ear, 0.015, 3) : ear, d.dark, W); }
    else { const tip: P = d.ear === "semi" ? [s * hr * 0.85, -hr * 1.75] : [s * hr * 0.75, -hr * 2.0]; ink.shape([[s * hr * 0.2, -hr * 0.85], [s * hr * 0.95, -hr * 0.45], tip], d.coat, W); ink.shape([[s * hr * 0.33, -hr * 0.8], [s * hr * 0.82, -hr * 0.52], [tip[0], tip[1] + 0.08]], "#d9aaa2", null);
      if (d.ear === "semi") ink.shape([tip, [tip[0] + s * 0.08, tip[1] + 0.06], [tip[0] + s * 0.01, tip[1] + 0.09]], d.dark, W * 0.8); }
  } };
  if (d.ear !== "drop") ears();
  if (d.fur === "shaggy") ink.shape(ink.ragged(ink.ellPts(0, hr * 0.25, hr * 1.35, hr * 1.25), 0.05, 2), mixc(d.coat, d.belly, 0.4), W);
  const skull = B([[-hr, -hr * 0.2], [-hr * 0.7, -hr * 0.95], [0, -hr * 1.05], [hr * 0.7, -hr * 0.95], [hr, -hr * 0.2], [hr * 0.6, hr * 0.75], [0, hr * 0.9], [-hr * 0.6, hr * 0.75]]);
  ink.shape(skull, d.coat, W);
  if (d.saddle) { g.save(); g.beginPath(); skull.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.clip(); ink.ell(0, -hr, hr * 0.5, hr * 0.35, d.saddle, null); g.restore(); }
  if (d.fur === "curly") for (let i = 0; i < 9; i++) ink.arc(-hr * 0.6 + (i % 5) * hr * 0.3, -hr * 0.75 + Math.floor(i / 5) * hr * 0.25, 0.03, 0.026, i, i + 4.5, W * 0.7, d.dark);
  if (d.ear === "drop") ears();
  // muzzle
  const mw = hr * (0.5 + 0.06 * d.muzzle), mh = hr * (0.36 + 0.14 * d.muzzle), mc: P = [0, hr * 0.42];
  const open = o.mouth === "open";
  if (open) { ink.shape(ink.ellPts(mc[0], mc[1] + mh * 0.75, mw * 0.6, mh * 0.75, 0, 24, 0, Math.PI), "#5a1e28", W); ink.shape(B([[-mw * 0.32, mc[1] + mh * 0.8], [mw * 0.32, mc[1] + mh * 0.8], [mw * 0.3, mc[1] + mh * 1.9], [-mw * 0.3, mc[1] + mh * 1.9]]), "#e86e78", W * 0.8); ink.line([[0, mc[1] + mh], [0, mc[1] + mh * 1.6]], W * 0.6, "#b04a52", 0.2); }
  ink.shape(ink.ellPts(mc[0], mc[1], mw, mh), mixc(d.coat, d.belly, 0.55), W);
  ink.shape(B([[-mw * 0.42, mc[1] - mh * 0.55], [mw * 0.42, mc[1] - mh * 0.55], [0, mc[1] - mh * 0.12]]), INKC, null);
  ink.line([[0, mc[1] - mh * 0.15], [0, mc[1] + mh * 0.25]], W * 0.9, INKC, 0.1);
  if (o.mouth === "stern") ink.line([[-mw * 0.5, mc[1] + mh * 0.42], [mw * 0.5, mc[1] + mh * 0.42]], W * 0.9, INKC, 0.2);
  else for (const s of [-1, 1]) ink.arc(s * mw * 0.28, mc[1] + mh * 0.22, mw * 0.28, mh * 0.3, open ? 0.1 : 0.3, open ? 3.0 : 2.8, W * 0.9);
  // eyes
  const ek = pup ? 1.35 : 1, ey = -hr * 0.18;
  for (const s of [-1, 1]) {
    const ex = s * hr * 0.42;
    if (o.eye === "happy") ink.arc(ex, ey + 0.012, 0.03 * ek, 0.02 * ek, Math.PI * 1.1, Math.PI * 1.9, W);
    else if (o.eye === "glow") { ink.ell(ex, ey, 0.035, 0.028, "#f6d64a", W * 0.8); ink.dot(ex, ey, 0.012); }
    else ink.dot(ex, ey, 0.021 * ek);
    brow(ink, ex, ey, ek, o.brow ?? "soft", -s);
  }
  g.restore();
  done();
};
