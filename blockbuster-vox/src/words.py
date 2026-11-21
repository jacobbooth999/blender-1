"""Estimate when each word is spoken inside each beat's narration clip.

Speech is split at its longest pauses (matched to sentence ends), then words are
spread inside each sentence by length. Accurate to roughly +-0.15 s, which is
enough to make visuals land on the words they illustrate.

python3 words.py   -> build/words.json  [[{"w": "Dallas", "t": 1.23}, ...], ...]
"""
import os, sys, json, re
import numpy as np
import soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from render import beats, BUILD, ROOT

VOICE_OFFSET = 0.08  # audio.py places each clip this far into its beat

def pauses(a, sr, hop=0.01, thresh=0.012, min_len=0.06):
    n = int(hop * sr)
    e = np.array([np.sqrt(np.mean(a[i:i + n] ** 2)) for i in range(0, len(a) - n, n)])
    quiet = e < thresh
    out, start = [], None
    for k, q in enumerate(quiet):
        if q and start is None:
            start = k
        if not q and start is not None:
            if (k - start) * hop >= min_len and start > 0:
                out.append((start * hop, k * hop))
            start = None
    speech_start = next((k * hop for k, q in enumerate(quiet) if not q), 0.0)
    speech_end = len(quiet) * hop - next((k * hop for k, q in enumerate(quiet[::-1]) if not q), 0.0)
    return out, speech_start, speech_end

def weight(w):
    core = re.sub(r"[^A-Za-z']", "", w)
    return len(core) + 2.0

def main():
    allw = []
    for i, b in enumerate(beats()):
        a, sr = sf.read(os.path.join(ROOT, "narration", "voice", f"B{i + 1:03d}.wav"), dtype="float32")
        ps, s0, s1 = pauses(a, sr)
        words = b["text"].split()
        # sentence groups
        groups, cur = [], []
        for w in words:
            cur.append(w)
            if w.endswith((".", "?")):
                groups.append(cur); cur = []
        if cur:
            groups.append(cur)
        k = len(groups) - 1
        inner = [p for p in ps if s0 + 0.1 < p[0] < s1 - 0.1]
        cuts = sorted(sorted(inner, key=lambda p: p[1] - p[0], reverse=True)[:k])
        if len(cuts) < k:  # fall back to proportional boundaries
            tot = sum(weight(w) for w in words)
            acc, cuts = 0, []
            for g in groups[:-1]:
                acc += sum(weight(w) for w in g)
                t = s0 + (s1 - s0) * acc / tot
                cuts.append((t, t))
        bounds = [s0] + [c for p in cuts for c in p] + [s1]
        out = []
        for gi, g in enumerate(groups):
            g0, g1 = bounds[2 * gi], bounds[2 * gi + 1]
            tot = sum(weight(w) for w in g)
            acc = 0
            for w in g:
                out.append({"w": w, "t": round(VOICE_OFFSET + g0 + (g1 - g0) * acc / tot, 3)})
                acc += weight(w)
        allw.append(out)
    json.dump(allw, open(os.path.join(BUILD, "words.json"), "w"))
    print("beats", len(allw), "example", [(x["w"], x["t"]) for x in allw[1]])

if __name__ == "__main__":
    main()
