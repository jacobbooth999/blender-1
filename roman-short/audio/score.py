# Sound for "The Empire Built With Shovels": an original comic Roman march (F major, 120 bpm, composed + synthesized
# here) and a synthesized SFX stem, both timed to the narration's word times (voice/words.json), mixed with the
# voice. Standard mix from the skill: music +3 dB, SFX -6 dB (relative to their reference levels), voice unchanged;
# music ducked under speech; master -15 LUFS integrated, <= -1 dBTP. Writes audio/mix.wav + stems + cues.md.
import json, os, sys
import numpy as np
from dsp import SR, ns, rng, pan, st, place, fades, lp, hp, bp, integrated, momentary_max, true_peak, read_wav, write_wav, make_ir, convolve_st, smooth_noise
import instruments as I
import sfx_gen as G

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
VO = json.load(open(os.path.join(ROOT, "voice", "words.json")))
DUR = VO["duration"]; N = ns(DUR)
W = VO["words"]; SEN = VO["sentences"]

def ws(si, word="", n=1):
    if not word: return SEN[si]["start"]
    k = 0
    for w in W:
        if w["s"] == si and w["word"].lower().replace("'", "") == word.lower().replace("'", ""):
            k += 1
            if k == n: return w["start"]
    raise KeyError((si, word))
se = lambda si: SEN[si]["end"]
R0 = rng(410)
rr = lambda: rng(int(R0.integers(1 << 30)))
F = I.m2f

# ============================================================ music
Q = 0.5; BAR = 4 * Q
T0 = ws(1, "shovel")  # the march starts on the shovel stab
mus = {k: np.zeros((2, N)) for k in ["melody", "brass", "bass", "drums", "perc", "hits"]}  # "hits" = stingers, ducked only half
def put(stem, x, t, p=0.0, g=1.0):
    if t < 0 or t >= DUR: return
    place(mus[stem], pan(x, p) if np.ndim(x) == 1 else x, t, g)

# theme: (bar, beat, quarters, midi) - our own tune
THEME = [(0, 0, 1, 77), (0, 1, 1, 81), (0, 2, 1, 84), (0, 3, 1, 81),
         (1, 0, 1.5, 82), (1, 1.5, .5, 81), (1, 2, 2, 77),  # Bb A F over Bb (was a held G)
         (2, 0, 1, 79), (2, 1, 1, 82), (2, 2, 1, 86), (2, 3, 1, 82),
         (3, 0, 1, 81), (3, 1, 1, 79), (3, 2, 1, 77), (3, 3, 1, 72),
         (4, 0, 1, 77), (4, 1, 1, 81), (4, 2, 1, 84), (4, 3, 1, 89),
         (5, 0, .5, 88), (5, .5, .5, 86), (5, 1, 1, 84), (5, 2, 1, 82), (5, 3, 1, 81),
         (6, 0, .5, 79), (6, .5, .5, 81), (6, 1, 1, 82), (6, 2, 1, 79), (6, 3, 1, 76),
         (7, 0, 3, 77)]
CHORDS = ["F", "Bb", "Gm", "F", "F", "Gm6", "C7", "F"]  # bar 5 melody E-D-C-Bb-A: Gm6 (G Bb D E), not Bb (E vs Bb tritone)
# shortened phrases always end on the cadence (C7 -> F): which theme bars to play for a section n bars long
PHRASE = {1: [7], 2: [6, 7], 3: [0, 6, 7], 4: [0, 1, 6, 7], 5: [0, 1, 2, 6, 7], 6: [0, 1, 4, 5, 6, 7], 7: [0, 1, 2, 4, 5, 6, 7], 8: list(range(8))}
def phrase_bars(n):
    out = []
    while n > 0:
        k = min(8, n) if n != 9 else 5  # avoid a lone 1-bar tail
        out += PHRASE[k]; n -= k
    return out
def chords_of(bars): return [CHORDS[b] for b in bars]
CH = {"F": (41, 48, [57, 60, 65]), "Bb": (46, 41, [58, 62, 65]), "Gm": (43, 38, [58, 62, 67]), "C7": (36, 43, [58, 60, 64]),
      "C": (36, 43, [55, 60, 64]), "Dm": (38, 45, [57, 62, 65]), "A7": (45, 40, [57, 61, 64]), "Gm6": (43, 38, [58, 62, 64])}

