// node render.js stills t1,t2 | cues | video
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const {spawn}=require('child_process');const D=__dirname;
const TIMING={lines:[{start:0,end:33.0}]};
(async()=>{const mode=process.argv[2];const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.error('ERR',e.message));
 await p.addInitScript(t=>{window.TIMING=t},TIMING);await p.goto('file://'+path.join(D,'anim.html'));await p.waitForFunction(()=>window.render);
 fs.mkdirSync(path.join(D,'out'),{recursive:true});
 if(mode==='stills'){for(const t of process.argv[3].split(',').map(Number)){await p.evaluate(t=>render(t),t);await p.screenshot({path:path.join(D,'out',`t${t.toFixed(2).padStart(5,'0')}.jpg`),type:'jpeg',quality:82});}}
 else if(mode==='cues'){const c=await p.evaluate(()=>({end:VIDEO_END,cues:collectCues(30)}));fs.writeFileSync(path.join(D,'cues.json'),JSON.stringify(c));console.log(c.cues.length,'cues',c.end);}
 else{const end=await p.evaluate(()=>VIDEO_END);const N=Math.ceil(end*30);const nw=4,per=Math.ceil(N/nw);const t0=Date.now();
   await Promise.all([...Array(nw)].map(async(_,w)=>{const pg=w?await b.newPage({viewport:{width:1080,height:1920}}):p;if(w){await pg.addInitScript(t=>{window.TIMING=t},TIMING);await pg.goto('file://'+path.join(D,'anim.html'));await pg.waitForFunction(()=>window.render);}
     const fn=path.join(D,'out',`part${w}.mp4`);const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','18','-tune','animation','-pix_fmt','yuv420p',fn]);const fin=new Promise(r=>ff.on('close',r));
     for(let f=w*per;f<Math.min(N,(w+1)*per);f++){await pg.evaluate(t=>render(t),f/30);const buf=await pg.screenshot({type:'jpeg',quality:93});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));}
     ff.stdin.end();await fin;console.log('part',w,((Date.now()-t0)/1000).toFixed(0)+'s');}));
   fs.writeFileSync(path.join(D,'out','list.txt'),[0,1,2,3].map(w=>`file 'part${w}.mp4'`).join('\n'));}
 await b.close();})();
