/* ============ "5 TYPES OF PEOPLE CLIMBING A MOUNTAIN" — wordless short, ~36 s, sound effects only ============
   One scrolling mountain path. The camera follows the disciplined climber; the others drop out one by one,
   each lesson lands as they quit, and the summit stays hidden in cloud until ~5 s before the end. */
const S=[];
const AMB='#FFB547', RED='#ff6b5a';
const K=.55, AY=1250, V=120, TOP=31, SUM=V*TOP;   // slope, screen anchor, climb speed (px/s), summit time, summit x
const ANG=Math.atan(K)*180/Math.PI;
const AXt=t=>360;
const hgt=x=>x<=0?0:(x>=SUM?SUM*K:x*K);
function bigText(x,y,txt,size,op=1,fill='#fff'){add(`<text x="${x}" y="${y}" font-size="${size}" font-weight="900" letter-spacing="${size*.04}" text-anchor="middle" fill="${fill}" fill-opacity="${op}" stroke="#000" stroke-width="${size*.05}" paint-order="stroke" filter="url(#glowS)">${txt}</text>`);}

/* ---------- the five climbers (world x along the path) ---------- */
const disX=t=>t<TOP?V*t+4*Math.sin(t*1.6*Math.PI*2):SUM+70*eo(P(t,TOP,.5));
const sprX=t=>t<7?V*t+150+50*eo(P(t,0,6)):V*7+200;
const cmpX=t=>t<12?V*t-125:(t<13.6?V*12-125:V*12-125-70*(t-13.6));
const cplX=t=>t<18.6?V*t-250:V*18.6-250;
const drmX=()=>-560;
const STORM=[16.5,24.5];
const storm=t=>P(t,STORM[0],1)*(1-P(t,STORM[1],1));

/* ---------- props ---------- */
function bubbleT(x,y,txt,op=1){if(op<=0)return;const w=txt.length*16+48;x=clamp(x,w/2+16,1064-w/2);add(`<g opacity="${op}"><rect x="${x-w/2}" y="${y-34}" width="${w}" height="54" rx="27" fill="#fff"/><path d="M${x-14},${y+18} l-8,22 l24,-22 Z" fill="#fff"/></g>`);label(x,y+2,txt,{size:20,op:op,weight:900,fill:'#000',sp:.05});}
function banner(t0,t1,y,l1,l2){const p=P(T,t0,.25),o=1-P(T,t1,.3);if(p<=0||o<=0)return;const sc=lerp(1.6,1,eo(p));
  add(`<g opacity="${Math.min(1,p*2)*o}"><rect x="0" y="${y-92}" width="1080" height="200" fill="#000" opacity=".72"/>`);g(`transform="translate(540,${y}) scale(${sc}) translate(-540,${-y})"`,()=>{bigText(540,y-10,l1,74);bigText(540,y+72,l2,52,1,AMB);});add('</g>');cue('impact',t0+.05,.5);}
function ridge(off,y,amp,op,seed){let d=`M-20,1920 L-20,${y}`;for(let x=-20;x<=1120;x+=60){const xx=x+off;const h=Math.abs(Math.sin(xx*.004+seed))*amp+Math.abs(Math.sin(xx*.011+seed*2))*amp*.4;d+=` L${x},${y-h}`;}d+=' L1120,1920 Z';add(`<path d="${d}" fill="#0c0c0c" stroke="#fff" stroke-opacity="${op}" stroke-width="3"/>`);}
function rain(op){if(op<=0)return;let d='';for(let k=0;k<110;k++){const x=((k*97+T*160)%1260)-90,y=((k*233+T*1300)%2000)-60;d+=`<line x1="${x}" y1="${y}" x2="${x-16}" y2="${y+44}"/>`;}add(`<g stroke="#fff" stroke-opacity="${.32*op}" stroke-width="2.5">${d}</g>`);}
function sweat(x,y){for(let k=0;k<3;k++){const u=(T*1.8+k/3)%1;add(`<path d="M${x+k*22-20},${y+u*40} q-6,10 0,16 q6,-6 0,-16 Z" fill="#fff" opacity="${1-u}"/>`);}}