def theme(t0, bars=8, inst="fife", vel=0.6, trans=0, gate=0.9, p=0.15):
    """bars: number of bars (-> phrase_bars, ends on the cadence) or an explicit list of theme bar indices"""
    seq = phrase_bars(bars) if isinstance(bars, (int, np.integer)) else list(bars)
    for (b, beat, ln, m) in THEME:
      for pos, bb in enumerate(seq):
        if bb != b: continue
        t = t0 + pos * BAR + beat * Q
        if inst == "fife": put("melody", I.fife(F(m + trans), ln * Q * gate, vel, rr()), t, p)
        elif inst == "glock": put("melody", I.glock(F(m + trans + 12), vel, rr(), dur=1.2), t, p, 0.8)
        elif inst == "horn": put("brass", I.brass(F(m + trans - 12), ln * Q * gate, vel, rr(), kind="horn"), t, -0.2)
        elif inst == "pluck": put("melody", I.pluck(F(m + trans), vel, rr(), dur=0.5, bright=0.6), t, p)

def oompah(t0, chords, vel=0.6, pah=True, kind="tuba"):
    for i, c in enumerate(chords):
        root, fifth, triad = CH[c]; tb = t0 + i * BAR
        put("bass", I.brass(F(root), Q * 0.8, vel, rr(), kind=kind), tb, 0.0)
        put("bass", I.brass(F(fifth), Q * 0.8, vel * 0.85, rr(), kind=kind), tb + 2 * Q, 0.0)
        if pah:
            for beat in (1, 3):
                for m in triad: put("brass", I.brass(F(m), Q * 0.45, vel * 0.32, rr(), kind="stab"), tb + beat * Q, 0.25, 0.6)

def snare_bars(t0, bars, vel=0.4, busy=False):
    for b in range(bars):
        tb = t0 + b * BAR
        steps = [0, 2, 3, 4, 6, 8, 10, 11, 12, 14] if busy else [2, 6, 10, 14, 15]
        for s in steps: put("drums", I.snare(vel * (1.0 if s % 4 == 2 else 0.6), rr(), dur=0.25), tb + s * Q / 4, 0.1)
        put("drums", I.timpani(F(41), vel * 0.5, rr(), dur=0.8), tb, -0.1)

def brushes(t0, bars, vel=0.35):
    for b in range(bars):
        for beat in (1, 3): put("drums", I.brush(vel, rr(), dur=0.3), t0 + b * BAR + beat * Q, 0.1)

def stab(t, chord="F", vel=0.9, cym=True, tim=True):
    root, fifth, triad = CH[chord]
    for m in triad + [m + 12 for m in triad]: put("hits", I.brass(F(m), 0.5, vel * 0.5, rr(), kind="stab"), t, 0.0)
    put("hits", I.brass(F(root), 0.6, vel, rr(), kind="tuba"), t)
    if cym: put("hits", I.cymbal(vel * 0.7, rr(), dur=2.2), t, 0.3)
    if tim: put("hits", I.timpani(F(root), vel, rr(), dur=1.6), t, -0.2)

