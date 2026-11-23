/* ============ "YOUR LIFE IS A MOVIE — ONLY YOU CAN WRITE THE SCRIPT" — vertical, ~32 s, loops ============ */
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
const AMB='#FFB547';
/* ---------- movie props ---------- */
function clapper(x,y,s,open,txt1='SCENE 1 · TAKE 1',txt2='YOUR LIFE'){const w=520*s,h=330*s;
  add(`<g filter="url(#glowS)"><rect x="${x-w/2}" y="${y}" width="${w}" height="${h}" rx="${16*s}" fill="#0b0b0b" stroke="#fff" stroke-width="${6*s}"/>`);
  label(x,y+h*.36,txt1,{size:30*s,op:.8,weight:900,sp:.14});add(`<text x="${x}" y="${y+h*.72}" font-size="${74*s}" font-weight="900" fill="#fff" text-anchor="middle" letter-spacing="${4*s}">${txt2}</text>`);
  const stripes=(yy)=>{let d='';for(let k=0;k<6;k++)d+=`<polygon points="${x-w/2+k*w/6},${yy} ${x-w/2+k*w/6+w/12},${yy} ${x-w/2+k*w/6+w/12+28*s},${yy+60*s} ${x-w/2+k*w/6+28*s},${yy+60*s}" fill="#fff"/>`;return d;};
  add(`<rect x="${x-w/2}" y="${y-64*s}" width="${w}" height="${60*s}" fill="#0b0b0b" stroke="#fff" stroke-width="${5*s}"/>${stripes(y-64*s)}`);
  add(`<g transform="rotate(${-open},${x-w/2},${y-66*s})"><rect x="${x-w/2}" y="${y-130*s}" width="${w}" height="${60*s}" fill="#0b0b0b" stroke="#fff" stroke-width="${5*s}"/>${stripes(y-130*s)}</g></g>`);}
function screen(x,y,w,h,op=1){add(`<polygon points="${x-30},120 ${x+30},120 ${x+w/2},${y+h} ${x-w/2},${y+h}" fill="url(#cone)" opacity="${.35*op}"/><rect x="${x-w/2}" y="${y}" width="${w}" height="${h}" rx="10" fill="#111" stroke="#fff" stroke-width="6" filter="url(#glowS)" opacity="${op}"/>`);
  for(let k=0;k<2;k++)add(`<path d="M${x-w/2-40},${y-30+k*0} q${w/4},40 ${w/2+40},0" fill="none"/>`);}
function curtains(op=1){add(`<g opacity="${op}" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="#080808">${[0,1].map(s=>{const x=s?1080:0,d=s?-1:1;return `<path d="M${x},100 L${x+d*170},100 Q${x+d*120},700 ${x+d*190},1290 L${x},1290 Z"/>`;}).join('')}</g>`);}
function seatsRow(y,n,s,opFig=.0){for(let k=0;k<n;k++){const x=540+(k-(n-1)/2)*150*s;add(`<path d="M${x-62*s},${y} L${x-62*s},${y-90*s} Q${x},${y-120*s} ${x+62*s},${y-90*s} L${x+62*s},${y} Z" fill="#0b0b0b" stroke="#fff" stroke-opacity=".6" stroke-width="3"/>`);}}
function scriptPage(x,y,s,title,lines,tp=1){add(`<rect x="${x-210*s}" y="${y}" width="${420*s}" height="${540*s}" rx="${10*s}" fill="#0b0b0b" stroke="#fff" stroke-width="${5*s}" filter="url(#glowS)"/>`);label(x,y+60*s,title,{size:28*s,op:1,weight:900,sp:.12});
  lines.forEach((l,i)=>{const n=Math.floor(l.length*clamp(tp*lines.length-i));if(n>0)label(x-170*s,y+130*s+i*60*s,l.slice(0,n),{size:24*s,op:.9,weight:800,sp:.06,anchor:'start'});});}
