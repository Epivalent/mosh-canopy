// Caption selection belongs to the host; this control only applies Dream prompts.
const storageKey='mosh-dream-caption-feed-v1';
export class DreamCaptionFeed {
 constructor(feature,{getCaption=()=>null,initial}={}){
  this.feature=feature;this.getCaption=getCaption;this.lastAt=-Infinity;this.count=0;
  let saved={};try{saved=JSON.parse(localStorage.getItem(storageKey)||'{}')||{};}catch{}
  this.enabled=!!saved.enabled;this.seconds=this.interval(saved.seconds);this.originalPrompt=saved.originalPrompt??feature.settings.Prompt??'';
  if(initial){this.enabled=!!initial.enabled;this.seconds=this.interval(initial.seconds);this.originalPrompt=initial.originalPrompt??this.originalPrompt;}
  this.field=document.createElement('fieldset');this.field.dataset.control='CaptionFeed';
  this.field.innerHTML=`<legend>Live caption → Dream prompt</legend>
   <label class="knob"><span>Feed current caption into prompt</span><input data-caption="enabled" type="checkbox"></label>
   <label class="knob"><span>Update every (seconds)</span><input data-caption="seconds" type="number" min="0.5" max="300" step="0.5"></label>
   <button data-caption="now" type="button">Use current caption now</button>
   <button data-caption="restore" type="button">Stop & restore previous prompt</button>
   <p class="dream-hint" data-caption="status" role="status"></p>`;
  const promptGroup=feature.inputs.get('Prompt')?.input.closest('fieldset');
  if(promptGroup)promptGroup.after(this.field);else feature.$('.dream-fields').prepend(this.field);
  this.$=name=>this.field.querySelector(`[data-caption="${name}"]`);
  this.$('enabled').checked=this.enabled;this.$('seconds').value=this.seconds;
  this.$('enabled').onchange=()=>this.setEnabled(this.$('enabled').checked);
  this.$('seconds').onchange=()=>{this.seconds=this.interval(this.$('seconds').value);this.$('seconds').value=this.seconds;this.lastAt=performance.now();this.save();};
  this.$('now').onclick=()=>this.tick(true);
  this.$('restore').onclick=()=>this.restore();
  this.status(this.enabled?'Waiting for a playing film.':'Off · captions can guide the Dream prompt.');
  if(initial)this.save();
  this.timer=setInterval(()=>{if(!this.field.isConnected){this.dispose();return;}this.tick();},250);
 }
 interval(value){return Math.min(300,Math.max(.5,Number(value)||5));}
 save(){try{localStorage.setItem(storageKey,JSON.stringify({enabled:this.enabled,seconds:this.seconds,originalPrompt:this.originalPrompt}));}catch{}}
 status(text){this.$('status').textContent=text;}
 setEnabled(value){
  if(value&&!this.enabled)this.originalPrompt=this.feature.settings.Prompt||'';
  this.enabled=!!value;this.$('enabled').checked=this.enabled;this.lastAt=-Infinity;this.save();
  if(this.enabled)this.tick();else this.status('Stopped; current prompt retained.');
 }
 restore(){this.setEnabled(false);this.feature.change({Prompt:this.originalPrompt});this.status('Stopped; previous prompt restored.');}
 tick(force=false,now=performance.now()){
  if(!force&&!this.enabled)return;
  const f=this.feature;
  if(!f.enabled||!f.active||!f.renderer?.ready){this.status('Waiting for Dream and a playing film.');return;}
  if(!force&&now-this.lastAt<this.seconds*1000)return;
  try{
   const caption=this.getCaption(),text=caption?.text?.trim();
   if(!text){this.status('Waiting for captions for this film; prompt unchanged.');return;}
   this.lastAt=now;
   if(text===f.renderer.modelConfig().prompt){this.status('Current caption already applied: '+text);return;}
   // Apply style uses this same model configuration path, not a textbox edit.
   f.change({Prompt:text});this.count++;this.lastCaption=caption;
   this.status(`Applied ${this.count}: ${text}`);
  }catch(e){this.lastAt=now;this.status('Caption feed error: '+e.message);}
 }
 diagnostics(){return {enabled:this.enabled,seconds:this.seconds,applied:this.count,lastCaption:this.lastCaption};}
 dispose(){clearInterval(this.timer);this.field.remove();}
}
