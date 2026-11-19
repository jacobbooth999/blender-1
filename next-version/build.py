# builds anim.html = shared engine (from ../one-percent-club/anim.html) + scenes.js
import os
h=os.path.dirname(os.path.abspath(__file__))
src=open(os.path.join(h,'..','one-percent-club','anim.html')).read()
a=src.index('/* ============ SCENES ============ */'); b=src.index('/* ============ RENDER ============ */')
pre=src[:a].replace('const END=L[11].e+2.0;','const END=L[L.length-1].e+2.2;')
open(os.path.join(h,'anim.html'),'w').write(pre+open(os.path.join(h,'scenes.js')).read()+'\n'+src[b:])
print('ok')
