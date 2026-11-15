// Timeline of "The Empire Built With Shovels": every shot, camera key, state change and reaction is anchored to a
// word of the narration (voice/words.json), so a new narration only needs a new words.json + re-render.
// Camera grammar from the skill: cuts on big jumps, smootherstep glides 18-40 f, every hold creeps (push-in),
// rolls of 4-5 deg on emphasis, impact kicks that flip sign every frame and decay over 7 f.
import VO from "../../../voice/words.json";

export const FPS = 30;
export const D0 = 0; // ground height (build.ts reads it)
export type V3 = [number, number, number];
export const TOTAL = Math.ceil(VO.duration * FPS);

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 3;
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------------- word anchors ----------------
type Word = { word: string; start: number; end: number; s: number };
const WORDS = VO.words as Word[];
const SENT = VO.sentences as { start: number; end: number }[];
/** start time (s) of the n-th occurrence of `word` in sentence si (word = "" -> sentence start) */
export const ws = (si: number, word = "", n = 1): number => {
  if (!word) return SENT[si].start;
  let k = 0;
  for (const w of WORDS) if (w.s === si && w.word.toLowerCase().replace(/'/g, "") === word.toLowerCase().replace(/'/g, "")) { k++; if (k === n) return w.start; }
  throw new Error(`word ${word} not in sentence ${si}`);
};
/** end time (s) of sentence si */
export const se = (si: number) => SENT[si].end;
/** frame of a word onset (or sentence start) */
export const wf = (si: number, word = "", n = 1) => Math.round(ws(si, word, n) * FPS);

// ---------------- places (all ground at y = 0) ----------------
export const ROME: V3 = [0, 0, 0];        // forum centre
export const GATE_Z = -90;                 // city wall line, gate at x = 0, main road south (-z)
export const CAMP: V3 = [800, 0, 0];       // marching camp centre (60 x 60 m)
export const CAMP_H = 30;
export const MULE_X = 800;                 // dirt track to the camp, along +z
export const HOOK: V3 = [812, 0, -150];
export const RD2_X = 400;                  // the road under construction, along -z
export const RD2_END = -500;               // paved up to here; the cutaway section is the last 10 m
export const RHINE: V3 = [-1500, 0, 0];    // river along x, banks at z = -36 / +36
export const RIVER_W = 36, WATER_Y = -1.6, DECK_Y = 0.55;
export const VILLAGE: V3 = [0, 0, 900];
export const RIDGE: V3 = [-70, 0, 170];    // tribes' hill north of Rome
export const RIDGE_H = 10;
export const STALL: V3 = [-12, 0, -9];
export const BRANCH: V3 = [VILLAGE[0] + 9, 0, VILLAGE[2] - 7];
export const MILESTONE: V3 = [7, 0, -7];
/** directions of the roads leaving Rome (radians from -z, clockwise seen from above); 0 = the main south road */
export const ROADS = [0, 1.05, 2.0, 2.75, -2.6, -1.7, -0.85];

