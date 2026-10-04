import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {createDetailedConnector} from '../src/connector-detail.js';
import {connectionFrame,createConnectionWood,fitPerspectiveDistance} from '../src/channel-geometry.js';
function cast(geometries,origin,direction){const material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});const group=new THREE.Group();for(const g of geometries)group.add(new THREE.Mesh(g,material));group.updateMatrixWorld(true);const ray=new THREE.Raycaster(new THREE.Vector3(...origin),new THREE.Vector3(...direction));const hit=ray.intersectObject(group)[0];material.dispose();return hit?.point;}
const near=(a,b)=>assert.ok(Math.abs(a-b)<.001,`${a} should equal ${b}`);
test('source CAD is preserved and its dowel envelope fits the illustrated bores',async()=>{const source=JSON.parse(await readFile('public/assets/e3259bm-mesh.json','utf8'));assert.equal(source.sku,'E3259BM');assert.equal(source.sha256,'838051f7d26acb8e08706cb9b4942ac34579ac58a99cc16e2aaf9e7c069274de');assert.equal(source.positions.length,source.normals.length);assert.ok(source.indices.length>1500);const {carrier}=createConnectionWood(THREE);for(const x of [-16,16]){near(cast(carrier,[x,-1,0],[0,1,0]).y,22);}near(cast(carrier,[0,-1,0],[0,1,0]).y,0);carrier.forEach(g=>g.dispose());});
test('channel has a recessed entry and solid retaining lips over the wider pocket',()=>{const {carrier,receiver}=createConnectionWood(THREE);near(cast(receiver,[0,10,0],[0,-1,0]).y,-9.1);near(cast(receiver,[-40,10,0],[0,-1,0]).y,-9.1);near(cast(receiver,[-40,10,2.8],[0,-1,0]).y,0);near(cast(receiver,[-40,-6,2.8],[0,1,0]).y,-3.65);[...carrier,...receiver].forEach(g=>g.dispose());});
test('mount, seat, slide and joint overview happen in order with the fitting rigidly attached after mounting',()=>{const first=connectionFrame(0);assert.equal(first.woodOpacity,0);assert.equal(first.receiverOpacity,0);assert.equal(first.zoom,0);const mount=connectionFrame(4.4);near(mount.connectorY,0);assert.equal(mount.carrierY,45);const seat=connectionFrame(8.4);near(seat.carrierY,0);near(seat.carrierX,0);const locked=connectionFrame(10.7);near(locked.carrierX,-31);near(locked.carrierY,0);near(locked.connectorY,0);assert.equal(locked.zoom,0);assert.equal(connectionFrame(16).zoom,1);for(let t=4.4;t<=16;t+=.1)near(connectionFrame(t).connectorY,0);for(let t=0;t<=16;t+=.05){const f=connectionFrame(t);assert.ok(Object.values(f).every(v=>typeof v==='boolean'||Number.isFinite(v)));}});

test('moving assembly remains inside the viewport at narrow, square and wide aspect ratios',()=>{
 const {carrier,receiver}=createConnectionWood(THREE,{section:true});
 const carrierBounds=new THREE.Box3(),receiverBounds=new THREE.Box3();
 for(const g of carrier){g.computeBoundingBox();carrierBounds.union(g.boundingBox);}
 for(const g of receiver){g.computeBoundingBox();receiverBounds.union(g.boundingBox);}
 for(const aspect of [.6,1,2.3])for(const angle of [-1,.5,1.5])for(const t of [.4,1,1.8,2.5,4.4,5.3,6,7.8,10.7]){
  const s=connectionFrame(t),bounds=new THREE.Box3(new THREE.Vector3(s.carrierX-18.5,s.carrierY+s.connectorY-6.25,-2.5),new THREE.Vector3(s.carrierX+18.5,s.carrierY+s.connectorY+19.4,2.5));
  if(s.woodOpacity>0)bounds.union(carrierBounds.clone().translate(new THREE.Vector3(s.carrierX,s.carrierY,0)));
  if(s.receiverOpacity>0)bounds.union(receiverBounds.clone().translate(new THREE.Vector3(0,s.receiverY,0)));
  const target=new THREE.Vector3(s.carrierX*.5,31,0),direction=new THREE.Vector3(Math.sin(angle),.27,Math.cos(angle));
  const distance=fitPerspectiveDistance(THREE,bounds,target,direction,32,aspect);
  const camera=new THREE.PerspectiveCamera(32,aspect,.1,12000);camera.position.copy(target).addScaledVector(direction.normalize(),distance);camera.lookAt(target);camera.updateMatrixWorld(true);
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
   const p=new THREE.Vector3(x,y,z).project(camera);assert.ok(Math.abs(p.x)<=.881&&Math.abs(p.y)<=.881,`Clipped assembly at time ${t}, aspect ${aspect}`);
  }
 }
 [...carrier,...receiver].forEach(g=>g.dispose());
});

