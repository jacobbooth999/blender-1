import json,wave,os,numpy as np,importlib.util,sys
# reuse the archery soundtrack engine with this video's sections + voice
D=os.path.dirname(os.path.abspath(__file__));R=os.path.join(D,'..')
src=open(os.path.join(R,'..','archery','score.py')).read()
src=src.replace("D=os.path.dirname(os.path.abspath(__file__))","D=os.path.join(%r,'audio')"%R)
TM=json.load(open(os.path.join(R,'voice','timing.json')))['lines'];y=TM[5]["start"]-.1
src=src.replace("segs=[(0,5,1,Am),(5,17,2,Am),(17,29,0,Tense),(29,38,3,Up),(38,43.8,3,Up),(44.6,END,0,Am)]",f"segs=[(0,{y:.2f},2,Am),({y:.2f},END+.6,3,Up)]")
src=src.replace("BPM=96","BPM=104").replace("if I==0 and s<30:","if False:")
src=src.replace("mix=mus+sfx; mix*=np.clip((END-np.arange(N)/SR)/1.2,0,1)","""w=wave.open(os.path.join(%r,'voice','raw.wav'));vsr=w.getframerate();v=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16)/32768
v=np.interp(np.arange(int(len(v)*SR/vsr))/SR,np.arange(len(v))/vsr,v);voice=np.zeros(N);voice[:min(N,len(v))]=v[:N];e_=lp(np.abs(voice),4);e_/=e_.max();duck=1-.5*np.clip(e_*4,0,1)
mix=voice*1.6+mus*duck*.85+sfx"""%R)
exec(compile(src,'score','exec'))
