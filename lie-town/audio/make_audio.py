# Original synthesized score + SFX for "Lie Town", mixed under the narration -> mix.wav (48 kHz stereo).
# Score sections follow the story: playful town (0-23.8), rainy night tension (23.8-43.8), suspense build to the
# dam burst (43.8-59.5), impact + flood (59.5-64.2), warm heroic ending (64.2-end).
import json, os
import numpy as np, soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
SR = 48000
words = json.load(open(os.path.join(ROOT, 'voice/words.json')))
DUR = words['duration']; N = int(DUR * SR)
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR

def env(n, a=.005, d=.3, s=0., r=.05, sus=None):
    n = int(n); e = np.zeros(n); A = int(a * SR); D = int(d * SR); R = int(r * SR)
    A = min(A, n); e[:A] = np.linspace(0, 1, A, endpoint=False)
    k = min(n, A + D); e[A:k] = np.linspace(1, s, k - A, endpoint=False) if k > A else []
    e[k:] = s
    if R and n > R: e[-R:] *= np.linspace(1, 0, R)
    return e
def note(f): return 440 * 2 ** ((f - 69) / 12)
def add(buf, x, at, gain=1.):
    i = int(at * SR); j = min(len(buf), i + len(x))
    if i < 0 or i >= len(buf): return
    buf[i:j] += x[:j - i] * gain
def lp(x, a):  # one-pole low-pass, a in (0,1)
    y = np.empty_like(x); acc = 0.
    for i in range(len(x)): acc += a * (x[i] - acc); y[i] = acc
    return y
def lpf(x, cutoff):  # FFT brickwall-ish low-pass (fast)
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / (1 + (f / cutoff) ** 4); return np.fft.irfft(X, len(x))
def hpf(x, cutoff):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / (1 + (cutoff / np.maximum(f, 1)) ** 4); return np.fft.irfft(X, len(x))
def bpf(x, lo, hi): return hpf(lpf(x, hi), lo)

# ---------------- instruments ----------------
def pluck(f, dur=.5, bright=.6):
    n = int(dur * SR); t = np.arange(n) / SR
    x = sum((bright ** (k - 1)) * np.sin(2 * np.pi * f * k * t) / k for k in range(1, 6))
    return x * np.exp(-t * 6) * env(n, .002, dur, 0, .02)
def piano(f, dur=1.2, vel=1.):
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 3) + .2 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 5)
    return vel * x * np.exp(-t * 2.2) * env(n, .003, dur, 0, .08)
def pad(f, dur, bright=.4):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for dt in (-.12, 0, .11):
        ph = 2 * np.pi * f * (1 + dt / 100) * t
        x += np.sin(ph) + bright * .5 * np.sin(2 * ph) + bright * .25 * np.sin(3 * ph)
    return x / 3 * env(n, .6, .1, 1, .8)
def bass(f, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t)) * env(n, .01, .25, .6, .08)
def kick(gain=1.):
    n = int(.35 * SR); t = np.arange(n) / SR
    return gain * np.sin(2 * np.pi * (45 + 90 * np.exp(-t * 30)) * t) * np.exp(-t * 9)
def snare():
    n = int(.25 * SR); t = np.arange(n) / SR
    return (rng.standard_normal(n) * .6 + np.sin(2 * np.pi * 190 * t) * .5) * np.exp(-t * 18)
def hat(open_=False):
    n = int((.18 if open_ else .05) * SR); return hpf(rng.standard_normal(n), 7000) * np.exp(-np.arange(n) / SR * (14 if open_ else 60))
def shaker():
    n = int(.08 * SR); return hpf(rng.standard_normal(n), 5000) * env(n, .02, .06, 0, .01) * .5

music = np.zeros((N, 2))
def addm(x, at, g=1., pan=0.):
    add(music[:, 0], x, at, g * (1 - pan) ** .5 if pan > 0 else g)
    add(music[:, 1], x, at, g * (1 + pan) ** .5 if pan < 0 else g)

