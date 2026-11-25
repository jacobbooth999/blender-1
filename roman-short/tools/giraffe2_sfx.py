"""SFX timing for the vertical Short "Why Lions Are Scared of Giraffes" (giraffe_short.ts, videos_ink/giraffe2)."""
import json
d = "videos_ink/giraffe2"
W = json.load(open(f"{d}/words.json"))["words"]


def wt(i, w, n=1):
    for x in W:
        if x["i"] == i and "".join(c for c in x["word"].lower() if c.isalnum() or c == "'") == w:
            n -= 1
            if n == 0:
                return x["start"]
    raise KeyError(w)


cuts = [wt(0, "can't") - .1, wt(0, "can't", 2) - .1, wt(0, "and") - .1, wt(1, "to") - .1, wt(1, "so") - .1, wt(2, "but") - .1,
        wt(3, "zebras") - .1, wt(4, "if") - .1, wt(5, "and") - .1, wt(6, "one") - .1, wt(7, "that's") - .1, wt(7, "and") - .1]
ev = []
ev += [[wt(0, "scared") + .05, "sting", .5]]
ev += [[cuts[0] + .1 + k * .07, "tick", .5] for k in range(6)]                      # leaves shaking
ev += [[wt(0, "climb") + .15, "pop", 1.4], [wt(0, "hide") + .2, "pop", 1.4], [wt(0, "drinks") + .1, "pop", 1.5], [wt(0, "drinks"), "sting", .8]]
ev += [[cuts[3] + 1.0, "pop", .8]]                                                   # THE SPLITS label
ev += [[cuts[4] + k * .25, "tick", .45] for k in range(int((cuts[5] - cuts[4]) / .25))]  # clock
ev += [[cuts[5] + .1, "pop", .7], [wt(2, "lookout"), "pop", 1.0]]
t = cuts[6] + .1
while t < wt(3, "alarm"):
    ev.append([round(t, 3), "hoof", .45]); t += .42
ev += [[wt(3, "alarm"), "sting", .9], [wt(3, "alarm"), "pop", 1.2]]
t = cuts[7] + .1
while t < cuts[8] - .1:
    ev.append([round(t, 3), "hoof", .8 if int(t * 10) % 2 else 1.0]); t += .21
ev += [[wt(4, "sprint") + k * .12, "tick", .55] for k in range(10)]
ev += [[cuts[8] + k * .55, "heart", 1.0] for k in range(4)]
hit = wt(6, "kick") + .08
ev += [[hit - .2, "whoosh", 1.0], [hit, "sting", 1.2], [hit, "pop", 1.8], [hit + .02, "hoof", 1.6], [hit + .6, "hoof", 1.0], [hit + .7, "pop", .7]]
json.dump({"cuts": cuts, "events": ev}, open(f"{d}/sfx.json", "w"), indent=0)
print(len(ev), "events,", len(cuts), "cuts")
