/* Small manifest + independently cached, compressed film transcripts.
   Playback never waits for restoration/indexing of the whole concordance. */
self.TranscriptStore=class TranscriptStore {
 constructor({retroIndex}={}){this.retroIndex=retroIndex??(typeof RetroCaptionIndex!=='undefined'?new RetroCaptionIndex():null);this.cache=new Map();this.pending=new Map();this.queue=[];this.running=0;this.owners=new Map();this.wanted=new Set();this.metadata=null;this.index=this.refresh();}
 // Retain exactly the transcripts owned by playback, ribbons and preparation.
 // An LRU smaller than the visible neighbourhood repeatedly evicted the very
 // films the next prefetch would request. IndexedDB/HTTP remain the cold cache.
 retain(owner,ids){
  this.owners.set(owner,new Set(ids));this.wanted=new Set([...this.owners.values()].flatMap(ids=>[...ids]));
  for(const id of this.cache.keys())if(!this.wanted.has(id))this.cache.delete(id);
  this.queue=this.queue.filter(job=>{
   if(job.priority==='high'||this.wanted.has(job.id))return true;
   if(this.pending.get(job.id)===job)this.pending.delete(job.id);
   job.resolve(undefined);return false;
  });
 }
 invalidate(id){this.cache.delete(id);this.pending.delete(id);}
 refresh(){
  if(this.refreshing)return this.refreshing;
  const task=(async()=>{const r=await fetch(new URL('https://pub-fd77318b30094f8a923cae6a232a72fa.r2.dev/assets/transcripts/index.json',self.location.origin),{cache:'no-cache'});if(!r.ok)throw Error('Transcript manifest: HTTP '+r.status);return this.metadata=await r.json();})();
  this.index=this.refreshing=task;
  const done=()=>{if(this.refreshing===task)this.refreshing=null;};task.then(done,done);return task;
 }
 async available(){
  // A failed startup request is not a permanent verdict on this session.
  // Reuse a valid snapshot, or retry once on the next actual transcript read.
  try{return await this.index;}catch(error){return this.metadata||this.refresh();}
 }
 async read(file,priority='low'){
  const r=await fetch(new URL('https://pub-fd77318b30094f8a923cae6a232a72fa.r2.dev/assets/transcripts/'+file,self.location.origin),{cache:'force-cache',priority});if(!r.ok)throw Error('Transcript: HTTP '+r.status);
  return new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).json();
 }
 expand(f){if(f?.words?.length&&Array.isArray(f.words[0]))f.words=f.words.map(([start,end,text])=>({start,end,text}));return f;}
 async load(id,priority='high'){
  if(this.cache.has(id))return this.cache.get(id);
  if(this.pending.has(id)){const job=this.pending.get(id);if(priority==='high')job.priority='high';return job.promise;}
  const job={id,priority};job.promise=new Promise((resolve,reject)=>Object.assign(job,{resolve,reject}));this.pending.set(id,job);this.queue.push(job);this.pump();return job.promise;
 }
 async readFilm(job){
  if(job.id.startsWith('yt:')&&this.retroIndex)return this.retroIndex.film(job.id);
  const index=await this.available(),meta=index.films[job.id];
  return meta?.file?this.read(meta.file,job.priority):meta?{...meta,words:[]}:undefined;
 }
 pump(){while(this.running<8&&this.queue.length){this.queue.sort((a,b)=>Number(b.priority==='high')-Number(a.priority==='high'));const job=this.queue.shift();this.running++;
  this.readFilm(job).then(film=>{this.expand(film);if(this.pending.get(job.id)===job&&this.wanted.has(job.id))this.cache.set(job.id,film);job.resolve(film);},job.reject).finally(()=>{if(this.pending.get(job.id)===job)this.pending.delete(job.id);this.running--;this.pump();});
 }}
 async corpus(){const index=await this.available(),data=await this.read(index.corpus.file);for(const film of Object.values(data.films))this.expand(film);return data;}
};
