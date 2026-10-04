// CAD mounting envelope, with photo-derived metal bridge and post detail.
// The barb profile and bridge perforations are illustrative, not manufacturing geometry.
export function createDetailedConnector(THREE,asset,wordmark,material){
 const group=new THREE.Group();group.name='Detailed channel lock';
 // Rebuild the photographed perforated bridge within the source CAD envelope.
 // The E3259BM metal mini has seven through-holes, never a molded wordmark.
 const add=(geometry,name)=>{const mesh=new THREE.Mesh(geometry,material);mesh.name=name;mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);return mesh;};
 const bridgeShape=new THREE.Shape();bridgeShape.moveTo(-18.5,-4);bridgeShape.lineTo(18.5,-4);bridgeShape.lineTo(18.5,0);bridgeShape.lineTo(-18.5,0);bridgeShape.closePath();
 for(let i=-3;i<=3;i++){const hole=new THREE.Path();hole.absarc(i*4.4,-2,.72,0,Math.PI*2,true);bridgeShape.holes.push(hole);}
 const bridge=new THREE.ExtrudeGeometry(bridgeShape,{depth:2.8,bevelEnabled:false,curveSegments:32});bridge.translate(0,0,-1.4);add(bridge,'Perforated metal bridge');
 const foot=new THREE.BoxGeometry(37,2.25,5.7);foot.translate(0,-5.125,0);add(foot,'Retaining foot');
 const profile=[new THREE.Vector2(0,0),new THREE.Vector2(2.43,0),new THREE.Vector2(2.43,.22),new THREE.Vector2(2.08,.55),new THREE.Vector2(2.08,6.7)];
 // Six asymmetric retention rings, a smooth lower shank, and a domed lead-in.
 for(let i=0;i<6;i++){const y=6.8+i*1.6;for(const [r,h] of [[2.08,0],[2.48,.12],[2.5,.23],[2.46,.35],[2.08,1.26]])profile.push(new THREE.Vector2(r,y+h));}
 for(const [r,y] of [[2.08,16.35],[2.35,16.65],[2.45,17.1],[2.4,17.7],[2.23,18.3],[1.88,18.8],[1.3,19.18],[.65,19.35],[0,19.4]])profile.push(new THREE.Vector2(r,y));
 const post=new THREE.LatheGeometry(profile,64);
 for(const x of [-16,16]){const mesh=add(post,`Barbed dowel ${x<0?'left':'right'}`);mesh.position.x=x;}
 return group;
}
