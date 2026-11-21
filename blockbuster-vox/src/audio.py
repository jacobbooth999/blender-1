"""Synthesize paper SFX, lay narration per beat, mix, and mux the final video.

python3 audio.py            # builds build/mix.wav and out/blockbuster_vox.mp4
"""
import os, sys, json, subprocess, wave
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from render import beats, durations, BUILD, SEG, ROOT

SR = 48000
rng = np.random.default_rng(3)

def band(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x))

def env(n, a, d):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d)
    return e

def sfx(kind):
    if kind == "slide":
        n = int(0.22 * SR)
        x = band(rng.normal(0, 1, n), 900, 6000) * env(n, 0.09, 0.05)
        return 0.22 * x / (np.abs(x).max() + 1e-9)
    if kind == "tap":
        n = int(0.09 * SR)
        t = np.arange(n) / SR
        x = np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.018) + band(rng.normal(0, 1, n), 1500, 7000) * np.exp(-t / 0.006) * 0.6
        return 0.3 * x / np.abs(x).max()
    if kind == "stamp":
        n = int(0.22 * SR)
        t = np.arange(n) / SR
        x = np.sin(2 * np.pi * 85 * t) * np.exp(-t / 0.05) + band(rng.normal(0, 1, n), 200, 3000) * np.exp(-t / 0.02) * 0.8
        return 0.55 * x / np.abs(x).max()
    if kind == "tape":
        n = int(0.3 * SR)
        x = np.zeros(n)
        for _ in range(60):
            k = rng.integers(0, n - 200)
            x[k:k + 120] += rng.normal(0, 1, 120) * np.exp(-np.arange(120) / 30)
        x = band(x, 1200, 9000) * env(n, 0.02, 0.15)
        return 0.18 * x / (np.abs(x).max() + 1e-9)
    if kind in ("pin", "tick"):
        n = int(0.04 * SR)
        t = np.arange(n) / SR
        f = 2400 if kind == "pin" else 3600
        x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.006) + rng.normal(0, 1, n) * np.exp(-t / 0.002) * 0.3
        return (0.16 if kind == "pin" else 0.07) * x / np.abs(x).max()
    if kind in ("thread", "marker"):
        n = int(0.4 * SR)
        lo, hi = (2000, 7000) if kind == "thread" else (2500, 6000)
        x = band(rng.normal(0, 1, n), lo, hi)
        mod = 0.6 + 0.4 * np.sin(np.arange(n) / SR * 2 * np.pi * (9 if kind == "marker" else 4))
        x = x * mod * env(n, 0.05, 0.25)
        return (0.07 if kind == "thread" else 0.09) * x / np.abs(x).max()
    if kind == "tear":
        n = int(0.4 * SR)
        x = np.zeros(n)
        for _ in range(140):
            k = rng.integers(0, n - 300)
            x[k:k + 200] += rng.normal(0, 1, 200) * np.exp(-np.arange(200) / 40)
        x = band(x, 500, 8000) * env(n, 0.05, 0.2)
        return 0.3 * x / np.abs(x).max()
    if kind == "whoosh":
        n = int(0.5 * SR)
        x = rng.normal(0, 1, n)
        parts = [band(x, lo, hi) * np.exp(-((np.arange(n) / SR - c) / 0.09) ** 2) for lo, hi, c in ((300, 1200, 0.12), (800, 3000, 0.22), (2000, 7000, 0.32))]
        x = sum(parts)
        return 0.28 * x / np.abs(x).max()
    if kind == "riser":  # chapter impact: low boom + airy tail
        n = int(1.2 * SR)
        t = np.arange(n) / SR
        boom = np.sin(2 * np.pi * (40 + 30 * np.exp(-t * 8)) * t) * np.exp(-t * 3.5)
        air = band(rng.normal(0, 1, n), 2000, 9000) * np.exp(-t * 4) * 0.25
        x = boom + air
        return 0.5 * x / np.abs(x).max()
    return np.zeros(10)

