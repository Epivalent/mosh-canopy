// Capture the prepared montage, without another decoder or a scene readback.
export class MontageRecording {
 static supported(){return typeof MediaRecorder!=='undefined'&&!!HTMLCanvasElement.prototype.captureStream;}
 constructor(audio,output,prepared,onState){
  this.output=output;this.onState=onState;this.chunks=[];
  this.canvas=document.createElement('canvas');
  // Keep one encoding size across cuts. Use the prepared images' actual bounds,
  // rounded to even dimensions for video codecs; never upscale individual cuts.
  let width=0,height=0;
  for(const p of prepared)for(const {bitmap}of p.frames){width=Math.max(width,bitmap.width);height=Math.max(height,bitmap.height);}
  if(!width||!height)throw Error('No prepared video frames to record.');
  this.canvas.width=Math.ceil(width/2)*2;this.canvas.height=Math.ceil(height/2)*2;
  this.context=this.canvas.getContext('2d',{alpha:false});
  this.done=new Promise(resolve=>{this.resolve=resolve;});
  try{
   this.stream=this.canvas.captureStream(); // Only changed frames are captured.
   this.destination=audio.createMediaStreamDestination();
   for(const track of this.destination.stream.getAudioTracks())this.stream.addTrack(track);
   // Prefer widely playable H.264/AAC, then the browser's WebM encoder.
   const mimeType=['video/mp4;codecs=avc1.42001E,mp4a.40.2','video/webm;codecs=vp8,opus','video/webm','video/mp4'].find(type=>MediaRecorder.isTypeSupported(type));
   this.recorder=new MediaRecorder(this.stream,mimeType?{mimeType}:undefined);
   this.recorder.ondataavailable=({data})=>{if(data.size)this.chunks.push(data);};
   this.recorder.onerror=event=>{this.error=event.error||Error('Video recording failed.');};
   this.recorder.onstop=()=>{
    const blob=this.chunks.length?new Blob(this.chunks,{type:this.recorder.mimeType||this.chunks[0].type}):null;
    this.chunks=[];this.cleanup();this.resolve({blob,error:this.error});
   };
   this.output.connect(this.destination);
   this.recorder.start();this.onState('Recording');
  }catch(error){this.cleanup();throw error;}
 }
 draw(frame){
  if(this.recorder.state==='inactive')return;
  const {width,height}=this.canvas,ctx=this.context;
  ctx.fillStyle='#000';ctx.fillRect(0,0,width,height);
  ctx.drawImage(frame,(width-frame.width)/2,(height-frame.height)/2);
 }
 pause(paused){
  if(this.recorder.state==='inactive')return;
  if(paused&&this.recorder.state==='recording')this.recorder.pause();
  else if(!paused&&this.recorder.state==='paused')this.recorder.resume();
  this.onState(paused?'Recording paused':'Recording');
 }
 stop(){
  if(this.stopping)return this.done;this.stopping=true;
  if(this.recorder.state!=='inactive'){
   this.onState('Saving recording…');
   // Include the held final image at the end of its audio, rather than ending
   // the video track at the last cut. Let canvas capture deliver that image
   // before stopping the encoder. Hidden documents cannot wait for a paint.
   if(document.visibilityState==='visible'){
    if(this.recorder.state==='paused')this.recorder.resume();
    this.context.drawImage(this.canvas,0,0);
    this.stream.getVideoTracks()[0].requestFrame?.();
    const finish=()=>{if(this.recorder.state!=='inactive')this.recorder.stop();};
    this.hidden=()=>{if(document.visibilityState!=='visible')finish();};document.addEventListener('visibilitychange',this.hidden);
    this.paint=requestAnimationFrame(()=>{this.paint=requestAnimationFrame(finish);});
   }else this.recorder.stop();
  }
  return this.done;
 }
 cleanup(){
  cancelAnimationFrame(this.paint);if(this.hidden)document.removeEventListener('visibilitychange',this.hidden);
  try{if(this.destination)this.output.disconnect(this.destination);}catch{}
  for(const track of this.stream?.getTracks()||[])track.stop();
  this.destination?.disconnect();this.canvas.width=this.canvas.height=0;
 }
}
