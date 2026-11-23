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

/* ================= V2: shot-based cinematography ================= */
/* ---------- camera ---------- */
function camAt(k){if(T<=k[0][0])return k[0].slice(1);for(let i=0;i<k.length-1;i++){const a=k[i],b=k[i+1];if(T<=b[0]){const u=(b[5]==='lin'?(x=>x):eio)((T-a[0])/Math.max(.001,b[0]-a[0]));return[lerp(a[1],b[1],u),lerp(a[2],b[2],u),lerp(a[3],b[3],u),lerp(a[4]||0,b[4]||0,u)];}}return k[k.length-1].slice(1);}
const FXD=`<filter id="mb" x="-20%" y="-5%" width="140%" height="110%"><feGaussianBlur stdDeviation="34 0"/></filter><filter id="dof" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="7"/></filter><filter id="dof2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="16"/></filter><filter id="sil"><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/></filter>`;
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

/* ================= SCENE 1 — THE HOOK ================= */
B(0,3,()=>{const g=GG;
  // ECU: the alarm fills the frame
  SHOT(0,at(0,1.25),[[0,960,520,1.0,0],[at(0,1.25),960,520,1.12,0]],()=>{bigClock(960,470,1,true);for(let k=0;k<6;k++)cue('tick',.05+k*.18,.6);},{shake:3});
  // CU: a hand slams it off
  SHOT(at(0,1.25),at(1),[[at(0,1.25),1100,560,1.6,0],[at(1),1080,560,1.7,0]],()=>{const p=eo(P(T,at(0,1.3),.35));bigClock(1300,520,.55,p<1);hand(lerp(300,700,p)*0+300,1200,lerp(600,1180,p),lerp(900,560,p),70);cue('thud',at(0,1.62),.8);});
  // MS: lying in bed scrolling — slow dolly right; easy dreams float up
  SHOT(at(1),at(2,1.0),[[at(1),620,620,1.35,0],[at(2,1.0),760,600,1.45,0]],()=>{room(g);bed(760,g);sleeper(760,g,1,[46,-30]);phoneGlow(700,g-200,.6);
    [[1,'NEW GOALS','target',520],[2,'TOMORROW = DIFFERENT','calendar',860]].forEach(([i,tx,ic,x])=>pop(at(i,.2),x,420,()=>{icon(ic,x,400,.9);pillShape(x,480,tx,{size:16,dark:true});},{snd:'pop',vol:.3}));});
  // ECU: the phone screen — the new me
  SHOT(at(2,1.0),at(3),[[at(2,1.0),960,560,1.0,-2],[at(3),960,540,1.08,0]],()=>{bigPhone(960,560,1,(T-at(2))*1.2,{icons:['star','trophy','dumbbell','house']});hand(1500,1250,1090,860,90);});
  // WIDE high angle pull-back: tiny in a dark room, a faint future self in the window
  SHOT(at(3),1e9,[[at(3),900,560,1.5,0],[at(3)+3.5,960,520,.95,0]],()=>{room(g,true);bed(760,g);sleeper(760,g,1,[46,-30]);phoneGlow(700,g-200,.5);
    const fp=P(T,at(3,.6),1.2);add(`<g opacity="${.5*fp}">`);personOutline(1500,400,.7,1);add('</g>');label(960,150,'MOTIVATION IS EASY',{size:26,op:.7});});
});
B(4,8,()=>{const g=GG;
  SHOT(at(4,-.35),at(5),[[at(4,-.35),760,620,1.6,-3],[at(5),740,620,1.7,-3]],()=>{room(g);bed(760,g);const tn=P(T,at(4,.6),.8);sleeper(760,g,1,tn>.5?null:[30,-50]);zzz(560,g-220,.6);qmark(980,g-260,70,.8);});
  SHOT(at(5),at(6),[[at(5),1300,700,2.0,0],[at(6),1340,700,2.2,0]],()=>{ground(g,1,{op:.35});shoe(1250,g-6,1.4);shoe(1380,g-6,1.4);barbell(1320,g-120,.8);label(1320,g+50,'UNTOUCHED',{size:16,op:.55});for(let k=0;k<20;k++)add(`<circle cx="${1200+(k*53)%260}" cy="${g-200+((k*37+T*8)%200)}" r="2" fill="#fff" opacity=".4"/>`);});
  SHOT(at(6),at(7),[[at(6),960,600,1.8,2],[at(7),960,580,2.0,2]],()=>{ground(g,1,{op:.35});for(let k=0;k<6;k++)add(`<rect x="${860+(k%2)*10}" y="${g-40-k*38}" width="200" height="34" rx="5" fill="#0b0b0b" stroke="#fff" stroke-width="3"/>`);qmark(1120,g-300,70,.8);label(960,g+50,'IMPOSSIBLE?',{size:16,op:.55});});
  // Dutch wide: where most people fail
  SHOT(at(7),at(8),[[at(7),960,540,1.0,-7],[at(8),960,540,1.06,-8]],()=>{room(g);bed(760,g);sleeper(760,g,1);add(`<rect width="1920" height="1080" fill="#000" opacity=".35"/>`);});
  // split screen: motivation stays, discipline goes — camera tracks the right side
  SHOT(at(8),1e9,[[at(8),960,540,1,0]],()=>{const g2=GG;add(`<line x1="960" y1="140" x2="960" y2="940" stroke="#fff" stroke-opacity=".3" stroke-width="2"/>`);
    g_(`transform="translate(-240,40) scale(.9)"`,()=>{bed(760,g2,.9);sleeper(760,g2,.9,[46,-30]);phoneGlow(700,g2-180,.5);});
    const u=P(T,at(8),3.2);const px=lerp(1150,1800,eio(clamp((u-.35)/.65)));const pose=u<.18?'stretch':(u<.35?'crouch':'run');actor(px,g2,1,pose,{spot:.6});shoe(1140,g2-6,.9);if(u>.2)door(1780,g2,P(T,at(8,1.6),.5));
    pillShape(480,240,'MOTIVATION',{size:22,dark:true});pillShape(1440,240,'DISCIPLINE',{size:22});onText(at(8,.2),at(8)+4.8,['ONE RELIES ON MOTIVATION.','THE OTHER RELIES ON DISCIPLINE.'],{y:560,size:58});});
});

