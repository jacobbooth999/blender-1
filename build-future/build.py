# anim.html = engine (../one-percent-club/anim.html) -> 1920x1080 + shared lib + beats.js ; subtitles drawn on top via window.AFTER
import os
h=os.path.dirname(os.path.abspath(__file__))
src=open(os.path.join(h,'..','one-percent-club','anim.html')).read()
a=src.index('/* ============ SCENES ============ */'); b=src.index('/* ============ RENDER ============ */')
pre=src[:a]
for x,y in [('width="1080" height="1920" viewBox="0 0 1080 1920"','width="1920" height="1080" viewBox="0 0 1920 1080"'),('const W=1080,H=1920;','const W=1920,H=1080;'),
            ('c.width=540;c.height=960;','c.width=960;c.height=540;'),('createImageData(540,960)','createImageData(960,540)'),('const END=L[11].e+2.0;','const END=L[L.length-1].e+6.0;')]:
    assert x in pre,x; pre=pre.replace(x,y)
post=src[b:]
for x,y in [('const fx=sc.cam.fx||540,fy=sc.cam.fy||940;','const fx=sc.cam.fx||960,fy=sc.cam.fy||540;'),('const fin0=1-P(t,0,.25);','const fin0=0;'),('const X=.2;','const X=.03;'),
            ('  add(`<image href="${GRAINS','  if(window.AFTER)window.AFTER(t);\n  add(`<image href="${GRAINS')]:
    assert x in post,x; post=post.replace(x,y,1)
open(os.path.join(h,'anim.html'),'w').write(pre+open(os.path.join(h,'..','success-long','lib.js')).read()+'\n'+open(os.path.join(h,'beats.js')).read()+'\n'+post)
print('ok')
