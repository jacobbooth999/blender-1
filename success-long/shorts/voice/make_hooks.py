import json,os,sys,wave,numpy as np
from kokoro_onnx import Kokoro
h=os.path.dirname(os.path.abspath(__file__));k=Kokoro(sys.argv[1],sys.argv[2]);H=json.load(open(os.path.join(h,'..','hooks.json')))
for i,x in enumerate(H):
    a,sr=k.create(x['say'],voice='af_heart',speed=1.0,lang='en-us');nz=np.where(np.abs(a)>.01)[0];a=a[max(0,nz[0]-240):nz[-1]+1500];a=a/np.abs(a).max()*.9
    w=wave.open(os.path.join(h,f'hook{i}.wav'),'wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes((a*32767).astype(np.int16).tobytes());w.close()
    x['dur']=round(len(a)/sr,3);print(i,x['dur'],x['say'])
json.dump(H,open(os.path.join(h,'..','hooks.json'),'w'),indent=1)
