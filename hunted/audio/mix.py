# Builds the soundtrack: synthesized SFX + tension score + voices, placed from out/cues.json.
# python3 audio/mix.py  ->  out/mix.wav
import json, os, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
SR = 44100
CUES = json.load(open(os.path.join(ROOT, 'out', 'cues.json')))
DUR = CUES['duration']; N = int(DUR*SR) + SR
rng = np.random.default_rng(7)

def t_(d): return np.arange(int(d*SR))/SR
def noise(d): return rng.standard_normal(int(d*SR))
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def env(d, a=0.005, r=0.2):
    t = t_(d); return np.minimum(1, t/max(a, 1e-4)) * np.exp(-np.maximum(0, t - a)/r)
def norm(x, g=1.0): return x/(np.max(np.abs(x)) + 1e-9)*g
def reverb(x, rt=1.2, mixw=0.35, pre=0.02):
    ir = rng.standard_normal(int(rt*SR))*np.exp(-t_(rt)*6.9/rt); ir = lp(ir, 5000); ir[:int(pre*SR)] = 0
    w = fftconvolve(x, ir)[:len(x) + int(rt*SR)]; w = w/(np.max(np.abs(w)) + 1e-9)*np.max(np.abs(x))
    y = np.zeros(len(w)); y[:len(x)] += x*(1 - mixw); return y + w*mixw
def pad(x, d): y = np.zeros(int(d*SR)); y[:min(len(x), len(y))] = x[:len(y)]; return y

# ---------------- SFX ----------------
def s_bang(d):
    x = lp(noise(0.5), 7000)*env(0.5, 0.001, 0.05) + np.sin(2*np.pi*np.cumsum(np.linspace(90, 35, int(0.5*SR)))/SR)*env(0.5, 0.002, 0.12)*1.2
    return norm(reverb(x, 2.2, 0.45), 1.0)
def s_screams(d):
    d = max(d, 3.0); y = np.zeros(int(d*SR)); t = t_(d)
    for i in range(14):
        f0 = rng.uniform(380, 950); st = rng.uniform(0, 0.8); ln = rng.uniform(0.7, 1.8)
        m = (t > st) & (t < st + ln); tt = t[m] - st
        f = f0*(1 + 0.25*tt/ln)*(1 + 0.02*np.sin(2*np.pi*6*tt))
        ph = 2*np.pi*np.cumsum(f)/SR; v = np.sign(np.sin(ph))*0.5 + np.sin(ph)
        v = bp(v, 600, 2600)*np.sin(np.pi*tt/ln)**0.6
        y[m] += v*rng.uniform(0.3, 1)
    y += bp(noise(d), 300, 3000)*0.6*np.exp(-t/2.5)
    y *= np.minimum(1, (d - t)/0.8)
    return norm(reverb(y, 1.4, 0.3), 0.55)
def s_glass(d):
    y = hp(noise(1.2), 3000)*env(1.2, 0.001, 0.08)*0.8; t = t_(1.2)
    for i in range(40):
        st = rng.uniform(0, 0.9); f = rng.uniform(2500, 7500); m = t > st
        y[m] += np.sin(2*np.pi*f*(t[m] - st))*np.exp(-(t[m] - st)/rng.uniform(0.03, 0.15))*rng.uniform(0.1, 0.4)
    return norm(reverb(y, 1.0, 0.25), 0.9)
def s_whoosh(d):
    L = 0.4; x = noise(L); t = t_(L); y = np.zeros_like(x)
    for k, c in enumerate(np.linspace(400, 2500, 8)):
        seg = slice(int(k*len(x)/8), int((k + 1)*len(x)/8)); y[seg] = bp(x, c*0.6, c*1.4)[seg]
    return norm(y*np.sin(np.pi*t/L)**2, 0.6)
def s_thud(d):
    L = 0.5; t = t_(L)
    x = np.sin(2*np.pi*np.cumsum(np.linspace(110, 40, len(t)))/SR)*env(L, 0.002, 0.1) + lp(noise(L), 800)*env(L, 0.001, 0.04)
    return norm(x, 0.9)
