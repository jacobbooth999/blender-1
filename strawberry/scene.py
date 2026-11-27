"""Cute juicy strawberry character that eats a mini strawberry.

Run:  python3 scene.py --shot 1 [--samples 128] [--scale 1.0] [--out out/stills]
Builds the whole scene procedurally with bpy (Blender as a Python module) and renders one pose.
"""
import argparse
import math
import os
import sys

import bpy  # noqa: must load before bmesh
import bmesh
import bpy
import numpy as np
from mathutils import Euler, Matrix, Quaternion, Vector
from mathutils.bvhtree import BVHTree

HERE = os.path.dirname(os.path.abspath(__file__))
RNG = np.random.default_rng(7)


# ----------------------------------------------------------------------------- helpers
def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def link(obj):
    bpy.context.scene.collection.objects.link(obj)
    return obj


def mesh_obj(name, verts, faces, smooth=True):
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(v) for v in verts], [], [tuple(f) for f in faces])
    me.update()
    if smooth:
        me.shade_smooth()
    return link(bpy.data.objects.new(name, me))


def uv_sphere(name, seg=48, rings=24, radius=1.0):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=radius)
    bm.to_mesh(me)
    bm.free()
    me.shade_smooth()
    return link(bpy.data.objects.new(name, me))


def node_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    return m, nt, bsdf


def setv(bsdf, key, val):
    if key in bsdf.inputs:
        bsdf.inputs[key].default_value = val


def look_quat(normal, up=Vector((0, 0, 1))):
    """Rotation that points local -Y along `normal` with local Z roughly up."""
    return Vector(normal).to_track_quat("-Y", "Z")


# ----------------------------------------------------------------------------- materials
def mat_berry(name="berry", blush_pts=(), blush_r=0.2):
    m, nt, b = node_mat(name)
    N, L = nt.nodes, nt.links
    tc = N.new("ShaderNodeTexCoord")
    sep = N.new("ShaderNodeSeparateXYZ")
    L.new(tc.outputs["Object"], sep.inputs[0])
    # red with subtle mottling; slightly lighter/orange shoulders near top
    noise = N.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 6.0
    noise.inputs["Detail"].default_value = 6.0
    L.new(tc.outputs["Object"], noise.inputs["Vector"])
    ramp = N.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.22, 0.002, 0.008, 1)
    ramp.color_ramp.elements[1].color = (0.48, 0.008, 0.018, 1)
    L.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    top = N.new("ShaderNodeMapRange")
    top.inputs["From Min"].default_value = 0.45
    top.inputs["From Max"].default_value = 0.85
    L.new(sep.outputs["Z"], top.inputs["Value"])
    mixtop = N.new("ShaderNodeMix")
    mixtop.data_type = "RGBA"
    L.new(top.outputs["Result"], mixtop.inputs["Factor"])
    L.new(ramp.outputs["Color"], mixtop.inputs[6])
    mixtop.inputs[7].default_value = (0.55, 0.05, 0.02, 1)
    col = mixtop.outputs[2]
    # blush spots (object space)
    for p in blush_pts:
        d = N.new("ShaderNodeVectorMath")
        d.operation = "DISTANCE"
        d.inputs[1].default_value = p
        L.new(tc.outputs["Object"], d.inputs[0])
        mr = N.new("ShaderNodeMapRange")
        mr.inputs["From Min"].default_value = blush_r
        mr.inputs["From Max"].default_value = blush_r * 0.25
        mr.interpolation_type = "SMOOTHSTEP"
        L.new(d.outputs["Value"], mr.inputs["Value"])
        mx = N.new("ShaderNodeMix")
        mx.data_type = "RGBA"
        mxf = N.new("ShaderNodeMath")
        mxf.operation = "MULTIPLY"
        mxf.inputs[1].default_value = 0.75
        L.new(mr.outputs["Result"], mxf.inputs[0])
        L.new(mxf.outputs[0], mx.inputs["Factor"])
        L.new(col, mx.inputs[6])
        mx.inputs[7].default_value = (1.0, 0.42, 0.48, 1)
        col = mx.outputs[2]
    L.new(col, b.inputs["Base Color"])
    setv(b, "Roughness", 0.32)
    setv(b, "Subsurface Weight", 0.12)
    setv(b, "Subsurface Radius", (0.9, 0.12, 0.08))
    setv(b, "Subsurface Scale", 0.08)
    setv(b, "Coat Weight", 1.0)
    setv(b, "Coat Roughness", 0.03)
    setv(b, "Coat IOR", 1.4)
    # fine wet micro-bump
    bn = N.new("ShaderNodeTexNoise")
    bn.inputs["Scale"].default_value = 60.0
    L.new(tc.outputs["Object"], bn.inputs["Vector"])
    bump = N.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.04
    bump.inputs["Distance"].default_value = 0.02
    L.new(bn.outputs["Fac"], bump.inputs["Height"])
    L.new(bump.outputs["Normal"], b.inputs["Normal"])
    return m


def mat_simple(name, color, rough=0.4, coat=0.0, sss=0.0, sss_r=(1, 0.3, 0.2), emit=None, ior=None,
               transmission=0.0, alpha=1.0):
    m, nt, b = node_mat(name)
    setv(b, "Base Color", (*color, 1))
    setv(b, "Roughness", rough)
    setv(b, "Coat Weight", coat)
    setv(b, "Coat Roughness", 0.03)
    if sss:
        setv(b, "Subsurface Weight", sss)
        setv(b, "Subsurface Radius", sss_r)
        setv(b, "Subsurface Scale", 0.05)
    if emit:
        setv(b, "Emission Color", (*emit[0], 1))
        setv(b, "Emission Strength", emit[1])
    if ior:
        setv(b, "IOR", ior)
    if transmission:
        setv(b, "Transmission Weight", transmission)
    return m


