"""Fruit definitions: shape, skin, inside flesh, top (leaves/stem) and set colours.

Every shape maps the unit sphere to a fruit of radius ~1 whose base sits at z ~ -1.05 (so the story/anim
code is shared by all fruits). spec(name) returns the dict scene.py uses.
"""
import math

import bpy
import numpy as np
from mathutils import Vector

import scene as SC


# ----------------------------------------------------------------------------- shapes
def _sph(p):
    return p[:, 0], p[:, 1], p[:, 2]


def peach_deform(p, seed=0.0):
    x, y, z = _sph(p)
    phi = np.arctan2(y, x)
    lump = 1 + 0.012 * np.sin(3 * phi + seed)
    nx, ny = x * 1.04 * lump, y * 1.0 * lump
    nz = np.where(z < 0, z * 1.02, z * 0.9)
    # tiny tip at the bottom
    nz = nz - 0.05 * np.exp(-(x * x + y * y) / 0.02) * (z < 0)
    # the suture crease: a groove over the top running down the back-right side
    cdir = np.array([-0.85, 0.53, 0.0])
    side = x * cdir[0] + y * cdir[1]
    nrm = np.array([0.53, 0.85, 0.0])
    d = x * nrm[0] + y * nrm[1]
    w = np.clip((side + 0.15) / 0.4, 0, 1) * np.clip((z + 0.75) / 0.5, 0, 1)
    k = 1 - 0.07 * np.exp(-d * d / 0.005) * w
    nx, ny, nz = nx * k, ny * k, nz * (1 - 0.3 * (1 - k))
    r2 = x * x + y * y
    nz = nz - np.where(z > 0, 0.1 * np.exp(-r2 / 0.03), 0)  # stem cavity
    return np.stack([nx, ny, nz], axis=1)


def melon_deform(p, seed=0.0):
    x, y, z = _sph(p)
    phi = np.arctan2(y, x)
    lump = 1 + 0.01 * np.sin(2 * phi + seed)
    nx, ny = x * 1.0 * lump, y * 0.97 * lump
    nz = np.where(z < 0, z * 1.05, z * 0.95)
    nz = nz + np.where(z < -0.9, 0.04 * (z + 0.9) / 0.1 * -1, 0) * 0  # (kept round)
    r2 = x * x + y * y
    nz = nz - np.where(z > 0, 0.05 * np.exp(-r2 / 0.01), 0)
    return np.stack([nx, ny, nz], axis=1)


def kiwi_deform(p, seed=0.0):
    x, y, z = _sph(p)
    phi = np.arctan2(y, x)
    lump = 1 + 0.02 * np.sin(2 * phi + seed) + 0.01 * np.sin(5 * phi)
    # egg: a little fuller at the bottom, gently narrower at the top
    t = (z + 1) / 2
    taper = 0.8 - 0.08 * t ** 1.5
    nx, ny = x * taper * lump, y * taper * 0.95 * lump
    nz = np.where(z < 0, z * 1.05, z * 1.0)
    r2 = x * x + y * y
    nz = nz - np.where(z > 0, 0.03 * np.exp(-r2 / 0.01), 0)
    return np.stack([nx, ny, nz], axis=1)


# ----------------------------------------------------------------------------- skins
def _skin(name, color_fn, blush_pts, blush_r, blush_col, params, bump=(60.0, 0.04), blush_amt=0.75):
    m, nt, b = SC.node_mat(name)
    N, L = nt.nodes, nt.links
    tc = N.new("ShaderNodeTexCoord")
    col = color_fn(nt, tc)
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
        f = N.new("ShaderNodeMath")
        f.operation = "MULTIPLY"
        f.inputs[1].default_value = blush_amt
        L.new(mr.outputs["Result"], f.inputs[0])
        mx = N.new("ShaderNodeMix")
        mx.data_type = "RGBA"
        L.new(f.outputs[0], mx.inputs["Factor"])
        L.new(col, mx.inputs[6])
        mx.inputs[7].default_value = (*blush_col, 1)
        col = mx.outputs[2]
    L.new(col, b.inputs["Base Color"])
    for k, v in params.items():
        SC.setv(b, k, v)
    bn = N.new("ShaderNodeTexNoise")
    bn.inputs["Scale"].default_value = bump[0]
    L.new(tc.outputs["Object"], bn.inputs["Vector"])
    bu = N.new("ShaderNodeBump")
    bu.inputs["Strength"].default_value = bump[1]
    bu.inputs["Distance"].default_value = 0.02
    L.new(bn.outputs["Fac"], bu.inputs["Height"])
    L.new(bu.outputs["Normal"], b.inputs["Normal"])
    return m


