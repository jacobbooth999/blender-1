// node render.js stills t1,t2 | cues | video <workers> [chunkSec]
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const {spawn}=require('child_process');
const D=__dirname;const timing=JSON.parse(fs.readFileSync(path.join(D,'voice/timing.json')));const chapters=JSON.parse(fs.readFileSync(path.join(D,'voice/chapters.json')));
const url='file://'+path.join(D,'anim.html');const FPS=30;
async function page(b){const p=await b.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
  p.on('pageerror',e=>console.error('PAGE ERROR',e.message));
  await p.addInitScript(([t,c])=>{window.TIMING=t;window.CHAPTERS=c},[timing,chapters]);await p.goto(url);await p.waitForFunction(()=>window.render);return p;}
(async()=>{const mode=process.argv[2];const b=await chromium.launch();
 if(mode==='stills'){const p=await page(b);fs.mkdirSync(path.join(D,'out/stills'),{recursive:true});
   for(const t of process.argv[3].split(',').map(Number)){await p.evaluate(t=>render(t),t);await p.screenshot({path:path.join(D,`out/stills/t${t.toFixed(2).padStart(7,'0')}.jpg`),type:'jpeg',quality:85});}}
 else if(mode==='cues'){const p=await page(b);const c=await p.evaluate(()=>({end:VIDEO_END,cues:collectCues(30),scenes:S.map(s=>[s.s,s.e])}));fs.writeFileSync(path.join(D,'audio/cues.json'),JSON.stringify(c));console.log(c.cues.length,'cues, end',c.end.toFixed(2),'scenes',c.scenes.length);}
 else if(mode==='video'){const nw=+process.argv[3]||4,cs=+process.argv[4]||30;const dir=path.join(D,'out/chunks');fs.mkdirSync(dir,{recursive:true});
   const p0=await page(b);const end=await p0.evaluate(()=>VIDEO_END);await p0.close();const N=Math.ceil(end*FPS),per=cs*FPS,nc=Math.ceil(N/per);let next=0;const t0=Date.now();let done=0;
   await Promise.all([...Array(nw)].map(async()=>{const p=await page(b);
     while(true){const c=next++;if(c>=nc)break;const fn=path.join(dir,`c${String(c).padStart(4,'0')}.mp4`);if(fs.existsSync(fn)){done++;continue;}
       const tmp=fn+'.part.mp4';const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','20','-tune','animation','-pix_fmt','yuv420p',tmp]);
       const fin=new Promise(r=>ff.on('close',r));
       for(let f=c*per;f<Math.min(N,(c+1)*per);f++){await p.evaluate(t=>render(t),f/FPS);const buf=await p.screenshot({type:'jpeg',quality:92});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));}
       ff.stdin.end();await fin;fs.renameSync(tmp,fn);done++;console.log(`chunk ${c+1}/${nc} done (${done} total) ${((Date.now()-t0)/1000).toFixed(0)}s`);}}));
   fs.writeFileSync(path.join(dir,'list.txt'),[...Array(nc)].map((_,c)=>`file 'c${String(c).padStart(4,'0')}.mp4'`).join('\n'));console.log('all chunks',nc);}
 await b.close();})();
