// Some archive MP4s have an avcC profile/compatibility/level triplet that
// disagrees with their own SPS. E.g. Apollo 11 advertises 1b6742 but the SPS
// explicitly says 42c01f. WebCodecs rejects the bogus codec string.
// Correct only this redundant metadata; no packet changes or transcoding.
export function repairAVCConfig(config){
 if(!config?.codec?.startsWith('avc1.')||!config.description)return config;
 const original=config.description;
 const d=new Uint8Array(original.buffer??original,original.byteOffset??0,original.byteLength).slice();
 if(d.length<12||d[0]!==1||!(d[5]&31))return config;
 const length=(d[6]<<8)|d[7];if(length<4||8+length>d.length||(d[8]&31)!==7)return config;
 const triplet=d.slice(9,12);
 if(triplet.every((v,i)=>v===d[i+1]))return config;
 d.set(triplet,1);
 return {...config,description:d,codec:'avc1.'+[...triplet].map(v=>v.toString(16).padStart(2,'0')).join('')};
}
