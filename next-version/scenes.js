/* ============ SCENES — "THE NEXT VERSION" ============ */
const S=[];
function scene(s,e,draw,cam={}){S.push({s,e,draw,cam});}
const l=i=>L[i].s, le=i=>L[i].e;
const B1=[[170,420,150,.05],[930,1480,190,.045],[860,300,90,.04],[120,1650,120,.035]];

/* extra primitives */
function check(x,y,s=1,op=1){add(`<g filter="url(#glowS)" opacity="${op}"><circle cx="${x}" cy="${y}" r="${18*s}" fill="#f4f4f4"/><path d="M${x-8*s},${y} l${6*s},${6*s} l${10*s},${-12*s}" stroke="#0a0a0a" stroke-width="${4*s}" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`);}
function spinner(x,y,r=16,op=.8){const a=T*6;add(`<path d="M${x+r*Math.cos(a)},${y+r*Math.sin(a)} A${r},${r} 0 1 1 ${x+r*Math.cos(a+4.4)},${y+r*Math.sin(a+4.4)}" stroke="#fff" stroke-opacity="${op}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`);}
function personOutline(x,gy,s=1,op=1){const bw=32*s,bh=78*s,r=30*s;
  add(`<g opacity="${op}" filter="url(#glow)" fill="none" stroke="#fff" stroke-width="3.5" stroke-dasharray="9 7"><path d="M${x-bw},${gy} L${x-bw},${gy-bh+r} Q${x-bw},${gy-bh} ${x-bw+r},${gy-bh} L${x+bw-r},${gy-bh} Q${x+bw},${gy-bh} ${x+bw},${gy-bh+r} L${x+bw},${gy}"/><circle cx="${x}" cy="${gy-bh-34*s}" r="${25*s}"/></g>`);}
function calCard(x,y,w,h,head,big,{hi=true,sub=null}={}){box(x,y,w,h,{r:22,op:hi?.95:.45,glow:hi});
  add(`<path d="M${x},${y+22} Q${x},${y} ${x+22},${y} L${x+w-22},${y} Q${x+w},${y} ${x+w},${y+22} L${x+w},${y+64} L${x},${y+64} Z" fill="#fff" fill-opacity="${hi?.92:.3}"/>`);
  label(x+w/2,y+42,head,{size:20,op:1,fill:hi?'#0b0b0b':'#fff',weight:800,sp:.2});
  add(`<text x="${x+w/2}" y="${y+h/2+70}" font-size="${big.length>3?84:120}" font-weight="800" fill="#fff" fill-opacity="${hi?1:.4}" text-anchor="middle" ${hi?'filter="url(#glowS)"':''}>${big}</text>`);
  if(sub)label(x+w/2,y+h-30,sub,{size:16,op:hi?.7:.4});}
function zzz(x,y,op=.7){[0,1,2].forEach(i=>{const ph=((T*.8+i/3)%1);add(`<text x="${x+i*16+ph*10}" y="${y-i*26-ph*20}" font-size="${22+i*6}" font-weight="800" fill="#fff" fill-opacity="${op*Math.sin(ph*Math.PI)}">Z</text>`);});}

