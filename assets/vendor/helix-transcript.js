/* A readable window onto a ribbon's source transcript. Hover never navigates,
   starts a player or changes the source clock. */
window.HelixTranscript=class HelixTranscript {
 constructor({canvas,pick,voices,clock,enabled,open,jump}){
  Object.assign(this,{canvas,pick,voices,clock,enabled,open,jump,generation:0,rows:[],buttons:[]});
  this.element=document.createElement('section');this.element.id='helixTranscript';this.element.hidden=true;this.element.setAttribute('aria-label','Streaming transcript');
  this.element.innerHTML='<header><div><span class="helix-source"></span><h2><button class="helix-title" type="button" title="Watch this film from the current transcript position"></button></h2></div><button class="helix-close" type="button" aria-label="Close transcript">×</button></header><div class="helix-passage"></div><footer><span class="helix-time"></span><span class="helix-state">Following stream</span><button class="helix-watch" type="button">Watch here ↗</button></footer>';
  document.body.append(this.element);this.title=this.element.querySelector('.helix-title');this.source=this.element.querySelector('.helix-source');this.passage=this.element.querySelector('.helix-passage');this.time=this.element.querySelector('.helix-time');this.state=this.element.querySelector('.helix-state');
  this.element.querySelector('.helix-close').onclick=()=>this.hide();
  this.title.onclick=this.element.querySelector('.helix-watch').onclick=()=>{const clip=this.clip;if(!clip)return;const t=this.clock(clip);this.hide();this.jump(clip,t);};
  this.passage.onclick=e=>{const word=e.target.closest('button[data-word]');if(word){const text=word.textContent;this.hide();this.open(text);}};
  this.element.onpointerenter=()=>{clearTimeout(this.leaveTimer);this.reading=true;};
  this.element.onpointerleave=()=>{this.reading=false;this.leaveSoon();};
  this.element.onfocusin=()=>{this.reading=true;clearTimeout(this.leaveTimer);};
  this.element.onfocusout=()=>{this.reading=this.element.matches(':hover');if(!this.reading)this.leaveSoon();};
  canvas.addEventListener('pointermove',e=>{
   if(e.pointerType==='touch'||e.buttons||!this.enabled()){this.hide();return;}
   this.point={x:e.clientX,y:e.clientY};
   // Hover intent: let the cursor settle before a depth-tested GPU pick. This
   // avoids a synchronous readback for every mousemove during exploration.
   clearTimeout(this.intentTimer);this.intentTimer=setTimeout(()=>this.inspect(),120);
  },{passive:true});
  canvas.addEventListener('pointerdown',()=>this.hide());
  canvas.addEventListener('pointerleave',()=>{clearTimeout(this.intentTimer);this.leaveSoon();});
  canvas.addEventListener('wheel',()=>this.hide(),{passive:true});
  addEventListener('blur',()=>this.hide());addEventListener('resize',()=>this.hide());
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!this.element.hidden){this.hide();e.stopImmediatePropagation();}},{capture:true});
 }
 leaveSoon(){clearTimeout(this.leaveTimer);this.leaveTimer=setTimeout(()=>{if(!this.reading)this.hide();},250);}
 inspect(){
  if(!this.point||!this.enabled()||this.reading)return;
  const hit=this.pick(this.point.x,this.point.y);
  if(!hit){this.leaveSoon();return;}
  clearTimeout(this.leaveTimer);
  if(this.clip===hit.clip&&!this.element.hidden)return;
  void this.show(hit.clip,this.point);
 }
 async show(clip,point){
  const token=++this.generation;this.clip=clip;this.anchor={...point};this.rows=[];this.buttons=[];this.renderedIndex=null;this.lastTime=null;
  this.title.textContent=clip.retro?.title||clip.mia?.title||clip.name;
  this.source.textContent=clip.retro?(clip.retro.source==='neon'?'Neon Pulse · YouTube':'MyRetroTVs · YouTube'):'Moving Image Archive';
  this.passage.textContent='Opening transcript…';this.element.hidden=false;this.place();
  try{const rows=await this.voices.ask('captions',{id:this.voices.key(clip)});if(token!==this.generation)return;
   this.rows=rows;this.renderedIndex=null;this.passage.textContent=rows.length?'':'No timed speech available yet.';this.update();this.place();
  }catch(e){if(token===this.generation)this.passage.textContent='Transcript could not be loaded.';}
 }
 place(){
  const margin=12,r=this.element.getBoundingClientRect(),p=this.anchor;
  const left=p.x+r.width+margin<=innerWidth?p.x+margin:p.x-r.width-margin;
  this.element.style.left=Math.max(margin,Math.min(innerWidth-r.width-margin,left))+'px';
  this.element.style.top=Math.max(margin,Math.min(innerHeight-r.height-margin,p.y-r.height*.3))+'px';
 }
 hide(){clearTimeout(this.intentTimer);clearTimeout(this.leaveTimer);this.generation++;this.element.hidden=true;this.clip=null;this.reading=false;this.rows=[];this.buttons=[];}
 cueAt(t){let lo=0,hi=this.rows.length;while(lo<hi){const mid=(lo+hi)>>1;if(this.rows[mid].start<=t)lo=mid+1;else hi=mid;}return Math.max(0,lo-1);}
 render(index){
  // Two neighbouring phrases on either side give reading context. Only this
  // short passage enters the DOM, regardless of the complete film's duration.
  const first=Math.max(0,index-2),last=Math.min(this.rows.length,index+3),fragment=document.createDocumentFragment();this.buttons=[];
  for(let i=first;i<last;i++){const p=document.createElement('p');p.dataset.cue=i;
   for(const [j,w]of this.rows[i].lines.flat().entries()){
    if(j)p.append(' ');const button=document.createElement('button');button.type='button';button.textContent=w.text;button.dataset.word='';button.title='Explore “'+w.text+'”';p.append(button);this.buttons.push({element:button,word:w});
   }
   fragment.append(p);
  }
  this.passage.replaceChildren(fragment);this.renderedIndex=index;
  const current=this.passage.querySelector('[data-cue="'+index+'"]');
  if(current)this.passage.scrollTop=Math.max(0,current.offsetTop-this.passage.offsetTop-(this.passage.clientHeight-current.offsetHeight)/2);
 }
 update(){
  if(this.element.hidden)return;if(!this.enabled()){this.hide();return;}
  const t=this.clock(this.clip),index=this.cueAt(t);
  if(this.rows.length&&(!this.reading||this.renderedIndex===null)&&this.renderedIndex!==index)this.render(index);
  // Smooth currency envelope changes ink, not word geometry, so click targets
  // remain stable while the stream passes through them.
  const sigma=this.voices.envelope||1;
  for(const {element,word}of this.buttons){const d=t<word.start?t-word.start:t>word.end?t-word.end:0,currency=Math.exp(-.5*(d/sigma)**2);element.style.opacity=String(.48+.52*currency);element.classList.toggle('spoken',t>=word.start&&t<word.end);}
  const seconds=Math.floor(t);if(seconds!==this.lastTime){this.lastTime=seconds;this.time.textContent=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');}
  this.state.textContent=this.reading?'Reading · move away to follow':'Following stream';
 }
 refresh(ids){if(this.clip&&ids.includes(this.voices.key(this.clip)))void this.show(this.clip,this.anchor);}
};
