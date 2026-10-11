import {balanceLevels} from './levels.mjs';
import {capturePassage} from './bridge-capture.mjs';
import {MontageRecording} from './recording.mjs';
const $=id=>document.getElementById(id);
export class WordMontage {
 constructor(hooks){
  this.hooks=hooks;this.revision=0;this.workers=new Set();this.tasks=new Set();this.prepared=[];this.sources=[];this.active=false;this.paused=false;this.volume=1;this.seed=Date.now();
  this.surface=document.createElement('canvas');this.surface.montagePlayback=true;this.surface.frameVersion=0;
  for(const [name,get]of Object.entries({videoWidth:()=>this.surface.width,videoHeight:()=>this.surface.height,readyState:()=>this.active?4:0,currentTime:()=>this.filmTime,duration:()=>this.clip?.mia?.durationSeconds||this.clip?.retro?.duration||this.cut?.end||0,paused:()=>this.paused,ended:()=>!this.active}))Object.defineProperty(this.surface,name,{get});
  this.surface.play=()=>{this.setPaused(false);return Promise.resolve();};this.surface.pause=()=>this.setPaused(true);
  this.panel=document.createElement('section');this.panel.id='montagePanel';this.panel.hidden=true;this.panel.setAttribute('aria-label','Borrowed voices');
  this.panel.innerHTML=`<h2>Borrowed voices</h2><p>Give the films something to say. Follow a path of borrowed phrases through the net.</p>
   <textarea id="montageText" aria-label="Text for the films to say">We are going to the moon and we are going to dance.</textarea>
   <p class="note">Borrow speech from MIA, MyRetroTVs and Neon Pulse. YouTube passages need the Mosh Canopy bridge to capture their frames and mono audio; a visible preview strip appears during preparation. Word boundaries follow the available caption estimates.</p>
   <details><summary>Catalogue filters</summary><label><input id="montageScope" type="checkbox" checked> Use exploration filters</label><div id="montageFilterFields"></div><p class="note">These settings also guide the beads and filtered concordance searches. Changes apply when you find the next cast. Intermediate source percentages affect bead population; both sources remain searchable.</p></details>
   <div class="buttons"><button class="tape" id="montageBuild">Find a cast</button><button class="tape" id="montageShuffle">Another cast</button><button class="tape" id="montagePlay" disabled>Play path</button><button class="tape" id="montageStop">Stop</button><button class="tape" id="montageClose">Close</button></div>
   <label><input type="checkbox" id="montageRecord"> Record this playback</label><p class="note" id="montageRecordHelp">Save the montage video with its matched audio. A download appears when playback finishes or you stop it.</p><a id="montageDownload" hidden>Download recording</a>
   <p id="montageStatus" role="status">The net keeps playing while your path is prepared.</p>
   <details><summary>Sound &amp; phrasing</summary><label><input type="checkbox" id="montageNormalize" checked> Match clip volumes</label>
   <label>Matching strength <input id="montageStrength" type="range" min="0" max="100" value="100"><output id="montageStrengthValue">100%</output></label>
   <label>Maximum boost (dB) <input id="montageBoost" type="number" min="0" step="1" value="12"></label>
   <label>Breath between cuts (ms) <input id="montageBreath" type="number" min="0" step="10" value="80"></label>
   <label>Max pause within a phrase (s) <input id="montageGap" type="number" min="0" step="0.05" value="0.65"></label>
   <p class="note">Steady gain per passage, preserving dynamics. Boost and sample-peak protection keep quiet or transient-heavy sources from being over-amplified. Timing uses the available word estimates.</p></details>
   <ol id="montageCast"></ol>`;
  const style=document.createElement('style');style.textContent=`#montagePanel{position:fixed;z-index:5;right:14px;top:12px;max-height:calc(100vh - 90px);overflow:auto;width:min(440px,calc(100vw - 28px));box-sizing:border-box;background:var(--panel);border-left:4px solid var(--pink);padding:16px;font:12px/1.45 var(--type);box-shadow:0 8px 28px #0008}#montagePanel h2{font:26px var(--disp);margin:0}#montagePanel textarea{box-sizing:border-box;width:100%;min-height:100px;font:19px/1.4 Georgia;padding:8px}#montagePanel label{display:flex;gap:8px;align-items:center;margin:8px 0}#montagePanel input[type=number]{width:64px}#montagePanel .buttons{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}#montageCast{padding-left:22px}#montageCast li{margin:10px 0}#montageCast .current{background:#e84b9c25}#montageCast .missing{color:#992f42}#montageCast button{font:inherit;color:inherit;text-align:left;background:none;border:0;text-decoration:underline;cursor:pointer}#montageCast small{display:block;color:#655d60}`;document.head.append(style);document.body.append(this.panel);
  this.filters=new CatalogueFilterControls($('montageFilterFields'),()=>$('montageScope').checked);
  $('montageScope').onchange=()=>this.filters.sync();
  addEventListener('mosh-catalogue-selection',()=>{if(!this.panel.hidden)this.filters.sync();});
  $('bMontage').onclick=()=>this.open();$('concordanceMontage').onclick=()=>{if($('concordanceWord').value.trim())$('montageText').value=$('concordanceWord').value;this.open();};
  $('montageClose').onclick=()=>{this.panel.hidden=true;};$('montageBuild').onclick=()=>this.build();$('montageShuffle').onclick=()=>{this.seed++;this.build();};
  $('montagePlay').onclick=()=>this.play().catch(e=>this.fail(e));$('montageStop').onclick=()=>this.cancel(true);
  this.recordingTray=document.createElement('div');this.recordingTray.id='montageRecording';this.recordingTray.hidden=true;
  Object.assign(this.recordingTray.style,{position:'fixed',right:'14px',bottom:'64px',zIndex:'6',background:'var(--panel)',padding:'10px 14px',font:'12px/1.45 var(--type)',maxWidth:'calc(100vw - 56px)'});
  this.recordingTray.innerHTML='<span role="status" id="montageRecordingStatus"></span> <a id="montageRecordingDownload" hidden>Download video</a> <button type="button" aria-label="Dismiss recording notice">×</button>';
  this.recordingTray.querySelector('button').onclick=()=>{this.recordingTray.hidden=true;};document.body.append(this.recordingTray);
  if(!MontageRecording.supported()){$('montageRecord').disabled=true;$('montageRecordHelp').textContent='This browser does not support video recording. You can still play the path.';}
  for(const id of ['montageNormalize','montageStrength','montageBoost'])$(id).oninput=()=>this.updateBalance();
  $('montageBreath').onchange=()=>{if(this.active)this.cancel(true);this.timeline();};
  window.addEventListener('pagehide',()=>{this.disposed=true;this.cancel(false);this.planner?.terminate();this.planner=null;this.release();if(this.recordingURL)URL.revokeObjectURL(this.recordingURL);});
 }
 open(){this.filters.sync();this.hooks.closeSearch();this.panel.hidden=false;this.hooks.closeMix();$('montageText').focus();}
 worker(file,type){const w=new Worker(new URL(file,import.meta.url),type?{type}:undefined);this.workers.add(w);return w;}
 request(worker,data,progress){return new Promise((resolve,reject)=>{
  const task={reject:e=>{clean();reject(e);}};const clean=()=>{worker.removeEventListener('message',message);worker.removeEventListener('error',error);this.tasks.delete(task);};
  const message=({data:m})=>{if(m.id!==data.id)return;if(m.progress){progress?.(m.progress);return;}clean();m.error?reject(Error(m.error)):resolve(m.result??m);};
  const error=e=>task.reject(Error(e.message));this.tasks.add(task);worker.addEventListener('message',message);worker.addEventListener('error',error);worker.postMessage(data);
 });}
 stopWorkers(){this.captureController?.abort();this.captureController=null;for(const t of [...this.tasks])t.reject(new DOMException('Cancelled','AbortError'));for(const w of this.workers){w.terminate();if(w===this.planner)this.planner=null;}this.workers.clear();}
 release(){for(const p of this.prepared)for(const f of p?.frames||[])f.bitmap.close();this.prepared=[];this.buffers=null;this.clips=[];this.cut=null;this.clip=null;this.lastFrame=null;}
 async build(){
  this.cancel(true);this.release();this.ready=false;const revision=++this.revision;this.busy=true;$('montagePlay').disabled=true;$('montageCast').replaceChildren();
  const report=text=>{if(revision===this.revision)$('montageStatus').textContent=text;};
  try{
   const planner=this.planner??=this.worker('./planner-worker.js?v=neon1');this.workers.add(planner);
   const plan=await this.request(planner,{id:revision,text:$('montageText').value,seed:this.seed,maxGap:Math.max(0,+$('montageGap').value),selection:$('montageScope').checked?this.hooks.selection():null},report);
   this.workers.delete(planner);if(revision!==this.revision)return;this.plan=plan;this.renderCast();
   if(plan.missing.length){report('No exact speech found for: '+plan.missing.join(', ')+'. Edit the text or filters.');return;}
   this.clips=plan.clips.map(c=>this.hooks.resolve(c));this.cues=plan.clips.map(c=>[{start:c.start,end:c.end,lines:[c.words]}]);
   const owner=this.captureController=new AbortController(),signal=owner.signal;
   const mia=plan.clips.map((c,i)=>({c,i})).filter(({c})=>c.source!=='youtube');
   const youtube=plan.clips.map((c,i)=>({c,i})).filter(({c})=>c.source==='youtube');
   const decoder=mia.length?this.worker('./media-worker.mjs','module'):null;let done=0;
   const store=(p,i)=>{if(revision!==this.revision||signal.aborted){for(const f of p.frames)f.bitmap.close();signal.throwIfAborted();return;}this.prepared[i]=p;done++;report(`${done}/${plan.clips.length} passages prepared`);};
   const jobs=mia.map(({c,i})=>this.request(decoder,{id:i+1,clip:c,width:this.hooks.width},stage=>report(`Preparing “${c.text}” · ${stage} · ${done}/${plan.clips.length} ready`)).then(p=>store(p,i)));
   let strip;
   if(youtube.length){
    // Compositor callbacks require visible players. YouTube documents a minimum
    // viewport of 200 × 200; derive parallelism from the actual available width.
    strip=document.createElement('div');strip.className='montageCapture';strip.setAttribute('aria-label','Preparing YouTube passages');
    Object.assign(strip.style,{position:'fixed',bottom:'50px',left:'0',right:'0',height:'200px',display:'flex',zIndex:'6',background:'#111'});
    document.body.append(strip);
    const slots=Math.min(youtube.length,Math.max(1,Math.floor(strip.clientWidth/200)));let cursor=0;
    for(let slot=0;slot<slots;slot++){
     const host=document.createElement('div');Object.assign(host.style,{flex:'1',minWidth:'200px'});strip.append(host);
     jobs.push((async()=>{for(;;){signal.throwIfAborted();const item=youtube[cursor++];if(!item)return;const {c,i}=item;
      const p=await capturePassage(c,{container:host,signal,onProgress:stage=>report(`Preparing “${c.text}” · ${stage} · ${done}/${plan.clips.length} ready`)});store(p,i);
     }})());
    }
   }
   try{
    const results=await Promise.allSettled(jobs.map(job=>job.catch(e=>{owner.abort(e);if(revision===this.revision)this.stopWorkers();throw e;})));
    const failed=results.find(r=>r.status==='rejected');if(failed)throw signal.reason||failed.reason;
    signal.throwIfAborted();
   }finally{strip?.remove();decoder?.terminate();this.workers.delete(decoder);if(this.captureController===owner)this.captureController=null;}
   if(revision!==this.revision)return;
   this.ready=true;this.timeline();this.busy=false;this.updateBalance();$('montagePlay').disabled=false;
   report(`Ready · ${plan.clips.length} passages · ${this.duration.toFixed(1)} s · searched ${plan.films.toLocaleString()} transcripts. Playback is prebuffered.`);
  }catch(e){if(revision===this.revision){this.stopWorkers();this.release();this.fail(e);}}
  finally{if(revision===this.revision)this.busy=false;}
 }
 renderCast(){this.rows=[];for(const [i,c]of this.plan.clips.entries()){
  const li=document.createElement('li'),line=document.createElement('span');line.textContent=c.text;li.append(line);const title=document.createElement('button');title.textContent=c.missing?'No exact match':c.title;title.disabled=!!c.missing;
  title.onclick=()=>{const cut=c;this.cancel(false);this.panel.hidden=true;this.hooks.openFilm(cut);};li.append(document.createElement('br'),title);const info=document.createElement('small');info.textContent=c.missing?'':`${c.source==='youtube'?'YouTube':'MIA'} · ${c.start.toFixed(2)}–${c.end.toFixed(2)} s`;li.append(info);if(c.missing)li.className='missing';$('montageCast').append(li);this.rows.push(li);
 }}
 timeline(){let time=0;const gap=Math.max(0,+$('montageBreath').value||0)/1000;this.starts=this.prepared.map((p,i)=>{if(i)time+=gap;const at=time;time+=p.planes?p.planes[0].length/p.rate:this.buffers[i].duration;return at;});this.duration=time;}
 updateBalance(){
  $('montageStrengthValue').textContent=$('montageStrength').value+'%';if(this.busy||!this.prepared.length)return;
  this.balance=balanceLevels(this.prepared.map(p=>p.levels),{amount:+$('montageStrength').value/100,maxBoostDb:+$('montageBoost').value});
  for(const {index,gain}of this.sources){const now=this.audio.currentTime;gain.gain.cancelAndHoldAtTime(now);gain.gain.linearRampToValueAtTime(this.gain(index),now+.020);}
 }
 gain(i){return $('montageNormalize').checked?(this.balance?.clips[i]?.gain??1):1;}
 get time(){return this.active&&!this.paused?Math.max(0,this.offset+this.audio.currentTime-this.epoch):this.offset||0;}
 get filmTime(){return this.cut?Math.min(this.cut.end,this.cut.start+Math.max(0,this.time-this.starts[this.index])):0;}
 get captions(){return this.active?this.cues[this.index]:undefined;}
 async play(){
  if(this.busy||!this.ready)return;
  if(this.active){this.setPaused(!this.paused);return;}
  const revision=this.revision;this.audio=this.hooks.audio();await this.audio.resume();await this.recordingDone;if(revision!==this.revision||this.active)return;
  this.buffers??=this.prepared.map(p=>{const b=this.audio.createBuffer(p.planes.length,p.planes[0].length,p.rate);p.planes.forEach((v,i)=>b.copyToChannel(v,i));p.planes=null;return b;});
  this.busy=false;this.updateBalance();this.timeline();this.master=this.audio.createGain();this.master.connect(this.audio.destination);
  if($('montageRecord').checked){
   try{
    this.recording=new MontageRecording(this.audio,this.master,this.prepared,state=>{$('montageRecordingStatus').textContent=state;});
    this.recordingTray.hidden=false;$('montageRecordingDownload').hidden=true;
   }catch(e){this.master.disconnect();this.master=null;throw Error('Could not start recording: '+e.message);}
  }
  this.returnState=this.hooks.capture();
  this.active=true;this.paused=false;this.index=-1;this.offset=0;$('montageRecord').disabled=true;this.hooks.enter();this.syncAudio(true);this.schedule();this.update();this.panel.hidden=true;
 }
 stopSources(){for(const {source,gain}of this.sources){try{source.stop();}catch{}source.disconnect();gain.disconnect();}this.sources=[];}
 schedule(){
  this.stopSources();this.epoch=this.audio.currentTime+this.audio.baseLatency;
  for(const [index,buffer]of this.buffers.entries()){
   const local=Math.max(0,this.offset-this.starts[index]);if(local>=buffer.duration)continue;
   const source=this.audio.createBufferSource(),gain=this.audio.createGain();source.buffer=buffer;gain.gain.value=this.gain(index);source.connect(gain).connect(this.master);
   source.start(this.epoch+Math.max(0,this.starts[index]-this.offset),local);this.sources.push({source,gain,index});
  }
 }
 syncAudio(immediate=false){if(!this.master)return;const at=this.audio.currentTime,target=this.hooks.sound()?this.volume*.66:0;
  if(immediate)this.master.gain.setValueAtTime(target,at);else{this.master.gain.cancelAndHoldAtTime(at);this.master.gain.linearRampToValueAtTime(target,at+.020);}}
 setVolume(value){this.volume=value;this.hooks.enableSound();this.syncAudio();}
 setPaused(paused){if(!this.active||paused===this.paused)return;this.offset=Math.min(this.duration,this.time);this.paused=paused;this.stopSources();this.recording?.pause(paused);if(!paused){this.schedule();this.recording?.draw(this.surface);}this.hooks.pause(paused);}
 seek(time){if(!this.active)return;this.offset=Math.max(0,Math.min(this.duration,time));if(!this.paused)this.schedule();this.lastFrame=null;this.update();}
 skip(){if(!this.active)return;const next=this.starts[this.index+1];if(next===undefined)this.finish();else this.seek(next);}
 update(){
  if(!this.active)return;const t=this.time;if(t>=this.duration){this.finish();return;}
  const index=Math.max(0,this.starts.findLastIndex(at=>at<=t));
  if(index!==this.index){this.index=index;this.cut=this.plan.clips[index];this.clip=this.clips[index];this.lastFrame=null;
   this.rows.forEach((row,i)=>row.classList.toggle('current',i===index));this.hooks.arrive(this.clip,this.cut,this.surface);
   $('montageStatus').textContent=`${index+1}/${this.clips.length} · ${this.cut.text}`;
  }
  const p=this.prepared[index],local=t-this.starts[index],frame=p.frames.findLast(f=>f.time<=local)||p.frames[0];
  if(frame&&frame!==this.lastFrame){if(this.surface.width!==frame.bitmap.width||this.surface.height!==frame.bitmap.height){this.surface.width=frame.bitmap.width;this.surface.height=frame.bitmap.height;}
   this.surface.getContext('2d').drawImage(frame.bitmap,0,0);this.surface.frameVersion++;this.lastFrame=frame;this.recording?.draw(this.surface);this.hooks.draw(this.clip,this.surface);
  }
 }
 finish(){this.cancel(true);$('montageStatus').textContent='Finished · previous viewing settings restored. Play the same path again or find another cast.';}
 stopRecording(){
  if(!this.recording)return;const recording=this.recording;this.recording=null;
  this.recordingDone=recording.stop().then(({blob,error})=>{
   if(this.disposed)return;
   if(error||!blob){$('montageRecordingStatus').textContent='Recording failed: '+(error?.message||'No video was captured.');return;}
   if(this.recordingURL)URL.revokeObjectURL(this.recordingURL);this.recordingURL=URL.createObjectURL(blob);
   const filename='say-it-'+new Date().toISOString().replace(/[:.]/g,'-')+(blob.type.includes('mp4')?'.mp4':'.webm');
   for(const id of ['montageDownload','montageRecordingDownload']){const link=$(id);link.href=this.recordingURL;link.download=filename;link.hidden=false;}
   $('montageRecordingStatus').textContent='Recording ready ·';this.recordingTray.hidden=false;
  });
 }
 cancel(resume=false){
  ++this.revision;this.stopWorkers();this.busy=false;this.stopRecording();this.stopSources();this.master?.disconnect();this.master=null;
  const active=this.active,saved=this.returnState;this.returnState=null;this.active=false;this.paused=false;this.offset=0;if(active)this.hooks.leave(resume,saved);
  $('montageRecord').disabled=!MontageRecording.supported();
  if(!this.ready){this.release();$('montagePlay').disabled=true;}
  $('montageStatus').textContent=this.ready?'Stopped. Your prepared path can be replayed.':'Preparation cancelled. Find a cast to prepare a new path.';
 }
 fail(e){if(e.name==='AbortError')return;$('montageStatus').textContent='Could not prepare this path: '+e.message;this.hooks.notify(e.message);}
}
