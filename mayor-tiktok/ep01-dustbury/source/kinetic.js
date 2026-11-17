// Kinetic captions: one chunk (<= 5 words) at a time, each word pops in on its spoken time.
// Styles: base = Inter 800 caps white; 'caps' = big Anton; 'yellow' / 'red' = colour accent; 'serif' = Instrument Serif italic.
const S = 78, MAXW = 860, LINEH = 1.18;
const fontOf = (st, k = 1) => st === 'caps' ? `${Math.round(S * 1.42 * k)}px Anton` : st === 'serif' ? `italic ${Math.round(S * 1.45 * k)}px "Instrument Serif"` : `800 ${Math.round(S * k)}px Inter`;
const colOf = st => st === 'yellow' ? '#ffd84a' : st === 'red' ? '#ff5a4f' : '#ffffff';
const txtOf = (w, st) => st === 'serif' ? w.w : w.w.toUpperCase();
const pop = s => s < 0 ? 0 : 1 - Math.exp(-11 * s) * Math.cos(16 * s);

export function drawKinetic(g, t, CAPS, o) {
  let cur = null;
  for (const L of CAPS) for (const c of L.chunks) if (t >= c.t0 - .06 && t < c.t1) cur = c;
  if (!cur) return;
  // layout (stable: all words measured up front)
  g.save(); g.textBaseline = 'alphabetic';
  const items = cur.words.map(w => { g.font = fontOf(w.st); const tx = txtOf(w, w.st); return { w, tx, wd: g.measureText(tx).width, h: w.st === 'caps' ? S * 1.42 : w.st === 'serif' ? S * 1.3 : S }; });
  const sp = S * .3, lines = [[]]; let lw = 0;
  for (const it of items) { if (lines[lines.length - 1].length && lw + sp + it.wd > MAXW) { lines.push([]); lw = 0; } lines[lines.length - 1].push(it); lw += (lw ? sp : 0) + it.wd; }
  const lh = lines.map(l => Math.max(...l.map(i => i.h)) * LINEH), totH = lh.reduce((a, b) => a + b, 0);
  let y = o.y - totH / 2;
  const out = 1 - Math.max(0, Math.min(1, (t - (cur.t1 - .07)) / .07));
  lines.forEach((l, li) => {
    const wsum = l.reduce((a, i) => a + i.wd, 0) + sp * (l.length - 1); let x = o.W / 2 - wsum / 2; y += lh[li];
    for (const it of l) {
      const s = t - (it.w.t - .04), k = pop(s), active = t >= it.w.t - .04 && t < it.w.e + .05;
      if (k > 0) {
        const emph = !!it.w.st, sc = (emph ? .35 + .65 * k * 1.0 : .55 + .45 * k) * (active ? 1.06 : 1) * out, cx = x + it.wd / 2, cy = y - it.h * .35;
        g.save(); g.translate(cx, cy + (1 - Math.min(1, s / .12)) * 22); g.scale(sc, sc); if (emph && it.w.st !== 'serif') g.rotate(-.035 * Math.exp(-s * 3));
        g.font = fontOf(it.w.st); g.textAlign = 'center'; g.lineJoin = 'round';
        g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 0; g.shadowOffsetY = 7;
        g.lineWidth = it.w.st === 'caps' ? 18 : 15; g.strokeStyle = '#141019'; g.strokeText(it.tx, 0, it.h * .35);
        g.shadowColor = 'transparent'; g.fillStyle = colOf(it.w.st); g.fillText(it.tx, 0, it.h * .35);
        g.restore();
      }
      x += it.wd + sp;
    }
  });
  g.restore();
}