def read_wav(p):
    with wave.open(p) as w:
        sr, ch, n = w.getframerate(), w.getnchannels(), w.getnframes()
        a = np.frombuffer(w.readframes(n), np.int16).astype(np.float32) / 32768
    if ch > 1:
        a = a.reshape(-1, ch).mean(1)
    if sr != SR:
        a = np.interp(np.arange(int(len(a) * SR / sr)) * sr / SR, np.arange(len(a)), a)
    return a

def main():
    durs = durations()
    total = sum(durs)
    mix_v = np.zeros(int((total + 1) * SR))
    mix_s = np.zeros_like(mix_v)
    t0 = 0.0
    vdir = os.path.join(ROOT, "narration", "voice")
    cache = {}
    full_vp = os.path.join(vdir, "full.wav")
    if os.path.exists(full_vp):  # continuous sentence-level narration
        v = read_wav(full_vp)
        mix_v[:min(len(v), len(mix_v))] += v[:len(mix_v)]
    for i, d in enumerate(durs):
        vp = os.path.join(vdir, f"B{i + 1:03d}.wav")
        if os.path.exists(vp) and not os.path.exists(full_vp):
            v = read_wav(vp)
            k = int((t0 + 0.08) * SR)
            mix_v[k:k + len(v)] += v[:len(mix_v) - k]
        ep = os.path.join(SEG, f"B{i + 1:03d}.sfx.json")
        if os.path.exists(ep):
            for (t, kind) in json.load(open(ep)):
                if kind not in cache:
                    cache[kind] = [sfx(kind) for _ in range(4)]
                s = cache[kind][rng.integers(0, 4)] * rng.uniform(0.8, 1.1)
                k = int((t0 + t) * SR)
                mix_s[k:k + len(s)] += s[:len(mix_s) - k]
        t0 += d
    room = band(rng.normal(0, 1, len(mix_v)), 60, 900)
    room = room / np.abs(room).max() * 0.004
    music = np.zeros_like(mix_v)
    if "--no-music" not in sys.argv:
        import score
        starts = np.concatenate([[0], np.cumsum(durs)])
        marks = [(1, "open"), (8, "p1"), (28, "p2"), (48, "p3"), (58, "p4"), (72, "epi")]
        bounds = [(k, starts[b - 1], starts[marks[j + 1][0] - 1] if j + 1 < len(marks) else total) for j, (b, k) in enumerate(marks)]
        m = score.build(total, bounds)[: len(mix_v)]
        music[: len(m)] = m
        # duck under the voice
        hop = 480
        e = np.sqrt(np.convolve(mix_v ** 2, np.ones(hop * 5) / (hop * 5), mode="same"))
        e = np.clip(e / (e.max() + 1e-9) * 4, 0, 1)
        sm = np.zeros_like(e)
        a_, r_ = 1 - np.exp(-1 / (0.05 * SR)), 1 - np.exp(-1 / (0.4 * SR))
        # one-pole follower on a decimated envelope for speed
        ed = e[::hop]
        sd = np.zeros_like(ed)
        for k in range(1, len(ed)):
            c = 0.5 if ed[k] > sd[k - 1] else 0.08
            sd[k] = sd[k - 1] + (ed[k] - sd[k - 1]) * c
        sm = np.interp(np.arange(len(e)), np.arange(len(sd)) * hop, sd)
        music = music * (1 - 0.5 * sm) * 0.3
    out = mix_v * 1.0 + mix_s * 0.55 + room + music
    out = out / max(1.0, np.abs(out).max() / 0.95)
    pcm = (np.clip(out, -1, 1) * 32767).astype(np.int16)
    wp = os.path.join(BUILD, "mix.wav")
    with wave.open(wp, "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    lst = os.path.join(BUILD, "concat.txt")
    with open(lst, "w") as f:
        for i in range(len(durs)):
            f.write(f"file '{os.path.join(SEG, f'B{i + 1:03d}.mp4')}'\n")
    os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
    vid = os.path.join(BUILD, "video.mp4")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", vid], check=True)
    final = os.path.join(ROOT, "out", "blockbuster_vox.mp4")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", vid, "-i", wp, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
                    "-ar", "48000", "-shortest", "-movflags", "+faststart", final], check=True)
    print("wrote", final, f"{total:.1f}s")

if __name__ == "__main__":
    main()
