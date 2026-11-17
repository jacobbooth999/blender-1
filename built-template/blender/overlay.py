"""2D graphics layer, built in the Video Sequencer on top of the shot scenes.

  captions  one word at a time, white heavy sans, fixed at ~65% frame height
  stickers  chunky display word, tilted, pops in with overshoot; colour = meaning
  bubbles   white rounded box with 1-2 black words (character lines)
  counters  a value that changes over time ("HERE: 12" -> "HERE: 200"), styled like a bubble

Positions are normalised (x, y) with y measured from the BOTTOM of the frame (VSE convention).
"""
import random
import bpy
from util import hex_rgb

STICKER_COLORS = {
    "label": "#F7B924",   # names and labels: THE COURSE, 6:00 AM
    "win": "#45C85E",     # wins, rules met
    "bad": "#E8363A",     # bad news: REFUSED, WARM?!
    "rule": "#43A3EA",    # rules / the law
    "cta": "#EC4A86",     # TAP FOLLOW
}

CAPTION_Y = 0.35   # 65% down from the top
STICKER_Y = 0.80   # upper third


def _rgba(h, a=1.0):
    return (*hex_rgb(h), a)


def _strips(scene):
    return scene.sequence_editor.strips


def _text_strip(scene, name, text, f0, f1, channel):
    st = _strips(scene).new_effect(name=name, type="TEXT", channel=channel, frame_start=f0, length=max(1, f1 - f0))
    st.text = text
    st.alignment_x = "CENTER"
    st.anchor_x = "CENTER"
    st.anchor_y = "CENTER"
    st.blend_type = "ALPHA_OVER"
    return st


def captions(scene, words, fps, fonts, H, replace=None, channel=10, y=CAPTION_Y):
    replace = {k.lower(): v for k, v in (replace or {}).items()}
    for i, w in enumerate(words):
        f0 = 1 + round(w["start"] * fps)
        nxt = words[i + 1]["start"] if i + 1 < len(words) else w["end"] + 0.4
        f1 = 1 + round(min(nxt, w["end"] + 0.6) * fps)
        if f1 <= f0:
            f1 = f0 + 1
        raw = w["word"]
        core = raw.strip(".,!?;:").lower()
        text = raw.replace(raw.strip(".,!?;:"), replace[core]) if core in replace else raw
        st = _text_strip(scene, f"cap{i:03d}", text, f0, f1, channel + (i % 2))
        st.font = fonts["caption"]
        st.font_size = round(H * 0.05)
        st.color = (1, 1, 1, 1)
        st.use_outline = True
        st.outline_color = (0.05, 0.05, 0.05, 1)
        st.outline_width = 0.06
        st.use_shadow = True
        st.shadow_color = (0, 0, 0, 0.55)
        st.shadow_offset = 0.06
        st.shadow_blur = 0.4
        st.location = (0.5, y)


def _pop(st, f0, fps):
    """Overshoot pop: 30% -> 118% -> 100% over ~0.2 s, pivoting on the sticker itself."""
    tr = st.transform
    a, b = f0, f0 + max(2, round(0.1 * fps))
    c = b + max(2, round(0.1 * fps))
    for f, s in ((a, 0.3), (b, 1.18), (c, 1.0)):
        tr.scale_x = s
        tr.scale_y = s
        tr.keyframe_insert("scale_x", frame=f)
        tr.keyframe_insert("scale_y", frame=f)


def sticker(scene, spec, fps, fonts, H, idx, channel=14):
    f0 = 1 + round(spec["t"] * fps)
    f1 = f0 + round(spec.get("dur", 1.2) * fps)
    st = _text_strip(scene, f"stk{idx:02d}", spec["text"], f0, f1, channel + (idx % 2))
    st.font = fonts["sticker"]
    st.font_size = round(H * spec.get("size", 0.07))
    st.color = _rgba(spec.get("color", STICKER_COLORS[spec.get("kind", "label")]))
    st.use_outline = True
    st.outline_color = (0.06, 0.05, 0.05, 1)
    st.outline_width = 0.12
    st.use_shadow = True
    st.shadow_color = (0, 0, 0, 0.8)
    st.shadow_offset = 0.05
    st.shadow_blur = 0.0
    x, y = spec.get("pos", (0.5, STICKER_Y))
    st.location = (x, y)
    st.transform.origin = (x, y)
    tilt = spec.get("tilt")
    if tilt is None:
        r = random.Random(spec["text"])
        tilt = r.choice([-1, 1]) * r.uniform(3, 8)
    st.transform.rotation = tilt * 3.14159265 / 180
    _pop(st, f0, fps)


def bubble(scene, spec, fps, fonts, H, idx, channel=18):
    f0 = 1 + round(spec["t"] * fps)
    f1 = f0 + round(spec.get("dur", 1.0) * fps)
    st = _text_strip(scene, f"bub{idx:02d}", spec["text"], f0, f1, channel + (idx % 2))
    st.font = fonts["caption"]
    st.font_size = round(H * spec.get("size", 0.032))
    st.color = _rgba(spec.get("ink", "#111111"))
    st.use_box = True
    st.box_color = _rgba(spec.get("box", "#FFFFFF"))
    st.box_margin = 0.012
    st.box_roundness = 0.6
    st.use_outline = False
    x, y = spec.get("pos", (0.5, 0.7))
    st.location = (x, y)
    st.transform.origin = (x, y)
    _pop(st, f0, fps)


def counter(scene, spec, fps, fonts, H, idx, channel=22):
    """spec: {"steps": [{"t": 0.3, "text": "HERE: 12"}, ...], "until": 3.6, "pos": [x, y]}"""
    steps = spec["steps"]
    for j, s in enumerate(steps):
        t1 = steps[j + 1]["t"] if j + 1 < len(steps) else spec["until"]
        b = dict(spec, t=s["t"], dur=t1 - s["t"], text=s["text"])
        f0 = 1 + round(b["t"] * fps)
        f1 = 1 + round(t1 * fps)
        st = _text_strip(scene, f"cnt{idx:02d}_{j:02d}", b["text"], f0, f1, channel + (j % 2))
        st.font = fonts["caption"]
        st.font_size = round(H * spec.get("size", 0.036))
        st.color = _rgba(s.get("ink", spec.get("ink", "#D8343A")))
        st.use_box = True
        st.box_color = _rgba("#FFFFFF")
        st.box_margin = 0.014
        st.box_roundness = 0.4
        st.location = tuple(spec.get("pos", (0.5, 0.62)))
