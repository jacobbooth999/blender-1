"""ASMR track for the fruit compilation: no music, extra juicy mouth sounds, per-fruit textures.

Reads out/comp/events_*.json (written by short.py) -> out/comp/audio.wav
"""
import glob
import json
import math
import os
import wave

import numpy as np

import audio as AU
import fruit_sounds as FS
from audio import SR, add, bubble, click, crackle, squelch, thump, voice, lp, hp, bp, env_exp, compress, place

HERE = os.path.dirname(os.path.abspath(__file__))
rng = np.random.default_rng(7)


def spray(dur=0.18, amp=0.35):
    """fine juice spray: bright hiss with a fast decay and sparkly droplets."""
    n = int(dur * SR)
    x = hp(rng.normal(0, 1, n), 3500) * env_exp(n, dur / 4) * amp
    for _ in range(14):
        p = int(rng.uniform(0, 0.8) * n)
        add(x, bubble(rng.uniform(1800, 3000), rng.uniform(3200, 5200), rng.uniform(0.004, 0.009), 0.12), p)
    return x


def slurp(dur=0.42, amp=0.7):
    """sucking up the juice: rising resonant gurgle with flutter + bubbles."""
    n = int(dur * SR)
    tt = np.arange(n) / SR
    src = rng.normal(0, 1, n) * (0.6 + 0.4 * np.sin(2 * math.pi * rng.uniform(22, 32) * tt))
    out = np.zeros(n)
    blk = 256
    fs = np.geomspace(380, 1700, n // blk + 1)
    from scipy import signal
    zi = None
    for i in range(0, n, blk):
        b, a = signal.iirpeak(fs[i // blk], 4.0, fs=SR)
        if zi is None:
            zi = signal.lfilter_zi(b, a) * 0
        seg, zi = signal.lfilter(b, a, src[i:i + blk], zi=zi)
        out[i:i + blk] = seg
    out *= np.sin(np.pi * tt / dur) ** 0.8
    out += 0.12 * hp(rng.normal(0, 1, n), 2500) * np.sin(np.pi * tt / dur)  # air
    for _ in range(18):
        p = int(rng.uniform(0.05, 0.9) * n)
        f0 = rng.uniform(500, 1200)
        add(out, bubble(f0, f0 * rng.uniform(1.8, 2.6), rng.uniform(0.008, 0.02), rng.uniform(0.15, 0.4)), p)
    return amp * out / (np.abs(out).max() + 1e-9)


def smack(amp=0.55):
    """wet lip smack after a mouthful: part-click, a little bubble burst and a soft pop."""
    x = np.zeros(int(0.18 * SR))
    add(x, click(3200, 0.003, 0.5))
    add(x, squelch(0.07, 1500, 900, 0.5, 5), int(0.004 * SR))
    add(x, click(2200, 0.004, 0.35), int(0.06 * SR))
    add(x, bubble(700, 1600, 0.025, 0.35), int(0.062 * SR))
    add(x, thump(160, 90, 0.04, 0.15), int(0.06 * SR))
    return amp * x


def juicy_chomp(big, P):
    AU.P = P
    x = AU.chomp(big)
    add(x, spray(0.2 * (1.2 if big else 1), 0.18 * P["juice"]), int(0.03 * SR))
    add(x, squelch(0.22, 300 * P["pitch"], 900 * P["pitch"], 0.6 * P["juice"], 16), int(0.12 * SR))
    return x


def juicy_chew(i, full, P):
    AU.P = P
    x = AU.chew(i, full)
    # second wetter layer: low thick squish with lots of tiny bubbles
    y = squelch(len(x) / SR * 0.9, 260 * P["pitch"], 700 * P["pitch"], 0.45 * P["juice"],
                int(rng.integers(10, 18) * P["juice"]))
    add(x, y, int(0.01 * SR))
    if rng.random() < 0.5:
        add(x, click(rng.uniform(2500, 4000), 0.003, 0.3), int(rng.uniform(0.05, 0.15) * SR))
    return x


def giggle():
    x = np.zeros(int(0.5 * SR))
    add(x, voice(0.11, [620, 680], [(800, 6, 1.0), (1400, 7, 0.5), (2900, 9, 0.12)], amp=0.16))
    add(x, voice(0.13, [680, 760, 700], [(800, 6, 1.0), (1400, 7, 0.5), (2900, 9, 0.12)], amp=0.18),
        int(0.16 * SR))
    return x


def main():
    files = sorted(glob.glob(os.path.join(HERE, "out", "comp", "events_*.json")))
    events = []
    for f in files:
        events += json.load(open(f))["events"]
    dur = 4 * 8.25
    N = int((dur + 0.5) * SR)
    dry = np.zeros((2, N))
    for e in events:
        P = AU.PROFILES[e["fruit"]]
        AU.P = P
        k, g, pan = e["kind"], 1.0, 0.0
        if k == "chomp":
            x = FS.bite(e["fruit"], e.get("big", False))
            g = dict(strawberry=1.0, watermelon=1.0, peach=1.3, kiwi=1.1)[e["fruit"]]
        elif k == "chew":
            x, g, pan = FS.chew(e["fruit"], e["i"], e.get("full", False)), \
                dict(strawberry=1.5, watermelon=1.4, peach=2.3, kiwi=1.6)[e["fruit"]], 0.18 * (1 if e["i"] % 2 else -1)
        elif k == "slurp":
            x = FS.slurp(e["fruit"])
            g = dict(strawberry=0.45, watermelon=0.55, peach=0.6, kiwi=0.35)[e["fruit"]]
        elif k == "smack":
            x, g = smack(), 0.8
        elif k == "drip":
            x, g, pan = FS.drip(e["fruit"], e["r"]), 0.9, rng.uniform(-0.6, 0.6)
        elif k == "giggle":
            x, g = giggle(), 0.7
        elif k == "mmm":
            x, g = voice(1.0, [330, 370, 430, 400, 330], [(260, 5, 1.0), (2300, 8, 0.15)], amp=0.3, nasal=True), 0.9
        else:
            x, g = AU.cue(k, e)
        if x is None:
            continue
        place(dry, x, e["t"], g, pan)
    # tiny close room so it feels intimate, faint room tone, no music
    from scipy import signal
    ir_n = int(0.2 * SR)
    ir = rng.normal(0, 1, (2, ir_n)) * env_exp(ir_n, 0.035)
    wet = np.stack([signal.fftconvolve(dry[c], lp(ir[c], 6000))[:N] for c in range(2)])
    wet *= 0.1 * np.abs(dry).max() / (np.abs(wet).max() + 1e-9)
    fx = dry + wet
    fx = fx / (np.abs(fx).max() + 1e-9)
    fx = compress(fx, -26, 4.0)
    fx = fx / (np.abs(fx).max() + 1e-9)
    mix = fx + lp(rng.normal(0, 1, (2, N)), 2500) * 0.002
    mix = hp(mix, 35)
    mix = np.tanh(mix * 1.4) / np.tanh(1.4)
    mix = mix / np.abs(mix).max() * 10 ** (-1 / 20)
    fi, fo = int(0.05 * SR), int(0.6 * SR)
    mix[:, :fi] *= np.linspace(0, 1, fi)
    mix[:, -fo:] *= np.linspace(1, 0, fo)
    out = (mix.T * 32767).astype(np.int16)
    path = os.path.join(HERE, "out", "comp", "audio.wav")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(out.tobytes())
    print("WROTE", path, len(events), "events from", len(files), "segments")


if __name__ == "__main__":
    main()
