// Original illustrative receiving geometry. A narrow surface opening leads to a
// wider pocket beneath retaining lips. This is not a tooling specification.
export function receiverGeometry(THREE) {
 function outlineTable(){const s=new THREE.Shape();s.moveTo(-600,-250);s.quadraticCurveTo(0,-350,600,-250);s.lineTo(600,250);s.quadraticCurveTo(0,350,-600,250);s.closePath();return s;}
 function outlineSide(){const s=new THREE.Shape();s.moveTo(-250,-344);s.lineTo(250,-344);s.lineTo(250,344);s.lineTo(-250,344);s.closePath();return s;}
 function aperture(u,v,direction,wide){const p=new THREE.Path();const narrow=wide?5.25:3.175;const points=[[-narrow,-11],[narrow,-11],[narrow,0],[5.25,0],[5.25,21],[-5.25,21],[-5.25,0],[-narrow,0]];points.forEach(([x,y],i)=>{const method=i?'lineTo':'moveTo';p[method](u+x*direction,v+y*direction);});p.closePath();return p;}
 function layer(outline,slots,depth,offset,wide){const shape=outline();for(const {u,v,direction} of slots)shape.holes.push(aperture(u,v,direction,wide));const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:28,steps:1});g.translate(0,0,offset);return g;}
 function merge(geometries,matrix){const result=new THREE.BufferGeometry();for(const name of ['position','normal','uv']){const arrays=geometries.map(g=>g.getAttribute(name).array);const total=arrays.reduce((n,a)=>n+a.length,0);const values=new Float32Array(total);let offset=0;for(const a of arrays){values.set(a,offset);offset+=a.length;}result.setAttribute(name,new THREE.BufferAttribute(values,name==='uv'?2:3));}result.applyMatrix4(matrix);result.computeBoundingBox();for(const g of geometries)g.dispose();return result;}
 function routed(outline,slots,thickness,matrix){return merge([layer(outline,slots,3,0,false),layer(outline,slots,3.3,3,true),layer(outline,[],thickness-6.3,6.3,true)],matrix);}
 return {
  tabletop(){const slots=[];for(const x of [-412.5,412.5])for(const z of [-180,180])slots.push({u:x,v:-z,direction:-1});const transform=new THREE.Matrix4().set(1,0,0,0, 0,0,1,-16, 0,-1,0,0, 0,0,0,1);return routed(outlineTable,slots,32,transform);},
  side(direction){const slots=[156,281].map(y=>({u:0,v:y,direction}));const transform=new THREE.Matrix4().set(0,0,direction,-direction*12.5, 0,1,0,0, -direction,0,0,0, 0,0,0,1);const g=routed(outlineSide,slots,25,transform);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/500,uv.getY(i)/688);return g;}
 };
}
