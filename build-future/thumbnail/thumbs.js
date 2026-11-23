/* three thumbnail designs rendered at t=0.5 / 1.5 / 2.5 (brick() needs T past its t0, so props use t0=-9) */
S.length=0;window.AFTER=null;
function T_(x,y,t,size,{anchor='start',fill='#fff',sp=0}={}){add(`<text x="${x}" y="${y}" font-size="${size}" font-weight="900" letter-spacing="${size*sp}" fill="${fill}" text-anchor="${anchor}" stroke="#000" stroke-width="${size*.06}" paint-order="stroke" filter="url(#glowS)">${t}</text>`);}
// A — NOBODY IS COMING: the figure, a hammer, a ghost tower to build
S.push({s:0,e:1,cam:{zoom:0},draw:()=>{const g=900;
  blueprint(1.2);T_(70,300,'NOBODY',200);T_(70,500,'IS COMING.',150,{fill:AMBER});
  add(`<rect x="76" y="570" width="560" height="74" rx="37" fill="none" stroke="#fff" stroke-width="5"/>`);label(356,620,'BUILD IT YOURSELF',{size:40,op:1,weight:900,sp:.1});
  add(`<circle cx="1480" cy="520" r="520" fill="url(#bk)" fill-opacity=".18"/>`);ground(g,1,{op:.5});
  tower(1620,g,8,1,{ghost:true,w:340,fh:92});tower(1620,g,3,.7,{w:340,fh:92,lit:.7});brick(1620,g-2*92-40,200,70,-9,{hi:true,lab:"YOU",lsize:34});
  add(`<polygon points="1110,0 1210,0 1370,${g} 950,${g}" fill="url(#cone)" opacity=".7"/>`);
  person(1160,g,2.2,{ring:false,arm:[90,-110],arm2:[-40,60]});hammer(1440,440,1.5,30);
}});
// B — ONLY YOU: the giant amber YOU brick on top of a glowing tower at sunrise
S.push({s:1,e:2,cam:{zoom:0},draw:()=>{const g=980;
  sunrise(1450,g-60,200,1);ground(g,1,{op:.5});tower(1450,g,4,1,{w:380,fh:110,lit:1});
  brick(1450,g-4*110-75,420,150,-9,{lab:'YOU',hi:true,lsize:90});
  T_(70,330,'ONLY',230);T_(70,560,'YOU.',230,{fill:AMBER});
  label(80,660,'CAN BUILD YOUR FUTURE',{size:46,op:.85,weight:900,sp:.14,anchor:'start'});warm(1);
}});
// C — STOP WAITING: everyone sits, one figure walks out into the light
S.push({s:2,e:3,cam:{zoom:0},draw:()=>{const g=930;
  T_(70,260,'STOP',200);T_(70,450,'WAITING.',170,{fill:AMBER});
  ground(g,1,{op:.45});for(let k=0;k<4;k++){chair(150+k*190,g,1.2);g_(`transform="translate(0,-48)"`,()=>person(126+k*190,g,1,{ring:false,arm:[30,50],op:.45}));}
  add(`<rect x="1560" y="${g-420}" width="250" height="420" fill="#fff" opacity=".92" filter="url(#glow)"/><polygon points="1560,${g} 1810,${g} 1920,${g+120} 1200,${g+120}" fill="#fff" opacity=".2"/>`);
  add(`<circle cx="1685" cy="${g-210}" r="420" fill="url(#bk)" fill-opacity=".25"/>`);
  person(1380,g,2.3,{ring:false,arm:[50,40],arm2:[-30,55]});
}});
