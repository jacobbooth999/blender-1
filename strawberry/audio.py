"""ASMR-style sound design, synthesized from scratch and synced to out/events.json.

Run: python3 audio.py  -> out/audio.wav (48 kHz stereo)
"""
import json
import math
import os
import wave

import numpy as np
from scipy import signal

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
rng = np.random.default_rng(42)
# per-fruit texture: crunch amount, squelch (juiciness), squelch pitch, residual chew crunch, seed crackle
PROFILES = dict(
    strawberry=dict(crunch=1.0, juice=1.0, pitch=1.0, chewcrunch=1.0, seeds=0.0),
    peach=dict(crunch=0.3, juice=1.45, pitch=0.8, chewcrunch=0.2, seeds=0.0),
    watermelon=dict(crunch=1.5, juice=1.35, pitch=1.1, chewcrunch=1.6, seeds=0.0),
    kiwi=dict(crunch=0.45, juice=1.2, pitch=0.95, chewcrunch=0.3, seeds=1.0),
)
P = PROFILES["strawberry"]


def t_(dur):
    return np.arange(int(dur * SR)) / SR


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype="high", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype="low", fs=SR, output="sos"), x)


def reson(x, f, q):
    b, a = signal.iirpeak(f, q, fs=SR)
    return signal.lfilter(b, a, x)


def env_exp(n, tau):
    return np.exp(-np.arange(n) / SR / tau)


def adsr(n, a=0.005, r=0.05):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


# ----------------------------------------------------------------------------- sound atoms
def click(f=4000, dur=0.004, amp=1.0):
    n = int(dur * SR)
    x = rng.normal(0, 1, n) * env_exp(n, dur / 4)
    return amp * bp(x, f * 0.6, min(f * 1.6, 20000))


def bubble(f0=700, f1=1500, dur=0.03, amp=0.5):
    """wet bubble pop: rising sine burst (the classic drip/squelch resonance)."""
    tt = t_(dur)
    f = f0 + (f1 - f0) * (tt / dur) ** 0.5
    ph = 2 * math.pi * np.cumsum(f) / SR
    return amp * np.sin(ph) * env_exp(len(tt), dur / 3.5) * adsr(len(tt), 0.0008, 0.004)


def crackle(dur, density, lo=2500, hi=12000, amp=1.0, decay=None):
    """dense micro-crackles: the crisp 'crunch' texture."""
    n = int(dur * SR)
    x = np.zeros(n)
    k = int(density * dur)
    pos = rng.integers(0, n, k)
    gains = rng.pareto(2.2, k) * 0.25
    x[pos] += gains * rng.choice([-1, 1], k)
    x = bp(x, lo, hi)
    # each impulse rings a tiny bit
    x = x + 0.4 * reson(x, rng.uniform(3000, 6000), 6)
    e = np.ones(n) if decay is None else env_exp(n, decay)
    return amp * x * e * adsr(n, 0.001, 0.02)