/* ================= SCENE 2 — THE PROBLEM WITH MOTIVATION ================= */
B(9,12,()=>{const g=GG;
  // OTS: the motivational video
  SHOT(at(9,-.35),at(11),[[at(9,-.35),960,500,1.25,0],[at(11),980,500,1.4,0]],()=>{timeTag(320,190,'11:48 PM');add(`<rect x="640" y="250" width="640" height="380" rx="20" fill="#0b0b0b" stroke="#fff" stroke-width="5" filter="url(#glowS)"/><circle cx="960" cy="440" r="260" fill="url(#bk)" fill-opacity=".22"/>`);icon('play',960,440,2.2);
    fadeIn(at(10),()=>{wave(700,610,520,120,P(T,at(10),2.5),v=>.5+.42*Math.sin(v*Math.PI*4),{sw:5});label(720,600,'MOTIVATION',{size:14,op:.7,anchor:'start'});});fgShoulder(380,1180,1.6);});
  // LOW angle push-in: jumps up, unstoppable
  SHOT(at(11),at(12),[[at(11),960,640,1.2,0],[at(12),960,620,1.5,0]],()=>{room(g,false);add(`<circle cx="960" cy="420" r="320" fill="url(#bk)" fill-opacity=".14"/>`);actor(960,g,1.3,'cheer',{spot:true});TXT(()=>pill(at(11,.3),960,240,'UNSTOPPABLE',{size:26}));});
  // CU: writing the new routine, then imagining it
  SHOT(at(12),1e9,[[at(12),960,560,1.5,0],[at(12,2.6),960,520,1.0,0]],()=>{add(`<rect x="660" y="330" width="600" height="440" rx="18" fill="#0b0b0b" stroke="#fff" stroke-width="4" filter="url(#glowS)"/>`);label(960,385,'MY NEW ROUTINE',{size:22,op:.75,weight:900});
    for(let k=0;k<6;k++){const p=P(T,at(12,.3)+k*.35,.3);if(p>0)add(`<line x1="720" y1="${450+k*50}" x2="${720+460*p}" y2="${450+k*50}" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`);}
    const k=Math.min(5,Math.floor((T-at(12,.3))/.35));const py=450+Math.max(0,k)*50;hand(1500,1150,720+460*clamp(((T-at(12,.3))%.35)/.3),py-10,46);
    const im=P(T,at(12,2.8),.8);if(im>0){add(`<g opacity="${im}"><circle cx="960" cy="540" r="${500*im}" fill="#000" opacity=".8"/></g>`);add(`<g opacity="${im}">`);personOutline(960,760,1.8,1);label(960,850,'EVERYTHING CHANGES',{size:26,op:.9,weight:900});add('</g>');}});
});
B(13,17,()=>{const g=GG;
  // match cut: the same alarm, next day
  SHOT(at(13,-.35),at(14),[[at(13,-.35),960,520,1.1,0],[at(14),960,520,1.0,0]],()=>{bigClock(960,470,1,true,'6:00 — THE NEXT DAY');},{shake:2});
  // pan: bed -> gym clothes -> back; turns over
  SHOT(at(14),at(16),[[at(14),760,600,1.6,0],[at(15),1350,640,1.7,0],[at(16),780,600,1.6,0]],()=>{room(g);bed(760,g);sleeper(760,g,1,T<at(15,.5)?[40,-40]:null);shoe(1300,g-6,1.2);barbell(1420,g-60,.6);
    pill(at(14,.1),560,330,'TIRED',{size:22,dark:true});zzz(560,g-220,.7);});
  SHOT(at(15),at(16),[[at(15),960,560,1.0,3],[at(16),960,560,1.06,3]],()=>{bigPhone(960,560,.9,(T-at(15))*2,{badge:1+Math.floor((T-at(15))*6)%9});pill(at(15,.1),960,140,'DISTRACTED',{size:24,dark:true});},{whip:true});
  SHOT(at(16),at(17),[[at(16),760,600,1.7,-4],[at(17),760,610,1.8,-4]],()=>{room(g);bed(760,g);sleeper(760,g,1);add(`<path d="M600,${g-110} q160,-40 330,-10" stroke="#fff" stroke-width="5" fill="none"/>`);pill(at(16,.1),760,330,'NOT INSPIRED',{size:22,dark:true});});
  // ECU: promises crack
  SHOT(at(17),1e9,[[at(17),960,540,1.2,0],[at(17)+4,960,540,1.35,0]],()=>{['TRAIN','STUDY','BUILD'].forEach((tx,j)=>{const x=560+j*400;const c=P(T,at(17,.6)+j*.5,.35);add(`<g opacity="${1-.6*c}" transform="rotate(${c*(j-1)*6},${x},540)">`);box(x-160,460,320,160,{r:18,op:.9});label(x,520,'PROMISE',{size:16,op:.6});label(x,575,tx,{size:40,op:1,weight:900});
    if(c>0)add(`<path d="M${x-8},460 L${x+18},500 L${x-14},545 L${x+10},620" stroke="#fff" stroke-width="6" fill="none"/>`);add('</g>');cue('ting',at(17,.6)+j*.5,.35);});});
});
B(18,20,()=>{const g=GG;
  // time-lapse: calendar flips, light sweeps, he never moves
  SHOT(at(18,-.35),at(19,1.2),[[at(18,-.35),760,560,1.3,0],[at(19,1.2),760,560,1.4,0]],()=>{const day=Math.min(30,1+Math.floor(P(T,at(18),4.5)*29));const dayPhase=(T*2.2)%1;room(g,true,dayPhase<.5?dayPhase*2:0);
    add(`<rect x="0" y="0" width="1920" height="1080" fill="#000" opacity="${.3+.25*Math.sin(T*13.8)}"/>`);bed(760,g);sleeper(760,g,1,[46,-30]);phoneGlow(700,g-200,.5);
    box(300,220,220,240,{r:14,op:.9});add(`<rect x="300" y="220" width="220" height="56" rx="14" fill="#fff" fill-opacity=".9"/>`);label(410,258,'DAY',{size:20,op:1,fill:'#000',weight:900});label(410,410,String(day),{size:90,op:1,weight:900,sp:0});for(let k=0;k<8;k++)cue('tick',at(18)+k*.5,.2);});
  // push to the rain on the window
  SHOT(at(19,1.2),1e9,[[at(19,1.2),1500,360,1.6,0],[at(20)+2.5,1500,380,2.4,0]],()=>{room(g,true);rain(1);add(`<rect width="1920" height="1080" fill="#000" opacity=".25"/>`);cue('wind',at(19,1.2),.6);
    onText(at(20,-.2),at(20)+2.6,['MOTIVATION IS TEMPORARY.'],{y:560,size:66});});
});

