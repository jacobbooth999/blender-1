"""Wordless short soundtrack: sectioned music + archery SFX from cues.json -> mix.wav"""
import json, wave, os, numpy as np
from scipy.signal import lfilter, fftconvolve
D=os.path.dirname(os.path.abspath(__file__)); SR=44100; rng=np.random.default_rng(11)
C=json.load(open(os.path.join(D,'cues.json'))); END=C['end']; N=int(END*SR)
hz=lambda m:440*2**((m-69)/12)
def lp(x,fc): a=np.exp(-2*np.pi*fc/SR); return lfilter([1-a],[1,-a],x)
def hp(x,fc): return x-lp(x,fc)
def env(n,a,d): t=np.arange(n)/SR; return np.minimum(1,t/max(a,1e-4))*np.exp(-t/d)
def place(buf,sig,t0,g=1.0):
    i=int(t0*SR)
    if i<0: sig=sig[-i:]; i=0
    if i>=len(buf): return
    j=min(len(buf),i+len(sig)); buf[i:j]+=sig[:j-i]*g
def reverb(x,dur=2.4,wet=.28,seed=1):
    r=np.random.default_rng(seed); n=int(dur*SR); ir=r.standard_normal(n)*np.exp(-np.arange(n)/SR/(dur/6.9)); ir[:int(.012*SR)]=0; ir=lp(ir,5000)
    y=fftconvolve(x,ir)[:len(x)]; y*=np.abs(x).max()/max(np.abs(y).max(),1e-9); return x*(1-wet)+y*wet
BPM=96; beat=60/BPM; bar=4*beat
Am=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]; Tense=[[57,60,64],[57,60,63],[53,57,60],[52,56,59]]; Up=[[53,57,60],[55,59,62],[57,60,64],[60,64,67]]
segs=[(0,5,1,Am),(5,17,2,Am),(17,29,0,Tense),(29,38,3,Up),(38,43.8,3,Up),(44.6,END,0,Am)]
mus=np.zeros(N)
for (s,e,I,prog) in segs:
    n=int((e-s+1.5)*SR); P=np.zeros(n); nb=int(np.ceil((e-s)/bar))
    for b in range(nb):
        ch=prog[b%4]; t0=b*bar; m=int((bar+1.2)*SR); t=np.arange(m)/SR; v=np.zeros(m)
        for note in ch+[ch[0]-12]:
            for h in range(1,6):
                for dt in (-.1,.1): v+=np.sin(2*np.pi*hz(note)*h*(1+dt/100*h)*t+rng.random()*6)/h**1.9
        place(P,v*np.minimum(1,t/.6)*np.clip((bar+1.2-t)/1.2,0,1)*(.014 if I else .012),t0)
        if I>=1:
            step=beat/2 if I>=2 else beat; pat=[0,1,2,1,2,0,1,2]; k=0; tt=t0
            while tt<t0+bar-1e-6:
                note=ch[pat[k%8]]+12+(12 if k%8==4 else 0); q=int(1.2*SR); ts=np.arange(q)/SR
                place(P,sum(np.sin(2*np.pi*hz(note)*h*ts)*np.exp(-ts*(2.6+h*2))/h**1.3 for h in range(1,6))*np.minimum(1,ts/.004)*.045,tt); tt+=step; k+=1
        if I>=2:
            bs=np.sin(2*np.pi*hz(ch[0]-24)*t)+.3*np.sin(2*np.pi*hz(ch[0]-12)*t); place(P,bs*np.minimum(1,t/.04)*np.exp(-t/1.8)*.1,t0)
            for bt in range(4):
                if I==2 and bt%2: continue
                q=int(.45*SR); ts=np.arange(q)/SR; place(P,np.sin(2*np.pi*np.cumsum(45+70*np.exp(-ts*30))/SR)*np.exp(-ts*7)*(.2 if I==2 else .26),t0+bt*beat)
                if I==3:
                    if bt%2: place(P,lp(rng.standard_normal(int(.22*SR)),3500)*env(int(.22*SR),.002,.06)*.11,t0+bt*beat)
                    hh=hp(rng.standard_normal(int(.05*SR)),6000); place(P,hh*env(len(hh),.001,.012)*.06,t0+bt*beat+beat/2)
        if I==0 and s<30:  # clock ticks while the perfectionist waits
            for bt in range(4):
                q=int(.03*SR); ts=np.arange(q)/SR; place(P,np.sin(2*np.pi*(1900 if bt%2 else 2300)*ts)*env(q,.0005,.006)*.08,t0+bt*beat)
    L=n; f=np.ones(L); fi=int(.4*SR); fo=int(.8*SR); ei=int((e-s)*SR); f[:fi]=np.linspace(0,1,fi); f[ei:]=0; f[max(0,ei-fo):ei]*=np.linspace(1,0,min(fo,ei))
    place(mus,P*f,s)
