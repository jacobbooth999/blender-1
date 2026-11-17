# Dustbury EP.1 — original score + foley + Adam voice, all synthesised here. Output: mix.wav (48 kHz stereo).
import sys, os, json, wave, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../core/audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, brown, whoosh, thump, pop, ding, rumble, compress, limit, add, clack
from scipy.signal import resample_poly

EVJ = json.load(open(os.path.join(HERE, 'events.json'))); DUR = EVJ['dur']; EV = EVJ['ev']
N = int(DUR * SR); rng = np.random.default_rng(3)
mus = np.zeros((N, 2)); fx = np.zeros((N, 2)); vo = np.zeros((N, 2))
# key times from the events
cue = {e['name']: e['t'] for e in EV if e['type'] == 'cut'}
first = lambda ty: next(e['t'] for e in EV if e['type'] == ty)
T_REVEAL, T_SCRATCH, T_FLICKER, T_STAKES, T_ZERO, T_REWIND = first('whoosh'), first('scratch'), first('flicker'), cue['stakes'], first('boom'), first('rewind')
T_FOLLOW, T_LOOP = 60.3, cue['loop']
VO_T = {e['id']: e['t'] for e in EV if e['type'] == 'vo'}

mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
def env_ad(d, a=.003, tau=.3): x = t_(d); return np.minimum(1, x / a) * np.exp(-x / tau)
def marimba(m, d=.9, v=1.):
    f = mtof(m); x = t_(d)
    return v * (np.sin(2 * np.pi * f * x) * env_ad(d, .002, .32) + .35 * np.sin(2 * np.pi * 3.93 * f * x) * env_ad(d, .001, .05) + .08 * np.sin(2 * np.pi * 9.2 * f * x) * env_ad(d, .001, .015))
def kalimba(m, d=1.4, v=1.):
    f = mtof(m); x = t_(d)
    return v * (np.sin(2 * np.pi * f * x) * env_ad(d, .002, .55) + .25 * np.sin(2 * np.pi * 5.4 * f * x) * env_ad(d, .001, .08) + .1 * np.sin(2 * np.pi * 2 * f * x) * env_ad(d, .002, .2))
def bass(m, d=.55, v=1.):
    f = mtof(m); x = t_(d); s = np.sin(2 * np.pi * f * x) + .3 * np.sin(2 * np.pi * 2 * f * x)
    return v * lp(s * env_ad(d, .006, .25), 900)
def kick(v=1.):
    d = .3; x = t_(d); f = 45 + 95 * np.exp(-x / .04); ph = 2 * np.pi * np.cumsum(f) / SR
    return v * np.sin(ph) * env_ad(d, .001, .12)
def shaker(v=1.): return v * hp(noise(.06), 6000) * env_ad(.06, .004, .018)
def clap(v=1.):
    d = .2; s = np.zeros(int(d * SR))
    for o in (0, .011, .022): k = int(o * SR); n = bp(noise(d - o), 900, 2600) * env_ad(d - o, .001, .03 if o < .02 else .08); s[k:k + len(n)] += n
    return v * s * .6
def pad(ms, d, v=1., cut=1100):
    x = t_(d); s = np.zeros(len(x))
    for m in ms:
        for det in (-.08, .08): f = mtof(m) * 2 ** (det / 12); s += 2 * ((x * f) % 1) - 1
    a = np.minimum(1, x / .4) * np.minimum(1, (d - x) / .4)
    return v * lp(s, cut) * a / (len(ms) * 2)

# —— score ——
BPM = 100; B = 60 / BPM
CH = {'C': [48, 60, 64, 67], 'Am': [45, 57, 60, 64], 'F': [41, 57, 60, 65], 'G': [43, 55, 59, 62], 'Em': [40, 55, 59, 64], 'Dm': [38, 57, 62, 65]}
def groove(t0, t1, prog, mel=None, bright=0., claps=False, vel=1.):
    bar = 4 * B; nb = int(np.ceil((t1 - t0) / bar))
    for i in range(nb):
        tb = t0 + i * bar; c = CH[prog[i % len(prog)]]
        if tb >= t1: break
        add(mus, pad(c[1:], min(bar, t1 - tb) + .3, .10 * vel), tb, 1, 0)
        for k in range(8):   # marimba ostinato in eighths
            tt = tb + k * B / 2
            if tt >= t1: break
            pat = [c[1], c[2] + 12, c[3], c[2] + 12, c[1] + 12, c[3], c[2] + 12, c[3] + 12 * (k == 7)]
            add(mus, marimba(pat[k], .7, (.22 if k % 2 else .3) * vel), tt, 1, (-.3 if k % 2 else .3))
        for k in range(4):
            tt = tb + k * B
            if tt >= t1: break
            add(mus, bass(c[0] + (12 if k == 2 and bright else 0), .5, .5 * vel), tt, 1, 0)
            if k in (0, 2): add(mus, kick(.55 * vel), tt, 1, 0)
            if claps and k in (1, 3): add(mus, clap(.35 * vel), tt, 1, 0)
            for h in range(2): add(mus, shaker(.12 * vel), tt + h * B / 2 + .01, 1, .4)
        if mel:
            for (off, m, d) in mel[i % len(mel)]:
                tt = tb + off * B
                if tt < t1: add(mus, kalimba(m + int(12 * bright), d, .32 * vel), tt, 1, -.15)
