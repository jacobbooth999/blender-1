"""One collage scene per narration beat (B001..B078)."""
import random
import numpy as np
from PIL import Image, ImageDraw
from lib import *

CX, CY = W // 2, H // 2

# ------------------------------------------------------------- helpers
def P(sc, name, w, cx, cy, t, frm="left", rot=0, crop=None, mode="ht", anim="slide", cell=5.5, seed=None, contrast=1.25):
    s = seed if seed is not None else (hash(name) + int(cx)) % 997
    return sc.add(El(photo_piece(name, w, crop, cell=cell, seed=s, mode=mode, contrast=contrast), cx, cy, t, anim, frm, rot=rot))

def _L(el, label):
    el.label = label
    return el

def I(sc, name, w, cx, cy, t, anim="drop", rot=0, frm=None, seed=None, dist=None, **kw):
    s = seed if seed is not None else int(cx + cy) % 991
    lab = kw.get("label") or kw.get("text") or kw.get("title") or {"vhs": "tape", "dvd": "DVD", "envelope": "mail", "money": "dollars",
          "calendar": "dates", "truck": "waste", "dish": "satellite", "gavel": "auction", "scissors": "cut", "kiosk": "kiosks",
          "plane": "flew", "table": "meetings", "warning": "warning", "family": "families", "clock": "hours", "shelf": "selection",
          "store": "stores", "building": "Viacom", "magnifier": "reports", "ring": "rescue", "chair": "left", "box": "left",
          "book": "account", "ticket": "Blockbuster", "check": "answer", "scale": "past", "coin": "dollar", "qmark": "?"}.get(name)
    return _L(sc.add(El(icon(name, w, seed=s, **kw), cx, cy, t, anim, frm, rot=rot, dist=dist)), lab)

def S(sc, text, cx, cy, t, size=44, rot=0, frm="bottom", bg=WHITE, fg=INK, anim="slide"):
    return _L(sc.add(El(slip(text, size, bg=bg, fg=fg, seed=len(text) + int(cx) % 50), cx, cy, t, anim, frm, rot=rot, sfx="slide")), text)

def HL(sc, text, cx, cy, t, size=90, rot=0, frm="top", bg=NEWS, fg=INK, anim="slide"):
    return _L(sc.add(El(headline(text, size, bg=bg, fg=fg, seed=len(text)), cx, cy, t, anim, frm, rot=rot)), text)

def ST(sc, text, cx, cy, t, size=62, rot=-8, color=RED, box=True):
    return _L(sc.add(El(stamp(text, size, color, seed=len(text) * 3, box=box), cx, cy, t, "stamp", rot=rot, shadow=False)), text)

def BT(sc, text, cx, cy, t, size=180, color=RED, rot=0, anim="stamp", frm=None):
    return _L(sc.add(El(big_text(text, size, color, seed=len(text)), cx, cy, t, anim, frm, rot=rot)), text)

def TP(sc, cx, cy, t, rot=0, L=170):
    return sc.add(El(tape(L, 50, seed=int(cx) % 31), cx, cy, t, "drop", rot=rot, shadow=False, sfx="tape", dist=60))

def MK(sc, kind, box, t, **kw):
    return sc.add(Marker(kind, box, t, **kw))

def TH(sc, pts, t, **kw):
    return sc.add(Thread(pts, t, **kw))

def DOC(sc, w, cx, cy, t, title="", rot=0, frm="bottom", lines=9, seal=False, anim="slide", bg=WHITE):
    return sc.add(El(ic_document(w, seed=int(cx) % 97, title=title, lines=lines, seal=seal, bg=bg), cx, cy, t, anim, frm, rot=rot))

