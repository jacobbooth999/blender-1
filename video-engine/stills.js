const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_FILE_NOT_FOUND/.test(m.text()))console.log('PAGE',m.text())});
await p.goto('file://'+__dirname+'/page.html');await p.evaluate(()=>window.ready);
for(const t of process.argv.slice(2).map(Number)){await p.evaluate(([t])=>render(t,Math.round(t*30)),[t]);await p.screenshot({path:`still_${t}.jpg`,type:'jpeg',quality:70});}
await b.close();})();
