/* ============ LIBRARY — landscape long-form helpers ============ */
const S=[];
const CX=1130, G=870, FX=330;          // stage centre (right of the figure), ground line, figure x
const at=(i,o=0)=>L[i].s+o, atE=(i,o=0)=>L[i].e+o;
const BK=[[260,240,170,.05],[1680,820,210,.045],[1500,180,110,.04],[180,900,140,.035]];

/* ---------- small primitives ---------- */
function check(x,y,s=1,op=1){add(`<g filter="url(#glowS)" opacity="${op}"><circle cx="${x}" cy="${y}" r="${18*s}" fill="#f4f4f4"/><path d="M${x-8*s},${y} l${6*s},${6*s} l${10*s},${-12*s}" stroke="#0a0a0a" stroke-width="${4*s}" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`);}
function personOutline(x,gy,s=1,op=1){const bw=32*s,bh=78*s,r=30*s;
  add(`<g opacity="${op}" filter="url(#glow)" fill="none" stroke="#fff" stroke-width="3.5" stroke-dasharray="9 7"><path d="M${x-bw},${gy} L${x-bw},${gy-bh+r} Q${x-bw},${gy-bh} ${x-bw+r},${gy-bh} L${x+bw-r},${gy-bh} Q${x+bw},${gy-bh} ${x+bw},${gy-bh+r} L${x+bw},${gy}"/><circle cx="${x}" cy="${gy-bh-34*s}" r="${25*s}"/></g>`);}
function strike(x1,x2,y,p){if(p>0)add(`<line x1="${x1}" y1="${y}" x2="${lerp(x1,x2,eo(Math.min(1,p)))}" y2="${y}" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`);}
function spinner(x,y,r=14,op=.8){const a=T*6;add(`<path d="M${x+r*Math.cos(a)},${y+r*Math.sin(a)} A${r},${r} 0 1 1 ${x+r*Math.cos(a+4.4)},${y+r*Math.sin(a+4.4)}" stroke="#fff" stroke-opacity="${op}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`);}
function zzz(x,y,op=.7){[0,1,2].forEach(i=>{const ph=((T*.8+i/3)%1);add(`<text x="${x+i*16+ph*10}" y="${y-i*26-ph*20}" font-size="${22+i*6}" font-weight="800" fill="#fff" fill-opacity="${op*Math.sin(ph*Math.PI)}">Z</text>`);});}
function bubble(x,y,w,txt,{size=18,dark=true,tail='left'}={}){const tx=tail==='left'?x-w/2+30:x+w/2-30,d=tail==='left'?1:-1;
  add(`<g filter="url(#glowS)" fill="#0b0b0b" stroke="#fff" stroke-width="3"><circle cx="${tx-d*18}" cy="${y+66}" r="7"/><circle cx="${tx}" cy="${y+44}" r="10"/><rect x="${x-w/2}" y="${y-40}" width="${w}" height="76" rx="38"/></g>`);label(x,y+5,txt,{size,op:.92,weight:800,sp:.14});}
