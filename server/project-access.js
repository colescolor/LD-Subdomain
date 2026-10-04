import {createHmac,scryptSync,timingSafeEqual} from 'node:crypto';
export const PROJECT_PATH='/projects/scr36';
export const LANDING=PROJECT_PATH+'/preview/';
export const ACCESS=LANDING+'_access';
export const COOKIE='scr36_access';
export const SESSION_SECONDS=8*60*60;
// Server-only verifier. Never copied into the static build.
const PASSWORD_SALT='f0799eae8dda262eb5e4a134d6c669c3d3874da98cf68142';
const PASSWORD_HASH='d9ff3ae19567ee11d760462e6c6772989e323dc4d2ec45309b151c455d7ef476';
export const privateHeaders={'Cache-Control':'private, no-store, max-age=0','CDN-Cache-Control':'no-store','Vercel-CDN-Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow, noimageindex','Referrer-Policy':'same-origin','Vary':'Cookie','X-Content-Type-Options':'nosniff'};
export function isProtected(url){
 let path=new URL(url).pathname;
 try{for(let i=0;i<3;i++){const next=decodeURIComponent(path);if(next===path)break;path=next;}}catch{return true;}
 path=path.split('/').map(segment=>segment.replace(/[. ]+$/,'')).join('/');
 path=new URL(path.replaceAll('\\','/').replace(/\/{2,}/g,'/'),'https://local.invalid').pathname.toLowerCase();
 return path===PROJECT_PATH||path.startsWith(PROJECT_PATH+'/');
}
function sign(payload,secret){return createHmac('sha256',secret).update('SCR36|'+payload).digest('base64url');}
export function issueSession(secret,now=Date.now()){const payload='v1.'+Math.floor(now/1000+SESSION_SECONDS);return payload+'.'+sign(payload,secret);}
export function validSession(token,secret,now=Date.now()){
 if(!secret||secret.length<32||typeof token!=='string')return false;
 const match=/^(v1\.(\d{10}))\.([A-Za-z0-9_-]{43})$/.exec(token);if(!match)return false;
 const expires=Number(match[2]),seconds=Math.floor(now/1000);if(expires<=seconds||expires>seconds+SESSION_SECONDS+5)return false;
 const expected=Buffer.from(sign(match[1],secret)),actual=Buffer.from(match[3]);return expected.length===actual.length&&timingSafeEqual(expected,actual);
}
function cookieValue(request){const cookies=request.headers.get('cookie')||'';return cookies.split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)||'';}
function passwordMatches(password){if(typeof password!=='string'||password.length>128)return false;return timingSafeEqual(scryptSync(password,PASSWORD_SALT,32),Buffer.from(PASSWORD_HASH,'hex'));}
const attempts=new Map();
export function limited(key,now=Date.now()){
 for(const [k,v]of attempts)if(now-v.start>10*60*1000)attempts.delete(k);
 if(attempts.size>=1000&&!attempts.has(key))return true;
 const value=attempts.get(key)||{count:0,start:now};value.count++;attempts.set(key,value);return value.count>10;
}
export function loginPage(message=''){
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow, noimageindex"><meta name="referrer" content="same-origin"><meta name="theme-color" content="#f4f3ee"><title>Project access | Lockdowel</title><style>*{box-sizing:border-box}body{margin:0;background:#f4f3ee;color:#213d39;font:16px Arial,sans-serif;min-height:100svh;display:grid;place-items:center;padding:25px}main{width:min(100%,460px)}.brand{font-size:18px;font-weight:800;letter-spacing:-.06em}.brand span{font-size:10px;letter-spacing:.1em;margin-left:16px;font-weight:400}.label{font-size:10px;letter-spacing:.14em;margin-top:65px;color:#647568}h1{font-size:53px;line-height:1.04;letter-spacing:-.06em;font-weight:500;margin:23px 0}p{color:#647568;line-height:1.6;font-size:15px}form{margin-top:34px}label{display:block;font-size:13px;margin-bottom:12px}input{width:100%;border:1px solid #b8c6b7;background:white;border-radius:3px;padding:16px;font:18px Arial;outline-color:#325e4d}button{margin-top:15px;width:100%;padding:18px 20px;background:#213d39;color:white;border:0;border-radius:3px;font:15px Arial;text-align:left;cursor:pointer}button span{float:right}button:focus-visible{outline:3px solid #b37c36;outline-offset:4px}.error{color:#9d422a;font-size:13px;min-height:21px}.note{font-size:11px;border-top:1px solid #d5d9cf;padding-top:24px;margin-top:30px}@media(max-width:420px){h1{font-size:46px}.label{margin-top:45px}}</style></head><body><main><div class="brand">LOCKDOWEL<span>PROJECT PREVIEW</span></div><p class="label">A CLOSER LOOK, JUST FOR YOU.</p><h1>Your next build.<br>One step closer.</h1><p>Enter your project password to open the presentation, film, and drawings.</p><form method="post" action="${ACCESS}"><label for="password">Project password</label><input id="password" name="password" type="password" autocomplete="current-password" required maxlength="128" aria-describedby="access-message"><button type="submit">Open the presentation <span aria-hidden="true">↗</span></button><p class="error" id="access-message" role="status">${message}</p></form><p class="note">Use the password shared with your project link.</p></main></body></html>`;
}
function response(body,status=401,extra={}){return new Response(body,{status,headers:{...privateHeaders,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",...extra}});}
function sessionCookie(request,token,seconds){return COOKIE+'='+token+'; Path='+PROJECT_PATH+'; HttpOnly; SameSite=Strict; Max-Age='+seconds+(new URL(request.url).protocol==='https:'?'; Secure':'');}
async function readSmallForm(request){
 if(Number(request.headers.get('content-length'))>2048)throw Error();
 if(!request.body)return new URLSearchParams();
 const reader=request.body.getReader();const chunks=[];let size=0;
 while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>2048){await reader.cancel();throw Error();}chunks.push(Buffer.from(value));}
 return new URLSearchParams(Buffer.concat(chunks).toString('utf8'));
}
export async function projectAccess(request,{secret=process.env.SCR36_SESSION_SECRET,now=Date.now(),rateLimit=limited,verifyPassword=passwordMatches}={}){
 if(!isProtected(request.url))return null;
 const url=new URL(request.url),pathname=url.pathname.replace(/\/$/,'');
 if(typeof secret!=='string'||secret.length<32)return response(request.method==='HEAD'?null:loginPage('Project access is being configured. Please try again later.'),503);
 if(pathname===ACCESS||pathname===ACCESS+'/logout'){
  if(request.method==='GET'||request.method==='HEAD')return response(request.method==='HEAD'?null:loginPage(),200);
  if(request.method!=='POST')return response(null,405,{Allow:'GET, HEAD, POST'});
  if(request.headers.get('origin')!==url.origin)return response('Invalid request origin.',403);
  if(pathname.endsWith('/logout'))return response(null,303,{Location:LANDING,'Set-Cookie':sessionCookie(request,'',0)});
  if(!/^application\/x-www-form-urlencoded(?:;|$)/i.test(request.headers.get('content-type')||''))return response('Invalid form.',415);
  const key=request.headers.get('x-forwarded-for')?.split(',')[0].trim()||'local';
  if(rateLimit(key,now))return response(loginPage('Too many attempts. Please wait 10 minutes before trying again.'),429,{'Retry-After':'600'});
  let form;try{form=await readSmallForm(request);}catch{return response(loginPage('Please check your password and try again.'),400);}
  if(!verifyPassword(form.get('password')))return response(loginPage('That password didn’t match. Please try again.'),401);
  return response(null,303,{Location:LANDING,'Set-Cookie':sessionCookie(request,issueSession(secret,now),SESSION_SECONDS)});
 }
 if(!validSession(cookieValue(request),secret,now))return response(request.method==='HEAD'?null:loginPage(),401);
 return null;
}
