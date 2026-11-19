/* ============ SCENES — "FAILURE / THE NEXT VERSION" ============ */
const S=[];
function scene(s,e,draw,cam={}){S.push({s,e,draw,cam});}
const l=i=>L[i].s, le=i=>L[i].e;
const B1=[[170,420,150,.05],[930,1480,190,.045],[860,300,90,.04],[120,1650,120,.035]];

/* extra primitives */
function check(x,y,s=1,op=1){add(`<g filter="url(#glowS)" opacity="${op}"><circle cx="${x}" cy="${y}" r="${18*s}" fill="#f4f4f4"/><path d="M${x-8*s},${y} l${6*s},${6*s} l${10*s},${-12*s}" stroke="#0a0a0a" stroke-width="${4*s}" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`);}
function personOutline(x,gy,s=1,op=1){const bw=32*s,bh=78*s,r=30*s;
  add(`<g opacity="${op}" filter="url(#glow)" fill="none" stroke="#fff" stroke-width="3.5" stroke-dasharray="9 7"><path d="M${x-bw},${gy} L${x-bw},${gy-bh+r} Q${x-bw},${gy-bh} ${x-bw+r},${gy-bh} L${x+bw-r},${gy-bh} Q${x+bw},${gy-bh} ${x+bw},${gy-bh+r} L${x+bw},${gy}"/><circle cx="${x}" cy="${gy-bh-34*s}" r="${25*s}"/></g>`);}
function bubble(x,y,w,txt,{size=16}={}){add(`<g filter="url(#glowS)" fill="#0b0b0b" stroke="#fff" stroke-width="3"><circle cx="${x-w/2+10}" cy="${y+70}" r="7"/><circle cx="${x-w/2+32}" cy="${y+42}" r="11"/><rect x="${x-w/2+30}" y="${y-60}" width="${w}" height="84" rx="42"/></g>`);label(x+30,y-11,txt,{size,op:.9});}
function bulb(x,y,s=1,op=1){add(`<g opacity="${op}" filter="url(#glow)" stroke="#fff" stroke-width="${4*s}" fill="#0b0b0b" stroke-linecap="round" stroke-linejoin="round"><path d="M${x-22*s},${y+18*s} C ${x-48*s},${y-4*s} ${x-40*s},${y-58*s} ${x},${y-60*s} C ${x+40*s},${y-58*s} ${x+48*s},${y-4*s} ${x+22*s},${y+18*s} L${x+20*s},${y+34*s} L${x-20*s},${y+34*s} Z"/><line x1="${x-16*s}" y1="${y+46*s}" x2="${x+16*s}" y2="${y+46*s}"/><path d="M${x-8*s},${y+16*s} L${x-8*s},${y-10*s} L${x+8*s},${y-10*s} L${x+8*s},${y+16*s}" fill="none"/></g>`);}
function xTile(x,y,s=60,op=.9){add(`<g opacity="${op}"><rect x="${x-s/2}" y="${y-s/2}" width="${s}" height="${s}" rx="${s*.18}" fill="#0b0b0b" stroke="#fff" stroke-width="3" filter="url(#glowS)"/></g>`);cross(x,y,s/80,op,1);}
function strike(x1,x2,y,p){if(p>0)add(`<line x1="${x1}" y1="${y}" x2="${lerp(x1,x2,eo(p))}" y2="${y}" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`);}

/* A — what if failing is one of the best things (L0) */
scene(0,l(1)-.25,()=>{
  const a=l(0),G=1400;
  bokeh(B1,T);
  fadeIn(a-.3,()=>label(540,470,'WHAT IF I TOLD YOU',{size:26,op:.75}));
  pop(a+1.0,540,600,()=>title(540,630,'FAILING',{size:150}),{snd:'hit'});
  fadeIn(a+2.0,()=>{label(540,720,'IS ONE OF THE BEST THINGS',{size:24,op:.8});label(540,760,'THAT CAN HAPPEN TO YOU',{size:24,op:.8});});
  // F grade card tilting, then a glowing check
  pop(a+1.4,540,1010,()=>{const r=-8+Math.sin(T*1.5)*2;g(`transform="rotate(${r},540,1010)"`,()=>{box(420,870,240,280,{r:20,op:.85});label(540,915,'GRADE',{size:16,op:.5});
    add(`<text x="540" y="1080" font-size="150" font-weight="800" fill="#fff" fill-opacity=".9" text-anchor="middle" filter="url(#glowS)">F</text>`);});});
  pop(a+3.4,650,880,()=>check(650,880,2.2),{snd:'pop'});cue('win',a+3.4,.4);
  ground(G,eo(P(T,0,.8)));person(270,G,.8,{spot:true,arm:[55,-40]});
},{zoom:.04});

