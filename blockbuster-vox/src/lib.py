"""Paper-collage rendering library for the Blockbuster documentary.

Everything is drawn procedurally with PIL + numpy: aged paper plates, halftone
photo cutouts with scissor-cut borders, torn headline strips, typewriter slips,
rubber stamps, masking tape, red thread, maps and flat paper icons.
"""
import math, os, random, json, functools
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")
W, H, FPS = 1920, 1080, 30
STEP = 2  # animate on twos

# palette: faded archive + one hot red + restrained mustard
PAPER = (222, 207, 176)
NEWS = (236, 229, 211)
KRAFT = (201, 178, 138)
INK = (29, 27, 24)
GREY = (132, 126, 116)
LGREY = (184, 177, 163)
RED = (200, 38, 30)
MUSTARD = (212, 163, 46)
WHITE = (245, 240, 228)

def font(name, size):
    f = {"display": "Anton.woff", "type": "SpecialElite.woff", "label": "Oswald-Bold.woff"}[name]
    return _font(f, int(size))

@functools.lru_cache(maxsize=256)
def _font(f, size):
    return ImageFont.truetype(os.path.join(ASSETS, "fonts", f), size)

# ---------------------------------------------------------------- noise utils
def lowfreq(w, h, scale, rng):
    sw, sh = max(2, int(w / scale)), max(2, int(h / scale))
    a = (rng.random((sh, sw)) * 255).astype(np.uint8)
    im = Image.fromarray(a).resize((w, h), Image.BICUBIC)
    return np.asarray(im, dtype=np.float32) / 255.0

@functools.lru_cache(maxsize=1)
def grain_tex():
    rng = np.random.default_rng(7)
    n = 2200
    g = rng.normal(0, 1, (n, n)).astype(np.float32)
    g = np.asarray(Image.fromarray(np.clip(g * 40 + 128, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)), np.float32) / 255 - 0.5
    fib = lowfreq(n, n, 3, rng) - 0.5
    blot = lowfreq(n, n, 180, rng) - 0.5
    tex = 1.0 + g * 0.10 + fib * 0.05 + blot * 0.10
    return tex.astype(np.float32)

def texture(im_rgb, strength=1.0, seed=0):
    """Multiply paper grain/fibre into an RGB(A) image."""
    a = np.asarray(im_rgb, np.float32)
    h, w = a.shape[:2]
    t = grain_tex()
    r = random.Random(seed)
    ox, oy = r.randint(0, t.shape[1] - w - 1) if w < t.shape[1] else 0, r.randint(0, t.shape[0] - h - 1) if h < t.shape[0] else 0
    tt = t[oy:oy + h, ox:ox + w]
    if tt.shape[:2] != (h, w):
        tt = np.asarray(Image.fromarray(((t - 0.5) * 255).clip(0, 255).astype(np.uint8)).resize((w, h)), np.float32) / 255 + 0.5
    tt = 1 + (tt - 1) * strength
    out = a.copy()
    out[..., :3] = np.clip(a[..., :3] * tt[..., None], 0, 255)
    return Image.fromarray(out.astype(np.uint8), im_rgb.mode)

# ---------------------------------------------------------------- backgrounds
def _spiral(d, cx, cy, a, turns, sign, ang0, width, col, S, offs=(0,)):
    """Engraved volute: a log spiral drawn with parallel lines."""
    for o in offs:
        pts = []
        for k in range(int(70 * turns)):
            th = k / 70 * turns * 2 * math.pi
            r = (a + o) * math.exp(-0.22 * th)
            pts.append((cx + sign * r * math.cos(th + ang0) * S, cy + r * math.sin(th + ang0) * S))
        d.line(pts, fill=col, width=width, joint="curve")

def _leaf(d, x0, y0, x1, y1, bulge, col, S, hatch=6, width=2):
    """Acanthus-like leaf: two curved edges plus hatching."""
    def edge(sgn):
        pts = []
        for k in range(25):
            t = k / 24
            mx, my = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            nx, ny = -(y1 - y0), (x1 - x0)
            L = math.hypot(nx, ny) or 1
            b = math.sin(t * math.pi) * bulge * sgn * (1 - 0.3 * t)
            pts.append(((mx + nx / L * b) * S, (my + ny / L * b) * S))
        return pts
    e1, e2 = edge(1), edge(-1)
    d.line(e1, fill=col, width=width * S)
    d.line(e2, fill=col, width=width * S)
    for h in range(1, hatch):
        i = int(h / hatch * 24)
        d.line([e1[i], ((e1[i][0] + e2[i][0]) / 2, (e1[i][1] + e2[i][1]) / 2)], fill=col, width=max(1, S))

@functools.lru_cache(maxsize=2)
def scroll_band(seed=0):
    """Baroque engraved scrollwork band (L mask), W wide, tiled from mirrored motifs."""
    S = 2
    bw, bh = W, 250
    im = Image.new("L", (bw * S, bh * S), 0)
    d = ImageDraw.Draw(im)
    unit = 420
    for u in range(-1, bw // unit + 2):
        ux = u * unit + unit / 2
        for side in (-1, 1):
            # large C-scroll volute with engraved parallel lines
            _spiral(d, ux + side * 120, 112, 74, 1.7, side, -0.5, 3 * S, 255, S, offs=(0, -6, -12, -18))
            # counter volute
            _spiral(d, ux + side * 200, 60, 40, 1.5, -side, 2.4, 2 * S, 255, S, offs=(0, -5, -10))
            # small curl near centre bottom
            _spiral(d, ux + side * 45, 190, 26, 1.3, side, 0.8, 2 * S, 255, S, offs=(0, -5))
            # acanthus leaves
            _leaf(d, ux + side * 135, 40, ux + side * 230, 8, 24, 255, S, hatch=9, width=3)
            _leaf(d, ux + side * 110, 186, ux + side * 230, 210, 20, 255, S, hatch=8, width=3)
            _leaf(d, ux + side * 20, 96, ux + side * 92, 160, 17, 255, S, hatch=6)
            # sweeping tendril connecting to the next motif
        for k, (h, wdt) in enumerate([(140, 30), (100, 21), (64, 12)]):
            _leaf(d, ux, 22 + k * 6, ux, 22 + h, wdt, 255, S, hatch=6, width=3 if k == 0 else 2)
        d.ellipse([(ux - 12) * S, 176 * S, (ux + 12) * S, 200 * S], outline=255, width=3 * S)
        d.ellipse([(ux - 5) * S, 183 * S, (ux + 5) * S, 193 * S], fill=255)
    im = im.resize((bw, bh), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.6))
    return im

def _tri_height(rng, n, amp):
    """Piecewise-planar height field from a random triangle mesh (crisp facets)."""
    from scipy.spatial import Delaunay
    from scipy.interpolate import LinearNDInterpolator
    pad = 80
    pts = np.column_stack([rng.uniform(-pad, W + pad, n), rng.uniform(-pad, H + pad, n)])
    corners = np.array([[-pad * 2, -pad * 2], [W + pad * 2, -pad * 2], [-pad * 2, H + pad * 2], [W + pad * 2, H + pad * 2]])
    pts = np.vstack([pts, corners])
    z = rng.normal(0, amp, len(pts))
    f = LinearNDInterpolator(Delaunay(pts), z)
    yy, xx = np.mgrid[0:H, 0:W]
    return f(xx, yy).astype(np.float32)

@functools.lru_cache(maxsize=16)
def background(kind="news", variant=0):
    """Crumpled paper: big folds + small wrinkles, sharp creases, side lighting.
    Cached to build/bg/ because the fold field is slow to compute."""
    cache = os.path.join(ROOT, "build", "bg", f"{kind}_{variant}.png")
    if os.path.exists(cache):
        return Image.open(cache).convert("RGB")
    seed = {"news": 1, "tan": 2, "map": 3, "board": 4, "dark": 5}[kind] * 10 + variant
    rng = np.random.default_rng(seed)
    base = {"news": (238, 236, 233), "tan": (240, 234, 224), "map": (230, 230, 229), "board": (198, 168, 126), "dark": (70, 68, 68)}[kind]
    hf = _tri_height(rng, 300, 30) + _tri_height(rng, 2600, 6.5) + _tri_height(rng, 14000, 1.6)
    gy, gx = np.gradient(hf)
    L = np.array([-0.5, -0.65, 0.58]); L /= np.linalg.norm(L)
    nz = 1 / np.sqrt(gx * gx + gy * gy + 1)
    shade = (-gx * L[0] - gy * L[1] + L[2]) * nz
    shade = (shade - np.median(shade)) / (shade.std() + 1e-6)
    from scipy.ndimage import gaussian_filter
    shade = gaussian_filter(shade.astype(np.float32), 0.7)
    shade = np.tanh(shade / 2.2) * 2.2
    lum = 0.97 + shade * (0.075 if kind != "dark" else 0.1)
    lum *= 1 + (lowfreq(W, H, 300, rng) - 0.5) * 0.10  # soft overall light falloff
    a = np.array(base, np.float32)[None, None, :] * lum[..., None]
    sm = np.clip(lowfreq(W, H, 110, rng) - 0.62, 0, 1) * 0.22
    a *= (1 - sm[..., None] * np.array((0.55, 0.65, 0.85), np.float32))
    a += (rng.normal(0, 1, (H, W)).astype(np.float32) * 2.0)[..., None]
    yv, xv = np.mgrid[0:H, 0:W].astype(np.float32)
    v = ((xv - W / 2) / (W * 0.62)) ** 2 + ((yv - H / 2) / (H * 0.62)) ** 2
    a *= (1 - np.clip(v - 0.45, 0, 1.2) * 0.2)[..., None]
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    os.makedirs(os.path.dirname(cache), exist_ok=True)
    img.save(cache)
    return img

