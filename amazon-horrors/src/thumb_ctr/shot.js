const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});
await p.goto('file://'+__dirname+'/t.html');await p.evaluate(()=>document.fonts.ready);
for(const v of ['A','B','C']){await p.evaluate(v=>document.querySelectorAll('.v').forEach(e=>e.style.display=e.id===v?'block':'none'),v);await p.waitForTimeout(250);await p.screenshot({path:`t_${v}.jpg`,type:'jpeg',quality:93});}
await b.close();})();
