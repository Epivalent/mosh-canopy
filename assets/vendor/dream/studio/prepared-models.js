// Persist the exact output of ONNX Runtime's WebNN translation. Native browser
// compilation remains in builder.build(); its opaque MLGraph isn't serializable.
import {captureBuilders,pack,unpack,restore} from './graph-checkpoint.js';
export const PREPARED_CACHE='dream-webnn-prepared-v1';
export const SESSION_SETTINGS={graphOptimizationLevel:'basic',extra:{session:{disable_cpu_ep_fallback:'1',use_ort_model_bytes_directly:'1',use_ort_model_bytes_for_initializers:'1'}}};
const hex=bytes=>Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');
export async function fingerprint(value){return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value))));}
const sameNames=(a,b)=>a.length===b.length&&a.every(x=>b.includes(x));
// ORT's WASM instance has a shared currentContext/Asyncify state during create.
// Only that non-reentrant operation is exclusive; checkpoint replay and native
// WebNN builds do not use it and can all proceed independently.
let translating=Promise.resolve();
export async function exclusiveOrt(create){
 const previous=translating;let unlock;translating=new Promise(r=>unlock=r);await previous;
 try{return await create();}finally{unlock();}
}
export async function captureTranslation(context,create){
 return exclusiveOrt(async()=>{
  const capture=captureBuilders(context);
  try{return {session:await create(),records:capture.records};}
  finally{capture.stop();}
 });
}
export function completeRecord(records,session){
 const built=records.filter(x=>x.buildMs!==null);
 if(built.length!==1)return null;
 const record=built[0];
 if(record.error||!sameNames(Object.keys(record.inputs),session.inputNames)||!sameNames(Object.keys(record.outputs||{}),session.outputNames))return null;
 return record;
}
export class PreparedModels {
 constructor(runtime){this.r=runtime;this.diagnostics=[];}
 async identity(){
  this.identityPromise??=this.r.assets.json(new URL('./preparation-identity.json',import.meta.url).href,'Dream preparation identity').catch(e=>{this.warn(e);return null;});
  return this.identityPromise;
 }
 warn(e){this.diagnostics.push({warning:e.message});console.warn('Dream preparation cache:',e.message);}
 async entry(name){
  try{
   const identity=await this.identity(),model=identity?.models[name],spec=this.r.manifest.models[name];
   if(identity?.format!==1||!model?.graph||model.weights!==spec.sha256||!globalThis.caches)return null;
   this.browserPromise??=navigator.userAgentData?.getHighEntropyValues(['fullVersionList','platformVersion','architecture','bitness']).catch(()=>null)||Promise.resolve(null);
   const dependencies={format:1,model,translator:identity.translator,settings:SESSION_SETTINGS,spec,
    deviceType:this.r.provider,powerPreference:'high-performance',browser:navigator.userAgent,
    browserBuild:await this.browserPromise,limits:this.r.context.opSupportLimits()};
   const digest=await fingerprint(dependencies),url=new URL('./.prepared/'+encodeURIComponent(name)+'/'+this.r.provider,import.meta.url);url.searchParams.set('identity',digest);
   return {url:url.href,digest,model,cache:await caches.open(PREPARED_CACHE)};
  }catch(e){this.warn(e);return null;}
 }
 async load(entry,name){
  if(!entry)return null;
  let graph;
  try{
   const response=await entry.cache.match(entry.url);if(!response)return null;
   this.r.progress(`Restoring ${name} graph · ${this.r.provider}`);
   const t=performance.now(),data=await unpack(await response.blob());
   if(data.metadata.identity!==entry.digest)throw Error('Graph checkpoint identity mismatch');
   const restored=await restore(this.r.context,data);graph=restored.graph;
   const {inputNames,outputNames}=data.metadata;
   if(!sameNames(inputNames,Object.keys(restored.inputs))||!sameNames(outputNames,Object.keys(restored.outputs)))throw Error('Graph checkpoint bindings mismatch');
   const context=this.r.context;
   const session={inputNames,outputNames,async run(feeds,bindings){
    const inputs={},outputs={};
    for(const name of inputNames){if(!feeds[name]?.mlTensor)throw Error('Missing WebNN input: '+name);inputs[name]=feeds[name].mlTensor;}
    for(const name of outputNames){if(!bindings?.[name]?.mlTensor)throw Error('Missing WebNN output: '+name);outputs[name]=bindings[name].mlTensor;}
    context.dispatch(graph,inputs,outputs);return bindings;
   },async release(){graph.destroy();}};
   this.diagnostics.push({name,hit:true,restoreMs:performance.now()-t,replayMs:restored.replayMs,buildMs:restored.buildMs});
   this.r.progress(`${name} restored · ${((performance.now()-t)/1000).toFixed(1)} s`);
   return session;
  }catch(e){graph?.destroy();this.warn(e);try{await entry.cache.delete(entry.url);}catch{}return null;}
 }
 async save(entry,name,record,session){
  if(!entry||!record)return;
  try{
   const blob=pack(record,{identity:entry.digest,inputNames:session.inputNames,outputNames:session.outputNames});
   // Commit each model atomically before marking its preparation complete.
   // Cache eviction or a failed write never invalidates the running session.
   await entry.cache.put(entry.url,new Response(blob));
   const current=new URL(entry.url);
   for(const request of await entry.cache.keys()){
    const old=new URL(request.url);
    if(old.origin===current.origin&&old.pathname===current.pathname&&old.href!==current.href)await entry.cache.delete(request);
   }
   this.diagnostics.push({name,hit:false,bytes:blob.size,buildMs:record.buildMs});
  }catch(e){this.warn(e);}
 }
}