def _ramp(nt, fac_socket, stops):
    r = nt.nodes.new("ShaderNodeValToRGB")
    cr = r.color_ramp
    cr.elements[0].position, cr.elements[0].color = stops[0][0], (*stops[0][1], 1)
    cr.elements[1].position, cr.elements[1].color = stops[-1][0], (*stops[-1][1], 1)
    for pos, c in stops[1:-1]:
        e = cr.elements.new(pos)
        e.color = (*c, 1)
    nt.links.new(fac_socket, r.inputs["Fac"])
    return r.outputs["Color"]


def _noise(nt, tc, scale, detail=4.0, distortion=0.0, coord="Object"):
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.inputs["Scale"].default_value = scale
    n.inputs["Detail"].default_value = detail
    if "Distortion" in n.inputs:
        n.inputs["Distortion"].default_value = distortion
    nt.links.new(tc.outputs[coord], n.inputs["Vector"])
    return n.outputs["Fac"]


def _math(nt, op, a, b=None, c=None, clamp=False):
    m = nt.nodes.new("ShaderNodeMath")
    m.operation = op
    m.use_clamp = clamp
    for i, v in enumerate((a, b, c)):
        if v is None:
            continue
        if isinstance(v, (int, float)):
            m.inputs[i].default_value = v
        else:
            nt.links.new(v, m.inputs[i])
    return m.outputs[0]


def _xyz(nt, tc):
    s = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Object"], s.inputs[0])
    return s


def _mix(nt, fac, a, b):
    m = nt.nodes.new("ShaderNodeMix")
    m.data_type = "RGBA"
    for sock, v in ((m.inputs["Factor"], fac), (m.inputs[6], a), (m.inputs[7], b)):
        if isinstance(v, (tuple, list)):
            sock.default_value = (*v, 1) if len(v) == 3 else v
        elif isinstance(v, (int, float)):
            sock.default_value = v
        else:
            nt.links.new(v, sock)
    return m.outputs[2]


def peach_skin(name, blush_pts=(), blush_r=0.2):
    def color(nt, tc):
        xyz = _xyz(nt, tc)
        n = _noise(nt, tc, 3.0, 6.0, 0.6)
        # red flush strongest on the upper back/side, golden toward the bottom & front
        side = _math(nt, "MULTIPLY", xyz.outputs["X"], -0.35)
        up = _math(nt, "MULTIPLY_ADD", xyz.outputs["Z"], 0.45, 0.25)
        f = _math(nt, "ADD", side, up)
        f = _math(nt, "MULTIPLY_ADD", n, 0.8, f)
        f = _math(nt, "SUBTRACT", f, 0.3, clamp=True)
        return _ramp(nt, f, [(0.0, (0.95, 0.42, 0.03)), (0.3, (0.92, 0.25, 0.03)), (0.6, (0.7, 0.05, 0.03)),
                             (1.0, (0.42, 0.02, 0.03))])
    return _skin(name, color, blush_pts, blush_r, (1.0, 0.38, 0.32),
                 {"Roughness": 0.5, "Sheen Weight": 0.45, "Sheen Roughness": 0.4, "Sheen Tint": (1.0, 0.85, 0.75, 1),
                  "Subsurface Weight": 0.15, "Subsurface Radius": (1.0, 0.4, 0.1), "Subsurface Scale": 0.05,
                  "Coat Weight": 0.15, "Coat Roughness": 0.25},
                 bump=(120.0, 0.05), blush_amt=0.55)


def melon_skin(name, blush_pts=(), blush_r=0.2):
    def color(nt, tc):
        g = nt.nodes.new("ShaderNodeTexGradient")
        g.gradient_type = "RADIAL"
        nt.links.new(tc.outputs["Object"], g.inputs["Vector"])
        n = _noise(nt, tc, 2.5, 5.0, 0.0)
        xyz = _xyz(nt, tc)
        # wavy stripes running pole to pole
        a = _math(nt, "MULTIPLY", g.outputs["Fac"], 16.0 * math.pi * 2 / 2)
        a = _math(nt, "MULTIPLY_ADD", n, 3.5, a)
        a = _math(nt, "MULTIPLY_ADD", xyz.outputs["Z"], 0.6, a)
        sw = _math(nt, "SINE", a)
        stripe = _ramp(nt, sw, [(0.0, (0.0, 0.0, 0.0)), (0.42, (0.0, 0.0, 0.0)), (0.62, (1, 1, 1)), (1.0, (1, 1, 1))])
        fine = _noise(nt, tc, 22.0, 6.0, 0.4)
        dark = _ramp(nt, fine, [(0.3, (0.01, 0.06, 0.01)), (0.7, (0.03, 0.14, 0.02))])
        light = _ramp(nt, fine, [(0.3, (0.18, 0.36, 0.06)), (0.7, (0.32, 0.5, 0.12))])
        return _mix(nt, stripe, light, dark)
    return _skin(name, color, blush_pts, blush_r, (0.9, 0.35, 0.4),
                 {"Roughness": 0.3, "Coat Weight": 0.8, "Coat Roughness": 0.08, "Subsurface Weight": 0.05},
                 bump=(40.0, 0.05), blush_amt=0.6)


