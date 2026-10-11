// Capability detection, shared by the page and both GPU workers.
export async function inspectGPU(nav=globalThis.navigator,secure=globalThis.isSecureContext){
  if(secure===false)throw Error('GPU access requires trusted HTTPS. Install the LAN certificate from the setup page, restart Brave, and reopen the HTTPS app address.');
  if(!nav?.gpu)throw Error('WebGPU is unavailable. Enable graphics acceleration in Brave settings, update Brave and the GPU driver, then restart Brave.');
  const adapter=await nav.gpu.requestAdapter({powerPreference:'high-performance'});
  if(!adapter)throw Error('Brave could not open a GPU adapter. Check brave://gpu and Windows Graphics settings; assign Brave to the high-performance RTX GPU.');
  if(!adapter.features.has('shader-f16'))throw Error('This GPU adapter does not expose FP16 (shader-f16). Update Brave/GPU drivers and select the RTX GPU in Windows Graphics settings.');
  const info=adapter.info||(adapter.requestAdapterInfo?await adapter.requestAdapterInfo():{});
  const report={backend:'webgpu',gpu:[info.vendor,info.architecture,info.description].filter(Boolean).join(' · ')||'Compatible GPU',fp16:true,webnn:!!nav.ml,nativeFloat16Array:typeof Float16Array!=='undefined',limits:{maxBufferSize:adapter.limits.maxBufferSize,maxStorageBufferBindingSize:adapter.limits.maxStorageBufferBindingSize}};
  return {adapter,report};
}
// JS half-float typed arrays shipped later than GPU FP16. Use bit conversion
// only for tiny scalar uniforms and the one startup validation readback.
export function halfToNumber(bits){const sign=bits&0x8000?-1:1,e=(bits>>>10)&31,m=bits&1023;return sign*(e===31?(m?NaN:Infinity):e===0?m*2**-24:(1+m/1024)*2**(e-15));}
const evenRound=n=>{const low=Math.floor(n),f=n-low;return f>.5||f===.5&&low%2?low+1:low;};
export function numberToHalfBits(value){
 const sign=value<0||Object.is(value,-0)?0x8000:0,x=Math.abs(value);
 if(Number.isNaN(x))return 0x7e00;if(x===Infinity||x>=65520)return sign|0x7c00;
 if(x<2**-14)return sign|evenRound(x*2**24);
 const e=Math.floor(Math.log2(x)),m=evenRound((x/2**e-1)*1024);
 return sign|((e+15)*1024+m);
}
