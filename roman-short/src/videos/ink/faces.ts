// Expressive faces for the animal characters (flat-vector look). One generic face builder used by every head:
// eyes + brows + mouth + blush + cartoon extras, driven by an Emotion. Works for side heads (one eye) and face-on
// heads (two eyes). All sizes are relative to the eye radius so it scales with any head.
import { Ink, P } from "./ink2d";

export type Emotion = "happy" | "laugh" | "surprised" | "scared" | "sad" | "angry" | "smug" | "love" | "sleepy" | "confused" | "determined" | "neutral";
export type FaceGeo = {
  eyes: P[];          // eye centres (1 = side view, 2 = face-on, left then right)
  er: number;         // eye radius
  mouth: P; mw: number; // mouth centre and half width
  cheeks: P[];        // blush spots
  top: P;             // above the head, for extras ("!", "?", hearts, Zzz)
  side: boolean;      // side view: the face looks toward +x
  skin?: string;      // head colour (eyelids)
  look?: number;      // -1..1 pupils glance left / right
};
const DARK = "#3a2a26", LINE = "#5b3f33", BLUSH = "rgba(236,120,110,", TEAR = "#8fd0f2", RED = "#d8453a", PINK = "#f06a8a";

/** extra per-emotion pose hints the head can use */
export const emoPose = (e: Emotion) => ({
  ears: e === "sad" || e === "scared" ? -0.55 : e === "angry" ? -0.3 : e === "surprised" ? 0.35 : e === "sleepy" ? -0.35 : 0, // + perked, - drooped
  tilt: e === "confused" ? 0.22 : e === "love" ? -0.12 : e === "sad" ? 0.1 : e === "smug" ? -0.08 : 0,
  shake: e === "scared" ? 0.012 : 0,
});

const heart = (ink: Ink, x: number, y: number, s: number, col: string) => {
  const pts: P[] = [];
  for (let i = 0; i <= 32; i++) { const a = (i / 32) * Math.PI * 2, hx = 16 * Math.sin(a) ** 3, hy = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a); pts.push([x + (hx / 16) * s, y - (hy / 16) * s]); }
  ink.shape(pts, col, null);
};
const drop = (ink: Ink, x: number, y: number, s: number, col = TEAR) => ink.shape([[x, y - s], [x + s * 0.62, y + s * 0.15], [x, y + s * 0.75], [x - s * 0.62, y + s * 0.15]], col, null);

