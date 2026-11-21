/* ============ SCENES — "ONE HABIT AT A TIME" (vertical) ============ */
const S=[];
function scene(s,e,draw,cam={}){S.push({s,e,draw,cam});}
const l=i=>L[i].s, le=i=>L[i].e;
const BV=[[170,420,150,.05],[930,1480,190,.045],[860,300,90,.04],[120,1650,120,.035]];
// tile figure (centre cx, feet gy, tile size sz)
function tileFig(cx,gy,sc=1){const out=[],s=30*sc,hy=gy-410*sc,hr=78*sc,bx0=cx-110*sc,bx1=cx+110*sc,by0=gy-300*sc,by1=gy-10*sc,rr=54*sc;let seed=Math.round(cx+gy);const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280;};
  for(let y=hy-hr;y<=by1;y+=s)for(let x=bx0-40*sc;x<=bx1+40*sc;x+=s){const px=x+s/2,py=y+s/2;let ins=Math.hypot(px-cx,py-hy)<=hr-3;
    if(py>=by0&&py<=by1&&px>=bx0&&px<=bx1){if(py<by0+rr){const c=px<bx0+rr?bx0+rr:(px>bx1-rr?bx1-rr:px);ins=Math.hypot(px-c,py-(by0+rr))<=rr||(px>=bx0+rr&&px<=bx1-rr);}else ins=true;}
    if(ins)out.push({x:px,y:py,d:rnd(),sx:rnd(),sy:rnd()});}return out;}
const TOP=tileFig(540,880,.95),BOT=tileFig(540,1560,.95),FIN=tileFig(540,1460,1.25);
function tileAt(x,y,sz,fill,op=1,rot=0){add(`<rect x="${x-sz/2}" y="${y-sz/2}" width="${sz}" height="${sz}" rx="${sz*.18}" fill="${fill?'#f2f2f2':'#0b0b0b'}" stroke="#fff" stroke-width="2" opacity="${op}" transform="rotate(${rot},${x},${y})"/>`);}

/* A — HOOK: building vs destroying (L0, L1) */
scene(0,l(2)-.25,()=>{
  bokeh(BV,T);
  // text hook from frame one
  title(540,165,'YOUR HABITS',{size:112});
  label(540,232,'ARE EITHER…',{size:24,op:.75});
  // top: a figure assembling
  const bt=clamp((T+.4)/2.8);
  TOP.forEach(t=>{const q=clamp((bt-t.d*.7)/.3);const side=t.sx<.5?-1:1;const x=lerp(540+side*(380+t.sy*160),t.x,eio(q)),y=lerp(380+t.d*480,t.y,eio(q));tileAt(x,y,26,q>=1,q>0?1:.25);});
  if(bt>.9)add(`<ellipse cx="540" cy="700" rx="200" ry="260" fill="url(#bk)" fill-opacity=".10"/>`);
  pop(l(0)+1.2,540,935,()=>pillShape(540,935,'BUILDING WHO YOU WANT TO BE',{size:20}),{snd:'pop'});
  add(`<line x1="60" y1="985" x2="1020" y2="985" stroke="#fff" stroke-opacity=".25" stroke-width="2" stroke-dasharray="10 8"/>`);
  // bottom: a figure crumbling
  const ct=P(T,l(1)-.1,2.0);
  BOT.forEach(t=>{const q=clamp((ct-(1-t.y/1600)*.0-t.d*.6)/.4);const fall=q*q;const x=t.x+(t.sx-.5)*160*q,y=t.y+fall*420;tileAt(x,y,26,q<.2,(1-q*.7)*.85,q*(t.sx-.5)*160);});
  if(ct>0)cue('drop',l(1)-.1,.7);
  pop(l(1)+.3,540,1640,()=>pillShape(540,1640,'OR DESTROYING YOUR POTENTIAL',{size:20,dark:true}),{snd:'nope',vol:.5});
  for(let k=0;k<10;k++)cue('brick',.05+k*.22,.3);
},{zoom:.03});