def step(heavy=False):
    L = 0.25; c = lp(noise(L), 3000 if not heavy else 1800)*env(L, 0.001, 0.015)
    th = np.sin(2*np.pi*(70 if heavy else 110)*t_(L))*env(L, 0.002, 0.05)*(1.4 if heavy else 0.6)
    return c*0.8 + th
def s_steps(d, rate=0.17, verb=0.0, gain=0.5):
    d = max(d, 0.3); y = np.zeros(int(d*SR) + SR)
    for k in range(int(d/rate) + 1):
        s = step()*rng.uniform(0.6, 1.0); i = int(k*rate*SR); y[i:i + len(s)] += s
    y = y[:int(d*SR)]
    if verb: y = reverb(y, 0.9, verb)
    return norm(y, gain)
def s_step_h(d): return norm(reverb(step(True), 0.8, 0.25), 0.9)
def s_shutter(d):
    L = 1.3; t = t_(L); x = bp(noise(L), 800, 5000)*(0.5 + 0.5*np.sign(np.sin(2*np.pi*28*t)))*np.minimum(1, t/0.05)
    return norm(np.concatenate([x, s_clang(0)*0.6]), 0.55)
def s_clang(d):
    L = 1.2; t = t_(L); y = sum(np.sin(2*np.pi*f*t)*np.exp(-t/dd)*a for f, dd, a in [(310, .5, 1), (733, .35, .7), (1187, .25, .5), (1679, .18, .4), (2450, .1, .3)])
    return norm(y*np.minimum(1, t/0.002) + lp(noise(L), 3000)*env(L, .001, .02), 0.8)
def s_crash(d):
    L = 0.9; y = lp(noise(L), 3500)*env(L, 0.002, 0.12); t = t_(L)
    for i in range(6):
        st = rng.uniform(0.02, 0.5); m = t > st; y[m] += bp(noise(L), 800, 4000)[m]*np.exp(-(t[m] - st)/0.03)*0.7
    return norm(y + pad(s_thud(0), L)*0.6, 0.8)
def s_curtain(d):
    L = 0.4; t = t_(L); x = hp(noise(L), 2500)*np.sin(np.pi*t/L)**2*0.7
    for k in range(10): i = int((0.05 + k*0.025)*SR); x[i:i + 200] += hp(noise(200/SR), 4000)*np.exp(-np.arange(200)/40)*0.5
    return norm(x, 0.6)
def s_heart(d):
    d = max(d, 0.8); y = np.zeros(int(d*SR) + SR); beat = 60/78
    def lub(f, a): L = 0.2; t = t_(L); return np.sin(2*np.pi*f*t)*np.exp(-t/0.05)*a
    for k in range(int(d/beat) + 1):
        i = int(k*beat*SR); a = lub(55, 1.0); b = lub(48, 0.7); y[i:i + len(a)] += a; j = i + int(0.28*SR); y[j:j + len(b)] += b
    return norm(lp(y[:int(d*SR)], 200), 0.9)
def s_breath(d):
    d = max(d, 0.8); t = t_(d); y = bp(noise(d), 500, 2500)*(0.5 + 0.5*np.sin(2*np.pi*t/0.75 - 1.5))**2
    return norm(y*np.minimum(1, (d - t)/0.3), 0.35)
def s_door(d): return norm(reverb(s_thud(0)*1.0 + np.concatenate([np.zeros(int(0.05*SR)), s_clang(0)[:int(0.3*SR)]*0.3, np.zeros(int(0.15*SR))])[:int(0.5*SR)], 1.1, 0.35), 0.95)
def s_table(d): return norm(pad(s_thud(0), 0.9) + s_crash(0)*0.7, 0.85)
def s_splash(d):
    L = 0.6; t = t_(L); y = bp(noise(L), 500, 3500)*env(L, 0.003, 0.08)
    for i in range(12): st = rng.uniform(0.05, 0.5); m = t > st; y[m] += np.sin(2*np.pi*rng.uniform(800, 2500)*(t[m] - st))*np.exp(-(t[m] - st)/0.02)*0.3
    return norm(y, 0.6)