// ---------------- shots ----------------
export type Light = "day" | "golden";
export type ShotDef = { id: number; a: number; b: number; light: Light; name: string; fogFar?: number; sunAz?: number; sunEl?: number };
type Seed = { name: string; at: number; light: Light; fogFar?: number; sunAz?: number; sunEl?: number };
const PRE = 4; // cut a few frames before the line that opens the shot
const SEEDS: Seed[] = [
  { name: "hook", at: 0, light: "day" },
  { name: "rome", at: wf(2) - PRE, light: "day", fogFar: 700, sunAz: 110 },
  { name: "ridge", at: wf(3, "surrounded") - PRE, light: "golden", fogFar: 600 },
  { name: "mule", at: wf(4) - PRE, light: "day" },
  { name: "camp", at: wf(8) - PRE, light: "day", fogFar: 500 },
  { name: "campNight", at: wf(10) - PRE, light: "golden", fogFar: 500, sunAz: 30, sunEl: 5 },
  { name: "road", at: wf(11) - PRE, light: "day", fogFar: 700 },
  { name: "layers", at: wf(12, "layer") - PRE, light: "day" },
  { name: "roadAir", at: wf(13) - PRE, light: "day", fogFar: 2200, sunAz: 100 },
  { name: "army", at: wf(14) - PRE, light: "day", fogFar: 600 },
  { name: "caesar", at: wf(15) - PRE, light: "day" },
  { name: "tribes", at: wf(15, "scare") - PRE, light: "day" },
  { name: "noBoats", at: wf(16) - PRE, light: "day", fogFar: 500 },
  { name: "build", at: wf(17) - PRE, light: "day", fogFar: 500 },
  { name: "impressed", at: wf(19) - PRE, light: "day" },
  { name: "torn", at: wf(20) - PRE, light: "day", fogFar: 500 },
  { name: "stall", at: wf(21) - PRE, light: "day" },
  { name: "branch", at: wf(23) - PRE, light: "day" },
  { name: "runner", at: wf(24) - PRE, light: "day", fogFar: 600 },
  { name: "network", at: wf(25) - PRE, light: "day", fogFar: 3000, sunAz: 120, sunEl: 55 },
  { name: "parade", at: wf(26) - PRE, light: "day" },
  { name: "village", at: wf(27) - PRE, light: "day" },
  { name: "sons", at: wf(29) - PRE, light: "day" },
  { name: "citizens", at: wf(30) - PRE, light: "day" },
  { name: "peak", at: wf(31) - PRE, light: "day", fogFar: 5000, sunAz: 120, sunEl: 50 },
  { name: "milestone", at: wf(32) - PRE, light: "day" },
  { name: "gate", at: wf(33) - PRE, light: "golden", fogFar: 700, sunAz: 160, sunEl: 12 },
  { name: "goths", at: wf(34, "right") - PRE, light: "golden", fogFar: 700 },
  { name: "guard", at: wf(34, "gate") - 2, light: "golden", sunAz: 150, sunEl: 12 },
];
export const SHOTS: ShotDef[] = SEEDS.map((s, i) => ({
  id: i + 1, a: s.at, b: i + 1 < SEEDS.length ? SEEDS[i + 1].at : TOTAL, light: s.light, name: s.name, fogFar: s.fogFar, sunAz: s.sunAz, sunEl: s.sunEl,
}));
export const SID: Record<string, number> = Object.fromEntries(SHOTS.map((s) => [s.name, s.id]));
/** crossfades (frames) into these shots: place / time-of-day changes */
export const XFADE: Record<number, number> = { [SID.ridge]: 8, [SID.campNight]: 10, [SID.caesar]: 8, [SID.stall]: 8, [SID.village]: 8, [SID.peak]: 10, [SID.gate]: 10 };
export const FLASH_AT = SHOTS[1].a;

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

