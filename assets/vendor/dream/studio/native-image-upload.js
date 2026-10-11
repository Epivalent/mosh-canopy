// ImageBitmap ignores WebGL UNPACK_FLIP_Y_WEBGL. Normalize explicitly on GPU
// so image, contour and compositing coordinates all have the same orientation.
export class NativeImageUpload {
 constructor(gpu){this.gpu=gpu;this.staging=gpu.target(gpu.gl.RGBA8);this.flip=gpu.program('void main(){result=texture(source,vec2(uv.x,1.-uv.y));}');}
 upload(bitmap,target){const g=this.gpu,gl=g.gl;gl.bindTexture(gl.TEXTURE_2D,this.staging.texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,bitmap);g.draw(this.flip,target,{source:this.staging});}
}
