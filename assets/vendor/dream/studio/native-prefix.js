import {NativeRuntime} from './native-runtime.js?v=preparation-progress1';
import {NativeTokenizer} from './native-tokenizer.js?v=direct-assets1';
import {numberToHalfBits} from './platform.js';
const half=values=>Uint16Array.from(values,numberToHalfBits);
export function nativeSchedule(manifest,index,passes){
 if(![1,2,4].includes(passes))throw Error('Expected 1, 2 or 4 denoising passes');
 index=Math.max(1,Math.min(49,Math.round(index)));const timeline=manifest.schedule.timesteps,start=timeline[index];
 const times=passes===1?[start]:50-index>=passes?Array.from({length:passes},(_,i)=>timeline[index+Math.floor(i*(50-index)/passes)]):Array.from({length:passes},(_,i)=>Math.max(1,Math.round(start*(1-i/passes))));
 return times.map(t=>({time:t,coeff:manifest.schedule.coefficients[t]}));
}
export class NativePrefix {
 async load(progress){
  this.r=await new NativeRuntime(progress).load('gpu');const r=this.r;
  this.stagePrefix=r.manifest.models['gpu-unet-last-1']?'gpu-':'';this.run=(name,feeds)=>r.execute(name==='tail-ane'?name:this.stagePrefix+name,feeds);
  const names=['control-start',...Array.from({length:4},(_,i)=>'control-down-'+i),'control-mid','control-project','unet-start',...Array.from({length:4},(_,i)=>'unet-down-'+i),'unet-mid',...Array.from({length:3},(_,i)=>'unet-up-'+i),'unet-last-0','unet-last-1','tail-ane'];
  const modelNames=names.map(name=>name==='tail-ane'?name:this.stagePrefix+name);progress.models?.([...modelNames,'text']);
  const jobs=[];const prepare=p=>{p.catch(()=>{});jobs.push(p);};
  prepare(NativeTokenizer.load(r.metadataBase,r.manifest.tokenizer,r.assets).then(value=>{this.tokenizer=value;}));
  prepare((async()=>{this.textRuntime=await new NativeRuntime(progress).load('webgpu');this.textSession=await this.textRuntime.session('text');})());
  prepare(Promise.all(modelNames.map(name=>r.session(name))));
  prepare(r.tensor([1,1024,1,77]).then(value=>{this.embedding=value;}));
  this.times={};prepare(Promise.all(['unet','control'].map(async k=>{this.times[k]=new Uint16Array(await r.assets.read(r.metadataBase+k+'-time.f16',k+' time table','dream-turbo-512-metadata-v1'));})));
  prepare(r.tensorMap({sample:[1,4,64,64],guide:[1,3,512,512],strength:[1,1,1,1],background:[1,4,64,64],edit_mask:[1,1,64,64],coeff:[1,4,1,1],next_coeff:[1,2,1,1],next_noise:[1,4,64,64],time_embedding:[1,1280,1,1]}).then(value=>{this.input=value;}));
  prepare(r.tensor([1,1,64,64],new Uint16Array(4096).fill(numberToHalfBits(1))).then(value=>{this.ones=value;}));
  prepare(r.tensor([1,1280,1,1]).then(value=>{this.controlTime=value;}));
  const shapes={strength:[1,1,1,1]};for(let i=0;i<12;i++){const s=r.manifest.models['control-project'].outputs['r'+i];shapes['base'+i]=s;shapes['control'+i]=s;}
  prepare(r.graph('control-add-down',shapes,(b,x)=>Object.fromEntries(Array.from({length:12},(_,i)=>['r'+i,b.add(x['base'+i],b.mul(x.strength,x['control'+i]))]))).then(value=>{this.addDown=value;}));
  const midShape=r.manifest.models['control-project'].outputs.r12;
  prepare(r.graph('control-add-mid',{base:midShape,control:midShape,strength:[1,1,1,1]},(b,x)=>({output:b.add(x.base,b.mul(x.strength,x.control))})).then(value=>{this.addMid=value;}));
  await Promise.all(jobs);return this;
 }
 async prompt(text){
  if(text===this.text)return;const ids=await this.textRuntime.tensor([1,77],this.tokenizer.encode(text),'int32');
  const out=await this.textSession.run({ids});this.r.write(this.embedding,await this.textRuntime.read(out.embedding));out.embedding.dispose();ids.dispose();this.text=text;
 }
 async prefix(sample,guide,strength,timestep){
  const r=this.r,e=this.embedding,t=this.input.time_embedding;
  r.write(t,this.times.unet.subarray(timestep*1280,(timestep+1)*1280));r.write(this.controlTime,this.times.control.subarray(timestep*1280,(timestep+1)*1280));
  let x=(await this.run('control-start',{sample,guide})).output,rs=[x];
  for(let i=0;i<4;i++){const out=await this.run('control-down-'+i,{x,t:this.controlTime,e});x=out.output;rs.push(...Object.entries(out).filter(([k])=>k.startsWith('r')).sort(([a],[b])=>a.localeCompare(b)).map(([,v])=>v));}
  x=(await this.run('control-mid',{x,t:this.controlTime,e})).output;
  const residual=await this.run('control-project',{mid:x,...Object.fromEntries(rs.map((v,i)=>['r'+i,v]))});
  x=(await this.run('unet-start',{sample})).output;rs=[x];
  for(let i=0;i<4;i++){const out=await this.run('unet-down-'+i,{x,t,e});x=out.output;rs.push(...Object.entries(out).filter(([k])=>k.startsWith('r')).sort(([a],[b])=>a.localeCompare(b)).map(([,v])=>v));}
  const inputs={strength};for(let i=0;i<12;i++){inputs['base'+i]=rs[i];inputs['control'+i]=residual['r'+i];}
  const added=this.addDown(inputs);rs=rs.map((_,i)=>added['r'+i]);
  x=(await this.run('unet-mid',{x,t,e})).output;x=this.addMid({base:x,control:residual.r12,strength}).output;
  for(let i=0;i<3;i++){const last=rs.splice(-3);x=(await this.run('unet-up-'+i,{x,t,e,r0:last[0],r1:last[1],r2:last[2]})).output;}
  for(let i=0;i<2;i++)x=(await this.run('unet-last-'+i,{x,t,e,r:rs.pop()})).output;
  return x;
 }
 async refresh(packet,cfg,emit){
  await this.prompt(cfg.prompt);const r=this.r,steps=nativeSchedule(r.manifest,cfg.index,cfg.passes),f=this.input;
  for(const key of ['sample','guide','background','edit_mask'])r.write(f[key],packet[key]);r.write(f.strength,half([cfg.spatial?cfg.controlStrength:0]));
  const embedding=await r.read(this.embedding);
  let sample=f.sample;
  for(let i=0;i<steps.length;i++){
   const hidden=await this.prefix(sample,f.guide,f.strength,steps[i].time);
   const data=await r.read(hidden);await emit({pass:i,cfg:{...cfg},hidden:data,embedding,time:this.times.unet.slice(steps[i].time*1280,(steps[i].time+1)*1280),meta:packet.meta});
   if(i+1<steps.length){
    r.write(f.coeff,half(steps[i].coeff));r.write(f.next_coeff,half(steps[i+1].coeff.slice(0,2)));r.write(f.next_noise,packet.noises[i+1]);
    // The same learned final block completes an intermediate schedule step;
    // the fast ANE worker retains this step's distinct hidden features.
    // Successive steps must not overwrite the tensor they consume.
    if(!this.tailOutputs){this.tailOutputs=[];for(let j=0;j<2;j++){const outputs={};for(const [key,shape] of Object.entries(r.manifest.models['tail-ane'].outputs))outputs[key]=await r.tensor(shape);this.tailOutputs.push(outputs);}}
    const tail=await r.session('tail-ane');
    const feeds={...f,sample,hidden,edit_mask:cfg.composition==='context'||i+2===steps.length?f.edit_mask:this.ones,encoder_hidden_states:this.embedding};
    sample=(await tail.run(Object.fromEntries(tail.inputNames.map(key=>[key,feeds[key]])),this.tailOutputs[i%2])).next_sample;
   }
  }
 }
 async dispose(){await this.r.dispose();await this.textRuntime?.dispose();}
}