def dossier_piece(name, role, w=520, seed=0):
    h = int(w * 1.2)
    S = 2
    im = Image.new("RGBA", (w * S, h * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    W_, H_ = w * S, h * S
    kraft = (205, 172, 118)
    d.rounded_rectangle([W_ * .06, 0, W_ * .42, H_ * .1], radius=10 * S, fill=kraft + (255,))
    d.rectangle([0, H_ * .06, W_, H_], fill=kraft + (255,))
    d.rectangle([W_ * .06, H_ * .1, W_ * .94, H_ * .96], fill=WHITE + (255,))
    ft = font("label", int(W_ * .05))
    d.text((W_ * .1, H_ * .015), "CASE FILE", font=ft, fill=INK + (255,))
    # photo slot with a faceless figure
    x0, y0, x1, y1 = W_ * .14, H_ * .15, W_ * .52, H_ * .52
    d.rectangle([x0, y0, x1, y1], fill=(150, 144, 132, 255), outline=INK + (255,), width=3 * S)
    sw, sh = int(x1 - x0) - 6 * S, int(y1 - y0) - 6 * S
    fig = ic_person(int(sw * 0.55 / S), border=0, tie=RED)
    fig = fig.resize((int(sw * 0.55), int(sw * 0.55 * fig.height / fig.width)))
    slot = Image.new("RGBA", (sw, sh), (150, 144, 132, 255))
    slot.alpha_composite(fig, (int(sw / 2 - fig.width / 2), int(sh * 0.16)))
    im.alpha_composite(slot, (int(x0) + 3 * S, int(y0) + 3 * S))
    fl = font("type", int(W_ * .045))
    fv = font("type", int(W_ * .06))
    y = H_ * .58
    for lab, val in (("SUBJECT", name), ("ROLE", role)):
        d.text((W_ * .14, y), lab + ":", font=fl, fill=GREY + (255,))
        tw = text_size(fv, val)[0]
        f2 = fv if tw < W_ * .72 else font("type", int(W_ * .06 * W_ * .72 / tw))
        d.text((W_ * .14, y + H_ * .04), val, font=f2, fill=INK + (255,))
        y += H_ * .14
    for k in range(3):
        d.line([(W_ * .58, H_ * (.2 + k * .07)), (W_ * .86, H_ * (.2 + k * .07))], fill=LGREY + (255,), width=3 * S)
    # paper clip
    d.rounded_rectangle([W_ * .38, H_ * .08, W_ * .46, H_ * .26], radius=12 * S, outline=(120, 120, 124, 255), width=4 * S)
    im = im.resize((w, h), Image.LANCZOS)
    im = texture(im, 1.3, seed)
    st = stamp("CONFIDENTIAL", int(w * .085), RED, seed=seed + 3).rotate(-12, Image.BICUBIC, expand=True)
    im.alpha_composite(st, (int(w * .48), int(h * .9) - st.height // 2))
    return scissor(im, seed)

def DOS(sc, name, role, cx, cy, t, w=520, rot=-2, frm="left"):
    return _L(sc.add(El(dossier_piece(name, role, w, seed=len(name)), cx, cy, t, "slide", frm, rot=rot)), name)

class MapRef:
    def __init__(self, el, pr):
        self.el, self.pr = el, pr
    def xy(self, lon, lat):
        x, y = self.pr(lon, lat)
        im = self.el.raw
        return (self.el.cx - im.width / 2 + x, self.el.cy - im.height / 2 + y)

def MAP(sc, region, w, cx, cy, t, anim="drop", fill=(214, 200, 168)):
    im, pr = map_piece(region, w, fill=fill, seed=w % 13)
    el = sc.add(El(im, cx, cy, t, anim))
    return MapRef(el, pr)

def dot_piece(r=13, color=RED):
    im = Image.new("RGBA", (r * 2 + 8, r * 2 + 8), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse([1, 1, r * 2 + 6, r * 2 + 6], fill=WHITE + (255,))
    d.ellipse([4, 4, r * 2 + 3, r * 2 + 3], fill=color + (255,))
    return im

def DOT(sc, x, y, t, r=12, color=RED):
    return sc.add(El(dot_piece(r, color), x, y, t, "pop", sfx="pin"))

def land_points(mref, n, seed, countries=None, margin=6):
    """Random points inside the land of a map element (optionally only some countries)."""
    rng = np.random.default_rng(seed)
    if countries:
        pr = mref.pr
        m = Image.new("L", mref.el.raw.size, 0)
        d = ImageDraw.Draw(m)
        for c in geo()["world"]:
            if c["name"] in countries:
                for p in c["polys"]:
                    pts = [pr(x, y) for x, y in p]
                    if len(pts) > 2:
                        d.polygon(pts, fill=255)
        a = np.asarray(m)
    else:
        a = np.asarray(mref.el.raw.getchannel("A"))
    a = a.copy()
    a[:margin * 2], a[-margin * 2:], a[:, :margin * 2], a[:, -margin * 2:] = 0, 0, 0, 0
    ys, xs = np.nonzero(a > 250)
    idx = rng.choice(len(xs), size=min(n, len(xs)), replace=False)
    im = mref.el.raw
    ox, oy = mref.el.cx - im.width / 2, mref.el.cy - im.height / 2
    return [(ox + xs[i], oy + ys[i]) for i in idx]

def TAPES(sc, x0, y0, cols, rows, w, t, gap=8, step=0.03, color_every=0):
    pcs = []
    k = 0
    for r in range(rows):
        for c in range(cols):
            col = MUSTARD if color_every and k % color_every == 0 else INK
            pcs.append(sc.add(El(ic_spine(w, seed=k, color=col), x0 + c * (w + gap), y0 + r * (w * 4.2 + gap * 2), t + k * step, "pop", sfx="tick" if k % 3 else "pin", shadow=False)))
            k += 1
    return pcs

# ------------------------------------------------------------- beats
def b001(sc):  # In October 1985 a new kind of video store
    sc.bg = "tan"
    I(sc, "vhs", 640, 820, 560, 0.0, rot=-4, label="")
    S(sc, "OCTOBER 1985", 840, 490, 0.5, size=60, rot=-4, frm="top")
    ST(sc, "NEW", 1340, 300, 1.0, size=80, rot=12)
    MK(sc, "underline", (580, 870, 1060, 870), 1.4)

def b002(sc):  # opened its doors in Dallas Texas. It was bright.
    m = MAP(sc, "texas", 620, 520, 560, 0.0)
    ph = P(sc, "grand_opening.jpg", 760, 1380, 470, 0.35, "right", rot=2.5)
    TP(sc, 1380, 470 - ph.raw.height / 2 + 6, 0.7, rot=-6)
    px, py = m.xy(-96.8, 32.78)
    TH(sc, [(px, py), (1050, 430)], 0.9)
    S(sc, "DALLAS, TEXAS", px - 40, py + 75, 1.25, size=44, rot=-2)

def b003(sc):  # It was huge. It carried thousands of tapes
    ph = P(sc, "interior_bw.jpg", 1180, 860, 500, 0.0, "left", rot=-1.5, cell=5)
    TP(sc, 330, 130, 0.4, rot=-30)
    TP(sc, 1400, 880, 0.5, rot=-25)
    HL(sc, "THOUSANDS OF TAPES", 1450, 160, 0.9, size=72, rot=2)
    MK(sc, "circle", (920, 270, 1440, 470), 1.4)

def b004(sc):  # when most rental shops had only a few hundred.
    sc.bg = "tan"
    TAPES(sc, 240, 420, 4, 1, 34, 0.0, step=0.05)
    S(sc, "A FEW HUNDRED", 330, 620, 0.4, size=40, rot=-2)
    TAPES(sc, 820, 270, 18, 3, 34, 0.5, step=0.012, color_every=7)
    S(sc, "THOUSANDS", 1270, 880, 1.4, size=50, rot=1.5)
    BT(sc, "VS", 640, 470, 1.0, size=120, color=INK)

def b005(sc):  # The store was called Blockbuster. Within two decades the name would
    I(sc, "ticket", 900, 900, 470, 0.0, rot=-3, border=14)
    P(sc, "store_sign.jpg", 420, 1550, 820, 0.7, "right", rot=6, crop=(0.6, 0.0, 1.0, 0.55))
    S(sc, "TWO DECADES", 420, 850, 1.2, size=48, rot=-3)

def b006(sc):  # become one of the most recognised brands in American retail.
    m = MAP(sc, "us", 1250, 960, 560, 0.0, fill=(204, 190, 158))
    ph = P(sc, "store_sign.jpg", 760, 980, 500, 0.4, "bottom", rot=-2, mode="color")
    TP(sc, 980, 500 - ph.raw.height / 2 + 6, 0.8, rot=4)
    HL(sc, "AMERICAN RETAIL", 1460, 900, 1.1, size=70, rot=-2, frm="right")

def b007(sc):  # And then it would almost completely disappear. To understand how
    sc.bg = "tan"
    ph = photo_piece("store_sign.jpg", 820, seed=21, mode="color")
    w, h = ph.size
    rng = random.Random(5)
    tear = [(w * 0.52 + rng.uniform(-25, 25), y) for y in np.linspace(0, h, 18)]
    mL = Image.new("L", ph.size, 0)
    ImageDraw.Draw(mL).polygon([(0, 0)] + tear + [(0, h)], fill=255)
    left = ph.copy(); left.putalpha(ImageChops.multiply(ph.getchannel("A"), mL))
    right = ph.copy(); right.putalpha(ImageChops.multiply(ph.getchannel("A"), ImageChops.invert(mL)))
    sc.add(El(left, 820, 520, 0.0, "drop"))
    sc.add(El(right, 1060, 610, 0.7, "slide", "top", rot=-14, dist=120, sfx="tear"))
    S(sc, "ALMOST GONE", 1440, 230, 1.2, size=52, rot=3, frm="right")

def b008(sc):  # that happened we have to go back to the man
    sc.bg = "news"
    line = Image.new("RGBA", (1500, 16), INK + (255,))
    sc.add(El(texture(line, 1.2, 1), CX, 600, 0.0, "slide", "left"))
    years = [1985, 1987, 1994, 2000, 2004, 2007, 2010]
    for i, y in enumerate(years):
        x = 270 + i * 230
        S(sc, str(y), x, 680, 0.15 + i * 0.08, size=38, frm="bottom", rot=random.Random(y).uniform(-3, 3))
        DOT(sc, x, 600, 0.15 + i * 0.08, r=10, color=INK)
    MK(sc, "arrow", (1650, 500, 560, 520), 1.0, width=11)
    MK(sc, "circle", (420, 620, 580, 740), 1.5)
    ST(sc, "REWIND", 1300, 330, 1.7, size=70, rot=-6)

def b009(sc):  # who built the empire. In 1987 businessman Wayne Huizenga
    sc.bg = "tan"
    HL(sc, "THE EMPIRE BUILDER", 1300, 300, 0.2, size=76, rot=2, frm="right")
    ST(sc, "1987", 1320, 620, 0.6, size=110, rot=7)
    DOS(sc, "WAYNE HUIZENGA", "BUSINESSMAN", 700, 560, 1.0)

def b010(sc):  # and his partners invested in the young company and took control.
    sc.bg = "board"
    DOC(sc, 560, 760, 540, 0.0, title="INVESTMENT AGREEMENT", rot=-2, seal=True, lines=11)
    I(sc, "money", 360, 1300, 420, 0.5, rot=6, frm="right")
    I(sc, "person", 120, 1230, 760, 0.8, anim="slide", frm="bottom")
    I(sc, "person", 120, 1370, 760, 0.9, anim="slide", frm="bottom")
    ST(sc, "CONTROL", 820, 760, 1.4, size=84, rot=-12)

def b011(sc):  # He had already built a national waste collection business.
    MAP(sc, "us", 1300, 960, 540, 0.0, fill=(214, 204, 178))
    I(sc, "truck", 760, 920, 600, 0.4, anim="slide", frm="left")
    S(sc, "WASTE COLLECTION", 960, 230, 1.0, size=56, rot=-2, frm="top")

def b012(sc):  # He knew how to grow fast. Under his leadership Blockbuster
    sc.bg = "tan"
    sc.add(El(ic_chart(900, seed=3, bars=[1, 2, 3, 5, 8, 13], color=INK), 860, 560, 0.0, "drop", rot=-1.5))
    MK(sc, "arrow", (520, 780, 1260, 300), 0.9, width=12)
    S(sc, "GROW FAST", 1500, 760, 1.3, size=56, rot=3, frm="right")

def b013(sc):  # opened stores at a pace the industry had never seen.
    m = MAP(sc, "us", 1400, 960, 560, 0.0)
    pts = land_points(m, 70, 13)
    pts.sort(key=lambda p: (p[0] - 1300) ** 2 + (p[1] - 650) ** 2)
    for i, (x, y) in enumerate(pts):
        DOT(sc, x, y, 0.3 + i * 0.022, r=9)
    S(sc, "NEW STORES", 1500, 140, 1.9, size=52, rot=2, frm="top")

def b014(sc):  # The formula was simple. Big stores. Wide selection. Long opening hours.
    sc.bg = "board"
    HL(sc, "THE FORMULA", 960, 170, 0.0, size=84, rot=-1)
    for i, (ic, lab, kw) in enumerate([("store", "BIG STORES", {"sign": ""}), ("shelf", "WIDE SELECTION", {}), ("clock", "LONG HOURS", {})]):
        x = 380 + i * 580
        I(sc, ic, 380 if ic != "clock" else 300, x, 470, 0.2 + i * 0.6, anim="drop", rot=(-3, 2, -2)[i], **kw)
        S(sc, lab, x, 760, 0.45 + i * 0.6, size=44, rot=(2, -2, 1)[i])

def b015(sc):  # Friday night became a ritual for millions of families.
    sc.bg = "dark"
    I(sc, "shelf", 1000, 960, 430, 0.0, anim="drop", rows=3)
    I(sc, "family", 640, 960, 800, 0.5, anim="slide", frm="bottom", border=0)
    S(sc, "FRIDAY NIGHT", 1580, 140, 1.1, size=54, rot=3, frm="top", bg=MUSTARD)

def b016(sc):  # You walked the aisles. You argued over what to watch.
    P(sc, "kids_aisle.jpg", 1100, 900, 520, 0.0, "left", rot=-2, crop=(0.0, 0.0, 1.0, 1.0), mode="color")
    I(sc, "qmark", 190, 1570, 380, 0.8, anim="stamp")
    S(sc, "WHAT TO WATCH", 1560, 820, 1.2, size=48, rot=-3, frm="right")

def b017(sc):  # In 1994 the media giant Viacom bought Blockbuster
    sc.bg = "tan"
    I(sc, "building", 360, 520, 520, 0.0, label="VIACOM")
    MK(sc, "arrow", (780, 520, 1080, 520), 0.6, width=12)
    I(sc, "ticket", 560, 1410, 520, 0.8, anim="slide", frm="right", rot=4)
    ST(sc, "1994", 960, 860, 1.4, size=96, rot=-8)

def b018(sc):  # in a deal reported at around 8.4 billion dollars.
    I(sc, "money", 520, 960, 690, 0.0, rot=-3, n=7)
    BT(sc, "$8.4 BILLION", 960, 380, 0.6, size=200)
    S(sc, "AS REPORTED", 1500, 860, 1.3, size=40, rot=4, frm="right")

def b019(sc):  # By the early two thousands the chain had grown
    sc.bg = "tan"
    sc.add(El(ic_chart(1000, seed=19, kind="up", color=RED), 900, 560, 0.0, "drop", rot=1))
    S(sc, "EARLY 2000s", 1540, 220, 0.8, size=56, rot=-3, frm="top")

def b020(sc):  # to roughly nine thousand stores around the world.
    m = MAP(sc, "world", 1700, 960, 600, 0.0)
    cs = ["United States of America", "Canada", "Mexico", "United Kingdom", "Ireland", "Spain", "Italy", "Denmark", "Australia",
          "New Zealand", "Brazil", "Argentina", "Chile", "Japan", "Taiwan", "Thailand", "Portugal", "Colombia"]
    pts = land_points(m, 80, 20, countries=cs, margin=2)
    pts.sort(key=lambda p: p[0])
    for i, (x, y) in enumerate(pts):
        DOT(sc, x, y, 0.3 + i * 0.012, r=7)
    sc.add(Counter(960, 150, 0, 9000, 0.4, 1.4, "~{:,} STORES", size=110))

def b021(sc):  # But the business had a hidden engine. Late fees.
    sc.bg = "tan"
    sc.add(El(ic_receipt(380, seed=21, title="LATE FEE", amount="$$$"), 820, 540, 0.0, "slide", "bottom", rot=-4))
    HL(sc, "THE HIDDEN ENGINE", 1390, 300, 0.7, size=74, rot=2, frm="right")
    ST(sc, "LATE FEES", 1370, 760, 1.3, size=80, rot=-10)

def b022(sc):  # Customers who returned a tape or a DVD late paid extra.
    sc.bg = "news"
    I(sc, "calendar", 460, 620, 560, 0.0, rot=-3, day="", title="DUE DATE")
    I(sc, "vhs", 380, 1240, 380, 0.5, anim="slide", frm="right", rot=6)
    I(sc, "dvd", 280, 1440, 720, 0.8, anim="slide", frm="right", rot=0)
    I(sc, "coin", 170, 1050, 820, 1.2, anim="pop", sym="+$")

def b023(sc):  # According to widely cited reports Blockbuster earned hundreds
    sc.bg = "board"
    sc.add(El(ic_clipping(700, seed=23, head="LATE FEE REVENUE"), 820, 520, 0.0, "slide", "left", rot=-3))
    sc.add(El(ic_clipping(420, seed=24, head="REPORTS", photo=False), 1420, 360, 0.4, "slide", "right", rot=5))
    I(sc, "magnifier", 340, 1300, 760, 0.9, anim="slide", frm="bottom", rot=-10)

def b024(sc):  # of millions of dollars a year from these penalties.
    sc.bg = "tan"
    for i in range(5):
        I(sc, "money", 420, 560 + i * 200, 620 - (i % 2) * 120, 0.0 + i * 0.25, rot=(-6, 4, -2, 7, -4)[i], seed=i)
    S(sc, "EVERY YEAR", 1520, 230, 1.6, size=56, rot=3, frm="top")

def b025(sc):  # Some estimates put the figure near eight hundred million dollars
    BT(sc, "~$800 MILLION", 960, 470, 0.0, size=210)
    ST(sc, "ESTIMATE", 1400, 760, 0.9, size=74, rot=-9)
    MK(sc, "underline", (380, 640, 1500, 640), 1.3)

def b026(sc):  # in the year two thousand. The fees were profitable.
    sc.bg = "tan"
    sc.add(El(ic_chart(880, seed=26, bars=[3, 4, 5, 7, 9], labels=["96", "97", "98", "99", "2000"], color=[INK, INK, INK, INK, RED]), 860, 560, 0.0, "drop", rot=-1))
    S(sc, "PROFITABLE", 1530, 280, 1.0, size=58, rot=3, frm="right")

def b027(sc):  # They were also deeply unpopular. In 1997 two entrepreneurs
    sc.bg = "news"
    sc.add(El(ic_receipt(360, seed=27, title="LATE FEE", amount="$$$"), 760, 540, 0.0, "drop", rot=8))
    MK(sc, "cross", (560, 230, 960, 860), 0.6, width=14)
    MK(sc, "cross", (960, 230, 560, 860), 0.8, width=14)
    ST(sc, "UNPOPULAR", 1360, 520, 1.2, size=92, rot=-8)

def b028(sc):  # in California started a small company called Netflix. Reed Hastings
    m = MAP(sc, "us", 1250, 1000, 560, 0.0)
    x, y = m.xy(-121.96, 37.23)
    DOT(sc, x, y, 0.5, r=14)
    I(sc, "envelope", 420, 1450, 820, 0.8, anim="slide", frm="right", rot=-5, label="NETFLIX")
    TH(sc, [(x, y), (1300, 760)], 1.2)
    S(sc, "CALIFORNIA, 1997", x + 80, y - 90, 1.5, size=44, rot=-2, frm="top")

def b029(sc):  # and Marc Randolph wanted to rent DVDs through the mail.
    ph = P(sc, "hastings_randolph.jpg", 1150, 900, 470, 0.0, "left", rot=-1)
    TP(sc, 900, 470 - ph.raw.height / 2 + 4, 0.4, rot=3)
    S(sc, "REED HASTINGS", 600, 860, 0.8, size=44, rot=-2)
    S(sc, "MARC RANDOLPH", 1200, 860, 1.0, size=44, rot=2)
    I(sc, "envelope", 300, 1640, 860, 1.4, anim="slide", frm="right", rot=8, label="")

def b030(sc):  # Their early service struggled. Then they moved to a monthly subscription.
    ph = P(sc, "netflix_envelopes.jpg", 920, 760, 520, 0.0, "left", rot=-2, mode="color")
    I(sc, "calendar", 300, 1500, 440, 0.7, anim="slide", frm="right", rot=5, cross=False, title="MONTHLY")
    S(sc, "SUBSCRIPTION", 1500, 790, 1.2, size=50, rot=-2, frm="right")

def b031(sc):  # No due dates. No late fees. What happened next became
    sc.bg = "tan"
    I(sc, "calendar", 420, 960, 540, 0.0, title="DUE DATE")
    ST(sc, "NO DUE DATES", 520, 260, 0.6, size=70, rot=-7)
    ST(sc, "NO LATE FEES", 1420, 820, 1.1, size=70, rot=6)

def b032(sc):  # one of the most famous meetings in business history.
    sc.bg = "board"
    I(sc, "table", 900, 960, 560, 0.0)
    HL(sc, "THE MEETING", 960, 170, 0.7, size=90, rot=-1)
    S(sc, "BUSINESS HISTORY", 1500, 900, 1.2, size=42, rot=3, frm="right")

def b033(sc):  # In 2000 the Netflix founders flew to Dallas
    m = MAP(sc, "us", 1350, 960, 580, 0.0)
    a = m.xy(-121.96, 37.23); b = m.xy(-96.8, 32.78)
    DOT(sc, *a, 0.3, r=12); DOT(sc, *b, 0.4, r=12)
    mid = ((a[0] + b[0]) / 2, min(a[1], b[1]) - 170)
    MK(sc, "arrow", (a[0], a[1], b[0], b[1]), 0.7, width=8)
    I(sc, "plane", 150, mid[0], mid[1] + 40, 1.1, anim="slide", frm="left", rot=-8)
    ST(sc, "2000", 1500, 220, 1.5, size=96, rot=8)

def b034(sc):  # to meet Blockbuster's leadership. According to Marc Randolph's own account
    sc.bg = "tan"
    I(sc, "building", 300, 560, 540, 0.0, label="HQ")
    I(sc, "book", 380, 1260, 520, 0.6, anim="slide", frm="right", rot=4, title="A FOUNDER'S\nOWN ACCOUNT")
    S(sc, "HIS OWN ACCOUNT", 1260, 880, 1.2, size=44, rot=-2)

def b035(sc):  # they proposed selling Netflix to Blockbuster for fifty million dollars.
    I(sc, "envelope", 520, 620, 480, 0.0, rot=-4, label="NETFLIX")
    I(sc, "tag", 640, 1280, 600, 0.6, anim="slide", frm="right", rot=6, text="$50 MILLION")
    TH(sc, [(820, 470), (1010, 600)], 1.1)
    S(sc, "THE OFFER", 620, 860, 1.4, size=50, rot=-2)

def b036(sc):  # Blockbuster's chief executive John Antioco reportedly turned them down.
    sc.bg = "tan"
    I(sc, "tag", 600, 1260, 400, 0.0, rot=4, text="$50 MILLION")
    DOS(sc, "JOHN ANTIOCO", "CHIEF EXECUTIVE", 560, 560, 0.3, w=480)
    ST(sc, "DECLINED", 1300, 720, 0.7, size=120, rot=-10)
    sc.els[-1].at = "down"

def b037(sc):  # At the time Netflix was losing money. The offer looked like
    sc.add(El(ic_chart(900, seed=37, kind="down", color=RED), 860, 540, 0.0, "drop", rot=1))
    S(sc, "LOSING MONEY", 1500, 240, 0.8, size=56, rot=3, frm="top")

def b038(sc):  # a small company asking for a rescue. But the story does
    sc.bg = "news"
    I(sc, "ring", 520, 900, 540, 0.0, rot=8)
    I(sc, "envelope", 220, 900, 540, 0.6, anim="drop", rot=-10, label="")
    S(sc, "A RESCUE?", 1440, 820, 1.1, size=60, rot=-3, frm="right")

def b039(sc):  # not end there. Blockbuster did eventually take the threat seriously.
    sc.bg = "board"
    I(sc, "ticket", 520, 520, 420, 0.0, rot=-4)
    I(sc, "envelope", 400, 1400, 640, 0.3, anim="slide", frm="right", rot=5, label="NETFLIX")
    TH(sc, [(560, 440), (900, 560), (1330, 620)], 0.8)
    ST(sc, "THREAT", 900, 820, 1.4, size=90, rot=-6)

def b040(sc):  # In 2004 it launched its own online rental service.
    sc.bg = "tan"
    scr = Image.new("RGB", (400, 240), (40, 42, 44))
    d = ImageDraw.Draw(scr)
    for i in range(4):
        d.rectangle([20 + i * 95, 40, 95 + i * 95, 170], fill=(200, 190, 160))
        d.rectangle([20 + i * 95, 185, 95 + i * 95, 205], fill=MUSTARD)
    I(sc, "monitor", 700, 860, 540, 0.0, screen=scr, label="RENT ONLINE")
    ST(sc, "2004", 1450, 300, 0.8, size=100, rot=8)
    S(sc, "BLOCKBUSTER ONLINE", 1430, 800, 1.2, size=44, rot=-2, frm="right")

def b041(sc):  # In 2005 it announced the end of late fees
    ph = P(sc, "end_of_late_fees.jpg", 980, 820, 540, 0.0, "left", rot=-1.5, mode="color")
    ST(sc, "2005", 1560, 300, 0.8, size=110, rot=9)
    TP(sc, 820, 540 - ph.raw.height / 2 + 4, 0.4, rot=-4)

def b042(sc):  # on many rentals. That move reportedly cost the company a
    ph = P(sc, "life_after_late_fees.jpg", 1150, 900, 470, 0.0, "top", rot=1.5, mode="color")
    I(sc, "magnifier", 300, 560, 860, 0.7, anim="slide", frm="bottom", rot=-15)
    S(sc, "MANY RENTALS", 1500, 900, 1.2, size=48, rot=-2, frm="right")

def b043(sc):  # large share of its revenue. Then in 2006
    sc.bg = "tan"
    I(sc, "pie", 560, 820, 540, 0.0, frac=0.28)
    sl = I(sc, "slice", 560, 1010, 470, 0.5, anim="slide", frm="right", frac=0.28, dist=260)
    S(sc, "REVENUE", 820, 900, 1.0, size=56, rot=-2)
    S(sc, "COSTLY", 1480, 330, 1.4, size=50, rot=4, frm="top", bg=PAPER)

def b044(sc):  # came Total Access. Customers could rent DVDs by mail
    ph = P(sc, "total_access.jpg", 1150, 880, 520, 0.0, "left", rot=-1, mode="color")
    ST(sc, "2006", 1600, 860, 0.8, size=100, rot=-8)

def b045(sc):  # and return them in a store for a free rental.
    sc.bg = "news"
    I(sc, "envelope", 380, 420, 540, 0.0, rot=-5, color=MUSTARD, label="")
    MK(sc, "arrow", (680, 540, 1080, 540), 0.5, width=12)
    I(sc, "store", 520, 1400, 520, 0.8, anim="slide", frm="right", sign="")
    ST(sc, "FREE RENTAL", 1400, 850, 1.4, size=70, rot=-6)

def b046(sc):  # Reports from the time suggested the plan was winning subscribers quickly.
    sc.bg = "tan"
    sc.add(El(ic_chart(860, seed=46, kind="up", color=MUSTARD), 820, 560, 0.0, "drop", rot=-1))
    for i in range(5):
        I(sc, "person", 70, 1350 + i * 95, 780, 0.6 + i * 0.12, anim="pop", seed=i, border=5)
    S(sc, "SUBSCRIBERS", 1540, 300, 1.4, size=52, rot=3, frm="top")

def b047(sc):  # For a moment Blockbuster looked like it could fight back.
    sc.bg = "board"
    I(sc, "ticket", 560, 520, 540, 0.0, anim="slide", frm="left", rot=-6)
    I(sc, "envelope", 440, 1430, 540, 0.0, anim="slide", frm="right", rot=6, label="NETFLIX")
    BT(sc, "VS", 960, 540, 0.7, size=200, color=RED)
    S(sc, "FIGHTING BACK", 960, 880, 1.3, size=48, rot=-2)

def b048(sc):  # And this is where it gets genuinely strange.
    sc.bg = "tan"
    DOC(sc, 520, 820, 540, 0.0, title="BOARD MINUTES", rot=3, lines=12)
    I(sc, "magnifier", 460, 1050, 600, 0.6, anim="slide", frm="right", rot=-6)
    I(sc, "qmark", 220, 1550, 330, 1.2, anim="stamp")

def b049(sc):  # The program was expensive. Antioco clashed with his board
    sc.bg = "board"
    I(sc, "table", 760, 1150, 600, 0.0)
    I(sc, "person", 180, 420, 600, 0.4, anim="slide", frm="left", tie=RED)
    I(sc, "bolt", 160, 700, 560, 1.0, anim="stamp")
    S(sc, "THE BOARD", 1150, 230, 1.3, size=52, rot=2, frm="top")
    ST(sc, "EXPENSIVE", 420, 230, 1.6, size=60, rot=-8)

def b050(sc):  # and with activist investor Carl Icahn over costs and his own pay.
    sc.bg = "tan"
    DOS(sc, "CARL ICAHN", "ACTIVIST INVESTOR", 560, 560, 0.0, w=500)
    sc.add(El(ic_receipt(300, seed=50, title="COSTS", amount="$$$"), 1180, 520, 0.8, "slide", "right", rot=-5))
    sc.add(El(ic_receipt(300, seed=51, title="CEO PAY", amount="$$$"), 1530, 560, 1.1, "slide", "right", rot=6))
    I(sc, "bolt", 130, 850, 420, 1.5, anim="stamp")

def b051(sc):  # In 2007 Antioco left the company.
    sc.bg = "news"
    I(sc, "chair", 300, 760, 560, 0.0, rot=-2)
    I(sc, "box", 360, 1180, 700, 0.5, anim="slide", frm="right", rot=4)
    ST(sc, "2007", 1350, 300, 1.0, size=100, rot=9)
    S(sc, "CEO DEPARTS", 760, 900, 1.3, size=48, rot=-2)

def b052(sc):  # His replacement Jim Keyes shifted focus back toward the
    sc.bg = "tan"
    DOS(sc, "JIM KEYES", "NEW CEO", 600, 560, 0.0, w=500)
    I(sc, "store", 500, 1350, 520, 0.9, anim="slide", frm="right", sign="")
    MK(sc, "arrow", (860, 400, 1080, 440), 1.4, width=10)

def b053(sc):  # physical stores. Spending on the online push was cut.
    sc.bg = "news"
    strip = headline("ONLINE", 120, bg=PAPER, seed=3)
    sc.add(El(strip, 760, 540, 0.0, "slide", "left", rot=-2))
    I(sc, "scissors", 300, 1160, 520, 0.6, anim="slide", frm="right", rot=-8)
    ST(sc, "SPENDING CUT", 960, 840, 1.3, size=74, rot=-6)

def b054(sc):  # That same year Netflix began streaming films over the internet.
    ph = P(sc, "netflix_watch_now.jpg", 1150, 880, 520, 0.0, "left", rot=-1, mode="color")
    ST(sc, "2007", 1620, 860, 0.8, size=100, rot=-8)
    S(sc, "STREAMING", 1620, 200, 1.2, size=52, rot=3, frm="top")

def b055(sc):  # At the same time Redbox kiosks were appearing outside supermarkets.
    ph = P(sc, "redbox.jpg", 1060, 820, 520, 0.0, "left", rot=1.5, mode="color")
    TP(sc, 820, 520 - ph.raw.height / 2 + 4, 0.4, rot=-5)
    S(sc, "REDBOX KIOSKS", 1550, 820, 1.0, size=48, rot=-2, frm="right")

def b056(sc):  # They rented DVDs for about a dollar a night.
    sc.bg = "tan"
    I(sc, "dvd", 380, 640, 560, 0.0)
    I(sc, "coin", 280, 900, 720, 0.5, anim="pop", sym="$1")
    BT(sc, "$1 A NIGHT", 1360, 470, 1.0, size=170)
    MK(sc, "underline", (1060, 610, 1660, 610), 1.5)

def b057(sc):  # Blockbuster was now being squeezed from two sides.
    sc.bg = "news"
    I(sc, "ticket", 520, 960, 520, 0.0)
    I(sc, "vise", 520, 410, 520, 0.6, anim="slide", frm="left", dist=200)
    v = icon("vise", 520, seed=5).transpose(Image.FLIP_LEFT_RIGHT)
    sc.add(El(v, 1510, 520, 0.6, "slide", "right", dist=200))
    S(sc, "STREAMING", 410, 800, 1.1, size=46, rot=-2)
    S(sc, "KIOSKS", 1510, 800, 1.3, size=46, rot=2)

def b058(sc):  # Then the 2008 financial crisis hit. Consumer spending dropped.
    sc.bg = "tan"
    sc.add(El(ic_clipping(760, seed=58, head="FINANCIAL CRISIS"), 760, 500, 0.0, "slide", "left", rot=-3))
    sc.add(El(ic_chart(560, seed=59, kind="down", color=RED), 1420, 640, 0.6, "slide", "right", rot=4))
    ST(sc, "2008", 1450, 230, 1.2, size=96, rot=8)

def b059(sc):  # The company was carrying heavy debt. Stores began closing by the hundreds.
    ph = P(sc, "closing_a.jpg", 980, 780, 540, 0.0, "left", rot=-2, mode="color")
    S(sc, "HEAVY DEBT", 1550, 300, 0.7, size=54, rot=4, frm="right")
    ST(sc, "CLOSING", 1520, 780, 1.2, size=80, rot=-9)

def b060(sc):  # In September 2010 Blockbuster filed for Chapter Eleven bankruptcy protection.
    sc.bg = "tan"
    DOC(sc, 560, 820, 540, 0.0, title="CHAPTER 11 PETITION", rot=-2, lines=12, seal=True)
    ST(sc, "FILED", 900, 620, 0.7, size=110, rot=-14)
    S(sc, "SEPTEMBER 2010", 1450, 300, 1.2, size=50, rot=3, frm="right")

def b061(sc):  # The following year satellite television company Dish Network bought what remained
    sc.bg = "news"
    I(sc, "dish", 460, 640, 520, 0.0)
    S(sc, "DISH NETWORK", 640, 880, 0.5, size=50, rot=-2)
    I(sc, "ticket", 440, 1360, 470, 0.9, anim="slide", frm="right", rot=8)
    ST(sc, "2011", 1380, 770, 1.4, size=96, rot=-6)

def b062(sc):  # at auction for roughly three hundred twenty million dollars.
    sc.bg = "tan"
    I(sc, "gavel", 420, 520, 560, 0.0, rot=-5)
    BT(sc, "~$320 MILLION", 1240, 470, 0.6, size=170)
    S(sc, "AT AUCTION", 1240, 740, 1.2, size=50, rot=2)

def b063(sc):  # Dish tried to keep part of the brand alive.
    sc.bg = "board"
    tk = icon("ticket", 760, seed=63)
    w, h = tk.size
    mL = Image.new("L", tk.size, 0)
    rng = random.Random(9)
    ImageDraw.Draw(mL).polygon([(0, 0)] + [(w * 0.5 + rng.uniform(-30, 30), y) for y in np.linspace(0, h, 12)] + [(0, h)], fill=255)
    L_ = tk.copy(); L_.putalpha(ImageChops.multiply(tk.getchannel("A"), mL))
    R_ = tk.copy(); R_.putalpha(ImageChops.multiply(tk.getchannel("A"), ImageChops.invert(mL)))
    sc.add(El(L_, 950, 520, 0.0, "slide", "left"))
    sc.add(El(R_, 975, 525, 0.3, "slide", "right"))
    TP(sc, 970, 420, 0.8, rot=80, L=150)
    TP(sc, 975, 620, 1.0, rot=95, L=150)
    S(sc, "THE BRAND", 960, 850, 1.4, size=54, rot=-2)

def b064(sc):  # By early 2014 the last company owned stores had closed.
    ph = P(sc, "closing_b.jpg", 1150, 880, 500, 0.0, "left", rot=-1.5, mode="color")
    ST(sc, "2014", 1600, 880, 0.8, size=100, rot=-8)

def b065(sc):  # A handful of franchise locations kept going on their own.
    m = MAP(sc, "us", 1350, 960, 580, 0.0)
    pts = land_points(m, 9, 65)
    for i, (x, y) in enumerate(pts):
        DOT(sc, x, y, 0.4 + i * 0.12, r=13, color=MUSTARD)
    S(sc, "FRANCHISES", 1500, 160, 1.6, size=52, rot=3, frm="top")

def b066(sc):  # One by one they shut down too. Today according
    m = MAP(sc, "us", 1350, 960, 580, 0.0, anim="cut")
    pts = land_points(m, 9, 65)
    for (x, y) in pts:
        DOT(sc, x, y, 0.0, r=13, color=MUSTARD).anim = "cut"
    for i, (x, y) in enumerate(pts[:-1]):
        MK(sc, "cross", (x - 22, y - 22, x + 22, y + 22), 0.3 + i * 0.22, dur=0.12, width=8, color=INK)
        MK(sc, "cross", (x + 22, y - 22, x - 22, y + 22), 0.36 + i * 0.22, dur=0.12, width=8, color=INK)

def b067(sc):  # to the latest reports just one Blockbuster store remains open.
    m = MAP(sc, "us", 1350, 960, 580, 0.0)
    x, y = m.xy(-121.31, 44.06)
    DOT(sc, x, y, 0.4, r=18)
    MK(sc, "circle", (x - 70, y - 60, x + 70, y + 60), 0.8)
    sc.punch = (x + 120, y + 60, 1.35, 0.55)
    BT(sc, "1", 1740, 760, 1.1, size=240)
    S(sc, "STORE LEFT", 1700, 950, 1.5, size=46, rot=3)

def b068(sc):  # It sits in the small city of Bend Oregon.
    sc.bg = "map"
    m = MAP(sc, "us", 1600, 960, 560, 0.0, fill=(214, 200, 168))
    x, y = m.xy(-121.31, 44.06)
    DOT(sc, x, y, 0.3, r=18)
    I(sc, "store", 360, 1180, 330, 0.7, anim="slide", frm="right", sign="", rot=3)
    TH(sc, [(x, y), (1000, 330)], 1.1)
    S(sc, "BEND, OREGON", x + 60, y + 110, 1.5, size=56, rot=-2)

def b069(sc):  # Netflix meanwhile grew into one of the largest entertainment companies
    sc.bg = "tan"
    sc.add(El(ic_chart(980, seed=69, bars=[1, 2, 4, 7, 11, 16], color=RED), 860, 560, 0.0, "drop", rot=-1))
    I(sc, "envelope", 300, 1600, 300, 0.8, anim="slide", frm="right", rot=8, label="NETFLIX")
    S(sc, "GLOBAL GIANT", 1580, 820, 1.3, size=50, rot=-3, frm="right")

def b070(sc):  # on the planet. The company Blockbuster once declined to buy
    m = MAP(sc, "world", 1700, 960, 620, 0.0, fill=(210, 196, 164))
    I(sc, "tag", 560, 900, 480, 0.6, anim="slide", frm="top", rot=-4, text="$50 MILLION")
    ST(sc, "DECLINED", 1180, 760, 1.3, size=100, rot=-10)

def b071(sc):  # for fifty million dollars went on to be valued
    sc.bg = "tan"
    I(sc, "coin", 160, 520, 760, 0.0, sym="$")
    S(sc, "$50 MILLION", 520, 900, 0.3, size=40, rot=-2)
    for i in range(6):
        I(sc, "money", 420, 1280, 860 - i * 110, 0.6 + i * 0.15, rot=(-3, 4, -2, 5, -4, 2)[i], seed=i, n=4)
    MK(sc, "arrow", (640, 720, 1000, 420), 1.6, width=10)

def b072(sc):  # at many billions. So what really brought Blockbuster down?
    sc.bg = "news"
    BT(sc, "BILLIONS", 600, 260, 0.0, size=150, color=INK)
    I(sc, "ticket", 640, 900, 640, 0.6, rot=-10)
    I(sc, "qmark", 340, 1480, 560, 1.2, anim="stamp")

def b073(sc):  # It was not a lack of warning. The company saw
    sc.bg = "tan"
    I(sc, "warning", 520, 760, 520, 0.0, rot=-4)
    S(sc, "WARNING SIGNS", 1420, 640, 0.8, size=54, rot=3, frm="right")
    ST(sc, "SEEN", 1420, 420, 1.3, size=90, rot=-8)

def b074(sc):  # online rental coming. It even built a strong answer.
    ph = P(sc, "total_access.jpg", 900, 780, 520, 0.0, "left", rot=-2, mode="color")
    I(sc, "check", 300, 1500, 450, 0.8, anim="stamp")
    S(sc, "A STRONG ANSWER", 1500, 760, 1.2, size=48, rot=-2, frm="right")

def b075(sc):  # The harder problem was letting go of the model
    sc.bg = "board"
    I(sc, "vhs", 520, 1060, 560, 0.0, rot=6)
    TH(sc, [(380, 220), (840, 520)], 0.6)
    TH(sc, [(380, 900), (840, 620)], 0.8)
    S(sc, "LETTING GO", 1500, 850, 1.3, size=56, rot=-2, frm="right")

def b076(sc):  # that had made it rich. Stores. Shelves. Late fees.
    sc.bg = "tan"
    I(sc, "store", 400, 400, 480, 0.0, sign="", rot=-3)
    S(sc, "STORES", 400, 800, 0.2, size=48, rot=-2)
    I(sc, "shelf", 400, 960, 480, 0.7, rot=2)
    S(sc, "SHELVES", 960, 800, 0.9, size=48, rot=2)
    sc.add(El(ic_receipt(220, seed=76, title="LATE FEE", amount="$"), 1520, 470, 1.3, "drop", rot=-4))
    S(sc, "LATE FEES", 1520, 800, 1.5, size=48, rot=-1)

def b077(sc):  # Blockbuster did not lose because it never saw the future.
    ph = P(sc, "grand_opening.jpg", 920, 760, 540, 0.0, "left", rot=-2)
    MK(sc, "arrow", (1280, 540, 1720, 540), 0.7, width=12)
    S(sc, "THE FUTURE", 1500, 440, 1.1, size=52, rot=2, frm="top")

def b078(sc):  # It lost because the future paid less than the past.
    sc.bg = "tan"
    I(sc, "scale", 1000, 960, 540, 0.0, tilt=-14, left="THE PAST", right="THE FUTURE")
    I(sc, "money", 240, 600, 560, 0.7, anim="drop", n=6)
    I(sc, "coin", 110, 1320, 380, 1.1, anim="drop", sym="$")

BEATS = [globals()[f"b{i:03d}"] for i in range(1, 79)]

CHAPTERS = {8: ("PART ONE", "THE EMPIRE"), 28: ("PART TWO", "THE CHALLENGER"), 48: ("PART THREE", "THE STUMBLE"),
            58: ("PART FOUR", "THE FALL"), 72: ("EPILOGUE", "THE LESSON")}
# (x, y, zoom, start fraction): camera pushes in on a detail during the beat
PUNCH = {3: (1180, 380, 1.3, 0.5), 41: (520, 480, 1.55, 0.45), 42: (900, 400, 1.25, 0.5), 44: (1000, 320, 1.35, 0.5),
         54: (620, 360, 1.45, 0.45), 55: (640, 450, 1.5, 0.45), 59: (730, 470, 1.4, 0.5), 64: (1100, 260, 1.4, 0.45),
         2: (1380, 470, 1.2, 0.55), 29: (900, 470, 1.15, 0.5), 16: (900, 520, 1.15, 0.5)}
# highlighter sweeps over document headlines: (box, word to land on)
HIGHLIGHT = {23: ((490, 236, 1090, 318), "reports"), 60: ((560, 228, 1080, 286), "bankruptcy"), 48: ((600, 254, 1040, 300), "strange"),
             58: ((400, 190, 1100, 280), "crisis"), 10: ((500, 228, 1020, 286), "invested")}

def direction(i, sc, dur):
    """Camera + overlays for beat index i (0-based)."""
    from motion import Camera, Banner, Highlight
    b = i + 1
    sc.overlay = []
    if b in CHAPTERS:
        sc.overlay.append(Banner(*CHAPTERS[b], t_in=0.25, t_out=min(2.9, dur - 0.5), y=H - 270 if b in (58, 72) else 60))
    if b in HIGHLIGHT:
        box, word = HIGHLIGHT[b]
        h = Highlight(box, 1.0)
        h.at = word
        sc.els.append(h)
    big = [e for e in sc.els if hasattr(e, "raw")]
    hero = max(big, key=lambda e: e.raw.width * e.raw.height) if big else None
    focus = (hero.cx, hero.cy) if hero is not None else (W / 2, H / 2)
    r = random.Random(b)
    punch = getattr(sc, "punch", None) or PUNCH.get(b)
    z1 = 1.12 if b == 1 else r.uniform(1.05, 1.09)
    drift = (r.choice([-1, 1]) * r.uniform(20, 60), r.uniform(-20, 20))
    return Camera(dur, focus, 1.0, z1, drift, punch, seed=b)

def transition_kind(i):
    b = i + 1
    if b == 1:
        return "cut"
    if b in CHAPTERS:
        return "zoom"
    from render import beats
    prev = beats()[i - 1]["text"].rstrip()
    if not prev.endswith((".", "?")):
        return "cut"
    return ["slide", "cut", "whip", "cut", "slide", "whip"][b % 6]

def build(i):
    """Return Scene for beat index i (0-based)."""
    random.seed(1000 + i)
    sc = Scene("news")
    sc.variant = i % 3
    BEATS[i](sc)
    return sc
