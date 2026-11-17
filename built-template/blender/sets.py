"""Kit-bash set pieces built from primitives. Units are metres, Z up, camera side is -Y.

Every builder takes (coll, **params) and returns nothing. Sets are chosen per shot in the
episode file with {"type": "<name>", ...params}.
"""
import random
from util import mat, box, sphere, cylinder, capsule, rad

GRASS = "#6CCB3F"
ROAD = "#4A4E57"
PAVE = "#C9C3B8"


# ---- props -------------------------------------------------------------------------------
def tree(coll, at, h=1.0, seed=0):
    r = random.Random(seed)
    x, y = at[0], at[1]
    cylinder("trunk", coll, 0.12 * h, 1.2 * h, mat("#7A5233"), loc=(x, y, 0))
    sphere("canopy", coll, 0.85 * h, mat(r.choice(["#3FA34D", "#4CB050", "#5DBB4A"])), loc=(x, y, 1.75 * h),
           scale=(1, 1, 0.95))


def table(coll, at=(0, 0, 0), w=1.6, d=0.9, h=0.75, color="#8A5A3C", round_top=False):
    x, y, z = at
    m = mat(color, rough=0.45)
    if round_top:
        cylinder("tabletop", coll, w / 2, 0.06, m, loc=(x, y, z + h - 0.06), seg=40)
        cylinder("tableleg", coll, 0.06, h - 0.06, m, loc=(x, y, z))
        cylinder("tablefoot", coll, 0.3, 0.04, m, loc=(x, y, z))
        return
    box("tabletop", coll, (w, d, 0.06), m, loc=(x, y, z + h - 0.03), bevel=0.01)
    for sx in (-1, 1):
        for sy in (-1, 1):
            box("leg", coll, (0.06, 0.06, h - 0.06), m, loc=(x + sx * (w / 2 - 0.08), y + sy * (d / 2 - 0.08), z + (h - 0.06) / 2))


def chair(coll, at=(0, 0, 0), face=0, color="#8A5A3C"):
    import math
    x, y, z = at
    m = mat(color, rough=0.45)
    box("seat", coll, (0.45, 0.45, 0.05), m, loc=(x, y, z + 0.45), bevel=0.01)
    # backrest on the side opposite to where the sitter faces
    dx, dy = -math.sin(rad(face)) * 0.21, math.cos(rad(face)) * 0.21
    box("back", coll, (0.45 if face % 180 == 0 else 0.05, 0.05 if face % 180 == 0 else 0.45, 0.5), m,
        loc=(x + dx, y + dy, z + 0.72))
    for sx in (-1, 1):
        for sy in (-1, 1):
            box("cleg", coll, (0.04, 0.04, 0.45), m, loc=(x + sx * 0.19, y + sy * 0.19, z + 0.225))


def sofa(coll, at=(0, 0, 0), w=2.0, color="#3E6FB0"):
    x, y, z = at
    m = mat(color)
    box("sofa_base", coll, (w, 0.85, 0.42), m, loc=(x, y, z + 0.21), bevel=0.06)
    box("sofa_back", coll, (w, 0.25, 0.85), m, loc=(x, y + 0.32, z + 0.43), bevel=0.08)
    for sx in (-1, 1):
        box("sofa_arm", coll, (0.22, 0.85, 0.62), m, loc=(x + sx * (w / 2 - 0.11), y, z + 0.31), bevel=0.08)


def counter(coll, at=(0, 0, 0), w=3.0, color="#7A4B2E", top="#C9C2B4"):
    x, y, z = at
    box("counter", coll, (w, 0.7, 1.05), mat(color), loc=(x, y, z + 0.525), bevel=0.02)
    box("counter_top", coll, (w + 0.1, 0.8, 0.06), mat(top, rough=0.7), loc=(x, y, z + 1.08), bevel=0.01)


def rug(coll, at=(0, 0, 0), w=2.6, d=1.8, color="#D2553A", border="#F2B31B"):
    x, y, z = at
    box("rug_border", coll, (w, d, 0.01), mat(border), loc=(x, y, z + 0.005))
    box("rug", coll, (w - 0.2, d - 0.2, 0.012), mat(color), loc=(x, y, z + 0.008))


def pendant(coll, at=(0, 0, 2.6), color="#2F5D46"):
    import bpy
    x, y, z = at
    cylinder("flex", coll, 0.01, 0.8, mat("#222222"), loc=(x, y, z - 0.8 + 0.8))
    cylinder("shade", coll, 0.32, 0.25, mat(color, rough=0.4), loc=(x, y, z - 0.25), cap_scale=0.25)
    sphere("bulb", coll, 0.07, mat("#FFF2C6", emit=6), loc=(x, y, z - 0.27))
    L = bpy.data.lights.new("pendant", "POINT")
    L.energy = 180
    L.color = (1.0, 0.85, 0.62)
    L.shadow_soft_size = 0.2
    o = bpy.data.objects.new("pendant_light", L)
    o.location = (x, y, z - 0.35)
    coll.objects.link(o)


