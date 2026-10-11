// Runs in the inference worker. Keep runtime bytes as well as weights between
// visits; HTTP caching alone is not dependable on privately certified hosts.
export class DreamAssets {
  constructor(progress,{legacyOrigins=[]}={}){this.progress=progress;this.legacyOrigins=legacyOrigins;this.caches=new Map();this.writes=new Set();this.reads=[];this.warnings=[];}
  async cache(name){
    if(!this.caches.has(name))this.caches.set(name,globalThis.caches?.open(name).catch(e=>{this.warnings.push(e.message);return null;})||Promise.resolve(null));
    return this.caches.get(name);
  }
  async read(url,label,cacheName='dream-models-v1'){
    // Only one persistence write may retain a response body. Overlap that write
    // with compilation, never accumulate the entire model in pending writes.
    if(this.writes.size){this.progress('Finishing local model cache write');await Promise.all(this.writes);}
    const started=performance.now(),cache=cacheName?await this.cache(cacheName):null;
    let response;
    try{
      response=await cache?.match(url);
      // Model URLs include their checksum. Reuse the same verified release
      // across delivery origins, including the first build's double slash.
      if(!response&&cache&&new URL(url).pathname.includes('/turbo-models/')){
        const current=new URL(url),origins=[current.origin,...this.legacyOrigins];
        for(const origin of origins){
          const old=new URL(current.pathname+current.search,origin).href;
          for(const candidate of [old,old.replace('/turbo-models/','/turbo-models//')]){
            if(candidate!==url)response=await cache.match(candidate);
            if(response)break;
          }
          if(response)break;
        }
      }
    }catch(e){this.warnings.push(e.message);}
    const cached=!!response;
    if(!response){
      try{response=await fetch(url);}catch(cause){throw new Error(`${label}: could not fetch ${url}`,{cause});}
      if(!response.ok)throw Error(`${label}: HTTP ${response.status} (${url})`);
    }
    // Consume the inference branch immediately; persistence must not hold up
    // model initialization while another copy is written to disk.
    if(!cached&&cache){
      const write=cache.put(url,response.clone()).catch(e=>{this.warnings.push(`${label}: ${e.message}`);}).finally(()=>this.writes.delete(write));
      this.writes.add(write);
    }
    const total=Number(response.headers.get('content-length'))||0;
    let received=0,lastLabel,lastReport=-Infinity;
    const report=(force=false)=>{
      // Byte counters need at most one update a second in the human-readable UI.
      if(!force&&performance.now()-lastReport<1000)return;
      const mb=n=>(n/1048576).toFixed(1);
      const text=`${cached?'Reading cached':'Downloading'} ${label} · ${mb(received)}${total?' / '+mb(total):''} MB`;
      if(text!==lastLabel){lastLabel=text;lastReport=performance.now();this.progress(text);}
    };
    report();
    let bytes;
    if(response.body){
      const stream=response.body.pipeThrough(new TransformStream({transform(chunk,controller){received+=chunk.byteLength;report();controller.enqueue(chunk);}}));
      bytes=await new Response(stream).arrayBuffer();
    }else{bytes=await response.arrayBuffer();received=bytes.byteLength;report();}
    report(true);
    this.reads.push({label,cached,bytes:bytes.byteLength,ms:performance.now()-started});
    return bytes;
  }
  async json(url,label,cacheName=null){
    const bytes=await this.read(url,label,cacheName);
    try{return JSON.parse(new TextDecoder().decode(bytes));}
    catch(cause){throw new Error(`${label}: invalid JSON (${url})`,{cause});}
  }
}
