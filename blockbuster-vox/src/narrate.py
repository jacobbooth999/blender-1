"""Sentence-level narration: one continuous track, pauses only between sentences.

Each sentence is synthesized whole (natural flow). Beat boundaries that fall inside
a sentence are located by synthesizing the sentence up to that word and measuring
its length. Writes:
  narration/voice/full.wav   continuous narration
  build/durations.json       beat lengths (seconds)
  build/words.json           per-beat word times, relative to each beat's start

python3 narrate.py MODEL_DIR [voice] [speed] [pause]
"""
import os, sys, json, re
import numpy as np
import soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from render import beats, BUILD, ROOT
from kokoro_onnx import Kokoro

LEAD = 0.35   # silence before the first sentence
MAX_GAP = 0.12  # longest silence allowed inside a sentence

def squeeze_gaps(a, sr, thresh=0.012, min_len=0.14):
    """Shorten breaths/pauses inside a sentence to MAX_GAP (with short fades)."""
    hop = int(0.01 * sr)
    e = np.array([np.sqrt(np.mean(a[i:i + hop] ** 2)) for i in range(0, len(a) - hop, hop)])
    quiet = e < thresh
    out, last, k = [], 0, 0
    while k < len(quiet):
        if quiet[k]:
            j = k
            while j < len(quiet) and quiet[j]:
                j += 1
            if (j - k) * 0.01 >= min_len and k > 0 and j < len(quiet):
                s0, s1 = k * hop, j * hop
                keep = int(MAX_GAP * sr)
                out.append(a[last:s0 + keep // 2])
                tail = a[s1 - keep // 2:s1]
                out.append(tail)
                last = s1
            k = j
        else:
            k += 1
    out.append(a[last:])
    return np.concatenate(out)
TAIL = 1.2    # hold after the last sentence

def main():
    mdir = sys.argv[1]
    voice = sys.argv[2] if len(sys.argv) > 2 else "af_heart"
    speed = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
    pause = float(sys.argv[4]) if len(sys.argv) > 4 else 0.5
    k = Kokoro(os.path.join(mdir, "kokoro-v1.0.onnx"), os.path.join(mdir, "voices-v1.0.bin"))
    cache = {}

    def tts(text):
        if text not in cache:
            a, sr = k.create(text, voice=voice, speed=speed, lang="en-us")
            a = np.asarray(a, np.float32)
            nz = np.nonzero(np.abs(a) > 0.01)[0]
            a = a[max(0, nz[0] - int(0.02 * sr)): nz[-1] + int(0.05 * sr)] if len(nz) else a
            cache[text] = (squeeze_gaps(a, sr), sr)
        return cache[text]

    # global word list with the beat each word belongs to
    W = []
    for bi, b in enumerate(beats()):
        for w in b["text"].split():
            W.append((w, bi))
    sents, cur = [], []
    for gi, (w, bi) in enumerate(W):
        cur.append(gi)
        if w.endswith((".", "?")):
            sents.append(cur); cur = []
    if cur:
        sents.append(cur)

    sr = 24000
    track = [np.zeros(int(LEAD * sr), np.float32)]
    t = LEAD
    word_t = [None] * len(W)       # global start time of each word
    seg_end = [None] * len(W)      # end of the speech segment the word sits in
    for si, idx in enumerate(sents):
        words = [W[g][0] for g in idx]
        a, sr = tts(" ".join(words))
        L = len(a) / sr
        # boundaries: positions inside the sentence where the beat changes
        cuts = [0.0]
        pos = [0]
        for j in range(1, len(idx)):
            if W[idx[j]][1] != W[idx[j - 1]][1]:
                pa, _ = tts(" ".join(words[:j]))
                cuts.append(min(L - 0.2, max(cuts[-1] + 0.3, len(pa) / sr - 0.08)))
                pos.append(j)
        cuts.append(L)
        pos.append(len(idx))
        # spread words inside each segment by length
        for s_ in range(len(pos) - 1):
            j0, j1 = pos[s_], pos[s_ + 1]
            c0, c1 = cuts[s_], cuts[s_ + 1]
            wts = [len(re.sub(r"[^A-Za-z']", "", words[j])) + 2.0 for j in range(j0, j1)]
            tot = sum(wts)
            acc = 0
            for j, wt in zip(range(j0, j1), wts):
                word_t[idx[j]] = t + c0 + (c1 - c0) * acc / tot
                seg_end[idx[j]] = t + c1
                acc += wt
        track.append(a)
        gap = pause if si < len(sents) - 1 else TAIL
        track.append(np.zeros(int(gap * sr), np.float32))
        t += L + gap
        print(f"sentence {si + 1}/{len(sents)}  {L:.2f}s", flush=True)

    full = np.concatenate(track)
    vdir = os.path.join(ROOT, "narration", "voice")
    os.makedirs(vdir, exist_ok=True)
    sf.write(os.path.join(vdir, "full.wav"), full, sr, subtype="PCM_16")
    total = len(full) / sr

    nb = len(beats())
    starts = []
    for bi in range(nb):
        g = next(i for i, (w, b) in enumerate(W) if b == bi)
        starts.append(0.0 if bi == 0 else max(0.0, word_t[g] - 0.06))
    starts.append(total)
    durs = [round(starts[i + 1] - starts[i], 3) for i in range(nb)]
    words = [[{"w": w, "t": round(word_t[g] - starts[b], 3)} for g, (w, b) in enumerate(W) if b == bi] for bi in range(nb)]
    json.dump(durs, open(os.path.join(BUILD, "durations.json"), "w"))
    json.dump(words, open(os.path.join(BUILD, "words.json"), "w"))
    print("total", round(total, 1), "min beat", min(durs), "max beat", max(durs))

if __name__ == "__main__":
    main()