def kiwi_skin(name, blush_pts=(), blush_r=0.2):
    def color(nt, tc):
        n = _noise(nt, tc, 9.0, 8.0, 0.3)
        return _ramp(nt, n, [(0.25, (0.07, 0.035, 0.01)), (0.55, (0.15, 0.08, 0.025)), (0.8, (0.24, 0.15, 0.05))])
    return _skin(name, color, blush_pts, blush_r, (0.85, 0.32, 0.25),
                 {"Roughness": 0.85, "Sheen Weight": 0.7, "Sheen Roughness": 0.3, "Sheen Tint": (0.75, 0.55, 0.3, 1),
                  "Subsurface Weight": 0.05},
                 bump=(300.0, 0.45), blush_amt=0.6)


# ----------------------------------------------------------------------------- insides
def _flesh(name, color_fn, params, bump_scale=30.0, bump_str=0.5, voronoi=True):
    m, nt, b = SC.node_mat(name)
    N, L = nt.nodes, nt.links
    tc = N.new("ShaderNodeTexCoord")
    L.new(color_fn(nt, tc), b.inputs["Base Color"])
    for k, v in params.items():
        SC.setv(b, k, v)
    bn = N.new("ShaderNodeTexVoronoi" if voronoi else "ShaderNodeTexNoise")
    bn.inputs["Scale"].default_value = bump_scale
    L.new(tc.outputs["Object"], bn.inputs["Vector"])
    bu = N.new("ShaderNodeBump")
    bu.inputs["Strength"].default_value = bump_str
    bu.inputs["Distance"].default_value = 0.02
    L.new(bn.outputs["Distance" if voronoi else "Fac"], bu.inputs["Height"])
    L.new(bu.outputs["Normal"], b.inputs["Normal"])
    return m


def _radius(nt, tc, axis_only=False):
    vm = nt.nodes.new("ShaderNodeVectorMath")
    vm.operation = "LENGTH"
    if axis_only:
        s = _xyz(nt, tc)
        c = nt.nodes.new("ShaderNodeCombineXYZ")
        nt.links.new(s.outputs["X"], c.inputs["X"])
        nt.links.new(s.outputs["Y"], c.inputs["Y"])
        nt.links.new(c.outputs[0], vm.inputs[0])
    else:
        nt.links.new(tc.outputs["Object"], vm.inputs[0])
    return vm.outputs["Value"]


def peach_flesh(name, r_outer=1.0):
    def color(nt, tc):
        r = _radius(nt, tc)
        n = _noise(nt, tc, 7.0, 4.0)
        r = _math(nt, "MULTIPLY_ADD", n, 0.12, r)
        return _ramp(nt, r, [(0.0, (0.35, 0.08, 0.03)), (0.32, (0.7, 0.12, 0.05)), (0.42, (0.98, 0.55, 0.1)),
                             (0.85, (1.0, 0.62, 0.14)), (0.97, (0.95, 0.38, 0.06)), (1.05, (0.8, 0.15, 0.05))])
    return _flesh(name, color, {"Roughness": 0.25, "Subsurface Weight": 0.3, "Subsurface Radius": (1, 0.6, 0.2),
                                "Subsurface Scale": 0.03, "Coat Weight": 0.7, "Coat Roughness": 0.1},
                  bump_scale=30.0, bump_str=0.35, voronoi=False)


