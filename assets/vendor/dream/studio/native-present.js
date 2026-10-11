// ANE output → shared WebGPU buffer → canvas bitmap. No RGB readback or JS conversion.
import * as ort from './ort/ort.all.bundle.min.mjs';
export class NativePresent {
 async load(runtime){
  this.r=runtime;const a=await navigator.gpu.requestAdapter();const d=this.device=await a.requestDevice({requiredFeatures:['shader-f16']});
  this.canvas=new OffscreenCanvas(512,512);this.context=this.canvas.getContext('webgpu');this.context.configure({device:d,format:navigator.gpu.getPreferredCanvasFormat(),alphaMode:'opaque'});
  this.ml=await runtime.context.createExportableTensor({dataType:'float16',shape:[1,3,512,512]},d);
  this.tensor=ort.Tensor.fromMLTensor(this.ml,{dataType:'float16',dims:[1,3,512,512]});
  const module=d.createShaderModule({code:`enable f16;
   @group(0) @binding(0)var<storage,read>rgb:array<f16>;
   @vertex fn vertex(@builtin(vertex_index)i:u32)->@builtin(position)vec4f{let p=vec2f(f32((i<<1u)&2u),f32(i&2u));return vec4f(p*2.-1.,0.,1.);}
   @fragment fn fragment(@builtin(position)p:vec4f)->@location(0)vec4f{let i=u32(p.y)*512u+u32(p.x);return vec4f(f32(rgb[i]),f32(rgb[262144u+i]),f32(rgb[524288u+i]),1.);}`});
  this.render=d.createRenderPipeline({layout:'auto',vertex:{module,entryPoint:'vertex'},fragment:{module,entryPoint:'fragment',targets:[{format:navigator.gpu.getPreferredCanvasFormat()}]}});
  this.previous=d.createBuffer({size:3*512*512*2,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});
  this.count=d.createBuffer({size:8,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST});this.read=d.createBuffer({size:8,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});
  this.compare=d.createComputePipeline({layout:'auto',compute:{entryPoint:'main',module:d.createShaderModule({code:`enable f16;@group(0) @binding(0)var<storage,read>x:array<f16>;@group(0) @binding(1)var<storage,read_write>previous:array<f16>;@group(0) @binding(2)var<storage,read_write>counts:array<atomic<u32>>;var<workgroup>sum:array<vec2u,128>;@compute @workgroup_size(128)fn main(@builtin(global_invocation_id)i:vec3u,@builtin(local_invocation_id)lid:vec3u){let v=x[i.x];sum[lid.x]=vec2u(select(0u,1u,v!=previous[i.x]),select(0u,1u,v!=f16(0.)&&abs(v)<f16(65504.)));previous[i.x]=v;workgroupBarrier();var stride=64u;loop{if(lid.x<stride){sum[lid.x]+=sum[lid.x+stride];}workgroupBarrier();if(stride==1u){break;}stride/=2u;}if(lid.x==0u){atomicAdd(&counts[0],sum[0].x);atomicAdd(&counts[1],sum[0].y);}}`})}});
  return this;
 }
 async present(){
  const d=this.device,buffer=await this.r.context.exportToGPU(this.ml),e=d.createCommandEncoder();d.queue.writeBuffer(this.count,0,new Uint32Array(2));
  const c=e.beginComputePass();c.setPipeline(this.compare);c.setBindGroup(0,d.createBindGroup({layout:this.compare.getBindGroupLayout(0),entries:[buffer,this.previous,this.count].map((buffer,binding)=>({binding,resource:{buffer}}))}));c.dispatchWorkgroups(6144);c.end();e.copyBufferToBuffer(this.count,0,this.read,0,8);
  const p=e.beginRenderPass({colorAttachments:[{view:this.context.getCurrentTexture().createView(),loadOp:'clear',storeOp:'store',clearValue:{r:0,g:0,b:0,a:1}}]});p.setPipeline(this.render);p.setBindGroup(0,d.createBindGroup({layout:this.render.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer}}]}));p.draw(3);p.end();d.queue.submit([e.finish()]);buffer.destroy();
  await this.read.mapAsync(GPUMapMode.READ);const [changed,nonzero]=new Uint32Array(this.read.getMappedRange());this.read.unmap();if(!nonzero)throw Error('Neural output was all zero or invalid');return {bitmap:this.canvas.transferToImageBitmap(),changed};
 }
}