/* ================= SCENE 3 — WHAT DISCIPLINE MEANS ================= */
B(21,22,()=>{const g=GG+40;
  // tracking shot: running in the rain, parallax street lights, low angle
  SHOT(at(21,-.35),1e9,[[at(21,-.35),960,620,1.15,-2],[at(22)+5,980,600,1.25,1]],()=>{rain(1);const off=(T*420)%600;for(let k=-1;k<5;k++)streetLight(k*600-off+300,g,460);
    for(let k=0;k<6;k++){const ph=(T*2.4+k/6)%1;add(`<ellipse cx="${960-80-ph*260}" cy="${g+4}" rx="${10+ph*30}" ry="${4+ph*6}" fill="none" stroke="#fff" stroke-opacity="${.5*(1-ph)}" stroke-width="2"/>`);}
    ground(g,1,{op:.5});actor(960,g,1.25,'run',{spot:.5});big(at(21,-.1),'DISCIPLINE',{y:250,size:120,vol:.6});
    TXT(()=>fadeIn(at(22,.2),()=>label(960,345,"DOING WHAT NEEDS TO BE DONE — EVEN WHEN YOU DON'T FEEL LIKE IT",{size:22,op:.9,weight:800})));});
});
B(23,25,()=>{const g=GG;const a=at(23,-.35),b=at(24,-.2),c=at(25,-.2);
  // wide silhouette: an empty gym
  SHOT(a,at(23,1.6),[[a,960,560,1.0,0],[at(23,1.6),960,560,1.08,0]],()=>{add(`<rect x="0" y="0" width="1920" height="1080" fill="#fff" opacity=".04"/>`);for(let k=0;k<5;k++)add(`<rect x="${160+k*360}" y="${g-300}" width="140" height="300" rx="8" fill="none" stroke="#fff" stroke-opacity=".15" stroke-width="2"/>`);ground(g,1,{op:.4});timeTag(330,180,'GYM · 9:42 PM');
    actor(960,g,1.1,'lift',{spot:true});const u=(Math.sin((T)*2.6)+1)/2;barbell(960,g-78*1.1+22*1.1+lerp(-30,-125,u)*1.1,1.2);});
  // CU slow-mo: hands on the bar
  SHOT(at(23,1.6),b,[[at(23,1.6),960,520,2.6,0],[b,960,500,2.9,0]],()=>{const u=(Math.sin(T*1.2)+1)/2;const y=lerp(620,420,u);barbell(960,y,1.6);hand(700,900,780,y,60);hand(1220,900,1140,y,60);pill(at(23,1.8),960,240,"WHEN YOU'D RATHER STAY HOME",{size:16,dark:true});});
  // OTS from behind the lamp: studying alone
  SHOT(b,at(24,1.6),[[b,880,560,1.3,0],[at(24,1.6),900,560,1.4,0]],()=>{room(g);timeTag(330,180,'1:13 AM');deskL(860,g);icon('book',820,g-190,.9);actor(620,g,1,'write',{spot:.6});[0,1].forEach(j=>{const ph=(T*.7+j/2)%1;add(`<text x="${1480+j*60}" y="${330-ph*30}" font-size="26" fill="#fff" opacity="${(1-ph)*.6}">♪</text>`);});label(1500,450,'FRIENDS OUT',{size:14,op:.55});fgEdge(1);});
  // CU: pencil moving on the page
  SHOT(at(24,1.6),c,[[at(24,1.6),960,560,1.0,0],[c,960,560,1.08,0]],()=>{add(`<rect x="560" y="300" width="800" height="520" rx="10" fill="#0b0b0b" stroke="#fff" stroke-width="4"/>`);for(let k=0;k<7;k++){const p=P(T,at(24,1.7)+k*.25,.25);if(p>0)add(`<line x1="620" y1="${370+k*60}" x2="${620+620*p*(k%3?1:.7)}" y2="${370+k*60}" stroke="#fff" stroke-width="4" opacity=".75"/>`);}
    const k=Math.min(6,Math.floor((T-at(24,1.7))/.25));hand(1500,1200,620+620*clamp(((T-at(24,1.7))%.25)/.25),370+Math.max(0,k)*60,44);});
  // ECU: the phone goes into the drawer — slam — back to work
  SHOT(c,at(25,2.4),[[c,960,620,1.6,0],[at(25,2.4),960,640,1.7,0]],()=>{add(`<rect x="560" y="640" width="800" height="260" rx="14" fill="#0b0b0b" stroke="#fff" stroke-width="5"/>`);const d=eio(P(T,at(25,.4),.9));const dr=1-eio(P(T,at(25,1.4),.3));
    add(`<rect x="${600}" y="640" width="720" height="${40+120*dr}" fill="#141414" stroke="#fff" stroke-width="4"/>`);if(d<1){icon('phone',lerp(960,960,d),lerp(380,700,d),2.2);hand(1500,200,1060,lerp(330,650,d),60);}cue('thud',at(25,1.7),.7);});
  SHOT(at(25,2.4),1e9,[[at(25,2.4),1000,560,1.3,0],[at(25)+5,1020,560,1.4,0]],()=>{room(g);deskL(1050,g);add(`<rect x="950" y="${g-250}" width="200" height="90" rx="8" fill="#0b0b0b" stroke="#fff" stroke-width="3"/>`);actor(820,g,1,'type',{spot:.7});pill(at(25,2.6),1050,300,'BACK TO WORK',{size:20});});
});
B(26,30,()=>{const g=GG;
  // CU: an imperfect streak
  SHOT(at(26,-.35),at(28,-.2),[[at(26,-.35),960,520,1.0,0],[at(28,-.2),960,520,1.15,0]],()=>{head(at(26,-.2),"HERE'S SOMETHING IMPORTANT",{y:200});if(T<at(27,-.1))actor(960,760,1.6,'think',{spot:.8});const miss=[5,13,19];for(let d=0;d<21;d++){const c=d%7,r=Math.floor(d/7),x=630+c*110,y=380+r*120;fadeIn(at(27,-.1)+d*.05,()=>{box(x-44,y-44,88,88,{r:12,op:miss.includes(d)?.3:.8,glow:false});if(miss.includes(d))cross(x,y,.5,.4,1);else check(x,y,.85);},{d:.2,dy:6});}pill(at(27,.8),960,770,'NOT PERFECT — CONSISTENT',{size:22,dark:true});});
  // graph push-in
  SHOT(at(28,-.2),at(29,-.15),[[at(28,-.2),960,470,1.0,0],[at(29,-.15),1300,420,1.5,0]],()=>{box(260,250,1400,440,{r:20,op:.45});axes(320,640,1280,340,{xl:'TIME'});wave(320,640,1280,340,P(T,at(28,.1),2.4),v=>.5+.3*Math.sin(v*31)*Math.sin(v*7),{sw:3,op:.5,glow:null});label(420,300,'TEMPORARY FEELINGS',{size:18,op:.55,anchor:'start'});
    const tip=wave(320,640,1280,340,P(T,at(28,.5),2.2),v=>.18+.7*v,{sw:7});if(tip)orb(tip[0],tip[1],9);label(1560,320,'LONG-TERM DECISIONS',{size:20,op:1,anchor:'end',weight:900});});
  // LOW CU: the start line — crouch, then explode forward (speed ramp + whip)
  SHOT(at(29,-.15),at(30,.5),[[at(29,-.15),820,700,2.0,0],[at(30,.5),840,700,2.2,0]],()=>{ground(g,1,{op:.5});add(`<rect x="880" y="${g-6}" width="16" height="12" fill="#fff"/>`);for(let k=0;k<6;k++)add(`<rect x="${700+k*40}" y="${g-3}" width="22" height="6" fill="#fff" opacity=".7"/>`);label(890,g+50,'START',{size:20,op:.8,weight:900});actor(800,g,1,'crouch',{spot:.8});});
  SHOT(at(30,.5),1e9,[[at(30,.5),900,600,1.3,0],[at(30)+4,1500,600,1.1,0,'lin']],()=>{ground(g,1,{op:.5});const u=P(T,at(30,.5),3.5);const x=lerp(820,1700,u*u*.3+u*.7);for(let k=0;k<5;k++)add(`<line x1="${x-120-k*40}" y1="${g-60-k*25}" x2="${x-260-k*60}" y2="${g-60-k*25}" stroke="#fff" stroke-opacity="${.4-k*.07}" stroke-width="3"/>`);
    actor(x,g,1.1,'run',{spot:.6});onText(at(30,.8),at(30)+3.8,["DO IT EVEN WHEN YOU DON'T FEEL LIKE IT."],{y:300,size:60});},{whip:true});
});

