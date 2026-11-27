/* ============ "IT HAPPENED FOR A REASON" — vertical, ~32 s, loops ============ */
const S=[];
const l=i=>L[i].s, le=i=>L[i].e;
const SG=1290, NL=TIMING.lines.length;
const SEG=[0];for(let i=1;i<NL;i++)SEG.push(l(i)-.1);SEG.push(END);
function segAt(t){for(let i=SEG.length-2;i>=0;i--)if(t>=SEG[i])return i;return 0;}
const resetAt=l(NL-1)+.4;

/* ---------- word captions ---------- */
const CAP=[];TIMING.lines.forEach((ln,i)=>{if(i<1)return;const w=ln.text.split(' ');const tot=w.reduce((a,x)=>a+x.length+2,0);let t=ln.start;
  const words=w.map(x=>{const d=(ln.end-ln.start)*(x.length+2)/tot;const o={w:x.toUpperCase(),s:t,e:t+d};t+=d;return o;});
  let ch=[];words.forEach(o=>{const len=ch.reduce((a,x)=>a+x.w.length+1,0);if(ch.length>=3||len+o.w.length>15){CAP.push(ch);ch=[];}ch.push(o);});if(ch.length)CAP.push(ch);});
function captions(t){const ch=CAP.find(c=>t>=c[0].s-.02&&t<c[c.length-1].e+.08);if(!ch)return;const size=78,Y=1430;
  const widths=ch.map(o=>o.w.length*size*.8+30);const tw=widths.reduce((a,b)=>a+b,0)+(ch.length-1)*22;let x=540-tw/2;
  ch.forEach((o,k)=>{const cur=t>=o.s&&t<o.e+(k===ch.length-1?.08:0);const w=widths[k];const pk=cur?1+.08*(1-eo(P(t,o.s,.12))):1;
    g(`transform="translate(${x+w/2},${Y}) scale(${pk}) translate(${-(x+w/2)},${-Y})"`,()=>{if(cur)add(`<rect x="${x}" y="${Y-56}" width="${w}" height="96" rx="16" fill="#fff" filter="url(#glow)"/>`);
      add(`<text x="${x+w/2}" y="${Y+26}" font-size="${size}" font-weight="900" letter-spacing="1.5" text-anchor="middle" fill="${cur?'#000':'#fff'}" stroke="${cur?'none':'#000'}" stroke-width="6" paint-order="stroke">${o.w}</text>`);});x+=w+22;});}
function bigText(x,y,txt,size,op=1){add(`<text x="${x}" y="${y}" font-size="${size}" font-weight="900" letter-spacing="${size*.06}" text-anchor="middle" fill="#fff" fill-opacity="${op}" filter="url(#glowL)">${txt}</text>`);}
const AMB='#FFB547', RED='#ff5a4a';
/* ---------- props ---------- */
function plane(x,y,s=1,rot=0,op=1){add(`<g opacity="${op}" transform="translate(${x},${y}) rotate(${rot}) scale(${s})" filter="url(#glowS)"><path d="M-120,0 Q-120,-16 -96,-16 L90,-16 Q130,-14 140,0 Q130,14 90,16 L-96,16 Q-120,16 -120,0 Z" fill="#0b0b0b" stroke="#fff" stroke-width="5"/><path d="M-10,-14 L-60,-80 L-30,-80 L40,-14 Z M-10,14 L-60,80 L-30,80 L40,14 Z M-110,-12 L-130,-50 L-110,-50 L-80,-12 Z" fill="#0b0b0b" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>${[0,1,2,3].map(k=>`<circle cx="${60-k*28}" cy="-2" r="4" fill="#fff"/>`).join('')}</g>`);}
function tv(x,y,w,h){add(`<rect x="${x-w/2}" y="${y-h/2}" width="${w}" height="${h}" rx="22" fill="#0b0b0b" stroke="#fff" stroke-width="7" filter="url(#glowS)"/><line x1="${x-60}" y1="${y+h/2}" x2="${x-100}" y2="${y+h/2+60}" stroke="#fff" stroke-width="6"/><line x1="${x+60}" y1="${y+h/2}" x2="${x+100}" y2="${y+h/2+60}" stroke="#fff" stroke-width="6"/>`);}
function stampT(t0,x,y,txt,col,rot=-8,size=86){const p=P(T,t0,.2);if(p<=0)return;const sc=lerp(2.2,1,eo(p));const w=txt.length*size*.7+70;
  g(`transform="translate(${x},${y}) rotate(${rot}) scale(${sc})" opacity="${Math.min(1,p*2)}"`,()=>{add(`<rect x="${-w/2}" y="${-size*.85}" width="${w}" height="${size*1.4}" rx="14" fill="#000" fill-opacity=".6" stroke="${col}" stroke-width="9"/><text x="0" y="${size*.34}" font-size="${size}" font-weight="900" fill="${col}" text-anchor="middle" letter-spacing="${size*.06}">${txt}</text>`);});cue('impact',t0+.15,.6);}
