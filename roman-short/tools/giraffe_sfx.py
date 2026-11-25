"""SFX timing for the giraffe video, from the same narration timings the picture uses (giraffe_video.ts)."""
import json, math
d = "videos_ink/giraffe"; S = json.load(open(f"{d}/timeline.json"))["sentences"]
def at(i, w=None):
    s = S[i]
    return s["start"] if not w else s["start"] + (s["end"] - s["start"]) * (s["text"].index(w) / len(s["text"]))
shots = [0, at(1), at(2), at(2, "allowing"), at(3), at(4), at(5), at(6), at(7), at(8), at(9), at(10), at(11), at(11, "and modern"), at(12)]
shots = [max(0, x - 0.12) for x in shots]
ev = [[at(0, w) + 0.07, "pop", 1.1] for w in ("outrun", "outclimb", "hide")]   # hook ticks
ev += [[shots[3] + 0.8, "pop"], [shots[3] + 1.4, "pop"], [shots[5] + 2.2, "pop", 1.3]]
ev += [[shots[2] + 0.4 + k * 0.9, "pop", 0.7] for k in range(3)]
t = shots[6] + 0.2
while t < shots[8] - 0.2: ev.append([round(t, 3), "hoof", 0.8 if int(t * 10) % 2 else 1.0]); t += 0.21
ev += [[shots[7] + k * 0.16, "tick", 0.6] for k in range(10)]
k = 0
while True:
    tp = (math.pi / 2 + 2 * math.pi * k) / 7.5; k += 1
    if tp < shots[9]: continue
    if tp > shots[11]: break
    ev.append([round(tp - 0.03, 3), "heart"])
ev += [[shots[11], "sting"], [shots[12] + 1.2, "pop", 1.2]]
json.dump({"cuts": shots[1:], "events": ev}, open(f"{d}/sfx.json", "w"), indent=0)
print(len(ev), "events")
