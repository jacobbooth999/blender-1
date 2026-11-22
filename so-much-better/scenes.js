/* ============ "YOU COULD BE SO MUCH BETTER" — vertical, ~32 s, loops ============ */
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

/* ---------- "YOU COULD BE SO MUCH BETTER" — props ---------- */
function promiseCard(x,y,txt,done){box(x-170,y-60,340,120,{r:18,op:.9});label(x,y-14,'PROMISE',{size:14,op:.55});label(x,y+24,txt,{size:22,op:1,weight:900});if(done>0)check(x+150,y-50,1.1*back(done));}
function mirror(x,y,op=1){add(`<g opacity="${op}"><ellipse cx="${x}" cy="${y}" rx="200" ry="300" fill="#0d0d0d" stroke="#fff" stroke-width="7" filter="url(#glow)"/><line x1="${x}" y1="${y+300}" x2="${x}" y2="${SG}" stroke="#fff" stroke-width="6"/><rect x="${x-90}" y="${SG-14}" width="180" height="14" rx="7" fill="#fff"/></g>`);}
function boulder(x,y,r,txt){add(`<path d="M${x-r},${y} Q${x-r*1.05},${y-r*1.2} ${x-r*.2},${y-r*1.4} Q${x+r*.9},${y-r*1.5} ${x+r},${y-r*.4} Q${x+r*1.05},${y} ${x+r*.6},${y} Z" fill="#0b0b0b" stroke="#fff" stroke-width="5" filter="url(#glowS)"/>`);label(x,y-r*.6,txt,{size:Math.max(14,r*.2),op:1,weight:900});}

/* ---------- hook: spotlight slam, figure walks at the camera and points at YOU ---------- */
function hookScene(t,frozen){
  const sl=frozen?0:P(t,.22,.12),walk=frozen?0:eio(P(t,.4,1.0));const s=lerp(.9,3.0,walk),y=lerp(SG,1000,walk);
  if(sl>0)add(`<g opacity="${sl}"><polygon points="${540-90},0 ${540+90},0 ${540+420},${SG} ${540-420},${SG}" fill="url(#cone)" filter="url(#blur12)"/></g>`);
  if(!frozen&&t>.22&&t<.32)add(`<rect width="${W}" height="${H}" fill="#fff" opacity="${(1-P(t,.22,.1))*.35}"/>`);
  person(540,y,s,{ring:false,spot:false,op:frozen?.55:lerp(.55,1,sl),arm:walk>.2?[12,-6]:null});
  if(walk>.2){const fx=540+12*s,fy=y-78*s+22*s-6*s,pr=clamp((walk-.2)/.8);add(`<circle cx="${fx}" cy="${fy}" r="${(10+8*pr)*s}" fill="#fff" stroke="#000" stroke-width="${2*s}" filter="url(#glow)"/>`);
    for(let k=0;k<8;k++){const a=k*Math.PI/4,r0=(24+4*Math.sin(T*12))*s,r1=r0+16*s;add(`<line x1="${fx+r0*Math.cos(a)}" y1="${fy+r0*Math.sin(a)}" x2="${fx+r1*Math.cos(a)}" y2="${fy+r1*Math.sin(a)}" stroke="#fff" stroke-width="${2.5*s}" stroke-linecap="round" opacity="${pr}"/>`);}}
  const yy=back(P(t,1.0,.3));if(!frozen&&yy>0)g(`transform="translate(540,380) scale(${yy}) translate(-540,-380)"`,()=>bigText(540,420,'YES, YOU.',140));}

