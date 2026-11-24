"""Music + SFX + mix for an ink video (numpy only).

usage: python3 tools/ink_audio.py videos_ink/giraffe
Reads voice.wav + timeline.json (+ optional sfx.json events) and writes mix.wav (48 kHz stereo):
an original light explainer score (marimba melody, soft pad, bass, shaker) ducked under the voice,
a whoosh on every cut, plus the scene SFX listed in sfx.json: [[time, kind], ...]
kinds: whoosh, pop, heart, hoof, tick, sting
"""
import json, math, sys, wave
import numpy as np

SR = 48000
d = sys.argv[1]
TL = json.load(open(f"{d}/timeline.json"))
EV = json.load(open(f"{d}/sfx.json")) if __import__("os").path.exists(f"{d}/sfx.json") else {"cuts": [], "events": []}
DUR = TL["duration"]
N = int(DUR * SR) + SR
rng = np.random.default_rng(7)


def read_wav(p):
    w = wave.open(p)
    sr, n, ch = w.getframerate(), w.getnframes(), w.getnchannels()
    x = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float32) / 32768
    if ch == 2:
        x = x.reshape(-1, 2).mean(1)
    if sr != SR:  # linear resample
        t = np.arange(int(len(x) * SR / sr)) * sr / SR
        x = np.interp(t, np.arange(len(x)), x).astype(np.float32)
    return x


def onepole(x, fc):
    a = math.exp(-2 * math.pi * fc / SR)
    y = np.empty_like(x)
    s = 0.0
    for i in range(len(x)):  # fine for short buffers
        s = (1 - a) * x[i] + a * s
        y[i] = s
    return y


def lp(x, fc):
    """fast one-pole low-pass via cumulative filtering in blocks (vectorised IIR approximation by FFT)"""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    H = 1 / np.sqrt(1 + (f / fc) ** 2)
    return np.fft.irfft(X * H, len(x)).astype(np.float32)


def env(n, a, r):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)


def note_hz(m):
    return 440 * 2 ** ((m - 69) / 12)


# ---------------- score ----------------
BPM = 100
beat = 60 / BPM
music = np.zeros((N, 2), np.float32)


def add(buf, t, sig, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= len(buf):
        return
    sig = sig[: len(buf) - i]
    l, r = math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4)
    buf[i : i + len(sig), 0] += sig * gain * l
    buf[i : i + len(sig), 1] += sig * gain * r


def marimba(m, dur=0.9):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = note_hz(m)
    return (np.sin(2 * np.pi * f * t) * env(n, 0.002, 0.35) + 0.25 * np.sin(2 * np.pi * f * 4 * t) * env(n, 0.001, 0.05)).astype(np.float32)


def pluck_bass(m, dur=0.8):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = note_hz(m)
    return (np.tanh(1.5 * np.sin(2 * np.pi * f * t)) * env(n, 0.005, 0.3)).astype(np.float32)


def pad(ms, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.zeros(n, np.float32)
    for m in ms:
        for det in (-0.08, 0.08):
            f = note_hz(m + det)
            s += (2 * ((f * t) % 1) - 1).astype(np.float32)
    s = lp(s, 900) / (len(ms) * 2)
    a = np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.6)
    return (s * a).astype(np.float32)


def shaker():
    n = int(0.08 * SR)
    x = rng.standard_normal(n).astype(np.float32)
    x = x - lp(x, 4000)
    return x * env(n, 0.003, 0.02).astype(np.float32)


# I - V - vi - IV in C (bars of 4 beats)
CH = [(48, [60, 64, 67]), (43, [59, 62, 67]), (45, [60, 64, 69]), (41, [60, 65, 69])]
MEL = [[72, None, 76, 74, 72, None, 67, None], [74, None, 71, None, 74, 76, 74, None], [76, None, 72, 74, 76, None, 79, None], [77, 76, 74, None, 72, None, None, None]]
bar = 4 * beat
nb = int(DUR / bar) + 2
for b in range(nb):
    t0 = b * bar
    root, tri = CH[b % 4]
    add(music, t0, pad(tri, bar + 0.6), 0.16)
    for k in range(4):
        add(music, t0 + k * beat, pluck_bass(root if k % 2 == 0 else root + 7), 0.22)
    if b >= 1:  # melody enters after the first bar
        for k, m in enumerate(MEL[b % 4]):
            if m:
                add(music, t0 + k * beat / 2, marimba(m), 0.2, pan=0.25 * math.sin(k))
    for k in range(8):
        add(music, t0 + k * beat / 2, shaker(), 0.09 if k % 2 else 0.05, pan=0.4)
