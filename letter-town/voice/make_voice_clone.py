# Narration cloned from the user's reference TikTok voice (zero-shot ZipVoice via sherpa-onnx, models in
# voice/models/zipvoice/, prompt = first 8.46 s of the reference). Each phrase is fitted to the slot the Kokoro
# narration used (words_kokoro.json), so the already-rendered picture and burnt-in captions stay in sync.
# Writes voice.wav + words.json (+ identical words_v1.json).
import json, os, re, shutil
import numpy as np, soundfile as sf, librosa, sherpa_onnx as so
from phonemizer.backend.espeak.wrapper import EspeakWrapper
import espeakng_loader
HERE = os.path.dirname(os.path.abspath(__file__))
# same script text and helpers as make_voice.py (only the part before the Kokoro run)
exec(open(os.path.join(HERE, "make_voice.py")).read().split("k = Kokoro(")[0])

HERE = os.path.dirname(os.path.abspath(__file__)); Z = os.path.join(HERE, "models/zipvoice/")
PROMPT_TEXT = ("In this town, every time your heart gets broken, you get a million dollars. That's why the richest "
               "people here are the loneliest. And my family, we're the poorest in town.")
STEPS = 4

# English lexicon: the packaged lexicon is Chinese-only, so add espeak en-us IPA for every word we need
EspeakWrapper.set_library(espeakng_loader.get_library_path()); EspeakWrapper.set_data_path(espeakng_loader.get_data_path())
from phonemizer.backend import EspeakBackend
be = EspeakBackend("en-us", preserve_punctuation=False, with_stress=True, language_switch="remove-flags")
toks = set(l.rstrip("\n").split("\t")[0] for l in open(Z + "tokens.txt", encoding="utf8"))
words = sorted(set(re.findall(r"[A-Za-z0-9']+", PROMPT_TEXT + " " + " ".join(p for p, _ in PHRASES))))
with open(Z + "lexicon_en.txt", "w", encoding="utf8") as f:
    for w, p in zip(words, be.phonemize(words, strip=True)):
        t = " ".join(c for c in p.replace(" ", "") if c in toks)
        for ww in {w, w.lower(), w.upper()}: f.write(f"{ww} {t}\n")
    f.write(open(Z + "lexicon.txt", encoding="utf8").read())

tts = so.OfflineTts(so.OfflineTtsConfig(model=so.OfflineTtsModelConfig(zipvoice=so.OfflineTtsZipvoiceModelConfig(
    tokens=Z + "tokens.txt", encoder=Z + "encoder.int8.onnx", decoder=Z + "decoder.int8.onnx",
    vocoder=Z + "vocos_24khz.onnx", data_dir=Z + "espeak-ng-data", lexicon=Z + "lexicon_en.txt"), num_threads=8)))
P, psr = sf.read(Z + "ref_prompt.wav"); P = P.astype(np.float32).tolist()

src = os.path.join(HERE, "words_kokoro.json")
if not os.path.exists(src): shutil.copy(os.path.join(HERE, "words.json"), src)
old = json.load(open(src)); slots = old["phrases"]; total = old["duration"]

def gen(text, speed):
    a = tts.generate(text, prompt_text=PROMPT_TEXT, prompt_samples=P, sample_rate=psr, speed=speed, num_steps=STEPS)
    x = np.array(a.samples, np.float32)
    return (trim(x, a.sample_rate), a.sample_rate) if len(x) else (None, a.sample_rate)  # empty: phrase too short for speed

SR = 24000; y = np.zeros(int(total * SR) + SR, np.float32); out_words = []; out_phr = []
for pi, ((text, _), slot) in enumerate(zip(PHRASES, slots)):
    nxt = slots[pi + 1]["start"] if pi + 1 < len(slots) else total
    avail = nxt - slot["start"] - .06            # time until the next line (keeps a short breath)
    x, sr = gen(text, 1.0)                       # ZipVoice's speed option breaks on short lines, so stretch instead
    rate = max(1.0, len(x) / sr / avail)         # only compress when the line would overrun the next one
    if rate > 1.005: x = librosa.effects.time_stretch(x, rate=rate)
    x[-int(.01 * sr):] *= np.linspace(1, 0, int(.01 * sr))
    print(f"{pi:2d} {len(x) / sr:5.2f}s (kokoro {slot['end'] - slot['start']:5.2f}s)  compress {rate:.3f}  {text}", flush=True)
    i0 = int(slot["start"] * SR); y[i0:i0 + len(x)] += x
    toks_ = re.findall(r"[A-Za-z0-9']+", text); dur = len(x) / sr
    hop = int(.01 * sr); env = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop, hop)])
    quiet = np.where(env < 0.25 * np.median(env))[0] * 0.01
    wts = np.array([syl(w) for w in toks_]); cum = np.concatenate([[0], np.cumsum(wts) / wts.sum() * dur])
    for j in range(1, len(cum) - 1):
        near = quiet[np.abs(quiet - cum[j]) < 0.09]
        if len(near): cum[j] = near[np.argmin(np.abs(near - cum[j]))]
    t = slot["start"]
    for j, w in enumerate(toks_): out_words.append({"word": w, "start": round(t + cum[j], 3), "end": round(t + cum[j + 1], 3), "p": pi})
    out_phr.append({"text": text, "start": slot["start"], "end": round(slot["start"] + dur, 3)})
y = y[:int(total * SR)]; y = y / (np.abs(y).max() + 1e-9) * 0.8
sf.write(os.path.join(HERE, "voice.wav"), y, SR)
data = {"duration": total, "words": out_words, "phrases": out_phr}
for n in ("words.json", "words_v1.json"): json.dump(data, open(os.path.join(HERE, n), "w"), indent=1)
print("duration", total, "words", len(out_words))
