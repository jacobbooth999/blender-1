/* ============ "SAME 24 HOURS" — grinder vs dreamer (vertical, ~31 s, loops) ============ */
const S=[];
const l=i=>L[i].s, le=i=>L[i].e;
const TG=830, BG=1570;                       // ground lines: top panel (grinder), bottom panel (dreamer)
const SEG=[0,l(2)-.12,l(4)-.12,l(6)-.12,l(8)-.12,l(10)-.12,l(13)-.12,END];
const TIMES=['24 HOURS','6:00 AM','9:00 AM','1:00 PM','10:00 PM','1 YEAR LATER','WHICH ONE?'];
const GOALG=[0,.12,.25,.42,.58,1,1];
function segAt(t){for(let i=SEG.length-2;i>=0;i--)if(t>=SEG[i])return i;return 0;}
const resetAt=l(14)+.1;                      // the last line resets the scene to the opening composition (loop)

/* ---------- word-by-word captions ---------- */
const CAP=[];TIMING.lines.forEach((ln,i)=>{if(i<2)return;const w=ln.text.replace('Six A M.','6 AM.').replace('Nine A M.','9 AM.').replace('One P M.','1 PM.').replace('Ten P M.','10 PM.').split(' ');const tot=w.reduce((a,x)=>a+x.length+2,0);let t=ln.start;
  const words=w.map(x=>{const d=(ln.end-ln.start)*(x.length+2)/tot;const o={w:x.toUpperCase(),s:t,e:t+d};t+=d;return o;});
  let ch=[];words.forEach(o=>{const len=ch.reduce((a,x)=>a+x.w.length+1,0);if(ch.length>=3||len+o.w.length>15){CAP.push(ch);ch=[];}ch.push(o);});if(ch.length)CAP.push(ch);});
function captions(t){const ch=CAP.find(c=>t>=c[0].s-.02&&t<c[c.length-1].e+.08);if(!ch)return;
  const size=78,sp=.02;const widths=ch.map(o=>o.w.length*size*.74+30);const tw=widths.reduce((a,b)=>a+b,0)+(ch.length-1)*22;let x=540-tw/2;
  ch.forEach((o,k)=>{const cur=t>=o.s&&t<o.e+(k===ch.length-1?.08:0);const w=widths[k];const pk=cur?1+.08*(1-eo(P(t,o.s,.12))):1;
    g(`transform="translate(${x+w/2},965) scale(${pk}) translate(${-(x+w/2)},-965)"`,()=>{
      if(cur)add(`<rect x="${x}" y="${965-56}" width="${w}" height="96" rx="16" fill="#fff" filter="url(#glow)"/>`);
      add(`<text x="${x+w/2}" y="${965+26}" font-size="${size}" font-weight="900" letter-spacing="${size*sp}" text-anchor="middle" fill="${cur?'#000':'#fff'}" stroke="${cur?'none':'#000'}" stroke-width="6" paint-order="stroke">${o.w}</text>`);});
    x+=w+22;});}

/* ---------- props ---------- */
function bed(x,g,s=1){add(`<g filter="url(#glowS)" stroke="#fff" stroke-width="4" fill="#0b0b0b"><rect x="${x-260*s}" y="${g-70*s}" width="${520*s}" height="56*s" rx="12"/><rect x="${x-260*s}" y="${g-170*s}" width="${28*s}" height="${170*s}" rx="8"/><rect x="${x+232*s}" y="${g-120*s}" width="${28*s}" height="${120*s}" rx="8"/></g>`.replace('56*s',String(56*s)));}
function sleeper(x,g,s=1,swat=0){g_(`transform="rotate(-90,${x-140*s},${g-70*s})"`,()=>person(x-140*s,g-70*s,.8*s,{ring:false,arm:swat>0?[-20,-80*swat-10]:null}));
  add(`<path d="M${x-110*s},${g-100*s} Q${x+60*s},${g-136*s} ${x+230*s},${g-104*s} L${x+230*s},${g-70*s} L${x-110*s},${g-70*s} Z" fill="#0b0b0b" stroke="#fff" stroke-width="3.5" filter="url(#glowS)"/>`);}
