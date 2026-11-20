const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.addInitScript(()=>{window.TIMING={lines:Array.from({length:12},(_,i)=>({start:i*10,end:i*10+9}))};window.HOOKS=[]});
await p.goto('file://'+path.join(__dirname,'hooks.html'));await p.evaluate(()=>render(95));await p.screenshot({path:path.join(__dirname,'parts','bg.png')});await b.close();})();
