/* ============ "THE ACTION TAKER vs THE PERFECTIONIST" — wordless archery short ============ */
const S=[];
const HOR=600, WALL0=612, WALL1=770, TY=690, TR=64, GY=1430, FL=.38;   // horizon, backstop, target centre / radius, shooting line, arrow flight time
const AX=300, PX=780, AS=1.65;
const tx=t=>540+330*Math.sin(t*1.9);

/* ---------- shots ---------- */
const SHOTS=[];
function shot(who,t,dx,dy=0,kind){const k=kind||(Math.abs(dx)<TR*.85?'hit':(Math.abs(dx)<TR*1.15?'clip':'miss'));SHOTS.push({who,t,dx,dy,kind:k});}
// scene 2 — the action taker: miss, miss, clip, misses, then a hit
[[5.6,-190,6],[6.9,175,-4],[8.2,66,-10],[9.9,-140,2],[10.9,128,8],[11.9,-96,-6],[13.0,6,4]].forEach(([t,dx,dy])=>shot('A',t,dx,dy));
// keeps practising in the background of scene 3
[[18.6,-44,8],[19.9,32,-10],[21.1,-92,4],[22.3,22,-6],[23.5,-26,10],[24.7,12,-8],[25.9,-16,6],[27.1,10,-4],[28.3,-8,8]].forEach(([t,dx,dy])=>shot('A',t,dx,dy));
// scene 4 — a tight cluster now
[[29.4,6,-6],[30.5,-10,4],[31.6,4,8],[32.6,-6,-8],[33.7,8,2],[35.0,-3,-4],[36.2,5,6],[37.3,-4,-2]].forEach(([t,dx,dy])=>shot('A',t,dx,dy));
// scene 5 (top half)
[[38.7,4,3],[39.8,-6,-5],[40.9,3,6],[42.0,-2,-3]].forEach(([t,dx,dy])=>shot('A',t,dx,dy));
// the perfectionist's only shot
shot('P',34.9,0,0,'wild');
SHOTS.forEach(s=>{s.ti=s.t+FL;s.ix=tx(s.ti)+s.dx;s.iy=TY+s.dy;});
function stats(who,t){let n=0,h=0;SHOTS.forEach(s=>{if(s.who===who&&t>=s.ti){n++;if(s.kind==='hit')h++;}});return[n,h];}

/* ---------- archer state ---------- */
function drawAmt(who,t){
  if(who==='A'){if(t>15.4&&t<17.0)return eo(P(t,15.4,.6));
    for(const s of SHOTS)if(s.who==='A'&&t>=s.t-.45&&t<s.t)return eo((t-(s.t-.45))/.45);return 0;}
  if(t>=22.1&&t<24.0)return eio(P(t,22.1,1.5));if(t>=24.0&&t<24.6)return 1-eio(P(t,24.0,.6));
  if(t>=26.6&&t<28.6)return eio(P(t,26.6,1.0));if(t>=28.6&&t<29.2)return 1-eio(P(t,28.6,.6));
  if(t>=34.25&&t<34.9)return eo(P(t,34.25,.35));
  if(t>=38&&t<45)return .25+.15*Math.sin(t*3);return 0;}
function aimAt(who,t){ // where the arrow points
  if(who==='A'){const nx=SHOTS.find(s=>s.who==='A'&&s.t>=t-.1);return nx?[tx(nx.ti)+nx.dx*.6,TY]:[tx(t),TY];}
  return [lerp(tx(t),PX-80,.5)*0+tx(Math.max(t-.6,0))*.0+(t<34?reticleX(t):1300),TY-(t>=34.6&&t<35.3?420:0)];}
function reticleX(t){return 540+330*Math.sin((t-.45)*1.9)*.9;}