/* B — think about it (L1) */
scene(l(1)-.25,l(2)-.25,()=>{
  bokeh([[540,760,260,.05],[150,1500,150,.035]],T);
  pop(l(1)-.1,540,760,()=>{title(540,760,'THINK',{size:150});title(540,900,'ABOUT IT.',{size:110});},{snd:'hit',vol:.6});
  const G=1400;ground(G,1);person(440,G,.85,{spot:true});
  pop(l(1)+.25,640,G-270,()=>bubble(640,G-270,120,'?',{size:40}),{vol:.4});
},{zoom:.05});

/* C — every time you fail, you learn something (L2) */
scene(l(2)-.25,l(3)-.25,()=>{
  const a=l(2),G=1400;
  bokeh([[760,820,240,.05],[160,1500,150,.035]],T);
  fadeIn(a-.2,()=>label(540,460,'EVERY TIME YOU FAIL',{size:26,op:.75}));
  pop(a+.1,260,820,()=>{box(140,700,240,240,{r:22,op:.8});cross(260,800,1.6,.9,1);label(260,905,'FAIL',{size:20,op:.7});});
  drawPath('M420,820 L640,820',eo(P(T,a+.5,.5)),{sw:4,glow:null,op:.7});
  fadeIn(a+.85,()=>add(`<path d="M620,800 L645,820 L620,840" stroke="#fff" stroke-opacity=".7" stroke-width="4" fill="none" stroke-linecap="round"/>`));
  pop(a+1.0,820,820,()=>{box(700,700,240,240,{r:22,op:.95});bulb(820,790,1.1);label(820,905,'LESSON',{size:20,op:.9});},{snd:'pop'});
  cue('win',a+1.1,.45);
  const rp=P(T,a+1.1,.8);if(rp>0&&rp<1)add(`<circle cx="820" cy="820" r="${120+200*eo(rp)}" fill="none" stroke="#fff" stroke-opacity="${.5*(1-rp)}" stroke-width="3"/>`);
  pill(a+1.3,540,1060,'YOU LEARN SOMETHING',{size:22});
  ground(G,1);person(540,G,.85,{spot:true,arm:[55,-20]});
},{zoom:.035});

/* D — every time you fall, stand back up (L3) */
scene(l(3)-.25,l(4)-.25,()=>{
  const a=l(3),G=1300;
  bokeh([[540,900,280,.05],[900,380,120,.035]],T);
  fadeIn(a-.2,()=>label(540,460,'EVERY TIME YOU FALL',{size:26,op:.75}));
  ground(G,1);
  // bump
  add(`<path d="M520,${G} Q560,${G-34} 600,${G}" stroke="#fff" stroke-opacity=".8" stroke-width="3.5" fill="#0b0b0b"/>`);
  const walk=P(T,a,.9), fall=P(T,a+.9,.35), up=P(T,a+2.5,.6);
  let x=lerp(250,520,walk), ang=90*eo(fall)*(1-eio(up));
  if(fall>0) x=lerp(520,600,eo(fall));
  const bob=walk<1?Math.abs(Math.sin(T*14))*8:0;
  g(`transform="rotate(${ang},${x+30},${G})"`,()=>person(x,G-bob,.9,{ring:false}));
  cue('thud',a+1.1,.7);
  fadeIn(a+1.2,()=>label(760,G-60,'FALLS: 1',{size:20,op:.6,anchor:'start'}),{outAt:a+2.4});
  if(up>=1){const rp=P(T,a+3.1,.7);add(`<circle cx="${x}" cy="${G-70}" r="${70+200*eo(rp)}" fill="none" stroke="#fff" stroke-opacity="${.6*(1-rp)}" stroke-width="3" filter="url(#glowS)"/>`);spotlight(x,G,.9,clamp(P(T,a+2.9,.5)));}
  cue('win',a+3.1,.5);
  pill(a+2.9,540,800,'STAND BACK UP',{size:24});
  fadeIn(a+3.1,()=>label(540,880,'ANOTHER OPPORTUNITY',{size:20,op:.65}));
},{zoom:.04});

