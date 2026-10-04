
// Each mount begins at its panel's inner face. The short stem penetrates
// that face by 2 mm; the wider head stays attached as the panel moves.
// Geometry is illustrative, not a manufacturing specification.
export function attachChannelLockTabs({THREE,panels,addMesh,material}) {
 const mounts=[];
 for(const y of [-.25,.05,.34]) {
  mounts.push({panel:panels.backL,position:[-.424,y,-.416],normal:[1,0,0]});
  mounts.push({panel:panels.backR,position:[.418,y,-.424],normal:[0,0,1]});
  mounts.push({panel:panels.backL,position:[-.424,y,.418],normal:[1,0,0]});
 }
 for(const y of [-.24,.34]) {
  mounts.push({panel:panels.sideL,position:[.153,y,.424],normal:[0,0,-1]});
  mounts.push({panel:panels.sideR,position:[.424,y,.153],normal:[-1,0,0]});
 }
 return mounts.map(({panel,position,normal},index)=>{
  const tab=new THREE.Group();tab.name=`Channel-lock tab ${index+1}`;
  tab.position.set(...position);
  tab.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(...normal));
  panel.add(tab);
  const stem=addMesh(new THREE.CylinderGeometry(.004,.004,.014,12),material,tab);stem.position.y=.005;
  const head=addMesh(new THREE.CylinderGeometry(.009,.009,.005,16),material,tab);head.position.y=.014;
  return tab;
 });
}
