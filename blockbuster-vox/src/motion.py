"""Motion layer on top of the collage library.

- word-synced arrivals: a piece lands on the word it illustrates
- camera: slow push/drift with background/foreground parallax, optional punch-in
- stop-motion boil on landed pieces, drifting dust motes
- overlay banners (chapter titles) that ignore the camera
- transitions between beats (slide, whip, zoom, cut)
"""
import math, re, random, functools
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from lib import *

# ------------------------------------------------------------------ word sync
ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()
STOP = set("the a an of in to and it its was for on at by from with his her their that this what as or be is are were had has have did do just".split())

def num_first_words(tok):
    """First spoken word(s) for a numeral, matching how the script spells numbers."""
    t = tok.replace(",", "").replace("$", "").replace("~", "")
    m = re.match(r"^(\d+)(\.\d+)?s?$", t)
    if not m:
        return set()
    n = int(m.group(1))
    out = set()
    if 1900 <= n <= 1999:
        out.add("nineteen")
    elif 2000 <= n <= 2009:
        out.add("two")
    elif 2010 <= n <= 2099:
        out.add("twenty")
    elif n >= 1000:
        out.add(ONES[n // 1000] if n // 1000 < 20 else TENS[n // 10000])
    elif n >= 100:
        out.add(ONES[n // 100])
    elif n >= 20:
        out.add(TENS[n // 10])
    else:
        out.add(ONES[n])
    return out

def norm(w):
    return re.sub(r"[^a-z0-9']", "", w.lower()).rstrip("'s") if w else ""

def match_time(label, words):
    """Time of the first narration word that a label refers to (or None)."""
    if not label or not words:
        return None
    cands = set()
    for tok in re.split(r"[\s,/\-]+", label):
        if not tok:
            continue
        nf = num_first_words(tok)
        if nf:
            cands |= nf
            continue
        n = norm(tok)
        if len(n) >= 3 and n not in STOP:
            cands.add(n)
            if n.endswith("s"):
                cands.add(n[:-1])
    for w in words:
        n = norm(w["w"])
        if n in cands or (n.endswith("s") and n[:-1] in cands):
            return w["t"]
    return None

def sync(scene, words, duration):
    """Re-time scene pieces: matched labels land on their word, the rest spread
    over the spoken line in their authored order."""
    els = scene.els
    if not els:
        return
    sp0 = words[0]["t"] if words else 0.1
    sp1 = words[-1]["t"] + 0.3 if words else duration * 0.7
    span = max(0.8, min(sp1, duration - 0.6) - sp0)
    tmax = max([e.t for e in els] + [0.01])
    for e in els:
        lead = e.dur * 0.75 if e.anim in ("slide", "drop") else 0.04
        at = getattr(e, "at", None)
        mt = match_time(at, words) if at else match_time(getattr(e, "label", None), words)
        if e.t <= 0.001 and mt is None:
            e.t = 0.0  # establishing piece: already arriving as the beat opens
        elif mt is not None:
            e.t = max(0.0, mt - lead)
        else:
            e.t = max(0.0, sp0 - 0.15 + span * 0.85 * (e.t / tmax) - lead)
        if e.anim in ("draw", "count"):
            e.dur = max(0.3, min(e.dur, 0.6))

# ------------------------------------------------------------------ camera
def smooth(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)

class Camera:
    """Push-in / drift. Returns (zoom, cx, cy) for scene time t."""
    def __init__(self, duration, focus=(W / 2, H / 2), z0=1.0, z1=1.07, drift=(0, 0), punch=None, seed=0):
        self.d = duration
        self.focus, self.z0, self.z1, self.drift, self.punch = focus, z0, z1, drift, punch
        r = random.Random(seed)
        self.wob = (r.uniform(0, 6.28), r.uniform(0, 6.28))

    def at(self, t):
        u = t / max(self.d, 0.01)
        z = self.z0 + (self.z1 - self.z0) * smooth(u)
        fx = W / 2 + (self.focus[0] - W / 2) * 0.35 * smooth(u) + self.drift[0] * (u - 0.5)
        fy = H / 2 + (self.focus[1] - H / 2) * 0.35 * smooth(u) + self.drift[1] * (u - 0.5)
        # tiny handheld-free float so it never feels frozen
        fx += 3 * math.sin(t * 0.9 + self.wob[0])
        fy += 2 * math.sin(t * 0.7 + self.wob[1])
        if self.punch:
            px, py, pz, ps = self.punch
            k = smooth((u - ps) / max(0.05, (0.92 - ps)))
            z = z + (pz - z) * k
            fx = fx + (px - fx) * k
            fy = fy + (py - fy) * k
        return z, fx, fy

def view(img, z, cx, cy, resample=Image.BILINEAR):
    """Crop/scale so source point (cx, cy) sits at frame centre at zoom z."""
    hw, hh = W / (2 * z), H / (2 * z)
    cx = min(max(cx, hw), W - hw)
    cy = min(max(cy, hh), H - hh)
    a = 1 / z
    return img.transform((W, H), Image.AFFINE, (a, 0, cx - W / 2 * a, 0, a, cy - H / 2 * a), resample=resample)

# ------------------------------------------------------------------ extras
class Highlight(El):
    """Highlighter pen sweep over a line of a document."""
    def __init__(self, box, t, dur=0.45, color=MUSTARD, alpha=120):
        self.box, self.t, self.dur, self.color, self.alpha = box, t, dur, color, alpha
        self.anim, self.sfx, self.label = "draw", "marker", None

    def draw(self, frame, t):
        if t < self.t:
            return
        p = min(1.0, (t - self.t) / self.dur)
        x0, y0, x1, y1 = self.box
        xe = x0 + (x1 - x0) * p
        lay = Image.new("RGBA", (int(x1 - x0) + 4, int(y1 - y0) + 4), (0, 0, 0, 0))
        d = ImageDraw.Draw(lay)
        d.rectangle([0, 2, int(xe - x0), int(y1 - y0)], fill=self.color + (self.alpha,))
        frame.paste(lay, (int(x0), int(y0)), lay)

class Banner:
    """Chapter title strip that slides in, holds, slides out (drawn over the camera)."""
    def __init__(self, kicker, title, t_in=0.15, t_out=2.7):
        f1, f2 = font("label", 34), font("display", 92)
        w = max(text_size(f1, kicker)[0], text_size(f2, title)[0]) + 120
        h = 190
        im = Image.new("RGBA", (w, h), INK + (255,))
        d = ImageDraw.Draw(im)
        d.text((60, 22), kicker, font=f1, fill=MUSTARD)
        d.text((56, 66), title, font=f2, fill=WHITE)
        d.rectangle([0, h - 12, w, h], fill=RED)
        im = texture(im, 1.5, 4)
        a = Image.new("L", im.size, 0)
        ImageDraw.Draw(a).rectangle([4, 4, w - 4, h - 4], fill=255)
        im.putalpha(rough_alpha(a, 2.5, 3, 7, torn=True))
        self.img = shadowed(im, -1.5)
        self.t_in, self.t_out = t_in, t_out

    def draw(self, frame, t):
        if t < self.t_in or t > self.t_out + 0.4:
            return
        x_end = 70
        if t < self.t_in + 0.35:
            p = ease_settle((t - self.t_in) / 0.35)
            x = -self.img.width + (x_end + self.img.width) * p
        elif t > self.t_out:
            p = smooth((t - self.t_out) / 0.35)
            x = x_end - (self.img.width + x_end + 40) * p
        else:
            x = x_end
        frame.paste(self.img, (int(x), 60), self.img)

@functools.lru_cache(maxsize=1)
def mote_sprite():
    s = 16
    im = Image.new("L", (s, s), 0)
    ImageDraw.Draw(im).ellipse([5, 5, 11, 11], fill=255)
    return im.filter(ImageFilter.GaussianBlur(2.2))

def dust_field(seed, n=26):
    r = np.random.default_rng(seed)
    return [(r.random() * W, r.random() * H, r.uniform(-9, 9), r.uniform(-14, -3), r.uniform(0.5, 1.6), r.uniform(0, 6.28)) for _ in range(n)]

def draw_dust(arr, field, t):
    sp = np.asarray(mote_sprite(), np.float32) / 255
    for (x, y, vx, vy, sc, ph) in field:
        px = (x + vx * t + 6 * math.sin(t * 0.8 + ph)) % W
        py = (y + vy * t) % H
        a = 0.10 * sc * (0.6 + 0.4 * math.sin(t * 1.3 + ph))
        xi, yi = int(px), int(py)
        if 0 <= xi < W - 16 and 0 <= yi < H - 16:
            arr[yi:yi + 16, xi:xi + 16] += sp[..., None] * 255 * a


def ac(dst, im, x, y):
    """alpha_composite that tolerates pieces partly off-canvas."""
    x0, y0 = max(0, -x), max(0, -y)
    x1, y1 = min(im.width, W - x), min(im.height, H - y)
    if x1 <= x0 or y1 <= y0:
        return
    sub = im if (x0, y0, x1, y1) == (0, 0, im.width, im.height) else im.crop((x0, y0, x1, y1))
    dst.alpha_composite(sub, (x + x0, y + y0))

def draw_el(e, img, t, off=(0, 0)):
    if isinstance(e, Counter):
        if t < e.t:
            return
        p = min(1.0, (t - e.t) / e.dur)
        v = e.v0 + (e.v1 - e.v0) * (1 - (1 - p) ** 2)
        step = max(1, (e.v1 - e.v0) // 12)
        v = int(round(v / step) * step) if p < 1 else e.v1
        im = e._img(v)
        ac(img, im, int(e.cx - im.width / 2), int(e.cy - im.height / 2))
    elif isinstance(e, Highlight):
        if t < e.t:
            return
        p = min(1.0, (t - e.t) / e.dur)
        x0, y0, x1, y1 = e.box
        w = int((x1 - x0) * p)
        if w > 0:
            lay = Image.new("RGBA", (w, int(y1 - y0)), e.color + (e.alpha,))
            ac(img, lay, int(x0), int(y0))
    elif isinstance(e, Thread):
        e.draw(img, t)
    else:
        st = e.state(t)
        if st:
            im, x, y = st
            ac(img, im, x + off[0], y + off[1])

# ------------------------------------------------------------------ beat render
def compose(scene, duration, words, cam, beat=0):
    """Generator of final RGB uint8 frames for one beat, plus sfx events."""
    sync(scene, words, duration)
    els = scene.els
    n = int(round(duration * FPS))
    bg = background(scene.bg, getattr(scene, "variant", 0))
    events = [(e.t + (e.dur if e.anim in ("slide", "drop") else 0.0), e.sfx) for e in els if e.anim != "cut" and e.sfx]
    for o in getattr(scene, "overlay", []):
        events.append((o.t_in + 0.2, "whoosh"))
        events.append((o.t_out + 0.1, "slide"))
    rb = random.Random(beat)
    boil = [[(rb.uniform(-1.4, 1.4), rb.uniform(-1.4, 1.4)) for _ in els] for _ in range(3)]
    bases = [Image.new("RGBA", (W, H), (0, 0, 0, 0)) for _ in range(3)]
    settled = 0
    field = dust_field(beat)

    def gen():
        nonlocal settled
        fg_cache = {}
        for i in range(n):
            ts = (i // STEP) * STEP / FPS  # pieces move on twos
            tc = i / FPS                   # camera moves every frame
            while settled < len(els) and els[settled].done(ts):
                e = els[settled]
                for v in range(3):
                    dx, dy = boil[v][settled]
                    draw_el(e, bases[v], 10 ** 6, (int(round(dx)), int(round(dy))))
                settled += 1
                fg_cache.clear()
            v = (i // 4) % 3
            key = (ts, v) if settled < len(els) else ("done", v)
            fg = fg_cache.get(key)
            if fg is None:
                fg = bases[v].copy() if settled < len(els) else bases[v]
                if settled < len(els):
                    for e in els[settled:]:
                        draw_el(e, fg, ts)
                fg_cache.clear()
                fg_cache[key] = fg
            z, cx, cy = cam.at(tc)
            zb = 1 + (z - 1) * 0.45
            bxx = W / 2 + (cx - W / 2) * 0.45
            byy = H / 2 + (cy - H / 2) * 0.45
            frame = view(bg, max(1.0, zb * 1.02), bxx, byy).convert("RGBA")
            frame.alpha_composite(view(fg, z, cx, cy))
            for o in getattr(scene, "overlay", []):
                o.draw(frame, tc)
            a = np.asarray(frame.convert("RGB"), np.float32)
            draw_dust(a, field, tc)
            yield finalize(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), i, beat)
    return gen(), events, n

def last_frame(scene, duration, words, cam, beat=0):
    """Final frame of a beat (for the next beat's transition)."""
    sync(scene, words, duration)
    bg = background(scene.bg, getattr(scene, "variant", 0))
    fg = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for e in scene.els:
        draw_el(e, fg, 10 ** 6)
    tc = (int(round(duration * FPS)) - 1) / FPS
    z, cx, cy = cam.at(tc)
    zb = 1 + (z - 1) * 0.45
    frame = view(bg, max(1.0, zb * 1.02), W / 2 + (cx - W / 2) * 0.45, H / 2 + (cy - H / 2) * 0.45).convert("RGBA")
    frame.alpha_composite(view(fg, z, cx, cy))
    return np.asarray(frame.convert("RGB"), np.uint8)

def hblur(a, k):
    """Cheap horizontal motion blur."""
    if k < 2:
        return a
    im = Image.fromarray(a)
    small = im.resize((max(8, W // k), H), Image.BILINEAR)
    return np.asarray(small.resize((W, H), Image.BILINEAR))

def transition(kind, prev, cur, p):
    """Blend previous beat's last frame into the current frame; p in [0,1]."""
    if kind == "slide":
        e = smooth(p)
        off = int(W * (1 - e))
        out = np.empty_like(cur)
        sh = int(W * 0.3 * e)
        out[:, :W - sh] = prev[:, sh:]
        out[:, W - sh:] = prev[:, :sh] if sh else out[:, W - sh:]
        out[:, off:] = cur[:, :W - off]
        if 0 < off < W - 30:
            g = np.linspace(0.55, 1.0, 30)[None, :, None]
            out[:, max(0, off - 30):off] = (out[:, max(0, off - 30):off] * g[:, -min(30, off):]).astype(np.uint8)
        return out
    if kind == "whip":
        e = smooth(p)
        k = int(2 + 40 * math.sin(p * math.pi))
        if p < 0.5:
            sh = int(W * 0.5 * e * 2) % W
            a = np.roll(prev, -sh, axis=1)
        else:
            sh = int(W * 0.5 * (1 - e) * 2) % W
            a = np.roll(cur, sh, axis=1)
        return hblur(a, k)
    if kind == "zoom":
        e = smooth(p)
        z = 1 + 0.6 * e
        a = np.asarray(Image.fromarray(prev).resize((int(W * z), int(H * z)), Image.BILINEAR))
        y0, x0 = (a.shape[0] - H) // 2, (a.shape[1] - W) // 2
        a = a[y0:y0 + H, x0:x0 + W].astype(np.float32)
        zc = 0.9 + 0.1 * e
        c = np.asarray(Image.fromarray(cur).resize((int(W * zc), int(H * zc)), Image.BILINEAR))
        cc = np.zeros_like(cur)
        yo, xo = (H - c.shape[0]) // 2, (W - c.shape[1]) // 2
        cc[:] = (cur * 0.0).astype(np.uint8)
        cc[yo:yo + c.shape[0], xo:xo + c.shape[1]] = c
        return np.clip(a * (1 - e) + cc.astype(np.float32) * e, 0, 255).astype(np.uint8)
    return cur
