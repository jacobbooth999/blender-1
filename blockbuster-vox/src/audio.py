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
    for i, d in enumerate(durs):
        vp = os.path.join(vdir, f"B{i + 1:03d}.wav")
        if os.path.exists(vp):
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
    out = mix_v * 1.0 + mix_s * 0.55 + room
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
