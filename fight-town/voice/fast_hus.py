# Edit pass: speed up the "HUS! HUS! HUS!" punches in the finished narration without touching anything else.
# Reads voice_slow_hus.wav / words_slow_hus.json (the delivered v1 narration), swaps each HUS triple for a
# time-stretched version starting at the same moment, fills the rest of the old slot with silence, and
# writes voice.wav + words.json (+ words_v1.json). Every other word keeps its exact timing.
import json, os, numpy as np, soundfile as sf, librosa
HERE = os.path.dirname(os.path.abspath(__file__))
RATE, GAP = 1.6, .03
y, SR = sf.read(os.path.join(HERE, "voice_slow_hus.wav"), dtype="float32")
data = json.load(open(os.path.join(HERE, "words_slow_hus.json")))
h0, _ = sf.read(os.path.join(HERE, "takes/hus0.wav"), dtype="float32")
slow = [h0, librosa.resample(h0, orig_sr=24000, target_sr=int(24000 / 1.05)), librosa.resample(h0, orig_sr=24000, target_sr=int(24000 / 1.1))]
fast = [librosa.effects.time_stretch(h, rate=RATE) for h in slow]
W = data["words"]; i = 0
while i < len(W):
    if not W[i].get("hus"): i += 1; continue
    t0 = W[i]["start"]; t1 = W[i + 2]["end"]
    a, b = int(round(t0 * SR)), int(round(t1 * SR))
    gain = np.abs(y[a:b]).max() / (max(np.abs(h).max() for h in slow) + 1e-9)   # match the level used in v1
    y[a:b] = 0; t = t0
    for k, h in enumerate(fast):
        n = int(round(t * SR)); y[n:n + len(h)] = h * gain
        W[i + k]["start"] = round(t, 3); W[i + k]["end"] = round(t + len(h) / SR, 3)
        t += len(h) / SR + GAP
    i += 3
sf.write(os.path.join(HERE, "voice.wav"), y, SR)
for n in ("words.json", "words_v1.json"): json.dump(data, open(os.path.join(HERE, n), "w"), indent=0)
print([ (w["start"], w["end"]) for w in W if w.get("hus")])
