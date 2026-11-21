"""YouTube thumbnails (1280x720) in the video's paper-collage style.

python3 thumb.py   -> out/thumbnail_A.png, _B.png, _C.png
"""
import os, sys, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageChops
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

TW, TH = 1280, 720
OUT = os.path.join(ROOT, "out")

def bg(kind="dark", variant=0, tint=None, dark=1.0):
    im = background(kind, variant).resize((TW, TH), Image.LANCZOS).convert("RGB")
    if tint:
        a = np.asarray(im, np.float32) / 255
        lum = a.mean(axis=2, keepdims=True)
        im = Image.fromarray(np.clip(lum * np.array(tint, np.float32) * 255 * 1.1 * dark, 0, 255).astype(np.uint8))
    return im.convert("RGBA")

def photo(name, w, crop=None, sat=1.35, contrast=1.15, border=12, seed=1):
    im = Image.open(os.path.join(ASSETS, "photos", name)).convert("RGB")
    if crop:
        x0, y0, x1, y1 = crop
        im = im.crop((int(x0 * im.width), int(y0 * im.height), int(x1 * im.width), int(y1 * im.height)))
    im = im.resize((w, int(im.height * w / im.width)), Image.LANCZOS)
    im = ImageEnhance.Color(im).enhance(sat)
    im = ImageEnhance.Contrast(im).enhance(contrast)
    card = Image.new("RGBA", (im.width + 2 * border, im.height + 2 * border), WHITE + (255,))
    card = texture(card, 1.2, seed)
    card.paste(im, (border, border))
    return scissor(card, seed)

def torn_split(img, seed=3, frac=0.55):
    """Tear a piece in two along a jagged vertical line."""
    w, h = img.size
    r = random.Random(seed)
    tear = [(w * frac + r.uniform(-28, 28), y) for y in np.linspace(0, h, 22)]
    m = Image.new("L", img.size, 0)
    ImageDraw.Draw(m).polygon([(0, 0)] + tear + [(0, h)], fill=255)
    m = rough_alpha(m, 1.2, 2.2, seed, torn=True)
    a = img.getchannel("A")
    L_, R_ = img.copy(), img.copy()
    L_.putalpha(ImageChops.multiply(a, m))
    R_.putalpha(ImageChops.multiply(a, ImageChops.invert(m)))
    # white paper fibre along the torn edges
    for part, mm in ((L_, m), (R_, ImageChops.invert(m))):
        er = mm.filter(ImageFilter.MinFilter(7))
        ring = ImageChops.subtract(mm, er)
        white = Image.new("RGBA", img.size, (250, 247, 240, 255))
        white.putalpha(ImageChops.multiply(ring, a))
        part.alpha_composite(white)
    return L_, R_

def put(canvas, piece, cx, cy, rot=0, shadow=True, off=(10, 14), blur=12, op=0.55):
    p = shadowed(piece, rot, off=off, blur=blur, opacity=op) if shadow else piece.rotate(rot, Image.BICUBIC, expand=True)
    canvas.alpha_composite(p, (int(cx - p.width / 2), int(cy - p.height / 2))) if cx - p.width / 2 >= 0 and cy - p.height / 2 >= 0 else canvas.paste(p, (int(cx - p.width / 2), int(cy - p.height / 2)), p)
    return p

