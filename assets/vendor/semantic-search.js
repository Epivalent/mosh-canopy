/* Optional meaning search. Worker owns model inference, retrieval and context. */
globalThis.SemanticSearch=class {
 constructor(concordance){
  this.c=concordance;this.serial=0;this.hits=[];this.pending=new Map();this.host=document.getElementById('semanticResults');this.panel=document.getElementById('semanticPanel');this.input=document.getElementById('semanticQuery');this.counter=document.getElementById('semanticCount');this.useSelection=document.getElementById('semanticUseSelection');this.refine=document.getElementById('semanticRefine');
  this.previews=new SemanticResultPreviews(this.panel);
  const length=document.getElementById('semanticExcerptLength');
  try{const saved=localStorage.getItem('mosh-theme-excerpt');if(['brief','medium','full'].includes(saved))length.value=saved}catch{}
  this.host.dataset.length=length.value;
  length.onchange=()=>{this.host.dataset.length=length.value;try{localStorage.setItem('mosh-theme-excerpt',length.value)}catch{}};
  document.getElementById('semanticForm').onsubmit=e=>{e.preventDefault();this.search(this.input.value)};
  document.getElementById('semanticClose').onclick=()=>{this.hide();if(this.c.active)this.c.showSearch()};
  this.useSelection.onchange=()=>{this.syncFilters();if(this.input.value.trim())this.search(this.input.value)};
  addEventListener('mosh-catalogue-selection',()=>{if(!this.panel.hidden){this.syncFilters();if(this.useSelection.checked&&this.input.value.trim())this.search(this.input.value)}});
  document.getElementById('semanticRelease').onclick=()=>this.release();
  this.refine.onchange=()=>{if(this.input.value.trim())this.search(this.input.value)};
  // Do not replace an early result while someone is reading or clicking it.
  const apply=()=>{if(this.deferred&&!this.host.matches(':hover')&&!this.host.contains(document.activeElement)){const r=this.deferred;this.deferred=null;this.hits=r.results;this.last=r;this.render()}};
  this.host.addEventListener('pointerleave',apply);this.host.addEventListener('focusout',()=>queueMicrotask(apply));
 }
 toggle(){if(this.panel.hidden)this.show();else this.hide()}
 show(){this.panel.hidden=false;document.getElementById("bThemes").setAttribute("aria-expanded","true");this.previews.resume();this.c.hidePanel();this.syncFilters();this.updateCoverage();document.getElementById('mixPanel').hidden=true;document.getElementById('bMix').setAttribute('aria-expanded','false');this.input.focus();if(!this.prepared)this.prepare()}
 hide(){this.panel.hidden=true;document.getElementById("bThemes").setAttribute("aria-expanded","false");this.previews.suspend()}
 syncFilters(){this.catalogueFilters??=new CatalogueFilterControls(document.getElementById('semanticFilterFields'),()=>this.useSelection.checked);this.catalogueFilters.sync()}
 updateCoverage(){const m=this.info;document.getElementById('semanticCoverage').textContent=m?`Meaning index: ${m.films.toLocaleString()} films · ${m.passages.toLocaleString()} passages. Captioned coverage: ${Object.entries(m.target).map(([source,c])=>`${source} ${c.captioned.toLocaleString()} / ${c.catalogue.toLocaleString()}`).join(' · ')}. Snapshot ${new Date(m.createdAt*1000).toLocaleDateString()}; newly arriving captions remain available in Words.`:'Searches a prepared caption index. Coverage appears when loaded.'}
 ensure(){if(this.worker)return;const w=this.worker=new Worker('https://epivalent.github.io/mosh-canopy/assets/semantic/search-worker.mjs?v=pages2',{type:'module'});w.onmessage=({data:m})=>{
  if(w!==this.worker)return;
  if(m.type==='ready'){this.info=m.info;this.updateCoverage();if(!this.panel.hidden)this.counter.textContent='Index loaded · warming search models…';return}
  if(m.type==='prepared'){this.prepared=true;if(!this.panel.hidden&&!this.pending.size)this.counter.textContent='Meaning search ready';return}
  if(m.type==='status'){if(!this.panel.hidden)this.counter.textContent=m.message;return}
  if(m.type==='preview'){if(m.id===this.searchId&&this.pending.has(m.id)){this.hits=m.results;this.last=m;this.render();this.counter.textContent='Related passages ready · refining relevance…'}return}
  if(m.type==='progress'){if(m.id===this.searchId&&this.pending.has(m.id))this.counter.textContent=m.message;return}
  if(m.type==='fatal'){this.fail(new Error(m.message));return}
  const p=this.pending.get(m.id);if(!p)return;this.pending.delete(m.id);if(m.type==='error'||m.type==='superseded')p.reject(new Error(m.message||'Search superseded'));else p.resolve(m);
 };w.onerror=e=>this.fail(new Error(e.message||'Meaning search worker failed'));}
 prepare(){this.ensure();this.worker.postMessage({type:'prepare',refine:this.refine.checked})}
 ask(data){this.ensure();const id=++this.serial;return new Promise((resolve,reject)=>{this.pending.set(id,{resolve,reject});this.worker.postMessage({...data,id})})}
 filters(){if(!this.useSelection.checked)return {};const s=CatalogueSelection.normalize(this.c.selection()),sources=[];if(CatalogueSelection.usesMIA(s))sources.push('MIA');if(CatalogueSelection.usesYouTube(s)){if(s.source!=='neon')sources.push('MRT');if(s.source==='neon'||s.source!=='retro'&&s.neonEnabled)sources.push('Neon')}
  const val=x=>x==='all'?'':x;return {sources,from:s.yearFrom,to:s.yearTo,mia:{era:val(s.era),collection:val(s.collection)},mrt:{decade:val(s.decade),categories:s.categories},neon:{categories:s.neonCategories,brand:val(s.neonBrand),station:val(s.neonStation),tape:val(s.neonTape)}};
 }
 async search(query){query=query.trim();if(!query)return;this.cancel();const token=++this.serial;this.token=token;this.show();this.input.value=query;this.input.blur();this.counter.textContent='Searching transcript meaning…';this.previews.clear();this.host.replaceChildren();this.hits=[];this.last=null;
  try{this.searchId=this.serial+1;const r=await this.ask({type:'search',query,filters:this.filters(),refine:this.refine.checked});if(token!==this.token)return;if(this.last?.provisional&&(this.host.matches(':hover')||this.host.contains(document.activeElement))){this.deferred=r;this.counter.textContent='Refined results ready · keeping these passages steady while you read';return}this.hits=r.results;this.last=r;this.render();}
  catch(e){if(token===this.token&&!/superseded/i.test(e.message))this.showError(e)}
 }
 async more(){if(this.loadingMore)return;this.loadingMore=true;const token=this.token;try{const r=await this.ask({type:'page',searchId:this.searchId,offset:this.hits.length});if(token!==this.token)return;this.hits.push(...r.results);this.last=r;this.render()}catch(e){if(token===this.token){this.render();this.showError(e)}}finally{this.loadingMore=false}}
 render(){const r=this.last;this.previews.clear();this.host.replaceChildren();this.counter.textContent=`${this.hits.length} films shown · ${r.matchingFilms.toLocaleString()} captioned films in scope`;
  const note=document.createElement('p');note.className='note';note.textContent=r.provisional?'Initial semantic matches; relevance is being refined. You can open a film now.':'Related passages, not verified answers. Films without indexed captions are not included.';this.host.append(note);
  if(!this.hits.length){note.textContent='No indexed passages match these catalogue filters.';return}
  const browse=document.createElement('button');browse.className='tape';browse.textContent='Browse these transcripts';browse.onclick=()=>this.c.openPassages(this.hits.map(h=>h.passage),this.input.value);this.host.append(browse);
  for(const h of this.hits){
   const p=h.passage,card=document.createElement('article'),body=document.createElement('div'),title=document.createElement('button'),meta=document.createElement('p'),excerpt=document.createElement('p'),actions=document.createElement('div'),expand=document.createElement('button'),tx=document.createElement('button');
   card.className='semanticHit';body.className='semanticBody';title.className='semanticTitle';title.textContent=p.title;title.title=p.title;title.onclick=()=>this.play(p);
   meta.className='note';meta.textContent=Object.keys(p.memberships).join(' / ')+' · '+this.time(p.start);excerpt.className='semanticExcerpt';excerpt.textContent=p.text;
   actions.className='semanticActions';expand.className='semanticExpand';expand.textContent='More text';expand.setAttribute('aria-expanded','false');expand.onclick=()=>{const open=card.classList.toggle('expanded');expand.textContent=open?'Less text':'More text';expand.setAttribute('aria-expanded',String(open))};
   tx.textContent='Read transcript';tx.onclick=()=>this.c.openPassages([p],this.input.value);actions.append(expand,tx);body.append(title,meta,excerpt,actions);
   card.append(this.previews.create(p,()=>this.play(p)),body);this.host.append(card);
  }
  if(r.hasMore){const more=document.createElement('button');more.className='tape';more.textContent='More related films';more.onclick=()=>{more.disabled=true;more.textContent='Finding more…';this.more()};this.host.append(more)}
 }
 time(t){return Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0')}
 async play(p){this.hide();this.c.close();try{await this.c.jump(p.id,p.start)}catch(e){this.c.notify(e.message)}}
 showError(e){this.counter.textContent='Meaning search: '+e.message;this.c.notify(e.message)}
 cancel(){this.token=++this.serial;this.deferred=null;this.loadingMore=false;this.worker?.postMessage({type:'cancel'});for(const p of this.pending.values())p.reject(new Error('Search superseded'));this.pending.clear()}
 fail(e){this.cancel();this.worker?.terminate();this.worker=null;this.info=null;this.showError(e)}
 release(){this.cancel();this.worker?.terminate();this.worker=null;this.info=null;this.prepared=false;this.hits=[];this.previews.clear();this.host.replaceChildren();this.updateCoverage();this.counter.textContent='Meaning-search models released. Submit a question to load them again.'}
};

/* Native image previews only: no extra media players or main-thread frame loop.
   IntersectionObserver bounds both requests and animation to visible cards. */
class SemanticResultPreviews {
 constructor(panel){this.panel=panel;this.entries=new Map();this.observer=new IntersectionObserver(changes=>{for(const {target,isIntersecting}of changes){const e=this.entries.get(target);if(!e)continue;if(isIntersecting&&!this.panel.hidden)this.start(e);else this.stop(e)}},{root:panel})}
 create(p,play){
  const button=document.createElement('button'),img=document.createElement('img'),label=document.createElement('span');button.className='semanticPreview';button.type='button';button.setAttribute('aria-label','View '+p.title+' at '+Math.floor(p.start)+' seconds');button.onclick=play;button.title=p.id.startsWith('yt:')?'Film preview; click to play at the matching passage':'Shot preview; click to play at the matching passage';
  img.alt='';img.decoding='async';label.textContent='Film preview';button.append(label,img);
  const e={p,button,img,label,controller:null,urls:null};
  img.onload=()=>{if(e.controller)img.classList.add('loaded')};
  img.onerror=()=>{if(!e.controller)return;if(e.poster&&img.getAttribute('src')!==e.poster){if(e.urls)e.urls.animation=null;img.src=e.poster;img.dataset.kind='still'}else{img.classList.remove('loaded');img.removeAttribute('src');label.textContent='Preview unavailable'}};
  this.entries.set(button,e);if(!this.panel.hidden)this.observer.observe(button);return button;
 }
 async start(e){
  if(e.controller)return;const controller=e.controller=new AbortController(),signal=controller.signal;
  const current=()=>e.controller===controller&&!signal.aborted&&!this.panel.hidden;
  const apply=()=>{if(!current())return;const url=e.urls?.animation||e.urls?.poster||e.poster;if(url){e.img.dataset.kind=e.urls?.animation?'animation':'still';e.img.src=url}else e.label.textContent='Preview unavailable'};
  if(e.urls){apply();return}
  const yt=e.p.id.startsWith('yt:');
  if(yt){e.poster='https://i.ytimg.com/vi/'+encodeURIComponent(e.p.id.slice(3))+'/hqdefault.jpg';apply()}
  try{
   if(yt){const r=await fetch('https://mosh-canopy-assets.moshcanopy.workers.dev/assets/retrotv/previews/films/'+encodeURIComponent(e.p.id.slice(3))+'.json',{signal});const meta=r.ok?await r.json():null;e.urls={poster:e.poster,animation:meta?.status==='ready'?meta.preview?.url:null}}
   else{const r=await fetch('https://mosh-canopy-assets.moshcanopy.workers.dev/assets/film-shots/'+encodeURIComponent(e.p.id)+'.json',{signal});const shots=r.ok?await r.json():[];const shot=shots.find(s=>s.start<=e.p.start&&s.end>e.p.start)||shots[0];
    e.poster=shot?.mp4?.replace('/clips/','/thumbnails/').replace(/\.mp4(?=\?|$)/,'.jpg');e.urls={poster:e.poster};
   }
   apply();
  }catch(error){if(current()){e.urls={poster:e.poster};apply()}}
 }
 stop(e){e.controller?.abort();e.controller=null;e.img.classList.remove('loaded');e.img.removeAttribute('src')}
 suspend(){this.observer.disconnect();for(const e of this.entries.values())this.stop(e)}
 resume(){for(const e of this.entries.values())this.observer.observe(e.button)}
 clear(){this.suspend();this.entries.clear()}
}
