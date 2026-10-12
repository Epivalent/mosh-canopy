// Browser-only model ownership. No TD endpoints, Python or native helper.
import * as ort from './ort/ort.all.bundle.min.mjs';
import {DreamAssets} from './assets.js?v=direct-assets1';
import {PreparedModels,SESSION_SETTINGS,captureTranslation,completeRecord,exclusiveOrt} from './prepared-models.js';
let wasmPreparation;

export class NativeRuntime {
  constructor(progress=()=>{}) { this.progress=progress; this.sessions=new Map(); this.tensors=new Set();this.preparing=new Map(); }
  async load(provider='npu') {
    if(provider!=='webgpu'&&!navigator.ml)throw Error('WebNN is unavailable. Select WebGPU.');
    this.provider=provider; this.assets=new DreamAssets(this.progress,{legacyOrigins:["https://mosh-canopy-assets.moshcanopy.workers.dev","https://pub-fd77318b30094f8a923cae6a232a72fa.r2.dev"]});
    this.base=new URL('https://pub-fd77318b30094f8a923cae6a232a72fa.r2.dev/assets/vendor/dream/studio/turbo-models/',import.meta.url).href;
    this.metadataBase=new URL('./model-metadata/562fb01da7bfa263cbe78acf4e7e01dde20c1fcca3ed77667bb2ac8374406b30/',import.meta.url).href;
    const manifest=this.assets.json(this.metadataBase+'manifest.json','Dream model manifest');
    let context;
    if(provider!=='webgpu') {
      context=navigator.ml.createContext({deviceType:provider,powerPreference:'high-performance'});
      this.prepared=new PreparedModels(this);
    }
    try{[this.manifest,this.context]=await Promise.all([manifest,context]);}
    catch(e){context?.then(value=>value.destroy(),()=>{});throw e;}
    return this;
  }
  async session(name) {
    if(this.sessions.has(name))return this.sessions.get(name);
    if(this.preparing.has(name))return this.preparing.get(name);
    const pending=this.prepareSession(name).then(session=>{this.sessions.set(name,session);this.progress.modelReady?.(name);return session;}).finally(()=>this.preparing.delete(name));
    this.preparing.set(name,pending);return pending;
  }
  async prepareOrt(){
    // A restored WebNN graph doesn't need ONNX parsing or a WASM runtime.
    // Retain exactly the existing ORT setup for cache misses and WebGPU models.
    wasmPreparation??=(async()=>{
      ort.env.wasm.numThreads=1;
      ort.env.wasm.wasmPaths=new URL('./ort/',import.meta.url).href;
      ort.env.wasm.wasmBinary=await this.assets.read(new URL('./ort/ort-wasm-simd-threaded.jsep.wasm',import.meta.url).href,'Browser runtime','dream-runtime-ort-1.30.0');
    })().catch(e=>{wasmPreparation=null;throw e;});
    await wasmPreparation;
  }
  async prepareSession(name){
    const spec=this.manifest.models[name];
    if(!spec)throw Error('Unknown Dream model: '+name);
    const entry=await this.prepared?.entry(name),restored=await this.prepared?.load(entry,name);
    if(restored)return restored;
    await this.prepareOrt();
    const graph=await this.assets.read(this.base+spec.graph+'?v='+(entry?.model.graph||spec.sha256),name+' graph','dream-turbo-512-v1');
    const weights=await this.assets.read(this.base+spec.weights+'?v='+spec.sha256,name+' weights','dream-turbo-512-v1');
    this.progress(`Preparing ${name} graph · ${this.provider}`);
    const start=performance.now();
    const create=()=>ort.InferenceSession.create(graph,{
      ...SESSION_SETTINGS,
      executionProviders:this.context?[{name:'webnn',context:this.context}]:[{name:'webgpu'}],
      externalData:[{path:spec.weights,data:new Uint8Array(weights)}],
      preferredOutputLocation:this.context?'ml-tensor':'gpu-buffer',
    });
    let session;
    if(entry){
      const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',graph)),x=>x.toString(16).padStart(2,'0')).join('');
      if(digest===entry.model.graph){
        const captured=await captureTranslation(this.context,create);session=captured.session;
        await this.prepared.save(entry,name,completeRecord(captured.records,session),session);
      }else this.prepared.warn(Error(name+': preparation identity does not match graph bytes'));
    }
    session??=await exclusiveOrt(create);
    this.progress(`${name} prepared · ${((performance.now()-start)/1000).toFixed(1)} s`);
    return session;
  }
  async tensor(shape, values, dataType='float16') {
    if(!this.context)return new ort.Tensor(dataType,values,shape);
    const ml=await this.context.createTensor({dataType,shape,writable:true,readable:true});
    if(values)this.context.writeTensor(ml,values);
    const tensor=ort.Tensor.fromMLTensor(ml,{dataType,dims:shape});
    this.tensors.add(ml);return tensor;
  }
  async tensorMap(shapes){return Object.fromEntries(await Promise.all(Object.entries(shapes).map(async([name,shape])=>[name,await this.tensor(shape)])));}
  write(tensor,values){this.context.writeTensor(tensor.mlTensor,values);}
  async execute(name,feeds){
    const session=await this.session(name),spec=this.manifest.models[name];
    this.bindings??=new Map();
    if(!this.bindings.has(name)){
      const bound={};for(const [key,shape] of Object.entries(spec.outputs||{output:spec.output}))bound[key]=await this.tensor(shape);
      this.bindings.set(name,bound);
    }
    const actual=Object.fromEntries(session.inputNames.map(key=>{const value=feeds[key]||feeds[spec.inputAliases?.[key]];if(!value)throw Error(name+': missing '+key);return [key,value]}));
    return session.run(actual,this.bindings.get(name));
  }
  async graph(name,shapes,build){
    this.graphs??=new Map();if(this.graphs.has(name))return this.graphs.get(name);
    const builder=new MLGraphBuilder(this.context),operands={};
    for(const [key,shape] of Object.entries(shapes))operands[key]=builder.input(key,{dataType:'float16',shape});
    const outputs=build(builder,operands),graph=await builder.build(outputs),bound={};
    for(const [key,operand] of Object.entries(outputs))bound[key]=await this.tensor(operand.shape);
    const run=(inputs,outputs=bound)=>{this.context.dispatch(graph,Object.fromEntries(Object.entries(inputs).map(([k,t])=>[k,t.mlTensor])),Object.fromEntries(Object.entries(outputs).map(([k,t])=>[k,t.mlTensor])));return outputs;};
    run.graph=graph;run.outputs=bound;
    this.graphs.set(name,run);return run;
  }
  async read(tensor) {
    if(this.context)return new Uint16Array(await this.context.readTensor(tensor.mlTensor));
    const data=await tensor.getData();
    return new Uint16Array(data.buffer,data.byteOffset,data.byteLength/2);
  }
  async dispose() {
    await Promise.allSettled(this.preparing.values());
    for(const s of this.sessions.values())await s.release();
    for(const g of this.graphs?.values()||[])g.graph.destroy();
    for(const t of this.tensors)t.destroy();this.context?.destroy();
  }
}
