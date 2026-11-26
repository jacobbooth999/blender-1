/* ============ "27,000 DAYS" — vertical, ~28.5 s, loops ============ */
const S=[];
const l=i=>L[i].s, le=i=>L[i].e;
const SG=1290, NL=TIMING.lines.length;
const SEG=[0];for(let i=1;i<NL;i++)SEG.push(l(i)-.1);SEG.push(END);
function segAt(t){for(let i=SEG.length-2;i>=0;i--)if(t>=SEG[i])return i;return 0;}
const resetAt=l(NL-1)+.4;

/* ---------- word captions ---------- */
const CAP=[];TIMING.lines.forEach((ln,i)=>{if(i<1)return;const w=ln.text.replace(/twenty seven thousand/i,'27,000').replace(/eighteen thousand/i,'18,000').replace(/fifteen/ig,'15').replace('The, I','The "I').replace('tomorrow.','tomorrow."').split(' ');const tot=w.reduce((a,x)=>a+x.length+2,0);let t=ln.start;
  const words=w.map(x=>{const d=(ln.end-ln.start)*(x.length+2)/tot;const o={w:x.toUpperCase(),s:t,e:t+d};t+=d;return o;});
  let ch=[];words.forEach(o=>{const len=ch.reduce((a,x)=>a+x.w.length+1,0);if(ch.length>=3||len+o.w.length>15){CAP.push(ch);ch=[];}ch.push(o);});if(ch.length)CAP.push(ch);});
function captions(t){const ch=CAP.find(c=>t>=c[0].s-.02&&t<c[c.length-1].e+.08);if(!ch)return;const size=78,Y=1430;
  const widths=ch.map(o=>o.w.length*size*.8+30);const tw=widths.reduce((a,b)=>a+b,0)+(ch.length-1)*22;let x=540-tw/2;
  ch.forEach((o,k)=>{const cur=t>=o.s&&t<o.e+(k===ch.length-1?.08:0);const w=widths[k];const pk=cur?1+.08*(1-eo(P(t,o.s,.12))):1;
    g(`transform="translate(${x+w/2},${Y}) scale(${pk}) translate(${-(x+w/2)},${-Y})"`,()=>{if(cur)add(`<rect x="${x}" y="${Y-56}" width="${w}" height="96" rx="16" fill="#fff" filter="url(#glow)"/>`);
      add(`<text x="${x+w/2}" y="${Y+26}" font-size="${size}" font-weight="900" letter-spacing="1.5" text-anchor="middle" fill="${cur?'#000':'#fff'}" stroke="${cur?'none':'#000'}" stroke-width="6" paint-order="stroke">${o.w}</text>`);});x+=w+22;});}
function bigText(x,y,txt,size,op=1){add(`<text x="${x}" y="${y}" font-size="${size}" font-weight="900" letter-spacing="${size*.06}" text-anchor="middle" fill="#fff" fill-opacity="${op}" filter="url(#glowL)">${txt}</text>`);}
const AMB='#FFB547';
/* ---------- the life grid: every dot is a day ---------- */
const GX0=110,GX1=970,GY0=440,GY1=1180,GW=GX1-GX0,GH=GY1-GY0;
const gyAt=f=>GY0+GH*f;
function gridDefs(){add(`<defs><pattern id="dp" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="2.4" fill="#fff"/></pattern><pattern id="da" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="3" fill="${AMB}"/></pattern></defs>`);}
function grid(reveal=1,op=.85){gridDefs();add(`<rect x="${GX0-14}" y="${GY0-14}" width="${GW+28}" height="${GH+28}" rx="18" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>`);
  add(`<rect x="${GX0}" y="${GY0}" width="${GW}" height="${GH*clamp(reveal)}" fill="url(#dp)" opacity="${op}"/>`);}
