// usage: node render.js stills t1,t2,...  |  node render.js cues  |  node render.js frames <workers> [fps]
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const timing=JSON.parse(fs.readFileSync(path.join(__dirname,'voice/timing.json')));
const url='file://'+path.join(__dirname,'anim.html');
async function page(b){const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
  await p.addInitScript(t=>{window.TIMING=t},timing);await p.goto(url);await p.waitForFunction(()=>window.render);return p;}
(async()=>{const mode=process.argv[2];const b=await chromium.launch();
 if(mode==='stills'){const p=await page(b);fs.mkdirSync(path.join(__dirname,'out/stills'),{recursive:true});
   for(const t of process.argv[3].split(',').map(Number)){await p.evaluate(t=>render(t),t);await p.screenshot({path:path.join(__dirname,`out/stills/t${t.toFixed(2).padStart(6,'0')}.png`)});}}
 else if(mode==='cues'){const p=await page(b);const c=await p.evaluate(()=>({end:VIDEO_END,cues:collectCues(30)}));fs.writeFileSync(path.join(__dirname,'audio/cues.json'),JSON.stringify(c,null,1));console.log(c.cues.length,'cues, end',c.end);}
 else if(mode==='frames'){const nw=+process.argv[3]||4,fps=+process.argv[4]||30;const dir=path.join(__dirname,'out/frames');fs.mkdirSync(dir,{recursive:true});
   const p0=await page(b);const end=await p0.evaluate(()=>VIDEO_END);await p0.close();const N=Math.ceil(end*fps);let next=0;const t0=Date.now();
   await Promise.all([...Array(nw)].map(async()=>{const p=await page(b);while(true){const f=next++;if(f>=N)break;const fn=path.join(dir,`f${String(f).padStart(5,'0')}.jpg`);
     if(fs.existsSync(fn))continue;await p.evaluate(t=>render(t),f/fps);await p.screenshot({path:fn,type:'jpeg',quality:93});
     if(f%100===0)console.log(f,'/',N,((Date.now()-t0)/1000).toFixed(0)+'s');}}));console.log('done',N);}
 await b.close();})();
