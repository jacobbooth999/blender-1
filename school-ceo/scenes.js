/* ============ "YOUR EXCUSES ARE TRAPPING YOU" — vertical, ~32 s, loops ============ */
const S=[];
const l=i=>L[i].s, le=i=>L[i].e;
const SG=1290, NL=TIMING.lines.length;
const SEG=[0];for(let i=1;i<NL;i++)SEG.push(l(i)-.1);SEG.push(END);
function segAt(t){for(let i=SEG.length-2;i>=0;i--)if(t>=SEG[i])return i;return 0;}
const resetAt=l(NL-1)+.4;

/* ---------- word captions ---------- */
const CAP=[];TIMING.lines.forEach((ln,i)=>{if(i<1)return;const w=ln.text.replace('C E O','CEO').split(' ');const tot=w.reduce((a,x)=>a+x.length+2,0);let t=ln.start;
  const words=w.map(x=>{const d=(ln.end-ln.start)*(x.length+2)/tot;const o={w:x.toUpperCase(),s:t,e:t+d};t+=d;return o;});
  let ch=[];words.forEach(o=>{const len=ch.reduce((a,x)=>a+x.w.length+1,0);if(ch.length>=3||len+o.w.length>15){CAP.push(ch);ch=[];}ch.push(o);});if(ch.length)CAP.push(ch);});
function captions(t){const ch=CAP.find(c=>t>=c[0].s-.02&&t<c[c.length-1].e+.08);if(!ch)return;const size=78,Y=1430;
  const widths=ch.map(o=>o.w.length*size*.8+30);const tw=widths.reduce((a,b)=>a+b,0)+(ch.length-1)*22;let x=540-tw/2;
  ch.forEach((o,k)=>{const cur=t>=o.s&&t<o.e+(k===ch.length-1?.08:0);const w=widths[k];const pk=cur?1+.08*(1-eo(P(t,o.s,.12))):1;
    g(`transform="translate(${x+w/2},${Y}) scale(${pk}) translate(${-(x+w/2)},${-Y})"`,()=>{if(cur)add(`<rect x="${x}" y="${Y-56}" width="${w}" height="96" rx="16" fill="#fff" filter="url(#glow)"/>`);
      add(`<text x="${x+w/2}" y="${Y+26}" font-size="${size}" font-weight="900" letter-spacing="1.5" text-anchor="middle" fill="${cur?'#000':'#fff'}" stroke="${cur?'none':'#000'}" stroke-width="6" paint-order="stroke">${o.w}</text>`);});x+=w+22;});}
function bigText(x,y,txt,size,op=1){add(`<text x="${x}" y="${y}" font-size="${size}" font-weight="900" letter-spacing="${size*.06}" text-anchor="middle" fill="#fff" fill-opacity="${op}" filter="url(#glowL)">${txt}</text>`);}

/* ---------- "SCHOOL MAKES WORKERS" — props ---------- */
function desk(x,g,s=1){add(`<g filter="url(#glowS)" stroke="#fff" stroke-width="3" fill="#0b0b0b"><rect x="${x-60*s}" y="${g-70*s}" width="${120*s}" height="14" rx="4"/><line x1="${x-50*s}" y1="${g-56*s}" x2="${x-50*s}" y2="${g}"/><line x1="${x+50*s}" y1="${g-56*s}" x2="${x+50*s}" y2="${g}"/></g>`);}
function badge(x,y,s=1,txt='EMPLOYEE'){add(`<rect x="${x-40*s}" y="${y-14*s}" width="${80*s}" height="28*s" rx="5" fill="#fff"/>`.replace('28*s',String(28*s)));label(x,y+5*s,txt,{size:10*s,op:1,fill:'#000',weight:900,sp:.1});}
function machine(x,y,t){add(`<rect x="${x-150}" y="${y-300}" width="300" height="300" rx="20" fill="#0b0b0b" stroke="#fff" stroke-width="5" filter="url(#glowS)"/>`);label(x,y-245,'SCHOOL',{size:30,op:1,weight:900,sp:.12});
  icon('gear',x-45,y-140,1.0);g(`transform="rotate(${T*120},${x+50},${y-110})"`,()=>icon('gear',x+50,y-110,.7));g(`transform="rotate(${-T*90},${x-45},${y-140})"`,()=>{});
  add(`<rect x="${x-150}" y="${y-110}" width="30" height="110" fill="#000" stroke="#fff" stroke-width="3"/><rect x="${x+120}" y="${y-110}" width="30" height="110" fill="#000" stroke="#fff" stroke-width="3"/>`);}
