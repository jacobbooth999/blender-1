// Our Roman cast as lit flat cards in the 3D world (same card system as the bridge short: a canvas pool keyed by
// drawing, yaw-only billboards shaded by cardShade(), contact blobs, unlit effect cards on the NOINK layer).
// Every shot's cast is a list of people with outfits, poses, props and expressions switched on narration words.
import * as THREE from "three";
import {
  Pen, bodyFront, bodySide, muleSide, MULE_K, fxBurst, fxSplash, fxPuff, fxStars, fxShadow, fxContact, fxFlame, fxSteam, fxSpeed, fxSweat, fxPop, fxDirt,
  Outfit, Expr, FrontOpts, SideOpts, Prop, legionary, CAESAR, citizen, tribesman, goth, SHOPKEEPER, villageKid,
} from "./toon";
import {
  FPS, SHOTS, V3, clamp01, smooth, ws, se, HOOK, CAMP, CAMP_H, MULE_X, RD2_X, RD2_END, RHINE, RIVER_W, DECK_Y, WATER_Y, VILLAGE, STALL, BRANCH, MILESTONE,
  GATE_Z, ROME, muleZ, armyZ, runnerZ, caesarBackZ, gothZ, ridgePt, bridgeState, branchUp, BENTS,
} from "./story";
import { NOINK } from "./ink";
import { cardShade, blobMaterial, CARD_K } from "./cardshade";
import { RhineBridge } from "./sets";
// ---------------- canvas pool ----------------
type Entry = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number };
export type Req = { key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture };
const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, tex, w, h };
};
export class Pool {
  private live = new Map<string, Entry>();
  private free: Entry[] = [];
  private reqs: Req[] = [];
  req(key: string, w: number, h: number, k: number, draw: (p: Pen) => void) {
    const r: Req = { key: `${w}x${h}|${key}`, w, h, k, draw };
    this.reqs.push(r);
    return r;
  }
  flush() {
    const want = new Map<string, Req[]>();
    for (const r of this.reqs) { const l = want.get(r.key); if (l) l.push(r); else want.set(r.key, [r]); }
    for (const [key, e] of this.live) if (!want.has(key)) { this.live.delete(key); this.free.push(e); }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0], i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
  }
}

// ---------------- sprite meshes ----------------
const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
export const SU = 0.00216; // metres per design unit: 1000 units = 2.16 m
export const SU_SWING = 2.3 / 1830; // swing canvas: rope of 1830 units = 2.3 m
const BODY = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const CARD = new THREE.PlaneGeometry(1, 1);
/** world roots that hold actors (to find the scene's sun when world.ts does not pass it) */
const ROOTS = new Set<THREE.Object3D>();

/** lit flat character: cardShade() material, receives shadows (dims to the bright floor only), casts its silhouette
 *  when world.ts says so (golden). Drawn after the contact blobs (renderOrder 1). */
export class Actor {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; dmat: THREE.MeshDepthMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D, geo: THREE.BufferGeometry = BODY) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    // rim width is in output pixels: tell the card shader the render height (1920 = 1080 x 1920 frame)
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
    ROOTS.add(parent);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
}
/** unlit effect card: hard cut-out (ink drawings), soft see-through (dust, mist) or a multiply ground blob */
export class Fx {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; soft: THREE.MeshBasicMaterial; blob: THREE.MeshBasicMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat);
    this.mesh.visible = false; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  use(soft: boolean) { this.mesh.material = soft ? this.soft : this.mat; }
  bind() {
    const t = this.r?.tex;
    if (!t) return;
    if (this.r!.key.includes("|blob|")) {
      // no mipmaps: at grazing views the mip chain averages the blob with its white surround and it fades out
      if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; }
      this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5;
    }
    else { this.mat.map = t; this.soft.map = t; this.mesh.renderOrder = 0; }
  }
}

// ---------------- placements ----------------
export type Place = {
  key: string; draw: (p: Pen) => void; x: number; y: number; z: number;
  scale?: number; mirror?: boolean; yaw?: number; geo?: "body" | "swing"; roll?: number; size?: [number, number, number];
};
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number; flat?: boolean; rot?: number; soft?: boolean };
/** sun = world direction TOWARD the sun (optional: when absent the scene's shadow-casting light is used) */
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun?: THREE.Vector3 };

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const q = (v: number, n = 120) => Math.round(v * n) / n;
/** head-shape seed: 7 shapes, so marching soldiers in step still share canvases */
const seedOf = (i: number) => ((i * 5 + 3) % 7) + 1;
/** drawing resolution by distance: [canvas w, h, scale from the 600 x 1000 design]; sized for the 1440 x 2560 final */
const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];

// ---------------- light ----------------
const SUN = new THREE.Vector3(0.5, 0.75, -0.4).normalize();
const tmp = new THREE.Vector3();
let LNAME: "day" | "golden" = "day";
const sunOf = (root: THREE.Object3D) => {
  let s: THREE.DirectionalLight | null = null;
  root.traverse((o) => { if (!s && o instanceof THREE.DirectionalLight && o.castShadow) s = o; });
  return s as THREE.DirectionalLight | null;
};
/** the sun of the world that is calling: the attached root whose sun target sits on this camera's view axis */
const findSun = (cam: CamInfo, out: THREE.Vector3) => {
  if (cam.sun) return out.copy(cam.sun).normalize();
  let best: THREE.DirectionalLight | null = null, err = Infinity;
  for (const r of ROOTS) {
    if (!r.parent) continue;
    const s = sunOf(r);
    if (!s) continue;
    const d = tmp.copy(s.target.position).sub(cam.pos), e = Math.abs(d.dot(cam.right)) / (d.length() || 1);
    if (e < err) { err = e; best = s; }
  }
  return best ? out.copy(best.position).sub(best.target.position).normalize() : out;
};
/** canvas angle the sun comes FROM on an upright card facing the camera, in 45-degree steps (small texture cache) */
const light2D = (cam: CamInfo, mirror: boolean) => {
  const sx = SUN.dot(cam.right) * (mirror ? -1 : 1), sy = -SUN.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};

