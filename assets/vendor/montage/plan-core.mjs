export const normalize = s => s.normalize('NFKC').toLowerCase().replace(/’/g, "'").replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
export const tokens = s => s.split(/\s+/u).map(normalize).filter(Boolean);
export function random(seed) {
  let x=seed>>>0;
  return () => { x=(Math.imul(x,1664525)+1013904223)>>>0; return x/4294967296; };
}

// Lexicographic objective: cover every possible word, then minimize edits,
// then prefer longer intact phrases among equally short edit sequences.
export function bestPath(words,edges) {
 const best=Array(words.length+1);best[words.length]={cost:[0,0,0],path:[]};
 const less=(a,b)=>{for(let k=0;k<a.length;k++)if(a[k]!==b[k])return a[k]<b[k];return false;};
 for(let i=words.length-1;i>=0;i--){
  const tail=best[i+1];best[i]={cost:[tail.cost[0]+1,tail.cost[1],tail.cost[2]],path:[{from:i,to:i+1,missing:true},...tail.path]};
  for(const to of edges[i]){const n=to-i,b=best[to],cost=[b.cost[0],b.cost[1]+1,b.cost[2]-n*n];
   if(less(cost,best[i].cost))best[i]={cost,path:[{from:i,to},...b.path]};}
 }return best[0];
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

