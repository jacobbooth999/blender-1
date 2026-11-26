// Anatomical quadrupeds for the ink look: a real skeleton per species (withers, croup, shoulder and hip joints, bone
// lengths), legs solved with IK every frame from gait-driven foot paths (feet stay planted during stance), then
// fleshed out with tapered muscle shapes, joint knobs and hooves/paws, outlined in thin wobbly ink.
//
// Anatomy notes used here (from mounted skeletons and photo reference):
//  giraffe: front legs longer than hind, back slopes ~12 deg from withers to croup, short deep trunk; elbow tucked at
//    the chest floor, "knee" (= carpus/wrist) half way down that folds the cannon BACKWARD in swing; hind stifle sits
//    high and forward at the flank, hock (heel) points BACK about 40 % up the leg; very long cannon bones; big cloven
//    hooves; neck thick at the base, held ~55-60 deg when standing, short upright mane; walk = PACE (same-side legs
//    together) with the neck swinging; gallop = hind feet land ahead of the fore feet, neck pumps down-forward.
//  lioness: digitigrade (walks on the toes), long humerus, level back, deep chest, tucked waist; stalk = shoulders
//    rise above the back, head low, belly near the ground; rotary gallop.
//  zebra (horse build): forelegs straight, hock behind, grazes with the neck down.
import { Ink, P, INKC, LOOK } from "./ink2d";
import { drawFace, emoPose, Emotion } from "./faces";

type Leg = { base: P; bones: [number, number, number, number]; fore: boolean; phase: number; near: boolean };
export type Species = {
  name: "giraffe" | "calf" | "ancestor" | "lioness" | "zebra";
  withers: P; croup: P; tail: P; shoulder: P; hip: P;
  fore: [number, number, number, number]; hind: [number, number, number, number];
  chest: number; belly: number; flank: number; rump: number;
  neckLen: number; neckW0: number; neckW1: number; neckAng: number; head: number;
  hoof: boolean;
  gaits: Record<"walk" | "gallop", { freq: number; duty: number; stride: number; lift: number; phases: [number, number, number, number] }>; // phases: LH, LF, RH, RF
  colors: { coat: string; light: string; patch?: string; dark: string; hoof: string; leg?: string };
};

export const GIRAFFE: Species = {
  name: "giraffe", withers: [0.1, -1.0], croup: [-0.36, -0.84], tail: [-0.43, -0.81], shoulder: [0.16, -0.8], hip: [-0.31, -0.75],
  fore: [0.18, 0.27, 0.27, 0.07], hind: [0.21, 0.25, 0.27, 0.07],
  chest: -0.5, belly: -0.53, flank: -0.6, rump: -0.6,
  neckLen: 0.88, neckW0: 0.27, neckW1: 0.095, neckAng: 1.02, head: 0.26, hoof: true,
  gaits: { walk: { freq: 0.8, duty: 0.66, stride: 0.5, lift: 0.07, phases: [0, 0.04, 0.5, 0.54] }, gallop: { freq: 1.55, duty: 0.36, stride: 0.85, lift: 0.16, phases: [0.08, 0.5, 0, 0.42] } },
  colors: { coat: "#f2ddb0", light: "#f7ead0", patch: "#b4612a", dark: "#4e3222", hoof: "#2c2422", leg: "#f3e4c4" },
};
export const CALF: Species = {
  ...GIRAFFE, name: "calf", neckLen: 0.62, neckW0: 0.24, neckW1: 0.1, head: 0.3,
  fore: [0.18, 0.29, 0.29, 0.07], hind: [0.21, 0.27, 0.29, 0.07], chest: -0.54, belly: -0.57, flank: -0.62, rump: -0.63,
};
export const ANCESTOR: Species = {
  ...GIRAFFE, name: "ancestor", withers: [0.15, -1.0], croup: [-0.4, -0.94], tail: [-0.47, -0.9], shoulder: [0.2, -0.78], hip: [-0.35, -0.8],
  fore: [0.2, 0.25, 0.22, 0.07], hind: [0.24, 0.26, 0.22, 0.07], chest: -0.46, belly: -0.48, flank: -0.52, rump: -0.56,
  neckLen: 0.42, neckW0: 0.26, neckW1: 0.14, neckAng: 0.72, head: 0.3,
  colors: { coat: "#8a5a3c", light: "#b58a62", dark: "#3e2a1e", hoof: "#2c2422", leg: "#7a4e34" },
};
export const LIONESS: Species = {
  name: "lioness", withers: [0.34, -1.0], croup: [-0.5, -0.97], tail: [-0.58, -0.92], shoulder: [0.34, -0.8], hip: [-0.45, -0.8],
  fore: [0.28, 0.32, 0.1, 0.07], hind: [0.3, 0.31, 0.22, 0.07],
  chest: -0.44, belly: -0.52, flank: -0.6, rump: -0.62,
  neckLen: 0.2, neckW0: 0.46, neckW1: 0.4, neckAng: 0.55, head: 0.44, hoof: false,
  gaits: { walk: { freq: 0.9, duty: 0.62, stride: 0.6, lift: 0.1, phases: [0, 0.25, 0.5, 0.75] }, gallop: { freq: 2.4, duty: 0.32, stride: 1.2, lift: 0.22, phases: [0, 0.6, 0.1, 0.5] } },
  colors: { coat: "#d8a85e", light: "#f0d8a6", dark: "#5a3a22", hoof: "#5a3a2a" },
};
export const ZEBRA: Species = {
  name: "zebra", withers: [0.36, -1.0], croup: [-0.56, -0.98], tail: [-0.62, -0.95], shoulder: [0.38, -0.74], hip: [-0.5, -0.78],
  fore: [0.22, 0.28, 0.2, 0.07], hind: [0.27, 0.29, 0.24, 0.07],
  chest: -0.5, belly: -0.53, flank: -0.56, rump: -0.62,
  neckLen: 0.55, neckW0: 0.36, neckW1: 0.2, neckAng: 0.72, head: 0.42, hoof: true,
  gaits: { walk: { freq: 0.9, duty: 0.62, stride: 0.5, lift: 0.08, phases: [0, 0.25, 0.5, 0.75] }, gallop: { freq: 2, duty: 0.35, stride: 1.2, lift: 0.2, phases: [0, 0.6, 0.1, 0.5] } },
  colors: { coat: "#f6f4ef", light: "#ffffff", dark: "#1f1d22", hoof: "#1f1d22" },
};