/* A — One day... you'll wish you started today (L0, L1) */
scene(0,l(2)-.25,()=>{
  const G=1250,xN=200,xF=880;
  bokeh(B1,T);
  fadeIn(l(0)-.25,()=>title(540,700,'ONE DAY...',{size:120}),{outAt:l(1)-.25});cue('hit',l(0)-.25,.7);
  // timeline ground with two nodes
  ground(G,eo(P(T,.1,.9)));
  fadeIn(.4,()=>{orb(xN,G,7,.7);label(xN,G+55,'TODAY',{size:18,op:.6});});
  fadeIn(.8,()=>{add(`<circle cx="${xF}" cy="${G}" r="9" fill="none" stroke="#fff" stroke-width="3"/>`);label(xF,G+55,'ONE DAY',{size:18,op:.6});});
  const tr=eio(P(T,.5,1.4));if(tr>0&&tr<1)orb(lerp(xN,xF,tr),G,5,1-tr*.3);
  // future you looks back
  pop(l(0)+.6,xF,G,()=>person(xF,G,.85,{spot:true,arm:[-62,-12]}),{snd:'pop',vol:.5});
  fadeIn(l(1)-.15,()=>label(540,560,"YOU'LL WISH YOU STARTED",{size:26,op:.75}));
  pop(l(1)+.75,540,700,()=>title(540,730,'TODAY.',{size:140}),{snd:'hit'});
  const hp=eo(P(T,l(1)+.8,.5));
  if(hp>0){const pul=1+.1*Math.sin(T*5);add(`<circle cx="${xN}" cy="${G}" r="${38*hp*pul}" fill="none" stroke="#fff" stroke-opacity="${.75*hp}" stroke-width="2.5" stroke-dasharray="6 6" filter="url(#glowS)"/>`);orb(xN,G,10,hp);}
  pill(l(1)+.95,xN+40,G-90,'START HERE',{size:18});
  drawPath(`M${xF-70},${G-150} C ${600},${G-260} ${400},${G-250} ${xN+20},${G-130}`,eo(P(T,l(1)+.4,.8)),{sw:3,dash:'10 10',glow:'glowS',op:.6});
},{zoom:.05});

/* B — regrets: gym, skill, scrolling (L2-L4) */
function dumbbell(x,y){add(`<g filter="url(#glowS)" stroke="#fff" stroke-width="4" fill="#0b0b0b" stroke-linejoin="round"><line x1="${x-34}" y1="${y}" x2="${x+34}" y2="${y}"/><rect x="${x-44}" y="${y-24}" width="14" height="48" rx="4"/><rect x="${x+30}" y="${y-24}" width="14" height="48" rx="4"/><rect x="${x-56}" y="${y-14}" width="12" height="28" rx="4"/><rect x="${x+44}" y="${y-14}" width="12" height="28" rx="4"/></g>`);}
function book(x,y){add(`<g filter="url(#glowS)" stroke="#fff" stroke-width="4" fill="#0b0b0b" stroke-linejoin="round"><path d="M${x},${y-22} C ${x-14},${y-32} ${x-36},${y-32} ${x-48},${y-26} L${x-48},${y+28} C ${x-36},${y+22} ${x-14},${y+22} ${x},${y+32} Z"/><path d="M${x},${y-22} C ${x+14},${y-32} ${x+36},${y-32} ${x+48},${y-26} L${x+48},${y+28} C ${x+36},${y+22} ${x+14},${y+22} ${x},${y+32} Z"/></g>`);}
function phone(x,y,scroll=0){const id='c'+(uid++);add(`<clipPath id="${id}"><rect x="${x-24}" y="${y-38}" width="48" height="72"/></clipPath>`);
  add(`<rect x="${x-30}" y="${y-48}" width="60" height="96" rx="10" fill="#0b0b0b" stroke="#fff" stroke-width="4" filter="url(#glowS)"/>`);
  let s='';for(let i=-1;i<7;i++){const yy=y-38+((i*16-scroll*80)%112+112)%112-8;s+=`<rect x="${x-18}" y="${yy}" width="${i%2?36:26}" height="6" rx="3" fill="#fff" fill-opacity=".6"/>`;}
  add(`<g clip-path="url(#${id})">${s}</g>`);}
