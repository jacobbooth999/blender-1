# anim.html = vertical engine (../one-percent-club/anim.html) + shared icon library (../success-long/lib.js) + scenes.js
import os
h=os.path.dirname(os.path.abspath(__file__))
src=open(os.path.join(h,'..','one-percent-club','anim.html')).read()
a=src.index('/* ============ SCENES ============ */'); b=src.index('/* ============ RENDER ============ */')
pre=src[:a].replace('const END=L[11].e+2.0;','const END=L[L.length-1].e+0.3;')
lib=open(os.path.join(h,'..','success-long','lib.js')).read().replace('const S=[];','')
open(os.path.join(h,'anim.html'),'w').write(pre+lib+'\n'+open(os.path.join(h,'scenes.js')).read()+'\n'+src[b:].replace('const fin0=1-P(t,0,.25);','const fin0=0;').replace('const fin=P(t,END-.6,.6);','const fin=0;'))
print('ok')
