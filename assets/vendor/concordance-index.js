/* Shared worker index: one occurrence per timed word, persisted in IndexedDB. */
self.ConcordanceIndex=class ConcordanceIndex {
  constructor({persistent=true}={}){this.films=new Map();this.terms=new Map();this.db=null;this.persist=Promise.resolve();this.sheetLayouts=new Map();this.wordWidths=new Map();this.glyphWidths=new Map();this.pairWidths=new Map();this.ready=persistent?this.restore():Promise.resolve();}
  normalize(s){return s.normalize('NFKC').toLowerCase().replace(/’/g,"'").replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,'');}
  tokens(s){return s.split(/\s+/u).map(w=>this.normalize(w)).filter(Boolean);}
  hits(tokens,onlyId){
    if(!tokens.length)return new Map();
    if(onlyId&&this.films.get(onlyId)?.indexed===false){const words=this.films.get(onlyId).film.words,positions=[];for(let i=0;i<=words.length-tokens.length;i++)if(tokens.every((t,j)=>this.normalize(words[i+j].text)===t))positions.push(i);return positions.length?new Map([[onlyId,positions]]):new Map();}
    // Start with the rarest indexed word, then verify adjacent transcript words.
    // This keeps phrase searches in the worker and retains original word times.
    const postings=tokens.map(t=>this.terms.get(t));if(postings.some(p=>!p))return new Map();
    let anchor=0;for(let i=1;i<postings.length;i++)if(postings[i].size<postings[anchor].size)anchor=i;
    const candidates=onlyId?[[onlyId,postings[anchor].get(onlyId)||[]]]:postings[anchor],result=new Map();
    for(const [id,positions]of candidates){const words=this.films.get(id).film.words;
      const starts=positions.map(p=>p-anchor).filter(start=>start>=0&&start+tokens.length<=words.length&&tokens.every((t,i)=>this.normalize(words[start+i].text)===t));
      if(starts.length)result.set(id,starts);
    }
    return result;
  }
  async restore(){
    if(typeof indexedDB==='undefined')return;
    try{this.db=await new Promise((resolve,reject)=>{const r=indexedDB.open('mosh-concordance',1);r.onupgradeneeded=()=>{r.result.createObjectStore('films',{keyPath:'id'});r.result.createObjectStore('terms',{keyPath:'term'});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
      const docs=await new Promise((resolve,reject)=>{const r=this.db.transaction('films').objectStore('films').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
      for(const f of docs)this.add(f.id,f.film,f.signature);
    }catch(error){this.db=null;console.warn('Concordance persistence unavailable:',error);}
  }
  signature(f){let h=2166136261;const s=String(f.complete)+'|'+f.status+'|'+JSON.stringify(f.ranges||[])+'|'+f.words.map(w=>w.text+'@'+w.start+':'+w.end).join('|');for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0;}
  add(id,film,signature,indexed=true){
    const changed=new Set(),old=this.films.get(id);
    if(old?.indexed!==false&&old)for(const w of old.film.words){const term=this.normalize(w.text);this.terms.get(term)?.delete(id);changed.add(term);}
    if(indexed)film.words.forEach((w,index)=>{const term=this.normalize(w.text);if(!term)return;
      if(!this.terms.has(term))this.terms.set(term,new Map());const map=this.terms.get(term);if(!map.has(id))map.set(id,[]);map.get(id).push(index);changed.add(term);});
    this.films.set(id,{film,signature,indexed});return changed;
  }
  async ingest(films){await this.ready;const changed=new Set(),docs=[],removed=[];
    // A cache is a complete snapshot: remove obsolete clip IDs when moving to
    // full source films, and never retain search hits from an older catalog.
    for(const [id,old]of this.films)if(!Object.hasOwn(films,id)){
      for(const w of old.film.words){const term=this.normalize(w.text),map=this.terms.get(term);map?.delete(id);if(map&&!map.size)this.terms.delete(term);changed.add(term);}
      this.films.delete(id);removed.push(id);
    }
    for(const [id,film]of Object.entries(films)){const signature=this.signature(film);if(this.films.get(id)?.signature===signature)continue;
      for(const term of this.add(id,film,signature))changed.add(term);docs.push({id,film,signature});}
    // Restore rebuilds postings from film documents. Persisting every shared
    // word's complete posting list on each live passage amplified writes hugely.
    if(this.db&&(docs.length||removed.length)){
      this.persist=this.persist.then(()=>new Promise((resolve,reject)=>{const tx=this.db.transaction('films','readwrite');for(const id of removed)tx.objectStore('films').delete(id);for(const d of docs)tx.objectStore('films').put(d);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);})).catch(e=>console.warn('Concordance cache write:',e));
    }
    return {films:this.films.size,terms:this.terms.size,persistent:!!this.db,updated:docs.map(d=>d.id)};
  }
  async upsert(id,film){await this.ready;const signature=this.signature(film);if(this.films.get(id)?.signature===signature)return {films:this.films.size,terms:this.terms.size,updated:[]};this.add(id,film,signature);
    if(this.db)this.persist=this.persist.then(()=>new Promise((resolve,reject)=>{const tx=this.db.transaction('films','readwrite');tx.objectStore('films').put({id,film,signature});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);})).catch(e=>console.warn('Concordance cache write:',e));
    return {films:this.films.size,terms:this.terms.size,updated:[id]};
  }
  async query(word,mode='first',seed=0,accept=()=>true){await this.ready;const tokens=this.tokens(word),term=tokens.join(' '),hits=this.hits(tokens);let occurrences=0;
    const results=[...hits].filter(([id])=>accept(id)).map(([id,indices])=>{occurrences+=indices.length;const film=this.films.get(id).film;
      let hash=seed|0;for(const c of id)hash=Math.imul(hash^c.charCodeAt(0),16777619);const index=indices[mode==='random'?(hash>>>0)%indices.length:0];
      return {id,title:film.title,index,start:film.words[index].start,matches:indices.length,context:film.words.slice(Math.max(0,index-5),index+Math.max(8,tokens.length+3)).map(w=>w.text).join(' ')};
    }).sort((a,b)=>a.title.localeCompare(b.title)||a.id.localeCompare(b.id));
    return {term,mode,occurrences,results,indexedFilms:this.films.size};
  }
  async captions(id){await this.ready;const words=this.films.get(id)?.film.words||[],cues=[];let lines=[[]],length=0,start=0,last=null;
    const flush=()=>{if(!last)return;cues.push({start,end:last.end,lines});lines=[[]];length=0;last=null;};
    for(const w of words){
      if(last&&(w.start-last.end>.7||w.end-start>5.5))flush();
      if(length+w.text.length+1>40&&lines.at(-1).length){if(lines.length===2)flush();else{lines.push([]);length=0;}}
      if(!last)start=w.start;lines.at(-1).push({text:w.text,start:w.start,end:w.end});length+=w.text.length+1;last=w;
      if(/[.!?][”"']?$/.test(w.text))flush();
    }
    flush();for(let i=0;i<cues.length;i++)cues[i].end=Math.min(cues[i+1]?.start??Infinity,cues[i].end+.18);
    return cues;
  }
  async layoutSheet(id,index,term,cache=new Map(),fast=false){await this.ready;const film=this.films.get(id)?.film;if(!film)throw Error('Transcript unavailable');
    const W=1280,margin=72,anchorX=600,font=28,lineHeight=44,header=122;
    const measure=new OffscreenCanvas(1,1).getContext('2d');measure.font=`${font}px Georgia`;
    const widths=film.words.map(w=>{if(!cache.has(w.text))cache.set(w.text,fast?this.textWidth(w.text,measure):measure.measureText(w.text).width);return cache.get(w.text);}),space=measure.measureText(' ').width;
    index=Math.max(0,Math.min(film.words.length-1,index));
    const before=[];let current=[],length=0,limit=anchorX-margin-space;
    for(let i=index-1;i>=0;i--){if(current.length&&length+space+widths[i]>limit){before.push({indices:current.reverse(),width:length});current=[];length=0;limit=W-margin*2;}
      current.push(i);length+=widths[i]+(current.length>1?space:0);}
    if(current.length)before.push({indices:current.reverse(),width:length});
    const boxes=[];const preceding=Math.max(0,before.length-1),anchorY=header+preceding*lineHeight+font;
    before.forEach((line,j)=>{let x=j===0?anchorX-space-line.width:margin;for(const i of line.indices){boxes.push({index:i,x,y:anchorY-j*lineHeight-font,width:widths[i],height:lineHeight,start:film.words[i].start,text:film.words[i].text});x+=widths[i]+space;}});
    let x=anchorX,y=anchorY-font;
    for(let i=index;i<film.words.length;i++){if(x+widths[i]>W-margin){x=margin;y+=lineHeight;}boxes.push({index:i,x,y,width:widths[i],height:lineHeight,start:film.words[i].start,text:film.words[i].text});x+=widths[i]+space;}
    const H=Math.max(380,y+font+82),tokens=this.tokens(term),matched=new Set();
    for(const start of this.hits(tokens,id).get(id)||[])for(let i=0;i<tokens.length;i++)matched.add(start+i);
    const layout={id,index,term,film,boxes,W,H,margin,font,tokens,matched,anchorX,anchorY:anchorY-font/2};
    return layout;
  }
  async sheet(id,index,term){const layout=await this.layoutSheet(id,index,term),{boxes,W,H,anchorX}=layout;
    const key=JSON.stringify([id,index,term]);this.sheetLayouts.set(key,layout);while(this.sheetLayouts.size>24)this.sheetLayouts.delete(this.sheetLayouts.keys().next().value);
    const scale=Math.min(1,2048/H),bitmap=await this.paintSheet(layout,0,H,scale);
    return {bitmap,boxes,width:W,height:H,anchorX,anchorY:layout.anchorY,id,index,tiled:scale<1,tileHeight:1536};

  }
  textWidth(text,measure){
    // Cache font advances and kerning pairs across the corpus instead of asking
    // Canvas to shape every distinct full word during each search.
    let width=0,previous=null;
    for(const ch of text){if(!this.glyphWidths.has(ch))this.glyphWidths.set(ch,measure.measureText(ch).width);
      const advance=this.glyphWidths.get(ch);width+=advance;
      if(previous!==null){const pair=previous+ch;if(!this.pairWidths.has(pair))this.pairWidths.set(pair,measure.measureText(pair).width-this.glyphWidths.get(previous)-advance);width+=this.pairWidths.get(pair);}previous=ch;
    }
    return width;
  }
  async prepareStack(results,term,cancelled=()=>false){
    const started=performance.now();let layoutMs=0,packMs=0;
    const pages=[],cache=this.wordWidths,characters=new Set('0123456789 .,:;!?“”·—()secondswordsclickanywordtoenteritsfilm'),wordIds=new Map(),vocabulary=[];
    for(const result of results){
      if(cancelled())throw Error('Search superseded');
      const t=performance.now(),l=await this.layoutSheet(result.id,result.index,term,cache,true);layoutMs+=performance.now()-t;const packStart=performance.now(),positions=new Float32Array(l.film.words.length*4),matches=new Uint8Array(l.film.words.length);
      for(const b of l.boxes){positions.set([b.x,b.y,b.width,b.start],b.index*4);matches[b.index]=l.matched.has(b.index)?(b.index>=l.index&&b.index<l.index+l.tokens.length?2:1):0;}
      // Transfer repeated words as integer IDs. Sending every occurrence as a
      // separate string array makes the main thread rebuild the entire corpus
      // object graph before it can present the aligned stack.
      const words=new Uint32Array(l.film.words.length);
      for(let i=0;i<words.length;i++){const text=l.film.words[i].text;let id=wordIds.get(text);
        if(id===undefined){id=vocabulary.length;wordIds.set(text,id);vocabulary.push(text);for(const ch of text)characters.add(ch);}words[i]=id;}
      for(const text of [l.film.title,term])for(const ch of text)characters.add(ch);
      pages.push({id:l.id,index:l.index,start:l.film.words[l.index].start,width:l.W,height:l.H,anchorX:l.anchorX,anchorY:l.anchorY,positions,matches,words,title:l.film.title,duration:l.film.duration});
      packMs+=performance.now()-packStart;
      // Yield between films so live captions and ribbon updates can still run.
      await (self.scheduler?.yield?self.scheduler.yield():new Promise(resolve=>setTimeout(resolve,0)));
    }
    if(cancelled())throw Error('Search superseded');
    const measure=new OffscreenCanvas(1,1).getContext('2d');measure.font='28px Georgia';
    const glyphs={},W=2048,pad=4,lineHeight=40;let x=0,y=0;
    for(const ch of characters){const metrics=measure.measureText(ch),left=Math.ceil(Math.max(0,metrics.actualBoundingBoxLeft||0)),advance=metrics.width;
      const width=Math.ceil(Math.max(advance,metrics.actualBoundingBoxRight||0))+left+pad*2;
      if(x+width>W){x=0;y+=lineHeight;}glyphs[ch]={x,y,width,height:lineHeight,advance,left,pad};x+=width;
    }
    if(cache.size>250000)this.wordWidths=new Map();
    const H=y+lineHeight,canvas=new OffscreenCanvas(W,H),ctx=canvas.getContext('2d');ctx.font='28px Georgia';ctx.fillStyle='white';
    for(const [ch,g]of Object.entries(glyphs))ctx.fillText(ch,g.x+g.pad+g.left,g.y+g.pad+28);
    const bitmap=await createImageBitmap(canvas,{imageOrientation:'flipY',premultiplyAlpha:'none'});
    if(cancelled()){bitmap.close();throw Error('Search superseded');}
    return {pages,atlas:{bitmap,width:W,height:H,glyphs,words:vocabulary},preparation:{ms:performance.now()-started,layoutMs,packMs,words:pages.reduce((n,p)=>n+p.words.length,0),uniqueWords:vocabulary.length}};
  }
  async paintSheet(layout,top,height,scale=1){
    const {W,H,margin,font,film,term,index,boxes,matched,tokens}=layout;
    const canvas=new OffscreenCanvas(Math.ceil(W*scale),Math.ceil(height*scale)),ctx=canvas.getContext('2d');ctx.scale(scale,scale);ctx.translate(0,-top);
    ctx.fillStyle='#e9e4d9';ctx.fillRect(0,top,W,height);ctx.fillStyle='#b53271';ctx.fillRect(0,top,7,height);
    if(top<122){ctx.fillStyle='#26252a';ctx.font='32px Georgia';let title=film.title;while(ctx.measureText(title).width>W-margin*2-40)title=title.slice(0,-2);ctx.fillText(title,margin,53);
      ctx.font='15px monospace';ctx.fillStyle='#6c6364';ctx.fillText('“'+term+'” · '+film.words[index].start.toFixed(2)+' s · click any word to enter its film',margin,84);
      ctx.strokeStyle='#b2a8a1';ctx.beginPath();ctx.moveTo(margin,98);ctx.lineTo(W-margin,98);ctx.stroke();}
    ctx.font=font+'px Georgia';
    for(const b of boxes){if(b.y+44<top||b.y>top+height)continue;const selected=matched.has(b.index)&&b.index>=index&&b.index<index+tokens.length;
      if(matched.has(b.index)){ctx.fillStyle=selected?'#e7afbd':'#e2cdd0';ctx.fillRect(b.x-3,b.y-2,b.width+6,font+10);}ctx.fillStyle=selected?'#712141':'#282832';ctx.fillText(b.text,b.x,b.y+font);}
    if(top+height>=H-40){ctx.font='14px monospace';ctx.fillStyle='#766b6d';ctx.fillText(film.words.length+' words · '+film.duration.toFixed(1)+' seconds',margin,H-27);}
    return await createImageBitmap(canvas,{imageOrientation:'flipY',premultiplyAlpha:'none'});
  }
  async sheetTile(id,index,term,tile){const key=JSON.stringify([id,index,term]);if(!this.sheetLayouts.has(key)){const overview=await this.sheet(id,index,term);overview.bitmap.close();}
    const layout=this.sheetLayouts.get(key),top=Math.max(0,tile)*1536,height=Math.min(1536,layout.H-top);if(height<=0)throw Error('Outside transcript');
    return {bitmap:await this.paintSheet(layout,top,height),top,height,width:layout.W};
  }

};
