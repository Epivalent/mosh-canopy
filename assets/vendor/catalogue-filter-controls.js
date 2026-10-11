/* Shared controls: bead settings remain the single source of catalogue scope. */
globalThis.CatalogueFilterControls=class {
 constructor(host,enabled){
  this.enabled=enabled;this.inputs=[];
  for(const [id,title]of [
   ['beadSource','Sources'],['retroOn','Include YouTube catalogues'],['retroMix','YouTube share of new beads'],
   ['catalogueYearFrom','From year'],['catalogueYearTo','To year'],
   ['retroDecade','MyRetroTVs decade'],['retroCategory','MyRetroTVs programmes (any selected)'],
   ['neonOn','Include Neon Pulse in mixed exploration'],['neonCategory','Neon Pulse categories'],['neonBrand','Neon Pulse brand'],['neonStation','Neon Pulse station'],['neonTape','Neon Pulse tape'],
   ['miaEra','MIA era'],['miaCollection','MIA collection']]){
   const source=document.getElementById(id),categories=source.matches('[data-categories]');
   const label=document.createElement(categories?'div':'label'),input=source.cloneNode(true);
   label.className='fld';label.textContent=title+' ';input.removeAttribute('id');input.setAttribute('aria-label',title);
   for(const el of input.querySelectorAll('[id]'))el.removeAttribute('id');
   const range=input.type==='range',output=range?document.createElement('output'):null;
   input.addEventListener(range?'input':'change',e=>{
    if(categories){CatalogueSelection.changeCategories(input,e.target);CatalogueSelection.writeCategories(source,CatalogueSelection.readCategories(input));}
    else if(input.type==='checkbox')source.checked=input.checked;
    else source.value=input.value;
    source.dispatchEvent(new Event(range?'input':'change',{bubbles:true}));this.sync();
   });
   label.append(input);if(output)label.append(output);host.append(label);this.inputs.push({source,input,output,categories});
  }
  this.sync();
 }
 sync(){for(const {source,input,output,categories}of this.inputs){
  input.disabled=!this.enabled();
  if(categories){if(input.querySelectorAll('input').length!==source.querySelectorAll('input').length)input.replaceChildren(...[...source.childNodes].map(n=>n.cloneNode(true)));CatalogueSelection.writeCategories(input,CatalogueSelection.readCategories(source));}
  else if(source.tagName==='SELECT'){input.replaceChildren(...[...source.options].map(o=>o.cloneNode(true)));input.value=source.value;}
  else if(source.type==='checkbox')input.checked=source.checked;
  else input.value=source.value;
  if(output)output.textContent=source.value+'%';
 }}
};