scene(l(2)-.25,l(5)-.25,()=>{
  bokeh([[900,560,200,.045],[150,1500,160,.035]],T);
  fadeIn(l(2)-.25,()=>label(540,400,"YOU'LL WISH YOU...",{size:26,op:.75}));
  const rows=[['THE GYM','STARTED: NO',dumbbell],['THAT SKILL','STARTED: NO',book],['SCROLLING','',null]];
  rows.forEach(([t1,t2,ic],k)=>{const y=470+k*260,t0=l(2+k)+.25;
    pop(t0,540,y+110,()=>{box(160,y,760,220,{r:24,op:.85});
      add(`<circle cx="270" cy="${y+110}" r="70" fill="#0b0b0b" stroke="#fff" stroke-opacity=".7" stroke-width="2.5"/>`);
      if(ic)ic(270,y+110);else phone(270,y+110,T*1.4);
      label(375,y+102,t1,{size:38,op:1,weight:800,sp:.08,anchor:'start'});
      if(k<2){label(375,y+146,t2,{size:18,op:.5,anchor:'start'});add(`<rect x="830" y="${y+86}" width="48" height="48" rx="10" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-dasharray="6 5"/>`);}
      else{const m=Math.floor(eio(P(T,t0+.2,1.6))*277);label(375,y+146,'SCREEN TIME: '+Math.floor(m/60)+'H '+String(m%60).padStart(2,'0')+'M',{size:18,op:.75,anchor:'start'});cross(854,y+110,1,.85,P(T,t0+1.4,.25));}
    },{snd:'pop'});});
  cue('nope',l(4)+1.65,.6);
  const G=1520;ground(G,1);person(540,G,.85,{spot:true});
  fadeIn(l(2),()=>label(540,G+55,'YOU, ONE YEAR LATER',{size:18,op:.55}));
},{zoom:.035});

/* C — but here's the problem: you're waiting (L5, L6) */
function hourglass(x,y,p){const w=95,h=170;
  add(`<g filter="url(#glowS)" stroke="#fff" stroke-width="4" fill="none" stroke-linejoin="round"><line x1="${x-w-20}" y1="${y-h}" x2="${x+w+20}" y2="${y-h}"/><line x1="${x-w-20}" y1="${y+h}" x2="${x+w+20}" y2="${y+h}"/>
   <path d="M${x-w},${y-h} C ${x-w},${y-50} ${x-10},${y-20} ${x-8},${y} C ${x-10},${y+20} ${x-w},${y+50} ${x-w},${y+h} L${x+w},${y+h} C ${x+w},${y+50} ${x+10},${y+20} ${x+8},${y} C ${x+10},${y-20} ${x+w},${y-50} ${x+w},${y-h} Z"/></g>`);
  const top=1-p,tt=y-20-(h-40)*top*.85;
  add(`<path d="M${x-(w-14)*top},${tt} L${x+(w-14)*top},${tt} L${x},${y-6} Z" fill="#fff" fill-opacity=".85"/>`);
  add(`<path d="M${x-(w-8)},${y+h-4} L${x+(w-8)},${y+h-4} L${x},${y+h-4-110*p} Z" fill="#fff" fill-opacity=".85"/>`);
  add(`<line x1="${x}" y1="${y}" x2="${x}" y2="${y+h-4-110*p}" stroke="#fff" stroke-width="3" stroke-dasharray="4 6" stroke-dashoffset="${-T*60}"/>`);}
scene(l(5)-.25,l(7)-.25,()=>{
  bokeh([[540,1000,300,.05],[900,380,120,.035]],T);
  fadeIn(l(5)-.2,()=>{label(540,640,"BUT HERE'S",{size:30,op:.75});title(540,770,'THE PROBLEM.',{size:100});},{outAt:l(6)-.2});
  pop(l(6),540,560,()=>title(540,590,"YOU'RE WAITING.",{size:96}),{snd:'hit'});
  pop(l(6)+.1,560,1080,()=>hourglass(560,1080,(T-l(6))*.18+.15),{snd:null});
  cue('tick',l(6)+.3,.6);cue('tick',l(6)+.9,.6);
  const G=1380;ground(G,1);
  fadeIn(l(6)+.2,()=>{person(250,G,.8,{spot:.7});zzz(290,G-200);});
},{zoom:.04});

