/* ============ "EGO vs MOTIVATION vs DISCIPLINE" — wordless boulder short, ~33 s ============ */
const S=[];
const AMB='#FFB547';
const X0=110,X1=930,RISE=270,R=60;
const LANES=[{n:'EGO',base:760},{n:'MOTIVATION',base:1170},{n:'DISCIPLINE',base:1580}];
const slopeY=(L,x)=>x<=X0?L.base:(x>=X1?L.base-RISE:L.base-(x-X0)/(X1-X0)*RISE);
const ANG=Math.atan2(RISE,X1-X0)*180/Math.PI;
function bigText(x,y,txt,size,op=1,fill='#fff'){add(`<text x="${x}" y="${y}" font-size="${size}" font-weight="900" letter-spacing="${size*.04}" text-anchor="middle" fill="${fill}" fill-opacity="${op}" stroke="#000" stroke-width="${size*.05}" paint-order="stroke" filter="url(#glowS)">${txt}</text>`);}

/* ---------- progress up the hill (0 = bottom, 1 = summit) ---------- */
function uEgo(t){if(t<2.6)return 0;if(t<7.6)return .62*eo(P(t,2.6,5));if(t<8.2)return .62;if(t<9.3)return .62*(1-Math.pow(P(t,8.2,1.1),2));return 0;}
function uMot(t){if(t<2.6)return 0;if(t<13.4)return .5*Math.sin(Math.PI/2*P(t,2.6,10.8));if(t<15.2)return .5;if(t<16.8)return .5*(1-Math.pow(P(t,15.2,1.6),2));return 0;}
function uDis(t){if(t<2.6)return 0;const v=P(t,2.6,23.4);const step=(t*1.6)%1;return Math.min(1,v-.006*Math.sin(step*Math.PI*2));}
function energy(t){return t<6?1:clamp(1-(t-6)/7.2);}

/* ---------- props ---------- */
function hill(L,op=1){const p=`M-20,${L.base} L${X0},${L.base} L${X1},${L.base-RISE} L1100,${L.base-RISE}`;add(`<path d="${p} L1100,${L.base+200} L-20,${L.base+200} Z" fill="#090909" opacity="${op}"/><path d="${p}" stroke="#fff" stroke-opacity="${.85*op}" stroke-width="5" fill="none" stroke-linejoin="round" filter="url(#glowS)"/>`);
  for(let k=0;k<9;k++){const x=X0+60+k*95;add(`<line x1="${x}" y1="${slopeY(L,x)+18}" x2="${x+26}" y2="${slopeY(L,x+26)+18}" stroke="#fff" stroke-opacity="${.18*op}" stroke-width="3"/>`);}}
