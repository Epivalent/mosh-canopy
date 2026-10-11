/* Mask compositing must not wait for GPU model compilation or inference. */
importScripts('https://epivalent.github.io/mosh-canopy/assets/vendor/collage-cutout-worker.js');
self.onmessage=({data:{id,frames,options}})=>{
  try{const cut=makeSourceCutout(frames[0],options.cut);self.postMessage({id,objects:cut},[cut.canvas,cut.mask]);}
  catch(e){self.postMessage({id,error:String(e?.stack||e)});}
  finally{for(const frame of frames)frame.close();}
};
self.postMessage({workerReady:true});
