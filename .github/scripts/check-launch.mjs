// Small, read-only probes of real feature dependencies. This is a release
// preflight, not a capacity/load test. --production additionally rejects the
// R2 development endpoint. --build reads a candidate before it is deployed.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
const args=process.argv.slice(2),option=name=>{const i=args.indexOf(name);return i<0?null:args[i+1];};
const site=new URL(args[0]||'https://epivalent.github.io/mosh-canopy/'),checks=[];
const headers={Origin:site.origin};
async function response(url,options={}){
 // A health probe must terminate; this deadline is not an application retry or
 // playback limit. CI allows 30 seconds per small metadata/range response.
 const r=await fetch(url,{...options,headers:{...headers,...options.headers},signal:AbortSignal.timeout(30000)});
 if(!r.ok){await r.body?.cancel();throw Error(`HTTP ${r.status}: ${url}`);}
 if(new URL(url).origin!==site.origin&&!['*',site.origin].includes(r.headers.get('access-control-allow-origin'))){await r.body?.cancel();throw Error(`Missing browser CORS: ${url}`);}
 return r;
}
const json=async url=>(await response(url)).json();
async function check(name,fn){const started=performance.now();try{const details=await fn();checks.push({name,ok:true,ms:Math.round(performance.now()-started),details});}catch(e){checks.push({name,ok:false,ms:Math.round(performance.now()-started),error:e.message});}}
const build=option('--build');
const deployment=build?JSON.parse(await fs.readFile(path.join(build,'deployment.json'))):await json(new URL('deployment.json',site));
await check('production static delivery',async()=>{
 const host=new URL(deployment.assets);if(args.includes('--production'))assert(!host.hostname.endsWith('.r2.dev'),'r2.dev is a rate-limited development endpoint; configure the production R2 custom domain');
 return {origin:host.origin,developmentEndpoint:host.hostname.endsWith('.r2.dev')};
});
async function range(url,value,expected){const r=await response(url,{headers:{Range:value}});if(r.status!==206){await r.body?.cancel();throw Error(`Expected streaming 206, got ${r.status}: ${url}`);}const bytes=Buffer.from(await r.arrayBuffer());if(expected!==undefined)assert.equal(bytes.length,expected);return {bytes,range:r.headers.get('content-range'),type:r.headers.get('content-type')};}
await check('media relay health',async()=>{const r=await json(new URL('health',deployment.relay));assert.equal(r.ok,true);return r;});
await check('MIA streaming and seeking',async()=>{
 const catalog=await json(new URL('assets/catalog.json',deployment.assets)),film=catalog.films.find(f=>f.preview?.mp4&&f.mp4);assert(film,'No playable catalogue entries');
 const opened=[];for(const source of [film.preview.mp4,film.mp4]){const u=new URL(source),url=new URL('film'+u.pathname+u.search,deployment.relay);
  for(const [start,end]of [[0,31],[1024,1055]]){const r=await range(url,`bytes=${start}-${end}`,end-start+1);assert(r.range?.startsWith(`bytes ${start}-${end}/`));}
  opened.push(url.pathname);
 }return {film:film.id,opened};
});
await check('Words and Say It positional index',async()=>{
 const root=new URL('assets/retrotv/captions/',deployment.assets),index=await json(new URL('index.json',root)),term='weatherman',bucket=createHash('sha256').update(term).digest('hex').slice(0,2),pack=index.termPacks[bucket];assert(pack);
 const r=await response(new URL(pack.dictionary,root)),lex=JSON.parse(gunzipSync(Buffer.from(await r.arrayBuffer()))),entry=lex[term];assert(entry,'Known indexed term missing');
 const kinds=[];for(const kind of ['first','ordinals']){if(!entry[kind])continue;const [start,length]=entry[kind];const r=await range(new URL(pack.file,root),`bytes=${start}-${start+length-1}`,length);assert(gunzipSync(r.bytes).length);kinds.push(kind);}
 assert(kinds.includes('first'));assert(kinds.includes('ordinals'),'Say It positional postings missing');return {term,kinds,revision:index.revision};
});
await check('Themes multipart corpus reads',async()=>{
 const root=new URL('assets/semantic/',deployment.assets),index=await json(new URL('index.json',root)),files=[index.vectors,...['texts','tokens','headers'].map(k=>index.base+index[k])];
 for(const file of files){const url=new URL(new URL(file,root).pathname,deployment.relay),r=await range(url,'bytes=0-3,8-11');assert.match(r.type||'',/^multipart\/byteranges/);const body=r.bytes.toString('latin1');assert.match(body,/Content-Range: bytes 0-3\//i);assert.match(body,/Content-Range: bytes 8-11\//i);}
 return {passages:index.passages,files};
});
const result={at:new Date().toISOString(),site:site.href,mode:args.includes('--production')?'launch':'dependency-preflight',passed:checks.every(c=>c.ok),checks};
if(option('--output'))await fs.writeFile(option('--output'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));if(!result.passed)process.exitCode=1;