/* ================= SCENE 4 — HOW TO BUILD DISCIPLINE ================= */
B(31,36,()=>{const g=GG;stepCard(1,'STOP NEGOTIATING WITH YOURSELF',at(31,-.2));
  // ECU: finger hovering over snooze, trembling
  SHOT(at(31,-.35),at(33,-.2),[[at(31,-.35),960,600,1.0,0],[at(33,-.2),960,620,1.25,0]],()=>{add(`<rect x="640" y="520" width="640" height="260" rx="40" fill="#0b0b0b" stroke="#fff" stroke-width="6" filter="url(#glowS)"/>`);label(960,680,'SNOOZE',{size:72,op:.95,weight:900});
    const tr=Math.sin(T*30)*6;hand(1300,1150,1000+tr,560+Math.sin(T*2)*20,70);[['5 MORE MINUTES?',520,330],['DO I FEEL LIKE IT?',1400,300]].forEach(([tx,x,y],j)=>{if(T>at(32,.2+j*.9)){bubble(x,y,360,tx,{size:20});cross(x,y,1.5,.9,P(T,at(33,-.4)+j*.12,.25));}});cue('nope',at(33,-.4),.4);});
  // MS: sits up and stands — decided
  SHOT(at(33,-.2),at(34,-.2),[[at(33,-.2),900,600,1.5,0],[at(34,-.2),960,580,1.4,0]],()=>{room(g);bed(760,g);const up=P(T,at(33,.1),.8);if(up<.5)sleeper(760,g,1);else actor(lerp(800,1000,eio(up)),g,1.05,up>=1?'cheer':'idle',{spot:.8});timeTag(330,180,'6:00 AM');pill(at(33,.9),1000,330,'ALREADY DECIDED',{size:24});});
  // quick cuts: study / exercise / goals
  [[34,'book','STUDYING'],[34.33,'dumbbell','EXERCISING'],[34.66,'target','YOUR GOALS']].forEach(([f,ic,tx],j)=>{const a=lerp(at(34,-.2),at(35,-.2),j/3),b2=lerp(at(34,-.2),at(35,-.2),(j+1)/3);SHOT(a,b2,[[a,960,520,1.0,0],[b2,960,520,1.08,0]],()=>{icon(ic,960,460,3.2);label(960,690,tx,{size:44,op:1,weight:900});},{whip:j>0});});
  // stamp
  SHOT(at(35,-.2),at(36,-.2),[[at(35,-.2),960,540,1.1,0],[at(36,-.2),960,540,1.0,0]],()=>{const st=back(P(T,at(35,.1),.35));g_(`transform="translate(960,540) rotate(-5) scale(${st}) translate(-960,-540)"`,()=>{add(`<rect x="560" y="440" width="800" height="200" rx="18" fill="none" stroke="#fff" stroke-width="10" filter="url(#glow)"/>`);title(960,580,'DECIDE ONCE.',{size:100});});cue('impact',at(35,.1),.6);},{shake:0});
  // promises kept + trust building
  SHOT(at(36,-.2),1e9,[[at(36,-.2),960,560,1.05,0],[at(36)+5,960,540,1.15,0]],()=>{['WAKE UP AT SIX','TRAIN TODAY','STUDY 20 MIN'].forEach((tx,j)=>{const x=560+j*400;promiseRow(x,500,tx,P(T,at(36,.5)+j*.6,.3));cue('win',at(36,.5)+j*.6,.25);});meter(660,640,600,P(T,at(36,.5),3),'SELF-TRUST');actor(960,GG+60,.7,'idle',{spot:.5});});
});
B(37,45,()=>{const g=GG;stepCard(2,'MAKE YOUR GOALS SMALLER',at(37,-.2));
  // LOW angle tilt-up along a looming tower of books
  SHOT(at(37,-.35),at(39),[[at(37,-.35),960,760,1.6,0],[at(39),960,320,1.15,0]],()=>{ground(g,1,{op:.4});for(let k=0;k<16;k++)add(`<rect x="${820+(k%2)*16}" y="${g-48-k*44}" width="300" height="40" rx="5" fill="#0b0b0b" stroke="#fff" stroke-width="3" transform="rotate(${(k%3-1)*2},960,${g-28-k*44})"/>`);actor(620,g,.9,'think',{spot:.5});label(980,g-760,'CHANGE EVERYTHING OVERNIGHT',{size:18,op:.65});});
  // Dutch: burnout collapse
  SHOT(at(39),at(40,-.2),[[at(39),960,560,1.3,-6],[at(40,-.2),960,580,1.45,-8]],()=>{room(g,false);const burn=P(T,at(39,1.2),1.0);g_(`transform="rotate(${-80*eio(burn)},960,${g})"`,()=>actor(960,g,1.1,burn>0?'slump':'idle'));box(1250,300,420,300,{r:16,op:.6});label(1460,335,'MY NEW ROUTINE',{size:16,op:.6});for(let k=0;k<7;k++)add(`<line x1="1280" y1="${370+k*32}" x2="${1640}" y2="${370+k*32}" stroke="#fff" stroke-width="3" stroke-opacity=".7"/>`);meter(1270,650,380,1-burn,'ENERGY');pill(at(39,2),960,240,'BURNOUT',{size:24,dark:true});});
  // CU: one book opens; pages turn; small wins cut
  SHOT(at(40,-.2),at(41,-.15),[[at(40,-.2),960,540,1.0,0],[at(41,-.15),960,540,1.08,0]],()=>{big(at(40,-.1),'START SMALL.',{y:540,size:130,vol:.5});});
  [[41,'book','5 PAGES'],[42,'dumbbell','10 MINUTES'],[43,'clock','20 MINUTES']].forEach(([i,ic,tx],j)=>{SHOT(at(i,-.15),at(i+1,-.15),[[at(i,-.15),960,520,1.15,0],[at(i+1,-.15),960,520,1.0,0]],()=>{icon(ic,960,450,3.4);label(960,700,tx,{size:56,op:1,weight:900});if(i===42){actor(1500,GG,.8,'lift',{spot:.4});}},{whip:true});});
  // graph
  SHOT(at(44,-.15),at(45,-.15),[[at(44,-.15),960,470,1.0,0],[at(45,-.15),1250,430,1.35,0]],()=>{box(260,250,1400,440,{r:20,op:.45});axes(320,640,1280,340,{xl:'TIME',yl:'PROGRESS'});const spikes=v=>Math.min(.95,(Math.floor(v*4)%2===0?(v%.25)*3.2:.05));wave(320,640,1280,340,P(T,at(44,.1),2),spikes,{sw:3,op:.45,glow:null});label(420,300,'INTENSITY',{size:18,op:.55,anchor:'start'});
    const tip=wave(320,640,1280,340,P(T,at(44,.5),2),v=>.1+.75*v,{sw:7});if(tip)orb(tip[0],tip[1],9);label(1560,330,'CONSISTENCY',{size:22,op:1,anchor:'end',weight:900});});
  // tracking shot up the habit staircase
  SHOT(at(45,-.15),1e9,[[at(45,-.15),520,760,1.5,0],[at(45)+3.6,1300,460,1.3,0]],()=>{add(`<path d="${stairsPath(420,g,6,180,70)}" stroke="#fff" stroke-width="4" fill="none" filter="url(#glow)"/>`);label(560,g-110,'HABIT FIRST',{size:20,op:.9,weight:900});label(1420,g-480,'DIFFICULTY LATER',{size:20,op:.9,weight:900});
    const c=clamp((T-at(45,.2))/3)*6,i=Math.floor(c),f=c-i;const sp=k=>k<0?[340,g]:[420+(k+.5)*180,g-(k+1)*70];const[ax,ay]=sp(i-1),[bx,by]=sp(Math.min(5,i));const[px,py]=c<=0?[340,g]:(i>=6?sp(5):hopTo(ax,ay,bx,by,f,34));actor(px,py,.85,i>=6?'cheer':'walk',{spot:.6});});
});
B(46,52,()=>{const g=GG;stepCard(3,'REMOVE THE DISTRACTIONS',at(46,-.2));
  // rack focus: phone sharp in foreground, him blurred behind -> focus pulls to him
  SHOT(at(46,-.35),at(48,-.15),[[at(46,-.35),960,560,1.2,0],[at(48,-.15),980,560,1.3,0]],()=>{const rf=P(T,at(47,.4),.6);g_(`filter="url(${rf<.5?'#dof':'#glowS'})"`,()=>{room(g);deskL(1100,g);icon('book',1060,g-190,.9);actor(860,g,1,'type');});
    g_(`filter="url(${rf<.5?'#glowS':'#dof2'})"`,()=>{bigPhone(520,640,.7,(T*1.5),{badge:1+Math.floor(T*3)%9});});pill(at(47,.6),1100,260,'CONSTANTLY DEMANDING ATTENTION',{size:18,dark:true});});
  // tracking: carry it to another room; door shuts -> black
  SHOT(at(48,-.15),at(49,-.1),[[at(48,-.15),700,560,1.3,0],[at(49,-.1),1450,560,1.3,0]],()=>{room(g,false);door(1650,g,1-P(T,at(48,1.1),.3),'ANOTHER ROOM');const u=clamp((T-at(48))/1.1);actor(lerp(600,1550,u),g,1,u<1?'walk':'idle',{arm:[70,-40]});if(u<1)icon('phone',lerp(600,1550,u)+70,g-200,.6);cue('thud',at(48,1.3),.6);
    const bl=P(T,at(48,1.3),.15);if(bl>0)add(`<rect x="0" y="0" width="1920" height="1080" fill="#000" opacity="${bl}"/>`);});
  // ECU: apps deleted with a thumb
  SHOT(at(49,-.1),at(50,-.15),[[at(49,-.1),960,540,1.0,0],[at(50,-.15),960,540,1.06,0]],()=>{add(`<rect x="760" y="140" width="400" height="800" rx="50" fill="#0b0b0b" stroke="#fff" stroke-width="6" filter="url(#glowS)"/>`);['play','game','people','note','chart','star','smile','gear'].forEach((a,k)=>{const x=860+(k%2)*200,y=280+Math.floor(k/2)*170;const del=k<5;const dq=del?P(T,at(49,.2)+k*.16,.2):0;if(dq<1){add(`<g opacity="${1-dq}" transform="translate(${x},${y}) scale(${1-dq*.7}) translate(${-x},${-y})"><rect x="${x-60}" y="${y-60}" width="120" height="120" rx="28" fill="#0b0b0b" stroke="#fff" stroke-width="3"/>`);icon(a,x,y,.7);add('</g>');}if(del)cue('pop',at(49,.2)+k*.16,.3);});
    const k=Math.min(4,Math.floor((T-at(49,.2))/.16));hand(1500,1250,860+(Math.max(0,k)%2)*200,280+Math.floor(Math.max(0,k)/2)*170+40,60);});
  // overhead-ish CU: a clean workspace, lamp clicks on
  SHOT(at(50,-.15),at(51,-.15),[[at(50,-.15),960,560,1.5,0],[at(51,-.15),960,560,1.3,0]],()=>{room(g,false);const on=T>at(50,.4);deskL(960,g,on);icon('book',900,g-190,.9);icon('notebook',1020,g-196,.6);actor(720,g,1,on?'write':'idle',{spot:on?.8:false});cue('tick',at(50,.4),.7);pill(at(50,.6),960,300,'WORKSPACE READY',{size:22});});
  // easy vs hard to reach
  SHOT(at(51,-.15),at(52,-.15),[[at(51,-.15),760,560,1.2,0],[at(52,-.15),1160,560,1.2,0]],()=>{room(g,false);actor(960,g,1,'reach',{arm:[-90,-30]});[['book',-260],['dumbbell',-420],['notebook',-580]].forEach(([ic,d])=>icon(ic,960+d+100,g-130,.85));[['phone',300],['game',470],['couch',650]].forEach(([ic,d])=>icon(ic,960+d+100,g-130,.85,.45));
    label(560,g-260,'EASY TO REACH',{size:18,op:.9,weight:900});label(1490,g-260,'HARD TO REACH',{size:18,op:.6,weight:900});add(`<rect x="1300" y="${g-230}" width="380" height="200" rx="14" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="10 8"/>`);});
  SHOT(at(52,-.15),1e9,[[at(52,-.15),960,500,1.0,0],[at(52)+4,960,480,1.1,0]],()=>{meter(380,420,400,.22,'WILLPOWER');label(960,450,'<',{size:70,op:1,weight:900,sp:0});box(1140,320,400,260,{r:20,op:1});icon('house',1340,420,1.5);label(1340,535,'ENVIRONMENT',{size:24,op:1,weight:900});});
});
B(53,57,()=>{const g=GG;stepCard(4,'TRACK YOUR PROGRESS',at(53,-.2));
  // ECU: a marker crossing off days
  SHOT(at(53,-.35),at(55,-.15),[[at(53,-.35),900,520,1.3,0],[at(55,-.15),900,520,1.1,0]],()=>{label(760,250,'THIS MONTH',{size:20,op:.7,weight:900});const n=Math.floor(clamp((T-at(53,.6))/3.6)*20);for(let d=0;d<28;d++){const c=d%7,r=Math.floor(d/7),x=460+c*100,y=320+r*100;box(x-40,y-40,80,80,{r:10,op:.5,glow:false});if(d<n)cross(x,y,.65,.95,1);}
    const c=n%7,r=Math.floor(n/7);hand(1400,1150,460+c*100+20,320+r*100+20,46);add(`<rect x="${460+c*100+10}" y="${320+r*100-10}" width="16" height="50" rx="6" fill="#fff" transform="rotate(35,${460+c*100+18},${320+r*100+15})"/>`);for(let k=0;k<10;k++)cue('tick',at(53,.6)+k*.36,.2);});
  // the log fills: quick pops
  SHOT(at(55,-.15),at(56,-.15),[[at(55,-.15),960,520,1.0,0],[at(56,-.15),960,520,1.08,0]],()=>{[['WORKOUT','dumbbell'],['STUDY SESSION','book'],['PRODUCTIVE MORNING','clock']].forEach(([tx,ic],j)=>{const y=330+j*150;pop(at(55,.05)+j*.75,960,y,()=>{box(620,y-55,680,110,{r:16,op:.95});icon(ic,700,y,.7);label(780,y+10,tx,{size:28,op:1,weight:900,anchor:'start'});check(1250,y,1.1);},{snd:'win',vol:.3});});});
  // tracking: the momentum ball grows as it rolls (camera follows)
  SHOT(at(56,-.15),1e9,[[at(56,-.15),500,620,1.3,0],[L[57].e+.5,1450,560,1.0,0]],()=>{ground(g,1,{op:.45});const u=clamp((T-at(56))/(L[57].e-at(56)));const r=30+90*u,x=lerp(300,1500,u);add(`<circle cx="${x}" cy="${g-r}" r="${r}" fill="#0b0b0b" stroke="#fff" stroke-width="5" filter="url(#glowS)"/><line x1="${x}" y1="${g-r}" x2="${x+r*Math.cos(u*24)}" y2="${g-r+r*Math.sin(u*24)}" stroke="#fff" stroke-width="4"/>`);for(let k=0;k<4;k++)add(`<line x1="${x-r-30-k*30}" y1="${g-r+(k-1.5)*r*.4}" x2="${x-r-130-k*40}" y2="${g-r+(k-1.5)*r*.4}" stroke="#fff" stroke-opacity="${.4-k*.08}" stroke-width="3"/>`);
    label(x,g-2*r-30,'MOMENTUM',{size:20,op:.85,weight:900});actor(x-r-150,g,.85,'run',{op:.9});if(T>at(57))pill(at(57,.3),x,g-2*r-100,"HOW FAR YOU'VE COME",{size:20});});
});

