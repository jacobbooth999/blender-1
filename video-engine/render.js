const {chromium}=require('playwright');const fs=require('fs');
const [w,n]=process.argv.slice(2).map(Number);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/page.html');await p.evaluate(()=>window.ready);
const total=await p.evaluate(()=>TL.total);const N=Math.ceil(total*30);fs.mkdirSync('frames',{recursive:true});
for(let f=w;f<N;f+=n){const fn=`frames/f${String(f).padStart(5,'0')}.jpg`;if(fs.existsSync(fn))continue;
 await p.evaluate(([t,f])=>render(t,f),[f/30,f]);await p.screenshot({path:fn,type:'jpeg',quality:90});
 if(f%300===w)console.log(w,f,'/',N);}
await b.close();})();