def toilet(coll, at=(0, 0, 0), face=0):
    import bpy
    x, y, z = at
    w = mat("#F4F4F2", rough=0.25)
    parts = [
        cylinder("pan", coll, 0.2, 0.38, w, loc=(0, 0, 0), cap_scale=0.8),
        cylinder("seat", coll, 0.24, 0.05, w, loc=(0, -0.03, 0.38)),
        box("cistern", coll, (0.42, 0.18, 0.4), w, loc=(0, 0.22, 0.62), bevel=0.03),
    ]
    piv = bpy.data.objects.new("toilet", None)
    coll.objects.link(piv)
    for p in parts:
        p.parent = piv
    piv.location = (x, y, z)
    piv.rotation_euler = (0, 0, rad(face))


def shed(coll, at=(0, 0, 0), w=2.4, d=2.0, h=2.1, color="#8C5A3A", roof="#4A3B33"):
    x, y, z = at
    box("shed", coll, (w, d, h), mat(color), loc=(x, y, z + h / 2))
    for i in range(int(w / 0.3)):
        box("plank", coll, (0.02, 0.02, h), mat("#6E452C"), loc=(x - w / 2 + 0.15 + i * 0.3, y - d / 2 - 0.005, z + h / 2))
    box("roof", coll, (w + 0.3, d + 0.3, 0.12), mat(roof), loc=(x, y, z + h + 0.06))
    box("door", coll, (0.8, 0.04, 1.7), mat("#5B3A26"), loc=(x + w * 0.2, y - d / 2 - 0.02, z + 0.85))
    box("hatch", coll, (0.9, 0.04, 0.6), mat("#FFE6A8", emit=1.5), loc=(x - w * 0.22, y - d / 2 - 0.02, z + 1.25))


def bench(coll, at=(0, 0, 0), w=2.0, color="#9A6A44"):
    x, y, z = at
    m = mat(color)
    box("bench_seat", coll, (w, 0.45, 0.06), m, loc=(x, y, z + 0.45), bevel=0.01)
    box("bench_back", coll, (w, 0.06, 0.4), m, loc=(x, y + 0.2, z + 0.75), bevel=0.01)
    for sx in (-1, 1):
        box("bench_leg", coll, (0.06, 0.45, 0.45), mat("#333333"), loc=(x + sx * (w / 2 - 0.1), y, z + 0.225))


def bird(coll, at=(0, 0, 0), face=0):
    """Generic cartoon gull-ish bird."""
    import bpy
    x, y, z = at
    white, grey, beak = mat("#F5F5F5"), mat("#9AA3AD"), mat("#F2B31B")
    parts = [
        sphere("b_body", coll, 0.16, white, loc=(0, 0, 0.22), scale=(0.8, 1.3, 0.8)),
        sphere("b_head", coll, 0.1, white, loc=(0, -0.18, 0.36)),
        box("b_beak", coll, (0.04, 0.1, 0.03), beak, loc=(0, -0.3, 0.35), bevel=0.01),
        sphere("b_wingL", coll, 0.1, grey, loc=(0.12, 0.02, 0.26), scale=(0.3, 1.2, 0.6)),
        sphere("b_wingR", coll, 0.1, grey, loc=(-0.12, 0.02, 0.26), scale=(0.3, 1.2, 0.6)),
        sphere("b_eye", coll, 0.018, mat("#111111"), loc=(0.06, -0.24, 0.39)),
        sphere("b_eye2", coll, 0.018, mat("#111111"), loc=(-0.06, -0.24, 0.39)),
    ]
    piv = bpy.data.objects.new("bird", None)
    coll.objects.link(piv)
    for p in parts:
        p.parent = piv
    piv.location = (x, y, z)
    piv.rotation_euler = (0, 0, rad(face))


def plate_food(coll, at=(0, 0, 0)):
    x, y, z = at
    cylinder("plate", coll, 0.16, 0.02, mat("#FFFFFF", rough=0.2), loc=(x, y, z))
    f = capsule("fish", coll, 0.05, 0.22, mat("#E2A64B"), down=False, scale=(1.2, 1, 1))
    f.location = (x, y, z + 0.05)
    f.rotation_euler = (0, rad(90), rad(20))


PROPS = {
    "tree": tree, "table": table, "chair": chair, "sofa": sofa, "counter": counter, "rug": rug,
    "pendant": pendant, "toilet": toilet, "shed": shed, "bench": bench, "bird": bird, "plate": plate_food,
}


def add_prop(coll, spec):
    spec = dict(spec)
    kind = spec.pop("type")
    if "at" in spec:
        spec["at"] = tuple(spec["at"])
    PROPS[kind](coll, **spec)


