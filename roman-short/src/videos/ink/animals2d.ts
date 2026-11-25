// Savanna animals for the ink explainer look: giraffe (adult / calf / short-necked ancestor), lioness, zebra,
// acacia trees, a big giraffe head for close-ups. Natural proportions, flat colour, thin wobbly ink, animatable
// (gallop phase, tail swish, blink, chewing, tongue). Units: u = shoulder height in px, ground at y = 0.
import { Ink, P, INKC } from "./ink2d";
import { cel } from "./quadruped";

const rotP = (pts: P[], a: number, c: P): P[] => pts.map(([x, y]) => [c[0] + (x - c[0]) * Math.cos(a) - (y - c[1]) * Math.sin(a), c[1] + (x - c[0]) * Math.sin(a) + (y - c[1]) * Math.cos(a)]);
const begin = (ink: Ink, x: number, y: number, u: number, flip: boolean) => {
  const g = ink.g; g.save(); g.translate(x, y); g.scale(flip ? -u : u, u);
  const saved = { unit: ink.unit, w: ink.w }; ink.unit = 1 / u; ink.w = Math.max(2.2, u * 0.0065) / u;
  return () => { g.restore(); ink.unit = saved.unit; ink.w = saved.w; };
};
const clipTo = (ink: Ink, pts: P[], fn: () => void) => { const g = ink.g; g.save(); g.beginPath(); pts.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.closePath(); g.clip(); fn(); g.restore(); };
/** reticulated giraffe patches: rounded polygons on a jittered grid, cream gaps between them */
const patches = (ink: Ink, x0: number, x1: number, y0: number, y1: number, cell: number, col: string, seed: number) => {
  ink.seed(seed);
  for (let y = y0; y < y1; y += cell) for (let x = x0 + ((Math.round((y - y0) / cell) % 2) * cell) / 2; x < x1; x += cell) {
    const cx = x + (ink.r() - 0.5) * cell * 0.12, cy = y + (ink.r() - 0.5) * cell * 0.12, n = 6, pts: P[] = [];
    for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2 + ink.r() * 0.5, r = cell * (0.5 + ink.r() * 0.1); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    ink.shape(ink.curvePoly(pts, 1), col, null);
  }
};

