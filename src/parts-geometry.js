import {createDetailedConnector} from './connector-detail.js';

// Photo-based presentation meshes are deliberately separate from imported source CAD.
export function buildPart(THREE,part,{asset,wordmark}={}){
 const model=part.model;if(!model)throw new Error('No 3D model for this part');
 const metal=part.material==='Metal';
 const material=new THREE.MeshPhysicalMaterial({color:part.color||(metal?'#b5bdc1':part.material==='CAD finish'?'#c5a357':'#67bf32'),metalness:metal?.82:part.material==='CAD finish'?.55:.02,roughness:metal?.3:.42,clearcoat:metal?.1:.15});
 const group=new THREE.Group();group.name=part.sku;
 const add=(geo,x=0,y=0,z=0,mat=material)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);group.add(m);return m;};
 const box=(w,h,d,x=0,y=0,z=0)=>add(new THREE.BoxGeometry(w,h,d),x,y,z);
 const lathe=(profile,x=0,y=0,z=0)=>add(new THREE.LatheGeometry(profile.map(([r,h])=>new THREE.Vector2(r,h)),64),x,y,z);
 function plate(w,h,d,holes=[],y=0){
  const r=Math.min(1.2,h/4),s=new THREE.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
  for(const [x,cy,radius]of holes){const hole=new THREE.Path();hole.absarc(x,cy,radius,0,Math.PI*2,true);s.holes.push(hole);}
  const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.12,bevelThickness:.12,bevelSegments:3,curveSegments:24});g.translate(0,0,-d/2);return add(g,0,y,0);
 }
 function branding(width,y,z){
  if(!wordmark)return;
  const path=new THREE.ShapePath();for(const [c,...p]of wordmark.commands){if(c==='M')path.moveTo(...p);else if(c==='L')path.lineTo(...p);else if(c==='C')path.bezierCurveTo(...p);else path.currentPath.closePath();}
  const g=new THREE.ExtrudeGeometry(path.toShapes(false),{depth:.14,bevelEnabled:true,bevelSize:.022,bevelThickness:.02,bevelSegments:2,curveSegments:20});g.scale(width/25,width/25,1);add(g,0,y,z);
 }
 function barbed(radius,height,x=0,y=0,{all=false,lower=false}={}){
  const core=radius*.82,full=all||height<radius*3,start=full?.25:height*.44,end=height-Math.min(radius*.6,height*.1),profile=[[0,0],[core,0],[core,start]],rings=full?Math.max(5,Math.round(height/1.35)):6,pitch=(end-start)/rings;
  for(let h=start;h<end-.5;h+=pitch)profile.push([core,h],[radius,h+.10],[radius,h+.24],[core,Math.min(h+pitch*.86,end)]);
  const shoulder=Math.max(end,profile.at(-1)[1]);profile.push([core,shoulder],[radius*.97,shoulder+.18]);
  for(let i=0;i<=8;i++){const a=i/8*Math.PI/2;profile.push([radius*.97*Math.cos(a),shoulder+.18+(height-shoulder-.18)*Math.sin(a)]);}
  const m=lathe(profile,x,y);if(lower){for(let h=0;h<height*.25;h+=1.25){const ridge=new THREE.CylinderGeometry(radius,radius*.82,.6,48);add(ridge,x,y+h,0);}}return m;
 }
 function snapTip(radius,y){return lathe([[0,0],[radius*.65,0],[radius*.65,2],[radius,2.2],[radius,3.2],[radius*.5,4.2],[0,4.5]],0,y);}
 if(model.type==='detailed-cad'){
  material.dispose();return createDetailedConnector(THREE,asset,wordmark,new THREE.MeshPhysicalMaterial({color:'#b5bdc1',metalness:.8,roughness:.3}));
 }
 if(model.type==='cad'){
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(asset.positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(asset.normals,3));g.setIndex(asset.indices);
  const m=add(g);m.rotation.set(...(model.rotation||[0,0,0]));
 }else if(model.type==='channel'){
  const {spacing,radius,post,hclip}=model,w=spacing+radius*2,h=radius*1.7;
  const holes=model.perforated?Array.from({length:7},(_,i)=>[(i-3)*spacing/8,0,radius*.34]):[];
  plate(w,h,radius*.95,holes,-h/2);plate(w,1.35,radius*1.55,[],-h+.25);
  for(const x of [-spacing/2,spacing/2])barbed(radius,post,x,hclip?-2:0,{lower:hclip});
  if(!model.perforated)branding(spacing*.78,-h/2,radius*.475+.13);
  if(hclip)for(const y of [-h+.3,-.3])plate(w-2*radius,1.1,radius*1.5,[],y);
 }else if(model.type==='double'){
  const holes=model.perforated?[-12,0,12].map(x=>[x,0,3.5]):[];
  plate(40,17,3.4,holes);for(const y of [-8,8])plate(42,4.5,7.6,[],y);
  if(model.hclip)for(const x of [-18.5,18.5]){const post=barbed(3.3,19,x,-9.5,{all:true});post.rotation.y=.3;}
  if(!model.perforated)branding(26,0,1.84);
 }else if(model.type==='face-frame'){
  plate(32,8,3);for(const y of [-3.7,3.7])plate(33,1.7,6.3,[],y);
  box(6,3,14,0,0,7);box(6,6,2.5,0,1.5,14);branding(17,0,1.65);
 }else if(model.type==='housing'){
  const r=model.radius,h=model.height,inner=r*.63,profile=[[inner,0],[r*.9,0]];
  for(let y=.2;y<h-1;y+=1.45)profile.push([r*.88,y],[r,y+.18],[r,y+.5],[r*.88,y+1.25]);
  profile.push([r,h-.6],[r,h],[inner,h],[inner,0]);lathe(profile);
 }else if(model.type==='snap-pin'){
  const r=model.threaded?2.5:4,h=14;
  if(model.threaded){lathe([[0,0],[2.1,0],[2.1,h],[0,h]]);
   class Helix extends THREE.Curve{getPoint(t,target=new THREE.Vector3()){const a=t*Math.PI*2*11;return target.set(Math.cos(a)*2.23,t*13+.4,Math.sin(a)*2.23);}}
   add(new THREE.TubeGeometry(new Helix(),440,.27,8,false));
  }else barbed(r,h,0,0,{all:true});
  lathe([[0,14],[5,14],[5,15],[2.35,15],[2.35,21],[0,21]]);snapTip(2.9,20);
 }else if(model.type==='double-pin'){
  lathe([[0,0],[2.7,0],[3.1,1],[3.1,13],[2.7,14],[0,14]]);
  snapTip(3.3,13);const tip=snapTip(3.3,0);tip.rotation.z=Math.PI;
 }else if(model.type==='cinch'){
  const r=model.radius,h=model.length;barbed(r,h*.72,0,0,{all:true});barbed(r*.75,h*.28,0,h*.72-.5,{all:true});
 }else if(model.type==='straight'){
  barbed(4,15,0,0,{all:true});lathe([[0,14],[2.5,14],[2.5,21],[0,21]]);barbed(2.5,21,0,19,{all:true});
 }else if(model.type==='spring'){
  const r=model.radius,gap=.11,s=new THREE.Shape();s.absarc(0,0,r,-Math.PI/2+gap,Math.PI*1.5-gap,false);s.lineTo((r-.65)*Math.cos(-Math.PI/2-gap),(r-.65)*Math.sin(-Math.PI/2-gap));s.absarc(0,0,r-.65,-Math.PI/2-gap,-Math.PI/2+gap,true);s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:model.length,bevelEnabled:true,bevelSize:.12,bevelThickness:.16,bevelSegments:2,curveSegments:40});g.rotateX(-Math.PI/2);add(g);
 }else throw new Error(`Unknown model type: ${model.type}`);
 return group;
}

export function disposePart(group){
 const geometries=new Set(),materials=new Set();group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);});
 geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
}
