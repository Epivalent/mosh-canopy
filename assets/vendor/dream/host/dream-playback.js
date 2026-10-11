// Background beads use collected previews in navigation and Dream mode alike.
// Only the viewing film and its handoff own live decoders. No model changes.
window.installDreamPlaybackPolicy=function({archive,show,net,audio,retro,dream,width=96,height=54}){
 if(dream.playbackPolicy)return dream.playbackPolicy;
 const originals=[],released=new Set();
 const enabled=()=>true;
 const foreground=clip=>!!clip&&(clip===show.seg?.clip||clip===show.next?.clip||clip===show.nextClip||clip===show.fullTask?.clip);
 const wrap=(object,key,fn)=>{const original=object[key];object[key]=function(...args){return fn.call(this,original,...args)};originals.push(()=>object[key]=original);};
 function preview(clip){
  if(clip.retro){retro.previews.ensure(clip);return;}
  // Keep an existing bead image when its full decoder is released.
  if(!clip.poster&&clip.hasSnapshot&&clip.slot>=0){
   const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
   const atlas=archive.atlasContext.canvas,columns=atlas.width/width;
   canvas.getContext('2d').drawImage(atlas,clip.slot%columns*width,Math.floor(clip.slot/columns)*height,width,height,0,0,width,height);
   clip.poster=canvas;
  }
 }
 function sync(){
  const next=enabled();
  if(next){
   // Audio's normal fade path owns teardown of an audible background player.
   for(const [clip,stream]of audio.streams)if(!foreground(clip))audio.retire(stream,audio.handoffFade);
   for(const clip of archive.clips)if(clip.player&&!foreground(clip)){
    preview(clip);archive.releasePlayer(clip);released.add(clip);
   }
  }
 }
 wrap(archive,'startVideo',function(original,clip,...args){
  if(enabled()&&!foreground(clip)){preview(clip);return;}
  return original.call(this,clip,...args);
 });
 wrap(archive,'updateMovingThumbs',function(original,...args){sync();return original.apply(this,args)});
 wrap(net,'soundCandidates',function(original,...args){const clips=original.apply(this,args);return enabled()?clips.filter(x=>foreground(x.clip)):clips;});
 const policy={sync,get active(){return enabled()},get stats(){return {enabled:enabled(),released:released.size,livePlayers:archive.clips.filter(c=>c.player).length,backgroundPlayers:archive.clips.filter(c=>c.player&&!foreground(c)).length,previews:retro.previews.stats};},dispose(){originals.reverse().forEach(restore=>restore());delete dream.playbackPolicy;}};
 dream.playbackPolicy=policy;sync();return policy;
};