export type GiraffeOpts = {
  pose?: "stand" | "walk" | "run" | "eat" | "alert" | "hide";
  phase?: number; swish?: number; blink?: boolean; chew?: number; tongue?: number; look?: "side" | "front";
  kind?: "adult" | "calf" | "ancestor"; brow?: "soft" | "worried" | "proud" | "alert"; mouth?: "closed" | "smile" | "open";
  sweat?: boolean; neckTilt?: number; seed?: number;
};
/** giraffe side view facing right; (x, y) ground point under the body, u = shoulder height px */
export const giraffe = (ink: Ink, x: number, y: number, u: number, o: GiraffeOpts = {}, flip = false) => {
  const done = begin(ink, x, y, u, flip), W = ink.w, kind = o.kind ?? "adult";
  const anc = kind === "ancestor", calf = kind === "calf";
  const base = anc ? "#9a6440" : "#f3e1b4", patch = anc ? "#7d4c2e" : "#b5632c", dark = "#5a3a24", hoof = "#2c2422";
  const pose = o.pose ?? "stand", ph = (o.phase ?? 0) * Math.PI * 2;
  const run = pose === "run", walk = pose === "walk";
  const legL = anc ? 0.62 : calf ? 0.66 : 0.6; // fraction of shoulder height that is leg
  const bodyTop = -1.0, bodyBot = -(legL);
  // ---- body ----
  let body: P[] = ink.curvePoly([[0.4, bodyTop - 0.02], [0.0, bodyTop + 0.08], [-0.42, bodyTop + 0.2], [-0.56, bodyTop + 0.3], [-0.54, bodyBot - 0.02], [-0.32, bodyBot + 0.03], [0.1, bodyBot], [0.4, bodyBot - 0.02], [0.54, bodyBot - 0.14], [0.52, bodyTop + 0.06]], 3);
  if (anc) body = ink.curvePoly([[0.42, bodyTop + 0.12], [0.0, bodyTop + 0.1], [-0.42, bodyTop + 0.12], [-0.56, bodyTop + 0.22], [-0.54, bodyBot - 0.02], [-0.32, bodyBot + 0.03], [0.1, bodyBot], [0.4, bodyBot - 0.02], [0.54, bodyBot - 0.14], [0.52, bodyTop + 0.16]], 3);
  const tilt = run ? -0.05 : 0;
  body = body.map(([a, b]) => [a * 0.72, b] as P);
  if (tilt) body = rotP(body, tilt, [0, bodyBot]);
  // ---- legs: [hip, knee, foot], far legs first ----
  type Leg = { hip: P; knee: P; foot: P; near: boolean; back: boolean };
  const legs: Leg[] = [];
  const mk = (hx: number, back: boolean, near: boolean, off: number) => {
    let fx = hx, fy = 0, kx = hx + (back ? -0.04 : 0.02), ky = bodyBot * 0.48;
    if (walk) { fx += 0.12 * Math.sin(ph + off); fy = -Math.max(0, Math.cos(ph + off)) * 0.06; kx = (hx + fx) / 2 + (back ? -0.05 : 0.04); ky = bodyBot * 0.48 + fy * 0.5; }
    if (run) { const s = Math.sin(ph + off), c = Math.cos(ph + off); fx = hx + 0.3 * s; fy = -Math.max(0, c) * 0.22; kx = (hx + fx) / 2 + (back ? -0.08 : 0.08) * (0.5 + 0.5 * c); ky = bodyBot * 0.5 + fy * 0.4; }
    legs.push({ hip: [hx, bodyBot + 0.06], knee: [kx, ky], foot: [fx, fy], near, back });
  };
  mk(-0.27, true, false, Math.PI * (run ? 0.15 : 1)); mk(0.3, false, false, Math.PI * (run ? 0.75 : 0)); mk(-0.33, true, true, run ? 0 : 0); mk(0.24, false, true, Math.PI * (run ? 0.6 : 1));
  const drawLeg = (l: Leg) => {
    const col = l.near ? base : "#d9c497", pts: P[] = [l.hip, l.knee, l.foot];
    const lw = calf ? 0.07 : 0.06;
    ink.line(pts, lw + W * 2, INKC, 0.3); ink.line(pts, lw, anc ? (l.near ? "#9a6440" : "#7a4e32") : col, 0.3);
    if (anc) for (let i = 0; i < 4; i++) { const t = 0.55 + i * 0.1, px = l.knee[0] + (l.foot[0] - l.knee[0]) * (t - 0.5) * 2, py = l.knee[1] + (l.foot[1] - l.knee[1]) * (t - 0.5) * 2; ink.line([[px - lw * 0.5, py], [px + lw * 0.5, py - 0.01]], 0.018, "#f3eee2", 0.1); }
    ink.shape([[l.foot[0] - lw * 0.55, l.foot[1] - 0.05], [l.foot[0] + lw * 0.65, l.foot[1] - 0.05], [l.foot[0] + lw * 0.75, l.foot[1]], [l.foot[0] - lw * 0.6, l.foot[1]]], hoof, W * 0.8);
  };
  for (const l of legs) if (!l.near) drawLeg(l);
  // ---- tail ----
  const tr: P = [-0.39, bodyTop + 0.24], sw = o.swish ?? 0;
  const tip: P = [-0.45 + sw * 0.12, bodyBot * 0.45 - 0.05];
  ink.line(ink.curve(tr, [-0.46 + sw * 0.05, (tr[1] + tip[1]) / 2], tip), 0.02, INKC, 0.3);
  ink.shape(ink.ragged(ink.ellPts(tip[0], tip[1] + 0.05, 0.035, 0.08, sw * 0.3), 0.015, 2), "#2c2422", W * 0.6);
  // ---- neck ----
  const neckLen = anc ? 0.38 : calf ? 0.62 : 0.82;
  let ang = (pose === "eat" ? -1.32 : pose === "alert" ? -1.38 : run ? -0.75 : pose === "hide" ? -1.25 : -1.12) + (o.neckTilt ?? 0); // from +x, up negative
  if (anc) ang = -0.95;
  if (walk) ang += 0.04 * Math.sin(ph * 2);
  const nb: P = [0.31, bodyTop + 0.08], ux = Math.cos(ang), uy = Math.sin(ang), px = -uy, py = ux;
  const wB = anc ? 0.12 : 0.13, wT = anc ? 0.085 : 0.065;
  const top: P = [nb[0] + ux * neckLen, nb[1] + uy * neckLen];
  const neck: P[] = [[nb[0] - px * wB - 0.06, nb[1] - py * wB + 0.02], [top[0] - px * wT, top[1] - py * wT], [top[0] + px * wT, top[1] + py * wT], [nb[0] + px * wB + 0.08, nb[1] + py * wB + 0.12]];
  const neckS = ink.curvePoly(neck, 1);
  ink.shape(neckS, base, null);
  clipTo(ink, neckS, () => patches(ink, -0.2, 1.4, -2.0, -0.6, anc ? 0.13 : 0.085, patch, (o.seed ?? 3) + 1));
  ink.line([neck[0], neck[1]], W); ink.line([neck[2], neck[3]], W);
  // mane along the back edge
  if (!anc) { const m0 = neck[0], m1 = neck[1]; const mp: P[] = []; for (let i = 0; i <= 10; i++) { const t = i / 10; mp.push([m0[0] + (m1[0] - m0[0]) * t - px * 0.012, m0[1] + (m1[1] - m0[1]) * t - py * 0.012]); } ink.line(mp, 0.025, dark, 0.3); }
  // ---- body fill + pattern ----
  ink.shape(body, base, W);
  clipTo(ink, body, () => { patches(ink, -0.7, 0.7, -1.1, -0.5, anc ? 0.14 : 0.1, patch, o.seed ?? 3); if (anc) ink.ell(0, bodyBot + 0.02, 0.5, 0.06, "#b98a62", null); });
  ink.shape(body, null, W);
  for (const l of legs) if (l.near) drawLeg(l);
  // ---- head ----
  const g = ink.g; g.save(); g.translate(top[0], top[1]);
  const front = o.look === "front";
  const hl = anc ? 0.24 : calf ? 0.21 : 0.24, hk = calf ? 1.3 : 1.15;
  if (front) {
    // looking at the viewer: broad face, ears out, two ossicones
    for (const s of [-1, 1]) ink.shape(ink.ellPts(s * 0.08 * hk, -0.03, 0.06 * hk, 0.022 * hk, s * 0.3), base, W);
    if (!anc) for (const s of [-1, 1]) { ink.line([[s * 0.03, -0.05], [s * 0.04, -0.12 * hk]], 0.02, INKC, 0.2); ink.ell(s * 0.04, -0.125 * hk, 0.016, 0.016, dark, null); }
    const face = ink.curvePoly([[-0.06 * hk, -0.06], [0.06 * hk, -0.06], [0.05 * hk, 0.1 * hk], [0.03 * hk, 0.16 * hk], [-0.03 * hk, 0.16 * hk], [-0.05 * hk, 0.1 * hk]], 2);
    ink.shape(face, base, W); clipTo(ink, face, () => patches(ink, -0.1, 0.1, -0.1, 0.05, 0.05, patch, 9));
    ink.ell(0, 0.135 * hk, 0.035 * hk, 0.03 * hk, "#d8c6a4", W * 0.7);
    for (const s of [-1, 1]) { if (o.blink) ink.arc(s * 0.033 * hk, -0.005, 0.012, 0.008, Math.PI * 1.1, Math.PI * 1.9, W); else ink.dot(s * 0.033 * hk, -0.005, 0.011 * hk); }
    if (o.brow === "worried") for (const s of [-1, 1]) ink.line([[s * 0.05 * hk, -0.025], [s * 0.018 * hk, -0.035]], W, INKC, 0.1);
  } else {
    g.rotate(pose === "eat" ? 0.25 : run ? -0.1 : 0.1);
    // ossicones + ear
    if (!anc) { ink.line([[-0.03, -0.04], [-0.04, -0.11 * hk]], 0.022, INKC, 0.2); ink.ell(-0.04, -0.115 * hk, 0.018, 0.018, dark, null); }
    ink.shape(ink.ellPts(-0.07, -0.03, 0.055 * hk, 0.02 * hk, -0.5 + (o.chew ?? 0) * 0.1), base, W);
    // tongue (curls up from the mouth)
    const tg = o.tongue ?? 0;
    if (tg > 0) { const t0: P = [hl * 0.95, 0.07], t1: P = [hl * 0.95 + 0.06 * tg, 0.02 - 0.05 * tg], t2: P = [hl * 0.95 + 0.02 * tg, -0.08 * tg]; ink.line(ink.curve(t0, t1, t2), 0.035 + W * 2, INKC, 0.2); ink.line(ink.curve(t0, t1, t2), 0.035, "#5a3a6a", 0.2); }
    const head = ink.curvePoly([[-0.05, -0.05], [hl * 0.5, -0.06], [hl, 0.0], [hl * 1.05, 0.06], [hl * 0.85, 0.09 + (o.chew ?? 0) * 0.01], [hl * 0.3, 0.07], [-0.04, 0.05]], 2);
    ink.shape(head, base, W); clipTo(ink, head, () => patches(ink, -0.1, hl * 0.6, -0.1, 0.1, 0.055, patch, 7));
    ink.ell(hl * 0.88, 0.035, 0.05, 0.045, anc ? "#7a4e32" : "#d8c6a4", W * 0.7);
    ink.dot(hl * 0.98, 0.02, 0.008);
    if (o.mouth === "smile") ink.arc(hl * 0.72, 0.06, 0.05, 0.02, 0.3, 2.5, W * 0.8);
    else if (o.mouth === "open") ink.shape(ink.ellPts(hl * 0.85, 0.075, 0.03, 0.02), "#5a1e28", W * 0.7);
    else ink.line([[hl * 0.6, 0.075], [hl * 0.98, 0.07]], W * 0.8, INKC, 0.1);
    const ex = hl * 0.25, ey = -0.02;
    if (o.blink) ink.arc(ex, ey + 0.004, 0.016, 0.01, Math.PI * 1.1, Math.PI * 1.9, W);
    else { ink.ell(ex, ey, 0.017, 0.016, "#ffffff", W * 0.7); ink.dot(ex + 0.004, ey, 0.009); }
    const b = o.brow ?? "soft", [bo, bi] = b === "worried" ? [0.008, -0.014] : b === "proud" ? [-0.012, 0.006] : b === "alert" ? [-0.012, -0.012] : [0, -0.004];
    ink.line([[ex - 0.022, ey - 0.03 + bo], [ex + 0.022, ey - 0.03 + bi]], W, INKC, 0.1);
  }
  g.restore();
  if (o.sweat) { const sx = top[0] + 0.12, sy = top[1] - 0.1; ink.shape([[sx, sy - 0.04], [sx + 0.025, sy + 0.01], [sx, sy + 0.035], [sx - 0.025, sy + 0.01]], "#9fd4ff", W * 0.8); }
  done();
  return { headX: x + (flip ? -1 : 1) * top[0] * u, headY: y + top[1] * u };
};