/* ---------- drawing ---------- */
function bowRig(x,gy,s,draw,aim,{loaded=true}={}){
  const bh=78*s,shY=gy-bh+22*s,hx=x-30*s,hy=shY-95*s;
  const th=Math.atan2(aim[1]-hy,aim[0]-hx),c=Math.cos(th),sn=Math.sin(th);
  const W2=(lx,ly)=>[hx+lx*c-ly*sn,hy+lx*sn+ly*c];
  const tipA=W2(0,-58*s),tipB=W2(0,58*s),ctrl=W2(26*s-8*s*draw,0),nock=W2(-10*s-40*s*draw,0),head=W2(52*s,0);
  add(`<path d="M${tipA[0]},${tipA[1]} Q${ctrl[0]},${ctrl[1]} ${tipB[0]},${tipB[1]}" stroke="#fff" stroke-width="${5*s}" fill="none" stroke-linecap="round" filter="url(#glowS)"/>`);
  add(`<path d="M${tipA[0]},${tipA[1]} L${nock[0]},${nock[1]} L${tipB[0]},${tipB[1]}" stroke="#fff" stroke-opacity=".7" stroke-width="${1.6*s}" fill="none"/>`);
  if(loaded){add(`<line x1="${nock[0]}" y1="${nock[1]}" x2="${head[0]}" y2="${head[1]}" stroke="#fff" stroke-width="${3*s}" stroke-linecap="round"/>`);
    const hA=W2(43*s,-6*s),hB=W2(43*s,6*s),fA=W2(-3*s-40*s*draw,-7*s),fB=W2(-3*s-40*s*draw,7*s);
    add(`<path d="M${hA[0]},${hA[1]} L${head[0]},${head[1]} L${hB[0]},${hB[1]} Z" fill="#fff"/><path d="M${fA[0]},${fA[1]} L${nock[0]},${nock[1]} L${fB[0]},${fB[1]}" stroke="#fff" stroke-width="${2*s}" fill="none"/>`);}
  return {nock,hand:[hx,hy],shY,head};}
function archer(who,t,x,gy,s){
  let draw=drawAmt(who,t),mode='bow',op=1,sx=1,sy=1,jx=0;
  if(who==='A'){if(t>13.45&&t<14.9)mode='up';}
  else{ if(t>17.8&&t<19.2)jx=Math.round(Math.sin((t-17.8)*9))*9;
        if(t>19.3&&t<20.5)jx=0;
        if(t>20.6&&t<22.0)mode='wind';
        if(t>25.8&&t<26.6)sy=1+.06*Math.sin(Math.PI*P(t,25.8,.8));
        if(t>35.6&&t<38)mode='down',op=.75,sy=.96;
        if(t>38&&Math.sin(t*2.2)>.6)jx=Math.round(Math.sin(t*14))*6;}
  const X=x+jx;
  g(`transform="translate(${X},${gy}) scale(${sx},${sy}) translate(${-X},${-gy})"`,()=>{
    const aim=aimAt(who,t);const loaded=!(who==='A'&&SHOTS.some(q=>q.who==='A'&&t>=q.t&&t<q.t+.32))&&!(who==='P'&&t>=34.9&&t<35.4);
    let rig=null;if(mode!=='up'&&mode!=='down'){g('',()=>{});}
    // arms: bow arm (left) always toward the bow hand unless celebrating / defeated
    let arm=[-30,-95],arm2=[40,58];const bh=78*s,shY=gy-bh+22*s;
    if(mode==='up'){arm=[-44,-88];arm2=[44,-88];}
    else if(mode==='down'){arm=[-30,58];arm2=[30,58];}
    // compute nock to place the string hand
    const hx=X-30*s,hy=shY-95*s,th=Math.atan2(aim[1]-hy,aim[0]-hx);const nk=[hx+(-10*s-40*s*draw)*Math.cos(th),hy+(-10*s-40*s*draw)*Math.sin(th)];
    if(mode==='bow'&&draw>.04)arm2=[(nk[0]-X)/s,(nk[1]-shY)/s];
    if(mode==='wind')arm2=[30,-96];
    person(X,gy,s,{arm,arm2,op,ring:false,spot:false});
    if(mode==='up')bowRigAt(X-44*s,shY-88*s,s,[X-44*s,0]);
    else if(mode==='down')bowRigAt(X-30*s,shY+58*s,s,[X-200*s,shY+300*s]);
    else bowRig(X,gy,s,draw,aim,{loaded});
  });
  return X;}
