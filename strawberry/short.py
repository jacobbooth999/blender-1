"""Compilation short: several fruits each eat a mini version of themselves, one after another (~8 s each).

Run one segment:  python3 short.py --index 0 [--scale 0.6667 --samples 16]
Fruits/order come from ORDER. Frames go to out/comp/frames/f%04d.png (global numbering) and sound cues to
out/comp/events_<index>.json; comp_audio.py merges the cues into one ASMR track.
"""
import argparse
import json
import math
import os
import sys

import bpy  # noqa: F401
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import anim as A  # noqa: E402
import scene as SC  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out", "comp")
ORDER = ["strawberry", "watermelon", "peach", "kiwi"]
FPS = 24
SEG = 8.25                               # seconds per fruit
C0, C1, C2 = 1.0, 3.5, 5.6               # bites (teeth close)
CHEWS = [(1.4, 3.0), (3.9, 5.0), (6.0, 7.0)]
GULP, HOP, HAPPY = 7.12, 7.55, 7.3
ease, track, pulse = A.ease, A.track, A.pulse


class Seg(A.Film):
    def __init__(self, fruit, index):
        A.CHOMPS = [C0, C1, C2]          # Film.__init__ places splashes/lip drops at these times
        super().__init__(fruit)
        self.side = 1 if index % 2 == 0 else -1
        self.fruit = fruit

    def update(self, t):
        S, base = self.S, self.base
        mini = S.mini["root"]
        L, R = S.arms
        sd = self.side

        # ---------------- body
        lean = 0.0
        for c in (C0, C1, C2):
            lean += 0.09 * pulse(t, c - 0.55, 0.9)
        sway = 0.035 * math.sin(t * 1.6)
        if t < 0.9:
            sway += 0.07 * math.sin(t * 9.0) * (1 - t / 0.9)       # excited wiggle
        if t > HAPPY:
            sway += 0.07 * math.sin((t - HAPPY) * 6.0) * ease((t - HAPPY) / 0.3)
        sq = 0.012 * math.sin(t * 2.4)
        for (a, b) in CHEWS:
            if a < t < b:
                k = ease((t - a) / 0.2) * ease((b - t) / 0.2)
                sq += (0.05 if a > 5.5 else 0.04) * k * max(0, math.sin((t - a) * 2 * math.pi * 2.6))
        for c in (C0, C1, C2):
            sq += 0.08 * pulse(t, c - 0.05, 0.25)
        sq -= 0.09 * pulse(t, GULP, 0.3)
        hop_h = 0.0
        if HOP - 0.2 < t < HOP:
            sq += 0.07 * pulse(t, HOP - 0.2, 0.4)
        if HOP <= t < HOP + 0.45:
            u = (t - HOP) / 0.45
            hop_h = 0.22 * 4 * u * (1 - u)
            sq -= 0.05 * math.sin(math.pi * u)
        if HOP + 0.45 <= t < HOP + 0.7:
            sq += 0.07 * pulse(t, HOP + 0.45, 0.25)
        full = track(t, [(C2, 0), (C2 + 0.25, 0.05), (7.0, 0.05), (7.25, 0)])
        base.rotation_euler = (lean, 0, sway)
        base.location = (0, 0, A.TABLE_Z + hop_h)
        base.scale = (1 + sq * 0.6 + full, 1 + sq * 0.6 + full * 0.6, 1 - sq)

        # ---------------- face
        wow = 1.9 < t < 2.7 or 4.35 < t < 4.85     # peeks at the juicy bite
        closed = (C0 - 0.12 < t < 7.25) and not wow
        S.set_eyes(closed or (0.45 < t < 0.55))
        self._eye_scale(1 + 0.12 * track(t, [(0, 1), (0.8, 1), (1.0, 0), (1.9, 0), (2.1, 1.2), (2.7, 1.2),
                                              (2.8, 0), (7.2, 0), (7.45, 1.25), (SEG, 1.25)]))
        mouth = track(t, [(0, 0.1), (0.2, 0.15), (0.85, 1.0), (C0, 0.22), (C0 + 0.25, 0), (2.95, 0), (3.35, 1.0),
                          (C1, 0.22), (C1 + 0.25, 0), (5.0, 0), (5.45, 1.15), (C2, 0.2), (C2 + 0.25, 0)])
        if mouth > 0.04:
            S.set_mouth("open", mouth)
        else:
            S.set_mouth("smile")
        sm = 1.0
        if any(a < t < b for a, b in CHEWS):
            sm = 1 + 0.35 * math.sin(t * 2 * math.pi * 2.6)
        sm *= 1 + 0.45 * track(t, [(7.2, 0), (7.5, 1), (SEG, 1)])
        S.smile.scale = (1 + 0.1 * (sm - 1), 1, sm)

        # ---------------- mini fruit
        bite = 2 if t >= C1 else (1 if t >= C0 else 0)
        gone = t >= C2 + 0.03
        S.set_bitten(bite > 0)
        for s, x0 in zip(S.bite_parts, self.bite_x0):
            s.location.x = x0 + (0.32 if bite >= 2 else 0.0)
        bpy.context.view_layer.update()
        if not gone:
            chest_w, mouth_w, mouth_in_w = self.W(self.chest_hold), self.W(self.mouth_hold), self.W(self.mouth_in)
            pos = chest_w + Vector((0, 0, 0.03 * math.sin(t * 7.0) * (1 - min(1, t / 0.8))))
            for c in (C0, C1, C2):
                tgt = mouth_in_w if c == C2 else mouth_w
                if c - 0.6 <= t < c:
                    pos = chest_w.lerp(tgt, ease((t - (c - 0.6)) / 0.55))
                elif c <= t < c + 0.5 and c != C2:
                    pos = tgt.lerp(chest_w, ease((t - c - 0.05) / 0.45))
                elif c == C2 and t >= c:
                    pos = tgt
            mini.location = pos
            rb, rs = -math.pi / 2, math.radians(75)
            rz = track(t, [(0, 0.4), (0.6, rb), (C0 + 0.35, rb), (C0 + 0.9, rs), (2.75, rs), (3.0, rb),
                           (C1 + 0.35, rb), (C1 + 0.8, rs), (4.75, rs), (5.05, rb)])
            rx = track(t, [(0, 0.15), (C0 + 0.35, 0.15), (C0 + 0.9, 0.35), (2.75, 0.35), (3.0, 0.15),
                           (C1 + 0.35, 0.15), (C1 + 0.8, 0.35), (4.75, 0.35), (5.05, 0.15)])
            mini.rotation_euler = (rx, 0, rz + sway)
        else:
            u = min(1.0, (t - (C2 + 0.05)) / 0.55)
            start = self.W(self.mouth_hold) + Vector((0.08, -0.05, 0.05))
            p = start.lerp(self.drop_spot, u)
            p.z = start.z + (self.drop_spot.z - start.z) * u * u + 0.22 * math.sin(math.pi * u) * (1 - u)
            if u >= 1:
                p.z = self.drop_spot.z + 0.03 * pulse(t, C2 + 0.6, 0.15)
            mini.location = p
            mini.rotation_euler = (0.1 + (1 - u) * 2.5, 0.3 * (1 - u), 1.0 + (1 - u) * 3.0)
        S.mini["body"].hide_render = gone
        S.mini_seeds.hide_render = gone

        # ---------------- arms
        bpy.context.view_layer.update()
        rest = [self.W(Vector(p)) for p in ((-0.4, -1.02, -0.62), (0.4, -1.02, -0.62))]
        if not gone or t < C2 + 0.1:
            c = mini.matrix_world.translation
            tL, tR = c + Vector((-0.2, -0.02, -0.03)), c + Vector((0.2, -0.02, -0.03))
        else:
            u = ease((t - (C2 + 0.12)) / 0.45)
            tL = rest[0].lerp(self.W(self.cheekL), u)
            tR = rest[1].lerp(self.W(self.cheekR), u)
        SC.aim_arm(L, tL)
        SC.aim_arm(R, tR)

        # ---------------- juice
        for sp in self.splashes:
            sp.update(t, lambda: self.splash_origin)
        for ob, t0, (dx, _) in self.lipdrops:
            if t < t0:
                ob.hide_render = True
                continue
            ob.hide_render = False
            u = t - t0
            slide = min(0.22, 0.08 * u * u)
            n = (S.mouth_n + Vector((0, 0, -0.3 * slide))).normalized()
            p = self.W(S.mouth_loc + Vector((dx, 0, -0.07 - slide)) + n * 0.012)
            if slide >= 0.22:
                tf = max(0.0, u - math.sqrt(0.22 / 0.08))
                p.z -= 0.5 * 9.8 * 0.35 * tf * tf
                p.y -= 0.15 * tf
                if p.z < A.TABLE_Z:
                    ob.location = (p.x, p.y, A.TABLE_Z + 0.004)
                    ob.scale = (0.03, 0.03, 0.006)
                    continue
            ob.location = p
            ob.rotation_quaternion = (1, 0, 0, 0)
            ob.scale = (0.016, 0.014, 0.016 + min(0.012, slide * 0.1))

        # ---------------- camera (mirrored every other fruit for variety)
        mw = self.W(S.mouth_loc)
        miniw = mini.matrix_world.translation.copy()
        eye = self.W((S.F["eyeL"][0] + S.F["eyeR"][0]) / 2)
        keys = [(0, (0.5, -6.3, 0.15)), (0.9, (1.0, -5.7, 0.05)), (1.25, (1.0, -5.65, 0.05)),
                (1.9, (0.3, -5.35, -0.3)), (2.8, (0.15, -5.3, -0.3)), (3.2, (-0.9, -5.7, 0.05)),
                (3.75, (-0.9, -5.65, 0.05)), (4.3, (-0.2, -5.35, -0.3)), (4.9, (-0.1, -5.3, -0.3)),
                (5.3, (0.9, -5.6, 0.0)), (6.2, (0.5, -6.0, 0.05)), (SEG, (0.0, -6.5, 0.25))]
        keys = [(k, (x * sd, y, z)) for k, (x, y, z) in keys]
        lens = track(t, [(0, 66), (0.9, 78), (1.9, 74), (2.8, 76), (3.2, 78), (4.3, 74), (4.9, 76), (5.3, 78),
                         (6.2, 70), (SEG, 60)])
        w_face = track(t, [(0, 0.6), (0.8, 1.0), (1.3, 1.0), (1.9, 0.0), (2.8, 0.0), (3.15, 1.0), (3.8, 1.0),
                           (4.3, 0.0), (4.9, 0.0), (5.2, 1.0), (SEG, 1.0)])
        tgt = miniw.lerp(mw.lerp(eye, 0.4), w_face) + Vector((0, 0, 0.12 * (1 - w_face)))
        if t > 6.2:
            tgt = tgt.lerp(Vector((0.15 * sd, -0.8, -0.4)), track(t, [(6.2, 0), (SEG, 0.4)]))
        SC.Scene.place_cam(S, tuple(Vector(track(t, keys))), tuple(tgt), lens,
                           focus=tuple(miniw.lerp(eye, w_face)), fstop=3.0)

    def sound_events(self, offset):
        P = self.fruit
        ev = []
        for c in (C0, C1, C2):
            ev.append(dict(t=c, kind="chomp", big=c == C2))
            ev.append(dict(t=c + 0.32, kind="slurp"))
            ev.append(dict(t=c - 0.55, kind="mouth_open"))
        for a, b in CHEWS:
            k, tt = 0, a
            while tt < b - 0.08:
                ev.append(dict(t=tt + 0.09, kind="chew", i=k, full=a > 5.5))
                tt += 1 / 2.6
                k += 1
            ev.append(dict(t=b + 0.02, kind="smack"))
        for sp in self.splashes:
            for ti, r in sp.impact_times(self.splash_origin):
                if ti < SEG:
                    ev.append(dict(t=ti, kind="drip", r=r))
        for ob, t0, _ in self.lipdrops:
            ti = t0 + math.sqrt(0.22 / 0.08) + 0.4
            if ti < SEG:
                ev.append(dict(t=ti, kind="drip", r=0.016))
        ev += [dict(t=C2 + 0.62, kind="cap"), dict(t=GULP, kind="gulp"), dict(t=HOP + 0.45, kind="land"),
               dict(t=HAPPY + 0.05, kind="mmm"), dict(t=2.0, kind="ooh"), dict(t=0.1, kind="giggle")]
        for e in ev:
            e["t"] += offset
            e["fruit"] = P
        return ev


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--index", type=int, required=True)
    ap.add_argument("--scale", type=float, default=0.6667)
    ap.add_argument("--samples", type=int, default=16)
    ap.add_argument("--step", type=int, default=1)
    ap.add_argument("--out", default=os.path.join(OUT, "frames"))
    a = ap.parse_args()
    fruit = ORDER[a.index]
    seg = Seg(fruit, a.index)
    nseg = int(round(SEG * FPS))
    off = a.index * nseg
    os.makedirs(a.out, exist_ok=True)
    with open(os.path.join(OUT, "events_%d.json" % a.index), "w") as f:
        json.dump(dict(fruit=fruit, events=seg.sound_events(off / FPS)), f, indent=1)
    sc = seg.S.sc
    sc.cycles.samples = a.samples
    sc.render.resolution_percentage = 100
    sc.render.resolution_x = int(1080 * a.scale) // 2 * 2
    sc.render.resolution_y = int(1920 * a.scale) // 2 * 2
    for i in range(0, nseg, a.step):
        path = os.path.join(a.out, "f%04d.png" % (off + i))
        if os.path.exists(path):
            continue
        seg.update(i / FPS)
        sc.render.filepath = path + ".tmp.png"
        bpy.ops.render.render(write_still=True)
        os.replace(path + ".tmp.png", path)
        print("FRAME", off + i, flush=True)


if __name__ == "__main__":
    main()
