// Browser-owned image graph. Neural rendering is a separate resident service.
// Float targets preserve feedback values above one, like the original graph.
const vertex=`#version 300 es
out vec2 uv;void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);uv=p;gl_Position=vec4(p*2.-1.,0.,1.);}`;
const common=`#version 300 es
precision highp float;in vec2 uv;out vec4 result;
uniform sampler2D source,history,neural,maskTex;
uniform float preparation,threshold,inputGain,persistence,inputFeedback,textureMix,texturePeriod,textureSpeed,cloudPeriod,clouds,clock,dt,outputGain,outputPersistence,outputFeedback,blendMode,blendAmount,originalMix;
float luminance(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
float decay(float p){return pow(max(p,0.),dt);}
float gainScale(float p){return abs(1.-p)<.00001?dt:(1.-decay(p))/(1.-p);}
`;
const maskShader=`
void main(){
 float v=luminance(texture(source,uv).rgb);vec3 m=vec3(1.-step(threshold,v));
 if(preparation>1.5){
  vec2 d=vec2(1./512.,0.);float x=luminance(texture(source,uv+d.xy).rgb)-luminance(texture(source,uv-d.xy).rgb);
  float y=luminance(texture(source,uv+d.yx).rgb)-luminance(texture(source,uv-d.yx).rgb);m=vec3(clamp(length(vec2(x,y))*2.,0.,1.));
 }
 vec4 current=vec4(m,1.);result=inputFeedback>.5?current*inputGain*gainScale(persistence)+texture(history,uv)*decay(persistence):current;
}`;
const prepareShader=`
vec3 palette(float n){
 vec3 a=vec3(.05,.015,.13),b=vec3(.6,.05,.8),c=vec3(.05,.6,.55),d=vec3(.85,.25,.04),e=vec3(.95,.9,.4);
 if(n<.25)return mix(a,b,n/.25);if(n<.48)return mix(b,c,(n-.25)/.23);if(n<.7)return mix(c,d,(n-.48)/.22);return mix(d,e,(n-.7)/.3);
}
void main(){
 vec4 rgb=texture(source,uv);if(preparation<.5){result=rgb;return;}
 float t=clock*textureSpeed;
 float n=clamp(.5+.5*snoise(vec3((uv-.5)/max(texturePeriod,.001),t)+vec3(42.)),0.,1.);
 vec4 colored=vec4(palette(n),1.)*clamp(texture(maskTex,uv),0.,1.);
 if(clouds>.5){float cloud=.5+.5*snoise(vec3((uv-.5)/max(cloudPeriod,.01),t*.5));colored.rgb*=cloud;}
 result=mix(rgb,colored,textureMix);
}`;
const feedbackShader=`void main(){vec4 n=texture(neural,uv);result=outputFeedback>.5?n*outputGain*gainScale(outputPersistence)+texture(history,uv)*decay(outputPersistence):n;}`;
const blendShader=`
vec3 softlight(vec3 a,vec3 b){vec3 d=mix(sqrt(max(a,vec3(0.))),((16.*a-12.)*a+4.)*a,lessThanEqual(a,vec3(.25)));return mix(a-(1.-2.*b)*a*(1.-a),a+(2.*b-1.)*(d-a),greaterThan(b,vec3(.5)));}
void main(){vec4 original=texture(source,uv),effect=texture(neural,uv);vec3 a=original.rgb,b=effect.rgb,v=b;
 if(blendMode==1.)v=1.-(1.-a)*(1.-b);
 if(blendMode==2.)v=a*b;
 if(blendMode==3.)v=mix(2.*a*b,1.-2.*(1.-a)*(1.-b),greaterThan(b,vec3(.5)));
 if(blendMode==4.)v=(1.-2.*a)*b*b+2.*a*b;
 if(blendMode==5.)v=abs(a-b);
 if(blendMode==6.)v=a+b;
 result=vec4(mix(a,v,blendAmount*(1.-originalMix)),1.);
}`;
export class StudioGPU{
 static async create(canvas){const noise=await(await fetch(new URL('./vendor/simplex3d.glsl',import.meta.url))).text();return new StudioGPU(canvas,noise)}
 constructor(canvas,noise){
  this.canvas=canvas;canvas.width=canvas.height=512;const gl=this.gl=canvas.getContext('webgl2',{alpha:false,antialias:false,preserveDrawingBuffer:true});
  if(!gl||!gl.getExtension('EXT_color_buffer_float'))throw Error('This browser needs WebGL2 floating-point render targets');
  this.programs={mask:this.program(maskShader),prepare:this.program(noise+'\n'+prepareShader),feedback:this.program(feedbackShader),blend:this.program(blendShader)};
  this.sourceTex=this.target(gl.RGBA8);this.neuralTex=this.target();this.masks=[this.target(),this.target()];this.feedback=[this.target(),this.target()];this.prepared=this.target();this.maskIndex=0;this.feedbackIndex=0;this.ready=false;this.hasSource=false;this.settings={};this.reset();
 }
 program(fragment){const gl=this.gl;const compile=(type,text)=>{const s=gl.createShader(type);gl.shaderSource(s,text);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};const p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,common+fragment));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;}
 target(format=this.gl.RGBA16F){const gl=this.gl,texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texStorage2D(gl.TEXTURE_2D,1,format,512,512);for(const p of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,p,gl.NEAREST);for(const p of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,p,gl.CLAMP_TO_EDGE);const framebuffer=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('Incomplete float framebuffer');return {texture,framebuffer};}
 configure(settings){this.settings={...settings};}
 source(canvas){const gl=this.gl;gl.bindTexture(gl.TEXTURE_2D,this.sourceTex.texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,canvas);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);this.hasSource=true;}
 accept(pixels){if(pixels.length!==512*512*4)throw Error('Invalid neural output size');const gl=this.gl;gl.bindTexture(gl.TEXTURE_2D,this.neuralTex.texture);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,512,512,gl.RGBA,gl.FLOAT,pixels);this.ready=true;}
 reset(){const gl=this.gl;for(const t of [...this.masks,...this.feedback,this.prepared]){gl.bindFramebuffer(gl.FRAMEBUFFER,t.framebuffer);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT)}this.lastTick=undefined;}
 resetSource(){this.reset();this.ready=false;}
 draw(program,target,textures,dt=1){const gl=this.gl,s=this.settings;gl.useProgram(program);gl.bindFramebuffer(gl.FRAMEBUFFER,target?.framebuffer||null);gl.viewport(0,0,512,512);let unit=0;for(const [name,texture]of Object.entries(textures)){gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture.texture);gl.uniform1i(gl.getUniformLocation(program,name),unit++);}
  const uniforms={preparation:Number(s.Preparation??0),threshold:s.Threshold??.45,inputGain:s.Inputgain??.1,persistence:s.Persistence??.95,inputFeedback:+!!s.Inputfeedback,textureMix:s.Texturemix??.25,texturePeriod:s.Textureperiod??.12,textureSpeed:s.Texturespeed??.015,cloudPeriod:s.Cloudperiod??2,clouds:+!!s.Clouds,clock:performance.now()/1000,dt,outputGain:s.Outputgain??.05,outputPersistence:s.Outputpersistence??.95,outputFeedback:+!!s.Outputfeedback,blendMode:['normal','screen','multiply','overlay','softlight','difference','add'].indexOf(s.Blendmode||'normal'),blendAmount:s.Blendamount??1,originalMix:s.Originalmix??0};
  for(const [name,value]of Object.entries(uniforms))gl.uniform1f(gl.getUniformLocation(program,name),value);gl.drawArrays(gl.TRIANGLES,0,3);
 }
 tick(now){if(!this.hasSource)return false;if(this.lastTick!==undefined&&now-this.lastTick<15)return false;const dt=this.lastTick===undefined?1:Math.min(3,(now-this.lastTick)*.06);this.lastTick=now;
  const next=1-this.maskIndex;this.draw(this.programs.mask,this.masks[next],{source:this.sourceTex,history:this.masks[this.maskIndex]},dt);this.maskIndex=next;
  if(this.ready){const i=1-this.feedbackIndex;this.draw(this.programs.feedback,this.feedback[i],{neural:this.neuralTex,history:this.feedback[this.feedbackIndex]},dt);this.feedbackIndex=i;}
  this.draw(this.programs.blend,null,{source:this.sourceTex,neural:this.ready?this.feedback[this.feedbackIndex]:this.sourceTex},dt);return true;
 }
 capture(){this.draw(this.programs.prepare,this.prepared,{source:this.sourceTex,maskTex:this.masks[this.maskIndex]});const gl=this.gl,pixels=new Float32Array(512*512*4);gl.readPixels(0,0,512,512,gl.RGBA,gl.FLOAT,pixels);if(gl.getError()!==gl.NO_ERROR)throw Error('GPU frame readback failed');return pixels;}
 dispose(){this.gl.getExtension('WEBGL_lose_context')?.loseContext();}
}
