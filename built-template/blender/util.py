"""Shared helpers: materials, primitive meshes, linking, timing."""
import math
import bmesh
import bpy
from mathutils import Vector

_MATS = {}


def hex_rgb(h):
    """'#E8742A' -> linear RGB tuple (Blender expects linear values)."""
    h = h.lstrip("#")
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb)


def mat(color, rough=0.6, emit=0.0, name=None):
    """Matte toy material, cached by colour/roughness/emission."""
    key = (color, rough, emit)
    if key in _MATS:
        return _MATS[key]
    m = bpy.data.materials.new(name or f"M_{color.lstrip('#')}_{int(emit * 10)}")
    if m.node_tree is None:
        m.use_nodes = True
    p = m.node_tree.nodes.get("Principled BSDF")
    rgb = hex_rgb(color)
    p.inputs["Base Color"].default_value = (*rgb, 1)
    p.inputs["Roughness"].default_value = rough
    if emit:
        p.inputs["Emission Color"].default_value = (*rgb, 1)
        p.inputs["Emission Strength"].default_value = emit
    m.diffuse_color = (*rgb, 1)  # used by Workbench previews
    _MATS[key] = m
    return m


def reset_material_cache():
    _MATS.clear()


def link(obj, coll):
    coll.objects.link(obj)
    return obj


def new_coll(name, parent):
    c = bpy.data.collections.new(name)
    parent.children.link(c)
    return c


def mesh_obj(name, bm, coll, material=None, smooth=True):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    if smooth:
        for poly in me.polygons:
            poly.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    if material:
        ob.data.materials.append(material)
    return link(ob, coll)


def capsule(name, coll, radius, length, material, down=True, seg=20, scale=(1, 1, 1)):
    """Capsule along Z. down=True: top cap centre at origin, body hangs to -length (limbs)."""
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=seg // 2 + (seg // 2) % 2, radius=radius)
    half = max(length - 2 * radius, 0) / 2
    for v in bm.verts:
        v.co.z += half if v.co.z > 1e-6 else (-half if v.co.z < -1e-6 else 0)
        v.co.x *= scale[0]
        v.co.y *= scale[1]
        v.co.z *= scale[2]
    if down:
        off = -(half + radius) * scale[2]
        for v in bm.verts:
            v.co.z += off
    return mesh_obj(name, bm, coll, material)


def sphere(name, coll, radius, material, loc=(0, 0, 0), scale=(1, 1, 1), seg=24):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=seg // 2, radius=radius)
    for v in bm.verts:
        v.co = Vector((v.co.x * scale[0], v.co.y * scale[1], v.co.z * scale[2])) + Vector(loc)
    return mesh_obj(name, bm, coll, material)


def box(name, coll, size, material, loc=(0, 0, 0), bevel=0.0, smooth=False):
    """Axis-aligned box; size=(x,y,z) full extents, loc=centre."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2])) + Vector(loc)
    if bevel:
        bmesh.ops.bevel(bm, geom=bm.edges[:], offset=bevel, segments=3, affect='EDGES')
        smooth = True
    return mesh_obj(name, bm, coll, material, smooth=smooth)


def cylinder(name, coll, radius, depth, material, loc=(0, 0, 0), seg=24, cap_scale=1.0):
    """Cylinder standing on loc (base at loc.z)."""
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=radius, radius2=radius * cap_scale, depth=depth)
    for v in bm.verts:
        v.co += Vector(loc) + Vector((0, 0, depth / 2))
    return mesh_obj(name, bm, coll, material)


def empty(name, coll, loc=(0, 0, 0), parent=None, size=0.1):
    e = bpy.data.objects.new(name, None)
    e.empty_display_size = size
    e.location = loc
    if parent:
        e.parent = parent
    return link(e, coll)


def parent_keep(child, parent):
    """Parent without moving the child in world space (both at rest)."""
    child.parent = parent
    child.matrix_parent_inverse = parent.matrix_world.inverted()


def rad(d):
    return math.radians(d)


class Clock:
    """Converts episode seconds to frames for one shot scene (frames start at 1)."""

    def __init__(self, fps, shot_start, resolve=None):
        self.fps = fps
        self.t0 = shot_start
        self.resolve = resolve

    def f(self, t_global):
        if not isinstance(t_global, (int, float)):
            t_global = self.resolve(t_global)
        return 1 + round((t_global - self.t0) * self.fps)
