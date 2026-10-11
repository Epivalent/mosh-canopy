// Follow actual published JSON references, not only URLs present in the JS.
import assert from 'node:assert/strict';
import vm from 'node:vm';
const site=new URL(process.argv[2]||'https://epivalent.github.io/mosh-canopy/');
async function get(url){const r=await fetch(url,{headers:{Origin:site.origin},cache:'no-cache'});assert(r.ok,`${r.status}: ${url}`);return r}
const deployment=await(await get(new URL('deployment.json',site))).json();
const helper=await(await get(new URL('assets/vendor/published-assets.js',site))).text();
const ctx=vm.createContext({URL});vm.runInContext(helper,ctx);
// The reported failure plus different trailers exercise real animation files.
for(const id of ['k2OYA0nnzXc','--0CaSLclb8','--2IG_rxfUM']){
 const manifest=new URL('assets/retrotv/previews/films/'+id+'.json',deployment.assets),r=await get(manifest),meta=await r.json();
 assert.equal(meta.status,'ready');
 const url=ctx.PublishedAssets.url(meta.preview.url,r.url);
 assert.equal(new URL(url).origin,new URL(deployment.assets).origin,'Preview escaped the configured static host');
 const image=await get(url);
 assert(['*',site.origin].includes(image.headers.get('Access-Control-Allow-Origin')),'Preview CORS is missing');
 const bytes=new Uint8Array(await image.arrayBuffer());
 assert.equal(new TextDecoder().decode(bytes.subarray(0,4)),'RIFF');
 assert.equal(new TextDecoder().decode(bytes.subarray(8,12)),'WEBP');
 console.log(JSON.stringify({id,bytes:bytes.length,url,passed:true}));
}
