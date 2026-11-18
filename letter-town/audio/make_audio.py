# Original synthesized score + SFX for "Letter Town", mixed under the narration -> mix.wav (48 kHz stereo).
# Score sections follow the story: playful town (0-23.8), rainy night tension (23.8-43.8), suspense build to the
# dam burst (43.8-59.5), impact + flood (59.5-64.2), warm heroic ending (64.2-end).
import json, os
import numpy as np, soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
SR = 48000
words = json.load(open(os.path.join(ROOT, 'voice/words.json')))
DUR = words['duration']; N = int(DUR * SR)
# the score/SFX event table below is written in the v1 narration timeline; W() maps those times onto the new voice
old = json.load(open(os.path.join(ROOT, 'voice/words_v1.json')))
ODUR = old['duration']
_by = {}
for i, w in enumerate(words['words']): _by.setdefault(w['p'], []).append(i)
_A = [(0., 0.)]
for p in sorted(_by):
    i0, i1 = _by[p][0], _by[p][-1]
    _A += [(old['words'][i0]['start'], words['words'][i0]['start']), (old['words'][i1]['end'], words['words'][i1]['end'])]
_A.append((ODUR, DUR)); _A = sorted(set(_A))
_ox = np.array([a for a, b in _A]); _nx = np.array([b for a, b in _A])
def W(t): return float(np.interp(t, _ox, _nx))
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
def add(buf, x, at, gain=1., warp=True):
    i = int((W(at) if warp else at) * SR); j = min(len(buf), i + len(x))
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

# ---- A: playful town, C major, 112 bpm (0 - 9.7), lighter for Max (9.7 - 18.6) ----
bpm = 112; beat = 60 / bpm
prog = [(60, [60, 64, 67]), (65, [53, 57, 60]), (67, [55, 59, 62]), (60, [60, 64, 67])]
t = 0.0; bar = 0
while t < 18.5:
    root, ch = prog[bar % 4]
    maxpart = t > 9.6
    for b in range(4):
        tb = t + b * beat
        if tb > 18.5: break
        addm(bass(note(root - 24), beat * .8), tb, .3)
        for k, off in enumerate([0, .5]):
            addm(pluck(note(ch[(b * 2 + k) % 3] + 12 - (1 if maxpart and k else 0)), .3), tb + off * beat, .14, pan=-.3 if k else .3)
        if not (10.6 < tb < 14.7):
            if b in (0, 2): addm(kick(.8), tb, .32)
            if b in (1, 3): addm(snare(), tb, .07)
            addm(shaker(), tb + beat * .5, .1)
    t += 4 * beat; bar += 1
# sad little descending line for "Except Max" / empty mailbox
for i, n_ in enumerate([67, 66, 65, 64]): addm(piano(note(n_), .9, .8), 9.75 + i * .45, .1)
# ---- B: mystery + urgency, A minor (18.6 - 27.6) ----
for s0, ch in [(18.6, [45, 52, 57]), (21.0, [41, 48, 53]), (23.0, [43, 50, 55]), (25.2, [40, 47, 52])]:
    addm(pad(note(ch[0]), 2.6, .3) + .7 * pad(note(ch[2]), 2.6, .3), s0, .1)
for tb in np.arange(20.15, 27.5, .27): addm(pluck(note(57 if int(tb * 7) % 3 else 64), .18, .5), tb, .07)
for tb in np.arange(20.15, 27.5, .54): addm(kick(.7), tb, .2)
addm(kick(1.4), 25.2, .5); addm(pad(note(33), 2.4, .1), 25.2, .2)
# ---- C: sneaky night, D minor staccato (27.6 - 39.3) ----
sneak = [62, 65, 69, 65, 62, 61, 62, 65]
for i, tb in enumerate(np.arange(27.6, 34.8, .3)):
    addm(pluck(note(sneak[i % 8] - 12), .12, .3), tb, .12)
    if i % 2 == 0: addm(pluck(note(38), .2, .2), tb, .1)
for tb in np.arange(27.6, 34.8, .6): addm(hat(), tb, .05)
addm(kick(1.5), 35.3, .55); addm(pad(note(26), 3.2, .4) + pad(note(38), 3.2, .4), 35.3, .22)   # BURN hit
for s0 in (36.9, 37.6): addm(pad(note(50), .7, .6) + pad(note(53), .7, .6) + pad(note(56), .7, .6), s0, .1)   # evil chords
# ---- D: chase (39.3 - 44.1), then basement despair (44.1 - 47.7) ----
for tb in np.arange(39.3, 44.1, .2): addm(pluck(note(57 if int(tb * 5) % 2 else 60), .15, .6), tb, .08); 
for tb in np.arange(39.3, 44.1, .4): addm(kick(.9), tb, .25); addm(snare(), tb + .2, .05)
addm(pad(note(45), 3.8, .15) + .6 * pad(note(52), 3.8, .15), 44.2, .14)
for i, n_ in enumerate([69, 67, 64, 62, 60]): addm(piano(note(n_), 1.3, .8), 44.6 + i * .6, .07)
# ---- E: determination build (47.7 - 57.6) ----
tb = 47.7; step = .36; i = 0
arp = [57, 60, 64, 69, 64, 60]
while tb < 56.8:
    addm(pluck(note(arp[i % 6] + (5 if tb > 51 else 0)), .2, .5), tb, .09); i += 1
    if tb > 51: addm(kick(.8), tb, .2) if i % 2 == 0 else None
    tb += step; step = max(.13, step * .985)
