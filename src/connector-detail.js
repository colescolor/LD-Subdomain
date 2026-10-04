// CAD bridge and mounting envelope, with photo-derived presentation detail.
// The barb profile and embossing are illustrative, not manufacturing geometry.
export function createDetailedConnector(THREE,asset,wordmark,material){
 const group=new THREE.Group();group.name='Detailed channel lock';
 const source=new THREE.BufferGeometry();
 source.setAttribute('position',new THREE.Float32BufferAttribute(asset.positions,3));
 source.setAttribute('normal',new THREE.Float32BufferAttribute(asset.normals,3));
 // Preserve the original bridge, replacing only the two smooth CAD posts.
 const bridgeIndices=[];
 for(let i=0;i<asset.indices.length;i+=3){const tri=asset.indices.slice(i,i+3);if(tri.every(v=>asset.positions[v*3+2]>=-.001))bridgeIndices.push(...tri);}
 source.setIndex(bridgeIndices);source.rotateX(Math.PI/2);
 // Compact the bridge so its bounding box excludes the unused post vertices.
 const bridge=source.toNonIndexed();source.dispose();
 const add=(geometry,name)=>{const mesh=new THREE.Mesh(geometry,material);mesh.name=name;mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);return mesh;};
 add(bridge,'Original CAD bridge');
 const profile=[new THREE.Vector2(0,0),new THREE.Vector2(2.43,0),new THREE.Vector2(2.43,.22),new THREE.Vector2(2.08,.55),new THREE.Vector2(2.08,6.7)];
 // Six asymmetric retention rings, a smooth lower shank, and a domed lead-in.
 for(let i=0;i<6;i++){const y=6.8+i*1.6;for(const [r,h] of [[2.08,0],[2.48,.12],[2.5,.23],[2.46,.35],[2.08,1.26]])profile.push(new THREE.Vector2(r,y+h));}
 for(const [r,y] of [[2.08,16.35],[2.35,16.65],[2.45,17.1],[2.4,17.7],[2.23,18.3],[1.88,18.8],[1.3,19.18],[.65,19.35],[0,19.4]])profile.push(new THREE.Vector2(r,y));
 const post=new THREE.LatheGeometry(profile,64);
 for(const x of [-16,16]){const mesh=add(post,`Barbed dowel ${x<0?'left':'right'}`);mesh.position.x=x;}
 // Real shallow geometry lets the wordmark catch the same light as the bridge.
 const path=new THREE.ShapePath();
 for(const [command,...p] of wordmark.commands){
  if(command==='M')path.moveTo(...p);else if(command==='L')path.lineTo(...p);else if(command==='C')path.bezierCurveTo(...p);else path.currentPath.closePath();
 }
 const letters=new THREE.ExtrudeGeometry(path.toShapes(false),{depth:.23,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:3,curveSegments:24});
 letters.translate(0,-2,1.395);
 const logo=add(letters,'Molded Lockdowel wordmark');
 // Submillimetre letter shadows alias at cabinet scale; the bevel supplies clean relief.
 logo.castShadow=logo.receiveShadow=false;
 return group;
}
