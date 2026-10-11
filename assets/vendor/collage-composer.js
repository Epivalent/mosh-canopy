/* Shared browser/offline composer. No partial response is ever installed as artwork. */
(function(root){
  const number={type:'number'},string={type:'string'};
  const object=properties=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
  const array=items=>({type:'array',items});
  const schema=object({title:string,concept:string,pieces:array(object({id:string,instance:string,x:number,y:number,size:number,rotation:number,flip:{type:'boolean'},z:number,crop:array(number)})),attachments:array(object({child:string,parent:string,childPoint:array(number),parentPoint:array(number)})),ornaments:array(object({kind:{type:'string',enum:['path','banner','cloud','star','stairs','arch','orbit','rays','arrow']},x:number,y:number,w:number,h:number,rotation:number,color:string,fill:{type:['string','null']},lineWidth:number,z:number,text:string,path:string}))});
  function parse(data,items){
    if(data.error)throw Error(data.error.message||'The provider failed to generate a layout.');
    const choice=data.choices?.[0];if(!choice)throw Error('The provider returned no response.');
    if(choice.finish_reason==='length')throw Error('The provider reached its output limit before finishing the layout.');
    if(choice.message?.refusal)throw Error(choice.message.refusal);
    const raw=choice.message?.content;if(typeof raw!=='string'||!raw.trim())throw Error('The provider returned no layout.');
    let decoded;try{decoded=JSON.parse(raw.trim().replace(/^```(?:json)?\s*|\s*```$/g,''));}catch{throw Error('The provider returned incomplete or invalid JSON.');}
    const plan=CollageLayout.validate(decoded,items),available=new Set(items.map(i=>i.filmId||i.title)),used=items.filter(i=>plan.pieces.some(p=>p.id===i.id)),films=[...new Set(used.map(i=>i.filmId||i.title))];
    if(films.length<Math.min(3,available.size))throw Error('The composition must use material from at least '+Math.min(3,available.size)+' distinct films.');
    return plan;
  }
  async function request({key,model,endpoint='https://openrouter.ai/api/v1/chat/completions',content,items,onStatus=()=>{},onResponse=()=>{},fetchImpl=fetch,signal}){
    let issue,previous;const responses=[];
    for(let attempt=0;attempt<2;attempt++){
      const messages=[{role:'user',content}];
      if(attempt){onStatus('The provider returned an unfinished layout; requesting one corrected response…');
        if(previous?.choices?.[0]?.finish_reason!=='length'&&previous?.choices?.[0]?.message?.content){messages.push({role:'assistant',content:previous.choices[0].message.content});}
        messages.push({role:'user',content:'Your previous response could not be accepted: '+issue.message+' Return a complete corrected JSON object matching the schema. Keep it concise: at most 12 pieces, 10 attachments and 4 ornaments. No commentary.'});}
      const response=await fetchImpl(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+key},body:JSON.stringify({model,messages,response_format:{type:'json_schema',json_schema:{name:'film_collage',strict:true,schema}},provider:{require_parameters:true},max_tokens:attempt?24000:12000}),signal:signal||AbortSignal.timeout(240000)});
      if(!response.ok){const error=Error('Composer HTTP '+response.status+': '+(await response.text()).slice(0,300));error.status=response.status;throw error;}
      const data=await response.json();responses.push(data);await onResponse(data,attempt);previous=data;
      // Provider failures/refusals are not a reason to spend another generation.
      if(data.error||data.choices?.[0]?.message?.refusal)parse(data,items);
      try{return {plan:parse(data,items),responses};}catch(e){issue=e;}
    }
    throw Error(issue.message+' Existing collages have been kept.');
  }
  root.CollageComposer={schema,parse,request,defaultModel:'anthropic/claude-opus-5.5'};
})(typeof self==='undefined'?globalThis:self);