# ---- whole sets --------------------------------------------------------------------------
def field(coll, road=True, trees=14, seed=1, grass=GRASS):
    """Bright open ground (toybox look). Optional road running left-right behind the action."""
    box("ground", coll, (200, 200, 0.1), mat(grass, rough=0.9), loc=(0, 0, -0.05))
    if road:
        box("road", coll, (200, 7, 0.02), mat(ROAD, rough=0.8), loc=(0, 9, 0.01))
        for i in range(-30, 31):
            box("dash", coll, (1.6, 0.15, 0.01), mat("#FFFFFF"), loc=(i * 4, 9, 0.025))
        box("verge", coll, (200, 0.3, 0.25), mat("#B8B8B0"), loc=(0, 5.4, 0.12))
    r = random.Random(seed)
    for i in range(trees):
        x = r.uniform(-30, 30)
        y = r.uniform(14, 40) if road else r.uniform(6, 40)
        tree(coll, (x, y), h=r.uniform(0.8, 1.4), seed=i)


def street(coll, houses=8, seed=2, night=False, door="#C8243A"):
    """Row of terraced houses behind a pavement, road in the foreground."""
    r = random.Random(seed)
    box("ground", coll, (200, 200, 0.1), mat("#5B6067" if night else ROAD, rough=0.8), loc=(0, 0, -0.05))
    box("pavement", coll, (200, 4, 0.15), mat(PAVE, rough=0.85), loc=(0, 2, 0.075))
    box("kerb", coll, (200, 0.2, 0.18), mat("#A8A39A"), loc=(0, 0, 0.09))
    for i in range(-30, 31):
        box("dash", coll, (1.6, 0.15, 0.01), mat("#FFFFFF"), loc=(i * 4, -3.5, 0.01))
    hw, hh, depth = 5.0, 6.4, 6
    brick = ["#A4553F", "#B5644A", "#9A4B39", "#B86E50"]
    win_off, win_on = mat("#1E2533", rough=0.2), mat("#FFD27A", emit=4 if night else 0.6)
    for i in range(houses):
        x = (i - (houses - 1) / 2) * hw
        box("house", coll, (hw - 0.04, depth, hh), mat(r.choice(brick)), loc=(x, 4 + depth / 2, hh / 2))
        box("roof", coll, (hw, depth * 0.7, 0.4), mat("#3C4250"), loc=(x, 4 + depth / 2, hh + 0.2))
        box("chimney", coll, (0.6, 0.6, 0.9), mat("#8F4634"), loc=(x + 1.6, 6.5, hh + 0.6))
        box("door", coll, (1.0, 0.1, 2.1), mat(door if i % 3 == 0 else r.choice(["#2F5D46", "#1F3B73", "#222222"])),
            loc=(x - 1.4, 3.97, 1.2))
        box("step", coll, (1.3, 0.4, 0.15), mat("#D8D2C4"), loc=(x - 1.4, 3.8, 0.22))
        for wx, wz in ((0.9, 1.6), (-1.2, 4.4), (1.2, 4.4)):
            lit = night and r.random() < 0.7
            box("sill", coll, (1.3, 0.15, 0.1), mat("#E8E4DA"), loc=(x + wx, 3.95, wz - 0.75))
            box("window", coll, (1.1, 0.06, 1.3), win_on if lit else win_off, loc=(x + wx, 3.98, wz))


def room(coll, w=6.0, d=5.0, h=3.0, wall="#EFE6D2", wall2=None, floor="#B07B4F", skirting="#FFFFFF",
         window=True, window_color="#9FD3F5", bunting=False, seed=3):
    """Dollhouse cutaway: floor plus back and left walls only, floating in the world colour."""
    wall2 = wall2 or wall
    box("floor", coll, (w, d, 0.2), mat(floor, rough=0.7), loc=(0, d / 2, -0.1))
    box("wall_back", coll, (w, 0.2, h), mat(wall), loc=(0, d + 0.1, h / 2))
    box("wall_left", coll, (0.2, d, h), mat(wall2), loc=(-w / 2 - 0.1, d / 2, h / 2))
    box("skirt_back", coll, (w, 0.04, 0.14), mat(skirting), loc=(0, d - 0.02, 0.07))
    box("skirt_left", coll, (0.04, d, 0.14), mat(skirting), loc=(-w / 2 + 0.02, d / 2, 0.07))
    if window:
        box("frame", coll, (1.6, 0.06, 1.3), mat("#FFFFFF"), loc=(w * 0.15, d - 0.01, h * 0.58))
        box("glass", coll, (1.4, 0.07, 1.1), mat(window_color, emit=0.8), loc=(w * 0.15, d - 0.01, h * 0.58))
    if bunting:
        r = random.Random(seed)
        cols = ["#E2393B", "#F2B31B", "#3D9BE0", "#3FBF5A", "#E8457F"]
        n = int(w / 0.4)
        for i in range(n):
            x = -w / 2 + 0.2 + i * 0.4
            sag = 0.18 * (1 - ((i - n / 2) / (n / 2)) ** 2)
            b = box("flag", coll, (0.2, 0.02, 0.2), mat(r.choice(cols)))
            b.location = (x, d - 0.03, h - 0.35 - sag)
            b.rotation_euler = (0, rad(45), 0)


SETS = {"field": field, "street": street, "room": room, "none": lambda coll, **k: None}


def build_set(coll, spec):
    spec = dict(spec or {"type": "none"})
    kind = spec.pop("type", "none")
    SETS[kind](coll, **spec)