def bars_between(t0, t1): return max(0, int((t1 - t0) // BAR))
def grid(t): return T0 + np.ceil((t - T0) / BAR - 1e-6) * BAR

# hook: snare roll into the stab on "shovel"
for (t, v) in I.snare_roll(0.4, T0 - 0.02, 0.1, 0.55, rr(), rate=22): put("drums", I.snare(v, rr(), dur=0.2, buzz=True), t, 0.1)
put("perc", I.timpani(F(36), 0.5, rr(), dur=3.0), 0.4)
stab(T0, "F", 1.0)
# A: march (Rome .. army)
tA1 = ws(15) - 0.3
t = T0 + BAR
nA = bars_between(t, tA1)
k = 0
while k < nA:
    n = min(8, nA - k)
    tb = t + k * BAR
    oompah(tb, chords_of(phrase_bars(n)), vel=0.55 if k < 8 else 0.62)
    snare_bars(tb, n, 0.35 if k < 8 else 0.42, busy=k >= 8)
    theme(tb, n, "fife", 0.55 if k < 8 else 0.6)
    if k >= 8: theme(tb, n, "horn", 0.35)
    k += 8
# B: the Rhine - tension in D minor, rest on "There are no boats", hammer build, stab on "days"
tB = ws(15) - 0.3; tNB = ws(16) - 0.1; tBu = ws(17); tDays = ws(18, "days")
for i in range(bars_between(tB, tNB) + 1):
    tb = tB + i * BAR
    if tb >= tNB - 0.2: break
    for j in range(8):
        tt = tb + j * Q / 2
        if tt < tNB - 0.1: put("bass", I.brass(F(38 if j % 4 < 2 else 45), Q * 0.4, 0.45, rr(), kind="tuba"), tt)
    put("perc", I.timpani(F(38), 0.55, rr(), dur=1.2), tb)
    put("brass", I.brass(F(62), min(BAR * 0.95, tNB - 0.15 - tb), 0.25, rr(), kind="soft", rel=0.25), tb, -0.3)  # never rings into the rest
nb = int((tDays - tBu) / Q)
for j in range(nb):
    tt = tBu + j * Q; v = 0.25 + 0.5 * j / max(1, nb)
    put("drums", I.snare(v, rr(), dur=0.2), tt, 0.1)
    put("bass", I.brass(F([38, 41, 43, 45][j % 4]), Q * 0.45, 0.35 + 0.3 * j / nb, rr(), kind="tuba"), tt)
    if j % 2 == 0: put("perc", I.timpani(F(38), 0.3 + 0.4 * j / nb, rr(), dur=0.7), tt)
stab(tDays, "F", 1.0)
# deadpan: silence on "Luckily", then a sad tuba fall after "torn down"
tSad = ws(20, "torn") + 0.6
for i, m in enumerate([46, 45, 44, 43]): put("hits", I.brass(F(m), 0.45 if i < 3 else 1.2, 0.7, rr(), kind="tuba", fall=(-1.0 if i == 3 else 0), rel=0.2), tSad + i * 0.5)
# Caesar walks back across the bridge: sneaky staccato pizzicato tiptoe in D minor (stops before "torn")
tTip = ws(20, "caesar") - 0.1; tTorn = ws(20, "torn")
for j, m in enumerate([50, 53, 57, 53, 50, 53, 57, 60, 58, 57, 55, 52]):
    tt = tTip + j * Q
    if tt > tTorn - 0.35: break
    put("melody", I.pluck(F(m), 0.38, rr(), dur=0.3, bright=0.4), tt, -0.15)
    if j % 2 == 0: put("bass", I.pluck(F(m - 12), 0.4, rr(), dur=0.35, bright=0.2), tt, 0.1)
# C: delivery - bouncy pluck + glock, brushes
tC = grid(ws(21) + 0.4); tC1 = ws(27) - 0.4
nC = bars_between(tC, tC1)
for k in range(0, nC, 8):
    n = min(8, nC - k); tb = tC + k * BAR
    for i, c in enumerate(chords_of(phrase_bars(n))):
        root, fifth, _ = CH[c]
        for beat, m in ((0, root + 12), (1, fifth + 12), (2, root + 12), (3, fifth + 12)): put("bass", I.pluck(F(m), 0.55, rr(), dur=0.4, bright=0.3), tb + i * BAR + beat * Q, -0.1)
    brushes(tb, n)
    theme(tb, n, "glock", 0.42)
# D: Romanisation -> peak: theme returns warm, tutti at the peak, shimmer on the golden milestone
tD = grid(ws(27) - 0.2); tPeak = ws(31) - 0.2; tE = ws(33) - 0.3
nD = bars_between(tD, tPeak)
for k in range(0, nD, 8):
    n = min(8, nD - k); tb = tD + k * BAR
    oompah(tb, chords_of(phrase_bars(n)), 0.45, pah=False, kind="soft"); theme(tb, n, "horn", 0.4); brushes(tb, n, 0.25)
stab(tPeak, "F", 0.9)
nP = bars_between(tPeak, tE)
oompah(tPeak, chords_of(phrase_bars(nP)), 0.65); snare_bars(tPeak, nP, 0.45, busy=True); theme(tPeak, nP, "fife", 0.62); theme(tPeak, nP, "horn", 0.45)
tg = ws(32, "golden")
for i, m in enumerate([77, 81, 84, 89, 93, 96]): put("perc", I.glock(F(m), 0.45, rr(), dur=1.6), tg + i * 0.09, 0.3)
put("perc", I.triangle(0.4, rr(), dur=2.0), tg + 0.3, 0.4)
# E: the gate - theme softly, then the Goths: minor ostinato, final stinger on "gate"
tGo = ws(34, "right") - 0.1; tGate = ws(34, "gate")
nE = bars_between(tE, tGo)
oompah(tE, chords_of(phrase_bars(max(1, nE))), 0.4, pah=False, kind="soft"); theme(tE, max(1, nE), "fife", 0.45)
for j in range(int((tGate - tGo) / (Q / 2))):
    tt = tGo + j * Q / 2
    put("bass", I.brass(F([38, 38, 45, 44][j % 4]), Q * 0.4, 0.45 + 0.25 * j / 20, rr(), kind="tuba"), tt)
    if j % 4 == 0: put("perc", I.timpani(F(38), 0.5, rr(), dur=1.0), tt)
tail = DUR - tGate - 0.05
for m in [38, 50, 53, 56]: put("hits", I.brass(F(m), min(1.6, tail - 0.3), 0.8, rr(), kind="horn" if m > 40 else "tuba", rel=0.3), tGate, 0.0)
put("hits", fades(I.timpani(F(38), 1.0, rr(), dur=tail), 0.001, 0.4), tGate); put("hits", fades(I.cymbal(0.7, rr(), dur=tail), 0.0005, 0.6), tGate, 0.2)

hits = mus.pop("hits")
music = sum(mus.values())
ir = make_ir(1.4, 7)
music = 0.85 * music + 0.25 * convolve_st(music, ir)[:, :N]
hits = 0.85 * hits + 0.25 * convolve_st(hits, ir)[:, :N]

# ============================================================ SFX
events = []  # (t, x, naive LU relative to the voice, pan, desc)
def ev(t, x, lu, p=0.0, desc=""):
    if 0 <= t < DUR: events.append((t, x, lu, p, desc))
def noise(n, r): return r.standard_normal(n)
def mixa(*xs):
    """sum of mono/stereo signals of any lengths -> stereo"""
    ys = [st(np.asarray(x, float)) for x in xs]; n = max(y.shape[1] for y in ys); out = np.zeros((2, n))
    for y in ys: out[:, : y.shape[1]] += y
    return out
def scrape(r, dur=0.22):
    n = ns(dur); tt = np.arange(n) / SR
    return bp(noise(n, r), 300, 2600, 2) * np.exp(-tt / 0.07) * (1 - np.exp(-tt / 0.01))
def thunk(r):
    n = ns(0.25); tt = np.arange(n) / SR
    return lp(noise(n, r), 400, 2) * np.exp(-tt / 0.05) * 2 + np.sin(2 * np.pi * 90 * tt) * np.exp(-tt / 0.08)
def bloop(r, f0=500, f1=1200):
    n = ns(0.18); tt = np.arange(n) / SR; f = f0 + (f1 - f0) * (tt / tt[-1]) ** 0.6
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.07) * (1 - np.exp(-tt / 0.004))
def hiss(r, dur):
    n = ns(dur); tt = np.arange(n) / SR
    return bp(noise(n, r), 2500, 9000, 2) * np.minimum(1, tt / 0.05) * np.minimum(1, (dur - tt) / 0.3)
def shing(r):
    return mixa(G.clink(r, f0=2400, dur=0.5, bright=1.4), 0.4 * hiss(r, 0.35))
def snort(r):
    n = ns(0.45); tt = np.arange(n) / SR
    return bp(noise(n, r), 150, 900, 2) * np.exp(-((tt - 0.12) / 0.09) ** 2) * 1.5 + lp(noise(n, r), 120, 2) * np.exp(-tt / 0.15)
def crackle(dur, r):
    return G.rattle(dur, r, density=9.0)

# beds (relative integrated loudness vs voice, not reduced by SFX_DB)
beds = []
def bed(t0, t1, x, lu, desc):
    y = st(np.asarray(x, float)); n = ns(t1 - t0)
    if y.shape[1] < n: y = np.tile(y, (1, int(np.ceil(n / y.shape[1]))))
    beds.append((t0, y[:, :n], lu, desc))
shot_t = {}  # filled from the shot list order (same as story.ts SEEDS)
def S(si, w="", n=1): return ws(si, w, n)
# hook
ev(0.25, shing(rr()), -6, 0.2, "gladius shing")
tS = S(1, "shovel")
ev(tS + 0.05, thunk(rr()), -2, 0, "shovel bites")
for k in range(4): ev(tS + 0.6 + k / 1.3, scrape(rr()), -10, -0.1, "dig scrape")
bed(0, ws(2) - 0.1, G.breeze(ws(2), rr(), 0.6), -26, "field breeze")
# Rome / ridge
bed(ws(2), ws(3, "surrounded"), mixa(G.babble(4.5, rr(), 160, 1.0), G.bird_chirps(4.5, rr(), 0.6)), -24, "city murmur + birds")
bed(ws(3, "surrounded"), ws(4), G.crickets(3.5, rr()), -24, "evening crickets")
for k in range(3): ev(S(3, "burn") + 0.1 + k * 0.18, G.hurrah(rr(), 120 + 20 * k, 1.0), -12, -0.3 + 0.3 * k, "tribes jeer")
# mule
for i, w in enumerate(["armour", "food", "pot", "shovel"]): ev(S(5, w) - 0.02, bloop(rr(), 400 + 100 * i, 1100 + 150 * i), -10, 0.1, "kit pop: " + w)
ev(S(5, "pot") + 0.05, G.clink(rr(), f0=900, dur=0.3), -12, 0.1, "pot clank")
step_t = S(4) - 0.1
while step_t < S(8) - 0.2:
    ev(step_t, G.stroll_step(rr(), 0.4), -16, 0, "footstep")
    step_t += 0.55 if step_t < S(6) else 0.72
ev(S(6) + 0.1, G.oof(rr(), "oof"), -10, 0, "strain grunt")
ev(S(7, "mules") + 0.15, snort(rr()), -8, -0.3, "mule snort")
# camp
for k in range(int((S(10) - S(9, "dig")) * 3)): ev(S(9, "dig") + k / 3 + 0.05 * (k % 2), scrape(rr()), -14, -0.4 + 0.8 * (k % 3) / 2, "dig scrapes")
ev(S(9, "pile") - 0.05, thunk(rr()), -9, 0, "earth thump")
for k in range(6): ev(S(9, "build") + k * 0.28, G.hammer_hit(rr(), 0.6), -14, -0.5 + 0.2 * k, "stakes hammered")
bed(S(10) - 0.3, S(11), mixa(G.crickets(2.5, rr()), crackle(2.5, rr()) * 0.5), -22, "camp night: crickets + fire")
# road + layers
for k in range(int((S(12, "layer") - S(11)) * 1.6)): ev(S(11) + k / 1.6, G.hammer_hit(rr(), 0.4), -16, 0.2, "paving taps")
ev(S(12, "stone") - 0.03, G.rattle(0.6, rr(), density=60, heavy=True), -6, 0, "stone dump")
ev(S(12, "gravel") - 0.03, G.rattle(0.7, rr(), density=180), -8, 0, "gravel pour")
ev(S(12, "sand") - 0.03, hiss(rr(), 0.6), -12, 0, "sand hiss")
ev(se(12) - 0.05, G.hammer_hit(rr(), 0.8), -8, 0, "paving set")
bed(S(13), S(14), G.breeze(3.0, rr(), 1.2), -22, "high wind")
# army
tw = S(14, "week")
k = 0
while S(14) + k * 0.5 < tw: ev(S(14) + k * 0.5, G.column_stomp(rr(), 0.5)[0], -12, 0, "march step"); k += 1
k = 0
while tw + k * 0.31 < S(15) - 0.2: ev(tw + k * 0.31, G.column_stomp(rr(), 0.7)[0], -10, 0, "jog step"); k += 1
ev(tw - 0.1, G.whoosh(0.7, rr(), peak=0.3), -8, 0.3, "speed whoosh")
# Rhine
bed(S(15) - 0.3, S(21) - 0.3, G.water_bed(S(21) - S(15) + 0.5, rr(), 0.8), -22, "river")
for k in range(4): ev(S(15, "scare") + 0.2 + k * 0.25, G.hurrah(rr(), 110 + 25 * k, 1.0), -14, 0.3, "tribes taunt")
k = 0
while S(17, "build") + k * 0.5 < S(18, "days") - 0.2: ev(S(17, "build") + k * 0.5 + 0.03 * (k % 3), G.hammer_hit(rr(), 0.7), -12, -0.3 + 0.2 * (k % 4), "bridge hammering"); k += 1
for k in range(5): ev(S(18, "days") + 0.15 + k * 0.12, G.hurrah(rr(), 130 + 15 * k, 1.0), -10, -0.4 + 0.2 * k, "legion cheers")
for k in range(3): ev(S(19, "impressed") - 0.05 + k * 0.15, G.whoa(rr()), -11, -0.2 + 0.2 * k, "tribes impressed")
ev(S(19, "impressed") + 0.4, G.applause(1.4, rr(), people=12), -14, 0, "applause")
tStep = S(20, "caesar") - 0.1 - 2 * Q  # footsteps in time with the tiptoe pizzicato
while tStep < S(20, "torn") - 0.35:
    if tStep >= S(20): ev(tStep, G.stroll_step(rr(), 0.6), -16, 0, "steps on deck")
    tStep += Q
tT = S(20, "torn")
ev(tT + 0.05, G.timber_tear(rr(), 0.9), -6, 0, "timber tears"); ev(tT + 0.3, G.wood_crack(rr()), -7, 0.2, "crack")
for k in range(9):
    order = (7 - min(k, 7)) / 9; th = tT - 0.1 + (order * 0.8 + 0.15) * 1.3
    ev(th, G.splash_big(rr()), -7 - k * 0.3, -0.4 + 0.1 * k, "deck section splash")
# delivery
bed(S(21) - 0.3, S(23) - 0.3, G.babble(5.0, rr(), 150, 1.0), -24, "forum market")
ev(S(22, "pizza") - 0.03, bloop(rr(), 600, 1500), -10, 0, "pizza pop"); ev(S(22, "pizza") + 0.1, hiss(rr(), 1.5), -18, 0, "steam")
ev(S(23, "branch") - 0.15, bloop(rr(), 300, 900), -6, 0, "stall pops up"); ev(S(23, "branch") + 0.1, G.whoa(rr()), -12, 0, "villagers ooh")
k = 0
while S(24) + k * 0.26 < S(25) - 0.2: ev(S(24) + k * 0.26, G.stroll_step(rr(), 0.8), -14, 0, "runner steps"); k += 1
ev(S(24) + 0.1, G.whoosh(0.6, rr(), peak=0.25), -10, -0.4, "runner whoosh")
bed(S(25), S(26), G.breeze(2.0, rr(), 1.2), -22, "aerial wind")
ev(S(26, "soldiers") + 0.3, G.column_stomp(rr(), 0.5)[0], -12, 0.3, "soldiers pass")
ev(S(26, "letters") + 0.2, G.flag_flutter(0.8, rr()), -14, 0.2, "letters flutter")
for k in range(5): ev(S(26, "taxes") + 0.2 + k * 0.07, G.clink(rr(), f0=3000 + 300 * k, dur=0.15), -14, 0.2, "coins")
ev(S(26, "grain") + 0.3, G.oof(rr(), "oof"), -12, 0.2, "grain grunt")
# Romanisation
bed(S(27) - 0.3, S(29, "built"), mixa(G.bird_chirps(8, rr(), 0.6), 0.4 * G.babble(8, rr(), 150, 1.0)), -24, "village")
for k in range(7): ev(S(28, "roman") - 0.1 + k * 0.03, bloop(rr(), 300 + 60 * k, 900 + 80 * k), -12, -0.5 + 0.15 * k, "romanised pops")
ev(S(29, "joined") - 0.1, bloop(rr(), 250, 1000), -8, 0, "kid grows up")
for k in range(5): ev(S(29, "picked") + 0.1 + k / 1.3, scrape(rr()), -12, 0, "dig")
for k in range(6): ev(S(29, "built") + k * 0.45, G.hammer_hit(rr(), 0.5), -15, 0.2, "road crew")
for k in range(8): ev(S(30, "citizen") - 0.05 + k * 0.08, G.hurrah(rr(), 120 + 12 * k, 1.0, kid=(k % 4 == 0)), -9, -0.5 + 0.14 * k, "citizens cheer")
ev(S(30, "citizen") + 0.2, G.applause(2.4, rr(), people=30), -12, 0, "applause")
bed(S(31) - 0.3, S(32), G.breeze(4.0, rr(), 1.2), -22, "aerial wind")
bed(S(32), S(33) - 0.3, G.babble(3.5, rr(), 150, 1.0), -25, "forum murmur")
# gate + Goths
bed(S(33) - 0.3, DUR, mixa(G.bird_chirps(9, rr(), 0.4), G.breeze(9, rr(), 0.5)), -25, "evening at the gate")
k = 0
tG0 = S(34, "right")
while tG0 + k * 0.5 < S(34, "gate") + 0.2: ev(tG0 + k * 0.5, G.column_stomp(rr(), 0.4 + 0.5 * k / 12)[0], -12 + 4 * min(1, k / 10), 0, "Goth march"); k += 1
ev(S(34, "gate") + 0.1, G.whoa(rr()), -6, 0.2, "guard gasps")
# cut whooshes
for t in [S(2) - 0.15, S(7, "mules") - 0.3, S(9, "pile") - 0.15, S(13) - 0.15, S(15, "scare") - 0.15, S(20, "torn") - 0.3, S(25) - 0.15, S(31) - 0.15, S(34, "right") - 0.15]:
    ev(t - 0.2, G.whoosh(0.6, rr(), peak=0.35), -14, 0.0, "cut whoosh")

# ============================================================ mix
voice = read_wav(os.path.join(ROOT, "voice", "voice.wav"))[0]
voice = st(voice)[:, :N]; voice = np.pad(voice, ((0, 0), (0, N - voice.shape[1])))
V_INT = integrated(voice)
V_MOM = np.percentile([momentary_max(voice[:, i:i + ns(0.4)]) for i in range(0, N - ns(0.4), ns(0.4)) if np.abs(voice[:, i:i + ns(0.4)]).max() > 0.01], 50)
SFX_DB, MUSIC_DB = -6.0, 3.0
sfx = np.zeros((2, N)); cues = []
for (t, x, lu, p, desc) in sorted(events, key=lambda e: e[0]):
    y = pan(x, p) if np.ndim(x) == 1 else st(x)
    m = momentary_max(y) if y.shape[1] >= ns(0.4) else momentary_max(np.pad(y, ((0, 0), (0, ns(0.4) - y.shape[1]))))
    g = 10 ** ((V_MOM + lu + SFX_DB - m) / 20)
    place(sfx, fades(y, 0.002, 0.02) if y.ndim == 1 else y, t, g); cues.append(f"| {t:6.2f} | {desc} | {lu + SFX_DB:+.0f} LU |")
for (t0, x, lu, desc) in beds:
    y = pan(x, 0) if np.ndim(x) == 1 else st(x)
    m = integrated(y)
    if not np.isfinite(m): continue
    g = 10 ** ((V_INT + lu - m) / 20)
    y = y * g; n = y.shape[1]; e = np.minimum(1, np.minimum(np.arange(n) / ns(0.3), (n - np.arange(n)) / ns(0.3)))
    place(sfx, y * e, t0); cues.append(f"| {t0:6.2f} | bed: {desc} | {lu:+.0f} LU |")
sfx = 0.9 * sfx + 0.15 * convolve_st(sfx, make_ir(0.9, 3))[:, :N]
# ---- music: ducked under speech (mask from the word times, gaps < 0.4 s bridged so it does not pump between words),
# 60 ms look-ahead attack, ~350 ms release. Reference level: -15 LU under the voice during speech; +3 dB standard -> -12 LU.
from scipy.ndimage import minimum_filter1d, maximum_filter1d, uniform_filter1d
from scipy import signal as _sig
from dsp import kfilt
spm = np.zeros(N)
for w in W: spm[ns(w["start"]):ns(w["end"])] = 1.0
hold = ns(0.4)
spm = minimum_filter1d(maximum_filter1d(spm, hold), hold)  # closing: bridge short gaps
L6 = ns(0.06); spm = np.maximum(spm, np.concatenate([spm[L6:], np.zeros(L6)]))  # pre-roll: duck 60 ms before each phrase
spd = spm[::8]; a_rel = np.exp(-1 / (0.35 * SR / 8)); env_d = np.zeros(len(spd)); acc = 0.0
for i in range(len(spd)):  # instant attack, ~350 ms release
    acc = spd[i] if spd[i] >= acc else a_rel * acc
    env_d[i] = acc
duck = np.interp(np.arange(N), np.arange(0, N, 8)[: len(env_d)], env_d)
duck = uniform_filter1d(duck, ns(0.03))
DUCK_DB = 7.0
music *= 10 ** (-DUCK_DB * duck / 20)
hits *= 10 ** (-0.5 * DUCK_DB * duck / 20)
music = music + hits
def masked_lu(x, mask):
    z = (kfilt(x) ** 2).sum(0)
    return -0.691 + 10 * np.log10(z[mask].mean() + 1e-30)
def median_st(x, mask, win=1.0):
    """median of 1 s block loudness over blocks that are mostly speech and where the music is playing"""
    z = (kfilt(x) ** 2).sum(0); w = ns(win); out = []
    for i in range(0, N - w, w // 2):
        if mask[i:i + w].mean() > 0.6:
            L = -0.691 + 10 * np.log10(z[i:i + w].mean() + 1e-30)
            if L > -60: out.append(L)
    return float(np.median(out))
spk = np.zeros(N, bool)
for w in W: spk[ns(w["start"]):ns(w["end"])] = True
V_SP = masked_lu(voice, spk)
music *= 10 ** ((V_SP - 15 + MUSIC_DB - median_st(music, spk)) / 20)

# ---- master: normalise to -15 LUFS, true-peak limiter (4x oversampled detection, 5 ms look-ahead, 80 ms release), iterate
def limiter_gain(x, ceil_db=-1.3, la=0.005, rel=0.08):
    up = np.abs(_sig.resample_poly(x, 4, 1, axis=-1)).max(axis=0)
    pk = np.maximum(np.abs(x).max(axis=0), up.reshape(-1, 4)[: x.shape[1]].max(axis=1) if up.size >= 4 * x.shape[1] else np.abs(x).max(axis=0))
    need = np.minimum(1.0, 10 ** (ceil_db / 20) / np.maximum(pk, 1e-9))
    L = ns(la)
    gt = minimum_filter1d(need, 2 * L + 1)  # each peak's gain is reached L samples early and held L samples after
    g = gt.copy()
    idx = np.flatnonzero(gt < 1.0)
    if idx.size:
        ar = np.exp(-1 / (rel * SR))
        # release recursion only around the regions that need gain reduction
        segs = np.split(idx, np.flatnonzero(np.diff(idx) > ns(rel * 6)) + 1)
        for sgm in segs:
            a0, b0 = sgm[0], min(N, sgm[-1] + ns(rel * 6))
            acc = 1.0
            for i in range(a0, b0):
                acc = min(gt[i], 1.0 - (1.0 - acc) * ar)
                g[i] = acc
    return uniform_filter1d(g, L)  # attack smoothing; window <= look-ahead, so peaks stay under the ceiling
mix0 = voice + music + sfx
fade = np.ones(N); fade[-ns(0.6):] = 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, ns(0.6))); fade[:ns(0.005)] = np.linspace(0, 1, ns(0.005))
gain = 10 ** ((-15.0 - integrated(mix0)) / 20)
for it in range(4):
    gl = limiter_gain(mix0 * gain) * fade
    mix = mix0 * gain * gl
    li = integrated(mix); tp = true_peak(mix)
    print(f"master pass {it}: {li:.2f} LUFS, {tp:.2f} dBTP, max GR {20 * np.log10(gl[ns(0.01):-ns(0.6)].min()):.1f} dB", flush=True)
    if abs(li + 15.0) < 0.05 and tp <= -1.0: break
    gain *= 10 ** ((-15.0 - li) / 20)
