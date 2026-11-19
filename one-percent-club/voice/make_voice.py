import json, subprocess, wave, os, sys
here=os.path.dirname(os.path.abspath(__file__))
model=sys.argv[1]
lines=json.load(open(os.path.join(here,'lines.json')))
SR=22050; lead=0.6
import numpy as np
parts=[np.zeros(int(lead*SR),dtype=np.int16)]; t=lead; timing=[]
for i,(txt,gap) in enumerate(lines):
    f=os.path.join(here,f'l{i:02d}.wav')
    subprocess.run([sys.executable,'-m','piper','-m',model,'-f',f,'--length_scale','1.12','--noise_scale','0.6','--noise_w','0.7'],input=txt.encode(),check=True,capture_output=True)
    w=wave.open(f); a=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16); SR=w.getframerate()
    # trim silence
    nz=np.where(np.abs(a)>300)[0]; a=a[max(0,nz[0]-200):nz[-1]+800]
    d=len(a)/SR; timing.append({'i':i,'text':txt,'start':round(t,3),'end':round(t+d,3)})
    parts+= [a,np.zeros(int(gap*SR),dtype=np.int16)]; t+=d+gap
out=np.concatenate(parts)
w=wave.open(os.path.join(here,'raw.wav'),'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes()); w.close()
json.dump({'duration':round(t,3),'lines':timing},open(os.path.join(here,'timing.json'),'w'),indent=1)
print(round(t,2))
