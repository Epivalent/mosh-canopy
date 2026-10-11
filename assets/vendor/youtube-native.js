/* Native embeds are the baseline; the optional bridge adds decoded pixels. */
window.YouTubeNative={
 api(){
  if(window.YT?.Player)return Promise.resolve(window.YT);
  if(this.loading)return this.loading;
  this.loading=new Promise((resolve,reject)=>{
   const previous=window.onYouTubeIframeAPIReady;
   window.onYouTubeIframeAPIReady=()=>{try{previous?.();}finally{resolve(window.YT);}};
   const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';
   script.onerror=()=>{this.loading=null;script.remove();reject(Error('YouTube player API could not load'));};document.head.append(script);
  });return this.loading;
 },
 poster(clip){
  if(clip.posterTask)return clip.posterTask;
  clip.posterTask=new Promise(resolve=>{const image=new Image();image.crossOrigin='anonymous';image.referrerPolicy='no-referrer';
   image.onload=()=>{clip.poster=image;resolve(image);};image.onerror=()=>resolve(null);
   image.src='https://i.ytimg.com/vi/'+encodeURIComponent(clip.retro.youtubeId)+'/hqdefault.jpg';
  });return clip.posterTask;
 },
 async attach(owner,s,recycled){
  const c=s.canvas;c.width=480;c.height=270;
  void this.poster(s.clip).then(image=>{if(image&&!s.disposed&&!s.decoded){c.getContext('2d').drawImage(image,0,0,c.width,c.height);s.frameVersion=(s.frameVersion||0)+1;}});
  if(recycled){
   s.api=recycled.api;s.nativeRoute=recycled.nativeRoute;s.nativeRoute.s=s;s.nativeRoute.owner=owner;s.nativeReady=true;
   s.api.mute();s.api.setVolume(0);s.api.loadVideoById({videoId:s.clip.retro.youtubeId,startSeconds:s.clip.videoPlayhead||0});s.api.playVideo();
   owner.nativePlayback=true;owner.prepareCaptions(s);return;
  }
  try{const YT=await this.api();if(s.disposed)return;
   const route=s.nativeRoute={owner,s};
   s.api=new YT.Player(s.frame,{events:{
    onReady:()=>this.ready(route.owner,route.s),
    onAutoplayBlocked:()=>{route.s.autoplayBlocked=true;},
    onStateChange:()=>this.update(route.owner,route.s),
    onApiChange:()=>this.captions(route.s,true),
    onError:e=>{const {owner,s}=route;if(s.disposed||s.connected)return;owner.receive({origin:'https://www.youtube.com',source:s.frame.contentWindow,data:{type:'mosh-youtube',token:s.token,event:'error',error:'YouTube player error '+e.data,status:'NATIVE_ERROR'}});}
   }});
  }catch(error){s.nativeError=error.message;if(!s.connected)owner.onError?.(s.clip,error.message);}
 },
 ready(owner,s){
  s.nativeReady=true;if(s.disposed){this.park(owner,s);return;}s.clip.bridgeError=null;s.bridgeError=null;s.lastReply=performance.now();
  if(!s.connected){s.api.mute();s.nativeVolumeTarget=undefined;}
  this.update(owner,s);this.captions(s,true);owner.prepareCaptions(s);
  if(s.connected)return;owner.nativePlayback=true;
  // Commands can arrive during API startup. Preserve the latest intent, and
  // start muted until actual playback so an audio update cannot block autoplay.
  const pending=s.nativePending||new Map();s.nativePending=new Map();
  for(const [name,args]of pending)if(name!=='play'&&name!=='pause')this.command(s,name,args);
  this.command(s,pending.has('pause')?'pause':'play',{});
 },
 update(owner,s){
  if(s.disposed||!s.nativeReady||s.connected)return;
  // loadVideoById changes the document asynchronously. Never expose the old
  // film's clock, readiness or duration to the new consumer during that handoff.
  if(s.api.getVideoData&&s.api.getVideoData()?.video_id!==s.clip.retro.youtubeId)return;
  const state=s.api.getPlayerState(),time=s.api.getCurrentTime(),duration=s.api.getDuration(),c=s.canvas;
  const wasReady=s.ready>=2;
  s.lastReply=performance.now();s.time=time;s.at=performance.now();s.duration=duration||s.duration;
  // Buffering is still a play request in progress, just as for HTMLVideoElement.
  // Calling it paused makes every audio/visual tick send another playVideo().
  s.paused=state===2||state===5||state===-1;s.ended=state===0;
  if(state===1||state===2||state===0)s.nativeHasFrame=true;
  // BUFFERING also occurs before YouTube has supplied any media at all.
  s.ready=state===1||state===2||state===0?4:state===3&&s.nativeHasFrame?2:1;
  if(s.nativeCaptionFilm!==(s.clip.retro?.youtubeId||s.clip.id)||s.nativeCaptionState!==state){
   s.nativeCaptionFilm=s.clip.retro?.youtubeId||s.clip.id;s.nativeCaptionState=state;this.captions(s,true);
  }
  if(state===1){s.autoplayBlocked=false;const audio=s.nativePending?.get('audio');if(audio){s.nativePending.delete('audio');this.command(s,'audio',audio);}}
  if(s.seeking&&s.ready>=2&&state!==3&&Math.abs(time-s.seekTarget)<1){s.seeking=false;s.completedSeekTarget=s.seekTarget;c.dispatchEvent(new Event('seeked'));}
  if(duration&&!s.metadata){s.metadata=true;s.clip.duration=duration;c.dispatchEvent(new Event('loadedmetadata'));owner.onMetadata?.(s.clip,{duration});}
  if(!wasReady&&s.ready>=2){s.clip.ready=true;s.clip.loading=false;s.clip.broken=false;c.dispatchEvent(new Event('loadeddata'));c.dispatchEvent(new Event('canplay'));}
  if(s.ended&&!s.clip.videoDone){s.clip.videoDone=true;c.dispatchEvent(new Event('ended'));}
 },
 command(s,name,args){
  if(s.disposed)return;
  if(!s.nativeReady||name==='audio'&&!s.nativeHasFrame){
   s.nativePending??=new Map();if(name==='play')s.nativePending.delete('pause');if(name==='pause')s.nativePending.delete('play');s.nativePending.set(name,args);return;
  }
  if(name==='play')s.api.playVideo();
  else if(name==='pause')s.api.pauseVideo();
  else if(name==='seek')s.api.seekTo(args.time,true);
  else if(name==='captions'){s.nativeCaptionsWanted=args.enabled!==false;this.captions(s);}
  else if(name==='audio')this.audio(s,args);
 },
 park(owner,s){
  this.cancelAudio(s);
  // Native iframe destruction was reproducibly stopping a different player's
  // audio clock in Brave. Keep its API/document and reuse it for the next film.
  // Capacity follows simultaneous consumers, not a film count or an age limit.
  Object.assign(s.frame.style,{position:'absolute',inset:'0',width:'480px',height:'360px',transform:'none',zIndex:'-1',pointerEvents:'none'});owner.byWindow.delete(s.frame.contentWindow);
  if(!s.nativeReady||!s.api)return; // onReady parks a released startup later.
  s.api.mute();s.api.pauseVideo();
  owner.nativeIdle??=[];if(!owner.nativeIdle.includes(s))owner.nativeIdle.push(s);
 },
 cancelAudio(s){
  clearTimeout(s.volumeTimer);s.volumeTimer=null;
  if(s.volumeFade){const fade=s.volumeFade;s.volumeFade=null;fade.done?.(false);}
 },
 audio(s,args){
  const target=Math.max(0,Math.min(1,args.volume)),percent=Math.round(target*100);
  if(!args.done&&s.nativeVolumeTarget===target){
   if(s.volumeFade)return;
   if(Math.round(s.api.getVolume())===percent&&s.api.isMuted()===(percent===0))return;
  }
  // Keep the envelope continuous when moving through the net changes its target.
  const now=performance.now(),old=s.volumeFade;
  const start=old?old.target+(old.start-old.target)*Math.exp(-(now-old.at)/old.tau):s.api.isMuted()?0:(s.api.getVolume()||0)/100;
  this.cancelAudio(s);s.nativeVolumeTarget=target;
  s.volumeFade={start,target,at:now,tau:Math.max(0,args.tau||0)*1000,done:args.done};
  this.advanceAudio(s);
 },
 advanceAudio(s){
  const fade=s.volumeFade;if(!fade||s.disposed||s.connected)return;
  const {start,target,at,tau}=fade;
  const value=tau?target+(start-target)*Math.exp(-(performance.now()-at)/tau):target;
  // The native API resolves volume to integer percentages. Schedule the next
  // audible change, rather than tying audio to a visible tab's animation loop.
  const finished=Math.abs(value-target)<.005,percent=Math.round((finished?target:value)*100);
  if(s.sentVolume!==percent||Math.round(s.api.getVolume())!==percent){s.api.setVolume(percent);s.sentVolume=percent;}
  if(percent>0){if(s.api.isMuted())s.api.unMute();}else if(!s.api.isMuted())s.api.mute();
  if(finished){s.volumeFade=null;s.volumeTimer=null;fade.done?.(true);return;}
  const direction=Math.sign(target-value),boundary=(percent+direction*.5)/100;
  const toBoundary=(boundary-target)/(value-target);
  const toFinish=.005/Math.abs(value-target);
  const delay=-tau*Math.log(Math.max(toBoundary,toFinish));
  // setTimeout's unit is one millisecond; a rounded boundary may be immediate.
  s.volumeTimer=setTimeout(()=>{s.volumeTimer=null;this.advanceAudio(s);},Math.max(1,Math.ceil(delay)));
 },

 captions(s,refresh=false){
  if(!s.nativeReady||s.disposed||s.connected)return;
  // Captions belong to Mosh Canopy's timed, clickable transcript layer.
  // YouTube restores caption display on loadVideoById and buffering transitions,
  // even when an earlier unload succeeded. Reconcile on actual film/state changes.
  if(!refresh&&s.nativeCaptionModule===false)return;s.nativeCaptionModule=false;
  if(!s.api.getOptions||s.api.getOptions().includes('captions'))s.api.unloadModule?.('captions');
 },

 present(s,overlay){
  if(s.disposed)return;
  if(overlay&&!s.decoded){Object.assign(s.frame.style,{position:'fixed',inset:'auto',left:'0',top:'0',width:overlay.style.width,height:overlay.style.height,transform:overlay.style.transform,transformOrigin:'0 0',zIndex:'2',pointerEvents:s.autoplayBlocked||s.ready<2?'auto':'none'});s.presented=true;}
  else if(s.presented){Object.assign(s.frame.style,{position:'absolute',inset:'0',width:'480px',height:'360px',transform:'none',zIndex:'-1',pointerEvents:'none'});s.presented=false;}
  this.captions(s);
 }
};
