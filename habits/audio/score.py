"""Music + SFX + voice mix for 'The 1% Club'. Output: audio/mix.wav (44.1 kHz stereo)."""
import json, wave, os, numpy as np
H=os.path.dirname(os.path.abspath(__file__)); R=os.path.join(H,'..')
SR=44100; rng=np.random.default_rng(3)
C=json.load(open(os.path.join(H,'cues.json'))); END=C['end']+.3
TM=json.load(open(os.path.join(R,'voice','timing.json'))); Ls=[(l['start'],l['end']) for l in TM['lines']]
N=int(END*SR); t_all=np.arange(N)/SR
def env(n,a,d):  # attack seconds, exp decay time-constant
    t=np.arange(n)/SR; return np.minimum(1,t/max(a,1e-4))*np.exp(-t/d)
def place(buf,sig,t0,g=1.0):
    i=int(t0*SR); 
    if i>=len(buf): return
    j=min(len(buf),i+len(sig)); buf[i:j]+=sig[:j-i]*g
def lp(x,fc):
    a=np.exp(-2*np.pi*fc/SR); y=np.empty_like(x); s=0.0
    for i in range(len(x)): s=(1-a)*x[i]+a*s; y[i]=s
    return y
def lpv(x,a_arr):
    y=np.empty_like(x); s=0.0
    for i in range(len(x)): a=a_arr[i]; s=(1-a)*x[i]+a*s; y[i]=s
    return y
def reverb(x,dur=2.2,wet=.25,seed=1):
    r=np.random.default_rng(seed); n=int(dur*SR); ir=r.standard_normal(n)*np.exp(-np.arange(n)/SR/(dur/6.9)); ir[:int(.012*SR)]=0
    ir=lp(ir,5000)*0.02; L=len(x)+n; F=1<<int(np.ceil(np.log2(L)))
    y=np.fft.irfft(np.fft.rfft(x,F)*np.fft.rfft(ir,F),F)[:len(x)]
    return x*(1-wet)+y*wet/ (np.abs(y).max()/max(np.abs(x).max(),1e-9)+1e-9)
hz=lambda m:440*2**((m-69)/12)

# ---------------- music ----------------
BPM=84; beat=60/BPM; bar=4*beat
prog=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]   # Am F C G
mus=np.zeros(N); arp=np.zeros(N); bass=np.zeros(N); drums=np.zeros(N)
nb=int(END/bar)+1
E,F,G,I,J=Ls[3][0]-.2,Ls[6][0]-.2,Ls[9][0]-.2,Ls[21][0],Ls[25][0]   # section times
for b in range(nb):
    ch=prog[b%4]; t0=b*bar; n=int((bar+1.2)*SR); t=np.arange(n)/SR
    if t0>J: ch=[57,61,64]  # resolve to A major after the title hit
    # pad: soft additive, detuned
    pad=np.zeros(n)
    for m in ch+[ch[0]-12]:
        for h in range(1,7):
            for dt in (-.12,.12): pad+=np.sin(2*np.pi*hz(m)*h*(1+dt/100*h)*t+rng.random()*6)/h**1.8
    shape=np.minimum(1,t/.9)*np.minimum(1,np.maximum(0,(bar+1.2-t)/1.2))
    lvl=.9 if F<=t0<G else 1.0
    place(mus,pad*shape*.018*lvl,t0)
    # bass from section E
    if t0+bar>E and not (F<=t0<G):
        bs=np.sin(2*np.pi*hz(ch[0]-24)*t)+.3*np.sin(2*np.pi*hz(ch[0]-12)*t)
        place(bass,bs*np.minimum(1,t/.05)*np.exp(-t/2.2)*.11,max(t0,E) if t0<E else t0)
    # arpeggio (piano-ish)
    step=beat if t0<Ls[9][0] else beat/2
    pat=[0,1,2,1,2,0,1,2]
    k=0; tt=t0
    while tt<t0+bar-1e-6:
        if not (F<=tt<G and k%2): 
            m=ch[pat[k%8]]+12+(12 if (k%8)==4 else 0); nn=int(1.6*SR); ts=np.arange(nn)/SR
            tone=sum(np.sin(2*np.pi*hz(m)*h*ts)*np.exp(-ts*(2.2+h*1.8))/h**1.3 for h in range(1,6))
            tone*=np.minimum(1,ts/.004)
            place(arp,tone*(.05 if tt<E else .06),tt)
        tt+=step; k+=1
