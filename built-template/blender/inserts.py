"""Flat "paper" insert cards that carry information and fill in over time.

Insert spec (in a shot):
  "insert": {
    "title": "MENU",
    "columns": ["ITEM", "PRICE"],              optional header row
    "rows": [{"cells": ["Cod", "£8.50"], "t": 9.4}, ...],   t = when the row appears (episode s)
    "stamp": {"text": "CURRY?!", "t": 10.2},    optional big red stamp across the card
    "color": "#F6EBD5", "border": "#D8343A"
  }
The camera for an insert shot is placed automatically (straight on, slight drift).
"""
import bpy
from util import mat, box, rad


def _text(coll, body, size, color, loc, font, align="CENTER", emit=0.0):
    cu = bpy.data.curves.new("txt", "FONT")
    cu.body = body
    cu.size = size
    cu.align_x = align
    cu.align_y = "CENTER"
    if font:
        cu.font = font
    ob = bpy.data.objects.new("txt", cu)
    ob.location = loc
    ob.rotation_euler = (rad(90), 0, 0)
    ob.data.materials.append(mat(color, rough=0.8, emit=emit))
    coll.objects.link(ob)
    return ob


def _show_from(ob, frame):
    if frame <= 1:
        return
    ob.hide_render = True
    ob.keyframe_insert("hide_render", frame=1)
    ob.hide_render = False
    ob.keyframe_insert("hide_render", frame=frame)


def build_insert(coll, spec, clock, fonts):
    W, H = 2.5, 3.6
    paper = spec.get("color", "#F6EBD5")
    border = spec.get("border", "#D8343A")
    ink = spec.get("ink", "#2B2B6B")
    box("table_bg", coll, (12, 0.2, 12), mat(spec.get("background", "#5A3B28")), loc=(0, 0.25, H / 2))
    box("card_border", coll, (W, 0.03, H), mat(border), loc=(0, 0.1, H / 2), bevel=0.02)
    box("card", coll, (W - 0.12, 0.035, H - 0.12), mat(paper, rough=0.9), loc=(0, 0.09, H / 2))
    disp = fonts.get("sticker")
    body = fonts.get("caption")
    _text(coll, spec.get("title", ""), 0.38, border, (0, 0.05, H - 0.45), disp)
    y = H - 0.95
    cols = spec.get("columns")
    if cols:
        _text(coll, cols[0], 0.14, "#555555", (-W / 2 + 0.3, 0.05, y), body, align="LEFT")
        _text(coll, cols[-1], 0.14, "#555555", (W / 2 - 0.3, 0.05, y), body, align="RIGHT")
        box("rule", coll, (W - 0.5, 0.01, 0.015), mat("#BBBBBB"), loc=(0, 0.06, y - 0.15))
        y -= 0.4
    step = min(0.42, (y - 0.3) / max(1, len(spec.get("rows", []))))
    for row in spec.get("rows", []):
        cells = row["cells"]
        hl = row.get("highlight")
        a = _text(coll, cells[0], 0.2, hl or ink, (-W / 2 + 0.3, 0.05, y), body, align="LEFT")
        b = _text(coll, cells[-1], 0.2, hl or ink, (W / 2 - 0.3, 0.05, y), body, align="RIGHT")
        if "t" in row:
            _show_from(a, clock.f(row["t"]))
            _show_from(b, clock.f(row["t"]))
        y -= step
    st = spec.get("stamp")
    if st:
        s = _text(coll, st["text"], 0.55, "#E2393B", (0, 0.0, H / 2), disp)
        s.rotation_euler = (rad(90), rad(-10), 0)
        _show_from(s, clock.f(st["t"]))
    return {"center": (0, 0, H / 2), "size": (W, H)}
