import {DreamEngine} from './engine.js';
import {ResidentWebNNEngine} from './webnn-resident-engine.js?v=spatial-hooks-v2';
import {GPUCanny} from './gpu-canny.js';
import {numberToHalfBits} from './platform.js';
export class SpatialDreamEngine extends ResidentWebNNEngine{
 constructor(progress){super(progress);this.settings.geometryScale=1;}
 async load(canvas,options={}){
  const base=options.modelBase||new URL('https://pub-fd77318b30094f8a923cae6a232a72fa.r2.dev/assets/vendor/dream/models/256/',import.meta.url).href;
  this.spatial=await(await fetch(base+'manifest-spatial.json')).json();
  this.anchorFactor=options.anchorFactor||0;
  if(this.anchorFactor){
   if(![2,4].includes(this.anchorFactor))throw Error('Unsupported latent anchor factor');
   this.spatial.models.unet={...this.spatial.models.unet,graph:`unet-spatial-anchor${this.anchorFactor}.onnx`};
   this.spatial.models.encoder={...this.spatial.models.encoder,graph:'encoder-source-scheduled.onnx'};
  }
  return super.load(canvas,{...options,rgbOnly:false,privateLatents:false});
 }
 async session(name){
  if(name==='unet'||name==='geometry'||name==='encoder'&&this.anchorFactor){
   this.manifest.models[name]=this.spatial.models[name];
   return DreamEngine.prototype.session.call(this,name);
  }
  return super.session(name);
 }
 async constants(seed){
  await super.constants(seed);
  if(this.anchorFactor&&!this.sourceLatent){this.sourceLatent=await this.mlTensor([1,4,24,32],'float16');this.anchorAmount=await this.mlTensor([1]);}
 }
 extraEncoderOutputs(){return this.anchorFactor?{latent:this.sourceLatent.tensor}:{};}
 async prepareCondition(settings){
  if(!this.geometry){
   this.geometry=await Promise.all(this.spatial.geometryShapes.map(s=>this.mlTensor(s,'float16')));
   this.geometryScale=await this.mlTensor([1],'float16');
   this.edges=await this.tensor([1,1,192,256]);this.canny=new GPUCanny(this.gpu);
  }
  if(settings.geometryScale>0){
   await this.session('geometry');
   const {buffer,rounds}=await this.canny.run(this.gpu.reference);this.edgeRounds=rounds;
   await this.buffers([this.edges],b=>{const e=this.device.createCommandEncoder();e.copyBufferToBuffer(buffer,0,b,0,256*192*2);this.device.queue.submit([e.finish()]);});
   await this.sessions.geometry.run({edges:this.edges.tensor},Object.fromEntries(this.geometry.map((x,i)=>['geometry_'+i,x.tensor])));
  }
 }
 conditionInputs(settings){
  this.context.writeTensor(this.geometryScale.ml,new Uint16Array([numberToHalfBits(settings.geometryScale||0)]));
  const input={geometry_scale:this.geometryScale.tensor,...Object.fromEntries(this.geometry.map((x,i)=>['geometry_'+i,x.tensor]))};
  if(this.anchorFactor){this.context.writeTensor(this.anchorAmount.ml,new Float32Array([settings.anchorAmount||0]));input.source_latent=this.sourceLatent.tensor;input.anchor_amount=this.anchorAmount.tensor;}
  return input;
 }
 configure(settings){const changed=['geometryScale','anchorAmount'].some(k=>settings[k]!==undefined&&settings[k]!==this.settings[k]);super.configure(settings);if(changed)this.reset();}
}
