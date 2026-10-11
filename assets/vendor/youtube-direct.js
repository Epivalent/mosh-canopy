/* Native YouTube players bridged by the user's extension. No media proxy URLs. */
window.YouTubeDirect=class YouTubeDirect{
 // Use the foreground seek deadline for a completely silent bridge. This is
 // failure detection, not a player-count/age limit: buffering and paused films
 // still send state. Hidden documents are allowed to suspend their timers.
 responseTimeout=25000;
 checkHealth(s){
  if(s.disposed)return;
  if(document.visibilityState==='hidden'){s.healthHidden=true;return;}
  if(s.healthHidden){s.healthHidden=false;s.healthResumedAt=performance.now();}
  if(performance.now()-Math.max(s.lastReply,s.healthResumedAt||0,this.healthVisibleAt||0)<=this.responseTimeout)return;
  if(!s.connected){
   if(s.nativeReady)return; // Native playback does not require frame transfer.
   this.bridgeFailure(s,s.loaded?'The YouTube player loaded, but the Mosh Canopy bridge did not respond. Enable the extension for this site (and allow it in private windows when using one).':'The YouTube iframe has not finished loading.');
   return;
  }
  s.restart();
 }
 // An unanswered extension handshake is a transport failure, not an unavailable
 // film. Keep that document listening so enabling the bridge can recover it.
 bridgeFailure(s,error){if(s.disposed||s.bridgeError===error)return;s.bridgeError=error;s.clip.bridgeError=error;s.clip.loading=false;this.onError?.(s.clip,error);}
 get bridgeUnavailable(){const sessions=[...this.sessions.values()].filter(s=>!s.disposed&&!s.captionsOnly);return sessions.length>0&&sessions.every(s=>!s.connected&&!s.nativeReady&&s.bridgeError);}
 get bridgeError(){return this.bridgeUnavailable?[...this.sessions.values()].find(s=>s.bridgeError)?.bridgeError:null;}
 get startupPending(){return [...this.sessions.values()].some(s=>!s.disposed&&!s.connected&&!s.nativeReady&&!s.bridgeError&&!s.captionsOnly);}
 // Caption failures and individual unavailable films are not provider bans.
 // Only an explicit playback Retry-After delays new playback requests; its
 // deadline comes from the server and expires without user intervention.
 get blocked(){let pause=this.providerPause;try{pause=JSON.parse(localStorage.getItem('mosh-youtube-playback-retry'));}catch{}return pause?.retryAt>Date.now()?pause:null;}
 set blocked(value){this.providerPause=value;try{if(value)localStorage.setItem('mosh-youtube-playback-retry',JSON.stringify(value));else localStorage.removeItem('mosh-youtube-playback-retry');}catch{}}
 get retryDelay(){return Math.max(0,(this.blocked?.retryAt||0)-Date.now());}
 deferRetry(s,error){
  // Binary exponential backoff, based on the observed failed startup cost.
  // This belongs to the failed film, not the whole provider: an unavailable
  // upload must never prevent another film from starting. Explicit clicks retry.
  const clip=s.clip;
  clip.retryFailures=(clip.retryFailures||0)+1;
  clip.retryBase=Math.max(clip.retryBase||0,performance.now()-s.createdAt);
  clip.retryAt=performance.now()+clip.retryBase*2**clip.retryFailures;
  // A failed upload is not evidence that every other film is unavailable.
  // Keep playback retries on this film. Background caption collection yields
  // after matching failures, but the net may continue loading other films.
  const last=this.lastRefusal;
  if(last&&last.id!==clip.id&&last.error===error)
   this.providerEvents?.postMessage({type:'playback-backoff',retryAt:Date.now()+Math.max(0,clip.retryAt-performance.now()),error});
  this.lastRefusal={id:clip.id,error,elapsed:clip.retryBase};
 }
 constructor({onMetadata,onCaptions,onPCM,onError,onTransport,hasCaptions}){try{localStorage.removeItem('mosh-youtube-provider-pause');}catch{}Object.assign(this,{onMetadata,onCaptions,onPCM,onError,onTransport,hasCaptions,sessions:new Map(),byWindow:new Map(),disposedWindows:new WeakSet()});document.addEventListener?.('visibilitychange',()=>{if(document.visibilityState==='visible')this.healthVisibleAt=performance.now();});this.providerEvents=typeof BroadcastChannel!=='undefined'?new BroadcastChannel('mosh-youtube-provider-status'):null;this.dock=document.createElement('div');this.dock.id='youtubeDirectDock';Object.assign(this.dock.style,{display:'contents'});document.body.prepend(this.dock);addEventListener('message',e=>this.receive(e));}
 prepareCaptions(s){
  if(s.captionLookup){s.captionLookup.then(()=>{if(!s.disposed&&!s.cachedCaptions&&s.connected)s.command('captions',{enabled:true});});return;}
  const token=s.token;
  // Playback and frame transfer never wait for transcript storage. Only ask
  // YouTube for missing text, rather than reacquiring the same complete track.
  s.captionLookup=Promise.resolve().then(()=>this.hasCaptions?.(s.clip)).catch(error=>{s.captionCacheError=error.message;return false;}).then(cached=>{
   if(s.disposed||s.token!==token)return;
   s.cachedCaptions=!!cached;
   if(cached){s.clip.retro.captionStatus='available';this.onMetadata?.(s.clip,{captionStatus:'available'});}
   else s.command('captions',{enabled:true});
  });
 }
 syncSpeech(s){
  // Desired capture may precede both the extension handshake and the media
  // element. Only mark a command sent after its receiving path exists.
  if(!s.connected||s.disposed||s.speech&&s.ready<1)return;
  if(s.pcmSent===!!s.speech&&s.pcmForeground===!!s.speechForeground)return;
  s.pcmSent=!!s.speech;s.pcmForeground=!!s.speechForeground;s.command('pcm',{enabled:!!s.speech,volume:s.volume,pan:s.pan,foreground:s.pcmForeground});
 }
 disposeSession(s){const {canvas,frame,command,clip}=s;if(s.disposed)return;clearInterval(s.timer);command('dispose');s.disposed=true;
   if(s.fade){s.fade.resolve(false);s.fade=null;}
   window.YouTubeNative?.cancelAudio(s);
   if(s.volumeAnimation)cancelAnimationFrame(s.volumeAnimation);
   const source=frame.contentWindow;
   s.detach=()=>{if(s.detached)return;s.detached=true;s.nativeDisposing=false;if(s.disposeTimer)clearTimeout(s.disposeTimer);if(source){this.byWindow.delete(source);this.disposedWindows.add(source);}s.api?.destroy();frame?.remove();s.frame=null;};
   // postMessage is asynchronous. Keep the document until its media and audio
   // owners actually close; removing it immediately can discard that message.
   if(s.audioDisposeAck&&s.playerDisposeAck){s.disposeWaiting=new Set(['audio','player']);s.disposeTimer=setTimeout(s.detach,this.responseTimeout);}
   else if(!s.connected&&s.api&&window.YouTubeNative?.park)window.YouTubeNative.park(this,s);
   else s.detach();
   s.ready=0;s.decoded=false;
   if(this.sessions.get(clip.id)===s)this.sessions.delete(clip.id);
   canvas.width=canvas.height=0;canvas.remove();
  }
 create(clip,{captionsOnly=false}={}){
  if(this.sessions.has(clip.id))return this.sessions.get(clip.id).canvas;
  const recycled=!this.frameTransfer?this.nativeIdle?.pop():null;
  let frame=recycled?.frame||document.createElement('iframe');const canvas=document.createElement('canvas'),token=crypto.randomUUID();
  frame.allow='autoplay; encrypted-media';frame.title=clip.name;frame.width=480;frame.height=360;Object.assign(frame.style,{display:'',position:'absolute',inset:'0',border:'0',zIndex:'-1',width:'480px',height:'360px',transform:'none',pointerEvents:'none'});
  // The native player obtains usable caption metadata after playback starts.
  // Caption jobs stay muted, transfer no frames, and dispose as soon as CC arrives.
  const params=new URLSearchParams({enablejsapi:'1',origin:location.origin,autoplay:'1',mute:'1',playsinline:'1',controls:'0',fs:'0',rel:'0',iv_load_policy:'3',disablekb:'1',cc_load_policy:'0',start:String(Math.floor(clip.videoPlayhead||0))});
  if(!recycled){frame.src='https://www.youtube.com/embed/'+clip.retro.youtubeId+'?'+params;this.dock.append(frame);}
  const s={clip,frame,canvas,token,captionsOnly,connected:false,metadata:false,decoded:false,createdAt:performance.now(),lastReply:performance.now(),time:clip.videoPlayhead||0,at:performance.now(),paused:true,duration:clip.retro.duration||0,seeking:false,ended:false,ready:0,errors:0,volume:0,pan:0};this.sessions.set(clip.id,s);this.byWindow.set(frame.contentWindow,s);
  s.loaded=!!recycled;
  const command=(command,args={})=>{if(s.loaded&&s.connected&&!s.disposed)frame.contentWindow?.postMessage({type:'mosh-youtube-command',token:s.token,command,...args},'https://www.youtube.com');else window.YouTubeNative?.command(s,command,args);};s.command=command;canvas.youtubeDirect=true;canvas.dataset.filmOffset='0';canvas.setAttribute('src','https://www.youtube.com/embed/'+clip.retro.youtubeId);canvas.muted=true;canvas.loop=false;
  Object.defineProperties(canvas,{currentTime:{get:()=>s.seeking?s.seekTarget:s.time+(s.paused||s.ended||s.ready<3?0:(performance.now()-s.at)/1000*(s.rate||1)),set:time=>{s.seeking=true;s.seekTarget=time;s.seekSent=performance.now();s.seekId=(s.seekId||0)+1;canvas.consumeFrame?.();command('seek',{time,seekId:s.seekId});}},lastSeekTarget:{get:()=>s.completedSeekTarget},duration:{get:()=>s.duration},frameVersion:{get:()=>s.frameVersion||0},nativeOnly:{get:()=>!s.decoded},readyState:{get:()=>s.decoded||s.nativeReady?s.ready:0},paused:{get:()=>s.paused},ended:{get:()=>s.ended},seeking:{get:()=>s.seeking},videoWidth:{get:()=>canvas.width},videoHeight:{get:()=>canvas.height}});
  canvas.presentNative=overlay=>window.YouTubeNative?.present(s,overlay);
  Object.defineProperty(canvas,'nativeHovered',{get:()=>!!s.nativeHovered});
  frame.onpointerenter=()=>{s.nativeHovered=true;};frame.onpointerleave=()=>{s.nativeHovered=false;};
  canvas.play=async()=>{command('play');};canvas.pause=()=>command('pause');canvas.load=()=>{};
  canvas.checkHealth=()=>this.checkHealth(s);
  s.restart=()=>{
   // Keep the consumer's canvas and film identity, replace only its dead embed
   // document. Resume the last received media locus, never a phantom clock.
   const target=s.seeking?s.seekTarget:s.time;
   command('dispose');if(s.fade){s.fade.resolve(false);s.fade=null;}
   Object.assign(s,{token:crypto.randomUUID(),loaded:false,connected:false,initialized:false,metadata:false,decoded:false,ready:0,awaitingConsumption:false,captionLookup:null,pcmSent:undefined,lastReply:performance.now(),restartTarget:target,resumePaused:s.paused});
   clip.loading=true;clip.ready=false;s.restarts=(s.restarts||0)+1;
   const url=new URL(frame.src);url.searchParams.set('start',String(Math.floor(target)));frame.src=url.href;canvas.setAttribute('src',frame.src);
  };
  // The bridge owns one in-flight frame. Return its credit only after an atlas
  // or viewing-frame consumer uses it, so unseen frames are never copied merely
  // to overwrite each other. The consumer's cadence determines transfer rate.
  canvas.requestFrame=()=>{if(!s.consumerCapture||s.capturePending||s.awaitingConsumption||s.disposed)return;s.capturePending=true;command('sample-frame');};
  canvas.consumeFrame=()=>{if(s.awaitingConsumption){s.awaitingConsumption=false;command('ack');canvas.requestFrame();}};
  canvas.setAudio=(volume,pan=0,tau=.45)=>{if(!s.fade&&s.audio?.state==='running'&&s.audio.routed!==false&&Math.abs(volume-s.volume)<.002&&Math.abs(pan-s.pan)<.025)return;if(s.fade){s.fade.resolve(false);s.fade=null;}s.volume=volume;s.pan=pan;command('audio',{volume,pan,tau});};
  canvas.fadeAudio=duration=>{if(s.fade)s.fade.resolve(false);const fadeId=crypto.randomUUID();return new Promise(resolve=>{
   let timer;s.fade={fadeId,resolve:done=>{clearTimeout(timer);resolve(done);}};s.volume=0;
   if(!s.connected){window.YouTubeNative?.command(s,'audio',{volume:0,pan:s.pan,tau:duration,done:done=>{if(s.fade?.fadeId===fadeId){s.fade=null;resolve(done);}}});}
   else if(s.audioFades)command('audio',{volume:0,pan:s.pan,tau:duration,fadeId});
   else{
    // Compatibility with already installed 0.1.2: retain its existing four-second
    // cleanup policy until the extension is updated. Never wait for an event an
    // older bridge cannot send. New bridges use actual audio-clock completion.
    command('audio',{volume:0,pan:s.pan,tau:duration});timer=setTimeout(()=>{if(s.fade?.fadeId===fadeId){s.fade=null;resolve(true);}},4000);
   }
  });};
  Object.defineProperty(canvas,'speechAvailable',{get:()=>s.connected});
  canvas.captureSpeech=(enabled,{foreground=false}={})=>{s.speech=!!enabled;s.speechForeground=foreground;this.syncSpeech(s);return s.connected;};
  canvas.nativeCaptions=enabled=>{s.nativeCCEnabled=enabled;window.YouTubeNative?.captions(s);};
  canvas.dispose=()=>this.disposeSession(s);
  // The initial about:blank document still has the app's origin. Wait for the
  // embed document before sending any messages addressed to YouTube.
  const handshake=()=>{if(s.disposed)return;
   window.YouTubeNative?.update(this,s);this.checkHealth(s);if(!s.loaded)return;if(!s.connected)frame.contentWindow?.postMessage({type:'mosh-youtube-connect'},'https://www.youtube.com');else if(!s.metadata)command('init',{frames:!captionsOnly,captions:false});};frame.onload=()=>{s.loaded=true;handshake();};s.timer=setInterval(handshake,1000);
  void window.YouTubeNative?.attach(this,s,recycled);
  return canvas;
 }
 receive(e){if(e.origin!=='https://www.youtube.com')return;const d=e.data;
  if(!['mosh-youtube','mosh-youtube-extension-ready','mosh-youtube-bridge-error'].includes(d?.type))return;
  const s=this.byWindow.get(e.source);
  if(!s){if(d?.event==='frame'&&this.disposedWindows.has(e.source))d.frame?.close();return;}
  if(s.disposed){if(d?.event==='frame')d.frame?.close();if(d.token===s.token&&d.event==='disposed'){s.disposeWaiting?.delete(d.component);if(s.disposeWaiting?.size===0)s.detach();}return;}
  if(d?.type==='mosh-youtube-extension-ready'){this.frameTransfer=true;s.connected=true;s.lastReply=performance.now();s.bridgeError=null;s.clip.bridgeError=null;s.clip.lastMediaError=null;s.audioFades=!!d.audioFades;s.audioDisposeAck=!!d.disposeAcknowledgement;s.command('init',{frames:!s.captionsOnly,captions:false});this.onMetadata?.(s.clip,{bridgeConnected:true});return;}
  if(d?.type==='mosh-youtube-bridge-error'){this.bridgeFailure(s,d.error);return;}
  if(d?.type!=='mosh-youtube'||d.token!==s.token){if(d?.event==='frame')d.frame?.close();return;}
  s.lastReply=performance.now();
  const c=s.canvas,clip=s.clip;
  if(d.event==='audio-faded'&&s.fade?.fadeId===d.fadeId){s.fade.resolve(true);s.fade=null;}
  if(d.event==='connected'){s.initialized=true;s.frameCredit=!!d.frameCredit;s.seekAcknowledgement=!!d.seekAcknowledgement;s.playerDisposeAck=!!d.disposeAcknowledgement;
   s.consumerCapture=!!d.consumerCaptureClock;s.capturePending=false;
   if(s.consumerCapture){s.command('capture-clock',{mode:'consumer'});c.requestFrame();}
   this.prepareCaptions(s);
   s.pcmSent=undefined;this.syncSpeech(s);s.command('audio',{volume:s.volume,pan:s.pan});
   if(s.restartTarget!==undefined){
    c.currentTime=s.restartTarget;s.restartTarget=undefined;
    if(s.resumePaused)s.command('pause');
   }
  }
  if(d.event==='metadata'){s.metadata=true;s.duration=d.duration||s.duration;Object.assign(clip.retro,d);if(s.cachedCaptions)clip.retro.captionStatus='available';clip.name=[d.title,clip.retro.year||''].filter(Boolean).join(' · ');clip.duration=s.duration;c.dispatchEvent(new Event('loadedmetadata'));this.onMetadata?.(clip,d);}
  if(d.event==='state'){
   const wasPaused=s.paused,wasEnded=s.ended,wasSeeking=s.seeking;
   s.time=d.time;s.at=performance.now();s.rate=d.rate||1;s.hasMediaClock=true;s.duration=d.duration||s.duration;s.paused=d.paused;s.ended=d.ended;s.ready=d.ready;
   this.syncSpeech(s);
   if(wasSeeking){if(performance.now()-s.seekSent>20000){s.seeking=false;this.onError?.(clip,'YouTube seek timed out');}}
   if(wasPaused&&!s.paused)c.dispatchEvent(new Event('playing'));if(!wasPaused&&s.paused)c.dispatchEvent(new Event('pause'));if(!wasEnded&&s.ended){clip.videoDone=true;c.dispatchEvent(new Event('ended'));}
  }
  if(d.event==='frame-idle')s.capturePending=false;
  if(d.event==='frame'){
   s.capturePending=false;
   if(!s.decoded){clip.retryFailures=0;clip.retryBase=0;clip.retryAt=0;this.lastRefusal=null;this.refusalRun=0;this.retryAt=0;}
   s.frameVersion=(s.frameVersion||0)+1;
   try{if(c.width!==d.width||c.height!==d.height){c.width=d.width;c.height=d.height;}c.getContext('2d').drawImage(d.frame,0,0);if(!s.hasMediaClock||s.seeking){s.time=d.time;s.at=performance.now();}s.ready=4;if(s.seeking&&(s.seekAcknowledgement?d.seekId===s.seekId:Math.abs(d.time-s.seekTarget)<.12)){s.seeking=false;s.completedSeekTarget=s.seekTarget;c.dispatchEvent(new Event('seeked'));}if(!s.decoded){s.decoded=true;s.firstFrameAt=performance.now();clip.startupMs=s.firstFrameAt-s.createdAt;clip.ready=true;clip.loading=false;clip.broken=false;clip.visualReady=true;c.dispatchEvent(new Event('loadeddata'));c.dispatchEvent(new Event('canplay'));}}
   finally{d.frame.close();s.awaitingConsumption=true;if(s.seeking)c.consumeFrame();}
  }
  if(d.event==='captions'){s.captions=true;this.onCaptions?.(clip,d.data,d.language);}
  if(d.event==='caption-transport'){
   if(d.scope==='playback'&&d.retryAfterMs>0)this.blocked={...d,retryAt:Date.now()+d.retryAfterMs};
   if(d.scope==='captions'){clip.retro.captionError=d.error;if(!s.cachedCaptions){clip.retro.captionStatus='failed';this.onMetadata?.(clip,{captionStatus:'failed',captionError:d.error});}}
   this.onTransport?.(clip,d);
  }
  if(d.event==='pcm')this.onPCM?.(clip,d);
  if(d.event==='audio-status'){s.audio=clip.speechState={state:d.state,rate:d.rate,routed:d.routed};if(d.state==='running')clip.speechError=null;}
  if(d.event==='warning'){s.warning=d.error;clip.speechError=d.component==='audio'?d.error:clip.speechError;}
  if(d.event==='caption-status'){clip.retro.captionStatus=d.status;this.onMetadata?.(clip,{captionStatus:d.status});}
  if(d.event==='error'){
   s.errors++;
   if(!d.error.startsWith('Frame transfer:')){
    const temporary=d.temporary||/try again later|temporarily unavailable/i.test([d.detail,d.error].join(' '));
    if(temporary)this.deferRetry(s,d.detail||d.error);
    clip.broken=!temporary;clip.loading=false;clip.ready=false;
    if(clip.player===c)clip.player=null;
    c.dispatchEvent(new Event('error'));c.dispose();
   }
   this.onError?.(clip,d.detail||d.error);
  }
 }
};
