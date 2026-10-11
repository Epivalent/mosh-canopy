/* Upload changed atlas row spans. Atlas capacity is not per-frame bandwidth. */
window.FilmAtlasUpload=class FilmAtlasUpload{
 constructor({THREE,renderer,canvas,texture,columns,tileWidth,tileHeight}){
  Object.assign(this,{renderer,canvas,texture,columns,tileWidth,tileHeight});this.rows=new Map();
  this.patch=document.createElement('canvas');this.context=this.patch.getContext('2d',{alpha:false});
  this.source={image:this.patch};this.position=new THREE.Vector2();this.width=0;this.height=0;
  this.stats={fullUploads:0,partialUploads:0,bytes:0};
 }
 mark(slot){const row=Math.floor(slot/this.columns),col=slot%this.columns,range=this.rows.get(row);if(range){range[0]=Math.min(range[0],col);range[1]=Math.max(range[1],col);}else this.rows.set(row,[col,col]);}
 upload(){
  const {canvas,texture,renderer}=this;
  if(this.width!==canvas.width||this.height!==canvas.height){
   texture.needsUpdate=true;renderer.initTexture(texture);this.width=canvas.width;this.height=canvas.height;
   this.stats.fullUploads++;this.stats.bytes+=canvas.width*canvas.height*4;this.rows.clear();return;
  }
  for(const [row,[first,last]]of this.rows){
   const x=first*this.tileWidth,y=row*this.tileHeight,width=(last-first+1)*this.tileWidth,height=this.tileHeight;
   if(this.patch.width!==width)this.patch.width=width;if(this.patch.height!==height)this.patch.height=height;
   this.context.drawImage(canvas,x,y,width,height,0,0,width,height);
   renderer.copyTextureToTexture(this.position.set(x,y),this.source,texture);
   this.stats.partialUploads++;this.stats.bytes+=width*height*4;
  }
  this.rows.clear();
 }
};
