// Stick-figure people for the ink explainer look: big white round head, single ink line limbs, emotion in the
// brows and mouth, scribbled hair for ancient people, filled clothes for later eras. Our own cast designs.
import { Ink, P, INKC } from "./ink2d";

export type Pose = "stand" | "wave" | "point" | "cheer" | "shrug" | "walk" | "run" | "sit" | "sofa" | "kneel" | "throw" | "hug" | "hips";
export type Face = "neutral" | "happy" | "laugh" | "worried" | "scared" | "angry" | "determined" | "squeeze" | "content" | "awe";
export type Hair = "messy" | "messyLong" | "short" | "bald" | "none";
export type Hat = "none" | "tophat" | "flatcap" | "souwester" | "cap";
export type Outfit = "none" | "fur" | "furDress" | "modern" | "coat" | "tweed" | "oilskin";
export type Fig = {
  x: number; y: number; h: number; pose?: Pose; face?: Face; hair?: Hair; hairCol?: string; hat?: Hat; hatCol?: string;
  outfit?: Outfit; top?: string; bottom?: string; shoes?: string; look?: number; flip?: boolean; seed?: number;
  moustache?: string; beard?: string; lean?: number; prop?: "spear" | "bone" | "shotgun" | "rope" | "none";
};

const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
const sc = (a: P, k: number): P => [a[0] * k, a[1] * k];
/** joint targets in units of the figure height, x toward screen right (mirrored when flip) */
type Rig = { hip: number; lHand: P; rHand: P; lElbow: P; rElbow: P; lFoot: P; rFoot: P; lKnee: P; rKnee: P };
const RIGS: Record<Pose, Rig> = {
  stand: { hip: 0.45, lHand: [-0.12, 0.3], rHand: [0.12, 0.3], lElbow: [-0.09, 0.15], rElbow: [0.09, 0.15], lFoot: [-0.08, 0.45], rFoot: [0.08, 0.45], lKnee: [-0.05, 0.23], rKnee: [0.05, 0.23] },
  hips: { hip: 0.45, lHand: [-0.07, 0.2], rHand: [0.07, 0.2], lElbow: [-0.17, 0.1], rElbow: [0.17, 0.1], lFoot: [-0.1, 0.45], rFoot: [0.1, 0.45], lKnee: [-0.06, 0.23], rKnee: [0.06, 0.23] },
  wave: { hip: 0.45, lHand: [-0.12, 0.3], rHand: [0.2, -0.24], lElbow: [-0.09, 0.15], rElbow: [0.2, -0.04], lFoot: [-0.08, 0.45], rFoot: [0.08, 0.45], lKnee: [-0.05, 0.23], rKnee: [0.05, 0.23] },
  point: { hip: 0.45, lHand: [-0.1, 0.3], rHand: [0.33, -0.02], lElbow: [-0.08, 0.15], rElbow: [0.17, 0.0], lFoot: [-0.08, 0.45], rFoot: [0.08, 0.45], lKnee: [-0.05, 0.23], rKnee: [0.05, 0.23] },
  cheer: { hip: 0.45, lHand: [-0.2, -0.26], rHand: [0.2, -0.26], lElbow: [-0.17, -0.07], rElbow: [0.17, -0.07], lFoot: [-0.1, 0.45], rFoot: [0.1, 0.45], lKnee: [-0.06, 0.23], rKnee: [0.06, 0.23] },
  shrug: { hip: 0.45, lHand: [-0.24, 0.02], rHand: [0.24, 0.02], lElbow: [-0.13, 0.13], rElbow: [0.13, 0.13], lFoot: [-0.08, 0.45], rFoot: [0.08, 0.45], lKnee: [-0.05, 0.23], rKnee: [0.05, 0.23] },
  walk: { hip: 0.44, lHand: [-0.14, 0.27], rHand: [0.14, 0.26], lElbow: [-0.09, 0.14], rElbow: [0.1, 0.14], lFoot: [-0.14, 0.45], rFoot: [0.16, 0.45], lKnee: [-0.05, 0.22], rKnee: [0.1, 0.22] },
  run: { hip: 0.42, lHand: [-0.2, 0.1], rHand: [0.2, 0.05], lElbow: [-0.14, 0.18], rElbow: [0.18, 0.18], lFoot: [-0.26, 0.38], rFoot: [0.2, 0.47], lKnee: [-0.08, 0.28], rKnee: [0.18, 0.2] },
  sit: { hip: 0.1, lHand: [-0.06, 0.32], rHand: [0.12, 0.32], lElbow: [-0.1, 0.18], rElbow: [0.12, 0.17], lFoot: [-0.18, 0.1], rFoot: [0.2, 0.1], lKnee: [-0.2, -0.03], rKnee: [0.22, -0.02] },
  sofa: { hip: 0.24, lHand: [-0.06, 0.32], rHand: [0.1, 0.3], lElbow: [-0.11, 0.18], rElbow: [0.12, 0.17], lFoot: [-0.06, 0.24], rFoot: [0.1, 0.24], lKnee: [-0.08, 0.0], rKnee: [0.12, 0.0] },
  kneel: { hip: 0.26, lHand: [0.1, 0.3], rHand: [0.22, 0.28], lElbow: [0.0, 0.17], rElbow: [0.16, 0.15], lFoot: [-0.2, 0.26], rFoot: [0.14, 0.26], lKnee: [-0.02, 0.26], rKnee: [0.15, 0.03] },
  throw: { hip: 0.45, lHand: [0.2, 0.08], rHand: [-0.2, -0.2], lElbow: [0.12, 0.12], rElbow: [-0.15, 0.0], lFoot: [-0.1, 0.45], rFoot: [0.14, 0.45], lKnee: [-0.06, 0.23], rKnee: [0.08, 0.23] },
  hug: { hip: 0.12, lHand: [0.22, 0.2], rHand: [0.26, 0.24], lElbow: [0.08, 0.2], rElbow: [0.14, 0.24], lFoot: [-0.16, 0.12], rFoot: [0.2, 0.12], lKnee: [-0.2, 0.0], rKnee: [0.22, 0.0] },
};