function pen(x,y,s,rot,glow=false){add(`<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})" ${glow?'filter="url(#glow)"':''}><rect x="-14" y="-150" width="28" height="170" rx="10" fill="${glow?AMB:'#efefef'}"/><polygon points="-14,20 14,20 0,62" fill="${glow?AMB:'#efefef'}"/><rect x="-14" y="-110" width="28" height="12" fill="#000" opacity=".5"/></g>`);}
function filmStrip(y,off,frames,fill){add(`<rect x="-20" y="${y}" width="1120" height="230" fill="#0b0b0b" stroke="#fff" stroke-width="4"/>`);for(let k=0;k<14;k++){const x=((k*90+off)%1260+1260)%1260-90;add(`<rect x="${x}" y="${y+12}" width="44" height="26" rx="4" fill="#fff" opacity=".6"/><rect x="${x}" y="${y+192}" width="44" height="26" rx="4" fill="#fff" opacity=".6"/>`);}
  for(let k=0;k<5;k++){const x=((k*260+off)%1300+1300)%1300-200;add(`<rect x="${x}" y="${y+50}" width="220" height="130" rx="6" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3"/>`);fill(x+110,y+175,k);}}
function chairD(x,g,s,txt){add(`<g filter="url(#glowS)" stroke="#fff" stroke-width="5" fill="#0b0b0b"><line x1="${x-90*s}" y1="${g}" x2="${x+90*s}" y2="${g-220*s}"/><line x1="${x+90*s}" y1="${g}" x2="${x-90*s}" y2="${g-220*s}"/><rect x="${x-110*s}" y="${g-240*s}" width="${220*s}" height="22" rx="6"/><rect x="${x-100*s}" y="${g-400*s}" width="${200*s}" height="${90*s}" rx="8"/><line x1="${x-100*s}" y1="${g-310*s}" x2="${x-100*s}" y2="${g-240*s}"/><line x1="${x+100*s}" y1="${g-310*s}" x2="${x+100*s}" y2="${g-240*s}"/></g>`);label(x,g-340*s,txt,{size:44*s,op:1,weight:900,sp:.14,fill:AMB});}
function tag(x,y,txt,col='#fff'){add(`<rect x="${x-txt.length*13-30}" y="${y-38}" width="${txt.length*26+60}" height="64" rx="32" fill="${col}" filter="url(#glowS)"/>`);label(x,y+8,txt,{size:28,op:1,weight:900,sp:.1,fill:'#000'});}

/* ---------- hook: the clapper slams, pull back to YOU on the big screen ---------- */
function hookScene(t,frozen){const tt=frozen?0:t;const pull=eio(P(tt,.85,.9));const z=lerp(1.55,1,pull);
  g(`transform="translate(540,780) scale(${z}) translate(-540,-780)"`,()=>{
    if(pull>0){curtains(pull);screen(540,430,760,560,pull);seatsRow(1290,6,1.05);seatsRow(1200,5,.95);}
    const op=1-P(tt,1.0,.4);if(op>0){const a=frozen?32:lerp(32,0,eo(P(tt,.2,.16)));clapper(540,620,.85,a);}
    if(pull>0){add(`<g opacity="${pull}">`);add(`<circle cx="540" cy="760" r="200" fill="url(#bk)" fill-opacity=".25"/>`);person(540,960,1.25,{spot:true,ring:false,arm:[44,-86],arm2:[-44,-86]});add('</g>');
      const tg=back(P(tt,2.15,.3));if(tg>0)g(`transform="translate(540,360) scale(${tg}) translate(-540,-360)"`,()=>{tag(540,360,'MAIN CHARACTER',AMB);add(`<path d="M540,395 L540,560 M515,535 L540,565 L565,535" stroke="${AMB}" stroke-width="7" fill="none" stroke-linecap="round"/>`);});}
  });}