function tint(col,op){add(`<rect width="1080" height="1920" fill="${col}" opacity="${op}" style="mix-blend-mode:multiply"/>`);}
function car(x,g,s=1,rot=0,op=1){add(`<g opacity="${op}" transform="rotate(${rot},${x},${g-40*s})" filter="url(#glowS)"><path d="M${x-150*s},${g-30*s} L${x-150*s},${g-80*s} Q${x-140*s},${g-95*s} ${x-110*s},${g-95*s} L${x-70*s},${g-150*s} L${x+60*s},${g-150*s} L${x+110*s},${g-95*s} Q${x+150*s},${g-90*s} ${x+150*s},${g-60*s} L${x+150*s},${g-30*s} Z" fill="#0b0b0b" stroke="#fff" stroke-width="${5}"/><circle cx="${x-90*s}" cy="${g-28*s}" r="${30*s}" fill="#0b0b0b" stroke="#fff" stroke-width="5"/><circle cx="${x+90*s}" cy="${g-28*s}" r="${30*s}" fill="#0b0b0b" stroke="#fff" stroke-width="5"/><path d="M${x-60*s},${g-140*s} L${x-5*s},${g-140*s} L${x-5*s},${g-100*s} L${x-90*s},${g-100*s} Z M${x+10*s},${g-140*s} L${x+55*s},${g-140*s} L${x+90*s},${g-100*s} L${x+10*s},${g-100*s} Z" fill="none" stroke="#fff" stroke-width="3"/></g>`);}
function smoke(x,y,op=1){for(let k=0;k<5;k++){const u=(T*.8+k/5)%1;add(`<circle cx="${x+Math.sin(k*2+T)*20+u*40}" cy="${y-u*200}" r="${20+u*40}" fill="#888" opacity="${op*.35*(1-u)}"/>`);}}
function heart(x,y,s,col,crack=0){const d=`M${x},${y+60*s} C${x-140*s},${y-30*s} ${x-70*s},${y-120*s} ${x},${y-50*s} C${x+70*s},${y-120*s} ${x+140*s},${y-30*s} ${x},${y+60*s} Z`;
  if(crack<=0){add(`<path d="${d}" fill="${col}" filter="url(#glowS)"/>`);return;}const o=crack*24*s;
  [-1,1].forEach(sd=>{add(`<clipPath id="hc${sd}"><path d="${sd<0?`M${x-200*s},${y-200*s} L${x},${y-200*s} L${x},${y-50*s} L${x-14*s},${y-10*s} L${x+12*s},${y+20*s} L${x},${y+70*s} L${x-200*s},${y+70*s} Z`:`M${x+200*s},${y-200*s} L${x},${y-200*s} L${x},${y-50*s} L${x-14*s},${y-10*s} L${x+12*s},${y+20*s} L${x},${y+70*s} L${x+200*s},${y+70*s} Z`}"/></clipPath><g clip-path="url(#hc${sd})" transform="translate(${sd*o},${o*.3}) rotate(${sd*crack*10},${x},${y})"><path d="${d}" fill="${col}" stroke="#000" stroke-width="3"/></g>`);});}
function counterTag(n){label(540,200,`REASON ${n} / 5`,{size:30,op:.85,weight:900,sp:.2,fill:AMB});}

