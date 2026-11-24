// Narration for an ink video: one Kokoro clip per sentence, joined with gaps -> voice.wav + timeline.json
// usage: NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node tools/tts_script.mjs videos_ink/<name>
import { KokoroTTS } from "kokoro-js";
import fs from "node:fs";
const dir = process.argv[2], S = JSON.parse(fs.readFileSync(`${dir}/script.json`, "utf8"));
const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q8", device: "cpu" });
const lead = 0.4, parts = [], timeline = [];
let sr = 24000, t = lead;
for (const [i, s] of S.sentences.entries()) {
  const a = await tts.generate(s.say ?? s.text, { voice: S.voice, speed: S.speed ?? 1 });
  sr = a.sampling_rate;
  // trim leading/trailing near-silence
  let x = a.audio, i0 = 0, i1 = x.length - 1;
  while (i0 < x.length && Math.abs(x[i0]) < 0.004) i0++;
  while (i1 > i0 && Math.abs(x[i1]) < 0.004) i1--;
  x = x.slice(Math.max(0, i0 - 240), Math.min(x.length, i1 + 1200));
  const d = x.length / sr;
  timeline.push({ i, text: s.text, start: +t.toFixed(3), end: +(t + d).toFixed(3) });
  parts.push({ x, at: t });
  t += d + (s.gap ?? 0.4);
  console.log(i, d.toFixed(2), s.text.slice(0, 50));
}
const N = Math.ceil(t * sr), out = new Float32Array(N);
for (const p of parts) out.set(p.x, Math.round(p.at * sr));
// 16-bit mono WAV
const buf = Buffer.alloc(44 + N * 2);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 2, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(out[i] * 32767))), 44 + i * 2);
fs.writeFileSync(`${dir}/voice.wav`, buf);
fs.writeFileSync(`${dir}/timeline.json`, JSON.stringify({ duration: +t.toFixed(3), sentences: timeline }, null, 1));
console.log("total", t.toFixed(2), "s");