// ---------------- world states (pure functions of time in seconds) ----------------
const ramp = (t: number, t0: number, d: number) => smooth((t - t0) / d);
/** marching camp: ditch, rampart, palisade, tents, fires */
export const campState = (t: number) => {
  if (t >= ws(10) - 0.5) return { ditch: 1, wall: 1, stakes: 1, tents: 1, fires: 1 };
  return {
    ditch: ramp(t, ws(9, "dig") - 0.1, 1.0), wall: ramp(t, ws(9, "pile") - 0.1, 1.0),
    stakes: ramp(t, ws(9, "build") - 0.05, 0.9), tents: ramp(t, ws(9, "fortified"), 1.2), fires: 0,
  };
};
/** road layers at the construction end: stone, gravel, sand, paving (0..1 each) */
export const layerState = (t: number) => ({
  stone: ramp(t, ws(12, "stone") - 0.1, 0.45), gravel: ramp(t, ws(12, "gravel") - 0.1, 0.45),
  sand: ramp(t, ws(12, "sand") - 0.1, 0.45), pave: ramp(t, se(12) - 0.1, 0.5),
});
export const BENTS = 10; // pile bents across the Rhine, every 8 m from z = -36 to 36
/** bridge: how many bents stand (0..BENTS, fractional = the next one rising) and the tear-down (0..1, far end first) */
export const bridgeState = (id: number, t: number) => {
  const n = SHOTS[id - 1].name;
  if (n === "caesar" || n === "tribes" || n === "noBoats") return { built: 0, torn: 0 };
  if (n === "build") return { built: BENTS * clamp01((t - ws(17, "build")) / (ws(18, "days") - ws(17, "build"))), torn: 0 };
  if (n === "torn") return { built: BENTS, torn: clamp01((t - ws(20, "torn") + 0.1) / 1.3) };
  return { built: BENTS, torn: 0 };
};
export const branchUp = (t: number) => ramp(t, ws(23, "branch") - 0.15, 0.3);

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mixCam = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mixCam(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
const zoom = (pos: V3, look: V3, fov: number, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos, look, fov: (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k), ...rest });
const rolled = (s: (f: number) => Shot, roll: number) => (f: number): Shot => ({ ...s(f), roll });
const T = (f: number) => f / FPS;

// ---- moving subjects the cameras follow (cast.ts uses the same paths) ----
/** the loaded legionary on the camp track: walks +z, slows down under the full kit */
export const muleZ = (t: number) => -300 + 1.25 * (t - ws(4)) - 0.35 * Math.max(0, t - ws(6)) ** 1.2;
/** the fast column on the main road: walks toward Rome (+z) at 1.4 m/s, jogs at 3.4 m/s from "week" */
export const ARMY_Z0 = -420;
export const armyZ = (t: number) => { const tw = ws(14, "week"); return ARMY_Z0 + 1.4 * (Math.min(t, tw) - ws(14)) + 3.4 * Math.max(0, t - tw); };
/** the pizza runner on the main road, running away from Rome (-z) */
export const runnerZ = (t: number) => -160 - 4.2 * (t - ws(24));
/** Caesar walking back across the bridge (shot "torn"): deck z from +30 to the near bank */
export const caesarBackZ = (t: number) => lerp(24, -40, clamp01((t - ws(20)) / (ws(20, "torn") - ws(20) - 0.2)));
/** the Goth column on the main road, marching toward the gate (+z) */
export const gothZ = (t: number) => -190 + 1.5 * (t - ws(34, "right"));

