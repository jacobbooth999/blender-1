// Style kit (exported) for the angular kraft-paper look. Originally style test v2 (after the user's Doberman reference): smooth, elongated cartoon anatomy with S-curves, one bold
// brush outline per silhouette, flat earthy colours with a cel shadow crescent on the far side and a cream rim light
// on the near side, tapered interior detail lines, heavy-lidded deadpan eyes, toe lines on paws/hooves, plain
// mottled kraft paper and a dry-brush floor shadow. Five vertical stills (t = 0..4).
export type P = [number, number];
export const LINE = "#16120f", CREAM = "#f6e8c8";
export const G_COAT = "#d9893a", G_SPOT = "#7f3f1c", G_LEG = "#efd6a4", G_HOOF = "#3b2418", G_MUZ = "#f0cf98";
export const L_COAT = "#c98a4a", L_BELLY = "#e8c389", L_MUZ = "#f2dcb2", L_DARK = "#4a2d1a";
export let seed = 1; export const setSeed = (v: number) => { seed = v; }; export const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
export const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** closed Catmull-Rom spline through the points (smooth organic outline) */
export const spline = (pts: P[], closed = true, k = 0.5) => {
  const p = new Path2D(), n = pts.length, at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  p.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    p.bezierCurveTo(p1[0] + ((p2[0] - p0[0]) * k) / 3, p1[1] + ((p2[1] - p0[1]) * k) / 3, p2[0] - ((p3[0] - p1[0]) * k) / 3, p2[1] - ((p3[1] - p1[1]) * k) / 3, p2[0], p2[1]);
  }
  if (closed) p.closePath(); return p;
};
/** outline of a centre line with per-point widths (limbs, necks, tails), as a closed point list */
export const ribbon = (pts: P[], ws: number[]): P[] => {
  const L: P[] = [], R: P[] = [];
  pts.forEach((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, w = ws[i] / 2;
    L.push([p[0] + nx * w, p[1] + ny * w]); R.push([p[0] - nx * w, p[1] - ny * w]); });
  return [...L, ...R.reverse()];
};
export const ell = (x: number, y: number, rx: number, ry: number, r = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, r, 0, Math.PI * 2); return p; };
const BIG = (() => { const p = new Path2D(); p.rect(-1e4, -1e4, 2e4, 2e4); return p; })();
export type Part = { path: Path2D; fill: string; shade?: boolean; deco?: () => void };
export const LIGHT: P = [-0.62, -0.78];
/** cel shadow crescent on the side away from the light + a thin cream rim on the lit side */
export const shade = (g: CanvasRenderingContext2D, path: Path2D, d: number, r: number, dark = "rgba(70,30,10,0.32)") => {
  const big = 1e5;
  g.save(); g.clip(path);
  const a = new Path2D(); a.rect(-big, -big, 2 * big, 2 * big); a.addPath(path, new DOMMatrix().translate(LIGHT[0] * d, LIGHT[1] * d)); g.save(); g.clip(a, "evenodd"); g.fillStyle = dark; g.fillRect(-big, -big, 2 * big, 2 * big); g.restore();
  const b = new Path2D(); b.rect(-big, -big, 2 * big, 2 * big); b.addPath(path, new DOMMatrix().translate(-LIGHT[0] * r, -LIGHT[1] * r)); g.clip(b, "evenodd"); g.fillStyle = "rgba(255,244,220,0.5)"; g.fillRect(-big, -big, 2 * big, 2 * big);
  g.restore();
};
/** stroke all parts thick then fill on top (one merged outline), then shade each part */
export const group = (g: CanvasRenderingContext2D, parts: Part[], lw: number, d: number, after?: () => void) => {
  g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = LINE; g.lineWidth = lw * 2;
  for (const p of parts) g.stroke(p.path);
  // painter's order: each part is filled, decorated and shaded before the next covers it
  for (const p of parts) { g.fillStyle = p.fill; g.fill(p.path); p.deco?.(); if (p.shade !== false) shade(g, p.path, d, d * 0.2); }
  after?.();
};
/** brush stroke that tapers at both ends */
export const taper = (g: CanvasRenderingContext2D, pts: P[], w: number, col = LINE) => {
  const n = pts.length, ws = pts.map((_, i) => w * Math.sin((Math.PI * (i + 0.6)) / (n + 0.2)));
  g.fillStyle = col; g.fill(spline(ribbon(pts, ws), true, 0.3));
};
/** reticulated coat: rounded cells from a jittered grid (Voronoi via half-plane clipping), clipped to a part */
export const coat = (g: CanvasRenderingContext2D, clip: Path2D, x0: number, y0: number, x1: number, y1: number, cell: number, gap: number, col = G_SPOT, sd = 3) => {
  seed = sd; const pts: P[] = [];
  for (let y = y0 - cell; y < y1 + cell; y += cell) for (let x = x0 - cell; x < x1 + cell; x += cell) pts.push([x + rnd() * cell * 0.8, y + rnd() * cell * 0.8]);
  g.save(); g.clip(clip); g.fillStyle = col;
  for (const p of pts) {
    if (p[0] < x0 - cell * 0.5 || p[0] > x1 + cell * 0.5 || p[1] < y0 - cell * 0.5 || p[1] > y1 + cell * 0.5) continue;
    let poly: P[] = [[p[0] - cell * 2, p[1] - cell * 2], [p[0] + cell * 2, p[1] - cell * 2], [p[0] + cell * 2, p[1] + cell * 2], [p[0] - cell * 2, p[1] + cell * 2]];
    for (const q of pts) {
      if (q === p || Math.abs(q[0] - p[0]) > cell * 2.5 || Math.abs(q[1] - p[1]) > cell * 2.5) continue;
      const m = lerp(p, q, 0.5), nx = q[0] - p[0], ny = q[1] - p[1], out: P[] = [];
      const side = (v: P) => (v[0] - m[0]) * nx + (v[1] - m[1]) * ny;
      for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length], sa = side(a), sb = side(b);
        if (sa <= 0) out.push(a); if (sa * sb < 0) out.push(lerp(a, b, sa / (sa - sb))); }
      poly = out;
    }
    const cx = poly.reduce((s, v) => s + v[0], 0) / poly.length, cy = poly.reduce((s, v) => s + v[1], 0) / poly.length;
    const shr = poly.map((v) => { const dx = v[0] - cx, dy = v[1] - cy, l = Math.hypot(dx, dy) || 1; return [v[0] - (dx / l) * gap, v[1] - (dy / l) * gap] as P; });
    g.fill(spline(shr, true, 0.35));
  }
  g.restore();
};