def mat_flesh(name="flesh", r_outer=1.0):
    """Inside of a strawberry: pale core, pink/red toward the skin, wet."""
    m, nt, b = node_mat(name)
    N, L = nt.nodes, nt.links
    tc = N.new("ShaderNodeTexCoord")
    sep = N.new("ShaderNodeSeparateXYZ")
    L.new(tc.outputs["Object"], sep.inputs[0])
    xy = N.new("ShaderNodeCombineXYZ")
    L.new(sep.outputs["X"], xy.inputs["X"])
    L.new(sep.outputs["Y"], xy.inputs["Y"])
    ln = N.new("ShaderNodeVectorMath")
    ln.operation = "LENGTH"
    L.new(xy.outputs[0], ln.inputs[0])
    noise = N.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 9.0
    L.new(tc.outputs["Object"], noise.inputs["Vector"])
    add = N.new("ShaderNodeMath")
    add.operation = "MULTIPLY_ADD"
    add.inputs[1].default_value = 0.12 * r_outer
    L.new(noise.outputs["Fac"], add.inputs[0])
    L.new(ln.outputs["Value"], add.inputs[2])
    ramp = N.new("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    cr.elements[0].position = 0.0
    cr.elements[0].color = (0.92, 0.6, 0.55, 1)
    cr.elements[1].position = 1.0
    cr.elements[1].color = (0.62, 0.01, 0.03, 1)
    e = cr.elements.new(0.32)
    e.color = (0.82, 0.1, 0.12, 1)
    mr = N.new("ShaderNodeMapRange")
    mr.inputs["From Max"].default_value = r_outer
    L.new(add.outputs[0], mr.inputs["Value"])
    L.new(mr.outputs["Result"], ramp.inputs["Fac"])
    L.new(ramp.outputs["Color"], b.inputs["Base Color"])
    setv(b, "Roughness", 0.3)
    setv(b, "Subsurface Weight", 0.2)
    setv(b, "Subsurface Radius", (1.0, 0.25, 0.2))
    setv(b, "Subsurface Scale", 0.03)
    setv(b, "Coat Weight", 0.6)
    setv(b, "Coat Roughness", 0.12)
    bn = N.new("ShaderNodeTexVoronoi")
    bn.inputs["Scale"].default_value = 28.0 / r_outer
    L.new(tc.outputs["Object"], bn.inputs["Vector"])
    bump = N.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.6
    bump.inputs["Distance"].default_value = 0.02
    L.new(bn.outputs["Distance"], bump.inputs["Height"])
    L.new(bump.outputs["Normal"], b.inputs["Normal"])
    return m


def mat_leaf(name="leaf"):
    m, nt, b = node_mat(name)
    N, L = nt.nodes, nt.links
    tc = N.new("ShaderNodeTexCoord")
    noise = N.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 14.0
    L.new(tc.outputs["Object"], noise.inputs["Vector"])
    ramp = N.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.05, 0.22, 0.03, 1)
    ramp.color_ramp.elements[1].color = (0.18, 0.45, 0.06, 1)
    L.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    L.new(ramp.outputs["Color"], b.inputs["Base Color"])
    setv(b, "Roughness", 0.45)
    setv(b, "Subsurface Weight", 0.3)
    setv(b, "Subsurface Radius", (0.3, 1.0, 0.2))
    setv(b, "Subsurface Scale", 0.02)
    setv(b, "Coat Weight", 0.3)
    bump = N.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.2
    L.new(noise.outputs["Fac"], bump.inputs["Height"])
    L.new(bump.outputs["Normal"], b.inputs["Normal"])
    return m


def mat_juice(name="juice", color=(1.0, 0.12, 0.15), tint=(1.0, 0.25, 0.28), density=18.0):
    m, nt, b = node_mat(name)
    setv(b, "Base Color", (*tint, 1))
    setv(b, "Roughness", 0.0)
    setv(b, "Transmission Weight", 1.0)
    setv(b, "IOR", 1.36)
    # tint via volume absorption for that red-juice glow
    N, L = nt.nodes, nt.links
    va = N.new("ShaderNodeVolumeAbsorption")
    va.inputs["Color"].default_value = (*color, 1)
    va.inputs["Density"].default_value = density
    L.new(va.outputs[0], nt.nodes["Material Output"].inputs["Volume"])
    return m


# ----------------------------------------------------------------------------- strawberry geometry
def berry_deform(p, lump_seed=0.0):
    """Map unit-sphere points (N,3) to a strawberry shape (radius ~1, base at z~-1.05)."""
    x, y, z = p[:, 0], p[:, 1], p[:, 2]
    t = (z + 1) / 2
    taper = 0.5 + 0.5 * np.power(np.clip(t, 0, 1), 0.7)
    phi = np.arctan2(y, x)
    lump = 1 + 0.025 * np.sin(3 * phi + lump_seed) * np.sin(math.pi * t) + 0.015 * np.sin(5 * phi + 2 * lump_seed)
    nx = x * taper * lump * 1.02
    ny = y * taper * lump * 0.97
    nz = np.where(z < 0, z * 1.05, z * 0.78)
    r2 = x * x + y * y
    nz = nz - np.where(z > 0, 0.16 * np.exp(-r2 / 0.06), 0)  # dent for the calyx
    return np.stack([nx, ny, nz], axis=1)


