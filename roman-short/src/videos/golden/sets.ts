// Scenery for the seven eras, each around its own origin O(i) (story.ts): Ice Age ridge, stone-age camp,
// Newfoundland fishing dock, the river Tweed, the Guisachan estate lawn (1868), a marsh at sunset, a modern backyard.
// Static meshes merge into batches; trees/bushes are the cartoon vegetation from rome/build.ts (prop()).
import * as THREE from "three";
import { Batch, boxGeo, V, lam, quad, tri, house, prop, setSight, Ray } from "../rome/build";
import { ctex, grassHD, stoneHD, planksHD, jit } from "../rome/paint";
import { O, V3 } from "./story";

const TAU = Math.PI * 2;
const M4 = (x: number, y: number, z: number, ry = 0, s: [number, number, number] = [1, 1, 1], rx = 0, rz = 0) =>
  new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")), V(...s));
const ground = (x0: number, x1: number, z0: number, z1: number, y: number, tile: number) =>
  quad(V(x0, y, z1), V(x1, y, z1), V(x1, y, z0), V(x0, y, z0), (x1 - x0) / tile, (z1 - z0) / tile);
const flatTex = (key: string, base: string, dots: string[], n = 900, rmax = 6) => ctex(key, 512, 512, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < n; i++) { g.fillStyle = dots[i % dots.length]; g.beginPath(); g.ellipse(r() * 512, r() * 512, 1 + r() * rmax, 1 + r() * rmax * 0.7, r() * 3, 0, TAU); g.fill(); }
});
const snowTex = () => ctex("snowG", 512, 512, (g, r) => {
  g.fillStyle = "#eef2f6"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 26; i++) { g.fillStyle = r() < 0.5 ? "rgba(200,212,232,0.35)" : "rgba(255,255,255,0.5)"; g.beginPath(); g.ellipse(r() * 512, r() * 512, 40 + r() * 90, 12 + r() * 30, r() * 0.4, 0, TAU); g.fill(); }
  g.strokeStyle = "rgba(170,186,214,0.35)"; g.lineWidth = 2;
  for (let i = 0; i < 30; i++) { const x = r() * 512, y = r() * 512; g.beginPath(); g.arc(x, y, 18 + r() * 30, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
});
const steppeTex = () => ctex("steppe", 512, 512, (g, r) => {
  g.fillStyle = "#b39a62"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 20; i++) { g.fillStyle = r() < 0.5 ? "rgba(140,150,80,0.35)" : "rgba(200,170,110,0.4)"; g.beginPath(); g.ellipse(r() * 512, r() * 512, 50 + r() * 80, 20 + r() * 40, 0, 0, TAU); g.fill(); }
  g.lineWidth = 2; g.lineCap = "round";
  for (let i = 0; i < 900; i++) { const x = r() * 512, y = r() * 512, h = 6 + r() * 10; g.strokeStyle = r() < 0.5 ? "rgba(120,110,60,0.5)" : "rgba(220,200,140,0.5)"; g.beginPath(); g.moveTo(x - 2, y - h); g.lineTo(x, y); g.lineTo(x + 3, y - h * 0.8); g.stroke(); }
});
const hideTex = () => ctex("hide", 512, 512, (g, r) => {
  g.fillStyle = "#b8916a"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 14; i++) { g.fillStyle = jit(r, "#a67d58", 0.12, 6, 0.1); g.beginPath(); g.ellipse(r() * 512, r() * 512, 60 + r() * 60, 40 + r() * 40, r() * 3, 0, TAU); g.fill(); }
  g.strokeStyle = "rgba(70,45,30,0.55)"; g.lineWidth = 4; g.setLineDash([10, 10]);
  for (let x = 0; x < 512; x += 128) { g.beginPath(); g.moveTo(x + 20, 0); g.lineTo(x + 50, 512); g.stroke(); }
});
const rockTex = () => flatTex("rockG", "#9b968f", ["#878279", "#aca79f", "#7c776f"], 500, 10);
const mudTex = () => flatTex("mudG", "#8e7556", ["#7d6548", "#a08664", "#6f5a40"], 700, 7);
const pebbleTex = () => flatTex("pebble", "#a9a198", ["#8f877e", "#c4bcb2", "#7d756c"], 1600, 6);
const gravelTex = () => flatTex("gravelG", "#cfc3ad", ["#b8ab93", "#e0d6c2", "#a69a84"], 2400, 4);
const paveTex = () => ctex("paveG", 512, 512, (g) => {
  g.fillStyle = "#8d8780"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? "#d9d2c6" : "#cfc7ba"; g.fillRect(i * 128 + 4, j * 128 + 4, 120, 120); }
});