addm(pad(note(45), 3.4, .3), 47.7, .1); addm(pad(note(50), 3.8, .3), 51.1, .12); addm(pad(note(52), 2.0, .4), 54.9, .14)
n = int(1.8 * SR); tt = np.arange(n) / SR
addm(hpf(rng.standard_normal(n), 2000) * (tt / 1.8) ** 2 * .6 + np.sin(2 * np.pi * (200 + 700 * (tt / 1.8) ** 2) * tt) * (tt / 1.8) * .2, 55.0, .45)
addm(kick(1.6), 57.6, .6)
# ---- F: triumph (59.5 - 65.6) ----
addm(pad(note(48), 2.0, .3) + pad(note(55), 2.0, .3), 59.5, .08)
addm(pad(note(45), 1.4, .5) + pad(note(51), 1.4, .5), 61.5, .12)          # angry crowd sting
for i, n_ in enumerate([60, 59, 58, 57]): addm(piano(note(n_ - 12), .5, 1), 63.0 + i * .3, .1)   # wah-wah for the mayor
bpm2 = 120; b2 = 60 / bpm2
for i, (n_, d) in enumerate([(67, .5), (72, .5), (76, .5), (79, 1.5)]): addm(piano(note(n_), 1.2, 1), 64.3 + i * b2 * .5, .14)
for tb in np.arange(64.3, 65.7, b2 / 2): addm(kick(.9), tb, .25); addm(hat(True), tb + b2 / 4, .06)
# ---- G: warm resolve (65.6 - end) ----
prog2 = [(48, [60, 64, 67]), (53, [60, 65, 69]), (55, [59, 62, 67]), (48, [60, 64, 67])]
t = 65.6; bar = 0; mel = [72, 74, 76, 79, 76, 74, 72, 74, 72]; mi = 0
while t < ODUR - .2:
    root, ch = prog2[bar % 4]
    addm(pad(note(ch[0]), 4 * b2 * 2 + .5, .35) + .7 * pad(note(ch[1]), 4 * b2 * 2 + .5, .35) + .5 * pad(note(ch[2]), 4 * b2 * 2 + .5, .35), t, .08)
    for b in range(8):
        tb = t + b * b2
        if tb > ODUR - .2: break
        addm(bass(note(root - 12), b2 * .9), tb, .25)
        if b % 2 == 0: addm(kick(.7), tb, .2)
        else: addm(snare(), tb, .05)
        if mi < len(mel) and tb > 66.4: addm(piano(note(mel[mi]), 1.0, 1), tb, .1); mi += 1
    t += 8 * b2; bar += 1
for i, n_ in enumerate([79, 84]): addm(pluck(note(n_), .6, .3), 69.75 + i * .12, .12)   # "told you" sparkle
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
    n = int((W(b) - W(a)) * SR); x = bpf(rng.standard_normal(n), lo, hi)
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
    n = int((W(b) - W(a)) * SR); tt = np.arange(n) / SR
    x = bpf(rng.standard_normal(n), 2000, 7000) * (.5 + .5 * np.sin(2 * np.pi * 7 * tt)) ** 2
    adds(x / np.abs(x).max(), a, .05)
def beep(at, f=1000, d=.12):
    n = int(d * SR); tt = np.arange(n) / SR; adds(np.sin(2 * np.pi * f * tt) * env(n, .003, d, 1, .02), at, .07)
def stamp(at):
    adds(kick(1.4), at, .5); n = int(.15 * SR); adds(lpf(rng.standard_normal(n), 2500) * np.exp(-np.arange(n) / SR * 30), at, .25)
def cheer(a, b, g=.2):
    n = int((W(b) - W(a)) * SR); tt = np.arange(n) / SR
    x = bpf(rng.standard_normal(n), 500, 3500) * (1 + .4 * np.sin(2 * np.pi * 3.3 * tt + rng.random(n) * .3))
    e = np.minimum(1, tt / .3) * np.minimum(1, (n / SR - tt) / .6)
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

def clunk(at, g=1.):
    n = int(.2 * SR); tt = np.arange(n) / SR
    adds((np.sin(2 * np.pi * 180 * tt) * np.exp(-tt * 25) + lpf(rng.standard_normal(n), 1500) * np.exp(-tt * 40) * .6), at, .25 * g)