/* B — think about it (L2) */
scene(l(2)-.25,l(3)-.25,()=>{
  bokeh(BV,T);pop(l(2)-.1,540,760,()=>{title(540,760,'THINK',{size:150});title(540,900,'ABOUT IT.',{size:110});},{snd:'hit',vol:.6});
  const G=1400;ground(G,1);person(440,G,.9,{spot:true,arm:[14,-34]});
  pop(l(2)+.25,640,G-270,()=>bubble(680,G-300,120,'?',{size:40}),{vol:.4});
},{zoom:.05});

/* C — every habit is a brick (L3-L5) */
scene(l(3)-.25,l(6)-.25,()=>{
  bokeh(BV,T);
  fadeIn(l(3)-.2,()=>label(540,300,'EVERY TIME YOU…',{size:26,op:.75}));
  const rows=[[3,'phone','SCROLL ON WAKING',false],[4,'hourglass','PROCRASTINATE',false],[5,'check','DO SOMETHING PRODUCTIVE',true]];
  rows.forEach(([i,ic,tx,good],k)=>{const y=400+k*190;pop(l(i)+.2,540,y,()=>{box(110,y-75,860,150,{r:24,op:good?1:.7});
      if(ic==='check')check(220,y,1.6);else icon(ic,220,y,.95,.8);label(310,y+12,tx,{size:30,op:good?1:.8,weight:800,sp:.06,anchor:'start'});
      label(930,y+10,'+1 BRICK',{size:16,op:.55,anchor:'end'});},{snd:'pop'});});
  // the wall: who you're becoming
  const G=1530;ground(G,1);label(700,G+56,"WHO YOU'RE BECOMING",{size:18,op:.6});
  const bricks=[[3,4,false],[4,4,false],[5,5,true]];let n=0;
  bricks.forEach(([i,cnt,good])=>{for(let k=0;k<cnt;k++){const id=n++;const r=Math.floor(id/5),c=id%5,x=470+c*96+(r%2)*48,y=G-(r+1)*54;const tl=l(i)+.9+k*.18;const q=P(T,tl-.18,.18);
    if(q>0)add(`<rect x="${x}" y="${y-(1-eo(q))*60}" width="88" height="46" rx="6" fill="#fff" fill-opacity="${good?.85:.08}" stroke="#fff" stroke-opacity="${good?1:.5}" stroke-width="2.5" ${good?'filter="url(#glowS)"':''}/>`);cue('brick',tl,.5);}});
  person(260,G,.95,{spot:true,arm:[60,-40]});
},{zoom:.03});

/* D — the scary part: today -> tomorrow (L6-L8) */
scene(l(6)-.25,l(9)-.25,()=>{
  bokeh(BV,T);
  pop(l(6)-.1,540,420,()=>title(540,440,'THE SCARY PART?',{size:96}),{snd:'hit',vol:.7,outAt:l(7)-.15});
  fadeIn(l(7)-.1,()=>label(540,420,"YOUR HABITS DON'T JUST DETERMINE…",{size:24,op:.8}));
  const G=1420;ground(G,1);
  pop(l(7)+.4,280,800,()=>{box(160,660,240,260,{r:22,op:.95});add(`<rect x="160" y="660" width="240" height="60" rx="22" fill="#fff" fill-opacity=".9"/>`);label(280,700,'TODAY',{size:20,op:1,fill:'#000',weight:800});label(280,830,'WHAT',{size:26,op:1,weight:800});label(280,865,'YOU DO',{size:26,op:1,weight:800});},{snd:'pop'});
  person(280,G,.85,{spot:.7});
  drawPath(`M420,800 C 560,700 640,700 700,760`,eo(P(T,l(8),.7)),{sw:4,dash:'10 9',glow:null,op:.7});
  const fp=back(P(T,l(8)+.5,.6));if(fp>0){add(`<circle cx="800" cy="${G-220}" r="${260*fp}" fill="url(#bk)" fill-opacity=".14"/>`);personOutline(800,G,1.9*fp,1);}
  pill(l(8)+.9,800,620,'WHO YOU BECOME TOMORROW',{size:20});
},{zoom:.03});