/* ================= SCENE 5 — THE MOMENT THAT DEFINES YOU ================= */
B(58,63,()=>{const g=GG;
  // slow push-in: alone, exhausted, breathing
  SHOT(at(58,-.35),at(60),[[at(58,-.35),900,580,1.1,0],[at(60),760,600,1.6,0]],()=>{add(`<rect width="1920" height="1080" fill="#000" opacity=".4"/>`);ground(g,1,{op:.3});add(`<rect x="560" y="${g-120}" width="260" height="30" rx="8" fill="#0b0b0b" stroke="#fff" stroke-width="3"/><line x1="580" y1="${g-90}" x2="580" y2="${g}" stroke="#fff" stroke-width="3"/><line x1="800" y1="${g-90}" x2="800" y2="${g}" stroke="#fff" stroke-width="3"/>`);
    actor(690,g-120,.85,'slump');phoneGlow(880,g-150,.45);shoe(380,g-6,.8);shoe(450,g-6,.8);deskL(1250,g,false);head(at(58,-.2),'THE MOMENT THAT DEFINES YOU',{y:200});if(T>at(59))TXT(()=>pill(at(59,.2),960,240,'A CHOICE',{size:30,dark:true}));});
  // flashes: hard cuts with shake
  [[60,'clock','THE EASY OPTION'],[61,'notebook','ANOTHER EXCUSE'],[62,'phone','"TOMORROW"']].forEach(([i,ic,tx],j)=>{SHOT(at(i),at(i+1),[[at(i),960,500,1.25,(j-1)*4],[at(i+1),960,500,1.1,(j-1)*4]],()=>{add(`<rect width="1920" height="1080" fill="#000" opacity=".5"/>`);icon(ic,960,450,4);label(960,700,tx,{size:44,op:1,weight:900});},{shake:4,whip:true});});
  // SLOW-MO: stands, puts the phone face down, walks out into the light
  SHOT(at(63),1e9,[[at(63),760,600,1.6,0],[at(63,2.2),1000,580,1.2,0],[at(64),1300,560,1.1,0]],()=>{add(`<rect width="1920" height="1080" fill="#000" opacity=".35"/>`);ground(g,1,{op:.3});const stand=P(T,at(63,.2),1.6),walk=clamp((T-at(63,1.9))/1.6);const op=P(T,at(63,2.9),.5);
    add(`<rect x="560" y="${g-120}" width="260" height="30" rx="8" fill="#0b0b0b" stroke="#fff" stroke-width="3"/>`);door(1650,g,op);if(op>0)add(`<polygon points="1560,${g-300} 1740,${g-300} 1900,${g} 1400,${g}" fill="#fff" opacity="${.12*op}"/>`);
    if(stand<1)actor(690,lerp(g-120,g,eio(stand)),.85+.15*eio(stand),'slump');else actor(lerp(690,1580,eio(walk)),g,1,walk>0&&walk<1?'walk':'idle',{spot:.5});
    add(`<rect x="830" y="${g-150}" width="70" height="30" rx="6" fill="#0b0b0b" stroke="#fff" stroke-width="3"/>`);});
});
B(64,68,()=>{const g=GG;
  // crane up over empty stands at dawn: a lone backlit runner
  SHOT(at(64,-.35),at(67,-.2),[[at(64,-.35),960,700,1.3,0],[at(67,-.2),960,480,1.0,0]],()=>{add(`<rect x="0" y="0" width="1920" height="${g}" fill="#fff" opacity=".035"/>`);sunrise(1500,g-20,110,.4);for(let r=0;r<3;r++)for(let c=0;c<14;c++)add(`<rect x="${120+c*125}" y="${300+r*70}" width="95" height="40" rx="8" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="2"/>`);ground(g,1,{op:.45});
    const x=lerp(200,1700,((T-at(64))/7)%1);actor(x,g,1.1,'run',{spot:.6});
    [[64,'NOBODY NEEDS TO SEE IT'],[65,'NO APPLAUSE'],[66,'NOBODY KNOWS HOW HARD IT WAS']].forEach(([i,tx],j)=>TXT(()=>pill(at(i,.05),960,220,tx,{size:24,dark:true,outAt:j<2?at(i+1,-.05):at(67,-.3)})));});
  // CU: the scale tips
  SHOT(at(67,-.2),at(68,-.2),[[at(67,-.2),960,440,1.2,0],[at(68,-.2),960,440,1.35,0]],()=>{const tilt=eio(P(T,at(67,.6),1.2))*14;add(`<line x1="960" y1="${g}" x2="960" y2="420" stroke="#fff" stroke-width="5"/>`);g_(`transform="rotate(${tilt},960,420)"`,()=>{add(`<rect x="560" y="417" width="800" height="7" rx="3" fill="#fff" filter="url(#glowS)"/>`);icon('couch',600,360,1.2);label(600,290,'COMFORT',{size:24,op:.7,weight:900});icon('target',1320,360,1.2);label(1320,290,'DISCIPLINE',{size:24,op:1,weight:900});});cue('thud',at(67,1.6),.4);});
  // orbit-ish: tiles assemble a new self
  SHOT(at(68,-.2),1e9,[[at(68,-.2),960,560,1.3,-4],[at(68)+3,960,560,1.1,3]],()=>{ground(g,1,{op:.4});head(at(68,-.1),'ONE DECISION AT A TIME',{y:200});const n=70;for(let k=0;k<n;k++){const c=k%7,r=Math.floor(k/7);const tx_=888+c*24,ty_=g-30-r*24;const q=P(T,at(68)+k*.03,.3);if(q>0)add(`<rect x="${lerp(200+((k*137)%1500),tx_,eio(q))-10}" y="${lerp(260+((k*71)%380),ty_,eio(q))-10}" width="20" height="20" rx="3" fill="#f2f2f2"/>`);}for(let k=0;k<10;k++)cue('brick',at(68)+k*.2,.25);});
});

