/* ============ VERTICAL HOOK SCENES (one per short, at t = i*10) ============ */
const HK=window.HOOKS||[];
function slam(t,lines){const sz=s=>Math.min(140,Math.floor(900/(s.length*.76)));const k=1+.12*(1-eo(P(t,0,.28)));
  g(`transform="translate(540,470) scale(${k}) translate(-540,-470)"`,()=>{let y=440;lines.forEach((s,i)=>{const z=sz(s);title(540,y+(i?z*.95:0),s,{size:z,sp:.03});if(i===0)y=440;});});}
function hookBase(i,draw){S.push({s:i*10-1,e:i*10+8,cam:{zoom:.06},draw:()=>{const t=T-i*10,h=HK[i];
  bokeh([[540,1000,360,.06],[160,400,140,.04],[920,1650,160,.04]],T);
  label(540,250,h.label,{size:26,op:.7});slam(t,h.text);
  if(t>.05&&t<.25)add(`<rect width="${W}" height="${H}" fill="#fff" opacity="${(1-P(t,.05,.2))*.18}"/>`);
  draw(t,h);}});}
const GY=1450;
// 0 — five years from now
hookBase(0,(t)=>{ground(GY,1);person(260,GY,.8,{op:.55});label(260,GY+52,'TODAY',{size:18,op:.55});
  const p=back(P(t,.35,.5));if(p>0){add(`<circle cx="700" cy="${GY-260}" r="${330*p}" fill="url(#bk)" fill-opacity=".18"/>`);rays(700,GY-300,16,140*p,460*p,.16);personOutline(700,GY,2.4*p,1);}
  arrowR(360,GY-120,560,P(t,.9,.5));label(700,GY+60,'5 YEARS',{size:20,op:clamp(P(t,1,.3))*.8});});
function rays(x,y,n,r0,r1,op){let d='';for(let k=0;k<n;k++){const a=k*2*Math.PI/n+T*.2;d+=`<line x1="${x+r0*Math.cos(a)}" y1="${y+r0*Math.sin(a)}" x2="${x+r1*Math.cos(a)}" y2="${y+r1*Math.sin(a)}"/>`;}add(`<g stroke="#fff" stroke-opacity="${op}" stroke-width="5" stroke-linecap="round">${d}</g>`);}
// 1 — stop waiting: loading bar stuck, then smashed
hookBase(1,(t,h)=>{const p=.99*eo(P(t,.2,.7));bar(150,820,780,p,{lab:'WAITING FOR THE RIGHT MOMENT',right:Math.round(p*100)+'%',h:44});spinner(540,940,22);
  const x=P(t,h.dur-.75,.25);cross(540,850,4.5,1,x);if(x>0)ring(540,850,h.dur-.7,{r0:120,r1:520});
  ground(GY,1);person(540,GY,1,{spot:true,arm:[14,-34]});icon('hourglass',760,GY-200,1,.8);});
// 2 — motivation is lying: battery crashes
hookBase(2,(t)=>{const p=t<.7?1:Math.max(0,1-eio(P(t,.7,.8)))+(Math.sin(t*60)>0&&t<1.4?.08:0);
  box(290,800,460,190,{r:24,op:.9});add(`<rect x="750" y="860" width="26" height="70" rx="8" fill="#fff" fill-opacity=".8"/>`);
  if(p>0)add(`<rect x="306" y="816" width="${428*Math.min(1,p)}" height="158" rx="14" fill="#fff" fill-opacity=".88" filter="url(#glowS)"/>`);
  label(520,1050,'MOTIVATION · '+Math.round(Math.min(1,p)*100)+'%',{size:24,op:.85,weight:800});
  ground(GY,1);const sl=P(t,1.1,.4);person(540,GY,1,{spot:lerp(1,.4,sl),arm:sl>0?[30,58]:[40,-70],arm2:sl>0?[-30,58]:[-40,-70]});});
// 3 — get uncomfortable: break out of the comfort zone
hookBase(3,(t)=>{const cx=540,cy=1160,br=P(t,1.0,.6);
  if(br<=0)add(`<ellipse cx="${cx}" cy="${cy}" rx="330" ry="240" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="4" stroke-dasharray="14 10" filter="url(#glowS)"/>`);
  else for(let k=0;k<8;k++){const a0=k*Math.PI/4,dd=260*eo(br);const ox=Math.cos(a0+.4)*dd,oy=Math.sin(a0+.4)*dd;add(`<path d="M${cx+330*Math.cos(a0)+ox},${cy+240*Math.sin(a0)+oy} A330,240 0 0 1 ${cx+330*Math.cos(a0+.7)+ox},${cy+240*Math.sin(a0+.7)+oy}" fill="none" stroke="#fff" stroke-opacity="${.8*(1-br)}" stroke-width="4"/>`);}
  label(cx,cy-270,'COMFORT ZONE',{size:22,op:.7*(1-br)});
  const push=Math.sin(t*20)*(t<1?6:0);person(cx+push,cy+120,1.1,{spot:true,ring:false,arm:t<1?[70,-10]:[50,-80],arm2:t<1?[-70,-10]:[-50,-80]});
  if(br>0)ring(cx,cy,1.0,{r0:200,r1:620});});
