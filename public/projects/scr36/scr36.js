import {attachChannelLockTabs} from './scr36-connectors.js';
const $ = (s) => document.querySelector(s);
const chapters = [
 {tag:'QJ1 + QJ2 / BR Â· SR Â· BP',title:'Start with a stable foundation.',description:'The manual begins with the right rear and right side panels. After engaging QJ1 downward, the bottom panel rests on the side support block while QJ2 is aligned and engaged toward the rear panel.',note:'Panel codes and joint order follow the supplied workbook. Use the original documents for the full procedure.',image:'manual-parts.png',alt:'Exploded parts diagram from the SCR36 manual',label:'SOURCE / PARTS DIAGRAM'},
 {tag:'QJ3 â†’ QJ5 / SL Â· BL Â· BR',title:'Bring the corner together.',description:'The left side engages at QJ3. A temporary support block provides clearance as the rear panels connect at QJ4 and QJ5. The manual calls out the panel relationship and alignment before final engagement.',note:'Critical source check: BR and BL must be flush, with all three QJ5 connectors fully inserted at their entry points before engaging. Read the complete sequence in the workbook.',image:'manual-base.png',alt:'Source photograph of the bottom panel and temporary support',label:'SOURCE / BASE SUPPORT'},
 {tag:'LAZY SUSAN / UPPER + LOWER',title:'Make room for movement.',description:'The manual places the tray braces on the support blocks, then inserts the spring pin. The process repeats for the second shelf, creating the two rotating storage levels shown in the drawing.',note:'The drawing documents the tray components separately. The 3D study simplifies their geometry and does not simulate mechanical clearances.',image:'manual-tray.png',alt:'Source photograph showing the tray and support detail',label:'SOURCE / TRAY SUPPORT'},
 {tag:'FACE FRAME / ALIGN + ENGAGE',title:'Give the cabinet its front.',description:'Check that the bottom panel is flush with both side panels. The preassembled face frame is aligned at the right and left entry points, then engaged downward. The manual also calls for a spring pin in the right rear panel.',note:'The workbook flags face-frame pin depth and visible pin breakthrough for correction. These notes remain open in this presentation.',image:'manual-frame.png',alt:'Source photograph showing face-frame pin details flagged for review',label:'SOURCE / FRAME REVIEW'},
 {tag:'TOEKICK / FINAL BASE CONNECTION',title:'Complete the base.',description:'The workbook finishes by rotating the cabinet onto a side or rear panel, assembling the toekick through the channel-lock route, then applying it to the base connections and engaging it.',note:'This is a chapter summary. Follow the original workbook for handling and assembly details.',image:'manual-parts.png',alt:'SCR36 exploded diagram including the toekick parts',label:'SOURCE / COMPONENT OVERVIEW'},
 {tag:'REVIEW / OPEN CORRECTION NOTES',title:'Keep the details in view.',description:'The supplied workbook records routing inset and direction issues on the right panel, spring-pin bore alignment and diameter, and face-frame pin depth and breakthrough. These are source review notes, not completed fixes.',note:'Confirm the current approved drawing and resolved corrections with the project team before production or installation.',image:'manual-route.png',alt:'Source photograph of a routed slot flagged for correction',label:'SOURCE / ROUTING REVIEW'}
];
let chapter=0;
function showChapter(index){
 chapter=Math.max(0,Math.min(chapters.length-1,index));const c=chapters[chapter];
 for(const field of ['tag','title','description','note'])$('#step-'+field).textContent=c[field];
 $('#step-image').src='./'+c.image;$('#step-image').alt=c.alt;$('#step-image-label').textContent=c.label;
 $('#step-number').textContent=String(chapter+1).padStart(2,'0');$('#step-count').textContent=String(chapter+1).padStart(2,'0')+' / 06';
 document.querySelectorAll('[data-step]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===chapter)));
 $('#previous').disabled=chapter===0;$('#next').disabled=chapter===chapters.length-1;
}
document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>showChapter(Number(b.dataset.step))));
$('#previous').addEventListener('click',()=>showChapter(chapter-1));$('#next').addEventListener('click',()=>showChapter(chapter+1));