function flag(L,op=1,up=0){const x=1010,y=L.base-RISE;add(`<g opacity="${op}"><line x1="${x}" y1="${y}" x2="${x}" y2="${y-130-up*40}" stroke="#fff" stroke-width="5"/><path d="M${x},${y-130-up*40} l${70+Math.sin(T*6)*6},22 l-${70+Math.sin(T*6)*6},22 Z" fill="${up?AMB:'#fff'}" filter="url(#glowS)"/></g>`);}
function boulder(x,y,rot,op=1,r=R){add(`<g opacity="${op}" transform="rotate(${rot},${x},${y})"><circle cx="${x}" cy="${y}" r="${r}" fill="#141414" stroke="#fff" stroke-width="5" filter="url(#glowS)"/><path d="M${x-r*.5},${y-r*.2} q${r*.3},-${r*.3} ${r*.6},-${r*.1} M${x+r*.1},${y+r*.45} q${r*.2},-${r*.2} ${r*.45},0 M${x-r*.35},${y+r*.25} l${r*.15},${r*.12}" stroke="#fff" stroke-opacity=".45" stroke-width="3" fill="none"/></g>`);}
function crown(x,y,s=1,rot=0){add(`<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><path d="M-30,10 L-34,-22 L-14,-4 L0,-28 L14,-4 L34,-22 L30,10 Z" fill="${AMB}" stroke="#000" stroke-width="3" filter="url(#glowS)"/></g>`);}
function meterBar(x,y,v,lab){add(`<rect x="${x-90}" y="${y}" width="180" height="22" rx="11" fill="none" stroke="#fff" stroke-width="3"/><rect x="${x-86}" y="${y+4}" width="${Math.max(0,172*v)}" height="14" rx="7" fill="${v<.3?'#ff6b5a':AMB}"/>`);label(x,y-10,lab,{size:16,op:.8,weight:900});}
function cloud(x,y,op){add(`<g opacity="${op}"><path d="M${x-120},${y} a50,50 0 0 1 60,-60 a70,70 0 0 1 120,10 a50,50 0 0 1 60,50 Z" fill="#1a1a1a" stroke="#fff" stroke-opacity=".6" stroke-width="4"/></g>`);let d='';for(let k=0;k<14;k++){const xx=x-110+(k*37)%230,yy=y+20+((k*53+T*700)%300);d+=`<line x1="${xx}" y1="${yy}" x2="${xx-6}" y2="${yy+26}"/>`;}add(`<g stroke="#fff" stroke-opacity="${.45*op}" stroke-width="2.5">${d}</g>`);}
function bubbleT(x,y,txt,op=1){if(op<=0)return;const w=txt.length*17+50;add(`<g opacity="${op}"><rect x="${x-w/2}" y="${y-36}" width="${w}" height="58" rx="29" fill="#fff"/><path d="M${x-16},${y+20} l-8,24 l26,-24 Z" fill="#fff"/></g>`);label(x,y+2,txt,{size:22,op:op,weight:900,fill:'#000',sp:.06});}

