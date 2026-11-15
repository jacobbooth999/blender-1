import * as S from "../src/videos/rome_cam/story";
const { SHOTS, camAt, wf, ws, FPS } = S as any;
const R = S.RHINE, VG = S.VILLAGE, G = S.GATE_Z;
type P = [string, number, number, number?]; // name x z y
const T = (f: number) => f / FPS;
const pts: Record<string, (f: number) => P[]> = {
  hook: () => [["hero", S.HOOK[0], S.HOOK[2]], ["d1", S.HOOK[0] - 3.5, S.HOOK[2] + 7]],
  ridge: () => [0, 2, 5].map((k) => { const p = S.ridgePt(-1.9 + k * 0.75, 0); return ["t" + k, p[0] - (k % 2) * 0.4, p[2] + (k % 2) * 0.66, p[1]] as P; }),
  mule: (f) => [["mule", S.MULE_X, S.muleZ(T(f))], ["donkey", S.MULE_X - 1.5, S.muleZ(T(f)) + 0.3]],
  camp: (f) => [["dig0", S.CAMP[0] - 14, S.CAMP[2] - 33.4], ["dig4", S.CAMP[0], S.CAMP[2] - 33.4], ["dig5", S.CAMP[0] + 3.5, S.CAMP[2] - 33.4]],
  layers: () => [["dig", S.RD2_X + 3.6, S.RD2_END + 2.4], ["ham", S.RD2_X - 3.8, S.RD2_END + 3.2], ["top", S.RD2_X - 1.2, S.RD2_END + 8, 0.62], ["cut", S.RD2_X, S.RD2_END, -1.4]],
  road: (f) => [["crew", S.RD2_X - 2, S.RD2_END + 3], ["col0", S.RD2_X, S.RD2_END - 14 - 1.4 * (T(f) - ws(11))]],
  army: (f) => [["front L", -1.5, S.armyZ(T(f))], ["front R", 1.5, S.armyZ(T(f))], ["row2", 0, S.armyZ(T(f)) - 1.5]],
  caesar: () => [["caesar", R[0] - 3, R[2] - 42], ["banner", R[0] - 6.2, R[2] - 39.6], ["spear", R[0] + 0.4, R[2] - 39.2], ["tribe", R[0], R[2] + 44]],
  tribes: () => [["t0", R[0] - 8, R[2] + 42], ["t4", R[0], R[2] + 43.4], ["t8", R[0] + 8, R[2] + 44.8]],
  noBoats: () => [["l2", R[0] + 1.5, R[2] - 41], ["caesar", R[0] - 2, R[2] - 39.5], ["l0", R[0] - 5, R[2] - 40.5], ["l1", R[0] - 7.5, R[2] - 42.2], ["l3", R[0] + 3.6, R[2] - 42.5]],
  build: () => [["l1", R[0] + 2.4, R[2] - 10.8, 0.67], ["l0", R[0] - 2.2, R[2] - 11.5, 0.67], ["caesar", R[0] + 0.2, R[2] - 13, 0.67], ["l2", R[0] - 1.2, R[2] - 8.5, 0.67], ["far tribe", R[0], R[2] + 43]],
  impressed: () => [["t1", R[0] + 0.6, R[2] + 47.8], ["t0", R[0] - 1.2, R[2] + 47.2], ["t2", R[0] + 2.2, R[2] + 47.1], ["t3", R[0] + 3.7, R[2] + 48.4], ["t4", R[0] - 2.6, R[2] + 48.6]],
  torn: (f) => [["caesar", R[0] + 0.2, S.caesarBackZ(T(f)), 0.67], ["caesarW", R[0] - 5, R[2] - 41], ["hamL", R[0] - 2.8, R[2] - 38.4]],
  stall: () => [["shop", S.STALL[0], S.STALL[2] + 0.1], ["cit0", S.STALL[0] - 2.4, S.STALL[2] - 2.2], ["cit3", S.STALL[0] + 2.6, S.STALL[2] - 2.8]],
  branch: () => [["shop", S.BRANCH[0], S.BRANCH[2] + 0.1], ["tr0", S.BRANCH[0] - 4, S.BRANCH[2] - 3.5], ["tr5", S.BRANCH[0] + 4, S.BRANCH[2] - 4.7]],
  runner: (f) => [["runner", 0, S.runnerZ(T(f))]],
  parade: () => [["mid", 0, -201]],
  village: () => [["v1", VG[0] - 1.6, VG[2] - 0.4], ["v2", VG[0] + 0.2, VG[2] + 0.4], ["v3", VG[0] + 1.9, VG[2] - 0.3], ["v0", VG[0] - 3.2, VG[2] + 0.6], ["v4", VG[0] + 3.4, VG[2] + 0.8], ["kid", VG[0] - 0.8, VG[2] + 2.2], ["chief", VG[0] + 4.8, VG[2] - 2.2]],
  sons: () => [["son", VG[0] + 4.4, VG[2] - 8.5], ["pa", VG[0] + 2.4, VG[2] - 7], ["ma", VG[0] + 6.4, VG[2] - 6.7], ["roadson", S.RD2_X + 1.6, S.RD2_END + 3]],
  citizens: () => [["c0", -9, -4], ["c7", 7.8, -4], ["c16", -9, 0.4], ["leg", 0, 4.5]],
  milestone: () => [["stone top", 7, -7, 1.9], ["base", 7, -7, -1.65], ["c0", 4.8, -5.8], ["c1", 9.6, -5.2], ["c3", 8.6, -8.6], ["leg", 3.6, -6.4]],
  gate: (f) => [["walk0", -1, G - 30 + (T(f) - ws(33)) * 1.2], ["sit", -1.2, G - 3.2], ["leg", 0.4, G - 2.6], ["cit", -2.6, G - 1.8]],
  goths: (f) => [["guard", 2.6, G - 1], ["goth0", -1.8, S.gothZ(T(f))], ["goth3", 1.8, S.gothZ(T(f))]],
  guard: () => [["guard", 2.6, G - 1], ["goth0", 0, G - 11.5], ["g1", -0.8, G - 13.5]],
};
const proj = (c: any, p: number[]) => {
  const f = norm(sub(c.look, c.pos)), r0 = norm(cross(f, [0, 1, 0])), u0 = cross(r0, f);
  const cr = Math.cos(c.roll), sr = Math.sin(c.roll);
  const r = r0.map((v, i) => v * cr + u0[i] * sr), u = u0.map((v, i) => u0[i] * cr - r0[i] * sr);
  const d = sub(p, c.pos), z = dot(d, f), ty = Math.tan((c.fov * Math.PI) / 360), tx = ty * 9 / 16;
  return [dot(d, r) / z / tx, dot(d, u) / z / ty, z];
};
const sub = (a: number[], b: number[]) => a.map((v, i) => v - b[i]);
const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);
const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: number[]) => { const l = Math.hypot(...a); return a.map((v) => v / l); };
const only = process.argv[2]?.split(",");
for (const s of SHOTS) {
  if (only && !only.includes(s.name)) continue;
  const st = Number(process.argv[3] || 0); const fr = st ? Array.from({length: Math.ceil((s.b - s.a) / st)}, (_, i) => s.a + i * st).concat([s.b - 1]) : [s.a + 1, Math.round((s.a + s.b) / 2), s.b - 1];
  for (const f of fr) {
    const c = camAt(s.id, f);
    let line = `${s.id} ${s.name} f${f} pos[${c.pos.map((v: number) => v.toFixed(1))}] fov${c.fov.toFixed(0)}`;
    for (const [n, x, z, y = 0] of (pts[s.name]?.(f) ?? [])) {
      const h = proj(c, [x, y + 1.65, z]), ft = proj(c, [x, y, z]), top = proj(c, [x, y + 2.0, z]);
      line += ` | ${n}: x${h[0].toFixed(2)} head${h[1].toFixed(2)} feet${ft[1].toFixed(2)} top${top[1].toFixed(2)} d${h[2].toFixed(1)}`;
    }
    console.log(line);
  }
}
