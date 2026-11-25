"""SFX timing for the giraffe video, from the same narration and word timings the picture uses (giraffe_video.ts)."""
import json, math
d = "videos_ink/giraffe"
S = json.load(open(f"{d}/timeline.json"))["sentences"]
W = json.load(open(f"{d}/words.json"))["words"]


def at(i, w=None):
    s = S[i]
    return s["start"] if not w else s["start"] + (s["end"] - s["start"]) * (s["text"].index(w) / len(s["text"]))


def wt(i, w):
    for x in W:
        if x["i"] == i and "".join(c for c in x["word"].lower() if c.isalnum() or c == "'") == w:
            return x["start"]
    raise KeyError(w)


# main shots (same order as giraffe_video.ts after the hook) and the extra hook cuts
shots = [max(0, x - 0.12) for x in [0, at(1), at(2), at(2, "allowing"), at(3), at(4), at(5), at(6), at(7), at(8), at(9), at(10), at(11), at(11, "and modern"), at(12)]]
hook_cuts = [wt(0, "outclimb") - 0.24, wt(0, "or") - 0.12, wt(0, "so") - 0.15]
cuts = sorted(shots[1:] + hook_cuts)

ev = []
# hook: chase hooves, the three X stamps, question-mark pops
ev += [[round(0.1 + k * 0.17, 3), "hoof", 0.9] for k in range(int((hook_cuts[0] - 0.1) / 0.17))]
ev += [[wt(0, "outrun") + 0.12, "pop", 1.4], [wt(0, "outclimb") + 0.3, "pop", 1.4], [wt(0, "hide") + 0.25, "pop", 1.4]]
ev += [[hook_cuts[2] + dd, "pop", 0.6] for dd in (0.1, 0.35, 0.6, 0.85)]
# natural selection reveals, check / cross, predator spotted
ev += [[shots[2] + 0.4 + k * 0.9, "pop", 0.7] for k in range(3)]
ev += [[shots[3] + 0.8, "pop"], [shots[3] + 1.4, "pop"], [shots[5] + 2.2, "pop", 1.3]]
# hooves while running, speedometer ticks
t = shots[6] + 0.2
while t < shots[8] - 0.2:
    ev.append([round(t, 3), "hoof", 0.8 if int(t * 10) % 2 else 1.0]); t += 0.21
ev += [[shots[7] + k * 0.16, "tick", 0.6] for k in range(10)]
# heartbeats synced to the drawn pulse sin(t*7.5)^4
k = 0
while True:
    tp = (math.pi / 2 + 2 * math.pi * k) / 7.5; k += 1
    if tp < shots[9]: continue
    if tp > shots[11]: break
    ev.append([round(tp - 0.03, 3), "heart"])
ev += [[shots[11], "sting"], [shots[12] + 1.2, "pop", 1.2]]
json.dump({"cuts": cuts, "events": ev}, open(f"{d}/sfx.json", "w"), indent=0)
print(len(ev), "events,", len(cuts), "cuts")
