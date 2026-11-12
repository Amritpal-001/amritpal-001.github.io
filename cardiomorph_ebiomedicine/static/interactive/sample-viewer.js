/* One copied sample; original saved masks and landmarks, illustrative depth only. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id),S=window.CardioSample,G=window.CardioGeometry,SG=window.SampleGeometry,NS='http://www.w3.org/2000/svg';
  const structures=new Map(S.structures.map(s=>[s.id,s])),chambers=S.structures.filter(s=>s.landmarks),features=new Map(S.features.map(f=>[f.id,f]));
  const landmarks=new Map(chambers.flatMap(s=>s.landmarks.map(p=>[p.id,{...p,chamber:s.id,color:s.color}])));
  const names={LA:'Left atrium',RA:'Right atrium',LV:'Left ventricle',RV:'Right ventricle'};
  const chamberLevels={LA:-1.5,RA:-.5,LV:.5,RV:1.5}; // Used only in explicitly exploded view.
  const sharedSurface=SG.connectedSurface([structures.get('heart').contour,...chambers.map(s=>s.contour)]);
  const sharedFaceMeta=sharedSurface.faces.map(face=>{
    const p=face.reduce((sum,i)=>[sum[0]+sharedSurface.vertices[i][0]/3,sum[1]+sharedSurface.vertices[i][1]/3],[0,0]);
    return {chambers:chambers.filter(s=>SG.contains(p,s.contour)).map(s=>s.id),features:S.features.filter(f=>SG.contains(p,f.polygon)).map(f=>f.id)};
  });
  let selectedFeature='upper',selectedPoint=null,selectedChamber=null,stage=5,heartDetail=true,yaw=-.55,pitch=.28,drag=null,hitTriangles=[],meshCache=null,meshKey='',styleCache=null,styleKey='',variant='connected',roundedSolo=false;
  const variantStates={},roundedTemplates=new Map(),roundedOffsets={LA:-.24,RA:-.1,LV:0,RV:.24};
  const structureRGB=new Map(S.structures.map(s=>[s.id,s.color.slice(1).match(/../g).map(v=>parseInt(v,16))]));
  const center=structures.get('heart').centroid,canvas=$('sample-depth-canvas'),ctx=canvas.getContext('2d'),image=new Image();
  const titleCase=value=>value.charAt(0).toUpperCase()+value.slice(1).replaceAll('_',' ');
  const xyPath=points=>points.map((p,i)=>`${i?'L':'M'}${p[0]} ${p[1]}`).join(' ')+' Z';
  const svgEl=(tag,attributes={})=>{const el=document.createElementNS(NS,tag);Object.entries(attributes).forEach(([key,value])=>el.setAttribute(key,String(value)));return el;};
  const visibleChambers=()=>chambers.filter(s=>$('show-sample-'+s.id).checked);
  const featureVisible=()=>$('sample-feature').checked;
  const world=(p,z=0)=>[(p[0]-center[0])/120,(center[1]-p[1])/120,z];
  const rounded=()=>variant==='rounded';
  const connected=()=>!rounded()&&$('sample-surface-mode').value==='connected';
  const depthChambers=()=>visibleChambers().filter(s=>!rounded()||!roundedSolo||s.id===selectedChamber);
  function roundedTemplate(s){
    if(!roundedTemplates.has(s.id)){
      const template=SG.roundedChamber(s.contour,s.centroid);
      template.featureRegions=template.faces.map(face=>{const p=face.reduce((sum,i)=>[sum[0]+template.vertices[i][0]/3,sum[1]+template.vertices[i][1]/3],[0,0]);return S.features.filter(f=>SG.contains(p,f.polygon)).map(f=>f.id);});
      roundedTemplates.set(s.id,template);
    }return roundedTemplates.get(s.id);
  }
  const chamberRadius=s=>Math.sqrt(s.pixel_area/Math.PI)*.92*Number($('sample-depth').value)/80/120;
  function roundedPosition(p,chamber,lift=.006){const s=structures.get(chamber),template=roundedTemplate(s),height=template.surfaceAt(p[0],p[1])??0,radius=chamberRadius(s);return world(p,(height+roundedOffsets[chamber])*radius+lift);}
  function roundedFrontPoint(p){let z=null;for(const s of depthChambers()){const height=roundedTemplate(s).surfaceAt(p[0],p[1]);if(height!==null){const candidate=(height+roundedOffsets[s.id])*chamberRadius(s);if(z===null||candidate>z)z=candidate;}}return z===null?null:world(p,z+.007);}
  const surfaceHeight=p=>sharedSurface.heightAt(p[0],p[1])*Number($('sample-depth').value)/240;
  const pointWorld=(p,chamber,lift=.006)=>rounded()?roundedPosition(p,chamber,lift):world(p,(connected()?surfaceHeight(p):(Number($('sample-depth').value)/2+chamberLevels[chamber]*Number($('sample-separation').value))/120)+lift);
  const stages={1:['01 / Start with the chest X-ray','The copied image is shown in its saved orientation, before any overlays.'],2:['02 / Overlay the saved predictions','Each coloured mask comes from the matching saved CXAS segmentation array.'],3:['03 / Map the chamber landmarks','Four extrema per chamber become points 1–4. Click a point to inspect its coordinates.'],4:['04 / Join the landmarks into feature polygons','The polygon definitions and pixel measurements follow the archived cardiac phenotype code.'],5:['05 / Lift the same contours into depth','Rotate the derived view while the original X-ray, masks and landmarks remain linked on the left.']};

  $('sample-chambers').replaceChildren(...chambers.map(s=>{
    const row=document.createElement('div');row.className='sample-layer';row.dataset.chamber=s.id;
    const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.id='show-sample-'+s.id;checkbox.checked=true;checkbox.setAttribute('aria-label','Show '+names[s.id].toLowerCase());checkbox.addEventListener('input',render);
    const swatch=document.createElement('span');swatch.className='swatch';swatch.style.background=s.color;
    const button=document.createElement('button');button.append(document.createTextNode(names[s.id]));const small=document.createElement('small');small.textContent=`${s.id} · channel ${s.channel}`;button.append(small);button.addEventListener('click',()=>selectChamber(s.id));row.append(checkbox,swatch,button);return row;
  }));
  $('sample-feature-buttons').replaceChildren(...S.features.map(f=>{
    const button=document.createElement('button');button.textContent=titleCase(f.id);button.dataset.feature=f.id;button.addEventListener('click',()=>selectFeature(f.id));return button;
  }));
  function selectChamber(id){selectedChamber=id;selectedPoint=null;$('show-sample-'+id).checked=true;const s=structures.get(id);$('sample-selection-note').textContent=`${names[id]} (${id}) · saved mask area ${s.pixel_area.toLocaleString()} px² · centroid (x ${s.centroid[0].toFixed(1)}, y ${s.centroid[1].toFixed(1)}).`;render();}
  function selectPoint(id,restoreFocus=false){
    const p=landmarks.get(id);selectedPoint=id;selectedChamber=p.chamber;$('show-sample-'+p.chamber).checked=true;
    $('sample-selection-note').textContent=`${id} · ${names[p.chamber]} · ${p.extremum} extremum · x ${p.position[0]}, y ${p.position[1]} px. Suffixes: 1 top, 2 bottom, 3 image left, 4 image right.`;
    render();if(restoreFocus)requestAnimationFrame(()=>document.querySelector(`#sample-point-layer [data-landmark="${id}"]`)?.focus());
  }
  function selectFeature(id){selectedFeature=id;selectedPoint=null;selectedChamber=null;$('sample-feature').checked=true;$('sample-points').checked=true;if(stage<4)stage=4;$('sample-selection-note').textContent=`${titleCase(id)} feature · original landmark sequence: ${features.get(id).landmarks.join(' → ')}. Measurements come from the 2D polygon.`;render();}
  function render2D(){
    const opacity=Number($('sample-opacity').value)/100,activeFeature=features.get(selectedFeature),showPoints=$('sample-points').checked,showLabels=$('sample-labels').checked;
    const masks=[],outlines=[],points=[],spokes=[];
    for(const s of visibleChambers()){
      masks.push(svgEl('image',{href:'static/interactive/sample/'+s.mask,width:512,height:512,opacity:selectedChamber&&selectedChamber!==s.id?opacity*.45:opacity,'pointer-events':'none'}));
      const outline=svgEl('path',{d:xyPath(s.contour),fill:'transparent',stroke:s.color,'stroke-width':selectedChamber===s.id?1.5:.65,opacity:.9,role:'button',tabindex:0,'aria-label':'Select '+names[s.id].toLowerCase()});
      outline.addEventListener('click',()=>selectChamber(s.id));outline.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectChamber(s.id);}});outlines.push(outline);
      const [cx,cy]=s.centroid;
      if($('sample-spokes').checked){for(const point of s.landmarks)spokes.push(svgEl('line',{x1:cx,y1:cy,x2:point.position[0],y2:point.position[1],stroke:'#263337','stroke-width':.65,opacity:.8}));spokes.push(svgEl('circle',{cx,cy,r:2,fill:'#172b2c',stroke:'#fff','stroke-width':.6}));}
      if(showPoints)for(const point of s.landmarks){
        const [x,y]=point.position,inFeature=featureVisible()&&activeFeature.landmarks.includes(point.id),active=selectedPoint===point.id;
        const group=svgEl('g',{class:'sample-point',role:'button',tabindex:0,'aria-label':`${point.id}: ${point.extremum} of ${names[s.id]}, x ${x}, y ${y}`,'data-landmark':point.id,'aria-pressed':active});
        group.append(svgEl('circle',{cx:x,cy:y,r:active?3.6:inFeature?2.8:2.1,fill:active?'#ffe799':inFeature?'#ffcee1':s.color}));
        if(showLabels){const number=Number(point.id.slice(-1)),offsets={1:[3,-7],2:[3,10],3:[-23,-3],4:[5,4]},[dx,dy]=offsets[number];group.append(svgEl('rect',{x:x+dx-2,y:y+dy-7,width:18,height:10,rx:1.5,fill:active||inFeature?'#594351':'#183236',opacity:.88,'pointer-events':'none'}));const text=svgEl('text',{x:x+dx,y:y+dy,class:'point-label'+(active||inFeature?' active':'')});text.textContent=point.id;group.append(text);}
        group.addEventListener('click',()=>selectPoint(point.id));group.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectPoint(point.id,true);}});points.push(group);
      }
    }
    if($('sample-heart').checked)outlines.unshift(svgEl('path',{d:xyPath(structures.get('heart').contour),fill:'none',stroke:'#e8f6ec','stroke-width':.8,'stroke-dasharray':'3 2',opacity:.8,'pointer-events':'none'}));
    $('sample-mask-layers').replaceChildren(...masks);$('sample-outline-layers').replaceChildren(...outlines);$('sample-point-layer').replaceChildren(...points);$('sample-spoke-layer').replaceChildren(...spokes);
    const vessel=structures.get($('sample-vessel').value);
    $('sample-vessel-layer').replaceChildren(...(vessel?[svgEl('image',{href:'static/interactive/sample/'+vessel.mask,width:512,height:512,opacity:.35,'pointer-events':'none'}),svgEl('path',{d:xyPath(vessel.contour),fill:'none',stroke:vessel.color,'stroke-width':.8,'pointer-events':'none'})]:[]));
    if(vessel){const metrics=S.vessel_features.find(f=>f.id===vessel.id);$('vessel-readout').textContent=`Heart overlap ${metrics.overlap_pixels.toLocaleString()} px · outside heart ${metrics.outside_pixels.toLocaleString()} px.`;}else $('vessel-readout').textContent='Uses saved masks from the same sample.';
    $('sample-feature-layer').replaceChildren(...(featureVisible()?[svgEl('path',{d:xyPath(activeFeature.polygon),class:'feature-polygon','pointer-events':'none'})]:[]));
    $('sample-svg').setAttribute('viewBox',heartDetail?'150 220 300 265':'0 0 512 512');$('sample-focus').setAttribute('aria-pressed',String(heartDetail));$('sample-focus').textContent=heartDetail?'Heart detail':'Full chest';
    $('sample-point-count').textContent=showPoints?`${visibleChambers().length*4} chamber landmarks`:'Landmarks hidden';
    $('sample-opacity-value').value=`${Math.round(opacity*100)}%`;
  }
  function renderInspector(){
    const feature=features.get(selectedFeature);
    $('sample-feature-name').textContent=titleCase(selectedFeature)+' feature';$('sample-feature-definition').textContent=[...feature.landmarks,feature.landmarks[0]].join(' → ');
    $('sample-feature-area').textContent=feature.area.toLocaleString('en-US',{minimumFractionDigits:1,maximumFractionDigits:1});$('sample-feature-perimeter').textContent=feature.perimeter.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
    $('sample-feature-points').replaceChildren(...feature.landmarks.map(id=>{const point=landmarks.get(id),button=document.createElement('button');button.append(document.createTextNode(id));button.setAttribute('aria-pressed',String(selectedPoint===id));const span=document.createElement('span');span.textContent=`x ${point.position[0]}, y ${point.position[1]}`;button.append(span);button.addEventListener('click',()=>selectPoint(id));return button;}));
    document.querySelectorAll('[data-feature]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.feature===selectedFeature)));
    document.querySelectorAll('[data-chamber]').forEach(row=>{row.classList.toggle('selected',row.dataset.chamber===selectedChamber);row.querySelector('button').setAttribute('aria-pressed',String(row.dataset.chamber===selectedChamber));});
    document.querySelectorAll('[data-stage]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.stage)===stage)));
    $('stage-heading').textContent=rounded()&&stage===5?'05 / Round each chamber from its saved outline':stages[stage][0];$('stage-description').textContent=rounded()&&stage===5?'Individual curved chamber forms carry the same source landmarks and projected feature footprints.':stages[stage][1];
    $('sample-workspace').classList.toggle('rounded-variant',rounded());
    $('sample-rounded-controls').hidden=!rounded();$('sample-rounded-note').hidden=!rounded();$('sample-spacing-control').hidden=rounded();document.querySelector('.surface-mode-controls').hidden=rounded();
    $('sample-depth-title').textContent=rounded()?'Rounded chamber forms':'Contour-derived depth view';$('sample-depth-corner').textContent=rounded()?'INDIVIDUAL CHAMBERS':'SHARED SURFACE';$('sample-depth-label').textContent=rounded()?'Illustrative chamber fullness':'Assumed surface depth';
    $('sample-rounded-solo').setAttribute('aria-pressed',String(roundedSolo));$('sample-rounded-solo').textContent=roundedSolo?'Show all chambers':'Solo selected chamber';
    $('sample-variant-panel').setAttribute('aria-labelledby','sample-tab-'+variant);
    for(const name of ['connected','rounded']){const tab=$('sample-tab-'+name),active=variant===name;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;}
  }
  function meshList(){
    const depth=Number($('sample-depth').value)/120,separation=Number($('sample-separation').value)/120,vesselId=$('sample-vessel').value;
    const key=`${variant}:${connected()}:${depth}:${connected()||rounded()?0:separation}:${depthChambers().map(s=>s.id).join()}:${vesselId}:${$('sample-heart').checked}`;
    if(key===meshKey)return meshCache;meshKey=key;
    if(rounded())meshCache=depthChambers().map(s=>{const t=roundedTemplate(s),radius=chamberRadius(s),vertices=t.vertices.map(p=>world(p,(p[2]+roundedOffsets[s.id])*radius));return {id:s.id,color:s.color,kind:'rounded',vertices,faces:t.faces,normals:SG.vertexNormals(vertices,t.faces,t.ring.length),featureRegions:t.featureRegions};});
    else if(connected())meshCache=visibleChambers().length||$('sample-heart').checked?[{id:'shared-heart',color:'#b0bdb2',vertices:sharedSurface.vertices.map(p=>world(p,p[2]*depth/2)),faces:sharedSurface.faces,meta:sharedFaceMeta}]:[];
    else meshCache=visibleChambers().map(s=>({id:s.id,color:s.color,...SG.extrude(s.contour.map(p=>world(p).slice(0,2)),depth,chamberLevels[s.id]*separation)}));
    if(vesselId!=='none'){const s=structures.get(vesselId);meshCache.push({id:s.id,color:s.color,...SG.extrude(s.contour.map(p=>world(p).slice(0,2)),depth*.55,connected()||rounded()?0:-2*separation)});}
    return meshCache;
  }
  function textureTriangle(source,dest){
    const [s0,s1,s2]=source,[p0,p1,p2]=dest,u1=s1[0]-s0[0],v1=s1[1]-s0[1],u2=s2[0]-s0[0],v2=s2[1]-s0[1],det=u1*v2-u2*v1;
    if(Math.abs(det)<1e-9)return;
    const dx1=p1[0]-p0[0],dy1=p1[1]-p0[1],dx2=p2[0]-p0[0],dy2=p2[1]-p0[1];
    const a=(dx1*v2-dx2*v1)/det,c=(dx2*u1-dx1*u2)/det,b=(dy1*v2-dy2*v1)/det,d=(dy2*u1-dy1*u2)/det;
    ctx.save();ctx.beginPath();ctx.moveTo(...p0.slice(0,2));ctx.lineTo(...p1.slice(0,2));ctx.lineTo(...p2.slice(0,2));ctx.closePath();ctx.clip();ctx.transform(a,b,c,d,p0[0]-a*s0[0]-c*s0[1],p0[1]-b*s0[0]-d*s0[1]);ctx.globalAlpha=.45;ctx.drawImage(image,0,0,512,512);ctx.restore();
  }
  function sharedStyles(){
    const enabled=new Set(visibleChambers().map(s=>s.id)),key=[...enabled].join()+':'+selectedFeature+':'+featureVisible()+':'+selectedChamber;
    if(key===styleKey)return styleCache;styleKey=key;
    styleCache=sharedFaceMeta.map(meta=>{
      const members=meta.chambers.filter(id=>enabled.has(id));
      const bases=members.length?members.map(id=>structureRGB.get(id)):[[176,189,178]];
      let rgb=[0,1,2].map(k=>bases.reduce((sum,c)=>sum+c[k],0)/bases.length);
      if(featureVisible()&&meta.features.includes(selectedFeature))rgb=rgb.map((v,k)=>v*.4+[244,163,197][k]*.6);
      return {id:members[0]||'shared-heart',rgb,emphasis:!selectedChamber||members.includes(selectedChamber)?1:.72};
    });return styleCache;
  }
  function renderDepth(){
    if(!ctx)return;const width=canvas.clientWidth,height=canvas.clientHeight;if(!width||!height)return;
    const dpr=Math.min(window.devicePixelRatio||1,2);if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)){canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
    const zoom=Number($('sample-depth-zoom').value)/100,scale=Math.min(width/3,height/3)*zoom;
    const project=p=>{const r=G.rotate(p,yaw,pitch),k=8/(8-r[2]);return [width/2+r[0]*scale*k,height*.54-r[1]*scale*k,r[2]];};
    const depth=Number($('sample-depth').value),separation=connected()||rounded()?0:Number($('sample-separation').value),planeZ=rounded()?-.9:-.15-(depth/2+separation*2)/120;
    $('sample-separation').disabled=connected()||rounded();
    $('sample-surface-note').textContent=connected()?'One welded surface: chamber colours, landmarks and feature highlights share the same depth field.':'Exploded inspection view: chamber slabs are deliberately separated; the connecting lines are a landmark graph.';
    if($('sample-xray-plane').checked&&image.complete&&image.naturalWidth){
      for(let y=0;y<512;y+=64)for(let x=0;x<512;x+=64){const a=[x,y],b=[x+64,y],c=[x,y+64],d=[x+64,y+64];textureTriangle([a,b,c],[a,b,c].map(p=>project(world(p,planeZ))));textureTriangle([b,d,c],[b,d,c].map(p=>project(world(p,planeZ))));}
      const corners=[[0,0],[512,0],[512,512],[0,512]].map(p=>project(world(p,planeZ)));ctx.beginPath();corners.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.strokeStyle='#bad6ca66';ctx.lineWidth=.7;ctx.stroke();
    }
    const light=G.normalize([-.3,.6,1.5]),halfVector=G.normalize([-.15,.35,1.7]),faces=[],surfaceStyles=connected()?sharedStyles():null;
    for(const mesh of meshList()){
      const projected=mesh.vertices.map(project),baseRGB=structureRGB.get(mesh.id)||[176,189,178],normals=mesh.normals?.map(n=>G.rotate(n,yaw,pitch));
      const vertexBrightness=normals?.map(n=>.32+.68*Math.max(0,G.dot(n,light))+.20*Math.pow(Math.max(0,G.dot(n,halfVector)),28));
      for(let fi=0;fi<mesh.faces.length;fi++){const face=mesh.faces[fi],a=mesh.vertices[face[0]],b=mesh.vertices[face[1]],c=mesh.vertices[face[2]],normal=G.cross(G.sub(b,a),G.sub(c,a));if(Math.hypot(...normal)<1e-9)continue;const n=G.rotate(G.normalize(normal),yaw,pitch);if(n[2]<-.05)continue;
        const style=mesh.meta?surfaceStyles[fi]:{id:mesh.id,rgb:baseRGB,emphasis:!selectedChamber||mesh.id===selectedChamber?1:.72};
        const smoothNormal=normals?G.normalize(face.reduce((sum,index)=>sum.map((v,k)=>v+normals[index][k]),[0,0,0])):n;
        let rgb=style.rgb;if(mesh.kind==='rounded'&&featureVisible()&&$('sample-rounded-overlay').value!=='graph'&&mesh.featureRegions[fi].includes(selectedFeature))rgb=rgb.map((v,k)=>v*.43+[244,163,197][k]*.57);
        const shine=mesh.kind==='rounded'?Math.pow(Math.max(0,G.dot(smoothNormal,halfVector)),28)*.21:0;
        const shade=(.32+.68*Math.max(0,G.dot(smoothNormal,light)))*style.emphasis,color=rgb.map(v=>Math.min(255,Math.round(v*shade+255*shine)));
        const points=face.map(i=>projected[i]);faces.push({id:style.id,points,depth:points.reduce((sum,p)=>sum+p[2],0)/3,color:`rgb(${color.join(',')})`,gradient:vertexBrightness?{rgb,levels:face.map(i=>vertexBrightness[i]*style.emphasis)}:null,wireframe:mesh.kind==='rounded'&&$('sample-rounded-wireframe').checked,alpha:mesh.meta||mesh.kind==='rounded'?1:selectedChamber&&selectedChamber!==mesh.id?.45:.92});
      }
    }
    faces.sort((a,b)=>a.depth-b.depth);for(const face of faces){ctx.globalAlpha=face.alpha;ctx.beginPath();face.points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();let fill=face.color;
      if(face.gradient){const [a,b,c]=face.points,[i0,i1,i2]=face.gradient.levels,dx1=b[0]-a[0],dy1=b[1]-a[1],dx2=c[0]-a[0],dy2=c[1]-a[1],det=dx1*dy2-dx2*dy1;
        if(Math.abs(det)>1e-5){const gx=((i1-i0)*dy2-(i2-i0)*dy1)/det,gy=((i2-i0)*dx1-(i1-i0)*dx2)/det,length=gx*gx+gy*gy,lo=Math.min(i0,i1,i2),hi=Math.max(i0,i1,i2);
          if(length>1e-12&&hi-lo>1e-5){const start=(lo-i0)/length,end=(hi-i0)/length,gradient=ctx.createLinearGradient(a[0]+gx*start,a[1]+gy*start,a[0]+gx*end,a[1]+gy*end);const colorAt=value=>'rgb('+face.gradient.rgb.map(v=>Math.max(0,Math.min(255,Math.round(v*value)))).join(',')+')';gradient.addColorStop(0,colorAt(lo));gradient.addColorStop(1,colorAt(hi));fill=gradient;}
        }
      }
      ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=face.wireframe?'#eaf5ed50':fill;ctx.lineWidth=face.wireframe?.35:.55;ctx.stroke();}ctx.globalAlpha=1;hitTriangles=faces;
    if($('sample-heart').checked&&(!rounded()||$('sample-xray-plane').checked)){const points=structures.get('heart').contour.map(p=>project(connected()?world(p,surfaceHeight(p)+.004):world(p,planeZ+.02)));ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.strokeStyle='#d7ead89c';ctx.lineWidth=.8;ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([]);}
    const feature=features.get(selectedFeature),featurePoints=feature.landmarks.map(id=>{const p=landmarks.get(id);return project(pointWorld(p.position,p.chamber));});
    if(featureVisible()){
      if(rounded()){
        if($('sample-rounded-overlay').value!=='graph'){
          ctx.beginPath();let pen=false;
          for(let i=0;i<feature.polygon.length;i++){const a=feature.polygon[i],b=feature.polygon[(i+1)%feature.polygon.length],steps=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/2);for(let j=0;j<=steps;j++){const p=[a[0]+(b[0]-a[0])*j/steps,a[1]+(b[1]-a[1])*j/steps],surface=roundedFrontPoint(p);if(!surface){pen=false;continue;}const q=project(surface);if(pen)ctx.lineTo(q[0],q[1]);else ctx.moveTo(q[0],q[1]);pen=true;}}
          ctx.strokeStyle='#ffd0e1';ctx.lineWidth=1.5;ctx.stroke();
        }
        if($('sample-rounded-overlay').value!=='surface'){const enabled=new Set(depthChambers().map(s=>s.id));ctx.beginPath();featurePoints.forEach((p,i)=>{const next=(i+1)%featurePoints.length;if(enabled.has(landmarks.get(feature.landmarks[i]).chamber)&&enabled.has(landmarks.get(feature.landmarks[next]).chamber)){ctx.moveTo(p[0],p[1]);ctx.lineTo(featurePoints[next][0],featurePoints[next][1]);}});ctx.setLineDash([4,3]);ctx.strokeStyle='#ffbad9';ctx.lineWidth=1.2;ctx.stroke();ctx.setLineDash([]);}
      }else{
      const edgePoints=connected()?feature.polygon.flatMap((a,i)=>{const b=feature.polygon[(i+1)%feature.polygon.length],steps=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/2);return Array.from({length:steps},(_,j)=>{const p=[a[0]+(b[0]-a[0])*j/steps,a[1]+(b[1]-a[1])*j/steps];return project(world(p,surfaceHeight(p)+.007));});}):featurePoints;
      ctx.beginPath();edgePoints.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.strokeStyle='#ffb6d4';ctx.lineWidth=1.7;if(!connected())ctx.setLineDash([4,3]);ctx.stroke();ctx.setLineDash([]);
      }
    }
    if($('sample-points').checked){
      for(const s of depthChambers())for(const point of s.landmarks){const inFeature=featureVisible()&&feature.landmarks.includes(point.id),active=point.id===selectedPoint,p=project(pointWorld(point.position,s.id,.008)),occluded=rounded()&&frontDepthAt(p[0],p[1])>p[2]+.025;
        ctx.beginPath();ctx.arc(p[0],p[1],active?4:inFeature?3:1.8,0,Math.PI*2);ctx.fillStyle=active?'#ffe48d':inFeature?'#ffd1e3':s.color;if(!occluded)ctx.fill();ctx.strokeStyle=occluded?s.color:'#1c3034';ctx.lineWidth=occluded?1.2:.7;ctx.stroke();
        if($('sample-labels').checked&&(inFeature||active||!featureVisible())){ctx.font='9px Arial';ctx.lineWidth=2.5;ctx.strokeStyle='#15292e';ctx.strokeText(point.id,p[0]+5,p[1]-5);ctx.fillStyle=active?'#ffe48d':'#f5f8ee';ctx.fillText(point.id,p[0]+5,p[1]-5);}
      }
    }
    if(!visibleChambers().length&&$('sample-vessel').value==='none'){ctx.fillStyle='#c8dbd0';ctx.font='11px Arial';ctx.textAlign='center';ctx.fillText('Chamber layers are hidden.',width/2,height/2);ctx.textAlign='start';}
    $('sample-depth-value').value=rounded()?`${depth}%`:`${depth} px`;$('sample-separation-value').value=connected()||rounded()?'Off':`${separation} px`;$('sample-depth-zoom-value').value=`${Math.round(zoom*100)}%`;$('depth-structure-count').textContent=rounded()?`${depthChambers().length} rounded chamber forms`:connected()?`Connected shell · ${visibleChambers().length} chamber patches`:`${visibleChambers().length} exploded chamber contours${$('sample-vessel').value==='none'?'':' + vessel'}`;
  }
  function render(){render2D();renderInspector();renderDepth();}
  function setStage(number){
    stage=number;chambers.forEach(s=>$('show-sample-'+s.id).checked=number>=2);$('sample-heart').checked=number>=2;$('sample-points').checked=number>=3;$('sample-labels').checked=number>=3;$('sample-spokes').checked=number===3;$('sample-feature').checked=number>=4;$('sample-vessel').value='none';heartDetail=number>1;
    $('sample-surface-mode').value='connected';$('sample-depth').value=number===5?(rounded()?80:60):0;$('sample-separation').value=0;
    yaw=number===5?-.55:0;pitch=number===5?.28:0;document.querySelectorAll('[data-sample-camera]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.sampleCamera===(number===5?'oblique':'front'))));render();
  }
  document.querySelectorAll('[data-stage]').forEach(button=>button.addEventListener('click',()=>setStage(Number(button.dataset.stage))));
  ['sample-heart','sample-opacity','sample-points','sample-labels','sample-spokes','sample-feature','sample-vessel'].forEach(id=>$(id).addEventListener('input',render));
  ['sample-depth','sample-separation','sample-depth-zoom','sample-xray-plane'].forEach(id=>$(id).addEventListener('input',renderDepth));
  $('sample-surface-mode').addEventListener('input',()=>{if(!rounded()&&!connected()&&Number($('sample-separation').value)===0)$('sample-separation').value=35;renderDepth();});
  ['sample-rounded-overlay','sample-rounded-wireframe'].forEach(id=>$(id).addEventListener('input',renderDepth));
  $('sample-rounded-solo').addEventListener('click',()=>{if(!selectedChamber){selectedChamber='LV';$('show-sample-LV').checked=true;}roundedSolo=!roundedSolo;render();});
  function selectVariant(name){
    if(name===variant)return;
    variantStates[variant]={depth:$('sample-depth').value,separation:$('sample-separation').value,zoom:$('sample-depth-zoom').value,plane:$('sample-xray-plane').checked,mode:$('sample-surface-mode').value,yaw,pitch,stage};
    variant=name;
    const state=variantStates[name]||{depth:name==='rounded'?80:60,separation:0,zoom:100,plane:name!=='rounded',mode:'connected',yaw:-.55,pitch:.28,stage:5};
    $('sample-depth').value=state.depth;$('sample-separation').value=state.separation;$('sample-depth-zoom').value=state.zoom;$('sample-xray-plane').checked=state.plane;$('sample-surface-mode').value=state.mode;yaw=state.yaw;pitch=state.pitch;stage=state.stage;
    render();
  }
  for(const name of ['connected','rounded']){
    const tab=$('sample-tab-'+name);tab.addEventListener('click',()=>selectVariant(name));
    tab.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?'connected':event.key==='End'?'rounded':name==='rounded'?'connected':'rounded';selectVariant(next);$('sample-tab-'+next).focus();});
  }
  $('sample-focus').addEventListener('click',()=>{heartDetail=!heartDetail;render2D();});
  $('sample-reset').addEventListener('click',()=>{selectedFeature='upper';selectedPoint=null;selectedChamber=null;roundedSolo=false;$('sample-rounded-overlay').value='surface';$('sample-rounded-wireframe').checked=false;$('sample-opacity').value=35;$('sample-depth-zoom').value=100;$('sample-xray-plane').checked=!rounded();$('sample-selection-note').textContent='Select a landmark or chamber to inspect its source coordinates.';setStage(5);});
  document.querySelectorAll('[data-sample-camera]').forEach(button=>button.addEventListener('click',()=>{const mode=button.dataset.sampleCamera;yaw={front:0,oblique:-.55,side:Math.PI/2}[mode];pitch=mode==='oblique'?.28:0;document.querySelectorAll('[data-sample-camera]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));renderDepth();}));
  function clearCamera(){document.querySelectorAll('[data-sample-camera]').forEach(button=>button.setAttribute('aria-pressed','false'));}
  function frontDepthAt(x,y){let depth=-Infinity;for(const face of hitTriangles){const [a,b,c]=face.points,den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(den)<1e-9)continue;const u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/den,v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/den,w=1-u-v;if(u<0||v<0||w<0)continue;const weights=[u/(8-a[2]),v/(8-b[2]),w/(8-c[2])],z=(weights[0]*a[2]+weights[1]*b[2]+weights[2]*c[2])/(weights[0]+weights[1]+weights[2]);depth=Math.max(depth,z);}return depth;}
  function hit(x,y,points){const sign=(a,b)=>(x-b[0])*(a[1]-b[1])-(a[0]-b[0])*(y-b[1]);const d=[sign(points[0],points[1]),sign(points[1],points[2]),sign(points[2],points[0])];return !(d.some(v=>v<0)&&d.some(v=>v>0));}
  canvas.addEventListener('pointerdown',event=>{if(event.button!==0)return;drag={id:event.pointerId,x:event.clientX,y:event.clientY,yaw,pitch,moved:false};canvas.setPointerCapture(event.pointerId);});
  canvas.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(Math.hypot(dx,dy)>4)drag.moved=true;yaw=drag.yaw+dx*.009;pitch=Math.max(-1.3,Math.min(1.3,drag.pitch+dy*.007));clearCamera();renderDepth();});
  canvas.addEventListener('pointerup',event=>{if(!drag||drag.id!==event.pointerId)return;const moved=drag.moved;drag=null;if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);if(!moved){const rect=canvas.getBoundingClientRect(),face=[...hitTriangles].reverse().find(f=>hit(event.clientX-rect.left,event.clientY-rect.top,f.points));if(face&&names[face.id])selectChamber(face.id);}});
  canvas.addEventListener('pointercancel',()=>{drag=null;});canvas.addEventListener('lostpointercapture',()=>{drag=null;});
  canvas.addEventListener('wheel',event=>{event.preventDefault();$('sample-depth-zoom').value=Math.max(65,Math.min(180,Number($('sample-depth-zoom').value)-Math.sign(event.deltaY)*5));renderDepth();},{passive:false});
  canvas.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','0'].includes(event.key))return;event.preventDefault();if(event.key==='ArrowLeft')yaw-=.13;if(event.key==='ArrowRight')yaw+=.13;if(event.key==='ArrowUp')pitch=Math.max(-1.3,pitch-.12);if(event.key==='ArrowDown')pitch=Math.min(1.3,pitch+.12);if(event.key==='+'||event.key==='=')$('sample-depth-zoom').value=Math.min(180,Number($('sample-depth-zoom').value)+5);if(event.key==='-')$('sample-depth-zoom').value=Math.max(65,Number($('sample-depth-zoom').value)-5);if(event.key==='0'){$('sample-depth-zoom').value=100;yaw=-.55;pitch=.28;}clearCamera();renderDepth();});
  $('sample-export').addEventListener('click',()=>{const rows=['sample,feature,landmarks,area_px2,closed_perimeter_px,source'];for(const f of S.features)rows.push([S.id,f.id,f.landmarks.join('|'),f.area,f.perimeter,'saved_model_masks_original_landmark_logic'].join(','));const url=URL.createObjectURL(new Blob([rows.join('\r\n')],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='cardiomorph-h0001-2d-features.csv';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  image.onload=renderDepth;image.onerror=()=>{$('sample-selection-note').textContent='The depth-view X-ray plane could not load. Contours and measured features are still available.';};image.src='static/interactive/sample/'+S.image;
  if(typeof ResizeObserver==='function')new ResizeObserver(renderDepth).observe(canvas.parentElement);window.addEventListener('resize',renderDepth);setStage(5);
  const selectHash=()=>{if(location.hash==='#rounded')selectVariant('rounded');if(location.hash==='#connected')selectVariant('connected');};window.addEventListener('hashchange',selectHash);selectHash();
})();