def s_squeak(d):
    L = 0.18; t = t_(L); f = np.linspace(1700, 2700, len(t)); ph = 2*np.pi*np.cumsum(f)/SR
    return norm((np.sin(ph) + 0.4*np.sin(2*ph))*np.sin(np.pi*t/L), 0.5)
def s_glint(d):
    L = 1.0; t = t_(L); return norm(sum(np.sin(2*np.pi*f*t)*np.exp(-t/0.35) for f in (3520, 4186, 5274))*np.minimum(1, t/0.01), 0.3)
def saw(f, t): return 2*((f*t) % 1) - 1
def s_sting(d):
    L = 2.5; t = t_(L); y = sum(saw(f*(1 + dt), t) for f in (36.7, 55, 73.4, 87.3, 110) for dt in (-0.004, 0.004))
    y = lp(y, 900)*np.exp(-t/0.9)*np.minimum(1, t/0.01)
    boom = np.sin(2*np.pi*np.cumsum(np.linspace(60, 30, len(t)))/SR)*np.exp(-t/0.6)
    return norm(reverb(y*0.5 + boom, 2.0, 0.35), 0.8)
def s_sting2(d):
    L = 1.6; t = t_(L); y = sum(saw(f, t) for f in (293.7, 349.2, 440, 587.3)); y = lp(y, 2500)*np.exp(-t/0.4)*np.minimum(1, t/0.005)
    return norm(reverb(y, 1.5, 0.4), 0.45)
def s_rifle_up(d):
    L = 0.6; y = np.zeros(int(L*SR))
    for st in (0.05, 0.3):
        i = int(st*SR); c = bp(noise(0.05), 1500, 6000)*np.exp(-np.arange(int(0.05*SR))/200); y[i:i + len(c)] += c
    y += bp(noise(L), 300, 2000)*0.15*np.sin(np.pi*t_(L)/L)
    return norm(y, 0.6)
def s_slide(d): L = 0.65; t = t_(L); return norm(bp(noise(L), 300, 1800)*np.sin(np.pi*t/L)**0.5, 0.5)
def s_skid(d): return s_squeak(0)
def s_escalator(d):
    d = max(d, 1); t = t_(d); return norm(np.sin(2*np.pi*100*t)*0.4 + lp(noise(d), 300)*0.6 + 0.3*bp(noise(d), 2000, 4000)*(np.sin(2*np.pi*6*t) > 0.9), 0.25)
def s_alarm(d):
    d = max(d, 0.5); t = t_(d); f = np.where((t*2.5) % 1 < 0.5, 850, 650); ph = 2*np.pi*np.cumsum(f)/SR
    y = np.sign(np.sin(ph))*0.5 + 0.3*np.sin(3*ph)
    return norm(reverb(bp(y, 400, 4000), 1.5, 0.45), 0.35)
def s_traffic(d):
    d = max(d, 1); t = t_(d); y = lp(noise(d), 400)*0.6
    for st in rng.uniform(-1, d, int(d/1.5) + 1):
        m = (t > st) & (t < st + 2.5); y[m] += bp(noise(d), 200, 1500)[m]*np.sin(np.pi*(t[m] - st)/2.5)**2*0.8
    return norm(y, 0.3)
def s_amb_mall(d):
    d = max(d, 1); t = t_(d); y = np.zeros(len(t))
    for i in range(8): y += bp(noise(d), 250, 1800)*(0.5 + 0.5*np.sin(2*np.pi*rng.uniform(0.3, 1.2)*t + rng.uniform(0, 6)))
    return norm(reverb(y, 1.5, 0.4)[:len(t)], 0.25)
def s_muzak(d):
    L = 2.8; t = t_(L); y = np.zeros(len(t)); chords = [(261.6, 329.6, 392), (220, 261.6, 329.6), (174.6, 220, 261.6), (196, 246.9, 293.7)]
    for k, ch in enumerate(chords):
        st = k*0.7; m = (t >= st); tt = t[m] - st
        for f in ch: y[m] += (np.sin(2*np.pi*f*tt) + 0.3*np.sin(4*np.pi*f*tt))*np.exp(-tt/0.6)*0.3
    return norm(lp(reverb(y, 1.2, 0.3)[:len(t)], 3000), 0.18)
