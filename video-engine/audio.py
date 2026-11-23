import numpy as np, json, wave
SR=44100; TL=json.load(open('timeline.json')); ST=json.load(open('story.json')); T=TL['total']; N=int(T*SR)+SR
S=TL['scenes']; rng=np.random.default_rng(3)
mus=np.zeros((N,2)); sfx=np.zeros((N,2))
def filt(x,lo=None,hi=None):
    X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR); m=np.ones_like(f)
    if lo: m*=1/(1+(lo/np.maximum(f,1))**4)
    if hi: m*=1/(1+(f/hi)**4)
    return np.fft.irfft(X*m,len(x))
def add(buf,t,sig,g=1.0,pan=0.0):
    i=int(max(0,t)*SR); sig=sig[:max(0,len(buf)-i)]; buf[i:i+len(sig),0]+=sig*g*(1-pan); buf[i:i+len(sig),1]+=sig*g*(1+pan)
def env(n,a,r):
    e=np.ones(n); A=int(a*SR); R=int(r*SR)
    if A: e[:A]=np.linspace(0,1,A)
    if R: e[-R:]*=np.linspace(1,0,R)
    return e
nt=lambda m:440*2**((m-69)/12)
# ---- music segments by chapter
chs=[sc['start'] for sc,st in zip(S,ST['scenes']) if st['type']=='chapter']
bounds=[0]+chs+[T]
MOODS=[ # prog (triads), bpm, kick, bright
 ([[57,60,64],[53,57,60],[48,52,55],[55,59,62]],92,True,700),   # cold open, tense
 ([[60,64,67],[55,59,62],[57,60,64],[53,57,60]],96,False,1100),  # I hopeful
 ([[62,66,69],[57,61,64],[59,62,66],[55,59,62]],104,True,1400),  # II triumphant
 ([[62,65,69],[58,62,65],[53,57,60],[60,64,67]],88,True,800),    # III dramatic
 ([[64,67,71],[60,64,67],[55,59,62],[62,66,69]],100,True,1000),  # IV tense/hopeful
 ([[57,60,64],[53,57,60],[48,52,55],[52,56,59]],84,False,700),   # V so close (sad)
 ([[53,57,60],[48,52,55],[50,53,57],[46,50,53]],80,False,650),   # VI road home
 ([[60,64,67],[57,60,64],[53,57,60],[55,59,62]],90,True,900),    # VII verdict
]
for si in range(len(bounds)-1):
    t0,t1=bounds[si],bounds[si+1]; prog,bpm,kick,bright=MOODS[min(si,len(MOODS)-1)]
    beat=60/bpm; CH=beat*8; k=0; t=t0
    while t<t1:
        ch=prog[k%4]; n=int((min(CH,t1-t)+0.8)*SR); tt=np.arange(n)/SR; s=np.zeros(n)
        for m in ch+[ch[0]-12]:
            for det in (-0.1,0.1): s+=2*((tt*nt(m+det))%1)-1
        s=filt(s,hi=bright)*env(n,0.6,0.8)*0.045
        add(mus,t,s)
        # arpeggio pluck
        for b in range(int(min(CH,t1-t)/(beat/2))):
            m=ch[b%3]+12; nn=int(0.25*SR); tq=np.arange(nn)/SR
            add(mus,t+b*beat/2,np.sin(2*np.pi*nt(m)*tq)*np.exp(-tq*12)*0.05,pan=0.3*((b%2)*2-1))
        # bass
        for b in range(int(min(CH,t1-t)/beat)):
            nn=int(0.35*SR); tq=np.arange(nn)/SR
            add(mus,t+b*beat,np.sin(2*np.pi*nt(ch[0]-24)*tq)*np.exp(-tq*6)*0.18)
            if kick and b%2==0:
                f=50+90*np.exp(-tq*30); add(mus,t+b*beat,np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tq*9)*0.3)
        t+=CH; k+=1
    # fade at chapter boundaries
    i0,i1=int(t1*SR)-int(0.5*SR),int(t1*SR)
    if i1<N: mus[i0:i1]*=np.linspace(1,0.2,i1-i0)[:,None]