/* ---------- hook: you watch your plane leave without you ---------- */
function hookScene(t,frozen){const tt=frozen?0:t;const cx=540;
  add(`<rect x="110" y="330" width="860" height="600" rx="26" fill="#0b0b0b" stroke="#fff" stroke-width="7" filter="url(#glowS)"/><line x1="540" y1="330" x2="540" y2="930" stroke="#fff" stroke-width="5"/><line x1="110" y1="760" x2="970" y2="760" stroke="#fff" stroke-opacity=".4" stroke-width="3"/>`);
  add(`<clipPath id="win"><rect x="114" y="334" width="852" height="592" rx="22"/></clipPath><g clip-path="url(#win)">`);const u=P(tt,0,2.1);plane(lerp(260,980,u),lerp(740,430,u*u),.95,-18*u);add('</g>');
  label(cx,300,'GATE 12  ·  CLOSED',{size:30,op:.9,weight:900,sp:.16,fill:RED});
  ground(SG,1,{op:.5});const run=1-P(tt,.0,.8);const px=lerp(260,520,eo(P(tt,0,.8)));person(px,SG,1.25,{ring:false,arm:run>0?[60,-20+Math.sin(tt*20)*30]:[70,-110],arm2:run>0?[-40,30]:[-70,-110],bob:run>0?Math.abs(Math.sin(tt*14))*10:0});
  add(`<rect x="${px+70}" y="${SG-110}" width="80" height="100" rx="12" fill="#0b0b0b" stroke="#fff" stroke-width="5"/><line x1="${px+110}" y1="${SG-110}" x2="${px+110}" y2="${SG-150}" stroke="#fff" stroke-width="5"/>`);
  if(tt>.8){const s=Math.sin(tt*40)*4;add(`<g stroke="${RED}" stroke-width="6" stroke-linecap="round"><path d="M${px-40+s},${SG-250} l-14,-22 M${px},${SG-262} l0,-26 M${px+40+s},${SG-250} l14,-22"/></g>`);}cue('whoosh',.2,.6);}

