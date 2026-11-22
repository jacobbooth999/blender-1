/* ============ "GAMERS HAVE THE SECRET" — game vs real life (vertical, ~30 s, loops) ============ */
const S=[];
const l=i=>L[i].s, le=i=>L[i].e;
const TG=830, BG=1570;
const SEG=[0];for(let i=1;i<=14;i++)SEG.push(l(i)-.1);SEG.push(END);
function segAt(t){for(let i=SEG.length-2;i>=0;i--)if(t>=SEG[i])return i;return 0;}
const resetAt=l(14)+.05;

/* ---------- word captions (same system as "Same 24 Hours") ---------- */
const CAP=[];TIMING.lines.forEach((ln,i)=>{if(i<1)return;const w=ln.text.split(' ');const tot=w.reduce((a,x)=>a+x.length+2,0);let t=ln.start;
  const words=w.map(x=>{const d=(ln.end-ln.start)*(x.length+2)/tot;const o={w:x.toUpperCase(),s:t,e:t+d};t+=d;return o;});
  let ch=[];words.forEach(o=>{const len=ch.reduce((a,x)=>a+x.w.length+1,0);if(ch.length>=3||len+o.w.length>15){CAP.push(ch);ch=[];}ch.push(o);});if(ch.length)CAP.push(ch);});
function captions(t){const ch=CAP.find(c=>t>=c[0].s-.02&&t<c[c.length-1].e+.08);if(!ch)return;
  const size=78;const widths=ch.map(o=>o.w.length*size*.8+30);const tw=widths.reduce((a,b)=>a+b,0)+(ch.length-1)*22;let x=540-tw/2;
  ch.forEach((o,k)=>{const cur=t>=o.s&&t<o.e+(k===ch.length-1?.08:0);const w=widths[k];const pk=cur?1+.08*(1-eo(P(t,o.s,.12))):1;
    g(`transform="translate(${x+w/2},1430) scale(${pk}) translate(${-(x+w/2)},-1430)"`,()=>{if(cur)add(`<rect x="${x}" y="1374" width="${w}" height="96" rx="16" fill="#fff" filter="url(#glow)"/>`);
      add(`<text x="${x+w/2}" y="1456" font-size="${size}" font-weight="900" letter-spacing="1.5" text-anchor="middle" fill="${cur?'#000':'#fff'}" stroke="${cur?'none':'#000'}" stroke-width="6" paint-order="stroke">${o.w}</text>`);});x+=w+22;});}

