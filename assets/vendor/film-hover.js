/* Pointer-transparent identification, with no media loads caused by hovering. */
window.FilmHover=class FilmHover {
 constructor({canvas,pick,frame,active}){
  Object.assign(this,{canvas,pick,frame,active});this.label=document.createElement('div');this.label.id='filmHover';this.label.hidden=true;this.label.setAttribute('role','tooltip');document.body.append(this.label);
  canvas.addEventListener('pointermove',e=>{this.point=e.buttons?null:{x:e.clientX,y:e.clientY};if(e.buttons)this.hide();});
  canvas.addEventListener('pointerleave',()=>{this.point=null;this.hide();});canvas.addEventListener('pointerdown',()=>{this.point=null;this.hide();});
  this.timer=setInterval(()=>this.update(),140);
 }
 hide(){this.label.hidden=true;}
 update(){if(!this.point||!this.active()){this.hide();return;}const {x,y}=this.point,c=this.frame(x,y)||this.pick(x,y);if(!c){this.hide();return;}
  const title=c.retro?.title||c.mia?.title||c.name,source=c.retro?(c.retro.source==='neon'?'Neon Pulse · YouTube':'MyRetroTVs · YouTube'):c.mia?'Moving Image Archive':'Added film',year=c.retro?.year||c.mia?.year;
  this.label.textContent=title+'\n'+source+(year?' · '+year:'');this.label.hidden=false;
  this.label.style.left=Math.max(8,Math.min(innerWidth-this.label.offsetWidth-8,x+16))+'px';this.label.style.top=Math.max(8,Math.min(innerHeight-this.label.offsetHeight-8,y+20))+'px';
 }
};
