"""Find the main subject in each photo and write background-size/position so it's centred (engine helper)."""
import json,glob,os,sys
import numpy as np
from PIL import Image
from rembg import remove,new_session
sess={'human':new_session('u2net_human_seg'),'any':new_session('u2net')}
out={}
for f in sorted(glob.glob('img/*.jpg')):
    k=os.path.basename(f)[:-4]; im=Image.open(f).convert('RGB'); W,H=im.size
    a=None
    for m in ('human','any'):
        al=np.asarray(remove(im,session=sess[m],only_mask=True))
        if (al>128).mean()>0.01: a=al; break
    if a is None: out[k]=None; continue
    ys,xs=np.where(a>128); x0,x1=np.percentile(xs,[2,98]); y0,y1=np.percentile(ys,[2,98])
    # focus on upper part of a person (head/torso): top 60% of the box
    bh=y1-y0; y1f=y0+bh*0.62; cx=(x0+x1)/2/W; cy=(y0+y1f)/2/H
    bw=(x1-x0)/W; bhf=(y1f-y0)/H
    A=1.15  # typical container w/h
    cover=max(1,(1/A)*(W/H))           # image width / container width at "cover"
    need=max(bw*(W/H)/A*1.0, bhf)       # fraction of container the subject spans at cover
    k=min(2.6,max(1.0,0.78/max(need*cover/cover,1e-3)/cover*cover)) if need<0.78 else 1.0
    r=cover*k                            # image width in container widths
    rh=r*(H/W)*A                         # image height in container heights
    px=0.5 if r<=1.001 else min(1,max(0,(cx*r-0.5)/(r-1)))
    py=0.5 if rh<=1.001 else min(1,max(0,(cy*rh-0.5)/(rh-1)))
    y0n=y0/H
    if rh>1.001: py=min(py,max(0,(y0n*rh-0.06)/(rh-1)))
    out[os.path.basename(f)[:-4]]={'size':f'{r*100:.0f}% auto','pos':f'{px*100:.0f}% {py*100:.0f}%'}
    print(os.path.basename(f)[:-4],out[os.path.basename(f)[:-4]],flush=True)
out={k:v for k,v in out.items() if isinstance(k,str) and v}
json.dump(out,open('img/autocrop.json','w'),indent=1)
