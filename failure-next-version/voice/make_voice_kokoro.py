"""Female narration with Kokoro (voice af_heart). usage: python3 make_voice_kokoro.py <model.onnx> <voices.bin> [voice] [speed]"""
import json, os, sys, wave, numpy as np
from kokoro_onnx import Kokoro
here=os.path.dirname(os.path.abspath(__file__))
k=Kokoro(sys.argv[1],sys.argv[2]); voice=sys.argv[3] if len(sys.argv)>3 else 'af_heart'; speed=float(sys.argv[4]) if len(sys.argv)>4 else .95
lines=json.load(open(os.path.join(here,'lines.json')))
lead=float(os.environ.get('LEAD','.6')); parts=[]; t=lead; timing=[]; SR=24000
parts.append(np.zeros(int(lead*SR)))
for i,ln in enumerate(lines):
    txt,gap=ln[0],ln[1]; sp=ln[2] if len(ln)>2 else speed
    a,SR=k.create(txt,voice=voice,speed=sp,lang='en-us')
    nz=np.where(np.abs(a)>.01)[0]; a=a[max(0,nz[0]-240):nz[-1]+1200]
    d=len(a)/SR; timing.append({'i':i,'text':txt,'start':round(t,3),'end':round(t+d,3)})
    parts+=[a,np.zeros(int(gap*SR))]; t+=d+gap
out=np.concatenate(parts); out=out/np.abs(out).max()*.9
w=wave.open(os.path.join(here,'raw.wav'),'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
json.dump({'duration':round(t,3),'voice':voice,'lines':timing},open(os.path.join(here,'timing.json'),'w'),indent=1)
print(voice,round(t,2))