def fib_sphere(n):
    i = np.arange(n) + 0.5
    phi = np.arccos(1 - 2 * i / n)
    th = math.pi * (1 + 5 ** 0.5) * i
    return np.stack([np.cos(th) * np.sin(phi), np.sin(th) * np.sin(phi), np.cos(phi)], axis=1)


def make_strawberry(name, scale=1.0, n_seeds=300, exclude=(), lump_seed=0.0, res=(160, 100), body_mat=None,
                    seed_mat=None, leaf_mat=None, stem=True, n_sepals=8):
    """Returns dict with body, seeds, calyx objects (parented to an empty root) and a BVH for surface queries."""
    root = link(bpy.data.objects.new(name, None))
    me = bpy.data.meshes.new(name + "_body")
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=res[0], v_segments=res[1], radius=1.0)
    bm.verts.ensure_lookup_table()
    P = np.array([v.co[:] for v in bm.verts])
    D = SPEC["deform"](P, lump_seed)
    for v, d in zip(bm.verts, D):
        v.co = d
    bm.normal_update()
    faces = [[v.index for v in f.verts] for f in bm.faces]
    bvh = BVHTree.FromPolygons([tuple(d) for d in D], faces)

    # seed positions by ray casting from axis outward along deformed fib directions
    dirs = berry_deform(fib_sphere(n_seeds), lump_seed)
    seeds = []
    for d in (dirs if SPEC["seeds"] else []):
        zz = d[2]
        if zz > 0.42:  # under calyx
            continue
        o = Vector((0, 0, zz * 0.6))
        dv = Vector((d[0], d[1], d[2] - o.z)).normalized()
        hit = bvh.ray_cast(o, dv)
        if hit[0] is None:
            continue
        loc, nrm = hit[0], hit[1]
        if any((loc - Vector(c)).length < r for c, r in exclude):
            continue
        jitter = Vector(RNG.normal(0, 0.012, 3))
        seeds.append((loc + jitter - nrm * jitter.dot(nrm), nrm))
    # dimples
    if seeds:
        S = np.array([s[0][:] for s in seeds])
        V = np.array([v.co[:] for v in bm.verts])
        Nn = np.array([v.normal[:] for v in bm.verts])
        disp = np.zeros(len(V))
        for k in range(0, len(V), 4000):
            dd = ((V[k:k + 4000, None, :] - S[None, :, :]) ** 2).sum(-1)
            disp[k:k + 4000] = np.exp(-dd / (0.045 ** 2)).sum(1)
        disp = np.clip(disp, 0, 1.2)
        V = V - Nn * (disp * 0.022)[:, None]
        for v, c in zip(bm.verts, V):
            v.co = c
    bm.to_mesh(me)
    bm.free()
    me.shade_smooth()
    body = link(bpy.data.objects.new(name + "_body", me))
    body.parent = root
    if body_mat:
        body.data.materials.append(body_mat)
    sub = body.modifiers.new("sub", "SUBSURF")
    sub.levels = 1
    sub.render_levels = 1

    # seeds: one mesh
    if seeds:
        sv, sf = [], []
        ico = bmesh.new()
        bmesh.ops.create_icosphere(ico, subdivisions=2, radius=1.0)
        iv = np.array([v.co[:] for v in ico.verts])
        ifc = [[v.index for v in f.verts] for f in ico.faces]
        ico.free()
        for loc, nrm in seeds:
            q = nrm.to_track_quat("Z", "Y")
            # long axis roughly along the surface "meridian"
            Mx = q.to_matrix() @ Matrix.Diagonal((0.015, 0.024, 0.012))
            pos = loc - nrm * 0.006
            base = len(sv)
            for p in iv:
                sv.append(tuple(Mx @ Vector(p) + pos))
            sf += [[base + i for i in f] for f in ifc]
        so = mesh_obj(name + "_seeds", sv, sf)
        so.parent = root
        if seed_mat:
            so.data.materials.append(seed_mat)
    # calyx
    top_hit = bvh.ray_cast(Vector((0, 0, 2)), Vector((0, 0, -1)))[0]
    cal = SPEC["top"](name + "_calyx", top_hit, n_sepals, leaf_mat, stem, seed=lump_seed, bvh=bvh)
    cal.parent = root
    root.scale = (scale,) * 3
    return dict(root=root, body=body, calyx=cal, bvh=bvh, top=top_hit)