function bowRigAt(hx,hy,s,aim){const th=Math.atan2(aim[1]-hy,aim[0]-hx),c=Math.cos(th),sn=Math.sin(th);const W2=(lx,ly)=>[hx+lx*c-ly*sn,hy+lx*sn+ly*c];
  const a=W2(0,-58*s),b=W2(0,58*s),k=W2(26*s,0),n=W2(-10*s,0);add(`<path d="M${a[0]},${a[1]} Q${k[0]},${k[1]} ${b[0]},${b[1]}" stroke="#fff" stroke-width="${5*s}" fill="none" stroke-linecap="round" filter="url(#glowS)"/><path d="M${a[0]},${a[1]} L${n[0]},${n[1]} L${b[0]},${b[1]}" stroke="#fff" stroke-opacity=".7" stroke-width="${1.6*s}" fill="none"/>`);}

function cloud(x,y,s,op=.35){add(`<g opacity="${op}" fill="none" stroke="#fff" stroke-width="3"><path d="M${x-90*s},${y} Q${x-90*s},${y-40*s} ${x-50*s},${y-40*s} Q${x-40*s},${y-80*s} ${x},${y-74*s} Q${x+40*s},${y-96*s} ${x+70*s},${y-50*s} Q${x+110*s},${y-50*s} ${x+110*s},${y} Z"/></g>`);}
function treeL(x,y,s,op=.5){add(`<g opacity="${op}" stroke="#fff" stroke-width="3" fill="#0b0b0b"><line x1="${x}" y1="${y}" x2="${x}" y2="${y-60*s}"/><path d="M${x},${y-200*s} L${x+46*s},${y-60*s} L${x-46*s},${y-60*s} Z"/><path d="M${x},${y-250*s} L${x+34*s},${y-150*s} L${x-34*s},${y-150*s} Z"/></g>`);}
function target(x,y){add(`<g filter="url(#glowS)"><line x1="${x-34}" y1="${y+40}" x2="${x-44}" y2="${WALL1}" stroke="#fff" stroke-width="4"/><line x1="${x+34}" y1="${y+40}" x2="${x+44}" y2="${WALL1}" stroke="#fff" stroke-width="4"/>
  <circle cx="${x-44}" cy="${WALL1+2}" r="7" fill="#0b0b0b" stroke="#fff" stroke-width="3"/><circle cx="${x+44}" cy="${WALL1+2}" r="7" fill="#0b0b0b" stroke="#fff" stroke-width="3"/>
  <circle cx="${x}" cy="${y}" r="${TR}" fill="#0b0b0b" stroke="#fff" stroke-width="5"/><circle cx="${x}" cy="${y}" r="${TR*.68}" fill="none" stroke="#fff" stroke-width="4"/><circle cx="${x}" cy="${y}" r="${TR*.36}" fill="none" stroke="#fff" stroke-width="4"/><circle cx="${x}" cy="${y}" r="${TR*.12}" fill="#fff"/></g>`);}
