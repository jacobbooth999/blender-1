"""Builds out/short_N.mp4 for each chapter: vertical hook + framed chapter clip with headline, captions and footer."""
import json, os, subprocess, wave, re, numpy as np
D=os.path.dirname(os.path.abspath(__file__)); R=os.path.join(D,'..')
H=json.load(open(os.path.join(D,'hooks.json'))); TL=json.load(open(os.path.join(R,'voice','timing.json')))['lines']; CH=json.load(open(os.path.join(R,'voice','chapters.json')))
FULL=os.path.join(R,'out','how_to_become_successful.mp4'); VEND=665.0; SR=44100
def ts(t): t=max(0,t); h=int(t//3600); m=int(t%3600//60); s=t%60; return f"{h}:{m:02d}:{s:05.2f}"
def esc(s): return s.replace('{','(').replace('}',')')
def chunks(text,start,end,maxc=26):
    words=text.split(); out=[]; cur=''
    for w in words:
        if len(cur)+len(w)+1>maxc and cur: out.append(cur); cur=w
        else: cur=(cur+' '+w).strip()
    if cur: out.append(cur)
    tot=sum(len(c) for c in out); t=start; res=[]
    for c in out: d=(end-start)*len(c)/tot; res.append((t,t+d,c)); t+=d
    return res
def hook_audio(i,dur,fn):
    w=wave.open(os.path.join(D,'voice',f'hook{i}.wav')); vsr=w.getframerate(); v=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16)/32768
    v=np.interp(np.arange(int(len(v)*SR/vsr))/SR,np.arange(len(v))/vsr,v)
    n=int(dur*SR); out=np.zeros(n); t=np.arange(n)/SR
    o=int(.12*SR); out[o:o+len(v)]+=v[:max(0,n-o)]*.85
    # impact at 0 + soft chord bed + whoosh into the clip
    k=np.sin(2*np.pi*np.cumsum(38+90*np.exp(-t*12))/SR)*np.exp(-t*2.5)*.35
    bed=sum(np.sin(2*np.pi*440*2**((m-69)/12)*t) for m in (57,60,64,69))*np.minimum(1,t/.3)*.025
    rng=np.random.default_rng(i); nz=rng.standard_normal(n); a=np.exp(-2*np.pi*1500/SR); s=0.0; f=np.empty(n)
    for j in range(n): s=(1-a)*nz[j]+a*s; f[j]=s
    wh=f*np.clip((t-(dur-.6))/.6,0,1)**2*.25
    mix=out+k+bed+wh; mix/=max(1,np.abs(mix).max()/.9)
    st=np.stack([mix,mix],1); ww=wave.open(fn,'wb'); ww.setnchannels(2); ww.setsampwidth(2); ww.setframerate(SR); ww.writeframes((st*32767).astype(np.int16).tobytes()); ww.close()
HEAD="""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Head,Inter Black,120,&H00FFFFFF,&H00FFFFFF,&H00FFFFFF,&H00000000,0,0,0,0,100,100,3,0,1,0,0,2,40,40,0,1
Style: Glow,Inter Black,120,&H00FFFFFF,&H00FFFFFF,&H00FFFFFF,&H00000000,0,0,0,0,100,100,3,0,1,10,0,2,40,40,0,1
Style: Lab,Inter,30,&H00BBBBBB,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,7,0,1,0,0,8,40,40,0,1
Style: Cap,Inter ExtraBold,66,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,1,0,1,4,0,8,70,70,0,1
Style: Foot,Inter,26,&H00999999,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,6,0,1,0,0,8,40,40,0,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
for i,h in enumerate(H):
    c=CH[i]; first=c['first']; last=(CH[i+1]['first']-1) if i+1<len(CH) else len(TL)-1
    s=0.0 if i==0 else TL[first]['start']-.25; e=VEND if i==len(CH)-1 else TL[last]['end']+.15; dur=e-s
    ass=HEAD; sz=lambda t:min(140,int(900/(len(t)*.76))); E=ts(dur)
    ass+=f"Dialogue: 0,0:00:00.00,{E},Lab,,0,0,0,,{{\\pos(540,232)}}{esc(h['label'])}\n"
    y=440
    for k,line in enumerate(h['text']):
        z=sz(line); yy=y+(int(z*.95) if k else 0)+int(z*.2)
        ass+=f"Dialogue: 0,0:00:00.00,{E},Glow,,0,0,0,,{{\\pos(540,{yy})\\fs{z}\\blur14\\alpha&HB0&}}{esc(line)}\n"
        ass+=f"Dialogue: 1,0:00:00.00,{E},Head,,0,0,0,,{{\\pos(540,{yy})\\fs{z}\\blur1}}{esc(line)}\n"
    for L in TL[first:last+1]:
        if L['end']<s or L['start']>e: continue
        for a,b,txt in chunks(L['text'],L['start']-s,L['end']-s):
            ass+=f"Dialogue: 2,{ts(a)},{ts(b)},Cap,,0,0,0,,{{\\pos(540,1300)\\fad(60,60)}}{esc(txt.upper())}\n"
    ass+=f"Dialogue: 0,0:00:00.00,{E},Foot,,0,0,0,,{{\\pos(540,1560)}}FULL VIDEO ON MY CHANNEL  ·  PART {i+1}/9\n"
    af=os.path.join(D,'parts',f'short{i}.ass'); open(af,'w').write(ass)
    main=os.path.join(D,'parts',f'main{i}.mp4')
    subprocess.run(['ffmpeg','-v','error','-y','-loop','1','-framerate','30','-i',os.path.join(D,'parts','bg.png'),'-ss',f'{s:.3f}','-t',f'{dur:.3f}','-i',FULL,
      '-filter_complex',f"[1:v]scale=1080:608,setsar=1[v];[0:v][v]overlay=0:640:shortest=1,drawbox=x=0:y=638:w=1080:h=612:color=white@0.22:t=2,ass='{af}',fps=30,format=yuv420p[out];[1:a]afade=t=out:st={max(0,dur-.5):.3f}:d=0.5[a]",
      '-map','[out]','-map','[a]','-c:v','libx264','-preset','medium','-crf','19','-c:a','aac','-b:a','192k','-ar','44100','-ac','2',main],check=True)
    hl=h['hookLen']; hw=os.path.join(D,'parts',f'hook{i}.wav'); hook_audio(i,hl,hw)
    outp=os.path.join(D,'out',f"short_{i+1:02d}.mp4")
    subprocess.run(['ffmpeg','-v','error','-y','-i',os.path.join(D,'parts',f'hook{i}.mp4'),'-i',hw,'-i',main,
      '-filter_complex','[0:v]fps=30,format=yuv420p,setsar=1[hv];[2:v]setsar=1[mv];[hv][1:a][mv][2:a]concat=n=2:v=1:a=1[v][a]',
      '-map','[v]','-map','[a]','-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p','-profile:v','high','-c:a','aac','-b:a','160k','-movflags','+faststart',outp],check=True)
    print(i+1,round(hl+dur,1),'s',outp,flush=True)