/* D — waiting until... (L7-L10) */
const WAIT=[['MONDAY',null],['NEW YEAR',null],['I FEEL','MOTIVATED'],['LIFE GETS','EASIER']];
function waitCards(cross_p=0,dim=1){WAIT.forEach(([a,b],k)=>{const x=k%2?560:140,y=k<2?520:850,t0=l(7+k)+.15;
  pop(t0,x+190,y+140,()=>{g(`opacity="${dim}"`,()=>{box(x,y,380,280,{r:22,op:.85});label(x+190,y+48,'WAITING UNTIL',{size:15,op:.5});
    if(b){label(x+190,y+138,a,{size:36,op:1,weight:800,sp:.06});label(x+190,y+186,b,{size:36,op:1,weight:800,sp:.06});}
    else label(x+190,y+162,a,{size:44,op:1,weight:800,sp:.06});
    spinner(x+150,y+240,11,.6);label(x+170,y+246,'PENDING',{size:14,op:.5,anchor:'start'});});
    if(cross_p>0)cross(x+190,y+140,2.2,.9,clamp(cross_p*1.6-k*.18));},{snd:'pop'});});}
scene(l(7)-.25,l(11)-.25,()=>{
  bokeh([[850,520,200,.045],[160,1500,160,.035]],T);
  fadeIn(l(7)-.25,()=>label(540,430,'WAITING UNTIL...',{size:28,op:.75}));
  waitCards();
  const G=1400;ground(G,1);person(540,G,.8,{spot:true,arm:[-40,-50]});
  pop(l(10)+.8,600,G-190,()=>qmark(600,G-180,48,.8),{vol:.5});
},{zoom:.03});