function stuck(x,y,fromX,op=1){const dx=(fromX-x)*.035;add(`<g opacity="${op}"><line x1="${x}" y1="${y}" x2="${x+dx}" y2="${y+22}" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M${x+dx-6},${y+30} L${x+dx},${y+20} L${x+dx+6},${y+30}" stroke="#fff" stroke-width="2.5" fill="none"/></g>`);}
function flyingArrow(x0,y0,x1,y1,u,{arc=90,up=0}={}){const x=lerp(x0,x1,u),y=lerp(y0,y1,u)-Math.sin(Math.PI*u)*arc-up*u*u,sc=lerp(1,.38,u);
  const x2=lerp(x0,x1,Math.max(0,u-.06)),y2=lerp(y0,y1,Math.max(0,u-.06))-Math.sin(Math.PI*Math.max(0,u-.06))*arc-up*Math.max(0,u-.06)**2;const a=Math.atan2(y-y2,x-x2),L=70*sc;
  add(`<line x1="${x-L*Math.cos(a)}" y1="${y-L*Math.sin(a)}" x2="${x}" y2="${y}" stroke="#fff" stroke-width="${4*sc}" stroke-linecap="round" filter="url(#glowS)"/>`);
  add(`<line x1="${x-L*1.8*Math.cos(a)}" y1="${y-L*1.8*Math.sin(a)}" x2="${x-L*Math.cos(a)}" y2="${y-L*Math.sin(a)}" stroke="#fff" stroke-opacity=".25" stroke-width="${3*sc}"/>`);}
function popWord(x,y,t0,txt,size=40){const p=P(T,t0,.9);if(p<=0||p>=1)return;add(`<text x="${x}" y="${y-60*eo(p)}" font-size="${size}" font-weight="900" letter-spacing="${size*.12}" fill="#fff" fill-opacity="${1-p*p}" text-anchor="middle" filter="url(#glowS)">${txt}</text>`);}
function windsock(t,strength){const x=990,y0=WALL1,y1=520;add(`<line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" stroke="#fff" stroke-width="4" filter="url(#glowS)"/>`);
  const fl=Math.sin(t*12)*8*strength,ang=lerp(70,8,strength);const a=ang*Math.PI/180;const ex=x-120*Math.sin(a)*1,ey=y1+120*Math.cos(a)*.9+fl;
  add(`<path d="M${x},${y1-14} L${ex},${ey-8} L${ex},${ey+8} L${x},${y1+14} Z" fill="#0b0b0b" stroke="#fff" stroke-width="3" filter="url(#glowS)"/>`);}

