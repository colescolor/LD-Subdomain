import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import * as THREE from 'three';
import {buildPart,disposePart} from '../src/parts-geometry.js';
const catalog=JSON.parse(await readFile('public/assets/parts/catalog.json','utf8'));
const wordmark=JSON.parse(await readFile('public/assets/connector-wordmark.json','utf8'));
const load=async p=>buildPart(THREE,p,{wordmark,asset:p.model?.asset?JSON.parse(await readFile('public'+p.model.asset,'utf8')):null});
test('store inventory has unique links, explicit model sources, and working local assets',async()=>{
 assert.equal(catalog.parts.length,43);assert.equal(catalog.parts.filter(p=>p.model).length,24);assert.equal(new Set(catalog.parts.map(p=>p.id)).size,43);
 for(const p of catalog.parts){assert.ok(p.source.startsWith('https://lockdowel.com/'));assert.ok(p.note.length>15);assert.equal(!!p.model,p.basis!=='Photo reference');if(p.photo)assert.ok((await stat('public'+p.photo)).size>100);if(p.model?.asset)assert.ok((await stat('public'+p.model.asset)).size>100);}
 for(const id of ['e4005','e4008']){const p=catalog.parts.find(p=>p.id===id);assert.equal(p.photo,null);assert.equal(p.model,null);}
 assert.equal(catalog.parts.filter(p=>!p.sku).length,3,'Unspecified drawer-slide SKUs must not be invented');
});
test('all 24 part meshes have finite geometry, normals, and a usable orbit envelope',async()=>{
 for(const p of catalog.parts.filter(p=>p.model)){
  const object=await load(p);object.updateMatrixWorld(true);let meshes=0;
  object.traverse(o=>{if(!o.isMesh)return;meshes++;assert.ok(o.geometry.attributes.position.count>10);for(const name of ['position','normal'])for(const value of o.geometry.attributes[name].array)assert.ok(Number.isFinite(value),`${p.id}: invalid ${name}`);});
  assert.ok(meshes>0);const size=new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());assert.ok(size.x>0&&size.y>0&&size.z>0);assert.ok(size.length()<200,`${p.id}: unexpected modeling scale`);disposePart(object);
 }
});
test('housings are actually hollow and the perforated metal bridge has through-holes',async()=>{
 for(const id of ['2001b','4001','5001']){const p=catalog.parts.find(p=>p.id===id),o=await load(p);o.updateMatrixWorld(true);const ray=new THREE.Raycaster(new THREE.Vector3(0,30,0),new THREE.Vector3(0,-1,0));assert.equal(ray.intersectObject(o).length,0,`${id}: blocked bore`);ray.set(new THREE.Vector3(p.model.radius*.82,30,0),new THREE.Vector3(0,-1,0));assert.ok(ray.intersectObject(o).length>0);disposePart(o);}
 const p=catalog.parts.find(p=>p.id==='e900bm'),o=await load(p);o.updateMatrixWorld(true);const ray=new THREE.Raycaster(new THREE.Vector3(0,-3.4,20),new THREE.Vector3(0,0,-1));assert.equal(ray.intersectObject(o).length,0);ray.set(new THREE.Vector3(2,-3.4,20),new THREE.Vector3(0,0,-1));assert.ok(ray.intersectObject(o).length>0);disposePart(o);
});
test('CAD copies retain the original recorded STEP identities',async()=>{
 for(const [file,sha]of [['7000-short','b8d0de2a0822bf7b11a7e36e80502ee4995286c8d32e3e15310714a253580b70'],['8002-40-R5','5c9535d0941248ed52a372823ec0c09ce2cd43891a4a7f86c78db12b4a6d895b']]){
  const a=JSON.parse(await readFile(`public/assets/parts/${file}.json`,'utf8'));assert.equal(a.sha256,sha);assert.equal(a.positions.length,a.normals.length);
 }
});
