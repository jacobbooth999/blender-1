// Who stands where in each of the seven stills: people (rome/toon.ts bodies) and dogs (dog.ts) as lit flat cards,
// each with a contact shadow (+ a sun-side tail by day), plus effect cards (fire, splash).
import * as THREE from "three";
import { Pen, bodyFront, bodySide, fxShadow, fxContact, fxFlame, fxSplash, fxSteam, Outfit, FrontOpts, SideOpts, SKINS, KID, INK } from "../rome/toon";
import { Place, FxPlace, CamInfo } from "../rome/cast";
import { drawDog, Dog, DogPose, WOLF, EARLY_DOG, WATER_DOG, TWEED, NOUS, PUP, KEEPER_GOLDEN, GOLDEN } from "./dog";
import { SHOTS, O } from "./story";

export type Stage = { places: Place[]; fx: FxPlace[] };
const tmp = new THREE.Vector3();
/** canvas tiers by distance (sized for a 1440 x 2560 still) */
const tier = (d: number): [number, number, number] => d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
const light2D = (cam: CamInfo, sun: THREE.Vector3, mirror: boolean) => {
  const sx = sun.dot(cam.right) * (mirror ? -1 : 1), sy = -sun.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};
const q = (v: number, n = 120) => Math.round(v * n) / n;
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));

type Ctx = { out: Stage; cam: CamInfo; sun: THREE.Vector3; light: "day" | "golden"; o: [number, number, number] };

// ---------------- shadows ----------------
const toSrgb = (v: number) => { const c = Math.max(0, Math.min(1, v)); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const CONTACT: Record<"day" | "golden", [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33] };
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
/** contact pool (w x h metres) + by day a soft tail away from the sun */
const blob = (c: Ctx, x: number, y: number, z: number, w = 0.52, h = 0.4, sc = 1) => {
  const S = c.sun, hl = Math.hypot(S.x, S.z) || 1, ox = -S.x / hl, oz = -S.z / hl, rot = Math.atan2(-ox, -oz);
  if (c.light === "day") {
    const el = Math.asin(Math.min(0.99, Math.max(0.1, S.y)));
    const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, hh = len + 0.55 * sc, cc = 0.3 * hh;
    const tc = hexOf(TAIL, 1);
    c.out.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * cc, y: y + 0.018, z: z + oz * cc, w: Math.max(0.72 * sc, w * 1.1), h: hh, flat: true, rot });
  }
  const cc = hexOf(CONTACT[c.light], 1);
  c.out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x, y: y + 0.022, z, w, h, flat: true, rot: 0 });
};

// ---------------- placing ----------------
type PSpec = { o: Outfit; x: number; z: number; y?: number; seed: number; fo?: FrontOpts; side?: SideOpts; mirror?: boolean; scale?: number; noBlob?: boolean };
const person = (c: Ctx, s: PSpec) => {
  const x = c.o[0] + s.x, z = c.o[2] + s.z, y = s.y ?? 0, sc = s.scale ?? 1;
  const d = c.cam.pos.distanceTo(tmp.set(x, y + 1.2, z)) / sc;
  const [w, h, k] = tier(d);
  const mirror = !!s.side && !!s.mirror, light = light2D(c.cam, c.sun, mirror);
  const okey = JSON.stringify(s.o);
  if (s.side) {
    const so: SideOpts = { ...s.side, light, seed: s.seed };
    c.out.places.push({ key: `GS|${okey}|${fkey(so)}`, x, y, z, scale: sc, mirror, size: [w, h, k], draw: (p) => bodySide(p, s.o, so) });
  } else {
    const fo: FrontOpts = { ...(s.fo ?? {}), light, seed: s.seed };
    c.out.places.push({ key: `GF|${okey}|${fkey(fo)}`, x, y, z, scale: sc, size: [w, h, k], draw: (p) => bodyFront(p, s.o, fo) });
  }
  if (!s.noBlob) blob(c, x, y, z, 0.52 * sc, 0.4 * sc, sc);
};
/** left = the dog faces screen-left in the final (mirrored) frame */
type DSpec = { d: Dog; pose: DogPose; x: number; z: number; y?: number; left?: boolean; noBlob?: boolean };
const dog = (c: Ctx, s: DSpec) => {
  const x = c.o[0] + s.x, z = c.o[2] + s.z, y = s.y ?? 0;
  const dist = c.cam.pos.distanceTo(tmp.set(x, y + 0.5, z));
  const [w, h, k] = tier(dist * 0.8);
  const mirror = !s.left, pose: DogPose = { ...s.pose, light: light2D(c.cam, c.sun, mirror) };
  c.out.places.push({ key: `D|${fkey(s.d)}|${fkey(pose)}`, x, y, z, mirror, size: [w, h, k], draw: (p) => drawDog(p, s.d, pose) });
  const sz = (s.d.size ?? 1) * (s.d.puppy ? 0.5 : 1);
  if (!s.noBlob) blob(c, x, y, z, 1.0 * sz, 0.42 * sz, 0.8 * sz);
};
const fx = (c: Ctx, key: string, cw: number, ch: number, draw: (p: Pen) => void, x: number, y: number, z: number, w: number, h: number, extra: Partial<FxPlace> = {}) =>
  c.out.fx.push({ key, cw, ch, draw, x: c.o[0] + x, y, z: c.o[2] + z, w, h, ...extra });