/* ---------- game-screen props (top panel) ---------- */
function pix(x,y,map,sz,op=1){let d='';map.forEach((row,r)=>[...row].forEach((c,k)=>{if(c==='#')d+=`<rect x="${x+k*sz}" y="${y+r*sz}" width="${sz-2}" height="${sz-2}"/>`;}));add(`<g fill="#fff" opacity="${op}" filter="url(#glowS)">${d}</g>`);}
const BOSS=['..####..','.######.','##.##.##','########','#.####.#','#.#..#.#','..#..#..'];
const HERO=['.##.','.##.','####','.##.','#..#'];
function bigText(x,y,txt,size,op=1){add(`<text x="${x}" y="${y}" font-size="${size}" font-weight="900" letter-spacing="${size*.08}" text-anchor="middle" fill="#fff" fill-opacity="${op}" filter="url(#glowL)">${txt}</text>`);}
function hpBar(x,y,w,v,lab){label(x,y-14,lab,{size:14,op:.7,anchor:'start',weight:800});add(`<rect x="${x}" y="${y}" width="${w}" height="18" rx="4" fill="none" stroke="#fff" stroke-width="2.5"/><rect x="${x+3}" y="${y+3}" width="${Math.max(0,(w-6)*v)}" height="12" rx="2" fill="#fff"/>`);}
function confetti(x,y,t0){const p=P(T,t0,1.2);if(p<=0||p>=1)return;for(let k=0;k<18;k++){const a=k*.35+1,r=40+260*eo(p);add(`<rect x="${x+r*Math.cos(a)}" y="${y+r*Math.sin(a)*.7+200*p*p}" width="10" height="10" fill="#fff" opacity="${1-p}" transform="rotate(${k*40+p*300},${x+r*Math.cos(a)},${y+r*Math.sin(a)*.7})"/>`);}}
/* ---------- real-life props (bottom panel) ---------- */
function couch(x,g,s=1){add(`<g filter="url(#glowS)" stroke="#fff" stroke-width="4" fill="#0b0b0b"><rect x="${x-190*s}" y="${g-150*s}" width="${380*s}" height="${90*s}" rx="18"/><rect x="${x-220*s}" y="${g-90*s}" width="${440*s}" height="${70*s}" rx="16"/><rect x="${x-240*s}" y="${g-130*s}" width="${50*s}" height="${110*s}" rx="16"/><rect x="${x+190*s}" y="${g-130*s}" width="${50*s}" height="${110*s}" rx="16"/></g>`);}
function gamer(x,g,{lean=0,arms='play',op=1}={}){couch(x,g);const a=arms==='up'?[44,-88]:[56,-14+lean*10];const a2=arms==='up'?[-44,-88]:[-30,-14+lean*10];
  person(x-10+lean*12,g-110,.85,{ring:false,arm:a,arm2:a2,op});add(`<rect x="${x-245}" y="${g-80}" width="490" height="62" rx="16" fill="#0b0b0b" stroke="#fff" stroke-width="4" filter="url(#glowS)"/>`);
  if(arms!=='up')icon('game',x+20+lean*12,g-195+lean*8,.6);}
function desk(x,g){add(`<g filter="url(#glowS)" stroke="#fff" stroke-width="4" fill="#0b0b0b"><rect x="${x-170}" y="${g-150}" width="340" height="20" rx="6"/><line x1="${x-150}" y1="${g-130}" x2="${x-150}" y2="${g}"/><line x1="${x+150}" y1="${g-130}" x2="${x+150}" y2="${g}"/><path d="M${x-80},${g-150} L${x-70},${g-260} L${x+70},${g-260} L${x+80},${g-150} Z"/></g><path d="M${x-62},${g-165} L${x-55},${g-248} L${x+55},${g-248} L${x+62},${g-165} Z" fill="#fff" fill-opacity=".22"/>`);}
function building(x,g,lvl,op=1){add(`<g opacity="${op}" filter="url(#glowS)" stroke="#fff" stroke-width="4" fill="#0b0b0b">`);
  if(lvl===1)add(`<rect x="${x-60}" y="${g-90}" width="120" height="90" rx="6"/><path d="M${x-75},${g-90} L${x},${g-140} L${x+75},${g-90} Z"/>`);
  else if(lvl===2)add(`<rect x="${x-110}" y="${g-170}" width="220" height="170" rx="6"/><rect x="${x-120}" y="${g-200}" width="240" height="34" rx="6"/>`);
  else add(`<rect x="${x-90}" y="${g-360}" width="180" height="360" rx="6"/><rect x="${x+90}" y="${g-220}" width="110" height="220" rx="6"/>`);
  add('</g>');const rows=lvl===1?1:(lvl===2?3:8),cols=lvl===3?3:(lvl===2?4:2);const w0=lvl===3?180:(lvl===2?220:120),h0=lvl===3?360:(lvl===2?170:90);
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)add(`<rect x="${x-w0/2+16+c*((w0-32)/cols)}" y="${g-h0+20+r*((h0-30)/rows)}" width="${(w0-32)/cols-10}" height="${(h0-30)/rows-12}" rx="2" fill="#fff" fill-opacity="${.25+.5*((r*cols+c)*7%5)/5*op}"/>`);}
function levelUp(x,y,t0,txt='LEVEL UP!'){const p=P(T,t0,.9);if(p<=0||p>=1)return;add(`<g opacity="${1-p*p}">`);bigText(x,y-80*eo(p),txt,56);add('</g>');ring(x,y-40,t0,{r0:40,r1:240,d:.6});}