function belt(y,t){add(`<rect x="-20" y="${y}" width="1120" height="26" rx="13" fill="#0b0b0b" stroke="#fff" stroke-width="4"/>`);for(let k=0;k<24;k++){const x=((k*60+t*180)%1200)-60;add(`<line x1="${x}" y1="${y+4}" x2="${x+18}" y2="${y+22}" stroke="#fff" stroke-opacity=".4" stroke-width="3"/>`);}
  [60,340,740,1020].forEach(x=>add(`<line x1="${x}" y1="${y+26}" x2="${x}" y2="${SG}" stroke="#fff" stroke-opacity=".4" stroke-width="3"/>`));}

/* ---------- hook: the school conveyor belt ---------- */
function hookScene(t,frozen){const by=1150,mx=540;const tt=frozen?0:t;
  // dashed CEO door that everyone passes
  const dp=frozen?1:P(t,1.5,.4);add(`<g opacity="${dp}"><rect x="${mx+190}" y="380" width="200" height="300" rx="10" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="14 10" filter="url(#glowS)"/>`);label(mx+290,350,'CEO',{size:30,op:1,weight:900,sp:.12});add('</g>');
  belt(by,tt);
  for(let k=0;k<6;k++){const x=((k*210+tt*180+20)%1260)-140;const out=x>mx+150;const op=x>mx-150&&x<mx+150?0:1;
    person(x,by,.65,{ring:false,op,arm:out?[30,40]:null,arm2:out?[-30,40]:null});if(out){badge(x,by-80,.9);}}
  machine(mx,by,tt);
  // the EMPLOYEE stamp slams down at 0.6 s on the first one out
  const sp=frozen?1:back(P(t,.55,.25));const stx=mx+300;if(sp>0)g(`transform="translate(${stx},860) rotate(-10) scale(${frozen?1:lerp(2.2,1,clamp(P(t,.55,.18)))}) translate(${-stx},-860)" opacity="${Math.min(1,sp)}"`,()=>{add(`<rect x="${stx-200}" y="800" width="400" height="120" rx="14" fill="none" stroke="#fff" stroke-width="9" filter="url(#glow)"/>`);bigText(stx,885,'EMPLOYEE',64);});}