def rustle(at, dur=.4, g=1.):
    n = int(dur * SR); tt = np.arange(n) / SR
    x = bpf(rng.standard_normal(n), 1500, 8000) * (.4 + .6 * np.abs(np.sin(2 * np.pi * 9 * tt))) * np.sin(np.pi * tt / dur)
    adds(x / (np.abs(x).max() + 1e-9), at, .08 * g)
def strike(at):
    n = int(.25 * SR); tt = np.arange(n) / SR
    adds(bpf(rng.standard_normal(n), 2000, 9000) * np.exp(-tt * 12), at, .2)
    n2 = int(.8 * SR); t2 = np.arange(n2) / SR; adds(lpf(rng.standard_normal(n2), 1200) * np.exp(-t2 * 3) * np.minimum(1, t2 * 20), at + .12, .25)
def splash(at):
    n = int(.6 * SR); tt = np.arange(n) / SR
    adds(bpf(rng.standard_normal(n), 300, 5000) * np.exp(-tt * 8), at, .35)
    n2 = int(1.4 * SR); t2 = np.arange(n2) / SR; adds(hpf(rng.standard_normal(n2), 4000) * np.exp(-t2 * 1.8) * np.minimum(1, t2 * 10), at + .05, .22)   # tssss
def gasp(at, g=1.):
    n = int(.5 * SR); tt = np.arange(n) / SR
    adds(bpf(rng.standard_normal(n), 600, 3000) * np.sin(np.pi * tt / .5) ** 2, at, .2 * g)
def taps(a, b, step=.3, g=.06):
    tb = a
    while tb < b:
        n = int(.05 * SR); adds(bpf(rng.standard_normal(n), 800, 3000) * np.exp(-np.arange(n) / SR * 60), tb, g); tb += step

# mailboxes + letters
clunk(1.55); rustle(1.9, .5); rustle(2.6, .5, .7); rustle(3.0, .4, .6)
rustle(3.8, .4); ching(4.5, .9)                    # gold
rustle(4.95, .3); whoosh(5.9, .3, 1.2)             # fish pushed away
rustle(6.5, .3); bwomp(7.25)                       # Kevin
popfx(13.9); clunk(12.9); clunk(11.0, .6)          # empty mailbox
bwomp(15.0)                                        # stocks crash
laugh(16.7, 18.5); stamp(17.88)                    # cursed
for i in range(10): clunk(19.2 + i * .07, .5)      # rattling
boom(20.15); for_burst = None
noise_bed(20.15, 21.6, 1500, 9000, .2, .1)         # paper explosion
for i in range(14): rustle(20.3 + i * .12, .25, .7)
rustle(21.95, .5); rustle(23.1, 1.0, 1.2)
# night
taps(28.9, 30.1, .32); taps(30.2, 31.3, .22, .04)  # tiptoe + crawl
rustle(31.4, .6, .8)                               # curtains
rustle(33.5, .6, 1.1)                              # mayor opens his letter
thunder(35.3, .6); noise_bed(36.3, 36.9, 200, 3000, .3, .08)   # fire vision roar
laugh(37.0, 38.2)
splash_steps(39.3, 40.8, .17)
gasp(43.3); stamp(44.68); thunder(44.7, .4)        # basement door slam
beep(49.85, 1760, .25); popfx(49.85)               # the idea
for i in range(3): clunk(51.25 + i * .28, .8)      # stacking crates
rustle(52.2, 1.0, .6); splash_steps(53.5, 54.9, .16)
strike(56.3)
whoosh(57.0, .6, 2.0); stamp(57.65)                # dive + tackle
splash(58.4)
rustle(59.9, .8, .9)
gasp(61.6, 1.4); cheer(64.3, 65.9, .2)
for at in (64.35, 64.5, 64.7): popfx(at, .7)
clunk(67.2); rustle(68.5, .4)
for at in (70.85, 70.95, 71.3, 71.4, 71.5): popfx(at, .8)
for at in (3.74, 9.66, 18.64, 27.56, 30.16, 39.29, 44.13, 47.72, 54.86, 61.47, 65.56): whoosh(at, .3)

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
sec = np.interp(t_all, [0, 18.4, 19.0, 39.0, 39.6, 47.4, 48.0, 57.7, 58.2, 65.3, 65.9, DUR], [1, 1, 1.6, 1.6, 2.3, 2.3, 1.6, 1.6, 2.8, 2.8, 1.1, 1.1])
music = music * sec[:, None]
music = norm(music, .5) * duck[:, None]
sfx = norm(sfx, .6)
mix = music * 1.0 + sfx * .7 + voice[:, None] * 1.0 / (np.abs(voice).max() + 1e-9) * .75
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
sf.write(os.path.join(HERE, 'mix_raw.wav'), mix.astype(np.float32), SR)
sf.write(os.path.join(HERE, 'music.wav'), music.astype(np.float32), SR)
sf.write(os.path.join(HERE, 'sfx.wav'), sfx.astype(np.float32), SR)
print('wrote', DUR, 's')
