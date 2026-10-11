import {DreamGPU} from './gpu.js?v=smooth-v1';
import {inspectGPU} from './platform.js';
let gpu,captureId,captureFrame,epoch=0,animation,disposed=false;
const presentations=[];
function animateTransition(){
  if(disposed||animation||!gpu?.transition)return;
  animation=setTimeout(async()=>{
    try{if(!disposed&&gpu?.transition){gpu.draw();await gpu.device.queue.onSubmittedWorkDone();}}
    catch(e){if(!disposed)postMessage({type:'error',error:e.stack||String(e)});}
    finally{animation=null;animateTransition();}
  },16);
}
onmessage=async({data:d})=>{
  try{
    if(d.type==='load'){
      postMessage({type:'status',message:'Presentation worker started · requesting GPU adapter…'});
      const {adapter}=await inspectGPU();
      postMessage({type:'status',message:'GPU adapter ready · creating presentation device…'});
      const device=await adapter.requestDevice({requiredFeatures:['shader-f16']});
      device.lost.then(info=>{if(!disposed&&info.reason!=='destroyed')postMessage({type:'error',error:'Presentation GPU device lost: '+info.message});});
      device.addEventListener('uncapturederror',e=>postMessage({type:'error',error:e.error.message}));
      postMessage({type:'status',message:'GPU device ready · preparing presentation shaders…'});
      gpu=new DreamGPU(device,d.canvas,256,192);postMessage({type:'ready'});
    }else if(d.type==='frame'){
      if(d.epoch!==epoch){d.frame.close();postMessage({type:'frame-accepted',id:d.id,epoch:d.epoch,discarded:true});return;}
      gpu.source(d.frame);if(d.sample){captureId=d.id;captureFrame=gpu.capture();}
      // Keep at most two submitted frames outstanding. A completion fence on
      // every frame serializes the host snapshot with GPU presentation.
      presentations.push(gpu.device.queue.onSubmittedWorkDone());
      if(presentations.length>=2)await presentations.shift();
      postMessage({type:'frame-accepted',id:d.id,epoch:d.epoch,time:d.time,at:performance.now()});
    }else if(d.type==='result'){
      if(d.epoch===epoch&&d.id===captureId){const accepted=gpu.acceptBitmap(d.frame,captureFrame);postMessage({type:'effect-presented',id:d.id,epoch,accepted:accepted!==false,sourceFrame:captureFrame,presentationFrame:gpu.frame});animateTransition();}else d.frame.close();
    }else if(d.type==='reset'){epoch=d.epoch;captureId=null;gpu?.reset();}
    else if(d.type==='settings'){if(gpu){gpu.mix=d.settings.mix;gpu.motion=d.settings.motion;gpu.draw();}}
    else if(d.type==='dispose'){disposed=true;clearTimeout(animation);gpu?.device.destroy();close();}
  }catch(e){postMessage({type:'error',error:e.stack||String(e)});}
};
