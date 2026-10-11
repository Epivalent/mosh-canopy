/* Collection-wide pacing. Persist this state with the batch cursor. */
globalThis.CaptionBackoff=class CaptionBackoff{
 constructor(state={}){Object.assign(this,{nextStart:0,cooldownUntil:0,strikes:0,failures:[],successes:0,blocked:false,reason:null},state);}
 snapshot(){return {nextStart:this.nextStart,cooldownUntil:this.cooldownUntil,strikes:this.strikes,failures:this.failures,successes:this.successes,blocked:this.blocked,reason:this.reason};}
 wait(now=Date.now()){return Math.max(0,this.nextStart-now,this.cooldownUntil-now);}
 admit(now=Date.now(),random=Math.random()){this.nextStart=now+2500+random*1000;}
 success(){this.successes++;if(this.successes>=10){this.strikes=Math.max(0,this.strikes-1);this.successes=0;}}
 fail(kind,{retryAfterMs=0,message='',now=Date.now(),random=Math.random()}={}){
  this.successes=0;this.failures=this.failures.filter(t=>now-t<120000);this.failures.push(now);
  const challenge=kind==='auth-required',limited=kind==='rate-limit';
  if(!challenge&&!limited&&this.failures.length<3&&retryAfterMs<=0)return false;
  this.strikes=Math.min(12,this.strikes+1);
  const delay=Math.min(1800000,(limited||challenge?60000:30000)*2**(this.strikes-1))*(1+random*.2);
  this.cooldownUntil=Math.max(this.cooldownUntil,now+delay,now+Math.max(0,retryAfterMs));
  this.reason=message||(challenge?'YouTube requested authentication':limited?'YouTube requested a slower request rate':'Repeated caption failures');
  if(challenge)this.blocked=true;
  this.failures=[];return true;
 }
};