const g_=(a,f)=>g(a,f);
function couch(x,g,s=1){add(`<g filter="url(#glowS)" stroke="#fff" stroke-width="4" fill="#0b0b0b"><rect x="${x-190*s}" y="${g-150*s}" width="${380*s}" height="${90*s}" rx="18"/><rect x="${x-220*s}" y="${g-90*s}" width="${440*s}" height="${70*s}" rx="16"/><rect x="${x-240*s}" y="${g-130*s}" width="${50*s}" height="${110*s}" rx="16"/><rect x="${x+190*s}" y="${g-130*s}" width="${50*s}" height="${110*s}" rx="16"/></g>`);}
function desk(x,g,on){add(`<g filter="url(#glowS)" stroke="#fff" stroke-width="4" fill="#0b0b0b"><rect x="${x-170}" y="${g-150}" width="340" height="20" rx="6"/><line x1="${x-150}" y1="${g-130}" x2="${x-150}" y2="${g}"/><line x1="${x+150}" y1="${g-130}" x2="${x+150}" y2="${g}"/>
  <path d="M${x-80},${g-150} L${x-70},${g-260} L${x+70},${g-260} L${x+80},${g-150} Z"/></g>`);if(on)add(`<path d="M${x-62},${g-165} L${x-55},${g-248} L${x+55},${g-248} L${x+62},${g-165} Z" fill="#fff" fill-opacity=".25"/>`);}
function goalBar(y,v,dim){label(700,y,'GOAL',{size:18,op:.7,anchor:'start',weight:800});add(`<rect x="780" y="${y-22}" width="230" height="30" rx="15" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2.5"/>`);
  if(v>0)add(`<rect x="785" y="${y-17}" width="${Math.max(20,220*v)}" height="20" rx="10" fill="#fff" ${v>=1?'filter="url(#glow)"':''}/>`);label(1010,y+38,Math.round(v*100)+'%',{size:18,op:dim?.5:.9,anchor:'end',weight:800});}
function clock(x,y,r,spin){add(`<circle cx="${x}" cy="${y}" r="${r}" fill="#0b0b0b" stroke="#fff" stroke-width="5" filter="url(#glowS)"/>`);const a=spin*12,b=spin;
  add(`<line x1="${x}" y1="${y}" x2="${x+r*.75*Math.sin(a)}" y2="${y-r*.75*Math.cos(a)}" stroke="#fff" stroke-width="5" stroke-linecap="round"/><line x1="${x}" y1="${y}" x2="${x+r*.5*Math.sin(b)}" y2="${y-r*.5*Math.cos(b)}" stroke="#fff" stroke-width="7" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="6" fill="#fff"/>`);}
function dreamBubble(x,y,s=1,op=1){add(`<g opacity="${op}">`);add(`<g filter="url(#glowS)" fill="#0b0b0b" stroke="#fff" stroke-width="3"><circle cx="${x-120*s}" cy="${y+90*s}" r="${8*s}"/><circle cx="${x-90*s}" cy="${y+60*s}" r="${13*s}"/><ellipse cx="${x}" cy="${y-10*s}" rx="${170*s}" ry="${80*s}"/></g>`);
  icon('house',x-90*s,y-10*s,.75*s);icon('dollar',x,y-14*s,.7*s);icon('trophy',x+90*s,y-10*s,.7*s);add('</g>');}

