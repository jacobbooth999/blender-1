const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
const f='file://'+path.resolve(__dirname,'style.html');
for(let i=1;i<=10;i++){await p.goto(f+'#'+i);await p.reload();await p.waitForTimeout(150);
await p.screenshot({path:path.resolve(__dirname,'shots',`shot${String(i).padStart(2,'0')}.png`)});}
await b.close();})();
