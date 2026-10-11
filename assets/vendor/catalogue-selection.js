/* One metadata predicate for exploration and concordance. No media is loaded. */
globalThis.CatalogueSelection={
 readCategories(el){return [...el.querySelectorAll('input:checked')].map(i=>i.value).filter(v=>v!=='all');},
 writeCategories(el,values=[]){for(const i of el.querySelectorAll('input'))i.checked=i.value==='all'?!values.length:values.includes(i.value);},
 changeCategories(el,target){this.writeCategories(el,target?.value==='all'&&target.checked?[]:this.readCategories(el));},
 normalize(s={}){const categories=s.categories??(s.category&&s.category!=='all'?[s.category]:[]),year=x=>x===''||x==null?null:Number(x);return {source:s.source||'mixed',enabled:s.enabled!==false,mix:s.mix==null?35:Number(s.mix),categories:[...new Set(categories.filter(c=>c!=='all'))].sort(),decade:String(s.decade||'all'),era:String(s.era||'all'),yearFrom:year(s.yearFrom),yearTo:year(s.yearTo),collection:s.collection||'all',neonEnabled:s.neonEnabled!==false,neonCategories:[...new Set(s.neonCategories||[])].sort(),neonBrand:s.neonBrand||'all',neonStation:s.neonStation||'all',neonTape:s.neonTape||'all'};},
 usesMIA(s){return !(s.enabled&&(['retro','neon'].includes(s.source)||s.source==='mixed'&&s.mix===100));},
 usesYouTube(s){return s.enabled&&s.source!=='mia'&&(['retro','neon'].includes(s.source)||s.mix>0);},
 neonMatches(film,s){return (film?.entries||[]).some(e=>{const y=Number.parseInt(e.year),end=/^\d{4}s$/.test(e.year)?y+9:y;return (s.yearFrom===null||end>=s.yearFrom)&&(s.yearTo===null||y<=s.yearTo)&&(!s.neonCategories.length||s.neonCategories.includes(e.category))&&(s.neonBrand==='all'||e.brand===s.neonBrand)&&(s.neonStation==='all'||e.station===s.neonStation)&&(s.neonTape==='all'||e.tape===s.neonTape);});},
 yearMatches(year,s){const y=Number.parseInt(year);return (s.yearFrom===null||Number.isFinite(y)&&y>=s.yearFrom)&&(s.yearTo===null||Number.isFinite(y)&&y<=s.yearTo);},
 retroMatches(tags,s){return tags.some(([year,category])=>(s.decade==='all'||Math.floor(year/10)*10===Number(s.decade))&&(!s.categories.length||s.categories.includes(category))&&this.yearMatches(year,s));},
 accepts(id,film,s){const retro=String(id).startsWith('yt:');
  if(retro){if(!this.usesYouTube(s))return false;if(film?.source==='neon')return s.source!=='retro'&&(s.source==='neon'||s.neonEnabled)&&this.neonMatches(film,s);if(s.source==='neon')return false;const constrained=s.categories.length||s.decade!=='all'||s.yearFrom!==null||s.yearTo!==null;return !constrained||this.retroMatches(film?.tags||[],s);}
  if(!this.usesMIA(s))return false;
  if(s.collection!=='all'&&!film?.collections?.includes(s.collection))return false;
  if(!this.yearMatches(film?.year,s))return false;const y=Number.parseInt(film?.year),era=s.era;
  return era==='all'||(era==='unknown'?!Number.isFinite(y):era==='early'?y<1950:era==='modern'?y>=2000:Math.floor(y/10)*10===Number(era));
 },
 enrichMIA(catalogue){const films=catalogue.films||Object.values(catalogue.pages).flat(),bySlug=new Map(films.map(f=>[f.sourceSlug,f]));for(const film of films)film.collections=[];for(const collection of catalogue.collections||[])for(const item of catalogue.pages['/collection/'+collection.slug]||[]){const f=bySlug.get(item.sourceSlug);if(f&&!f.collections.includes(collection.slug))f.collections.push(collection.slug);}return films;}
};
