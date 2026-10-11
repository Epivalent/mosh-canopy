import {Input,UrlSource,ALL_FORMATS,AudioSampleSink,CanvasSink} from 'https://epivalent.github.io/mosh-canopy/assets/vendor/voz/mediabunny.mjs';
import {repairAVCConfig} from './avc-config.mjs';
import {measureLevels} from './levels.mjs';
// Decode only the selected time intervals. The browser's codec implementation
// does the decoding; demux, sample copies and canvas work stay in this worker.
onmessage=async({data:{id,clip,width,context=false}})=>{
 const started=performance.now(),frames=[],requests=[],stages={};let input,phase='locating shot';
 const progress=label=>{phase=label;postMessage({id,progress:label});};
 const nativeFetch=globalThis.fetch;
 // Record requested ranges and consumed bytes instead of calling all waiting
 // "decoding". Reads remain streamed; nothing buffers an entire response here.
 const measuredFetch=async(url,options={})=>{const row={range:new Headers(options.headers).get('range'),phase,bytes:0,started:performance.now()};requests.push(row);
  const response=await nativeFetch(url,options);row.headersMs=performance.now()-row.started;row.status=response.status;row.contentRange=response.headers.get('content-range');
  if(!response.body)return response;const reader=response.body.getReader();
  return new Response(new ReadableStream({async pull(controller){try{const {done,value}=await reader.read();row.elapsedMs=performance.now()-row.started;if(done)controller.close();else{row.bytes+=value.length;controller.enqueue(value);}}catch(e){controller.error(e);}},cancel:reason=>reader.cancel(reason)}),{status:response.status,statusText:response.statusText,headers:response.headers});
 };
 try{
  const start=context?Math.max(0,(clip.before[0]?.start??clip.start)-1):clip.start;
  const end=context?(clip.after.at(-1)?.end??clip.end)+1:clip.end;
  progress('Locating the short source shot');let url=clip.url,offset=0,shot=null;
  if(clip.filmId&&!clip.filmId.startsWith('yt:')){
   const r=await fetch('https://pub-fd77318b30094f8a923cae6a232a72fa.r2.dev/assets/film-shots/'+encodeURIComponent(clip.filmId)+'.json');
   if(r.ok){const shots=await r.json();shot=shots.filter(s=>s.start<=start&&s.end>=end).sort((a,b)=>(a.end-a.start)-(b.end-b.start))[0];
    if(shot){const u=new URL(shot.mp4);url='https://mosh-canopy-assets.moshcanopy.workers.dev/film'+u.pathname+u.search;offset=shot.start;}}
  }
  stages.locateMs=performance.now()-started;
  progress('Reading media headers');
  input=new Input({source:new UrlSource(url,{fetchFn:measuredFetch,getRetryDelay:()=>null}),formats:ALL_FORMATS});
  const [audio,video]=await Promise.all([input.getPrimaryAudioTrack(),context?null:input.getPrimaryVideoTrack()]);if(!audio)throw Error('No audio track');
  stages.headersMs=performance.now()-started-stages.locateMs;progress('Fetching the selected audio and video ranges');
  let planes,rate,covered=0,codecRepair;
  const tasks=await Promise.allSettled([(async()=>{const audioStart=performance.now();
  for await(const sample of new AudioSampleSink(audio).samples(start-offset,end-offset)){
   try{
    if(!planes){rate=sample.sampleRate;planes=Array.from({length:sample.numberOfChannels},()=>new Float32Array(Math.ceil((end-start)*rate)));}
    if(rate!==sample.sampleRate)throw Error('Audio sample rate changed');
    const dest=Math.round((sample.timestamp+offset-start)*rate),a=Math.max(0,-dest),b=Math.min(sample.numberOfFrames,planes[0].length-dest);
    if(b>a)for(let c=0;c<planes.length;c++){const p=new Float32Array(sample.numberOfFrames);sample.copyTo(p,{planeIndex:c,format:'f32-planar'});planes[c].set(p.subarray(a,b),dest+a);if(c===0)covered+=b-a;}
   }finally{sample.close();}
  }
  if(!planes)throw Error('No decoded audio in this interval');
  stages.audioMs=performance.now()-audioStart;
  })(),(async()=>{const videoStart=performance.now();
  if(!context){if(!video)throw Error('No video track');
   const config=await video.getDecoderConfig(),fixed=repairAVCConfig(config);
   // The pinned Mediabunny build's canDecode and sink both read its backing
   // configuration. Keep this compatibility adapter isolated to the lab.
   if(fixed!==config){video._backing.getDecoderConfig=async()=>fixed;codecRepair={from:config.codec,to:fixed.codec};}
   if(!await video.canDecode())throw Error(`${clip.title}: this browser cannot decode ${fixed?.codec??video.codec}`);
   // Output matches the lab canvas width, not a corpus-wide decode setting.
   const sink=new CanvasSink(video,{width:Math.min(width,video.displayWidth)});
   for await(const frame of sink.canvases(start-offset,end-offset))frames.push({time:frame.timestamp+offset-start,duration:frame.duration,bitmap:await createImageBitmap(frame.canvas)});
  }
  stages.videoMs=performance.now()-videoStart;
  })()]);
  const failed=tasks.find(t=>t.status==='rejected');if(failed)throw failed.reason;
  const levelStart=performance.now(),levels=measureLevels(planes,rate);stages.levelsMs=performance.now()-levelStart;
  postMessage({id,start,end,rate,planes,frames,covered,codecRepair,stages,requests,levels,media:{url,offset,shot:shot?{start:shot.start,end:shot.end}:null},decodeMs:performance.now()-started},[...planes.map(p=>p.buffer),...frames.map(f=>f.bitmap)]);
 }catch(e){for(const f of frames)f.bitmap.close();postMessage({id,error:String(e)});}
 finally{input?.dispose();}
};