/** big giraffe head in profile for close-ups (facing right); (x, y) = head centre, s = head length px */
export const giraffeHead = (ink: Ink, x: number, y: number, s: number, o: { tongue?: number; blink?: boolean; chew?: number; brow?: "soft" | "worried" | "proud" } = {}) => {
  const g = ink.g; g.save(); g.translate(x, y); g.scale(s, s);
  const saved = { unit: ink.unit, w: ink.w }; ink.unit = 1 / s; ink.w = Math.max(3, s * 0.008) / s; const W = ink.w;
  const base = "#f3e1b4", patch = "#b5632c", dark = "#5a3a24";
  // neck going down-left
  const neck: P[] = [[-0.35, 0.05], [-0.1, 0.12], [-0.25, 1.4], [-0.95, 1.4]];
  ink.shape(neck, base, null); clipTo(ink, neck, () => patches(ink, -1.2, 0.1, -0.1, 1.5, 0.22, patch, 5)); ink.line([neck[0], neck[3]], W); ink.line([neck[1], neck[2]], W);
  ink.line([[-0.4, 0.05], [-1.0, 1.35]], 0.06, dark, 0.3);
  ink.line([[-0.25, -0.12], [-0.3, -0.42]], 0.06, INKC, 0.2); ink.ell(-0.3, -0.44, 0.05, 0.05, dark, null);
  ink.line([[-0.1, -0.13], [-0.12, -0.44]], 0.06, INKC, 0.2); ink.ell(-0.12, -0.46, 0.05, 0.05, dark, null);
  ink.shape(ink.ellPts(-0.42, -0.08, 0.17, 0.06, -0.4), base, W); ink.shape(ink.ellPts(-0.42, -0.08, 0.1, 0.025, -0.4), "#e6b7a0", null);
  const tg = o.tongue ?? 0;
  if (tg > 0) { const t0: P = [0.78, 0.2], t1: P = [0.78 + 0.3 * tg, 0.1 - 0.25 * tg], t2: P = [0.75 + 0.12 * tg, -0.35 * tg]; ink.line(ink.curve(t0, t1, t2), 0.11 + W * 2, INKC, 0.2); ink.line(ink.curve(t0, t1, t2), 0.11, "#5a3a6a", 0.2); ink.line(ink.curve(t0, t1, t2), 0.03, "#7a5a8a", 0.1); }
  const head = ink.curvePoly([[-0.3, -0.12], [0.2, -0.16], [0.7, -0.02], [0.9, 0.12], [0.8, 0.27 + (o.chew ?? 0) * 0.03], [0.2, 0.25], [-0.25, 0.18]], 2);
  ink.shape(head, base, W); clipTo(ink, head, () => patches(ink, -0.4, 0.45, -0.3, 0.35, 0.16, patch, 8));
  cel(ink, head, [0.15, 1], 0.55, "rgba(92,58,110,0.38)", 0.28); ink.shape(head, null, W);
  cel(ink, neck, [1, 0.2], 0.5, "rgba(92,58,110,0.34)", 0.22);
  ink.ell(0.72, 0.1, 0.18, 0.16, "#d8c6a4", W);
  ink.shape(ink.ellPts(0.83, 0.05, 0.035, 0.02, 0.4), INKC, null);
  ink.line([[0.5, 0.235], [0.86, 0.2]], W, INKC, 0.2);
  if (o.blink) ink.arc(0.12, -0.02, 0.06, 0.04, Math.PI * 1.1, Math.PI * 1.9, W * 1.3);
  else { ink.ell(0.12, -0.03, 0.06, 0.055, "#ffffff", W); ink.dot(0.135, -0.03, 0.03); }
  const b = o.brow ?? "soft", [bo, bi] = b === "worried" ? [0.03, -0.05] : b === "proud" ? [-0.04, 0.02] : [0, -0.015];
  ink.line([[0.04, -0.12 + bo], [0.2, -0.12 + bi]], W * 1.2, INKC, 0.1);
  g.restore(); ink.unit = saved.unit; ink.w = saved.w;
};

