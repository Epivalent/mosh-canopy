// Exact LCM work with latent scheduling fused into WebNN graphs. The browser
// GPU RNG supplies the same normal samples once per seed; live pixels stay GPU resident.
import * as ort from './ort/ort.all.bundle.min.mjs';
import {DreamEngine,schedule} from './engine.js';
import {numberToHalfBits} from './platform.js';
export class ResidentWebNNEngine extends DreamEngine{
 async load(canvas,options={}){
  this.rgbOnly=!!options.rgbOnly;this.privateLatents=!!options.privateLatents;
  return super.load(canvas,{...options,backend:'webnn',staged:false});
 }
 async tensor(shape,dataType='float16'){
  // Only image I/O crosses the WebGPU boundary. Test ordinary ML tensors for
  // internal state separately, so their storage cost can be measured.
  if(this.privateLatents && !(shape.length===4&&shape[1]===3)){
   const value=await this.mlTensor(shape,dataType);return {...value,shape};
  }
  return super.tensor(shape,dataType);
 }
 async session(name){
  if(name==='encoder')this.manifest.models.encoder.graph='encoder-scheduled.onnx';
  if(name==='unet')this.manifest.models.unet.graph=this.rgbOnly?'unet-scheduled-rgb.onnx':'unet-scheduled.onnx';
  return super.session(name);
 }
 async mlTensor(shape,type='float32'){
  const ml=await this.context.createTensor({dataType:type,shape,writable:true});
  return {ml,tensor:ort.Tensor.fromMLTensor(ml,{dataType:type,dims:shape})};
 }
 async constants(seed){
  if(!this.scalars){
   this.scalars={};for(const name of ['alpha','next_alpha','skip','out_scale','timestep'])this.scalars[name]=await this.mlTensor([1]);
   for(const name of ['image_scale','history_enabled'])this.scalars[name]=await this.mlTensor([1],'float16');
   this.normals=await Promise.all(Array.from({length:5},()=>this.mlTensor([1,4,24,32])));
   this.randomBuffer=this.device.createBuffer({size:3072*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC});
   this.randomRead=this.device.createBuffer({size:3072*4,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST});
   this.randomSeed=this.device.createBuffer({size:16,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});
   this.randomPipeline=this.gpu.compute(`
    @group(0) @binding(0)var<storage,read_write>out:array<f32>;
    @group(0) @binding(1)var<uniform>p:vec4u;
    fn hash(n:u32)->u32{var x=n;x=(x^(x>>16u))*0x7feb352du;x=(x^(x>>15u))*0x846ca68bu;return x^(x>>16u);}
    fn normal(i:u32)->f32{let u=(f32(hash(i*2u+p.x)&0xffffffu)+1.)/16777217.;let v=f32(hash(i*2u+1u+p.x)&0xffffffu)/16777216.;return sqrt(-2.*log(u))*cos(6.2831853*v);}
    @compute @workgroup_size(128)fn main(@builtin(global_invocation_id)i:vec3u){if(i.x<3072u){out[i.x]=normal(i.x);}}`);
  }
  if(this.normalSeed!==seed){
   this.normalValues=[];
   for(let j=0;j<5;j++){
    this.device.queue.writeBuffer(this.randomSeed,0,new Uint32Array([seed+j,0,0,0]));
    this.gpu.dispatch(this.randomPipeline,[this.randomBuffer,this.randomSeed],24);
    const e=this.device.createCommandEncoder();e.copyBufferToBuffer(this.randomBuffer,0,this.randomRead,0,this.randomRead.size);this.device.queue.submit([e.finish()]);
    await this.randomRead.mapAsync(GPUMapMode.READ);const normal=new Float32Array(this.randomRead.getMappedRange()).slice();this.normalValues.push(normal);this.context.writeTensor(this.normals[j].ml,normal);this.randomRead.unmap();
   }
   this.normalSeed=seed;
  }
 }
 scalar(name,value){this.context.writeTensor(this.scalars[name].ml,['image_scale','history_enabled'].includes(name)?new Uint16Array([numberToHalfBits(value)]):new Float32Array([value]));return this.scalars[name].tensor;}
 async render(){
  const started=performance.now(),epoch=this.epoch,settings={...this.settings};
  if(this.rgbOnly&&settings.imageScale!==0)throw Error('RGB-only experiment requires imageScale=0');
  await this.constants(settings.seed);
  const frame=this.gpu.capture(),times=schedule(settings.steps,settings.strength),alpha=t=>this.manifest.alphas[t];
  await this.buffers([this.pixels],b=>this.gpu.prepare(b,this.manifest.width,this.manifest.height));
  await this.sessions.encoder.run({pixels:this.pixels.tensor,'lcm_schedule/alpha':this.scalar('alpha',alpha(times[0])),'lcm_schedule/normal':this.normals[0].tensor},{'lcm_schedule/sample':this.sample.tensor,...this.extraEncoderOutputs?.()});
  const afterEncode=performance.now();
  if(settings.imageScale>0){await this.session('vision');this.visionPixels??=await this.tensor([1,3,224,224]);await this.buffers([this.visionPixels],b=>this.gpu.prepare(b,224,224,true));await this.sessions.vision.run({pixels:this.visionPixels.tensor},{image_tokens:this.tokens.tensor});}
  if(this.prepareCondition)await this.prepareCondition(settings);
  const afterVision=performance.now();
  for(let i=0;i<times.length;i++){
   if(epoch!==this.epoch)return {accepted:false,cancelled:true};
   const scaled=times[i]*this.manifest.timestepScaling,sd=this.manifest.sigmaData,skip=sd*sd/(scaled*scaled+sd*sd),outScale=scaled/Math.sqrt(scaled*scaled+sd*sd);
   const input={sample:this.sample.tensor,timestep:this.scalar('timestep',times[i]),image_tokens:this.tokens.tensor,image_scale:this.scalar('image_scale',settings.imageScale),history_enabled:this.scalar('history_enabled',settings.memory&&this.frameCount>0?1:0),
    'lcm_schedule/alpha':this.scalar('alpha',alpha(times[i])), 'lcm_schedule/next_alpha':this.scalar('next_alpha',i===times.length-1?1:alpha(times[i+1])),
    'lcm_schedule/skip':this.scalar('skip',skip),'lcm_schedule/out_scale':this.scalar('out_scale',outScale),'lcm_schedule/normal':this.normals[i+1].tensor};
   const outputs={'lcm_schedule/sample':this.next.tensor};
   if(this.rgbOnly){delete input.image_tokens;delete input.image_scale;}
   if(this.conditionInputs)Object.assign(input,this.conditionInputs(settings));
   for(let j=0;j<this.history[i].length;j++){input['history_'+j]=this.history[i][j].tensor;outputs['next_history_'+j]=this.historySpare[i][j].tensor;}
   await this.sessions.unet.run(input,outputs);
   [this.history[i],this.historySpare[i]]=[this.historySpare[i],this.history[i]];[this.sample,this.next]=[this.next,this.sample];
  }
  const afterDenoise=performance.now();
  await this.sessions.decoder.run({latent:this.sample.tensor},{pixels:this.decoded.tensor});
  let accepted=false;if(epoch===this.epoch){await this.buffers([this.decoded],b=>{accepted=this.gpu.accept(b,frame)});this.frameCount++;}
  await this.device.queue.onSubmittedWorkDone();
  return {ms:performance.now()-started,encodeMs:afterEncode-started,visionMs:afterVision-afterEncode,denoiseMs:afterDenoise-afterVision,steps:settings.steps,strength:settings.strength,imageScale:settings.imageScale,staged:false,historyActive:settings.memory&&this.frameCount>1,timesteps:times,sourceFrame:frame,presentationFrame:this.gpu.frame,accepted,modelLoadCount:this.loadCount,residentScheduler:true};
 }
}