/* ---------- panels ---------- */
function grinder(seg,t,k){const x=540,G=TG;
  if(seg===0||seg===6&&t>resetAt){person(x,G,1.15,{spot:true,arm:[60,-10]});return;}
  if(seg===1){const rep=Math.sin(t*7);person(x,G,1.15,{spot:true,arm:[60,rep>0?-80:10],arm2:[-60,rep>0?-80:10]});icon('dumbbell',x+60*1.15,G-90*1.15+(rep>0?-80:10)*1.15,.6);icon('dumbbell',x-60*1.15,G-90*1.15+(rep>0?-80:10)*1.15,.6);
    for(let j=0;j<2;j++){const ph=(t*1.6+j*.5)%1;add(`<circle cx="${x+70+j*20}" cy="${G-300+ph*60}" r="5" fill="#fff" opacity="${1-ph}"/>`);}
    icon('clock',220,G-90,.9,.6);return;}
  if(seg===2){desk(700,G,true);person(420,G,1.1,{spot:true,arm:[80,-20]});[0,1,2].forEach(j=>{const tt=k+.6+j*.6;pop(tt,560+j*120,G-430,()=>icon('bulb',560+j*120,G-430,.7),{snd:'pop',vol:.35});});return;}
  if(seg===3){const fall=t>k+1.0&&t<k+2.0,re=P(t,k+2.0,1.0),ok=t>k+3.0;
    for(let b=0;b<5;b++){let bx=730,by=G-30-b*62,rot=0;if(t>k+1.0&&t<k+2.0){const f=P(t,k+1.0,.6);bx+=f*(80+b*30);by+=f*f*b*62;rot=f*(30+b*12);}else if(t>=k+2.0){const q=clamp((re*5-b));if(q<1){bx+=(80+b*30);by=G-30;rot=40;if(q>0){bx=lerp(bx,730,eo(q));by=lerp(G-30,G-30-b*62,eo(q));rot=lerp(40,0,q);}}}
      add(`<rect x="${bx-60}" y="${by-28}" width="120" height="56" rx="8" fill="#0b0b0b" stroke="#fff" stroke-width="3.5" transform="rotate(${rot},${bx},${by})" filter="url(#glowS)"/>`);}
    if(fall)cross(730,G-380,1.4,.9,P(t,k+1.1,.25));if(ok)check(730,G-390,1.8*back(P(t,k+3.0,.3)));
    cue('thud',k+1.15,.6);cue('win',k+3.0,.5);person(400,G,1.1,{spot:true,arm:ok?[50,-80]:[70,-30]});return;}
  if(seg===4){add(`<circle cx="900" cy="420" r="40" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/>`);icon('moon',900,420,.8,.6);desk(720,G,true);
    person(430,G,1.05,{spot:.6,arm:[30,58],arm2:[-30,58]});for(let j=0;j<3;j++){const ph=(t*1.2+j/3)%1;add(`<path d="M${400+j*30},${G-300+ph*80} q6,10 0,16 q-6,-6 0,-16" fill="#fff" opacity="${(1-ph)*.8}"/>`);}
    pop(k+.9,430,G-380,()=>pillShape(430,G-380,'EXHAUSTED',{size:18,dark:true}),{vol:.3});return;}
  if(seg>=5){const sx=100,n=6,w=85,h=48;add(`<path d="${stairsPath(sx,G,n,w,h)}" stroke="#fff" stroke-width="4" fill="none" filter="url(#glow)"/>`);
    const tx_=sx+n*w+40,ty_=G-n*h;add(`<circle cx="${tx_}" cy="${ty_-120}" r="190" fill="url(#bk)" fill-opacity=".18"/>`);person(tx_-20,ty_,.9,{spot:true,ring:false,arm:[44,-88],arm2:[-44,-88]});
    icon('house',tx_+120,ty_-40,.75);icon('trophy',tx_-120,ty_-200,.7);pop(k+.3,330,520,()=>pillShape(330,520,'LIVING THE DREAM',{size:20}),{snd:'win',vol:.5});}}
function dreamer(seg,t,k){const x=540,G=BG;
  if(seg===0||seg===1||(seg===6&&t>resetAt)){bed(x,G);const sw=seg===1?P(t,l(3)+.1,.25)*(1-P(t,l(3)+.6,.3)):0;sleeper(x,G,1,sw);zzz(x-200,G-200,.7);
    if(seg===1){icon('clock',x+330,G-80,.8);if(sw>0)pop(l(3)+.15,x+330,G-180,()=>pillShape(x+330,G-180,'SNOOZE',{size:18,dark:true}),{snd:'nope',vol:.35});dreamBubble(x+80,G-330,.95,P(t,l(3)+1.0,.3));}return;}
  if(seg===2||seg===3||seg===4){couch(x,G);person(x-40,G-110,.85,{ring:false,arm:seg===2?[46,-30]:null});add(`<rect x="${x-245}" y="${G-80}" width="490" height="62" rx="16" fill="#0b0b0b" stroke="#fff" stroke-width="4" filter="url(#glowS)"/>`);
    if(seg===2){icon('phone',x+10,G-210,.55);add(`<circle cx="${x+10}" cy="${G-210}" r="60" fill="url(#bk)" fill-opacity=".2"/>`);
      const fx=880;add(`<rect x="${fx-90}" y="${G-430}" width="180" height="330" rx="20" fill="#0b0b0b" stroke="#fff" stroke-opacity=".7" stroke-width="3"/>`);const id='c'+(uid++);add(`<clipPath id="${id}"><rect x="${fx-86}" y="${G-426}" width="172" height="322"/></clipPath><g clip-path="url(#${id})">`);
      ['trophy','dollar','house','star'].forEach((ic,j)=>{const yy=G-400+((j*110-(t-k)*140)%440+440)%440;add(`<rect x="${fx-70}" y="${yy-40}" width="140" height="90" rx="10" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="2"/>`);icon(ic,fx,yy+4,.45,.8);});add('</g>');label(fx,G-450,"OTHERS' SUCCESS",{size:14,op:.6});}
    if(seg===3)pop(l(7)+.2,x+200,G-300,()=>bubble(x+220,G-300,220,'ONE DAY…',{size:22}),{snd:'pop',vol:.4});
    if(seg===4){const fl=.5+.5*Math.sin(t*9)*Math.sin(t*3.7);add(`<rect x="${x+250}" y="${G-330}" width="200" height="130" rx="10" fill="#fff" fill-opacity="${.1+.15*fl}" stroke="#fff" stroke-width="4" filter="url(#glowS)"/><line x1="${x+350}" y1="${G-200}" x2="${x+350}" y2="${G-160}" stroke="#fff" stroke-width="4"/>`);
      pop(l(9)+.8,x-40,G-330,()=>pillShape(x-40,G-330,'COMFORTABLE',{size:18,dark:true}),{vol:.3});}
    return;}
  if(seg===5||seg===6){bed(x,G);sleeper(x,G);zzz(x-200,G-200,.6);dreamBubble(x+80,G-330,.95,1);pop(l(12)+.2,x+80,G-450,()=>pillShape(x+80,G-460,'STILL DREAMING',{size:18,dark:true}),{snd:'nope',vol:.35});}}

