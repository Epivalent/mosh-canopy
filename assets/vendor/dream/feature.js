import {DreamRenderer} from './client.js?v=direct-assets1';
import {groups} from './studio/native-control-schema.js';
import {DreamCaptionFeed} from './caption-feed.js?v=2';

// Mosh Canopy owns film selection, transport and audio. These are the standalone
// studio's control names, values, ranges and modes, with no legacy LCM mapping.
export class DreamFeature {
 constructor({mount,controls,onStatus=()=>{},getCaption=()=>null}){
  this.getCaption=getCaption;
  Object.assign(this,{mount,controls,onStatus,enabled:false,active:false,visible:false,revision:0,settings:{},statusHistory:[],updates:0,presented:0});
  this.style=document.createElement('link');this.style.rel='stylesheet';this.style.href=new URL('./feature.css?v=studio-startup8',import.meta.url);document.head.append(this.style);
  this.button=document.createElement('button');this.button.className='dream-launch';this.button.textContent='✦ Dream';this.button.setAttribute('aria-expanded','false');controls.append(this.button);
  this.panel=document.createElement('section');this.panel.className='dream-panel';this.panel.hidden=true;this.panel.setAttribute('aria-label','Dream studio settings');
  this.panel.innerHTML=`<header><div><span class="dream-eyebrow">OPTIONAL VIDEO EFFECT</span><h2>Dream studio</h2></div><button data-action="close" aria-label="Close dream settings">×</button></header>
   <p class="dream-intro">The same dream studio effect as the standalone viewer. Your film and original sound keep playing.</p>
   <div class="dream-state"><i></i><span data-role="status" role="status">Off · no model loaded</span></div>
   <button class="dream-enable" data-action="enable" disabled>Enable dream mode</button>
   <div class="dream-setup" data-role="setup" hidden><p>This browser needs WebNN enabled for Dream. Open <code>brave://flags/#web-machine-learning-neural-network</code>, set it to Enabled, then relaunch Brave. Also enable Experimental WebNN features for GPU tensor sharing.</p><button data-action="copy-setup">Copy WebNN settings address</button></div>
   <label class="dream-backend">Neural device<select data-setting="backend"><option value="npu">WebNN NPU · Mac ANE</option><option value="gpu">WebNN GPU · RTX / other GPUs</option></select></label>
   <p class="dream-download">The first load downloads and compiles the models. They stay resident across films and control changes.</p>
   <div class="dream-fields"></div><button data-action="restore">Restore opening look</button>
   <div class="dream-measures"><span><strong data-role="neural">—</strong> changed neural images/s</span><span><strong data-role="latency">—</strong> ms/completed cycle</span><span><strong data-role="display">—</strong> presentation frames/s</span></div>
   <footer>Background beads use previews. Only the viewing film feeds Dream. Hidden or paused films stop processing; models stay warm. Turning Dream off also keeps the compiled models resident.</footer>
   <button data-action="diagnostics">Copy Dream diagnostics</button>`;
  document.body.append(this.panel);this.$=s=>this.panel.querySelector(s);this.inputs=new Map();this.backend=navigator.platform.startsWith('Win')?'gpu':'npu';this.$('[data-setting=backend]').value=this.backend;
  this.$('[data-setting=backend]').onchange=()=>{const backend=this.$('[data-setting=backend]').value;if(backend!==this.backend){this.release();this.backend=backend;}};
  this.readyControls=this.buildControls().catch(e=>{this.status(e.message);throw e});
  this.button.onclick=()=>this.show(this.panel.hidden);this.$('[data-action=close]').onclick=()=>this.show(false);
  this.$('[data-action=enable]').onclick=()=>this.enabled?this.disable():void this.enable();
  this.$('[data-action=copy-setup]').onclick=async()=>{await navigator.clipboard.writeText('brave://flags/#web-machine-learning-neural-network');this.$('[data-action=copy-setup]').textContent='Settings address copied';};
  this.$('[data-action=restore]').onclick=()=>this.change({...this.defaults},['Resetstudio']);
  this.$('[data-action=diagnostics]').onclick=async()=>{await navigator.clipboard.writeText(JSON.stringify(this.diagnostics(),null,2));this.$('[data-action=diagnostics]').textContent='Diagnostics copied';};
  for(const type of ['pointerdown','pointermove','click','wheel','keydown'])this.panel.addEventListener(type,e=>{if(type==='keydown'&&e.key==='Escape')this.show(false);e.stopPropagation()});
  this.visibility=()=>this.syncActivity();document.addEventListener('visibilitychange',this.visibility);this.pagehide=()=>this.release();addEventListener('pagehide',this.pagehide);
  this.metricTimer=setInterval(()=>{const r=this.renderer,now=performance.now();this.$('[data-role=neural]').textContent=r?.ready?(r.results.filter(x=>x.at>now-5000&&x.changed>0).length/5).toFixed(2):'—';this.$('[data-role=display]').textContent=r?.ready?String(r.presentations-(this.previousPresentations||0)):'—';this.previousPresentations=r?.presentations||0;},1000);
 }
 async buildControls(){
  const response=await fetch(new URL('./studio/native-controls.json',import.meta.url));if(!response.ok)throw Error('Could not load Dream studio controls');const {controls}=await response.json();const byName=new Map(controls.map(p=>[p.name,p]));
  this.defaults=Object.fromEntries(controls.filter(p=>!p.readOnly&&p.style!=='Pulse').map(p=>[p.name,p.value]));this.settings={...this.defaults};
  try{const saved=JSON.parse(localStorage.getItem('mosh-dream-studio-v1')||'{}');for(const name of groups.flatMap(g=>g[1]))if(name in saved&&byName.get(name)?.style!=='Pulse')this.settings[name]=saved[name];}catch{}
  for(const [title,names]of groups){const field=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent=title;field.append(legend);this.$('.dream-fields').append(field);
   for(const name of names){const spec=byName.get(name);if(!spec)continue;const label=document.createElement('label');label.className='knob';label.dataset.control=name;const title=document.createElement('span');title.textContent=spec.label;label.append(title);let input,number;
    const update=(value,immediate=false)=>{this.settings[name]=value;clearTimeout(this.editTimer);this.editTimer=setTimeout(()=>this.change({...this.settings}),immediate?0:220);};
    if(spec.style==='Pulse'){input=document.createElement('button');input.textContent=spec.label;title.remove();input.onclick=()=>this.change({},[name]);}
    else if(spec.style==='Menu'){input=document.createElement('select');spec.menuNames.forEach((v,i)=>input.add(new Option(spec.menuLabels[i],v)));input.onchange=()=>update(input.value,true);}
    else if(spec.style==='Toggle'){input=document.createElement('input');input.type='checkbox';input.onchange=()=>update(input.checked,true);}
    else if(spec.style==='Float'||spec.style==='Int'){
     const row=document.createElement('div');row.className='row';input=document.createElement('input');input.type='range';input.min=spec.min;input.max=spec.max;input.step=spec.style==='Int'?'1':name==='Textureperiod'?'0.001':name.includes('ersistence')?'0.001':'0.005';
     number=document.createElement('input');number.type='number';number.min=spec.min;number.max=spec.max;number.step=input.step;number.setAttribute('aria-label',spec.label+' value');if(name==='Seed'){input.type='number';input.style.width='100%';number=null;}
     input.oninput=()=>{if(number)number.value=input.value;update(Number(input.value))};input.onchange=()=>update(Number(input.value),true);if(number){number.onchange=()=>{input.value=number.value;update(Number(number.value),true)};row.append(input,number)}else row.append(input);label.append(row);
    }else{input=document.createElement(name==='Prompt'?'textarea':'input');input.onchange=()=>update(input.value,true);if(name==='Prompt'){input.placeholder='Style guidance (blank is allowed)';input.onkeydown=e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();update(input.value,true);input.blur()}};const apply=document.createElement('button');apply.textContent='Apply style';apply.onclick=()=>{update(input.value,true);input.blur()};label.append(input,apply);}}
    input.dataset.setting=name;input.disabled=spec.readOnly;if(!label.contains(input))label.append(input);this.inputs.set(name,{input,number,spec});field.append(label);
   }
  }
  this.captionFeed=new DreamCaptionFeed(this,{getCaption:this.getCaption});
  this.reflect();this.supportError=!isSecureContext?'Dream needs HTTPS or localhost.':!navigator.gpu?'WebGPU is unavailable. Enable browser graphics acceleration to use Dream.':!navigator.ml?'WebNN is disabled in this browser. Enable WebNN in Brave settings, then relaunch.':null;
  this.$('[data-action=enable]').disabled=false;this.$('[data-role=setup]').hidden=!!navigator.ml||!isSecureContext;this.activityStatus();
 }
 reflect(){for(const [name,{input,number,spec}]of this.inputs){if(spec.style==='Pulse')continue;if(spec.style==='Toggle')input.checked=!!this.settings[name];else input.value=this.settings[name]??'';if(number)number.value=this.settings[name]??'';}}
 change(values,pulses=[]){Object.assign(this.settings,values);this.reflect();try{localStorage.setItem('mosh-dream-studio-v1',JSON.stringify(this.settings))}catch{}this.renderer?.configure(values,pulses);this.syncActivity();}
 show(value){this.panel.hidden=!value;this.button.setAttribute('aria-expanded',String(value));}
 status(text){if(this.$('[data-role=status]').textContent===text)return;this.$('[data-role=status]').textContent=text;this.statusHistory.push({at:performance.now(),text});this.statusHistory=this.statusHistory.slice(-100);this.onStatus(text);}
 diagnostics(){return {architecture:'browser-studio-sd-turbo-512',enabled:this.enabled,active:this.active,visible:this.visible,settings:this.settings,backend:this.backend,supportError:this.supportError,failure:this.failure,failureDetails:this.failureDetails,capabilities:{secure:isSecureContext,webnn:!!navigator.ml,webgpu:!!navigator.gpu,userAgent:navigator.userAgent},clipId:this.clipId,updates:this.updates,presented:this.presented,renderer:this.renderer?.diagnostics(),startup:this.statusHistory};}
 activityStatus(){if(this.supportError||this.failure){this.panel.dataset.state='error';this.status(this.supportError||this.failure);return;}if(!this.enabled){this.status(this.renderer?.ready?'Off · compiled models stay resident':this.renderer?'Off · models are finishing their first load':'Off · no model loaded');return;}if(!this.renderer?.ready)return;this.status(!this.settings.Running?'Paused · models stay resident':this.waitingForFrames?'Waiting for the YouTube frame bridge · native playback continues':!this.visible?'Ready · open a film in the large viewing frame':document.hidden?'Ready · page is in the background':this.video?.paused?'Ready · film is paused':this.video?.ended?'Ready · film has ended':this.hasResult?'Dreaming · same resident studio models':'Ready · waiting for the film’s first neural image');}
 async enable(){
  if(this.enabled)return;if(this.supportError){this.activityStatus();return;}this.failure=null;this.enabled=true;
  if(this.renderer){
   this.button.classList.add('is-on');this.$('[data-action=enable]').textContent='Turn off';this.$('[data-setting=backend]').disabled=true;
   this.panel.dataset.state=this.renderer.ready?'ready':'loading';this.syncActivity();return this.loading;
  }
  const revision=++this.revision;
  try{
   await this.readyControls;if(revision!==this.revision||!this.enabled)return;this.panel.dataset.state='loading';this.button.classList.add('is-on');this.$('[data-action=enable]').textContent='Turn off';this.$('[data-setting=backend]').disabled=true;
   this.canvas=document.createElement('canvas');this.canvas.className='dream-film-surface';this.canvas.hidden=true;this.mount.prepend(this.canvas);
   const renderer=this.renderer=new DreamRenderer(this.canvas,{onStatus:t=>{if(revision===this.revision){if(this.enabled)this.status(t);else this.activityStatus()}},onError:e=>{if(revision===this.revision){this.fail('Dream mode stopped: '+e)}},onFrame:()=>{if(revision===this.revision){this.presented++;this.hasFrame=true}},onPresentation:()=>{if(revision===this.revision){this.hasResult=true;this.syncActivity()}},onResult:stats=>{if(revision===this.revision){this.updates++;this.last=stats;this.$('[data-role=latency]').textContent=stats.ms.toFixed(0)}}});
   renderer.configure(this.settings);this.syncActivity();this.loading=renderer.load({backend:this.backend});await this.loading;if(revision!==this.revision)return;this.loading=null;this.panel.dataset.state=this.enabled?'ready':'off';this.syncActivity();
  }catch(e){if(revision===this.revision){this.fail('Could not load Dream studio: '+e.message)}}
 }
 fail(message){const renderer=this.renderer?.diagnostics();this.release();this.failure=message;this.failureDetails=renderer;this.activityStatus();console.error('[Dream studio]',message,renderer);}
 // Switching the effect off is a warm pause, not renderer destruction. Keep
 // the load promise and its revision valid even if toggled during compilation.
 disable(){
  this.enabled=false;this.active=false;this.renderer?.setRunning(false);this.renderer?.reset();
  this.hasFrame=false;this.hasResult=false;this.lastTime=undefined;this.lastVersion=undefined;
  if(this.canvas)this.canvas.hidden=true;this.panel.dataset.state='off';this.button.classList.remove('is-on');
  this.$('[data-action=enable]').textContent='Enable dream mode';this.$('[data-setting=backend]').disabled=false;
  this.activityStatus();
 }
 // Destruction is reserved for page teardown, a device change, or a fatal error.
 release(){this.revision++;this.enabled=false;this.loading=null;this.active=false;this.pending=false;this.hasFrame=false;this.hasResult=false;this.lastTime=undefined;this.renderer?.dispose();this.renderer=null;this.canvas?.remove();this.canvas=null;this.panel.dataset.state='off';this.button.classList.remove('is-on');this.$('[data-action=enable]').textContent='Enable dream mode';this.$('[data-setting=backend]').disabled=false;this.$('[data-role=latency]').textContent='—';this.status('Off · GPU resources released');}
 setView({visible,video,clip}){
  if(video!==this.video||clip?.id!==this.clipId){this.pending=false;this.captureTicket=null;for(const event of ['seeking','seeked'])this.video?.removeEventListener?.(event,this.onSeek);this.video=video;this.clipId=clip?.id;this.onSeek=()=>{this.pending=false;this.captureTicket=null;this.lastVersion=undefined;this.renderer?.reset();this.hasResult=false;this.lastTime=undefined;this.syncActivity()};for(const event of ['seeking','seeked'])video?.addEventListener?.(event,this.onSeek);this.renderer?.reset();this.lastVersion=undefined;this.lastTime=undefined;this.hasFrame=false;this.hasResult=false;}
  this.waitingForFrames=Boolean(visible&&video?.nativeOnly);this.visible=Boolean(visible&&video&&!video.nativeOnly);this.syncActivity();
 }
 syncActivity(){const active=this.enabled&&this.visible&&!!this.settings.Running&&!document.hidden&&!this.video?.paused&&!this.video?.ended;this.active=active;this.renderer?.setRunning(active);if(this.canvas)this.canvas.hidden=!this.visible||!this.hasResult||!this.enabled||document.hidden;this.activityStatus();}
 submit(source,{clipId,version,time=0}={}){
  if(!this.active||!this.renderer?.ready||this.pending||version===this.lastVersion||clipId!==this.clipId)return;
  this.lastVersion=version;this.pending=true;if(this.lastTime!==undefined&&time<this.lastTime)this.renderer.reset();this.lastTime=time;
  const ticket=this.captureTicket={revision:this.revision,video:this.video,epoch:this.renderer.epoch};
  const current=()=>this.captureTicket===ticket&&ticket.revision===this.revision&&ticket.video===this.video&&ticket.epoch===this.renderer?.epoch;
  const finish=()=>{if(this.captureTicket===ticket){this.captureTicket=null;this.pending=false;}};
  createImageBitmap(source).then(frame=>{if(!current()||!this.active){frame.close();finish();return;}return this.renderer.submit(frame,{time},finish);}).catch(e=>{const relevant=current();finish();if(relevant)this.fail('Frame access unavailable: '+e.message);});
 }
 dispose(){this.captionFeed?.dispose();this.release();clearInterval(this.metricTimer);clearTimeout(this.editTimer);for(const event of ['seeking','seeked'])this.video?.removeEventListener?.(event,this.onSeek);document.removeEventListener('visibilitychange',this.visibility);removeEventListener('pagehide',this.pagehide);this.panel.remove();this.button.remove();this.style.remove();}
}
