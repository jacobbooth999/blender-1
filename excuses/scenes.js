/* ============ "YOUR EXCUSES ARE TRAPPING YOU" — vertical, ~32 s, loops ============ */
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

/* ---------- props ---------- */
const BALL=[230,SG-70];
function ball(op=1){add(`<g opacity="${op}"><circle cx="${BALL[0]}" cy="${BALL[1]}" r="70" fill="#0b0b0b" stroke="#fff" stroke-width="5" filter="url(#glowS)"/>`);label(BALL[0],BALL[1]+8,'EXCUSES',{size:20,op:1,weight:900,sp:.08});add('</g>');}
function chain(x1,y1,x2,y2,slack=0,op=1){const n=14;let d='';for(let k=0;k<=n;k++){const u=k/n,x=lerp(x1,x2,u),y=lerp(y1,y2,u)+Math.sin(Math.PI*u)*slack;d+=`<ellipse cx="${x}" cy="${y}" rx="11" ry="7" fill="none" stroke="#fff" stroke-width="3.5" transform="rotate(${Math.atan2(y2-y1,x2-x1)*57.3+(k%2?90:0)},${x},${y})"/>`;}add(`<g opacity="${op}">${d}</g>`);}
function goalFlag(x,op=1){add(`<g opacity="${op}"><circle cx="${x}" cy="${SG-240}" r="190" fill="url(#bk)" fill-opacity=".14"/>`);icon('flag',x,SG-90,1.8);label(x,SG+50,'YOUR GOALS',{size:18,op:.7,weight:800});add('</g>');}
function bars(x,y0,y1,p){const off=(1-eo(p))*-500;for(let k=0;k<6;k++){const bx=x-150+k*60;add(`<rect x="${bx-4}" y="${y0+off}" width="8" height="${y1-y0}" rx="4" fill="#fff" opacity="${Math.min(1,p*2)}" filter="url(#glowS)"/>`);}add(`<rect x="${x-175}" y="${y0-6+off}" width="350" height="12" rx="6" fill="#fff" opacity="${Math.min(1,p*2)}" filter="url(#glowS)"/>`);}
function promiseCard(x,y,txt,broke){add(`<g opacity="${broke>0?1-.5*broke:1}">`);box(x-150,y-70,300,140,{r:18,op:.9});label(x,y-18,'PROMISE',{size:14,op:.55});label(x,y+22,txt,{size:24,op:1,weight:900});
  if(broke>0)add(`<path d="M${x-10},${y-70} L${x+16},${y-20} L${x-14},${y+20} L${x+10},${y+70}" stroke="#fff" stroke-width="5" fill="none" stroke-dasharray="${200*broke} 200"/>`);add('</g>');}

/* ---------- hook (also the loop's last frame) ---------- */
function hookScene(t,frozen){const fx=860;goalFlag(fx);ball();
  // running toward the goal, yanked back by the chain at 0.45s, then caged
  const run=frozen?.0:clamp(t/.45),yank=frozen?0:P(t,.45,.35),cage=frozen?0:P(t,1.5,.5);
  let px=lerp(560,640,run),rot=0;if(yank>0){px=lerp(640,420,eo(yank));rot=lerp(0,-70,eo(yank));}
  const bob=yank>0?0:Math.abs(Math.sin(t*16))*10;const getUp=frozen?1:P(t,1.1,.4);if(yank>=1)rot=lerp(-70,0,eio(getUp));
  chain(BALL[0]+60,BALL[1]-10,px-24,SG-30,yank>0?0:-6);
  g(`transform="rotate(${rot},${px},${SG})"`,()=>person(px,SG-bob,1.25,{ring:false,spot:false,arm:[70,-60],arm2:[-60,-20]}));
  if(cage>0){bars(px,SG-330,SG,cage);pop(1.75,px,SG-420,()=>pillShape(px,SG-420,'TRAPPED',{size:24,dark:true}),{snd:'thud',vol:.6});}}

