// Compact positional postings for exact phrase matching. Timestamps remain in
// the source transcripts; phrase discovery only needs integer word positions.
const encoder=new TextEncoder(),decoder=new TextDecoder();
export function encodeOrdinals(postings){
 const records=Object.entries(postings).map(([id,positions])=>({id:encoder.encode(id),positions}));
 const bytes=records.reduce((n,r)=>n+8+r.id.length+r.positions.length*5,8),buffer=new Uint8Array(bytes),view=new DataView(buffer.buffer);
 buffer.set([77,79,83,49]);view.setUint32(4,records.length,true);let at=8;
 for(const {id,positions}of records){view.setUint32(at,id.length,true);at+=4;buffer.set(id,at);at+=id.length;view.setUint32(at,positions.length,true);at+=4;let previous=0;
  for(const [position]of positions){if(!Number.isSafeInteger(position)||position<previous||position>0xffffffff)throw Error('Invalid word position');let delta=position-previous;previous=position;while(delta>=128){buffer[at++]=(delta&127)|128;delta=Math.floor(delta/128);}buffer[at++]=delta;}
 }return buffer.slice(0,at);
}
export function decodeOrdinals(buffer){
 const bytes=new Uint8Array(buffer),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 if(bytes.length<8||view.getUint32(0)!==0x4d4f5331)throw Error('Invalid positional record');
 const count=view.getUint32(4,true),out=new Map();let at=8;
 for(let i=0;i<count;i++){const length=view.getUint32(at,true);at+=4;const id=decoder.decode(bytes.subarray(at,at+length));at+=length;
  const n=view.getUint32(at,true);at+=4;if(n>bytes.length-at)throw Error('Truncated positional record');const positions=new Uint32Array(n);let previous=0;
  for(let j=0;j<n;j++){let delta=0,multiplier=1,byte;do{if(at>=bytes.length||multiplier>0x10000000)throw Error('Invalid position delta');byte=bytes[at++];delta+=(byte&127)*multiplier;multiplier*=128;}while(byte&128);previous+=delta;positions[j]=previous;}
  out.set(id,positions);
 }if(at!==bytes.length)throw Error('Trailing positional bytes');return out;
}