def melon_flesh(name, r_outer=1.0):
    def color(nt, tc):
        r = _radius(nt, tc)
        base = _ramp(nt, r, [(0.0, (0.9, 0.1, 0.13)), (0.8, (0.85, 0.06, 0.1)), (0.86, (0.95, 0.75, 0.65)),
                             (0.9, (0.85, 0.92, 0.7)), (0.95, (0.35, 0.6, 0.18)), (1.0, (0.03, 0.15, 0.02))])
        # black teardrop seeds in a band
        v = nt.nodes.new("ShaderNodeTexVoronoi")
        v.inputs["Scale"].default_value = 7.0
        nt.links.new(tc.outputs["Object"], v.inputs["Vector"])
        dots = _math(nt, "LESS_THAN", v.outputs["Distance"], 0.13)
        band = _math(nt, "MULTIPLY", _math(nt, "GREATER_THAN", r, 0.35), _math(nt, "LESS_THAN", r, 0.7))
        seed = _math(nt, "MULTIPLY", dots, band)
        return _mix(nt, seed, base, (0.01, 0.008, 0.006))
    return _flesh(name, color, {"Roughness": 0.15, "Subsurface Weight": 0.25, "Subsurface Radius": (1, 0.2, 0.2),
                                "Subsurface Scale": 0.03, "Coat Weight": 0.8, "Coat Roughness": 0.06},
                  bump_scale=45.0, bump_str=0.7)


def kiwi_flesh(name, r_outer=1.0):
    def color(nt, tc):
        r = _radius(nt, tc, axis_only=True)
        n = _noise(nt, tc, 10.0, 3.0)
        rr = _math(nt, "MULTIPLY_ADD", n, 0.05, r)
        base = _ramp(nt, rr, [(0.0, (0.95, 0.92, 0.7)), (0.13, (0.85, 0.9, 0.5)), (0.2, (0.45, 0.72, 0.08)),
                              (0.68, (0.32, 0.62, 0.04)), (0.76, (0.5, 0.6, 0.15)), (0.8, (0.3, 0.18, 0.06))])
        v = nt.nodes.new("ShaderNodeTexVoronoi")
        v.inputs["Scale"].default_value = 26.0
        nt.links.new(tc.outputs["Object"], v.inputs["Vector"])
        dots = _math(nt, "LESS_THAN", v.outputs["Distance"], 0.2)
        band = _math(nt, "MULTIPLY", _math(nt, "GREATER_THAN", r, 0.16), _math(nt, "LESS_THAN", r, 0.4))
        seed = _math(nt, "MULTIPLY", dots, band)
        return _mix(nt, seed, base, (0.01, 0.008, 0.005))
    return _flesh(name, color, {"Roughness": 0.15, "Subsurface Weight": 0.3, "Subsurface Radius": (0.4, 1, 0.2),
                                "Subsurface Scale": 0.03, "Coat Weight": 0.8, "Coat Roughness": 0.06},
                  bump_scale=35.0, bump_str=0.4)


# ----------------------------------------------------------------------------- tops
_stem_mats = {}


def _stem_mat(color):
    if color not in _stem_mats:
        _stem_mats[color] = SC.mat_simple("stem%d" % len(_stem_mats), color, rough=0.6)
    return _stem_mats[color]


def _stem(name, top, height, radius, color, bend=(0.06, 0.02)):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    sp = cu.splines.new("BEZIER")
    sp.bezier_points.add(1)
    p0, p1 = sp.bezier_points
    p0.co = (top.x, top.y, top.z - 0.03)
    p0.handle_left = (top.x, top.y, top.z - 0.1)
    p0.handle_right = (top.x, top.y, top.z + height * 0.5)
    p1.co = (top.x + bend[0], top.y + bend[1], top.z + height)
    p1.handle_left = (top.x + bend[0] * 0.3, top.y, top.z + height * 0.8)
    p1.handle_right = (top.x + bend[0] * 1.5, top.y + bend[1], top.z + height * 1.1)
    cu.bevel_depth = radius
    cu.bevel_resolution = 4
    cu.use_fill_caps = True
    cu.materials.append(_stem_mat(color))
    return SC.link(bpy.data.objects.new(name, cu))


def _leaf(name, base, ang, length, width, lift, leaf_mat):
    verts, faces = [], []
    nu, nw = 28, 11
    for i in range(nu + 1):
        u = i / nu
        w = width * math.sin(math.pi * min(1, u ** 0.7)) * (1 - u) ** 0.25 + 0.01
        for j in range(nw):
            s = (j / (nw - 1)) * 2 - 1
            lx, ly = u * length, s * w
            lz = lift * u - 0.25 * length * u * u + 0.06 * width * (1 - s * s) * 0 - 0.12 * abs(s) * w
            ca, sa = math.cos(ang), math.sin(ang)
            verts.append((base.x + lx * ca - ly * sa, base.y + lx * sa + ly * ca, base.z + lz))
    for i in range(nu):
        for j in range(nw - 1):
            a = i * nw + j
            faces.append([a, a + 1, a + nw + 1, a + nw])
    ob = SC.mesh_obj(name, verts, faces)
    sol = ob.modifiers.new("sol", "SOLIDIFY")
    sol.thickness = 0.015
    sol.offset = 0
    sd = ob.modifiers.new("sub", "SUBSURF")
    sd.levels = 1
    sd.render_levels = 2
    ob.data.materials.append(leaf_mat)
    return ob


