import * as THREE from '/vendor/three.module.js';
import {DURATION,clamp,ease,connectionFrame,createConnectionWood} from './channel-geometry.js';
const PHASES=[['00 / THE CHANNEL LOCK','A little green part. A world of possibility.'],['01 / PUSH INTO THE WOOD','The two dowel ends seat into the panel.'],['02 / ENTER THE CHANNEL','The head enters the wider receiving pocket.'],['03 / SLIDE TO CONNECT','A short slide brings the head beneath the retaining edges.'],['04 / SEE THE POSSIBILITIES','One small connection. The start of a whole cabinet.']];
export async function initChannelHome(root,{paused=false}={}){
 const q=s=>root.querySelector(s),qa=s=>[...root.querySelectorAll(s)],host=q('[data-channel-viewport]'),stage=q('.connection-stage'),play=q('[data-channel-play]'),slider=q('#connection-progress'),spinButton=q('[data-channel-spin]');
 let renderer,raf=0,failed=false,visible=true,playing=false,spin=!paused,time=0,last=0,drag=false,yaw=.5,pitch=.27,extraYaw=0,extraPitch=0,settle=0;
 function fallback(){failed=true;playing=spin=false;cancelAnimationFrame(raf);renderer?.dispose();host.querySelector('canvas')?.remove();q('.connection-loading')?.remove();stage.classList.add('is-fallback');q('[data-channel-status]').textContent='WATCH THE ORIGINAL FILM';q('.connection-fallback-link').hidden=false;qa('button,input').forEach(b=>b.disabled=true);}
 try{
  const response=await fetch('/assets/e3259bm-mesh.json');if(!response.ok)throw new Error('Connector unavailable');const asset=await response.json();
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;host.append(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,12000);scene.add(new THREE.HemisphereLight(0xf5ffe7,0x3b502b,2.5));
  const key=new THREE.DirectionalLight(0xfff4da,3.3);key.position.set(-180,220,160);scene.add(key);const rim=new THREE.DirectionalLight(0xd4ffaa,3);rim.position.set(130,80,-100);scene.add(rim);const fill=new THREE.DirectionalLight(0xffffff,1.4);fill.position.set(20,-15,120);scene.add(fill);
  const green=new THREE.MeshPhysicalMaterial({color:0x83df35,metalness:.12,roughness:.27,clearcoat:.5,clearcoatRoughness:.3});
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(asset.positions,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(asset.normals,3));geo.setIndex(asset.indices);geo.rotateX(Math.PI/2);geo.computeBoundingBox();
  const assembly=new THREE.Group();scene.add(assembly);const connector=new THREE.Mesh(geo,green);assembly.add(connector);
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const ctx=canvas.getContext('2d');ctx.fillStyle='#c7a573';ctx.fillRect(0,0,512,512);let seed=173;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};for(let i=0;i<1150;i++){const y=rnd()*512;ctx.strokeStyle=`rgba(71,41,17,${rnd()*.15})`;ctx.lineWidth=.2+rnd();ctx.beginPath();for(let x=0;x<=512;x+=8){const yy=y+Math.sin(x/80+i)*1.5;x?ctx.lineTo(x,yy):ctx.moveTo(x,yy);}ctx.stroke();}const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  const wood=new THREE.MeshStandardMaterial({map:texture,color:0xd9c49f,roughness:.7,transparent:true});const receiverWood=wood.clone();receiverWood.color.set(0xb09a77);const cabinetWood=wood.clone();cabinetWood.transparent=false;
  const carrier=new THREE.Group(),receiver=new THREE.Group(),cabinet=new THREE.Group();assembly.add(carrier);scene.add(receiver,cabinet);
  const edgeMat=new THREE.LineBasicMaterial({color:0x543d23,transparent:true,opacity:.2});
  let previousGrowth=-1,previousSection=null;
  function replace(group,geometries,material){for(const child of [...group.children]){group.remove(child);child.geometry.dispose();}for(const g of geometries){group.add(new THREE.Mesh(g,material));group.add(new THREE.LineSegments(new THREE.EdgesGeometry(g,35),edgeMat));}}
  function rebuild(growth,section){const g=createConnectionWood(THREE,{growth,section});replace(carrier,g.carrier,wood);replace(receiver,g.receiver,receiverWood);previousGrowth=growth;previousSection=section;}
  const box=(w,h,d,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),cabinetWood);m.position.set(x,y,z);cabinet.add(m);return m;};
  const left=box(18,600,380,-342,300,181),right=box(18,600,380,280,300,181),top=box(640,18,380,-31,609,181),shelf=box(604,18,360,-31,300,181);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(3500,3500),new THREE.MeshBasicMaterial({color:0x172112,transparent:true,opacity:.35}));floor.rotation.x=-Math.PI/2;floor.position.set(-31,-20,150);scene.add(floor);
  let distance=105,ready=false,chapter=-1;
  function request(){if(!raf&&!failed&&visible&&!document.hidden)raf=requestAnimationFrame(render);}
  function updateUI(){play.innerHTML=playing?'Ⅱ <span>Pause sequence</span>':time>=DURATION?'↺ <span>Replay connection</span>':'▶ <span>'+(time>0?'Continue sequence':'Play the connection')+'</span>';play.setAttribute('aria-label',playing?'Pause connection sequence':time>=DURATION?'Replay connection sequence':'Play connection sequence');spinButton.textContent=spin?'Pause rotation':'Rotate slowly';spinButton.setAttribute('aria-pressed',String(spin));}
  function jump(value){time=clamp(value,0,DURATION);playing=false;spin=false;extraYaw=extraPitch=0;settle=1;updateUI();request();}
  qa('[data-channel-step]').forEach(b=>b.addEventListener('click',()=>jump(Number(b.dataset.channelStep))));
  qa('[data-channel-jump]').forEach(b=>b.addEventListener('click',()=>jump(Number(b.dataset.channelJump))));
  function start(){if(playing){playing=false;}else{if(time>=DURATION)time=0;playing=true;spin=false;settle=1;}updateUI();request();}
  play.addEventListener('click',start);q('[data-channel-start]').addEventListener('click',()=>{if(!playing)start();if(innerWidth<=700)stage.scrollIntoView({behavior:paused?'instant':'smooth',block:'start'});});
  q('[data-channel-reset]').addEventListener('click',()=>{time=0;playing=false;spin=!paused;yaw=.5;pitch=.27;extraYaw=extraPitch=0;settle=0;updateUI();request();});
  spinButton.addEventListener('click',()=>{spin=!spin;playing=false;updateUI();request();});
  slider.addEventListener('input',()=>jump(Number(slider.value)));
  qa('[data-channel-orbit]').forEach(b=>b.addEventListener('click',()=>{playing=spin=false;extraYaw+=Number(b.dataset.channelOrbit)*.32;updateUI();request();}));
  let prevX=0,prevY=0;
  renderer.domElement.addEventListener('pointerdown',e=>{drag=true;prevX=e.clientX;prevY=e.clientY;playing=spin=false;settle=0;renderer.domElement.setPointerCapture(e.pointerId);updateUI();});
  renderer.domElement.addEventListener('pointermove',e=>{if(!drag)return;extraYaw-=(e.clientX-prevX)*.008;extraPitch=clamp(extraPitch+(e.clientY-prevY)*.004,-.4,.85);prevX=e.clientX;prevY=e.clientY;request();});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(name,()=>drag=false);
  function render(now){raf=0;if(!visible||document.hidden||failed)return;const dt=last?Math.min((now-last)/1000,.05):.016;last=now;if(playing){time=Math.min(DURATION,time+dt);if(time>=DURATION){playing=false;updateUI();}}
   const s=connectionFrame(time);if(spin&&!drag)extraYaw+=dt*.18;
   if(settle){const snap=paused&&!playing;extraYaw=snap?0:THREE.MathUtils.damp(extraYaw,0,5,dt);extraPitch=snap?0:THREE.MathUtils.damp(extraPitch,0,5,dt);if(Math.abs(extraYaw)+Math.abs(extraPitch)<.001)settle=0;}
   if(Math.abs(s.growth-previousGrowth)>.004||s.section!==previousSection||(s.growth===1&&previousGrowth!==1))rebuild(s.growth,s.section);
   assembly.position.set(s.carrierX,s.carrierY,0);connector.position.y=s.connectorY;carrier.visible=s.woodOpacity>.001;wood.opacity=s.woodOpacity;receiver.visible=s.receiverOpacity>.001;receiverWood.opacity=s.receiverOpacity;receiver.position.y=s.receiverY;
   const reveal=ease((s.growth-.25)/.75);cabinet.visible=reveal>.001;cabinet.scale.y=Math.max(.001,reveal);left.position.x=-342-140*(1-reveal);right.position.x=280+140*(1-reveal);top.position.y=609+160*(1-reveal);shelf.position.z=181+110*(1-reveal);floor.visible=s.growth>.4;
   // One continuous camera move, from millimetres to the complete cabinet.
   const wide=ease((time-.35)/1.9),zoom=s.growth;const nearDistance=THREE.MathUtils.lerp(distance,distance*2.6,wide);const farDistance=Math.max(1720,1320/camera.aspect);const d=THREE.MathUtils.lerp(nearDistance,farDistance,zoom);
   const closeY=THREE.MathUtils.lerp(4,THREE.MathUtils.lerp(s.carrierY+36,(s.carrierY+62)/2,s.receiverOpacity),s.woodOpacity);
   const target=new THREE.Vector3(THREE.MathUtils.lerp(s.carrierX*.5,-31,zoom),THREE.MathUtils.lerp(closeY,285,zoom),180*zoom);
   const angle=yaw+extraYaw+.1*zoom,up=pitch+extraPitch;camera.position.set(target.x+Math.sin(angle)*d,target.y+d*up,target.z+Math.cos(angle)*d);camera.lookAt(target);
   renderer.render(scene,camera);
   if(!ready){ready=true;q('.connection-loading')?.remove();q('.connection-fallback').hidden=true;root.dataset.channelReady='true';q('[data-channel-status]').textContent='ACTUAL CAD / LIVE 3D';}
   if(chapter!==s.chapter){chapter=s.chapter;q('[data-channel-phase]').textContent=PHASES[chapter][0];q('[data-channel-caption]').textContent=PHASES[chapter][1];qa('[data-channel-step]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===chapter)));}
   q('[data-channel-view-note]').textContent=s.section?'CUTAWAY / ILLUSTRATIVE ROUTING':s.growth>.01?'ILLUSTRATIVE CABINET':'ACTUAL CONNECTOR CAD';
   if(document.activeElement!==slider)slider.value=String(time);q('[data-channel-time]').textContent=`0:${Math.floor(time).toString().padStart(2,'0')} / 0:16`;root.dataset.channelTime=time.toFixed(2);root.dataset.channelPlaying=String(playing);root.dataset.channelYaw=(yaw+extraYaw).toFixed(4);
   if(playing||spin||settle)request();
  }
  function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();distance=Math.max(92,74/camera.aspect);request();}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){last=0;request();}else{cancelAnimationFrame(raf);raf=0;}},{rootMargin:'80px'}).observe(stage);
  document.addEventListener('visibilitychange',()=>{last=0;if(!document.hidden)request();});
  window.addEventListener('studio-motion',e=>{paused=e.detail.paused;if(paused){playing=spin=false;settle=0;}updateUI();request();});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback();});
  updateUI();resize();request();
 }catch(error){console.warn('Connector preview unavailable:',error);fallback();}
}
