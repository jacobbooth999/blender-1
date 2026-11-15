// The Roman world: Rome on its hills (forum, temple, houses, walls, gate), the roads leaving it, the marching camp,
// the road under construction (agger layers), the Rhine with Caesar's pile bridge, a provincial village and the
// tribes' ridge. Static parts merge into batches; the camp, the road layers, the bridge and the branch stall are
// posed per frame from story.ts states.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, quad, tri, house, prop, setSight, Ray } from "./build";
import { ctex, rep, rng, grassHD, stoneHD, roofHD, jit } from "./paint";
import { twoTone } from "./shade";
import {
  ROME, GATE_Z, CAMP, CAMP_H, MULE_X, HOOK, RD2_X, RD2_END, RHINE, RIVER_W, WATER_Y, DECK_Y, VILLAGE, RIDGE, RIDGE_H, STALL, BRANCH,
  MILESTONE, ROADS, BENTS, smooth, clamp01,
} from "./story";

// ---------------- painted textures ----------------
const TAU = Math.PI * 2;
/** big polygonal Roman paving slabs, 1024 px = 4 m */
const pavingTex = () => ctex("paving", 1024, 1024, (g, r) => {
  g.fillStyle = "#6f6458"; g.fillRect(0, 0, 1024, 1024);
  const cols = ["#b9ad9a", "#ad9f8b", "#c2b6a2", "#a8998a", "#b4a690"];
  for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) {
    const cx = (i + 0.5 + (r() - 0.5) * 0.3) * 114, cy = (j + 0.5 + (r() - 0.5) * 0.3) * 114, n = 5 + Math.floor(r() * 3), rad = 50 + r() * 10;
    g.beginPath();
    for (let k = 0; k < n; k++) { const a = (k / n) * TAU + r() * 0.4, rr = rad * (0.85 + r() * 0.25); const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr; if (k) g.lineTo(x, y); else g.moveTo(x, y); }
    g.closePath(); g.fillStyle = jit(r, cols[(i * 3 + j) % 5], 0.08, 4, 0.1); g.fill();
    g.strokeStyle = "rgba(40,30,30,0.35)"; g.lineWidth = 3; g.stroke();
  }
});
const flatTex = (key: string, base: string, dots: string[], n = 900, rmax = 6) => ctex(key, 512, 512, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < n; i++) { g.fillStyle = dots[i % dots.length]; g.beginPath(); g.ellipse(r() * 512, r() * 512, 1 + r() * rmax, 1 + r() * rmax * 0.7, r() * 3, 0, TAU); g.fill(); }
});
const dirtTex = () => flatTex("dirt", "#b08a5e", ["#9c7650", "#c49c6c", "#8a6a48"], 700, 7);
const gravelTex = () => flatTex("gravel", "#bdb3a2", ["#a39887", "#d8cfbf", "#8f8577"], 2600, 4);
const sandTex = () => flatTex("sand", "#e2cfa0", ["#d4bf8c", "#efe0b8"], 900, 3);
const rubbleTex = () => ctex("rubble", 512, 512, (g, r) => {
  g.fillStyle = "#6f675e"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 150; i++) { g.fillStyle = jit(r, "#9d958a", 0.15, 5, 0.1); g.beginPath(); g.ellipse(r() * 512, r() * 512, 14 + r() * 22, 10 + r() * 14, r() * 3, 0, TAU); g.fill(); g.strokeStyle = "rgba(30,25,25,.4)"; g.lineWidth = 3; g.stroke(); }
});
/** road side: the layers in section (stone, gravel, sand, paving) on 0.62 m, 256 px tall */
const aggerSideTex = () => ctex("aggerSide", 512, 256, (g, r) => {
  const bands: [number, number, string][] = [[0, 50, "#a69a8a"], [50, 90, "#e2cfa0"], [90, 150, "#bdb3a2"], [150, 256, "#8a8176"]];
  for (const [a, b, c] of bands) { g.fillStyle = c; g.fillRect(0, a, 512, b - a); }
  for (let i = 0; i < 420; i++) { const y = 150 + r() * 106; g.fillStyle = jit(r, "#a59c90", 0.15, 4, 0.1); g.beginPath(); g.ellipse(r() * 512, y, 8 + r() * 10, 6 + r() * 6, 0, 0, TAU); g.fill(); }
  for (let i = 0; i < 900; i++) { const y = 90 + r() * 60; g.fillStyle = r() < 0.5 ? "#a39887" : "#d6cdbd"; g.fillRect(r() * 512, y, 3, 3); }
  g.strokeStyle = "rgba(40,30,30,.5)"; g.lineWidth = 3; for (const y of [50, 90, 150]) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); }
});
const plasterTex = (key: string, col: string) => ctex(key, 256, 256, (g, r) => {
  g.fillStyle = col; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${r() < 0.5 ? "255,250,235" : "120,100,80"},0.07)`; g.beginPath(); g.ellipse(r() * 256, r() * 256, 20 + r() * 40, 10 + r() * 20, 0, 0, TAU); g.fill(); }
});
const marbleTex = () => ctex("marble", 512, 512, (g, r) => {
  g.fillStyle = "#efe8da"; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "rgba(150,140,130,0.25)"; g.lineWidth = 2;
  for (let i = 0; i < 14; i++) { g.beginPath(); let x = r() * 512, y = 0; g.moveTo(x, y); while (y < 512) { x += (r() - 0.5) * 30; y += 20; g.lineTo(x, y); } g.stroke(); }
  g.fillStyle = "rgba(0,0,0,0.06)"; for (let y = 0; y < 512; y += 64) g.fillRect(0, y, 512, 3);
});
const tentTex = () => ctex("tent", 256, 256, (g) => {
  g.fillStyle = "#c9a878"; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "rgba(90,60,40,0.35)"; g.lineWidth = 3;
  for (let x = 0; x < 256; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); }
  for (let y = 0; y < 256; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
});
const thatchTex = () => ctex("thatch", 512, 512, (g, r) => {
  g.fillStyle = "#c9a45a"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 1600; i++) { const x = r() * 512, y = r() * 512; g.strokeStyle = r() < 0.5 ? "rgba(150,110,50,0.5)" : "rgba(235,205,130,0.5)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 6, y + 18); g.stroke(); }
});
const wattleTex = () => flatTex("wattle", "#d8c49a", ["#c4ad80", "#e6d6b0", "#b89c70"], 500, 8);
const awningTex = (key: string, a: string, b: string) => ctex(key, 256, 64, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(i * 32, 0, 32, 64); } });
const wallStone = () => lam("romeWall", () => ({ map: stoneHD("romeWallHD", ["#d9c7a4", "#cfbc98", "#e2d2b2", "#c8b48e"], "#9c8a6c") }));

// ---------------- small geometry helpers ----------------
const M4 = (x: number, y: number, z: number, ry = 0, s: [number, number, number] = [1, 1, 1]) =>
  new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), ry), V(...s));
/** flat quad facing up from (x0,z0) to (x1,z1) at height y; texture repeats every `tile` metres */
const ground = (x0: number, x1: number, z0: number, z1: number, y: number, tile: number) =>
  quad(V(x0, y, z1), V(x1, y, z1), V(x1, y, z0), V(x0, y, z0), (x1 - x0) / tile, (z1 - z0) / tile);
/** a strip of width w from p0 to p1 (xz), lifted dy, uv along its length every `tile` m */
const strip = (p0: [number, number], p1: [number, number], w: number, dy: number, tile: number) => {
  const dx = p1[0] - p0[0], dz = p1[1] - p0[1], L = Math.hypot(dx, dz), nx = (-dz / L) * (w / 2), nz = (dx / L) * (w / 2);
  return quad(V(p0[0] - nx, dy, p0[1] - nz), V(p0[0] + nx, dy, p0[1] + nz), V(p1[0] + nx, dy, p1[1] + nz), V(p1[0] - nx, dy, p1[1] - nz), w / tile, L / tile);
};
/** classical column: shaft, base, capital */
const column = (b: Batch, m: THREE.Material, x: number, y: number, z: number, h: number, r: number) => {
  b.add(new THREE.CylinderGeometry(r * 0.9, r, h, 16), m, M4(x, y + h / 2, z));
  b.add(boxGeo(V(x - r * 1.3, y, z - r * 1.3), V(x + r * 1.3, y + r * 0.5, z + r * 1.3)), m);
  b.add(boxGeo(V(x - r * 1.35, y + h - r * 0.45, z - r * 1.35), V(x + r * 1.35, y + h, z + r * 1.35)), m);
};
/** temple facing -z: podium, columns, pediment, tiled roof */
const temple = (b: Batch, x: number, y: number, z: number, w: number, d: number, s = 1) => {
  const mar = lam("marble", () => ({ map: marbleTex() })), roofM = lam("roofTemple", () => ({ map: roofHD("#c9704f"), side: THREE.DoubleSide }));
  const ph = 2 * s, ch = 7 * s, hw = w / 2, hd = d / 2;
  b.add(boxGeo(V(x - hw, y - 2, z - hd), V(x + hw, y + ph, z + hd), 3), mar);
  for (let k = 0; k < 4; k++) b.add(boxGeo(V(x - hw * 0.6, y + ph - (k + 1) * ph / 4, z - hd - (k + 1) * 0.5 * s), V(x + hw * 0.6, y + ph - k * ph / 4, z - hd)), mar); // steps
  b.add(boxGeo(V(x - hw + 1.6 * s, y + ph, z - hd + 3.2 * s), V(x + hw - 1.6 * s, y + ph + ch, z + hd - 0.6 * s), 3), lam("cella", () => ({ map: plasterTex("cella", "#ead9b4") })));
  const n = 6, r = 0.42 * s;
  for (let i = 0; i < n; i++) column(b, mar, x - hw + 0.8 * s + (i * (w - 1.6 * s)) / (n - 1), y + ph, z - hd + 0.8 * s, ch, r);
  for (let i = 1; i < 4; i++) for (const sx of [-1, 1]) column(b, mar, x + sx * (hw - 0.8 * s), y + ph, z - hd + 0.8 * s + i * (d - 1.6 * s) / 4, ch, r);
  const top = y + ph + ch;
  b.add(boxGeo(V(x - hw, top, z - hd), V(x + hw, top + 1.0 * s, z + hd)), mar); // entablature
  const rh = 2.6 * s, ov = 0.4;
  b.add(tri(V(x - hw, top + 1 * s, z - hd), V(x + hw, top + 1 * s, z - hd), V(x, top + 1 * s + rh, z - hd)), mar);
  b.add(tri(V(x + hw, top + 1 * s, z + hd), V(x - hw, top + 1 * s, z + hd), V(x, top + 1 * s + rh, z + hd)), mar);
  b.add(quad(V(x - hw - ov, top + 0.9 * s, z + hd + ov), V(x - hw - ov, top + 0.9 * s, z - hd - ov), V(x, top + 1 * s + rh, z - hd - ov), V(x, top + 1 * s + rh, z + hd + ov), d / 4, 2), roofM);
  b.add(quad(V(x + hw + ov, top + 0.9 * s, z - hd - ov), V(x + hw + ov, top + 0.9 * s, z + hd + ov), V(x, top + 1 * s + rh, z + hd + ov), V(x, top + 1 * s + rh, z - hd - ov), d / 4, 2), roofM);
};
/** market stall facing -z (counter in front, striped awning) */
export const stallGeo = (b: Batch, x: number, z: number, key: string, a: string, c: string) => {
  const wood = lam("stallWood", () => ({ color: "#9a6a42" })), aw = lam("awn" + key, () => ({ map: awningTex("awn" + key, a, c), side: THREE.DoubleSide }));
  b.add(boxGeo(V(x - 1.6, 0, z - 1.0), V(x + 1.6, 1.0, z - 0.6)), wood);
  b.add(boxGeo(V(x - 1.7, 1.0, z - 1.1), V(x + 1.7, 1.08, z - 0.5)), lam("stallTop", () => ({ color: "#c9a46a" })));
  for (const sx of [-1.55, 1.55]) for (const sz of [-1.0, 1.0]) b.add(boxGeo(V(x + sx - 0.06, 0, z + sz - 0.06), V(x + sx + 0.06, 2.6, z + sz + 0.06)), wood);
  b.add(quad(V(x - 1.8, 2.25, z - 1.5), V(x + 1.8, 2.25, z - 1.5), V(x + 1.8, 2.8, z + 1.1), V(x - 1.8, 2.8, z + 1.1), 1, 1), aw);
  b.add(boxGeo(V(x - 1.6, 0, z + 0.95), V(x + 1.6, 2.6, z + 1.05)), lam("stallBack", () => ({ map: plasterTex("stallBack", "#d9b98a") })));
  // amphorae + loaves on the counter
  for (let i = 0; i < 3; i++) b.add(new THREE.SphereGeometry(0.16, 10, 8), lam("loaf", () => ({ color: "#d99a52" })), M4(x - 1.0 + i * 0.35, 1.18, z - 0.8, 0, [1, 0.6, 1]));
  for (let i = 0; i < 2; i++) b.add(new THREE.CylinderGeometry(0.14, 0.2, 0.7, 10), lam("amph", () => ({ color: "#c46e46" })), M4(x + 0.9 + i * 0.4, 1.43, z - 0.75));
};
/** roundhouse: wattle wall + thatched cone */
const roundhouse = (b: Batch, x: number, z: number, r: number) => {
  b.add(new THREE.CylinderGeometry(r, r, 2.0, 20, 1, true), lam("wattle", () => ({ map: rep(wattleTex(), 4, 1), side: THREE.DoubleSide })), M4(x, 1.0, z));
  b.add(new THREE.ConeGeometry(r * 1.25, r * 1.5, 20, 1, true), lam("thatch", () => ({ map: rep(thatchTex(), 3, 1), side: THREE.DoubleSide })), M4(x, 2.0 + r * 0.75, z));
  b.add(boxGeo(V(x - 0.5, 0, z - r - 0.05), V(x + 0.5, 1.6, z - r + 0.1)), lam("doorDark", () => ({ color: "#4a3428" })));
};
const cypress = (b: Batch, x: number, z: number, h: number) => {
  b.add(new THREE.CylinderGeometry(0.12, 0.18, h * 0.15, 6), lam("barkHD", () => ({ color: "#8f5d3b" })), M4(x, h * 0.075, z));
  b.add(new THREE.SphereGeometry(1, 12, 10), lam("cypress", () => ({ color: "#3f7a3a" })), M4(x, h * 0.55, z, 0, [h * 0.12, h * 0.45, h * 0.12]));
};
const hillM = [0, 1, 2].map((i) => lam("hill" + i, () => ({ color: ["#6a9a4a", "#628f45", "#72a152"][i] })));
const hillGeo = new THREE.SphereGeometry(1, 36, 16, 0, Math.PI * 2, 0, Math.PI / 2);
const hill = (b: Batch, x: number, z: number, rx: number, h: number, rz: number, i: number) => b.add(hillGeo, hillM[i % 3], M4(x, 0, z, 0, [rx, h, rz]));

// Rome's hills (x, z, radius x, height, radius z) and what stands on them
export const HILLS: [number, number, number, number, number][] = [
  [-62, 30, 34, 13, 30], [-30, 78, 30, 11, 26], [30, 80, 32, 12, 28], [70, 40, 30, 14, 34], [64, -36, 26, 9, 24], [-66, -40, 28, 10, 24], [0, 128, 34, 12, 22],
];
const inHill = (x: number, z: number, pad = 2) => HILLS.some(([hx, hz, rx, , rz]) => ((x - hx) / (rx + pad)) ** 2 + ((z - hz) / (rz + pad)) ** 2 < 1);
const onRoad = (x: number, z: number) => Math.abs(x) < 8 && z < 20;
const inForum = (x: number, z: number) => Math.abs(x) < 30 && z > -24 && z < 34;

/** paved road from (x0, z0) along heading `dir` (radians from -z, clockwise from above) for len metres */
const road = (b: Batch, x0: number, z0: number, dir: number, len: number, w = 5) => {
  const dx = Math.sin(dir), dz = -Math.cos(dir), p1: [number, number] = [x0 + dx * len, z0 + dz * len];
  b.add(strip([x0, z0], p1, w, 0.04, 4), lam("paving", () => ({ map: pavingTex() })));
  b.add(strip([x0, z0], p1, w + 1.6, 0.025, 2), lam("dirt", () => ({ map: dirtTex() })));
  return p1;
};
const R = rng;

export const buildRomanWorld = (root: THREE.Object3D, rays: Ray[]) => {
  setSight(rays);
  const b = new Batch(), r = R(7);
  const grassM = lam("grassRoman", () => ({ map: grassHD(), color: "#ccd0b8" }));
  // ---- ground: everything except the Rhine strip ----
  const [rx0, rx1, rz0, rz1] = [RHINE[0] - 2400, RHINE[0] + 800, RHINE[2] - RIVER_W - 2, RHINE[2] + RIVER_W + 2];
  const BIG = 7000;
  b.add(ground(-BIG, BIG, rz1, BIG, 0, 4), grassM);
  b.add(ground(-BIG, BIG, -BIG, rz0, 0, 4), grassM);
  b.add(ground(-BIG, rx0, rz0, rz1, 0, 4), grassM);
  b.add(ground(rx1, BIG, rz0, rz1, 0, 4), grassM);
  // river banks (sloped mud/grass) and bed
  const bankM = lam("bank", () => ({ map: dirtTex() }));
  b.add(quad(V(rx0, 0, rz0), V(rx1, 0, rz0), V(rx1, WATER_Y - 0.8, rz0 + 4), V(rx0, WATER_Y - 0.8, rz0 + 4), 400, 1), bankM);
  b.add(quad(V(rx1, 0, rz1), V(rx0, 0, rz1), V(rx0, WATER_Y - 0.8, rz1 - 4), V(rx1, WATER_Y - 0.8, rz1 - 4), 400, 1), bankM);
  b.add(ground(rx0, rx1, rz0 + 3, rz1 - 3, WATER_Y - 2.5, 8), lam("bed", () => ({ color: "#5a6a5a" })));

  // ---- Rome ----
  HILLS.forEach(([x, z, sx, h, sz], i) => hill(b, x, z, sx, h, sz, i));
  // forum paving, temple, basilica, milestone base
  b.add(ground(-26, 26, -22, 32, 0.03, 4), lam("paving", () => ({ map: pavingTex() })));
  temple(b, 0, 0, 24, 16, 20, 1);
  temple(b, HILLS[0][0], HILLS[0][3] - 0.6, HILLS[0][1], 12, 15, 0.8);
  temple(b, HILLS[3][0], HILLS[3][3] - 0.6, HILLS[3][1], 12, 15, 0.8);
  const mar = lam("marble", () => ({ map: marbleTex() }));
  // basilica along the east side of the forum: colonnade + long roof
  b.add(boxGeo(V(20, 0, -14), V(26, 7, 22), 3), lam("basWall", () => ({ map: plasterTex("basWall", "#e6d2a8") })));
  for (let i = 0; i < 9; i++) column(b, mar, 19, 0, -12 + i * 4.2, 6, 0.32);
  b.add(boxGeo(V(18.4, 6, -14), V(26.4, 6.8, 22)), mar);
  b.add(quad(V(18.2, 6.8, -14.4), V(18.2, 6.8, 22.4), V(22.3, 9, 22.4), V(22.3, 9, -14.4), 9, 1), lam("roofTemple", () => ({ map: roofHD("#c9704f"), side: THREE.DoubleSide })));
  // statues on plinths
  for (const [x, z] of [[-14, 14], [14, 14], [-14, -16]] as const) { b.add(boxGeo(V(x - 0.7, 0, z - 0.7), V(x + 0.7, 1.6, z + 0.7)), mar); b.add(new THREE.CylinderGeometry(0.3, 0.4, 1.6, 10), lam("bronze", () => ({ color: "#5d8a78" })), M4(x, 2.4, z)); b.add(new THREE.SphereGeometry(0.3, 10, 8), lam("bronze", () => ({ color: "#5d8a78" })), M4(x, 3.45, z)); }
  stallGeo(b, STALL[0], STALL[2], "rome", "#c0362f", "#f3ecdc");
  stallGeo(b, STALL[0] - 6, STALL[2] + 1, "rome2", "#3f6fb5", "#f3ecdc");
  b.add(boxGeo(V(MILESTONE[0] - 0.7, 0, MILESTONE[2] - 0.7), V(MILESTONE[0] + 0.7, 0.45, MILESTONE[2] + 0.7)), mar);
  // houses: blocks around the forum and up the slopes between the hills
  for (let i = 0; i < 520; i++) {
    const x = (r() - 0.5) * 300, z = -84 + r() * 250;
    if (inForum(x, z) || onRoad(x, z) || inHill(x, z) || (Math.abs(x) < 34 && z > -30 && z < 40)) continue;
    const w = [7, 8, 9][Math.floor(r() * 3)], h = [6, 7, 8.4, 9.8][Math.floor(r() * 4)];
    house(b, x, z, Math.round(r() * 3) * (Math.PI / 2), w, 8, h, Math.floor(r() * 8));
  }
  // villas on the hill tops
  HILLS.forEach(([x, z, , h], i) => { if (i !== 0 && i !== 3) house(b, x + 4, z - 3, i * 0.7, 9, 8, 6, i + 2, h - 0.5); });
  // city wall + gate (rectangle x -160..160, z GATE_Z..120), gate on the main road
  const W = wallStone(), wh = 8, wt = 2.6;
  const wallSeg = (x0: number, z0: number, x1: number, z1: number) => {
    b.add(boxGeo(V(Math.min(x0, x1) - wt / 2, 0, Math.min(z0, z1) - wt / 2), V(Math.max(x0, x1) + wt / 2, wh, Math.max(z0, z1) + wt / 2), 4), W);
    const L = Math.hypot(x1 - x0, z1 - z0), n = Math.floor(L / 2.2);
    for (let k = 0; k < n; k++) { const u = (k + 0.5) / n, x = x0 + (x1 - x0) * u, z = z0 + (z1 - z0) * u; b.add(boxGeo(V(x - 0.55, wh, z - 0.55), V(x + 0.55, wh + 1.0, z + 0.55)), W); }
  };
  wallSeg(-160, GATE_Z, -8, GATE_Z); wallSeg(8, GATE_Z, 160, GATE_Z);
  wallSeg(-160, GATE_Z, -160, 150); wallSeg(160, GATE_Z, 160, 150); wallSeg(-160, 150, 160, 150);
  for (const sx of [-1, 1]) { // gate towers
    b.add(boxGeo(V(sx * 8 - 4, 0, GATE_Z - 4), V(sx * 8 + 4, 13, GATE_Z + 4), 4), W);
    for (let k = 0; k < 4; k++) for (let j = 0; j < 4; j++) if (k === 0 || k === 3 || j === 0 || j === 3) b.add(boxGeo(V(sx * 8 - 4 + k * 2.2, 13, GATE_Z - 4 + j * 2.2), V(sx * 8 - 4 + k * 2.2 + 1.2, 14.1, GATE_Z - 4 + j * 2.2 + 1.2)), W);
  }
  b.add(boxGeo(V(-4.2, 6.5, GATE_Z - 2.2), V(4.2, 10.5, GATE_Z + 2.2), 4), W); // arch top
  for (let k = 0; k < 9; k++) { const a = Math.PI * (k / 8); b.add(boxGeo(V(-4 * Math.cos(a) - 0.45, 4.2 + 2.2 * Math.sin(a), GATE_Z - 2.3), V(-4 * Math.cos(a) + 0.45, 4.2 + 2.2 * Math.sin(a) + 2.3, GATE_Z - 2.15)), W); }
  // street from the forum to the gate + the roads out
  b.add(strip([0, -22], [0, GATE_Z], 6, 0.04, 4), lam("paving", () => ({ map: pavingTex() })));
  road(b, 0, GATE_Z, 0, 4200);
  const ends: [number, number, number][] = [[0, GATE_Z - 4200, 0]];
  for (const d of ROADS.slice(1)) {
    const sx = Math.sin(d), sz = -Math.cos(d), k = Math.min(160 / Math.max(1e-3, Math.abs(sx)), (sz < 0 ? 90 : 150) / Math.max(1e-3, Math.abs(sz)));
    const x0 = sx * k, z0 = sz * k, e = road(b, x0, z0, d, 4200);
    ends.push([e[0], e[1], d]);
  }
  // cypresses + milestones along the main road, farms and towns along every road
  for (let z = GATE_Z - 14; z > GATE_Z - 1400; z -= 18 + r() * 10) {
    if (Math.abs(z - GATE_Z) > 12) for (const sx of [-1, 1]) if (r() < 0.75) cypress(b, sx * (5.2 + r() * 1.2), z + r() * 4, 7 + r() * 3);
  }
  for (let z = GATE_Z - 60; z > GATE_Z - 1400; z -= 100) b.add(new THREE.CylinderGeometry(0.28, 0.32, 1.3, 10), mar, M4(3.4, 0.65, z));
  for (const d of ROADS) {
    const sx = Math.sin(d), sz = -Math.cos(d);
    for (const dist of [700, 1400, 2100, 2900]) {
      const cx = sx * (dist + 150) + -sz * 18, cz = sz * (dist + 150) + sx * 18;
      for (let k = 0; k < 7; k++) house(b, cx + (r() - 0.5) * 40, cz + (r() - 0.5) * 40, r() * 3, 8, 8, 6 + r() * 2, k + Math.floor(dist / 100));
    }
  }
  // countryside trees (cartoon vegetation from build.ts) away from the sets
  const trees = ["tree_oak", "tree_default", "tree_fat", "tree-high-round", "tree_cone"];
  const busy = (x: number, z: number) => (Math.abs(x) < 200 && z > GATE_Z - 6 && z < 175) || Math.abs(x) < 9 || (Math.abs(x - RD2_X) < 9 && z < -100) ||
    (Math.abs(x - CAMP[0]) < 60 && Math.abs(z - CAMP[2]) < 60) || (Math.abs(x - MULE_X) < 8 && z < -20) || (Math.abs(z - RHINE[2]) < 44 && x < -600) ||
    Math.hypot(x - VILLAGE[0], z - VILLAGE[2]) < 32 || Math.hypot(x - RIDGE[0], z - RIDGE[2]) < 30 || Math.hypot(x - HOOK[0], z - HOOK[2]) < 14;
  for (let i = 0; i < 2600; i++) {
    const x = (r() - 0.5) * 3400, z = (r() - 0.5) * 3400;
    if (busy(x, z)) continue;
    prop(b, {}, trees[i % trees.length], x, 0, z, 7 + r() * 5, r() * 6);
  }
  // far forest on the Rhine's east bank + scattered on the near bank
  for (let i = 0; i < 700; i++) {
    const x = RHINE[0] + (r() - 0.5) * 900, z = RHINE[2] + RIVER_W + 8 + r() * 160;
    if (Math.abs(x - RHINE[0]) < 14 && z < RHINE[2] + 58) continue;
    prop(b, {}, trees[(i + 2) % trees.length], x, 0, z, 8 + r() * 7, r() * 6);
  }
  for (let i = 0; i < 160; i++) {
    const x = RHINE[0] + (r() - 0.5) * 900, z = RHINE[2] - RIVER_W - 30 - r() * 150;
    if (Math.abs(x - RHINE[0]) < 40) continue;
    prop(b, {}, trees[i % trees.length], x, 0, z, 8 + r() * 6, r() * 6);
  }

  // ---- marching-camp field: track to the camp ----
  b.add(strip([MULE_X, -620], [MULE_X, CAMP[2] - CAMP_H - 4], 3.4, 0.03, 3), lam("dirt", () => ({ map: dirtTex() })));
  // ---- the road under construction: finished agger, the dirt track beyond ----
  const aggerTop = lam("paving", () => ({ map: pavingTex() })), aggerSide = lam("aggerSide", () => ({ map: aggerSideTex() }));
  const z0 = -120, z1 = RD2_END + 10, ah = 0.62;
  b.add(quad(V(RD2_X - 2.5, ah, z0), V(RD2_X + 2.5, ah, z0), V(RD2_X + 2.5, ah, z1), V(RD2_X - 2.5, ah, z1), 5 / 4, (z0 - z1) / 4), aggerTop);
  for (const sx of [-1, 1]) b.add(quad(V(RD2_X + sx * 2.5, 0, sx < 0 ? z0 : z1), V(RD2_X + sx * 2.5, 0, sx < 0 ? z1 : z0), V(RD2_X + sx * 2.5, ah, sx < 0 ? z1 : z0), V(RD2_X + sx * 2.5, ah, sx < 0 ? z0 : z1), (z0 - z1) / 2, 1), aggerSide);
  b.add(quad(V(RD2_X + 2.5, 0, z1), V(RD2_X - 2.5, 0, z1), V(RD2_X - 2.5, ah, z1), V(RD2_X + 2.5, ah, z1), 2.5, 1), aggerSide);
  b.add(strip([RD2_X, RD2_END], [RD2_X, -1700], 4, 0.03, 3), lam("dirt", () => ({ map: dirtTex() })));
  b.add(strip([RD2_X, RD2_END + 10], [RD2_X, RD2_END - 2], 7.5, 0.02, 3), lam("dirt", () => ({ map: dirtTex() })));
  for (let z = -140; z > -1600; z -= 20 + r() * 8) for (const sx of [-1, 1]) if (r() < 0.7) cypress(b, RD2_X + sx * (5 + r()), z, 7 + r() * 3);
  // piles of stone / gravel / sand by the construction end
  const heap = (x: number, z: number, col: string, key: string, s: number) => b.add(new THREE.SphereGeometry(1, 16, 8, 0, TAU, 0, Math.PI / 2), lam(key, () => ({ color: col })), M4(x, 0, z, 0, [s, s * 0.55, s]));
  heap(RD2_X - 5.5, RD2_END + 6, "#9d958a", "heapStone", 1.6); heap(RD2_X - 5.8, RD2_END + 10, "#c7bdab", "heapGravel", 1.4); heap(RD2_X + 5.6, RD2_END + 8, "#e2cfa0", "heapSand", 1.5);
  // ---- village: roundhouses, fences, fields ----
  for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU + 0.3, d = 14 + (k % 3) * 3; if (Math.abs(a - 4.7) > 0.5) roundhouse(b, VILLAGE[0] + Math.cos(a) * d, VILLAGE[2] + Math.sin(a) * d, 3.2 + (k % 2) * 0.6); }
  const fence = lam("fence", () => ({ color: "#8a6a48" }));
  for (let k = 0; k < 70; k++) { const a = (k / 70) * TAU, x = VILLAGE[0] + Math.cos(a) * 26, z = VILLAGE[2] + Math.sin(a) * 26; if (Math.abs(a - 4.71) < 0.25) continue; b.add(boxGeo(V(x - 0.07, 0, z - 0.07), V(x + 0.07, 1.2, z + 0.07)), fence); }
  b.add(ground(VILLAGE[0] - 30, VILLAGE[0] - 6, VILLAGE[2] + 30, VILLAGE[2] + 70, 0.02, 3), lam("field", () => ({ map: flatTex("field", "#d8b85a", ["#c9a64a", "#e8cc72"], 1400, 3) })));
  b.add(strip([VILLAGE[0], VILLAGE[2] - 26], [VILLAGE[0], VILLAGE[2] - 300], 3, 0.03, 3), lam("dirt", () => ({ map: dirtTex() })));
  // ---- the tribes' ridge ----
  hill(b, RIDGE[0], RIDGE[2], 48, RIDGE_H, 44, 1);
  b.build(root);
  setSight([]);
  return { ends };
};

// ---------------- dynamic sets ----------------
const ub = new THREE.BoxGeometry(1, 1, 1);
const inst = (root: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, n: number) => {
  const im = new THREE.InstancedMesh(g, m, n); im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; root.add(im); return im;
};
const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), p3 = new THREE.Vector3(), s3 = new THREE.Vector3();
const setM = (im: THREE.InstancedMesh, i: number, x: number, y: number, z: number, sx: number, sy: number, sz: number, ry = 0, rx = 0) => {
  q4.setFromEuler(new THREE.Euler(rx, ry, 0, "YXZ"));
  im.setMatrixAt(i, m4.compose(p3.set(x, y, z), q4, s3.set(Math.max(1e-4, sx), Math.max(1e-4, sy), Math.max(1e-4, sz))));
};

/** the marching camp: ditch strips, earth rampart, palisade stakes, tents, fires */
export class Camp {
  private ditch: THREE.InstancedMesh; private wall: THREE.InstancedMesh; private stakes: THREE.InstancedMesh; private tents: THREE.InstancedMesh;
  private fires: THREE.InstancedMesh;
  private stakeAt: [number, number][] = []; private tentAt: [number, number, number][] = [];
  fireAt: [number, number][] = [];
  constructor(root: THREE.Object3D) {
    const earth = lam("earth", () => ({ map: dirtTex() }));
    this.ditch = inst(root, ub, lam("ditch", () => ({ color: "#5e4632" })), 8);
    const tri3 = new THREE.BufferGeometry(); // rampart prism (1 m long along x, base 3 m, height 1.6 m)
    tri3.setAttribute("position", new THREE.Float32BufferAttribute([
      -0.5, 0, -1.5, 0.5, 0, -1.5, 0.5, 1.6, -0.4, -0.5, 0, -1.5, 0.5, 1.6, -0.4, -0.5, 1.6, -0.4,
      -0.5, 1.6, -0.4, 0.5, 1.6, -0.4, 0.5, 1.6, 0.4, -0.5, 1.6, -0.4, 0.5, 1.6, 0.4, -0.5, 1.6, 0.4,
      -0.5, 1.6, 0.4, 0.5, 1.6, 0.4, 0.5, 0, 1.5, -0.5, 1.6, 0.4, 0.5, 0, 1.5, -0.5, 0, 1.5,
    ], 3));
    tri3.setAttribute("uv", new THREE.Float32BufferAttribute(Array(18).fill(0).flatMap((_, i) => [i % 2, (i >> 1) % 2]), 2));
    tri3.computeVertexNormals();
    this.wall = inst(root, tri3, earth, 8);
    const H = CAMP_H, gate = 3;
    for (const side of [0, 1, 2, 3]) for (let s = -H + 0.25; s < H; s += 0.55) {
      if (Math.abs(s) < gate) continue;
      const [x, z] = side === 0 ? [s, -H] : side === 1 ? [H, s] : side === 2 ? [-s, H] : [-H, -s];
      this.stakeAt.push([CAMP[0] + x, CAMP[2] + z]);
    }
    this.stakes = inst(root, new THREE.CylinderGeometry(0.09, 0.11, 1, 6).translate(0, 0.5, 0), lam("stake", () => ({ color: "#a07246" })), this.stakeAt.length);
    for (let i = 0; i < 6; i++) for (let j = 0; j < 7; j++) {
      if (Math.abs(j - 3) < 1 && Math.abs(i - 2.5) < 1) continue;
      this.tentAt.push([CAMP[0] - 21 + i * 8.4, CAMP[2] - 22 + j * 7.4, ((i + j) % 4) * 0.13]);
    }
    const tentG = new THREE.CylinderGeometry(1.5, 1.5, 3, 3, 1).rotateX(Math.PI / 2).rotateZ(Math.PI / 6 + Math.PI / 2).translate(0, 0.75, 0);
    this.tents = inst(root, tentG, lam("tent", () => ({ map: tentTex() })), this.tentAt.length);
    for (let i = 0; i < 6; i++) this.fireAt.push([CAMP[0] - 17 + (i % 3) * 17, CAMP[2] - 14 + Math.floor(i / 3) * 28]);
    const glow = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 1.6, 0.5), toneMapped: true });
    this.fires = inst(root, new THREE.SphereGeometry(0.35, 10, 8), glow, this.fireAt.length);
    this.fires.castShadow = false;
  }
  pose(st: { ditch: number; wall: number; stakes: number; tents: number; fires: number }) {
    const H = CAMP_H, D = H + 3.4;
    // four sides, each in two halves either side of the gate, grown outward from the gate
    let k = 0;
    for (const side of [0, 1, 2, 3]) for (const half of [-1, 1]) {
      const L = (H - 3) * st.ditch, c = half * (3 + L / 2), ry = side % 2 ? Math.PI / 2 : 0;
      const pos = (s: number, d: number): [number, number] => side === 0 ? [s, -d] : side === 1 ? [d, s] : side === 2 ? [-s, d] : [-d, -s];
      const [dx, dz] = pos(c, D);
      setM(this.ditch, k, CAMP[0] + dx, 0.012, CAMP[2] + dz, (H - 3) * st.ditch + 0.01, 0.02, 2.4, ry);
      const Lw = (H - 3) * st.wall, cw = half * (3 + (H - 3) / 2), [wx, wz] = pos(cw, H + 0.6);
      setM(this.wall, k, CAMP[0] + wx, 0, CAMP[2] + wz, H - 3, Math.max(0.001, st.wall), 1, ry);
      void Lw;
      k++;
    }
    this.ditch.instanceMatrix.needsUpdate = true; this.wall.instanceMatrix.needsUpdate = true;
    this.stakeAt.forEach(([x, z], i) => {
      const u = clamp01(st.stakes * 1.6 - (i / this.stakeAt.length) * 0.6);
      setM(this.stakes, i, x, 1.55 * st.wall, z, 1, 1.5 * smooth(u), 1);
    });
    this.stakes.instanceMatrix.needsUpdate = true;
    this.tentAt.forEach(([x, z, d], i) => {
      const u = smooth((st.tents - d * 2 - (i % 7) * 0.04) * 3);
      setM(this.tents, i, x, 0, z, 1.2 * u, 1.2 * u, 1.2 * u);
    });
    this.tents.instanceMatrix.needsUpdate = true;
    this.fireAt.forEach(([x, z], i) => setM(this.fires, i, x, 0.25, z, st.fires, st.fires, st.fires));
    this.fires.instanceMatrix.needsUpdate = true;
    this.fires.visible = st.fires > 0;
  }
}

/** the last 10 m of the new road in section: stone, gravel, sand, paving (scaled up as each word lands) */
export class Layers {
  private boxes: THREE.Mesh[] = [];
  private spec: [number, number, number][] = [[6.0, 0.25, 0], [5.6, 0.15, 0], [5.2, 0.1, 0], [5.0, 0.12, 0]];
  constructor(root: THREE.Object3D) {
    const mats = [lam("rubble", () => ({ map: rubbleTex() })), lam("gravel", () => ({ map: gravelTex() })), lam("sand", () => ({ map: sandTex() })), lam("paving", () => ({ map: pavingTex() }))];
    for (let i = 0; i < 4; i++) {
      const m = new THREE.Mesh(ub, mats[i]); m.castShadow = true; m.receiveShadow = true; root.add(m); this.boxes.push(m);
    }
  }
  pose(st: { stone: number; gravel: number; sand: number; pave: number }) {
    const v = [st.stone, st.gravel, st.sand, st.pave];
    let y = 0;
    this.boxes.forEach((m, i) => {
      const [w, h] = this.spec[i], k = v[i], hh = Math.max(0.001, h * k);
      m.visible = k > 0.001;
      m.scale.set(w, hh, 10); m.position.set(RD2_X, y + hh / 2, RD2_END + 5);
      y += h * k;
    });
  }
}

/** Caesar's pile bridge across the Rhine: bents rise from the far side of the near bank, deck sections follow;
 *  torn down from the far end, sections drop and sink */
export class RhineBridge {
  private piles: THREE.InstancedMesh; private caps: THREE.InstancedMesh; private deck: THREE.InstancedMesh; private rails: THREE.InstancedMesh;
  constructor(root: THREE.Object3D) {
    const wood = lam("bridgeWood", () => ({ color: "#a8784c" })), dark = lam("bridgeDark", () => ({ color: "#7a5636" }));
    this.piles = inst(root, new THREE.CylinderGeometry(0.22, 0.26, 1, 8).translate(0, 0.5, 0), dark, BENTS * 4);
    this.caps = inst(root, ub, dark, BENTS);
    this.deck = inst(root, ub, lam("deckPlanks", () => ({ map: rep(flatTex("deckP", "#c49a64", ["#a87e4c", "#d8b07a"], 300, 10), 2, 2) })), BENTS - 1);
    this.rails = inst(root, ub, wood, (BENTS - 1) * 2);
  }
  /** bent k z position */
  static z(k: number) { return RHINE[2] - RIVER_W + (k * 2 * RIVER_W) / (BENTS - 1); }
  /** deck section k (between bents k and k+1): 0 standing .. 1 fallen and sunk, by the tear-down progress */
  static fallK(k: number, torn: number) { const order = (BENTS - 2 - k) / (BENTS - 1); return clamp01((torn - order * 0.8) / 0.25); }
  pose(st: { built: number; torn: number }) {
    const bottom = WATER_Y - 3;
    for (let k = 0; k < BENTS; k++) {
      const z = RhineBridge.z(k), up = smooth(st.built - k), fall = st.torn > 0 ? RhineBridge.fallK(Math.min(k, BENTS - 2), st.torn) : 0;
      const top = DECK_Y - 0.15, h = (top - bottom) * up, sink = 3.5 * smooth(fall);
      [-3.0, -1.2, 1.2, 3.0].forEach((x, i) => setM(this.piles, k * 4 + i, RHINE[0] + x, bottom - sink, z + (i % 2 ? 0.25 : -0.25), 1, h, 1, 0, fall * 0.6));
      const capOn = up < 1e-3 ? 1e-4 : 1;
      setM(this.caps, k, RHINE[0], bottom + h - 0.1 - sink, z, 7 * capOn, 0.3 * up, 0.5 * capOn, 0, fall * 0.4);
    }
    for (let k = 0; k < BENTS - 1; k++) {
      const z0 = RhineBridge.z(k), z1 = RhineBridge.z(k + 1), on = smooth((st.built - k - 1) * 1.5);
      const fall = RhineBridge.fallK(k, st.torn), f2 = smooth(fall), drop = (DECK_Y - WATER_Y + 1.6) * f2, tilt = 0.5 * Math.sin(f2 * Math.PI) * (k % 2 ? 1 : -1);
      const zc = (z0 + z1) / 2, len = (z1 - z0) * on;
      // an unbuilt section must vanish completely (a zero-length box still drew a 7 m x 0.25 m plank floating at deck height)
      const gone = on < 1e-3 ? 1e-4 : 1;
      setM(this.deck, k, RHINE[0], DECK_Y - drop, z0 + len / 2 + 0.01, 7 * gone, 0.25 * gone, len, tilt * 0.3, tilt);
      for (const [i, x] of [[0, -3.3], [1, 3.3]] as const) setM(this.rails, k * 2 + i, RHINE[0] + x, DECK_Y + 0.6 - drop, z0 + len / 2, 0.15 * gone, 0.12 * gone, len, tilt * 0.3, tilt);
      void zc;
    }
    this.piles.instanceMatrix.needsUpdate = true; this.caps.instanceMatrix.needsUpdate = true; this.deck.instanceMatrix.needsUpdate = true; this.rails.instanceMatrix.needsUpdate = true;
  }
}

/** the "new branch": a stall that pops up in the village */
export class Branch {
  group = new THREE.Group();
  constructor(root: THREE.Object3D) {
    const b = new Batch();
    stallGeo(b, 0, 0, "branch", "#c0362f", "#f3ecdc");
    b.build(this.group);
    this.group.position.set(BRANCH[0], 0, BRANCH[2]);
    root.add(this.group);
  }
  pose(k: number) { const s = Math.max(1e-3, k < 1 ? k * (1 + 0.25 * Math.sin(k * Math.PI)) : 1); this.group.scale.set(s, s, s); this.group.visible = k > 0.001; }
}

/** the golden milestone (bronze gilt column), slightly emissive so the bloom catches it */
export const milestoneMesh = (root: THREE.Object3D) => {
  const gold = twoTone(new THREE.MeshPhongMaterial({ color: "#e8b84a", specular: "#fff2c0", shininess: 70, emissive: new THREE.Color(0.35, 0.22, 0.02) }), 0.2);
  const g = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 2.6, 24), gold); shaft.position.y = 0.45 + 1.3;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.42, 0.3, 24), gold); cap.position.y = 0.45 + 2.75;
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 14), gold); ball.position.y = 0.45 + 3.1;
  for (const m of [shaft, cap, ball]) { m.castShadow = true; m.receiveShadow = true; g.add(m); }
  g.position.set(MILESTONE[0], 0, MILESTONE[2]);
  root.add(g);
  return g;
};
void ROME;