# drums from G
tt=G
while tt<END-1.0:
    bi=round((tt-G)/beat)
    if tt<J-.05 or tt>J+.2:
        nn=int(.5*SR); ts=np.arange(nn)/SR; f=45+70*np.exp(-ts*30)
        kick=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-ts*7)
        place(drums,kick*(.30 if tt<J else .18),tt)
        if tt>Ls[15][0] and bi%2==1:
            sn=lp(rng.standard_normal(int(.25*SR)),3500)*env(int(.25*SR),.002,.06)
            place(drums,sn*.14 if tt<J else sn*.08,tt)
        if tt>Ls[15][0]:
            hh=rng.standard_normal(int(.05*SR)); hh=hh-lp(hh,6000); place(drums,hh*env(len(hh),.001,.012)*.06,tt+beat/2)
    tt+=beat
# riser into the title
rs=Ls[21][0]; n=int((J-rs)*SR); ts=np.arange(n)/SR; u=ts/ts[-1]
noise=rng.standard_normal(n); a=np.exp(-2*np.pi*(300+6000*u**2)/SR)
place(mus,lpv(noise,a)*u**2*.10,rs)
music=mus+arp+bass+drums
music=reverb(music,2.5,.3)
# fade in/out
music*=np.minimum(1,t_all/1.5)*np.clip((END-t_all)/2.0,0,1)

# ---------------- voice ----------------
w=wave.open(os.path.join(R,'voice','raw.wav')); vsr=w.getframerate(); v=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16)/32768
vt=np.arange(int(len(v)*SR/vsr))/SR; v=np.interp(vt,np.arange(len(v))/vsr,v)
# gentle compression
e=lp(np.abs(v),12); gain=1/np.maximum(.08,e)**.35; v=v*gain; v/=np.abs(v).max()
v=reverb(v,1.0,.12,seed=5)
voice=np.zeros(N); voice[:min(N,len(v))]=v[:N]
venv=lp(np.abs(voice),4); venv/=venv.max()
duck=1-.45*np.clip(venv*4,0,1)

