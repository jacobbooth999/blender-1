# Narration with the project's default "Casual YouTuber" voice (see CLAUDE.md): Kokoro, 50/50 am_puck + am_liam,
# speed 1.18, plain (no effects), loudness normalised later in the mix. Writes voice.wav + words.json.
import json, os, re
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
SPEED = 1.18
PHRASES = [  # (text, pause after)
    ("In this town, every morning,", 0.05), ("everyone gets a letter from their future self.", 0.30),
    ("Buy gold today.", 0.18), ("Don't eat the fish on Tuesday.", 0.18), ("Do not marry Kevin.", 0.30),
    ("Nobody here ever makes a mistake.", 0.30), ("Except Max.", 0.30),
    ("Max has never gotten a single letter.", 0.12), ("Every morning, his mailbox is empty.", 0.25),
    ("He buys the wrong stocks, he eats the bad fish, and everyone thinks he's cursed.", 0.40),
    ("Then one morning, his mailbox exploded.", 0.30),
    ("Hundreds of letters. All from future Max.", 0.20), ("And every single one said the same thing.", 0.35),
    ("Do not let the mayor do what he's about to do.", 0.45),
    ("So that night, Max sneaked into the mayor's mansion.", 0.20),
    ("He crawled past the guards, hid behind the curtains, and watched the mayor open his own letter.", 0.40),
    ("It said: burn the town to the ground.", 0.40),
    ("And the mayor always does what his letter says.", 0.35),
    ("Max ran to warn everyone.", 0.15), ("But who believes the cursed kid with no letters?", 0.30),
    ("The guards caught him, and locked him in the basement.", 0.35),
    ("No letter could tell him what to do now.", 0.25),
    ("So for the first time, someone in this town had to figure it out alone.", 0.30),
    ("He stacked the boxes, squeezed through the tiny window, and sprinted to the square.", 0.25),
    ("The mayor was striking the first match.", 0.30), ("Max dove.", 0.35),
    ("The match landed in a puddle.", 0.30), ("And the mayor's letter fell out of his pocket.", 0.20),
    ("The whole town read it.", 0.35), ("The mayor got the basement. Max got a parade.", 0.40),
    ("And the next morning, there was finally one letter in Max's mailbox.", 0.40),
    ("It said: told you.", 0.0),
]
LEAD, TAIL = 0.12, 2.6

def syl(w):
    w = w.lower(); n = len(re.findall(r"[aeiouy]+", w)) - (1 if w.endswith("e") and len(w) > 3 else 0)
    return max(1, n) + 0.15 * len(w)
def trim(x, sr, thr=0.008):
    i = np.where(np.abs(x) > thr)[0]; return x[max(0, i[0] - int(.01 * sr)): i[-1] + int(.03 * sr)]

k = Kokoro(os.path.join(HERE, "models/kokoro.onnx"), os.path.join(HERE, "models/voices.bin"))
STYLE = .5 * k.get_voice_style('am_puck') + .5 * k.get_voice_style('am_liam')
sr0 = 24000; parts = [np.zeros(int(LEAD * sr0))]; words = []; phrases = []; t = LEAD
for pi, (text, gap) in enumerate(PHRASES):
    x, sr = k.create(text, voice=STYLE, speed=SPEED, lang="en-us")
    x = trim(np.asarray(x, np.float32), sr); dur = len(x) / sr
    toks = re.findall(r"[A-Za-z0-9']+", text)
    hop = int(.01 * sr); env = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop, hop)])
    quiet = np.where(env < 0.25 * np.median(env))[0] * 0.01
    wts = np.array([syl(w) for w in toks]); cum = np.concatenate([[0], np.cumsum(wts) / wts.sum() * dur])
    for j in range(1, len(cum) - 1):
        near = quiet[np.abs(quiet - cum[j]) < 0.09]
        if len(near): cum[j] = near[np.argmin(np.abs(near - cum[j]))]
    for j, w in enumerate(toks):
        words.append({"word": w, "start": round(t + cum[j], 3), "end": round(t + cum[j + 1], 3), "p": pi})
    phrases.append({"text": text, "start": round(t, 3), "end": round(t + dur, 3)})
    parts.append(x); t += dur; parts.append(np.zeros(int(gap * sr))); t += gap
parts.append(np.zeros(int(TAIL * sr0)))
y = np.concatenate(parts); y = y / (np.abs(y).max() + 1e-9) * 0.8
sf.write(os.path.join(HERE, "voice.wav"), y, sr0)
data = {"duration": round(len(y) / sr0, 3), "words": words, "phrases": phrases}
json.dump(data, open(os.path.join(HERE, "words.json"), "w"), indent=1)
json.dump(data, open(os.path.join(HERE, "words_v1.json"), "w"), indent=1)   # identity time-warp for the renderer
print("duration", data["duration"], "words", len(words))