function eat(f0,f1,p,ic,txt){if(p<=0)return;const y0=gyAt(f0),y1=gyAt(f1);const h=(y1-y0)*eo(clamp(p));
  add(`<rect x="${GX0-2}" y="${y1-h}" width="${GW+4}" height="${h}" fill="#000" opacity=".9"/><line x1="${GX0}" y1="${y1-h}" x2="${GX1}" y2="${y1-h}" stroke="#ff6b5a" stroke-width="3" opacity="${p<1?1:0}"/>`);
  if(p>.3&&txt){const o=clamp((p-.3)/.3);icon(ic,320,(y0+y1)/2,1.1,o);label(560,(y0+y1)/2+14,txt,{size:40,op:o,weight:900,sp:.12,anchor:'middle'});}}
function counter(n,y,size,op=1,sub='DAYS'){const txt=typeof n==='number'?Math.round(n).toLocaleString('en-US'):n;add(`<rect x="160" y="${y-size*.95}" width="760" height="${size*1.25}" rx="26" fill="#000" opacity="${.78*op}"/>`);
  add(`<text x="540" y="${y}" font-size="${size}" font-weight="900" text-anchor="middle" fill="#fff" fill-opacity="${op}" letter-spacing="4" filter="url(#glowL)">${txt}</text>`);if(sub)label(540,y+size*.42,sub,{size:size*.2,op:op*.85,weight:900,sp:.3});}
function couch(x,g,s=1){add(`<g filter="url(#glowS)" stroke="#fff" stroke-width="5" fill="#0b0b0b"><rect x="${x-170*s}" y="${g-80*s}" width="${340*s}" height="70" rx="16"/><rect x="${x-170*s}" y="${g-170*s}" width="${340*s}" height="95" rx="20"/><rect x="${x-200*s}" y="${g-120*s}" width="45" height="110" rx="14"/><rect x="${x+155*s}" y="${g-120*s}" width="45" height="110" rx="14"/></g>`);}

/* ---------- hook: the count slams to 27,000 ---------- */
function hookScene(t,frozen){const tt=frozen?0:t;const c=eo(P(tt,.05,1.25));grid(c);for(let j=0;j<12;j++)cue('tick',.06+j*.1,.35);
  const sz=lerp(230,200,P(tt,1.3,.4));const sl=1+.25*(1-eo(P(tt,1.3,.25)))*(tt>1.3?1:0);
  g(`transform="translate(540,800) scale(${tt>=1.3?sl:1}) translate(-540,-800)"`,()=>counter(27000*c,820,sz,1,tt>1.3?'DAYS':''));}