def make_calyx(name, top, n, leaf_mat, stem=True, seed=0.0, bvh=None):
    verts, faces = [], []
    nu, nw = 24, 9
    rng = np.random.default_rng(int(seed * 100) + 3)
    for k in range(n):
        ang = 2 * math.pi * k / n + rng.normal(0, 0.12)
        L = 0.68 + rng.normal(0, 0.06)
        Wd = 0.17 + rng.normal(0, 0.015)
        droop = 0.42 + rng.normal(0, 0.06)
        twist = rng.normal(0, 0.15)
        lift = rng.normal(0.02, 0.04)
        base = len(verts)
        for i in range(nu + 1):
            u = i / nu
            w = Wd * math.sin(math.pi * min(1, u ** 0.55)) * (1 - u) ** 0.35 + 0.012
            for j in range(nw):
                s = (j / (nw - 1)) * 2 - 1
                lx = u * L
                ly = s * w
                lz = 0.06 * u - droop * u ** 2 + 0.05 * (1 - s * s) * math.sin(math.pi * u) - 0.03 * abs(s) * u
                lz += twist * ly * u
                ca, sa = math.cos(ang), math.sin(ang)
                px, py = top.x + lx * ca - ly * sa, top.y + lx * sa + ly * ca
                pz = top.z + 0.03 + lz
                if bvh is not None:
                    h = bvh.ray_cast(Vector((px, py, 3.0)), Vector((0, 0, -1)))[0]
                    if h is not None:
                        # hug the shoulder, with a slight lift toward the curled tip
                        pz = h.z + 0.025 + 0.06 * (1 - s * s) * math.sin(math.pi * u) + 0.1 * u ** 3 + lift * u ** 2
                verts.append((px, py, pz))
        for i in range(nu):
            for j in range(nw - 1):
                a = base + i * nw + j
                faces.append([a, a + 1, a + nw + 1, a + nw])
    ob = mesh_obj(name, verts, faces)
    sol = ob.modifiers.new("sol", "SOLIDIFY")
    sol.thickness = 0.018
    sol.offset = 0
    sd = ob.modifiers.new("sub", "SUBSURF")
    sd.levels = 1
    sd.render_levels = 2
    if leaf_mat:
        ob.data.materials.append(leaf_mat)
    if stem:
        cu = bpy.data.curves.new(name + "_stem", "CURVE")
        cu.dimensions = "3D"
        sp = cu.splines.new("BEZIER")
        sp.bezier_points.add(1)
        p0, p1 = sp.bezier_points
        p0.co = (top.x, top.y, top.z - 0.02)
        p0.handle_left = (top.x, top.y, top.z - 0.1)
        p0.handle_right = (top.x, top.y, top.z + 0.15)
        p1.co = (top.x + 0.12, top.y + 0.03, top.z + 0.32)
        p1.handle_left = (top.x + 0.02, top.y, top.z + 0.25)
        p1.handle_right = (top.x + 0.2, top.y + 0.05, top.z + 0.38)
        cu.bevel_depth = 0.035
        cu.bevel_resolution = 4
        cu.use_fill_caps = True
        st = link(bpy.data.objects.new(name + "_stemobj", cu))
        st.parent = ob
        if leaf_mat:
            cu.materials.append(leaf_mat)
    return ob


def surface(bvh, direction, origin=(0, 0, -0.1)):
    o = Vector(origin)
    hit = bvh.ray_cast(o, Vector(direction).normalized())
    return hit[0], hit[1]


def arc_curve(name, pts, bevel, mat):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    sp = cu.splines.new("POLY")
    sp.points.add(len(pts) - 1)
    for p, c in zip(sp.points, pts):
        p.co = (*c, 1)
    cu.bevel_depth = bevel
    cu.bevel_resolution = 4
    cu.use_fill_caps = True
    ob = link(bpy.data.objects.new(name, cu))
    cu.materials.append(mat)
    return ob


