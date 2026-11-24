import json,os,re,glob
cands={os.path.basename(f)[:-5]:json.load(open(f)) for f in glob.glob('img/r*.json')}
cands['ov']=json.load(open('img/ov_all.json'))
SRC=json.load(open('img/sources.json'))
SLOTS={'young':['young','utd3','close'],'utd':['ov_utd10','utd','utd3'],'utd2':['ov_chelsea','utd2','utd3'],'aon':['ov_aon','utd3'],'fk':['ov_fk','utd3'],
 'england':['england','england2'],'england2':['england2','england'],'everton17':['everton17','ov_dark'],'dc':['dc','dc2'],'derby':['ov_derby','dc2']}
FILECAP={'utd3':'Rooney at Manchester United, 2008.','ov_utd10':'Rooney at Old Trafford.','ov_chelsea':'Rooney against Chelsea.','ov_aon':'Rooney at Manchester United, 2011.',
 'ov_fk':'Rooney lines up a free kick, 2011.','ov_derby':'Street art in Derby during the club\'s crisis, 2022.','ov_dark':'Rooney against Everton.','dc2':'Rooney at D.C. United, 2018.','dc':'Rooney at D.C. United, 2018.'}
PCAP={'utd3':'United, 2008','ov_utd10':'United','ov_dark':'v Everton','dc2':'D.C. United','ov_derby':'Derby, 2022','ov_aon':'United'}
FILEPOS={'ov_derby':('50% 62%','140% auto'),'ov_aon':('78% 82%','200% auto'),'ov_fk':('42% 40%','170% auto'),'ov_chelsea':('20% 60%','180% auto'),'ov_utd10':('70% 40%','150% auto')}
def short(a): a=re.sub(r'\s+',' ',a).replace('&amp;','&'); a=a.split(' from ')[0]; return a[:40]
story=json.load(open('story.json')); used={}; credits={}
for sc in story['scenes']:
    p=sc.get('photo')
    if not p: continue
    slot=p.get('slot') or p['src']; p['slot']=slot
    pick=next((f for f in SLOTS[slot] if os.path.exists(f'img/{f}.jpg')),None)
    if not pick: del sc['photo']; continue   # no honest photo -> card without photo
    p['src']=pick; cf,i=SRC[pick]; o=cands[cf][i]
    AC=json.load(open('img/autocrop.json')) if os.path.exists('img/autocrop.json') else {}
    if pick in AC: p['pos'],p['size']=AC[pick]['pos'],AC[pick]['size']
    if 'cap' in p: p['cap']=FILECAP.get(pick,'Wayne Rooney.')
    if 'pc' in p: p['pc']=PCAP.get(pick,p['pc'])
    if cf=='ov':
        lic=f"CC {o['license'].upper()} {o.get('license_version','')}".strip(); credits[pick]=f"{o.get('creator','')} / {lic}"
        used[pick]=(o['title'],o.get('creator',''),lic,o['foreign_landing_url'])
    else:
        credits[pick]=f"{short(o['artist'])} / {o['lic']}"
        used[pick]=(o['title'][5:],re.sub(r'\s+',' ',o['artist']).replace('&amp;','&'),o['lic'],'https://commons.wikimedia.org/wiki/'+o['title'].replace(' ','_'))
json.dump(story,open('story.json','w'),indent=1,ensure_ascii=False)
open('credits.js','w').write('window.CREDITS='+json.dumps(credits,ensure_ascii=False)+';')
with open('CREDITS.md','w') as f:
    f.write('# Photo credits\n\nPhotos from Wikimedia Commons and Flickr (via Openverse), used under Creative Commons licences that allow commercial use.\n\n')
    for k,(t,a,l,u) in used.items(): f.write(f"- {t}: {a}, {l}\n  {u}\n")
    f.write('\nPhotos were made greyscale, given a halftone effect and cropped. "The Matchday Chronicle" is a fictional newspaper.\n')
print(credits)
