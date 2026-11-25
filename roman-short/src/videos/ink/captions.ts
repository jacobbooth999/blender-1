// Kinetic captions for the ink videos: 1-3 words at a time in the lower third, each word popping in on its spoken
// onset (scale overshoot + small bounce), the word being spoken in yellow and slightly bigger, key words staying
// orange. Big bold display font, white fill, thick black outline and a soft drop shadow so they read on any scene.
// Driven by words.json (tools/word_times.mjs): [{ word, start, end, i }] with times in seconds.
export type CapWord = { word: string; start: number; end: number; i: number };
type Chunk = { words: CapWord[]; start: number; end: number };

const ease = (x: number) => { const u = Math.max(0, Math.min(1, x)); return u * u * (3 - 2 * u); };
/** pop-in curve: 0 -> overshoot 1.18 -> settle 1 over ~0.16 s */
const pop = (k: number) => (k <= 0 ? 0 : k < 0.55 ? 0.55 + 0.63 * ease(k / 0.55) : 1.18 - 0.18 * ease((k - 0.55) / 0.45));

export const buildChunks = (words: CapWord[], maxWords = 3, maxChars = 18): Chunk[] => {
  const out: Chunk[] = [];
  let cur: CapWord[] = [];
  const flush = () => { if (cur.length) out.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end }); cur = []; };
  for (let k = 0; k < words.length; k++) {
    const w = words[k], prev = words[k - 1];
    const chars = cur.reduce((a, c) => a + c.word.length + 1, 0) + w.word.length;
    const gap = prev ? w.start - prev.end : 0;
    if (cur.length && (cur.length >= maxWords || chars > maxChars || gap > 0.35 || w.i !== cur[0].i)) flush();
    cur.push(w);
    if (/[.,?!:;]$/.test(w.word)) flush();
  }
  flush();
  // each chunk stays up until the next one starts (or a short hold after its last word)
  out.forEach((c, k) => { const nx = out[k + 1]; c.end = nx ? Math.min(nx.start, c.end + 0.6) : c.end + 0.8; });
  return out;
};

export type CapStyle = { y: number; size: number; font: string; emphasis: Set<string>; variant?: "pop" | "journal" };
export const DEFAULT_STYLE = (emph: string[] = []): CapStyle => ({ y: 945, size: 104, font: "Bangers", emphasis: new Set(emph.map((s) => s.toLowerCase())) });

const clean = (w: string) => w.replace(/[.,!:;]+$/g, "").toUpperCase();
const key = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, "");

/** draw the captions for time t on a 1920 x 1080 design canvas (call with the design transform active) */
export const drawCaptions = (g: CanvasRenderingContext2D, chunks: Chunk[], t: number, st: CapStyle) => {
  const c = chunks.find((ch) => t >= ch.start - 0.04 && t < ch.end);
  if (!c) return;
  g.save();
  g.font = `${st.size}px "${st.font}"`; g.textBaseline = "middle"; g.lineJoin = "round";
  const space = st.size * 0.28;
  const shown = c.words.filter((w) => t >= w.start - 0.04);
  const widths = c.words.map((w) => g.measureText(clean(w.word)).width);
  const total = widths.reduce((a, b) => a + b, 0) + space * (c.words.length - 1); // layout for the full chunk so words don't shift
  let x = 960 - total / 2;
  // chunk enters with a small upward slide
  const enter = ease((t - c.start + 0.04) / 0.12), yBase = st.y + (1 - enter) * 18;
  if (st.variant === "journal") {
    const shownW = c.words.reduce((a, w, k) => (t >= w.start - 0.04 ? a + widths[k] + (k ? space : 0) : a), 0);
    const pad = st.size * 0.45, h = st.size * 1.05, x0 = 960 - total / 2 - pad, x1 = 960 - total / 2 + shownW + pad;
    g.save(); g.translate(960, yBase); g.rotate(-0.012); g.translate(-960, -yBase);
    g.fillStyle = "rgba(246,239,223,0.94)"; g.beginPath(); g.moveTo(x0, yBase - h / 2);
    for (let q = 0; q <= 16; q++) g.lineTo(x0 + ((x1 - x0) * q) / 16, yBase - h / 2 + (q % 2 ? 4 : -3));
    for (let q = 16; q >= 0; q--) g.lineTo(x0 + ((x1 - x0) * q) / 16, yBase + h / 2 + (q % 2 ? -4 : 3));
    g.closePath(); g.shadowColor = "rgba(29,43,58,0.25)"; g.shadowBlur = 10; g.shadowOffsetY = 5; g.fill(); g.restore();
  }
  c.words.forEach((w, k) => {
    const wd = widths[k];
    if (shown.includes(w)) {
      const kk = (t - w.start + 0.04) / 0.16, s = pop(kk);
      const active = t >= w.start - 0.04 && t < (c.words[k + 1]?.start ?? w.end + 0.15);
      const emph = st.emphasis.has(key(w.word)) || /\d/.test(w.word);
      const scale = s * (active ? 1.08 : 1) * (emph ? 1.06 : 1);
      const fill = active ? "#ffd33d" : emph ? "#ff9a3d" : "#ffffff";
      g.save();
      g.translate(x + wd / 2, yBase - (active ? 6 : 0));
      g.rotate((emph ? -0.035 : 0) * (k % 2 ? -1 : 1));
      g.scale(scale, scale);
      const txt = clean(w.word);
      g.textAlign = "center";
      if (st.variant === "journal") {
        // highlighter swipe behind the spoken word, tangerine wiggle under key words, navy hand lettering
        if (active) { g.fillStyle = "rgba(255,122,47,0.92)"; g.beginPath(); g.moveTo(-wd / 2 - 14, st.size * 0.34); g.lineTo(wd / 2 + 18, st.size * 0.3); g.lineTo(wd / 2 + 10, -st.size * 0.36); g.lineTo(-wd / 2 - 8, -st.size * 0.32); g.closePath(); g.fill(); }
        else if (emph) { g.strokeStyle = "#ff7a2f"; g.lineWidth = 7; g.lineCap = "round"; g.beginPath(); for (let q = 0; q <= 12; q++) { const xx = -wd / 2 + (wd * q) / 12, yy = st.size * 0.42 + Math.sin(q * 1.6) * 4; if (q) g.lineTo(xx, yy); else g.moveTo(xx, yy); } g.stroke(); }
        g.lineWidth = 8; g.strokeStyle = "#f6efdf"; g.strokeText(txt, 0, 0);
        g.fillStyle = "#1d2b3a"; g.fillText(txt, 0, 0);
      } else {
        g.shadowColor = "rgba(0,0,0,0.45)"; g.shadowBlur = 14; g.shadowOffsetY = 8;
        g.lineWidth = st.size * 0.2; g.strokeStyle = "#141114"; g.strokeText(txt, 0, 0);
        g.shadowColor = "transparent";
        g.fillStyle = fill; g.fillText(txt, 0, 0);
      }
      g.restore();
    }
    x += wd + space;
  });
  g.restore();
};