/* ---------- the world (drawn in world coords; camera applied outside) ---------- */
function world(t,{labels=true,ui=null}={}){
  // sky + scenery
  add(`<circle cx="830" cy="380" r="260" fill="url(#bk)" fill-opacity=".12"/><circle cx="830" cy="380" r="70" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3" filter="url(#glowS)"/>`);
  [[ -300,260,1.2],[300,180,1],[1300,300,1.3],[700,140,.8]].forEach(([x,y,s],k)=>cloud(((x+t*(14+k*4))%2400)-500,y,s,.28));
  add(`<path d="M-600,${HOR} L-200,${HOR-90} L120,${HOR-30} L420,${HOR-120} L760,${HOR-40} L1100,${HOR-110} L1500,${HOR-30} L1700,${HOR}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>`);
  for(let k=0;k<7;k++){treeL(-420+k*80,WALL0+4,.55+.1*(k%2),.4);treeL(1120+k*80,WALL0+4,.55+.1*((k+1)%2),.4);}
  // backstop wall
  add(`<rect x="-700" y="${WALL0}" width="2480" height="${WALL1-WALL0}" fill="#0c0c0c" stroke="#fff" stroke-opacity=".55" stroke-width="3"/>`);
  for(let k=-14;k<36;k++)add(`<line x1="${k*60}" y1="${WALL0}" x2="${k*60}" y2="${WALL1}" stroke="#fff" stroke-opacity=".08" stroke-width="2"/>`);
  // misses stuck in the backstop
  SHOTS.forEach(s=>{if((s.kind==='miss')&&t>=s.ti)stuck(s.ix,s.iy,s.who==='A'?AX:PX,.85);});
  // rail + target (+ hits riding along)
  add(`<line x1="-700" y1="${WALL1+2}" x2="1780" y2="${WALL1+2}" stroke="#fff" stroke-opacity=".8" stroke-width="5"/>`);
  for(let k=-6;k<20;k++)add(`<line x1="${k*110}" y1="${WALL1+2}" x2="${k*110}" y2="${WALL1+24}" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>`);
  const X=tx(t);
  // blur trail when the target moves fast
  const v=Math.abs(Math.cos(t*1.9));for(let k=1;k<=3;k++){const xx=tx(t-k*.025);add(`<circle cx="${xx}" cy="${TY}" r="${TR}" fill="none" stroke="#fff" stroke-opacity="${.08*v}" stroke-width="5"/>`);}
  target(X,TY);
  SHOTS.forEach(s=>{if(s.kind==='hit'&&t>=s.ti){const ox=s.ix-tx(s.ti);stuck(X+ox,TY+s.dy,s.who==='A'?AX:PX);}});
  windsock(t,t>20.6&&t<22.2?1:.35);
  // ground with perspective lines
  add(`<rect x="-700" y="${WALL1+26}" width="2480" height="1400" fill="#fff" fill-opacity=".018"/>`);
  for(let k=-6;k<=6;k++)add(`<line x1="${540+k*70}" y1="${WALL1+26}" x2="${540+k*420}" y2="2000" stroke="#fff" stroke-opacity=".06" stroke-width="2"/>`);
  add(`<line x1="-700" y1="${GY+8}" x2="1780" y2="${GY+8}" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-dasharray="14 10"/>`);
  label(1000,GY+60,'SHOOTING LINE',{size:16,op:.35});
  // flying arrows + impacts
  SHOTS.forEach(s=>{const u=(t-s.t)/FL;const bx=(s.who==='A'?AX:PX)-30*AS,by=GY-78*AS+22*AS-95*AS;
    if(s.kind==='wild'){const uu=(t-s.t)/.7;if(uu>0&&uu<1)flyingArrow(bx,by,1500,120,uu,{arc:120});return;}
    if(u>0&&u<1)flyingArrow(bx,by,s.ix,s.iy,u);
    if(s.kind==='clip'&&t>=s.ti&&t<s.ti+.7){const q=(t-s.ti)/.7;const x=s.ix+q*60,y=s.iy+q*q*90;add(`<line x1="${x}" y1="${y}" x2="${x+16*Math.cos(q*9)}" y2="${y+16*Math.sin(q*9)}" stroke="#fff" stroke-width="3"/>`);}
    if(t>=s.ti)popWord(s.kind==='hit'?tx(t):s.ix,s.iy-TR-10,s.ti,s.kind==='hit'?'HIT!':(s.kind==='clip'?'SO CLOSE':'MISS'),s.kind==='hit'?46:36);
    if(s.kind==='hit')ring(tx(t),TY,s.ti,{r0:TR,r1:TR*2.6,d:.5,op:.7});});
  // archers
  spotlight(AX,GY,AS*.8,.3);spotlight(PX,GY,AS*.8,.3);
  const ax=archer('A',t,AX,GY,AS),px=archer('P',t,PX,GY,AS);
  if(labels){const b=Math.sin(t*2)*4;pill(.5,AX,GY-420+b,'ACTION TAKER',{size:22});pill(.95,PX,GY-420-b,'PERFECTIONIST',{size:22,dark:true});}
  // moods
  if(t>9.0&&t<9.75)scribble(AX+90,GY-300);
  if(t>33.8&&t<34.3)scribble(PX+90,GY-300);
  if(t>13.45&&t<14.9){for(let k=0;k<8;k++){const a=k*Math.PI/4+t*2,r=90+40*P(t,13.45,.6);add(`<circle cx="${AX+r*Math.cos(a)}" cy="${GY-250+r*Math.sin(a)*.6}" r="4" fill="#fff" opacity="${1-P(t,14.3,.6)}"/>`);}}
  return [ax,px];}
