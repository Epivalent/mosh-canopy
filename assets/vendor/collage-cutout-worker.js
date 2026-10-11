/* Source-pixel cutouts. Canvas compositing stays off the animation thread. */
self.makeSourceCutout = (frame, object) => {
  const W=frame.width,H=frame.height,b=object.box,pad=.025;
  const x=Math.max(0,Math.floor((b[0]-pad)*W)),y=Math.max(0,Math.floor((b[1]-pad)*H));
  const w=Math.min(W,Math.ceil((b[2]+pad)*W))-x,h=Math.min(H,Math.ceil((b[3]+pad)*H))-y;
  const raw=new OffscreenCanvas(object.maskSize,object.maskSize),rx=raw.getContext('2d');
  const pixels=rx.createImageData(raw.width,raw.height);
  for(let i=0;i<object.mask.length;i++){pixels.data[i*4]=pixels.data[i*4+1]=pixels.data[i*4+2]=255;pixels.data[i*4+3]=object.mask[i]?255:0;}
  rx.putImageData(pixels,0,0);
  const mask=new OffscreenCanvas(w,h),mx=mask.getContext('2d'),{ox,oy,scale}=object.maskMapping;
  mx.imageSmoothingQuality='high';mx.drawImage(raw,-ox/scale-x,-oy/scale-y,640/scale,640/scale);
  const image=new OffscreenCanvas(w,h),ix=image.getContext('2d');
  ix.drawImage(frame,x,y,w,h,0,0,w,h);ix.globalCompositeOperation='destination-in';ix.drawImage(mask,0,0);
  const p=Math.max(3,Math.round(W/320)),r=p*.6,out=new OffscreenCanvas(w+p*2,h+p*2),ctx=out.getContext('2d');
  for(let i=0;i<12;i++)ctx.drawImage(mask,p+Math.cos(i*Math.PI/6)*r,p+Math.sin(i*Math.PI/6)*r);
  ctx.globalCompositeOperation='source-in';ctx.fillStyle='#e9e3d4';ctx.fillRect(0,0,out.width,out.height);
  ctx.globalCompositeOperation='source-over';ctx.drawImage(image,p,p);
  return {canvas:out.transferToImageBitmap(),mask:mask.transferToImageBitmap(),pad:p,kind:'photo',
    rect:{x:x/W*320,y:y/H*180,w:w/W*320,h:h/H*180},k:W/320,label:object.label,coverage:object.mask.reduce((a,b)=>a+b,0)/object.mask.length};
};