# ---- section A: playful town, C major, 104 bpm ----
bpm = 104; beat = 60 / bpm
prog = [(60, [60, 64, 67]), (67, [55, 59, 62]), (69, [57, 60, 64]), (65, [53, 57, 60])]  # C G Am F
t = 0.0; bar = 0
while t < 23.6:
    root, ch = prog[bar % 4]
    for b in range(4):
        tb = t + b * beat
        if tb > 23.6: break
        addm(bass(note(root - 24), beat * .9), tb, .35)
        for k, off in enumerate([0, .5]):
            n_ = ch[(b * 2 + k) % 3] + 12
            addm(pluck(note(n_), .35), tb + off * beat, .16, pan=-.3 if k else .3)
        if b in (0, 2): addm(kick(.8), tb, .35)
        if b in (1, 3): addm(snare(), tb, .07)
        addm(shaker(), tb + beat * .5, .12)
    # little melody bell every 2 bars
    if bar % 2 == 0:
        for i, n_ in enumerate([ch[2] + 12, ch[1] + 12, ch[2] + 14, ch[0] + 24]):
            addm(pluck(note(n_), .6, .3), t + i * beat * .5 + beat * 2, .1)
    t += 4 * beat; bar += 1
# soften the sad stretch (13.3-23.8): drop drums by overlaying nothing new; add sad pad
for i, (s0, ch) in enumerate([(13.3, [57, 60, 64]), (16.7, [53, 57, 60]), (20.1, [55, 59, 62])]):
    addm(pad(note(ch[0] - 12), 3.6) + pad(note(ch[1] - 12), 3.6) * .7, s0, .07)

# ---- section B: rainy night, A minor, slow piano + low pad ----
for s0, chord in [(23.8, [45, 52, 57, 60]), (27.6, [41, 48, 53, 57]), (31.7, [43, 50, 55, 59]), (35.3, [45, 52, 57, 60]),
                  (39.0, [40, 47, 52, 56])]:
    addm(pad(note(chord[0]), 4.2, .2) + .6 * pad(note(chord[1]), 4.2, .2), s0, .12)
    for i, n_ in enumerate(chord[1:] + [chord[2] + 12]):
        addm(piano(note(n_ + 12), 1.4, .7), s0 + i * .55, .07, pan=(-.4 + i * .27))
# tension heartbeat during the crack (25-27.6) and the bribe (35.3-40)
for tb in list(np.arange(25.0, 27.6, .8)) + list(np.arange(35.3, 40.2, .75)):
    addm(kick(1.), tb, .35); addm(kick(.7), tb + .22, .22)
# the decision: single sustained low note + high glassy tone (40.3-43.8)
addm(pad(note(33), 3.6, .1), 40.3, .18); addm(pad(note(81), 3.4, 0) * .5, 40.4, .05)
# running pulse (27.6-29.2)
for tb in np.arange(27.62, 29.2, .19): addm(hat(), tb, .12)

# ---- section C: suspense build 43.8 -> 59.5 ----
for s0, chord in [(43.8, [45, 57, 60, 64]), (47.4, [41, 53, 57, 60]), (50.9, [43, 55, 59, 62]), (54.0, [45, 57, 60, 64])]:
    addm(pad(note(chord[0]), 3.8, .3), s0, .14); addm(pad(note(chord[2]), 3.8, .3), s0, .06)
# rising pulse: 8ths speeding into the burst
tb = 43.8; step = .38
while tb < 59.45:
    addm(pluck(note(57 if int(tb * 10) % 2 else 64), .2, .5), tb, .08)
    if tb > 50.3: addm(kick(.9), tb, .22)
    if tb > 55.4: addm(hat(), tb, .15)
    tb += step; step = max(.12, step * (.993 if tb < 55 else .975))
