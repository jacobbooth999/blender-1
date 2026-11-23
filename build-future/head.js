window.__G=g;
/* ============ "THE ONLY PERSON WHO CAN BUILD YOUR FUTURE IS YOU" — ~4:45 documentary ============ */
const BEATS=[];function B(s,e,fn,cam={}){BEATS.push({s,e,fn,cam});}
const GG=800, AMBER='#FFB547';
const dark=[[300,250,170,.035],[1650,780,200,.03],[1500,160,110,.03]];

/* ---------- subtitles: bold white, key words in amber ---------- */
const KEY=new Set("FUTURE BUILD BUILDING BUILT YOU NOBODY WAITING DECIDED DECIDE DISCIPLINE DISCIPLINED CONFIDENCE TRUST CONTROL RESPOND RESPONSIBILITY SMALL STEP PROUD NOW VERSION SUCCESS CREATE DIFFERENCE COMFORT PROGRESS EXCUSE EXCUSES TRY PERMISSION UNCOMFORTABLE YOURSELF CHANGE OPPORTUNITY POWERFUL HABITS".split(" "));
const SUB=[];TIMING.lines.forEach(ln=>{const w=ln.text.split(' ');const chunks=[];let c=[];w.forEach(x=>{const len=c.join(' ').length;if(c.length>=7||len+x.length>40){chunks.push(c);c=[];}c.push(x);});if(c.length)chunks.push(c);
  const tot=w.join(' ').length;let t=ln.start;chunks.forEach(ch=>{const d=(ln.end-ln.start)*ch.join(' ').length/tot;SUB.push({s:t,e:t+d,w:ch});t+=d;});});
