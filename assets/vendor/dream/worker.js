// Inference owns a worker independently of presentation and optical flow.
import {DreamEngine} from './engine.js?v=spatial-integration-v2';
let engine,ready=false,busy=false;
const send=(type,data={},transfer=[])=>postMessage({type,...data},transfer);
onmessage=async({data:d})=>{
  try{
    if(d.type==='load'){
      send('status',{message:'Inference worker started · loading runtime…'});
      if(engine)throw Error('Model already initialized');
      const spatial=d.options?.backend==='webnn-spatial',fused=d.options?.backend==='webnn',matrix=d.options?.backend==='webgpu-matrix';
      const Engine=spatial?(await import('./webnn-spatial-engine.js?v=spatial-v1')).SpatialDreamEngine:fused?(await import('./webnn-resident-engine.js?v=resident-v1')).ResidentWebNNEngine:matrix?(await import('./webgpu-matrix-engine.js?v=matrix-v6')).MatrixDreamEngine:DreamEngine;
      engine=new Engine(message=>send('status',{message}));
      engine.onError=error=>{ready=false;busy=false;send('error',{error});};
      const info=await engine.load(new OffscreenCanvas(256,192),{...d.options,backend:d.options?.backend==='webnn-legacy'?'webnn':d.options?.backend});
      info.runtime=spatial?'spatial-adapter-v1':fused?'resident-scheduler-v1':matrix?'matrix-kernels-v5':'standard';
      engine.gpu.motion=false;engine.gpu.mix=1;ready=true;send('ready',{info});
    }else if(d.type==='frame'){
      if(!ready||busy){d.frame.close();send('dropped',{id:d.id});return;}
      busy=true;
      try{engine.source(d.frame);const stats=await engine.render();
        if(stats.accepted){const frame=engine.gpu.canvas.transferToImageBitmap();send('result',{stats,frame,id:d.id,epoch:d.epoch},[frame]);}
        else send('dropped',{id:d.id});
      }finally{busy=false;}
    }else if(d.type==='settings'){engine?.configure(d.settings);if(engine?.gpu){engine.gpu.motion=false;engine.gpu.mix=1;}}
    else if(d.type==='reset'){engine?.reset();}
    else if(d.type==='dispose'){ready=false;engine?.reset();engine?.context?.destroy();engine?.device?.destroy();close();}
  }catch(e){busy=false;send('error',{error:e.stack||String(e)});}
};
