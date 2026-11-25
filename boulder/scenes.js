/* ============ "EGO vs MOTIVATION vs DISCIPLINE" — wordless boulder short, ~35.5 s ============
   Each lane is an endless scrolling hill: the camera tracks the boulder, the hill fades into darkness ahead,
   and the summit is only revealed ~5 s before the end, when discipline reaches it. Everyone starts already rolling. */
const S=[];
const AMB='#FFB547';
const R=60, K=.33, SUM=2600, TOP=32, AX=520;           // boulder radius, slope, summit (world x), discipline arrival time, screen anchor x
const LANES=[{n:'EGO',base:760},{n:'MOTIVATION',base:1170},{n:'DISCIPLINE',base:1580}];
const RISE=270, ANG=Math.atan(K)*180/Math.PI;
const hgt=x=>x<=0?0:(x>=SUM?SUM*K:x*K);
function bigText(x,y,txt,size,op=1,fill='#fff'){add(`<text x="${x}" y="${y}" font-size="${size}" font-weight="900" letter-spacing="${size*.04}" text-anchor="middle" fill="${fill}" fill-opacity="${op}" stroke="#000" stroke-width="${size*.05}" paint-order="stroke" filter="url(#glowS)">${txt}</text>`);}

/* ---------- world positions: boulder x and camera focus x (everyone starts mid-push) ---------- */
const X0=[120,120,120];
function egoX(t){if(t<6.2)return 120+1030*eo(P(t,0,6.2));if(t<7.4)return 1150*(1-Math.pow(P(t,6.2,1.2),2));return 0;}
function motX(t){if(t<11)return 120+830*Math.sin(Math.PI/2*P(t,0,11));if(t<12.6)return 950;if(t<14.4)return 950*(1-Math.pow(P(t,12.6,1.8),2));return 0;}
function disX(t){if(t<TOP)return 120+(SUM-120)*t/TOP-6*Math.sin(t*1.6*Math.PI*2);return SUM+60*eo(P(t,TOP,.5));}
function energy(t){return t<3.5?1:clamp(1-(t-3.5)/7.5);}
const focusOf=[t=>egoX(t),t=>t<12.6?motX(t):950,t=>disX(t)];

/* ---------- props ---------- */
function boulder(x,y,rot,r=R){add(`<g transform="rotate(${rot},${x},${y})"><circle cx="${x}" cy="${y}" r="${r}" fill="#141414" stroke="#fff" stroke-width="5" filter="url(#glowS)"/><path d="M${x-r*.5},${y-r*.2} q${r*.3},-${r*.3} ${r*.6},-${r*.1} M${x+r*.1},${y+r*.45} q${r*.2},-${r*.2} ${r*.45},0 M${x-r*.35},${y+r*.25} l${r*.15},${r*.12}" stroke="#fff" stroke-opacity=".45" stroke-width="3" fill="none"/></g>`);}
function crown(x,y,s=1,rot=0){add(`<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><path d="M-30,10 L-34,-22 L-14,-4 L0,-28 L14,-4 L34,-22 L30,10 Z" fill="${AMB}" stroke="#000" stroke-width="3" filter="url(#glowS)"/></g>`);}
function meterBar(x,y,v,lab){add(`<rect x="${x-90}" y="${y}" width="180" height="22" rx="11" fill="none" stroke="#fff" stroke-width="3"/><rect x="${x-86}" y="${y+4}" width="${Math.max(0,172*v)}" height="14" rx="7" fill="${v<.3?'#ff6b5a':AMB}"/>`);label(x,y-10,lab,{size:16,op:.8,weight:900});}
function cloud(x,y,op){if(op<=0)return;add(`<g opacity="${op}"><path d="M${x-120},${y} a50,50 0 0 1 60,-60 a70,70 0 0 1 120,10 a50,50 0 0 1 60,50 Z" fill="#1a1a1a" stroke="#fff" stroke-opacity=".6" stroke-width="4"/></g>`);let d='';for(let k=0;k<14;k++){const xx=x-110+(k*37)%230,yy=y+20+((k*53+T*700)%260);d+=`<line x1="${xx}" y1="${yy}" x2="${xx-6}" y2="${yy+26}"/>`;}add(`<g stroke="#fff" stroke-opacity="${.45*op}" stroke-width="2.5">${d}</g>`);}
function bubbleT(x,y,txt,op=1){if(op<=0)return;const w=txt.length*17+50;add(`<g opacity="${op}"><rect x="${x-w/2}" y="${y-36}" width="${w}" height="58" rx="29" fill="#fff"/><path d="M${x-16},${y+20} l-8,24 l26,-24 Z" fill="#fff"/></g>`);label(x,y+2,txt,{size:22,op:op,weight:900,fill:'#000',sp:.06});}

