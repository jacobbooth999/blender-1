"""Build (and optionally render) an episode from its JSON file.

  blender -b -P blender/build.py -- episodes/demo.json [options]
  python  blender/build.py episodes/demo.json [options]          (with the `bpy` pip module)

Options:
  --stills 1.0,4.5,9     render PNG stills at these episode times (seconds)
  --video                render the whole edit to out/<name>.mp4
  --engine eevee|cycles|workbench    override the episode's engine
  --scale 0.5            resolution percentage (0.5 = 540x960 preview)
  --samples 16
  --no-save              skip writing out/<name>.blend

One scene is built per shot (its own set, lights, cast and camera). An "EDIT" scene strings
them together in the Video Sequencer and adds captions, stickers, bubbles, counters and the voice.
"""
import argparse
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402

import inserts  # noqa: E402
import look  # noqa: E402
import overlay  # noqa: E402
import sets  # noqa: E402
from mannequin import Mannequin, extra_spec  # noqa: E402
from timing import Times, load_words  # noqa: E402
from util import Clock, cylinder, mat, new_coll, rad, sphere, box  # noqa: E402

ROOT = os.path.dirname(HERE)


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--stills", default="")
    ap.add_argument("--video", action="store_true")
    ap.add_argument("--engine")
    ap.add_argument("--scale", type=float)
    ap.add_argument("--samples", type=int)
    ap.add_argument("--no-save", action="store_true")
    return ap.parse_args(argv)


def resolve(base, p):
    return p if os.path.isabs(p) else os.path.normpath(os.path.join(base, p))


def clean_file():
    for s in list(bpy.data.scenes)[1:]:
        bpy.data.scenes.remove(s)
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)


# ---- held props ---------------------------------------------------------------------------
def held(coll, kind, slot):
    if kind == "pint":
        parts = [cylinder("pint", coll, 0.06, 0.18, mat("#C98A2E", rough=0.2), loc=(0, 0, -0.09)),
                 cylinder("head", coll, 0.061, 0.03, mat("#FFF6E0"), loc=(0, 0, 0.09))]
    elif kind == "fish":
        parts = [sphere("fish", coll, 0.05, mat("#E2A64B"), loc=(0, -0.06, 0), scale=(0.8, 2.0, 0.6)),
                 box("tail", coll, (0.02, 0.06, 0.08), mat("#D0923A"), loc=(0, 0.06, 0))]
    elif kind == "salt":
        parts = [cylinder("salt", coll, 0.04, 0.14, mat("#F4F4F4"), loc=(0, 0, -0.07)),
                 cylinder("cap", coll, 0.042, 0.04, mat("#C0C0C0"), loc=(0, 0, 0.07))]
    elif kind == "phone":
        parts = [box("phone", coll, (0.08, 0.015, 0.15), mat("#151515", rough=0.2))]
    else:
        raise ValueError(f"unknown held prop {kind}")
    for p in parts:
        p.parent = slot


# ---- one shot -----------------------------------------------------------------------------
def build_shot(i, shot, t0, t1, cfg, cast, T, fonts):
    name = f"S{i:02d}_{shot.get('id', i)}"
    sc = bpy.data.scenes.new(name)
    look.setup_render(sc, cfg)
    fps = cfg["fps"]
    clock = Clock(fps, t0, T)
    n = max(1, round((t1 - t0) * fps))
    sc.frame_start, sc.frame_end = 1, n
    coll = sc.collection
    stage = new_coll(f"{name}_stage", coll)
    look.light_rig(sc, stage, shot.get("light", "toybox"))

    cam_d = bpy.data.cameras.new(f"{name}_cam")
    cam = bpy.data.objects.new(f"{name}_cam", cam_d)
    coll.objects.link(cam)
    sc.camera = cam
    tgt = bpy.data.objects.new(f"{name}_aim", None)
    coll.objects.link(tgt)
    tc = cam.constraints.new("TRACK_TO")
    tc.target = tgt
    tc.track_axis = "TRACK_NEGATIVE_Z"
    tc.up_axis = "UP_Y"

    actors = {}
    if "insert" in shot:
        info = inserts.build_insert(stage, shot["insert"], clock, fonts)
        c = Vector(info["center"])
        camspec = {"from": [0.1, -7.9, c.z + 0.05], "to": [-0.05, -7.2, c.z], "look": list(c), "lens": 50}
        camspec.update(shot.get("camera", {}))
    else:
        sets.build_set(stage, shot.get("set"))
        for p in shot.get("props", []):
            sets.add_prop(stage, p)
        actors = build_actors(shot, stage, cast, clock, T, fps)
        camspec = shot.get("camera", {})

    # camera: glide from -> to, aim look -> look_to, lens -> lens_to (eased)
    p0 = Vector(camspec.get("from", (0, -8, 1.6)))
    p1 = Vector(camspec.get("to", p0))
    a0 = Vector(camspec.get("look", (0, 0, 1.2)))
    a1 = Vector(camspec.get("look_to", a0))
    for f, p, a, lens in ((1, p0, a0, camspec.get("lens", 35)),
                          (n, p1, a1, camspec.get("lens_to", camspec.get("lens", 35)))):
        cam.location = p
        tgt.location = a
        cam_d.lens = lens
        cam.keyframe_insert("location", frame=f)
        tgt.keyframe_insert("location", frame=f)
        cam_d.keyframe_insert("lens", frame=f)
    dof = camspec.get("dof")
    if dof:
        cam_d.dof.use_dof = True
        cam_d.dof.aperture_fstop = dof.get("fstop", 2.8)
        focus = dof.get("focus")
        if isinstance(focus, str) and focus in actors:
            cam_d.dof.focus_object = actors[focus].p["head"]
        elif focus:
            cam_d.dof.focus_distance = (Vector(focus) - p0).length
        else:
            cam_d.dof.focus_object = tgt
    return sc, n