/* ---------- segments ---------- */
function stage(vs,t,k,reset){const cx=540;
  if(vs===0||reset){hookScene(reset?0:t,reset);return;}
  if(vs===13){vs=12;k=SEG[12];}
  if(vs===1){// the news
    const z=1+.08*P(t,k,1.4);g(`transform="translate(540,640) scale(${z}) translate(-540,-640)"`,()=>{tv(cx,640,820,560);add(`<rect x="150" y="760" width="780" height="80" fill="${RED}"/>`);label(cx,812,'BREAKING NEWS',{size:40,op:1,weight:900,sp:.16});
      plane(cx,560,.9,24);smoke(cx+90,560,1);label(cx,890,'FLIGHT 207 CRASHED',{size:32,op:.95,weight:900,sp:.1});});
    ground(SG,1,{op:.5});person(cx,SG,1.2,{ring:false,arm:[30,-110],arm2:[-30,-110]});cue('hit',k+.05,.7);return;}
  if(vs===2){// bad luck was protection
    counterTag(1);const p=eo(P(t,k+1.4,.6));add(`<path d="M${cx},420 L${cx+220},500 L${cx+200},800 Q${cx+150},960 ${cx},1040 Q${cx-150},960 ${cx-200},800 L${cx-220},500 Z" fill="${AMB}" opacity="${.12*p}" stroke="${AMB}" stroke-width="10" stroke-opacity="${p}" filter="url(#glowS)"/>`);
    ground(SG,1,{op:.5});person(cx,980,1.4,{spot:true,ring:false});stampT(k+1.9,cx,1180,'PROTECTED.',AMB,-6,74);
    stampT(k+.1,cx,330,'BAD LUCK?',RED,-6,70);return;}
  // ---- examples: the bad moment (red) then the reveal (amber) ----
  if(vs===3){counterTag(2);// rejected
    add(`<rect x="290" y="380" width="500" height="640" rx="16" fill="#0b0b0b" stroke="#fff" stroke-width="6" filter="url(#glowS)"/>`);label(cx,460,'APPLICATION RESULT',{size:26,op:.8,weight:900,sp:.12});
    label(cx,560,'UNFORTUNATELY...',{size:36,op:1,weight:900,sp:.08});for(let j=0;j<5;j++)add(`<line x1="340" y1="${640+j*55}" x2="${j%2?640:740}" y2="${640+j*55}" stroke="#fff" stroke-opacity=".35" stroke-width="8"/>`);
    cross(cx,800,2.2,.95,P(t,k+.4,.25));tint(RED,.18);cue('nope',k+.45,.6);return;}
  if(vs===4){counterTag(2);// the company shut down
    add(`<rect x="300" y="430" width="480" height="${SG-430}" fill="#0b0b0b" stroke="#fff" stroke-width="6" filter="url(#glowS)"/>`);for(let r=0;r<5;r++)for(let c=0;c<4;c++)add(`<rect x="${335+c*110}" y="${470+r*130}" width="80" height="90" rx="6" fill="#151515" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>`);
    add(`<g transform="rotate(-8,540,880)"><rect x="350" y="830" width="380" height="110" rx="10" fill="${RED}"/></g>`);label(cx,905,'CLOSED',{size:64,op:1,weight:900,sp:.2});
    pillShape(cx,370,'6 MONTHS LATER',{size:28});ground(SG,1,{op:.5});person(880,SG,1,{ring:false,arm:[50,-90],arm2:[-50,-90]});stampT(k+1.2,cx,1150,'DODGED IT.',AMB,-6,70);return;}
  if(vs===5){counterTag(3);// the car won't start
    ground(SG,1,{op:.5});car(cx,SG,1.5);smoke(cx+200,SG-120,1);person(cx-330,SG,1.1,{ring:false,arm:[60,-30],arm2:[-30,50]});icon('key',cx,560,1.6);cross(cx+80,520,1,.9,P(t,k+.5,.25));tint(RED,.18);cue('nope',k+.55,.5);return;}
  if(vs===6){counterTag(3);// the pile-up you missed
    add(`<polygon points="400,330 680,330 1080,${SG} 0,${SG}" fill="#0d0d0d"/>`);for(let j=0;j<8;j++){const y=360+j*115;add(`<rect x="${538-(y-330)*.02}" y="${y}" width="6" height="50" fill="#fff" opacity=".5"/>`);}
    [[420,700,.55,-25],[620,760,.6,30],[460,920,.8,15],[700,1000,.85,-20],[540,1180,1.0,8]].forEach(([x,g,s,r])=>car(x,g,s,r));
    for(let j=0;j<4;j++){const on=Math.sin(t*12+j*1.6)>0;add(`<circle cx="${300+j*160}" cy="${560+j*130}" r="18" fill="${on?RED:AMB}" opacity=".8" filter="url(#glow)"/>`);}
    label(cx,300,'MOTORWAY PILE-UP',{size:32,op:.9,weight:900,sp:.14,fill:RED});stampT(k+1.0,cx,1180,'YOU WEREN\'T THERE.',AMB,-6,58);return;}
  if(vs===7){counterTag(4);// they left
    ground(SG,1,{op:.5});person(400,SG,1.2,{ring:false,arm:[30,58],arm2:[-30,58]});const w=P(t,k,.8);g(`opacity="${1-w*.6}"`,()=>personOutline(lerp(640,900,w),SG,1.2,1));heart(cx,560,1.6,RED,P(t,k+.25,.4));cue('nope',k+.3,.5);tint(RED,.15);return;}
  if(vs===8){counterTag(4);// someone who stays
    ground(SG,1,{op:.5});const p=P(t,k+.3,.8);person(430,SG,1.2,{ring:false,spot:true,arm:[80,-10]});person(lerp(820,650,eo(p)),SG,1.2,{ring:false,spot:true,arm2:[-80,-10]});
    heart(cx,lerp(620,560,p),1.6*back(P(t,k+.3,.4)),AMB);stampT(k+1.3,cx,340,'MADE ROOM.',AMB,-6,70);return;}
  if(vs===9){counterTag(5);// failed the exam
    add(`<rect x="300" y="380" width="480" height="620" rx="14" fill="#0b0b0b" stroke="#fff" stroke-width="6" filter="url(#glowS)"/>`);label(cx,450,'FINAL EXAM',{size:28,op:.8,weight:900,sp:.12});for(let j=0;j<6;j++)add(`<line x1="350" y1="${520+j*55}" x2="${j%2?620:730}" y2="${520+j*55}" stroke="#fff" stroke-opacity=".35" stroke-width="8"/>`);
    const p=P(t,k+.35,.2);if(p>0)add(`<text x="640" y="930" font-size="${lerp(380,220,eo(p))}" font-weight="900" fill="${RED}" text-anchor="middle" opacity="${p}" transform="rotate(-10,640,860)">F</text>`);tint(RED,.15);cue('thud',k+.45,.7);return;}
  if(vs===10){counterTag(5);// what winning never could
    const p=P(t,k+.2,1.0);add(`<path d="${stairsPath(170,SG,5,150,110)}" stroke="#fff" stroke-width="7" fill="none" filter="url(#glowS)"/>`);const i=Math.min(4,Math.floor(p*5));const [px,py]=[170+i*150+90,SG-(i+1)*110];person(px,py,1,{ring:false,spot:true,arm:p>=1?[44,-86]:null,arm2:p>=1?[-44,-86]:null});
    for(let j=0;j<5;j++)if(P(t,k+.2+j*.2,.2)>0)cue('step',k+.2+j*.2,.4);icon('book',300,640,1.4,.8);stampT(k+1.2,cx,420,'LESSON.',AMB,-6,80);return;}
  if(vs===11){// doors closing… one opens
    ground(SG,1,{op:.5});[200,540,880].forEach((x,j)=>{const isOpen=j===1;const c=P(t,k+.3+j*.35,.3);const op=isOpen?P(t,k+2.0,.6):0;
      add(`<rect x="${x-110}" y="${SG-420}" width="220" height="420" fill="${isOpen&&op>0?'#fff':'#141414'}" fill-opacity="${isOpen?Math.max(.15,op):1}" stroke="#fff" stroke-width="6" filter="url(#glowS)"/>`);if(!isOpen||op<=0){cue('thud',k+.3+j*.35,.5);add(`<circle cx="${x+70}" cy="${SG-210}" r="8" fill="#fff"/>`);}
      if(isOpen&&op>0)add(`<polygon points="${x-110},${SG} ${x+110},${SG} ${x+300},${SG+200} ${x-300},${SG+200}" fill="#fff" opacity="${.2*op}"/><circle cx="${x}" cy="${SG-210}" r="300" fill="${AMB}" opacity="${.15*op}" filter="url(#glowL)"/>`);});
    bigText(cx,560,'NOT A PUNISHMENT.',80,P(t,k+.4,.3));if(t>k+2.2)bigText(cx,680,'A RESCUE.',110,P(t,k+2.2,.3));cue('rise',k+1.6,.5);return;}
  if(vs===12){// why me? -> thank you.
    const sw=P(t,k+1.3,.3);bigText(cx,560,'WHY ME?',140,1-.6*sw);if(sw>0)add(`<line x1="230" y1="520" x2="${230+620*sw}" y2="520" stroke="${RED}" stroke-width="16" stroke-linecap="round"/>`);
    if(t>k+1.7){const pp=back(P(t,k+1.7,.35));g(`transform="translate(540,800) scale(${pp}) translate(-540,-800)"`,()=>{add(`<text x="540" y="840" font-size="150" font-weight="900" fill="${AMB}" text-anchor="middle" letter-spacing="6" filter="url(#glowL)">THANK YOU.</text>`);});cue('impact',k+1.75,.8);}
    ground(SG,1,{op:.5});person(cx,SG,1.2,{spot:true,ring:false,arm:t>k+1.7?[44,-86]:null,arm2:t>k+1.7?[-44,-86]:null});return;}
}

