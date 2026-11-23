/* profile pictures: content centred at (960,540), circle-safe radius ~430; screenshot clipped to 1080x1080 */
S.length=0;window.AFTER=null;
const PX=960,PY=540;
// A — the figure in a spotlight with an amber halo ring
S.push({s:0,e:1,cam:{zoom:0},draw:()=>{
  add(`<circle cx="${PX}" cy="${PY}" r="470" fill="url(#bk)" fill-opacity=".22"/>`);
  add(`<polygon points="${PX-60},0 ${PX+60},0 ${PX+260},860 ${PX-260},860" fill="url(#cone)" opacity=".8"/>`);
  add(`<circle cx="${PX}" cy="${PY}" r="405" fill="none" stroke="${AMBER}" stroke-width="14" filter="url(#glowS)"/>`);
  add(`<ellipse cx="${PX}" cy="860" rx="230" ry="26" fill="#fff" opacity=".14"/>`);
  person(PX,860,2.9,{ring:false,arm:[44,-86],arm2:[-44,-86]});
}});
// B — TNV monogram with the figure as the "V" climbing
S.push({s:1,e:2,cam:{zoom:0},draw:()=>{
  add(`<circle cx="${PX}" cy="${PY}" r="470" fill="url(#bk)" fill-opacity=".18"/>`);
  add(`<circle cx="${PX}" cy="${PY}" r="405" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="10" filter="url(#glowS)"/>`);
  add(`<text x="${PX}" y="${PY+20}" font-size="300" font-weight="900" fill="#fff" text-anchor="middle" letter-spacing="-6" filter="url(#glowS)">TN<tspan fill="${AMBER}">V</tspan></text>`);
  add(`<text x="${PX}" y="${PY+140}" font-size="44" font-weight="800" fill="#fff" fill-opacity=".8" text-anchor="middle" letter-spacing="14">THE NEXT VERSION</text>`);
}});
// C — figure at the top of glowing stairs, sunrise behind
S.push({s:2,e:3,cam:{zoom:0},draw:()=>{
  sunrise(PX-130,PY-150,85,1);
  const x0=PX-290,y0=PY+250,n=5,w=108,h=70;let d=`M${x0-40},${y0} L${x0},${y0}`;for(let i=0;i<n;i++)d+=` L${x0+i*w},${y0-(i+1)*h} L${x0+(i+1)*w},${y0-(i+1)*h}`;
  add(`<path d="${d}" stroke="#fff" stroke-width="12" fill="none" stroke-linejoin="round" filter="url(#glowS)"/>`);
  person(x0+n*w-54,y0-n*h,1.3,{ring:false,arm:[44,-86],arm2:[-44,-86]});
  add(`<circle cx="${PX}" cy="${PY}" r="405" fill="none" stroke="${AMBER}" stroke-width="12" filter="url(#glowS)"/>`);
}});