test('opening holds a clear gap, then inserts once without withdrawal',()=>{
 for(let t=0;t<=2;t+=.01){const f=connectionFrame(t);near(f.carrierY+f.connectorY,0);assert.ok(f.carrierY-(f.carrierY+f.connectorY+19.4)>25);}
 let previous=-45;
 for(let t=2;t<=4.4;t+=.01){const f=connectionFrame(t);assert.ok(f.connectorY>=previous);previous=f.connectorY;near(f.carrierY,45);}
 for(let t=0;t<=6;t+=.01){const f=connectionFrame(t);if(f.woodOpacity>0)near(f.cameraFrame,1);if(f.receiverOpacity>0)near(f.receiverFrame,1);}
});

test('metal mini has ridged posts, seven open bridge holes, and no nylon wordmark',async()=>{
 const asset=JSON.parse(await readFile('public/assets/e3259bm-mesh.json','utf8'));
 const wordmark=JSON.parse(await readFile('public/assets/connector-wordmark.json','utf8'));
 const material=new THREE.MeshStandardMaterial();
 const model=createDetailedConnector(THREE,asset,wordmark,material);model.updateMatrixWorld(true);
 const posts=model.children.filter(m=>m.name.startsWith('Barbed dowel'));
 assert.equal(posts.length,2);
 for(const post of posts){const b=new THREE.Box3().setFromObject(post);near(b.max.y,19.4);near(b.min.y,0);assert.ok(b.max.x-b.min.x<=5.001);
  const hitAt=y=>new THREE.Raycaster(new THREE.Vector3(post.position.x,y,10),new THREE.Vector3(0,0,-1)).intersectObject(post)[0].point.z;
  assert.ok(hitAt(8.63)-hitAt(8.39)>.35,'Barb must have a real raised retention edge');
  assert.ok(hitAt(19.18)<hitAt(17.1),'Lead-in should taper to a rounded tip');
 }
 assert.equal(model.getObjectByName('Molded Lockdowel wordmark'),undefined);
 for(let i=-3;i<=3;i++){
  const ray=new THREE.Raycaster(new THREE.Vector3(i*4.4,-2,10),new THREE.Vector3(0,0,-1));assert.equal(ray.intersectObject(model).length,0,'Metal bridge hole must pass all the way through');
  ray.set(new THREE.Vector3(i*4.4,-3.2,10),new THREE.Vector3(0,0,-1));assert.ok(ray.intersectObject(model).length>0,'Material must remain below each perforation');
 }
 for(const g of new Set(model.children.map(m=>m.geometry)))g.dispose();material.dispose();
});

test('the ending preserves the same locked geometry and opaque surfaces throughout the camera pullback',()=>{
 const locked=connectionFrame(10.7);
 for(let t=10.7;t<=16;t+=.01){const f=connectionFrame(t);for(const key of ['carrierX','carrierY','connectorY','receiverY','woodOpacity','receiverOpacity'])near(f[key],locked[key]);assert.equal(f.section,true);}
 near(connectionFrame(16).zoom,1);
});

test('all three showcase models get clear mounting bores and receiving pockets',async()=>{
 const {connectionProfile}=await import('../src/channel-geometry.js');
 const catalog=JSON.parse(await readFile('public/assets/parts/catalog.json','utf8'));
 for(const id of ['e900bp','e3259bm','e910bp']){
  const part=catalog.parts.find(p=>p.id===id),profile=connectionProfile(part),{carrier,receiver}=createConnectionWood(THREE,profile);
  const radius=part.model.radius||2.5;
  for(const x of [-profile.spacing/2,profile.spacing/2]){
   near(cast(carrier,[x,-1,radius*.95],[0,1,0]).y,profile.boreDepth);
   near(cast(carrier,[x+profile.boreRadius+.2,-1,0],[0,1,0]).y,0);
  }
  // A visible throat, deeper receiving pocket, and solid material outside remain.
  near(cast(receiver,[-40,10,profile.mouth-.1],[0,-1,0]).y,-9.1);
  near(cast(receiver,[-40,10,profile.mouth+.1],[0,-1,0]).y,0);
  near(cast(receiver,[-40,-4,profile.pocket-.1],[0,-1,0]).y,-9.1);
  [...carrier,...receiver].forEach(g=>g.dispose());
 }
});