const H = HOOK, C = CAMP, R = RHINE, VG = VILLAGE;
const CAMS: Record<string, Key[]> = {
  hook: [
    { f: 0, s: (f) => dolly(add(H, [0.9, 1.55, -3.9]), add(H, [0, 1.3, 0]), pushK(f, 0, 0.0025), { fov: 40 }) },
    { f: wf(0, "sword") - 10, dur: 22, s: (f) => dolly(add(H, [0.5, 1.6, -3.0]), add(H, [0, 1.45, 0]), pushK(f, wf(0, "sword") - 10, 0.002), { fov: 38, roll: -0.04 }) },
    { f: wf(1, "shovel") - 2, cut: true, s: (f) => dolly(add(H, [-0.9, 0.95, -3.0]), add(H, [0, 1.3, 0]), pushK(f, wf(1, "shovel") - 2, 0.002, 0.006, 30), { fov: 40, roll: 0.045 }) },
  ],
  rome: [
    { f: SHOTS[1].a, s: (f) => zoom([70, 46, -150], [0, 6, 0], 46, pushK(f, SHOTS[1].a, 0.0018)) },
    { f: wf(3, "seven") - 12, dur: 30, s: (f) => zoom([40, 30, -95], [0, 7, 15], 44, pushK(f, wf(3, "seven") - 12, 0.0018)) },
  ],
  ridge: [
    { f: SHOTS[2].a, s: (f) => dolly(ridgeCam(12.5, 1.7), ridgePt(0, 1.35), pushK(f, SHOTS[2].a, 0.0025), { fov: 40 }) },
    { f: wf(3, "burn") - 10, dur: 22, s: (f) => dolly(ridgeCam(7.5, 1.55), ridgePt(0, 1.45), pushK(f, wf(3, "burn") - 10, 0.002, 0.006, 26), { fov: 38, roll: 0.04 }) },
  ],
  mule: [
    { f: SHOTS[3].a, s: (f) => { const z = muleZ(T(f)); return dolly([MULE_X + 1.7, 1.75, z + 4.0], [MULE_X, 1.4, z], pushK(f, SHOTS[3].a, 0.0015), { fov: 40 }); } },
    { f: wf(6) - 6, dur: 24, s: (f) => { const z = muleZ(T(f)); return dolly([MULE_X + 1.1, 1.55, z + 3.3], [MULE_X, 1.4, z], pushK(f, wf(6) - 6, 0.0025, 0.005, 26), { fov: 38, roll: -0.04 }); } },
    { f: wf(7, "mules") - 8, cut: true, s: (f) => { const z = muleZ(T(f)); return dolly([MULE_X + 1.4, 1.5, z + 7.4], [MULE_X - 0.75, 1.05, z + 0.15], pushK(f, wf(7, "mules") - 8, 0.0025), { fov: 40 }); } },
  ],
  camp: [
    { f: SHOTS[4].a, s: (f) => dolly(add(C, [-30, 9, -62]), add(C, [0, 1, -10]), pushK(f, SHOTS[4].a, 0.0018), { fov: 44 }) },
    { f: wf(9, "dig") - 4, cut: true, s: (f) => dolly(add(C, [3.5, 1.35, -38.5]), add(C, [0, 0.7, -32]), pushK(f, wf(9, "dig") - 4, 0.0025), { fov: 40 }) },
    { f: wf(9, "pile") - 4, cut: true, s: (f) => dolly(add(C, [-38, 26, -66]), add(C, [0, 0, -4]), pushK(f, wf(9, "pile") - 4, 0.0015), { fov: 44 }) },
    { f: wf(9, "fortified") - 14, dur: 34, s: (f) => dolly(add(C, [-52, 40, -78]), add(C, [0, 0, 0]), pushK(f, wf(9, "fortified") - 14, 0.0012), { fov: 44, roll: 0.03 }) },
  ],
  campNight: [{ f: SHOTS[5].a, s: (f) => dolly(add(C, [-44, 22, -56]), add(C, [0, 1, 2]), pushK(f, SHOTS[5].a, 0.003), { fov: 42 }) }],
  road: [
    { f: SHOTS[6].a, s: (f) => dolly([RD2_X + 5.5, 3.2, RD2_END + 26], [RD2_X - 0.5, 1.2, RD2_END - 8], pushK(f, SHOTS[6].a, 0.0022), { fov: 42 }) },
    { f: wf(12) - 4, cut: true, s: (f) => zoom([RD2_X + 0.6, 1.0, -150], [RD2_X, 0.9, -320], 36, pushK(f, wf(12) - 4, 0.003, 0.006, 24), { roll: 0 }) },
  ],
  layers: [
    { f: SHOTS[7].a, s: (f) => dolly([RD2_X + 6.4, 1.55, RD2_END - 5.4], [RD2_X + 0.4, 0.55, RD2_END + 0.6], pushK(f, SHOTS[7].a, 0.002), { fov: 40 }) },
    { f: wf(12, "sand") - 10, dur: 26, s: (f) => dolly([RD2_X + 4.6, 1.25, RD2_END - 4.2], [RD2_X + 0.2, 0.6, RD2_END + 0.4], pushK(f, wf(12, "sand") - 10, 0.0025), { fov: 38, roll: 0.035 }) },
  ],
  roadAir: [
    { f: SHOTS[8].a, s: (f) => dolly([RD2_X + 18, 26, -330], [RD2_X, 0, -700], pushK(f, SHOTS[8].a, 0.0005)) },
    { f: SHOTS[8].a + 4, dur: Math.max(30, SHOTS[8].b - SHOTS[8].a - 4), s: () => ({ pos: [RD2_X + 46, 130, -280], look: [RD2_X, 0, -1500], fov: 46 }) },
  ],
  army: [
    { f: SHOTS[9].a, s: (f) => { const z = armyZ(T(f)); return dolly([3.6, 1.9, z + 8.5], [0, 1.3, z], pushK(f, SHOTS[9].a, 0.002), { fov: 42 }); } },
    { f: wf(14, "week") - 3, cut: true, s: (f) => { const z = armyZ(T(f)); return { pos: [6.5, 1.05, z + 1.2], look: [0, 1.0, z - 1.5], fov: 44, roll: 0.045 }; } },
  ],
  caesar: [{ f: SHOTS[10].a, s: (f) => dolly(add(R, [-2.1, 1.75, -46.6]), add(R, [-3, 1.45, -42]), pushK(f, SHOTS[10].a, 0.0022), { fov: 40 }) }],
  tribes: [{ f: SHOTS[11].a, s: (f) => zoom(add(R, [3, 2.6, -14]), add(R, [0, 1.3, 44]), 14, pushK(f, SHOTS[11].a, 0.0025)) }],
  noBoats: [{ f: SHOTS[12].a, s: (f) => dolly(add(R, [-2.4, 2.1, -48.5]), add(R, [-1.6, 1.25, -30]), pushK(f, SHOTS[12].a, 0.003), { fov: 44, roll: -0.03 }) }],
  build: [
    { f: SHOTS[13].a, s: (f) => dolly(add(R, [62, 13, -26]), add(R, [0, 0, 0]), pushK(f, SHOTS[13].a, 0.0016), { fov: 46 }) },
    { f: wf(18) - 4, cut: true, s: (f) => dolly(add(R, [1.8, DECK_Y + 1.75, -20.5]), add(R, [0, DECK_Y + 1.3, -11]), pushK(f, wf(18) - 4, 0.003, 0.006, 24), { fov: 40, roll: 0.04 }) },
  ],
  impressed: [{ f: SHOTS[14].a, s: (f) => dolly(add(R, [0.5, 1.8, 35]), add(R, [0.5, 1.55, 47.6]), pushK(f, SHOTS[14].a, 0.0012, 0.003, 24), { fov: 40 }) }],
  torn: [
    { f: SHOTS[15].a, s: (f) => { const z = caesarBackZ(T(f)), d = Math.hypot(z + 45, 1.6); return { pos: add(R, [1.8, 1.9, -45]), look: add(R, [0.1, 1.45, z]), fov: (360 / Math.PI) * Math.atan(Math.max(0.12, Math.min(0.36, 3.0 / d)) * pushK(f, SHOTS[15].a, 0.0015)) }; } },
    { f: wf(20, "torn") - 8, cut: true, s: (f) => dolly(add(R, [-7.2, 2.6, -51.5]), add(R, [-1.9, 1.6, -8]), pushK(f, wf(20, "torn") - 8, 0.002), { fov: 42 }) },
  ],
  stall: [
    { f: SHOTS[16].a, s: (f) => dolly(add(STALL, [3.4, 2.15, -5.4]), add(STALL, [0.35, 1.5, -0.5]), pushK(f, SHOTS[16].a, 0.002), { fov: 36 }) },
    { f: wf(22, "pizza") - 10, dur: 22, s: (f) => zoom(add(STALL, [3.4, 2.15, -5.4]), add(STALL, [0.2, 1.55, -0.3]), 28, pushK(f, wf(22, "pizza") - 10, 0.0025), { roll: 0.04 }) },
  ],
  branch: [{ f: SHOTS[17].a, s: (f) => dolly(add(BRANCH, [7, 3.4, -13]), add(BRANCH, [0, 1.3, 0]), pushK(f, SHOTS[17].a, 0.0022), { fov: 42 }) }],
  runner: [{ f: SHOTS[18].a, s: (f) => { const z = runnerZ(T(f)); return { pos: [4.2, 1.2, z - 4.6], look: [0, 1.15, z], fov: 42, roll: -0.03 }; } }],
  network: [
    { f: SHOTS[19].a, s: (f) => zoom([260, 260, -420], [0, 0, -40], 48, pushK(f, SHOTS[19].a, 0.0015)) },
  ],
  parade: [{ f: SHOTS[20].a, s: (f) => dolly([7.8, 1.5, -206], [0, 1.25, -201], pushK(f, SHOTS[20].a, 0.0016), { fov: 42 }) }],
  village: [
    { f: SHOTS[21].a, s: (f) => dolly(add(VG, [1.5, 1.85, -10.5]), add(VG, [0, 1.35, -1]), pushK(f, SHOTS[21].a, 0.002), { fov: 42 }) },
    { f: wf(28, "roman") - 10, dur: 22, s: (f) => dolly(add(VG, [0.6, 1.7, -8.2]), add(VG, [0, 1.35, -1]), pushK(f, wf(28, "roman") - 10, 0.002), { fov: 40, roll: -0.04 }) },
  ],
  sons: [
    { f: SHOTS[22].a, s: (f) => dolly(add(VG, [4.5, 1.4, -13]), add(VG, [4.4, 1.2, -8.5]), pushK(f, SHOTS[22].a, 0.0025), { fov: 40 }) },
    { f: wf(29, "built") - 4, cut: true, s: (f) => dolly([RD2_X + 7, 2.6, RD2_END + 10], [RD2_X + 1.0, 1.0, RD2_END + 1], pushK(f, wf(29, "built") - 4, 0.0022), { fov: 42 }) },
  ],
  citizens: [{ f: SHOTS[23].a, s: (f) => dolly(add(ROME, [1.5, 1.95, -13]), add(ROME, [-0.5, 1.5, 0]), pushK(f, SHOTS[23].a, 0.0022, 0.005, 30), { fov: 48 }) }],
  peak: [
    { f: SHOTS[24].a, s: (f) => zoom([-520, 640, -900], [0, 0, 0], 50, pushK(f, SHOTS[24].a, 0.001)) },
  ],
  milestone: [
    { f: SHOTS[25].a, s: (f) => dolly(add(MILESTONE, [3.0, 1.0, -6.5]), add(MILESTONE, [0, 2.0, 0]), pushK(f, SHOTS[25].a, 0.0025), { fov: 40 }) },
    { f: wf(32, "where") - 10, dur: 28, s: (f) => dolly(add(MILESTONE, [5, 5.5, -11]), add(MILESTONE, [-1, 1.6, 3]), pushK(f, wf(32, "where") - 10, 0.0018), { fov: 44, roll: 0.03 }) },
  ],
  gate: [
    { f: SHOTS[26].a, s: (f) => dolly([2.4, 2.2, GATE_Z - 42], [0, 5, GATE_Z], pushK(f, SHOTS[26].a, 0.002), { fov: 42 }) },
    { f: wf(34) - 6, cut: true, s: (f) => dolly([-1.0, 1.75, GATE_Z - 14], [-1.1, 1.3, GATE_Z - 2.5], pushK(f, wf(34) - 6, 0.0015), { fov: 44 }) },
  ],
  goths: [
    { f: SHOTS[27].a, s: (f) => zoom([2.6, 2.0, GATE_Z - 6], [0, 1.4, gothZ(T(f)) - 3], 14, pushK(f, SHOTS[27].a, 0.003)) },
    { f: wf(34, "goths") - 8, dur: 28, s: (f) => zoom([2.6, 2.0, GATE_Z - 6], [0, 1.4, gothZ(T(f)) - 2], 9, pushK(f, wf(34, "goths") - 8, 0.003), { roll: 0.03 }) },
  ],
  guard: [
    { f: SHOTS[28].a, s: (f) => dolly([3.4, 1.65, GATE_Z - 4.2], [2.6, 1.5, GATE_Z - 1.0], pushK(f, SHOTS[28].a, 0.004, 0.008, 22), { fov: 40, roll: -0.04 }) },
    { f: SHOTS[28].a + 26, cut: true, s: (f) => dolly([0.6, 1.7, GATE_Z - 8.2], [0, 1.5, GATE_Z - 11.5], pushK(f, SHOTS[28].a + 26, 0.0025), { fov: 38 }) },
  ],
};
/** ridge: tribesmen stand on the hill top facing south-east (toward Rome); the lens stands on the far side */
const RDIR = (() => { const x = ROME[0] - RIDGE[0], z = ROME[2] - RIDGE[2], n = Math.hypot(x, z); return [x / n, z / n]; })();
export const ridgePt = (side: number, y: number): V3 => [RIDGE[0] - RDIR[1] * side, RIDGE_H + y, RIDGE[2] + RDIR[0] * side];
const ridgeCam = (d: number, y: number): V3 => { const p = ridgePt(0.8, y); return [p[0] - RDIR[0] * d, p[1], p[2] - RDIR[1] * d]; };
export const RIDGE_DIR = RDIR;