/* ---------- segments ---------- */
function stage(vs,t,k,reset){const cx=540;if(vs!==0&&!reset)ground(SG,1,{op:.45});
  if(vs===0||reset){hookScene(reset?0:t,reset);return;}
  if(vs===1||vs===2){person(260,SG,1.05,{spot:.7,arm:[20,-36]});
    [['THE GYM','dumbbell'],['STUDYING','book'],['YOUR BUSINESS','briefcase']].forEach(([tx,ic],j)=>{const y=560+j*190;pop(l(1)+.2+j*.3,700,y,()=>{box(480,y-70,440,140,{r:20,op:.9});icon(ic,550,y,.7);label(610,y+10,tx,{size:24,op:1,weight:900,anchor:'start'});add(`<rect x="860" y="${y-22}" width="44" height="44" rx="8" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="6 5"/>`);},{snd:'pop',vol:.35});});
    if(vs===2)pill(k+.3,700,1130,'NOT STARTED',{size:24,dark:true});return;}
  if(vs===3){icon('phone',360,760,2.2);label(360,940,'SCREEN TIME: 5H 12M',{size:20,op:.85,weight:900});
    pop(k+1.2,720,640,()=>bubble(720,640,380,"I DON'T HAVE TIME",{size:22}),{snd:'pop',vol:.4});cross(720,640,1.5,.9,P(t,k+2.0,.25));cue('nope',k+2.0,.4);person(720,SG,1,{spot:.6,arm:[-40,-30]});return;}
  if(vs===4){const p=.99*eo(P(t,k,1.2));bigText(cx,560,'READY?',110);bar(150,680,780,p,{lab:'WAITING TO FEEL READY',right:Math.round(p*100)+'%',h:44});spinner(cx,800,22);
    pop(l(4)+1.3,cx,900,()=>pillShape(cx,900,'NEVER COMES',{size:26,dark:true}),{snd:'nope',vol:.4});person(cx,SG,1,{spot:.6,arm:[14,-34]});return;}
  if(vs===5){add(`<circle cx="830" cy="640" r="200" fill="url(#bk)" fill-opacity=".16"/>`);icon('trophy',830,640,2.2);label(830,800,'THE RESULTS',{size:22,op:.9,weight:900});
    icon('calendar',260,660,1.8);label(260,800,'THE ROUTINE',{size:22,op:.6,weight:900});cross(260,660,1.8,.85,P(t,k+1.0,.25));
    person(560,SG,1.05,{spot:.6,arm:[70,-60]});return;}
  if(vs===6){bigText(cx,600,"HERE'S WHAT",96);bigText(cx,710,"YOU'RE GOING",96);bigText(cx,820,'TO DO',96);person(cx,SG,1.1,{spot:true,arm:[18,-52]});cue('impact',k+.1,.4);return;}
  if(vs===7){const x=600;icon('clock',300,640,2.2);label(300,800,'6:00 AM',{size:28,op:.95,weight:900});const up=P(t,k+.6,.4);
    g(`transform="rotate(${lerp(-90,0,eio(up))},${x-120},${SG})"`,()=>person(x,SG,1.05,{spot:up>0?.8:false,ring:false,arm:up>=1?[50,-80]:null}));if(up>=1)check(x+120,SG-330,1.6*back(P(t,k+1.0,.3)));cue('win',k+1.0,.5);return;}
  if(vs===8){boulder(640,SG,220,'THE HARD THING');[[230,SG,40],[300,SG,30],[360,SG,24]].forEach(([x,y,r])=>boulder(x,y,r,''));const p=P(t,k+.3,1.2);
    person(lerp(170,370,p),SG,1.05,{spot:.7,arm:[80,-30],arm2:[70,-10]});label(300,SG-80,'EASY STUFF',{size:16,op:.5});pill(k+.5,640,620,'FIRST',{size:28});return;}
  if(vs===9){person(220,SG,1.05,{spot:.7,arm:[50,-60]});const tr=P(t,k+.4,1.8);
    ['WAKE UP ON TIME','TRAIN TODAY','NO SNOOZE'].forEach((tx,j)=>promiseCard(700,520+j*170,tx,P(t,k+.4+j*.5,.3)));for(let j=0;j<3;j++)cue('win',k+.4+j*.5,.3);
    label(700,1060,'SELF-TRUST',{size:18,op:.8,weight:900});add(`<rect x="470" y="1080" width="460" height="28" rx="14" fill="none" stroke="#fff" stroke-width="3"/><rect x="476" y="1086" width="${Math.max(16,448*tr)}" height="16" rx="8" fill="#fff"/>`);return;}
  if(vs===10){pop(k,cx,600,()=>{bigText(cx,620,'TOMORROW',100,.7);strike(cx-300,cx+300,585,P(t,k+.4,.3));},{snd:'nope',vol:.4});
    const tp=back(P(t,l(10)+.7,.35));if(tp>0)g(`transform="translate(${cx},800) scale(${tp}) translate(${-cx},-800)"`,()=>{add(`<ellipse cx="${cx}" cy="790" rx="280" ry="110" fill="none" stroke="#fff" stroke-width="7" filter="url(#glow)"/>`);bigText(cx,830,'TODAY',120);});
    cue('impact',l(10)+.7,.5);person(cx,SG,1.05,{spot:true,arm:[18,-52]});return;}
  if(vs===11){[200,360,720,880].forEach(x=>add(`<g filter="url(#glowS)" stroke="#fff" stroke-width="3" fill="none" opacity=".4"><rect x="${x-40}" y="${SG-120}" width="80" height="70" rx="8"/><line x1="${x-34}" y1="${SG-50}" x2="${x-34}" y2="${SG}"/><line x1="${x+34}" y1="${SG-50}" x2="${x+34}" y2="${SG}"/></g>`));
    person(cx,SG,1.1,{spot:true});pill(k+.6,cx,620,"NOBODY'S COMING",{size:28,dark:true});return;}
  if(vs===12||vs===13){mirror(720,780);person(330,SG,1.05,{spot:.6,arm:[60,-20]});const r=P(t,l(12)+.4,.8);
    const id='c'+(uid++);add(`<clipPath id="${id}"><ellipse cx="720" cy="780" rx="192" ry="292"/></clipPath><g clip-path="url(#${id})">`);
    add(`<circle cx="720" cy="760" r="${220*r}" fill="url(#bk)" fill-opacity="${.25*r}"/>`);person(720,1040,lerp(.9,1.25,r),{ring:false,op:.4+.6*r,arm:vs===13?[44,-88]:null,arm2:vs===13?[-44,-88]:null});add('</g>');
    if(vs===13)pill(k+.3,720,420,'WAITING ON YOUR DECISION',{size:22});return;}
  if(vs===14||vs===15){const run=clamp((t-l(14)-.3)/1.0);person(lerp(cx,1250,eio(run)),SG-(run>0&&run<1?Math.abs(Math.sin(t*16))*10:0),1.1,{spot:run<.3,ring:false,arm:[70,-60],arm2:[-60,-20]});
    const gp=back(P(t,l(14)+.9,.3));if(gp>0)g(`transform="translate(${cx},760) scale(${gp}) translate(${-cx},-760)"`,()=>bigText(cx,820,'GO.',240));cue('impact',l(14)+.9,.7);return;}}

