import numpy as np
from PIL import Image, ImageDraw, ImageFilter
W,H=768,300
# tonal image: floodlit stadium night, figure silhouette in dugout coat from behind
img=Image.new('L',(W,H),0); d=ImageDraw.Draw(img)
yy,xx=np.mgrid[0:H,0:W]
bg=0.25+0.55*np.exp(-(((xx-560)/260)**2+((yy-20)/160)**2))+0.35*np.exp(-(((xx-120)/140)**2+((yy-10)/90)**2))
bg+= 0.15*(yy>200)  # pitch
a=Image.fromarray((np.clip(bg,0,1)*255).astype('uint8'))
d=ImageDraw.Draw(a)
# stands rows
for i in range(6): d.line([(0,150+i*9),(W,140+i*9)],fill=int(70+i*8),width=3)
# silhouette: back view, coat
cx=300
d.ellipse([cx-38,70,cx+38,150],fill=8)                 # head
d.polygon([(cx-30,140),(cx+30,140),(cx+40,165),(cx-40,165)],fill=8)  # collar
d.polygon([(cx-120,300),(cx-105,190),(cx-60,160),(cx+60,160),(cx+105,190),(cx+120,300)],fill=8)
a=a.filter(ImageFilter.GaussianBlur(1.2))
arr=np.asarray(a).astype(float)/255
# halftone
out=Image.new('L',(W,H),236); od=ImageDraw.Draw(out); s=8
for y in range(0,H,s):
  for x in range(0,W,s):
    v=1-arr[min(H-1,y+s//2),min(W-1,x+s//2)]; r=(s*0.72)*np.sqrt(v)
    if r>0.4: od.ellipse([x+s/2-r,y+s/2-r,x+s/2+r,y+s/2+r],fill=22)
out.convert('RGB').save('photo.png')