def build_actors(shot, coll, cast, clock, T, fps):
    actors = {}
    for k, a in enumerate(shot.get("actors", [])):
        who = a.get("who")
        spec = dict(cast[who]) if who else extra_spec(a.get("seed", k))
        spec.update(a.get("look", {}))
        m = Mannequin(f"{who or 'x'}{k}", spec, coll)
        m.place(tuple(a.get("at", (0, 0, 0))), a.get("face", 0))
        m.key_pose(1, a.get("pose", "idle"))
        m.key_face(1, a.get("expr", spec.get("expr", "neutral")))
        if a.get("hold"):
            held(coll, a["hold"], m.hand_slot)
        for key in a.get("keys", []):
            f = clock.f(T(key["t"]))
            if "pose" in key:
                m.key_pose(max(1, f), key["pose"], blend=key.get("blend", 4))
            if "expr" in key:
                m.key_face(max(1, f), key["expr"])
        if "walk" in a:
            w = a["walk"]
            m.key_walk(clock.f(T(w["t0"])), clock.f(T(w["t1"])), tuple(a.get("at", (0, 0, 0))), tuple(w["to"]), fps)
        if who:
            actors[who] = m
    # crowds: {"n": 30, "area": [x0, y0, x1, y1], "seed": 4, "pose": "cheer", "face": 0}
    for g, crowd in enumerate(shot.get("crowds", [])):
        import random
        r = random.Random(crowd.get("seed", g))
        x0, y0, x1, y1 = crowd["area"]
        poses = crowd.get("poses", [crowd.get("pose", "idle")])
        for j in range(crowd["n"]):
            m = Mannequin(f"crowd{g}_{j}", extra_spec(r.randrange(10 ** 6)), coll)
            m.place((r.uniform(x0, x1), r.uniform(y0, y1), 0), crowd.get("face", 0) + r.uniform(-20, 20))
            m.key_pose(1, r.choice(poses))
            m.key_face(1, crowd.get("expr", "neutral"))
    # queues: evenly spaced line of extras from -> to
    for g, q in enumerate(shot.get("queues", [])):
        a, b = Vector(q["from"]), Vector(q["to"])
        n = q["n"]
        for j in range(n):
            p = a.lerp(b, j / max(1, n - 1))
            m = Mannequin(f"queue{g}_{j}", extra_spec(q.get("seed", 0) * 1000 + j), coll)
            m.place(tuple(p), q.get("face", 0))
            m.key_pose(1, q.get("pose", "idle"))
            m.key_face(1, "neutral")
    return actors