async function startModel(){
 const T=await import('/vendor/three.module.js');
 const viewport=$('#viewport');const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x111411,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 viewport.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
 const scene=new T.Scene();const camera=new T.PerspectiveCamera(34,1,.01,50);camera.position.set(1.52,1.16,1.76);camera.lookAt(0,.03,0);
 scene.add(new T.HemisphereLight(0xeaffd2,0x454838,1.45));const key=new T.DirectionalLight(0xfff2d9,4);key.position.set(2,4,3);scene.add(key);const rim=new T.DirectionalLight(0xbcff85,2);rim.position.set(-2,1,-1);scene.add(rim);
 const root=new T.Group();scene.add(root);const parts=[];const surfaces=[];const edges=[];
 const shellMat=new T.MeshStandardMaterial({color:0xd9d2b9,roughness:.72,metalness:.03});
 const trayMat=new T.MeshStandardMaterial({color:0xc6a875,roughness:.58,metalness:.02});
 const whiteMat=new T.MeshStandardMaterial({color:0xe7e7d5,roughness:.48,metalness:.05});
 const connectorMat=new T.MeshStandardMaterial({color:0xb1ff42,emissive:0x6cab15,emissiveIntensity:.38,roughness:.35,metalness:.28});
 const metalMat=new T.MeshStandardMaterial({color:0x818879,roughness:.3,metalness:.7});
 function addMesh(geometry,material,parent){const mesh=new T.Mesh(geometry,material.clone());parent.add(mesh);surfaces.push(mesh);if(material!==connectorMat){const line=new T.LineSegments(new T.EdgesGeometry(geometry,28),new T.LineBasicMaterial({color:0x515a40,transparent:true,opacity:.25}));mesh.add(line);edges.push(line);}return mesh;}
 function part(name,offset){const group=new T.Group();group.name=name;root.add(group);parts.push({group,offset:new T.Vector3(...offset)});return group;}
 function box(parent,size,pos,mat=shellMat){const mesh=addMesh(new T.BoxGeometry(...size),mat,parent);mesh.position.set(...pos);return mesh;}
 const backR=part('Right rear panel',[0,.015,-.25]);box(backR,[.884,.876,.018],[0,0,-.433]);
 const backL=part('Left rear panel',[-.25,.02,0]);box(backL,[.018,.876,.872],[-.433,0,0]);
 const sideR=part('Right side panel',[.26,0,-.01]);box(sideR,[.018,.762,.591],[.433,.057,-.138]);
 const sideL=part('Left side panel',[-.01,0,.26]);box(sideL,[.591,.762,.018],[-.138,.057,.433]);
 function lShape(){const shape=new T.Shape();shape.moveTo(-.424,-.424);shape.lineTo(.424,-.424);shape.lineTo(.424,.145);shape.lineTo(.145,.145);shape.lineTo(.145,.424);shape.lineTo(-.424,.424);shape.closePath();return shape;}
 const bottom=part('Bottom panel',[0,-.15,0]);const baseMesh=addMesh(new T.ExtrudeGeometry(lShape(),{depth:.012,bevelEnabled:false}),shellMat,bottom);baseMesh.rotation.x=Math.PI/2;baseMesh.position.y=-.31;
 // These presentation meshes use the source silhouette, not machining tolerances.
 function trayShape(inner=0){const r=.34;const shape=new T.Shape();if(!inner){shape.moveTo(0,0);shape.lineTo(r,0);shape.absarc(0,0,r,0,-Math.PI*1.5,true);shape.lineTo(0,0);}else{shape.moveTo(r,0);shape.absarc(0,0,r,0,-Math.PI*1.5,true);shape.lineTo(0,r-inner);shape.absarc(0,0,r-inner,-Math.PI*1.5,0,false);shape.lineTo(r,0);}shape.closePath();return shape;}
 for(const [i,y]of[-.22,.15].entries()){
  const tray=part(i?'Upper rotating tray':'Lower rotating tray',[.05,.13+i*.13,.05]);
  const deck=addMesh(new T.ExtrudeGeometry(trayShape(),{depth:.012,bevelEnabled:false}),trayMat,tray);deck.rotation.x=Math.PI/2;deck.position.set(-.045,y,-.045);
  const rail=addMesh(new T.ExtrudeGeometry(trayShape(.009),{depth:.038,bevelEnabled:false}),trayMat,tray);rail.rotation.x=Math.PI/2;rail.position.set(-.045,y+.032,-.045);
  box(tray,[.80,.025,.045],[-.01,y-.04,-.08],shellMat);
  const bearing=addMesh(new T.CylinderGeometry(.065,.065,.014,36),metalMat,tray);bearing.position.set(-.045,y-.02,-.045);
 }
 const front=part('Face frame',[.22,0,.22]);
 for(const z of [.15,.421])box(front,[.038,.762,.038],[.15,.057,z],whiteMat);
 for(const x of [.15,.421])box(front,[.038,.762,.038],[x,.057,.15],whiteMat);
 for(const y of [-.305,.419]){box(front,[.038,.038,.29],[.15,y,.292],whiteMat);box(front,[.29,.038,.038],[.292,y,.15],whiteMat);}
 // Shaker-style fronts echo the supplied perspective and remain simplified.
 box(front,[.018,.67,.22],[.155,.057,.287],whiteMat);box(front,[.22,.67,.018],[.287,.057,.155],whiteMat);
 box(front,[.024,.58,.15],[.169,.057,.287],shellMat);box(front,[.15,.58,.024],[.287,.057,.169],shellMat);
 const toe=part('Toekick',[.10,-.12,.10]);box(toe,[.012,.12,.365],[.098,-.383,.252],whiteMat);box(toe,[.365,.12,.012],[.252,-.383,.098],whiteMat);
 attachChannelLockTabs({THREE:T,panels:{backR,backL,sideR,sideL},addMesh,material:connectorMat});
 const grid=new T.GridHelper(2.8,28,0x556a3c,0x34402a);grid.position.y=-.51;grid.material.transparent=true;grid.material.opacity=.28;scene.add(grid);
 const ring=new T.Mesh(new T.RingGeometry(.66,.663,96),new T.MeshBasicMaterial({color:0x829b60,transparent:true,opacity:.35,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=-.507;scene.add(ring);
 // Soft, local procedural shadow; no downloaded or generated imagery.
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;const ctx=shadowCanvas.getContext('2d');const gradient=ctx.createRadialGradient(64,64,4,64,64,64);gradient.addColorStop(0,'rgba(0,0,0,.7)');gradient.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);const shadow=new T.Mesh(new T.PlaneGeometry(1.9,1.9),new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.505;scene.add(shadow);
 let current=1,target=1,spinning=false,visible=true,frame=0,last=0,xray=false,dragging=false,startX=0,startY=0;
 const originalRotation={x:0,y:-.13};root.rotation.y=originalRotation.y;
 function draw(time=0){frame=0;if(!visible||document.hidden)return;const delta=Math.min((time-last)/1000||.016,.05);last=time;
  const diff=target-current;current=reduce.matches?target:Math.abs(diff)<.001?target:current+diff*Math.min(1,delta*8);
  for(const p of parts)p.group.position.copy(p.offset).multiplyScalar(current);
  camera.zoom=(1-current*.16)*Math.min(1,camera.aspect/1.2);camera.updateProjectionMatrix();if(spinning)root.rotation.y+=delta*.22;
  renderer.render(scene,camera);if(spinning||Math.abs(target-current)>.001)frame=requestAnimationFrame(draw);
 }
 function requestDraw(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(draw);}
 function setView(mode){xray=mode==='xray';target=mode==='exploded'?1:0;
  for(const mesh of surfaces){mesh.material.transparent=xray;mesh.material.opacity=xray?(mesh.material.emissive?.getHex()===connectorMat.emissive.getHex()?1:.17):1;mesh.material.depthWrite=!xray;mesh.material.needsUpdate=true;}
  for(const edge of edges){edge.material.color.setHex(xray?0xb1ff42:0x515a40);edge.material.opacity=xray?.55:.25;}
  document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===mode)));
  $('#view-label').textContent=mode==='xray'?'03 / X-RAY':mode==='exploded'?'02 / EXPLODED':'01 / ASSEMBLED';
  $('#explode').value=String(target*100);$('#explode-value').textContent=Math.round(target*100)+'%';
  $('#part-caption').innerHTML=mode==='xray'?'LOOK THROUGH.<br><strong>FIND THE CONNECTIONS.</strong>':mode==='exploded'?'EVERY PART.<br><strong>IN RELATION.</strong>':'TWO LEVELS.<br><strong>ONE CONNECTED SYSTEM.</strong>';requestDraw();
 }
 document.querySelectorAll('[data-view]').forEach(b=>{b.disabled=false;b.addEventListener('click',()=>setView(b.dataset.view));});
 $('#explode').disabled=false;$('#explode').addEventListener('input',e=>{target=Number(e.target.value)/100;$('#explode-value').textContent=e.target.value+'%';$('#view-label').textContent='CUSTOM / '+e.target.value+'% SEPARATED';document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed','false'));requestDraw();});
 $('#rotate').disabled=false;$('#rotate').addEventListener('click',()=>{spinning=!spinning;$('#rotate').setAttribute('aria-pressed',String(spinning));requestDraw();});
 $('#reset').disabled=false;$('#reset').addEventListener('click',()=>{root.rotation.set(0,originalRotation.y,0);spinning=false;$('#rotate').setAttribute('aria-pressed','false');setView('assembled');});
 viewport.addEventListener('pointerdown',e=>{if(e.button!==0)return;dragging=true;startX=e.clientX;startY=e.clientY;viewport.setPointerCapture(e.pointerId);});
 viewport.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-startX,dy=e.clientY-startY;root.rotation.y+=dx*.008;if(e.pointerType!=='touch')root.rotation.x=Math.max(-.35,Math.min(.35,root.rotation.x+dy*.004));startX=e.clientX;startY=e.clientY;requestDraw();});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])viewport.addEventListener(event,()=>{dragging=false;});
 viewport.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')root.rotation.y-=.13;if(e.key==='ArrowRight')root.rotation.y+=.13;if(e.key==='ArrowUp')root.rotation.x=Math.max(-.35,root.rotation.x-.08);if(e.key==='ArrowDown')root.rotation.x=Math.min(.35,root.rotation.x+.08);requestDraw();});
 new ResizeObserver(()=>{const w=viewport.clientWidth,h=viewport.clientHeight;if(w&&h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();requestDraw();}}).observe(viewport);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)requestDraw();else if(frame){cancelAnimationFrame(frame);frame=0;}},{rootMargin:'150px'}).observe(viewport);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)requestDraw();});
 reduce.addEventListener('change',()=>{if(reduce.matches){spinning=false;$('#rotate').setAttribute('aria-pressed','false');}requestDraw();});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();spinning=false;viewport.classList.remove('loaded');renderer.domElement.style.display='none';$('#model-hint').textContent='3D PAUSED / RELOAD TO RESTORE';document.querySelectorAll('[data-view],#explode,#rotate,#reset').forEach(b=>b.disabled=true);});
 renderer.setSize(viewport.clientWidth,viewport.clientHeight,false);camera.aspect=viewport.clientWidth/viewport.clientHeight;camera.updateProjectionMatrix();renderer.render(scene,camera);viewport.classList.add('loaded');$('#model-hint').textContent='DRAG TO ROTATE / ARROW KEYS TO ORBIT';setView('exploded');
}
startModel().catch(error=>{$('#model-hint').textContent='DRAWING VIEW / 3D UNAVAILABLE';console.warn('SCR36 drawing fallback active:',error.message);});
