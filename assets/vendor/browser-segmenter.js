/* Inference and compositing have independent workers. A lost worker cannot
   strand the animation or leave later requests chained to an unresolved job. */
(() => {
  'use strict';
  const history=[];
  class Lane {
    constructor(name,url,waitForReady=false){Object.assign(this,{name,url,waitForReady,jobs:[],pumping:false,worker:null,active:null,waiting:0,sequence:0,restarts:0});}
    record(event){history.push({lane:this.name,at:Date.now(),...event});if(history.length>80)history.shift();}
    reset(error){this.worker?.terminate();this.worker=null;this.rejectStartup?.(error);this.rejectStartup=null;this.startup=null;this.restarts++;this.active?.finish(error);}
    ensure(){
      if(this.worker)return this.startup;
      const worker=this.worker=new Worker(this.url);
      this.startup=this.waitForReady?new Promise((resolve,reject)=>{this.resolveStartup=resolve;this.rejectStartup=reject;}):Promise.resolve();
      worker.onmessage=({data})=>{
        if(this.worker!==worker)return;
        if(data.workerReady){this.resolveStartup?.();this.resolveStartup=null;this.rejectStartup=null;return;}
        const task=this.active;if(!task||task.id!==data.id){data.objects?.canvas?.close();data.objects?.mask?.close();return;}
        if(data.progress){task.stage=data.progress.stage;task.arm(data.progress.stage==='loading'?120000:30000);this.record(data.progress);return;}
        if(data.providers)Object.assign(BrowserSegmenter.providers,data.providers);
        if(data.error)this.reset(Error(data.error));else task.finish(null,data.objects);
      };
      worker.onerror=e=>{if(this.worker===worker)this.reset(Error(e.message||'Segmentation worker failed'));};
      worker.onmessageerror=()=>{if(this.worker===worker)this.reset(Error('Segmentation worker response could not be read'));};
      return this.startup;
    }
    send(frames,options={},ready=false){
      this.waiting++;
      return new Promise((resolve,reject)=>{this.jobs.push({frames,options,ready,resolve,reject,priority:ready?3:options.priority==='background'?0:2});this.pump();});
    }
    promote(frame){for(const job of this.jobs)if(job.frames.includes(frame)&&!job.ready)job.priority=2;}
    pump(){
      if(this.pumping||!this.jobs.length)return;
      this.jobs.sort((a,b)=>b.priority-a.priority);const task=this.jobs.shift();this.waiting--;this.pumping=true;
      this.run(task.frames,task.options,task.ready).then(task.resolve,task.reject).finally(()=>{this.pumping=false;this.pump();});
    }
    run(frames,options,ready){
      return new Promise((resolve,reject)=>{
        let done=false,timer,hardTimer,bitmaps=[];
        const started=performance.now(),id=++this.sequence;
        const task={id,stage:'capture',started,arm:ms=>{clearTimeout(timer);timer=setTimeout(()=>this.reset(Error(`${this.name}: ${task.stage} stopped responding`)),ms);},
          finish:(error,objects)=>{if(done)return;done=true;clearTimeout(timer);clearTimeout(hardTimer);this.active=null;
            this.record({stage:error?'error':'complete',elapsed:Math.round(performance.now()-started),message:error?.message});
            error?reject(error):resolve(objects);}};
        this.active=task;task.arm(30000);
        hardTimer=setTimeout(()=>this.reset(Error(`${this.name}: request deadline exceeded`)),180000);
        (async()=>{
          try{
            // Script/import startup has its own existing loading deadline. Do
            // not spend the cutout execution watchdog waiting for a cold worker.
            task.stage='loading';task.arm(120000);await this.ensure();if(done)return;
            task.stage='capture';task.arm(30000);
            // Close already-created bitmaps even when another capture fails.
            for(const frame of frames){const bitmap=await createImageBitmap(frame);if(done){bitmap.close();break;}bitmaps.push(bitmap);}
            if(done)return;
            task.stage=ready?'loading':'queued';task.arm(ready?120000:30000);
            this.worker.postMessage({id,frames:bitmaps,options,ready},bitmaps);bitmaps=[];
          }catch(e){task.finish(e);}finally{for(const bitmap of bitmaps)bitmap.close();}
        })();
      });
    }
    status(){return {waiting:this.waiting,restarts:this.restarts,stage:this.active?.stage||'idle',elapsed:this.active?Math.round(performance.now()-this.active.started):0};}
  }
  const inference=new Lane('inference','https://epivalent.github.io/mosh-canopy/assets/vendor/browser-segmenter-worker.js?v=5');
  const cutout=new Lane('cutout','https://epivalent.github.io/mosh-canopy/assets/vendor/source-cutout-worker.js?v=3',true);
  const cache=new WeakMap();let warming;
  function frameDetection(frame,options){
    const key=options.open===false?'coco':'both';let entries=cache.get(frame);if(!entries)cache.set(frame,entries=new Map());
    if(!entries.has(key)){
      const job=inference.send([frame],{open:options.open!==false,priority:options.priority});entries.set(key,job);
      job.catch(()=>{if(entries.get(key)===job)entries.delete(key);});
    }
    else if(options.priority!=='background')inference.promote(frame);
    return entries.get(key);
  }
  window.BrowserSegmenter={providers:{},history,
    status(){return {inference:inference.status(),cutout:cutout.status(),providers:{...this.providers},last:history.at(-1)};},
    cut(frame,object){return cutout.send([frame],{cut:object});},
    async detect(frames,options={}){
      const results=await Promise.all(frames.map(frame=>frameDetection(frame,options)));
      return results.flatMap((objects,frame)=>objects.map(o=>({...o,frame})));
    },
    prefetch(frame){frameDetection(frame,{open:true,priority:'background'}).catch(()=>{});},
    ready(){return warming||=inference.send([],{},true).catch(e=>{warming=null;throw e;});}
  };
})();