/* E — so how do you change them? (L9) */
scene(l(9)-.25,l(10)-.25,()=>{
  bokeh(BV,T);
  fadeIn(l(9)-.2,()=>label(540,520,'SO HOW DO YOU',{size:30,op:.8}));
  pop(l(9)+.25,540,630,()=>title(540,650,'CHANGE THEM?',{size:110}),{snd:'hit',vol:.7});
  [0,1,2].forEach(k=>pop(l(9)+.5+k*.18,240+k*300,900,()=>{add(`<circle cx="${240+k*300}" cy="900" r="70" fill="#0b0b0b" stroke="#fff" stroke-width="3.5" filter="url(#glowS)"/>`);label(240+k*300,920,String(k+1),{size:56,op:1,weight:900,sp:0});},{vol:.4}));
  const G=1400;ground(G,1);person(540,G,.9,{spot:true,arm:[50,-60]});
},{zoom:.04});

/* F — 1. make good habits ridiculously easy (L10-L14) */
function stepTag(n,t0,txt){fadeIn(t0,()=>{add(`<circle cx="130" cy="300" r="44" fill="#f4f4f4" filter="url(#glow)"/>`);label(130,318,String(n),{size:48,op:1,fill:'#000',weight:900,sp:0});label(200,290,txt[0],{size:30,op:1,weight:800,anchor:'start',sp:.06});label(200,330,txt[1],{size:30,op:1,weight:800,anchor:'start',sp:.06});});}
scene(l(10)-.25,l(15)-.25,()=>{
  bokeh(BV,T);stepTag(1,l(10)-.2,['MAKE GOOD HABITS','RIDICULOUSLY EASY']);
  const G=1500;ground(G,1);
  const o=l(11)-.2;
  if(T<o+.4)g(`opacity="${1-P(T,o,.4)}"`,()=>{
    // giant wall vs tiny step
    add(`<rect x="560" y="${G-560}" width="160" height="560" rx="10" fill="#0b0b0b" stroke="#fff" stroke-opacity=".5" stroke-width="4"/>`);cross(640,G-300,2,.8,P(T,l(10)+1.0,.3));
    drawPath(`M760,${G} L760,${G-50} L900,${G-50} L900,${G}`,eo(P(T,l(10)+1.5,.5)),{sw:4});pop(l(10)+1.8,830,G-110,()=>pillShape(830,G-110,'EASY',{size:18}),{vol:.4});
    person(340,G,1,{spot:true});});
  if(T>o){
    pop(l(11),540,640,()=>{box(220,470,640,340,{r:26,op:.95});icon('book',540,590,1.6);label(540,720,'WANT TO READ MORE?',{size:24,op:.8,weight:800});},{snd:'pop',outAt:l(13)-.2});
    pop(l(12)+.1,540,860,()=>pillShape(540,860,'1 PAGE A DAY',{size:28}),{snd:'win',vol:.4,outAt:l(13)-.2});
    pop(l(13),540,640,()=>{box(220,470,640,340,{r:26,op:.95});icon('dumbbell',540,580,1.6);label(540,720,'WANT TO GET FITTER?',{size:24,op:.8,weight:800});},{snd:'pop'});
    if(T>l(14)){const sec=600-Math.floor(clamp((T-l(14,0))/2.2)*12);pop(l(14)+.1,540,880,()=>{pillShape(540,880,'10-MINUTE WORKOUT',{size:26});label(540,970,`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`,{size:44,op:.9,weight:800,sp:.04});},{snd:'win',vol:.4});}
    person(540,G,.95,{spot:true,arm:T>l(13)?[46,-70]:[30,-50]});}
},{zoom:.03});

