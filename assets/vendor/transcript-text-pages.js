/* All search-result layouts are resident. One glyph atlas serves the whole stack;
   only the visible text bands need GPU geometry. No raster requests on scrubbing. */
window.TranscriptTextPages=class TranscriptTextPages {
  constructor(T,atlas){this.T=T;this.atlas=atlas;this.texture=new T.Texture(atlas.bitmap);this.texture.flipY=false;this.texture.minFilter=this.texture.magFilter=T.LinearFilter;this.texture.generateMipmaps=false;this.texture.needsUpdate=true;}
  dispose(){this.texture.dispose();this.atlas.bitmap.close();}
  release(page){if(!page.ink)return;page.mesh.remove(page.ink);page.ink.geometry.dispose();page.ink.material.dispose();page.ink=null;page.band=null;}
  draw(page,top,bottom){
    top=Math.max(0,Math.floor(top/512)*512);bottom=Math.min(page.height,Math.ceil(bottom/512)*512);
    if(page.band?.[0]===top&&page.band?.[1]===bottom)return;
    const T=this.T,rects=[],uvs=[],colors=[],glyphs=this.atlas.glyphs;
    const quad=(x,y,w,h,uv,color)=>{rects.push(x,y,w,h);uvs.push(...uv);colors.push(...color);};
    const text=(word,x,y,width,color,scale=1)=>{
      let natural=0;for(const ch of word)natural+=glyphs[ch]?.advance||0;
      const sx=width===null?scale:width/Math.max(.01,natural);
      for(const ch of word){const g=glyphs[ch];if(!g)continue;
        if(ch.trim())quad(x-(g.pad+g.left)*sx,y-g.pad*scale,g.width*sx,g.height*scale,[g.x/this.atlas.width,1-(g.y+g.height)/this.atlas.height,g.width/this.atlas.width,g.height/this.atlas.height],color);
        x+=g.advance*sx;
      }
    };
    if(bottom>top)quad(0,top,7,bottom-top,[-1,0,0,0],[.71,.196,.443]);
    const a=page.positions,n=page.words.length;let lo=0,hi=n;
    while(lo<hi){const mid=(lo+hi)>>1;if(a[mid*4+1]+44<top)lo=mid+1;else hi=mid;}
    for(let i=lo;i<n&&a[i*4+1]<=bottom;i++){
      const j=i*4,x=a[j],y=a[j+1],width=a[j+2],match=page.matches[i];
      if(match)quad(x-3,y-2,width+6,38,[-1,0,0,0],match===2?[.906,.686,.741]:[.886,.804,.816]);
      text(this.atlas.words?this.atlas.words[page.words[i]]:page.words[i],x,y,width,match===2?[.443,.129,.255]:[.157,.157,.196]);
    }
    if(top<122){
      let title=page.title;const width=s=>[...s].reduce((sum,ch)=>sum+(glyphs[ch]?.advance||0),0)*32/28;
      while(title.length&&width(title)>1096)title=title.slice(0,-1);
      text(title,72,21,null,[.149,.145,.165],32/28);
      text('“'+page.term+'” · '+a[page.index*4+3].toFixed(2)+' s · click any word to enter its film',72,69,null,[.424,.388,.392],15/28);
      quad(72,98,1136,1,[-1,0,0,0],[.698,.659,.631]);
    }
    if(bottom>=page.height-40)text(n+' words · '+Number(page.duration||0).toFixed(1)+' seconds',72,page.height-41,null,[.463,.42,.427],.5);
    const count=rects.length/4;
    if(!page.ink){const base=new T.PlaneGeometry(1,1),geometry=new T.InstancedBufferGeometry();geometry.index=base.index;geometry.attributes.position=base.attributes.position;geometry.attributes.uv=base.attributes.uv;
      const material=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{uAtlas:{value:this.texture},uPage:{value:new T.Vector2(page.width,page.height)},uOpacity:{value:1}},
        vertexShader:'attribute vec4 aRect,aUV;attribute vec3 aColor;uniform vec2 uPage;varying vec2 vUV;varying vec3 vColor;varying float vSolid;void main(){vec2 p=aRect.xy+vec2(uv.x,1.-uv.y)*aRect.zw;vUV=aUV.xy+uv*aUV.zw;vSolid=step(aUV.x,-.5);vColor=aColor;gl_Position=projectionMatrix*modelViewMatrix*vec4((p.x-uPage.x*.5)/160.,(uPage.y*.5-p.y)/160.,.003,1.);}',
        fragmentShader:'uniform sampler2D uAtlas;uniform float uOpacity;varying vec2 vUV;varying vec3 vColor;varying float vSolid;void main(){float a=vSolid>.5?1.:texture2D(uAtlas,vUV).a;if(a<.01)discard;gl_FragColor=vec4(vColor,a*uOpacity);}'});
      page.ink=new T.Mesh(geometry,material);page.ink.frustumCulled=false;page.mesh.add(page.ink);
    }
    const geometry=page.ink.geometry;
    if(!page.capacity||count>page.capacity){
      // Dispose the old buffers before replacing them; the mesh/material persist.
      geometry.dispose();page.capacity=Math.max(256,2**Math.ceil(Math.log2(Math.max(1,count))));
      for(const [name,size]of [['aRect',4],['aUV',4],['aColor',3]]){const attr=new T.InstancedBufferAttribute(new Float32Array(page.capacity*size),size);attr.setUsage(T.DynamicDrawUsage);geometry.setAttribute(name,attr);}
    }
    for(const [name,values]of [['aRect',rects],['aUV',uvs],['aColor',colors]]){const attr=geometry.getAttribute(name);attr.array.set(values);attr.updateRange.offset=0;attr.updateRange.count=values.length;attr.needsUpdate=true;}
    geometry.instanceCount=count;page.band=[top,bottom];
  }
};
