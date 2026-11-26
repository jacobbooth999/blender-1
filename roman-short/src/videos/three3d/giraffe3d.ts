// 3D look test for "Why Lions Are Scared of Giraffes": stylised, chunky cartoon animals (big eyes, soft clay-like
// materials) built from primitives in three.js, a savanna world with soft sun shadows, fog for depth, and the same
// kinetic captions on top. Rendered as vertical stills by scripts/three-stills.mjs (window.RENDER3D(shot, W, H)).
import * as THREE from "three";

type V = [number, number, number];
const v3 = (p: V) => new THREE.Vector3(...p);
let seedS = 1;
const rnd = () => { seedS = (seedS * 16807) % 2147483647; return (seedS - 1) / 2147483646; };
const reseed = (s: number) => { seedS = s; };

// ---------- textures ----------
const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t;
};
/** reticulated giraffe coat: rounded brown patches separated by cream lines (Voronoi, tileable) */
const giraffeTex = (cells = 9, line = 0.09, base = "#f6e6c4") => canvasTex(512, 512, (g) => {
  reseed(77); const N = cells, pts: [number, number, string][] = [];
  const browns = ["#d0782f", "#c46b27", "#d9853a", "#c97230"];
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) pts.push([(i + 0.15 + rnd() * 0.7) / N, (j + 0.15 + rnd() * 0.7) / N, browns[Math.floor(rnd() * 4)]]);
  const img = g.createImageData(512, 512), d = img.data, bc = new THREE.Color(base);
  for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
    const u = x / 512, v = y / 512; let d1 = 9, d2 = 9, col = "";
    const ci = Math.floor(u * N), cj = Math.floor(v * N);
    for (let dj = -2; dj <= 2; dj++) for (let di = -2; di <= 2; di++) {
      const ii = (ci + di + N) % N, jj = (cj + dj + N) % N, p = pts[jj * N + ii];
      const px = p[0] + Math.floor((ci + di) / N) * 1 + (ci + di < 0 ? 0 : 0), py = p[1] + Math.floor((cj + dj) / N);
      const dd = Math.hypot((px - u) * N, (py - v) * N);
      if (dd < d1) { d2 = d1; d1 = dd; col = p[2]; } else if (dd < d2) d2 = dd;
    }
    const k = (y * 512 + x) * 4, edge = d2 - d1;
    const c = edge > line * 2 ? new THREE.Color(col) : bc;
    const sh = edge > line * 2 ? 1 - Math.min(0.12, d1 * 0.12) : 1;
    d[k] = c.r * 255 * sh; d[k + 1] = c.g * 255 * sh; d[k + 2] = c.b * 255 * sh; d[k + 3] = 255;
  }
  g.putImageData(img, 0, 0);
});
const stripeTex = () => canvasTex(512, 256, (g) => {
  g.fillStyle = "#f5f2ea"; g.fillRect(0, 0, 512, 256); g.fillStyle = "#1f1b1d";
  for (let x = 0; x < 512; x += 42) { g.beginPath(); g.moveTo(x, 0); for (let y = 0; y <= 256; y += 16) g.lineTo(x + Math.sin(y / 40) * 8, y); for (let y = 256; y >= 0; y -= 16) g.lineTo(x + 18 + Math.sin(y / 40) * 8, y); g.fill(); }
});
const groundTex = () => canvasTex(1024, 1024, (g) => {
  g.fillStyle = "#d6b46a"; g.fillRect(0, 0, 1024, 1024); reseed(5);
  for (let i = 0; i < 260; i++) { g.fillStyle = rnd() < 0.5 ? "rgba(185,145,70,0.22)" : "rgba(236,214,150,0.25)"; g.beginPath(); g.ellipse(rnd() * 1024, rnd() * 1024, 20 + rnd() * 80, 10 + rnd() * 40, rnd() * 3, 0, 7); g.fill(); }
  g.strokeStyle = "rgba(140,105,45,0.35)"; g.lineWidth = 2;
  for (let i = 0; i < 2500; i++) { const x = rnd() * 1024, y = rnd() * 1024; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - 0.5) * 6, y - 8 - rnd() * 8); g.stroke(); }
});

