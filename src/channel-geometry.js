// Authored presentation timing; mounting/routing is illustrative, not tooling data.
export const DURATION=16;
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const ease=v=>{v=clamp(v);return v*v*v*(v*(v*6-15)+10);};
const phase=(t,a,b)=>ease((t-a)/(b-a));
export function connectionFrame(t){
 t=clamp(t,0,DURATION);
 const cameraFrame=phase(t,0,1.15),receiverFrame=phase(t,4.4,5.2),appear=phase(t,1.15,1.8),press=phase(t,2,4.4),receive=phase(t,5.2,6),seat=phase(t,6,8.4),slide=phase(t,8.6,10.7),zoom=phase(t,11,14);
 return {t,cameraFrame,receiverFrame,woodOpacity:appear,carrierY:45*(1-seat),connectorY:-45*(1-press),carrierX:-31*slide,receiverY:-.6,receiverOpacity:receive,zoom,section:t>.3,chapter:t<.35?0:t<4.5?1:t<8.6?2:t<11?3:4};
}
// Presentation clearances follow the selected model; these are not tooling dimensions.
export function connectionProfile(part){
 const m=part.model;
 if(m.type==='detailed-cad')return {spacing:32,boreRadius:2.6,boreDepth:22,mouth:1.85,pocket:3.6,entryHalf:21.6,entryLeft:-19.5,mountOffset:0};
 return {spacing:m.spacing,boreRadius:m.radius+.2,boreDepth:m.post+2,mouth:m.hclip?m.radius+.2:m.radius*.475+.4,pocket:m.radius+1,entryHalf:m.spacing/2+m.radius+3.1,entryLeft:-(m.spacing/2+m.radius+1),mountOffset:m.hclip?-.4:-.12};
}
export function createConnectionWood(THREE,{section=false,spacing=32,boreRadius=2.6,boreDepth=22,mouth=1.85,pocket:slotRadius=3.6,entryHalf=21.6,entryLeft=-19.5}={}){
 function rect(x0,x1,z0,z1){const s=new THREE.Shape();s.moveTo(x0,z0);s.lineTo(x1,z0);s.lineTo(x1,z1);s.lineTo(x0,z1);s.closePath();return s;}
 const width=58,height=80,half=width/2;
 let carrier;
 if(section){carrier=new THREE.Shape();carrier.moveTo(-half,-9);carrier.lineTo(half,-9);carrier.lineTo(half,0);for(const x of [spacing/2,-spacing/2]){carrier.lineTo(x+boreRadius,0);carrier.absarc(x,0,boreRadius,0,-Math.PI,true);}carrier.lineTo(-half,0);carrier.closePath();}
 else{carrier=rect(-half,half,-9,9);for(const x of [-spacing/2,spacing/2]){const hole=new THREE.Path();hole.absarc(x,0,boreRadius,0,Math.PI*2,true);carrier.holes.push(hole);}}
 function extrude(shape,depth,y,up=false){const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:24});g.rotateX(up?-Math.PI/2:Math.PI/2);g.translate(0,y,0);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/100,uv.getY(i)/100);return g;}
 // Upward extrusion mirrors the section along z; restore to the back half.
 const lower=extrude(carrier,boreDepth,0,true);if(section)lower.rotateY(Math.PI);
 const upper=new THREE.BoxGeometry(width,height-boreDepth,section?9:18);upper.translate(0,boreDepth+(height-boreDepth)/2,section?-4.5:0);
 const x0=-72,x1=44,z0=-25,z1=25;
 const end=-53.35-(entryHalf-21.6),neck=end+mouth,shoulder=entryHalf-slotRadius;
 function opening(wide){const h=new THREE.Path();const r=wide?slotRadius:mouth;h.moveTo(neck,-r);h.lineTo(entryLeft,-r);if(!wide)h.lineTo(entryLeft,-slotRadius);h.lineTo(shoulder,-slotRadius);h.quadraticCurveTo(entryHalf,-slotRadius,entryHalf,0);h.quadraticCurveTo(entryHalf,slotRadius,shoulder,slotRadius);h.lineTo(entryLeft,slotRadius);if(!wide)h.lineTo(entryLeft,r);h.lineTo(neck,r);h.quadraticCurveTo(end,0,neck,-r);h.closePath();return h;}
 function routedShape(wide){if(!section){const s=rect(x0,x1,z0,z1);s.holes.push(opening(wide));return s;}const r=wide?slotRadius:mouth;const s=new THREE.Shape();s.moveTo(x0,z0);s.lineTo(x1,z0);s.lineTo(x1,0);s.lineTo(entryHalf,0);s.quadraticCurveTo(entryHalf,-slotRadius,shoulder,-slotRadius);s.lineTo(entryLeft,-slotRadius);if(!wide)s.lineTo(entryLeft,-r);s.lineTo(neck,-r);s.quadraticCurveTo(end,0,neck,0);s.lineTo(x0,0);s.closePath();return s;}
 const top=extrude(routedShape(false),3.65,0),pocket=extrude(routedShape(true),5.45,-3.65),base=extrude(rect(x0,x1,z0,section?0:z1),8.9,-9.1);
 return {carrier:[lower,upper],receiver:[top,pocket,base],width,height};
}

// Fit the moving detail into the usable perspective viewport at any orbit angle.
// direction points from the target toward the camera; the returned distance is radial.
export function fitPerspectiveDistance(THREE,bounds,target,direction,fov,aspect,padding=.12){
 const forward=direction.clone().normalize();
 const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),forward).normalize();
 const up=new THREE.Vector3().crossVectors(forward,right).normalize();
 const vertical=Math.tan(fov*Math.PI/360)*(1-padding),horizontal=vertical*aspect;
 let distance=1;
 for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
  const offset=new THREE.Vector3(x,y,z).sub(target),depth=offset.dot(forward);
  distance=Math.max(distance,depth+Math.abs(offset.dot(right))/horizontal,depth+Math.abs(offset.dot(up))/vertical);
 }
 return distance;
}
