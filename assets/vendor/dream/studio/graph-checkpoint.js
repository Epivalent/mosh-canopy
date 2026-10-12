// Capture the exact WebNN builder calls produced by the existing translator.
// No graph rewriting, changed operators, changed constants, or changed precision.
export function captureBuilders(context) {
  const Original=globalThis.MLGraphBuilder, records=[];
  const Replacement=new Proxy(Original,{construct(Target,args){
    const target=Reflect.construct(Target,args);
    if(args[0]!==context)return target;
    const refs=new WeakMap(),record={calls:[],buffers:[],inputs:{},outputs:null,buildMs:null,error:null};records.push(record);
    const encode=v=>{
      if(v===undefined)return {$undefined:true};
      if(v===null||typeof v==='string'||typeof v==='boolean')return v;
      if(typeof v==='number')return Object.is(v,-0)?{$number:'-0'}:Number.isFinite(v)?v:{$number:String(v)};
      if(refs.has(v))return {$ref:refs.get(v)};
      if(ArrayBuffer.isView(v)||v instanceof ArrayBuffer){
        const a=v instanceof ArrayBuffer?new Uint8Array(v):new Uint8Array(v.buffer,v.byteOffset,v.byteLength);
        const i=record.buffers.push(a.slice().buffer)-1;
        return {$bytes:i,type:v instanceof ArrayBuffer?'ArrayBuffer':v.constructor.name};
      }
      if(Array.isArray(v))return v.map(encode);
      if(Object.getPrototypeOf(v)===Object.prototype||Object.getPrototypeOf(v)===null)return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,encode(x)]));
      throw Error('Checkpoint cannot serialize '+v.constructor?.name);
    };
    const remember=(result,index,path=[])=>{
      if(Array.isArray(result))return result.map((x,i)=>remember(x,index,[...path,i]));
      refs.set(result,{index,path});return {dataType:result.dataType,shape:[...result.shape]};
    };
    return new Proxy(target,{get(t,key){const value=Reflect.get(t,key,t);if(typeof value!=='function')return value;
      return (...args)=>{
        let saved;
        try{saved=encode(args);}catch(e){record.error=e.message;}
        const start=performance.now(),result=Reflect.apply(value,t,args);
        if(key==='build'){
          record.outputs=saved?.[0];return result.then(graph=>{record.buildMs=performance.now()-start;return graph;});
        }
        try{
          const index=record.calls.length,metadata=remember(result,index);
          record.calls.push({method:String(key),args:saved,metadata});
          if(key==='input')record.inputs[args[0]]=metadata;
        }catch(e){record.error=e.message;}
        return result;
      };
    }});
  }});
  globalThis.MLGraphBuilder=Replacement;
  return {records,stop(){if(globalThis.MLGraphBuilder===Replacement)globalThis.MLGraphBuilder=Original;}};
}

export function pack(record,metadata={}){
  if(record.error)throw Error(record.error);
  const {buffers,...description}=record;
  let offset=0;
  const chunks=[],layout=buffers.map(b=>{const item={offset,length:b.byteLength};chunks.push(b);offset+=b.byteLength;const pad=(8-offset%8)%8;if(pad){chunks.push(new Uint8Array(pad));offset+=pad;}return item;});
  const json=new TextEncoder().encode(JSON.stringify({version:1,metadata,description,layout}));
  const header=new Uint8Array(4);new DataView(header.buffer).setUint32(0,json.byteLength,true);
  const padding=(8-(4+json.byteLength)%8)%8;
  return new Blob([header,json,new Uint8Array(padding),...chunks],{type:'application/octet-stream'});
}
export async function unpack(blob){
  const bytes=await blob.arrayBuffer();
  if(bytes.byteLength<4)throw Error('Truncated graph checkpoint');
  const length=new DataView(bytes).getUint32(0,true);
  if(length>bytes.byteLength-4)throw Error('Truncated graph checkpoint header');
  const doc=JSON.parse(new TextDecoder().decode(new Uint8Array(bytes,4,length)));
  if(doc.version!==1||!Array.isArray(doc.description?.calls)||!Array.isArray(doc.layout))throw Error('Unsupported graph checkpoint');
  const base=Math.ceil((4+length)/8)*8;
  let end=base;
  for(const p of doc.layout){
    if(!Number.isSafeInteger(p.offset)||!Number.isSafeInteger(p.length)||p.offset<0||p.length<0||p.offset%8||base+p.offset<end||base+p.offset+p.length>bytes.byteLength)throw Error('Invalid checkpoint constant range');
    end=base+p.offset+p.length;
  }
  if(Math.ceil(end/8)*8!==bytes.byteLength)throw Error('Truncated graph checkpoint body');
  return {...doc,bytes,base};
}
export async function restore(context,checkpoint){
  const {description:r,bytes,layout,base}=checkpoint,builder=new MLGraphBuilder(context),values=[];
  const decode=v=>{
    if(v===null||typeof v!=='object')return v;
    if(v.$undefined)return undefined;
    if(v.$number)return Number(v.$number);
    if(v.$ref){if(!Number.isInteger(v.$ref.index)||v.$ref.index<0||v.$ref.index>=values.length)throw Error('Invalid checkpoint operand');let result=values[v.$ref.index];for(const i of v.$ref.path)result=result[i];return result;}
    if(v.$bytes!==undefined){const p=layout[v.$bytes],start=base+p.offset;
      if(v.type==='ArrayBuffer')return bytes.slice(start,start+p.length);
      if(v.type==='DataView')return new DataView(bytes,start,p.length);
      const Type=globalThis[v.type];if(!/^(?:(?:Int|Uint)(?:8|16|32)|Uint8Clamped|Big(?:Int|Uint)64|Float(?:16|32|64))Array$/.test(v.type)||!Type?.BYTES_PER_ELEMENT)throw Error('Unsupported checkpoint data type '+v.type);
      return new Type(bytes,start,p.length/Type.BYTES_PER_ELEMENT);
    }
    if(Array.isArray(v))return v.map(decode);
    return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,decode(x)]));
  };
  const start=performance.now();
  for(const call of r.calls)values.push(builder[call.method](...decode(call.args)));
  const outputs=decode(r.outputs),replayMs=performance.now()-start,t=performance.now(),graph=await builder.build(outputs);
  return {graph,inputs:r.inputs,outputs:Object.fromEntries(Object.entries(outputs).map(([k,v])=>[k,{dataType:v.dataType,shape:[...v.shape]}])),replayMs,buildMs:performance.now()-t};
}