// ---------- materials & primitives ----------
const M = (color: string | THREE.Texture, rough = 0.75, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial(typeof color === "string" ? { color, roughness: rough, ...extra } : { map: color, roughness: rough, ...extra });
const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material, parent?: THREE.Object3D) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; parent?.add(m); return m; };
const ball = (parent: THREE.Object3D, mat: THREE.Material, p: V, s: V, rot: V = [0, 0, 0]) => { const m = mesh(new THREE.SphereGeometry(1, 40, 28), mat, parent); m.position.set(...p); m.scale.set(...s); m.rotation.set(...rot); return m; };
/** tapered limb from a to b with rounded ends */
const limb = (parent: THREE.Object3D, mat: THREE.Material, a: V, b: V, r1: number, r2: number, joints = true) => {
  const A = v3(a), B = v3(b), len = A.distanceTo(B);
  const m = mesh(new THREE.CylinderGeometry(r2, r1, len, 20, 1), mat, parent);
  m.position.copy(A.clone().add(B).multiplyScalar(0.5));
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  if (joints) { ball(parent, mat, a, [r1, r1, r1]); ball(parent, mat, b, [r2, r2, r2]); }
  return m;
};
/** two-bone IK in the x-y plane (z fixed): returns the knee */
const ik = (h: V, f: V, l1: number, l2: number, bend: number): V => {
  const dx = f[0] - h[0], dy = f[1] - h[1], d = Math.min(l1 + l2 - 1e-3, Math.hypot(dx, dy));
  const a = Math.atan2(dy, dx), c = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  return [h[0] + Math.cos(a + bend * c) * l1, h[1] + Math.sin(a + bend * c) * l1, h[2]];
};
/** a smooth tapered tube along a curve (neck, tail) */
const tube = (parent: THREE.Object3D, mat: THREE.Material, pts: V[], r0: number, r1: number) => {
  const curve = new THREE.CatmullRomCurve3(pts.map(v3)), seg = 40, rad = 18;
  const geo = new THREE.TubeGeometry(curve, seg, 1, rad, false), pos = geo.attributes.position, nrm = geo.attributes.normal;
  for (let i = 0; i <= seg; i++) { const t = i / seg, r = r0 + (r1 - r0) * t, c = curve.getPointAt(t); for (let j = 0; j <= rad; j++) { const k = i * (rad + 1) + j; pos.setXYZ(k, c.x + nrm.getX(k) * r, c.y + nrm.getY(k) * r, c.z + nrm.getZ(k) * r); } }
  geo.computeVertexNormals();
  const m = mesh(geo, mat, parent); ball(parent, mat, pts[0], [r0, r0, r0]); ball(parent, mat, pts[pts.length - 1], [r1, r1, r1]); return m;
};

type Emotion = "neutral" | "scared" | "smug" | "angry" | "happy" | "dazed" | "determined";
/** cartoon eye on the side of a head: white, iris, pupil, highlight and an upper lid for the mood */
const eye = (parent: THREE.Object3D, p: V, r: number, emo: Emotion, side: number, look: V = [1, 0, 0]) => {
  const g = new THREE.Group(); g.position.set(...p); parent.add(g);
  ball(g, M("#ffffff", 0.3), [0, 0, 0], [r, r, r]);
  const L = v3(look).normalize(), ps = emo === "scared" ? 0.38 : emo === "dazed" ? 0.5 : 0.55;
  const iris = ball(g, M("#3b2416", 0.35), [L.x * r * 0.78, L.y * r * 0.78, side * r * 0.62 + L.z * r * 0.3], [r * ps, r * ps, r * ps * 0.6]);
  ball(g, M("#0d0a09", 0.2), [L.x * r * 0.93, L.y * r * 0.93, side * r * 0.72], [r * ps * 0.55, r * ps * 0.55, r * ps * 0.35]);
  ball(g, M("#ffffff", 0.1, { emissive: "#ffffff", emissiveIntensity: 0.6 }), [L.x * r * 0.9 + r * 0.12, L.y * r * 0.9 + r * 0.22, side * r * 0.86], [r * 0.12, r * 0.12, r * 0.06]);
  void iris;
  const lid = emo === "smug" ? 0.55 : emo === "angry" || emo === "determined" ? 0.4 : emo === "neutral" || emo === "happy" ? 0.15 : emo === "dazed" ? 0.6 : 0;
  if (lid > 0) {
    const lidM = mesh(new THREE.SphereGeometry(r * 1.06, 32, 16, 0, Math.PI * 2, 0, Math.PI * lid), M("#c58a4e", 0.7), g);
    lidM.rotation.z = emo === "angry" || emo === "determined" ? -0.35 * side * 0 - 0.35 : 0.2;
  }
  return g;
};

