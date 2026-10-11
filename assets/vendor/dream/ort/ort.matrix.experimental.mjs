var on=Object.defineProperty;var Nu=Object.getOwnPropertyDescriptor;var Wu=Object.getOwnPropertyNames;var Gu=Object.prototype.hasOwnProperty;var sn=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,n)=>(typeof require<"u"?require:t)[n]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')});var E=(e,t,n)=>()=>{if(n)throw n[0];try{return e&&(t=e(e=0)),t}catch(r){throw n=[r],r}};var bt=(e,t)=>{for(var n in t)on(e,n,{get:t[n],enumerable:!0})},Hu=(e,t,n,r)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of Wu(t))!Gu.call(e,o)&&o!==n&&on(e,o,{get:()=>t[o],enumerable:!(r=Nu(t,o))||r.enumerable});return e};var an=e=>Hu(on({},"__esModule",{value:!0}),e);var _t,je,Ze,qu,rr,un=E(()=>{_t=new Map,je=[],Ze=(e,t,n)=>{if(t&&typeof t.init=="function"&&typeof t.createInferenceSessionHandler=="function"){let r=_t.get(e);if(r===void 0)_t.set(e,{backend:t,priority:n});else{if(r.priority>n)return;if(r.priority===n&&r.backend!==t)throw new Error(`cannot register backend "${e}" using priority ${n}`)}if(n>=0){let o=je.indexOf(e);o!==-1&&je.splice(o,1);for(let i=0;i<je.length;i++)if(_t.get(je[i]).priority<=n){je.splice(i,0,e);return}je.push(e)}return}throw new TypeError("not a valid backend")},qu=async e=>{let t=_t.get(e);if(!t)return"backend not found.";if(t.initialized)return t.backend;if(t.aborted)return t.error;{let n=!!t.initPromise;try{return n||(t.initPromise=t.backend.init(e)),await t.initPromise,t.initialized=!0,t.backend}catch(r){return n||(t.error=`${r}`,t.aborted=!0),t.error}finally{delete t.initPromise}}},rr=async e=>{let t=e.executionProviders||[],n=t.map(u=>typeof u=="string"?u:u.name),r=n.length===0?je:n,o,i=[],s=new Set;for(let u of r){let d=await qu(u);typeof d=="string"?i.push({name:u,err:d}):(o||(o=d),o===d&&s.add(u))}if(!o)throw new Error(`no available backend found. ERR: ${i.map(u=>`[${u.name}] ${u.err}`).join(", ")}`);for(let{name:u,err:d}of i)n.includes(u)&&console.warn(`removing requested execution provider "${u}" from session options because it is not available: ${d}`);let a=t.filter(u=>s.has(typeof u=="string"?u:u.name));return[o,new Proxy(e,{get:(u,d)=>d==="executionProviders"?a:Reflect.get(u,d)})]}});var or=E(()=>{un()});var ir,sr=E(()=>{ir="1.30.0"});var ar,pe,dn=E(()=>{sr();ar="warning",pe={wasm:{},webgl:{},webgpu:{},versions:{common:ir},set logLevel(e){if(e!==void 0){if(typeof e!="string"||["verbose","info","warning","error","fatal"].indexOf(e)===-1)throw new Error(`Unsupported logging level: ${e}`);ar=e}},get logLevel(){return ar}};Object.defineProperty(pe,"logLevel",{enumerable:!0})});var ie,ur=E(()=>{dn();ie=pe});var dr,lr,cr=E(()=>{dr=(e,t)=>{let n=typeof document<"u"?document.createElement("canvas"):new OffscreenCanvas(1,1);n.width=e.dims[3],n.height=e.dims[2];let r=n.getContext("2d");if(r!=null){let o,i;t?.tensorLayout!==void 0&&t.tensorLayout==="NHWC"?(o=e.dims[2],i=e.dims[3]):(o=e.dims[3],i=e.dims[2]);let s=t?.format!==void 0?t.format:"RGB",a=t?.norm,u,d;a===void 0||a.mean===void 0?u=[255,255,255,255]:typeof a.mean=="number"?u=[a.mean,a.mean,a.mean,a.mean]:(u=[a.mean[0],a.mean[1],a.mean[2],0],a.mean[3]!==void 0&&(u[3]=a.mean[3])),a===void 0||a.bias===void 0?d=[0,0,0,0]:typeof a.bias=="number"?d=[a.bias,a.bias,a.bias,a.bias]:(d=[a.bias[0],a.bias[1],a.bias[2],0],a.bias[3]!==void 0&&(d[3]=a.bias[3]));let l=i*o,c=0,p=l,f=l*2,m=-1;s==="RGBA"?(c=0,p=l,f=l*2,m=l*3):s==="RGB"?(c=0,p=l,f=l*2):s==="RBG"&&(c=0,f=l,p=l*2);for(let h=0;h<i;h++)for(let b=0;b<o;b++){let g=(e.data[c++]-d[0])*u[0],y=(e.data[p++]-d[1])*u[1],_=(e.data[f++]-d[2])*u[2],w=m===-1?255:(e.data[m++]-d[3])*u[3];r.fillStyle="rgba("+g+","+y+","+_+","+w+")",r.fillRect(b,h,1,1)}if("toDataURL"in n)return n.toDataURL();throw new Error("toDataURL is not supported")}else throw new Error("Can not access image data")},lr=(e,t)=>{let n=typeof document<"u"?document.createElement("canvas").getContext("2d"):new OffscreenCanvas(1,1).getContext("2d"),r;if(n!=null){let o,i,s;t?.tensorLayout!==void 0&&t.tensorLayout==="NHWC"?(o=e.dims[2],i=e.dims[1],s=e.dims[3]):(o=e.dims[3],i=e.dims[2],s=e.dims[1]);let a=t!==void 0&&t.format!==void 0?t.format:"RGB",u=t?.norm,d,l;u===void 0||u.mean===void 0?d=[255,255,255,255]:typeof u.mean=="number"?d=[u.mean,u.mean,u.mean,u.mean]:(d=[u.mean[0],u.mean[1],u.mean[2],255],u.mean[3]!==void 0&&(d[3]=u.mean[3])),u===void 0||u.bias===void 0?l=[0,0,0,0]:typeof u.bias=="number"?l=[u.bias,u.bias,u.bias,u.bias]:(l=[u.bias[0],u.bias[1],u.bias[2],0],u.bias[3]!==void 0&&(l[3]=u.bias[3]));let c=i*o;if(t!==void 0&&(t.format!==void 0&&s===4&&t.format!=="RGBA"||s===3&&t.format!=="RGB"&&t.format!=="BGR"))throw new Error("Tensor format doesn't match input tensor dims");let p=4,f=0,m=1,h=2,b=3,g=0,y=c,_=c*2,w=-1;a==="RGBA"?(g=0,y=c,_=c*2,w=c*3):a==="RGB"?(g=0,y=c,_=c*2):a==="RBG"&&(g=0,_=c,y=c*2),r=n.createImageData(o,i);for(let $=0;$<i*o;f+=p,m+=p,h+=p,b+=p,$++)r.data[f]=(e.data[g++]-l[0])*d[0],r.data[m]=(e.data[y++]-l[1])*d[1],r.data[h]=(e.data[_++]-l[2])*d[2],r.data[b]=w===-1?255:(e.data[w++]-l[3])*d[3]}else throw new Error("Can not access image data");return r}});var ln,pr,mr,fr,hr,gr,yr=E(()=>{wt();ln=(e,t)=>{if(e===void 0)throw new Error("Image buffer must be defined");if(t.height===void 0||t.width===void 0)throw new Error("Image height and width must be defined");if(t.tensorLayout==="NHWC")throw new Error("NHWC Tensor layout is not supported yet");let{height:n,width:r}=t,o=t.norm??{mean:255,bias:0},i,s;typeof o.mean=="number"?i=[o.mean,o.mean,o.mean,o.mean]:i=[o.mean[0],o.mean[1],o.mean[2],o.mean[3]??255],typeof o.bias=="number"?s=[o.bias,o.bias,o.bias,o.bias]:s=[o.bias[0],o.bias[1],o.bias[2],o.bias[3]??0];let a=t.format!==void 0?t.format:"RGBA",u=t.tensorFormat!==void 0&&t.tensorFormat!==void 0?t.tensorFormat:"RGB",d=n*r,l=u==="RGBA"?new Float32Array(d*4):new Float32Array(d*3),c=4,p=0,f=1,m=2,h=3,b=0,g=d,y=d*2,_=-1;a==="RGB"&&(c=3,p=0,f=1,m=2,h=-1),u==="RGBA"?_=d*3:u==="RBG"?(b=0,y=d,g=d*2):u==="BGR"&&(y=0,g=d,b=d*2);for(let $=0;$<d;$++,p+=c,m+=c,f+=c,h+=c)l[b++]=(e[p]+s[0])/i[0],l[g++]=(e[f]+s[1])/i[1],l[y++]=(e[m]+s[2])/i[2],_!==-1&&h!==-1&&(l[_++]=(e[h]+s[3])/i[3]);return u==="RGBA"?new fe("float32",l,[1,4,n,r]):new fe("float32",l,[1,3,n,r])},pr=async(e,t)=>{let n=typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement,r=typeof ImageData<"u"&&e instanceof ImageData,o=typeof ImageBitmap<"u"&&e instanceof ImageBitmap,i=typeof e=="string",s,a=t??{},u=()=>{if(typeof document<"u")return document.createElement("canvas");if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(1,1);throw new Error("Canvas is not supported")},d=l=>typeof HTMLCanvasElement<"u"&&l instanceof HTMLCanvasElement||l instanceof OffscreenCanvas?l.getContext("2d"):null;if(n){let l=u();l.width=e.width,l.height=e.height;let c=d(l);if(c!=null){let p=e.height,f=e.width;if(t!==void 0&&t.resizedHeight!==void 0&&t.resizedWidth!==void 0&&(p=t.resizedHeight,f=t.resizedWidth),t!==void 0){if(a=t,t.tensorFormat!==void 0)throw new Error("Image input config format must be RGBA for HTMLImageElement");a.tensorFormat="RGBA",a.height=p,a.width=f}else a.tensorFormat="RGBA",a.height=p,a.width=f;c.drawImage(e,0,0),s=c.getImageData(0,0,f,p).data}else throw new Error("Can not access image data")}else if(r){let l,c;if(t!==void 0&&t.resizedWidth!==void 0&&t.resizedHeight!==void 0?(l=t.resizedHeight,c=t.resizedWidth):(l=e.height,c=e.width),t!==void 0&&(a=t),a.format="RGBA",a.height=l,a.width=c,t!==void 0){let p=u();p.width=c,p.height=l;let f=d(p);if(f!=null)f.putImageData(e,0,0),s=f.getImageData(0,0,c,l).data;else throw new Error("Can not access image data")}else s=e.data}else if(o){if(t===void 0)throw new Error("Please provide image config with format for Imagebitmap");let l=u();l.width=e.width,l.height=e.height;let c=d(l);if(c!=null){let p=e.height,f=e.width;return c.drawImage(e,0,0,f,p),s=c.getImageData(0,0,f,p).data,a.height=p,a.width=f,ln(s,a)}else throw new Error("Can not access image data")}else{if(i)return new Promise((l,c)=>{let p=u(),f=d(p);if(!e||!f)return c();let m=new Image;m.crossOrigin="Anonymous",m.src=e,m.onload=()=>{p.width=m.width,p.height=m.height,f.drawImage(m,0,0,p.width,p.height);let h=f.getImageData(0,0,p.width,p.height);a.height=p.height,a.width=p.width,l(ln(h.data,a))}});throw new Error("Input data provided is not supported - aborted tensor creation")}if(s!==void 0)return ln(s,a);throw new Error("Input data provided is not supported - aborted tensor creation")},mr=(e,t)=>{let{width:n,height:r,download:o,dispose:i}=t,s=[1,r,n,4];return new fe({location:"texture",type:"float32",texture:e,dims:s,download:o,dispose:i})},fr=(e,t)=>{let{dataType:n,dims:r,download:o,dispose:i}=t;return new fe({location:"gpu-buffer",type:n??"float32",gpuBuffer:e,dims:r,download:o,dispose:i})},hr=(e,t)=>{let{dataType:n,dims:r,download:o,dispose:i}=t;return new fe({location:"ml-tensor",type:n??"float32",mlTensor:e,dims:r,download:o,dispose:i})},gr=(e,t,n)=>new fe({location:"cpu-pinned",type:e,data:t,dims:n??[t.length]})});var Qe,ut,br,_r,wr=E(()=>{Qe=new Map([["float32",Float32Array],["uint8",Uint8Array],["int8",Int8Array],["uint16",Uint16Array],["int16",Int16Array],["int32",Int32Array],["bool",Uint8Array],["float64",Float64Array],["uint32",Uint32Array],["int4",Uint8Array],["uint4",Uint8Array]]),ut=new Map([[Float32Array,"float32"],[Uint8Array,"uint8"],[Int8Array,"int8"],[Uint16Array,"uint16"],[Int16Array,"int16"],[Int32Array,"int32"],[Float64Array,"float64"],[Uint32Array,"uint32"]]),br=!1,_r=()=>{if(!br){br=!0;let e=typeof BigInt64Array<"u"&&BigInt64Array.from,t=typeof BigUint64Array<"u"&&BigUint64Array.from,n=globalThis.Float16Array,r=typeof n<"u"&&n.from;e&&(Qe.set("int64",BigInt64Array),ut.set(BigInt64Array,"int64")),t&&(Qe.set("uint64",BigUint64Array),ut.set(BigUint64Array,"uint64")),r?(Qe.set("float16",n),ut.set(n,"float16")):Qe.set("float16",Uint16Array)}}});var $r,vr,xr=E(()=>{wt();$r=e=>{let t=1;for(let n=0;n<e.length;n++){let r=e[n];if(typeof r!="number"||!Number.isSafeInteger(r))throw new TypeError(`dims[${n}] must be an integer, got: ${r}`);if(r<0)throw new RangeError(`dims[${n}] must be a non-negative integer, got: ${r}`);t*=r}return t},vr=(e,t)=>{switch(e.location){case"cpu":return new fe(e.type,e.data,t);case"cpu-pinned":return new fe({location:"cpu-pinned",data:e.data,type:e.type,dims:t});case"texture":return new fe({location:"texture",texture:e.texture,type:e.type,dims:t});case"gpu-buffer":return new fe({location:"gpu-buffer",gpuBuffer:e.gpuBuffer,type:e.type,dims:t});case"ml-tensor":return new fe({location:"ml-tensor",mlTensor:e.mlTensor,type:e.type,dims:t});default:throw new Error(`tensorReshape: tensor location ${e.location} is not supported`)}}});var fe,wt=E(()=>{cr();yr();wr();xr();fe=class{constructor(t,n,r){_r();let o,i;if(typeof t=="object"&&"location"in t)switch(this.dataLocation=t.location,o=t.type,i=t.dims,t.location){case"cpu-pinned":{let a=Qe.get(o);if(!a)throw new TypeError(`unsupported type "${o}" to create tensor from pinned buffer`);if(!(t.data instanceof a))throw new TypeError(`buffer should be of type ${a.name}`);this.cpuData=t.data;break}case"texture":{if(o!=="float32")throw new TypeError(`unsupported type "${o}" to create tensor from texture`);this.gpuTextureData=t.texture,this.downloader=t.download,this.disposer=t.dispose;break}case"gpu-buffer":{if(o!=="float32"&&o!=="float16"&&o!=="int32"&&o!=="int64"&&o!=="uint32"&&o!=="uint8"&&o!=="bool"&&o!=="uint4"&&o!=="int4")throw new TypeError(`unsupported type "${o}" to create tensor from gpu buffer`);this.gpuBufferData=t.gpuBuffer,this.downloader=t.download,this.disposer=t.dispose;break}case"ml-tensor":{if(o!=="float32"&&o!=="float16"&&o!=="int32"&&o!=="int64"&&o!=="uint32"&&o!=="uint64"&&o!=="int8"&&o!=="uint8"&&o!=="bool"&&o!=="uint4"&&o!=="int4")throw new TypeError(`unsupported type "${o}" to create tensor from MLTensor`);this.mlTensorData=t.mlTensor,this.downloader=t.download,this.disposer=t.dispose;break}default:throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`)}else{let a,u;if(typeof t=="string")if(o=t,u=r,t==="string"){if(!Array.isArray(n))throw new TypeError("A string tensor's data must be a string array.");a=n}else{let d=Qe.get(t);if(d===void 0)throw new TypeError(`Unsupported tensor type: ${t}.`);if(Array.isArray(n)){if(t==="float16"&&d===Uint16Array||t==="uint4"||t==="int4")throw new TypeError(`Creating a ${t} tensor from number array is not supported. Please use ${d.name} as data.`);t==="uint64"||t==="int64"?a=d.from(n,BigInt):a=d.from(n)}else if(n instanceof d)a=n;else if(n instanceof Uint8ClampedArray)if(t==="uint8")a=Uint8Array.from(n);else throw new TypeError("A Uint8ClampedArray tensor's data must be type of uint8");else if(t==="float16"&&n instanceof Uint16Array&&d!==Uint16Array)a=new globalThis.Float16Array(n.buffer,n.byteOffset,n.length);else throw new TypeError(`A ${o} tensor's data must be type of ${d}`)}else if(u=n,Array.isArray(t)){if(t.length===0)throw new TypeError("Tensor type cannot be inferred from an empty array.");let d=typeof t[0];if(d==="string")o="string",a=t;else if(d==="boolean")o="bool",a=Uint8Array.from(t);else throw new TypeError(`Invalid element type of data array: ${d}.`)}else if(t instanceof Uint8ClampedArray)o="uint8",a=Uint8Array.from(t);else{let d=ut.get(t.constructor);if(d===void 0)throw new TypeError(`Unsupported type for tensor data: ${t.constructor}.`);o=d,a=t}if(u===void 0)u=[a.length];else if(!Array.isArray(u))throw new TypeError("A tensor's dims must be a number array");i=u,this.cpuData=a,this.dataLocation="cpu"}let s=$r(i);if(this.cpuData&&s!==this.cpuData.length&&!((o==="uint4"||o==="int4")&&Math.ceil(s/2)===this.cpuData.length))throw new Error(`Tensor's size(${s}) does not match data length(${this.cpuData.length}).`);this.type=o,this.dims=i,this.size=s}static async fromImage(t,n){return pr(t,n)}static fromTexture(t,n){return mr(t,n)}static fromGpuBuffer(t,n){return fr(t,n)}static fromMLTensor(t,n){return hr(t,n)}static fromPinnedBuffer(t,n,r){return gr(t,n,r)}toDataURL(t){return dr(this,t)}toImageData(t){return lr(this,t)}get data(){if(this.ensureValid(),!this.cpuData)throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");return this.cpuData}get location(){return this.dataLocation}get texture(){if(this.ensureValid(),!this.gpuTextureData)throw new Error("The data is not stored as a WebGL texture.");return this.gpuTextureData}get gpuBuffer(){if(this.ensureValid(),!this.gpuBufferData)throw new Error("The data is not stored as a WebGPU buffer.");return this.gpuBufferData}get mlTensor(){if(this.ensureValid(),!this.mlTensorData)throw new Error("The data is not stored as a WebNN MLTensor.");return this.mlTensorData}async getData(t){switch(this.ensureValid(),this.dataLocation){case"cpu":case"cpu-pinned":return this.data;case"texture":case"gpu-buffer":case"ml-tensor":{if(!this.downloader)throw new Error("The current tensor is not created with a specified data downloader.");if(this.isDownloading)throw new Error("The current tensor is being downloaded.");try{this.isDownloading=!0;let n=await this.downloader();return this.downloader=void 0,this.dataLocation="cpu",this.cpuData=n,t&&this.disposer&&(this.disposer(),this.disposer=void 0),n}finally{this.isDownloading=!1}}default:throw new Error(`cannot get data from location: ${this.dataLocation}`)}}dispose(){if(this.isDownloading)throw new Error("The current tensor is being downloaded.");this.disposer&&(this.disposer(),this.disposer=void 0),this.cpuData=void 0,this.gpuTextureData=void 0,this.gpuBufferData=void 0,this.mlTensorData=void 0,this.downloader=void 0,this.isDownloading=void 0,this.dataLocation="none"}ensureValid(){if(this.dataLocation==="none")throw new Error("The tensor is disposed.")}reshape(t){if(this.ensureValid(),this.downloader||this.disposer)throw new Error("Cannot reshape a tensor that owns GPU resource.");return vr(this,t)}}});var xe,cn=E(()=>{wt();xe=fe});var $t,Sr,we,ye,Ve,Le,pn=E(()=>{dn();$t=(e,t)=>{(typeof pe.trace>"u"?!pe.wasm.trace:!pe.trace)||console.timeStamp(`${e}::ORT::${t}`)},Sr=(e,t)=>{let n=new Error().stack?.split(/\r\n|\r|\n/g)||[],r=!1;for(let o=0;o<n.length;o++){if(r&&!n[o].includes("TRACE_FUNC")){let i=`FUNC_${e}::${n[o].trim().split(" ")[1]}`;t&&(i+=`::${t}`),$t("CPU",i);return}n[o].includes("TRACE_FUNC")&&(r=!0)}},we=e=>{(typeof pe.trace>"u"?!pe.wasm.trace:!pe.trace)||Sr("BEGIN",e)},ye=e=>{(typeof pe.trace>"u"?!pe.wasm.trace:!pe.trace)||Sr("END",e)},Ve=e=>{(typeof pe.trace>"u"?!pe.wasm.trace:!pe.trace)||console.time(`ORT::${e}`)},Le=e=>{(typeof pe.trace>"u"?!pe.wasm.trace:!pe.trace)||console.timeEnd(`ORT::${e}`)}});var vt,Tr=E(()=>{un();cn();pn();vt=class e{constructor(t){this.handler=t}async run(t,n,r){we(),Ve("InferenceSession.run");let o={},i={};if(typeof t!="object"||t===null||t instanceof xe||Array.isArray(t))throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");let s=!0;if(typeof n=="object"){if(n===null)throw new TypeError("Unexpected argument[1]: cannot be null.");if(n instanceof xe)throw new TypeError("'fetches' cannot be a Tensor");if(Array.isArray(n)){if(n.length===0)throw new TypeError("'fetches' cannot be an empty array.");s=!1;for(let d of n){if(typeof d!="string")throw new TypeError("'fetches' must be a string array or an object.");if(this.outputNames.indexOf(d)===-1)throw new RangeError(`'fetches' contains invalid output name: ${d}.`);o[d]=null}if(typeof r=="object"&&r!==null)i=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else{let d=!1,l=Object.getOwnPropertyNames(n);for(let c of this.outputNames)if(l.indexOf(c)!==-1){let p=n[c];(p===null||p instanceof xe)&&(d=!0,s=!1,o[c]=p)}if(d){if(typeof r=="object"&&r!==null)i=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else i=n}}else if(typeof n<"u")throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");for(let d of this.inputNames)if(typeof t[d]>"u")throw new Error(`input '${d}' is missing in 'feeds'.`);if(s)for(let d of this.outputNames)o[d]=null;let a=await this.handler.run(t,o,i),u={};for(let d in a)if(Object.hasOwnProperty.call(a,d)){let l=a[d];l instanceof xe?u[d]=l:u[d]=new xe(l.type,l.data,l.dims)}return Le("InferenceSession.run"),ye(),u}async release(){return this.handler.dispose()}static async create(t,n,r,o){we(),Ve("InferenceSession.create");let i,s={};if(typeof t=="string"){if(i=t,typeof n=="object"&&n!==null)s=n;else if(typeof n<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof Uint8Array){if(i=t,typeof n=="object"&&n!==null)s=n;else if(typeof n<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof ArrayBuffer||typeof SharedArrayBuffer<"u"&&t instanceof SharedArrayBuffer){let l=t,c=0,p=t.byteLength;if(typeof n=="object"&&n!==null)s=n;else if(typeof n=="number"){if(c=n,!Number.isSafeInteger(c))throw new RangeError("'byteOffset' must be an integer.");if(c<0||c>=l.byteLength)throw new RangeError(`'byteOffset' is out of range [0, ${l.byteLength}).`);if(p=t.byteLength-c,typeof r=="number"){if(p=r,!Number.isSafeInteger(p))throw new RangeError("'byteLength' must be an integer.");if(p<=0||c+p>l.byteLength)throw new RangeError(`'byteLength' is out of range (0, ${l.byteLength-c}].`);if(typeof o=="object"&&o!==null)s=o;else if(typeof o<"u")throw new TypeError("'options' must be an object.")}else if(typeof r<"u")throw new TypeError("'byteLength' must be a number.")}else if(typeof n<"u")throw new TypeError("'options' must be an object.");i=new Uint8Array(l,c,p)}else throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");let[a,u]=await rr(s),d=await a.createInferenceSessionHandler(i,u);return Le("InferenceSession.create"),ye(),new e(d)}startProfiling(){this.handler.startProfiling()}endProfiling(){this.handler.endProfiling()}get inputNames(){return this.handler.inputNames}get outputNames(){return this.handler.outputNames}get inputMetadata(){return this.handler.inputMetadata}get outputMetadata(){return this.handler.outputMetadata}}});var Fu,Ir=E(()=>{Tr();Fu=vt});var Cr=E(()=>{});var Ar=E(()=>{});var kr=E(()=>{});var Er=E(()=>{});var mn={};bt(mn,{InferenceSession:()=>Fu,TRACE:()=>$t,TRACE_EVENT_BEGIN:()=>Ve,TRACE_EVENT_END:()=>Le,TRACE_FUNC_BEGIN:()=>we,TRACE_FUNC_END:()=>ye,Tensor:()=>xe,env:()=>ie,registerBackend:()=>Ze});var $e=E(()=>{or();ur();Ir();cn();Cr();Ar();pn();kr();Er()});var Ne,xt=E(()=>{Ne=!!(typeof process<"u"&&process.versions&&process.versions.node)});var Br,Ku,ju,We,Or,zr,Zu,Qu,Xu,Yu,Dr,Mr,fn=E(()=>{xt();Br=Ne||typeof location>"u"?void 0:location.origin,Ku=import.meta.url>"file:"&&import.meta.url<"file;",ju=()=>{if(!Ne){if(Ku){let e=URL;return new URL(new e("ort.matrix.experimental.mjs",import.meta.url).href,Br).href}return import.meta.url}},We=ju(),Or=()=>{if(We&&!We.startsWith("blob:"))return We.substring(0,We.lastIndexOf("/")+1)},zr=(e,t)=>{try{let n=t??We;return(n?new URL(e,n):new URL(e)).origin===Br}catch{return!1}},Zu=(e,t)=>{let n=t??We;try{return(n?new URL(e,n):new URL(e)).href}catch{return}},Qu=(e,t)=>`${t??"./"}${e}`,Xu=async e=>{let n=await(await fetch(e,{credentials:"same-origin"})).blob();return URL.createObjectURL(n)},Yu=async e=>(await import(e)).default,Dr=void 0,Mr=async(e,t,n,r)=>{let o=Dr&&!(e||t);if(o)if(We)o=zr(We)||r&&!n;else if(r&&!n)o=!0;else throw new Error("cannot determine the script source URL.");if(o)return[void 0,Dr];{let i="ort-wasm-simd-threaded.jsep.mjs",s=e??Zu(i,t),a=!Ne&&n&&s&&!zr(s,t),u=a?await Xu(s):s??Qu(i,t);return[a?u:void 0,await Yu(u)]}}});var hn,gn,St,Ur,Ju,ed,td,Rr,te,Xe=E(()=>{fn();gn=!1,St=!1,Ur=!1,Ju=()=>{if(typeof SharedArrayBuffer>"u")return!1;try{return typeof MessageChannel<"u"&&new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)),WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,4,1,3,1,1,10,11,1,9,0,65,0,254,16,2,0,26,11]))}catch{return!1}},ed=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,30,1,28,0,65,0,253,15,253,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,186,1,26,11]))}catch{return!1}},td=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,19,1,17,0,65,1,253,15,65,2,253,15,65,3,253,15,253,147,2,11]))}catch{return!1}},Rr=async e=>{if(gn)return Promise.resolve();if(St)throw new Error("multiple calls to 'initializeWebAssembly()' detected.");if(Ur)throw new Error("previous call to 'initializeWebAssembly()' failed.");St=!0;let t=e.initTimeout,n=e.numThreads;if(e.simd!==!1){if(e.simd==="relaxed"){if(!td())throw new Error("Relaxed WebAssembly SIMD is not supported in the current environment.")}else if(!ed())throw new Error("WebAssembly SIMD is not supported in the current environment.")}let r=Ju();n>1&&!r&&(typeof self<"u"&&!self.crossOriginIsolated&&console.warn("env.wasm.numThreads is set to "+n+", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."),console.warn("WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."),e.numThreads=n=1);let o=e.wasmPaths,i=typeof o=="string"?o:void 0,s=o?.mjs,a=s?.href??s,u=o?.wasm,d=u?.href??u,l=e.wasmBinary,[c,p]=await Mr(a,i,n>1,!!l||!!d),f=!1,m=[];if(t>0&&m.push(new Promise(h=>{setTimeout(()=>{f=!0,h()},t)})),m.push(new Promise((h,b)=>{let g={numThreads:n};if(l)g.wasmBinary=l,g.locateFile=y=>y;else if(d||i)g.locateFile=y=>d??i+y;else if(a&&a.indexOf("blob:")!==0)g.locateFile=y=>new URL(y,a).href;else if(c){let y=Or();y&&(g.locateFile=_=>y+_)}p(g).then(y=>{St=!1,gn=!0,hn=y,h(),c&&URL.revokeObjectURL(c)},y=>{St=!1,Ur=!0,b(y)})})),await Promise.race(m),f)throw new Error(`WebAssembly backend initializing failed due to timeout: ${t}ms`)},te=()=>{if(gn&&hn)return hn;throw new Error("WebAssembly is not initialized yet.")}});var ve,dt,Y,Tt=E(()=>{Xe();ve=(e,t)=>{let n=te(),r=n.lengthBytesUTF8(e)+1,o=n._malloc(r);return n.stringToUTF8(e,o,r),t.push(o),o},dt=(e,t,n,r)=>{if(typeof e=="object"&&e!==null){if(n.has(e))throw new Error("Circular reference in options");n.add(e)}Object.entries(e).forEach(([o,i])=>{let s=t?t+o:o;if(typeof i=="object")dt(i,s+".",n,r);else if(typeof i=="string"||typeof i=="number")r(s,i.toString());else if(typeof i=="boolean")r(s,i?"1":"0");else throw new Error(`Can't handle extra config type: ${typeof i}`)})},Y=e=>{let t=te(),n=t.stackSave();try{let r=t.PTR_SIZE,o=t.stackAlloc(2*r);t._OrtGetLastError(o,o+r);let i=Number(t.getValue(o,r===4?"i32":"i64")),s=t.getValue(o+r,"*"),a=s?t.UTF8ToString(s):"";throw new Error(`${e} ERROR_CODE: ${i}, ERROR_MESSAGE: ${a}`)}finally{t.stackRestore(n)}}});var Vr,Lr=E(()=>{Xe();Tt();Vr=e=>{let t=te(),n=0,r=[],o=e||{};try{if(e?.logSeverityLevel===void 0)o.logSeverityLevel=2;else if(typeof e.logSeverityLevel!="number"||!Number.isInteger(e.logSeverityLevel)||e.logSeverityLevel<0||e.logSeverityLevel>4)throw new Error(`log severity level is not valid: ${e.logSeverityLevel}`);if(e?.logVerbosityLevel===void 0)o.logVerbosityLevel=0;else if(typeof e.logVerbosityLevel!="number"||!Number.isInteger(e.logVerbosityLevel))throw new Error(`log verbosity level is not valid: ${e.logVerbosityLevel}`);e?.terminate===void 0&&(o.terminate=!1);let i=0;return e?.tag!==void 0&&(i=ve(e.tag,r)),n=t._OrtCreateRunOptions(o.logSeverityLevel,o.logVerbosityLevel,!!o.terminate,i),n===0&&Y("Can't create run options."),e?.extra!==void 0&&dt(e.extra,"",new WeakSet,(s,a)=>{let u=ve(s,r),d=ve(a,r);t._OrtAddRunConfigEntry(n,u,d)!==0&&Y(`Can't set a run config entry: ${s} - ${a}.`)}),[n,r]}catch(i){throw n!==0&&t._OrtReleaseRunOptions(n),r.forEach(s=>t._free(s)),i}}});var nd,rd,od,rt,id,Nr,Wr=E(()=>{Xe();Tt();nd=e=>{switch(e){case"disabled":return 0;case"basic":return 1;case"extended":return 2;case"layout":return 3;case"all":return 99;default:throw new Error(`unsupported graph optimization level: ${e}`)}},rd=e=>{switch(e){case"sequential":return 0;case"parallel":return 1;default:throw new Error(`unsupported execution mode: ${e}`)}},od=e=>{e.extra||(e.extra={}),e.extra.session||(e.extra.session={});let t=e.extra.session;t.use_ort_model_bytes_directly||(t.use_ort_model_bytes_directly="1"),e.executionProviders&&e.executionProviders.some(n=>(typeof n=="string"?n:n.name)==="webgpu")&&(e.enableMemPattern=!1)},rt=(e,t,n,r)=>{let o=ve(t,r),i=ve(n,r);te()._OrtAddSessionConfigEntry(e,o,i)!==0&&Y(`Can't set a session config entry: ${t} - ${n}.`)},id=async(e,t,n)=>{let r=t.executionProviders;for(let o of r){let i=typeof o=="string"?o:o.name,s=[];switch(i){case"webnn":if(i="WEBNN",rt(e,"session.disable_quant_qdq","1",n),rt(e,"session.disable_qdq_constant_folding","1",n),typeof o!="string"){let p=o?.deviceType;p&&rt(e,"deviceType",p,n)}break;case"webgpu":if(i="JS",typeof o!="string"){let c=o;if(c?.preferredLayout){if(c.preferredLayout!=="NCHW"&&c.preferredLayout!=="NHWC")throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${c.preferredLayout}`);rt(e,"preferredLayout",c.preferredLayout,n)}}break;case"wasm":case"cpu":continue;default:throw new Error(`not supported execution provider: ${i}`)}let a=ve(i,n),u=s.length,d=0,l=0;if(u>0){d=te()._malloc(u*te().PTR_SIZE),n.push(d),l=te()._malloc(u*te().PTR_SIZE),n.push(l);for(let c=0;c<u;c++)te().setValue(d+c*te().PTR_SIZE,s[c][0],"*"),te().setValue(l+c*te().PTR_SIZE,s[c][1],"*")}await te()._OrtAppendExecutionProvider(e,a,d,l,u)!==0&&Y(`Can't append execution provider: ${i}.`)}},Nr=async e=>{let t=te(),n=0,r=[],o=e||{};od(o);try{let i=nd(o.graphOptimizationLevel??"all"),s=rd(o.executionMode??"sequential"),a=typeof o.logId=="string"?ve(o.logId,r):0,u=o.logSeverityLevel??2;if(!Number.isInteger(u)||u<0||u>4)throw new Error(`log severity level is not valid: ${u}`);let d=o.logVerbosityLevel??0;if(!Number.isInteger(d)||d<0||d>4)throw new Error(`log verbosity level is not valid: ${d}`);let l=typeof o.optimizedModelFilePath=="string"?ve(o.optimizedModelFilePath,r):0;if(n=t._OrtCreateSessionOptions(i,!!o.enableCpuMemArena,!!o.enableMemPattern,s,!!o.enableProfiling,0,a,u,d,l),n===0&&Y("Can't create session options."),o.executionProviders&&await id(n,o,r),o.enableGraphCapture!==void 0){if(typeof o.enableGraphCapture!="boolean")throw new Error(`enableGraphCapture must be a boolean value: ${o.enableGraphCapture}`);rt(n,"enableGraphCapture",o.enableGraphCapture.toString(),r)}if(o.freeDimensionOverrides)for(let[c,p]of Object.entries(o.freeDimensionOverrides)){if(typeof c!="string")throw new Error(`free dimension override name must be a string: ${c}`);if(typeof p!="number"||!Number.isInteger(p)||p<0)throw new Error(`free dimension override value must be a non-negative integer: ${p}`);let f=ve(c,r);t._OrtAddFreeDimensionOverride(n,f,p)!==0&&Y(`Can't set a free dimension override: ${c} - ${p}.`)}return o.extra!==void 0&&dt(o.extra,"",new WeakSet,(c,p)=>{rt(n,c,p,r)}),[n,r]}catch(i){throw n!==0&&t._OrtReleaseSessionOptions(n)!==0&&Y("Can't release session options."),r.forEach(s=>t._free(s)),i}}});var Ge,Ae,He,ot,lt,It,Ct,yn,H=E(()=>{Ge=e=>{switch(e){case"int8":return 3;case"uint8":return 2;case"bool":return 9;case"int16":return 5;case"uint16":return 4;case"int32":return 6;case"uint32":return 12;case"float16":return 10;case"float32":return 1;case"float64":return 11;case"string":return 8;case"int64":return 7;case"uint64":return 13;case"int4":return 22;case"uint4":return 21;default:throw new Error(`unsupported data type: ${e}`)}},Ae=e=>{switch(e){case 3:return"int8";case 2:return"uint8";case 9:return"bool";case 5:return"int16";case 4:return"uint16";case 6:return"int32";case 12:return"uint32";case 10:return"float16";case 1:return"float32";case 11:return"float64";case 8:return"string";case 7:return"int64";case 13:return"uint64";case 22:return"int4";case 21:return"uint4";default:throw new Error(`unsupported data type: ${e}`)}},He=(e,t)=>{let n=[-1,4,1,1,2,2,4,8,-1,1,2,8,4,8,-1,-1,-1,-1,-1,-1,-1,.5,.5][e],r=typeof t=="number"?t:t.reduce((o,i)=>o*i,1);return n>0?Math.ceil(r*n):void 0},ot=e=>{switch(e){case"float16":return typeof Float16Array<"u"?Float16Array:Uint16Array;case"float32":return Float32Array;case"uint8":return Uint8Array;case"int8":return Int8Array;case"uint16":return Uint16Array;case"int16":return Int16Array;case"int32":return Int32Array;case"bool":return Uint8Array;case"float64":return Float64Array;case"uint32":return Uint32Array;case"int64":return BigInt64Array;case"uint64":return BigUint64Array;default:throw new Error(`unsupported type: ${e}`)}},lt=e=>{switch(e){case"verbose":return 0;case"info":return 1;case"warning":return 2;case"error":return 3;case"fatal":return 4;default:throw new Error(`unsupported logging level: ${e}`)}},It=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",Ct=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint64"||e==="int8"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",yn=e=>{switch(e){case"none":return 0;case"cpu":return 1;case"cpu-pinned":return 2;case"texture":return 3;case"gpu-buffer":return 4;case"ml-tensor":return 5;default:throw new Error(`unsupported data location: ${e}`)}}});var ct,bn=E(()=>{xt();ct=async e=>{if(typeof e=="string")if(Ne)try{let{readFile:t}=sn("node:fs/promises");return new Uint8Array(await t(e))}catch(t){if(t.code==="ERR_FS_FILE_TOO_LARGE"){let{createReadStream:n}=sn("node:fs"),r=n(e),o=[];for await(let i of r)o.push(i);return new Uint8Array(Buffer.concat(o))}throw t}else{let t=await fetch(e);if(!t.ok)throw new Error(`failed to load external data file: ${e}`);let n=t.headers.get("Content-Length"),r=n?parseInt(n,10):0;if(r<1073741824)return new Uint8Array(await t.arrayBuffer());{if(!t.body)throw new Error(`failed to load external data file: ${e}, no response body.`);let o=t.body.getReader(),i;try{i=new ArrayBuffer(r)}catch(a){if(a instanceof RangeError){let u=Math.ceil(r/65536);i=new WebAssembly.Memory({initial:u,maximum:u}).buffer}else throw a}let s=0;for(;;){let{done:a,value:u}=await o.read();if(a)break;let d=u.byteLength;new Uint8Array(i,s,d).set(u),s+=d}return new Uint8Array(i,0,r)}}else return e instanceof Blob?new Uint8Array(await e.arrayBuffer()):e instanceof Uint8Array?e:new Uint8Array(e)}});var sd,ad,Gr,Hr,At,ud,X,ke=E(()=>{H();sd=["V","I","W","E","F"],ad=(e,t)=>{console.log(`[${sd[e]},${new Date().toISOString()}]${t}`)},At=(e,t)=>{Gr=e,Hr=t},ud=(e,t)=>{let n=lt(e),r=lt(Gr);n>=r&&ad(n,typeof t=="function"?t():t)},X=(...e)=>{Hr&&ud(...e)}});var _n,Ee,x,Ye,kt,qr,Fr,j=E(()=>{_n=class{static calcMatMulShape(t,n){return t[1]!==n[0]?void 0:[t[0],n[1]]}},Ee=class{static calcShape(t,n,r=!1){let o=t.length,i=n.length;if(o===0)return n;if(i===0)return t;let s=Math.max(t.length,n.length),a=new Array(s);if(r){if(o<2||i<2)return;let u=_n.calcMatMulShape([t[o-2],t[o-1]],[n[i-2],n[i-1]]);if(u===void 0)return;[a[s-2],a[s-1]]=u}for(let u=r?3:1;u<=s;u++){let d=o-u<0?1:t[o-u],l=i-u<0?1:n[i-u];if(d!==l&&d>1&&l>1)return;let c=Math.max(d,l);if(d&&l)a[s-u]=Math.max(d,l);else{if(c>1)return;a[s-u]=0}}return a}static isValidBroadcast(t,n){let r=t.length,o=n.length;if(r>o)return!1;for(let i=1;i<=r;i++)if(t[r-i]!==1&&t[r-i]!==n[o-i])return!1;return!0}},x=class e{static size(t){return e.getSizeFromDimensionRange(t,0,t.length)}static convertShape(t,n=4){let r=t.length;if(r===0)return[];let o=new Array(r),i=r-1;for(;i>=0;){if(t[i]%n===0){o[i]=t[i]/n;break}if(n%t[i]!==0)throw new Error("cannot convert shape");o[i]=1,n/=t[i],i--}for(i--;i>=0;i--)o[i]=t[i];return o}static sizeFromDimension(t,n){if(n<0||n>t.length)throw new Error(`invalid dimension of ${n} for sizeFromDimension as Tensor has ${t.length} dimensions.`);return e.getSizeFromDimensionRange(t,n,t.length)}static sizeToDimension(t,n){if(n<0||n>t.length)throw new Error(`invalid dimension of ${n} for sizeToDimension as Tensor has ${t.length} dimensions.`);return e.getSizeFromDimensionRange(t,0,n)}static getSizeFromDimensionRange(t,n,r){let o=1;for(let i=n;i<r;i++){if(t[i]<0)throw new Error("cannot get valid size from specified dimension range. Most likely the range contains negative values in them.");o*=Number(t[i])}return o}static computeStrides(t){let n=t.length;if(n===0)return[];if(n===1)return[1];let r=new Array(n);r[n-1]=1,r[n-2]=t[n-1];for(let o=n-3;o>=0;--o)r[o]=r[o+1]*t[o+1];return r}static normalizeAxis(t,n){if(t<-n&&t>=n)throw new Error("unsupported axis for this operation.");return t<0?t+n:t}static normalizeAxes(t,n){return t.map(r=>this.normalizeAxis(r,n??t.length))}static sortBasedOnPerm(t,n){return n?n.map(r=>t[r]):t.slice().reverse()}static padShape(t,n){let r=t.length;return t.map((o,i)=>o+n[i]+n[i+r])}static areEqual(t,n){return t.length!==n.length?!1:t.every((r,o)=>r===n[o])}},Ye=class e{static adjustPoolAttributes(t,n,r,o,i,s){if(!t&&r.length!==n.length-2)throw new Error("length of specified kernel shapes should be 2 less than length of input dimensions");if(t)for(let a=0;a<n.length-2;a++)a>=r.length?r.push(n[a+2]):r[a]=n[a+2];for(let a=0;a<r.length;a++)if(a<o.length){if(o[a]<0)throw new Error("strides should be greater than or equal to 1")}else o.push(1);for(let a=0;a<r.length;a++)if(a<i.length){if(i[a]<0)throw new Error("dilations should be greater than or equal to 1")}else i.push(1);for(let a=0;a<r.length*2;a++)if(a<s.length){if(s[a]<0)throw new Error("pad should be greater than or equal to 1")}else s.push(0);for(let a=0;a<r.length;a++){if(r[a]<=0)throw new Error("kernel shapes need to be greater than 0");if(s[a]>=r[a]||s[a+r.length]>=r[a])throw new Error("pads should be smaller than kernel")}}static adjustPadsBasedOnAutoPad(t,n,r,o,i,s,a){if(a){if(i.length!==2*(t.length-2))throw new Error("length of pads should be twice the length of data dimensions");if(n.length!==t.length-2)throw new Error("length of strides should be the length of data dimensions");if(o.length!==t.length-2)throw new Error("length of kernel shapes should be the length of data dimensions");for(let u=0;u<t.length-2;u++)e.adjustPadAndReturnShape(t[u+(s?1:2)],n[u],r[u],o[u],i,u,u+t.length-2,a)}}static computePoolOutputShape(t,n,r,o,i,s,a,u=0){if(n.length<=0)throw new Error("input shape must be of size greater than 0");let d=[n[0],n[1]];return e.computeShapeHelper(t,n,d,r,o,i,s,a,u),d}static computeConvOutputShape(t,n,r,o,i,s,a){if(t.length<=0||n.length<=0)throw new Error("invalid input tensor dims or invalid filter tensor dims");let u=[t[0],n[0]];return e.computeShapeHelper(!1,t,u,r,o,i,s,a),u}static computeShapeHelper(t,n,r,o,i,s,a,u,d=0){if(t)for(let l=0;l<n.length-2;l++)r.push(1);else for(let l=0;l<n.length-2;l++)r.push(e.adjustPadAndReturnShape(n[l+2],o[l],i[l],s[l],a,l,l+n.length-2,u,d))}static computeOutputSize(t,n,r,o,i){let s=Math.floor(t/n)+1;return i===1&&(s=Math.ceil(t/n)+1,(s-1)*n>=r+o&&(s-=1)),s}static adjustPadAndReturnShape(t,n,r,o,i,s,a,u,d=0){let l=r*(o-1)+1;if(u&&u!=="NOTSET")switch(u){case"VALID":return i[s]=0,i[a]=0,e.computeOutputSize(t-l,n,t,0,d);case"SAME_LOWER":case"SAME_UPPER":if(r!==1)throw new Error("Dilation not supported for SAME_UPPER or SAME_LOWER");{let p=(Math.floor((t+n-1)/n)-1)*n+o-t;return i[s]=Math.floor(u==="SAME_LOWER"?(p+1)/2:p/2),i[a]=p-i[s],e.computeOutputSize(t+i[s]+i[a]-l,n,t,i[s],d)}default:throw new Error("Unsupported AutoPad type")}else return e.computeOutputSize(t+i[s]+i[a]-l,n,t,i[s],d)}},kt=class{static getShapeOfGemmResult(t,n,r,o,i){if(t.length!==2||r.length!==2)throw new Error("shape need to be of size 2");let s,a,u;n?(s=t[1],a=t[0]):(s=t[0],a=t[1]);let d=-1;if(o?(u=r[0],d=1):(u=r[1],d=0),r[d]!==a)throw new Error("dimension mismatch");if(s<=0||u<=0||a<=0)throw new Error("invalid shape specified");if(i&&!Ee.isValidBroadcast(i,[s,u]))throw new Error("gemm: invalid bias shape for broadcast");return[s,u,a]}},qr=-34028234663852886e22,Fr=34028234663852886e22});var Et,wn=E(()=>{H();Et=(e,t)=>new(ot(t))(e)});var jr,dd,Zr,ld,Kr,cd,Qr,Pt,zt,$n,Xr,Yr=E(()=>{H();ke();jr=new Map([["float32",32],["float16",16],["int32",32],["uint32",32],["int64",64],["uint64",64],["int8",8],["uint8",8],["int4",4],["uint4",4]]),dd=(e,t)=>{if(t==="int32")return e;let n=jr.get(t);if(!n)throw new Error(`WebNN backend does not support data type: ${t}`);let r=n/8;if(e.byteLength%r!==0)throw new Error(`Invalid Uint8Array length - must be a multiple of ${r}.`);let o=e.byteLength/r,i=new(ot(t))(e.buffer,e.byteOffset,o);switch(t){case"int64":case"uint64":{let s=new Int32Array(o);for(let a=0;a<o;a++){let u=i[a];if(u>2147483647n||u<-2147483648n)throw new Error("Can not convert int64 data to int32 - value out of range.");s[a]=Number(u)}return new Uint8Array(s.buffer)}case"int8":case"uint8":case"uint32":{if(t==="uint32"&&i.some(a=>a>2147483647))throw new Error("Can not convert uint32 data to int32 - value out of range.");let s=Int32Array.from(i,Number);return new Uint8Array(s.buffer)}default:throw new Error(`Unsupported data conversion from ${t} to 'int32'`)}},Zr=(e,t)=>{if(t==="int32")return e;if(e.byteLength%4!==0)throw new Error("Invalid Uint8Array length - must be a multiple of 4 (int32).");let n=e.byteLength/4,r=new Int32Array(e.buffer,e.byteOffset,n);switch(t){case"int64":{let o=BigInt64Array.from(r,BigInt);return new Uint8Array(o.buffer)}case"uint64":{if(r.some(i=>i<0))throw new Error("Can not convert int32 data to uin64 - negative value found.");let o=BigUint64Array.from(r,BigInt);return new Uint8Array(o.buffer)}case"int8":{if(r.some(i=>i<-128||i>127))throw new Error("Can not convert int32 data to int8 - value out of range.");let o=Int8Array.from(r,Number);return new Uint8Array(o.buffer)}case"uint8":{if(r.some(o=>o<0||o>255))throw new Error("Can not convert int32 data to uint8 - value out of range.");return Uint8Array.from(r,Number)}case"uint32":{if(r.some(i=>i<0))throw new Error("Can not convert int32 data to uint32 - negative value found.");let o=Uint32Array.from(r,Number);return new Uint8Array(o.buffer)}default:throw new Error(`Unsupported data conversion from 'int32' to ${t}`)}},ld=1,Kr=()=>ld++,cd=new Map([["int8","int32"],["uint8","int32"],["uint32","int32"],["int64","int32"]]),Qr=(e,t)=>{let n=jr.get(e);if(!n)throw new Error(`WebNN backend does not support data type: ${e}`);return t.length>0?Math.ceil(t.reduce((r,o)=>r*o)*n/8):0},Pt=class{sessionId;isDataConverted=!1;mlContext;mlTensor;dataType;fallbackDataType;tensorShape;constructor(t){let{sessionId:n,context:r,tensor:o,dataType:i,shape:s,fallbackDataType:a}=t;this.sessionId=n,this.mlContext=r,this.mlTensor=o,this.dataType=i,this.tensorShape=s,this.fallbackDataType=a}get tensor(){return this.mlTensor}get type(){return this.dataType}get fallbackType(){return this.fallbackDataType}get shape(){return this.tensorShape}get byteLength(){return Qr(this.dataType,this.tensorShape)}destroy(){X("verbose",()=>"[WebNN] TensorWrapper.destroy"),this.mlTensor.destroy()}write(t){this.mlContext.writeTensor(this.mlTensor,t)}async read(t){if(this.fallbackDataType){let n=await this.mlContext.readTensor(this.mlTensor),r=Zr(new Uint8Array(n),this.dataType);if(t){(t instanceof ArrayBuffer?new Uint8Array(t):new Uint8Array(t.buffer,t.byteOffset,t.byteLength)).set(r);return}else return new Uint8Array(r).buffer}else return t?this.mlContext.readTensor(this.mlTensor,t):this.mlContext.readTensor(this.mlTensor)}canReuseTensor(t,n,r){return this.mlContext===t&&this.dataType===n&&this.tensorShape.length===r.length&&this.tensorShape.every((o,i)=>o===r[i])}setIsDataConverted(t){this.isDataConverted=t}},zt=class{constructor(t,n){this.tensorManager=t;this.wrapper=n}tensorManager;wrapper;activeUpload;get tensorWrapper(){return this.wrapper}releaseTensor(){this.tensorWrapper&&(this.tensorManager.releaseTensor(this.tensorWrapper),this.wrapper=void 0)}async ensureTensor(t,n,r,o){let i=this.tensorManager.getMLContext(t),s=this.tensorManager.getMLOpSupportLimits(t),a;if(!s?.input.dataTypes.includes(n)){if(a=cd.get(n),!a||!s?.input.dataTypes.includes(a))throw new Error(`WebNN backend does not support data type: ${n}`);X("verbose",()=>`[WebNN] TensorIdTracker.ensureTensor: fallback dataType from ${n} to ${a}`)}if(this.wrapper){if(this.wrapper.canReuseTensor(i,n,r))return this.wrapper.tensor;if(o){if(this.wrapper.byteLength!==Qr(n,r))throw new Error("Unable to copy data to tensor with different size.");this.activeUpload=new Uint8Array(await this.wrapper.read())}this.tensorManager.releaseTensor(this.wrapper)}let u=typeof MLTensorUsage>"u"?void 0:MLTensorUsage.READ|MLTensorUsage.WRITE;return this.wrapper=await this.tensorManager.getCachedTensor(t,n,r,u,!0,!0,a),o&&this.activeUpload&&(this.wrapper.write(this.activeUpload),this.activeUpload=void 0),this.wrapper.tensor}upload(t){let n=t;if(this.wrapper){if(this.wrapper.fallbackType)if(this.wrapper.fallbackType==="int32")n=dd(t,this.wrapper.type),this.wrapper.setIsDataConverted(!0);else throw new Error(`Unsupported fallback data type: ${this.wrapper.fallbackType}`);if(t.byteLength===this.wrapper.byteLength){this.wrapper.write(n);return}else X("verbose",()=>"Data size does not match tensor size. Releasing tensor."),this.releaseTensor()}this.activeUpload?this.activeUpload.set(n):this.activeUpload=new Uint8Array(n)}async download(t){if(this.activeUpload){let n=this.wrapper?.isDataConverted?Zr(this.activeUpload,this.wrapper?.type):this.activeUpload;if(t){t instanceof ArrayBuffer?new Uint8Array(t).set(n):new Uint8Array(t.buffer,t.byteOffset,t.byteLength).set(n);return}else return n.buffer}if(!this.wrapper)throw new Error("Tensor has not been created.");return t?this.wrapper.read(t):this.wrapper.read()}},$n=class{constructor(t){this.backend=t}backend;tensorTrackersById=new Map;freeTensors=[];externalTensors=new Set;getMLContext(t){let n=this.backend.getMLContext(t);if(!n)throw new Error("MLContext not found for session.");return n}getMLOpSupportLimits(t){return this.backend.getMLOpSupportLimits(t)}reserveTensorId(){let t=Kr();return this.tensorTrackersById.set(t,new zt(this)),t}releaseTensorId(t){let n=this.tensorTrackersById.get(t);n&&(this.tensorTrackersById.delete(t),n.tensorWrapper&&this.releaseTensor(n.tensorWrapper))}async ensureTensor(t,n,r,o,i){X("verbose",()=>`[WebNN] TensorManager.ensureTensor {tensorId: ${n}, dataType: ${r}, shape: ${o}, copyOld: ${i}}`);let s=this.tensorTrackersById.get(n);if(!s)throw new Error("Tensor not found.");return s.ensureTensor(t,r,o,i)}upload(t,n){let r=this.tensorTrackersById.get(t);if(!r)throw new Error("Tensor not found.");r.upload(n)}async download(t,n){X("verbose",()=>`[WebNN] TensorManager.download {tensorId: ${t}, dstBuffer: ${n?.byteLength}}`);let r=this.tensorTrackersById.get(t);if(!r)throw new Error("Tensor not found.");return r.download(n)}releaseTensorsForSession(t){for(let n of this.freeTensors)n.sessionId===t&&n.destroy();this.freeTensors=this.freeTensors.filter(n=>n.sessionId!==t)}registerTensor(t,n,r,o){let i=this.getMLContext(t),s=Kr(),a=new Pt({sessionId:t,context:i,tensor:n,dataType:r,shape:o});return this.tensorTrackersById.set(s,new zt(this,a)),this.externalTensors.add(a),s}async getCachedTensor(t,n,r,o,i,s,a){let u=this.getMLContext(t);for(let[l,c]of this.freeTensors.entries())if(c.canReuseTensor(u,n,r)){X("verbose",()=>`[WebNN] Reusing tensor {dataType: ${n}, ${a?`fallbackDataType: ${a},`:""} shape: ${r}`);let p=this.freeTensors.splice(l,1)[0];return p.sessionId=t,p}X("verbose",()=>`[WebNN] MLContext.createTensor {dataType: ${n}, ${a?`fallbackDataType: ${a},`:""} shape: ${r}}`);let d=await u.createTensor({dataType:a??n,shape:r,dimensions:r,usage:o,writable:i,readable:s});return new Pt({sessionId:t,context:u,tensor:d,dataType:n,shape:r,fallbackDataType:a})}releaseTensor(t){this.externalTensors.has(t)&&this.externalTensors.delete(t),this.freeTensors.push(t)}},Xr=(...e)=>new $n(...e)});var Dt,pd,Bt,Jr=E(()=>{H();Xe();wn();Yr();ke();Dt=new Map([[1,"float32"],[10,"float16"],[6,"int32"],[12,"uint32"],[7,"int64"],[13,"uint64"],[22,"int4"],[21,"uint4"],[3,"int8"],[2,"uint8"],[9,"uint8"]]),pd=(e,t)=>{if(e===t)return!0;if(e===void 0||t===void 0)return!1;let n=Object.keys(e).sort(),r=Object.keys(t).sort();return n.length===r.length&&n.every((o,i)=>o===r[i]&&e[o]===t[o])},Bt=class{tensorManager=Xr(this);mlContextBySessionId=new Map;sessionIdsByMLContext=new Map;mlContextCache=[];activeSessionId;sessionGraphInputs=new Map;sessionGraphOutputs=new Map;temporaryGraphInputs=[];temporaryGraphOutputs=[];temporarySessionTensorIds=new Map;mlOpSupportLimitsBySessionId=new Map;constructor(t){At(t.logLevel,!!t.debug)}get currentSessionId(){if(this.activeSessionId===void 0)throw new Error("No active session");return this.activeSessionId}onRunStart(t){X("verbose",()=>`[WebNN] onRunStart {sessionId: ${t}}`),this.activeSessionId=t}onRunEnd(t){X("verbose",()=>`[WebNN] onRunEnd {sessionId: ${t}}`);let n=this.temporarySessionTensorIds.get(t);if(n){for(let r of n)X("verbose",()=>`[WebNN] releasing temporary tensor {tensorId: ${r}}`),this.tensorManager.releaseTensorId(r);this.temporarySessionTensorIds.delete(t),this.activeSessionId=void 0}}async createMLContext(t){if(t instanceof GPUDevice){let r=this.mlContextCache.findIndex(o=>o.gpuDevice===t);if(r!==-1)return this.mlContextCache[r].mlContext;{let o=await navigator.ml.createContext(t);return this.mlContextCache.push({gpuDevice:t,mlContext:o}),o}}else if(t===void 0){let r=this.mlContextCache.findIndex(o=>o.options===void 0&&o.gpuDevice===void 0);if(r!==-1)return this.mlContextCache[r].mlContext;{let o=await navigator.ml.createContext();return this.mlContextCache.push({mlContext:o}),o}}let n=this.mlContextCache.findIndex(r=>pd(r.options,t));if(n!==-1)return this.mlContextCache[n].mlContext;{let r=await navigator.ml.createContext(t);return this.mlContextCache.push({options:t,mlContext:r}),r}}registerMLContext(t,n){this.mlContextBySessionId.set(t,n);let r=this.sessionIdsByMLContext.get(n);r||(r=new Set,this.sessionIdsByMLContext.set(n,r)),r.add(t),this.mlOpSupportLimitsBySessionId.has(t)||this.mlOpSupportLimitsBySessionId.set(t,n.opSupportLimits()),this.temporaryGraphInputs.length>0&&(this.sessionGraphInputs.set(t,this.temporaryGraphInputs),this.temporaryGraphInputs=[]),this.temporaryGraphOutputs.length>0&&(this.sessionGraphOutputs.set(t,this.temporaryGraphOutputs),this.temporaryGraphOutputs=[])}onReleaseSession(t){this.sessionGraphInputs.delete(t),this.sessionGraphOutputs.delete(t);let n=this.mlContextBySessionId.get(t);if(!n)return;this.tensorManager.releaseTensorsForSession(t),this.mlContextBySessionId.delete(t),this.mlOpSupportLimitsBySessionId.delete(t);let r=this.sessionIdsByMLContext.get(n);if(r.delete(t),r.size===0){this.sessionIdsByMLContext.delete(n);let o=this.mlContextCache.findIndex(i=>i.mlContext===n);o!==-1&&this.mlContextCache.splice(o,1)}}getMLContext(t){return this.mlContextBySessionId.get(t)}getMLOpSupportLimits(t){return this.mlOpSupportLimitsBySessionId.get(t)}reserveTensorId(){return this.tensorManager.reserveTensorId()}releaseTensorId(t){X("verbose",()=>`[WebNN] releaseTensorId {tensorId: ${t}}`),this.tensorManager.releaseTensorId(t)}async ensureTensor(t,n,r,o,i){let s=Dt.get(r);if(!s)throw new Error(`Unsupported ONNX data type: ${r}`);return this.tensorManager.ensureTensor(t??this.currentSessionId,n,s,o,i)}async createTemporaryTensor(t,n,r){X("verbose",()=>`[WebNN] createTemporaryTensor {onnxDataType: ${n}, shape: ${r}}`);let o=Dt.get(n);if(!o)throw new Error(`Unsupported ONNX data type: ${n}`);let i=this.tensorManager.reserveTensorId();await this.tensorManager.ensureTensor(t,i,o,r,!1);let s=this.temporarySessionTensorIds.get(t);return s?s.push(i):this.temporarySessionTensorIds.set(t,[i]),i}uploadTensor(t,n){if(!te().shouldTransferToMLTensor)throw new Error("Trying to upload to a MLTensor while shouldTransferToMLTensor is false");X("verbose",()=>`[WebNN] uploadTensor {tensorId: ${t}, data: ${n.byteLength}}`),this.tensorManager.upload(t,n)}async downloadTensor(t,n){return this.tensorManager.download(t,n)}createMLTensorDownloader(t,n){return async()=>{let r=await this.tensorManager.download(t);return Et(r,n)}}registerMLTensor(t,n,r,o){let i=Dt.get(r);if(!i)throw new Error(`Unsupported ONNX data type: ${r}`);let s=this.tensorManager.registerTensor(t,n,i,o);return X("verbose",()=>`[WebNN] registerMLTensor {tensor: ${n}, dataType: ${i}, dimensions: ${o}} -> {tensorId: ${s}}`),s}registerGraphInput(t){this.temporaryGraphInputs.push(t)}registerGraphOutput(t){this.temporaryGraphOutputs.push(t)}isGraphInput(t,n){let r=this.sessionGraphInputs.get(t);return r?r.includes(n):!1}isGraphOutput(t,n){let r=this.sessionGraphOutputs.get(t);return r?r.includes(n):!1}isGraphInputOutputTypeSupported(t,n,r=!0){let o=Dt.get(Ge(n)),i=this.mlOpSupportLimitsBySessionId.get(t);return typeof o>"u"?!1:r?!!i?.input.dataTypes.includes(o):!!i?.output.dataTypes.includes(o)}flush(){}}});var Ot=E(()=>{});var eo,vn,xn,md,fd,to,Tn,Sn,ro,oo=E(()=>{ke();Ot();eo=new Map([[64,250],[128,200],[256,200],[512,200],[2048,230],[4096,200],[8192,50],[16384,50],[32768,50],[65536,50],[131072,50],[262144,50],[524288,50],[1048576,50],[2097152,30],[4194304,20],[8388608,10],[12582912,10],[16777216,10],[26214400,15],[33554432,22],[44236800,2],[58982400,6],[67108864,6],[134217728,6],[167772160,6]]),vn=[],xn=e=>Math.ceil(Number(e)/16)*16,md=e=>{for(let t=0;t<vn.length;t++){let n=vn[t];if(e<=n)return n}return Math.ceil(e/16)*16},fd=1,to=()=>fd++,Tn=async(e,t,n,r)=>{let o=xn(n),i=e.device.createBuffer({size:o,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});try{let s=e.getCommandEncoder();e.endComputePass(),s.copyBufferToBuffer(t,0,i,0,o),e.flush(),await i.mapAsync(GPUMapMode.READ);let a=i.getMappedRange();if(r){let u=r();return u.set(new Uint8Array(a,0,n)),u}else return new Uint8Array(a.slice(0,n))}finally{i.destroy()}},Sn=class{constructor(t){this.backend=t;this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.buffersPending=[],this.capturedPendingBuffers=new Map;for(let[n]of eo)vn.push(n),this.freeBuffers.set(n,[]),this.freeUniformBuffers.set(n,[]);this.sessionCount=0}backend;storageCache;buffersPending;freeBuffers;freeUniformBuffers;capturedPendingBuffers;sessionCount;upload(t,n){let r=n.buffer,o=n.byteOffset,i=n.byteLength,s=xn(i),a=this.storageCache.get(t);if(!a)throw new Error("gpu data for uploading does not exist");if(Number(a.originalSize)!==i)throw new Error(`inconsistent data size. gpu data size=${a.originalSize}, data size=${i}`);if(s===i&&o%4===0)this.backend.device.queue.writeBuffer(a.gpuData.buffer,0,r,o,i);else{let u=new Uint8Array(s);u.set(n),this.backend.device.queue.writeBuffer(a.gpuData.buffer,0,u,0,s)}X("verbose",()=>`[WebGPU] GpuDataManager.upload(id=${t})`)}memcpy(t,n){let r=this.storageCache.get(t);if(!r)throw new Error("source gpu data for memcpy does not exist");let o=this.storageCache.get(n);if(!o)throw new Error("destination gpu data for memcpy does not exist");if(r.originalSize!==o.originalSize)throw new Error("inconsistent source and destination gpu data size");let i=xn(r.originalSize),s=this.backend.getCommandEncoder();this.backend.endComputePass(),s.copyBufferToBuffer(r.gpuData.buffer,0,o.gpuData.buffer,0,i)}registerExternalBuffer(t,n,r){let o;if(r){if(o=r[0],t===r[1])return X("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${n}) => id=${o}, buffer is the same, skip.`),o;if(this.backend.capturedCommandList.has(this.backend.currentSessionId))throw new Error(`Registering a different external buffer under graph capture mode is not supported yet.
             Please use the previous external buffer!`)}else o=to();return this.storageCache.set(o,{gpuData:{id:o,type:0,buffer:t},originalSize:n}),X("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${n}) => id=${o}, registered.`),o}unregisterExternalBuffer(t){t!==void 0&&(this.storageCache.delete(t),X("verbose",()=>`[WebGPU] GpuDataManager.unregisterExternalBuffer() => id=${t}`))}create(t,n=GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST){let r=md(t),o,i=(n&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE,s=(n&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM;if(i||s){let d=(i?this.freeBuffers:this.freeUniformBuffers).get(r);d?d.length>0?o=d.pop():o=this.backend.device.createBuffer({size:r,usage:n}):o=this.backend.device.createBuffer({size:r,usage:n})}else o=this.backend.device.createBuffer({size:r,usage:n});let a={id:to(),type:0,buffer:o};return this.storageCache.set(a.id,{gpuData:a,originalSize:Number(t)}),X("verbose",()=>`[WebGPU] GpuDataManager.create(size=${t}) => id=${a.id}`),a}get(t){return this.storageCache.get(t)?.gpuData}release(t){let n=typeof t=="bigint"?Number(t):t,r=this.storageCache.get(n);if(!r){if(this.storageCache.size===0)return 0;throw new Error("releasing data does not exist")}return X("verbose",()=>`[WebGPU] GpuDataManager.release(id=${n}), gpuDataId=${r.gpuData.id}`),this.storageCache.delete(n),this.buffersPending.push(r.gpuData.buffer),r.originalSize}async download(t,n){let r=this.storageCache.get(Number(t));if(!r)throw new Error("data does not exist");await Tn(this.backend,r.gpuData.buffer,r.originalSize,n)}refreshPendingBuffers(){if(this.buffersPending.length!==0)if(this.backend.sessionStatus==="default"){for(let t of this.buffersPending){let n=eo.get(t.size);if((t.usage&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE){let r=this.freeBuffers.get(t.size)||[];n===void 0||r.length>=n?t.destroy():r.push(t)}else if((t.usage&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM){let r=this.freeUniformBuffers.get(t.size)||[];n===void 0||r.length>=n?t.destroy():r.push(t)}else t.destroy()}this.buffersPending=[]}else{let t=this.capturedPendingBuffers.get(this.backend.currentSessionId);t||(t=[],this.capturedPendingBuffers.set(this.backend.currentSessionId,t));for(let n of this.buffersPending)t.push(n);this.buffersPending=[]}}dispose(){this.freeBuffers.forEach(t=>{t.forEach(n=>{n.destroy()})}),this.freeUniformBuffers.forEach(t=>{t.forEach(n=>{n.destroy()})}),this.storageCache.forEach(t=>{t.gpuData.buffer.destroy()}),this.capturedPendingBuffers.forEach(t=>{t.forEach(n=>{n.destroy()})}),this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.capturedPendingBuffers=new Map}onCreateSession(){this.sessionCount+=1}onReleaseSession(t){let n=this.capturedPendingBuffers.get(t);n&&(n.forEach(r=>{r.destroy()}),this.capturedPendingBuffers.delete(t)),this.sessionCount-=1,this.sessionCount===0&&(X("warning",()=>"[WebGPU] Clearing webgpu buffer cache"),this.storageCache.forEach(r=>{r.gpuData.buffer.destroy()}),this.storageCache=new Map)}},ro=(...e)=>new Sn(...e)});var In,G,ue=E(()=>{In=class{constructor(t){Object.assign(this,t)}key;get cacheKey(){return this.key||(this.key=Object.getOwnPropertyNames(this).sort().map(t=>`${this[t]}`).join(";")),this.key}},G=e=>new In(e)});var Je,An,ne,de,z,J,kn,et,Se,U,Mt,T,A,io,Ut,Cn,so,Q=E(()=>{H();j();Je=64,An=(e,t)=>{if(t===3)throw new Error("vec3 has same alignment as vec4, use vec4 instead");switch(Number(e)){case 10:return t>1?`vec${t}<f16>`:"f16";case 1:return t>1?`vec${t}<f32>`:"f32";case 6:return t>1?`vec${t}<i32>`:"i32";case 12:return t>1?`vec${t}<u32>`:"u32";case 7:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","i32"];case 13:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","u32"];case 9:if(t!==4)throw new Error("bool must be vec4");return["u32","vec4<bool>"];case 22:return"i32";case 21:return"u32";default:throw new Error(`Unknown data type: ${e}`)}},ne=(e,t=1)=>{let n=An(e,t);return typeof n=="string"?n:n[0]},de=(e,t=1)=>{let n=An(e,t);return typeof n=="string"?n:n[1]},z=(...e)=>{let t=[];return e.forEach(n=>{n.length!==0&&t.push({type:12,data:n},{type:12,data:x.computeStrides(n)})}),t},J=e=>e%4===0?4:e%2===0?2:1,kn=(e="f32",t,n="0")=>!t||t===1?`${e}(${n})`:`vec${t}<${e}>(${n})`,et=(e,t,n)=>e==="f32"?n:t===1?`f32(${n})`:`vec${t}<f32>(${n})`,Se=(e,t)=>t===4?`(${e}.x + ${e}.y + ${e}.z + ${e}.w)`:t===2?`(${e}.x + ${e}.y)`:t===3?`(${e}.x + ${e}.y + ${e}.z)`:e,U=(e,t,n,r)=>e.startsWith("uniforms.")&&n>4?typeof t=="string"?r==="f16"?`${e}[(${t}) / 8][(${t}) % 8 / 4][(${t}) % 8 % 4]`:`${e}[(${t}) / 4][(${t}) % 4]`:r==="f16"?`${e}[${Math.floor(t/8)}][${Math.floor(t%8/4)}][${t%8%4}]`:`${e}[${Math.floor(t/4)}][${t%4}]`:n>1?`${e}[${t}]`:e,Mt=(e,t,n,r,o)=>{let i=typeof n=="number",s=i?n:n.length,a=[...new Array(s).keys()],u=s<2?"u32":s<=4?`vec${s}<u32>`:`array<u32, ${s}>`,d=An(t,o),l=typeof d=="string"?d:d[1],c=typeof d=="string"?d:d[0],p={indices:u,value:l,storage:c,tensor:t},f=k=>typeof k=="string"?k:`${k}u`,m={offsetToIndices:!1,indicesToOffset:!1,broadcastedIndicesToOffset:!1,set:!1,setByIndices:!1,get:!1,getByIndices:!1},h=i?"uniforms.":"",b=`${h}${e}_shape`,g=`${h}${e}_strides`,y="";for(let k=0;k<s-1;k++)y+=`
    let dim${k} = current / ${U(g,k,s)};
    let rest${k} = current % ${U(g,k,s)};
    indices[${k}] = dim${k};
    current = rest${k};
    `;y+=`indices[${s-1}] = current;`;let _=s<2?"":`
  fn o2i_${e}(offset: u32) -> ${p.indices} {
    var indices: ${p.indices};
    var current = offset;
    ${y}
    return indices;
  }`,w=k=>(m.offsetToIndices=!0,s<2?k:`o2i_${e}(${k})`),$=[];if(s>=2)for(let k=s-1;k>=0;k--)$.push(`${U(g,k,s)} * (indices[${k}])`);let v=s<2?"":`
  fn i2o_${e}(indices: ${p.indices}) -> u32 {
    return ${$.join("+")};
  }`,I=k=>(m.indicesToOffset=!0,s<2?k:`i2o_${e}(${k})`),S=(...k)=>s===0?"0u":`${p.indices}(${k.map(f).join(",")})`,C=(k,D)=>s<2?`${k}`:`${U(k,D,s)}`,P=(k,D,re)=>s<2?`${k}=${re};`:`${U(k,D,s)}=${re};`,R={},O=(k,D)=>{m.broadcastedIndicesToOffset=!0;let re=`${D.name}broadcastedIndicesTo${e}Offset`;if(re in R)return`${re}(${k})`;let he=[];for(let ae=s-1;ae>=0;ae--){let ge=D.indicesGet("outputIndices",ae+D.rank-s);he.push(`${C(g,ae)} * (${ge} % ${C(b,ae)})`)}return R[re]=`fn ${re}(outputIndices: ${D.type.indices}) -> u32 {
             return ${he.length>0?he.join("+"):"0u"};
           }`,`${re}(${k})`},N=(k,D)=>(()=>{if(p.storage===p.value)return`${e}[${k}]=${D};`;if(p.storage==="vec2<u32>"&&p.value==="i32")return`${e}[${k}]=vec2<u32>(u32(${D}), select(0u, 0xFFFFFFFFu, ${D} < 0));`;if(p.storage==="vec2<u32>"&&p.value==="u32")return`${e}[${k}]=vec2<u32>(u32(${D}), 0u);`;if(p.storage==="u32"&&p.value==="vec4<bool>")return`${e}[${k}]=dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(${D}));`;throw new Error(`not supported combination of storage type ${p.storage} and value type ${p.value} yet`)})(),q=k=>(()=>{if(p.storage===p.value)return`${e}[${k}]`;if(p.storage==="vec2<u32>"&&p.value==="i32")return`i32(${e}[${k}].x)`;if(p.storage==="vec2<u32>"&&p.value==="u32")return`u32(${e}[${k}].x)`;if(p.storage==="u32"&&p.value==="vec4<bool>")return`vec4<bool>(bool(${e}[${k}] & 0xFFu), bool(${e}[${k}] & 0xFF00u), bool(${e}[${k}] & 0xFF0000u), bool(${e}[${k}] & 0xFF000000u))`;throw new Error(`not supported combination of storage type ${p.storage} and value type ${p.value} yet`)})(),B=s<2?"":`
  fn get_${e}ByIndices(indices: ${p.indices}) -> ${l} {
    return ${q(`i2o_${e}(indices)`)};
  }`,M=s<2?"":(()=>{let k=a.map(re=>`d${re}: u32`).join(", "),D=a.map(re=>`d${re}`).join(", ");return`
  fn get_${e}(${k}) -> ${l} {
    return get_${e}ByIndices(${S(D)});
  }`})(),W=(...k)=>{if(k.length!==s)throw new Error(`indices length must be ${s}`);let D=k.map(f).join(",");return s===0?q("0u"):s===1?q(D[0]):(m.get=!0,m.getByIndices=!0,m.indicesToOffset=!0,`get_${e}(${D})`)},L=k=>s<2?q(k):(m.getByIndices=!0,m.indicesToOffset=!0,`get_${e}ByIndices(${k})`),K=s<2?"":`
  fn set_${e}ByIndices(indices: ${p.indices}, value: ${l}) {
    ${N(`i2o_${e}(indices)`,"value")}
  }`,V=s<2?"":(()=>{let k=a.map(re=>`d${re}: u32`).join(", "),D=a.map(re=>`d${re}`).join(", ");return`
  fn set_${e}(${k}, value: ${l}) {
    set_${e}ByIndices(${S(D)}, value);
  }`})();return{impl:()=>{let k=[],D=!1;return m.offsetToIndices&&(k.push(_),D=!0),m.indicesToOffset&&(k.push(v),D=!0),m.broadcastedIndicesToOffset&&(Object.values(R).forEach(re=>k.push(re)),D=!0),m.set&&(k.push(V),D=!0),m.setByIndices&&(k.push(K),D=!0),m.get&&(k.push(M),D=!0),m.getByIndices&&(k.push(B),D=!0),!i&&D&&k.unshift(`const ${b} = ${p.indices}(${n.join(",")});`,`const ${g} = ${p.indices}(${x.computeStrides(n).join(",")});`),k.join(`
`)},type:p,offsetToIndices:w,indicesToOffset:I,broadcastedIndicesToOffset:O,indices:S,indicesGet:C,indicesSet:P,set:(...k)=>{if(k.length!==s+1)throw new Error(`indices length must be ${s}`);let D=k[s];if(typeof D!="string")throw new Error("value must be string");let re=k.slice(0,s).map(f).join(",");return s===0?N("0u",D):s===1?N(re[0],D):(m.set=!0,m.setByIndices=!0,m.indicesToOffset=!0,`set_${e}(${re}, ${D})`)},setByOffset:N,setByIndices:(k,D)=>s<2?N(k,D):(m.setByIndices=!0,m.indicesToOffset=!0,`set_${e}ByIndices(${k}, ${D});`),get:W,getByOffset:q,getByIndices:L,usage:r,name:e,strides:g,shape:b,rank:s}},T=(e,t,n,r=1)=>Mt(e,t,n,"input",r),A=(e,t,n,r=1)=>Mt(e,t,n,"output",r),io=(e,t,n)=>Mt(e,t,n,"atomicOutput",1),Ut=(e,t,n,r=1)=>Mt(e,t,n,"internal",r),Cn=class{constructor(t,n){this.normalizedDispatchGroup=t;this.limits=n}normalizedDispatchGroup;limits;guardAgainstOutOfBoundsWorkgroupSizes(t){return`if (global_idx >= ${typeof t=="number"?`${t}u`:t}) { return; }`}mainStart(t=Je){let n=typeof t=="number"?t:t[0],r=typeof t=="number"?1:t[1],o=typeof t=="number"?1:t[2];if(n>this.limits.maxComputeWorkgroupSizeX||r>this.limits.maxComputeWorkgroupSizeY||o>this.limits.maxComputeWorkgroupSizeZ)throw new Error(`workgroup size [${n}, ${r}, ${o}] exceeds the maximum workgroup size [${this.limits.maxComputeWorkgroupSizeX}, ${this.limits.maxComputeWorkgroupSizeY}, ${this.limits.maxComputeWorkgroupSizeZ}].`);if(n*r*o>this.limits.maxComputeInvocationsPerWorkgroup)throw new Error(`workgroup size [${n}, ${r}, ${o}] exceeds the maximum workgroup invocations ${this.limits.maxComputeInvocationsPerWorkgroup}.`);let i=this.normalizedDispatchGroup[1]===1&&this.normalizedDispatchGroup[2]===1,s=i?`@builtin(global_invocation_id) global_id : vec3<u32>,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(local_invocation_id) local_id : vec3<u32>`:`@builtin(global_invocation_id) global_id : vec3<u32>,
                                             @builtin(local_invocation_id) local_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(num_workgroups) num_workgroups : vec3<u32>`,a=i?`let global_idx = global_id.x;
         let workgroup_index = workgroup_id.x;`:`let workgroup_index = workgroup_id.z * num_workgroups[0] * num_workgroups[1] +
             workgroup_id.y * num_workgroups[0] + workgroup_id.x;
         let global_idx = workgroup_index * ${n*r*o}u + local_idx;`;return`@compute @workgroup_size(${n}, ${r}, ${o})
  fn main(${s}) {
    ${a}
  `}appendVariableUniforms(t){t.rank!==0&&(t.shape.startsWith("uniforms.")&&this.uniforms.push({name:t.shape.replace("uniforms.",""),type:"u32",length:t.rank}),t.strides.startsWith("uniforms.")&&this.uniforms.push({name:t.strides.replace("uniforms.",""),type:"u32",length:t.rank}))}declareVariable(t,n){if(t.usage==="internal")throw new Error("cannot use internal variable with declareVariable(). use registerInternalVariables() instead.");this.variables.push(t),this.appendVariableUniforms(t);let r=t.usage==="input"?"read":"read_write",o=t.usage==="atomicOutput"?"atomic<i32>":t.type.storage;return`@group(0) @binding(${n}) var<storage, ${r}> ${t.name}: array<${o}>;`}declareVariables(...t){return t.map(n=>this.declareVariable(n,this.variableIndex++)).join(`
`)}registerInternalVariable(t){if(t.usage!=="internal")throw new Error("cannot use input or output variable with registerInternalVariable(). use declareVariables() instead.");this.internalVariables.push(t),this.appendVariableUniforms(t)}registerInternalVariables(...t){return t.forEach(n=>this.registerInternalVariable(n)),this}registerUniform(t,n,r=1){return this.uniforms.push({name:t,type:n,length:r}),this}registerUniforms(t){return this.uniforms=this.uniforms.concat(t),this}internalVariables=[];variables=[];uniforms=[];uniformDeclaration(){if(this.uniforms.length===0)return"";let t=[];for(let{name:n,type:r,length:o}of this.uniforms)if(o&&o>4)r==="f16"?t.push(`@align(16) ${n}:array<mat2x4<${r}>, ${Math.ceil(o/8)}>`):t.push(`${n}:array<vec4<${r}>, ${Math.ceil(o/4)}>`);else{let i=o==null||o===1?r:`vec${o}<${r}>`;t.push(`${n}:${i}`)}return`
      struct Uniforms { ${t.join(", ")} };
      @group(0) @binding(${this.variableIndex}) var<uniform> uniforms: Uniforms;`}variableIndex=0;get additionalImplementations(){return this.uniformDeclaration()+this.variables.map(t=>t.impl()).join(`
`)+this.internalVariables.map(t=>t.impl()).join(`
`)}get variablesInfo(){if(this.uniforms.length===0)return;let t=n=>[12,10,1,6][["u32","f16","f32","i32"].indexOf(n)];return this.uniforms.map(n=>[t(n.type),n.length??1])}},so=(e,t)=>new Cn(e,t)});var hd,ao,gd,yd,bd,_d,me,uo,lo,Me=E(()=>{H();j();ue();Q();hd=(e,t)=>{if(!e||e.length!==1)throw new Error("Transpose requires 1 input.");if(t.length!==0&&t.length!==e[0].dims.length)throw new Error(`perm size ${t.length} does not match input rank ${e[0].dims.length}`)},ao=(e,t)=>t.length!==0?t:[...new Array(e).keys()].reverse(),gd=(e,t)=>x.sortBasedOnPerm(e,ao(e.length,t)),yd=(e,t,n,r)=>{let o=`fn perm(i: ${r.type.indices}) -> ${n.type.indices} {
    var a: ${n.type.indices};`;for(let i=0;i<t;++i)o+=`a[${e[i]}]=i[${i}];`;return o+="return a;}"},bd=(e,t)=>{let n=[],r=[];for(let o=0;o<e.length;++o)e[o]!==1&&n.push(e[o]),e[t[o]]!==1&&r.push(t[o]);return{newShape:n,newPerm:r}},_d=(e,t)=>{let n=0;for(let r=0;r<e.length;++r)if(t[e[r]]!==1){if(e[r]<n)return!1;n=e[r]}return!0},me=(e,t)=>{let n=e.dataType,r=e.dims.length,o=ao(r,t),i=gd(e.dims,o),s=e.dims,a=i,u=r<2||_d(o,e.dims),d;if(u)return d=h=>{let b=T("input",n,s,4),g=A("output",n,a,4);return`
  ${h.registerUniform("output_size","u32").declareVariables(b,g)}
  ${h.mainStart()}
    ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    output[global_idx] = input[global_idx];
  }`},{name:"TransposeCopy",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let h=x.size(i);return{outputs:[{dims:i,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(h/64/4)},programUniforms:[{type:12,data:Math.ceil(h/4)}]}},getShaderSource:d};let{newShape:l,newPerm:c}=bd(e.dims,o),p=x.areEqual(c,[2,3,1]),f=x.areEqual(c,[3,1,2]);if(l.length===2||p||f){s=p?[l[0],l[1]*l[2]]:f?[l[0]*l[1],l[2]]:l,a=[s[1],s[0]];let h=16;return d=b=>{let g=T("a",n,s.length),y=A("output",n,a.length);return`
  ${b.registerUniform("output_size","u32").declareVariables(g,y)}
  var<workgroup> tile : array<array<${y.type.value}, ${h+1}>, ${h}>;
  ${b.mainStart([h,h,1])}
    let stride = (uniforms.output_shape[1] - 1) / ${h} + 1;
    let workgroup_id_x = workgroup_index % stride;
    let workgroup_id_y = workgroup_index / stride;
    let input_col = workgroup_id_y * ${h}u + local_id.x;
    let input_row = workgroup_id_x * ${h}u + local_id.y;
    if (input_row < uniforms.a_shape[0] && input_col < uniforms.a_shape[1]) {
      tile[local_id.y][local_id.x] = ${g.getByIndices(`${g.type.indices}(input_row, input_col)`)};
    }
    workgroupBarrier();

    let output_col = workgroup_id_x * ${h}u + local_id.x;
    let output_row = workgroup_id_y * ${h}u + local_id.y;
    if (output_row < uniforms.output_shape[0] && output_col < uniforms.output_shape[1]) {
      ${y.setByIndices(`${y.type.indices}(output_row, output_col)`,"tile[local_id.x][local_id.y]")}
    }
  }`},{name:"TransposeShared",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let b=x.size(i);return{outputs:[{dims:i,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(a[1]/h),y:Math.ceil(a[0]/h)},programUniforms:[{type:12,data:b},...z(s,a)]}},getShaderSource:d}}return d=h=>{let b=T("a",n,s.length),g=A("output",n,a.length);return`
  ${h.registerUniform("output_size","u32").declareVariables(b,g)}

  ${yd(o,r,b,g)}

  ${h.mainStart()}
    ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${g.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${g.setByOffset("global_idx",b.getByIndices("aIndices"))}
  }`},{name:"Transpose",shaderCache:{hint:`${t}`,inputDependencies:["rank"]},getRunData:()=>{let h=x.size(i);return{outputs:[{dims:i,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(h/64)},programUniforms:[{type:12,data:h},...z(s,a)]}},getShaderSource:d}},uo=(e,t)=>{hd(e.inputs,t.perm),e.compute(me(e.inputs[0],t.perm))},lo=e=>G({perm:e.perm})});var wd,$d,vd,xd,Sd,Td,Id,Cd,Ad,kd,Pe,co,po,mo,fo,ho,go,yo,bo,_o,wo,$o=E(()=>{H();j();Q();Rt();Me();wd={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate * candidate",logSumExp:"bestValue + exp(candidate)",l1:"bestValue + abs(candidate)",l2:"bestValue + candidate * candidate",logSum:"bestValue + candidate"},$d={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate",logSumExp:"bestValue + candidate",l1:"bestValue + candidate",l2:"bestValue + candidate",logSum:"bestValue + candidate"},vd={max:"_A[offset]",min:"_A[offset]",mean:"0",sum:"0",prod:"1",sumSquare:"0",logSumExp:"0",l1:"0",l2:"0",logSum:"0"},xd={max:"bestValue",min:"bestValue",sum:"bestValue",prod:"bestValue",sumSquare:"bestValue",logSumExp:"log(bestValue)",l1:"bestValue",l2:"sqrt(bestValue)",logSum:"log(bestValue)"},Sd=(e,t)=>{let n=[];for(let r=t-e;r<t;++r)n.push(r);return n},Td=(e,t)=>{let n=[],r=e.length;for(let i=0;i<r;i++)t.indexOf(i)===-1&&n.push(e[i]);let o=t.map(i=>e[i]);return[n,o]},Id=(e,t)=>{let n=e.length+t.length,r=[],o=0;for(let i=0;i<n;i++)t.indexOf(i)===-1?r.push(e[o++]):r.push(1);return r},Cd=(e,t)=>{for(let n=0;n<e.length;++n)if(e[e.length-n-1]!==t-1-n)return!1;return!0},Ad=(e,t)=>{let n=[];if(!Cd(e,t)){for(let r=0;r<t;++r)e.indexOf(r)===-1&&n.push(r);e.forEach(r=>n.push(r))}return n},kd=(e,t,n,r,o,i,s)=>{let a=n[0].dims,u=x.size(i),d=x.size(s),l=T("_A",n[0].dataType,a),c=A("output",o,i),p=64;u===1&&(p=256);let f=`
          var<workgroup> aBestValues : array<f32, ${p}>;
       `,m=h=>`
        ${h.registerUniform("reduceSize","u32").declareVariables(l,c)}
        ${f}
        fn DIV_CEIL(a : u32, b : u32) -> u32 {
          return ((a - 1u) / b + 1u);
         }
         ${h.mainStart(p)}

          let outputIndex = global_idx / ${p};
          let offset = outputIndex * uniforms.reduceSize;

          var bestValue = f32(${vd[r]});
          let Length = uniforms.reduceSize;
          for (var k = local_idx; k < Length; k = k + ${p}) {
           let candidate = f32(${l.getByOffset("offset + k")});
           bestValue = ${wd[r]};
          }
          aBestValues[local_idx] = bestValue;
          workgroupBarrier();

         var reduceSize = min(Length, ${p}u);
         for (var currentSize = reduceSize / 2u; reduceSize > 1u;
             currentSize = reduceSize / 2u) {
           let interval = DIV_CEIL(reduceSize, 2u);
           if (local_idx < currentSize) {
            let candidate = aBestValues[local_idx + interval];
            bestValue = ${$d[r]};
            aBestValues[local_idx] = bestValue;
           }
           reduceSize = interval;
           workgroupBarrier();
         }

         if (local_idx == 0u) {
          ${c.setByOffset("outputIndex",`${r==="mean"?`${c.type.storage}(bestValue / f32(uniforms.reduceSize))`:`${c.type.storage}(${xd[r]})`}`)};
         }
        }`;return{name:e,shaderCache:{hint:`${t};${p}`,inputDependencies:["type"]},getShaderSource:m,getRunData:()=>({outputs:[{dims:i,dataType:o}],dispatchGroup:{x:u},programUniforms:[{type:12,data:d}]})}},Pe=(e,t,n,r)=>{let o=e.inputs.length===1?n:En(e.inputs,n),i=o.axes;i.length===0&&!o.noopWithEmptyAxes&&(i=e.inputs[0].dims.map((f,m)=>m));let s=x.normalizeAxes(i,e.inputs[0].dims.length),a=s,u=e.inputs[0],d=Ad(a,e.inputs[0].dims.length);d.length>0&&(u=e.compute(me(e.inputs[0],d),{inputs:[0],outputs:[-1]})[0],a=Sd(a.length,u.dims.length));let[l,c]=Td(u.dims,a),p=l;o.keepDims&&(p=Id(l,s)),e.compute(kd(t,o.cacheKey,[u],r,e.inputs[0].dataType,p,c),{inputs:[u]})},co=(e,t)=>{Pe(e,"ReduceMeanShared",t,"mean")},po=(e,t)=>{Pe(e,"ReduceL1Shared",t,"l1")},mo=(e,t)=>{Pe(e,"ReduceL2Shared",t,"l2")},fo=(e,t)=>{Pe(e,"ReduceLogSumExpShared",t,"logSumExp")},ho=(e,t)=>{Pe(e,"ReduceMaxShared",t,"max")},go=(e,t)=>{Pe(e,"ReduceMinShared",t,"min")},yo=(e,t)=>{Pe(e,"ReduceProdShared",t,"prod")},bo=(e,t)=>{Pe(e,"ReduceSumShared",t,"sum")},_o=(e,t)=>{Pe(e,"ReduceSumSquareShared",t,"sumSquare")},wo=(e,t)=>{Pe(e,"ReduceLogSumShared",t,"logSum")}});var ze,Ed,Vt,En,De,Pd,zd,Dd,Bd,Od,Md,Ud,Rd,Vd,Ld,Be,vo,xo,So,To,Io,Co,Ao,ko,Eo,Po,Rt=E(()=>{H();j();ue();Q();$o();ze=e=>{if(!e||e.length===0||e.length>2)throw new Error("Reduce op requires 1 or 2 inputs.");if(e.length===2&&e[1].dims.length!==1)throw new Error("Invalid axes input dims.")},Ed=e=>["","",`var value = ${e.getByIndices("input_indices")};`,""],Vt=(e,t,n,r,o,i,s=!1,a=!1)=>{let u=[],d=n[0].dims,l=d.length,c=x.normalizeAxes(o,l),p=!a&&c.length===0;d.forEach((b,g)=>{p||c.indexOf(g)>=0?s&&u.push(1):u.push(b)});let f=u.length,m=x.size(u);return{name:e,shaderCache:t,getShaderSource:b=>{let g=[],y=T("_A",n[0].dataType,l),_=A("output",i,f),w=r(y,_,c),$=w[2];for(let v=0,I=0;v<l;v++)p||c.indexOf(v)>=0?(s&&I++,$=`for(var j${v}: u32 = 0; j${v} < ${d[v]}; j${v}++) {
                  ${w[2].includes("last_index")?`let last_index = j${v};`:""}
                  ${y.indicesSet("input_indices",v,`j${v}`)}
                  ${$}
                }`):(g.push(`${y.indicesSet("input_indices",v,_.indicesGet("output_indices",I))};`),I++);return`

        ${b.registerUniform("output_size","u32").declareVariables(y,_)}

        ${b.mainStart()}
          ${b.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          var input_indices: ${y.type.indices};
          let output_indices = ${_.offsetToIndices("global_idx")};

          ${g.join(`
`)}
          ${w[0]}       // init ops for reduce max/min
          ${w[1]}
          ${$}
          ${w[3]}
          ${w.length===4?_.setByOffset("global_idx","value"):w.slice(4).join(`
`)}
        }`},getRunData:()=>({outputs:[{dims:u,dataType:i}],dispatchGroup:{x:Math.ceil(m/64)},programUniforms:[{type:12,data:m},...z(d,u)]})}},En=(e,t)=>{let n=[];return e[1].dims[0]>0&&e[1].getBigInt64Array().forEach(r=>n.push(Number(r))),G({axes:n,keepDims:t.keepDims,noopWithEmptyAxes:t.noopWithEmptyAxes})},De=(e,t,n,r)=>{let o=e.inputs,i=o.length===1?n:En(o,n);e.compute(Vt(t,{hint:i.cacheKey,inputDependencies:["rank"]},[o[0]],i.noopWithEmptyAxes&&i.axes.length===0?Ed:r,i.axes,o[0].dataType,i.keepDims,i.noopWithEmptyAxes),{inputs:[0]})},Pd=(e,t)=>{ze(e.inputs),De(e,"ReduceLogSum",t,(r,o)=>[`var value = ${o.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,"value = log(value);"])},zd=(e,t)=>{ze(e.inputs),De(e,"ReduceL1",t,(r,o)=>[`var value = ${o.type.storage}(0);`,"",`value += abs(${r.getByIndices("input_indices")});`,""])},Dd=(e,t)=>{ze(e.inputs),De(e,"ReduceL2",t,(r,o)=>[`var t = ${o.type.value}(0); var value = ${o.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += (t * t);`,"value = sqrt(value);"])},Bd=(e,t)=>{ze(e.inputs),De(e,"ReduceLogSumExp",t,(r,o)=>[`var value = ${o.type.storage}(0);`,"",`value += exp(${r.getByIndices("input_indices")});`,"value = log(value);"])},Od=(e,t)=>{ze(e.inputs),De(e,"ReduceMax",t,(r,o,i)=>{let s=[];for(let a=0;a<r.rank;a++)(i.indexOf(a)>=0||i.length===0)&&s.push(r.indicesSet("input_indices",a,0));return[`${s.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = max(value, ${r.getByIndices("input_indices")});`,""]})},Md=(e,t)=>{ze(e.inputs),De(e,"ReduceMean",t,(r,o,i)=>{let s=1;for(let a=0;a<r.rank;a++)(i.indexOf(a)>=0||i.length===0)&&(s*=e.inputs[0].dims[a]);return["var sum = f32(0);","",`sum += f32(${r.getByIndices("input_indices")});`,`let value = ${o.type.value}(sum / ${s});`]})},Ud=(e,t)=>{ze(e.inputs),De(e,"ReduceMin",t,(r,o,i)=>{let s=[];for(let a=0;a<r.rank;a++)(i.indexOf(a)>=0||i.length===0)&&s.push(`input_indices[${a}] = 0;`);return[`${s.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = min(value, ${r.getByIndices("input_indices")});`,""]})},Rd=(e,t)=>{ze(e.inputs),De(e,"ReduceProd",t,(r,o)=>[`var value = ${o.type.storage}(1);`,"",`value *= ${r.getByIndices("input_indices")};`,""])},Vd=(e,t)=>{ze(e.inputs),De(e,"ReduceSum",t,(r,o)=>[`var value = ${o.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,""])},Ld=(e,t)=>{ze(e.inputs),De(e,"ReduceSumSquare",t,(r,o)=>[`var t = ${o.type.value}(0); var value = ${o.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += t * t;`,""])},Be=(e,t,n)=>{if(t.length===0)return n;let r=1,o=1;for(let i=0;i<t.length;i++)t.indexOf(i)===-1?r*=e[i]:o*=e[i];return o<32&&r>1024},vo=(e,t)=>{Be(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Md(e,t):co(e,t)},xo=(e,t)=>{Be(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?zd(e,t):po(e,t)},So=(e,t)=>{Be(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Dd(e,t):mo(e,t)},To=(e,t)=>{Be(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Bd(e,t):fo(e,t)},Io=(e,t)=>{Be(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Od(e,t):ho(e,t)},Co=(e,t)=>{Be(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Ud(e,t):go(e,t)},Ao=(e,t)=>{Be(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Rd(e,t):yo(e,t)},ko=(e,t)=>{Be(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Vd(e,t):bo(e,t)},Eo=(e,t)=>{Be(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Ld(e,t):_o(e,t)},Po=(e,t)=>{Be(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Pd(e,t):wo(e,t)}});var zo,Do,Bo,Pn,Oo=E(()=>{H();ue();Rt();zo=e=>{if(!e||e.length===0||e.length>2)throw new Error("ArgMinMaxOp op requires 1 or 2 inputs.");if(e[0].dataType!==1)throw new Error("Invalid input type.")},Do=(e,t)=>{zo(e.inputs);let n=(r,o,i)=>{let s=[];for(let a=0;a<r.rank;a++)(i.indexOf(a)>=0||i.length===0)&&s.push(`input_indices[${a}] = 0;`);return[`${s.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${r.getByIndices("input_indices")} ${t.selectLastIndex>0?"<=":"<"} value) {
         value = ${r.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",o.setByOffset("global_idx","best_index")]};e.compute(Vt("ArgMin",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],n,[t.axis],7,t.keepDims),{inputs:[0]})},Bo=(e,t)=>{zo(e.inputs);let n=(r,o,i)=>{let s=[];for(let a=0;a<r.rank;a++)(i.indexOf(a)>=0||i.length===0)&&s.push(`input_indices[${a}] = 0;`);return[`${s.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${r.getByIndices("input_indices")} ${t.selectLastIndex>0?">=":">"} value) {
         value = ${r.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",o.setByOffset("global_idx","best_index")]};e.compute(Vt("argMax",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],n,[t.axis],7,t.keepDims),{inputs:[0]})},Pn=e=>G(e)});var Nd,zn,Wd,Gd,Hd,it,qd,Mo,Lt=E(()=>{H();j();Ot();Q();Nd=(e,t)=>{let n=e[0],r=e[1],o=e[2],i=e[3],s=e[4],a=e[5];if(s&&a)throw new Error("Attention cannot have both past and attention_bias");if(n.dims.length!==3)throw new Error('Input "input" must have 3 dimensions');let u=n.dims[0],d=n.dims[1],l=n.dims[2];if(o.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimensions');if(r.dims.length!==2)throw new Error('Input "weights" is expected to have 2 dimensions');if(r.dims[0]!==l)throw new Error("Input 1 dimension 0 should have same length as dimension 2 of input 0");if(o.dims[0]!==r.dims[1])throw new Error('Input "bias" dimension 0 should have same length as dimension 1 of input "weights"');let c=o.dims[0]/3,p=c,f=p;if(t.qkvHiddenSizes.length>0){if(t.qkvHiddenSizes.length!==3)throw new Error("qkv_hidden_sizes attribute should have 3 elements");for(let _ of t.qkvHiddenSizes)if(_%t.numHeads!==0)throw new Error("qkv_hidden_sizes should be divisible by num_heads");c=t.qkvHiddenSizes[0],p=t.qkvHiddenSizes[1],f=t.qkvHiddenSizes[2]}let m=d;if(c!==p)throw new Error("qkv_hidden_sizes first element should be same as the second");if(o.dims[0]!==c+p+f)throw new Error('Input "bias" dimension 0 should have same length as sum of Q/K/V hidden sizes');let h=0;if(s){if(p!==f)throw new Error('Input "past" expect k_hidden_size == v_hidden_size');if(s.dims.length!==5)throw new Error('Input "past" must have 5 dimensions');if(s.dims[0]!==2)throw new Error('Input "past" first dimension must be 2');if(s.dims[1]!==u)throw new Error('Input "past" second dimension must be batch_size');if(s.dims[2]!==t.numHeads)throw new Error('Input "past" third dimension must be num_heads');if(s.dims[4]!==p/t.numHeads)throw new Error('Input "past" fifth dimension must be k_hidden_size / num_heads');t.pastPresentShareBuffer||(h=s.dims[3])}let b=m+h,g=-1,y=0;if(i)throw new Error("Mask not supported");if(s)throw new Error("past is not supported");if(a){if(a.dims.length!==4)throw new Error('Input "attention_bias" must have 4 dimensions');if(a.dims[0]!==u||a.dims[1]!==t.numHeads||a.dims[2]!==d||a.dims[3]!==b)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:u,sequenceLength:d,pastSequenceLength:h,kvSequenceLength:m,totalSequenceLength:b,maxSequenceLength:g,inputHiddenSize:l,hiddenSize:c,vHiddenSize:f,headSize:Math.floor(c/t.numHeads),vHeadSize:Math.floor(f/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:y,scale:t.scale,broadcastResPosBias:!1,passPastInKv:!1,qkvFormat:1}},zn=(e,t,n)=>t&&e?`
      let total_sequence_length_input = u32(${t.getByOffset("0")});
      let present_sequence_length = max(total_sequence_length_input, uniforms.past_sequence_length);
      let is_subsequent_prompt: bool = sequence_length > 1 && sequence_length != total_sequence_length_input;
      let is_first_prompt: bool = is_subsequent_prompt == false && sequence_length == total_sequence_length_input;
      total_sequence_length = u32(${e?.getByOffset("batchIdx")}) + 1;
      var past_sequence_length: u32 = 0;
      if (is_first_prompt == false) {
        past_sequence_length = total_sequence_length - sequence_length;
      }
       `:`
    ${n?"let past_sequence_length = uniforms.past_sequence_length":""};
    let present_sequence_length = total_sequence_length;
    `,Wd=(e,t,n,r,o,i,s,a)=>{let u=J(s?1:i),d=64,l=i/u;l<d&&(d=32);let c=Math.ceil(i/u/d),p=[{type:12,data:t},{type:12,data:n},{type:12,data:r},{type:12,data:o},{type:12,data:l},{type:12,data:c}],f=ne(e.dataType,u),m=de(1,u),h=["type"];s&&h.push("type"),a&&h.push("type");let b=g=>{let y=A("x",e.dataType,e.dims,u),_=[y],w=s?T("seq_lens",s.dataType,s.dims):void 0;w&&_.push(w);let $=a?T("total_sequence_length_input",a.dataType,a.dims):void 0;$&&_.push($);let v=de(e.dataType),I=[{name:"batch_size",type:"u32"},{name:"num_heads",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"sequence_length",type:"u32"},{name:"total_sequence_length",type:"u32"},{name:"elements_per_thread",type:"u32"}];return`
  var<workgroup> thread_max: array<f32, ${d}>;
  var<workgroup> thread_sum: array<f32, ${d}>;
  ${g.registerUniforms(I).declareVariables(..._)}
  ${g.mainStart([d,1,1])}
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let sequence_length = uniforms.sequence_length;
    var total_sequence_length = uniforms.total_sequence_length;
    ${zn(w,$,!1)}
    let local_offset = local_idx * uniforms.elements_per_thread;
    let offset = (global_idx / ${d}) * uniforms.total_sequence_length + local_offset;
    let seq_causal_length = ${s?"u32(past_sequence_length + workgroup_id.y + 1)":"total_sequence_length"};
    var thread_max_vector = ${m}(-3.4028234663852886e+38f);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      thread_max_vector = max(${m}(x[offset + i]), thread_max_vector);
    }
    thread_max[local_idx] = ${(()=>{switch(u){case 1:return"thread_max_vector";case 2:return"max(thread_max_vector.x, thread_max_vector.y)";case 4:return"max(max(thread_max_vector.x, thread_max_vector.y), max(thread_max_vector.z, thread_max_vector.w))";default:throw new Error(`Unsupported components: ${u}`)}})()};
    workgroupBarrier();

    var max_value =  f32(-3.4028234663852886e+38f);
    for (var i = 0u; i < ${d}; i++) {
      max_value = max(thread_max[i], max_value);
    }

    var sum_vector = ${m}(0);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      sum_vector += exp(${m}(x[offset + i]) - max_value);
    }
    thread_sum[local_idx] = ${(()=>{switch(u){case 1:return"sum_vector";case 2:return"sum_vector.x + sum_vector.y";case 4:return"sum_vector.x + sum_vector.y + sum_vector.z + sum_vector.w";default:throw new Error(`Unsupported components: ${u}`)}})()};
    workgroupBarrier();

    var sum: f32 = 0;
    for (var i = 0u; i < ${d}; i++) {
      sum += thread_sum[i];
    }

    if (sum == 0) {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        x[offset + i] = ${y.type.value}(${v}(1.0) / ${v}(seq_causal_length));
      }
    } else {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        var f32input = ${m}(x[offset + i]);
        x[offset + i] = ${y.type.value}(exp(f32input - max_value) / sum);
      }
    }
      ${s?`
        for (var total_seq_id: u32 = seq_causal_length; total_seq_id + local_offset < uniforms.total_sequence_length; total_seq_id++) {
          x[offset + total_seq_id] = ${y.type.value}(${v}(0));
        }`:""};
  }`};return{name:"AttentionProbsSoftmax",shaderCache:{hint:`${d};${f};${u}`,inputDependencies:h},getShaderSource:b,getRunData:()=>({outputs:[],dispatchGroup:{x:1,y:o,z:t*n},programUniforms:p})}},Gd=(e,t,n,r,o,i,s,a,u)=>{let d=s+i.kvSequenceLength,l=[i.batchSize,i.numHeads,i.sequenceLength,d],c=e>1&&r,p=i.kvNumHeads?i.kvNumHeads:i.numHeads,f=c?[i.batchSize,p,d,i.headSize]:void 0,m=i.nReps?i.nReps:1,h=i.scale===0?1/Math.sqrt(i.headSize):i.scale,b=J(i.headSize),g=i.headSize/b,y=12,_={x:Math.ceil(d/y),y:Math.ceil(i.sequenceLength/y),z:i.batchSize*i.numHeads},w=[{type:12,data:i.sequenceLength},{type:12,data:g},{type:12,data:d},{type:12,data:i.numHeads},{type:12,data:i.headSize},{type:1,data:h},{type:12,data:s},{type:12,data:i.kvSequenceLength},{type:12,data:m}],$=c&&r&&x.size(r.dims)>0,v=["type","type"];$&&v.push("type"),o&&v.push("type"),a&&v.push("type"),u&&v.push("type");let I=[{dims:l,dataType:t.dataType,gpuDataType:0}];c&&I.push({dims:f,dataType:t.dataType,gpuDataType:0});let S=C=>{let P=T("q",t.dataType,t.dims,b),R=T("key",n.dataType,n.dims,b),O=[P,R];if($){let K=T("past_key",r.dataType,r.dims,b);O.push(K)}o&&O.push(T("attention_bias",o.dataType,o.dims));let N=a?T("seq_lens",a.dataType,a.dims):void 0;N&&O.push(N);let q=u?T("total_sequence_length_input",u.dataType,u.dims):void 0;q&&O.push(q);let B=A("output",t.dataType,l),M=[B];c&&M.push(A("present_key",t.dataType,f,b));let W=de(1,b),L=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"alpha",type:"f32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${y}u;

  var<workgroup> tileQ: array<${P.type.storage}, ${y*y}>;
  var<workgroup> tileK: array<${P.type.storage}, ${y*y}>;
  ${C.registerUniforms(L).declareVariables(...O,...M)}
  ${C.mainStart([y,y,1])}
    // x holds the N and y holds the M
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let kvHeadIdx = ${m===1?"headIdx":"headIdx / uniforms.n_reps"};
    let kv_num_heads = ${m===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let m = workgroup_id.y * TILE_SIZE;
    let n = workgroup_id.x * TILE_SIZE;
    let sequence_length = uniforms.M;
    var total_sequence_length = uniforms.N;
    ${zn(N,q,!0)}
    let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx;
    let qOffset = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
    ${$&&c?"let pastKeyOffset = absKvHeadIdx * uniforms.past_sequence_length * uniforms.K;":""};
    let kOffset = absKvHeadIdx * uniforms.kv_sequence_length * uniforms.K;
    ${c?"let presentKeyOffset = absKvHeadIdx * uniforms.N * uniforms.K;":""}
    var value = ${W}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (global_id.y < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = q[qOffset + local_id.y * uniforms.K + w + local_id.x];
      }
      if (n + local_id.y < uniforms.N && w + local_id.x < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
      ${$&&c?`
              if (n + local_id.y < past_sequence_length) {
                tileK[idx] = past_key[pastKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
              } else if (n + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
                tileK[idx] = key[kOffset + (n + local_id.y - past_sequence_length) * uniforms.K + w + local_id.x];
              }`:`
          if (n + local_id.y < uniforms.kv_sequence_length) {
            tileK[idx] = key[kOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
          }`}
      ${c?`if (n + local_id.y < present_sequence_length) {
        present_key[presentKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x] = tileK[idx];
      }`:""}
      }
      workgroupBarrier();

      for (var k: u32 = 0u; k < TILE_SIZE && w+k < uniforms.K; k++) {
          value += ${W}(tileQ[TILE_SIZE * local_id.y + k] * tileK[TILE_SIZE * local_id.x + k]);
      }

      workgroupBarrier();
    }

    if (global_id.y < uniforms.M && global_id.x < total_sequence_length) {
      let headOffset = workgroup_id.z * uniforms.M * uniforms.N;
      let outputIdx = headOffset + global_id.y * uniforms.N + global_id.x;
      var sum: f32 = ${(()=>{switch(b){case 1:return"value";case 2:return"value.x + value.y";case 4:return"value.x + value.y + value.z + value.w";default:throw new Error(`Unsupported components: ${b}`)}})()};
        output[outputIdx] = ${B.type.value} (sum * uniforms.alpha) + ${o?"attention_bias[outputIdx]":"0.0"};
    }
  }`};return{name:"AttentionProbs",shaderCache:{hint:`${b};${o!==void 0};${r!==void 0};${e}`,inputDependencies:v},getRunData:()=>({outputs:I,dispatchGroup:_,programUniforms:w}),getShaderSource:S}},Hd=(e,t,n,r,o,i,s=void 0,a=void 0)=>{let u=i+o.kvSequenceLength,d=o.nReps?o.nReps:1,l=o.vHiddenSize*d,c=e>1&&r,p=o.kvNumHeads?o.kvNumHeads:o.numHeads,f=c?[o.batchSize,p,u,o.headSize]:void 0,m=[o.batchSize,o.sequenceLength,l],h=12,b={x:Math.ceil(o.vHeadSize/h),y:Math.ceil(o.sequenceLength/h),z:o.batchSize*o.numHeads},g=[{type:12,data:o.sequenceLength},{type:12,data:u},{type:12,data:o.vHeadSize},{type:12,data:o.numHeads},{type:12,data:o.headSize},{type:12,data:l},{type:12,data:i},{type:12,data:o.kvSequenceLength},{type:12,data:d}],y=c&&r&&x.size(r.dims)>0,_=["type","type"];y&&_.push("type"),s&&_.push("type"),a&&_.push("type");let w=[{dims:m,dataType:t.dataType,gpuDataType:0}];c&&w.push({dims:f,dataType:t.dataType,gpuDataType:0});let $=v=>{let I=T("probs",t.dataType,t.dims),S=T("v",n.dataType,n.dims),C=[I,S];y&&C.push(T("past_value",r.dataType,r.dims));let P=s?T("seq_lens",s.dataType,s.dims):void 0;s&&C.push(P);let R=a?T("total_sequence_length_input",a.dataType,a.dims):void 0;a&&C.push(R);let N=[A("output",t.dataType,m)];c&&N.push(A("present_value",t.dataType,f));let q=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"v_hidden_size",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${h}u;
  var<workgroup> tileQ: array<${I.type.value}, ${h*h}>;
  var<workgroup> tileV: array<${I.type.value}, ${h*h}>;
  ${v.registerUniforms(q).declareVariables(...C,...N)}
  ${v.mainStart([h,h,1])}
   let headIdx = workgroup_id.z % uniforms.num_heads;
   let batchIdx = workgroup_id.z / uniforms.num_heads;
   let kvHeadIdx = ${d===1?"headIdx":"headIdx / uniforms.n_reps"};
   let kv_num_heads = ${d===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
   let m = global_id.y;
   let n = global_id.x;
   let sequence_length = uniforms.M;
   var total_sequence_length = uniforms.K;
   ${zn(P,R,!0)}
   let offsetA = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
   let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx; // kvHeadIdx is relative to the batch
   ${y&&c?"let pastValueOffset = absKvHeadIdx * uniforms.N * uniforms.past_sequence_length + n;":""};
   let vOffset = absKvHeadIdx * uniforms.N * uniforms.kv_sequence_length + n;
   ${c?"let presentValueOffset = absKvHeadIdx * uniforms.N * uniforms.K + n;":""}
   var value = ${I.type.storage}(0);
   for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = probs[offsetA + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
        ${y&&c?`
        if (w + local_id.y < past_sequence_length) {
          tileV[idx] = past_value[pastValueOffset + (w + local_id.y) * uniforms.N];
        } else if (w + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
          tileV[idx] = v[vOffset + (w + local_id.y - past_sequence_length) * uniforms.N];
        }
      `:`
            if (w + local_id.y < uniforms.kv_sequence_length) {
              tileV[idx] = v[vOffset + (w + local_id.y) * uniforms.N];
            }`}
        ${c?`
            if (w + local_id.y < present_sequence_length) {
          present_value[presentValueOffset + (w + local_id.y) * uniforms.N] = tileV[idx];
        }`:""}
      }
     workgroupBarrier();
     for (var k: u32 = 0u; k < TILE_SIZE && w+k < total_sequence_length; k++) {
       value += tileQ[TILE_SIZE * local_id.y + k] * tileV[TILE_SIZE * k + local_id.x];
     }
     workgroupBarrier();
   }

   // we need to transpose output from BNSH_v to BSND_v
   if (m < uniforms.M && n < uniforms.N) {
     let outputIdx = batchIdx * uniforms.M * uniforms.v_hidden_size + m * uniforms.v_hidden_size
       + headIdx * uniforms.N + n;
     output[outputIdx] = value;
   }
  }`};return{name:"AttentionScore",shaderCache:{hint:`${r!==void 0};${e}`,inputDependencies:_},getRunData:()=>({outputs:w,dispatchGroup:b,programUniforms:g}),getShaderSource:$}},it=(e,t,n,r,o,i,s,a,u,d,l=void 0,c=void 0)=>{let p=Math.min(e.outputCount,1+(s?1:0)+(a?1:0)),f=p>1?s:void 0,m=p>1?a:void 0,h=p>1?d.pastSequenceLength:0,b=h+d.kvSequenceLength,g=u&&x.size(u.dims)>0?u:void 0,y=[t,n];f&&x.size(f.dims)>0&&y.push(f),g&&y.push(g),l&&y.push(l),c&&y.push(c);let _=e.compute(Gd(p,t,n,f,g,d,h,l,c),{inputs:y,outputs:p>1?[-1,1]:[-1]})[0];e.compute(Wd(_,d.batchSize,d.numHeads,h,d.sequenceLength,b,l,c),{inputs:l&&c?[_,l,c]:[_],outputs:[]});let w=[_,r];m&&x.size(m.dims)>0&&w.push(m),l&&w.push(l),c&&w.push(c),e.compute(Hd(p,_,r,m,d,h,l,c),{inputs:w,outputs:p>1?[0,2]:[0]})},qd=(e,t)=>{let n=[t.batchSize,t.numHeads,t.sequenceLength,t.headSize],r=t.sequenceLength,o=t.inputHiddenSize,i=t.headSize,s=12,a={x:Math.ceil(t.headSize/s),y:Math.ceil(t.sequenceLength/s),z:t.batchSize*t.numHeads},u=[e.inputs[0],e.inputs[1],e.inputs[2]],d=[{type:12,data:r},{type:12,data:o},{type:12,data:i},{type:12,data:t.numHeads},{type:12,data:t.headSize},{type:12,data:t.hiddenSize},{type:12,data:t.hiddenSize+t.hiddenSize+t.vHiddenSize}],l=c=>{let p=A("output_q",u[0].dataType,n),f=A("output_k",u[0].dataType,n),m=A("output_v",u[0].dataType,n),h=T("input",u[0].dataType,u[0].dims),b=T("weight",u[1].dataType,u[1].dims),g=T("bias",u[2].dataType,u[2].dims),y=h.type.storage,_=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"hidden_size",type:"u32"},{name:"ldb",type:"u32"}];return`
  const TILE_SIZE = ${s}u;
  var<workgroup> tileInput: array<${y}, ${s*s}>;
  var<workgroup> tileWeightQ: array<${y}, ${s*s}>;
  var<workgroup> tileWeightK: array<${y}, ${s*s}>;
  var<workgroup> tileWeightV: array<${y}, ${s*s}>;
  ${c.registerUniforms(_).declareVariables(h,b,g,p,f,m)}
  ${c.mainStart([s,s,1])}
    let batchIndex = workgroup_id.z / uniforms.num_heads;
    let headNumber = workgroup_id.z % uniforms.num_heads;
    let m = global_id.y;
    let n = global_id.x;

    let inputOffset = batchIndex * (uniforms.M * uniforms.K) + m * uniforms.K;
    let biasOffsetQ = headNumber * uniforms.head_size;
    let biasOffsetK = uniforms.hidden_size + biasOffsetQ;
    let biasOffsetV = uniforms.hidden_size + biasOffsetK;

    var valueQ = ${y}(0);
    var valueK = ${y}(0);
    var valueV = ${y}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileInput[TILE_SIZE * local_id.y + local_id.x] = input[inputOffset + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        let offset = n + (w + local_id.y) * uniforms.ldb;
        tileWeightQ[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetQ + offset];
        tileWeightK[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetK + offset];
        tileWeightV[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetV + offset];
      }
      workgroupBarrier();
      for (var k: u32 = 0u; k<TILE_SIZE && w+k < uniforms.K; k++) {
        let inputTileOffset = TILE_SIZE * local_id.y + k;
        let weightTileOffset = TILE_SIZE * k + local_id.x;
        valueQ += tileInput[inputTileOffset] * tileWeightQ[weightTileOffset];
        valueK += tileInput[inputTileOffset] * tileWeightK[weightTileOffset];
        valueV += tileInput[inputTileOffset] * tileWeightV[weightTileOffset];
      }

      workgroupBarrier();
    }

    let headOffset = (m * uniforms.N + n) % uniforms.head_size;
    valueQ += bias[headOffset + biasOffsetQ];
    valueK += bias[headOffset + biasOffsetK];
    valueV += bias[headOffset + biasOffsetV];

    let offset = workgroup_id.z * uniforms.M * uniforms.N;
    if (m < uniforms.M && n < uniforms.N) {
      let outputIdx = offset + m * uniforms.N + n;
      output_q[outputIdx] = valueQ;
      output_k[outputIdx] = valueK;
      output_v[outputIdx] = valueV;
    }
  }`};return e.compute({name:"AttentionPrepare",shaderCache:{inputDependencies:["type","type","type"]},getRunData:()=>({outputs:[{dims:n,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:n,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:n,dataType:e.inputs[0].dataType,gpuDataType:0}],dispatchGroup:a,programUniforms:d}),getShaderSource:l},{inputs:u,outputs:[-1,-1,-1]})},Mo=(e,t)=>{let n=Nd(e.inputs,t),[r,o,i]=qd(e,n);return it(e,r,o,i,e.inputs[4],void 0,void 0,void 0,e.inputs[5],n)}});var Fd,Kd,jd,Uo,Ro=E(()=>{$e();H();j();ue();Q();Fd=(e,t)=>{if(!e||e.length!==5)throw new Error("BatchNormalization requires 5 inputs");let n=(r,o,i)=>{let s=o.length;if(s!==r.length)throw new Error(`${i}: num dimensions != ${s}`);o.forEach((a,u)=>{if(a!==r[u])throw new Error(`${i}: dim[${u}] do not match`)})};if(e[0].dims.length>1){let r=t.format==="NHWC"?t.spatial?e[0].dims.slice(-1):e[0].dims.slice(-1).concat(e[0].dims.slice(1,e[0].dims.length-1)):e[0].dims.slice(1,t.spatial?2:void 0);n(e[1].dims,r,"Invalid input scale"),n(e[2].dims,r,"Invalid input B"),n(e[3].dims,r,"Invalid input mean"),n(e[4].dims,r,"Invalid input var")}else n(e[1].dims,[1],"Invalid input scale"),n(e[2].dims,[1],"Invalid input B"),n(e[3].dims,[1],"Invalid input mean"),n(e[4].dims,[1],"Invalid input var")},Kd=(e,t)=>{let{epsilon:n,spatial:r,format:o}=t,i=e[0].dims,s=r?J(i[i.length-1]):1,a=o==="NHWC"&&i.length>1?s:1,u=x.size(i)/s,d=r,l=d?i.length:i,c=T("x",e[0].dataType,e[0].dims,s),p=T("scale",e[1].dataType,e[1].dims,a),f=T("bias",e[2].dataType,e[2].dims,a),m=T("inputMean",e[3].dataType,e[3].dims,a),h=T("inputVar",e[4].dataType,e[4].dims,a),b=A("y",e[0].dataType,l,s),g=()=>{let _="";if(r)_=`let cOffset = ${i.length===1?"0u":o==="NHWC"?`outputIndices[${i.length-1}] / ${s}`:"outputIndices[1]"};`;else if(o==="NCHW")_=`
            ${b.indicesSet("outputIndices","0","0")}
            let cOffset = ${b.indicesToOffset("outputIndices")};`;else{_=`var cIndices = ${p.type.indices}(0);
                       cIndices[0] = outputIndices[${i.length-1}];`;for(let w=1;w<p.rank;w++)_+=`cIndices[${w}] = outputIndices[${w}];`;_+=`let cOffset = ${p.indicesToOffset("cIndices")};`}return _},y=_=>`
  const epsilon = ${n};
  ${_.registerUniform("outputSize","u32").declareVariables(c,p,f,m,h,b)}
  ${_.mainStart()}
  ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
    var outputIndices = ${b.offsetToIndices(`global_idx * ${s}`)};
    ${g()}
    let scale = ${p.getByOffset("cOffset")};
    let bias = ${f.getByOffset("cOffset")};
    let inputMean = ${m.getByOffset("cOffset")};
    let inputVar = ${h.getByOffset("cOffset")};
    let x = ${c.getByOffset("global_idx")};
    let value = (x - inputMean) * inverseSqrt(inputVar + epsilon) * scale + bias;
    ${b.setByOffset("global_idx","value")}
  }`;return{name:"BatchNormalization",shaderCache:{hint:`${t.epsilon}_${t.format}_${r}_${s}`,inputDependencies:d?["rank","type","type","type","type"]:void 0},getShaderSource:y,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:d?[{type:12,data:u},...z(i)]:[{type:12,data:u}]})}},jd=e=>G(e),Uo=(e,t)=>{let{inputs:n,outputCount:r}=e,o=jd({...t,outputCount:r});if(ie.webgpu.validateInputContent&&Fd(n,o),t.trainingMode)throw new Error("BatchNormalization trainingMode is not supported yet.");e.compute(Kd(n,o))}});var Zd,Qd,Vo,Lo=E(()=>{j();Q();Zd=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![320,640,1280].includes(e[0].dims[2]))throw new Error("number of channels should be 320, 640 or 1280");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},Qd=e=>{let t=e[0].dims,n=e[0].dims[2],r=x.size(t)/4,o=e[0].dataType,i=T("input",o,t,4),s=T("bias",o,[n],4),a=T("residual",o,t,4),u=A("output",o,t,4);return{name:"BiasAdd",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(r/64)}}),getShaderSource:l=>`
  const channels = ${n}u / 4;
  ${l.declareVariables(i,s,a,u)}

  ${l.mainStart()}
    ${l.guardAgainstOutOfBoundsWorkgroupSizes(r)}
    let value = ${i.getByOffset("global_idx")}
      + ${s.getByOffset("global_idx % channels")} + ${a.getByOffset("global_idx")};
    ${u.setByOffset("global_idx","value")}
  }`}},Vo=e=>{Zd(e.inputs),e.compute(Qd(e.inputs))}});var Xd,ee,No,Wo,Go,Ho,qo,Fo,Ko,jo,Zo,Yd,Qo,Xo,Yo,Jo,pt,ei,Nt,ti,ni,ri,oi,ii,si,ai,ui,di,li,ci,pi,mi,fi,hi,gi,yi,bi,_i,Dn,Bn,wi,$i,vi,Jd,el,xi,Wt=E(()=>{H();j();ue();Q();Xd=(e,t,n,r,o,i,s)=>{let a=Math.ceil(t/4),u="";typeof o=="string"?u=`${o}(a)`:u=o("a");let d=T("inputData",n,[a],4),l=A("outputData",r,[a],4),c=[{name:"vec_size",type:"u32"}];return s&&c.push(...s),`
      ${e.registerUniforms(c).declareVariables(d,l)}

  ${i??""}

  ${e.mainStart()}
    ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}

    let a = ${d.getByOffset("global_idx")};
    ${l.setByOffset("global_idx",u)}
  }`},ee=(e,t,n,r,o,i=e.dataType,s,a)=>{let u=[{type:12,data:Math.ceil(x.size(e.dims)/4)}];return s&&u.push(...s),{name:t,shaderCache:{hint:o,inputDependencies:["type"]},getShaderSource:d=>Xd(d,x.size(e.dims),e.dataType,i,n,r,a),getRunData:d=>({outputs:[{dims:e.dims,dataType:i}],dispatchGroup:{x:Math.ceil(x.size(d[0].dims)/64/4)},programUniforms:u})}},No=e=>{e.compute(ee(e.inputs[0],"Abs","abs"))},Wo=e=>{e.compute(ee(e.inputs[0],"Acos","acos"))},Go=e=>{e.compute(ee(e.inputs[0],"Acosh","acosh"))},Ho=e=>{e.compute(ee(e.inputs[0],"Asin","asin"))},qo=e=>{e.compute(ee(e.inputs[0],"Asinh","asinh"))},Fo=e=>{e.compute(ee(e.inputs[0],"Atan","atan"))},Ko=e=>{e.compute(ee(e.inputs[0],"Atanh","atanh"))},jo=e=>G(e),Zo=(e,t)=>{let n;switch(t.to){case 10:n="vec4<f16>";break;case 1:n="vec4<f32>";break;case 12:n="vec4<u32>";break;case 6:n="vec4<i32>";break;case 9:n="vec4<bool>";break;default:throw new RangeError(`not supported type (specified in attribute 'to' from 'Cast' operator): ${t.to}`)}e.compute(ee(e.inputs[0],"Cast",n,void 0,t.cacheKey,t.to))},Yd=e=>{let t,n,r=e.length>=2&&e[1].data!==0,o=e.length>=3&&e[2].data!==0;switch(e[0].dataType){case 1:t=r?e[1].getFloat32Array()[0]:-34028234663852886e22,n=o?e[2].getFloat32Array()[0]:34028234663852886e22;break;case 10:t=r?e[1].getUint16Array()[0]:64511,n=o?e[2].getUint16Array()[0]:31743;break;default:throw new Error("Unsupport data type")}return G({min:t,max:n})},Qo=(e,t)=>{let n=t||Yd(e.inputs),r=de(e.inputs[0].dataType);e.compute(ee(e.inputs[0],"Clip",o=>`clamp(${o}, vec4<${r}>(uniforms.min), vec4<${r}>(uniforms.max))`,void 0,n.cacheKey,void 0,[{type:e.inputs[0].dataType,data:n.min},{type:e.inputs[0].dataType,data:n.max}],[{name:"min",type:r},{name:"max",type:r}]),{inputs:[0]})},Xo=e=>{e.compute(ee(e.inputs[0],"Ceil","ceil"))},Yo=e=>{e.compute(ee(e.inputs[0],"Cos","cos"))},Jo=e=>{e.compute(ee(e.inputs[0],"Cosh","cosh"))},pt=e=>G(e),ei=(e,t)=>{let n=de(e.inputs[0].dataType);e.compute(ee(e.inputs[0],"Elu",r=>`elu_vf32(${r})`,`
  const elu_alpha_ = ${n}(${t.alpha});

  fn elu_f32(a: ${n}) -> ${n} {
  return select((exp(a) - 1.0) * elu_alpha_, a, a >= 0.0);
  }

  fn elu_vf32(v: vec4<${n}>) -> vec4<${n}> {
  return vec4(elu_f32(v.x), elu_f32(v.y), elu_f32(v.z), elu_f32(v.w));
  }`,t.cacheKey))},Nt=(e="f32")=>`
const r0: ${e} = 0.3275911;
const r1: ${e} = 0.254829592;
const r2: ${e} = -0.284496736;
const r3: ${e} = 1.421413741;
const r4: ${e} = -1.453152027;
const r5: ${e} = 1.061405429;

fn erf_vf32(v: vec4<${e}>) -> vec4<${e}> {
  let absv = abs(v);
  let x = 1.0 / (1.0 + r0 * absv);
  return sign(v) * (1.0 - ((((r5 * x + r4) * x + r3) * x + r2) * x + r1) * x * exp(-absv * absv));
}`,ti=e=>{let t=de(e.inputs[0].dataType);e.compute(ee(e.inputs[0],"Erf",n=>`erf_vf32(${n})`,Nt(t)))},ni=e=>{e.compute(ee(e.inputs[0],"Exp","exp"))},ri=e=>{e.compute(ee(e.inputs[0],"Floor","floor"))},oi=e=>{let t=de(e.inputs[0].dataType);e.compute(ee(e.inputs[0],"Gelu",n=>`0.5 * ${n} * (1.0 + erf_vf32(${n} * 0.7071067811865475))`,Nt(t)))},ii=(e,t)=>{let n=de(e.inputs[0].dataType);e.compute(ee(e.inputs[0],"LeakyRelu",r=>`select(leaky_relu_alpha_ * ${r}, ${r}, ${r} >= vec4<${n}>(0.0))`,`const leaky_relu_alpha_ = ${n}(${t.alpha});`,t.cacheKey))},si=e=>{e.compute(ee(e.inputs[0],"Not",t=>`!${t}`))},ai=e=>{e.compute(ee(e.inputs[0],"Neg",t=>`-${t}`))},ui=e=>{e.compute(ee(e.inputs[0],"Reciprocal",t=>`1.0/${t}`))},di=e=>{let t=de(e.inputs[0].dataType);e.compute(ee(e.inputs[0],"Relu",n=>`select(vec4<${t}>(0.0), ${n}, ${n} > vec4<${t}>(0.0))`))},li=e=>{e.compute(ee(e.inputs[0],"Sigmoid",t=>`(1.0 / (1.0 + exp(-${t})))`))},ci=e=>G(e),pi=(e,t)=>{let n=de(e.inputs[0].dataType);e.compute(ee(e.inputs[0],"HardSigmoid",r=>`max(vec4<${n}>(0.0), min(vec4<${n}>(1.0), ${t.alpha} * ${r} + vec4<${n}>(${t.beta})))`,void 0,t.cacheKey))},mi=e=>{let t=de(e.inputs[0].dataType);e.compute(ee(e.inputs[0],"HardSwish",n=>`${n} * max(vec4<${t}>(0.0), min(vec4<${t}>(1.0), vec4<${t}>(${t}(1.0 / 6.0)) * ${n} + vec4<${t}>(0.5)))`))},fi=e=>{e.compute(ee(e.inputs[0],"Sin","sin"))},hi=e=>{e.compute(ee(e.inputs[0],"Sinh","sinh"))},gi=e=>{e.compute(ee(e.inputs[0],"Sqrt","sqrt"))},yi=e=>{e.compute(ee(e.inputs[0],"Tan","tan"))},bi=e=>`sign(${e}) * (1 - exp(-2 * abs(${e}))) / (1 + exp(-2 * abs(${e})))`,_i=e=>{e.compute(ee(e.inputs[0],"Tanh",bi))},Dn=(e="f32")=>`
const fast_gelu_a: ${e} = 0.5;
const fast_gelu_b: ${e} = 0.7978845608028654;
const fast_gelu_c: ${e} = 0.035677408136300125;

fn tanh_v(v: vec4<${e}>) -> vec4<${e}> {
  return ${bi("v")};
}
`,Bn=e=>`(fast_gelu_a + fast_gelu_a * tanh_v(${e} * (fast_gelu_c * ${e} * ${e} + fast_gelu_b))) * ${e}`,wi=e=>{let t=de(e.inputs[0].dataType);e.compute(ee(e.inputs[0],"FastGelu",Bn,Dn(t),void 0,e.inputs[0].dataType))},$i=(e,t)=>{let n=de(e.inputs[0].dataType);return e.compute(ee(e.inputs[0],"ThresholdedRelu",r=>`select(vec4<${n}>(0.0), ${r}, ${r} > thresholded_relu_alpha_)`,`const thresholded_relu_alpha_ = vec4<${n}>(${t.alpha});`,t.cacheKey)),0},vi=e=>{e.compute(ee(e.inputs[0],"Log","log"))},Jd=(e,t)=>`
const alpha = vec4<${e}>(${t});
const one = ${e}(1.0);
const zero = ${e}(0.0);

fn quick_gelu_impl(x: vec4<${e}>) -> vec4<${e}> {
  let v = x *alpha;
  var x1 : vec4<${e}>;
  for (var i = 0; i < 4; i = i + 1) {
    if (v[i] >= zero) {
      x1[i] = one / (one + exp(-v[i]));
    } else {
      x1[i] = one - one / (one + exp(v[i]));
    }
  }
  return x * x1;
}
`,el=e=>`quick_gelu_impl(${e})`,xi=(e,t)=>{let n=de(e.inputs[0].dataType);e.compute(ee(e.inputs[0],"QuickGelu",el,Jd(n,t.alpha),t.cacheKey,e.inputs[0].dataType))}});var tl,nl,Ti,Ii=E(()=>{j();Q();Wt();tl=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![2560,5120,10240].includes(e[0].dims[2]))throw new Error("hidden state should be 2560, 5120 or 10240");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},nl=e=>{let t=e[0].dims.slice();t[2]=t[2]/2;let n=T("input",e[0].dataType,e[0].dims,4),r=T("bias",e[0].dataType,[e[0].dims[2]],4),o=A("output",e[0].dataType,t,4),i=x.size(t)/4,s=ne(e[0].dataType);return{name:"BiasSplitGelu",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(i/64)}}),getShaderSource:u=>`
  const M_SQRT2 = sqrt(2.0);
  const halfChannels = ${e[0].dims[2]/4/2}u;

  ${u.declareVariables(n,r,o)}

  ${Nt(s)}

  ${u.mainStart()}
    ${u.guardAgainstOutOfBoundsWorkgroupSizes(i)}
    let biasIdx = global_idx % halfChannels;
    let batchIndex = global_idx / halfChannels;
    let inputOffset = biasIdx + batchIndex * halfChannels * 2;
    let valueLeft = input[inputOffset] + bias[biasIdx];
    let valueRight = input[inputOffset + halfChannels] + bias[biasIdx + halfChannels];
    let geluRight = valueRight * 0.5 * (erf_vf32(valueRight / M_SQRT2) + 1);

    ${o.setByOffset("global_idx","valueLeft * geluRight")}
  }`}},Ti=e=>{tl(e.inputs),e.compute(nl(e.inputs))}});var rl,ol,Oe,Ci,Ai,ki,Ei,Pi,zi,Di,Bi,Oi,Mi,Ui=E(()=>{H();j();Q();rl=(e,t,n,r,o,i,s,a,u,d,l,c)=>{let p,f;typeof a=="string"?p=f=(y,_)=>`${a}((${y}),(${_}))`:typeof a=="function"?p=f=a:(p=a.scalar,f=a.vector);let m=A("outputData",l,r.length,4),h=T("aData",u,t.length,4),b=T("bData",d,n.length,4),g;if(o)if(i){let y=x.size(t)===1,_=x.size(n)===1,w=t.length>0&&t[t.length-1]%4===0,$=n.length>0&&n[n.length-1]%4===0;y||_?g=m.setByOffset("global_idx",f(y?`${h.type.value}(${h.getByOffset("0")}.x)`:h.getByOffset("global_idx"),_?`${b.type.value}(${b.getByOffset("0")}.x)`:b.getByOffset("global_idx"))):g=`
            let outputIndices = ${m.offsetToIndices("global_idx * 4u")};
            let offsetA = ${h.broadcastedIndicesToOffset("outputIndices",m)};
            let offsetB = ${b.broadcastedIndicesToOffset("outputIndices",m)};
            ${m.setByOffset("global_idx",f(s||w?h.getByOffset("offsetA / 4u"):`${h.type.value}(${h.getByOffset("offsetA / 4u")}[offsetA % 4u])`,s||$?b.getByOffset("offsetB / 4u"):`${b.type.value}(${b.getByOffset("offsetB / 4u")}[offsetB % 4u])`))}
          `}else g=m.setByOffset("global_idx",f(h.getByOffset("global_idx"),b.getByOffset("global_idx")));else{if(!i)throw new Error("no necessary to use scalar implementation for element-wise binary op implementation.");let y=(_,w,$="")=>{let v=`aData[indexA${w}][componentA${w}]`,I=`bData[indexB${w}][componentB${w}]`;return`
            let outputIndices${w} = ${m.offsetToIndices(`global_idx * 4u + ${w}u`)};
            let offsetA${w} = ${h.broadcastedIndicesToOffset(`outputIndices${w}`,m)};
            let offsetB${w} = ${b.broadcastedIndicesToOffset(`outputIndices${w}`,m)};
            let indexA${w} = offsetA${w} / 4u;
            let indexB${w} = offsetB${w} / 4u;
            let componentA${w} = offsetA${w} % 4u;
            let componentB${w} = offsetB${w} % 4u;
            ${_}[${w}] = ${$}(${p(v,I)});
          `};l===9?g=`
            var data = vec4<u32>(0);
            ${y("data",0,"u32")}
            ${y("data",1,"u32")}
            ${y("data",2,"u32")}
            ${y("data",3,"u32")}
            outputData[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:g=`
            ${y("outputData[global_idx]",0)}
            ${y("outputData[global_idx]",1)}
            ${y("outputData[global_idx]",2)}
            ${y("outputData[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(h,b,m)}

        ${c??""}

        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${g}
      }`},ol=(e,t,n,r,o,i,s=n.dataType)=>{let a=n.dims.map(Number),u=r.dims.map(Number),d=!x.areEqual(a,u),l=a,c=x.size(a),p=!1,f=!1,m=[d];if(d){let h=Ee.calcShape(a,u,!1);if(!h)throw new Error("Can't perform binary op on the given tensors");l=h.slice(),c=x.size(l);let b=x.size(a)===1,g=x.size(u)===1,y=a.length>0&&a[a.length-1]%4===0,_=u.length>0&&u[u.length-1]%4===0;m.push(b),m.push(g),m.push(y),m.push(_);let w=1;for(let $=1;$<l.length;$++){let v=a[a.length-$],I=u[u.length-$];if(v===I)w*=v;else break}w%4===0?(f=!0,p=!0):(b||g||y||_)&&(p=!0)}else p=!0;return m.push(p),{name:e,shaderCache:{hint:t+m.map(h=>h.toString()).join("_"),inputDependencies:["rank","rank"]},getShaderSource:h=>rl(h,a,u,l,p,d,f,o,n.dataType,r.dataType,s,i),getRunData:()=>({outputs:[{dims:l,dataType:s}],dispatchGroup:{x:Math.ceil(c/64/4)},programUniforms:[{type:12,data:Math.ceil(x.size(l)/4)},...z(a,u,l)]})}},Oe=(e,t,n,r,o,i)=>{e.compute(ol(t,o??"",e.inputs[0],e.inputs[1],n,r,i))},Ci=e=>{Oe(e,"Add",(t,n)=>`${t}+${n}`)},Ai=e=>{Oe(e,"Div",(t,n)=>`${t}/${n}`)},ki=e=>{Oe(e,"Equal",{scalar:(t,n)=>`u32(${t}==${n})`,vector:(t,n)=>`vec4<u32>(${t}==${n})`},void 0,void 0,9)},Ei=e=>{Oe(e,"Mul",(t,n)=>`${t}*${n}`)},Pi=e=>{let t=T("input",e.inputs[0].dataType,e.inputs[0].dims).type.value;Oe(e,"Pow",{scalar:(r,o)=>`pow_custom(${r},${o})`,vector:(r,o)=>`pow_vector_custom(${r},${o})`},`
    fn pow_custom(a : ${t}, b : ${t}) -> ${t} {
      if (b == ${t}(0.0)) {
        return ${t}(1.0);
      } else if (a < ${t}(0.0) && f32(b) != floor(f32(b))) {
        return ${t}(pow(f32(a), f32(b))); // NaN
      }
      return select(sign(a), ${t}(1.0), round(f32(abs(b) % ${t}(2.0))) != 1.0) * ${t}(${t==="i32"?"round":""}(pow(f32(abs(a)), f32(b))));
    }
    fn pow_vector_custom(a : vec4<${t}>, b : vec4<${t}>) -> vec4<${t}> {
      // TODO: implement vectorized pow
      return vec4<${t}>(pow_custom(a.x, b.x), pow_custom(a.y, b.y), pow_custom(a.z, b.z), pow_custom(a.w, b.w));
    }
      `)},zi=e=>{Oe(e,"Sub",(t,n)=>`${t}-${n}`)},Di=e=>{Oe(e,"Greater",{scalar:(t,n)=>`u32(${t}>${n})`,vector:(t,n)=>`vec4<u32>(${t}>${n})`},void 0,void 0,9)},Bi=e=>{Oe(e,"Less",{scalar:(t,n)=>`u32(${t}<${n})`,vector:(t,n)=>`vec4<u32>(${t}<${n})`},void 0,void 0,9)},Oi=e=>{Oe(e,"GreaterOrEqual",{scalar:(t,n)=>`u32(${t}>=${n})`,vector:(t,n)=>`vec4<u32>(${t}>=${n})`},void 0,void 0,9)},Mi=e=>{Oe(e,"LessOrEqual",{scalar:(t,n)=>`u32(${t}<=${n})`,vector:(t,n)=>`vec4<u32>(${t}<=${n})`},void 0,void 0,9)}});var sl,al,ul,dl,Ri,Vi,Li=E(()=>{H();j();ue();Q();sl=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");let n=0,r=e[n],o=r.dataType,i=r.dims.length;e.forEach((s,a)=>{if(a!==n){if(s.dataType!==o)throw new Error("input tensors should be one type");if(s.dims.length!==i)throw new Error("input tensors should have the same shape");s.dims.forEach((u,d)=>{if(d!==t&&u!==r.dims[d])throw new Error("non concat dimensions must match")})}})},al=(e,t)=>`
  fn calculateInputIndex(index: u32) -> u32 {
    let sizeInConcatAxis = array<u32, ${e}u>(${t});
    for (var i: u32 = 0u; i < ${e}; i += 1u ) {
      if (index < sizeInConcatAxis[i]) {
        return i;
      }
    }
    return ${e}u;
  }`,ul=(e,t)=>{let n=e.length,r=[];for(let o=0;o<n;++o){let i=t.setByOffset("global_idx",e[o].getByIndices("indices"));n===1?r.push(i):o===0?r.push(`if (inputIndex == ${o}u) { ${i} }`):o===n-1?r.push(`else { ${i} }`):r.push(`else if (inputIndex == ${o}) { ${i} }`)}return r.join(`
`)},dl=(e,t,n,r)=>{let o=x.size(n),i=new Array(e.length),s=new Array(e.length),a=0,u=[],d=[],l=[{type:12,data:o}];for(let h=0;h<e.length;++h)a+=e[h].dims[t],i[h]=a,d.push(e[h].dims.length),s[h]=T(`input${h}`,r,d[h]),u.push("rank"),l.push({type:12,data:i[h]});for(let h=0;h<e.length;++h)l.push(...z(e[h].dims));l.push(...z(n));let c=A("output",r,n.length),p=c.indicesGet("indices",t),f=Array.from(Array(i.length).keys()).map(h=>`uniforms.sizeInConcatAxis${h}`).join(","),m=h=>`

  ${(()=>{h.registerUniform("outputSize","u32");for(let b=0;b<e.length;b++)h.registerUniform(`sizeInConcatAxis${b}`,"u32");return h.declareVariables(...s,c)})()}

  ${al(i.length,f)}

  ${h.mainStart()}
    ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

    var indices = ${c.offsetToIndices("global_idx")};

    let inputIndex = calculateInputIndex(${p});
    if (inputIndex != 0u) {
      let sizeInConcatAxis = array<u32, ${i.length}u>(${f});
      ${p} -= sizeInConcatAxis[inputIndex - 1u];
    }

    ${ul(s,c)}
  }`;return{name:"Concat",shaderCache:{hint:`${t}`,inputDependencies:u},getRunData:()=>({outputs:[{dims:n,dataType:r}],dispatchGroup:{x:Math.ceil(o/64)},programUniforms:l}),getShaderSource:m}},Ri=(e,t)=>{let n=e.inputs,r=n[0].dims,o=x.normalizeAxis(t.axis,r.length);sl(n,o);let i=r.slice();i[o]=n.reduce((a,u)=>a+(u.dims.length>o?u.dims[o]:0),0);let s=n.filter(a=>x.size(a.dims)>0);e.compute(dl(s,o,i,n[0].dataType),{inputs:s})},Vi=e=>G({axis:e.axis})});function Ni(e,t,n,r){if(!globalThis.__dreamMatrixAvailable||n.format!=="NHWC"||n.group!==1||t[0].dataType!==10||!["","Relu"].includes(n.activation))return!1;let[o,i,s,a]=t[0].dims,[u,,d,l]=t[1].dims,c=r[1],p=r[2],f=o*c*p,m=d*l*a;if(a<320||a%8||u%32||c*p>768||d===1&&l===1&&f>=48)return!1;let h=f>=192?3:1,b=f>=192&&u%64===0?8:4,g=Math.ceil(f/(h*8))*h*8,y=g/(h*8)*u/(b*8),_=f>=192?1024:4096,w=Math.min(32,Math.max(1,2**Math.round(Math.log2(_/y)),2**Math.ceil(Math.log2(m/2048)))),$=Math.ceil(m/w/8)*8,v=(B,M,W,L,K,V=!1)=>e.compute({name:B,shaderCache:{hint:JSON.stringify([n,r,L,w,h,b])},getShaderSource:()=>M,getRunData:()=>({outputs:[{dims:L,dataType:10}],dispatchGroup:K})},{inputs:W,outputs:[V?-2:-1]})[0],I=v("DreamIm2Col",`
  @group(0) @binding(0)var<storage,read>x:array<f16>;@group(0) @binding(1)var<storage,read_write>a:array<f16>;
  @compute @workgroup_size(128)fn main(@builtin(global_invocation_id)g:vec3u){let i=g.x+g.y*8388480u;if(i>=${g*m}u){return;}let m=i/${m}u;let k=i%${m}u;let batch=m/${c*p}u;
   let iy=i32((m/${p}u)%${c}u)*${n.strides[0]}+i32(k/${l*a}u)*${n.dilations[0]}-${n.pads[0]};
   let ix=i32(m%${p}u)*${n.strides[1]}+i32((k/${a}u)%${l}u)*${n.dilations[1]}-${n.pads[1]};
   var v=0h;if(m<${f}u&&iy>=0&&iy<${i}&&ix>=0&&ix<${s}){v=x[((batch*${i}u+u32(iy))*${s}u+u32(ix))*${a}u+k%${a}u];}a[i]=v;
  }`,[t[0]],[g,m],{x:Math.min(65535,Math.ceil(g*m/128)),y:Math.ceil(g*m/8388480)}),S=e.kernelCustomData.dreamWeight;S||(S=v("DreamConvWeight",`
   @group(0) @binding(0)var<storage,read>w:array<f16>;@group(0) @binding(1)var<storage,read_write>b:array<f16>;
   @compute @workgroup_size(128)fn main(@builtin(global_invocation_id)g:vec3u){let i=g.x+g.y*8388480u;if(i>=${m*u}u){return;}let n=i%${u}u;let k=i/${u}u;b[i]=w[((n*${a}u+k%${a}u)*${d}u+k/${l*a}u)*${l}u+(k/${a}u)%${l}u];}
   `,[t[1]],[m,u],{x:Math.min(65535,Math.ceil(m*u/128)),y:Math.ceil(m*u/8388480)},n.wIsConst),n.wIsConst&&(e.kernelCustomData.dreamWeight=S));let C="",P="",R="",O="";for(let B=0;B<h;B++){P+=`let a${B}=subgroupMatrixLoad<subgroup_matrix_left<f16,8,8>>(&a,(g.y*${h*8}u+${B*8}u)*${m}u+k,false,${m}u);`;for(let M=0;M<b;M++)C+=`var c${B}_${M}=subgroup_matrix_result<f16,8,8>(0h);`,R+=`c${B}_${M}=subgroupMatrixMultiplyAccumulate(a${B},b${M},c${B}_${M});`,O+=`subgroupMatrixStore(&c,g.z*${g*u}u+(g.y*${h*8}u+${B*8}u)*${u}u+g.x*${b*8}u+${M*8}u,c${B}_${M},false,${u}u);`}for(let B=0;B<b;B++)P+=`let b${B}=subgroupMatrixLoad<subgroup_matrix_right<f16,8,8>>(&b,k*${u}u+g.x*${b*8}u+${B*8}u,false,${u}u);`;let N=v("DreamMatrixSplitConv",`enable chromium_experimental_subgroup_matrix;
  @group(0) @binding(0)var<storage,read>a:array<f16>;@group(0) @binding(1)var<storage,read>b:array<f16>;@group(0) @binding(2)var<storage,read_write>c:array<f16>;
  @compute @workgroup_size(32)fn main(@builtin(workgroup_id)g:vec3u){${C}for(var k=g.z*${$}u;k<min(${m}u,(g.z+1u)*${$}u);k+=8u){${P}${R}}${O}}
 `,[I,S],[w,g,u],{x:u/(b*8),y:g/(h*8),z:w}),q=t.length===3;return e.compute({name:"DreamConvReduction",shaderCache:{hint:JSON.stringify([r,w,q,n.activation])},getShaderSource:()=>`
  @group(0) @binding(0)var<storage,read>partials:array<f16>;
  ${q?"@group(0) @binding(1)var<storage,read>bias:array<f16>;":""}
  @group(0) @binding(${q?2:1})var<storage,read_write>out:array<f16>;
  @compute @workgroup_size(128)fn main(@builtin(global_invocation_id)g:vec3u){let i=g.x;if(i>=${f*u}u){return;}var sum=0.;for(var k=0u;k<${w}u;k++){sum+=f32(partials[k*${g*u}u+i]);}${q?`sum+=f32(bias[i%${u}u]);`:""}out[i]=f16(${n.activation==="Relu"?"max(sum,0.)":"sum"});}
 `,getRunData:()=>({outputs:[{dims:r,dataType:10}],dispatchGroup:{x:Math.ceil(f*u/128)}})},{inputs:q?[N,t[2]]:[N]}),!0}var Wi=E(()=>{});var Te,Ie,Ce,Gt,qe=E(()=>{H();j();Te=(e,t,n="f32")=>{switch(e.activation){case"Relu":return`value = max(value, ${t}(0.0));`;case"Sigmoid":return`value = (${t}(1.0) / (${t}(1.0) + exp(-value)));`;case"Clip":return`value = clamp(value, ${t}(${n}(uniforms.clip_min)), ${t}(${n}(uniforms.clip_max)));`;case"HardSigmoid":return`value = max(${t}(0.0), min(${t}(1.0), ${n}(uniforms.alpha) * value + ${n}(uniforms.beta)));`;case"LeakyRelu":return`value = select(${n}(uniforms.alpha) * value, value, value >= ${t}(0.0));`;case"Tanh":return`let e2x = exp(-2.0 * abs(value));
              value = sign(value) * (1.0 - e2x) / (1.0 + e2x);
        `;case"":return"";default:throw new Error(`Unsupported activation ${e.activation}`)}},Ie=(e,t)=>{e.activation==="Clip"?t.push({type:1,data:e.clipMax},{type:1,data:e.clipMin}):e.activation==="HardSigmoid"?t.push({type:1,data:e.alpha},{type:1,data:e.beta}):e.activation==="LeakyRelu"&&t.push({type:1,data:e.alpha})},Ce=(e,t)=>{e.activation==="Clip"?t.push({name:"clip_max",type:"f32"},{name:"clip_min",type:"f32"}):e.activation==="HardSigmoid"?t.push({name:"alpha",type:"f32"},{name:"beta",type:"f32"}):e.activation==="LeakyRelu"&&t.push({name:"alpha",type:"f32"})},Gt=e=>{let t=e?.activation||"";if(t==="HardSigmoid"){let[n,r]=e?.activation_params||[.2,.5];return{activation:t,alpha:n,beta:r}}else if(t==="Clip"){let[n,r]=e?.activation_params||[qr,Fr];return{activation:t,clipMax:r,clipMin:n}}else if(t==="LeakyRelu"){let[n]=e?.activation_params||[.01];return{activation:t,alpha:n}}return{activation:t}}});var ce,Gi,Ht=E(()=>{ce=(e,t)=>{switch(e){case 1:return t;case 2:return`vec2<${t}>`;case 3:return`vec3<${t}>`;case 4:return`vec4<${t}>`;default:throw new Error(`${e}-component is not supported.`)}},Gi=e=>`
      ${e?"value = value + getBiasByOutputCoords(coords);":""}
      `});var Hi,qi=E(()=>{Hi=e=>`
fn getIndexFromCoords4D(coords : vec4<i32>, shape : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
      shape.y * shape.z * shape.w, shape.z * shape.w, shape.w, 1));
}
fn getOutputIndexFromCoords(coords : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
    i32(${e}.x), i32(${e}.y), i32(${e}.z), 1));
}
`});var mt,qt,Ft=E(()=>{H();j();Q();qe();mt=(e,t,n,r,o)=>{let i=r-n;return`
      ${Array.from({length:n}).map((s,a)=>`
      if (${U(t.shape,a,t.rank)} != 1) {
        ${t.indicesSet(e,a,U(o,a+i,r))}
      } else {
        ${t.indicesSet(e,a,0)}
      }`).join("")}
`},qt=(e,t,n,r,o=!1,i)=>{let s=e[0].dims,a=e[1].dims,u=s[s.length-2],d=a[a.length-1],l=s[s.length-1],c=J(d),p=J(l),f=J(u),m=x.size(n)/c/f,h=e.length>2,b=r?r.slice(0,-2):n.slice(0,-2),y=[x.size(b),u,d],_=[{type:12,data:m},{type:12,data:u},{type:12,data:d},{type:12,data:l}];Ie(t,_),_.push(...z(b,s,a)),h&&_.push(...z(e[2].dims)),_.push(...z(y));let w=$=>{let v=Ut("batch_dims",e[0].dataType,b.length),I=T("a",e[0].dataType,s.length,p),S=T("b",e[1].dataType,a.length,c),C=A("output",e[0].dataType,y.length,c),P=ne(C.type.tensor),R=Te(t,C.type.value,P),O=[I,S],N="";if(h){let M=o?c:1;O.push(T("bias",e[2].dataType,e[2].dims.length,M)),N=`${o?`value += bias[col / ${M}];`:`value += ${C.type.value}(bias[row + i]);`}`}let q=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"}];Ce(t,q);let B=()=>{let M=`var a_data: ${I.type.value};`;for(let W=0;W<p;W++)M+=`
              let b_data${W} = b[(b_offset + (k + ${W}) * uniforms.N + col) / ${c}];`;for(let W=0;W<f;W++){M+=`a_data = a[(a_offset + (row + ${W}) * uniforms.K + k) / ${p}];`;for(let L=0;L<p;L++)M+=`
            values[${W}] = fma(${S.type.value}(a_data${p===1?"":`[${L}]`}), b_data${L}, values[${W}]);
`}return M};return`
  ${$.registerUniforms(q).registerInternalVariables(v).declareVariables(...O,C)}
  ${$.mainStart()}
    ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let col = (global_idx % (uniforms.N / ${c})) * ${c};
    var index1 = global_idx / (uniforms.N / ${c});
    let stride1 = uniforms.M / ${f};
    let row = (index1 % stride1) * ${f};
    let batch = index1 / stride1;

    ${n.length===2?"":`let batch_indices = ${v.offsetToIndices("batch")};`}

    var a_indices: ${I.type.indices};
    ${mt("a_indices",I,I.rank-2,v.rank,"batch_indices")}
    ${I.indicesSet("a_indices",I.rank-2,0)}
    ${I.indicesSet("a_indices",I.rank-1,0)}
    let a_offset = ${I.indicesToOffset("a_indices")};

    var b_indices: ${S.type.indices};
    ${mt("b_indices",S,S.rank-2,v.rank,"batch_indices")}
    ${S.indicesSet("b_indices",S.rank-2,0)}
    ${S.indicesSet("b_indices",S.rank-1,0)}
    let b_offset = ${S.indicesToOffset("b_indices")};
    var values: array<${C.type.value}, ${f}>;
    for (var k: u32 = 0u; k < uniforms.K; k = k + ${p}) {
      ${B()}
    }
    for (var i = 0u; i < ${f}u; i++) {
      var value = values[i];
      ${N}
      ${R}
      let cur_indices = ${C.type.indices}(batch, row + i, col);
      let offset = ${C.indicesToOffset("cur_indices")};
      ${C.setByOffset(`offset / ${c}`,"value")};
    }
  }
  `};return{name:"MatMulNaive",shaderCache:{hint:`${t.activation};${c};${p};${f};${o}`,inputDependencies:h?["rank","rank","rank"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:i?i(n):n,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(m/64)},programUniforms:_}),getShaderSource:w}}});var ll,cl,On,Fi,pl,Mn,ml,ft,Kt=E(()=>{H();j();Q();qe();Ft();Ht();ll=(e,t)=>e?`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          kStart + inputRow,
          globalRowStart / innerElementSize + inputCol${t?", batchIndices":""});
        `:`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          globalRow + innerRow,
          kStart / innerElementSize + inputCol${t?", batchIndices":""});
        `,cl=(e,t)=>e?`
        let ACached0 = mm_Asub[k * innerElementSize][localRow];
        let ACached1 = mm_Asub[k * innerElementSize + 1][localRow];
        let ACached2 = mm_Asub[k * innerElementSize + 2][localRow];
        ${t===3?"":"let ACached3 = mm_Asub[k * innerElementSize + 3][localRow];"}
        for (var i = 0; i < rowPerThread; i = i + 1) {
          acc[i] = BCached0 * ACached0[i] + acc[i];
          acc[i] = BCached1 * ACached1[i] + acc[i];
          acc[i] = BCached2 * ACached2[i] + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached3[i] + acc[i];"}
        }`:`
        for (var i = 0; i < rowPerThread; i = i + 1) {
          let ACached = mm_Asub[tileRow + i][k];
          acc[i] = BCached0 * ACached.x + acc[i];
          acc[i] = BCached1 * ACached.y + acc[i];
          acc[i] = BCached2 * ACached.z + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached.w + acc[i];"}
        }`,On=(e,t,n="f32",r,o=!1,i=32,s=!1,a=32)=>{let u=t[1]*e[1],d=t[0]*e[0],l=o?u:i,c=o?i:u,p=l/t[0],f=i/t[1];if(!((o&&p===4&&e[1]===4||!o&&(p===3||p===4))&&l%t[0]===0&&i%t[1]===0&&e[0]===4))throw new Error(`If transposeA ${o} is true, innerElementSize ${p} and workPerThread[1] ${e[1]} must be 4.
      Otherwise, innerElementSize ${p} must be 3 or 4.
  tileAWidth ${l} must be divisible by workgroupSize[0]${t[0]}. tileInner ${i} must be divisible by workgroupSize[1] ${t[1]}. colPerThread ${e[0]} must be 4.`);return`
var<workgroup> mm_Asub: array<array<vec${p}<${n}>, ${l/p}>, ${c}>;
var<workgroup> mm_Bsub: array<array<vec4<${n}>, ${d/e[0]}>, ${i}>;

const rowPerThread = ${e[1]};
const colPerThread = ${e[0]};
const innerElementSize = ${p};
const tileInner = ${i};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
  let localRow = i32(localId.y);
  let tileRow = localRow * rowPerThread;
  let tileCol = i32(localId.x);

  let globalRow =i32(globalId.y) * rowPerThread;
  let globalCol = i32(globalId.x);
  let batch = ${s?"0":"i32(globalId.z)"};
  ${r?`let batchIndices = ${r.offsetToIndices("u32(batch)")};`:""}
  let globalRowStart = i32(workgroupId.y) * ${u};

  let num_tiles = ${s?`${Math.ceil(a/i)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
  var kStart = ${s?`i32(globalId.z) * ${a}`:"0"};

  var acc: array<vec4<${n}>, rowPerThread>;

  // Loop over shared dimension.
  let tileRowB = localRow * ${f};
  for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let inputRow = tileRow + innerRow;
          let inputCol = tileCol;
          ${ll(o,r)}
      }

      // Load one tile of B into local memory.
      for (var innerRow = 0; innerRow < ${f}; innerRow = innerRow + 1) {
          let inputRow = tileRowB + innerRow;
          let inputCol = tileCol;
          mm_Bsub[inputRow][inputCol] = mm_readB(batch, kStart + inputRow, globalCol${r?", batchIndices":""});
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      for (var k = 0; k < tileInner / innerElementSize; k = k + 1) {
          let BCached0 = mm_Bsub[k * innerElementSize][tileCol];
          let BCached1 = mm_Bsub[k * innerElementSize + 1][tileCol];
          let BCached2 = mm_Bsub[k * innerElementSize + 2][tileCol];
          ${p===3?"":"let BCached3 = mm_Bsub[k * innerElementSize + 3][tileCol];"}

          ${cl(o,p)}
      }

      workgroupBarrier();
  }

  for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      mm_write(batch, globalRow + innerRow, globalCol, acc[innerRow]);
  }
}`},Fi=(e,t)=>e?`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              kStart + inputRow,
              globalRowStart + inputCol${t?", batchIndices":""});
            `:`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              globalRowStart + inputRow,
              kStart + inputCol${t?", batchIndices":""});
            `,pl=e=>e?"let ACached = mm_Asub[k][tileRow + innerRow];":"let ACached = mm_Asub[tileRow + innerRow][k];",Mn=(e,t,n="f32",r,o=!1,i=32,s=!1,a=32,u=!1)=>{let d=e[1]*t[1],l=e[0]*t[0],c=o?d:i,p=o?i:d;if(!(p%t[1]===0&&c%t[0]===0&&i%t[1]===0))throw new Error(`tileAHight ${p} must be divisible by workgroupSize[1]${t[1]}, tileAWidth ${c} must be divisible by workgroupSize[0]${t[0]}, tileInner ${i} must be divisible by workgroupSize[1]${t[1]}`);let f=p/t[1],m=c/t[0],h=i/t[1],b=u?`
    let localRow = i32(localId.y);
    let localCol = i32(localId.x);
    let globalRowStart = i32(workgroupId.y) * ${d};
    let globalColStart = i32(workgroupId.x) * ${l};

    // Loop over shared dimension.
    for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var inputRow = localRow; inputRow < ${p}; inputRow = inputRow + ${t[1]}) {
        for (var inputCol = localCol; inputCol < ${c}; inputCol = inputCol + ${t[0]}) {
          ${Fi(o,r)}
        }
      }
      // Load one tile of B into local memory.
      for (var inputRow = localRow; inputRow < ${i}; inputRow = inputRow + ${t[1]}) {
            for (var inputCol = localCol; inputCol < ${l}; inputCol = inputCol + ${t[0]}) {
          mm_Bsub[inputRow][inputCol] = mm_readB(batch,
            kStart + inputRow,
            globalColStart + inputCol${r?", batchIndices":""});
        }
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      var BCached : array<${n}, colPerThread>;
      for (var k = 0; k < tileInner; k = k + 1) {
        for (var inner = 0; inner < colPerThread; inner = inner + 1) {
          BCached[inner] = mm_Bsub[k][localCol + inner * ${t[0]}];
        }
        for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let ACached = ${o?`mm_Asub[k][localRow + innerRow * ${t[1]}];`:`mm_Asub[localRow + innerRow * ${t[1]}][k];`}
          for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
            acc[innerRow][innerCol] = acc[innerRow][innerCol] +
                ACached * BCached[innerCol];
          }
        }
      }
      workgroupBarrier();
    }
    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      let gRow = globalRowStart + localRow + innerRow * ${t[1]};
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        let gCol = globalColStart + localCol + innerCol * ${t[0]};
        mm_write(batch, gRow, gCol, acc[innerRow][innerCol]);
      }
    }
    `:`
let tileRow = i32(localId.y) * rowPerThread;
let tileCol = i32(localId.x) * colPerThread;

let globalRow = i32(globalId.y) * rowPerThread;
let globalCol = i32(globalId.x) * colPerThread;
let globalRowStart = i32(workgroupId.y) * ${d};

let tileRowA = i32(localId.y) * ${f};
let tileColA = i32(localId.x) * ${m};
let tileRowB = i32(localId.y) * ${h};
// Loop over shared dimension.
for (var t = 0; t < num_tiles; t = t + 1) {
  // Load one tile of A into local memory.
  for (var innerRow = 0; innerRow < ${f}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < ${m}; innerCol = innerCol + 1) {
      let inputRow = tileRowA + innerRow;
      let inputCol = tileColA + innerCol;
      ${Fi(o,r)}
    }
  }

  // Load one tile of B into local memory.
  for (var innerRow = 0; innerRow < ${h}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
      let inputRow = tileRowB + innerRow;
      let inputCol = tileCol + innerCol;
      mm_Bsub[inputRow][inputCol] = mm_readB(batch,
        kStart + inputRow,
        globalCol + innerCol${r?", batchIndices":""});
    }
  }
  kStart = kStart + tileInner;
  workgroupBarrier();

  // Compute acc values for a single thread.
  var BCached : array<${n}, colPerThread>;
  for (var k = 0; k < tileInner; k = k + 1) {
    for (var inner = 0; inner < colPerThread; inner = inner + 1) {
      BCached[inner] = mm_Bsub[k][tileCol + inner];
    }

    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      ${pl(o)}
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        acc[innerRow][innerCol] = acc[innerRow][innerCol] + ACached * BCached[innerCol];
      }
    }
  }

  workgroupBarrier();
}

for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
  for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
    mm_write(batch, globalRow + innerRow, globalCol + innerCol,
        acc[innerRow][innerCol]);
  }
}
`;return`
  var<workgroup> mm_Asub : array<array<${n}, ${c}>, ${p}>;
  var<workgroup> mm_Bsub : array<array<${n}, ${l}>, ${i}>;
  const rowPerThread = ${e[1]};
  const colPerThread = ${e[0]};
  const tileInner = ${i};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
    let batch = ${s?"0":"i32(globalId.z)"};
    ${r?`let batchIndices = ${r.offsetToIndices("u32(batch)")};`:""}
    let num_tiles = ${s?`${Math.ceil(a/i)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
    var kStart = ${s?`i32(globalId.z) * ${a}`:"0"};

    var acc : array<array<${n}, colPerThread>, rowPerThread>;
    ${b}
  }
`},ml=(e,t,n,r,o=!1)=>{let[i,s,a,u]=r,d=ne(r[0].type.tensor);return`
    fn mm_readA(batch: i32, row: i32, colIn: i32, batchIndices: ${i.type.indices}) -> ${ce(e,d)} {
      var value = ${ce(e,d)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_a_outer && col < uniforms.dim_inner)
      {
        var aIndices: ${s.type.indices};
        ${mt("aIndices",s,s.rank-2,i.rank,"batchIndices")}
        ${s.indicesSet("aIndices",s.rank-2,"u32(row)")}
        ${s.indicesSet("aIndices",s.rank-1,"u32(colIn)")}
        value = ${s.getByIndices("aIndices")};
      }
      return value;
    }

    fn mm_readB(batch: i32, row: i32, colIn: i32, batchIndices: ${i.type.indices}) -> ${ce(e,d)} {
      var value = ${ce(e,d)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_inner && col < uniforms.dim_b_outer)
      {
        var bIndices: ${a.type.indices};
        ${mt("bIndices",a,a.rank-2,i.rank,"batchIndices")}
        ${a.indicesSet("bIndices",a.rank-2,"u32(row)")}
        ${a.indicesSet("bIndices",a.rank-1,"u32(colIn)")}
        value = ${a.getByIndices("bIndices")};
      }
      return value;
    }

    fn mm_write(batch: i32, row: i32, colIn: i32, valueIn: ${ce(e,d)}) {
      let col = colIn * ${e};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer) {
        var value = valueIn;
        let coords = vec3<i32>(batch, row, colIn);
        ${t?`value = value + ${o?"bias[colIn]":`${ce(e,d)}(bias[row])`};`:""}
        ${n}
        ${u.setByIndices("vec3<u32>(coords)","value")}
      }
    }
    `},ft=(e,t,n,r,o=!1,i)=>{let s=e[0].dims,a=e[1].dims,u=s.slice(0,-2),d=a.slice(0,-2),l=r?r.slice(0,-2):n.slice(0,-2),c=x.size(l),p=s[s.length-2],f=s[s.length-1],m=a[a.length-1],h=f%4===0&&m%4===0,b=p<=8?[4,1,1]:[4,4,1],g=[8,8,1],y=[Math.ceil(m/g[0]/b[0]),Math.ceil(p/g[1]/b[1]),Math.ceil(c/g[2]/b[2])],_=h?4:1,w=[...u,p,f/_],$=w.length,v=[...d,f,m/_],I=v.length,S=[c,p,m/_],C=[{type:6,data:p},{type:6,data:m},{type:6,data:f}];Ie(t,C),C.push(...z(l,w,v));let P=["rank","rank"],R=e.length>2;R&&(C.push(...z(e[2].dims)),P.push("rank")),C.push(...z(S));let O=N=>{let q=l.length,B=Ut("batchDims",e[0].dataType,q,1),M=ne(e[0].dataType),W=T("a",e[0].dataType,$,_),L=T("b",e[1].dataType,I,_),K=A("result",e[0].dataType,S.length,_),V=[W,L];if(R){let D=o?_:1;V.push(T("bias",e[2].dataType,e[2].dims.length,D))}let F=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"}];Ce(t,F);let _e=ne(K.type.tensor),se=Te(t,K.type.value,_e),k=ml(_,R,se,[B,W,L,K],o);return`
  ${N.registerUniforms(F).registerInternalVariables(B).declareVariables(...V,K)}
  ${k}
  ${h?On(b,g,M,B):Mn(b,g,M,B)}
                   `};return{name:"MatMul",shaderCache:{hint:`${b};${t.activation};${h};${o}`,inputDependencies:P},getRunData:()=>({outputs:[{dims:i?i(n):n,dataType:e[0].dataType}],dispatchGroup:{x:y[0],y:y[1],z:y[2]},programUniforms:C}),getShaderSource:O}}});var fl,Ki,ji=E(()=>{H();ke();Q();qe();Ht();qi();Kt();fl=(e,t,n,r,o=!1,i,s=4,a=4,u=4,d="f32")=>{let l=P=>{switch(P){case 1:return"resData = x[xIndex];";case 3:return`resData = vec3<${d}>(x[xIndex], x[xIndex + 1], x[xIndex + 2]);`;case 4:return"resData = x[xIndex / 4];";default:throw new Error(`innerElementSize ${P} is not supported.`)}},c=P=>{switch(P){case 1:return"return w[row * i32(uniforms.w_shape[3]) + colIn];";case 4:return"return w[row * i32(uniforms.w_shape[3]) / 4 + colIn];";default:throw new Error(`innerElementSize ${P} is not supported.`)}},p=e?`
    let coord = vec4<i32>(batch, xRow, xCol, xCh);
    `:`
    let coord = vec4<i32>(batch, xCh, xRow, xCol);
    `,f=e?`
    let coords = vec4<i32>(
      batch,
      row / outWidth,
      row % outWidth,
      col);
    `:`
    let coords = vec4<i32>(
      batch,
      row,
      col / outWidth,
      col % outWidth);
    `,m=e?"i32(uniforms.x_shape[1])":"i32(uniforms.x_shape[2])",h=e?"i32(uniforms.x_shape[2])":"i32(uniforms.x_shape[3])",b=e?"row":"col",g=e?"col":"row",y=`
    let inChannels = i32(uniforms.w_shape[2]);
    let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
    let outRow = ${b} / outWidth;
    let outCol = ${b} % outWidth;

    let WRow = ${g} / (i32(uniforms.w_shape[1]) * inChannels);
    let WCol = ${g} / inChannels % i32(uniforms.w_shape[1]);
    let xRow = outRow * uniforms.stride[0] + uniforms.dilation[0] * WRow - uniforms.pad[0];
    let xCol = outCol * uniforms.stride[1] + uniforms.dilation[1] * WCol - uniforms.pad[1];
    let xCh = ${g} % inChannels;
    var resData = ${ce(s,d)}(0.0);
    // The bounds checking is always needed since we use it to pad zero for
    // the 'same' padding type.
    if (xRow >= 0 && xRow < ${m} && xCol >= 0 && xCol < ${h}) {
      ${p}
      let xIndex = getIndexFromCoords4D(coord, vec4<i32>(uniforms.x_shape));
      ${l(s)}
    }
    return resData;`,_=e?t&&r?`
    let col = colIn * ${s};
    ${y}`:`
    let col = colIn * ${s};
    if (row < uniforms.dim_a_outer && col < uniforms.dim_inner) {
      ${y}
    }
    return ${ce(s,d)}(0.0);`:r&&n?`
    let col = colIn * ${s};
    ${y}`:`
    let col = colIn * ${s};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${y}
    }
    return ${ce(s,d)}(0.0);`,w=e?r&&n?c(a):`
    let col = colIn * ${a};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${c(a)}
    }
    return ${ce(a,d)}(0.0);`:`
    let col = colIn * ${a};
    if (row < uniforms.dim_inner && col < uniforms.dim_a_outer) {
      ${c(a)}
    }
    return ${ce(a,d)}(0.0);`,$=ce(u,d),v=e?ce(s,d):ce(a,d),I=e?ce(a,d):ce(s,d),S=Te(i,$,d);return`
    fn mm_readA(batch: i32, row : i32, colIn : i32) -> ${v} {
      ${e?_:w}
    }

    fn mm_readB(batch: i32, row : i32, colIn : i32) -> ${I} {
      ${e?w:_}
    }

    fn mm_write(batch: i32, row : i32, colIn : i32, valueIn : ${$}) {
      let col = colIn * ${u};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer)
      {
      var value = valueIn;
      let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
      ${f}
      ${Gi(o)}
      ${S}
      setOutputAtCoords(coords[0], coords[1], coords[2], coords[3], value);
      }
    }`},Ki=(e,t,n,r,o,i,s,a,u)=>{let d=t.format==="NHWC",l=d?e[0].dims[3]:e[0].dims[1],c=n[0],p=d?n[2]:n[3],f=d?n[1]:n[2],m=d?n[3]:n[1],h=d&&(l%4===0||l%3===0)&&m%4===0,b=d?m:p*f,g=d?p*f:m,y=[8,8,1],_=r<=8?[4,1,1]:[4,4,1],w=[Math.ceil(b/y[0]/_[0]),Math.ceil(g/y[1]/_[1]),Math.ceil(c/y[2]/_[2])];X("verbose",()=>`[conv2d_mm_webgpu] dispatch = ${w}`);let $=h?d&&l%4!==0?3:4:1,v=y[1]*_[1],I=y[0]*_[0],S=Math.max(y[0]*$,y[1]),C=r%v===0,P=o%I===0,R=i%S===0,O=h?[$,4,4]:[1,1,1],N=[{type:6,data:r},{type:6,data:o},{type:6,data:i},{type:6,data:[t.pads[0],t.pads[1]]},{type:6,data:t.strides},{type:6,data:t.dilations}];Ie(t,N),N.push(...z(e[0].dims,e[1].dims));let q=["rank","rank"];s&&(N.push(...z(e[2].dims)),q.push("rank")),N.push(...z(n));let B=M=>{let W=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"},{name:"pad",type:"i32",length:2},{name:"stride",type:"i32",length:2},{name:"dilation",type:"i32",length:2}];Ce(t,W);let L=h?4:1,K=ne(e[0].dataType),V=`
      fn setOutputAtIndex(flatIndex : i32, value : ${h?`vec4<${K}>`:K}) {
        result[flatIndex] = ${h?`vec4<${K}>`:K}(value);
      }
      fn setOutputAtCoords(d0 : i32, d1 : i32, d2 : i32, d3 : i32, value : ${h?`vec4<${K}>`:K}) {
        let flatIndex = getOutputIndexFromCoords(vec4<i32>(d0, d1, d2, d3));
        setOutputAtIndex(flatIndex ${h?"/ 4":""}, value);
      }`,F=T("x",e[0].dataType,e[0].dims.length,$===3?1:$),_e=T("w",e[1].dataType,e[1].dims.length,L),se=[F,_e],k=A("result",e[0].dataType,n.length,L);if(s){let D=T("bias",e[2].dataType,e[2].dims.length,L);se.push(D),V+=`
        fn getBiasByOutputCoords(coords : vec4<i32>) -> ${h?`vec4<${K}>`:K} {
          return bias[coords.${d?"w":"y"}${h?"/ 4":""}];
        }`}return`
        ${Hi("uniforms.result_strides")}
        //struct Uniforms { xShape : vec4<i32>, wShape : vec4<i32>, outShape : vec4<i32>,
        //  outShapeStrides: vec3<i32>, filterDims : vec2<i32>, pad : vec2<i32>, stride : vec2<i32>,
        //  dilation : vec2<i32>, dimAOuter : i32, dimBOuter : i32, dimInner : i32 };
        ${M.registerUniforms(W).declareVariables(...se,k)}
        ${V}
        ${fl(d,C,P,R,s,t,O[0],O[1],O[2],K)}
        ${h?On(_,y,K,void 0,!d,S):Mn(_,y,K,void 0,!d,S,!1,void 0,a)}`};return{name:"Conv2DMatMul",shaderCache:{hint:`${t.cacheKey};${$};${h};${C};${P};${R};${v};${I};${S}`,inputDependencies:q},getRunData:()=>({outputs:[{dims:u?u(n):n,dataType:e[0].dataType}],dispatchGroup:{x:w[0],y:w[1],z:w[2]},programUniforms:N}),getShaderSource:B}}});var hl,Zi,jt,gl,Qi,yl,Xi,Yi,Ji=E(()=>{H();ke();j();Q();qe();Ht();hl=e=>{let t=1;for(let n=0;n<e.length;n++)t*=e[n];return t},Zi=e=>typeof e=="number"?[e,e,e]:e,jt=(e,t)=>t<=1?e:e+(e-1)*(t-1),gl=(e,t,n,r=1)=>{let o=jt(t,r);return Math.floor((e[0]*(n-1)-n+o)/2)},Qi=(e,t,n,r,o)=>{o==null&&(o=gl(e,t[0],r[0]));let i=[0,0,0,n];for(let s=0;s<3;s++)e[s]+2*o>=t[s]&&(i[s]=Math.trunc((e[s]-t[s]+2*o)/r[s]+1));return i},yl=(e,t,n,r,o,i,s,a,u,d)=>{let l,c,p,f;if(e==="VALID"&&(e=0),typeof e=="number"){l={top:e,bottom:e,left:e,right:e,front:e,back:e};let m=Qi([t,n,r,1],[a,u,d],1,[o,i,s],e);c=m[0],p=m[1],f=m[2]}else if(Array.isArray(e)){if(!e.every((h,b,g)=>h===g[0]))throw Error(`Unsupported padding parameter: ${e}`);l={top:e[0],bottom:e[1],left:e[2],right:e[3],front:e[4],back:e[5]};let m=Qi([t,n,r,1],[a,u,d],1,[o,i,s],e[0]);c=m[0],p=m[1],f=m[2]}else if(e==="SAME_UPPER"){c=Math.ceil(t/o),p=Math.ceil(n/i),f=Math.ceil(r/s);let m=(c-1)*o+a-t,h=(p-1)*i+u-n,b=(f-1)*s+d-r,g=Math.floor(m/2),y=m-g,_=Math.floor(h/2),w=h-_,$=Math.floor(b/2),v=b-$;l={top:_,bottom:w,left:$,right:v,front:g,back:y}}else throw Error(`Unknown padding parameter: ${e}`);return{padInfo:l,outDepth:c,outHeight:p,outWidth:f}},Xi=(e,t,n,r,o,i=!1,s="channelsLast")=>{let a,u,d,l,c;if(s==="channelsLast")[a,u,d,l,c]=e;else if(s==="channelsFirst")[a,c,u,d,l]=e;else throw new Error(`Unknown dataFormat ${s}`);let[p,,f,m,h]=t,[b,g,y]=Zi(n),[_,w,$]=Zi(r),v=jt(f,_),I=jt(m,w),S=jt(h,$),{padInfo:C,outDepth:P,outHeight:R,outWidth:O}=yl(o,u,d,l,b,g,y,v,I,S),N=i?p*c:p,q=[0,0,0,0,0];return s==="channelsFirst"?q=[a,N,P,R,O]:s==="channelsLast"&&(q=[a,P,R,O,N]),{batchSize:a,dataFormat:s,inDepth:u,inHeight:d,inWidth:l,inChannels:c,outDepth:P,outHeight:R,outWidth:O,outChannels:N,padInfo:C,strideDepth:b,strideHeight:g,strideWidth:y,filterDepth:f,filterHeight:m,filterWidth:h,effectiveFilterDepth:v,effectiveFilterHeight:I,effectiveFilterWidth:S,dilationDepth:_,dilationHeight:w,dilationWidth:$,inShape:e,outShape:q,filterShape:t}},Yi=(e,t,n,r,o,i)=>{let s=i==="channelsLast",a=s?e[0].dims[3]:e[0].dims[1],u=!1,d=[64,1,1],l={x:n.map((y,_)=>_)},c=[Math.ceil(hl(l.x.map(y=>n[y]))/d[0]),1,1];X("verbose",()=>`[conv3d_naive_webgpu] dispatch = ${c}`);let p=u?s&&a%4!==0?3:4:1,f=x.size(n),m=[{type:12,data:f},{type:12,data:r},{type:12,data:o},{type:12,data:t.strides},{type:12,data:t.dilations}];Ie(t,m),m.push(...z(e[0].dims,e[1].dims));let h=["rank","rank"],b=e.length===3;b&&(m.push(...z(e[2].dims)),h.push("rank")),m.push(...z(n));let g=y=>{let _=[{name:"output_size",type:"u32"},{name:"filter_dims",type:"u32",length:r.length},{name:"pads",type:"u32",length:o.length},{name:"strides",type:"u32",length:t.strides.length},{name:"dilations",type:"u32",length:t.dilations.length}];Ce(t,_);let w=u?4:1,$=ne(e[0].dataType),v=T("x",e[0].dataType,e[0].dims.length,p===3?1:p),I=T("W",e[1].dataType,e[1].dims.length,w),S=[v,I],C=A("result",e[0].dataType,n.length,w),P="";if(b){let N=T("bias",e[2].dataType,e[2].dims.length,w);S.push(N),P+=`
        fn getBiasByOutputCoords(coords : array<u32, 5>) -> ${u?`vec4<${$}>`:$} {
          return bias[${s?U("coords",4,5):U("coords",1,5)}${u?"/ 4":""}];
        }`}let R=ce(p,$),O=Te(t,R,$);return`
            ${P}
            fn getX(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> ${$} {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${v.getByIndices("aIndices")};
            }
            fn getW(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> ${$} {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${I.getByIndices("aIndices")};
            }
          ${y.registerUniforms(_).declareVariables(...S,C)}
          ${y.mainStart()}
          ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
              let coords = ${C.offsetToIndices("global_idx")};
              let batch = ${U("coords",0,v.rank)};
              let d2 = ${s?U("coords",v.rank-1,v.rank):U("coords",1,v.rank)};
              let xFRCCorner = vec3<u32>(${s?U("coords",1,v.rank):U("coords",2,v.rank)},
              ${s?U("coords",2,v.rank):U("coords",3,v.rank)},
              ${s?U("coords",3,v.rank):U("coords",4,v.rank)}) * uniforms.strides - uniforms.pads;
              let xFCorner = xFRCCorner.x;
              let xRCorner = xFRCCorner.y;
              let xCCorner = xFRCCorner.z;
              let xShapeY = ${s?U("uniforms.x_shape",1,v.rank):U("uniforms.x_shape",2,v.rank)};
              let xShapeZ = ${s?U("uniforms.x_shape",2,v.rank):U("uniforms.x_shape",3,v.rank)};
              let xShapeW = ${s?U("uniforms.x_shape",3,v.rank):U("uniforms.x_shape",4,v.rank)};
              let xShapeU = ${s?U("uniforms.x_shape",4,v.rank):U("uniforms.x_shape",1,v.rank)};
              let inputDepthNearestVec4 = (xShapeU / 4) * 4;
              let inputDepthVec4Remainder = xShapeU % 4;

              var value = ${$}(0);
              for (var wF = 0u; wF < uniforms.filter_dims[0]; wF++) {
                let xF = xFCorner + wF * uniforms.dilations[0];
                if (xF < 0 || xF >= xShapeY) {
                  continue;
                }

                for (var wR = 0u; wR < uniforms.filter_dims[1]; wR++) {
                  let xR = xRCorner + wR * uniforms.dilations[1];
                  if (xR < 0 || xR >= xShapeZ) {
                    continue;
                  }

                  for (var wC = 0u; wC < uniforms.filter_dims[2]; wC++) {
                    let xC = xCCorner + wC * uniforms.dilations[2];
                    if (xC < 0 || xC >= xShapeW) {
                      continue;
                    }

                    for (var d1 = 0u; d1 < inputDepthNearestVec4; d1 += 4) {
                      ${s?`let xValues = vec4<${$}>(
                               getX(batch, xF, xR, xC, d1),
                               getX(batch, xF, xR, xC, d1 + 1),
                               getX(batch, xF, xR, xC, d1 + 2),
                               getX(batch, xF, xR, xC, d1 + 3));
                            `:`let xValues = vec4<${$}>(
                               getX(batch, d1, xF, xR, xC),
                               getX(batch, d1 + 1, xF, xR, xC),
                               getX(batch, d1 + 2, xF, xR, xC),
                               getX(batch, d1 + 3, xF, xR, xC));
                            `}
                            let wValues = vec4<${$}>(
                              getW(d2, d1, wF, wR, wC),
                              getW(d2, d1 + 1, wF, wR, wC),
                              getW(d2, d1 + 2, wF, wR, wC),
                              getW(d2, d1 + 3, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                    if (inputDepthVec4Remainder == 1) {
                        ${s?`value += getX(batch, xF, xR, xC, inputDepthNearestVec4)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`:`value += getX(batch, inputDepthNearestVec4, xF, xR, xC)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`}
                    } else if (inputDepthVec4Remainder == 2) {
                      ${s?`let xValues = vec2<${$}>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1));
                      `:`let xValues = vec2<${$}>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC));
                    `}
                    let wValues = vec2<${$}>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC));
                      value += dot(xValues, wValues);
                    } else if (inputDepthVec4Remainder == 3) {
                      ${s?`let xValues = vec3<${$}>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 2));
                      `:`let xValues = vec3<${$}>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 2, xF, xR, xC));
                    `}
                    let wValues = vec3<${$}>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 2, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                  }
                }
              }
              ${b?"value = value + getBiasByOutputCoords(coords)":""};
              ${O}
              result[global_idx] = ${$}(value);
          }`};return{name:"Conv3DNaive",shaderCache:{hint:`${t.cacheKey};${s};${p};${b}`,inputDependencies:h},getRunData:()=>({outputs:[{dims:n,dataType:e[0].dataType}],dispatchGroup:{x:c[0],y:c[1],z:c[2]},programUniforms:m}),getShaderSource:g}}});var es,ts,ns=E(()=>{H();j();Q();qe();es=(e,t,n,r)=>{let o=e.length>2,i=o?"value += b[output_channel];":"",s=e[0].dims,a=e[1].dims,u=t.format==="NHWC",d=u?n[3]:n[1],l=d/t.group,c=u&&l>=4?J(d):1,p=x.size(n)/c,f=[{type:12,data:p},{type:12,data:t.dilations},{type:12,data:[t.strides[0],t.strides[1]]},{type:12,data:[t.pads[0],t.pads[1]]},{type:12,data:l}];Ie(t,f),f.push(...z(s,[a[0],a[1],a[2],a[3]/c]));let m=o?["rank","rank","rank"]:["rank","rank"];f.push(...z([n[0],n[1],n[2],n[3]/c]));let h=b=>{let g=A("output",e[0].dataType,n.length,c),y=ne(g.type.tensor),_=Te(t,g.type.value,y),w=T("x",e[0].dataType,s.length),$=T("w",e[1].dataType,a.length,c),v=[w,$];o&&v.push(T("b",e[2].dataType,e[2].dims,c));let I=[{name:"output_size",type:"u32"},{name:"dilations",type:"u32",length:t.dilations.length},{name:"strides",type:"u32",length:2},{name:"pads",type:"u32",length:2},{name:"output_channels_per_group",type:"u32"}];Ce(t,I);let S=u?`
      for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[0]; wHeight++) {
        let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

        if (xHeight < 0u || xHeight >= uniforms.x_shape[1]) {
          continue;
        }

        for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[1]; wWidth++) {
          let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
          if (xWidth < 0u || xWidth >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[2]; wInChannel++) {
            let input_channel = in_channel_offset + wInChannel;
            let xVal = ${w.get("batch","xHeight","xWidth","input_channel")};
            let wVal = ${$.get("wHeight","wWidth","wInChannel","output_channel")};
            value += xVal * wVal;
          }
        }
      }
      `:`
      for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[1]; wInChannel++) {
        let input_channel = in_channel_offset + wInChannel;
        for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[2]; wHeight++) {
          let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

          if (xHeight < 0u || xHeight >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[3]; wWidth++) {
            let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
            if (xWidth < 0u || xWidth >= uniforms.x_shape[3]) {
              continue;
            }

            let xVal = ${w.get("batch","input_channel","xHeight","xWidth")};
            let wVal = ${$.get("output_channel","wInChannel","wHeight","wWidth")};
            value += xVal * wVal;
          }
        }
      }
      `;return`
  ${b.registerUniforms(I).declareVariables(...v,g)}

  ${b.mainStart()}
    ${b.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let outputIndices = ${g.offsetToIndices("global_idx")};
    let batch: u32 = outputIndices[0];
    let output_channel: u32 = outputIndices[${u?3:1}];
    let xRCCorner: vec2<u32> = vec2<u32>(outputIndices[${u?1:2}], outputIndices[${u?2:3}]) * uniforms.strides - uniforms.pads;
    let group_id: u32 = output_channel * ${c} / uniforms.output_channels_per_group;
    var in_channel_offset = group_id * uniforms.w_shape[${u?2:1}];

    var value: ${g.type.value} = ${g.type.value}(0);
    ${S}
    ${i}
    ${_}
    ${g.setByOffset("global_idx","value")}
  }`};return{name:"GroupedConv",shaderCache:{hint:`${t.cacheKey}_${c}`,inputDependencies:m},getRunData:()=>({outputs:[{dims:r?r(n):n,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(p/64)},programUniforms:f}),getShaderSource:h}},ts=(e,t,n,r)=>{let o=e.length>2,i=J(n[3]),s=J(n[2]),a=x.size(n)/i/s,u=[e[0].dims[0],e[0].dims[1],e[0].dims[2],e[0].dims[3]/i],d=[e[1].dims[0],e[1].dims[1],e[1].dims[2],e[1].dims[3]/i],l=[n[0],n[1],n[2],n[3]/i],c=[{type:12,data:a},{type:6,data:[t.strides[0],t.strides[1]]},{type:6,data:[t.pads[0],t.pads[1]]}];Ie(t,c),c.push(...z(u,d,l));let p=(s-1)*t.strides[1]+d[1],f=m=>{let h=A("output",e[0].dataType,l.length,i),b=ne(h.type.tensor),g=Te(t,h.type.value,b),y=T("x",e[0].dataType,u.length,i),_=T("w",e[1].dataType,d.length,i),w=[y,_];o&&w.push(T("b",e[2].dataType,e[2].dims,i));let $=o?"value += b[output_channel];":"",v=[{name:"output_size",type:"u32"},{name:"strides",type:"i32",length:2},{name:"pads",type:"i32",length:2}];return Ce(t,v),`
  ${m.registerUniforms(v).declareVariables(...w,h)}
  ${m.mainStart()}
    ${m.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let width0 = uniforms.output_shape[3];
    let output_channel = global_idx % width0;
    var index1 = global_idx / width0;
    let width1 = uniforms.output_shape[2] / ${s}u;
    let col = (index1 % width1) * ${s}u;
    index1 = index1 / width1;
    let row = index1 % uniforms.output_shape[1];
    let batch = index1 / uniforms.output_shape[1];

    let x_corner = vec2<i32>(i32(row), i32(col)) * uniforms.strides - uniforms.pads;

    var x_vals: array<${y.type.value}, ${p}>;
    var values: array<${h.type.value}, ${s}>;
    let input_channel = output_channel;
    // Use constant instead of uniform can give better performance for w's height/width.
    for (var w_height: u32 = 0u; w_height < ${d[0]}; w_height++) {
      let x_height = x_corner.x + i32(w_height);
      if (x_height >= 0 && u32(x_height) < uniforms.x_shape[1]) {
        for (var i = 0; i < ${p}; i++) {
          let x_width = x_corner.y + i;
          if (x_width >= 0 && u32(x_width) < uniforms.x_shape[2]) {
            x_vals[i] = ${y.get("batch","u32(x_height)","u32(x_width)","input_channel")};
          } else {
            x_vals[i] = ${y.type.value}(0);
          }
        }
        for (var w_width: u32 = 0u; w_width < ${d[1]}; w_width++) {
          let w_val = ${_.get("w_height","w_width","0","output_channel")};
          for (var i = 0u; i < ${s}u; i++) {
            values[i] = fma(x_vals[i * u32(uniforms.strides[1]) + w_width], w_val, values[i]);
          }
        }
      }
    }

    for (var i = 0u; i < ${s}u; i++) {
      var value = values[i];
      ${$}
      ${g}
      ${h.set("batch","row","col + i","output_channel","value")};
    }
  }`};return{name:"GroupedConv-Vectorize",shaderCache:{hint:`${t.cacheKey};${i};${s};${p};${d[0]};${d[1]}`,inputDependencies:o?["rank","rank","type"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:r?r(n):n,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:c}),getShaderSource:f}}});var bl,Un,_l,Rn,Vn,rs,wl,$l,Ln,os=E(()=>{Wi();j();ji();Ji();Kt();ns();qe();Ft();Me();bl=(e,t,n,r,o,i)=>{let s=e[0],a=e.slice(i?1:2,i?3:4),u=a.length,d=t[0],c=t.slice(2).map((m,h)=>m+(m-1)*(n[h]-1)),f=a.map((m,h)=>m+r[h]+r[h+u]).map((m,h)=>Math.floor((m-c[h]+o[h])/o[h]));return f.splice(0,0,s),f.splice(i?3:1,0,d),f},Un=[2,3,1,0],_l=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length>5)throw new Error("greater than 5D is not supported");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let n=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],r=e[1].dims[1]*t.group;if(n!==r)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");if(e.length===3&&(e[2].dims.length!==1||e[1].dims[0]!==e[2].dims[0]))throw new Error("invalid bias");let o=e[0].dims.length-2;if(t.dilations.length!==o)throw new Error(`dilations should be ${o}D`);if(t.strides.length!==o)throw new Error(`strides should be ${o}D`);if(t.pads.length!==o*2)throw new Error(`pads should be ${o*2}D`);if(t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape")},Rn=(e,t)=>{let n=e.kernelShape.slice();n.length<t[1].dims.length-2&&n.push(...Array(t[1].dims.length-2-n.length).fill(0));for(let i=2;i<t[1].dims.length;++i)n[i-2]===0&&(n[i-2]=t[1].dims[i]);let r=e.pads.slice();Ye.adjustPadsBasedOnAutoPad(t[0].dims,e.strides,e.dilations,n,r,e.format==="NHWC",e.autoPad);let o=Object.assign({},e);return Object.assign(o,{kernelShape:n,pads:r}),o},Vn=e=>{let t=Gt(e),n=e.format,r=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],o=e.dilations,i=e.group,s=e.kernel_shape,a=e.pads,u=e.strides,d=e.w_is_const();return{autoPad:r,format:n,dilations:o,group:i,kernelShape:s,pads:a,strides:u,wIsConst:d,...t,cacheKey:`${e.format};${t.activation};`}},rs=(e,t,n,r)=>{let o=n.format==="NHWC",i=bl(t[0].dims,t[1].dims,n.dilations,n.pads,n.strides,o);if(!r&&Ni(e,t,n,i))return;if(n.group!==1){let v=[t[0]];if(o){let S=e.kernelCustomData.wT??e.compute(me(t[1],Un),{inputs:[1],outputs:[n.wIsConst?-2:-1]})[0];n.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=S),v.push(S)}else v.push(t[1]);t.length===3&&v.push(t[2]),!e.adapterInfo.isArchitecture("ampere")&&o&&t[1].dims[0]===n.group&&t[1].dims[1]===1&&n.dilations[0]===1&&n.dilations[1]===1?e.compute(ts(v,n,i,r),{inputs:v}):e.compute(es(v,n,i,r),{inputs:v});return}let s=t.length===3,a=t[0].dims[o?1:2],u=t[0].dims[o?2:3],d=t[0].dims[o?3:1],l=t[1].dims[2],c=t[1].dims[3],p=i[o?1:2],f=i[o?2:3],m=i[o?3:1],h=o&&l===a&&c===u&&n.pads[0]===0&&n.pads[1]===0;if(h||l===1&&c===1&&n.dilations[0]===1&&n.dilations[1]===1&&n.strides[0]===1&&n.strides[1]===1&&n.pads[0]===0&&n.pads[1]===0){let v=i[0],I,S,C,P=[];if(o){let N=e.kernelCustomData.wT??e.compute(me(t[1],Un),{inputs:[1],outputs:[n.wIsConst?-2:-1]})[0];if(n.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=N),h){let q=a*u*d;I=t[0].reshape([1,v,q]),S=N.reshape([1,q,m]),C=[1,v,m]}else I=t[0].reshape([v,a*u,d]),S=N.reshape([1,d,m]),C=[v,p*f,m];P.push(I),P.push(S)}else I=t[0].reshape([v,d,a*u]),S=t[1].reshape([1,m,d]),C=[v,m,p*f],P.push(S),P.push(I);s&&P.push(t[2]);let R=C[2],O=P[0].dims[P[0].dims.length-1];R<8&&O<8?e.compute(qt(P,n,i,C,o,r),{inputs:P}):e.compute(ft(P,n,i,C,o,r),{inputs:P});return}let b=!0,g=e.kernelCustomData.wT??e.compute(me(t[1],Un),{inputs:[1],outputs:[n.wIsConst?-2:-1]})[0];n.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=g);let y=[t[0],g];s&&y.push(t[2]);let _=o?p*f:m,w=o?m:p*f,$=l*c*d;e.compute(Ki(y,n,i,_,w,$,s,b,r),{inputs:y})},wl=(e,t)=>{let n=t.format==="NHWC",r=[e.inputs[0].reshape(n?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&r.push(e.inputs[2]);let o=[0,t.pads[0],0,t.pads[1]],i=[1].concat(t.strides),s=[1].concat(t.dilations),a=[1].concat(t.kernelShape),u=Rn({...t,pads:o,strides:i,dilations:s,kernelShape:a},r);rs(e,r,u,d=>n?[d[0],d[2],d[3]]:[d[0],d[1],d[3]])},$l=(e,t,n)=>{let r=n.format==="NHWC"?"channelsLast":"channelsFirst",o=Rn(n,t),i=n.autoPad==="NOTSET"?n.pads:n.autoPad,s=Xi(t[0].dims,t[1].dims,n.strides,n.dilations,i,!1,r);e.compute(Yi(t,o,s.outShape,[s.filterDepth,s.filterHeight,s.filterWidth],[s.padInfo.front,s.padInfo.top,s.padInfo.left],r))},Ln=(e,t)=>{if(_l(e.inputs,t),e.inputs[0].dims.length===3)wl(e,t);else if(e.inputs[0].dims.length===5)$l(e,e.inputs,t);else{let n=Rn(t,e.inputs);rs(e,e.inputs,n)}}});var is,ss=E(()=>{H();ke();j();Q();is=(e,t,n)=>{let r=e.length>2,o=t.outputShape,i=t.format==="NHWC",s=t.group,a=e[1].dims,u=a[2]/s,d=a[3],l=i?J(u):1,c=i&&d===1&&u>=4,p=c?Math.floor(u/4)*4:Math.floor(u/l)*l,f=u-p,m=i?J(d):1,h=i?d===1?l:m:1,b=x.size(o)/m,g=[Math.ceil(b/64),1,1];X("verbose",()=>`[conv2d_backprop_webgpu] dispatch = ${g}`);let y=["rank","rank"],_=[t.strides[0],t.strides[1]],w=[t.kernelShape[i?1:2],t.kernelShape[i?2:3]],$=[t.dilations[0],t.dilations[1]],v=[w[0]+(t.dilations[0]<=1?0:(t.kernelShape[i?1:2]-1)*(t.dilations[0]-1)),w[1]+(t.dilations[1]<=1?0:(t.kernelShape[i?2:3]-1)*(t.dilations[1]-1))],I=[v[0]-1-Math.floor((t.pads[0]+t.pads[2])/2),v[1]-1-Math.floor((t.pads[1]+t.pads[3])/2)],S=[{type:12,data:b},{type:12,data:_},{type:12,data:w},{type:12,data:$},{type:12,data:v},{type:6,data:I},{type:12,data:p},{type:12,data:u},{type:12,data:d},...z(e[0].dims,e[1].dims)];r&&(S.push(...z(e[2].dims)),y.push("rank")),S.push(...z(o));let C=P=>{let R=[{name:"output_size",type:"u32"},{name:"strides",type:"u32",length:_.length},{name:"filter_dims",type:"u32",length:w.length},{name:"dilations",type:"u32",length:w.length},{name:"effective_filter_dims",type:"u32",length:v.length},{name:"pads",type:"i32",length:I.length},{name:"input_channels_per_group_int",type:"u32"},{name:"input_channels_per_group",type:"u32"},{name:"output_channels_per_group",type:"u32"}],O=ne(e[0].dataType),N=i?1:2,q=i?2:3,B=i?3:1,M=T("W",e[1].dataType,e[1].dims.length,h),W=T("Dy",e[0].dataType,e[0].dims.length,l),L=[W,M];r&&L.push(T("bias",e[2].dataType,[o[B]].length,m));let K=A("result",e[0].dataType,o.length,m),V=()=>{let se="";if(c)l===4?se+=`
        let xValue = ${W.getByOffset("x_offset")};
        let wValue = ${M.getByOffset("w_offset")};
        dotProd = dotProd + dot(xValue, wValue);
        x_offset += 1u;
        w_offset += 1u;`:l===2?se+=`
          dotProd = dotProd + dot(vec4<${O}>(${W.getByOffset("x_offset")}, ${W.getByOffset("x_offset + 1u")}), vec4<${O}>(${M.getByOffset("w_offset")}, ${M.getByOffset("w_offset + 1u")}));
          x_offset += 2u;
          w_offset += 2u;`:l===1&&(se+=`
          dotProd = dotProd + dot(vec4<${O}>(${W.getByOffset("x_offset")}, ${W.getByOffset("x_offset + 1u")}, ${W.getByOffset("x_offset + 2u")}, ${W.getByOffset("x_offset + 3u")}), vec4<${O}>(${M.getByOffset("w_offset")}, ${M.getByOffset("w_offset + 1u")}, ${M.getByOffset("w_offset + 2u")}, ${M.getByOffset("w_offset + 3u")}));
          x_offset += 4u;
          w_offset += 4u;`);else if(se+=`
                  let xValue = ${i?W.getByOffset(`${W.indicesToOffset(`${W.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${l}`):W.get("batch","inputChannel","idyR","idyC")};
        `,l===1)se+=`
          let w_offset = ${M.indicesToOffset(`${M.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel, wOutChannel)`)};
          let wValue = ${M.getByOffset(`w_offset / ${h}`)};
          dotProd = dotProd + xValue * wValue;`;else for(let k=0;k<l;k++)se+=`
            let wValue${k} = ${M.getByOffset(`${M.indicesToOffset(`${M.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel + ${k}, wOutChannel)`)} / ${h}`)};
            dotProd = dotProd + xValue[${k}] * wValue${k};`;return se},F=()=>{if(f===0)return"";if(!c)throw new Error(`packInputAs4 ${c} is not true.`);let se="";if(l===1){se+="dotProd = dotProd";for(let k=0;k<f;k++)se+=`
            + ${W.getByOffset(`x_offset + ${k}`)} * ${M.getByOffset(`w_offset + ${k}`)}`;se+=";"}else if(l===2){if(f!==2)throw new Error(`Invalid inputChannelsRemainder ${f}.`);se+=`
          let xValue = ${W.getByOffset("x_offset")};
          let wValue = ${M.getByOffset("w_offset")};
          dotProd = dotProd + dot(xValue, wValue);`}return se},_e=`
            let outputIndices = ${K.offsetToIndices(`global_idx * ${m}`)};
            let batch = ${K.indicesGet("outputIndices",0)};
            let d1 = ${K.indicesGet("outputIndices",B)};
            let r = ${K.indicesGet("outputIndices",N)};
            let c = ${K.indicesGet("outputIndices",q)};
            let dyCorner = vec2<i32>(i32(r), i32(c)) - uniforms.pads;
            let dyRCorner = dyCorner.x;
            let dyCCorner = dyCorner.y;
            let groupId = d1 / uniforms.output_channels_per_group;
            let wOutChannel = d1 - groupId * uniforms.output_channels_per_group;
            // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).
            // ? = to be determined. : = across all values in that axis.
            var dotProd = ${K.type.value}(0.0);
            var wR: u32 = 0;
            if (uniforms.dilations.x == 1) {
              // Minimum wR >= 0 that satisfies (dyRCorner + wR) % (uniforms.strides.x) == 0
              wR = u32(((dyRCorner + i32(uniforms.strides.x) - 1) / i32(uniforms.strides.x)) * i32(uniforms.strides.x) - dyRCorner);
            }
            for (; wR < uniforms.effective_filter_dims.x; wR = wR + 1) {
              if (wR % uniforms.dilations.x != 0) {
                continue;
              }
              let dyR = (${O}(dyRCorner) + ${O}(wR)) / ${O}(uniforms.strides[0]);
              let wRPerm = uniforms.filter_dims.x - 1 - wR / uniforms.dilations.x;
              if (dyR < 0.0 || dyR >= ${O}(uniforms.Dy_shape[${N}]) || fract(dyR) > 0.0 ||
                  wRPerm < 0) {
                continue;
              }
              let idyR: u32 = u32(dyR);
              var wC: u32 = 0;
              if (uniforms.dilations.y == 1) {
                // Minimum wC >= 0 that satisfies (dyCCorner + wC) % (uniforms.strides.y) == 0
                wC = u32(((dyCCorner + i32(uniforms.strides.y) - 1) / i32(uniforms.strides.y)) * i32(uniforms.strides.y) - dyCCorner);
              }
              for (; wC < uniforms.effective_filter_dims.y; wC = wC + 1) {
                if (wC % uniforms.dilations.y != 0) {
                  continue;
                }
                let dyC = (${O}(dyCCorner) + ${O}(wC)) / ${O}(uniforms.strides.y);
                let wCPerm = uniforms.filter_dims.y - 1 - wC / uniforms.dilations.y;
                if (dyC < 0.0 || dyC >= ${O}(uniforms.Dy_shape[${q}]) ||
                    fract(dyC) > 0.0 || wCPerm < 0) {
                  continue;
                }
                let idyC: u32 = u32(dyC);
                var inputChannel = groupId * uniforms.input_channels_per_group;
                ${c?`
                var x_offset = ${W.indicesToOffset(`${W.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${l};
                var w_offset = ${M.indicesToOffset(`${M.type.indices}(wRPerm, wCPerm, inputChannel, wOutChannel)`)} / ${h};
                  `:""}
                for (var d2: u32 = 0; d2 < uniforms.input_channels_per_group_int; d2 = d2 + ${c?4:l}) {
                  ${V()}
                  inputChannel = inputChannel + ${c?4:l};
                }
                ${F()}
                wC = wC + uniforms.strides.y - 1;
              }
              wR = wR + uniforms.strides[0] - 1;
            }
            let value = dotProd${r?` + bias[d1 / ${m}]`:""};
            ${K.setByOffset("global_idx","value")};
          `;return`
    ${P.registerUniforms(R).declareVariables(...L,K)}
      ${P.mainStart()}
      ${P.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")};
    ${_e}}`};return{name:"ConvTranspose2D",shaderCache:{hint:`${t.cacheKey};${l}${h}${m}${c}${f}`,inputDependencies:y},getRunData:()=>({dispatchGroup:{x:g[0],y:g[1],z:g[2]},outputs:[{dims:n?n(o):o,dataType:e[0].dataType}],programUniforms:S}),getShaderSource:C}}});var vl,xl,Sl,as,us,Tl,ds,Il,ls,cs=E(()=>{ss();qe();Me();vl=(e,t,n,r,o,i)=>(e-1)*t+n+(r-1)*o+1-i,xl=(e,t,n,r,o)=>{let i=Math.floor(e/2);t==="SAME_UPPER"?(n[r]=i,n[o]=e-i):t==="SAME_LOWER"&&(n[r]=e-i,n[o]=i)},Sl=(e,t,n,r,o,i,s,a,u,d)=>{let l=e.length-2,c=d.length===0;u.length<l&&u.push(...Array(l-u.length).fill(0));let p=e[0],f=t[a?3:1]*o;for(let m=0,h=e.length-l-(a?1:0);m<l;++m,++h){let b=e[h],g=c?b*s[m]:d[m],y=vl(b,s[m],i[m],t[h],n[m],g);xl(y,r,i,m,m+l),c&&d.push(s[m]*(b-1)+u[m]+(t[h]-1)*n[m]+1-i[m]-i[m+l])}d.splice(0,0,p),d.splice(a?3:1,0,f)},as=(e,t)=>{let n=e.kernelShape.slice();if(e.kernelShape.length===0||e.kernelShape.reduce((c,p)=>c*p,1)===0){n.length=0;for(let c=2;c<t[1].dims.length;++c)n.push(t[1].dims[c])}let r=e.format==="NHWC";n.splice(0,0,t[1].dims[0]),n.splice(r?3:1,0,t[1].dims[1]);let o=e.pads.slice(),i=e.outputShape.slice(),s=e.outputPadding.slice(),a=t[0].dims,u=e.dilations.slice();if(u.reduce((c,p)=>c+p,0)===0){let c=t[0].dims.length-2;u=new Array(c).fill(1)}let d=e.strides.slice();if(d.reduce((c,p)=>c+p,0)===0){let c=t[0].dims.length-2;d=new Array(c).fill(1)}Sl(a,n,u,e.autoPad,e.group,o,d,r,s,i);let l=Object.assign({},e);return Object.assign(l,{kernelShape:n,pads:o,outputPadding:s,outputShape:i,dilations:u,strides:d}),l},us=e=>{let t=Gt(e),n=e.format,r=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][typeof e.autoPad>"u"?0:e.autoPad],o=e.dilations,i=e.group??1,s=e.kernelShape,a=e.pads,u=e.strides,d=e.wIsConst(),l=e.outputPadding,c=e.outputShape;return{autoPad:r,format:n,dilations:o,group:i,kernelShape:s,outputPadding:l,outputShape:c,pads:a,strides:u,wIsConst:d,...t,cacheKey:`${e.format};${t.activation};`}},Tl=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length!==4&&e[0].dims.length!==3)throw new Error("currently only support 2-dimensional conv");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let n=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],r=e[1].dims[0];if(n!==r)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");let o=e[1].dims[1]*t.group;if(e.length===3&&(e[2].dims.length!==1||e[2].dims[0]!==o))throw new Error("invalid bias");let i=e[0].dims.length-2;if(t.dilations.reduce((l,c)=>l+c,0)>0&&t.dilations.length!==i)throw new Error(`dilations should be ${i}D`);if(t.strides.reduce((l,c)=>l+c,0)>0&&t.strides.length!==i)throw new Error(`strides should be ${i}D`);if(t.pads.reduce((l,c)=>l+c,0)>0&&t.pads.length!==i*2)throw new Error(`pads should be ${i*2}D`);if(t.outputPadding.length!==i&&t.outputPadding.length!==0)throw new Error(`output_padding should be ${i}D`);if(t.kernelShape.reduce((l,c)=>l+c,0)>0&&t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape");if(t.outputShape.length!==0&&t.outputShape.length!==e[0].dims.length-2)throw new Error("invalid output shape")},ds=(e,t,n,r)=>{let o=e.kernelCustomData.wT??e.compute(me(t[1],[2,3,0,1]),{inputs:[1],outputs:[n.wIsConst?-2:-1]})[0];n.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=o);let i=[t[0],o];t.length===3&&i.push(t[2]),e.compute(is(i,n,r),{inputs:i})},Il=(e,t)=>{let n=t.format==="NHWC",r=[e.inputs[0].reshape(n?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&r.push(e.inputs[2]);let o=t.kernelShape;(o.length===0||o[0]===0)&&(o=[e.inputs[1].dims[2]]);let i=t.dilations;(i.length===0||i[0]===0)&&(i=[1]);let s=t.strides;(s.length===0||s[0]===0)&&(s=[1]);let a=t.pads;a.length===0&&(a=[0,0]),a=[0,a[0],0,a[1]],s=[1].concat(s),i=[1].concat(i),o=[1].concat(o);let u=t.outputPadding;u=[0].concat(u);let d=as({...t,pads:a,strides:s,dilations:i,kernelShape:o,outputPadding:u},r);ds(e,r,d,l=>n?[l[0],l[2],l[3]]:[l[0],l[1],l[3]])},ls=(e,t)=>{if(Tl(e.inputs,t),e.inputs[0].dims.length===3)Il(e,t);else{let n=as(t,e.inputs);ds(e,e.inputs,n)}}});var Cl,ps,ms,fs=E(()=>{H();j();ue();Q();Cl=(e,t,n,r)=>{let o=x.size(t),i=t.length,s=T("input",e,i),a=A("output",e,i),u=n.dataType===6?n.getInt32Array()[0]:Number(n.getBigInt64Array()[0]),d=x.normalizeAxis(u,i),l=c=>{let p=` i32(${s.indicesGet("inputIndices","uniforms.axis")}) `,f=U("uniforms.input_shape","uniforms.axis",i),m=r.reverse?p+(r.exclusive?" + 1":""):"0",h=r.reverse?f:p+(r.exclusive?"":" + 1");return`
                ${c.registerUniform("outputSize","u32").registerUniform("axis","u32").declareVariables(s,a)}
                ${c.mainStart()}
                  ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
                  var inputIndices = ${a.offsetToIndices("global_idx")};
                  var sum = ${a.type.value}(0);
                  let first : i32 = ${m};
                  let last : i32 = ${h};
                  for (var i : i32 = first; i < last; i++) {
                    ${s.indicesSet("inputIndices","uniforms.axis","u32(i)")};
                    sum = sum + ${s.getByIndices("inputIndices")};
                  }
                  ${a.setByOffset("global_idx","sum")};
                }`};return{name:"CumSum",shaderCache:{hint:r.cacheKey,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:t,dataType:e}],dispatchGroup:{x:Math.ceil(o/64)},programUniforms:[{type:12,data:o},{type:12,data:d},...z(t,t)]}),getShaderSource:l}},ps=(e,t)=>{let n=e.inputs[0].dims,r=e.inputs[0].dataType,o=e.inputs[1];e.compute(Cl(r,n,o,t),{inputs:[0]})},ms=e=>{let t=e.exclusive===1,n=e.reverse===1;return G({exclusive:t,reverse:n})}});var Al,kl,El,hs,gs,ys=E(()=>{H();j();ue();Q();Al=e=>{if(!e||e.length!==1)throw new Error("DepthToSpace requires 1 input.");if(e[0].dims.length!==4)throw new Error("DepthToSpace requires 4D input.")},kl=(e,t,n,r)=>{let o=[];o.push(`fn perm(i: ${r.type.indices}) -> ${n.type.indices} {
    var a: ${n.type.indices};`);for(let i=0;i<t;++i)o.push(n.indicesSet("a",e[i],`i[${i}]`));return o.push("return a;}"),o.join(`
`)},El=(e,t)=>{let n,r,o,i,s,a,u=t.format==="NHWC",d=t.blocksize,l=t.mode==="DCR";u?([n,r,o,i]=e.dims,s=l?[n,r,o,d,d,i/d**2]:[n,r,o,i/d**2,d,d],a=l?[0,1,3,2,4,5]:[0,1,4,2,5,3]):([n,r,o,i]=[e.dims[0],e.dims[2],e.dims[3],e.dims[1]],s=l?[n,d,d,i/d**2,r,o]:[n,i/d**2,d,d,r,o],a=l?[0,3,4,1,5,2]:[0,1,4,2,5,3]);let c=e.reshape(s),p=c.dims.length,f=e.dataType,m=T("a",f,p),h=A("output",f,p),b=g=>`
  ${g.registerUniform("output_size","u32").declareVariables(m,h)}

  ${kl(a,p,m,h)}

  ${g.mainStart()}
    ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${h.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${h.setByOffset("global_idx",m.getByIndices("aIndices"))}
  }`;return{name:"DepthToSpace",shaderCache:{hint:`${e.dims};${t.blocksize};${t.mode}`,inputDependencies:["rank"]},getRunData:g=>{let y=u?[n,r*d,o*d,i/d**2]:[n,i/d**2,r*d,o*d],_=x.size(y),w=c.dims,$=x.sortBasedOnPerm(w,a);return{outputs:[{dims:y,dataType:g[0].dataType}],dispatchGroup:{x:Math.ceil(_/64)},programUniforms:[{type:12,data:_},...z(w,$)]}},getShaderSource:b}},hs=(e,t)=>{Al(e.inputs),e.compute(El(e.inputs[0],t))},gs=e=>G({blocksize:e.blocksize,mode:e.mode,format:e.format})});var Fe,Zt,Nn,_s,tt,Pl,zl,Dl,ws,$s,vs,Bl,Ol,bs,Ml,xs,Ss,Ts=E(()=>{H();j();ue();Q();Fe=256,Zt=512,Nn=2*Math.PI,_s=e=>{let t=[],n=e;for(let r of[4,2,3,5])for(;n%r===0;)t.push(r),n/=r;return n===1?t:void 0},tt=e=>{let t=e.toPrecision(9);return/[.eE]/.test(t)?t:`${t}.0`},Pl=(e,t,n,r,o)=>{let i=n/e,s=Zt-r,a=d=>`smem[${s}u + base + ${d*t}u]`,u=`  for (var t = local_idx; t < ${i}u; t += ${Fe}u) {
`;u+=`    let twiddleIndex = t % ${t}u;
    let angleUnit = f32(twiddleIndex);
`,u+=`    var leg: array<vec2<f32>, 5>;
`;for(let d=0;d<e;d++){let l=`${r}u + t + ${d*i}u`;if(d===0)u+=`    leg[0] = smem[${l}];
`;else{let c=o*Nn*d/(e*t);u+=`    { let a = ${tt(c)} * angleUnit; leg[${d}] = cmul(smem[${l}], vec2<f32>(cos(a), sin(a))); }
`}}if(u+=`    let base = (t / ${t}u) * ${t*e}u + twiddleIndex;
`,e===2)u+=`    ${a(0)} = leg[0] + leg[1];
    ${a(1)} = leg[0] - leg[1];
`;else if(e===4){let d=o<0?"vec2<f32>(oddDiff.y, -oddDiff.x)":"vec2<f32>(-oddDiff.y, oddDiff.x)";u+=`    let evenSum = leg[0] + leg[2]; let evenDiff = leg[0] - leg[2];
`,u+=`    let oddSum = leg[1] + leg[3]; let oddDiff = leg[1] - leg[3];
`,u+=`    let oddRot = ${d};
`,u+=`    ${a(0)} = evenSum + oddSum;
    ${a(1)} = evenDiff + oddRot;
`,u+=`    ${a(2)} = evenSum - oddSum;
    ${a(3)} = evenDiff - oddRot;
`}else for(let d=0;d<e;d++){let l=["leg[0]"];for(let c=1;c<e;c++){let p=o*Nn*(c*d)/e,f=tt(Math.cos(p)),m=tt(Math.sin(p));l.push(`vec2<f32>(leg[${c}].x*${f} - leg[${c}].y*${m}, leg[${c}].x*${m} + leg[${c}].y*${f})`)}u+=`    ${a(d)} = ${l.join(" + ")};
`}return`${u}  }
  workgroupBarrier();
`},zl=(e,t,n)=>{let r="",o=1,i=0;for(let s of e)r+=Pl(s,o,t,i,n),o*=s,i=Zt-i;return{code:r,resultOffset:i}},Dl=(e,t,n,r,o)=>{let i=e.dims,s=i.length,a=i[s-1],u=i[t],d=n&&r?(u-1)*2:u;o!==void 0&&(d=o);let l=n&&r?1:2,c=r&&!n?Math.floor(d/2)+1:d,p=i.slice();p[t]=c,p[s-1]=l;let f=1;for(let h=t+1;h<s-1;h++)f*=i[h];let m=x.size(i)/a/u;return{dataType:e.dataType,outputDims:p,length:d,signalLength:u,inner:f,batch:m,inputComponents:a,outputComponents:l,outputLength:c,inverse:n,onesided:r}},ws=(e,t)=>[t,e.length,e.inputComponents,e.outputComponents,e.inverse,e.onesided].join(";"),$s=e=>[{type:12,data:e.batch},{type:12,data:e.signalLength},{type:12,data:e.inner},{type:12,data:e.outputLength}],vs=(e,t,n)=>e.registerUniform("batch","u32").registerUniform("signalLength","u32").registerUniform("inner","u32").registerUniform("outputLength","u32").declareVariables(t,n),Bl=e=>{let{dataType:t,length:n,inputComponents:r,outputComponents:o,inverse:i,onesided:s}=e,a=de(t),u=i?1:-1,d=i?1/n:1,l=_s(n),c=p=>{let f=T("x",t,[1]),m=A("y",t,[1]),h=$=>{let v=`inBase + (${$}) * uniforms.inner * ${r}u`,I=`f32(${f.getByOffset(v)})`,S=r===2?`f32(${f.getByOffset(`${v} + 1u`)})`:"0.0";return`vec2<f32>(${I}, ${S})`},b;if(i&&s){let $=Math.floor(n/2)+1,v=n%2===0?`select(provided, provided - 1u, provided == ${$}u)`:"provided";b=`
    let provided = min(uniforms.signalLength, ${$}u);
    for (var i = local_idx; i < ${n}u; i += ${Fe}u) {
      if (i < provided) { smem[i] = ${h("i")}; } else { smem[i] = vec2<f32>(0.0); }
    }
    workgroupBarrier();
    for (var k = local_idx + 1u; k < ${v}; k += ${Fe}u) {
      let h = smem[k];
      smem[${n}u - k] = vec2<f32>(h.x, -h.y);
    }
    workgroupBarrier();`}else b=`
    let loadCount = min(uniforms.signalLength, ${n}u);
    for (var i = local_idx; i < ${n}u; i += ${Fe}u) {
      if (i < loadCount) { smem[i] = ${h("i")}; } else { smem[i] = vec2<f32>(0.0); }
    }
    workgroupBarrier();`;let{code:g,resultOffset:y}=zl(l,n,u),_=d===1?`smem[${y}u + i]`:`smem[${y}u + i] * ${tt(d)}`,w=o===2?m.setByOffset("off + 1u",`${a}(v.y)`):"";return`
  ${vs(p,f,m)}
  var<workgroup> smem: array<vec2<f32>, ${2*Zt}>;
  fn cmul(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
  }
  ${p.mainStart(Fe)}
    let row = workgroup_index;
    if (row >= uniforms.batch) { return; }
    let outer = row / uniforms.inner;
    let within = row % uniforms.inner;
    let inBase = (outer * uniforms.signalLength * uniforms.inner + within) * ${r}u;
    let outBase = (outer * uniforms.outputLength * uniforms.inner + within) * ${o}u;
    ${b}
${g}    for (var i = local_idx; i < uniforms.outputLength; i += ${Fe}u) {
      let v = ${_};
      let off = outBase + i * uniforms.inner * ${o}u;
      ${m.setByOffset("off",`${a}(v.x)`)}
      ${w}
    }
  }`};return{name:"DFT",shaderCache:{hint:ws(e,"fft"),inputDependencies:["type"]},getShaderSource:c,getRunData:()=>({outputs:[{dims:e.outputDims,dataType:t}],programUniforms:$s(e),dispatchGroup:{x:e.batch}})}},Ol=e=>{let{dataType:t,length:n,inputComponents:r,outputComponents:o,inverse:i,onesided:s}=e,a=de(t),u=i?1:-1,d=i?1/n:1,l=c=>{let p=T("x",t,[1]),f=A("y",t,[1]),m=_=>{let w=`inBase + (${_}) * uniforms.inner * ${r}u`,$=`f32(${p.getByOffset(w)})`,v=r===2?`f32(${p.getByOffset(`${w} + 1u`)})`:"0.0";return`vec2<f32>(${$}, ${v})`},h=i&&s?`fn spectrum(inBase: u32, k: u32) -> vec2<f32> {
    let provided = min(uniforms.signalLength, ${Math.floor(n/2)+1}u);
    if (k < provided) { return ${m("k")}; }
    let m = ${n}u - k;
    if (m < provided) {
      let h = ${m("m")};
      return vec2<f32>(h.x, -h.y);
    }
    return vec2<f32>(0.0, 0.0);
  }`:`fn spectrum(inBase: u32, n: u32) -> vec2<f32> {
    if (n < uniforms.signalLength) { return ${m("n")}; }
    return vec2<f32>(0.0, 0.0);
  }`,b=`
      let angle = ${tt(u*Nn)} * f32(knMod) / ${tt(n)};
      acc += cmul(spectrum(inBase, n), vec2<f32>(cos(angle), sin(angle)));
      knMod += k;
      if (knMod >= ${n}u) { knMod -= ${n}u; }`,g=o===2?f.setByOffset("off + 1u",`${a}(v.y)`):"",y=d===1?"acc":`acc * ${tt(d)}`;return`
  ${vs(c,p,f)}
  fn cmul(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
  }
  ${h}
  ${c.mainStart(Fe)}
    let row = workgroup_index;
    if (row >= uniforms.batch) { return; }
    let outer = row / uniforms.inner;
    let within = row % uniforms.inner;
    let inBase = (outer * uniforms.signalLength * uniforms.inner + within) * ${r}u;
    let outBase = (outer * uniforms.outputLength * uniforms.inner + within) * ${o}u;
    for (var k = local_idx; k < uniforms.outputLength; k += ${Fe}u) {
      var acc = vec2<f32>(0.0, 0.0);
      var knMod = 0u;
      for (var n = 0u; n < ${n}u; n++) {${b}
      }
      let v = ${y};
      let off = outBase + k * uniforms.inner * ${o}u;
      ${f.setByOffset("off",`${a}(v.x)`)}
      ${g}
    }
  }`};return{name:"DFT",shaderCache:{hint:ws(e,"direct"),inputDependencies:["type"]},getShaderSource:l,getRunData:()=>({outputs:[{dims:e.outputDims,dataType:t}],programUniforms:$s(e),dispatchGroup:{x:e.batch}})}},bs=e=>{if(!e||e.dataType===0)return;if(x.size(e.dims)!==1)throw new Error("DFT optional scalar inputs must have exactly 1 element.");if(e.dataType===6)return e.getInt32Array()[0];let t=Number(e.getBigInt64Array()[0]);if(!Number.isSafeInteger(t))throw new Error("DFT optional scalar inputs are out of JavaScript safe integer range.");return t},Ml=e=>{if(!e||e.length<1)throw new Error("DFT requires at least 1 input.");let t=e[0].dims;if(t.length<2)throw new Error("DFT input must have at least 2 dimensions.");let n=t[t.length-1];if(n!==1&&n!==2)throw new Error("DFT input's innermost dimension must be 1 (real) or 2 (complex).")},xs=(e,t)=>{Ml(e.inputs);let n=e.inputs[0],r=n.dims.length,o=t.inverse!==0,i=t.onesided!==0,s=bs(e.inputs[1]);if(s!==void 0&&s<=0)throw new Error("dft_length must be greater than zero.");let a=x.normalizeAxis(bs(e.inputs[2])??t.axis,r);if(a===r-1)throw new Error("DFT axis must refer to a signal dimension, not the innermost (real/imaginary) dimension.");if(o&&i&&n.dims[r-1]!==2)throw new Error("Inverse one-sided DFT (IRFFT) requires complex-valued input (innermost dimension 2).");let u=Dl(n,a,o,i,s);if(u.length<=0)throw new Error(`Invalid DFT length: ${u.length}`);let l=u.length<=Zt&&_s(u.length)!==void 0?Bl(u):Ol(u);e.compute(l,{inputs:[0]})},Ss=e=>G({axis:e.axis??1,inverse:e.inverse??0,onesided:e.onesided??0})});var Wn,Qt,Is,Ul,Rl,Gn,Hn,Cs,Vl,As,ks,Es=E(()=>{H();j();ue();Q();Wn="[a-zA-Z]|\\.\\.\\.",Qt="("+Wn+")+",Is="^"+Qt+"$",Ul="("+Qt+",)*"+Qt,Rl="^"+Ul+"$",Gn=class{constructor(t=-1){this.symbolToIndices=new Map,this.inputIndex=t}addSymbol(t,n){let r=this.symbolToIndices.get(t);r===void 0?r=[n]:r.push(n),this.symbolToIndices.set(t,r)}symbolToIndices;inputIndex},Hn=class{constructor(t,n){this.equation=n;this.hasEllipsis=!1,this.symbolToInfo=new Map,this.lhs=new Array,this.outputDims=[];let[r,o]=n.includes("->")?n.split("->",2):[n,""];if(!r.match(RegExp(Rl)))throw new Error("Invalid LHS term");if(r.split(",").forEach((a,u)=>{let d=t[u].dims.slice();if(!a.match(RegExp(Is)))throw new Error("Invalid LHS term");let l=this.processTerm(a,!0,d,u);this.lhs.push(l)}),o==="")o+=[...this.symbolToInfo.entries()].filter(([a,u])=>u.count===1||a==="...").map(([a])=>a).join("");else if(!o.match(RegExp(Qt)))throw new Error("Invalid RHS");o.match(RegExp(Wn,"g"))?.forEach(a=>{if(a==="...")this.outputDims=this.outputDims.concat(this.ellipsisDims);else{let u=this.symbolToInfo.get(a);if(u===void 0)throw new Error("Invalid RHS symbol");this.outputDims.push(u.dimValue)}}),this.rhs=this.processTerm(o,!1,this.outputDims)}equation;addSymbol(t,n,r){let o=this.symbolToInfo.get(t);if(o!==void 0){if(o.dimValue!==n&&o.count!==1)throw new Error("Dimension mismatch");o.count++,o.inputIndices.push(r)}else o={count:1,dimValue:n,inputIndices:[r]};this.symbolToInfo.set(t,o)}processTerm(t,n,r,o=-1){let i=r.length,s=!1,a=[],u=0;if(!t.match(RegExp(Is))&&!n&&t!=="")throw new Error("Invalid LHS term");let d=t.match(RegExp(Wn,"g")),l=new Gn(o);return d?.forEach((c,p)=>{if(c==="..."){if(s)throw new Error("Only one ellipsis is allowed per input term");s=!0;let f=i-d.length+1;if(f<0)throw new Error("Ellipsis out of bounds");if(a=r.slice(u,u+f),this.hasEllipsis){if(this.ellipsisDims.length!==a.length||this.ellipsisDims.toString()!==a.toString())throw new Error("Ellipsis dimensions mismatch")}else if(n)this.hasEllipsis=!0,this.ellipsisDims=a;else throw new Error("Ellipsis must be specified in the LHS");for(let m=0;m<a.length;m++){let h=String.fromCharCode(48+m);l.addSymbol(h,p+m),this.addSymbol(h,r[u++],o)}}else l.addSymbol(c,p+(this.hasEllipsis?this.ellipsisDims.length-1:0)),this.addSymbol(c,r[u++],o)}),l}symbolToInfo;hasEllipsis;ellipsisDims;lhs;rhs;outputDims},Cs=e=>e+"_max",Vl=(e,t,n,r)=>{let i=e.map(l=>l.length).map((l,c)=>T(`input${c}`,t,l)),s=x.size(r),a=A("output",t,r.length),u=[...n.symbolToInfo.keys()].filter(l=>!n.rhs.symbolToIndices.has(l)),d=l=>{let c=[],p="var prod = 1.0;",f="var sum = 0.0;",m="sum += prod;",h=[],b=[],g=[],y=[],_=n.symbolToInfo.size===n.rhs.symbolToIndices.size;n.symbolToInfo.forEach(($,v)=>{if(n.rhs.symbolToIndices.has(v)){let I=n.rhs.symbolToIndices.get(v)?.[0];I!==void 0&&n.lhs.forEach((S,C)=>{if($.inputIndices.includes(C)){let P=S.symbolToIndices.get(v);if(P===void 0)throw new Error("Invalid symbol error");P.forEach(R=>{c.push(`${i[C].indicesSet(`input${C}Indices`,R,a.indicesGet("outputIndices",I))}`)})}})}else n.lhs.forEach((I,S)=>{if($.inputIndices.includes(S)){let C=I.symbolToIndices.get(v);if(C===void 0)throw new Error("Invalid symbol error");C.forEach(P=>{h.push(`${i[S].indicesSet(`input${S}Indices`,P,`${v}`)}`)}),y.push(`prod *= ${i[S].getByIndices(`input${S}Indices`)};`)}}),b.push(`for(var ${v}: u32 = 0; ${v} < uniforms.${Cs(v)}; ${v}++) {`),g.push("}")});let w=_?[...c,`let sum = ${i.map(($,v)=>$.getByIndices(`input${v}Indices`)).join(" * ")};`]:[...c,f,...b,...h,p,...y,m,...g];return`
            ${l.registerUniforms(u.map($=>({name:`${Cs($)}`,type:"u32"}))).registerUniform("outputSize","u32").declareVariables(...i,a)}

            ${l.mainStart()}
            ${l.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
            var outputIndices = ${a.offsetToIndices("global_idx")};
            ${i.map(($,v)=>`var input${v}Indices: ${i[v].type.indices};`).join(`
`)}
            ${w.join(`
`)};
            ${a.setByOffset("global_idx","sum")};
          }`};return{name:"Einsum",shaderCache:{hint:n.equation,inputDependencies:e.map(()=>"rank")},getRunData:()=>{let l=u.filter(p=>n.symbolToInfo.has(p)).map(p=>({type:12,data:n.symbolToInfo.get(p)?.dimValue||0}));l.push({type:12,data:s});let c=e.map((p,f)=>[...z(p)]).reduce((p,f)=>p.concat(f),l);return c.push(...z(r)),{outputs:[{dims:r,dataType:t}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:c}},getShaderSource:d}},As=(e,t)=>{let n=new Hn(e.inputs,t.equation),r=n.outputDims,o=e.inputs.map((i,s)=>i.dims);e.compute(Vl(o,e.inputs[0].dataType,n,r))},ks=e=>{let t=e.equation.replace(/\s+/g,"");return G({equation:t})}});var Ll,Ps,Nl,Wl,zs,Ds=E(()=>{H();j();Q();Ll=e=>{if(!e||e.length!==2)throw new Error("Expand requires 2 input.");let t=e[0].dims,n=Array.from(e[1].getBigInt64Array(),Number),r=n.length<t.length?0:n.length-t.length,o=t.length<n.length?0:t.length-n.length;for(;r<n.length&&o<t.length;++r,++o)if(n[r]!==t[o]&&n[r]!==1&&t[o]!==1)throw new Error("Expand requires shape to be broadcastable to input")},Ps=(e,t)=>{let n=e.length-t.length,r=[];for(let o=0;o<n;++o)r.push(e[o]);for(let o=0;o<t.length;++o)r.push(t[o]===1?e[o+n]:t[o]);return r},Nl=(e,t)=>e.length>t.length?Ps(e,t):Ps(t,e),Wl=e=>{let t=e[0].dims,n=Array.from(e[1].getBigInt64Array(),Number),r=Nl(t,n),o=e[0].dataType,i=o===9||x.size(t)===1,s=o===9||t.length>0&&t[t.length-1]%4===0?4:1,a=i||r.length>0&&r[r.length-1]%4===0?4:1,u=Math.ceil(x.size(r)/a),d=c=>{let p=T("input",o,t.length,s),f=A("output",o,r.length,a),m;if(o===9){let h=(b,g,y="")=>`
          let outputIndices${g} = ${f.offsetToIndices(`outputOffset + ${g}u`)};
          let offset${g} = ${p.broadcastedIndicesToOffset(`outputIndices${g}`,f)};
          let index${g} = offset${g} / 4u;
          let component${g} = offset${g} % 4u;
          ${b}[${g}] = ${y}(${p.getByOffset(`index${g}`)}[component${g}]);
        `;m=`
        let outputOffset = global_idx * ${a};
        var data = vec4<u32>(0);
        ${h("data",0,"u32")}
        ${h("data",1,"u32")}
        ${h("data",2,"u32")}
        ${h("data",3,"u32")}
        ${f.setByOffset("global_idx","data")}
      }`}else m=`
        let outputIndices = ${f.offsetToIndices(`global_idx * ${a}`)};
        let inputOffset = ${p.broadcastedIndicesToOffset("outputIndices",f)};
        let data = ${f.type.value}(${p.getByOffset(`inputOffset / ${s}`)});
        ${f.setByOffset("global_idx","data")}
      }`;return`
    ${c.registerUniform("vec_size","u32").declareVariables(p,f)}
    ${c.mainStart()}
    ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
    ${m}`},l=[{type:12,data:u},...z(t,r)];return{name:"Expand",shaderCache:{hint:`${r.length};${s}${a}`,inputDependencies:["rank"]},getShaderSource:d,getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:l})}},zs=e=>{Ll(e.inputs),e.compute(Wl(e.inputs),{inputs:[0]})}});var Gl,Bs,Os=E(()=>{H();j();Q();Wt();Gl=e=>{let t=e[0].dataType,n=x.size(e[0].dims),r=x.size(e[1].dims),o=r%4===0,i=s=>{let a=T("x",t,[1],4),u=T("bias",t,[1],4),d=A("y",t,[1],4),l=[{name:"output_vec_size",type:"u32"},{name:"bias_size",type:"u32"}],c=f=>`
      let bias${f}_offset: u32 = (global_idx * 4 + ${f}) % uniforms.bias_size;
      let bias${f} = ${u.getByOffset(`bias${f}_offset / 4`)}[bias${f}_offset % 4];`,p=o?`
      let bias = ${u.getByOffset("global_idx % (uniforms.bias_size / 4)")};`:`${c(0)}${c(1)}${c(2)}${c(3)}
      let bias = ${a.type.value}(bias0, bias1, bias2, bias3);`;return`${s.registerUniforms(l).declareVariables(a,u,d)}

    ${Dn(de(t))}

    ${s.mainStart(Je)}
      ${s.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_vec_size")}

      let x = ${a.getByOffset("global_idx")};
      ${p}
      let x_in = x + bias;
      ${d.setByOffset("global_idx",Bn("x_in"))}
    }`};return{name:"FastGeluWithBias",shaderCache:{hint:`${o}`,inputDependencies:["type","type"]},getShaderSource:i,getRunData:s=>({outputs:[{dims:s[0].dims,dataType:s[0].dataType}],programUniforms:[{type:12,data:Math.ceil(n/4)},{type:12,data:r}],dispatchGroup:{x:Math.ceil(n/Je/4)}})}},Bs=e=>{e.inputs.length<2||x.size(e.inputs[1].dims)===0?wi(e):e.compute(Gl(e.inputs))}});var Hl,ql,Ms,Us,Rs=E(()=>{H();j();ue();Q();Hl=e=>{if(!e||e.length!==2)throw new Error("Gather requires 2 inputs.")},ql=(e,t)=>{let n=e[0].dims,r=e[1].dims,o=n.length,i=x.normalizeAxis(t.axis,o),s=n.slice(0);s.splice(i,1,...r);let a=n[i],u=e[0].dataType===9?4:1,d=Math.ceil(x.size(s)/u),l=[{type:12,data:d},{type:6,data:a},{type:12,data:i},...z(e[0].dims,e[1].dims,s)],c=p=>{let f=T("data",e[0].dataType,e[0].dims.length,u),m=T("inputIndices",e[1].dataType,e[1].dims.length),h=A("output",e[0].dataType,s.length,u),b=y=>{let _=r.length,w=`var indicesIndices${y}  = ${m.type.indices}(0);`;for(let $=0;$<_;$++)w+=`${_>1?`indicesIndices${y}[${$}]`:`indicesIndices${y}`} = ${s.length>1?`outputIndices${y}[uniforms.axis + ${$}]`:`outputIndices${y}`};`;w+=`
          var idx${y} = ${m.getByIndices(`indicesIndices${y}`)};
          if (idx${y} < 0) {
            idx${y} = idx${y} + uniforms.axisDimLimit;
          }
          var dataIndices${y} : ${f.type.indices};
        `;for(let $=0,v=0;$<o;$++)$===i?(w+=`${o>1?`dataIndices${y}[${$}]`:`dataIndices${y}`} = u32(idx${y});`,v+=_):(w+=`${o>1?`dataIndices${y}[${$}]`:`dataIndices${y}`} = ${s.length>1?`outputIndices${y}[${v}]`:`outputIndices${y}`};`,v++);return w},g;if(e[0].dataType===9){let y=(_,w,$="")=>`
          let outputIndices${w} = ${h.offsetToIndices(`outputOffset + ${w}u`)};
          ${b(w)};
          let offset${w} = ${f.indicesToOffset(`dataIndices${w}`)};
          let index${w} = offset${w} / 4u;
          let component${w} = offset${w} % 4u;
          ${_}[${w}] = ${$}(${f.getByOffset(`index${w}`)}[component${w}]);
        `;g=`
        let outputOffset = global_idx * ${u};
        var value = vec4<u32>(0);
        ${y("value",0,"u32")}
        ${y("value",1,"u32")}
        ${y("value",2,"u32")}
        ${y("value",3,"u32")}
        ${h.setByOffset("global_idx","value")}
      `}else g=`
      let outputIndices = ${h.offsetToIndices("global_idx")};
      ${b("")};
      let value = ${f.getByIndices("dataIndices")};
      ${h.setByOffset("global_idx","value")};
      `;return`
      ${p.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(f,m,h)}
      ${p.mainStart()}
        ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        ${g}
      }`};return{name:"Gather",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:s,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:l}),getShaderSource:c}},Ms=e=>G({axis:e.axis}),Us=(e,t)=>{let n=e.inputs;Hl(n),e.compute(ql(e.inputs,t))}});var Fl,Vs,Ls,Ns=E(()=>{H();j();Q();Fl=(e,t,n,r,o,i,s,a,u)=>{let d=[{type:12,data:i},{type:12,data:r},{type:12,data:o},{type:12,data:n},{type:12,data:s},{type:12,data:a},{type:12,data:u}],l=[i];d.push(...z(t.dims,l));let c=p=>{let f=T("indices_data",t.dataType,t.dims.length),m=A("input_slice_offsets_data",12,1,1),h=[f,m],b=[{name:"output_size",type:"u32"},{name:"batch_dims",type:"u32"},{name:"input_dims",type:"u32",length:o.length},{name:"sizes_from_slice_dims_data",type:"u32",length:n.length},{name:"num_slices_per_batch",type:"u32"},{name:"input_batch_stride",type:"u32"},{name:"num_slice_dims",type:"u32"}];return`
  ${p.registerUniforms(b).declareVariables(...h)}
  ${p.mainStart()}
    ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let batch_idx = global_idx / uniforms.num_slices_per_batch;
    let base_offset = batch_idx * uniforms.input_batch_stride;

    let slice_indices_base_offset = global_idx * uniforms.num_slice_dims;
    var relative_slice_offset = 0;
    for (var dim_idx = 0u; dim_idx < uniforms.num_slice_dims; dim_idx ++) {
      var index = i32(indices_data[dim_idx + slice_indices_base_offset].x);
      let input_dim_idx = uniforms.batch_dims + dim_idx;
      if (index < 0) {
        ${o.length===1?"index += i32(uniforms.input_dims);":"index += i32(uniforms.input_dims[input_dim_idx]);"}
      }
      ${n.length===1?"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data);":"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data[dim_idx]);"}
    }

    input_slice_offsets_data[global_idx] =  base_offset + u32(relative_slice_offset);
  }`};return e.compute({name:"computeSliceOffsets",shaderCache:{hint:`${o.length}_${n.length}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:l,dataType:e.inputs[1].dataType}],dispatchGroup:{x:Math.ceil(i/64)},programUniforms:d}),getShaderSource:c},{inputs:[t],outputs:[-1]})[0]},Vs=(e,t)=>{let n=e.inputs,r=n[0].dims,o=n[0].dataType,i=n[1].dims,s=i[i.length-1],a=x.sizeToDimension(i,i.length-1),u=x.sizeFromDimension(r,t.batchDims+s),d=x.sizeToDimension(r,t.batchDims),l=x.sizeFromDimension(r,t.batchDims),c=a/d,p=new Array(s),f=u;for(let w=0;w<s;++w)p[s-1-w]=f,f*=r[t.batchDims+s-1-w];let m=Fl(e,n[1],p,t.batchDims,r,a,c,l,s),h=t.batchDims+s;if(h>r.length)throw new Error("last dimension of indices must not be larger than rank of input tensor");let b=i.slice(0,-1).concat(r.slice(h)),g=x.size(b),y=[{type:12,data:g},{type:12,data:u},...z(n[0].dims,m.dims,b)],_=w=>{let $=T("data",n[0].dataType,n[0].dims.length),v=T("slice_offsets",12,m.dims.length),I=A("output",n[0].dataType,b.length);return`
          ${w.registerUniform("output_size","u32").registerUniform("slice_size","u32").declareVariables($,v,I)}
            ${w.mainStart()}
            ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let slice_offset = slice_offsets[global_idx / uniforms.slice_size];
          output[global_idx] = data[u32(slice_offset) + global_idx % uniforms.slice_size];
        }`};e.compute({name:"GatherND",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:b,dataType:o}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:y}),getShaderSource:_},{inputs:[n[0],m]})},Ls=e=>({batchDims:e.batch_dims,cacheKey:""})});var Kl,jl,Ws,Gs,Hs=E(()=>{H();j();ue();Q();Kl=(e,t)=>{if(e.length<3||e.length>4)throw new Error("GatherBlockQuantized requires 3 or 4 inputs.");let n=x.normalizeAxis(t.quantizeAxis,e[0].dims.length),r=t.blockSize,o=e[0],i=e[2],s=e.length===4?e[3]:void 0;if(i.dims.length!==o.dims.length||!o.dims.map((a,u)=>u===n?Math.ceil(a/r)===i.dims[u]:a===i.dims[u]).reduce((a,u)=>a&&u,!0))throw new Error("Scales must have the same rank as the input tensor and the dims should match except on gatherAxis.");if(s){if(s.dataType!==o.dataType)throw new Error("Zero point must have the same data type as the input tensor.");if(s.dims.length!==i.dims.length||!s.dims.map((a,u)=>a===i.dims[u]).reduce((a,u)=>a&&u,!0))throw new Error("Zero point must have the same rank as the input tensor and the dims should match except on quantizeAxis.")}},jl=(e,t)=>{let n=e[0].dims,r=e[1].dims,o=n.length,i=x.normalizeAxis(t.gatherAxis,o),s=x.normalizeAxis(t.quantizeAxis,o),a=n.slice(0);a.splice(i,1,...r);let u=x.size(a),d=e[2].dataType,c=e[0].dataType===22,p=[{type:12,data:u},{type:12,data:s},{type:12,data:i},{type:12,data:t.blockSize},...z(...e.map((m,h)=>m.dims),a)],f=m=>{let h=T("data",e[0].dataType,e[0].dims.length),b=T("inputIndices",e[1].dataType,e[1].dims.length),g=T("scales",e[2].dataType,e[2].dims.length),y=e.length>3?T("zeroPoint",e[3].dataType,e[3].dims.length):void 0,_=A("output",d,a.length),w=[h,b,g];y&&w.push(y);let $=[{name:"output_size",type:"u32"},{name:"quantize_axis",type:"u32"},{name:"gather_axis",type:"u32"},{name:"block_size",type:"u32"}];return`
        ${m.registerUniforms($).declareVariables(...w,_)}
        ${m.mainStart()}
        let output_indices = ${_.offsetToIndices("global_idx")};
        var indices_indices = ${b.type.indices}(0);
        ${r.length>1?`
          for (var i: u32 = 0; i < ${r.length}; i++) {
            let index = ${_.indicesGet("output_indices","uniforms.gather_axis + i")};
            ${b.indicesSet("indices_indices","i","index")};
          }`:`indices_indices = ${_.indicesGet("output_indices","uniforms.gather_axis")};`};
        var data_indices = ${h.type.indices}(0);
        for (var i: u32 = 0; i < uniforms.gather_axis; i++) {
          let index = ${_.indicesGet("output_indices","i")};
          ${h.indicesSet("data_indices","i","index")};
        }
        var index_from_indices = ${b.getByIndices("indices_indices")};
        if (index_from_indices < 0) {
          index_from_indices += ${n[i]};
        }
        ${h.indicesSet("data_indices","uniforms.gather_axis","u32(index_from_indices)")};
        for (var i = uniforms.gather_axis + 1; i < ${a.length}; i++) {
          let index = ${_.indicesGet("output_indices",`i + ${r.length} - 1`)};
          ${h.indicesSet("data_indices","i","index")};
        }
        let data_offset = ${h.indicesToOffset("data_indices")};
        let data_index = data_offset % 8;
        // Convert 4-bit packed data to 8-bit packed data.
        let packed_4bit_quantized_data = ${h.getByOffset("data_offset / 8")};
        let packed_8bit_quantized_data = (packed_4bit_quantized_data >> (4 * (data_index % 2))) & 0x0f0f0f0f;
        let quantized_data_vec = ${c?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_quantized_data));
        let quantized_data = quantized_data_vec[data_index / 2];
        var scale_indices = data_indices;
        let quantize_axis_index = ${g.indicesGet("data_indices","uniforms.quantize_axis")} / uniforms.block_size;
        ${g.indicesSet("scale_indices","uniforms.quantize_axis","quantize_axis_index")};
        var scale = ${g.getByIndices("scale_indices")};
        ${y?`
              let zero_point_indices = scale_indices;
              let zero_point_offset = ${y.indicesToOffset("zero_point_indices")};
              let zero_point_index = zero_point_offset % 8;
              let packed_4bit_zero_points = ${y.getByOffset("zero_point_offset / 8")};
              let packed_8bit_zero_points = (packed_4bit_zero_points >> (4 * (zero_point_index % 2))) & 0x0f0f0f0f;
              let zero_point_vec = ${c?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_zero_points));
              let zero_point = zero_point_vec[zero_point_index / 2];`:"var zero_point = 0"};
        let dequantized_data = ${de(d)}(quantized_data - zero_point) * scale;
        ${_.setByOffset("global_idx","dequantized_data")};
    }`};return{name:"GatherBlockQuantized",shaderCache:{hint:`${t.cacheKey};${e.filter((m,h)=>h!==1).map(m=>m.dims.join("_")).join(";")}`,inputDependencies:Array.from({length:e.length},(m,h)=>"rank")},getRunData:()=>({outputs:[{dims:a,dataType:d}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:p}),getShaderSource:f}},Ws=(e,t)=>{let n=e.inputs;Kl(n,t),e.compute(jl(e.inputs,t))},Gs=e=>G({blockSize:e.blockSize,gatherAxis:e.gatherAxis,quantizeAxis:e.quantizeAxis})});var Zl,Ql,qs,Fs,Ks=E(()=>{H();j();ue();Q();Zl=e=>{if(!e||e.length!==2)throw new Error("GatherElements requires 2 inputs.");if(e[0].dims.length<1)throw new Error("GatherElements requires that the data input be rank >= 1.");if(e[0].dims.length!==e[1].dims.length)throw new Error(`GatherElements requires that the data input and
                     indices input tensors be of same rank.`)},Ql=(e,t)=>{let n=e[0].dims,r=e[0].dataType,o=n.length,i=e[1].dims,s=e[1].dataType,a=x.normalizeAxis(t.axis,o),u=n[a],d=i.slice(0),l=x.size(d),c=T("input",r,o),p=T("indicesInput",s,i.length),f=A("output",r,d.length),m=[{type:12,data:l},{type:6,data:u},{type:12,data:a}];return m.push(...z(n,i,d)),{name:"GatherElements",shaderCache:{inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:d,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:m}),getShaderSource:g=>`
      ${g.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(c,p,f)}
      ${g.mainStart()}
      ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

      let outputIndices = ${f.offsetToIndices("global_idx")};

      var idx = ${p.getByOffset("global_idx")};
      if (idx < 0) {
        idx = idx + uniforms.axisDimLimit;
      }
      var inputIndices = ${c.type.indices}(outputIndices);
      ${c.indicesSet("inputIndices","uniforms.axis","u32(idx)")};
      let value = ${c.getByIndices("inputIndices")};

      ${f.setByOffset("global_idx","value")};
  }`}},qs=e=>G({axis:e.axis}),Fs=(e,t)=>{let n=e.inputs;Zl(n),e.compute(Ql(e.inputs,t))}});function Xt(e,t=null){let n=e.inputs,[r,o]=n;if(!globalThis.__dreamMatrixAvailable||r.dataType!==10||o.dataType!==10||t?.transA||t&&t.alpha!==1||t&&t.beta!==1)return!1;let i=r.dims,s=o.dims,a=!!t?.transB;if(i.length<2||s.length<2)return!1;let u=V=>V.reduce((F,_e)=>F*_e,1),d=u(i.slice(0,-2)),l=u(s.slice(0,-2)),c=Math.max(i.length,s.length),p=[...Array(c-i.length).fill(1),...i],f=[...Array(c-s.length).fill(1),...s];if(p.slice(0,-2).some((V,F)=>V!==f[F]&&V!==1&&f[F]!==1))return!1;let m=p.slice(0,-2).map((V,F)=>Math.max(V,f[F])),h=u(m);if(h!==Math.max(d,l)||d!==l&&d!==1&&l!==1)return!1;let b=i.at(-2),g=i.at(-1),y=s.at(a?-2:-1);if(b<8||g%8||y<32||g!==s.at(a?-1:-2)||h===1&&(y%32||g*y<640*640))return!1;let _=n[2];if(_&&(_.dims.length!==1||_.dims[0]!==y||_.dataType!==10))return!1;let w=t?[b,y]:[...m,b,y],$=b>=48?3:1,v=y>=64&&y%64===0?8:4,I=Math.ceil(b/($*8))*$*8,S=Math.ceil(y/(v*8))*v*8;if(a&&S!==y)return!1;let C=Math.min(32,Math.max(1,2**Math.round(Math.log2(1024/(h*I/($*8)*S/(v*8)))),2**Math.ceil(Math.log2(g/2048)))),P=Math.ceil(g/C/8)*8,R=!_&&I===b&&S===y&&C===1,O=JSON.stringify([w,g,a,C,$,v,!!_,d,l]),N=r;I!==b&&(N=e.compute({name:"DreamMatrixPad",shaderCache:{hint:O},getShaderSource:()=>`
  @group(0) @binding(0)var<storage,read>source:array<f16>;@group(0) @binding(1)var<storage,read_write>out:array<f16>;
  @compute @workgroup_size(128)fn main(@builtin(global_invocation_id)g:vec3u){let i=g.x;if(i>=${d*I*g}u){return;}let batch=i/${I*g}u;let rem=i%${I*g}u;var v=0h;if(rem<${b*g}u){v=source[batch*${b*g}u+rem];}out[i]=v;}
 `,getRunData:()=>({outputs:[{dims:[d,I,g],dataType:10}],dispatchGroup:{x:Math.ceil(d*I*g/128)}})},{inputs:[r],outputs:[-1]})[0]);let q=o;S!==y&&(q=e.compute({name:"DreamMatrixPadColumns",shaderCache:{hint:O},getShaderSource:()=>`
  @group(0) @binding(0)var<storage,read>source:array<f16>;@group(0) @binding(1)var<storage,read_write>out:array<f16>;
  @compute @workgroup_size(128)fn main(@builtin(global_invocation_id)g:vec3u){let i=g.x;if(i>=${l*g*S}u){return;}let n=i%${S}u;var v=0h;if(n<${y}u){v=source[(i/${S}u)*${y}u+n];}out[i]=v;}
 `,getRunData:()=>({outputs:[{dims:[l,g,S],dataType:10}],dispatchGroup:{x:Math.ceil(l*g*S/128)}})},{inputs:[o],outputs:[-1]})[0]);let B="",M="",W="",L="";for(let V=0;V<$;V++){M+=`let a${V}=subgroupMatrixLoad<subgroup_matrix_left<f16,8,8>>(&a,abase+(g.y*${$*8}u+${V*8}u)*${g}u+k,false,${g}u);`;for(let F=0;F<v;F++)B+=`var c${V}_${F}=subgroup_matrix_result<f16,8,8>(0h);`,W+=`c${V}_${F}=subgroupMatrixMultiplyAccumulate(a${V},b${F},c${V}_${F});`,L+=`subgroupMatrixStore(&c,g.z*${I*S}u+(g.y*${$*8}u+${V*8}u)*${S}u+g.x*${v*8}u+${F*8}u,c${V}_${F},false,${S}u);`}for(let V=0;V<v;V++)M+=`let b${V}=subgroupMatrixLoad<subgroup_matrix_right<f16,8,8>>(&b,bbase+${a?`(g.x*${v*8}u+${V*8}u)*${g}u+k`:`k*${S}u+g.x*${v*8}u+${V*8}u`},${a},${a?g:S}u);`;let K=e.compute({name:"DreamMatrixSplitLinear",shaderCache:{hint:O},getShaderSource:()=>`enable chromium_experimental_subgroup_matrix;
  @group(0) @binding(0)var<storage,read>a:array<f16>;@group(0) @binding(1)var<storage,read>b:array<f16>;@group(0) @binding(2)var<storage,read_write>c:array<f16>;
  @compute @workgroup_size(32)fn main(@builtin(workgroup_id)g:vec3u){let batch=g.z/${C}u;let part=g.z%${C}u;let abase=${d===1?"0u":`batch*${I*g}u`};let bbase=${l===1?"0u":`batch*${g*S}u`};${B}for(var k=part*${P}u;k<min(${g}u,(part+1u)*${P}u);k+=8u){${M}${W}}${L}}
 `,getRunData:()=>({outputs:[{dims:R?w:[h,C,I,S],dataType:10}],dispatchGroup:{x:S/(v*8),y:I/($*8),z:h*C}})},{inputs:[N,q],outputs:[R?0:-1]})[0];return R||e.compute({name:"DreamLinearReduction",shaderCache:{hint:O},getShaderSource:()=>`
  @group(0) @binding(0)var<storage,read>partials:array<f16>;
  ${_?"@group(0) @binding(1)var<storage,read>bias:array<f16>;":""}
  @group(0) @binding(${_?2:1})var<storage,read_write>out:array<f16>;
  @compute @workgroup_size(128)fn main(@builtin(global_invocation_id)g:vec3u){let i=g.x+g.y*8388480u;if(i>=${h*b*y}u){return;}let batch=i/${b*y}u;let m=(i/${y}u)%${b}u;let n=i%${y}u;var sum=0.;for(var k=0u;k<${C}u;k++){sum+=f32(partials[((batch*${C}u+k)*${I}u+m)*${S}u+n]);}${_?"sum+=f32(bias[n]);":""}out[i]=f16(sum);}
 `,getRunData:()=>({outputs:[{dims:w,dataType:10}],dispatchGroup:{x:Math.min(65535,Math.ceil(h*b*y/128)),y:Math.ceil(h*b*y/8388480)}})},{inputs:_?[K,_]:[K]}),!0}var qn=E(()=>{});var Xl,Yl,js,Zs,Qs=E(()=>{qn();H();j();Q();Xl=e=>{if(!e)throw new Error("Input is missing");if(e.length<2||e.length>3)throw new Error("Invaid input number.");if(e.length===3&&e[2].dims.length>2)throw new Error("Invalid input shape of C");if(e[0].dataType!==e[1].dataType||e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("Input types are mismatched")},Yl=(e,t)=>{let n=e[0].dims.slice(),r=e[1].dims.slice(),[o,i,s]=kt.getShapeOfGemmResult(n,t.transA,r,t.transB,e.length===3?e[2].dims:void 0),a=[o,i];if(!a)throw new Error("Can't use gemm on the given tensors");let u=16,d=Math.ceil(i/u),l=Math.ceil(o/u),c=!0,p=x.size(a),f=[{type:12,data:c?d:p},{type:12,data:o},{type:12,data:i},{type:12,data:s},{type:1,data:t.alpha},{type:1,data:t.beta}],m=["type","type"];e.length===3&&(f.push(...z(e[2].dims)),m.push("rank")),f.push(...z(a));let h=g=>{let y="";t.transA&&t.transB?y="value += a[k * uniforms.M + m] * b[n * uniforms.K + k];":t.transA&&!t.transB?y="value += a[k * uniforms.M + m] * b[k * uniforms.N + n];":!t.transA&&t.transB?y="value += a[m * uniforms.K + k] * b[n * uniforms.K + k];":!t.transA&&!t.transB&&(y="value += a[m * uniforms.K + k] * b[k * uniforms.N + n];");let _=t.alpha===1?"":"value *= uniforms.alpha;",w=T("a",e[0].dataType,e[0].dims),$=T("b",e[1].dataType,e[1].dims),v=w.type.value,I=null,S=[w,$];e.length===3&&(I=T("c",e[2].dataType,e[2].dims.length),S.push(I));let C=A("output",e[0].dataType,a.length);S.push(C);let P=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}];return`
  ${g.registerUniforms(P).declareVariables(...S)}

  ${g.mainStart()}
    ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let m = global_idx / uniforms.N;
    let n = global_idx % uniforms.N;

    var value = ${v}(0);
    for (var k: u32 = 0u; k < uniforms.K; k++) {
      ${y}
    }

    ${_}
    ${I!=null?`let cOffset = ${I.broadcastedIndicesToOffset("vec2(m, n)",C)}; value += ${v}(uniforms.beta) * ${I.getByOffset("cOffset")};`:""}
    output[global_idx] = value;
  }`},b=g=>{let y=T("a",e[0].dataType,e[0].dims),_=T("b",e[1].dataType,e[1].dims),w=null,$=[y,_];e.length===3&&(w=T("c",e[2].dataType,e[2].dims.length),$.push(w));let v=A("output",e[0].dataType,a.length);$.push(v);let I=[{name:"num_tile_n",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}],S="",C="";t.transA&&t.transB?(C=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${y.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${_.type.value}(0);
      }
      `,S="value += tile_a[k][local_id.y] * tile_b[local_id.x][k];"):t.transA&&!t.transB?(C=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${y.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${_.type.value}(0);
      }
      `,S="value += tile_a[k][local_id.y] * tile_b[k][local_id.x];"):!t.transA&&t.transB?(C=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${y.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${_.type.value}(0);
      }
      `,S="value += tile_a[local_id.y][k] * tile_b[local_id.x][k];"):!t.transA&&!t.transB&&(C=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${y.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${_.type.value}(0);
      }
      `,S="value += tile_a[local_id.y][k] * tile_b[k][local_id.x];");let P=t.alpha===1?"":"value *= uniforms.alpha;";return`
  ${g.registerUniforms(I).declareVariables(...$)}
  var<workgroup> tile_a: array<array<${y.type.storage}, ${u}>, ${u}>;
  var<workgroup> tile_b: array<array<${_.type.storage}, ${u}>, ${u}>;
  ${g.mainStart([u,u,1])}
    let tile_col_start = (workgroup_index % uniforms.num_tile_n) * ${u};
    let tile_row_start = (workgroup_index / uniforms.num_tile_n) * ${u};
    let num_tiles = (uniforms.K - 1) / ${u} + 1;
    var k_start = 0u;
    var value = ${v.type.value}(0);
    for (var t: u32 = 0u; t < num_tiles; t++) {
      ${C}
      k_start = k_start + ${u};
      workgroupBarrier();

      for (var k: u32 = 0u; k < ${u}; k++) {
        ${S}
      }
      workgroupBarrier();
    }

    ${P}
    let m = tile_row_start + local_id.y;
    let n = tile_col_start + local_id.x;
    ${w!=null?`let cOffset = ${w.broadcastedIndicesToOffset("vec2(m, n)",v)}; value += ${v.type.value}(uniforms.beta) * ${w.getByOffset("cOffset")};`:""}
    if (m < uniforms.M && n < uniforms.N) {
      output[m * uniforms.N + n] = value;
    }
  }`};return c?{name:"GemmShared",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:m},getRunData:()=>({outputs:[{dims:a,dataType:e[0].dataType}],dispatchGroup:{x:d*l},programUniforms:f}),getShaderSource:b}:{name:"Gemm",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:m},getRunData:()=>({outputs:[{dims:a,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(p/64)},programUniforms:f}),getShaderSource:h}},js=e=>{let t=e.transA,n=e.transB,r=e.alpha,o=e.beta;return{transA:t,transB:n,alpha:r,beta:o,cacheKey:`${e.transA};${e.transB};${e.alpha===1}`}},Zs=(e,t)=>{Xl(e.inputs),!Xt(e,t)&&e.compute(Yl(e.inputs,t))}});var Ue,Ke,st,at,Jl,ec,tc,nc,rc,oc,ic,sc,Xs,Ys,Js=E(()=>{H();j();ue();Q();[Ue,Ke,st,at]=[0,1,2,3],Jl=e=>{if(e[0].dims.length!==4)throw new Error("only 4-D tensor is supported.");if(e[0].dims.length!==e[1].dims.length)throw new Error("input dimensions must be equal to grid dimensions");if(e[0].dims.length-2!==e[1].dims[e[1].dims.length-1])throw new Error(`last dimension of grid must be equal to ${e[0].dims.length-2}`);if(e[0].dims[0]!==e[1].dims[0])throw new Error("grid batch size must match input batch size")},ec=`
  fn gs_get_cubic_coeffs(x: f32) -> vec4<f32> {
    let cubic_alpha = -0.75f;
    let x_abs = abs(x);
    var coeffs: vec4<f32>;
    coeffs[0] = (((cubic_alpha * (x_abs + 1) - 5 * cubic_alpha) * (x_abs + 1) + 8 * cubic_alpha) * (x_abs + 1) - 4 * cubic_alpha);
    coeffs[1] = (((cubic_alpha + 2) * x_abs - (cubic_alpha + 3)) * x_abs * x_abs + 1);
    coeffs[2] = (((cubic_alpha + 2) * (1 - x_abs) - (cubic_alpha + 3)) * (1 - x_abs) * (1 - x_abs) + 1);
    coeffs[3] = (((cubic_alpha * (2 - x_abs) - 5 * cubic_alpha) * (2 - x_abs) + 8 * cubic_alpha) * (2 - x_abs) - 4 * cubic_alpha);
    return coeffs;
  }
`,tc=e=>`
  fn gs_bicubic_interpolate(p: mat4x4<${e}>, x: f32, y: f32) -> ${e} {
    var v: vec4<f32>;
    var coeffs = gs_get_cubic_coeffs(x);
    for (var i = 0; i < 4; i++) {
      v[i] = coeffs[0] * p[i][0] + coeffs[1] * p[i][1] + coeffs[2] * p[i][2] + coeffs[3] * p[i][3];
    }
    coeffs = gs_get_cubic_coeffs(y);
    let pixel = ${e}(coeffs[0] * v[0] + coeffs[1] * v[1] + coeffs[2] * v[2] + coeffs[3] * v[3]);
    return pixel;
  }
`,nc=e=>`
  fn gs_denormalize(n: f32, length: i32) -> f32 {
    ${e.alignCorners===0?`
    // alignCorners: false => [-1, 1] to [-0.5, length - 0.5]
    return ((n + 1.0) * f32(length) - 1.0) / 2.0;
    `:`
    // alignCorners: true => [-1, 1] to [0, length - 1]
    return (n + 1.0) / 2.0 * (f32(length - 1));
    `}
  }
`,rc=e=>`
  ${e.paddingMode==="reflection"?`
      fn gs_reflect(x: i32, x_min: f32, x_max: f32) -> u32 {
        var dx = 0.0;
        var fx = f32(x);
        let range = x_max - x_min;
        if (fx < x_min) {
          dx = x_min - fx;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_min + r;
          } else {
            fx = x_max - r;
          }
        } else if (fx > x_max) {
          dx = fx - x_max;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_max - r;
          } else {
            fx = x_min + r;
          }
        }
        return u32(fx);
      }`:""}
`,oc=(e,t,n)=>`
  fn pixel_at_grid(r: i32, c: i32, H: i32, W: i32, batch: u32, channel: u32, border: vec4<f32>) -> ${t} {
     var pixel = ${t}(0);
     var indices = vec4<u32>(0);
     indices[${Ue}] = batch;
     indices[${Ke}] = channel;`+(()=>{switch(n.paddingMode){case"zeros":return`
          if (r >= 0 && r < H && c >=0 && c < W) {
            indices[${st}] = u32(r);
            indices[${at}] = u32(c);
          } else {
            return ${t}(0);
          }
        `;case"border":return`
          indices[${st}] = u32(clamp(r, 0, H - 1));
          indices[${at}] = u32(clamp(c, 0, W - 1));
        `;case"reflection":return`
          indices[${st}] = gs_reflect(r, border[1], border[3]);
          indices[${at}] = gs_reflect(c, border[0], border[2]);
        `;default:throw new Error(`padding mode ${n.paddingMode} is not supported`)}})()+`
    return ${e.getByIndices("indices")};
  }
`,ic=(e,t,n)=>(()=>{switch(n.mode){case"nearest":return`
          let result = pixel_at_grid(i32(round(y)), i32(round(x)), H_in, W_in, indices[${Ue}], indices[${Ke}], border);
        `;case"bilinear":return`
          let x1 = i32(floor(x));
          let y1 = i32(floor(y));
          let x2 = x1 + 1;
          let y2 = y1 + 1;

          let p11 = pixel_at_grid(y1, x1, H_in, W_in, indices[${Ue}], indices[${Ke}], border);
          let p12 = pixel_at_grid(y1, x2, H_in, W_in, indices[${Ue}], indices[${Ke}], border);
          let p21 = pixel_at_grid(y2, x1, H_in, W_in, indices[${Ue}], indices[${Ke}], border);
          let p22 = pixel_at_grid(y2, x2, H_in, W_in, indices[${Ue}], indices[${Ke}], border);

          let dx2 = ${t}(f32(x2) - x);
          let dx1 = ${t}(x - f32(x1));
          let dy2 = ${t}(f32(y2) - y);
          let dy1 = ${t}(y - f32(y1));
          let result = dy2 * (dx2 * p11 + dx1 * p12) + dy1 * (dx2 * p21 + dx1 * p22);
        `;case"bicubic":return`
          let x0 = i32(floor(x)) - 1;
          let y0 = i32(floor(y)) - 1;
          var p: mat4x4<${t}>;
          for (var h = 0; h < 4; h++) {
            for (var w = 0; w < 4; w++) {
              p[h][w] = pixel_at_grid(h + y0, w + x0, H_in, W_in, indices[${Ue}], indices[${Ke}], border);
            }
          }

          let dx = x - f32(x0 + 1);
          let dy = y - f32(y0 + 1);
          let result = gs_bicubic_interpolate(p, dx, dy);
        `;default:throw new Error(`mode ${n.mode} is not supported`)}})()+`${e.setByOffset("global_idx","result")}`,sc=(e,t)=>{let n=T("x",e[0].dataType,e[0].dims.length),r=[e[1].dims[0],e[1].dims[1],e[1].dims[2]],o=T("grid",e[1].dataType,r.length,2),i=[e[0].dims[0],e[0].dims[1],e[1].dims[1],e[1].dims[2]];t.format==="NHWC"&&(i=[e[0].dims[0],e[1].dims[1],e[1].dims[2],e[0].dims[3]],[Ue,Ke,st,at]=[0,3,1,2]);let s=A("output",e[0].dataType,i.length),a=n.type.value,u=x.size(i),d=[{type:12,data:u},...z(e[0].dims,r,i)],l=c=>`
  ${c.registerUniform("output_size","u32").declareVariables(n,o,s)}
  ${ec}
  ${tc(a)}
  ${nc(t)}
  ${rc(t)}
  ${oc(n,a,t)}

  ${c.mainStart()}
    ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let H_in = i32(uniforms.x_shape[${st}]);
      let W_in = i32(uniforms.x_shape[${at}]);

      ${t.alignCorners===0?`
      let x_min = -0.5;
      let x_max = f32(W_in) - 0.5;
      let y_min = -0.5;
      let y_max = f32(H_in) - 0.5;
      `:`
      let x_min = 0.0;
      let x_max = f32(W_in) - 1.0;
      let y_min = 0.0;
      let y_max = f32(H_in) - 1.0;
      `};
      let border = vec4<f32>(x_min, y_min, x_max, y_max);

      let indices = ${s.offsetToIndices("global_idx")};
      var grid_indices = vec3<u32>(indices[${Ue}], indices[${st}], indices[${at}]);
      let nxy = ${o.getByIndices("grid_indices")};
      var x = gs_denormalize(f32(nxy[0]), W_in);
      var y = gs_denormalize(f32(nxy[1]), H_in);

      ${ic(s,a,t)}
  }`;return{name:"GridSample",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:["type","type"]},getRunData:c=>{let p=x.size(i);return{outputs:[{dims:i,dataType:c[0].dataType}],dispatchGroup:{x:Math.ceil(p/64)},programUniforms:d}},getShaderSource:l}},Xs=(e,t)=>{Jl(e.inputs),e.compute(sc(e.inputs,t))},Ys=e=>G({alignCorners:e.align_corners,mode:e.mode,paddingMode:e.padding_mode,format:e.format})});var be,dc,ta,ea,lc,ht,na,Fn=E(()=>{H();j();ue();Ot();Lt();Q();Me();be=(e,t)=>e.length>t&&e[t].dims.length>0?e[t]:void 0,dc=(e,t)=>{let n=e[0],r=be(e,1),o=be(e,2),i=be(e,3),s=be(e,4),a=be(e,5),u=be(e,6),d=be(e,7);if(n.dims.length!==3&&n.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let l=n.dims[0],c=n.dims[1],p=n.dims.length===3?n.dims[2]:t.numHeads*n.dims[4],f=c,m=0,h=0,b=Math.floor(p/t.numHeads);if(u&&d&&x.size(u.dims)&&x.size(d.dims)){if(u.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(u.dims[0]!==l||u.dims[1]!==t.numHeads||u.dims[3]!==b)throw new Error('Input "past_key" shape (batch_size, num_heads, past_sequence_length, head_size)');if(d.dims[0]!==l||d.dims[1]!==t.numHeads||d.dims[3]!==b)throw new Error('Input "past_value" shape (batch_size, num_heads, past_sequence_length, head_size)');if(u.dims[2]!==d.dims[2])throw new Error('Input "past_key" and "past_value" shall have same dim 2 (past_sequence_length)');if(d.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');m=u.dims[2],h=u.dims[2]}else if(u&&x.size(u.dims)||d&&x.size(d.dims))throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let g;if(r&&x.size(r.dims)>0){if(n.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(r.dims.length<3||r.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(n.dims[0]!==r.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(r.dims.length===3){if(r.dims[2]!==n.dims[2])throw new Error('Input "query" and "key" shall have same dim 2 (hidden_size)');g=2,f=r.dims[1]}else if(r.dims.length===5){if(r.dims[2]!==t.numHeads||r.dims[3]!==2||r.dims[4]!==b)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(o)throw new Error('Expect "value" be none when "key" has packed kv format.');g=5,f=r.dims[1]}else{if(r.dims[1]!==t.numHeads||r.dims[3]!==b)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');g=0,f=r.dims[2]}}else{if(n.dims.length!==5)throw new Error('Input "query" is expected to have 5 dimensions when key is empty');if(n.dims[2]!==t.numHeads||n.dims[3]!==3)throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');g=3}if(i&&x.size(i.dims)>0){if(i.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimension');if(r&&r.dims.length===5&&r.dims[3]===2)throw new Error("bias is not allowed for packed kv.")}let y=m+f,_=0;if(s&&x.size(s.dims)>0){_=8;let I=s.dims;throw I.length===1?I[0]===l?_=1:I[0]===3*l+2&&(_=3):I.length===2&&I[0]===l&&I[1]===y&&(_=5),_===8?new Error('Input "key_padding_mask" shape shall be (batch_size) or (batch_size, total_sequence_length)'):new Error("Mask not supported")}let w=!1,$=p;if(o&&x.size(o.dims)>0){if(o.dims.length!==3&&o.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(n.dims[0]!==o.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(o.dims.length===3){if(f!==o.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');$=o.dims[2]}else{if(f!==o.dims[2])throw new Error('Input "key" and "value" shall have the same dim 2 (kv_sequence_length)');$=o.dims[1]*o.dims[3],w=!0}}let v=!1;if(s&&x.size(s.dims)>0)throw new Error("Key padding mask is not supported");if(a&&x.size(a.dims)>0){if(a.dims.length!==4)throw new Error('Input "attention_bias" is expected to have 4 dimensions');if(a.dims[0]!==l||a.dims[1]!==t.numHeads||a.dims[2]!==c||a.dims[3]!==y)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:l,sequenceLength:c,pastSequenceLength:m,kvSequenceLength:f,totalSequenceLength:y,maxSequenceLength:h,inputHiddenSize:0,hiddenSize:p,vHiddenSize:$,headSize:b,vHeadSize:Math.floor($/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:_,scale:t.scale,broadcastResPosBias:v,passPastInKv:w,qkvFormat:g}},ta=e=>G({...e}),ea=G({perm:[0,2,1,3]}),lc=(e,t,n,r,o,i,s)=>{let a=[r,o,i],u=x.size(a),d=[{type:12,data:u},{type:12,data:s},{type:12,data:i}],l=c=>{let p=A("qkv_with_bias",t.dataType,a),f=T("qkv",t.dataType,a),m=T("bias",n.dataType,a),h=[{name:"output_size",type:"u32"},{name:"bias_offset",type:"u32"},{name:"hidden_size",type:"u32"}];return`
  ${c.registerUniforms(h).declareVariables(f,m,p)}
  ${c.mainStart()}
    ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let bias_offset_idx = (global_idx % uniforms.hidden_size) + uniforms.bias_offset;

    qkv_with_bias[global_idx] = qkv[global_idx] + bias[bias_offset_idx];
  }`};return e.compute({name:"MultiHeadAttentionAddBias",shaderCache:{inputDependencies:["type","type"]},getRunData:()=>({outputs:[{dims:a,dataType:t.dataType,gpuDataType:0}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:d}),getShaderSource:l},{inputs:[t,n],outputs:[-1]})[0]},ht=(e,t,n,r,o,i,s,a)=>{let u=i;if(s&&x.size(s.dims)>0){if(r===1)throw new Error("AddBiasReshape is not implemented. Please export your model with packed QKV or KV");return u=lc(e,i,s,t,r,n*o,a),u=u.reshape([t,r,n,o]),n===1||r===1?u:e.compute(me(u,ea.perm),{inputs:[u],outputs:[-1]})[0]}else return i.dims.length===3&&(u=i.reshape([t,r,n,o])),n===1||r===1?u:e.compute(me(u,ea.perm),{inputs:[u],outputs:[-1]})[0]},na=(e,t)=>{let n=dc(e.inputs,t),r=e.inputs[0],o=be(e.inputs,1),i=be(e.inputs,2),s=be(e.inputs,3),a=be(e.inputs,4),u=be(e.inputs,5),d=be(e.inputs,6),l=be(e.inputs,7);if(r.dims.length===5)throw new Error("Packed QKV is not implemented");if(o?.dims.length===5)throw new Error("Packed KV is not implemented");let c=o&&i&&o.dims.length===4&&i.dims.length===4,p=ht(e,n.batchSize,n.numHeads,n.sequenceLength,n.headSize,r,s,0);if(c)return it(e,p,o,i,a,void 0,d,l,u,n);if(!o||!i)throw new Error("key and value must be provided");let f=ht(e,n.batchSize,n.numHeads,n.kvSequenceLength,n.headSize,o,s,n.hiddenSize),m=ht(e,n.batchSize,n.numHeads,n.kvSequenceLength,n.vHeadSize,i,s,2*n.hiddenSize);it(e,p,f,m,a,void 0,d,l,u,n)}});var cc,pc,mc,fc,Kn,ra,oa,jn=E(()=>{H();j();ue();Q();cc=e=>{if(!e||e.length<1)throw new Error("too few inputs")},pc=(e,t)=>{let n=[],r=t.numOutputs;return e[1].dims[0]>0&&(e[1].getBigInt64Array().forEach(o=>n.push(Number(o))),r=n.length),G({numOutputs:r,axis:t.axis,splitSizes:n})},mc=e=>`
fn calculateOutputIndex(index: u32) -> u32 {
    for (var i: u32 = 0u; i < ${e}u; i += 1u ) {
    if (index < ${U("uniforms.size_in_split_axis","i",e)}) {
        return i;
    }
    }
    return ${e}u;
}`,fc=e=>{let t=e.length,n=[];for(let r=0;r<t;++r){let o=e[r].setByIndices("indices","input[global_idx]");t===1?n.push(o):r===0?n.push(`if (output_number == ${r}u) { ${o} }`):r===t-1?n.push(`else { ${o} }`):n.push(`else if (output_number == ${r}) { ${o} }`)}return`
      fn writeBufferData(output_number: u32, indices: ${e[0].type.indices}, global_idx: u32) {
        ${n.join(`
`)}
      }`},Kn=(e,t)=>{let n=e[0].dims,r=x.size(n),o=e[0].dataType,i=x.normalizeAxis(t.axis,n.length),s=new Array(t.numOutputs),a=T("input",o,n.length),u=new Array(t.numOutputs),d=[],l=[],c=0,p=[{type:12,data:r}];for(let m=0;m<t.numOutputs;m++){c+=t.splitSizes[m],u[m]=c;let h=n.slice();h[i]=t.splitSizes[m],l.push(h),s[m]=A(`output${m}`,o,h.length),d.push({dims:l[m],dataType:e[0].dataType})}p.push({type:12,data:u},...z(n,...l));let f=m=>`
  ${m.registerUniform("input_size","u32").registerUniform("size_in_split_axis","u32",u.length).declareVariables(a,...s)}
  ${mc(u.length)}
  ${fc(s)}

  ${m.mainStart()}
    ${m.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.input_size")}

    var indices = ${a.offsetToIndices("global_idx")};
    var index = ${a.indicesGet("indices",i)};
    let output_number = calculateOutputIndex(index);
    if (output_number != 0) {
      index -= ${U("uniforms.size_in_split_axis","output_number - 1u",u.length)};
      ${a.indicesSet("indices",i,"index")};
    }
    writeBufferData(output_number, indices, global_idx);
  }`;return{name:"Split",shaderCache:{hint:t.cacheKey,inputDependencies:["rank"]},getShaderSource:f,getRunData:()=>({outputs:d,dispatchGroup:{x:Math.ceil(r/64)},programUniforms:p})}},ra=(e,t)=>{cc(e.inputs);let n=e.inputs.length===1?t:pc(e.inputs,t);e.compute(Kn(e.inputs,n),{inputs:[0]})},oa=e=>{let t=e.axis,n=e.splitSizes,r=e.numOutputs<0?n.length:e.numOutputs;if(r!==n.length)throw new Error("numOutputs and splitSizes length must be equal");return G({axis:t,numOutputs:r,splitSizes:n})}});var hc,Yt,ia,Zn=E(()=>{H();j();ue();Q();hc=(e,t)=>{let[n,r,o,i]=e,{numHeads:s,rotaryEmbeddingDim:a}=t;if(n.dims.length!==3&&n.dims.length!==4)throw new Error(`Input 'x' is expected to have 3 or 4 dimensions, got ${n.dims.length}`);if(!x.areEqual(r.dims,[])&&!x.areEqual(r.dims,[1])&&r.dims.length!==2)throw new Error(`Input 'position_ids' is expected to have 0, 1, or 2 dimensions, got ${r.dims.length}`);if(o.dims.length!==2)throw new Error(`Input 'cos_cache' is expected to have 2 dimensions, got ${o.dims.length}`);if(i.dims.length!==2)throw new Error(`Input 'sin_cache' is expected to have 2 dimensions, got ${i.dims.length}`);if(!x.areEqual(o.dims,i.dims))throw new Error("Inputs 'cos_cache' and 'sin_cache' are expected to have the same shape");if(a>0&&s===0)throw new Error("num_heads must be provided if rotary_embedding_dim is specified");let u=n.dims[0],d=n.dims[n.dims.length-2],l=o.dims[0],c=x.sizeFromDimension(n.dims,1)/d,p=a===0?o.dims[1]*2:c/s;if(a>p)throw new Error("rotary_embedding_dim must be less than or equal to head_size");if(r.dims.length===2){if(u!==r.dims[0])throw new Error(`Input 'position_ids' dimension 0 should be of size batch_size, got ${r.dims[0]}`);if(d!==r.dims[1])throw new Error(`Input 'position_ids' dimension 1 should be of size sequence_length, got ${r.dims[1]}`)}if(d>l)throw new Error("Updating cos_cache and sin_cache in RotaryEmbedding is not currently supported");if(p/2!==o.dims[1]&&a/2!==o.dims[1])throw new Error(`Input 'cos_cache' dimension 1 should be same as head_size / 2 or rotary_embedding_dim / 2, got ${o.dims[1]}`)},Yt=(e,t)=>{let{interleaved:n,numHeads:r,rotaryEmbeddingDim:o,scale:i}=t,s=e[0].dims[0],a=x.sizeFromDimension(e[0].dims,1),u=e[0].dims[e[0].dims.length-2],d=a/u,l=e[2].dims[1],c=o===0?l*2:d/r,p=new Array(s,u,d/c,c-l),f=x.computeStrides(p),m=[{type:1,data:i},{type:12,data:p},{type:12,data:f},...e[0].dims.length===3?new Array({type:12,data:[a,d,c,1]}):[],...e[0].dims.length===4?new Array({type:12,data:[a,c,u*c,1]}):[],...z(e[0].dims,e[1].dims,e[2].dims,e[3].dims,e[0].dims)],h=b=>{let g=T("input",e[0].dataType,e[0].dims.length),y=T("position_ids",e[1].dataType,e[1].dims.length),_=T("cos_cache",e[2].dataType,e[2].dims.length),w=T("sin_cache",e[3].dataType,e[3].dims.length),$=A("output",e[0].dataType,e[0].dims.length);return b.registerUniforms([{name:"scale",type:"f32"},{name:"global_shape",type:"u32",length:p.length},{name:"global_strides",type:"u32",length:f.length},{name:"input_output_strides",type:"u32",length:f.length}]),`
        ${b.declareVariables(g,y,_,w,$)}

        ${b.mainStart(Je)}
          let half_rotary_emb_dim = uniforms.${_.name}_shape[1];
          let bsnh = global_idx / uniforms.global_strides % uniforms.global_shape;
          let size = uniforms.global_shape[0] * uniforms.global_strides[0];
          ${b.guardAgainstOutOfBoundsWorkgroupSizes("size")}

          if (bsnh[3] < half_rotary_emb_dim) {
            let position_ids_idx =
                ${y.broadcastedIndicesToOffset("bsnh.xy",A("",y.type.tensor,2))};
            let position_id =
                u32(${y.getByOffset("position_ids_idx")}) + select(0, bsnh[1], position_ids_idx == 0);
            let i = dot(bsnh, uniforms.input_output_strides) + select(0, bsnh[3], ${n});
            let j = i + select(half_rotary_emb_dim, 1, ${n});
            let re = ${g.getByOffset("i")} * ${_.get("position_id","bsnh[3]")} -
                ${g.getByOffset("j")} * ${w.get("position_id","bsnh[3]")};
            ${$.setByOffset("i","re")}
            let im = ${g.getByOffset("i")} * ${w.get("position_id","bsnh[3]")} +
                ${g.getByOffset("j")} * ${_.get("position_id","bsnh[3]")};
            ${$.setByOffset("j","im")}
          } else {
            let k = dot(bsnh, uniforms.input_output_strides) + half_rotary_emb_dim;
            ${$.setByOffset("k",g.getByOffset("k"))}
          }
        }`};return{name:"RotaryEmbedding",shaderCache:{hint:G({interleaved:n}).cacheKey,inputDependencies:["rank","rank","rank","rank"]},getShaderSource:h,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(x.size(p)/Je)},programUniforms:m})}},ia=(e,t)=>{hc(e.inputs,t),e.compute(Yt(e.inputs,t))}});var gc,yc,sa,bc,aa,ua=E(()=>{ue();H();Lt();Fn();jn();Me();Zn();Q();gc=(e,t)=>{if(t.doRotary&&e.length<=7)throw new Error("cos_cache and sin_cache inputs are required if do_rotary is specified");let n=e[0],r=e[1],o=e[2],i=e[3],s=e[4];if(t.doRotary!==0&&e.length<=7)throw new Error("cos_cast and sin_cache are expected if do_rotary attribute is non-zero");if(t.localWindowSize!==-1)throw new Error("Local attention is not supported");if(t.softcap!==0)throw new Error("Softcap is not supported");if(t.rotaryInterleaved!==0)throw new Error("Rotary interleaved is not supported");if(t.smoothSoftmax)throw new Error("Smooth softmax is not supported");if(n.dims.length!==3&&n.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let a=!1,u=n.dims[0],d=n.dims[1],l=n.dims.length===3?a?n.dims[2]/3:n.dims[2]:t.numHeads*n.dims[4],c=d,p=0,f=!r||r.dims.length===0,m=Math.floor(f?l/(t.numHeads+2*t.kvNumHeads):l/t.numHeads);f&&(l=m*t.numHeads);let h=i&&i.dims.length!==0,b=s&&s.dims.length!==0;if(h&&i.dims.length===4&&i.dims[0]===u&&i.dims[1]!==t.kvNumHeads&&i.dims[2]===t.kvNumHeads&&i.dims[3]===m)throw new Error("BSNH pastKey/pastValue is not supported");if(h&&b){if(i.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(s.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');p=i.dims[2]}else if(h||b)throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let y=1;if(r&&r.dims.length>0){if(n.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(r.dims.length<3||r.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(n.dims[0]!==r.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(r.dims.length===3){if(n.dims[2]%r.dims[2]!==0)throw new Error('Dimension 2 of "query" should be a multiple of "key"');c=r.dims[1]}else if(r.dims.length===5){if(r.dims[2]!==t.numHeads||r.dims[3]!==2||r.dims[4]!==m)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(o)throw new Error('Expect "value" be none when "key" has packed kv format.');c=r.dims[1]}else{if(r.dims[1]!==t.numHeads||r.dims[3]!==m)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');c=r.dims[2]}}else{if(n.dims.length!==3&&n.dims.length!==5)throw new Error('Input "query" is expected to have 3 or 5 dimensions when key is empty');if(n.dims.length===5&&(n.dims[2]!==t.numHeads||n.dims[3]!==3))throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');y=3}let _=0,w=!1,$=t.kvNumHeads?m*t.kvNumHeads:l;if(o&&o.dims.length>0){if(o.dims.length!==3&&o.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(n.dims[0]!==o.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(o.dims.length===3){if(c!==o.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');$=o.dims[2]}else{if(c!==o.dims[2])throw new Error('Input "past_key" and "past_value" shall have the same dim 2 (kv_sequence_length)');$=o.dims[1]*o.dims[3],w=!0}}let v=e.length>4?e[5]:void 0;if(v){if(v.dims.length===0)throw new Error("seqlens_k must be at least 1D, got scalar.");let P=v.dims.reduce((R,O)=>R*O,1);if(P!==u)throw new Error(`seqlens_k must have batch_size (${u}) elements, got ${P}.`);for(let R=0;R<v.dims.length;R++)if(v.dims[R]!==1&&v.dims[R]!==u)throw new Error(`seqlens_k has unexpected shape. Each dimension must be 1 or batch_size (${u}), got dims[${R}] = ${v.dims[R]}.`)}return{batchSize:u,sequenceLength:d,pastSequenceLength:p,kvSequenceLength:c,totalSequenceLength:-1,maxSequenceLength:-1,inputHiddenSize:0,hiddenSize:l,vHiddenSize:$,headSize:m,vHeadSize:Math.floor($/t.kvNumHeads),numHeads:t.numHeads,kvNumHeads:t.kvNumHeads,nReps:t.numHeads/t.kvNumHeads,pastPresentShareBuffer:!1,maskType:_,scale:t.scale,broadcastResPosBias:!1,passPastInKv:w,qkvFormat:y}},yc=G({perm:[0,2,1,3]}),sa=(e,t,n)=>{let r=t,o=n.kvNumHeads;return t.dims.length===3&&n.kvSequenceLength!==0&&(r=t.reshape([n.batchSize,n.kvSequenceLength,o,n.headSize]),r=e.compute(me(r,yc.perm),{inputs:[r],outputs:[-1]})[0]),r},bc=(e,t,n,r)=>{let o=7,i=["type","type"],s=[e*t],a=e*t,u=[{type:12,data:a},{type:12,data:t},{type:12,data:e}],d=l=>{let c=T("seq_lens",n.dataType,n.dims),p=T("total_seq_lens",r.dataType,r.dims),f=A("pos_ids",o,s),m=[{name:"output_size",type:"u32"},{name:"sequence_length",type:"u32"},{name:"batch_size",type:"u32"}];return`
  ${l.registerUniforms(m).declareVariables(c,p,f)}
  ${l.mainStart()}
    ${l.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let total_sequence_length = u32(${p.getByOffset("0")});
    let is_subsequent_prompt = uniforms.sequence_length > 1 && uniforms.sequence_length != total_sequence_length;
    let is_first_prompt = !is_subsequent_prompt && uniforms.sequence_length == total_sequence_length;
    let batch_idx = global_idx / uniforms.sequence_length;
    let sequence_idx = i32(global_idx % uniforms.sequence_length);
    var pos_id: i32 = 0;
    let seqlen = ${c.getByOffset("batch_idx")};
    let total_seqlen = seqlen + 1;
    if (is_first_prompt) {
      if (sequence_idx < total_seqlen) {
        pos_id = sequence_idx;
      } else {
        pos_id = 1;
      }
      ${f.setByOffset("global_idx","pos_id")}
    } else if (is_subsequent_prompt) {
      let past_seqlen = total_seqlen - i32(uniforms.sequence_length);
      if (past_seqlen + sequence_idx < total_seqlen) {
        pos_id = past_seqlen + sequence_idx;
      } else {
        pos_id = 1;
      }
      ${f.setByOffset("global_idx","pos_id")}
    } else if (global_idx < uniforms.batch_size) {
      ${f.setByOffset("global_idx","seqlen")}
    };
  }
  `};return{name:"GeneratePositionIds",shaderCache:{hint:`${e};${t}`,inputDependencies:i},getRunData:()=>({outputs:[{dims:s,dataType:o}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:u}),getShaderSource:d}},aa=(e,t)=>{if(e.inputs.length>14&&e.inputs[14]||e.inputs.length>15&&e.inputs[15])throw new Error("GroupQueryAttention (JSEP): q_norm_weight / k_norm_weight inputs are not supported. The per-head Q/K RMS normalization prologue is implemented only on the CUDA and native WebGPU EPs.");let n=gc(e.inputs,t);if(e.inputs[0].dims.length===5)throw new Error("Packed QKV is not implemented");if(e.inputs[1]?.dims.length===5)throw new Error("Packed KV is not implemented");let r=e.inputs[0],o=e.inputs[1]&&e.inputs[1].dims.length>0?e.inputs[1]:void 0,i=e.inputs[2]&&e.inputs[2].dims.length>0?e.inputs[2]:void 0,s=e.inputs[3]&&e.inputs[3].dims.length!==0?e.inputs[3]:void 0,a=e.inputs[4]&&e.inputs[4].dims.length!==0?e.inputs[4]:void 0,u=e.inputs.length>4?e.inputs[5]:void 0,d=e.inputs.length>5?e.inputs[6]:void 0,l=n.kvNumHeads?n.kvNumHeads:n.numHeads,c=G({axis:2,numOutputs:3,splitSizes:[n.numHeads*n.headSize,l*n.headSize,l*n.headSize]}),[p,f,m]=!o&&!i?e.compute(Kn([r],c),{inputs:[r],outputs:[-1,-1,-1]}):[r,o,i],h,b;if(t.doRotary){let w=e.compute(bc(n.batchSize,n.sequenceLength,u,d),{inputs:[u,d],outputs:[-1]})[0],$=e.inputs[7],v=e.inputs[8],I=G({interleaved:t.rotaryInterleaved!==0,numHeads:n.numHeads,rotaryEmbeddingDim:0,scale:t.scale}),S=[p,w,$,v],C=[-1];h=e.compute(Yt(S,I),{inputs:S,outputs:C})[0],S.splice(0,1,f);let P=G({interleaved:t.rotaryInterleaved!==0,numHeads:n.kvNumHeads,rotaryEmbeddingDim:0,scale:t.scale});b=e.compute(Yt(S,P),{inputs:S,outputs:C})[0]}let g=ht(e,n.batchSize,n.numHeads,n.sequenceLength,n.headSize,t.doRotary?h:p,void 0,0),y=sa(e,t.doRotary?b:f,n),_=sa(e,m,n);it(e,g,y,_,void 0,void 0,s,a,void 0,n,u,d)}});var da,_c,wc,la,ca=E(()=>{H();j();Me();Q();da=(e,t,n,r,o,i,s,a)=>{let u=J(i),d=u===1?"f32":`vec${u}f`,l=u===1?"vec2f":`mat2x${u}f`,c=o*s,p=64;c===1&&(p=256);let f=[o,s,i/u],m=[o,s,2],h=["rank","type","type"],b=[];b.push(...z(f,m));let g=y=>{let _=T("x",t.dataType,3,u),w=T("scale",n.dataType,n.dims),$=T("bias",r.dataType,r.dims),v=A("output",1,3,2),I=[_,w,$,v];return`
  var<workgroup> workgroup_shared : array<${l}, ${p}>;
  const workgroup_size = ${p}u;
  ${y.declareVariables(...I)}
  ${y.mainStart(p)}
    let batch = workgroup_index / uniforms.x_shape[1];
    let channel = workgroup_index % uniforms.x_shape[1];
    let hight = uniforms.x_shape[2];
    // initialize workgroup memory
    var sum = ${d}(0);
    var squared_sum = ${d}(0);
    for (var h = local_idx; h < hight; h += workgroup_size) {
      let value = ${d}(${_.get("batch","channel","h")});
      sum += value;
      squared_sum += value * value;
    }
    workgroup_shared[local_idx] = ${l}(sum, squared_sum);
    workgroupBarrier();

    for (var currSize = workgroup_size >> 1;  currSize > 0; currSize = currSize >> 1) {
      if (local_idx < currSize) {
        workgroup_shared[local_idx] = workgroup_shared[local_idx] + workgroup_shared[local_idx + currSize];
      }
      workgroupBarrier();
    }
    if (local_idx == 0) {
      let sum_final = ${Se("workgroup_shared[0][0]",u)} / f32(hight * ${u});
      let squared_sum_final = ${Se("workgroup_shared[0][1]",u)} / f32(hight * ${u});

      let inv_std_dev = inverseSqrt(squared_sum_final - sum_final * sum_final + f32(${a}));
      let channel_scale = inv_std_dev * f32(scale[channel]);
      let channel_shift = f32(bias[channel]) - sum_final * channel_scale;
      output[workgroup_index] = vec2f(channel_scale, channel_shift);
    }
  }`};return e.compute({name:"InstanceNormComputeChannelScaleShift",shaderCache:{hint:`${u};${a};${p}`,inputDependencies:h},getRunData:()=>({outputs:[{dims:m,dataType:1}],dispatchGroup:{x:c},programUniforms:b}),getShaderSource:g},{inputs:[t,n,r],outputs:[-1]})[0]},_c=(e,t,n)=>{let r=t[0].dims,o=r,i=2,s=r[0],a=r[1],u=x.sizeFromDimension(r,i),d=J(u),l=x.size(o)/d,c=da(e,t[0],t[1],t[2],s,u,a,n.epsilon),p=[s,a,u/d],f=[s,a],m=["type","none"],h=b=>{let g=T("x",t[0].dataType,p.length,d),y=T("scale_shift",1,f.length,2),_=A("output",t[0].dataType,p.length,d),w=[g,y,_];return`
  ${b.registerUniform("output_size","u32").declareVariables(...w)}
  ${b.mainStart()}
  ${b.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let outputIndices = ${_.offsetToIndices("global_idx")};
      let batch = outputIndices[0];
      let channel = outputIndices[1];
      let scale_shift = ${y.getByIndices("vec2<u32>(batch, channel)")};
      let value = ${g.getByOffset("global_idx")} * ${_.type.value}(scale_shift.x) + ${_.type.value}(scale_shift.y);
      ${_.setByOffset("global_idx","value")};
  }`};e.compute({name:"InstanceNormalization",shaderCache:{hint:`${d}`,inputDependencies:m},getRunData:()=>({outputs:[{dims:o,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:[{type:12,data:l},...z(p,f,p)]}),getShaderSource:h},{inputs:[t[0],c]})},wc=(e,t,n)=>{let r=t[0].dims,o=r,i=r[0],s=r[r.length-1],a=x.sizeFromDimension(r,1)/s,u=J(s),d=x.size(o)/u,l=[{type:12,data:a},{type:12,data:Math.floor(s/u)}],c=["type","type"],p=!1,f=[0,r.length-1];for(let g=0;g<r.length-2;g++)p=p||r[g+1]!==1,f.push(g+1);p=p&&r[r.length-1]!==1;let m=p?e.compute(me(e.inputs[0],f),{inputs:[e.inputs[0]],outputs:[-1]})[0]:e.inputs[0].reshape(Array.from({length:r.length},(g,y)=>r[f[y]])),h=da(e,m,t[1],t[2],i,a,s,n.epsilon),b=g=>{let y=ne(t[0].dataType),_=u===1?"vec2f":`mat${u}x2f`,w=I=>{let S=I===0?"x":"y",C=u===1?"f32":`vec${u}f`;switch(u){case 1:return`${y}(${C}(scale.${S}))`;case 2:return`vec2<${y}>(${C}(scale[0].${S}, scale[1].${S}))`;case 4:return`vec4<${y}>(${C}(scale[0].${S}, scale[1].${S}, scale[2].${S}, scale[3].${S}))`;default:throw new Error(`Not supported compoents ${u}`)}},$=T("input",t[0].dataType,t[0].dims,u),v=A("output",t[0].dataType,o,u);return`
  @group(0) @binding(0) var<storage, read> input : array<${$.type.storage}>;
  @group(0) @binding(1) var<storage, read> scale_input : array<${_}>;
  @group(0) @binding(2) var<storage, read_write> output : array<${v.type.storage}>;
  struct Uniforms {H: u32, C : u32};
  @group(0) @binding(3) var<uniform> uniforms: Uniforms;

  ${g.mainStart()}
    let current_image_number = global_idx / (uniforms.C * uniforms.H);
    let current_channel_number = global_idx % uniforms.C;

    let scale_offset = current_image_number * uniforms.C + current_channel_number;
    let scale = scale_input[scale_offset];
    output[global_idx] = fma(input[global_idx], ${w(0)}, ${w(1)});
  }`};e.compute({name:"InstanceNormalizationNHWC",shaderCache:{hint:`${u}`,inputDependencies:c},getRunData:()=>({outputs:[{dims:o,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:l}),getShaderSource:b},{inputs:[t[0],h]})},la=(e,t)=>{t.format==="NHWC"?wc(e,e.inputs,t):_c(e,e.inputs,t)}});var $c,vc,pa,ma=E(()=>{H();j();Q();$c=e=>{if(!e||e.length<2)throw new Error("layerNorm requires at least 2 inputs.")},vc=(e,t,n)=>{let r=t.simplified,o=e[0].dims,i=e[1],s=!r&&e[2],a=o,u=x.normalizeAxis(t.axis,o.length),d=x.sizeToDimension(o,u),l=x.sizeFromDimension(o,u),c=x.size(i.dims),p=s?x.size(s.dims):0;if(c!==l||s&&p!==l)throw new Error(`Size of X.shape()[axis:] == ${l}.
       Size of scale and bias (if provided) must match this.
       Got scale size of ${c} and bias size of ${p}`);let f=[];for(let $=0;$<o.length;++$)$<u?f.push(o[$]):f.push(1);let m=J(l),h=["type","type"],b=[{type:12,data:d},{type:1,data:l},{type:12,data:Math.floor(l/m)},{type:1,data:t.epsilon}];s&&h.push("type");let g=n>1,y=n>2,_=$=>{let v=ne(e[0].dataType),I=[T("x",e[0].dataType,e[0].dims,m),T("scale",i.dataType,i.dims,m)];s&&I.push(T("bias",s.dataType,s.dims,m)),I.push(A("output",e[0].dataType,a,m)),g&&I.push(A("mean_data_output",1,f)),y&&I.push(A("inv_std_output",1,f));let S=[{name:"norm_count",type:"u32"},{name:"norm_size",type:"f32"},{name:"norm_size_vectorized",type:"u32"},{name:"epsilon",type:"f32"}];return`
  ${$.registerUniforms(S).declareVariables(...I)}
  ${$.mainStart()}
    ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.norm_count")}
    let offset = global_idx * uniforms.norm_size_vectorized;
    var mean_vector = ${kn("f32",m)};
    var mean_square_vector = ${kn("f32",m)};

    for (var h: u32 = 0u; h < uniforms.norm_size_vectorized; h++) {
      let value = ${et(v,m,"x[h + offset]")};
      mean_vector += value;
      mean_square_vector += value * value;
    }
    let mean = ${Se("mean_vector",m)} / uniforms.norm_size;
    let inv_std_dev = inverseSqrt(${Se("mean_square_vector",m)} / uniforms.norm_size ${r?"":"- mean * mean"} + uniforms.epsilon);

    for (var j: u32 = 0; j < uniforms.norm_size_vectorized; j++) {
      let f32input = ${et(v,m,"x[j + offset]")};
      let f32scale = ${et(v,m,"scale[j]")};
      output[j + offset] = ${I[0].type.value}((f32input ${r?"":"- mean"}) * inv_std_dev * f32scale
        ${s?`+ ${et(v,m,"bias[j]")}`:""}
      );
    }

    ${g?"mean_data_output[global_idx] = mean":""};
    ${y?"inv_std_output[global_idx] = inv_std_dev":""};
  }`},w=[{dims:a,dataType:e[0].dataType}];return g&&w.push({dims:f,dataType:1}),y&&w.push({dims:f,dataType:1}),{name:"LayerNormalization",shaderCache:{hint:`${m};${n};${r}`,inputDependencies:h},getRunData:()=>({outputs:w,dispatchGroup:{x:Math.ceil(d/64)},programUniforms:b}),getShaderSource:_}},pa=(e,t)=>{$c(e.inputs),e.compute(vc(e.inputs,t,e.outputCount))}});var xc,fa,ha=E(()=>{qn();j();Ft();Kt();xc=e=>{if(!e||e.length!==2)throw new Error("MatMul requires 2 inputs.");if(e[0].dims[e[0].dims.length-1]!==e[1].dims[e[1].dims.length-2])throw new Error("shared dimension does not match.")},fa=e=>{if(xc(e.inputs),Xt(e,null))return;let t=Ee.calcShape(e.inputs[0].dims,e.inputs[1].dims,!0);if(!t)throw new Error("Can't use matmul on the given tensors");let n=t[t.length-1],r=e.inputs[0].dims[e.inputs[0].dims.length-1];if(n<8&&r<8)e.compute(qt(e.inputs,{activation:""},t));else{let o=t[t.length-2],i=x.size(e.inputs[0].dims.slice(0,-2)),s=x.size(e.inputs[1].dims.slice(0,-2));if(i!==1&&o===1&&s===1){let a=e.inputs[0].reshape([1,i,r]),u=e.inputs[1].reshape([1,r,n]),d=[1,i,n],l=[a,u];e.compute(ft(l,{activation:""},t,d),{inputs:l})}else e.compute(ft(e.inputs,{activation:""},t))}}});var Sc,Tc,Ic,ga,ya,ba=E(()=>{H();j();ue();Q();Sc=(e,t)=>{if(e.length<3||e.length>4)throw new Error("MatMulNBits requires 3 or 4 inputs");let n=e[0],r=n.dims.length;if(n.dims[r-1]!==t.k)throw new Error("The last dim of input shape does not match the k value");let o=Math.floor((t.k+t.blockSize-1)/t.blockSize),i=t.blockSize/8*t.bits,s=e[1];if(!x.areEqual(s.dims,[t.n,o,i]))throw new Error("The second inputs must be 3D tensor with shape N X nBlocksPerCol X blobSize");let u=e[2].dims;if(x.size(u)!==t.n*o)throw new Error("scales input size error.");if(e.length===4){let l=e[3].dims,c=t.n*(t.bits===8?o:Math.floor((o*t.bits+7)/8));if(x.size(l)!==c)throw new Error("zeroPoints input size error.")}},Tc=(e,t)=>{let n=e[0].dims,r=n.length,o=n[r-2],i=t.k,s=t.n,a=n.slice(0,r-2),u=x.size(a),l=e[1].dims[2]/4,c=e[0].dataType,p=J(t.k),f=J(l),m=J(s),h=a.concat([o,s]),b=o>1&&s/m%2===0?2:1,g=x.size(h)/m/b,y=64,_=[],w=[u,o,i/p],$=x.convertShape(e[1].dims).slice();$.splice(-1,1,l/f),_.push(...z(w)),_.push(...z($)),_.push(...z(e[2].dims)),e.length===4&&_.push(...z(x.convertShape(e[3].dims)));let v=[u,o,s/m];_.push(...z(v));let I=S=>{let C=w.length,P=T("a",e[0].dataType,C,p),R=T("b",12,$.length,f),O=T("scales",e[2].dataType,e[2].dims.length),N=[P,R,O],q=e.length===4?T("zero_points",12,e[3].dims.length):void 0;q&&N.push(q);let B=v.length,M=A("output",e[0].dataType,B,m),W=ne(e[0].dataType),L=(()=>{switch(p){case 1:return`array<${W}, 8>`;case 2:return`mat4x2<${W}>`;case 4:return`mat2x4<${W}>`;default:throw new Error(`${p}-component is not supported.`)}})(),K=Math.floor(32/t.bits),V=Math.floor(K/8),F=()=>{let k="";for(let D=0;D<V;D++){let re=D*t.bits*4,he=re+t.bits;k+=`
          // reuse a data (pass ${D})
            var input_offset${D>0?D:""} = ${D===0?P.indicesToOffset(`${P.type.indices}(batch, row, word_offset)`):"input_offset"};
            var a_data${D>0?D:""}: ${L};
            for (var j${D>0?D:""}: u32 = 0; j${D>0?D:""} < ${8/p}; j${D>0?D:""}++) {
              a_data${D>0?D:""}[j${D>0?D:""}] = ${P.getByOffset(`input_offset${D>0?D:""}`)};
              input_offset${D>0?D:""}++;
            }
          `;for(let ae=0;ae<m*b;ae++)k+=`
            b_value = ${f===1?`b${ae}_data`:`b${ae}_data[i]`};
            ${t.bits===2?`{
              let half_word = b_value >> ${D*16}u;
              let byte_lo = half_word & 0xFFu;
              let byte_hi = (half_word >> 8u) & 0xFFu;
              let spread_word = (byte_lo & 0xFu) | ((byte_lo >> 4u) << 8u) | ((byte_hi & 0xFu) << 16u) | ((byte_hi >> 4u) << 24u);
              b_value_lower = unpack4xU8(spread_word & b_mask);
              b_value_upper = unpack4xU8((spread_word >> 2u) & b_mask);
            }`:`b_value_lower = unpack4xU8((b_value >> ${re}u) & b_mask);
            b_value_upper = unpack4xU8((b_value >> ${he}u) & b_mask);`}
            b_quantized_values = ${L}(${Array.from({length:4},(ge,oe)=>`${W}(b_value_lower[${oe}]), ${W}(b_value_upper[${oe}])`).join(", ")});
            b_dequantized_values = ${p===1?`${L}(${Array.from({length:8},(ge,oe)=>`(b_quantized_values[${oe}] - ${q?`zero_point${ae}`:"zero_point"}) * scale${ae}`).join(", ")});`:`(b_quantized_values - ${L}(${Array(8).fill(`${q?`zero_point${ae}`:"zero_point"}`).join(",")})) * scale${ae};`};
            workgroup_shared[local_id.x * ${b} + ${Math.floor(ae/m)}]${m>1?`[${ae%m}]`:""} += ${Array.from({length:8/p},(ge,oe)=>`${p===1?`a_data${D>0?D:""}[${oe}] * b_dequantized_values[${oe}]`:`dot(a_data${D>0?D:""}[${oe}], b_dequantized_values[${oe}])`}`).join(" + ")};
          `}return k},_e=()=>{let k=`
            var col_index = col * ${m};
            ${q?`
            let zero_point_values_per_byte: u32 = ${Math.floor(8/t.bits)}u;
            let zero_point_bytes_per_col = (nBlocksPerCol + zero_point_values_per_byte - 1u) / zero_point_values_per_byte;
            var zero_point_byte_count: u32;
            var zero_point_word_index: u32;
            var zero_point_byte_offset: u32;
            let zero_point_sub_offset: u32 = block % zero_point_values_per_byte;
            var zero_point_bits_offset: u32;
            var zero_point_word: u32;`:`
            // The default zero point is ${Math.pow(2,t.bits-1)} for unsigned ${t.bits}-bit quantization.
            let zero_point = ${W}(${Math.pow(2,t.bits-1).toFixed(1)});`}
            `;for(let D=0;D<m*b;D++)k+=`
            let scale${D} = ${O.getByOffset("col_index * nBlocksPerCol + block")};
            ${q?`
            zero_point_byte_count = col_index * zero_point_bytes_per_col + (block / zero_point_values_per_byte);
            zero_point_word_index = zero_point_byte_count >> 0x2u;
            zero_point_byte_offset = zero_point_byte_count & 0x3u;
            zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_sub_offset * ${t.bits}u);
            zero_point_word = ${q.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point${D} = ${W}((zero_point_word) & ${t.bits===2?"0x3u":"0xFu"});`:""}
            col_index += 1;`;return k},se=()=>{let k=`col_index = col * ${m};`;for(let D=0;D<m*b;D++)k+=`
            let b${D}_data = ${R.getByIndices(`${R.type.indices}(col_index, block, word)`)};
            col_index += 1;`;return k+=`
            var b_value: u32;
            let b_mask: u32 = ${t.bits===2?"0x03030303u":"0x0F0F0F0Fu"};
            var b_value_lower: vec4<u32>;
            var b_value_upper: vec4<u32>;
            var b_quantized_values: ${L};
            var b_dequantized_values: ${L};`,k};return`
        var<workgroup> workgroup_shared: array<${M.type.value}, ${b*y}>;
        ${S.declareVariables(...N,M)}
        ${S.mainStart([y,1,1])}
          let output_indices = ${M.offsetToIndices(`(global_idx / ${y}) * ${b}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let nBlocksPerCol = uniforms.b_shape[1];

          for (var block = local_id.x; block < nBlocksPerCol; block += ${y}) {
            //process one block
            var word_offset: u32 = block * ${t.blockSize/p};
            ${_e()}
            for (var word: u32 = 0; word < ${l}; word += ${f}) {
              ${se()}
              for (var i: u32 = 0; i < ${f}; i++) {
                ${F()}
                word_offset += ${K/p};
              }
            }
          }
          workgroupBarrier();

          if (local_id.x < ${b}) {
            var output_value: ${M.type.value} = ${M.type.value}(0);
            var workgroup_shared_offset: u32 = local_id.x;
            for (var b: u32 = 0u; b < ${y}u; b++) {
              output_value += workgroup_shared[workgroup_shared_offset];
              workgroup_shared_offset += ${b};
            }
            ${M.setByIndices(`${M.type.indices}(batch, row, col + local_id.x)`,"output_value")};
          }
        }`};return{name:"MatMulNBits",shaderCache:{hint:`${t.blockSize};${t.bits};${p};${f};${m};${b};${y}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:h,dataType:c}],dispatchGroup:{x:g},programUniforms:_}),getShaderSource:I}},Ic=(e,t)=>{let n=e[0].dims,r=n.length,o=n[r-2],i=t.k,s=t.n,a=n.slice(0,r-2),u=x.size(a),l=e[1].dims[2]/4,c=e[0].dataType,p=J(t.k),f=J(l),m=a.concat([o,s]),h=128,b=s%8===0?8:s%4===0?4:1,g=h/b,y=Math.floor(32/t.bits),_=g*f*y,w=_/p,$=_/t.blockSize,v=x.size(m)/b,I=[],S=[u,o,i/p],C=x.convertShape(e[1].dims).slice();C.splice(-1,1,l/f),I.push(...z(S)),I.push(...z(C)),I.push(...z(e[2].dims)),e.length===4&&I.push(...z(x.convertShape(e[3].dims)));let P=[u,o,s];I.push(...z(P));let R=O=>{let N=S.length,q=T("a",e[0].dataType,N,p),B=T("b",12,C.length,f),M=T("scales",e[2].dataType,e[2].dims.length),W=[q,B,M],L=e.length===4?T("zero_points",12,e[3].dims.length):void 0;L&&W.push(L);let K=P.length,V=A("output",e[0].dataType,K),F=ne(e[0].dataType),_e=()=>{switch(p){case 1:return`
          let a_data0 = vec4<${F}>(sub_a[word_offset], sub_a[word_offset + 1], sub_a[word_offset + 2], sub_a[word_offset + 3]);
          let a_data1 = vec4<${F}>(sub_a[word_offset + 4], sub_a[word_offset + 5], sub_a[word_offset + 6], sub_a[word_offset + 7]);`;case 2:return`
          let a_data0 = vec4<${F}>(sub_a[word_offset], sub_a[word_offset + 1]);
          let a_data1 = vec4<${F}>(sub_a[word_offset + 2], sub_a[word_offset + 3]);`;case 4:return`
          let a_data0 = sub_a[word_offset];
          let a_data1 = sub_a[word_offset + 1];`;default:throw new Error(`${p}-component is not supported.`)}};return`
        var<workgroup> sub_a: array<${q.type.value}, ${w}>;
        var<workgroup> inter_results: array<array<${V.type.value}, ${g}>, ${b}>;
        ${O.declareVariables(...W,V)}
        ${O.mainStart([g,b,1])}
          let output_indices = ${V.offsetToIndices(`workgroup_index * ${b}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let n_blocks_per_col = uniforms.b_shape[1];
          let num_tiles =  (n_blocks_per_col - 1) / ${$} + 1;

          // Loop over shared dimension.
          for (var tile: u32 = 0; tile < num_tiles; tile += 1) {
            let a_col_start = tile * ${w};
            // load one tile A data into shared memory.
            for (var a_offset = local_idx; a_offset < ${w}; a_offset += ${h})
            {
              let a_col = a_col_start + a_offset;
              if (a_col < uniforms.a_shape[2])
              {
                sub_a[a_offset] = ${q.getByIndices(`${q.type.indices}(batch, row, a_col)`)};
              } else {
                sub_a[a_offset] = ${q.type.value}(0);
              }
            }
            workgroupBarrier();

            // each thread process one block
            let b_row = col + local_id.y;
            let block = tile * ${$} + local_id.x;
            ${L?`
            let zero_point_values_per_byte: u32 = ${Math.floor(8/t.bits)}u;
            let zero_point_bytes_per_col = (n_blocks_per_col + zero_point_values_per_byte - 1u) / zero_point_values_per_byte;
            let zero_point_byte_count = b_row * zero_point_bytes_per_col + (block / zero_point_values_per_byte);
            let zero_point_word_index = zero_point_byte_count >> 0x2u;
            let zero_point_byte_offset = zero_point_byte_count & 0x3u;
            let zero_point_sub_offset: u32 = block % zero_point_values_per_byte;
            let zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_sub_offset * ${t.bits}u);
            let zero_point_word = ${L.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point = ${F}((zero_point_word) & ${t.bits===2?"0x3u":"0xFu"});`:`
            // The default zero point is ${Math.pow(2,t.bits-1)} for unsigned ${t.bits}-bit quantization.
            let zero_point = ${F}(${Math.pow(2,t.bits-1).toFixed(1)});`}
            let scale = ${M.getByOffset("b_row * n_blocks_per_col + block")};
            let b_data = ${B.getByIndices(`${B.type.indices}(b_row, block, 0)`)};
            var word_offset = local_id.x * ${t.blockSize/p};
            for (var i: u32 = 0; i < ${f}; i++) {
              let b_value = ${f===1?"b_data":"b_data[i]"};
              ${(()=>{let se=Math.floor(y/8),k="";for(let D=0;D<se;D++){let re=D*t.bits*4,he=re+t.bits;k+=`
              ${_e()}
              {${t.bits===2?`
                let half_word = b_value >> ${D*16}u;
                let byte_lo = half_word & 0xFFu;
                let byte_hi = (half_word >> 8u) & 0xFFu;
                let spread_word = (byte_lo & 0xFu) | ((byte_lo >> 4u) << 8u) | ((byte_hi & 0xFu) << 16u) | ((byte_hi >> 4u) << 24u);
                let b_value_lower = unpack4xU8(spread_word & 0x03030303u);
                let b_value_upper = unpack4xU8((spread_word >> 2u) & 0x03030303u);`:`
                let b_value_lower = unpack4xU8((b_value >> ${re}u) & 0x0F0F0F0Fu);
                let b_value_upper = unpack4xU8((b_value >> ${he}u) & 0x0F0F0F0Fu);`}
                let b_quantized_values = mat2x4<${F}>(${Array.from({length:4},(ae,ge)=>`${F}(b_value_lower[${ge}]), ${F}(b_value_upper[${ge}])`).join(", ")});
                let b_dequantized_values = (b_quantized_values - mat2x4<${F}>(${Array(8).fill("zero_point").join(",")})) * scale;
                inter_results[local_id.y][local_id.x] += ${Array.from({length:2},(ae,ge)=>`${`dot(a_data${ge}, b_dequantized_values[${ge}])`}`).join(" + ")};
              }
              word_offset += ${8/p};`}return k})()}
            }
            workgroupBarrier();
          }

          if (local_idx < ${b}) {
            var output_value: ${V.type.value} = ${V.type.value}(0);
            for (var b = 0u; b < ${g}; b++) {
              output_value += inter_results[local_idx][b];
            }
            if (col + local_idx < uniforms.output_shape[2])
            {
              ${V.setByIndices(`${V.type.indices}(batch, row, col + local_idx)`,"output_value")}
            }
          }
        }`};return{name:"BlockwiseMatMulNBits32",shaderCache:{hint:`${t.blockSize};${p};${f};${g};${b}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:m,dataType:c}],dispatchGroup:{x:v},programUniforms:I}),getShaderSource:R}},ga=(e,t)=>{Sc(e.inputs,t),t.blockSize===32&&e.adapterInfo.isVendor("intel")&&e.adapterInfo.isArchitecture("gen-12lp")?e.compute(Ic(e.inputs,t)):e.compute(Tc(e.inputs,t))},ya=e=>G(e)});var Cc,Ac,kc,Ec,Pc,zc,Dc,Bc,_a,wa=E(()=>{H();j();Q();Cc=e=>{if(!e||e.length<1)throw new Error("Too few inputs");if(e[0].dataType!==1&&e[0].dataType!==10)throw new Error("Input type must be float or float16.");if(e.length>=2){let t=e[0].dims.length*2===e[1].dims[0];if(e.length===4&&(t=e[3].dims[0]*2===e[1].dims[0]),!t)throw new Error("The pads should be a 1D tensor of shape [2 * input_rank] or [2 * num_axes].")}},Ac=(e,t,n)=>{let r="";for(let o=t-1;o>=0;--o)r+=`
            k = i32(${e.indicesGet("indices",o)}) - ${U("uniforms.pads",o,n)};
            if (k < 0) {
              break;
            }
            if (k >= i32(${U("uniforms.x_shape",o,t)})) {
              break;
            }
            offset += k * i32(${U("uniforms.x_strides",o,t)});
        `;return`
          value = ${e.type.value}(uniforms.constant_value);
          for (var i = 0; i < 1; i++) {
            var offset = 0;
            var k = 0;
            ${r}
            value = x[offset];
          }
      `},kc=(e,t,n)=>{let r="";for(let o=t-1;o>=0;--o)r+=`
                k = i32(${e.indicesGet("indices",o)}) - ${U("uniforms.pads",o,n)};
                if (k < 0) {
                  k = -k;
                }
                {
                  let _2n_1 = 2 * (i32(${U("uniforms.x_shape",o,t)}) - 1);
                  k = k % _2n_1;
                  if(k >= i32(${U("uniforms.x_shape",o,t)})) {
                    k = _2n_1 - k;
                  }
                }
                offset += k * i32(${U("uniforms.x_strides",o,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${r}
              value = x[offset];
          `},Ec=(e,t,n)=>{let r="";for(let o=t-1;o>=0;--o)r+=`
                k = i32(${e.indicesGet("indices",o)}) - ${U("uniforms.pads",o,n)};
                if (k < 0) {
                  k = 0;
                }
                if (k >= i32(${U("uniforms.x_shape",o,t)})) {
                  k = i32(${U("uniforms.x_shape",o,t)}) - 1;
                }
                offset += k * i32(${U("uniforms.x_strides",o,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${r}
              value = x[offset];
          `},Pc=(e,t,n)=>{let r="";for(let o=t-1;o>=0;--o)r+=`
                k = i32(${e.indicesGet("indices",o)}) - ${U("uniforms.pads",o,n)};
                if (k < 0)  {
                  k += i32(${U("uniforms.x_shape",o,t)}]);
                }
                if (k >= i32(${U("uniforms.x_shape",o,t)})) {
                  k -= i32(${U("uniforms.x_shape",o,t)});
                }
                offset += k * i32(${U("uniforms.x_strides",o,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${r}
              value = x[offset];
          `},zc=(e,t,n)=>{switch(n.mode){case 0:return Ac(e,t,n.pads.length);case 1:return kc(e,t,n.pads.length);case 2:return Ec(e,t,n.pads.length);case 3:return Pc(e,t,n.pads.length);default:throw new Error("Invalid mode")}},Dc=(e,t)=>{let n=x.padShape(e[0].dims.slice(),t.pads),r=e[0].dims,o=x.size(n),i=[{type:12,data:o},{type:6,data:t.pads}],s=e.length>=3&&e[2].data;t.mode===0&&i.push({type:s?e[2].dataType:1,data:t.value}),i.push(...z(e[0].dims,n));let a=["rank"],u=d=>{let l=A("output",e[0].dataType,n.length),c=T("x",e[0].dataType,r.length),p=c.type.value,f=zc(l,r.length,t),m=[{name:"output_size",type:"u32"},{name:"pads",type:"i32",length:t.pads.length}];return t.mode===0&&m.push({name:"constant_value",type:s?p:"f32"}),`
            ${d.registerUniforms(m).declareVariables(c,l)}
            ${d.mainStart()}
            ${d.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

            let indices = ${l.offsetToIndices("global_idx")};

            var value = ${p}(0);
            ${f}
            output[global_idx] = value;
        }`};return{name:"Pad",shaderCache:{hint:`${t.mode}${s}`,inputDependencies:a},getRunData:()=>({outputs:[{dims:n,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(x.size(n)/64)},programUniforms:i}),getShaderSource:u}},Bc=(e,t)=>{if(e.length>1){let n=e[1].getBigInt64Array(),r=e.length>=3&&e[2].data?e[2].dataType===10?e[2].getUint16Array()[0]:e[2].getFloat32Array()[0]:0,o=e[0].dims.length,i=new Int32Array(2*o).fill(0);if(e.length>=4){let a=e[3].getBigInt64Array();for(let u=0;u<a.length;u++)i[Number(a[u])]=Number(n[u]),i[Number(a[u])+o]=Number(n[u+a.length])}else n.forEach((a,u)=>i[Number(u)]=Number(a));let s=[];return i.forEach(a=>s.push(a)),{mode:t.mode,value:r,pads:s}}else return t},_a=(e,t)=>{Cc(e.inputs);let n=Bc(e.inputs,t);e.compute(Dc(e.inputs,n),{inputs:[0]})}});var Jt,$a,va,xa,Sa,Oc,Mc,Ta,Ia,Ca,Aa,ka,Ea,Pa,za,Da,Ba,Oa,Ma,Ua=E(()=>{$e();H();j();Q();Jt=e=>{if(ie.webgpu.validateInputContent&&(!e||e.length!==1))throw new Error("Pool ops requires 1 input.")},$a=(e,t,n)=>{let r=t.format==="NHWC",o=e.dims.slice();r&&o.splice(1,0,o.pop());let i=Object.hasOwnProperty.call(t,"dilations"),s=t.kernelShape.slice(),a=t.strides.slice(),u=i?t.dilations.slice():[],d=t.pads.slice();Ye.adjustPoolAttributes(n,o,s,a,u,d);let l=Ye.computePoolOutputShape(n,o,a,u,s,d,t.autoPad,t.ceilMode),c=Object.assign({},t);i?Object.assign(c,{kernelShape:s,strides:a,pads:d,dilations:u,cacheKey:t.cacheKey}):Object.assign(c,{kernelShape:s,strides:a,pads:d,cacheKey:t.cacheKey});let p=l.slice();return p.push(p.splice(1,1)[0]),[c,r?p:l]},va=(e,t)=>{let n=t.format==="NHWC",r=x.size(e),o=x.size(t.kernelShape),i=[{type:12,data:r},{type:12,data:o}],s=[{name:"outputSize",type:"u32"},{name:"kernelSize",type:"u32"}];if(t.kernelShape.length<=2){let a=t.kernelShape[t.kernelShape.length-1],u=t.strides[t.strides.length-1],d=t.pads[t.pads.length/2-1],l=t.pads[t.pads.length-1],c=!!(d+l);i.push({type:12,data:a},{type:12,data:u},{type:12,data:d},{type:12,data:l}),s.push({name:"kw",type:"u32"},{name:"sw",type:"u32"},{name:"pwStart",type:"u32"},{name:"pwEnd",type:"u32"});let p=!1;if(t.kernelShape.length===2){let f=t.kernelShape[t.kernelShape.length-2],m=t.strides[t.strides.length-2],h=t.pads[t.pads.length/2-2],b=t.pads[t.pads.length-2];p=!!(h+b),i.push({type:12,data:f},{type:12,data:m},{type:12,data:h},{type:12,data:b}),s.push({name:"kh",type:"u32"},{name:"sh",type:"u32"},{name:"phStart",type:"u32"},{name:"phEnd",type:"u32"})}return[i,s,!0,c,p]}else{if(n)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let a=x.computeStrides(t.kernelShape);i.push({type:12,data:a},{type:12,data:t.pads},{type:12,data:t.strides}),s.push({name:"kernelStrides",type:"u32",length:a.length},{name:"pads",type:"u32",length:t.pads.length},{name:"strides",type:"u32",length:t.strides.length});let u=t.pads.reduce((d,l)=>d+l);return[i,s,!!u,!1,!1]}},xa=(e,t,n,r,o,i,s,a,u,d,l,c)=>{let p=o.format==="NHWC",f=t.type.value,m=A("output",t.type.tensor,r);if(o.kernelShape.length<=2){let h="",b="",g="",y=n-(p?2:1);if(l?h=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${y}] = indices[${y}] * uniforms.sw - uniforms.pwStart + i;
                  if (xIndices[${y}] < 0 || xIndices[${y}]
                      >= uniforms.x_shape[${y}]) {
                    pad++;
                    continue;
                  }
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${i}
                }`:h=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${y}] = indices[${y}] * uniforms.sw - uniforms.pwStart + i;
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${i}
                }`,o.kernelShape.length===2){let w=n-(p?3:2);c?b=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${w}] = indices[${w}] * uniforms.sh - uniforms.phStart + j;
                  if (xIndices[${w}] < 0 || xIndices[${w}] >= uniforms.x_shape[${w}]) {
                    pad += i32(uniforms.kw);
                    continue;
                  }
              `:b=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${w}] = indices[${w}] * uniforms.sh - uniforms.phStart + j;
                `,g=`
              }
            `}return`
            ${e.registerUniforms(u).declareVariables(t,m)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

              let indices = ${m.offsetToIndices("global_idx")};
              var xIndices = ${m.offsetToIndices("global_idx")};

              var value = ${f}(${a});
              var pad = 0;
              ${b}
              ${h}
              ${g}
              ${s}

              output[global_idx] = value;
            }`}else{if(p)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let h=o.kernelShape.length,b=o.pads.length,g="";return d?g=`
                if (xIndices[j] >= uniforms.x_shape[j]) {
                  pad++;
                  isPad = true;
                  break;
                }
              }
              if (!isPad) {
                let x_val = x[${t.indicesToOffset("xIndices")}];
                ${i}
              }`:g=`
              }
              let x_val = x[${t.indicesToOffset("xIndices")}];
              ${i}
            `,`
            ${e.registerUniforms(u).declareVariables(t,m)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
              let indices = ${m.offsetToIndices("global_idx")};
              var xIndices = ${m.offsetToIndices("global_idx")};

              var offsets: array<u32, ${h}>;

              var value = ${f}(${a});
              var pad = 0;
              var isPad = false;

              for (var i: u32 = 0u; i < uniforms.kernelSize; i++) {
                var offset = i;
                for (var j = 0u; j < ${h-1}u; j++) {
                  offsets[j] = offset / ${U("uniforms.kernelStrides","j",h)};
                  offset -= offsets[j] * ${U("uniforms.kernelStrides","j",h)};
                }
                offsets[${h-1}] = offset;

                isPad = false;
                for (var j = ${n-h}u; j < ${n}u; j++) {
                  xIndices[j] = indices[j] * ${U("uniforms.strides",`j - ${n-h}u`,h)}
                    + offsets[j - ${n-h}u] - ${U("uniforms.pads","j - 2u",b)};
                  ${g}
              }
              ${s}

              output[global_idx] = value;
            }`}},Sa=e=>`${e.format};${e.ceilMode};${e.autoPad};${e.kernelShape.length}`,Oc=e=>`${Sa(e)};${e.countIncludePad}`,Mc=e=>`${Sa(e)};${e.storageOrder};${e.dilations}`,Ta=e=>({format:e.format,autoPad:["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],ceilMode:e.ceil_mode,kernelShape:e.kernel_shape,strides:e.strides,pads:e.pads}),Ia=(e,t,n,r)=>{let[o,i]=$a(t,r,n),s=T("x",t.dataType,t.dims.length),a=s.type.value,u="value += x_val;",d="";o.countIncludePad?d+=`value /= ${a}(uniforms.kernelSize);`:d+=`value /= ${a}(i32(uniforms.kernelSize) - pad);`;let[l,c,p,f,m]=va(i,o);l.push(...z(t.dims,i));let h=["rank"];return{name:e,shaderCache:{hint:`${r.cacheKey};${p};${f};${m}`,inputDependencies:h},getRunData:()=>({outputs:[{dims:i,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(x.size(i)/64)},programUniforms:l}),getShaderSource:b=>xa(b,s,t.dims.length,i.length,o,u,d,0,c,p,f,m)}},Ca=e=>{let t=e.count_include_pad!==0,n=Ta(e);if(n.ceilMode!==0)throw new Error("ceil_mode output-shape is computed, but ceil_mode kernel execution (padding/divisor) is not yet implemented in the WebGPU AveragePool kernel");let r={countIncludePad:t,...n,cacheKey:""};return{...r,cacheKey:Oc(r)}},Aa=(e,t)=>{Jt(e.inputs),e.compute(Ia("AveragePool",e.inputs[0],!1,t))},ka={autoPad:"",ceilMode:0,countIncludePad:!1,kernelShape:[],strides:[],pads:[],storageOrder:0,dilations:[]},Ea=e=>{let t=e.format;return{format:t,...ka,cacheKey:t}},Pa=(e,t)=>{Jt(e.inputs),e.compute(Ia("GlobalAveragePool",e.inputs[0],!0,t))},za=(e,t,n,r)=>{let[o,i]=$a(t,r,n),s=`
      value = max(x_val, value);
    `,a="",u=T("x",t.dataType,t.dims.length),d=["rank"],[l,c,p,f,m]=va(i,o);return l.push(...z(t.dims,i)),{name:e,shaderCache:{hint:`${r.cacheKey};${p};${f};${m}`,inputDependencies:d},getRunData:()=>({outputs:[{dims:i,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(x.size(i)/64)},programUniforms:l}),getShaderSource:h=>xa(h,u,t.dims.length,i.length,o,s,a,t.dataType===10?-65504:-1e5,c,p,f,m)}},Da=(e,t)=>{Jt(e.inputs),e.compute(za("MaxPool",e.inputs[0],!1,t))},Ba=e=>{let t=e.storage_order,n=e.dilations,r=Ta(e);if(t!==0)throw new Error("column major storage order is not yet supported for MaxPool");if(r.ceilMode!==0)throw new Error("ceil_mode output-shape is computed, but ceil_mode kernel execution (padding) is not yet implemented in the WebGPU MaxPool kernel");let o={storageOrder:t,dilations:n,...r,cacheKey:""};return{...o,cacheKey:Mc(o)}},Oa=e=>{let t=e.format;return{format:t,...ka,cacheKey:t}},Ma=(e,t)=>{Jt(e.inputs),e.compute(za("GlobalMaxPool",e.inputs[0],!0,t))}});var Rc,Vc,Ra,Va,La=E(()=>{H();j();ue();Q();Rc=(e,t)=>{if(e.length<2||e.length>3)throw new Error("DequantizeLinear requires 2 or 3 inputs.");if(e.length===3&&e[1].dims===e[2].dims)throw new Error("x-scale and x-zero-point must have the same shape.");if(e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[1].dims.length!==0&&e[1].dims.length!==1&&e[1].dims.length!==e[0].dims.length)throw new Error("scale input must be a scalar, a 1D tensor, or have the same rank as the input tensor.");if(e.length>2){if(e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[1].dims.length!==e[2].dims.length)throw new Error("scale and zero-point inputs must have the same rank.");if(!e[1].dims.map((n,r)=>n===e[2].dims[r]).reduce((n,r)=>n&&r,!0))throw new Error("scale and zero-point inputs must have the same shape.")}if(t.blockSize>0){if(e[1].dims.length===0||e[1].dims.length===1&&e[1].dims[0]===1)throw new Error("blockSize must be set only for block quantization.");if(!e[1].dims.map((o,i)=>i===t.axis||o===e[0].dims[i]).reduce((o,i)=>o&&i,!0))throw new Error("For block qunatization, scale input shape to match the input shape except for the axis");if(e[1].dims.length!==e[0].dims.length)throw new Error("For block qunatization the scale input rank must be the same as the x rank.");let n=e[0].dims[t.axis],r=e[1].dims[t.axis];if(t.blockSize<Math.ceil(n/r)||t.blockSize>Math.ceil(n/(r-1)-1))throw new Error("blockSize must be with in the range [ceil(dI / Si), ceil(dI / (Si - 1) - 1)].")}},Vc=(e,t)=>{let n=x.normalizeAxis(t.axis,e[0].dims.length),r=e[0].dataType,o=r===3,i=e[0].dims,s=e[1].dataType,a=x.size(i),u=r===3||r===2,d=u?[Math.ceil(x.size(e[0].dims)/4)]:e[0].dims,l=e[1].dims,c=e.length>2?e[2]:void 0,p=c?u?[Math.ceil(x.size(c.dims)/4)]:c.dims:void 0,f=l.length===0||l.length===1&&l[0]===1,m=f===!1&&l.length===1,h=J(a),b=f&&(!u||h===4),g=b?h:1,y=b&&!u?h:1,_=T("input",u?12:r,d.length,y),w=T("scale",s,l.length),$=c?T("zero_point",u?12:r,p.length):void 0,v=A("output",s,i.length,g),I=[_,w];$&&I.push($);let S=[d,l];c&&S.push(p);let C=[{type:12,data:a/g},{type:12,data:n},{type:12,data:t.blockSize},...z(...S,i)],P=R=>{let O=[{name:"output_size",type:"u32"},{name:"axis",type:"u32"},{name:"block_size",type:"u32"}];return`
      ${R.registerUniforms(O).declareVariables(...I,v)}
      ${R.mainStart()}
          ${R.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let output_indices = ${v.offsetToIndices("global_idx")};

          // Set input x
          ${u?`
            let input = ${_.getByOffset("global_idx / 4")};
            let x_vec = ${o?"unpack4xI8(input)":"unpack4xU8(input)"};
            let x_value = ${g===1?"x_vec[global_idx % 4]":"x_vec"};`:`let x_value = ${_.getByOffset("global_idx")};`};

          // Set scale input
          ${f?`let scale_value= ${w.getByOffset("0")}`:m?`
            let scale_index = ${v.indicesGet("output_indices","uniforms.axis")};
            let scale_value= ${w.getByOffset("scale_index")};`:`
            var scale_indices: ${w.type.indices} = output_indices;
            let index = ${w.indicesGet("scale_indices","uniforms.axis")} / uniforms.block_size;
            ${w.indicesSet("scale_indices","uniforms.axis","index")};
            let scale_value= ${w.getByIndices("scale_indices")};`};

          // Set zero-point input
          ${$?f?u?`
                let zero_point_input = ${$.getByOffset("0")};
                let zero_point_vec =  ${o?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value= zero_point_vec[0]`:`let zero_point_value = ${$.getByOffset("0")}`:m?u?`
                let zero_point_index = ${v.indicesGet("output_indices","uniforms.axis")};
                let zero_point_input = ${$.getByOffset("zero_point_index / 4")};
                let zero_point_vec =  ${o?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_index % 4]`:`
                let zero_point_index = ${v.indicesGet("output_indices","uniforms.axis")};
                let zero_point_value = ${$.getByOffset("zero_point_index")};`:u?`
                let zero_point_offset = ${w.indicesToOffset("scale_indices")};
                let zero_point_input = ${$.getByOffset("zero_point_offset / 4")};
                let zero_point_vec = ${o?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_offset % 4];`:`let zero_point_value = ${$.getByIndices("scale_indices")};`:`let zero_point_value = ${u?o?"i32":"u32":_.type.value}(0);`};
      // Compute and write output
      ${v.setByOffset("global_idx",`${v.type.value}(x_value - zero_point_value) * scale_value`)};
      }`};return{name:"DequantizeLinear",shaderCache:{hint:t.cacheKey,inputDependencies:$?["rank","rank","rank"]:["rank","rank"]},getShaderSource:P,getRunData:()=>({outputs:[{dims:i,dataType:s}],dispatchGroup:{x:Math.ceil(a/g/64),y:1,z:1},programUniforms:C})}},Ra=(e,t)=>{Rc(e.inputs,t),e.compute(Vc(e.inputs,t))},Va=e=>G({axis:e.axis,blockSize:e.blockSize})});var Lc,Nc,Na,Wa=E(()=>{$e();H();Q();Lc=(e,t,n)=>{let r=e===t,o=e<t&&n<0,i=e>t&&n>0;if(r||o||i)throw new Error("Range these inputs' contents are invalid.")},Nc=(e,t,n,r)=>{let o=Math.abs(Math.ceil((t-e)/n)),i=[o],s=o,a=[{type:12,data:s},{type:r,data:e},{type:r,data:n},...z(i)],u=d=>{let l=A("output",r,i.length),c=l.type.value,p=[{name:"outputSize",type:"u32"},{name:"start",type:c},{name:"delta",type:c}];return`
        ${d.registerUniforms(p).declareVariables(l)}
        ${d.mainStart()}
        ${d.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        output[global_idx] = uniforms.start + ${c}(global_idx) * uniforms.delta;
      }`};return{name:"Range",shaderCache:{hint:`${r}`},getShaderSource:u,getRunData:()=>({outputs:[{dims:i,dataType:r}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:a})}},Na=e=>{let t=0,n=0,r=0;e.inputs[0].dataType===6?(t=e.inputs[0].getInt32Array()[0],n=e.inputs[1].getInt32Array()[0],r=e.inputs[2].getInt32Array()[0]):e.inputs[0].dataType===1&&(t=e.inputs[0].getFloat32Array()[0],n=e.inputs[1].getFloat32Array()[0],r=e.inputs[2].getFloat32Array()[0]),ie.webgpu.validateInputContent&&Lc(t,n,r),e.compute(Nc(t,n,r,e.inputs[0].dataType),{inputs:[]})}});var Wc,Gc,Ga,Ha,qa=E(()=>{H();j();ue();Q();Wc=(e,t,n,r)=>{if(e!=="none"&&r!=="i32"&&r!=="u32"&&r!=="f32")throw new Error(`Input ${r} is not supported with reduction ${e}.`);let o=`{
                var oldValue = 0;
                loop {
                  let newValueF32 =`,i=`;
                  let newValue = bitcast<i32>(newValueF32);
                  let res = atomicCompareExchangeWeak(&${t}, oldValue, newValue);
                  if res.exchanged {
                    break;
                  }
                  oldValue = res.old_value;
                }
              }`;switch(e){case"none":return`${t}=${n};`;case"add":return r==="i32"||r==="u32"?`atomicAdd(&${t}, bitcast<${r}>(${n}));`:`
              ${o}bitcast<${r}>(oldValue) + (${n})${i}`;case"max":return r==="i32"||r==="u32"?`atomicMax(&${t}, bitcast<${r}>(${n}));`:`
                ${o}max(bitcast<f32>(oldValue), (${n}))${i}`;case"min":return r==="i32"||r==="u32"?`atomicMin(&${t}, bitcast<${r}>(${n}));`:`${o}min(bitcast<${r}>(oldValue), (${n}))${i}`;case"mul":return`${o}(bitcast<${r}>(oldValue) * (${n}))${i}`;default:throw new Error(`Reduction ${e} is not supported.`)}},Gc=(e,t)=>{let n=e[0].dims,r=e[1].dims,o=n,i=1,s=Math.ceil(x.sizeToDimension(r,r.length-1)/i),a=r[r.length-1],u=x.sizeFromDimension(n,a),d=[{type:12,data:s},{type:12,data:a},{type:12,data:u},...z(e[1].dims,e[2].dims,o)],l=c=>{let p=T("indices",e[1].dataType,e[1].dims.length),f=T("updates",e[2].dataType,e[2].dims.length,i),m=t.reduction!=="none"&&t.reduction!==""?io("output",e[0].dataType,o.length):A("output",e[0].dataType,o.length,i);return`
      ${c.registerUniform("output_size","u32").registerUniform("last_index_dimension","u32").registerUniform("num_updates_elements","u32").declareVariables(p,f,m)}
      ${c.mainStart()}
        ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
  var data_offset = 0u;
  let indices_start = uniforms.last_index_dimension * global_idx;
  let indices_end = indices_start + uniforms.last_index_dimension;
  for (var i = indices_start; i < indices_end; i++) {
    var index = i32(indices[i].x);
    ${e[0].dims.length===1?`
    let element_count_dim = uniforms.output_strides;
    let dim_value = uniforms.output_shape;`:`
    let element_count_dim = uniforms.output_strides[i - indices_start];
    let dim_value = uniforms.output_shape[i - indices_start];`}
    if (index >= 0) {
      if (index >= i32(dim_value)) {
        index = i32(dim_value - 1);
      }
    } else {
      if (index < -i32(dim_value)) {
        index = 0;
      } else {
        index += i32(dim_value);
      }
    }
    data_offset += u32((u32(index) * element_count_dim));
  }

  for (var i = 0u; i < uniforms.num_updates_elements; i++) {
    let value = updates[uniforms.num_updates_elements * global_idx + i];
    ${Wc(t.reduction,"output[data_offset + i]","value",m.type.value)}
  }

      }`};return{name:"ScatterND",shaderCache:{hint:`${t.cacheKey}_${t.reduction}`,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:o,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:d}),getShaderSource:l}},Ga=e=>G({reduction:e.reduction}),Ha=(e,t)=>{e.compute(Gc(e.inputs,t),{inputs:[e.inputs[1],e.inputs[2]],outputs:[]})}});var Hc,qc,Fc,Fa,Kc,jc,Zc,Qc,Xc,Yc,Jc,ep,Ka,tp,np,rp,op,ip,ja,Za,Qa=E(()=>{H();j();ue();Q();Hc=(e,t)=>{if(e.every(n=>n>0||(()=>{throw new Error("Resize requires scales input values to be positive")})),e.length>0){if(t.mode==="linear"){if(!(e.length===2||e.length===3||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1||e.length===5&&e[0]===1&&e[1]===1))throw new Error(`For linear mode, Resize requires scales to be 2D, 3D, 4D with either two outermost or one innermost and
            one outermost scale values equal to 1, or 5D with two outermost scale values equal to 1`)}else if(t.mode==="cubic"&&!(e.length===2||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1))throw new Error("Resize requires scales input size to be 2 or 4 for cubic mode")}},qc=(e,t,n)=>{t.every(o=>o>=0&&o<n||(()=>{throw new Error("Resize requires axes input values to be positive and less than rank")}));let r=new Array(n).fill(1);return t.forEach((o,i)=>r[o]=e[i]),r},Fc=(e,t,n,r,o,i)=>{let[s,a,u]=n>10?[1,2,3]:[-1,e.length>1?1:-1,-1],d=e[0].dims.length;if(s>0&&e.length>s&&e[s].dims.length>0)e[s].getFloat32Array().forEach(l=>i.push(l));else if(t.coordinateTransformMode==="tf_crop_and_resize")throw new Error("Resize requires RoI input to be specified when coordinateTransformMode is tfCropAndResize");if(a>0&&e.length>a&&e[a].dims.length===1&&e[a].dims[0]>0){if(e[a].getFloat32Array().forEach(l=>r.push(l)),r.length!==0&&r.length!==d&&n>=18&&r.length!==t.axes.length)throw new Error("Resize requires scales input size to be same as input rank or axes size for opset 18 and up");Hc(r,t),t.axes.length>0&&qc(r,t.axes,d).forEach((l,c)=>r[c]=l)}if(u>0&&e.length>u&&e[u].dims.length===1&&e[u].dims[0]>0&&(e[u].getBigInt64Array().forEach(l=>o.push(Number(l))),o.length!==0&&o.length!==d&&n>=18&&o.length!==t.axes.length))throw new Error("Resize requires sizes input size to be same as input rank or axes size for opset 18 and up");if(t.axes.length>0){if(r.length!==0&&r.length!==t.axes.length)throw new Error('Resize requires "scales" input size to be of axes rank when axes attributes is specified');if(o.length!==0&&o.length!==t.axes.length)throw new Error('Resize requires "sizes" input size to be of rank axes rank when axes attributes is specified')}if(typeof r<"u"&&typeof o<"u"&&r.length>0&&o.length>d)throw new Error("Resize requires only of scales or sizes to be specified")},Fa=(e,t,n,r)=>`
  // The whole part and the fractional part are calculated separately due to inaccuracy of floating
  // point division. As an example, f32(21) / f32(7) may evaluate to 2.99... instead of 3, causing an
  // offset-by-one error later in floor().
  let big = (${e}) * (${t});
  let whole = ${r}(big / (${n}));
  let fract = ${r}(big % (${n})) / ${r}(${n});
  return whole + fract;
`,Kc=(e,t)=>`fn getOriginalCoordinateFromResizedCoordinate(xResized: u32, xScale: f32, lengthResized: u32,
     lengthOriginal: u32, roiStart: f32, roiEnd: f32) -> ${t} { `+(()=>{switch(e){case"asymmetric":return`
          if (xScale < 1.0 || floor(xScale) != xScale) {
            return ${t}(xResized) / ${t}(xScale);
          } else {
            ${Fa("xResized","lengthOriginal","lengthResized",t)}
          }
        `;case"pytorch_half_pixel":return`if (lengthResized > 1) {
                    return (${t}(xResized) + 0.5) / ${t}(xScale) - 0.5;
                  } else {
                    return 0.0;
                  }`;case"tf_half_pixel_for_nn":return`return (${t}(xResized) + 0.5) / ${t}(xScale);`;case"align_corners":return`if (lengthResized == 1) {
                    return 0.0;
                  } else {
                    ${Fa("xResized","lengthOriginal - 1","lengthResized - 1",t)}
                  }`;case"tf_crop_and_resize":return`if (lengthResized > 1) {
                    return ${t}(roiStart) * ${t}(lengthOriginal - 1) +
                        (${t}(xResized) * ${t}(roiEnd - roiStart) * ${t}(lengthOriginal - 1)) /
                        ${t}(lengthResized - 1);
                  } else {
                    return 0.5 * ${t}(roiStart + roiEnd) * ${t}(lengthOriginal - 1);
                  }`;case"half_pixel_symmetric":return`const outputWidth = ${t}xScale * ${t}(lengthResized);
                  const adjustment = ${t}(lengthResized) / outputWidth;
                  const center = ${t}(lengthOriginal) / 2;
                  const offset = center * (1 - adjustment);
                  return offset + ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;case"half_pixel":return`return ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;default:throw new Error(`Coordinate transform mode ${e} is not supported`)}})()+"}",jc=(e,t,n)=>`fn getNearestPixelFromOriginal(xOriginal: ${n}, isDownSample: bool) -> ${n} {`+(()=>{switch(e){case"round_prefer_ceil":return"if (fract(xOriginal) == 0.5) {             return ceil(xOriginal);           } else {             return round(xOriginal);           }";case"floor":return"return floor(xOriginal);";case"ceil":return"return ceil(xOriginal);";case"round_prefer_floor":return"if (fract(xOriginal) == 0.5) {                     return floor(xOriginal);                   } else {                     return round(xOriginal);                   }";default:if(t<11)return"if (isDownSample)                     {                       return ceil(xOriginal);                     } else {                       return xOriginal;                     }";throw new Error(`Nearest mode ${e} is not supported`)}})()+"}",Zc=(e,t,n)=>{let r=new Array(n).fill(0).concat(new Array(n).fill(1)),o=e.length===0?r:e.slice();return t.length>0?(t.forEach((i,s)=>{r[i]=o[s],r[s+n]=o[t.length+s]}),r):o},Qc=(e,t,n,r)=>{let o=[];if(n.length>0)if(r.length>0){if(e.forEach(i=>o.push(i)),Math.max(...r)>e.length)throw new Error("axes is out of bound");r.forEach((i,s)=>o[i]=n[s])}else n.forEach(i=>o.push(i));else{if(t.length===0)throw new Error("Resize requires either scales or sizes.");o=e.map((i,s)=>Math.round(i*t[s]))}return o},Xc=(e,t,n)=>{let r=(()=>{switch(n.keepAspectRatioPolicy){case"not_larger":return n.axes.length>0?Math.min(...n.axes.map(i=>t[i]),Number.MAX_VALUE):Math.min(...t,Number.MAX_VALUE);case"not_smaller":return n.axes.length>0?Math.max(...n.axes.map(i=>t[i]),Number.MIN_VALUE):Math.max(...t,Number.MIN_VALUE);default:throw new Error(`Keep aspect ratio policy ${n.keepAspectRatioPolicy} is not supported`)}})();t.fill(1,0,t.length);let o=e.slice();return n.axes.length>0?(n.axes.forEach(i=>t[i]=r),n.axes.forEach(i=>o[i]=Math.round(e[i]*t[i]))):(t.fill(r,0,t.length),o.forEach((i,s)=>o[s]=Math.round(i*t[s]))),o},Yc=(e,t,n,r,o)=>`
    fn calculateOriginalIndicesFromOutputIndices(output_indices: ${e.type.indices}) -> array<${e.type.value}, ${n.length}> {
      var original_indices: array<${e.type.value}, ${n.length}>;
      for (var i:u32 = 0; i < ${n.length}; i++) {
        var output_index = ${e.indicesGet("output_indices","i")};
        var scale = ${U("uniforms.scales","i",r)};
        var roi_low = ${U("uniforms.roi","i",o)};
        var roi_hi = ${U("uniforms.roi",`i + ${t.length}`,o)};
        if (scale == 1.0) {
          original_indices[i] = ${e.type.value}(output_index);
        } else {
          var input_shape_i = ${U("uniforms.input_shape","i",t.length)};
          var output_shape_i = ${U("uniforms.output_shape","i",n.length)};
          original_indices[i] = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                           input_shape_i, roi_low, roi_hi);
        }
      }
      return original_indices;
    }`,Jc=(e,t,n,r,o,i,s)=>`
    fn calculateInputIndicesFromOutputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
      var input_indices: ${e.type.indices};
      for (var i:u32 = 0; i < ${r.length}; i++) {
        var output_index = ${t.indicesGet("output_indices","i")};
        var input_index: u32;
        var scale = ${U("uniforms.scales","i",o)};
        if (scale == 1.0) {
          input_index = output_index;
        } else {
          var roi_low = ${U("uniforms.roi","i",i)};
          var roi_hi = ${U("uniforms.roi",`i + ${n.length}`,i)};
          var input_shape_i = ${U("uniforms.input_shape","i",n.length)};
          var output_shape_i = ${U("uniforms.output_shape","i",r.length)};
          var original_idx = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                        input_shape_i, roi_low, roi_hi);
          if (!${s} || (original_idx >= 0 && original_idx < ${t.type.value}(input_shape_i))) {
            if (original_idx < 0) {
              input_index = 0;
            } else if (original_idx > ${t.type.value}(input_shape_i - 1)) {
              input_index = input_shape_i - 1;
            } else {
              input_index = u32(getNearestPixelFromOriginal(original_idx, scale < 1));
            }
          } else {
            input_index = u32(original_idx);
          }
        }
        ${e.indicesSet("input_indices","i","input_index")}
      }
      return input_indices;
    }`,ep=(e,t)=>`
    fn checkInputIndices(input_indices: ${e.type.indices}) -> bool {
      for (var i:u32 = 0; i < ${t.length}; i++) {
        var input_index = ${e.indicesGet("input_indices","i")};
        if (input_index < 0 || input_index >= ${U("uniforms.input_shape","i",t.length)}) {
          return false;
        }
      }
      return true;
    }`,Ka=(e,t,n,r)=>e.rank>r?`
    ${e.indicesSet("input_indices",t,"channel")};
    ${e.indicesSet("input_indices",n,"batch")};
`:"",tp=(e,t,n,r,o)=>{let[s,a,u,d]=n.length===2?[-1,0,1,-1]:[0,2,3,1],l=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, row: u32, col: u32) -> ${l} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",a,`max(0, min(row, ${n[a]} - 1))`)};
      ${e.indicesSet("input_indices",u,`max(0, min(col, ${n[u]} - 1))`)};
      ${Ka(e,d,s,2)}
      return ${e.getByIndices("input_indices")};
    }

    fn bilinearInterpolation(output_indices: ${t.type.indices}) -> ${l} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var row:${l} = originalIndices[${a}];
      var col:${l} = originalIndices[${u}];
      ${r?`if (row < 0 || row > (${n[a]} - 1) || col < 0 || col > (${n[u]} - 1)) {
        return ${o};
      }`:""};
      row = max(0, min(row, ${n[a]} - 1));
      col = max(0, min(col, ${n[u]} - 1));
      var row1: u32 = u32(row);
      var col1: u32 = u32(col);
      var row2: u32 = u32(row + 1);
      var col2: u32 = u32(col + 1);
      var channel: u32 = ${n.length>2?`u32(originalIndices[${d}])`:"0"};
      var batch: u32 =  ${n.length>2?`u32(originalIndices[${s}])`:"0"};
      var x11: ${l} = getInputValue(batch, channel, row1, col1);
      var x12: ${l} = getInputValue(batch, channel, row1, col2);
      var x21: ${l} = getInputValue(batch, channel, row2, col1);
      var x22: ${l} = getInputValue(batch, channel, row2, col2);
      var dx1: ${l} = abs(row - ${l}(row1));
      var dx2: ${l} = abs(${l}(row2) - row);
      var dy1: ${l} = abs(col - ${l}(col1));
      var dy2: ${l} = abs(${l}(col2) - col);
      if (row1 == row2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (col1 == col2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      return (x11 * dx2 * dy2 + x12 * dx2 * dy1 + x21 * dx1 * dy2 + x22 * dx1 * dy1);
    }`},np=(e,t,n,r,o,i,s,a,u,d)=>{let l=n.length===2,c=!0,[p,f]=l?[0,1]:c?[2,3]:[1,2],m=e.type.value,h=b=>{let g=b===p?"row":"col";return`
      fn ${g}CubicInterpolation(input_indices: ${e.type.indices}, output_indices: ${t.type.indices}) -> ${m} {
        var output_index = ${t.indicesGet("output_indices",b)};
        var originalIdx: ${m} = getOriginalCoordinateFromResizedCoordinate(output_index, ${o[b]},
        ${r[b]}, ${n[b]}, ${i[b]}, ${i[b]} + ${n.length});
        var fractOriginalIdx: ${m} = originalIdx - floor(originalIdx);
        var coefs = getCubicInterpolationCoefs(fractOriginalIdx);

        if (${a} && (originalIdx < 0 || originalIdx > (${n[b]} - 1))) {
          return ${u};
        }
        var data: array<${m}, 4> = array<${m}, 4>(0.0, 0.0, 0.0, 0.0);
        for (var i: i32 = -1; i < 3; i++) {
          var ${g}: ${m} = originalIdx + ${m}(i);
          if (${g} < 0 || ${g} >= ${n[b]}) {
            ${d?`coefs[i + 1] = 0.0;
                        continue;`:a?`return ${u};`:`${g} = max(0, min(${g}, ${n[b]} - 1));`};
          }
        var input_indices_copy: ${e.type.indices} = input_indices;
          ${e.indicesSet("input_indices_copy",b,`u32(${g})`)};
          data[i + 1] = ${b===p?e.getByIndices("input_indices_copy"):"rowCubicInterpolation(input_indices_copy, output_indices)"};
        }
        return cubicInterpolation1D(data, coefs);
      }`};return`
    ${h(p)};
    ${h(f)};
  fn getCubicInterpolationCoefs(s: ${m}) -> array<${m}, 4> {
    var absS = abs(s);
    var coeffs: array<${m}, 4> = array<${m}, 4>(0.0, 0.0, 0.0, 0.0);
    var oneMinusAbsS: ${m} = 1.0 - absS;
    var twoMinusAbsS: ${m} = 2.0 - absS;
    var onePlusAbsS: ${m} = 1.0 + absS;
    coeffs[0] = ((${s} * onePlusAbsS - 5 * ${s}) * onePlusAbsS + 8 * ${s}) * onePlusAbsS - 4 * ${s};
    coeffs[1] = ((${s} + 2) * absS - (${s} + 3)) * absS * absS + 1;
    coeffs[2] = ((${s} + 2) * oneMinusAbsS - (${s} + 3)) * oneMinusAbsS * oneMinusAbsS + 1;
    coeffs[3] = ((${s} * twoMinusAbsS - 5 * ${s}) * twoMinusAbsS + 8 * ${s}) * twoMinusAbsS - 4 * ${s};
    return coeffs;
  }

  fn cubicInterpolation1D(x: array<${m}, 4>, coefs: array<${m}, 4>) -> ${m} {
    var coefsSum: ${m} = coefs[0] + coefs[1] + coefs[2] + coefs[3];
    return (x[0] * coefs[0] + x[1] * coefs[1]+ x[2] * coefs[2]+ x[3] * coefs[3]) / coefsSum;
  }

  fn bicubicInterpolation(output_indices: ${t.type.indices}) -> ${m} {
    var input_indices: ${e.type.indices} = output_indices;
    return colCubicInterpolation(input_indices, output_indices);
  }
    `},rp=(e,t,n,r,o)=>{let[s,a,u,d,l]=n.length===3?[-1,0,1,2,-1]:[0,2,3,4,1],c=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, depth:u32, height: u32, width: u32) -> ${c} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",a,`max(0, min(depth, ${n[a]} - 1))`)};
      ${e.indicesSet("input_indices",u,`max(0, min(height, ${n[u]} - 1))`)};
      ${e.indicesSet("input_indices",d,`max(0, min(width, ${n[d]} - 1))`)};
      ${Ka(e,l,s,3)}
      return ${e.getByIndices("input_indices")};
    }

    fn trilinearInterpolation(output_indices: ${t.type.indices}) -> ${c} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var depth:${c} = originalIndices[${a}];
      var height:${c} = originalIndices[${u}];
      var width:${c} = originalIndices[${d}];
      ${r?`if (depth < 0 || depth > (${n[a]} - 1) || height < 0 || height > (${n[u]} - 1) || width < 0 || (width > ${n[d]} - 1)) {
      return ${o};
        }`:""};

    depth = max(0, min(depth, ${n[a]} - 1));
      height = max(0, min(height, ${n[u]} - 1));
      width = max(0, min(width, ${n[d]} - 1));
      var depth1: u32 = u32(depth);
      var height1: u32 = u32(height);
      var width1: u32 = u32(width);
      var depth2: u32 = u32(depth + 1);
      var height2: u32 = u32(height + 1);
      var width2: u32 = u32(width + 1);
      var channel: u32 = ${n.length>3?`u32(originalIndices[${l}])`:"0"};
      var batch: u32 =  ${n.length>3?`u32(originalIndices[${s}])`:"0"};

      var x111: ${c} = getInputValue(batch, channel, depth1, height1, width1);
      var x112: ${c} = getInputValue(batch, channel, depth1, height1, width2);
      var x121: ${c} = getInputValue(batch, channel, depth1, height2, width1);
      var x122: ${c} = getInputValue(batch, channel, depth1, height2, width2);
      var x211: ${c} = getInputValue(batch, channel, depth2, height1, width1);
      var x212: ${c} = getInputValue(batch, channel, depth2, height1, width2);
      var x221: ${c} = getInputValue(batch, channel, depth2, height2, width1);
      var x222: ${c} = getInputValue(batch, channel, depth2, height2, width2);
      var dx1: ${c} = abs(depth - ${c}(depth1));
      var dx2: ${c} = abs(${c}(depth2) - depth);
      var dy1: ${c} = abs(height - ${c}(height1));
      var dy2: ${c} = abs(${c}(height2) - height);
      var dz1: ${c} = abs(width - ${c}(width1));
      var dz2: ${c} = abs(${c}(width2) - width);
      if (depth1 == depth2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (height1 == height2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      if (width1 == width2) {
        dz1 = 0.5;
        dz2 = 0.5;
      }
      return (x111 * dx2 * dy2 * dz2 + x112 * dx2 * dy2 * dz1 + x121 * dx2 * dy1 *dz2 + x122 * dx2 * dy1 * dz1 +
              x211 * dx1 * dy2 * dz2 + x212 * dx1 * dy2 * dz1 + x221 * dx1 * dy1 *dz2 + x222 * dx1 * dy1 * dz1);
    }`},op=(e,t,n,r,o,i)=>{let s=e.dims,a=Zc(i,t.axes,s.length),u=Qc(s,r,o,t.axes),d=r.slice();r.length===0&&(d=s.map((y,_)=>y===0?1:u[_]/y),t.keepAspectRatioPolicy!=="stretch"&&(u=Xc(s,d,t)));let l=A("output",e.dataType,u.length),c=T("input",e.dataType,s.length),p=x.size(u),f=s.length===u.length&&s.every((y,_)=>y===u[_]),m=t.coordinateTransformMode==="tf_crop_and_resize",h=t.extrapolationValue,b=c.type.value,g=y=>`
      ${f?"":`
      ${Kc(t.coordinateTransformMode,b)};
      ${(()=>{switch(t.mode){case"nearest":return`
              ${ep(c,s)};
              ${jc(t.nearestMode,n,b)};
              ${Jc(c,l,s,u,d.length,a.length,m)};
              `;case"linear":return`
              ${Yc(l,s,u,d.length,a.length)};
              ${(()=>{if(s.length===2||s.length===4)return`${tp(c,l,s,m,h)}`;if(s.length===3||s.length===5)return`${rp(c,l,s,m,h)}`;throw Error("Linear mode only supports input dims 2, 3, 4 and 5 are supported in linear mode.")})()};
            `;case"cubic":return`
            ${(()=>{if(s.length===2||s.length===4)return`${np(c,l,s,u,d,a,t.cubicCoeffA,m,t.extrapolationValue,t.excludeOutside)}`;throw Error("Cubic mode only supports input dims 2 and 4 are supported in linear mode.")})()};
            `;default:throw Error("Invalid resize mode")}})()};
      `}
      ${y.registerUniform("output_size","u32").registerUniform("scales","f32",d.length).registerUniform("roi","f32",a.length).declareVariables(c,l)}
      ${y.mainStart()}
        ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
        ${f?"output[global_idx] = input[global_idx];":`
        let output_indices = ${l.offsetToIndices("global_idx")};
        var input_indices: ${c.type.indices};
        ${(()=>{switch(t.mode){case"nearest":return`input_indices = calculateInputIndicesFromOutputIndices(output_indices);
                if (checkInputIndices(input_indices)) {
                  output[global_idx] = ${c.getByIndices("input_indices")};
                } else {
                  output[global_idx] = ${t.extrapolationValue};
                }`;case"linear":return`output[global_idx] = ${s.length===2||s.length===4?"bilinearInterpolation":"trilinearInterpolation"}(output_indices);`;case"cubic":return"output[global_idx] = bicubicInterpolation(output_indices);";default:throw Error(`Unsupported resize mode: ${t.mode}`)}})()};
`}
      }`;return{name:"Resize",shaderCache:{hint:`${t.cacheKey}|${n}|${d.length>0?t.mode==="cubic"?d:d.length:""}|${o.length>0?o:""}|${a.length>0?a:""}|${f}|${t.mode==="nearest"?s.length:s}`,inputDependencies:["rank"]},getShaderSource:g,getRunData:()=>({outputs:[{dims:u,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(p/64)},programUniforms:[{type:12,data:p},{type:1,data:d},{type:1,data:a},...z(s,u)]})}},ip=e=>{let t=e.customDataBuffer;return new Uint32Array(t.buffer,t.byteOffset,1)[0]},ja=(e,t)=>{let n=[],r=[],o=[],i=ip(e);if(t.antialias!==0)throw Error("Only default value (0) for Antialias attribute is supported");Fc(e.inputs,t,i,n,r,o),e.compute(op(e.inputs[0],t,i,n,r,o),{inputs:[0]})},Za=e=>{let t=e.antialias,n=e.axes,r=e.coordinateTransformMode,o=e.cubicCoeffA,i=e.excludeOutside!==0,s=e.extrapolationValue,a=e.keepAspectRatioPolicy,u=e.mode,d=e.nearestMode===""?"simple":e.nearestMode;return G({antialias:t,axes:n,coordinateTransformMode:r,cubicCoeffA:o,excludeOutside:i,extrapolationValue:s,keepAspectRatioPolicy:a,mode:u,nearestMode:d})}});var sp,ap,Xa,Ya=E(()=>{H();j();Q();sp=e=>{if(!e||e.length<3)throw new Error("layerNorm requires at least 3 inputs.");let t=e[0],n=e[1],r=e[2];if(t.dataType!==n.dataType||t.dataType!==r.dataType)throw new Error("All inputs must have the same data type");if(t.dims.length!==3&&t.dims.length!==2)throw new Error("Input must be 2D or 3D");if(n.dims.length!==3&&n.dims.length!==2)throw new Error("Skip must be 2D or 3D");let o=t.dims[t.dims.length-1],i=t.dims[t.dims.length-2];if(n.dims[n.dims.length-1]!==o)throw new Error("Skip must have the same hidden size as input");if(n.dims[n.dims.length-2]!==i)throw new Error("Skip must have the same sequence length as input");if(r.dims.length!==1)throw new Error("Gamma must be 1D");if(r.dims[r.dims.length-1]!==o)throw new Error("Gamma must have the same hidden size as input");if(e.length>3){let s=e[3];if(s.dims.length!==1)throw new Error("Beta must be 1D");if(s.dims[s.dims.length-1]!==o)throw new Error("Beta must have the same hidden size as input")}if(e.length>4){let s=e[4];if(s.dims.length!==1)throw new Error("Bias must be 1D");if(s.dims[s.dims.length-1]!==o)throw new Error("Bias must have the same hidden size as input")}},ap=(e,t,n,r)=>{let o=t.simplified,i=e[0].dims,s=x.size(i),a=i,u=s,d=i.slice(-1)[0],l=r?i.slice(0,-1).concat(1):[],c=!o&&e.length>3,p=e.length>4,f=r&&n>1,m=r&&n>2,h=n>3,b=64,g=J(d),y=[{type:12,data:u},{type:12,data:g},{type:12,data:d},{type:1,data:t.epsilon}],_=$=>{let v=[{name:"output_size",type:"u32"},{name:"components",type:"u32"},{name:"hidden_size",type:"u32"},{name:"epsilon",type:"f32"}],I=[T("x",e[0].dataType,e[0].dims,g),T("skip",e[1].dataType,e[1].dims,g),T("gamma",e[2].dataType,e[2].dims,g)];c&&I.push(T("beta",e[3].dataType,e[3].dims,g)),p&&I.push(T("bias",e[4].dataType,e[4].dims,g)),I.push(A("output",e[0].dataType,a,g)),f&&I.push(A("mean_output",1,l)),m&&I.push(A("inv_std_output",1,l)),h&&I.push(A("input_skip_bias_sum",e[0].dataType,a,g));let S=ne(e[0].dataType),C=ne(1,g);return`

      ${$.registerUniforms(v).declareVariables(...I)}
      var<workgroup> sum_shared : array<${C}, ${b}>;
      var<workgroup> sum_squared_shared : array<${C}, ${b}>;

      ${$.mainStart([b,1,1])}
        let ix = local_id.x;
        let iy = global_id.x / ${b};

        let hidden_size_vectorized: u32 = uniforms.hidden_size / uniforms.components;
        var stride = hidden_size_vectorized / ${b};
        let offset = ix * stride + iy * hidden_size_vectorized;
        let offset1d = stride * ix;
        if (ix == ${b-1}) {
          stride = hidden_size_vectorized - stride * ix;
        }
        for (var i: u32 = 0; i < stride; i++) {
          let skip_value = skip[offset + i];
          let bias_value = ${p?"bias[offset1d + i]":S+"(0.0)"};
          let input_value = x[offset + i];
          let value = input_value + skip_value + bias_value;
          ${h?"input_skip_bias_sum[offset + i] = value;":""}
          output[offset + i] = value;
          let f32_value = ${et(S,g,"value")};
          sum_shared[ix] += f32_value;
          sum_squared_shared[ix] += f32_value * f32_value;
        }
        workgroupBarrier();

        var reduce_size : u32 = ${b};
        for (var curr_size = reduce_size >> 1;  curr_size > 0; curr_size = reduce_size >> 1) {
          reduce_size = curr_size + (reduce_size & 1);
          if (ix < curr_size) {
            sum_shared[ix] += sum_shared[ix + reduce_size];
            sum_squared_shared[ix] += sum_squared_shared[ix + reduce_size];
          }
          workgroupBarrier();
        }

        let sum = sum_shared[0];
        let square_sum = sum_squared_shared[0];
        let mean = ${Se("sum",g)} / f32(uniforms.hidden_size);
        let inv_std_dev = inverseSqrt(${Se("square_sum",g)} / f32(uniforms.hidden_size) ${o?"":"- mean * mean"} + uniforms.epsilon);
        ${f?"mean_output[global_idx] = mean;":""}
        ${m?"inv_std_output[global_idx] = inv_std_dev;":""}

        for (var i: u32 = 0; i < stride; i++) {
          output[offset + i] = (output[offset + i] ${o?"":`- ${S}(mean)`}) *
            ${S}(inv_std_dev) * gamma[offset1d + i]
            ${c?"+ beta[offset1d + i]":""};
        }
      }`},w=[{dims:a,dataType:e[0].dataType}];return n>1&&w.push({dims:l,dataType:1}),n>2&&w.push({dims:l,dataType:1}),n>3&&w.push({dims:i,dataType:e[0].dataType}),{name:"SkipLayerNormalization",shaderCache:{hint:`${g};${f};${m};${h}`,inputDependencies:e.map(($,v)=>"type")},getShaderSource:_,getRunData:()=>({outputs:w,dispatchGroup:{x:Math.ceil(u/d)},programUniforms:y})}},Xa=(e,t)=>{sp(e.inputs);let r=[0];e.outputCount>1&&r.push(-3),e.outputCount>2&&r.push(-3),e.outputCount>3&&r.push(3),e.compute(ap(e.inputs,t,e.outputCount,!1),{outputs:r})}});var up,en,dp,Ja,lp,cp,eu,tu,nu=E(()=>{H();j();ue();Q();up=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");if(t.axes.length!==0){if(t.axes.length!==t.starts.length||t.axes.length!==t.ends.length)throw new Error("axes, starts and ends must have the same length")}else if(t.starts.length!==t.ends.length)throw new Error("starts and ends must have the same length");e.slice(1).forEach((n,r)=>{if(e[r+1].dataType!==6&&e[r+1].dataType!==7)throw new Error(`Input ${r} must be an array of int32 or int64`)})},en=(e,t)=>{let n=[];if(e.length>t)if(e[t].dataType===7)e[t].getBigInt64Array().forEach(r=>n.push(Number(r)));else if(e[t].dataType===6)e[t].getInt32Array().forEach(r=>n.push(Number(r)));else throw new Error(`Input ${t} must be an array of int32 or int64`);return n},dp=(e,t)=>{if(e.length>1){let n=en(e,1),r=en(e,2),o=en(e,3);return o.length===0&&(o=[...Array(e[0].dims.length).keys()]),G({starts:n,ends:r,axes:o})}else return t},Ja=(e,t,n,r,o)=>{let i=e;return e<0&&(i+=n[r[t]]),o[t]<0?Math.max(0,Math.min(i,n[r[t]]-1)):Math.max(0,Math.min(i,n[r[t]]))},lp=(e,t,n)=>`fn calculateInputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
          var input_indices: ${e.type.indices};
          var carry = 0u;
          for (var i = ${n.length-1}; i >= 0; i--) {
            let input_shape_i = ${U("uniforms.input_shape","i",n.length)};
            let steps_i = ${U("uniforms.steps","i",n.length)};
            let signs_i = ${U("uniforms.signs","i",n.length)};
            let starts_i = ${U("uniforms.starts","i",n.length)};
            var output_index = ${t.indicesGet("output_indices","i")};
            var input_index = output_index * steps_i + starts_i + carry;
            carry = input_index / input_shape_i;
            input_index = input_index % input_shape_i;
            if (signs_i < 0) {
              input_index = input_shape_i - input_index - 1u + starts_i;
            }
            ${e.indicesSet("input_indices","i","input_index")};
          }
          return input_indices;
      }`,cp=(e,t)=>{let n=e[0].dims,r=x.size(n),o=t.axes.length>0?x.normalizeAxes(t.axes,n.length):[...Array(n.length).keys()],i=en(e,4);i.forEach(g=>g!==0||(()=>{throw new Error("step cannot be 0")})),i.length===0&&(i=Array(o.length).fill(1));let s=t.starts.map((g,y)=>Ja(g,y,n,o,i)),a=t.ends.map((g,y)=>Ja(g,y,n,o,i));if(o.length!==s.length||o.length!==a.length)throw new Error("start, ends and axes should have the same number of elements");if(o.length!==n.length)for(let g=0;g<n.length;++g)o.includes(g)||(s.splice(g,0,0),a.splice(g,0,n[g]),i.splice(g,0,1));let u=i.map(g=>Math.sign(g));i.forEach((g,y,_)=>{if(g<0){let w=(a[y]-s[y])/g,$=s[y],v=$+w*i[y];s[y]=v,a[y]=$,_[y]=-g}});let d=n.slice(0);o.forEach((g,y)=>{d[g]=Math.ceil((a[g]-s[g])/i[g])});let l={dims:d,dataType:e[0].dataType},c=A("output",e[0].dataType,d.length),p=T("input",e[0].dataType,e[0].dims.length),f=x.size(d),m=[{name:"outputSize",type:"u32"},{name:"starts",type:"u32",length:s.length},{name:"signs",type:"i32",length:u.length},{name:"steps",type:"u32",length:i.length}],h=[{type:12,data:f},{type:12,data:s},{type:6,data:u},{type:12,data:i},...z(e[0].dims,d)],b=g=>`
      ${g.registerUniforms(m).declareVariables(p,c)}
        ${lp(p,c,n)}
        ${g.mainStart()}
          ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
          let output_indices = ${c.offsetToIndices("global_idx")};
          let input_indices = calculateInputIndices(output_indices);
          ${c.setByOffset("global_idx",p.getByIndices("input_indices"))}
      }`;return{name:"Slice",shaderCache:{hint:`${u.length}_${s.length}_${i.length}`,inputDependencies:["rank"]},getShaderSource:b,getRunData:()=>({outputs:[l],dispatchGroup:{x:Math.ceil(r/64)},programUniforms:h})}},eu=(e,t)=>{up(e.inputs,t);let n=dp(e.inputs,t);e.compute(cp(e.inputs,n),{inputs:[0]})},tu=e=>{let t=e.starts,n=e.ends,r=e.axes;return G({starts:t,ends:n,axes:r})}});var pp,mp,ru,ou,iu=E(()=>{H();j();ue();Me();Q();pp=e=>{if(!e||e.length!==1)throw new Error("Softmax op requires 1 input.")},mp=(e,t)=>{let n=e.inputs[0],r=n.dims,o=x.size(r),i=r.length,s=x.normalizeAxis(t.axis,i),a=s<r.length-1,u,d=[];a?(d=Array.from({length:i},(I,S)=>S),d[s]=i-1,d[i-1]=s,u=e.compute(me(n,d),{inputs:[n],outputs:[-1]})[0]):u=n;let l=u.dims,c=l[i-1],p=o/c,f=J(c),m=c/f,h=64;p===1&&(h=256);let b=(I,S)=>S===4?`max(max(${I}.x, ${I}.y), max(${I}.z, ${I}.w))`:S===2?`max(${I}.x, ${I}.y)`:S===3?`max(max(${I}.x, ${I}.y), ${I}.z)`:I,g=T("x",u.dataType,u.dims,f),y=A("result",u.dataType,u.dims,f),_=g.type.value,w=ne(u.dataType)==="f32"?`var threadMax = ${_}(-3.4028234663852886e+38f);`:`var threadMax = ${_}(-65504.0h);`,$=I=>`
      var<workgroup> rowMaxShared : ${_};
      var<workgroup> rowSumShared : ${_};
      var<workgroup> threadShared : array<${_}, ${h}>;

      fn getValue(row: i32, col: i32, row_stride: i32) -> ${_} {
        let index = row * row_stride + col;
        return x[index];
      }

      fn setValue(row: i32, col: i32, row_stride: i32, value: ${_}) {
        let index = row * row_stride + col;
        result[index] = value;
      }
      ${I.registerUniform("packedCols","i32").declareVariables(g,y)}
      ${I.mainStart(h)}
        let gindex = i32(global_idx);
        let lindex = i32(local_idx);
        const wg = ${h};
        let row = gindex / wg;
        let cols = uniforms.packedCols;
        let row_stride : i32 = uniforms.packedCols;

        // find the rows max
        ${w}
        for (var col = lindex; col < cols; col += wg) {
          let value = getValue(row, col, row_stride);
          threadMax = max(threadMax, value);
        }
        if (lindex < cols) {
          threadShared[lindex] = threadMax;
        }
        workgroupBarrier();

        var reduceSize = min(cols, wg);
        for (var currSize = reduceSize >> 1;  currSize > 0; currSize = reduceSize >> 1) {
          reduceSize = currSize + (reduceSize & 1);
          if (lindex < currSize) {
            threadShared[lindex] = max(threadShared[lindex], threadShared[lindex + reduceSize]);
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowMaxShared = ${_}(${b("threadShared[0]",f)});
        }
        workgroupBarrier();

        // find the rows sum
        var threadSum = ${_}(0.0);
        for (var col = lindex; col < cols; col += wg) {
          let subExp = exp(getValue(row, col, row_stride) - rowMaxShared);
          threadSum += subExp;
        }
        threadShared[lindex] = threadSum;
        workgroupBarrier();

        for (var currSize = wg >> 1;  currSize > 0; currSize = currSize >> 1) {
          if (lindex < currSize) {
            threadShared[lindex] = threadShared[lindex] + threadShared[lindex + currSize];
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowSumShared = ${_}(${Se("threadShared[0]",f)});
        }
        workgroupBarrier();

        // calculate final value for each element in the row
        for (var col = lindex; col < cols; col += wg) {
          var value = exp(getValue(row, col, row_stride) - rowMaxShared) / rowSumShared;
          // max operation protects against NaN since all values should be >=0
          value = max(value, ${_}(0.0));
          setValue(row, col, row_stride, value);
        }
      }`,v=e.compute({name:"Softmax",shaderCache:{hint:`${f};${h}`,inputDependencies:["type"]},getRunData:()=>({outputs:[{dims:l,dataType:u.dataType}],dispatchGroup:{x:p},programUniforms:[{type:6,data:m}]}),getShaderSource:$},{inputs:[u],outputs:[a?-1:0]})[0];a&&e.compute(me(v,d),{inputs:[v]})},ru=(e,t)=>{pp(e.inputs),mp(e,t)},ou=e=>G({axis:e.axis})});var su,fp,hp,gp,au,uu=E(()=>{H();j();Q();su=e=>Array.from(e.getBigInt64Array(),Number),fp=e=>{if(!e||e.length!==2)throw new Error("Tile requires 2 inputs.");if(e[0].dataType!==1&&e[0].dataType!==10&&e[0].dataType!==6&&e[0].dataType!==12)throw new Error("Tile only support float, float16, int32, and uint32 data types");if(e[1].dataType!==7)throw new Error("Tile `repeats` input should be of int64 data type");if(e[1].dims.length!==1)throw new Error("Tile `repeats` input should be 1-D");if(su(e[1]).length!==e[0].dims.length)throw new Error("Tile `repeats` input should have same number of elements as rank of input data tensor")},hp=(e,t)=>{let n=[];for(let r=0;r<e.length;++r)n.push(e[r]*t[r]);return n},gp=(e,t)=>{let n=e[0].dims,r=t??su(e[1]),o=hp(n,r),i=x.size(o),s=e[0].dataType,a=T("input",s,n.length),u=A("output",s,o.length),d=l=>`
      const inputShape = ${a.indices(...n)};
      ${l.registerUniform("output_size","u32").declareVariables(a,u)}
      ${l.mainStart()}
      ${l.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let output_indices = ${u.offsetToIndices("global_idx")};
      var input_indices: ${a.type.indices};
      for (var i = 0; i < ${n.length}; i++) {
        let input_dim_i = ${a.indicesGet("uniforms.input_shape","i")};
        let input_dim_value = ${u.indicesGet("output_indices","i")}  % input_dim_i;

        ${a.indicesSet("input_indices","i","input_dim_value")}
      }
      ${u.setByOffset("global_idx",a.getByIndices("input_indices"))}
    }`;return{name:"Tile",shaderCache:{hint:`${r}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:o,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(i/64)},programUniforms:[{type:12,data:i},...z(e[0].dims,o)]}),getShaderSource:d}},au=e=>{fp(e.inputs),e.compute(gp(e.inputs),{inputs:[0]})}});var yp,bp,du,lu=E(()=>{H();j();Q();yp=(e,t,n,r,o)=>{let i=A("output_data",o,n.length,4),s=T("a_data",t[1].dataType,t[1].dims.length,4),a=T("b_data",t[2].dataType,t[2].dims.length,4),u=T("c_data",t[0].dataType,t[0].dims.length,4),d,l=(c,p,f)=>`select(${p}, ${c}, ${f})`;if(!r)d=i.setByOffset("global_idx",l(s.getByOffset("global_idx"),a.getByOffset("global_idx"),u.getByOffset("global_idx")));else{let c=(p,f,m="")=>{let h=`a_data[index_a${f}][component_a${f}]`,b=`b_data[index_b${f}][component_b${f}]`,g=`bool(c_data[index_c${f}] & (0xffu << (component_c${f} * 8)))`;return`
            let output_indices${f} = ${i.offsetToIndices(`global_idx * 4u + ${f}u`)};
            let offset_a${f} = ${s.broadcastedIndicesToOffset(`output_indices${f}`,i)};
            let offset_b${f} = ${a.broadcastedIndicesToOffset(`output_indices${f}`,i)};
            let offset_c${f} = ${u.broadcastedIndicesToOffset(`output_indices${f}`,i)};
            let index_a${f} = offset_a${f} / 4u;
            let index_b${f} = offset_b${f} / 4u;
            let index_c${f} = offset_c${f} / 4u;
            let component_a${f} = offset_a${f} % 4u;
            let component_b${f} = offset_b${f} % 4u;
            let component_c${f} = offset_c${f} % 4u;
            ${p}[${f}] = ${m}(${l(h,b,g)});
          `};o===9?d=`
            var data = vec4<u32>(0);
            ${c("data",0,"u32")}
            ${c("data",1,"u32")}
            ${c("data",2,"u32")}
            ${c("data",3,"u32")}
            output_data[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:d=`
            ${c("output_data[global_idx]",0)}
            ${c("output_data[global_idx]",1)}
            ${c("output_data[global_idx]",2)}
            ${c("output_data[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(u,s,a,i)}
        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${d}
      }`},bp=e=>{let t=e[1].dims,n=e[2].dims,r=e[0].dims,o=e[1].dataType,i=!(x.areEqual(t,n)&&x.areEqual(n,r)),s=t,a=x.size(t);if(i){let d=Ee.calcShape(Ee.calcShape(t,n,!1),r,!1);if(!d)throw new Error("Can't perform where op on the given tensors");s=d,a=x.size(s)}let u=Math.ceil(a/4);return{name:"Where",shaderCache:{inputDependencies:["rank","rank","rank"]},getShaderSource:d=>yp(d,e,s,i,o),getRunData:()=>({outputs:[{dims:s,dataType:o}],dispatchGroup:{x:Math.ceil(a/64/4)},programUniforms:[{type:12,data:u},...z(r,t,n,s)]})}},du=e=>{e.compute(bp(e.inputs))}});var cu,pu=E(()=>{Oo();Lt();Ro();Lo();Ii();Ui();Li();os();cs();fs();ys();Ts();Es();Ds();Os();Rs();Ns();Hs();Ks();Qs();Js();ua();ca();ma();ha();ba();Fn();wa();Ua();La();Wa();qa();Rt();Qa();Zn();Ya();nu();iu();jn();uu();Me();Wt();lu();cu=new Map([["Abs",[No]],["Acos",[Wo]],["Acosh",[Go]],["Add",[Ci]],["ArgMax",[Bo,Pn]],["ArgMin",[Do,Pn]],["Asin",[Ho]],["Asinh",[qo]],["Atan",[Fo]],["Atanh",[Ko]],["Attention",[Mo]],["AveragePool",[Aa,Ca]],["BatchNormalization",[Uo]],["BiasAdd",[Vo]],["BiasSplitGelu",[Ti]],["Cast",[Zo,jo]],["Ceil",[Xo]],["Clip",[Qo]],["Concat",[Ri,Vi]],["Conv",[Ln,Vn]],["ConvTranspose",[ls,us]],["Cos",[Yo]],["Cosh",[Jo]],["CumSum",[ps,ms]],["DepthToSpace",[hs,gs]],["DequantizeLinear",[Ra,Va]],["DFT",[xs,Ss]],["Div",[Ai]],["Einsum",[As,ks]],["Elu",[ei,pt]],["Equal",[ki]],["Erf",[ti]],["Exp",[ni]],["Expand",[zs]],["FastGelu",[Bs]],["Floor",[ri]],["FusedConv",[Ln,Vn]],["Gather",[Us,Ms]],["GatherElements",[Fs,qs]],["GatherBlockQuantized",[Ws,Gs]],["GatherND",[Vs,Ls]],["Gelu",[oi]],["Gemm",[Zs,js]],["GlobalAveragePool",[Pa,Ea]],["GlobalMaxPool",[Ma,Oa]],["Greater",[Di]],["GreaterOrEqual",[Oi]],["GridSample",[Xs,Ys]],["GroupQueryAttention",[aa]],["HardSigmoid",[pi,ci]],["HardSwish",[mi]],["InstanceNormalization",[la]],["LayerNormalization",[pa]],["LeakyRelu",[ii,pt]],["Less",[Bi]],["LessOrEqual",[Mi]],["Log",[vi]],["MatMul",[fa]],["MatMulNBits",[ga,ya]],["MaxPool",[Da,Ba]],["Mul",[Ei]],["MultiHeadAttention",[na,ta]],["Neg",[ai]],["Not",[si]],["Pad",[_a]],["Pow",[Pi]],["QuickGelu",[xi,pt]],["Range",[Na]],["Reciprocal",[ui]],["ReduceMin",[Co]],["ReduceMean",[vo]],["ReduceMax",[Io]],["ReduceSum",[ko]],["ReduceProd",[Ao]],["ReduceL1",[xo]],["ReduceL2",[So]],["ReduceLogSum",[Po]],["ReduceLogSumExp",[To]],["ReduceSumSquare",[Eo]],["Relu",[di]],["Resize",[ja,Za]],["RotaryEmbedding",[ia]],["ScatterND",[Ha,Ga]],["Sigmoid",[li]],["Sin",[fi]],["Sinh",[hi]],["Slice",[eu,tu]],["SkipLayerNormalization",[Xa]],["Split",[ra,oa]],["Sqrt",[gi]],["Softmax",[ru,ou]],["Sub",[zi]],["Tan",[yi]],["Tanh",[_i]],["ThresholdedRelu",[$i,pt]],["Tile",[au]],["Transpose",[uo,lo]],["Where",[du]]])});var tn,mu=E(()=>{$e();ke();Q();tn=class{constructor(t){this.backend=t;this.repo=new Map,this.attributesBound=!1}backend;repo;attributesBound;getArtifact(t){return this.repo.get(t)}setArtifact(t,n){this.repo.set(t,n)}run(t,n,r,o,i){we(t.programInfo.name);let s=this.backend.device,a=this.backend.getComputePassEncoder();this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2);let u=[];for(let l of n)u.push({binding:u.length,resource:{buffer:l.buffer}});for(let l of r)u.push({binding:u.length,resource:{buffer:l.buffer}});i&&u.push({binding:u.length,resource:i});let d=s.createBindGroup({layout:t.computePipeline.getBindGroupLayout(0),entries:u,label:t.programInfo.name});if(this.backend.sessionStatus==="capturing"){let l={kernelId:this.backend.currentKernelId,computePipeline:t.computePipeline,bindGroup:d,dispatchGroup:o};this.backend.capturedCommandList.get(this.backend.currentSessionId).push(l)}a.setPipeline(t.computePipeline),a.setBindGroup(0,d),a.dispatchWorkgroups(...o),this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2+1),this.backend.pendingDispatchNumber++,(this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber||this.backend.queryType==="at-passes")&&this.backend.endComputePass(),this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber&&this.backend.flush(),ye(t.programInfo.name)}dispose(){}build(t,n){we(t.name);let r=this.backend.device,o=[];[{feature:"shader-f16",extension:"f16"},{feature:"subgroups",extension:"subgroups"}].forEach(c=>{r.features.has(c.feature)&&o.push(`enable ${c.extension};`)});let s=so(n,this.backend.device.limits),a=t.getShaderSource(s),u=`${o.join(`
`)}
${s.additionalImplementations}
${a}`,d=r.createShaderModule({code:u,label:t.name});X("verbose",()=>`[WebGPU] ${t.name} shader code: ${u}`);let l=r.createComputePipeline({compute:{module:d,entryPoint:"main"},layout:"auto",label:t.name});return ye(t.name),{programInfo:t,computePipeline:l,uniformVariablesInfo:s.variablesInfo}}normalizeDispatchGroupSize(t){let n=typeof t=="number"?t:t.x,r=typeof t=="number"?1:t.y||1,o=typeof t=="number"?1:t.z||1,i=this.backend.device.limits.maxComputeWorkgroupsPerDimension;if(n<=i&&r<=i&&o<=i)return[n,r,o];let s=n*r*o,a=Math.ceil(Math.sqrt(s));if(a>i){if(a=Math.ceil(Math.cbrt(s)),a>i)throw new Error("Total dispatch size exceeds WebGPU maximum.");return[a,a,a]}else return[a,a,1]}}});var fu={};bt(fu,{WebGpuBackend:()=>Xn});var _p,wp,Qn,Xn,hu=E(()=>{$e();H();ke();wn();oo();pu();mu();_p=(e,t)=>{if(t.length!==e.length)throw new Error(`inputDependencies length ${t.length} is not equal to inputTensors length ${e.length}.`);let n=[];for(let r=0;r<e.length;++r){let o=e[r].dataType;switch(t[r]){case"none":{n.push("");break}case"type":{n.push(`${o}`);break}case"rank":{let i=e[r].dims.length;n.push(`${o};${i}`);break}case"dims":{let i=e[r].dims.join(",");n.push(`${o};${i}`);break}default:throw new Error(`unsupported input dependency: ${t[r]}`)}}return n.join("|")},wp=(e,t,n)=>{let r=e.name;return e.shaderCache?.hint&&(r+="["+e.shaderCache.hint+"]"),r+=":"+n+`:${_p(t,e.shaderCache?.inputDependencies??new Array(t.length).fill("dims"))}`,r},Qn=class{architecture;vendor;constructor(t){t&&(this.architecture=t.architecture,this.vendor=t.vendor)}isArchitecture(t){return this.architecture===t}isVendor(t){return this.vendor===t}},Xn=class{adapterInfo;device;gpuDataManager;programManager;currentSessionId=null;currentKernelId=null;temporaryData;kernelPersistentData;kernelCustomData;get currentKernelCustomData(){if(this.currentKernelId===null)throw new Error("currentKernelCustomData(): currentKernelId is null. (should not happen)");let t=this.kernelCustomData.get(this.currentKernelId);return t||(t={},this.kernelCustomData.set(this.currentKernelId,t)),t}kernels;commandEncoder=null;computePassEncoder=null;maxDispatchNumber=16;pendingDispatchNumber=0;pendingKernels=[];pendingQueries=new Map;queryResolveBuffer;querySet;queryTimeBase;queryType;env;sessionStatus="default";capturedCommandList=new Map;capturedPendingKernels=new Map;sessionExternalDataMapping=new Map;async initialize(t,n){this.env=t;let r=[],o={requiredLimits:{maxComputeWorkgroupStorageSize:n.limits.maxComputeWorkgroupStorageSize,maxComputeWorkgroupsPerDimension:n.limits.maxComputeWorkgroupsPerDimension,maxStorageBufferBindingSize:n.limits.maxStorageBufferBindingSize,maxBufferSize:n.limits.maxBufferSize,maxComputeInvocationsPerWorkgroup:n.limits.maxComputeInvocationsPerWorkgroup,maxComputeWorkgroupSizeX:n.limits.maxComputeWorkgroupSizeX,maxComputeWorkgroupSizeY:n.limits.maxComputeWorkgroupSizeY,maxComputeWorkgroupSizeZ:n.limits.maxComputeWorkgroupSizeZ},requiredFeatures:r},i=u=>n.features.has(u)&&r.push(u)&&!0;i("chromium-experimental-timestamp-query-inside-passes")||i("timestamp-query"),i("shader-f16"),i("subgroups"),globalThis.__dreamMatrixAvailable=i("chromium-experimental-subgroup-matrix"),this.device=await n.requestDevice(o);let s=n,a=n.info??(typeof s.requestAdapterInfo=="function"?await s.requestAdapterInfo():void 0);this.adapterInfo=new Qn(a),this.gpuDataManager=ro(this),this.programManager=new tn(this),this.kernels=new Map,this.kernelPersistentData=new Map,this.kernelCustomData=new Map,At(t.logLevel,!!t.debug),this.device.onuncapturederror=u=>{u.error instanceof GPUValidationError&&console.error(`An uncaught WebGPU validation error was raised: ${u.error.message}`)},Object.defineProperty(this.env.webgpu,"device",{value:this.device,writable:!1,enumerable:!0,configurable:!0}),Object.defineProperty(this.env.webgpu,"adapter",{value:n,writable:!1,enumerable:!0,configurable:!1}),this.setQueryType()}dispose(){typeof this.querySet<"u"&&this.querySet.destroy(),this.gpuDataManager.dispose(),this.device&&this.env?.webgpu&&this.device.lost.then(()=>{delete this.env.webgpu.device})}getCommandEncoder(){return this.commandEncoder||(this.commandEncoder=this.device.createCommandEncoder()),this.commandEncoder}getComputePassEncoder(){if(!this.computePassEncoder){let t=this.getCommandEncoder(),n={};this.queryType==="at-passes"&&(n.timestampWrites={querySet:this.querySet,beginningOfPassWriteIndex:this.pendingDispatchNumber*2,endOfPassWriteIndex:this.pendingDispatchNumber*2+1}),this.computePassEncoder=t.beginComputePass(n)}return this.computePassEncoder}endComputePass(){this.computePassEncoder&&(this.computePassEncoder.end(),this.computePassEncoder=null)}flush(){if(!this.commandEncoder)return;we(),this.endComputePass();let t;this.queryType!=="none"&&(this.commandEncoder.resolveQuerySet(this.querySet,0,this.pendingDispatchNumber*2,this.queryResolveBuffer,0),t=this.device.createBuffer({size:this.pendingDispatchNumber*2*8,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),this.pendingQueries.set(t,this.pendingKernels),this.pendingKernels=[],this.commandEncoder.copyBufferToBuffer(this.queryResolveBuffer,0,t,0,this.pendingDispatchNumber*2*8)),this.device.queue.submit([this.commandEncoder.finish()]),this.gpuDataManager.refreshPendingBuffers(),this.commandEncoder=null,this.pendingDispatchNumber=0,this.queryType!=="none"&&t.mapAsync(GPUMapMode.READ).then(()=>{let n=new BigUint64Array(t.getMappedRange()),r=this.pendingQueries.get(t);for(let o=0;o<n.length/2;o++){let i=r[o],s=i.kernelId,a=this.kernels.get(s),u=a.kernelType,d=a.kernelName,l=i.programName,c=i.inputTensorViews,p=i.outputTensorViews,f=n[o*2],m=n[o*2+1];typeof this.queryTimeBase>"u"&&(this.queryTimeBase=f);let h=Number(f-this.queryTimeBase),b=Number(m-this.queryTimeBase);if(!Number.isSafeInteger(h)||!Number.isSafeInteger(b))throw new RangeError("incorrect timestamp range");if(this.env.webgpu.profiling?.ondata)this.env.webgpu.profiling.ondata({version:1,inputsMetadata:c.map(g=>({dims:g.dims,dataType:Ae(g.dataType)})),outputsMetadata:p.map(g=>({dims:g.dims,dataType:Ae(g.dataType)})),kernelId:s,kernelType:u,kernelName:d,programName:l,startTime:h,endTime:b});else{let g="";c.forEach((_,w)=>{g+=`input[${w}]: [${_.dims}] | ${Ae(_.dataType)}, `});let y="";p.forEach((_,w)=>{y+=`output[${w}]: [${_.dims}] | ${Ae(_.dataType)}, `}),console.log(`[profiling] kernel "${s}|${u}|${d}|${l}" ${g}${y}start time: ${h} ns, execution time: ${b-h} ns`)}$t("GPU",`${l}::${f}::${m}`)}t.unmap(),this.pendingQueries.delete(t)}),ye()}run(t,n,r,o,i,s){we(t.name);let a=[];for(let _=0;_<n.length;++_){let w=n[_].data;if(w===0)continue;let $=this.gpuDataManager.get(w);if(!$)throw new Error(`no GPU data for input: ${w}`);a.push($)}let{outputs:u,dispatchGroup:d,programUniforms:l}=t.getRunData(n),c=r.length===0?u.map((_,w)=>w):r;if(c.length!==u.length)throw new Error(`Output size ${c.length} must be equal to ${u.length}.`);let p=[],f=[];for(let _=0;_<u.length;++_){if(!Number.isInteger(c[_])||c[_]<-3||c[_]>=s)throw new Error(`Invalid output index: ${c[_]}`);if(c[_]===-3)continue;let w=c[_]===-1,$=c[_]===-2,v=w||$?i(u[_].dataType,u[_].dims):o(c[_],u[_].dataType,u[_].dims);if(p.push(v),v.data===0)continue;let I=this.gpuDataManager.get(v.data);if(!I)throw new Error(`no GPU data for output: ${v.data}`);if(w&&this.temporaryData.push(I),$){let S=this.kernelPersistentData.get(this.currentKernelId);S||(S=[],this.kernelPersistentData.set(this.currentKernelId,S)),S.push(I)}f.push(I)}if(a.length!==n.length||f.length!==p.length){if(f.length===0)return ye(t.name),p;throw new Error(`Program ${t.name} has zero-sized tensor(s) in inputs or outputs. This is not supported now.`)}let m;if(l){let _=0,w=[];l.forEach(S=>{let C=typeof S.data=="number"?[S.data]:S.data;if(C.length===0)return;let P=S.type===10?2:4,R,O;S.type===10?(O=C.length>4?16:C.length>2?8:C.length*P,R=C.length>4?16:P*C.length):(O=C.length<=2?C.length*P:16,R=16),_=Math.ceil(_/O)*O,w.push(_);let N=S.type===10?8:4;_+=C.length>4?Math.ceil(C.length/N)*R:C.length*P});let $=16;_=Math.ceil(_/$)*$;let v=new ArrayBuffer(_);l.forEach((S,C)=>{let P=w[C],R=typeof S.data=="number"?[S.data]:S.data;if(S.type===6)new Int32Array(v,P,R.length).set(R);else if(S.type===12)new Uint32Array(v,P,R.length).set(R);else if(S.type===10)new Uint16Array(v,P,R.length).set(R);else if(S.type===1)new Float32Array(v,P,R.length).set(R);else throw new Error(`Unsupported uniform type: ${Ae(S.type)}`)});let I=this.gpuDataManager.create(_,GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM);this.device.queue.writeBuffer(I.buffer,0,v,0,_),this.gpuDataManager.release(I.id),m={offset:0,size:_,buffer:I.buffer}}let h=this.programManager.normalizeDispatchGroupSize(d),b=h[1]===1&&h[2]===1,g=wp(t,n,b),y=this.programManager.getArtifact(g);if(y||(y=this.programManager.build(t,h),this.programManager.setArtifact(g,y),X("info",()=>`[artifact] key: ${g}, programName: ${t.name}`)),l&&y.uniformVariablesInfo){if(l.length!==y.uniformVariablesInfo.length)throw new Error(`Uniform variables count mismatch: expect ${y.uniformVariablesInfo.length}, got ${l.length} in program "${y.programInfo.name}".`);for(let _=0;_<l.length;_++){let w=l[_],$=w.type,v=typeof w.data=="number"?1:w.data.length,[I,S]=y.uniformVariablesInfo[_];if($!==I||v!==S)throw new Error(`Uniform variable ${_} mismatch: expect type ${I} with size ${S}, got type ${$} with size ${v} in program "${y.programInfo.name}".`)}}if(X("info",()=>`[ProgramManager] run "${t.name}" (key=${g}) with ${h[0]}x${h[1]}x${h[2]}`),this.queryType!=="none"||this.sessionStatus==="capturing"){let _={kernelId:this.currentKernelId,programName:y.programInfo.name,inputTensorViews:n,outputTensorViews:p};this.pendingKernels.push(_),this.sessionStatus==="capturing"&&this.capturedPendingKernels.get(this.currentSessionId).push(_)}return this.programManager.run(y,a,f,h,m),ye(t.name),p}upload(t,n){this.gpuDataManager.upload(t,n)}memcpy(t,n){this.gpuDataManager.memcpy(t,n)}async download(t,n){await this.gpuDataManager.download(t,n)}alloc(t){return this.gpuDataManager.create(t).id}free(t){return this.gpuDataManager.release(t)}createKernel(t,n,r,o){let i=cu.get(t);if(!i)throw new Error(`kernel not implemented: ${t}`);let s={kernelType:t,kernelName:o,kernelEntry:i[0],attributes:[i[1],r]};this.kernels.set(n,s)}releaseKernel(t){let n=this.kernelPersistentData.get(t);if(n){for(let r of n)this.gpuDataManager.release(r.id);this.kernelPersistentData.delete(t)}this.kernelCustomData.delete(t),this.kernels.delete(t)}computeKernel(t,n,r){let o=this.kernels.get(t);if(!o)throw new Error(`kernel not created: ${t}`);let i=o.kernelType,s=o.kernelName,a=o.kernelEntry,u=o.attributes;if(this.currentKernelId!==null)throw new Error(`kernel "[${i}] ${s}" is not allowed to be called recursively`);this.currentKernelId=t,u[0]&&(u[1]=u[0](u[1]),u[0]=void 0),X("info",()=>`[WebGPU] Start to run kernel "[${i}] ${s}"...`);let d=this.env.debug;this.temporaryData=[];try{return d&&this.device.pushErrorScope("validation"),a(n,u[1]),0}catch(l){return r.push(Promise.resolve(`[WebGPU] Kernel "[${i}] ${s}" failed. ${l}`)),1}finally{d&&r.push(this.device.popErrorScope().then(l=>l?`GPU validation error for kernel "[${i}] ${s}": ${l.message}`:null));for(let l of this.temporaryData)this.gpuDataManager.release(l.id);this.temporaryData=[],this.currentKernelId=null}}registerBuffer(t,n,r,o){let i=this.sessionExternalDataMapping.get(t);i||(i=new Map,this.sessionExternalDataMapping.set(t,i));let s=i.get(n),a=this.gpuDataManager.registerExternalBuffer(r,o,s);return i.set(n,[a,r]),a}unregisterBuffers(t){let n=this.sessionExternalDataMapping.get(t);n&&(n.forEach(r=>this.gpuDataManager.unregisterExternalBuffer(r[0])),this.sessionExternalDataMapping.delete(t))}getBuffer(t){let n=this.gpuDataManager.get(t);if(!n)throw new Error(`no GPU data for buffer: ${t}`);return n.buffer}createDownloader(t,n,r){return async()=>{let o=await Tn(this,t,n);return Et(o.buffer,r)}}writeTimestamp(t){this.queryType==="inside-passes"&&this.computePassEncoder.writeTimestamp(this.querySet,t)}setQueryType(){this.queryType="none",(this.env.webgpu.profiling?.mode==="default"||(typeof this.env.trace>"u"?this.env.wasm.trace:this.env.trace))&&(this.device.features.has("chromium-experimental-timestamp-query-inside-passes")?this.queryType="inside-passes":this.device.features.has("timestamp-query")&&(this.queryType="at-passes"),this.queryType!=="none"&&typeof this.querySet>"u"&&(this.querySet=this.device.createQuerySet({type:"timestamp",count:this.maxDispatchNumber*2}),this.queryResolveBuffer=this.device.createBuffer({size:this.maxDispatchNumber*2*8,usage:GPUBufferUsage.COPY_SRC|GPUBufferUsage.QUERY_RESOLVE})))}captureBegin(){X("info","captureBegin"),this.capturedCommandList.get(this.currentSessionId)||this.capturedCommandList.set(this.currentSessionId,[]),this.capturedPendingKernels.get(this.currentSessionId)||this.capturedPendingKernels.set(this.currentSessionId,[]),this.flush(),this.sessionStatus="capturing"}captureEnd(){X("info","captureEnd"),this.flush(),this.sessionStatus="default"}replay(){X("info","replay"),this.sessionStatus="replaying";let t=this.capturedCommandList.get(this.currentSessionId),n=this.capturedPendingKernels.get(this.currentSessionId),r=t.length;this.pendingKernels=[];for(let o=0;o<r;o++){let i=this.getComputePassEncoder(),s=t[o];this.writeTimestamp(this.pendingDispatchNumber*2),i.setPipeline(s.computePipeline),i.setBindGroup(0,s.bindGroup),i.dispatchWorkgroups(...s.dispatchGroup),this.writeTimestamp(this.pendingDispatchNumber*2+1),this.pendingDispatchNumber++,this.queryType!=="none"&&this.pendingKernels.push(n[o]),(this.pendingDispatchNumber>=this.maxDispatchNumber||this.queryType==="at-passes")&&this.endComputePass(),this.pendingDispatchNumber>=this.maxDispatchNumber&&this.flush()}this.flush(),this.sessionStatus="default"}onCreateSession(){this.gpuDataManager.onCreateSession()}onReleaseSession(t){this.unregisterBuffers(t),this.capturedCommandList.has(t)&&this.capturedCommandList.delete(t),this.capturedPendingKernels.has(t)&&this.capturedPendingKernels.delete(t),this.gpuDataManager.onReleaseSession(t)}onRunStart(t){this.currentSessionId=t,this.setQueryType()}}});var gu={};bt(gu,{init:()=>$p});var gt,Yn,$p,yu=E(()=>{H();ke();j();Jr();gt=class e{constructor(t,n,r,o){this.module=t;this.dataType=n;this.data=r;this.dims=o}module;dataType;data;dims;getFloat32Array(){if(this.dataType!==1)throw new Error("Invalid data type");let t=x.size(this.dims);return t===0?new Float32Array:new Float32Array(this.module.HEAP8.buffer,this.data,t)}getBigInt64Array(){if(this.dataType!==7)throw new Error("Invalid data type");let t=x.size(this.dims);return t===0?new BigInt64Array:new BigInt64Array(this.module.HEAP8.buffer,this.data,t)}getInt32Array(){if(this.dataType!==6)throw new Error("Invalid data type");let t=x.size(this.dims);return t===0?new Int32Array:new Int32Array(this.module.HEAP8.buffer,this.data,t)}getUint16Array(){if(this.dataType!==10&&this.dataType!==4)throw new Error("Invalid data type");let t=x.size(this.dims);return t===0?new Uint16Array:new Uint16Array(this.module.HEAP8.buffer,this.data,t)}reshape(t){if(x.size(t)!==x.size(this.dims))throw new Error("Invalid new shape");return new e(this.module,this.dataType,this.data,t)}},Yn=class{constructor(t,n,r){this.module=t;this.backend=n;this.adapterInfo=n.adapterInfo;let o=t.PTR_SIZE,i=r/t.PTR_SIZE,s=o===4?"i32":"i64";this.opKernelContext=Number(t.getValue(o*i++,s));let a=Number(t.getValue(o*i++,s));this.outputCount=Number(t.getValue(o*i++,s)),this.customDataOffset=Number(t.getValue(o*i++,"*")),this.customDataSize=Number(t.getValue(o*i++,s));let u=[];for(let d=0;d<a;d++){let l=Number(t.getValue(o*i++,s)),c=Number(t.getValue(o*i++,"*")),p=Number(t.getValue(o*i++,s)),f=[];for(let m=0;m<p;m++)f.push(Number(t.getValue(o*i++,s)));u.push(new gt(t,l,c,f))}this.inputs=u}module;backend;adapterInfo;opKernelContext;inputs;outputCount;get kernelCustomData(){return this.backend.currentKernelCustomData}get customDataBuffer(){return this.module.HEAPU8.subarray(this.customDataOffset,this.customDataOffset+this.customDataSize)}customDataOffset=0;customDataSize=0;compute(t,n){let r=n?.inputs?.map(a=>typeof a=="number"?this.inputs[a]:a)??this.inputs,o=n?.outputs??[],i=(a,u,d)=>new gt(this.module,u,this.output(a,d),d),s=(a,u)=>{let d=He(a,u);if(!d)throw new Error(`Unsupported data type: ${a}`);let l=d>0?this.backend.gpuDataManager.create(d).id:0;return new gt(this.module,a,l,u)};return this.backend.run(t,r,o,i,s,this.outputCount)}output(t,n){let r=this.module.stackSave();try{let o=this.module.PTR_SIZE,i=o===4?"i32":"i64",s=this.module.stackAlloc((1+n.length)*o);this.module.setValue(s,n.length,i);for(let a=0;a<n.length;a++)this.module.setValue(s+o*(a+1),n[a],i);return this.module._JsepOutput(this.opKernelContext,t,s)}catch(o){throw new Error(`Failed to generate kernel's output[${t}] with dims [${n}]. If you are running with pre-allocated output, please make sure the output type/dims are correct. Error: ${o}`)}finally{this.module.stackRestore(r)}}},$p=async(e,t,n,r)=>{let o=t.jsepInit;if(!o)throw new Error("Failed to initialize JSEP. The WebAssembly module is not built with JSEP support.");if(e==="webgpu"){let i=(hu(),an(fu)).WebGpuBackend,s=new i;await s.initialize(n,r),o("webgpu",[s,a=>s.alloc(Number(a)),a=>s.free(a),(a,u,d,l=!1)=>{if(l)X("verbose",()=>`[WebGPU] jsepCopyGpuToGpu: src=${Number(a)}, dst=${Number(u)}, size=${Number(d)}`),s.memcpy(Number(a),Number(u));else{X("verbose",()=>`[WebGPU] jsepCopyCpuToGpu: dataOffset=${Number(a)}, gpuDataId=${Number(u)}, size=${Number(d)}`);let c=t.HEAPU8.subarray(Number(a>>>0),Number(a>>>0)+Number(d));s.upload(Number(u),c)}},async(a,u,d)=>{X("verbose",()=>`[WebGPU] jsepCopyGpuToCpu: gpuDataId=${a}, dataOffset=${u}, size=${d}`),await s.download(Number(a),()=>t.HEAPU8.subarray(Number(u)>>>0,Number(u+d)>>>0))},(a,u,d)=>s.createKernel(a,Number(u),d,t.UTF8ToString(t._JsepGetNodeName(Number(u)))),a=>s.releaseKernel(a),(a,u,d,l)=>{X("verbose",()=>`[WebGPU] jsepRun: sessionHandle=${d}, kernel=${a}, contextDataOffset=${u}`);let c=new Yn(t,s,Number(u));return s.computeKernel(Number(a),c,l)},()=>s.captureBegin(),()=>s.captureEnd(),()=>s.replay()])}else{let i=new Bt(n);o("webnn",[i,()=>i.reserveTensorId(),s=>i.releaseTensorId(s),async(s,a,u,d,l)=>i.ensureTensor(s,a,u,d,l),(s,a)=>{i.uploadTensor(s,a)},async(s,a)=>i.downloadTensor(s,a),(s,a)=>i.registerMLContext(s,a),!!n.trace])}}});var vp,wu,$u,nt,xp,bu,Jn,vu,xu,_u,Su,Tu,Iu=E(()=>{$e();Lr();Wr();H();Xe();Tt();bn();vp=(e,t)=>{te()._OrtInit(e,t)!==0&&Y("Can't initialize onnxruntime.")},wu=async e=>{vp(e.wasm.numThreads,lt(e.logLevel))},$u=async(e,t)=>{te().asyncInit?.();let n=e.webgpu.adapter;if(t==="webgpu"){if(typeof navigator>"u"||!navigator.gpu)throw new Error("WebGPU is not supported in current environment");if(n){if(typeof n.limits!="object"||typeof n.features!="object"||typeof n.requestDevice!="function")throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.")}else{let r=e.webgpu.powerPreference;if(r!==void 0&&r!=="low-power"&&r!=="high-performance")throw new Error(`Invalid powerPreference setting: "${r}"`);let o=e.webgpu.forceFallbackAdapter;if(o!==void 0&&typeof o!="boolean")throw new Error(`Invalid forceFallbackAdapter setting: "${o}"`);if(n=await navigator.gpu.requestAdapter({powerPreference:r,forceFallbackAdapter:o}),!n)throw new Error('Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.')}}if(t==="webnn"&&(typeof navigator>"u"||!navigator.ml))throw new Error("WebNN is not supported in current environment");{let r=(yu(),an(gu)).init;t==="webgpu"&&await r("webgpu",te(),e,n),t==="webnn"&&await r("webnn",te(),e)}},nt=new Map,xp=e=>{let t=te(),n=t.stackSave();try{let r=t.PTR_SIZE,o=t.stackAlloc(2*r);t._OrtGetInputOutputCount(e,o,o+r)!==0&&Y("Can't get session input/output count.");let s=r===4?"i32":"i64";return[Number(t.getValue(o,s)),Number(t.getValue(o+r,s))]}finally{t.stackRestore(n)}},bu=(e,t)=>{let n=te(),r=n.stackSave(),o=0;try{let i=n.PTR_SIZE,s=n.stackAlloc(2*i);n._OrtGetInputOutputMetadata(e,t,s,s+i)!==0&&Y("Can't get session input/output metadata.");let u=Number(n.getValue(s,"*"));o=Number(n.getValue(s+i,"*"));let d=n.HEAP32[o/4];if(d===0)return[u,0];let l=n.HEAPU32[o/4+1],c=[];for(let p=0;p<l;p++){let f=Number(n.getValue(o+8+p*i,"*"));c.push(f!==0?n.UTF8ToString(f):Number(n.getValue(o+8+(p+l)*i,"*")))}return[u,d,c]}finally{n.stackRestore(r),o!==0&&n._OrtFree(o)}},Jn=e=>{let t=te(),n=t._malloc(e.byteLength);if(n===0)throw new Error(`Can't create a session. failed to allocate a buffer of size ${e.byteLength}.`);return t.HEAPU8.set(e,n),[n,e.byteLength]},vu=async(e,t)=>{let n,r,o=te();Array.isArray(e)?[n,r]=e:e.buffer===o.HEAPU8.buffer?[n,r]=[e.byteOffset,e.byteLength]:[n,r]=Jn(e);let i=0,s=0,a=0,u=[],d=[],l=[];try{if([s,u]=await Nr(t),t?.externalData&&o.mountExternalData){let w=[];for(let $ of t.externalData){let v=typeof $=="string"?$:$.path,I=typeof $=="string"?$:$.data;w.push(ct(I).then(S=>{o.mountExternalData(v,S)}))}await Promise.all(w)}for(let w of t?.executionProviders??[])if((typeof w=="string"?w:w.name)==="webnn"){if(o.shouldTransferToMLTensor=!1,typeof w!="string"){let v=w,I=v?.context,S=v?.gpuDevice,C=v?.deviceType,P=v?.powerPreference;I?o.currentContext=I:S?o.currentContext=await o.webnnCreateMLContext(S):o.currentContext=await o.webnnCreateMLContext({deviceType:C,powerPreference:P})}else o.currentContext=await o.webnnCreateMLContext();break}i=await o._OrtCreateSession(n,r,s),o.webgpuOnCreateSession?.(i),i===0&&Y("Can't create a session."),o.jsepOnCreateSession?.(),o.currentContext&&(o.webnnRegisterMLContext(i,o.currentContext),o.currentContext=void 0,o.shouldTransferToMLTensor=!0);let[c,p]=xp(i),f=!!t?.enableGraphCapture,m=[],h=[],b=[],g=[],y=[];for(let w=0;w<c;w++){let[$,v,I]=bu(i,w);$===0&&Y("Can't get an input name."),d.push($);let S=o.UTF8ToString($);m.push(S),b.push(v===0?{name:S,isTensor:!1}:{name:S,isTensor:!0,type:Ae(v),shape:I})}for(let w=0;w<p;w++){let[$,v,I]=bu(i,w+c);$===0&&Y("Can't get an output name."),l.push($);let S=o.UTF8ToString($);h.push(S),g.push(v===0?{name:S,isTensor:!1}:{name:S,isTensor:!0,type:Ae(v),shape:I});{if(f&&t?.preferredOutputLocation===void 0){y.push("gpu-buffer");continue}let C=typeof t?.preferredOutputLocation=="string"?t.preferredOutputLocation:t?.preferredOutputLocation?.[S]??"cpu",P=o.webnnIsGraphOutput;if(C==="cpu"&&P&&P(i,S)){y.push("ml-tensor-cpu-output");continue}if(C!=="cpu"&&C!=="cpu-pinned"&&C!=="gpu-buffer"&&C!=="ml-tensor")throw new Error(`Not supported preferred output location: ${C}.`);if(f&&C!=="gpu-buffer")throw new Error(`Not supported preferred output location: ${C}. Only 'gpu-buffer' location is supported when enableGraphCapture is true.`);y.push(C)}}let _=null;return y.some(w=>w==="gpu-buffer"||w==="ml-tensor"||w==="ml-tensor-cpu-output")&&(a=o._OrtCreateBinding(i),a===0&&Y("Can't create IO binding."),_={handle:a,outputPreferredLocations:y,outputPreferredLocationsEncoded:y.map(w=>w==="ml-tensor-cpu-output"?"ml-tensor":w).map(w=>yn(w))}),nt.set(i,[i,d,l,_,f,!1]),[i,m,h,b,g]}catch(c){throw d.forEach(p=>o._OrtFree(p)),l.forEach(p=>o._OrtFree(p)),a!==0&&o._OrtReleaseBinding(a)!==0&&Y("Can't release IO binding."),i!==0&&o._OrtReleaseSession(i)!==0&&Y("Can't release session."),c}finally{o._free(n),s!==0&&o._OrtReleaseSessionOptions(s)!==0&&Y("Can't release session options."),u.forEach(c=>o._free(c)),o.unmountExternalData?.()}},xu=e=>{let t=te(),n=nt.get(e);if(!n)throw new Error(`cannot release session. invalid session id: ${e}`);let[r,o,i,s,a]=n;s&&(a&&t._OrtClearBoundOutputs(s.handle)!==0&&Y("Can't clear bound outputs."),t._OrtReleaseBinding(s.handle)!==0&&Y("Can't release IO binding.")),t.jsepOnReleaseSession?.(e),t.webnnOnReleaseSession?.(e),t.webgpuOnReleaseSession?.(e),o.forEach(u=>t._OrtFree(u)),i.forEach(u=>t._OrtFree(u)),t._OrtReleaseSession(r)!==0&&Y("Can't release session."),nt.delete(e)},_u=async(e,t,n,r,o,i,s=!1)=>{if(!e){t.push(0);return}let a=te(),u=a.PTR_SIZE,d=e[0],l=e[1],c=e[3],p=c,f,m;if(d==="string"&&(c==="gpu-buffer"||c==="ml-tensor"))throw new Error("String tensor is not supported on GPU.");if(s&&c!=="gpu-buffer")throw new Error(`External buffer must be provided for input/output index ${i} when enableGraphCapture is true.`);if(c==="gpu-buffer"){let g=e[2].gpuBuffer;m=He(Ge(d),l);{let y=a.jsepRegisterBuffer;if(!y)throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');f=y(r,i,g,m)}}else if(c==="ml-tensor"){let g=e[2].mlTensor;m=He(Ge(d),l);let y=a.webnnRegisterMLTensor;if(!y)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');f=y(r,g,Ge(d),l)}else{let g=e[2];if(Array.isArray(g)){m=u*g.length,f=a._malloc(m),n.push(f);for(let y=0;y<g.length;y++){if(typeof g[y]!="string")throw new TypeError(`tensor data at index ${y} is not a string`);a.setValue(f+y*u,ve(g[y],n),"*")}}else{let y=a.webnnIsGraphInput,_=a.webnnIsGraphOutput;if(d!=="string"&&y&&_){let w=a.UTF8ToString(o);if(y(r,w)||_(r,w)){let $=Ge(d);m=He($,l),p="ml-tensor";let v=a.webnnCreateTemporaryTensor,I=a.webnnUploadTensor;if(!v||!I)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');let S=await v(r,$,l);I(S,new Uint8Array(g.buffer,g.byteOffset,g.byteLength)),f=S}else m=g.byteLength,f=a._malloc(m),n.push(f),a.HEAPU8.set(new Uint8Array(g.buffer,g.byteOffset,m),f)}else m=g.byteLength,f=a._malloc(m),n.push(f),a.HEAPU8.set(new Uint8Array(g.buffer,g.byteOffset,m),f)}}let h=a.stackSave(),b=a.stackAlloc(4*l.length);try{l.forEach((y,_)=>a.setValue(b+_*u,y,u===4?"i32":"i64"));let g=a._OrtCreateTensor(Ge(d),f,m,b,l.length,yn(p));g===0&&Y(`Can't create tensor for input/output. session=${r}, index=${i}.`),t.push(g)}finally{a.stackRestore(h)}},Su=async(e,t,n,r,o,i)=>{let s=te(),a=s.PTR_SIZE,u=nt.get(e);if(!u)throw new Error(`cannot run inference. invalid session id: ${e}`);let d=u[0],l=u[1],c=u[2],p=u[3],f=u[4],m=u[5],h=t.length,b=r.length,g=0,y=[],_=[],w=[],$=[],v=[],I=s.stackSave(),S=s.stackAlloc(h*a),C=s.stackAlloc(h*a),P=s.stackAlloc(b*a),R=s.stackAlloc(b*a);try{[g,y]=Vr(i),Ve("wasm prepareInputOutputTensor");for(let B=0;B<h;B++)await _u(n[B],_,$,e,l[t[B]],t[B],f);for(let B=0;B<b;B++)await _u(o[B],w,$,e,c[r[B]],h+r[B],f);Le("wasm prepareInputOutputTensor");for(let B=0;B<h;B++)s.setValue(S+B*a,_[B],"*"),s.setValue(C+B*a,l[t[B]],"*");for(let B=0;B<b;B++)s.setValue(P+B*a,w[B],"*"),s.setValue(R+B*a,c[r[B]],"*");if(p&&!m){let{handle:B,outputPreferredLocations:M,outputPreferredLocationsEncoded:W}=p;if(l.length!==h)throw new Error(`input count from feeds (${h}) is expected to be always equal to model's input count (${l.length}).`);Ve("wasm bindInputsOutputs");for(let L=0;L<h;L++){let K=t[L];await s._OrtBindInput(B,l[K],_[L])!==0&&Y(`Can't bind input[${L}] for session=${e}.`)}for(let L=0;L<b;L++){let K=r[L];o[L]?.[3]?(v.push(w[L]),s._OrtBindOutput(B,c[K],w[L],0)!==0&&Y(`Can't bind pre-allocated output[${L}] for session=${e}.`)):s._OrtBindOutput(B,c[K],0,W[K])!==0&&Y(`Can't bind output[${L}] to ${M[L]} for session=${e}.`)}Le("wasm bindInputsOutputs"),nt.set(e,[d,l,c,p,f,!0])}s.jsepOnRunStart?.(d),s.webnnOnRunStart?.(d);let O;p?O=await s._OrtRunWithBinding(d,p.handle,b,P,g):O=await s._OrtRun(d,C,S,h,R,b,P,g),O!==0&&Y("failed to call OrtRun().");let N=[],q=[];Ve("wasm ProcessOutputTensor");for(let B=0;B<b;B++){let M=Number(s.getValue(P+B*a,"*"));if(M===w[B]||v.includes(w[B])){N.push(o[B]),M!==w[B]&&s._OrtReleaseTensor(M)!==0&&Y("Can't release tensor.");continue}let W=s.stackSave(),L=s.stackAlloc(4*a),K=!1,V,F=0;try{s._OrtGetTensorData(M,L,L+a,L+2*a,L+3*a)!==0&&Y(`Can't access output tensor data on index ${B}.`);let se=a===4?"i32":"i64",k=Number(s.getValue(L,se));F=s.getValue(L+a,"*");let D=s.getValue(L+a*2,"*"),re=Number(s.getValue(L+a*3,se)),he=[];for(let oe=0;oe<re;oe++)he.push(Number(s.getValue(D+oe*a,se)));s._OrtFree(D)!==0&&Y("Can't free memory for tensor dims.");let ae=he.reduce((oe,le)=>oe*le,1);V=Ae(k);let ge=p?.outputPreferredLocations[r[B]];if(V==="string"){if(ge==="gpu-buffer"||ge==="ml-tensor")throw new Error("String tensor is not supported on GPU.");let oe=[];for(let le=0;le<ae;le++){let Re=s.getValue(F+le*a,"*"),yt=s.getValue(F+(le+1)*a,"*"),nr=le===ae-1?void 0:yt-Re;oe.push(s.UTF8ToString(Re,nr))}N.push([V,he,oe,"cpu"])}else if(ge==="gpu-buffer"&&ae>0){let oe=s.jsepGetBuffer;if(!oe)throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');let le=oe(F),Re=He(k,ae);if(Re===void 0||!It(V))throw new Error(`Unsupported data type: ${V}`);K=!0,N.push([V,he,{gpuBuffer:le,download:s.jsepCreateDownloader(le,Re,V),dispose:()=>{s._OrtReleaseTensor(M)!==0&&Y("Can't release tensor.")}},"gpu-buffer"])}else if(ge==="ml-tensor"&&ae>0){let oe=s.webnnEnsureTensor,le=s.webnnIsGraphInputOutputTypeSupported;if(!oe||!le)throw new Error('preferredLocation "ml-tensor" is not supported without using WebNN.');if(He(k,ae)===void 0||!Ct(V))throw new Error(`Unsupported data type: ${V}`);if(!le(e,V,!1))throw new Error(`preferredLocation "ml-tensor" for ${V} output is not supported by current WebNN Context.`);let yt=await oe(e,F,k,he,!1);K=!0,N.push([V,he,{mlTensor:yt,download:s.webnnCreateMLTensorDownloader(F,V),dispose:()=>{s.webnnReleaseTensorId(F),s._OrtReleaseTensor(M)}},"ml-tensor"])}else if(ge==="ml-tensor-cpu-output"&&ae>0){let oe=s.webnnCreateMLTensorDownloader(F,V)(),le=N.length;K=!0,q.push((async()=>{let Re=[le,await oe];return s.webnnReleaseTensorId(F),s._OrtReleaseTensor(M),Re})()),N.push([V,he,[],"cpu"])}else{let oe=ot(V),le=new oe(ae);new Uint8Array(le.buffer,le.byteOffset,le.byteLength).set(s.HEAPU8.subarray(F,F+le.byteLength)),N.push([V,he,le,"cpu"])}}finally{s.stackRestore(W),V==="string"&&F&&s._free(F),K||s._OrtReleaseTensor(M)}}p&&!f&&(s._OrtClearBoundOutputs(p.handle)!==0&&Y("Can't clear bound outputs."),nt.set(e,[d,l,c,p,f,!1]));for(let[B,M]of await Promise.all(q))N[B][2]=M;return Le("wasm ProcessOutputTensor"),N}finally{s.webnnOnRunEnd?.(d),s.stackRestore(I),_.forEach(O=>s._OrtReleaseTensor(O)),w.forEach(O=>s._OrtReleaseTensor(O)),$.forEach(O=>s._free(O)),g!==0&&s._OrtReleaseRunOptions(g),y.forEach(O=>s._free(O))}},Tu=e=>{let t=te(),n=nt.get(e);if(!n)throw new Error("invalid session id");let r=n[0],o=t._OrtEndProfiling(r);o===0&&Y("Can't get an profile file name."),t._OrtFree(o)}});var er,Cu,Au,ku,Eu,Pu,zu,Du,Bu,Ou,tr=E(()=>{$e();Iu();Xe();fn();er=!1,Cu=!1,Au=!1,ku=async()=>{if(!Cu){if(er)throw new Error("multiple calls to 'initWasm()' detected.");if(Au)throw new Error("previous call to 'initWasm()' failed.");er=!0;try{await Rr(ie.wasm),await wu(ie),Cu=!0}catch(e){throw Au=!0,e}finally{er=!1}}},Eu=async e=>{await $u(ie,e)},Pu=async e=>Jn(e),zu=async(e,t)=>vu(e,t),Du=async e=>{xu(e)},Bu=async(e,t,n,r,o,i)=>Su(e,t,n,r,o,i),Ou=async e=>{Tu(e)}});var Mu,Tp,nn,Uu=E(()=>{$e();tr();H();xt();bn();Mu=(e,t)=>{switch(e.location){case"cpu":return[e.type,e.dims,e.data,"cpu"];case"gpu-buffer":return[e.type,e.dims,{gpuBuffer:e.gpuBuffer},"gpu-buffer"];case"ml-tensor":return[e.type,e.dims,{mlTensor:e.mlTensor},"ml-tensor"];default:throw new Error(`invalid data location: ${e.location} for ${t()}`)}},Tp=e=>{switch(e[3]){case"cpu":return new xe(e[0],e[2],e[1]);case"gpu-buffer":{let t=e[0];if(!It(t))throw new Error(`not supported data type: ${t} for deserializing GPU tensor`);let{gpuBuffer:n,download:r,dispose:o}=e[2];return xe.fromGpuBuffer(n,{dataType:t,dims:e[1],download:r,dispose:o})}case"ml-tensor":{let t=e[0];if(!Ct(t))throw new Error(`not supported data type: ${t} for deserializing MLTensor tensor`);let{mlTensor:n,download:r,dispose:o}=e[2];return xe.fromMLTensor(n,{dataType:t,dims:e[1],download:r,dispose:o})}default:throw new Error(`invalid data location: ${e[3]}`)}},nn=class{sessionId;inputNames;outputNames;inputMetadata;outputMetadata;async fetchModelAndCopyToWasmMemory(t){return Pu(await ct(t))}async loadModel(t,n){we();let r;typeof t=="string"?Ne?r=await ct(t):r=await this.fetchModelAndCopyToWasmMemory(t):r=t,[this.sessionId,this.inputNames,this.outputNames,this.inputMetadata,this.outputMetadata]=await zu(r,n),ye()}async dispose(){return Du(this.sessionId)}async run(t,n,r){we();let o=[],i=[];Object.entries(t).forEach(p=>{let f=p[0],m=p[1],h=this.inputNames.indexOf(f);if(h===-1)throw new Error(`invalid input '${f}'`);o.push(m),i.push(h)});let s=[],a=[];Object.entries(n).forEach(p=>{let f=p[0],m=p[1],h=this.outputNames.indexOf(f);if(h===-1)throw new Error(`invalid output '${f}'`);s.push(m),a.push(h)});let u=o.map((p,f)=>Mu(p,()=>`input "${this.inputNames[i[f]]}"`)),d=s.map((p,f)=>p?Mu(p,()=>`output "${this.outputNames[a[f]]}"`):null),l=await Bu(this.sessionId,i,u,a,d,r),c={};for(let p=0;p<l.length;p++)c[this.outputNames[a[p]]]=s[p]??Tp(l[p]);return ye(),c}startProfiling(){}endProfiling(){Ou(this.sessionId)}}});var Vu={};bt(Vu,{OnnxruntimeWebAssemblyBackend:()=>rn,initializeFlags:()=>Ru,wasmBackend:()=>Ip});var Ru,rn,Ip,Lu=E(()=>{$e();tr();Uu();Ru=()=>{(typeof ie.wasm.initTimeout!="number"||ie.wasm.initTimeout<0)&&(ie.wasm.initTimeout=0);let e=ie.wasm.simd;if(typeof e!="boolean"&&e!==void 0&&e!=="fixed"&&e!=="relaxed"&&(console.warn(`Property "env.wasm.simd" is set to unknown value "${e}". Reset it to \`false\` and ignore SIMD feature checking.`),ie.wasm.simd=!1),typeof ie.wasm.proxy!="boolean"&&(ie.wasm.proxy=!1),typeof ie.wasm.trace!="boolean"&&(ie.wasm.trace=!1),typeof ie.wasm.numThreads!="number"||!Number.isInteger(ie.wasm.numThreads)||ie.wasm.numThreads<=0)if(typeof self<"u"&&!self.crossOriginIsolated)ie.wasm.numThreads=1;else{let t=typeof navigator>"u"?sn("node:os").cpus().length:navigator.hardwareConcurrency;ie.wasm.numThreads=Math.min(4,Math.ceil((t||1)/2))}},rn=class{async init(t){Ru(),await ku(),await Eu(t)}async createInferenceSessionHandler(t,n){let r=new nn;return await r.loadModel(t,n),r}},Ip=new rn});$e();$e();$e();var Pr="1.30.0";var Zv=mn;{let e=(Lu(),an(Vu)).wasmBackend;Ze("webgpu",e,5),Ze("webnn",e,5),Ze("cpu",e,10),Ze("wasm",e,10)}Object.defineProperty(ie.versions,"web",{value:Pr,enumerable:!0});export{Fu as InferenceSession,$t as TRACE,Ve as TRACE_EVENT_BEGIN,Le as TRACE_EVENT_END,we as TRACE_FUNC_BEGIN,ye as TRACE_FUNC_END,xe as Tensor,Zv as default,ie as env,Ze as registerBackend};
/*! Bundled license information:

onnxruntime-web/lib/wasm/jsep/webgpu/ops/3rd-party/activation_util.ts:
onnxruntime-web/lib/wasm/jsep/webgpu/ops/3rd-party/conv_backprop_webgpu.ts:
  (**
   * @license
   * Copyright 2021 Google LLC. All Rights Reserved.
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * =============================================================================
   *)

onnxruntime-web/lib/wasm/jsep/webgpu/ops/3rd-party/conv_util.ts:
  (**
   * @license
   * Copyright 2020 Google LLC. All Rights Reserved.
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * =============================================================================
   *)

onnxruntime-web/lib/wasm/jsep/webgpu/ops/3rd-party/matmul_packed_webgpu.ts:
onnxruntime-web/lib/wasm/jsep/webgpu/ops/3rd-party/conv2d_mm_webgpu.ts:
onnxruntime-web/lib/wasm/jsep/webgpu/ops/3rd-party/conv3d_naive_webgpu.ts:
  (**
   * @license
   * Copyright 2019 Google LLC. All Rights Reserved.
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * =============================================================================
   *)
*/