# melodies (per bar: [beat offset, midi, dur])
M1 = [[(0, 72, 1), (1, 76, .6), (1.5, 74, .6), (2, 72, 1.2)], [(0, 69, 1), (1.5, 72, .6), (2, 76, 1.4)], [(0, 77, .8), (1, 76, .6), (2, 72, 1)], [(0, 74, 1), (1, 71, .6), (2, 67, 1.8)]]
M2 = [[(0, 76, .8), (.5, 79, .6), (1, 81, 1), (2.5, 79, .6), (3, 76, .8)], [(0, 74, 1), (1, 76, .6), (1.5, 77, .6), (2, 79, 1.5)], [(0, 81, .8), (1, 79, .6), (2, 76, 1)], [(0, 72, 1), (.5, 74, .6), (1, 76, 2)]]
# hook: a short plucked call + rising tone into the slam, then a light motif under the first lines
for k, m in enumerate([72, 76, 79]): add(mus, kalimba(m, 1.0, .25), .55 + k * .18, 1, 0)
groove(1.25, T_REVEAL, ['C', 'G'], None, 0, False, .55)
# main tour groove (melancholy-cute)
groove(T_REVEAL, T_SCRATCH, ['Am', 'F', 'C', 'G'], M1, 0, False, .9)
# mystery: drone + bell
x = t_(T_STAKES - T_SCRATCH); dr = (np.sin(2 * np.pi * 55 * x) + .5 * np.sin(2 * np.pi * 82.4 * x * 1.003) + .3 * np.sin(2 * np.pi * 110.2 * x))
dr = lp(dr, 400) * np.minimum(1, x / 1.2) * np.minimum(1, (x[-1] - x) / .4)
add(mus, dr * .22, T_SCRATCH + .2, 1, 0)
add(mus, kalimba(81, 3, .25), T_FLICKER + .02, 1, .2); add(mus, kalimba(69, 3, .22), T_FLICKER + .02, 1, -.2)
# stakes: ticking + pulsing low Am, cut at zero
for k in range(int((T_ZERO - T_STAKES) / (B / 2))):
    tt = T_STAKES + .3 + k * B / 2
    if tt < T_ZERO: add(mus, clack(1.8 if k % 2 else 1.4, .25), tt, 1, .3 if k % 2 else -.3)
