export const normalize = s => s.normalize('NFKC').toLowerCase().replace(/’/g, "'").replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
export const tokens = s => s.split(/\s+/u).map(normalize).filter(Boolean);
export function random(seed) {
  let x=seed>>>0;
  return () => { x=(Math.imul(x,1664525)+1013904223)>>>0; return x/4294967296; };
}

// Lexicographic objective: cover every possible word, then minimize edits,
// then prefer longer intact phrases among equally short edit sequences.
export function bestPath(words,edges,{repeatCost}={}) {
 const best=Array(words.length+1);best[words.length]={cost:repeatCost?[0,0,0,0]:[0,0,0],path:[]};
 const less=(a,b)=>{for(let k=0;k<a.length;k++)if(a[k]!==b[k])return a[k]<b[k];return false;};
 for(let i=words.length-1;i>=0;i--){
  const tail=best[i+1],missingCost=[...tail.cost];missingCost[0]++;best[i]={cost:missingCost,path:[{from:i,to:i+1,missing:true},...tail.path]};
  for(const to of edges[i]){const n=to-i,b=best[to],cost=repeatCost?[b.cost[0],b.cost[1]+repeatCost(i,to),b.cost[2]+1,b.cost[3]-n*n]:[b.cost[0],b.cost[1]+1,b.cost[2]-n*n];
   if(less(cost,best[i].cost))best[i]={cost,path:[{from:i,to},...b.path]};}
 }return best[0];
}

// Maximum distinct-film assignment, with lazy timing validation. Reassign an
// earlier flexible phrase when a later phrase needs its film. Only fall back
// to repeats once no augmenting path can give another passage its own film.
export async function castFilms(path,candidates,validate,{preferred=id=>true}={}){
 const passages=path.filter(e=>!e.missing),options=new Map(passages.map(e=>[e,candidates(e)]));
 const chosen=new Map(),owners=new Map(),checked=new Map();
 const check=async(e,id)=>{let hits=checked.get(e);if(!hits)checked.set(e,hits=new Map());if(!hits.has(id))hits.set(id,await validate(e,id));return hits.get(id);};
 async function assign(e,seen,preferOnly){
  // Use free films before trying to move somebody else's assignment.
  for(const occupied of [false,true])for(const id of options.get(e)){
   if(seen.has(id)||owners.has(id)!==occupied||preferOnly&&!preferred(id))continue;
   const hit=await check(e,id);if(!hit)continue;seen.add(id);
   const owner=owners.get(id);
   if(!owner||await assign(owner,seen,preferOnly)){owners.set(id,e);chosen.set(e,hit);return true;}
  }return false;
 }
 for(const e of passages)await assign(e,new Set(),true);
 for(const e of passages)if(!chosen.has(e))await assign(e,new Set(),false);
 const usage=new Map();for(const hit of chosen.values())usage.set(hit.filmId,(usage.get(hit.filmId)||0)+1);
 for(const e of passages)if(!chosen.has(e)){
  const ids=[...options.get(e)].sort((a,b)=>(usage.get(a)||0)-(usage.get(b)||0)||Number(!preferred(a))-Number(!preferred(b)));
  for(const id of ids){const hit=await check(e,id);if(hit){chosen.set(e,hit);usage.set(id,(usage.get(id)||0)+1);break;}}
 }
 return {chosen,missing:passages.filter(e=>!chosen.has(e)),hasPreferred:e=>[...(checked.get(e)||[])].some(([id,hit])=>hit&&preferred(id))};
}

export function cutBounds(words,index,length,handle=0) {
 const selected=words.slice(index,index+length),first=selected[0],last=selected.at(-1),before=words[index-1],after=words[index+length];
 if(selected.some(w=>!Number.isFinite(w.start)||!Number.isFinite(w.end)||w.start<0||w.end<=w.start))return null;
 if(selected.some((w,i)=>i&&w.start<selected[i-1].start))return null;
 // No padding into known neighbouring speech. Overlapping caption timings
 // remain flagged; truncating at the next start is not forced alignment.
 const start=Math.max(0,first.start-Math.min(handle,Math.max(0,first.start-(before?.end??0))/2));
 const end=Math.min(last.end+(Math.min(handle,Math.max(0,(after?.start??last.end)-last.end)/2)),after&&after.start>last.start?after.start:Infinity);
 if(end<=start)return null;
 return {start,end,rawStart:first.start,rawEnd:last.end,overlap:!!(before&&before.end>first.start||after&&after.start<last.end),maxGap:Math.max(0,...selected.slice(1).map((w,i)=>w.start-selected[i].end))};
}

