"""Wooden-mannequin "bean" character: segmented rigid parts on a pivot hierarchy.

No skinning. Every limb hangs from a pivot empty whose rest rotation is zero, so a pose is
just a handful of Euler angles. Character faces -Y (towards a camera on the -Y side).

Pose angles (degrees), all optional:
  spine:(lean_fwd, twist)       head:(nod_down, turn)
  arm.L / arm.R:(fwd, out)      fwd raises the arm towards the camera, out raises it sideways
  elbow.L / elbow.R: bend       forearm folds forward
  leg.L / leg.R:(fwd, out)      fwd lifts the thigh forward (sitting = 90)
  knee.L / knee.R: bend         shin folds back
  sit: drop                     metres the hips drop (for sitting on a chair)
"""
import math
import random
import bpy
from util import mat, capsule, sphere, box, empty, rad, new_coll

# ---- pose library -----------------------------------------------------------------------
POSES = {
    "idle": {"arm.L": (0, 6), "arm.R": (0, 6), "elbow.L": 8, "elbow.R": 8},
    "arms_up": {"arm.L": (10, 160), "arm.R": (10, 160), "elbow.L": 10, "elbow.R": 10, "head": (-10, 0)},
    "cheer": {"arm.L": (20, 140), "arm.R": (20, 140), "elbow.L": 35, "elbow.R": 35, "head": (-12, 0)},
    "slump": {"spine": (14, 0), "head": (25, 0), "arm.L": (6, 2), "arm.R": (6, 2)},
    "point": {"arm.R": (85, 10), "elbow.R": 5, "arm.L": (0, 6)},
    "wave": {"arm.R": (10, 150), "elbow.R": 40, "arm.L": (0, 6)},
    "shrug": {"arm.L": (30, 35), "arm.R": (30, 35), "elbow.L": 80, "elbow.R": 80, "head": (0, 0)},
    "hold": {"arm.L": (45, 12), "arm.R": (45, 12), "elbow.L": 45, "elbow.R": 45},
    "drink": {"arm.R": (60, 15), "elbow.R": 120, "head": (-15, 0), "arm.L": (0, 6)},
    "hands_hips": {"arm.L": (-5, 35), "arm.R": (-5, 35), "elbow.L": 100, "elbow.R": 100},
    "think": {"arm.R": (40, 5), "elbow.R": 140, "head": (8, 12), "arm.L": (25, 0), "elbow.L": 80},
    "sit": {"leg.L": (90, 4), "leg.R": (90, 4), "knee.L": 90, "knee.R": 90, "sit": 0.42,
            "arm.L": (25, 6), "arm.R": (25, 6), "elbow.L": 30, "elbow.R": 30},
    "walk_a": {"leg.L": (25, 0), "leg.R": (-20, 0), "knee.L": 10, "knee.R": 25,
               "arm.L": (-20, 6), "arm.R": (22, 6), "elbow.L": 10, "elbow.R": 20},
    "walk_b": {"leg.L": (-20, 0), "leg.R": (25, 0), "knee.L": 25, "knee.R": 10,
               "arm.L": (22, 6), "arm.R": (-20, 6), "elbow.L": 20, "elbow.R": 10},
}

# brow rotations (inner end up/down) and y-offset; mouth on/off
EXPRESSIONS = {
    "neutral": {"brow": 0, "lift": 0.0, "mouth": False},
    "happy": {"brow": -8, "lift": 0.012, "mouth": False},
    "angry": {"brow": 22, "lift": -0.008, "mouth": False},
    "worried": {"brow": -22, "lift": 0.01, "mouth": False},
    "shock": {"brow": 0, "lift": 0.03, "mouth": True},
    "talk": {"brow": -4, "lift": 0.005, "mouth": True},
}

PIVOTS = ["spine", "head", "arm.L", "arm.R", "elbow.L", "elbow.R", "leg.L", "leg.R", "knee.L", "knee.R"]


