/* Dedicated GPU inference worker with progress for stage-specific watchdogs. */
importScripts('https://epivalent.github.io/mosh-canopy/assets/vendor/onnxruntime/ort.min.js','https://epivalent.github.io/mosh-canopy/assets/vendor/browser-segmenter-core.js?v=5');
ort.env.wasm.wasmPaths='https://epivalent.github.io/mosh-canopy/assets/vendor/onnxruntime/';
// Only fallback/shape work uses WASM; don't claim every CPU core for it.
ort.env.wasm.numThreads=1;
let queue=Promise.resolve();
self.onmessage=({data:{id,frames=[],options={},ready=false}})=>{
  const task=queue.then(async()=>{
    const progress=info=>self.postMessage({id,progress:info});
    try{
      const objects=ready?(await BrowserSegmenterCore.ready(progress),[]):await BrowserSegmenterCore.detect(frames,{...options,progress});
      self.postMessage({id,objects,providers:BrowserSegmenterCore.providers},objects.map(o=>o.mask.buffer));
    }catch(e){self.postMessage({id,error:String(e?.stack||e)});}
    finally{for(const frame of frames)frame.close();}
  });queue=task.catch(()=>{});
};
