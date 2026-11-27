"""Extract downloaded footage into frame sequences + write footage.js (frame counts, credits)."""
import json,os,glob,subprocess,re
meta=json.load(open('vid/vmeta.json')) if os.path.exists('vid/vmeta.json') else {}
N={};CR={}
for f in sorted(glob.glob('vid/*.webm')+glob.glob('vid/*.ogv')+glob.glob('vid/mx_*.mp4')):
    name=os.path.basename(f).rsplit('.',1)[0]; out=f'footage/{name}'; os.makedirs(out,exist_ok=True)
    if not glob.glob(out+'/f*.jpg'):
        subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f,'-t','14','-vf','scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=30','-q:v','4',out+'/f%04d.jpg'],check=True)
    N[name]=len(glob.glob(out+'/f*.jpg'))
    m=meta.get(name,{}); a=re.sub(r'\s+',' ',m.get('artist','')).split(' from ')[0][:40]
    CR[name]=('Mixkit (free licence)' if name.startswith('mx_') else f"{a or 'Wikimedia Commons'} / {m.get('lic','')}".strip(' /'))
open('footage.js','w').write('window.FOOTN='+json.dumps(N)+';window.FCRED='+json.dumps(CR,ensure_ascii=False)+';')
print(N)
