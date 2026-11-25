// Word timings for a narration: Whisper (transformers.js) with word-level timestamps, run per sentence clip so the
// recognised words can be matched back onto the script's own words. Writes words.json next to timeline.json.
// usage: NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node tools/word_times.mjs videos_ink/<name>
import { pipeline } from "@huggingface/transformers";
import fs from "node:fs";
const dir = process.argv[2];
const TL = JSON.parse(fs.readFileSync(`${dir}/timeline.json`, "utf8"));
const wav = fs.readFileSync(`${dir}/voice.wav`), sr = wav.readUInt32LE(24), n = (wav.length - 44) / 2;
const pcm = new Float32Array(n); for (let i = 0; i < n; i++) pcm[i] = wav.readInt16LE(44 + i * 2) / 32768;
const resample = (x, from, to) => { const m = Math.floor(x.length * to / from), y = new Float32Array(m); for (let i = 0; i < m; i++) { const p = i * from / to, k = Math.floor(p), f = p - k; y[i] = (x[k] ?? 0) * (1 - f) + (x[k + 1] ?? 0) * f; } return y; };
const asr = await pipeline("automatic-speech-recognition", "Xenova/whisper-base.en", { dtype: "fp32" });
const norm = (w) => w.toLowerCase().replace(/[^a-z0-9']/g, "");
const out = [];
for (const s of TL.sentences) {
  const a = Math.max(0, Math.floor((s.start - 0.05) * sr)), b = Math.min(n, Math.ceil((s.end + 0.1) * sr));
  const clip = resample(pcm.subarray(a, b), sr, 16000), off = a / sr;
  const r = await asr(clip, { return_timestamps: "word" });
  const rec = (r.chunks ?? []).map((c) => ({ w: norm(c.text), s: off + c.timestamp[0], e: off + (c.timestamp[1] ?? c.timestamp[0] + 0.3) }));
  // map recogniser words onto the script words in order (fuzzy: same word, or digits vs spoken numbers)
  const words = s.text.split(/\s+/).filter(Boolean);
  let j = 0;
  const mapped = words.map((w, i) => {
    const key = norm(w); let hit = -1;
    for (let k = j; k < Math.min(rec.length, j + 4); k++) if (rec[k].w === key || (rec[k].w && key && (rec[k].w.startsWith(key.slice(0, 4)) || key.startsWith(rec[k].w.slice(0, 4))))) { hit = k; break; }
    if (hit >= 0) { j = hit + 1; return { word: w, start: rec[hit].s, end: rec[hit].e, i: s.i }; }
    return { word: w, start: null, end: null, i: s.i };
  });
  // fill gaps by interpolating between known neighbours (by characters)
  for (let i = 0; i < mapped.length; i++) if (mapped[i].start === null) {
    let p = i - 1; while (p >= 0 && mapped[p].start === null) p--;
    let q = i + 1; while (q < mapped.length && mapped[q].start === null) q++;
    const t0 = p >= 0 ? mapped[p].end : s.start, t1 = q < mapped.length ? mapped[q].start : s.end;
    const span = mapped.slice(p + 1, q), tot = span.reduce((a, m) => a + m.word.length, 0) || 1;
    let acc = t0; for (const m of span) { const d = (t1 - t0) * m.word.length / tot; m.start = acc; m.end = acc + d; acc += d; }
  }
  const hits = mapped.filter((m) => m.start !== null).length;
  out.push(...mapped.map((m) => ({ ...m, start: +m.start.toFixed(3), end: +m.end.toFixed(3) })));
  console.log(s.i, `${rec.length} recognised / ${words.length} words`, rec.map((x) => x.w).join(" ").slice(0, 70));
  void hits;
}
fs.writeFileSync(`${dir}/words.json`, JSON.stringify({ words: out }, null, 0));
console.log("words", out.length);