function ring(x,y,t0,{r0=60,r1=260,d=.8,op=.6}={}){const p=P(T,t0,d);if(p>0&&p<1)add(`<circle cx="${x}" cy="${y}" r="${r0+(r1-r0)*eo(p)}" fill="none" stroke="#fff" stroke-opacity="${op*(1-p)}" stroke-width="3" filter="url(#glowS)"/>`);}
function arrowR(x1,y,x2,p,op=.7){if(p<=0)return;const x=lerp(x1,x2,eo(p));add(`<line x1="${x1}" y1="${y}" x2="${x}" y2="${y}" stroke="#fff" stroke-opacity="${op}" stroke-width="4" stroke-dasharray="10 9"/>`);if(p>.9)add(`<path d="M${x-16},${y-14} L${x},${y} L${x-16},${y+14}" stroke="#fff" stroke-opacity="${op}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);}
function xTile(x,y,s=60,op=.9){add(`<g opacity="${op}"><rect x="${x-s/2}" y="${y-s/2}" width="${s}" height="${s}" rx="${s*.18}" fill="#0b0b0b" stroke="#fff" stroke-width="3" filter="url(#glowS)"/></g>`);cross(x,y,s/80,op,1);}

/* ---------- icons (≈ ±40 units at s=1) ---------- */
function icon(n,x,y,s=1,op=1){const k=s;let d='';const st=`stroke="#fff" stroke-width="${4*k}" fill="#0b0b0b" stroke-linecap="round" stroke-linejoin="round"`;
  switch(n){
  case 'dumbbell':d=`<line x1="${x-30*k}" y1="${y}" x2="${x+30*k}" y2="${y}"/><rect x="${x-42*k}" y="${y-22*k}" width="${13*k}" height="${44*k}" rx="${4*k}"/><rect x="${x+29*k}" y="${y-22*k}" width="${13*k}" height="${44*k}" rx="${4*k}"/><rect x="${x-53*k}" y="${y-13*k}" width="${11*k}" height="${26*k}" rx="${4*k}"/><rect x="${x+42*k}" y="${y-13*k}" width="${11*k}" height="${26*k}" rx="${4*k}"/>`;break;
  case 'book':d=`<path d="M${x},${y-22*k} C ${x-14*k},${y-32*k} ${x-36*k},${y-32*k} ${x-46*k},${y-26*k} L${x-46*k},${y+28*k} C ${x-36*k},${y+22*k} ${x-14*k},${y+22*k} ${x},${y+32*k} Z"/><path d="M${x},${y-22*k} C ${x+14*k},${y-32*k} ${x+36*k},${y-32*k} ${x+46*k},${y-26*k} L${x+46*k},${y+28*k} C ${x+36*k},${y+22*k} ${x+14*k},${y+22*k} ${x},${y+32*k} Z"/>`;break;
  case 'phone':d=`<rect x="${x-24*k}" y="${y-40*k}" width="${48*k}" height="${80*k}" rx="${9*k}"/><line x1="${x-12*k}" y1="${y-22*k}" x2="${x+12*k}" y2="${y-22*k}"/><line x1="${x-12*k}" y1="${y-8*k}" x2="${x+6*k}" y2="${y-8*k}"/><line x1="${x-12*k}" y1="${y+6*k}" x2="${x+12*k}" y2="${y+6*k}"/>`;break;
  case 'dollar':d=`<circle cx="${x}" cy="${y}" r="${38*k}"/><text x="${x}" y="${y+18*k}" font-size="${52*k}" font-weight="800" fill="#fff" stroke="none" text-anchor="middle">$</text>`;break;
  case 'pound':d=`<circle cx="${x}" cy="${y}" r="${38*k}"/><text x="${x}" y="${y+18*k}" font-size="${50*k}" font-weight="800" fill="#fff" stroke="none" text-anchor="middle">£</text>`;break;
  case 'trophy':d=`<path d="M${x-26*k},${y-36*k} L${x+26*k},${y-36*k} L${x+22*k},${y} Q${x},${y+16*k} ${x-22*k},${y} Z"/><path d="M${x-26*k},${y-28*k} Q${x-46*k},${y-26*k} ${x-38*k},${y-8*k} Q${x-32*k},${y} ${x-20*k},${y-4*k}" fill="none"/><path d="M${x+26*k},${y-28*k} Q${x+46*k},${y-26*k} ${x+38*k},${y-8*k} Q${x+32*k},${y} ${x+20*k},${y-4*k}" fill="none"/><line x1="${x}" y1="${y+10*k}" x2="${x}" y2="${y+26*k}"/><rect x="${x-20*k}" y="${y+26*k}" width="${40*k}" height="${12*k}" rx="${3*k}"/>`;break;
  case 'clock':d=`<circle cx="${x}" cy="${y+4*k}" r="${34*k}"/><line x1="${x}" y1="${y+4*k}" x2="${x}" y2="${y-16*k}"/><line x1="${x}" y1="${y+4*k}" x2="${x+14*k}" y2="${y+12*k}"/><path d="M${x-34*k},${y-26*k} l${14*k},${-12*k} M${x+34*k},${y-26*k} l${-14*k},${-12*k}"/>`;break;
  case 'calendar':d=`<rect x="${x-38*k}" y="${y-32*k}" width="${76*k}" height="${70*k}" rx="${8*k}"/><line x1="${x-38*k}" y1="${y-12*k}" x2="${x+38*k}" y2="${y-12*k}"/><line x1="${x-20*k}" y1="${y-42*k}" x2="${x-20*k}" y2="${y-24*k}"/><line x1="${x+20*k}" y1="${y-42*k}" x2="${x+20*k}" y2="${y-24*k}"/>`+[0,1,2].map(i=>[0,1].map(j=>`<rect x="${x-26*k+i*20*k}" y="${y+k*(0+j*16)}" width="${10*k}" height="${8*k}" rx="${2*k}" fill="#fff" stroke="none"/>`).join('')).join('');break;
  case 'target':d=`<circle cx="${x}" cy="${y}" r="${38*k}"/><circle cx="${x}" cy="${y}" r="${24*k}"/><circle cx="${x}" cy="${y}" r="${9*k}" fill="#fff"/>`;break;
  case 'gear':{let p='';for(let i=0;i<16;i++){const a=i*Math.PI/8,r=i%2?26*k:36*k;p+=(i?'L':'M')+(x+r*Math.cos(a)).toFixed(1)+','+(y+r*Math.sin(a)).toFixed(1);}d=`<path d="${p}Z"/><circle cx="${x}" cy="${y}" r="${10*k}"/>`;break;}
  case 'bulb':d=`<path d="M${x-20*k},${y+16*k} C ${x-44*k},${y-4*k} ${x-36*k},${y-52*k} ${x},${y-54*k} C ${x+36*k},${y-52*k} ${x+44*k},${y-4*k} ${x+20*k},${y+16*k} L${x+18*k},${y+30*k} L${x-18*k},${y+30*k} Z"/><line x1="${x-14*k}" y1="${y+42*k}" x2="${x+14*k}" y2="${y+42*k}"/>`;break;
  case 'play':d=`<rect x="${x-42*k}" y="${y-30*k}" width="${84*k}" height="${60*k}" rx="${10*k}"/><path d="M${x-10*k},${y-14*k} L${x+16*k},${y} L${x-10*k},${y+14*k} Z" fill="#fff"/>`;break;
  case 'note':d=`<path d="M${x-14*k},${y+24*k} L${x-14*k},${y-30*k} L${x+24*k},${y-38*k} L${x+24*k},${y+16*k}" fill="none"/><ellipse cx="${x-24*k}" cy="${y+24*k}" rx="${11*k}" ry="${8*k}" fill="#fff"/><ellipse cx="${x+14*k}" cy="${y+16*k}" rx="${11*k}" ry="${8*k}" fill="#fff"/>`;break;
  case 'people':d=[-26,26,0].map((o,i)=>`<circle cx="${x+o*k}" cy="${y-(i==2?16:8)*k}" r="${(i==2?12:10)*k}"/><path d="M${x+o*k-(i==2?20:16)*k},${y+(i==2?32:30)*k} L${x+o*k-(i==2?20:16)*k},${y+(i==2?14:12)*k} Q${x+o*k},${y-(i==2?0:-2)*k} ${x+o*k+(i==2?20:16)*k},${y+(i==2?14:12)*k} L${x+o*k+(i==2?20:16)*k},${y+(i==2?32:30)*k}"/>`).join('');break;
  case 'star':{let p='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?17*k:40*k;p+=(i?'L':'M')+(x+r*Math.cos(a)).toFixed(1)+','+(y+r*Math.sin(a)).toFixed(1);}d=`<path d="${p}Z"/>`;break;}
  case 'moon':d=`<path d="M${x+10*k},${y-36*k} A${36*k},${36*k} 0 1 0 ${x+30*k},${y+20*k} A${28*k},${28*k} 0 1 1 ${x+10*k},${y-36*k} Z"/>`;break;
  case 'envelope':d=`<rect x="${x-40*k}" y="${y-28*k}" width="${80*k}" height="${56*k}" rx="${6*k}"/><path d="M${x-40*k},${y-26*k} L${x},${y+6*k} L${x+40*k},${y-26*k}" fill="none"/>`;break;
  case 'dice':d=`<rect x="${x-34*k}" y="${y-34*k}" width="${68*k}" height="${68*k}" rx="${12*k}"/>`+[[-14,-14],[14,14],[0,0],[14,-14],[-14,14]].map(([a,b])=>`<circle cx="${x+a*k}" cy="${y+b*k}" r="${5*k}" fill="#fff" stroke="none"/>`).join('');break;
  case 'network':{const pts=[[0,-30],[-32,14],[32,14],[0,34]];d=`<path d="M${x},${y-30*k} L${x-32*k},${y+14*k} L${x+32*k},${y+14*k} Z M${x},${y-30*k} L${x},${y+34*k} M${x-32*k},${y+14*k} L${x},${y+34*k} L${x+32*k},${y+14*k}" fill="none"/>`+pts.map(([a,b])=>`<circle cx="${x+a*k}" cy="${y+b*k}" r="${8*k}"/>`).join('');break;}
  case 'briefcase':d=`<rect x="${x-40*k}" y="${y-20*k}" width="${80*k}" height="${54*k}" rx="${8*k}"/><path d="M${x-14*k},${y-20*k} L${x-14*k},${y-32*k} L${x+14*k},${y-32*k} L${x+14*k},${y-20*k}" fill="none"/><line x1="${x-40*k}" y1="${y}" x2="${x+40*k}" y2="${y}"/>`;break;
  case 'chart':d=`<path d="M${x-38*k},${y-36*k} L${x-38*k},${y+34*k} L${x+40*k},${y+34*k}" fill="none"/><path d="M${x-28*k},${y+18*k} L${x-8*k},${y} L${x+8*k},${y+8*k} L${x+32*k},${y-24*k}" fill="none"/>`;break;
  case 'notebook':d=`<rect x="${x-32*k}" y="${y-40*k}" width="${64*k}" height="${80*k}" rx="${6*k}"/>`+[0,1,2,3].map(i=>`<line x1="${x-18*k}" y1="${y-22*k+i*16*k}" x2="${x+20*k}" y2="${y-22*k+i*16*k}"/>`).join('');break;
  case 'hourglass':d=`<line x1="${x-30*k}" y1="${y-40*k}" x2="${x+30*k}" y2="${y-40*k}"/><line x1="${x-30*k}" y1="${y+40*k}" x2="${x+30*k}" y2="${y+40*k}"/><path d="M${x-22*k},${y-40*k} Q${x-22*k},${y-8*k} ${x},${y} Q${x-22*k},${y+8*k} ${x-22*k},${y+40*k} L${x+22*k},${y+40*k} Q${x+22*k},${y+8*k} ${x},${y} Q${x+22*k},${y-8*k} ${x+22*k},${y-40*k} Z"/><path d="M${x-14*k},${y+36*k} L${x+14*k},${y+36*k} L${x},${y+18*k} Z" fill="#fff"/>`;break;
  case 'house':d=`<path d="M${x-38*k},${y-4*k} L${x},${y-38*k} L${x+38*k},${y-4*k} L${x+30*k},${y-4*k} L${x+30*k},${y+34*k} L${x-30*k},${y+34*k} L${x-30*k},${y-4*k} Z"/><rect x="${x-9*k}" y="${y+10*k}" width="${18*k}" height="${24*k}"/>`;break;
  case 'eye':d=`<path d="M${x-42*k},${y} Q${x},${y-36*k} ${x+42*k},${y} Q${x},${y+36*k} ${x-42*k},${y} Z"/><circle cx="${x}" cy="${y}" r="${12*k}" fill="#fff"/>`;break;
  case 'flag':d=`<line x1="${x-24*k}" y1="${y+40*k}" x2="${x-24*k}" y2="${y-40*k}"/><path d="M${x-24*k},${y-40*k} L${x+34*k},${y-26*k} L${x-24*k},${y-10*k} Z" fill="#fff"/>`;break;
  case 'brain':d=`<path d="M${x},${y-34*k} C ${x-30*k},${y-44*k} ${x-50*k},${y-10*k} ${x-34*k},${y+8*k} C ${x-44*k},${y+30*k} ${x-12*k},${y+42*k} ${x},${y+30*k} C ${x+12*k},${y+42*k} ${x+44*k},${y+30*k} ${x+34*k},${y+8*k} C ${x+50*k},${y-10*k} ${x+30*k},${y-44*k} ${x},${y-34*k} Z"/><line x1="${x}" y1="${y-34*k}" x2="${x}" y2="${y+30*k}"/>`;break;
  case 'clover':d=[[0,-18],[-18,0],[18,0],[0,18]].map(([a,b])=>`<circle cx="${x+a*k}" cy="${y+b*k-6*k}" r="${15*k}"/>`).join('')+`<path d="M${x},${y+6*k} Q${x+6*k},${y+30*k} ${x+18*k},${y+40*k}" fill="none"/>`;break;
  case 'smile':d=`<circle cx="${x}" cy="${y}" r="${38*k}"/><circle cx="${x-13*k}" cy="${y-8*k}" r="${4*k}" fill="#fff"/><circle cx="${x+13*k}" cy="${y-8*k}" r="${4*k}" fill="#fff"/><path d="M${x-18*k},${y+10*k} Q${x},${y+28*k} ${x+18*k},${y+10*k}" fill="none"/>`;break;
  case 'shield':d=`<path d="M${x},${y-40*k} L${x+34*k},${y-26*k} L${x+30*k},${y+12*k} Q${x+20*k},${y+32*k} ${x},${y+42*k} Q${x-20*k},${y+32*k} ${x-30*k},${y+12*k} L${x-34*k},${y-26*k} Z"/><path d="M${x-12*k},${y} l${9*k},${10*k} l${16*k},${-20*k}" fill="none"/>`;break;
  case 'game':d=`<rect x="${x-44*k}" y="${y-22*k}" width="${88*k}" height="${46*k}" rx="${22*k}"/><line x1="${x-24*k}" y1="${y}" x2="${x-10*k}" y2="${y}"/><line x1="${x-17*k}" y1="${y-7*k}" x2="${x-17*k}" y2="${y+7*k}"/><circle cx="${x+18*k}" cy="${y-4*k}" r="${4*k}" fill="#fff"/><circle cx="${x+27*k}" cy="${y+5*k}" r="${4*k}" fill="#fff"/>`;break;
  case 'couch':d=`<rect x="${x-44*k}" y="${y-6*k}" width="${88*k}" height="${30*k}" rx="${8*k}"/><rect x="${x-34*k}" y="${y-28*k}" width="${68*k}" height="${24*k}" rx="${6*k}"/><line x1="${x-36*k}" y1="${y+24*k}" x2="${x-36*k}" y2="${y+34*k}"/><line x1="${x+36*k}" y1="${y+24*k}" x2="${x+36*k}" y2="${y+34*k}"/>`;break;
  case 'seed':d=`<ellipse cx="${x}" cy="${y}" rx="${16*k}" ry="${24*k}" transform="rotate(25,${x},${y})"/>`;break;
  case 'handshake':d=`<path d="M${x-44*k},${y-6*k} L${x-20*k},${y-18*k} L${x+4*k},${y-8*k} L${x+20*k},${y-18*k} L${x+44*k},${y-6*k} M${x-30*k},${y-12*k} L${x-6*k},${y+16*k} Q${x+4*k},${y+24*k} ${x+12*k},${y+14*k} L${x+30*k},${y-8*k}" fill="none"/>`;break;
  case 'key':d=`<circle cx="${x-18*k}" cy="${y}" r="${16*k}"/><path d="M${x-2*k},${y} L${x+40*k},${y} M${x+28*k},${y} L${x+28*k},${y+14*k} M${x+38*k},${y} L${x+38*k},${y+10*k}" fill="none"/>`;break;
  case 'mountain':d=`<path d="M${x-46*k},${y+30*k} L${x-10*k},${y-26*k} L${x+6*k},${y-4*k} L${x+18*k},${y-20*k} L${x+46*k},${y+30*k} Z"/>`;break;
  case 'x':d=`<rect x="${x-34*k}" y="${y-34*k}" width="${68*k}" height="${68*k}" rx="${12*k}"/><path d="M${x-14*k},${y-14*k} L${x+14*k},${y+14*k} M${x+14*k},${y-14*k} L${x-14*k},${y+14*k}"/>`;break;
  default:d=`<circle cx="${x}" cy="${y}" r="${30*k}"/>`;}
  add(`<g opacity="${op}" filter="url(#glowS)" ${st}>${d}</g>`);}

/* ---------- composite helpers ---------- */
function head(t0,txt,{y=150,size=26,outAt=null,x=960}={}){fadeIn(t0,()=>label(x,y,txt,{size,op:.75}),{outAt});}
function big(t0,txt,{y=255,size=92,outAt=null,x=960,snd='hit',vol=.6}={}){pop(t0,x,y-30,()=>title(x,y,txt,{size}),{snd,vol,outAt});}
function you(t0=-9,{x=FX,g=G,arm=null,arm2=null,spot=true,lbl=true,op=1,s=1,ground_=true,x1=null,x2=null}={}){
  if(ground_)ground(g,1,{x1:x1==null?-10:x1,x2:x2==null?W+10:x2,op:.5});
  fadeIn(t0,()=>{person(x,g,s,{arm,arm2,spot,op});if(lbl)label(x,g+56,'YOU',{size:20,op:.6});},{dy:14});}
function card(x,y,w,h,{icon:ic=null,text='',text2=null,sub=null,hi=true,num=null,iconS=1}={}){
  box(x-w/2,y-h/2,w,h,{r:22,op:hi?.9:.45,glow:hi});
  if(num!=null)label(x-w/2+26,y-h/2+38,String(num).padStart(2,'0'),{size:16,op:.5,anchor:'start'});
  const iy=ic?y-h*.16:y;if(ic)icon(ic,x,iy,iconS,hi?1:.5);
  const ty=ic?y+h*.2:y-(text2?14:-10);
  if(text)label(x,ty,text,{size:22,op:hi?1:.5,weight:800,sp:.1});
  if(text2)label(x,ty+30,text2,{size:22,op:hi?1:.5,weight:800,sp:.1});
  if(sub)label(x,y+h/2-22,sub,{size:14,op:hi?.6:.35});}
/* row of cards; items: [{t,icon,text,text2,sub,num}] */
function cardRow(items,{cx=CX,y=500,w=240,h=280,gap=28,crossAt=null,checkAt=null,dimAt=null,outAt=null,hiOne=null,hiAt=null}={}){
  const n=items.length,tw=n*w+(n-1)*gap,x0=cx-tw/2+w/2;
  items.forEach((it,k)=>{const x=x0+k*(w+gap);
    const dim=dimAt!=null?lerp(1,.35,P(T,dimAt,.4)):1;const hi=hiAt!=null&&T>=hiAt?(k===hiOne):true;
    pop(it.t,x,y,()=>{g(`opacity="${hiAt!=null&&T>=hiAt&&k!==hiOne?lerp(1,.3,P(T,hiAt,.4)):dim}"`,()=>card(x,y,w,h,{...it,hi:hi}));
      const ca=it.crossAt!=null?it.crossAt:crossAt;if(ca!=null)cross(x,y,1.7,.9,P(T,ca+k*.08,.25));
      const ch=it.checkAt!=null?it.checkAt:checkAt;if(ch!=null){const c=P(T,ch+k*.08,.3);if(c>0)check(x+w/2-18,y-h/2+18,1.3*back(c));}},{snd:'pop',vol:.5,outAt});
    const ca=it.crossAt!=null?it.crossAt:crossAt;if(ca!=null)cue('nope',ca+k*.08,.35);});}
/* vertical checklist; rows: [{t,text,ok,mark}] */
function checklist(rows,{x=760,y=330,w=900,rowH=110,headTxt=null,t0=null}={}){
  if(t0!=null)fadeIn(t0,()=>box(x,y-70,w,rows.length*rowH+60,{r:24,op:.45}));
  rows.forEach((r,k)=>{const yy=y+k*rowH;fadeIn(r.t,()=>{
    const m=r.mark!=null?P(T,r.mark,.3):0;
    if(r.ok){if(m>0)check(x+60,yy,1.4*back(m));else add(`<circle cx="${x+60}" cy="${yy}" r="24" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3"/>`);
      label(x+110,yy+12,r.text,{size:32,op:1,weight:800,sp:.05,anchor:'start',glow:m>0});}
    else{add(`<circle cx="${x+60}" cy="${yy}" r="24" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>`);
      label(x+110,yy+12,r.text,{size:32,op:lerp(1,.4,m),weight:800,sp:.05,anchor:'start'});
      if(m>0){strike(x+104,x+104+r.text.length*25,yy,m);cross(x+60,yy,.7,.8,m);}}
    if(k<rows.length-1)add(`<line x1="${x+30}" y1="${yy+rowH/2}" x2="${x+w-30}" y2="${yy+rowH/2}" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>`);});
    if(r.mark!=null)cue(r.ok?'win':'nope',r.mark,r.ok?.5:.3);});}