function subtitles(t){const s=SUB.find(x=>t>=x.s-.05&&t<x.e+.12);if(!s)return;const size=46;let html='';
  s.w.forEach((x,k)=>{const k2=x.replace(/[^A-Za-z']/g,'').toUpperCase().replace(/'S$|’S$/,'');html+=`<tspan fill="${KEY.has(k2)?AMBER:'#fff'}">${esc(x.toUpperCase())}${k<s.w.length-1?' ':''}</tspan>`;});
  add(`<text x="960" y="1020" font-size="${size}" font-weight="900" letter-spacing="2" text-anchor="middle" stroke="#000" stroke-width="7" paint-order="stroke">${html}</text>`);}

/* ---------- props ---------- */
function bed(x,g,s=1){add(`<g filter="url(#glowS)" stroke="#fff" stroke-width="4" fill="#0b0b0b"><rect x="${x-260*s}" y="${g-70*s}" width="${520*s}" height="${56*s}" rx="12"/><rect x="${x-260*s}" y="${g-170*s}" width="${28*s}" height="${170*s}" rx="8"/><rect x="${x+232*s}" y="${g-120*s}" width="${28*s}" height="${120*s}" rx="8"/></g>`);}
function sleeper(x,g,s=1,arm=null){g_(`transform="rotate(-90,${x-140*s},${g-70*s})"`,()=>person(x-140*s,g-70*s,.8*s,{ring:false,arm}));
  add(`<path d="M${x-110*s},${g-100*s} Q${x+60*s},${g-136*s} ${x+230*s},${g-104*s} L${x+230*s},${g-70*s} L${x-110*s},${g-70*s} Z" fill="#0b0b0b" stroke="#fff" stroke-width="3.5" filter="url(#glowS)"/>`);}
const g_=(a,f)=>window.__G(a,f);
function alarm(x,y,s,ringing){const sh=ringing?Math.sin(T*60)*5*s:0;icon('clock',x+sh,y,s);if(ringing)add(`<g stroke="#fff" stroke-width="3" opacity=".7" fill="none">${[0,1].map(i=>`<path d="M${x+48*s+i*14},${y-40*s} q12,10 0,22"/><path d="M${x-48*s-i*14},${y-40*s} q-12,10 0,22"/>`).join('')}</g>`);}
function phoneGlow(x,y,s=1){add(`<circle cx="${x}" cy="${y}" r="${90*s}" fill="url(#bk)" fill-opacity=".22"/>`);icon('phone',x,y,s);}
function deskL(x,g,lamp=true){add(`<g filter="url(#glowS)" stroke="#fff" stroke-width="4" fill="#0b0b0b"><rect x="${x-190}" y="${g-160}" width="380" height="20" rx="6"/><line x1="${x-170}" y1="${g-140}" x2="${x-170}" y2="${g}"/><line x1="${x+170}" y1="${g-140}" x2="${x+170}" y2="${g}"/></g>`);
  if(lamp){add(`<path d="M${x+130},${g-160} L${x+130},${g-280} L${x+80},${g-320}" stroke="#fff" stroke-width="4" fill="none"/><path d="M${x+40},${g-330} L${x+120},${g-310} L${x+90},${g-270} Z" fill="#fff"/><polygon points="${x+60},${g-290} ${x+100},${g-280} ${x+20},${g-160} ${x-120},${g-160}" fill="url(#cone)" opacity=".7"/>`);}}
function door(x,g,open=0,label_=null){add(`<rect x="${x-90}" y="${g-300}" width="180" height="300" fill="#141414" stroke="#fff" stroke-width="4" filter="url(#glowS)"/>`);if(open>0)add(`<rect x="${x-90}" y="${g-300}" width="${180*open}" height="300" fill="#fff" fill-opacity="${.55*open}"/>`);else add(`<circle cx="${x+60}" cy="${g-150}" r="7" fill="#fff"/>`);if(label_)label(x,g-320,label_,{size:16,op:.7});}
function rain(op=1){let d='';for(let k=0;k<90;k++){const x=((k*97+T*90)%2100)-80,y=((k*233+T*900)%1200)-60;d+=`<line x1="${x}" y1="${y}" x2="${x-10}" y2="${y+34}"/>`;}add(`<g stroke="#fff" stroke-opacity="${.28*op}" stroke-width="2">${d}</g>`);}
function windowNight(x,y,warm=0){add(`<rect x="${x-120}" y="${y-90}" width="240" height="180" rx="8" fill="${warm>0?'#2a1c0c':'#0a0a0a'}" stroke="#fff" stroke-width="4" filter="url(#glowS)"/><line x1="${x}" y1="${y-90}" x2="${x}" y2="${y+90}" stroke="#fff" stroke-width="3"/><line x1="${x-120}" y1="${y}" x2="${x+120}" y2="${y}" stroke="#fff" stroke-width="3"/>`);
  if(warm<=0){icon('moon',x-60,y-45,.45,.7);}else add(`<circle cx="${x+40}" cy="${y+60}" r="${50*warm}" fill="${AMBER}" opacity="${.6*warm}" filter="url(#blur12)"/>`);}
function shoe(x,y,s=1){add(`<path d="M${x-40*s},${y} L${x-40*s},${y-26*s} Q${x-10*s},${y-30*s} ${x},${y-18*s} L${x+40*s},${y-10*s} Q${x+50*s},${y-4*s} ${x+48*s},${y} Z" fill="#0b0b0b" stroke="#fff" stroke-width="3.5" filter="url(#glowS)"/>`);}
function barbell(x,y,s=1){add(`<g filter="url(#glowS)" stroke="#fff" stroke-width="5" fill="#0b0b0b"><line x1="${x-130*s}" y1="${y}" x2="${x+130*s}" y2="${y}"/><rect x="${x-120*s}" y="${y-40*s}" width="${22*s}" height="${80*s}" rx="5"/><rect x="${x+98*s}" y="${y-40*s}" width="${22*s}" height="${80*s}" rx="5"/></g>`);}
function wave(x0,y0,w,h,u,fn,o={}){return curve(fn,x0,y0,w,h,u,o);}
function stepCard(n,title,t0){const p=P(T,t0,.35),o=1-P(T,t0+2.0,.4);if(p<=0||o<=0)return;add(`<g opacity="${Math.min(p,o)}">`);
  add(`<rect x="0" y="80" width="1920" height="130" fill="#000" opacity=".6"/>`);label(960,128,`STEP ${n}`,{size:24,op:.7});title_(960,190,title,{size:52});add('</g>');cue('impact',t0,.35);}
function title_(x,y,t,o){title(x,y,t,o);}
function onText(t0,t1,lines,{y=420,size=74}={}){const p=P(T,t0,.5)*(1-P(T,t1-.4,.4));if(p<=0)return;add(`<g opacity="${p}"><rect x="0" y="${y-size*1.2}" width="1920" height="${lines.length*size*1.15+size*.8}" fill="#000" opacity=".55"/>`);lines.forEach((l2,i)=>title(960,y+i*size*1.15,l2,{size}));add('</g>');}
function promiseRow(x,y,txt,done){box(x-190,y-45,380,90,{r:16,op:.85});label(x-20,y+8,txt,{size:20,op:1,weight:900});if(done>0)check(x+160,y,1*back(done));}
function meter(x,y,w,v,lab){label(x,y-16,lab,{size:16,op:.75,anchor:'start',weight:900});add(`<rect x="${x}" y="${y}" width="${w}" height="26" rx="13" fill="none" stroke="#fff" stroke-width="2.5"/><rect x="${x+5}" y="${y+5}" width="${Math.max(16,(w-10)*clamp(v))}" height="16" rx="8" fill="#fff"/>`);}
function timeTag(x,y,txt){label(x,y,txt,{size:30,op:.9,weight:900,sp:.12});}

/* ================= V2: shot-based cinematography ================= */
/* ---------- camera ---------- */
function camAt(k){if(T<=k[0][0])return k[0].slice(1);for(let i=0;i<k.length-1;i++){const a=k[i],b=k[i+1];if(T<=b[0]){const u=(b[5]==='lin'?(x=>x):eio)((T-a[0])/Math.max(.001,b[0]-a[0]));return[lerp(a[1],b[1],u),lerp(a[2],b[2],u),lerp(a[3],b[3],u),lerp(a[4]||0,b[4]||0,u)];}}return k[k.length-1].slice(1);}
const FXD=`<filter id="mb" x="-20%" y="-5%" width="140%" height="110%"><feGaussianBlur stdDeviation="34 0"/></filter><filter id="dof" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="7"/></filter><filter id="dof2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="16"/></filter><filter id="blur30" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="30"/></filter><filter id="sil"><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/></filter>`;
let INSHOT=false,OVER=[];function TXT(f){if(INSHOT)OVER.push(f);else f();}
for(const nm of ['big','head','onText','timeTag']){const orig=window[nm];window[nm]=function(...a){if(INSHOT){OVER.push(()=>orig(...a));return;}orig(...a);};}
function SHOT(a,b,keys,fn,o={}){if(T<a||T>=b)return;add(FXD);const[fx,fy,z,r]=camAt(keys);const wb=o.whip&&T<a+.2?1:0;
  const shake=o.shake?o.shake*(Math.sin(T*71)*.6+Math.sin(T*43)*.4):0;
  INSHOT=true;OVER=[];g_(`transform="translate(${960+shake},${540+shake*.6}) rotate(${r}) scale(${z}) translate(${-fx},${-fy})" ${wb?'filter="url(#mb)"':''}`,fn);INSHOT=false;const ov=OVER;OVER=[];ov.forEach(f=>f());
  if(T<a+.06)add(`<rect width="1920" height="1080" fill="#fff" opacity="${(1-P(T,a,.06))*.08}"/>`);
  cue('whoosh',a,o.whip?.5:.12);}
/* ---------- character animation ---------- */
function actor(x,g,s,pose='idle',o={}){const t=T+(o.ph||0);let arm=null,arm2=null,bob=0,rot=0,sy=1;
  switch(pose){
    case 'idle':bob=Math.sin(t*2.2)*2.5*s;arm=[40,58+Math.sin(t*2.2)*2];break;
    case 'walk':{const c=Math.sin(t*7);bob=Math.abs(Math.cos(t*7))*7*s;arm=[38+c*24,46-Math.abs(c)*12];arm2=[-38+c*24,46-Math.abs(c)*12];rot=3;break;}
    case 'run':{const c=Math.sin(t*11);bob=Math.abs(Math.cos(t*11))*14*s;arm=[58+c*26,-18+c*32];arm2=[-34-c*26,-8-c*32];rot=9;break;}
    case 'type':arm=[96,-38+Math.sin(t*22)*6];arm2=[82,-30+Math.cos(t*19)*6];bob=Math.sin(t*2)*1.5;break;
    case 'lift':{const u=(Math.sin(t*2.6)+1)/2;arm=[105,lerp(-30,-125,u)];arm2=[-105,lerp(-30,-125,u)];bob=-u*5;break;}
    case 'slump':arm=[26,62];arm2=[-26,62];sy=.92;rot=-5;bob=Math.sin(t*1.3)*2;break;
    case 'cheer':arm=[44,-90+Math.sin(t*9)*8];arm2=[-44,-90+Math.cos(t*9)*8];bob=Math.abs(Math.sin(t*6))*10*s;break;
    case 'point':arm=[85,-28];bob=Math.sin(t*2)*2;break;
    case 'think':arm=[14,-34];bob=Math.sin(t*1.6)*1.5;break;
    case 'stretch':{const u=(Math.sin(t*1.8)+1)/2;arm=[lerp(44,95,u),lerp(-92,-40,u)];arm2=[lerp(-44,-95,u),lerp(-92,-40,u)];break;}
    case 'crouch':sy=.76;arm=[60,36];arm2=[-46,40];rot=12;break;
    case 'write':arm=[90,-36+Math.sin(t*14)*4];bob=Math.sin(t*2)*1.5;rot=6;break;}
  if(o.arm)arm=o.arm;if(o.arm2)arm2=o.arm2;if(o.flip)rot=-rot;
  g_(`transform="translate(${x},${g}) rotate(${rot}) scale(1,${sy}) translate(${-x},${-g})" ${o.sil?'filter="url(#sil)"':''}`,()=>person(x,g-bob*0,s,{arm,arm2,bob,op:o.op??1,ring:false,spot:o.spot||false}));}
function hand(x1,y1,x2,y2,w=40){const d=`M${x1},${y1} L${x2},${y2}`;add(`<path d="${d}" stroke="#0b0b0b" stroke-width="${w+10}" stroke-linecap="round"/><path d="${d}" stroke="#efefef" stroke-width="${w}" stroke-linecap="round" filter="url(#glowS)"/>`);}
function fgShoulder(x,y,s=1){add(`<g filter="url(#dof2)" opacity=".95"><circle cx="${x}" cy="${y-260*s}" r="${130*s}" fill="#050505"/><path d="M${x-260*s},${y+200} L${x-260*s},${y-60*s} Q${x-260*s},${y-150*s} ${x-150*s},${y-150*s} L${x+150*s},${y-150*s} Q${x+260*s},${y-150*s} ${x+260*s},${y-60*s} L${x+260*s},${y+200} Z" fill="#050505"/></g>`);
  add(`<g filter="url(#dof)" opacity=".5" fill="none" stroke="#fff" stroke-width="3"><circle cx="${x}" cy="${y-260*s}" r="${130*s}"/></g>`);}
function fgEdge(side,op=.9){const x=side<0?-40:1960;add(`<g filter="url(#dof2)" opacity="${op}"><rect x="${x-140}" y="-50" width="280" height="1200" fill="#030303"/></g>`);}
function bigClock(cx,cy,s,ring,txt='6:00'){const sh=ring?Math.sin(T*60)*6*s:0;add(`<circle cx="${cx+sh}" cy="${cy}" r="${200*s}" fill="url(#bk)" fill-opacity="${ring?.18:.08}"/>`);icon('clock',cx+sh,cy,5*s);
  if(ring)add(`<g stroke="#fff" stroke-width="${6*s}" fill="none" opacity=".8">${[0,1,2].map(i=>`<path d="M${cx+240*s+i*30*s},${cy-170*s} q${30*s},${30*s} 0,${60*s}"/><path d="M${cx-240*s-i*30*s},${cy-170*s} q${-30*s},${30*s} 0,${60*s}"/>`).join('')}</g>`);
  if(txt)label(cx+sh,cy+280*s,txt,{size:60*s,op:.95,weight:900,sp:.08});}
function bigPhone(cx,cy,s,scroll,o={}){const w=380*s,h=720*s;add(`<circle cx="${cx}" cy="${cy}" r="${520*s}" fill="url(#bk)" fill-opacity=".14"/><rect x="${cx-w/2}" y="${cy-h/2}" width="${w}" height="${h}" rx="${46*s}" fill="#0b0b0b" stroke="#fff" stroke-width="${6*s}" filter="url(#glowS)"/>`);
  const id='c'+(uid++);add(`<clipPath id="${id}"><rect x="${cx-w/2+16*s}" y="${cy-h/2+40*s}" width="${w-32*s}" height="${h-80*s}" rx="${20*s}"/></clipPath><g clip-path="url(#${id})">`);
  const ics=o.icons||['trophy','house','dollar','star','dumbbell','smile'];for(let k=0;k<8;k++){const yy=cy-h/2+40*s+(((k*190*s-scroll*600*s)%(8*190*s))+8*190*s)%(8*190*s)-60*s;
    add(`<rect x="${cx-w/2+34*s}" y="${yy}" width="${w-68*s}" height="${160*s}" rx="${14*s}" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="${3*s}"/>`);icon(ics[k%ics.length],cx-w/2+100*s,yy+80*s,.7*s,.85);
    add(`<rect x="${cx-w/2+160*s}" y="${yy+50*s}" width="${150*s}" height="${14*s}" rx="${7*s}" fill="#fff" fill-opacity=".5"/><rect x="${cx-w/2+160*s}" y="${yy+86*s}" width="${100*s}" height="${12*s}" rx="${6*s}" fill="#fff" fill-opacity=".3"/>`);}
  add('</g>');if(o.badge){add(`<circle cx="${cx+w/2-20*s}" cy="${cy-h/2+20*s}" r="${34*s}" fill="#fff"/>`);label(cx+w/2-20*s,cy-h/2+34*s,String(o.badge),{size:34*s,op:1,fill:'#000',weight:900,sp:0});}}
function streetLight(x,g,h=420){add(`<line x1="${x}" y1="${g}" x2="${x}" y2="${g-h}" stroke="#fff" stroke-opacity=".5" stroke-width="4"/><path d="M${x},${g-h} q40,0 50,30" stroke="#fff" stroke-opacity=".5" stroke-width="4" fill="none"/><polygon points="${x+30},${g-h+32} ${x+70},${g-h+32} ${x+150},${g} ${x-50},${g}" fill="url(#cone)" opacity=".5"/>`);}
function sunrise(cx,cy,r,p){add(`<circle cx="${cx}" cy="${cy}" r="${r*2.6}" fill="${AMBER}" opacity="${.16*p}" filter="url(#blur30)"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" opacity="${.5+.45*p}" filter="url(#glow)"/>`);for(let k=0;k<14;k++){const a=k*Math.PI/7+T*.05;add(`<line x1="${cx+r*1.25*Math.cos(a)}" y1="${cy+r*1.25*Math.sin(a)}" x2="${cx+r*(1.7+.2*p)*Math.cos(a)}" y2="${cy+r*(1.7+.2*p)*Math.sin(a)}" stroke="#fff" stroke-opacity="${.3*p}" stroke-width="5"/>`);}}
function warm(op){add(`<rect width="1920" height="1080" fill="${AMBER}" opacity="${.10*op}" style="mix-blend-mode:overlay"/>`);}
function room(g,win=true,warmW=0){ground(g,1,{op:.35});if(win)windowNight(1500,330,warmW);}
