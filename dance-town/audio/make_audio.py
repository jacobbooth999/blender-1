# Original synthesized score + SFX for "Dance Town", mixed under the Adam-voice narration -> mix.wav (48 kHz stereo).
# Sections follow the narration lines (voice/words.json); punch SFX land on every narrated HUS and on the extra
# on-screen HUS pops / impacts exported from the shot list (out/events.json, via `node render.mjs events out/events.json`).
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

# line start/end times from the narration
LS = {}; LE = {}
for w in words['words']: LS.setdefault(w['p'], w['start']); LE[w['p']] = w['end']
def T(li): return LS[li]

def chord_prog(a, b, bpm, chords, inst, g, beats=4, octave=0, pattern=None):
    """Repeat a chord progression from a to b; inst(f, dur) per note."""
    spb = 60 / bpm; t = a; i = 0
    while t < b - .05:
        ch = chords[i % len(chords)]; bar = spb * beats
        for k in range(beats * (2 if pattern == 'eighth' else 1)):
            st = t + k * spb * (.5 if pattern == 'eighth' else 1)
            if st >= b: break
            n = ch[k % len(ch)] + 12 * octave
            addm(inst(note(n), spb * (.5 if pattern == 'eighth' else 1) * 1.6), st, g, pan=(-.3 if k % 2 else .3))
        t += bar; i += 1
def drums(a, b, bpm, g=1., style='rock'):
    spb = 60 / bpm; t = a; k = 0
    while t < b - .05:
        beat = k % 4
        if beat in (0, 2) or (style == 'drive'): addm(kick(1.), t, .9 * g)
        if beat in (1, 3): addm(snare(), t, .45 * g)
        addm(hat(), t, .25 * g); addm(hat(), t + spb / 2, .18 * g)
        t += spb; k += 1
def padline(a, b, chords, g=.25, bright=.4):
    n = len(chords); seg = (b - a) / n
    for i, ch in enumerate(chords):
        for nn in ch: addm(pad(note(nn), seg + .6, bright), a + i * seg, g / len(ch))
