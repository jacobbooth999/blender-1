/* three thumbnail designs rendered at t=0.5 / 1.5 / 2.5 */
S.length=0;window.AFTER=null;
function T_(x,y,t,size,{anchor='start',fill='#fff',sp=.01,rot=0}={}){add(`<text x="${x}" y="${y}" font-size="${size}" font-weight="900" letter-spacing="${size*sp}" fill="${fill}" text-anchor="${anchor}" stroke="#000" stroke-width="${size*.06}" paint-order="stroke" ${rot?`transform="rotate(${rot},${x},${y})"`:''} filter="url(#glowS)">${t}</text>`);}
function beam(x,top,w0,w1,g,op=.55){add(`<polygon points="${x-w0},${top} ${x+w0},${top} ${x+w1},${g} ${x-w1},${g}" fill="url(#cone)" opacity="${op}"/>`);}
// A — MOTIVATION IS A LIE: struck word + figure training alone at 5 AM
S.push({s:0,e:1,cam:{zoom:0},draw:()=>{
  T_(70,330,'MOTIVATION',178,{sp:.0});
  add(`<path d="M50,280 L1050,215" stroke="${AMBER}" stroke-width="30" stroke-linecap="round" filter="url(#glowS)"/>`);
  T_(70,560,'IS A',200,{fill:'#fff'});T_(500,560,'LIE.',200,{fill:AMBER});
  add(`<rect x="76" y="640" width="380" height="74" rx="37" fill="none" stroke="#fff" stroke-width="5"/>`);label(266,692,'5:00 AM',{size:46,op:1,weight:900,sp:.12});
  label(500,692,'DO IT ANYWAY',{size:40,op:.7,weight:800,sp:.18,anchor:'start'});
  const x=1500,g=960;add(`<circle cx="${x}" cy="560" r="520" fill="url(#bk)" fill-opacity=".2"/>`);beam(x,0,90,330,g,.75);
  ground(g,1,{op:.5});
  add(`<ellipse cx="${x}" cy="${g}" rx="300" ry="34" fill="#fff" opacity=".12"/>`);
  person(x,g,2.6,{ring:false,arm:[62,-70],arm2:[-62,-70]});
  barbell(x,g-2.6*150,1.7);
  for(let i=0;i<6;i++)add(`<circle cx="${x-160+i*64}" cy="${g-560-((i*37)%60)}" r="5" fill="#fff" opacity=".5"/>`);
}});
// B — DON'T: giant SNOOZE button, finger hovering
S.push({s:1,e:2,cam:{zoom:0},draw:()=>{
  const cx=1490,cy=560;add(`<circle cx="${cx}" cy="${cy}" r="560" fill="url(#bk)" fill-opacity=".2"/>`);
  add(`<g transform="rotate(-8,${cx},${cy})"><rect x="${cx-330}" y="${cy-470}" width="660" height="1100" rx="70" fill="#0b0b0b" stroke="#fff" stroke-width="10" filter="url(#glowS)"/>`);
  label(cx,cy-230,'5:00',{size:210,op:1,weight:900,sp:.02});label(cx,cy-140,'WAKE UP',{size:40,op:.7,weight:800,sp:.3});
  add(`<rect x="${cx-250}" y="${cy-50}" width="500" height="170" rx="85" fill="none" stroke="#fff" stroke-width="9" filter="url(#glowS)"/>`);label(cx,cy+60,'SNOOZE',{size:84,op:1,weight:900,sp:.14});
  add(`<rect x="${cx-250}" y="${cy+170}" width="500" height="130" rx="65" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="5"/>`);label(cx,cy+255,'GET UP',{size:56,op:.45,weight:900,sp:.14});add('</g>');
  hand(cx+620,1180,cx+120,cy+120,78);
  T_(70,420,"DON'T.",250,{fill:AMBER,sp:.0});
  T_(78,580,'HIT SNOOZE',120,{sp:.02});
  label(80,690,'MOTIVATION WON\'T SAVE YOU',{size:42,op:.75,weight:800,sp:.16,anchor:'start'});
}});
// C — DISCIPLINE > MOTIVATION: silhouette walking into the sunrise
S.push({s:2,e:3,cam:{zoom:0},draw:()=>{
  const g=900;sunrise(1380,g-40,190,1);
  add(`<rect x="0" y="${g}" width="1920" height="200" fill="#050505"/>`);ground(g,1,{op:.5});
  {const x=1300;add(`<g fill="#030303" stroke="#030303" stroke-linecap="round"><line x1="${x-20}" y1="${g-150}" x2="${x-90}" y2="${g-40}" stroke-width="34"/><line x1="${x+20}" y1="${g-150}" x2="${x+85}" y2="${g-50}" stroke-width="34"/><rect x="${x-62}" y="${g-290}" width="124" height="290" rx="62"/><circle cx="${x+6}" cy="${g-350}" r="56"/></g>`);}
  T_(70,290,'DISCIPLINE',190,{sp:.0});
  add(`<text x="80" y="470" font-size="190" font-weight="900" fill="${AMBER}" filter="url(#glowS)">&gt;</text>`);
  T_(250,465,'MOTIVATION',118,{fill:'#fff',sp:0});add(`<path d="M240,425 L1000,425" stroke="#fff" stroke-opacity=".9" stroke-width="12" stroke-linecap="round"/>`);
  label(84,580,'THE TRUTH NOBODY TELLS YOU',{size:42,op:.75,weight:800,sp:.16,anchor:'start'});
}});
