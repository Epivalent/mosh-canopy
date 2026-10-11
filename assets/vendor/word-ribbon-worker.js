importScripts(...['https://epivalent.github.io/mosh-canopy/assets/vendor/retrotv-published.js?v=2','https://epivalent.github.io/mosh-canopy/assets/vendor/retrotv-caption-index.js?v=7'].map(p=>new URL(p,self.location.origin).href));
// Playback transcript loading and rasterisation have their own worker.
importScripts(new URL('https://epivalent.github.io/mosh-canopy/assets/vendor/transcript-store.js?v=2',self.location.origin).href);
importScripts(new URL('https://epivalent.github.io/mosh-canopy/assets/vendor/concordance-index.js?v=7',self.location.origin).href);
importScripts(new URL('https://epivalent.github.io/mosh-canopy/assets/vendor/live-transcripts.js',self.location.origin).href);
const store=new TranscriptStore(),live=new LiveTranscripts();let queue=Promise.resolve();
if(store.retroIndex)store.retroIndex.onUpdate=data=>{store.invalidate(data.id);postMessage({type:'live-update',...data});};
const loadFilm=async id=>{const base=await store.load(id);await live.ready;return live.mergeFilm(id,base);};
// Published MRT captions are already searchable, but also have to enter the
// ribbon inventory. Previously only MIA and newly captured speech were added,
// so cached YouTube transcripts were filtered out before any ribbon was built.
const publishedFiles=new Map();let publicationTask;
async function publishInventory(refresh=false){
 if(publicationTask){await publicationTask;if(!refresh)return;}
 publicationTask=(async()=>{
  if(refresh)await store.retroIndex?.published.load();
  const docs=await store.retroIndex?.documents()||[],films=[];
  for(const d of docs)if(d.words&&(!publishedFiles.has(d.id)||publishedFiles.get(d.id)!==d.file)){
   publishedFiles.set(d.id,d.file);store.invalidate(d.id);films.push({id:d.id,title:d.title});
  }
  if(films.length)postMessage({type:'transcript-catalog',films});
 })();try{await publicationTask;}finally{publicationTask=null;}
}
publishInventory().catch(error=>postMessage({type:'error',message:'MRT transcript catalogue: '+error}));

