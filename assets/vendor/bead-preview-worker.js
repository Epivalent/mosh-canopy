// Native WebP decoder in a worker; one packed image per visible/prepared film.
importScripts('https://epivalent.github.io/mosh-canopy/assets/vendor/published-assets.js?v=1');
const jobs=new Map();
const sampling=new Map();
onmessage=({data:d})=>{
 if(d.type==='samples'){const s={...d,controller:new AbortController()};sampling.set(d.token,s);void sample(s);}
 if(d.type==='cancelSamples'){const s=sampling.get(d.token);if(s){s.controller.abort();sampling.delete(d.token);}}
 if(d.type==='load'){const s={...d,controller:new AbortController()};jobs.set(d.id,s);void load(s);}
 if(d.type==='dispose'){const s=jobs.get(d.id);if(s&&s.token===d.token){s.closed=true;s.controller.abort();jobs.delete(s.id);}}
};
// Extraction reads the original preview, never the tiny bead atlas. Decode only
// the same number of samples the semantic detector uses for ordinary films.
async function sample(s){
 let decoder;const frames=[];
 try{
  const signal=s.controller.signal;
  let meta;
  try{const r=await fetch(s.url,{signal,cache:'no-cache'});if(r.ok)meta=await r.json();}catch(e){signal.throwIfAborted();}
  let preview=meta?.status==='ready'&&meta.preview?.url,url=preview?PublishedAssets.url(preview,s.url):s.poster;
  const open=async()=>{
   const image=await fetch(url,{signal,cache:'force-cache'});if(!image.ok)throw Error('Extraction image HTTP '+image.status);
   decoder=new ImageDecoder({type:preview?'image/webp':'image/jpeg',data:await image.arrayBuffer(),preferAnimation:true});
   await decoder.tracks.ready;await decoder.completed;signal.throwIfAborted();
  };
  try{await open();}catch(e){
   signal.throwIfAborted();if(!preview)throw e;
   decoder?.close();decoder=null;preview=false;url=s.poster;await open();
  }
  const total=decoder.tracks.selectedTrack.frameCount,count=Math.min(s.count,total);
  for(let i=0;i<count;i++){
   const index=Math.round(i*(total-1)/Math.max(1,count-1));
   const {image}=await decoder.decode({frameIndex:index});
   try{
    signal.throwIfAborted();
    // Match the film sheet's cover fit while retaining source resolution.
    const sw=Math.min(image.displayWidth,image.displayHeight*16/9),sh=sw*9/16;
    const canvas=new OffscreenCanvas(Math.round(sw),Math.round(sh));
    canvas.getContext('2d').drawImage(image,(image.displayWidth-sw)/2,(image.displayHeight-sh)/2,sw,sh,0,0,canvas.width,canvas.height);
    frames.push({bitmap:canvas.transferToImageBitmap(),time:image.timestamp/1e6,index});
   }finally{image.close();}
  }
  signal.throwIfAborted();
  postMessage({type:'samples',token:s.token,frames,source:preview?'preview':'poster',url},frames.map(f=>f.bitmap));frames.length=0;
 }catch(e){if(!s.controller.signal.aborted)postMessage({type:'samples',token:s.token,error:e.message});}
 finally{decoder?.close();for(const f of frames)f.bitmap.close();sampling.delete(s.token);}
}
async function load(s){
 let decoder,bitmap;
 try{
  const r=await fetch(s.url,{signal:s.controller.signal,cache:'no-cache'});
  if(r.status===404){postMessage({type:'metadata',id:s.id,token:s.token,status:'pending'});return;}
  if(!r.ok)throw Error('Preview metadata HTTP '+r.status);
  const meta=await r.json();if(s.closed)return;
  postMessage({type:'metadata',id:s.id,token:s.token,status:meta.status,title:meta.title,duration:meta.duration});
  if(meta.status!=='ready'||!meta.preview?.url)return;
  const image=await fetch(PublishedAssets.url(meta.preview.url,r.url||s.url),{signal:s.controller.signal,cache:'force-cache'});if(!image.ok)throw Error('Preview image HTTP '+image.status);
  const data=await image.arrayBuffer();if(s.closed)return;
  decoder=new ImageDecoder({type:'image/webp',data,preferAnimation:true});await decoder.tracks.ready;await decoder.completed;if(s.closed)return;
  const frames=decoder.tracks.selectedTrack.frameCount;if(frames<2)throw Error('Preview has no animation');
  const columns=Math.ceil(Math.sqrt(frames*s.height/s.width)),rows=Math.ceil(frames/columns);
  if(columns*s.width>s.maxTextureSize||rows*s.height>s.maxTextureSize)throw Error('Preview exceeds GPU texture dimensions');
  const canvas=new OffscreenCanvas(columns*s.width,rows*s.height),ctx=canvas.getContext('2d',{alpha:false}),ends=[];let duration=0;
  for(let i=0;i<frames;i++){
   const {image}=await decoder.decode({frameIndex:i});if(s.closed){image.close();return;}
   const aspect=s.width/s.height,sw=Math.min(image.displayWidth,image.displayHeight*aspect),sh=sw/aspect;
   ctx.drawImage(image,(image.displayWidth-sw)/2,(image.displayHeight-sh)/2,sw,sh,(i%columns)*s.width,Math.floor(i/columns)*s.height,s.width,s.height);
   duration+=image.duration/1e6;ends.push(duration);image.close();
  }
  bitmap=canvas.transferToImageBitmap();
  postMessage({type:'atlas',id:s.id,token:s.token,bitmap,ends,duration,columns,frames,gpuBytes:canvas.width*canvas.height*4},[bitmap]);bitmap=null;
 }catch(e){if(!s.closed)postMessage({type:'error',id:s.id,token:s.token,error:e.message});}
 finally{decoder?.close();bitmap?.close();}
}
