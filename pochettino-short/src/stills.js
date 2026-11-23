const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('console',m=>console.log('PAGE',m.text())); p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/page.html'); await p.evaluate(()=>window.ready);
for(const t of process.argv.slice(2).map(Number)){await p.evaluate(([t])=>render(t,Math.round(t*30)),[t]); await p.screenshot({path:`still_${t}.jpg`,quality:70,type:'jpeg'});}
await b.close();})();
