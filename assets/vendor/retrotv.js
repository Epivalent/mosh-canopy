/* MyRetroTVs supplies catalogue metadata; media and captions come from YouTube.
   Only the small prepared window enters Archive. The complete catalogue remains
   shuffled in its worker, so catalogue size cannot inflate render-loop work. */
window.RetroTV=class RetroTV {
 constructor({archive,voices,notify,preparation,retained,previewOptions,demand=()=>0}){
  Object.assign(this,{archive,voices,notify,preparation,retained,demand,requests:new Map(),records:new Map(),ready:[],requested:false,serial:0,generation:0,failed:0,loaded:0,exhausted:false});
  this.previews=new BeadPreviews({archive,...previewOptions});
  this.direct=new YouTubeDirect({hasCaptions:async clip=>typeof RetroCaptionCache!=='undefined'&&await RetroCaptionCache.hasComplete(clip.id),onMetadata:(clip)=>{this.archive.onChange();this.status();},onCaptions:async(clip,data,language)=>{
    const {captionWords}=await import('https://epivalent.github.io/mosh-canopy/assets/vendor/retrotv-captions.mjs');const words=captionWords(data,clip.duration||Infinity);if(!words.length)return;
    clip.retro.captionStatus='available';clip.retro.captionLanguage=language;await this.publish({...clip.retro,id:clip.id,duration:clip.duration,title:clip.name,captions:words});clip.player?.captureSpeech(false);
   },onPCM:(clip,data)=>this.speech?.(clip,data),onError:(clip,error)=>{clip.lastMediaError={message:error};this.lastError=error;this.status();}});
  this.worker=new Worker('https://epivalent.github.io/mosh-canopy/assets/vendor/retrotv-worker.mjs?v=neon1',{type:'module'});
  this.worker.onmessage=({data})=>{const q=this.requests.get(data.requestId);if(q){this.requests.delete(data.requestId);clearTimeout(q.timer);data.error?q.reject(Error(data.error)):q.resolve(data.result);}};
  this.worker.onerror=e=>{this.lastError=e.message;for(const q of this.requests.values()){clearTimeout(q.timer);q.reject(Error(e.message));}this.requests.clear();this.status();};
  this.source=document.getElementById('beadSource');this.era=document.getElementById('miaEra');this.label=document.getElementById('retroStatus');this.toggle=document.getElementById('retroOn');this.decade=document.getElementById('retroDecade');this.category=document.getElementById('retroCategory');this.mix=document.getElementById('retroMix');this.collection=document.getElementById('miaCollection');this.yearFrom=document.getElementById('catalogueYearFrom');this.yearTo=document.getElementById('catalogueYearTo');this.neonOn=document.getElementById('neonOn');this.neonCategory=document.getElementById('neonCategory');this.neonBrand=document.getElementById('neonBrand');this.neonStation=document.getElementById('neonStation');this.neonTape=document.getElementById('neonTape');
  let saved={};try{saved=JSON.parse(localStorage.getItem('mosh-retrotv')||'{}')}catch{}
  this.source.value=saved.source||'mixed';this.era.value=saved.era||'all';this.source.onchange=this.era.onchange=()=>{this.save();this.configure();};this.enabled=saved.enabled??true;this.toggle.checked=this.enabled;this.decade.value=saved.decade||'all';CatalogueSelection.writeCategories(this.category,CatalogueSelection.normalize(saved).categories);this.savedCollection=saved.collection||'all';this.yearFrom.value=saved.yearFrom??'';this.yearTo.value=saved.yearTo??'';this.mix.value=saved.mix??35;
  this.neonSaved=CatalogueSelection.normalize(saved);this.neonOn.checked=this.neonSaved.neonEnabled;for(const el of [this.neonOn,this.neonCategory,this.neonBrand,this.neonStation,this.neonTape])el.onchange=e=>{if(el===this.neonCategory)CatalogueSelection.changeCategories(el,e.target);this.save();this.configure();};
  this.toggle.onchange=()=>{this.enabled=this.toggle.checked;this.save();this.configure();};
  this.decade.onchange=this.category.onchange=this.yearFrom.onchange=this.yearTo.onchange=e=>{if(e.currentTarget===this.category)CatalogueSelection.changeCategories(this.category,e.target);this.save();this.configure();};this.collection.onchange=()=>{this.savedCollection=this.collection.value;this.save();this.fill();};
  this.mix.oninput=()=>{document.getElementById('retroMixValue').textContent=this.mix.value+'%';this.save();};this.mix.oninput();
  this.configure();this.timer=setInterval(()=>{this.fill();this.collect();},2500);
 }
 ask(type,args={}){return new Promise((resolve,reject)=>{const requestId=++this.serial,timer=setTimeout(()=>{this.requests.delete(requestId);reject(Error('YouTube request timed out'));},45000);this.requests.set(requestId,{resolve,reject,timer});this.worker.postMessage({type,requestId,...args});});}
 selection(){return this.currentSelection||=CatalogueSelection.normalize({source:this.source.value,era:this.era.value,enabled:this.enabled,decade:this.decade.value,categories:CatalogueSelection.readCategories(this.category),mix:+this.mix.value,yearFrom:this.yearFrom.value,yearTo:this.yearTo.value,collection:this.collection.value,neonEnabled:this.neonOn.checked,neonCategories:this.neonFacetsReady?CatalogueSelection.readCategories(this.neonCategory):this.neonSaved.neonCategories,neonBrand:this.neonFacetsReady?this.neonBrand.value:this.neonSaved.neonBrand,neonStation:this.neonFacetsReady?this.neonStation.value:this.neonSaved.neonStation,neonTape:this.neonFacetsReady?this.neonTape.value:this.neonSaved.neonTape});}
 save(){this.currentSelection=null;try{localStorage.setItem('mosh-retrotv',JSON.stringify({...this.selection(),collection:this.savedCollection||this.collection.value}));}catch{}dispatchEvent(new CustomEvent('mosh-catalogue-selection',{detail:this.selection()}));}
 async configure(){const generation=++this.generation;this.ready=[];this.exhausted=false;this.configuring=true;
  try{const info=await this.ask('configure',{options:this.selection()});if(generation!==this.generation)return;this.info=info;this.setNeonFacets(info.neon);this.lastError=null;}catch(e){if(generation===this.generation)this.lastError=e.message;}finally{if(generation===this.generation){this.configuring=false;this.status();this.fill();}}}
 setNeonFacets(info){if(!info||this.neonFacetsReady)return;this.neonFacetsReady=true;
  for(const [el,key,saved]of [[this.neonBrand,'brands','neonBrand'],[this.neonStation,'stations','neonStation'],[this.neonTape,'tapes','neonTape']]){for(const value of info.facets[key])el.add(new Option(value,value));el.value=this.neonSaved[saved];if(!el.value)el.value='all';}
  for(const value of info.facets.categories){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.value=value;label.append(input,document.createTextNode(' '+value));this.neonCategory.append(label);}
  CatalogueSelection.writeCategories(this.neonCategory,this.neonSaved.neonCategories);this.currentSelection=null;
  document.getElementById('neonStatus').textContent=info.total.toLocaleString()+' YouTube films · '+info.spots.toLocaleString()+' catalogue entries · '+info.withoutYouTube.toLocaleString()+' entries have no YouTube link.';
  dispatchEvent(new CustomEvent('mosh-catalogue-selection',{detail:this.selection()}));
 }
 status(){if(typeof UI!=='undefined'&&Show.phase==='boot')UI.phase();if(!this.label)return;const count=this.info?.selected?.toLocaleString();this.label.textContent=!this.enabled||this.source.value==='mia'?'YouTube catalogues off':this.direct.bridgeError?this.direct.bridgeError:this.direct.retryDelay?'YouTube temporarily refused multiple films · automatic retry '+new Date(Date.now()+this.direct.retryDelay).toLocaleTimeString():this.lastError&&this.ready.length===0?this.lastError:this.direct.blocked?this.direct.blocked.error+' · playback resumes at '+new Date(this.direct.blocked.retryAt).toLocaleTimeString():!this.info?'Loading YouTube catalogues…':`${count} videos in selection · ${this.direct.sessions.size} browser players · ${this.loaded} opened${this.failed?' · '+this.failed+' unavailable':''}`;}
 fill(){
  // All callers in a render turn share one refill, after their assignments settle.
  if(this.fillScheduled)return;this.fillScheduled=true;
  queueMicrotask(()=>{this.fillScheduled=false;void this.refill();});
 }
 async refill(){
  if(!this.enabled||this.source.value==='mia'||this.configuring||!this.info||this.takeTask||this.exhausted)return;
  const count=Math.max(Number(this.requested),this.demand())-this.ready.length;
  if(count<=0)return;
  const generation=this.generation,task=this.ask('take',{count});this.takeTask=task;
  try{
   const next=await task;if(generation!==this.generation)return;
   // take already returns complete catalogue records. No second resolve RPC,
   // artificial worker lanes, or refill delay is needed for local metadata.
   this.ready.push(...next.items);this.exhausted=!next.remaining;this.requested=false;this.lastError=null;
  }catch(e){if(generation===this.generation)this.lastError='Catalogue: '+e.message;}
  finally{if(this.takeTask===task)this.takeTask=null;this.status();if(generation!==this.generation)this.fill();}
 }
 async publish(film){if(film.captions?.length){if(typeof RetroCaptionCache!=='undefined')await RetroCaptionCache.put(film.id,{title:film.title,duration:film.duration,words:film.captions,complete:true,language:film.captionLanguage});await this.voices.ask('live-transcript',{id:film.id,title:film.title,duration:film.duration,start:0,end:film.duration,words:film.captions,complete:true,source:'youtube-captions',language:film.captionLanguage});}}
 add(film){let clip=this.records.get(film.id);if(clip)return clip;clip=this.archive.addVideo(film.page,[film.title,film.year||''].filter(Boolean).join(' · '),{id:film.id,retro:film,deferMedia:true,catalog:true,fullPlayback:true,silent:true});this.records.set(film.id,clip);void YouTubeNative.poster(clip).then(image=>{if(image&&this.records.get(film.id)===clip&&!(clip.player?.readyState>=2&&!clip.player.nativeOnly)&&!this.previews.animated(clip))this.archive.thumb(clip,image);});this.loaded++;this.archive.onChange();this.status();return clip;}
 take(){if(!this.enabled)return null;while(this.ready.length){const film=this.ready.shift();if(this.records.has(film.id))continue;this.fill();return this.add(film);}this.requested=true;this.fill();return null;}
 wantsNext(percent=Math.random()*100){return this.enabled&&this.source.value!=='mia'&&(['retro','neon'].includes(this.source.value)||percent<+this.mix.value);}
 accepts(clip){return CatalogueSelection.accepts(clip.retro?clip.id:(clip.mia?.id||clip.id),clip.retro||clip.mia,this.selection());}
 needsRefresh(){return false;}
 async ensure(){}
 start(clip){const canvas=this.direct.create(clip);clip.player=canvas;clip.loading=true;clip.mediaUsed=performance.now();return canvas;}
 async open(id){id=String(id).replace(/^yt:/,'');let clip=this.records.get('yt:'+id);if(clip){await this.ensure(clip);return clip;}const film=await this.ask('resolve',{id});await this.publish(film);return this.add(film);}
 collect(){if(this.records.size<=256)return;for(const [id,clip]of this.records){if(this.records.size<=256)break;if(clip.player||clip.probing||clip.sourcePromise||this.retained(clip))continue;this.archive.remove(clip);this.records.delete(id);}}
};