/* ---------- segments ---------- */
function stage(vs,t,k,reset){const cx=540;ground(SG,1,{op:.45});
  if(vs===0||reset){hookScene(reset?0:t,reset);return;}
  if(vs===1){bigText(cx,600,'THE TRUTH',110);label(cx,690,'NOBODY WANTS TO HEAR',{size:28,op:.85,weight:900});person(cx,SG,1.15,{spot:true,arm:[26,-70],arm2:[-26,-70]});return;}
  if(vs>=2&&vs<=6){// excuses become bricks in a wall between you and your goals
    goalFlag(880,.8);person(200,SG,1.1,{spot:.7,arm:vs<=4?[60,-30]:null});
    const ex=[["I'M TOO TIRED",2],["NO TIME",3],["MONDAY",4]];const danger=vs===6;
    ex.forEach(([tx,i],j)=>{const tt=l(i)+.05;if(T<tt)return;const q=eo(P(t,tt,.25));const y=SG-60-j*120;
      add(`<rect x="430" y="${y-55-(1-q)*80}" width="300" height="110" rx="10" fill="#0b0b0b" stroke="#fff" stroke-width="5" filter="url(#glowS)" opacity="${q}"/>`);label(580,y+10-(1-q)*80,tx,{size:28,op:q,weight:900});
      if(vs===5)check(705,y-40,1.1*back(P(t,k+.3+j*.15,.3)));if(danger){cross(705,y-40,.8,.95,P(t,k+.2+j*.12,.25));}});
    if(vs>=2&&vs<=4)cue('thunk',l(vs)+.3,.6);
    if(vs===5)pill(k+.4,580,SG-470,'SOUNDS REASONABLE…',{size:22,dark:true});
    if(danger){pop(k+.6,580,SG-470,()=>{add(`<path d="M580,${SG-560} L650,${SG-430} L510,${SG-430} Z" fill="#0b0b0b" stroke="#fff" stroke-width="5" filter="url(#glow)"/>`);label(580,SG-450,'!',{size:56,op:1,weight:900,sp:0});},{snd:'hit',vol:.6});pill(k+.8,580,SG-620,'DANGEROUS',{size:26});}
    return;}
  if(vs===7||vs===8){// broken promises + draining self-trust
    person(cx,SG,1.05,{spot:.7,arm:vs===8?[30,58]:null,arm2:vs===8?[-30,58]:null});
    [['TRAIN',0],['STUDY',1],['SAVE',2]].forEach(([tx,j])=>{const y=560+j*170;const br=P(t,l(7)+.6+j*.5,.3);promiseCard(cx,y,tx,br);cue('ting',l(7)+.6+j*.5,.4);});
    if(vs===8){const v=1-eio(P(t,k+.3,1.8));label(cx,1080,'SELF-TRUST',{size:20,op:.8,weight:900});add(`<rect x="290" y="1100" width="500" height="30" rx="15" fill="none" stroke="#fff" stroke-width="3"/><rect x="296" y="1106" width="${Math.max(18,488*v)}" height="18" rx="9" fill="#fff"/>`);label(cx,1170,Math.round(v*100)+'%',{size:20,op:.85,weight:800});}
    return;}
  if(vs===9){// someone with less, doing it anyway (single scene)
    goalFlag(900);const u=clamp((t-k)/4.2);const x=lerp(140,860,u),bob=Math.abs(Math.sin(t*14))*8;person(x,SG-bob,1.0,{spot:.8,ring:false,arm:[50,-40]});
    [['LESS TIME',.4],['LESS MONEY',1.4],['MORE PROBLEMS',2.6]].forEach(([tx,d],j)=>{if(t>k+d)pillShape(x-10,SG-300-j*62,tx,{size:17,dark:true});cue('pop',k+d,.35);});
    if(u>=1)ring(900,SG-120,k+4.2,{r0:60,r1:300});return;}
  if(vs===10||vs===11){person(cx,SG,1.15,{spot:true,arm:vs===11?[60,-10]:null});
    if(vs===10){bigText(cx,620,'TALENT',110,.85);strike(cx-230,cx+230,585,P(t,k+.6,.3));cue('nope',k+.6,.4);}
    else{bubble(cx-170,640,300,'5 MORE MINUTES?',{size:20});bubble(cx+150,820,320,'SKIP TODAY?',{size:20,tail:'right'});cross(cx-170,640,1.4,.9,P(t,k+.5,.25));cross(cx+150,820,1.4,.9,P(t,k+.8,.25));bigText(cx,470,'NO DEBATE',80);}
    return;}
  if(vs===12||vs===13){person(cx-200,SG,1.1,{spot:.7});
    pop(l(12)+.3,cx+120,700,()=>bubble(cx+120,700,380,"I'M TOO TIRED…",{size:26}),{snd:'pop',vol:.4});
    const st=back(P(t,l(13),.35));if(st>0)g(`transform="translate(${cx+120},700) rotate(-10) scale(${st}) translate(${-cx-120},-700)"`,()=>{add(`<rect x="${cx-150}" y="630" width="540" height="140" rx="16" fill="#0b0b0b" stroke="#fff" stroke-width="9" filter="url(#glow)"/>`);bigText(cx+120,735,'A CHOICE',92);});
    cue('impact',l(13),.6);return;}
  if(vs===14||vs===15){// break the chain, run to the goal
    goalFlag(880);ball(.6);const snap=P(t,l(14)+.3,.2),run=clamp((t-l(14)-.5)/1.6);const px=lerp(420,800,eio(run));
    if(snap<1)chain(BALL[0]+60,BALL[1]-10,px-24,SG-30,0,1-snap);else{chain(BALL[0]+60,BALL[1]-10,BALL[0]+170,SG-20,0,.5);}
    if(snap>0&&snap<1)ring(px-24,SG-30,l(14)+.3,{r0:20,r1:200,d:.5});cue('ting',l(14)+.3,.8);cue('impact',l(14)+.3,.4);
    person(px,SG-(run>0&&run<1?Math.abs(Math.sin(t*16))*10:0),1.15,{spot:true,ring:false,arm:run>=1?[44,-88]:[70,-60],arm2:run>=1?[-44,-88]:[-60,-20]});
    if(run>=1)ring(880,SG-200,l(14)+2.1,{r0:60,r1:320});return;}}