/* ---------- segments ---------- */
function stage(vs,t,k,reset){const cx=540;
  if(vs===0||reset){hookScene(reset?0:t,reset);return;}
  if(vs===10){vs=9;k=SEG[9];}
  if(vs===1){// that's it — the whole grid, one dot glowing: TODAY
    grid(1);const pu=1+.4*Math.sin(t*6);add(`<circle cx="${GX0+5}" cy="${GY0+5}" r="${14*pu}" fill="${AMB}" opacity=".5" filter="url(#glow)"/><circle cx="${GX0+5}" cy="${GY0+5}" r="5" fill="${AMB}"/>`);
    counter(27000,330,110,1);pop(k+.1,cx,400,()=>{},{snd:'thud',vol:.6});return;}
  if(vs===2){// sleep takes a third
    grid(1);const p=P(t,k+.3,1.1);eat(.667,1,p,'moon','SLEEP');counter(lerp(27000,18000,eo(p)),330,110);return;}
  if(vs===3){// scrolling, waiting, "tomorrow"
    grid(1);eat(.667,1,1,'moon','SLEEP');    eat(.5,.667,P(t,k+.5,.5),'phone','SCROLLING');eat(.34,.5,P(t,k+1.35,.5),'hourglass','WAITING');eat(.18,.34,P(t,k+2.2,.5),'calendar','"TOMORROW"');
    counter(t<k+.6?18000:'???',330,110,1,'DAYS LEFT?');[.5,1.35,2.2].forEach(d=>cue('nope',k+d,.5));return;}
  if(vs===4){// wasted, one day at a time — dots drain out onto the floor
    grid(1);eat(.18,1,1,'x','');const top=gyAt(.18);for(let j=0;j<40;j++){const u=((t-k)*.6+j/40)%1;const x=GX0+((j*137)%GW);add(`<circle cx="${x}" cy="${lerp(top-20,1270,u*u)}" r="3" fill="#fff" opacity="${1-u}"/>`);}
    couch(cx,1290,1);person(cx-40,1290-75,1,{ring:false,arm:[60,-40],arm2:[-40,40]});add(`<rect x="${cx+10}" y="${1290-215}" width="22" height="38" rx="5" fill="#0b0b0b" stroke="#fff" stroke-width="3"/>`);
    add(`<rect x="0" y="${top+30}" width="1080" height="180" fill="#000" opacity=".0"/>`);bigText(cx,gyAt(.62),'WASTED.',140,P(t,k+1.9,.3));label(cx,gyAt(.62)+80,'ONE DAY AT A TIME',{size:34,op:P(t,k+2.6,.3),weight:900,sp:.2});cue('hit',k+1.9,.6);
    counter('???',330,110,1,'DAYS LEFT');return;}
  if(vs===5){// one focused hour a day = 15 full days a year
    const p=eo(P(t,k+.2,.8));const ccx=cx,ccy=640,r=200;add(`<circle cx="${ccx}" cy="${ccy}" r="${r}" fill="#0b0b0b" stroke="#fff" stroke-width="8" filter="url(#glowS)"/>`);
    const a=p*Math.PI/6;add(`<path d="M${ccx},${ccy} L${ccx},${ccy-r+12} A${r-12},${r-12} 0 0 1 ${ccx+Math.sin(a)*(r-12)},${ccy-Math.cos(a)*(r-12)} Z" fill="${AMB}" filter="url(#glowS)"/>`);
    for(let j=0;j<12;j++){const b=j*Math.PI/6;add(`<line x1="${ccx+Math.sin(b)*(r-30)}" y1="${ccy-Math.cos(b)*(r-30)}" x2="${ccx+Math.sin(b)*(r-12)}" y2="${ccy-Math.cos(b)*(r-12)}" stroke="#fff" stroke-width="5"/>`);}
    label(ccx,ccy+r+70,'1 HOUR A DAY',{size:44,op:1,weight:900,sp:.12});
    for(let j=0;j<15;j++){const pp=back(P(t,k+1.6+j*.08,.25));if(pp<=0)continue;const x=230+(j%5)*155,y=1040+Math.floor(j/5)*95;g(`transform="translate(${x},${y}) scale(${pp}) translate(${-x},${-y})"`,()=>{add(`<rect x="${x-62}" y="${y-38}" width="124" height="76" rx="12" fill="${AMB}" opacity=".9" filter="url(#glowS)"/>`);label(x,y+12,String(j+1),{size:30,op:1,weight:900,fill:'#000',sp:0});});cue('pop',k+1.6+j*.08,.2);}
    if(t>k+2.9)bigText(cx,350,'= 15 DAYS / YEAR',84,P(t,k+2.9,.3));return;}
  if(vs===6){// what 15 days can build
    [['brain','A SKILL',.55],['dumbbell','YOUR BODY',1.35],['seed','SOMETHING NEW',2.2]].forEach(([ic,tx,d],j)=>{const y=470+j*270;pop(k+d,cx,y,()=>{box(170,y-110,740,220,{r:30,op:.95});icon(ic,320,y,1.5);label(640,y+14,tx,{size:44,op:1,weight:900,sp:.1});},{snd:'pop',vol:.5});});
    label(cx,340,'15 DAYS TO BUILD',{size:40,op:P(t,k+.1,.3),weight:900,sp:.15,fill:AMB});return;}
  if(vs===7){// you can't add more days
    grid(1,.6);add(`<g transform="translate(540,800)"><rect x="-80" y="-30" width="160" height="130" rx="18" fill="#0b0b0b" stroke="#fff" stroke-width="7" filter="url(#glowS)"/><path d="M-50,-30 L-50,-80 A50,50 0 0 1 50,-80 L50,-30" fill="none" stroke="#fff" stroke-width="10"/></g>`);
    const u=P(t,k+.3,.7);const bx=lerp(1120,990,eo(Math.min(u,1)))+(u>=1?Math.sin((t-k)*30)*6*(1-P(t,k+1,.4)):0);add(`<circle cx="${bx}" cy="560" r="34" fill="${AMB}" filter="url(#glow)"/>`);label(bx,574,'+1',{size:30,op:1,weight:900,fill:'#000',sp:0});
    if(u>=1)cross(1000,470,.8,.9,P(t,k+1.0,.25));cue('nope',k+1.0,.6);return;}
  if(vs===8){// add more life to your days — the grid turns gold
    grid(1,.5);gridDefs();const p=eo(P(t,k+.2,1.6));add(`<rect x="${GX0}" y="${GY1-GH*p}" width="${GW}" height="${GH*p}" fill="url(#da)" filter="url(#glowS)"/>`);
    bigText(cx,340,'MORE LIFE',110,P(t,k+.9,.3));cue('rise',k+.2,.5);return;}
  if(vs===9){// today is one of them — one dot becomes the sun; USE IT.
    const p=eio(P(t,k,.9));const r=lerp(6,190,p);const yy=lerp(GY0+5,620,p),xx=lerp(GX0+5,cx,p);if(p<1)grid(1,.5*(1-p));
    add(`<circle cx="${xx}" cy="${yy}" r="${r*1.8}" fill="${AMB}" opacity="${.25*p}" filter="url(#glowL)"/><circle cx="${xx}" cy="${yy}" r="${r}" fill="${AMB}" filter="url(#glow)"/>`);
    if(p>.6)label(cx,642,'TODAY',{size:64,op:clamp((p-.6)/.4),weight:900,fill:'#000',sp:.14});
    ground(SG,1,{op:.5});person(cx,SG,1.2,{spot:true,ring:false,arm:[44,-86],arm2:[-44,-86]});
    if(t>k+1.3){const pp=back(P(t,k+1.3,.3));g(`transform="translate(540,940) scale(${pp}) translate(-540,-940)"`,()=>bigText(cx,975,'USE IT.',130));cue('impact',k+1.3,.8);}
    return;}
}

