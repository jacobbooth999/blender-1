"""Long-form soundtrack: sectioned music (per chapter) + SFX from cues + narration, ducked. -> audio/mix.wav"""
import json, wave, os, numpy as np
from scipy.signal import lfilter, fftconvolve
H=os.path.dirname(os.path.abspath(__file__)); R=os.path.join(H,'..'); SR=44100; rng=np.random.default_rng(5)
C=json.load(open(os.path.join(H,'cues.json'))); END=C['end']+.5; N=int(END*SR)
TM=json.load(open(os.path.join(R,'voice','timing.json')))['lines']
hz=lambda m:440*2**((m-69)/12)
def lp(x,fc): a=np.exp(-2*np.pi*fc/SR); return lfilter([1-a],[1,-a],x)
def env(n,a,d): t=np.arange(n)/SR; return np.minimum(1,t/max(a,1e-4))*np.exp(-t/d)
def place(buf,sig,t0,g=1.0):
    i=int(t0*SR)
    if i<0: sig=sig[-i:]; i=0
    if i>=len(buf): return
    j=min(len(buf),i+len(sig)); buf[i:j]+=sig[:j-i]*g
def reverb(x,dur=2.4,wet=.28,seed=1):
    r=np.random.default_rng(seed); n=int(dur*SR); ir=r.standard_normal(n)*np.exp(-np.arange(n)/SR/(dur/6.9)); ir[:int(.012*SR)]=0; ir=lp(ir,5000)
    y=fftconvolve(x,ir)[:len(x)]; y*=np.abs(x).max()/max(np.abs(y).max(),1e-9); return x*(1-wet)+y*wet
# ---------- sections (documentary arc: dark piano -> percussion -> emotional -> climax) ----------
PROGS=[[[57,60,64],[53,57,60],[48,52,55],[55,59,62]],[[53,57,60],[55,59,62],[57,60,64],[57,60,64]],[[48,52,55],[55,59,62],[57,60,64],[53,57,60]],[[50,53,57],[53,57,60],[48,52,55],[55,59,62]]]
st=lambda i:TM[i]['start']-.6
B_=[0,st(2),st(9),st(22),st(31),st(40),st(53),st(61),st(67),st(79),END]
segs=[(B_[0],B_[1],2,PROGS[0]),(B_[1],B_[2],1,PROGS[3]),(B_[2],B_[3],2,PROGS[0]),(B_[3],B_[4],2,PROGS[2]),(B_[4],B_[5],3,PROGS[0]),(B_[5],B_[6],1,PROGS[1]),(B_[6],B_[7],2,PROGS[2]),(B_[7],B_[8],1,PROGS[3]),(B_[8],B_[9],2,PROGS[2]),(B_[9],B_[10],3,PROGS[0])]
cards=[(B_[4],B_[4]),(B_[9],B_[9])]
BPM=80; beat=60/BPM; bar=4*beat
pad=np.zeros(N); arp=np.zeros(N); bass=np.zeros(N); drums=np.zeros(N)
def seg_buf(s,e,I,prog):
    n=int((e-s+1.5)*SR); P=np.zeros(n); A=np.zeros(n); Bs=np.zeros(n); D=np.zeros(n)
    nb=int(np.ceil((e-s)/bar))
    for b in range(nb):
        ch=prog[b%4]; t0=b*bar; m=int((bar+1.4)*SR); t=np.arange(m)/SR
        v=np.zeros(m)
        for note in ch+[ch[0]-12]:
            for h in range(1,6):
                for dt in (-.1,.1): v+=np.sin(2*np.pi*hz(note)*h*(1+dt/100*h)*t+rng.random()*6)/h**1.9
        shape=np.minimum(1,t/1.0)*np.clip((bar+1.4-t)/1.4,0,1)
        place(P,v*shape*(.016 if I else .013),t0)
        if I>=2:
            bs=np.sin(2*np.pi*hz(ch[0]-24)*t)+.3*np.sin(2*np.pi*hz(ch[0]-12)*t); place(Bs,bs*np.minimum(1,t/.05)*np.exp(-t/2.2)*.09,t0)
        if I>=1:
            step=beat if I==1 else beat/2; pat=[0,1,2,1,2,0,1,2]; k=0; tt=t0
            while tt<t0+bar-1e-6:
                note=ch[pat[k%8]]+12+(12 if k%8==4 else 0); q=int(1.5*SR); ts=np.arange(q)/SR
                tone=sum(np.sin(2*np.pi*hz(note)*h*ts)*np.exp(-ts*(2.2+h*1.8))/h**1.3 for h in range(1,6))*np.minimum(1,ts/.004)
                place(A,tone*(.04 if I==1 else .048),tt); tt+=step; k+=1
        if I>=2:
            for bt in range(4):
                if I==2 and bt%2: continue
                q=int(.5*SR); ts=np.arange(q)/SR; kick=np.sin(2*np.pi*np.cumsum(45+70*np.exp(-ts*30))/SR)*np.exp(-ts*7)
                place(D,kick*(.17 if I==2 else .24),t0+bt*beat)
                if I==3:
                    if bt%2: sn=lp(rng.standard_normal(int(.25*SR)),3500)*env(int(.25*SR),.002,.06); place(D,sn*.1,t0+bt*beat)
                    hh=rng.standard_normal(int(.05*SR)); hh=hh-lp(hh,6000); place(D,hh*env(len(hh),.001,.012)*.05,t0+bt*beat+beat/2)
    L=n; fade=np.ones(L); fi=int(.8*SR); fo=int(1.2*SR); end_i=int((e-s)*SR)
    fade[:fi]=np.linspace(0,1,fi); fade[end_i:]=0; fade[max(0,end_i-fo):end_i]*=np.linspace(1,0,min(fo,end_i))
    return P*fade,A*fade,Bs*fade,D*fade