export type QuadOpts = {
  gait?: "stand" | "walk" | "gallop" | "stalk" | "graze" | "eat" | "drink";
  t?: number;            // seconds (drives gait, breathing, ears, tail)
  head?: "side" | "front";
  blink?: boolean; brow?: "soft" | "worried" | "proud" | "alert"; mouth?: "closed" | "smile" | "open" | "pant";
  tongue?: number; chew?: number; sweat?: boolean; neckAdd?: number; seed?: number;
  shadow?: boolean; cel?: boolean;
  /** flat-vector character look (no outlines, soft palette, fur flicks, gentle faces); default true */
  vector?: boolean;
  /** expressive face (overrides brow / mouth / blink styling) */
  emotion?: Emotion;
  /** 0..1: near hind leg kicks backward (lion defence) */
  kick?: number;
  /** -1..1: eyes glance left / right (face-on and side faces) */
  look?: number;
};

const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]];
const mul = (a: P, k: number): P => [a[0] * k, a[1] * k];
const len = (a: P) => Math.hypot(a[0], a[1]);
const rot = (p: P, a: number, c: P = [0, 0]): P => { const x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * Math.cos(a) - y * Math.sin(a), c[1] + x * Math.sin(a) + y * Math.cos(a)]; };
const smooth = (x: number) => { const u = Math.max(0, Math.min(1, x)); return u * u * (3 - 2 * u); };
/** 2-bone IK: joint between a and b with bone lengths l1, l2; bend = +1 puts the joint forward (+x), -1 backward */
const ik2 = (a: P, b: P, l1: number, l2: number, bend: number): P => {
  const d = sub(b, a), D = Math.min(len(d), l1 + l2 - 1e-4), ang = Math.atan2(d[1], d[0]);
  const c = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + D * D - l2 * l2) / (2 * l1 * D))));
  const s1 = ang - c, s2 = ang + c;
  const j1: P = add(a, [Math.cos(s1) * l1, Math.sin(s1) * l1]), j2: P = add(a, [Math.cos(s2) * l1, Math.sin(s2) * l1]);
  return (bend > 0 ? j1[0] > j2[0] : j1[0] < j2[0]) ? j1 : j2;
};
/** tapered limb segment as a closed outline */
const seg = (a: P, b: P, wa: number, wb: number): P[] => {
  const d = sub(b, a), l = len(d) || 1, n: P = [-d[1] / l, d[0] / l];
  return [add(a, mul(n, wa / 2)), add(b, mul(n, wb / 2)), add(b, mul(n, -wb / 2)), add(a, mul(n, -wa / 2))];
};
const clip = (ink: Ink, pts: P[], fn: () => void) => { const g = ink.g; g.save(); g.beginPath(); pts.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.closePath(); g.clip(); fn(); g.restore(); };
/** reticulated patches (giraffe) on a jittered hex grid, cream gaps */
const patches = (ink: Ink, x0: number, x1: number, y0: number, y1: number, cell: number, col: string, seed: number) => {
  ink.seed(seed);
  for (let y = y0, row = 0; y < y1; y += cell * 0.86, row++) for (let x = x0 + (row % 2) * cell / 2; x < x1; x += cell) {
    const cx = x + (ink.r() - 0.5) * cell * 0.15, cy = y + (ink.r() - 0.5) * cell * 0.15, pts: P[] = [];
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + Math.PI / 6 + (ink.r() - 0.5) * 0.4, r = cell * (0.47 + ink.r() * 0.06); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    ink.shape(ink.curvePoly(pts, 1), col, null);
  }
};

/** foot path for one leg at time t: offset from the leg's neutral foot point, and whether it is on the ground */
const footAt = (sp: Species, gait: "walk" | "gallop", t: number, phase: number) => {
  const g = sp.gaits[gait], p = (((t * g.freq + phase) % 1) + 1) % 1;
  if (p < g.duty) { const s = p / g.duty; return { dx: g.stride * (0.5 - s), lift: 0, stance: true, s }; }
  const s = (p - g.duty) / (1 - g.duty);
  return { dx: g.stride * (-0.5 + smooth(s)), lift: Math.sin(Math.PI * s) * g.lift, stance: false, s };
};
/** world speed (u per second) that keeps planted feet still on the ground */
export const gaitSpeed = (sp: Species, gait: "walk" | "gallop") => { const g = sp.gaits[gait]; return (g.stride * g.freq) / g.duty; };

// ---- shading helpers ----
/** cel shadow: a hard-edged darker band on the side of a shape facing `dir` (multiply), plus a thin light rim opposite */
const cel = (ink: Ink, pts: P[], dir: P, k = 0.56, dark = "rgba(92,58,110,0.34)", rim = 0.22) => {
  if (ink.vector) { const a = parseFloat(dark.split(",")[3]) || 0.3; dark = `rgba(166,96,62,${(a * 0.8).toFixed(3)})`; rim *= 1.3; }
  const g = ink.g; let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, l = Math.hypot(dir[0], dir[1]) || 1, dx = dir[0] / l, dy = dir[1] / l, R = Math.max(x1 - x0, y1 - y0) / 2 || 0.01;
  clip(ink, pts, () => {
    const gr = g.createLinearGradient(cx - dx * R, cy - dy * R, cx + dx * R, cy + dy * R);
    gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(k, "rgba(0,0,0,0)"); gr.addColorStop(Math.min(1, k + 0.025), dark); gr.addColorStop(1, dark);
    g.save(); g.globalCompositeOperation = "multiply"; g.fillStyle = gr; g.fillRect(x0 - 1, y0 - 1, x1 - x0 + 2, y1 - y0 + 2); g.restore();
    if (rim > 0) {
      const hr = g.createLinearGradient(cx - dx * R, cy - dy * R, cx + dx * R, cy + dy * R);
      hr.addColorStop(0, `rgba(255,250,235,${rim})`); hr.addColorStop(0.12, "rgba(255,250,235,0)"); hr.addColorStop(1, "rgba(255,250,235,0)");
      g.save(); g.globalCompositeOperation = "screen"; g.fillStyle = hr; g.fillRect(x0 - 1, y0 - 1, x1 - x0 + 2, y1 - y0 + 2); g.restore();
    }
  });
};
let shadowCanvas: HTMLCanvasElement | null = null;
/** draws the animal with a soft cast shadow: its real silhouette, squashed onto the ground plane and sheared away
 *  from the sun (upper left), blurred, under a soft contact shadow. Pass shadow: false to skip (e.g. close-ups). */
