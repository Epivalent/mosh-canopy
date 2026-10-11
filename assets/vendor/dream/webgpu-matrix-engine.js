// Opt-in kernel experiment: the model, schedule and temporal state are unchanged.
import {DreamEngine} from './engine-matrix.js?v=vision-slice-v1';
import * as ort from './ort/ort.matrix.experimental.mjs';
export class MatrixDreamEngine extends DreamEngine {
  async load(canvas,options={}) {
    const info=await super.load(canvas,{...options,backend:'webgpu'});
    return {...info,runtime:'matrix-kernels-v5'};
  }
  async session(name) {
    const session=await super.session(name);
    if(name==='encoder'&&!this.matrixChecked){
      const device=ort.env.webgpu.device;
      if(!device.features.has('chromium-experimental-subgroup-matrix'))
        throw Error('Experimental matrix kernels are unavailable in this browser. Choose WebGPU · automatic GPU or WebNN · fused denoising.');
      // A feature name alone does not establish supported matrix dimensions.
      const module=device.createShaderModule({code:`enable f16;
        enable chromium_experimental_subgroup_matrix;
        @group(0) @binding(0) var<storage,read> a:array<f16>;
        @group(0) @binding(1) var<storage,read> b:array<f16>;
        @group(0) @binding(2) var<storage,read_write> c:array<f16>;
        @compute @workgroup_size(32) fn main(){
          let x=subgroupMatrixLoad<subgroup_matrix_left<f16,8,8>>(&a,0,false,8);
          let y=subgroupMatrixLoad<subgroup_matrix_right<f16,8,8>>(&b,0,false,8);
          let z=subgroupMatrixMultiplyAccumulate(x,y,subgroup_matrix_result<f16,8,8>(0h));
          subgroupMatrixStore(&c,0,z,false,8);
        }`});
      try{await device.createComputePipelineAsync({layout:'auto',compute:{module,entryPoint:'main'}});}
      catch{throw Error('This GPU does not support the experimental 8 × 8 FP16 matrix kernels. Choose WebGPU · automatic GPU.');}
      this.matrixChecked=true;
      this.progress('Experimental matrix kernels enabled · original model and temporal memory');
    }
    return session;
  }
}
