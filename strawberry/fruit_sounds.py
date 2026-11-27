"""Fruit-specific bite / chew / slurp / drip sounds, modelled on how biting each fruit actually sounds.

strawberry : soft skin pop + gritty seed crackle, soft yielding flesh, medium juicy squish
watermelon : sharp rind crack, long crisp watery CRUNCH (cells bursting), sloshing water while chewing
peach      : no crunch; velvety skin tearing, thick wet 'schlorp', slow heavy viscous juice
kiwi       : dry fuzzy-skin rasp, soft jelly squish, tiny seed pops
"""
import math

import numpy as np
from scipy import signal

from audio import SR, add, bubble, click, crackle, squelch, thump, lp, hp, bp, env_exp, reson, adsr

rng = np.random.default_rng(11)


def _n(dur):
    return int(dur * SR)


# ----------------------------------------------------------------------------- building blocks
def rasp(dur, lo, hi, grain_hz=(250, 700), amp=0.5):
    """fuzzy/velvety skin rubbing or tearing: grainy band noise."""
    n = _n(dur)
    x = bp(rng.normal(0, 1, n), lo, hi)
    g = np.repeat(rng.uniform(0.1, 1.0, n // 40 + 1), 40)[:n]          # dense grain
    g = lp(g, rng.uniform(*grain_hz))
    e = np.sin(np.pi * np.arange(n) / n) ** 0.7
    return amp * x * np.abs(g) * e / (np.abs(x).max() + 1e-9)


def crack(f=700, q=6, amp=0.8, ring=0.03):
    """sharp structural crack (rind / firm skin): click exciting a short resonance."""
    n = _n(ring * 4)
    x = np.zeros(n)
    add(x, click(6000, 0.002, 1.0))
    add(x, click(2500, 0.004, 0.7))
    r = reson(x, f, q) * 3
    return amp * (x + r * env_exp(n, ring))


def cells(dur, density, f_lo=1800, f_hi=4500, amp=0.35):
    """watery cells bursting: a dense shower of tiny high bubbles."""
    n = _n(dur)
    x = np.zeros(n)
    for _ in range(int(density * dur)):
        p = int(rng.uniform(0, 0.95) * n)
        f0 = rng.uniform(f_lo, f_hi)
        add(x, bubble(f0, f0 * rng.uniform(1.3, 2.0), rng.uniform(0.003, 0.008), rng.uniform(0.2, 1.0)), p)
    return amp * x * env_exp(n, dur / 2.5) / (np.abs(x).max() + 1e-9)


def slosh(dur, f=260, rate=7.0, amp=0.4):
    """water moving around in the mouth: low resonant gurgle with slow motion."""
    n = _n(dur)
    tt = np.arange(n) / SR
    src = rng.normal(0, 1, n) * (0.5 + 0.5 * np.sin(2 * math.pi * rate * tt + rng.uniform(0, 6)))
    x = reson(lp(src, 900), f, 3) + 0.5 * reson(lp(src, 900), f * 1.9, 4)
    for _ in range(int(dur * 25)):
        add(x, bubble(rng.uniform(250, 500), rng.uniform(600, 1000), rng.uniform(0.015, 0.035), 0.4),
            int(rng.uniform(0, 0.9) * n))
    return amp * x * np.sin(np.pi * tt / dur) / (np.abs(x).max() + 1e-9)


def gooey(dur, f0, f1, amp, n_bub, bub_f=(300, 700), bub_len=(0.02, 0.05)):
    """thick viscous squelch with slow, low bubbles (peach)."""
    x = squelch(dur, f0, f1, amp * 0.8, 0)
    n = len(x)
    for _ in range(n_bub):
        f = rng.uniform(*bub_f)
        add(x, bubble(f, f * rng.uniform(1.4, 1.9), rng.uniform(*bub_len), rng.uniform(0.2, 0.5) * amp),
            int(rng.uniform(0, 0.85) * n))
    return lp(x, 3500)


def jelly(dur, amp, n_bub):
    """springy gelatinous squish (kiwi): mid-high squelch with quick bright bubbles."""
    x = squelch(dur, 700, 1700, amp * 0.7, 0)
    n = len(x)
    for _ in range(n_bub):
        f = rng.uniform(800, 1600)
        add(x, bubble(f, f * rng.uniform(1.8, 2.6), rng.uniform(0.006, 0.014), rng.uniform(0.2, 0.5) * amp),
            int(rng.uniform(0, 0.85) * n))
    return x


def seed_pops(dur, count, amp=0.35, f=(5000, 9000)):
    """tiny hard seeds cracking between teeth."""
    n = _n(dur)
    x = np.zeros(n)
    for _ in range(count):
        add(x, click(rng.uniform(*f), 0.0015, rng.uniform(0.4, 1.0)), int(rng.uniform(0, 0.95) * n))
    return amp * x


def spray(dur, amp, bright=3500):
    n = _n(dur)
    x = hp(rng.normal(0, 1, n), bright) * env_exp(n, dur / 4) * amp
    for _ in range(12):
        add(x, bubble(rng.uniform(1800, 3000), rng.uniform(3200, 5200), rng.uniform(0.004, 0.009), 0.1),
            int(rng.uniform(0, 0.8) * n))
    return x


def _buf(dur):
    return np.zeros(_n(dur))


# ----------------------------------------------------------------------------- per-fruit cues
def bite(fruit, big=False):
    k = 1.3 if big else 1.0
    if fruit == "strawberry":
        x = _buf(0.7 * k)
        add(x, crack(1100, 4, 0.35, 0.012))                                   # soft skin pop
        add(x, crackle(0.12 * k, 900, 1500, 5000, 0.7, 0.04))                 # gentle tearing crisp
        add(x, seed_pops(0.18 * k, int(22 * k), 0.4, (5500, 11000)), _n(0.005))  # gritty seeds
        add(x, squelch(0.32 * k, 380, 1150, 1.0, int(16 * k)), _n(0.04))      # soft juicy flesh
        add(x, spray(0.15, 0.16), _n(0.03))
        add(x, thump(110, 65, 0.09, 0.45))
        return x
    if fruit == "watermelon":
        x = _buf(0.9 * k)
        add(x, crack(650, 7, 1.0, 0.025))                                     # rind crack
        add(x, crackle(0.38 * k, 4200, 900, 11000, 1.7, 0.15 * k), _n(0.005))  # long crisp crunch
        add(x, crackle(0.3 * k, 1400, 500, 2500, 0.9, 0.12), _n(0.01))        # body of the crunch
        add(x, cells(0.4 * k, 900, 1800, 4800, 0.55), _n(0.02))               # watery cells bursting
        add(x, spray(0.28 * k, 0.32, 2800), _n(0.03))                         # lots of water spray
        add(x, slosh(0.35 * k, 300, 9, 0.5), _n(0.12))
        add(x, thump(90, 55, 0.12, 0.55))
        return x
    if fruit == "peach":
        x = _buf(0.9 * k)
        add(x, rasp(0.09, 900, 3500, (150, 400), 0.35))                       # velvety skin tearing
        add(x, gooey(0.45 * k, 260, 850, 1.2, int(22 * k)), _n(0.03))        # thick wet schlorp
        add(x, gooey(0.3 * k, 420, 1100, 0.6, 10), _n(0.15))
        add(x, spray(0.12, 0.08, 2500), _n(0.05))
        add(x, thump(80, 50, 0.1, 0.4))
        return x
    if fruit == "kiwi":
        x = _buf(0.7 * k)
        add(x, rasp(0.11, 2500, 9000, (400, 900), 0.55))                      # dry fuzzy skin
        add(x, crack(1500, 3, 0.2, 0.008), _n(0.03))                         # thin skin gives
        add(x, jelly(0.3 * k, 1.0, int(18 * k)), _n(0.05))                   # jelly-soft flesh
        add(x, seed_pops(0.25 * k, int(30 * k), 0.45, (6000, 12000)), _n(0.06))  # tiny seed pops
        add(x, spray(0.12, 0.12, 3500), _n(0.05))
        add(x, thump(120, 70, 0.07, 0.35))
        return x
    raise ValueError(fruit)


def chew(fruit, i, full=False):
    d = rng.uniform(0.22, 0.3) * (1.15 if full else 1.0)
    alt = i % 2
    x = _buf(d + 0.1)
    if fruit == "strawberry":
        add(x, squelch(d, 450 if alt else 900, 900 if alt else 450, 0.6, int(rng.integers(8, 14))))
        add(x, seed_pops(d, int(rng.integers(3, 8)), 0.25, (5500, 10000)))
        if i < 2:
            add(x, crackle(d * 0.6, 500, 1500, 5000, 0.35, d / 3))
    elif fruit == "watermelon":
        crunch = max(0.15, 1.0 - 0.18 * i)                                    # stays crunchy a while
        add(x, crackle(d * 0.8, 2600 * crunch, 800, 9000, 1.1 * crunch, d / 2.5))
        add(x, cells(d * 0.8, 500 * crunch, 1800, 4500, 0.35 * crunch))
        add(x, slosh(d, 240 if alt else 320, 8, 0.55))                         # watery mouth
    elif fruit == "peach":
        add(x, gooey(d * 1.1, 220 if alt else 600, 600 if alt else 220, 0.75, int(rng.integers(8, 14))))
        add(x, gooey(d * 0.6, 350, 800, 0.3, 4), _n(d * 0.3))
    elif fruit == "kiwi":
        add(x, jelly(d, 0.7, int(rng.integers(8, 14))))
        add(x, seed_pops(d, int(rng.integers(6, 14)), 0.35, (6000, 12000)))
    if rng.random() < 0.5:
        add(x, click(rng.uniform(2500, 4000), 0.003, 0.25), int(rng.uniform(0.04, 0.15) * SR))
    return x


def slurp(fruit):
    """sucking up the juice: watery & bright for melon, thick & low for peach."""
    p = dict(strawberry=(0.4, 380, 1700, 18, (500, 1200)), watermelon=(0.5, 450, 2200, 26, (700, 1600)),
             peach=(0.55, 250, 1000, 14, (300, 700)), kiwi=(0.3, 500, 1800, 14, (700, 1400)))[fruit]
    dur, f0, f1, nb, bf = p
    n = _n(dur)
    tt = np.arange(n) / SR
    src = rng.normal(0, 1, n) * (0.6 + 0.4 * np.sin(2 * math.pi * rng.uniform(22, 32) * tt))
    out = np.zeros(n)
    blk = 256
    fs = np.geomspace(f0, f1, n // blk + 1)
    zi = None
    for i in range(0, n, blk):
        b, a = signal.iirpeak(fs[i // blk], 4.0, fs=SR)
        if zi is None:
            zi = signal.lfilter_zi(b, a) * 0
        seg, zi = signal.lfilter(b, a, src[i:i + blk], zi=zi)
        out[i:i + blk] = seg
    out *= np.sin(np.pi * tt / dur) ** 0.8
    out = lp(out, 2800) + 0.02 * bp(rng.normal(0, 1, n), 2500, 6000) * np.sin(np.pi * tt / dur)
    for _ in range(nb):
        f = rng.uniform(*bf)
        add(out, bubble(f, f * rng.uniform(1.8, 2.6), rng.uniform(0.008, 0.025), rng.uniform(0.15, 0.4)),
            int(rng.uniform(0.05, 0.9) * n))
    return out / (np.abs(out).max() + 1e-9)


def drip(fruit, r):
    """juice drop hitting the table: watery melon drops ring, peach nectar is dull and heavy."""
    size = np.clip((r - 0.006) / 0.03, 0, 1)
    base, ring, click_amp = dict(strawberry=(1300, 0.035, 0.2), watermelon=(1500, 0.05, 0.25),
                                 peach=(800, 0.02, 0.1), kiwi=(1200, 0.03, 0.18))[fruit]
    f0 = base - 500 * size
    x = _buf(0.15)
    add(x, click(6000, 0.002, click_amp + 0.2 * size))
    add(x, bubble(f0, f0 * 2.1, ring + 0.03 * size, 0.18 + 0.25 * size), _n(0.002))
    if fruit == "peach":
        add(x, thump(180, 110, 0.03, 0.12 + 0.1 * size))                     # thick, heavy splat
        x = lp(x, 3000)
    return x