# "Now." accent
addm(kick(1.2), 50.35, .5)
# riser into the burst
n = int(1.6 * SR); tt = np.arange(n) / SR
riser = hpf(rng.standard_normal(n), 2000) * (tt / 1.6) ** 2 * .6 + np.sin(2 * np.pi * (200 + 600 * (tt / 1.6) ** 2) * tt) * (tt / 1.6) * .2
addm(riser, 57.9, .5)

# ---- section D: impact + flood chaos (59.5-64.2) ----
for s0, chord in [(59.6, [41, 48, 53, 57]), (62.0, [43, 50, 55, 59])]:
    addm(pad(note(chord[0]), 2.6, .5) + pad(note(chord[2]), 2.6, .5), s0, .12)
    for tb in np.arange(s0, s0 + 2.3, beat / 2): addm(kick(.6), tb, .18)
# relief
addm(pad(note(60), 2.2, .2) + pad(note(64), 2.2, .2) * .8 + pad(note(67), 2.2, .2) * .6, 62.0, .07)

# ---- section E: warm heroic ending, C major, 92 bpm ----
bpm2 = 92; b2 = 60 / bpm2
prog2 = [(48, [60, 64, 67]), (53, [60, 65, 69]), (45, [57, 60, 64]), (55, [59, 62, 67])]  # C F Am G
mel = [76, 74, 72, 74, 76, 76, 79, 77, 76, 74, 72, 71, 72]
t = 64.2; bar = 0; mi = 0
while t < DUR - .2:
    root, ch = prog2[bar % 4]
    addm(pad(note(ch[0]), 4 * b2 + .5, .35) + .8 * pad(note(ch[1]), 4 * b2 + .5, .35) + .6 * pad(note(ch[2]), 4 * b2 + .5, .35), t, .09)
    for b in range(4):
        tb = t + b * b2
        if tb > DUR - .2: break
        addm(bass(note(root - 12), b2 * .9), tb, .32)
        addm(kick(.8), tb, .3 if b in (0, 2) else .14)
        if b in (1, 3): addm(snare(), tb, .09)
        addm(hat(), tb + b2 / 2, .08)
        if mi < len(mel) and tb >= 66: addm(piano(note(mel[mi]), 1.3, 1.), tb, .12); mi += 1
    t += 4 * b2; bar += 1
# fade the very end
fade_i = int((DUR - 1.6) * SR); music[fade_i:] *= np.linspace(1, 0, N - fade_i)[:, None]

# ---------------- SFX ----------------
sfx = np.zeros((N, 2))
def adds(x, at, g=1., pan=0.):
    add(sfx[:, 0], x, at, g * (1 - max(0, pan))); add(sfx[:, 1], x, at, g * (1 + min(0, pan)))
def ching(at, g=1.):
    for k, f in enumerate([2093, 2637, 3136, 4186]):
        n = int(.6 * SR); tt = np.arange(n) / SR
        adds(np.sin(2 * np.pi * f * tt) * np.exp(-tt * 7) * (1 - k * .15), at + k * .035, .12 * g)
    for i in range(14):  # coin sprinkle
        n = int(.12 * SR); tt = np.arange(n) / SR; f = 3000 + rng.random() * 3000
        adds(np.sin(2 * np.pi * f * tt) * np.exp(-tt * 40), at + .05 + rng.random() * .6, .05 * g, pan=rng.random() - .5)
def popfx(at, g=1.):
    n = int(.12 * SR); tt = np.arange(n) / SR
    adds(np.sin(2 * np.pi * (300 + 900 * np.exp(-tt * 40)) * tt) * np.exp(-tt * 30), at, .25 * g)
def whoosh(at, dur=.35, g=1.):
    n = int(dur * SR); tt = np.arange(n) / SR
    x = bpf(rng.standard_normal(n), 400, 3000) * np.sin(np.pi * tt / dur) ** 2
    adds(x, at - dur * .5, .06 * g)