// 4 — your circle matters
hookBase(4,(t)=>{const cx=540,cy=1200;person(cx,cy+120,1,{spot:true});
  const R=[[-330,40],[-220,-200],[220,-200],[330,40]];const snap=P(t,1.2,.3);
  R.forEach(([dx,dy],k)=>{const x=cx+dx,y=cy+dy+120;const fade=lerp(.6,.18,snap);person(x,y,.75,{op:fade,ring:false});
    if(snap<1)add(`<line x1="${x}" y1="${y-60}" x2="${cx}" y2="${cy+40}" stroke="#fff" stroke-opacity="${.5*(1-snap)}" stroke-width="3" stroke-dasharray="6 6"/>`);
    if(t>.3+k*.15&&snap<1){add(`<g opacity="${1-snap}">`);bubble(x,y-200,150,['NO','CAN’T','WHY?','LOL'][k],{size:18});add('</g>');}});
  if(snap>0)ring(cx,cy,1.2,{r0:100,r1:560});});
// 5 — stop doing everything: orbs spin then all but one fall
hookBase(5,(t)=>{const cx=540,cy=1150;const ic=['dollar','dumbbell','briefcase','brain','gear','people','smile'];const fall=P(t,1.2,.6);
  person(cx,cy+150,1,{spot:true,arm:fall>0?[50,-60]:[40,-82],arm2:fall>0?null:[-40,-82]});
  ic.forEach((n,k)=>{const a=-Math.PI/2+k*2*Math.PI/7+t*3.2;let x=cx+330*Math.cos(a),y=cy-20+260*Math.sin(a);const keep=k===0;
    if(fall>0&&!keep){y+=900*fall*fall;}if(fall>0&&keep){x=lerp(x,cx+250,eo(fall));y=lerp(y,cy-260,eo(fall));}
    add(`<circle cx="${x}" cy="${y}" r="62" fill="#0b0b0b" stroke="#fff" stroke-width="3" opacity="${keep||fall<.9?1:0}" ${keep&&fall>0?'filter="url(#glow)"':''}/>`);icon(n,x,y,.65,keep||fall<.9?1:0);});});
// 6 — overnight success? myth
hookBase(6,(t)=>{icon('moon',540,920,2.6);pillShape(540,1150,'OVERNIGHT SUCCESS',{size:30,dark:true});
  const m=back(P(t,.85,.35));if(m>0)g(`transform="translate(540,1080) rotate(-12) scale(${m}) translate(-540,-1080)"`,()=>{add(`<rect x="300" y="1000" width="480" height="160" rx="18" fill="none" stroke="#fff" stroke-width="10" filter="url(#glow)"/>`);title(540,1120,'MYTH',{size:120});});
  ground(GY,1);person(240,GY,.9,{spot:.7,arm:[30,-40]});});
// 7 — five things to start today
hookBase(7,(t)=>{['ONE GOAL','DAILY HABIT','REMOVE ONE','TRACK IT','GIVE IT TIME'].forEach((s,k)=>{const t0=.02+k*.4;const q=P(t,t0,.25);if(q<=0)return;const y=760+k*150,x=540+(k%2?40:-40),sc=1+.3*(1-eo(q));
  g(`opacity="${Math.min(1,q*3)}" transform="translate(${x},${y}) scale(${sc}) translate(${-x},${-y})"`,()=>{box(x-300,y-60,600,120,{r:22,op:.95});label(x-230,y+16,String(k+1),{size:48,op:1,weight:900,sp:0,glow:true});label(x+30,y+12,s,{size:34,op:1,weight:800,sp:.08});});});});
// 8 — nobody is coming
hookBase(8,(t)=>{ground(GY,1);const xs=[160,320,760,920];xs.forEach((x,k)=>{const f=P(t,.35+k*.18,.35);person(x,GY,.8,{op:.5*(1-f),ring:false});});
  person(540,GY,1.1,{spot:true,arm:t>1.3?[50,-80]:null});pop(.9,640,GY-300,()=>qmark(640,GY-280,90,.9),{snd:null,outAt:1.3});});
