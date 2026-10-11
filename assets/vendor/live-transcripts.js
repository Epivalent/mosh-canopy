self.LiveTranscripts=class LiveTranscripts{
 constructor(){this.segments=new Map();this.ready=this.restore();}
 async restore(){try{this.db=await new Promise((resolve,reject)=>{const r=indexedDB.open('mosh-live-voz',1);r.onupgradeneeded=()=>r.result.createObjectStore('segments',{keyPath:'key'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
  const rows=await new Promise((resolve,reject)=>{const r=this.db.transaction('segments').objectStore('segments').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});for(const row of rows)this.add(row);
 }catch(e){console.warn('Live transcript persistence:',e);}}
 add(row){if(!this.segments.has(row.id))this.segments.set(row.id,new Map());this.segments.get(row.id).set(row.key,row);}
 async put(row){await this.ready;row={...row,key:row.id+':'+row.start.toFixed(3)+':'+row.end.toFixed(3)};this.add(row);if(this.db)await new Promise((resolve,reject)=>{const tx=this.db.transaction('segments','readwrite');tx.objectStore('segments').put(row);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
 mergeFilm(id,base){if(base?.complete)return base;const segments=[...(this.segments.get(id)?.values()||[])];if(!segments.length)return base;const complete=segments.find(s=>s.complete&&s.words?.length);if(complete)return {...base,...complete,status:'complete',complete:true,ranges:[[complete.start,complete.end]],live:false};
  let words=base?.words||[];const ranges=[...(base?.ranges||[])];for(const seg of segments){words=words.filter(w=>{const mid=(w.start+w.end)/2;return mid<seg.start||mid>=seg.end;}).concat(seg.words);ranges.push([seg.start,seg.end]);}
  words.sort((a,b)=>a.start-b.start);return {...base,title:base?.title||segments[0].title,duration:base?.duration||segments[0].duration,words,ranges,status:'partial',complete:false,live:true};}
 merge(base){const result={...base};for(const id of this.segments.keys())result[id]=this.mergeFilm(id,base[id]);return result;}
};