class Mannequin:
    def __init__(self, name, spec, coll):
        self.name = name
        self.spec = spec
        self.coll = new_coll(f"CH_{name}", coll)
        self.p = {}
        self._build()

    # ---- construction -------------------------------------------------------------------
    def _build(self):
        s, c = self.spec, self.coll
        big = s.get("build", "regular") == "big"
        tw = 1.35 if big else 1.0         # torso width factor
        h = s.get("height", 1.0)
        skin = mat(s.get("skin", "#E9B98F"))
        top = mat(s.get("top", "#3A7BD5"))
        bottom = mat(s.get("bottom", "#2D3A5C"))
        shoes = mat(s.get("shoes", "#2A2A2A"), rough=0.4)
        sleeves = top if s.get("sleeves", "long") == "long" else skin
        ink = mat("#141414", rough=0.3)
        hair = mat(s.get("hair_color", "#3B2A20"))

        self.root = empty(f"{self.name}", c, size=0.3)
        self.hips = empty(f"{self.name}.hips", c, (0, 0, 0.92 * h), self.root)
        p = self.p
        p["spine"] = empty(f"{self.name}.spine", c, (0, 0, 0), self.hips)
        # torso: one fat capsule from hips up to shoulders
        torso_len = 0.62 * h
        t = capsule(f"{self.name}.torso", c, 0.21 * tw, torso_len, top, down=False, scale=(1, 0.78, 1))
        t.location = (0, 0, torso_len / 2 - 0.08)
        t.parent = p["spine"]
        # pelvis in trouser colour
        pel = sphere(f"{self.name}.pelvis", c, 0.2 * tw, bottom, scale=(1, 0.78, 0.6))
        pel.location = (0, 0, -0.02)
        pel.parent = self.hips
        # neck + head
        neck_z = torso_len - 0.1
        p["head"] = empty(f"{self.name}.head", c, (0, 0, neck_z), p["spine"])
        nk = capsule(f"{self.name}.neck", c, 0.06, 0.16, skin, down=False)
        nk.location = (0, 0, 0.06)
        nk.parent = p["head"]
        hr = 0.2 * s.get("head_scale", 1.0)
        hz = 0.12 + hr
        hd = sphere(f"{self.name}.skull", c, hr, skin, loc=(0, 0, hz), scale=(1, 0.95, 1.05))
        hd.parent = p["head"]
        self.head_r, self.head_z = hr, hz
        self._face(hr, hz, ink, hair)
        self._hair(s.get("hair", "short"), hr, hz, hair, mat(s.get("hat_color", s.get("top", "#333333"))))
        # arms
        sh_x = 0.2 * tw + 0.045
        sh_z = torso_len - 0.2
        for side, sx in (("L", 1), ("R", -1)):
            a = p[f"arm.{side}"] = empty(f"{self.name}.arm.{side}", c, (sx * sh_x, 0, sh_z), p["spine"])
            ua = capsule(f"{self.name}.upperarm.{side}", c, 0.065 * (1.2 if big else 1), 0.34 * h, sleeves)
            ua.parent = a
            e = p[f"elbow.{side}"] = empty(f"{self.name}.elbow.{side}", c, (0, 0, -0.29 * h), a)
            fa = capsule(f"{self.name}.forearm.{side}", c, 0.058 * (1.15 if big else 1), 0.3 * h, sleeves)
            fa.parent = e
            hand = sphere(f"{self.name}.hand.{side}", c, 0.07, skin, loc=(0, 0, -0.3 * h), scale=(0.85, 0.85, 1))
            hand.parent = e
            setattr(self, f"hand_{side}", hand)
        # legs
        for side, sx in (("L", 1), ("R", -1)):
            l = p[f"leg.{side}"] = empty(f"{self.name}.leg.{side}", c, (sx * 0.1 * tw, 0, -0.04), self.hips)
            th = capsule(f"{self.name}.thigh.{side}", c, 0.085 * (1.15 if big else 1), 0.46 * h, bottom)
            th.parent = l
            k = p[f"knee.{side}"] = empty(f"{self.name}.knee.{side}", c, (0, 0, -0.4 * h), l)
            sn = capsule(f"{self.name}.shin.{side}", c, 0.075, 0.44 * h, bottom)
            sn.parent = k
            ft = sphere(f"{self.name}.foot.{side}", c, 0.08, shoes, loc=(0, -0.05, -0.44 * h), scale=(0.9, 1.5, 0.6))
            ft.parent = k
        # optional held prop slot in right hand
        self.hand_slot = empty(f"{self.name}.slot.R", c, (0, -0.02, -0.33 * h), p["elbow.R"])

    def _face(self, hr, hz, ink, hair):
        c, head = self.coll, self.p["head"]
        fy = -hr * 0.93
        ez = hz + hr * 0.12
        for sx in (1, -1):
            e = sphere(f"{self.name}.eye{sx}", c, hr * 0.13, ink, loc=(sx * hr * 0.36, fy, ez), scale=(0.8, 0.45, 1))
            e.parent = head
        self.brows = []
        for sx in (1, -1):
            piv = empty(f"{self.name}.browpiv{sx}", c, (sx * hr * 0.36, fy - 0.005, ez + hr * 0.32), head)
            b = box(f"{self.name}.brow{sx}", c, (hr * 0.42, 0.02, 0.028), mat(self.spec.get("brow_color", "#2A1C14")), bevel=0.008)
            b.parent = piv
            self.brows.append((piv, sx))
        self.mouth = sphere(f"{self.name}.mouth", c, hr * 0.13, ink, loc=(0, fy + 0.01, hz - hr * 0.42), scale=(1, 0.4, 1.2))
        self.mouth.parent = head
        if self.spec.get("moustache"):
            m = capsule(f"{self.name}.tache", c, hr * 0.1, hr * 0.7, hair, down=False, scale=(1, 0.6, 1))
            m.rotation_euler = (0, rad(90), 0)
            m.location = (0, fy - 0.01, hz - hr * 0.22)
            m.parent = head

    def _hair(self, style, hr, hz, hair, hatm):
        c, head = self.coll, self.p["head"]
        if style in ("short", "long", "bun"):
            cap = sphere(f"{self.name}.hair", c, hr * 1.04, hair, loc=(0, hr * 0.2, hz + hr * 0.3), scale=(1, 1, 0.8))
            cap.parent = head
        if style == "long":
            back = capsule(f"{self.name}.hairback", c, hr * 0.8, hr * 1.9, hair, down=True, scale=(1.15, 0.6, 1))
            back.location = (0, hr * 0.45, hz + hr * 0.4)
            back.parent = head
        if style == "bun":
            b = sphere(f"{self.name}.bun", c, hr * 0.38, hair, loc=(0, hr * 0.5, hz + hr * 0.95))
            b.parent = head
        if style == "beanie":
            bn = sphere(f"{self.name}.beanie", c, hr * 1.07, hatm, loc=(0, hr * 0.1, hz + hr * 0.42), scale=(1, 1, 0.72))
            bn.parent = head
        if style in ("cap", "flatcap"):
            crown = sphere(f"{self.name}.cap", c, hr * 1.05, hatm, loc=(0, hr * 0.08, hz + hr * 0.45),
                           scale=(1, 1, 0.55 if style == "flatcap" else 0.75))
            crown.parent = head
            brim = box(f"{self.name}.brim", c, (hr * 1.3, hr * 0.8, 0.02), hatm, loc=(0, -hr * 0.95, hz + hr * 0.42), bevel=0.008)
            brim.parent = head

    # ---- animation ----------------------------------------------------------------------
    def place(self, at=(0, 0, 0), face=0.0):
        """face: degrees, 0 = facing camera (-Y), 90 = facing +X."""
        self.root.location = at
        self.root.rotation_euler = (0, 0, rad(face))

    def _apply(self, pose):
        P = POSES.get(pose, pose) if isinstance(pose, str) else pose
        full = {k: None for k in PIVOTS}
        full.update(P)
        for k in PIVOTS:
            v = full[k]
            o = self.p[k]
            side = 1 if k.endswith(".L") else -1
            if k == "spine":
                lean, twist = v or (0, 0)
                o.rotation_euler = (rad(-lean), 0, rad(twist))
            elif k == "head":
                nod, turn = v or (0, 0)
                o.rotation_euler = (rad(-nod), 0, rad(turn))
            elif k.startswith("arm"):
                fwd, out = v or (0, 6)
                o.rotation_euler = (rad(-fwd), rad(-out * side), 0)
            elif k.startswith("elbow"):
                o.rotation_euler = (rad(-(v or 0)), 0, 0)
            elif k.startswith("leg"):
                fwd, out = v or (0, 0)
                o.rotation_euler = (rad(-fwd), rad(-out * side), 0)
            elif k.startswith("knee"):
                o.rotation_euler = (rad(v or 0), 0, 0)
        self.hips.location.z = 0.92 * self.spec.get("height", 1.0) - (P.get("sit", 0) if isinstance(P, dict) else 0)

    def key_pose(self, frame, pose, blend=4):
        """Hold the previous pose until frame-blend, then move into `pose` by `frame`."""
        objs = [self.p[k] for k in PIVOTS]
        if frame - blend >= 1 and getattr(self, "_last", None) is not None:
            self._apply(self._last)
            for o in objs:
                o.keyframe_insert("rotation_euler", frame=frame - blend)
            self.hips.keyframe_insert("location", frame=frame - blend)
        self._apply(pose)
        for o in objs:
            o.keyframe_insert("rotation_euler", frame=frame)
        self.hips.keyframe_insert("location", frame=frame)
        self._last = pose

    def key_face(self, frame, expr):
        E = EXPRESSIONS[expr]
        for piv, sx in self.brows:
            piv.rotation_euler = (0, rad(E["brow"] * sx), 0)
            piv.location.z = self.head_z + self.head_r * 0.12 + self.head_r * 0.32 + E["lift"]
            piv.keyframe_insert("rotation_euler", frame=frame)
            piv.keyframe_insert("location", frame=frame)
        self.mouth.hide_render = not E["mouth"]
        self.mouth.hide_viewport = not E["mouth"]
        self.mouth.keyframe_insert("hide_render", frame=frame)

    def key_walk(self, f0, f1, start, end, fps, stride=0.3):
        """Slide root from start to end with an alternating leg cycle."""
        self.root.location = start
        self.root.keyframe_insert("location", frame=f0)
        self.root.location = end
        self.root.keyframe_insert("location", frame=f1)
        step = max(2, round(stride * fps))
        f, a = f0, True
        while f <= f1:
            self.key_pose(f, "walk_a" if a else "walk_b", blend=0)
            f += step
            a = not a
        self.key_pose(f1 + 3, "idle", blend=3)


def extra_spec(seed):
    """Random background person (crowds, queues). Not part of the main cast."""
    r = random.Random(seed)
    tops = ["#E85A9B", "#3FA65A", "#3A7BD5", "#F2B31B", "#9B59D0", "#E2393B", "#2EC4B6", "#FF8C42", "#5B6CFF"]
    bottoms = ["#2D3A5C", "#1F1F1F", "#4A4A4A", "#3B5BA5", "#6B4F3A"]
    skins = ["#F1C9A5", "#E9B98F", "#C98E5F", "#8D5A3B", "#5E3B26"]
    hairs = ["#2A1C14", "#3B2A20", "#C1592B", "#E3C16F", "#111111", "#7A7A7A"]
    return {
        "top": r.choice(tops), "bottom": r.choice(bottoms), "skin": r.choice(skins),
        "hair": r.choice(["short", "short", "long", "bun", "beanie", "cap", "none"]),
        "hair_color": r.choice(hairs), "hat_color": r.choice(tops),
        "height": r.uniform(0.92, 1.06), "build": "big" if r.random() < 0.12 else "regular",
    }
