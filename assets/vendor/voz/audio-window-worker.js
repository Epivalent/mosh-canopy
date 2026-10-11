import {Input,UrlSource,BlobSource,ALL_FORMATS,AudioSampleSink} from './mediabunny.mjs';
const inputs=new Map();let queue=Promise.resolve();
async function decode({url,start,end}){
 let input=inputs.get(url);if(!input){const source=url.startsWith('blob:')?new BlobSource(await(await fetch(url)).blob()):new UrlSource(url,{parallelism:1,maxCacheSize:8*1024*1024,getRetryDelay:n=>n<2?.3:null});
  input=new Input({source,formats:ALL_FORMATS});inputs.set(url,input);while(inputs.size>3){const [key,old]=inputs.entries().next().value;inputs.delete(key);old.dispose();}}
 const track=await input.getPrimaryAudioTrack();if(!track)return {samples:new Float32Array(0),noAudio:true};
 if(!await track.canDecode())throw Error('The browser cannot decode this audio codec');
 const out=new Float32Array(Math.ceil((end-start)*16000)),sink=new AudioSampleSink(track);let written=0;
 for await(const sample of sink.samples(start,end)){
  try{const planes=Array.from({length:sample.numberOfChannels},()=>new Float32Array(sample.numberOfFrames));
   planes.forEach((p,i)=>sample.copyTo(p,{planeIndex:i,format:'f32-planar'}));
   const from=Math.max(0,Math.ceil((sample.timestamp-start)*16000)),to=Math.min(out.length,Math.ceil((sample.timestamp+sample.duration-start)*16000));
   for(let i=from;i<to;i++){const pos=(start+i/16000-sample.timestamp)*sample.sampleRate,a=Math.max(0,Math.min(sample.numberOfFrames-1,Math.floor(pos))),b=Math.min(a+1,sample.numberOfFrames-1),f=Math.max(0,Math.min(1,pos-a));let value=0;for(const p of planes)value+=p[a]*(1-f)+p[b]*f;out[i]=value/planes.length;}written=Math.max(written,to);
  }finally{sample.close();}
 }
 return {samples:out.subarray(0,written),sampleRate:16000};
}
// The recognizer takes 16 kHz mono. Playback keeps the device's native rate;
// resampling this copy belongs in the decoding worker, never the audible graph.
function resample(samples,rate){
 if(rate===16000)return {samples,sampleRate:16000};
 const step=rate/16000,out=new Float32Array(Math.floor(samples.length/step));
 // Integrate each output sample's source interval (including fractional edges).
 // This low-pass averaging avoids aliasing from simply dropping input samples.
 for(let i=0;i<out.length;i++){const a=i*step,b=(i+1)*step;let sum=0;
  for(let j=Math.floor(a);j<b;j++)sum+=samples[j]*(Math.min(j+1,b)-Math.max(j,a));
  out[i]=sum/step;
 }return {samples:out,sampleRate:16000};
}
onmessage=({data})=>{queue=queue.then(async()=>{try{const result=data.method==='resample'?resample(data.input,data.options.rate):await decode(data);postMessage({id:data.id,result},[result.samples.buffer]);}catch(error){postMessage({id:data.id,error:String(error)});}});};