/* E — most people never realise: one fail = not good enough (L4, L5) */
scene(l(4)-.25,l(6)-.25,()=>{
  const G=1400;
  bokeh([[300,800,220,.035],[900,1500,140,.03]],T);
  fadeIn(l(4)-.2,()=>label(540,430,'BUT MOST PEOPLE',{size:26,op:.75}));
  pop(l(4)+.5,540,560,()=>title(540,580,'NEVER REALISE.',{size:82}),{snd:'hit',vol:.6});
  label(150,720,'ATTEMPTS:',{size:22,op:.6,anchor:'start'});
  add(`<text x="300" y="722" font-size="38" font-weight="800" fill="#fff" filter="url(#glowS)">${T>l(5)+.5?1:0}</text>`);
  pop(l(5)+.5,540,880,()=>xTile(540,880,150),{snd:'nope'});
  pill(l(5)+1.6,540,1060,"I'M NOT GOOD ENOUGH",{size:22,dark:true});
  const dim=lerp(1,.45,eio(P(T,l(5)+1.6,1)));
  ground(G,1,{op:.45});person(540,G,.85,{spot:dim,op:dim});
},{zoom:.03});

/* F — try something hard, struggle, quit (L6) */
scene(l(6)-.25,l(7)-.25,()=>{
  const a=l(6),G=1450;
  bokeh([[760,700,220,.035],[150,1550,140,.03]],T);
  fadeIn(a-.2,()=>label(540,430,'THEY TRY SOMETHING HARD',{size:24,op:.75}));
  ground(G,1,{x2:560,op:.45});
  drawPath(`M560,${G} C 700,${G-60} 820,${G-500} 980,${G-820}`,eo(P(T,a-.2,.7)),{sw:4});
  label(860,G-260,'DIFFICULT',{size:18,op:.55});
  // climb, slip back, give up
  const c=P(T,a+.4,1.0), slip=P(T,a+1.4,.5), leave=P(T,a+2.4,1.0);
  const yAt=x=>{const u=(x-560)/420;return G-(60*3*u*(1-u)**2+500*3*u*u*(1-u)+820*u**3);};
  let x=lerp(480,660,eio(c));x=lerp(x,560,eio(slip));if(leave>0)x=lerp(560,330,eio(leave));
  const y=x>560?yAt(x):G;
  person(x,y,.8,{ring:false,op:lerp(1,.35,leave)});
  if(c>.3&&slip<1)add(`<g opacity="${(1-slip)*.8}">${[0,1,2].map(i=>`<line x1="${x+40+i*10}" y1="${y-80+i*16}" x2="${x+52+i*10}" y2="${y-88+i*16}" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`).join('')}</g>`);
  cue('drop',a+1.4,.7);
  // signpost
  pop(a+2.1,250,G,()=>{add(`<line x1="250" y1="${G}" x2="250" y2="${G-170}" stroke="#fff" stroke-width="4" filter="url(#glowS)"/>`);pillShape(250,G-170,"NOT FOR ME",{size:18,dark:true});},{snd:'pop'});
},{zoom:.03});

/* G — anyone extraordinary: failed, rejected, mistakes (L7-L10) */
scene(l(7)-.25,l(11)-.25,()=>{
  const a=l(7);
  bokeh([[800,640,260,.06],[160,1550,150,.035]],T);
  fadeIn(a-.2,()=>label(540,400,'ANYONE EXTRAORDINARY',{size:26,op:.75}));
  const pts=[[120,1450],[300,1290],[260,1210],[470,1060],[430,990],[640,850],[600,790],[800,660]];
  drawPath('M'+pts.map(p=>p.join(',')).join(' L'),eio(P(T,a,1.4)),{sw:4});
  cue('stairs',a,.5);
  const top=pts[pts.length-1];
  pop(a+1.3,top[0],top[1],()=>{person(top[0],top[1],.75,{spot:true,arm:[45,-60],ring:false});
    add(`<circle cx="${top[0]}" cy="${top[1]-90}" r="160" fill="url(#bk)" fill-opacity=".12"/>`);},{snd:'win',vol:.6});
  const tags=[[l(8),pts[1],'FAILED'],[l(9),pts[3],'REJECTED'],[l(10),pts[5],'MISTAKES']];
  tags.forEach(([t0,[x,y],txt])=>{pop(t0+.1,x,y,()=>{orb(x,y,6,.8);xTile(x-30,y+70,44,.85);label(x+5,y+80,txt,{size:20,op:.85,anchor:'start',weight:800});},{snd:'nope',vol:.4});});
},{zoom:.035});

