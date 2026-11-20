/* ============ BEATS — "HOW TO BECOME SUCCESSFUL" ============ */
const BEATS=[];
function B(s,e,fn,cam={}){BEATS.push({s,e,fn,cam});}

/* ================= INTRODUCTION ================= */
// title hook + five years from today
B(0,1,()=>{
  bokeh(BK,T);
  // textual hook from frame one
  const tOut=at(1,-.2);
  fadeIn(-1,()=>{title(960,170,'HOW TO BECOME SUCCESSFUL',{size:78});label(960,235,"(EVEN IF YOU'RE STARTING WITH NOTHING)",{size:26,op:.8});},{outAt:tOut,d:.01});
  fadeIn(tOut+.1,()=>label(960,170,'IMAGINE THE LIFE YOU’VE ALWAYS WANTED',{size:26,op:.75}));
  const gy=G;ground(gy,1);
  person(FX,gy,1,{spot:true});label(FX,gy+56,'YOU · TODAY',{size:18,op:.6});
  drawPath(`M${FX+90},${gy-60} L1380,${gy-60}`,eo(P(T,at(0,.4),1.2)),{sw:3,dash:'12 10',glow:null,op:.6});
  pop(at(0,1.1),1560,gy-80,()=>{personOutline(1560,gy,1.25,1);},{snd:'pop'});
  fadeIn(at(0,1.3),()=>label(1560,gy+56,'YOU · 5 YEARS FROM NOW',{size:18,op:.7}));
  pill(at(0,.9),860,gy-170,'5 YEARS',{size:22,dark:true});
  // sunrise behind the future self
  const sr=eio(P(T,at(1,.3),2.2));if(sr>0){add(`<circle cx="1560" cy="${gy+40-260*sr}" r="${150}" fill="url(#bk)" fill-opacity="${.16*sr}"/><path d="M1380,${g} A180,180 0 0 1 1740,${g}" fill="none" stroke="#fff" stroke-opacity="${.5*sr}" stroke-width="3" transform="translate(0,${(1-sr)*120})"/>`);}
},{zoom:.04});
// stronger, independent, confident, proud; looking back
B(2,6,()=>{
  bokeh(BK,T);
  head(at(2,-.3),'FIVE YEARS FROM NOW');
  ground(G,1);
  const fx=1080;person(fx,G,1.35,{spot:true,arm:T>at(6)?[-70,-6]:null});
  add(`<circle cx="${fx}" cy="${G-150}" r="250" fill="url(#bk)" fill-opacity=".08"/>`);
  const at_=[[2,'dumbbell','STRONGER',760,360],[3,'dollar','FINANCIALLY FREE',1400,360],[4,'smile','CONFIDENT',700,620],[5,'trophy','PROUD',1460,620]];
  at_.forEach(([i,ic,tx,x,y])=>pop(at(i,.2),x,y,()=>{icon(ic,x,y-30,1);pillShape(x,y+50,tx,{size:17,dark:true});add(`<line x1="${x+(x<fx?90:-90)}" y1="${y}" x2="${fx+(x<fx?-80:80)}" y2="${G-170}" stroke="#fff" stroke-opacity=".15" stroke-width="2" stroke-dasharray="5 6"/>`);},{snd:'pop'}));
  const lb=P(T,at(6),.6);
  if(lb>0){g(`opacity="${lb}"`,()=>{person(260,G,.7,{op:.5});label(260,G+52,'WHO YOU USED TO BE',{size:15,op:.5});});
    drawPath(`M330,${G-40} C 560,${G-160} 780,${G-170} 980,${G-90}`,eo(P(T,at(6,.3),1)),{sw:3,dash:'10 9',glow:null,op:.6});
    fadeIn(at(6,1.4),()=>label(640,G-190,'HOW FAR YOU’VE COME',{size:18,op:.8}));}
},{zoom:.035});
// the question: what separates you?
B(7,15,()=>{
  bokeh(BK,T);
  head(at(7,-.2),"NOW HERE'S THE QUESTION",{outAt:at(8,-.2)});
  big(at(8,.2),'WHAT SEPARATES YOU?',{y:200,size:80,outAt:at(14,-.2)});
  ground(G,1);person(260,G,.9,{spot:.7});label(260,G+54,'TODAY',{size:16,op:.55});person(1680,G,1.15,{spot:true});label(1680,G+56,'5 YEARS',{size:16,op:.55});
  pop(at(8,1.2),960,G-110,()=>qmark(960,G-80,90,.5),{vol:.4,outAt:at(9,-.1)});
  const items=[{t:at(9,.05),icon:'brain',text:'INTELLIGENCE'},{t:at(10,.05),icon:'clover',text:'LUCK'},{t:at(11,.05),icon:'dollar',text:'MONEY'},{t:at(12,.1),icon:'network',text:'CONNECTIONS'}];
  const out=at(14,.5);
  if(T<out+.4)g(`opacity="${1-P(T,out,.4)}"`,()=>cardRow(items,{cx:960,y:480,w:230,h:250,dimAt:at(13,.2)}));
  fadeIn(at(13,.2),()=>label(960,660,'MAYBE THEY HELP…',{size:20,op:.6}),{outAt:out});
  big(at(14,.1),'BUT...',{y:255,size:84,outAt:at(15,-.15),vol:.4});
  pop(at(15,.05),960,470,()=>{box(640,350,640,250,{r:26,op:1});icon('calendar',960,430,1.3);label(960,545,'YOUR DAILY DECISIONS',{size:34,op:1,weight:800,sp:.1,glow:true});},{snd:'hit',vol:.8});
  ring(960,470,at(15,.15),{r0:200,r1:520});
},{zoom:.03});
// one extraordinary moment vs thousands of ordinary moments
B(16,17,()=>{
  bokeh(BK,T);
  head(at(16,-.3),'SUCCESS ISN’T CREATED IN…');
  pop(at(16,.4),520,450,()=>{icon('star',520,430,2.2);label(520,560,'ONE EXTRAORDINARY',{size:22,op:.9,weight:800});label(520,592,'MOMENT',{size:22,op:.9,weight:800});cross(520,450,2.6,.95,P(T,at(16,2.2),.3));},{snd:'hit',vol:.6});
  cue('nope',at(16,2.2),.4);
  // thousands of dots forming a rising path to a flag
  const n=420,u=P(T,at(17,.2),Math.max(2,L[17].e-L[17].s-.4));
  let d='';for(let i=0;i<n;i++){const v=i/n;if(v>u)break;const x=960+v*780+Math.sin(i*12.9)*14,y=820-v*v*520+Math.cos(i*7.3)*16;d+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.2" fill="#fff" fill-opacity="${.35+.5*v}"/>`;}
  add(d);if(u>0){fadeIn(at(17,.2),()=>{label(1350,880,'THOUSANDS OF ORDINARY MOMENTS',{size:18,op:.7});label(1350,910,`${Math.round(u*n*12).toLocaleString('en-GB')} SMALL CHOICES`,{size:15,op:.5});});}
  if(u>.95)pop(at(17,.2)+Math.max(2,L[17].e-L[17].s-.4)*.95,1740,300,()=>icon('flag',1750,290,1.4),{snd:'win',vol:.5});
  ground(G+40,1,{op:.3});
},{zoom:.03});
// in this video: roadmap; starting with nothing
B(18,19,()=>{
  bokeh(BK,T);
  head(at(18,-.3),'IN THIS VIDEO');
  const pts=[[240,820],[460,700],[680,760],[900,600],[1120,660],[1340,480],[1560,520],[1760,330]];
  drawPath('M'+pts.map(p=>p.join(',')).join(' L'),eio(P(T,at(18,.2),2.4)),{sw:4,glow:'glowS'});
  pts.slice(1).forEach((p,i)=>pop(at(18,.4+i*.32),p[0],p[1],()=>{add(`<circle cx="${p[0]}" cy="${p[1]}" r="26" fill="#0b0b0b" stroke="#fff" stroke-width="3" filter="url(#glowS)"/>`);label(p[0],p[1]+8,i<6?String(i+1):'7',{size:20,op:1,weight:800,sp:0});},{snd:'pop',vol:.35}));
  pop(at(18,2.8),1760,250,()=>icon('star',1760,240,1.2),{snd:null});
  person(240,820,.8,{spot:.7,ring:false});
  pill(at(19,.1),620,360,'STARTING WITH NOTHING',{size:22});
  pop(at(19,.7),330,700,()=>pillShape(330,700,'$0',{size:20,dark:true,pad:18}),{vol:.5});
},{zoom:.03});

/* ================= CHAPTER 1 ================= */
B(20,25,()=>{
  bokeh(BK,T);
  head(at(20,-.3),'THE BIGGEST MISTAKE');
  big(at(20,1.5),'WAITING.',{y:250,size:96});
  you(at(20,-.3),{arm:[14,-34]});
  pop(at(20,1.8),FX+110,G-150,()=>zzz(FX+80,G-170),{snd:null});
  const items=[[21,'MONDAY','calendar'],[22,'JANUARY','calendar'],[23,'MORE MONEY','dollar'],[24,'MOTIVATED','bulb'],[25,'LIFE IS EASIER','smile']];
  items.forEach(([i,tx,ic],k)=>{const x=700+k*240,y=560;pop(at(i,.1),x,y,()=>{card(x,y,215,250,{icon:ic,text:tx.length>11?tx.split(' ').slice(0,-1).join(' '):tx,text2:tx.length>11?tx.split(' ').slice(-1)[0]:null,iconS:.9});label(x,y-150,'WAITING UNTIL',{size:13,op:.45});spinner(x-40,y+100,9,.6);label(x-24,y+105,'PENDING',{size:12,op:.45,anchor:'start'});},{snd:'pop',vol:.5});});
},{zoom:.03});
B(26,30,()=>{
  bokeh(BK,T);
  head(at(26,-.3),"HERE'S WHAT YOU NEED TO UNDERSTAND",{outAt:at(28,-.2)});
  // loading the perfect moment
  const o1=at(28,-.1);
  if(T<o1+.4)g(`opacity="${1-P(T,o1,.4)}"`,()=>{fadeIn(at(27,-.1),()=>{const p=.99*eo(P(T,at(27),1));bar(560,420,800,p,{lab:'LOADING: THE PERFECT MOMENT',right:Math.round(p*100)+'%',h:40});spinner(960,520,18);});
    pill(at(27,1.4),960,620,'PROBABLY NOT COMING',{size:22,dark:true});});
  // obstacles appear in front of you
  const gy=G;you(-9,{x:420,g:gy,arm:[60,-20]});
  const walls=[[28,'SOMETHING',760,240],[29,'ANOTHER EXCUSE',1000,320]];
  walls.forEach(([i,tx,x,hgt])=>{const p=eio(P(T,at(i,.2),.5));if(p>0){add(`<rect x="${x}" y="${gy-hgt*p}" width="120" height="${hgt*p}" rx="10" fill="#0b0b0b" stroke="#fff" stroke-width="4" filter="url(#glow)"/>`);for(let yy=gy-60;yy>gy-hgt*p+10;yy-=60)add(`<line x1="${x+2}" y1="${yy}" x2="${x+118}" y2="${yy}" stroke="#fff" stroke-opacity=".3" stroke-width="2"/>`);
    fadeIn(at(i,.6),()=>label(x+60,gy-hgt-30,tx,{size:16,op:.75}));}cue('thud',at(i,.25),.5);});
  // someone else starts with less
  const sp=P(T,at(30,.6),.5);
  if(sp>0){g(`opacity="${sp}"`,()=>{const sx=1260,sy=gy;add(`<path d="${stairsPath(sx,sy,6,70,60)}" stroke="#fff" stroke-width="4" fill="none" filter="url(#glowS)"/>`);
    const c=clamp((T-at(30,1))/2.6)*5,i=Math.floor(c),f=c-i;const[ax,ay]=[sx+(i+.5)*70,sy-(i+1)*60],[bx,by]=[sx+(Math.min(5,i+1)+.5)*70,sy-(Math.min(5,i+1)+1)*60];
    const[px,py]=i>=5?[ax,ay]:hopTo(ax,ay,bx,by,f,30);person(px,i<0?sy:py,.6,{spot:.6,ring:false,arm:[40,-60]});
    label(1460,gy+50,'SOMEONE WITH LESS',{size:16,op:.7});});}
  fadeIn(at(30,.2),()=>{icon('hourglass',560,gy-280,.9);label(560,gy-200,'WAITING…',{size:15,op:.6});},{outAt:null});
},{zoom:.03});
B(31,36,()=>{
  bokeh(BK,T);
  big(at(31,-.15),'THINK ABOUT IT.',{y:240,size:84,outAt:at(32,-.2),vol:.5});
  head(at(32,-.2),"YOU DON'T NEED…");
  checklist([{t:at(32),text:'AN EXPENSIVE GYM MEMBERSHIP',mark:at(32,1.4)},{t:at(33),text:'THOUSANDS OF POUNDS',mark:at(33,1.3)},{t:at(34),text:'THOUSANDS OF FOLLOWERS',mark:at(34,1.3)},{t:at(35),text:'YOUR WHOLE FUTURE FIGURED OUT',mark:at(35,1.3)}],{x:640,y:300,w:1080,rowH:105,t0:at(32,-.2)});
  you(-9,{arm:at(36)<T?[50,-70]:null});
  pop(at(36,.3),1180,780,()=>{pillShape(1180,780,'YOU JUST NEED TO START',{size:26});},{snd:'hit',vol:.7});
},{zoom:.03});
B(37,41,()=>{
  bokeh(BK,T);
  const o=at(39,-.2);
  if(T<o+.4)g(`opacity="${1-P(T,o,.4)}"`,()=>{
    head(at(37,-.3),'THE FIRST STEP');
    const sx=900,sh=70;drawPath(`M-10,${G} L${sx},${G} L${sx},${G-sh} L${sx+260},${G-sh} L${sx+260},${G} L${W+10},${G}`,eo(P(T,at(37,0),.8)),{sw:4});
    pill(at(37,1.2),1030,G-190,"DOESN'T HAVE TO BE IMPRESSIVE",{size:20,dark:true,outAt:at(38,-.1)});
    const hop=P(T,at(38,.3),.5);const[px,py]=hop>0?hopTo(700,G,1010,G-sh,eio(hop),70):[700,G];person(px,py,1,{spot:true,ring:hop<=0||hop>=1,arm:hop>=1?[50,-75]:null});
    pill(at(38,.6),1030,G-330,'IT JUST HAS TO HAPPEN',{size:24});cue('hop',at(38,.3),.7);ring(1010,G-sh-60,at(38,.8));});
  // beginning vs middle
  if(T>o){head(at(39,-.1),'STOP COMPARING',{outAt:at(40,-.2)});
    fadeIn(at(39,0),()=>{box(240,320,640,260,{r:22,op:.7});label(560,370,'YOUR BEGINNING',{size:20,op:.75});bar(300,430,520,.06,{lab:'CHAPTER 1',h:34});
      box(1040,320,640,260,{r:22,op:.7});label(1360,370,"SOMEONE ELSE'S MIDDLE",{size:20,op:.75});bar(1100,430,520,.55,{lab:'CHAPTER 20',h:34});
      label(960,470,'≠',{size:60,op:.8,weight:800,sp:0});},{outAt:at(40,-.15)});
    // everyone starts somewhere: a row of figures at a start line
    const p4=P(T,at(40,0),.4);if(p4>0&&T<at(41,-.1)+.4){g(`opacity="${p4*(1-P(T,at(41,-.1),.4))}"`,()=>{big(at(40,0),'EVERYONE STARTS SOMEWHERE.',{y:250,size:72,vol:.4});ground(G,1);
      add(`<line x1="400" y1="${G-180}" x2="400" y2="${G}" stroke="#fff" stroke-width="4" stroke-dasharray="10 8"/>`);label(400,G-200,'DAY 1',{size:18,op:.8});
      for(let k=0;k<7;k++)person(500+k*170,G,.75,{op:k===3?1:.45,ring:false,spot:k===3?.6:false});});}
    // willing to look inexperienced
    const p5=P(T,at(41,-.1),.4);if(p5>0){g(`opacity="${p5}"`,()=>{head(at(41,-.1),'WILLING TO LOOK INEXPERIENCED');ground(G,1,{x2:700});
      add(`<path d="${stairsPath(700,G,8,110,72)}" stroke="#fff" stroke-width="4" fill="none" filter="url(#glow)"/>`);
      pop(at(41,1),1660,G-8*72-70,()=>icon('star',1660,G-8*72-80,1.4),{snd:'win',vol:.4});
      const c=clamp((T-at(41,.8))/4.5)*6,i=Math.floor(c),f=c-i;const sp=n=>[700+(n+.5)*110,G-(n+1)*72];const[ax,ay]=c<=0?[580,G]:sp(i),[bx,by]=sp(Math.min(7,i+1));
      const[px,py]=c<=0?[580,G]:hopTo(ax,ay,bx,by,f,30);person(px,py,.8,{spot:.7,ring:false,arm:[40,-50]});
      pop(at(41,.5),px,py-190,()=>pillShape(px,py-190,'BEGINNER',{size:15,dark:true,pad:16}),{vol:.4});});}}
},{zoom:.03});

/* ================= CHAPTER 2 ================= */
function battery(x,y,p,lab='MOTIVATION'){box(x,y,300,120,{r:18,op:.85});add(`<rect x="${x+300}" y="${y+38}" width="18" height="44" rx="6" fill="#fff" fill-opacity=".8"/>`);
  if(p>0)add(`<rect x="${x+12}" y="${y+12}" width="${276*p}" height="96" rx="10" fill="#fff" fill-opacity="${.85}" filter="url(#glowS)"/>`);label(x+150,y+160,lab+' · '+Math.round(p*100)+'%',{size:18,op:.75});}
B(42,49,()=>{
  bokeh(BK,T);
  head(at(42,-.3),"LET'S TALK ABOUT");big(at(42,.5),'MOTIVATION',{y:250,size:92});
  you(at(42,-.3),{arm:T>at(43)?[40,-70]:null});
  const ch=eio(P(T,at(43,0),Math.max(1,L[44].e-L[43].s)));
  fadeIn(at(43,-.1),()=>battery(640,380,ch),{outAt:at(45,-.2)});
  pill(at(43,.5),790,330,'FEELS INCREDIBLE',{size:18,outAt:at(45,-.2)});
  [[at(44,.2),'play',1180,380],[at(44,1.4),'note',1380,380]].forEach(([t,ic,x,y])=>pop(t,x,y,()=>{icon(ic,x,y+40,1.2);arrowR(x-40,y+150,x-140,0);},{vol:.5,outAt:at(45,-.2)}));
  pill(at(45,.1),1110,330,'TOMORROW WILL BE DIFFERENT',{size:22,dark:true});
  checklist([{t:at(46),text:'WAKE UP EARLIER'},{t:at(47),text:'TRAIN HARDER'},{t:at(48),text:'WORK LONGER'},{t:at(49),text:'BECOME WHO I WANT TO BE'}],{x:690,y:450,w:880,rowH:92});
},{zoom:.03});
B(50,55,()=>{
  bokeh([[960,600,320,.04]],T);
  head(at(50,-.3),'BUT THEN TOMORROW ARRIVES');
  // bed
  const bx=420,by=780;add(`<g filter="url(#glowS)" stroke="#fff" stroke-width="4" fill="#0b0b0b"><rect x="${bx}" y="${by-40}" width="520" height="60" rx="12"/><rect x="${bx}" y="${by-140}" width="30" height="200" rx="8"/><rect x="${bx+490}" y="${by-90}" width="30" height="150" rx="8"/></g>`);
  g(`transform="rotate(-90,${bx+120},${by-40})"`,()=>person(bx+120,by-40,.9,{ring:false,arms:false}));
  add(`<path d="M${bx+150},${by-75} Q${bx+330},${by-110} ${bx+505},${by-80} L${bx+505},${by-40} L${bx+150},${by-40} Z" fill="#0b0b0b" stroke="#fff" stroke-width="3.5" filter="url(#glowS)"/>`);
  zzz(bx+90,by-150,.8);
  // alarm clock ringing
  const ring_=T>at(50)&&T<at(51,.8);const sh=ring_?Math.sin(T*60)*5:0;icon('clock',1060+sh,by-90,1.1);if(ring_)add(`<g stroke="#fff" stroke-width="3" opacity=".7">${[0,1].map(i=>`<path d="M${1110+i*14},${by-130} q12,10 0,22"/><path d="M${1010-i*14},${by-130} q-12,10 0,22"/>`).join('')}</g>`);
  cue('tick',at(50,.1),.6);cue('tick',at(50,.3),.6);cue('tick',at(50,.5),.6);
  pill(at(51,0),640,560,"YOU'RE TIRED",{size:22,dark:true});
  [[52,'GET OUT OF BED?',1380,330],[53,'TRAIN?',1380,470],[54,'YEARS OF WORK?',1380,610]].forEach(([i,tx,x,y])=>pop(at(i,.1),x,y,()=>{pillShape(x,y,tx,{size:20,dark:true});label(x+pillW(tx,20)/2+50,y+10,'NO.',{size:26,op:1,weight:800});},{snd:'nope',vol:.35}));
  fadeIn(at(55,-.1),()=>{const p=1-eio(P(T,at(55,.3),1.6));battery(1230,760,p);});
},{zoom:.025});
function pillW(t,size){return t.length*size*.92+56;}
B(56,61,()=>{
  bokeh(BK,T);
  head(at(56,-.3),'THIS IS WHERE IT COMES IN');big(at(56,.6),'DISCIPLINE',{y:250,size:100,vol:.8});
  pill(at(57,.2),960,350,"DOING WHAT NEEDS TO BE DONE — EVEN WHEN YOU DON'T FEEL LIKE IT",{size:18,dark:true});
  const rows=[[58,'handshake','KEEPING PROMISES','TO YOURSELF',null],[59,'dumbbell','THE GYM','',"couch"],[60,'book','STUDYING','',"game"],[61,'eye','WORKING ON GOALS','WHEN NOBODY IS WATCHING',null]];
  rows.forEach(([i,ic,t1,t2,alt],k)=>{const x=390+k*380,y=600;pop(at(i,.1),x,y,()=>{box(x-170,y-170,340,340,{r:24,op:.9});icon(ic,x,y-60,1.2);label(x,y+50,t1,{size:22,op:1,weight:800});if(t2)label(x,y+82,t2,{size:14,op:.6});
    if(alt){label(x,y+86,'INSTEAD OF',{size:13,op:.5});icon(alt,x,y+130,.6,.5);cross(x,y+130,.7,.6,P(T,at(i,1.2),.3));}
    if(i===61)cross(x,y-60,1,.8,P(T,at(i,1.3),.3));},{snd:'pop',vol:.5});});
},{zoom:.03});
B(62,65,()=>{
  bokeh(BK,T);
  head(at(62,-.3),"WHY THAT MATTERS");
  box(220,280,1480,560,{r:24,op:.5});const x0=300,y0=780,w=1320,h=440;axes(x0,y0,w,h,{xl:'TIME',yl:'PROGRESS'});
  const u1=P(T,at(63,0),2.5);
  const mot=v=>.12+.55*Math.max(0,Math.sin(v*Math.PI*5))**3*(1-v*.3)+v*.05;
  curve(mot,x0,y0,w,h,u1,{sw:4,op:.55,glow:null});
  fadeIn(at(63,.8),()=>label(x0+w*.12,y0-h*.72,'ONLY WHEN INSPIRED',{size:16,op:.6,anchor:'start'}));
  const u2=P(T,at(64,0),2.2);const tip=curve(v=>.08+.82*v,x0,y0,w,h,u2,{sw:6});if(tip)orb(tip[0],tip[1],8);
  pill(at(64,.3),x0+w*.7,y0-h*.95,'CONSISTENCY',{size:24});
  pill(at(65,.2),x0+w*.42,y0-h*.25,'FOLLOW THROUGH',{size:18,dark:true});
},{zoom:.025});
B(66,69,()=>{
  bokeh(BK,T);big(at(66,-.1),'START SMALL.',{y:250,size:92});
  you(-9,{arm:[50,-30]});
  cardRow([{t:at(67,.1),icon:'clock',text:'SET A TIME',text2:'TO WAKE UP'},{t:at(68,.1),icon:'calendar',text:'A DAILY',text2:'ROUTINE'},{t:at(69,.1),icon:'target',text:'ACHIEVABLE',text2:'GOALS'}],{cx:1130,y:540,w:300,h:330,gap:50,checkAt:null});
  [67,68,69].forEach((i,k)=>{const x=1130-350+k*350;const c=P(T,at(i,1.2),.3);if(c>0)check(x+130,390,1.3*back(c));cue('win',at(i,1.2),.3);});
},{zoom:.03});
B(70,72,()=>{
  bokeh(BK,T);
  const o=at(71,-.2);
  if(T<o+.4)g(`opacity="${1-P(T,o,.4)}"`,()=>{head(at(70,-.3),'MOST IMPORTANTLY');you(-9,{x:520,arm:[60,10]});
    [['JUST 5 MORE MINUTES…',820,380,.3],['I’LL START TOMORROW…',1180,520,1.0],['ONE DAY OFF WON’T HURT…',900,660,1.7]].forEach(([tx,x,y,d])=>pop(at(70,d),x,y,()=>bubble(x,y,380,tx,{size:17}),{vol:.4}));
    pill(at(70,2.8),1400,300,'STOP NEGOTIATING',{size:26});[0,1,2].forEach(k=>cross([820,1180,900][k],[380,520,660][k],1.6,.9,P(T,at(70,3.0+k*.12),.25)));cue('nope',at(70,3),.5);});
  if(T>o){head(at(71,-.1),'30-DAY TRACKER');
    const miss=[4,11,19,23];for(let d=0;d<30;d++){const c=d%10,r=Math.floor(d/10),x=470+c*100,y=340+r*130,t0=at(71,.3)+d*.07;
      fadeIn(t0,()=>{box(x-40,y-45,80,90,{r:12,op:miss.includes(d)?.35:.8,glow:false});label(x,y-20,String(d+1),{size:13,op:.5});if(miss.includes(d))cross(x,y+12,.55,.45,1);else check(x,y+14,.8);},{d:.2,dy:6});}
    for(let k=0;k<8;k++)cue('tick',at(71,.3)+k*.25,.25);
    pill(at(71,1),960,280,"NOT PERFECT",{size:20,dark:true});
    pill(at(72,.3),960,780,'JUST MORE CONSISTENT',{size:26});}
},{zoom:.025});

/* ================= CHAPTER 3 ================= */
B(73,74,()=>{
  bokeh(BK,T);head(at(73,-.3),'A DIFFERENT LIFE MEANS DOING NEW THINGS');
  const cx=700,cy=620;add(`<ellipse cx="${cx}" cy="${cy}" rx="300" ry="210" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3.5" stroke-dasharray="12 9" filter="url(#glowS)"/>`);
  label(cx,cy-240,'COMFORT ZONE',{size:20,op:.75});
  pop(at(73,1.2),1500,420,()=>{icon('star',1500,420,1.6);label(1500,520,'A DIFFERENT LIFE',{size:20,op:.85,weight:800});},{snd:'pop'});
  const st=P(T,at(74,.2),1.6);const px=lerp(cx,1080,eio(st)),wob=st>0&&st<1?Math.sin(T*30)*4:0;
  person(px+wob,cy+120,.9,{spot:.7,ring:false,arm:st>0?[60,-20]:null});
  pill(at(74,.6),1120,330,'UNCOMFORTABLE',{size:22,dark:true});
},{zoom:.03});
B(75,78,()=>{
  bokeh(BK,T);head(at(75,-.3),"YOU'RE GOING TO EXPERIENCE…");
  you(-9);
  cardRow([{t:at(75,.1),icon:'envelope',text:'REJECTION'},{t:at(76,.1),icon:'x',text:'MISTAKES'},{t:at(77,.1),icon:'gear',text:"THINGS THAT",text2:"DON'T WORK"},{t:at(78,1.6),icon:'trophy',text:'BEST EFFORT…',text2:'STILL FAIL'}],{cx:1150,y:520,w:270,h:320,gap:30});
},{zoom:.03});
B(79,80,()=>{
  bokeh(BK,T);head(at(79,-.3),"FAILURE ISN'T SOMETHING TO AVOID");you(-9,{arm:[50,-20]});
  pop(at(79,.6),860,500,()=>xTile(860,500,180),{snd:'nope',vol:.5});
  arrowR(990,500,1200,P(T,at(80,.3),.6));
  pop(at(80,.9),1360,500,()=>{box(1270,410,180,180,{r:26,op:1});icon('bulb',1360,500,1.2);},{snd:'win',vol:.5});ring(1360,500,at(80,1));
  pill(at(80,1.3),1110,720,'YOUR BIGGEST LESSONS',{size:24});
},{zoom:.03});
function car(x,y,jit=0){add(`<g filter="url(#glow)" stroke="#fff" stroke-width="4" fill="#0b0b0b" stroke-linejoin="round" transform="translate(0,${jit})">
  <path d="M${x-150},${y-30} L${x-150},${y-70} L${x-100},${y-75} L${x-60},${y-125} L${x+50},${y-125} L${x+100},${y-75} L${x+150},${y-65} L${x+150},${y-30} Z"/>
  <path d="M${x-50},${y-115} L${x-80},${y-78} L${x-5},${y-78} L${x-5},${y-115} Z M${x+5},${y-115} L${x+5},${y-78} L${x+80},${y-78} L${x+45},${y-115} Z"/></g>`);
  [-90,90].forEach(o=>add(`<circle cx="${x+o}" cy="${y-28+jit}" r="28" fill="#0b0b0b" stroke="#fff" stroke-width="4" filter="url(#glowS)"/><circle cx="${x+o}" cy="${y-28+jit}" r="9" fill="#fff"/>`));
  add(`<rect x="${x-140}" y="${y-62+jit}" width="34" height="28" rx="4" fill="#fff"/><text x="${x-123}" y="${y-40+jit}" font-size="22" font-weight="800" text-anchor="middle" fill="#000">L</text>`);}
B(81,86,()=>{
  bokeh(BK,T);head(at(81,-.3),'THINK ABOUT LEARNING TO DRIVE');
  const y=760;add(`<line x1="-10" y1="${y}" x2="${W+10}" y2="${y}" stroke="#fff" stroke-opacity=".6" stroke-width="3"/><line x1="-10" y1="${y+60}" x2="${W+10}" y2="${y+60}" stroke="#fff" stroke-opacity=".25" stroke-width="3" stroke-dasharray="40 30" stroke-dashoffset="${-((T*120)%70)}"/>`);
  const stall=T>at(84)&&T<at(85,-.2);const jerk=T>at(83)&&T<at(84)?(Math.sin(T*18)>0.6?-8:0):0;
  const x=lerp(380,1150,eio(P(T,at(81,.2),Math.max(3,L[86].e-L[81].s))));car(stall?x:x,y,stall?0:jerk);
  if(stall){[0,1,2].forEach(k=>{const ph=(T*1.2+k/3)%1;add(`<circle cx="${x-170-ph*80}" cy="${y-40-ph*50}" r="${10+ph*16}" fill="none" stroke="#fff" stroke-opacity="${.5*(1-ph)}" stroke-width="3"/>`);});}
  pill(at(82,.1),640,330,'LESSON 1: NOT PERFECT',{size:20,dark:true});
  [0,1,2].forEach(k=>pop(at(83,.1+k*.2),900+k*90,420,()=>cross(900+k*90,420,.8,.8,1),{snd:k?null:'nope',vol:.4}));
  pop(at(84,.1),1320,330,()=>pillShape(1320,330,'STALLED',{size:24}),{snd:'thud',vol:.5});
  fadeIn(at(85,.1),()=>{bar(560,540,800,eio(P(T,at(85,.2),2.2)),{lab:'STRUGGLE',right:'SECOND NATURE',h:30});});
  pill(at(86,.1),960,220,'AN EXPERT AFTER ONE ATTEMPT?',{size:24,dark:true});pop(at(86,1.4),960,220,()=>strike(700,1220,220,P(T,at(86,1.4),.3)),{snd:'nope',vol:.4});
},{zoom:.025});
B(87,88,()=>{
  bokeh(BK,T);head(at(87,-.3),'SO WHY EXPECT LIFE TO BE DIFFERENT?');
  box(260,260,1400,540,{r:24,op:.45});const x0=340,y0=740,w=1240,h=400;axes(x0,y0,w,h,{xl:'',yl:null});
  const u=P(T,at(87,.4),1.4);curve(v=>v,x0,y0,w,h,u,{sw:3,op:.4,glow:null});fadeIn(at(87,1.2),()=>{label(x0+w*.55,y0-h*.62,'WHAT YOU EXPECT',{size:16,op:.5});});
  pop(at(88,1.4),x0+w*.55,y0-h*.55,()=>cross(x0+w*.55,y0-h*.55,1.2,.8,1),{snd:'nope',vol:.4});
  const pts=[[0,0],[.12,.18],[.18,.08],[.32,.36],[.38,.22],[.55,.5],[.6,.38],[.78,.72],[.84,.6],[1,.95]].map(([a,b])=>[x0+a*w,y0-b*h]);
  const tip=polyline(pts,P(T,at(88,.1),2.4),{sw:5});if(tip)orb(tip[0],tip[1],7);
  pill(at(88,1.8),x0+w*.25,y0-h*.85,'SETBACKS ARE PART OF IT',{size:20});
},{zoom:.025});
B(89,93,()=>{
  bokeh(BK,T);head(at(89,-.3),'EVERY SETBACK GIVES YOU SOMETHING');
  const rows=[[89,'MISTAKE','INFORMATION','bulb'],[90,'REJECTION','A LESSON','book'],[91,'DIFFICULTY','A CHANCE TO IMPROVE','chart']];
  rows.forEach(([i,a,b,ic],k)=>{const y=330+k*150;fadeIn(at(i,0),()=>{xTile(560,y,90,.8);label(640,y+10,a,{size:24,op:.7,weight:800,anchor:'start'});arrowR(900,y,1090,P(T,at(i,.5),.5));});
    pop(at(i,1),1180,y,()=>{icon(ic,1180,y,.9);label(1250,y+10,b,{size:24,op:1,weight:800,anchor:'start'});},{snd:'win',vol:.35});});
  fadeIn(at(92,0),()=>{pillShape(700,830,'AVOIDING FAILURE',{size:22,dark:true});strike(560,840,830,P(T,at(92,1.2),.3));});cue('nope',at(92,1.2),.4);
  pill(at(93,.1),1260,830,'LEARNING FROM IT',{size:24});
},{zoom:.025});
B(94,95,()=>{
  bokeh(BK,T);head(at(94,-.3),"ONE BAD EXPERIENCE DOESN'T DEFINE YOU");
  box(260,260,1400,540,{r:24,op:.45});const x0=340,y0=740,w=1240,h=420;axes(x0,y0,w,h,{xl:'PRACTICE',yl:'SKILL'});
  const lc=v=>1/(1+Math.exp(-(v-.55)*10));const tip=curve(lc,x0,y0,w,h,P(T,at(94,.3),2.4),{sw:5});
  pop(at(94,2.4),x0+w*.08,y0-h*lc(.08)-20,()=>{xTile(x0+w*.08,y0-h*lc(.08)-60,46,.8);},{snd:'nope',vol:.3});
  const yx=x0+w*.1;pop(at(95,.2),yx,y0-h*lc(.1),()=>{orb(yx,y0-h*lc(.1),9);pillShape(yx+40,y0-h*lc(.1)-80,'YOU ARE HERE',{size:18});},{snd:'pop'});
  fadeIn(at(95,.8),()=>label(x0+w*.6,y0-h*.25,'THE BEGINNING OF THE LEARNING PROCESS',{size:18,op:.75}));
},{zoom:.025});

/* ================= CHAPTER 4 ================= */
const RING=[[-330,0],[-230,-170],[0,-230],[230,-170],[330,0]];
function circleOfPeople(cx,cy,opFn,bubbleFn){RING.forEach(([dx,dy],k)=>{const x=cx+dx,y=cy+dy+120;person(x,y,.75,{op:opFn(k),ring:false});if(bubbleFn)bubbleFn(k,x,y);});}
B(96,101,()=>{
  bokeh(BK,T);head(at(96,-.3),'YOUR ENVIRONMENT');
  const cx=960,cy=600;add(`<ellipse cx="${cx}" cy="${cy+120}" rx="420" ry="90" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2" stroke-dasharray="8 8"/>`);
  person(cx,cy+120,1,{spot:true});label(cx,cy+176,'YOU',{size:18,op:.6});
  const app=k=>clamp(P(T,at(96,.6)+k*.15,.4));
  const enc=k=>[1,3].includes(k),neg=k=>[0,4].includes(k);
  circleOfPeople(cx,cy,k=>{let o=app(k);if(T>at(100,.3)&&enc(k))o*=1;else if(T>at(100,.3))o*=.55;if(T>at(101,.3)&&neg(k))o=Math.max(o,.9);return o;},(k,x,y)=>{
    const bt=at(98,.2)+k*.1;if(T>bt&&T<at(100,.2)){add(`<g opacity="${clamp(P(T,bt,.3))}">`);bubbleDots(x,y-190);add('</g>');}
    if(T>at(99,.2)&&T<at(100,.2)){const ic=['phone','couch','game','phone','couch'][k];icon(ic,x+70,y-60,.45,.7);}
    if(T>at(100,.3)&&T<at(101,.2)&&enc(k)){add(`<path d="M${x},${y-200} l0,-40 M${x-14},${y-226} L${x},${y-240} L${x+14},${y-226}" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" filter="url(#glowS)"/>`);}
    if(T>at(101,.3)&&neg(k)){add(`<g opacity="${clamp(P(T,at(101,.3),.3))}">`);bubble(x+(k?-60:60),y-210,140,'LOL',{size:18,tail:k?'right':'left'});add('</g>');}});
  if(T>at(97))fadeIn(at(97,.2),()=>label(960,240,'THE PEOPLE YOU SPEND THE MOST TIME AROUND',{size:18,op:.6}),{outAt:at(98)});
  [[98,'WHAT DO THEY TALK ABOUT?'],[99,'HOW DO THEY SPEND THEIR TIME?'],[100,'DO THEY ENCOURAGE YOU?'],[101,'OR MAKE YOU FEEL RIDICULOUS?']].forEach(([i,tx],k)=>pill(at(i,0),960,240,tx,{size:20,dark:true,outAt:k<3?at(i+1,-.1):null}));
},{zoom:.025});
function bubbleDots(x,y){add(`<g filter="url(#glowS)"><rect x="${x-46}" y="${y-26}" width="92" height="52" rx="26" fill="#0b0b0b" stroke="#fff" stroke-width="3"/>${[-18,0,18].map((o,i)=>`<circle cx="${x+o}" cy="${y}" r="5" fill="#fff" fill-opacity="${.4+.6*((Math.sin(T*6-i)+1)/2)}"/>`).join('')}</g>`);}
B(102,103,()=>{
  bokeh(BK,T);head(at(102,-.3),'YOUR ENVIRONMENT SHAPES WHAT FEELS NORMAL');
  const cx=960,cy=600;const sw=P(T,at(103,1.5),1.8);
  person(cx,cy+120,1,{spot:lerp(1,.4,sw),op:lerp(1,.6,sw)});
  const lines_=['COMPLAINING','EXCUSES',"NOT MY FAULT",'EXCUSES','COMPLAINING'];
  circleOfPeople(cx,cy,()=>.6,(k,x,y)=>{const t=at(103,.1)+k*.25;if(T>t){add(`<g opacity="${clamp(P(T,t,.3))}">`);bubble(x,y-200,lines_[k].length*16+60,lines_[k],{size:14});add('</g>');}});
  if(sw>0){add(`<g opacity="${sw}">`);bubble(cx,cy-120,260,'EXCUSES',{size:16});add('</g>');}
  pill(at(103,2.5),960,300,'SAME HABITS',{size:24,dark:true});
  fadeIn(at(102,.4),()=>{label(1600,320,'NORMAL',{size:16,op:.6});const v=lerp(.7,.2,P(T,at(103,.5),2.5));add(`<rect x="1580" y="350" width="40" height="300" rx="20" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2.5"/><rect x="1586" y="${356+288*(1-v)}" width="28" height="${288*v}" rx="14" fill="#fff" fill-opacity=".8"/>`);});
},{zoom:.025});
B(104,105,()=>{
  bokeh(BK,T);head(at(104,-.3),"THIS DOESN'T MEAN ABANDONING YOUR FRIENDS");
  ground(G,1);[440,620,1300,1480].forEach((x,k)=>person(x,G,.8,{op:.7,ring:false}));person(960,G,1,{spot:true,arm:[60,-10]});
  pop(at(104,2.2),960,G-260,()=>{pillShape(960,G-260,"I'M BETTER THAN YOU",{size:18,dark:true});cross(960,G-260,1.4,.9,P(T,at(104,2.6),.3));},{vol:.4});cue('nope',at(104,2.6),.4);
  // intentional: a gate filtering influences
  const gp=P(T,at(105,0),.4);if(gp>0){add(`<g opacity="${gp}">`);
    [[-1,1,0],[1,1,.4],[-1,0,.8],[1,0,1.2]].forEach(([d,good,dl],k)=>{const ph=clamp((T-at(105,.3)-dl)/1.4);const x=960+d*lerp(620,140,ph),y=360+k*40;
      if(ph>0&&ph<1){if(good||ph<.6)add(`<circle cx="${x}" cy="${y}" r="10" fill="#fff" fill-opacity="${good?.95:.4}" filter="url(#glowS)"/>`);if(!good&&ph>=.55)cross(x,y,.5,.7,1);}});
    icon('shield',960,380,1.1);label(960,460,'BE INTENTIONAL',{size:22,op:1,weight:800,glow:true});add('</g>');}
},{zoom:.025});
B(106,109,()=>{
  bokeh(BK,T);head(at(106,-.3),'CHOOSE YOUR INFLUENCES');you(-9,{arm:[50,-40]});
  cardRow([{t:at(106,.1),icon:'play',text:'FOLLOW PEOPLE',text2:'WHO INSPIRE YOU'},{t:at(107,.1),icon:'book',text:'LEARN FROM',text2:'ACHIEVERS'},{t:at(108,.1),icon:'people',text:'FIND YOUR',text2:'COMMUNITY'},{t:at(109,.6),icon:'handshake',text:'ENCOURAGE',text2:'OTHERS'}],{cx:1150,y:520,w:280,h:330,gap:28,checkAt:null});
  [106,107,108].forEach((i,k)=>{});
  ring(1150+460,520,at(109,.9),{r0:160,r1:420});
},{zoom:.025});
B(110,111,()=>{
  bokeh(BK,T);head(at(110,-.3),"YOU DON'T NEED AN ENTIRE ROOM");
  ground(G,1);for(let k=0;k<9;k++){const x=380+k*140;if(k!==5)person(x,G,.6,{op:lerp(.55,.15,P(T,at(111,0),.6)),ring:false});}
  const p=P(T,at(111,.2),.5);person(1080,G,.95,{spot:true,arm:T>at(111,.6)?[-55,-30]:null});
  if(p>0){person(1260,G,.95,{spot:p,op:p});label(1260,G+56,'ONE POSITIVE INFLUENCE',{size:15,op:.75*p});}
  label(1080,G+56,'YOU',{size:15,op:.6});
  const lp=P(T,at(111,1.2),1.2);if(lp>0)drawPath(`M1230,${G-210} C 1200,${G-300} 1120,${G-300} 1090,${G-230}`,eo(lp),{sw:3,dash:'8 8',glow:'glowS',op:.8});
  pop(at(111,2),1080,G-280,()=>icon('bulb',1080,G-300,.9),{snd:'win',vol:.45});
  pill(at(111,2.2),1500,330,'CAN CHANGE HOW YOU THINK',{size:22});
},{zoom:.03});

/* ================= CHAPTER 5 ================= */
const GOALS=[[114,'dollar','GET RICH'],[115,'dumbbell','PHYSIQUE'],[116,'briefcase','BUSINESS'],[117,'brain','SMARTER'],[118,'gear','NEW SKILLS'],[119,'people','SOCIAL LIFE'],[120,'smile','APPEARANCE']];
B(112,123,()=>{
  bokeh(BK,T);
  head(at(112,-.3),'ANOTHER MISTAKE THAT HOLDS PEOPLE BACK',{outAt:at(113,-.2)});
  big(at(113,.1),'EVERYTHING AT ONCE',{y:200,size:78,outAt:at(122,-.2),vol:.6});
  const cx=960,cy=620;const spin=T>at(121)?(T-at(121))*1.6+((T-at(121))**2)*.6:0;const chaos=P(T,at(121),3);
  person(cx,cy+130,1,{spot:true,arm:chaos>0?[40,-80]:null,arm2:chaos>0?[-40,-80]:null});
  if(chaos>.4)[0,1,2].forEach(k=>add(`<circle cx="${cx+40+k*10}" cy="${cy-40+((T*2+k*.3)%1)*40}" r="4" fill="#fff" fill-opacity="${.7*(1-((T*2+k*.3)%1))}"/>`));
  GOALS.forEach(([i,ic,tx],k)=>{const a=-Math.PI/2+k*2*Math.PI/7+spin+Math.sin(T*3+k)*.15*chaos;const R=360-30*chaos*Math.sin(T*5+k);const x=cx+R*Math.cos(a)*1.25,y=cy+R*Math.sin(a)*.62;
    pop(at(i,.05),x,y,()=>{add(`<circle cx="${x}" cy="${y}" r="60" fill="#0b0b0b" stroke="#fff" stroke-width="3" filter="url(#glowS)"/>`);icon(ic,x,y-6,.65);label(x,y+90,tx,{size:15,op:.8});if(T>at(123,.2))bar(x-60,y+104,120,.05+.03*Math.sin(k),{h:14,glow:false});},{snd:'pop',vol:.4});});
  pill(at(122,.2),960,200,'OVERWHELMED',{size:26,dark:true});
  fadeIn(at(123,.6),()=>label(960,1000,'NO MEANINGFUL PROGRESS IN ANY OF THEM',{size:18,op:.65}));
},{zoom:.025});
B(124,128,()=>{
  bokeh(BK,T);big(at(124,-.1),'CHOOSE A FEW PRIORITIES.',{y:220,size:76});
  head(at(125,.1),'WHAT MATTERS MOST TO YOU RIGHT NOW?',{y:300,size:20});
  you(-9,{arm:[55,-25]});
  cardRow([{t:at(126,.05),icon:'dumbbell',text:'GETTING FIT'},{t:at(127,.05),icon:'book',text:'EDUCATION'},{t:at(128,.05),icon:'chart',text:'A SKILL THAT',text2:'EARNS MORE'}],{cx:1130,y:580,w:310,h:330,gap:40,hiOne:null});
  [126,127,128].forEach((i,k)=>{const x=1130-350+k*350;if(T>at(i)&&(k===2||T<at(i+1)))add(`<rect x="${x-165}" y="${415}" width="330" height="330" rx="26" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="8 8" opacity=".8"/>`);});
},{zoom:.03});
B(129,131,()=>{
  bokeh(BK,T);head(at(129,-.3),'GIVE IT YOUR ATTENTION');
  const tx=1560,ty=360;pop(at(129,.3),tx,ty,()=>{icon('target',tx,ty,2.2);label(tx,ty+120,'THE GOAL',{size:18,op:.8});},{snd:'hit',vol:.5});
  const sx=420,sy=G,n=5,w=220,h=90;drawPath(stairsPath(sx,sy,n,w,h),eio(P(T,at(130,0),1.4)),{sw:4});
  ['WEEK 1','MONTH 1','MONTH 3','MONTH 6','YEAR 1'].forEach((m,k)=>fadeIn(at(130,.4+k*.25),()=>label(sx+(k+.5)*w,sy-(k+1)*h+36,m,{size:15,op:.6})));
  pill(at(130,.4),640,330,'BREAK IT DOWN',{size:24});
  const c=clamp((T-at(131,.1))/2.4)*n,i=Math.floor(c),f=c-i;const sp=k=>k<0?[sx-60,sy]:[sx+(k+.5)*w,sy-(k+1)*h];const[ax,ay]=sp(i-1),[bx,by]=sp(Math.min(n-1,i));
  const[px,py]=c<=0?[sx-60,sy]:(i>=n?sp(n-1):hopTo(ax,ay,bx,by,f,40));person(px,py,.85,{spot:.7,ring:false});for(let k=0;k<n;k++)cue('hop',at(131,.1)+k*2.4/n,.4);
  for(let k=0;k<n;k++){if(c>k+.9)check(sx+(k+.5)*w+60,sy-(k+1)*h-30,.8);}
},{zoom:.03});
B(132,134,()=>{
  bokeh(BK,T);
  const o=at(134,-.2);
  if(T<o+.4)g(`opacity="${1-P(T,o,.4)}"`,()=>{head(at(132,-.3),'NOT IN A WEEK');
    pop(at(132,.3),660,520,()=>{box(500,380,320,300,{r:22,op:.7});label(660,420,'WEEK 1',{size:18,op:.6});label(660,560,'ENTIRE LIFE',{size:22,op:.8,weight:800});label(660,600,'TRANSFORMED',{size:22,op:.8,weight:800});cross(660,530,2,.9,P(T,at(132,1.8),.3));},{snd:'pop'});cue('nope',at(132,1.8),.4);
    pop(at(133,.1),1260,520,()=>{add(`<circle cx="1260" cy="520" r="150" fill="#0b0b0b" stroke="#fff" stroke-width="4" filter="url(#glowS)"/>`);const a=-Math.PI/4+Math.sin(T*2)*.05;add(`<path d="M${1260-90*Math.cos(a)},${520+90*Math.sin(a)*-1} L${1260+110*Math.cos(a)},${520-110*Math.sin(a)}" stroke="#fff" stroke-width="10" stroke-linecap="round" filter="url(#glow)"/>`);label(1260,720,'THE RIGHT DIRECTION',{size:20,op:.85,weight:800});},{snd:'win',vol:.4});});
  if(T>o){head(at(134,-.1),'FOCUSED EFFORT');
    // scattered rays vs one beam
    for(let k=0;k<9;k++){const a=-1+k*.25;add(`<line x1="520" y1="560" x2="${520+260*Math.cos(a)}" y2="${560+260*Math.sin(a)}" stroke="#fff" stroke-opacity=".3" stroke-width="3"/>`);}
    label(520,760,'CONSTANTLY STARTING NEW THINGS',{size:16,op:.5});
    const bp=eo(P(T,at(134,.8),.8));if(bp>0)add(`<rect x="1000" y="555" width="${560*bp}" height="10" rx="5" fill="#fff" filter="url(#glowL)"/>`);icon('target',1600,560,1.3);
    label(1300,760,'FAR MORE VALUABLE',{size:18,op:.85,weight:800});ring(1600,560,at(134,1.6));cue('win',at(134,1.6),.4);}
},{zoom:.025});

/* ================= CHAPTER 6 ================= */
B(135,139,()=>{
  bokeh(BK,T);head(at(135,-.3),'EVERYONE WANTS INSTANT RESULTS');
  you(-9,{arm:T>at(139)?[-30,-60]:null,arm2:T>at(139)?[30,-60]:null});
  cardRow([{t:at(136,.05),icon:'dollar',text:'MONEY',text2:'QUICKLY'},{t:at(137,.05),icon:'trophy',text:'SUCCESS',text2:'IMMEDIATELY'},{t:at(138,.2),icon:'dumbbell',text:'NEW BODY IN',text2:'A FEW WEEKS'}],{cx:1130,y:500,w:300,h:320,gap:40});
  [136,137,138].forEach((i,k)=>pop(at(i,.5),1130-340+k*340+110,370,()=>{add(`<path d="M${1130-340+k*340+100},350 l-14,24 l12,0 l-10,22" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);},{snd:null}));
  pop(at(139,.4),FX,G-260,()=>{add(`<path d="M${FX-50},${G-260} q12,-26 24,0 t24,0 t24,0 t24,0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" filter="url(#glowS)"/>`);},{snd:'nope',vol:.4});
  pill(at(139,.6),1130,780,'FRUSTRATED',{size:22,dark:true});
},{zoom:.03});
B(140,145,()=>{
  bokeh(BK,T);head(at(140,-.3),'THE MOST VALUABLE THINGS TAKE TIME');
  pop(at(140,.6),360,560,()=>{icon('hourglass',360,540,2.4);},{snd:'pop'});
  const rows=[[141,'briefcase','A SUCCESSFUL BUSINESS'],[142,'brain','EXPERTISE'],[143,'dumbbell','A STRONG BODY'],[144,'house','FINANCIAL SECURITY']];
  rows.forEach(([i,ic,tx],k)=>{const y=330+k*130;fadeIn(at(i,0),()=>{icon(ic,690,y,.6);label(760,y+9,tx,{size:24,op:1,weight:800,anchor:'start'});const p=eio(P(T,at(i,.3),1.8));bar(1250,y-14,420,p*.9+.05,{h:28});label(1680,y-24,'YEARS',{size:13,op:.5,anchor:'end'});});});
  pill(at(145,.3),1110,880,'ACCEPT THAT',{size:24});
},{zoom:.025});
B(146,148,()=>{
  bokeh(BK,T);head(at(146,-.3),'MONTHS WITHOUT THE RESULTS YOU EXPECTED');
  const wy=520;add(`<rect x="0" y="${wy}" width="${W}" height="${H-wy}" fill="#fff" fill-opacity=".025"/><line x1="-10" y1="${wy}" x2="${W+10}" y2="${wy}" stroke="#fff" stroke-opacity=".6" stroke-width="3"/>`);
  // iceberg: small tip visible, huge mass below
  const bp=eio(P(T,at(148,0),1.2));
  add(`<path d="M890,${wy} L940,${wy-70} L990,${wy-40} L1030,${wy}" fill="#0b0b0b" stroke="#fff" stroke-width="4" filter="url(#glow)"/>`);
  label(1180,wy-60,'WHAT YOU CAN SEE',{size:16,op:.7,anchor:'start'});
  person(560,wy,.85,{spot:.6,ring:false,arm:[20,-36]});pop(at(146,1.4),620,wy-230,()=>qmark(620,wy-200,56,.8),{vol:.4});
  pill(at(147,.2),560,330,"THAT DOESN'T MEAN YOU'RE FAILING",{size:20,dark:true});
  if(bp>0){add(`<path d="M890,${wy} L760,${wy+200*bp} L820,${wy+400*bp} L1000,${wy+480*bp} L1180,${wy+380*bp} L1210,${wy+180*bp} L1030,${wy}" fill="#fff" fill-opacity="${.05*bp}" stroke="#fff" stroke-opacity="${bp}" stroke-width="3.5" stroke-dasharray="12 8" filter="url(#glowS)"/>`);
    fadeIn(at(148,1.2),()=>label(1300,wy+260,'PROGRESS YOU CAN’T SEE YET',{size:20,op:.9,anchor:'start',weight:800}));}
},{zoom:.025});
function tree(x,y,p){if(p<=0)return;const h=380*eio(clamp(p*1.4)),cr=180*eio(clamp((p-.35)/.65));
  add(`<path d="M${x-14},${y} L${x-8},${y-h} L${x+8},${y-h} L${x+14},${y} Z" fill="#0b0b0b" stroke="#fff" stroke-width="4" filter="url(#glowS)"/>`);
  if(h>120)add(`<path d="M${x},${y-h*.55} L${x-60},${y-h*.75} M${x},${y-h*.7} L${x+70},${y-h*.88}" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`);
  if(cr>0)[[0,-1,1],[-.7,-.6,.75],[.7,-.6,.75],[-.4,-1.1,.6],[.4,-1.1,.6]].forEach(([a,b,s])=>add(`<circle cx="${x+a*cr}" cy="${y-h+b*cr*.5}" r="${cr*.55*s}" fill="#0b0b0b" stroke="#fff" stroke-width="3.5" filter="url(#glowS)"/>`));}
B(149,153,()=>{
  bokeh(BK,T);head(at(149,-.3),'THINK ABOUT PLANTING A TREE');
  const tx=1150;ground(G,1,{op:.6});
  pop(at(149,.8),tx,G-10,()=>icon('seed',tx,G-14,.6),{snd:'pop'});
  // night/day toggle for "next morning"
  const n=P(T,at(150,1.6),.4)*(1-P(T,at(150,3),.4));if(n>0){icon('moon',1600,260,1.2,n);label(1600,360,'THE NEXT MORNING…',{size:16,op:.6*n});}
  pop(at(150,3.2),tx,G-80,()=>{pillShape(tx,G-160,'STILL JUST A SEED',{size:18,dark:true});},{outAt:at(151,-.1)});
  // watering, caring, time
  person(760,G,.95,{spot:.7,arm:T>at(151)&&T<at(152)?[70,-10]:(T>at(152)&&T<at(153)?[60,-50]:null)});
  if(T>at(151)&&T<at(152)){add(`<g filter="url(#glowS)" stroke="#fff" stroke-width="4" fill="#0b0b0b"><rect x="830" y="${G-140}" width="60" height="44" rx="8"/><path d="M890,${G-130} L940,${G-160}" fill="none" stroke-linecap="round"/></g>`);[0,1,2].forEach(k=>{const ph=(T*2+k/3)%1;add(`<circle cx="${950+ph*60}" cy="${G-150+ph*130}" r="4" fill="#fff" fill-opacity="${1-ph}"/>`);});}
  if(T>at(152)&&T<at(153))add(`<circle cx="${tx+260}" cy="300" r="60" fill="url(#bk)" fill-opacity=".3"/><circle cx="${tx+260}" cy="300" r="34" fill="none" stroke="#fff" stroke-width="4" filter="url(#glowS)"/>`);
  [[151,'WATER IT'],[152,'LOOK AFTER IT'],[153,'GIVE IT TIME']].forEach(([i,tx_],k)=>pill(at(i,.05),480+k*0,240+k*0,tx_,{size:22,dark:k<2,outAt:k<2?at(i+1,-.05):null}));
  const gp=P(T,at(151,0),Math.max(3,L[153].e-L[151].s+1.2));tree(tx,G,gp);
  fadeIn(at(153,.2),()=>label(tx,G+56,`DAY ${Math.round(1+gp*1824)}`,{size:18,op:.7}));
},{zoom:.025});
B(154,156,()=>{
  bokeh(BK,T);head(at(154,-.3),'YOUR GROWTH WORKS THE SAME WAY');
  box(260,260,1400,560,{r:24,op:.45});const x0=340,y0=760,w=1240,h=420;axes(x0,y0,w,h,{xl:'MONTHS · YEARS',yl:'YOUR LIFE'});
  const fn=v=>(Math.exp(v*4)-1)/(Math.exp(4)-1);const tip=curve(fn,x0,y0,w,h,P(T,at(155,0),Math.max(3,L[156].e-L[155].s)),{sw:6});if(tip)orb(tip[0],tip[1],8);
  pill(at(155,.6),x0+w*.2,y0-h*.4,'TOMORROW: NO CHANGE',{size:18,dark:true});
  pill(at(156,1.4),x0+w*.72,y0-h*.98,'A NEW DIRECTION',{size:22});
},{zoom:.025});
B(157,158,()=>{
  bokeh(BK,T);
  pop(at(157,-.1),960,240,()=>{title(960,260,'OVERNIGHT SUCCESS',{size:80,op:.6});strike(560,1360,236,P(T,at(157,1.2),.4));},{snd:'hit',vol:.5});cue('nope',at(157,1.2),.4);
  you(-9,{x:520,arm:[60,0]});
  // blocks stacking: something that lasts
  const blocks=[];for(let r=0;r<5;r++)for(let c=0;c<5-r;c++)blocks.push([900+c*150+r*75,G-(r+1)*84]);
  blocks.forEach(([x,y],k)=>{const t0=at(158,0)+k*.1;const q=P(T,t0,.25);if(q>0)add(`<rect x="${x}" y="${y-(1-eo(q))*60}" width="140" height="76" rx="8" fill="#0b0b0b" stroke="#fff" stroke-width="3.5" opacity="${q}" filter="url(#glowS)"/>`);cue('brick',t0+.25,.35);});
  pill(at(158,1.6),1200,330,'BUILD SOMETHING THAT LASTS',{size:24});
},{zoom:.03});

/* ================= CHAPTER 7 ================= */
const PLAN=['ONE GOAL','DAILY HABIT','REMOVE ONE','TRACK IT','GIVE IT TIME'];
function planStrip(k,t0){fadeIn(t0,()=>PLAN.forEach((p,i)=>{const x=360+i*300,y=120,on=i===k,done=i<k;
  add(`<rect x="${x-130}" y="${y-30}" width="260" height="60" rx="30" fill="${on?'#f4f4f4':'#0b0b0b'}" stroke="#fff" stroke-opacity="${on?1:.5}" stroke-width="2" ${on?'filter="url(#glow)"':''}/>`);
  label(x-90,y+7,String(i+1),{size:18,op:on?1:.6,fill:on?'#000':'#fff',weight:800});label(x+12,y+7,p,{size:16,op:on?1:(done?.8:.5),fill:on?'#000':'#fff',weight:800,sp:.12});
  if(done)check(x+120,y-24,.6);}),{dy:-10});}
B(159,160,()=>{
  bokeh(BK,T);head(at(159,-.3),'SO HOW DO YOU PUT THIS INTO PRACTICE?');
  big(at(160,.5),'5 SIMPLE COMMITMENTS',{y:300,size:80});
  you(-9,{x:960,arm:[50,-60]});
  PLAN.forEach((p,i)=>pop(at(160,1.2+i*.25),360+i*300,560,()=>{box(360+i*300-125,460,250,200,{r:22,op:.85});label(360+i*300,530,String(i+1),{size:54,op:1,weight:800,sp:0,glow:true});label(360+i*300,610,p,{size:17,op:.85,weight:800});},{snd:'pop',vol:.4}));
},{zoom:.03});
B(161,164,()=>{
  bokeh(BK,T);planStrip(0,at(161,-.3));
  big(at(161,.3),'CHOOSE ONE MAJOR GOAL',{y:260,size:74});
  fadeIn(at(162,0),()=>label(960,330,'SOMETHING YOU GENUINELY WANT',{size:20,op:.7}));
  you(-9,{arm:[60,-20]});
  const items=['dollar','dumbbell','briefcase','book','gear','people','smile','house','chart','star'];
  items.forEach((ic,k)=>{const x=760+(k%5)*200,y=480+Math.floor(k/5)*200,keep=k===9;const t0=at(163,0)+k*.06;
    const dim=T>at(164)&&!keep?lerp(1,.15,P(T,at(164),.5)):1;fadeIn(t0,()=>{g(`opacity="${dim}"`,()=>{add(`<circle cx="${x}" cy="${y}" r="70" fill="#0b0b0b" stroke="#fff" stroke-width="3" ${keep&&T>at(164)?'filter="url(#glow)"':''}/>`);icon(ic,x,y,.75);});
      if(!keep)cross(x,y,1,.6,P(T,at(163,1.2)+k*.05,.25));},{d:.25});});
  cue('nope',at(163,1.2),.4);
  fadeIn(at(163,0),()=>label(1160,370,"DON'T CHOOSE TEN THINGS",{size:18,op:.65}),{outAt:at(164,-.1)});
  pill(at(164,.6),1560,860,'ONE PRIORITY',{size:22});ring(1560,680,at(164,.6));
},{zoom:.025});
B(165,168,()=>{
  bokeh(BK,T);planStrip(1,at(165,-.3));
  big(at(165,.3),'CREATE A DAILY HABIT',{y:260,size:76});
  you(-9,{arm:[50,-50]});
  const ex=[[166,'dumbbell','GET FITTER','TRAIN CONSISTENTLY'],[167,'book','EDUCATION','STUDY DAILY'],[168,'briefcase','A BUSINESS','DEVELOP THE SKILLS']];
  ex.forEach(([i,ic,a,b],k)=>{const x=780+k*360,y=560;pop(at(i,.1),x,y,()=>{box(x-160,y-180,320,360,{r:24,op:.9});label(x,y-140,'IF YOU WANT',{size:13,op:.5});label(x,y-110,a,{size:20,op:.85,weight:800});icon(ic,x,y-20,1.1);
    [0,1,2,3,4,5,6].forEach(d=>{const cx_=x-120+d*40;add(`<rect x="${cx_-14}" y="${y+60}" width="28" height="28" rx="6" fill="${T>at(i,.6)+d*.12?'#fff':'none'}" fill-opacity=".85" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>`);});
    label(x,y+130,b,{size:16,op:.85,weight:800});},{snd:'pop',vol:.5});for(let d=0;d<7;d++)cue('tick',at(i,.6)+d*.12,.2);});
},{zoom:.025});
B(169,173,()=>{
  bokeh(BK,T);planStrip(2,at(169,-.3));
  big(at(169,.3),'REMOVE ONE HABIT',{y:260,size:80});fadeIn(at(169,1.2),()=>label(960,330,"THAT'S HOLDING YOU BACK",{size:20,op:.7}));
  you(-9);
  const bad=[[170,'phone','HOURS SCROLLING'],[171,'hourglass','PROCRASTINATING'],[172,'moon','STAYING UP LATE']];
  bad.forEach(([i,ic,tx],k)=>{const x=820+k*360,y=560;pop(at(i,.1),x,y,()=>{box(x-150,y-150,300,300,{r:24,op:.9});icon(ic,x,y-30,1.3);label(x,y+90,tx,{size:19,op:1,weight:800});cross(x,y-30,2.2,.9,P(T,at(173,.6)+k*.15,.3));},{snd:'pop',vol:.5});});
  cue('nope',at(173,.6),.5);pill(at(173,1.4),1180,820,'IDENTIFY IT. CHANGE IT.',{size:22});
},{zoom:.025});
B(174,177,()=>{
  bokeh(BK,T);planStrip(3,at(174,-.3));
  big(at(174,.3),'TRACK YOUR PROGRESS',{y:260,size:80});
  you(-9,{arm:[60,-10]});
  // notebook with entries being written
  pop(at(175,0),820,580,()=>{box(640,380,360,420,{r:20,op:.9});label(820,425,'PROGRESS LOG',{size:16,op:.6});
    for(let k=0;k<6;k++){const p=P(T,at(175,.3)+k*.3,.3);if(p>0){add(`<line x1="690" y1="${470+k*50}" x2="${690+lerp(0,200,p)}" y2="${470+k*50}" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>`);if(p>=1)check(950,470+k*50,.55);}}},{snd:'pop'});
  pop(at(176,0),1300,560,()=>{box(1100,380,400,360,{r:20,op:.9});icon('chart',1300,540,2);label(1300,700,'WHERE YOU IMPROVED',{size:16,op:.75});},{snd:'pop'});
  fadeIn(at(177,.2),()=>{drawPath('M1100,820 C 1250,820 1300,900 1420,880 S 1600,780 1700,800',eo(P(T,at(177,.4),1.4)),{sw:4,dash:'10 9',glow:'glowS'});label(1400,960,'ADJUST YOUR APPROACH',{size:18,op:.85,weight:800});});
},{zoom:.025});
B(178,182,()=>{
  bokeh(BK,T);planStrip(4,at(178,-.3));
  const o=at(181,-.2);
  if(T<o+.4)g(`opacity="${1-P(T,o,.4)}"`,()=>{big(at(178,.3),'GIVE YOURSELF TIME',{y:260,size:80});
    // calendar pages flipping: weeks
    const wk=Math.floor(clamp((T-at(179,0))/2.4)*12)+1;pop(at(179,0),700,560,()=>{box(560,420,280,300,{r:20,op:.9});add(`<rect x="560" y="420" width="280" height="64" rx="20" fill="#fff" fill-opacity=".9"/>`);label(700,462,'WEEK',{size:20,op:1,fill:'#000',weight:800});label(700,640,String(Math.min(wk,12)),{size:110,op:1,weight:800,sp:0,glow:true});},{snd:'pop'});
    pop(at(179,1),1000,450,()=>pillShape(1000,430,"DON'T QUIT YET",{size:20,dark:true}),{vol:.4});
    fadeIn(at(180,0),()=>{box(1100,420,520,140,{r:20,op:1});label(1360,505,'BUILDING A FUTURE',{size:26,op:1,weight:800,glow:true});
      box(1100,600,520,120,{r:20,op:.4,glow:false});label(1360,672,'A TEMPORARY FEELING',{size:22,op:.45,weight:800});strike(1170,1550,664,P(T,at(180,1.6),.4));});cue('nope',at(180,1.6),.35);});
  if(T>o){big(at(181,-.1),"IT DOESN'T HAVE TO BE PERFECT",{y:250,size:70,vol:.4});
    const path='M120,780 C 300,700 380,860 560,800 S 820,700 960,760 S 1240,860 1400,740 S 1700,700 1820,640';drawPath(path,eo(P(T,at(181,.2),1.4)),{sw:4,glow:'glowS'});
    const u=clamp((T-at(182,0))/Math.max(2,L[182].e-L[182].s+.8));const x=lerp(120,1820,u);const y=lerp(780,640,u)+Math.sin(u*14)*40*(1-u*.5);person(x,y-6,.8,{spot:.6,ring:false,bob:Math.abs(Math.sin(T*12))*5,arm:[50,-30]});
    pill(at(182,.3),960,400,'JUST KEEP MOVING FORWARD',{size:26});}
},{zoom:.025});

/* ================= CONCLUSION ================= */
B(183,188,()=>{
  bokeh(BK,T);head(at(183,-.3),'I WANT YOU TO THINK ABOUT SOMETHING',{outAt:at(184,-.2)});
  head(at(184,-.1),'FIVE YEARS FROM NOW');
  const pts=[[200,840],[520,760],[820,700],[1120,600],[1440,520],[1700,440]];
  drawPath('M'+pts.map(p=>p.join(',')).join(' L'),eio(P(T,at(184,0),1.6)),{sw:4,glow:'glowS'});
  person(1700,440,1.05,{spot:true,arm:T>at(184,1.6)?[-70,-8]:null,ring:false});
  label(200,880,'TODAY',{size:16,op:.6});orb(200,840,7);
  [[185,'OPPORTUNITIES TAKEN'],[186,'DIFFICULT THINGS OVERCOME'],[187,'HABITS BUILT'],[188,"THE DAYS YOU DIDN'T GIVE UP"]].forEach(([i,tx],k)=>{const p=pts[k+1];pop(at(i,.1),p[0],p[1],()=>{orb(p[0],p[1],8);pillShape(p[0]-20,p[1]-80-(k%2)*40,tx,{size:16,dark:true});},{snd:'win',vol:.35});});
},{zoom:.025});
B(189,189,()=>{
  bokeh([[960,500,420,.07]],T);head(at(189,-.3),'YOUR POTENTIAL');
  ground(G,1);const p=eio(P(T,at(189,.4),2.6));personOutline(960,G,1+2.4*p,.9);person(960,G,1,{spot:true});
  add(`<circle cx="960" cy="${G-200-220*p}" r="${200+260*p}" fill="url(#bk)" fill-opacity="${.08*p}"/>`);
  pill(at(189,2.8),960,190,'IF YOU TOOK IT SERIOUSLY',{size:22});
},{zoom:.03});
B(190,194,()=>{
  bokeh(BK,T);head(at(190,-.3),'BUT YOU HAVE TO ACCEPT SOMETHING');
  const items=[[191,'MAKE YOUR','DECISIONS','key'],[192,'DO THE WORK','FOR YOU','gear'],[193,'GUARANTEE','IT WILL BE EASY','shield']];
  const o=at(194,-.1);
  items.forEach(([i,a,b,ic],k)=>{const x=560+k*400,y=500;pop(at(i,.1),x,y,()=>{g(`opacity="${T>o?lerp(1,.3,P(T,o,.4)):1}"`,()=>{box(x-170,y-170,340,340,{r:24,op:.9});label(x,y-120,'NOBODY CAN',{size:16,op:.6});icon(ic,x,y-30,1.2);label(x,y+70,a,{size:20,op:1,weight:800});label(x,y+100,b,{size:20,op:1,weight:800});});},{snd:'pop',vol:.5});});
  pop(at(194,.2),960,820,()=>{pillShape(960,820,'YOU CONTROL WHAT YOU DO NEXT',{size:26});},{snd:'hit',vol:.7});ring(960,820,at(194,.3),{r0:200,r1:560});
},{zoom:.025});
B(195,197,()=>{
  bokeh(BK,T);head(at(195,-.3),'STOP WAITING…');you(-9,{arm:[60,-10]});
  checklist([{t:at(195,0),text:'FOR PERMISSION',mark:at(195,1.6)},{t:at(196,0),text:'UNTIL YOU FEEL READY',mark:at(196,1.1)},{t:at(197,0),text:'"I HAVE PLENTY OF TIME"',mark:at(197,2.2)}],{x:700,y:360,w:960,rowH:140,t0:at(195,-.2)});
},{zoom:.03});
B(198,200,()=>{
  bokeh(BK,T);
  const sx=380,sy=G+20,n=7,w=180,h=86;add(`<path d="${stairsPath(sx,sy,n,w,h)}" stroke="#fff" stroke-width="4" fill="none" filter="url(#glow)"/>`);
  [[198,'TAKE THE FIRST STEP'],[199,'THEN TAKE ANOTHER'],[200,'AND KEEP GOING']].forEach(([i,tx],k)=>pill(at(i,0),620,260,tx,{size:26,dark:k<2,outAt:k<2?at(i+1,-.05):null}));
  const steps=T<at(199)?clamp((T-at(198,.4))/.5):(T<at(200)?1+clamp((T-at(199,.3))/.5):2+clamp((T-at(200,.2))/1.8)*(n-2));
  const i=Math.floor(steps),f=steps-i;const sp=k=>k<0?[sx-60,sy]:[sx+(k+.5)*w,sy-(k+1)*h];const[ax,ay]=sp(i-1),[bx,by]=sp(Math.min(n-1,i));
  const[px,py]=i>=n?sp(n-1):hopTo(ax,ay,bx,by,f,44);person(px,py,.9,{spot:.8,ring:false,arm:i>=n?[40,-70]:null});
  cue('hop',at(198,.4),.6);cue('hop',at(199,.3),.6);for(let k=0;k<n-2;k++)cue('hop',at(200,.2)+k*1.8/(n-2),.4);
  if(i>=n)ring(px,py-80,at(200,2.1));
},{zoom:.03});
B(201,202,()=>{
  bokeh(BK,T);
  const o=at(202,-.15);
  if(T<o+.4)g(`opacity="${1-P(T,o,.4)}"`,()=>{head(at(201,-.3),"THE GOAL ISN'T TO BEAT EVERYONE ELSE");ground(G,1);
    for(let k=0;k<6;k++){const x=lerp(300,1500,((T*.12+k/6)%1));person(x,G,.7,{op:.5,ring:false,bob:Math.abs(Math.sin(T*12+k))*5});}
    pill(at(201,1.6),960,300,'BETTER THAN EVERYONE ELSE',{size:24,dark:true});pop(at(201,2.6),960,300,()=>strike(700,1220,300,P(T,at(201,2.6),.3)),{snd:'nope',vol:.4});});
  if(T>o){head(at(202,-.1),"IT'S TO BE BETTER THAN YESTERDAY");ground(G,1);
    personOutline(860,G,1,.5);label(860,G+56,'YESTERDAY',{size:16,op:.5});
    const s=P(T,at(202,.3),.8);person(lerp(860,1060,eio(s)),G,1.05,{spot:true,arm:s>=1?[50,-70]:null});label(1060,G+56,'TODAY',{size:16,op:.7});
    pill(at(202,1.4),960,300,'BETTER THAN WHO YOU WERE',{size:26});}
},{zoom:.03});
B(203,203,()=>{
  bokeh(BK,T);head(at(203,-.3),'ONE DAY YOU’LL LOOK BACK…');
  const cx=1400,cy=480;const u=P(T,at(203,.6),Math.max(3,L[203].e-L[203].s-.8));
  // the dream life (house + star) built from small decisions flowing in from the figure
  const n=90;let d='';for(let k=0;k<n;k++){const ph=((T*.6+k/n)%1);if(k/n>u)continue;const x=lerp(520,cx,ph),y=lerp(G-120,cy,ph)-Math.sin(ph*Math.PI)*120+Math.sin(k*3.1)*20;d+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="#fff" fill-opacity="${.6*(1-ph)+.2}"/>`;}add(d);
  add(`<g opacity="${.25+.75*u}">`);icon('house',cx,cy,2.6*(.4+.6*u));add('</g>');add(`<circle cx="${cx}" cy="${cy}" r="${160+80*u}" fill="url(#bk)" fill-opacity="${.12*u}"/>`);
  fadeIn(at(203,2),()=>label(cx,cy+170,'THE LIFE YOU DREAMED ABOUT',{size:20,op:.9,weight:800}));
  ground(G,1);person(480,G,1,{spot:true});
  fadeIn(at(203,5.2),()=>label(480,G+56,'SMALL DECISIONS · WHEN NOBODY WAS WATCHING',{size:15,op:.7}));
},{zoom:.03});
// finale: tiles of small decisions assemble the next version + title
const TILES=(()=>{const out=[],s=30,cx=960,hy=380,hr=80,bx0=850,bx1=1070,by0=490,by1=820,rr=55;let seed=7;const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280;};
  for(let y=hy-hr;y<=by1;y+=s)for(let x=bx0-40;x<=bx1+40;x+=s){const px=x+s/2,py=y+s/2;let inside=Math.hypot(px-cx,py-hy)<=hr-3;
    if(py>=by0&&py<=by1&&px>=bx0&&px<=bx1){if(py<by0+rr){const c=px<bx0+rr?bx0+rr:(px>bx1-rr?bx1-rr:px);inside=Math.hypot(px-c,py-(by0+rr))<=rr||(px>=bx0+rr&&px<=bx1-rr);}else inside=true;}
    if(inside)out.push({x:px,y:py,sx:80+rnd()*1760,sy:80+rnd()*920,d:rnd()});}return out;})();
B(204,206,()=>{
  bokeh([[960,560,420,.07],[260,900,160,.035],[1660,240,140,.035]],T);
  const a=at(204),c=at(206);
  head(a-.3,'YOUR NEXT VERSION IS WAITING',{y:120,outAt:c-.3});
  TILES.forEach(t=>{const t0=a+.2+t.d*2.2,q=P(T,t0,.6);if(q<=0){add(`<g opacity="${.3*P(T,a-.2,.4)}"><rect x="${t.sx-12}" y="${t.sy-12}" width="24" height="24" rx="4" fill="#0b0b0b" stroke="#fff" stroke-width="2"/></g>`);return;}
    const e=eio(q),x=lerp(t.sx,t.x,e),y=lerp(t.sy,t.y,e);add(`<rect x="${x-12}" y="${y-12}" width="24" height="24" rx="4" fill="${q<1?'#0b0b0b':'#f2f2f2'}" stroke="#fff" stroke-width="2" fill-opacity="${q<1?1:.92}"/>`);});
  for(let k=0;k<14;k++)cue('brick',a+.4+k*.15,.3);
  const done=P(T,a+2.8,.6);if(done>0)add(`<ellipse cx="960" cy="600" rx="300" ry="380" fill="url(#bk)" fill-opacity="${.14*done}"/>`);
  ground(840,eo(P(T,a,.6)),{op:.4});
  pill(at(205,.2),960,930,"IT'S TIME TO GO AND BUILD IT",{size:24,outAt:c-.2});
  const pul=1+.015*Math.sin((T-c)*3);
  pop(c,960,160,()=>g(`transform="translate(960,160) scale(${pul}) translate(-960,-160)"`,()=>title(960,190,'THE NEXT VERSION.',{size:110})),{snd:'impact',d:.5});
  fadeIn(L[206].e+.6,()=>label(960,960,'SUBSCRIBE FOR MORE',{size:20,op:.55}));
},{zoom:.025});

/* ---------- assemble scenes (beats + chapter cards) ---------- */
(function(){const CH=window.CHAPTERS||[];const first={};CH.forEach(c=>{if(c.first>0)first[c.first]=c;});
  let prevEnd=0;const list=[];
  BEATS.forEach((b,k)=>{if(first[b.s]){const c=first[b.s],s0=L[b.s-1].e+.35,s1=L[b.s].s-.35;list.push({s:s0,draw:()=>chapterCard(c.tag,c.title,s0),cam:{zoom:.03},card:true});list.push({s:s1,draw:b.fn,cam:b.cam});}
    else list.push({s:k===0?0:L[b.s].s-.35,draw:b.fn,cam:b.cam});});
  list.forEach((x,k)=>{const e=k<list.length-1?list[k+1].s:END;S.push({s:x.s,e,draw:x.draw,cam:x.cam});});})();
