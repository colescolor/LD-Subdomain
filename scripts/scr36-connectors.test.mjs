import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {attachChannelLockTabs} from '../public/projects/scr36/scr36-connectors.js';

test('channel-lock tabs stay physically attached to their owning panels throughout explosion',()=>{
 const root=new THREE.Group();
 const dimensions={backR:[[.884,.876,.018],[0,0,-.433],[0,.015,-.25]],backL:[[.018,.876,.872],[-.433,0,0],[-.25,.02,0]],sideR:[[.018,.762,.591],[.433,.057,-.138],[.26,0,-.01]],sideL:[[.591,.762,.018],[-.138,.057,.433],[-.01,0,.26]]};
 const panels={};const boards=new Map();
 for(const [name,[size,position]] of Object.entries(dimensions)){const group=new THREE.Group();group.name=name;panels[name]=group;root.add(group);const board=new THREE.Mesh(new THREE.BoxGeometry(...size));board.position.set(...position);group.add(board);boards.set(group,board);}
 const tabs=attachChannelLockTabs({THREE,panels,addMesh:(g,m,p)=>{const mesh=new THREE.Mesh(g,m);p.add(mesh);return mesh;},material:new THREE.MeshBasicMaterial()});
 assert.equal(tabs.length,13);
 const starts=tabs.map(tab=>({parent:tab.parent,local:tab.position.clone(),world:tab.getWorldPosition(new THREE.Vector3())}));
 for(const separation of [0,.25,.5,1,0]){
  for(const [name,panel]of Object.entries(panels))panel.position.set(...dimensions[name][2]).multiplyScalar(separation);
  root.updateMatrixWorld(true);
  tabs.forEach((tab,i)=>{
   assert.equal(tab.parent,starts[i].parent,'hardware must belong to a panel');assert.ok(tab.position.equals(starts[i].local),'hardware must not separate within its panel');
   const expected=starts[i].world.clone().add(tab.parent.position);assert.ok(tab.getWorldPosition(new THREE.Vector3()).distanceTo(expected)<1e-10,'hardware must follow the exact panel displacement');
   const stemBounds=new THREE.Box3().setFromObject(tab.children[0]);const boardBounds=new THREE.Box3().setFromObject(boards.get(tab.parent));assert.ok(stemBounds.intersectsBox(boardBounds),'the stem must remain seated in its panel');
  });
 }
});