# ---- whole episode ------------------------------------------------------------------------
def main():
    args = parse_args()
    ep_path = os.path.abspath(args.episode)
    base = os.path.dirname(ep_path)
    with open(ep_path) as f:
        ep = json.load(f)
    name = ep.get("name", os.path.splitext(os.path.basename(ep_path))[0])

    cfg = {"fps": ep.get("fps", 30), "resolution": ep.get("resolution", [1080, 1920]),
           "engine": args.engine or ep.get("engine", "EEVEE"), "samples": args.samples or ep.get("samples", 32),
           "scale": args.scale or ep.get("scale", 1.0)}
    fps = cfg["fps"]
    with open(resolve(base, ep.get("cast", "../cast.json"))) as f:
        cast = json.load(f)["characters"]
    words = load_words(resolve(base, ep["words"]) if ep.get("words") else None, ep.get("script"), ep.get("wps", 4.0))
    T = Times(words)
    if not ep.get("words"):
        os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
        with open(os.path.join(ROOT, "out", f"{name}.words.auto.json"), "w") as f:
            json.dump(words, f, indent=1)

    clean_file()
    fonts = {"caption": bpy.data.fonts.load(os.path.join(ROOT, "fonts", "Poppins-ExtraBold.ttf")),
             "sticker": bpy.data.fonts.load(os.path.join(ROOT, "fonts", "LuckiestGuy-Regular.ttf"))}

    shots = ep["shots"]
    total = T(ep.get("end"), words["duration"] + ep.get("tail", 0.5))
    starts = [0.0] + [T(s["start"]) for s in shots[1:]]
    edit = bpy.context.scene
    edit.name = "EDIT"
    look.setup_render(edit, cfg)
    edit.render.use_sequencer = True
    edit.sequence_editor_create()
    strips = edit.sequence_editor.strips

    frame = 1
    for i, shot in enumerate(shots):
        t0 = starts[i]
        t1 = starts[i + 1] if i + 1 < len(shots) else total
        sc, n = build_shot(i, shot, t0, t1, cfg, cast, T, fonts)
        f_start = 1 + round(t0 * fps)
        st = strips.new_scene(name=sc.name, scene=sc, channel=1 + (i % 2), frame_start=f_start)
        if hasattr(st, "right_handle"):
            st.right_handle = f_start + n
        else:
            st.frame_final_duration = n
        frame = f_start + n
        print(f"[build] shot {sc.name}: {t0:.2f}-{t1:.2f}s ({n} frames)")
    edit.frame_start, edit.frame_end = 1, frame - 1

    if ep.get("voice"):
        strips.new_sound(name="voice", filepath=resolve(base, ep["voice"]), channel=4, frame_start=1)
    H = cfg["resolution"][1]
    overlay.captions(edit, words["words"], fps, fonts, H, ep.get("caption_replace"))
    stk = bub = cnt = 0
    for shot in shots:
        for s in shot.get("stickers", []):
            overlay.sticker(edit, dict(s, t=T(s["t"])), fps, fonts, H, stk)
            stk += 1
        for b in shot.get("bubbles", []):
            overlay.bubble(edit, dict(b, t=T(b["t"])), fps, fonts, H, bub)
            bub += 1
        for c in shot.get("counters", []):
            c = dict(c, steps=[dict(s, t=T(s["t"])) for s in c["steps"]], until=T(c["until"]))
            overlay.counter(edit, c, fps, fonts, H, cnt)
            cnt += 1

    out = os.path.join(ROOT, "out")
    os.makedirs(out, exist_ok=True)
    if not args.no_save:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out, f"{name}.blend"))
        print(f"[build] saved out/{name}.blend  ({edit.frame_end} frames, {edit.frame_end / fps:.1f}s)")

    if args.stills:
        os.makedirs(os.path.join(out, name), exist_ok=True)
        for t in [float(x) for x in args.stills.split(",")]:
            f = 1 + round(t * fps)
            edit.frame_set(f)
            edit.render.image_settings.file_format = "PNG"
            edit.render.filepath = os.path.join(out, name, f"still_{t:05.2f}s.png")
            bpy.ops.render.render(write_still=True, scene=edit.name)
            print(f"[build] still {edit.render.filepath}")
    if args.video:
        r = edit.render
        # H.264 needs even width and height: nudge the percentage to the nearest one that gives both
        pct = r.resolution_percentage
        X, Y = r.resolution_x, r.resolution_y
        ok = [p for p in range(1, 101) if (X * p // 100) % 2 == 0 and (Y * p // 100) % 2 == 0]
        best = min(ok, key=lambda p: abs(p - pct))
        if best != pct:
            print(f"[build] scale {pct}% -> {best}% so the video size is even")
            for s in bpy.data.scenes:
                s.render.resolution_percentage = best
        if hasattr(r.image_settings, "media_type"):
            r.image_settings.media_type = "VIDEO"
        r.image_settings.file_format = "FFMPEG"
        r.ffmpeg.format = "MPEG4"
        r.ffmpeg.codec = "H264"
        r.ffmpeg.constant_rate_factor = "HIGH"
        r.ffmpeg.audio_codec = "AAC" if ep.get("voice") else "NONE"
        r.filepath = os.path.join(out, f"{name}.mp4")
        bpy.ops.render.render(animation=True, scene=edit.name)
        print(f"[build] video {r.filepath}")


if __name__ == "__main__":
    main()