/** water planes [x0, x1, z0, z1, y] (world.ts draws them with the river shader) */
export const WATERS: [number, number, number, number, number][] = [];

// ---------------- generic pieces ----------------
const sph = new THREE.SphereGeometry(1, 18, 12);
const rock = (b: Batch, x: number, y: number, z: number, sx: number, sy: number, sz: number, ry = 0, m?: THREE.Material) =>
  b.add(sph, m ?? lam("rockG", () => ({ map: rockTex() })), M4(x, y, z, ry, [sx, sy, sz]));
const cone = (r: number, h: number, n = 12) => new THREE.ConeGeometry(r, h, n);
const cyl = (r0: number, r1: number, h: number, n = 10) => new THREE.CylinderGeometry(r0, r1, h, n);
/** snowy fir: three green tiers with white caps */
const snowFir = (b: Batch, x: number, z: number, h: number, snow = true) => {
  const g = lam("firG", () => ({ color: "#3f6d4e" })), w = lam("snowCap", () => ({ color: "#f1f4f8" })), tr = lam("trunkG", () => ({ color: "#6e4a32" }));
  b.add(cyl(0.12 * h / 6, 0.18 * h / 6, h * 0.3), tr, M4(x, h * 0.15, z));
  for (let i = 0; i < 3; i++) {
    const r = h * (0.3 - i * 0.07), hh = h * (0.42 - i * 0.06), y = h * (0.22 + i * 0.22);
    b.add(cone(r, hh, 10), g, M4(x, y + hh / 2, z, i));
    if (snow) b.add(cone(r * 0.62, hh * 0.45, 10), w, M4(x, y + hh * 0.79, z, i));
  }
};
const fir = (b: Batch, x: number, z: number, h: number) => snowFir(b, x, z, h, false);
const mountain = (b: Batch, x: number, z: number, r: number, h: number, snow = true) => {
  b.add(cone(r, h, 9), lam("mtn", () => ({ color: "#7d8aa6" })), M4(x, h / 2 - 2, z, x));
  if (snow) b.add(cone(r * 0.42, h * 0.42, 9), lam("snowCap", () => ({ color: "#f1f4f8" })), M4(x, h - h * 0.21 - 1.6, z, x));
};
const hill = (b: Batch, x: number, z: number, rx: number, h: number, rz: number, col = "#5f8c55") =>
  b.add(new THREE.SphereGeometry(1, 36, 16, 0, TAU, 0, Math.PI / 2), lam("hill" + col, () => ({ color: col })), M4(x, 0, z, 0, [rx, h, rz]));