# ---------------------------------------------------------------- edges
def jitter_poly(w, h, inset, amp, seg, rng):
    pts = []
    corners = [(inset, inset), (w - inset, inset), (w - inset, h - inset), (inset, h - inset)]
    for i in range(4):
        x0, y0 = corners[i]
        x1, y1 = corners[(i + 1) % 4]
        L = math.hypot(x1 - x0, y1 - y0)
        n = max(2, int(L / seg))
        nx, ny = -(y1 - y0) / L, (x1 - x0) / L
        for k in range(n):
            t = k / n
            j = (rng.random() - 0.5) * 2 * amp
            jc = (rng.random() - 0.5) * 2 * amp * (1.6 if k == 0 else 1)
            jj = jc if k == 0 else j
            pts.append((x0 + (x1 - x0) * t + nx * jj, y0 + (y1 - y0) * t + ny * jj))
    return pts

def rough_alpha(alpha, amount=2.0, freq=6, seed=0, torn=False):
    """Make an alpha mask's edge look hand cut (or torn)."""
    rng = np.random.default_rng(seed)
    a = alpha.filter(ImageFilter.GaussianBlur(amount))
    arr = np.asarray(a, np.float32) / 255
    h, w = arr.shape
    n = lowfreq(w, h, freq, rng) - 0.5
    if torn:
        n = n * 0.9 + (lowfreq(w, h, 2.2, rng) - 0.5) * 0.7
    arr = arr + n * (0.55 if torn else 0.25)
    out = np.clip((arr - 0.5) * 6 + 0.5, 0, 1)
    return Image.fromarray((out * 255).astype(np.uint8))

def add_border(img, b, color=WHITE, seed=0, torn=False):
    """Put a paper margin around an RGBA piece (like it was cut out with a border)."""
    pad = b + 6
    W2, H2 = img.width + 2 * pad, img.height + 2 * pad
    al = Image.new("L", (W2, H2), 0)
    al.paste(img.getchannel("A"), (pad, pad))
    grown = al.filter(ImageFilter.GaussianBlur(b * 0.55))
    grown = grown.point(lambda v: 255 if v > 18 else 0)
    grown = rough_alpha(grown, 1.6, 5, seed, torn)
    base = Image.new("RGBA", (W2, H2), color + (0,))
    base.putalpha(grown)
    base = texture(base, 1.2, seed)
    base.alpha_composite(img, (pad, pad))
    return base

def shadowed(img, rot=0.0, off=(7, 9), blur=7, opacity=0.38):
    """Rotate a piece and bake a soft cut-paper drop shadow under it."""
    if rot:
        img = img.rotate(rot, Image.BICUBIC, expand=True)
    pad = blur * 3 + max(abs(off[0]), abs(off[1]))
    W2, H2 = img.width + 2 * pad, img.height + 2 * pad
    sh = Image.new("L", (W2, H2), 0)
    sh.paste(img.getchannel("A"), (pad + off[0], pad + off[1]))
    sh = sh.filter(ImageFilter.GaussianBlur(blur)).point(lambda v: int(v * opacity))
    out = Image.new("RGBA", (W2, H2), (12, 10, 8, 0))
    out.putalpha(sh)
    out.alpha_composite(img, (pad, pad))
    return out

# ---------------------------------------------------------------- halftone
def halftone(img, width, cell=6.0, ink=INK, paper=NEWS, contrast=1.25, gamma=1.0, tint=None):
    """Monochrome halftone conversion (45 degree screen)."""
    im = img.convert("L")
    h = int(im.height * width / im.width)
    im = im.resize((width, h), Image.LANCZOS)
    g = np.asarray(im, np.float32) / 255
    g = np.clip((g - 0.5) * contrast + 0.5, 0, 1) ** gamma
    gb = np.asarray(Image.fromarray((g * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(cell * 0.35)), np.float32) / 255
    yy, xx = np.mgrid[0:h, 0:width].astype(np.float32)
    c, s = math.cos(math.radians(45)), math.sin(math.radians(45))
    u = (xx * c + yy * s) / cell
    v = (-xx * s + yy * c) / cell
    du = u - np.floor(u) - 0.5
    dv = v - np.floor(v) - 0.5
    dist = np.sqrt(du * du + dv * dv)
    dark = 1 - gb
    r = np.sqrt(dark / math.pi) * 1.08
    cov = np.clip((r - dist) * cell * 1.2 + 0.5, 0, 1)
    # keep a little continuous tone so fine text stays legible
    cov = np.clip(cov * 0.82 + dark * 0.22, 0, 1)
    pap = np.array(paper, np.float32)
    ik = np.array(ink, np.float32)
    out = pap[None, None, :] * (1 - cov[..., None]) + ik[None, None, :] * cov[..., None]
    if tint is not None:
        out = out * 0.75 + np.array(tint, np.float32)[None, None, :] * 0.25 * (1 - cov[..., None])
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))

def color_print(img, width, sat=0.55):
    """Faded colour offset print with halftone texture (for posters / screens)."""
    im = img.convert("RGB")
    h = int(im.height * width / im.width)
    im = im.resize((width, h), Image.LANCZOS)
    a = np.asarray(im, np.float32)
    grey = a.mean(axis=2, keepdims=True)
    a = grey + (a - grey) * sat
    a = a * 0.86 + np.array(PAPER, np.float32) * 0.14
    ht = np.asarray(halftone(img, width, 4.5, contrast=1.0), np.float32)
    a = a * (0.72 + 0.28 * ht / 235.0)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

# ---------------------------------------------------------------- pieces
def photo_piece(name, width, crop=None, cell=5.5, border=14, seed=1, mode="ht", contrast=1.25, gamma=1.0):
    im = Image.open(os.path.join(ASSETS, "photos", name)).convert("RGB")
    if crop:
        x0, y0, x1, y1 = crop
        im = im.crop((int(x0 * im.width), int(y0 * im.height), int(x1 * im.width), int(y1 * im.height)))
    if mode == "ht":
        ph = halftone(im, width, cell, contrast=contrast, gamma=gamma)
    else:
        ph = color_print(im, width)
    rng = random.Random(seed)
    w, h = ph.size
    pad = border
    card = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), WHITE + (255,))
    card = texture(card, 1.2, seed)
    card.paste(ph, (pad, pad))
    m = Image.new("L", card.size, 0)
    ImageDraw.Draw(m).polygon(jitter_poly(card.width, card.height, 2, 3.0, 90, rng), fill=255)
    card.putalpha(m)
    return card

def scissor(img, seed=0):
    """Clip any RGBA piece with a slightly irregular scissor-cut polygon."""
    rng = random.Random(seed)
    m = Image.new("L", img.size, 0)
    ImageDraw.Draw(m).polygon(jitter_poly(img.width, img.height, 2, 2.5, 70, rng), fill=255)
    out = img.copy()
    out.putalpha(ImageChops.multiply(img.getchannel("A"), m))
    return out

def text_size(fnt, txt):
    b = fnt.getbbox(txt)
    return b[2] - b[0], b[3] - b[1], b

def slip(text, size=40, bg=WHITE, fg=INK, seed=0, pad=(22, 14)):
    """Typewriter caption slip."""
    f = font("type", size)
    tw, th, b = text_size(f, text)
    w, h = tw + pad[0] * 2, int(size * 1.0) + pad[1] * 2
    im = Image.new("RGBA", (w, h), bg + (255,))
    d = ImageDraw.Draw(im)
    d.text((pad[0] - b[0], (h - th) / 2 - b[1]), text, font=f, fill=fg)
    im = texture(im, 1.3, seed)
    return scissor(im, seed)

def headline(text, size=90, bg=NEWS, fg=INK, seed=0, pad=(34, 18), squeeze=1.0):
    """Condensed display headline on a torn newsprint strip."""
    f = font("display", size)
    tw, th, b = text_size(f, text)
    w, h = tw + pad[0] * 2, th + pad[1] * 2
    im = Image.new("RGBA", (w, h), bg + (255,))
    ImageDraw.Draw(im).text((pad[0] - b[0], pad[1] - b[1]), text, font=f, fill=fg)
    if squeeze != 1.0:
        im = im.resize((int(w * squeeze), h), Image.LANCZOS)
    im = texture(im, 1.3, seed)
    a = Image.new("L", im.size, 0)
    ImageDraw.Draw(a).rectangle([6, 6, im.width - 6, im.height - 6], fill=255)
    im.putalpha(rough_alpha(a, 2.5, 3, seed, torn=True))
    return im

def big_text(text, size=200, color=RED, seed=0, border=10):
    """Big cut-paper lettering."""
    f = font("display", size)
    tw, th, b = text_size(f, text)
    im = Image.new("RGBA", (tw + 20, th + 20), color + (0,))
    m = Image.new("L", im.size, 0)
    ImageDraw.Draw(m).text((10 - b[0], 10 - b[1]), text, font=f, fill=255)
    im.putalpha(rough_alpha(m, 0.8, 4, seed))
    im = texture(im, 1.4, seed)
    return add_border(im, border, WHITE, seed) if border else im