# ---------------- sfx ----------------
sfx=np.zeros(N); hopi=0
for c in C['cues']:
    ty,t0,vol=c['type'],c['t'],c['vol']
    if ty=='whoosh':
        n=int(.6*SR); u=np.arange(n)/n; a=np.exp(-2*np.pi*(400+3500*np.sin(np.pi*u))/SR)
        s=lpv(rng.standard_normal(n),a)*np.sin(np.pi*u)**2; place(sfx,s*.22*vol,t0-.15)
    elif ty=='pop':
        n=int(.12*SR); ts=np.arange(n)/SR; f=700+600*np.minimum(1,ts/.03)
        s=np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,.002,.035); place(sfx,s*.16*vol,t0)
    elif ty=='hit':
        n=int(1.2*SR); ts=np.arange(n)/SR; s=np.sin(2*np.pi*np.cumsum(55+80*np.exp(-ts*25))/SR)*np.exp(-ts*3.5)
        s+=lp(rng.standard_normal(n),2500)*env(n,.001,.05)*.5; place(sfx,s*.30*vol,t0)
    elif ty=='brick':
        n=int(.09*SR); ts=np.arange(n)/SR; s=np.sin(2*np.pi*170*ts)*env(n,.001,.025)+lp(rng.standard_normal(n),1800)*env(n,.0005,.01)*.8
        place(sfx,s*.20*vol,t0)
    elif ty=='hop':
        n=int(.12*SR); ts=np.arange(n)/SR; f=hz(69+[0,2,4,5,7,9,11,12,14,16][hopi%10])
        s=np.sin(2*np.pi*f*ts)*env(n,.002,.04); place(sfx,s*.10*vol,t0); hopi+=1
    elif ty=='drop':
        n=int(.22*SR); ts=np.arange(n)/SR; f=520*np.exp(-ts*5)
        s=np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,.003,.07); place(sfx,s*.10*vol,t0)
    elif ty=='nope':
        n=int(.35*SR); ts=np.arange(n)/SR; s=np.sign(np.sin(2*np.pi*110*ts)); s=lp(s,900)*env(n,.005,.12); place(sfx,s*.14,t0)
    elif ty=='rise':
        n=int(3.0*SR); ts=np.arange(n)/SR; u=ts/3; f=220*2**(2*eu) if (eu:=None) else 220*2**(2*u**1.5)
        s=sum(np.sin(2*np.pi*np.cumsum(f*h)/SR)/h for h in (1,2,3))*u*(1-u)**.3; place(sfx,s*.045,t0)
    elif ty=='fall':
        n=int(2.3*SR); ts=np.arange(n)/SR; u=ts/2.3; f=660*2**(-2.3*u)
        s=np.sin(2*np.pi*np.cumsum(f)/SR)*np.sin(np.pi*u)**.5; place(sfx,s*.05,t0)
    elif ty=='stairs':
        for k in range(12):
            tk=t0+1.3*(k/11)**1.1; n=int(.07*SR); ts=np.arange(n)/SR
            place(sfx,np.sin(2*np.pi*hz(60+k*2)*ts)*env(n,.001,.02)*.08,tk)
    elif ty=='win':
        n=int(2.5*SR); ts=np.arange(n)/SR
        s=sum(np.sin(2*np.pi*hz(m)*ts)*np.exp(-ts*1.6) for m in (81,85,88,93)); place(sfx,s*.06,t0)
    elif ty=='thud':
        n=int(.9*SR); ts=np.arange(n)/SR; s=np.sin(2*np.pi*np.cumsum(48+60*np.exp(-ts*30))/SR)*np.exp(-ts*6)
        s+=lp(rng.standard_normal(n),900)*env(n,.001,.04); place(sfx,s*.45,t0)
    elif ty=='impact':
        n=int(3.5*SR); ts=np.arange(n)/SR; s=np.sin(2*np.pi*np.cumsum(38+90*np.exp(-ts*12))/SR)*np.exp(-ts*1.3)
        s+=lp(rng.standard_normal(n),1500)*env(n,.001,.25)*.6
        s+=sum(np.sin(2*np.pi*hz(m)*ts)*np.exp(-ts*.9) for m in (57,64,69,73,76))*.12
        place(sfx,s*.45,t0)
    elif ty=='tick':
        n=int(.03*SR); ts=np.arange(n)/SR; s=np.sin(2*np.pi*2400*ts)*env(n,.0005,.006); place(sfx,s*.12*vol,t0)
    elif ty=='sweep':
        n=int(1.0*SR); ts=np.arange(n)/SR
        s=sum(np.sin(2*np.pi*hz(76+i*3)*ts)*np.exp(-np.maximum(0,ts-i*.08)*6)*(ts>i*.08) for i in range(6)); place(sfx,s*.025,t0)
sfx=reverb(sfx,1.2,.18,seed=9)

mix_m=music*duck*.9+sfx
L=voice*.80+mix_m; Rr=voice*.80+np.roll(mix_m,int(.011*SR))*.97+np.roll(arp,int(.017*SR))*.01
st=np.stack([L,Rr],1); st/=np.abs(st).max()/1.15; st=np.tanh(st); st/=np.abs(st).max()/.93
out=wave.open(os.path.join(H,'mix.wav'),'wb'); out.setnchannels(2); out.setsampwidth(2); out.setframerate(SR)
out.writeframes((st*32767).astype(np.int16).tobytes()); out.close(); print('mix.wav',round(len(st)/SR,2),'s')
