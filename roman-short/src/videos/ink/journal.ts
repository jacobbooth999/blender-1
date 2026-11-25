// "Field Journal Riso": an optional signature look for the ink videos (preview only until approved).
// Applied after a frame is drawn: a gradient-map colour grade toward the channel palette, a riso-print offset
// tangerine ghost of the ink lines, paper grain + fibres, then a journal page frame with tape, a page number and
// the recurring mascot "Pip" the oxpecker. Highlighter captions live in captions.ts (style "journal").
export const PAL = { ink: [29, 43, 58], tang: [255, 122, 47], sage: [143, 174, 126], sand: [232, 201, 139], cream: [246, 239, 223] } as const;
const hex = (c: readonly number[]) => `rgb(${c[0]},${c[1]},${c[2]})`;

let paper: HTMLCanvasElement | null = null;
const paperTex = (W: number, H: number) => {
  if (paper && paper.width === W) return paper;
  paper = document.createElement("canvas"); paper.width = W; paper.height = H;
  const g = paper.getContext("2d")!;
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H);
  let s = 12345; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  for (let i = 0; i < 9000; i++) { const a = 0.04 + r() * 0.06; g.fillStyle = `rgba(120,100,70,${a.toFixed(3)})`; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2); }
  g.lineCap = "round";
  for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * H, l = 10 + r() * 40, a = r() * Math.PI; g.strokeStyle = `rgba(140,115,80,${(0.05 + r() * 0.06).toFixed(3)})`; g.lineWidth = 1 + r(); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 4, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  for (let i = 0; i < 18; i++) { const cx = r() * W, cy = r() * H, gr = g.createRadialGradient(cx, cy, 0, cx, cy, 200 + r() * 300); gr.addColorStop(0, "rgba(200,170,120,0.06)"); gr.addColorStop(1, "rgba(200,170,120,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
  return paper;
};

/** gradient map stops by luminance (0 = dark, 1 = light) */
const STOPS: [number, readonly number[]][] = [[0, PAL.ink], [0.32, [70, 92, 104]], [0.52, PAL.sage], [0.7, PAL.sand], [1, PAL.cream]];
const LUT = (() => {
  const l = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const v = i / 255; let k = 0; while (k + 1 < STOPS.length - 1 && v > STOPS[k + 1][0]) k++;
    const [a, ca] = STOPS[k], [b, cb] = STOPS[k + 1], t = Math.max(0, Math.min(1, (v - a) / (b - a)));
    for (let c = 0; c < 3; c++) l[i * 3 + c] = ca[c] + (cb[c] - ca[c]) * t;
  }
  return l;
})();

/** colour grade + riso misregistration + grain, in place on the canvas */
export const journalGrade = (g: CanvasRenderingContext2D, W: number, H: number, t: number) => {
  const img = g.getImageData(0, 0, W, H), d = img.data, src = new Uint8ClampedArray(d);
  const ox = Math.round(W * 0.0034), oy = -Math.round(H * 0.0028); // riso offset of the second colour
  const mapK = 0.38, cell = Math.max(5, Math.round(W / 280));
  let seed = Math.floor(t * 30) * 7919 + 17;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4, r = src[i], gg = src[i + 1], b = src[i + 2];
      const lum = (r * 0.2126 + gg * 0.7152 + b * 0.0722) | 0;
      // gradient map blended with the original, with the original's warm channels kept a little stronger
      let nr = LUT[lum * 3] * mapK + r * (1 - mapK), ng = LUT[lum * 3 + 1] * mapK + gg * (1 - mapK), nb = LUT[lum * 3 + 2] * mapK + b * (1 - mapK);
      // keep colours lively: saturation boost around the new luminance
      const nl = nr * 0.2126 + ng * 0.7152 + nb * 0.0722, sat = 1.28;
      nr = nl + (nr - nl) * sat; ng = nl + (ng - nl) * sat; nb = nl + (nb - nl) * sat;
      // riso halftone: a dot screen darkens the mid / shadow tones
      if (lum < 175 && lum > 35) {
        const cx = (x % cell) - cell / 2 + 0.5, cy = (y % cell) - cell / 2 + 0.5, rr = (cell / 2) * Math.sqrt((175 - lum) / 175) * 0.9;
        if (cx * cx + cy * cy < rr * rr) { nr *= 0.86; ng *= 0.86; nb *= 0.9; }
      }
      // tangerine ghost: ink darkness sampled at the offset position
      const xs = x - ox, ys = y - oy;
      if (xs >= 0 && ys >= 0 && xs < W && ys < H) {
        const j = (ys * W + xs) * 4, dl = (src[j] * 0.2126 + src[j + 1] * 0.7152 + src[j + 2] * 0.0722);
        const ink = dl < 95 ? Math.min(1, (95 - dl) / 60) : 0;
        if (ink > 0 && lum > 80) { const a = 0.75 * ink; nr = nr * (1 - a) + PAL.tang[0] * a; ng = ng * (1 - a) + PAL.tang[1] * a; nb = nb * (1 - a) + PAL.tang[2] * a; }
      }
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const n = ((seed >> 16) & 15) - 7.5;
      d[i] = nr + n; d[i + 1] = ng + n; d[i + 2] = nb + n;
    }
  }
  g.putImageData(img, 0, 0);
  g.save(); g.globalCompositeOperation = "multiply"; g.drawImage(paperTex(W, H), 0, 0); g.restore();
};

