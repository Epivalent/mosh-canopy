/* Worker-owned metadata; cached downloads shared by overlapping requests. */
globalThis.CatalogueMetadata=class {
 async retro(){return this.retroTask??=(async()=>{const index=await this.json('https://mosh-canopy-assets.moshcanopy.workers.dev/assets/retrotv/index.json'),r=await fetch(new URL('https://mosh-canopy-assets.moshcanopy.workers.dev/assets/retrotv/'+index.file,self.location.origin));if(!r.ok)throw Error('MyRetroTVs catalogue unavailable');const rows=await new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).json();return {index,rows,byId:new Map(rows.map(row=>['yt:'+row[0],row]))};})().catch(e=>{this.retroTask=null;throw e;});}
 async neon(){return this.neonTask??=(async()=>{const r=await fetch(new URL('https://mosh-canopy-assets.moshcanopy.workers.dev/assets/neonpulse/catalog.json.gz',self.location.origin));if(!r.ok)throw Error('Neon Pulse catalogue unavailable: '+r.status);const data=await new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).json();return {...data,byId:new Map(data.films.map(f=>[f.id,f]))};})().catch(e=>{this.neonTask=null;throw e;});}
 async mia(){return this.miaTask??=this.json('https://mosh-canopy-assets.moshcanopy.workers.dev/assets/catalog.json').then(c=>new Map(CatalogueSelection.enrichMIA(c).map(f=>[f.id||f.mp4,f]))).catch(e=>{this.miaTask=null;throw e;});}
 async json(url){const r=await fetch(new URL(url,self.location.origin));if(!r.ok)throw Error('Catalogue metadata unavailable: '+r.status);return r.json();}
 async selection(raw){if(!raw)return {accept:()=>true,selected:null};const s=CatalogueSelection.normalize(raw),maps=[];
  const tasks=[];if(CatalogueSelection.usesYouTube(s)){if(s.source!=='neon')tasks.push(this.retro().then(d=>d.byId));tasks.push(this.neon().then(d=>d.byId));}if(CatalogueSelection.usesMIA(s))tasks.push(this.mia());maps.push(...await Promise.all(tasks));
  const selected=new Set();for(const map of maps)for(const [id,film]of map)if(CatalogueSelection.accepts(id,Array.isArray(film)?{tags:film[1]}:film,s))selected.add(id);
  return {accept:id=>selected.has(id)||!maps.some(map=>map.has(id))&&CatalogueSelection.accepts(id,null,s),selected};
 }
};