/* E — what if that moment never comes (L11) */
scene(l(11)-.25,l(12)-.25,()=>{
  bokeh([[540,820,280,.045],[150,1500,150,.035]],T);
  fadeIn(l(11)-.2,()=>label(540,470,'BUT WHAT IF',{size:28,op:.75}));
  pop(l(11)+.6,540,600,()=>title(540,620,'IT NEVER COMES?',{size:84}),{snd:'hit',vol:.8});
  const x=150,y=860,w=780,h=36;
  fadeIn(l(11),()=>{label(x,y-26,'LOADING: PERFECT MOMENT',{size:17,op:.65,anchor:'start'});
    const p=.99*eo(P(T,l(11),.9));const flick=p>.98?(Math.sin(T*23)>0?'99%':'99%'):Math.round(p*100)+'%';
    label(x+w,y-26,flick,{size:17,op:.9,anchor:'end'});
    add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="2.5" filter="url(#glowS)"/>`);
    add(`<rect x="${x+5}" y="${y+5}" width="${(w-10)*p}" height="${h-10}" rx="${(h-10)/2}" fill="#fff" fill-opacity=".85"/>`);
    spinner(x+w/2,y+100,18,.8);});
  cue('rise',l(11),.6);
  pill(l(11)+1.5,540,1080,'NEVER COMES',{size:22,dark:true});
  const G=1400;ground(G,1);person(540,G,.8,{spot:.8});
},{zoom:.04});

/* F — between you and who you want to become: the decision (L12, L13) */
scene(l(12)-.25,l(14)-.25,()=>{
  bokeh([[830,900,260,.05],[150,500,140,.035]],T);
  const G=1350;
  fadeIn(l(12)-.2,()=>label(540,430,'WHAT STANDS BETWEEN',{size:26,op:.75}));
  ground(G,eo(P(T,l(12)-.25,.8)));
  person(200,G,.85,{spot:true});fadeIn(l(12)+.3,()=>label(200,G+55,'YOU',{size:20,op:.65}));
  const fp=eo(P(T,l(12)+2.0,.8));cue('sweep',l(12)+2.0,.8);
  if(fp>0){add(`<ellipse cx="850" cy="${G-110}" rx="${200*fp}" ry="${280*fp}" fill="url(#bk)" fill-opacity="${.12*fp}"/>`);personOutline(850,G,1.6,fp);
    label(850,G+55,'WHO YOU WANT',{size:18,op:.7*fp});label(850,G+85,'TO BECOME',{size:18,op:.7*fp});}
  drawPath(`M270,${G-60} L760,${G-60}`,eo(P(T,l(12)+.8,1.2)),{sw:3,dash:'10 10',glow:null,op:.5});
  // the wall: the decision
  const wp=eio(P(T,l(13),.6));cue('thud',l(13)+.1,.8);
  if(wp>0){const hgt=520*wp;add(`<rect x="470" y="${G-hgt}" width="110" height="${hgt}" rx="10" fill="#0b0b0b" stroke="#fff" stroke-width="4" filter="url(#glow)"/>`);
    for(let i=1;i<8;i++){const yy=G-i*65;if(yy>G-hgt+10)add(`<line x1="472" y1="${yy}" x2="578" y2="${yy}" stroke="#fff" stroke-opacity=".3" stroke-width="2"/>`);}}
  pill(l(13)+.5,525,G-600,'THE DECISION',{size:22});
  fadeIn(l(13)+1.1,()=>label(525,G-660,"YOU'RE AVOIDING TODAY",{size:18,op:.7}));
},{zoom:.035});

/* G — think about it (L14) */
scene(l(14)-.25,l(15)-.25,()=>{
  bokeh([[540,760,260,.05],[150,1500,150,.035]],T);
  pop(l(14)-.1,540,700,()=>{title(540,720,'THINK',{size:140});title(540,870,'ABOUT IT.',{size:110});},{snd:'hit',vol:.7});
  const G=1400;ground(G,1);person(470,G,.85,{spot:true});
  pop(l(14)+.3,620,G-260,()=>{add(`<g filter="url(#glowS)" fill="#0b0b0b" stroke="#fff" stroke-width="3"><circle cx="535" cy="${G-175}" r="7"/><circle cx="560" cy="${G-205}" r="11"/><rect x="560" y="${G-320}" width="250" height="90" rx="45"/></g>`);label(685,G-266,'1 YEAR FROM NOW?',{size:16,op:.85});},{vol:.5});
},{zoom:.04});

/* H — a year from now: the same loop (L15-L17) */
scene(l(15)-.25,l(18)-.25,()=>{
  bokeh([[540,900,300,.04],[900,1550,140,.03]],T);
  fadeIn(l(15)-.25,()=>label(540,400,'A YEAR FROM NOW',{size:26,op:.75}));
  const d=Math.round(1+364*eio(P(T,l(15),1.8)));
  fadeIn(l(15)-.2,()=>title(540,490,'DAY '+String(d).padStart(3,'0'),{size:66,sp:.04}));
  for(let k=0;k<12;k++)cue('tick',l(15)+k*.15,.35);
  const cx=540,cy=880,R=240;
  drawPath(`M${cx},${cy-R} A${R},${R} 0 1 1 ${cx-.1},${cy-R}`,eo(P(T,l(15),.9)),{sw:4,glow:'glowS'});
  ['MON','TUE','WED','THU','FRI','SAT','SUN'].forEach((dn,i)=>{const a=-Math.PI/2+i*2*Math.PI/7;fadeIn(l(15)+.3+i*.06,()=>label(cx+(R+50)*Math.cos(a),cy+(R+50)*Math.sin(a)+7,dn,{size:17,op:.5}));});
  const a=-Math.PI/2+(T-l(15))*4.2;if(T>l(15)+.6)orb(cx+R*Math.cos(a),cy+R*Math.sin(a),8);
  const words=[[l(15)+1.9,'SAME','POSITION'],[l(16),'SAME','EXCUSES'],[l(17),'SAME','ROUTINE']];
  words.forEach(([t0,w1,w2],k)=>{const nx=k<2?words[k+1][0]-.12:null;pop(t0,cx,cy,()=>{label(cx,cy-12,w1,{size:24,op:.6});label(cx,cy+34,w2,{size:42,op:1,weight:800,sp:.1,glow:true});},{outAt:nx,snd:'pop'});});
  const G=1400;ground(G,1,{op:.45});person(540,G,.8,{spot:.6});
},{zoom:.03});

/* I — Or... (L18) */
scene(l(18)-.25,l(19)-.25,()=>{
  bokeh([[540,900,320,.06]],T);
  pop(l(18)-.15,540,900,()=>title(540,940,'OR...',{size:190}),{snd:'impact',vol:.5,d:.4});
  const rp=P(T,l(18)-.1,.9);if(rp>0&&rp<1)add(`<circle cx="540" cy="880" r="${120+520*eo(rp)}" fill="none" stroke="#fff" stroke-opacity="${.6*(1-rp)}" stroke-width="3" filter="url(#glowS)"/>`);
},{zoom:.06});

/* J — looking back, grateful you started (L19) */
scene(l(19)-.25,l(20)-.25,()=>{
  bokeh([[860,640,240,.06],[160,1500,150,.035]],T);
  const x0=180,y0=1330,x1=860,y1=760;
  fadeIn(l(19)-.2,()=>label(540,420,'ONE YEAR LATER',{size:26,op:.75}));
  ground(y0,1,{x2:x0+40});
  const d=`M${x0},${y0} C ${420},${y0-30} ${600},${y0-200} ${x1},${y1}`;
  drawPath(d,eio(P(T,l(19)-.1,1.1)),{sw:5});cue('stairs',l(19)-.1,.7);
  orb(x0,y0,8);label(x0,y0+55,'TODAY',{size:18,op:.7});
  pop(l(19)+.6,x1,y1,()=>person(x1,y1,.85,{spot:true,arm:[-62,-10]}),{snd:'pop'});
  const hp=eo(P(T,l(19)+1.5,.5));if(hp>0){add(`<circle cx="${x0}" cy="${y0}" r="${40*hp*(1+.1*Math.sin(T*5))}" fill="none" stroke="#fff" stroke-opacity="${.75*hp}" stroke-width="2.5" stroke-dasharray="6 6"/>`);}
  pill(l(19)+1.55,x0+60,y0-90,'DAY 1',{size:18});
  pill(l(19)+2.4,540,560,'GRATEFUL YOU STARTED',{size:22});cue('win',l(19)+2.4,.7);
},{zoom:.04});

/* K — you don't need a plan / to feel ready / just the first step (L20-L22) */
scene(l(20)-.25,l(23)-.25,()=>{
  bokeh([[880,620,200,.045],[160,1520,160,.035]],T);
  fadeIn(l(20)-.25,()=>label(540,430,'WHAT YOU ACTUALLY NEED',{size:24,op:.75}));
  fadeIn(l(20)-.2,()=>box(150,480,780,520,{r:26,op:.55}));
  const rows=[['A PERFECT PLAN',false],['TO FEEL READY',false],['THE FIRST STEP',true]];
  rows.forEach(([txt,ok],k)=>{const y=580+k*160,t0=l(20+k)+.1;
    fadeIn(t0,()=>{
      if(ok){const c=P(T,t0+.9,.3);if(c>0)check(250,y,1.4*back(c));else add(`<circle cx="250" cy="${y}" r="25" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3"/>`);
        label(305,y+13,txt,{size:36,op:1,weight:800,sp:.06,anchor:'start',glow:c>0});
        if(c>0)pillShape(780,y+80,"THAT'S IT",{size:16,pad:18});}
      else{const sp=P(T,t0+.8,.35);add(`<circle cx="250" cy="${y}" r="25" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>`);
        label(305,y+13,txt,{size:36,op:lerp(1,.35,sp),weight:800,sp:.06,anchor:'start'});
        if(sp>0){add(`<line x1="300" y1="${y}" x2="${300+530*eo(sp)}" y2="${y}" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`);cross(250,y,.7,.8,sp);
          label(860,y+50,'NOT NEEDED',{size:14,op:.5*sp,anchor:'end'});}}
      if(k<2)add(`<line x1="200" y1="${y+80}" x2="880" y2="${y+80}" stroke="#fff" stroke-opacity=".15" stroke-width="2"/>`);
    });cue(ok?'win':'nope',t0+(ok?.9:.8),ok?.5:.35);});
  // the first step
  const G=1420,sx=560,sh=80;ground(G,1);
  drawPath(`M${sx},${G} L${sx},${G-sh} L${sx+220},${G-sh} L${sx+220},${G}`,eo(P(T,l(22),.6)),{sw:4});
  const hop=P(T,l(22)+1.0,.45);cue('hop',l(22)+1.0,.8);
  const px=lerp(400,sx+90,eio(hop)),py=lerp(G,G-sh,eio(hop))-Math.sin(Math.PI*hop)*60;
  person(px,py,.8,{spot:.8,ring:hop>=1||hop<=0});
  if(hop>=1){const rp=P(T,l(22)+1.45,.6);add(`<ellipse cx="${sx+90}" cy="${G-sh}" rx="${60+160*eo(rp)}" ry="${10+20*eo(rp)}" fill="none" stroke="#fff" stroke-opacity="${.6*(1-rp)}" stroke-width="2.5"/>`);}
},{zoom:.03});