const sheep = (b: Batch, x: number, y: number, z: number, ry: number) => {
  const wool = lam("wool", () => ({ color: "#f2efe6" })), face = lam("sheepFace", () => ({ color: "#3a3436" }));
  b.add(sph, wool, M4(x, y + 0.55, z, ry, [0.5, 0.36, 0.34]));
  const hx = x + Math.cos(ry) * 0.52, hz = z - Math.sin(ry) * 0.52;
  b.add(sph, face, M4(hx, y + 0.66, hz, ry, [0.17, 0.15, 0.13]));
  for (const [a, c] of [[0.3, 0.18], [0.3, -0.18], [-0.3, 0.18], [-0.3, -0.18]]) b.add(cyl(0.04, 0.04, 0.4, 6), face, M4(x + Math.cos(ry) * a + Math.sin(ry) * c, y + 0.2, z - Math.sin(ry) * a + Math.cos(ry) * c));
};
/** top-view boat outline extruded upward, red hull with a wooden floor */
const rowboat = (b: Batch, x: number, y: number, z: number, ry: number) => {
  const sh = new THREE.Shape();
  sh.moveTo(0, -1.6); sh.quadraticCurveTo(0.75, -0.9, 0.62, 0.6); sh.lineTo(0.5, 1.45); sh.lineTo(-0.5, 1.45); sh.lineTo(-0.62, 0.6); sh.quadraticCurveTo(-0.75, -0.9, 0, -1.6);
  const hull = new THREE.ExtrudeGeometry(sh, { depth: 0.5, bevelEnabled: false, curveSegments: 10 });
  hull.rotateX(-Math.PI / 2);
  b.add(hull, lam("boatRed", () => ({ color: "#b8443a" })), M4(x, y, z, ry));
  const inner = new THREE.ShapeGeometry(sh, 10); inner.rotateX(-Math.PI / 2);
  b.add(inner, lam("boatIn", () => ({ color: "#c79a62" })), M4(x, y + 0.505, z, ry, [0.86, 1, 0.9]));
  b.add(boxGeo(V(-0.55, 0.38, -0.12), V(0.55, 0.46, 0.12)), lam("boatIn", () => ({ color: "#c79a62" })), M4(x, y, z, ry));
  b.add(boxGeo(V(-0.66, 0.42, 0.05), V(0.66, 0.5, 0.15)), lam("boatTrim", () => ({ color: "#f1ece0" })), M4(x, y, z, ry));
};
const crate = (b: Batch, x: number, y: number, z: number, s = 0.5, ry = 0) =>
  b.add(boxGeo(V(-s / 2, 0, -s / 2), V(s / 2, s * 0.7, s / 2), 1), lam("crate", () => ({ map: planksHD(), color: "#e6c9a0" })), M4(x, y, z, ry));
const reeds = (b: Batch, x: number, z: number, n: number, seed: number, h = 1.3) => {
  const greens = ["#8a9a46", "#a3a04e", "#7a8c3e"], brown = lam("cattail", () => ({ color: "#6b4a2e" }));
  let s = seed;
  const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  for (let i = 0; i < n; i++) {
    const a = r() * TAU, d = r() * 0.6, hh = h * (0.6 + r() * 0.6), px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    b.add(cone(0.035, hh, 5), lam("reed" + (i % 3), () => ({ color: greens[i % 3] })), M4(px, hh / 2, pz, 0, [1, 1, 1], (r() - 0.5) * 0.25, (r() - 0.5) * 0.25));
    if (i % 4 === 0) b.add(cyl(0.045, 0.045, 0.22, 6), brown, M4(px, hh * 0.8, pz));
  }
};
const picketFence = (b: Batch, x0: number, x1: number, z: number) => {
  const w = lam("whitePaint", () => ({ color: "#f4f1ea" }));
  for (let x = x0; x <= x1; x += 0.28) {
    b.add(boxGeo(V(x - 0.045, 0, z - 0.02), V(x + 0.045, 0.95, z + 0.02)), w);
    b.add(cone(0.064, 0.1, 4), w, M4(x, 1.0, z, Math.PI / 4));
  }
  for (const y of [0.25, 0.7]) b.add(boxGeo(V(x0, y, z + 0.02), V(x1, y + 0.08, z + 0.06)), w);
};
const doghouse = (b: Batch, x: number, z: number, ry: number) => {
  const red = lam("dhRed", () => ({ color: "#c2463c" })), roof = lam("dhRoof", () => ({ color: "#4f5b78", side: THREE.DoubleSide })), dark = lam("dhDoor", () => ({ color: "#2c2430" }));
  const m = M4(x, 0, z, ry);
  b.add(boxGeo(V(-0.5, 0, -0.6), V(0.5, 0.7, 0.6)), red, m);
  b.add(tri(V(-0.5, 0.7, 0.6), V(0.5, 0.7, 0.6), V(0, 1.1, 0.6)), red, m);
  b.add(tri(V(0.5, 0.7, -0.6), V(-0.5, 0.7, -0.6), V(0, 1.1, -0.6)), red, m);
  b.add(quad(V(-0.62, 0.62, 0.7), V(-0.62, 0.62, -0.7), V(0, 1.14, -0.7), V(0, 1.14, 0.7)), roof, m);
  b.add(quad(V(0.62, 0.62, -0.7), V(0.62, 0.62, 0.7), V(0, 1.14, 0.7), V(0, 1.14, -0.7)), roof, m);
  b.add(quad(V(-0.22, 0, -0.605), V(0.22, 0, -0.605), V(0.22, 0.48, -0.605), V(-0.22, 0.48, -0.605)), dark, m);
};
const tent = (b: Batch, x: number, z: number, r: number, h: number) => {
  const c = cone(r, h, 11); (c as THREE.BufferGeometry).computeVertexNormals();
  b.add(c, lam("hide", () => ({ map: hideTex(), side: THREE.DoubleSide })), M4(x, h / 2, z));
  const pole = lam("pole", () => ({ color: "#6e4a32" }));
  for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; b.add(cyl(0.035, 0.035, 0.9, 6), pole, M4(x + Math.cos(a) * 0.12, h + 0.25, z + Math.sin(a) * 0.12, 0, [1, 1, 1], Math.sin(a) * 0.35, -Math.cos(a) * 0.35)); }
  // door flap (toward -z)
  b.add(tri(V(x - 0.55, 0.01, z - r * 0.93), V(x + 0.55, 0.01, z - r * 0.93), V(x, 1.5, z - r * 0.62)), lam("tentDoor", () => ({ color: "#3a2a26", side: THREE.DoubleSide })));
};

