const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:800,height:800}});
await p.goto('file://'+__dirname+'/pfp.html');await p.evaluate(()=>document.fonts.ready);
for(const v of ['A','B','C']){await p.evaluate(v=>{document.querySelectorAll('.v').forEach(e=>e.style.display=e.id===v?'block':'none')},v);
 await p.waitForTimeout(200); await p.screenshot({path:`pfp_${v}.png`});}
await b.close();})();