/* ---------- main ---------- */
S.push({s:0,e:END+1,cam:{zoom:0},draw:()=>{
  const t=T,seg=segAt(t),k=SEG[seg];const reset=seg===6&&t>resetAt;const vseg=reset?0:seg;
  const punch=1+.05*(1-eo(P(t,k,.35)));
  add(`<circle cx="540" cy="560" r="420" fill="url(#bk)" fill-opacity=".05"/><circle cx="540" cy="1330" r="380" fill="url(#bk)" fill-opacity=".035"/>`);
  // panels
  g(`transform="translate(540,580) scale(${punch}) translate(-540,-580)"`,()=>{box(30,300,1020,580,{r:30,op:.35,fill:'none',glow:false});ground(TG,1,{x1:40,x2:1040,op:.45});grinder(vseg,t,k);});
  g(`transform="translate(540,1330) scale(${punch}) translate(-540,-1330)"`,()=>{box(30,1060,1020,560,{r:30,op:.25,fill:'none',glow:false});ground(BG,1,{x1:40,x2:1040,op:.35});g(`opacity="${vseg>=2&&vseg<=4?.85:.8}"`,()=>dreamer(vseg,t,k));});
  // labels + goal bars
  pillShape(170,345,'GRINDER',{size:20});pillShape(170,1105,'DREAMER',{size:20,dark:true});
  const gv=reset?0:lerp(GOALG[Math.max(0,seg-1)],GOALG[seg],eio(P(t,k+.4,1.2)));goalBar(352,gv,false);goalBar(1112,0,true);
  // time header
  const spin=vseg===0?t*9:(seg===5?t*30:t*.4+seg);clock(150,185,62,spin);
  const tl=reset?'24 HOURS':TIMES[seg];if(seg===0)title(620,205,tl,{size:96});else pop(reset?resetAt:k,620,170,()=>title(620,205,tl,{size:tl.length>9?74:96}),{snd:!reset?'whoosh':null,vol:.6,d:.25});
  label(1040,58,'THE NEXT VERSION',{size:16,op:.45,anchor:'end',weight:800});
  // hook band (first frame) — and again at the very end so the loop is seamless
  const hb=t<l(2)-.15?1:(t>END-.35?P(t,END-.35,.2):0);
  if(hb>0){add(`<g opacity="${hb}"><rect x="0" y="870" width="1080" height="190" fill="#fff" filter="url(#glow)"/>`);
    const txt=t<le(0)+.05||t>END-.35?'SAME 24 HOURS':'2 DIFFERENT LIVES';add(`<text x="540" y="1000" font-size="${txt.length>14?96:118}" font-weight="900" letter-spacing="3" text-anchor="middle" fill="#000">${txt}</text></g>`);}
  else captions(t);
  // segment flash
  const fl=1-P(t,k,.12);if(seg>0&&fl>0&&!reset)add(`<rect width="${W}" height="${H}" fill="#fff" opacity="${fl*.12}"/>`);
  // sounds
  for(let j=0;j<10;j++)cue('tick',.05+j*.15,.3);cue('hit',0,.7);cue('impact',l(10)-.1,.6);cue('hit',l(13)-.05,.6);for(let j=0;j<6;j++)cue('tick',resetAt+j*.15,.3);
  if(seg===1)for(let j=0;j<6;j++)cue('brick',SEG[1]+.3+j*.45,.2);
}});
