# Narration v2: one neutral, slightly robotic, deadpan AI narrator (Kokoro, 50/50 blend of am_adam + am_onyx,
# fast pace) for every line, including quotes. Key words get a slight emphasis lift, and there are short pauses
# before the big reveals. Writes voice.wav + words.json (same word sequence as words_v1.json, so the picture
# timeline can be re-timed word by word).
import json, os, re
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
SPEED = 1.22
# (text, pause after in seconds). Tight gaps keep a steady rhythm; longer ones sit before reveals.
PHRASES = [
    ("In this town,", 0.06), ("every time you lie,", 0.05), ("you earn money.", 0.22),
    ("Tell your teacher the dog ate your homework?", 0.10), ("Five dollars.", 0.20),
    ("Tell your wife you love her cooking?", 0.10), ("Fifty.", 0.24),
    ("The mayor lies so much, he lives in a golden mansion.", 0.30),
    ("But Sam has never told a single lie.", 0.38), ("Not once.", 0.24),
    ("So Sam lives in a cardboard box behind the bakery.", 0.18),
    ("He eats bread crusts for dinner, and everyone laughs at him.", 0.42),
    ("Then one night, Sam saw a giant crack in the dam above the town.", 0.20),
    ("He ran straight to the mayor.", 0.18),
    ("But fixing it would cost the mayor his gold.", 0.30),
    ("So he smiled, and wrote Sam a cheque for one million dollars.", 0.26),
    ("Tell everyone the dam is safe.", 0.12), ("One lie, and you'll never be poor again.", 0.34),
    ("Sam looked at the cheque.", 0.40), ("Then at his cardboard box.", 0.50),
    ("The next morning, the whole town was watching.", 0.18),
    ("Sam looked into the camera, and said,", 0.42),
    ("The dam is breaking.", 0.10), ("Run to the hill.", 0.30), ("Now.", 0.42),
    ("Nobody in town believed each other anymore.", 0.18), ("But everyone knew one thing.", 0.45),
    ("Sam never lies.", 0.26), ("So they ran.", 0.30),
    ("Minutes later,", 0.38), ("the dam burst.", 0.30),
    ("The golden mansion washed away.", 0.14), ("But every single person was safe.", 0.40),
    ("The town built Sam a real house, with a statue out front.", 0.26),
    ("He's still the poorest man in town.", 0.48),
    ("But he's the only one everybody trusts.", 0.0),
]
EMPH = {'lie', 'money', 'five', 'fifty', 'golden', 'never', 'single', 'once', 'cardboard', 'crusts', 'everyone', 'giant',
        'crack', 'gold', 'smiled', 'million', 'safe', 'poor', 'whole', 'breaking', 'hill', 'now', 'nobody', 'one', 'lies',
        'ran', 'burst', 'every', 'real', 'statue', 'poorest', 'only', 'trusts', 'camera'}
LEAD, TAIL = 0.12, 2.6

def syl(w):
    w = w.lower(); n = len(re.findall(r"[aeiouy]+", w)) - (1 if w.endswith("e") and len(w) > 3 else 0)
    return max(1, n) + 0.15 * len(w)
def trim(x, sr, thr=0.008):
    i = np.where(np.abs(x) > thr)[0]; return x[max(0, i[0] - int(.01 * sr)): i[-1] + int(.03 * sr)]

k = Kokoro(os.path.join(HERE, "models/kokoro.onnx"), os.path.join(HERE, "models/voices.bin"))
STYLE = .5 * k.get_voice_style('am_adam') + .5 * k.get_voice_style('am_onyx')
sr0 = 24000; parts = [np.zeros(int(LEAD * sr0))]; words = []; phrases = []; t = LEAD
for pi, (text, gap) in enumerate(PHRASES):
    x, sr = k.create(text, voice=STYLE, speed=SPEED, lang="en-us")
    x = trim(np.asarray(x, np.float32), sr); dur = len(x) / sr
    toks = re.findall(r"[A-Za-z0-9',$]+", text.replace(",", ""))
    hop = int(.01 * sr); env = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop, hop)])
    quiet = np.where(env < 0.25 * np.median(env))[0] * 0.01
    wts = np.array([syl(w) for w in toks]); cum = np.concatenate([[0], np.cumsum(wts) / wts.sum() * dur])
    for j in range(1, len(cum) - 1):
        near = quiet[np.abs(quiet - cum[j]) < 0.09]
        if len(near): cum[j] = near[np.argmin(np.abs(near - cum[j]))]
    # emphasis: +3 dB lift on key words with short ramps
    g = np.ones(len(x))
    for j, w in enumerate(toks):
        if w.lower().strip("'") in EMPH:
            a, b = int(cum[j] * sr), int(cum[j + 1] * sr); r = int(.02 * sr)
            seg = np.ones(b - a) * 1.41; seg[:r] = np.linspace(1, 1.41, min(r, b - a))[:len(seg[:r])]; seg[-r:] = np.linspace(1.41, 1, r)[-len(seg[-r:]):]
            g[a:b] = np.maximum(g[a:b], seg)
        words.append({"word": w, "start": round(t + cum[j], 3), "end": round(t + cum[j + 1], 3), "p": pi})
    x = x * g
    phrases.append({"text": text, "start": round(t, 3), "end": round(t + dur, 3)})
    parts.append(x); t += dur
    parts.append(np.zeros(int(gap * sr))); t += gap
parts.append(np.zeros(int(TAIL * sr0)))
y = np.concatenate(parts)
# slight robotic colour: a short metallic comb (4 ms) + a touch of ring modulation, low-cut, gentle compression
d = int(.004 * sr0); comb = np.zeros_like(y); comb[d:] = y[:-d]
tt = np.arange(len(y)) / sr0
y = y + .28 * comb + .06 * y * np.sin(2 * np.pi * 55 * tt)
Y = np.fft.rfft(y); f = np.fft.rfftfreq(len(y), 1 / sr0); Y *= 1 / (1 + (110 / np.maximum(f, 1)) ** 4); y = np.fft.irfft(Y, len(y))
y = np.tanh(y / (np.abs(y).max() + 1e-9) * 2.2) / np.tanh(2.2)
y = y / (np.abs(y).max() + 1e-9) * 0.8
sf.write(os.path.join(HERE, "voice.wav"), y, sr0)
json.dump({"duration": round(len(y) / sr0, 3), "words": words, "phrases": phrases}, open(os.path.join(HERE, "words.json"), "w"), indent=1)
old = json.load(open(os.path.join(HERE, "words_v1.json")))["words"]
assert [w["word"] for w in old] == [w["word"] for w in words], "word sequence changed"
print("duration", round(len(y) / sr0, 2), "words", len(words))