export const drawFace = (ink: Ink, F: FaceGeo, e: Emotion, t: number, blink = false) => {
  const r = F.er, lw = r * 0.32, g = ink.g;
  const n = F.eyes.length, inner = (i: number) => (F.side ? 1 : i === 0 ? 1 : -1); // direction toward the face centre / nose
  const look = (F.look ?? 0) + (e === "smug" ? 0.35 : e === "confused" ? -0.2 : 0);
  // ---- blush (under everything else on the face) ----
  const blush = e === "laugh" || e === "love" ? 0.55 : e === "happy" || e === "smug" ? 0.32 : e === "angry" ? 0.25 : e === "sad" ? 0.18 : 0.12;
  for (const c of F.cheeks) ink.ell(c[0], c[1], r * 1.3, r * 0.75, `${BLUSH}${blush})`, null);
  // ---- eyes ----
  F.eyes.forEach(([x, y], i) => {
    const s = inner(i);
    const closedArc = (up: boolean, k = 1) => ink.arc(x, y + (up ? r * 0.3 : -r * 0.2), r * 1.0 * k, r * 0.7 * k, up ? Math.PI * 1.1 : Math.PI * 0.1, up ? Math.PI * 1.9 : Math.PI * 0.9, lw * 1.2, LINE);
    if (blink && e !== "sleepy" && e !== "happy" && e !== "laugh" && e !== "love") { closedArc(false); return; }
    switch (e) {
      case "happy": closedArc(true); break;
      case "laugh": ink.line([[x - r * 0.9, y - r * 0.5], [x + r * 0.4 * s, y], [x - r * 0.9 + (s > 0 ? 0 : r * 1.8), y + r * 0.5]].map(([a, b]) => [a + (s > 0 ? 0 : r * 0.5), b]) as P[], lw * 1.2, LINE, 0.1); break;
      case "sleepy": closedArc(false, 0.9); break;
      case "love": heart(ink, x, y, r * 1.25, PINK); ink.ell(x - r * 0.35, y - r * 0.45, r * 0.22, r * 0.18, "#ffffff", null); break;
      case "surprised": case "scared": {
        const big = e === "scared" ? 1.35 : 1.25;
        ink.ell(x, y, r * big, r * big * 1.08, "#ffffff", null); ink.arc(x, y, r * big, r * big * 1.08, 0, Math.PI * 2, lw * 0.7, LINE);
        const pr = e === "scared" ? r * 0.38 : r * 0.62, j = e === "scared" ? Math.sin(t * 40) * r * 0.08 : 0;
        const lx = look * r * 0.45; ink.ell(x + j + lx, y + r * 0.05, pr, pr * 1.1, DARK, null); ink.ell(x + j + lx + pr * 0.35, y - pr * 0.3, pr * 0.3, pr * 0.3, "#ffffff", null);
        break; }
      case "sad": {
        ink.ell(x, y + r * 0.1, r * 0.95, r * 1.0, DARK, null); ink.ell(x + r * 0.3, y - r * 0.2, r * 0.3, r * 0.3, "#ffffff", null); ink.ell(x - r * 0.3, y + r * 0.35, r * 0.16, r * 0.16, "#ffffff", null);
        // heavy upper lid sloping down to the outside
        if (F.skin) { ink.shape([[x - r * 1.3, y - r * 1.4], [x + r * 1.3, y - r * 1.4], [x + r * 1.3 * s, y - r * 0.8], [x - r * 1.3 * s, y - r * 0.1]], F.skin, null); ink.line([[x + r * 1.1 * s, y - r * 0.75], [x - r * 1.1 * s, y - r * 0.15]], lw, LINE, 0.02); }
        break; }
      case "angry": case "determined": {
        ink.ell(x, y + r * 0.15, r * 0.95, r * 0.8, DARK, null); ink.ell(x + r * 0.28 * s, y - r * 0.05, r * 0.24, r * 0.24, "#ffffff", null);
        if (F.skin) { ink.shape([[x - r * 1.3, y - r * 1.4], [x + r * 1.3, y - r * 1.4], [x + r * 1.3 * s, y - r * (e === "angry" ? 0.05 : 0.3)], [x - r * 1.3 * s, y - r * 0.85]], F.skin, null); ink.line([[x + r * 1.1 * s, y - r * (e === "angry" ? 0.1 : 0.33)], [x - r * 1.1 * s, y - r * 0.8]], lw, LINE, 0.02); }
        break; }
      case "smug": {
        ink.ell(x + look * r, y + r * 0.2, r * 0.85, r * 0.62, DARK, null); ink.ell(x + look * r + r * 0.25, y + r * 0.05, r * 0.2, r * 0.2, "#ffffff", null);
        if (F.skin) { ink.shape([[x - r * 1.3, y - r * 1.4], [x + r * 1.3, y - r * 1.4], [x + r * 1.3, y - r * 0.05], [x - r * 1.3, y - r * 0.05]], F.skin, null); ink.line([[x - r * 1.05, y - r * 0.05], [x + r * 1.05, y - r * 0.05]], lw * 1.1, LINE, 0.02); }
        break; }
      case "confused": {
        const k = i === 0 ? 1.15 : 0.8; ink.ell(x, y, r * k, r * k * 1.05, DARK, null); ink.ell(x + r * 0.3 * k, y - r * 0.3 * k, r * 0.26 * k, r * 0.26 * k, "#ffffff", null); break; }
      default: { const lx = look * r * 0.35; ink.ell(x, y, r * 1.15, r * 1.2, "#ffffff", null); ink.ell(x + lx, y, r * 0.8, r * 0.85, DARK, null); ink.ell(x + lx + r * 0.28, y - r * 0.28, r * 0.24, r * 0.24, "#ffffff", null); }
    }
  });
  // ---- brows ----
  F.eyes.forEach(([x, y], i) => {
    const s = inner(i), by = y - r * 1.75;
    // [outer dy, mid dy, inner dy] in eye radii (negative = up)
    const B: Record<Emotion, [number, number, number] | null> = {
      happy: [0.1, -0.25, 0.1], laugh: [0.15, -0.2, 0.15], surprised: [-0.55, -0.85, -0.55], scared: [0.15, -0.55, -0.85], sad: [0.35, -0.1, -0.55],
      angry: [-0.45, 0.1, 0.65], determined: [-0.2, 0.05, 0.4], smug: i === (F.side ? 0 : 1) ? [-0.6, -0.75, -0.45] : [0.1, 0.05, 0.15], love: [0, -0.3, 0],
      sleepy: [0.35, 0.3, 0.35], confused: i === 0 ? [-0.6, -0.8, -0.4] : [0.2, 0.25, 0.45], neutral: [0, -0.15, 0],
    };
    const b = B[e]; if (!b) return;
    const w = r * 1.2, wt = e === "angry" || e === "determined" ? lw * 1.6 : lw * 1.15;
    ink.line([[x - w * s, by + b[0] * r], [x, by + b[1] * r], [x + w * s, by + b[2] * r]], wt, LINE, 0.05);
  });
  // ---- mouth ----
  const [mx, my] = F.mouth, mw = F.mw, dir = F.side ? 1 : 0;
  const mpt = (u: number, v: number): P => [mx + u * mw + (F.side ? u * mw * 0.0 : 0), my + v * mw];
  void dir;
  switch (e) {
    case "happy": ink.line(ink.curve(mpt(-1, -0.1), mpt(0, 0.55), mpt(1, -0.15)), lw * 1.1, LINE, 0.05); break;
    case "love": ink.line(ink.curve(mpt(-0.8, -0.05), mpt(0, 0.45), mpt(0.8, -0.05)), lw * 1.1, LINE, 0.05); break;
    case "laugh": {
      const m = [mpt(-1, -0.15), mpt(1, -0.2), mpt(0.6, 0.75), mpt(0, 0.95), mpt(-0.6, 0.75)];
      const sm = ink.curvePoly(m, 2); ink.shape(sm, "#7a2a34", null);
      g.save(); g.beginPath(); sm.forEach(([a, b], k) => (k ? g.lineTo(a, b) : g.moveTo(a, b))); g.closePath(); g.clip();
      ink.ell(mx + mw * 0.1, my + mw * 0.85, mw * 0.55, mw * 0.4, "#ef7f8a", null); ink.shape([[mx - mw, my - mw * 0.3], [mx + mw, my - mw * 0.3], [mx + mw, my + mw * 0.05], [mx - mw, my + mw * 0.05]], "#ffffff", null); g.restore();
      break; }
    case "surprised": ink.ell(mx, my + mw * 0.25, mw * 0.38, mw * 0.5, "#7a2a34", null); break;
    case "scared": { const pts: P[] = []; for (let k = 0; k <= 10; k++) pts.push(mpt(-0.8 + k * 0.16, 0.15 + (k % 2 ? 0.18 : -0.05))); ink.line(pts, lw, LINE, 0.02); break; }
    case "sad": ink.line(ink.curve(mpt(-0.8, 0.35), mpt(0, -0.1), mpt(0.8, 0.35)), lw * 1.1, LINE, 0.05); break;
    case "angry": {
      const m = ink.curvePoly([mpt(-0.9, 0.05), mpt(0.9, -0.05), mpt(0.85, 0.42), mpt(-0.85, 0.48)], 2); ink.shape(m, "#ffffff", null);
      ink.shape(m, null, null); ink.line([...m, m[0]], lw * 0.8, LINE, 0.02); for (const u of [-0.45, 0, 0.45]) ink.line([mpt(u, 0.02), mpt(u, 0.45)], lw * 0.6, LINE, 0.02);
      break; }
    case "determined": ink.line(ink.curve(mpt(-0.8, 0.12), mpt(0, 0.22), mpt(0.8, 0.0)), lw * 1.2, LINE, 0.05); break;
    case "smug": ink.line(ink.curve(mpt(-0.6, 0.1), mpt(0.2, 0.25), mpt(0.95, -0.25)), lw * 1.1, LINE, 0.05); break;
    case "sleepy": ink.ell(mx, my + mw * 0.2, mw * 0.25, mw * 0.2, "#7a2a34", null); break;
    case "confused": { const pts: P[] = []; for (let k = 0; k <= 12; k++) pts.push(mpt(-0.7 + k * 0.12, 0.15 + Math.sin(k * 1.2) * 0.12)); ink.line(pts, lw, LINE, 0.02); break; }
    default: ink.line([mpt(-0.6, 0.1), mpt(0.6, 0.1)], lw, LINE, 0.02);
  }
  // ---- extras ----
  const [tx, ty] = F.top, R = r;
  switch (e) {
    case "laugh": for (const [i, c] of F.eyes.entries()) drop(ink, c[0] + (inner(i) > 0 ? -R * 1.3 : R * 1.3), c[1] + R * 0.6, R * 0.45); break;
    case "scared": drop(ink, tx + R * 2.2, ty + R * 2.5, R * 0.9); drop(ink, tx - R * 2.4, ty + R * 3.2, R * 0.6);
      for (const s of [-1, 1]) for (let k = 0; k < 3; k++) ink.line([[tx + s * (R * 3.8 + k * R * 0.8), ty + R * (1.5 + k)], [tx + s * (R * 4.4 + k * R * 0.8), ty + R * (1.8 + k)]], lw * 0.8, LINE, 0.02);
      break;
    case "sad": { const c = F.eyes[F.eyes.length - 1], fall = ((t * 0.8) % 1) * R * 2.5; ink.line([[c[0] - R * 0.3, c[1] + R * 0.9], [c[0] - R * 0.35, c[1] + R * 2.2 + fall * 0.3]], R * 0.45, TEAR, 0.05); drop(ink, c[0] - R * 0.35, c[1] + R * 2.6 + fall, R * 0.5); break; }
    case "angry": { const ax = tx + R * 2.6, ay = ty + R * 0.8; for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) ink.line(ink.curve([ax + Math.cos(a) * R * 0.3, ay + Math.sin(a) * R * 0.3], [ax + Math.cos(a + 0.4) * R * 0.9, ay + Math.sin(a + 0.4) * R * 0.9], [ax + Math.cos(a + 0.78) * R * 0.35, ay + Math.sin(a + 0.78) * R * 0.35]), lw * 1.2, RED, 0.02); break; }
    case "surprised": ink.text("!", tx + R * 2.5, ty - R * 0.5 - Math.abs(Math.sin(t * 6)) * R * 0.6, R * 5, "Bangers", RED, "center", R * 0.6, "#ffffff"); break;
    case "confused": ink.text("?", tx + R * 2.6, ty - R * 0.3 + Math.sin(t * 3) * R * 0.3, R * 5, "Bangers", "#3d6fb6", "center", R * 0.6, "#ffffff"); break;
    case "love": for (const [k, d] of [[0, 0], [1, 0.33], [2, 0.66]] as const) { const u = (t * 0.6 + d) % 1; heart(ink, tx + (k - 1) * R * 2.2 + Math.sin(u * 6 + k) * R * 0.5, ty - u * R * 5, R * (0.6 + 0.4 * (1 - u)), `rgba(240,106,138,${(1 - u).toFixed(3)})`); } break;
    case "sleepy": for (const [k, d] of [[0, 0], [1, 0.33], [2, 0.66]] as const) { const u = (t * 0.4 + d) % 1; g.save(); g.globalAlpha = 1 - u; ink.text("z", tx + R * (2 + k * 0.9 + u * 1.5), ty - u * R * 4 - k * R * 0.6, R * (2.2 + k * 0.6), "Bangers", "#3d6fb6", "center", R * 0.4, "#ffffff"); g.restore(); } break;
    case "determined": { const sx = tx + R * 2.6, sy = ty + R * 0.2, k = 0.7 + 0.3 * Math.abs(Math.sin(t * 5)); ink.shape([[sx, sy - R * k], [sx + R * 0.25 * k, sy - R * 0.25 * k], [sx + R * k, sy], [sx + R * 0.25 * k, sy + R * 0.25 * k], [sx, sy + R * k], [sx - R * 0.25 * k, sy + R * 0.25 * k], [sx - R * k, sy], [sx - R * 0.25 * k, sy - R * 0.25 * k]], "#ffd33d", null); break; }
    default:
  }
};
