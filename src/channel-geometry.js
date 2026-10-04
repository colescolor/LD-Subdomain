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
export function createConnectionWood(THREE,{section=false}={}){
 function rect(x0,x1,z0,z1){const s=new THREE.Shape();s.moveTo(x0,z0);s.lineTo(x1,z0);s.lineTo(x1,z1);s.lineTo(x0,z1);s.closePath();return s;}
 const width=58,height=80,half=width/2;
 let carrier;
 if(section){carrier=new THREE.Shape();carrier.moveTo(-half,-9);carrier.lineTo(half,-9);carrier.lineTo(half,0);for(const x of [16,-16]){carrier.lineTo(x+2.6,0);carrier.absarc(x,0,2.6,0,-Math.PI,true);}carrier.lineTo(-half,0);carrier.closePath();}
 else{carrier=rect(-half,half,-9,9);for(const x of [-16,16]){const hole=new THREE.Path();hole.absarc(x,0,2.6,0,Math.PI*2,true);carrier.holes.push(hole);}}
 function extrude(shape,depth,y,up=false){const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:24});g.rotateX(up?-Math.PI/2:Math.PI/2);g.translate(0,y,0);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/100,uv.getY(i)/100);return g;}
 // Upward extrusion mirrors the section along z; restore to the back half.
 const lower=extrude(carrier,22,0,true);if(section)lower.rotateY(Math.PI);
 const upper=new THREE.BoxGeometry(width,height-22,section?9:18);upper.translate(0,22+(height-22)/2,section?-4.5:0);
 const x0=-72,x1=44,z0=-25,z1=25;
 function opening(wide){const h=new THREE.Path();const r=wide?3.6:1.85;h.moveTo(-51.5,-r);h.lineTo(-19.5,-r);if(!wide)h.lineTo(-19.5,-3.6);h.lineTo(18,-3.6);h.quadraticCurveTo(21.6,-3.6,21.6,0);h.quadraticCurveTo(21.6,3.6,18,3.6);h.lineTo(-19.5,3.6);if(!wide)h.lineTo(-19.5,r);h.lineTo(-51.5,r);h.quadraticCurveTo(-53.35,0,-51.5,-r);h.closePath();return h;}
 function routedShape(wide){if(!section){const s=rect(x0,x1,z0,z1);s.holes.push(opening(wide));return s;}const r=wide?3.6:1.85;const s=new THREE.Shape();s.moveTo(x0,z0);s.lineTo(x1,z0);s.lineTo(x1,0);s.lineTo(21.6,0);s.quadraticCurveTo(21.6,-3.6,18,-3.6);s.lineTo(-19.5,-3.6);if(!wide)s.lineTo(-19.5,-r);s.lineTo(-51.5,-r);s.quadraticCurveTo(-53.35,0,-51.5,0);s.lineTo(x0,0);s.closePath();return s;}
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