export { cel };
export const quad = (ink: Ink, sp: Species, x: number, y: number, u: number, o: QuadOpts = {}, flip = false) => {
  const g = ink.g;
  if (o.shadow !== false) {
    const Wc = g.canvas.width, Hc = g.canvas.height, m = g.getTransform();
    if (!shadowCanvas || shadowCanvas.width !== Wc || shadowCanvas.height !== Hc) { shadowCanvas = document.createElement("canvas"); shadowCanvas.width = Wc; shadowCanvas.height = Hc; }
    const sg = shadowCanvas.getContext("2d")!;
    sg.setTransform(1, 0, 0, 1, 0, 0); sg.clearRect(0, 0, Wc, Hc); sg.setTransform(m);
    const sink = new Ink(sg, 1); sink.wob = 0;
    quadBody(sink, sp, x, y, u, { ...o, sweat: false, cel: false }, flip);
    sg.setTransform(1, 0, 0, 1, 0, 0); sg.globalCompositeOperation = "source-in"; sg.fillStyle = o.vector === false ? "#2b1f3c" : "#4a3040"; sg.fillRect(0, 0, Wc, Hc); sg.globalCompositeOperation = "source-over";
    const gp = m.transformPoint(new DOMPoint(x, y)), sc = Math.hypot(m.a, m.b);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    // contact shadow under the body
    const cw = u * sc * (sp.name === "lioness" ? 1.25 : 0.95), cg = g.createRadialGradient(gp.x, gp.y, 0, gp.x, gp.y, cw);
    cg.addColorStop(0, "rgba(43,31,60,0.32)"); cg.addColorStop(1, "rgba(43,31,60,0)");
    g.save(); g.translate(gp.x, gp.y); g.scale(1, 0.16); g.translate(-gp.x, -gp.y); g.fillStyle = cg; g.fillRect(gp.x - cw, gp.y - cw, cw * 2, cw * 2); g.restore();
    // projected silhouette
    g.globalAlpha = o.vector === false ? 0.3 : 0.2; g.filter = `blur(${Math.max(2, 5 * Wc / 1920)}px)`;
    g.translate(gp.x, gp.y); g.transform(1, 0, -0.5, 0.34, 0, 0); g.translate(-gp.x, -gp.y);
    g.drawImage(shadowCanvas, 0, 0);
    g.restore();
  }
  return quadBody(ink, sp, x, y, u, o, flip);
};
const VEC_COLORS: Record<string, Species["colors"]> = {
  giraffe: { coat: "#f1d6a8", light: "#fbf0dc", patch: "#d48f55", dark: "#8a5a3c", hoof: "#5a3e30", leg: "#f6e6c9" },
  calf: { coat: "#f4dcb2", light: "#fcf3e2", patch: "#dda06a", dark: "#8a5a3c", hoof: "#5a3e30", leg: "#f8ead0" },
  ancestor: { coat: "#a8744e", light: "#e6c9a6", dark: "#5e3e2a", hoof: "#4a3226", leg: "#946140" },
  lioness: { coat: "#e3ad6c", light: "#f7e4c4", dark: "#7a4e30", hoof: "#7a4e30" },
  zebra: { coat: "#f7f3ec", light: "#ffffff", dark: "#4a4044", hoof: "#4a4044" },
};
/** small fur tufts: a few short curved flicks (light ones on chests, darker ones on edges) */
const flicks = (ink: Ink, cx: number, cy: number, n: number, s: number, col: string, seed: number) => {
  ink.seed(seed); const g = ink.g; g.strokeStyle = col; g.lineCap = "round"; g.lineWidth = s * 0.16;
  for (let i = 0; i < n; i++) { const x = cx + (ink.r() - 0.5) * s * 3, y = cy + (ink.r() - 0.5) * s * 2, a = -0.4 + ink.r() * 0.8; g.beginPath(); g.moveTo(x - s * 0.5, y); g.quadraticCurveTo(x - s * 0.2, y - s * 0.55 + a * s * 0.2, x, y - s * 0.05); g.quadraticCurveTo(x + s * 0.2, y - s * 0.55 - a * s * 0.2, x + s * 0.5, y); g.stroke(); }
};
const quadBody = (ink: Ink, sp0: Species, x: number, y: number, u: number, o: QuadOpts = {}, flip = false) => {
  const vec = o.vector ?? LOOK.vector ?? true, prevVec = ink.vector; ink.vector = vec;
  const sp: Species = vec && VEC_COLORS[sp0.name] ? { ...sp0, colors: VEC_COLORS[sp0.name], head: sp0.head * 1.14 } : sp0;
  const g = ink.g, t = o.t ?? 0, gait = o.gait ?? "stand", shadeOn = o.cel !== false;
  g.save(); g.translate(x, y); g.scale(flip ? -u : u, u);
  const saved = { unit: ink.unit, w: ink.w }; ink.unit = 1 / u; const W = Math.max(2.2, u * (sp.name === "lioness" || sp.name === "zebra" ? 0.012 : 0.0065)) / u; ink.w = W;
  const C = sp.colors, giraffeLike = sp.name === "giraffe" || sp.name === "calf" || sp.name === "ancestor";
  const moving = gait === "walk" || gait === "gallop" || gait === "stalk";
  const gk: "walk" | "gallop" = gait === "gallop" ? "gallop" : "walk";
  const gp = sp.gaits[gk];
  const cyc = t * gp.freq * Math.PI * 2;
  // ---- body motion ----
  let bob = 0, pitch = 0, neckSwing = 0, crouch = 0;
  if (gait === "walk") { bob = -0.012 * Math.cos(cyc * 2); neckSwing = 0.07 * Math.sin(cyc * 2 + 0.6); pitch = 0.01 * Math.sin(cyc * 2); }
  if (gait === "gallop") { bob = -0.05 * Math.sin(cyc) - 0.02; pitch = 0.07 * Math.sin(cyc + 0.8); neckSwing = (giraffeLike ? 0.2 : 0.08) * Math.sin(cyc + 2.2); }
  if (gait === "stalk") { crouch = 0.14; bob = 0.005 * Math.sin(cyc * 2); neckSwing = 0.02 * Math.sin(cyc * 2); }
  if (gait === "stand" || gait === "graze" || gait === "eat") { bob = 0.004 * Math.sin(t * 1.6); neckSwing = 0.025 * Math.sin(t * 0.7); }
  if (o.kick) pitch += 0.07 * o.kick;
  if (gait === "drink") { pitch = 0.14; neckSwing = 0.015 * Math.sin(t * 2.2); } // front end lowered over the splayed forelegs
  const tf = (p: P): P => add(rot(p, pitch, [0, -0.75]), [0, bob + crouch]);
  // ---- legs ----
  const legs: Leg[] = [
    { base: sp.hip, bones: sp.hind, fore: false, phase: gp.phases[0], near: true },
    { base: sp.shoulder, bones: sp.fore, fore: true, phase: gp.phases[1], near: true },
    { base: [sp.hip[0] + 0.03, sp.hip[1]], bones: sp.hind, fore: false, phase: gp.phases[2], near: false },
    { base: [sp.shoulder[0] + 0.03, sp.shoulder[1]], bones: sp.fore, fore: true, phase: gp.phases[3], near: false },
  ];
  const solve = (l: Leg) => {
    const base = tf(l.base), [b1, b2, b3, b4] = l.bones;
    let fx = l.base[0] + (l.fore ? 0.02 : -0.02), lift = 0, stance = true;
    if (moving) { const f = footAt(sp, gk, t, l.phase); fx += f.dx; lift = f.lift; stance = f.stance; }
    if (gait === "graze" && l.fore) fx += l.near ? 0.12 : -0.02; // a grazing stance: one foreleg forward
    if (gait === "drink" && l.fore) fx += l.near ? 0.34 : -0.2;  // drinking: forelegs splayed wide
    let foot: P = [fx, -lift];
    if (o.kick && l.near && !l.fore) { const k = o.kick; foot = [fx + (-0.62 - 0.1) * k, -0.5 * k]; stance = k < 0.2; }
    // pastern: sloped forward when planted, hoof folds back in swing
    const pa = stance ? -1.15 : l.fore ? -2.2 : -1.6;
    const fet: P = add(foot, [-Math.cos(pa) * b4 * (l.fore ? -0.4 : -0.4), -b4 * (stance ? 0.92 : 0.7)]);
    // upper bone hangs at a fixed-ish angle, swinging a little with the foot
    const swingK = (fx - l.base[0]) * 0.6;
    const upAng = l.fore ? Math.PI / 2 + 0.28 - swingK * 0.8 : Math.PI / 2 - 0.55 - swingK * 0.6; // fore: elbow behind the shoulder, hind: stifle in front of the hip
    const j1: P = add(base, [Math.cos(upAng) * b1, Math.sin(upAng) * b1]);
    const j2 = ik2(j1, fet, b2, b3, l.fore ? 1 : -1);
    return { base, j1, j2, fet, foot, fore: l.fore, near: l.near, stance };
  };
  const solved = legs.map(solve);
  const drawLeg = (L: ReturnType<typeof solve>) => {
    const far = !L.near;
    const coat = far ? shade(C.coat, 0.82) : C.coat, legc = far ? shade(C.leg ?? C.coat, 0.82) : C.leg ?? C.coat;
    const [w1, w2, w3] = giraffeLike ? (L.fore ? [0.16, 0.13, 0.045] : [0.2, 0.15, 0.045]) : sp.name === "lioness" ? (L.fore ? [0.2, 0.18, 0.1] : [0.24, 0.2, 0.09]) : (L.fore ? [0.16, 0.13, 0.055] : [0.22, 0.15, 0.055]);
    const s2 = ink.curvePoly(seg(L.j1, L.j2, w2, w3 * 1.15), 1), s3 = seg(L.j2, L.fet, w3, w3 * 0.85);
    void w1;
    ink.shape(s3, legc, W); ink.shape(s2, L.fore ? legc : coat, W);
    if (shadeOn) { cel(ink, s3, [-1, 0.25], 0.5, "rgba(92,58,110,0.28)", 0.18); cel(ink, s2, [-1, 0.35], 0.52, "rgba(92,58,110,0.3)", 0.2); ink.shape(s2, null, W); }
    if (sp.name === "ancestor") for (let i = 1; i < 4; i++) { const p = add(L.j2, mul(sub(L.fet, L.j2), i / 4)); ink.line([add(p, [-w3 * 0.5, 0]), add(p, [w3 * 0.5, -0.01])], 0.018, "#f3eee2", 0.1); }
    if (sp.name === "zebra") for (let i = 0; i < 5; i++) { const p = add(L.j1, mul(sub(L.j2, L.j1), i / 5)); ink.line([add(p, [-w2 * 0.5, 0]), add(p, [w2 * 0.5, 0.01])], 0.025, C.dark, 0.1); }
    // joint knob (carpus / hock) and fetlock
    ink.shape(ink.ellPts(L.j2[0], L.j2[1], w3 * 0.68, w3 * 0.62), legc, null); ink.arc(L.j2[0], L.j2[1], w3 * 0.68, w3 * 0.62, L.fore ? -1.2 : 1.9, L.fore ? 1.2 : 4.4, W * 0.9);
    ink.shape(ink.ellPts(L.fet[0], L.fet[1], w3 * 0.6, w3 * 0.5), legc, null); ink.arc(L.fet[0], L.fet[1], w3 * 0.6, w3 * 0.5, -1.0, 1.4, W * 0.8);
    if (sp.hoof) {
      const d = sub(L.foot, L.fet), ang = Math.atan2(d[1], d[0]) - Math.PI / 2, hw = w3 * 1.15;
      const hoof = [[-hw * 0.45, 0], [hw * 0.45, 0], [hw * 0.6, hw * 0.75], [-hw * 0.5, hw * 0.75]].map((p) => add(rot(p as P, ang), add(L.fet, mul(d, 0.55))));
      ink.shape(hoof, C.hoof, W * 0.8);
      ink.line([add(L.fet, mul(d, 0.55)), add(add(L.fet, mul(d, 0.55)), rot([0, hw * 0.7], ang))], W * 0.6, "#555", 0.1);
    } else {
      const pw = w3 * 1.5; ink.shape(ink.ellPts(L.foot[0] + pw * 0.25, L.foot[1] - pw * 0.32, pw * 0.75, pw * 0.38), legc, W);
      for (const k of [-0.25, 0.1, 0.45]) ink.line([[L.foot[0] + pw * k, L.foot[1] - pw * 0.1], [L.foot[0] + pw * k, L.foot[1] - pw * 0.3]], W * 0.6, INKC, 0.1);
    }
  };
  // upper muscle masses (drawn over the body top, under nothing)
  const muscle = (L: ReturnType<typeof solve>) => {
    const far = !L.near, coat = far ? shade(C.coat, 0.82) : C.coat;
    const top = L.fore ? add(L.base, [0.02, -0.12]) : add(L.base, [0.02, -0.08]);
    const pts = L.fore
      ? ink.curvePoly([add(top, [-0.08, 0]), add(top, [0.07, 0.02]), add(L.j1, [0.07, 0.02]), add(L.j1, [0.05, 0.1]), add(L.j1, [-0.06, 0.06]), add(L.j1, [-0.07, -0.02])], 2)
      : ink.curvePoly([add(top, [-0.12, 0]), add(top, [0.08, 0.01]), add(L.j1, [0.07, -0.02]), add(L.j1, [0.04, 0.09]), add(lerp2(L.j1, L.j2, 0.45), [-0.05, 0]), add(top, [-0.15, 0.2])], 2);
    ink.shape(pts, coat, far ? null : W);
    if (C.patch && !far) clip(ink, pts, () => patches(ink, -0.8, 0.6, -1.1, -0.3, 0.085, C.patch!, (o.seed ?? 3) + (L.fore ? 5 : 6)));
    if (shadeOn && !far) { cel(ink, pts, [-0.35, 1], 0.55); ink.shape(pts, null, W); }
    else if (C.patch && !far) ink.shape(pts, null, W);
  };
  for (const L of solved) if (!L.near) { drawLeg(L); muscle(L); }
  // ---- tail ----
  const tr = tf(sp.tail), sw = Math.sin(t * (moving ? 3 : 1.4)) * (gait === "gallop" ? 0.5 : 1);
  if (giraffeLike) {
    const tip: P = add(tr, [-0.06 + sw * 0.05, 0.42]);
    ink.line(ink.curve(tr, add(tr, [-0.06 + sw * 0.02, 0.2]), tip), 0.022, INKC, 0.2);
    ink.shape(ink.ragged(ink.ellPts(tip[0], tip[1] + 0.06, 0.035, 0.09, sw * 0.2), 0.015, 2), C.dark, W * 0.6);
  } else if (sp.name === "lioness") {
    const tc = ink.curve(tr, add(tr, [-0.3, 0.25 + sw * 0.05]), add(tr, [-0.5 + sw * 0.05, gait === "stalk" ? 0.15 : 0.0]));
    ink.line(tc, 0.07 + W * 2, INKC, 0.2); ink.line(tc, 0.07, C.coat, 0.2); const e = tc[tc.length - 1]; ink.ell(e[0], e[1], 0.06, 0.045, C.dark, W);
  } else { ink.line(ink.curve(tr, add(tr, [-0.08, 0.2]), add(tr, [-0.06 + sw * 0.04, 0.42])), 0.05, C.dark, 0.2); }
  // ---- neck (behind the trunk) ----
  const nAng = -(sp.neckAng + (o.neckAdd ?? 0) + neckSwing + (gait === "eat" ? 0.32 : 0) + (gait === "graze" ? -1.75 : 0) + (gait === "drink" ? -2.2 : 0) + (gait === "stalk" ? -0.35 : 0) + (gait === "gallop" ? -0.38 : 0));
  const nb = tf(lerp2(sp.withers, [sp.shoulder[0] + 0.14, sp.shoulder[1] + 0.06], 0.42));
  const dir: P = [Math.cos(nAng), Math.sin(nAng)], nrm: P = [-dir[1], dir[0]];
  const ntop = add(nb, mul(dir, sp.neckLen));
  const bend = giraffeLike ? 0.04 : 0.02, mid = add(add(nb, mul(dir, sp.neckLen * 0.5)), mul(nrm, bend));
  const curvePts = ink.curve(nb, mid, ntop, 18);
  const left: P[] = [], right: P[] = [];
  curvePts.forEach((p, i) => { const k = i / (curvePts.length - 1), w = sp.neckW0 + (sp.neckW1 - sp.neckW0) * Math.pow(k, 0.7); left.push(add(p, mul(nrm, -w / 2))); right.push(add(p, mul(nrm, w / 2))); });
  const neck = [...left, ...right.reverse()];
  ink.shape(neck, C.coat, null);
  if (C.patch) clip(ink, neck, () => patches(ink, -0.4, 1.6, -2.2, -0.3, giraffeLike && sp.name !== "ancestor" ? 0.075 : 0.1, C.patch!, (o.seed ?? 3) + 1));
  if (sp.name === "zebra") clip(ink, neck, () => { for (let i = 0; i < 9; i++) { const p = lerp2(nb, ntop, i / 9); ink.line([add(p, mul(nrm, -0.25)), add(p, mul(nrm, 0.25))], 0.035, C.dark, 0.1); } });
  if (shadeOn) cel(ink, neck, nrm, 0.6, "rgba(92,58,110,0.32)", 0.24);
  ink.line(left, W); ink.line(right.slice().reverse(), W);
  if (giraffeLike || sp.name === "zebra") { const hl = sp.name === "zebra" ? 0.05 : 0.03, edge = left.slice(1, -1), outer = edge.map((p, i) => add(p, mul(nrm, -hl * (0.75 + 0.5 * ((i * 7) % 3) / 2)))); ink.shape([...edge, ...outer.reverse()], sp.name === "zebra" ? C.dark : "#7a4a2a", W * 0.8); }
  // ---- trunk ----
  const [wx, wy] = sp.withers, [cx, cy] = sp.croup;
  const LION: P[] = [[0.3, -1.02], [0.05, -0.95], [-0.3, -0.97], [-0.48, -0.96], [-0.6, -0.86], [-0.62, -0.7], [-0.52, -0.6], [-0.35, -0.58], [0.0, -0.5], [0.28, -0.44], [0.46, -0.52], [0.5, -0.72], [0.44, -0.92]];
  const trunk = sp.name === "lioness" ? ink.curvePoly(LION.map((p, i) => (gait === "stalk" && (i === 0 || i === 12) ? add(p, [0, -0.1]) : i === 1 && gait === "stalk" ? add(p, [0, 0.03]) : p)).map(tf), 3) : ink.curvePoly([
    [wx - 0.02, wy], [wx * 0.4 + cx * 0.6, wy * 0.4 + cy * 0.6 - 0.005], [cx, cy], [cx - 0.08, cy + 0.05], [cx - 0.1, sp.rump], [sp.hip[0] + 0.02, sp.flank],
    [(sp.hip[0] + sp.shoulder[0]) / 2, sp.belly], [sp.shoulder[0] - 0.04, sp.chest], [sp.shoulder[0] + 0.08, sp.chest - 0.03], [sp.shoulder[0] + 0.16, sp.chest - 0.14], [sp.shoulder[0] + 0.17, sp.shoulder[1] - 0.06], [sp.shoulder[0] + 0.08, wy + 0.1],
  ].map((p, i) => (gait === "stalk" && (i === 0 || i === 11) ? add(p as P, [0, -0.12]) : (p as P))).map(tf), 3);
  { const br = moving ? 1 : 1 + 0.014 * Math.sin(t * 1.7), st = gait === "gallop" ? 1 + 0.035 * Math.sin(cyc + 0.8) : 1; for (const p of trunk) { p[1] = -0.75 + (p[1] + 0.75) * br; p[0] *= st; } }
  for (const L of solved) if (L.near) muscle(L);
  ink.shape(trunk, C.coat, W);
  clip(ink, trunk, () => {
    if (C.patch) patches(ink, -0.9, 0.7, -1.15, -0.35, giraffeLike ? 0.11 : 0.14, C.patch, o.seed ?? 3);
    if (sp.name === "zebra") for (let i = -7; i < 8; i++) ink.line(ink.curve([i * 0.08, -1.1], [i * 0.08 + 0.05, -0.8], [i * 0.08 - 0.03, -0.45]), 0.04, C.dark, 0.2);
    if (sp.name === "lioness" || sp.name === "ancestor") ink.ell(-0.05, sp.belly + 0.02, 0.6, 0.1, C.light, null);
    if (vec && giraffeLike && sp.name !== "ancestor") { const c = tf([sp.shoulder[0] + 0.1, sp.chest - 0.06]); ink.ell(c[0], c[1], 0.12, 0.1, C.light, null, -0.3); ink.ell(-0.05, sp.belly + 0.03, 0.3, 0.05, C.light, null); }
  });
  if (shadeOn) cel(ink, trunk, [0.15, 1], 0.52, "rgba(92,58,110,0.42)", 0.3);
  ink.shape(trunk, null, W);
  if (sp.name === "lioness" && !vec) ink.hatch(trunk, 10, 0.08, "rgba(90,60,30,0.35)", W * 0.7, Math.PI * 0.8, 0.4);
  if (vec) { const c = tf([sp.shoulder[0] + 0.09, sp.chest - 0.12]); flicks(ink, c[0], c[1], 3, 0.035, "rgba(255,250,238,0.95)", 5); const r2 = tf([sp.croup[0] - 0.02, sp.croup[1] + 0.12]); flicks(ink, r2[0], r2[1], 2, 0.03, shade(C.coat, 0.78), 6); }
  for (const L of solved) if (L.near) drawLeg(L);
  // ---- head ----
  const out = headAt(ink, sp, ntop, nAng, o, W, t, gait, neckSwing * 0.6, shadeOn);
  if (o.sweat) { const sx = out[0] + 0.12, sy = out[1] - 0.14; ink.shape([[sx, sy - 0.04], [sx + 0.025, sy + 0.01], [sx, sy + 0.035], [sx - 0.025, sy + 0.01]], "#9fd4ff", W * 0.8); }
  g.restore(); ink.unit = saved.unit; ink.w = saved.w; ink.vector = prevVec;
  return { headX: x + (flip ? -1 : 1) * out[0] * u, headY: y + out[1] * u };
};
const lerp2 = (a: P, b: P, k: number): P => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const shade = (hex: string, k: number) => { const n = parseInt(hex.slice(1), 16); const c = (s: number) => Math.round(((n >> s) & 255) * k).toString(16).padStart(2, "0"); return `#${c(16)}${c(8)}${c(0)}`; };