def bassline(a, b, bpm, roots, g=.5, step=1):
    spb = 60 / bpm * step; t = a; i = 0
    while t < b - .05: addm(bass(note(roots[(i // int(4 / step)) % len(roots)]), spb * .9), t, g); t += spb; i += 1


# story beats (mirror src/story.js)
E5 = LE[5] + .05
BEAT = dict(trip=E5, freeze=E5 + .8, alarm=E5 + 2.0, hands=E5 + 2.9, gone=E5 + 4.6)
E19 = LE[19] + .1
END = LE[34] + .35
def wstart(li, j): return [w for w in words['words'] if w['p'] == li][j]['start']

Cm, Fm, Gm, Ab, Bb, Eb = [60, 63, 67], [65, 68, 72], [67, 70, 74], [68, 72, 75], [70, 74, 77], [63, 67, 70]
C, F, G, Am, Dm = [60, 64, 67], [65, 69, 72], [67, 71, 74], [57, 60, 64], [62, 65, 69]
def clap():
    n = int(.18 * SR); tt = np.arange(n) / SR
    return bpf(rng.standard_normal(n), 900, 5000) * (np.exp(-tt * 30) + .5 * np.exp(-np.maximum(0, tt - .012) * 40))
def funk(a, b, bpm=118, g=1., minor=False, detune=1.0):
    """Bouncy dance groove: four-on-the-floor, claps, offbeat hats, octave bass, stabby chords."""
    spb = 60 / bpm; t = a; k = 0
    roots = [41, 41, 43, 39] if minor else [48, 48, 53, 55]
    chords = [Fm, Fm, Gm, Eb] if minor else [C, C, F, G]
    while t < b - .03:
        bar = (k // 4) % 4; beat = k % 4
        addm(kick(1.), t, .85 * g)
        if beat in (1, 3): addm(clap(), t, .35 * g)
        addm(hat(), t + spb / 2, .22 * g); addm(shaker(), t + spb * .25, .12 * g); addm(shaker(), t + spb * .75, .12 * g)
        r = roots[bar]
        for e, o in ((0, 0), (.5, 12)):
            if t + spb * e < b: addm(bass(note(r + o) * detune, spb * .42), t + spb * e, .5 * g)
        if beat in (1, 3) and t + spb * .5 < b:
            for nn in chords[bar]: addm(pluck(note(nn + 12) * detune, spb * .4, .7), t + spb * .5, .16 * g, pan=.2)
        if beat == 0 and bar % 2 == 0:
            for i, nn in enumerate([72, 74, 76, 79] if not minor else [72, 75, 77, 79]):
                if t + i * spb / 2 < b: addm(pluck(note(nn) * detune, .2, .9), t + i * spb / 2, .12 * g, pan=-.3)
        t += spb; k += 1
def musicbox(a, b, notes, step=.36, g=.35, oct=24):
    t = a; i = 0
    while t < b - .1:
        n = notes[i % len(notes)]
        if n: addm(pluck(note(n + oct), .9, .25) + .3 * pluck(note(n + oct + 12), .6, .2), t, g, pan=(.25 if i % 2 else -.25))
        t += step; i += 1
def drone(a, b, notes=(33, 40), g=.3, bright=.6):
    for nn in notes: addm(pad(note(nn), b - a + .4, bright), a, g / len(notes))
def taiko(a, b, step=.5, g=1.):
    t = a; k = 0
    while t < b - .05:
        addm(kick(1.5), t, .8 * g); addm(lpf(rng.standard_normal(int(.2 * SR)), 300) * np.exp(-np.arange(int(.2 * SR)) / SR * 15), t, .4 * g)
        if k % 4 == 3: addm(kick(1.3), t + step / 2, .5 * g)
        t += step; k += 1

# --- scene 1-2: the dance groove until the trip; dead silence at the freeze ---
funk(0, BEAT['freeze'], 118, 1.0)
# back to dancing after the hands: same groove, a little sour (minor + detuned)
funk(BEAT['gone'], T(8) - .1, 118, .8, minor=True, detune=.985)
# --- scene 3: night, music box + low pad; CCTV hum ---
musicbox(T(8), T(17) - .2, [72, 0, 75, 74, 0, 72, 70, 0, 67, 0, 68, 67, 65, 0, 63, 0], .34, .3)
drone(T(8), T(17) - .2, (36, 43), .22, .5)
# --- scene 4: the square — warped minor groove until he stops ---
funk(T(17), T(19) + .2, 112, .8, minor=True, detune=.97)
# --- scene 4/5: creature — drone, then taiko build under the drain, drop for Grandma ---
drone(T(20), T(26), (29, 36, 41), .35, .9)
drone(T(26), T(31), (31, 38, 43), .35, .9); taiko(T(27), T(31), .45, .9)
musicbox(T(31), END - .2, [72, 0, 0, 75, 74, 0, 72, 0, 70, 0, 0, 67], .42, .28)
drone(T(31), END - .1, (33, 40), .2, .4)
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


# ---------------- Dance Town SFX ----------------
def thud(at, g=1.):
    n = int(.3 * SR); tt = np.arange(n) / SR
    adds(np.sin(2 * np.pi * (60 + 80 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 14) + lpf(rng.standard_normal(n), 700) * np.exp(-tt * 25) * .4, at, .45 * g)
def scratch(at):      # record scratch at the freeze
    n = int(.35 * SR); tt = np.arange(n) / SR; f = 900 * (1 - tt / .35) + 200
    adds(bpf(rng.standard_normal(n), 300, 4000) * (.5 + .5 * np.sign(np.sin(2 * np.pi * np.cumsum(f / 60) / SR * 60))) * env(n, .005, .35, 1, .05), at, .3)
def siren(a, b, g=.3):
    n = int((b - a) * SR); tt = np.arange(n) / SR; f = 700 + 300 * np.sign(np.sin(2 * np.pi * 1.6 * tt))
    x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .5 + np.sin(2 * np.pi * np.cumsum(f) / SR)
    adds(lpf(x, 3000) * env(n, .05, 1, 1, .2), a, g)
def rumble(a, b, g=.5):
    n = int((b - a) * SR); tt = np.arange(n) / SR
    x = lpf(rng.standard_normal(n), 120) * (1 + .5 * np.sin(2 * np.pi * 7 * tt)); x /= np.abs(x).max() + 1e-9
    adds(x * env(n, .4, 1, 1, .5), a, g)
def slurp(at, dur=1.4, g=1.):
    n = int(dur * SR); tt = np.arange(n) / SR; f = 400 * np.exp(-tt * 1.5) + 60
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * (.6 + .4 * np.sin(2 * np.pi * 18 * tt)) + bpf(rng.standard_normal(n), 150, 900) * .7
    adds(x * env(n, .05, dur, 1, .3), at, .3 * g)
def roar(at, dur=2.2, g=1.):
    n = int(dur * SR); tt = np.arange(n) / SR
    base = sum(np.sign(np.sin(2 * np.pi * (55 + k * 27) * (1 + .03 * np.sin(2 * np.pi * 6 * tt)) * tt)) / (k + 1) for k in range(4))
    x = lpf(base + bpf(rng.standard_normal(n), 100, 1500) * 1.2, 1600) * env(n, .25, dur, 1, .6)
    adds(x / (np.abs(x).max() + 1e-9), at, .55 * g)
def glitch(at, dur=.6):
    t0 = at
    while t0 < at + dur:
        d = .02 + rng.random() * .05; n = int(d * SR); adds(np.sign(np.sin(2 * np.pi * (200 + rng.random() * 2000) * np.arange(n) / SR)) * .5, t0, .12); t0 += d + rng.random() * .03
def hum(a, b, g=.05):
    n = int((b - a) * SR); tt = np.arange(n) / SR
    adds((np.sin(2 * np.pi * 60 * tt) + .4 * np.sin(2 * np.pi * 120 * tt) + .2 * hpf(rng.standard_normal(n), 6000)) * env(n, .1, 1, 1, .1), a, g)
def tapestop(at, dur=.9):
    # slowing kick/bass "power-down"
    n = int(dur * SR); tt = np.arange(n) / SR; f = 110 * (1 - tt / dur) ** 2 + 20
    adds(np.sin(2 * np.pi * np.cumsum(f) / SR) * (1 - tt / dur), at, .35)
def heartbeat(a, b, bpm=58, g=1.):
    t = a
    while t < b - .3:
        for o, gg in ((0, 1.), (.22, .7)):
            n = int(.25 * SR); tt = np.arange(n) / SR
            adds(np.sin(2 * np.pi * (45 + 25 * np.exp(-tt * 20)) * tt) * np.exp(-tt * 13) * gg, t + o, .9 * g)
        t += 60 / bpm
def shimmer(a, b, g=.06):
    t = a
    while t < b:
        beep(t, 2000 + rng.random() * 3000, .15); t += .05 + rng.random() * .06

# scene 1-2
for li, j in ((1, 0), (1, 3), (1, 5), (2, 0)): whoosh(wstart(li, j) - .05, .3, 1.0)
thud(wstart(3, 1), .8); thud(wstart(3, 2), .8)
whoosh(wstart(4, 0), .5, .8)
thud(BEAT['trip'] + .32, 1.2); scratch(BEAT['freeze'] - .05)
siren(BEAT['alarm'], BEAT['gone'] + .2, .22)
rumble(BEAT['hands'] - .1, BEAT['gone'], .5); slurp(BEAT['hands'] + .55, 1.2)
thud(BEAT['gone'] - .05, .6)
whoosh(wstart(6, 0) - .05, .3); gasp(wstart(6, 0) - .2)
# scene 3
for li in (10, 11, 12): hum(T(li) - .1, LE[li] + .2, .04); noise_bed(T(li) - .1, LE[li] + .25, 2000, 9000, .025)
for li in (10, 11, 12): beep(T(li) - .08, 1500, .08)
boom(wstart(14, 0) - .3)
glitch(T(15) + .9, .5); stamp(T(15) + .95)
boom(T(16) - .05); hum(T(16), LE[16] + .5, .08)
# scene 4
tapestop(wstart(18, 7), 1.2)
gasp(T(19) - .15, 1.4)
rumble(T(20) - .1, T(23) + .5, .55); boom(T(21) - .05)
whoosh(T(22) + .1, 1.2, .8)
rumble(T(23) - .1, T(26), .6); roar(T(23) + .6, 2.6, .9)
roar(T(25) - .4, 1.2, .5)
# scene 5
for k in range(6): whoosh(T(27) + k * .7, 1.0, 1.2)
for i in range(18): thud(T(28) + .1 + i * .13 + rng.random() * .1, .25 + rng.random() * .3)
shimmer(T(29), T(31) + 1.2, .05)
roar(T(30) - .2, 2.0, 1.0)
rustle(T(31) + .3, .4, 1.2)
heartbeat(END + .2, DUR, 56, 1.0)
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
sec = np.interp(t_all, [0, T(8) - .1, T(8) + .2, T(17) - .2, T(17), T(20), T(20) + .2, END - .2, END, DUR], [1, 1, .8, .8, 1., 1., 1.2, 1.2, 0, 0])
music = music * sec[:, None]
music = norm(music, .5) * duck[:, None]
sfx = norm(sfx, .6)
mix = music * 1.0 + sfx * .7 + voice[:, None] * 1.0 / (np.abs(voice).max() + 1e-9) * .75
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
sf.write(os.path.join(HERE, 'mix_raw.wav'), mix.astype(np.float32), SR)
sf.write(os.path.join(HERE, 'music.wav'), music.astype(np.float32), SR)
sf.write(os.path.join(HERE, 'sfx.wav'), sfx.astype(np.float32), SR)
print('wrote', DUR, 's')
