const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error(e.message));
await p.addInitScript(()=>{window.TIMING={lines:[{start:0,end:1}]};window.CHAPTERS=[]});
await p.goto('file://'+path.resolve(__dirname,'thumbs.html'));
for(const [t,n] of [[.5,'A'],[1.5,'B'],[2.5,'C']]){await p.evaluate(t=>render(t),t);await p.screenshot({path:path.resolve(__dirname,`raw_${n}.png`)});}
await b.close();})();
