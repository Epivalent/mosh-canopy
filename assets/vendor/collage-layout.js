/* Shared declarative collage format. All coordinates normalized; no executable model output. */
(function(root){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const palette=['#e9e3d4','#b94d38','#65958e','#cfb473','#242a29'];
  function fallback(items){
    // Uncomposed material waits in an orderly clipping rack. No decorative random filler.
    const slots=[[.28,.26],[.70,.26],[.28,.57],[.70,.57],[.28,.82],[.70,.82]];
    return {title:'Collected material',pieces:items.map((item,i)=>({id:item.id,instance:item.id,x:slots[i%6][0],y:slots[i%6][1],size:i<4?.34:.24,rotation:0,flip:false,z:i,crop:[0,0,1,1]})),ornaments:[],attachments:[]};
  }
  function validate(plan,items){
    if(!plan||!Array.isArray(plan.pieces))throw Error('The composer returned no arrangement.');
    const ids=new Set(items.map(x=>x.id)),seen=new Set(),instances=new Set();
    const n=(v,a,b,d)=>Number.isFinite(v)?clamp(v,a,b):d;
    const pieces=[];
    for(const [i,p] of plan.pieces.slice(0,24).entries()){
      if(!ids.has(p.id))continue;
      const crop=Array.isArray(p.crop)&&p.crop.length===4?p.crop:[0,0,1,1];
      const x=n(crop[0],0,.95,0),y=n(crop[1],0,.95,0),c=[x,y,n(crop[2],.05,1-x,1-x),n(crop[3],.05,1-y,1-y)];
      const signature=p.id+':'+c.map(v=>v.toFixed(3)).join(',');if(seen.has(signature))continue;seen.add(signature);
      let instance=String(p.instance||`part-${i}`).slice(0,80);if(instances.has(instance))instance+=`-${i}`;instances.add(instance);
      pieces.push({id:p.id,instance,x:n(p.x,.03,.97,.5),y:n(p.y,.03,.97,.5),size:n(p.size,.05,.9,.4),rotation:n(p.rotation,-180,180,0),flip:p.flip===true,z:n(p.z,-20,30,0),crop:c});
    }
    if(!pieces.length)throw Error('The composer did not select any available cutouts.');
    const color=v=>/^#[0-9a-f]{6}$/i.test(v)?v:null;
    const allowed=new Set(['arch','stairs','rays','orbit','star','cloud','arrow','banner','path']);
    const ornaments=(plan.ornaments||[]).slice(0,24).filter(o=>allowed.has(o.kind)).map(o=>({kind:o.kind,x:n(o.x,0,1,.5),y:n(o.y,0,1,.5),w:n(o.w,.01,.96,.2),h:n(o.h,.01,.96,.2),rotation:n(o.rotation,-180,180,0),color:color(o.color)||palette[0],fill:color(o.fill),lineWidth:n(o.lineWidth,.001,.025,.003),z:n(o.z,-20,30,-1),text:String(o.text||'').slice(0,60),path:typeof o.path==='string'&&o.path.length<8000?o.path:''}));
    const point=a=>Array.isArray(a)&&a.length===2?a.map(v=>n(v,0,1,.5)):[.5,.5];
    const attachments=(plan.attachments||[]).slice(0,24).filter(a=>instances.has(a.child)&&instances.has(a.parent)&&a.child!==a.parent).map(a=>({child:a.child,parent:a.parent,childPoint:point(a.childPoint),parentPoint:point(a.parentPoint)}));
    return {title:String(plan.title||'').slice(0,100),concept:String(plan.concept||'').slice(0,1200),pieces,ornaments,attachments};
  }
  function bounds(piece,aspect){
    let w=piece.size*(aspect>=1?1:aspect),h=piece.size*(aspect>=1?1/aspect:1),a=piece.rotation*Math.PI/180;
    const extentX=Math.abs(Math.cos(a))*w+Math.abs(Math.sin(a))*h,extentY=Math.abs(Math.sin(a))*w+Math.abs(Math.cos(a))*h;
    const fit=Math.min(1,.94/extentX,.94/extentY);w*=fit;h*=fit;
    return {w,h,x:clamp(piece.x,.03+extentX*fit/2,.97-extentX*fit/2),y:clamp(piece.y,.03+extentY*fit/2,.97-extentY*fit/2)};
  }
  function placements(plan,items){
    const result=new Map();for(const p of plan.pieces){const item=items.find(i=>i.id===p.id),w=item.width||item.image.width,h=item.height||item.image.height,c=p.crop||[0,0,1,1];result.set(p.instance,{...bounds(p,w*c[2]/(h*c[3])),piece:p});}
    const local=(g,p)=>{const a=g.piece.rotation*Math.PI/180,x=(p[0]-.5)*g.w*(g.piece.flip?-1:1),y=(p[1]-.5)*g.h;return [Math.cos(a)*x-Math.sin(a)*y,Math.sin(a)*x+Math.cos(a)*y];};
    const byChild=new Map((plan.attachments||[]).map(a=>[a.child,a])),done=new Set();
    function attach(id,path=new Set()){
      if(done.has(id)||path.has(id))return;path.add(id);const a=byChild.get(id);if(a){attach(a.parent,path);const child=result.get(id),parent=result.get(a.parent);if(child&&parent){const c=local(child,a.childPoint),p=local(parent,a.parentPoint);child.x=parent.x+p[0]-c[0];child.y=parent.y+p[1]-c[1];}}
      path.delete(id);done.add(id);
    }
    for(const id of result.keys())attach(id);return result;
  }
  const prompt=`Make a witty, surprising photomontage from this GLOBAL LIBRARY of extracted objects from many unrelated archive films. You are choosing material for an idea, not decorating whatever arrived last. Inspect the actual cutouts: labels can be wrong, masks can be poor, and a source title is context rather than a command. Reject indistinct, ugly or redundant fragments. Select a small useful subset from at least three different films; leave the rest unused. Develop one strong concept with a clear visual punchline, physical interactions and deliberate scale. Think surreal cut-paper cartoon theatre, absurd bureaucratic machinery, impossible anatomy, dream logic, playful Dada. Do more than scatter people around a large head. A cutout can become a body, head, limb, vehicle, tool or habitat. You may cut out a useful PART of an existing silhouette and combine it with another film's object. Make things join at exact contact points: head to body, foot to platform, hand to lever, boat to impossible wheel. Use attachments for these contacts. Avoid generic rays, arrows and ornamental lines. Any additional paper/vector shapes must contribute to the depicted action. Preserve transparent negative space, a clear hierarchy and readable source detail. Aim for a complete visual scene rather than a mood board. Prefer 5–8 carefully joined parts over crowded assemblies. A body must look intentionally assembled: a cropped-off limb needs a designed joint or replacement, not an accidental stump. Contact points must land on visible pixels, not the transparent corners of image bounds. Avoid detached props. Any invented props must be filled cut-paper silhouettes, with only restrained internal engraving. Do not draw wireframe machinery, empty box outlines, baseline strips or decorative diagrams. Use at most three supporting props. Text is optional; if present make it a very short, dry aside. Do not force every image into the work. Explain the concept in one sentence, then provide the composition.`;
  const protocol=`OUTPUT FORMAT (JSON only): {title,concept,pieces:[{id,instance,x,y,size,rotation,flip,z,crop:[x,y,w,h]}],attachments:[{child,parent,childPoint:[u,v],parentPoint:[u,v]}],ornaments:[{kind,x,y,w,h,rotation,color,fill,lineWidth,z,text,path}]}. Use supplied cutout ids; choose only the ones that serve the scene. Each piece needs a unique instance name. Coordinates x/y are centre positions in the square, 0..1 with y down. Size is the longest side of the cropped piece; aspect ratio is preserved. Crop defaults to [0,0,1,1] and selects a normalized rectangle WITHIN an already transparent silhouette; it does not introduce a rectangular photo. Different cropped parts of one cutout can become separate pieces. Rotation is degrees clockwise, flip mirrors horizontally; z controls overlap. Attachments join two points exactly; points are normalized within each cropped piece BEFORE rotation/flip, using the unique instance names. Choose these points by looking at the pixels; children move so their point touches the parent point. Arrange parents before children and avoid cycles. Pieces/ornaments must stay inside the square. Do not obscure faces accidentally. Ornamental kind path allows ANY cut-paper silhouette or engraving defined by an SVG path in a 0..1 local coordinate box. Its optional fill/color are six-digit hex colors; lineWidth is in final normalized panel units. Other optional kinds are cloud,star,banner,stairs,arch,orbit,rays,arrow; these are tools, not a checklist. Prefer a few imaginative supporting silhouettes over canned decoration. Supply only the fields needed for each ornament. At most 16 image pieces, with enough source films to create a real cross-film encounter. Return no markdown.`;
  root.CollageLayout={fallback,validate,bounds,placements,prompt,protocol,palette};
})(typeof self==='undefined'?globalThis:self);
