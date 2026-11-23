window.__G=g;
/* ============ "BECOME SO DISCIPLINED THAT MOTIVATION DOESN'T MATTER" — ~5 min documentary ============ */
const BEATS=[];function B(s,e,fn,cam={}){BEATS.push({s,e,fn,cam});}
const GG=800, AMBER='#FFB547';
const dark=[[300,250,170,.035],[1650,780,200,.03],[1500,160,110,.03]];

/* ---------- subtitles: bold white, key words in amber ---------- */
const KEY=new Set('MOTIVATION DISCIPLINE EASY FAIL FAILS TEMPORARY START DECISION DECISIONS TRUST SMALL SMALLER CONSISTENCY INTENSITY DISTRACTED DISTRACTIONS ENVIRONMENT WILLPOWER PROGRESS MOMENTUM CHOICE COMFORT VERSION PROMISES PROMISED FUTURE DO HABIT NEGOTIATING ONCE TRACK EXCUSE EXCUSES PERFECT FEELINGS DIFFERENT UNSTOPPABLE TIRED ENOUGH READY BUILD BECAME NOBODY ACTUALLY NOW'.split(' '));
const SUB=[];TIMING.lines.forEach(ln=>{const w=ln.text.split(' ');const chunks=[];let c=[];w.forEach(x=>{const len=c.join(' ').length;if(c.length>=7||len+x.length>40){chunks.push(c);c=[];}c.push(x);});if(c.length)chunks.push(c);
  const tot=w.join(' ').length;let t=ln.start;chunks.forEach(ch=>{const d=(ln.end-ln.start)*ch.join(' ').length/tot;SUB.push({s:t,e:t+d,w:ch});t+=d;});});