/* H — the difference? identity vs lesson (L11-L13) */
scene(l(11)-.25,l(14)-.25,()=>{
  bokeh([[540,860,280,.05],[160,1550,150,.035]],T);
  pop(l(11)-.1,540,480,()=>title(540,500,'THE DIFFERENCE?',{size:82}),{snd:'hit',vol:.7});
  // ID card
  fadeIn(l(12)-.2,()=>{box(150,640,780,420,{r:26,op:.9});
    add(`<rect x="150" y="640" width="780" height="70" rx="26" fill="#fff" fill-opacity=".9"/><rect x="150" y="680" width="780" height="30" fill="#fff" fill-opacity=".9"/>`);
    label(540,686,'IDENTITY CARD',{size:20,op:1,fill:'#0b0b0b',weight:800});
    add(`<rect x="200" y="760" width="200" height="240" rx="18" fill="#0b0b0b" stroke="#fff" stroke-opacity=".5" stroke-width="2.5"/>`);
    person(300,975,.95,{ring:false});
    label(450,790,'NAME',{size:16,op:.5,anchor:'start'});label(450,830,'YOU',{size:30,op:1,weight:800,anchor:'start'});
    label(450,900,'IDENTITY',{size:16,op:.5,anchor:'start'});
    const sp=P(T,l(12)+1.4,.35),sw=P(T,l(13)+.3,.4);
    if(sw<1){g(`opacity="${1-sw}"`,()=>{label(450,950,'FAILURE',{size:36,op:lerp(1,.4,sp),weight:800,anchor:'start'});strike(445,660,938,sp);});}
    if(sw>0)pop(l(13)+.3,450,940,()=>{label(450,950,'LEARNER',{size:36,op:1,weight:800,anchor:'start',glow:true});},{snd:'win',vol:.5});
  });
  cue('nope',l(12)+1.4,.5);
  pill(l(12)+1.6,540,1130,"FAILURE ISN'T WHO YOU ARE",{size:20,dark:true,outAt:l(13)+.1});
  pop(l(13)+.55,540,1260,()=>{bulb(540,1250,1.1);},{snd:null});
  fadeIn(l(13)+.7,()=>label(540,1360,'IT’S A LESSON',{size:24,op:.85,weight:800}));
},{zoom:.03});

/* I — failure doesn't mean losing; it means trying (L14, L15) */
scene(l(14)-.25,l(16)-.25,()=>{
  const a=l(14);
  bokeh([[880,760,230,.05],[160,1560,150,.035]],T);
  fadeIn(a-.2,()=>label(540,420,'FAILURE DOESN’T MEAN',{size:24,op:.75}));
  box(130,520,820,560,{r:24,op:.5});
  const pts=[[190,1010],[290,900],[340,960],[450,820],[500,900],[620,720],[680,800],[800,620],[890,580]];
  const dips=[2,4,6];
  const u=eio(P(T,a+.2,3.6));cue('rise',a+.2,.7);
  if(u>0){const n=pts.length-1,k=Math.min(n-1,Math.floor(u*n)),f=u*n-k;
    const shown=pts.slice(0,k+1).concat([[lerp(pts[k][0],pts[k+1][0],f),lerp(pts[k][1],pts[k+1][1],f)]]);
    add(`<polyline points="${shown.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" filter="url(#glow)"/>`);
    const tip=shown[shown.length-1];orb(tip[0],tip[1],8);
    dips.forEach(d=>{if(u*n>=d)cross(pts[d][0],pts[d][1]+32,.45,.7,1);});}
  dips.forEach(d=>cue('drop',a+.2+3.6*(d/8),.35));
  pill(a+.3,540,1170,'LOSING',{size:24,dark:true});
  fadeIn(a+1.2,()=>strike(450,630,1170,P(T,a+1.2,.3)));cue('nope',a+1.2,.4);
  pill(l(15)+.5,540,1290,"IT MEANS YOU'RE TRYING",{size:22});
  fadeIn(l(15)+1.1,()=>label(540,1370,'SOMETHING THAT CHALLENGES YOU',{size:18,op:.65}));
},{zoom:.03});