export type LionOpts = { pose?: "stalk" | "run" | "sit" | "pant" | "surprised"; phase?: number; swish?: number; blink?: boolean };
/** lioness side view facing right; u = shoulder height px */
export const lioness = (ink: Ink, x: number, y: number, u: number, o: LionOpts = {}, flip = false) => {
  const done = begin(ink, x, y, u, flip), W = Math.max(2.2, u * 0.012) / u;
  const coat = "#d6a65c", belly = "#efd6a2", dark = "#8a6234", pose = o.pose ?? "stalk", ph = (o.phase ?? 0) * Math.PI * 2;
  const low = pose === "stalk" ? 0.18 : 0, run = pose === "run";
  const bt = -1.02 + low, bb = -0.6 + low * 0.6;
  let body = ink.curvePoly([[0.5, bt + 0.05], [0.0, bt + 0.02], [-0.55, bt + 0.06], [-0.72, bt + 0.25], [-0.65, bb], [-0.2, bb + 0.06], [0.3, bb], [0.6, bb - 0.12], [0.62, bt + 0.2]], 3);
  if (run) body = rotP(body, -0.06, [0, bb]);
  // tail
  const tr: P = [-0.7, bt + 0.12], sw = o.swish ?? 0;
  const tail = ink.curve(tr, [-1.05, bt + 0.3 + sw * 0.1], [-1.2, bt - 0.05 + sw * 0.25]);
  ink.line(tail, 0.06 + W * 2, INKC, 0.3); ink.line(tail, 0.06, coat, 0.3); ink.ell(tail[tail.length - 1][0], tail[tail.length - 1][1], 0.06, 0.05, "#5a3a24", W);
  const leg = (hx: number, back: boolean, near: boolean, off: number) => {
    let fx = hx, fy = 0;
    if (run) { fx = hx + 0.35 * Math.sin(ph + off); fy = -Math.max(0, Math.cos(ph + off)) * 0.18; }
    if (pose === "stalk") fx = hx + (near ? 0.08 : -0.05);
    const kx = (hx + fx) / 2 + (back ? -0.08 : 0.04), ky = (bb + 0.05 + fy) / 2;
    const pts: P[] = [[hx, bb + 0.05], [kx, ky], [fx, fy]];
    ink.line(pts, 0.12 + W * 2, INKC, 0.3); ink.line(pts, 0.12, near ? coat : "#b98a4a", 0.3);
    ink.ell(fx + 0.04, fy - 0.04, 0.09, 0.05, near ? coat : "#b98a4a", W);
  };
  if (pose === "sit" || pose === "pant") {
    ink.shape(body, coat, W);
  } else {
    leg(-0.48, true, false, run ? 0.4 : 0); leg(0.42, false, false, run ? Math.PI * 0.9 : 0);
    ink.shape(body, coat, W);
    clipTo(ink, body, () => ink.ell(0, bb + 0.02, 0.6, 0.12, belly, null));
    ink.hatch(body, 10, 0.08, "rgba(90,60,30,0.4)", W * 0.7, Math.PI * 0.8, 0.4);
    leg(-0.58, true, true, run ? 0 : 0); leg(0.35, false, true, run ? Math.PI * 0.6 : 0);
  }
  // head
  const hc: P = run ? [0.82, bt + 0.08] : pose === "stalk" ? [0.8, bt + 0.12] : [0.72, bt - 0.12];
  for (const s of [-1, 0]) ink.shape(ink.ellPts(hc[0] - 0.08 + s * 0.08, hc[1] - 0.2, 0.06, 0.06), coat, W);
  const head = ink.curvePoly([[hc[0] - 0.18, hc[1] - 0.15], [hc[0] + 0.12, hc[1] - 0.18], [hc[0] + 0.3, hc[1] - 0.02], [hc[0] + 0.3, hc[1] + 0.1], [hc[0] + 0.05, hc[1] + 0.16], [hc[0] - 0.18, hc[1] + 0.08]], 2);
  ink.shape(head, coat, W);
  ink.ell(hc[0] + 0.22, hc[1] + 0.06, 0.1, 0.07, belly, W * 0.8);
  ink.shape(ink.ellPts(hc[0] + 0.29, hc[1] + 0.0, 0.035, 0.025), "#5a3a34", null);
  const pant = pose === "pant";
  if (pant) { ink.shape(ink.ellPts(hc[0] + 0.2, hc[1] + 0.13, 0.07, 0.05), "#5a1e28", W * 0.8); ink.shape(ink.ellPts(hc[0] + 0.2, hc[1] + 0.2, 0.035, 0.06), "#e86e78", W * 0.7); }
  const ex = hc[0] + 0.06, ey = hc[1] - 0.06;
  if (pose === "surprised") { ink.ell(ex, ey, 0.04, 0.045, "#ffffff", W); ink.dot(ex + 0.01, ey, 0.018); }
  else if (o.blink) ink.arc(ex, ey, 0.03, 0.02, Math.PI * 1.1, Math.PI * 1.9, W);
  else { ink.ell(ex, ey, 0.035, 0.022, "#f2d24a", W * 0.8); ink.dot(ex + 0.008, ey, 0.014); }
  ink.line([[ex - 0.05, ey - (pose === "stalk" ? 0.035 : 0.06)], [ex + 0.04, ey - (pose === "stalk" ? 0.06 : 0.05)]], W * 1.1, INKC, 0.1);
  void dark;
  done();
};

