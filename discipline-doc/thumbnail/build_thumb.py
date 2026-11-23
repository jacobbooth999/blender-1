import os,re
h=os.path.dirname(os.path.abspath(__file__));d=os.path.dirname(h)
a=open(os.path.join(d,'anim.html')).read()
i=a.index('/* ============ RENDER ============ */')
open(os.path.join(h,'thumbs.html'),'w').write(a[:i]+open(os.path.join(h,'thumbs.js')).read()+'\n'+a[i:])