/** front / side view and mirroring for someone at (x, z) walking along (dx, dz); fs = foreshortening of the walk */
const viewOf = (cam: CamInfo, x: number, z: number, dx: number, dz: number) => {
  const tx = cam.pos.x - x, tz = cam.pos.z - z, tl = Math.hypot(tx, tz) || 1;
  const c = (tx * dx + tz * dz) / tl;
  return { side: c < 0.57, mirror: dx * cam.right.x + dz * cam.right.z < 0, fs: Math.round(Math.sqrt(Math.max(0, 1 - c * c)) * 20) / 20 };
};

// ---------------- life: blinks and reaction timing ----------------
/** reference expression and action changes land 0-3 f before the word onset */
const LEAD = 2 / FPS;
/** eyelid 0 open .. 1 shut. Reference: gaps 0.5-2.3 s, 4-frame blink half / shut / shut / half, plus a blink across
 *  every expression swap (the shut frames hide the swap) */
const LID = [0.5, 1, 1, 0.5];
const lidAt = (t: number, i: number, swaps: number[] = []) => {
  const f = Math.round(t * FPS);
  for (const ts of swaps) { const k = f - Math.round((ts - LEAD) * FPS) + 1; if (k >= 0 && k < 4) return LID[k]; }
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hh(i * 31 + n, 13)); // next blink 0.5-2.3 s later
  }
  return 0;
};
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));

type Who = { i: number; o: Outfit; okey: string };
/** one character drawing in the 600 x 1000 design space, sized by distance, lit from the scene's sun */
const person = (cam: CamInfo, who: Who, x: number, y: number, z: number, view: { side: boolean; mirror: boolean }, fo: FrontOpts, so: SideOpts, scale = 1): Place & { tierKey: string } => {
  const d = cam.pos.distanceTo(tmp.set(x, y + 1.2, z)) / scale;
  const [w, h, k] = tier(d);
  const mirror = view.side && view.mirror, light = light2D(cam, mirror), seed = seedOf(who.i);
  const f2: FrontOpts = { ...fo, light, seed }, s2: SideOpts = { ...so, light, seed };
  const key = view.side ? `S|${who.okey}|${fkey(s2)}` : `F|${who.okey}|${fkey(f2)}`;
  return {
    key, x, y, z, scale, mirror, tierKey: `${w}`,
    draw: (p) => (view.side ? bodySide(p, who.o, s2) : bodyFront(p, who.o, f2)),
    size: [w, h, k],
  };
};

/** ground shadow under a standing / sitting card (review rounds 2-4), multiply, blue-violet: a TIGHT contact pool right under
 *  the feet (~.5 on screen at the core) so nobody floats, plus by day (cards cast no real shadow) a lighter soft tail
 *  stretched AWAY from the sun, length ~1.6 m / tan(sun elevation), capped. Golden: world.ts casts real card shadows. */
const CONTACT: Record<"day" | "golden", [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33] };
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const blob = (out: Stage, x: number, y: number, z: number, sc = 1, k = 1) => {
  const hl = Math.hypot(SUN.x, SUN.z) || 1, ox = -SUN.x / hl, oz = -SUN.z / hl, rot = Math.atan2(-ox, -oz);
  if (LNAME === "day") {
    const el = Math.asin(Math.min(0.99, Math.max(0.1, SUN.y)));
    const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, h = len + 0.55 * sc, c = 0.3 * h; // feet at v = .2 of the card
    const tc = hexOf(TAIL, k);
    out.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * c, y: y + 0.018, z: z + oz * c,
      w: 0.72 * sc, h, flat: true, rot });
  }
  const cc = hexOf(CONTACT[LNAME], k);
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x: x + ox * 0.03 * sc, y: y + 0.022, z: z + oz * 0.03 * sc,
    w: 0.52 * sc, h: 0.4 * sc, flat: true, rot });
};



export type Stage = { places: Place[]; fx: FxPlace[] };

// ---------------- generic person spec ----------------
type Mode = "march" | "stroll" | "stand" | "sit" | "fall";
type Spec = {
  i: number; o: Outfit; x: number; z: number; y?: number; expr?: Expr; mode?: Mode; prop?: Prop; phase?: number;
  /** walking direction (decides front / side view); omit = always front view */
  dir?: [number, number]; tilt?: number; look?: number; wave?: number; scale?: number; run?: boolean; stride?: number;
  lift?: number; blink?: boolean; noBlob?: boolean; headTilt?: number;
};
const okeyOf = (o: Outfit) => JSON.stringify(o);
const put = (out: Stage, cam: CamInfo, t: number, s: Spec) => {
  const y = s.y ?? 0, mode = s.mode ?? "stand";
  const view = s.dir ? viewOf(cam, s.x, s.z, s.dir[0], s.dir[1]) : { side: false, mirror: false, fs: 1 };
  const blink = s.blink === false ? 0 : lidAt(t, s.i);
  const fo: FrontOpts = { phase: s.phase ?? 0, expr: s.expr ?? "neutral", mode, look: s.look ?? 0, blink, prop: s.prop ?? null, tilt: s.tilt ?? 0, wave: s.wave,
    lift: s.lift ?? 50, headTilt: s.headTilt ?? 0 };
  const so: SideOpts = { phase: s.phase ?? 0, expr: s.expr ?? "neutral", mode: mode === "march" || mode === "stroll" ? "march" : "stand", blink, stomp: s.run ? 1.5 : 1,
    stride: (s.stride ?? 1) * view.fs, prop: s.prop ?? null, run: s.run };
  out.places.push(person(cam, { i: s.i, o: s.o, okey: okeyOf(s.o) }, s.x, y, s.z, view, fo, so, s.scale ?? 1));
  if (!s.noBlob && mode !== "fall") blob(out, s.x, y, s.z, s.scale ?? 1);
};
/** marching phase for a walker at cadence hz (one cycle = two steps) */
const ph = (t: number, hz: number, off = 0) => q((((t * hz + off) % 1) + 1) % 1, 60);
/** expression switch on words: list of [time, expr]; the change lands LEAD before the word */
const ex = (t: number, first: Expr, steps: [number, Expr][]) => { let e = first; for (const [ts, x] of steps) if (t >= ts - LEAD) e = x; return e; };
const fxAt = (out: Stage, key: string, cw: number, ch: number, draw: (p: Pen) => void, x: number, y: number, z: number, w: number, h: number, extra: Partial<FxPlace> = {}) =>
  out.fx.push({ key, cw, ch, draw, x, y, z, w, h, ...extra });
