import numpy as np, json, wave
SR=44100; TL=json.load(open('timeline.json')); T=TL['total']; N=int(T*SR)+SR
rng=np.random.default_rng(3)
mus=np.zeros((N,2)); sfx=np.zeros((N,2))
def lp(x,a):  # one-pole lowpass
    y=np.empty_like(x); s=0.0
    for i in range(len(x)): s+=a*(x[i]-s); y[i]=s
    return y
def lpv(x,fc):
    a=1-np.exp(-2*np.pi*fc/SR); from scipy.signal import lfilter
    return lfilter([a],[1,-(1-a)],x)
try:
    import scipy.signal as ss
except ImportError:
    ss=None
def filt(x,lo=None,hi=None):
    X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR); m=np.ones_like(f)
    if lo: m*=1/(1+(lo/np.maximum(f,1))**4)
    if hi: m*=1/(1+(f/hi)**4)
    return np.fft.irfft(X*m,len(x))
def add(buf,t,sig,gain=1.0,pan=0.0):
    i=int(t*SR); sig=sig[:max(0,len(buf)-i)]
    buf[i:i+len(sig),0]+=sig*gain*(1-pan)/1; buf[i:i+len(sig),1]+=sig*gain*(1+pan)/1
def env(n,a,r):
    e=np.ones(n); A=int(a*SR); R=int(r*SR)
    if A: e[:A]=np.linspace(0,1,A)
    if R: e[-R:]*=np.linspace(1,0,R)
    return e
nt=lambda m:440*2**((m-69)/12)
tt=np.arange(N)/SR
# --- pad chords: Am F C G (each 2.5s)
prog=[[57,60,64],[53,57,60],[48,55,64],[55,59,62]]
pad=np.zeros(N)
CH=2.5
for k in range(int(T/CH)+1):
    ch=prog[k%4]; t0=k*CH; n=int((CH+0.6)*SR); t=np.arange(n)/SR
    s=np.zeros(n)
    for m in ch+[ch[0]-12]:
        for det in (-0.12,0.12):
            f=nt(m+det/1); s+=2*((t*f)%1)-1
    s=filt(s,hi=900)*env(n,0.5,0.7)*0.06
    i=int(t0*SR); pad[i:i+n]+=s[:len(pad)-i]
mus[:,0]+=pad; mus[:,1]+=pad
# --- pulse bass 8ths at 96bpm
beat=60/96; e8=beat/2
roots=[45,41,36,43]
for j in range(int(T/e8)):
    t0=j*e8; r=roots[int(t0/CH)%4]; n=int(0.22*SR); t=np.arange(n)/SR
    s=np.sin(2*np.pi*nt(r)*t)*np.exp(-t*14)*0.22
    add(mus,t0,s)
    # tick
    n2=int(0.03*SR); tk=filt(rng.standard_normal(n2),lo=6000)*np.exp(-np.arange(n2)/SR*160)*(0.05 if j%2 else 0.08)
    add(mus,t0,tk,pan=0.3 if j%2 else -0.3)
# kick on beats from scene 1
for j in range(int(T/beat)):
    t0=j*beat
    if t0<TL['scenes'][1]['start'] or t0>TL['scenes'][5]['start']: continue
    n=int(0.3*SR); t=np.arange(n)/SR; f=50+90*np.exp(-t*30)
    add(mus,t0,np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*9)*0.35)
# fade out end, and stop pulse under final question: replace with sustained hit
mus*=np.clip((T-tt)/1.2,0,1)[:,None]
mus[:int(0.3*SR)]*=np.linspace(0,1,int(0.3*SR))[:,None]
# --- SFX
def whoosh(dur=0.45):
    n=int(dur*SR); x=rng.standard_normal(n); t=np.arange(n)/SR
    y=filt(x,lo=400,hi=3500)*np.sin(np.pi*t/dur)**2*0.35
    return y
def slap():
    n=int(0.25*SR); t=np.arange(n)/SR
    return (filt(rng.standard_normal(n),lo=150,hi=2500)*np.exp(-t*35)*0.6+np.sin(2*np.pi*80*t)*np.exp(-t*20)*0.5)
def marker(dur):
    n=int(dur*SR); t=np.arange(n)/SR; x=filt(rng.standard_normal(n),lo=1800,hi=5000)
    am=0.6+0.4*np.sin(2*np.pi*(9+3*rng.random())*t)
    return x*am*env(n,0.02,0.06)*0.22
def boom():
    n=int(1.6*SR); t=np.arange(n)/SR; f=40+60*np.exp(-t*8)
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*2.2)*0.7+filt(rng.standard_normal(n),hi=600)*np.exp(-t*4)*0.25
def pop():
    n=int(0.08*SR); t=np.arange(n)/SR
    return filt(rng.standard_normal(n),lo=500,hi=4000)*np.exp(-t*60)*0.5
S=TL['scenes']
for j,sc in enumerate(S):
    st=sc['start'] if j else 0.0
    if j: add(sfx,st-0.1,whoosh(),pan=0.2*(-1)**j); add(sfx,st+0.42,slap(),0.8)
    for k,v in sc['cues'].items():
        if k.endswith('_end') or k in('f0','e1'): continue
        d=max(0.35,min(0.8,(sc['cues'][k+'_end']-v)*1.05))
        add(sfx,v,marker(d),pan=0.15)
add(sfx,S[0]['cues']['a0']-0.4,np.zeros(1))
# survival letters + boom
for i in range(8): add(sfx,S[4]['cues']['e1']-0.15+i*0.075,pop(),0.9,pan=(i-3.5)/6)
add(sfx,S[4]['cues']['e1']-0.1,boom(),0.9)
add(sfx,S[5]['start']+0.4,boom(),0.6)
# circle marker
add(sfx,S[5]['cues']['f0_end']-0.1,marker(0.6),0.9)
# room tone / paper crackle
crk=filt(rng.standard_normal(N),lo=2000)*0.004
sfx[:,0]+=crk; sfx[:,1]+=crk
# VO
with wave.open('vo_full.wav') as w: vo=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(float)/32767; vsr=w.getframerate()
vo=np.interp(np.arange(int(len(vo)*SR/vsr))/SR, np.arange(len(vo))/vsr, vo)
v=np.zeros(N); v[:len(vo)]=vo[:N]
# ducking envelope
envv=np.convolve(np.abs(v),np.ones(int(0.25*SR))/int(0.25*SR),'same'); duck=1-0.45*np.clip(envv/0.08,0,1)
mix=mus*0.55*duck[:,None]+sfx*0.7+np.stack([v,v],1)*1.0
mix=mix[:int(T*SR)]
mix=np.tanh(mix*1.1)/np.tanh(1.1)
mix/=np.abs(mix).max()/0.92
with wave.open('mix.wav','wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((mix*32767).astype(np.int16).tobytes())
print('ok',T)