/* ---------- main ---------- */
S.push({s:0,e:END+1,cam:{zoom:0},draw:()=>{
  const t=T,seg=segAt(t),k=SEG[seg];const reset=seg===NL-1&&t>resetAt;const vs=reset?0:seg;
  const punch=1+.04*(1-eo(P(t,k,.35)));
  add(`<circle cx="540" cy="700" r="480" fill="url(#bk)" fill-opacity=".05"/>`);
  g(`transform="translate(540,800) scale(${punch}) translate(-540,-800)"`,()=>stage(vs,t,k,reset));
  const so=reset?P(t,resetAt,.2):1-P(t,2.1,.3);if(so>0)add(`<g opacity="${so}"><rect x="90" y="140" width="900" height="110" rx="55" fill="#fff" filter="url(#glow)"/><text x="540" y="216" font-size="52" font-weight="900" letter-spacing="2" text-anchor="middle" fill="#000">IT HAPPENED FOR A REASON</text></g>`);
  label(1040,58,'THE NEXT VERSION',{size:16,op:.45,anchor:'end',weight:800});
  const hb=t<le(0)+.1?1:(reset?P(t,resetAt,.15):0);
  if(hb>0){add(`<g opacity="${hb}"><rect x="0" y="1335" width="1080" height="190" fill="#fff" filter="url(#glow)"/><text x="540" y="1458" font-size="70" font-weight="900" letter-spacing="1" text-anchor="middle" fill="#000">YOU MISSED YOUR FLIGHT</text></g>`);}
  else captions(t);
  const fl=1-P(t,k,.12);if(seg>0&&fl>0&&!reset)add(`<rect width="${W}" height="${H}" fill="#fff" opacity="${fl*.12}"/>`);
  if(seg>0)cue('whoosh',k,.4);cue('hit',0,.6);cue('whoosh',resetAt,.4);
}});