// ---------------- outfits ----------------
const HUNTER: Outfit = { jacket: "#8a6a4a", pants: "#6b5236", boots: "#5a3b2a", hat: "longhair", hair: "#4a3020", beard: "#4a3020", skin: SKINS[1], sash: "#3a2a20", plaid: "#a5865e" };
const CAVE_KID: Outfit = { jacket: "#a67d58", pants: "#7a5a3a", boots: "#5a3b2a", hat: "longhair", hair: "#6a4020", skin: SKINS[2], build: "kid", sash: "#4a3020" };
const FISHER: Outfit = { jacket: "#e3b23c", pants: "#3b4a6a", boots: "#2c2a30", hat: "cap", cap: "#2d3b5c", beard: "#7a6a60", skin: SKINS[1], buttons: "#4a3a2a", build: "stout" };
const GHILLIE: Outfit = { jacket: "#7b6a45", pants: "#5c5a3e", boots: "#4a3426", hat: "cap", cap: "#6a5a3a", moustache: "#a07850", skin: SKINS[0], buttons: "#3a2a20" };
const LORD: Outfit = { jacket: "#2f4a3c", pants: "#6a6450", boots: "#2a201a", hat: "tophat", moustache: "#c9c2b8", skin: "#f5d6b8", buttons: "#e8c45a", build: "stout" };
const KEEPER: Outfit = { jacket: "#8a6a3a", pants: "#6a5a3a", boots: "#4a3426", hat: "cap", cap: "#5a4630", moustache: "#5a3b2a", skin: SKINS[1], rifle: true, belt: "#4a3020" };
const BOY: Outfit = { ...KID, jacket: "#3f8fd2", pants: "#3b4a6a", boots: "#f4f1ea", cap: "#e2453c" };