// ---------------- the seven sets ----------------
const wolfSet = (b: Batch, o: V3) => {
  const [X, , Z] = o;
  b.add(ground(X - 700, X + 700, Z - 700, Z + 700, 0, 6), lam("snowG", () => ({ map: snowTex() })));
  const rm = lam("rockG", () => ({ map: rockTex() }));
  // the outcrop the wolf howls from (top ~2.2 m) and boulders around it
  rock(b, X, 1.05, Z, 1.6, 1.15, 1.3, 0.3, rm); rock(b, X + 0.4, 1.7, Z + 0.2, 1.05, 0.55, 0.9, 1.0, rm);
  rock(b, X - 1.5, 0.4, Z + 0.6, 1.0, 0.7, 0.9, 0.7, rm); rock(b, X + 1.9, 0.3, Z - 0.2, 0.8, 0.5, 0.7, 2.1, rm);
  b.add(sph, lam("snowCap", () => ({ color: "#f1f4f8" })), M4(X + 0.3, 2.08, Z + 0.25, 0.4, [0.8, 0.16, 0.65]));
  for (const [x, z, s] of [[-3, 2, 1.4], [3.4, 3, 1.8], [-6, 6, 2.2], [5, -1, 1.0]] as const) b.add(sph, lam("snowCap", () => ({ color: "#f1f4f8" })), M4(X + x, 0, Z + z, 0, [s, s * 0.35, s * 0.8]));
  // firs: a near stand on the left, forest behind
  for (const [x, z, h] of [[-5.5, 4, 7], [-7.5, 9, 9], [-4.2, 12, 8], [6.5, 10, 8.5], [9, 6, 6.5], [11, 14, 9], [-12, 16, 10], [2, 22, 9]] as const) snowFir(b, X + x, Z + z, h);
  let s = 5;
  const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  for (let i = 0; i < 90; i++) { const x = (r() - 0.5) * 220, z = 25 + r() * 160; snowFir(b, X + x, Z + z, 7 + r() * 6); }
  for (const [x, z, rr, h] of [[-160, 330, 140, 150], [40, 400, 170, 190], [220, 340, 130, 140], [-330, 420, 160, 170], [380, 460, 170, 160]] as const) mountain(b, X + x, Z + z, rr, h);
};
const campSet = (b: Batch, o: V3) => {
  const [X, , Z] = o;
  b.add(ground(X - 700, X + 700, Z - 700, Z + 700, 0, 5), lam("steppe", () => ({ map: steppeTex() })));
  tent(b, X - 2.6, Z + 3.4, 1.9, 3.3);
  tent(b, X + 3.6, Z + 6.5, 1.7, 3.0);
  // fire: stone ring + crossed logs
  const st = lam("rockG", () => ({ map: rockTex() })), log = lam("log", () => ({ color: "#6e4a32" }));
  for (let i = 0; i < 11; i++) { const a = (i / 11) * TAU; rock(b, X + 0.4 + Math.cos(a) * 0.48, 0.06, Z + 0.7 + Math.sin(a) * 0.48, 0.13, 0.1, 0.12, a, st); }
  for (const a of [0.3, 1.5, 2.6]) b.add(cyl(0.06, 0.07, 0.8, 8), log, M4(X + 0.4, 0.12, Z + 0.7, a, [1, 1, 1], 0, Math.PI / 2 - 0.25));
  b.add(cyl(0.16, 0.18, 1.6, 10), log, M4(X + 1.55, 0.17, Z + 1.0, 0.4, [1, 1, 1], 0, Math.PI / 2)); // sitting log
  // drying rack with a hide
  const pole = lam("pole", () => ({ color: "#6e4a32" }));
  for (const x of [-4.6, -3.0]) b.add(cyl(0.04, 0.04, 1.8, 6), pole, M4(X + x, 0.9, Z + 0.8));
  b.add(cyl(0.035, 0.035, 1.8, 6), pole, M4(X - 3.8, 1.75, Z + 0.8, 0, [1, 1, 1], 0, Math.PI / 2));
  b.add(quad(V(X - 4.4, 0.7, Z + 0.8), V(X - 3.2, 0.7, Z + 0.8), V(X - 3.2, 1.72, Z + 0.8), V(X - 4.4, 1.72, Z + 0.8)), lam("hide", () => ({ map: hideTex(), side: THREE.DoubleSide })));
  rock(b, X + 4.5, 0.35, Z + 2.5, 0.8, 0.55, 0.7, 1, st);
  for (const [x, z, h] of [[-9, 16, 9], [-12, 21, 11], [9, 22, 10], [13, 17, 8], [1, 26, 10], [-5, 30, 12], [15, 27, 11]] as const) fir(b, X + x, Z + z, h);
  let s = 9;
  const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  for (let i = 0; i < 60; i++) fir(b, X + (r() - 0.5) * 200, Z + 26 + r() * 120, 8 + r() * 6);
  for (const [x, z, rr, h] of [[-120, 300, 140, 120], [90, 340, 160, 150], [300, 300, 120, 110]] as const) mountain(b, X + x, Z + z, rr, h);
};
const dockSet = (b: Batch, o: V3) => {
  const [X, , Z] = o;
  const shoreZ = 0.5;
  b.add(ground(X - 700, X + 700, Z - 700, Z + shoreZ - 2, 0, 5), lam("grassDock", () => ({ map: grassHD(), color: "#c9cfc2" })));
  b.add(quad(V(X - 700, 0, Z + shoreZ - 2), V(X + 700, 0, Z + shoreZ - 2), V(X + 700, -1.4, Z + shoreZ + 2.5), V(X - 700, -1.4, Z + shoreZ + 2.5), 280, 1), lam("pebble", () => ({ map: pebbleTex() })));
  b.add(ground(X - 700, X + 700, Z + shoreZ + 2.4, Z + 700, -2.2, 8), lam("seabed", () => ({ color: "#2f4f5a" })));
  WATERS.push([X - 700, X + 700, Z + shoreZ - 0.4, Z + 700, -0.55]);
  // the dock: deck at y = 0.2 from the shore out to z = 14
  const deck = lam("deckG", () => ({ map: planksHD(), color: "#e8d2b0" })), post = lam("postG", () => ({ color: "#5e4430" }));
  b.add(boxGeo(V(X - 1.4, 0.05, Z - 2.5), V(X + 1.4, 0.2, Z + 14), 2), deck);
  for (let z = 1.5; z <= 14; z += 2.5) for (const x of [-1.45, 1.45]) b.add(cyl(0.12, 0.12, 2.4, 8), post, M4(X + x, -0.9, Z + z));
  for (let z = 6.5; z <= 14; z += 5) for (const x of [-1.45, 1.45]) b.add(cyl(0.11, 0.11, 0.7, 8), post, M4(X + x, 0.5, Z + z)); // bollards
  crate(b, X - 0.9, 0.2, Z + 7.2, 0.55, 0.3); crate(b, X - 0.95, 0.585, Z + 7.25, 0.45, 0.9); crate(b, X + 0.95, 0.2, Z + 9.5, 0.5, -0.2);
  b.add(cyl(0.22, 0.22, 0.6, 12), lam("barrel", () => ({ color: "#8a5a3a" })), M4(X + 1.0, 0.5, Z + 2.2));
  rowboat(b, X + 2.9, -0.62, Z + 6.5, 0.15);
  rowboat(b, X - 3.4, -0.62, Z + 9.5, -0.3);
  // fishing stages / sheds on the shore (left) and across the cove
  house(b, X - 8, Z - 2.5, 0.15, 6, 5, 4.2, 2);
  house(b, X - 15, Z - 1, -0.1, 7, 6, 5.5, 3);
  house(b, X + 11, Z - 4, -0.3, 6, 5, 4.4, 4);
  for (const [x, z] of [[-11, -8], [8, -10], [-20, -6]] as const) fir(b, X + x, Z + z, 7);
  // far headland with a lighthouse
  hill(b, X - 140, Z + 260, 160, 45, 70, "#5d7f52"); hill(b, X + 160, Z + 300, 200, 60, 90, "#587a50"); hill(b, X + 30, Z + 420, 260, 80, 120, "#6c8a62");
  b.add(cyl(2.2, 2.8, 16, 14), lam("lightW", () => ({ color: "#f3efe6" })), M4(X - 120, 45 + 8, Z + 230));
  b.add(cyl(2.6, 2.6, 3.4, 14), lam("lightR", () => ({ color: "#c43a34" })), M4(X - 120, 45 + 17.5, Z + 230));
  b.add(cone(2.9, 2.6, 14), lam("lightR", () => ({ color: "#c43a34" })), M4(X - 120, 45 + 20.5, Z + 230));
};
const tweedSet = (b: Batch, o: V3) => {
  const [X, , Z] = o;
  const z0 = 4.6, z1 = 13, wy = -0.45;
  const gm = lam("grassTweed", () => ({ map: grassHD(), color: "#cfd4c8" }));
  b.add(ground(X - 700, X + 700, Z - 700, Z + z0 - 1.6, 0, 4), gm);
  b.add(ground(X - 700, X + 700, Z + z1 + 1.6, Z + 700, 0, 4), gm);
  const bank = lam("mudG", () => ({ map: mudTex() }));
  b.add(quad(V(X - 700, 0, Z + z0 - 1.6), V(X + 700, 0, Z + z0 - 1.6), V(X + 700, -1.0, Z + z0 + 0.4), V(X - 700, -1.0, Z + z0 + 0.4), 350, 1), bank);
  b.add(quad(V(X + 700, 0, Z + z1 + 1.6), V(X - 700, 0, Z + z1 + 1.6), V(X - 700, -1.0, Z + z1 - 0.4), V(X + 700, -1.0, Z + z1 - 0.4), 350, 1), bank);
  b.add(ground(X - 700, X + 700, Z + z0, Z + z1, -1.4, 6), lam("bedG", () => ({ color: "#4f5e4c" })));
  WATERS.push([X - 700, X + 700, Z + z0 - 0.6, Z + z1 + 0.6, wy]);
  const rm = lam("rockG", () => ({ map: rockTex() }));
  for (const [x, z, s] of [[-2.4, 4.4, 0.45], [2.6, 5.4, 0.35], [1.2, 9.5, 0.4], [-4, 11.5, 0.5], [4.5, 3.9, 0.3]] as const) rock(b, X + x, wy, Z + z, s * 1.3, s, s, x, rm);
  // old stone bridge downstream (right), three piers
  const sm = lam("bridgeStone", () => ({ map: stoneHD("bridgeHD", ["#c9bca6", "#bfb19a", "#d3c7b2", "#b6a890"], "#8f8270") }));
  const bx = X + 26;
  b.add(boxGeo(V(bx - 2, 1.6, Z + z0 - 3), V(bx + 2, 2.3, Z + z1 + 3), 3), sm);
  for (const z of [z0 + 1.5, (z0 + z1) / 2, z1 - 1.5]) b.add(boxGeo(V(bx - 1.6, -1.4, Z + z - 0.7), V(bx + 1.6, 1.6, Z + z + 0.7), 3), sm);
  for (const x of [-1.95, 1.95]) b.add(boxGeo(V(bx + x - 0.15, 2.3, Z + z0 - 3), V(bx + x + 0.15, 2.9, Z + z1 + 3), 3), sm);
  // hills, sheep, trees
  hill(b, X - 40, Z + 70, 70, 22, 40, "#6a9658"); hill(b, X + 50, Z + 90, 80, 28, 45, "#5f8c55"); hill(b, X - 10, Z + 180, 160, 50, 70, "#6f9a5e");
  for (const [x, z, ry] of [[-6, 22, 0.4], [-3.5, 24, 2.2], [3, 26, 1.0], [7, 21, 2.8], [1, 30, 0.1], [-9, 28, 1.7]] as const) sheep(b, X + x, 0, Z + z, ry);
  for (const [x, z, h, n] of [[-9, 2, 8, "tree_oak"], [-13, 7, 9, "tree_default"], [10, 18, 9, "tree_fat"], [15, 1, 8, "tree_oak"], [-20, 19, 10, "tree-high-round"], [20, 22, 9, "tree_default"]] as const) prop(b, {}, n, X + x, 0, Z + z, h, x);
  prop(b, {}, "plant_bushLarge", X - 3.6, 0, Z + 2.2, 1.0, 1);
};
const estateSet = (b: Batch, o: V3) => {
  const [X, , Z] = o;
  b.add(ground(X - 700, X + 700, Z - 700, Z + 700, 0, 4), lam("lawn", () => ({ map: grassHD(), color: "#d2dcc8" })));
  b.add(ground(X - 1.4, X + 1.4, Z + 4, Z + 17, 0.015, 3), lam("gravelG", () => ({ map: gravelTex() })));
  b.add(ground(X - 14, X + 14, Z + 16, Z + 19, 0.015, 3), lam("gravelG", () => ({ map: gravelTex() })));
  // the lodge: main block and two wings
  house(b, X, Z + 23, 0, 14, 9, 9.8, 7);
  house(b, X - 12, Z + 24.5, 0, 9, 8, 8.4, 0);
  house(b, X + 12, Z + 24.5, 0, 9, 8, 8.4, 0);
  for (const x of [-7.5, 7.5]) prop(b, {}, "plant_bushLarge", X + x, 0, Z + 18.8, 1.4, x);
  for (const x of [-3, 3]) prop(b, {}, "plant_bushLarge", X + x, 0, Z + 18.6, 1.1, x);
  // highland firs and hills behind, a clump of oaks either side
  for (const [x, z, h] of [[-24, 30, 13], [-28, 22, 11], [24, 30, 12], [29, 21, 10], [-18, 40, 14], [18, 42, 14], [0, 46, 15], [-34, 38, 13], [35, 36, 12]] as const) fir(b, X + x, Z + z, h);
  for (const [x, z, n] of [[-12, 8, "tree_oak"], [13, 9, "tree_fat"], [-17, 13, "tree_default"]] as const) prop(b, {}, n, X + x, 0, Z + z, 9, x);
  hill(b, X - 90, Z + 160, 110, 55, 60, "#6b8b5c"); hill(b, X + 70, Z + 190, 140, 75, 70, "#61815a"); hill(b, X - 10, Z + 300, 260, 120, 110, "#7d8f70");
};
const marshSet = (b: Batch, o: V3) => {
  const [X, , Z] = o;
  b.add(ground(X - 700, X + 700, Z - 700, Z + 700, -0.02, 4), lam("grassMarsh", () => ({ map: grassHD(), color: "#c7c39a" })));
  b.add(ground(X - 700, X + 700, Z + 1.4, Z + 700, -0.6, 6), lam("bedG", () => ({ color: "#4f5e4c" })));
  b.add(quad(V(X - 700, -0.02, Z + 0.6), V(X + 700, -0.02, Z + 0.6), V(X + 700, -0.6, Z + 2.2), V(X - 700, -0.6, Z + 2.2), 350, 1), lam("mudG", () => ({ map: mudTex() })));
  WATERS.push([X - 700, X + 700, Z + 1.0, Z + 700, 0.1]);
  // reed beds: banks left and right, islands across the water
  for (const [x, z, n] of [[-3.4, 1.6, 26], [-4.4, 2.6, 22], [3.2, 2.4, 22], [4.4, 1.4, 26], [-2.0, 7, 30], [2.6, 9, 30], [-6, 12, 30], [7, 14, 30], [-1, 18, 26], [10, 6, 26], [-10, 5, 26]] as const) reeds(b, X + x, Z + z, n, (x * 31 + z * 7) | 0 || 3);
  for (const [x, z, s] of [[-12, 30, 8], [8, 40, 10], [30, 28, 9], [-30, 45, 9]] as const) b.add(sph, lam("grassIsle", () => ({ color: "#7c8a4a" })), M4(X + x, 0, Z + z, 0, [s, 0.6, s * 0.6]));
  for (const [x, z, h, n] of [[-14, 30, 10, "tree_default"], [-9, 33, 8, "tree_oak"], [9, 41, 11, "tree-high-round"], [30, 28, 9, "tree_fat"], [-30, 45, 12, "tree_default"], [-60, 90, 14, "tree_oak"], [55, 95, 13, "tree_default"]] as const) prop(b, {}, n, X + x, 0, Z + z, h, x);
  hill(b, X - 120, Z + 240, 160, 40, 60, "#6a7a5a"); hill(b, X + 140, Z + 270, 200, 55, 80, "#62725a");
  // a wooden post and a shooting butt on the bank
  b.add(cyl(0.07, 0.08, 1.1, 8), lam("postG", () => ({ color: "#5e4430" })), M4(X - 2.6, 0.55, Z + 0.4));
};
const todaySet = (b: Batch, o: V3) => {
  const [X, , Z] = o;
  b.add(ground(X - 700, X + 700, Z - 700, Z + 700, 0, 4), lam("lawnToday", () => ({ map: grassHD(), color: "#dde6cf" })));
  b.add(ground(X - 3.2, X - 2.2, Z - 2, Z + 8, 0.015, 1.5), lam("paveG", () => ({ map: paveTex() })));
  picketFence(b, X - 9, X + 9, Z + 8.5);
  house(b, X - 3.5, Z + 15, 0, 10, 8, 6, 3);
  house(b, X + 9, Z + 17, -0.2, 9, 8, 6, 6);
  house(b, X - 15, Z + 18, 0.25, 9, 8, 6, 1);
  doghouse(b, X + 3.0, Z + 4.4, -0.5);
  prop(b, {}, "tree_oak", X - 6.5, 0, Z + 5.5, 7.5, 2);
  prop(b, {}, "tree_default", X + 7.5, 0, Z + 9.5, 8, 5);
  for (const [x, z, s] of [[-8, 8, 1.1], [-5.5, 8.1, 0.9], [5, 8.1, 1.0], [8.2, 8, 1.2]] as const) prop(b, {}, "plant_bushLarge", X + x, 0, Z + z, s, x);
  b.add(sph, lam("ballG", () => ({ color: "#d8e84a" })), M4(X + 1.8, 0.06, Z + 2.6, 0, [0.065, 0.065, 0.065]));
  for (const [x, z, h] of [[-25, 30, 11], [20, 34, 12], [0, 40, 10]] as const) prop(b, {}, "tree-high-round", X + x, 0, Z + z, h, x);
};

const SETS = [wolfSet, campSet, dockSet, tweedSet, estateSet, marshSet, todaySet];
export const buildGoldenWorld = (root: THREE.Object3D, rays: Ray[]) => {
  setSight(rays);
  const b = new Batch();
  SETS.forEach((fn, i) => fn(b, O(i)));
  b.build(root);
};
