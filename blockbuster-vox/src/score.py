"""Original underscore, synthesized: one mood per chapter, crossfaded.

cold open: soft pads + clock tick       part 1: bright plucked arpeggios
part 2: curious minor plucks + hats     part 3: tense low ostinato
part 4: sombre pads + sparse piano      epilogue: reflective piano, fade out
"""
import numpy as np
from scipy.signal import fftconvolve

SR = 48000
BPM = 92
BEAT = 60 / BPM

def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)

NOTES = {n: i for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}

def chord(name, octave=4):
    """'Am' -> midi notes (root, third, fifth)."""
    minor = name.endswith("m")
    root = NOTES[name.rstrip("m")] + 12 * (octave + 1)
    return [root, root + (3 if minor else 4), root + 7]

def env(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e

def pluck(f, dur=0.6, bright=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = sum((1 / k ** 1.6) * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (4 + k * 2.5 / bright)) for k in range(1, 7))
    return x * env(n, 0.004, 0.05)

def piano(f, dur=2.2):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = sum((1 / k ** 1.3) * np.sin(2 * np.pi * f * k * (1 + 0.0004 * k * k) * t) * np.exp(-t * (1.2 + k * 0.9)) for k in range(1, 8))
    return x * env(n, 0.003, 0.3)

def pad(notes, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for m in notes:
        for det in (-0.004, 0.0, 0.004):
            f = hz(m) * (1 + det)
            x += np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)
    x *= 1 + 0.08 * np.sin(2 * np.pi * 0.3 * t)
    return x / (len(notes) * 3) * env(n, min(0.9, dur / 3), min(0.9, dur / 3))

def bass(f, dur=0.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.2 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 3) * env(n, 0.005, 0.05)

def kick():
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    f = 45 + 80 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 10)

def tick(seed):
    r = np.random.default_rng(seed)
    n = int(0.03 * SR)
    x = r.normal(0, 1, n) * np.exp(-np.arange(n) / SR * 300)
    return np.diff(np.concatenate([[0], x]))  # crude high-pass

def add(buf, x, t, g=1.0):
    k = int(t * SR)
    if k >= len(buf):
        return
    m = min(len(x), len(buf) - k)
    buf[k:k + m] += x[:m] * g

def section(kind, t0, t1, buf):
    rng = np.random.default_rng(int(t0 * 10))
    bar = BEAT * 4
    progs = {
        "open": ["Am", "F", "C", "G"], "p1": ["C", "G", "Am", "F"], "p2": ["Dm", "A#", "F", "C"],
        "p3": ["Em", "Em", "C", "B"], "p4": ["Am", "Em", "F", "C"], "epi": ["C", "G", "Am", "F"]}[kind]
    t, k = t0, 0
    while t < t1:
        ch = progs[k % 4]
        notes = chord(ch, 3 if kind in ("p3", "p4") else 4)
        if kind in ("open", "p4", "epi"):
            add(buf, pad(notes, bar + 0.8), t, 0.5)
        if kind == "open":
            for b in range(4):
                add(buf, tick(b + k), t + b * BEAT, 0.25)
            add(buf, bass(hz(notes[0] - 24), bar), t, 0.35)
        if kind == "p1":
            arp = [notes[0], notes[1], notes[2], notes[1] + 12, notes[2], notes[1], notes[0] + 12, notes[2]]
            for j, m in enumerate(arp):
                add(buf, pluck(hz(m), 0.5), t + j * BEAT / 2, 0.32)
            add(buf, bass(hz(notes[0] - 24), BEAT * 1.8), t, 0.5)
            add(buf, bass(hz(notes[0] - 24), BEAT * 1.8), t + 2 * BEAT, 0.4)
            add(buf, kick(), t, 0.35)
            add(buf, kick(), t + 2 * BEAT, 0.25)
        if kind == "p2":
            pat = [0, 2, 3, 5, 6]
            for j in pat:
                m = notes[j % 3] + (12 if j > 4 else 0)
                add(buf, pluck(hz(m), 0.35, bright=0.6), t + j * BEAT / 2, 0.3)
            for j in range(8):
                add(buf, tick(j + k * 8), t + j * BEAT / 2, 0.12 if j % 2 else 0.2)
            add(buf, bass(hz(notes[0] - 24), BEAT * 3), t, 0.5)
        if kind == "p3":
            for j in range(8):
                m = notes[0] - 12 + (3 if j in (3, 7) else 0)
                add(buf, pluck(hz(m), 0.4, bright=0.5), t + j * BEAT / 2, 0.4)
            add(buf, kick(), t, 0.4)
            add(buf, pad([notes[0] - 12, notes[0]], bar + 0.5), t, 0.35)
        if kind in ("p4", "epi"):
            mel = [notes[2] + 12, notes[1] + 12] if kind == "p4" else [notes[2] + 12, notes[1] + 12, notes[0] + 12]
            for j, m in enumerate(mel):
                add(buf, piano(hz(m)), t + j * BEAT * (2 if kind == "p4" else 1.3), 0.28)
            add(buf, bass(hz(notes[0] - 24), bar), t, 0.3)
        t += bar
        k += 1

def build(total, bounds):
    """bounds: list of (kind, start, end) seconds. Returns mono float array."""
    out = np.zeros(int((total + 3) * SR))
    for kind, a, b in bounds:
        buf = np.zeros_like(out)
        section(kind, a, b + 1.5, buf)
        # crossfade window
        w = np.zeros_like(out)
        ia, ib = int(a * SR), int(min(len(out), (b + 1.5) * SR))
        w[ia:ib] = 1
        f = int(1.5 * SR)
        w[ia:ia + f] = np.linspace(0, 1, f)[: len(w[ia:ia + f])]
        w[max(ia, ib - f):ib] *= np.linspace(1, 0, ib - max(ia, ib - f))
        out += buf * w
    # room reverb
    r = np.random.default_rng(9)
    n = int(1.8 * SR)
    ir = r.normal(0, 1, n) * np.exp(-np.arange(n) / SR * 3.2)
    ir = np.convolve(ir, np.ones(12) / 12, mode="same")
    wet = fftconvolve(out, ir)[: len(out)]
    wet /= np.abs(wet).max() + 1e-9
    out = out / (np.abs(out).max() + 1e-9) * 0.8 + wet * 0.3
    # gentle fade at the very end
    fe = int(4 * SR)
    end = int(total * SR)
    out[end - fe:end] *= np.linspace(1, 0, fe)
    out[end:] = 0
    return out