/* ---------- segments ---------- */
function stage(vs,t,k,reset){const cx=540;
  if(vs===0||reset){hookScene(reset?0:t,reset);return;}
  ground(SG,1,{op:.45});
  if(vs===14){vs=13;k=SEG[13];}
  if(vs===1){// the projector jams: film burns
    screen(cx,430,760,560);const gl=Math.sin(t*70)>.3;if(gl)add(`<rect x="160" y="${430+((t*900)%520)}" width="760" height="24" fill="#fff" opacity=".25"/>`);person(cx+(gl?10:0),960,1.1,{ring:false,op:.7});
    const b=P(t,k+.3,.6);add(`<circle cx="${cx+120}" cy="640" r="${b*220}" fill="#000" stroke="${AMB}" stroke-width="${6*(b>0?1:0)}" filter="url(#glowS)"/>`);bigText(cx,1180,'THE PROBLEM',100);cue('nope',k+.3,.6);return;}
  if(vs===2){// someone else's hand writes your script
    scriptPage(cx,380,1.25,'YOUR LIFE',['INT. SAME ROOM','PLAYS IT SAFE','DOES WHAT','THEY\'RE TOLD'],P(t,k+.2,1.6));const tp=clamp((t-k-.2)/1.6);
    pen(cx-120+tp*260,640+Math.floor(tp*4)*75,1.1,25);g(`opacity=".55"`,()=>personOutline(cx+330,SG,1.15,1));label(cx+330,SG+60,'SOMEONE ELSE',{size:24,op:.8,weight:900});return;}
  if(vs===3){// three writers pop: parents, friends, fear
    [['PARENTS',220,0],['FRIENDS',540,.65],['FEARS',860,1.3]].forEach(([n,x,d],j)=>{const p=back(P(t,k+d,.3));if(p<=0)return;
      g(`transform="translate(${x},${SG}) scale(${p}) translate(${-x},${-SG})"`,()=>{if(j===2){add(`<circle cx="${x}" cy="${SG-250}" r="70" fill="#161616" stroke="${AMB}" stroke-width="5"/><rect x="${x-90}" y="${SG-170}" width="180" height="170" rx="80" fill="#161616" stroke="${AMB}" stroke-width="5"/><circle cx="${x-24}" cy="${SG-256}" r="9" fill="${AMB}"/><circle cx="${x+24}" cy="${SG-256}" r="9" fill="${AMB}"/>`);}else personOutline(x,SG,1.15,.9);
        pen(x+70,SG-180,.6,30);tag(x,SG-380,n,j===2?AMB:'#fff');});cue('pop',k+d,.5);});return;}
  if(vs===4){// an extra in your own movie: the spotlight is on everyone else
    screen(cx,430,760,560);[[360,.95],[720,.95]].forEach(([x,s])=>{add(`<polygon points="${x-40},440 ${x+40},440 ${x+110},960 ${x-110},960" fill="url(#cone)" opacity=".7"/>`);personOutline(x,960,s,1);});person(cx,960,.55,{ring:false,op:.5});
    const tg=back(P(t,k+.6,.3));if(tg>0)g(`transform="translate(${cx},820) scale(${tg}) translate(${-cx},-820)"`,()=>tag(cx,820,'EXTRA #47'));bigText(cx,1180,'IN YOUR OWN STORY',70);return;}
  if(vs===5){// the same frame repeating on the film strip, the day counter spins
    filmStrip(560,(t-k)*240,5,(x,y,i)=>{person(x,y-6,.5,{ring:false,arm:[20,50]});add(`<rect x="${x+20}" y="${y-60}" width="60" height="8" fill="#fff" opacity=".7"/>`);});
    const d=Math.floor(1+Math.pow(clamp((t-k)/3.2),2)*999);bigText(cx,460,'DAY '+d,110);label(cx,940,'SAME SCENE',{size:34,op:.8,weight:900});person(cx,SG,1,{ring:false,arm:[26,58]});
    for(let j=0;j<10;j++)cue('tick',k+.1+j*.3,.25);return;}
  if(vs===6){// the strip snaps
    const sn=P(t,k+.9,.4);[-1,1].forEach(s=>g(`transform="translate(${s*sn*70},${sn*40}) rotate(${s*sn*8},540,675)"`,()=>{add(`<clipPath id="fs${s}"><rect x="${s<0?-20:540}" y="0" width="560" height="1920"/></clipPath><g clip-path="url(#fs${s})">`);filmStrip(560,0,5,(x,y)=>person(x,y-6,.5,{ring:false}));add('</g>');}));
    if(sn>0)for(let j=0;j<10;j++){const a=j*.63,r=sn*220;add(`<circle cx="${540+Math.cos(a)*r}" cy="${675+Math.sin(a)*r}" r="${6*(1-sn)+2}" fill="${AMB}" opacity="${1-sn}"/>`);}cue('impact',k+.9,.8);
    bigText(cx,1040,'UNTIL YOU DO.',96,P(t,k+.9,.3));return;}
  if(vs===7){// the pen flies into your hand — director's chair
    chairD(780,SG,1.3,'YOU');const p=eo(P(t,k+.1,.45));person(400,SG,1.2,{spot:true,ring:false,arm:[60,-110]});pen(lerp(900,470,p),lerp(260,700,p),1.1,lerp(-200,20,p),true);if(p>=1)ring(470,700,k+.6,{r0:20,r1:240,d:.6,op:.8});
    cue('whoosh',k+.1,.6);cue('ting',k+.55,.8);bigText(cx,420,'PICK UP',120);bigText(cx,550,'THE PEN.',120);return;}
  if(vs===8){// SCENE: WAKE UP EARLY — the sun rises in the window as you write it
    scriptPage(300,330,.85,'SCENE 1',['WAKE UP','EARLY.'],P(t,k+.1,.8));add(`<rect x="600" y="420" width="380" height="300" rx="10" fill="#0b0b0b" stroke="#fff" stroke-width="5"/>`);const s=P(t,k+.3,1.2);
    add(`<clipPath id="wn"><rect x="600" y="420" width="380" height="300" rx="10"/></clipPath><g clip-path="url(#wn)"><circle cx="790" cy="${lerp(800,600,s)}" r="70" fill="#fff" filter="url(#glow)"/><circle cx="790" cy="${lerp(800,600,s)}" r="160" fill="${AMB}" opacity=".25"/></g>`);
    person(cx,SG,1.15,{spot:true,ring:false,arm:[50,-95],arm2:[-50,-95]});icon('clock',860,1000,1.2);label(860,1110,'5:00',{size:30,op:1,weight:900});return;}
  if(vs===9){// TAKE 2: you fall, and get back up
    const f=P(t,k+.05,.35),u=P(t,k+.8,.4);clapper(820,700,.5,u>0?0:30,'SCENE 2','TAKE 2');cue('thunk',k+.8,.6);
    if(u<=0)g(`transform="rotate(${-85*eo(f)},${cx+40},${SG})"`,()=>person(cx,SG,1.15,{ring:false}));else person(cx,SG,1.15,{spot:true,ring:false,arm:[44,-86],arm2:[-44,-86]});cue('thud',k+.4,.6);
    bigText(cx,460,u>0?'GET BACK UP.':'FALL.',110);return;}
  if(vs===10){// doubters shake heads; you run straight past them
    for(let j=0;j<6;j++){const x=110+j*172;const sh=Math.sin(t*9+j)*8;g(`transform="translate(${sh},0)"`,()=>personOutline(x,SG-560,.75,.5));}label(cx,SG-470,'"YOU CAN\'T."',{size:40,op:.75,weight:900});
    const u=clamp((t-k)/2.0);for(let j=0;j<8;j++)add(`<line x1="${(j*170+t*1300)%1300-200}" y1="${900+j*40}" x2="${(j*170+t*1300)%1300-60}" y2="${900+j*40}" stroke="#fff" stroke-opacity=".25" stroke-width="4"/>`);
    person(lerp(160,920,u),SG,1.1,{spot:.8,ring:false,arm:[60,-30+Math.sin(t*22)*30],arm2:[-40,30-Math.sin(t*22)*30],bob:Math.abs(Math.sin(t*14))*10});bigText(cx,460,'KEEP GOING.',100);return;}
  if(vs===11||vs===12){// the story arc: the dip in the middle… then the comeback
    const x0=120,x1=960,yb=1050;const fn=x=>x<.5?yb-120-Math.sin(x*Math.PI*2)*-1*0-(.5-x)*0-(Math.sin(x*Math.PI)*-260):yb-120-Math.sin(Math.PI*.5)*-260-(x-.5)*2*(620);
    const pts=[];for(let i=0;i<=40;i++){const u=i/40;const y=u<.55?yb-200+Math.sin(u/.55*Math.PI)*260:yb-200-Math.pow((u-.55)/.45,1.6)*640;pts.push([x0+(x1-x0)*u,y]);}
    const prog=vs===11?.55*clamp((t-k)/1.6):.55+.45*clamp((t-k-.2)/1.4);const tip=polyline(pts,prog,{sw:8});add(`<line x1="${x0}" y1="${yb+100}" x2="${x1}" y2="${yb+100}" stroke="#fff" stroke-opacity=".4" stroke-width="3"/>`);
    label(x0+(x1-x0)*.27,yb+150,'THE HARD PART',{size:28,op:vs===11?1:.5,weight:900});if(tip){person(tip[0],tip[1]-10,.7,{ring:false,arm:vs===12?[40,-80]:null,arm2:vs===12?[-40,-80]:null});}
    if(vs===11)bigText(cx,420,'EVERY GREAT MOVIE',80);else{bigText(cx,400,'YOUR',100,P(t,k+.1,.3));add(`<text x="540" y="540" font-size="140" font-weight="900" fill="${AMB}" text-anchor="middle" letter-spacing="6" filter="url(#glowL)" opacity="${P(t,k+1.0,.25)}">COMEBACK.</text>`);cue('impact',k+1.0,.8);
      if(t>k+1.0)for(let j=0;j<26;j++){const x=(j*137)%1080,y=((j*97+t*260)%900)+250;add(`<rect x="${x}" y="${y}" width="12" height="20" fill="${j%3?'#fff':AMB}" opacity=".7" transform="rotate(${j*40+t*200},${x},${y})"/>`);}}
    return;}
  if(vs===13){// from behind the audience: you stand up and walk INTO the screen
    const u=P(t,k+.4,1.6);screen(cx,330,760,560);seatsRow(1290,6,1.05);seatsRow(1170,5,.95);
    const px=cx,py=lerp(1250,880,eo(u)),s=lerp(1.1,.6,eo(u));person(px,py,s,{ring:false,spot:u>.5,arm:u>.2?[44,-86]:null,arm2:u>.2?[-44,-86]:null});
    add(`<rect x="160" y="330" width="760" height="560" fill="#fff" opacity="${.25*u}"/>`);bigText(cx,1060,'STOP WATCHING.',80,P(t,k+.1,.3));return;}
}