/* ---------- panels per segment ---------- */
function topPanel(seg,t,k){const cx=540;
  if(seg===0||seg===14&&t>resetAt){pix(cx-120,500,BOSS,30,.9);pix(cx+150,640,HERO,22);bigText(cx,450,'LEVEL UP!',64,.9+.1*Math.sin(t*8));return;}
  if(seg===1){pix(cx-120,520,BOSS,30,.5);bigText(cx,470,'?',110);return;}
  if(seg===2){const d=P(t,k,.25),q=P(t,k+1.0,.2);if(t<k+1.0)bigText(cx,600,'DEFEAT',110,d);else{bigText(cx,560,'SEARCHING FOR MATCH',38);spinner(cx,640,22);}
    label(cx,760,`MATCHES PLAYED: ${247+(t>k+1.0?1:0)}`,{size:20,op:.7});return;}
  if(seg===3){const n=Math.min(50,1+Math.floor(P(t,k,1.7)*49));pix(cx-260,470,BOSS,30);pix(cx+170,640,HERO,20,(Math.sin(t*20)>0||t%0.5<.25)?1:.4);
    bigText(cx+150,560,'YOU DIED',52,.9);label(cx,790,`ATTEMPT ${n} / 50`,{size:26,op:.9,weight:800});for(let j=0;j<6;j++)cue('tick',k+j*.28,.3);return;}
  if(seg===4){const hp=1-eio(P(t,k+.1,1.1));pix(cx-260,470,BOSS,30,hp>0?1:.25);hpBar(cx-260,420,240,hp,'BOSS');pix(cx+170,640,HERO,20);
    if(hp<=0){bigText(cx,560,'VICTORY!',90);confetti(cx,560,k+1.25);}cue('win',k+1.25,.7);return;}
  if(seg===5){const hrs=Math.round(1200+eio(P(t,k,2))*47);add(`<circle cx="900" cy="440" r="40" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>`);icon('moon',900,440,.8,.6);
    bigText(cx,560,`${hrs.toLocaleString('en-GB')} HOURS`,84);label(cx,640,'JUST TO GET 1 LEVEL BETTER',{size:20,op:.75});levelUp(cx,760,k+1.4,'LVL 41 → 42');return;}
  if(seg===6){add(`<g opacity="${1-P(t,k+.9,.3)*.6}">`);bigText(cx,540,'LUCK',100,.85);add('</g>');strike(cx-160,cx+160,505,P(t,k+.6,.3));
    const st=back(P(t,l(6)+1,.35));if(st>0)g(`transform="translate(${cx},660) rotate(-8) scale(${st}) translate(${-cx},-660)"`,()=>{add(`<rect x="${cx-290}" y="600" width="580" height="120" rx="16" fill="none" stroke="#fff" stroke-width="8" filter="url(#glow)"/>`);bigText(cx,690,'DISCIPLINE',84);});
    cue('nope',k+.6,.4);cue('impact',l(6)+1,.45);return;}
  if(seg===7){pix(cx-120,500,BOSS,30,.6);bigText(cx,450,'SAME HOURS',64);drawPath(`M${cx},700 L${cx},860`,eo(P(t,k+.6,.6)),{sw:6,dash:'14 10',glow:'glowS'});return;}
  if(seg===8){pix(cx-120,500,BOSS,30,.5);bigText(cx,460,'ROUND LOST',72);cross(cx,640,1.6,.9,P(t,k+.3,.25));return;}
  if(seg===9){const p=P(t,k+.3,.8);pix(cx-30,560-120*p,HERO,24,1-p);if(t>k+1.2){pix(cx-30,560,HERO,24,P(t,k+1.2,.3));ring(cx+20,600,k+1.2,{r0:30,r1:200});}bigText(cx,460,'RESPAWN',72);return;}
  if(seg===10){const lv=t<l(10)+.75?1:(t<l(10)+1.55?10:50);bigText(cx,560,'LVL '+lv,110);[0,.8,1.6].forEach(o=>levelUp(cx,700,l(10)+o,'+XP'));return;}
  if(seg===11){bigText(cx,500,'THE GRIND',72);hpBar(cx-300,620,600,eio(P(t,k,1.6)),'XP');return;}
  if(seg>=12&&seg<14||(seg===14&&t<=resetAt)){const dim=seg>=12?lerp(1,.35,P(t,l(12)+1,.6)):1;add(`<g opacity="${dim}">`);icon('trophy',cx,560,2);label(cx,700,'+500 XP · VIRTUAL',{size:22,op:.8,weight:800});add('</g>');return;}}