for (s,e,I,prog) in segs:
    a,b_,c,d=seg_buf(s,e,I,prog); place(pad,a,s); place(arp,b_,s); place(bass,c,s); place(drums,d,s)
# chapter card swells (riser into each card)
for (s,e) in cards:
    n=int(1.6*SR); u=np.arange(n)/n; noise=lp(rng.standard_normal(n),1800)*u**2; place(pad,noise*.06,s-1.6)
music=reverb(pad+arp+bass+drums,2.6,.3)
music*=np.minimum(1,np.arange(N)/SR/1.2)*np.clip((END-np.arange(N)/SR)/3.0,0,1)
# ---------- voice ----------
w=wave.open(os.path.join(R,'voice','raw.wav')); vsr=w.getframerate(); v=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16)/32768
vt=np.arange(int(len(v)*SR/vsr))/SR; v=np.interp(vt,np.arange(len(v))/vsr,v)
e_=lp(np.abs(v),12); v=v/np.maximum(.08,e_)**.35; v/=np.abs(v).max(); v=reverb(v,1.0,.1,seed=3)
voice=np.zeros(N); voice[:min(N,len(v))]=v[:N]
venv=lp(np.abs(voice),4); venv/=venv.max(); duck=1-.45*np.clip(venv*4,0,1)
# ---------- sfx ----------
sfx=np.zeros(N); hopi=0
def lpv_noise(n,f0,f1):
    out=np.zeros(n); x=rng.standard_normal(n); s=0.0; u=np.arange(n)/n
    a=np.exp(-2*np.pi*(f0+(f1-f0)*np.sin(np.pi*u))/SR)
    for i in range(n): s=(1-a[i])*x[i]+a[i]*s; out[i]=s
    return out*np.sin(np.pi*u)**2
WH=lpv_noise(int(.6*SR),400,3900)
for c in C['cues']:
    ty,t0,vol=c['type'],c['t'],c['vol']
    if ty=='whoosh': place(sfx,WH*.16*vol,t0-.15)
    elif ty=='pop': n=int(.12*SR);ts=np.arange(n)/SR;f=700+600*np.minimum(1,ts/.03);place(sfx,np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,.002,.035)*.13*vol,t0)
    elif ty=='hit': n=int(1.2*SR);ts=np.arange(n)/SR;s=np.sin(2*np.pi*np.cumsum(55+80*np.exp(-ts*25))/SR)*np.exp(-ts*3.5)+lp(rng.standard_normal(n),2500)*env(n,.001,.05)*.5;place(sfx,s*.26*vol,t0)
    elif ty=='brick': n=int(.09*SR);ts=np.arange(n)/SR;s=np.sin(2*np.pi*170*ts)*env(n,.001,.025)+lp(rng.standard_normal(n),1800)*env(n,.0005,.01)*.8;place(sfx,s*.18*vol,t0)
    elif ty=='hop': n=int(.12*SR);ts=np.arange(n)/SR;f=hz(69+[0,2,4,5,7,9,11,12][hopi%8]);place(sfx,np.sin(2*np.pi*f*ts)*env(n,.002,.04)*.09*vol,t0);hopi+=1
    elif ty=='drop': n=int(.22*SR);ts=np.arange(n)/SR;place(sfx,np.sin(2*np.pi*np.cumsum(520*np.exp(-ts*5))/SR)*env(n,.003,.07)*.09*vol,t0)
    elif ty=='nope': n=int(.32*SR);ts=np.arange(n)/SR;s=lp(np.sign(np.sin(2*np.pi*110*ts)),900)*env(n,.005,.12);place(sfx,s*.11*vol,t0)
    elif ty=='win': n=int(2.2*SR);ts=np.arange(n)/SR;place(sfx,sum(np.sin(2*np.pi*hz(m)*ts)*np.exp(-ts*1.8) for m in (81,85,88))*.05*vol,t0)
    elif ty=='thud': n=int(.9*SR);ts=np.arange(n)/SR;s=np.sin(2*np.pi*np.cumsum(48+60*np.exp(-ts*30))/SR)*np.exp(-ts*6)+lp(rng.standard_normal(n),900)*env(n,.001,.04);place(sfx,s*.35*vol,t0)
    elif ty=='impact': n=int(3.2*SR);ts=np.arange(n)/SR;s=np.sin(2*np.pi*np.cumsum(38+90*np.exp(-ts*12))/SR)*np.exp(-ts*1.3)+lp(rng.standard_normal(n),1500)*env(n,.001,.25)*.6+sum(np.sin(2*np.pi*hz(m)*ts)*np.exp(-ts*.9) for m in (57,64,69,72,76))*.1;place(sfx,s*.38*vol,t0)
    elif ty=='tick': n=int(.03*SR);ts=np.arange(n)/SR;place(sfx,np.sin(2*np.pi*2400*ts)*env(n,.0005,.006)*.1*vol,t0)
sfx=reverb(sfx,1.2,.16,seed=9)
mixm=music*duck*.9+sfx
Lc=voice*.8+mixm; Rc=voice*.8+np.roll(mixm,int(.011*SR))*.97
st=np.stack([Lc,Rc],1); st/=np.abs(st).max()/1.15; st=np.tanh(st); st/=np.abs(st).max()/.93
o=wave.open(os.path.join(H,'mix.wav'),'wb'); o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes((st*32767).astype(np.int16).tobytes()); o.close()
print('mix.wav',round(len(st)/SR,1),'s')
