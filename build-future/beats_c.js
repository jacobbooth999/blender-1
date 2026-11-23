/* ---- 22-24 not a place — something you're building ---- */
B(22,25,()=>{
  SHOT(at(22,-.35),at(23),[[at(22,-.35),960,540,1.0,0],[at(23),960,540,1.1,0]],()=>{orb(960,540,8,.8);TXT(()=>head(at(22,.1),'MOST PEOPLE DON\'T UNDERSTAND THIS',{y:440,size:32}));});
  // tracking: walking a long road to a flag called FUTURE… which dissolves
  SHOT(at(23),at(24),[[at(23),700,560,1.2,0],[at(24),900,560,1.25,0,'lin']],()=>{const off=(T-at(23))*160;add(`<path d="M0,${GG} L1920,${GG}" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>`);
    for(let k=0;k<14;k++){const x=((k*180-off)%2520+2520)%2520-300;add(`<rect x="${x}" y="${GG+30}" width="80" height="8" fill="#fff" opacity=".35"/>`);}
    const fp=1-P(T,at(23,2.3),.5);add(`<g opacity="${fp}">`);icon('flag',1500,GG-180,1.4);label(1500,GG-300,'FUTURE',{size:26,op:1,weight:900});add('</g>');if(fp<1)dust(1500,GG-180,at(23,2.3),18,120);
    actor(700+(T-at(23))*40,GG,1.3,'walk',{});});
  // crane down to a blueprint; the foundation slams in: BUILDING
  SHOT(at(24),1e9,[[at(24),960,300,1.3,0],[at(24,1.0),960,560,1.05,0],[at(25,-.35),960,560,1.1,0]],()=>{blueprint(1.2);ground(GG,1,{op:.5});
    for(let c=0;c<8;c++)brick(530+c*124,GG-30,118,56,at(24,.4)+c*.06,{vol:.3,fall:400});actor(960,GG-62,1,'cheer',{});TXT(()=>big(at(24,.5),'BUILDING.',{y:270,size:110,outAt:at(25,-.4)}));});
});
/* ---- 25-30 every decision: the tower cracks ---- */
B(25,31,()=>{
  SHOT(at(25,-.35),at(26),[[at(25,-.35),960,500,1.0,0],[at(26),960,500,1.1,0]],()=>{blueprint(.8);ground(GG,1,{op:.5});tower(960,GG,6,1,{lit:.6});actor(700,GG,1,'idle',{});TXT(()=>head(at(25,.1),'EVERY DECISION COUNTS',{y:190,size:30}));});
  // ECU scrolling — a brick crumbles each flick
  SHOT(at(26),at(27),[[at(26),960,560,1.0,-2],[at(27),960,560,1.08,-2]],()=>{bigPhone(700,560,.85,(T-at(26))*1.6);hand(260,1200,640,780,80);
    const p=P(T,at(26,.8),.6);brick(1350,500,300,130,-9,{lab:'1 HOUR'});crack(1330,440,1.1,p);if(p>=1){const f=P(T,at(26,1.4),.6);add(`<rect x="1200" y="${435+f*500}" width="140" height="130" rx="8" fill="#0b0b0b" stroke="#fff" stroke-width="4" transform="rotate(${f*30},1270,500)"/>`);}cue('thud',at(26,1.5),.5);});
  // comfort over progress: sinks into the couch, the stairs dim
  SHOT(at(27),at(28),[[at(27),960,580,1.3,0],[at(28),900,600,1.45,0]],()=>{ground(GG,1,{op:.4});const d=P(T,at(27,.4),1.2);add(`<path d="${stairsPath(1150,GG,5,110,70)}" stroke="#fff" stroke-opacity="${1-.7*d}" stroke-width="6" fill="none"/>`);label(1420,GG-400,'PROGRESS',{size:20,op:1-.6*d});
    icon('couch',760,GG-70,3.2);actor(760,GG-70+d*10,1,'slump',{});label(760,GG+60,'COMFORT',{size:22,op:.8,weight:900});});
  // a promise card torn in half
  SHOT(at(28),at(29),[[at(28),960,520,1.6,0],[at(29),960,520,1.75,0]],()=>{const p=eo(P(T,at(28,1.0),.5));[-1,1].forEach(s=>{g_(`transform="translate(${s*p*80},${p*40}) rotate(${s*p*14},960,520)"`,()=>{const id='cp'+(s>0?'r':'l');add(`<clipPath id="${id}"><polygon points="${s<0?'0,0 965,0 945,300 975,520 950,1080 0,1080':'965,0 1920,0 1920,1080 950,1080 975,520 945,300'}"/></clipPath><g clip-path="url(#${id})"><rect x="680" y="380" width="560" height="280" rx="18" fill="#0b0b0b" stroke="#fff" stroke-width="5" filter="url(#glowS)"/></g>`);});});
    label(960-p*80,500+p*20,'I PROMISE',{size:30,op:1-p*.4,weight:900});label(960+p*80,560+p*40,'TO MYSELF',{size:22,op:1-p*.6,weight:900});cue('nope',at(28,1.05),.6);});
  // hourglass ECU
  SHOT(at(29),at(30),[[at(29),960,520,1.3,0],[at(30),960,520,1.5,0]],()=>{add(`<circle cx="960" cy="520" r="300" fill="url(#bk)" fill-opacity=".14"/>`);icon('hourglass',960,520,4.2);for(let k=0;k<12;k++)add(`<circle cx="${960+Math.sin(k)*3}" cy="${470+((k*14+T*140)%100)}" r="3" fill="#fff"/>`);});
  // shaping the person: the figure assembled from tiles goes dim, tiles fall away
  SHOT(at(30),1e9,[[at(30),960,540,1.2,0],[at(31,-.35),960,540,1.0,0]],()=>{const f=P(T,at(30,.3),1.4);const cx=960,hy=330,hr=90;let k=0;
    for(let y=hy-hr;y<=GG;y+=36)for(let x=820;x<=1100;x+=36){const px=x+18,py=y+18;let inside=Math.hypot(px-cx,py-hy)<hr||(py>hy+hr+30&&px>850&&px<1070);if(!inside)continue;k++;const fall=((k*37)%10)/10<f*.6;
      add(`<rect x="${px-15}" y="${py-15+(fall?f*f*400:0)}" width="30" height="30" rx="5" fill="${fall?'none':'#f0f0f0'}" stroke="#fff" stroke-width="2" opacity="${fall?.5*(1-f):.9}"/>`);}
    TXT(()=>big(at(30,.3),'SHAPING WHO YOU BECOME.',{y:240,size:72,outAt:at(31,-.4)}));});
});
/* ---- 31-34 rewind — the opposite direction ---- */
B(31,35,()=>{
  SHOT(at(31,-.35),at(32),[[at(31,-.35),960,540,1.0,0],[at(32),960,540,1.15,0]],()=>{for(let k=0;k<5;k++)add(`<rect x="0" y="${(k*233+T*1400)%1080}" width="1920" height="${4+k%3*3}" fill="#fff" opacity=".1"/>`);
    const r=P(T,at(31,.2),1.6);const cx=960,hy=330,hr=90;let k=0;for(let y=hy-hr;y<=GG;y+=36)for(let x=820;x<=1100;x+=36){const px=x+18,py=y+18;let inside=Math.hypot(px-cx,py-hy)<hr||(py>hy+hr+30&&px>850&&px<1070);if(!inside)continue;k++;const off=((k*37)%10)/10>r?(1-r)*400:0;
      add(`<rect x="${px-15}" y="${py-15+off}" width="30" height="30" rx="5" fill="#f0f0f0" opacity=".9"/>`);}TXT(()=>{label(1700,170,'◀◀ REWIND',{size:28,op:Math.sin(T*8)>0?1:.4,weight:900});});cue('fall',at(31,.1),.5);});
  SHOT(at(32),at(33),[[at(32),760,620,1.6,0],[at(33),760,560,1.3,0]],()=>{room(GG);bed(760,GG);alarm(1080,GG-230,1.1,T<at(32,.6));const u=P(T,at(32,.7),.8);if(u<1)sleeper(760,GG,1);else actor(1000,GG,1.1,'stretch',{});if(u>0&&u<1)flash(at(32,.7),.2);cue('hit',at(32,.7),.5);});
  SHOT(at(33),at(34),[[at(33),1000,560,1.4,0],[at(34),1000,560,1.55,0]],()=>{room(GG,true);deskL(960,GG);actor(860,GG,1.1,'write',{});icon('book',960,GG-200,1.2);TXT(()=>head(at(33,.3),'LEARN — NOT WASTE ANOTHER EVENING',{y:190,size:28}));});
  // empty stands, gym at night, no audience
  SHOT(at(34),1e9,[[at(34),960,520,1.0,0],[at(34)+4.6,960,600,1.4,0]],()=>{for(let r=0;r<3;r++)for(let c=0;c<16;c++)add(`<rect x="${130+c*106}" y="${170+r*60}" width="86" height="40" rx="6" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2.5"/>`);
    ground(GG,1,{op:.5});add(`<polygon points="900,0 1020,0 1220,${GG} 700,${GG}" fill="url(#cone)" opacity=".75"/>`);actor(960,GG,1.3,'lift',{});const u=(Math.sin((T)*2.6)+1)/2;barbell(960,GG-130-lerp(-30,-125,u)*1.3-140,1.3);label(960,GG+60,'NOBODY WATCHING',{size:22,op:.75,weight:900});});
});
/* ---- 35-39 you're building something ---- */
B(35,39,()=>{
  SHOT(at(35,-.35),at(39),[[at(35,-.35),960,640,1.5,0],[at(36),960,600,1.35,0],[at(37),960,520,1.15,0],[at(38),960,440,.95,0],[at(39),960,420,.9,0]],()=>{blueprint(1);ground(GG,1,{op:.5});
    for(let c=0;c<6;c++)brick(650+c*124,GG-30,118,56,-9);
    [['DISCIPLINE',36],['CONFIDENCE',37],['SELF-TRUST',38]].forEach(([n,i],k)=>{brick(960,GG-62-30-k*110,520,100,at(i,.05),{lab:n,hi:true,vol:.6,fall:700,lsize:40});if(T>at(i,.3)&&T<at(i,.5))flash(at(i,.3),.15);});
    actor(660,GG-62,1,'cheer',{});TXT(()=>head(at(35,0),"YOU'RE BUILDING SOMETHING",{y:190,size:30}));});
});
B(39,40,()=>{
  // two futures: the one you have vs the one you could have had
  SHOT(at(39,-.35),1e9,[[at(39,-.35),960,500,1.0,0],[at(40,-.35),960,520,1.08,0]],()=>{blueprint(.6);ground(GG,1,{op:.5});tower(560,GG,2,1,{lit:.3,w:240});tower(1360,GG,6,1,{ghost:true,w:300});const p=P(T,at(39,2),1.4);tower(1360,GG,6,p,{w:300,lit:1});
    label(560,GG+60,'THE LIFE YOU HAVE',{size:20,op:.8,weight:900});label(1360,GG+60,'THE LIFE YOU COULD HAVE',{size:20,op:.8,weight:900,fill:AMBER});
    const ar=P(T,at(39,3.2),.6);if(ar>0){add(`<line x1="760" y1="${GG-180}" x2="${760+380*ar}" y2="${GG-180}" stroke="${AMBER}" stroke-width="6" stroke-dasharray="14 10"/>`);}TXT(()=>big(at(39,3.6),'SMALL DECISIONS.',{y:250,size:84,outAt:at(40,-.4)}));});
});
/* ---- 40-44 what you can't control / what you can ---- */
B(40,44,()=>{
  SHOT(at(40,-.35),at(41),[[at(40,-.35),960,540,1.0,0],[at(41),960,540,1.08,0]],()=>{add(`<circle cx="960" cy="540" r="330" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="4" stroke-dasharray="14 12"/>`);actor(960,700,1,'think',{});
    ['dice','clock','envelope','house','x'].forEach((n,i)=>{const a=T*.25+i*1.256;icon(n,960+Math.cos(a)*480,540+Math.sin(a)*330,1,.55);});TXT(()=>head(at(40,.1),'NOT EVERYTHING IS IN YOUR CONTROL',{y:170,size:28}));});
  SHOT(at(41),at(42),[[at(41),960,540,1.6,0],[at(42),960,540,1.75,0]],()=>{globe(960,540,240,T*.8);TXT(()=>head(at(41,.1),'WHERE YOU\'RE BORN',{y:210,size:30}));});
  SHOT(at(42),at(43),[[at(42),960,560,1.3,0],[at(43),960,560,1.4,0]],()=>{ground(GG,1,{op:.4});const c=P(T,at(42,.5),.5);door(1200,GG,1-c);if(c>0&&c<1)cue('thud',at(42,.95),.5);actor(820,GG,1,'walk',{arm:[90,-10]});TXT(()=>head(at(42,.1),'EVERY OPPORTUNITY',{y:210,size:30}));});
  // the storm: lightning, rain, a boulder rolls in front of the path
  SHOT(at(43),1e9,[[at(43),960,560,1.2,-4],[at(44,-.35),960,560,1.3,-5]],()=>{rain(1.3);const lt=Math.sin(T*3.1)>.97;if(lt)add(`<rect width="1920" height="1080" fill="#fff" opacity=".18"/>`);ground(GG,1,{op:.4});
    const b=P(T,at(43,.6),1.0);const bx=lerp(1700,1150,eo(b));add(`<circle cx="${bx}" cy="${GG-110}" r="110" fill="#0b0b0b" stroke="#fff" stroke-width="5" filter="url(#glowS)" transform="rotate(${-b*200},${bx},${GG-110})"/><path d="M${bx-40},${GG-150} l30,20 l-10,30" stroke="#fff" stroke-width="3" fill="none" transform="rotate(${-b*200},${bx},${GG-110})"/>`);cue('thud',at(43,1.6),.6);
    actor(760,GG,1,'idle',{});TXT(()=>head(at(43,.1),'SETBACKS. OBSTACLES.',{y:210,size:30}));});
});
B(44,45,()=>{
  // the ring collapses around the figure and glows amber: YOUR RESPONSE
  SHOT(at(44,-.35),1e9,[[at(44,-.35),960,560,1.0,0],[at(45,-.35),960,560,1.35,0]],()=>{const p=eo(P(T,at(44,.3),.7));const r=lerp(480,170,p);add(`<circle cx="960" cy="560" r="${r*1.4}" fill="${AMBER}" opacity="${.12*p}" filter="url(#blur30)"/><circle cx="960" cy="560" r="${r}" fill="none" stroke="${p>.9?AMBER:'#fff'}" stroke-width="8" filter="url(#glowS)"/>`);
    actor(960,680,1,p>.9?'cheer':'idle',{});cue('rise',at(44,-.2),.5);if(p>.9)ring(960,560,at(44,1.0),{r0:170,r1:600,d:.8,op:.6});TXT(()=>big(at(44,.9),'HOW YOU RESPOND.',{y:240,size:96,outAt:at(45,-.4)}));});
});
/* ---- 45-47 you decide ---- */
B(45,48,()=>{
  SHOT(at(45,-.35),at(46),[[at(45,-.35),960,560,1.2,0],[at(46),960,500,1.0,0]],()=>{ground(GG,1,{op:.45});add(`<circle cx="760" cy="${GG-14}" r="18" fill="#0b0b0b" stroke="#fff" stroke-width="4"/>`);const fall=P(T,at(45,.2),.4),up=P(T,at(45,2.6),.6);
    if(up<=0)g_(`transform="rotate(${-80*eo(fall)},800,${GG})"`,()=>actor(800,GG,1,'idle',{}));else actor(lerp(800,1000,up),GG,1,up<1?'crouch':'walk',{});cue('thud',at(45,.55),.6);
    if(T>at(45,1.0)){add(`<g opacity="${P(T,at(45,1.0),.4)}">`);fork(1200,GG,1,{l:'QUIT',r:'IMPROVE',pick:up});add('</g>');}if(up>0)add(`<path d="M1200,${GG-120} L1460,${GG-360}" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" filter="url(#glowS)"/>`);});
  // rejection letter → paper plane
  SHOT(at(46),at(47),[[at(46),960,540,1.5,0],[at(47),960,500,1.2,0]],()=>{const f=P(T,at(46,1.6),.4);if(f<1){add(`<g opacity="${1-f}"><rect x="760" y="380" width="400" height="300" rx="12" fill="#0b0b0b" stroke="#fff" stroke-width="5" filter="url(#glowS)"/><line x1="800" y1="440" x2="1100" y2="440" stroke="#fff" stroke-opacity=".4" stroke-width="6"/><line x1="800" y1="480" x2="1060" y2="480" stroke="#fff" stroke-opacity=".4" stroke-width="6"/></g>`);TXT(()=>stamp(at(46,.4),960,580,'REJECTED',{size:56,rot:-10,outAt:at(46,1.5)}));}
    else{const u=P(T,at(46,2.0),1.6);const px=lerp(900,1700,u),py=lerp(560,180,u)-Math.sin(u*Math.PI)*80;add(`<path d="M${px},${py} l-110,30 l40,10 Z M${px},${py} l-70,50 l0,-30 Z" fill="#fff" filter="url(#glowS)" transform="rotate(-18,${px},${py})"/>`);label(px-60,py+90,'LESSON',{size:22,op:1,weight:900,fill:AMBER});cue('whoosh',at(46,2.0),.5);}});
  // circumstances: a pile of rubble becomes a starting block
  SHOT(at(47),1e9,[[at(47),960,600,1.2,0],[at(48,-.35),960,580,1.3,0]],()=>{ground(GG,1,{op:.45});const p=eo(P(T,at(47,2.8),1.0));
    for(let k=0;k<9;k++){const rx=760+(k*83)%380,ry=GG-24-((k*47)%3)*40,rr=(k*53)%50-25;const tx=840+(k%3)*130,ty=GG-30-Math.floor(k/3)*62;add(`<rect x="${lerp(rx,tx,p)-56}" y="${lerp(ry,ty,p)-28}" width="112" height="56" rx="7" fill="#0b0b0b" stroke="${p>.95?AMBER:'#fff'}" stroke-width="4" transform="rotate(${lerp(rr,0,p)},${lerp(rx,tx,p)},${lerp(ry,ty,p)})"/>`);}
    actor(lerp(600,970,p),lerp(GG,GG-186,p),1,p>.95?'point':'slump',{});label(960,GG+60,p<.5?'PERMANENT EXCUSE?':'THE STARTING POINT',{size:22,op:.85,weight:900,fill:p<.5?'#fff':AMBER});cue('rise',at(47,2.6),.5);});
});
