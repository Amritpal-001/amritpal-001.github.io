/* Geometry only: normalized example contours and schematic 3D surfaces. */
(function(root,factory){
  if(typeof module === 'object' && module.exports) module.exports = factory();
  else root.CardioGeometry = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this,function(){
  'use strict';
  function polygonArea(points) {
    return Math.abs(points.reduce((sum,p,i) => { const q=points[(i+1)%points.length]; return sum+p[0]*q[1]-q[0]*p[1]; },0))/2;
  }
  function polygonPerimeter(points) {
    return points.reduce((sum,p,i) => { const q=points[(i+1)%points.length]; return sum+Math.hypot(p[0]-q[0],p[1]-q[1]); },0);
  }
  function clipPolygon(points,a,b,c) {
    const out=[];
    for(let i=0;i<points.length;i++) {
      const p=points[i],q=points[(i+1)%points.length],dp=a*p[0]+b*p[1]+c,dq=a*q[0]+b*q[1]+c;
      if(dp>=-1e-10) out.push(p);
      if((dp>=0)!==(dq>=0)) { const t=dp/(dp-dq);out.push([p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])]); }
    }
    return out;
  }
  const regionPlanes={upper:[[1,-1,0],[-1,-1,0]],left:[[1,-1,0],[1,1,0]],inferior:[[1,1,0],[-1,1,0]],right:[[-1,-1,0],[-1,1,0]]};
  function regionPolygon(points,key) { return (regionPlanes[key]||[]).reduce((poly,plane)=>clipPolygon(poly,...plane),points); }
  function exampleContour(expansion=0) {
    return Array.from({length:160},(_,i)=>{
      const t=i*Math.PI*2/160;
      const x=(.82*Math.cos(t)+.12*Math.sin(2*t)+.08)*(1+expansion);
      const y=1.04*Math.sin(t)+.07*Math.cos(2*t);
      return [x,y];
    });
  }
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const sub=(a,b)=>a.map((v,i)=>v-b[i]);
  function normalize(v){const n=Math.hypot(...v)||1;return v.map(x=>x/n);}
  function rotate(p,yaw,pitch){const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);const x=p[0]*cy+p[2]*sy,z=-p[0]*sy+p[2]*cy;return [x,p[1]*cp-z*sp,p[1]*sp+z*cp];}
  function meshStats(mesh){let area=0,volume=0;for(const f of mesh.faces){const [a,b,c]=f.map(i=>mesh.vertices[i]);area+=Math.hypot(...cross(sub(b,a),sub(c,a)))/2;volume+=dot(a,cross(b,c))/6;}return {area,volume:Math.abs(volume),triangles:mesh.faces.length};}
  function ellipsoid({center=[0,0,0],radii=[1,1,1],tilt=0,taper=0,lat=20,lon=32}={}){
    const vertices=[],normals=[],faces=[];
    for(let j=0;j<=lat;j++)for(let i=0;i<=lon;i++){
      const t=j*Math.PI/lat,p=i*Math.PI*2/lon,sy=Math.cos(t),taperScale=1-taper*Math.max(0,-sy);
      const x=Math.sin(t)*Math.cos(p)*radii[0]*taperScale,y=sy*radii[1],z=Math.sin(t)*Math.sin(p)*radii[2]*taperScale;
      const ct=Math.cos(tilt),st=Math.sin(tilt);
      vertices.push([x*ct-y*st+center[0],x*st+y*ct+center[1],z+center[2]]);
      const n=normalize([Math.sin(t)*Math.cos(p)/radii[0],sy/radii[1],Math.sin(t)*Math.sin(p)/radii[2]]);
      normals.push([n[0]*ct-n[1]*st,n[0]*st+n[1]*ct,n[2]]);
    }
    for(let j=0;j<lat;j++)for(let i=0;i<lon;i++){
      const a=j*(lon+1)+i,b=a+1,c=a+lon+1,d=c+1;
      if(j>0)faces.push([a,c,b]);if(j<lat-1)faces.push([b,c,d]);
    }
    return {vertices,normals,faces,center};
  }
  function tube(path,radius=.13,sides=14){
    const vertices=[],normals=[],faces=[];
    path.forEach((p,j)=>{
      const tangent=normalize(sub(path[Math.min(j+1,path.length-1)],path[Math.max(0,j-1)]));
      const ref=Math.abs(tangent[2])<.9?[0,0,1]:[1,0,0];const u=normalize(cross(tangent,ref)),v=cross(tangent,u);
      for(let i=0;i<sides;i++){const t=i*Math.PI*2/sides;const n=u.map((x,k)=>x*Math.cos(t)+v[k]*Math.sin(t));vertices.push(p.map((x,k)=>x+radius*n[k]));normals.push(n);}
    });
    for(let j=0;j<path.length-1;j++)for(let i=0;i<sides;i++){const a=j*sides+i,b=j*sides+(i+1)%sides,c=(j+1)*sides+i,d=(j+1)*sides+(i+1)%sides;faces.push([a,b,c],[b,d,c]);}
    // Cap both ends so enclosed volume is defined for the demonstration mesh.
    const first=vertices.length;vertices.push(path[0]);normals.push(normalize(sub(path[0],path[1])));
    const last=vertices.length;vertices.push(path[path.length-1]);normals.push(normalize(sub(path[path.length-1],path[path.length-2])));
    for(let i=0;i<sides;i++){faces.push([first,(i+1)%sides,i]);const a=(path.length-1)*sides;faces.push([last,a+i,a+(i+1)%sides]);}
    return {vertices,normals,faces,center:path[Math.floor(path.length/2)]};
  }
  function heartMeshes(){
    const definitions=[
      {id:'lv',name:'Left ventricle',color:'#cf7b68',description:'A tapered parametric surface representing the left ventricle. Its size and shape are illustrative.',center:[.34,-.35,-.05],radii:[.63,.98,.58],tilt:.25,taper:.28},
      {id:'rv',name:'Right ventricle',color:'#d9ad78',description:'A simplified anterior chamber surface. This is a schematic lobe rather than an anatomical ventricular wall.',center:[-.30,-.25,.37],radii:[.61,.84,.40],tilt:-.30,taper:.20},
      {id:'la',name:'Left atrium',color:'#88b5a0',description:'A rounded schematic atrial surface positioned behind the ventricular surfaces.',center:[.43,.65,-.16],radii:[.44,.43,.43],tilt:.1},
      {id:'ra',name:'Right atrium',color:'#8daac5',description:'A rounded schematic surface representing the right atrium.',center:[-.53,.58,.04],radii:[.42,.49,.42],tilt:-.2}
    ];
    const meshes=definitions.map(d=>({...d,...ellipsoid(d)}));
    const arc=Array.from({length:27},(_,i)=>{const t=i/26*Math.PI;return [.12+.45*(1-Math.cos(t)),.82+.81*Math.sin(t),-.16-.22*i/26];});
    const vena=Array.from({length:14},(_,i)=>[-.55+.05*Math.sin(i/13*Math.PI),.72+i/13*.87,.02]);
    const pulmonary=Array.from({length:16},(_,i)=>[-.12-i/15*.59,.35+i/15*.99,.37-.25*i/15]);
    meshes.push({id:'aorta',name:'Aorta',color:'#b95f58',description:'A capped curved tube illustrating a great vessel. The centreline and diameter are generated.',...tube(arc,.145)}, {id:'pulmonary',name:'Pulmonary trunk',color:'#73a9ad',description:'A simplified generated vessel, shown for spatial context.',...tube(pulmonary,.14)}, {id:'vena',name:'Vena cava',color:'#7a96b5',description:'A simplified generated tube representing the superior vena cava.',...tube(vena,.125)});
    return meshes.map(mesh=>({...mesh,stats:meshStats(mesh)}));
  }
  return {polygonArea,polygonPerimeter,clipPolygon,regionPolygon,exampleContour,cross,dot,sub,normalize,rotate,meshStats,ellipsoid,tube,heartMeshes};
});