def bwomp(at):
    for k, f in enumerate([233, 220, 207, 155]):
        n = int(.45 * SR); tt = np.arange(n) / SR
        x = np.sign(np.sin(2 * np.pi * f * tt * (1 - .03 * tt))) * env(n, .01, .4, .6, .1)
        adds(lpf(x, 1500), at + k * .3, .06)
def thunder(at, g=1.):
    n = int(3 * SR); tt = np.arange(n) / SR
    x = lpf(rng.standard_normal(n), 180) * (np.exp(-tt * 1.4) + .5 * np.exp(-(tt - .3) ** 2 * 20))
    adds(x / np.abs(x).max(), at, .55 * g)
def noise_bed(a, b, lo, hi, g, fade=.4):
    n = int((b - a) * SR); x = bpf(rng.standard_normal(n), lo, hi)
    e = np.ones(n); fn = int(fade * SR); e[:fn] = np.linspace(0, 1, fn); e[-fn:] = np.linspace(1, 0, fn)
    x = x / (np.abs(x).max() + 1e-9) * e
    adds(x, a, g, pan=0)
def boom(at):
    n = int(3.5 * SR); tt = np.arange(n) / SR
    x = np.sin(2 * np.pi * (30 + 70 * np.exp(-tt * 6)) * tt) * np.exp(-tt * 1.2) + lpf(rng.standard_normal(n), 900) * np.exp(-tt * 2) * .8
    adds(x / np.abs(x).max(), at, .7)
def crackle(a, b, g=.15):
    tb = a
    while tb < b:
        n = int(.04 * SR); adds(hpf(rng.standard_normal(n), 1500) * np.exp(-np.arange(n) / SR * 80), tb, g * (.5 + rng.random()))
        tb += .03 + rng.random() * .12 * (1 - (tb - a) / (b - a + 1e-9))
def splash_steps(a, b, step=.19):
    tb = a
    while tb < b:
        n = int(.09 * SR); adds(bpf(rng.standard_normal(n), 600, 4000) * np.exp(-np.arange(n) / SR * 35), tb, .12); tb += step
def scribble(a, b):
    n = int((b - a) * SR); tt = np.arange(n) / SR
    x = bpf(rng.standard_normal(n), 2000, 7000) * (.5 + .5 * np.sin(2 * np.pi * 7 * tt)) ** 2
    adds(x / np.abs(x).max(), a, .05)
def beep(at, f=1000, d=.12):
    n = int(d * SR); tt = np.arange(n) / SR; adds(np.sin(2 * np.pi * f * tt) * env(n, .003, d, 1, .02), at, .07)
def stamp(at):
    adds(kick(1.4), at, .5); n = int(.15 * SR); adds(lpf(rng.standard_normal(n), 2500) * np.exp(-np.arange(n) / SR * 30), at, .25)
def cheer(a, b, g=.2):
    n = int((b - a) * SR); tt = np.arange(n) / SR
    x = bpf(rng.standard_normal(n), 500, 3500) * (1 + .4 * np.sin(2 * np.pi * 3.3 * tt + rng.random(n) * .3))
    e = np.minimum(1, tt / .3) * np.minimum(1, (b - a - tt) / .6)
    adds(x / np.abs(x).max() * e, a, g)
    for i in range(10):  # whistles / woos
        s0 = a + rng.random() * (b - a - .6); nn = int(.5 * SR); t2 = np.arange(nn) / SR
        adds(np.sin(2 * np.pi * (900 + 500 * t2 / .5) * t2) * env(nn, .05, .4, .5, .1), s0, .03, pan=rng.random() - .5)
def laugh(a, b):
    tb = a
    while tb < b:
        for v in range(3):
            n = int(.11 * SR); tt = np.arange(n) / SR; f = 180 + v * 70 + rng.random() * 40
            x = (np.sin(2 * np.pi * f * tt) + .5 * np.sin(4 * np.pi * f * tt)) * np.sin(np.pi * tt / .11) * (1 + .3 * bpf(rng.standard_normal(n), 800, 3000))
            adds(x, tb + v * .05 + rng.random() * .03, .05, pan=(v - 1) * .5)
        tb += .16 + rng.random() * .05