/* ---------- main ---------- */
S.push({s:0,e:END+1,cam:{zoom:0},draw:()=>{
  const t=T,seg=segAt(t),k=SEG[seg];const reset=seg===NL-1&&t>resetAt;const vs=reset?0:seg;
  const punch=1+.04*(1-eo(P(t,k,.35)));const sh=P(t,.35,.3),am=sh>0&&sh<1?(1-sh)*26:0;
  add(`<circle cx="540" cy="700" r="480" fill="url(#bk)" fill-opacity=".05"/>`);
  g(`transform="translate(${540+Math.sin(t*90)*am},${800+Math.cos(t*80)*am}) scale(${punch}) translate(-540,-800)"`,()=>stage(vs,t,k,reset));
  const so=reset?P(t,resetAt,.2):1-P(t,2.9,.3);if(so>0)add(`<g opacity="${so}"><rect x="90" y="140" width="900" height="110" rx="55" fill="#fff" filter="url(#glow)"/><text x="540" y="217" font-size="50" font-weight="900" letter-spacing="2" text-anchor="middle" fill="#000">ONLY YOU CAN WRITE IT</text></g>`);
  label(1040,58,'THE NEXT VERSION',{size:16,op:.45,anchor:'end',weight:800});
  const hb=t<le(0)+.1?1:(reset?P(t,resetAt,.15):0);
  if(hb>0){add(`<g opacity="${hb}"><rect x="0" y="1335" width="1080" height="190" fill="#fff" filter="url(#glow)"/><text x="540" y="1458" font-size="74" font-weight="900" letter-spacing="1" text-anchor="middle" fill="#000">YOUR LIFE IS A MOVIE</text></g>`);}
  else captions(t);
  const fl=1-P(t,k,.12);if(seg>0&&fl>0&&!reset)add(`<rect width="${W}" height="${H}" fill="#fff" opacity="${fl*.12}"/>`);
  if(t>.35&&t<.5)add(`<rect width="${W}" height="${H}" fill="#fff" opacity="${(1-P(t,.35,.15))*.4}"/>`);
  if(seg>0)cue('whoosh',k,.4);cue('hit',0,.5);cue('thunk',.35,1);cue('impact',.36,.8);cue('rise',.9,.4);cue('pop',2.2,.6);cue('whoosh',resetAt,.4);
}});
