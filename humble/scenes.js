/* ============ "LIFE WILL HUMBLE YOU" — vertical, ~25 s, loops ============ */
const S=[];
const l=i=>L[i].s, le=i=>L[i].e;
const SG=1290, NL=TIMING.lines.length;
const SEG=[0];for(let i=1;i<NL;i++)SEG.push(l(i)-.1);SEG.push(END);
function segAt(t){for(let i=SEG.length-2;i>=0;i--)if(t>=SEG[i])return i;return 0;}
const resetAt=l(NL-1)+.9;

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
function crown(x,y,s=1,op=1){add(`<path d="M${x-30*s},${y} L${x-34*s},${y-34*s} L${x-14*s},${y-16*s} L${x},${y-40*s} L${x+14*s},${y-16*s} L${x+34*s},${y-34*s} L${x+30*s},${y} Z" fill="#fff" opacity="${op}" filter="url(#glow)"/>`);}
function crowned(x,g,s,o={}){person(x,g,s,o);crown(x,g-78*s-34*s-25*s+2*s,s*.95,o.op==null?1:o.op);}
function megaphone(x,y,s=1){add(`<path d="M${x},${y-12*s} L${x+60*s},${y-34*s} L${x+60*s},${y+34*s} L${x},${y+12*s} Z" fill="#0b0b0b" stroke="#fff" stroke-width="4" filter="url(#glowS)"/>`);for(let k=0;k<3;k++){const ph=(T*2+k/3)%1;add(`<path d="M${x+80*s+ph*90},${y-40-ph*30} q${30+ph*20},${40+ph*30} 0,${80+ph*60}" stroke="#fff" stroke-width="4" fill="none" opacity="${1-ph}"/>`);}}
function pedestal(x,top,crack,crumble){const w=270;
  if(crumble<=0){add(`<rect x="${x-w/2}" y="${top}" width="${w}" height="${SG-top}" rx="8" fill="#0b0b0b" stroke="#fff" stroke-width="5" filter="url(#glowS)"/><rect x="${x-w/2-24}" y="${top-26}" width="${w+48}" height="30" rx="8" fill="#0b0b0b" stroke="#fff" stroke-width="5"/>`);
    for(let y=top+80;y<SG;y+=90)add(`<line x1="${x-w/2+10}" y1="${y}" x2="${x+w/2-10}" y2="${y}" stroke="#fff" stroke-opacity=".2" stroke-width="2"/>`);
    if(crack>0)add(`<path d="M${x-20},${top+10} L${x+14},${top+120} L${x-18},${top+230} L${x+22},${top+360} L${x-8},${top+480}" stroke="#fff" stroke-width="4" fill="none" stroke-dasharray="${600*crack} 600"/>`);return;}
  // chunks fall
  for(let k=0;k<12;k++){const r=k%2,row=Math.floor(k/2),y0=top+row*((SG-top)/6),hh=(SG-top)/6-6,x0=x-w/2+r*w/2;const d=clamp((crumble-row*.05)/.7);const fy=y0+d*d*(SG-y0-hh)*1.0,fx=x0+(r?1:-1)*d*120,rot=(r?1:-1)*d*40;
    add(`<rect x="${fx}" y="${Math.min(fy,SG-hh)}" width="${w/2-6}" height="${hh}" rx="6" fill="#0b0b0b" stroke="#fff" stroke-width="4" transform="rotate(${rot},${fx+w/4},${fy+hh/2})"/>`);}}
function cup(x,y,fill,overflow){add(`<path d="M${x-80},${y-120} L${x-62},${y} L${x+62},${y} L${x+80},${y-120}" fill="#0b0b0b" stroke="#fff" stroke-width="5" filter="url(#glowS)"/><path d="M${x+80},${y-90} q40,10 30,50 q-8,20 -38,22" fill="none" stroke="#fff" stroke-width="5"/>`);
  if(fill>0){const fy=y-6-108*fill;add(`<path d="M${x-62+(1-fill)*-14},${fy} L${x-58},${y-6} L${x+58},${y-6} L${x+62+(1-fill)*14},${fy} Z" fill="#fff" fill-opacity=".75"/>`);}
  if(overflow)for(let k=0;k<4;k++){const ph=(T*1.8+k/4)%1;add(`<circle cx="${x+(k%2?84:-84)+(k%2?1:-1)*ph*20}" cy="${y-118+ph*120}" r="7" fill="#fff" opacity="${1-ph}"/>`);}}
