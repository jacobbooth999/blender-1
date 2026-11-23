import numpy as np
from PIL import Image, ImageFilter
rng=np.random.default_rng(7)
def blur_noise(h,w,s):
    n=Image.fromarray((rng.random((h,w))*255).astype('uint8')).filter(ImageFilter.GaussianBlur(s))
    a=np.asarray(n).astype(float); a=(a-a.min())/(a.max()-a.min()+1e-9); return a
# paper: warm off-white, fibers, blotches, creases
H=W=1400
base=np.ones((H,W,3))*np.array([238,230,212])/255
blot=blur_noise(H,W,60)*0.6+blur_noise(H,W,15)*0.4
fine=rng.random((H,W))
img=base*(0.90+0.10*blot[...,None])*(0.96+0.04*fine[...,None])
# fibers
fib=np.zeros((H,W))
for _ in range(2500):
    x,y=rng.integers(0,W),rng.integers(0,H); L=rng.integers(5,30); a=rng.random()*np.pi
    for k in range(L):
        xx=int(x+np.cos(a)*k); yy=int(y+np.sin(a)*k)
        if 0<=xx<W and 0<=yy<H: fib[yy,xx]+=1
fib=np.asarray(Image.fromarray((np.clip(fib,0,1)*255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.7)))/255
img*= (1-0.08*fib[...,None])
# fold creases (light/dark lines)
yy,xx=np.mgrid[0:H,0:W]
for (cx,ang) in [(0.42,0.04),(0.71,-0.03)]:
    d=(yy/H-cx)-ang*(xx/W-0.5)
    img*= (1-0.05*np.exp(-(d*H/3)**2)[...,None]) * (1+0.03*np.exp(-((d*H-5)/6)**2)[...,None])
Image.fromarray((np.clip(img,0,1)*255).astype('uint8')).save('paper.jpg',quality=92)
# desk: dark blue-grey textured board
H2,W2=2400,2400
d=0.55+0.25*blur_noise(H2,W2,80)+0.12*blur_noise(H2,W2,6)+0.08*rng.random((H2,W2))
col=np.array([38,42,52])/255
desk=col*d[...,None]*1.3
Image.fromarray((np.clip(desk,0,1)*255).astype('uint8')).save('desk.jpg',quality=90)
# grain frames
for i in range(6):
    g=(rng.normal(128,40,(960,540))).clip(0,255).astype('uint8')
    Image.fromarray(g).save(f'grain{i}.png')
print('ok')
