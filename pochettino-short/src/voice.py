import json,subprocess,re,wave,numpy as np
s=json.load(open('script.json'))
cues=[[('a0','third from bottom'),('a1','Mauricio Pochettino')],
      [('b0','worst ever Premier League start'),('b1','less than six months')],
      [('c0','Champions League final'),('c1','press high')],
      [('d0','one league title'),('d1','single season')],
      [('e0','first job'),('e2','trophy'),('e1','survival')],
      [('f0','will Pochettino succeed'),('f1','comments')]]
PAUSE={4:0.42}; SENT_GAP=0.12
LEAD,TAIL=0.3,0.9; GAPS=[0.15,0.15,0.15,0.15,0.5]
SR=22050
def synth(text):
    r=subprocess.run(['python3','-m','piper','-m','../tts/en-us-ryan-high.onnx','--length-scale','0.84','--sentence-silence','0','--output-raw'],input=text.encode(),capture_output=True,check=True)
    a=np.frombuffer(r.stdout,dtype=np.int16).astype(np.float32)
    # trim silence
    thr=0.02*np.abs(a).max(); idx=np.where(np.abs(a)>thr)[0]
    return a[max(0,idx[0]-200):idx[-1]+800]
t=LEAD; scenes=[]; track=[]
for i,line in enumerate(s):
    parts=[m.group(0).strip() for m in re.finditer(r'[^.?!:]+[.?!:]?',line) if m.group(0).strip()]
    audio=[]; spans=[]; pos=0; tt=0.0; cpos=0
    for j,pt in enumerate(parts):
        a=synth(pt); start=tt; tt+=len(a)/SR
        c0=line.index(pt,cpos); spans.append((c0,c0+len(pt),start,tt)); cpos=c0+len(pt)
        audio.append(a)
        if j<len(parts)-1:
            g=PAUSE.get(i,SENT_GAP); audio.append(np.zeros(int(g*SR),np.float32)); tt+=g
    a=np.concatenate(audio); d=len(a)/SR
    def ct(idx):
        for c0,c1,s0,s1 in spans:
            if c0<=idx<=c1:
                # weight: syllable-ish chars, ignore spaces/punct
                seg=line[c0:c1]; pre=re.sub(r'[^a-z]','',line[c0:idx].lower()); tot=re.sub(r'[^a-z]','',seg.lower())
                return s0+(s1-s0)*len(pre)/max(1,len(tot))
        return spans[-1][3]
    sc={'i':i,'vo':round(t,3),'dur':d,'cues':{}}
    for k,w in cues[i]:
        idx=line.lower().index(w.lower()); sc['cues'][k]=round(t+ct(idx),3); sc['cues'][k+'_end']=round(t+ct(idx+len(w)),3)
    scenes.append(sc); track.append((t,a)); t+=d+(GAPS[i] if i<len(GAPS) else 0)
total=t+TAIL
out=np.zeros(int(total*SR)+SR,np.float32)
for st,a in track: o=int(st*SR); out[o:o+len(a)]+=a
out=out/np.abs(out).max()*0.89
with wave.open('vo_full.wav','wb') as w:
    w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((out[:int(total*SR)]*32767).astype(np.int16).tobytes())
for j,sc in enumerate(scenes):
    if j==0: sc['start']=0; continue
    prev=max(v for k,v in scenes[j-1]['cues'].items() if k.endswith('_end'))
    sc['start']=round(min(sc['vo']+0.05,max(sc['vo']-0.45,prev+(0.45 if j==5 else 0.12))),3)
data={'total':round(total,3),'scenes':scenes}
json.dump(data,open('timeline.json','w'),indent=1); open('timeline.js','w').write('window.TL='+json.dumps(data)+';')
print(round(total,2)); [print(sc['i'],sc['start'],sc['cues']) for sc in scenes]