function subtitles(t){const s=SUB.find(x=>t>=x.s-.05&&t<x.e+.12);if(!s)return;const size=46;let html='';
  s.w.forEach((x,k)=>{const k2=x.replace(/[^A-Za-z']/g,'').toUpperCase().replace(/'S$|’S$/,'');html+=`<tspan fill="${KEY.has(k2)?AMBER:'#fff'}">${esc(x.toUpperCase())}${k<s.w.length-1?' ':''}</tspan>`;});
  add(`<text x="960" y="1020" font-size="${size}" font-weight="900" letter-spacing="2" text-anchor="middle" stroke="#000" stroke-width="7" paint-order="stroke">${html}</text>`);}

/* ---------- props ---------- */
function bed(x,g,s=1){add(`<g filter="url(#glowS)" stroke="#fff" stroke-width="4" fill="#0b0b0b"><rect x="${x-260*s}" y="${g-70*s}" width="${520*s}" height="${56*s}" rx="12"/><rect x="${x-260*s}" y="${g-170*s}" width="${28*s}" height="${170*s}" rx="8"/><rect x="${x+232*s}" y="${g-120*s}" width="${28*s}" height="${120*s}" rx="8"/></g>`);}
function sleeper(x,g,s=1,arm=null){g_(`transform="rotate(-90,${x-140*s},${g-70*s})"`,()=>person(x-140*s,g-70*s,.8*s,{ring:false,arm}));
  add(`<path d="M${x-110*s},${g-100*s} Q${x+60*s},${g-136*s} ${x+230*s},${g-104*s} L${x+230*s},${g-70*s} L${x-110*s},${g-70*s} Z" fill="#0b0b0b" stroke="#fff" stroke-width="3.5" filter="url(#glowS)"/>`);}
const g_=(a,f)=>window.__G(a,f);
function alarm(x,y,s,ringing){const sh=ringing?Math.sin(T*60)*5*s:0;icon('clock',x+sh,y,s);if(ringing)add(`<g stroke="#fff" stroke-width="3" opacity=".7" fill="none">${[0,1].map(i=>`<path d="M${x+48*s+i*14},${y-40*s} q12,10 0,22"/><path d="M${x-48*s-i*14},${y-40*s} q-12,10 0,22"/>`).join('')}</g>`);}
function phoneGlow(x,y,s=1){add(`<circle cx="${x}" cy="${y}" r="${90*s}" fill="url(#bk)" fill-opacity=".22"/>`);icon('phone',x,y,s);}
function deskL(x,g,lamp=true){add(`<g filter="url(#glowS)" stroke="#fff" stroke-width="4" fill="#0b0b0b"><rect x="${x-190}" y="${g-160}" width="380" height="20" rx="6"/><line x1="${x-170}" y1="${g-140}" x2="${x-170}" y2="${g}"/><line x1="${x+170}" y1="${g-140}" x2="${x+170}" y2="${g}"/></g>`);
  if(lamp){add(`<path d="M${x+130},${g-160} L${x+130},${g-280} L${x+80},${g-320}" stroke="#fff" stroke-width="4" fill="none"/><path d="M${x+40},${g-330} L${x+120},${g-310} L${x+90},${g-270} Z" fill="#fff"/><polygon points="${x+60},${g-290} ${x+100},${g-280} ${x+20},${g-160} ${x-120},${g-160}" fill="url(#cone)" opacity=".7"/>`);}}
function door(x,g,open=0,label_=null){add(`<rect x="${x-90}" y="${g-300}" width="180" height="300" fill="#141414" stroke="#fff" stroke-width="4" filter="url(#glowS)"/>`);if(open>0)add(`<rect x="${x-90}" y="${g-300}" width="${180*open}" height="300" fill="#fff" fill-opacity="${.55*open}"/>`);else add(`<circle cx="${x+60}" cy="${g-150}" r="7" fill="#fff"/>`);if(label_)label(x,g-320,label_,{size:16,op:.7});}
function rain(op=1){let d='';for(let k=0;k<90;k++){const x=((k*97+T*90)%2100)-80,y=((k*233+T*900)%1200)-60;d+=`<line x1="${x}" y1="${y}" x2="${x-10}" y2="${y+34}"/>`;}add(`<g stroke="#fff" stroke-opacity="${.28*op}" stroke-width="2">${d}</g>`);}
function windowNight(x,y,warm=0){add(`<rect x="${x-120}" y="${y-90}" width="240" height="180" rx="8" fill="${warm>0?'#2a1c0c':'#0a0a0a'}" stroke="#fff" stroke-width="4" filter="url(#glowS)"/><line x1="${x}" y1="${y-90}" x2="${x}" y2="${y+90}" stroke="#fff" stroke-width="3"/><line x1="${x-120}" y1="${y}" x2="${x+120}" y2="${y}" stroke="#fff" stroke-width="3"/>`);
  if(warm<=0){icon('moon',x-60,y-45,.45,.7);}else add(`<circle cx="${x+40}" cy="${y+60}" r="${50*warm}" fill="${AMBER}" opacity="${.6*warm}" filter="url(#blur12)"/>`);}
function shoe(x,y,s=1){add(`<path d="M${x-40*s},${y} L${x-40*s},${y-26*s} Q${x-10*s},${y-30*s} ${x},${y-18*s} L${x+40*s},${y-10*s} Q${x+50*s},${y-4*s} ${x+48*s},${y} Z" fill="#0b0b0b" stroke="#fff" stroke-width="3.5" filter="url(#glowS)"/>`);}
function barbell(x,y,s=1){add(`<g filter="url(#glowS)" stroke="#fff" stroke-width="5" fill="#0b0b0b"><line x1="${x-130*s}" y1="${y}" x2="${x+130*s}" y2="${y}"/><rect x="${x-120*s}" y="${y-40*s}" width="${22*s}" height="${80*s}" rx="5"/><rect x="${x+98*s}" y="${y-40*s}" width="${22*s}" height="${80*s}" rx="5"/></g>`);}
function wave(x0,y0,w,h,u,fn,o={}){return curve(fn,x0,y0,w,h,u,o);}
function stepCard(n,title,t0){const p=P(T,t0,.35),o=1-P(T,t0+2.0,.4);if(p<=0||o<=0)return;add(`<g opacity="${Math.min(p,o)}">`);
  add(`<rect x="0" y="80" width="1920" height="130" fill="#000" opacity=".6"/>`);label(960,128,`STEP ${n}`,{size:24,op:.7});title_(960,190,title,{size:52});add('</g>');cue('impact',t0,.35);}
function title_(x,y,t,o){title(x,y,t,o);}
function onText(t0,t1,lines,{y=420,size=74}={}){const p=P(T,t0,.5)*(1-P(T,t1-.4,.4));if(p<=0)return;add(`<g opacity="${p}"><rect x="0" y="${y-size*1.2}" width="1920" height="${lines.length*size*1.15+size*.8}" fill="#000" opacity=".55"/>`);lines.forEach((l2,i)=>title(960,y+i*size*1.15,l2,{size}));add('</g>');}
function promiseRow(x,y,txt,done){box(x-190,y-45,380,90,{r:16,op:.85});label(x-20,y+8,txt,{size:20,op:1,weight:900});if(done>0)check(x+160,y,1*back(done));}
function meter(x,y,w,v,lab){label(x,y-16,lab,{size:16,op:.75,anchor:'start',weight:900});add(`<rect x="${x}" y="${y}" width="${w}" height="26" rx="13" fill="none" stroke="#fff" stroke-width="2.5"/><rect x="${x+5}" y="${y+5}" width="${Math.max(16,(w-10)*clamp(v))}" height="16" rx="8" fill="#fff"/>`);}
function timeTag(x,y,txt){label(x,y,txt,{size:30,op:.9,weight:900,sp:.12});}

/* ================= SCENE 1 — THE HOOK ================= */
B(0,3,()=>{bokeh(dark,T);const g=GG;ground(g,1,{op:.4});windowNight(1500,330);timeTag(260,170,'6:00 AM');
  bed(760,g);const ring_=T<at(0,1.3);const off=P(T,at(0,1.1),.3);sleeper(760,g,1,T>at(0,.6)&&T<at(0,1.6)?[30,-70]:(T>at(1,0)?[46,-30]:null));
  alarm(1120,g-90,1,ring_);for(let k=0;k<4;k++)cue('tick',.1+k*.18,.6);
  if(T>at(1,-.2)){phoneGlow(700,g-200,.6);}
  // what motivation feels like: easy dreams above the bed
  [[1,'NEW GOALS','target',560],[2,'TOMORROW = DIFFERENT','calendar',960],[3,'THE NEW ME','star',1360]].forEach(([i,tx,ic,x])=>pop(at(i,.2),x,350,()=>{add(`<g opacity=".85">`);icon(ic,x,330,.9);pillShape(x,420,tx,{size:16,dark:true});add('</g>');},{snd:'pop',vol:.3}));
  head(at(0,-.5),'MOTIVATION IS EASY',{y:150,size:26});
},{zoom:.04});
B(4,8,()=>{bokeh(dark,T);const g=GG;ground(g,1,{op:.4});
  // left: motivation (in bed scrolling) — right: discipline (up, trainers on, out the door)
  add(`<line x1="960" y1="240" x2="960" y2="${g+20}" stroke="#fff" stroke-opacity=".25" stroke-width="2" stroke-dasharray="10 10"/>`);
  bed(480,g,.8);sleeper(480,g,.8,[40,-30]);phoneGlow(440,g-170,.5);zzz(330,g-200,.5);
  const up=P(T,at(4,.4),1.2);person(lerp(1260,1300,up),g,1,{spot:.7,arm:T>at(5)?[60,-60]:[40,40],arm2:T>at(5)?[-60,-60]:[-40,40]});shoe(1200,g-6,.9);shoe(1300,g-6,.9);
  if(T>at(6))door(1700,g,P(T,at(6),.6),'OUT');
  pillShape(480,300,'MOTIVATION',{size:22,dark:true});pillShape(1440,300,'DISCIPLINE',{size:22});
  [[4,'bed?','',480],[5,'dumbbell','',480],[6,'book','',480]].forEach(([i,ic],j)=>pop(at(i,.1),300+j*180,430,()=>{icon(ic==='bed?'?'couch':ic,300+j*180,430,.7);qmark(300+j*180+50,400,36,.8);},{vol:.3}));
  const fl=P(T,at(7,.1),.6);if(fl>0)add(`<rect x="0" y="230" width="958" height="620" fill="#000" opacity="${.45*fl}"/>`);
  onText(at(8,-.1),at(8)+4.5,['ONE RELIES ON MOTIVATION.','THE OTHER RELIES ON DISCIPLINE.'],{y:560,size:60});
},{zoom:.03});

/* ================= SCENE 2 — THE PROBLEM WITH MOTIVATION ================= */
B(9,12,()=>{bokeh(dark,T);const g=GG;ground(g,1,{op:.4});windowNight(1600,320);timeTag(260,170,'11:48 PM');
  add(`<rect x="560" y="${g-330}" width="300" height="190" rx="14" fill="#0b0b0b" stroke="#fff" stroke-width="4" filter="url(#glowS)"/><circle cx="710" cy="${g-235}" r="120" fill="url(#bk)" fill-opacity=".25"/>`);icon('play',710,g-235,1.1);label(710,g-110,'MOTIVATIONAL VIDEO',{size:14,op:.6});
  const ex=T>at(11);person(1000,g,1,{spot:.8,arm:ex?[44,-88]:[30,-30],arm2:ex?[-44,-88]:null});
  // the motivation wave: comes and goes
  fadeIn(at(10,-.2),()=>{box(1220,420,560,220,{r:18,op:.5});label(1240,450,'MOTIVATION',{size:15,op:.6,anchor:'start'});wave(1250,610,500,140,P(T,at(10),3),v=>.5+.45*Math.sin(v*Math.PI*4),{sw:4});});
  if(T>at(12)){pop(at(12,.3),1220,300,()=>{box(1100,200,240,200,{r:14,op:.9});label(1220,230,'NEW ROUTINE',{size:14,op:.6});for(let k=0;k<4;k++){const p=P(T,at(12,.5)+k*.4,.3);if(p>0)add(`<line x1="1130" y1="${265+k*32}" x2="${1130+170*p}" y2="${265+k*32}" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`);}},{snd:'pop',vol:.35});
    pop(at(12,2.6),1520,300,()=>bubble(1520,300,300,'EVERYTHING CHANGES',{size:16}),{vol:.35});}
},{zoom:.035});
B(13,17,()=>{bokeh(dark,T);const g=GG;ground(g,1,{op:.4});windowNight(1600,320,.0);timeTag(260,170,'6:00 AM — THE NEXT DAY');
  bed(760,g);const turn=T>at(16);sleeper(760,g,1,turn?null:[30,-50]);alarm(1120,g-90,1,T<at(13,1.2));zzz(560,g-220,.7);
  add(`<g opacity="${T>at(15)?.5:1}">`);shoe(1350,g-6,.9);barbell(1500,g-40,.6);label(1430,g+50,'GYM CLOTHES',{size:14,op:.55});add('</g>');
  [[14,'TIRED',380,380],[15,'DISTRACTED',760,330],[16,'NOT INSPIRED',1140,380]].forEach(([i,tx,x,y])=>pill(at(i,.05),x,y,tx,{size:20,dark:true}));
  if(T>at(15))pop(at(15,.1),900,g-210,()=>{phoneGlow(900,g-210,.5);},{vol:.3});
  if(T>at(17)){[['TRAIN','',0],['STUDY','',1],['BUILD','',2]].forEach(([tx,_,j])=>{const x=560+j*400;const c=P(T,at(17,.6)+j*.35,.4);add(`<g opacity="${1-.6*c}">`);box(x-130,520,260,80,{r:14,op:.8});label(x,568,'PROMISE: '+tx,{size:16,op:1,weight:900});
    if(c>0)add(`<path d="M${x-6},520 L${x+10},545 L${x-8},575 L${x+6},600" stroke="#fff" stroke-width="4" fill="none"/>`);add('</g>');cue('ting',at(17,.6)+j*.35,.3);});}
},{zoom:.03});
B(18,20,()=>{bokeh(dark,T);const g=GG;
  // calendar days pass; goals stay unfinished; storm rolls in
  const day=Math.min(30,1+Math.floor(P(T,at(18),5)*29));pop(at(18,-.1),520,470,()=>{box(360,290,320,340,{r:18,op:.9});add(`<rect x="360" y="290" width="320" height="70" rx="18" fill="#fff" fill-opacity=".9"/>`);label(520,336,'DAY',{size:22,op:1,fill:'#000',weight:900});label(520,520,String(day),{size:120,op:1,weight:900,sp:0});},{snd:'pop',vol:.4});
  for(let k=0;k<Math.min(10,day/3);k++)cue('tick',at(18)+k*.5,.2);
  box(860,300,620,330,{r:18,op:.5});label(1170,340,'GOALS',{size:18,op:.7,weight:900});['GET FIT','LEARN A SKILL','START THE BUSINESS'].forEach((tx,j)=>{const y=400+j*70;add(`<rect x="900" y="${y-20}" width="36" height="36" rx="6" fill="none" stroke="#fff" stroke-width="3"/>`);label(960,y+8,tx,{size:22,op:.7,weight:800,anchor:'start'});});
  if(T>at(20,-.3)){const st=P(T,at(20,-.3),.8);rain(st);add(`<rect width="${W}" height="${H}" fill="#000" opacity="${.25*st}"/>`);cue('wind',at(20,-.3),.6);}
  person(1660,g,.9,{spot:.4,op:.7});ground(g,1,{op:.4});
  onText(at(18,1.0),at(20)+2.4,['MOTIVATION IS TEMPORARY.'],{y:760,size:66});
},{zoom:.03});

/* ================= SCENE 3 — WHAT DISCIPLINE MEANS ================= */
B(21,22,()=>{bokeh([[960,520,420,.06]],T);const g=GG;ground(g,1,{op:.45});rain(.8);
  big(at(21,-.1),'DISCIPLINE',{y:250,size:120,vol:.6});
  // running in the rain
  const u=(T-at(21))*.35;const x=lerp(200,1700,clamp(u/ (L[22].e-L[21].s)*1.2)),bob=Math.abs(Math.sin(T*12))*10;person(x,g-bob,1,{spot:.8,ring:false,arm:[60,-40],arm2:[-50,-10]});
  for(let k=0;k<3;k++){const ph=(T*2+k/3)%1;add(`<circle cx="${x-60-ph*60}" cy="${g-4}" r="${4+ph*8}" fill="none" stroke="#fff" stroke-opacity="${.5*(1-ph)}" stroke-width="2"/>`);}
  fadeIn(at(22,.2),()=>label(960,330,"DOING WHAT NEEDS TO BE DONE — EVEN WHEN YOU DON'T FEEL LIKE IT",{size:22,op:.85,weight:800}));
},{zoom:.04});
B(23,25,()=>{bokeh(dark,T);const g=GG;
  // montage: empty gym -> studying alone late -> phone away; a cut each line
  const c=T<at(24,-.15)?0:(T<at(25,-.15)?1:2);const k0=[at(23),at(24),at(25)][c];const zp=1+.05*(1-eo(P(T,k0-.15,.4)));
  g_(`transform="translate(960,540) scale(${zp}) translate(-960,-540)"`,()=>{ground(g,1,{op:.4});
    if(c===0){for(let k=0;k<4;k++)add(`<rect x="${300+k*380}" y="${g-260}" width="120" height="260" rx="8" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>`);label(1600,300,'GYM · 9:42 PM',{size:18,op:.6});
      const lift=Math.sin(T*3)>0;person(960,g,1.1,{spot:true,arm:[110,lift?-110:-40],arm2:[-110,lift?-110:-40]});barbell(960,g-78*1.1+22*1.1+(lift?-110:-40)*1.1,1.15);
      [600,1320].forEach(x=>person(x,g,.6,{op:.12,ring:false}));pill(at(23,.6),960,330,'WHEN YOU\'D RATHER STAY HOME',{size:20,dark:true});}
    if(c===1){windowNight(1550,330,0);[0,1,2].forEach(j=>{const ph=(T*.7+j/3)%1;add(`<text x="${1480+j*50}" y="${330-ph*30}" font-size="22" fill="#fff" opacity="${(1-ph)*.6}">♪</text>`);});label(1550,450,'FRIENDS OUT',{size:14,op:.55});
      deskL(860,g);icon('book',820,g-190,.9);person(620,g,1,{spot:.6,arm:[110,-50]});timeTag(260,170,'1:13 AM');pill(at(24,.6),860,330,'STUDYING ALONE',{size:20,dark:true});}
    if(c===2){deskL(1100,g);add(`<rect x="1000" y="${g-240}" width="200" height="90" rx="8" fill="#0b0b0b" stroke="#fff" stroke-width="3"/>`);
      const d=P(T,at(25,.6),.8);const px=lerp(860,560,eio(d)),py=lerp(g-200,g-60,eio(d));if(d<1){phoneGlow(px,py,.6);}else{add(`<rect x="460" y="${g-80}" width="200" height="80" rx="8" fill="#0b0b0b" stroke="#fff" stroke-width="3"/>`);label(560,g+40,'DRAWER',{size:14,op:.55});}
      person(lerp(780,900,P(T,at(25,1.6),.6)),g,1,{spot:.7,arm:d<1?[-60,-30]:[100,-40]});pill(at(25,1.8),1100,330,'BACK TO WORK',{size:20});}});
},{zoom:.02});
B(26,30,()=>{bokeh(dark,T);const g=GG;ground(g,1,{op:.4});
  const o=at(28,-.2);
  if(T<o+.4)g_(`opacity="${1-P(T,o,.4)}"`,()=>{head(at(26,-.2),"HERE'S SOMETHING IMPORTANT",{y:160});
    // not perfect: a tracker with a few misses
    const miss=[5,13,19];for(let d=0;d<21;d++){const c=d%7,r=Math.floor(d/7),x=640+c*110,y=330+r*130;fadeIn(at(27,-.1)+d*.05,()=>{box(x-44,y-44,88,88,{r:12,op:miss.includes(d)?.3:.8,glow:false});if(miss.includes(d))cross(x,y,.5,.4,1);else check(x,y,.85);},{d:.2,dy:6});}
    pill(at(27,.8),960,760,'NOT PERFECT — CONSISTENT',{size:22,dark:true});});
  if(T>o){fadeIn(o,()=>{box(260,250,1400,440,{r:20,op:.45});axes(320,640,1280,340,{xl:'TIME'});
    wave(320,640,1280,340,P(T,at(28,.1),2.6),v=>.5+.3*Math.sin(v*31)*Math.sin(v*7)+.05*Math.sin(v*90),{sw:3,op:.5,glow:null});label(420,300,'TEMPORARY FEELINGS',{size:18,op:.55,anchor:'start'});
    const tip=wave(320,640,1280,340,P(T,at(28,.5),2.4),v=>.18+.7*v,{sw:7});if(tip)orb(tip[0],tip[1],9);label(1560,320,'LONG-TERM DECISIONS',{size:20,op:1,anchor:'end',weight:900});});
    if(T>at(29,-.1)){const sl=eo(P(T,at(29,-.1),.5));add(`<rect x="0" y="0" width="1920" height="1080" fill="#000" opacity="${.7*sl}"/>`);
      add(`<line x1="760" y1="${g-200}" x2="760" y2="${g}" stroke="#fff" stroke-width="6" stroke-dasharray="14 10" opacity="${sl}"/>`);label(760,g-220,'START',{size:22,op:sl,weight:900});
      const go=P(T,at(30,.4),1.4);person(lerp(600,1300,eio(go)),g-(go>0&&go<1?Math.abs(Math.sin(T*14))*8:0),1.05,{spot:sl,ring:false,arm:go>0?[60,-50]:null});
      onText(at(30,.6),at(30)+3.6,["DO IT EVEN WHEN YOU DON'T FEEL LIKE IT."],{y:300,size:60});}}
},{zoom:.03});

/* ================= SCENE 4 — HOW TO BUILD DISCIPLINE ================= */
B(31,36,()=>{bokeh(dark,T);const g=GG;ground(g,1,{op:.4});stepCard(1,'STOP NEGOTIATING WITH YOURSELF',at(31,-.2));
  const o=at(34,-.2);
  if(T<o+.4)g_(`opacity="${1-P(T,o,.4)}"`,()=>{timeTag(260,280,'6:00 AM');bed(760,g);const up=P(T,at(33,.2),.7);
    if(up<=0){sleeper(760,g,1,[60,-40]);add(`<rect x="1060" y="${g-150}" width="160" height="70" rx="12" fill="#0b0b0b" stroke="#fff" stroke-width="3" filter="url(#glowS)"/>`);label(1140,g-106,'SNOOZE',{size:18,op:.9,weight:900});alarm(1140,g-220,.8,true);
      [['5 MORE MINUTES?',560,380],['DO I FEEL LIKE IT?',1300,420]].forEach(([tx,x,y],j)=>{if(T>at(32,.3+j*.8)){bubble(x,y,330,tx,{size:18});cross(x,y,1.4,.9,P(T,at(33,-.2)+j*.12,.25));}});}
    else{person(lerp(760,980,eio(up)),g,1.05,{spot:.8,arm:up>=1?[50,-80]:null});pill(at(33,.6),980,380,'ALREADY DECIDED',{size:24});}
    cue('nope',at(33,-.2),.4);});
  if(T>o){[['book','STUDYING'],['dumbbell','EXERCISING'],['target','YOUR GOALS']].forEach(([ic,tx],j)=>{const x=560+j*400;pop(at(34,.1)+j*.35,x,420,()=>{box(x-150,300,300,240,{r:20,op:.85});icon(ic,x,390,1.1);label(x,500,tx,{size:20,op:1,weight:900});},{vol:.35});});
    pop(at(35,.2),960,640,()=>{add(`<rect x="660" y="590" width="600" height="100" rx="14" fill="none" stroke="#fff" stroke-width="7" filter="url(#glow)" transform="rotate(-4,960,640)"/>`);title(960,660,'DECIDE ONCE.',{size:64});},{snd:'impact',vol:.5,outAt:at(36,-.1)});
    if(T>at(36,-.1)){fadeIn(at(36,-.1),()=>{['WAKE UP AT SIX','TRAIN TODAY','STUDY 20 MIN'].forEach((tx,j)=>{const x=560+j*400;promiseRow(x,640,tx,P(T,at(36,.6)+j*.6,.3));cue('win',at(36,.6)+j*.6,.25);});meter(660,720,600,P(T,at(36,.6),3),'SELF-TRUST');});}}
},{zoom:.025});
B(37,45,()=>{bokeh(dark,T);const g=GG;ground(g,1,{op:.4});stepCard(2,'MAKE YOUR GOALS SMALLER',at(37,-.2));
  const o1=at(40,-.2),o2=at(44,-.2);
  if(T<o1+.4)g_(`opacity="${1-P(T,o1,.4)}"`,()=>{// overwhelming pile + impossible routine + burnout
    for(let k=0;k<12;k++)add(`<rect x="${700+(k%2)*14}" y="${g-48-k*44}" width="260" height="40" rx="5" fill="#0b0b0b" stroke="#fff" stroke-width="3" transform="rotate(${(k%3-1)*2},${830},${g-28-k*44})"/>`);label(830,g-590,'CHANGE EVERYTHING OVERNIGHT',{size:16,op:.6});
    const burn=P(T,at(39,1.4),.8);person(480,g,1,{spot:.6,op:1-.3*burn,arm:burn>0?[30,58]:[40,-80],arm2:burn>0?[-30,58]:[-40,-80]});
    if(T>at(39)){box(1180,300,480,340,{r:16,op:.6});label(1420,335,'MY NEW ROUTINE',{size:16,op:.6});for(let k=0;k<8;k++)add(`<line x1="1210" y1="${370+k*32}" x2="${1210+Math.min(420,P(T,at(39)+k*.12,.2)*420+(k%3)*40)}" y2="${370+k*32}" stroke="#fff" stroke-width="3" stroke-opacity=".7"/>`);
      if(burn>0){meter(1220,690,400,1-burn,'ENERGY');pill(at(39,1.8),480,330,'BURNOUT',{size:22,dark:true});}}});
  if(T>o1&&T<o2+.4)g_(`opacity="${P(T,o1,.3)*(1-P(T,o2,.4))}"`,()=>{big(at(40,-.1),'START SMALL.',{y:330,size:96,vol:.5});
    [[41,'book','5 PAGES'],[42,'dumbbell','10 MINUTES'],[43,'clock','20 MINUTES']].forEach(([i,ic,tx],j)=>{const x=560+j*400;pop(at(i,.05),x,560,()=>{box(x-150,440,300,240,{r:20,op:.95});icon(ic,x,530,1.1);label(x,640,tx,{size:24,op:1,weight:900});},{snd:'pop',vol:.4});});
    person(1700,g,.9,{spot:.6,arm:[40,-60]});});
  if(T>o2){fadeIn(o2,()=>{box(260,250,1400,440,{r:20,op:.45});axes(320,640,1280,340,{xl:'TIME',yl:'PROGRESS'});
    const spikes=v=>Math.min(.95,(Math.floor(v*4)%2===0?(v%.25)*3.2:.05));wave(320,640,1280,340,P(T,at(44,.2),2.2),spikes,{sw:3,op:.45,glow:null});label(420,300,'INTENSITY',{size:18,op:.55,anchor:'start'});
    const tip=wave(320,640,1280,340,P(T,at(44,.6),2.2),v=>.1+.75*v,{sw:7});if(tip)orb(tip[0],tip[1],9);label(1560,330,'CONSISTENCY',{size:22,op:1,anchor:'end',weight:900});});
    if(T>at(45,-.1)){const sl=P(T,at(45,-.1),.4);add(`<rect width="1920" height="1080" fill="#000" opacity="${.75*sl}"/>`);add(`<g opacity="${sl}"><path d="${stairsPath(420,g,6,180,70)}" stroke="#fff" stroke-width="4" fill="none" filter="url(#glow)"/></g>`);
      label(560,g-110,'HABIT FIRST',{size:20,op:sl,weight:900});label(1420,g-480,'DIFFICULTY LATER',{size:20,op:sl,weight:900});
      const c=clamp((T-at(45,.3))/2.4)*6,i=Math.floor(c),f=c-i;const sp=k=>k<0?[340,g]:[420+(k+.5)*180,g-(k+1)*70];const[ax,ay]=sp(i-1),[bx,by]=sp(Math.min(5,i));const[px,py]=c<=0?[340,g]:(i>=6?sp(5):hopTo(ax,ay,bx,by,f,34));person(px,py,.85,{spot:.6*sl,ring:false,op:sl});}}
},{zoom:.025});
B(46,52,()=>{bokeh(dark,T);const g=GG;ground(g,1,{op:.4});stepCard(3,'REMOVE THE DISTRACTIONS',at(46,-.2));
  const o1=at(48,-.15),o2=at(50,-.15),o3=at(51,-.15);
  if(T<o1+.4)g_(`opacity="${1-P(T,o1,.4)}"`,()=>{deskL(960,g);icon('book',920,g-190,.9);person(720,g,1,{spot:.6,arm:[100,-40]});
    const buzz=Math.sin(T*9)>.2;phoneGlow(1100,g-200,.6);if(buzz){add(`<circle cx="1130" cy="${g-240}" r="16" fill="#fff"/>`);label(1130,g-233,String(1+Math.floor((T-at(46))*2)%9),{size:16,op:1,fill:'#000',weight:900});}
    [0,1,2].forEach(j=>{const ph=(T*1.4+j/3)%1;add(`<circle cx="1100" cy="${g-200}" r="${50+ph*90}" fill="none" stroke="#fff" stroke-opacity="${.4*(1-ph)}" stroke-width="2"/>`);});
    if(T>at(47))pill(at(47,.4),1100,380,'CONSTANTLY DEMANDING ATTENTION',{size:18,dark:true});});
  if(T>o1&&T<o2+.4)g_(`opacity="${P(T,o1,.3)*(1-P(T,o2,.4))}"`,()=>{door(1500,g,0,'ANOTHER ROOM');const mv=eio(P(T,at(48,.2),1.0));if(mv<1)phoneGlow(lerp(700,1500,mv),g-200-Math.sin(Math.PI*mv)*120,.6);
    if(T>at(49)){box(560,280,300,460,{r:36,op:.9});['play','game','people','note','chart','star'].forEach((a,k)=>{const x=640+(k%2)*140,y=390+Math.floor(k/2)*120;const del=k<4;const dq=del?P(T,at(49,.3)+k*.18,.25):0;if(dq<1){add(`<g opacity="${1-dq}"><rect x="${x-44}" y="${y-44}" width="88" height="88" rx="20" fill="#0b0b0b" stroke="#fff" stroke-width="3"/>`);icon(a,x,y,.5);add('</g>');}});label(710,780,'UNNECESSARY APPS',{size:14,op:.6});}
    person(300,g,.95,{spot:.5,arm:[60,-20]});});
  if(T>o2&&T<o3+.4)g_(`opacity="${P(T,o2,.3)*(1-P(T,o3,.4))}"`,()=>{deskL(960,g);icon('book',880,g-190,.9);icon('notebook',1000,g-196,.6);person(720,g,1,{spot:.8,arm:[100,-40]});pill(at(50,.3),960,380,'WORKSPACE READY',{size:22});});
  if(T>o3){fadeIn(o3,()=>{person(960,g,1,{spot:.7});[['book',-260],['dumbbell',-420],['notebook',-580]].forEach(([ic,d])=>icon(ic,960+d+100,g-130,.8));[['phone',300],['game',470],['couch',650]].forEach(([ic,d])=>{icon(ic,960+d+100,g-130,.8,.45);});
    label(560,g-260,'EASY TO REACH',{size:18,op:.9,weight:900});label(1490,g-260,'HARD TO REACH',{size:18,op:.6,weight:900});add(`<rect x="1300" y="${g-230}" width="380" height="200" rx="14" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="10 8"/>`);});
    if(T>at(52,-.1)){const sl=P(T,at(52,-.1),.4);add(`<rect width="1920" height="1080" fill="#000" opacity="${.78*sl}"/>`);add(`<g opacity="${sl}">`);meter(420,420,360,.22,'WILLPOWER');label(960,450,'<',{size:60,op:1,weight:900,sp:0});box(1160,330,360,240,{r:20,op:1});icon('house',1340,430,1.4);label(1340,530,'ENVIRONMENT',{size:22,op:1,weight:900});add('</g>');}}
},{zoom:.025});
B(53,57,()=>{bokeh(dark,T);const g=GG;ground(g,1,{op:.4});stepCard(4,'TRACK YOUR PROGRESS',at(53,-.2));
  const o=at(56,-.2);
  if(T<o+.4)g_(`opacity="${1-P(T,o,.4)}"`,()=>{fadeIn(at(54,-.2),()=>{label(760,280,'THIS MONTH',{size:18,op:.7,weight:900});for(let d=0;d<28;d++){const c=d%7,r=Math.floor(d/7),x=460+c*100,y=340+r*100;box(x-40,y-40,80,80,{r:10,op:.5,glow:false});if(T>at(54,.4)+d*.12)cross(x,y,.65,.95,1);}});for(let k=0;k<10;k++)cue('tick',at(54,.4)+k*.36,.2);
    if(T>at(55)){[['WORKOUT','dumbbell'],['STUDY SESSION','book'],['PRODUCTIVE MORNING','clock']].forEach(([tx,ic],j)=>{const y=380+j*120;pop(at(55,.1)+j*.7,1460,y,()=>{box(1220,y-45,480,90,{r:14,op:.9});icon(ic,1280,y,.55);label(1330,y+8,tx,{size:20,op:1,weight:900,anchor:'start'});check(1660,y,.9);},{snd:'win',vol:.3});});}});
  if(T>o){fadeIn(o,()=>{// momentum: a ball that grows as it rolls
    const u=clamp((T-o)/(L[57].e-o));const r=30+80*u,x=lerp(300,1500,u);add(`<circle cx="${x}" cy="${g-r}" r="${r}" fill="#0b0b0b" stroke="#fff" stroke-width="5" filter="url(#glowS)"/><line x1="${x}" y1="${g-r}" x2="${x+r*Math.cos(u*20)}" y2="${g-r+r*Math.sin(u*20)}" stroke="#fff" stroke-width="4"/>`);label(x,g-2*r-30,'MOMENTUM',{size:18,op:.8,weight:900});
    for(let k=0;k<8;k++){const xx=300+k*150;if(xx<x-r)add(`<circle cx="${xx}" cy="${g-6}" r="6" fill="#fff" opacity=".6"/>`);}});
    if(T>at(57)){pill(at(57,.3),960,330,'HOW FAR YOU\'VE COME',{size:22});}}
},{zoom:.025});

/* ================= SCENE 5 — THE MOMENT THAT DEFINES YOU ================= */
B(58,63,()=>{const g=GG;const flashT=[at(60),at(61),at(62)];
  // dark room: sitting, exhausted; quick flashes of the choices; then stands and walks out
  add(`<rect width="1920" height="1080" fill="#000" opacity=".35"/>`);ground(g,1,{op:.35});
  const stand=P(T,at(63,.6),.6),walk=clamp((T-at(63,1.3))/1.6);
  add(`<rect x="560" y="${g-120}" width="260" height="30" rx="8" fill="#0b0b0b" stroke="#fff" stroke-width="3"/><line x1="580" y1="${g-90}" x2="580" y2="${g}" stroke="#fff" stroke-width="3"/><line x1="800" y1="${g-90}" x2="800" y2="${g}" stroke="#fff" stroke-width="3"/>`);
  if(stand<=0){person(690,g-120,.85,{ring:false,arm:[30,40],arm2:[-30,40]});phoneGlow(870,g-150,.45);}else{person(lerp(690,1500,eio(walk)),g,1,{spot:.5,ring:false,arm:walk>0?[50,-20]:null});if(stand<1||walk<.2)add(`<rect x="830" y="${g-150}" width="70" height="30" rx="6" fill="#0b0b0b" stroke="#fff" stroke-width="3"/>`);}
  deskL(1200,g,false);icon('book',1180,g-190,.7,.6);shoe(380,g-6,.8);shoe(450,g-6,.8);door(1650,g,walk>.6?P(T,at(63,2.3),.4):0);
  head(at(58,-.2),'THE MOMENT THAT DEFINES YOU',{y:160,outAt:at(59,1)});
  // quick flashes
  [[0,'clock','THE ALARM'],[1,'notebook','THE UNFINISHED ASSIGNMENT'],[2,'phone','THE PHONE']].forEach(([j,ic,tx])=>{const p=P(T,flashT[j],.15)*(1-P(T,flashT[j]+1.2,.15));if(p>0){add(`<g opacity="${p}"><rect width="1920" height="1080" fill="#000" opacity=".8"/>`);icon(ic,960,440,3);label(960,640,tx,{size:30,op:1,weight:900});add('</g>');cue('whoosh',flashT[j],.5);}});
  if(T>at(59)&&T<at(60))pill(at(59,.2),960,300,'A CHOICE',{size:30,dark:true});
},{zoom:.02});
B(64,68,()=>{bokeh([[960,560,380,.05]],T);const g=GG;ground(g,1,{op:.4});
  const o=at(67,-.2);
  if(T<o+.4)g_(`opacity="${1-P(T,o,.4)}"`,()=>{// nobody watching: an empty stadium of seats, a lone runner at dawn
    for(let r=0;r<3;r++)for(let c=0;c<12;c++)add(`<rect x="${260+c*120}" y="${280+r*70}" width="90" height="40" rx="8" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>`);
    const bob=Math.abs(Math.sin(T*12))*8,x=lerp(300,1600,((T-at(64))/6)%1);person(x,g-bob,1,{spot:.6,ring:false,arm:[60,-40],arm2:[-50,-10]});
    [[64,'NOBODY NEEDS TO SEE IT'],[65,'NO APPLAUSE'],[66,'NOBODY KNOWS HOW HARD IT WAS']].forEach(([i,tx],j)=>pill(at(i,.05),960,560+j*0,tx,{size:24,dark:true,outAt:j<2?at(i+1,-.05):null}));});
  if(T>o&&T<at(68,-.2)+.4)g_(`opacity="${P(T,o,.3)*(1-P(T,at(68,-.2),.4))}"`,()=>{// discipline over comfort: a balance tipping
    const tilt=eio(P(T,at(67,.8),1.2))*14;add(`<line x1="960" y1="${g}" x2="960" y2="420" stroke="#fff" stroke-width="5"/>`);
    g_(`transform="rotate(${tilt},960,420)"`,()=>{add(`<rect x="560" y="417" width="800" height="7" rx="3" fill="#fff" filter="url(#glowS)"/>`);icon('couch',600,360,1.1);label(600,300,'COMFORT',{size:22,op:.7,weight:900});icon('target',1320,360,1.1);label(1320,300,'DISCIPLINE',{size:22,op:1,weight:900});});});
  if(T>at(68,-.2)){// one decision at a time: tiles assemble a new self
    head(at(68,-.2),'ONE DECISION AT A TIME',{y:170});const n=60;for(let k=0;k<n;k++){const c=k%6,r=Math.floor(k/6);const tx_=900+c*24,ty_=g-30-r*24;const t0=at(68)+k*.035;const q=P(T,t0,.3);if(q>0)add(`<rect x="${lerp(300+((k*137)%1300),tx_,eio(q))-10}" y="${lerp(300+((k*71)%300),ty_,eio(q))-10}" width="20" height="20" rx="3" fill="#f2f2f2"/>`);}
    for(let k=0;k<10;k++)cue('brick',at(68)+k*.2,.25);}
},{zoom:.025});

/* ================= SCENE 6 — THE PAYOFF (warm grade) ================= */
function warm(op){add(`<rect width="1920" height="1080" fill="${AMBER}" opacity="${.10*op}" style="mix-blend-mode:overlay"/><circle cx="1500" cy="300" r="600" fill="${AMBER}" opacity="${.07*op}" filter="url(#blur30)"/>`);}
B(69,73,()=>{const g=GG;bokeh([[1500,300,400,.06]],T);ground(g,1,{op:.45});
  // transformation montage — a cut roughly every 3-4 s
  const cuts=[at(69),at(69,3.2),at(69,6.4),at(70),at(71)];let c=0;cuts.forEach((x,i)=>{if(T>=x-.1)c=i;});const zp=1+.05*(1-eo(P(T,cuts[c]-.1,.4)));
  g_(`transform="translate(960,540) scale(${zp}) translate(-960,-540)"`,()=>{
    if(c===0){windowNight(1450,330,eio(P(T,at(69),2)));bed(760,g,.9);person(980,g,1,{spot:.8,arm:[44,-88],arm2:[-44,-88]});timeTag(260,170,'5:30 AM');}
    if(c===1){const lift=Math.sin(T*3)>0;person(960,g,1.1,{spot:true,arm:[110,lift?-110:-40],arm2:[-110,lift?-110:-40]});barbell(960,g-78*1.1+22*1.1+(lift?-110:-40)*1.1,1.15);label(960,170,'TRAINING',{size:24,op:.8,weight:900});}
    if(c===2){deskL(960,g);icon('book',920,g-190,.9);person(720,g,1,{spot:.8,arm:[100,-40]});[0,1,2].forEach(j=>pop(cuts[2]+.4+j*.5,860+j*130,420,()=>icon('bulb',860+j*130,420,.8),{snd:'pop',vol:.3}));label(960,170,'FOCUSED',{size:24,op:.8,weight:900});}
    if(c===3){add(`<rect x="1080" y="300" width="460" height="300" rx="16" fill="#0b0b0b" stroke="#fff" stroke-width="4" filter="url(#glowS)"/>`);polyline([[1120,560],[1220,520],[1310,530],[1400,440],[1500,360]],P(T,cuts[3]+.2,1.6),{sw:5});person(820,g,1.05,{spot:.8,arm:[90,-60]});label(1310,640,'THE GOAL',{size:20,op:.8,weight:900});}
    if(c===4){add(`<ellipse cx="1180" cy="520" rx="190" ry="280" fill="#0d0d0d" stroke="#fff" stroke-width="7" filter="url(#glow)"/>`);const id='c'+(uid++);add(`<clipPath id="${id}"><ellipse cx="1180" cy="520" rx="182" ry="272"/></clipPath><g clip-path="url(#${id})">`);add(`<circle cx="1180" cy="520" r="230" fill="url(#bk)" fill-opacity=".25"/>`);person(1180,770,1.2,{ring:false,arm:[44,-88],arm2:[-44,-88]});add('</g>');person(760,g,1.1,{spot:.8});
      [[71,"STOPPED MAKING EXCUSES"],[72,'KEPT GOING'],[73,'TRUSTS THEIR OWN PROMISES']].forEach(([i,tx],j)=>pop(at(i,.1),420,330+j*90,()=>pillShape(420,330+j*90,tx,{size:18}),{snd:'win',vol:.3}));}});
  warm(P(T,at(69),2));
},{zoom:.02});
B(74,79,()=>{const g=GG+40;
  // walking toward a bright sunrise
  const sr=eio(P(T,at(74),8));add(`<circle cx="960" cy="${g-60*sr}" r="${200+60*sr}" fill="${AMBER}" opacity="${.18+.2*sr}" filter="url(#blur30)"/><path d="M${960-180},${g} A180,180 0 0 1 ${960+180},${g}" fill="#fff" fill-opacity="${.6+.3*sr}" transform="translate(0,${(1-sr)*60})" filter="url(#glow)"/>`);
  for(let k=0;k<12;k++){const a=Math.PI+k*Math.PI/11;add(`<line x1="${960+220*Math.cos(a)}" y1="${g+220*Math.sin(a)}" x2="${960+(320+40*sr)*Math.cos(a)}" y2="${g+(320+40*sr)*Math.sin(a)}" stroke="#fff" stroke-opacity="${.25*sr}" stroke-width="4"/>`);}
  add(`<rect x="0" y="${g}" width="1920" height="${1080-g}" fill="#000"/>`);ground(g,1,{op:.6});add(`<path d="M760,1080 L930,${g} L990,${g} L1160,1080" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>`);
  const u=clamp((T-at(74))/14);person(lerp(960,960,u),lerp(1060,g+30,u),lerp(1.3,.55,u),{ring:false,spot:false,bob:Math.abs(Math.sin(T*9))*4});
  big(at(74,0),'STOP WAITING FOR MOTIVATION.',{y:200,size:64,outAt:at(76,-.2),vol:.4});big(at(75,0),'BUILD DISCIPLINE.',{y:300,size:84,outAt:at(76,-.2),vol:.6});
  fadeIn(at(76,0),()=>{label(960,200,"YOUR FUTURE ISN'T DECIDED BY WHAT YOU FEEL LIKE DOING",{size:26,op:.9,weight:800});},{outAt:at(78,-.3)});
  big(at(77,.3),"IT'S DECIDED BY WHAT YOU DO.",{y:300,size:66,outAt:at(78,-.3),vol:.5});
  pop(at(78),960,250,()=>title(960,280,'THE NEXT VERSION.',{size:110}),{snd:'impact',d:.5});
  fadeIn(at(79),()=>label(960,360,'YOUR NEXT CHAPTER STARTS NOW',{size:26,op:.9,weight:900}));
  // final on-screen text, then the brand card
  const fin=P(T,L[79].e+.5,.6);if(fin>0){add(`<rect width="1920" height="1080" fill="#000" opacity="${.85*fin}"/>`);add(`<g opacity="${fin}">`);title(960,470,'DISCIPLINE BUILDS THE PERSON',{size:70});title(960,560,'MOTIVATION ONLY DREAMS ABOUT.',{size:70});label(960,680,'THE NEXT VERSION',{size:28,op:.8,weight:900});add('</g>');}
  warm(1);
},{zoom:.015});

/* ---------- assemble ---------- */
(function(){const list=BEATS.map((b,k)=>({s:k===0?0:L[b.s].s-.35,draw:b.fn,cam:b.cam}));list.forEach((x,k)=>{const e=k<list.length-1?list[k+1].s:END;S.push({s:x.s,e,draw:x.draw,cam:x.cam});});})();

window.AFTER=t=>subtitles(t);
