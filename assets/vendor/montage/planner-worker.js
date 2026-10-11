// Query the published positional index in a dedicated worker. No corpus rebuild,
// laboratory server, or whole-database download is needed by visitors.
importScripts('https://epivalent.github.io/mosh-canopy/assets/vendor/retrotv-published.js?v=7','https://epivalent.github.io/mosh-canopy/assets/vendor/catalogue-selection.js?v=neon1','https://epivalent.github.io/mosh-canopy/assets/vendor/catalogue-metadata.js?v=neon1','https://epivalent.github.io/mosh-canopy/assets/vendor/retrotv-caption-index.js?v=9');
const metadata=new CatalogueMetadata();
const core=import('./plan-core.mjs');
let miaPublication,retroPublication,cacheRevision,selectedScope;
const termCache=new Map();
const ordinalCodec=import('./ordinal-postings.mjs');
// Position arrays are sorted. Probe from the rarest term rather than expanding
// common prefixes ("the", "and", …) across the entire archive.
function contains(positions,wanted){let lo=0,hi=positions.length;while(lo<hi){const mid=(lo+hi)>>>1;if(positions[mid]<wanted)lo=mid+1;else hi=mid;}return positions[lo]===wanted;}
onmessage=async({data})=>{const {id,text,seed=1,maxGap=.65,selection}=data;
 try{
  const started=performance.now(),{tokens,normalize,random,bestPath,cutBounds}=await core,words=tokens(text);
  if(!words.length)throw Error('Enter some text to borrow.');
  postMessage({id,progress:'Finding intact phrases in the published transcripts…'});
  const scope=selection?CatalogueSelection.normalize(selection):null;
  const useMIA=!scope||CatalogueSelection.usesMIA(scope);
  const useRetro=!scope||CatalogueSelection.usesYouTube(scope);
  const publication=useMIA?(miaPublication??=new RetroPublishedCaptions('https://mosh-canopy-assets.moshcanopy.workers.dev/assets/transcripts/search/')):null;
  const retro=useRetro?(retroPublication??=new RetroCaptionIndex()):null;
  const selectionKey=JSON.stringify(scope);if(selectedScope?.key!==selectionKey)selectedScope={key:selectionKey,task:metadata.selection(scope)};
  const [catalog,retroCatalog,filter,neonCatalog]=await Promise.all([useMIA?metadata.mia():new Map(),useRetro&&scope?.source!=='neon'?metadata.retro():null,selectedScope.task,useRetro?metadata.neon():null]);
  const sources=[publication,retro].filter(Boolean);
  await Promise.all(sources.map(s=>(s.published||s).load()));
  const revision=sources.map(s=>(s.published||s).index?.revision).join('|');if(revision!==cacheRevision){termCache.clear();cacheRevision=revision;}
  const documents=(await Promise.all(sources.map(s=>s.documents()))).flat();
  const accept=filmId=>filter.accept(filmId)&&(filmId.startsWith('yt:')?useRetro:catalog.has(filmId));
  const metadataMs=performance.now()-started,wanted=new Set(words);
  for(const key of termCache.keys())if(!wanted.has(key.slice(key.indexOf(':')+1)))termCache.delete(key);
  const unique=[...wanted],lists=new Map(await Promise.all(unique.map(async word=>{
   const postings=new Map((await Promise.all(sources.map(async s=>{
    const published=s.published||s,key=(s.published?'retro:':'mia:')+word;
    let positions=termCache.get(key);if(!positions){const record=await published.termRecord(word,'ordinals');
    positions=record?(await ordinalCodec).decodeOrdinals(record):new Map([...(await published.postings(word))].map(([id,ps])=>[id,Uint32Array.from(ps,p=>p[0])]));
    termCache.set(key,positions);}
    // Local captions can change while the panel is open; merge them afresh.
    positions=new Map(positions);
    if(s.localPostings)for(const [id,ps]of await s.localPostings(word))if(!published.docs?.[id])positions.set(id,Uint32Array.from(ps,p=>p[0]));
    return positions;
   }))).flatMap(m=>[...m]));
   return [word,new Map([...postings].filter(([filmId])=>accept(filmId)))];
  })));
  const postingsMs=performance.now()-started-metadataMs;
  const frequency=new Map([...lists].map(([word,films])=>[word,[...films.values()].reduce((n,ps)=>n+ps.length,0)]));
  function matches(from,to,first=false){
   const offsets=Array.from({length:to-from},(_,i)=>i).sort((a,b)=>frequency.get(words[from+a])-frequency.get(words[from+b]));
   const anchor=offsets[0],out=new Map();
   for(const [filmId,positions]of lists.get(words[from+anchor])){
    const rest=offsets.slice(1).map(offset=>({offset,positions:lists.get(words[from+offset]).get(filmId)}));if(rest.some(r=>!r.positions))continue;
    const found=[];for(const position of positions){const start=position-anchor;if(start<0||!rest.every(r=>contains(r.positions,start+r.offset)))continue;
     found.push(start);if(first){out.set(filmId,found);return out;}}
    if(found.length)out.set(filmId,found);
   }return out;
  }
  const edges=words.map(()=>[]),existence=new Map();
  for(let from=0;from<words.length;from++)for(let to=from+1;to<=words.length;to++){
   const phrase=words.slice(from,to).join(' ');let exists=existence.get(phrase);
   if(exists===undefined){exists=matches(from,to,true).size>0;existence.set(phrase,exists);}
   if(!exists)break;edges[from].push(to);
  }
  const matchingMs=performance.now()-started-metadataMs-postingsMs;
  const rng=random(seed),chosen=new Map(),films=new Map();let path,again;
  do{again=false;path=bestPath(words,edges).path;let previous;
   for(const e of path){if(e.missing)continue;const key=e.from+':'+e.to;
    if(!chosen.has(key)){
     const candidates=[...matches(e.from,e.to)];for(let i=candidates.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}
     candidates.sort((a,b)=>(a[0]===previous)-(b[0]===previous));let clip;
     for(const [filmId,positions]of candidates){
      let film=films.get(filmId);if(!film){film=await (filmId.startsWith('yt:')?retro:publication).film(filmId);films.set(filmId,film);}if(!film?.words?.length)continue;
      const ws=film.words,valid=[];
      for(const index of positions){if(!words.slice(e.from,e.to).every((word,j)=>normalize(ws[index+j]?.text||'')===word))continue;
       const bounds=cutBounds(ws,index,e.to-e.from);if(bounds&&bounds.maxGap<=maxGap)valid.push({index,...bounds});}
      if(!valid.length)continue;
      const hit=valid[Math.floor(rng()*valid.length)],isRetro=filmId.startsWith('yt:'),length=e.to-e.from;
      const tags=retroCatalog?.byId.get(filmId)?.[1]||[];
      const meta=isRetro?(neonCatalog?.byId.get(filmId)?{...neonCatalog.byId.get(filmId),direct:true,duration:film.duration}:{id:filmId,youtubeId:filmId.slice(3),title:film.title,year:tags[0]?.[0],tags,
       categories:[...new Set(tags.map(t=>retroCatalog.index.categories[t[1]]))],page:'https://www.youtube.com/watch?v='+filmId.slice(3),
       catalogue:'https://www.myretrotvs.com/',direct:true,duration:film.duration}):catalog.get(filmId);
      const url=isRetro?null:new URL(meta.mp4);
      clip={...e,...hit,filmId,title:film.title||meta.title,source:isRetro?'youtube':'mia',url:url?'https://mosh-canopy-assets.moshcanopy.workers.dev/film'+url.pathname+url.search:null,film:meta,
       text:ws.slice(hit.index,hit.index+length).map(w=>w.text).join(' '),words:ws.slice(hit.index,hit.index+length),before:ws.slice(Math.max(0,hit.index-4),hit.index),after:ws.slice(hit.index+length,hit.index+length+4),timing:isRetro?'caption-word-estimate':'voz-word-estimate'};break;
     }
     if(clip)chosen.set(key,clip);else{edges[e.from]=edges[e.from].filter(to=>to!==e.to);again=true;break;}
    }
    previous=chosen.get(key).filmId;
   }
  }while(again);
  const clips=path.map(e=>e.missing?{...e,text:words[e.from]}:chosen.get(e.from+':'+e.to));
  postMessage({id,result:{text,seed,clips,missing:clips.filter(c=>c.missing).map(c=>c.text),duration:clips.reduce((n,c)=>n+(c.missing?0:c.end-c.start),0),films:documents.filter(d=>accept(d.id)).length,ms:performance.now()-started,timings:{metadataMs,postingsMs,matchingMs,selectionMs:performance.now()-started-metadataMs-postingsMs-matchingMs}}});
 }catch(error){selectedScope=null;postMessage({id,error:error.message});}
};
