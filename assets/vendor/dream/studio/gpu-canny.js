// Canny edges stay on the GPU. Only the four-byte connectivity convergence flag
// is read back; source pixels and the resulting conditioning map never are.
export class GPUCanny {
 constructor(gpu){
  this.gpu=gpu;this.device=gpu.device;this.w=gpu.width;this.h=gpu.height;this.count=this.w*this.h;
  const buffer=(size,extra=0)=>this.device.createBuffer({size,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC|extra});
  this.gradient=buffer(this.count*16);this.labels=buffer(this.count*4);this.parents=buffer(this.count*4);this.strong=buffer(this.count*4);
  this.changed=buffer(4);this.read=this.device.createBuffer({size:4,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});this.output=buffer(this.count*2);
  const dimensions=`const W:i32=${this.w};const H:i32=${this.h};const N:u32=${this.count}u;`;
  this.sobel=gpu.compute(dimensions+`
   @group(0) @binding(0)var image:texture_2d<f32>;
   @group(0) @binding(1)var<storage,read_write>gradient:array<vec4i>;
   fn gray(p:vec2i)->i32{let c=vec3i(round(textureLoad(image,clamp(p,vec2i(0),vec2i(W-1,H-1)),0).rgb*255.));return (c.r*4899+c.g*9617+c.b*1868+8192)>>14;}
   @compute @workgroup_size(128)fn main(@builtin(global_invocation_id) id:vec3u){
    let i=id.x;if(i>=N){return;}let p=vec2i(i32(i)%W,i32(i)/W);
    let a=gray(p+vec2i(-1,-1));let b=gray(p+vec2i(0,-1));let c=gray(p+vec2i(1,-1));
    let d=gray(p+vec2i(-1,0));let f=gray(p+vec2i(1,0));
    let g=gray(p+vec2i(-1,1));let h=gray(p+vec2i(0,1));let j=gray(p+vec2i(1,1));
    let dx=c+2*f+j-a-2*d-g;let dy=g+2*h+j-a-2*b-c;gradient[i]=vec4i(dx,dy,abs(dx)+abs(dy),0);
   }`);
  this.suppress=gpu.compute(dimensions+`
   @group(0) @binding(0)var<storage,read>gradient:array<vec4i>;
   @group(0) @binding(1)var<storage,read_write>labels:array<u32>;
   @group(0) @binding(2)var<storage,read_write>parents:array<u32>;
   @group(0) @binding(3)var<storage,read_write>strong:array<u32>;
   fn mag(p:vec2i)->i32{if(any(p<vec2i(0))||p.x>=W||p.y>=H){return 0;}return gradient[u32(p.y*W+p.x)].z;}
   @compute @workgroup_size(128)fn main(@builtin(global_invocation_id)id:vec3u){
    let i=id.x;if(i>=N){return;}let p=vec2i(i32(i)%W,i32(i)/W);let v=gradient[i];let x=abs(v.x);let y=abs(v.y)<<15;let t=x*13573;
    var keep=false;
    if(v.z>100){
     if(y<t){keep=v.z>mag(p+vec2i(-1,0))&&v.z>=mag(p+vec2i(1,0));}
     else if(y>t+(x<<16)){keep=v.z>mag(p+vec2i(0,-1))&&v.z>=mag(p+vec2i(0,1));}
     else{let s=select(1,-1,(v.x^v.y)<0);keep=v.z>mag(p+vec2i(-s,-1))&&v.z>mag(p+vec2i(s,1));}
    }
    labels[i]=select(0u,select(1u,2u,v.z>200),keep);parents[i]=i;strong[i]=0u;
   }`);
  this.connect=gpu.compute(dimensions+`
   @group(0) @binding(0)var<storage,read>labels:array<u32>;
   @group(0) @binding(1)var<storage,read_write>parents:array<atomic<u32>>;
   @group(0) @binding(2)var<storage,read_write>changed:atomic<u32>;
   fn root(start:u32)->u32{var r=start;loop{let next=atomicLoad(&parents[r]);if(next==r){return r;}r=next;}}
   @compute @workgroup_size(128)fn main(@builtin(global_invocation_id)id:vec3u){
    let i=id.x;if(i>=N||labels[i]==0u){return;}let p=vec2i(i32(i)%W,i32(i)/W);
    let offsets=array<vec2i,4>(vec2i(-1,-1),vec2i(0,-1),vec2i(1,-1),vec2i(-1,0));
    for(var k=0;k<4;k++){let q=p+offsets[k];if(any(q<vec2i(0))||q.x>=W||q.y>=H){continue;}let j=u32(q.y*W+q.x);if(labels[j]==0u){continue;}
     let a=root(i);let b=root(j);if(a!=b){let old=atomicMin(&parents[max(a,b)],min(a,b));if(old>min(a,b)){atomicStore(&changed,1u);}}
    }
   }`);
  this.mark=gpu.compute(dimensions+`
   @group(0) @binding(0)var<storage,read>labels:array<u32>;
   @group(0) @binding(1)var<storage,read>parents:array<u32>;
   @group(0) @binding(2)var<storage,read_write>strong:array<atomic<u32>>;
   @compute @workgroup_size(128)fn main(@builtin(global_invocation_id)id:vec3u){let i=id.x;if(i>=N||labels[i]!=2u){return;}var r=i;loop{let n=parents[r];if(n==r){break;}r=n;}atomicStore(&strong[r],1u);}`);
  this.finish=gpu.compute(`enable f16;`+dimensions+`
   @group(0) @binding(0)var<storage,read>labels:array<u32>;
   @group(0) @binding(1)var<storage,read>parents:array<u32>;
   @group(0) @binding(2)var<storage,read>strong:array<u32>;
   @group(0) @binding(3)var<storage,read_write>output:array<f16>;
   @compute @workgroup_size(128)fn main(@builtin(global_invocation_id)id:vec3u){let i=id.x;if(i>=N){return;}var r=i;loop{let n=parents[r];if(n==r){break;}r=n;}output[i]=f16(select(0.,1.,labels[i]>0u&&strong[r]>0u));}`);
 }
 async run(texture){
  const groups=Math.ceil(this.count/128),g=this.gpu;
  g.dispatch(this.sobel,[texture.createView(),this.gradient],groups);
  g.dispatch(this.suppress,[this.gradient,this.labels,this.parents,this.strong],groups);
  let rounds=0,changed=1;
  while(changed&&rounds<64){
   // Four GPU union passes per small flag read amortize synchronization.
   for(let i=0;i<4;i++){this.device.queue.writeBuffer(this.changed,0,new Uint32Array([0]));g.dispatch(this.connect,[this.labels,this.parents,this.changed],groups);rounds++;}
   const e=this.device.createCommandEncoder();e.copyBufferToBuffer(this.changed,0,this.read,0,4);this.device.queue.submit([e.finish()]);
   await this.read.mapAsync(GPUMapMode.READ);changed=new Uint32Array(this.read.getMappedRange())[0];this.read.unmap();
  }
  if(changed)throw Error('Canny connectivity did not converge');
  g.dispatch(this.mark,[this.labels,this.parents,this.strong],groups);
  g.dispatch(this.finish,[this.labels,this.parents,this.strong,this.output],groups);
  return {buffer:this.output,rounds};
 }
}
