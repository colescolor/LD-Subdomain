import * as THREE from '/vendor/three.module.js';
import {receiverGeometry} from './receiver-geometry.js';
// Original model authored from the supplied LD-SHOW-T1200 Rev A concept sheet.
// This is an inspection view, not a manufacturing model or validated assembly path.
export function initScene(root,{paused=false}={}){
 const host=root.querySelector('.scene-canvas');
 const cinematic=root.hasAttribute('data-cinematic');
 const receiving=receiverGeometry(THREE);
 const fallback=host.querySelector('img');
 let renderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{root.querySelector('.live-indicator').textContent='DRAWING PREVIEW';root.querySelectorAll('button').forEach(b=>b.disabled=true);root.querySelector('.scene-hint').textContent='3D UNAVAILABLE';return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.45;
 host.append(renderer.domElement);fallback.hidden=true;
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(35,1,1,10000);
 const group=new THREE.Group();scene.add(group);
 scene.add(new THREE.HemisphereLight(0xeef6dc,0x34312a,2.7));
 const key=new THREE.DirectionalLight(0xffedcf,3.1);key.position.set(-1000,2400,1600);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-2000,right:2000,top:2000,bottom:-2000,near:100,far:6000});key.shadow.bias=-.0003;scene.add(key);
 const rim=new THREE.DirectionalLight(0xc6ff8d,2.3);rim.position.set(1500,1000,-1400);scene.add(rim);
 const fill=new THREE.DirectionalLight(0xffffff,.7);fill.position.set(800,300,1700);scene.add(fill);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(8000,8000),new THREE.ShadowMaterial({color:0x000000,opacity:.26}));floor.rotation.x=-Math.PI/2;floor.position.y=-5;floor.receiveShadow=true;scene.add(floor);
 const grid=new THREE.GridHelper(2800,28,0x566745,0x35412f);grid.material.transparent=true;grid.material.opacity=.2;grid.position.y=-3;scene.add(grid);
 // Procedural timber finish; no external artwork or Latch assets.
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const ctx=canvas.getContext('2d');ctx.fillStyle='#d1b286';ctx.fillRect(0,0,512,512);let seed=16;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};for(let i=0;i<750;i++){const y=random()*512;ctx.strokeStyle=`rgba(74,43,17,${random()*.12})`;ctx.lineWidth=random()*1.8+.15;ctx.beginPath();for(let x=0;x<=512;x+=8){const dy=Math.sin(x/100+i)*random()*3; x===0?ctx.moveTo(x,y+dy):ctx.lineTo(x,y+dy);}ctx.stroke();}
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),4);
 const wood=new THREE.MeshStandardMaterial({map:texture,color:0xbba381,roughness:.68,metalness:0});
 const topWood=new THREE.MeshStandardMaterial({map:texture,color:0x9e7b56,roughness:.48,metalness:0});
 const green=new THREE.MeshStandardMaterial({color:0x96ff00,emissive:0x6fab00,emissiveIntensity:.35,roughness:.32,metalness:.1});
 const pieces=[];
 function part(geometry,position,offset,material=wood){const pivot=new THREE.Group();const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;pivot.add(mesh);pivot.position.set(...position);pivot.userData={home:new THREE.Vector3(...position),offset:new THREE.Vector3(...offset)};group.add(pivot);pieces.push(pivot);const edge=new THREE.LineSegments(new THREE.EdgesGeometry(geometry,40),new THREE.LineBasicMaterial({color:0x3c301d,transparent:true,opacity:.3}));pivot.add(edge);return pivot;}
 const topGeometry=receiving.tabletop();
 // UVs in millimeters are normalized for a readable wood texture.
 const uv=topGeometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/1200,uv.getY(i)/600);uv.needsUpdate=true;
 const top=part(topGeometry,[0,704,0],[0,285,0],topWood);
 const left=part(receiving.side(-1),[-412.5,344,0],[-130,0,0]);
 const right=part(receiving.side(1),[412.5,344,0],[130,0,0]);
 const stretcher=part(new THREE.BoxGeometry(800,250,25),[0,563,0],[0,15,-160]);
 function fitting(parent,position,direction,rotate=false){const fitting=new THREE.Group();const bridge=new THREE.Mesh(new THREE.BoxGeometry(21,3,8),green);bridge.position.y=4.6;fitting.add(bridge);for(const x of [-8,8]){const pin=new THREE.Mesh(new THREE.CylinderGeometry(2.5,2.5,16,12),green);pin.position.set(x,-7,0);fitting.add(pin);const neck=new THREE.Mesh(new THREE.CylinderGeometry(2.5,2.5,3,12),green);neck.position.set(x,2.5,0);fitting.add(neck);for(let y=-13;y<0;y+=4){const rib=new THREE.Mesh(new THREE.CylinderGeometry(3.2,2.5,1.5,12),green);rib.position.set(x,y,0);fitting.add(rib);}}fitting.position.set(...position);fitting.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(...direction));if(rotate)fitting.rotateY(Math.PI/2);fitting.traverse(o=>{if(o.isMesh)o.castShadow=true;});parent.add(fitting);}
 for(const base of [left,right])for(const z of [-180,180])fitting(base,[0,344,z],[0,1,0],true);
 for(const x of [-400,400])for(const y of [-63,62])fitting(stretcher,[x,y,0],[Math.sign(x),0,0]);
 // Visual connection-axis markers, not machined slots or additional hardware.
 const markerMaterial=new THREE.LineDashedMaterial({color:0xb1ff42,transparent:true,opacity:.24,dashSize:7,gapSize:10});
 const markers=new THREE.Group();scene.add(markers);
 for(const x of [-412.5,412.5])for(const z of [-180,180]){const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,705,z),new THREE.Vector3(x,970,z)]),markerMaterial);line.computeLineDistances();markers.add(line);}
 let target=cinematic?0:1,amount=target,rotation=-.15,tilt=.43,distance=2250,autoplay=false,playingSince=0,dragging=false,lastX=0,lastY=0,visible=true,lastTime=0,raf=0;
 let detail=false,filmTime=0;
 const detailButton=root.querySelector('[data-detail-view]');
 const play=root.querySelector('[data-scene-play]');
 play.disabled=paused;
 if(matchMedia('(pointer: coarse)').matches)root.querySelector('.scene-hint').textContent='USE VIEW CONTROLS';
 function setView(state){detail=false;detailButton.setAttribute('aria-pressed','false');target=state==='assembled'?0:1;autoplay=false;updatePlay();root.querySelectorAll('[data-state]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.state===state)));requestRender();}
 function updatePlay(){play.textContent=autoplay?'Ⅱ':'▶';play.setAttribute('aria-label',autoplay?'Pause assembly overview':'Play assembly overview');}
 root.querySelectorAll('[data-state]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.state)));
 detailButton.addEventListener('click',()=>{detail=!detail;target=detail?1:target;autoplay=false;updatePlay();detailButton.setAttribute('aria-pressed',String(detail));root.querySelectorAll('[data-state]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.state==='exploded')));requestRender();});
 play.addEventListener('click',()=>{detail=false;detailButton.setAttribute('aria-pressed','false');autoplay=!autoplay;playingSince=performance.now();updatePlay();requestRender();});
 root.querySelector('[data-scene-reset]').addEventListener('click',()=>{rotation=-.15;tilt=.43;setView('exploded');});
 function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();distance=camera.aspect<1?2800:2300;if(camera.aspect>1.8)distance=1900;requestRender();}
 const observer=new ResizeObserver(resize);observer.observe(host);
 function requestRender(){if(!raf)raf=requestAnimationFrame(render);}
 function render(time){raf=0;if(!visible||document.hidden)return;const dt=Math.min((time-lastTime)/1000,.05)||.016;lastTime=time;
 if(autoplay&&!paused){const phase=((time-playingSince)/1000)%4;target=phase<1.7?0:1;root.querySelectorAll('[data-state]').forEach(b=>b.setAttribute('aria-pressed',String((target===0?'assembled':'exploded')===b.dataset.state)));}
 amount=paused?target:THREE.MathUtils.damp(amount,target,11,dt);
 if(!paused&&!dragging&&!detail)rotation+=dt*.13;
 if(!paused)filmTime+=dt;
 pieces.forEach(p=>p.position.copy(p.userData.home).addScaledVector(p.userData.offset,amount));
 markers.visible=amount>.7;markerMaterial.opacity=Math.max(0,(amount-.7)/.3)*.24;
 if(cinematic){
 // Three sweeping shots of the FINISHED design; no assembly lesson on home.
 const shotLength=3.0,shot=Math.floor(filmTime/shotLength)%3;
 const progress=(filmTime%shotLength)/shotLength;
 const t=progress*progress*(3-2*progress);
 const shots=[{a:-.95,b:.25,h:720,to:430,d:1.02},{a:1.05,b:1.8,h:1170,to:470,d:.9},{a:2.7,b:3.75,h:670,to:420,d:1.06}];
 const frame=shots[shot],angle=THREE.MathUtils.lerp(frame.a,frame.b,t);
 camera.position.set(Math.sin(angle)*distance*frame.d,frame.h+Math.sin(progress*Math.PI)*100,Math.cos(angle)*distance*frame.d);camera.lookAt(0,frame.to,0);
 }else if(detail){
 // Inner face of left receiver, with its actual recessed mouth and retaining lips.
 camera.position.set(-240,605,195);camera.lookAt(-529,625,0);
 }else{const angle=rotation+.72;camera.position.set(Math.sin(angle)*distance,530+Math.sin(tilt)*distance,Math.cos(angle)*distance);camera.lookAt(0,490,0);}

 renderer.render(scene,camera);
 if(!paused||Math.abs(amount-target)>.001)requestRender();}
 let startX=0,startY=0,moved=false;
 renderer.domElement.addEventListener('pointerdown',e=>{if(cinematic||detail||e.pointerType==='touch')return;dragging=true;startX=lastX=e.clientX;startY=lastY=e.clientY;moved=false;renderer.domElement.setPointerCapture(e.pointerId);});
 renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;moved=Math.abs(e.clientX-startX)+Math.abs(e.clientY-startY)>4;rotation+=(e.clientX-lastX)*.007;tilt=THREE.MathUtils.clamp(tilt+(e.clientY-lastY)*.003,.12,.9);lastX=e.clientX;lastY=e.clientY;requestRender();});
 const stop=()=>{dragging=false;};renderer.domElement.addEventListener('pointerup',stop);renderer.domElement.addEventListener('pointercancel',stop);
 // Touch uses native page scrolling. Keyboard-accessible view controls remain available.
 renderer.domElement.setAttribute('aria-hidden','true');
 const visibilityObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)requestRender();});visibilityObserver.observe(root);
 window.addEventListener('studio-motion',e=>{paused=e.detail.paused;play.disabled=paused;if(paused){autoplay=false;updatePlay();}requestRender();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)requestRender();});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback.hidden=false;renderer.domElement.hidden=true;root.querySelector('.live-indicator').textContent='DRAWING PREVIEW';root.querySelectorAll('button').forEach(b=>b.disabled=true);visible=false;});
 resize();requestRender();
}
