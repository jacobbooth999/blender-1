// Precompute SVG map paths for each map scene in story.json -> maps.js
import fs from 'fs';
import {geoEquirectangular,geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
const story=JSON.parse(fs.readFileSync('story.json'));
const land10=feature(...(t=>[t,t.objects.land])(JSON.parse(fs.readFileSync('node_modules/world-atlas/land-10m.json'))));
const land50=feature(...(t=>[t,t.objects.land])(JSON.parse(fs.readFileSync('node_modules/world-atlas/land-50m.json'))));
const P={mogi:[-46.19,-23.52,'MOGI DAS CRUZES'],santos:[-46.33,-23.96,'SANTOS'],barcelona:[2.17,41.39,'BARCELONA'],paris:[2.35,48.86,'PARIS'],riyadh:[46.72,24.71,'RIYADH']};
const W=1240,H=700; const out={}; const visited=['mogi'];
story.scenes.forEach((sc,i)=>{ if(sc.type!=='map')return;
  const legs=sc.legs; legs.forEach(l=>{if(!visited.includes(l[0]))visited.push(l[0]);});
  const pts=legs.flatMap(l=>[P[l[0]],P[l[1]]]);
  let lo0=Math.min(...pts.map(p=>p[0])),lo1=Math.max(...pts.map(p=>p[0])),la0=Math.min(...pts.map(p=>p[1])),la1=Math.max(...pts.map(p=>p[1]));
  let span=Math.max(lo1-lo0,(la1-la0)*W/H,0.8); const cx=(lo0+lo1)/2,cy=(la0+la1)/2; span*=1.45;
  const spanLa=span*H/W;
  const proj=geoEquirectangular().fitExtent([[0,0],[W,H]],{type:'Feature',geometry:{type:'Polygon',coordinates:[[[cx-span/2,cy-spanLa/2],[cx-span/2,cy+spanLa/2],[cx+span/2,cy+spanLa/2],[cx+span/2,cy-spanLa/2],[cx-span/2,cy-spanLa/2]]]}});
  proj.clipExtent([[-20,-20],[W+20,H+20]]);
  const path=geoPath(proj).digits(0); const land=path(span<20?land10:land50);
  legs.forEach(l=>{if(!visited.includes(l[1]))visited.push(l[1]);});
  const stops={}; for(const k of visited){const [x,y]=proj([P[k][0],P[k][1]]); if(x>-50&&x<W+50&&y>-50&&y<H+50) stops[k]={x:+x.toFixed(1),y:+y.toFixed(1),name:P[k][2]};}
  // graticule
  const step=span>60?15:span>20?5:span>4?1:0.25; let grat='';
  for(let lo=Math.ceil((cx-span/2)/step)*step;lo<cx+span/2;lo+=step){const a=proj([lo,cy-spanLa]),b=proj([lo,cy+spanLa]);grat+=`M${a[0].toFixed(0)} ${a[1].toFixed(0)}L${b[0].toFixed(0)} ${b[1].toFixed(0)}`;}
  for(let la=Math.ceil((cy-spanLa/2)/step)*step;la<cy+spanLa/2;la+=step){const a=proj([cx-span,la]),b=proj([cx+span,la]);grat+=`M${a[0].toFixed(0)} ${a[1].toFixed(0)}L${b[0].toFixed(0)} ${b[1].toFixed(0)}`;}
  if(stops.mogi&&stops.santos&&Math.hypot(stops.mogi.x-stops.santos.x,stops.mogi.y-stops.santos.y)<60) delete stops.mogi;
  out[i]={w:W,h:H,land,grat,stops,legs:legs.map(l=>({from:l[0],to:l[1],cue:'leg_'+l[1]}))};
});
fs.writeFileSync('maps.js','window.MAPS='+JSON.stringify(out)+';');
console.log('maps',Object.keys(out).length,(fs.statSync('maps.js').size/1024).toFixed(0)+'KB');
