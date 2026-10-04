import {randomUUID} from 'node:crypto';
import {validateInquiry,MAX_REQUEST_BYTES} from '../src/inquiry-validation.js';
import {siteOrigin} from '../src/seo.mjs';
const requests=new Map();
function limited(key,now=Date.now()){
 for(const [k,v]of requests)if(now-v.start>3600000)requests.delete(k);
 if(requests.size>=1000&&!requests.has(key))return true;
 const entry=requests.get(key)||{start:now,count:0};entry.count++;requests.set(key,entry);return entry.count>8;
}
function deliveryConfig(env){
 if(env.VERCEL_ENV!=='production'&&env.INQUIRY_ALLOW_LOCAL!=='true')return null;
 try{const url=new URL(env.INQUIRY_WEBHOOK_URL);if(url.protocol!=='https:'||url.username||url.password)return null;return {url:url.href,token:env.INQUIRY_WEBHOOK_TOKEN||''};}catch{return null;}
}
const reply=(status,body)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff'}});
async function readBody(request){
 if(Number(request.headers.get('content-length'))>MAX_REQUEST_BYTES)throw new Error('PAYLOAD_TOO_LARGE');
 if(!request.body)throw new Error('EMPTY_BODY');const reader=request.body.getReader();let size=0;const chunks=[];
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_REQUEST_BYTES){await reader.cancel();throw new Error('PAYLOAD_TOO_LARGE');}chunks.push(Buffer.from(value));}
 return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
export async function handleInquiry(request,{env=process.env,send=fetch,rateLimit=limited}={}){
 const delivery=deliveryConfig(env);
 if(request.method==='GET')return reply(200,{available:Boolean(delivery)});
 if(request.method!=='POST')return new Response('Method not allowed',{status:405,headers:{Allow:'GET, POST','X-Robots-Tag':'noindex'}});
 let origin;try{origin=siteOrigin(env);}catch{return reply(503,{error:'Project inquiries are temporarily unavailable. Please contact Lockdowel directly.'});}
 if(request.headers.get('origin')!==origin)return reply(403,{error:'Submit the inquiry from the Lockdowel Build website.'});
 if(!delivery)return reply(503,{error:'Online inquiries are not available yet. Save your brief and contact Lockdowel directly.'});
 if(!/^application\/json(?:;|$)/i.test(request.headers.get('content-type')||''))return reply(415,{error:'Unsupported submission format.'});
 let data;try{data=validateInquiry(await readBody(request));}catch(error){return reply(error.message==='PAYLOAD_TOO_LARGE'?413:400,{error:error.message==='PAYLOAD_TOO_LARGE'?'Your drawing is too large. Use a file up to 2 MB.':error instanceof SyntaxError?'Invalid submission. Please try again.':error.message});}
 const address=request.headers.get('x-forwarded-for')?.split(',')[0].trim()||'unknown';if(rateLimit(address))return reply(429,{error:'Too many inquiries. Please wait before trying again.'});
 const reference=randomUUID();
 try{const response=await send(delivery.url,{method:'POST',headers:{'Content-Type':'application/json',...(delivery.token?{Authorization:'Bearer '+delivery.token}:{}),'Idempotency-Key':reference},body:JSON.stringify({type:'lockdowel.project-inquiry',reference,submittedAt:new Date().toISOString(),...data}),redirect:'error',signal:AbortSignal.timeout(12000)});if(!response.ok)throw new Error('Delivery not accepted');return reply(200,{accepted:true,reference});}catch{return reply(502,{error:'We could not confirm delivery. Save a copy of your brief and contact Lockdowel directly before resubmitting.'});}
}
export default {fetch:handleInquiry};