const pop = (out: Stage, t: number, t0: number, x: number, y: number, z: number, size = 1.6) => {
  const u = (t - t0) / 0.4;
  if (u >= 0 && u < 1) fxAt(out, `pop${q(u, 20)}`, 500, 500, (p) => fxPop(p, q(u, 20)), x, y, z, size, size, { soft: true });
};
const burst = (out: Stage, t: number, t0: number, x: number, y: number, z: number, size = 1.2) => {
  const u = (t - t0) / 0.3;
  if (u >= 0 && u < 1) fxAt(out, `burst${q(u, 20)}`, 500, 500, (p) => fxBurst(p, q(u, 20)), x, y, z, size, size);
};
const puff = (out: Stage, t: number, t0: number, dur: number, x: number, y: number, z: number, size = 0.8) => {
  const u = (t - t0) / dur;
  if (u >= 0 && u < 1) fxAt(out, `puff${q(u, 20)}`, 400, 400, (p) => fxPuff(p, q(u, 20)), x, y, z, size, size, { soft: true });
};
const steam = (out: Stage, t: number, x: number, y: number, z: number, s = 0.5) =>
  fxAt(out, `steam${q((t * 0.8) % 1, 24)}`, 300, 400, (p) => fxSteam(p, q((t * 0.8) % 1, 24)), x, y, z, s * 0.75, s, { soft: true });
const flame = (out: Stage, t: number, i: number, x: number, y: number, z: number, s = 0.6) => {
  const u = q((t * 2.3 + hh(i, 3)) % 1, 12);
  fxAt(out, `flame${u}`, 300, 400, (p) => fxFlame(p, u), x, y + s * 0.5, z, s * 0.75, s);
};
/** a looping dig stroke 0..1 with a dirt toss at the top */
const digK = (t: number, i: number, hz = 1.1) => { const u = ((t * hz + hh(i, 2)) % 1 + 1) % 1; return q(u < 0.55 ? smooth(u / 0.55) : 1 - smooth((u - 0.55) / 0.45), 12); };
const dirtToss = (out: Stage, t: number, i: number, x: number, z: number, hz = 1.1) => {
  const u = ((t * hz + hh(i, 2)) % 1 + 1) % 1, v = (u - 0.45) / 0.45;
  if (v >= 0 && v < 1) fxAt(out, `dirt${q(v, 16)}`, 400, 400, (p) => fxDirt(p, q(v, 16)), x - 0.5, 0.55, z, 1.0, 1.0);
};
const hamK = (t: number, i: number, hz = 1.6) => { const u = ((t * hz + hh(i, 4)) % 1 + 1) % 1; return q(u < 0.7 ? 1 - smooth(u / 0.7) : smooth((u - 0.7) / 0.3), 12); };
const LEG = [0, 1, 2, 3].map((v) => legionary(v));
const LEGS = [0, 1, 2, 3].map((v) => legionary(v, { shield: true }));
const CIT = [0, 1, 2, 3, 4, 5].map((v) => citizen(v));
const TRIBE = [0, 1, 2, 3, 4].map((v) => tribesman(v));
const GOTH = [0, 1, 2, 3].map((v) => goth(v));

// ---------------- shots ----------------
type ShotFn = (t: number, cam: CamInfo, out: Stage) => void;
const S: Record<string, ShotFn> = {};

S.hook = (t, cam, out) => {
  const tS = ws(1, "shovel"), digging = t >= tS - LEAD;
  const expr = ex(t, "stern", [[ws(0, "secret"), "smile"], [ws(0, "sword"), "grin"], [tS, "grin"]]);
  put(out, cam, t, { i: 1, o: digging ? LEG[0] : LEGS[0], x: HOOK[0], z: HOOK[2], expr, prop: digging ? ["dig", digK(t, 1, 1.3)] : "gladius", tilt: digging ? 8 : 0 });
  if (digging) { dirtToss(out, t, 1, HOOK[0], HOOK[2] - 0.1, 1.3); burst(out, t, tS, HOOK[0] - 0.5, 0.3, HOOK[2] - 0.2, 1.0); }
  // comrades already digging in the background
  [[-3.5, 7], [3.2, 9.5], [-6.5, 14], [6, 16]].forEach(([dx, dz], k) => {
    put(out, cam, t, { i: 10 + k, o: LEG[(k + 1) % 4], x: HOOK[0] + dx, z: HOOK[2] + dz, expr: "neutral", prop: ["dig", digK(t, 10 + k)], tilt: 8 });
  });
};

S.rome = (t, cam, out) => {
  for (let k = 0; k < 14; k++) {
    const a = hh(k, 1) * Math.PI * 2, d = 4 + hh(k, 2) * 14, sp = 0.6 + hh(k, 3) * 0.5;
    const x = Math.cos(a) * d + Math.sin(t * 0.2 + k) * 0.5, z = Math.sin(a) * d - 4;
    put(out, cam, t, { i: 30 + k, o: CIT[k % 6], x, z, mode: "stroll", phase: ph(t, sp, hh(k)), dir: [Math.cos(a + 1.6), Math.sin(a + 1.6)], expr: "smile" });
  }
};

