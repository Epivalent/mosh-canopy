/* Shared parsing and deterministic title ranking; no network or rendering. */
globalThis.GoSearchCore={
 normalize(text){return String(text||'').normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();},
 youtube(text){
  let value=String(text).trim().replace(/^yt:\s*/i,'');
  if(/^[\w-]{11}$/.test(value))return {id:'yt:'+value,start:0};
  if(/^(?:www\.|m\.|music\.)?(?:youtube\.com|youtu\.be)\//i.test(value))value='https://'+value;
  let u;try{u=new URL(value)}catch{return null}
  const host=u.hostname.toLowerCase(),id=host==='youtu.be'?u.pathname.split('/')[1]:/(^|\.)youtube(?:-nocookie)?\.com$/.test(host)?u.searchParams.get('v')||u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/)?.[1]:null;
  if(!/^[\w-]{11}$/.test(id||''))return null;
  const raw=u.searchParams.get('t')||u.searchParams.get('start')||new URLSearchParams(u.hash.slice(1)).get('t')||'';
  const time=/^\d+(?:\.\d+)?$/.test(raw)?Number(raw):/^(?:\d+h)?(?:\d+m)?(?:\d+(?:\.\d+)?s)?$/.test(raw)?[...raw.matchAll(/(\d+(?:\.\d+)?)([hms])/g)].reduce((n,m)=>n+Number(m[1])*({h:3600,m:60,s:1}[m[2]]),0):0;
  return {id:'yt:'+id,start:time};
 },
 topTitles(query,films,limit=1){
  const q=this.normalize(query),tokens=q.split(' ').filter(Boolean);if(!tokens.length)return [];
  const matches=new Map(),compare=(a,b)=>a.rank[0]-b.rank[0]||a.rank[1]-b.rank[1]||a.id.localeCompare(b.id);
  for(const film of films){if(!film.id)continue;const title=film.normalized??this.normalize(film.title),words=title.split(' ');if(!tokens.every(t=>words.includes(t)))continue;
   // Exact title, then contiguous phrase, then all query words. Shorter titles
   // break ties without adding subjective weights to unrelated partial matches.
   const row={id:film.id,title:film.title,start:0,rank:[title===q?0:(' '+title+' ').includes(' '+q+' ')?1:2,words.length]},previous=matches.get(film.id);
   if(!previous||compare(row,previous)<0)matches.set(row.id,row);
  }
  return [...matches.values()].sort(compare).slice(0,limit).map(({rank,...hit})=>hit);
 },
 topTitle(query,films){return this.topTitles(query,films,1)[0]||null;},
 candidates(hits,random,count,rng=Math.random){
  const seen=new Set(),unique=hits.filter(hit=>hit?.id&&!seen.has(hit.id)&&seen.add(hit.id));
  const pool=random?unique.slice(0,count):unique;
  if(random)for(let i=pool.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  return pool;
 },
 youtubeResults(html){
  const match=/(?:var\s+ytInitialData\s*=|window\["ytInitialData"\]\s*=)\s*/.exec(html);if(!match)throw Error('YouTube did not return searchable results');
  const start=match.index+match[0].length;let depth=0,quoted=false,escape=false,end=start;
  for(;end<html.length;end++){const ch=html[end];if(quoted){if(escape)escape=false;else if(ch==='\\')escape=true;else if(ch==='"')quoted=false;}else if(ch==='"')quoted=true;else if(ch==='{')depth++;else if(ch==='}'&&!--depth){end++;break;}}
  const data=JSON.parse(html.slice(start,end)),results=[],seen=new Set();
  const visit=value=>{if(!value||typeof value!=='object')return;
   if(value.videoRenderer){const v=value.videoRenderer,id=v.videoId;if(/^[\w-]{11}$/.test(id)&&!seen.has(id)){seen.add(id);results.push({id:'yt:'+id,title:v.title?.runs?.map(r=>r.text).join('')||v.title?.simpleText||id,start:0});}return;}
   for(const [key,v]of Object.entries(value))if(!/adSlot|promoted|advertisement/i.test(key))visit(v);
  };
  visit(data.contents?.twoColumnSearchResultsRenderer?.primaryContents||data.contents);return results;
 }
};