mus=reverb(mus,2.4,.3)
# ---------- sfx ----------
sfx=np.zeros(N)
for c in C['cues']:
    ty,t0,v=c['type'],c['t'],c['vol']; 
    if ty=='draw': n=int(.45*SR); u=np.arange(n)/n; s=lp(rng.standard_normal(n),900)*u*.5+np.sin(2*np.pi*np.cumsum(90+60*u)/SR)*u*.15; place(sfx,s*.18*v,t0)
    elif ty=='twang': n=int(.5*SR); ts=np.arange(n)/SR; s=sum(np.sin(2*np.pi*150*h*ts)*np.exp(-ts*(9+h*5))/h for h in range(1,6))+hp(rng.standard_normal(n),3000)*env(n,.0005,.01)*.6; place(sfx,s*.32*v,t0)
    elif ty=='thunk': n=int(.35*SR); ts=np.arange(n)/SR; s=np.sin(2*np.pi*np.cumsum(140*np.exp(-ts*8)+60)/SR)*np.exp(-ts*18)+lp(rng.standard_normal(n),2500)*env(n,.0005,.015); place(sfx,s*.38*v,t0)
    elif ty=='thud': n=int(.3*SR); ts=np.arange(n)/SR; s=lp(rng.standard_normal(n),600)*env(n,.001,.05)+np.sin(2*np.pi*70*ts)*np.exp(-ts*25)*.5; place(sfx,s*.28*v,t0)
    elif ty=='ting': n=int(.8*SR); ts=np.arange(n)/SR; s=(np.sin(2*np.pi*2300*ts)+.6*np.sin(2*np.pi*3450*ts))*np.exp(-ts*7); place(sfx,s*.08*v,t0)
    elif ty=='whistle': n=int(.9*SR); ts=np.arange(n)/SR; s=np.sin(2*np.pi*np.cumsum(1900-1000*ts/.9)/SR)*np.sin(np.pi*ts/.9); place(sfx,s*.07*v,t0)
    elif ty=='win': n=int(1.8*SR); ts=np.arange(n)/SR; place(sfx,sum(np.sin(2*np.pi*hz(m)*ts)*np.exp(-ts*2) for m in (81,85,88))*.05*v,t0)
    elif ty=='wind': n=int(1.6*SR); u=np.arange(n)/n; place(sfx,lp(rng.standard_normal(n),700)*np.sin(np.pi*u)**2*.5*v,t0)
    elif ty=='breath': n=int(.9*SR); u=np.arange(n)/n; place(sfx,hp(lp(rng.standard_normal(n),2500),400)*np.sin(np.pi*u)**2*.12*v,t0)
    elif ty=='step': n=int(.12*SR); ts=np.arange(n)/SR; place(sfx,lp(rng.standard_normal(n),500)*env(n,.001,.03)*.3*v,t0)
    elif ty=='tick': n=int(.03*SR); ts=np.arange(n)/SR; place(sfx,np.sin(2*np.pi*2400*ts)*env(n,.0005,.006)*.1*v,t0)
    elif ty=='whoosh': n=int(.5*SR); u=np.arange(n)/n; place(sfx,lp(rng.standard_normal(n),1800)*np.sin(np.pi*u)**2*.25*v,t0-.15)
    elif ty=='impact': n=int(3*SR); ts=np.arange(n)/SR; s=np.sin(2*np.pi*np.cumsum(38+90*np.exp(-ts*12))/SR)*np.exp(-ts*1.3)+lp(rng.standard_normal(n),1500)*env(n,.001,.25)*.6+sum(np.sin(2*np.pi*hz(m)*ts)*np.exp(-ts*.9) for m in (57,64,69,72,76))*.1; place(sfx,s*.4*v,t0)
    elif ty=='hit': n=int(1*SR); ts=np.arange(n)/SR; s=np.sin(2*np.pi*np.cumsum(55+80*np.exp(-ts*25))/SR)*np.exp(-ts*3.5); place(sfx,s*.25*v,t0)
    elif ty=='pop': n=int(.1*SR); ts=np.arange(n)/SR; place(sfx,np.sin(2*np.pi*np.cumsum(700+600*np.minimum(1,ts/.03))/SR)*env(n,.002,.03)*.1*v,t0)
sfx=reverb(sfx,1.0,.15,seed=4)
mix=mus+sfx; mix*=np.clip((END-np.arange(N)/SR)/1.2,0,1)
st=np.stack([mix,np.roll(mix,int(.011*SR))],1); st/=np.abs(st).max()/1.1; st=np.tanh(st); st/=np.abs(st).max()/.92
o=wave.open(os.path.join(D,'mix.wav'),'wb'); o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes((st*32767).astype(np.int16).tobytes()); o.close(); print('mix',round(N/SR,1))