/* ---------- main ---------- */
S.push({s:0,e:END+1,cam:{zoom:0},draw:()=>{
  const t=T,seg=segAt(t),k=SEG[seg];const reset=seg===NL-1&&t>resetAt;const vs=reset?0:seg;
  const punch=1+.04*(1-eo(P(t,k,.35)));const sh=P(t,1.0,.3),am=sh>0&&sh<1?(1-sh)*18:0;
  add(`<circle cx="540" cy="700" r="480" fill="url(#bk)" fill-opacity=".05"/>`);
  g(`transform="translate(${540+Math.sin(t*90)*am},${800+Math.cos(t*80)*am}) scale(${punch}) translate(-540,-800)"`,()=>stage(vs,t,k,reset));
  const so=reset?P(t,resetAt,.2):1-P(t,2.8,.3);if(so>0)add(`<g opacity="${so}"><rect x="140" y="140" width="800" height="110" rx="55" fill="#fff" filter="url(#glow)"/><text x="540" y="217" font-size="54" font-weight="900" letter-spacing="2" text-anchor="middle" fill="#000">THIS IS ABOUT YOU</text></g>`);
  label(1040,58,'THE NEXT VERSION',{size:16,op:.45,anchor:'end',weight:800});
  const hb=t<le(0)+.1?1:(reset?P(t,resetAt,.15):0);
  if(hb>0){add(`<g opacity="${hb}"><rect x="0" y="1335" width="1080" height="190" fill="#fff" filter="url(#glow)"/><text x="540" y="1456" font-size="56" font-weight="900" letter-spacing="1" text-anchor="middle" fill="#000">YOU COULD BE SO MUCH BETTER</text></g>`);}
  else captions(t);
  const fl=1-P(t,k,.12);if(seg>0&&fl>0&&!reset)add(`<rect width="${W}" height="${H}" fill="#fff" opacity="${fl*.12}"/>`);
  if(seg>0)cue('whoosh',k,.4);cue('thunk',.22,1);cue('hit',.22,.8);for(let j=0;j<4;j++)cue('step',.45+j*.22,.8);cue('impact',1.0,.9);cue('whoosh',resetAt,.4);
}});
