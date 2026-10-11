// Query the published positional index in a dedicated worker. No corpus rebuild,
// laboratory server, or whole-database download is needed by visitors.
importScripts('https://epivalent.github.io/mosh-canopy/assets/vendor/retrotv-published.js?v=7','https://epivalent.github.io/mosh-canopy/assets/vendor/catalogue-selection.js?v=neon1','https://epivalent.github.io/mosh-canopy/assets/vendor/catalogue-metadata.js?v=neon1','https://epivalent.github.io/mosh-canopy/assets/vendor/retrotv-caption-index.js?v=9');
const metadata=new CatalogueMetadata();
const core=import('./plan-core.mjs?v=casting2');
let miaPublication,retroPublication,cacheRevision,selectedScope;
const termCache=new Map();
const ordinalCodec=import('./ordinal-postings.mjs');
// Position arrays are sorted. Probe from the rarest term rather than expanding
// common prefixes ("the", "and", …) across the entire archive.
function contains(positions,wanted){let lo=0,hi=positions.length;while(lo<hi){const mid=(lo+hi)>>>1;if(positions[mid]<wanted)lo=mid+1;else hi=mid;}return positions[lo]===wanted;}
onmessage=async({data})=>{const {id,text,seed=1,maxGap=.65,selection,previousFilms=[]}=data;
 try{
  const started=performance.now(),{tokens,normalize,random,bestPath,castFilms,cutBounds}=await core,words=tokens(text);
  if(!words.length)throw Error('Enter some text to borrow.');
  postMessage({id,progress:'Finding intact phrases in the published transcripts…'});
  const scope=selection?CatalogueSelection.normalize(selection):null;
  const useMIA=!scope||CatalogueSelection.usesMIA(scope);
  const useRetro=!scope||CatalogueSelection.usesYouTube(scope);
  const publication=useMIA?(miaPublication??=new RetroPublishedCaptions('https://pub-fd77318b30094f8a923cae6a232a72fa.r2.dev/assets/transcripts/search/')):null;
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
  function matches(from,to,first=false,exclude){
   const offsets=Array.from({length:to-from},(_,i)=>i).sort((a,b)=>frequency.get(words[from+a])-frequency.get(words[from+b]));
   const anchor=offsets[0],out=new Map();
   for(const [filmId,positions]of lists.get(words[from+anchor])){
    if(exclude?.has(filmId))continue;
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
  const rng=random(seed),films=new Map(),options=new Map(),validated=new Map(),previous=new Set(previousFilms),fresh=new Map();
  // Recasting makes novelty part of the phrase layout, not merely a shuffle
  // after the same mandatory long phrase has already been selected.
  if(previous.size)for(let from=0;from<words.length;from++)for(const to of edges[from])fresh.set(from+':'+to,matches(from,to,true,previous).size>0);
  function candidates(e){
   const key=e.from+':'+e.to;if(!options.has(key)){
    const rows=[...matches(e.from,e.to)];for(let i=rows.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[rows[i],rows[j]]=[rows[j],rows[i]];}
    options.set(key,new Map(rows));
   }return [...options.get(key).keys()];
  }
  async function validate(e,filmId){
   const key=e.from+':'+e.to+':'+filmId;if(validated.has(key))return validated.get(key);
   let film=films.get(filmId);if(!film){film=await (filmId.startsWith('yt:')?retro:publication).film(filmId);films.set(filmId,film);}
   let clip=null;
   if(film?.words?.length){
    const ws=film.words,valid=[];
    for(const index of options.get(e.from+':'+e.to).get(filmId)){
     if(!words.slice(e.from,e.to).every((word,j)=>normalize(ws[index+j]?.text||'')===word))continue;
     const bounds=cutBounds(ws,index,e.to-e.from);if(bounds&&bounds.maxGap<=maxGap)valid.push({index,...bounds});
    }
    if(valid.length){
     const hit=valid[Math.floor(rng()*valid.length)],isRetro=filmId.startsWith('yt:'),length=e.to-e.from;
     const tags=retroCatalog?.byId.get(filmId)?.[1]||[];
     const meta=isRetro?(neonCatalog?.byId.get(filmId)?{...neonCatalog.byId.get(filmId),direct:true,duration:film.duration}:{id:filmId,youtubeId:filmId.slice(3),title:film.title,year:tags[0]?.[0],tags,
      categories:[...new Set(tags.map(t=>retroCatalog.index.categories[t[1]]))],page:'https://www.youtube.com/watch?v='+filmId.slice(3),
      catalogue:'https://www.myretrotvs.com/',direct:true,duration:film.duration}):catalog.get(filmId);
     const url=isRetro?null:new URL(meta.mp4);
     clip={...e,...hit,filmId,title:film.title||meta.title,source:isRetro?'youtube':'mia',url:url?'https://mosh-canopy-assets.moshcanopy.workers.dev/film'+url.pathname+url.search:null,film:meta,
      text:ws.slice(hit.index,hit.index+length).map(w=>w.text).join(' '),words:ws.slice(hit.index,hit.index+length),before:ws.slice(Math.max(0,hit.index-4),hit.index),after:ws.slice(hit.index+length,hit.index+length+4),timing:isRetro?'caption-word-estimate':'voz-word-estimate'};
    }
   }validated.set(key,clip);return clip;
  }
  let path,cast,again;
  do{
   again=false;path=bestPath(words,edges,previous.size?{repeatCost:(from,to)=>fresh.get(from+':'+to)?0:to-from}:{}).path;
   cast=await castFilms(path,candidates,validate,{preferred:id=>!previous.has(id)});
   for(const e of cast.missing){edges[e.from]=edges[e.from].filter(to=>to!==e.to);again=true;}
   // Positional matches can have unusable timings. If every genuinely usable
   // take of a phrase is old, reconsider shorter fresh phrases before reusing it.
   if(previous.size)for(const e of path)if(!e.missing&&fresh.get(e.from+':'+e.to)&&!cast.hasPreferred(e)){fresh.set(e.from+':'+e.to,false);again=true;}
  }while(again);
  const clips=path.map(e=>e.missing?{...e,text:words[e.from]}:cast.chosen.get(e));
  postMessage({id,result:{text,seed,clips,missing:clips.filter(c=>c.missing).map(c=>c.text),duration:clips.reduce((n,c)=>n+(c.missing?0:c.end-c.start),0),films:documents.filter(d=>accept(d.id)).length,ms:performance.now()-started,timings:{metadataMs,postingsMs,matchingMs,selectionMs:performance.now()-started-metadataMs-postingsMs-matchingMs}}});
 }catch(error){selectedScope=null;postMessage({id,error:error.message});}
};