function pour(x,y0,y1,on){if(!on)return;add(`<line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-dasharray="18 10" stroke-dashoffset="${-T*200}" filter="url(#glowS)"/>`);icon('book',x,y0-40,.8);}
function throne(x,g){add(`<g filter="url(#glowS)" stroke="#fff" stroke-width="4" fill="#0b0b0b"><rect x="${x-70}" y="${g-210}" width="140" height="150" rx="10"/><rect x="${x-80}" y="${g-80}" width="160" height="40" rx="8"/><line x1="${x-70}" y1="${g-40}" x2="${x-70}" y2="${g}"/><line x1="${x+70}" y1="${g-40}" x2="${x+70}" y2="${g}"/></g>`);}

/* ---------- the hook scene (also the loop's last frame) ---------- */
function hookScene(t,frozen){const x=540,top=820;
  const crack=frozen?0:P(t,.35,.25),crumble=frozen?0:P(t,.6,.8);const fall=frozen?0:P(t,.62,.5);
  pedestal(x,top,crack,crumble);
  // the bragger on top -> falls
  let py=top-26,rot=0;if(fall>0){py=lerp(top-26,SG,fall*fall);rot=lerp(0,80,fall);}
  const landed=!frozen&&t>1.12;
  if(!landed){g(`transform="rotate(${rot},${x},${py})"`,()=>crowned(x,py,1.4,{ring:false,spot:false,arm:[44,-88],arm2:[-44,-88]}));
    if(fall<=0)pop(frozen?-1:-.01,x+190,top-400,()=>bubble(x+200,top-400,400,"I'M THE BEST!",{size:32}),{snd:null,d:.01});}
  else{const up=P(t,1.8,.6);// on the floor, then gets up humbly — crown left behind
    g(`transform="rotate(${lerp(80,0,eio(up))},${x-40},${SG})"`,()=>person(x-40,SG,1.05,{ring:false,spot:up>0?up*.8:false,arm:up>=1?[40,58]:null,arm2:up>=1?[-40,58]:null}));
    crown(x+200,SG-6,.9,.8);ring(x,SG,1.12,{r0:60,r1:420});}
  if(!frozen&&t>1.12&&t<1.5)for(let k=0;k<8;k++){const a=k*Math.PI/4,q=P(t,1.12,.4);add(`<circle cx="${x+Math.cos(a)*(60+200*q)}" cy="${SG-10-Math.abs(Math.sin(a))*90*q}" r="5" fill="#fff" opacity="${1-q}"/>`);}}

