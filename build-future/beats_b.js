/* ================= SCENES ================= */
const gy_=GG;
/* ---- 0-1 HOOK: a brick slams down; a tower builds itself; YOU ---- */
B(0,2,()=>{
  // ECU low angle: a glowing brick drops into frame, impact + shake
  SHOT(0,1.25,[[0,960,640,1.9,-4],[1.25,960,640,2.1,-4]],()=>{ground(GG,1,{op:.5});brick(960,GG-60,360,120,.05,{lab:'YOU',hi:true,fall:900,vol:.9,lsize:52});dust(960,GG,.35,22,260);cue('impact',.33,.9);flash(.34,.35);},{shake:0});
  // fast time-lapse crane: a wall becomes a tower around the figure, camera rises
  SHOT(1.25,at(0,2.0),[[1.25,960,700,1.25,0],[at(0,2.0),960,470,1.0,0,'lin']],()=>{blueprint(.8);ground(GG,1,{op:.5});
    for(let r=0;r<9;r++)for(let c=0;c<5;c++){const k=r*5+c;brick(720+c*122+(r%2?61:0)-(r%2&&c==4?9999:0),GG-30-r*62,116,56,1.3+k*.035,{vol:.12,fall:200});}
    {const rows=clamp(Math.floor((T-1.3)/(5*.035)),0,9);actor(960,GG-rows*62,1,rows<9?'crouch':'cheer',{});}TXT(()=>head(1.4,'ONLY ONE PERSON CAN BUILD YOUR FUTURE',{y:180,size:30}));});
  // smash zoom on the figure pointing at camera — YOU.
  SHOT(at(0,2.0),at(1),[[at(0,2.0),960,560,1.0,0],[at(0,2.25),960,560,1.9,0],[at(1),960,560,2.0,0]],()=>{add(`<circle cx="960" cy="540" r="420" fill="url(#bk)" fill-opacity=".2"/>`);spotlight(960,700,1.2,1);actor(960,700,1.4,'point',{arm:[30,-60]});
    TXT(()=>big(at(0,2.1),'YOU.',{y:330,size:170,outAt:at(1,-.1),vol:.9}));},{shake:2});
  // title: THE NEXT VERSION — bricks assemble behind the letters
  SHOT(at(1),1e9,[[at(1),960,540,1.15,0],[at(1)+2.2,960,540,1.0,0]],()=>{blueprint(.6);const u=P(T,at(1),.9);
    for(let k=0;k<22;k++){const x=420+(k%11)*110,y=600+Math.floor(k/11)*66;brick(x,y,100,58,at(1)+k*.02,{vol:.05,fall:180});}
    TXT(()=>{pop(at(1,.1),960,420,()=>title(960,450,'THE NEXT VERSION.',{size:120}),{snd:'impact',d:.4});ring(960,520,at(1,.15),{r0:80,r1:700,d:.9,op:.5});});});
});
/* ---- 2-4 somewhere in the world ---- */
B(2,3,()=>{
  // black void, a single light — push in
  SHOT(at(2,-.35),at(3),[[at(2,-.35),960,540,1.0,0],[at(3),960,540,1.25,0]],()=>{const u=P(T,at(2),1.2);add(`<circle cx="960" cy="540" r="${40+u*30}" fill="url(#bk)" fill-opacity=".35"/>`);orb(960,540,10,1);TXT(()=>head(at(2,.1),'THINK ABOUT THIS',{y:330,size:30}));});
  // the globe spins, a pin drops
  SHOT(at(3),at(3,2.4),[[at(3),960,540,.9,0],[at(3,2.4),1040,480,1.6,0]],()=>{globe(960,540,300,T*.6);const p=P(T,at(3,1.2),.35);if(p>0){const y=lerp(150,440,eo(p));add(`<path d="M1040,${y} c-30,-40 -30,-80 0,-80 c30,0 30,40 0,80 Z" fill="${AMBER}" filter="url(#glowS)"/><circle cx="1040" cy="${y-56}" r="10" fill="#000"/>`);if(p>=1)ring(1040,440,at(3,1.55),{r0:10,r1:120,d:.7,op:.8});}cue('pop',at(3,1.5),.6);TXT(()=>head(at(3,.2),'SOMEWHERE IN THE WORLD',{y:200,size:30}));});
  // crash zoom: a small figure in a bare room, compared bar by bar
  SHOT(at(3,2.4),at(4),[[at(3,2.4),960,540,1.0,0]],()=>{ground(GG,1,{op:.4});windowNight(380,400);personOutline(420,GG,1.2,1);label(420,GG+50,'THEM',{size:22,op:.8,weight:900});
    const rows=[['TALENT',.75,.45],['MONEY',.8,.3],['OPPORTUNITIES',.85,.35]];rows.forEach(([n,a,b],i)=>{const t0=at(3,2.6+i*1.0);const p=eo(P(T,t0,.5));label(760,300+i*170,n,{size:24,op:.9,weight:900,anchor:'start'});
      add(`<rect x="760" y="${320+i*170}" width="${900*a*p}" height="34" rx="17" fill="#fff" opacity=".9"/><rect x="760" y="${366+i*170}" width="${900*b*p}" height="34" rx="17" fill="${AMBER}"/>`);if(p>0)cue('tick',t0,.5);
      label(760+900*a*p+50,350+i*170,'YOU',{size:18,op:p,weight:900});label(760+900*b*p+56,396+i*170,'THEM',{size:18,op:p,weight:900,fill:AMBER});});});
});
B(4,5,()=>{
  // your dream floats in a bubble while you sleep…
  SHOT(at(4,-.35),at(4,1.4),[[at(4,-.35),900,560,1.25,0],[at(4,1.4),940,540,1.35,0]],()=>{room(GG);bed(760,GG);sleeper(760,GG,1);zzz(600,GG-230,.6);
    const p=P(T,at(4,0),.5);add(`<g opacity="${p}"><circle cx="1180" cy="380" r="150" fill="#0b0b0b" stroke="#fff" stroke-width="4" filter="url(#glowS)"/><circle cx="1020" cy="560" r="16" fill="none" stroke="#fff" stroke-width="3"/><circle cx="990" cy="620" r="9" fill="none" stroke="#fff" stroke-width="3"/></g>`);icon('trophy',1180,370,1.6,p);});
  // …match cut: the same trophy, lifted by someone else
  SHOT(at(4,1.4),at(5),[[at(4,1.4),960,520,1.6,0],[at(5),960,520,1.25,0]],()=>{add(`<circle cx="960" cy="420" r="380" fill="url(#bk)" fill-opacity=".2"/>`);spotlight(960,GG,1.2,1);personOutline(960,GG,1.6,1);icon('trophy',960,lerp(330,260,eo(P(T,at(4,1.5),.6))),1.6);
    for(let k=0;k<30;k++){const x=500+(k*137)%920,y=((k*97+T*160)%800)+120;add(`<rect x="${x}" y="${y}" width="10" height="16" fill="${k%3?'#fff':AMBER}" opacity=".7" transform="rotate(${k*40+T*200},${x},${y})"/>`);}cue('win',at(4,1.5),.5);flash(at(4,1.4),.3);});
});
/* ---- 5-7 not luckier / not special / decided ---- */
B(5,8,()=>{
  SHOT(at(5,-.35),at(6),[[at(5,-.35),960,540,1.5,0],[at(6),960,540,1.7,0]],()=>{const r=P(T,at(5,-.2),.8);[0,1].forEach(i=>{const x=840+i*240;g_(`transform="rotate(${(1-eo(r))*720*(i?1:-1)},${x},520)"`,()=>{add(`<rect x="${x-80}" y="440" width="160" height="160" rx="26" fill="#0b0b0b" stroke="#fff" stroke-width="6" filter="url(#glowS)"/>`);[[-40,-40],[40,40],[0,0]].forEach(([a,b])=>add(`<circle cx="${x+a}" cy="${520+b}" r="13" fill="#fff"/>`));});});
    TXT(()=>{head(at(5,0),'LUCK',{y:300,size:34});stamp(at(5,.75),960,540,'NO',{size:110,col:AMBER});});});
  SHOT(at(6),at(7),[[at(6),960,520,1.5,3],[at(7),960,520,1.65,3]],()=>{add(`<circle cx="960" cy="500" r="240" fill="url(#bk)" fill-opacity=".2"/>`);icon('star',960,500,4);TXT(()=>{head(at(6,0),'SPECIAL',{y:300,size:34});stamp(at(6,.8),960,540,'NO',{size:110,col:AMBER});});});
  // they decided: a start line, the outline figure explodes into a sprint (slow-mo then speed)
  SHOT(at(7),1e9,[[at(7),760,620,1.6,0],[at(7,1.3),760,620,1.7,0],[at(7)+3.4,1400,600,1.3,0]],()=>{ground(GG,1,{op:.5});add(`<rect x="700" y="${GG-4}" width="16" height="8" fill="#fff"/><rect x="760" y="${GG-4}" width="16" height="8" fill="#fff"/>`);label(740,GG+44,'START',{size:20,op:.8});
    const u=P(T,at(7,1.2),2.2);const px=lerp(740,1800,u*u);if(u>0)speed(Math.min(1,u*3));g_(`opacity="1"`,()=>actor(px,GG,1.1,u>0?'run':'crouch',{}));
    TXT(()=>big(at(7,.9),'THEY DECIDED.',{y:300,size:100,outAt:at(8,-.4)}));if(u>0)cue('whoosh',at(7,1.2),.6);});
});
/* ---- 8 the uncomfortable truth ---- */
B(8,9,()=>{
  SHOT(at(8,-.35),1e9,[[at(8,-.35),960,540,1.0,-6],[at(9,-.35),960,540,1.12,-7]],()=>{const fl=Math.sin(T*37)>.93?.4:1;add(`<polygon points="900,0 1020,0 1200,${GG} 720,${GG}" fill="url(#cone)" opacity="${.8*fl}"/>`);ground(GG,1,{op:.5});actor(960,GG,1.3,'idle',{});
    TXT(()=>{const p=P(T,at(8,.6),.3);if(p>0){const j=(Math.sin(T*90)>.8)?8:0;add(`<g opacity="${p}">`);title(960+j,330,'THE UNCOMFORTABLE',{size:84});title(960-j,430,'TRUTH',{size:120});add('</g>');cue('hit',at(8,.65),.6);}});});
});
/* ---- 9-11 NOBODY ×3 ---- */
B(9,12,()=>{
  SHOT(at(9,-.35),at(10),[[at(9,-.35),960,600,1.4,0],[at(10),1000,600,1.5,0]],()=>{blueprint(.5);ground(GG,1,{op:.5});for(let c=0;c<6;c++)add(`<rect x="${600+c*126}" y="${GG-56}" width="118" height="52" rx="8" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-dasharray="8 8"/>`);
    hammer(1460,GG-30,1,90);actor(560,GG,1.2,'idle',{arm:[70,-10]});brick(640,GG-150,110,50,-9);TXT(()=>stamp(at(9,.3),960,330,'NOBODY',{size:90}));label(960,GG+60,'THE WORK',{size:22,op:.8,weight:900});});
  SHOT(at(10),at(11),[[at(10),960,540,1.6,-3],[at(11),960,540,1.75,-3]],()=>{room(GG,true);bed(860,GG);sleeper(860,GG,1);alarm(1150,GG-260,1.6,true);TXT(()=>stamp(at(10,.2),960,330,'NOBODY',{size:90}));label(960,GG+60,'CAN FORCE YOU',{size:22,op:.8,weight:900});});
  SHOT(at(11),1e9,[[at(11),960,540,1.3,0],[at(11)+3,960,500,1.05,0]],()=>{mountain(1260,GG,1100,620);ground(GG,1,{op:.5});actor(520,GG,1,'idle',{});add(`<path d="M520,${GG-170} q200,-260 820,-430" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-dasharray="6 14" fill="none"/>`);
    icon('flag',1370,GG-660,1);TXT(()=>stamp(at(11,.2),760,330,'NOBODY',{size:90}));label(520,GG+60,'CHASES IT FOR YOU',{size:22,op:.8,weight:900});});
});
/* ---- 12-15 people can help… but cannot live your life ---- */
B(12,16,()=>{
  SHOT(at(12,-.35),at(13),[[at(12,-.35),960,560,1.3,0],[at(13),960,560,1.4,0]],()=>{ground(GG,1,{op:.4});actor(960,GG,1.1,'think',{});[[620,'DO THIS'],[1300,'TRY THAT']].forEach(([x,t],i)=>{personOutline(x,GG,1,.8);pop(at(12,.2+i*.3),x,GG-280,()=>bubble(x,GG-300,200,t,{size:18,tail:i?'right':'left'}),{snd:'pop',vol:.3});});});
  SHOT(at(13),at(14),[[at(13),1000,540,1.5,0],[at(14),1000,540,1.6,0]],()=>{ground(GG,1,{op:.4});const o=P(T,at(13,.3),.7);door(1000,GG,o);if(o>0)add(`<polygon points="910,${GG} 1090,${GG} 1400,${GG+160} 600,${GG+160}" fill="#fff" opacity="${.12*o}"/>`);personOutline(1180,GG,1,.8);actor(800,GG,1,'idle',{});});
  SHOT(at(14),at(15),[[at(14),960,560,1.3,0],[at(15),960,560,1.4,0]],()=>{ground(GG,1,{op:.4});actor(960,GG,1.1,'slump',{});personOutline(800,GG,1,.85);personOutline(1120,GG,1,.85);add(`<path d="M840,${GG-150} q50,-30 90,-20 M1080,${GG-150} q-50,-30 -90,-20" stroke="#fff" stroke-width="10" stroke-linecap="round" fill="none"/>`);});
  // OTS from behind: the helpers fade, the door is yours alone
  SHOT(at(15),1e9,[[at(15),960,560,1.1,0],[at(15)+2.4,960,520,1.3,0]],()=>{ground(GG,1,{op:.4});const f=1-P(T,at(15,.3),1.0);door(960,GG,.35);personOutline(700,GG,1,.8*f);personOutline(1220,GG,1,.8*f);fgShoulder(960,1130,1.2);
    TXT(()=>big(at(15,.9),'NOT YOUR LIFE.',{y:250,size:90,outAt:at(16,-.4)}));});
});
/* ---- 16-19 waiting ---- */
B(16,20,()=>{
  // the waiting room: a row of people, the clock spins
  SHOT(at(16,-.35),at(17),[[at(16,-.35),960,560,1.0,0],[at(17),960,560,1.15,0]],()=>{ground(GG,1,{op:.4});for(let k=0;k<6;k++){chair(420+k*220,GG,1);g_(`transform="translate(0,-40)"`,()=>person(400+k*220,GG,.85,{ring:false,arm:[30,50],op:k===3?1:.55}));}clockSpin(960,260,1,9);label(960,390,'WAITING ROOM',{size:20,op:.7});});
  SHOT(at(17),at(18),[[at(17),960,480,1.7,0],[at(18),960,480,1.85,0]],()=>{add(`<rect x="620" y="240" width="680" height="200" rx="18" fill="#0b0b0b" stroke="#fff" stroke-width="5" filter="url(#glowS)"/>`);label(960,300,'NOW SERVING',{size:26,op:.75,weight:900});title(960,410,Math.sin(T*30)>0?'— —':'0 0 1',{size:84});ticket(1080,640,1.1,'#999',8);label(960,770,'RIGHT OPPORTUNITY',{size:20,op:.7});});
  SHOT(at(18),at(19),[[at(18),960,560,1.3,0],[at(19),960,560,1.4,0]],()=>{ground(GG,1,{op:.4});actor(960,GG,1.1,'idle',{arm:[40,-120],arm2:[-40,-120]});add(`<rect x="840" y="${GG-410}" width="240" height="100" rx="8" fill="#0b0b0b" stroke="#fff" stroke-width="4"/>`);label(960,GG-350,'BELIEVE IN ME?',{size:20,op:1,weight:900});
    for(let k=0;k<6;k++){const x=k<3?300+k*120:1380+(k-3)*120;personOutline(x+Math.sin(T*.6+k)*20,GG,.9,.45);}});
  // time-lapse: meters never fill, the seasons pass outside the window
  SHOT(at(19),1e9,[[at(19),960,540,1.0,0],[at(19)+6,960,560,1.2,0,'lin']],()=>{room(GG,false);windowNight(1500,330,0);const sp=(T*1.6)%4;
    if(sp<2)for(let k=0;k<6;k++)add(`<circle cx="${1400+((k*53+T*80)%200)}" cy="${250+((k*71+T*120)%170)}" r="4" fill="#fff" opacity=".7"/>`);
    chair(500,GG,1);g_(`transform="translate(0,-40)"`,()=>person(480,GG,.95,{ring:false,arm:[30,50]}));[['MONEY',0],['CONFIDENCE',1],['MOTIVATION',2]].forEach(([n,i])=>{const v=.25+.2*Math.sin(T*1.3+i*2);meter(760,330+i*120,560,v,n);});
    for(let k=0;k<7;k++)add(`<path d="M${430+k*12},${GG-210} q4,30 -2,60" stroke="#fff" stroke-opacity="${.25*P(T,at(19,2),3)}" stroke-width="1.5" fill="none"/>`);label(960,GG+60,'ENOUGH?',{size:22,op:.75,weight:900});});
});
/* ---- 20-21 what if it never comes? create it ---- */
B(20,22,()=>{
  SHOT(at(20,-.35),at(21),[[at(20,-.35),960,500,1.3,0],[at(21),960,480,2.2,0]],()=>{const st=P(T,at(20,.4),.3);const tt=Math.min(T,at(20,.4));add(`<circle cx="960" cy="480" r="80" fill="#0b0b0b" stroke="#fff" stroke-width="5" filter="url(#glowS)"/>`);
    const a=tt*9;add(`<line x1="960" y1="480" x2="${960+Math.sin(a)*62}" y2="${480-Math.cos(a)*62}" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`);if(st>0)cue('thud',at(20,.4),.6);
    for(let k=0;k<3;k++){const off=P(T,at(20,.6+k*.25),.1);add(`<circle cx="${560+k*400}" cy="200" r="30" fill="#fff" opacity="${.5*(1-off)}"/>`);}});
  // the figure picks up a hammer and builds a door into a blank wall
  SHOT(at(21),1e9,[[at(21),960,560,1.25,0],[at(21,3.0),980,560,1.35,0],[at(21)+5.5,980,560,1.05,0]],()=>{ground(GG,1,{op:.45});
    for(let r=0;r<10;r++)for(let c=0;c<9;c++){const x=520+c*110+(r%2?55:0),y=GG-30-r*62;if(Math.abs(x-990)<120&&y>GG-360&&P(T,at(21,1.6),.1)>0)continue;add(`<rect x="${x-52}" y="${y-28}" width="104" height="56" rx="6" fill="#0b0b0b" stroke="#fff" stroke-opacity=".55" stroke-width="3"/>`);}
    const dr=P(T,at(21,1.6),.5);if(dr>0){drawPath(`M890,${GG} L890,${GG-330} L1090,${GG-330} L1090,${GG}`,dr,{sw:6});}const o=P(T,at(21,2.6),.8);if(o>0){door(990,GG,o);add(`<polygon points="890,${GG} 1090,${GG} 1500,${GG+170} 480,${GG+170}" fill="#fff" opacity="${.15*o}"/>`);}
    const swing=Math.sin(T*14)*30;actor(700,GG,1,'idle',{arm:[70,-40]});if(dr<1)hammer(770,GG-150,.8,-30+swing);for(let k=0;k<6;k++)cue('thunk',at(21,.35+k*.22),.4);
    TXT(()=>big(at(21,2.7),'CREATE IT.',{y:250,size:100,outAt:at(22,-.4)}));});
});
