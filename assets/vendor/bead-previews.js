/* Collected animations need neither YouTube players nor the optional bridge.
   Decode once off-thread at the bead atlas resolution; reuse the frame atlas. */
window.BeadPreviews=class BeadPreviews {
 constructor({archive,width,height,maxTextureSize}){
  Object.assign(this,{archive,width,height,maxTextureSize,entries:new Map(),prepared:new Set(),visible:new Set(),serial:0});
  this.samples=new Map();
  this.worker=new Worker('https://epivalent.github.io/mosh-canopy/assets/vendor/bead-preview-worker.js?v=3');
  this.worker.onmessage=({data:d})=>{
   if(d.type==='samples'){
    const request=this.samples.get(d.token);
    if(!request){for(const f of d.frames||[])f.bitmap.close();return;}
    request.finish(d.error?Error(d.error):null,d);return;
   }
   const s=this.entries.get(d.id);if(!s||s.token!==d.token){d.bitmap?.close();return;}
   if(d.type==='metadata'){
    s.status=d.status;if(d.title){s.clip.name=d.title;s.clip.retro.title=d.title;}if(d.duration){s.clip.duration||=d.duration;s.clip.retro.duration=d.duration;}
   }else if(d.type==='atlas'){Object.assign(s,d);s.lastFrame=-1;}
   else if(d.type==='error'){s.error=d.error;s.status='error';}
  };
  this.worker.addEventListener('error',e=>{for(const request of this.samples.values())request.finish(Error(e.message||'Preview worker failed'));});
  this.worker.addEventListener('messageerror',()=>{for(const request of this.samples.values())request.finish(Error('Preview samples could not be transferred'));});
 }
 sample(clip,{count,signal}={}){
  if(!Number.isInteger(count)||count<1)return Promise.reject(Error('Specify the segmentation sample count'));
  if(signal?.aborted)return Promise.reject(new DOMException('Preview sampling cancelled','AbortError'));
  const token=++this.serial;
  return new Promise((resolve,reject)=>{
   const abort=()=>{this.worker.postMessage({type:'cancelSamples',token});finish(new DOMException('Preview sampling cancelled','AbortError'));};
   const finish=(error,data)=>{this.samples.delete(token);signal?.removeEventListener('abort',abort);error?reject(error):resolve(data);};
   this.samples.set(token,{finish});signal?.addEventListener('abort',abort,{once:true});
   try{this.worker.postMessage({type:'samples',token,count,url:'https://mosh-canopy-assets.moshcanopy.workers.dev/assets/retrotv/previews/films/'+encodeURIComponent(clip.retro.youtubeId)+'.json',poster:'https://i.ytimg.com/vi/'+encodeURIComponent(clip.retro.youtubeId)+'/hqdefault.jpg'});}catch(e){finish(e);}
  });
 }
 ensure(clip){
  if(!clip?.retro)return;let s=this.entries.get(clip.id);if(s)return s;
  s={id:clip.id,clip,token:++this.serial,status:'loading',lastFrame:-1};this.entries.set(clip.id,s);
  this.worker.postMessage({type:'load',id:clip.id,token:s.token,url:'https://mosh-canopy-assets.moshcanopy.workers.dev/assets/retrotv/previews/films/'+encodeURIComponent(clip.retro.youtubeId)+'.json',width:this.width,height:this.height,maxTextureSize:this.maxTextureSize});return s;
 }
 prefetch(clips){this.prepared=new Set(clips.filter(c=>c.retro));for(const c of this.prepared)this.ensure(c);this.reap();}
 update(clips){
  const now=performance.now(),visible=new Set([...clips].filter(c=>c.retro));
  for(const c of this.visible)if(!visible.has(c)){const s=this.entries.get(c.id);if(s?.clock){s.clock.time=this.time(c);s.clock.at=now;s.clock.running=false;}}
  this.visible=visible;
  for(const c of this.visible){const s=this.ensure(c);
   // Preview reels have no source timestamps. This is a continuous transcript
   // browsing clock, distinct from real player time and never used by viewer CCs.
   if(!s.clock)s.clock=c.beadClock||={time:c.videoPlayhead||0,at:now,running:false};
   if(!s.clock.running){s.clock.at=now;s.clock.running=true;}
   if(c.player?.readyState>=2){s.clock.time=c.player.currentTime;s.clock.at=now;}
   if(c.player?.readyState>=2&&!c.player.nativeOnly){s.lastFrame=-1;continue;}
   if(!s.bitmap)continue;
   const seconds=(now-s.clock.at)/1000+s.clock.time,t=((seconds%s.duration)+s.duration)%s.duration;
   let lo=0,hi=s.ends.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(t>=s.ends[mid])lo=mid+1;else hi=mid;}
   if(s.lastFrame===lo&&s.lastSlot===c.slot&&c.hasSnapshot)continue;
   this.archive.thumb(c,s.bitmap,false,{x:lo%s.columns*this.width,y:Math.floor(lo/s.columns)*this.height,width:this.width,height:this.height});
   s.lastFrame=lo;s.lastSlot=c.slot;s.draws=(s.draws||0)+1;
  }
  this.reap();
 }
 time(clip){const s=this.entries.get(clip?.id);if(!s?.clock)return clip?.videoPlayhead||0;const t=s.clock.time+(s.clock.running?(performance.now()-s.clock.at)/1000:0),d=clip.duration;return d>0?t%d:t;}
 active(clip){return this.visible.has(clip)&&!!this.entries.get(clip.id)?.clock;}
 ready(clip){return !!this.entries.get(clip?.id)?.bitmap;}
 animated(clip){return this.active(clip)&&this.ready(clip);}
 reap(){for(const [id,s]of this.entries)if(!this.visible.has(s.clip)&&!this.prepared.has(s.clip)){
   if(s.clock){s.clock.time=this.time(s.clip);s.clock.at=performance.now();}
   this.worker.postMessage({type:'dispose',id,token:s.token});s.bitmap?.close();this.entries.delete(id);
  }}
 get stats(){const a=[...this.entries.values()];return {retained:a.length,visible:this.visible.size,animated:a.filter(s=>s.bitmap&&this.visible.has(s.clip)).length,loading:a.filter(s=>s.status==='loading'||s.status==='ready'&&!s.bitmap).length,missing:a.filter(s=>s.status==='no-preview'||s.status==='pending').length,errors:a.filter(s=>s.error).map(s=>({id:s.id,error:s.error})),bytes:a.reduce((n,s)=>n+(s.gpuBytes||0),0),draws:a.reduce((n,s)=>n+(s.draws||0),0)};}
};