/* ---------- segments ---------- */
function stage(vs,t,k,reset){const cx=540;ground(SG,1,{op:.45});
  if(vs===0||reset){hookScene(reset?0:t,reset);return;}
  if(vs===1){bigText(cx,640,'THINK',140);bigText(cx,770,'ABOUT IT.',110);person(cx,SG,1.1,{spot:true,arm:[14,-34]});return;}
  if(vs>=2&&vs<=4){// classroom rows
    const hand=t>l(2)+.75&&t<l(2)+1.6;for(let r=0;r<2;r++)for(let c=0;c<4;c++){const x=200+c*230,g=980+r*230;desk(x,g,1.1);person(x,g-10,.62,{ring:false,arm:hand&&vs===2?[20,-90]:null,op:.85});}
    if(vs===2){['SIT DOWN.','RAISE YOUR HAND.','WAIT FOR THE BELL.'].forEach((s,j)=>pill(l(2)+[0,.7,1.4][j],cx,430+j*80,s,{size:24,dark:j<2}));const sh=t>l(2)+1.4?Math.sin(t*50)*6:0;icon('clock',900+sh,300,1);cue('tick',l(2)+1.5,.6);cue('tick',l(2)+1.65,.6);}
    if(vs===3){pill(k+.1,cx,470,'FOLLOW INSTRUCTIONS',{size:26});const st=back(P(t,k+1.2,.35));if(st>0)g(`transform="translate(430,700) scale(${st}) translate(-430,-700)"`,()=>{icon('star',430,700,1.6);label(430,790,'GOLD STAR',{size:20,op:.9,weight:900});});cue('win',k+1.2,.5);}
    if(vs===4){add(`<rect x="320" y="400" width="440" height="380" rx="14" fill="#0b0b0b" stroke="#fff" stroke-width="4" filter="url(#glowS)"/>`);label(cx,450,'TEST',{size:22,op:.7,weight:900});[0,1,2].forEach(j=>add(`<line x1="360" y1="${510+j*60}" x2="${600}" y2="${510+j*60}" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>`));
      cross(680,570,1.2,.95,P(t,k+.5,.25));pop(k+.9,cx,730,()=>bigText(cx,750,'-10',80),{snd:'nope',vol:.5});}
    return;}
  if(vs===5){for(let r=0;r<2;r++)for(let c=0;c<4;c++){const x=200+c*230,g=980+r*230;add(`<rect x="${x-90}" y="${g-150}" width="180" height="150" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>`);person(x,g-10,.62,{ring:false,op:.85});badge(x,g-80,.8);}
    pill(k+.3,cx,560,'PERFECT EMPLOYEE',{size:28,dark:true});return;}
  if(vs===6){bigText(cx,560,'A CEO NEEDS',96);bigText(cx,680,'THE OPPOSITE',96);const r=eio(P(t,k+.4,.6));g(`transform="rotate(${r*180},${cx},850)"`,()=>{add(`<path d="M${cx-90},850 a90,90 0 1 1 90,90" fill="none" stroke="#fff" stroke-width="7" filter="url(#glowS)"/><path d="M${cx-20},925 l20,15 l-20,15" stroke="#fff" stroke-width="7" fill="none"/>`);});person(cx,SG,1.05,{spot:true});return;}
  if(vs===7){const gx=440,gw=220;add(`<path d="M-20,${SG} L${gx},${SG} L${gx},${SG+300}" fill="none" stroke="#fff" stroke-width="4"/><path d="M${gx+gw},${SG+300} L${gx+gw},${SG} L1100,${SG}" fill="none" stroke="#fff" stroke-width="4"/>`);
    const j=P(t,k+.2,.7);const[px,py]=j<=0?[300,SG]:hopTo(300,SG,800,SG,eio(j),260);person(px,py,1,{spot:.7,ring:false,arm:j>0&&j<1?[50,-80]:null,arm2:j>0&&j<1?[-50,-80]:null});pill(k+.1,cx,520,'RISK',{size:32});cue('whoosh',k+.2,.6);return;}
  if(vs===8){const pts=[[200,1050],[330,980],[420,1120],[540,880],[620,1000],[760,720],[880,640]];const tip=polyline(pts,P(t,k+.1,1.4),{sw:6});if(tip)orb(tip[0],tip[1],8);
    if(t>k+.6)cross(420,1150,.7,.8,1);if(t>k+1.0)cross(620,1030,.7,.8,1);if(t>k+1.4)check(880,600,1.4);pill(k+.3,cx,480,'FAIL FAST. LEARN.',{size:28});return;}
  if(vs===9){person(cx,SG,1.1,{spot:true,arm:[26,-80]});pop(k+.2,cx,620,()=>bigText(cx,660,'WHY?',170),{snd:'hit',vol:.6});
    pop(k+1.0,cx,860,()=>{pillShape(cx,860,'WAITING FOR INSTRUCTIONS',{size:22,dark:true});strike(cx-300,cx+300,860,P(t,k+1.4,.3));},{vol:.4});return;}
  if(vs===10){const x0=200,y0=420;for(let r=0;r<4;r++)for(let c=0;c<5;c++)add(`<rect x="${x0+c*136}" y="${y0+r*70}" width="128" height="62" rx="6" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2.5"/>`);label(cx,400,'TIMETABLE',{size:20,op:.7,weight:900});
    cross(cx,560,3,.9,P(t,k+.6,.3));drawPath(`M120,${SG-20} C 300,${SG-200} 500,${SG+20} 700,${SG-140} S 960,${SG-60} 1040,${SG-200}`,eo(P(t,k+.4,1.4)),{sw:4,dash:'12 10',glow:'glowS'});
    const u=clamp((t-k-.4)/1.4);person(lerp(120,960,u),SG,.9,{spot:.6,ring:false,bob:Math.abs(Math.sin(t*14))*6});return;}
  if(vs===11){icon('house',380,700,2.4);label(380,830,'SCHOOL',{size:22,op:.85,weight:900});check(470,600,1.4*back(P(t,k+.4,.3)));
    add(`<rect x="640" y="580" width="260" height="260" rx="20" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="14 10"/>`);label(770,720,'?',{size:80,op:.8,weight:900,sp:0});label(770,880,'THE REST',{size:22,op:.85,weight:900});
    person(cx,SG,1,{spot:.6});return;}
  if(vs===12){icon('moon',860,420,1,.6);icon('book',cx+30,SG-210,1);person(cx-60,SG,1.1,{spot:true,arm:[60,-40]});[0,1,2].forEach(j=>pop(k+.4+j*.4,360+j*180,560,()=>icon('bulb',360+j*180,560,.9),{snd:'pop',vol:.35}));pill(k+.2,cx,420,'TEACH YOURSELF',{size:28});return;}
  if(vs===13||vs===14){person(cx,SG,1.05,{spot:true,arm:[44,-80]});[['dollar','MONEY',0],['handshake','SELLING',.65],['gear','BUILDING',1.3]].forEach(([ic,tx,d],j)=>{const x=220+j*320;pop(l(13)+d,x,640,()=>{box(x-140,500,280,290,{r:24,op:.95});icon(ic,x,610,1.3);label(x,740,tx,{size:24,op:1,weight:900});},{snd:'hit',vol:.45});});return;}}

