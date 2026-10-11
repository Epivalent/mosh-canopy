/* Real transparent ribbon surfaces. Textures and transcript caches are
   prepared in a worker; the render thread only advances clocks and uniforms. */
window.WordHelices = class WordHelices {
  constructor({THREE:T,scene,camera,links,clock,playing=clip=>!!clip?.player&&!clip.player.ended}){
    Object.assign(this,{T,scene,camera,links,clock,playing,enabled:true,size:.14,radius:.36,helicity:.65,speed:1,envelope:1.05,strength:.85});
    this.films=new Map();this.layouts=new Map();this.bundles=new Map();this.pending=new Set();this.empty=new Set();this.retryAt=new Map();this.active=new Map();this.lastBuild=-Infinity;
    this.stats={strands:0,films:0,triangles:0};this.base=new T.PlaneGeometry(1,1,128,2);
    this.common={uTimeRows:{value:1},uRowHeight:{value:44},uFont:{value:28},uSize:{value:this.size},uRadius:{value:this.radius},uHelicity:{value:this.helicity},uEnvelope:{value:this.envelope},uStrength:{value:this.strength},uViewportHeight:{value:innerHeight},uStage:{value:new T.Vector3()},uUnfold:{value:0}};
    this.vertexShader="attribute vec3 aStart,aEnd;attribute vec4 aFrame,aText;attribute vec2 aFlow;\n        uniform sampler2D uTimes;uniform float uTimeRows,uSize,uRadius,uEnvelope,uFont,uUnfold,uHelicity,uViewportHeight;uniform vec3 uStage;uniform vec4 uClock;\n        varying vec2 vUv;varying float vText,vBase,vLength,vPulse,vAlpha,vTint;\n        float textTime(float x){float u=clamp(x/max(aText.y,1.),0.,1.)*511.;float i=floor(u);\n          float a=texture2D(uTimes,vec2((i+.5)/512.,(aText.z+.5)/uTimeRows)).r;\n          float b=texture2D(uTimes,vec2((min(i+1.,511.)+.5)/512.,(aText.z+.5)/uTimeRows)).r;return mix(a,b,fract(u));}\n        float envelope(float x,float t){return exp(-.5*pow((textTime(x)-t)/max(.1,uEnvelope),2.));}\n        vec3 attachment(vec3 p){vec3 d=p-uStage;\n          if(abs(d.x)>max(abs(d.y),abs(d.z)))return vec3(sign(d.x)*3.5,0.,-.12)-d;\n          if(abs(d.y)>abs(d.z))return vec3(0.,sign(d.y)*2.1,-.12)-d;\n          return vec3(d.z>0.?3.5:-3.5,0.,-.12)-d;}\n        void main(){vec3 a=aStart,b=aEnd;\n          a+=attachment(a)*uUnfold*(1.-smoothstep(1.6,2.,distance(a,uStage)));\n          b+=attachment(b)*uUnfold*(1.-smoothstep(1.6,2.,distance(b,uStage)));\n          vec3 U=normalize(b-a),N=normalize(aFrame.xyz-U*dot(aFrame.xyz,U)),B=cross(U,N);\n          float len=length(b-a),x=uv.x*len,sourceS=aFlow.x>0.?x:len-x;\n          float pitch=uHelicity*6.2831853,angle=x*pitch+aFrame.w+(aFlow.x<0.?3.14159265:0.);\n          vec3 radial=N*cos(angle)+B*sin(angle),azimuth=-N*sin(angle)+B*cos(angle);\n          vec3 tangent=normalize(U+uRadius*pitch*azimuth);\n          // The ribbon has an actual surface tangent to the helix cylinder.\n          // Its transverse axis and all of its vertices live in world space.\n          vec3 across=normalize(cross(radial,tangent))*(-aFlow.x);\n          vec4 clock=uClock;\n          float arcRate=sqrt(1.+pow(uRadius*pitch,2.));\n          float delta=(len*.4-sourceS)*arcRate*uFont/uSize;\n          float q=clock.x+delta;\n          q=clock.x+delta/(1.+.65*envelope(q,clock.y));\n          float pulse=envelope(q,clock.y),scale=1.+.65*pulse;\n          vec3 world=a+U*x+radial*uRadius+across*(uv.y-.5)*uSize*(44./28.)*scale;\n          gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);\n          vUv=uv;vText=q;vBase=aText.x;vLength=aText.y;vPulse=pulse;vTint=aFlow.y;\n          vAlpha=clock.z*smoothstep(0.,.18,sourceS)*(1.-smoothstep(len-.18,len,sourceS))\n            *smoothstep(.35,1.8,uSize*projectionMatrix[1][1]*uViewportHeight*.5/max(.1,distance(cameraPosition,world)));\n        }";
    this.fragmentShader="uniform sampler2D uText;uniform vec2 uAtlasSize;uniform float uRowHeight,uStrength;\n        varying vec2 vUv;varying float vText,vBase,vLength,vPulse,vAlpha,vTint;\n        void main(){if(vText<0.||vText>vLength)discard;\n          float packed=vBase+vText,row=floor(packed/uAtlasSize.x);\n          vec2 tex=vec2(mod(packed,uAtlasSize.x)/uAtlasSize.x,1.-(row+1.-vUv.y)*uRowHeight/uAtlasSize.y);\n          float alpha=texture2D(uText,tex).a*vAlpha*uStrength*(.55+.4*vPulse);if(alpha<.012)discard;\n          vec3 color=mix(vec3(.93,.83,.63),vec3(.63,.84,.85),vTint);\n          color=mix(color,vec3(1.,.97,.86),vPulse*.45);gl_FragColor=vec4(color,alpha);\n        }";
    this.ready=new Promise(resolve=>this.resolveReady=resolve);
    this.requests=new Map();this.requestId=0;this.livePublications=new Set();
    const entry=new URL('https://epivalent.github.io/mosh-canopy/assets/vendor/word-ribbon-worker.js?v=20',location.href).href;
    const bootURL=URL.createObjectURL(new Blob(['importScripts('+JSON.stringify(entry)+');'],{type:'text/javascript'}));
    this.worker=new Worker(bootURL);this.worker.addEventListener('message',()=>URL.revokeObjectURL(bootURL),{once:true});
    this.worker.onerror=e=>{this.workerReady=false;this.workerError=e.message;console.error('Transcript worker:',e.message);for(const [id,p]of this.requests)if(p.worker===this.worker){clearTimeout(p.timer);p.reject(Error(e.message));this.requests.delete(id);}};
    this.worker.onmessage=({data})=>{
      if(data.type==='ready'){this.workerReady=true;this.workerError=null;}
      else if(data.requestId){const pending=this.requests.get(data.requestId);if(pending){this.requests.delete(data.requestId);clearTimeout(pending.timer);data.type==='response-error'?pending.reject(Error(data.message)):pending.resolve(data.result);}else {data.result?.bitmap?.close();data.result?.atlas?.bitmap?.close();}}
      else if(data.type==='live-update'){this.empty.delete(data.id);if(data.wordCount)this.films.set(data.id,{id:data.id,title:data.title});else this.films.delete(data.id);const b=this.bundles.get(data.id);if(b)b.validEnd=-Infinity;this.onTranscriptUpdate?.([data.id]);this.lastBuild=-Infinity;}
      else if(data.type==='transcript-catalog'){for(const f of data.films){this.films.set(f.id,f);this.empty.delete(f.id);const b=this.bundles.get(f.id);if(b)b.validEnd=-Infinity;}this.lastBuild=-Infinity;}
      else if(data.type==='catalog'){for(const f of data.added)this.films.set(f.id,f);this.cacheStatus=data;for(const id of data.index.updated||[]){const b=this.bundles.get(id);if(b)b.validEnd=-Infinity;}for(const id of data.removed||[])this.films.delete(id);this.onTranscriptUpdate?.(data.index.updated||[]);this.resolveReady(this.films.size);this.lastBuild=-Infinity;}
      else if(data.type==='texture'){this.pending.delete(data.id);this.makeBundle(data);this.lastBuild=-Infinity;}
      else if(data.type==='empty'){this.pending.delete(data.id);this.empty.add(data.id);}
      else if(data.type==='error'){this.pending.delete(data.id);this.retryAt.set(data.id,performance.now()+3000);console.warn('Word ribbons:',data.message);}
    };
    this.ensureSearchWorker();
  }
  key(clip){return clip?.mia?.id||clip?.mia?.mp4||clip?.id;}
  ensureSearchWorker(){if(this.searchWorker)return this.searchWorker;this.searchError=null;
    const entry=new URL('https://epivalent.github.io/mosh-canopy/assets/vendor/concordance-worker.js?v=meaning1',location.href).href,boot=URL.createObjectURL(new Blob(['importScripts('+JSON.stringify(entry)+');'],{type:'text/javascript'})),worker=new Worker(boot);this.searchWorker=worker;
    worker.addEventListener('message',()=>URL.revokeObjectURL(boot),{once:true});
    const fail=message=>{this.searchError=message;this.searchReady=false;for(const [id,p]of this.requests)if(p.worker===worker){clearTimeout(p.timer);p.reject(Error(message));this.requests.delete(id);}worker.terminate();if(this.searchWorker===worker)this.searchWorker=null;URL.revokeObjectURL(boot);};
    worker.onmessage=({data})=>{if(data.type==='ready'){this.searchReady=true;return;}if(data.type==='error'){fail(data.message);return;}const pending=this.requests.get(data.requestId);
      if(pending){this.requests.delete(data.requestId);clearTimeout(pending.timer);data.type==='response-error'?pending.reject(Error(data.message)):pending.resolve(data.result);}
      else{data.result?.bitmap?.close();data.result?.atlas?.bitmap?.close();if(data.type==='error')console.warn('Concordance:',data.message);}
    };
    worker.onerror=e=>fail(e.message);for(const args of this.livePublications)worker.postMessage({type:'ingest-live',...args});return worker;
  }
  cancelSearch(){this.searchWorker?.postMessage({type:'cancel-stack'});}
  async ask(type,args){if(this.workerError&&!['concordance','passage-stack','stack-pages','sheet','sheet-tile'].includes(type))throw Error(this.workerError);const worker=['concordance','passage-stack','stack-pages','sheet','sheet-tile'].includes(type)?this.ensureSearchWorker():this.worker;
    if(type==='live-transcript'){this.livePublications.add(args);this.searchWorker?.postMessage({type:'ingest-live',...args});}
    try{return await new Promise((resolve,reject)=>{const requestId=++this.requestId,timer=setTimeout(()=>{this.requests.delete(requestId);reject(Error('Transcript request timed out'));},type==='concordance'?120000:30000);this.requests.set(requestId,{resolve,reject,timer,worker});worker.postMessage({type,requestId,...args});});
    }finally{if(type==='live-transcript')this.livePublications.delete(args);}
  }
  refreshPublished(revision){if(!revision||revision===this.publishedRevision)return;this.publishedRevision=revision;this.worker.postMessage({type:'refresh-published'});this.searchWorker?.postMessage({type:'refresh-published'});}
  prefetch(clips){this.worker.postMessage({type:'prefetch',ids:[...new Set(clips.map(c=>this.key(c)).filter(Boolean))]});}
  pick(x,y,renderer,scene,canvas,ribbon=false){
    if(!this.enabled||this.strength<=0)return null;
    const T=this.T,rect=canvas.getBoundingClientRect();
    const ray=this.pickRay||=new T.Raycaster();this.camera.updateMatrixWorld();ray.setFromCamera(new T.Vector2((x-rect.left)/rect.width*2-1,1-(y-rect.top)/rect.height*2),this.camera);
    // Reject empty space before any GPU work. Include the full ribbon width and
    // helix radius; the shader pass below retains exact occlusion and word UVs.
    const reach=this.radius+this.size*(44/28);
    const visible=[...this.bundles.values()].filter(b=>b.mesh.visible&&b.geometry.instanceCount&&(!ribbon||b.linkRefs?.some(l=>ray.ray.distanceSqToSegment(l.a,l.b)<=reach*reach||this.common.uUnfold.value>0&&(l.a.distanceTo(this.common.uStage.value)<2||l.b.distanceTo(this.common.uStage.value)<2))));if(!visible.length)return null;
    const target=this.pickTarget||=new T.WebGLRenderTarget(5,5,{minFilter:T.NearestFilter,magFilter:T.NearestFilter,depthBuffer:true}),pickScene=this.pickScene||=new T.Scene();
    for(const mesh of [...pickScene.children])pickScene.remove(mesh);
    const key=ribbon?'hoverPick':'wordPick';
    visible.forEach((b,i)=>{
      if(!b[key]){
        let fragment='uniform vec2 uPickCode;\n'+this.fragmentShader.replace('gl_FragColor=vec4(color,alpha);','float q=floor(clamp(vText/vLength,0.,1.)*65535.);gl_FragColor=vec4(uPickCode/255.,floor(q/256.)/255.,mod(q,256.)/255.);');
        if(ribbon)fragment=fragment.replace('if(alpha<.012)discard;','if(vAlpha<.012)discard;');
        const material=new T.ShaderMaterial({uniforms:{...b.uniforms,uPickCode:{value:new T.Vector2()}},vertexShader:this.vertexShader,fragmentShader:fragment,side:T.DoubleSide,depthTest:true,depthWrite:true,blending:T.NoBlending});
        b[key]=new T.Mesh(b.geometry,material);b[key].frustumCulled=false;
      }
      b[key].material.uniforms.uPickCode.value.set((i+1)&255,(i+1)>>8);pickScene.add(b[key]);
    });
    const camera=this.camera,view=camera.view?{...camera.view}:null,previous=renderer.getRenderTarget(),auto=renderer.autoClear,clear=renderer.getClearColor(new T.Color()),alpha=renderer.getClearAlpha();
    const w=canvas.width,h=canvas.height,px=Math.round((x-rect.left)*w/rect.width),py=Math.round((y-rect.top)*h/rect.height),pixels=new Uint8Array(100);
    try{camera.setViewOffset(w,h,px-2,py-2,5,5);renderer.autoClear=false;renderer.setRenderTarget(target);renderer.setClearColor(0,0);renderer.clear();
      // Preserve the visible net's depth, then encode only actual text ink.
      renderer.render(scene,camera);renderer.clear(true,false,false);renderer.render(pickScene,camera);renderer.readRenderTargetPixels(target,0,0,5,5,pixels);
    }finally{if(view?.enabled)camera.setViewOffset(view.fullWidth,view.fullHeight,view.offsetX,view.offsetY,view.width,view.height);else camera.clearViewOffset();renderer.setRenderTarget(previous);renderer.setClearColor(clear,alpha);renderer.autoClear=auto;}
    const order=Array.from({length:25},(_,i)=>i).sort((a,b)=>(a%5-2)**2+(Math.floor(a/5)-2)**2-((b%5-2)**2+(Math.floor(b/5)-2)**2));
    for(const i of order){const id=pixels[i*4]+pixels[i*4+1]*256;if(!id||!visible[id-1])continue;const b=visible[id-1],q=(pixels[i*4+2]*256+pixels[i*4+3])/65535*b.layout.length;
      const word=b.layout.words.find(w=>q>=w.offset&&q<=w.offset+w.width)||(ribbon?b.layout.words.reduce((best,w)=>!best||Math.abs(w.center-q)<Math.abs(best.center-q)?w:best,null):null);if(word)return {word:word.text,start:word.start,clip:b.clip};}
    return null;
  }
  has(id){return this.films.has(id);}
  prepare(id,time=0){if(!id||this.empty.has(id)||this.pending.has(id)||performance.now()<(this.retryAt.get(id)||0))return;const b=this.bundles.get(id);if(b&&time>=b.validStart&&time<b.validEnd)return;this.pending.add(id);this.worker.postMessage({type:'render',id,time});}
  makeBundle(data){
    const T=this.T,texture=new T.Texture(data.bitmap);texture.flipY=false;texture.minFilter=texture.magFilter=T.LinearFilter;texture.generateMipmaps=false;texture.needsUpdate=true;
    const timing=new T.DataTexture(data.times,512,1,T.RGBAFormat,T.FloatType);timing.minFilter=timing.magFilter=T.NearestFilter;timing.generateMipmaps=false;timing.needsUpdate=true;
    const existing=this.bundles.get(data.id);
    if(existing){
      const mediaTime=existing.clip?this.clock(existing.clip):0;
      existing.texture.dispose();existing.timing.dispose();existing.bitmap.close();
      Object.assign(existing,{texture,timing,bitmap:data.bitmap,layout:{words:data.words,length:data.length},validStart:data.validStart,validEnd:data.validEnd});
      existing.uniforms.uText.value=texture;existing.uniforms.uTimes.value=timing;existing.uniforms.uAtlasSize.value.set(data.width,data.height);
      // Rebase against the same word so changing the atlas doesn't restart flow.
      const cursor=this.cursor(existing.layout,mediaTime);existing.lastCursor=cursor;
      this.layouts.set(data.id,existing.layout);return;
    }
    const uniforms={...this.common,uText:{value:texture},uTimes:{value:timing},uAtlasSize:{value:new T.Vector2(data.width,data.height)},uClock:{value:new T.Vector4()}};
    const material=new T.ShaderMaterial({uniforms,vertexShader:this.vertexShader,fragmentShader:this.fragmentShader,transparent:true,depthTest:true,depthWrite:false,side:T.DoubleSide});
    const geometry=new T.InstancedBufferGeometry();geometry.index=this.base.index;geometry.attributes.position=this.base.attributes.position;geometry.attributes.uv=this.base.attributes.uv;
    const attrs={};for(const [name,size]of [['aStart',3],['aEnd',3],['aFrame',4],['aText',4],['aFlow',2]]){const attr=new T.InstancedBufferAttribute(new Float32Array(6*size),size);attr.setUsage(T.DynamicDrawUsage);geometry.setAttribute(name,attr);attrs[name]=attr;}
    geometry.instanceCount=0;const mesh=new T.Mesh(geometry,material);mesh.frustumCulled=false;mesh.renderOrder=2;mesh.visible=false;this.scene.add(mesh);
    const old=this.bundles.get(data.id);if(old){this.scene.remove(old.mesh);old.texture.dispose();old.timing.dispose();old.bitmap.close();old.material.dispose();old.wordPick?.material.dispose();old.hoverPick?.material.dispose();old.geometry.dispose();}
    const layout={words:data.words,length:data.length};this.layouts.set(data.id,layout);
    this.bundles.set(data.id,{mesh,material,geometry,texture,timing,bitmap:data.bitmap,attrs,layout,uniforms,lastSeen:performance.now()/1000,flowOffset:0,lastCursor:null,validStart:data.validStart,validEnd:data.validEnd});
  }
  cursor(l,t){
    const a=l.words;let lo=0,hi=a.length;
    while(lo<hi){const mid=(lo+hi)>>1;if(a[mid].end<t)lo=mid+1;else hi=mid;}
    if(lo===a.length){const w=a[lo-1];return w.offset+w.width+(t-w.end)*110;}
    const w=a[lo];if(t<w.start){if(!lo)return w.offset+(t-w.start)*110;const p=a[lo-1];return p.offset+p.width+(w.offset-p.offset-p.width)*(t-p.end)/Math.max(.01,w.start-p.end);}
    return w.offset+w.width*(t-w.start)/Math.max(.01,w.end-w.start);
  }
  rebuild(now){
    this.active=new Map();for(const l of this.links()){const id=this.key(l.clip);if(!this.has(id))continue;if(!this.active.has(id))this.active.set(id,[]);this.active.get(id).push(l);}
    const retained=new Set([...this.active.keys(),...this.bundles.keys()]);
    if(!this.retained||retained.size!==this.retained.size||[...retained].some(id=>!this.retained.has(id))){this.retained=retained;this.worker.postMessage({type:'retain',ids:[...retained]});}
    for(const [id,lines]of this.active)this.prepare(id,this.clock(lines[0].clip));
    const T=this.T,u=new T.Vector3(),n=new T.Vector3(),axis=new T.Vector3();let strands=0,films=0;
    for(const [id,bundle]of this.bundles){const lines=this.active.get(id);bundle.mesh.visible=!!lines;
      if(!lines){if(now-bundle.lastSeen>8){this.scene.remove(bundle.mesh);bundle.texture.dispose();bundle.timing.dispose();bundle.bitmap.close();bundle.material.dispose();bundle.wordPick?.material.dispose();bundle.hoverPick?.material.dispose();bundle.wordPick?.parent?.remove(bundle.wordPick);bundle.hoverPick?.parent?.remove(bundle.hoverPick);bundle.geometry.dispose();this.bundles.delete(id);this.layouts.delete(id);}continue;}
      bundle.lastSeen=now;bundle.clip=lines[0].clip;let count=0;const a=bundle.attrs;
      const geometryChanged=bundle.textLength!==bundle.layout.length||!bundle.linkRefs||lines.length!==bundle.linkRefs.length||lines.some((l,i)=>l!==bundle.linkRefs[i]);
      if(geometryChanged){for(const l of lines){if(count===6)break;u.copy(l.b).sub(l.a).normalize();axis.set(Math.abs(u.y)>.9?1:0,Math.abs(u.y)>.9?0:1,0);n.crossVectors(u,axis).normalize();
        a.aStart.array.set(l.a.toArray(),count*3);a.aEnd.array.set(l.b.toArray(),count*3);a.aFrame.array.set([n.x,n.y,n.z,l.phase],count*4);
        a.aText.array.set([0,bundle.layout.length,0,0],count*4);a.aFlow.array.set([l.direction,l.direction<0?1:0],count*2);count++;
      }
      for(const attr of Object.values(a))attr.needsUpdate=true;bundle.geometry.instanceCount=count;
      bundle.linkRefs=lines.slice();bundle.textLength=bundle.layout.length;}
      strands+=bundle.geometry.instanceCount;films++;
    }
    this.stats={strands,films,triangles:strands*512,cachedFilms:this.films.size,residentTextures:this.bundles.size,pending:this.pending.size};this.lastBuild=now;
  }
  update(now,stage,unfold){
    if(now-this.lastBuild>.3)this.rebuild(now);
    for(const b of this.bundles.values()){
      b.mesh.visible=this.enabled&&this.strength>0&&this.active.has(this.key(b.clip));if(!b.mesh.visible)continue;
      const t=this.clock(b.clip),cursor=this.cursor(b.layout,t);
      if(b.lastCursor!==null){const delta=cursor-b.lastCursor;if(Math.abs(delta)<300)b.flowOffset+=(this.speed-1)*delta;else b.flowOffset=0;}
      b.lastCursor=cursor;b.uniforms.uClock.value.set(cursor+b.flowOffset,t,this.playing(b.clip)?1:0,0);
    }
    this.common.uViewportHeight.value=innerHeight;this.common.uSize.value=this.size;this.common.uRadius.value=this.radius;this.common.uHelicity.value=this.helicity;
    this.common.uEnvelope.value=this.envelope;this.common.uStrength.value=this.strength;this.common.uStage.value.copy(stage);this.common.uUnfold.value=unfold;
  }
};