let NOW: number | undefined;
/** global clock for idle motion (breathing, sways, flicks); undefined = no idle */
export const setNow = (v?: number) => { NOW = v; };
/** occasional quick ear flick (0..1 pulse) */
export const flick = (t: number, period = 2.7, off = 0) => { const u = (((t + off) / period) % 1 + 1) % 1; return u < 0.08 ? Math.sin((u / 0.08) * Math.PI) : 0; };
const rotP = (p: P, o: P, a: number): P => { const c = Math.cos(a), s2 = Math.sin(a); return [o[0] + (p[0] - o[0]) * c - (p[1] - o[1]) * s2, o[1] + (p[0] - o[0]) * s2 + (p[1] - o[1]) * c]; };
export type Face = { lid?: number; brow?: number; look?: P; worried?: boolean };
/** deadpan cartoon eye with a heavy upper lid; brow tilt + for a frown, - for worry */
export const eye = (g: CanvasRenderingContext2D, c: P, r: number, f: Face, skin: string, lw: number, mirror = 1) => {
  g.save(); g.translate(c[0], c[1]); g.scale(mirror, 1);
  const e = ell(0, 0, r, r * 0.86); g.fillStyle = "#fffaf0"; g.fill(e);
  const lk = f.look ?? [0, 0]; g.fillStyle = LINE; g.beginPath(); g.ellipse(lk[0] * r * 0.45 * mirror, lk[1] * r * 0.42, r * 0.27, r * 0.3, 0, 0, Math.PI * 2); g.fill();
  const lid = f.lid ?? 0.5, ly = -r + 2 * r * lid * 0.8, tilt = (f.brow ?? 0.3) * r * 0.25;
  if (lid > 0) { g.save(); g.clip(e); g.fillStyle = skin; g.beginPath(); g.moveTo(-r * 1.3, -r * 1.3); g.lineTo(r * 1.3, -r * 1.3); g.lineTo(r * 1.3, ly + tilt); g.lineTo(-r * 1.3, ly - tilt); g.fill(); g.restore();
    taper(g, [[-r * 1.15, ly - tilt * 1.1], [0, ly - r * 0.04], [r * 1.15, ly + tilt * 1.1]], r * 0.26); }
  g.strokeStyle = LINE; g.lineWidth = lw * 0.75; g.stroke(e);
  const b = f.brow ?? 0.3; taper(g, [[-r * 1.1, -r * 1.35 - b * r * 0.35], [0, -r * 1.42], [r * 1.1, -r * 1.35 + b * r * 0.35]], r * 0.34);
  g.restore();
};

