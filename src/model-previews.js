import * as THREE from '/vendor/three.module.js';
import {RoomEnvironment} from '/vendor/RoomEnvironment.js';
import {buildPart,disposePart} from './parts-geometry.js';

// One shared WebGL renderer paints visible mini canvases. No context per card.
export async function initModelPreviews(root,{paused=false,catalog}={}){
 const hosts=[...root.querySelectorAll('[data-model-preview]')];if(!hosts.length)return;
 const cache=new Map();const asset=url=>{if(!cache.has(url))cache.set(url,fetch(url).then(r=>{if(!r.ok)throw Error('Preview unavailable');return r.json();}));return cache.get(url);};
 let renderer,environment,raf=0,last=0,angle=0;
 const entries=new Map();
 try{
  catalog??=await asset('/assets/parts/catalog.json');
  renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setSize(256,256);renderer.setPixelRatio(1);renderer.toneMapping=THREE.ACESFilmicToneMapping;
  const room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer);environment=pmrem.fromScene(room,.04);room.dispose();pmrem.dispose();
 }catch{hosts.forEach(h=>h.textContent='Open 3D viewer ↗');return;}
 function request(){if(!raf&&!document.hidden&&[...entries.values()].some(e=>e.visible&&e.pivot))raf=requestAnimationFrame(draw);}
 function draw(now){raf=0;const dt=last?Math.min((now-last)/1000,.07):0;last=now;if(!paused)angle+=dt*.16;
  for(const e of entries.values())if(e.visible&&e.pivot){e.pivot.rotation.set(.25,.5+angle,0);renderer.render(e.scene,e.camera);e.ctx.clearRect(0,0,256,256);e.ctx.drawImage(renderer.domElement,0,0);e.host.dataset.previewReady='true';}
  if(!paused)request();
 }
 async function load(e){if(e.loading)return;e.loading=true;
  try{const p=catalog.parts.find(p=>p.id===e.host.dataset.modelPreview);if(!p?.model)throw Error('No model');
   const [data,wordmark]=await Promise.all([p.model.asset?asset(p.model.asset):null,asset('/assets/connector-wordmark.json')]);
   const object=buildPart(THREE,p,{asset:data,wordmark}),box=new THREE.Box3().setFromObject(object),size=box.getSize(new THREE.Vector3());object.position.sub(box.getCenter(new THREE.Vector3()));
   e.scene=new THREE.Scene();e.scene.environment=environment.texture;e.scene.environmentIntensity=.45;e.pivot=new THREE.Group();e.pivot.add(object);e.scene.add(e.pivot);
   e.scene.add(new THREE.HemisphereLight(0xeaf2df,0x233126,.55));const light=new THREE.DirectionalLight(0xfff2df,3);light.position.set(-30,45,60);e.scene.add(light);const rim=new THREE.DirectionalLight(0xcce2ff,1.2);rim.position.set(30,20,-20);e.scene.add(rim);
   e.camera=new THREE.PerspectiveCamera(32,1,.1,1000);e.camera.position.z=size.length()*.5/Math.sin(16*Math.PI/180)*1.16;
   const canvas=document.createElement('canvas');canvas.width=canvas.height=256;canvas.setAttribute('aria-hidden','true');e.ctx=canvas.getContext('2d');e.host.replaceChildren(canvas);request();
  }catch{e.host.textContent='Open model ↗';e.host.dataset.previewReady='fallback';}
 }
 const observer=new IntersectionObserver(changes=>{for(const item of changes){const e=entries.get(item.target);e.visible=item.isIntersecting;if(e.visible)load(e);}last=0;request();},{rootMargin:'100px'});
 for(const host of hosts){entries.set(host,{host,visible:false});observer.observe(host);}
 document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(raf);raf=0;}else request();});
 window.addEventListener('studio-motion',e=>{paused=e.detail.paused;last=0;request();});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);raf=0;observer.disconnect();});
 return ()=>{cancelAnimationFrame(raf);observer.disconnect();entries.forEach(e=>{if(e.pivot)disposePart(e.pivot);});environment.dispose();renderer.dispose();};
}
