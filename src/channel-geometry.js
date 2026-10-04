// Authored presentation timing; mounting/routing is illustrative, not tooling data.
export const DURATION=16;
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
const phase=(t,a,b)=>ease((t-a)/(b-a));
export function connectionFrame(t){
 t=clamp(t,0,DURATION);
 const appear=phase(t,.35,1.8),press=phase(t,2,4.4),receive=phase(t,4.5,6),seat=phase(t,6,8.4),slide=phase(t,8.6,10.7),growth=phase(t,11,15.7);
 return {t,woodOpacity:appear,carrierY:45*appear*(1-seat),connectorY:-27*appear*(1-press),carrierX:-31*slide,receiverY:-.6-65*(1-receive),receiverOpacity:receive,growth,section:t>.3&&t<11.2,chapter:t<.35?0:t<4.5?1:t<8.6?2:t<11?3:4};
}
export function createConnectionWood(THREE,{growth=0,section=false}={}){
 const lerp=(a,b)=>a+(b-a)*growth;
 function rect(x0,x1,z0,z1){const s=new THREE.Shape();s.moveTo(x0,z0);s.lineTo(x1,z0);s.lineTo(x1,z1);s.lineTo(x0,z1);s.closePath();return s;}
 const width=lerp(58,640),height=lerp(80,600),half=width/2;
 let carrier;
 if(section){carrier=new THREE.Shape();carrier.moveTo(-half,-9);carrier.lineTo(half,-9);carrier.lineTo(half,0);for(const x of [16,-16]){carrier.lineTo(x+2.6,0);carrier.absarc(x,0,2.6,0,-Math.PI,true);}carrier.lineTo(-half,0);carrier.closePath();}
 else{carrier=rect(-half,half,-9,9);for(const x of [-16,16]){const hole=new THREE.Path();hole.absarc(x,0,2.6,0,Math.PI*2,true);carrier.holes.push(hole);}}
 function extrude(shape,depth,y,up=false){const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:24});g.rotateX(up?-Math.PI/2:Math.PI/2);g.translate(0,y,0);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/100,uv.getY(i)/100);return g;}
 // Upward extrusion mirrors the section along z; restore to the back half.
 const lower=extrude(carrier,22,0,true);if(section)lower.rotateY(Math.PI);
 const upper=new THREE.BoxGeometry(width,height-22,section?9:18);upper.translate(0,22+(height-22)/2,section?-4.5:0);
 const x0=lerp(-72,-351),x1=lerp(44,289),z0=lerp(-25,-9),z1=lerp(25,371);
 function opening(wide){const h=new THREE.Path();const r=wide?3.6:1.85;h.moveTo(-51.5,-r);h.lineTo(-19.5,-r);if(!wide)h.lineTo(-19.5,-3.6);h.lineTo(18,-3.6);h.quadraticCurveTo(21.6,-3.6,21.6,0);h.quadraticCurveTo(21.6,3.6,18,3.6);h.lineTo(-19.5,3.6);if(!wide)h.lineTo(-19.5,r);h.lineTo(-51.5,r);h.quadraticCurveTo(-53.35,0,-51.5,-r);h.closePath();return h;}
 function routedShape(wide){if(!section){const s=rect(x0,x1,z0,z1);s.holes.push(opening(wide));return s;}const r=wide?3.6:1.85;const s=new THREE.Shape();s.moveTo(x0,z0);s.lineTo(x1,z0);s.lineTo(x1,0);s.lineTo(21.6,0);s.quadraticCurveTo(21.6,-3.6,18,-3.6);s.lineTo(-19.5,-3.6);if(!wide)s.lineTo(-19.5,-r);s.lineTo(-51.5,-r);s.quadraticCurveTo(-53.35,0,-51.5,0);s.lineTo(x0,0);s.closePath();return s;}
 const top=extrude(routedShape(false),3.65,0),pocket=extrude(routedShape(true),5.45,-3.65),base=extrude(rect(x0,x1,z0,section?0:z1),8.9,-9.1);
 return {carrier:[lower,upper],receiver:[top,pocket,base],width,height};
}