/* J — afraid of wrong vs afraid of never trying (L16, L17) */
scene(l(16)-.25,l(18)-.25,()=>{
  bokeh([[760,820,250,.05],[160,1560,150,.035]],T);
  fadeIn(l(16)-.2,()=>label(540,430,'WHAT TO BE AFRAID OF',{size:24,op:.75}));
  pop(l(16)+.2,320,820,()=>{box(140,620,360,400,{r:22,op:.6});xTile(320,760,100,.75);label(320,880,'GETTING IT',{size:22,op:.75,weight:800});label(320,915,'WRONG',{size:22,op:.75,weight:800});
    const sp=P(T,l(16)+1.4,.35);label(320,985,'FEAR',{size:18,op:lerp(.6,.3,sp)});strike(275,365,979,sp);});
  cue('nope',l(16)+1.4,.35);
  const hp=eo(P(T,l(17)+.3,.5));
  pop(l(17)+.2,760,820,()=>{box(580,620,360,400,{r:22,op:.95});add(`<rect x="710" y="710" width="100" height="100" rx="18" fill="none" stroke="#fff" stroke-width="3.5" stroke-dasharray="9 7" filter="url(#glowS)"/>`);
    label(760,880,'NEVER',{size:22,op:1,weight:800});label(760,915,'TRYING',{size:22,op:1,weight:800});label(760,985,'REAL FEAR',{size:18,op:.85,glow:true});},{snd:'hit',vol:.7});
  if(hp>0){const pul=1+.03*Math.sin(T*5);add(`<rect x="${760-200*pul}" y="${820-220*pul}" width="${400*pul}" height="${440*pul}" rx="30" fill="none" stroke="#fff" stroke-opacity="${.4*hp}" stroke-width="2.5" stroke-dasharray="8 8"/>`);}
  pill(l(17)+1.2,540,1130,'JUST TRY',{size:24});
  const G=1430;ground(G,1);person(540,G,.85,{spot:true,arm:[55,-20]});
},{zoom:.03});

/* K — struggles become what you're proud of (L18) */
function medal(x,y,s=1){add(`<g filter="url(#glow)"><path d="M${x-44*s},${y-104*s} L${x-18*s},${y-104*s} L${x+8*s},${y-36*s} L${x-16*s},${y-36*s} Z M${x+44*s},${y-104*s} L${x+18*s},${y-104*s} L${x-8*s},${y-36*s} L${x+16*s},${y-36*s} Z" fill="#0b0b0b" stroke="#fff" stroke-width="${3.5*s}" stroke-linejoin="round"/><circle cx="${x}" cy="${y}" r="${42*s}" fill="#0b0b0b" stroke="#fff" stroke-width="${5*s}"/>
  <path d="M${x},${y-24*s} L${x+7*s},${y-7*s} L${x+25*s},${y-7*s} L${x+11*s},${y+5*s} L${x+16*s},${y+23*s} L${x},${y+12*s} L${x-16*s},${y+23*s} L${x-11*s},${y+5*s} L${x-25*s},${y-7*s} L${x-7*s},${y-7*s} Z" fill="#fff"/></g>`);}
scene(l(18)-.25,l(19)-.3,()=>{
  const a=l(18),x0=150,y0=1450,x1=880,y1=860;
  bokeh([[860,760,260,.06],[160,1560,150,.035]],T);
  fadeIn(a-.2,()=>label(540,420,'ONE DAY',{size:28,op:.75}));
  drawPath(`M40,${y0} L${x0},${y0} L${x1},${y1} L1040,${y1}`,eo(P(T,a-.2,.7)),{sw:4,glow:'glowS'});
  label(x0+40,y0+50,'TODAY',{size:16,op:.55});
  const u=eio(P(T,a+.6,3.0)),morph=P(T,a+3.5,.5);
  const bx=lerp(x0+130,x1-50,u),by=lerp(y0,y1,(bx-x0)/(x1-x0));
  const ang=Math.atan2(y1-y0,x1-x0)*180/Math.PI;
  if(morph<1)g(`opacity="${1-morph}" transform="rotate(${ang},${bx},${by})"`,()=>{add(`<rect x="${bx-60}" y="${by-120}" width="120" height="120" rx="12" fill="#0b0b0b" stroke="#fff" stroke-width="4" filter="url(#glowS)"/>`);label(bx,by-52,'STRUGGLE',{size:15,op:.8});});
  const px=bx-110,py=lerp(y0,y1,(px-x0)/(x1-x0));
  person(px,py,.75,{ring:false,arm:[60,-10],op:1});
  if(morph>0){pop(a+3.5,bx,by-110,()=>medal(bx,by-110,1.4),{snd:'win'});const rp=P(T,a+3.6,.8);if(rp<1)add(`<circle cx="${bx}" cy="${by-110}" r="${80+220*eo(rp)}" fill="none" stroke="#fff" stroke-opacity="${.6*(1-rp)}" stroke-width="3"/>`);}
  pill(a+3.8,540,620,'MOST PROUD OF',{size:22});
},{zoom:.035});