for k in range(int((T_ZERO - T_STAKES) / B)):
    tt = T_STAKES + .3 + k * B
    if tt < T_ZERO - .1: add(mus, bass(33 if (k // 4) % 2 == 0 else 29, .55, .55), tt, 1, 0)
add(mus, pad([57, 60, 64], T_ZERO - T_STAKES, .07, 800), T_STAKES, 1, 0)
# hope: the vote groove (brighter, claps) and the outro
groove(T_REWIND + .25, T_FOLLOW, ['F', 'G', 'C', 'Am'], M2, 0, True, .95)
groove(T_FOLLOW, DUR, ['F', 'G', 'C', 'C'], M2[2:] + M2[:2], 0, True, .85)
# riser into the comment beat (energy peak)
x = t_(1.2); add(mus, bp(noise(1.2), 800, 5000) * (x / 1.2) ** 2 * .25, cue['comment'] - 1.2, 1, 0)

# —— foley ——
def riser(d=.3): x = t_(d); f = 300 + 1500 * (x / d) ** 2; return np.sin(2 * np.pi * np.cumsum(f) / SR) * (x / d) * .5 + bp(noise(d), 1500, 7000) * (x / d) ** 2 * .3
def crickets(d):
    x = t_(d); s = np.sin(2 * np.pi * 4600 * x) * (np.sin(2 * np.pi * 30 * x) > .2) * ((x % .45) < .16)
    return s * .25
def gloop():
    d = .6; x = t_(d); f = 160 + 500 * (x / d); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * (.6 + .4 * np.sin(2 * np.pi * 22 * x)) * env_ad(d, .01, .25)
    return s + lp(noise(d), 700) * env_ad(d, .002, .05) * .6
def zap():
    d = .7; x = t_(d); s = bp(noise(d), 1800, 7000) * (rng.random(len(x)) > .985).astype(float).cumsum() % 2
    buzz = (2 * ((x * 120) % 1) - 1) * .3 * env_ad(d, .002, .2)
    return (bp(noise(d), 1500, 6000) * ((np.floor(x * 40) % 3) == 0) * env_ad(d, .001, .25) * .8 + buzz) * .8
def boing():
    d = .7; x = t_(d); f = 260 * (1 + .6 * np.sin(2 * np.pi * 9 * x) * np.exp(-x / .25)) * (1 + x * .4)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(d, .003, .3) * .6
def clang():
    d = 1.4; x = t_(d); return sum(a * np.sin(2 * np.pi * f * x) * np.exp(-x / tau) for f, a, tau in [(523, .5, .5), (1340, .3, .3), (2210, .2, .2), (3100, .1, .12)]) * .55
def scratch():
    d = .45; x = t_(d); fc = 400 + 2600 * np.abs(np.sin(np.pi * x / d * 2.2)); out = np.zeros(len(x)); src = noise(d) * (2 * ((x * (180 + 400 * np.sin(np.pi * x / d * 2.2))) % 1) - 1)
    for k in range(0, len(x), 480): out[k:k + 480] = bp(src[k:k + 480], max(200, fc[k] * .7), min(10000, fc[k] * 1.6), 1)
    return out * env_ad(d, .005, .3) * 1.2
def braam(d=2.2):
    x = t_(d); s = sum(2 * ((x * f) % 1) - 1 for f in (55, 55.4, 110.3)); return lp(s, 600) * np.minimum(1, x / .05) * np.exp(-x / .9) * .35
def flicker():
    d = .7; x = t_(d); return bp(noise(d), 300, 3000) * ((np.floor(x * 20) % 2) == 0) * .25 * env_ad(d, .001, .5)
def alarm(): return np.concatenate([kalimba(76, .3, .6)[:int(.22 * SR)], kalimba(72, .8, .6)])
def boom(): x = t_(2.5); return (np.sin(2 * np.pi * (38 + 40 * np.exp(-x / .15)) * x) * np.exp(-x / .7) * .9 + lp(noise(2.5), 200) * np.exp(-x / .5) * .5)
def sinkfx():
    d = 2.6; x = t_(d); f = 420 * np.exp(-x / 1.1) + 60; return np.sin(2 * np.pi * np.cumsum(f) / SR) * .25 * np.minimum(1, x / .1) * np.exp(-x / 1.5) + rumble(d, .6)[:len(x)] * .5
def rewind():
    d = .6; x = t_(d); f = 600 + 2400 * (x / d) ** 1.5; s = np.sin(2 * np.pi * np.cumsum(f * (1 + .3 * np.sin(2 * np.pi * 37 * x))) / SR) * .3 + bp(noise(d), 2000, 8000) * .3
    return s * np.minimum(1, x / .05) * np.minimum(1, (d - x) / .05)
def coin(p=1.): d = .5; x = t_(d); return sum(a * np.sin(2 * np.pi * f * p * x) * np.exp(-x / tau) for f, a, tau in [(2400, .4, .15), (3900, .3, .1), (5600, .15, .06)])
def sparkle(): out = np.zeros(int(1.4 * SR)); [out.__setitem__(slice(int(k * .07 * SR), int(k * .07 * SR) + int(.8 * SR)), out[int(k * .07 * SR):int(k * .07 * SR) + int(.8 * SR)] + kalimba(84 + [0, 4, 7, 12, 16, 19][k], .8, .35)) for k in range(6)]; return out
def hum(): x = t_(1.4); return (thump(.8, 60)[:len(x)] if len(thump(.8, 60)) >= len(x) else np.pad(thump(.8, 60), (0, len(x) - len(thump(.8, 60))))) * .7 + np.sin(2 * np.pi * 120 * x) * .08 * np.minimum(1, x / .3) * np.exp(-x / .9)

for e in EV:
    t, ty = e['t'], e['type']
    if ty == 'thump': add(fx, riser(.22), max(0, t - .22), .6, 0); add(fx, thump(1.2, 55), t, 1.0, 0); add(fx, clack(.7, .8), t, .7, 0)
    elif ty == 'whoosh': add(fx, whoosh(.45, .5 if e.get('soft') else .9), t - .2, .5 if e.get('soft') else .8, 0)
    elif ty == 'pop': add(fx, pop(1.0), t, .55 if e.get('hi') else .4, 0)
    elif ty == 'tag': add(fx, pop(1.0), t, .4, .2); add(fx, ding(.4), t + .03, .15, .2)
    elif ty == 'crickets': add(fx, crickets(e.get('d', 1.6)), t, .35, .3)
    elif ty == 'gloop': add(fx, gloop(), t, .8, 0)
    elif ty == 'zap': add(fx, zap(), t, .55, .2)
    elif ty == 'boing': add(fx, boing(), t, .55, 0)
    elif ty == 'clang': add(fx, clang(), t, .5, .2)
    elif ty == 'scratch': add(fx, scratch(), t - .05, .7, 0)
    elif ty == 'flicker': add(fx, flicker(), t, .7, 0); add(fx, braam(), t + .55, .9, 0)
    elif ty == 'alarm': add(fx, alarm(), t, .45, 0)
    elif ty == 'boom': add(fx, boom(), t, 1.0, 0)
    elif ty == 'sink': add(fx, sinkfx(), t, .8, 0)
    elif ty == 'rewind': add(fx, rewind(), t - .3, .7, 0)
    elif ty == 'coins':
        for k in range(10): add(fx, coin(1 + .1 * rng.standard_normal()), t + k * .045, .25, rng.uniform(-.5, .5))
    elif ty == 'card': add(fx, whoosh(.3, .5), t - .12, .35, 0); add(fx, pop(1.0), t, .5, 0)
    elif ty == 'sparkle': add(fx, sparkle(), t, .5, .1)
    elif ty == 'hum': add(fx, hum(), t, .6, 0)
    elif ty == 'cut': add(fx, whoosh(.25, .4), t - .1, .18, 0)
# caption emphasis ticks: one soft pop on each big-caps word
SC = json.load(open(os.path.join(HERE, 'script.json'))); WD = json.load(open(os.path.join(HERE, 'voices/words.json')))
for L in SC:
    for w in WD[L['id']]['words']:
        if L['emph'].get(w['w']) == 'caps': add(fx, pop(1.0), VO_T[L['id']] + w['s'] - .02, .22, 0)
# ambience: soft wind bed (a quiet town), birds only once the vote turns hopeful
add(fx, lp(brown(DUR), 500) * .05, 0, 1, 0)

# —— voice (Adam), compressed ——
for vid, t in VO_T.items():
    w = wave.open(os.path.join(HERE, f'voices/{vid}.wav')); sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
    a = resample_poly(a, SR, sr); a = hp(a, 80); a = compress(norm(a, .9), .3, 3.0) * 1.0
    add(vo, a, t, 1.0, 0)
# duck the music under the voice (-8 dB), with a smooth envelope
act = np.abs(vo[:, 0]); from scipy.ndimage import maximum_filter1d, uniform_filter1d
act = uniform_filter1d(maximum_filter1d(act, int(.15 * SR)), int(.12 * SR)); duck = 1 - .6 * np.clip(act / .08, 0, 1)
mus *= duck[:, None]
# digital silence right after the record scratch (the pattern break)
s0, s1 = int((T_SCRATCH + .3) * SR), int((T_SCRATCH + .7) * SR); mus[s0:s1] *= np.linspace(1, 0, s1 - s0)[:, None] * 0
# balance by RMS: voice ~10 dB over music
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
vr = rms(vo[np.abs(vo[:, 0]) > .01]); mus *= (vr / 3.2) / rms(mus); fx *= .9
out = vo + mus + fx * .85
out[:, 0] = limit(out[:, 0], .95); out[:, 1] = limit(out[:, 1], .95)
out = (np.clip(out, -1, 1) * 32767).astype(np.int16)
wf = wave.open(os.path.join(HERE, 'mix.wav'), 'w'); wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes(out.tobytes()); wf.close()
print('mix.wav', DUR, 's')
