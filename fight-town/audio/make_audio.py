# Original synthesized score + SFX for "Fight Town", mixed under the Adam-voice narration -> mix.wav (48 kHz stereo).
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
EV = json.load(open(os.path.join(ROOT, 'out/events.json')))

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

C, F, G, Am, Dm, Em = [60, 64, 67], [65, 69, 72], [67, 71, 74], [57, 60, 64], [62, 65, 69], [64, 67, 71]
# A: arena — bouncy C major, 124 bpm (lines 0-5)
a, b = 0, T(6); chord_prog(a, b, 124, [C, F, G, C], pluck, .5, pattern='eighth'); bassline(a, b, 124, [48, 53, 55, 48], .45); drums(a, b, 124, .8)
# B: the worm — silly tuba-ish staccato, slower (lines 6-9)
a, b = T(6), T(10)
for i, n in enumerate([43, 47, 50, 47, 43, 47, 50, 55] * 12):
    st = a + i * .32
    if st > b - .2: break
    addm(bass(note(n), .18), st, .55); addm(pluck(note(n + 24), .15, .3), st, .18)
bwomp_at = [LS[9] + (words['words'][[i for i, w in enumerate(words['words']) if w['p'] == 9][5]]['start'] - LS[9])]
# C: Grandma — soft piano + pad, F major (lines 10-12)
a, b = T(10), T(13)
padline(a, b, [F, C, Dm, [65, 70, 74]], .22, .25)
for i, n in enumerate([65, 69, 72, 77, 76, 72, 69, 72, 74, 72, 70, 69, 65, 67, 69, 72]):
    st = a + i * .42
    if st < b - .2: addm(piano(note(n + 12), 1.4, .55), st, .35)
# D: training montage — driving 132 bpm power groove, rising (lines 13-15)
a, b = T(13), T(16)
drums(a, b, 132, 1.0, 'drive'); bassline(a, b, 132, [45, 45, 48, 50], .55, .5)
chord_prog(a, b, 132, [Am, Am, C, Dm], lambda f, d: pad(f, d, .9), .5)
# E: tension — low drone + timpani (lines 16-18)
a, b = T(16), T(19)
for nn in (33, 40): addm(pad(note(nn), b - a + .5, .7), a, .3)
for k in range(int((b - a) / .9)): addm(kick(1.3), a + k * .9, .7)
# F: the fight — impact silence, memory piano, then full epic groove (lines 19-21)
a, b = T(19), T(20)
for nn in (33, 45): addm(pad(note(nn), b - a, .9), a, .25)
a, b = T(20), T(21)
for i, n in enumerate([69, 72, 76, 74, 72, 69]):
    addm(piano(note(n + 12), 1.4, .5), a + .2 + i * .5, .35)
a, b = T(21), T(22)
drums(a, b, 140, 1.2, 'drive'); bassline(a, b, 140, [45, 48, 50, 52], .6, .5)
padline(a, b, [Am, F, C, G], .45, .9)
# G: triumph — big C major (lines 22-23)
a, b = T(22), T(24)
padline(a, b, [C, G, Am, F, C], .5, .7); chord_prog(a, b, 120, [C, G, F, C], pluck, .55, pattern='eighth'); drums(a, b, 120, .9); bassline(a, b, 120, [48, 55, 53, 48], .5)
# H: twist — music drops out, then a tiny comic loop under the end card
a, b = T(24), DUR
for i, n in enumerate([55, 52, 48]): addm(pluck(note(n), .5, .5), LS[24] + 1.2 + i * .22, .4)
chord_prog(LE[24] + .3, DUR, 124, [C, G], pluck, .35, pattern='eighth')

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

# ---------------- Fight Town SFX ----------------
def punch(at, g=1.):
    n = int(.22 * SR); t = np.arange(n) / SR
    thud = np.sin(2 * np.pi * (70 + 160 * np.exp(-t * 40)) * t) * np.exp(-t * 18)
    crack = hpf(rng.standard_normal(n), 1500) * np.exp(-t * 60) * .6
    adds((thud + crack) * g, at); whoosh(at - .09, .14, .6 * g)
def boing(at, g=1.):
    n = int(.4 * SR); t = np.arange(n) / SR
    adds(np.sin(2 * np.pi * (300 + 250 * np.sin(t * 30) * np.exp(-t * 6)) * t) * np.exp(-t * 7) * .6 * g, at)
def whistle_up(at, dur=1.3, g=.6):
    n = int(dur * SR); t = np.arange(n) / SR; f = 500 + 1500 * (t / dur) ** 1.5
    adds(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .05, dur, 1, .2) * g, at)
def twinkle(at):
    for i, f in enumerate((2093, 2637, 3136)): beep(at + i * .06, f, .1)
def knock(at):
    for i in range(2): clunk(at + i * .18, .9)

hus_words = [w['start'] for w in words['words'] if w.get('hus')]
for h in hus_words: punch(h, 1.0)
for e in EV:
    for h in e['hus']: punch(h, .85)
    for k, amp in e['kicks']:
        if not any(abs(k - h) < .08 for h in hus_words + [x for ev in EV for x in ev['hus']]): punch(k, .5 + amp)
# crowd beds in the arena
for li0, li1, g in ((0, 6, .16), (6, 10, .14), (16, 19, .12), (21, 23, .22)): cheer(T(li0), T(li1) if li1 < 24 else LE[li1 - 1], g)
laugh(T(7), T(8)); laugh(T(18), T(18) + 1.2)
# reward chings (food appears on Sandwich / Burger / Steak / A feast / crumb)
def wstart(li, j): return [w for w in words['words'] if w['p'] == li][j]['start']
for li, j in ((2, 4), (3, 1), (4, 1), (5, 4)): ching(wstart(li, j) - .03, .9)
bwomp(wstart(9, 5)); boing(wstart(8, 7) + .2)
boom(T(16) + (wstart(16, 5) - T(16)) + .1); boom(wstart(19, 0) + .55); boom(wstart(21, 5) + .05)
whistle_up(wstart(21, 6) + .05); twinkle(wstart(21, 6) + 1.05)
for i in range(6): popfx(wstart(22, 0) + i * .12, .7)
knock(wstart(24, 2) - .1); bwomp(wstart(24, 5))

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
sec = np.interp(t_all, [0, T(10) - .3, T(10), T(13) - .2, T(13), T(19), T(19) + .4, T(21), T(21) + .2, T(24), T(24) + .3, DUR], [1, 1, .8, .8, 1.2, 1.2, .6, .6, 1.4, 1.4, .5, .5])
music = music * sec[:, None]
music = norm(music, .5) * duck[:, None]
sfx = norm(sfx, .6)
mix = music * 1.0 + sfx * .7 + voice[:, None] * 1.0 / (np.abs(voice).max() + 1e-9) * .75
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
sf.write(os.path.join(HERE, 'mix_raw.wav'), mix.astype(np.float32), SR)
sf.write(os.path.join(HERE, 'music.wav'), music.astype(np.float32), SR)
sf.write(os.path.join(HERE, 'sfx.wav'), sfx.astype(np.float32), SR)
print('wrote', DUR, 's')