def peach_top(name, top, n, leaf_mat, stem=True, seed=0.0, bvh=None):
    root = SC.link(bpy.data.objects.new(name, None))
    st = _stem(name + "_stem", top, 0.14, 0.035, (0.22, 0.13, 0.05), bend=(0.03, 0.0))
    st.parent = root
    base = Vector((top.x + 0.02, top.y, top.z + 0.09))
    lf = _leaf(name + "_leaf", base, 2.3 + seed * 0.3, 0.75, 0.2, 0.32, leaf_mat)
    lf.parent = root
    lf2 = _leaf(name + "_leaf2", base, -0.6 + seed * 0.2, 0.5, 0.14, 0.28, leaf_mat)
    lf2.parent = root
    return root


def melon_top(name, top, n, leaf_mat, stem=True, seed=0.0, bvh=None):
    root = SC.link(bpy.data.objects.new(name, None))
    st = _stem(name + "_stem", top, 0.16, 0.04, (0.35, 0.36, 0.12), bend=(0.08, 0.03))
    st.parent = root
    # a little curly tendril
    cu = bpy.data.curves.new(name + "_tendril", "CURVE")
    cu.dimensions = "3D"
    sp = cu.splines.new("POLY")
    pts = []
    for i in range(60):
        u = i / 59
        a = u * 5.5 * math.pi
        rr = 0.05 * (1 - 0.6 * u)
        pts.append((top.x + 0.08 + 0.25 * u + rr * math.cos(a), top.y + 0.03 + rr * math.sin(a), top.z + 0.14 + 0.06 * u))
    sp.points.add(len(pts) - 1)
    for p, c in zip(sp.points, pts):
        p.co = (*c, 1)
    cu.bevel_depth = 0.008
    cu.bevel_resolution = 2
    cu.materials.append(leaf_mat)
    t = SC.link(bpy.data.objects.new(name + "_tendril", cu))
    t.parent = root
    return root


def kiwi_top(name, top, n, leaf_mat, stem=True, seed=0.0, bvh=None):
    root = SC.link(bpy.data.objects.new(name, None))
    st = _stem(name + "_stem", top, 0.05, 0.05, (0.2, 0.12, 0.05), bend=(0.0, 0.0))
    st.parent = root
    return root


# ----------------------------------------------------------------------------- registry
def spec(name):
    base = dict(seeds=False, juice_tint=(1.0, 0.25, 0.28), solver="MANIFOLD", juice_density=18.0)
    if name == "strawberry":
        base.update(deform=SC.berry_deform, skin=SC.mat_berry, flesh=SC.mat_flesh, seeds=True, top=SC.make_calyx,
                    solver="EXACT",
                    table=(0.62, 0.4, 0.34), backdrop=(0.32, 0.6, 0.5), world=(0.75, 0.9, 0.85),
                    juice=(1.0, 0.12, 0.15))
    elif name == "peach":
        base.update(deform=peach_deform, skin=peach_skin, flesh=peach_flesh, top=peach_top,
                    table=(0.75, 0.62, 0.55), backdrop=(0.42, 0.42, 0.68), world=(0.82, 0.82, 0.95),
                    juice=(1.0, 0.55, 0.12), juice_tint=(1.0, 0.8, 0.5), juice_density=5.0)
    elif name == "watermelon":
        base.update(deform=melon_deform, skin=melon_skin, flesh=melon_flesh, top=melon_top,
                    table=(0.85, 0.78, 0.72), backdrop=(0.78, 0.45, 0.52), world=(0.95, 0.85, 0.88),
                    juice=(1.0, 0.15, 0.25), juice_tint=(1.0, 0.4, 0.45), juice_density=10.0)
    elif name == "kiwi":
        base.update(deform=kiwi_deform, skin=kiwi_skin, flesh=kiwi_flesh, top=kiwi_top,
                    table=(0.85, 0.8, 0.7), backdrop=(0.42, 0.6, 0.8), world=(0.85, 0.92, 1.0),
                    juice=(0.55, 0.9, 0.2), juice_tint=(0.85, 1.0, 0.6), juice_density=5.0)
    else:
        raise ValueError(name)
    return base