function scribble(x,y){add(`<path d="M${x-40},${y} q10,-22 20,0 t20,0 t20,0 t20,0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" filter="url(#glowS)" transform="rotate(${Math.sin(T*30)*5},${x},${y})"/>`);}

/* ---------- camera ---------- */
function camAt(t){const K=[[0,540,1010,1.0],[4.7,540,1010,1.02],[5.3,390,1070,1.38],[16.7,420,1060,1.42],[17.25,720,1060,1.38],[28.7,690,1050,1.42],[29.3,540,1010,1.0],[38,540,1010,1.02]];
  for(let i=0;i<K.length-1;i++){const a=K[i],b=K[i+1];if(t>=a[0]&&t<=b[0]){const u=eio((t-a[0])/(b[0]-a[0]));return[lerp(a[1],b[1],u),lerp(a[2],b[2],u),lerp(a[3],b[3],u)];}}return K[K.length-1].slice(1);}
function withCam(fx,fy,z,sx,sy,fn){g(`transform="translate(${sx},${sy}) scale(${z}) translate(${-fx},${-fy})"`,fn);}

/* ---------- UI overlay (screen space) ---------- */
function counter(x,y,who,t,anchor='middle'){const[n,h]=stats(who,t);label(x,y,(who==='A'?'ACTION TAKER':'PERFECTIONIST')+`  ·  ARROWS: ${n}`+(who==='A'?`  ·  HITS: ${h}`:''),{size:22,op:.85,anchor,weight:800,sp:.14});}
function caption(t0,t1,txt,y=1650){const p=P(T,t0,.25)*(1-P(T,t1-.25,.25));if(p<=0)return;add(`<g opacity="${p}">`);pillShape(540,y,txt,{size:24,dark:true});add('</g>');}