// ---------------- giraffe, front view (hook) ----------------
export const giraffeFront = (g: CanvasRenderingContext2D, cx: number, base: number, s: number, f: Face, t?: number) => {
  g.save(); g.translate(cx, base); g.scale(s, s); const lw = 3.6 / s, d = 9 / s;
  const tt = t ?? NOW, it = tt ?? 0, idle = tt === undefined ? 0 : 1, sway = idle * (0.035 * Math.sin(it * 1.2) + 0.012 * Math.sin(it * 2.9)), br = 1 + idle * 0.018 * Math.sin(it * 2.1);
  const X = (x: number, y: number): P => { const k = Math.max(0, Math.min(1, (-y - 1.25) / 1.5)); const yy = y > -1.4 && y < -0.8 ? -1.1 + (y + 1.1) * br : y; return [x * (y > -1.4 && y < -0.8 ? br : 1) + sway * k * k, yy - idle * 0.01 * Math.sin(it * 2.1) * k]; };
  // hind legs (behind, darker)
  const hind = [-1, 1].map((k) => spline(ribbon([X(k * 0.13, -0.98), X(k * 0.14, -0.7), X(k * 0.13, -0.42), X(k * 0.135, -0.2), X(k * 0.13, -0.02)], [0.12, 0.08, 0.07, 0.06, 0.06]), true));
  const hhoof = [-1, 1].map((k) => spline([X(k * 0.13 - 0.045, -0.06), X(k * 0.13 + 0.045, -0.06), X(k * 0.13 + 0.05, 0.005), X(k * 0.13 - 0.05, 0.005)], true, 0.2));
  group(g, [...hind.map((p) => ({ path: p, fill: "#d8b47d" })), ...hhoof.map((p) => ({ path: p, fill: G_HOOF, shade: false }))], lw, d);
  // chest + front legs + neck + head as one silhouette
  const chest = spline([X(-0.26, -1.0), X(-0.2, -1.24), X(-0.1, -1.36), X(0.1, -1.36), X(0.2, -1.24), X(0.26, -1.0), X(0.2, -0.86), X(0.0, -0.82), X(-0.2, -0.86)]);
  const legs = [-1, 1].map((k) => spline(ribbon([X(k * 0.12, -1.0), X(k * 0.125, -0.75), X(k * 0.11, -0.5), X(k * 0.115, -0.45), X(k * 0.105, -0.2), X(k * 0.11, -0.1), X(k * 0.105, -0.02)], [0.15, 0.1, 0.08, 0.095, 0.065, 0.075, 0.065]), true));
  const hoof = [-1, 1].map((k) => spline([X(k * 0.105 - 0.05, -0.065), X(k * 0.105 + 0.05, -0.065), X(k * 0.105 + 0.058, 0.008), X(k * 0.105 - 0.058, 0.008)], true, 0.2));
  const neck = spline([X(-0.15, -1.3), X(-0.09, -1.75), X(-0.065, -2.2), X(-0.075, -2.45), X(0.075, -2.45), X(0.065, -2.2), X(0.09, -1.75), X(0.15, -1.3)]);
  const head = spline([X(-0.16, -2.62), X(-0.12, -2.72), X(0.0, -2.75), X(0.12, -2.72), X(0.16, -2.62), X(0.13, -2.5), X(0.1, -2.38), X(0.085, -2.26), X(0.0, -2.22), X(-0.085, -2.26), X(-0.1, -2.38), X(-0.13, -2.5)]);
  const ears = [-1, 1].map((k) => { const fl = idle * flick(it, 2.6, k > 0 ? 0 : 1.3) * 0.06; return spline([X(k * 0.13, -2.64), X(k * 0.3, -2.72 - fl), X(k * 0.34, -2.66 - fl * 1.2), X(k * 0.15, -2.57)], true, 0.6); });
  const oss = [-1, 1].map((k) => spline(ribbon([X(k * 0.05, -2.72), X(k * 0.06, -2.82), X(k * 0.07, -2.9)], [0.04, 0.032, 0.03]), true));
  const knobs = [-1, 1].map((k) => ell(k * 0.07, -2.91, 0.034, 0.03));
  group(g, [...ears.map((p) => ({ path: p, fill: G_COAT, deco: () => { g.save(); g.clip(p); g.fillStyle = "#f2c9a0"; g.fill(ell(0, -2.66, 0.4, 0.02)); g.restore(); } })), ...oss.map((p) => ({ path: p, fill: G_COAT })), ...knobs.map((p) => ({ path: p, fill: G_HOOF, shade: false })),
    ...legs.map((p) => ({ path: p, fill: G_LEG, deco: () => coat(g, p, -0.25, -1.0, 0.25, -0.62, 0.065, 0.01, G_SPOT, 6) })), ...hoof.map((p) => ({ path: p, fill: G_HOOF, shade: false })),
    { path: neck, fill: G_COAT, deco: () => coat(g, neck, -0.2, -2.5, 0.2, -1.25, 0.075, 0.009, G_SPOT, 4) },
    { path: chest, fill: G_COAT, deco: () => coat(g, chest, -0.3, -1.4, 0.3, -0.8, 0.12, 0.013, G_SPOT, 5) },
    { path: head, fill: G_COAT, deco: () => { g.save(); g.clip(head); g.fillStyle = G_MUZ; g.fill(spline([X(-0.09, -2.42), X(0.09, -2.42), X(0.1, -2.3), X(0.0, -2.2), X(-0.1, -2.3)])); g.restore(); } }], lw, d);
  // face details
  eye(g, X(-0.065, -2.56), 0.045, f, G_COAT, lw, -1); eye(g, X(0.065, -2.56), 0.045, f, G_COAT, lw, 1);
  for (const k of [-1, 1]) { g.fillStyle = LINE; g.fill(ell(k * 0.04, -2.31, 0.018, 0.011, k * 0.4)); }
  taper(g, [X(-0.045, -2.255), X(0, -2.245), X(0.045, -2.255)], 0.008);
  for (const k of [-1, 1]) for (let i = 0; i < 3; i++) { g.fillStyle = "rgba(22,18,15,0.6)"; g.fill(ell(k * (0.055 + i * 0.012), -2.36 + i * 0.008, 0.004, 0.004)); }
  taper(g, [X(-0.03, -2.0), X(-0.02, -1.95), X(-0.03, -1.9)], 0.006); taper(g, [X(0.0, -1.06), X(0.01, -1.0)], 0.008);
  // toe split lines on hooves
  for (const k of [-1, 1]) taper(g, [X(k * 0.105, -0.06), X(k * 0.105, 0.0)], 0.01, "#7a5a40");
  g.restore();
};