function botPanel(seg,t,k){const cx=540,G=BG;const biz=seg>=7&&!(seg===14&&t>resetAt);
  if(!biz){const arms=seg===4&&t>k+1.25?'up':'play';gamer(cx,G,{lean:seg===3?1:0,arms});if(seg===2&&t>k+.6&&t<k+1.0)scribble(cx+60,G-330);return;}
  if(seg===7){const p=P(t,k+.3,.6);g(`opacity="${1-p}"`,()=>gamer(cx,G));g(`opacity="${p}"`,()=>{desk(700,G);person(400,G,1.05,{spot:.7,arm:[80,-20]});});return;}
  desk(720,G);
  if(seg===8){person(400,G,1.05,{spot:.7,arm:[70,-30]});add(`<rect x="560" y="${G-480}" width="300" height="190" rx="14" fill="#0b0b0b" stroke="#fff" stroke-width="3" filter="url(#glowS)"/>`);label(710,G-445,'LAUNCH',{size:16,op:.6});
    polyline([[590,G-330],[650,G-370],[710,G-350],[780,G-320],[830,G-305]],P(t,k+.2,.8),{sw:4,glow:null});cross(710,G-385,1.1,.9,P(t,k+1.1,.25));label(710,G-250,'FAILED',{size:22,op:.9,weight:800});cue('nope',k+1.1,.4);return;}
  if(seg===9){const p=P(t,k+.3,.8);person(400,G-0,1.05,{spot:.7,op:t<k+1.2?1-p*.85:P(t,k+1.2,.3),arm:[70,-30]});if(t>k+1.2)ring(400,G-120,k+1.2,{r0:40,r1:220});
    icon('envelope',700,G-380,1.1);cross(700,G-380,1.2,.9,P(t,k+.2,.25));label(700,G-300,'REJECTED',{size:22,op:.9,weight:800});return;}
  if(seg===10){const lv=t<l(10)+.75?1:(t<l(10)+1.55?2:3);building(860,G,lv);person(330,G,1,{spot:.7,arm:[50,-60]});levelUp(860,G-400,l(10)+[0,.8,1.6][lv-1],'LEVEL UP!');return;}
  if(seg===11){building(860,G,3);person(330,G,1,{spot:.7});hpBar(cx-300,G-470,600,eio(P(t,k,1.6)),'BUSINESS');label(cx,G-500+0,'',{});return;}
  if(seg>=12){building(860,G,3);add(`<circle cx="700" cy="${G-260}" r="260" fill="url(#bk)" fill-opacity=".14"/>`);icon('house',640,G-320,1.1);icon('dollar',760,G-400,1.1);
    person(330,G,1.05,{spot:true,arm:[44,-88],arm2:[-44,-88]});pop(l(12)+1,580,G-500,()=>pillShape(580,G-500,'REAL REWARD',{size:20}),{snd:'win',vol:.5});}}
function scribble(x,y){add(`<path d="M${x-40},${y} q10,-22 20,0 t20,0 t20,0 t20,0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" filter="url(#glowS)"/>`);}

