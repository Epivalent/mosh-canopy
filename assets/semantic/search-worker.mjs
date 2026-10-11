import {BertTokenizer,AutoModel,AutoModelForSequenceClassification,Tensor,mean_pooling,env} from './vendor/transformers.min.js';
import {accepts} from './catalogue-filters.mjs';
env.allowRemoteModels=true;env.allowLocalModels=false;
env.backends.onnx.wasm.wasmPaths=new URL('./vendor/',import.meta.url).href;env.backends.onnx.wasm.numThreads=1;
let meta,films,owners,textRanges,tokenRanges,headerRanges,model,tokenizer,device,preparePromise,current,filterKey,eligibleCount,eligibleFilms;
let queryBuffer,lutBuffer,flagsBuffer,scoreBuffer,readBuffer,lutPipeline,lutBind,scanPipeline,scanChunks,exactPipeline;
let busy=false,pending=null,latestId=null;
let reranker,rerankTokenizer,rerankPromise,rerankConfig,rerankVocab,contextLabels,batchEstimateMs;
// Measured in this app: batches of 16 amortize dispatch overhead without the
// half-second dispatches seen at 64. Time, not a fixed candidate count, limits
// the query. One second is the user's interactive response requirement.
const RERANK_BATCH=16, RESPONSE_MS=1000;
// Yield via a task rather than a timer: background timer throttling must not
// add pauses between inference batches.
const yieldChannel=new MessageChannel(),yieldQueue=[];yieldChannel.port1.onmessage=()=>yieldQueue.shift()?.();
const yieldWorker=()=>globalThis.scheduler?.yield?globalThis.scheduler.yield():new Promise(resolve=>{yieldQueue.push(resolve);yieldChannel.port2.postMessage(null)});
function checkCurrent(s){if(s.id!==latestId)throw Error("Search superseded");}
const PAGE=10; // UI result cards per page, not a restriction on the searchable corpus.
const status=message=>postMessage({type:'status',message});
async function checked(url,options){const r=await fetch(new URL(url,'https://pub-fd77318b30094f8a923cae6a232a72fa.r2.dev/assets/semantic/'),options);if(!r.ok)throw Error(`${url}: HTTP ${r.status}`);return r}
async function json(url){const b=await(await checked(url)).arrayBuffer();if(new Uint8Array(b)[0]===31){const raw=await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).text();return JSON.parse(raw)}return JSON.parse(new TextDecoder().decode(b))}
const asset=name=>new URL(meta.base+name,'https://pub-fd77318b30094f8a923cae6a232a72fa.r2.dev/assets/semantic/').href;
const buffer=(data,usage)=>{const b=device.createBuffer({size:Math.ceil((typeof data==='number'?data:data.byteLength)/4)*4,usage});if(typeof data!=='number')device.queue.writeBuffer(b,0,data);return b};
const bind=(pipeline,buffers)=>device.createBindGroup({layout:pipeline.getBindGroupLayout(0),entries:buffers.map((b,binding)=>({binding,resource:{buffer:b}}))});
const compute=code=>device.createComputePipelineAsync({layout:'auto',compute:{module:device.createShaderModule({code}),entryPoint:'main'}});
async function prepare(){
 if(preparePromise)return preparePromise;
 preparePromise=(async()=>{
  const start=performance.now();if(!navigator.gpu)throw Error('WebGPU requires a supported browser and HTTPS or localhost.');
  status('Loading the local query model and catalogue index…');let modelMs,indexMs;
  await Promise.all([(async()=>{const t=performance.now();[tokenizer,model]=await Promise.all([Promise.all([json('https://huggingface.co/Xenova/all-MiniLM-L6-v2/resolve/751bff37182d3f1213fa05d7196b954e230abad9/tokenizer.json'),json('https://huggingface.co/Xenova/all-MiniLM-L6-v2/resolve/751bff37182d3f1213fa05d7196b954e230abad9/tokenizer_config.json')]).then(([a,b])=>new BertTokenizer(a,b)),AutoModel.from_pretrained('Xenova/all-MiniLM-L6-v2',{revision:'751bff37182d3f1213fa05d7196b954e230abad9',device:'webgpu',dtype:'fp16',local_files_only:false})]);modelMs=performance.now()-t})(),(async()=>{const t=performance.now();meta=await(await checked('https://pub-fd77318b30094f8a923cae6a232a72fa.r2.dev/assets/semantic/index.json',{cache:'no-store'})).json();if(meta.schema!=='pq-passages-v1')throw Error('The expanded index is still being prepared.');films=await json(asset('films.json.gz'));indexMs=performance.now()-t})()]);
  status('Warming the query encoder…');let t=performance.now();const out=await model(tokenizer('',{padding:'max_length',max_length:256,truncation:false}));for(const v of Object.values(out))v.dispose?.();const warmMs=performance.now()-t;
  const adapter=await navigator.gpu.requestAdapter();if(!adapter)throw Error('No WebGPU adapter');device=await adapter.requestDevice();device.lost.then(i=>postMessage({type:'fatal',message:'Search GPU lost: '+i.message}));
  status('Loading the compact passage index…');t=performance.now();
  const [codes,norms,ownerData,books,ranges]=await Promise.all(['codes.u8','norms.f32','owners.u32','codebook.f32',meta.textRanges].map(n=>n?checked(asset(n)).then(r=>r.arrayBuffer()):null));
  if(ranges){if(ranges.byteLength!==meta.passages*12)throw Error('Invalid passage offset index');textRanges=new Uint32Array(ranges)}
  if(codes.byteLength!==meta.passages*meta.parts||norms.byteLength!==meta.passages*4||ownerData.byteLength!==meta.passages*4||books.byteLength!==meta.parts*meta.centres*meta.subdimension*4)throw Error('Index size does not match its manifest');
  owners=new Uint32Array(ownerData);
  if(meta.tokens){[tokenRanges,headerRanges]=await Promise.all([meta.tokenRanges,meta.headerRanges].map(n=>checked(asset(n)).then(r=>r.arrayBuffer()).then(b=>new Uint32Array(b))));if(tokenRanges.length!==meta.passages*2||headerRanges.length!==films.length*2)throw Error('Invalid model-token offsets')}
  const storage=GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST;
  queryBuffer=buffer(meta.dimensions*4,storage);lutBuffer=buffer(meta.parts*meta.centres*4,storage);flagsBuffer=buffer(films.length*4,storage);scoreBuffer=buffer(meta.passages*4,GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC);readBuffer=buffer(meta.passages*4,GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ);
  lutPipeline=await compute(`@group(0) @binding(0) var<storage,read> q:array<f32>;@group(0) @binding(1) var<storage,read> book:array<f32>;@group(0) @binding(2) var<storage,read_write> lut:array<f32>;
   @compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id:vec3<u32>){let i=id.x;if(i>=${meta.parts*meta.centres}u){return;}let part=i/${meta.centres}u;var sum=0.;for(var d=0u;d<${meta.subdimension}u;d++){sum+=q[part*${meta.subdimension}u+d]*book[i*${meta.subdimension}u+d];}lut[i]=sum;}`);
  lutBind=bind(lutPipeline,[queryBuffer,buffer(books,storage),lutBuffer]);
  scanPipeline=await compute(`struct Params {offset:u32,count:u32,width:u32,pad:u32};
   @group(0) @binding(0) var<storage,read> codes:array<u32>;@group(0) @binding(1) var<storage,read> lut:array<f32>;@group(0) @binding(2) var<storage,read> norms:array<f32>;@group(0) @binding(3) var<storage,read> owners:array<u32>;@group(0) @binding(4) var<storage,read> flags:array<u32>;@group(0) @binding(5) var<storage,read_write> scores:array<f32>;@group(0) @binding(6) var<uniform> params:Params;
   @compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id:vec3<u32>){let i=id.x+id.y*params.width*64u;if(i>=params.count){return;}let row=i+params.offset;if(flags[owners[row]]==0u){scores[row]=-2.;return;}var sum=0.;for(var p=0u;p<${meta.parts}u;p++){let a=i*${meta.parts}u+p;let code=(codes[a/4u]>>((a%4u)*8u))&255u;sum+=lut[p*${meta.centres}u+code];}scores[row]=sum/norms[row];}`);
  const normBuffer=buffer(norms,storage),ownerBuffer=buffer(ownerData,storage),maxRows=Math.floor(device.limits.maxStorageBufferBindingSize/meta.parts);scanChunks=[];
  for(let first=0;first<meta.passages;first+=maxRows){const n=Math.min(maxRows,meta.passages-first),groups=Math.ceil(n/64),width=Math.min(groups,device.limits.maxComputeWorkgroupsPerDimension);scanChunks.push({width,height:Math.ceil(groups/width),bind:bind(scanPipeline,[buffer(codes.slice(first*meta.parts,(first+n)*meta.parts),storage),lutBuffer,normBuffer,ownerBuffer,flagsBuffer,scoreBuffer,buffer(new Uint32Array([first,n,width,0]),GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST)])})}
  exactPipeline=await compute(`@group(0) @binding(0) var<storage,read> docs:array<f32>;@group(0) @binding(1) var<storage,read> q:array<f32>;@group(0) @binding(2) var<storage,read_write> scores:array<f32>;var<workgroup> sums:array<f32,64>;
   @compute @workgroup_size(64) fn main(@builtin(workgroup_id) w:vec3<u32>,@builtin(local_invocation_id) l:vec3<u32>){var sum=0.;for(var d=l.x;d<${meta.dimensions}u;d+=64u){sum+=docs[w.x*${meta.dimensions}u+d]*q[d];}sums[l.x]=sum;workgroupBarrier();for(var s=32u;s>0u;s/=2u){if(l.x<s){sums[l.x]+=sums[l.x+s];}workgroupBarrier();}if(l.x==0u){scores[w.x]=sums[0];}}`);
  updateFilters({});
  const info={...meta,modelMs,indexMs,warmMs,gpuIndexMs:performance.now()-t,prepareMs:performance.now()-start};postMessage({type:'ready',info});return info;
 })();return preparePromise;
}
function updateFilters(f){const key=JSON.stringify(f);if(key===filterKey)return;
 const flags=new Uint32Array(films.length),sources=f.sources??['MIA','MRT','Neon'];
 const unrefined=!f.from&&!f.to&&![f.mia,f.mrt,f.neon].some(group=>Object.values(group||{}).some(v=>Array.isArray(v)?v.length:!!v));
 if(unrefined&&['MIA','MRT','Neon'].every(source=>sources.includes(source))){flags.fill(1);eligibleCount=meta.passages;eligibleFilms=films.length}
 else{eligibleCount=0;eligibleFilms=0;for(let i=0;i<films.length;i++)if(accepts(films[i],f)){flags[i]=1;eligibleCount+=films[i].count;eligibleFilms++}}
 device.queue.writeBuffer(flagsBuffer,0,flags);filterKey=key;
}
async function score(q){device.queue.writeBuffer(queryBuffer,0,q);const enc=device.createCommandEncoder(),p=enc.beginComputePass();p.setPipeline(lutPipeline);p.setBindGroup(0,lutBind);p.dispatchWorkgroups(Math.ceil(meta.parts*meta.centres/64));p.setPipeline(scanPipeline);for(const c of scanChunks){p.setBindGroup(0,c.bind);p.dispatchWorkgroups(c.width,c.height)}p.end();enc.copyBufferToBuffer(scoreBuffer,0,readBuffer,0,meta.passages*4);device.queue.submit([enc.finish()]);await readBuffer.mapAsync(GPUMapMode.READ);const scores=new Float32Array(readBuffer.getMappedRange()).slice();readBuffer.unmap();return scores}
function topK(scores,k){
 const rows=new Int32Array(k),values=new Float32Array(k);let n=0;
 for(let row=0;row<scores.length;row++){const value=scores[row];if(value<=-2)continue;
  if(n<k){let i=n++;while(i>0){const p=(i-1)>>1;if(values[p]<=value)break;rows[i]=rows[p];values[i]=values[p];i=p}rows[i]=row;values[i]=value}
  else if(value>values[0]){let i=0;while(i*2+1<n){let c=i*2+1;if(c+1<n&&values[c+1]<values[c])c++;if(values[c]>=value)break;rows[i]=rows[c];values[i]=values[c];i=c}rows[i]=row;values[i]=value}
 }return Array.from(rows.subarray(0,n));
}
async function byteRanges(url,ranges){url=new URL(new URL(url,'https://pub-fd77318b30094f8a923cae6a232a72fa.r2.dev/').pathname,'https://mosh-canopy-assets.moshcanopy.workers.dev/').href;
 const r=await checked(url,{headers:{Range:'bytes='+ranges.map(([start,end])=>`${start}-${end}`).join(',')}});
 if(r.status!==206){await r.body?.cancel();throw Error('Static host must support byte-range requests for search results')}
 const bytes=new Uint8Array(await r.arrayBuffer()),pieces=new Map(),expected=new Map(ranges);
 function save(header,start){const m=/bytes\s+(\d+)-(\d+)\//i.exec(header);if(!m)throw Error('Missing byte range');const offset=Number(m[1]),end=Number(m[2]),size=end-offset+1;if(expected.get(offset)!==end||start+size>bytes.length)throw Error('Invalid byte range');pieces.set(offset,bytes.slice(start,start+size));return size}
 const type=r.headers.get('Content-Type')||'',boundary=/boundary=(?:"([^"]+)"|([^;\s]+))/i.exec(type);
 if(!boundary)save(r.headers.get('Content-Range')||'',0);
 else{
  const decoder=new TextDecoder(),sep=new TextEncoder().encode('--'+(boundary[1]||boundary[2])),end=new Uint8Array([13,10,13,10]);
  const find=(pattern,from)=>{outer:for(let i=from;i<=bytes.length-pattern.length;i++){for(let j=0;j<pattern.length;j++)if(bytes[i+j]!==pattern[j])continue outer;return i}return -1};
  let cursor=0;while(true){const pos=find(sep,cursor);if(pos<0||bytes[pos+sep.length]===45)break;const h=pos+sep.length+2,e=find(end,h);if(e<0)throw Error('Invalid multipart range');const size=save(decoder.decode(bytes.subarray(h,e)),e+4);cursor=e+4+size}
 }
 if(ranges.some(([start])=>!pieces.has(start)))throw Error('Static host returned incomplete byte ranges');return pieces;
}
async function originals(ids,cache){
 const missing=[...new Set(ids.filter(id=>!cache.has(id)))].sort((a,b)=>a-b);if(!missing.length)return;
 const rowBytes=meta.dimensions*4,ranges=[];for(const id of missing){const last=ranges.at(-1);if(last&&id===last[1]+1)last[1]=id;else ranges.push([id,id])}
 // One multipart request leaves the browser's other connections available for
 // playing films; it does not queue a separate request per candidate vector.
 const pieces=await byteRanges(meta.vectors,ranges.map(([a,b])=>[a*rowBytes,(b+1)*rowBytes-1]));
 for(const [offset,bytes]of pieces)for(let at=0;at<bytes.length;at+=rowBytes)cache.set((offset+at)/rowBytes,new Float32Array(bytes.slice(at,at+rowBytes).buffer));
}
async function passageTexts(rows,cache){
 if(!textRanges)return Promise.all(rows.map(async h=>{const f=films[owners[h.i]];if(!cache.has(f.id))cache.set(f.id,json(asset(f.passages)));return (await cache.get(f.id))[h.i-f.first]}));
 const missing=rows.filter(h=>!cache.has(h.i));
 if(missing.length){
  const spans=missing.map(({i})=>{const offset=textRanges[i*3]+textRanges[i*3+1]*2**32;return [offset,offset+textRanges[i*3+2]-1]});
  const pieces=await byteRanges(asset(meta.texts),spans);
  await Promise.all(missing.map(async(h,j)=>{const raw=pieces.get(spans[j][0]),text=await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).text();cache.set(h.i,JSON.parse(text))}));
 }
 return rows.map(h=>cache.get(h.i));
}
async function packedTokens(ids,ranges,file,cache){
 const missing=[...new Set(ids.filter(i=>!cache.has(i)))].sort((a,b)=>a-b);if(!missing.length)return;
 const groups=[];for(const i of missing){const start=ranges[i*2]*2,end=start+ranges[i*2+1]*2-1,last=groups.at(-1);if(end<start){cache.set(i,[]);continue}if(last&&start===last.end+1){last.end=end;last.ids.push(i)}else groups.push({start,end,ids:[i]})}
 if(!groups.length)return;const pieces=await byteRanges(asset(file),groups.map(g=>[g.start,g.end]));
 for(const g of groups){const bytes=pieces.get(g.start);for(const i of g.ids)cache.set(i,new Uint16Array(bytes.buffer,bytes.byteOffset+ranges[i*2]*2-g.start,ranges[i*2+1]))}
}
async function exact(ids,cache){
 const capacity=Math.min(device.limits.maxComputeWorkgroupsPerDimension,Math.floor(device.limits.maxStorageBufferBindingSize/(meta.dimensions*4)));
 if(ids.length>capacity){const results=[];for(let i=0;i<ids.length;i+=capacity)results.push(...await exact(ids.slice(i,i+capacity),cache));return results.sort((a,b)=>b.score-a.score||a.i-b.i)}
 if(!ids.length)return[];const matrix=new Float32Array(ids.length*meta.dimensions);ids.forEach((id,i)=>matrix.set(cache.get(id),i*meta.dimensions));
 const docs=buffer(matrix,GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST),out=buffer(ids.length*4,GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC),read=buffer(ids.length*4,GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ);
 try{const enc=device.createCommandEncoder(),p=enc.beginComputePass();p.setPipeline(exactPipeline);p.setBindGroup(0,bind(exactPipeline,[docs,queryBuffer,out]));p.dispatchWorkgroups(ids.length);p.end();enc.copyBufferToBuffer(out,0,read,0,ids.length*4);device.queue.submit([enc.finish()]);await read.mapAsync(GPUMapMode.READ);const values=new Float32Array(read.getMappedRange()).slice();read.unmap();return ids.map((i,j)=>({i,score:values[j]})).sort((a,b)=>b.score-a.score||a.i-b.i)}finally{docs.destroy();out.destroy();read.destroy()}
}
async function prepareReranker(){
 if(rerankPromise)return rerankPromise;
 rerankPromise=(async()=>{
  status('Preparing passage relevance…');
  const [tj,tc,config,m]=await Promise.all([json('https://huggingface.co/Xenova/ms-marco-TinyBERT-L-2-v2/resolve/b76bb5e1fefd66aa36cd108622d768e86c015ff1/tokenizer.json'),json('https://huggingface.co/Xenova/ms-marco-TinyBERT-L-2-v2/resolve/b76bb5e1fefd66aa36cd108622d768e86c015ff1/tokenizer_config.json'),json('https://huggingface.co/Xenova/ms-marco-TinyBERT-L-2-v2/resolve/b76bb5e1fefd66aa36cd108622d768e86c015ff1/config.json'),AutoModelForSequenceClassification.from_pretrained('Xenova/ms-marco-TinyBERT-L-2-v2',{revision:'b76bb5e1fefd66aa36cd108622d768e86c015ff1',device:'webgpu',dtype:'fp16',local_files_only:false})]);
  rerankTokenizer=new BertTokenizer(tj,tc);rerankConfig=config;rerankVocab=tj.model.vocab;reranker=m;
  contextLabels={core:tokenIds('Excerpt:\n'),before:tokenIds('Immediately before:\n'),after:tokenIds('Immediately after:\n')};
  const warm=rerankTokenizer(Array(RERANK_BATCH).fill('query'),{text_pair:Array(RERANK_BATCH).fill('passage'),padding:'max_length',max_length:config.max_position_embeddings,truncation:false});
  let out=await reranker(warm);out.logits.dispose?.();
  // Exclude compilation, retain the slowest calibration dispatch when deciding
  // whether another batch fits the deadline. Update it with real query work.
  batchEstimateMs=0;for(let i=0;i<3;i++){const t=performance.now();out=await reranker(warm);out.logits.dispose?.();batchEstimateMs=Math.max(batchEstimateMs,performance.now()-t)}
 })().catch(e=>{rerankPromise=null;throw e});return rerankPromise;
}
function tokenIds(text){return Array.from(rerankTokenizer(text,{add_special_tokens:false}).input_ids.data,Number)}
function pairInputs(q,head,core,before,after){
 const limit=rerankConfig.max_position_embeddings,baseRoom=limit-q.length-head.length-core.length-contextLabels.core.length-3;
 if(baseRoom<0)throw Error('This query and passage exceed the relevance model context. Shorten the question or switch off Refine relevance.');
 const labels=(before.length?contextLabels.before.length:0)+(after.length?contextLabels.after.length:0);
 const room=Math.max(0,baseRoom-labels);
 const b=Math.min(before.length,Math.ceil(room/2)),f=Math.min(after.length,room-b),takeB=Math.min(before.length,room-f);
 const doc=[...head,...(takeB?[...contextLabels.before,...before.slice(-takeB)]:[]),...contextLabels.core,...core,...(f?[...contextLabels.after,...after.slice(0,f)]:[])],all=[rerankVocab['[CLS]'],...q,rerankVocab['[SEP]'],...doc,rerankVocab['[SEP]']];
 const input=new BigInt64Array(limit).fill(BigInt(rerankVocab['[PAD]'])),mask=new BigInt64Array(limit),types=new BigInt64Array(limit);
 all.forEach((v,i)=>{input[i]=BigInt(v);mask[i]=1n;if(i>q.length+1)types[i]=1n});
 return {input_ids:new Tensor('int64',input,[1,limit]),attention_mask:new Tensor('int64',mask,[1,limit]),token_type_ids:new Tensor('int64',types,[1,limit])};
}
async function refine(s,ranked){
 checkCurrent(s);
 const available=ranked.filter(h=>!s.relevance.has(h.i));s.batchEstimateMs??=batchEstimateMs;
 const capacity=Math.max(0,Math.floor((s.deadline-performance.now())/s.batchEstimateMs))*RERANK_BATCH;
 const unscored=available.slice(0,capacity);if(!unscored.length)return;
 const wanted=new Set();for(const h of unscored){wanted.add(h.i);if(h.i>0&&owners[h.i-1]===owners[h.i])wanted.add(h.i-1);if(h.i+1<meta.passages&&owners[h.i+1]===owners[h.i])wanted.add(h.i+1)}
 const fetchStart=performance.now(),tokens=s.tokens??=new Map(),heads=s.headers??=new Map();
 if(tokenRanges)await Promise.all([packedTokens([...wanted],tokenRanges,meta.tokens,tokens),packedTokens(unscored.map(h=>owners[h.i]),headerRanges,meta.headers,heads)]);
 else await passageTexts([...wanted].map(i=>({i})),s.texts);checkCurrent(s);
 s.tokenFetchMs=performance.now()-fetchStart;const q=tokenIds(s.query);
 const words=i=>{if(!tokens.has(i))tokens.set(i,tokenIds(s.texts.get(i)[2]));return tokens.get(i)};
 const started=performance.now(),width=rerankConfig.max_position_embeddings;
 for(let n=0;n<unscored.length;n+=RERANK_BATCH){
  checkCurrent(s);if(performance.now()+s.batchEstimateMs>s.deadline)break;
  const rows=unscored.slice(n,n+RERANK_BATCH),arrays={input_ids:new BigInt64Array(RERANK_BATCH*width),attention_mask:new BigInt64Array(RERANK_BATCH*width),token_type_ids:new BigInt64Array(RERANK_BATCH*width)};
  for(let j=0;j<RERANK_BATCH;j++){
   const h=rows[Math.min(j,rows.length-1)],film=films[owners[h.i]];
   if(!heads.has(owners[h.i]))heads.set(owners[h.i],tokenIds('Catalogue title: '+film.title+'\nCatalogue metadata (may describe a compilation or rebroadcast): '+JSON.stringify(film.memberships)+'\n'));
   const before=wanted.has(h.i-1)&&owners[h.i-1]===owners[h.i]?words(h.i-1):[],after=wanted.has(h.i+1)&&owners[h.i+1]===owners[h.i]?words(h.i+1):[];
   const pair=pairInputs(q,heads.get(owners[h.i]),words(h.i),before,after);for(const key in arrays)arrays[key].set(pair[key].data,j*width);
  }
  if(performance.now()+s.batchEstimateMs>s.deadline)break;
  const inputs=Object.fromEntries(Object.entries(arrays).map(([k,a])=>[k,new Tensor('int64',a,[RERANK_BATCH,width])]));
  const t=performance.now(),out=await reranker(inputs);s.batchEstimateMs=Math.max(s.batchEstimateMs,performance.now()-t);
  rows.forEach((h,j)=>s.relevance.set(h.i,Number(out.logits.data[j])));out.logits.dispose?.();await yieldWorker();
 }
 s.refineMs=(s.refineMs||0)+performance.now()-started;
}
async function resultPage(offset){
 const s=current;if(!s)throw Error('Submit a query first');checkCurrent(s);if(s.pages.has(offset))return s.pages.get(offset);const started=performance.now();s.deadline??=started+RESPONSE_MS;
 const unseen=()=>{const seen=new Set(s.delivered);return s.ranked.filter(h=>{const id=films[owners[h.i]].id;if(seen.has(id))return false;seen.add(id);return true})};
 // Thirty result pages matches the offline reranker study. More extends it;
 // the whole selected corpus is scanned, regardless of this work budget.
 while(unseen().length<PAGE&&s.k<s.count){
  const target=s.refine?meta.relevanceCandidates:PAGE;
  const k=Math.min(s.count,Math.max(s.k*2,(offset+target)*meta.candidateFactor)),ids=topK(s.scores,k);await originals(ids,s.vectors);checkCurrent(s);
  let ranked=await exact(ids,s.vectors);
  if(s.refine){ranked=ranked.slice(0,Math.max(meta.relevanceCandidates,Math.ceil(k/meta.candidateFactor)));
   if(offset===0&&!s.previewed){const seen=new Set(),preview=ranked.filter(h=>{const id=films[owners[h.i]].id;if(seen.has(id))return false;seen.add(id);return true}).slice(0,PAGE);const text=await passageTexts(preview,s.texts);checkCurrent(s);s.previewed=true;postMessage({type:'preview',id:s.id,results:preview.map((h,j)=>{const f=films[owners[h.i]],[start,end,body]=text[j];return {...h,passage:{...f,start,end,text:body}}}),matchingFilms:s.films,total:s.count,hasMore:false,provisional:true,previewMs:performance.now()-started})}
   await refine(s,ranked);const scored=ranked.filter(h=>s.relevance.has(h.i));if(scored.length)ranked=scored.map(h=>({...h,semanticScore:h.score,score:s.relevance.get(h.i)})).sort((a,b)=>b.score-a.score||a.i-b.i)}
  s.ranked=ranked;s.k=k;if(performance.now()+(s.refine?s.batchEstimateMs:0)>=s.deadline)break;
 }
 const seen=new Set(s.delivered),rows=[];for(const h of s.ranked){const id=films[owners[h.i]].id;if(seen.has(id))continue;seen.add(id);rows.push(h);if(rows.length===PAGE)break}
 const texts=await passageTexts(rows,s.texts);checkCurrent(s);const results=rows.map((h,j)=>{const f=films[owners[h.i]],[start,end,text]=texts[j];return {...h,passage:{...f,start,end,text}}});
 for(const h of rows)s.delivered.add(films[owners[h.i]].id);
 const page={results,total:s.count,matchingFilms:s.films,offset,hasMore:s.k<s.count||s.ranked.some(h=>!s.delivered.has(films[owners[h.i]].id)),pageMs:performance.now()-started,refineMs:s.refineMs||0,evaluatedPassages:s.relevance.size};s.pages.set(offset,page);return page;
}
async function search(m){
 await prepare();if(m.refine!==false)await prepareReranker();if(m.id!==latestId)throw Error('Search superseded');const start=performance.now();let q,tokens=0,encodeMs=0;const f=m.filters||{};updateFilters(f);
 if(m.like!=null){if(!Number.isInteger(m.like)||m.like<0||m.like>=meta.passages)throw Error('Unknown passage');const cache=current?.vectors||new Map();await originals([m.like],cache);q=cache.get(m.like)}
 else{const text=String(m.query||'').trim();if(!text)throw Error('Enter a query');const t=performance.now();tokens=tokenizer(text,{truncation:false}).input_ids.dims.at(-1);if(tokens>256)throw Error(`Query has ${tokens} tokens; this model supports 256. Please shorten it.`);const inputs=tokenizer(text,{padding:'max_length',max_length:256,truncation:false}),out=await model(inputs),pooled=mean_pooling(out.last_hidden_state,inputs.attention_mask).normalize(2,-1);q=new Float32Array(pooled.data);for(const v of Object.values(out))v.dispose?.();pooled.dispose?.();encodeMs=performance.now()-t}
 const t=performance.now(),scores=await score(q),scoreMs=performance.now()-t;
 current={id:m.id,deadline:start+RESPONSE_MS,query:String(m.query||''),refine:m.refine!==false&&m.like==null,relevance:new Map(),q,scores,count:eligibleCount,films:eligibleFilms,k:0,ranked:[],vectors:new Map(),texts:new Map(),pages:new Map(),delivered:new Set()};const page=await resultPage(0);
 postMessage({type:'results',id:m.id,query:m.query,like:m.like,...page,timings:{encodeMs,scoreMs,rankMs:page.pageMs,totalMs:performance.now()-start,tokens,tokenFetchMs:current.tokenFetchMs,batchEstimateMs},...(m.diagnostic?{vector:Array.from(q)}:{})});
}
async function drain(){if(busy)return;busy=true;try{while(pending){const m=pending;pending=null;try{if(m.type==='page'){if(m.searchId!==current?.id)throw Error('The query has changed');current.deadline=performance.now()+RESPONSE_MS;current.batchEstimateMs=batchEstimateMs;postMessage({type:'results',id:m.id,...await resultPage(m.offset)})}else await search(m)}catch(e){postMessage({type:'error',id:m.id,message:e.message,stack:e.stack})}}}finally{busy=false}}
onmessage=({data:m})=>{if(m.type==='cancel'){latestId=null;pending=null;return}if(m.type==='release'){latestId=null;pending=null;Promise.allSettled([model?.dispose(),reranker?.dispose()]).finally(()=>{device?.destroy();postMessage({type:'released'});close()});return}if(m.type==='prepare'){prepare().then(()=>m.refine!==false?prepareReranker():null).then(()=>postMessage({type:'prepared',batchEstimateMs})).catch(e=>postMessage({type:'fatal',message:e.message,stack:e.stack}));return}if(m.type==='search'||m.type==='page'){latestId=m.type==='page'?m.searchId:m.id;if(pending)postMessage({type:'superseded',id:pending.id});pending=m;drain()}};