/* ---------- segments ---------- */
function stage(vs,t,k,reset){const cx=540;ground(SG,1,{op:.45});
  if(vs===0||reset){hookScene(reset?0:t,reset);return;}
  if(vs===1){bigText(cx,620,'NOBODY TELLS',100);bigText(cx,740,'YOU THIS',100);person(cx,SG,1.05,{spot:true,arm:[20,-40]});add(`<line x1="${cx+18}" y1="${SG-150}" x2="${cx+18}" y2="${SG-110}" stroke="#000" stroke-width="5"/>`);return;}
  if(vs===2||vs===3){// a room: the loud one vs the quiet learner
    const quietOn=vs===3;const lx=330,qx=830;
    add(`<rect x="70" y="420" width="940" height="${SG-420}" rx="20" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="2"/>`);
    [470,600].forEach(x=>person(x,SG,.7,{op:.35,ring:false}));
    g(`opacity="${quietOn?.45:1}"`,()=>{crowned(lx,SG,1.05,{spot:!quietOn,arm:[70,-10]});megaphone(lx+76,SG-150,1);
      ['ME!','ME!','LOOK AT ME!'].forEach((s,j)=>{const ph=(T*.8+j/3)%1;pillShape(lx+60+j*40,SG-300-ph*260,s,{size:18,dark:true});});});
    g(`opacity="${quietOn?1:.45}"`,()=>{person(qx,SG,.95,{spot:quietOn,arm:[-40,-30]});icon('book',qx-40,SG-170,.7);
      if(quietOn)[0,1,2].forEach(j=>pop(l(3)+.5+j*.35,qx-60+j*60,SG-330,()=>icon('bulb',qx-60+j*60,SG-330,.6),{snd:'pop',vol:.35}));});
    pill(quietOn?l(3)+.2:99,qx,520,'LEARNING',{size:22});return;}
  if(vs===4||vs===5){// the full cup vs the empty cup
    const humble=vs===5;const x0=humble?720:360;
    g(`opacity="${humble?.4:1}"`,()=>{cup(360,980,1,!humble);crowned(360,SG,.9,{ring:false});label(360,700,'EGO',{size:30,op:.9,weight:900});pour(360,560,840,!humble);
      if(!humble)pop(k+.5,360,620,()=>bubble(360,620,330,'I ALREADY KNOW',{size:20}),{snd:'pop',vol:.4});});
    g(`opacity="${humble?1:.35}"`,()=>{const f=humble?eio(P(t,k+.4,1.0))*.8:0;cup(720,980,f,false);person(720,SG,.9,{ring:false,spot:humble?.7:false});label(720,700,'HUMILITY',{size:30,op:.9,weight:900});pour(720,560,880-108*f,humble);
      if(humble)pop(k+.3,720,620,()=>bubble(720,620,250,'TEACH ME',{size:22}),{snd:'pop',vol:.4});});return;}
  if(vs===6||vs===7){// stairs: ego sits on a throne halfway, humility keeps climbing
    const sx=120,n=9,w=95,h=72;add(`<path d="${stairsPath(sx,SG,n,w,h)}" stroke="#fff" stroke-width="4" fill="none" filter="url(#glow)"/>`);
    const ex=sx+3.5*w,ey=SG-4*h;throne(ex,ey);crowned(ex,ey-80,.8,{ring:false,op:vs===7?.55:1});pop(k+.4,ex,ey-330,()=>pillShape(ex,ey-330,"I'VE MADE IT",{size:18,dark:true}),{vol:.4});
    label(ex,ey+44,vs===7?'GROWTH: STOPPED':'',{size:15,op:.6});
    if(vs===7){const c=clamp((t-k-.2)/2.2)*(n-1),i=Math.floor(c),f=c-i;const sp=j=>[sx+(j+.5)*w,SG-(j+1)*h];const[ax,ay]=sp(i),[bx,by]=sp(Math.min(n-1,i+1));
      const[px,py]=i>=n-1?sp(n-1):hopTo(ax,ay,bx,by,f,36);person(px,py,.75,{spot:.7,ring:false,arm:i>=n-1?[40,-80]:null});for(let j=0;j<n-1;j++)cue('hop',k+.2+j*2.2/(n-1),.3);
      if(i>=n-1)ring(px,py-80,k+2.4,{r0:40,r1:240});pill(k+.6,760,470,'ALWAYS MORE',{size:22});}
    return;}
  if(vs===8){add(`<circle cx="${cx}" cy="${SG-260}" r="300" fill="url(#bk)" fill-opacity=".12"/>`);icon('trophy',cx-260,SG-120,1.3);icon('trophy',cx+260,SG-120,1.3);
    crowned(cx,SG,1.15,{spot:true,arm:[60,-40],arm2:[-60,-40]});icon('book',cx,SG-200,1.0);pill(k+.6,cx,560,'STILL A STUDENT',{size:26});return;}
  if(vs===9||vs===10){// work loud, ego quiet
    person(cx,SG,1.05,{spot:true,arm:[60,-20]});
    if(vs===9){[[-300,620,'trophy'],[300,620,'chart'],[-220,880,'check'],[230,860,'star']].forEach(([dx,y,ic],j)=>pop(k+.15+j*.15,cx+dx,y,()=>{if(ic==='check')check(cx+dx,y,2);else icon(ic,cx+dx,y,1.3);ring(cx+dx,y,k+.15+j*.15,{r0:40,r1:200,d:.6});},{snd:'hit',vol:.35}));
      bigText(cx,500,'LET YOUR WORK',72);bigText(cx,590,'BE LOUD',96);}
    else{bigText(cx,560,'EGO',110);const v=1-eio(P(t,k+.3,.8));add(`<rect x="240" y="640" width="600" height="30" rx="15" fill="none" stroke="#fff" stroke-width="3"/><rect x="246" y="646" width="${Math.max(18,588*v)}" height="18" rx="9" fill="#fff"/>`);
      icon('note',cx-360,655,.6);label(cx,740,'VOLUME: '+Math.round(v*100)+'%',{size:22,op:.8,weight:800});bubble(cx+150,SG-330,140,'…',{size:30});}
    return;}
  if(vs===11){// rebuild the pedestal for the loop
    const p=eio(P(t,k+.2,.8));pedestal(cx,lerp(SG,820,p),0,0);crowned(cx,lerp(SG,820,p)-26,1.4,{ring:false,arm:[44,-88],arm2:[-44,-88]});return;}}

