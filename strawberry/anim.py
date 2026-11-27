"""Animate the strawberry eating a mini strawberry (~33 s) and render the frames.

Run:  python3 anim.py [--fps 24] [--scale 0.6667] [--samples 16] [--start 0] [--end N] [--step 1] [--out out/frames]
Also writes out/events.json (sound cue times) for audio.py. Frames that already exist are skipped (resumable).
"""
import argparse
import json
import math
import os
import sys

import bpy  # noqa: F401  (must load before bmesh, used by scene)
import numpy as np
from mathutils import Euler, Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scene as SC  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
TABLE_Z = -1.03
DUR = 33.0


# ----------------------------------------------------------------------------- tiny animation toolkit
def ease(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def track(t, keys):
    """keys: [(time, value), ...] with smoothstep easing between keys; values float/tuple."""
    if t <= keys[0][0]:
        return keys[0][1]
    for (t0, v0), (t1, v1) in zip(keys, keys[1:]):
        if t <= t1:
            u = ease((t - t0) / (t1 - t0)) if t1 > t0 else 1.0
            if isinstance(v0, (tuple, list, Vector)):
                return tuple(a + (b - a) * u for a, b in zip(v0, v1))
            return v0 + (v1 - v0) * u
    return keys[-1][1]


def pulse(t, t0, dur):
    """0 -> 1 -> 0 bump over [t0, t0+dur]."""
    if t < t0 or t > t0 + dur:
        return 0.0
    return math.sin(math.pi * (t - t0) / dur)


# ----------------------------------------------------------------------------- story timing (seconds)
CHOMPS = [12.1, 18.1, 24.2]          # moment the teeth close
CHEW = [(12.6, 16.6), (18.6, 22.6), (24.8, 28.4)]
GULP = 28.7
HOP = 30.0
BLINKS = [1.8, 5.2, 9.1, 15.0, 31.4]


class Splash:
    """Ballistic juice droplets with slow-motion feel; splat flat on the table."""

    def __init__(self, S, t0, n, seed, spread=1.0, slow=0.45, name="sp"):
        self.t0, self.slow = t0, slow
        rng = np.random.default_rng(seed)
        self.d = []
        for i in range(n):
            v = Vector((rng.normal(0, 0.9) * spread, -abs(rng.normal(1.1, 0.6)), rng.normal(0.9, 0.9)))
            r = 0.006 + abs(rng.normal(0, 0.009))
            ob = SC.uv_sphere("%s%d" % (name, i), 20, 10, 1.0)
            ob.data.materials.append(S.M["juice"])
            ob.rotation_mode = "QUATERNION"
            ob.hide_render = True
            self.d.append(dict(ob=ob, v=v, r=r, off=Vector(rng.normal(0, 0.03, 3))))
        self.origin = None
        self.hits = []

    def update(self, t, origin_fn):
        if t < self.t0:
            for d in self.d:
                d["ob"].hide_render = True
            return
        if self.origin is None:
            self.origin = Vector(origin_fn())
        dt = (t - self.t0) * self.slow
        g = Vector((0, 0, -9.8 * 0.35))
        for d in self.d:
            ob, v, r = d["ob"], d["v"], d["r"]
            p0 = self.origin + d["off"]
            p = p0 + v * dt + 0.5 * g * dt * dt
            vel = v + g * dt
            ob.hide_render = False
            if p.z - r <= TABLE_Z:
                # time of impact (solve z(t) = table + r)
                a, b, c = 0.5 * g.z, v.z, p0.z - (TABLE_Z + r * 0.3)
                disc = max(0.0, b * b - 4 * a * c)
                th = (-b - math.sqrt(disc)) / (2 * a)
                ph = p0 + v * th + 0.5 * g * th * th
                ob.location = (ph.x, ph.y, TABLE_Z + r * 0.25)
                ob.rotation_quaternion = (1, 0, 0, 0)
                ob.scale = (r * 1.9, r * 1.9, r * 0.35)
            else:
                ob.location = p
                ob.rotation_quaternion = vel.normalized().to_track_quat("Z", "Y")
                ob.scale = (r, r, r * (1 + min(2.0, vel.length * 0.5)))

    def impact_times(self, origin):
        """Real-time seconds when each droplet lands (for drip sounds)."""
        out = []
        g = -9.8 * 0.35
        for d in self.d:
            p0z = origin.z + d["off"].z
            a, b, c = 0.5 * g, d["v"].z, p0z - (TABLE_Z + d["r"] * 0.3)
            disc = b * b - 4 * a * c
            if disc < 0:
                continue
            th = (-b - math.sqrt(disc)) / (2 * a)
            out.append((self.t0 + th / self.slow, d["r"]))
        return out


class Film:
    def __init__(self, fruit="strawberry"):
        S = SC.Scene(fruit)
        self.S = S
        big = S.B["root"]
        # pivot the character at its base so leaning/squashing happens from the table
        base = SC.link(bpy.data.objects.new("base", None))
        base.location = (0, 0, TABLE_Z)
        base.rotation_mode = "XYZ"
        big.parent = base
        big.location = (0, 0, -TABLE_Z)
        self.base = base
        F = S.F
        bvh = S.B["bvh"]
        self.chest, chest_n = SC.surface(bvh, (0, -1, -0.55))
        self.chest_hold = self.chest + chest_n * 0.23 + Vector((0, 0, 0.02))
        self.mouth_hold = S.mouth_loc + S.mouth_n * 0.17
        self.mouth_in = S.mouth_loc + S.mouth_n * 0.02
        self.table_spot = Vector((0.0, -1.22, TABLE_Z + 1.05 * 0.24))
        self.drop_spot = Vector((0.42, -1.62, TABLE_Z - 0.24 * 0.36))
        self.cheekL = F["blushL"][0] + F["blushL"][1] * 0.1 + Vector((0.05, 0, -0.05))
        self.cheekR = F["blushR"][0] + F["blushR"][1] * 0.1 + Vector((-0.05, 0, -0.05))
        self.bite_x0 = [s.location.x for s in S.bite_parts]
        # remove still-only droplets/blush etc. none created yet; splashes:
        self.splashes = [Splash(S, CHOMPS[0] + 0.02, 26, 11, name="spA"),
                         Splash(S, CHOMPS[1] + 0.02, 30, 12, name="spB"),
                         Splash(S, CHOMPS[2] + 0.02, 22, 13, spread=1.3, name="spC")]
        # a juice drop that rolls down from the lip after each bite
        self.lipdrops = []
        for i, t0 in enumerate(CHOMPS):
            ob = SC.uv_sphere("lip%d" % i, 20, 10, 1.0)
            ob.data.materials.append(S.M["juice"])
            ob.rotation_mode = "QUATERNION"
            self.lipdrops.append((ob, t0 + 0.4, (0.08 - 0.15 * i, 0)))
        bpy.context.view_layer.update()
        self.splash_origin = self.W(self.mouth_hold) + Vector((0, -0.05, -0.02))
        self.events = []
        sc = S.sc
        sc.render.use_persistent_data = True
        sc.cycles.max_bounces = 6
        sc.cycles.diffuse_bounces = 2
        sc.cycles.glossy_bounces = 3
        sc.cycles.transmission_bounces = 6
        sc.cycles.volume_bounces = 0
        sc.render.use_motion_blur = False

    # helpers in character space -> world
    def W(self, local):
        return self.S.B["root"].matrix_world @ Vector(local)

    def update(self, t):
        S, base = self.S, self.base
        big, mini = S.B["root"], S.mini["root"]
        L, R = S.arms
        c0, c1, c2 = CHOMPS

        # ---------------- body: lean, sway, squash, hop
        lean = track(t, [(0, 0), (3.0, 0), (4.2, 0.08), (4.8, 0.08), (5.8, 0.26), (6.3, 0.26), (7.4, 0.0),
                         (11.2, 0.0), (11.9, 0.1), (12.4, 0.0), (17.2, 0.0), (17.9, 0.1), (18.4, 0.0),
                         (23.3, 0.0), (24.0, 0.1), (24.5, 0.0)])
        sway = 0.04 * math.sin(t * 1.3)
        if 7.6 < t < 10.0:
            sway += 0.12 * math.sin((t - 7.6) * 5.2) * pulse(t, 7.6, 2.4)
        if 29.5 < t < 33:
            sway += 0.08 * math.sin((t - 29.5) * 4.0) * ease((t - 29.5) / 0.5)
        sq = 0.012 * math.sin(t * 2.4)  # breathing
        for (a, b) in CHEW:
            if a < t < b:
                k = ease((t - a) / 0.3) * ease((b - t) / 0.3)
                amp = 0.05 if a > 24 else 0.035
                sq += amp * k * max(0, math.sin((t - a) * 2 * math.pi * 2.2))
        for c in CHOMPS:
            sq += 0.07 * pulse(t, c - 0.05, 0.25)
        sq -= 0.09 * pulse(t, GULP, 0.35)  # gulp: stretch tall
        hop_h = 0.0
        if HOP - 0.25 < t < HOP:
            sq += 0.08 * pulse(t, HOP - 0.25, 0.5)  # crouch
        if HOP <= t < HOP + 0.55:
            u = (t - HOP) / 0.55
            hop_h = 0.32 * 4 * u * (1 - u)
            sq -= 0.06 * math.sin(math.pi * u)
        if HOP + 0.55 <= t < HOP + 0.85:
            sq += 0.08 * pulse(t, HOP + 0.55, 0.3)
        full = track(t, [(24.3, 0), (24.6, 0.05), (28.5, 0.05), (28.9, 0)])  # cheeks full
        base.rotation_euler = (lean, 0, sway)
        base.location = (0, 0, TABLE_Z + hop_h)
        base.scale = (1 + sq * 0.6 + full, 1 + sq * 0.6 + full * 0.6, 1 - sq)

        # ---------------- face
        blink = any(b <= t < b + 0.13 for b in BLINKS)
        closed_t = (c0 - 0.15 < t < c0 + 4.6) or (c1 - 0.15 < t < c1 + 4.6) or (c2 - 0.15 < t < GULP + 0.5)
        S.set_eyes(blink or closed_t)
        es = 1 + 0.12 * track(t, [(3.0, 0), (3.6, 1), (5.5, 1), (6.0, 0), (7.5, 0), (8.0, 1), (10.5, 1), (11, 0),
                                  (29.2, 0), (29.7, 1.2), (33, 1.2)])
        for o in S.eyes_open:
            if not hasattr(o, "_s0"):
                pass
        self._eye_scale(es)
        mouth = track(t, [(0, 0), (3.2, 0), (3.7, 0.3), (5.5, 0.3), (6.0, 0), (10.6, 0), (11.8, 1.0), (c0, 0.25),
                          (c0 + 0.3, 0.0), (16.9, 0), (17.8, 1.0), (c1, 0.25), (c1 + 0.3, 0),
                          (23.4, 0), (23.95, 1.15), (c2, 0.2), (c2 + 0.3, 0)])
        if mouth > 0.04:
            S.set_mouth("open", mouth)
        else:
            S.set_mouth("smile")
        chewing = any(a < t < b for a, b in CHEW)
        sm = 1.0
        if chewing:
            sm = 1 + 0.35 * math.sin(t * 2 * math.pi * 2.2)
        sm *= 1 + 0.4 * track(t, [(29.0, 0), (29.6, 1), (33, 1)])
        S.smile.scale = (1 + 0.1 * (sm - 1), 1, sm)

        # ---------------- mini strawberry path
        bite = 0
        if t >= c0:
            bite = 1
        if t >= c1:
            bite = 2
        gone = t >= c2 + 0.03
        held = 6.0 <= t < c2 + 0.05
        S.set_bitten(bite > 0)
        for s, x0 in zip(S.bite_parts, self.bite_x0):
            s.location.x = x0 + (0.32 if bite >= 2 else 0.0)
        bpy.context.view_layer.update()
        if t < 6.0:
            mini.location = self.table_spot
            mini.rotation_euler = (0, 0, 0.5)
        elif held:
            # where along: table->chest (6-7.4), chest, ->mouth (chomp windows)
            chest_w = self.W(self.chest_hold)
            mouth_w = self.W(self.mouth_hold)
            mouth_in_w = self.W(self.mouth_in)
            pos = chest_w
            if t < 7.4:
                u = ease((t - 6.0) / 1.4)
                pos = self.table_spot.lerp(chest_w, u)
                pos.z += 0.12 * math.sin(math.pi * u)
            for c in CHOMPS:
                deep = c == c2
                tgt = mouth_in_w if deep else mouth_w
                if c - 0.8 <= t < c:
                    pos = chest_w.lerp(tgt, ease((t - (c - 0.8)) / 0.75))
                elif c <= t < c + 0.55 and not deep:
                    pos = tgt.lerp(chest_w, ease((t - c - 0.05) / 0.5))
                elif deep and t >= c:
                    pos = tgt
            if 7.6 < t < 10.0:
                pos = pos + Vector((0, 0, 0.04 * math.sin((t - 7.6) * 3.0)))
            mini.location = pos
            # orientation: bite side (-X local) toward the mouth for chomps; show the bite in between
            rz_bite = -math.pi / 2
            rz_show = math.radians(75)
            rz = track(t, [(6.0, 0.5), (7.4, 0.3), (9.8, 1.6), (10.9, rz_bite), (c0 + 0.5, rz_bite),
                           (c0 + 1.3, rz_show), (16.6, rz_show), (17.2, rz_bite), (c1 + 0.5, rz_bite),
                           (c1 + 1.3, rz_show), (22.6, rz_show), (23.2, rz_bite)])
            rx = track(t, [(6.0, 0), (7.4, 0.15), (12.5, 0.15), (13.4, 0.35), (16.6, 0.35), (17.2, 0.15),
                           (18.5, 0.15), (19.4, 0.35), (22.6, 0.35), (23.2, 0.15)])
            mini.rotation_euler = (rx, 0, rz + sway)
        else:
            # only the leafy cap is left; it tumbles from the mouth to the table
            u = min(1.0, (t - (c2 + 0.05)) / 0.6)
            start = self.W(self.mouth_hold) + Vector((0.08, -0.05, 0.05))
            p = start.lerp(self.drop_spot, u)
            p.z = start.z + (self.drop_spot.z - start.z) * u * u + 0.25 * math.sin(math.pi * u) * (1 - u)
            if u >= 1:
                p.z = self.drop_spot.z + 0.03 * pulse(t, c2 + 0.65, 0.15)
            mini.location = p
            mini.rotation_euler = (0.1 + (1 - u) * 2.5, 0.3 * (1 - u), 1.0 + (1 - u) * 3.0)
        S.mini["body"].hide_render = gone
        S.mini_seeds.hide_render = gone

        # ---------------- arms
        bpy.context.view_layer.update()
        rest = [self.W(SC.Vector(p)) for p in ((-0.4, -1.02, -0.62), (0.4, -1.02, -0.62))]
        if held or (5.0 < t < 6.0):
            sideL = mini.matrix_world @ Vector((0, 0, 0))
            off = 0.2
            tL = sideL + Vector((-off, -0.02, -0.03))
            tR = sideL + Vector((off, -0.02, -0.03))
            if t < 6.0:
                u = ease((t - 5.0) / 1.0)
                tL = rest[0].lerp(tL, u)
                tR = rest[1].lerp(tR, u)
        elif t < c2 + 1.2:
            tL, tR = rest
        else:
            u = ease((t - 29.2) / 0.6)
            tL = rest[0].lerp(self.W(self.cheekL), u)
            tR = rest[1].lerp(self.W(self.cheekR), u)
        SC.aim_arm(L, tL)
        SC.aim_arm(R, tR)

        # ---------------- juice
        for sp, c in zip(self.splashes, CHOMPS):
            sp.update(t, lambda: self.splash_origin)
        for ob, t0, (dx, _) in self.lipdrops:
            if t < t0:
                ob.hide_render = True
                continue
            ob.hide_render = False
            u = t - t0
            slide = min(0.22, 0.05 * u * u)
            loc_local = S.mouth_loc + Vector((dx, 0, -0.07 - slide))
            n = (S.mouth_n + Vector((0, 0, -0.3 * slide))).normalized()
            p = self.W(loc_local + n * 0.012)
            if slide >= 0.22:
                # detaches and falls
                tf = (0.05 * u * u - 0.22) / 0.05
                tf = max(0.0, u - math.sqrt(0.22 / 0.05))
                p.z -= 0.5 * 9.8 * 0.35 * tf * tf
                p.y -= 0.15 * tf
                if p.z < TABLE_Z:
                    p.z = TABLE_Z + 0.004
                    ob.scale = (0.03, 0.03, 0.006)
                    ob.location = p
                    continue
            ob.location = p
            ob.rotation_quaternion = (1, 0, 0, 0)
            ob.scale = (0.016, 0.014, 0.016 + min(0.012, slide * 0.1))

        # ---------------- camera
        mw = self.W(S.mouth_loc)
        miniw = mini.matrix_world.translation.copy()
        eye = self.W((S.F["eyeL"][0] + S.F["eyeR"][0]) / 2)
        cam_keys = [(0, (0.9, -7.6, 0.55)), (3.0, (0.6, -6.9, 0.35)), (6.0, (0.4, -6.6, 0.2)),
                    (10.0, (0.3, -6.6, 0.15)), (11.6, (1.1, -5.7, 0.05)), (12.8, (1.1, -5.6, 0.05)),
                    (14.0, (0.3, -5.4, -0.3)), (16.4, (0.1, -5.3, -0.3)), (17.4, (-1.0, -5.7, 0.05)),
                    (18.8, (-1.0, -5.6, 0.05)), (20.0, (-0.2, -5.4, -0.3)), (22.4, (0.0, -5.3, -0.3)),
                    (23.4, (0.9, -5.6, 0.0)), (25.2, (0.7, -6.0, 0.0)), (28.8, (0.3, -6.2, 0.15)),
                    (33.0, (0.0, -6.9, 0.35))]
        lens_keys = [(0, 55), (6.0, 62), (11.6, 78), (12.8, 78), (14.0, 74), (16.4, 76), (17.4, 78), (18.8, 78),
                     (20.0, 74), (22.4, 76), (23.4, 78), (25.2, 72), (28.8, 64), (33, 58)]
        cam = Vector(track(t, cam_keys))
        # what we look at / focus: face, mini, or bite close-ups
        w_face = track(t, [(0, 0.3), (4.0, 0.0), (7.5, 0.4), (11.0, 1.0), (12.9, 1.0), (13.8, 0.0), (16.5, 0.0),
                           (17.4, 1.0), (18.9, 1.0), (19.8, 0.0), (22.5, 0.0), (23.4, 1.0), (33, 1.0)])
        tgt_face = mw.lerp(eye, 0.4)
        tgt = miniw.lerp(tgt_face, w_face) + Vector((0, 0, 0.12 * (1 - w_face)))
        if t > 25.0:
            tgt = tgt_face.lerp(Vector((0.15, -0.8, -0.45)), track(t, [(25, 0), (28.8, 0.35), (33, 0.5)]))
        S.place_cam(tuple(cam), tuple(tgt), track(t, lens_keys), focus=tuple(miniw.lerp(eye, w_face)),
                    fstop=track(t, [(0, 2.8), (11, 3.2), (33, 3.0)]))

    def _eye_scale(self, k):
        for o in self.S.eyes_open:
            if "s0" not in o:
                o["s0"] = tuple(o.scale)
                o["l0"] = tuple(o.location)
        eL = self.S.eyes_open[0]
        for o in self.S.eyes_open:
            s0 = Vector(o["s0"])
            o.scale = s0 * k
        # keep catchlights on the enlarged eye surface: scale offsets from each eye centre
        for i in range(0, len(self.S.eyes_open), 3):
            eye = self.S.eyes_open[i]
            c = Vector(eye["l0"])
            for o in self.S.eyes_open[i + 1:i + 3]:
                o.location = c + (Vector(o["l0"]) - c) * k

    def sound_events(self):
        ev = []
        for c in CHOMPS:
            ev.append(dict(t=c, kind="chomp", big=c == CHOMPS[2]))
        for a, b in CHEW:
            k = 0
            tt = a
            while tt < b - 0.1:
                ev.append(dict(t=tt + 0.11, kind="chew", i=k, full=a > 24))
                tt += 1 / 2.2
                k += 1
        for sp, c in zip(self.splashes, CHOMPS):
            for ti, r in sp.impact_times(self.splash_origin):
                if ti < DUR:
                    ev.append(dict(t=ti, kind="drip", r=r))
        for ob, t0, _ in self.lipdrops:
            ev.append(dict(t=t0 + math.sqrt(0.22 / 0.05) + 0.42, kind="drip", r=0.016))
        ev.append(dict(t=CHOMPS[2] + 0.66, kind="cap"))
        ev.append(dict(t=GULP, kind="gulp"))
        ev.append(dict(t=HOP - 0.05, kind="hop"))
        ev.append(dict(t=HOP + 0.55, kind="land"))
        ev.append(dict(t=6.0, kind="pick"))
        ev.append(dict(t=29.4, kind="mmm"))
        ev.append(dict(t=3.4, kind="ooh"))
        for c in CHOMPS:
            ev.append(dict(t=c - 0.9, kind="mouth_open"))
        return sorted(ev, key=lambda e: e["t"])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fps", type=int, default=24)
    ap.add_argument("--scale", type=float, default=0.6667)
    ap.add_argument("--samples", type=int, default=16)
    ap.add_argument("--start", type=int, default=0)
    ap.add_argument("--end", type=int, default=None)
    ap.add_argument("--step", type=int, default=1)
    ap.add_argument("--fruit", default="strawberry")
    ap.add_argument("--out", default=None)
    a = ap.parse_args()
    odir = os.path.join(HERE, "out") if a.fruit == "strawberry" else os.path.join(HERE, "out", a.fruit)
    os.makedirs(odir, exist_ok=True)
    a.out = a.out or os.path.join(odir, "frames")
    film = Film(a.fruit)
    with open(os.path.join(odir, "events.json"), "w") as f:
        json.dump(dict(fps=a.fps, dur=DUR, fruit=a.fruit, events=film.sound_events()), f, indent=1)
    sc = film.S.sc
    sc.cycles.samples = a.samples
    sc.render.resolution_percentage = int(round(a.scale * 100))
    os.makedirs(a.out, exist_ok=True)
    n = int(DUR * a.fps)
    end = n if a.end is None else min(n, a.end)
    for fr in range(a.start, end, a.step):
        path = os.path.join(a.out, "f%04d.png" % fr)
        if os.path.exists(path):
            continue
        film.update(fr / a.fps)
        sc.render.filepath = path + ".tmp.png"
        bpy.ops.render.render(write_still=True)
        os.replace(path + ".tmp.png", path)
        print("FRAME", fr, flush=True)


if __name__ == "__main__":
    main()
