# Narration with Kokoro (neural TTS) plus per-word timings (words.json).
# Each phrase is synthesized on its own; word times inside a phrase are spread by syllable weight and then
# snapped to the nearest real pause in the audio. Quoted lines use a second voice (the mayor / Sam).
import json, os, re, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
NARR, SPEED = "am_michael", 1.1
# (text, gap after in seconds, voice or None for narrator, speed)
PHRASES = [
    ("In this town,", 0.08, None),
    ("every time you lie,", 0.06, None),
    ("you earn money.", 0.30, None),
    ("Tell your teacher the dog ate your homework?", 0.12, None),
    ("Five dollars.", 0.28, None),
    ("Tell your wife you love her cooking?", 0.12, None),
    ("Fifty.", 0.30, None),
    ("The mayor lies so much, he lives in a golden mansion.", 0.40, None),
    ("But Sam has never told a single lie.", 0.15, None),
    ("Not once.", 0.30, None),
    ("So Sam lives in a cardboard box behind the bakery.", 0.25, None),
    ("He eats bread crusts for dinner, and everyone laughs at him.", 0.45, None),
    ("Then one night, Sam saw a giant crack in the dam above the town.", 0.25, None),
    ("He ran straight to the mayor.", 0.25, None),
    ("But fixing it would cost the mayor his gold.", 0.25, None),
    ("So he smiled, and wrote Sam a cheque for one million dollars.", 0.30, None),
    ("Tell everyone the dam is safe.", 0.15, "bm_george"),
    ("One lie, and you'll never be poor again.", 0.40, "bm_george"),
    ("Sam looked at the cheque.", 0.20, None),
    ("Then at his cardboard box.", 0.50, None),
    ("The next morning, the whole town was watching.", 0.25, None),
    ("Sam looked into the camera, and said,", 0.20, None),
    ("The dam is breaking. Run to the hill. Now.", 0.45, "am_adam"),
    ("Nobody in town believed each other anymore.", 0.20, None),
    ("But everyone knew one thing.", 0.15, None),
    ("Sam never lies.", 0.30, None),
    ("So they ran.", 0.35, None),
    ("Minutes later, the dam burst.", 0.35, None),
    ("The golden mansion washed away.", 0.15, None),
    ("But every single person was safe.", 0.45, None),
    ("The town built Sam a real house, with a statue out front.", 0.30, None),
    ("He's still the poorest man in town.", 0.20, None),
    ("But he's the only one everybody trusts.", 0.0, None),
]
LEAD, TAIL = 0.12, 2.6   # tail leaves room for the end question card

def syl(w):
    w = w.lower()
    n = len(re.findall(r"[aeiouy]+", w)) - (1 if w.endswith("e") and len(w) > 3 else 0)
    return max(1, n) + 0.15 * len(w)

def trim(x, sr, thr=0.008):
    i = np.where(np.abs(x) > thr)[0]
    return x[max(0, i[0] - int(.01 * sr)): i[-1] + int(.03 * sr)]

k = Kokoro(os.path.join(HERE, "models/kokoro.onnx"), os.path.join(HERE, "models/voices.bin"))
sr0 = 24000; parts = [np.zeros(int(LEAD * sr0))]; words = []; phrases = []; t = LEAD
for pi, (text, gap, voice) in enumerate(PHRASES):
    x, sr = k.create(text, voice=voice or NARR, speed=SPEED, lang="en-us")
    x = trim(np.asarray(x, np.float32), sr); dur = len(x) / sr
    toks = re.findall(r"[A-Za-z0-9',$]+", text.replace(",", ""))
    hop = int(.01 * sr); env = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop, hop)])
    quiet = np.where(env < 0.25 * np.median(env))[0] * 0.01
    wts = np.array([syl(w) for w in toks]); cum = np.concatenate([[0], np.cumsum(wts) / wts.sum() * dur])
    for j in range(1, len(cum) - 1):
        near = quiet[np.abs(quiet - cum[j]) < 0.09]
        if len(near): cum[j] = near[np.argmin(np.abs(near - cum[j]))]
    for j, w in enumerate(toks):
        words.append({"word": w, "start": round(t + cum[j], 3), "end": round(t + cum[j + 1], 3), "p": pi})
    phrases.append({"text": text, "start": round(t, 3), "end": round(t + dur, 3), "voice": voice or NARR})
    parts.append(x); t += dur
    parts.append(np.zeros(int(gap * sr))); t += gap
parts.append(np.zeros(int(TAIL * sr0)))
y = np.concatenate(parts); y = y / (np.abs(y).max() + 1e-9) * 0.8
sf.write(os.path.join(HERE, "voice.wav"), y, sr0)
json.dump({"duration": round(len(y) / sr0, 3), "words": words, "phrases": phrases},
          open(os.path.join(HERE, "words.json"), "w"), indent=1)
print("duration", round(len(y) / sr0, 2), "words", len(words))
