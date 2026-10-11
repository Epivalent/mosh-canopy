/* Shared, immutable caption files and byte-sharded term postings. */
globalThis.RetroPublishedCaptions=class RetroPublishedCaptions{
 constructor(root='https://mosh-canopy-assets.moshcanopy.workers.dev/assets/retrotv/captions/'){this.root=new URL(root,location.origin);this.lexicons=new Map();this.ordinals=new Map();this.cache=new Map();this.pending=new Map();this.queryRevision=0;this.ready=this.load();}
 load(){
  // Coverage, searches and playback share the same refresh. Commit docs, states
  // and the index together so no reader sees mismatched publication revisions.
  if(this.loading)return this.loading;
  const task=(async()=>{
   const r=await fetch(new URL('index.json',this.root),{cache:'no-cache'});
   if(r.status===404){if(!this.index){this.docs={};this.states={};this.index=null;}return this.index;}
   if(!r.ok)throw Error('Published captions HTTP '+r.status);
   const index=await r.json();if(this.index?.revision===index.revision)return this.index;
   const [docs,states]=await Promise.all([this.read(index.docs),this.read(index.states)]);
   this.ordinals.clear();this.docs=docs;this.states=states;this.index=index;const dictionaries=new Set([...Object.values(index.termPacks||{}),...Object.values(index.ordinalPacks||{})].map(p=>p.dictionary));for(const key of this.lexicons.keys())if(!dictionaries.has(key))this.lexicons.delete(key);
   const files=new Set(Object.values(index.shards));for(const file of this.cache.keys())if(!files.has(file))this.cache.delete(file);
   return index;
  })();
  this.loading=task;this.ready=task;
  task.then(()=>{if(this.loading===task)this.loading=null;},()=>{if(this.loading===task)this.loading=null;});return task;
 }
 async available(){
  // A failed first fetch must not leave every future read awaiting the same
  // rejected promise forever. Keep a valid older publication during outages.
  try{await this.ready;}catch(error){if(!this.index)await this.load();}
 }
 async read(file){const r=await fetch(new URL(file,this.root),{cache:'force-cache'});if(!r.ok)throw Error('Published caption data HTTP '+r.status);return new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).json();}
 async documents(){await this.available();return Object.values(this.docs||{});}
 async state(id){await this.available();return this.states?.[id];}
 async film(id){await this.available();const d=this.docs?.[id];if(!d)return;const f=await this.read(d.file);if(Array.isArray(f.words?.[0]))f.words=f.words.map(([start,end,text])=>({start,end,text}));return f;}
 async ordinalPostings(term){
  let task=this.ordinals.get(term);if(!task){task=(async()=>{
   const data=await this.termRecord(term,'ordinals');
   if(data){const {decodeOrdinals}=await import(new URL('https://epivalent.github.io/mosh-canopy/assets/vendor/montage/ordinal-postings.mjs',location.origin).href);return decodeOrdinals(data);}
   return new Map([...(await this.postings(term))].map(([id,ps])=>[id,Uint32Array.from(ps,p=>p[0])]));
  })();this.ordinals.set(term,task);task.catch(()=>this.ordinals.delete(term));}return task;
 }
 async query(word,mode='first',seed=0,accept=()=>true,deferTimes=false){
  const tokens=word.split(/\s+/u).map(s=>s.normalize('NFKC').toLowerCase().replace(/’/g,"'").replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,'')).filter(Boolean),term=tokens.join(' ');
  if(!tokens.length)return {term,results:[],occurrences:0};await this.retainTerms(tokens);
  if(tokens.length===1&&mode!=='random'){
   const records=await this.termRecord(tokens[0],'first');
   if(records){let occurrences=0;const results=[];for(const [id,index,start,matches]of records)if(accept(id)){occurrences+=matches;results.push({id,title:this.docs[id].title,index,start,matches,context:'',published:true});}return {term,mode,results,occurrences,indexedFilms:Object.keys(this.docs).length};}
  }
  const lists=await Promise.all(tokens.map(t=>deferTimes?this.ordinalPostings(t):this.postings(t)));let anchor=0;lists.forEach((l,i)=>{if(l.size<lists[anchor].size)anchor=i;});
  const results=[];let occurrences=0;
  for(const [id,positions]of lists[anchor]){
   if(!accept(id)||lists.some(l=>!l.has(id)))continue;
   if(tokens.length===1){let hash=seed|0;for(const ch of id)hash=Math.imul(hash^ch.charCodeAt(0),16777619);const hit=positions[mode==='random'?(hash>>>0)%positions.length:0],[index,start]=deferTimes?[hit,null]:hit;occurrences+=positions.length;results.push({id,title:this.docs[id].title,index,start,matches:positions.length,context:'',published:true});continue;}
   const times=deferTimes?null:new Map(lists[0].get(id));let hits;
   if(deferTimes){
    const arrays=lists.map(l=>l.get(id));
    const contains=(ps,wanted)=>{let lo=0,hi=ps.length;while(lo<hi){const mid=(lo+hi)>>>1;if(ps[mid]<wanted)lo=mid+1;else hi=mid;}return ps[lo]===wanted;};
    hits=Array.from(positions,p=>p-anchor).filter(p=>p>=0&&arrays.every((ps,i)=>i===anchor||contains(ps,p+i)));
   }else{const sets=lists.map(l=>new Set(l.get(id).map(p=>p[0])));hits=positions.map(p=>p[0]-anchor).filter(p=>tokens.every((_,i)=>sets[i].has(p+i)));}if(!hits.length)continue;
   let hash=seed|0;for(const ch of id)hash=Math.imul(hash^ch.charCodeAt(0),16777619);const index=hits[mode==='random'?(hash>>>0)%hits.length:0],doc=this.docs[id];
   occurrences+=hits.length;results.push({id,title:doc.title,index,start:times?.get(index)??null,matches:hits.length,context:'',published:true});
  }
  return {term,mode,results,occurrences,indexedFilms:Object.keys(this.docs).length};
 }
 async bucket(term){const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(term)));return digest[0].toString(16).padStart(2,'0');}
 async retainTerms(terms){
  const revision=++this.queryRevision;await this.available();for(const term of this.ordinals.keys())if(!terms.includes(term))this.ordinals.delete(term);const buckets=await Promise.all(terms.map(term=>this.bucket(term)));if(revision!==this.queryRevision)return;
  this.wanted=new Set(buckets.map(bucket=>this.index?.shards[bucket]).filter(Boolean));
  for(const file of this.cache.keys())if(!this.wanted.has(file))this.cache.delete(file);
 }
 async termRecord(term,kind){
  await this.available();const bucket=await this.bucket(term),pack=(kind==='ordinals'?this.index?.ordinalPacks?.[bucket]:null)||this.index?.termPacks?.[bucket];if(!pack)return null;
  let lex=this.lexicons.get(pack.dictionary);if(!lex){lex=this.read(pack.dictionary);this.lexicons.set(pack.dictionary,lex);lex.catch(()=>this.lexicons.delete(pack.dictionary));}
  const range=(await lex)[term]?.[kind];if(!range)return kind==='first'?[]:kind==='ordinals'?null:{};
  const [offset,length]=range,key=pack.file+':'+offset;
  let data=this.pending.get(key);if(!data){data=(async()=>{
   const response=await fetch(new URL(pack.file,this.root),{headers:{Range:`bytes=${offset}-${offset+length-1}`},cache:'force-cache'});
   if(!response.ok)throw Error('Search term HTTP '+response.status);
   // Caddy serves 206. A static host ignoring Range remains correct as well.
   const buffer=await response.arrayBuffer(),bytes=response.status===206?buffer:buffer.slice(offset,offset+length);
   const decoded=new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')));return kind==='ordinals'?decoded.arrayBuffer():decoded.json();
  })();this.pending.set(key,data);data.then(()=>this.pending.delete(key),()=>this.pending.delete(key));}return data;
 }
 async postings(term){
  await this.available();const record=await this.termRecord(term,'positions');if(record)return new Map(Object.entries(record));if(!this.index)return new Map();const file=this.index.shards[await this.bucket(term)];if(!file)return new Map();
  let data=this.cache.get(file)||this.pending.get(file);
  if(!data){data=this.read(file);this.pending.set(file,data);const release=()=>{if(this.pending.get(file)===data)this.pending.delete(file);};data.then(release,()=>{release();if(this.cache.get(file)===data)this.cache.delete(file);});}
  if(!this.wanted||this.wanted.has(file))this.cache.set(file,data);
  return new Map(Object.entries((await data)[term]||{}));
 }
};