/* G — 2. make bad habits harder (L15-L18) */
scene(l(15)-.25,l(19)-.25,()=>{
  bokeh(BV,T);stepTag(2,l(15)-.2,['MAKE BAD HABITS','HARDER TO ACCESS']);
  const G=1500;ground(G,1);person(200,G,.9,{spot:.7,arm:T>l(16)&&T<l(17)?[60,-20]:null});
  // phone into another room
  const o2=l(17)-.15;
  if(T<o2+.4)g(`opacity="${1-P(T,o2,.4)}"`,()=>{const dx=880,dy=G;add(`<rect x="${dx-110}" y="${dy-420}" width="220" height="420" fill="#0b0b0b" stroke="#fff" stroke-width="4" filter="url(#glowS)"/>`);label(dx,dy-450,'ANOTHER ROOM',{size:18,op:.7});
    const mv=eio(P(T,l(16)+.1,1.0));const px=lerp(330,dx,mv),py=lerp(G-220,G-200,mv)-Math.sin(Math.PI*mv)*120;if(mv<1)icon('phone',px,py,.9);
    const dc=P(T,l(16)+1.2,.3);if(dc>0)add(`<rect x="${dx-110}" y="${dy-420}" width="${220*dc}" height="420" fill="#141414" stroke="#fff" stroke-width="3"/><circle cx="${dx-110+200*dc}" cy="${dy-210}" r="7" fill="#fff" opacity="${dc}"/>`);cue('thud',l(16)+1.3,.5);});
  // delete apps
  const o3=l(18)-.15;
  if(T>o2&&T<o3+.4)g(`opacity="${P(T,o2,.3)*(1-P(T,o3,.4))}"`,()=>{box(300,520,480,760,{r:50,op:.95});
    const apps=['play','game','people','note','chart','phone','smile','star','gear'];apps.forEach((a,k)=>{const x=410+(k%3)*130,y=680+Math.floor(k/3)*170;const del=[0,1,2,5].includes(k);const dq=del?P(T,l(17)+.5+[0,1,2,5].indexOf(k)*.25,.3):0;
      if(dq<1){add(`<g opacity="${1-dq}" transform="translate(${x},${y}) scale(${1-dq*.6}) translate(${-x},${-y})">`);add(`<rect x="${x-50}" y="${y-50}" width="100" height="100" rx="24" fill="#0b0b0b" stroke="#fff" stroke-width="3"/>`);icon(a,x,y,.55);if(del)add(`<circle cx="${x+44}" cy="${y-44}" r="16" fill="#fff"/><path d="M${x+37},${y-51} L${x+51},${y-37} M${x+51},${y-51} L${x+37},${y-37}" stroke="#000" stroke-width="4"/>`);add('</g>');}});
    for(let k=0;k<4;k++)cue('pop',l(17)+.5+k*.25,.35);label(540,1240,'DELETE THE TIME-WASTERS',{size:18,op:.75});});
  // remove temptations: locked away
  if(T>o3){fadeIn(o3+.1,()=>{['couch','game','phone'].forEach((ic,k)=>{const x=420+k*200,y=900;icon(ic,x,y,1);});
    const lk=eio(P(T,l(18)+.6,.5));add(`<rect x="300" y="${760-200*(1-lk)}" width="560" height="280" rx="24" fill="#0b0b0b" fill-opacity="${.85*lk}" stroke="#fff" stroke-width="4" opacity="${lk}" filter="url(#glowS)"/>`);
    if(lk>.9){icon('key',580,900,1.2);label(580,980,'OUT OF REACH',{size:20,op:.85,weight:800});}});cue('thud',l(18)+1.1,.5);}
},{zoom:.03});

/* H — 3. stop relying on motivation (L19-L20) */
scene(l(19)-.25,l(21)-.25,()=>{
  bokeh(BV,T);stepTag(3,l(19)-.2,['STOP RELYING','ON MOTIVATION']);
  // battery drains...
  const p=1-eio(P(T,l(19)+.6,2.2));fadeIn(l(19),()=>{box(260,470,420,150,{r:20,op:.85});add(`<rect x="680" y="515" width="20" height="60" rx="6" fill="#fff" fill-opacity=".8"/>`);if(p>0)add(`<rect x="274" y="484" width="${392*p}" height="122" rx="12" fill="#fff" fill-opacity=".85"/>`);label(470,670,'MOTIVATION · '+Math.round(p*100)+'%',{size:20,op:.75,weight:800});});
  // ...but the routine keeps going
  fadeIn(l(20)-.1,()=>{label(540,800,'ROUTINE',{size:22,op:.85,weight:800});for(let d=0;d<14;d++){const x=150+(d%7)*130,y=880+Math.floor(d/7)*130,t0=l(20)+.2+d*.2;box(x-50,y-50,100,100,{r:14,op:.6,glow:false});label(x,y-22,['M','T','W','T','F','S','S'][d%7],{size:14,op:.5});if(T>t0)check(x,y+14,1);}});
  for(let d=0;d<14;d++)cue('tick',l(20)+.2+d*.2,.25);
  pill(l(20)+2.2,540,1200,"EVEN WHEN YOU DON'T FEEL LIKE IT",{size:20,dark:true});
  const G=1500;ground(G,1);const bob=Math.abs(Math.sin(T*8))*4;person(lerp(200,880,clamp((T-l(20))/3.4)),G,.85,{spot:.7,bob,arm:[30,40]});
},{zoom:.03});

