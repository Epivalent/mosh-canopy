/* Collages inhabit persistent lattice faces. Raster work is delegated to a worker. */
(function(){
  class NetCollage {
    constructor({THREE,scene,camera,renderer,faces,upgrade,spacing=13}){
      Object.assign(this,{THREE,scene,camera,renderer,faces,upgrade,spacing});this.group=new THREE.Group();scene.add(this.group);
      this.bank=new CollageBank();this.session=Date.now().toString(36);this.lastComposedCount=0;this.composing=false;this.history=[];this.panels=[];this.placed=0;this.sequence=0;this.requests=new Map();this.tick=0;this.strength=1;this.ornamentation=1;
      this.composer={prompt:CollageLayout.prompt,enabled:false,interval:90,key:'',model:CollageComposer.defaultModel,endpoint:'https://openrouter.ai/api/v1/chat/completions'};
      try{const saved=JSON.parse(localStorage.getItem('mosh.collage.composer')||'{}');if(typeof saved.enabled==='boolean')this.composer.enabled=saved.enabled;if(Number.isFinite(saved.interval))this.composer.interval=Math.max(30,saved.interval);if(typeof saved.prompt==='string')this.composer.prompt=saved.prompt;if(typeof saved.key==='string')this.composer.key=saved.key;if(typeof saved.model==='string'&&saved.model)this.composer.model=saved.model==='anthropic/claude-sonnet-5.5'?CollageComposer.defaultModel:saved.model;}catch{}
      this.worker=new Worker('https://epivalent.github.io/mosh-canopy/assets/vendor/collage-panel-worker.js?v=4');
      this.worker.onmessage=({data})=>{const r=this.requests.get(data.id);if(!r){data.bitmap?.close();return;}this.requests.delete(data.id);data.error?r.reject(Error(data.error)):r.resolve(data);};
      this.worker.onerror=e=>{for(const r of this.requests.values())r.reject(Error(e.message));this.requests.clear();this.status('Collage renderer: '+e.message);};
    }
    saveComposer(){try{localStorage.setItem('mosh.collage.composer',JSON.stringify({key:this.composer.key,model:this.composer.model,prompt:this.composer.prompt,enabled:this.composer.enabled,interval:this.composer.interval}));}catch{this.status('This browser could not save the composer settings.');}}
    status(text){this.lastStatus=text;const el=document.getElementById('collageStatus');if(el)el.textContent=text;}
    libraryStatus(){const b=this.bank.stats(),el=document.getElementById('collageLibrary');if(el)el.textContent=b.cutouts+' cutouts · '+b.films+' films in the shared collection';}
    scheduleCompose(){
      this.libraryStatus();clearTimeout(this.composeTimer);if(!this.composer.enabled||this.composing)return;
      const b=this.bank.stats();if(b.films<3)return;
      const delay=this.lastComposeAt?Math.max(2200,(this.composer.interval||90)*1000-(Date.now()-this.lastComposeAt)):2200;
      // A recurring clock also recomposes an unchanged bank; arrivals cannot reset it indefinitely.
      this.nextComposeAt=Date.now()+delay;
      this.composeTimer=setTimeout(()=>this.compose({automatic:true}),delay);
    }
    latest(){return this.latestScene||this.panels.findLast(p=>p.authoredBy&&p.blob)||this.panels.findLast(p=>p.blob);}
    center(){return this.latest()?.center.clone()||new this.THREE.Vector3(0,8.5,0);}
    progress(on,refine=false){
      for(const id of ['collageCompose','collageRefine']){const b=document.getElementById(id);if(b)b.disabled=on;}
      clearInterval(this.progressTimer);
      if(on){this.requestStarted=Date.now();const update=()=>{const b=document.getElementById(refine?'collageRefine':'collageCompose');if(b)b.textContent=(refine?'Refining':'Composing')+' · '+Math.floor((Date.now()-this.requestStarted)/1000)+'s';};update();this.progressTimer=setInterval(update,1000);}
      else{const a=document.getElementById('collageCompose'),b=document.getElementById('collageRefine');if(a)a.textContent='Compose collection';if(b)b.textContent='Refine latest scene';}
    }
    createPanel(face){
      const T=this.THREE,geo=new T.PlaneGeometry(1,1,4,4),pos=geo.attributes.position,uv=geo.attributes.uv;
      const panel={id:face.key,corners:face.corners,items:[],revision:0,texture:null,blob:null,plan:null,busy:false,dirty:false};
      panel.center=this.point(panel,.5,.5);panel.quaternion=this.frame(panel);
      for(let i=0;i<pos.count;i++){const p=this.point(panel,uv.getX(i),1-uv.getY(i));pos.setXYZ(i,p.x,p.y,p.z);}
      geo.computeVertexNormals();geo.computeBoundingSphere();
      panel.mesh=new T.Mesh(geo,new T.MeshBasicMaterial({transparent:true,alphaTest:.06,side:T.DoubleSide,depthWrite:true,opacity:this.strength}));
      panel.mesh.visible=false;this.group.add(panel.mesh);this.panels.push(panel);return panel;
    }
    point(panel,x,y){
      const [a,b,c,d]=panel.corners,u=.13+x*.74,v=.13+(1-y)*.74;
      return a.clone().multiplyScalar((1-u)*(1-v)).addScaledVector(b,u*(1-v)).addScaledVector(c,(1-u)*v).addScaledVector(d,u*v);
    }
    frame(panel,rotation=0){const T=this.THREE,[a,b,c]=panel.corners,right=b.clone().sub(a).normalize(),up=c.clone().sub(a).normalize(),n=right.clone().cross(up).normalize();up.crossVectors(n,right);
      return new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(right,up,n)).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),-rotation*Math.PI/180));}
    reserve(cut,seg){
      const faces=this.faces(),near=faces[0];if(!near)throw Error('No lattice face available');
      let panel=this.panels.findLast(p=>!p.authoredBy&&p.items.length<6&&p.center.distanceTo(near.center)<this.spacing*2.5);
      if(!panel){const face=faces.find(f=>!this.panels.some(p=>p.id===f.key));if(!face)throw Error('Nearby collage panels are full');panel=this.createPanel(face);}
      const item={id:`cut-${this.session}-${++this.sequence}`,label:cut.label||'film object',title:seg?.clip?.mia?.title||seg?.clip?.retro?.title||seg?.clip?.name||'',year:seg?.clip?.mia?.year||seg?.clip?.retro?.year||'',filmId:seg?.clip?.mia?.id||seg?.clip?.id||'',sourcePage:seg?.clip?.mia?.page||seg?.clip?.retro?.page||'',time:cut.source?.time??(seg?.t0||0),confidence:cut.source?.object?.confidence||0,width:cut.canvas.width,height:cut.canvas.height,landed:false,blob:null};
      if(cut.source?.kind==='preview'||cut.source?.kind==='poster'){
        item.time=null;item.extractionSource=cut.source.kind;item.previewTime=cut.source.previewTime;item.previewUrl=cut.source.url;
      }
      panel.items.push(item);panel.plan=CollageLayout.fallback(panel.items,this.panels.indexOf(panel));panel.revision++;
      const p=panel.plan.pieces.find(p=>p.id===item.id),b=CollageLayout.bounds(p,item.width/item.height);
      return {panel,item,position:this.point(panel,b.x,b.y),quaternion:this.frame(panel,p.rotation),width:b.w*this.spacing*.74,height:b.h*this.spacing*.74};
    }
    async land(spot,cut){
      const {panel,item}=spot;
      // Encode on OffscreenCanvas: no getImageData or synchronous data URLs in the render loop.
      const canvas=new OffscreenCanvas(cut.canvas.width,cut.canvas.height);canvas.getContext('2d').drawImage(cut.canvas,0,0);
      item.blob=await canvas.convertToBlob({type:'image/png'});item.landed=true;this.placed++;
      cut.canvas.close?.();cut.mask?.close?.();
      if(this.upgrade&&cut.source)this.upgrade(cut).then(async better=>{if(!better)return;try{const c=new OffscreenCanvas(better.canvas.width,better.canvas.height);c.getContext('2d').drawImage(better.canvas,0,0);item.blob=await c.convertToBlob({type:'image/png'});item.width=c.width;item.height=c.height;item.originalResolution=true;this.bank.put(item);for(const owner of this.panels)if(owner.items.includes(item)){owner.revision++;this.render(owner);}}finally{better.canvas.close?.();better.mask.close?.();}}).catch(e=>{item.upgradeError=e.message;});
      this.bank.put(item);this.render(panel);this.scheduleCompose();
    }
    async render(panel){
      panel.dirty=true;if(panel.busy)return;panel.busy=true;
      try{while(panel.dirty){panel.dirty=false;const revision=panel.revision,source=panel.items.filter(i=>i.landed);
        if(!source.length){panel.mesh.visible=false;panel.blob=null;if(panel.texture){panel.texture.dispose();panel.texture.image.close?.();panel.texture=null;panel.mesh.material.map=null;}continue;}
        const items=await Promise.all(source.map(async i=>({id:i.id,image:await createImageBitmap(i.blob)})));
        const plan={...panel.plan,pieces:panel.plan.pieces.filter(p=>source.some(i=>i.id===p.id)),ornaments:panel.plan.ornaments.slice(0,Math.round(panel.plan.ornaments.length*this.ornamentation))};
        const id=++this.sequence;
        const result=await new Promise((resolve,reject)=>{this.requests.set(id,{resolve,reject});this.worker.postMessage({id,items,plan,size:2048},items.map(i=>i.image));});
        if(revision!==panel.revision){result.bitmap.close();panel.dirty=true;continue;}
        panel.blob=result.blob;this.install(panel,result.bitmap);
      }}catch(e){this.status(e.message);console.error('Collage render',e);}finally{panel.busy=false;}
    }
    install(panel,bitmap){
      const old=panel.texture,tex=new this.THREE.Texture(bitmap);tex.needsUpdate=true;tex.flipY=false;tex.generateMipmaps=true;tex.minFilter=this.THREE.LinearMipmapLinearFilter;
      tex.anisotropy=Math.min(8,this.renderer.capabilities.getMaxAnisotropy());panel.texture=tex;panel.mesh.material.map=tex;panel.mesh.material.needsUpdate=true;panel.mesh.visible=true;
      if(old){old.dispose();old.image.close?.();}
    }
    update(dt){
      this.tick+=dt;if(this.tick<.7)return;this.tick=0;
      // Stable geometry and complete artwork remain visible. Only texture resolution changes with distance.
      const closest=this.panels.filter(p=>p.blob).sort((a,b)=>a.center.distanceToSquared(this.camera.position)-b.center.distanceToSquared(this.camera.position));
      let jobs=0;
      for(let i=0;i<closest.length;i++){const p=closest[i];p.mesh.material.opacity=this.strength;
        const d=p.center.distanceTo(this.camera.position),size=i<12&&d<this.spacing*6?2048:d<this.spacing*10?512:128;
        if(p.texture?.image.width===size||p.restoring||jobs>=2)continue;jobs++;p.restoring=true;const blob=p.blob;
        createImageBitmap(blob,{imageOrientation:'flipY',premultiplyAlpha:'none',resizeWidth:size,resizeHeight:size,resizeQuality:'high'}).then(b=>{if(!p.removed&&p.blob===blob)this.install(p,b);else b.close();}).catch(e=>console.warn('Collage texture',e)).finally(()=>p.restoring=false);
      }
    }
    async compose({refine=false,automatic=false}={}){
      const cfg={...this.composer},draft=refine?this.latest():null;
      if(refine&&!draft?.authoredBy){this.status('Compose a scene first, then refine it.');return;}
      if(!cfg.prompt?.trim()){this.status('Enter a composition prompt in Mix.');return;}
      if(!cfg.key||!cfg.model){this.status('Choose a vision model and enter your API key in Mix.');return;}
      if(this.composing)return;
      this.composing=true;this.lastComposeAt=Date.now();clearTimeout(this.composeTimer);this.progress(true,refine);
      if(!automatic&&this.latest()?.authoredBy)this.onInspect?.(this.latest());
      try{
      await this.bank.ready;for(const p of this.panels)for(const i of p.items)if(i.landed&&i.blob)this.bank.items.set(i.id,i);
      const source=refine?[...new Map([...draft.items,...this.bank.select()].map(i=>[i.id,i])).values()]:this.bank.select(),stats=this.bank.stats();
      if(source.length<2){this.status('Collecting more material for a cross-film composition.');return;}
      this.lastComposedCount=stats.cutouts;this.libraryStatus();
      this.status('Choosing a scene from '+source.length+' cutouts across the collection…');
        const content=[{type:'text',text:cfg.prompt+'\n\n'+CollageLayout.protocol+'\nGLOBAL MATERIAL LIBRARY: '+JSON.stringify(source.map(({id,label,title,year,width,height,usedCount=0})=>({id,label,title,year,width,height,usedCount})))+'\nRecent scenes (develop a fresh idea): '+JSON.stringify(this.history.slice(-6))}];
        for(const i of source){const image=await createImageBitmap(i.blob),scale=Math.min(1,512/Math.max(image.width,image.height)),c=new OffscreenCanvas(Math.max(1,Math.round(image.width*scale)),Math.max(1,Math.round(image.height*scale))),x=c.getContext('2d');x.fillStyle='#d4d0c8';x.fillRect(0,0,c.width,c.height);x.drawImage(image,0,0,c.width,c.height);image.close();
          const blob=await c.convertToBlob({type:'image/png'}),url=await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(blob);});
          content.push({type:'text',text:i.id},{type:'image_url',image_url:{url}});
        }
        if(draft){
          const image=await createImageBitmap(draft.blob),c=new OffscreenCanvas(1024,1024),x=c.getContext('2d');x.fillStyle='#172126';x.fillRect(0,0,1024,1024);x.drawImage(image,0,0,1024,1024);image.close();
          const url=await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);c.convertToBlob({type:'image/png'}).then(b=>r.readAsDataURL(b));});
          content.push({type:'text',text:'VISUAL REVISION: This is the existing layout followed by its actual rendered image. Inspect physical contacts, floating parts, accidental overlaps, legibility, silhouette and negative space. Improve the visual scene itself, keeping its strongest idea. Return the complete revised JSON layout. '+JSON.stringify(draft.plan)},{type:'image_url',image_url:{url}});
        }
        const {plan,responses}=await CollageComposer.request({key:cfg.key,model:cfg.model,endpoint:cfg.endpoint,content,items:source,onStatus:text=>this.status(text)});
        this.lastCompositionUsage=responses.map(r=>r.usage);
        const selected=new Set(plan.pieces.map(p=>p.id)),chosen=source.filter(i=>selected.has(i.id));
        // Move chosen material out of the uncomposed racks. Authored scenes remain intact.
        const replace=draft||(automatic&&this.latest()?.authoredBy&&this.latest().center.distanceTo(this.camera.position)<this.spacing*4?this.latest():null);
        const face=replace?{key:replace.id,corners:replace.corners}:this.faces().find(f=>!this.panels.some(p=>p.id===f.key));if(!face)throw Error('No nearby empty lattice window');
        const panel=this.createPanel(face);panel.items=chosen;panel.plan=plan;panel.authoredBy=cfg.model;panel.sourceFilms=[...new Set(chosen.map(i=>i.title))];panel.revision++;
        await this.render(panel);
        if(!panel.blob){this.removePanel(panel);throw Error('The new composition could not be rendered');}
        if(replace)this.removePanel(replace);
        this.latestScene=panel;
        for(const other of this.panels){if(other===panel||other.authoredBy)continue;const remain=other.items.filter(i=>!selected.has(i.id));if(remain.length===other.items.length)continue;other.items=remain;other.plan=CollageLayout.fallback(remain);other.revision++;this.render(other);}
        for(const item of chosen){item.usedCount=(item.usedCount||0)+1;this.bank.put(item);}
        this.history.push({title:plan.title,concept:plan.concept});this.showSources(panel);this.showPreview(panel);this.onComposition?.(panel,{automatic});this.status(plan.title+' · '+chosen.length+' cutouts from '+new Set(chosen.map(i=>i.filmId||i.title)).size+' films');
      }catch(e){if(e.status===401||e.status===403){this.composer.enabled=false;this.saveComposer();clearTimeout(this.composeTimer);const box=document.getElementById('collageAuto');if(box)box.checked=false;this.status('OpenRouter rejected this key. Update it in Mix; automatic composition is paused.');}else this.status('Composer: '+e.message);console.warn('Collage composer',e);}finally{this.composing=false;this.progress(false);if(this.composer.enabled)this.scheduleCompose();}
    }
    removePanel(panel){panel.removed=true;this.group.remove(panel.mesh);panel.mesh.geometry.dispose();panel.mesh.material.dispose();panel.texture?.dispose();panel.texture?.image.close?.();this.panels=this.panels.filter(p=>p!==panel);}
    showPreview(panel){const img=document.getElementById('collagePreview');if(!img)return;if(this.previewURL)URL.revokeObjectURL(this.previewURL);this.previewURL=URL.createObjectURL(panel.blob);img.src=this.previewURL;img.alt=panel.plan.title;img.hidden=false;img.onclick=()=>this.onInspect?.(panel);}
    showSources(panel){const el=document.getElementById('collageSources');if(el)el.textContent=panel.sourceFilms.join(' · ');}
    async exportLatest(){return this.latest()?.blob;}
  }
  window.NetCollage=NetCollage;
})();