/* ---------- main ---------- */
S.push({s:0,e:END+1,cam:{zoom:0},draw:()=>{
  const t=T,seg=segAt(t),k=SEG[seg];const reset=seg===NL-1&&t>resetAt;const vs=reset?0:seg;
  const punch=1+.04*(1-eo(P(t,k,.35)));const sh=P(t,1.12,.35),am=sh>0&&sh<1?(1-sh)*22:0;
  add(`<circle cx="540" cy="700" r="480" fill="url(#bk)" fill-opacity=".05"/>`);
  g(`transform="translate(${540+Math.sin(t*90)*am},${800+Math.cos(t*80)*am}) scale(${punch}) translate(-540,-800)"`,()=>stage(vs,t,k,reset));
  // top text hook (first ~2.6 s and at the loop end)
  const so=reset?P(t,resetAt,.2):1-P(t,2.6,.3);if(so>0)add(`<g opacity="${so}"><rect x="140" y="140" width="800" height="110" rx="55" fill="#fff" filter="url(#glow)"/><text x="540" y="217" font-size="56" font-weight="900" letter-spacing="2" text-anchor="middle" fill="#000">STAY HUMBLE.</text></g>`);
  label(1040,58,'THE NEXT VERSION',{size:16,op:.45,anchor:'end',weight:800});
  const hb=t<le(0)+.1?1:(reset?P(t,resetAt,.15):0);
  if(hb>0){add(`<g opacity="${hb}"><rect x="0" y="1335" width="1080" height="190" fill="#fff" filter="url(#glow)"/><text x="540" y="1458" font-size="74" font-weight="900" letter-spacing="1" text-anchor="middle" fill="#000">LIFE WILL HUMBLE YOU</text></g>`);}
  else captions(t);
  const fl=1-P(t,k,.12);if(seg>0&&fl>0&&!reset)add(`<rect width="${W}" height="${H}" fill="#fff" opacity="${fl*.12}"/>`);
  if(t>1.12&&t<1.25)add(`<rect width="${W}" height="${H}" fill="#fff" opacity="${(1-P(t,1.12,.13))*.4}"/>`);
  if(seg>0)cue('whoosh',k,.4);cue('hit',0,.7);cue('thunk',.35,.6);cue('ting',.4,.4);cue('drop',.62,.9);cue('impact',1.12,.9);cue('thud',1.12,1);cue('brick',1.0,.6);cue('brick',1.2,.5);cue('whoosh',resetAt,.4);
}});