S.push({s:0,e:60,cam:{zoom:0},draw:()=>{
  const t=T;
  if(t<38){const[fx,fy,z]=camAt(t);withCam(fx,fy,z,540,960,()=>world(t));
    // scene 1 hook
    if(t<4.9){fadeIn(-1,()=>{label(540,230,'TWO ARCHERS. ONE TARGET.',{size:28,op:.8});title(540,345,'WHO WINS?',{size:120});},{outAt:4.5,d:.01});}
    // scene 2 UI
    if(t>5.2&&t<17.2){fadeIn(5.3,()=>counter(540,200,'A',t),{outAt:16.9});}
    // scene 3 UI + action captions
    if(t>17.1&&t<29.2){fadeIn(17.3,()=>{label(540,200,'PERFECTIONIST  ·  ARROWS: 0',{size:24,op:.9,weight:800,sp:.14});},{outAt:28.9});
      caption(17.8,19.25,'ADJUSTS HIS FEET');caption(19.3,20.55,'ADJUSTS HIS GRIP');caption(20.6,22.05,'CHECKS THE WIND');caption(22.1,23.6,'AIMING…');
      caption(23.6,24.6,'NOT YET…');caption(24.6,25.6,'WAITING…');caption(25.6,26.6,'DEEP BREATH…');
      if(t>26.6&&t<28.4){add(`<g opacity="${P(t,26.6,.3)*(1-P(t,28.1,.3))}">`);pillShape(540,1650,'WAITING FOR THE PERFECT MOMENT',{size:20,dark:true});const pp=.99*eo(P(t,26.7,1));bar(240,1730,600,pp,{h:26,right:Math.round(pp*100)+'%'});add('</g>');}
      caption(28.3,29.2,'STILL HASN’T FIRED.');}
    // scene 4 UI
    if(t>29.2&&t<38){fadeIn(29.4,()=>{counter(540,200,'A',t);label(540,245,`PERFECTIONIST  ·  ARROWS: ${stats('P',t)[0]}`,{size:22,op:.6,weight:800,sp:.14});});
      caption(29.6,31.6,'PRACTICE = BETTER AIM',1580);caption(31.9,33.7,'HE HASN’T MOVED.',1580);caption(35.4,37.8,'NO EXPERIENCE.',1580);}
    // shared reticle for the perfectionist's aiming
    if((t>22.1&&t<24.0)||(t>26.6&&t<28.6)){const[fx,fy,z]=camAt(t);withCam(fx,fy,z,540,960,()=>{const rx=reticleX(t);add(`<circle cx="${rx}" cy="${TY}" r="${TR*1.25}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2.5" stroke-dasharray="8 8"/><line x1="${rx-TR*1.6}" y1="${TY}" x2="${rx-TR*.6}" y2="${TY}" stroke="#fff" stroke-opacity=".6" stroke-width="2"/><line x1="${rx+TR*.6}" y1="${TY}" x2="${rx+TR*1.6}" y2="${TY}" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>`);});}
  }else{
    // scene 5 — split screen
    const sp=eio(P(t,38,.6));
    const id1='c'+(uid++),id2='c'+(uid++);
    add(`<clipPath id="${id1}"><rect x="0" y="0" width="1080" height="${lerp(1920,950,sp)}"/></clipPath><clipPath id="${id2}"><rect x="0" y="${lerp(1920,970,sp)}" width="1080" height="950"/></clipPath>`);
    g(`clip-path="url(#${id1})"`,()=>withCam(lerp(540,330,sp),lerp(1010,1020,sp),lerp(1,.9,sp),540,lerp(960,475,sp),()=>world(t,{labels:true})));
    g(`clip-path="url(#${id2})"`,()=>withCam(780,1020,.9,540,1445,()=>world(t,{labels:true})));
    add(`<rect x="0" y="${lerp(1920,950,sp)}" width="1080" height="20" fill="#000"/>`);
    fadeIn(38.3,()=>{label(60,90,`ARROWS: ${stats('A',t)[0]}  ·  HITS: ${stats('A',t)[1]}`,{size:22,op:.85,anchor:'start',weight:800});label(60,1030,'ARROWS: 1  ·  STILL PREPARING…',{size:22,op:.7,anchor:'start',weight:800});});
    // the line
    const tp=P(t,39.6,.5);
    if(tp>0){add(`<rect x="0" y="${760}" width="1080" height="${400}" fill="#000" opacity="${.78*tp}"/>`);
      pop(39.6,540,860,()=>title(540,880,"YOU CAN'T IMPROVE",{size:84}),{snd:'impact',vol:.8});
      pop(40.0,540,980,()=>title(540,990,'AT SOMETHING',{size:84}),{snd:null});
      pop(40.4,540,1090,()=>title(540,1100,'YOU NEVER START.',{size:84}),{snd:'hit',vol:.6});}
    // fade to black, then the brand
    const fb=P(t,43.6,1);if(fb>0)add(`<rect width="${W}" height="${H}" fill="#000" opacity="${fb}"/>`);
    if(t>44.7){add(`<circle cx="540" cy="960" r="420" fill="url(#bk)" fill-opacity=".06"/>`);pop(44.8,540,930,()=>title(540,980,'THE NEXT VERSION.',{size:92}),{snd:'impact',vol:.6,d:.5});}
  }
  // sound cues
  SHOTS.forEach(s=>{cue('draw',s.t-.45,.5);cue('twang',s.t,1);cue(s.kind==='hit'?'thunk':(s.kind==='clip'?'ting':(s.kind==='wild'?'whistle':'thud')),s.ti,s.who==='A'&&(s.t>17.2&&s.t<29)?.45:1);if(s.kind==='hit'&&s.t<14)cue('win',s.ti+.1,.7);});
  cue('wind',20.6,1);cue('breath',25.8,1);cue('whoosh',5.0,.7);cue('whoosh',17.0,.7);cue('whoosh',29.0,.7);cue('whoosh',38.0,.8);cue('win',13.5,.8);
  [17.9,18.5,19.1].forEach(x=>cue('step',x,.7));[20.6,20.8].forEach(x=>cue('tick',x,.3));
}});