/** Pip the oxpecker: round navy body, tangerine beak and feet, a tiny notebook. mood: "notes" | "shock" | "point" */
export const pip = (g: CanvasRenderingContext2D, x: number, y: number, s: number, mood: "notes" | "shock" | "point", t: number) => {
  g.save(); g.translate(x, y); g.scale(s, s);
  const ink = hex(PAL.ink), tang = hex(PAL.tang);
  const hop = mood === "shock" ? Math.abs(Math.sin(t * 9)) * -8 : Math.sin(t * 2) * 2;
  g.translate(0, hop);
  g.lineCap = "round"; g.lineJoin = "round";
  // feet
  g.strokeStyle = tang; g.lineWidth = 5; for (const fx of [-12, 10]) { g.beginPath(); g.moveTo(fx, 40); g.lineTo(fx, 58); g.lineTo(fx + 8, 60); g.stroke(); }
  // tail
  g.fillStyle = ink; g.beginPath(); g.moveTo(-36, 10); g.lineTo(-66, 30); g.lineTo(-58, 2); g.closePath(); g.fill();
  // body
  g.fillStyle = "#3d5266"; g.strokeStyle = ink; g.lineWidth = 5;
  g.beginPath(); g.ellipse(0, 10, 42, 38, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = "#e8d7b0"; g.beginPath(); g.ellipse(10, 24, 24, 20, 0, 0, Math.PI * 2); g.fill();
  // wing / notebook arm
  if (mood === "notes") { g.fillStyle = hex(PAL.cream); g.strokeStyle = ink; g.lineWidth = 4; g.save(); g.translate(22, 24); g.rotate(-0.25); g.fillRect(-4, -18, 34, 40); g.strokeRect(-4, -18, 34, 40); for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(2, -10 + k * 8); g.lineTo(22 - (k % 2) * 6, -10 + k * 8); g.lineWidth = 2; g.stroke(); } g.restore(); }
  g.fillStyle = ink; g.save(); g.translate(-8, 12); g.rotate(mood === "shock" ? -1.1 : mood === "point" ? -0.6 : 0.3); g.beginPath(); g.ellipse(0, 0, 24, 14, 0, 0, Math.PI * 2); g.fill(); g.restore();
  // head + beak (red-billed oxpecker: tangerine bill, yellow-ringed eye)
  g.fillStyle = tang; g.strokeStyle = ink; g.lineWidth = 4; g.beginPath(); g.moveTo(34, -10); g.lineTo(62, -4); g.lineTo(34, 4); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = "#ffd33d"; g.beginPath(); g.arc(20, -10, 11, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = ink;
  if (mood === "shock") { g.beginPath(); g.arc(21, -10, 6, 0, Math.PI * 2); g.fill(); g.lineWidth = 3; g.beginPath(); g.moveTo(8, -32); g.lineTo(30, -26); g.stroke(); }
  else { const blink = (t % 3.1) < 0.12; if (blink) { g.lineWidth = 3; g.beginPath(); g.moveTo(14, -10); g.lineTo(27, -10); g.stroke(); } else { g.beginPath(); g.arc(22, -9, 5, 0, Math.PI * 2); g.fill(); } }
  if (mood === "shock") { g.fillStyle = tang; g.font = 'bold 44px "Bangers"'; g.textAlign = "center"; g.fillText("!!", 40, -50); }
  g.restore();
};

/** journal page: cream border with a hand-drawn rule, tape on the corners, page number and Pip */
export const journalFrame = (g: CanvasRenderingContext2D, W: number, H: number, t: number, page: number, mood: "notes" | "shock" | "point") => {
  const k = W / 1920, m = 30 * k;
  g.save();
  g.fillStyle = hex(PAL.cream);
  g.beginPath(); g.rect(0, 0, W, H); g.roundRect(m, m, W - 2 * m, H - 2 * m, 18 * k); g.fill("evenodd");
  g.save(); g.globalCompositeOperation = "multiply"; g.globalAlpha = 0.6; g.drawImage(paperTex(W, H), 0, 0); g.restore();
  // wobbly inner rule
  g.strokeStyle = hex(PAL.ink); g.lineWidth = 3.2 * k; g.lineJoin = "round";
  let s = page * 97 + 3; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  g.beginPath();
  const pts: [number, number][] = [];
  const per = (x0: number, y0: number, x1: number, y1: number) => { for (let i = 0; i <= 20; i++) { const u = i / 20; pts.push([x0 + (x1 - x0) * u + (r() - 0.5) * 2.2 * k, y0 + (y1 - y0) * u + (r() - 0.5) * 2.2 * k]); } };
  per(m, m, W - m, m); per(W - m, m, W - m, H - m); per(W - m, H - m, m, H - m); per(m, H - m, m, m);
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.stroke();
  // tape
  for (const [x, y, a] of [[m + 40 * k, m + 4 * k, -0.6], [W - m - 40 * k, m + 4 * k, 0.6]] as const) {
    g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = "rgba(255,122,47,0.55)"; g.fillRect(-70 * k, -16 * k, 140 * k, 32 * k);
    g.strokeStyle = "rgba(29,43,58,0.25)"; g.lineWidth = 1.5 * k; for (let i = -60; i <= 60; i += 12) { g.beginPath(); g.moveTo(i * k, -16 * k); g.lineTo(i * k + 4 * k, -12 * k); g.stroke(); } g.restore();
  }
  // page number + field-note stamp
  g.fillStyle = hex(PAL.ink); g.font = `${30 * k}px "Gochi Hand"`; g.textAlign = "right"; g.textBaseline = "middle";
  g.fillText(`field notes · p.${String(page).padStart(2, "0")}`, W - m - 230 * k, H - m * 0.5);
  // Pip sits on the bottom-right of the page
  pip(g, W - m - 110 * k, H - m - 100 * k, 1.7 * k, mood, t);
  g.restore();
};