/* ================= SCENE 6 — THE PAYOFF (warm) ================= */
B(69,73,()=>{const g=GG;const a=at(69,-.35),seg=(L[70].s-a)/3;
  // silhouette against the sunrise window
  SHOT(a,a+seg,[[a,1300,480,1.6,0],[a+seg,1260,480,1.7,0]],()=>{add(`<rect x="1080" y="180" width="440" height="460" rx="10" fill="#2a1a08" stroke="#fff" stroke-width="5"/>`);sunrise(1300,560,90,1);add(`<line x1="1300" y1="180" x2="1300" y2="640" stroke="#000" stroke-width="10"/><line x1="1080" y1="410" x2="1520" y2="410" stroke="#000" stroke-width="10"/>`);actor(1300,700,1.4,'stretch',{sil:true});timeTag(400,200,'5:30 AM');ground(700,1,{op:.3});});
  // CU low: push-ups
  SHOT(a+seg,a+2*seg,[[a+seg,960,620,1.6,0],[a+2*seg,960,620,1.75,0]],()=>{ground(g,1,{op:.45});const u=(Math.sin(T*4)+1)/2;g_(`transform="rotate(-78,1060,${g})"`,()=>actor(1060,g-lerp(0,40,u)*0,1.1,'idle',{arm:[-20,lerp(120,90,u)],arm2:[20,lerp(120,90,u)]}));label(960,240,'TRAINING',{size:26,op:.85,weight:900});});
  // OTS: focused at the desk
  SHOT(a+2*seg,L[70].s-.15,[[a+2*seg,1000,560,1.3,0],[L[70].s-.15,1020,560,1.4,0]],()=>{room(g,true,1);deskL(1060,g);icon('book',1020,g-190,.9);actor(820,g,1,'write',{spot:.8});fgShoulder(420,1060,1.0);});
  // CU: the goal chart rising
  SHOT(L[70].s-.15,at(71,-.15),[[L[70].s-.15,1200,480,1.3,0],[at(71,-.15),1250,450,1.5,0]],()=>{add(`<rect x="980" y="280" width="520" height="340" rx="16" fill="#0b0b0b" stroke="#fff" stroke-width="5" filter="url(#glowS)"/>`);const tip=polyline([[1020,580],[1130,540],[1230,555],[1330,460],[1460,320]],P(T,L[70].s,1.8),{sw:6});if(tip)orb(tip[0],tip[1],9);actor(800,GG,1,'point',{spot:.8});});
  // two-shot with the mirror: who you became
  SHOT(at(71,-.15),1e9,[[at(71,-.15),1000,520,1.2,0],[at(73)+3,1050,520,1.4,0]],()=>{room(g,false);add(`<ellipse cx="1220" cy="520" rx="190" ry="280" fill="#0d0d0d" stroke="#fff" stroke-width="7" filter="url(#glow)"/>`);const id='c'+(uid++);add(`<clipPath id="${id}"><ellipse cx="1220" cy="520" rx="182" ry="272"/></clipPath><g clip-path="url(#${id})">`);add(`<circle cx="1220" cy="520" r="230" fill="url(#bk)" fill-opacity=".25"/>`);actor(1220,770,1.2,'cheer');add('</g>');actor(800,g,1.1,'idle',{spot:.8});
    [[71,"STOPPED MAKING EXCUSES"],[72,'KEPT GOING'],[73,'TRUSTS THEIR OWN PROMISES']].forEach(([i,tx],j)=>TXT(()=>pop(at(i,.1),420,330+j*90,()=>pillShape(420,330+j*90,tx,{size:20}),{snd:'win',vol:.3})));});
  warm(1);
});
B(74,79,()=>{const g=GG+40;
  // low-angle tracking walk toward the sunrise (silhouette, long shadow) -> crane up wide reveal
  SHOT(at(74,-.35),at(76,-.2),[[at(74,-.35),960,700,1.8,0],[at(76,-.2),960,640,1.6,0]],()=>{sunrise(960,g-30,150,eio(P(T,at(74),6)));add(`<rect x="0" y="${g}" width="1920" height="300" fill="#000"/>`);ground(g,1,{op:.6});
    actor(960,g,1.3,'walk',{sil:true});add(`<ellipse cx="960" cy="${g+90}" rx="40" ry="140" fill="#000" opacity=".6" transform="rotate(0)"/>`);
    big(at(74,0),'STOP WAITING FOR MOTIVATION.',{y:260,size:58,outAt:at(76,-.3),vol:.4});big(at(75,0),'BUILD DISCIPLINE.',{y:350,size:76,outAt:at(76,-.3),vol:.6});});
  SHOT(at(76,-.2),1e9,[[at(76,-.2),960,640,1.4,0],[at(78),960,520,1.0,0]],()=>{const sr=eio(P(T,at(74),10));sunrise(960,g-60*sr,200+60*sr,sr);add(`<rect x="0" y="${g}" width="1920" height="${1080-g}" fill="#000"/>`);ground(g,1,{op:.6});add(`<path d="M760,1080 L930,${g} L990,${g} L1160,1080" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>`);
    const u=clamp((T-at(76))/10);actor(960,lerp(1000,g+20,u),lerp(1.1,.5,u),'walk',{sil:true});
    TXT(()=>fadeIn(at(76,0),()=>{label(960,200,"YOUR FUTURE ISN'T DECIDED BY WHAT YOU FEEL LIKE DOING",{size:26,op:.9,weight:800});},{outAt:at(78,-.3)}));
    big(at(77,.3),"IT'S DECIDED BY WHAT YOU DO.",{y:300,size:66,outAt:at(78,-.3),vol:.5});TXT(()=>{pop(at(78),960,250,()=>title(960,280,'THE NEXT VERSION.',{size:110}),{snd:'impact',d:.5});fadeIn(at(79),()=>label(960,360,'YOUR NEXT CHAPTER STARTS NOW',{size:26,op:.9,weight:900}));});
    TXT(()=>{const fin=P(T,L[79].e+.5,.6);if(fin>0){add(`<rect width="1920" height="1080" fill="#000" opacity="${.85*fin}"/>`);add(`<g opacity="${fin}">`);title(960,470,'DISCIPLINE BUILDS THE PERSON',{size:70});title(960,560,'MOTIVATION ONLY DREAMS ABOUT.',{size:70});label(960,680,'THE NEXT VERSION',{size:28,op:.8,weight:900});add('</g>');}});});
  warm(1);
});

/* ---------- assemble ---------- */
(function(){const list=BEATS.map((b,k)=>({s:k===0?0:L[b.s].s-.35,draw:b.fn,cam:b.cam}));list.forEach((x,k)=>{const e=k<list.length-1?list[k+1].s:END;S.push({s:x.s,e,draw:x.draw,cam:{zoom:0}});});})();
// cinematic letterbox + subtitles drawn on top
window.AFTER=t=>{add(`<rect x="0" y="0" width="1920" height="118" fill="#000"/><rect x="0" y="962" width="1920" height="118" fill="#000"/>`);subtitles(t);};
