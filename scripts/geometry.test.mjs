import * as THREE from 'three';
import {receiverGeometry} from '../src/receiver-geometry.js';
import test from 'node:test';
import assert from 'node:assert/strict';
const geometry=receiverGeometry(THREE);
const close=(a,b)=>assert.ok(Math.abs(a-b)<.01,`Expected ${b}, got ${a}`);
function hit(g,origin,direction){const mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));mesh.updateMatrixWorld();const hits=new THREE.Raycaster(new THREE.Vector3(...origin),new THREE.Vector3(...direction)).intersectObject(mesh);assert.ok(hits.length,'Ray must hit receiving geometry');return hits[0].point;}
test('all four tabletop receivers are recessed with solid retaining lips',()=>{const g=geometry.tabletop();for(const x of [-412.5,412.5])for(const z of [-180,180]){close(hit(g,[x,-100,z-5],[0,1,0]).y,-9.7);close(hit(g,[x+4,-100,z-5],[0,1,0]).y,-16);close(hit(g,[x+4,-12,z-5],[0,-1,0]).y,-13);}close(g.boundingBox.min.y,-16);close(g.boundingBox.max.y,16);});
test('both base receivers have recessed entries and undercut lips at both anchors',()=>{for(const direction of [-1,1]){const g=geometry.side(direction);for(const y of [156,281]){const insideFace=-direction*12.5;const pocket=insideFace+direction*6.3;const retainingLip=insideFace+direction*3;const neckY=y-direction*5;close(hit(g,[-direction*100,neckY,0],[direction,0,0]).x,pocket);close(hit(g,[-direction*100,neckY,4],[direction,0,0]).x,insideFace);close(hit(g,[insideFace+direction*4,neckY,4],[-direction,0,0]).x,retainingLip);}close(g.boundingBox.min.x,-12.5);close(g.boundingBox.max.x,12.5);}});