// ---------- animals ----------
type Leg = { foot: V; bend?: number };
type GiraffeOpts = { emo?: Emotion; neck?: V[]; headRot?: number; legs?: Partial<Record<"fn" | "ff" | "hn" | "hf", Leg>>; scale?: number; bodyTilt?: number; look?: V };
const COAT = () => M(giraffeTex(), 0.8);
export const giraffe = (o: GiraffeOpts = {}) => {
  const G = new THREE.Group(), coat = COAT(), cream = M("#f2e0bd", 0.8), dark = M("#5b3420", 0.7), hoof = M("#3a2a22", 0.5);
  const body = new THREE.Group(); G.add(body); body.rotation.z = o.bodyTilt ?? 0.12;
  ball(body, coat, [0, 2.75, 0], [1.25, 0.72, 0.62]);
  ball(body, cream, [0, 2.32, 0], [0.85, 0.32, 0.45]);
  // legs (world-ish coords in the body group): shoulders at x=+0.8, hips at x=-0.85
  const L1 = 1.15, L2 = 1.3;
  const legs: Record<string, { h: V; foot: V; bend: number }> = {
    fn: { h: [0.8, 2.45, 0.32], foot: [0.95, 0.0, 0.34], bend: -1 }, ff: { h: [0.8, 2.45, -0.32], foot: [0.65, 0.0, -0.34], bend: -1 },
    hn: { h: [-0.85, 2.45, 0.3], foot: [-0.9, 0.0, 0.32], bend: 1 }, hf: { h: [-0.85, 2.45, -0.3], foot: [-0.6, 0.0, -0.32], bend: 1 },
  };
  const inv = new THREE.Matrix4().makeRotationZ(-(o.bodyTilt ?? 0.12));
  for (const [k, l] of Object.entries(legs)) {
    const ov = o.legs?.[k as "fn"]; const footW = v3(ov?.foot ?? l.foot).applyMatrix4(inv); const f: V = [footW.x, footW.y + 0.08, footW.z];
    const knee = ik(l.h, f, L1, L2, ov?.bend ?? l.bend);
    limb(body, coat, l.h, knee, 0.2, 0.11); limb(body, cream, knee, f, 0.11, 0.085);
    ball(body, hoof, [f[0] + 0.02, f[1] - 0.04, f[2]], [0.12, 0.08, 0.11]);
  }
  // tail
  tube(body, coat, [[-1.2, 2.95, 0], [-1.45, 2.4, 0.02], [-1.5, 1.85, 0.05]], 0.06, 0.035);
  ball(body, dark, [-1.5, 1.72, 0.05], [0.09, 0.22, 0.09]);
  // neck + mane
  const neck = o.neck ?? [[0.95, 3.0, 0], [1.4, 4.0, 0], [1.75, 5.1, 0]];
  tube(body, coat, neck, 0.42, 0.2);
  const nc = new THREE.CatmullRomCurve3(neck.map(v3));
  for (let i = 1; i < 14; i++) { const t = i / 14, p = nc.getPointAt(t), tg = nc.getTangentAt(t), nrm = new THREE.Vector3(-tg.y, tg.x, 0).normalize().multiplyScalar(-1);
    const r = 0.42 + (0.2 - 0.42) * t; const m = ball(body, dark, [p.x + nrm.x * r * 0.92, p.y + nrm.y * r * 0.92, 0], [0.06, 0.11, 0.05]); m.rotation.z = Math.atan2(tg.y, tg.x); }
  // head
  const end = neck[neck.length - 1], H = new THREE.Group(); H.position.set(...end); H.rotation.z = o.headRot ?? -0.35; body.add(H);
  ball(H, coat, [0.25, 0.05, 0], [0.42, 0.3, 0.27]);
  ball(H, cream, [0.62, -0.06, 0], [0.24, 0.2, 0.2]);
  ball(H, M("#3a2a26", 0.6), [0.8, -0.02, 0.1], [0.035, 0.025, 0.02]); ball(H, M("#3a2a26", 0.6), [0.8, -0.02, -0.1], [0.035, 0.025, 0.02]);
  const smile = mesh(new THREE.TorusGeometry(0.1, 0.014, 8, 20, Math.PI * 0.8), M("#5b3420"), H); smile.position.set(0.66, -0.15, 0.16); smile.rotation.set(0, -0.4, Math.PI + (o.emo === "scared" || o.emo === "dazed" ? Math.PI : 0.2));
  for (const s of [1, -1]) {
    limb(H, coat, [0.05, 0.25, s * 0.1], [-0.02, 0.5, s * 0.13], 0.05, 0.04, false); ball(H, dark, [-0.02, 0.52, s * 0.13], [0.065, 0.065, 0.065]);
    const ear = ball(H, cream, [-0.12, 0.22, s * 0.26], [0.18, 0.06, 0.08], [0, s * 0.4, s * 0.5 + (o.emo === "scared" ? -0.4 * s : 0)]);
    void ear;
    eye(H, [0.24, 0.15, s * 0.21], 0.15, o.emo ?? "neutral", s, o.look);
  }
  G.scale.setScalar(o.scale ?? 1);
  return G;
};