def stamp(text, size=60, color=RED, seed=0, box=True, rot=0):
    f = font("label", size)
    tw, th, b = text_size(f, text)
    pad = int(size * 0.35)
    w, h = tw + pad * 2 + 12, th + pad * 2 + 12
    m = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(m)
    if box:
        lw = max(4, size // 12)
        d.rounded_rectangle([lw, lw, w - lw - 1, h - lw - 1], radius=size // 6, outline=255, width=lw)
        d.rounded_rectangle([lw * 3, lw * 3, w - lw * 3 - 1, h - lw * 3 - 1], radius=size // 8, outline=255, width=max(2, lw // 2))
    d.text(((w - tw) / 2 - b[0], (h - th) / 2 - b[1]), text, font=f, fill=255)
    rng = np.random.default_rng(seed)
    arr = np.asarray(m, np.float32) / 255
    wear = lowfreq(w, h, 3, rng) * 0.6 + lowfreq(w, h, 30, rng) * 0.4
    arr = arr * np.clip((wear - 0.22) * 3, 0, 1)
    im = Image.new("RGBA", (w, h), color + (0,))
    im.putalpha(Image.fromarray((arr * 235).astype(np.uint8)))
    return im

def tape(length=170, width=52, seed=0, rot=0):
    im = Image.new("RGBA", (length, width), (232, 220, 186, 175))
    im = texture(im, 2.0, seed)
    a = Image.new("L", (length, width), 0)
    d = ImageDraw.Draw(a)
    rng = random.Random(seed)
    pts = [(0, 0)]
    for i in range(7):
        pts.append((rng.uniform(3, 9), width * (i + 1) / 8))
    pts += [(0, width), (length, width)]
    for i in range(7):
        pts.append((length - rng.uniform(3, 9), width * (7 - i) / 8))
    pts.append((length, 0))
    d.polygon([(0, 0), (length, 0), (length, width), (0, width)], fill=170)
    for i in range(8):
        y0, y1 = width * i / 8, width * (i + 1) / 8
        d.polygon([(0, y0), (rng.uniform(4, 10), (y0 + y1) / 2), (0, y1)], fill=0)
        d.polygon([(length, y0), (length - rng.uniform(4, 10), (y0 + y1) / 2), (length, y1)], fill=0)
    im.putalpha(a)
    return im

# ---------------------------------------------------------------- maps
@functools.lru_cache(maxsize=1)
def geo():
    return json.load(open(os.path.join(ASSETS, "geo.json")))

TEXAS = [(-106.6, 31.8), (-103.06, 32.0), (-103.04, 36.5), (-100.0, 36.5), (-100.0, 34.56), (-99.2, 34.3), (-98.1, 34.1),
         (-96.9, 33.9), (-95.6, 33.9), (-94.5, 33.6), (-94.04, 33.55), (-94.04, 31.99), (-93.7, 31.2), (-93.84, 29.7),
         (-94.7, 29.35), (-95.9, 28.6), (-97.0, 27.8), (-97.4, 26.0), (-98.3, 26.1), (-99.1, 26.4), (-99.5, 27.5),
         (-100.3, 28.3), (-101.0, 29.8), (-102.4, 29.8), (-103.1, 29.0), (-104.5, 29.6), (-105.0, 30.7), (-106.6, 31.8)]

class Proj:
    def __init__(self, lon0, lon1, lat0, lat1, w, pad=20):
        self.lon0, self.lat1 = lon0, lat1
        self.k = math.cos(math.radians((lat0 + lat1) / 2))
        self.s = (w - 2 * pad) / ((lon1 - lon0) * self.k)
        self.pad = pad
        self.w = w
        self.h = int((lat1 - lat0) * self.s + 2 * pad)
    def __call__(self, lon, lat):
        return (self.pad + (lon - self.lon0) * self.k * self.s, self.pad + (self.lat1 - lat) * self.s)

def map_piece(region, w, fill=(214, 200, 168), seed=0, outline=INK, extra=None):
    """Returns (RGBA piece, projection) for 'us', 'texas' or 'world'."""
    if region == "us":
        pr = Proj(-125, -66.5, 24.3, 49.5, w)
        polys = geo()["us"]
    elif region == "texas":
        pr = Proj(-107, -93.4, 25.7, 36.7, w)
        polys = [TEXAS]
    else:
        pr = Proj(-170, 180, -56, 78, w)
        polys = [p for c in geo()["world"] for p in c["polys"]]
    S = 2
    im = Image.new("RGBA", (pr.w * S, pr.h * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for p in polys:
        pts = [tuple(c * S for c in pr(x, y)) for x, y in p]
        if len(pts) > 2:
            d.polygon(pts, fill=fill + (255,))
    for p in polys:
        pts = [tuple(c * S for c in pr(x, y)) for x, y in p]
        if len(pts) > 2:
            d.line(pts + [pts[0]], fill=outline + (255,), width=(3 if region != "world" else 2) * S, joint="curve")
    im = im.resize((pr.w, pr.h), Image.LANCZOS)
    im = texture(im, 1.4, seed)
    # halftone shading inside land
    a = np.asarray(im, np.float32)
    ht = np.asarray(halftone(Image.new("L", (pr.w, pr.h), 190), pr.w, 7, contrast=1.0), np.float32)
    land = a[..., 3:4] / 255
    a[..., :3] = a[..., :3] * (1 - 0.18 * land) + ht * 0.18 * land
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), pr

# ---------------------------------------------------------------- icons
def _canvas(w, h, S=3):
    im = Image.new("RGBA", (w * S, h * S), (0, 0, 0, 0))
    return im, ImageDraw.Draw(im), S

def _finish(im, w, h, seed=0, border=8, tex=1.3):
    im = im.resize((w, h), Image.LANCZOS)
    im = texture(im, tex, seed)
    return add_border(im, border, WHITE, seed) if border else im

def icon(name, w, seed=0, border=8, **kw):
    fn = ICONS[name]
    return fn(w, seed=seed, border=border, **kw)

def _ink(S, k=3):
    return int(k * S)

def ic_vhs(w, seed=0, border=8, label="", color=INK):
    h = int(w * 0.58)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    lw = _ink(S)
    d.rounded_rectangle([lw, lw, W_ - lw, H_ - lw], radius=10 * S, fill=color + (255,), outline=INK + (255,), width=lw)
    d.rounded_rectangle([W_ * .12, H_ * .12, W_ * .88, H_ * .5], radius=6 * S, fill=WHITE + (255,))
    for cx in (0.3, 0.7):
        r = H_ * 0.15
        d.ellipse([W_ * cx - r, H_ * .64 - r, W_ * cx + r, H_ * .64 + r], fill=LGREY + (255,), outline=INK + (255,), width=lw)
        r2 = r * 0.4
        d.ellipse([W_ * cx - r2, H_ * .64 - r2, W_ * cx + r2, H_ * .64 + r2], fill=INK + (255,))
    d.rectangle([W_ * .42, H_ * .58, W_ * .58, H_ * .72], fill=(70, 66, 60, 255))
    if label:
        f = font("type", int(H_ * 0.18))
        tw, th, b = text_size(f, label)
        d.text((W_ / 2 - tw / 2 - b[0], H_ * .31 - th / 2 - b[1]), label, font=f, fill=INK + (255,))
    return _finish(im, w, h, seed, border)

def ic_spine(w, seed=0, border=0, color=INK):
    h = int(w * 4.2)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    d.rectangle([0, 0, W_, H_], fill=color + (255,))
    d.rectangle([W_ * .15, H_ * .08, W_ * .85, H_ * .55], fill=WHITE + (255,))
    d.rectangle([W_ * .15, H_ * .62, W_ * .85, H_ * .68], fill=MUSTARD + (255,))
    return _finish(im, w, h, seed, border)

def ic_dvd(w, seed=0, border=8):
    im, d, S = _canvas(w, w)
    W_ = w * S
    lw = _ink(S)
    d.ellipse([lw, lw, W_ - lw, W_ - lw], fill=(205, 203, 196, 255), outline=INK + (255,), width=lw)
    for k in range(5):
        r = W_ * (0.18 + k * 0.06)
        d.arc([W_ / 2 - r, W_ / 2 - r, W_ / 2 + r, W_ / 2 + r], 200, 260, fill=WHITE + (255,), width=2 * S)
    r = W_ * 0.16
    d.ellipse([W_ / 2 - r, W_ / 2 - r, W_ / 2 + r, W_ / 2 + r], fill=LGREY + (255,), outline=INK + (255,), width=lw)
    r = W_ * 0.06
    d.ellipse([W_ / 2 - r, W_ / 2 - r, W_ / 2 + r, W_ / 2 + r], fill=(0, 0, 0, 0))
    return _finish(im, w, w, seed, border)

def ic_envelope(w, seed=0, border=8, color=RED, label=""):
    h = int(w * 0.62)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    lw = _ink(S)
    d.rectangle([lw, lw, W_ - lw, H_ - lw], fill=color + (255,), outline=INK + (255,), width=lw)
    d.line([(lw, lw), (W_ / 2, H_ * .55), (W_ - lw, lw)], fill=INK + (255,), width=lw)
    d.rectangle([W_ * .08, H_ * .74, W_ * .45, H_ * .86], fill=WHITE + (255,))
    for i in range(9):
        x = W_ * .1 + i * W_ * .036
        d.line([(x, H_ * .76), (x, H_ * .84)], fill=INK + (255,), width=(2 if i % 2 else 4) * S)
    if label:
        f = font("label", int(H_ * 0.2))
        tw, th, b = text_size(f, label)
        d.text((W_ * .9 - tw - b[0], H_ * .68 - b[1]), label, font=f, fill=WHITE + (255,))
    return _finish(im, w, h, seed, border)

def ic_store(w, seed=0, border=8, sign="", awning=MUSTARD):
    h = int(w * 0.75)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    lw = _ink(S)
    d.rectangle([W_ * .04, H_ * .2, W_ * .96, H_ * .98], fill=(214, 204, 182, 255), outline=INK + (255,), width=lw)
    d.rectangle([W_ * .0, H_ * .05, W_, H_ * .28], fill=awning + (255,), outline=INK + (255,), width=lw)
    for i in range(1, 8):
        x = W_ * i / 8
        d.line([(x, H_ * .28), (x - W_ * .02, H_ * .36)], fill=INK + (255,), width=lw)
    d.polygon([(0, H_ * .28), (W_, H_ * .28), (W_ * .98, H_ * .36), (W_ * .02, H_ * .36)], fill=awning + (255,), outline=INK + (255,))
    d.rectangle([W_ * .1, H_ * .45, W_ * .55, H_ * .85], fill=(120, 132, 140, 255), outline=INK + (255,), width=lw)
    d.rectangle([W_ * .65, H_ * .45, W_ * .88, H_ * .98], fill=(90, 84, 76, 255), outline=INK + (255,), width=lw)
    d.line([(W_ * .1, H_ * .62), (W_ * .55, H_ * .62)], fill=INK + (255,), width=lw)
    if sign:
        f = font("display", int(H_ * 0.15))
        tw, th, b = text_size(f, sign)
        sc = min(1.0, W_ * .9 / tw)
        f = font("display", int(H_ * 0.15 * sc))
        tw, th, b = text_size(f, sign)
        d.text((W_ / 2 - tw / 2 - b[0], H_ * .165 - th / 2 - b[1]), sign, font=f, fill=INK + (255,))
    return _finish(im, w, h, seed, border)

def ic_ticket(w, seed=0, border=10, text="BLOCKBUSTER", color=MUSTARD, fg=INK):
    """Torn-ticket brand plate (generic shape)."""
    h = int(w * 0.42)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    lw = _ink(S, 4)
    pts = [(0, 0), (W_ * .97, 0), (W_ * .93, H_ * .2), (W_, H_ * .35), (W_ * .94, H_ * .55), (W_ * .99, H_ * .78), (W_ * .95, H_), (0, H_)]
    d.polygon(pts, fill=color + (255,))
    d.line(pts + [pts[0]], fill=INK + (255,), width=lw)
    r = H_ * .12
    d.ellipse([-r, H_ / 2 - r, r, H_ / 2 + r], fill=(0, 0, 0, 0))
    d.rectangle([W_ * .07, H_ * .14, W_ * .86, H_ * .86], outline=INK + (255,), width=lw // 2)
    f = font("display", int(H_ * .5))
    tw, th, b = text_size(f, text)
    sc = min(1, W_ * .72 / tw)
    f = font("display", int(H_ * .5 * sc))
    tw, th, b = text_size(f, text)
    d.text((W_ * .465 - tw / 2 - b[0], H_ / 2 - th / 2 - b[1]), text, font=f, fill=fg + (255,))
    return _finish(im, w, h, seed, border)

def ic_person(w, seed=0, border=8, color=INK, pose="stand", tie=None):
    """Flat cut-paper figure with no facial detail."""
    h = int(w * 2.3)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    c = color + (255,)
    hr = W_ * 0.2
    cx = W_ / 2
    d.ellipse([cx - hr, H_ * .02, cx + hr, H_ * .02 + 2 * hr], fill=c)
    d.rounded_rectangle([cx - W_ * .4, H_ * .2, cx + W_ * .4, H_ * .62], radius=W_ * .18, fill=c)
    if tie:
        d.polygon([(cx - W_ * .06, H_ * .21), (cx + W_ * .06, H_ * .21), (cx + W_ * .05, H_ * .42), (cx, H_ * .47), (cx - W_ * .05, H_ * .42)], fill=tie + (255,))
    if pose == "walk":
        d.polygon([(cx - W_ * .3, H_ * .58), (cx, H_ * .58), (cx - W_ * .28, H_ * .99), (cx - W_ * .44, H_ * .99)], fill=c)
        d.polygon([(cx, H_ * .58), (cx + W_ * .3, H_ * .58), (cx + W_ * .42, H_ * .99), (cx + W_ * .26, H_ * .99)], fill=c)
    else:
        d.rectangle([cx - W_ * .3, H_ * .58, cx - W_ * .04, H_ * .99], fill=c)
        d.rectangle([cx + W_ * .04, H_ * .58, cx + W_ * .3, H_ * .99], fill=c)
    return _finish(im, w, h, seed, border)

def ic_family(w, seed=0, border=8):
    h = int(w * 0.62)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    for cx, sc, col in [(0.2, 1.0, INK), (0.42, 0.62, (60, 56, 50)), (0.6, 0.5, (60, 56, 50)), (0.8, 0.95, INK)]:
        hh = H_ * sc
        x = W_ * cx
        top = H_ - hh
        hr = hh * 0.11
        c = col + (255,)
        d.ellipse([x - hr, top, x + hr, top + 2 * hr], fill=c)
        d.rounded_rectangle([x - hh * .17, top + hh * .22, x + hh * .17, top + hh * .66], radius=hh * .08, fill=c)
        d.rectangle([x - hh * .13, top + hh * .62, x - hh * .02, H_], fill=c)
        d.rectangle([x + hh * .02, top + hh * .62, x + hh * .13, H_], fill=c)
    return _finish(im, w, h, seed, border)

def ic_building(w, seed=0, border=8, label=""):
    h = int(w * 1.3)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    lw = _ink(S)
    d.rectangle([W_ * .12, H_ * .06, W_ * .88, H_ - lw], fill=(170, 164, 152, 255), outline=INK + (255,), width=lw)
    for r in range(9):
        for c in range(4):
            x0 = W_ * (.2 + c * .17)
            y0 = H_ * (.12 + r * .085)
            d.rectangle([x0, y0, x0 + W_ * .1, y0 + H_ * .05], fill=(225, 220, 205, 255) if (r * 3 + c) % 5 else MUSTARD + (255,))
    if label:
        f = font("label", int(W_ * .13))
        tw, th, b = text_size(f, label)
        d.rectangle([W_ / 2 - tw / 2 - 8 * S, H_ * .9 - th - 8 * S, W_ / 2 + tw / 2 + 8 * S, H_ * .9 + 6 * S], fill=WHITE + (255,))
        d.text((W_ / 2 - tw / 2 - b[0], H_ * .9 - th - b[1]), label, font=f, fill=INK + (255,))
    return _finish(im, w, h, seed, border)

def ic_money(w, seed=0, border=8, n=5):
    h = int(w * 0.62)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    lw = _ink(S, 2.5)
    for i in range(n):
        y = H_ * .25 + i * H_ * .1
        x = W_ * .05 + (i % 2) * W_ * .03
        d.rectangle([x, y, x + W_ * .86, y + H_ * .38], fill=(176, 190, 160, 255), outline=INK + (255,), width=lw)
    x, y = W_ * .05 + ((n - 1) % 2) * W_ * .03, H_ * .25 + (n - 1) * H_ * .1
    d.rectangle([x + W_ * .05, y + H_ * .05, x + W_ * .81, y + H_ * .33], outline=(70, 90, 60, 255), width=lw)
    r = H_ * .12
    d.ellipse([x + W_ * .43 - r, y + H_ * .19 - r, x + W_ * .43 + r, y + H_ * .19 + r], outline=(70, 90, 60, 255), width=lw)
    f = font("display", int(H_ * .18))
    d.text((x + W_ * .38, y + H_ * .085), "$", font=f, fill=(60, 80, 50, 255))
    return _finish(im, w, h, seed, border)

def ic_coin(w, seed=0, border=6, sym="$1"):
    im, d, S = _canvas(w, w)
    W_ = w * S
    lw = _ink(S)
    d.ellipse([lw, lw, W_ - lw, W_ - lw], fill=MUSTARD + (255,), outline=INK + (255,), width=lw)
    d.ellipse([W_ * .12, W_ * .12, W_ * .88, W_ * .88], outline=INK + (255,), width=lw // 2)
    f = font("display", int(W_ * .42))
    tw, th, b = text_size(f, sym)
    d.text((W_ / 2 - tw / 2 - b[0], W_ / 2 - th / 2 - b[1]), sym, font=f, fill=INK + (255,))
    return _finish(im, w, w, seed, border)

def ic_calendar(w, seed=0, border=8, day="", cross=True, title=""):
    h = int(w * 1.05)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    lw = _ink(S)
    d.rectangle([lw, H_ * .08, W_ - lw, H_ - lw], fill=WHITE + (255,), outline=INK + (255,), width=lw)
    d.rectangle([lw, H_ * .08, W_ - lw, H_ * .28], fill=RED + (255,), outline=INK + (255,), width=lw)
    for x in (0.28, 0.72):
        d.rounded_rectangle([W_ * x - 6 * S, 0, W_ * x + 6 * S, H_ * .16], radius=4 * S, fill=INK + (255,))
    if title:
        f = font("label", int(H_ * .12))
        tw, th, b = text_size(f, title)
        d.text((W_ / 2 - tw / 2 - b[0], H_ * .18 - th / 2 - b[1]), title, font=f, fill=WHITE + (255,))
    for r in range(4):
        for c in range(5):
            x0, y0 = W_ * (.1 + c * .165), H_ * (.35 + r * .155)
            d.rectangle([x0, y0, x0 + W_ * .13, y0 + H_ * .12], outline=LGREY + (255,), width=2 * S)
    if day:
        f = font("display", int(H_ * .32))
        tw, th, b = text_size(f, day)
        d.text((W_ / 2 - tw / 2 - b[0], H_ * .63 - th / 2 - b[1]), day, font=f, fill=INK + (255,))
    if cross:
        d.line([(W_ * .15, H_ * .38), (W_ * .85, H_ * .92)], fill=RED + (255,), width=_ink(S, 9))
        d.line([(W_ * .85, H_ * .38), (W_ * .15, H_ * .92)], fill=RED + (255,), width=_ink(S, 9))
    return _finish(im, w, h, seed, border)

def ic_document(w, seed=0, border=0, title="", lines=9, seal=False, bg=WHITE):
    h = int(w * 1.3)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    d.rectangle([0, 0, W_, H_], fill=bg + (255,))
    y = H_ * .08
    if title:
        f = font("label", int(W_ * .085))
        tw, th, b = text_size(f, title)
        sc = min(1, W_ * .84 / tw)
        f = font("label", int(W_ * .085 * sc))
        tw, th, b = text_size(f, title)
        d.text((W_ / 2 - tw / 2 - b[0], y - b[1]), title, font=f, fill=INK + (255,))
        y += th + H_ * .05
        d.line([(W_ * .08, y), (W_ * .92, y)], fill=INK + (255,), width=2 * S)
        y += H_ * .04
    rng = random.Random(seed)
    for i in range(lines):
        ln = W_ * (.84 if i % 4 != 3 else rng.uniform(.4, .7))
        d.line([(W_ * .08, y), (W_ * .08 + ln, y)], fill=GREY + (255,), width=int(3.2 * S))
        y += H_ * .055
    if seal:
        r = W_ * .1
        d.ellipse([W_ * .72 - r, H_ * .86 - r, W_ * .72 + r, H_ * .86 + r], outline=INK + (255,), width=2 * S)
        d.line([(W_ * .1, H_ * .9), (W_ * .45, H_ * .9)], fill=INK + (255,), width=2 * S)
    im = im.resize((w, h), Image.LANCZOS)
    im = texture(im, 1.3, seed)
    return scissor(im, seed)

def ic_receipt(w, seed=0, border=0, title="LATE FEE", amount=""):
    h = int(w * 1.6)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    pts = [(0, 0)]
    n = 12
    for i in range(n + 1):
        pts.append((W_ * i / n, H_ - (0 if i % 2 else H_ * .025)))
    poly = [(0, 0), (W_, 0)] + list(reversed(pts[1:]))
    d.polygon([(0, 0), (W_, 0)] + [(W_ * (n - i) / n, H_ - (0 if i % 2 else H_ * .03)) for i in range(n + 1)], fill=WHITE + (255,))
    f = font("type", int(W_ * .11))
    tw, th, b = text_size(f, title)
    d.text((W_ / 2 - tw / 2 - b[0], H_ * .07 - b[1]), title, font=f, fill=INK + (255,))
    y = H_ * .2
    fl = font("type", int(W_ * .075))
    for row in ["RENTAL ...... 1", "DAYS LATE ... 3", "-----------------"]:
        d.text((W_ * .08, y), row, font=fl, fill=INK + (255,))
        y += H_ * .08
    if amount:
        fa = font("display", int(W_ * .2))
        tw, th, b = text_size(fa, amount)
        d.text((W_ / 2 - tw / 2 - b[0], y + H_ * .04 - b[1]), amount, font=fa, fill=RED + (255,))
    im = im.resize((w, h), Image.LANCZOS)
    return texture(im, 1.3, seed)

def ic_clipping(w, seed=0, border=0, head="", lines=10, photo=True):
    h = int(w * 0.9)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    d.rectangle([0, 0, W_, H_], fill=NEWS + (255,))
    f = font("display", int(H_ * .13))
    tw, th, b = text_size(f, head)
    sc = min(1, W_ * .9 / max(1, tw))
    f = font("display", int(H_ * .13 * sc))
    tw, th, b = text_size(f, head)
    d.text((W_ * .05 - b[0], H_ * .05 - b[1]), head, font=f, fill=INK + (255,))
    y0 = H_ * .08 + th + H_ * .05
    cols = 3
    for c in range(cols):
        x0 = W_ * .05 + c * W_ * .31
        y = y0
        if photo and c == 0:
            d.rectangle([x0, y, x0 + W_ * .27, y + H_ * .3], fill=GREY + (255,))
            y += H_ * .34
        while y < H_ * .93:
            d.line([(x0, y), (x0 + W_ * .27, y)], fill=(120, 116, 108, 255), width=int(2.6 * S))
            y += H_ * .045
    im = im.resize((w, h), Image.LANCZOS)
    im = texture(im, 1.4, seed)
    a = Image.new("L", im.size, 0)
    ImageDraw.Draw(a).rectangle([5, 5, w - 5, h - 5], fill=255)
    im.putalpha(rough_alpha(a, 2.2, 3, seed, torn=True))
    return im

def ic_magnifier(w, seed=0, border=8):
    im, d, S = _canvas(w, w)
    W_ = w * S
    lw = _ink(S, 7)
    r = W_ * .3
    cx, cy = W_ * .4, W_ * .4
    d.line([(cx + r * .7, cy + r * .7), (W_ * .92, W_ * .92)], fill=INK + (255,), width=_ink(S, 18))
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(220, 225, 222, 150), outline=INK + (255,), width=lw)
    return _finish(im, w, w, seed, border)

def ic_chart(w, seed=0, border=0, kind="up", color=RED, bars=None, labels=None, bg=WHITE):
    h = int(w * 0.72)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    d.rectangle([0, 0, W_, H_], fill=bg + (255,))
    lw = _ink(S)
    ox, oy = W_ * .1, H_ * .86
    for i in range(1, 5):
        y = oy - (oy - H_ * .1) * i / 4
        d.line([(ox, y), (W_ * .94, y)], fill=LGREY + (255,), width=2 * S)
    d.line([(ox, H_ * .08), (ox, oy), (W_ * .94, oy)], fill=INK + (255,), width=lw)
    if bars is not None:
        n = len(bars)
        bw = (W_ * .8) / n
        mx = max(bars)
        for i, v in enumerate(bars):
            x0 = ox + bw * i + bw * .18
            y0 = oy - (oy - H_ * .12) * v / mx
            col = color if (isinstance(color, tuple) and len(color) == 3) else color[i]
            d.rectangle([x0, y0, x0 + bw * .64, oy], fill=col + (255,), outline=INK + (255,), width=lw // 2 + 1)
            if labels:
                f = font("label", int(H_ * .075))
                tw, th, b = text_size(f, labels[i])
                d.text((x0 + bw * .32 - tw / 2 - b[0], oy + H_ * .02 - b[1]), labels[i], font=f, fill=INK + (255,))
    else:
        rng = random.Random(seed)
        n = 9
        pts = []
        for i in range(n):
            t = i / (n - 1)
            if kind == "up":
                v = 0.08 + 0.85 * t ** 1.6 + rng.uniform(-.04, .04)
            elif kind == "down":
                v = 0.88 - 0.8 * t ** 1.2 + rng.uniform(-.04, .04)
            else:
                v = 0.4 + 0.25 * math.sin(t * 5) + rng.uniform(-.05, .05)
            pts.append((ox + (W_ * .82) * t, oy - (oy - H_ * .1) * v))
        d.line(pts, fill=color + (255,), width=_ink(S, 6), joint="curve")
        for p in pts:
            d.ellipse([p[0] - 6 * S, p[1] - 6 * S, p[0] + 6 * S, p[1] + 6 * S], fill=INK + (255,))
    im = im.resize((w, h), Image.LANCZOS)
    im = texture(im, 1.3, seed)
    return scissor(im, seed)

def ic_pie(w, seed=0, border=8, frac=0.3):
    im, d, S = _canvas(w, w)
    W_ = w * S
    lw = _ink(S)
    d.pieslice([lw, lw, W_ - lw, W_ - lw], -90 + 360 * frac, 270, fill=LGREY + (255,), outline=INK + (255,), width=lw)
    return _finish(im, w, w, seed, border)

def ic_slice(w, seed=0, border=8, frac=0.3):
    im, d, S = _canvas(w, w)
    W_ = w * S
    lw = _ink(S)
    d.pieslice([lw, lw, W_ - lw, W_ - lw], -90, -90 + 360 * frac, fill=RED + (255,), outline=INK + (255,), width=lw)
    out = _finish(im, w, w, seed, border)
    return out

def ic_monitor(w, seed=0, border=8, screen=None, label=""):
    h = int(w * 0.82)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    lw = _ink(S)
    d.rounded_rectangle([lw, lw, W_ - lw, H_ * .78], radius=12 * S, fill=(205, 198, 182, 255), outline=INK + (255,), width=lw)
    d.rectangle([W_ * .07, H_ * .07, W_ * .93, H_ * .68], fill=(40, 42, 44, 255))
    d.polygon([(W_ * .4, H_ * .78), (W_ * .6, H_ * .78), (W_ * .66, H_ * .92), (W_ * .34, H_ * .92)], fill=(180, 172, 156, 255), outline=INK + (255,))
    d.rectangle([W_ * .25, H_ * .92, W_ * .75, H_ - lw], fill=(180, 172, 156, 255), outline=INK + (255,), width=lw)
    if label:
        f = font("label", int(H_ * .1))
        tw, th, b = text_size(f, label)
        d.rectangle([W_ * .07, H_ * .07, W_ * .93, H_ * .2], fill=MUSTARD + (255,))
        d.text((W_ / 2 - tw / 2 - b[0], H_ * .135 - th / 2 - b[1]), label, font=f, fill=INK + (255,))
    im = im.resize((w, h), Image.LANCZOS)
    if screen is not None:
        sw, sh = int(w * .86), int(h * (0.61 - (0.13 if label else 0)))
        sc = screen.resize((sw, sh), Image.LANCZOS).convert("RGBA")
        im.alpha_composite(sc, (int(w * .07), int(h * (0.2 if label else 0.07))))
    im = texture(im, 1.3, seed)
    return add_border(im, border, WHITE, seed) if border else im

def ic_plane(w, seed=0, border=6):
    h = int(w * 0.8)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    c = INK + (255,)
    d.polygon([(W_ * .05, H_ * .5), (W_ * .2, H_ * .42), (W_ * .95, H_ * .45), (W_, H_ * .5), (W_ * .95, H_ * .55), (W_ * .2, H_ * .58)], fill=c)
    d.polygon([(W_ * .45, H_ * .46), (W_ * .62, H_ * .46), (W_ * .4, H_ * .02), (W_ * .32, H_ * .02)], fill=c)
    d.polygon([(W_ * .45, H_ * .54), (W_ * .62, H_ * .54), (W_ * .4, H_ * .98), (W_ * .32, H_ * .98)], fill=c)
    d.polygon([(W_ * .05, H_ * .5), (W_ * .14, H_ * .47), (W_ * .06, H_ * .25), (W_ * .01, H_ * .25)], fill=c)
    return _finish(im, w, h, seed, border)

def ic_book(w, seed=0, border=8, title=""):
    h = int(w * 1.35)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    lw = _ink(S)
    d.rectangle([lw, lw, W_ - lw, H_ - lw], fill=(70, 66, 60, 255), outline=INK + (255,), width=lw)
    d.rectangle([lw, lw, W_ * .1, H_ - lw], fill=INK + (255,))
    d.rectangle([W_ * .18, H_ * .2, W_ * .9, H_ * .5], fill=WHITE + (255,))
    if title:
        f = font("type", int(W_ * .09))
        lines = title.split("\n")
        y = H_ * .24
        for ln in lines:
            tw, th, b = text_size(f, ln)
            d.text((W_ * .54 - tw / 2 - b[0], y - b[1]), ln, font=f, fill=INK + (255,))
            y += th * 1.5
    return _finish(im, w, h, seed, border)

def ic_tag(w, seed=0, border=8, text=""):
    h = int(w * 0.55)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    lw = _ink(S)
    pts = [(W_ * .2, 0), (W_ - lw, 0), (W_ - lw, H_ - lw), (W_ * .2, H_ - lw), (lw, H_ / 2)]
    d.polygon(pts, fill=MUSTARD + (255,), outline=INK + (255,))
    d.line(pts + [pts[0]], fill=INK + (255,), width=lw)
    r = H_ * .08
    d.ellipse([W_ * .16 - r, H_ / 2 - r, W_ * .16 + r, H_ / 2 + r], fill=(0, 0, 0, 0), outline=INK + (255,), width=lw // 2)
    if text:
        f = font("display", int(H_ * .34))
        tw, th, b = text_size(f, text)
        sc = min(1, W_ * .68 / tw)
        f = font("display", int(H_ * .34 * sc))
        tw, th, b = text_size(f, text)
        d.text((W_ * .6 - tw / 2 - b[0], H_ / 2 - th / 2 - b[1]), text, font=f, fill=INK + (255,))
    return _finish(im, w, h, seed, border)

def ic_ring(w, seed=0, border=8):
    im, d, S = _canvas(w, w)
    W_ = w * S
    lw = _ink(S)
    r = W_ / 2 - lw
    for i in range(8):
        col = RED if i % 2 == 0 else WHITE
        d.pieslice([lw, lw, W_ - lw, W_ - lw], i * 45 + 22, i * 45 + 67, fill=col + (255,))
    d.ellipse([lw, lw, W_ - lw, W_ - lw], outline=INK + (255,), width=lw)
    ri = W_ * .26
    d.ellipse([W_ / 2 - ri, W_ / 2 - ri, W_ / 2 + ri, W_ / 2 + ri], fill=(0, 0, 0, 0), outline=INK + (255,), width=lw)
    return _finish(im, w, w, seed, border)

def ic_table(w, seed=0, border=8, n=6):
    h = int(w * 0.6)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    lw = _ink(S)
    for i in range(n // 2):
        x = W_ * (.25 + i * .25)
        for y in (H_ * .1, H_ * .9):
            r = H_ * .09
            d.ellipse([x - r, y - r, x + r, y + r], fill=INK + (255,))
    d.rounded_rectangle([W_ * .1, H_ * .22, W_ * .9, H_ * .78], radius=H_ * .25, fill=(120, 92, 62, 255), outline=INK + (255,), width=lw)
    for x in (W_ * .03, W_ * .97):
        r = H_ * .09
        d.ellipse([x - r, H_ / 2 - r, x + r, H_ / 2 + r], fill=RED + (255,) if x < W_ / 2 else INK + (255,))
    return _finish(im, w, h, seed, border)

def ic_truck(w, seed=0, border=8):
    h = int(w * 0.55)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    lw = _ink(S)
    d.rectangle([W_ * .03, H_ * .1, W_ * .66, H_ * .75], fill=(110, 120, 96, 255), outline=INK + (255,), width=lw)
    for i in range(1, 6):
        x = W_ * (.03 + .63 * i / 6)
        d.line([(x, H_ * .15), (x, H_ * .7)], fill=INK + (255,), width=lw // 2)
    d.polygon([(W_ * .68, H_ * .3), (W_ * .86, H_ * .3), (W_ * .97, H_ * .5), (W_ * .97, H_ * .75), (W_ * .68, H_ * .75)], fill=(150, 156, 132, 255), outline=INK + (255,))
    d.rectangle([W_ * .72, H_ * .35, W_ * .85, H_ * .5], fill=(200, 206, 205, 255))
    for x in (.17, .52, .84):
        r = H_ * .13
        d.ellipse([W_ * x - r, H_ * .78 - r, W_ * x + r, H_ * .78 + r], fill=INK + (255,))
        d.ellipse([W_ * x - r * .4, H_ * .78 - r * .4, W_ * x + r * .4, H_ * .78 + r * .4], fill=LGREY + (255,))
    return _finish(im, w, h, seed, border)

def ic_dish(w, seed=0, border=8):
    im, d, S = _canvas(w, w)
    W_ = w * S
    lw = _ink(S)
    d.line([(W_ * .5, W_ * .55), (W_ * .5, W_ * .95)], fill=INK + (255,), width=_ink(S, 8))
    d.rectangle([W_ * .3, W_ * .92, W_ * .7, W_ * .98], fill=INK + (255,))
    d.chord([W_ * .1, W_ * .05, W_ * .9, W_ * .75], 120, 330, fill=(225, 222, 212, 255), outline=INK + (255,), width=lw)
    d.line([(W_ * .38, W_ * .45), (W_ * .72, W_ * .2)], fill=INK + (255,), width=lw)
    d.ellipse([W_ * .7, W_ * .16, W_ * .78, W_ * .24], fill=RED + (255,))
    return _finish(im, w, w, seed, border)

def ic_gavel(w, seed=0, border=8):
    im, d, S = _canvas(w, w)
    W_ = w * S
    lw = _ink(S)
    d.rounded_rectangle([W_ * .08, W_ * .84, W_ * .62, W_ * .96], radius=8 * S, fill=(120, 92, 62, 255), outline=INK + (255,), width=lw)
    d.line([(W_ * .42, W_ * .36), (W_ * .92, W_ * .82)], fill=INK + (255,), width=_ink(S, 13))
    d.line([(W_ * .42, W_ * .36), (W_ * .92, W_ * .82)], fill=(150, 116, 78, 255), width=_ink(S, 8))
    cx, cy, a = W_ * .38, W_ * .32, math.radians(-42)
    hw, hh = W_ * .26, W_ * .11
    pts = [(cx + dx * math.cos(a) - dy * math.sin(a), cy + dx * math.sin(a) + dy * math.cos(a)) for dx, dy in [(-hw, -hh), (hw, -hh), (hw, hh), (-hw, hh)]]
    d.polygon(pts, fill=(140, 108, 72, 255))
    d.line(pts + [pts[0]], fill=INK + (255,), width=lw)
    return _finish(im, w, w, seed, border)

def ic_scissors(w, seed=0, border=8):
    im, d, S = _canvas(w, w)
    W_ = w * S
    lw = _ink(S, 4)
    d.polygon([(W_ * .5, W_ * .5), (W_ * .95, W_ * .2), (W_ * .97, W_ * .25)], fill=(200, 200, 196, 255), outline=INK + (255,))
    d.polygon([(W_ * .5, W_ * .5), (W_ * .95, W_ * .8), (W_ * .97, W_ * .75)], fill=(200, 200, 196, 255), outline=INK + (255,))
    for cy in (.3, .7):
        r = W_ * .14
        d.ellipse([W_ * .2 - r, W_ * cy - r, W_ * .2 + r, W_ * cy + r], outline=RED + (255,), width=_ink(S, 10))
        d.line([(W_ * .3, W_ * cy), (W_ * .5, W_ * .5)], fill=RED + (255,), width=_ink(S, 10))
    d.ellipse([W_ * .47, W_ * .47, W_ * .53, W_ * .53], fill=INK + (255,))
    return _finish(im, w, w, seed, border)

def ic_warning(w, seed=0, border=8):
    h = int(w * 0.9)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    lw = _ink(S, 6)
    pts = [(W_ / 2, lw), (W_ - lw, H_ - lw), (lw, H_ - lw)]
    d.polygon(pts, fill=MUSTARD + (255,))
    d.line(pts + [pts[0]], fill=INK + (255,), width=lw, joint="curve")
    d.rectangle([W_ * .46, H_ * .32, W_ * .54, H_ * .7], fill=INK + (255,))
    d.ellipse([W_ * .455, H_ * .76, W_ * .545, H_ * .85], fill=INK + (255,))
    return _finish(im, w, h, seed, border)

def ic_scale(w, seed=0, border=8, tilt=-12, left="", right=""):
    h = int(w * 0.8)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    lw = _ink(S, 4)
    cx = W_ / 2
    d.polygon([(cx - W_ * .12, H_ * .97), (cx + W_ * .12, H_ * .97), (cx, H_ * .85)], fill=INK + (255,))
    d.line([(cx, H_ * .2), (cx, H_ * .95)], fill=INK + (255,), width=_ink(S, 8))
    t = math.radians(tilt)
    L = W_ * .36
    lx, ly = cx - L * math.cos(t), H_ * .22 - L * math.sin(t) * -1
    rx, ry = cx + L * math.cos(t), H_ * .22 + L * math.sin(t) * -1
    ly, ry = H_ * .22 + L * math.sin(-t), H_ * .22 - L * math.sin(-t)
    d.line([(lx, ly), (rx, ry)], fill=INK + (255,), width=_ink(S, 7))
    for (x, y, lab) in ((lx, ly, left), (rx, ry, right)):
        d.line([(x, y), (x - W_ * .1, y + H_ * .3)], fill=INK + (255,), width=lw // 2)
        d.line([(x, y), (x + W_ * .1, y + H_ * .3)], fill=INK + (255,), width=lw // 2)
        d.chord([x - W_ * .13, y + H_ * .18, x + W_ * .13, y + H_ * .42], 0, 180, fill=(170, 150, 110, 255), outline=INK + (255,), width=lw // 2)
        if lab:
            f = font("label", int(H_ * .06))
            tw, th, b = text_size(f, lab)
            d.text((x - tw / 2 - b[0], y + H_ * .44 - b[1]), lab, font=f, fill=INK + (255,))
    d.ellipse([cx - 12 * S, H_ * .2 - 12 * S, cx + 12 * S, H_ * .2 + 12 * S], fill=RED + (255,))
    return _finish(im, w, h, seed, border)

def ic_clock(w, seed=0, border=8):
    im, d, S = _canvas(w, w)
    W_ = w * S
    lw = _ink(S, 4)
    d.ellipse([lw, lw, W_ - lw, W_ - lw], fill=WHITE + (255,), outline=INK + (255,), width=lw)
    for i in range(12):
        a = i * math.pi / 6
        d.line([(W_ / 2 + math.cos(a) * W_ * .36, W_ / 2 + math.sin(a) * W_ * .36), (W_ / 2 + math.cos(a) * W_ * .42, W_ / 2 + math.sin(a) * W_ * .42)], fill=INK + (255,), width=lw)
    d.line([(W_ / 2, W_ / 2), (W_ / 2, W_ * .18)], fill=INK + (255,), width=lw)
    d.line([(W_ / 2, W_ / 2), (W_ * .74, W_ * .6)], fill=RED + (255,), width=lw)
    return _finish(im, w, w, seed, border)

def ic_shelf(w, seed=0, border=8, rows=3):
    h = int(w * 0.75)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    lw = _ink(S)
    d.rectangle([lw, lw, W_ - lw, H_ - lw], fill=(196, 180, 150, 255), outline=INK + (255,), width=lw)
    rng = random.Random(seed)
    for r in range(rows):
        y1 = H_ * (r + 1) / rows - lw
        y0 = y1 - H_ / rows * .8
        x = W_ * .04
        while x < W_ * .93:
            bw = W_ * rng.uniform(.035, .05)
            col = rng.choice([INK, (70, 66, 60), MUSTARD, (120, 116, 108), RED if rng.random() < .1 else INK])
            d.rectangle([x, y0, x + bw, y1], fill=col + (255,))
            d.rectangle([x + bw * .2, y0 + (y1 - y0) * .1, x + bw * .8, y0 + (y1 - y0) * .45], fill=WHITE + (255,))
            x += bw + W_ * .006
        d.line([(lw, y1), (W_ - lw, y1)], fill=INK + (255,), width=lw * 2)
    return _finish(im, w, h, seed, border)

def ic_box(w, seed=0, border=8):
    h = int(w * 0.75)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    lw = _ink(S)
    d.rectangle([W_ * .05, H_ * .3, W_ * .95, H_ - lw], fill=(176, 140, 96, 255), outline=INK + (255,), width=lw)
    d.polygon([(W_ * .05, H_ * .3), (W_ * .2, H_ * .05), (W_ * .5, H_ * .3)], fill=(196, 160, 112, 255), outline=INK + (255,))
    d.polygon([(W_ * .95, H_ * .3), (W_ * .8, H_ * .05), (W_ * .5, H_ * .3)], fill=(196, 160, 112, 255), outline=INK + (255,))
    d.rectangle([W_ * .35, H_ * .5, W_ * .65, H_ * .62], fill=WHITE + (255,))
    return _finish(im, w, h, seed, border)

def ic_kiosk(w, seed=0, border=8):
    h = int(w * 1.7)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    lw = _ink(S)
    d.rectangle([lw, lw, W_ - lw, H_ - lw], fill=RED + (255,), outline=INK + (255,), width=lw)
    d.rectangle([W_ * .15, H_ * .12, W_ * .85, H_ * .32], fill=(40, 42, 44, 255))
    d.rectangle([W_ * .3, H_ * .45, W_ * .7, H_ * .5], fill=INK + (255,))
    d.rectangle([W_ * .3, H_ * .58, W_ * .7, H_ * .63], fill=INK + (255,))
    return _finish(im, w, h, seed, border)

def ic_check(w, seed=0, border=8, color=RED):
    im, d, S = _canvas(w, w)
    W_ = w * S
    d.line([(W_ * .1, W_ * .55), (W_ * .4, W_ * .85), (W_ * .92, W_ * .15)], fill=color + (255,), width=_ink(S, 22), joint="curve")
    return _finish(im, w, w, seed, border)

def ic_arrow(w, seed=0, border=8, color=RED, h_ratio=0.5):
    h = int(w * h_ratio)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    d.polygon([(0, H_ * .32), (W_ * .68, H_ * .32), (W_ * .68, 0), (W_, H_ / 2), (W_ * .68, H_), (W_ * .68, H_ * .68), (0, H_ * .68)], fill=color + (255,))
    return _finish(im, w, h, seed, border)

def ic_qmark(w, seed=0, border=10):
    return big_text("?", w, RED, seed, border)

def ic_bolt(w, seed=0, border=8):
    h = int(w * 1.6)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    d.polygon([(W_ * .55, 0), (W_ * .1, H_ * .55), (W_ * .45, H_ * .55), (W_ * .3, H_), (W_ * .9, H_ * .4), (W_ * .55, H_ * .4), (W_ * .8, 0)], fill=RED + (255,))
    return _finish(im, w, h, seed, border)

def ic_chair(w, seed=0, border=8):
    h = int(w * 1.3)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    lw = _ink(S)
    d.rounded_rectangle([W_ * .2, 0, W_ * .8, H_ * .5], radius=20 * S, fill=INK + (255,))
    d.rounded_rectangle([W_ * .1, H_ * .45, W_ * .9, H_ * .6], radius=12 * S, fill=(60, 56, 50, 255))
    d.line([(W_ * .5, H_ * .6), (W_ * .5, H_ * .85)], fill=INK + (255,), width=_ink(S, 8))
    for x in (.15, .5, .85):
        d.line([(W_ * .5, H_ * .85), (W_ * x, H_ * .97)], fill=INK + (255,), width=_ink(S, 6))
    return _finish(im, w, h, seed, border)

def ic_vise(w, seed=0, border=8):
    h = int(w * 0.5)
    im, d, S = _canvas(w, h)
    W_, H_ = w * S, h * S
    lw = _ink(S)
    d.rectangle([0, H_ * .15, W_ * .12, H_ * .85], fill=(120, 116, 108, 255), outline=INK + (255,), width=lw)
    d.rectangle([W_ * .12, H_ * .4, W_, H_ * .6], fill=(150, 146, 136, 255), outline=INK + (255,), width=lw)
    for i in range(10):
        x = W_ * (.15 + i * .085)
        d.line([(x, H_ * .4), (x + W_ * .03, H_ * .6)], fill=INK + (255,), width=lw // 2)
    return _finish(im, w, h, seed, border)

ICONS = {k[3:]: v for k, v in globals().items() if k.startswith("ic_")}

# ---------------------------------------------------------------- elements
def ease_settle(p):
    """Stop-motion ease with small overshoot then settle."""
    if p >= 1:
        return 1.0
    if p < 0.7:
        q = p / 0.7
        return 1.06 * (1 - (1 - q) ** 3)
    q = (p - 0.7) / 0.3
    return 1.06 - 0.06 * q

class El:
    """A cut-paper piece placed at (cx, cy) which arrives at time t."""
    def __init__(self, img, cx, cy, t=0.0, anim="slide", frm=None, dur=0.32, rot=0.0, sfx=None, z=0, shadow=True, dist=None):
        self.raw = img
        self.rot = rot
        self.img = shadowed(img, rot) if shadow else (img.rotate(rot, Image.BICUBIC, expand=True) if rot else img)
        self.cx, self.cy = cx, cy
        self.t, self.anim, self.dur = t, anim, dur
        if anim == "stamp":
            self.dur = 0.22
        if anim == "pop":
            self.dur = 0.2
        self.frm = frm or random.Random(int(cx * 7 + cy)).choice(["left", "right", "top", "bottom"])
        self.dist = dist
        self.sfx = sfx or {"slide": "slide", "drop": "tap", "stamp": "stamp", "pop": "pin", "cut": "tap"}.get(anim, "slide")
        self._scaled = {}

    def done(self, t):
        return t >= self.t + self.dur

    def _scale(self, s):
        k = round(s, 2)
        if k not in self._scaled:
            im = self.img
            self._scaled[k] = im.resize((max(1, int(im.width * k)), max(1, int(im.height * k))), Image.BICUBIC)
        return self._scaled[k]

    def state(self, t):
        if t < self.t:
            return None
        p = min(1.0, (t - self.t) / self.dur)
        im = self.img
        dx = dy = 0.0
        if self.anim in ("slide", "drop"):
            e = ease_settle(p)
            D = self.dist or (380 if self.anim == "slide" else 140)
            vx, vy = {"left": (-1, 0), "right": (1, 0), "top": (0, -1), "bottom": (0, 1)}[self.frm if self.anim == "slide" else "top"]
            dx, dy = vx * D * (1 - e), vy * D * (1 - e)
        elif self.anim in ("stamp", "pop"):
            if p < 1:
                seq = [1.45, 1.2, 0.96, 1.0] if self.anim == "stamp" else [0.4, 0.8, 1.1, 1.0]
                s = seq[min(len(seq) - 1, int(p * len(seq)))]
                im = self._scale(s)
        elif self.anim == "cut":
            pass
        x = int(round(self.cx + dx - im.width / 2))
        y = int(round(self.cy + dy - im.height / 2))
        return im, x, y

    def draw(self, frame, t):
        st = self.state(t)
        if st:
            im, x, y = st
            frame.paste(im, (x, y), im)

class Thread(El):
    """Red thread drawn between pins."""
    def __init__(self, pts, t=0.0, dur=0.45, color=RED, width=5, pins=True, sfx="thread"):
        self.pts, self.t, self.dur, self.color, self.width, self.pins = pts, t, dur, color, width, pins
        self.sfx = sfx
        self.anim = "draw"

    def draw(self, frame, t):
        if t < self.t:
            return
        p = min(1.0, (t - self.t) / self.dur)
        segs = list(zip(self.pts[:-1], self.pts[1:]))
        total = sum(math.dist(a, b) for a, b in segs)
        left = total * p
        d = ImageDraw.Draw(frame)
        out = [self.pts[0]]
        for a, b in segs:
            L = math.dist(a, b)
            if left >= L:
                out.append(b)
                left -= L
            else:
                f = left / L if L else 0
                out.append((a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f))
                break
        sh = [(x + 3, y + 4) for x, y in out]
        d.line(sh, fill=(150, 135, 110), width=self.width)
        d.line(out, fill=self.color, width=self.width, joint="curve")
        if self.pins:
            for q in (self.pts[0],) + ((self.pts[-1],) if p >= 1 else ()):
                d.ellipse([q[0] - 11, q[1] - 11 + 3, q[0] + 11, q[1] + 11 + 3], fill=(120, 105, 85))
                d.ellipse([q[0] - 11, q[1] - 11, q[0] + 11, q[1] + 11], fill=(186, 150, 60), outline=INK, width=2)
                d.ellipse([q[0] - 4, q[1] - 6, q[0] + 2, q[1] - 1], fill=(240, 220, 150))

class Marker(Thread):
    """Hand drawn marker stroke: underline, circle or arrow."""
    def __init__(self, kind, box, t=0.0, dur=0.4, color=RED, width=9):
        x0, y0, x1, y1 = box
        if kind == "underline":
            pts = [(x0, y0), ((x0 + x1) / 2, y0 + 5), (x1, y0 - 3)]
        elif kind == "circle":
            cx, cy, rx, ry = (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2, (y1 - y0) / 2
            pts = [(cx + rx * math.cos(a) * (1 + 0.04 * math.sin(3 * a)), cy + ry * math.sin(a)) for a in np.linspace(-2.6, 2.6 + 2 * math.pi * 0.95, 40)]
        elif kind == "cross":
            pts = [(x0, y0), (x1, y1)]
        else:  # arrow from (x0,y0) to (x1,y1)
            L = math.hypot(x1 - x0, y1 - y0)
            nx, ny = (y1 - y0) / L, -(x1 - x0) / L
            if ny > 0:
                nx, ny = -nx, -ny
            c = ((x0 + x1) / 2 + nx * L * 0.12, (y0 + y1) / 2 + ny * L * 0.12)
            pts = [((1 - u) ** 2 * x0 + 2 * (1 - u) * u * c[0] + u * u * x1, (1 - u) ** 2 * y0 + 2 * (1 - u) * u * c[1] + u * u * y1) for u in np.linspace(0, 1, 24)]
            ang = math.atan2(y1 - pts[-3][1], x1 - pts[-3][0])
            hx, hy = x1 - 34 * math.cos(ang - 0.45), y1 - 34 * math.sin(ang - 0.45)
            gx, gy = x1 - 34 * math.cos(ang + 0.45), y1 - 34 * math.sin(ang + 0.45)
            pts = pts + [(hx, hy), (x1, y1), (gx, gy)]
        super().__init__(pts, t, dur, color, width, pins=False, sfx="marker")

class Counter(El):
    """Number that counts up during the build, then holds."""
    def __init__(self, cx, cy, v0, v1, t, dur, fmt, size=150, color=RED):
        self.cx, self.cy, self.v0, self.v1, self.t, self.dur, self.fmt = cx, cy, v0, v1, t, dur, fmt
        self.size, self.color, self.anim, self.sfx = size, color, "count", "tick"
        self._cache = {}

    def _img(self, v):
        if v not in self._cache:
            self._cache[v] = shadowed(big_text(self.fmt.format(v), self.size, self.color, seed=3, border=8), 0)
        return self._cache[v]

    def draw(self, frame, t):
        if t < self.t:
            return
        p = min(1.0, (t - self.t) / self.dur)
        v = self.v0 + (self.v1 - self.v0) * (1 - (1 - p) ** 2)
        step = max(1, (self.v1 - self.v0) // 12)
        v = int(round(v / step) * step) if p < 1 else self.v1
        im = self._img(v)
        frame.paste(im, (int(self.cx - im.width / 2), int(self.cy - im.height / 2)), im)

# ---------------------------------------------------------------- scene render
class Scene:
    def __init__(self, bg="news", els=None):
        self.bg = bg
        self.els = els or []

    def add(self, *e):
        self.els.extend(e)
        return e[0] if len(e) == 1 else e

def render_scene(scene, duration, build_end=None):
    """Yield RGB frames (PIL Images) for one beat, plus sfx event list."""
    n = int(round(duration * FPS))
    bg = background(scene.bg, getattr(scene, "variant", 0))
    els = scene.els
    # scale the build so it ends by ~62% of the beat (and never later than 2.6 s)
    last = max([e.t + e.dur for e in els] + [0.01])
    target = min(2.6, duration * 0.62) if build_end is None else build_end
    k = min(1.0, target / last) if last > target else 1.0
    for e in els:
        e.t *= k
        if e.anim in ("draw", "count"):
            e.dur = max(0.25, e.dur * max(k, 0.7))
    events = [(e.t + (e.dur if e.anim in ("slide", "drop") else 0.0), e.sfx) for e in els if e.anim != "cut" and e.sfx]
    base = bg.copy()
    settled = 0
    frames = []
    last_key = None
    last_img = None
    for i in range(n):
        t = (i // STEP) * STEP / FPS
        while settled < len(els) and els[settled].done(t):
            els[settled].draw(base, 10 ** 6)
            settled += 1
        key = (t,) if settled < len(els) else ("done",)
        if key == last_key:
            frames.append(last_img)
            continue
        if settled == len(els):
            img = base
        else:
            img = base.copy()
            for e in els[settled:]:
                e.draw(img, t)
        last_key, last_img = key, img
        frames.append(img)
    return frames, events

# grain shimmer overlays (living poster)
@functools.lru_cache(maxsize=1)
def shimmer_layers():
    rng = np.random.default_rng(11)
    out = []
    for i in range(3):
        g = rng.normal(0, 1, (H // 2, W // 2)).astype(np.float32)
        g = np.asarray(Image.fromarray(np.clip(g * 40 + 128, 0, 255).astype(np.uint8)).resize((W, H), Image.BILINEAR), np.float32)
        out.append(((g - 128) / 128 * 4.0).astype(np.float32))
    return out

FLICKER = np.random.default_rng(5).normal(0, 1, 4000)

def finalize(img, i, beat=0):
    """Paper grain shimmer + a faint stop-motion light flicker (changes on twos)."""
    a = np.asarray(img, np.float32)
    f = 1.0 + 0.012 * FLICKER[(beat * 97 + i // 2) % 4000]
    a = a * f + shimmer_layers()[(i // 3) % 3][..., None]
    return np.clip(a, 0, 255).astype(np.uint8)
