// Style test: an angular, mid-century "UPA-style" cartoon look (after a user reference): stretched geometric
// proportions, bold black outlines that merge into one silhouette, flat earthy colours, cream rim-light slivers,
// heavy-lidded deadpan eyes, a plain kraft-paper background and dry-brush scratches on the ground.
// Five vertical stills, one per integer t: node scripts/ink-video.mjs <this> <out> 30 1080 1920 --stills 0,1,2,3,4
type P = [number, number];
const LINE = "#191512", PAPER = "#c9b28a", PAPER2 = "#bfa67c", GROUND = "#b0956a", CREAM = "#f2e4c6";
const G_COAT = "#d68a3c", G_SPOT = "#8a4a22", G_LEG = "#ecd3a1", G_DARK = "#4a2a18";
const L_COAT = "#c98a4b", L_BELLY = "#e4bb7e", L_MUZ = "#efd7ad";
let seed = 1; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

/** polygon through a stroke-like centre line with per-point widths (legs, necks, tails) */
const ribbon = (pts: P[], ws: number[]): P[] => {
  const L: P[] = [], R: P[] = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l, ny = dx / l, w = ws[i] / 2; L.push([p[0] + nx * w, p[1] + ny * w]); R.push([p[0] - nx * w, p[1] - ny * w]);
  });
  return [...L, ...R.reverse()];
};
const pathOf = (pts: P[], round = 0) => {
  const p = new Path2D();
  if (!round) { pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); p.closePath(); return p; }
  const n = pts.length, mid = (a: P, b: P): P => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const s = mid(pts[n - 1], pts[0]); p.moveTo(s[0], s[1]);
  for (let i = 0; i < n; i++) { const c = pts[i], nx = pts[(i + 1) % n], m = mid(c, nx); p.arcTo(c[0], c[1], m[0], m[1], round); }
  p.closePath(); return p;
};
type Part = { path: Path2D; fill: string };
/** stroke every part thick, then fill every part on top: one merged silhouette outline */
const group = (g: CanvasRenderingContext2D, parts: Part[], lw: number) => {
  g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = LINE; g.lineWidth = lw * 2;
  for (const p of parts) g.stroke(p.path);
  for (const p of parts) { g.fillStyle = p.fill; g.fill(p.path); }
};
const stroke = (g: CanvasRenderingContext2D, pts: P[], w: number, col = LINE) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); };
const rot = (p: P, o: P, a: number): P => { const c = Math.cos(a), s = Math.sin(a); return [o[0] + p[0] * c - p[1] * s, o[1] + p[0] * s + p[1] * c]; };
const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const leg = (hip: P, foot: P, bend: number, w1: number, w2: number): { poly: P[]; knee: P } => {
  const m = lerp(hip, foot, 0.5), dx = foot[0] - hip[0], dy = foot[1] - hip[1], l = Math.hypot(dx, dy);
  const knee: P = [m[0] - (dy / l) * bend, m[1] + (dx / l) * bend];
  return { poly: ribbon([hip, lerp(hip, knee, 0.5), knee, lerp(knee, foot, 0.55), foot], [w1, w1 * 0.8, w1 * 0.85, w2 * 1.05, w2]), knee };
};

type Face = { lid?: number; brow?: number; look?: P; mouth?: "flat" | "frown" | "o" | "smirk"; sweat?: boolean };
/** deadpan cartoon eye: white oval, small pupil, heavy upper lid in skin colour, thick brow */
const eye = (g: CanvasRenderingContext2D, c: P, r: number, f: Face, skin: string, lw: number, ang = 0) => {
  g.save(); g.translate(c[0], c[1]); g.rotate(ang);
  const e = new Path2D(); e.ellipse(0, 0, r, r * 0.82, 0, 0, Math.PI * 2);
  g.fillStyle = "#fbf6ea"; g.fill(e);
  const lk = f.look ?? [0.2, 0.1]; g.fillStyle = LINE; g.beginPath(); g.arc(lk[0] * r * 0.45, lk[1] * r * 0.4, r * (f.lid === 0 ? 0.3 : 0.24), 0, Math.PI * 2); g.fill();
  const lid = f.lid ?? 0.45;
  if (lid > 0) { g.save(); g.clip(e); g.fillStyle = skin; g.fillRect(-r * 1.2, -r * 1.2, r * 2.4, r * 2.4 * lid * 0.5 + r * 0.02); g.restore(); stroke(g, [[-r * 1.05, -r * 1.2 + r * 2.4 * lid * 0.5], [r * 1.05, -r * 1.2 + r * 2.4 * lid * 0.5 - (f.brow ?? 0) * r * 0.2]], lw * 0.9); }
  g.strokeStyle = LINE; g.lineWidth = lw * 0.8; g.stroke(e);
  const b = f.brow ?? 0.3; stroke(g, [[-r * 1.0, -r * 1.25 - b * r * 0.35], [r * 1.0, -r * 1.25 + b * r * 0.35]], lw * 1.3);
  g.restore();
};