type LionOpts = { emo?: Emotion; pose?: "stand" | "crouch" | "pounce" | "run" | "flying"; scale?: number; look?: V };
export const lioness = (o: LionOpts = {}) => {
  const G = new THREE.Group(), fur = M("#d9a560", 0.85), light = M("#f1d6a6", 0.85), dark = M("#6b3f22"), nose = M("#c46d5a", 0.5);
  const pose = o.pose ?? "stand", crouch = pose === "crouch" ? 0.25 : 0;
  const body = new THREE.Group(); G.add(body);
  body.rotation.z = pose === "pounce" ? 0.35 : pose === "crouch" ? -0.05 : 0;
  const by = 0.95 - crouch;
  ball(body, fur, [0, by, 0], [0.85, 0.36, 0.34]); ball(body, light, [0.1, by - 0.12, 0], [0.6, 0.22, 0.28]);
  ball(body, fur, [0.6, by + 0.05, 0], [0.38, 0.38, 0.34]);
  const legsDef: [number, number, number][] = [[0.6, 0.18, 1], [0.6, -0.18, 1], [-0.6, 0.18, -1], [-0.6, -0.18, -1]];
  legsDef.forEach(([x, z, fr], i) => {
    let fx = x + (fr > 0 ? 0.08 : -0.05), fy = 0;
    if (pose === "run") { const ph = [0.6, 0.2, -0.4, 0.9][i]; fx = x + Math.sin(ph * 3) * 0.45; fy = Math.max(0, Math.cos(ph * 3)) * 0.25; }
    if (pose === "pounce") { fx = x + (fr > 0 ? 0.7 : -0.6); fy = fr > 0 ? 0.55 : 0.1; }
    if (pose === "flying") { fx = x + (fr > 0 ? 0.3 : -0.4); fy = 0.45; }
    if (pose === "crouch") { fx = x + (fr > 0 ? 0.25 : -0.15); }
    const h: V = [x, by - 0.1, z], kn = ik(h, [fx, fy + 0.08, z], 0.5, 0.48, fr > 0 ? -1 : 1);
    limb(body, fur, h, kn, 0.14, 0.09); limb(body, fur, kn, [fx, fy + 0.08, z], 0.09, 0.08); ball(body, light, [fx + 0.05, fy + 0.05, z], [0.11, 0.07, 0.09]);
  });
  tube(body, fur, [[-0.8, by + 0.1, 0], [-1.25, by + 0.2, 0], [-1.55, by + (pose === "run" || pose === "flying" ? 0.35 : -0.1), 0]], 0.06, 0.04);
  ball(body, dark, [-1.58, by + (pose === "run" || pose === "flying" ? 0.36 : -0.14), 0], [0.08, 0.1, 0.08]);
  const H = new THREE.Group(); H.position.set(0.95, by + 0.32, 0); body.add(H); H.rotation.z = pose === "crouch" ? -0.15 : 0;
  ball(H, fur, [0, 0, 0], [0.4, 0.36, 0.36]); ball(H, light, [0.26, -0.1, 0], [0.18, 0.14, 0.18]); ball(H, nose, [0.42, -0.04, 0], [0.06, 0.045, 0.07]);
  const mouth = mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 16, Math.PI), dark, H); mouth.position.set(0.38, -0.16, 0); mouth.rotation.set(0, Math.PI / 2, o.emo === "scared" || o.emo === "dazed" ? 0 : Math.PI);
  for (const s of [1, -1]) {
    const ear = ball(H, fur, [-0.08, 0.28, s * 0.18], [0.1, 0.11, 0.05], [0, 0, o.emo === "scared" ? 0.9 : 0]); void ear;
    eye(H, [0.2, 0.09, s * 0.17], 0.115, o.emo ?? "neutral", s, o.look);
  }
  if (o.emo === "angry") { ball(H, M("#ffffff", 0.3), [0.36, -0.15, 0.05], [0.025, 0.04, 0.02]); ball(H, M("#ffffff", 0.3), [0.36, -0.15, -0.05], [0.025, 0.04, 0.02]); }
  G.scale.setScalar(o.scale ?? 1);
  return G;
};

