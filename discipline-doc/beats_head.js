window.__G=g;
/* ============ "BECOME SO DISCIPLINED THAT MOTIVATION DOESN'T MATTER" — ~5 min documentary ============ */
const BEATS=[];function B(s,e,fn,cam={}){BEATS.push({s,e,fn,cam});}
const GG=800, AMBER='#FFB547';
const dark=[[300,250,170,.035],[1650,780,200,.03],[1500,160,110,.03]];

/* ---------- subtitles: bold white, key words in amber ---------- */
const KEY=new Set('MOTIVATION DISCIPLINE EASY FAIL FAILS TEMPORARY START DECISION DECISIONS TRUST SMALL SMALLER CONSISTENCY INTENSITY DISTRACTED DISTRACTIONS ENVIRONMENT WILLPOWER PROGRESS MOMENTUM CHOICE COMFORT VERSION PROMISES PROMISED FUTURE DO HABIT NEGOTIATING ONCE TRACK EXCUSE EXCUSES PERFECT FEELINGS DIFFERENT UNSTOPPABLE TIRED ENOUGH READY BUILD BECAME NOBODY ACTUALLY NOW'.split(' '));
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

