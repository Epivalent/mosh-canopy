// Browser-only model ownership. No TD endpoints, Python or native helper.
import * as ort from './ort/ort.all.bundle.min.mjs';
import {DreamAssets} from './assets.js';

export class NativeRuntime {
  constructor(progress=()=>{}) { this.progress=progress; this.sessions=new Map(); this.tensors=new Set(); }
  async load(provider='npu') {
    this.provider=provider; this.assets=new DreamAssets(this.progress);
    this.base=new URL('https://mosh-canopy-assets.moshcanopy.workers.dev/assets/vendor/dream/studio/turbo-models/',import.meta.url).href;
    this.manifest=await(await fetch(this.base+'manifest.json',{cache:'no-store'})).json();
    ort.env.wasm.numThreads=1;
    ort.env.wasm.wasmPaths=new URL('./ort/',import.meta.url).href;
    ort.env.wasm.wasmBinary=await this.assets.read(new URL('./ort/ort-wasm-simd-threaded.jsep.wasm',import.meta.url).href,'Browser runtime','dream-runtime-ort-1.30.0');
    if(provider!=='webgpu') {
      if(!navigator.ml)throw Error('WebNN is unavailable. Select WebGPU.');
      this.context=await navigator.ml.createContext({deviceType:provider,powerPreference:'high-performance'});
    }
    return this;
  }
  async session(name) {
    if(this.sessions.has(name))return this.sessions.get(name);
    const spec=this.manifest.models[name];
    const graph=await this.assets.read(this.base+spec.graph+'?v='+spec.sha256,name+' graph','dream-turbo-512-v1');
    const weights=await this.assets.read(this.base+spec.weights+'?v='+spec.sha256,name+' weights','dream-turbo-512-v1');
    this.progress(`Compiling ${name} once · ${this.provider}`);
    const start=performance.now();
    const session=await ort.InferenceSession.create(graph,{
      graphOptimizationLevel:'basic',
      executionProviders:this.context?[{name:'webnn',context:this.context}]:[{name:'webgpu'}],
      externalData:[{path:spec.weights,data:new Uint8Array(weights)}],
      preferredOutputLocation:this.context?'ml-tensor':'gpu-buffer',
      extra:{session:{disable_cpu_ep_fallback:'1',use_ort_model_bytes_directly:'1',use_ort_model_bytes_for_initializers:'1'}},
    });
    this.sessions.set(name,session);this.progress(`${name} compiled · ${((performance.now()-start)/1000).toFixed(1)} s`);
    return session;
  }
  async tensor(shape, values, dataType='float16') {
    if(!this.context)return new ort.Tensor(dataType,values,shape);
    const ml=await this.context.createTensor({dataType,shape,writable:true,readable:true});
    if(values)this.context.writeTensor(ml,values);
    const tensor=ort.Tensor.fromMLTensor(ml,{dataType,dims:shape});
    this.tensors.add(ml);return tensor;
  }
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
    for(const s of this.sessions.values())await s.release();
    for(const g of this.graphs?.values()||[])g.graph.destroy();
    for(const t of this.tensors)t.destroy();this.context?.destroy();
  }
}
