// Deployment smoke check against the published runtime, not local files.
// Complements a real browser check through the first generated Dream frames.
import assert from 'node:assert/strict';
const site=new URL(process.argv[2]||'https://epivalent.github.io/mosh-canopy/');
async function get(url,options){const r=await fetch(url,options);assert(r.ok,`${r.status}: ${url}`);return r;}
const runtime=new URL('assets/vendor/dream/studio/native-runtime.js',site);
const code=await(await get(runtime,{cache:'no-store'})).text();
const match=/this\.base=new URL\(['"]([^'"]+)['"],import\.meta\.url\)/.exec(code);
assert(match,'Published runtime must declare its model directory');
const base=new URL(match[1],runtime);assert(!base.pathname.includes('//'),'Model directory contains a double slash');
const manifest=await(await get(new URL('manifest.json',base),{cache:'no-store'})).json();
// The export manifest also retains shape metadata for older graphs. Only the
// release provenance lists executable models in the current studio pipeline.
const provenance=await(await get(new URL('assets/vendor/dream/studio/provenance.json',site))).json();
const files=[...new Set(provenance.models.flatMap(name=>{assert(manifest.models[name],`Missing model: ${name}`);return ['graph','weights'].map(key=>manifest.models[name][key]);})),manifest.tokenizer.vocab,manifest.tokenizer.merges,'unet-time.f16','control-time.f16'];
const pending=[...files],checked=[];
async function worker(){while(pending.length){const file=pending.shift(),url=new URL(file,base),r=await get(url,{method:'HEAD'});let size=Number(r.headers.get('Content-Length'));if(!size)size=(await(await get(url)).arrayBuffer()).byteLength;assert(size>0,`Empty model asset: ${url}`);checked.push(file);}}
// Match browsers' HTTP/1 connection budget while checking small headers only.
await Promise.all(Array.from({length:6},worker));
console.log(JSON.stringify({site:site.href,base:base.href,models:provenance.models.length,assets:checked.length,passed:true}));
