// Voiceover demos: the same opening in several Kokoro voices + alternative hooks.
// usage: NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node tools/voice_demos.mjs
import { KokoroTTS } from "kokoro-js";
const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q8", device: "cpu" });
const OPEN = "How did giraffes survive in the wild, when they're practically impossible to hide? Millions of years ago, giraffe ancestors didn't look quite like the animals we see today.";
const HOOKS = {
  hookA: "A giraffe is five metres tall, bright orange, and covered in spots. So how on Earth has it survived this long?",
  hookB: "Here's a strange question. How do you survive in the wild, when you're the tallest, most obvious thing for miles?",
};
const VOICES = [["am_michael", 1.1], ["am_fenrir", 1.08], ["am_puck", 1.08], ["am_onyx", 1.05], ["bm_george", 1.05], ["bm_fable", 1.05], ["af_heart", 1.08], ["af_bella", 1.08], ["bf_emma", 1.05]];
for (const [v, sp] of VOICES) { const a = await tts.generate(OPEN, { voice: v, speed: sp }); await a.save(`voice/demos/open_${v}.wav`); console.log(v); }
for (const [k, text] of Object.entries(HOOKS)) for (const v of ["am_michael", "af_heart", "bm_george"]) { const a = await tts.generate(text, { voice: v, speed: 1.08 }); await a.save(`voice/demos/${k}_${v}.wav`); console.log(k, v); }
