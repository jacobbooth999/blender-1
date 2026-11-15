# Placeholder narration with espeak-ng + MBROLA (mb-us2), plus word timings (words.json).
# Each sentence is synthesized whole; word times inside it come from each word's solo duration, scaled to fit the
# sentence's speech span. Replace voice/voice.wav + voice/words.json with a real narration later (same schema).
import json, os, re, subprocess, sys, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(os.path.dirname(HERE), "voice")
VOICE, SPEED, SR = "mb-us2", 178, 48000
PARAS = [
 ["Rome conquered half the known world, and its secret weapon wasn't the sword.", "It was the shovel."],
 ["It's around one hundred B C.", "Rome is a city of farmers on seven hills, surrounded by neighbours who would really like to burn it down."],
 ["So every Roman soldier carries his own gear on his back.", "Armour, food, a cooking pot and a shovel.", "Thirty kilos of it.", "People called them Marius's mules."],
 ["At the end of every day's march, they don't just pitch tents.", "They dig a ditch, pile up a wall, and build a whole fortified camp.", "Every single night."],
 ["Behind the army come the roads.", "Dead straight, layer on layer of stone, gravel and sand.", "Eventually more than eighty thousand kilometres of them."],
 ["An army that once took a month to arrive now shows up in a week."],
 ["Then, in fifty five B C, Julius Caesar wants to cross the Rhine to scare the tribes on the other side.", "There are no boats.", "So his men build a wooden bridge across the whole river.", "In ten days."],
 ["Luckily, the tribes were very impressed.", "Unluckily for the bridge, Caesar walked back eighteen days later and had it torn down."],
 ["Here's the real trick.", "An empire works like a pizza chain.", "Winning a town is opening a new branch.", "Keeping it means the delivery has to arrive hot.", "Roads were Rome's delivery network.", "Soldiers, letters, taxes and grain, all moving fast."],
 ["And Rome didn't keep the people it beat as enemies.", "It slowly made them Roman.", "Their sons joined the legions, picked up shovels, and built the next road.", "By two twelve A D, almost every free person in the empire was a citizen."],
 ["At its peak the empire ran from Scotland to Iraq, with around sixty million people.", "And in the middle of Rome stood a golden milestone, where every road began."],
 ["All roads really did lead to Rome.", "Which was great, right up until four ten A D, when an army of Goths followed one straight to the gate."],
]
GAP_S, GAP_P, LEAD, TAIL = 0.28, 0.55, 0.35, 1.2

def synth(text, path):
    subprocess.run(["espeak-ng", "-v", VOICE, "-s", str(SPEED), "-w", path, text], check=True, capture_output=True)
    with wave.open(path) as w:
        sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return x, sr

def trim(x, sr, thr=0.01):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0: return x[:0]
    return x[max(0, idx[0] - int(0.01 * sr)): idx[-1] + int(0.02 * sr)]

def resample(x, sr):
    n = int(round(len(x) * SR / sr)); t = np.linspace(0, len(x) - 1, n)
    return np.interp(t, np.arange(len(x)), x)

tmp = "/tmp/_v.wav"; audio = [np.zeros(int(LEAD * SR))]; t = LEAD; words = []; sents = []
for pi, para in enumerate(PARAS):
    for si, s in enumerate(para):
        x, sr = synth(s, tmp); x = resample(trim(x, sr), sr); dur = len(x) / SR
        toks = re.findall(r"[A-Za-z0-9']+", s)
        solo = []
        for w in toks:
            y, sr2 = synth(w, tmp); solo.append(max(0.08, len(trim(y, sr2)) / sr2))
        k = dur / sum(solo); acc = t
        for w, d in zip(toks, solo):
            words.append({"word": w, "start": round(acc, 3), "end": round(acc + d * k, 3), "s": len(sents)}); acc += d * k
        sents.append({"text": s, "start": round(t, 3), "end": round(t + dur, 3), "para": pi})
        audio.append(x); t += dur
        g = GAP_P if si == len(para) - 1 else GAP_S
        audio.append(np.zeros(int(g * SR))); t += g
audio.append(np.zeros(int(TAIL * SR)))
y = np.concatenate(audio); y = y / (np.max(np.abs(y)) + 1e-9) * 0.7
os.makedirs(OUT, exist_ok=True)
with wave.open(os.path.join(OUT, "voice.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
json.dump({"duration": round(len(y) / SR, 3), "words": words, "sentences": sents}, open(os.path.join(OUT, "words.json"), "w"), indent=1)
print("duration", len(y) / SR, "words", len(words))
