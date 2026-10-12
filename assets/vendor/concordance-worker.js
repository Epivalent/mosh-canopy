importScripts(...['https://epivalent.github.io/mosh-canopy/assets/vendor/go-search-core.js?v=1','https://epivalent.github.io/mosh-canopy/assets/vendor/catalogue-selection.js?v=neon1','https://epivalent.github.io/mosh-canopy/assets/vendor/catalogue-metadata.js?v=neon1','https://epivalent.github.io/mosh-canopy/assets/vendor/concordance-index.js?v=12','https://epivalent.github.io/mosh-canopy/assets/vendor/transcript-store.js?v=4','https://epivalent.github.io/mosh-canopy/assets/vendor/live-transcripts.js','https://epivalent.github.io/mosh-canopy/assets/vendor/retrotv-published.js?v=7','https://epivalent.github.io/mosh-canopy/assets/vendor/retrotv-caption-index.js?v=10'].map(path=>new URL(path,self.location.origin).href));
const metadataCatalogue=new CatalogueMetadata(),retroIndex=new RetroCaptionIndex(),miaIndex=new RetroPublishedCaptions('https://pub-fd77318b30094f8a923cae6a232a72fa.r2.dev/assets/transcripts/search/');
// Static corpora already have term postings. Only genuinely new live speech
// needs client-side indexing. Full transcripts are loaded for matching sheets.
const store=new TranscriptStore({retroIndex}),live=new LiveTranscripts(),concordance=new ConcordanceIndex({persistent:false});
let currentStack=null;
let coverageCache=null;
retroIndex.onUpdate=()=>{coverageCache=null;};
let stackGeneration=0,liveIngest=Promise.resolve(),selectedScope=null;
const loadedBatch=new Map(),baseFilms={};
async function ingestLive(data){coverageCache=null;await live.put(data);const base=baseFilms[data.id]??=await store.load(data.id);await concordance.upsert(data.id,live.mergeFilm(data.id,base));loadedBatch.delete(data.id);}
const ready=(async()=>{
 const [metadata]=await Promise.all([store.index,live.ready,miaIndex.ready,retroIndex.published.ready,retroIndex.ready]);
 if(!miaIndex.index)throw Error('The published MIA concordance index is missing.');
 for(const id of live.segments.keys())if(!metadata.films[id]?.complete&&!await retroIndex.hasComplete(id)){
  const base=baseFilms[id]=await store.load(id);await concordance.upsert(id,live.mergeFilm(id,base));
 }
 // Metadata is used by catalogue filters; warm it independently of playback.
 Promise.all([metadataCatalogue.retro(),metadataCatalogue.neon(),metadataCatalogue.mia()]).catch(()=>{});
 postMessage({type:'ready'});
})();
ready.catch(error=>postMessage({type:'error',message:String(error)}));
async function preparePages(indices,generation,priority='high'){
 if(!currentStack||currentStack.generation!==generation)throw Error('Search superseded');
 const rows=indices.map(i=>currentStack.results[i]).filter(Boolean),keep=new Set(rows.map(r=>r.id));
 store.retain('concordance',keep);
 await Promise.all(rows.map(async r=>{
  if(r.source==='live')return;
  const revision=r.source==='retro'?retroIndex.published.index?.revision:miaIndex.index.revision;
  if(loadedBatch.get(r.id)===revision&&concordance.films.has(r.id))return;
  if(loadedBatch.has(r.id))store.invalidate(r.id);
  const film=await store.load(r.id,priority);if(generation!==stackGeneration)throw Error('Search superseded');
  if(!film)throw Error('Transcript missing: '+r.id);
  concordance.add(r.id,film,null,false);loadedBatch.set(r.id,revision);
 }));
 for(const r of rows){const words=concordance.films.get(r.id)?.film.words||[];if(r.atTime){let lo=0,hi=words.length;while(lo<hi){const mid=(lo+hi)>>>1;if(words[mid].end<r.start)lo=mid+1;else hi=mid;}r.index=Math.min(lo,Math.max(0,words.length-1));}if(r.start==null)r.start=words[r.index]?.start;}
 const packed=await concordance.prepareStack(rows,currentStack.term,()=>generation!==stackGeneration);
 packed.pages.forEach((p,i)=>p.stackIndex=indices[i]);packed.stackId=generation;
 // Full transcripts for all hits must not accumulate in worker RAM. Packed
 // visible pages already own their word data on the render side.
 for(const id of loadedBatch.keys())if(!keep.has(id)){loadedBatch.delete(id);concordance.films.delete(id);}
 return packed;
}
async function goTitle(query,extra=[],limit=1){
 const sources=await Promise.allSettled([metadataCatalogue.mia().then(m=>[...m.values()]),metadataCatalogue.neon().then(n=>n.films),retroIndex.documents()]);
 const rows=[...extra,...sources.flatMap(s=>s.status==='fulfilled'?s.value:[])];
 return {results:GoSearchCore.topTitles(query,rows,limit)};
}
async function goWord(query,limit=1){
 const tokens=concordance.tokens(query),phrases=[query,...[...new Set(tokens)].sort((a,b)=>b.length-a.length)];
 for(const word of new Set(phrases)){
  const responses=await Promise.allSettled([miaIndex.query(word),retroIndex.query(word),concordance.query(word)]);
  const hits=new Map();for(const r of responses)if(r.status==='fulfilled')for(const hit of r.value.results)hits.set(hit.id,hit);
  if(hits.size)return {results:[...hits.values()].sort((a,b)=>b.matches-a.matches||a.title.localeCompare(b.title)).slice(0,limit)};
 }
 return {results:[]};
}
onmessage=({data})=>{
 if(data.type==='refresh-published'){coverageCache=null;Promise.all([miaIndex.load(),retroIndex.published.load()]).catch(error=>console.warn('Concordance publication refresh:',error));return;}
 if(data.type==='cancel-stack'){stackGeneration++;return;}
 if(data.type==='ingest-live'){liveIngest=liveIngest.then(async()=>{await ready;await ingestLive(data);}).catch(error=>postMessage({type:'error',message:String(error)}));return;}
 const pendingLive=liveIngest,generation=['concordance','passage-stack'].includes(data.type)?++stackGeneration:stackGeneration;
 (async()=>{
  if(data.type==='go-title'){const result=await goTitle(data.query,data.films,data.limit);postMessage({type:data.type,requestId:data.requestId,result});return;}
  await ready;let result;
  if(data.type==='go-word')result=await goWord(data.query,data.limit);
  else if(data.type==='passage-stack'){
   if(generation!==stackGeneration)throw Error('Search superseded');
   const seen=new Set();const results=(data.passages||[]).filter(p=>p.id&&Number.isFinite(p.start)&&!seen.has(p.id)&&seen.add(p.id)).map(p=>({id:p.id,title:p.title,start:p.start,index:0,atTime:true,matches:0,source:p.id.startsWith('yt:')?'retro':'mia'}));
   result={term:'',results,occurrences:0,stackId:generation};currentStack={generation,results,term:''};
   if(results.length)Object.assign(result,await preparePages([0],generation));
  }else if(data.type==='concordance'){
   if(generation!==stackGeneration)throw Error('Search superseded');await pendingLive;
   const selectionKey=JSON.stringify(data.selection??null);
   if(selectedScope?.key!==selectionKey)selectedScope={key:selectionKey,scope:await metadataCatalogue.selection(data.selection)};
   const scope=selectedScope.scope;
   const s=data.selection?CatalogueSelection.normalize(data.selection):null;
   const useMIA=!s||CatalogueSelection.usesMIA(s);
   const useRetro=!s||CatalogueSelection.usesYouTube(s);
   const empty={term:concordance.tokens(data.word).join(' '),results:[],occurrences:0};
   const [mia,recent,batch]=await Promise.all([useMIA?miaIndex.query(data.word,data.mode,data.seed,scope.accept,true):empty,concordance.query(data.word,data.mode,data.seed,scope.accept),useRetro?retroIndex.query(data.word,data.mode,data.seed,scope.accept,true):empty]);
   if(generation!==stackGeneration)throw Error('Search superseded');
   const merged=new Map(mia.results.map(r=>[r.id,{...r,source:'mia'}]));
   for(const r of recent.results)merged.set(r.id,{...r,source:'live'});
   for(const r of batch.results)merged.set(r.id,{...r,source:'retro'});
   result={...mia,results:[...merged.values()]};result.occurrences=result.results.reduce((n,r)=>n+r.matches,0);
   result.results.sort((a,b)=>a.title.localeCompare(b.title)||a.id.localeCompare(b.id));
   const coverageKey=selectionKey+'|'+miaIndex.index?.revision+'|'+retroIndex.published.index?.revision+'|'+concordance.films.size;
   if(coverageCache?.key!==coverageKey){
    const batchCoverage=await retroIndex.coverage(),docs=await retroIndex.documents(),indexed=new Set([...Object.keys(miaIndex.docs),...concordance.films.keys(),...docs.filter(d=>d.words>0).map(d=>d.id)]);
    coverageCache={key:coverageKey,batchCoverage,selectionCoverage:{selected:scope.selected?.size??null,indexed:[...indexed].filter(scope.accept).length,totalIndexed:indexed.size}};
   }
   result.batchCoverage=coverageCache.batchCoverage;result.selectionCoverage=coverageCache.selectionCoverage;
   currentStack={generation,results:result.results,term:result.term};result.stackId=generation;
   if(data.prepareSheets){
    const indices=data.progressive?(result.results.length?[0]:[]):result.results.map((_,i)=>i);
    Object.assign(result,await preparePages(indices,generation));
   }
  }else if(data.type==='stack-pages'){
   if(data.stackId!==stackGeneration)throw Error('Search superseded');
   result=await preparePages(data.indices,data.stackId,data.priority);
  }else if(data.type==='sheet')result=await concordance.sheet(data.id,data.index,data.term);
  else if(data.type==='sheet-tile')result=await concordance.sheetTile(data.id,data.index,data.term,data.tile);
  else return;
  if(data.requestId){const transfer=result.atlas?[result.atlas.bitmap,...result.pages.flatMap(p=>[p.positions.buffer,p.matches.buffer,p.words.buffer])]:result.bitmap?[result.bitmap]:[];postMessage({type:data.type,requestId:data.requestId,result},transfer);}
 })().catch(error=>postMessage({type:'response-error',requestId:data.requestId,message:String(error)}));
};
