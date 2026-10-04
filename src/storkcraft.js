import * as THREE from '/vendor/three.module.js';
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const smooth=n=>{n=clamp(n);return n*n*(3-2*n);};
const captions=[['00 — THE FINISHED DESIGN','A familiar form. A different perspective.'],['01 — A SYSTEM OF PARTS','See how every element belongs.'],['02 — INSIDE THE DRAWER','The detail behind a clean finish.'],['03 — ALL TOGETHER','Many parts. One considered design.']];
export async function initStorkcraft(root,{paused=false}={}){
 const q=s=>root.querySelector(s), qa=s=>[...root.querySelectorAll(s)];
 const host=q('[data-sc-viewport]'),stage=q('.sc-stage'),fallback=q('[data-sc-fallback]');
 const slider=q('#sc-separation'),followButton=q('[data-sc-follow]');
 let renderer,stopped=false,frame=0,visible=true,ready=false;
 function unavailable(){stopped=true;cancelAnimationFrame(frame);host.querySelector('canvas')?.remove();q('.sc-loading')?.remove();fallback.hidden=false;q('[data-sc-status]').textContent='DRAWING PREVIEW';q('[data-sc-caption]').textContent='Explore the source sheets below.';qa('button,input').forEach(el=>el.disabled=true);document.querySelectorAll('[data-sc-finish]').forEach(el=>el.disabled=true);renderer?.dispose();}
 try{
  const response=await fetch('/assets/storkcraft-model.json');if(!response.ok)throw new Error('Model unavailable');
  const data=await response.json();
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;host.append(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden','true');
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(33,1,1,15000),model=new THREE.Group();scene.add(model);
  scene.add(new THREE.HemisphereLight(0xf8f7ed,0x667557,2.8));
  const key=new THREE.DirectionalLight(0xffe9cb,3.5);key.position.set(-1400,2300,-1600);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-1900,right:1900,top:1900,bottom:-1900,near:100,far:6500});key.shadow.bias=-.0005;scene.add(key);
  const rim=new THREE.DirectionalLight(0xdcffc0,2);rim.position.set(1000,1000,1500);scene.add(rim);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(8000,8000),new THREE.ShadowMaterial({opacity:.3}));floor.rotation.x=-Math.PI/2;floor.position.y=-10;floor.receiveShadow=true;scene.add(floor);
  const grid=new THREE.GridHelper(3500,35,0x68795c,0x56674a);grid.position.y=-9;grid.material.transparent=true;grid.material.opacity=.12;scene.add(grid);
  const texCanvas=document.createElement('canvas');texCanvas.width=512;texCanvas.height=512;const ctx=texCanvas.getContext('2d');ctx.fillStyle='#d5ba92';ctx.fillRect(0,0,512,512);let seed=58;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<1000;i++){const y=random()*512;ctx.strokeStyle=`rgba(83,56,27,${random()*.13})`;ctx.lineWidth=.2+random();ctx.beginPath();for(let x=0;x<=512;x+=12){const yy=y+Math.sin(x/110+i)*2;x?ctx.lineTo(x,yy):ctx.moveTo(x,yy);}ctx.stroke();}
  const texture=new THREE.CanvasTexture(texCanvas);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  const wood=new THREE.MeshStandardMaterial({map:texture,color:0xf4e0c2,roughness:.62});
  const interior=new THREE.MeshStandardMaterial({map:texture,color:0xd9cbb1,roughness:.8});
  const ink=new THREE.MeshStandardMaterial({color:0x293c32,roughness:.45});
  const chalk=new THREE.MeshStandardMaterial({color:0xe5e3d9,roughness:.65});
  const green=new THREE.MeshStandardMaterial({color:0xb4f56a,emissive:0x7bc12b,emissiveIntensity:.2,roughness:.32,metalness:.2});
  const edgeMaterial=new THREE.LineBasicMaterial({color:0x342716,transparent:true,opacity:.14});
  const draft=new THREE.LineBasicMaterial({color:0xc4e4ac,transparent:true,opacity:.85});
  const parts=[],byId=new Map(),connections=[];
  function geometry(p){
   const [w,h,d]=p.size_mm;if(p.shape?.type!=='arched-panel')return new THREE.BoxGeometry(w,h,d);
   const alongZ=p.shape.axis==='z',span=alongZ?w:d,depth=alongZ?d:w,aw=p.shape.arch_width_mm,ah=p.shape.arch_height_mm;
   const s=new THREE.Shape();s.moveTo(-span/2,-h/2);s.lineTo(-aw/2,-h/2);s.quadraticCurveTo(0,-h/2+ah*2,aw/2,-h/2);s.lineTo(span/2,-h/2);s.lineTo(span/2,h/2);s.lineTo(-span/2,h/2);s.closePath();
   const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:24});g.translate(0,0,-depth/2);if(!alongZ)g.rotateY(Math.PI/2);
   const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/400,uv.getY(i)/704);return g;
  }
  for(const p of data.parts){
   const g=geometry(p),pivot=new THREE.Group(),inside=p.id.startsWith('drawer_')&&!p.id.endsWith('_head');
   const mesh=new THREE.Mesh(g,inside?interior:wood);mesh.castShadow=mesh.receiveShadow=true;pivot.add(mesh);
   const edges=new THREE.LineSegments(new THREE.EdgesGeometry(g,30),edgeMaterial);pivot.add(edges);
   pivot.position.set(...p.center_mm);const [x,y,z]=p.center_mm;
   let offset=new THREE.Vector3(Math.sign(x)*170,(y-400)*.35,Math.sign(z)*100);
   if(p.id==='top')offset.set(0,340,0);
   if(p.id.startsWith('drawer_')){const row=Number(p.id.split('_')[2]);offset.set(Math.sign(x)*105,(row-2)*50,-360);if(p.id.endsWith('_head'))offset.z-=95;else if(p.id.endsWith('_base'))offset.y-=50;else if(p.id.endsWith('_left'))offset.x-=35;else if(p.id.endsWith('_right'))offset.x+=35;}
   pivot.userData={id:p.id,home:pivot.position.clone(),offset,mesh,edges,inside,label:p.label,selected:p.id.startsWith('drawer_left_3_')};parts.push(pivot);byId.set(p.id,pivot);model.add(pivot);
  }
  // Communication geometry: simplified fittings, not the source STEP or machining CAD.
  for(const h of data.hardware){const parent=byId.get(h.parent);if(!parent)continue;const fitting=new THREE.Group();const shaft=new THREE.Mesh(new THREE.CylinderGeometry(3,3,24,8),green);fitting.add(shaft);if(h.sku==='E3259BM'){const cap=new THREE.Mesh(new THREE.BoxGeometry(8,4,32),green);cap.position.y=12;fitting.add(cap);}const pos=new THREE.Vector3(...h.p).sub(parent.userData.home);fitting.position.copy(pos);fitting.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(...h.c).normalize());parent.add(fitting);connections.push(fitting);}
  let current=0,target=0,focus=0,targetFocus=0,yaw=-.4,dragYaw=0,dragTilt=0,distance=2700,following=!paused,wire=false,dragging=false,prevX=0,prevY=0,last=0,active=-1;
  const look=new THREE.Vector3(0,420,0);let scrollProgress=0;
  const chapters=qa('[data-chapter]');
  function request(){if(!frame&&!stopped&&visible&&!document.hidden)frame=requestAnimationFrame(render);}
  function setCaption(index){if(active===index)return;active=index;q('[data-sc-counter]').textContent=captions[index][0];q('[data-sc-caption]').textContent=captions[index][1];qa('[data-sc-view]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.scView)===(index===3?0:index))));}
  function updateFollow(){followButton.textContent=following?'Scroll linked ↓':'Follow scroll ↓';followButton.setAttribute('aria-pressed',String(following));}
  function setManual(view){following=false;targetFocus=view===2?1:0;target=view===1?1:view===2?.82:0;setCaption(view);updateFollow();request();}
  qa('[data-sc-view]').forEach(b=>b.addEventListener('click',()=>setManual(Number(b.dataset.scView))));
  slider.addEventListener('input',()=>{following=false;targetFocus=0;target=Number(slider.value)/100;setCaption(target>.1?1:0);updateFollow();request();});
  followButton.addEventListener('click',()=>{following=true;dragYaw=dragTilt=0;updateFollow();updateScroll();request();});
  q('[data-sc-wire]').addEventListener('click',e=>{wire=!wire;e.currentTarget.setAttribute('aria-pressed',String(wire));for(const p of parts){p.userData.mesh.visible=!wire;p.userData.edges.material=wire?draft:edgeMaterial;}request();});
  document.querySelectorAll('[data-sc-finish]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-sc-finish]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));const material={oak:wood,chalk,ink}[b.dataset.scFinish];parts.forEach(p=>{if(!p.userData.inside)p.userData.mesh.material=material;});if(wire){wire=false;q('[data-sc-wire]').setAttribute('aria-pressed','false');parts.forEach(p=>{p.userData.mesh.visible=true;p.userData.edges.material=edgeMaterial;});}setManual(0);chapters[0].scrollIntoView({behavior:paused?'instant':'smooth',block:'start'});}));
  function updateScroll(){
   if(!following||paused)return;
   const mobile=innerWidth<=760,anchor=innerHeight*(mobile?.78:.5);const positions=chapters.map(el=>{const r=el.getBoundingClientRect();return r.top+r.height*.5;});let p=0;
   for(let i=0;i<positions.length-1;i++)if(anchor>=positions[i])p=i+clamp((anchor-positions[i])/(positions[i+1]-positions[i]));
   scrollProgress=clamp(p,0,3);
   if(p<1){target=smooth(p);targetFocus=0;}else if(p<2){target=1-.18*smooth(p-1);targetFocus=smooth(p-1);}else{target=.82*(1-smooth(p-2));targetFocus=1-smooth(p-2);}
   setCaption(Math.round(p));request();
  }
  function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();distance=Math.max(2400,2050/camera.aspect);updateScroll();request();}
  function render(time){
   frame=0;if(stopped||!visible||document.hidden)return;const dt=Math.min((time-last)/1000,.05)||.016;last=time;
   current=paused?target:THREE.MathUtils.damp(current,target,9,dt);focus=paused?targetFocus:THREE.MathUtils.damp(focus,targetFocus,9,dt);
   const baseYaw=following?-.4+Math.sin(scrollProgress*Math.PI/3)*.35:-.4;yaw=paused?baseYaw:THREE.MathUtils.damp(yaw,baseYaw,6,dt);
   for(const p of parts){const u=p.userData;p.position.copy(u.home).addScaledVector(u.offset,current);p.visible=focus<.98||u.selected;if(u.selected){p.position.lerp(new THREE.Vector3(u.home.x,u.home.y,u.home.z-380).addScaledVector(u.offset,.42),focus);} }
   connections.forEach(h=>{h.visible=current>.15||focus>.1;});
   const targetLook=new THREE.Vector3(-269*focus,420+220*focus,-420*focus);look.copy(targetLook);
   const dist=THREE.MathUtils.lerp(distance*(1+current*.28),Math.max(1320,1120/camera.aspect),focus),angle=yaw+dragYaw;
   camera.position.set(look.x+Math.sin(angle)*dist,look.y+dist*(.36+dragTilt),look.z-Math.cos(angle)*dist);camera.lookAt(look);
   floor.visible=grid.visible=focus<.5;renderer.render(scene,camera);
   if(document.activeElement!==slider)slider.value=String(Math.round(current*100));q('[data-sc-percent]').textContent=Math.round(current*100)+'%';
   if(!ready){ready=true;q('.sc-loading')?.remove();q('[data-sc-status]').textContent='LIVE 3D / EXPLORE';root.dataset.scReady='true';}
   if(Math.abs(current-target)>.001||Math.abs(focus-targetFocus)>.001||Math.abs(yaw-baseYaw)>.001)request();
  }
  renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;dragging=true;prevX=e.clientX;prevY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);});
  renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;dragYaw-=(e.clientX-prevX)*.007;dragTilt=clamp(dragTilt+(e.clientY-prevY)*.002,-.2,.5);prevX=e.clientX;prevY=e.clientY;request();});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(name,()=>dragging=false);
  window.addEventListener('scroll',updateScroll,{passive:true});window.addEventListener('resize',resize,{passive:true});new ResizeObserver(resize).observe(host);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){last=performance.now();request();}},{rootMargin:'100px'}).observe(stage);
  window.addEventListener('studio-motion',e=>{paused=e.detail.paused;if(paused){following=false;updateFollow();}request();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)request();});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();unavailable();});
  updateFollow();resize();setCaption(0);updateScroll();request();
 }catch(error){console.warn('Storkcraft preview unavailable:',error);unavailable();}
}
