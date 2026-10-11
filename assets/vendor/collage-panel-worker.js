importScripts('https://epivalent.github.io/mosh-canopy/assets/vendor/collage-layout.js');
function ornament(c,o){
  c.save();c.translate(o.x,o.y);c.rotate(o.rotation*Math.PI/180);c.scale(o.w,o.h);
  c.strokeStyle=o.color;c.fillStyle=o.fill||o.color;c.lineWidth=(o.lineWidth||.003)/Math.max(o.w,o.h);c.lineJoin='round';c.lineCap='round';
  c.beginPath();
  switch(o.kind){
    case 'arch':
      c.moveTo(-.48,.45);c.lineTo(-.48,-.05);c.bezierCurveTo(-.48,-.65,.48,-.65,.48,-.05);c.lineTo(.48,.45);c.lineTo(.36,.45);c.lineTo(.36,-.05);c.bezierCurveTo(.36,-.49,-.36,-.49,-.36,-.05);c.lineTo(-.36,.45);c.closePath();c.fill();
      c.strokeStyle='#736f63';c.lineWidth=.006;for(let i=0;i<11;i++){const a=Math.PI+i*Math.PI/10;c.beginPath();c.moveTo(Math.cos(a)*.37,Math.sin(a)*.40-.05);c.lineTo(Math.cos(a)*.47,Math.sin(a)*.52-.05);c.stroke();}break;
    case 'stairs':
      c.moveTo(-.5,.5);for(let i=0;i<7;i++){c.lineTo(-.5+i/7,.5-(i+1)/7);c.lineTo(-.5+(i+1)/7,.5-(i+1)/7);}c.lineTo(.5,.5);c.closePath();c.fill();c.strokeStyle='#777267';c.lineWidth=.007;for(let i=0;i<7;i++){c.beginPath();c.moveTo(-.5+i/7,.5-(i+1)/7);c.lineTo(.5,.5-(i+1)/7);c.stroke();}break;
    case 'rays':
      for(let i=0;i<32;i++){const a=i*Math.PI/16;c.beginPath();c.moveTo(Math.cos(a)*.29,Math.sin(a)*.29);c.lineTo(Math.cos(a)*(.44+(i%2)*.05),Math.sin(a)*(.44+(i%2)*.05));c.stroke();}break;
    case 'orbit':c.ellipse(0,0,.49,.49,0,0,Math.PI*2);c.stroke();break;
    case 'star':for(let i=0;i<16;i++){const a=i*Math.PI/8,r=i%2?.14:.5;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();c.fill();break;
    case 'cloud':c.moveTo(-.46,.22);c.bezierCurveTo(-.7,-.03,-.31,-.31,-.19,-.15);c.bezierCurveTo(-.20,-.58,.35,-.58,.35,-.16);c.bezierCurveTo(.64,-.21,.65,.28,.34,.28);c.closePath();c.fill();c.strokeStyle='#777267';c.lineWidth=.01;c.stroke();break;
    case 'arrow':c.moveTo(-.5,0);c.bezierCurveTo(-.15,-.4,.15,.4,.5,0);c.moveTo(.31,-.03);c.lineTo(.5,0);c.lineTo(.41,.21);c.stroke();break;
    case 'banner':c.moveTo(-.5,-.45);c.lineTo(.5,-.5);c.lineTo(.48,.5);c.lineTo(-.49,.44);c.closePath();c.fill();c.fillStyle='#242a29';c.scale(1/o.w,1/o.h);c.font='bold 1px Georgia';const fontSize=Math.min(o.h*.53,o.w*.88/Math.max(.01,c.measureText(o.text||'').width));c.font='bold '+fontSize+'px Georgia';c.textAlign='center';c.textBaseline='middle';c.fillText(o.text||'',0,0);break;
    case 'path':if(o.path){c.scale(1/o.w,1/o.h);c.lineWidth=o.lineWidth||.003;const path=new Path2D();path.addPath(new Path2D(o.path),new DOMMatrix([o.w,0,0,o.h,-o.w/2,-o.h/2]));if(o.fill)c.fill(path);c.stroke(path);}break;
  }c.restore();
}
self.onmessage=async({data})=>{
  const {id,items,plan,size=2048}=data;
  try{
    const p=CollageLayout.validate(plan,items),out=new OffscreenCanvas(size,size),c=out.getContext('2d');
    c.scale(size,size);c.imageSmoothingQuality='high';
    const positions=CollageLayout.placements(p,items);
    const layers=[...p.ornaments.map(o=>({z:o.z,ornament:o})),...p.pieces.map(o=>({z:o.z,piece:o}))].sort((a,b)=>a.z-b.z);
    for(const l of layers){if(l.ornament){ornament(c,l.ornament);continue;}
      const o=l.piece,item=items.find(i=>i.id===o.id),b=positions.get(o.instance),crop=o.crop||[0,0,1,1];
      c.save();c.translate(b.x,b.y);c.rotate(o.rotation*Math.PI/180);c.scale(o.flip?-1:1,1);
      c.shadowColor='#0008';c.shadowBlur=5;c.shadowOffsetX=2;c.shadowOffsetY=4;
      c.drawImage(item.image,crop[0]*item.image.width,crop[1]*item.image.height,crop[2]*item.image.width,crop[3]*item.image.height,-b.w/2,-b.h/2,b.w,b.h);c.restore();
    }
    const blob=await out.convertToBlob({type:'image/png'}),bitmap=await createImageBitmap(out,{imageOrientation:'flipY',premultiplyAlpha:'none'});
    self.postMessage({id,bitmap,blob},[bitmap]);
  }catch(e){self.postMessage({id,error:String(e.message||e)});}
  finally{for(const i of items)i.image.close();}
};
