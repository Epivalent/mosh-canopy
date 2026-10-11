// CLIP byte-level BPE, using the SD-Turbo checkpoint's own vocabulary/merges.
export class NativeTokenizer {
 static async load(base,spec){
  const [vocab,merges]=await Promise.all([fetch(base+spec.vocab).then(r=>r.json()),fetch(base+spec.merges).then(r=>r.text())]);
  return new NativeTokenizer(vocab,merges,spec);
 }
 constructor(vocab,merges,spec){
  this.vocab=vocab;this.spec=spec;this.cache=new Map();this.ranks=new Map(merges.split('\n').slice(1).filter(x=>x.trim()&&!x.startsWith('#')).map((line,i)=>[line.trim(),i]));
  const kept=[...Array.from({length:94},(_,i)=>i+33),...Array.from({length:12},(_,i)=>i+161),...Array.from({length:82},(_,i)=>i+174)];
  this.bytes=new Map(kept.map(x=>[x,String.fromCodePoint(x)]));let n=256;
  for(let i=0;i<256;i++)if(!this.bytes.has(i))this.bytes.set(i,String.fromCodePoint(n++));
 }
 bpe(word){
  if(this.cache.has(word))return this.cache.get(word);
  let parts=[...word];parts[parts.length-1]+='</w>';
  while(parts.length>1){
   let best=Infinity,pair;
   for(let i=0;i<parts.length-1;i++){const key=parts[i]+' '+parts[i+1],rank=this.ranks.get(key);if(rank!==undefined&&rank<best){best=rank;pair=[parts[i],parts[i+1]];}}
   if(!pair)break;
   const next=[];for(let i=0;i<parts.length;i++){if(parts[i]===pair[0]&&parts[i+1]===pair[1])next.push(parts[i++]+parts[i]);else next.push(parts[i]);}parts=next;
  }
  const ids=parts.map(p=>{const id=this.vocab[p];if(id===undefined)throw Error('Unknown CLIP token');return id;});this.cache.set(word,ids);return ids;
 }
 encode(text){
  const s=this.spec,ids=[s.bos],encoder=new TextEncoder();
  const words=text.normalize('NFC').toLowerCase().trim().replace(/\s+/gu,' ').match(/'s|'t|'re|'ve|'m|'ll|'d|[\p{L}]+|[\p{N}]|[^\s\p{L}\p{N}]+/gu)||[];
  for(const word of words)ids.push(...this.bpe([...encoder.encode(word)].map(b=>this.bytes.get(b)).join('')));
  ids.length=Math.min(ids.length,s.length-1);ids.push(s.eos);while(ids.length<s.length)ids.push(s.pad);return new Int32Array(ids);
 }
}