export const zebra = (o: { phase?: number; scale?: number } = {}) => {
  const G = new THREE.Group(), st = M(stripeTex(), 0.8), dark = M("#1f1b1d"), ph = o.phase ?? 0;
  ball(G, st, [0, 1.25, 0], [0.85, 0.42, 0.36]);
  [[0.6, 0.2], [0.6, -0.2], [-0.6, 0.2], [-0.6, -0.2]].forEach(([x, z], i) => {
    const sw = Math.sin(ph + i * Math.PI * 0.5) * 0.25, f: V = [x + sw, 0.06 + Math.max(0, Math.cos(ph + i * Math.PI * 0.5)) * 0.1, z], h: V = [x, 1.05, z], kn = ik(h, f, 0.55, 0.55, x > 0 ? -1 : 1);
    limb(G, st, h, kn, 0.12, 0.08); limb(G, st, kn, f, 0.08, 0.06); ball(G, dark, [f[0], f[1] - 0.03, z], [0.08, 0.06, 0.07]);
  });
  tube(G, st, [[0.7, 1.4, 0], [0.95, 1.8, 0], [1.1, 2.05, 0]], 0.24, 0.17);
  const H = new THREE.Group(); H.position.set(1.15, 2.05, 0); H.rotation.z = -0.9; G.add(H);
  ball(H, st, [0.22, 0, 0], [0.36, 0.17, 0.15]); ball(H, dark, [0.52, -0.02, 0], [0.12, 0.12, 0.13]);
  for (let i = 0; i < 8; i++) { const t = i / 8; ball(G, dark, [0.7 + t * 0.42 - 0.12, 1.55 + t * 0.55, 0], [0.05, 0.09, 0.04]); }
  for (const s of [1, -1]) { ball(H, st, [-0.05, 0.16, s * 0.08], [0.06, 0.14, 0.04], [0, 0, 0.3]); eye(H, [0.08, 0.06, s * 0.12], 0.07, "neutral", s); }
  tube(G, st, [[-0.8, 1.35, 0], [-0.95, 1.0, 0], [-0.98, 0.75, 0]], 0.04, 0.03); ball(G, dark, [-0.98, 0.7, 0], [0.06, 0.1, 0.06]);
  G.scale.setScalar(o.scale ?? 1);
  return G;
};