/* ---------- one lane ---------- */
function lane(i,t,{op=1,focus=false}={}){const L=LANES[i];hill(L,op);flag(L,op,i===2&&t>26?1:0);
  const u=[uEgo,uMot,uDis][i](t);const bx=lerp(X0+R+30,X1-R+10,u),by=slopeY(L,bx)-R-2;const rot=(bx-X0)/R*57.3;
  add(`<g opacity="${op}">`);
  // hook: the boulder drops in from the sky
  const dropT=.02+i*.3,dp=P(t,dropT,.3);const dy=dp<1?-(1-dp*dp)*700:0;if(dp>0)boulder(bx,by+dy,rot);cue('impact',dropT+.3,.5+i*.12);
  let px=bx-R-34,py=slopeY(L,px),lean=ANG+12,arm=[62,-58],arm2=[46,-34],sc=1.15,flip=1,show=t>dropT+.25,extra=null;
  if(i===0){// EGO: sprints, shows off, slips, rage-quits
    if(t<2.6){lean=0;arm=[40,-80];arm2=[-40,-80];}
    if(t>7.6&&t<8.2){lean=ANG+12+Math.sin(t*60)*6;}
    if(t>=8.2&&t<9.6){const f=P(t,8.2,1.2);px=lerp(bx-R-34,X0-60,f);py=slopeY(L,px);lean=-200*f;}
    if(t>=9.6&&t<11.3){px=X0-60;py=L.base;lean=0;arm=[70,-70];arm2=[-70,-70];extra='mad';}
    if(t>=11.3){const w=P(t,11.3,1.6);px=lerp(X0-60,-160,w);py=L.base;lean=-4;arm=[30,50];arm2=[-30,50];flip=-1;}
    if(t>2.6&&t<8.2)crown(px+(t<8.2?0:0),py-sc*160,1,0);
    if(t>=8.2){const c=P(t,8.2,1.0);crown(lerp(bx,X0+140,c),lerp(by-80,L.base-14,c),.9,c*160);}
    bubbleT(px+60,py-240,'TOO EASY.',P(t,3.4,.2)*(1-P(t,5.6,.2)));bubbleT(X0+120,L.base-230,'THIS IS POINTLESS.',P(t,10.0,.2)*(1-P(t,12.4,.3)));
    cue('thud',8.25,.7);cue('hit',9.3,.6);cue('whoosh',8.3,.6);cue('pop',3.4,.4);cue('pop',10.0,.4);}
  if(i===1){// MOTIVATION: bursts of energy, drains, gives up, scrolls
    const e=energy(t);if(t>2.6&&t<16)meterBar(px,py-220,e,'ENERGY');
    if(t<2.6){lean=0;arm=[50,-90];arm2=[-50,-90];}
    if(t>=13.4&&t<15.2){lean=lerp(ANG+12,4,P(t,13.4,.6));arm=[30,40];arm2=[-30,40];}
    if(t>=15.2){px=X0+330;py=slopeY(L,px);lean=0;arm=[44,-20];arm2=[-30,50];extra='phone';}
    if(t>2.6&&t<6)for(let k=0;k<5;k++){const a=t*4+k*1.26;add(`<circle cx="${px+Math.cos(a)*70}" cy="${py-90+Math.sin(a)*70}" r="4" fill="${AMB}" opacity=".8"/>`);}
    bubbleT(px+170,py-270,"LET'S GOOO!",P(t,3.0,.2)*(1-P(t,5.2,.2)));bubbleT(X0+400,L.base-RISE*.3-250,'MAYBE TOMORROW...',P(t,15.4,.2)*(1-P(t,19.4,.3)));
    if(t>13)cloud(px+(t<15.2?0:0)+60,py-330,P(t,13,.8)*(1-P(t,24,1)));cue('pop',3.0,.4);cue('pop',15.4,.4);cue('thud',16.8,.4);}
  if(i===2){// DISCIPLINE: same pace, every day, rain or shine
    if(t<2.6){lean=0;arm=[40,58];arm2=[-40,58];}
    if(t>26){px=bx+R+40;py=L.base-RISE;lean=0;arm=[44,-90+Math.sin(t*8)*6];arm2=[-44,-90-Math.sin(t*8)*6];}
    if(t>2.6&&t<26){const d=Math.floor(1+P(t,2.6,23.4)*364);label(px,py-200,'DAY '+d,{size:24,op:.9,weight:900,sp:.1});for(let k=0;k<Math.floor((t-2.6)/.625);k++)if(k<38)cue('step',2.6+k*.625,.35);}
    if(t>14&&t<20.5)cloud(px+40,py-235,P(t,14,.6)*(1-P(t,19.8,.6)));
    if(t>26)cue('win',26.1,.8);}
  if(show){g(`transform="translate(${px},${py}) rotate(${lean}) scale(${flip},1) translate(${-px},${-py})"`,()=>person(px,py,sc,{ring:false,arm,arm2,spot:focus&&t>26}));}
  if(extra==='mad'){const s=Math.sin(t*40)*4;add(`<g stroke="#ff6b5a" stroke-width="5" stroke-linecap="round"><path d="M${px-30+s},${py-200} l-12,-18 M${px},${py-210} l0,-22 M${px+30+s},${py-200} l12,-18"/></g>`);}
  if(extra==='phone'){add(`<circle cx="${px+40}" cy="${py-110}" r="40" fill="url(#bk)" fill-opacity=".3"/><rect x="${px+28}" y="${py-130}" width="24" height="40" rx="5" fill="#0b0b0b" stroke="#fff" stroke-width="3"/>`);}
  add('</g>');
  if(op>.5){pillShape(110,L.base-RISE-70+40,L.n,{size:22,dark:i!==2});}}

