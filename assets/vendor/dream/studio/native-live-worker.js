// Persistent browser workers. Each queue keeps only the latest complete packet.
import {NativeRuntime} from './native-runtime.js?v=direct-assets1';
import {NativePrefix,nativeSchedule} from './native-prefix.js?v=direct-assets1';
import {NativeFast} from './native-fast.js?v=direct-assets1';
import {noiseBank} from './native-noise.js';
import {StudioGPU} from './studio-gpu.js?v=1';
import {NativeImageUpload} from './native-image-upload.js';
import {GPUCanny} from './gpu-canny.js';
import {numberToHalfBits as f16,halfToNumber as f32} from './platform.js';
const half=a=>Uint16Array.from(a,f16),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const earlyFeatures=new Map();
let role,engine,cfg,epoch=0,active=true,pending=null,busy=false,ready=false,noises,noiseSeed;
const send=(type,data={})=>postMessage({type,role,...data});
const progress=message=>send('status',{message});

function configuration(data){cfg=data.cfg;epoch=data.epoch;active=data.active!==false;if(noiseSeed!==cfg.seed){noiseSeed=cfg.seed;noises=noiseBank(cfg.seed)}if(role==='fast'&&ready)engine.configure(cfg,noises,epoch);}
export class Encoder {
 async load(){
  const r=this.r=await new NativeRuntime(progress).load('gpu');this.session=await r.session('encoder');
  const adapter=await navigator.gpu.requestAdapter();this.device=await adapter.requestDevice({requiredFeatures:['shader-f16']});this.width=this.height=512;
  this.compute=code=>this.device.createComputePipeline({layout:'auto',compute:{module:this.device.createShaderModule({code}),entryPoint:'main'}});
  this.dispatch=(pipeline,items,groups)=>{const entries=items.map((x,binding)=>({binding,resource:x instanceof GPUBuffer?{buffer:x}:x})),e=this.device.createCommandEncoder(),p=e.beginComputePass();p.setPipeline(pipeline);p.setBindGroup(0,this.device.createBindGroup({layout:pipeline.getBindGroupLayout(0),entries}));p.dispatchWorkgroups(groups);p.end();this.device.queue.submit([e.finish()]);};
  // Only RGB boundaries are exportable; deep feature tensors remain private.
  const {default:unused,...ort}=await import('./ort/ort.all.bundle.min.mjs');
  this.ml=await r.context.createExportableTensor({dataType:'float16',shape:[1,3,512,512]},this.device);
  this.input=ort.Tensor.fromMLTensor(this.ml,{dataType:'float16',dims:[1,3,512,512]});
  this.output=await r.tensor([1,4,64,64]);
  this.prep=await StudioGPU.create(new OffscreenCanvas(512,512));this.upload=new NativeImageUpload(this.prep);
  this.preparedTexture=this.device.createTexture({size:[512,512],format:'rgba8unorm',usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT});
  
  this.pack=this.compute(`enable f16;@group(0) @binding(0)var a:texture_2d<f32>;@group(0) @binding(1)var<storage,read_write>b:array<f16>;@compute @workgroup_size(128)fn main(@builtin(global_invocation_id)id:vec3u){let i=id.x;if(i>=262144u){return;}let v=textureLoad(a,vec2i(i32(i%512u),i32(i/512u)),0);for(var c=0u;c<3u;c++){b[c*262144u+i]=f16(v[c]);}}`);
  this.texture=this.device.createTexture({size:[512,512],format:'rgba8unorm',usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT});
  this.canny=new GPUCanny(this);this.read=this.device.createBuffer({size:512*512*2,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});
 }
 async encode(p){
  this.stage?.("prepare");const start=performance.now();if(this.epoch!==p.meta.epoch){this.prep.resetSource();this.epoch=p.meta.epoch;}this.prep.configure(p.settings||{});this.stage?.("source upload");this.upload.upload(p.image,this.prep.sourceTex);this.prep.hasSource=true;this.stage?.("prepare tick");this.prep.tick(start);this.stage?.("prepare draw");this.prep.draw(this.prep.programs.prepare,null,{source:this.prep.sourceTex,maskTex:this.prep.masks[this.prep.maskIndex]});
  this.stage?.("copy to WebGPU");this.device.queue.copyExternalImageToTexture({source:this.prep.canvas},{texture:this.preparedTexture},[512,512]);
  this.stage?.("export input");const b=await this.r.context.exportToGPU(this.ml);this.stage?.("pack input");this.dispatch(this.pack,[this.preparedTexture.createView(),b],2048);b.destroy();
  this.stage?.("run encoder");await this.session.run({input:this.input},{output:this.output});this.stage?.("read latent");const encoded=await this.r.read(this.output);const encodedAt=performance.now();
  this.device.queue.copyExternalImageToTexture({source:p.image},{texture:this.texture},[512,512]);p.image.close();
  this.stage?.("canny");const {buffer}=await this.canny.run(this.texture),e=this.device.createCommandEncoder();e.copyBufferToBuffer(buffer,0,this.read,0,512*512*2);this.device.queue.submit([e.finish()]);await this.read.mapAsync(GPUMapMode.READ);const mono=new Uint16Array(this.read.getMappedRange()).slice();this.read.unmap();
  const guide=new Uint16Array(3*512*512);for(let c=0;c<3;c++)guide.set(mono,c*512*512);
  return {encoded,background:encoded.slice(),edit_mask:new Uint16Array(4096).fill(f16(1)),guide,meta:p.meta,encodeMs:encodedAt-start,cannyMs:performance.now()-encodedAt};
 }
}
async function drain(){
 if(busy||!ready||!pending||!active)return;busy=true;
 try{
  while(pending&&active){const item=pending;pending=null;const ticketEpoch=item.meta.epoch;if(ticketEpoch!==epoch){item.image?.close();if(role==='encoder')send('inputReady',{meta:item.meta});continue;}
   if(role==='encoder'){try{const packet=await engine.encode(item);if(ticketEpoch===epoch)send('source',{packet});}finally{send('inputReady',{meta:item.meta});}}
   if(role==='prefix'){
    const settings={...cfg},bank=noises;const steps=nativeSchedule(engine.r.manifest,settings.index,settings.passes),sample=new Uint16Array(item.encoded.length);
    for(let i=0;i<sample.length;i++)sample[i]=f16(f32(item.encoded[i])*steps[0].coeff[0]+f32(bank[0][i])*steps[0].coeff[1]*settings.noise);
    const start=performance.now();await engine.refresh({...item,sample,noises:bank},settings,packet=>{if(ticketEpoch===epoch)send('feature',{packet})});
    if(ticketEpoch===epoch)send('prefixMetric',{ms:performance.now()-start,meta:item.meta});
   }
  }
 }catch(e){send('error',{error:e.stack||String(e)});}finally{busy=false;}
}
async function fastLoop(){
 let previous;
 while(ready){
  if(!active||!engine.ready){await sleep(20);continue;}
  try{
   const ticket=await engine.cycle();if(!ticket){await sleep(10);continue;}
   // Always finish the dispatched GPU work, even when its epoch was cancelled.
   // ORT run resolves after enqueueing, not after hardware completion.
   const {bitmap,changed}=await engine.presenter.present();if(ticket.epoch!==epoch){bitmap.close();continue;}
   postMessage({type:'image',role,bitmap,meta:ticket.meta,epoch:ticket.epoch,passes:ticket.passes,prompt:ticket.prompt,ms:performance.now()-ticket.started,changed},[bitmap]);
  }catch(e){send('error',{error:e.stack||String(e)});active=false;}
 }
}
onmessage=async({data})=>{
 try{
  if(data.type==='load'){
   role=data.role;configuration(data);
   engine=role==='encoder'?new Encoder():role==='prefix'?new NativePrefix():new NativeFast();await engine.load(progress,data.backend);ready=true;globalThis.liveDebug={engine,role,get cfg(){return cfg}};
   if(role==='fast'){engine.configure(cfg,noises,epoch);for(const packet of earlyFeatures.values())engine.feature(packet);earlyFeatures.clear();}send('ready');if(role==='fast')void fastLoop();else void drain();return;
  }
  if(data.type==='configure'){configuration(data);void drain();return;}
  if(data.type==='frame'||data.type==='source'){
   if(role==='fast')engine.source(data.packet);else{pending?.image?.close();pending=data.packet;void drain();}return;
  }
  if(data.type==='feature'){if(ready)engine.feature(data.packet);else earlyFeatures.set(data.packet.pass,data.packet);}
 }catch(e){send('error',{error:e.stack||String(e)});}
};
