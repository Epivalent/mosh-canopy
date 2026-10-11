// YouTube JSON3 uses word offsets for ASR, and sometimes only phrase timestamps.
// Preserve real offsets; interpolate words only where the track lacks them.
export function captionWords(data,duration=Infinity){
 const events=(data.events||[]).filter(e=>e.segs?.some(s=>s.utf8?.trim())).sort((a,b)=>a.tStartMs-b.tStartMs),words=[];
 for(let i=0;i<events.length;i++){
  const e=events[i],start=e.tStartMs/1000,next=events[i+1]?.tStartMs/1000;
  const end=Math.min(duration,start+(e.dDurationMs||5000)/1000,Number.isFinite(next)&&next>start?next:Infinity);
  let word=null;
  const flush=()=>{if(word){words.push(word);word=null}};
  for(let j=0;j<e.segs.length;j++){
   const seg=e.segs[j],text=String(seg.utf8||'');if(!text)continue;
   const from=start+(seg.tOffsetMs||0)/1000,to=Math.max(from+.02,Math.min(end,j+1<e.segs.length?start+(e.segs[j+1].tOffsetMs??((end-start)*1000))/1000:end));
   const pieces=text.match(/\s+|\S+/g)||[],total=pieces.filter(t=>!/^\s+$/.test(t)).reduce((n,t)=>n+t.length,0);let cursor=from;
   for(const piece of pieces){if(/^\s+$/.test(piece)){flush();continue;}
    const until=Math.min(duration,cursor+(to-from)*piece.length/Math.max(1,total));
    if(cursor<duration){if(word){word.text+=piece;word.end=Math.max(word.end,until);}else word={text:piece,start:cursor,end:Math.max(cursor+.01,until)};if(pieces.filter(p=>!/^\s+$/.test(p)).length>1)word.estimatedTiming=true;}cursor=until;
   }
  }
  flush();
 }
 // Rolling captions can repeat a word with exactly the same timestamp.
 const seen=new Set();return words.sort((a,b)=>a.start-b.start).filter(w=>{const k=Math.round(w.start*1000)+':'+w.text;if(seen.has(k))return false;seen.add(k);return true;});
}
export function relayURL(input,origin=globalThis.location?.origin||'http://localhost:9001'){
 const u=new URL(input);let prefix;
 if(u.hostname==='www.youtube.com'||u.hostname==='youtube.com')prefix='/youtube';
 else if(u.hostname==='youtubei.googleapis.com')prefix='/youtube-api';
 else if(/^[a-z0-9-]+\.googlevideo\.com$/.test(u.hostname)&&u.pathname==='/videoplayback')prefix='https://mosh-canopy-assets.moshcanopy.workers.dev/youtube-media/'+u.hostname;
 else throw Error('Unsupported YouTube media host: '+u.hostname);
 return origin+prefix+u.pathname+u.search;
}