// ---------------- the seven scenes ----------------
const SCENES: ((c: Ctx) => void)[] = [
  // 1. wolf: howling on the outcrop at sunset, a second wolf below looking up
  (c) => {
    dog(c, { d: WOLF, pose: { pose: "howl", mouth: "O", eye: "happy" }, x: 0.15, z: 0.1, y: 2.12, noBlob: true });
    dog(c, { d: WOLF, pose: { pose: "stand", eye: "up", headTilt: -12 }, x: -1.15, z: -1.0 });
  },
  // 2. stone-age camp: a kid shares the fire with a half-tame dog, the hunter looks on
  (c) => {
    person(c, { o: HUNTER, x: 1.55, z: 1.2, seed: 3, fo: { mode: "sit", expr: "smile", prop: null }, noBlob: true });
    person(c, { o: CAVE_KID, x: -0.35, z: 1.0, seed: 5, fo: { mode: "sit", expr: "grin", prop: "arms" } });
    dog(c, { d: EARLY_DOG, pose: { pose: "sit", mouth: "smile" }, x: -1.25, z: 0.75, left: false });
    fx(c, "flame0.3", 300, 400, (p) => fxFlame(p, 0.3), 0.4, 0.45, 0.7, 0.62, 0.82);
    fx(c, "steamFire", 300, 400, (p) => fxSteam(p, 0.4), 0.45, 1.25, 0.75, 0.5, 0.66, { soft: true });
  },
  // 3. Newfoundland: the black water dog brings in a fish to its fisherman
  (c) => {
    person(c, { o: FISHER, x: 0.75, z: 5.2, y: 0.2, seed: 2, fo: { mode: "stand", expr: "laugh", prop: "arms" } });
    dog(c, { d: WATER_DOG, pose: { pose: "stand", mouth: "fish" }, x: -0.3, z: 4.1, y: 0.2 });
  },
  // 4. the river Tweed: a curly liver Tweed Water Spaniel on the bank, its ghillie behind
  (c) => {
    dog(c, { d: TWEED, pose: { pose: "stand", mouth: "smile" }, x: -0.2, z: 1.6, left: true });
    person(c, { o: GHILLIE, x: 1.1, z: 2.8, seed: 6, fo: { mode: "stand", expr: "smile" } });
  },
  // 5. Guisachan 1868: the lord with Nous and Belle and their four yellow puppies
  (c) => {
    person(c, { o: LORD, x: 1.3, z: 2.5, seed: 1, fo: { mode: "stand", expr: "smile" } });
    dog(c, { d: NOUS, pose: { pose: "sit", mouth: "closed" }, x: 0.2, z: 2.0, left: true });
    dog(c, { d: TWEED, pose: { pose: "sit", mouth: "smile" }, x: -1.1, z: 2.2 });
    dog(c, { d: PUP, pose: { pose: "sit", mouth: "smile" }, x: -0.55, z: 0.75 });
    dog(c, { d: PUP, pose: { pose: "stand", mouth: "open", eye: "happy" }, x: 0.15, z: 0.45 });
    dog(c, { d: PUP, pose: { pose: "sit", mouth: "closed", headTilt: 14 }, x: 0.75, z: 0.95, left: true });
    dog(c, { d: PUP, pose: { pose: "walk", mouth: "smile", phase: 0.3 }, x: -0.05, z: 1.15 });
  },
  // 6. the marsh at sunset: the golden retriever wades out with a duck for the gamekeeper
  (c) => {
    person(c, { o: KEEPER, x: -0.95, z: 0.7, seed: 4, fo: { mode: "stand", expr: "smile" } });
    dog(c, { d: KEEPER_GOLDEN, pose: { pose: "walk", mouth: "duck", phase: 0.15 }, x: 0.45, z: 1.65, left: true, noBlob: true });
    fx(c, "splash0.35", 800, 800, (p) => fxSplash(p, 0.35), 0.45, 0.3, 1.6, 1.2, 0.7, { flat: false });
  },
  // 7. today: a family golden bounds across the lawn with a ball, the kid cheering
  (c) => {
    person(c, { o: BOY, x: -1.2, z: 1.7, seed: 7, fo: { mode: "stand", expr: "laugh", prop: "cheer" } });
    dog(c, { d: GOLDEN, pose: { pose: "run", mouth: "ball", eye: "happy" }, x: 0.55, z: 1.0, y: 0.18, noBlob: true });
    blobAt(c, 0.55, 1.0);
  },
];
const blobAt = (c: Ctx, x: number, z: number) => blob(c, c.o[0] + x, 0, c.o[2] + z, 0.9, 0.36, 0.7);

export const stage = (id: number, _t: number, cam: CamInfo & { sun: THREE.Vector3 }): Stage => {
  const out: Stage = { places: [], fx: [] };
  const c: Ctx = { out, cam, sun: cam.sun, light: SHOTS[id - 1].light, o: O(id - 1) };
  SCENES[id - 1](c);
  return out;
};
export { INK };