/* ---------- one lane ---------- */
function lane(i,t,{op=1}={}){const L=LANES[i];const AY=L.base-120;
  const f=focusOf[i](t);const camX=Math.min(f-AX,SUM-640);const hc=hgt(camX+AX);
  const sx=wx=>wx-camX, sy=h=>AY-(h-hc), gy=wx=>sy(hgt(wx));
  const y0=L.base-RISE-150,y1=L.base+40;const id='ln'+i;
  add(`<clipPath id="${id}"><rect x="0" y="${y0}" width="1080" height="${y1-y0}"/></clipPath><g clip-path="url(#${id})" opacity="${op}">`);
  const reveal=i===2?eio(P(t,30.2,.9)):0;
  if(reveal>0){const cx=sx(SUM+330),cy=gy(SUM)+30;add(`<circle cx="${cx}" cy="${cy}" r="300" fill="${AMB}" opacity="${.22*reveal}" filter="url(#glowL)"/><circle cx="${cx}" cy="${cy}" r="120" fill="#fff" opacity="${.9*reveal}" filter="url(#glow)"/>`);
    for(let k=0;k<12;k++){const a=Math.PI+k*Math.PI/11;add(`<line x1="${cx+Math.cos(a)*150}" y1="${cy+Math.sin(a)*150}" x2="${cx+Math.cos(a)*215}" y2="${cy+Math.sin(a)*215}" stroke="#fff" stroke-opacity="${.45*reveal}" stroke-width="4"/>`);}}
  // the hill
  const xs=[camX-60,0,SUM,camX+1140].filter(x=>x>=camX-60&&x<=camX+1140).sort((a,b)=>a-b);const pts=xs.map(x=>`${sx(x)},${gy(x)}`).join(' L');
  add(`<path d="M${pts} L${sx(camX+1140)},${y1+10} L${sx(camX-60)},${y1+10} Z" fill="#090909"/><path d="M${pts}" stroke="#fff" stroke-opacity=".85" stroke-width="5" fill="none" stroke-linejoin="round" filter="url(#glowS)"/>`);
  for(let k=Math.floor((camX-60)/95);k<(camX+1140)/95;k++){const x=k*95;if(x<0||x>SUM)continue;add(`<line x1="${sx(x)}" y1="${gy(x)+18}" x2="${sx(x+26)}" y2="${gy(x+26)+18}" stroke="#fff" stroke-opacity=".2" stroke-width="3"/>`);}
  if(i===2){const fx=sx(SUM+300),fyy=gy(SUM);add(`<line x1="${fx}" y1="${fyy}" x2="${fx}" y2="${fyy-170}" stroke="#fff" stroke-width="5"/><path d="M${fx},${fyy-170} l${74+Math.sin(T*6)*6},24 l-${74+Math.sin(T*6)*6},24 Z" fill="${t>TOP?AMB:'#fff'}" filter="url(#glowS)"/>`);}
  // boulder
  const wx=[egoX,motX,disX][i](t);const bx=sx(wx),by=gy(wx)-R-2;boulder(bx,by,wx/R*57.3);
  // character
  let fwx=wx-R-58,lean=ANG+12,arm=[62,-58],arm2=[46,-34],sc=1.15,flip=1,extra=null;let px,py;
  if(i===0){// EGO: sprints with a crown, slips, rage-quits
    if(t>5.6&&t<6.2)lean=ANG+12+Math.sin(t*60)*6;
    if(t>=6.2&&t<7.6){const q=P(t,6.2,1.3);fwx=lerp(egoX(6.2)-R-58,-150,q);lean=-200*q;}
    if(t>=7.6&&t<9.4){fwx=-150;lean=0;arm=[70,-70];arm2=[-70,-70];extra='mad';}
    if(t>=9.4){fwx=lerp(-150,-700,P(t,9.4,1.8));lean=-4;arm=[30,50];arm2=[-30,50];flip=-1;}
    px=sx(fwx);py=gy(fwx);
    if(t<6.2)crown(px,py-sc*160,1,0);else{const c=P(t,6.2,1.0);const cw=lerp(egoX(6.2),420,c);crown(sx(cw),lerp(gy(egoX(6.2))-200,gy(420)-14,c),.9,c*160);}
    bubbleT(px+90,py-240,'TOO EASY.',P(t,.6,.2)*(1-P(t,3.4,.2)));bubbleT(sx(-150)+170,gy(-150)-230,'THIS IS POINTLESS.',P(t,7.8,.2)*(1-P(t,10.2,.3)));
    cue('thud',6.25,.7);cue('hit',7.3,.6);cue('whoosh',6.3,.6);cue('pop',.6,.4);cue('pop',7.8,.4);}
  if(i===1){// MOTIVATION: bursts of energy, drains, gives up, scrolls
    if(t>=11&&t<12.6){lean=lerp(ANG+12,4,P(t,11,.6));arm=[30,40];arm2=[-30,40];}
    if(t>=12.6){fwx=880;lean=0;arm=[44,-20];arm2=[-30,50];extra='phone';}
    px=sx(fwx);py=gy(fwx);const e=energy(t);if(t<13)meterBar(px,py-230,e,'ENERGY');
    if(t<3.5)for(let k=0;k<5;k++){const a=t*4+k*1.26;add(`<circle cx="${px+Math.cos(a)*70}" cy="${py-90+Math.sin(a)*70}" r="4" fill="${AMB}" opacity=".8"/>`);}
    bubbleT(px+190,py-190,"LET'S GOOO!",P(t,.3,.2)*(1-P(t,3.0,.2)));bubbleT(px+150,py-250,'MAYBE TOMORROW...',P(t,13.0,.2)*(1-P(t,17.4,.3)));
    if(t>10)cloud(px+60,py-300,P(t,10,.8)*(1-P(t,22,1)));cue('pop',.3,.4);cue('pop',13.0,.4);cue('thud',14.3,.4);}
  if(i===2){// DISCIPLINE: same pace, every day, rain or shine
    if(t>TOP+.3){fwx=wx+R+45;lean=0;arm=[44,-90+Math.sin(t*8)*6];arm2=[-44,-90-Math.sin(t*8)*6];}
    px=sx(fwx);py=gy(fwx);
    if(t<TOP){const d=Math.floor(1+clamp(t/TOP)*364);label(px,py-205,'DAY '+d,{size:24,op:.9,weight:900,sp:.1});for(let k=0;k*.625<TOP;k++)cue('step',k*.625,.35);}
    if(t>12&&t<20)cloud(px+40,py-250,P(t,12,.6)*(1-P(t,19.4,.6)));
    cue('win',TOP+.1,.8);}
  g(`transform="translate(${px},${py}) rotate(${lean}) scale(${flip},1) translate(${-px},${-py})"`,()=>person(px,py,sc,{ring:false,arm,arm2,spot:i===2&&t>TOP}));
  if(extra==='mad'){const s=Math.sin(t*40)*4;add(`<g stroke="#ff6b5a" stroke-width="5" stroke-linecap="round"><path d="M${px-30+s},${py-200} l-12,-18 M${px},${py-210} l0,-22 M${px+30+s},${py-200} l12,-18"/></g>`);}
  if(extra==='phone'){add(`<circle cx="${px+40}" cy="${py-110}" r="40" fill="url(#bk)" fill-opacity=".3"/><rect x="${px+28}" y="${py-130}" width="24" height="40" rx="5" fill="#0b0b0b" stroke="#fff" stroke-width="3"/>`);}
  // darkness ahead: the hill disappears into fog (lifts only for discipline at the reveal)
  const fo=1-reveal;if(fo>0){const gid='fg'+i;add(`<linearGradient id="${gid}" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="1"/></linearGradient><rect x="600" y="${y0}" width="120" height="${y1-y0}" fill="url(#${gid})" opacity="${fo}"/><rect x="718" y="${y0}" width="370" height="${y1-y0}" fill="#000" opacity="${fo}"/>`);}
  add('</g>');
  if(op>.5)pillShape(110,y0+40,L.n,{size:22,dark:i!==2});}

