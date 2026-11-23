"""Story -> narration WAV + timeline.json (scene starts, cue times, per-word timings)."""
import json,subprocess,re,wave,sys,hashlib,os
import numpy as np
STORY=sys.argv[1] if len(sys.argv)>1 else 'story.json'
MODEL=os.environ.get('VOICE','../tts/en-us-ryan-high.onnx')
SR=22050; LEAD=0.15; SENT_GAP=0.14; SCENE_GAP=0.32; CH_BEFORE=0.35; CH_AFTER=0.55; TAIL=2.5
story=json.load(open(STORY))
os.makedirs('vo',exist_ok=True)
def synth(text):
    h=hashlib.md5((MODEL+text).encode()).hexdigest()[:12]; f=f'vo/{h}.npy'
    if os.path.exists(f): return np.load(f)
    r=subprocess.run(['python3','-m','piper','-m',MODEL,'--length-scale','0.86','--sentence-silence','0','--output-raw'],input=text.encode(),capture_output=True,check=True)
    a=np.frombuffer(r.stdout,dtype=np.int16).astype(np.float32)
    thr=0.02*np.abs(a).max(); idx=np.where(np.abs(a)>thr)[0]; a=a[max(0,idx[0]-200):idx[-1]+800]
    np.save(f,a); return a
def letters(s): return len(re.sub(r'[^\w]','',s))
t=LEAD; track=[]; scenes=[]; words=[]
for si,sc in enumerate(story['scenes']):
    line=sc['vo']; ch=sc['type']=='chapter'
    if ch and si: t+=CH_BEFORE
    parts=[m.group(0).strip() for m in re.finditer(r'[^.?!]+[.?!]?',line) if m.group(0).strip()]
    tt=0.0; cpos=0; spans=[]; audio=[]
    for j,pt in enumerate(parts):
        a=synth(pt); c0=line.index(pt,cpos); cpos=c0+len(pt)
        s0=tt; tt+=len(a)/SR; spans.append((c0,cpos,s0,tt)); audio.append(a)
        # word timings
        tot=max(1,letters(pt)); acc=0
        for m in re.finditer(r"\S+",pt):
            w=m.group(0); L=letters(w)
            ws=s0+(tt-s0)*acc/tot; acc+=L; we=s0+(tt-s0)*acc/tot
            words.append({'w':w,'s':round(t+ws,3),'e':round(t+we,3),'scene':si})
        if j<len(parts)-1: g=SENT_GAP; audio.append(np.zeros(int(g*SR),np.float32)); tt+=g
    a=np.concatenate(audio); d=len(a)/SR
    def ct(idx):
        for c0,c1,s0,s1 in spans:
            if c0<=idx<=c1:
                return s0+(s1-s0)*letters(line[c0:idx])/max(1,letters(line[c0:c1]))
        return spans[-1][3]
    cues={}
    allc=dict(sc.get('cues',{}))
    for r in sc.get('rows',[]):
        if isinstance(r,dict) and r.get('cue'): allc[r['id']]=r['cue']
    for leg in sc.get('legs',[]): allc['leg_'+leg[1]]=leg[2]
    for k,ph in allc.items():
        i=line.lower().find(ph.lower())
        if i<0: raise SystemExit(f'cue {k!r} phrase {ph!r} not in scene {si} vo')
        cues[k]=round(t+ct(i),3); cues[k+'_end']=round(t+ct(i+len(ph)),3)
    scenes.append({'i':si,'type':sc['type'],'vo':round(t,3),'dur':round(d,3),'cues':cues})
    track.append((t,a)); t+=d+(CH_AFTER if ch else SCENE_GAP)
total=t-SCENE_GAP+TAIL
for j,sc in enumerate(scenes):
    if j==0: sc['start']=0.0; continue
    prev=scenes[j-1]; pe=max([v for k,v in prev['cues'].items() if k.endswith('_end')]+[prev['vo']+prev['dur']-0.6])
    sc['start']=round(min(sc['vo']+0.05,max(sc['vo']-0.4,pe+0.15)),3)
out=np.zeros(int(total*SR)+SR,np.float32)
for st,a in track: o=int(st*SR); out[o:o+len(a)]+=a
out=out/np.abs(out).max()*0.89
with wave.open('vo_full.wav','wb') as w:
    w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((out[:int(total*SR)]*32767).astype(np.int16).tobytes())
data={'total':round(total,3),'scenes':scenes,'words':words}
json.dump(data,open('timeline.json','w'))
open('timeline.js','w').write('window.TL='+json.dumps(data)+';window.STORY='+json.dumps(story,ensure_ascii=False)+';')
print('total',round(total,1),'s, scenes',len(scenes),'words',len(words))
