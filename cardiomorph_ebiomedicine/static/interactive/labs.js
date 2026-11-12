/* Local research demonstrations. Published panels and example geometry stay separate. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id),G=window.CardioGeometry;
  const comparisons={
    shenzhen:{label:'Shenzhen · No finding vs tuberculosis',x:108,finding:'TB shows a lateral pattern of cardiac shape differences.',explanation:'The study describes lateral differences in both TB cohorts. Use the displacement panel to inspect the direction of the published group-level deformation.'},
    tbx11k:{label:'TBX11K · No finding vs tuberculosis',x:598,finding:'Inspect the TB pattern in a second cohort.',explanation:'This is the published TBX11K comparison. The map and vector panels retain their original reference images, rather than being superimposed on a new scan.'},
    pneumonia:{label:'MIMIC · No finding vs pneumonia',x:1095,finding:'Compare the pneumonia pattern with the TB cohorts.',explanation:'The project describes smaller, less directionally consistent displacements for pneumonia than for TB. The published panel is shown without recomputing the analysis.'},
    pneumothorax:{label:'MIMIC · No finding vs pneumothorax',x:1605,finding:'Explore the pneumothorax comparison.',explanation:'Inspect the original difference map and vector panel together. These group comparisons are not diagnostic predictions for the displayed reference image.'},
    atelectasis:{label:'MIMIC · No finding vs atelectasis',x:2110,finding:'Explore the atelectasis comparison.',explanation:'The project contrasts the displacement pattern of atelectasis with the diffuse lateral pattern in TB. Use the controls to focus on either published panel.'},
    cardiomegaly:{label:'MIMIC · No finding vs cardiomegaly',x:2625,finding:'Cardiomegaly has a different directional pattern.',explanation:'The project describes displacement toward the left-ventricular apex in cardiomegaly, compared with the more diffuse lateral pattern in TB.'}
  };
  function renderAtlas(){
    const entry=comparisons[$('atlas-comparison').value],zoom=Number($('atlas-zoom').value)/100;
    $('atlas-title').textContent=entry.label;$('atlas-finding').textContent=entry.finding;$('atlas-explanation').textContent=entry.explanation;
    for(const [view,y,label] of [['atlas-map-view',352,'difference atlas'],['atlas-vector-view',836,'displacement field']]){
      const width=460/zoom,height=430/zoom;
      $(view).setAttribute('viewBox',`${entry.x+(460-width)/2} ${y+(430-height)/2} ${width} ${height}`);
      $(view).setAttribute('aria-label',`${entry.label}, published ${label} panel`);
    }
    $('atlas-map-card').hidden=!$('atlas-show-map').checked;
    $('atlas-vector-card').hidden=!$('atlas-show-vectors').checked;
    $('atlas-empty').hidden=$('atlas-show-map').checked||$('atlas-show-vectors').checked;
    $('atlas-zoom-value').value=`${Math.round(zoom*100)}%`;
  }
  ['atlas-comparison','atlas-show-map','atlas-show-vectors','atlas-zoom'].forEach(id=>$(id).addEventListener('input',renderAtlas));
  $('atlas-reset').addEventListener('click',()=>{$('atlas-comparison').value='shenzhen';$('atlas-show-map').checked=true;$('atlas-show-vectors').checked=true;$('atlas-zoom').value=100;renderAtlas();});
  renderAtlas();

  const svgNS='http://www.w3.org/2000/svg',regionNames={whole:'Whole contour',upper:'Upper',left:'Left',inferior:'Inferior',right:'Right'};
  const regionColors={upper:'#e5c28a',left:'#a4cbb1',inferior:'#b6b5d4',right:'#91bccc'};
  const pvalues={area:{shenzhen:{upper:'0.249',left:'<0.001',inferior:'0.841',right:'<0.001'},tbx11k:{upper:'<0.001',left:'<0.001',inferior:'<0.001',right:'<0.001'}},perimeter:{shenzhen:{upper:'0.37',left:'<0.001',inferior:'<0.001',right:'0.019'},tbx11k:{upper:'0.352',left:'<0.001',inferior:'<0.001',right:'<0.001'}}};
  let selectedRegion='left';
  const pathFor=points=>points.map((p,i)=>`${i?'L':'M'}${(200+p[0]*115).toFixed(2)} ${(190+p[1]*115).toFixed(2)}`).join(' ')+' Z';
  function measurements(key,metric,expansion){const measure=metric==='area'?G.polygonArea:G.polygonPerimeter;return [measure(G.regionPolygon(G.exampleContour(0),key)),measure(G.regionPolygon(G.exampleContour(expansion),key))];}
  function selectMorphRegion(key){selectedRegion=key;renderMorph();}
  function renderMorph(){
    const expansion=Number($('morph-expansion').value)/100,metric=$('morph-metric').value,unit=metric==='area'?'u²':'u';
    const reference=G.exampleContour(0),expanded=G.exampleContour(expansion);
    $('morph-expansion-value').value=`${Math.round(expansion*100)}%`;
    $('morph-reference').setAttribute('d',pathFor(reference));$('morph-expanded').setAttribute('d',pathFor(expanded));
    const paths=Object.entries(regionColors).map(([key,color])=>{
      const path=document.createElementNS(svgNS,'path');path.setAttribute('d',pathFor(G.regionPolygon(expanded,key)));path.setAttribute('fill',color);path.setAttribute('fill-opacity',selectedRegion===key||selectedRegion==='whole'?'.85':'.32');path.classList.add('morph-region-shape');path.setAttribute('role','button');path.setAttribute('tabindex','0');path.setAttribute('aria-label',`Select ${regionNames[key].toLowerCase()} example region`);path.setAttribute('aria-pressed',String(selectedRegion===key));
      path.addEventListener('click',()=>selectMorphRegion(key));
      path.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectMorphRegion(key);requestAnimationFrame(()=>document.querySelector(`#morph-region-paths [aria-label="Select ${regionNames[key].toLowerCase()} example region"]`)?.focus());}});
      return path;
    });
    $('morph-region-paths').replaceChildren(...paths);
    document.querySelectorAll('[data-morph-region]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.morphRegion===selectedRegion)));
    const values=measurements(selectedRegion,metric,expansion),change=(values[1]/values[0]-1)*100,max=Math.max(...values)*1.13;
    $('morph-chart-title').textContent=`${regionNames[selectedRegion]} · ${metric==='area'?'area':'boundary length'}`;
    $('morph-change').textContent=`${change>=0?'+':''}${change.toFixed(1)}%`;
    $('morph-bars').replaceChildren(...values.map((value,index)=>{
      const row=document.createElement('div');row.className='metric-bar';const label=document.createElement('div'),name=document.createElement('span'),number=document.createElement('strong');name.textContent=index?'Expanded demo':'Reference demo';number.textContent=`${value.toFixed(3)} ${unit}`;label.append(name,number);
      const track=document.createElement('div'),bar=document.createElement('span');track.className='bar-track';bar.style.width=`${value/max*100}%`;bar.style.background=index?'#d17d5c':'#315f61';track.append(bar);row.append(label,track);return row;
    }));
    $('morph-measurement-note').textContent=metric==='area'?'Area calculated from generated polygons in normalized square units (u²).':'Boundary length includes the artificial partition edges, in normalized units (u).';
    const p=pvalues[metric][$('morph-cohort').value][selectedRegion];
    $('morph-pvalue').textContent=p||'—';$('morph-p-label').textContent=p?`Published ${metric} p-value · ${regionNames[selectedRegion].toLowerCase()}`:'No whole-contour entry in the source table';
  }
  document.querySelectorAll('[data-morph-region]').forEach(button=>button.addEventListener('click',()=>selectMorphRegion(button.dataset.morphRegion)));
  ['morph-expansion','morph-metric','morph-cohort'].forEach(id=>$(id).addEventListener('input',renderMorph));
  $('morph-reset').addEventListener('click',()=>{selectedRegion='left';$('morph-expansion').value=15;$('morph-metric').value='area';$('morph-cohort').value='shenzhen';renderMorph();});
  $('morph-export').addEventListener('click',()=>{
    const expansion=Number($('morph-expansion').value)/100;
    const rows=['source,region,metric,reference_demo,expanded_demo,units,expansion_percent'];
    for(const key of Object.keys(regionNames))for(const metric of ['area','perimeter']){const values=measurements(key,metric,expansion);rows.push(['GENERATED_DEMO_NOT_PATIENT_DATA',key,metric,...values.map(value=>value.toFixed(6)),metric==='area'?'u^2':'u',Math.round(expansion*100)].join(','));}
    const url=URL.createObjectURL(new Blob([rows.join('\r\n')],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='cardiomorph-generated-demo-measurements.csv';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  renderMorph();

  // Software rendering of genuine 3D triangle meshes keeps this demo dependency-free.
  const meshes=G.heartMeshes(),canvas=$('heart-canvas'),context=canvas.getContext('2d');
  const visible=new Set(meshes.map(mesh=>mesh.id));
  let selected='lv',yaw=-.28,pitch=.10,drag=null,hitFaces=[],spin=false,lastFrame=0,frame=0;
  const hexRGB=hex=>hex.slice(1).match(/../g).map(x=>parseInt(x,16));
  const light=G.normalize([-.5,.8,1.3]);
  function updateHeartInspector(){
    const mesh=meshes.find(item=>item.id===selected);
    $('heart-selected-name').textContent=mesh.name;$('heart-selected-description').textContent=mesh.description;
    $('heart-area').textContent=`${mesh.stats.area.toFixed(3)} u²`;$('heart-volume').textContent=`${mesh.stats.volume.toFixed(3)} u³`;$('heart-triangles').textContent=mesh.stats.triangles.toLocaleString();
    document.querySelectorAll('.structure-row').forEach(row=>{row.classList.toggle('selected',row.dataset.structure===selected);row.querySelector('button').setAttribute('aria-pressed',String(row.dataset.structure===selected));row.querySelector('input').checked=visible.has(row.dataset.structure);});
    $('heart-isolate').textContent=`Isolate ${mesh.name.toLowerCase()}`;
  }
  function selectStructure(id){selected=id;visible.add(id);updateHeartInspector();renderHeart();}
  $('heart-structures').replaceChildren(...meshes.map(mesh=>{
    const row=document.createElement('div');row.className='structure-row';row.dataset.structure=mesh.id;
    const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=true;checkbox.setAttribute('aria-label',`Show ${mesh.name.toLowerCase()}`);checkbox.addEventListener('input',()=>{if(checkbox.checked)visible.add(mesh.id);else visible.delete(mesh.id);renderHeart();});
    const button=document.createElement('button'),swatch=document.createElement('span');swatch.className='swatch';swatch.style.background=mesh.color;button.append(swatch,document.createTextNode(mesh.name));button.addEventListener('click',()=>selectStructure(mesh.id));row.append(checkbox,button);return row;
  }));
  function renderHeart(){
    if(!context||$('panel-heart3d').hidden)return;
    const width=canvas.clientWidth,height=canvas.clientHeight;if(width<1||height<1)return;
    const dpr=Math.min(window.devicePixelRatio||1,2),pixelWidth=Math.round(width*dpr),pixelHeight=Math.round(height*dpr);
    if(canvas.width!==pixelWidth||canvas.height!==pixelHeight){canvas.width=pixelWidth;canvas.height=pixelHeight;}
    context.setTransform(dpr,0,0,dpr,0,0);context.clearRect(0,0,width,height);
    const zoom=Number($('heart-zoom').value)/100,explode=Number($('heart-explode').value)/100,scale=Math.min(width/4.4,height/4.4)*zoom;
    context.save();context.translate(width/2,height*.87);context.scale(1,.22);const glow=context.createRadialGradient(0,0,0,0,0,width*.32);glow.addColorStop(0,'#6ba39835');glow.addColorStop(1,'#6ba39800');context.fillStyle=glow;context.beginPath();context.arc(0,0,width*.32,0,Math.PI*2);context.fill();context.strokeStyle='#7eb0a022';context.lineWidth=1;for(let r=35;r<width*.36;r+=30){context.beginPath();context.arc(0,0,r,0,Math.PI*2);context.stroke();}context.restore();
    const faces=[];
    for(const mesh of meshes){
      if(!visible.has(mesh.id))continue;
      const offset=mesh.center.map(value=>value*explode*.9);
      const points=mesh.vertices.map(vertex=>{const rotated=G.rotate(vertex.map((value,i)=>value+offset[i]),yaw,pitch),perspective=6/(6-rotated[2]);return [width/2+rotated[0]*scale*perspective,height/2+20-rotated[1]*scale*perspective,rotated[2]];});
      const normals=mesh.normals.map(normal=>G.rotate(normal,yaw,pitch)),rgb=hexRGB(mesh.color);
      for(const face of mesh.faces){const p=face.map(i=>points[i]);const normal=G.normalize(face.reduce((sum,index)=>sum.map((value,i)=>value+normals[index][i]),[0,0,0]));if(normal[2]<-.12)continue;
        const diffuse=Math.max(0,G.dot(normal,light)),specular=Math.pow(Math.max(0,G.dot(normal,G.normalize([-.25,.4,1.7]))),20)*.19;
        const shade=.34+.66*diffuse;
        const color=rgb.map(value=>Math.min(255,Math.round(value*shade+255*specular)));
        faces.push({points:p,depth:(p[0][2]+p[1][2]+p[2][2])/3,id:mesh.id,color:`rgb(${color.join(',')})`,selected:mesh.id===selected});
      }
    }
    faces.sort((a,b)=>a.depth-b.depth);
    const wireframe=$('heart-wireframe').checked;
    for(const face of faces){const p=face.points;context.beginPath();context.moveTo(p[0][0],p[0][1]);context.lineTo(p[1][0],p[1][1]);context.lineTo(p[2][0],p[2][1]);context.closePath();context.fillStyle=face.color;context.fill();context.strokeStyle=wireframe?(face.selected?'#fff3d04d':'#102a2c55'):face.color;context.lineWidth=wireframe?.45:.55;context.stroke();}
    hitFaces=faces;
    if(!faces.length){context.fillStyle='#c8dbd0';context.font='13px Arial';context.textAlign='center';context.fillText('All structures are hidden. Choose Show all structures.',width/2,height/2);}
    $('heart-zoom-value').value=`${Math.round(zoom*100)}%`;$('heart-explode-value').value=`${Math.round(explode*100)}%`;
    const count=meshes.filter(mesh=>visible.has(mesh.id)).reduce((sum,mesh)=>sum+mesh.faces.length,0);
    $('heart-mesh-count').textContent=`${visible.size} ${visible.size===1?'structure':'structures'} · ${count.toLocaleString()} triangles`;
  }
  function containsPoint(x,y,points){const sign=(a,b)=>(x-b[0])*(a[1]-b[1])-(a[0]-b[0])*(y-b[1]);const d=[sign(points[0],points[1]),sign(points[1],points[2]),sign(points[2],points[0])];return !(d.some(v=>v<0)&&d.some(v=>v>0));}
  function clearPreset(){document.querySelectorAll('[data-heart-view]').forEach(button=>button.setAttribute('aria-pressed','false'));}
  canvas.addEventListener('pointerdown',event=>{if(event.button!==0)return;drag={id:event.pointerId,x:event.clientX,y:event.clientY,yaw,pitch,moved:false};canvas.setPointerCapture(event.pointerId);});
  canvas.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(Math.hypot(dx,dy)>4)drag.moved=true;yaw=drag.yaw+dx*.009;pitch=Math.max(-1.3,Math.min(1.3,drag.pitch+dy*.007));clearPreset();renderHeart();});
  canvas.addEventListener('pointerup',event=>{if(!drag||event.pointerId!==drag.id)return;const moved=drag.moved;drag=null;if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);if(!moved){const rect=canvas.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;const face=[...hitFaces].reverse().find(face=>containsPoint(x,y,face.points));if(face)selectStructure(face.id);}});
  canvas.addEventListener('pointercancel',()=>{drag=null;});canvas.addEventListener('lostpointercapture',()=>{drag=null;});
  canvas.addEventListener('wheel',event=>{event.preventDefault();$('heart-zoom').value=Math.max(65,Math.min(165,Number($('heart-zoom').value)-Math.sign(event.deltaY)*5));renderHeart();},{passive:false});
  canvas.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','0'].includes(event.key))return;event.preventDefault();if(event.key==='ArrowLeft')yaw-=.14;if(event.key==='ArrowRight')yaw+=.14;if(event.key==='ArrowUp')pitch=Math.max(-1.3,pitch-.12);if(event.key==='ArrowDown')pitch=Math.min(1.3,pitch+.12);if(event.key==='+'||event.key==='=')$('heart-zoom').value=Math.min(165,Number($('heart-zoom').value)+5);if(event.key==='-')$('heart-zoom').value=Math.max(65,Number($('heart-zoom').value)-5);if(event.key==='0')resetHeart();clearPreset();renderHeart();});
  ['heart-zoom','heart-explode','heart-wireframe'].forEach(id=>$(id).addEventListener('input',renderHeart));
  $('heart-isolate').addEventListener('click',()=>{visible.clear();visible.add(selected);updateHeartInspector();renderHeart();});
  $('heart-show-all').addEventListener('click',()=>{meshes.forEach(mesh=>visible.add(mesh.id));updateHeartInspector();renderHeart();});
  document.querySelectorAll('[data-heart-view]').forEach(button=>button.addEventListener('click',()=>{yaw={front:0,side:Math.PI/2,back:Math.PI}[button.dataset.heartView];pitch=.1;clearPreset();button.setAttribute('aria-pressed','true');renderHeart();}));
  function stopSpin(){spin=false;cancelAnimationFrame(frame);$('heart-spin').setAttribute('aria-pressed','false');$('heart-spin').textContent='↻ Auto-rotate';}
  function animate(time){if(!spin)return;if(!document.hidden&&!$('panel-heart3d').hidden&&time-lastFrame>40){if(!drag)yaw+=.012;renderHeart();lastFrame=time;}frame=requestAnimationFrame(animate);}
  $('heart-spin').addEventListener('click',()=>{if(spin){stopSpin();return;}spin=true;$('heart-spin').setAttribute('aria-pressed','true');$('heart-spin').textContent='Ⅱ Pause rotation';clearPreset();frame=requestAnimationFrame(animate);});
  function resetHeart(){stopSpin();yaw=-.28;pitch=.1;$('heart-zoom').value=100;$('heart-explode').value=0;$('heart-wireframe').checked=false;selected='lv';meshes.forEach(mesh=>visible.add(mesh.id));clearPreset();updateHeartInspector();renderHeart();}
  $('heart-reset').addEventListener('click',resetHeart);
  document.querySelectorAll('[role="tab"]').forEach(tab=>tab.addEventListener('click',()=>{if(tab.id!=='tab-heart3d')stopSpin();requestAnimationFrame(renderHeart);}));
  if(typeof ResizeObserver==='function')new ResizeObserver(renderHeart).observe(canvas.parentElement);
  const observer=new MutationObserver(()=>{if($('panel-heart3d').hidden)stopSpin();else requestAnimationFrame(renderHeart);});observer.observe($('panel-heart3d'),{attributes:true,attributeFilter:['hidden']});
  window.addEventListener('resize',renderHeart);
  updateHeartInspector();renderHeart();

  // Shareable local entry points, e.g. interactive.html#heart3d.
  const hashTabs={atlas:'tab-atlas',morphometry:'tab-morphometry',heart3d:'tab-heart3d',figures:'tab-figures',overlay:'tab-overlay'};
  function selectHash(){const id=hashTabs[location.hash.slice(1)];if(id)$(id).click();}
  window.addEventListener('hashchange',selectHash);selectHash();
})();
