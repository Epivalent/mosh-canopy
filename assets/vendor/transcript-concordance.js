/* A navigable, word-aligned stack in the same camera coordinate system. */
window.TranscriptConcordance=class TranscriptConcordance {
  constructor({THREE:T,camera,nav,voices,enter,leave,jump,notify,renderer,selection=()=>null}){
    Object.assign(this,{T,camera,nav,voices,enter,leave,jump,notify,renderer,selection,active:false,focusIndex:0,spacing:.65,generation:0});
    this.scene=new T.Scene();this.root=new T.Group();this.scene.add(this.root);this.pages=new Map();this.pageRenderers=new Set();this.results=[];this.visibleRadius=4;this.residentRadius=9;
    this.panel=document.getElementById('concordancePanel');this.input=document.getElementById('concordanceWord');
    this.counter=document.getElementById('concordanceCount');this.position=document.getElementById('concordancePosition');this.slider=document.getElementById('concordanceIndex');this.mode=document.getElementById('concordanceMode');
    document.getElementById('concordanceForm').onsubmit=e=>{e.preventDefault();this.submit();};
    document.getElementById('concordanceClose').onclick=()=>this.close();
    document.getElementById('concordancePrev').onclick=()=>this.focus((this.requestedIndex??this.focusIndex)-1);
    document.getElementById('concordanceNext').onclick=()=>this.focus((this.requestedIndex??this.focusIndex)+1);
    document.getElementById('concordanceRealign').onclick=()=>this.open(this.input.value);
    this.mode.onchange=()=>{if(this.active)this.open(this.input.value);};this.slider.oninput=()=>this.focus(+this.slider.value);
    this.ray=new T.Raycaster();this.mouse=new T.Vector2();
    this.useSelection=document.getElementById('concordanceUseSelection');
    this.semantic=new SemanticSearch(this);
    this.useSelection.onchange=()=>{this.syncFilters();if(this.input.value.trim())this.submit();};
    addEventListener('mosh-catalogue-selection',()=>{this.selectionCoverage=null;if(!this.panel.hidden)this.syncFilters();if(this.useSelection.checked&&!this.panel.hidden&&this.input.value.trim())this.submit();});
  }
  submit(){return this.open(this.input.value)}
  syncFilters(){
    this.filters??=new CatalogueFilterControls(document.getElementById('concordanceFilterFields'),()=>this.useSelection.checked);
    this.filters.sync();
  }
  updateCoverage(){const el=document.getElementById('concordanceCoverage'),s=this.voices.cacheStatus;if(!el)return;
    if(!s?.coverage)return;const c=s.coverage;
    el.textContent=c.scope==='full-source-films'?`${s.total.toLocaleString()} full films · ${s.processed} transcribed · ${c.partial} with partial transcripts · ${c.pending} awaiting transcripts. ${c.words.toLocaleString()} indexed words; ${s.errors} failed.`:`${s.processed.toLocaleString()} / ${s.total.toLocaleString()} videos processed · ${c.speech.toLocaleString()} with speech · ${c.words.toLocaleString()} indexed words. ${c.noSpeech} with no detected speech; ${c.noAudio} with no audio track; ${s.errors} failed.`;
    const youtube=this.batchCoverage?.captions??[...this.voices.films.keys()].filter(id=>id.startsWith('yt:')).length;if(youtube)el.textContent+=` Plus ${youtube.toLocaleString()} YouTube transcripts cached from MyRetroTVs, Neon Pulse and exploration.`;
    if(this.selectionCoverage){const c=this.selectionCoverage;el.textContent=`${c.indexed.toLocaleString()} searchable transcripts in this selection${c.selected!==null?' · '+c.selected.toLocaleString()+' catalogue films selected':''}. ${c.totalIndexed.toLocaleString()} transcripts searchable across all sources. Films awaiting captions are not searched.`;if(this.batchCoverage)el.textContent+=` YouTube caption batch: ${(this.batchCoverage.captions||0).toLocaleString()} captioned films · ${(this.batchCoverage.words||0).toLocaleString()} words (included automatically).`; }
  }
  toggle(){if(this.panel.hidden)this.showSearch();else this.close();}
  hidePanel(){this.panel.hidden=true;document.getElementById("bWords").setAttribute("aria-expanded","false");}
  showSearch(){this.semantic.hide();this.panel.hidden=false;document.getElementById("bWords").setAttribute("aria-expanded","true");this.syncFilters();this.updateCoverage();document.getElementById("mixPanel").hidden=true;document.getElementById("bMix").setAttribute("aria-expanded","false");this.input.focus();if(this.results.length&&!this.searching){this.activateStack();this.focus(this.requestedIndex??this.focusIndex);}}
  captureView(){return {mode:this.nav.mode,target:this.nav.target.clone(),sph:this.nav.sph.clone(),look:this.nav.look.clone(),position:this.camera.position.clone(),fov:this.camera.fov,outside:this.nav.outsideView,outsideFlight:this.nav.outsideFlight};}
  restoreView(s){this.nav.mode=s.mode;this.nav.target.copy(s.target);this.nav.sph.copy(s.sph);this.nav.look.copy(s.look);this.camera.position.copy(s.position);this.camera.fov=s.fov;this.camera.updateProjectionMatrix();this.nav.outsideView=s.outside;this.nav.outsideFlight=s.outsideFlight;}
  activateStack(){
    if(this.active||!this.results.length)return;
    this.saved=this.captureView();this.enter();this.nav.explore();this.nav.outsideView=false;this.nav.outsideFlight=null;
    if(this.stackView)this.restoreView(this.stackView);
    else{const forward=new this.T.Vector3();this.camera.getWorldDirection(forward);this.root.position.copy(this.camera.position).addScaledVector(forward,9);this.root.quaternion.copy(this.camera.quaternion);this.root.rotateY(-.22);this.root.updateMatrixWorld(true);this.nav.target.copy(this.root.position);this.nav.sph.setFromVector3(this.camera.position.clone().sub(this.nav.target));}
    this.active=true;
  }
  disposePage(p){if(!p.mesh)return;p.textPages?.release(p);this.root.remove(p.mesh);p.mesh.geometry.dispose();p.mesh.material.dispose();p.mesh=null;p.capacity=0;}
  disposePages(){for(const p of this.pages.values())if(p)this.disposePage(p);this.pages.clear();for(const renderer of this.pageRenderers)renderer.dispose();this.pageRenderers.clear();this.textPages=null;
    if(this.outlines){this.root.remove(this.outlines);this.outlines.geometry.dispose();this.outlines.material.dispose();this.outlines=null;}}
  async open(word,passages=null){
    if(!word.trim())return;const token=++this.generation;this.searching=true;this.showSearch();this.input.blur();if(!passages)this.input.value=word;this.counter.textContent='Preparing aligned transcripts…';this.slider.disabled=true;
    try{const response=await this.voices.ask(passages?'passage-stack':'concordance',passages?{passages:passages.map(p=>({id:p.id,title:p.title,start:p.start})),prepareSheets:true}:{word,mode:this.mode.value,seed:Date.now(),prepareSheets:true,progressive:true,selection:this.useSelection.checked?this.selection():null});if(token!==this.generation){response.atlas?.bitmap.close();return;}
      this.preparation=response.preparation;this.batchCoverage=response.batchCoverage;this.selectionCoverage=response.selectionCoverage;this.updateCoverage();this.requestedIndex=undefined;this.disposePages();this.stackView=null;this.focusIndex=0;this.results=response.results;this.term=response.term;this.stackId=response.stackId;this.installPages(response);this.counter.textContent=passages?`${response.results.length} related transcripts · aligned at retrieved passages`:`${response.results.length} films · ${response.occurrences} occurrences`;
      if(!this.results.length){this.position.textContent='No matching speech in the current transcripts.';return;}
      if(!this.panel.hidden)this.activateStack();
      this.makeOutlines();this.slider.max=this.results.length-1;this.slider.disabled=false;this.focus(0);
    }catch(e){if(token===this.generation){this.counter.textContent='The transcripts could not be searched.';this.notify(e.message);}}finally{if(token===this.generation)this.searching=false;}
  }
  openPassages(passages,query){this.semantic.hide();return this.open(query,passages)}
  installPages(response){
    if(!response.atlas)return;
    const textPages=new TranscriptTextPages(this.T,response.atlas);this.pageRenderers.add(textPages);this.textPages??=textPages;
    this.renderer?.initTexture(textPages.texture);
    response.pages.forEach((p,i)=>{const index=p.stackIndex??i,old=this.pages.get(index);if(old)this.disposePage(old);this.pages.set(index,{...p,term:this.term,textPages});if(Number.isFinite(p.start)&&this.results[index])this.results[index].start=p.start;});
    if(this.active&&this.requestedIndex!==undefined&&this.pages.has(this.requestedIndex))this.presentFocus(this.requestedIndex);
    this.describeFocus();
  }
  prepareNearby(){
    if(!this.active||this.pageRequest)return;
    const focus=this.requestedIndex??this.focusIndex;
    const indices=[];for(let d=0;d<=this.residentRadius;d++)for(const i of d?[focus+d,focus-d]:[focus])if(i>=0&&i<this.results.length&&!this.pages.has(i))indices.push(i);
    if(!indices.length)return;
    const generation=this.generation,stackId=this.stackId;
    // The focused sheet is always first. Prepare visible neighbours together;
    // retained neighbours are the next request, after the current view is ready.
    const visible=indices.filter(i=>Math.abs(i-focus)<=this.visibleRadius),wanted=indices.includes(focus)?[focus]:visible.length?visible:indices;
    this.pageRequest=this.voices.ask('stack-pages',{stackId,indices:wanted,priority:wanted.includes(focus)?'high':'low'}).then(response=>{
      if(generation!==this.generation){response.atlas?.bitmap.close();return;}
      this.installPages(response);this.update(0);
    }).catch(e=>{if(generation===this.generation){this.position.textContent='Could not prepare transcript: '+e.message;this.pageFailure=true;}}).finally(()=>{
      this.pageRequest=null;if(this.active&&!this.pageFailure)this.prepareNearby();
    });
  }
  makeOutlines(){const T=this.T,geo=new T.PlaneGeometry(8,5.5),mat=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}',
    fragmentShader:'varying vec2 vUv;void main(){float e=min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y));if(e>.002)discard;gl_FragColor=vec4(.83,.79,.7,.16);}'});
    const mesh=new T.InstancedMesh(geo,mat,this.results.length),dummy=new T.Object3D();mesh.frustumCulled=false;
    for(let i=0;i<this.results.length;i++){dummy.position.set(0,0,-i*this.spacing);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}mesh.instanceMatrix.needsUpdate=true;this.outlines=mesh;this.root.add(mesh);
  }
  describeFocus(){const index=this.requestedIndex??this.focusIndex,r=this.results[index];if(r)this.position.textContent=`${index+1} / ${this.results.length} · ${r.title}${Number.isFinite(r.start)?' · '+r.start.toFixed(2)+' s':''}${index!==this.focusIndex?' · preparing transcript…':''}`;}
  focus(index){if(!this.results.length)return;this.requestedIndex=Math.max(0,Math.min(this.results.length-1,index));this.slider.value=this.requestedIndex;
    // Keep the current sheet and camera together until the destination has text.
    // A scrub can skip uncached results; it must never expose the film behind it.
    this.pageFailure=false;if(this.active&&this.pages.has(this.requestedIndex))this.presentFocus(this.requestedIndex);
    this.describeFocus();this.prepareNearby();
  }
  presentFocus(index){this.focusIndex=index;
    const target=this.root.localToWorld(new this.T.Vector3(0,0,-this.focusIndex*this.spacing));
    this.goal=null;this.nav.target.copy(target);this.update(0);
  }
  loadPage(index){const p=this.pages.get(index);if(!p||p.mesh)return;const T=this.T;
    p.mesh=new T.Mesh(new T.PlaneGeometry(p.width/160,p.height/160),new T.MeshBasicMaterial({color:0xe9e4d9,transparent:true,opacity:.1,side:T.DoubleSide,depthWrite:false}));
    p.mesh.position.set((p.width/2-p.anchorX)/160,(p.anchorY-p.height/2)/160,-index*this.spacing);p.mesh.userData.sheet=index;this.root.add(p.mesh);
  }
  update(dt){if(!this.active)return;
    const local=this.root.worldToLocal(this.nav.target.clone()),span=Math.max(800,this.nav.sph.radius*Math.tan(this.camera.fov*Math.PI/360)*160*1.8);
    for(let i=Math.max(0,this.focusIndex-this.visibleRadius);i<=Math.min(this.results.length-1,this.focusIndex+this.visibleRadius);i++)this.loadPage(i);
    for(const [i,p]of this.pages){if(!p.mesh)continue;const d=Math.abs(i-this.focusIndex);
      if(d>this.residentRadius){this.disposePage(p);continue;}p.mesh.visible=d<=this.visibleRadius;if(!p.mesh.visible)continue;
      p.mesh.material.opacity=d===0?.99:d===1?.18:.055;p.mesh.renderOrder=d===0?10:0;
      const center=p.anchorY-local.y*160;p.textPages.draw(p,center-span,center+span);
      p.ink.material.uniforms.uOpacity.value=p.mesh.material.opacity;p.ink.renderOrder=p.mesh.renderOrder+1;
    }
  }
  pan(){this.goal=null;}
  async click(x,y,canvas){if(!this.active)return false;const rect=canvas.getBoundingClientRect();this.mouse.set((x-rect.left)/rect.width*2-1,1-(y-rect.top)/rect.height*2);this.camera.updateMatrixWorld();this.root.updateMatrixWorld(true);this.ray.setFromCamera(this.mouse,this.camera);
    const meshes=[...this.pages.values()].filter(p=>p?.mesh?.visible).map(p=>p.mesh),hits=this.ray.intersectObjects(meshes,false);
    // A focused sheet can be seen through neighbouring translucent sheets.
    const hit=hits.find(h=>h.object.userData.sheet===this.focusIndex)||hits[0];if(!hit)return true;
    const index=hit.object.userData.sheet,p=this.pages.get(index),px=hit.uv.x*p.width,py=(hit.object.userData.tileTop||0)+(1-hit.uv.y)*(hit.object.userData.tileHeight||p.height);
    let word=null,distance=Infinity;const boxes=p.boxes||function*(){for(let i=0;i<p.words.length;i++){const j=i*4;yield {x:p.positions[j],y:p.positions[j+1],width:p.positions[j+2],height:44,start:p.positions[j+3]};}}();
    for(const b of boxes){const dx=Math.max(b.x-px,0,px-b.x-b.width),dy=Math.max(b.y-py,0,py-b.y-b.height),d=dx*dx+dy*dy*4;if(d<distance){distance=d;word=b;}}
    if(!word)return true;this.position.textContent=`Entering ${this.results[index].title} at ${word.start.toFixed(2)} s…`;
    const pending=this.jump(this.results[index].id,word.start);this.close();const generation=this.generation;
    try{await pending;}catch(e){if(generation===this.generation&&!String(e.message).includes('superseded'))this.notify(e.message);}return true;
  }
  close(restore=true){
    // Hiding is not a new search: keep the worker stack, atlases and alignment.
    // An in-flight page may finish, but prepareNearby stops while inactive.
    this.jumpToken=(this.jumpToken||0)+1;this.jumping=false;this.hidePanel();this.goal=null;
    if(this.active){this.stackView=this.captureView();this.active=false;if(restore&&this.saved)this.restoreView(this.saved);this.leave();}
  }
};
