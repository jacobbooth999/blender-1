import json,os
c1=json.load(open('img/c1.json')); c2=json.load(open('img/c2.json')); c3=json.load(open('img/c3.json'))
SRC={'brazil18':(c1,0),'santos25':(c1,2),'alhilal':(c1,3),'santos11':(c1,4),
 'psg':(c2,27),'barca2':(c2,35),'barca':(c2,18),'msn':(c2,17),'psg2':(c2,31),'barca_action':(c2,23),'brazil18b':(c2,38),'brazil14':(c2,44),'brazil15':(c2,43),
 'brazil26':(c3,61),'olympics':(c3,65),'barca14':(c3,87),'alhilal2':(c3,54),'olympics_final':(c3,72),'brazil26b':(c3,62)}
SLOTS={'psg':['psg'],'brazil':['brazil18b','brazil18'],'barca':['barca_action','barca'],'santos11':['santos11'],'msn':['barca14','msn','barca'],
 'barca2':['barca2','barca'],'brazil14':['brazil14','brazil15','brazil18'],'olympics':['olympics_final','olympics'],'psg2':['psg2','psg'],
 'brazil18':['brazil18'],'brazil22':['brazil15','brazil18b','brazil18'],'brazil26':['brazil26'],'brazil26b':['brazil26b','brazil26'],'alhilal':['alhilal'],'santos25':['santos25']}
import re
def short(a): a=re.sub(r'\s+',' ',a).replace('&amp;','&'); a=a.split(' from ')[0]; return a[:40]
story=json.load(open('story.json')); used={}; credits={}
for sc in story['scenes']:
    p=sc.get('photo')
    if not p: continue
    slot=p.get('slot',p['src']); p['slot']=slot
    pick=next((f for f in SLOTS[slot] if os.path.exists(f'img/{f}.jpg')),None)
    if not pick: raise SystemExit('no photo for '+slot)
    p['src']=pick; c,i=SRC[pick]; o=c[i]
    a=short(o['artist']); a='Basc català' if 'Basc' in o['artist'] else a
    credits[pick]=f"{a} / {o['lic']}"; used[pick]=o
json.dump(story,open('story.json','w'),indent=1,ensure_ascii=False)
open('credits.js','w').write('window.CREDITS='+json.dumps(credits,ensure_ascii=False)+';')
with open('CREDITS.md','w') as f:
    f.write('# Photo credits\n\nAll photos come from Wikimedia Commons and are used under their Creative Commons licences (or CC0).\nPaste this list into the video description.\n\n')
    for k,o in used.items(): f.write(f"- {o['title'][5:]}: {re.sub(r'\s+',' ',o['artist']).replace('&amp;','&')}, {o['lic']}\n  https://commons.wikimedia.org/wiki/{o['title'].replace(' ','_')}\n")
    f.write('\nPhotos were made greyscale, given a halftone effect and cropped. "The Matchday Chronicle" is a fictional newspaper.\n')
print(credits)