# fade in / out
t = np.arange(N) / SR
fade = np.minimum(1, t / 1.5) * np.clip((DUR + 0.5 - t) / 2.5, 0, 1)
music *= fade[:, None]

# ---------------- voice + ducking ----------------
voice = read_wav(f"{d}/voice.wav")
vbuf = np.zeros(N, np.float32)
vbuf[: len(voice)] = voice[:N]
lvl = np.sqrt(lp(vbuf ** 2, 6) .clip(0))
duck = 1 - 0.6 * np.clip(lvl / 0.05, 0, 1)
duck = lp(duck, 3)
music *= duck[:, None]

# ---------------- SFX ----------------
sfx = np.zeros((N, 2), np.float32)


def whoosh(dur=0.45):
    n = int(dur * SR)
    x = rng.standard_normal(n).astype(np.float32)
    tt = np.arange(n) / n
    # sweep a band-pass by mixing two low-passes
    hi = lp(x, 3000) - lp(x, 300)
    e = np.sin(np.pi * tt) ** 2
    return (hi * e).astype(np.float32)


def pop():
    n = int(0.12 * SR)
    t2 = np.arange(n) / SR
    f = 500 + 900 * np.exp(-t2 / 0.02)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.04)).astype(np.float32)


def heart():
    out = np.zeros(int(0.5 * SR), np.float32)
    for k, g in ((0, 1.0), (0.16, 0.7)):
        n = int(0.15 * SR)
        t2 = np.arange(n) / SR
        s = np.sin(2 * np.pi * (55 + 25 * np.exp(-t2 / 0.03)) * t2) * env(n, 0.002, 0.05)
        i = int(k * SR)
        out[i : i + n] += s.astype(np.float32) * g
    return out


def hoof():
    n = int(0.1 * SR)
    t2 = np.arange(n) / SR
    s = np.sin(2 * np.pi * (90 + 60 * np.exp(-t2 / 0.01)) * t2) * env(n, 0.001, 0.025)
    nz = lp(rng.standard_normal(n).astype(np.float32), 1500) * env(n, 0.001, 0.015)
    return (s + 0.6 * nz).astype(np.float32)


def tick():
    n = int(0.03 * SR)
    x = rng.standard_normal(n).astype(np.float32)
    return (x - lp(x, 2500)) * env(n, 0.0005, 0.006).astype(np.float32)


def sting():
    n = int(1.0 * SR)
    t2 = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * note_hz(m) * t2) for m in (60, 63, 66)) / 3
    return (s * env(n, 0.01, 0.4)).astype(np.float32)


for c in EV.get("cuts", []):
    add(sfx, max(0, c - 0.18), whoosh(), 0.12, pan=0)
for tm, kind, *rest in EV.get("events", []):
    g = rest[0] if rest else 1.0
    if kind == "pop":
        add(sfx, tm, pop(), 0.35 * g)
    elif kind == "heart":
        add(sfx, tm, heart(), 0.8 * g)
    elif kind == "hoof":
        add(sfx, tm, hoof(), 0.45 * g, pan=0.2)
    elif kind == "tick":
        add(sfx, tm, tick(), 0.4 * g)
    elif kind == "sting":
        add(sfx, tm, sting(), 0.18 * g)
    elif kind == "whoosh":
        add(sfx, tm, whoosh(0.6), 0.2 * g)

# ---------------- mix ----------------
mix = music * 0.38 + sfx * 0.8
mix[:, 0] += vbuf
mix[:, 1] += vbuf
peak = np.abs(mix).max()
mix = mix / max(1.0, peak / 0.95)
y = (np.clip(mix[: int(DUR * SR)], -1, 1) * 32767).astype(np.int16)
w = wave.open(f"{d}/mix_raw.wav", "wb")
w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes(y.tobytes()); w.close()
print("mix_raw.wav", DUR, "s, peak", round(float(peak), 3))
