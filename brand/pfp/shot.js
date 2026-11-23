const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error(e.message));
const timing=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../discipline-doc/voice/timing.json')));
await p.addInitScript(t=>{window.TIMING=t;window.CHAPTERS=[]},timing);
await p.goto('file://'+path.resolve(__dirname,'pfp.html'));await p.waitForFunction(()=>window.render);
for(const [t,n] of [[.5,'A'],[1.5,'B'],[2.5,'C']]){await p.evaluate(t=>render(t),t);await p.screenshot({path:path.resolve(__dirname,`raw_${n}.png`),clip:{x:420,y:0,width:1080,height:1080}});}
await b.close();})();
