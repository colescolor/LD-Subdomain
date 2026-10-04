import * as THREE from '/vendor/three.module.js';
import {DURATION,clamp,connectionFrame,connectionProfile,createConnectionWood,fitPerspectiveDistance} from './channel-geometry.js';
import {buildPart} from './parts-geometry.js';
import {initModelPreviews} from './model-previews.js';
import {RoomEnvironment} from '/vendor/RoomEnvironment.js';
const PHASES=[['00 / THE CHANNEL LOCK','Inspect the selected connector before it mounts.'],['01 / PUSH INTO THE WOOD','The two dowel ends seat into the panel.'],['02 / ENTER THE CHANNEL','The head enters the wider receiving pocket.'],['03 / SLIDE TO CONNECT','A short slide brings the head beneath the retaining edges.'],['04 / THE FINISHED JOINT','Two panels. One locked connection. Drag to look around.']];
export async function initChannelHome(root,{paused=false}={}){
 const q=s=>root.querySelector(s),qa=s=>[...root.querySelectorAll(s)],host=q('[data-channel-viewport]'),stage=q('.connection-stage'),play=q('[data-channel-play]'),slider=q('#connection-progress'),spinButton=q('[data-channel-spin]');
 let renderer,raf=0,failed=false,visible=true,playing=false,spin=!paused,time=0,last=0,drag=false,yaw=.5,pitch=.27,extraYaw=0,extraPitch=0,settle=0;
 function fallback(){failed=true;playing=spin=false;cancelAnimationFrame(raf);renderer?.dispose();host.querySelector('canvas')?.remove();q('.connection-loading')?.remove();stage.classList.add('is-fallback');q('[data-channel-status]').textContent='WATCH THE ORIGINAL FILM';q('.connection-fallback-link').hidden=false;qa('button,input').forEach(b=>b.disabled=true);}
 try{
  const [asset,wordmark,catalog]=await Promise.all(['/assets/e3259bm-mesh.json','/assets/connector-wordmark.json','/assets/parts/catalog.json'].map(async url=>{const response=await fetch(url);if(!response.ok)throw new Error('Connector unavailable');return response.json();}));
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;renderer.shadowMap.enabled=true;renderer.shadowMap.autoUpdate=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;host.append(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,12000);scene.add(new THREE.HemisphereLight(0xf2f1e9,0x3a4047,.72));
  const key=new THREE.DirectionalLight(0xfff0da,3.1);
  key.castShadow=true;key.shadow.autoUpdate=false;key.shadow.needsUpdate=true;key.shadow.mapSize.set(2048,2048);key.shadow.bias=-.0001;key.shadow.normalBias=.08;key.shadow.radius=3;key.shadow.intensity=.95;
  scene.add(key,key.target);
  const rim=new THREE.DirectionalLight(0xe4eaf4,.8);rim.position.set(130,80,-100);scene.add(rim);
  const fill=new THREE.DirectionalLight(0xe4eaf4,.3);fill.position.set(20,60,120);scene.add(fill);
  const room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;scene.environmentIntensity=.35;room.dispose();pmrem.dispose();
  const assembly=new THREE.Group();scene.add(assembly);const connector=new THREE.Group();assembly.add(connector);
  const inspection=new THREE.Group();scene.add(inspection);const specimens=new Map();
  for(const id of ['e900bp','e3259bm','e910bp']){const part=catalog.parts.find(p=>p.id===id),model=buildPart(THREE,part,{asset,wordmark}),bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());model.position.sub(bounds.getCenter(new THREE.Vector3()));model.visible=false;inspection.add(model);const mounted=buildPart(THREE,part,{asset,wordmark}),profile=connectionProfile(part);mounted.position.y=profile.mountOffset;mounted.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true;});specimens.set(id,{part,model,mounted,profile,radius:size.length()/2});}
  let inspecting=true,selected=specimens.get('e900bp');selected.model.visible=true;root.dataset.homePart='e900bp';
  initModelPreviews(root,{paused,catalog});
  function identify(sku){q('[data-channel-sku]').textContent=sku;q('.connection-watermark').textContent=sku;host.setAttribute('aria-label',`${sku} interactive 3D model. Drag to rotate or use the view controls.`);}
  function inspect(id){const item=specimens.get(id);if(!item)return;specimens.forEach(s=>s.model.visible=false);selected=item;item.model.visible=true;inspecting=true;playing=false;spin=!paused;time=0;extraYaw=extraPitch=0;settle=0;chapter=-1;identify(item.part.sku);root.dataset.homePart=id;root.dataset.channelMode='inspect';q('[data-channel-status]').textContent=item.part.basis.toUpperCase()+' / LIVE 3D';qa('[data-home-part]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.homePart===id)));updateUI();request();}
  qa('[data-home-part]').forEach(b=>b.addEventListener('click',()=>{inspect(b.dataset.homePart);if(innerWidth<=700)stage.scrollIntoView({behavior:paused?'instant':'smooth',block:'start'});}));
  function assemblyMode(){if(inspecting)configureAssembly();inspecting=false;identify(selected.part.sku);q('[data-channel-status]').textContent=selected.part.sku+' / ASSEMBLY';root.dataset.homePart=selected.part.id;root.dataset.channelMode='assembly';shadowTime=-1;chapter=-1;}
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const ctx=canvas.getContext('2d');ctx.fillStyle='#d9d0bd';ctx.fillRect(0,0,512,512);let seed=173;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};for(let i=0;i<500;i++){const y=rnd()*512;ctx.strokeStyle=`rgba(80,69,50,${rnd()*.018})`;ctx.lineWidth=.2+rnd();ctx.beginPath();for(let x=0;x<=512;x+=8){const yy=y+Math.sin(x/80+i)*1.5;x?ctx.lineTo(x,yy):ctx.moveTo(x,yy);}ctx.stroke();}const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  const wood=new THREE.MeshStandardMaterial({map:texture,color:0xe2c8a1,roughness:.85,transparent:true,depthWrite:false});
  // A matte slate receiver separates the channel from the silver hardware.
  const receiverWood=new THREE.MeshStandardMaterial({color:0x273a50,roughness:.82,transparent:true,depthWrite:false});
  const carrier=new THREE.Group(),receiver=new THREE.Group();assembly.add(carrier);scene.add(receiver);
  const edgeMat=new THREE.LineBasicMaterial({color:0x4c5054,transparent:true,opacity:.09,depthWrite:false});
  function replace(group,geometries,material){for(const child of [...group.children]){group.remove(child);child.geometry.dispose();}for(const g of geometries){const mesh=new THREE.Mesh(g,material);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);group.add(new THREE.LineSegments(new THREE.EdgesGeometry(g,35),edgeMat));}}

  // Cache static local bounds; each frame only translates these small boxes.
  const connectorBounds=new THREE.Box3(),carrierBounds=new THREE.Box3(),receiverBounds=new THREE.Box3();
  function configureAssembly(){
   connector.clear();connector.position.y=0;connector.add(selected.mounted);
   const detail=createConnectionWood(THREE,{section:true,...selected.profile});replace(carrier,detail.carrier,wood);replace(receiver,detail.receiver,receiverWood);
   // Bounds must be local: selection may happen after the previous joint slid away.
   assembly.position.set(0,0,0);receiver.position.set(0,0,0);scene.updateMatrixWorld(true);
   connectorBounds.setFromObject(connector);carrierBounds.setFromObject(carrier);receiverBounds.setFromObject(receiver);
   root.dataset.assemblyPart=selected.part.id;
  }
  configureAssembly();
  const detailBounds=new THREE.Box3(),scratchBounds=new THREE.Box3(),offset=new THREE.Vector3(),target=new THREE.Vector3(),fitTarget=new THREE.Vector3(),direction=new THREE.Vector3();
  const viewNote=q('[data-channel-view-note]'),timeLabel=q('[data-channel-time]');
  let distance=105,ready=false,chapter=-1,shadowTime=-1,previousNote='',previousSecond=-1;
  function request(){if(!raf&&!failed&&visible&&!document.hidden){last=0;raf=requestAnimationFrame(render);}}
  function updateUI(){play.innerHTML=playing?'Ⅱ <span>Pause sequence</span>':time>=DURATION?'↺ <span>Replay connection</span>':'▶ <span>'+(time>0?'Continue sequence':'Play this connection')+'</span>';play.setAttribute('aria-label',playing?'Pause connection sequence':time>=DURATION?'Replay connection sequence':'Play connection sequence');spinButton.textContent=spin?'Pause rotation':'Rotate slowly';spinButton.setAttribute('aria-pressed',String(spin));}
  function jump(value){if(Number(value)===0){inspect(selected.part.id);return;}assemblyMode();time=clamp(value,0,DURATION);playing=false;spin=false;extraYaw=extraPitch=0;settle=1;updateUI();request();}
  qa('[data-channel-step]').forEach(b=>b.addEventListener('click',()=>jump(Number(b.dataset.channelStep))));
  qa('[data-channel-jump]').forEach(b=>b.addEventListener('click',()=>jump(Number(b.dataset.channelJump))));
  function start(){if(inspecting)assemblyMode();if(playing){playing=false;}else{if(time>=DURATION)time=0;playing=true;spin=false;settle=1;}updateUI();request();}
  play.addEventListener('click',start);q('[data-channel-start]').addEventListener('click',()=>{if(!playing)start();if(innerWidth<=700)stage.scrollIntoView({behavior:paused?'instant':'smooth',block:'start'});});
  q('[data-channel-reset]').addEventListener('click',()=>inspect(selected.part.id));
  spinButton.addEventListener('click',()=>{spin=!spin;playing=false;updateUI();request();});
  slider.addEventListener('input',()=>jump(Number(slider.value)));
  qa('[data-channel-orbit]').forEach(b=>b.addEventListener('click',()=>{playing=spin=false;extraYaw+=Number(b.dataset.channelOrbit)*.32;updateUI();request();}));
  let prevX=0,prevY=0;
  renderer.domElement.addEventListener('pointerdown',e=>{drag=true;prevX=e.clientX;prevY=e.clientY;playing=spin=false;settle=0;renderer.domElement.setPointerCapture(e.pointerId);updateUI();});
  renderer.domElement.addEventListener('pointermove',e=>{if(!drag)return;extraYaw-=(e.clientX-prevX)*.008;extraPitch=clamp(extraPitch+(e.clientY-prevY)*.004,-.4,.85);prevX=e.clientX;prevY=e.clientY;request();});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(name,()=>drag=false);
  function render(now){raf=0;if(!visible||document.hidden||failed)return;const dt=last?Math.min((now-last)/1000,.15):.016;last=now;if(playing){time=Math.min(DURATION,time+dt);if(time>=DURATION){playing=false;updateUI();}}
   const s=connectionFrame(time);if(spin&&!drag)extraYaw+=dt*.18;
   if(settle){const snap=paused&&!playing;extraYaw=snap?0:THREE.MathUtils.damp(extraYaw,0,5,dt);extraPitch=snap?0:THREE.MathUtils.damp(extraPitch,0,5,dt);if(Math.abs(extraYaw)+Math.abs(extraPitch)<.001)settle=0;}
   assembly.position.set(s.carrierX,s.carrierY,0);connector.position.y=s.connectorY;
   carrier.visible=s.woodOpacity>.001;wood.opacity=s.woodOpacity;wood.depthWrite=true;
   receiver.visible=s.receiverOpacity>.001;receiverWood.opacity=s.receiverOpacity;receiverWood.depthWrite=true;receiver.position.y=s.receiverY;
   // Stay with the same locked joint. Only the camera changes in the final shot.
   const zoom=s.zoom,wide=s.cameraFrame;
   const closeY=THREE.MathUtils.lerp(s.carrierY+36,(s.carrierY+62)/2,s.receiverFrame);
   target.set(THREE.MathUtils.lerp(s.carrierX*.5,-14,zoom),THREE.MathUtils.lerp(THREE.MathUtils.lerp(4,closeY,wide),31,zoom),-9*zoom);
   const angle=yaw+extraYaw+.22*zoom,up=pitch+extraPitch+.10*zoom;direction.set(Math.sin(angle),up,Math.cos(angle));
   fitTarget.copy(target);fitTarget.y=closeY;
   offset.set(s.carrierX,s.carrierY+s.connectorY,0);detailBounds.copy(connectorBounds).translate(offset);
   offset.set(s.carrierX,s.carrierY,0);detailBounds.union(scratchBounds.copy(carrierBounds).translate(offset));
   const mountedFit=fitPerspectiveDistance(THREE,detailBounds,fitTarget,direction,camera.fov,camera.aspect)/direction.length();
   offset.set(0,s.receiverY,0);detailBounds.union(scratchBounds.copy(receiverBounds).translate(offset));
   const receivingFit=fitPerspectiveDistance(THREE,detailBounds,fitTarget,direction,camera.fov,camera.aspect)/direction.length();
   const fitted=THREE.MathUtils.lerp(mountedFit,receivingFit,s.receiverFrame);
   // Make room before either piece of wood fades in; no visibility-triggered jumps.
   const nearDistance=THREE.MathUtils.lerp(distance,Math.max(distance*2.6,fitted),wide);
   const d=nearDistance*(1+.12*zoom);
   camera.position.copy(target).addScaledVector(direction,d);camera.lookAt(target);
   // A tight close-up frustum preserves the small channel and dowel contact shadows.
   // Orbiting moves only the camera: its shadow map can be reused unchanged.
   const shadowFrame=Math.min(time,10.7);
   if(shadowTime!==shadowFrame){
   const extent=THREE.MathUtils.lerp(45,145,s.cameraFrame),lightDistance=extent*2.5;
   key.target.position.set(0,THREE.MathUtils.lerp(6,35,s.cameraFrame),0);
   key.position.copy(key.target.position).add(new THREE.Vector3(-.65*lightDistance,lightDistance,.8*lightDistance));
   Object.assign(key.shadow.camera,{left:-extent,right:extent,top:extent,bottom:-extent,near:lightDistance-extent*1.5,far:lightDistance+extent*1.5});key.shadow.camera.updateProjectionMatrix();
   key.shadow.bias=-.0003;
   key.shadow.normalBias=.08;
   key.shadow.needsUpdate=true;shadowTime=shadowFrame;
   }
   assembly.visible=receiver.visible=!inspecting;
   if(!inspecting){carrier.visible=s.woodOpacity>.001;receiver.visible=s.receiverOpacity>.001;}
   inspection.visible=inspecting;
   if(inspecting){inspection.rotation.set(extraPitch,extraYaw,0);camera.position.set(Math.sin(yaw)*selected.radius*4,.27*selected.radius*4,Math.cos(yaw)*selected.radius*4);camera.position.multiplyScalar(1/Math.min(camera.aspect,1));camera.lookAt(0,0,0);}
   q('[data-channel-after]').hidden=inspecting||time<DURATION;
   q('.connection-caption').hidden=!inspecting&&time>=DURATION;
   renderer.render(scene,camera);
   if(!ready){ready=true;q('.connection-loading')?.remove();q('.connection-fallback')?.remove();root.dataset.channelReady='true';q('[data-channel-status]').textContent='REFERENCE MODEL / LIVE 3D';}
   if(chapter!==s.chapter){chapter=s.chapter;q('[data-channel-phase]').textContent=(inspecting||chapter===0)?selected.part.sku+' / '+selected.part.material.toUpperCase():PHASES[chapter][0];q('[data-channel-caption]').textContent=(inspecting||chapter===0)?selected.part.name+'. Drag to see every angle.':PHASES[chapter][1];qa('[data-channel-step]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===chapter)));}
   const note=inspecting?'REFERENCE MODEL':s.zoom>.01?'LOCKED JOINT / CUTAWAY':s.section?'CUTAWAY / ILLUSTRATIVE ROUTING':'CAD + PHOTO-BASED DETAIL';if(note!==previousNote){viewNote.textContent=note;previousNote=note;}
   if(document.activeElement!==slider)slider.value=String(time);const second=Math.floor(time);if(second!==previousSecond){timeLabel.textContent=`0:${second.toString().padStart(2,'0')} / 0:16`;previousSecond=second;}root.dataset.channelTime=time.toFixed(2);root.dataset.channelPlaying=String(playing);root.dataset.channelYaw=(yaw+extraYaw+.22*s.zoom).toFixed(4);
   if(playing||spin||settle)raf=requestAnimationFrame(render);
  }
  function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();distance=Math.max(92,74/camera.aspect);request();}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){last=0;request();}else{cancelAnimationFrame(raf);raf=0;}},{rootMargin:'80px'}).observe(stage);
  document.addEventListener('visibilitychange',()=>{last=0;if(!document.hidden)request();});
  window.addEventListener('studio-motion',e=>{paused=e.detail.paused;if(paused){playing=spin=false;settle=0;}updateUI();request();});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback();});
  root.dataset.channelMode='inspect';identify(selected.part.sku);updateUI();resize();request();
 }catch(error){console.warn('Connector preview unavailable:',error);fallback();}
}
