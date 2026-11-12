(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.SampleGeometry=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function signedArea(points){return points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p[0]*q[1]-q[0]*p[1];},0)/2;}
  function orient(a,b,c){return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);}
  function triangulate(points){
    const remaining=points.map((_,i)=>i);if(signedArea(points)<0)remaining.reverse();
    const faces=[];let guard=points.length*points.length;
    while(remaining.length>3&&guard-->0){let found=false;for(let i=0;i<remaining.length;i++){
      const a=remaining[(i+remaining.length-1)%remaining.length],b=remaining[i],c=remaining[(i+1)%remaining.length];
      if(orient(points[a],points[b],points[c])<1e-8)continue;
      const blocked=remaining.some(index=>index!==a&&index!==b&&index!==c&&orient(points[a],points[b],points[index])>=-1e-8&&orient(points[b],points[c],points[index])>=-1e-8&&orient(points[c],points[a],points[index])>=-1e-8);
      if(blocked)continue;faces.push([a,b,c]);remaining.splice(i,1);found=true;break;
    }if(!found)throw new Error('Contour cannot be triangulated without crossing its boundary.');}
    if(remaining.length===3)faces.push([...remaining]);return faces;
  }
  function extrude(points,depth=0,offset=0){
    const ring=signedArea(points)<0?[...points].reverse():[...points];const n=ring.length,cap=triangulate(ring);
    const vertices=[...ring.map(([x,y])=>[x,y,offset+depth/2]),...ring.map(([x,y])=>[x,y,offset-depth/2])];
    const faces=[...cap,...cap.map(([a,b,c])=>[c+n,b+n,a+n])];
    for(let i=0;i<n;i++){const j=(i+1)%n;faces.push([i,n+i,j],[j,n+i,n+j]);}
    return {vertices,faces,ring};
  }
  function contains(point,polygon){
    const [x,y]=point;let inside=false;
    for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
      const a=polygon[i],b=polygon[j];
      if(((a[1]>y)!==(b[1]>y))&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
    }
    return inside;
  }
  // A single welded pillow-shaped shell over the union of the saved silhouettes.
  // The grid supplies a shared continuous height field; it does not infer anatomy.
  function connectedSurface(contours,step=3){
    const all=contours.flat(),minX=Math.floor(Math.min(...all.map(p=>p[0]))/step)*step-step,minY=Math.floor(Math.min(...all.map(p=>p[1]))/step)*step-step;
    const cols=Math.ceil((Math.max(...all.map(p=>p[0]))-minX)/step)+1,rows=Math.ceil((Math.max(...all.map(p=>p[1]))-minY)/step)+1;
    const cells=new Set();
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(contours.some(poly=>contains([minX+(x+.5)*step,minY+(y+.5)*step],poly)))cells.add(y*cols+x);
    // Discard any isolated raster islands so the display has exactly one body.
    let largest=[];const unseen=new Set(cells);
    while(unseen.size){const first=unseen.values().next().value,component=[first];unseen.delete(first);for(let i=0;i<component.length;i++){const c=component[i],x=c%cols,y=Math.floor(c/cols);for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){const nx=x+dx,ny=y+dy,n=ny*cols+nx;if(nx>=0&&nx<cols&&ny>=0&&ny<rows&&unseen.delete(n))component.push(n);}}if(component.length>largest.length)largest=component;}
    const points=[],lookup=new Map(),frontFaces=[],edgeCounts=new Map();
    function index(x,y){const key=y*(cols+1)+x;if(!lookup.has(key)){lookup.set(key,points.length);points.push([minX+x*step,minY+y*step]);}return lookup.get(key);}
    for(const c of largest){const x=c%cols,y=Math.floor(c/cols),a=index(x,y),b=index(x+1,y),d=index(x,y+1),e=index(x+1,y+1);frontFaces.push([a,e,b],[a,d,e]);}
    for(const f of frontFaces)for(let i=0;i<3;i++){const a=f[i],b=f[(i+1)%3],key=a<b?`${a}:${b}`:`${b}:${a}`;edgeCounts.set(key,(edgeCounts.get(key)||0)+1);}
    const boundaryEdges=[...edgeCounts].filter(([,count])=>count===1).map(([key])=>key.split(':').map(Number)),boundary=new Set(boundaryEdges.flat());
    function segmentDistance(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);}
    const distances=points.map((p,i)=>boundary.has(i)?0:Math.min(...boundaryEdges.map(([a,b])=>segmentDistance(p,points[a],points[b]))));
    // A small shared rim avoids collapsed double faces along thin grid corners.
    const maximum=Math.max(...distances)||1,weights=distances.map(d=>.06+.94*Math.sqrt(d/maximum));
    const vertices=points.map((p,i)=>[...p,weights[i]]),back=points.map((p,i)=>{vertices.push([...p,-weights[i]]);return vertices.length-1;});
    const faces=[...frontFaces,...frontFaces.map(([a,b,c])=>[back[c],back[b],back[a]])];
    for(const f of frontFaces)for(let i=0;i<3;i++){const a=f[i],b=f[(i+1)%3],key=a<b?`${a}:${b}`:`${b}:${a}`;if(edgeCounts.get(key)===1)faces.push([a,back[a],b],[b,back[a],back[b]]);}
    function heightAt(x,y){const gx=(x-minX)/step,gy=(y-minY)/step,ix=Math.floor(gx),iy=Math.floor(gy),u=gx-ix,v=gy-iy;const weight=(dx,dy)=>{const id=lookup.get((iy+dy)*(cols+1)+ix+dx);return id===undefined?0:weights[id];};return u>=v?weight(0,0)*(1-u)+weight(1,0)*(u-v)+weight(1,1)*v:weight(0,0)*(1-v)+weight(0,1)*(v-u)+weight(1,1)*u;}
    return {vertices,faces,heightAt,step,points,frontFaces,boundaryVertexCount:boundary.size};
  }
  // Homothetic contour rings form a closed, rounded chamber rather than a slab.
  // The equatorial ring retains the saved outline; front/back depths are assumed.
  function roundedChamber(contour,centroid,latitudes=20){
    const ring=signedArea(contour)>0?[...contour].reverse():[...contour],n=ring.length;
    const radiusX=Math.max(...ring.map(p=>Math.abs(p[0]-centroid[0]))),radiusY=Math.max(...ring.map(p=>Math.abs(p[1]-centroid[1])));
    const vertices=[[centroid[0],centroid[1],-1]],faces=[];
    for(let j=1;j<latitudes;j++){
      const angle=-Math.PI/2+j*Math.PI/latitudes,radius=Math.cos(angle),z=Math.sin(angle);
      for(const p of ring){const dx=p[0]-centroid[0],dy=p[1]-centroid[1],ellipseScale=1/Math.sqrt(dx*dx/(radiusX*radiusX)+dy*dy/(radiusY*radiusY)),blend=Math.pow(Math.abs(z),1.3),scale=Math.min(1,radius*(1-blend+blend*ellipseScale));vertices.push([centroid[0]+dx*scale,centroid[1]+dy*scale,z]);}
    }
    const top=vertices.length;vertices.push([centroid[0],centroid[1],1]);
    for(let i=0;i<n;i++){const next=(i+1)%n;faces.push([0,1+next,1+i]);}
    for(let j=0;j<latitudes-2;j++)for(let i=0;i<n;i++){
      const next=(i+1)%n,a=1+j*n+i,b=1+j*n+next,c=a+n,d=b+n;faces.push([a,b,c],[b,d,c]);
    }
    const last=1+(latitudes-2)*n;for(let i=0;i<n;i++)faces.push([last+i,last+(i+1)%n,top]);
    // Spatial bins support exact front-triangle interpolation for source points.
    const bins=new Map(),binSize=12;
    for(const face of faces){if(face.some(i=>vertices[i][2]<-1e-8))continue;
      const p=face.map(i=>vertices[i]),minX=Math.floor(Math.min(...p.map(v=>v[0]))/binSize),maxX=Math.floor(Math.max(...p.map(v=>v[0]))/binSize),minY=Math.floor(Math.min(...p.map(v=>v[1]))/binSize),maxY=Math.floor(Math.max(...p.map(v=>v[1]))/binSize);
      for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){const key=x+':'+y;if(!bins.has(key))bins.set(key,[]);bins.get(key).push(face);}
    }
    function surfaceAt(x,y){let best=null;for(const face of bins.get(Math.floor(x/binSize)+':'+Math.floor(y/binSize))||[]){
      const [a,b,c]=face.map(i=>vertices[i]),den=orient(a,b,c);if(Math.abs(den)<1e-10)continue;
      const p=[x,y],u=orient(p,b,c)/den,v=orient(a,p,c)/den,w=1-u-v;if(u< -1e-7||v< -1e-7||w< -1e-7)continue;
      const z=a[2]*u+b[2]*v+c[2]*w;if(best===null||z>best)best=z;
    }return best;}
    return {vertices,faces,surfaceAt,centroid,ring,latitudes};
  }
  function vertexNormals(vertices,faces,ringSize=0){
    const normals=vertices.map(()=>[0,0,0]);
    for(const [a,b,c] of faces){const p=vertices[a],q=vertices[b],r=vertices[c],u=q.map((v,i)=>v-p[i]),v=r.map((v,i)=>v-p[i]),normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];for(const index of [a,b,c])for(let k=0;k<3;k++)normals[index][k]+=normal[k];}
    let result=normals.map(normal=>{const length=Math.hypot(...normal)||1;return normal.map(v=>v/length);});
    if(ringSize){const rings=(vertices.length-2)/ringSize;for(let pass=0;pass<3;pass++){const next=result.map(n=>[...n]);for(let j=0;j<rings;j++)for(let i=0;i<ringSize;i++){const index=1+j*ringSize+i,neighbors=[1+j*ringSize+(i+ringSize-1)%ringSize,1+j*ringSize+(i+1)%ringSize,j?index-ringSize:0,j<rings-1?index+ringSize:vertices.length-1],n=result[index].map((v,k)=>v*.5+neighbors.reduce((sum,id)=>sum+result[id][k],0)*.125),length=Math.hypot(...n)||1;next[index]=n.map(v=>v/length);}result=next;}}
    return result;
  }
  return {signedArea,triangulate,extrude,contains,connectedSurface,roundedChamber,vertexNormals};
});