store.index.then(data=>{
 const added=Object.entries(data.films).filter(([,f])=>f.words).map(([id,f])=>({id,title:f.title}));
 postMessage({type:'catalog',added,removed:[],index:{updated:[],films:data.total},coverage:{scope:data.scope,speech:data.speech,partial:data.partial,pending:data.pending,noAudio:data.noAudio,noSpeech:data.noSpeech,words:data.words},finished:data.complete,total:data.total,processed:data.processed,errors:data.errors,revision:data.revision});
}).catch(error=>postMessage({type:'error',message:String(error)}));
live.ready.then(()=>{for(const [id,segments]of live.segments){if([...segments.values()].some(s=>s.words.length))postMessage({type:'live-update',id,title:[...segments.values()][0].title,wordCount:1});}});
async function render(id,time=0){
 const film=await loadFilm(id);if(!film?.words?.length){postMessage({type:'empty',id});return;}
 const font=28,rowHeight=44,measure=new OffscreenCanvas(1,1).getContext('2d');measure.font=`${font}px Georgia`;
 let offset=0;const space=measure.measureText(' ').width;
 let lo=0,hi=film.words.length;while(lo<hi){const mid=(lo+hi)>>1;if(film.words[mid].end<time)lo=mid+1;else hi=mid;}
 const start=Math.max(0,Math.floor(Math.min(lo,film.words.length-1)/32)*32-32),end=Math.min(film.words.length,start+128),windowWords=film.words.slice(start,end);
 if(!windowWords.length)throw Error('No timed speech available');
 const validStart=start?film.words[start+16].start:-Infinity,validEnd=end<film.words.length?film.words[end-32].start:Infinity;
 const words=windowWords.map((w,i)=>{if(i)offset+=Math.min(2000,Math.max(0,w.start-windowWords[i-1].end)*80);const width=measure.measureText(w.text).width;const v={...w,offset,width,center:offset+width/2};offset+=width+space;return v;});
 const width=Math.min(2048,2**Math.ceil(Math.log2(Math.max(256,offset)))),height=2**Math.ceil(Math.log2(Math.ceil(offset/width)*rowHeight));
 const canvas=new OffscreenCanvas(width,height),ctx=canvas.getContext('2d');ctx.font=`${font}px Georgia`;ctx.fillStyle='white';ctx.textBaseline='alphabetic';
 for(let row=0;row<Math.ceil(offset/width);row++){
  ctx.save();ctx.beginPath();ctx.rect(0,row*rowHeight,width,rowHeight);ctx.clip();
  for(const w of words)if(w.offset+w.width>row*width&&w.offset<(row+1)*width)ctx.fillText(w.text,w.offset-row*width,row*rowHeight+31);
  ctx.restore();
 }
 const times=new Float32Array(512*4);let n=0;
 for(let i=0;i<512;i++){const x=i/511*offset;while(n<words.length-1&&words[n].offset+words[n].width<x)n++;const w=words[n];let time;
  if(x<w.offset&&n){const p=words[n-1];time=p.end+(w.start-p.end)*(x-p.offset-p.width)/Math.max(.01,w.offset-p.offset-p.width);}
  else time=w.start+(w.end-w.start)*Math.max(0,Math.min(1,(x-w.offset)/Math.max(1,w.width)));
  times[i*4]=time;
 }
 const bitmap=await createImageBitmap(canvas,{imageOrientation:'flipY',premultiplyAlpha:'none'});
 postMessage({type:'texture',id,bitmap,times,words,length:offset,width,height,validStart,validEnd},[bitmap,times.buffer]);
}
onmessage=({data})=>{
 if(data.type==='refresh-published'){publishInventory(true).catch(error=>postMessage({type:'error',message:'MRT transcript catalogue: '+error}));return;}
 const reply=promise=>promise.then(result=>postMessage({type:data.type,requestId:data.requestId,result})).catch(error=>postMessage({type:'response-error',requestId:data.requestId,message:String(error)}));
 if(data.type==='coverage')reply((async()=>{
  const index=await store.index;await live.ready;
  return Object.fromEntries(await Promise.all(data.ids.map(async id=>{
   const base=index.films[id],segments=[...live.segments.get(id)?.values()||[]],ranges=[...(base?.ranges||[])];
   for(const s of segments)ranges.push([s.start,s.end]);
   // This small metadata row is sufficient; don't decompress the entire caption
   // text merely to decide whether ASR is needed. Legacy docs were full CC tracks.
   const completeCC=id.startsWith('yt:')&&store.retroIndex?await store.retroIndex.hasComplete(id):false;
   return [id,{complete:!!base?.complete||segments.some(s=>s.complete&&s.words?.length)||completeCC,ranges}];
  })));
 })());
 if(data.type==='retain')store.retain('ribbons',data.ids);
 if(data.type==='prefetch'){store.retain('preparation',data.ids);for(const id of data.ids)store.load(id,'low').catch(()=>{});}
 if(data.type==='live-transcript'){
  const task=queue.then(async()=>{await live.put(data);const film=await loadFilm(data.id),wordCount=film?.words.length||0;postMessage({type:'live-update',id:data.id,title:data.title,wordCount});return {words:wordCount};});queue=task.catch(()=>{});reply(task);
 }
 if(data.type==='render')render(data.id,data.time).catch(error=>postMessage({type:'error',id:data.id,message:String(error)}));
 if(data.type==='captions'){store.retain('captions',[data.id]);reply((async()=>{const film=await loadFilm(data.id);if(!film)return [];return ConcordanceIndex.prototype.captions.call({ready:Promise.resolve(),films:new Map([[data.id,{film}]])},data.id);})());}
};
postMessage({type:'ready'});