/* L — best time was yesterday; second best is today (L23, L24) */
scene(l(23)-.25,l(25)-.3,()=>{
  bokeh([[760,820,260,.05],[160,1520,150,.035]],T);
  fadeIn(l(23)-.25,()=>label(540,440,'THE BEST TIME TO START',{size:26,op:.75}));
  pop(l(23)+.4,320,840,()=>{calCard(130,640,380,400,'YESTERDAY',P(T,l(23)+1.6,.01)>0?'GONE':'DAY 0',{hi:false,sub:'BEST TIME'});});
  cue('nope',l(23)+1.6,.5);
  pop(l(24)+.3,760,840,()=>calCard(570,640,380,400,'TODAY','NOW',{hi:true,sub:'SECOND BEST TIME'}),{snd:'hit',vol:.7});
  const rp=P(T,l(24)+1.2,.9);if(rp>0&&rp<1)add(`<rect x="${570-40*eo(rp)}" y="${640-40*eo(rp)}" width="${380+80*eo(rp)}" height="${400+80*eo(rp)}" rx="30" fill="none" stroke="#fff" stroke-opacity="${.6*(1-rp)}" stroke-width="3"/>`);
  pill(l(24)+1.25,760,1110,'START NOW',{size:22});
  const G=1440;ground(G,1);person(760,G,.8,{spot:true,arm:[40,-55]});
},{zoom:.035});