/* I — remember: one habit at a time (L21-L23) */
scene(l(21)-.25,l(24)-.25,()=>{
  bokeh(BV,T);
  pop(l(21)-.1,540,430,()=>title(540,450,'REMEMBER…',{size:110}),{snd:'hit',vol:.6,outAt:l(22)-.15});
  pop(l(22),540,430,()=>{icon('moon',300,440,1.1);pillShape(620,440,'OVERNIGHT',{size:30,dark:true});strike(470,780,440,P(T,l(22)+1.0,.35));},{snd:'pop',outAt:l(23)-.15});cue('nope',l(22)+1.0,.4);
  // staircase of habit bricks
  const sx=180,sy=1560,n=7,w=110,h=90;
  for(let k=0;k<n;k++){const q=P(T,l(23)-.1+k*.18,.2);if(q>0)add(`<rect x="${sx+k*w}" y="${sy-(k+1)*h-(1-eo(q))*50}" width="${w-8}" height="${(k+1)*h}" rx="8" fill="#fff" fill-opacity="${.08+.05*k}" stroke="#fff" stroke-width="3" opacity="${q}" filter="url(#glowS)"/>`);cue('brick',l(23)-.1+k*.18,.4);}
  pill(l(23)+.2,540,420,'ONE HABIT AT A TIME',{size:30});
  const c=clamp((T-l(23)-.4)/1.6)*n,i=Math.floor(c),f=c-i;const sp=k=>k<0?[sx-60,sy]:[sx+k*w+w/2-4,sy-(k+1)*h];const[ax,ay]=sp(i-1),[bx,by]=sp(Math.min(n-1,i));
  const[px,py]=c<=0?[sx-60,sy]:(i>=n?sp(n-1):hopTo(ax,ay,bx,by,f,40));person(px,py,.8,{spot:.7,ring:false,arm:i>=n?[44,-80]:null,arm2:i>=n?[-44,-80]:null});
  for(let k=0;k<n;k++)cue('hop',l(23)+.4+k*1.6/n,.35);
  ground(sy,1,{x2:sx});
},{zoom:.03});

/* J — your future self + title (L24, L25) */
scene(l(24)-.25,END,()=>{
  bokeh([[540,1000,360,.06],[170,1600,140,.035],[900,320,120,.035]],T);
  const a=l(24),c=l(25);
  fadeIn(a-.2,()=>{label(540,330,'YOUR FUTURE SELF IS BEING BUILT',{size:24,op:.8});label(540,370,'BY WHAT YOU DO TODAY',{size:24,op:.8});},{outAt:c-.3});
  FIN.forEach(t=>{const t0=a+.2+t.d*2.2,q=P(T,t0,.6);const x=lerp(60+t.sx*960,t.x,eio(q)),y=lerp(500+t.sy*1200,t.y,eio(q));tileAt(x,y,32,q>=1,q>0?1:.3*P(T,a-.2,.4));});
  for(let k=0;k<14;k++)cue('brick',a+.4+k*.16,.3);
  const done=P(T,a+2.8,.6);if(done>0)add(`<ellipse cx="540" cy="1150" rx="300" ry="380" fill="url(#bk)" fill-opacity="${.14*done}"/>`);
  ground(1470,eo(P(T,a,.6)),{op:.4});
  const pul=1+.015*Math.sin((T-c)*3);
  pop(c,540,400,()=>g(`transform="translate(540,400) scale(${pul}) translate(-540,-400)"`,()=>{title(540,380,'THE NEXT',{size:124});title(540,520,'VERSION.',{size:124});}),{snd:'impact',d:.5});
  fadeIn(le(25)+.5,()=>label(540,1580,'FOLLOW FOR MORE',{size:18,op:.45}));
},{zoom:.03});
