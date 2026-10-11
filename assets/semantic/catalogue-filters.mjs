// The same source-specific metadata relationships as the app's catalogue.
// A film shared by catalogues matches if ANY selected membership matches;
// refinements within a catalogue must match the SAME entry/tag.
export const SOURCE_NAMES={MIA:'Moving Image Archive',MRT:'MyRetroTVs',Neon:'Neon Pulse'};
export function yearRange(value){
 const s=String(value??'');
 if(/^\d{4}s$/.test(s)){const y=Number(s.slice(0,4));return [y,y+9]}
 if(/^\d{4}$/.test(s))return [Number(s),Number(s)];
 return null;
}
function yearsMatch(value,f){
 if(!f.from&&!f.to)return true;
 const range=yearRange(value);if(!range)return !!f.includeUndated;
 return (!f.from||range[1]>=f.from)&&(!f.to||range[0]<=f.to);
}
export function matchingSources(p,f={}){
 const selected=f.sources??Object.keys(SOURCE_NAMES),out=[];
 for(const source of selected){const m=p.memberships?.[source];if(!m)continue;
  if(source==='MIA'){
   const s=f.mia||{},range=yearRange(m.year),era=s.era||'';
   if(!yearsMatch(m.year,f)||s.collection&&!m.collections.includes(s.collection))continue;
   if(era==='unknown'?range:era==='early'?(!range||range[0]>=1950):era==='modern'?(!range||range[1]<2000):era&&(!range||range[1]<Number(era)||range[0]>Number(era)+9))continue;
  }
  if(source==='MRT'){
   const s=f.mrt||{};
   if(!m.tags.some(([year,category])=>yearsMatch(year,f)&&(!s.decade||Math.floor(year/10)*10===Number(s.decade))&&(!s.categories?.length||s.categories.includes(category))))continue;
  }
  if(source==='Neon'){
   const s=f.neon||{};
   if(!m.entries.some(e=>yearsMatch(e.year,f)&&(!s.categories?.length||s.categories.includes(e.category))&&(!s.brand||s.brand===e.brand)&&(!s.station||s.station===e.station)&&(!s.tape||s.tape===e.tape)))continue;
  }
  out.push(source);
 }
 return out;
}
export function accepts(p,f={}){return matchingSources(p,f).length>0}
export function facets(rows){
 const unique=a=>[...new Set(a.filter(Boolean))].sort();
 const mia=rows.flatMap(p=>p.memberships?.MIA?[p.memberships.MIA]:[]),mrt=rows.flatMap(p=>p.memberships?.MRT?.tags||[]),neon=rows.flatMap(p=>p.memberships?.Neon?.entries||[]);
 return {mia:{collections:unique(mia.flatMap(m=>m.collections))},mrt:{categories:unique(mrt.map(t=>t[1])),decades:unique(mrt.map(t=>String(Math.floor(t[0]/10)*10)))},neon:{categories:unique(neon.map(e=>e.category)),brands:unique(neon.map(e=>e.brand)),stations:unique(neon.map(e=>e.station)),tapes:unique(neon.map(e=>e.tape))}};
}
export function filmLink(p){
 if(p.id.startsWith('yt:'))return `https://www.youtube.com/watch?v=${encodeURIComponent(p.id.slice(3))}&t=${Math.floor(p.start||0)}`;
 // Original source film, rather than incorrectly treating the UUID as YouTube.
 return p.media?`${p.media.split('#')[0]}#t=${Number(p.start||0).toFixed(2)}`:p.page;
}
