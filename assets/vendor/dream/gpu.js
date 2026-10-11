// GPU image preparation, LCM arithmetic, motion carry and presentation.
// No per-frame pixel readback. Only small control uniforms originate on CPU.
export class DreamGPU {
  constructor(device, canvas, width, height) {
    Object.assign(this,{device,canvas,width,height});
    this.context=canvas.getContext('webgpu');
    canvas.width=width;canvas.height=height;
    this.format=navigator.gpu.getPreferredCanvasFormat();
    this.context.configure({device,format:this.format,alphaMode:'opaque'});
    this.sampler=device.createSampler({minFilter:'linear',magFilter:'linear'});
    this.current=this.texture();this.previous=this.texture();this.reference=this.texture();
    this.residual=this.texture('rgba16float');this.spare=this.texture('rgba16float');
    this.fresh=this.texture('rgba16float');this.freshSpare=this.texture('rgba16float');
    this.flows=[];this.frame=0;this.valid=false;this.mix=.85;this.motion=true;
    this.params=device.createBuffer({size:32,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});
    this.preprocess=this.compute(`
      enable f16;
      @group(0) @binding(0) var src:texture_2d<f32>;
      @group(0) @binding(1) var smp:sampler;
      @group(0) @binding(2) var<storage,read_write> dst:array<f16>;
      @group(0) @binding(3) var<uniform> p:vec4<u32>;
      @compute @workgroup_size(8,8) fn main(@builtin(global_invocation_id) id:vec3<u32>){
        if(id.x>=p.x||id.y>=p.y){return;}
        var uv=(vec2<f32>(id.xy)+.5)/vec2<f32>(p.xy);
        if(p.z==1u){let s=vec2<f32>(textureDimensions(src));let short=min(s.x,s.y);uv=(uv-.5)*short/s+.5;}
        var c=textureSampleLevel(src,smp,uv,0).rgb;
        if(p.z==1u){c=(c-vec3<f32>(.48145466,.4578275,.40821073))/vec3<f32>(.26862954,.26130258,.27577711);}
        let n=p.x*p.y;let i=id.y*p.x+id.x;
        dst[i]=f16(c.r);dst[n+i]=f16(c.g);dst[2u*n+i]=f16(c.b);
      }`);
    this.scheduler=this.compute(`
      enable f16;
      @group(0) @binding(0) var<storage,read> a:array<f16>;
      @group(0) @binding(1) var<storage,read> b:array<f16>;
      @group(0) @binding(2) var<storage,read_write> out:array<f16>;
      struct P{count:u32,seed:u32,mode:u32,pad:u32,alpha:f32,nextAlpha:f32,skip:f32,outScale:f32}
      @group(0) @binding(3) var<uniform> p:P;
      fn hash(n:u32)->u32{var x=n;x=(x^(x>>16u))*0x7feb352du;x=(x^(x>>15u))*0x846ca68bu;return x^(x>>16u);}
      fn normal(i:u32)->f32{let u=(f32(hash(i*2u+p.seed)&0xffffffu)+1.)/16777217.;let v=f32(hash(i*2u+1u+p.seed)&0xffffffu)/16777216.;return sqrt(-2.*log(u))*cos(6.2831853*v);}
      @compute @workgroup_size(128) fn main(@builtin(global_invocation_id) id:vec3<u32>){
        let i=id.x;if(i>=p.count){return;}let x=f32(a[i]);let noise=normal(i);
        if(p.mode==0u){out[i]=f16(sqrt(p.alpha)*x+sqrt(1.-p.alpha)*noise);return;}
        let clean=(x-sqrt(1.-p.alpha)*f32(b[i]))/sqrt(p.alpha);
        let denoised=p.outScale*clean+p.skip*x;
        out[i]=f16(sqrt(p.nextAlpha)*denoised+sqrt(1.-p.nextAlpha)*noise);
      }`);
    this.flow=this.compute(`
      @group(0) @binding(0) var cur:texture_2d<f32>;
      @group(0) @binding(1) var old:texture_2d<f32>;
      @group(0) @binding(2) var smp:sampler;
      @group(0) @binding(3) var dst:texture_storage_2d<rgba16float,write>;
      fn color(t:texture_2d<f32>,uv:vec2<f32>)->vec3<f32>{return textureSampleLevel(t,smp,uv,0).rgb;}
      @compute @workgroup_size(8,8) fn main(@builtin(global_invocation_id) id:vec3<u32>){
        let dims=textureDimensions(dst);if(any(id.xy>=dims)){return;}
        let uv=(vec2<f32>(id.xy)+.5)/vec2<f32>(dims);let px=1./vec2<f32>(dims);
        var best=1e6;var delta=vec2<f32>(0.);
        for(var y=-3;y<=3;y++){for(var x=-3;x<=3;x++){
          let d=vec2<f32>(f32(x),f32(y))*px;var error=0.;
          for(var ky=-1;ky<=1;ky++){for(var kx=-1;kx<=1;kx++){
            if(kx!=0&&ky!=0){continue;}let q=uv+vec2<f32>(f32(kx),f32(ky))*px;
            error+=dot(abs(color(cur,q)-color(old,q+d)),vec3<f32>(.333333));
          }}
          error=error/5.+.0002*f32(x*x+y*y);
          if(error<best){best=error;delta=d;}
        }}
        let valid=1.-smoothstep(.06,.20,best);
        textureStore(dst,vec2<i32>(id.xy),vec4<f32>(delta,valid,best));
      }`);
    this.warp=this.compute(`
      @group(0) @binding(0) var src:texture_2d<f32>;
      @group(0) @binding(1) var flow:texture_2d<f32>;
      @group(0) @binding(2) var smp:sampler;
      @group(0) @binding(3) var dst:texture_storage_2d<rgba16float,write>;
      @compute @workgroup_size(8,8) fn main(@builtin(global_invocation_id) id:vec3<u32>){
        let dims=textureDimensions(dst);if(any(id.xy>=dims)){return;}
        let uv=(vec2<f32>(id.xy)+.5)/vec2<f32>(dims);let f=textureSampleLevel(flow,smp,uv,0);
        let q=uv+f.xy;let valid=f.z*select(0.,1.,all(q>=vec2<f32>(0.))&&all(q<=vec2<f32>(1.)));
        textureStore(dst,vec2<i32>(id.xy),textureSampleLevel(src,smp,q,0)*valid);
      }`);
    this.difference=this.compute(`
      enable f16;
      @group(0) @binding(0) var<storage,read> pixels:array<f16>;
      @group(0) @binding(1) var referenceImage:texture_2d<f32>;
      @group(0) @binding(2) var dst:texture_storage_2d<rgba16float,write>;
      @compute @workgroup_size(8,8) fn main(@builtin(global_invocation_id) id:vec3<u32>){
        let d=textureDimensions(dst);if(any(id.xy>=d)){return;}let n=d.x*d.y;let i=id.y*d.x+id.x;
        let rgb=vec3<f32>(f32(pixels[i]),f32(pixels[n+i]),f32(pixels[2u*n+i]));
        textureStore(dst,vec2<i32>(id.xy),vec4<f32>(rgb-textureLoad(referenceImage,vec2<i32>(id.xy),0).rgb,1.));
      }`);
    this.differenceTexture=this.compute(`
      @group(0) @binding(0) var generated:texture_2d<f32>;
      @group(0) @binding(1) var referenceImage:texture_2d<f32>;
      @group(0) @binding(2) var dst:texture_storage_2d<rgba16float,write>;
      @compute @workgroup_size(8,8) fn main(@builtin(global_invocation_id) id:vec3<u32>){
        let d=textureDimensions(dst);if(any(id.xy>=d)){return;}
        textureStore(dst,vec2<i32>(id.xy),vec4<f32>(textureLoad(generated,vec2<i32>(id.xy),0).rgb-textureLoad(referenceImage,vec2<i32>(id.xy),0).rgb,1.));
      }`);
    this.blendResidual=this.compute(`
      @group(0) @binding(0) var old:texture_2d<f32>;
      @group(0) @binding(1) var destinationImage:texture_2d<f32>;
      @group(0) @binding(2) var dst:texture_storage_2d<rgba16float,write>;
      @group(0) @binding(3) var<uniform> p:vec4<f32>;
      @compute @workgroup_size(8,8) fn main(@builtin(global_invocation_id) id:vec3<u32>){
        let d=textureDimensions(dst);if(any(id.xy>=d)){return;}
        let xy=vec2<i32>(id.xy);
        let a=select(vec4<f32>(0.),textureLoad(old,xy,0),p.y>0.);
        textureStore(dst,xy,mix(a,textureLoad(destinationImage,xy,0),p.x));
      }`);
    this.transitionMs=250;this.transition=null;
    const shader=device.createShaderModule({code:`
      @group(0) @binding(0) var src:texture_2d<f32>;
      @group(0) @binding(1) var residual:texture_2d<f32>;
      @group(0) @binding(2) var smp:sampler;
      @group(0) @binding(3) var<uniform> p:vec4<f32>;
      struct V{@builtin(position) pos:vec4<f32>,@location(0) uv:vec2<f32>}
      @vertex fn vs(@builtin(vertex_index) i:u32)->V{let q=array<vec2<f32>,3>(vec2<f32>(-1.,-1.),vec2<f32>(3.,-1.),vec2<f32>(-1.,3.));var v:V;v.pos=vec4<f32>(q[i],0.,1.);v.uv=q[i]*vec2<f32>(.5,-.5)+.5;return v;}
      @fragment fn fs(v:V)->@location(0) vec4<f32>{let c=textureSample(src,smp,v.uv);let r=textureSample(residual,smp,v.uv);return vec4<f32>(clamp(c.rgb+p.x*r.rgb,vec3<f32>(0.),vec3<f32>(1.)),1.);}`});
    this.present=device.createRenderPipeline({layout:'auto',vertex:{module:shader,entryPoint:'vs'},fragment:{module:shader,entryPoint:'fs',targets:[{format:this.format}]}});
    this.inputCanvas=new OffscreenCanvas(width,height);this.inputContext=this.inputCanvas.getContext('2d');
  }
  texture(format='rgba8unorm',width=this.width,height=this.height){return this.device.createTexture({size:[width,height],format,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.STORAGE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.COPY_SRC|GPUTextureUsage.RENDER_ATTACHMENT});}
  compute(code){return this.device.createComputePipeline({layout:'auto',compute:{module:this.device.createShaderModule({code}),entryPoint:'main'}});}
  dispatch(pipeline,resources,x,y=1){const entries=resources.map((r,binding)=>({binding,resource:r instanceof GPUBuffer?{buffer:r}:r}));const e=this.device.createCommandEncoder();const p=e.beginComputePass();p.setPipeline(pipeline);p.setBindGroup(0,this.device.createBindGroup({layout:pipeline.getBindGroupLayout(0),entries}));p.dispatchWorkgroups(x,y);p.end();this.device.queue.submit([e.finish()]);}
  prepare(buffer,width,height,vision=false){this.device.queue.writeBuffer(this.params,0,new Uint32Array([width,height,+vision,0]));this.dispatch(this.preprocess,[this.reference.createView(),this.sampler,buffer,this.params],Math.ceil(width/8),Math.ceil(height/8));}
  step(a,b,out,{alpha,nextAlpha=1,skip=0,outScale=1,seed=42,mode=1}){
    const data=new ArrayBuffer(32);new Uint32Array(data).set([4*this.width*this.height/64,seed,mode,0]);new Float32Array(data,16).set([alpha,nextAlpha,skip,outScale]);
    this.device.queue.writeBuffer(this.params,0,data);this.dispatch(this.scheduler,[a,b,out,this.params],Math.ceil(4*this.width*this.height/64/128));
  }
  source(bitmap){
    [this.current,this.previous]=[this.previous,this.current];
    // Canvas scaling uses the browser graphics path; pixels never enter JS arrays.
    const c=this.inputContext,w=this.width,h=this.height,scale=Math.min(w/bitmap.width,h/bitmap.height);
    c.fillStyle='black';c.fillRect(0,0,w,h);c.drawImage(bitmap,(w-bitmap.width*scale)/2,(h-bitmap.height*scale)/2,bitmap.width*scale,bitmap.height*scale);bitmap.close();
    this.device.queue.copyExternalImageToTexture({source:this.inputCanvas},{texture:this.current},[w,h]);
    this.frame++;
    if(this.frame>1&&this.motion){
      // Reuse the oldest texture after its queued reads; GPU queue ordering
      // keeps reuse safe and bounds allocation churn during long playback.
      const flow=this.flows.length>=120?this.flows.shift().texture:this.texture('rgba16float',32,24);
      this.dispatch(this.flow,[this.current.createView(),this.previous.createView(),this.sampler,flow.createView()],4,3);
      this.flows.push({frame:this.frame,texture:flow});
      if(this.valid){this.applyWarp(this.residual,flow,this.spare);[this.residual,this.spare]=[this.spare,this.residual];}
      if(this.transition){this.applyWarp(this.fresh,flow,this.freshSpare);[this.fresh,this.freshSpare]=[this.freshSpare,this.fresh];}
    }
    this.draw();
  }
  capture(){const e=this.device.createCommandEncoder();e.copyTextureToTexture({texture:this.current},{texture:this.reference},[this.width,this.height]);this.device.queue.submit([e.finish()]);return this.frame;}
  applyWarp(src,flow,dst){this.dispatch(this.warp,[src.createView(),flow.createView(),this.sampler,dst.createView()],Math.ceil(this.width/8),Math.ceil(this.height/8));}
  accept(pixels,frame){
    if(this.frame-frame>120)return false;
    this.dispatch(this.difference,[pixels,this.reference.createView(),this.fresh.createView()],Math.ceil(this.width/8),Math.ceil(this.height/8));
    if(this.motion)for(const item of this.flows)if(item.frame>frame){this.applyWarp(this.fresh,item.texture,this.freshSpare);[this.fresh,this.freshSpare]=[this.freshSpare,this.fresh];}
    [this.residual,this.fresh]=[this.fresh,this.residual];this.valid=true;this.draw();return true;
  }
  advanceTransition(now=performance.now()){
    const t=this.transition;if(!t)return;
    const fraction=Math.min(1,Math.max(0,(now-t.start)/this.transitionMs));
    const progress=fraction*fraction*(3-2*fraction);
    const alpha=(progress-t.progress)/Math.max(1e-6,1-t.progress);
    this.device.queue.writeBuffer(this.params,0,new Float32Array([alpha,t.hadPrevious?1:0,0,0]));
    this.dispatch(this.blendResidual,[this.residual.createView(),this.fresh.createView(),this.spare.createView(),this.params],Math.ceil(this.width/8),Math.ceil(this.height/8));
    [this.residual,this.spare]=[this.spare,this.residual];this.valid=true;
    t.hadPrevious=true;t.progress=progress;if(fraction===1)this.transition=null;
  }
  draw(){this.advanceTransition();this.device.queue.writeBuffer(this.params,0,new Float32Array([this.valid?this.mix:0,0,0,0]));const e=this.device.createCommandEncoder();const p=e.beginRenderPass({colorAttachments:[{view:this.context.getCurrentTexture().createView(),loadOp:'clear',storeOp:'store'}]});p.setPipeline(this.present);p.setBindGroup(0,this.device.createBindGroup({layout:this.present.getBindGroupLayout(0),entries:[{binding:0,resource:this.current.createView()},{binding:1,resource:this.residual.createView()},{binding:2,resource:this.sampler},{binding:3,resource:{buffer:this.params}}]}));p.draw(3);p.end();this.device.queue.submit([e.finish()]);}
  acceptBitmap(bitmap,frame){
    this.generated??=this.texture();
    this.device.queue.copyExternalImageToTexture({source:bitmap},{texture:this.generated},[this.width,this.height]);bitmap.close();
    if(this.frame-frame>120)return false;
    this.dispatch(this.differenceTexture,[this.generated.createView(),this.reference.createView(),this.fresh.createView()],Math.ceil(this.width/8),Math.ceil(this.height/8));
    if(this.motion)for(const item of this.flows)if(item.frame>frame){this.applyWarp(this.fresh,item.texture,this.freshSpare);[this.fresh,this.freshSpare]=[this.freshSpare,this.fresh];}
    // Keep the current, already reprojected effect while the new target arrives.
    // Both are carried by motion; only the effect changes over this interval.
    this.transition={start:performance.now(),progress:0,hadPrevious:this.valid};
    this.draw();return true;
  }
  reset(){this.valid=false;this.transition=null;this.frame=0;this.flows.forEach(f=>f.texture.destroy());this.flows=[];this.draw();}
}
