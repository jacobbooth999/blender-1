"""script.txt -> voice/lines.json ([text,gap]) + chapters.json. Headings become on-screen cards (silent gaps)."""
import re,json,os
h=os.path.dirname(os.path.abspath(__file__));src=open(os.path.join(h,'..','script.txt')).read().replace('’',"'")
paras=[p.strip() for p in src.split('\n\n') if p.strip()]
lines=[];chapters=[];CARD=4.2
for p in paras:
    m=re.match(r'^(INTRODUCTION|CHAPTER \d+|CONCLUSION)\s+—\s+(.*)$',p)
    if p.startswith('HOW TO BECOME'): continue
    if m:
        if lines: lines[-1][1]=CARD+0.6
        chapters.append({'tag':m.group(1),'title':m.group(2),'first':len(lines)}); continue
    if p=='THE NEXT VERSION.':
        lines[-1][1]=1.1; lines.append(['The next version.',2.6]); continue
    sents=re.findall(r'[^.?!]+[.?!]+',p) or [p]
    for k,s in enumerate(sents):
        s=s.strip(); last=k==len(sents)-1
        lines.append([s,(0.6 if s.endswith('?') else 0.5) if last else 0.32])
# intro has no card at t=0 (title hook overlays the opening instead)
json.dump(lines,open(os.path.join(h,'lines.json'),'w'),indent=0)
json.dump(chapters,open(os.path.join(h,'chapters.json'),'w'),indent=1)
print(len(lines),'lines',sum(len(l[0].split()) for l in lines),'words')