/* M — THE NEXT VERSION (L25) */
scene(l(25)-.3,END,()=>{
  bokeh([[540,860,340,.06],[170,1560,140,.035],[900,320,120,.035]],T);
  const G=1360,b=l(25);
  ground(G,eo(P(T,b-.3,.6)));
  const m=eio(P(T,b+.2,1.4));
  const glowS=1.6-0.6*m;
  personOutline(540,G,glowS,lerp(.9,.0,P(T,b+1.4,.4)));
  add(`<ellipse cx="540" cy="${G-120}" rx="${200}" ry="${260}" fill="url(#bk)" fill-opacity="${.06+.12*m}"/>`);
  person(540,G,1,{spot:lerp(.6,1,m)});
  if(m>=1){const rp=P(T,b+1.6,.8);if(rp<1)add(`<circle cx="540" cy="${G-80}" r="${80+300*eo(rp)}" fill="none" stroke="#fff" stroke-opacity="${.6*(1-rp)}" stroke-width="3" filter="url(#glowS)"/>`);}
  cue('win',b+1.6,.6);
  const pul=1+.015*Math.sin((T-b)*3);
  pop(b,540,760,()=>g(`transform="translate(540,760) scale(${pul}) translate(-540,-760)"`,()=>{title(540,720,'THE NEXT',{size:136});title(540,880,'VERSION.',{size:136});}),{snd:'impact',d:.5});
  fadeIn(b+.4,()=>label(540,560,'BECOME',{size:28,op:.7}));
  fadeIn(le(25)+.4,()=>label(540,G+80,'STARTS TODAY',{size:22,op:.7}));
  fadeIn(le(25)+.9,()=>label(540,G+150,'FOLLOW FOR MORE',{size:18,op:.45}));
},{zoom:.04});
