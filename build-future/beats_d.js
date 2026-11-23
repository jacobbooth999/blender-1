/* ---- 48-52 you don't need… ---- */
B(48,52,()=>{
  const item=(i,ic,txt)=>SHOT(at(i,-.35),at(i+1,-.35),[[at(i,-.35),960,520,1.25,0],[at(i+1,-.35),960,520,1.4,0]],()=>{add(`<circle cx="960" cy="480" r="300" fill="url(#bk)" fill-opacity=".14"/>`);ic();label(960,760,txt,{size:30,op:1,weight:900});
    const p=P(T,at(i,1.0),.3);if(p>0){add(`<line x1="${960-txt.length*12-20}" y1="750" x2="${960-txt.length*12-20+(txt.length*24+40)*p}" y2="750" stroke="${AMBER}" stroke-width="10" stroke-linecap="round"/>`);cue('nope',at(i,1.0),.4);}});
  item(48,()=>{[[-90,-60],[90,-60],[-90,90],[90,90]].forEach(([a,b],k)=>{const miss=k===3;add(`<rect x="${960+a-80}" y="${460+b-70}" width="160" height="140" rx="12" fill="${miss?'none':'#0b0b0b'}" stroke="#fff" stroke-width="5" ${miss?'stroke-dasharray="12 10" stroke-opacity=".5"':'filter="url(#glowS)"'}/>`);});qmark(1050,560,70,.8);},'EVERYTHING FIGURED OUT');
  item(49,()=>{icon('brain',960,470,3.4);},'THE SMARTEST IN THE ROOM');
  item(50,()=>{add(`<rect x="780" y="360" width="360" height="230" rx="22" fill="#0b0b0b" stroke="#fff" stroke-width="6" filter="url(#glowS)"/>`);title(960,520,'£0',{size:120});},'THOUSANDS IN THE BANK');
  item(51,()=>{for(let k=0;k<7;k++){const x=640+k*107;g_(`transform="translate(${x},620) scale(${-1},1) translate(${-x},-620)"`,()=>personOutline(x,640,.9,.6));}},'EVERYBODY TO BELIEVE IN YOU');
  // responsibility: a glowing key lands in the figure's hand — low-angle hero
  SHOT(at(52,-.35),1e9,[[at(52,-.35),960,640,1.5,0],[at(53,-.35),960,600,1.25,0]],()=>{add(`<circle cx="960" cy="400" r="460" fill="url(#bk)" fill-opacity=".2"/>`);ground(GG,1,{op:.5});spotlight(960,GG,1.3,1);actor(960,GG,1.4,'idle',{arm:[70,-120]});
    const p=P(T,at(52,.4),.7);keyIcon(1060,lerp(-100,GG-360,eo(p)),.7,1);if(p>=1)ring(1060,GG-360,at(52,1.1),{r0:20,r1:240,d:.7,op:.8});cue('ting',at(52,1.1),.7);TXT(()=>big(at(52,1.4),'RESPONSIBILITY.',{y:230,size:96,outAt:at(53,-.4)}));});
});
/* ---- 53-57 start small: four quick panels ---- */
B(53,58,()=>{
  SHOT(at(53,-.35),at(54),[[at(53,-.35),960,560,1.6,0],[at(54),960,560,1.75,0]],()=>{ground(GG,1,{op:.4});brick(960,GG-40,200,80,at(53,.1),{lab:'SMALL',hi:true,vol:.6,lsize:30});actor(800,GG,1,'point',{});});
  const panel=(i,fn,lab)=>SHOT(at(i,-.2),at(i+1,-.2),[[at(i,-.2),960,560,1.15,0],[at(i+1,-.2),960,560,1.28,0]],()=>{ground(GG,1,{op:.4});fn();TXT(()=>{pillShape(960,190,lab,{size:26});});},{whip:true});
  panel(54,()=>{streetLight(500,GG);streetLight(1400,GG);speed(.6);actor(960,GG,1.2,'run',{});},'START MOVING YOUR BODY');
  panel(55,()=>{deskL(960,GG);actor(840,GG,1.1,'type',{});icon('gear',1240,440,1.4);const v=P(T,at(55,.4),2.5);meter(1100,560,420,v,'SKILL');},'START DEVELOPING A SKILL');
  panel(56,()=>{deskL(960,GG);actor(840,GG,1.1,'write',{});for(let k=0;k<4;k++)add(`<rect x="${1020}" y="${GG-176-k*26}" width="120" height="22" rx="4" fill="#0b0b0b" stroke="#fff" stroke-width="3"/>`);[0,1,2].forEach(k=>{const p=P(T,at(56,.6+k*.5),.3);if(p>0)check(1300+k*90,440,1*back(p));});},'START STUDYING CONSISTENTLY');
  panel(57,()=>{checklist(['WAKE EARLY','TRAIN','READ'].map((x,k)=>({text:x,ok:true,t:at(57,0),mark:at(57,.5+k*.6)})),{x:660,y:330,w:600,rowH:110,t0:at(57,0)});},'START NEW HABITS');
});
/* ---- 58-60 distance vs the next step ---- */
B(58,61,()=>{
  SHOT(at(58,-.35),at(59),[[at(58,-.35),960,500,.95,0],[at(59),960,480,.9,0]],()=>{mountain(1300,GG,1300,700);ground(GG,1,{op:.5});icon('flag',1430,GG-740,1.1);actor(420,GG,.9,'slump',{});const p=P(T,at(58,.6),1.2);
    if(p>0){add(`<line x1="480" y1="${GG-60}" x2="${480+(940)*p}" y2="${GG-60-640*p}" stroke="#fff" stroke-opacity=".6" stroke-width="4" stroke-dasharray="10 10"/>`);}label(900,GG-420,'THE DISTANCE',{size:24,op:.8*p,weight:900});});
  // tilt down to one glowing step at the figure's feet
  SHOT(at(59),at(60),[[at(59),900,500,1.0,0],[at(59,1.2),560,720,2.0,0]],()=>{mountain(1300,GG,1300,700,.35);ground(GG,1,{op:.5});const p=P(T,at(59,.4),.5);add(`<rect x="470" y="${GG-50}" width="220" height="50" rx="8" fill="${p>0?'#1d1406':'#0b0b0b'}" stroke="${AMBER}" stroke-width="${5+p*3}" filter="url(#glow)"/>`);
    actor(420,GG,.9,'idle',{});TXT(()=>big(at(59,.6),'THE NEXT STEP.',{y:250,size:96,outAt:at(60,-.3)}));cue('ting',at(59,.4),.5);});
  // wishing vs building: a shooting star passes; the figure turns away and lays a brick
  SHOT(at(60),1e9,[[at(60),960,520,1.0,0],[at(61,-.35),960,560,1.15,0]],()=>{for(let k=0;k<40;k++)add(`<circle cx="${(k*211)%1920}" cy="${130+(k*97)%500}" r="${k%5?1.5:3}" fill="#fff" opacity=".5"/>`);
    const s=P(T,at(60,.3),1.0);if(s>0&&s<1){const x=lerp(300,1500,s),y=lerp(200,360,s);add(`<line x1="${x-180}" y1="${y-24}" x2="${x}" y2="${y}" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="${1-s}"/>`);}
    ground(GG,1,{op:.5});const b=P(T,at(60,2.2),.1);actor(900,GG,1,b>0?'idle':'think',{arm:b>0?[80,20]:null});for(let k=0;k<5;k++)brick(1060+k*124,GG-30,118,56,at(60,2.4)+k*.25,{vol:.4});
    TXT(()=>big(at(60,3.0),'BUILD IT.',{y:260,size:110,outAt:at(61,-.4)}));});
});
/* ---- 61-66 looking back — regret (cold, slow) ---- */
B(61,67,()=>{
  SHOT(at(61,-.35),at(62),[[at(61,-.35),960,540,1.0,0],[at(62),960,540,1.08,0]],()=>{orb(960,540,7,.8);TXT(()=>head(at(61,.1),'REMEMBER THIS',{y:440,size:34}));});
  // the older you, in a chair, holding a photo of today
  SHOT(at(62),at(63),[[at(62),900,560,1.2,0],[at(63),860,560,1.35,0]],()=>{room(GG,true);chair(700,GG,1);g_(`transform="translate(0,-40)"`,()=>person(680,GG,.95,{ring:false,arm:[80,-60]}));add(`<rect x="760" y="${GG-260}" width="120" height="150" rx="6" fill="#0b0b0b" stroke="#fff" stroke-width="4" transform="rotate(-8,820,${GG-185})"/>`);
    g_(`transform="translate(820,${GG-130}) scale(.35) translate(-820,${-(GG-130)})"`,()=>person(820,GG-130,1,{ring:false}));label(820,GG-100,'TODAY',{size:14,op:.8});label(700,GG+60,'ONE DAY',{size:22,op:.75,weight:900});});
  // regret montage — desaturated, slow
  SHOT(at(63),at(64),[[at(63),960,540,1.3,0],[at(64),960,540,1.4,0]],()=>{ground(GG,1,{op:.3});actor(800,GG,1,'slump',{op:.6});['TOMORROW','NOT NOW','NEXT WEEK'].forEach((t,i)=>pop(at(63,.1+i*.35),1000+i*170,GG-300+i*60,()=>bubble(1000+i*170,GG-300+i*60,190,t,{size:16}),{snd:'pop',vol:.2}));grey(1);});
  SHOT(at(64),at(65),[[at(64),700,560,1.2,0],[at(65),1300,560,1.2,0,'lin']],()=>{ground(GG,1,{op:.3});[600,1000,1400].forEach((x,k)=>{const c=P(T,at(64,.2+k*.4),.3);door(x,GG,.5*(1-c));});actor(lerp(500,1500,P(T,at(64),1.6)),GG,1,'walk',{op:.6});grey(1);});
  SHOT(at(65),at(66),[[at(65),900,580,1.4,0],[at(66),900,600,1.55,0]],()=>{ground(GG,1,{op:.3});icon('couch',900,GG-70,3.2);actor(900,GG-70,1,'slump',{op:.7});phoneGlow(1000,GG-220,.6);grey(1.2);});
  SHOT(at(66),1e9,[[at(66),960,560,1.05,0],[at(67,-.35),960,580,1.15,0]],()=>{ground(GG,1,{op:.3});actor(960,GG,1.2,'slump',{});for(let k=0;k<3;k++)add(`<rect x="${880-k*6}" y="${GG-260-k*50}" width="${160+k*12}" height="44" rx="6" fill="#0b0b0b" stroke="#fff" stroke-opacity=".6" stroke-width="3"/>`);grey(1.4);});
});
/* ---- 67-70 proud (warm, rising) ---- */
B(67,71,()=>{
  SHOT(at(67,-.35),at(68),[[at(67,-.35),960,560,1.2,0],[at(68),960,540,1.0,0]],()=>{sunrise(960,GG,160,P(T,at(67),2));ground(GG,1,{op:.5});actor(960,GG,1.1,'idle',{sil:true});warm(1);});
  // scared at the edge — leaps, bricks form a bridge under each step
  SHOT(at(68),at(69),[[at(68),760,600,1.3,0],[at(69),1200,600,1.3,0]],()=>{add(`<path d="M0,${GG} L640,${GG} L640,1100 M1500,${GG} L1920,${GG}" stroke="#fff" stroke-width="5" fill="none" filter="url(#glowS)"/>`);const u=P(T,at(68,.4),1.5);
    for(let k=0;k<7;k++)brick(700+k*120,GG+27,114,52,at(68,.4)+k*.2,{vol:.3,fall:300,hi:true});actor(lerp(580,1500,u),GG,1,u>0?'run':'crouch',{});warm(1);TXT(()=>head(at(68,.1),'SCARED — STARTED ANYWAY',{y:190,size:28}));});
  SHOT(at(69),at(70),[[at(69),900,560,1.2,0],[at(70),1100,560,1.25,0,'lin']],()=>{rain(1);for(let k=0;k<3;k++)streetLight(400+k*600-(T-at(69))*120,GG);ground(GG,1,{op:.5});actor(960,GG,1.1,'run',{});warm(1);TXT(()=>head(at(69,.1),'KEPT GOING',{y:190,size:28}));});
  // tears the waiting ticket and walks out into the light
  SHOT(at(70),1e9,[[at(70),960,560,1.3,0],[at(71,-.35),1150,560,1.1,0]],()=>{ground(GG,1,{op:.45});const t=P(T,at(70,.5),.3);if(t<1)ticket(860,GG-260,1,'#999',-6);else{ticket(800,GG-200+P(T,at(70,.8),.8)*230,.5,'#9',-40);ticket(920,GG-200+P(T,at(70,.8),.8)*230,.5,'99',30);}cue('nope',at(70,.5),.4);
    door(1400,GG,1);add(`<polygon points="1310,${GG} 1490,${GG} 1920,${GG+170} 900,${GG+170}" fill="#fff" opacity=".18"/>`);actor(lerp(900,1400,P(T,at(70,1.2),2)),GG,1,'walk',{});warm(1);});
});
/* ---- 71-74 nobody will do it for you ---- */
B(71,75,()=>{
  SHOT(at(71,-.35),at(72),[[at(71,-.35),960,520,1.0,0],[at(72),960,520,1.1,0]],()=>{blueprint(.6);ground(GG,1,{op:.45});tower(960,GG,6,1,{ghost:true});alarm(1500,GG-80,1.3,true);TXT(()=>stamp(at(71,.4),960,330,'NOBODY',{size:90}));label(960,GG+60,'BUILDS YOUR DREAM FOR YOU',{size:22,op:.8,weight:900});});
  SHOT(at(72),at(73),[[at(72),960,540,1.2,0],[at(73),960,540,1.3,0]],()=>{clockSpin(1380,400,1.2,14);ground(GG,1,{op:.45});actor(760,GG,1.1,'type',{});deskL(860,GG,true);TXT(()=>stamp(at(72,.3),960,250,'NOBODY',{size:80}));label(1380,560,'YOUR HOURS',{size:20,op:.8,weight:900});});
  SHOT(at(73),at(74),[[at(73),960,560,1.3,0],[at(74),960,560,1.4,0]],()=>{ground(GG,1,{op:.45});fork(960,GG,1,{l:'EASY',r:'HARD',pick:0});actor(960,GG,1,'think',{});TXT(()=>stamp(at(73,.3),960,250,'NOBODY',{size:80}));});
  // low-angle hero with the key
  SHOT(at(74),1e9,[[at(74),960,700,1.6,0],[at(75,-.35),960,620,1.3,0]],()=>{add(`<circle cx="960" cy="400" r="460" fill="url(#bk)" fill-opacity=".25"/>`);ground(GG,1,{op:.5});spotlight(960,GG,1.3,1);actor(960,GG,1.4,'idle',{arm:[70,-150]});keyIcon(1060,GG-400,.7,1);TXT(()=>big(at(74,.2),'IT BELONGS TO YOU.',{y:230,size:90,outAt:at(75,-.4)}));});
});
/* ---- 75-78 not afraid; most powerful; no guarantee ---- */
B(75,77,()=>{
  // a looming shadow monster… is just your own shadow, then it turns to light
  SHOT(at(75,-.35),at(76),[[at(75,-.35),960,540,1.0,0],[at(76),960,540,1.1,0]],()=>{ground(GG,1,{op:.45});const p=P(T,at(75,1.0),.8);add(`<g opacity="${1-p}"><circle cx="1100" cy="300" r="150" fill="#161616" stroke="#fff" stroke-opacity=".6" stroke-width="5"/><rect x="920" y="440" width="360" height="${GG-440}" rx="160" fill="#161616" stroke="#fff" stroke-opacity=".6" stroke-width="5"/><circle cx="1050" cy="290" r="14" fill="#fff"/><circle cx="1150" cy="290" r="14" fill="#fff"/><text x="1100" y="620" font-size="54" font-weight="900" fill="#fff" fill-opacity=".8" text-anchor="middle" letter-spacing="8">FEAR</text></g>`);
    if(p>0)add(`<circle cx="1100" cy="500" r="${300*p}" fill="${AMBER}" opacity="${.18*p}" filter="url(#blur30)"/>`);actor(800,GG,1,'idle',{});add(`<polygon points="0,0 300,0 900,${GG} 700,${GG}" fill="url(#cone)" opacity=".6"/>`);});
  SHOT(at(76),1e9,[[at(76),960,600,1.5,0],[at(77,-.35),960,560,1.2,0]],()=>{add(`<circle cx="960" cy="400" r="500" fill="${AMBER}" opacity=".12" filter="url(#blur30)"/>`);ground(GG,1,{op:.5});actor(960,GG,1.4,'cheer',{});keyIcon(960,GG-420,.6,1);
    for(let k=0;k<16;k++){const a=k*Math.PI/8+T*.4;add(`<line x1="${960+Math.cos(a)*220}" y1="${380+Math.sin(a)*220}" x2="${960+Math.cos(a)*(300+40*Math.sin(T*6+k))}" y2="${380+Math.sin(a)*(300+40*Math.sin(T*6+k))}" stroke="#fff" stroke-opacity=".5" stroke-width="4" stroke-linecap="round"/>`);}
    TXT(()=>big(at(76,.4),'YOUR MOST POWERFUL OPPORTUNITY.',{y:220,size:64,outAt:at(77,-.4)}));flash(at(76,.3),.25);cue('impact',at(76,.3),.6);});
});
B(77,79,()=>{
  SHOT(at(77,-.35),at(78),[[at(77,-.35),960,520,1.4,0],[at(78),960,520,1.55,0]],()=>{const f=P(T,at(77,.1),1.1);const ph=f*Math.PI*7;const sy=Math.abs(Math.cos(ph));const y=520-Math.sin(f*Math.PI)*240;add(`<ellipse cx="960" cy="${y}" rx="120" ry="${Math.max(10,120*sy)}" fill="#0b0b0b" stroke="${AMBER}" stroke-width="7" filter="url(#glowS)"/>`);if(sy>.5)label(960,y+18*sy,'?',{size:60*sy,op:1,weight:900,fill:AMBER});TXT(()=>head(at(77,.1),'NO GUARANTEES',{y:190,size:30}));});
  // refusing to try: an empty plot, the meter reads 0%
  SHOT(at(78),1e9,[[at(78),960,560,1.1,0],[at(79,-.35),960,560,1.25,0]],()=>{blueprint(.5);ground(GG,1,{op:.4});for(let c=0;c<6;c++)add(`<rect x="${600+c*126}" y="${GG-56}" width="118" height="52" rx="8" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="3" stroke-dasharray="8 8"/>`);
    TXT(()=>{const p=P(T,at(78,1.0),.3);if(p>0){title(960,420,'0%',{size:200*lerp(1.4,1,eo(p)),op:p});cue('hit',at(78,1.0),.5);}});label(960,GG+60,'REFUSING TO TRY',{size:22,op:.8,weight:900});});
});
/* ---- 79-81 STOP ×3 ---- */
B(79,82,()=>{
  SHOT(at(79,-.35),at(80),[[at(79,-.35),960,540,1.3,0],[at(80),960,540,1.45,0]],()=>{const t=P(T,at(79,.5),.3);[-1,1].forEach(s=>add(`<g transform="translate(${s*t*90},${t*20}) rotate(${s*t*10},960,520)"><rect x="${s<0?720:960}" y="380" width="240" height="280" fill="#0b0b0b" stroke="#fff" stroke-width="5"/></g>`));label(960,530,'PERMISSION',{size:30,op:1-t,weight:900});TXT(()=>stamp(at(79,.2),960,250,'STOP WAITING',{size:64,col:AMBER}));cue('nope',at(79,.55),.5);});
  SHOT(at(80),at(81),[[at(80),960,540,1.4,3],[at(81),960,540,1.55,3]],()=>{clockSpin(960,520,2,20);label(960,760,'THE PERFECT MOMENT',{size:30,op:1,weight:900});TXT(()=>stamp(at(80,.2),960,250,'STOP WAITING',{size:64,col:AMBER}));},{whip:true});
  // the loop: the figure runs round a circular track… then breaks out of it
  SHOT(at(81),1e9,[[at(81),960,540,1.1,0],[at(82,-.35),1200,540,1.2,0]],()=>{const br=P(T,at(81,2.8),1.0);add(`<circle cx="960" cy="540" r="260" fill="none" stroke="#fff" stroke-width="10" stroke-opacity="${1-br*.7}" filter="url(#glowS)"/>`);
    const a=(T-at(81))*2.4;if(br<=0){const x=960+Math.cos(a)*260,y=540+Math.sin(a)*260;g_(`transform="rotate(${a*57.3+90},${x},${y})"`,()=>actor(x,y,.7,'run',{}));}else{const x=lerp(1220,1860,br);speed(1);actor(x,540,.9,'run',{});}
    [0,1,2].forEach(k=>add(`<path d="M${960+Math.cos(k*2.1)*300},${540+Math.sin(k*2.1)*300} l18,-10 l2,22 Z" fill="#fff" opacity="${.6*(1-br)}"/>`));label(960,550,'SAME DECISIONS',{size:22,op:.75*(1-br),weight:900});if(br>0)flash(at(81,2.8),.3);cue('impact',at(81,2.8),.6);});
});
/* ---- 82-83 built right now — the finale reveal ---- */
B(82,84,()=>{
  SHOT(at(82,-.35),at(83),[[at(82,-.35),960,700,1.4,0],[at(83),960,520,1.0,0,'lin']],()=>{blueprint(1);ground(GG,1,{op:.5});const p=P(T,at(82,-.2),2.6);tower(960,GG,6,p,{lit:p});actor(700,GG,1,'cheer',{});for(let k=0;k<6;k++)cue('brick',at(82,-.2)+k*.43,.5);});
  SHOT(at(83),1e9,[[at(83),960,560,1.15,0],[at(84,-.35),960,440,.9,0]],()=>{sunrise(1500,GG-40,140,1);ground(GG,1,{op:.5});for(let k=0;k<4;k++)tower(260+k*220,GG,2+k%3,1,{w:160,fh:70,lit:.5});tower(1120,GG,5,1,{lit:1});
    door(1120,GG,1);actor(1120,GG,.9,'cheer',{});warm(1.4);TXT(()=>big(at(83,.6),'ONE YOU WANT TO LIVE IN.',{y:205,size:70,outAt:at(84,-.4)}));});
});
/* ---- 84-85 end card ---- */
B(84,85,()=>{
  SHOT(at(84,-.35),1e9,[[at(84,-.35),960,540,1.1,0],[at(85)+4,960,540,1.0,0]],()=>{blueprint(.7);const u=P(T,at(84,-.2),.8);for(let k=0;k<14;k++)brick(330+k*90,640,84,44,at(84,-.2)+k*.04,{vol:.06,fall:200,hi:k%4===0});
    TXT(()=>{pop(at(84),960,420,()=>title(960,450,'THE NEXT VERSION.',{size:120}),{snd:'impact',d:.5});ring(960,450,at(84,.05),{r0:80,r1:800,d:1,op:.5});fadeIn(at(85),()=>label(960,540,'YOUR NEXT CHAPTER STARTS NOW',{size:30,op:.95,weight:900}));
      const fin=P(T,L[85].e+1.6,.8);if(fin>0)add(`<rect width="1920" height="1080" fill="#000" opacity="${fin}"/>`);});warm(1);});
});
/* ---------- assemble ---------- */
(function(){const list=BEATS.map((b,k)=>({s:k===0?0:L[b.s].s-.35,draw:b.fn,cam:b.cam}));list.forEach((x,k)=>{const e=k<list.length-1?list[k+1].s:END;S.push({s:x.s,e,draw:x.draw,cam:{zoom:0}});});})();
window.AFTER=t=>{add(`<rect x="0" y="0" width="1920" height="118" fill="#000"/><rect x="0" y="962" width="1920" height="118" fill="#000"/>`);subtitles(t);};