tt=np.arange(N)/SR
mus*=np.clip((T-tt)/2.0,0,1)[:,None]
# ---- sfx
def whoosh(d=0.45,lo=400,hi=3500):
    n=int(d*SR); x=rng.standard_normal(n); t=np.arange(n)/SR; return filt(x,lo=lo,hi=hi)*np.sin(np.pi*t/d)**2*0.35
def slap():
    n=int(0.25*SR); t=np.arange(n)/SR; return filt(rng.standard_normal(n),lo=150,hi=2500)*np.exp(-t*35)*0.6+np.sin(2*np.pi*80*t)*np.exp(-t*20)*0.5
def marker(d):
    n=int(d*SR); t=np.arange(n)/SR; x=filt(rng.standard_normal(n),lo=1800,hi=5000); return x*(0.6+0.4*np.sin(2*np.pi*11*t))*env(n,0.02,0.06)*0.2
def boom(d=1.6):
    n=int(d*SR); t=np.arange(n)/SR; f=40+60*np.exp(-t*8)
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*2.2)*0.7+filt(rng.standard_normal(n),hi=600)*np.exp(-t*4)*0.25
def riser(d=0.9):
    n=int(d*SR); t=np.arange(n)/SR; x=rng.standard_normal(n); y=np.zeros(n)
    for a in range(8): s=slice(a*n//8,(a+1)*n//8); y[s]=filt(x[s],lo=300+a*500,hi=1500+a*1200)
    return y*(t/d)**2*0.4
def tick():
    n=int(0.02*SR); return filt(rng.standard_normal(n),lo=3000)*np.exp(-np.arange(n)/SR*200)*0.25
def pop():
    n=int(0.09*SR); t=np.arange(n)/SR; return np.sin(2*np.pi*(600-300*t/0.09)*t)*np.exp(-t*40)*0.4
for i,(sc,st) in enumerate(zip(S,ST['scenes'])):
    t0=sc['start']; ty=st['type']
    if i: add(sfx,t0-0.12,whoosh(),pan=0.25*(-1)**i); add(sfx,t0+0.42,slap(),0.7)
    if ty in('chapter','title'): add(sfx,t0-0.9,riser(0.9),0.8); add(sfx,t0+0.05,boom(),1.0)
    cues=sc['cues']
    for k,v in cues.items():
        if k.endswith('_end'): continue
        v=max(v,t0+0.4) if i else v
        if k.startswith('n'):   # stat count
            if i: add(sfx,v-0.85,riser(0.85),0.6)
            for j in range(18): add(sfx,v+j*0.055,tick(),0.7)
            add(sfx,v+1.0,slap(),0.9); add(sfx,v+1.0,boom(0.8),0.45)
        elif k.startswith('leg_'):
            add(sfx,v,whoosh(1.1,200,2500),0.7); add(sfx,v+1.0,pop(),0.9)
        elif k=='qt': add(sfx,v,boom(0.9),0.35)
        elif k=='cross': add(sfx,v+0.25,marker(0.22),1.2); add(sfx,v+0.47,marker(0.22),1.2); add(sfx,v+0.3,boom(),0.5)
        else:
            d=max(0.3,min(0.75,(cues[k+'_end']-cues[k])*1.05)); add(sfx,v,marker(d),pan=0.15)
crk=filt(rng.standard_normal(N),lo=2000)*0.003; sfx[:,0]+=crk; sfx[:,1]+=crk
with wave.open('vo_full.wav') as w: vo=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(float)/32767; vsr=w.getframerate()
vo=np.interp(np.arange(int(len(vo)*SR/vsr))/SR,np.arange(len(vo))/vsr,vo); v=np.zeros(N); v[:min(N,len(vo))]=vo[:N]
k=int(0.25*SR); envv=np.convolve(np.abs(v),np.ones(k)/k,'same'); duck=1-0.5*np.clip(envv/0.08,0,1)
mix=mus*0.6*duck[:,None]+sfx*0.65+np.stack([v,v],1)
mix=mix[:int(T*SR)]; mix=np.tanh(mix*1.1)/np.tanh(1.1); mix/=np.abs(mix).max()/0.92
with wave.open('mix.wav','wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((mix*32767).astype(np.int16).tobytes())
print('ok',T)
