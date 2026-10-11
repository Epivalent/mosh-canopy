import * as ort from './ort/ort.matrix.experimental.mjs';
import {DreamAssets} from './assets.js';
import {DreamGPU} from './gpu.js';
import {inspectGPU,numberToHalfBits,halfToNumber} from './platform.js';

export function schedule(steps,strength,originalSteps=100){
  const n=Math.floor(originalSteps*strength),k=Math.floor(1000/originalSteps);
  if(![1,2,4].includes(steps)||n<steps)throw Error('Invalid LCM schedule');
  return Array.from({length:steps},(_,i)=>(n-Math.floor(i*n/steps))*k-1);
}
const half=x=>new Uint16Array([numberToHalfBits(x)]);
const product=s=>s.reduce((a,b)=>a*b,1);

export class DreamEngine {
  constructor(progress=()=>{}){this.progress=progress;this.sessions={};this.loadCount=0;this.frameCount=0;this.epoch=0;this.settings={steps:1,strength:.7,imageScale:0,memory:true,mix:.85,motion:true,maxFps:8,seed:42};}
  async load(canvas,{backend='webgpu',layout='NHWC',capture=true,staged=true,stageBatch=8,profile=false,stagesManifest=null,disableOptimizers=null,modelBase=new URL('https://mosh-canopy-assets.moshcanopy.workers.dev/assets/vendor/dream/models/256/',import.meta.url).href}={}){
    this.disableOptimizers=disableOptimizers;this.stagesManifest=stagesManifest;this.stageBatch=Math.max(1,Math.min(40,Math.floor(Number(stageBatch))||1));this.profile=profile;this.base=modelBase;this.backend=backend;this.layout=layout;this.capture=backend==='webgpu'&&capture;this.staged=backend==='webgpu'&&staged;
    const {report}=await inspectGPU();this.platform=report;this.progress('GPU: '+report.gpu+' · FP16');this.progress('Reading model manifest');
    const r=await fetch(this.base+'manifest-fusion-v3.json');if(!r.ok)throw Error('Browser model export is missing');this.manifest=await r.json();
    ort.env.wasm.numThreads=1;ort.env.wasm.wasmPaths=new URL('./ort/',import.meta.url).href;
    this.assets=new DreamAssets(this.progress);this.compilations=[];
    ort.env.wasm.wasmBinary=await this.assets.read(new URL('./ort/ort-wasm-simd-threaded.jsep.wasm',import.meta.url).href,'ONNX runtime','dream-runtime-ort-1.30.0');
    if(backend==='webgpu'){
      // The JSEP backend creates its own device. env.webgpu.device is an
      // OUTPUT of initialization, not a way to inject a custom device.
      // Every bound tensor and custom kernel must use that exact device.
      ort.env.webgpu.powerPreference='high-performance';
      await this.session('encoder');this.device=ort.env.webgpu.device;
      if(!this.device?.features.has('shader-f16'))throw Error('A WebGPU device with shader-f16 is required');
    }else{
      const adapter=await navigator.gpu.requestAdapter({powerPreference:'high-performance'});
      if(!adapter?.features.has('shader-f16'))throw Error('A WebGPU adapter with shader-f16 is required');
      this.device=await adapter.requestDevice({requiredFeatures:['shader-f16'],requiredLimits:{maxStorageBufferBindingSize:Math.min(adapter.limits.maxStorageBufferBindingSize,2147483648),maxBufferSize:Math.min(adapter.limits.maxBufferSize,2147483648)}});
      if(!navigator.ml)throw Error('WebNN is unavailable. Choose WebGPU for this browser.');
      this.context=await navigator.ml.createContext({deviceType:'gpu',powerPreference:'high-performance'});
      if(typeof this.context.createExportableTensor!=='function')throw Error('This browser lacks the experimental WebNN GPU tensor bridge. Choose WebGPU.');
    }
    this.device.addEventListener('uncapturederror',e=>this.progress('GPU error: '+e.error.message));
    this.device.lost.then(info=>{if(info.reason!=='destroyed'){const error='GPU device lost: '+info.message;this.reset();if(this.onError)this.onError(error);else this.progress(error);}});
    const {width,height}=this.manifest;this.gpu=new DreamGPU(this.device,canvas,width,height);
    this.pixels=await this.tensor([1,3,height,width]);this.latent=await this.tensor([1,4,height/8,width/8]);
    this.sample=await this.tensor(this.latent.shape);this.next=await this.tensor(this.latent.shape);this.noise=await this.tensor(this.latent.shape);
    this.decoded=await this.tensor(this.pixels.shape);this.tokens=await this.tensor([1,4,768]);
    this.history=[];this.historySpare=[];
    for(let step=0;step<4;step++){
      this.history.push(await Promise.all(this.manifest.history.map(h=>this.tensor(h.shape))));
      // Captured execution writes to stable output buffers, then copies once
      // into the per-step cache. It never uses a second per-step cache bank.
      if(!this.capture)this.historySpare.push(await Promise.all(this.manifest.history.map(h=>this.tensor(h.shape))));
    }
    if(this.capture){
      this.boundHistory=await Promise.all(this.manifest.history.map(h=>this.tensor(h.shape)));
      this.boundNextHistory=await Promise.all(this.manifest.history.map(h=>this.tensor(h.shape)));
      this.timeScalar=await this.tensor([1],'float32');this.imageScalar=await this.tensor([1]);this.historyScalar=await this.tensor([1]);
    }
    // Small graphs first surface backend incompatibilities before the UNet download.
    for(const name of ['encoder','decoder'])await this.session(name);
    if(this.staged)await this.loadStages();else await this.session('unet');
    this.loadCount++;this.loaded=true;this.progress('Warming the resident model');
    const blank=new OffscreenCanvas(width,height);blank.getContext('2d').fillRect(0,0,width,height);
    this.gpu.source(blank.transferToImageBitmap());await this.render();
    if(backend==='webgpu')await this.verifyInference();
    this.reset();
    this.progress('Ready');return {backend,modelLoadCount:this.loadCount,width,height,platform:this.platform,assets:this.assets.reads,cacheWarnings:this.assets.warnings,compilations:this.compilations};
  }
  async verifyInference(){
    // One startup readback catches device/binding failures that otherwise look
    // like fast successful inference. Live inference never reads pixels back.
    const b=this.device.createBuffer({size:this.noise.buffer.size,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});
    const e=this.device.createCommandEncoder();e.copyBufferToBuffer(this.noise.buffer,0,b,0,b.size);this.device.queue.submit([e.finish()]);
    await b.mapAsync(GPUMapMode.READ);const values=new Uint16Array(b.getMappedRange());
    const valid=values.every(x=>(x&0x7c00)!==0x7c00)&&values.some(x=>Math.abs(halfToNumber(x))>1e-4);b.unmap();b.destroy();
    if(!valid)throw Error('Denoiser startup validation failed: output is zero or non-finite');
    this.progress('Validated nonzero denoiser output on the shared GPU device');
  }
  async session(name){
    if(this.sessions[name])return this.sessions[name];
    if(this.staged&&name==='vision'){await this.loadStages('vision');return this.sessions.vision;}
    const spec=this.manifest.models[name];if(!spec)throw Error(`${name} model not exported`);
    this.progress(`Loading ${name} (${Math.round(spec.bytes/1048576)} MB)`);
    const graph=await this.assets.read(this.base+spec.graph,`${name} graph`),weights=spec.weights?await this.assets.read(this.base+spec.weights,`${name} weights`):null;
    this.progress(`Preparing ${name} with ${this.backend}`);
    const options={executionProviders:this.backend==='webnn'?[{name:'webnn',context:this.context}]:[{name:'webgpu',preferredLayout:this.layout}],
      enableGraphCapture:this.capture,
      externalData:weights?[{path:spec.weights.split('/').pop(),data:new Uint8Array(weights)}]:[],
      preferredOutputLocation:this.backend==='webnn'?'ml-tensor':'gpu-buffer',
      extra:{...(this.disableOptimizers?{optimization:{disable_specified_optimizers:this.disableOptimizers}}:{}),session:{disable_cpu_ep_fallback:'1',use_ort_model_bytes_directly:'1',use_ort_model_bytes_for_initializers:'1'}}};
    const started=performance.now();
    this.sessions[name]=await ort.InferenceSession.create(graph,options);
    this.compilations.push({name,ms:performance.now()-started});
    if(name==='encoder')ort.env.wasm.wasmBinary=undefined;
    this.progress(`${name} compiled in ${((performance.now()-started)/1000).toFixed(1)}s`);
    return this.sessions[name];
  }
  async loadStages(kind='unet'){
    const directory=kind==='unet'?'stages':'vision-stages';
    const manifestPath=kind==='unet'?(this.stagesManifest||this.manifest.stagesManifest||directory+'/manifest.json'):directory+'/manifest-fp16-slice.json';
    const {stages}=await(await fetch(this.base+manifestPath)).json();
    const tensors=new Map(),sessions=[];
    for(let i=0;i<stages.length;i++){
      const spec=stages[i],name=`${kind}-stage-${i}`;
      this.manifest.models[name]={...spec,graph:directory+'/'+spec.graph,weights:spec.weights?directory+'/'+spec.weights:null};
      this.progress(`Loading cooperative ${kind} stage ${i+1}/${stages.length}`);
      // ONNX external-data paths are relative to each stage file.
      sessions.push(await this.session(name));
      for(const v of spec.outputs)if(!tensors.has(v.name)&&!v.name.startsWith('next_history_')&&v.name!=='noise')tensors.set(v.name,await this.tensor(v.shape,v.type));
    }
    this.stagePrograms??={};this.stagePrograms[kind]={stages,tensors,sessions};
    let bindings;
    this.sessions[kind]={run:async(feeds,outputs)=>{
      if(!this.capture||!bindings){
      const values=new Map([...tensors].map(([name,value])=>[name,value.tensor]));
      for(const [name,tensor]of Object.entries({...feeds,...outputs}))values.set(name,tensor);
      bindings=stages.map(spec=>({inputs:Object.fromEntries(spec.inputs.map(v=>[v.name,values.get(v.name)])),outputs:Object.fromEntries(spec.outputs.map(v=>[v.name,values.get(v.name)]))}));
      }
      const batch=kind==='unet'?this.stageBatch:1;
      for(let first=0;first<stages.length;first+=batch){
        const end=Math.min(first+batch,stages.length),start=performance.now();
        for(let i=first;i<end;i++)await sessions[i].run(bindings[i].inputs,bindings[i].outputs);
        const dispatched=performance.now();
        await this.device.queue.onSubmittedWorkDone();
        const completed=performance.now();
        this.sliceMax=Math.max(this.sliceMax||0,completed-start);
        // Bound queued inference work so the independent presenter gets GPU time.
        if(globalThis.scheduler?.yield)await globalThis.scheduler.yield();else await new Promise(r=>setTimeout(r,0));
        if(this.profile)this.stageProfile.push({kind,first,end,dispatchMs:dispatched-start,waitMs:completed-dispatched,yieldMs:performance.now()-completed});
      }
    }};
  }
  async tensor(shape,dataType='float16'){
    if(this.backend==='webnn'){
      const ml=await this.context.createExportableTensor({dataType:'float16',shape},this.device);
      return {shape,ml,tensor:ort.Tensor.fromMLTensor(ml,{dataType:'float16',dims:shape})};
    }
    const buffer=this.device.createBuffer({size:Math.ceil(product(shape)*(dataType==='float16'?2:4)/16)*16,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST});
    return {shape,buffer,tensor:ort.Tensor.fromGpuBuffer(buffer,{dataType,dims:shape})};
  }
  copy(from,to){const e=this.device.createCommandEncoder();e.copyBufferToBuffer(from.buffer,0,to.buffer,0,product(from.shape)*2);this.device.queue.submit([e.finish()]);}
  copyMany(from,to){const e=this.device.createCommandEncoder();for(let i=0;i<from.length;i++)e.copyBufferToBuffer(from[i].buffer,0,to[i].buffer,0,product(from[i].shape)*2);this.device.queue.submit([e.finish()]);}
  async buffers(tensors,fn){
    const buffers=[];
    try{for(const t of tensors)buffers.push(t.buffer||await this.context.exportToGPU(t.ml));return fn(...buffers);}
    finally{if(this.backend==='webnn')buffers.forEach(b=>b.destroy());}
  }
  configure(settings){
    if(settings.stageBatch!==undefined)this.stageBatch=Math.max(1,Math.min(40,Math.floor(Number(settings.stageBatch))||1));
    const previous=this.settings;this.settings={...previous,...settings};
    if(['steps','strength','imageScale','memory','seed'].some(k=>previous[k]!==this.settings[k]))this.reset();
    if(this.gpu){this.gpu.mix=this.settings.mix;this.gpu.motion=this.settings.motion;this.gpu.draw();}
  }
  reset(){this.epoch++;this.frameCount=0;this.gpu?.reset();}
  source(bitmap){this.gpu.source(bitmap);}
  async render(){
    const started=performance.now(),epoch=this.epoch,settings={...this.settings};
    const frame=this.gpu.capture(),times=schedule(settings.steps,settings.strength);this.sliceMax=0;this.stageProfile=[];
    const alpha=t=>this.manifest.alphas[t];
    await this.buffers([this.pixels],b=>this.gpu.prepare(b,this.manifest.width,this.manifest.height));
    await this.sessions.encoder.run({pixels:this.pixels.tensor},{latent:this.latent.tensor});
    if(this.profile)await this.device.queue.onSubmittedWorkDone();
    const afterEncode=performance.now();
    if(settings.imageScale>0){
      await this.session('vision');this.visionPixels??=await this.tensor([1,3,224,224]);
      await this.buffers([this.visionPixels],b=>this.gpu.prepare(b,224,224,true));
      await this.sessions.vision.run({pixels:this.visionPixels.tensor},{image_tokens:this.tokens.tensor});
    }
    if(this.profile)await this.device.queue.onSubmittedWorkDone();
    const afterVision=performance.now();
    await this.buffers([this.latent,this.noise,this.sample],(a,b,o)=>this.gpu.step(a,b,o,{alpha:alpha(times[0]),mode:0,seed:settings.seed}));
    for(let i=0;i<times.length;i++){
      if(epoch!==this.epoch)return {accepted:false,cancelled:true};
      const input={sample:this.sample.tensor,timestep:new ort.Tensor('float32',new Float32Array([times[i]]),[1]),
        image_tokens:this.tokens.tensor,image_scale:new ort.Tensor('float16',half(settings.imageScale),[1]),
        history_enabled:new ort.Tensor('float16',half(settings.memory&&this.frameCount>0?1:0),[1])};
      const outputs={noise:this.noise.tensor};
      if(this.capture){
        this.device.queue.writeBuffer(this.timeScalar.buffer,0,new Float32Array([times[i]]));
        this.device.queue.writeBuffer(this.imageScalar.buffer,0,new Uint16Array([half(settings.imageScale)[0],0]));
        this.device.queue.writeBuffer(this.historyScalar.buffer,0,new Uint16Array([half(settings.memory&&this.frameCount>0?1:0)[0],0]));
        input.timestep=this.timeScalar.tensor;input.image_scale=this.imageScalar.tensor;input.history_enabled=this.historyScalar.tensor;
      }
      if(this.capture)this.copyMany(this.history[i],this.boundHistory);
      for(let j=0;j<this.history[i].length;j++){
        input['history_'+j]=(this.capture?this.boundHistory[j]:this.history[i][j]).tensor;
        outputs['next_history_'+j]=(this.capture?this.boundNextHistory[j]:this.historySpare[i][j]).tensor;
      }
      await this.sessions.unet.run(input,outputs);
      if(this.capture)this.copyMany(this.boundNextHistory,this.history[i]);
      else [this.history[i],this.historySpare[i]]=[this.historySpare[i],this.history[i]];
      const scaled=times[i]*this.manifest.timestepScaling,sd=this.manifest.sigmaData;
      const skip=sd*sd/(scaled*scaled+sd*sd),outScale=scaled/Math.sqrt(scaled*scaled+sd*sd);
      await this.buffers([this.sample,this.noise,this.next],(a,b,o)=>this.gpu.step(a,b,o,{alpha:alpha(times[i]),nextAlpha:i===times.length-1?1:alpha(times[i+1]),skip,outScale,seed:settings.seed+1+i}));
      if(this.capture)this.copy(this.next,this.sample);else [this.sample,this.next]=[this.next,this.sample];
      // Do not enqueue all four denoising passes ahead of the display worker.
      if(i<times.length-1){await this.device.queue.onSubmittedWorkDone();await new Promise(r=>setTimeout(r,0));}
    }
    if(this.profile)await this.device.queue.onSubmittedWorkDone();
    const afterDenoise=performance.now();
    await this.sessions.decoder.run({latent:this.sample.tensor},{pixels:this.decoded.tensor});
    if(this.profile)await this.device.queue.onSubmittedWorkDone();
    const afterDecode=performance.now();
    let accepted=false;
    if(epoch===this.epoch){await this.buffers([this.decoded],b=>{accepted=this.gpu.accept(b,frame)});this.frameCount++;}
    await this.device.queue.onSubmittedWorkDone();
    return {ms:performance.now()-started,encodeMs:afterEncode-started,visionMs:afterVision-afterEncode,denoiseMs:afterDenoise-afterVision,
      ...(this.profile?{profile:{stages:this.stageProfile,decodeMs:afterDecode-afterDenoise,presentMs:performance.now()-afterDecode},stageBatch:this.stageBatch}:{}),
      steps:settings.steps,strength:settings.strength,imageScale:settings.imageScale,staged:this.staged,featureFusion:this.manifest.featureFusion||null,historyActive:settings.memory&&this.frameCount>1,maxGpuSliceMs:this.sliceMax,timesteps:times,sourceFrame:frame,presentationFrame:this.gpu.frame,accepted,modelLoadCount:this.loadCount};
  }
}
