// Hand-drawn ink toolkit for the 2D explainer look (references/INK_STYLE.md): wobbly thin ink lines, flat fills
// with soft gradients, ragged fur, scribbled hair, hand-lettered text. Everything is seeded, so a frame redraws
// identically. Units are pixels of a 1920 x 1080 frame (S scales them for other sizes).
export type P = [number, number];
export const INKC = "#1d1a1c";
export const PAPER = "#fbfaf5";
export const RED = "#d0453a";
export const BLUE = "#3d6fb6";

export const rng = (seed: number) => {
  let s = (Math.abs(seed * 9301 + 49297) % 233280) || 1;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** smooth 1D value noise from a seed */
const noise1 = (r: () => number, n = 8) => {
  const v = Array.from({ length: n + 3 }, () => r() * 2 - 1);
  return (t: number) => { const x = t * n, i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(v[i] ?? 0, v[i + 1] ?? 0, u); };
};

export class Ink {
  g: CanvasRenderingContext2D;
  r: () => number;
  /** base ink width in px */
  w = 3.2;
  wob = 1.0;
  /** drawing-unit size in px^-1 when the context is scaled (wobble amplitude and resample step follow it) */
  unit = 1;
  constructor(g: CanvasRenderingContext2D, seed = 1) { this.g = g; this.r = rng(seed); }
  seed(s: number) { this.r = rng(s); return this; }

  /** resample a polyline every `step` px and push points sideways with smooth noise: the hand-drawn wobble */
  wobble(pts: P[], amp: number, closed = false, step = 6): P[] {
    const src = closed ? [...pts, pts[0]] : pts;
    const out: P[] = [];
    let total = 0; const segs: number[] = [];
    for (let i = 1; i < src.length; i++) { const l = Math.hypot(src[i][0] - src[i - 1][0], src[i][1] - src[i - 1][1]); segs.push(l); total += l; }
    if (total < 1e-3) return pts.slice();
    const st = step * this.unit, n = Math.max(2, Math.ceil(total / st)), nz = noise1(this.r, Math.max(3, Math.round(total / (60 * this.unit))));
    let si = 0, acc = 0;
    for (let k = 0; k <= n; k++) {
      const d = (k / n) * total;
      while (si < segs.length - 1 && acc + segs[si] < d) { acc += segs[si]; si++; }
      const t = segs[si] ? (d - acc) / segs[si] : 0, a = src[si], b = src[si + 1];
      const x = lerp(a[0], b[0], t), y = lerp(a[1], b[1], t);
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      const o = nz(k / n) * amp * this.wob * this.unit;
      out.push([x - (dy / l) * o, y + (dx / l) * o]);
    }
    return out;
  }
  private path(pts: P[], closed: boolean) {
    const g = this.g; g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    if (closed) g.closePath();
  }
  /** a wobbly ink stroke */
  line(pts: P[], w = this.w, col = INKC, amp = 1.1) {
    const g = this.g, q = this.wobble(pts, amp);
    g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = col; g.lineWidth = w;
    this.path(q, false); g.stroke();
  }
  /** a filled shape (fill may be a gradient) with an optional wobbly outline */
  shape(pts: P[], fill: string | CanvasGradient | null, w: number | null = this.w, col = INKC, amp = 1.0) {
    const g = this.g;
    if (fill) { g.fillStyle = fill; this.path(pts, true); g.fill(); }
    if (w) { const q = this.wobble(pts, amp, true); g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = col; g.lineWidth = w; this.path(q, false); g.stroke(); }
  }
  ellPts(cx: number, cy: number, rx: number, ry: number, rot = 0, n = 48, a0 = 0, a1 = Math.PI * 2): P[] {
    const out: P[] = [];
    for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n, x = rx * Math.cos(a), y = ry * Math.sin(a); out.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); }
    return out;
  }
  ell(cx: number, cy: number, rx: number, ry: number, fill: string | CanvasGradient | null, w: number | null = this.w, rot = 0, col = INKC) {
    this.shape(this.ellPts(cx, cy, rx, ry, rot), fill, w, col);
  }
  dot(cx: number, cy: number, r: number, col = INKC) { const g = this.g; g.fillStyle = col; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill(); }
  arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, w = this.w, col = INKC) {
    this.line(this.ellPts(cx, cy, rx, ry, 0, 24, a0, a1), w, col, 0.4);
  }
  /** quadratic curve through a, near k, to b */
  curve(a: P, k: P, b: P, n = 16): P[] {
    const c: P = [2 * k[0] - (a[0] + b[0]) / 2, 2 * k[1] - (a[1] + b[1]) / 2], out: P[] = [];
    for (let i = 0; i <= n; i++) { const t = i / n, s = 1 - t; out.push([s * s * a[0] + 2 * s * t * c[0] + t * t * b[0], s * s * a[1] + 2 * s * t * c[1] + t * t * b[1]]); }
    return out;
  }
  /** Chaikin-smoothed closed polygon */
  curvePoly(pts: P[], iter = 3): P[] {
    let q = pts;
    for (let k = 0; k < iter; k++) {
      const o: P[] = [];
      for (let i = 0; i < q.length; i++) { const a = q[i], b = q[(i + 1) % q.length]; o.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]); }
      q = o;
    }
    return q;
  }
  /** fill a region with a vertical gradient */
  vgrad(y0: number, y1: number, stops: [number, string][]) {
    const gr = this.g.createLinearGradient(0, y0, 0, y1);
    for (const [t, c] of stops) gr.addColorStop(t, c);
    return gr;
  }
  /** soft painted texture: low-contrast blotches clipped to a shape */
  texture(pts: P[], cols: string[], n: number, rmin: number, rmax: number, alpha = 0.18) {
    const g = this.g; g.save(); this.path(pts, true); g.clip();
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    g.globalAlpha = alpha;
    for (let i = 0; i < n; i++) {
      g.fillStyle = cols[i % cols.length]; g.beginPath();
      g.ellipse(lerp(x0, x1, this.r()), lerp(y0, y1, this.r()), lerp(rmin, rmax, this.r()), lerp(rmin, rmax, this.r()) * 0.6, this.r() * 3, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  /** short strokes scattered inside a shape (grass, fur, bark) */
  hatch(pts: P[], n: number, len: number, col: string, w: number, ang = -Math.PI / 2, spread = 0.4) {
    const g = this.g; g.save(); this.path(pts, true); g.clip();
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    g.strokeStyle = col; g.lineWidth = w; g.lineCap = "round";
    for (let i = 0; i < n; i++) {
      const x = lerp(x0, x1, this.r()), y = lerp(y0, y1, this.r()), a = ang + (this.r() - 0.5) * spread, l = len * (0.6 + this.r() * 0.6);
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 - Math.sin(a) * l * 0.12, y + Math.sin(a) * l * 0.5 + Math.cos(a) * l * 0.12, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    g.restore();
  }
  /** ragged outline (fur pelt edges): pushes alternate points outward */
  ragged(pts: P[], depth: number, every = 3): P[] {
    return pts.map((p, i) => {
      if (i % every) return p;
      let cx = 0, cy = 0; for (const q of pts) { cx += q[0]; cy += q[1]; } cx /= pts.length; cy /= pts.length;
      const dx = p[0] - cx, dy = p[1] - cy, l = Math.hypot(dx, dy) || 1, d = depth * (0.5 + this.r());
      return [p[0] + (dx / l) * d, p[1] + (dy / l) * d] as P;
    });
  }
  /** messy scribbled hair: loose curved strokes around a head */
  scribbleHair(cx: number, cy: number, r: number, col: string, n = 60, mess = 1, top = 1.0) {
    const g = this.g; g.strokeStyle = col; g.lineCap = "round";
    g.fillStyle = col; g.beginPath(); g.ellipse(cx, cy - r * 0.32, r * 1.04, r * 0.78 * top, 0, Math.PI, Math.PI * 2); g.fill();
    for (let i = 0; i < n; i++) {
      const a = Math.PI + this.r() * Math.PI * 1.06 - 0.03, rr = r * (0.85 + this.r() * 0.35 * mess);
      const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.95 - r * 0.05;
      const len = r * (0.25 + this.r() * 0.45 * mess), da = a + (this.r() - 0.5) * 1.6;
      g.lineWidth = 2 + this.r() * 2.5;
      g.beginPath(); g.moveTo(x - Math.cos(a) * r * 0.2, y - Math.sin(a) * r * 0.2);
      g.quadraticCurveTo(x + Math.cos(da) * len * 0.5, y + Math.sin(da) * len * 0.5, x + Math.cos(da) * len, y + Math.sin(da) * len + len * 0.4);
      g.stroke();
    }
    // side locks hanging past the ears
    for (const sd of [-1, 1]) for (let i = 0; i < 8 * mess; i++) {
      const x = cx + sd * r * (0.85 + this.r() * 0.2), y = cy - r * 0.2 + this.r() * r * 0.4;
      g.lineWidth = 2 + this.r() * 2;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + sd * r * 0.15, y + r * 0.4, x + sd * r * (0.05 + this.r() * 0.2), y + r * (0.6 + this.r() * 0.5 * mess)); g.stroke();
    }
  }
  text(s: string, x: number, y: number, size: number, font = "Patrick Hand", col = INKC, align: CanvasTextAlign = "center", outline = 0, outlineCol = INKC) {
    const g = this.g; g.font = `${size}px "${font}"`; g.textAlign = align; g.textBaseline = "middle";
    if (outline) { g.lineJoin = "round"; g.lineWidth = outline; g.strokeStyle = outlineCol; g.strokeText(s, x, y); }
    g.fillStyle = col; g.fillText(s, x, y);
  }
}
