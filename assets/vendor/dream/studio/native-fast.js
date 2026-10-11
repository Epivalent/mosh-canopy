import {NativePresent} from './native-present.js?v=flow5';
import {NativeRuntime} from './native-runtime.js?v=flow5';
import {nativeSchedule} from './native-prefix.js?v=flow5';
import {noiseBank} from './native-noise.js';
import {numberToHalfBits} from './platform.js';
const half=x=>Uint16Array.from(x,numberToHalfBits),latent=[1,4,64,64],scalar=[1,1,1,1];
// Same retained-state evolution as ContinuousState in the TD experiment.
// Each completed cycle executes ALL selected learned passes, then one decode.
export class NativeFast {
 async load(progress,provider='npu'){
  const r=this.r=await new NativeRuntime(progress).load(provider);
  this.tail=await r.session('tail-reuse');this.guideSession=await r.session('tail-guide');this.decoder=await r.session('decoder');
  const spec=r.manifest.models['tail-reuse'];this.f={};for(const [k,shape]of Object.entries(spec.inputs))this.f[k]=await r.tensor(shape);
  this.features=await Promise.all(Array.from({length:4},()=>r.tensor([1,320,64,64])));
  this.times=await Promise.all(Array.from({length:4},()=>r.tensor([1,1280,1,1])));
  this.noises=await Promise.all(Array.from({length:4},()=>r.tensor(latent)));
  this.encoded=await r.tensor(latent);this.ones=await r.tensor([1,1,64,64],half(new Float32Array(4096).fill(1)));
  this.scalar={};for(const k of ['alpha','beta','noiseScale','influence','step'])this.scalar[k]=await r.tensor(scalar);
  this.outputs=[];for(let i=0;i<2;i++){const b={};for(const [k,shape]of Object.entries(spec.outputs))b[k]=await r.tensor(shape);this.outputs.push(b);}
  this.states=[];for(let i=0;i<2;i++)this.states.push({clean:await r.tensor(latent),source:await r.tensor(latent)});
  this.init=await r.graph('initial-noisy-sample',{source:latent,noise:latent,alpha:scalar,beta:scalar,noiseScale:scalar},(b,x)=>({sample:b.add(b.mul(x.source,x.alpha),b.mul(b.mul(x.noise,x.beta),x.noiseScale))}));
  this.copyState=await r.graph('initialize-state',{clean:latent,source:latent},(b,x)=>{const one=b.constant({dataType:'float16',shape:[1]},half([1]));return {clean:b.mul(x.clean,one),source:b.mul(x.source,one)}});
  this.evolve=await r.graph('retained-state',{source:latent,previous:latent,state:latent,target:latent,influence:scalar,step:scalar,mask:[1,1,64,64],background:latent},(b,x)=>{
   const one=b.constant({dataType:'float16',shape:[1]},half([1]));
   const driven=b.add(x.state,b.mul(x.influence,b.sub(x.source,x.previous))),next=b.add(driven,b.mul(x.step,b.sub(x.target,driven)));
   return {clean:b.add(b.mul(x.mask,next),b.mul(b.sub(one,x.mask),x.background)),source:b.mul(x.source,one)};
  });
  this.presenter=await new NativePresent().load(r);this.decoded=this.presenter.tensor;this.rawGuide=await r.tensor([1,3,512,512]);this.guideDirty=true;this.readyPasses=new Set();this.pendingFeatures=new Map();this.stateIndex=0;return this;
 }
 configure(cfg,noises,epoch){
  this.desiredEpoch=epoch;this.pendingConfig={cfg:{...cfg}};
  // No graph rebuild, state reset or tensor upload in the control-message path.
 }
 applyConfiguration(cfg){
  this.cfg={...cfg};this.steps=nativeSchedule(this.r.manifest,cfg.index,cfg.passes);
  if(this.appliedNoiseSeed!==cfg.seed){
   const bank=noiseBank(cfg.seed);for(let i=0;i<4;i++)this.r.write(this.noises[i],bank[i]);this.appliedNoiseSeed=cfg.seed;
  }
  this.r.write(this.f.strength,half([cfg.spatial?cfg.controlStrength:0]));
  this.r.write(this.scalar.noiseScale,half([cfg.noise]));this.r.write(this.scalar.influence,half([cfg.sourceInfluence]));
  this.r.write(this.scalar.alpha,half([this.steps[0].coeff[0]]));this.r.write(this.scalar.beta,half([this.steps[0].coeff[1]]));
 }
 reset(epoch){this.epoch=epoch;this.hasState=false;this.readyPasses.clear();this.meta=null;this.lastTime=undefined;}
 source(packet){if(this.desiredEpoch===undefined||packet.meta.epoch===this.desiredEpoch)this.pendingSource=packet;}
 feature(packet){
  if(this.desiredEpoch!==undefined&&packet.meta.epoch!==this.desiredEpoch)return;
  // A refresh consists of distinct features for every selected denoising pass.
  // Never mix two refreshes, schedules or prompt embeddings in one cycle.
  const cfg=packet.cfg||this.cfg||this.pendingConfig?.cfg;
  if(!cfg)return;
  let batch=this.featureBatch;
  if(!batch||batch.epoch!==packet.meta.epoch||batch.seq!==packet.meta.input_seq){
   batch=this.featureBatch={epoch:packet.meta.epoch,seq:packet.meta.input_seq,cfg:{...cfg},packets:new Map()};
  }
  batch.packets.set(packet.pass,packet);
  if(Array.from({length:cfg.passes},(_,i)=>i).every(i=>batch.packets.has(i))){
   this.completedFeatures=batch;this.featureBatch=null;
  }
 }
 get ready(){
  const epoch=this.pendingSource?.meta.epoch??this.meta?.epoch;
  if(epoch===undefined||(this.desiredEpoch!==undefined&&epoch!==this.desiredEpoch))return false;
  return this.completedFeatures?.epoch===epoch||
   (this.epoch===epoch&&!!this.cfg&&Array.from({length:this.cfg.passes},(_,i)=>i).every(i=>this.readyPasses.has(i)));
 }
 async cycle(){
  if(!this.ready)return null;
  // Apply only complete bundles, at a boundary where no tail pass is in flight.
  // Continue using the previous bundle while a new style/schedule is preparing.
  if(this.pendingSource){
   const packet=this.pendingSource;this.pendingSource=null;
   if(packet.meta.epoch!==this.epoch)this.reset(packet.meta.epoch);
   for(const key of ['background','edit_mask'])this.r.write(this.f[key],packet[key]);this.r.write(this.rawGuide,packet.guide);this.guideDirty=true;
   this.r.write(this.encoded,packet.encoded);this.meta={...packet.meta};
  }
  const live=this.pendingConfig?.cfg;
  const bundle=this.completedFeatures;
  if(bundle?.epoch===this.epoch){
   const cfg={...bundle.cfg};
   for(const k of ['sourceInfluence','evolutionRate','composition'])if(live)cfg[k]=live[k];
   this.applyConfiguration(cfg);
   this.readyPasses.clear();
   for(const [pass,packet]of bundle.packets){
    this.r.write(this.features[pass],packet.hidden);this.r.write(this.times[pass],packet.time);this.readyPasses.add(pass);
   }
   this.r.write(this.f.encoder_hidden_states,bundle.packets.get(0).embedding);
   this.completedFeatures=null;
  }else if(live){
   if(this.cfg.sourceInfluence!==live.sourceInfluence)this.r.write(this.scalar.influence,half([live.sourceInfluence]));
   for(const k of ['sourceInfluence','evolutionRate','composition'])this.cfg[k]=live[k];
  }
  const r=this.r,cfg={...this.cfg},epoch=this.epoch,meta={...this.meta},now=performance.now();
  const dt=this.lastTime?Math.max(.001,Math.min(.15,(now-this.lastTime)/1000)):.001;this.lastTime=now;
  if(this.guideDirty){await this.guideSession.run({guide:this.rawGuide},{'/condition/conv_out/Conv_output_0':this.f.guide_features});this.guideDirty=false;}
  let sample=this.init({source:this.encoded,noise:this.noises[0],alpha:this.scalar.alpha,beta:this.scalar.beta,noiseScale:this.scalar.noiseScale}).sample;
  let result;
  for(let i=0;i<this.steps.length;i++){
   const step=this.steps[i],next=this.steps[i+1];
   r.write(this.f.coeff,half(step.coeff));r.write(this.f.next_coeff,half(next?next.coeff.slice(0,2):[1,0]));
   const applyMask=cfg.composition!=='off'&&(cfg.composition==='context'||i+2>=this.steps.length);
   result=await this.tail.run({...this.f,sample,hidden:this.features[i],time_embedding:this.times[i],next_noise:this.noises[Math.min(3,i+1)],edit_mask:applyMask?this.f.edit_mask:this.ones},this.outputs[i%2]);
   sample=result.next_sample;
  }
  const nextIndex=1-this.stateIndex,target=this.states[nextIndex];
  if(!this.hasState)this.copyState({clean:result.clean,source:this.encoded},target);
  else{
   r.write(this.scalar.step,half([-Math.expm1(-dt*cfg.evolutionRate)]));
   this.evolve({source:this.encoded,previous:this.states[this.stateIndex].source,state:this.states[this.stateIndex].clean,target:result.clean,influence:this.scalar.influence,step:this.scalar.step,mask:cfg.composition==='off'?this.ones:this.f.edit_mask,background:this.f.background},target);
  }
  this.stateIndex=nextIndex;this.hasState=true;
  await this.decoder.run({input:target.clean},{output:this.decoded});
  // The display owns presentation/readback; this is a completed-cycle ticket.
  return {tensor:this.decoded,meta,epoch,passes:cfg.passes,started:now};
 }
 async dispose(){this.presenter?.device.destroy();await this.r.dispose();}
}
