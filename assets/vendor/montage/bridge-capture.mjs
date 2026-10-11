// Selected-interval capture using the existing bridge protocol. No signed
// media URLs, media relay, extra extension permission, or whole-film download.
// The existing speech PCM tap is mono; only selected passages are retained.
import {measureLevels} from './levels.mjs';
export function capturePassage(clip,{container=document.body,signal,onProgress=()=>{}}={}){
 return new Promise((resolve,reject)=>{
  signal?.throwIfAborted();
  const started=performance.now(),token=crypto.randomUUID(),frame=document.createElement('iframe');
  const preroll=Math.max(0,Math.min(clip.before?.[0]?.start??clip.start,clip.start-1)); // One existing foreground PCM window warms the tap.
  frame.allow='autoplay; encrypted-media';frame.width=480;frame.height=270;frame.title=clip.title;
  Object.assign(frame.style,{width:'100%',height:'200px',border:'0',pointerEvents:'none',visibility:'visible'});
  const params=new URLSearchParams({enablejsapi:'1',autoplay:'1',mute:'1',playsinline:'1',origin:location.origin,start:String(Math.floor(preroll)),controls:'0'});
  let connected=false,disposed=false,settled=false,phase='connecting',lastProgress=performance.now(),time=-1,rate,plane,filled,covered=0,pcmEpoch;
  let firstFrame,afterEnd=false,frames=[],stats={preroll,pcmWindows:0,framesReceived:0,mono:true},audioReady=false,seekIssued=false,warmEpoch;
  const send=(command,args={})=>frame.contentWindow?.postMessage({type:'mosh-youtube-command',token,command,...args},'https://www.youtube.com');
  const progress=message=>{lastProgress=performance.now();onProgress(message);};
  let outcome;
  const detach=()=>{if(disposed)return;disposed=true;clearInterval(timer);clearTimeout(disposeTimer);removeEventListener('message',receive);signal?.removeEventListener('abort',abort);frame.remove();if(outcome?.error)reject(outcome.error);else if(outcome)resolve(outcome.value);};
  let disposeTimer;
  const dispose=()=>{clearInterval(timer);if(!connected){detach();return;}send('dispose');disposeTimer=setTimeout(detach,25000);}; // Match the bridge response deadline; acknowledgements usually dispose immediately.
  const components=new Set();
  const fail=e=>{if(settled)return;settled=true;for(const f of frames)f.bitmap.close();frames=[];firstFrame?.bitmap.close();clearInterval(timer);outcome={error:e};dispose();};
  const abort=()=>{const error=signal.reason||new DOMException('Cancelled','AbortError');if(settled&&outcome?.value){for(const f of frames)f.bitmap.close();frames=[];outcome={error};}else fail(error);};
  const finish=()=>{
   if(settled||!plane||covered!==plane.length||!afterEnd||!frames.length)return;
   settled=true;firstFrame?.bitmap.close();firstFrame=null;clearInterval(timer);send('pause');
   outcome={value:{start:clip.start,end:clip.end,rate,planes:[plane],frames,covered,levels:measureLevels([plane],rate),decodeMs:performance.now()-started,media:{source:'youtube-bridge',mono:true},stats}};dispose();
  };
  const receive=e=>{
   if(e.source!==frame.contentWindow||e.origin!=='https://www.youtube.com')return;const d=e.data;
   if(d?.type==='mosh-youtube-extension-ready'){if(!connected){connected=true;progress('Bridge connected; warming audio capture');send('init',{frames:true,captions:false});}return;}
   if(d?.type==='mosh-youtube-bridge-error'){fail(Error(d.error));return;}
   if(d?.type!=='mosh-youtube'||d.token!==token)return;
   if(d.event==='disposed'){components.add(d.component);if(components.has('audio')&&components.has('player'))detach();return;}
   if(settled){d.frame?.close();return;}
   if(d.event==='error'){fail(Error(d.detail||d.error));return;}
   if(d.event==='warning'&&d.component==='audio'){fail(Error(d.error));return;}
   if(d.event==='state'){
    if(d.time!==time){time=d.time;if(phase==='capturing'&&time<clip.end)lastProgress=performance.now();}
    if(d.ready>=2&&!audioReady){audioReady=true;send('audio',{volume:0,pan:0});send('pcm',{enabled:true,volume:0,pan:0,foreground:true});send('play');phase='warming';}
    if(d.ended){afterEnd=true;finish();if(!settled)fail(Error('Film ended before the entire passage was captured'));}return;
   }
   if(d.event==='frame'){
    stats.framesReceived++;
    if(seekIssued&&d.seekId===1&&phase==='seeking'){phase='capturing';progress('Capturing the selected passage');}
    if(phase==='capturing'){
     const time=d.time-clip.start,bitmap=d.frame;
     if(time<=0){firstFrame?.bitmap.close();firstFrame={time:0,bitmap};}
     else if(d.time<clip.end){if(!frames.length&&firstFrame){frames.push(firstFrame);firstFrame=null;}frames.push({time,bitmap});}
     else{bitmap.close();afterEnd=true;if(!frames.length&&firstFrame){frames.push(firstFrame);firstFrame=null;}}
    }else d.frame.close();
    send('ack');finish();return;
   }
   if(d.event==='pcm'){
    if(phase==='warming'){
     stats.warmedMs=performance.now()-started;warmEpoch=d.epoch;phase='seeking';seekIssued=true;send('seek',{time:preroll,seekId:1});progress('Positioning before the passage');return;
    }
    if(phase!=='capturing'||d.epoch<=warmEpoch||d.end<=clip.start)return;
    if(d.start>=clip.end){if(plane&&covered<plane.length)fail(Error('Audio capture has a gap; passage is not ready'));return;}
    if(d.timeScale!==1){fail(Error('Capture requires normal playback speed'));return;}
    if(!plane){rate=d.rate;plane=new Float32Array(Math.round((clip.end-clip.start)*rate));filled=new Uint8Array(plane.length);pcmEpoch=d.epoch;}
    if(rate!==d.rate){fail(Error('Capture sample rate changed'));return;}
    const dest=Math.round((d.start-clip.start)*rate),a=Math.max(0,-dest),b=Math.min(d.samples.length,plane.length-dest);stats.pcmWindows++;
    for(let i=a;i<b;i++){const at=dest+i;plane[at]=d.samples[i];if(!filled[at]){filled[at]=1;covered++;}}
    stats.epoch=pcmEpoch;stats.coverage=covered/plane.length;progress(`Capturing speech · ${Math.round(100*stats.coverage)}%`);finish();
   }
  };
  addEventListener('message',receive);signal?.addEventListener('abort',abort,{once:true});
  frame.onload=()=>frame.contentWindow?.postMessage({type:'mosh-youtube-connect'},'https://www.youtube.com');
  const timer=setInterval(()=>{
   if(settled)return;
   if(performance.now()-lastProgress>25000){fail(Error(connected?'YouTube passage capture stopped progressing':'Enable the Mosh Canopy bridge for buffered YouTube cuts, or select MIA in the catalogue filters'));return;}
   if(!connected)frame.contentWindow?.postMessage({type:'mosh-youtube-connect'},'https://www.youtube.com');
  },1000);
  frame.src='https://www.youtube.com/embed/'+encodeURIComponent(clip.filmId.slice(3))+'?'+params;container.append(frame);
 });
}