/* ---------- main ---------- */
S.push({s:0,e:END+1,cam:{zoom:0},draw:()=>{const t=T;
  const fz=eio(P(t,26.2,1.6));const z=lerp(1,1.85,fz),fx=lerp(540,830,fz),fy=lerp(980,LANES[2].base-RISE-60,fz);
  const shake=(t>.32&&t<1.4?Math.sin(t*80)*8*(1-P(t,.32,1.05)):0)+(t>8.2&&t<8.6?Math.sin(t*90)*6:0);
  if(fz>0)add(`<circle cx="540" cy="760" r="${300+fz*300}" fill="${AMB}" opacity="${.12*fz}" filter="url(#glowL)"/>`);
  g(`transform="translate(${540+shake},${980}) scale(${z}) translate(${-fx},${-fy})"`,()=>{
    if(fz>0){const sx=1010,sy=LANES[2].base-RISE;add(`<circle cx="${sx}" cy="${sy+20}" r="${180}" fill="#fff" opacity="${.85*fz}" filter="url(#glow)"/>`);for(let k=0;k<14;k++){const a=Math.PI+k*Math.PI/13;add(`<line x1="${sx+Math.cos(a)*220}" y1="${sy+20+Math.sin(a)*220}" x2="${sx+Math.cos(a)*300}" y2="${sy+20+Math.sin(a)*300}" stroke="#fff" stroke-opacity="${.4*fz}" stroke-width="4"/>`);}}
    [0,1,2].forEach(i=>lane(i,t,{op:i===2?1:1-.85*fz,focus:i===2}));
    add(`<line x1="0" y1="${(LANES[0].base+LANES[1].base-RISE)/2+60}" x2="1080" y2="${(LANES[0].base+LANES[1].base-RISE)/2+60}" stroke="#fff" stroke-opacity="${.12*(1-fz)}" stroke-width="2"/><line x1="0" y1="${(LANES[1].base+LANES[2].base-RISE)/2+60}" x2="1080" y2="${(LANES[1].base+LANES[2].base-RISE)/2+60}" stroke="#fff" stroke-opacity="${.12*(1-fz)}" stroke-width="2"/>`);});
  // confetti at the summit
  if(t>26.3)for(let k=0;k<34;k++){const x=(k*137)%1080,y=((k*97+(t-26.3)*300)%1500)+150;add(`<rect x="${x}" y="${y}" width="12" height="20" fill="${k%3?'#fff':AMB}" opacity=".75" transform="rotate(${k*40+t*200},${x},${y})"/>`);}
  // hook title + scoreboard
  const ho=1-P(t,4.2,.4);if(ho>0)add(`<g opacity="${ho}"><rect x="90" y="140" width="900" height="110" rx="55" fill="#fff" filter="url(#glow)"/><text x="540" y="216" font-size="54" font-weight="900" letter-spacing="2" text-anchor="middle" fill="#000">WHO REACHES THE TOP?</text></g>`);
  if(t>8.3&&t<26){const o=P(t,8.3,.3)*(1-P(t,25.6,.3));add(`<g opacity="${o}">`);label(540,210,'STILL CLIMBING',{size:22,op:.7,weight:900});
    [['EGO',t<8.2],['MOTIVATION',t<15.2],['DISCIPLINE',true]].forEach(([n,ok],k)=>{const x=250+k*290;add(`<rect x="${x-125}" y="240" width="250" height="58" rx="29" fill="${ok?'#fff':'none'}" stroke="#fff" stroke-opacity="${ok?1:.35}" stroke-width="3"/>`);label(x,278,n,{size:20,op:ok?1:.4,weight:900,fill:ok?'#000':'#fff'});if(!ok)add(`<line x1="${x-100}" y1="269" x2="${x+100}" y2="269" stroke="#ff6b5a" stroke-width="5"/>`);});add('</g>');}
  // the ending
  if(t>27.2){const p=back(P(t,27.2,.4));g(`transform="translate(540,330) scale(${p}) translate(-540,-330)"`,()=>{bigText(540,300,'DISCIPLINE',130,1,AMB);bigText(540,420,'WINS.',130);});cue('impact',27.25,.9);}
  if(t>29.0){const o=P(t,29.0,.4);label(540,1580,'EGO QUITS WHEN IT GETS HARD.',{size:30,op:o,weight:900});}
  if(t>29.9){const o=P(t,29.9,.4);label(540,1640,'MOTIVATION FADES.',{size:30,op:o,weight:900});}
  if(t>30.8){const o=P(t,30.8,.4);label(540,1720,'DISCIPLINE KEEPS GOING.',{size:38,op:o,weight:900,fill:AMB});cue('ting',30.8,.6);}
  label(1040,58,'THE NEXT VERSION',{size:16,op:.45,anchor:'end',weight:800});
  if(t>.32&&t<.47)add(`<rect width="${W}" height="${H}" fill="#fff" opacity="${(1-P(t,.32,.15))*.3}"/>`);
}});
