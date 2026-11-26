import json,os
meta=json.load(open('img/meta.json')); AC=json.load(open('img/autocrop.json')) if os.path.exists('img/autocrop.json') else {}
CAP={'eel':'An electric eel.','piranha':'A red-bellied piranha.','caiman':'A black caiman.','anaconda':'A green anaconda.','bulletant':'A bullet ant, Ecuador.',
 'bulletant2':'A bullet ant, Peru.','spider':'A Brazilian wandering spider.','botfly':'A botfly larva (rabbit botfly, a close relative).','jaguar':'A jaguar.','jaguar2':'A jaguar.'}
story=json.load(open('story.json')); credits={}; used={}
for sc in story['scenes']:
    p=sc.get('photo')
    if not p: continue
    slot=p.get('slot') or p['src']; p['slot']=slot
    if not os.path.exists(f'img/{slot}.jpg'): del sc['photo']; continue
    p['src']=slot; m=meta[slot]
    if slot in AC: p['pos'],p['size']=AC[slot]['pos'],AC[slot]['size']
    if 'cap' in p: p['cap']=CAP.get(slot,'')
    lic=f"CC {m['license'].upper()} {m.get('ver') or ''}".strip().replace('CC CC0','CC0').replace('CC PDM','Public domain')
    credits[slot]=f"{m['creator']} / {lic}"; used[slot]=(m['title'],m['creator'],lic,m['url'])
json.dump(story,open('story.json','w'),indent=1,ensure_ascii=False)
open('credits.js','w').write('window.CREDITS='+json.dumps(credits,ensure_ascii=False)+';')
with open('CREDITS.md','w') as f:
    f.write('# Photo credits\n\nPhotos from Flickr (via Openverse), used under Creative Commons licences that allow commercial use.\n\n')
    for k,(t,a,l,u) in used.items(): f.write(f"- {t}: {a}, {l}\n  {u}\n")
    f.write('\nPhotos were made greyscale, given a halftone effect and cropped. "The Expedition Chronicle" is a fictional newspaper.\n')
print(credits)