/* ---------- main ---------- */
S.push({s:0,e:END+1,cam:{zoom:0},draw:()=>{
  const t=T,seg=segAt(t),k=SEG[seg];const reset=seg===NL-1&&t>resetAt;const vs=reset?0:seg;
  const punch=1+.04*(1-eo(P(t,k,.35)));const sh=P(t,.55,.3),am=sh>0&&sh<1?(1-sh)*22:0;
  add(`<circle cx="540" cy="700" r="480" fill="url(#bk)" fill-opacity=".05"/>`);
  g(`transform="translate(${540+Math.sin(t*90)*am},${800+Math.cos(t*80)*am}) scale(${punch}) translate(-540,-800)"`,()=>stage(vs,t,k,reset));
  const so=reset?P(t,resetAt,.2):1-P(t,2.9,.3);if(so>0)add(`<g opacity="${so}"><rect x="90" y="140" width="900" height="110" rx="55" fill="#fff" filter="url(#glow)"/><text x="540" y="217" font-size="52" font-weight="900" letter-spacing="2" text-anchor="middle" fill="#000">SCHOOL WON'T TELL YOU THIS</text></g>`);
  label(1040,58,'THE NEXT VERSION',{size:16,op:.45,anchor:'end',weight:800});
  const hb=t<le(0)+.1?1:(reset?P(t,resetAt,.15):0);
  if(hb>0){add(`<g opacity="${hb}"><rect x="0" y="1335" width="1080" height="190" fill="#fff" filter="url(#glow)"/><text x="540" y="1458" font-size="70" font-weight="900" letter-spacing="1" text-anchor="middle" fill="#000">SCHOOL MAKES WORKERS</text></g>`);}
  else captions(t);
  const fl=1-P(t,k,.12);if(seg>0&&fl>0&&!reset)add(`<rect width="${W}" height="${H}" fill="#fff" opacity="${fl*.12}"/>`);
  if(t>.55&&t<.68)add(`<rect width="${W}" height="${H}" fill="#fff" opacity="${(1-P(t,.55,.13))*.35}"/>`);
  if(seg>0)cue('whoosh',k,.4);cue('hit',0,.6);for(let j=0;j<5;j++)cue('tick',.05+j*.1,.3);cue('thunk',.55,1);cue('impact',.55,.8);cue('pop',1.5,.5);cue('whoosh',resetAt,.4);
}});
