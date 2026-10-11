/* Independent GPU recognizers: the viewed film has its own lane. Each lane
   publishes small timed passages; decoding and inference stay in workers. */
window.LiveVoz=class LiveVoz{
 constructor({voices,candidates,source,view}){
  Object.assign(this,{voices,candidates,source,view,enabled:false,count:0,failures:new Map(),inflight:new Map(),jobs:new Map(),seq:0,lanes:[],parallelism:3,pcm:new Map(),capturing:new Map(),coverageCache:new Map(),coveragePending:new Set(),coverageRevision:0,scheduleRevision:0});
  this.label=document.getElementById('vozStatus');
  const toggle=document.getElementById('liveVoz');toggle.checked=false;toggle.onchange=e=>this.setEnabled(e.target.checked);
  const control=document.getElementById('vozParallel');if(control)control.oninput=()=>{this.parallelism=+control.value;document.getElementById('vozParallelValue').textContent=control.value;this.tick();};
  this.status();
 }
 setEnabled(enabled){
  this.enabled=enabled;this.scheduleRevision++;
  document.getElementById('liveVoz').checked=enabled;
  if(this.timer!=null){clearInterval(this.timer);this.timer=null;}
  if(enabled)this.timer=setInterval(()=>this.tick(),250);
  if(!enabled){
   for(const player of this.capturing.values())player.captureSpeech(false);
   this.capturing.clear();this.pcm.clear();this.failures.clear();
   // Explicitly disabling transcription releases its models, decoding workers
   // and pending requests. Re-enabling uses fresh lane objects so late replies
   // from cancelled jobs cannot clear or terminate a replacement job.
   const lanes=this.lanes;this.lanes=[];
   this.loaded=false;this.waitingAudio=0;this.suspendedAudio=0;this.audioError=null;
   for(const lane of lanes){if(lane.task)lane.task.cancelled=true;
    for(const [id,p]of this.inflight)if(p.worker===lane.worker||p.worker===lane.audio){this.inflight.delete(id);p.reject(Error('Live transcription disabled'));}
    lane.worker?.terminate();lane.audio?.terminate();
   }
   this.jobs.clear();
  }
  this.status();if(enabled)void this.tick();
 }
 invalidateCoverage(ids){let changed=false;for(const id of ids){if(this.coverageCache.delete(id)||this.coveragePending.has(id))changed=true;}if(changed)this.coverageRevision++;}
 async coverageFor(ids){
  const wanted=new Set(ids);for(const id of this.coverageCache.keys())if(!wanted.has(id))this.coverageCache.delete(id);
  const missing=ids.filter(id=>!this.coverageCache.has(id));
  if(missing.length){const revision=this.coverageRevision;this.coveragePending=new Set(missing);
   try{const result=await this.voices.ask('coverage',{ids:missing});if(revision!==this.coverageRevision)return null;
    for(const id of missing)this.coverageCache.set(id,result[id]||{complete:false,ranges:[]});
   }finally{this.coveragePending.clear();}
  }
  return Object.fromEntries(ids.map(id=>[id,this.coverageCache.get(id)]));
 }
 status(){const running=this.lanes.filter(l=>l.task),loading=this.lanes.filter(l=>l.loading&&!l.loaded);
  const awaiting=this.suspendedAudio?` · ${this.suspendedAudio} awaiting browser audio activation`:'';
  this.label.textContent=!this.enabled?'Live transcription off':this.voices.workerError?'Transcript worker failed · '+this.voices.workerError:!this.voices.workerReady?'Starting transcript worker…':running.length?`${loading.length?'Loading Voz · ':''}${running.length} films ${loading.length?'preparing':'transcribing'} · ${this.count} passages${running.some(l=>l.index===0)?' · viewing film prioritised':''}`:loading.length?'Loading Voz…':this.lastError||this.audioError|| (this.waitingAudio?`Listening to ${Math.max(0,this.waitingAudio-(this.suspendedAudio||0))} films · ${this.count} passages${awaiting}`:`Voz · ${this.count} passages · available speech covered`);
 }
 rpc(worker,method,input,options={},progress){const id=++this.seq;return new Promise((resolve,reject)=>{
  if(!worker||worker.failure){reject(worker?.failure||Error('Transcription worker unavailable'));return;}
  this.inflight.set(id,{resolve,reject,progress,worker});const transfer=input instanceof Float32Array?[input.buffer]:[];
  try{worker.postMessage({id,method,input,options,...(method==='decode'?input:{})},transfer);}
  catch(error){this.inflight.delete(id);reject(error);}
 });}
 retireWorker(worker,error){if(!worker)return;worker.failure=error;
  for(const lane of this.lanes)if(lane.worker===worker)lane.loaded=false;
  this.loaded=this.lanes.some(lane=>lane.loaded);
  for(const [id,p]of this.inflight)if(p.worker===worker){this.inflight.delete(id);p.reject(error);}
  worker.terminate();
 }
 wire(worker){worker.onmessage=({data})=>{const p=this.inflight.get(data.id);if(!p||p.worker!==worker)return;if('progress'in data){p.progress?.(data.progress);return;}this.inflight.delete(data.id);data.error?p.reject(Error(data.error)):p.resolve(data.result);};
  worker.onerror=e=>this.retireWorker(worker,Error(e.message||'Transcription worker failed'));
  worker.onmessageerror=()=>this.retireWorker(worker,Error('Transcription worker response could not be read'));return worker;
 }
 lane(index){return this.lanes[index]??(this.lanes[index]={index});}
 async load(lane){
  if(lane.worker?.failure){lane.worker=null;lane.loaded=false;lane.loading=null;}
  // Decoder and recognizer have separate lifetimes. Replacing a failed decoder
  // must not reload a healthy GPU model; a dead model must never remain loaded.
  if(lane.audio?.failure)lane.audio=null;
  if(!lane.audio)lane.audio=this.wire(new Worker('https://epivalent.github.io/mosh-canopy/assets/vendor/voz/audio-window-worker.js',{type:'module'}));
  if(lane.loaded)return;if(lane.loading)return lane.loading;
  const worker=lane.worker=this.wire(new Worker('https://epivalent.github.io/mosh-canopy/assets/vendor/voz/voz.worker-BkWFkNCc.js',{type:'module'}));
  lane.loading=(async()=>{
   const info=await this.rpc(worker,'load',null,{webnn:true});if(lane.worker!==worker||worker.failure)return;
   lane.info=info;lane.loaded=true;this.loaded=true;this.info=info;
  })().catch(e=>{this.retireWorker(worker,e);if(lane.worker===worker){this.retireWorker(lane.audio,e);lane.audio=null;lane.loaded=false;lane.loading=null;lane.retryAt=performance.now()+30000;}throw e;});return lane.loading;
 }
 acceptPCM(clip,data){if(!this.enabled)return;const id=this.voices.key(clip),end=data.end,start=data.start??Math.max(0,end-data.samples.length/data.rate);
  this.pcm.set(id,{samples:data.samples,rate:data.rate,timeScale:data.timeScale||1,start,end,id,clip,key:id+':pcm:'+start,duration:clip.duration,offset:0});
 }
 async tick(){if(!this.enabled||this.scheduling)return;this.scheduling=true;
  try{const now=performance.now();for(const [key,retryAt]of this.failures)if(retryAt<=now)this.failures.delete(key);
   const revision=this.scheduleRevision,viewed=this.view(),clips=[...new Set([viewed?.clip,...this.candidates()])].filter(c=>c?.kind==='video');
   const ids=new Set(clips.map(c=>this.voices.key(c)));for(const [id]of this.pcm)if(!ids.has(id))this.pcm.delete(id);
   for(const [clip,player]of this.capturing)if(!clips.includes(clip)||clip.player!==player){player.captureSpeech(false);this.capturing.delete(clip);}
   this.status();const coverage=await this.coverageFor([...ids]);if(!coverage||!this.enabled||revision!==this.scheduleRevision||viewed?.clip!==this.view()?.clip)return;
   const uncovered=[];
   for(const clip of clips){const id=this.voices.key(clip);if(coverage[id]?.complete){this.capturing.get(clip)?.captureSpeech(false);this.capturing.delete(clip);this.pcm.delete(id);}else uncovered.push(clip);}
   const tasks=[];this.waitingAudio=0;this.suspendedAudio=0;this.audioError=null;for(const ahead of [0,1,2])for(const clip of uncovered){
    const id=this.voices.key(clip),known=coverage[id];
    const source=this.source(clip,clip===viewed?.clip?viewed.video:null);if(!source)continue;
    if(source.remote){if(ahead)continue;const available=clip.player?.captureSpeech(true,{foreground:clip===viewed?.clip});if(clip.player)this.capturing.set(clip,clip.player);if(available===false){this.audioError='Live YouTube transcription needs the audio bridge · native playback and available captions still work';continue;}this.waitingAudio++;if(clip.speechError)this.audioError='YouTube audio capture · '+clip.speechError;else if(clip.speechState?.state==='suspended')this.suspendedAudio++;const pcm=this.pcm.get(id);if(pcm&&!this.jobs.has(pcm.key)&&(this.failures.get(pcm.key)||0)<=performance.now()&&!known?.ranges?.some(r=>r[0]<=pcm.start+.15&&r[1]>=pcm.end-.15))tasks.push({...pcm,priority:clip===viewed?.clip});continue;}
    const start=Math.max(0,Math.floor(source.time/6)*6+ahead*6),end=Math.min(source.duration,start+8);if(end-start<.3)continue;
    const key=id+':'+source.url+':'+start;
    if(this.jobs.has(key)||(this.failures.get(key)||0)>performance.now())continue;
    if(known?.ranges?.some(r=>r[0]<=source.offset+start+.15&&r[1]>=source.offset+end-.15))continue;
    tasks.push({...source,start,end,id,key,clip,priority:clip===viewed?.clip});
   }
   const foreground=this.lanes[0];
   // Compile the viewing recognizer while its first PCM window is filling.
   // Audio arrival must not be the trigger for downloading the speech model.
   const viewedPlayer=viewed?.video||viewed?.clip?.player;
   if(uncovered.includes(viewed?.clip)&&viewedPlayer?.speechAvailable){const lane=this.lane(0);if(!lane.loaded&&!lane.loading&&performance.now()>=(lane.retryAt||0))void this.load(lane).catch(error=>{this.lastError='Voz · '+error.message;this.status();});}
   if(foreground?.task&&foreground.phase==='decode'&&foreground.task.clip!==viewed?.clip&&!foreground.task.cancelled){
     foreground.task.cancelled=true;const audio=foreground.audio;audio?.terminate();
     for(const [id,p]of this.inflight)if(p.worker===audio){p.reject(Error('Film selection superseded'));this.inflight.delete(id);}
     foreground.audio=this.wire(new Worker('https://epivalent.github.io/mosh-canopy/assets/vendor/voz/audio-window-worker.js',{type:'module'}));
   }
   for(let i=0;i<this.parallelism;i++){const lane=this.lane(i);if(lane.task||performance.now()<(lane.retryAt||0))continue;
    lane.idleSince ||= performance.now();
    if(!tasks.length&&lane.loaded&&performance.now()-lane.idleSince>60000){lane.worker?.terminate();lane.audio?.terminate();lane.worker=null;lane.audio=null;lane.loaded=false;lane.loading=null;}
    // Reserve lane zero for the actual viewer: a background film cannot delay it.
    const task=tasks.find(t=>!this.jobs.has(t.key)&&!this.lanes.some(l=>l.task?.id===t.id)&&(i!==0||t.priority||this.parallelism===1));
    if(task){lane.idleSince=0;lane.task=task;this.jobs.set(task.key,task);void this.run(lane,task);}
   }
   for(const lane of this.lanes)if(lane.index>=this.parallelism&&!lane.task){lane.worker?.terminate();lane.audio?.terminate();lane.worker=null;lane.audio=null;lane.loaded=false;lane.loading=null;}
   this.status();
  }catch(e){this.lastError='Voz · '+e.message;this.status();}finally{this.scheduling=false;}
 }
 async run(lane,task){const started=performance.now();try{
   // Download/demux concurrently with model initialization, including on first use.
   lane.phase='decode';const loading=this.load(lane);
   const decoding=task.samples?this.rpc(lane.audio,'resample',task.samples,{rate:task.rate}):this.rpc(lane.audio,'decode',{url:new URL(task.url,location.href).href,start:task.start,end:task.end});if(task.samples)this.pcm.delete(task.id);
   const [,audio]=await Promise.all([loading,decoding]);
   if(!this.enabled||task.cancelled)return;lane.phase='inference';
   const result=audio.samples.length?await this.rpc(lane.worker,'transcribe',audio.samples):{words:[]};
   if(!this.enabled||task.cancelled)return;
   await this.voices.ask('live-transcript',{id:task.id,title:task.clip.name,duration:task.clip.mia?.durationSeconds||task.duration,start:task.offset+task.start,end:task.offset+task.end,
    words:result.words.map(w=>({...w,start:w.start*(task.timeScale||1)+task.offset+task.start,end:w.end*(task.timeScale||1)+task.offset+task.start})),noAudio:audio.noAudio});
   this.count++;this.lastError=null;lane.last={id:task.id,words:result.words.length,wallMs:performance.now()-started,inferenceMs:result.wallMs,range:[task.offset+task.start,task.offset+task.end]};
  }catch(e){if(!task.cancelled){this.lastError='Voz · '+e.message;this.failures.set(task.key,performance.now()+30000);}}
  finally{if(this.jobs.get(task.key)===task)this.jobs.delete(task.key);lane.task=null;lane.phase=null;this.status();void this.tick();}
 }
};
