/* A single destination control. Search work stays in the existing workers. */
globalThis.GoNavigation=class {
 constructor({voices,semantic,navigate,localTitles=()=>[],leaveSearch,external=url=>location.assign(url)}){
  Object.assign(this,{voices,semantic,navigate,localTitles,leaveSearch,external,revision:0});
  this.button=document.getElementById('bGo');this.panel=document.getElementById('goPanel');this.input=document.getElementById('goQuery');this.status=document.getElementById('goStatus');
  this.count=document.getElementById('goCount');
  try{const saved=JSON.parse(localStorage.getItem('mosh-go-choice')||'{}');if(Number.isSafeInteger(saved.count)&&saved.count>0)this.count.value=saved.count;}catch{}
  this.count.onchange=()=>{const count=Number(this.count.value);if(Number.isSafeInteger(count)&&count>0)try{localStorage.setItem('mosh-go-choice',JSON.stringify({count}))}catch{}};
  this.button.onclick=()=>this.toggle();document.getElementById('goClose').onclick=()=>this.hide();
  document.getElementById('goForm').onsubmit=e=>{e.preventDefault();void this.go(this.input.value,e.submitter?.value==='random')};
  this.key=e=>{if(e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;
   if(e.key==='Escape'&&!this.panel.hidden){e.preventDefault();e.stopImmediatePropagation();this.hide();this.button.focus();return;}
   if(e.key.toLowerCase()==='g'&&!e.target.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role=textbox]')&&!document.querySelector('dialog[open]')){e.preventDefault();e.stopImmediatePropagation();this.toggle();}
  };addEventListener('keydown',this.key,true);
  for(const type of ['pointerdown','pointermove','wheel'])this.panel.addEventListener(type,e=>e.stopPropagation());
 }
 toggle(){if(this.panel.hidden){this.panel.hidden=false;this.button.setAttribute('aria-expanded','true');this.input.focus();this.input.select();}else this.hide();}
 hide(){this.revision++;this.controller?.abort();this.panel.hidden=true;this.panel.removeAttribute('aria-busy');this.button.setAttribute('aria-expanded','false');}
 async youtubeSearch(query,signal){const r=await fetch('https://mosh-canopy-assets.moshcanopy.workers.dev/youtube/results?search_query='+encodeURIComponent(query)+'&hl=en',{signal});if(!r.ok)throw Error('YouTube search HTTP '+r.status);return GoSearchCore.youtubeResults(await r.text());}
 async go(raw,random=false){
  const query=raw.trim();if(!query)return;this.controller?.abort();const controller=this.controller=new AbortController(),revision=++this.revision,current=()=>revision===this.revision;
  const count=random?Number(this.count.value):1;if(!Number.isSafeInteger(count)||count<1){this.status.textContent='Enter a positive whole number of results.';return;}
  this.panel.setAttribute('aria-busy','true');this.input.blur();const errors=[];
  const attempt=async task=>{try{return await task()}catch(e){if(current()&&e.name!=='AbortError')errors.push(e.message);return null;}};
  const open=async hit=>{if(!current()||!hit)return false;this.status.textContent='Opening '+(hit.title||hit.id)+'…';this.leaveSearch();const ok=await attempt(()=>this.navigate(hit,current).then(()=>true));if(!current())return false;if(ok)this.hide();return ok;};
  const openMatches=async hits=>{for(const hit of GoSearchCore.candidates(hits,random,count)){if(await open(hit))return true;if(!current())return false;}return false;};
  try{
   const direct=GoSearchCore.youtube(query),youtubeOnly=/^yt:\s*/i.test(query),text=youtubeOnly?query.replace(/^yt:\s*/i,''):query;
   if(direct){await open(direct);if(current()){this.status.textContent='Opening this video on YouTube…';this.external('https://www.youtube.com/watch?v='+encodeURIComponent(direct.id.slice(3))+'&t='+direct.start+'s');}return;}
   if(!youtubeOnly){
    this.status.textContent='Finding a title…';
    const title=await attempt(()=>this.voices.ask('go-title',{query,films:this.localTitles(),limit:count}));if(!current())return;if(await openMatches(title?.results||(title?.hit?[title.hit]:[]))||!current())return;
    this.status.textContent='Finding a related theme…';
    const theme=await attempt(()=>this.semantic.ask({type:'go-search',query,limit:count,filters:{},refine:this.semantic.refine.checked}));if(!current())return;
    if(await openMatches((theme?.results||[]).map(h=>h.passage))||!current())return;
    this.status.textContent='Finding spoken words…';
    const words=await attempt(()=>this.voices.ask('go-word',{query,limit:count}));if(!current())return;if(await openMatches(words?.results||(words?.hit?[words.hit]:[]))||!current())return;
   }
   this.status.textContent='Searching YouTube…';const hits=await attempt(()=>this.youtubeSearch(text,controller.signal));if(!current())return;
   if(await openMatches(hits||[]))return;if(!current())return;
   // An unavailable search endpoint or embed still has a usable destination.
   // No empty modal, fabricated match, or automatic retry loop.
   this.status.textContent='Opening YouTube search…';this.external('https://www.youtube.com/results?search_query='+encodeURIComponent(text));
  }finally{if(current()){this.panel.removeAttribute('aria-busy');this.lastErrors=errors;}}
 }
};