def s_cloth(d): L = 0.5; t = t_(L); return norm(bp(noise(L), 800, 4000)*np.sin(np.pi*t/L)**2, 0.3)
def s_cut(d): L = 1.5; t = t_(L); return norm(np.sin(2*np.pi*np.cumsum(np.linspace(55, 28, len(t)))/SR)*np.exp(-t/0.5), 0.9)

SFX = {
  'bang': s_bang, 'screams': s_screams, 'glass': s_glass, 'whoosh': s_whoosh, 'thud': s_thud, 'step_h': s_step_h,
  'steps_run': lambda d: s_steps(d, 0.17, 0.15, 0.4), 'steps_run_hall': lambda d: s_steps(d, 0.17, 0.4, 0.45), 'steps_run_out': lambda d: s_steps(d, 0.17, 0.0, 0.35),
  'shutter': s_shutter, 'clang': s_clang, 'crash': s_crash, 'curtain': s_curtain, 'heart': s_heart, 'breath': s_breath, 'door': s_door,
  'table': s_table, 'splash': s_splash, 'squeak': s_squeak, 'glint': s_glint, 'sting': s_sting, 'sting2': s_sting2, 'rifle_up': s_rifle_up,
  'slide': s_slide, 'skid': s_skid, 'escalator': s_escalator, 'alarm': s_alarm, 'traffic': s_traffic, 'amb_mall': s_amb_mall,
  'muzak': s_muzak, 'cloth': s_cloth, 'cut': s_cut,
}
LOOPING = {'steps_run', 'steps_run_hall', 'steps_run_out', 'heart', 'breath', 'escalator', 'alarm', 'traffic', 'amb_mall', 'screams'}

# ---------------- score ----------------
shots = {s['name']: s for s in CUES['shots']}
def at(name, frac=0.0): s = shots[name]; return s['start'] + s['dur']*frac
def end(name): s = shots[name]; return s['start'] + s['dur']
BPM = 148; B = 60/BPM
def bass_note(f, L): t = t_(L); return lp(saw(f, t) + saw(f*1.005, t), 700)*np.exp(-t/(L*0.7))*np.minimum(1, t/0.004)
def drum(L=0.4): t = t_(L); return np.sin(2*np.pi*np.cumsum(np.linspace(120, 45, len(t)))/SR)*np.exp(-t/0.12) + lp(noise(L), 1500)*np.exp(-t/0.02)*0.4
def hat(): L = 0.06; return hp(noise(L), 7000)*np.exp(-t_(L)/0.012)
def stab(fs, L): t = t_(L); return lp(sum(saw(f, t) for f in fs), 3000)*np.exp(-t/0.09)*np.minimum(1, t/0.003)
def chase(t0, t1, level=1.0):
    y = np.zeros(N); pat = [73.4, 73.4, 87.3, 73.4, 65.4, 73.4, 98, 87.3]; k = 0; t = t0
    while t < t1:
        i = int(t*SR); f = pat[k % 8]; nb = bass_note(f, B/2*0.95); y[i:i + len(nb)] += nb*0.5
        if k % 2 == 0: h = hat(); y[i:i + len(h)] += h*0.12
        if k % 4 == 0: dr = drum(); y[i:i + len(dr)] += dr*0.55
        if k % 8 == 6: dr = drum(); y[i:i + len(dr)] += dr*0.4
        if k % 4 == 2: s = stab((293.7, 349.2, 440), 0.2); y[i:i + len(s)] += s*0.12
        k += 1; t += B/2
    fade = np.ones(N); a, b = int(t0*SR), int(t1*SR); r = int(0.15*SR)
    fade[:a] = 0; fade[b:] = 0; fade[a:a + r] = np.linspace(0, 1, r); fade[max(a, b - r):b] = np.linspace(1, 0, b - max(a, b - r))
    return y*fade*level