/** head at the neck tip; returns the head centre */
const headAt = (ink: Ink, sp: Species, at: P, nAng: number, o: QuadOpts, W: number, t: number, gait: string, stab = 0, shadeOn = true): P => {
  const g = ink.g, C = sp.colors, H = sp.head, giraffeLike = sp.name === "giraffe" || sp.name === "calf" || sp.name === "ancestor";
  g.save(); g.translate(at[0], at[1]);
  if (o.head === "front" && giraffeLike) {
    const k = H / 0.26, ep = o.emotion ? emoPose(o.emotion) : null;
    if (ep) { g.rotate(ep.tilt); g.translate(Math.sin(t * 50) * ep.shake, 0); }
    const earA = ep ? -ep.ears * 0.9 : 0;
    for (const s of [-1, 1]) { ink.shape(ink.ellPts(s * 0.1 * k, -0.02 * k + (ep ? -ep.ears * 0.02 * k : 0), 0.075 * k, 0.026 * k, s * (0.35 - earA) + Math.sin(t * 2 + s) * 0.06), C.coat, W); ink.shape(ink.ellPts(s * 0.1 * k, -0.02 * k, 0.05 * k, 0.012 * k, s * 0.35), "#e6b7a0", null); }
    if (sp.name !== "ancestor") for (const s of [-1, 1]) { ink.line([[s * 0.035 * k, -0.05 * k], [s * 0.045 * k, -0.13 * k]], 0.024 * k, C.coat, 0.2); ink.line([[s * 0.035 * k, -0.05 * k], [s * 0.045 * k, -0.13 * k]], W, INKC, 0.1); ink.ell(s * 0.046 * k, -0.135 * k, 0.02 * k, 0.018 * k, C.dark, null); }
    const face = ink.curvePoly([[-0.075 * k, -0.07 * k], [0.075 * k, -0.07 * k], [0.065 * k, 0.08 * k], [0.04 * k, 0.17 * k], [-0.04 * k, 0.17 * k], [-0.065 * k, 0.08 * k]], 2);
    ink.shape(face, C.coat, W); if (shadeOn) cel(ink, face, [0.8, 0.6], 0.62, "rgba(92,58,110,0.28)", 0.22); if (C.patch) clip(ink, face, () => { ink.shape(ink.curvePoly([[-0.03 * k, -0.06 * k], [0.03 * k, -0.06 * k], [0.02 * k, 0.03 * k], [-0.02 * k, 0.03 * k]], 2), C.patch!, null); });
    ink.ell(0, 0.145 * k, 0.045 * k, 0.034 * k, shade(C.coat, 0.88), W * 0.7);
    for (const s of [-1, 1]) ink.ell(s * 0.017 * k, 0.15 * k, 0.007 * k, 0.005 * k, INKC, null);
    if (o.emotion) {
      drawFace(ink, { eyes: [[-0.045 * k, -0.005 * k], [0.045 * k, -0.005 * k]], er: 0.018 * k, mouth: [0, 0.158 * k], mw: 0.027 * k, cheeks: [[-0.062 * k, 0.05 * k], [0.062 * k, 0.05 * k]], top: [0, -0.16 * k], side: false, skin: C.coat, look: o.look }, o.emotion, t, o.blink);
      g.restore(); return [at[0], at[1] + 0.05];
    }
    for (const s of [-1, 1]) {
      const ex = s * 0.045 * k, ey = -0.005 * k;
      const calmF = !o.brow || o.brow === "soft" || o.brow === "proud";
      if (o.blink || (ink.vector && calmF)) ink.arc(ex, ey, 0.017 * k, 0.011 * k, Math.PI * 1.08, Math.PI * 1.92, W * 1.5);
      else if (ink.vector) { ink.ell(ex, ey, 0.016 * k, 0.018 * k, "#3a2a26", null); ink.ell(ex + 0.006 * k, ey - 0.007 * k, 0.005 * k, 0.005 * k, "#ffffff", null); }
      else { ink.ell(ex, ey, 0.019 * k, 0.017 * k, "#ffffff", W * 0.7); ink.dot(ex, ey + 0.002 * k, 0.011 * k); for (const q of [-0.4, 0, 0.4]) ink.line([[ex + s * 0.012 * k + q * 0.01 * k, ey - 0.016 * k], [ex + s * 0.02 * k + q * 0.015 * k, ey - 0.026 * k]], W * 0.6, INKC, 0.05); }
      const [bo, bi] = o.brow === "worried" ? [0.006, -0.012] : o.brow === "proud" ? [-0.01, 0.006] : o.brow === "alert" ? [-0.012, -0.012] : [0, -0.003];
      ink.line([[ex + s * 0.022 * k, ey - 0.03 * k + bo * k], [ex - s * 0.018 * k, ey - 0.03 * k + bi * k]], W, INKC, 0.05);
    }
    g.restore(); return [at[0], at[1] + 0.05];
  }
  // side head: giraffe faces down-forward roughly perpendicular to the neck; lion / zebra by their build
  let ha = giraffeLike ? nAng + Math.PI / 2 - 0.25 : sp.name === "lioness" ? 0.18 + nAng * 0.3 + (gait === "stalk" ? 0.25 : 0) : nAng + Math.PI / 2 - 0.1;
  if (gait === "graze" || gait === "drink") ha = nAng + 0.6;
  if (gait === "eat") ha -= 0.35;
  if (sp.name !== "lioness") ha += stab; // head stabilisation: the head stays steadier than the swinging neck
  g.rotate(ha); // head local: +x along the face (toward the nose), y down
  const L = H;
  if (giraffeLike) {
    const epS = o.emotion ? emoPose(o.emotion) : null;
    if (epS) { g.rotate(epS.tilt * 0.6); g.translate(Math.sin(t * 50) * epS.shake, 0); }
    const flick = (Math.sin(t * 1.3) > 0.97 ? 0.4 : 0) + (epS ? epS.ears * 0.9 : 0);
    ink.shape(ink.ellPts(-L * 0.18, -L * 0.2, L * 0.24, L * 0.08, -0.5 - flick), C.coat, W); ink.shape(ink.ellPts(-L * 0.18, -L * 0.2, L * 0.15, L * 0.035, -0.5 - flick), "#e6b7a0", null);
    if (sp.name !== "ancestor") for (const dx of [-0.05, 0.05]) { const b: P = [L * (0.05 + dx), -L * 0.22], tp: P = [L * (dx - 0.02), -L * 0.55]; ink.line([b, tp], L * 0.09, C.coat, 0.2); ink.line([b, tp], W, INKC, 0.1); ink.ell(tp[0], tp[1], L * 0.07, L * 0.06, C.dark, null); }
    const tg = o.tongue ?? 0;
    if (tg > 0) { const t0: P = [L * 0.98, L * 0.24], t1: P = [L * (1.05 + 0.3 * tg), L * (0.1 - 0.3 * tg)], t2: P = [L * (0.95 + 0.15 * tg), -L * 0.5 * tg]; ink.line(ink.curve(t0, t1, t2), L * 0.11 + W * 2, INKC, 0.2); ink.line(ink.curve(t0, t1, t2), L * 0.11, "#4c2d5e", 0.2); }
    const chew = (o.chew ?? 0) * L * 0.02;
    const head = ink.curvePoly([[-L * 0.22, -L * 0.18], [L * 0.2, -L * 0.22], [L * 0.7, -L * 0.12], [L * 1.02, 0], [L * 1.04, L * 0.14], [L * 0.95, L * 0.28 + chew], [L * 0.55, L * 0.28], [L * 0.1, L * 0.3], [-L * 0.2, L * 0.2]], 2);
    ink.shape(head, C.coat, W);
    if (C.patch) clip(ink, head, () => patches(ink, -L * 0.4, L * 0.45, -L * 0.4, L * 0.4, L * 0.24, C.patch!, 8));
    if (shadeOn) { cel(ink, head, [0.1, 1], 0.6, "rgba(92,58,110,0.3)", 0.25); ink.shape(head, null, W); }
    ink.shape(ink.curvePoly([[L * 0.72, -L * 0.06], [L * 1.04, L * 0.02], [L * 1.03, L * 0.2], [L * 0.8, L * 0.24]], 2), shade(C.coat, 0.9), W * 0.7);
    ink.shape(ink.ellPts(L * 0.95, L * 0.06, L * 0.04, L * 0.022, 0.5), INKC, null);
    if (o.emotion) { drawFace(ink, { eyes: [[L * 0.28, -L * 0.06]], er: L * 0.06, mouth: [L * 0.8, L * 0.235], mw: L * 0.14, cheeks: [[L * 0.42, L * 0.09]], top: [L * 0.15, -L * 0.45], side: true, skin: C.coat }, o.emotion, t, o.blink); g.restore(); return at; }
    if (o.mouth === "smile") ink.arc(L * 0.78, L * 0.2, L * 0.16, L * 0.06, 0.3, 2.6, W); else ink.line([[L * 0.62, L * 0.25], [L * 1.0, L * 0.22]], W, INKC, 0.1);
    const ex = L * 0.28, ey = -L * 0.06;
    const calm = !o.brow || o.brow === "soft" || o.brow === "proud";
    if (o.blink || (ink.vector && calm && gait !== "gallop")) ink.arc(ex, ey + L * 0.01, L * 0.065, L * 0.04, Math.PI * 1.08, Math.PI * 1.92, W * 1.5, ink.vector ? "#4a3428" : INKC);
    else if (ink.vector) { ink.ell(ex, ey, L * 0.06, L * 0.065, "#3a2a26", null); ink.ell(ex + L * 0.02, ey - L * 0.025, L * 0.018, L * 0.018, "#ffffff", null); }
    else { ink.ell(ex, ey, L * 0.07, L * 0.062, "#ffffff", W * 0.8); ink.dot(ex + L * 0.012, ey + L * 0.005, L * 0.04); for (const q of [0, 1, 2]) ink.line([[ex + L * (0.0 + q * 0.03), ey - L * 0.06], [ex + L * (0.02 + q * 0.04), ey - L * 0.1]], W * 0.6, INKC, 0.05); }
    if (ink.vector) { ink.ell(ex + L * 0.05, ey + L * 0.11, L * 0.06, L * 0.035, "rgba(232,140,120,0.35)", null); flicks(ink, -L * 0.05, L * 0.16, 2, L * 0.07, "rgba(255,250,238,0.9)", 9); }
    const [bo, bi] = o.brow === "worried" ? [0.03, -0.05] : o.brow === "proud" ? [-0.04, 0.02] : o.brow === "alert" ? [-0.05, -0.05] : [0, -0.01];
    ink.line([[ex - L * 0.08, ey - L * 0.13 + bo * L], [ex + L * 0.08, ey - L * 0.13 + bi * L]], W * 1.1, INKC, 0.05);
  } else if (sp.name === "lioness") {
    for (const dx of [-0.12, 0.02]) ink.shape(ink.ellPts(L * dx, -L * 0.36, L * 0.11, L * 0.1), C.coat, W);
    ink.ell(-L * 0.12, -L * 0.36, L * 0.05, L * 0.04, C.dark, null);
    const head = ink.curvePoly([[-L * 0.3, -L * 0.25], [L * 0.2, -L * 0.36], [L * 0.62, -L * 0.18], [L * 0.75, L * 0.02], [L * 0.7, L * 0.2], [L * 0.3, L * 0.3], [-L * 0.25, L * 0.2]], 2);
    ink.shape(head, C.coat, W);
    if (shadeOn) { cel(ink, head, [0.1, 1], 0.62, "rgba(92,58,110,0.3)", 0.25); ink.shape(head, null, W); }
    ink.shape(ink.ellPts(L * 0.6, L * 0.12, L * 0.17, L * 0.12), C.light, W * 0.8);
    ink.shape(ink.ellPts(L * 0.72, L * 0.0, L * 0.06, L * 0.045), "#5a3a34", null);
    if (o.emotion) { drawFace(ink, { eyes: [[L * 0.3, -L * 0.1]], er: L * 0.055, mouth: [L * 0.56, L * 0.25], mw: L * 0.13, cheeks: [[L * 0.42, L * 0.07]], top: [L * 0.1, -L * 0.5], side: true, skin: C.coat }, o.emotion, t, o.blink); g.restore(); return at; }
    if (o.mouth === "pant" || o.mouth === "open") { ink.shape(ink.ellPts(L * 0.55, L * 0.27, L * 0.14, L * 0.09), "#5a1e28", W * 0.8); ink.shape(ink.ellPts(L * 0.55, L * 0.36, L * 0.06, L * 0.1), "#e86e78", W * 0.7); }
    const ex = L * 0.3, ey = -L * 0.1;
    if (o.blink) ink.arc(ex, ey, L * 0.06, L * 0.03, Math.PI * 0.1, Math.PI * 0.9, W);
    else if (ink.vector && (o.brow ?? "soft") === "soft") ink.arc(ex, ey, L * 0.065, L * 0.04, Math.PI * 1.08, Math.PI * 1.92, W * 1.5);
    else if (ink.vector) { ink.ell(ex, ey, L * 0.055, L * 0.05, "#3a2a26", null); ink.ell(ex + L * 0.018, ey - L * 0.02, L * 0.015, L * 0.015, "#ffffff", null); }
    else { ink.ell(ex, ey, L * 0.07, L * 0.045, "#f2d24a", W * 0.8); ink.dot(ex + L * 0.015, ey, L * 0.028); }
    const [bo, bi] = o.brow === "worried" ? [0.03, -0.05] : o.brow === "alert" ? [-0.06, -0.06] : [-0.01, 0.04];
    ink.line([[ex - L * 0.09, ey - L * 0.1 + bo * L], [ex + L * 0.09, ey - L * 0.1 + bi * L]], W * 1.1, INKC, 0.05);
  } else {
    ink.shape([[-L * 0.15, -L * 0.15], [-L * 0.05, -L * 0.42], [L * 0.05, -L * 0.15]], C.coat, W);
    const head = ink.curvePoly([[-L * 0.2, -L * 0.18], [L * 0.3, -L * 0.2], [L * 0.85, -L * 0.08], [L * 1.0, L * 0.08], [L * 0.9, L * 0.22], [L * 0.3, L * 0.22], [-L * 0.18, L * 0.18]], 2);
    ink.shape(head, C.coat, W); clip(ink, head, () => { for (let i = 0; i < 6; i++) ink.line([[L * (0.0 + i * 0.12), -L * 0.3], [L * (0.05 + i * 0.12), L * 0.3]], L * 0.045, C.dark, 0.1); });
    ink.shape(ink.ellPts(L * 0.9, L * 0.07, L * 0.12, L * 0.13), "#333", W * 0.8); ink.dot(L * 0.25, -L * 0.05, L * 0.04);
  }
  g.restore();
  return at;
};
