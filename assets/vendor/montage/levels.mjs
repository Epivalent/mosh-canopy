// A lightweight audition measure, not LUFS: channel-linked active RMS.
// 20 ms windows follow speech energy; a gate 20 dB below the loudest window
// excludes long pauses without making gain chase individual syllables.
export function measureLevels(planes, rate) {
 const length=planes[0]?.length||0, block=Math.max(1,Math.round(rate*.020)), windows=[];
 let peak=0, maxPower=0;
 for(let start=0;start<length;start+=block){
  const end=Math.min(length,start+block);let sum=0;
  for(const p of planes)for(let i=start;i<end;i++){const x=p[i];sum+=x*x;peak=Math.max(peak,Math.abs(x));}
  const samples=(end-start)*planes.length,power=sum/samples;
  windows.push({sum,samples,power});maxPower=Math.max(maxPower,power);
 }
 let sum=0,samples=0;for(const w of windows)if(w.power>=maxPower*.01){sum+=w.sum;samples+=w.samples;}
 const rms=samples?Math.sqrt(sum/samples):0;
 return {rms,peak,rmsDb:rms?20*Math.log10(rms):null,peakDb:peak?20*Math.log10(peak):null};
}

export function balanceLevels(levels,{amount=1,maxBoostDb=12,ceilingDb=-1}={}) {
 // The montage supplies its own reference volume. Median in dB is insensitive
 // to one extremely loud/quiet source; no arbitrary absolute mastering target.
 const audible=levels.map(l=>l.rmsDb).filter(Number.isFinite).sort((a,b)=>a-b);
 const middle=Math.floor(audible.length/2),targetDb=audible.length?(audible[middle]+audible[Math.floor((audible.length-1)/2)])/2:null;
 return {targetDb,clips:levels.map(l=>{
  if(targetDb===null||l.rmsDb===null)return {gain:1,gainDb:0,limited:false};
  const desiredDb=(targetDb-l.rmsDb)*Math.max(0,Math.min(1,amount));
  // Constant gain preserves phrasing/dynamics. A sample-peak ceiling prevents
  // gain-induced overload; it is deliberately not described as true-peak limiting.
  const gainDb=Math.min(desiredDb,Math.max(0,maxBoostDb),ceilingDb-l.peakDb);
  return {gain:10**(gainDb/20),gainDb,limited:gainDb<desiredDb-.001};
 })};
}