function bar(x,y,w,p,{lab=null,right=null,h=30,glow=true}={}){
  if(lab)label(x,y-20,lab,{size:16,op:.6,anchor:'start'});if(right)label(x+w,y-20,right,{size:16,op:.9,anchor:'end'});
  add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="2.5" ${glow?'filter="url(#glowS)"':''}/>`);
  if(p>0)add(`<rect x="${x+5}" y="${y+5}" width="${Math.max(h-10,(w-10)*p)}" height="${h-10}" rx="${(h-10)/2}" fill="#fff" fill-opacity=".85"/>`);}
function polyline(pts,u,{sw=5,op=1,glow='glow'}={}){if(u<=0)return null;const n=pts.length-1,k=Math.min(n-1,Math.floor(u*n)),f=u*n-k;
  const sh=pts.slice(0,k+1).concat([[lerp(pts[k][0],pts[k+1][0],f),lerp(pts[k][1],pts[k+1][1],f)]]);
  add(`<polyline points="${sh.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')}" fill="none" stroke="#fff" stroke-opacity="${op}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${glow?`filter="url(#${glow})"`:''}/>`);return sh[sh.length-1];}
function curve(fn,x0,y0,w,h,u,o={}){const pts=[];for(let i=0;i<=80;i++){const v=i/80;pts.push([x0+w*v,y0-h*fn(v)]);}return polyline(pts,u,o);}
function axes(x,y,w,h,{xl='TIME',yl=null}={}){add(`<g stroke="#fff" stroke-opacity=".45" stroke-width="2.5"><line x1="${x}" y1="${y}" x2="${x+w}" y2="${y}"/><line x1="${x}" y1="${y}" x2="${x}" y2="${y-h}"/></g>`);if(xl)label(x+w,y+36,xl,{size:15,op:.5,anchor:'end'});if(yl)label(x+8,y-h-12,yl,{size:15,op:.5,anchor:'start'});}
function stairsPath(x0,y0,n,w,h){let d=`M${x0-80},${y0} L${x0},${y0}`;for(let i=0;i<n;i++)d+=` L${x0+i*w},${y0-(i+1)*h} L${x0+(i+1)*w},${y0-(i+1)*h}`;return d+` L${x0+n*w+60},${y0-n*h}`;}
function hopTo(ax,ay,bx,by,p,hh=40){return[lerp(ax,bx,p),lerp(ay,by,p)-Math.sin(Math.PI*p)*hh];}

/* ---------- chapter title card ---------- */
function chapterCard(tag,ttl,t0){
  bokeh([[960,560,380,.06],[300,260,140,.04],[1650,860,160,.04]],T);
  fadeIn(t0+.15,()=>label(960,360,tag,{size:30,op:.75}));
  const words=ttl.split(' ');let l1=ttl,l2=null;if(ttl.length>22){let acc='';for(let i=0;i<words.length;i++){if((acc+' '+words[i]).trim().length>ttl.length/2+2){l1=acc.trim();l2=words.slice(i).join(' ');break;}acc+=' '+words[i];}}
  pop(t0+.35,960,480,()=>{title(960,l2?500:540,l1,{size:84});if(l2)title(960,600,l2,{size:84});},{snd:'impact',vol:.45,d:.5});
  const ly=l2?680:640;drawPath(`M560,${ly} L1360,${ly}`,eo(P(T,t0+.6,.9)),{sw:3,glow:'glowS',op:.7});
  const wp=P(T,t0+.7,3.2);person(lerp(560,1360,wp),ly,.45,{ring:false,bob:Math.abs(Math.sin(T*12))*4,op:clamp(P(T,t0+.7,.3))});}