def bold_text(text, size, fill=(255, 214, 0), stroke=INK, sw=None, font_name="display", squeeze=1.0):
    f = font(font_name, size)
    sw = sw or max(6, size // 11)
    tw, th, b = text_size(f, text)
    im = Image.new("RGBA", (tw + sw * 2 + 20, th + sw * 2 + 20), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.text((10 + sw - b[0], 10 + sw - b[1]), text, font=f, fill=fill + (255,), stroke_width=sw, stroke_fill=stroke + (255,))
    if squeeze != 1.0:
        im = im.resize((int(im.width * squeeze), im.height), Image.LANCZOS)
    return im

def cutout_text(text, size, fill, paper=WHITE, border=10, seed=0, fn="display"):
    """Bold letters with a white cut-paper border (reads at tiny sizes)."""
    t = bold_text(text, size, fill=fill, stroke=fill, sw=1, font_name=fn)
    return add_border(t, border, paper, seed)

def vignette(canvas, strength=0.45):
    a = np.asarray(canvas, np.float32)
    yy, xx = np.mgrid[0:TH, 0:TW].astype(np.float32)
    v = ((xx - TW / 2) / (TW * 0.6)) ** 2 + ((yy - TH / 2) / (TH * 0.6)) ** 2
    a[..., :3] *= (1 - np.clip(v - 0.35, 0, 1) * strength)[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGBA")

def glow(canvas, piece, cx, cy, color=(255, 210, 60), radius=40, op=0.8):
    pad = radius * 3
    al = Image.new("L", (piece.width + 2 * pad, piece.height + 2 * pad), 0)
    al.paste(piece.getchannel("A"), (pad, pad))
    al = al.filter(ImageFilter.GaussianBlur(radius)).point(lambda v: int(min(255, v * op * 1.6)))
    g = Image.new("RGBA", al.size, color + (0,))
    g.putalpha(al)
    x, y = int(cx - g.width / 2), int(cy - g.height / 2)
    canvas.paste(g, (x, y), g) if x < 0 or y < 0 else canvas.alpha_composite(g, (x, y))

# ------------------------------------------------------------------ concepts
def concept_A():
    """'THEY SAID NO' - torn store photo + Netflix mailer + $50M tag."""
    c = bg("dark", 1)
    c = vignette(c, 0.6)
    store = photo("closing_b.jpg", 760, crop=(0.0, 0.0, 1.0, 0.75), seed=4)
    L_, R_ = torn_split(store, seed=5, frac=0.5)
    put(c, L_, 330, 430, rot=-4)
    put(c, R_, 640, 470, rot=9)
    env = icon("envelope", 360, seed=2, label="NETFLIX", border=10)
    glow(c, shadowed(env, 8), 1060, 470, color=(255, 60, 40), radius=45, op=0.9)
    put(c, env, 1060, 470, rot=8)
    tag = icon("tag", 360, seed=3, text="$50 MILLION", border=10)
    put(c, tag, 1010, 640, rot=-10)
    t = bold_text("THEY SAID NO", 200, fill=(255, 214, 0), sw=16)
    put(c, t, 560, 125, rot=-3, off=(10, 14), blur=10, op=0.8)
    st = stamp("DECLINED", 70, RED, seed=9)
    put(c, st, 1090, 290, rot=14, shadow=False)
    return c

def concept_B():
    """'9,000 > 1' - from empire to a single store."""
    c = bg("news", 2, tint=(1.0, 0.86, 0.35), dark=0.98)
    c = vignette(c, 0.5)
    m, pr = map_piece("us", 820, fill=(225, 214, 190), seed=3)
    put(c, m, 760, 470, rot=-2)
    ox, oy = 760 - m.width / 2, 470 - m.height / 2
    rng = np.random.default_rng(5)
    a = np.asarray(m.getchannel("A"))
    ys, xs = np.nonzero(a > 250)
    for k in rng.choice(len(xs), 60, replace=False):
        d = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
        ImageDraw.Draw(d).ellipse([2, 2, 13, 13], fill=(90, 86, 80, 255))
        c.alpha_composite(d, (int(ox + xs[k] - 8), int(oy + ys[k] - 8)))
        ImageDraw.Draw(c).line([(ox + xs[k] - 8, oy + ys[k] - 8), (ox + xs[k] + 8, oy + ys[k] + 8)], fill=INK + (255,), width=3)
    bx, by = pr(-121.31, 44.06)
    pin = Image.new("RGBA", (70, 70), (0, 0, 0, 0))
    ImageDraw.Draw(pin).ellipse([5, 5, 64, 64], fill=WHITE + (255,))
    ImageDraw.Draw(pin).ellipse([13, 13, 56, 56], fill=RED + (255,))
    glow(c, pin, ox + bx, oy + by, color=(255, 40, 30), radius=30, op=1.0)
    put(c, pin, ox + bx, oy + by, shadow=True)
    big = bold_text("9,000", 230, fill=WHITE, sw=16)
    put(c, big, 300, 170, rot=-4)
    one = bold_text("1", 330, fill=(255, 40, 30), sw=18)
    put(c, one, 1120, 330, rot=5)
    arr = icon("arrow", 260, seed=1, border=8)
    put(c, arr, 690, 140, rot=-8)
    s = cutout_text("STORE LEFT", 64, INK, seed=2)
    put(c, s, 1100, 560, rot=3)
    return c

def concept_C():
    """'THE $50M MISTAKE' - giant ticket ripped in half."""
    c = bg("tan", 0, tint=(0.95, 0.15, 0.1), dark=0.92)
    c = vignette(c, 0.55)
    tk = icon("ticket", 820, seed=4, border=14)
    L_, R_ = torn_split(tk, seed=7, frac=0.52)
    put(c, L_, 520, 430, rot=-8)
    put(c, R_, 790, 400, rot=10)
    t1 = bold_text("THE $50M", 150, fill=WHITE, sw=12)
    put(c, t1, 560, 100, rot=-2)
    t2 = bold_text("MISTAKE", 190, fill=(255, 214, 0), sw=14)
    put(c, t2, 640, 640, rot=2)
    env = icon("envelope", 250, seed=2, label="NETFLIX", border=8)
    put(c, env, 1120, 170, rot=12)
    return c

def concept_HERO():
    """Main thumbnail: giant 'NO', glowing Netflix mailer, $50M tag, torn storefront."""
    c = bg("dark", 2)
    store = photo("closing_b.jpg", 980, crop=(0.05, 0.0, 1.0, 0.8), sat=1.5, contrast=1.2, seed=6)
    _, R_ = torn_split(store, seed=11, frac=0.18)
    R_ = Image.fromarray((np.asarray(R_, np.float32) * np.array([0.72, 0.72, 0.72, 1.0])).astype(np.uint8), "RGBA")
    put(c, R_, 820, 340, rot=4, op=0.7)
    c = vignette(c, 0.55)
    # Netflix mailer with a hot red glow
    env = icon("envelope", 430, seed=2, label="NETFLIX", border=12)
    envr = env.rotate(8, Image.BICUBIC, expand=True)
    glow(c, envr, 960, 400, color=(255, 50, 30), radius=55, op=1.0)
    put(c, env, 960, 400, rot=8)
    # price tag tied on with red thread
    tag = icon("tag", 360, seed=3, text="$50 MILLION", border=12)
    d = ImageDraw.Draw(c)
    d.line([(1010, 470), (1030, 560), (980, 600)], fill=(150, 20, 15, 255), width=9)
    d.line([(1006, 466), (1026, 556), (976, 596)], fill=RED + (255,), width=7)
    put(c, tag, 1060, 620, rot=-12)
    # headline: small kicker + giant NO
    k = bold_text("BLOCKBUSTER SAID", 92, fill=WHITE, sw=10)
    put(c, k, 395, 105, rot=-3, op=0.85)
    no = bold_text("NO", 430, fill=(255, 214, 0), sw=22)
    glow(c, no, 330, 430, color=(255, 200, 0), radius=40, op=0.45)
    put(c, no, 330, 430, rot=-4, off=(14, 18), blur=14, op=0.85)
    # tiny paper slip to frame the stakes
    sl = slip("TO BUYING NETFLIX", 46, seed=4)
    put(c, sl, 330, 665, rot=-2)
    return c

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for name, fn in (("HERO", concept_HERO), ("B", concept_B), ("C", concept_C)):
        im = fn().convert("RGB")
        im.save(os.path.join(OUT, f"thumbnail_{name}.png"))
        print("saved", name)
