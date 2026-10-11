/* Timed, clickable captions for the large film frame. No pixels are burned
   into the film texture, so captions never enter cutouts or film reflections. */
window.ClipCaptions=class ClipCaptions {
  constructor({voices,open}){
    this.voices=voices;this.open=open;this.enabled=true;this.cache=new Map();this.pending=new Set();this.refreshPending=new Set();
    this.element=document.getElementById('clipCaptions');this.content=this.element.firstElementChild;
    this.corners=Array.from({length:4},()=>new THREE.Vector3());
    this.enablePinning();
    document.getElementById('bCC').onclick=()=>{this.enabled=!this.enabled;document.getElementById('bCC').setAttribute('aria-pressed',String(this.enabled));if(!this.enabled)this.hide();};
    this.content.onclick=e=>{const button=e.target.closest('button');if(button){this.hide();this.open(button.textContent);}};
  }
  enablePinning(){
    if(this.pointer)return;
    this.pointer={x:-Infinity,y:-Infinity};
    document.addEventListener('pointermove',e=>{this.pointer.x=e.clientX;this.pointer.y=e.clientY;},{passive:true});
    document.addEventListener('pointerleave',()=>{this.pointer.x=this.pointer.y=-Infinity;this.pinned=false;},{passive:true});
    window.addEventListener('blur',()=>{this.pointer.x=this.pointer.y=-Infinity;this.pinned=false;});
    this.content.addEventListener('focusin',()=>{this.pinned=true;});
    this.content.addEventListener('focusout',()=>{this.pinned=false;});
  }
  hide(){this.element.hidden=true;this.pinned=false;this.bounds=null;}
  checkProximity(){
    if(this.element.hidden)return;
    const p=this.pointer;
    if(!Number.isFinite(p.x)||!Number.isFinite(p.y)){this.pinned=this.content.contains(document.activeElement);return;}
    const r=this.pinned&&this.bounds?this.bounds:this.element.getBoundingClientRect();
    // The layout container is almost window-wide; only the actual text is a target.
    const near=[...this.content.querySelectorAll('.caption-line')].some(line=>{const b=line.getBoundingClientRect();const margin=b.height;return p.x>=b.left-margin&&p.x<=b.right+margin&&p.y>=b.top-margin&&p.y<=b.bottom+margin;});
    this.pinned=this.content.contains(document.activeElement)||near;
    this.bounds=r;
  }
  request(id,refresh=false){
    if(this.pending.has(id)){if(refresh)this.refreshPending.add(id);return;}
    if(this.cache.has(id)&&!refresh)return;this.pending.add(id);
    this.voices.ask('captions',{id}).then(cues=>{
      this.cache.set(id,cues);while(this.cache.size>12)this.cache.delete(this.cache.keys().next().value);
    }).catch(()=>{}).finally(()=>{this.pending.delete(id);if(this.refreshPending.delete(id))this.request(id,true);});
  }
  current({clip,video,time,cues:preparedCues}){
    if(!clip||!video||video.readyState<2)return null;
    const id=this.voices.key(clip),cues=preparedCues||this.cache.get(id);
    if(!cues){this.request(id);return null;}
    const t=(time??video.currentTime)+(preparedCues?0:.28);let lo=0,hi=cues.length;
    while(lo<hi){const mid=(lo+hi)>>1;if(cues[mid].start<=t)lo=mid+1;else hi=mid;}
    const cue=cues[lo-1];if(!cue)return null;
    return {id,time:t,start:cue.start,end:cue.end,text:cue.lines.flat().map(word=>word.text).join(' ').replace(/\s+/g,' ').trim()};
  }
  renderLines(target,lines){
    for(const {line,previous}of lines){const row=document.createElement('span');row.className='caption-line'+(previous?' caption-context':'');
      for(const [i,w]of line.entries()){if(i)row.append(' ');const b=document.createElement('button');b.type='button';b.textContent=w.text;b.title='Explore “'+w.text+'” in other films';b.dataset.start=w.start;row.append(b);}target.append(row);}
  }
  update({clip,video,frame,camera,canvas,width,height,visible,time,cues:preparedCues}){
    video?.nativeCaptions?.(false);
    if(!this.enabled||!visible||!clip||!video||video.readyState<2){this.hide();return;}
    const id=this.voices.key(clip);if(!preparedCues&&!this.cache.has(id)){this.request(id);this.hide();return;}
    const cues=preparedCues||this.cache.get(id),t=(time??video.currentTime)+(preparedCues?0:.28);let lo=0,hi=cues.length;
    // Retain the latest speech through a pause, and roll recent lines upwards
    // only when a new phrase starts. Seeking still resolves directly by time.
    while(lo<hi){const mid=(lo+hi)>>1;if(cues[mid].start<=t)lo=mid+1;else hi=mid;}
    const index=lo-1,cue=cues[index];if(!cue){this.hide();return;}
    // Hold the words being pointed at, but keep new speech visible above them.
    // Freezing interaction targets must never freeze the live caption stream.
    if(this.pinned&&this.currentId===id&&this.currentCue!==cue){
      if(!this.liveElement){this.liveElement=document.createElement('div');this.liveElement.className='caption-live';Object.assign(this.liveElement.style,{position:'absolute',bottom:'100%',left:'0',width:'100%'});this.content.append(this.liveElement);}
      if(this.liveCue!==cue){this.liveCue=cue;this.liveElement.replaceChildren();this.renderLines(this.liveElement,cue.lines.map(line=>({line,previous:false})));}
      return;
    }
    if(this.liveElement){this.liveElement.remove();this.liveElement=null;this.liveCue=null;}
    if(this.currentId!==id||this.currentCue!==cue){
      this.currentId=id;this.currentCue=cue;this.content.replaceChildren();
      const context=[];for(let i=index-1;i>=0&&context.length<2;i--)context.unshift(...cues[i].lines);
      const lines=[...context.slice(-2).map(line=>({line,previous:true})),...cue.lines.map(line=>({line,previous:false}))];
      this.renderLines(this.content,lines);
    }
    this.element.style.left='50%';this.element.style.top='auto';this.element.style.bottom=(ViewerControls.shown?64:16)+'px';this.element.style.width='92%';this.element.style.fontSize='22px';this.element.hidden=false;
    // Hit testing runs once at the beginning of the animation frame, before
    // FilmControls writes the transformed overlay. Reading layout here again
    // forced a synchronous layout flush for the same pointer every frame.
  }
};
