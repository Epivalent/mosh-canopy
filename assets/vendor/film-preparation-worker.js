/* Streaming HTTP-cache warming needs no service-worker registration/certificate
   trust exception. No playback interception and no retained video blobs. */
const jobs=new Map(),prepared=new Set(),retryAt=new Map();let wanted=new Set();
function filmURL(value){try{const u=new URL(value,self.location.origin);return u.origin===self.location.origin&&u.pathname.startsWith('https://mosh-canopy-assets.moshcanopy.workers.dev/film/sources/')&&u.pathname.includes('/clips/')&&u.pathname.endsWith('.mp4')?u.href:null;}catch{return null;}}
async function prepare(url,job){
  const {controller}=job;let timer;
  const heartbeat=()=>{clearTimeout(timer);timer=setTimeout(()=>controller.abort(),30000);};
  try{
    heartbeat();const response=await fetch(url,{cache:'force-cache',priority:'low',signal:controller.signal});if(!response.ok){await response.body?.cancel();throw Error('HTTP '+response.status);}
    const reader=response.body.getReader();try{while(!(await reader.read()).done)heartbeat();}finally{reader.releaseLock();}
    if(job.cancelled||!wanted.has(url))return;
    // Completion records belong to the current plan. A smaller LRU causes the
    // end-of-job pump to evict and re-fetch that same plan indefinitely.
    prepared.add(url);
    retryAt.delete(url);self.postMessage({type:'film-prepared',url});
  }catch(e){if(!job.cancelled&&wanted.has(url)){retryAt.set(url,Date.now()+30000);self.postMessage({type:'film-prepare-error',url,message:e.message});}}
  finally{clearTimeout(timer);if(jobs.get(url)===job)jobs.delete(url);pump();status();}
}
function status(){self.postMessage({type:'film-cache-status',files:prepared.size,fetching:jobs.size,planned:wanted.size,storage:'browser HTTP cache'});}
function pump(){for(const url of wanted){if(jobs.size>=2)break;if(prepared.has(url)||jobs.has(url)||(retryAt.get(url)||0)>Date.now())continue;const job={controller:new AbortController(),cancelled:false};jobs.set(url,job);prepare(url,job);}}
self.onmessage=({data})=>{
  // A decoder has taken ownership of the URL. Its media request must not
  // compete with a second speculative download of the same film.
  if(data.type==='claim-film'){
    const url=filmURL(data.url);wanted.delete(url);prepared.delete(url);retryAt.delete(url);
    const job=jobs.get(url);if(job){job.cancelled=true;job.controller.abort();}
    pump();status();
  }
  if(data.type==='prepare-films'){
    wanted=new Set(data.urls.map(filmURL).filter(Boolean));
    for(const url of prepared)if(!wanted.has(url))prepared.delete(url);
    for(const url of retryAt.keys())if(!wanted.has(url))retryAt.delete(url);
    for(const [url,job]of jobs)if(!wanted.has(url)){job.cancelled=true;job.controller.abort();}
    pump();status();
  }
  if(data.type==='film-cache-status')status();
};