S.ridge = (t, cam, out) => {
  const tB = ws(3, "burn");
  for (let k = 0; k < 6; k++) {
    const side = -1.9 + k * 0.75 + (hh(k) - 0.5) * 0.2, back = (k % 2) * 1.1, p = ridgePt(side, 0), torch = k % 2 === 0;
    const x = p[0] - (k % 2) * 0.4, z = p[2] + back * 0.6;
    const expr = ex(t, k % 3 ? "stern" : "grin", [[tB, k % 2 ? "laugh" : "grin"]]);
    put(out, cam, t, { i: 50 + k, o: TRIBE[k % 5], x, z, y: p[1] - 0.05, expr, prop: torch ? "torch" : "spear", wave: undefined });
  }
};

S.mule = (t, cam, out) => {
  const z = muleZ(t), tA = ws(5, "armour"), tF = ws(5, "food"), tP = ws(5, "pot"), tSh = ws(5, "shovel"), tK = ws(6), tM = ws(7, "mules");
  const heavy = t >= tK - LEAD;
  let o: Outfit = { ...legionary(2), lorica: false, hat: "hair", hair: "#4a3020", crest: undefined };
  if (t >= tA - LEAD) o = legionary(2);
  const lvl = t >= tSh - LEAD ? 3 : t >= tP - LEAD ? 2 : t >= tF - LEAD ? 1 : 0;
  const cad = heavy ? 0.7 : 0.9, side = t >= tM - 0.3;
  const expr = ex(t, "smile", [[tA, "smile_closed"], [tK, "nervous"], [tM, "smile_closed"]]);
  put(out, cam, t, { i: 61, o, x: MULE_X, z, mode: "march", phase: ph(t, cad), dir: [0, 1], expr, prop: lvl ? ["furca", lvl] : null, tilt: heavy ? 4 * Math.sin(t * 4) : 0, lift: 35 });
  for (const tt of [tA, tF, tP, tSh]) pop(out, t, tt - 0.05, MULE_X + 0.3, 1.9, z + 0.1, 0.9);
  if (heavy && !side) { const u = (t * 1.3) % 1; fxAt(out, "sweat", 120, 160, fxSweat, MULE_X - 0.42, 2.0 - 0.3 * u, z + 0.05, 0.12, 0.16); }
  if (side) {
    // the mule walks beside him (far side) and gives the camera a look
    const mp = ph(t, cad, 0.25);
    out.places.push({ key: `mule|${mp}|${lidAt(t, 62) ? 1 : 0}`, x: MULE_X - 1.5, y: 0, z: z + 0.3, scale: 1 / MULE_K, mirror: false,
      yaw: Math.atan2(cam.pos.x - (MULE_X - 1.5), cam.pos.z - (z + 0.3)), draw: (p) => muleSide(p, mp, true, lidAt(t, 62)), size: [480, 800, 0.8] });
    blob(out, MULE_X - 1.5, 0, z + 0.3, 1.6);
  }
};

const campDiggers = (t: number, cam: CamInfo, out: Stage, n: number, spread: number) => {
  for (let k = 0; k < n; k++) {
    const x = CAMP[0] - spread + (k * 2 * spread) / Math.max(1, n - 1), z = CAMP[2] - CAMP_H - 3.4 + (hh(k, 7) - 0.5) * 0.6;
    put(out, cam, t, { i: 70 + k, o: LEG[k % 4], x, z, expr: k % 3 ? "neutral" : "smile_closed", prop: ["dig", digK(t, 70 + k)], tilt: 8 });
    if (cam.pos.distanceTo(tmp.set(x, 1, z)) < 14) dirtToss(out, t, 70 + k, x, z);
  }
};
S.camp = (t, cam, out) => {
  const tD = ws(9, "dig");
  if (t < tD - 0.2) {
    // the column arrives along the track
    for (let k = 0; k < 16; k++) {
      const row = k >> 2, x = MULE_X - 1.5 + (k & 3) * 1.0, z = CAMP[2] - CAMP_H - 22 + (t - ws(8)) * 1.3 - row * 1.4;
      put(out, cam, t, { i: 80 + k, o: LEGS[k % 4], x, z, mode: "march", phase: ph(t, 0.9), dir: [0, 1], expr: "neutral", prop: "shovel" });
    }
  } else {
    campDiggers(t, cam, out, 9, 14);
    // others on the far sides (aerial)
    for (let k = 0; k < 16; k++) {
      const side = k % 3, s = -22 + (k >> 2) * 14, d = CAMP_H + 3.4;
      const [x, z] = side === 0 ? [CAMP[0] + d, CAMP[2] + s] : side === 1 ? [CAMP[0] - d, CAMP[2] + s] : [CAMP[0] + s, CAMP[2] + d];
      put(out, cam, t, { i: 100 + k, o: LEG[k % 4], x, z, prop: ["dig", digK(t, 100 + k)], tilt: 8, expr: "neutral" });
    }
  }
};
// static helper for the camp fire spots without building geometry every frame
const FIRE_AT: [number, number][] = Array.from({ length: 6 }, (_, i) => [CAMP[0] - 17 + (i % 3) * 17, CAMP[2] - 14 + Math.floor(i / 3) * 28]);
S.campNight = (t, cam, out) => {
  FIRE_AT.forEach(([fx, fz], i) => {
    flame(out, t, i, fx, 0.1, fz, 1.1);
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + i, x = fx + Math.cos(a) * 1.7, z = fz + Math.sin(a) * 1.7;
      put(out, cam, t, { i: 120 + i * 4 + k, o: LEG[(i + k) % 4], x, z, mode: "sit", expr: k % 2 ? "smile_closed" : "laugh" });
    }
  });
};