/* ---------- main: one full-screen scene (no split) ---------- */
const SG=1290;                                   // floor line
function tv(op=1){add(`<g opacity="${op}"><rect x="110" y="320" width="860" height="570" rx="26" fill="#070707" stroke="#fff" stroke-width="5" filter="url(#glowS)"/><rect x="470" y="890" width="140" height="40" fill="#0b0b0b" stroke="#fff" stroke-width="4"/><rect x="380" y="930" width="320" height="16" rx="8" fill="#fff" fill-opacity=".8"/>`);
  for(let y=334;y<880;y+=8)add(`<line x1="124" y1="${y}" x2="956" y2="${y}" stroke="#fff" stroke-opacity=".025" stroke-width="2"/>`);add('</g>');}
function screenBiz(vs,t,k){const cx=540;
  if(vs===7){bigText(cx,560,'SAME HOURS',84);label(cx,640,'NEW GAME: BUSINESS',{size:24,op:.8,weight:800});icon('briefcase',cx,760,1.2);return;}
  if(vs===8){add(`<rect x="300" y="420" width="480" height="300" rx="14" fill="#0b0b0b" stroke="#fff" stroke-width="3"/>`);label(cx,460,'PRODUCT LAUNCH',{size:18,op:.7});
    polyline([[340,560],[430,610],[520,590],[620,660],[740,690]],P(t,k+.2,.8),{sw:5,glow:null});cross(cx,600,1.4,.95,P(t,k+1.1,.25));label(cx,780,'FAILED',{size:28,op:.95,weight:900});
    pop(k+1.3,cx,840,()=>pillShape(cx,840,'= JUST A LOST ROUND',{size:20,dark:true}),{vol:.4});cue('nope',k+1.1,.4);return;}
  if(vs===9){icon('envelope',cx,520,1.6);cross(cx,520,1.6,.9,P(t,k+.2,.25));label(cx,630,'REJECTED',{size:30,op:.95,weight:900});pop(k+1.1,cx,760,()=>bigText(cx,780,'RESPAWN',80),{snd:'pop',vol:.5});return;}
  if(vs===10){const lv=t<l(10)+.75?1:(t<l(10)+1.55?2:3);building(cx,840,lv);bigText(cx,430,'LVL '+[1,10,50][lv-1],80);levelUp(cx,600,l(10)+[0,.8,1.6][lv-1]);return;}
  if(vs===11){bigText(cx,520,'THE GRIND',84);hpBar(cx-320,640,640,eio(P(t,k,1.6)),'BUSINESS XP');label(cx,760,'IS EXACTLY THE SAME',{size:24,op:.8,weight:800});return;}}
function stage(vs,t,k,reset){const cx=540;
  // the screen: game first, business after "same hours", gone when the reward becomes real
  const tvOp=vs>=12&&!reset?1-P(t,l(12)+.6,.6):1;
  if(tvOp>0){tv(tvOp);add(`<g opacity="${tvOp}">`);if(vs<7||reset)topPanel(reset?0:vs,t,k);else if(vs<12)screenBiz(vs,t,k);else{icon('trophy',cx,580,2);label(cx,720,'+500 XP · VIRTUAL',{size:22,op:.8,weight:800});}add('</g>');}
  ground(SG,1,{op:.45});
  // the person: gamer on the couch -> grinder at a desk
  if(vs<7||reset){const arms=vs===4&&t>k+1.25?'up':'play';gamer(cx,SG,{lean:vs===3?1:0,arms});if(vs===2&&t>k+.6&&t<k+1.0)scribble(cx+60,SG-330);return;}
  if(vs===7){const p=P(t,k+.3,.7);g(`opacity="${1-p}"`,()=>gamer(cx,SG));g(`opacity="${p}"`,()=>{deskS(780,SG);person(lerp(540,330,eio(p)),SG,1.05,{spot:.7,arm:[60,-40]});});return;}
  if(vs<12){deskS(780,SG);if(vs===9){const p=P(t,k+.3,.8);person(330,SG,1.05,{spot:.7,op:t<k+1.2?1-p*.85:P(t,k+1.2,.3),arm:[70,-30]});if(t>k+1.2)ring(330,SG-120,k+1.2,{r0:40,r1:220});}
    else person(330,SG,1.05,{spot:.7,arm:vs===10?[50,-70]:[70,-30]});return;}
  // the real reward
  const r=P(t,l(12)+.8,.6);if(r>0){add(`<circle cx="${cx}" cy="640" r="${330*r}" fill="url(#bk)" fill-opacity=".16"/>`);g(`opacity="${r}"`,()=>{icon('house',cx-120,640,2.2);icon('dollar',cx+170,560,1.5);icon('briefcase',cx+150,760,1.1);});
    pop(l(12)+1,cx,880,()=>pillShape(cx,880,'REAL REWARD',{size:24}),{snd:'win',vol:.5});}
  person(cx,SG,1.1,{spot:true,arm:[44,-88],arm2:[-44,-88]});}
