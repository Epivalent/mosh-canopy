/* The material library belongs to the whole archive exploration, not to a film or panel. */
(function(){
  class CollageBank{
    constructor(){this.items=new Map();this.db=null;this.ready=this.open();}
    async open(){try{this.db=await new Promise((resolve,reject)=>{const r=indexedDB.open('mosh-collage-materials',1);r.onupgradeneeded=()=>r.result.createObjectStore('cutouts',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
      const rows=await new Promise((resolve,reject)=>{const r=this.db.transaction('cutouts').objectStore('cutouts').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
      for(const row of rows)if(!this.items.has(row.id))this.items.set(row.id,row);
    }catch(e){console.warn('Collage library is available for this session only',e.message);}return this;}
    async put(item){this.items.set(item.id,item);await this.ready;if(!this.db)return;
      const {id,label,title,year,filmId,sourcePage,time,width,height,blob,usedCount=0,originalResolution=false,confidence=0,extractionSource,previewTime,previewUrl}=item;
      const record={id,label,title,year,filmId,sourcePage,time,width,height,blob,usedCount,originalResolution,confidence,extractionSource,previewTime,previewUrl,landed:true};
      return new Promise(resolve=>{const tx=this.db.transaction('cutouts','readwrite');tx.objectStore('cutouts').put(record);tx.oncomplete=resolve;tx.onerror=()=>{console.warn('Could not persist clipping',tx.error?.message);resolve();};});
    }
    select(limit=48){
      // Stratify over the entire library. Older, unused material remains eligible forever.
      const candidates=[...this.items.values()].filter(i=>i.blob&&i.width>=48&&i.height>=40),out=[],films=new Map(),labels=new Map();
      while(out.length<limit&&candidates.length){let best=0,score=-Infinity;
        for(let n=0;n<candidates.length;n++){const i=candidates[n],film=i.filmId||i.title,s=Math.log2(Math.max(1,i.width*i.height))*.12-(i.usedCount||0)*.8-(films.get(film)||0)*2.5-(labels.get(i.label)||0)*.32;
          if(s>score){score=s;best=n;}}
        const [item]=candidates.splice(best,1);out.push(item);const film=item.filmId||item.title;films.set(film,(films.get(film)||0)+1);labels.set(item.label,(labels.get(item.label)||0)+1);
      }return out;
    }
    stats(){return {cutouts:this.items.size,films:new Set([...this.items.values()].map(i=>i.filmId||i.title)).size};}
  }
  window.CollageBank=CollageBank;
})();