const roadCrew = (t: number, cam: CamInfo, out: Stage) => {
  const spots: [number, number, "dig" | "hammer"][] = [[-2.0, 3.0, "hammer"], [1.8, 2.2, "hammer"], [-0.4, 6.5, "dig"], [3.8, 5, "dig"], [-4.2, 7.5, "dig"], [0.9, 9.5, "hammer"]];
  spots.forEach(([dx, dz, kind], k) => {
    const x = RD2_X + dx, z = RD2_END + dz, onTop = Math.abs(dx) < 2.5 && dz > 10;
    put(out, cam, t, { i: 140 + k, o: LEG[k % 4], x, z, y: onTop ? 0.62 : 0, prop: kind === "dig" ? ["dig", digK(t, 140 + k)] : ["hammer", hamK(t, 140 + k)], tilt: kind === "dig" ? 8 : 4, expr: "neutral" });
  });
};
S.road = (t, cam, out) => {
  roadCrew(t, cam, out);
  // the army marches on ahead along the dirt track
  for (let k = 0; k < 20; k++) {
    const row = k >> 2, x = RD2_X - 1.5 + (k & 3) * 1.0, z = RD2_END - 14 - 1.4 * (t - ws(11)) - row * 1.4;
    put(out, cam, t, { i: 160 + k, o: LEGS[k % 4], x, z, mode: "march", phase: ph(t, 0.9), dir: [0, -1], expr: "neutral", prop: "shovel" });
  }
};
S.layers = (t, cam, out) => {
  put(out, cam, t, { i: 181, o: LEG[1], x: RD2_X + 3.6, z: RD2_END + 2.4, prop: ["dig", digK(t, 181)], tilt: 8, expr: "smile_closed" });
  put(out, cam, t, { i: 182, o: LEG[3], x: RD2_X - 3.8, z: RD2_END + 3.2, prop: ["hammer", hamK(t, 182)], tilt: 4, expr: "neutral" });
  put(out, cam, t, { i: 183, o: LEG[0], x: RD2_X - 1.2, z: RD2_END + 8, y: 0.62, prop: ["hammer", hamK(t, 183)], tilt: 4, expr: "neutral" });
  const y = [0.25, 0.4, 0.5, 0.62];
  [ws(12, "stone"), ws(12, "gravel"), ws(12, "sand"), se(12)].forEach((tt, i) => pop(out, t, tt - 0.05, RD2_X + 1.2, y[i] + 0.2, RD2_END + 0.2, 1.4));
};
S.roadAir = (t, cam, out) => {
  for (let k = 0; k < 24; k++) {
    const row = k >> 2, x = RD2_X - 1.5 + (k & 3) * 1.0, z = RD2_END - 60 - 1.4 * (t - ws(13)) - row * 1.4;
    put(out, cam, t, { i: 190 + k, o: LEGS[k % 4], x, z, mode: "march", phase: ph(t, 0.9), dir: [0, -1], expr: "neutral", prop: "shovel", noBlob: true });
  }
  roadCrew(t, cam, out);
};
S.army = (t, cam, out) => {
  const tw = ws(14, "week"), run = t >= tw - LEAD, z0 = armyZ(t);
  for (let k = 0; k < 16; k++) {
    const row = k >> 2, x = -1.5 + (k & 3) * 1.0 + (hh(k) - 0.5) * 0.1, z = z0 - row * 1.5;
    put(out, cam, t, { i: 220 + k, o: LEGS[k % 4], x, z, mode: "march", phase: ph(t, run ? 1.6 : 0.9, (k & 1) * 0.02), dir: [0, 1], expr: run ? (k % 3 ? "grin" : "laugh") : "neutral",
      prop: "shovel", run, stride: run ? 1.6 : 1, lift: run ? 80 : 50, tilt: run ? 6 : 0 });
    if (run && k % 4 === 0) puff(out, t, tw + (k / 16) * 0.3 + Math.floor((t - tw) / 0.5) * 0.5, 0.5, x, 0.3, z - 0.9, 0.9);
  }
  if (run) fxAt(out, `speed${q((t * 2) % 1, 16)}`, 400, 200, (p) => fxSpeed(p, q((t * 2) % 1, 16)), 2.2, 1.4, z0 + 0.5, 1.6, 0.8, { soft: true });
};

