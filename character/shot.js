const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.addInitScript(()=>{window.TIMING={lines:Array.from({length:12},(_,i)=>({start:i,end:i+.5}))}});
await p.goto('file://'+path.resolve(__dirname,'sheet.html'));await p.evaluate(()=>render(1));
await p.screenshot({path:path.resolve(__dirname,'character_arms.png')});await b.close();})();
