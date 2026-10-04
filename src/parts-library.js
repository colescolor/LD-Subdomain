import * as THREE from '/vendor/three.module.js';
import {RoomEnvironment} from '/vendor/RoomEnvironment.js';
import {buildPart,disposePart} from './parts-geometry.js';

export async function initPartsLibrary(root,{paused=false}={}){
 const q=s=>root.querySelector(s),qa=s=>[...root.querySelectorAll(s)],host=q('[data-part-canvas]'),inspector=q('[data-part-inspector]'),reference=q('[data-part-reference]'),status=q('[data-part-status]');
 const fetchJSON=async url=>{const r=await fetch(url);if(!r.ok)throw new Error('Part asset unavailable');return r.json();};
 let catalog;try{catalog=await fetchJSON('/assets/parts/catalog.json');}catch{status.textContent='The library could not load. Please refresh to try again.';return;}
 const parts=catalog.parts,byId=new Map(parts.map(p=>[p.id,p])),cards=qa('[data-part-card]');
 let selected=null,scope='3d',category='All',photo=false,renderer=null,scene,camera,pivot,current=null,envTarget,raf=0,last=0,visible=true,spin=!paused,yaw=.45,pitch=.3,zoom=1,radius=25,requestId=0,drag=false,previousX=0,previousY=0;
 const cache=new Map();const asset=url=>{if(!cache.has(url))cache.set(url,fetchJSON(url).catch(e=>{cache.delete(url);throw e;}));return cache.get(url);};
 const controls=qa('.part-orbit-controls button');
 function filter(){
  const query=q('[data-parts-search]').value.toLowerCase().trim().replace(/[^a-z0-9]/g,'');let count=0;
  for(const card of cards){const match=(!query||card.dataset.search.replace(/[^a-z0-9]/g,'').includes(query))&&(category==='All'||card.dataset.category===category)&&(scope==='all'||card.dataset.ready==='true');card.hidden=!match;if(match)count++;}
  q('[data-parts-count]').textContent=`${count} ${count===1?'part':'parts'}${scope==='3d'?' with interactive 3D':''}`;q('.parts-empty').hidden=count>0;
  qa('[data-parts-scope]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.partsScope===scope)));
  qa('[data-parts-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.partsCategory===category)));
 }
 q('[data-parts-search]').addEventListener('input',filter);
 qa('[data-parts-scope]').forEach(b=>b.addEventListener('click',()=>{scope=b.dataset.partsScope;filter();}));
 qa('[data-parts-category]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.partsCategory;if(!parts.some(p=>p.category===category&&p.model)&&category!=='All')scope='all';filter();}));
 q('[data-parts-clear]').addEventListener('click',()=>{q('[data-parts-search]').value='';scope='all';category='All';filter();});
 function request(){if(!raf&&visible&&!document.hidden&&renderer&&current&&!photo)raf=requestAnimationFrame(render);}
 function updateButtons(){
  q('[data-part-spin]').textContent=spin?'Pause spin':'Spin slowly';q('[data-part-spin]').setAttribute('aria-pressed',String(spin));
  controls.forEach(b=>b.disabled=!current||photo);
  qa('[data-part-view]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.partView===(photo?'photo':'3d')));b.disabled=b.dataset.partView==='3d'?!selected?.model||!renderer||!current:!selected?.photo;});
 }
 function setView(value){
  photo=value==='photo';inspector.classList.toggle('is-photo',photo);reference.hidden=!photo||!selected?.photo;
  status.hidden=!!current&&!photo||photo&&!!selected?.photo;
  if(photo&&!selected?.photo)status.textContent='Verified product photo not yet available.';
  cancelAnimationFrame(raf);raf=0;last=0;updateButtons();request();
 }
 function render(now){raf=0;if(!visible||document.hidden||photo||!current)return;const dt=last?Math.min((now-last)/1000,.06):0;last=now;if(spin&&!drag)yaw+=dt*.18;pivot.rotation.set(pitch,yaw,0);
  camera.position.set(0,0,radius/Math.sin(camera.fov*Math.PI/360)*1.17/Math.min(camera.aspect,1)/zoom);camera.lookAt(0,0,0);renderer.render(scene,camera);
  root.dataset.partYaw=yaw.toFixed(3);root.dataset.partZoom=String(zoom);if(spin)request();
 }
 function resize(){if(!renderer)return;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();request();}
 function initializeRenderer(){
  try{
   renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;host.append(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
   scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(32,1,.1,1000);pivot=new THREE.Group();scene.add(pivot);
   const environment=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer);envTarget=pmrem.fromScene(environment,.04);scene.environment=envTarget.texture;scene.environmentIntensity=.38;environment.dispose();pmrem.dispose();
   scene.add(new THREE.HemisphereLight(0xeaf2df,0x233126,.35));
   for(const [color,intensity,position]of [[0xfff2df,2.4,[-30,45,60]],[0xd5e6ff,1,[40,15,-20]],[0xffffff,.25,[0,-25,40]]]){const light=new THREE.DirectionalLight(color,intensity);light.position.set(...position);scene.add(light);}
   renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();requestId++;cancelAnimationFrame(raf);raf=0;renderer=null;setView('photo');status.hidden=false;status.textContent='3D is unavailable. The product reference is shown instead.';});
   new ResizeObserver(resize).observe(host);
   new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible){last=0;request();}else{cancelAnimationFrame(raf);raf=0;}},{rootMargin:'80px'}).observe(inspector);
   document.addEventListener('visibilitychange',()=>{last=0;if(!document.hidden)request();});
   resize();
  }catch(e){console.warn('Parts viewer unavailable:',e);renderer?.dispose();renderer=null;host.replaceChildren();}
 }
 initializeRenderer();
 async function select(id,{scroll=false,history=true}={}){
  const part=byId.get(id);if(!part)return;const token=++requestId;selected=part;root.dataset.partId=id;root.dataset.partReady='loading';q('[data-part-copy-status]').textContent='';
  if(history)window.history.replaceState(null,'',`#${encodeURIComponent(id)}`);
  q('[data-part-family]').textContent=part.category.toUpperCase();q('[data-part-basis]').textContent=part.basis.toUpperCase();q('[data-part-sku]').textContent=part.sku||'Size-specific SKU';q('[data-part-name]').textContent=part.name;q('[data-part-note]').textContent=part.note;q('[data-part-material]').textContent=part.material||part.category;q('[data-part-store]').href=part.source;q('[data-part-watermark]').textContent=part.sku||'LOCKDOWEL';q('[data-part-copy]').disabled=!part.sku;
  host.setAttribute('aria-label',`${part.sku||part.name} 3D model. Drag to rotate or use arrow keys.`);
  reference.src=part.photo||'/assets/parts/store-01.jpg';reference.alt=`${part.sku||''} ${part.name}: official store reference`;
  qa('[data-part-select]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.partSelect===id)));
  cancelAnimationFrame(raf);raf=0;last=0;if(current){pivot.remove(current);disposePart(current);current=null;}
  yaw=.45;pitch=.3;zoom=1;
  if(scroll&&innerWidth<=700)inspector.scrollIntoView({behavior:paused?'instant':'smooth',block:'start'});
  if(!part.model||!renderer){setView('photo');root.dataset.partReady=part.model?'fallback':'reference';if(!renderer&&part.model){status.hidden=false;status.textContent='3D is unavailable. Product photo shown.';}return;}
  setView('3d');status.hidden=false;status.textContent=`Loading ${part.sku}…`;
  try{
   const [data,wordmark]=await Promise.all([part.model.asset?asset(part.model.asset):null,asset('/assets/connector-wordmark.json')]);
   if(token!==requestId)return;
   const object=buildPart(THREE,part,{asset:data,wordmark}),bounds=new THREE.Box3().setFromObject(object),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),scale=42/Math.max(size.x,size.y,size.z);
   object.position.sub(center);const normalized=new THREE.Group();normalized.add(object);normalized.scale.setScalar(scale);radius=size.length()*.5*scale;current=normalized;pivot.add(current);
   root.dataset.partReady='true';status.hidden=true;updateButtons();resize();request();
  }catch(e){if(token!==requestId)return;console.warn('Part model unavailable:',e);setView('photo');status.hidden=false;status.textContent='Model unavailable. Product photo shown.';root.dataset.partReady='fallback';}
 }
 qa('[data-part-select]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.partSelect,{scroll:true})));
 qa('[data-part-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.partView)));
 q('[data-part-spin]').addEventListener('click',()=>{spin=!spin;last=0;updateButtons();request();});
 q('[data-part-reset]').addEventListener('click',()=>{yaw=.45;pitch=.3;zoom=1;request();});
 qa('[data-part-orbit]').forEach(b=>b.addEventListener('click',()=>{spin=false;yaw+=Number(b.dataset.partOrbit)*.3;updateButtons();request();}));
 qa('[data-part-zoom]').forEach(b=>b.addEventListener('click',()=>{zoom=THREE.MathUtils.clamp(zoom+Number(b.dataset.partZoom)*.12,.65,1.45);request();}));
 host.addEventListener('pointerdown',e=>{if(!current||photo)return;drag=true;spin=false;previousX=e.clientX;previousY=e.clientY;host.setPointerCapture(e.pointerId);updateButtons();});
 host.addEventListener('pointermove',e=>{if(!drag)return;yaw+=(e.clientX-previousX)*.008;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-previousY)*.006,-1.3,1.3);previousX=e.clientX;previousY=e.clientY;request();});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])host.addEventListener(event,()=>drag=false);
 host.addEventListener('keydown',e=>{if(!current||photo)return;const key=e.key;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','Home'].includes(key))return;e.preventDefault();spin=false;if(key==='ArrowLeft')yaw-=.2;if(key==='ArrowRight')yaw+=.2;if(key==='ArrowUp')pitch=Math.max(-1.3,pitch-.15);if(key==='ArrowDown')pitch=Math.min(1.3,pitch+.15);if(key==='+')zoom=Math.min(1.45,zoom+.12);if(key==='-')zoom=Math.max(.65,zoom-.12);if(key==='Home'){yaw=.45;pitch=.3;zoom=1;}updateButtons();request();});
 q('[data-parts-browse]').addEventListener('click',()=>q('[data-parts-catalog]').scrollIntoView({behavior:paused?'instant':'smooth',block:'start'}));
 q('[data-part-copy]').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(selected.sku);q('[data-part-copy-status]').textContent='Part number copied.';}catch{q('[data-part-copy-status]').textContent=`Part number: ${selected.sku}`;}});
 window.addEventListener('studio-motion',e=>{paused=e.detail.paused;spin=!paused;last=0;updateButtons();request();});
 window.addEventListener('hashchange',()=>{let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}if(byId.has(id))select(id,{history:false});});
 filter();let initial;try{initial=decodeURIComponent(location.hash.slice(1));}catch{}await select(byId.has(initial)?initial:'e900bp',{history:false});
}