S.caesar = (t, cam, out) => {
  put(out, cam, t, { i: 300, o: CAESAR, x: RHINE[0] - 3, z: RHINE[2] - 42, expr: ex(t, "stern", [[ws(15, "cross"), "smile"]]), look: 0 });
  put(out, cam, t, { i: 301, o: legionary(1), x: RHINE[0] - 6.2, z: RHINE[2] - 39.6, prop: "banner", expr: "neutral" });
  put(out, cam, t, { i: 302, o: legionary(3), x: RHINE[0] + 0.4, z: RHINE[2] - 39.2, prop: "spear", expr: "stern" });
  tribesOnFarBank(t, cam, out, "laugh");
};
const tribesOnFarBank = (t: number, cam: CamInfo, out: Stage, mood: Expr) => {
  for (let k = 0; k < 9; k++) {
    const x = RHINE[0] - 8 + k * 2.0 + (hh(k) - 0.5) * 0.6, z = RHINE[2] + RIVER_W + 6 + (k % 3) * 1.4;
    const wave = k % 2 ? q(Math.sin(t * 8 + k), 10) : undefined;
    put(out, cam, t, { i: 320 + k, o: TRIBE[k % 5], x, z, expr: k % 3 === 1 ? "grin" : mood, prop: k % 2 ? null : "spear", wave });
  }
};
S.tribes = (t, cam, out) => tribesOnFarBank(t, cam, out, "laugh");
S.noBoats = (t, cam, out) => {
  const tN = ws(16, "boats");
  put(out, cam, t, { i: 300, o: CAESAR, x: RHINE[0] - 2, z: RHINE[2] - RIVER_W - 3.5, expr: ex(t, "neutral", [[tN, "nervous"]]), prop: t >= tN - LEAD ? "shrug" : null });
  [[-5, -0.5], [-7.5, -2.2], [1.5, -1], [3.6, -2.5]].forEach(([dx, dz], k) =>
    put(out, cam, t, { i: 340 + k, o: LEG[k % 4], x: RHINE[0] + dx, z: RHINE[2] - RIVER_W - 4 + dz, expr: ex(t, "neutral", [[tN, "nervous"]]), look: 1 }));
};
S.build = (t, cam, out) => {
  const b = bridgeState(SHOTS.find((s) => s.name === "build")!.id, t), tD = ws(18);
  if (t < tD - 0.2) {
    const zf = RhineBridge.z(Math.max(0, Math.min(BENTS - 1, Math.floor(b.built))));
    for (let k = 0; k < 6; k++) {
      const x = RHINE[0] - 2.4 + (k % 3) * 2.4, z = zf - 1 - Math.floor(k / 3) * 2.2;
      if (z < RHINE[2] - RIVER_W) continue;
      put(out, cam, t, { i: 360 + k, o: LEG[k % 4], x, z, y: DECK_Y + 0.12, prop: ["hammer", hamK(t, 360 + k, 2)], tilt: 4, expr: "neutral" });
      if (k < 3 && hamK(t, 360 + k, 2) < 0.15) burst(out, t, t - 0.01, x + 0.5, DECK_Y + 0.4, z, 0.5);
    }
    for (let k = 0; k < 6; k++) put(out, cam, t, { i: 370 + k, o: LEG[(k + 2) % 4], x: RHINE[0] - 7 + k * 2.6, z: RHINE[2] - RIVER_W - 5 - (k % 2) * 2, prop: k % 2 ? "sack" : ["dig", digK(t, 370 + k)], tilt: k % 2 ? 0 : 8 });
    tribesOnFarBank(t, cam, out, "shock");
  } else {
    put(out, cam, t, { i: 300, o: CAESAR, x: RHINE[0] + 0.2, z: RHINE[2] - 13, y: DECK_Y + 0.12, expr: "grin", prop: "arms" });
    [[-2.2, 1.5], [2.4, 2.2], [-1.2, 4.5], [1.4, 5.5]].forEach(([dx, dz], k) =>
      put(out, cam, t, { i: 380 + k, o: LEG[k % 4], x: RHINE[0] + dx, z: RHINE[2] - 13 + dz, y: DECK_Y + 0.12, prop: "cheer", expr: k % 2 ? "laugh" : "grin" }));
  }
};
S.impressed = (t, cam, out) => {
  const tI = ws(19, "impressed");
  [[-1.2, 47.2], [0.6, 47.8], [2.2, 47.1], [3.7, 48.4], [-2.6, 48.6]].forEach(([dx, z], k) => {
    const wow = t >= tI - LEAD;
    put(out, cam, t, { i: 400 + k, o: TRIBE[k % 5], x: RHINE[0] + dx, z: RHINE[2] + z, expr: wow ? (k % 2 ? "relief_open" : "grin") : "shock", prop: wow && k % 2 === 0 ? "cheer" : null, look: -1 });
  });
};
S.torn = (t, cam, out) => {
  const tT = ws(20, "torn"), wide = t >= tT - 0.3;
  if (!wide) {
    const z = caesarBackZ(t);
    put(out, cam, t, { i: 300, o: CAESAR, x: RHINE[0] + 0.2, z, y: z > RHINE[2] - RIVER_W ? DECK_Y + 0.12 : 0, mode: "stroll", phase: ph(t, 0.8), dir: [0, -1], expr: "smile_closed" });
    for (let k = 0; k < 3; k++) put(out, cam, t, { i: 410 + k, o: LEG[k], x: RHINE[0] - 1.6 + k * 1.6, z: z + 2.4 + k * 0.6, y: z + 2 > RHINE[2] - RIVER_W ? DECK_Y + 0.12 : 0, mode: "march", phase: ph(t, 0.9, k * 0.1), dir: [0, -1], expr: "neutral" });
  } else {
    put(out, cam, t, { i: 300, o: CAESAR, x: RHINE[0] - 5, z: RHINE[2] - RIVER_W - 5, expr: "smile", prop: "arms" });
    for (let k = 0; k < 4; k++) put(out, cam, t, { i: 420 + k, o: LEG[k], x: RHINE[0] - 2.8 + k * 1.9, z: RHINE[2] - RIVER_W - 2.4, prop: ["hammer", hamK(t, 420 + k, 2.2)], tilt: 4, expr: "neutral" });
    // splashes as each deck section hits the water
    const b = bridgeState(SHOTS.find((s) => s.name === "torn")!.id, t);
    for (let k = 0; k < BENTS - 1; k++) {
      const order = (BENTS - 2 - k) / (BENTS - 1), tHit = tT - 0.1 + (order * 0.8 + 0.25 * 0.6) * 1.3, u = (t - tHit) / 0.9;
      if (u >= 0 && u < 1) fxAt(out, `splash${q(u, 20)}`, 800, 800, (p) => fxSplash(p, q(u, 20)), RHINE[0], WATER_Y + 2.4, (RhineBridge.z(k) + RhineBridge.z(k + 1)) / 2, 7, 7);
    }
    void b;
  }
};