def squelch(dur, f0=500, f1=1300, amp=0.5, bubbles=8):
    """wet squish: swept resonant noise + a cluster of tiny bubbles."""
    n = int(dur * SR)
    tt = np.arange(n) / SR
    x = rng.normal(0, 1, n)
    out = np.zeros(n)
    # sweep resonance in blocks
    blk = 256
    fs = np.linspace(f0, f1, n // blk + 1)
    zi = None
    for i in range(0, n, blk):
        b, a = signal.iirpeak(fs[i // blk], 3.0, fs=SR)
        if zi is None:
            zi = signal.lfilter_zi(b, a) * 0
        seg, zi = signal.lfilter(b, a, x[i:i + blk], zi=zi)
        out[i:i + blk] = seg
    e = np.sin(np.pi * np.clip(tt / dur, 0, 1)) ** 1.5
    out = out * e * 0.6
    for _ in range(bubbles):
        p = int(rng.uniform(0, 0.85) * n)
        bb = bubble(rng.uniform(500, 1100), rng.uniform(1300, 2600), rng.uniform(0.008, 0.02), rng.uniform(0.1, 0.35))
        add(out, bb, p)
    return amp * out


def thump(f0=110, f1=60, dur=0.12, amp=0.6):
    tt = t_(dur)
    f = f0 + (f1 - f0) * tt / dur
    ph = 2 * math.pi * np.cumsum(f) / SR
    return amp * np.sin(ph) * env_exp(len(tt), dur / 3) * adsr(len(tt), 0.002, 0.01)


def voice(dur, f0_curve, formants, amp=0.3, breath=0.04, nasal=False):
    """tiny cute voice: glottal pulse train through formant resonators."""
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f0 = np.interp(tt, np.linspace(0, dur, len(f0_curve)), f0_curve)
    f0 = f0 * (1 + 0.012 * np.sin(2 * math.pi * 5.5 * tt))  # vibrato
    ph = np.cumsum(f0) / SR
    saw = 2 * (ph % 1) - 1
    src = lp(saw, 4000) + breath * rng.normal(0, 1, n)
    out = np.zeros(n)
    for f, q, g in formants:
        out += g * reson(src, f, q)
    if nasal:
        out = lp(out, 1800) + 0.15 * reson(src, 250, 4)
    e = adsr(n, 0.05, min(0.25, dur * 0.4))
    return amp * out / (np.abs(out).max() + 1e-9) * e


def chime(f, dur=1.6, amp=0.12):
    tt = t_(dur)
    x = sum(g * np.sin(2 * math.pi * f * m * tt) * np.exp(-tt * d) for m, g, d in
            ((1, 1, 2.5), (2.01, 0.4, 4), (3.98, 0.15, 7)))
    return amp * x * adsr(len(tt), 0.003, 0.3)


def add(x, y, o=0):
    m = min(len(y), len(x) - o)
    if m > 0:
        x[o:o + m] += y[:m]
    return x


# ----------------------------------------------------------------------------- composite cues
def chomp(big=False):
    k = 1.35 if big else 1.0
    dur = 0.32 * k
    n = int((dur + 0.4) * SR)
    x = np.zeros(n)
    add(x, click(5000, 0.004, 1.2))
    add(x, thump(140, 70, 0.03, 0.5))
    c = crackle(dur, 2600 * k * max(0.3, P["crunch"]), amp=1.6 * P["crunch"], decay=dur / 2.2 * (1 + 0.3 * P["crunch"]))
    add(x, c)
    c2 = crackle(dur * 0.8, 900, lo=900, hi=4000, amp=0.9 * P["crunch"], decay=dur / 2.5)
    add(x, c2, int(0.01 * SR))
    s = squelch(0.28 * k * (0.8 + 0.3 * P["juice"]), 450 * P["pitch"], 1400 * P["pitch"], amp=0.9 * P["juice"],
                bubbles=int(14 * P["juice"]))
    o = int(0.06 * SR)
    add(x, s, o)
    th = thump(95, 55, 0.12, 0.55)
    add(x, th)
    return x


def chew(i, full=False):
    dur = rng.uniform(0.2, 0.28) * (1.15 if full else 1)
    lo, hi = (380, 1000) if full else (520, 1400)
    if i % 2:
        lo, hi = hi * 0.9, lo * 1.1  # alternate open/close sweeps
    x = squelch(dur, lo * P["pitch"], hi * P["pitch"], amp=0.55 * P["juice"],
                bubbles=int(rng.integers(6, 12) * P["juice"]))
    # a few residual crunchy bits early in each chewing run
    if i < 4 and P["chewcrunch"] > 0:
        c = crackle(dur * 0.7, 700 * (4 - i) * P["chewcrunch"], amp=0.6 * (4 - i) / 4 * min(1.3, P["chewcrunch"]),
                    decay=dur / 3)
        add(x, c)
    if P["seeds"]:
        c = crackle(dur * 0.8, 260, lo=5000, hi=14000, amp=0.35 * P["seeds"], decay=dur / 2)
        add(x, c)
    # wet tongue clicks
    for _ in range(int(rng.integers(1, 4))):
        p = int(rng.uniform(0.1, 0.9) * len(x))
        cl = click(rng.uniform(2500, 4500), 0.003, 0.25)
        add(x, cl[: len(x) - p], p)
    return x


def drip(r):
    size = np.clip((r - 0.006) / 0.03, 0, 1)
    f0 = 1300 - 600 * size
    x = np.zeros(int(0.12 * SR))
    cl = click(6000, 0.002, 0.15 + 0.2 * size)
    add(x, cl)
    b = bubble(f0, f0 * 2.1, 0.035 + 0.03 * size, 0.18 + 0.25 * size)
    o = int(0.002 * SR)
    add(x, b, o)
    return x


def cue(kind, e):
    if kind == "chomp":
        return chomp(e.get("big", False)), 1.0
    if kind == "chew":
        return chew(e["i"], e.get("full", False)), 0.9
    if kind == "drip":
        return drip(e["r"]), 0.8
    if kind == "mouth_open":
        x = np.zeros(int(0.25 * SR))
        s = squelch(0.12, 1400, 700, amp=0.35, bubbles=5)  # lips parting, wet "tch"
        add(x, s)
        cl = click(3500, 0.003, 0.3)
        add(x, cl)
        return x, 0.7
    if kind == "pick":
        x = squelch(0.08, 900, 1500, 0.25, 3)
        return np.concatenate([x, np.zeros(2000)]) + 0, 0.6
    if kind == "cap":
        x = np.zeros(int(0.15 * SR))
        c = crackle(0.05, 1200, 1500, 7000, 0.5, 0.015)
        add(x, c)
        th = thump(200, 120, 0.04, 0.2)
        add(x, th)
        return x, 0.7
    if kind == "gulp":
        x = np.zeros(int(0.35 * SR))
        g = thump(240, 90, 0.18, 0.6)
        add(x, lp(g, 900))
        b = bubble(300, 700, 0.06, 0.4)
        add(x, b, int(0.03 * SR))
        cl = click(2500, 0.004, 0.25)
        add(x, cl)
        return x, 0.9
    if kind == "hop":
        return squelch(0.09, 700, 1600, 0.2, 2), 0.5
    if kind == "land":
        x = np.zeros(int(0.2 * SR))
        th = thump(90, 50, 0.12, 0.5)
        add(x, th)
        s = squelch(0.12, 1200, 500, 0.4, 6)
        add(x, s)
        return x, 0.8
    if kind == "mmm":
        v = voice(1.3, [330, 360, 420, 400, 330], [(260, 5, 1.0), (2300, 8, 0.15)], amp=0.32, nasal=True)
        tail = np.zeros(int(0.4 * SR))
        x = np.concatenate([v, tail])
        ch = chime(1568, amp=0.06)
        add(x, ch, int(0.25 * SR))
        ch = chime(2093, amp=0.05)
        add(x, ch, int(0.45 * SR))
        return x, 0.9
    if kind == "ooh":
        return voice(0.5, [420, 470, 560], [(500, 6, 1.0), (900, 7, 0.5), (2600, 9, 0.12)], amp=0.25), 0.8
    return None, 0


def compress(x, thr_db=-26, ratio=4.0, att=0.002, rel=0.09):
    lvl = np.abs(x).max(0)
    a, r = math.exp(-1 / (att * SR)), math.exp(-1 / (rel * SR))
    env = signal.lfilter([1 - r], [1, -r], lvl)  # smooth release
    env = np.maximum(env, signal.lfilter([1 - a], [1, -a], lvl))
    db = 20 * np.log10(env + 1e-9)
    over = np.maximum(0, db - thr_db)
    gain = 10 ** (-over * (1 - 1 / ratio) / 20)
    return x * gain


def music(N, duck):
    """very soft music-box lullaby + warm pad, ducked under the eating sounds."""
    bpm = 84
    beat = 60 / bpm
    scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]
    melody = [0, 2, 4, 2, 3, 2, 1, -1, 0, 2, 4, 5, 4, 3, 2, -1, 2, 1, 0, 1, 2, 4, 3, -1, 4, 3, 2, 1, 0, -1, 0, -1]
    chords = [(261.63, 329.63, 392.0), (220.0, 261.63, 329.63), (174.61, 220.0, 261.63), (196.0, 246.94, 293.66)]
    out = np.zeros((2, N))
    k = 0
    t = 0.0
    while t * SR < N - SR:
        m = melody[k % len(melody)]
        if m >= 0:
            x = chime(scale[m], 1.4, 0.05)
            place(out, x, t, 1.0, pan=0.25 * math.sin(k))
        t += beat
        k += 1
    bar = beat * 4
    for i in range(int(N / SR / bar) + 1):
        ch = chords[i % 4]
        tt = t_(bar * 1.05)
        x = sum(np.sin(2 * math.pi * f * tt) + 0.3 * np.sin(2 * math.pi * f * 2.003 * tt) for f in ch)
        x = lp(x, 900) * 0.012 * np.sin(np.pi * np.clip(tt / (bar * 1.05), 0, 1)) ** 0.7
        place(out, x, i * bar, 1.0)
    return out * duck


def place(buf, x, t, gain, pan=0.0, width=0.0004):
    """pan in [-1,1]; tiny inter-channel delay for intimate binaural width."""
    i = int(t * SR)
    if i >= buf.shape[1] or x is None:
        return
    gl = math.cos((pan + 1) * math.pi / 4) * 1.41
    gr = math.sin((pan + 1) * math.pi / 4) * 1.41
    d = int(abs(pan) * width * SR)
    for ch, g, dd in ((0, gl, d if pan > 0 else 0), (1, gr, d if pan < 0 else 0)):
        j = i + dd
        m = min(len(x), buf.shape[1] - j)
        if m > 0:
            buf[ch, j:j + m] += gain * g * x[:m]


def main():
    global P
    import sys
    fruit = sys.argv[1] if len(sys.argv) > 1 else "strawberry"
    P = PROFILES[fruit]
    odir = os.path.join(HERE, "out") if fruit == "strawberry" else os.path.join(HERE, "out", fruit)
    ev = json.load(open(os.path.join(odir, "events.json")))
    dur = ev["dur"]
    N = int((dur + 0.5) * SR)
    dry = np.zeros((2, N))
    for e in ev["events"]:
        x, g = cue(e["kind"], e)
        if x is None:
            continue
        pan = 0.0
        if e["kind"] == "drip":
            pan = rng.uniform(-0.6, 0.6)
        elif e["kind"] == "chew":
            pan = 0.18 * (1 if e["i"] % 2 else -1)
        place(dry, x, e["t"], g, pan)
    # cute little voice reactions while admiring the berry
    place(dry, voice(0.6, [480, 560, 520, 600], [(700, 6, 1.0), (1200, 7, 0.5), (2800, 9, 0.12)], amp=0.2), 8.1, 0.8)
    place(dry, voice(0.45, [520, 640], [(450, 6, 1.0), (850, 7, 0.5)], amp=0.18), 9.4, 0.8)
    place(dry, voice(0.35, [600, 700, 660], [(300, 5, 1.0), (2300, 8, 0.15)], amp=0.2, nasal=True), 11.0, 0.8)
    # gentle room: short decaying noise IR, low mix (keeps it close-mic intimate)
    ir_n = int(0.25 * SR)
    ir = rng.normal(0, 1, (2, ir_n)) * env_exp(ir_n, 0.05)
    ir = np.stack([lp(ir[0], 6000), lp(ir[1], 6000)])
    wet = np.stack([signal.fftconvolve(dry[c], ir[c])[:N] for c in range(2)])
    wet *= 0.12 / (np.abs(wet).max() + 1e-9) * np.abs(dry).max()
    room = lp(rng.normal(0, 1, (2, N)), 2500) * 0.0025  # faint room tone
    fx = dry + wet
    fx = fx / (np.abs(fx).max() + 1e-9)
    fx = compress(fx, -24, 4.0)
    fx = fx / (np.abs(fx).max() + 1e-9)
    # duck the music whenever the mouth sounds are busy
    lvl = signal.lfilter([1 - math.exp(-1 / (0.25 * SR))], [1, -math.exp(-1 / (0.25 * SR))], np.abs(fx).max(0))
    duck = 1 / (1 + 25 * lvl)
    mus = music(N, duck)
    mix = fx + mus * 1.0 + room
    mix = hp(mix, 30)
    mix = np.tanh(mix * 1.3) / np.tanh(1.3)
    mix = mix / np.abs(mix).max() * 10 ** (-1 / 20)
    # fade in/out
    fi, fo = int(0.3 * SR), int(0.8 * SR)
    mix[:, :fi] *= np.linspace(0, 1, fi)
    mix[:, -fo:] *= np.linspace(1, 0, fo)
    out = (mix.T * 32767).astype(np.int16)
    path = os.path.join(odir, "audio.wav")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(out.tobytes())
    print("WROTE", path, len(ev["events"]), "events")


if __name__ == "__main__":
    main()