// ---------- world ----------
const acacia = (s = 1, seed = 1) => {
  reseed(seed); const G = new THREE.Group(), bark = M("#6e4a32", 0.9), leaf = M("#7d9a45", 0.85), leaf2 = M("#90ad52", 0.85);
  limb(G, bark, [0, 0, 0], [0.1, 2.2, 0], 0.22, 0.14);
  for (const [dx, dz] of [[1.4, 0.3], [-1.3, -0.2], [0.3, -1.1], [-0.2, 1.2]]) limb(G, bark, [0.1, 2.0, 0], [dx, 3.1, dz], 0.12, 0.06);
  for (let i = 0; i < 9; i++) { const a = rnd() * 6.28, r = rnd() * 1.6; ball(G, i % 2 ? leaf : leaf2, [Math.cos(a) * r, 3.25 + rnd() * 0.25, Math.sin(a) * r], [1.1 + rnd() * 0.5, 0.32, 1.0 + rnd() * 0.4]); }
  G.scale.setScalar(s); return G;
};
const bush = (s = 1, seed = 2) => { reseed(seed); const G = new THREE.Group(), m = M(rnd() < 0.5 ? "#7f9b49" : "#8fa954", 0.9); for (let i = 0; i < 5; i++) ball(G, m, [(rnd() - 0.5) * 1.2, 0.35 + rnd() * 0.3, (rnd() - 0.5) * 1.0], [0.55, 0.45, 0.5]); G.scale.setScalar(s); return G; };
const rock = (s = 1, seed = 3) => { reseed(seed); const G = new THREE.Group(); for (let i = 0; i < 4; i++) { const m = mesh(new THREE.DodecahedronGeometry(0.8 + rnd() * 0.6, 1), M(i % 2 ? "#b59d7d" : "#a58d6f", 0.95, { flatShading: true }), G); m.position.set((rnd() - 0.5) * 2.2, 0.4 + rnd() * 0.8, (rnd() - 0.5) * 1.5); m.scale.set(1, 0.75, 1); } G.scale.setScalar(s); return G; };
const grassMat = M("#b99a4c", 0.9), grassMat2 = M("#c9ab5c", 0.9);
const grassField = (scene: THREE.Scene, x0: number, x1: number, z0: number, z1: number, n: number, seed = 9, h = 0.6) => {
  reseed(seed); const geo = new THREE.ConeGeometry(0.018, 1, 3); geo.translate(0, 0.5, 0);
  for (const mat of [grassMat, grassMat2]) {
    const inst = new THREE.InstancedMesh(geo, mat, n * 5), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    for (let i = 0; i < n; i++) { const cx = x0 + rnd() * (x1 - x0), cz = z0 + rnd() * (z1 - z0), hh = h * (0.5 + rnd());
      for (let b = 0; b < 5; b++) { e.set((rnd() - 0.5) * 0.9, rnd() * 6, (rnd() - 0.5) * 0.9); q.setFromEuler(e); m.compose(new THREE.Vector3(cx + (rnd() - 0.5) * 0.12, 0, cz + (rnd() - 0.5) * 0.12), q, new THREE.Vector3(1, hh * (0.6 + rnd() * 0.5), 1)); inst.setMatrixAt(i * 5 + b, m); } }
    inst.castShadow = true; scene.add(inst);
  }
};
const skyTex = () => canvasTex(16, 512, (g) => { const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#4f9ad8"); gr.addColorStop(0.55, "#9ccdf0"); gr.addColorStop(0.82, "#f4e3c1"); gr.addColorStop(1, "#f6d9a8"); g.fillStyle = gr; g.fillRect(0, 0, 16, 512); });

const world = (scene: THREE.Scene, opts: { water?: V; seed?: number } = {}) => {
  const bg = skyTex(); bg.wrapS = THREE.ClampToEdgeWrapping; scene.background = bg;
  scene.fog = new THREE.Fog("#d4e3ea", 45, 230);
  const hemi = new THREE.HemisphereLight("#bfe0ff", "#c9a565", 1.1); scene.add(hemi);
  const sun = new THREE.DirectionalLight("#fff1d6", 2.6); sun.position.set(-18, 30, 22); sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096); const c = sun.shadow.camera; c.left = -22; c.right = 22; c.top = 22; c.bottom = -22; c.near = 1; c.far = 120; sun.shadow.bias = -0.0004; sun.shadow.radius = 4;
  scene.add(sun); scene.add(sun.target);
  const gt = groundTex(); gt.repeat.set(30, 30);
  const geo = new THREE.PlaneGeometry(600, 600, 120, 120); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), d = Math.hypot(x, z); p.setY(i, d < 25 ? 0 : (Math.sin(x * 0.05) + Math.cos(z * 0.04)) * 0.8 * Math.min(1, (d - 25) / 40)); }
  geo.computeVertexNormals();
  const ground = new THREE.Mesh(geo, M(gt, 0.95)); ground.receiveShadow = true; scene.add(ground);
  // far mountain with snow cap, rolling ridges
  const mtn = new THREE.Mesh(new THREE.ConeGeometry(55, 30, 7, 1), M("#8fa3bf", 1, { flatShading: true, fog: false })); mtn.position.set(30, 10, -170); mtn.scale.set(1.6, 1, 1); scene.add(mtn);
  const snow = new THREE.Mesh(new THREE.ConeGeometry(14.5, 7.5, 7, 1), M("#f3f6fa", 1, { flatShading: true, fog: false })); snow.position.set(30, 21.3, -170); snow.scale.set(1.6, 1, 1); scene.add(snow);
  for (let k = 0; k < 7; k++) { const h = new THREE.Mesh(new THREE.SphereGeometry(30, 24, 12), M(k % 2 ? "#a7aa78" : "#b4b385", 1)); h.position.set(-140 + k * 48, -25, -140 - (k % 3) * 10); h.scale.set(1.6, 0.6, 0.6); scene.add(h); }
  // scattered trees, bushes, rocks
  reseed(opts.seed ?? 11);
  for (let k = 0; k < 22; k++) { const t = acacia(0.7 + rnd() * 0.6, k + 3); t.position.set(-90 + rnd() * 180, 0, -30 - rnd() * 80); t.rotation.y = rnd() * 6; scene.add(t); }
  for (let k = 0; k < 18; k++) { const b = bush(0.6 + rnd() * 0.8, k + 40); b.position.set(-40 + rnd() * 80, 0, -6 - rnd() * 30); scene.add(b); }
  const r = rock(1.4, 4); r.position.set(14, 0, -22); scene.add(r);
  grassField(scene, -30, 30, -25, 0.5, 1400, 21, 0.45); grassField(scene, -8, 8, 0.5, 5, 90, 22, 0.3);
  // clouds
  reseed(31); for (let k = 0; k < 9; k++) { const cg = new THREE.Group(), cm = M("#ffffff", 1, { emissive: "#ffffff", emissiveIntensity: 0.25 }); for (let i = 0; i < 6; i++) ball(cg, cm, [(i - 2.5) * 3 + rnd(), rnd() * 2, rnd() * 2], [3 + rnd() * 2, 2 + rnd() * 1.5, 2.5]); cg.position.set(-120 + rnd() * 240, 35 + rnd() * 30, -150 - rnd() * 60); scene.add(cg); }
  if (opts.water) {
    const w = new THREE.Mesh(new THREE.CircleGeometry(1, 64), M("#4b97c8", 0.12, { metalness: 0.1 })); w.rotation.x = -Math.PI / 2; w.position.set(...opts.water); w.position.y = 0.03; w.scale.set(4.2, 2.6, 1); w.receiveShadow = true; scene.add(w);
    const rim = new THREE.Mesh(new THREE.RingGeometry(1, 1.12, 64), M("#8c6a45", 0.9)); rim.rotation.x = -Math.PI / 2; rim.position.copy(w.position); rim.position.y = 0.025; rim.scale.copy(w.scale); scene.add(rim);
  }
  return { sun };
};

