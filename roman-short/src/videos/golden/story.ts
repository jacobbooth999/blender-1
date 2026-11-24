// "From Wolf to Golden": seven stills, one per era. Frame n of the composition is shot n + 1.
// Every set stands at its own spot on one big map (SET_X apart), so one World holds them all and the fog hides
// the neighbours. Cameras are static (stills), framed for a 1080 x 1920 vertical card.
export type V3 = [number, number, number];
export type Light = "day" | "golden";
export type ShotDef = { id: number; a: number; b: number; light: Light; name: string; fogFar?: number; sunAz?: number; sunEl?: number };
export type Cam = { pos: V3; look: V3; fov: number; roll: number };

export const SET_X = 1500;
export const O = (i: number): V3 => [i * SET_X, 0, 0];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

type Seed = { name: string; set: number; light: Light; fogFar?: number; sunAz?: number; sunEl?: number; cam: Omit<Cam, "roll"> & { roll?: number }; cInf: number; focus?: V3 };
// cam pos / look are LOCAL to the set origin O(set); "...Face" shots have the dogs looking straight into the lens
const SEEDS: Seed[] = [
  { name: "wolf", set: 0, light: "golden", fogFar: 520, sunAz: -8, sunEl: 9, cam: { pos: [0.8, 1.05, -7.2], look: [-0.1, 1.85, 0.4], fov: 42, roll: 0.03 }, cInf: 6, focus: [0, 2.5, 0] },
  { name: "wolfFace", set: 0, light: "golden", fogFar: 520, sunAz: 22, sunEl: 8, cam: { pos: [1.5, 0.62, -5.4], look: [1.35, 0.8, -2.6], fov: 40, roll: -0.025 }, cInf: 12, focus: [1.4, 0.75, -2.6] },
  { name: "camp", set: 1, light: "golden", fogFar: 420, sunAz: 150, sunEl: 9, cam: { pos: [0.1, 1.2, -3.6], look: [0.05, 0.85, 1.3], fov: 42 }, cInf: 10, focus: [-0.2, 0.7, 0.8] },
  { name: "campFace", set: 1, light: "golden", fogFar: 420, sunAz: 160, sunEl: 9, cam: { pos: [-0.3, 0.7, -2.65], look: [-0.15, 0.58, 0.6], fov: 40, roll: 0.03 }, cInf: 12, focus: [-0.35, 0.6, -0.2] },
  { name: "dock", set: 2, light: "day", fogFar: 650, sunAz: 70, sunEl: 40, cam: { pos: [0.95, 1.5, -0.6], look: [0.1, 0.95, 5.0], fov: 42, roll: -0.03 }, cInf: 9, focus: [-0.3, 0.9, 4.2] },
  { name: "dockFace", set: 2, light: "day", fogFar: 650, sunAz: 120, sunEl: 40, cam: { pos: [0.05, 0.92, 0.45], look: [0.1, 0.8, 4.2], fov: 40 }, cInf: 12, focus: [0, 0.75, 3.0] },
  { name: "tweed", set: 3, light: "day", fogFar: 600, sunAz: 80, sunEl: 44, cam: { pos: [-0.3, 1.05, -2.3], look: [0.35, 0.75, 3.0], fov: 42 }, cInf: 10, focus: [-0.2, 0.5, 1.6] },
  { name: "estate", set: 4, light: "day", fogFar: 700, sunAz: 105, sunEl: 46, cam: { pos: [0.25, 1.3, -4.4], look: [0.1, 0.75, 2.0], fov: 44 }, cInf: 8, focus: [0, 0.5, 1.2] },
  { name: "puppies", set: 4, light: "day", fogFar: 700, sunAz: 110, sunEl: 46, cam: { pos: [0.0, 0.5, -2.45], look: [0.0, 0.52, 1.5], fov: 40, roll: 0.02 }, cInf: 11, focus: [0, 0.3, 0.3] },
  { name: "marsh", set: 5, light: "golden", fogFar: 520, sunAz: 6, sunEl: 11, cam: { pos: [0.0, 1.05, -3.3], look: [-0.1, 1.0, 3.0], fov: 42, roll: -0.03 }, cInf: 8, focus: [0.1, 0.8, 1.3] },
  { name: "today", set: 6, light: "day", fogFar: 600, sunAz: 95, sunEl: 50, cam: { pos: [0.35, 0.95, -4.4], look: [0, 0.85, 1.8], fov: 44, roll: 0.035 }, cInf: 9, focus: [0.6, 0.7, 1.0] },
  { name: "goldenFace", set: 6, light: "day", fogFar: 600, sunAz: 115, sunEl: 48, cam: { pos: [0.1, 0.78, -2.05], look: [0.05, 0.7, 1.5], fov: 40, roll: -0.03 }, cInf: 13, focus: [0.1, 0.75, 0.6] },
];
export const SHOTS: ShotDef[] = SEEDS.map((s, i) => ({ id: i + 1, a: i, b: i + 1, light: s.light, name: s.name, fogFar: s.fogFar, sunAz: s.sunAz, sunEl: s.sunEl }));
export const TOTAL = SHOTS.length;
/** set origin of a shot */
export const shotO = (id: number): V3 => O(SEEDS[id - 1].set);
export const SID: Record<string, number> = Object.fromEntries(SHOTS.map((s) => [s.name, s.id]));

export const camAt = (id: number, _f: number): Cam => {
  const s = SEEDS[id - 1], o = O(s.set);
  return { pos: add(o, s.cam.pos), look: add(o, s.cam.look), fov: s.cam.fov, roll: s.cam.roll ?? 0 };
};
export const dofAt = (f: number): { cInf: number; focus?: (f: number) => V3 } => {
  const i = Math.max(0, Math.min(SEEDS.length - 1, Math.round(f))), s = SEEDS[i], o = O(s.set);
  return { cInf: s.cInf, focus: s.focus ? () => add(o, s.focus!) : undefined };
};
