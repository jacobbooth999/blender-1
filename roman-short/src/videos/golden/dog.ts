// Cartoon dogs (and the wolf) for "From Wolf to Golden": side view facing screen-right, drawn with the same Pen
// API, plum ink, painted crescents and thick-thin outlines as the people cards (rome/toon.ts).
// Designed in a 1000-unit-wide space (sole at y = 975, dog centred on x = 500) and drawn at DOG_K into the
// 600 x 1000 body card, so 1000 design units = 1.3 m (an adult golden ~0.58 m at the shoulder).
import { Pen, INK, mul, shade, mix, blobPts, thickAngle } from "../rome/toon";

type P2 = [number, number];
type C3 = [number, number, number];
const SH: C3 = [0.66, 0.66, 0.78]; // far-side fur shade (cool, like the cloth cards)
const rad = (d: number) => (d * Math.PI) / 180;
const TONGUE = "#e86e78", MOUTH = "#5a1e28";

export type Dog = {
  coat: string; belly: string; dark?: string; chest?: string; saddle?: string;
  ear: "prick" | "drop" | "semi";
  fur: "smooth" | "wavy" | "curly" | "shaggy";
  muzzle: number; tail: "bushy" | "feather" | "otter" | "curl";
  puppy?: boolean; size?: number;
};
export type DogPose = {
  pose: "stand" | "sit" | "howl" | "run" | "walk";
  mouth?: "closed" | "open" | "O" | "duck" | "ball" | "fish" | "smile";
  eye?: "dot" | "happy" | "lid" | "up";
  blink?: number; phase?: number; light?: number; headTilt?: number;
};
export const DOG_K = 0.6;

// ---------------- breeds (our palettes) ----------------
export const WOLF: Dog = { coat: "#8f8e94", belly: "#e2ddd3", saddle: "#5c5a62", dark: "#4a4850", ear: "prick", fur: "shaggy", muzzle: 1.2, tail: "bushy" };
export const EARLY_DOG: Dog = { coat: "#c79a5e", belly: "#f0dfbf", dark: "#8a6238", ear: "semi", fur: "smooth", muzzle: 1.0, tail: "curl", size: 0.88 };
export const WATER_DOG: Dog = { coat: "#3b3944", belly: "#3b3944", chest: "#f2eee6", dark: "#26252c", ear: "drop", fur: "smooth", muzzle: 0.95, tail: "otter" };
export const TWEED: Dog = { coat: "#8a5434", belly: "#a86c48", dark: "#5e341f", ear: "drop", fur: "curly", muzzle: 0.9, tail: "otter", size: 0.86 };
export const NOUS: Dog = { coat: "#e3b45c", belly: "#f3d699", dark: "#c08a3c", ear: "drop", fur: "wavy", muzzle: 0.95, tail: "feather" };
export const PUP: Dog = { coat: "#ecc474", belly: "#f8e3b4", dark: "#cf9a4c", ear: "drop", fur: "wavy", muzzle: 0.6, tail: "feather", puppy: true };
export const KEEPER_GOLDEN: Dog = { coat: "#d9a24c", belly: "#efcf8c", dark: "#b07a34", ear: "drop", fur: "wavy", muzzle: 0.95, tail: "feather" };
export const GOLDEN: Dog = { coat: "#e6ad52", belly: "#f6da9e", dark: "#c58a3a", ear: "drop", fur: "wavy", muzzle: 0.95, tail: "feather" };

/** closed outline of a stroke whose width tapers from w0 to w1 along the polyline */
const taper = (pts: P2[], w0: number, w1: number, fringe = 0): P2[] => {
  const L: P2[] = [], R: P2[] = [], n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let nx = -(b[1] - a[1]), ny = b[0] - a[0];
    const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const t = i / (n - 1), w = (w0 + (w1 - w0) * t) / 2;
    const f = fringe ? fringe * Math.sin(Math.PI * t) * (0.35 + 0.65 * Math.abs(Math.sin(t * Math.PI * 4.5))) : 0;
    L.push([pts[i][0] + nx * w, pts[i][1] + ny * w]); R.push([pts[i][0] - nx * (w + f), pts[i][1] - ny * (w + f)]);
  }
  return [...L, ...R.reverse()];
};
/** quadratic curve through a, (near) k, b */
const curve = (a: P2, k: P2, b: P2, n = 28): P2[] => {
  const c: P2 = [2 * k[0] - (a[0] + b[0]) / 2, 2 * k[1] - (a[1] + b[1]) / 2], out: P2[] = [];
  for (let i = 0; i <= n; i++) { const t = i / n, s = 1 - t; out.push([s * s * a[0] + 2 * s * t * c[0] + t * t * b[0], s * s * a[1] + 2 * s * t * c[1] + t * t * b[1]]); }
  return out;
};
const scallop = (x0: number, x1: number, y: number, depth: number, n: number): P2[] => {
  const out: P2[] = [], m = n * 10;
  for (let i = 0; i <= m; i++) { const t = i / m; out.push([x0 + (x1 - x0) * t, y + depth * (0.3 + 0.7 * Math.abs(Math.sin(t * Math.PI * n))) * Math.sin(Math.PI * Math.min(1, t * 1.3))]); }
  return out;
};

