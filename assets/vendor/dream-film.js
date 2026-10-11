// Optional viewer extension: importing the renderer and downloading weights
// are separate, explicit actions. Default playback starts no dream workers.
window.DreamFilmAdapter=class {
  constructor({mount,controls,getCaption}){
    Object.assign(this,{mount,controls,getCaption});this.button=document.createElement('button');this.button.textContent='✦ Dream';this.button.title='Optional dream diffusion for the viewing film';controls.append(this.button);this.button.onclick=()=>this.open();
  }
  async open(){
    if(this.feature){this.feature.show(true);return;}
    if(this.loading)return;
    this.loading=true;this.button.disabled=true;
    try{const {DreamFeature}=await import('./dream/feature.js?v=caption-feed2');this.feature=new DreamFeature({mount:this.mount,controls:this.controls,getCaption:this.getCaption});this.button.remove();if(this.view)this.feature.setView(this.view);this.feature.show(true);}
    catch(e){this.button.disabled=false;this.button.title=e.message;this.button.textContent='Retry Dream';}
    finally{this.loading=false;}
  }
  setView(view){this.view=view;this.feature?.setView(view);}
  submit(source,info){this.feature?.submit(source,info);}
  dispose(){this.feature?.dispose();this.button.remove();}
};