// ---------------- giraffe ----------------
type GPose = { neckAng?: number; neckLen?: number; headAng?: number; feet?: Partial<Record<"fn" | "ff" | "hn" | "hf", P>>; bends?: Partial<Record<"fn" | "ff" | "hn" | "hf", number>>; face?: Face; tilt?: number };
const giraffe = (g: CanvasRenderingContext2D, x: number, y: number, s: number, o: GPose = {}, flip = false) => {
  g.save(); g.translate(x, y); g.scale(flip ? -s : s, s); g.rotate(o.tilt ?? 0);
  const lw = 4.2 / s; seed = 17;
  const hips: Record<string, P> = { fn: [0.36, -0.82], ff: [0.24, -0.82], hn: [-0.4, -0.8], hf: [-0.5, -0.8] };
  const feet: Record<string, P> = { fn: [0.42, 0], ff: [0.2, 0], hn: [-0.38, 0], hf: [-0.56, 0], ...o.feet };
  const bends: Record<string, number> = { fn: -0.02, ff: -0.02, hn: 0.05, hf: 0.05, ...o.bends };
  const legs = Object.fromEntries(Object.keys(hips).map((k) => [k, leg(hips[k], feet[k], bends[k], 0.11, 0.06)]));
  const hoof = (k: string): P[] => { const f = feet[k], kn = legs[k].knee, a = Math.atan2(f[1] - kn[1], f[0] - kn[0]) - Math.PI / 2; return [rot([-0.04, -0.05], f, a), rot([0.04, -0.05], f, a), rot([0.045, 0.005], f, a), rot([-0.045, 0.005], f, a)]; };
  // far legs (darker, separate silhouette behind)
  group(g, [...["ff", "hf"].map((k) => ({ path: pathOf(legs[k].poly), fill: "#c7955c" })), ...["ff", "hf"].map((k) => ({ path: pathOf(hoof(k)), fill: G_DARK }))], lw);
  // body, neck, near legs, tail, head as one silhouette
  const body: P[] = [[-0.6, -0.84], [-0.5, -1.0], [0.1, -1.16], [0.42, -1.2], [0.55, -1.02], [0.5, -0.78], [0.3, -0.7], [-0.45, -0.7], [-0.62, -0.74]];
  const na = o.neckAng ?? -1.2, nl = o.neckLen ?? 1.05, nb: P = [0.42, -1.05], nt: P = [nb[0] + Math.cos(na) * nl, nb[1] + Math.sin(na) * nl];
  const nm: P = lerp(nb, nt, 0.5), neck = ribbon([nb, nm, nt], [0.32, 0.17, 0.11]);
  const ha = o.headAng ?? 0.15, H = (p: P) => rot(p, nt, ha);
  const head: P[] = [[-0.07, -0.08], [0.1, -0.1], [0.27, -0.06], [0.33, 0.0], [0.32, 0.07], [0.12, 0.08], [-0.05, 0.07], [-0.1, 0.0]].map((p) => H(p as P));
  const muzzle: P[] = [[0.17, -0.07], [0.27, -0.06], [0.33, 0.0], [0.32, 0.07], [0.15, 0.08]].map((p) => H(p as P));
  const ear: P[] = [[-0.04, -0.06], [-0.22, -0.06], [-0.25, -0.02], [-0.06, 0.0]].map((p) => H(p as P));
  const oss = [[-0.02, -0.09], [0.04, -0.1]].map(([ox, oy]) => ribbon([H([ox, oy]), H([ox - 0.02, oy - 0.1])], [0.035, 0.03]));
  const knob = (p: P) => { const q = new Path2D(); q.arc(p[0], p[1], 0.03, 0, Math.PI * 2); return q; };
  const tail = ribbon([[-0.58, -0.94], [-0.66, -0.75], [-0.68, -0.55]], [0.035, 0.03, 0.025]);
  const tuft: P[] = [[-0.71, -0.58], [-0.64, -0.58], [-0.62, -0.46], [-0.68, -0.4], [-0.74, -0.47]];
  const near = ["fn", "hn"];
  const bodyP = pathOf(body, 0.06), neckP = pathOf(neck);
  group(g, [{ path: pathOf(tail), fill: G_COAT }, { path: pathOf(tuft), fill: G_DARK }, ...near.map((k) => ({ path: pathOf(legs[k].poly), fill: G_LEG })),
    ...near.map((k) => ({ path: pathOf(hoof(k)), fill: G_DARK })), { path: neckP, fill: G_COAT }, { path: bodyP, fill: G_COAT },
    ...oss.map((q) => ({ path: pathOf(q), fill: G_COAT })), ...oss.map((q) => ({ path: knob(q[1]), fill: G_DARK })), { path: pathOf(ear, 0.03), fill: G_COAT }, { path: pathOf(head, 0.04), fill: G_COAT }], lw);
  // flat coat markings (no outlines), cream belly and upper legs
  const spots = (clip: Path2D, x0: number, x1: number, y0: number, y1: number, n: number, sz: number) => {
    g.save(); g.clip(clip); g.fillStyle = G_SPOT;
    for (let i = 0; i < n; i++) { const cx = x0 + rnd() * (x1 - x0), cy = y0 + rnd() * (y1 - y0), k = sz * (0.7 + rnd() * 0.5), q: P[] = [];
      for (let j = 0; j < 5; j++) { const a = (j / 5) * Math.PI * 2 + rnd() * 0.6; q.push([cx + Math.cos(a) * k * (0.7 + rnd() * 0.4), cy + Math.sin(a) * k * (0.7 + rnd() * 0.4)]); } g.fill(pathOf(q, k * 0.25)); }
    g.restore();
  };
  g.save(); g.clip(bodyP); g.fillStyle = "#e9c48d"; g.fill(pathOf([[-0.5, -0.78], [0.45, -0.8], [0.5, -0.6], [-0.5, -0.6]])); g.restore();
  spots(bodyP, -0.6, 0.55, -1.2, -0.8, 26, 0.07);
  seed = 99; const nx0 = Math.min(nb[0], nt[0]) - 0.2, nx1 = Math.max(nb[0], nt[0]) + 0.2, ny0 = Math.min(nb[1], nt[1]) - 0.2, ny1 = Math.max(nb[1], nt[1]) + 0.2;
  spots(neckP, nx0, nx1, ny0, ny1, 34, 0.045);
  for (const k of near) { g.save(); g.clip(pathOf(legs[k].poly)); spots(pathOf(legs[k].poly), hips[k][0] - 0.1, hips[k][0] + 0.1, -0.85, -0.55, 4, 0.04); g.restore(); }
  g.save(); g.clip(pathOf(head, 0.04)); g.fillStyle = "#e8b77a"; g.fill(pathOf(muzzle, 0.03)); g.restore();
  // mane: short dark strip along the back of the neck
  { const nr = ribbon([nb, nm, nt], [0.32, 0.17, 0.11]), backE = nr.slice(3).reverse(), frontE = nr.slice(0, 3);
    // mane: short dark tufts just inside the back edge (skip the base hidden in the body)
    for (let i = 3; i < 12; i++) { const t = i / 12, a = t < 0.5 ? lerp(backE[0], backE[1], t * 2) : lerp(backE[1], backE[2], (t - 0.5) * 2), b = t < 0.5 ? lerp(frontE[0], frontE[1], t * 2) : lerp(frontE[1], frontE[2], (t - 0.5) * 2);
      const q = lerp(a, b, 0.12); stroke(g, [a, q], 0.03, G_DARK); } }
  // cream rim-light slivers on the front edges
  const rim = (pts: P[]) => stroke(g, pts, lw * 0.9, CREAM);
  { const nr = ribbon([nb, nm, nt], [0.32, 0.17, 0.11]), fe = nr.slice(0, 3), be = nr.slice(3).reverse(); rim([lerp(fe[1], be[1], 0.1), lerp(fe[2], be[2], 0.12)]); }
  for (const k of near) { const pl = legs[k].poly; rim(pl.slice(5, 8).map((p) => [p[0] - 0.012, p[1]] as P)); }
  // face
  const f = o.face ?? {};
  eye(g, H([0.07, -0.025]), 0.052, f, G_COAT, lw, ha);
  g.fillStyle = LINE; const ns = H([0.29, -0.015]); g.beginPath(); g.ellipse(ns[0], ns[1], 0.018, 0.011, ha, 0, Math.PI * 2); g.fill();
  const m0 = H([0.18, 0.05]), m1 = H([0.3, 0.045]);
  if (f.mouth === "o") { const mc = H([0.25, 0.05]); g.fillStyle = "#5a2418"; g.beginPath(); g.ellipse(mc[0], mc[1], 0.025, 0.018, ha, 0, Math.PI * 2); g.fill(); g.strokeStyle = LINE; g.lineWidth = lw * 0.7; g.stroke(); }
  else if (f.mouth === "frown") stroke(g, [m0, H([0.24, 0.035]), m1], lw * 0.8);
  else if (f.mouth === "smirk") stroke(g, [m0, H([0.25, 0.055]), H([0.3, 0.035])], lw * 0.8);
  else stroke(g, [m0, m1], lw * 0.8);
  if (f.sweat) { const sp = H([-0.02, -0.14]); g.fillStyle = "#9fd0e8"; g.beginPath(); g.moveTo(sp[0], sp[1] - 0.04); g.quadraticCurveTo(sp[0] + 0.03, sp[1], sp[0], sp[1] + 0.02); g.quadraticCurveTo(sp[0] - 0.03, sp[1], sp[0], sp[1] - 0.04); g.fill(); g.strokeStyle = LINE; g.lineWidth = lw * 0.6; g.stroke(); }
  g.restore();
};

