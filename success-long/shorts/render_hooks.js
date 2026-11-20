const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const {spawn}=require('child_process');
const D=__dirname;const H=JSON.parse(fs.readFileSync(path.join(D,'hooks.json')));const only=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.error('ERR',e.message));
 await p.addInitScript(h=>{window.TIMING={lines:Array.from({length:12},(_,i)=>({start:i*10,end:i*10+9}))};window.HOOKS=h},H);
 await p.goto('file://'+path.join(D,'hooks.html'));await p.waitForFunction(()=>window.render);
 if(only==='stills'){for(let i=0;i<H.length;i++)for(const f of [.02,.6,1.4,H[i].dur+.2]){await p.evaluate(t=>render(t),i*10+f);await p.screenshot({path:path.join(D,'out',`h${i}_${f.toFixed(2)}.jpg`),type:'jpeg',quality:80});}}
 else{for(let i=0;i<H.length;i++){const dur=Math.max(2.6,H[i].dur+.55);H[i].hookLen=dur;const fn=path.join(D,'parts',`hook${i}.mp4`);
   const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p',fn]);const fin=new Promise(r=>ff.on('close',r));
   for(let f=0;f<Math.round(dur*30);f++){await p.evaluate(t=>render(t),i*10+f/30);const buf=await p.screenshot({type:'jpeg',quality:93});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));}
   ff.stdin.end();await fin;console.log('hook',i,dur.toFixed(2));}
   fs.writeFileSync(path.join(D,'hooks.json'),JSON.stringify(H,null,1));}
 await b.close();})();