/* ---------- main ---------- */
S.push({s:0,e:END+1,cam:{zoom:0},draw:()=>{const t=T;
  const fz=eio(P(t,TOP+.2,1.4));const z=lerp(1,1.75,fz),fx=lerp(540,760,fz),fy=lerp(980,LANES[2].base-120-170,fz);
  const shake=t>6.2&&t<6.6?Math.sin(t*90)*6:0;
  g(`transform="translate(${540+shake},${980}) scale(${z}) translate(${-fx},${-fy})"`,()=>{
    [0,1,2].forEach(i=>lane(i,t,{op:i===2?1:1-.9*fz}));
    [0,1].forEach(i=>{const y=LANES[i].base+40+((LANES[i+1].base-RISE-150)-(LANES[i].base+40))/2;add(`<line x1="0" y1="${y}" x2="1080" y2="${y}" stroke="#fff" stroke-opacity="${.12*(1-fz)}" stroke-width="2"/>`);});});
  if(t>TOP+.3)for(let k=0;k<34;k++){const x=(k*137)%1080,y=((k*97+(t-TOP-.3)*300)%1500)+150;add(`<rect x="${x}" y="${y}" width="12" height="20" fill="${k%3?'#fff':AMB}" opacity=".75" transform="rotate(${k*40+t*200},${x},${y})"/>`);}
  const ho=1-P(t,4.0,.4);if(ho>0)add(`<g opacity="${ho}"><rect x="90" y="140" width="900" height="110" rx="55" fill="#fff" filter="url(#glow)"/><text x="540" y="216" font-size="54" font-weight="900" letter-spacing="2" text-anchor="middle" fill="#000">WHO REACHES THE TOP?</text></g>`);
  if(t>4.4&&t<TOP){const o=P(t,4.4,.3)*(1-P(t,TOP-.4,.3));add(`<g opacity="${o}">`);label(540,210,'STILL CLIMBING',{size:22,op:.7,weight:900});
    [['EGO',t<6.2],['MOTIVATION',t<12.6],['DISCIPLINE',true]].forEach(([n,ok],k)=>{const x=250+k*290;add(`<rect x="${x-125}" y="240" width="250" height="58" rx="29" fill="${ok?'#fff':'none'}" stroke="#fff" stroke-opacity="${ok?1:.35}" stroke-width="3"/>`);label(x,278,n,{size:20,op:ok?1:.4,weight:900,fill:ok?'#000':'#fff'});if(!ok)add(`<line x1="${x-100}" y1="269" x2="${x+100}" y2="269" stroke="#ff6b5a" stroke-width="5"/>`);});add('</g>');}
  if(t>TOP+.6){const p=back(P(t,TOP+.6,.4));g(`transform="translate(540,330) scale(${p}) translate(-540,-330)"`,()=>{bigText(540,300,'DISCIPLINE',130,1,AMB);bigText(540,420,'WINS.',130);});cue('impact',TOP+.65,.9);}
  if(t>33.2)label(540,1600,'EGO QUITS WHEN IT GETS HARD.',{size:30,op:P(t,33.2,.3),weight:900});
  if(t>33.6)label(540,1660,'MOTIVATION FADES.',{size:30,op:P(t,33.6,.3),weight:900});
  if(t>34.0){label(540,1740,'DISCIPLINE KEEPS GOING.',{size:38,op:P(t,34.0,.3),weight:900,fill:AMB});cue("ting",34.0,.6);}
  label(1040,58,'THE NEXT VERSION',{size:16,op:.45,anchor:'end',weight:800});
  cue('whistle',0,.5);cue('wind',30.1,.6);
}});
