window.FilmControls=class FilmControls{
 constructor({toggle,seek,volume,scrubStart,scrubEnd}){Object.assign(this,{toggle,seek,volume,scrubStart,scrubEnd,pointer:{x:-1,y:-1}});this.element=document.createElement('div');this.element.id='filmControls';this.element.hidden=true;this.element.setAttribute('aria-label','Film playback controls');
  this.element.innerHTML='<button type="button" aria-label="Pause film">Pause</button><span class="film-time">0:00 / 0:00</span><input class="film-seek" type="range" min="0" max="1" step="0.1" value="0" aria-label="Seek in full film"><label>Volume <input class="film-volume" type="range" min="0" max="1" step="0.01" value="1" aria-label="Viewing film volume"></label>';
  this.overlay=document.createElement('div');this.overlay.id='filmOverlay';this.overlay.hidden=true;this.overlay.append(this.element,document.getElementById('clipCaptions'));document.body.append(this.overlay);
  this.matrix=new THREE.Matrix4();this.local=new THREE.Matrix4();this.width=1280;
this.play=this.element.querySelector('button');this.time=this.element.querySelector('span');this.scrub=this.element.querySelector('.film-seek');this.level=this.element.querySelector('.film-volume');
  this.play.onclick=()=>this.toggle();
  const begin=()=>{if(!this.scrubbing){this.scrubbing=true;this.committed=undefined;this.requested=+this.scrub.value;this.scrubStart?.();}};
  this.scrub.onpointerdown=e=>{begin();this.scrub.setPointerCapture(e.pointerId);};
  this.scrub.oninput=()=>{begin();this.requested=+this.scrub.value;this.time.textContent=this.format(this.requested)+' / '+this.format(+this.scrub.max);clearTimeout(this.seekTimer);this.seekTimer=setTimeout(()=>this.commitSeek(false),90);};
  this.scrub.onchange=()=>{this.requested=+this.scrub.value;this.commitSeek(true);};
  this.scrub.onpointerup=()=>{if(this.scrubbing)this.commitSeek(true);};
  this.scrub.onpointercancel=()=>this.commitSeek(true);
  this.scrub.onblur=()=>{if(this.scrubbing)this.commitSeek(true);};
  this.level.oninput=()=>this.volume(+this.level.value);
  document.addEventListener('pointermove',e=>{this.pointer={x:e.clientX,y:e.clientY};},{passive:true});
  for(const name of ['pointerdown','pointerup','pointermove','click'])this.element.addEventListener(name,e=>e.stopPropagation());this.element.addEventListener('keydown',e=>e.stopPropagation());this.element.addEventListener('wheel',e=>e.stopPropagation());
  this.points=Array.from({length:4},()=>new THREE.Vector3());
 }
 async commitSeek(release){
  clearTimeout(this.seekTimer);this.releaseRequested=this.releaseRequested||release;
  if(this.requested===undefined)return;if(this.seeking)return;
  this.seeking=true;this.pendingSeek=true;
  try{while(this.committed!==this.requested){const target=this.requested;await this.seek(target);this.committed=target;}}
  finally{this.seeking=false;this.pendingSeek=false;if(this.releaseRequested){this.releaseRequested=false;this.scrubbing=false;this.scrubEnd?.();}}
 }

 format(t){t=Math.max(0,Math.floor(t||0));return(t>=3600?Math.floor(t/3600)+':':'')+String(Math.floor(t/60)%60).padStart(t>=3600?2:1,'0')+':'+String(t%60).padStart(2,'0');}
 update({clip,video,frame,camera,canvas,width,height,visible,time,duration,loading=false,paused,volume}){
  window.DreamFilm?.setView({clip,video,visible:visible&&!loading});
  if(this.nativeVideo&&(this.nativeVideo!==video||!video?.nativeOnly||!visible)){this.nativeVideo.presentNative(null);this.nativeVideo=null;}
  if(!visible||!clip||!video){this.element.hidden=true;this.overlay.hidden=true;this.shown=false;return;}
  const r=canvas.getBoundingClientRect(),W=this.width,H=W*height/width;frame.updateWorldMatrix(true,false);camera.updateMatrixWorld();
  this.local.set(width/W,0,0,-width/2, 0,-height/H,0,height/2, 0,0,1,0, 0,0,0,1);
  this.matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).multiply(frame.matrixWorld).multiply(this.local);
  const m=this.matrix.elements,css=new Array(16).fill(0);for(let col=0;col<4;col++){css[col*4]=r.width*.5*m[col*4]+(r.left+r.width*.5)*m[col*4+3];css[col*4+1]=-r.height*.5*m[col*4+1]+(r.top+r.height*.5)*m[col*4+3];css[col*4+3]=m[col*4+3];}
  css[10]=1;this.overlay.style.width=W+'px';this.overlay.style.height=H+'px';this.overlay.style.transform='matrix3d('+css.join(',')+')';this.overlay.hidden=false;
  let inside=false;const polygon=[];for(let i=0;i<4;i++){const ix=[0,1,3,2][i],p=this.points[i].set((ix&1?1:-1)*width/2,(ix&2?-1:1)*height/2,0);p.applyMatrix4(frame.matrixWorld).project(camera);if(p.z<-1||p.z>1){this.overlay.hidden=true;return;}polygon.push({x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2});}
  const point=this.pointer;for(let i=0,j=3;i<4;j=i++){const a=polygon[i],b=polygon[j];if((a.y>point.y)!==(b.y>point.y)&&point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x)inside=!inside;}
  const show=inside||video.nativeHovered||this.element.contains(document.activeElement)||this.scrubbing;this.shown=show;this.element.hidden=loading||!show;
  const label=(paused??clip.viewPaused)?'Play':'Pause';if(this.play.textContent!==label){this.play.textContent=label;this.play.setAttribute('aria-label',label+' film');}
  if(!this.scrubbing&&!this.pendingSeek){this.scrub.max=duration||video.duration||1;this.scrub.value=time;const label=this.format(time)+' / '+this.format(duration);if(this.time.textContent!==label)this.time.textContent=label;}
  if(document.activeElement!==this.level)this.level.value=volume??clip.viewVolume??1;
  if(video.nativeOnly&&video.presentNative){video.presentNative(this.overlay);this.nativeVideo=video;}
 }
};