assert np.isfinite(mix).all() and np.abs(mix).max() < 1.0
voice_g, music_g, sfx_g = voice * gain * gl, music * gain * gl, sfx * gain * gl  # stems sum exactly to the mix
write_wav(os.path.join(HERE, "mix.wav"), mix); write_wav(os.path.join(HERE, "stem_voice.wav"), voice_g)
write_wav(os.path.join(HERE, "stem_music.wav"), music_g); write_wav(os.path.join(HERE, "stem_sfx.wav"), sfx_g)
rep = [f"# Sound cues - The Empire Built With Shovels", "", f"Duration {DUR:.3f} s, 48 kHz stereo 24-bit.",
       f"Integrated: mix {integrated(mix):.1f} LUFS, true peak {true_peak(mix):.1f} dBTP; voice {integrated(voice_g):.1f}, music {integrated(music_g):.1f}, sfx {integrated(sfx_g):.1f} LUFS.",
       f"Music vs voice during speech: {masked_lu(music_g, spk) - masked_lu(voice_g, spk):+.1f} LU (energy), median 1 s blocks {median_st(music_g, spk) - masked_lu(voice_g, spk):+.1f} LU; music in gaps (no speech): {masked_lu(music_g, ~spk):.1f} LUFS. Ducking {DUCK_DB:.0f} dB (stingers {DUCK_DB / 2:.1f} dB).",
       "Melody/harmony: theme in F, 8-bar phrase F Bb Gm F | F Gm6 C7 F; shorter sections use a cut-down phrase that still ends on C7 -> F.",
       "", "Music: original comic Roman march (F major, 120 bpm): snare roll -> stab on 'shovel' | march (fife + tuba oom-pah) | Rhine tension in D minor,",
       "rest on 'There are no boats', hammer build, stab on 'days' | silence for the deadpan, tiptoe pizzicato as Caesar walks back, sad tuba after 'torn down' | bouncy pluck + glock delivery |",
       "warm horns -> tutti at the peak, glock shimmer on 'golden' | Goth ostinato -> stinger on 'gate'.", "", "| t (s) | cue | level |", "|---|---|---|"] + cues
open(os.path.join(HERE, "cues.md"), "w").write("\n".join(rep))
print("\n".join(rep[:5]))