export const drawDog = (p0: Pen, d: Dog, o: DogPose) => {
  const g = p0.g;
  const k = DOG_K * (d.size ?? 1) * (d.puppy ? 0.5 : 1);
  g.save(); g.translate(300, 975); g.scale(k, k); g.translate(-500, -975);
  const p = new Pen(g); p.ol = 12;
  const light = o.light ?? rad(-120), thick = thickAngle(light);
  const coat = d.coat, far = mul(coat, SH), dark = d.dark ?? shade(coat, 0.7);
  const sole = 975, pup = !!d.puppy, hs = pup ? 1.55 : 1;
  const L = pup ? 165 : 245;                         // leg length
  const legW = pup ? 60 : 46;
  const two = Math.PI * 2, ph = o.phase ?? 0;
  const fringe = d.fur === "wavy";

  // ---------- skeleton per pose ----------
  type Leg = { hip: P2; foot: P2; back: boolean; near: boolean };
  let body: P2[], bodyC: P2, bodyA: number, bodyB: number, bodyRot = 0, tailRoot: P2, neckBase: P2, head: P2, headRot = 0;
  const legs: Leg[] = [];
  let haunch: P2 | null = null;
  if (o.pose === "sit") {
    bodyA = pup ? 135 : 165; bodyB = pup ? 95 : 88; bodyRot = rad(-58);
    bodyC = [480, sole - (pup ? 190 : 225)];
    const fx = bodyC[0] + Math.cos(bodyRot) * bodyA * 0.55;
    legs.push({ hip: [fx + 26, bodyC[1] - 40], foot: [fx + 34, sole - 12], back: false, near: false });
    legs.push({ hip: [fx, bodyC[1] - 30], foot: [fx + 6, sole - 12], back: false, near: true });
    haunch = [bodyC[0] - (pup ? 50 : 70), sole - (pup ? 85 : 100)];
    tailRoot = [haunch[0] - 60, sole - 40];
    neckBase = [bodyC[0] + Math.cos(bodyRot) * bodyA * 0.85, bodyC[1] + Math.sin(bodyRot) * bodyA * 0.85];
    head = [neckBase[0] + 40, neckBase[1] - (pup ? 70 : 105)];
  } else {
    bodyA = pup ? 150 : 205; bodyB = pup ? 100 : 112;
    const run = o.pose === "run";
    if (run) bodyRot = rad(-6);
    bodyC = [470, sole - L - 50];
    const fx = bodyC[0] + bodyA * 0.6, bx = bodyC[0] - bodyA * 0.58, top = bodyC[1] + bodyB * 0.3;
    const sw = (off: number) => (o.pose === "walk" ? 34 * Math.sin(two * (ph + off)) : 0);
    const lift = (off: number) => (o.pose === "walk" ? Math.max(0, Math.cos(two * (ph + off))) * 30 : 0);
    if (run) {
      legs.push({ hip: [bx + 10, top], foot: [bx - 120, sole - 70], back: true, near: false });
      legs.push({ hip: [fx + 10, top - 10], foot: [fx + 150, sole - 110], back: false, near: false });
      legs.push({ hip: [bx, top], foot: [bx - 160, sole - 40], back: true, near: true });
      legs.push({ hip: [fx, top - 10], foot: [fx + 175, sole - 60], back: false, near: true });
    } else {
      legs.push({ hip: [bx + 18, top], foot: [bx + 18 + sw(0.5), sole - 12 - lift(0.5)], back: true, near: false });
      legs.push({ hip: [fx + 18, top], foot: [fx + 18 + sw(0), sole - 12 - lift(0)], back: false, near: false });
      legs.push({ hip: [bx, top], foot: [bx + sw(0), sole - 12 - lift(0)], back: true, near: true });
      legs.push({ hip: [fx, top], foot: [fx + sw(0.5), sole - 12 - lift(0.5)], back: false, near: true });
    }
    tailRoot = [bodyC[0] - bodyA * 0.92, bodyC[1] - bodyB * 0.35];
    neckBase = [bodyC[0] + bodyA * 0.72, bodyC[1] - bodyB * 0.35];
    if (o.pose === "howl") { head = [neckBase[0] + 35, neckBase[1] - 120]; headRot = rad(-50); }
    else if (run) head = [neckBase[0] + 90, neckBase[1] - 55];
    else head = [neckBase[0] + 60, neckBase[1] - (pup ? 70 : 88)];
  }
  if (o.headTilt) headRot += rad(o.headTilt);
  body = blobPts(bodyC[0], bodyC[1], { a: bodyA, b: bodyB, nTop: 2.2, nBot: 2.5, egg: 0, asym: 0.06, rot: bodyRot, noise: 0.012, seed: 4 });

  // ---------- tail (behind everything) ----------
  const tr = tailRoot;
  let tail: P2[];
  const tw = pup ? 0.8 : 1;
  if (d.tail === "bushy") tail = taper(curve(tr, [tr[0] - 80, tr[1] + 40], [tr[0] - 120, tr[1] + 200]), 66 * tw, 64 * tw);
  else if (d.tail === "curl") tail = taper(curve(tr, [tr[0] - 50, tr[1] - 130], [tr[0] + 40, tr[1] - 120]), 44, 22);
  else if (d.tail === "otter") tail = taper(curve(tr, [tr[0] - 110, tr[1] + 30], [tr[0] - 200, tr[1] + 70]), 50 * tw, 12 * tw);
  else tail = taper(o.pose === "sit" ? curve(tr, [tr[0] - 100, tr[1] + 10], [tr[0] - 190, tr[1] + 25]) : curve(tr, [tr[0] - 110, tr[1] - 10], [tr[0] - 210, tr[1] + 30]), 46 * tw, 16 * tw, fringe ? 40 * tw : 0);
  if (d.tail === "bushy") tail = [...tail.slice(0, tail.length / 2), ...Array.from({ length: 9 }, (_, i): P2 => { const e = tail[tail.length / 2 - 1], f = tail[tail.length / 2], a0 = Math.atan2(e[1] - f[1], e[0] - f[0]); const r = Math.hypot(e[0] - f[0], e[1] - f[1]) / 2, c: P2 = [(e[0] + f[0]) / 2, (e[1] + f[1]) / 2]; const a = a0 + (Math.PI * (i + 1)) / 10; return [c[0] + Math.cos(a) * r * 1.0, c[1] + Math.sin(a) * r * 1.25]; }), ...tail.slice(tail.length / 2)];
  p.poly(tail, d.tail === "bushy" ? coat : coat, 0);
  if (d.tail === "bushy") p.clip(tail, () => p.ell(tr[0] - 115, tr[1] + 195, 50, 48, dark, 0));
  p.inkRing(tail, 11, thick);

  // ---------- legs ----------
  const leg = (l: Leg) => {
    const col = l.near ? coat : far, [hx, hy] = l.hip, [fx, fy] = l.foot;
    const pts: P2[] = l.back
      ? [[hx, hy], [hx + 22, hy + (fy - hy) * 0.4], [fx - 18, hy + (fy - hy) * 0.72], [fx, fy]]
      : [[hx, hy], [hx + (fx - hx) * 0.5, hy + (fy - hy) * 0.5], [fx, fy]];
    p.stroke(pts, legW + 22, INK);
    p.stroke(pts, legW, col);
    if (fringe && !pup) {
      const a: P2 = l.back ? [hx - 30, hy + 40] : [hx - 24, hy + 30], b: P2 = l.back ? [hx - 20, hy + (fy - hy) * 0.55] : [hx + (fx - hx) * 0.5 - 22, hy + (fy - hy) * 0.6];
      p.poly(taper(curve(a, [(a[0] + b[0]) / 2 - 6, (a[1] + b[1]) / 2], b), 30, 8, 22), col, 0);
    }
    p.ell(fx + 14, fy - 2, legW * 0.74, legW * 0.38, col, 10);
    // thigh / shoulder mass over the top of the leg
    const tb = blobPts(hx + (l.back ? -4 : 2), hy - (l.back ? 18 : 10), { a: l.back ? (pup ? 62 : 82) : (pup ? 46 : 58), b: l.back ? (pup ? 70 : 96) : (pup ? 56 : 74),
      nTop: 2.1, nBot: 2.4, egg: l.back ? 0.18 : 0.25, asym: 0, rot: rad(l.back ? -8 : 6), noise: 0.01, seed: l.back ? 8 : 9 });
    if (l.near) { p.gradFill(tb, col, far, light, 0.35); p.inkRing(tb, 10, thick, 0.6); }
    else p.poly(tb, col, 0);
  };
  for (const l of legs.filter((x) => !x.near)) leg(l);
  if (o.pose === "sit") {
    const hp: P2 = [haunch![0] + 50, sole - 16];
    p.ell(hp[0] - 30, hp[1], 52, 20, far, 10); // far hind paw
  }

  // ---------- belly fringe (feathering) ----------
  if (fringe && o.pose !== "sit") {
    const yb = bodyC[1] + bodyB * 0.7;
    const fr = [...scallop(bodyC[0] - bodyA * 0.55, bodyC[0] + bodyA * 0.45, yb, pup ? 26 : 48, 6)].reverse();
    p.poly([[bodyC[0] - bodyA * 0.6, yb - 30], [bodyC[0] + bodyA * 0.5, yb - 30], ...fr], coat, 10);
  }

  // ---------- body ----------
  p.gradFill(body, coat, far, light, 0.3);
  p.clip(body, () => {
    p.ell(bodyC[0] + 20, bodyC[1] + bodyB * 0.95, bodyA * 0.75, bodyB * 0.45, d.belly, 0, 0, 360, (bodyRot * 180) / Math.PI);
    if (d.saddle) p.ell(bodyC[0] - 20, bodyC[1] - bodyB * 0.9, bodyA * 0.8, bodyB * 0.55, d.saddle, 0, 0, 360, (bodyRot * 180) / Math.PI);
    if (d.fur === "curly") {
      for (let i = 0; i < 46; i++) {
        const u = ((i * 0.618) % 1) * 2 - 1, v = ((i * 0.381 + 0.2) % 1) * 2 - 1;
        const x = bodyC[0] + u * bodyA * 0.95, y = bodyC[1] + v * bodyB * 0.9;
        p.arc(x, y, 15, 13, 180 + i * 37, 470 + i * 37, 6, dark);
      }
    }
    if (d.fur === "wavy" || d.fur === "shaggy") {
      for (let i = 0; i < 7; i++) {
        const x = bodyC[0] - bodyA * 0.6 + i * bodyA * 0.2, y = bodyC[1] - bodyB * 0.15 + ((i * 37) % 3) * 22;
        p.arc(x, y, 22, 10, 200, 340, 6, dark);
      }
    }
  });
  p.inkRing(body, 13, thick);
  if (o.pose === "sit" && haunch) {
    const hpts = blobPts(haunch[0], haunch[1], { a: pup ? 80 : 108, b: pup ? 75 : 95, nTop: 2.1, nBot: 2.6, egg: 0.05, asym: 0, rot: rad(-15), noise: 0.01, seed: 7 });
    p.gradFill(hpts, coat, far, light, 0.35);
    if (fringe) p.poly(taper(curve([haunch[0] - 90, haunch[1] - 10], [haunch[0] - 120, haunch[1] + 40], [haunch[0] - 95, haunch[1] + 85]), 20, 10, 30), coat, 0);
    p.inkRing(hpts, 12, thick);
    if (d.fur === "curly") p.clip(hpts, () => { for (let i = 0; i < 9; i++) p.arc(haunch![0] - 60 + (i % 3) * 55, haunch![1] - 50 + Math.floor(i / 3) * 45, 15, 13, i * 50, 290 + i * 50, 6, dark); });
    p.ell(haunch[0] + 60, sole - 16, pup ? 46 : 56, pup ? 20 : 22, coat, 10); // near hind paw
  }
  for (const l of legs.filter((x) => x.near)) leg(l);

  // ---------- neck + chest ----------
  const hx = head[0], hy = head[1];
  const neck: P2[] = [
    [neckBase[0] - 95, neckBase[1] + 15], [hx - 62 * hs, hy - 12 * hs], [hx + 26 * hs, hy + 48 * hs], [neckBase[0] + 62, neckBase[1] + 120],
  ];
  p.gradFill(neck, coat, far, light, 0.4);
  p.stroke([neck[0], neck[1]], 12); p.stroke([neck[2], neck[3]], 12);
  if (d.chest) p.clip(neck, () => p.ell(neck[3][0] - 18, neck[3][1] - 40, 34, 60, d.chest!, 0, 0, 360, -20));
  if (d.fur === "shaggy") { // ruff
    const ruff: P2[] = [];
    for (let i = 0; i <= 14; i++) { const a = rad(-100 + i * 15), r = (i % 2 ? 120 : 92); ruff.push([hx - 25 + Math.cos(a) * r * 0.75, hy + 45 + Math.sin(a) * r]); }
    p.poly(ruff, mix(coat, d.belly, 0.35), 11);
  }
  if (fringe && !pup) p.poly(taper(curve([neck[2][0] - 5, neck[2][1]], [neck[2][0] + 25, neck[2][1] + 50], [neck[3][0] - 5, neck[3][1] - 10]), 34, 12, 26), coat, 0);

  // ---------- head (rotatable about its centre) ----------
  p.rot = headRot ? [headRot, hx, hy] : null;
  const m = d.muzzle * (pup ? 0.75 : 1);
  const ha = 80 * hs, hb = 70 * hs;
  // far ear
  if (d.ear === "drop") p.poly(taper(curve([hx - 10 * hs, hy - 52 * hs], [hx + 18 * hs, hy - 10 * hs], [hx + 10 * hs, hy + 40 * hs]), 50 * hs, 34 * hs), shade(dark, 0.85), 10);
  else p.poly([[hx - 5 * hs, hy - 50 * hs], [hx + 32 * hs, hy - 52 * hs], [hx + 18 * hs, hy - 118 * hs]], shade(dark, 0.85), 10);
  // muzzle
  const mx = hx + (50 + 40 * m) * hs, my = hy + 22 * hs, mrx = (30 + 32 * m) * hs, mry = 32 * hs * (pup ? 0.9 : 1);
  const muz = blobPts(mx, my, { a: mrx, b: mry, nTop: 2.2, nBot: 2.4, egg: 0, asym: 0.08, rot: rad(4), noise: 0.01, seed: 3 });
  const skull = blobPts(hx, hy, { a: ha, b: hb, nTop: 2.0, nBot: 2.3, egg: -0.05, asym: 0.08, rot: rad(-4), noise: 0.008, seed: 5 });
  const open = o.mouth === "open" || o.mouth === "smile";
  if (open) { // lower jaw + mouth cavity + tongue
    const jaw: P2[] = [[mx - mrx * 0.9, my + mry * 0.4], [mx + mrx * 0.85, my + mry * 0.55], [mx + mrx * 0.5, my + mry * 1.55], [mx - mrx * 0.9, my + mry * 1.2]];
    p.poly(jaw, MOUTH, 10);
    p.poly(taper(curve([mx - mrx * 0.1, my + mry * 0.9], [mx + mrx * 0.15, my + mry * 1.6], [mx - mrx * 0.05, my + mry * 2.4]), 36 * hs, 30 * hs), TONGUE, 9);
  }
  p.shadedFill(skull, coat, far, light, ha);
  p.inkRing(skull, 12, thick);
  p.shadedFill(muz, mix(coat, d.belly, 0.45), mix(far, d.belly, 0.3), light, mrx);
  p.inkRing(muz, 11, thick);
  if (d.fur === "curly") p.clip(skull, () => { for (let i = 0; i < 8; i++) p.arc(hx - 50 * hs + (i % 4) * 30 * hs, hy - 52 * hs + Math.floor(i / 4) * 24 * hs, 13, 11, i * 40, 280 + i * 40, 6, dark); });
  // nose + mouth line
  const nx = mx + mrx * 0.92, ny = my - mry * 0.45;
  p.ell(nx, ny, 17 * hs * (pup ? 0.8 : 1), 13 * hs * (pup ? 0.8 : 1), INK, 0);
  if (o.mouth === "O") { p.ell(mx + mrx * 0.6, my + mry * 0.5, 22, 26, MOUTH, 9); }
  else if (!open) p.arc(mx + mrx * 0.15, my + mry * 0.35, mrx * 0.75, mry * 0.35, 10, 150, 7);
  else p.arc(mx - mrx * 0.85, my + mry * 0.25, 16, 12, 200, 330, 7); // smile corner
  // eye + brow
  const ex = hx + 30 * hs, ey = hy - 16 * hs, eyeK = pup ? 1.45 : 1, eye = o.eye ?? "dot";
  if ((o.blink ?? 0) >= 1 || eye === "happy") p.arc(ex, ey + 6, 13 * eyeK, 9 * eyeK, 200, 340, 8);
  else if (eye === "lid") { p.ell(ex, ey + 2, 11 * eyeK, 9 * eyeK, INK, 0, 0, 180); p.stroke([[ex - 14, ey], [ex + 14, ey - 2]], 7); }
  else {
    p.ell(ex, ey, 9.5 * eyeK, 12.5 * eyeK, INK, 0);
    if (eye === "up") p.stroke([[ex - 16, ey - 30 * eyeK], [ex + 12, ey - 36 * eyeK]], 7);
  }
  // near ear
  if (d.ear === "drop") {
    const ear = taper(curve([hx - 34 * hs, hy - 56 * hs], [hx - 62 * hs, hy - 2 * hs], [hx - 50 * hs, hy + 50 * hs]), 52 * hs, 46 * hs);
    p.gradFill(ear, dark, shade(dark, 0.8), light, 0.3);
    p.inkRing(ear, 10, thick);
    if (d.fur === "curly") p.clip(ear, () => { for (let i = 0; i < 4; i++) p.arc(hx - 46 * hs, hy - 35 * hs + i * 24 * hs, 12, 10, i * 60, 300 + i * 60, 6, shade(dark, 0.7)); });
  } else {
    const tip: P2 = d.ear === "semi" ? [hx - 6 * hs, hy - 108 * hs] : [hx - 22 * hs, hy - 128 * hs];
    const ear: P2[] = [[hx - 48 * hs, hy - 42 * hs], [hx + 2 * hs, hy - 56 * hs], tip];
    p.poly(ear, coat, 11);
    p.poly([[hx - 36 * hs, hy - 48 * hs], [hx - 8 * hs, hy - 56 * hs], [tip[0] - 3, tip[1] + 26]], "#d8a8a0", 0);
    if (d.ear === "semi") p.poly([tip, [tip[0] + 30 * hs, tip[1] + 16 * hs], [tip[0] + 6 * hs, tip[1] + 30 * hs]], dark, 8);
  }
  // held items
  if (o.mouth === "ball") {
    const bx = nx - 10, by = my + mry * 0.6;
    p.ell(bx, by, 38 * hs, 38 * hs, "#d8e84a", 10);
    p.arc(bx - 30 * hs, by, 30 * hs, 34 * hs, -60, 60, 6, "#f8fbe8");
  } else if (o.mouth === "fish") {
    const fx2 = mx + 10, fy2 = my + mry * 0.6;
    p.poly([[fx2 - 120, fy2 - 6], [fx2 - 160, fy2 - 40], [fx2 - 155, fy2 + 30]], "#9fb3c2", 9);
    p.ell(fx2, fy2, 115, 30, "#c9d6df", 10, 0, 360, 8);
    p.ell(fx2 + 80, fy2 - 6, 7, 7, INK, 0);
    p.stroke([[fx2 - 60, fy2 + 4], [fx2 + 50, fy2 + 12]], 5, "#7f95a6");
  } else if (o.mouth === "duck") {
    const dx = mx + mrx * 0.2, dy = my + mry * 0.5;
    p.ell(dx - 10, dy + 85, 85, 52, "#8a6e4c", 10, 0, 360, -70);          // body hanging down
    p.ell(dx - 30, dy + 70, 45, 22, "#5d6f8f", 8, 0, 360, -70);           // wing speculum
    p.stroke([[dx + 30, dy + 10], [dx + 60, dy - 20]], 26, INK); p.stroke([[dx + 30, dy + 10], [dx + 60, dy - 20]], 16, "#f2f0e8"); // neck ring
    p.ell(dx + 75, dy - 40, 34, 28, "#2f7a4a", 9);                        // green head
    p.poly([[dx + 100, dy - 44], [dx + 140, dy - 52], [dx + 136, dy - 34]], "#f0b13c", 7);
  }
  p.rot = null;
  g.restore();
};