// ---------- shots ----------
type Shot = { cap: string[]; hi: number; build: (s: THREE.Scene, cam: THREE.PerspectiveCamera) => void };
const place = (o: THREE.Object3D, p: V, ry = 0, s?: THREE.Scene) => { o.position.set(...p); o.rotation.y = ry; s?.add(o); return o; };
const dust = (s: THREE.Scene, p: V, n = 10) => { reseed(3); for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.3 + rnd() * 0.4, 16, 12), new THREE.MeshStandardMaterial({ color: "#e8d3a2", roughness: 1, transparent: true, opacity: 0.6 })); m.position.set(p[0] - rnd() * 2.5, 0.2 + rnd() * 0.6, p[2] + (rnd() - 0.5) * 1.2); s.add(m); } };
const SHOTS: Shot[] = [
  // 1. hook: a scared lioness under a towering, smug giraffe (low angle)
  { cap: ["LIONS", "ARE", "SCARED"], hi: 2, build: (s, cam) => {
    world(s);
    place(giraffe({ emo: "smug", look: [0.5, -0.8, 0.7], headRot: -0.7 }), [0.4, 0, -2.6], -0.35, s);
    place(lioness({ emo: "scared", pose: "crouch", look: [0.2, 0.8, -0.6] }), [-0.9, 0, 2.2], -1.0, s);
    cam.position.set(0.4, 0.55, 7.2); cam.lookAt(0.2, 2.6, -0.5); cam.fov = 62;
  } },
  // 2. drinking: the splits at the waterhole, a lioness creeping through the grass
  { cap: ["DOES", "THE", "SPLITS"], hi: 2, build: (s, cam) => {
    world(s, { water: [2.6, 0, 0.2] });
    place(giraffe({ emo: "scared", bodyTilt: 0.2, neck: [[0.95, 2.9, 0], [1.7, 2.0, 0], [2.3, 0.75, 0]], headRot: -1.75, look: [-0.3, 0.3, 1],
      legs: { fn: { foot: [2.1, 0, 0.9] }, ff: { foot: [1.9, 0, -0.9] }, hn: { foot: [-1.2, 0, 0.5] }, hf: { foot: [-1.0, 0, -0.5] } } }), [-0.6, -0.55, 0], 0, s);
    place(lioness({ emo: "smug", pose: "crouch" }), [-4.6, 0, 3.2], 0.35, s);
    cam.position.set(-0.8, 1.6, 10.5); cam.lookAt(0.2, 1.5, 0.4); cam.fov = 50;
  } },
  // 3. lookout: nearly six metres tall, spotting a lion far away
  { cap: ["BEST", "LOOKOUT"], hi: 1, build: (s, cam) => {
    world(s);
    place(giraffe({ emo: "neutral", look: [0.6, -0.2, 0.9], neck: [[0.95, 3.0, 0], [1.25, 4.2, 0], [1.4, 5.5, 0]], headRot: -0.15 }), [-0.5, 0, 0], -0.9, s);
    place(lioness({ pose: "crouch" }), [9, 0, -16], -1.2, s);
    cam.position.set(4.2, 1.0, 8.5); cam.lookAt(0.6, 3.4, -1); cam.fov = 55;
  } },
  // 4. zebras tag along
  { cap: ["ZEBRAS", "FOLLOW", "GIRAFFES"], hi: 0, build: (s, cam) => {
    world(s);
    place(giraffe({ emo: "happy", look: [1, 0, 0.6], legs: { fn: { foot: [1.35, 0, 0.34] }, hn: { foot: [-1.25, 0, 0.32] }, ff: { foot: [0.5, 0, -0.34] }, hf: { foot: [-0.4, 0, -0.32] } } }), [0.5, 0, -1.4], 0.25, s);
    place(zebra({ phase: 0.4 }), [-1.6, 0, 1.2], 0.25, s); place(zebra({ phase: 2.1, scale: 0.95 }), [-3.4, 0, -0.2], 0.25, s);
    cam.position.set(1.4, 1.5, 9.5); cam.lookAt(-0.2, 2.2, 0); cam.fov = 52;
  } },
  // 5. sprint: 60 km/h, the lioness falling behind
  { cap: ["SIXTY", "KM/H"], hi: 0, build: (s, cam) => {
    world(s);
    place(giraffe({ emo: "determined", bodyTilt: 0.02, neck: [[0.95, 3.0, 0], [1.7, 3.8, 0], [2.4, 4.5, 0]], headRot: -0.55, look: [1, 0, 0.3],
      legs: { fn: { foot: [2.2, 0.5, 0.34], bend: -1 }, ff: { foot: [1.6, 0, -0.34] }, hn: { foot: [-2.1, 0.6, 0.32] }, hf: { foot: [-0.3, 0, -0.32] } } }), [0.5, 0.15, 0], 0.15, s);
    place(lioness({ emo: "angry", pose: "run" }), [-3.8, 0, 2.8], 0.15, s);
    dust(s, [-1.2, 0, 0], 12);
    cam.position.set(-0.1, 1.8, 14.5); cam.lookAt(-0.1, 2.3, 0); cam.fov = 55;
  } },
  // 6. the kick: WHAM
  { cap: ["ONE", "KICK"], hi: 1, build: (s, cam) => {
    world(s);
    place(giraffe({ emo: "determined", look: [-0.4, -0.3, 1], legs: { hn: { foot: [-2.5, 1.2, 0.32], bend: -1 } } }), [1.2, 0, 0], 0, s);
    const l = lioness({ emo: "dazed", pose: "flying", scale: 1.1 }); place(l, [-2.5, 1.0, 0.4], 0.3, s); l.rotation.z = 0.7;
    const star = (p: V, c: string) => { const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.22), M(c, 0.4, { emissive: c, emissiveIntensity: 0.6 })); m.position.set(...p); m.scale.set(1, 1, 0.3); s.add(m); };
    star([-2.4, 3.0, 0.6], "#ffd33d"); star([-1.9, 3.3, 0.4], "#ffd33d"); star([-2.9, 3.2, 0.5], "#ffffff");
    cam.position.set(-0.6, 1.8, 12.5); cam.lookAt(-0.6, 2.4, 0); cam.fov = 55;
  } },
  // 7. mother guards her calf
  { cap: ["THE", "BABIES"], hi: 1, build: (s, cam) => {
    world(s);
    place(giraffe({ emo: "angry", look: [-0.6, -0.5, 0.8] }), [0.2, 0, -1.2], 0.6 + Math.PI, s);
    place(giraffe({ emo: "happy", scale: 0.48, look: [0.5, 0.4, 1] }), [1.4, 0, 1.0], 0.5, s);
    place(lioness({ emo: "smug", pose: "crouch", look: [1, 0.2, 0.3] }), [-3.0, 0, 2.6], -0.1, s);
    cam.position.set(-0.6, 1.5, 12.5); cam.lookAt(-0.4, 2.4, 0); cam.fov = 55;
  } },
];

