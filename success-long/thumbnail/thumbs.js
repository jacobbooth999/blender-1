/* three static thumbnail designs, rendered at t = 0.5 / 1.5 / 2.5 */
function rays(x,y,n=16,r0=120,r1=520,op=.18){let d='';for(let i=0;i<n;i++){const a=i*2*Math.PI/n+.1;d+=`<line x1="${x+r0*Math.cos(a)}" y1="${y+r0*Math.sin(a)}" x2="${x+r1*Math.cos(a)}" y2="${y+r1*Math.sin(a)}"/>`;}add(`<g stroke="#fff" stroke-opacity="${op}" stroke-width="6" stroke-linecap="round">${d}</g>`);}
function bigText(x,y,t,size,{anchor='start',op=1,sp=.02}={}){add(`<text x="${x}" y="${y}" font-size="${size}" font-weight="900" letter-spacing="${size*sp}" fill="#fff" fill-opacity="${op}" text-anchor="${anchor}" filter="url(#glowL)" stroke="#000" stroke-width="2" paint-order="stroke">${t}</text>`);}
// A — starting with $0: staircase to the top
S.push({s:0,e:1,cam:{zoom:0},draw:()=>{
  add(`<circle cx="1620" cy="380" r="420" fill="url(#bk)" fill-opacity=".16"/>`);rays(1650,330,18,150,560,.16);
  bigText(80,250,'STARTING',150);bigText(80,450,'WITH',150,{op:.85});
  add(`<text x="80" y="720" font-size="300" font-weight="900" fill="#fff" filter="url(#glowL)">$0</text>`);
  const x0=760,y0=1040,n=7,w=130,h=82;let d=`M${x0-200},${y0} L${x0},${y0}`;for(let i=0;i<n;i++)d+=` L${x0+i*w},${y0-(i+1)*h} L${x0+(i+1)*w},${y0-(i+1)*h}`;d+=` L1960,${y0-n*h}`;
  add(`<path d="${d}" stroke="#fff" stroke-width="9" fill="none" stroke-linejoin="round" filter="url(#glow)"/>`);
  person(x0+60,y0-100,1.05,{op:.45,ring:false});
  person(1650,y0-n*h,1.85,{spot:true,ring:false,arm:[42,-84],arm2:[-42,-84]});
  add(`<g filter="url(#glowL)">`);icon('star',1330,250,1.4);add('</g>');
}});
// B — 5 years from now: today vs future you
S.push({s:1,e:2,cam:{zoom:0},draw:()=>{
  add(`<circle cx="1420" cy="560" r="480" fill="url(#bk)" fill-opacity=".16"/>`);rays(1420,520,18,200,620,.13);
  bigText(960,190,'5 YEARS LATER',150,{anchor:'middle'});
  ground(960,1,{op:.6});
  person(430,960,1.4,{op:.45,ring:false});add(`<text x="430" y="1040" font-size="44" font-weight="800" letter-spacing="8" fill="#fff" fill-opacity=".55" text-anchor="middle">TODAY</text>`);
  add(`<rect x="640" y="754" width="400" height="12" rx="6" fill="#fff" filter="url(#glow)"/><path d="M1000,710 L1060,760 L1000,810" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>`);
  person(1420,960,3.0,{spot:true,ring:false,arm:[44,-86],arm2:[-44,-86]});
  add(`<g filter="url(#glowL)">`);icon('trophy',1720,430,1.6);icon('dollar',1120,420,1.3);add('</g>');
}});
// C — from nothing: the figure assembling from tiles
S.push({s:2,e:3,cam:{zoom:0},draw:()=>{
  add(`<circle cx="1380" cy="560" r="460" fill="url(#bk)" fill-opacity=".18"/>`);
  bigText(90,420,'FROM',170);bigText(90,640,'NOTHING',170);
  add(`<text x="96" y="760" font-size="56" font-weight="800" letter-spacing="14" fill="#fff" fill-opacity=".75">TO THE NEXT VERSION</text>`);
  const cx=1380,hy=330,hr=130,bx0=1200,bx1=1560,by0=500,by1=1000,rr=90,s=44;let seed=3;const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280;};
  for(let y=hy-hr;y<=by1;y+=s)for(let x=bx0-60;x<=bx1+60;x+=s){const px=x+s/2,py=y+s/2;let inside=Math.hypot(px-cx,py-hy)<=hr-3;
    if(py>=by0&&py<=by1&&px>=bx0&&px<=bx1){if(py<by0+rr){const c=px<bx0+rr?bx0+rr:(px>bx1-rr?bx1-rr:px);inside=Math.hypot(px-c,py-(by0+rr))<=rr||(px>=bx0+rr&&px<=bx1-rr);}else inside=true;}
    if(!inside)continue;const r_=rnd();const loose=px>cx+20&&py<760&&py>hy+hr&&r_<.45;
    if(loose){const dx=(rnd()-.5)*500,dy=(rnd()-.8)*300;add(`<rect x="${px-17+dx}" y="${py-17+dy}" width="34" height="34" rx="6" fill="#0b0b0b" stroke="#fff" stroke-width="3" transform="rotate(${rnd()*60-30},${px+dx},${py+dy})"/>`);}
    else add(`<rect x="${px-18}" y="${py-18}" width="36" height="36" rx="6" fill="#f4f4f4" filter="url(#glowS)"/>`);}
  ground(1010,1,{op:.5});
}});