// ---------------- giraffe, side view ----------------
export type GPose = { neckAng?: number; neckLen?: number; headAng?: number; feet?: Partial<Record<"fn" | "ff" | "hn" | "hf", P>>; bends?: Partial<Record<"fn" | "ff" | "hn" | "hf", number>>; face?: Face; tilt?: number; t?: number };
export const limb = (hip: P, foot: P, bend: number, w: number) => {
  const m = lerp(hip, foot, 0.5), dx = foot[0] - hip[0], dy = foot[1] - hip[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  const knee: P = [m[0] + nx * bend, m[1] + ny * bend], fet = lerp(knee, foot, 0.82);
  return { pts: ribbon([hip, lerp(hip, knee, 0.45), lerp(hip, knee, 0.85), knee, lerp(knee, foot, 0.4), fet, foot], [w, w * 0.78, w * 0.62, w * 0.72, w * 0.5, w * 0.58, w * 0.5]), knee };
};
export const giraffeSide = (g: CanvasRenderingContext2D, x: number, y: number, s: number, o: GPose = {}, flip = false) => {
  g.save(); g.translate(x, y); g.scale(flip ? -s : s, s); g.rotate(o.tilt ?? 0); const lw = 3.6 / s, d = 8 / s;
  const hips: Record<string, P> = { fn: [0.4, -0.86], ff: [0.28, -0.86], hn: [-0.42, -0.84], hf: [-0.52, -0.84] };
  const feet: Record<string, P> = { fn: [0.44, 0], ff: [0.22, 0], hn: [-0.38, 0], hf: [-0.58, 0], ...o.feet };
  const bends: Record<string, number> = { fn: -0.025, ff: -0.025, hn: 0.05, hf: 0.05, ...o.bends };
  const L = Object.fromEntries(Object.keys(hips).map((k) => [k, limb(hips[k], feet[k], bends[k], 0.13)]));
  const hoof = (k: string) => { const f = feet[k], kn = L[k].knee, a = Math.atan2(f[1] - kn[1], f[0] - kn[0]) - Math.PI / 2, c = Math.cos(a), sn = Math.sin(a), R = (p: P): P => [f[0] + p[0] * c - p[1] * sn, f[1] + p[0] * sn + p[1] * c];
    return spline([R([-0.035, -0.055]), R([0.035, -0.055]), R([0.05, 0.005]), R([-0.045, 0.005])], true, 0.2); };
  group(g, [...["ff", "hf"].map((k) => ({ path: spline(L[k].pts), fill: "#d4a66c" })), ...["ff", "hf"].map((k) => ({ path: hoof(k), fill: G_HOOF, shade: false }))], lw, d);
  const tt = o.t ?? NOW, it = tt ?? 0, idle = tt === undefined ? 0 : 1, br = 1 + idle * 0.02 * Math.sin(it * 2.1);
  const body = spline(([[-0.64, -0.86], [-0.6, -1.0], [-0.42, -1.07], [0.0, -1.14], [0.3, -1.24], [0.5, -1.22], [0.6, -1.06], [0.58, -0.9], [0.46, -0.78], [0.2, -0.74], [-0.1, -0.72], [-0.42, -0.74], [-0.6, -0.78]] as P[]).map(([a, b]) => [a, -0.98 + (b + 0.98) * br] as P));
  const na = (o.neckAng ?? -1.2) + idle * (0.025 * Math.sin(it * 1.25) + 0.01 * Math.sin(it * 3.1)), nl = o.neckLen ?? 1.05, nb: P = [0.45, -1.06], nt: P = [nb[0] + Math.cos(na) * nl, nb[1] + Math.sin(na) * nl];
  const bow: P = [-Math.sin(na) * 0.04, Math.cos(na) * 0.04];
  const neckPts = ribbon([nb, [lerp(nb, nt, 0.35)[0] + bow[0], lerp(nb, nt, 0.35)[1] + bow[1]], [lerp(nb, nt, 0.7)[0] + bow[0], lerp(nb, nt, 0.7)[1] + bow[1]], nt], [0.36, 0.2, 0.14, 0.12]);
  const neck = spline(neckPts);
  const ha = (o.headAng ?? 0.15) + idle * 0.05 * Math.sin(it * 1.7 + 1), c = Math.cos(ha), sn = Math.sin(ha), H = (p: P): P => [nt[0] + p[0] * c - p[1] * sn, nt[1] + p[0] * sn + p[1] * c];
  const head = spline([[-0.09, -0.07], [0.0, -0.1], [0.12, -0.095], [0.24, -0.06], [0.33, -0.02], [0.35, 0.04], [0.31, 0.085], [0.18, 0.08], [0.05, 0.075], [-0.06, 0.06], [-0.1, 0.0]].map((p) => H(p as P)));
  const muz = spline([[0.18, -0.07], [0.28, -0.045], [0.35, 0.02], [0.32, 0.085], [0.17, 0.08], [0.14, 0.0]].map((p) => H(p as P)));
  const efl = idle * flick(it, 2.9, 0.7) * 0.5; const ear = spline(([[-0.05, -0.06], [-0.2, -0.1], [-0.27, -0.06], [-0.07, -0.01]] as P[]).map((p) => H(rotP(p, [-0.06, -0.03], efl))), true, 0.6);
  const oss = [[-0.03, -0.085], [0.03, -0.095]].map(([ox, oy]) => spline(ribbon([H([ox, oy]), H([ox - 0.015, oy - 0.07]), H([ox - 0.025, oy - 0.12])], [0.04, 0.03, 0.03])));
  const knobs = [[-0.03, -0.085], [0.03, -0.095]].map(([ox, oy]) => { const k = H([ox - 0.027, oy - 0.125]); return ell(k[0], k[1], 0.032, 0.028); });
  const tsw = idle * (0.22 * Math.sin(it * 2.3) + 0.08 * Math.sin(it * 5.1)), TB: P = [-0.6, -0.96], TR = (p: P) => rotP(p, TB, tsw * (Math.hypot(p[0] - TB[0], p[1] - TB[1]) / 0.4));
  const tail = spline(ribbon(([[-0.6, -0.96], [-0.67, -0.82], [-0.7, -0.66], [-0.7, -0.55]] as P[]).map(TR), [0.04, 0.035, 0.03, 0.028]));
  const tuft = spline(([[-0.73, -0.6], [-0.66, -0.6], [-0.64, -0.5], [-0.68, -0.42], [-0.73, -0.47], [-0.75, -0.54]] as P[]).map(TR));
  const near = ["fn", "hn"];
  group(g, [{ path: tail, fill: G_COAT }, { path: tuft, fill: G_HOOF, shade: false }, ...near.map((k) => { const lp = spline(L[k].pts), hp = hips[k], kn = L[k].knee, la = Math.atan2(kn[1] - hp[1], kn[0] - hp[0]); return { path: lp, fill: G_LEG, deco: () => { g.save(); g.clip(lp); g.translate(hp[0], hp[1]); g.rotate(la); coat(g, BIG, -0.1, -0.1, 0.3, 0.1, 0.06, 0.01, G_SPOT, 13); g.restore(); } }; }), ...near.map((k) => ({ path: hoof(k), fill: G_HOOF, shade: false })),
    { path: neck, fill: G_COAT, deco: () => { g.save(); g.clip(neck); g.translate(nb[0], nb[1]); g.rotate(na); coat(g, BIG, -0.3, -0.3, nl + 0.15, 0.3, 0.07, 0.01, G_SPOT, 12); g.restore(); } },
    { path: body, fill: G_COAT, deco: () => { g.save(); g.clip(body); g.fillStyle = "#ebc790"; g.fill(spline([[-0.5, -0.8], [0.0, -0.84], [0.5, -0.86], [0.5, -0.6], [-0.5, -0.6]])); g.restore(); coat(g, body, -0.66, -1.26, 0.62, -0.8, 0.1, 0.014, G_SPOT, 11); } },
    ...oss.map((p) => ({ path: p, fill: G_COAT })), ...knobs.map((p) => ({ path: p, fill: G_HOOF, shade: false })), { path: ear, fill: G_COAT },
    { path: head, fill: G_COAT, deco: () => { g.save(); g.clip(head); g.translate(nt[0], nt[1]); g.rotate(ha); coat(g, BIG, -0.15, -0.15, 0.15, 0.1, 0.06, 0.009, G_SPOT, 14); g.restore(); g.save(); g.clip(head); g.fillStyle = G_MUZ; g.fill(muz); g.restore(); } }], lw, d);
  // mane along the back of the neck
  const back = neckPts.slice(4).reverse();
  for (let i = 1; i < 14; i++) { const t = i / 14, seg = t * 3, j = Math.min(2, Math.floor(seg)), a = lerp(back[j], back[j + 1], seg - j), fr = neckPts[Math.min(3, j + 1)];
    const q = lerp(a, fr, 0.13); taper(g, [lerp(a, q, -0.4), a, q], 0.022, "#5a2f17"); }
  const f = o.face ?? {}; eye(g, H([0.06, -0.025]), 0.05, f, G_COAT, lw);
  const ns = H([0.3, 0.0]); g.fillStyle = LINE; g.fill(ell(ns[0], ns[1], 0.02, 0.012, ha + 0.3));
  taper(g, [H([0.2, 0.06]), H([0.26, 0.068]), H([0.31, 0.06])], 0.009);
  taper(g, [H([0.1, 0.02]), H([0.13, 0.04])], 0.006);
  for (const k of ["fn", "hn"]) { const p = L[k].knee; taper(g, [[p[0] - 0.02, p[1] - 0.01], [p[0] + 0.02, p[1] + 0.005]], 0.007, "rgba(22,18,15,0.7)"); }
  g.restore();
};

// ---------------- lioness ----------------
export type LPose = "sit" | "crouch" | "fly" | "walk" | "run";
export const lioness = (g: CanvasRenderingContext2D, x: number, y: number, s: number, pose: LPose, f: Face, flip = false, tilt = 0, ph = 0, t?: number) => {
  g.save(); g.translate(x, y); g.scale(flip ? -s : s, s); g.rotate(tilt); const lw = 3.6 / s, d = 7 / s;
  let body: P[], legs: P[][], paws: Path2D[], headC: P, headTilt: number, tailP: P[], haunch: Path2D | null = null, farLegs: P[][] = [];
  if (pose === "sit") {
    body = [[-0.32, -0.02], [-0.42, -0.2], [-0.36, -0.42], [-0.18, -0.6], [0.02, -0.78], [0.14, -0.86], [0.24, -0.76], [0.25, -0.5], [0.2, -0.25], [0.1, -0.04]];
    legs = [ribbon([[0.16, -0.5], [0.17, -0.25], [0.16, -0.03]], [0.13, 0.09, 0.09])]; farLegs = [ribbon([[0.06, -0.5], [0.06, -0.25], [0.05, -0.03]], [0.12, 0.08, 0.08])];
    paws = [ell(0.2, -0.03, 0.08, 0.04), ell(-0.12, -0.03, 0.12, 0.045)]; haunch = ell(-0.2, -0.22, 0.22, 0.22);
    headC = [0.2, -0.98]; headTilt = -0.35; tailP = [[-0.36, -0.06], [-0.58, -0.02], [-0.72, -0.1], [-0.76, -0.2]];
  } else if (pose === "crouch") {
    body = [[-0.7, -0.14], [-0.72, -0.3], [-0.55, -0.42], [-0.1, -0.44], [0.3, -0.46], [0.5, -0.38], [0.52, -0.22], [0.42, -0.12], [-0.4, -0.1]];
    legs = [ribbon([[0.38, -0.25], [0.5, -0.12], [0.66, -0.03]], [0.13, 0.09, 0.08]), ribbon([[-0.5, -0.25], [-0.36, -0.12], [-0.3, -0.03]], [0.15, 0.1, 0.08])];
    farLegs = [ribbon([[0.28, -0.25], [0.4, -0.12], [0.54, -0.03]], [0.12, 0.08, 0.07]), ribbon([[-0.6, -0.25], [-0.48, -0.12], [-0.42, -0.03]], [0.13, 0.09, 0.07])];
    paws = [ell(0.7, -0.03, 0.08, 0.035), ell(-0.26, -0.03, 0.08, 0.035)]; headC = [0.64, -0.38]; headTilt = 0.05; tailP = [[-0.68, -0.32], [-0.95, -0.26], [-1.1, -0.14], [-1.15, -0.04]];
  } else if (pose === "walk" || pose === "run") {
    const run = pose === "run", bob = Math.abs(Math.sin(ph)) * (run ? 0.05 : 0.015), A = run ? 0.32 : 0.16, lift = run ? 0.16 : 0.07;
    body = ([[-0.68, -0.46], [-0.7, -0.62], [-0.52, -0.72], [-0.1, -0.74], [0.3, -0.78], [0.52, -0.68], [0.54, -0.52], [0.44, -0.44], [-0.4, -0.42]] as P[]).map(([a, b]) => [a, b - bob] as P);
    const ft = (hx: number, u: number): P => [hx - A * Math.cos(u), -Math.max(0, Math.sin(u)) * lift];
    const lg = (h: P, u: number, front: boolean, w: number) => { const f = ft(h[0], u), m = lerp(h, f, 0.5); return { r: ribbon([h, [m[0] + (front ? -0.03 : 0.05), m[1]], f], [w, w * 0.7, w * 0.6]), f }; };
    const ph2 = run ? [0, 0.7, Math.PI, Math.PI + 0.7] : [0, Math.PI, Math.PI, 0];
    const nf = lg([0.38, -0.56 - bob], ph + ph2[0], true, 0.14), ff = lg([0.26, -0.56 - bob], ph + ph2[1], true, 0.13), nh = lg([-0.5, -0.56 - bob], ph + ph2[2], false, 0.16), fh = lg([-0.6, -0.56 - bob], ph + ph2[3], false, 0.14);
    legs = [nf.r, nh.r]; farLegs = [ff.r, fh.r];
    paws = [ell(nf.f[0] + 0.03, nf.f[1] - 0.03, 0.075, 0.035), ell(nh.f[0] + 0.03, nh.f[1] - 0.03, 0.075, 0.035)];
    headC = [0.66, -0.8 - bob]; headTilt = run ? 0.15 : 0.05;
    tailP = run ? [[-0.66, -0.62 - bob], [-0.95, -0.66 - bob], [-1.2, -0.66 - bob], [-1.32, -0.6 - bob]] : [[-0.66, -0.6], [-0.92, -0.56], [-1.08, -0.42], [-1.12, -0.3]];
  } else {
    body = [[-0.62, -0.46], [-0.6, -0.66], [-0.4, -0.74], [0.1, -0.76], [0.38, -0.8], [0.56, -0.66], [0.5, -0.48], [-0.4, -0.42]];
    legs = [ribbon([[0.36, -0.55], [0.55, -0.62], [0.75, -0.78]], [0.13, 0.09, 0.08]), ribbon([[-0.45, -0.52], [-0.7, -0.36], [-0.88, -0.24]], [0.15, 0.1, 0.08])];
    farLegs = [ribbon([[0.26, -0.55], [0.48, -0.48], [0.66, -0.5]], [0.12, 0.08, 0.07]), ribbon([[-0.55, -0.52], [-0.78, -0.5], [-0.95, -0.44]], [0.13, 0.09, 0.07])];
    paws = [ell(0.78, -0.8, 0.07, 0.04, -0.6), ell(-0.92, -0.22, 0.07, 0.04, 0.5)]; headC = [0.64, -0.84]; headTilt = -0.2; tailP = [[-0.6, -0.62], [-0.85, -0.72], [-1.0, -0.92], [-0.98, -1.04]];
  }
  group(g, farLegs.map((p) => ({ path: spline(p), fill: "#a8743f" })), lw, d);
  const tt = t ?? NOW, it = tt ?? 0, idle = tt === undefined ? 0 : 1; headC = [headC[0], headC[1] + idle * 0.008 * Math.sin(it * 2.3)]; headTilt += idle * 0.04 * Math.sin(it * 1.4);
  const [hx, hy] = headC, c = Math.cos(headTilt), sn = Math.sin(headTilt), Hh = (p: P): P => [hx + p[0] * c - p[1] * sn, hy + p[0] * sn + p[1] * c];
  const head = spline([[-0.17, -0.06], [-0.1, -0.15], [0.05, -0.17], [0.16, -0.1], [0.3, -0.05], [0.33, 0.04], [0.27, 0.13], [0.1, 0.16], [-0.08, 0.13], [-0.18, 0.05]].map((p) => Hh(p as P)));
  const lfl = idle * flick(it, 2.2, 0.4) * 0.6; const ear = spline(([[-0.12, -0.11], [-0.11, -0.25], [-0.02, -0.25], [0.02, -0.14]] as P[]).map((p) => Hh(rotP(p, [-0.06, -0.12], -lfl))), true, 0.7);
  const muz = spline([[0.08, 0.0], [0.2, -0.04], [0.33, 0.03], [0.28, 0.13], [0.1, 0.15]].map((p) => Hh(p as P)));
  if (idle) { const b0 = tailP[0], sw = 0.25 * Math.sin(it * 2.6) + 0.1 * Math.sin(it * 6.3); tailP = tailP.map((p, i) => rotP(p, b0, sw * (i / (tailP.length - 1)))); }
  const tail = spline(ribbon(tailP, [0.05, 0.045, 0.04, 0.035]));
  const te = tailP[tailP.length - 1], tuft = spline([[te[0] - 0.05, te[1] + 0.02], [te[0] + 0.04, te[1] + 0.0], [te[0] + 0.03, te[1] - 0.09], [te[0] - 0.03, te[1] - 0.11]]);
  const bodyP = spline(body);
  group(g, [{ path: tail, fill: L_COAT }, { path: tuft, fill: L_DARK, shade: false }, ...legs.map((p) => ({ path: spline(p), fill: L_COAT })), ...(haunch ? [{ path: haunch, fill: L_COAT }] : []),
    { path: bodyP, fill: L_COAT, deco: () => { g.save(); g.clip(bodyP); g.fillStyle = L_BELLY; const by = Math.max(...body.map((p) => p[1])); g.fill(ell(0.05, by + 0.02, 0.6, 0.1)); if (pose === "sit") g.fill(ell(0.2, -0.55, 0.07, 0.25)); g.restore(); } },
    ...paws.map((p) => ({ path: p, fill: L_BELLY })),
    { path: ear, fill: L_COAT, deco: () => { g.save(); g.clip(ear); g.fillStyle = L_DARK; g.fill(ell(Hh([-0.06, -0.22])[0], Hh([-0.06, -0.22])[1], 0.06, 0.05)); g.restore(); } },
    { path: head, fill: L_COAT, deco: () => { g.save(); g.clip(head); g.fillStyle = L_MUZ; g.fill(muz); g.restore(); } }], lw, d);
  const nose = Hh([0.31, 0.01]); g.fillStyle = "#3a2218"; g.fill(spline([[nose[0] - 0.035, nose[1] - 0.02], [nose[0] + 0.02, nose[1] - 0.025], [nose[0] + 0.015, nose[1] + 0.02]], true, 0.4));
  if (f.worried) { const m = Hh([0.22, 0.11]); g.fillStyle = "#5a2418"; g.fill(ell(m[0], m[1], 0.035, 0.028, headTilt)); g.strokeStyle = LINE; g.lineWidth = lw * 0.6; g.stroke(ell(m[0], m[1], 0.035, 0.028, headTilt)); }
  else taper(g, [Hh([0.14, 0.11]), Hh([0.22, 0.125]), Hh([0.29, 0.11])], 0.012);
  for (let i = 0; i < 3; i++) { const w = Hh([0.2 + i * 0.03, 0.05 + (i % 2) * 0.015]); g.fillStyle = "rgba(22,18,15,0.6)"; g.fill(ell(w[0], w[1], 0.006, 0.006)); }
  eye(g, Hh([0.05, -0.05]), 0.055, f, L_COAT, lw);
  // toe lines
  for (const p of paws) { g.save(); g.clip(p); g.restore(); }
  g.restore();
};

// ---------------- world ----------------
export const paper = (g: CanvasRenderingContext2D, hor: number) => {
  const gr = g.createLinearGradient(0, 0, 0, 1920); gr.addColorStop(0, "#cdb48c"); gr.addColorStop(1, "#c3a87e"); g.fillStyle = gr; g.fillRect(0, 0, 1080, 1920);
  seed = 5; for (let i = 0; i < 160; i++) { g.fillStyle = rnd() < 0.5 ? "rgba(255,246,222,0.025)" : "rgba(110,80,40,0.02)"; g.fill(ell(rnd() * 1080, rnd() * 1920, 40 + rnd() * 160, 30 + rnd() * 120, rnd() * 3)); }
  for (let i = 0; i < 3000; i++) { g.fillStyle = rnd() < 0.5 ? "rgba(255,246,222,0.09)" : "rgba(80,55,25,0.07)"; g.fillRect(rnd() * 1080, rnd() * 1920, 1 + rnd() * 2, 1 + rnd() * 2); }
  if (hor > 0) taper(g, [[-20, hor], [540, hor + 2], [1100, hor]], 4, "rgba(22,18,15,0.35)");
};
/** dry-brush floor shadow: horizontal streaks, a soft dark core and specks */
export const floor = (g: CanvasRenderingContext2D, cx: number, y: number, w: number, sd?: number) => {
  seed = sd ?? Math.round(cx * 3 + y);
  g.fillStyle = "rgba(60,40,20,0.18)"; g.fill(ell(cx, y + 4, w * 0.42, 16));
  for (let i = 0; i < 90; i++) { const x = cx - w / 2 + rnd() * w, yy = y - 8 + rnd() * 34, l = 20 + rnd() * 110, light = rnd() < 0.6;
    taper(g, [[x, yy], [x + l * 0.5, yy + (rnd() - 0.5) * 3], [x + l, yy + (rnd() - 0.5) * 4]], 2 + rnd() * 4, light ? "rgba(245,232,205,0.8)" : "rgba(22,18,15,0.75)"); }
  for (let i = 0; i < 70; i++) { g.fillStyle = rnd() < 0.6 ? "rgba(245,232,205,0.85)" : "rgba(22,18,15,0.6)"; g.fill(ell(cx - w / 2 + rnd() * w, y + rnd() * 40, 1.5 + rnd() * 3, 1 + rnd() * 2)); }
};
export const tree = (g: CanvasRenderingContext2D, x: number, y: number, s: number) => {
  const trunk = spline(ribbon([[x, y], [x + 0.06 * s, y - 0.45 * s], [x - 0.02 * s, y - 0.85 * s]], [0.11 * s, 0.07 * s, 0.06 * s]));
  const can = spline([[x - 1.0 * s, y - 0.9 * s], [x - 0.5 * s, y - 1.1 * s], [x + 0.3 * s, y - 1.14 * s], [x + 1.0 * s, y - 0.98 * s], [x + 0.6 * s, y - 0.86 * s], [x - 0.6 * s, y - 0.84 * s]]);
  group(g, [{ path: trunk, fill: "#7d5a3a" }, { path: can, fill: "#8d8f52" }], 2.4, 5);
};
export const caption = (g: CanvasRenderingContext2D, words: string[], hi: number) => {
  const size = 118; g.font = `${size}px "Bangers"`; g.textBaseline = "middle"; g.lineJoin = "round";
  const sp = size * 0.28, ws = words.map((w) => g.measureText(w).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  let x = 540 - tot / 2;
  words.forEach((w, i) => { g.save(); g.translate(x + ws[i] / 2, 1640); g.textAlign = "center"; const sc = i === hi ? 1.08 : 1; g.scale(sc, sc);
    g.lineWidth = size * 0.2; g.strokeStyle = LINE; g.strokeText(w, 0, 0); g.fillStyle = i === hi ? "#ffd33d" : "#fbf3e2"; g.fillText(w, 0, 0); g.restore(); x += ws[i] + sp; });
};
export const burst = (g: CanvasRenderingContext2D, x: number, y: number, r: number) => { const pts: P[] = []; for (let i = 0; i < 22; i++) { const a = (i / 22) * Math.PI * 2, rr = i % 2 ? r * 0.55 : r * (0.85 + (i % 4) * 0.08); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } group(g, [{ path: spline(pts, true, 0.1), fill: "#f2c23c" }], 3.6, 6); };
export const star = (g: CanvasRenderingContext2D, x: number, y: number, r: number) => { const pts: P[] = []; for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } group(g, [{ path: spline(pts, true, 0.1), fill: "#f8ecbf", shade: false }], 2.6, 0); };