# ----------------------------------------------------------------------------- scene
class Scene:
    def __init__(self, fruit="strawberry"):
        global SPEC
        import fruits
        SPEC = fruits.spec(fruit)
        self.fruit = fruit
        clear()
        sc = bpy.context.scene
        self.sc = sc
        self.M = dict(
            seed=mat_simple("seed", (0.8, 0.48, 0.08), rough=0.25, coat=0.6, sss=0.3, sss_r=(1, 0.7, 0.2)),
            leaf=mat_leaf(),
            eye=mat_simple("eye", (0.004, 0.003, 0.004), rough=0.08, coat=1.0),
            shine=mat_simple("shine", (1, 1, 1), emit=((1, 1, 1), 6.0)),
            mouth=mat_simple("mouth", (0.12, 0.0, 0.01), rough=0.5, sss=0.2, sss_r=(1, 0.1, 0.1)),
            lips=mat_simple("lips", (0.08, 0.0, 0.008), rough=0.3, coat=0.5),
            tongue=mat_simple("tongue", (0.9, 0.18, 0.25), rough=0.35, coat=0.6, sss=0.6),
            juice=mat_juice(color=SPEC["juice"], tint=SPEC["juice_tint"], density=SPEC["juice_density"]),
            flesh=mat_flesh("flesh", 1.0),
        )
        self.build_big()
        self.build_mini()
        self.build_set()
        self.build_lights_camera()

    # --- the main character
    def build_big(self):
        face = dict(
            eyeL=Vector((-0.36, -1, 0.0)), eyeR=Vector((0.36, -1, 0.0)),
            mouth=Vector((0.0, -1, -0.36)),
            blushL=Vector((-0.62, -1, -0.28)), blushR=Vector((0.62, -1, -0.28)),
        )
        # quick pre-pass to find face points on the undimpled surface
        tmp = uv_sphere("tmp", 96, 64)
        P = np.array([v.co[:] for v in tmp.data.vertices])
        D = SPEC["deform"](P, 0.4)
        bvh0 = BVHTree.FromPolygons([tuple(d) for d in D], [tuple(p.vertices) for p in tmp.data.polygons])
        bpy.data.objects.remove(tmp)
        F = {k: surface(bvh0, v) for k, v in face.items()}
        self.F = F
        bl = [tuple(F["blushL"][0]), tuple(F["blushR"][0])]
        self.M["berry"] = SPEC["skin"]("berry", blush_pts=bl, blush_r=0.24)
        exclude = [(F["eyeL"][0], 0.26), (F["eyeR"][0], 0.26), (F["mouth"][0], 0.22),
                   (F["blushL"][0], 0.17), (F["blushR"][0], 0.17)]
        B = make_strawberry("Big", 1.0, n_seeds=340, exclude=exclude, lump_seed=0.4, body_mat=self.M["berry"],
                            seed_mat=self.M["seed"], leaf_mat=self.M["leaf"], n_sepals=9)
        self.B = B
        root = B["root"]
        # eyes + catchlights (dict of "open" pieces), closed "^ ^" arcs
        self.eyes_open, self.eyes_closed = [], []
        for side in ("eyeL", "eyeR"):
            loc, nrm = F[side]
            e = uv_sphere(side, 48, 24, 1.0)
            e.data.materials.append(self.M["eye"])
            e.rotation_mode = "QUATERNION"
            e.rotation_quaternion = look_quat(nrm)
            e.scale = (0.155, 0.08, 0.175)
            e.location = loc - nrm * 0.02
            e.parent = root
            self.eyes_open.append(e)
            q = look_quat(nrm)
            for off, r in (((-0.055, 0.07), 0.045), ((0.05, -0.06), 0.02)):
                s = uv_sphere(side + "_shine", 24, 12, r)
                s.data.materials.append(self.M["shine"])
                s.location = e.location + q @ Vector((off[0], -0.075, off[1]))
                s.scale = (1, 0.4, 1)
                s.rotation_mode = "QUATERNION"
                s.rotation_quaternion = q
                s.parent = root
                self.eyes_open.append(s)
            pts = [(0.13 * math.cos(a), 0.0, 0.07 * math.sin(a) - 0.02) for a in np.linspace(0.15, math.pi - 0.15, 16)]
            c = arc_curve(side + "_closed", pts, 0.03, self.M["lips"])
            c.rotation_mode = "QUATERNION"
            c.rotation_quaternion = q
            c.location = loc + nrm * 0.005
            c.parent = root
            self.eyes_closed.append(c)
        # mouth: smile arc (closed) + boolean cavity (open) + tongue
        loc, nrm = F["mouth"]
        q = look_quat(nrm)
        self.mouth_q, self.mouth_loc, self.mouth_n = q, loc, nrm
        pts = [(0.1 * math.sin(a), 0.0, -0.05 * math.cos(a)) for a in np.linspace(-1.2, 1.2, 18)]
        self.smile = arc_curve("smile", pts, 0.017, self.M["lips"])
        self.smile.rotation_mode = "QUATERNION"
        self.smile.rotation_quaternion = q
        self.smile.location = loc + nrm * 0.004
        self.smile.parent = root
        cut = uv_sphere("mouth_cut", 48, 24, 1.0)
        cut.data.materials.append(self.M["mouth"])
        cut.rotation_mode = "QUATERNION"
        cut.rotation_quaternion = q
        cut.parent = root
        cut.hide_render = True
        cut.display_type = "WIRE"
        self.cut = cut
        bo = B["body"].modifiers.new("mouth", "BOOLEAN")
        bo.object = cut
        bo.solver = SPEC.get("solver", "EXACT")
        bo.material_mode = "TRANSFER"
        self.mouth_bool = bo
        tg = uv_sphere("tongue", 32, 16, 1.0)
        tg.data.materials.append(self.M["tongue"])
        tg.rotation_mode = "QUATERNION"
        tg.rotation_quaternion = q
        tg.parent = root
        self.tongue = tg
        # little arms (red capsules) pivoting at the shoulders
        self.arms = []
        for sx in (-1, 1):
            sh, sn = surface(B["bvh"], (sx * 0.62, -0.9, -0.38))
            piv = link(bpy.data.objects.new("shoulder%d" % sx, None))
            piv.location = sh - sn * 0.05
            piv.parent = root
            piv.rotation_mode = "QUATERNION"
            arm = uv_sphere("arm%d" % sx, 32, 16, 1.0)
            arm.data.materials.append(self.M["berry"])
            arm.scale = (0.075, 0.075, 0.22)
            arm.location = (0, 0, -0.17)
            arm.parent = piv
            hand = uv_sphere("hand%d" % sx, 32, 16, 0.09)
            hand.data.materials.append(self.M["berry"])
            hand.location = (0, 0, -0.38)
            hand.parent = piv
            self.arms.append((piv, hand))

    def set_mouth(self, mode, open_amt=1.0):
        """mode: 'smile' | 'open'"""
        loc, n, q = self.mouth_loc, self.mouth_n, self.mouth_q
        if mode == "smile":
            self.smile.hide_render = False
            self.mouth_bool.show_render = False
            self.mouth_bool.show_viewport = False
            self.tongue.hide_render = True
        else:
            self.smile.hide_render = True
            self.mouth_bool.show_render = True
            self.mouth_bool.show_viewport = True
            self.cut.location = loc + n * 0.02
            self.cut.scale = (0.13 + 0.13 * open_amt, 0.2, 0.04 + 0.2 * open_amt)
            self.tongue.hide_render = False
            self.tongue.location = loc - n * 0.16 + q @ Vector((0, 0, -0.06 - 0.08 * open_amt))
            self.tongue.scale = (0.12, 0.1, 0.06)

    def set_eyes(self, closed):
        for o in self.eyes_open:
            o.hide_render = closed
        for o in self.eyes_closed:
            o.hide_render = not closed

    # --- the mini strawberry (whole + bitten variants)
    def build_mini(self):
        self.M["mini_flesh"] = SPEC["flesh"]("mini_flesh", 1.0)
        self.M["mini_berry"] = SPEC["skin"]("mini_berry")
        m = make_strawberry("Mini", 0.24, n_seeds=170, lump_seed=1.3, res=(96, 64), body_mat=self.M["mini_berry"],
                            seed_mat=self.M["seed"], leaf_mat=self.M["leaf"], n_sepals=7)
        self.mini = m
        # bite cutter: a few spheres forming a scalloped bite (in mini's local space)
        bite = link(bpy.data.objects.new("bite", None))
        bite.parent = m["root"]
        self.bite_parts = []
        for i, (bx, bz, r) in enumerate([(-0.35, -0.2, 0.5), (-0.5, 0.25, 0.46), (-0.42, -0.68, 0.44)]):
            s = uv_sphere("bite%d" % i, 48, 24, r)
            s.data.materials.append(self.M["mini_flesh"])
            s.location = (bx - 0.35, -0.25, bz)
            s.parent = bite
            s.hide_render = True
            s.display_type = "WIRE"
            tex = bpy.data.textures.new("bitetex%d" % i, "CLOUDS")
            tex.noise_scale = 0.12
            dm = s.modifiers.new("rough", "DISPLACE")
            dm.texture = tex
            dm.strength = 0.07
            dm.mid_level = 0.5
            self.bite_parts.append(s)
        bo = None
        for i, s in enumerate(self.bite_parts):
            bo = m["body"].modifiers.new("bite%d" % i, "BOOLEAN")
            bo.object = s
            bo.solver = SPEC.get("solver", "EXACT")
            bo.material_mode = "TRANSFER"
            bo.show_render = False
            bo.show_viewport = False
        # seeds aren't cut: hide seeds inside bite region later via a second boolean
        seeds = [o for o in m["root"].children if o.name.startswith("Mini_seeds")]
        self.mini_seeds = seeds[0] if seeds else mesh_obj("Mini_seeds_none", [], [])
        for i, s in enumerate(self.bite_parts):
            b2 = self.mini_seeds.modifiers.new("bite%d" % i, "BOOLEAN")
            b2.object = s
            b2.solver = SPEC.get("solver", "EXACT")
            b2.show_render = False
            b2.show_viewport = False

    def set_bitten(self, bitten):
        for ob in (self.mini["body"], self.mini_seeds):
            for md in ob.modifiers:
                if md.type == "BOOLEAN":
                    md.show_render = bitten
                    md.show_viewport = bitten

    # --- set dressing
    def build_set(self):
        # table: soft glossy cream-pink surface
        tm = mat_simple("table", SPEC["table"], rough=0.3, coat=0.25)
        bm_ = mat_simple("backdrop", SPEC["backdrop"], rough=0.6)
        bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, -1.03))
        self.table = bpy.context.active_object
        self.table.data.materials.append(tm)
        # backdrop: curved sweep (cyclorama)
        verts, faces = [], []
        nx, nz = 2, 30
        for i in range(nz + 1):
            a = i / nz * (math.pi / 2)
            y = 6 + 4 * math.sin(a)
            z = -1.03 + 4 - 4 * math.cos(a)
            if i == 0:
                y, z = 6, -1.03
            for xx in (-20, 20):
                verts.append((xx, y, z))
        for i in range(nz):
            a = i * 2
            faces.append([a, a + 1, a + 3, a + 2])
        bd = mesh_obj("backdrop", [(v[0], v[1] + 0.0, v[2]) for v in verts], faces)
        bd.data.materials.append(bm_)
        # tall wall
        bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 10, 15), rotation=(math.pi / 2, 0, 0))
        w = bpy.context.active_object
        w.data.materials.append(bm_)
        # a couple of soft out-of-focus berries in the background for depth
        self.bg = []
        for i, (x, y, s, rz) in enumerate([(-1.9, 3.2, 0.75, 0.6), (2.1, 4.2, 0.85, -0.9), (-0.4, 6.0, 0.7, 2.0)]):
            g = make_strawberry("BG%d" % i, s, n_seeds=180, lump_seed=2 + i, res=(80, 50),
                                body_mat=SPEC["skin"]("bgberry%d" % i), seed_mat=self.M["seed"],
                                leaf_mat=self.M["leaf"], n_sepals=8)
            g["root"].location = (x, y, -1.03 + 1.02 * s)
            g["root"].rotation_euler = (0.0, 0.0, rz)
            self.bg.append(g)

    def build_lights_camera(self):
        sc = self.sc
        w = bpy.data.worlds.new("w")
        sc.world = w
        w.use_nodes = True
        w.node_tree.nodes["Background"].inputs["Color"].default_value = (*SPEC["world"], 1)
        w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.1

        def area(name, loc, rot, size, power, color):
            ld = bpy.data.lights.new(name, "AREA")
            ld.size = size
            ld.energy = power
            ld.color = color
            ob = link(bpy.data.objects.new(name, ld))
            ob.location = loc
            ob.rotation_euler = rot
            return ob

        def aim(ob, target=(0, 0, 0)):
            d = Vector(target) - ob.location
            ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()

        k = area("key", (-4.5, -4.5, 5.0), (0, 0, 0), 4.0, 1300, (1.0, 0.93, 0.85)); aim(k)
        f = area("fill", (5, -5, 1.0), (0, 0, 0), 5.0, 120, (1.0, 0.9, 0.9)); aim(f)
        r = area("rim", (3.0, 4.0, 3.5), (0, 0, 0), 2.0, 1500, (1.0, 0.95, 0.95)); aim(r)
        r2 = area("rim2", (-3.5, 3.5, 2.0), (0, 0, 0), 2.0, 800, (1.0, 0.9, 0.9)); aim(r2)
        # a crisp small "softbox" for the wet speculars
        s = area("spec", (-2.0, -5.0, 3.0), (0, 0, 0), 0.8, 250, (1, 1, 1)); aim(s)

        cd = bpy.data.cameras.new("cam")
        cd.lens = 70
        cd.dof.use_dof = True
        cd.dof.aperture_fstop = 2.2
        cam = link(bpy.data.objects.new("cam", cd))
        sc.camera = cam
        self.cam = cam
        self.focus = link(bpy.data.objects.new("focus", None))
        cd.dof.focus_object = self.focus

        sc.render.engine = "CYCLES"
        sc.cycles.device = "CPU"
        sc.cycles.use_denoising = True
        sc.render.resolution_x = 1080
        sc.render.resolution_y = 1920
        sc.render.film_transparent = False
        sc.view_settings.view_transform = "AgX"
        try:
            sc.view_settings.look = "AgX - Punchy"
        except Exception:
            pass
        sc.cycles.max_bounces = 10
        sc.cycles.transmission_bounces = 10
        sc.cycles.caustics_reflective = False
        sc.cycles.caustics_refractive = False
        sc.cycles.blur_glossy = 1.0

    def place_cam(self, loc, target, lens=70, focus=None, fstop=2.2):
        self.cam.location = loc
        d = Vector(target) - Vector(loc)
        self.cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
        self.cam.data.lens = lens
        self.cam.data.dof.aperture_fstop = fstop
        self.focus.location = focus if focus is not None else target

    # --- juice
    def droplets(self, pts, name="drops"):
        objs = []
        for i, (p, r, stretch) in enumerate(pts):
            d = uv_sphere("%s%d" % (name, i), 24, 12, r)
            d.data.materials.append(self.M["juice"])
            d.location = p
            if stretch is not None:
                v = Vector(stretch)
                d.rotation_mode = "QUATERNION"
                d.rotation_quaternion = v.normalized().to_track_quat("Z", "Y")
                d.scale = (1, 1, 1 + v.length)
            objs.append(d)
        return objs