// impact kicks (seconds, gain)
const KICKS: [number, number][] = [
  [ws(1, "shovel") + 0.1, 0.8], [ws(9, "dig"), 0.4], [ws(12, "stone"), 0.5], [ws(12, "gravel"), 0.4], [ws(12, "sand"), 0.4],
  [ws(20, "torn") + 0.15, 0.9], [ws(20, "torn") + 0.6, 0.6], [ws(23, "branch"), 0.5], [ws(28, "roman"), 0.4], [ws(29, "joined"), 0.4], [ws(34, "gate"), 0.9],
];
export const kickAt = (t: number) => {
  let a = 0;
  for (const [t0, g] of KICKS) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[SHOTS[id - 1].name], f), a = kickAt(T(f));
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};

// ---------------- lens ----------------
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
const sharp = (name: string): Dof => ({ f: SHOTS[SID[name] - 1].a, cInf: 0 });
const at = (name: string, cInf: number, focus?: (f: number) => V3): Dof => ({ f: SHOTS[SID[name] - 1].a, cInf, focus });
export const DOF: Dof[] = [
  at("hook", 13), sharp("rome"), at("ridge", 9), at("mule", 10, (f) => [MULE_X, 1.5, muleZ(T(f))]), { f: wf(7, "mules") - 8, cInf: 0 },
  sharp("camp"), { f: wf(9, "dig") - 4, cInf: 11 }, { f: wf(9, "pile") - 4, cInf: 0 }, sharp("campNight"), sharp("road"),
  at("layers", 10), sharp("roadAir"), at("army", 8, (f) => [0, 1.5, armyZ(T(f))]), { f: wf(14, "week") - 3, cInf: 6, focus: (f) => [0, 1.2, armyZ(T(f)) - 0.5] },
  at("caesar", 12), sharp("tribes"), sharp("noBoats"), sharp("build"), { f: wf(18) - 4, cInf: 10 }, at("impressed", 9),
  at("torn", 9, (f) => [0 + RHINE[0], 1.5, caesarBackZ(T(f))]), { f: wf(20, "torn") - 8, cInf: 0 }, at("stall", 7), at("branch", 7),
  at("runner", 9, (f) => [0, 1.3, runnerZ(T(f))]), sharp("network"), at("parade", 7, () => [0, 1.4, -201]), at("village", 11), at("sons", 11),
  { f: wf(29, "built") - 4, cInf: 0 }, at("citizens", 6), sharp("peak"), at("milestone", 11), { f: wf(32, "where") - 10, dur: 28, cInf: 6 },
  sharp("gate"), { f: wf(34) - 6, cInf: 11 }, at("goths", 6), at("guard", 13), { f: SHOTS[28].a + 26, cInf: 12 },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