function deskS(x,g){add(`<g filter="url(#glowS)" stroke="#fff" stroke-width="4" fill="#0b0b0b"><rect x="${x-150}" y="${g-140}" width="300" height="20" rx="6"/><line x1="${x-130}" y1="${g-120}" x2="${x-130}" y2="${g}"/><line x1="${x+130}" y1="${g-120}" x2="${x+130}" y2="${g}"/><path d="M${x-70},${g-140} L${x-62},${g-230} L${x+62},${g-230} L${x+70},${g-140} Z"/></g><path d="M${x-54},${g-155} L${x-48},${g-218} L${x+48},${g-218} L${x+54},${g-155} Z" fill="#fff" fill-opacity=".22"/>`);}

S.push({s:0,e:END+1,cam:{zoom:0},draw:()=>{
  const t=T,seg=segAt(t),k=SEG[seg];const reset=seg===14&&t>resetAt;const vs=reset?0:seg;
  const punch=1+.04*(1-eo(P(t,k,.35)));
  add(`<circle cx="540" cy="620" r="460" fill="url(#bk)" fill-opacity=".06"/>`);
  g(`transform="translate(540,800) scale(${punch}) translate(-540,-800)"`,()=>stage(vs,t,k,reset));
  // HUD
  const lvl=vs<7?(vs<5?41:42):(vs>=10?(t<l(10)+.75?1:(t<l(10)+1.55?10:50)):1);
  add(`<rect x="40" y="130" width="170" height="100" rx="18" fill="#f4f4f4" filter="url(#glow)"/>`);label(125,170,'LVL',{size:20,op:1,fill:'#000',weight:900});label(125,215,String(reset?41:lvl),{size:44,op:1,fill:'#000',weight:900,sp:0});
  const xp=reset?.82:(vs<5?.82+.1*P(t,0,10):(vs<7?P(t,SEG[5]+1.4,.5)*.2:(vs>=10?((t-l(10))%0.8)/0.8:.1+.05*vs)));
  label(250,155,vs>=7&&!reset?'BUSINESS XP':'XP',{size:18,op:.8,anchor:'start',weight:800});add(`<rect x="250" y="172" width="780" height="34" rx="17" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="2.5"/><rect x="256" y="178" width="${Math.max(22,768*xp)}" height="22" rx="11" fill="#fff" filter="url(#glowS)"/>`);
  label(1040,58,'THE NEXT VERSION',{size:16,op:.45,anchor:'end',weight:800});
  // hook band (first frame + loop end)
  const hb=t<le(0)+.1?1:(t>END-.3?P(t,END-.3,.15):0);
  if(hb>0){add(`<g opacity="${hb}"><rect x="0" y="1335" width="1080" height="190" fill="#fff" filter="url(#glow)"/><text x="540" y="1455" font-size="70" font-weight="900" letter-spacing="1" text-anchor="middle" fill="#000">GAMERS HAVE THE SECRET</text></g>`);}
  else captions(t);
  const fl=1-P(t,k,.12);if(seg>0&&fl>0&&!reset)add(`<rect width="${W}" height="${H}" fill="#fff" opacity="${fl*.12}"/>`);
  if(seg>0)cue('whoosh',k,.4);cue('hit',0,.7);for(let j=0;j<4;j++)cue('pop',.1+j*.12,.3);
}});