# ----------------------------------------------------------------------------- shots
def aim_arm(arm, target, reach=0.38):
    """Rotate a shoulder pivot so the hand lands on a world-space target (arm stretches a bit to reach)."""
    piv, hand = arm
    bpy.context.view_layer.update()
    pw = piv.matrix_world.translation
    parent = piv.parent.matrix_world
    d = parent.to_quaternion().inverted() @ (Vector(target) - pw)
    piv.rotation_quaternion = d.normalized().to_track_quat("-Z", "Y")
    k = max(0.75, min(1.45, d.length / (reach * parent.to_scale()[0])))
    arm_mesh = [c for c in piv.children if c.name.startswith("arm")][0]
    arm_mesh.scale = (0.075, 0.075, 0.22 * k)
    arm_mesh.location = (0, 0, -0.17 * k)
    hand.location = (0, 0, -0.38 * k)


def world_of(ob, local):
    bpy.context.view_layer.update()
    return ob.matrix_world @ Vector(local)


def shot(S, n):
    big, mini = S.B["root"], S.mini["root"]
    F = S.F
    L, R = S.arms  # (pivot, hand)
    eye_mid = (F["eyeL"][0] + F["eyeR"][0]) / 2
    if n == 1:  # curious: spots the tiny strawberry on the table
        big.rotation_euler = (0.12, 0, 0.05)
        S.set_eyes(False)
        S.set_mouth("open", 0.15)
        mini.location = (0.2, -1.6, -1.03 + 1.05 * 0.24)
        mini.rotation_euler = (0, 0, 0.5)
        bpy.context.view_layer.update()
        for arm, sx in ((L, -1), (R, 1)):
            aim_arm(arm, arm[0].matrix_world.translation + Vector((sx * 0.12, -0.12, -0.3)))
        S.set_bitten(False)
        S.place_cam((0.9, -7.5, 0.7), (0.05, -0.6, -0.35), 62, focus=(0.05, -0.9, -0.3), fstop=2.8)
    elif n == 2:  # picks it up, sparkly eyes, little "o" mouth
        big.rotation_euler = (0.0, 0, 0)
        S.set_eyes(False)
        S.set_mouth("open", 0.35)
        mini.location = world_of(big, surface(S.B["bvh"], (0, -1, -0.55))[0]) + Vector((0, -0.2, 0.0))
        mini.rotation_euler = (0.25, 0.15, 0.6)
        aim_arm(L, mini.location + Vector((-0.2, -0.02, -0.02)))
        aim_arm(R, mini.location + Vector((0.2, -0.02, -0.02)))
        S.set_bitten(False)
        S.place_cam((0.0, -6.8, 0.15), (0, -0.4, -0.25), 75, focus=(0, -1.2, -0.3), fstop=3.2)
    elif n == 3:  # chomp! mouth wide open, berry at the lips, juice flying
        big.rotation_euler = (-0.08, 0, 0)
        S.set_eyes(True)
        S.set_mouth("open", 1.0)
        mloc = world_of(big, S.mouth_loc)
        mini.location = mloc + Vector((0.04, -0.2, 0.0))
        mini.rotation_euler = (0.2, math.radians(95), 0.25)
        aim_arm(L, mini.location + Vector((-0.22, -0.02, -0.04)))
        aim_arm(R, mini.location + Vector((0.2, -0.02, -0.04)))
        S.set_bitten(False)
        rng = np.random.default_rng(3)
        pts = []
        c = mloc + Vector((0.0, -0.12, 0.02))
        for i in range(60):
            dirv = Vector((rng.normal(0, 1), -abs(rng.normal(0.5, 0.5)), rng.normal(0.4, 0.7))).normalized()
            dist = 0.2 + abs(rng.normal(0, 0.3))
            r = 0.007 + abs(rng.normal(0, 0.011))
            pts.append((c + dirv * dist, r, dirv * (rng.random() * 0.5) if rng.random() < 0.5 else None))
        S.droplets(pts, "splash")
        S.place_cam((1.5, -5.7, 0.15), (0.0, -0.6, -0.25), 80, focus=mloc + Vector((0, -0.3, 0)), fstop=3.2)
    elif n == 4:  # chewing, eyes shut in bliss, bitten berry shows juicy inside
        big.rotation_euler = (0.05, 0, -0.06)
        big.scale = (1.03, 1.03, 0.97)
        S.set_eyes(True)
        S.set_mouth("smile")
        mini.location = world_of(big, surface(S.B["bvh"], (0, -1, -0.6))[0]) + Vector((0, -0.24, 0.0))
        mini.rotation_euler = (0.35, 0, math.pi / 2 + 0.3)
        aim_arm(L, mini.location + Vector((-0.2, 0.0, -0.03)))
        aim_arm(R, mini.location + Vector((0.2, 0.0, -0.03)))
        S.set_bitten(True)
        bpy.context.view_layer.update()
        rng = np.random.default_rng(5)
        bite_c = S.bite_parts[0].matrix_world.translation
        mw = mini.matrix_world
        glints = []
        for i in range(10):
            p = mw @ Vector((-0.35 + 0.5 * 0.0, -0.2, -0.2))  # inside bite region
            off = Vector(rng.normal(0, 0.05, 3))
            glints.append((p + off, 0.006 + abs(rng.normal(0, 0.004)), None))
        mloc = world_of(big, S.mouth_loc)
        S.droplets([(mloc + Vector((0.09, -0.02, -0.06)), 0.022, (0, 0, -0.6)),
                    (mloc + Vector((-0.1, -0.03, -0.03)), 0.016, None)], "lipdrop")
        S.place_cam((0.4, -6.2, 0.2), (0.0, -0.6, -0.3), 72, focus=(0, -1.3, -0.5), fstop=3.5)
    elif n == 5:  # all gone: only the tiny leafy cap remains, happy & blushing
        big.rotation_euler = (0.0, 0, 0.08)
        S.set_eyes(False)
        S.set_mouth("smile")
        bpy.context.view_layer.update()
        aim_arm(L, world_of(big, F["blushL"][0] + F["blushL"][1] * 0.1 + Vector((0.05, 0, -0.05))))
        aim_arm(R, world_of(big, F["blushR"][0] + F["blushR"][1] * 0.1 + Vector((-0.05, 0, -0.05))))
        # hide the mini body, leave only its calyx on the table
        for o in [S.mini["body"], S.mini_seeds]:
            o.hide_render = True
        mini.location = (0.5, -1.75, -1.03 - 0.24 * 0.36)
        mini.rotation_euler = (0.1, 0, 1.0)
        mloc = world_of(big, S.mouth_loc)
        S.droplets([(mloc + Vector((0.1, -0.03, -0.1)), 0.02, (0, 0, -1.0)),
                    ((0.2, -1.6, -1.03), 0.05, (0.8, 0.3, 0)), ((0.75, -1.95, -1.03), 0.03, (0.3, -0.2, 0)), ((0.35, -2.05, -1.03), 0.022, None), ((-0.2, -1.45, -1.03), 0.035, None)],
                   "drip")
        for d in bpy.data.objects:
            if d.name.startswith("drip") and d.location.z < -1.0:
                d.scale = (d.scale[0], d.scale[1], 0.35)
        S.place_cam((0.45, -5.4, -0.3), (0.15, -0.6, -0.42), 55, focus=eye_mid, fstop=2.8)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--shot", type=int, default=1)
    ap.add_argument("--samples", type=int, default=128)
    ap.add_argument("--scale", type=float, default=1.0)
    ap.add_argument("--out", default=os.path.join(HERE, "out", "stills"))
    ap.add_argument("--blend", action="store_true")
    ap.add_argument("--fruit", default="strawberry")
    a = ap.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:])
    S = Scene(a.fruit)
    shot(S, a.shot)
    sc = S.sc
    sc.cycles.samples = a.samples
    sc.render.resolution_percentage = int(a.scale * 100)
    os.makedirs(a.out, exist_ok=True)
    sc.render.filepath = os.path.join(a.out, "%sshot%d.png" % ("" if a.fruit == "strawberry" else a.fruit + "_", a.shot))
    if a.blend:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.join(a.out, "shot%d.blend" % a.shot))
    bpy.ops.render.render(write_still=True)
    print("WROTE", sc.render.filepath)


if __name__ == "__main__":
    main()
