/* Status only. Corpus collection runs in scripts/collect-retrotv-captions.mjs. */
window.RetroCaptionBatch=class RetroCaptionBatch{
 constructor({index,voices}){this.index=index;this.voices=voices;this.running=false;this.active=new Map();this.history=[];this.button=document.getElementById('retroBatch');this.label=document.getElementById('retroBatchStatus');this.button.textContent='Refresh caption coverage';this.button.onclick=()=>this.refresh();addEventListener('visibilitychange',()=>{if(!document.hidden)void this.refresh();});void this.refresh();}
 async start(){return this.refresh();}
 stop(){}
 async refresh(){if(this.refreshing)return;this.refreshing=true;try{
  if(this.index.published){await this.index.published.load();this.voices?.refreshPublished(this.index.published.index?.revision);}
  const c=await this.index.coverage();let job=null;const catalogues=await Promise.all(['https://mosh-canopy-assets.moshcanopy.workers.dev/assets/retrotv/index.json','https://mosh-canopy-assets.moshcanopy.workers.dev/assets/neonpulse/index.json'].map(async url=>{const r=await fetch(url);return r.ok?r.json():{total:0};}));const total=catalogues.reduce((n,c)=>n+c.total,0);
  try{const r=await fetch('https://mosh-canopy-assets.moshcanopy.workers.dev/assets/retrotv/captions/status.json',{cache:'no-cache'});if(r.ok)job=await r.json();}catch{}
  const state=job?` · offline collector ${job.state}${job.reason?' — '+job.reason:''}`:' · no offline job status available';
  this.label.textContent=`${c.captions||0} captioned · ${c['no-captions']||0} without CC · ${c.unavailable||0} unavailable · ${(c.retry||0)+(c.throttled||0)} retryable · ${c.processed.toLocaleString()} / ${total.toLocaleString()} checked${state}`;
  const neonLabel=document.getElementById('neonCaptionStatus');
  try{const r=await fetch('https://mosh-canopy-assets.moshcanopy.workers.dev/assets/neonpulse/captions/coverage.json',{cache:'no-cache'});if(r.ok){const n=await r.json();if(neonLabel)neonLabel.textContent=`${n.captions||0} captioned · ${n['no-captions']||0} without YouTube CC · ${n.unavailable||0} unavailable · ${n.total} videos in caption batch`;}else if(neonLabel)neonLabel.textContent='YouTube captions and live transcription are used as films play.';}catch{if(neonLabel)neonLabel.textContent='YouTube captions and live transcription are used as films play.';}
  this.onProgress?.({counts:c,active:0,total,running:false,history:[],job});
 }catch(e){this.label.textContent='Caption coverage: '+e.message;}finally{this.refreshing=false;}}
};