/* ---------- main ---------- */
S.push({s:0,e:END+1,cam:{zoom:0},draw:()=>{
  const t=T,seg=segAt(t),k=SEG[seg];const reset=seg===NL-1&&t>resetAt;const vs=reset?0:seg;
  const punch=1+.04*(1-eo(P(t,k,.35)));const sh=P(t,.45,.35),am=sh>0&&sh<1?(1-sh)*24:0;
  add(`<circle cx="540" cy="700" r="480" fill="url(#bk)" fill-opacity=".05"/>`);
  g(`transform="translate(${540+Math.sin(t*90)*am},${800+Math.cos(t*80)*am}) scale(${punch}) translate(-540,-800)"`,()=>stage(vs,t,k,reset));
  const so=reset?P(t,resetAt,.2):1-P(t,2.7,.3);if(so>0)add(`<g opacity="${so}"><rect x="90" y="140" width="900" height="110" rx="55" fill="#fff" filter="url(#glow)"/><text x="540" y="217" font-size="54" font-weight="900" letter-spacing="2" text-anchor="middle" fill="#000">STOP MAKING EXCUSES</text></g>`);
  label(1040,58,'THE NEXT VERSION',{size:16,op:.45,anchor:'end',weight:800});
  const hb=t<le(0)+.1?1:(reset?P(t,resetAt,.15):0);
  if(hb>0){add(`<g opacity="${hb}"><rect x="0" y="1335" width="1080" height="190" fill="#fff" filter="url(#glow)"/><text x="540" y="1456" font-size="50" font-weight="900" letter-spacing="1" text-anchor="middle" fill="#000">YOUR EXCUSES ARE TRAPPING YOU</text></g>`);}
  else captions(t);
  const fl=1-P(t,k,.12);if(seg>0&&fl>0&&!reset)add(`<rect width="${W}" height="${H}" fill="#fff" opacity="${fl*.12}"/>`);
  if(t>.45&&t<.6)add(`<rect width="${W}" height="${H}" fill="#fff" opacity="${(1-P(t,.45,.15))*.4}"/>`);
  if(seg>0)cue('whoosh',k,.4);cue('hit',0,.7);for(let j=0;j<3;j++)cue('step',.05+j*.14,.7);cue('impact',.45,.9);cue('thud',.55,1);cue('ting',.46,.6);cue('whoosh',resetAt,.4);
}});