/* L — failure isn't the end; it builds the next version; title (L19-L21) */
const TILES=(()=>{const out=[],s=34,cx=540,hy=840,hr=95,bx0=410,bx1=670,by0=965,by1=1330,rr=60;
  let seed=11;const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280;};
  for(let y=hy-hr;y<=by1;y+=s)for(let x=bx0-40;x<=bx1+40;x+=s){const px=x+s/2,py=y+s/2;
    let inside=Math.hypot(px-cx,py-hy)<=hr-4;
    if(py>=by0&&py<=by1&&px>=bx0&&px<=bx1){if(py<by0+rr){const ccx=px<bx0+rr?bx0+rr:(px>bx1-rr?bx1-rr:px);inside=Math.hypot(px-ccx,py-(by0+rr))<=rr||(px>=bx0+rr&&px<=bx1-rr);}else inside=true;}
    if(inside)out.push({x:px,y:py,sx:80+rnd()*920,sy:380+rnd()*1200,d:rnd()});}
  return out;})();
scene(l(19)-.3,END,()=>{
  const a=l(19),b=l(20),c=l(21);
  bokeh([[540,1000,340,.06],[170,1600,140,.035],[900,320,120,.035]],T);
  // "THE END" -> crossed -> "TO BE CONTINUED"
  const endOut=P(T,b-.2,.4);
  if(endOut<1)g(`opacity="${1-endOut}"`,()=>{
    pop(a-.1,540,820,()=>{box(240,660,600,330,{r:24,op:.9});label(540,720,'YOUR STORY',{size:18,op:.55});
      add(`<text x="540" y="860" font-size="96" font-weight="800" fill="#fff" fill-opacity="${lerp(1,.35,P(T,a+1.2,.3))}" text-anchor="middle" filter="url(#glowS)">THE END</text>`);
      strike(320,760,825,P(T,a+1.2,.35));
      fadeIn(a+1.5,()=>label(540,940,'TO BE CONTINUED...',{size:22,op:.9,weight:800,glow:true}));},{snd:'hit',vol:.6});
    cue('nope',a+1.2,.45);});
  // tiles assemble the next version
  if(T>b-.3){fadeIn(b-.1,()=>label(540,560,'BUILT FROM EVERY FAIL',{size:22,op:.7}),{outAt:c-.3});
    TILES.forEach((t,i)=>{const t0=b+.1+t.d*1.8,q=P(T,t0,.55);if(q<=0){if(T>b-.1)xTileSmall(t.sx,t.sy,.35*P(T,b-.1,.3));return;}
      const e=eio(q),x=lerp(t.sx,t.x,e),y=lerp(t.sy,t.y,e);
      if(q<1)xTileSmall(x,y,.6);else add(`<rect x="${t.x-14}" y="${t.y-14}" width="28" height="28" rx="5" fill="#f2f2f2" fill-opacity="${.9}"/>`);});
    for(let k=0;k<14;k++)cue('brick',b+.35+k*.13,.35);
    const done=P(T,b+2.4,.6);
    if(done>0){add(`<ellipse cx="540" cy="1080" rx="260" ry="330" fill="url(#bk)" fill-opacity="${.14*done}"/>`);
      add(`<g opacity="${done}" filter="url(#glowL)"><circle cx="540" cy="840" r="92" fill="#fff" fill-opacity=".08"/></g>`);}
    ground(1350,eo(P(T,b,.6)),{op:.4});
  }
  cue('win',b+2.4,.5);
  const pul=1+.015*Math.sin((T-c)*3);
  pop(c,540,560,()=>g(`transform="translate(540,560) scale(${pul}) translate(-540,-560)"`,()=>{title(540,500,'THE NEXT',{size:124});title(540,640,'VERSION.',{size:124});}),{snd:'impact',d:.5});
  fadeIn(le(21)+.5,()=>label(540,1440,'FOLLOW FOR MORE',{size:18,op:.45}));
},{zoom:.03});
function xTileSmall(x,y,op){add(`<g opacity="${op}"><rect x="${x-14}" y="${y-14}" width="28" height="28" rx="5" fill="#0b0b0b" stroke="#fff" stroke-width="2"/><path d="M${x-6},${y-6} L${x+6},${y+6} M${x+6},${y-6} L${x-6},${y+6}" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></g>`);}