const drawCaption = (g: CanvasRenderingContext2D, W: number, H: number, words: string[], hi: number) => {
  const size = Math.round(W * 0.11); g.font = `${size}px "Bangers"`; g.textBaseline = "middle"; g.lineJoin = "round";
  const sp = size * 0.28, ws = words.map((w) => g.measureText(w).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  let x = W / 2 - tot / 2; const y = H * 0.71;
  words.forEach((w, i) => { g.save(); g.translate(x + ws[i] / 2, y); const s = i === hi ? 1.1 : 1; g.scale(s, s); g.textAlign = "center";
    g.shadowColor = "rgba(0,0,0,0.45)"; g.shadowBlur = 14; g.shadowOffsetY = 8; g.lineWidth = size * 0.2; g.strokeStyle = "#141114"; g.strokeText(w, 0, 0);
    g.shadowColor = "transparent"; g.fillStyle = i === hi ? "#ffd33d" : "#ffffff"; g.fillText(w, 0, 0); g.restore(); x += ws[i] + sp; });
};

let renderer: THREE.WebGLRenderer | null = null;
(window as unknown as { RENDER3D: unknown }).RENDER3D = (k: number, W: number, H: number) => {
  if (!renderer) { renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.outputColorSpace = THREE.SRGBColorSpace; }
  renderer.setSize(W, H, false);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 800);
  SHOTS[k].build(scene, cam); cam.updateProjectionMatrix();
  renderer.render(scene, cam);
  const out = document.createElement("canvas"); out.width = W; out.height = H; const g = out.getContext("2d")!;
  g.drawImage(renderer.domElement, 0, 0); drawCaption(g, W, H, SHOTS[k].cap, SHOTS[k].hi);
  return out.toDataURL("image/jpeg", 0.92);
};
(window as unknown as { N3D: number }).N3D = SHOTS.length;
