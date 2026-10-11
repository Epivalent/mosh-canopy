import {numberToHalfBits as f16} from './platform.js';
// Deterministic banks shared by prefix and fast workers at configuration handover.
export function noiseBank(seed){
 let s=seed>>>0;const random=()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^s>>>15,1|s);t^=t+Math.imul(t^t>>>7,61|t);return ((t^t>>>14)>>>0)/4294967296;};
 return Array.from({length:4},()=>{const a=new Uint16Array(16384);for(let i=0;i<a.length;i+=2){const r=Math.sqrt(-2*Math.log(Math.max(1e-9,random()))),p=2*Math.PI*random();a[i]=f16(r*Math.cos(p));a[i+1]=f16(r*Math.sin(p));}return a;});
}