/* ---------- main ---------- */
S.push({s:0,e:END+1,cam:{zoom:0},draw:()=>{
  const t=T,seg=segAt(t),k=SEG[seg];const reset=seg===NL-1&&t>resetAt;const vs=reset?0:seg;
  const punch=1+.04*(1-eo(P(t,k,.35)));const sh=P(t,1.3,.35),am=sh>0&&sh<1?(1-sh)*24:0;
  add(`<circle cx="540" cy="700" r="480" fill="url(#bk)" fill-opacity=".05"/>`);
  g(`transform="translate(${540+Math.sin(t*90)*am},${800+Math.cos(t*80)*am}) scale(${punch}) translate(-540,-800)"`,()=>stage(vs,t,k,reset));
  const so=reset?P(t,resetAt,.2):1-P(t,3.3,.3);if(so>0)add(`<g opacity="${so}"><rect x="90" y="140" width="900" height="110" rx="55" fill="#fff" filter="url(#glow)"/><text x="540" y="216" font-size="50" font-weight="900" letter-spacing="2" text-anchor="middle" fill="#000">HOW MANY DO YOU HAVE LEFT?</text></g>`);
  label(1040,58,'THE NEXT VERSION',{size:16,op:.45,anchor:'end',weight:800});
  const hb=t<le(0)+.1?1:(reset?P(t,resetAt,.15):0);
  if(hb>0){add(`<g opacity="${hb}"><rect x="0" y="1335" width="1080" height="190" fill="#fff" filter="url(#glow)"/><text x="540" y="1458" font-size="74" font-weight="900" letter-spacing="1" text-anchor="middle" fill="#000">YOUR WHOLE LIFE.</text></g>`);}
  else captions(t);
  const fl=1-P(t,k,.12);if(seg>0&&fl>0&&!reset)add(`<rect width="${W}" height="${H}" fill="#fff" opacity="${fl*.12}"/>`);
  if(t>1.3&&t<1.45)add(`<rect width="${W}" height="${H}" fill="#fff" opacity="${(1-P(t,1.3,.15))*.4}"/>`);
  if(seg>0)cue('whoosh',k,.4);cue('impact',1.31,.9);cue('thunk',1.3,.8);cue('whoosh',resetAt,.4);
}});