S.stall = (t, cam, out) => {
  const tP = ws(22, "pizza"), has = t >= tP - LEAD;
  put(out, cam, t, { i: 500, o: SHOPKEEPER, x: STALL[0], z: STALL[2] + 0.1, expr: has ? "grin" : "smile", prop: has ? "pizza" : "arms" });
  if (has) { steam(out, t, STALL[0], 1.95, STALL[2] - 0.15, 0.55); pop(out, t, tP - 0.05, STALL[0], 1.6, STALL[2] - 0.3, 1.0); }
  put(out, cam, t, { i: 501, o: CIT[0], x: STALL[0] - 2.4, z: STALL[2] - 2.2, expr: "smile", look: 1 });
  put(out, cam, t, { i: 502, o: CIT[3], x: STALL[0] + 2.6, z: STALL[2] - 2.8, expr: has ? "shock" : "neutral", look: -1 });
};
S.branch = (t, cam, out) => {
  const k = branchUp(t), tB = ws(23, "branch");
  pop(out, t, tB - 0.15, BRANCH[0], 1.4, BRANCH[2], 4.2);
  if (k > 0.5) put(out, cam, t, { i: 510, o: { ...SHOPKEEPER, jacket: "#5a8fc2", pants: "#5a8fc2" }, x: BRANCH[0], z: BRANCH[2] + 0.1, expr: "grin", prop: "pizza" });
  if (k > 0.5) steam(out, t, BRANCH[0], 1.95, BRANCH[2] - 0.15, 0.55);
  for (let j = 0; j < 6; j++) {
    const x = BRANCH[0] - 4 + j * 1.6, z = BRANCH[2] - 3.5 - (j % 2) * 1.2;
    put(out, cam, t, { i: 511 + j, o: TRIBE[j % 5], x, z, expr: t >= tB - LEAD ? (j % 2 ? "shock" : "grin") : "neutral", prop: t >= tB + 0.4 && j % 3 === 0 ? "cheer" : null });
  }
};
S.runner = (t, cam, out) => {
  const z = runnerZ(t);
  put(out, cam, t, { i: 520, o: legionary(1), x: 0, z, mode: "march", phase: ph(t, 1.9), dir: [0, -1], expr: "grin", prop: "pizza", run: true, lift: 90, stride: 1.7, tilt: 6 });
  steam(out, t, 0.15, 1.95, z + 0.4, 0.6);
  puff(out, t, Math.floor(t / 0.35) * 0.35, 0.5, 0, 0.25, z + 0.8, 0.8);
  fxAt(out, `speed${q((t * 2.5) % 1, 16)}`, 400, 200, (p) => fxSpeed(p, q((t * 2.5) % 1, 16)), -0.9, 1.3, z + 0.9, 1.4, 0.7, { soft: true });
  // travellers stepping aside
  [[-3.2, -12, 2], [3.4, -26, 0], [-3.0, -40, 4]].forEach(([x, dz, v], k) => put(out, cam, t, { i: 525 + k, o: CIT[v], x, z: -160 + dz, expr: "shock", look: 1 }));
};
S.network = () => { /* aerial: scenery only */ };
S.parade = (t, cam, out) => {
  const cZ = -201, passAt = (tw: number, v: number) => cZ + v * (t - tw - 0.9);
  const tS = ws(26, "soldiers"), tL = ws(26, "letters"), tT = ws(26, "taxes"), tG = ws(26, "grain"), fast = t >= ws(26, "fast") - LEAD;
  const g = (k: number, o: Outfit, tw: number, v: number, dx: number, prop: Prop, expr: Expr, run = false) => {
    const z = passAt(tw, v * (fast ? 1.5 : 1)) - dx;
    if (t < tw - 2.5) return;
    put(out, cam, t, { i: 530 + k, o, x: (k % 2) * 0.9 - 0.4, z, mode: "march", phase: ph(t, run ? 1.7 : 1.0, k * 0.13), dir: [0, 1], expr, prop, run, lift: run ? 80 : 45 });
  };
  g(0, LEGS[0], tS, 2.2, 0, "shovel", "neutral"); g(1, LEGS[2], tS, 2.2, 1.3, "shovel", "neutral");
  g(2, { ...citizen(1), dress: undefined, jacket: "#5a8fc2", pants: "#5a8fc2" }, tL, 4.5, 0, "scroll", "grin", true);
  g(3, { ...citizen(4), build: "stout" }, tT, 2.4, 0, "coins", "smile_closed");
  g(4, citizen(2), tG, 2.2, 0, "sack", "nervous"); g(5, citizen(5), tG, 2.2, 1.4, "sack", "nervous");
};
S.village = (t, cam, out) => {
  const tR = ws(28, "roman"), roman = t >= tR - LEAD;
  const spots: [number, number][] = [[-3.2, 0.6], [-1.6, -0.4], [0.2, 0.4], [1.9, -0.3], [3.4, 0.8], [-0.8, 2.2], [1.2, 2.4]];
  spots.forEach(([dx, dz], k) => {
    const o = roman ? CIT[(k + 1) % 6] : TRIBE[k % 5];
    put(out, cam, t, { i: 600 + k, o: k === 5 ? villageKid(roman) : o, x: VILLAGE[0] + dx, z: VILLAGE[2] + dz, expr: roman ? (k % 2 ? "grin" : "smile_closed") : k % 2 ? "stern" : "nervous", scale: k === 5 ? 0.72 : 1 });
    pop(out, t, tR - 0.1 + k * 0.03, VILLAGE[0] + dx, 1.2, VILLAGE[2] + dz - 0.2, 1.8);
  });
  put(out, cam, t, { i: 610, o: { ...CAESAR, hat: "hair", hair: "#3a2a20", sash: "#b8322f" }, x: VILLAGE[0] + 4.8, z: VILLAGE[2] - 2.2, expr: roman ? "grin" : "smile", prop: roman ? "cheer" : "scroll" });
};
S.sons = (t, cam, out) => {
  const tJ = ws(29, "joined"), tP = ws(29, "picked"), tB = ws(29, "built");
  if (t < tB - 0.2) {
    const grown = t >= tJ - LEAD, x = VILLAGE[0] + 4.4, z = VILLAGE[2] - 8.5;
    put(out, cam, t, { i: 620, o: grown ? legionary(2, { hair: "#c9a04a" }) : villageKid(true), x, z, scale: grown ? 1 : 0.72,
      expr: grown ? "grin" : "smile", prop: t >= tP - LEAD ? ["dig", digK(t, 620, 1.3)] : grown ? "shovel" : null, tilt: t >= tP - LEAD ? 8 : 0 });
    pop(out, t, tJ - 0.1, x, 1.0, z - 0.2, 2.0);
    put(out, cam, t, { i: 621, o: TRIBE[1], x: x - 2.0, z: z + 1.5, expr: grown ? "relief_open" : "smile" });
    put(out, cam, t, { i: 622, o: TRIBE[4], x: x + 2.0, z: z + 1.8, expr: grown ? "grin" : "smile", prop: grown ? "cheer" : null });
  } else {
    put(out, cam, t, { i: 620, o: legionary(2, { hair: "#c9a04a" }), x: RD2_X + 1.6, z: RD2_END + 3, prop: ["dig", digK(t, 620)], tilt: 8, expr: "grin" });
    roadCrew(t, cam, out);
  }
};
S.citizens = (t, cam, out) => {
  const tC = ws(30, "citizen");
  for (let k = 0; k < 22; k++) {
    const x = -9 + (k % 8) * 2.4 + (hh(k) - 0.5) * 0.8, z = -4 + Math.floor(k / 8) * 2.2 + (hh(k, 2) - 0.5) * 0.8;
    const yay = t >= tC - LEAD, hop = yay ? Math.max(0, Math.sin(t * 9 + k)) * 0.15 : 0;
    put(out, cam, t, { i: 640 + k, o: k % 5 === 4 ? TRIBE[k % 5] : CIT[k % 6], x, z, y: hop, expr: yay ? (k % 2 ? "laugh" : "grin") : "smile", prop: yay && k % 2 ? "cheer" : null,
      wave: !yay && k % 3 === 0 ? q(Math.sin(t * 7 + k), 10) : undefined });
  }
  for (let k = 0; k < 3; k++) put(out, cam, t, { i: 670 + k, o: LEG[k], x: -6 + k * 6, z: 4.5, prop: "banner", expr: "smile_closed" });
};
S.peak = () => { /* aerial */ };
S.milestone = (t, cam, out) => {
  [[-2.2, 1.2, 0], [2.6, 1.8, 3], [-1.0, 3.6, 5], [1.6, -1.6, 2]].forEach(([dx, dz, v], k) =>
    put(out, cam, t, { i: 700 + k, o: CIT[v], x: MILESTONE[0] + dx, z: MILESTONE[2] + dz, expr: k % 2 ? "smile_closed" : "smile", look: dx > 0 ? -1 : 1 }));
  put(out, cam, t, { i: 705, o: LEG[2], x: MILESTONE[0] - 3.4, z: MILESTONE[2] + 0.6, expr: "smile_closed", prop: "spear" });
};
S.gate = (t, cam, out) => {
  const second = t >= ws(34) - 0.2;
  if (!second) {
    for (let k = 0; k < 8; k++) {
      const z = GATE_Z - 30 + (t - ws(33)) * 1.2 - k * 3.4, x = (k % 2 ? 1 : -1) * (0.8 + hh(k) * 0.6);
      put(out, cam, t, { i: 720 + k, o: CIT[k % 6], x, z, mode: "stroll", phase: ph(t, 0.8, hh(k)), dir: [0, 1], expr: "smile" });
    }
  } else {
    put(out, cam, t, { i: 730, o: CIT[2], x: -1.2, z: GATE_Z - 3.2, mode: "sit", expr: "smile_closed" });
    put(out, cam, t, { i: 731, o: legionary(0), x: 0.4, z: GATE_Z - 2.6, expr: "smile_closed", prop: "arms" });
    put(out, cam, t, { i: 732, o: CIT[4], x: -2.6, z: GATE_Z - 1.8, expr: "laugh" });
  }
};
const gothColumn = (t: number, cam: CamInfo, out: Stage) => {
  const z0 = gothZ(t);
  for (let k = 0; k < 28; k++) {
    const row = k >> 2, x = -1.8 + (k & 3) * 1.2 + (hh(k) - 0.5) * 0.3, z = z0 - row * 1.6;
    put(out, cam, t, { i: 740 + k, o: GOTH[k % 4], x, z, mode: "march", phase: ph(t, 0.9, (k & 1) * 0.05), dir: [0, 1], expr: k % 3 ? "grin" : "smile", prop: k % 4 === 0 ? "banner" : "spear" });
  }
};
S.goths = (t, cam, out) => {
  gothColumn(t, cam, out);
  put(out, cam, t, { i: 731, o: legionary(0), x: 2.6, z: GATE_Z - 1.0, expr: "smile_closed", prop: "spear" });
};
S.guard = (t, cam, out) => {
  const t0 = SHOTS[SHOTS.length - 1].a / FPS, second = t >= t0 + 26 / FPS;
  if (!second) put(out, cam, t, { i: 731, o: legionary(0), x: 2.6, z: GATE_Z - 1.0, expr: "shock", prop: "spear" });
  else {
    put(out, cam, t, { i: 760, o: GOTH[0], x: 0, z: GATE_Z - 11.5, expr: "grin", wave: q(Math.sin(t * 9), 10) });
    for (let k = 1; k < 9; k++) put(out, cam, t, { i: 760 + k, o: GOTH[k % 4], x: -2.2 + (k % 4) * 1.4, z: GATE_Z - 13.5 - Math.floor(k / 4) * 1.7, expr: k % 2 ? "grin" : "smile", prop: k % 3 ? "spear" : "banner" });
  }
};

/** everything with a face in shot `id` at time t */
export const stage = (id: number, t: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1];
  LNAME = s.light;
  findSun(cam, SUN);
  S[s.name]?.(t, cam, out);
  return out;
};
void [fxStars, fxShadow, fxContact, NOINK, ROME, clamp01, CAMP_H];