def drone(t0, t1, f=36.7, level=1.0):
    y = np.zeros(N); a, b = int(t0*SR), int(t1*SR); t = np.arange(b - a)/SR
    x = lp(saw(f, t) + saw(f*1.5*1.002, t)*0.5 + saw(f*2*0.998, t)*0.4, 400)*(0.8 + 0.2*np.sin(2*np.pi*0.3*t))
    x += bp(noise((b - a)/SR), 2000, 6000)*0.03*(0.5 + 0.5*np.sin(2*np.pi*0.2*t))
    r = min(int(0.6*SR), (b - a)//2); x[:r] *= np.linspace(0, 1, r); x[-r:] *= np.linspace(1, 0, r)
    y[a:b] = x; return y*level*0.35
def final_chord(t0, L):
    y = np.zeros(N); t = t_(L); x = sum(np.sin(2*np.pi*f*t)*0.25 for f in (146.8, 174.6, 220, 293.7)); x = lp(x, 2000)*np.minimum(1, t/1.0)*np.minimum(1, (L - t)/0.8)
    i = int(t0*SR); y[i:i + len(x)] += x; return y*0.5

score = np.zeros(N)
score += drone(at('hook', 0.76), end('boyCU'), level=1.0)
score += chase(at('drop', 0.1), end('hide') - 0.6, 1.0)
score += drone(at('hide'), end('rip'), 29.1, 1.0)
score += chase(at('burstout'), end('scramble'), 1.0)
score += chase(at('escalator'), at('blocked', 0.4), 1.1)
score += drone(at('blocked', 0.4), end('raise'), level=1.2)
score += chase(at('staffdoor'), at('carpark', 0.6), 1.1)
score += drone(at('carpark', 0.6), end('undercar'), 27.5, 1.1)
score += chase(at('alarm', 0.2), end('street'), 1.1)
score += drone(at('nexttime'), at('final', 0.85), level=0.9)
score += final_chord(at('final', 0.1), shots['final']['dur']*0.8)

# ---------------- place cues ----------------
sfx = np.zeros(N); vo = np.zeros(N)
def place(buf, x, t, g=1.0):
    i = int(t*SR); n = min(len(x), N - i)
    if n > 0: buf[i:i + n] += x[:n]*g
VOICE = os.path.join(HERE, 'voice')
duck = np.zeros(N)
for c in CUES['cues']:
    if c['kind'] == 'sfx':
        fn = SFX.get(c['name'])
        if not fn: print('missing sfx', c['name']); continue
        d = c['shotEnd'] - c['t'] if c['name'] in LOOPING else 1.0
        x = fn(d)
        if c['name'] in LOOPING: x = pad(x, d); r = min(len(x)//3, int(0.12*SR)); x[-r:] *= np.linspace(1, 0, r)
        place(sfx, x, c['t'], c['gain'])
    else:
        name = c['name']; base = name.replace('_echo', '')
        x, sr = sf.read(os.path.join(VOICE, base + '.wav'))
        if sr != SR: x = np.interp(np.linspace(0, len(x) - 1, int(len(x)*SR/sr)), np.arange(len(x)), x)
        if base.startswith('h'): x = reverb(lp(x, 6000), 2.4 if name.endswith('_echo') else 0.9, 0.45 if name.endswith('_echo') else 0.2)
        if base.startswith('g'): x = reverb(bp(x, 250, 5000), 1.2, 0.35)*0.7
        place(vo, x, c['t'], 1.0); i = int(c['t']*SR); duck[i:i + len(x)] = 1
k = int(0.15*SR); duck = np.convolve(duck, np.ones(k)/k, 'same')
mix = score*(1 - 0.55*duck)*0.9 + sfx*(1 - 0.35*duck)*0.8 + vo*1.0
mix = mix[:int(DUR*SR)]
mix = np.tanh(mix*1.1)/np.tanh(1.1); mix = mix/np.max(np.abs(mix))*0.89
st = np.stack([mix, mix], 1)
sf.write(os.path.join(ROOT, 'out', 'mix.wav'), st, SR); print('wrote mix', round(len(mix)/SR, 2), 's')
