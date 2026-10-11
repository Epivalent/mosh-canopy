/* Worker-side instance segmentation using the exported YOLO weights. */
(() => {
  'use strict';
  const SIZE = 640, GRID = 160, PIXELS = GRID * GRID;
  const paths = { coco: 'https://mosh-canopy-assets.moshcanopy.workers.dev/assets/models/yolo11m-seg.onnx', open: 'https://mosh-canopy-assets.moshcanopy.workers.dev/assets/models/yoloe-11s-seg-pf.onnx' };
  let namesPromise;
  const sessions = {}, providers = {};
  const work = new OffscreenCanvas(SIZE, SIZE);
  const context = work.getContext('2d', { willReadFrequently: true });
  function names(){ return namesPromise ||= fetch('https://mosh-canopy-assets.moshcanopy.workers.dev/assets/models/classes.json').then(r => { if (!r.ok) throw Error('Segmentation labels unavailable'); return r.json(); }).catch(e=>{namesPromise=null;throw e;}); }
  async function session(kind,progress=()=>{}){
    if(!sessions[kind])progress({stage:"loading",kind});
    if (!sessions[kind]) sessions[kind] = (async () => {
      if (navigator.gpu) try {
        const s = await ort.InferenceSession.create(paths[kind], { executionProviders: ['webgpu'] });
        providers[kind] = 'webgpu'; return s;
      } catch (e) { console.warn(`${kind} WebGPU session unavailable; using worker WASM`, e); }
      const s = await ort.InferenceSession.create(paths[kind], { executionProviders: ['wasm'] });
      providers[kind] = 'wasm'; return s;
    })();
    try{return await sessions[kind];}catch(e){delete sessions[kind];throw e;}
  }
  function overlap(a, b){
    const w = Math.max(0, Math.min(a.x2,b.x2)-Math.max(a.x1,b.x1)), h = Math.max(0, Math.min(a.y2,b.y2)-Math.max(a.y1,b.y1));
    return w*h / Math.max(1,(a.x2-a.x1)*(a.y2-a.y1)+(b.x2-b.x1)*(b.y2-b.y1)-w*h);
  }
  function inputFor(frame){
    const vw=frame.width,vh=frame.height,scale=Math.min(SIZE/vw,SIZE/vh),w=vw*scale,h=vh*scale,ox=(SIZE-w)/2,oy=(SIZE-h)/2;
    context.fillStyle='#727272'; context.fillRect(0,0,SIZE,SIZE); context.drawImage(frame,ox,oy,w,h);
    const rgba=context.getImageData(0,0,SIZE,SIZE).data, plane=SIZE*SIZE, input=new Float32Array(3*plane);
    for(let i=0,j=0;i<plane;i++,j+=4){input[i]=rgba[j]/255;input[plane+i]=rgba[j+1]/255;input[2*plane+i]=rgba[j+2]/255;}
    return { input, vw, vh, scale, ox, oy };
  }
  async function infer(frame, frameIndex, kind, labels, progress){
    const model=await session(kind,progress),started=performance.now();
    progress({stage:"inference",kind,frame:frameIndex});
    const info=inputFor(frame), {input,vw,vh,scale,ox,oy}=info;
    const tensor = new ort.Tensor('float32',input,[1,3,SIZE,SIZE]);
    let output;
    try{
    output=await model.run({images:tensor});
    progress({stage:"masks",kind,inferenceMs:Math.round(performance.now()-started)});
    const pred=output.output0.data, proto=output.output1.data, N=output.output0.dims[2], C=output.output0.dims[1], M=output.output1.dims[1], candidates=[];
    const threshold=kind==='coco'?0.35:0.58;
    for(let i=0;i<N;i++){
      let cls=-1,confidence=threshold;
      for(let c=4;c<C-M;c++) if(pred[c*N+i]>confidence){confidence=pred[c*N+i];cls=c-4;}
      if(cls<0)continue;
      const label=String(labels[cls]||'').toLowerCase();
      const cx=pred[i],cy=pred[N+i],bw=pred[2*N+i],bh=pred[3*N+i];
      const x1=Math.max(0,(cx-bw/2-ox)/scale),y1=Math.max(0,(cy-bh/2-oy)/scale),x2=Math.min(vw,(cx+bw/2-ox)/scale),y2=Math.min(vh,(cy+bh/2-oy)/scale);
      const area=(x2-x1)*(y2-y1)/(vw*vh);
      if(area<0.008 || area>0.97 || (area>0.75 && confidence<0.75))continue;
      candidates.push({i,cls,label,confidence,x1,y1,x2,y2,area});
    }
    candidates.sort((a,b)=>b.confidence-a.confidence);
    const kept=[];for(const c of candidates){if(kept.length>=18)break;if(kept.some(k=>k.cls===c.cls&&overlap(k,c)>0.55))continue;kept.push(c);}
    const objects=[];
    for(const c of kept){
      const gx1=Math.max(0,Math.floor((c.x1*scale+ox)/4)),gy1=Math.max(0,Math.floor((c.y1*scale+oy)/4));
      const gx2=Math.min(GRID-1,Math.ceil((c.x2*scale+ox)/4)),gy2=Math.min(GRID-1,Math.ceil((c.y2*scale+oy)/4));
      const mask=new Uint8Array(PIXELS),coeff=new Float32Array(M);
      for(let m=0;m<M;m++)coeff[m]=pred[(C-M+m)*N+c.i];
      let count=0;
      for(let y=gy1;y<=gy2;y++)for(let x=gx1;x<=gx2;x++){
        const p=y*GRID+x;let v=0;for(let m=0;m<M;m++)v+=coeff[m]*proto[m*PIXELS+p];
        if(v>0){mask[p]=1;count++;}
      }
      const visible=count*16/(scale*scale*vw*vh);
      if(count<45 || visible<0.005 || visible>0.9)continue;
      const appearance=[];
      for(let yy=0;yy<4;yy++)for(let xx=0;xx<8;xx++){
        const px=Math.max(0,Math.min(SIZE-1,Math.round((c.x1+(xx+.5)/8*(c.x2-c.x1))*scale+ox))),py=Math.max(0,Math.min(SIZE-1,Math.round((c.y1+(yy+.5)/4*(c.y2-c.y1))*scale+oy))),j=py*SIZE+px,inside=mask[Math.floor(py/4)*GRID+Math.floor(px/4)];
        for(let ch=0;ch<3;ch++)appearance.push(inside?Math.round(input[ch*SIZE*SIZE+j]*255):127);
      }
      objects.push({appearance,frame:frameIndex,label:c.label,confidence:+c.confidence.toFixed(3),kind,
        box:[c.x1/vw,c.y1/vh,c.x2/vw,c.y2/vh],mask,maskSize:GRID,maskMapping:{ox,oy,scale}});
    }
    progress({stage:"frame-complete",kind,elapsed:Math.round(performance.now()-started),objects:objects.length});
    return objects;
    }finally{if(output)for(const value of Object.values(output))value.dispose();tensor.dispose();}
  }
  async function run(frames,{open=true,progress=()=>{}}={}){
    progress({stage:"labels"});
    const labels=await names(),objects=[];
    for(let i=0;i<frames.length;i++) objects.push(...await infer(frames[i],i,'coco',labels.coco,progress));
    if(open){
      try {for(let i=0;i<frames.length;i++) objects.push(...await infer(frames[i],i,'open',labels.open,progress));}
      catch(e){progress({stage:'model-error',kind:'open',message:e.message});console.warn('Open vocabulary browser model unavailable',e);const failed=sessions.open;delete sessions.open;failed?.then(s=>s.release()).catch(()=>{});}
    }
    return objects;
  }
  self.BrowserSegmenterCore={detect:run,ready:async(progress=()=>{})=>{await names();await session('coco',progress);await session('open',progress);},providers};
})();