/* ---------- main ---------- */
S.push({s:0,e:END+1,cam:{zoom:0},draw:()=>{const t=T;
  const fz=eio(P(t,TOP+.2,1.4));
  const AX=AXt(t);const camX=Math.min(lerp(-760,disX(t)-AX,eio(P(t,1.4,3.2))),SUM-520);const fogX=disX(t)-camX+250;const hc=hgt(camX+AX);
  const sx=wx=>wx-camX, gy=wx=>AY-(hgt(wx)-hc);
  const st=storm(t);const flashOn=st>.5&&(Math.sin(t*2.3)>.985||Math.sin(t*3.7+1)>.99);
  const reveal=eio(P(t,30.0,1.0));
  g(`transform="translate(540,960) scale(${lerp(1,1.6,fz)}) translate(${-lerp(540,sx(SUM)+60,fz)},${-lerp(960,gy(SUM)-160,fz)})"`,()=>{
    // sky + distant ranges (parallax)
    if(reveal>0){const cx=sx(SUM+420),cy=gy(SUM)+40;add(`<circle cx="${cx}" cy="${cy}" r="340" fill="${AMB}" opacity="${.22*reveal}" filter="url(#glowL)"/><circle cx="${cx}" cy="${cy}" r="130" fill="#fff" opacity="${.9*reveal}" filter="url(#glow)"/>`);
      for(let k=0;k<12;k++){const a=Math.PI+k*Math.PI/11;add(`<line x1="${cx+Math.cos(a)*165}" y1="${cy+Math.sin(a)*165}" x2="${cx+Math.cos(a)*240}" y2="${cy+Math.sin(a)*240}" stroke="#fff" stroke-opacity="${.45*reveal}" stroke-width="4"/>`);}}
    ridge(camX*.12,760+hc*.08,260,.18,1.3);ridge(camX*.25,900+hc*.18,200,.28,2.7);
    // the mountain path
    const xs=[camX-80,0,SUM,camX+1180].filter(x=>x>=camX-80&&x<=camX+1180).sort((a,b)=>a-b);const pts=xs.map(x=>`${sx(x)},${gy(x)}`).join(' L');
    add(`<path d="M${pts} L${sx(camX+1180)},2100 L${sx(camX-80)},2100 Z" fill="#0a0a0a"/><path d="M${pts}" stroke="#fff" stroke-width="6" fill="none" stroke-linejoin="round" filter="url(#glowS)"/>`);
    for(let k=Math.floor((camX-80)/110);k<(camX+1180)/110;k++){const x=k*110;if(x<0||x>SUM)continue;const r=(k*37)%5;add(`<path d="M${sx(x)},${gy(x)+30+r*8} l22,-10 l18,14" stroke="#fff" stroke-opacity=".22" stroke-width="3" fill="none"/>`);}
    if(true){const fx=sx(SUM+330),fyy=gy(SUM);add(`<line x1="${fx}" y1="${fyy}" x2="${fx}" y2="${fyy-190}" stroke="#fff" stroke-width="5"/><path d="M${fx},${fyy-190} l${80+Math.sin(t*6)*6},26 l-${80+Math.sin(t*6)*6},26 Z" fill="${t>TOP?AMB:'#fff'}" filter="url(#glowS)"/>`);}
    // the climbers: [name, x, pose fn]
    const fig=(wx,o={})=>{const px=sx(wx),py=gy(wx);const lean=o.lean??(ANG*.55);g(`transform="translate(${px},${py}) rotate(${lean}) scale(${o.flip||1},1) translate(${-px},${-py})"`,()=>person(px,py,o.s||1.4,{ring:false,arm:o.arm,arm2:o.arm2,op:o.op??1,spot:o.spot||false,bob:o.bob||0}));return[px,py];};
    const walk=(ph,sp=7)=>{const c=Math.sin(t*sp+ph);return{arm:[38+c*24,40-Math.abs(c)*14],arm2:[-30+c*24,46-Math.abs(c)*12],bob:Math.abs(Math.cos(t*sp+ph))*6};};
    const tag=(px,py,n,col,dy=0)=>label(px,py-240-dy,n,{size:20,op:.95,weight:900,sp:.1,fill:col||'#fff'});
    // 1 THE DREAMER — sits at the bottom, dreaming of the top
    {const [px,py]=fig(drmX(),{lean:0,arm:[14,-34],arm2:[-30,52]});tag(px,py,'DREAMER');
      const b=P(t,.1,.3)*(1-P(t,3.2,.3));if(b>0){add(`<g opacity="${b}"><circle cx="${px+120}" cy="${py-330}" r="78" fill="#fff"/><circle cx="${px+56}" cy="${py-240}" r="13" fill="#fff"/><circle cx="${px+34}" cy="${py-205}" r="7" fill="#fff"/><path d="M${px+90},${py-300} l30,-55 l30,55 Z M${px+120},${py-355} l0,-28 l26,8 l-26,8" fill="none" stroke="#000" stroke-width="5"/></g>`);}}
    // 2 THE SPRINTER — flies ahead, burns out, collapses
    {const w=sprX(t);if(t<7){const o=walk(0,12);fig(w,{...o,arm:[60+Math.sin(t*12)*26,-20+Math.sin(t*12)*30],arm2:[-34-Math.sin(t*12)*26,-8-Math.sin(t*12)*30],lean:ANG*.8});const px=sx(w),py=gy(w);tag(px,py,'SPRINTER');
        if(t<4)for(let k=0;k<4;k++)add(`<line x1="${px-60-k*30}" y1="${py-60-k*28}" x2="${px-130-k*30}" y2="${py-60-k*28}" stroke="#fff" stroke-opacity=".35" stroke-width="4"/>`);bubbleT(px+20,py-300,'TOO EASY!',P(t,.8,.2)*(1-P(t,3.2,.2)));}
      else{const c=P(t,7,.6);const px=sx(w),py=gy(w);g(`transform="rotate(${-80*eo(c)},${px},${py})"`,()=>person(px,py,1.4,{ring:false,arm:[50,40],arm2:[-30,50]}));if(c>=1)sweat(px-80,py-110);label(px-60,py-150,'SPRINTER',{size:20,op:.6,weight:900,sp:.1});}
      cue('thud',7.45,.7);cue('pop',.8,.35);}
    // 3 THE COMPARER — keeps checking everyone else, stops, turns back
    {const w=cmpX(t);const px=sx(w),py=gy(w);
      if(t<12){fig(w,walk(1.3));if(t>8&&t<12){const look=Math.sin(t*2)>0;label(px+(look?60:-60),py-160,look?'?':'?',{size:44,op:.9,weight:900,fill:AMB});}}
      else if(t<13.6){fig(w,{lean:0,arm:[44,-30],arm2:[-30,52]});add(`<circle cx="${px+48}" cy="${py-120}" r="44" fill="url(#bk)" fill-opacity=".35"/><rect x="${px+36}" y="${py-142}" width="24" height="42" rx="5" fill="#0b0b0b" stroke="#fff" stroke-width="3"/>`);}
      else fig(w,{...walk(1.3,6),flip:-1,lean:-ANG*.3});
      tag(px,py,'COMPARER');bubbleT(px+60,py-300,'WHY ARE THEY AHEAD?',P(t,12.2,.2)*(1-P(t,14.2,.2)));cue('pop',12.2,.35);}
    // 4 THE COMPLAINER — climbs until the storm, then sits down and moans
    {const w=cplX(t);const px=sx(w),py=gy(w);if(t<18.6)fig(w,walk(2.6));else{fig(w,{lean:0,arm:[30,60],arm2:[-30,60]});const s=Math.sin(t*30)*3;add(`<g stroke="${RED}" stroke-width="5" stroke-linecap="round"><path d="M${px-26+s},${py-190} l-10,-16 M${px},${py-200} l0,-20 M${px+26+s},${py-190} l10,-16"/></g>`);}
      tag(px,py,'COMPLAINER',null,40);bubbleT(px+80,py-300,"THIS ISN'T FAIR!",P(t,18.8,.2)*(1-P(t,21.4,.2)));cue('pop',18.8,.35);}
    // 5 THE DISCIPLINED — same pace, every step, through the storm
    {const w=disX(t);let o=walk(3.9);if(t>TOP+.3)o={arm:[44,-90+Math.sin(t*8)*6],arm2:[-44,-90-Math.sin(t*8)*6],lean:0,spot:true};const [px,py]=fig(w,o);tag(px,py,'DISCIPLINED',AMB);
      if(t<TOP)for(let k=0;k*.5<TOP;k++)cue('step',k*.5,.3);cue('win',TOP+.1,.8);}
    // cloud ahead: the summit is hidden until the reveal
    const fo=1-reveal;if(fo>0){add(`<linearGradient id="fogG" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="1"/></linearGradient><rect x="${fogX}" y="0" width="140" height="1920" fill="url(#fogG)" opacity="${fo}"/><rect x="${fogX+138}" y="0" width="${900}" height="1920" fill="#000" opacity="${fo}"/>`);
      for(let k=0;k<6;k++){const y=200+k*290,x=fogX+90+Math.sin(t*.4+k)*30;add(`<ellipse cx="${x}" cy="${y}" rx="130" ry="40" fill="#fff" opacity="${.05*fo}"/>`);}}
  });
  // weather
  rain(st);if(flashOn)add(`<rect width="1080" height="1920" fill="#fff" opacity=".22"/>`);[17.3,19.6,21.9,23.4].forEach(x=>cue('impact',x,.35));if(st>0)cue('wind',16.6,.8);
  if(t>TOP+.3)for(let k=0;k<36;k++){const x=(k*137)%1080,y=((k*97+(t-TOP-.3)*300)%1600)+120;add(`<rect x="${x}" y="${y}" width="12" height="20" fill="${k%3?'#fff':AMB}" opacity=".75" transform="rotate(${k*40+t*200},${x},${y})"/>`);}
  // HUD: title, then the climbers-left counter
  const ho=1-P(t,4.0,.4);if(ho>0)add(`<g opacity="${ho}"><rect x="90" y="140" width="900" height="110" rx="55" fill="#fff" filter="url(#glow)"/><text x="540" y="216" font-size="54" font-weight="900" letter-spacing="2" text-anchor="middle" fill="#000">WHO REACHES THE TOP?</text></g>`);
  const left=5-[t>=.5,t>=7.4,t>=13.6,t>=18.6].filter(Boolean).length;
  if(t>4.3&&t<TOP){const o=P(t,4.3,.3)*(1-P(t,TOP-.4,.3));label(540,190,'STILL CLIMBING',{size:22,op:.7*o,weight:900});add(`<g opacity="${o}">`);for(let k=0;k<5;k++){const x=540+(k-2)*80,on=k<left;add(`<circle cx="${x}" cy="245" r="24" fill="${on?(k===0?AMB:'#fff'):'none'}" stroke="#fff" stroke-opacity="${on?1:.3}" stroke-width="3"/>`);}add('</g>');}
  // lessons, the moment each one drops out
  banner(.5,3.0,560,'THE DREAMER','NEVER TAKES THE FIRST STEP.');
  banner(8.0,11.2,560,'THE SPRINTER','BURNS OUT BEFORE HALFWAY.');
  banner(14.0,17.0,560,'THE COMPARER','FORGETS THEIR OWN CLIMB.');
  banner(19.6,23.0,560,'THE COMPLAINER','QUITS WHEN IT STORMS.');
  if(t>30.1&&t<TOP+.3)label(540,200,'THE TOP',{size:32,op:P(t,30.1,.3)*(1-P(t,TOP+.1,.2)),weight:900,fill:AMB});
  if(t>TOP+.6){const p=back(P(t,TOP+.6,.4));g(`transform="translate(540,330) scale(${p}) translate(-540,-330)"`,()=>{bigText(540,300,'ONLY DISCIPLINE',100,1,AMB);bigText(540,410,'REACHES THE TOP.',84);});cue('impact',TOP+.65,.9);}
  if(t>33.6){const p=back(P(t,33.6,.35));g(`transform="translate(540,1700) scale(${p}) translate(-540,-1700)"`,()=>{add(`<rect x="200" y="1640" width="680" height="96" rx="48" fill="#fff" filter="url(#glow)"/>`);label(540,1704,'WHICH ONE ARE YOU?',{size:40,op:1,weight:900,fill:'#000',sp:.08});});cue('pop',33.6,.6);}
  label(1040,58,'THE NEXT VERSION',{size:16,op:.45,anchor:'end',weight:800});
  cue('whistle',0,.5);cue('wind',30.1,.6);
}});
