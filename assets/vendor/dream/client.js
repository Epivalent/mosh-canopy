import {StudioGPU} from './studio/studio-gpu.js?v=1';
import {NativeImageUpload} from './studio/native-image-upload.js';

// Host adapter for native-live.html's exact three-worker studio pipeline.
// Learned graphs and GPU shaders come from the standalone studio.
// The host and workers support continuous, atomic live-control handovers.
export class DreamRenderer {
 constructor(canvas,callbacks={}){
  Object.assign(this,{canvas,onStatus:()=>{},onResult:()=>{},onError:()=>{},onFrame:()=>{},onPresentation:()=>{},...callbacks});
  this.settings={};this.workers={};this.stages={};this.histories=new Map();this.results=[];this.epoch=0;this.seq=0;this.running=true;this.ready=false;this.inputBusy=false;this.lastInput=0;this.presentations=0;
  this.capture=document.createElement('canvas');this.capture.width=this.capture.height=512;this.captureContext=this.capture.getContext('2d');
 }
 modelConfig(){const s=this.settings;return {prompt:s.Prompt||'',index:Number(s.Stepindex),passes:Number(s.Passes),seed:Number(s.Seed),noise:Number(s.Noise),spatial:!!s.Spatial,controlStrength:Number(s.Controlstrength),sourceInfluence:Number(s.Sourceinfluence),evolutionRate:Number(s.Evolutionrate),composition:'off'};}
 acknowledgeInput(meta){if(meta&&meta.epoch===this.inputTicket?.epoch&&meta.input_seq===this.inputTicket?.input_seq){this.inputBusy=false;this.inputTicket=null;}}
 broadcast(){for(const w of Object.values(this.workers))w.postMessage({type:'configure',epoch:this.epoch,cfg:this.modelConfig(),active:this.running&&!!this.settings.Running&&!document.hidden});}
 configure(values,pulses=[]){
  this.settings={...this.settings,...values};
  this.gpu?.configure({...this.settings,Threshold:this.settings.Studiothreshold});
  // Only an explicit reset discards temporal state; ordinary edits keep flowing.
  if(pulses.length)this.reset();else this.broadcast();
 }
 async load({backend=navigator.platform.startsWith('Win')?'gpu':'npu'}={}){return this.loading??=this.initialize(backend);}
 async initialize(backend){
  if(!navigator.ml||!navigator.gpu)throw Error('Dream studio requires WebNN and WebGPU enabled in this browser.');
  this.backend=backend;this.gpuCanvas=document.createElement('canvas');const gpu=this.gpu=await StudioGPU.create(this.gpuCanvas);if(this.disposed){gpu.dispose();throw new DOMException('Disposed','AbortError');}
  const upload=new NativeImageUpload(gpu),matched=gpu.target(gpu.gl.RGBA8),draw=gpu.draw.bind(gpu);
  gpu.acceptImage=image=>{upload.upload(image,gpu.neuralTex);gpu.ready=true;};
  gpu.setMatchedSource=image=>{upload.upload(image,matched);this.hasMatch=true;};
  gpu.draw=(program,target,textures,dt)=>draw(program,target,program===gpu.programs.blend&&this.hasMatch&&gpu.ready?{...textures,source:matched}:textures,dt);
  gpu.configure({...this.settings,Threshold:this.settings.Studiothreshold});this.displayContext=this.canvas.getContext('2d');
  const animate=now=>{if(this.disposed)return;if(this.running&&this.settings.Running&&!document.hidden&&gpu.hasSource&&gpu.tick(now)){
   // Remove only the known model-input padding. All source pixels remain; the
   // host canvas keeps the film aspect ratio rather than stretching a square.
   const r=this.displayRect;if(r){if(this.canvas.width!==r.width||this.canvas.height!==r.height){this.canvas.width=r.width;this.canvas.height=r.height;}this.displayContext.drawImage(this.gpuCanvas,r.x,r.y,r.w,r.h,0,0,r.width,r.height);this.presentations++;}
  }this.animation=requestAnimationFrame(animate);};this.animation=requestAnimationFrame(animate);
  for(const role of ['encoder','fast','prefix']){
   if(this.disposed)throw new DOMException('Disposed','AbortError');
   await new Promise((resolve,reject)=>{
    this.rejectLoad=reject;const w=this.workers[role]=new Worker(new URL('./studio/native-live-worker.js?v=direct-assets1',import.meta.url),{type:'module'});this.stages[role]='Loading';
    const fail=message=>{this.stages[role]='Error';reject(Error(message));this.onError(message);};w.onerror=e=>fail(role+': '+e.message);
    w.onmessage=({data:d})=>{
     if(this.disposed){d.bitmap?.close();return;}
     if(d.type==='status'){this.stages[role]=d.message;this.onStatus(role+': '+d.message);}
     if(d.type==='error')fail(role+': '+d.error);
     if(d.type==='ready'){this.stages[role]='Ready';resolve();}
     if(d.type==='inputReady')this.acknowledgeInput(d.meta);
     if(d.type==='source'&&d.packet.meta.epoch===this.epoch){this.encodeMs=d.packet.encodeMs;this.cannyMs=d.packet.cannyMs;this.workers.fast.postMessage({type:'source',packet:d.packet});this.workers.prefix.postMessage({type:'source',packet:d.packet});}
     if(d.type==='feature'&&d.packet.meta.epoch===this.epoch)this.workers.fast.postMessage({type:'feature',packet:d.packet});
     if(d.type==='prefixMetric'&&d.meta.epoch===this.epoch)this.prefixMs=d.ms;
     if(d.type==='image'){
      const saved=this.histories.get(d.meta.input_seq);
      if(d.epoch!==this.epoch||!saved){d.bitmap?.close();return;}
      gpu.acceptImage(d.bitmap);d.bitmap.close();gpu.setMatchedSource(saved.image);this.displayRect=saved.rect;this.appliedPrompt=d.prompt;
      const stats={at:performance.now(),ms:d.ms,changed:d.changed,sourceTime:d.meta.time,inputSequence:d.meta.input_seq,sourceAgeMs:performance.now()-d.meta.captured,passes:d.passes??Number(this.settings.Passes)};
      this.results.push(stats);this.results=this.results.slice(-300);this.onResult(stats);this.onPresentation({accepted:true,...stats});
     }
    };
    w.postMessage({type:'load',role,epoch:this.epoch,cfg:this.modelConfig(),backend,active:this.running&&!!this.settings.Running&&!document.hidden});
   });
  }
  this.rejectLoad=null;this.ready=true;this.info={architecture:'browser-studio-sd-turbo-512',backend,workers:3,grid:512};this.broadcast();return this.info;
 }
 async submit(frame,{time=0}={},ack=()=>{}){
  if(this.disposed||!this.ready||!this.running||!this.settings.Running||document.hidden){frame.close();ack();return;}
  try{
   const scale=Math.min(512/frame.width,512/frame.height),w=frame.width*scale,h=frame.height*scale,rect={x:(512-w)/2,y:(512-h)/2,w,h,width:Math.round(w),height:Math.round(h)};
   const ctx=this.captureContext;ctx.fillStyle='#000';ctx.fillRect(0,0,512,512);ctx.drawImage(frame,rect.x,rect.y,w,h);frame.close();frame=null;this.gpu.source(this.capture);if(!this.gpu.ready)this.displayRect=rect;this.onFrame({time,epoch:this.epoch});
   const now=performance.now();if(!this.inputBusy&&now-this.lastInput>=1000/Number(this.settings.Inputlimit||30)){
    this.inputBusy=true;this.lastInput=now;const meta={epoch:this.epoch,input_seq:++this.seq,time,captured:now};this.inputTicket=meta;const settings={...this.settings,Threshold:this.settings.Studiothreshold};
    const [image,history]=await Promise.all([createImageBitmap(this.capture),createImageBitmap(this.capture)]);
    if(this.disposed||meta.epoch!==this.epoch){image.close();history.close();if(this.inputTicket===meta){this.inputBusy=false;this.inputTicket=null;}return;}
    this.histories.set(meta.input_seq,{image:history,rect});while(this.histories.size>90){const [key,saved]=this.histories.entries().next().value;saved.image.close();this.histories.delete(key);}
    this.workers.encoder.postMessage({type:'frame',packet:{image,meta,settings}},[image]);
   }
  }catch(e){this.inputBusy=false;this.onError(e.message);}finally{frame?.close();ack();}
 }
 reset(){this.epoch++;this.inputBusy=false;this.inputTicket=null;this.appliedPrompt=undefined;this.hasMatch=false;this.gpu?.resetSource();for(const saved of this.histories.values())saved.image.close();this.histories.clear();this.results=[];this.broadcast();}
 setRunning(value){if(this.running===!!value)return;this.running=!!value;if(this.gpu)this.gpu.lastTick=undefined;this.broadcast();}
 diagnostics(){return {ready:this.ready,backend:this.backend,epoch:this.epoch,stages:this.stages,encodeMs:this.encodeMs,cannyMs:this.cannyMs,prefixMs:this.prefixMs,inputSequence:this.seq,presentations:this.presentations,last:this.results.at(-1)};}
 dispose(){if(this.disposed)return;this.disposed=true;this.ready=false;this.running=false;this.rejectLoad?.(new DOMException('Disposed','AbortError'));for(const w of Object.values(this.workers))w.terminate();cancelAnimationFrame(this.animation);for(const saved of this.histories.values())saved.image.close();this.histories.clear();this.gpu?.dispose();}
}