// ---------------- lioness ----------------
type LPose = { pose?: "sit" | "crouch" | "fly" | "stand"; face?: Face; tilt?: number };
const lioness = (g: CanvasRenderingContext2D, x: number, y: number, s: number, o: LPose = {}, flip = false) => {
  g.save(); g.translate(x, y); g.scale(flip ? -s : s, s); g.rotate(o.tilt ?? 0);
  const lw = 4.2 / s, pose = o.pose ?? "stand";
  let body: P[], legsDef: [P, P, number][], headC: P, tailPts: P[];
  if (pose === "sit") {
    body = [[-0.25, -0.05], [-0.3, -0.35], [-0.05, -0.75], [0.2, -0.8], [0.3, -0.6], [0.22, -0.1], [0.05, 0]];
    legsDef = [[[0.15, -0.5], [0.2, 0], 0.0], [[0.05, -0.5], [0.08, 0], 0.0]]; headC = [0.25, -0.9]; tailPts = [[-0.25, -0.05], [-0.5, -0.02], [-0.62, -0.1]];
  } else if (pose === "crouch") {
    body = [[-0.65, -0.18], [-0.6, -0.38], [-0.1, -0.42], [0.35, -0.4], [0.5, -0.3], [0.45, -0.12], [-0.5, -0.1]];
    legsDef = [[[0.35, -0.25], [0.62, 0], 0.04], [[0.25, -0.25], [0.5, 0], 0.04], [[-0.5, -0.25], [-0.3, 0], -0.1], [[-0.58, -0.25], [-0.42, 0], -0.1]]; headC = [0.6, -0.36]; tailPts = [[-0.62, -0.3], [-0.9, -0.25], [-1.05, -0.12]];
  } else {
    const fly = pose === "fly";
    body = [[-0.6, -0.45], [-0.55, -0.68], [-0.1, -0.72], [0.35, -0.75], [0.52, -0.6], [0.45, -0.42], [-0.5, -0.4]];
    legsDef = fly ? [[[0.35, -0.5], [0.75, -0.75], 0.05], [[0.25, -0.5], [0.65, -0.45], 0.05], [[-0.45, -0.5], [-0.8, -0.2], -0.05], [[-0.55, -0.5], [-0.9, -0.45], -0.05]]
      : [[[0.35, -0.5], [0.4, 0], -0.02], [[0.25, -0.5], [0.22, 0], -0.02], [[-0.45, -0.5], [-0.42, 0], 0.05], [[-0.55, -0.5], [-0.6, 0], 0.05]];
    headC = [0.62, -0.78]; tailPts = [[-0.58, -0.62], [-0.85, -0.7], [-1.0, -0.9]];
  }
  const legP = legsDef.map(([h, f, b]) => leg(h, f, b, 0.12, 0.08).poly);
  const paws = legsDef.map(([, f]) => { const q = new Path2D(); q.ellipse(f[0] + 0.03, f[1] - 0.025, 0.065, 0.035, 0, 0, Math.PI * 2); return q; });
  const far = legsDef.length === 4 ? [1, 3] : [1], near = legsDef.map((_, i) => i).filter((i) => !far.includes(i));
  group(g, far.flatMap((i) => [{ path: pathOf(legP[i]), fill: "#b07a43" }, { path: paws[i], fill: "#b07a43" }]), lw);
  const [hx, hy] = headC;
  const head: P[] = [[hx - 0.16, hy - 0.12], [hx + 0.06, hy - 0.16], [hx + 0.18, hy - 0.08], [hx + 0.3, hy - 0.02], [hx + 0.3, hy + 0.1], [hx + 0.1, hy + 0.15], [hx - 0.14, hy + 0.1]];
  const ears: P[][] = [[[hx - 0.12, hy - 0.1], [hx - 0.1, hy - 0.24], [hx + 0.0, hy - 0.13]]];
  const tail = ribbon(tailPts, [0.05, 0.04, 0.035]), te = tailPts[2], tuft: P[] = [[te[0] - 0.05, te[1] - 0.04], [te[0] + 0.04, te[1] - 0.05], [te[0] + 0.02, te[1] + 0.08], [te[0] - 0.06, te[1] + 0.06]];
  const bodyP = pathOf(body, 0.08), headP = pathOf(head, 0.05);
  group(g, [{ path: pathOf(tail), fill: L_COAT }, { path: pathOf(tuft), fill: G_DARK }, ...near.flatMap((i) => [{ path: pathOf(legP[i]), fill: L_COAT }, { path: paws[i], fill: L_BELLY }]),
    { path: bodyP, fill: L_COAT }, ...ears.map((e) => ({ path: pathOf(e, 0.02), fill: L_COAT })), { path: headP, fill: L_COAT }], lw);
  g.save(); g.clip(bodyP); g.fillStyle = L_BELLY; const by = Math.max(...body.map((p) => p[1])); g.fillRect(-1.2, by - 0.1, 2.4, 0.2); g.restore();
  g.save(); g.clip(headP); g.fillStyle = L_MUZ; g.beginPath(); g.ellipse(hx + 0.2, hy + 0.08, 0.14, 0.09, 0, 0, Math.PI * 2); g.fill(); g.restore();
  g.fillStyle = "#c06a55"; g.beginPath(); g.moveTo(hx + 0.27, hy + 0.0); g.lineTo(hx + 0.33, hy + 0.0); g.lineTo(hx + 0.3, hy + 0.05); g.closePath(); g.fill(); g.strokeStyle = LINE; g.lineWidth = lw * 0.6; g.stroke();
  const f = o.face ?? {};
  if (f.mouth === "o") { g.fillStyle = "#5a2418"; g.beginPath(); g.ellipse(hx + 0.22, hy + 0.11, 0.035, 0.025, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = LINE; g.lineWidth = lw * 0.7; g.stroke(); }
  else stroke(g, [[hx + 0.14, hy + 0.12], [hx + 0.22, hy + (f.mouth === "frown" ? 0.1 : 0.12)], [hx + 0.29, hy + 0.11]], lw * 0.8);
  eye(g, [hx + 0.06, hy - 0.04], 0.05, f, L_COAT, lw);
  stroke(g, body.slice(1, 4).map((p) => [p[0], p[1] + 0.025] as P), lw * 0.9, "#f0d3a0");
  g.restore();
};

// ---------------- world ----------------
const paperBG = (g: CanvasRenderingContext2D, hor: number) => {
  g.fillStyle = PAPER; g.fillRect(0, 0, 1080, 1920);
  g.fillStyle = PAPER2; g.fillRect(0, hor, 1080, 1920 - hor);
  seed = 5; for (let i = 0; i < 2600; i++) { g.fillStyle = rnd() < 0.5 ? "rgba(255,245,220,0.08)" : "rgba(90,60,30,0.06)"; g.fillRect(rnd() * 1080, rnd() * 1920, 1 + rnd() * 3, 1 + rnd() * 3); }
  // faint vertical brush streaks in the paper
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,240,210,${(0.02 + rnd() * 0.03).toFixed(3)})`; g.fillRect(rnd() * 1080, 0, 4 + rnd() * 20, hor); }
  stroke(g, [[-10, hor], [1090, hor + 4]], 3, "rgba(25,21,18,0.55)");
};
const dryBrush = (g: CanvasRenderingContext2D, cx: number, y: number, w: number, s = 1) => {
  seed = Math.round(cx + y);
  for (let i = 0; i < 70; i++) { const x = cx - w / 2 + rnd() * w, yy = y + (rnd() - 0.3) * 28 * s, l = (20 + rnd() * 90) * s; stroke(g, [[x, yy], [x + l, yy + (rnd() - 0.5) * 3]], (1.5 + rnd() * 3) * s, rnd() < 0.55 ? "rgba(240,228,200,0.75)" : "rgba(25,21,18,0.7)"); }
  for (let i = 0; i < 60; i++) { g.fillStyle = rnd() < 0.6 ? "rgba(240,228,200,0.8)" : "rgba(25,21,18,0.6)"; g.beginPath(); g.arc(cx - w / 2 + rnd() * w, y + (rnd() - 0.2) * 40 * s, (1 + rnd() * 3) * s, 0, 7); g.fill(); }
};
const tree = (g: CanvasRenderingContext2D, x: number, y: number, s: number) => {
  const canopy: P[] = [[-1, -0.95], [-0.6, -1.12], [0.2, -1.15], [1, -1.0], [0.85, -0.86], [-0.85, -0.85]].map(([a, b]) => [x + a * s, y + b * s]);
  const trunk = ribbon([[x, y], [x + 0.05 * s, y - 0.5 * s], [x - 0.02 * s, y - 0.9 * s]], [0.1 * s, 0.07 * s, 0.06 * s]);
  group(g, [{ path: pathOf(trunk), fill: "#7a5a3c" }, { path: pathOf(canopy, 0.12 * s), fill: "#8c8c4e" }], 2.6);
};
const caption = (g: CanvasRenderingContext2D, words: string[], hi: number) => {
  const size = 118; g.font = `${size}px "Bangers"`; g.textBaseline = "middle"; g.lineJoin = "round";
  const sp = size * 0.28, ws = words.map((w) => g.measureText(w).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  let x = 540 - tot / 2;
  words.forEach((w, i) => { g.save(); g.translate(x + ws[i] / 2, 1600); g.textAlign = "center"; const sc = i === hi ? 1.08 : 1; g.scale(sc, sc);
    g.lineWidth = size * 0.2; g.strokeStyle = LINE; g.strokeText(w, 0, 0); g.fillStyle = i === hi ? "#ffd33d" : "#fbf3e2"; g.fillText(w, 0, 0); g.restore(); x += ws[i] + sp; });
};
const starBurst = (g: CanvasRenderingContext2D, x: number, y: number, r: number) => {
  const pts: P[] = []; for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2, rr = i % 2 ? r * 0.55 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
  group(g, [{ path: pathOf(pts), fill: "#f3c63f" }], 4);
};
const dizzy = (g: CanvasRenderingContext2D, x: number, y: number) => { for (const [dx, dy] of [[-40, 0], [10, -22], [52, 4]]) { const pts: P[] = []; for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 7 : 17; pts.push([x + dx + Math.cos(a) * r, y + dy + Math.sin(a) * r]); } group(g, [{ path: pathOf(pts), fill: "#f6e7b0" }], 2.4); } };

const SHOTS: ((g: CanvasRenderingContext2D) => void)[] = [
  // 1. hook: the lioness is the scared one
  (g) => {
    paperBG(g, 1380);
    dryBrush(g, 640, 1395, 900);
    giraffe(g, 650, 1390, 500, { neckAng: -1.4, headAng: 0.75, face: { lid: 0.5, brow: -0.4, look: [0.3, 0.9], mouth: "smirk" } }, false);
    lioness(g, 250, 1405, 300, { pose: "sit", face: { lid: 0, brow: -0.6, look: [0.5, -0.9], mouth: "o", sweat: true } });
    caption(g, ["LIONS", "ARE", "SCARED"], 2);
  },
  // 2. the splits at the waterhole
  (g) => {
    paperBG(g, 1180); tree(g, 900, 1184, 130);
    const w = new Path2D(); w.ellipse(700, 1395, 300, 55, 0, 0, Math.PI * 2); group(g, [{ path: w, fill: "#5d93a8" }], 4); stroke(g, [[600, 1385], [700, 1383]], 4, "rgba(240,240,230,0.7)");
    dryBrush(g, 420, 1400, 700);
    giraffe(g, 330, 1400, 450, { tilt: 0.12, neckAng: 0.62, neckLen: 1.0, headAng: 1.35, feet: { fn: [0.95, 0.05], ff: [0.75, 0.05], hn: [-0.55, 0.04], hf: [-0.75, 0.04] }, bends: { fn: 0.06, ff: 0.06 }, face: { lid: 0.1, brow: -0.3, look: [-0.9, -0.3], mouth: "flat", sweat: true } });
    lioness(g, 120, 1420, 170, { pose: "crouch", face: { lid: 0.55, brow: 0.6, look: [1, 0], mouth: "flat" } });
    caption(g, ["DOES", "THE", "SPLITS"], 2);
  },
  // 3. lookout
  (g) => {
    paperBG(g, 1250); tree(g, 860, 1252, 90); tree(g, 980, 1252, 60);
    dryBrush(g, 420, 1405, 600);
    giraffe(g, 400, 1400, 470, { neckAng: -1.45, neckLen: 1.25, headAng: 0.05, face: { lid: 0.5, brow: 0.2, look: [1, 0.2], mouth: "flat" } });
    lioness(g, 900, 1262, 60, { pose: "crouch" }, true);
    g.save(); g.setLineDash([18, 16]); stroke(g, [[560, 300], [880, 1225]], 5, "#b8432e"); g.restore();
    group(g, [{ path: pathOf([[530, 140], [560, 140], [552, 250], [538, 250]]), fill: "#b8432e" }], 3); const d = new Path2D(); d.arc(545, 280, 13, 0, 7); group(g, [{ path: d, fill: "#b8432e" }], 3);
    caption(g, ["BEST", "LOOKOUT"], 1);
  },
  // 4. one kick
  (g) => {
    paperBG(g, 1380); tree(g, 960, 1384, 110);
    dryBrush(g, 640, 1395, 700);
    giraffe(g, 620, 1390, 420, { neckAng: -1.35, headAng: 0.35, feet: { hn: [-1.0, -0.62] }, bends: { hn: -0.06 }, face: { lid: 0.55, brow: 0.7, look: [-1, 0.3], mouth: "frown" } });
    starBurst(g, 230, 1060, 90);
    lioness(g, 170, 1150, 230, { pose: "fly", tilt: -0.9, face: { lid: 0.6, brow: -0.5, look: [0, 0], mouth: "o" } });
    dizzy(g, 140, 840);
    caption(g, ["ONE", "KICK"], 1);
  },
  // 5. the babies
  (g) => {
    paperBG(g, 1380); tree(g, 900, 1384, 120);
    dryBrush(g, 600, 1395, 900);
    giraffe(g, 600, 1385, 430, { neckAng: -1.45, headAng: 0.55, face: { lid: 0.55, brow: 0.8, look: [-0.6, 0.6], mouth: "frown" } }, true);
    giraffe(g, 900, 1410, 250, { neckAng: -1.2, neckLen: 0.8, headAng: 0.1, face: { lid: 0, brow: -0.2, look: [-0.8, 0], mouth: "flat" } }, true);
    lioness(g, 200, 1420, 200, { pose: "crouch", face: { lid: 0.5, brow: 0.5, look: [1, -0.2], mouth: "flat" } });
    caption(g, ["THE", "BABIES"], 1);
  },
];
(window as unknown as { INK_VIDEO: unknown }).INK_VIDEO = {
  duration: SHOTS.length,
  drawAt: (g: CanvasRenderingContext2D, W: number, H: number, t: number) => { g.save(); g.scale(W / 1080, H / 1920); SHOTS[Math.min(SHOTS.length - 1, Math.floor(t))](g); g.restore(); },
};
