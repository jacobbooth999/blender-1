"""Render presets and light rigs.

Light rigs:
  toybox         bright exterior: strong warm sun, flat cyan sky, punchy colours
  warm_interior  pub/house interior: black void, warm key, soft fill (add "pendant" props for practicals)
  night_exterior deep blue sky, cool moon, rely on emissive windows
  paper          even studio light for insert cards
"""
import bpy
from util import hex_rgb, rad

RIGS = {
    "toybox": {"world": "#8FD3FF", "world_strength": 1.0,
               "sun": {"energy": 4.0, "color": "#FFF4DE", "rot": (48, 0, -35), "angle": 3}},
    "warm_interior": {"world": "#0B0B0D", "world_strength": 1.0,
                      "area": [{"energy": 900, "color": "#FFE2B8", "loc": (-3, -4, 5), "size": 4},
                               {"energy": 300, "color": "#BFD8FF", "loc": (4, -3, 3), "size": 5}]},
    "night_exterior": {"world": "#0E1630", "world_strength": 1.0,
                       "sun": {"energy": 0.8, "color": "#9DB6FF", "rot": (60, 0, 30), "angle": 2},
                       "area": [{"energy": 1500, "color": "#FFD9A8", "loc": (0, -6, 5), "size": 8}]},
    "paper": {"world": "#3A2A20", "world_strength": 0.6,
              "area": [{"energy": 400, "color": "#FFFFFF", "loc": (0, -3, 3), "size": 5}]},
}


def setup_render(scene, cfg):
    r = scene.render
    r.resolution_x, r.resolution_y = cfg["resolution"]
    r.resolution_percentage = int(cfg.get("scale", 1.0) * 100)
    r.fps = cfg["fps"]
    eng = cfg.get("engine", "EEVEE").upper()
    r.engine = {"EEVEE": "BLENDER_EEVEE", "CYCLES": "CYCLES", "WORKBENCH": "BLENDER_WORKBENCH"}[eng]
    if eng == "EEVEE":
        e = scene.eevee
        e.taa_render_samples = cfg.get("samples", 32)
        e.use_shadows = True
        e.use_raytracing = True          # screen-space GI/AO: gives the soft contact shading
        e.use_fast_gi = True
    elif eng == "CYCLES":
        scene.cycles.samples = cfg.get("samples", 32)
        scene.cycles.use_denoising = True
    else:
        sh = scene.display.shading
        sh.light = "STUDIO"
        sh.color_type = "MATERIAL"
        sh.show_shadows = True
        sh.show_cavity = True
    vs = scene.view_settings
    vs.view_transform = "Standard"       # saturated toy colours, no filmic wash
    vs.look = "None"
    vs.exposure = cfg.get("exposure", 0.0)


def light_rig(scene, coll, name):
    rig = RIGS[name]
    w = bpy.data.worlds.new(f"W_{name}")
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (*hex_rgb(rig["world"]), 1)
    bg.inputs[1].default_value = rig["world_strength"]
    scene.world = w
    if "sun" in rig:
        s = rig["sun"]
        L = bpy.data.lights.new("sun", "SUN")
        L.energy = s["energy"]
        L.color = hex_rgb(s["color"])
        L.angle = rad(s["angle"])
        o = bpy.data.objects.new("sun", L)
        o.rotation_euler = tuple(rad(a) for a in s["rot"])
        coll.objects.link(o)
    for i, a in enumerate(rig.get("area", [])):
        L = bpy.data.lights.new(f"area{i}", "AREA")
        L.energy = a["energy"]
        L.color = hex_rgb(a["color"])
        L.size = a["size"]
        o = bpy.data.objects.new(f"area{i}", L)
        o.location = a["loc"]
        coll.objects.link(o)
        c = o.constraints.new("TRACK_TO")
        tgt = bpy.data.objects.new(f"area{i}_tgt", None)
        tgt.location = (0, 1.5, 1)
        coll.objects.link(tgt)
        c.target = tgt