/** zebra side view facing right (low browser for comparisons) */
export const zebra = (ink: Ink, x: number, y: number, u: number, o: { headDown?: boolean } = {}, flip = false) => {
  const done = begin(ink, x, y, u, flip), W = Math.max(2.2, u * 0.012) / u;
  const body = ink.curvePoly([[0.45, -1.0], [0.0, -0.98], [-0.5, -0.95], [-0.6, -0.8], [-0.55, -0.52], [0.1, -0.5], [0.5, -0.55], [0.6, -0.8]], 3);
  for (const [hx, near] of [[-0.42, false], [0.42, false], [-0.5, true], [0.34, true]] as const) { const pts: P[] = [[hx, -0.55], [hx + 0.02, -0.28], [hx, 0]]; ink.line(pts, 0.1 + W * 2, INKC, 0.3); ink.line(pts, 0.1, near ? "#f4f2ee" : "#d8d4cc", 0.3); ink.shape([[hx - 0.05, -0.06], [hx + 0.06, -0.06], [hx + 0.06, 0], [hx - 0.05, 0]], "#222", W); }
  ink.line(ink.curve([-0.58, -0.92], [-0.7, -0.7], [-0.66, -0.5]), 0.03, INKC, 0.3);
  ink.shape(body, "#f4f2ee", W);
  clipTo(ink, body, () => { for (let i = -6; i < 7; i++) ink.line(ink.curve([i * 0.09, -1.05], [i * 0.09 + 0.05, -0.8], [i * 0.09 - 0.02, -0.45]), 0.04, "#222", 0.2); });
  const hd = o.headDown ? 0.55 : 0;
  const neck: P[] = [[0.35, -0.98], [0.72, -1.25 + hd], [0.85, -1.15 + hd], [0.6, -0.62]];
  ink.shape(neck, "#f4f2ee", W); clipTo(ink, neck, () => { for (let i = 0; i < 6; i++) ink.line([[0.3 + i * 0.09, -1.3 + hd], [0.45 + i * 0.09, -0.6]], 0.04, "#222", 0.1); });
  const head = ink.curvePoly([[0.68, -1.32 + hd], [0.88, -1.28 + hd], [1.08, -1.05 + hd], [1.02, -0.98 + hd], [0.78, -1.08 + hd]], 2);
  ink.shape(head, "#f4f2ee", W); ink.ell(1.03, -1.02 + hd, 0.06, 0.05, "#333", null); ink.dot(0.85, -1.22 + hd, 0.02);
  ink.shape([[0.7, -1.3 + hd], [0.74, -1.45 + hd], [0.8, -1.3 + hd]], "#f4f2ee", W);
  done();
};