# kid lie -> coins
ching(2.67); popfx(2.67)
ching(5.70); popfx(5.70)
ching(8.73, 1.2); popfx(8.73)
noise_bed(10.85, 11.9, 1500, 6000, .05)                 # bills fluttering
for i in range(6): beep(12.35 + i * .08, 2600 + i * 300, .15)   # sparkle on the mansion
popfx(12.4)
bwomp(15.98); popfx(15.98)
laugh(21.8, 22.9)
# night: rain beds, thunder, water spurts
noise_bed(23.75, 27.62, 800, 9000, .16); noise_bed(41.65, 42.95, 800, 9000, .13)
thunder(24.6); thunder(25.68, 1.2)
noise_bed(25.6, 26.9, 1500, 8000, .1, .1)               # water jets
splash_steps(27.62, 29.2)
noise_bed(27.62, 29.2, 800, 9000, .11)
scribble(32.75, 33.85)
ching(34.2, .8); popfx(34.2)
whoosh(37.8, .5, 1.5)                                   # cheque slide
noise_bed(43.73, 46.4, 300, 2500, .08, .5)              # crowd murmur
beep(47.35, 880, .1); beep(47.5, 880, .1)               # going live
stamp(50.33)
popfx(52.7); popfx(52.95)
noise_bed(56.85, 58.0, 200, 2000, .12, .2); splash_steps(56.85, 58.0, .09)
crackle(58.0, 59.5, .12)
boom(59.5); noise_bed(59.6, 64.0, 150, 5000, .28, .4)   # water roar
thunder(60.5, .6)
cheer(70.0, 72.8, .16)
stamp(72.05)
for at in (72.85, 72.95, 73.3, 73.4, 73.5): popfx(at, .8)
# soft whooshes on a few big cuts
for at in (3.33, 6.87, 9.57, 13.24, 16.67, 23.75, 29.2, 43.73, 58.0, 64.15): whoosh(at, .3)

# ---------------- mix ----------------
v, vsr = sf.read(os.path.join(ROOT, 'voice/voice.wav'))
if v.ndim > 1: v = v.mean(1)
idx = np.linspace(0, len(v) - 1, N); voice = np.interp(idx, np.arange(len(v)), v)
# duck music under speech (envelope follower on voice)
def movavg(x, k):
    c = np.concatenate([[0], np.cumsum(x)]); y = (c[k:] - c[:-k]) / k
    return np.concatenate([np.full(k // 2, y[0]), y, np.full(len(x) - len(y) - k // 2, y[-1])])
a = np.abs(voice); sm = movavg(movavg(a, int(.05 * SR)), int(.25 * SR))
duck = 1 - .55 * np.clip(sm / (np.percentile(sm[sm > 1e-4], 70) + 1e-9), 0, 1)
def norm(x, peak): return x / (np.abs(x).max() + 1e-9) * peak
sec = np.interp(t_all, [0, 23.3, 24.0, 58.9, 59.5, 63.8, 64.6, DUR], [1, 1, 2.3, 2.3, 2.6, 2.6, 1, 1])
music = music * sec[:, None]
music = norm(music, .5) * duck[:, None]
sfx = norm(sfx, .6)
mix = music * 1.0 + sfx * .7 + voice[:, None] * 1.0 / (np.abs(voice).max() + 1e-9) * .75
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
sf.write(os.path.join(HERE, 'mix_raw.wav'), mix.astype(np.float32), SR)
sf.write(os.path.join(HERE, 'music.wav'), music.astype(np.float32), SR)
sf.write(os.path.join(HERE, 'sfx.wav'), sfx.astype(np.float32), SR)
print('wrote', DUR, 's')