export const figure = (ink: Ink, f: Fig) => {
  ink.seed(f.seed ?? 7);
  const g = ink.g, H = f.h, R = 0.14 * H, pose = f.pose ?? "stand", rig = RIGS[pose], fl = f.flip ? -1 : 1;
  const W = Math.max(2.4, H * 0.0105);
  const X = (p: P): P => [f.x + p[0] * H * fl, f.y - H + p[1] * H];
  // body frame: y measured from the top of the head (0) down to the sole (1)
  const lean = (f.lean ?? (pose === "run" ? 0.06 : 0)) * fl;
  const hipY = 1 - rig.hip, neckY = 2 * R / H + 0.01;
  const hip: P = X([lean * 0.2, hipY]);
  const neck: P = X([lean, neckY]);
  const head: P = X([lean * 1.1, R / H]);
  const shoulder: P = X([lean * 0.9, neckY + 0.05]);
  const S = (p: P): P => add(shoulder, [p[0] * H * fl, p[1] * H]);
  const Hp = (p: P): P => add(hip, [p[0] * H * fl, p[1] * H - rig.hip * H + (1 - hipY) * H - (1 - hipY) * H]);
  // limbs relative to shoulder / hip
  const limb = (a: P, k: P, b: P) => [a, k, b] as P[];
  const lArm = limb(shoulder, S(rig.lElbow), S(rig.lHand)), rArm = limb(shoulder, S(rig.rElbow), S(rig.rHand));
  const legRel = (p: P): P => add(hip, [p[0] * H * fl, p[1] * H]);
  const lLeg = limb(hip, legRel(rig.lKnee), legRel(rig.lFoot)), rLeg = limb(hip, legRel(rig.rKnee), legRel(rig.rFoot));
  void Hp; void sc;
  const outfit = f.outfit ?? "none";
  const clothLimb = (pts: P[], col: string, wid: number) => { g.lineCap = "round"; g.lineJoin = "round"; ink.line(pts, wid + W * 2, INKC, 0.5); ink.line(pts, wid, col, 0.5); };
  const shoes = f.shoes;

  // props behind
  if (f.prop === "spear") { const hnd = rArm[2]; ink.line([[hnd[0] + 4 * fl, f.y + 2], [hnd[0] - 4 * fl, f.y - H * 1.15]], W * 1.6, "#7a5232"); ink.shape([[hnd[0] - 4 * fl, f.y - H * 1.15], [hnd[0] - 4 * fl - 9, f.y - H * 1.06], [hnd[0] - 4 * fl, f.y - H * 1.25], [hnd[0] - 4 * fl + 9, f.y - H * 1.06]], "#9aa0a6", W * 0.8); }
  if (f.prop === "shotgun") { const hnd = rArm[2]; ink.line([[hnd[0], hnd[1] + 6], [hnd[0] + 0.05 * H * fl, hnd[1] - H * 0.55]], W * 1.8, "#4a3a2c"); }

  // legs
  if (outfit === "modern" || outfit === "tweed" || outfit === "oilskin") {
    const col = f.bottom ?? "#3c4f78", wid = H * 0.05;
    clothLimb(lLeg, col, wid); clothLimb(rLeg, col, wid);
  } else { ink.line(lLeg, W); ink.line(rLeg, W); }
  for (const lg of [lLeg, rLeg]) {
    const ft = lg[2], dir = lg[2][0] >= hip[0] ? 1 : -1;
    if (shoes) ink.shape(ink.ellPts(ft[0] + dir * H * 0.022, ft[1] - H * 0.012, H * 0.038, H * 0.02), shoes, W * 0.8);
  }
  // torso / clothes
  const torso: P[] = [neck, hip];
  if (outfit === "fur" || outfit === "furDress") {
    const seated = pose === "sit" || pose === "hug" || pose === "kneel" || pose === "sofa";
    const top = add(shoulder, [-0.07 * H * fl, -0.005 * H]), top2 = add(shoulder, [0.06 * H * fl, 0.05 * H]);
    const len = seated ? 0.0 : outfit === "furDress" ? 0.13 : 0.07;
    const pelt: P[] = [top, add(shoulder, [0.0 * H * fl, -0.015 * H]), top2, add(hip, [0.085 * H * fl, len * H]), add(hip, [0.0 * H * fl, (len + 0.025) * H]), add(hip, [-0.085 * H * fl, len * H])];
    const sm = ink.curvePoly(pelt);
    const rag = ink.ragged(sm, H * 0.012, 2);
    ink.line(torso, W);
    ink.shape(rag, f.top ?? "#8a5a34", W * 0.9);
    ink.hatch(rag, 26, H * 0.03, "rgba(50,30,20,0.55)", W * 0.55, Math.PI / 2, 0.6);
  } else if (outfit === "modern" || outfit === "coat" || outfit === "tweed" || outfit === "oilskin") {
    const col = f.top ?? (outfit === "coat" ? "#2f4a3c" : outfit === "tweed" ? "#8a6a3e" : outfit === "oilskin" ? "#e7b43a" : "#e07a3a");
    const low = outfit === "coat" ? 0.2 : outfit === "oilskin" ? 0.12 : 0.03, wT = outfit === "coat" ? 0.1 : 0.085;
    const body: P[] = [add(shoulder, [-wT * H * fl, 0]), add(shoulder, [wT * H * fl, 0]), add(hip, [(wT + 0.01) * H * fl, low * H]), add(hip, [-(wT + 0.01) * H * fl, low * H])];
    // sleeves under the body
    for (const arm of [lArm, rArm]) clothLimb([arm[0], arm[1]], col, H * 0.05);
    ink.shape(body, col, W);
    if (outfit === "tweed") ink.hatch(body, 40, H * 0.02, "rgba(60,40,20,0.35)", W * 0.5, 0, 0.2);
    if (outfit === "coat" || outfit === "tweed" || outfit === "oilskin") for (let i = 0; i < 3; i++) ink.dot(shoulder[0] + 0.012 * H * fl, shoulder[1] + (0.06 + i * 0.06) * H, W * 0.9, outfit === "coat" ? "#e8c45a" : INKC);
  } else ink.line(torso, W);
  // arms (forearms only when sleeved)
  const sleeved = outfit === "modern" || outfit === "coat" || outfit === "tweed" || outfit === "oilskin";
  for (const arm of [lArm, rArm]) ink.line(sleeved ? [arm[1], arm[2]] : arm, W);
  if (f.prop === "bone") { const hnd = rArm[2]; ink.shape(ink.ellPts(hnd[0], hnd[1], H * 0.05, H * 0.012, -0.5), "#f3eee2", W * 0.7); for (const s of [-1, 1]) ink.ell(hnd[0] + s * H * 0.045, hnd[1] - s * H * 0.025, H * 0.014, H * 0.014, "#f3eee2", W * 0.6); }
  if (f.prop === "rope") { const hnd = lArm[2]; ink.line([hnd, [hnd[0] + 0.12 * H * fl, hnd[1] + 0.12 * H], [hnd[0] + 0.25 * H * fl, hnd[1] + 0.05 * H]], W * 0.9, "#b0302a"); }

  // head
  const [hx, hy] = head;
  ink.ell(hx, hy, R, R * 0.98, "#ffffff", W);
  const hair = f.hair ?? "none", hc = f.hairCol ?? "#3a2a22";
  if (hair === "messy" || hair === "messyLong") ink.scribbleHair(hx, hy, R, hc, hair === "messyLong" ? 80 : 55, hair === "messyLong" ? 1.4 : 1);
  else if (hair === "short") { g.fillStyle = hc; g.beginPath(); g.ellipse(hx, hy - R * 0.45, R * 0.95, R * 0.55, 0, Math.PI * 1.02, Math.PI * 1.98); g.fill(); ink.arc(hx, hy - R * 0.45, R * 0.95, R * 0.55, Math.PI * 1.02, Math.PI * 1.98, W * 0.6); }
  // face
  const lk = (f.look ?? 0) * R * 0.28 * fl, face = f.face ?? "neutral";
  const ex = R * 0.34, ey = hy - R * 0.05, er = Math.max(2.2, R * 0.075);
  const eyes = (kind: "dot" | "squeeze" | "closed" | "wide") => {
    for (const s of [-1, 1]) {
      const x = hx + lk + s * ex;
      if (kind === "dot") ink.dot(x, ey, er);
      else if (kind === "wide") { ink.ell(x, ey, er * 2, er * 2.3, "#ffffff", W * 0.6); ink.dot(x, ey, er * 0.9); }
      else if (kind === "closed") ink.arc(x, ey + er, er * 1.8, er * 1.2, Math.PI * 1.1, Math.PI * 1.9, W * 0.7);
      else ink.line([[x - s * er * 1.6, ey - er * 1.3], [x + s * er * 0.6, ey], [x - s * er * 1.6, ey + er * 1.3]], W * 0.7);
    }
  };
  const brows = (inner: number, outer: number, y0 = -0.32) => { for (const s of [-1, 1]) { const x = hx + lk + s * ex; ink.line([[x + s * er * 2.2, ey + R * y0 + outer * R * 0.08], [x - s * er * 1.4, ey + R * y0 + inner * R * 0.08]], W * 0.75, INKC, 0.3); } };
  const my = hy + R * 0.42, mx = hx + lk * 1.1;
  if (face === "neutral") { eyes("dot"); ink.line([[mx - R * 0.12, my], [mx + R * 0.12, my]], W * 0.7, INKC, 0.3); }
  if (face === "happy") { eyes("dot"); brows(-0.5, 0.3); ink.arc(mx, my - R * 0.1, R * 0.2, R * 0.13, 0.15 * Math.PI, 0.85 * Math.PI, W * 0.75); }
  if (face === "content") { eyes("closed"); ink.arc(mx, my - R * 0.1, R * 0.2, R * 0.13, 0.15 * Math.PI, 0.85 * Math.PI, W * 0.75); }
  if (face === "laugh") { eyes("closed"); ink.shape([...ink.ellPts(mx, my - R * 0.06, R * 0.24, R * 0.2, 0, 20, 0, Math.PI)], "#5a1e28", W * 0.7); }
  if (face === "worried") { eyes("dot"); brows(-1.2, 0.6); ink.line(ink.curve([mx - R * 0.15, my + R * 0.02], [mx, my - R * 0.06], [mx + R * 0.15, my + R * 0.03]), W * 0.7, INKC, 0.3); }
  if (face === "scared") { eyes("wide"); brows(-1.4, 0.4, -0.45); ink.ell(mx, my, R * 0.1, R * 0.13, "#5a1e28", W * 0.7); }
  if (face === "angry") { eyes("dot"); brows(1.4, -0.6); ink.line([[mx - R * 0.14, my + R * 0.03], [mx + R * 0.14, my - R * 0.02]], W * 0.75, INKC, 0.3); }
  if (face === "determined") { eyes("dot"); brows(1.0, -0.3); ink.arc(mx + R * 0.05, my - R * 0.06, R * 0.14, R * 0.08, 0.2 * Math.PI, 0.8 * Math.PI, W * 0.7); }
  if (face === "squeeze") { eyes("squeeze"); ink.shape([[mx - R * 0.2, my - R * 0.05], [mx + R * 0.2, my - R * 0.05], [mx + R * 0.14, my + R * 0.12], [mx - R * 0.14, my + R * 0.12]], "#ffffff", W * 0.7); ink.line([[mx - R * 0.18, my + R * 0.035], [mx + R * 0.18, my + R * 0.035]], W * 0.5, INKC, 0.2); }
  if (face === "awe") { eyes("dot"); brows(-0.8, 0.0, -0.42); ink.ell(mx, my, R * 0.08, R * 0.1, "#5a1e28", W * 0.6); }
  if (f.moustache) { for (const s of [-1, 1]) ink.shape(ink.ellPts(mx + s * R * 0.12, my - R * 0.13, R * 0.13, R * 0.05, s * 0.25), f.moustache, W * 0.5); }
  if (f.beard) { const b = ink.ellPts(hx + lk * 0.6, hy + R * 0.62, R * 0.62, R * 0.42, 0, 30, 0, Math.PI); ink.shape(ink.ragged(b, R * 0.08, 2), f.beard, W * 0.7); ink.arc(mx, my - R * 0.05, R * 0.14, R * 0.08, 0.2 * Math.PI, 0.8 * Math.PI, W * 0.7, "#f3e0c8"); }
  // hats
  const hat = f.hat ?? "none", hcl = f.hatCol ?? "#222024";
  if (hat === "tophat") { ink.shape([[hx - R * 1.15, hy - R * 0.72], [hx + R * 1.15, hy - R * 0.72], [hx + R * 1.1, hy - R * 0.86], [hx - R * 1.1, hy - R * 0.86]], hcl, W); ink.shape([[hx - R * 0.68, hy - R * 0.84], [hx + R * 0.68, hy - R * 0.84], [hx + R * 0.62, hy - R * 2.0], [hx - R * 0.62, hy - R * 2.0]], hcl, W); ink.line([[hx - R * 0.66, hy - R * 1.02], [hx + R * 0.66, hy - R * 1.02]], R * 0.12, "#7a2a2a", 0.2); }
  if (hat === "flatcap") { ink.shape([...ink.ellPts(hx, hy - R * 0.42, R * 1.02, R * 0.62, 0, 30, Math.PI, Math.PI * 2), [hx + R * 1.5 * fl, hy - R * 0.38], [hx - R * 0.95, hy - R * 0.4]], hcl, W); ink.hatch(ink.ellPts(hx, hy - R * 0.5, R, R * 0.5, 0, 30, Math.PI, Math.PI * 2), 20, R * 0.3, "rgba(0,0,0,0.25)", W * 0.4, 0, 0.3); }
  if (hat === "souwester") { ink.shape([...ink.ellPts(hx, hy - R * 0.4, R * 1.05, R * 0.75, 0, 30, Math.PI, Math.PI * 2), [hx + R * 1.5, hy - R * 0.15], [hx - R * 1.5, hy - R * 0.15]], hcl, W); }
  if (hat === "cap") { ink.shape([...ink.ellPts(hx, hy - R * 0.42, R * 1.0, R * 0.62, 0, 30, Math.PI, Math.PI * 2), [hx + R * 1.6 * fl, hy - R * 0.38], [hx - R, hy - R * 0.42]], hcl, W); }
};