/** flat-topped acacia; (x, y) = trunk base, h = height px */
export const acacia = (ink: Ink, x: number, y: number, h: number, leaf = "#7c9a4a", seed = 1, thorns = false) => {
  ink.seed(seed);
  const tw = h * 0.035;
  ink.shape([[x - tw, y], [x - tw * 0.6, y - h * 0.5], [x - h * 0.22, y - h * 0.78], [x - h * 0.2, y - h * 0.8], [x, y - h * 0.58], [x + h * 0.24, y - h * 0.82], [x + h * 0.26, y - h * 0.8], [x + tw * 0.6, y - h * 0.5], [x + tw, y]], "#6e4a32", 2.4);
  const lobes: [number, number, number, number][] = [[0, -0.86, 0.48, 0.1], [-0.28, -0.82, 0.28, 0.08], [0.3, -0.83, 0.28, 0.08], [-0.05, -0.93, 0.32, 0.07]];
  for (const [dx, dy, rx, ry] of lobes) { const pts = ink.ragged(ink.ellPts(x + dx * h, y + dy * h, rx * h, ry * h), h * 0.012, 2); ink.shape(pts, leaf, 2.4); ink.hatch(pts, 18, h * 0.03, "rgba(40,70,20,0.35)", 2, 0, 1); }
  if (thorns) for (let i = 0; i < 20; i++) { const tx = x + (ink.r() - 0.5) * h * 0.5, ty = y - h * (0.55 + ink.r() * 0.2); ink.line([[tx, ty], [tx + 10, ty - 6]], 2, "#efe8d8", 0.1); }
};
