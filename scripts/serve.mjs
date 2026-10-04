import {projectAccess,isProtected} from '../server/project-access.js';
import {localProjectSecret} from '../server/local-project-secret.js';
import inquiryHandler from '../api/inquiries.js';
import {Readable} from 'node:stream';
import {createServer} from 'node:http';
import {stat,readFile,realpath} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join,resolve,extname,sep} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.mp4':'video/mp4','.pdf':'application/pdf','.txt':'text/plain; charset=utf-8','.xml':'application/xml'};
export function createLocalServer({accessOptions={}}={}){const secret=localProjectSecret();return createServer(async(req,res)=>{
 res.setHeader('X-Robots-Tag','noindex, nofollow');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('Cache-Control','no-store');
 const requestUrl='http://'+(req.headers.host||'127.0.0.1')+req.url;
 if(isProtected(requestUrl)){
  try{
   const request=new Request(requestUrl,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Readable.toWeb(req),duplex:'half'}:{})});
   const denied=await projectAccess(request,{secret,...accessOptions});
   if(denied){res.writeHead(denied.status,Object.fromEntries(denied.headers));res.end(req.method==='HEAD'?undefined:Buffer.from(await denied.arrayBuffer()));return;}
  }catch{res.writeHead(400,{'Cache-Control':'no-store'});res.end('Invalid project request.');return;}
 }
 if(['/api/inquiries','/api/inquiries/'].includes(req.url?.split('?')[0])){try{const request=new Request('http://127.0.0.1'+req.url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Readable.toWeb(req),duplex:'half'}:{})});const response=await inquiryHandler.fetch(request);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch{res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Invalid request.'}));}return;}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end('Invalid URL');return;}
 if(pathname.includes('\0')||pathname.includes('\\')){res.writeHead(400);res.end('Invalid path');return;}
 let path=resolve(root,'.'+pathname);if(!path.startsWith(root+sep)&&path!==root){res.writeHead(403);res.end();return;}
 try{let info=await stat(path);if(info.isDirectory()){if(!pathname.endsWith('/')){res.writeHead(308,{'Location':pathname+'/'});res.end();return;}path=join(path,'index.html');info=await stat(path);}
 const actual=await realpath(path);if(!actual.startsWith(root+sep)){res.writeHead(403);res.end();return;}
 const headers={'Content-Type':types[extname(path)]||'application/octet-stream','Accept-Ranges':'bytes'};
 let start=0,end=info.size-1,status=200;
 if(req.headers.range){const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);if(!match||(!match[1]&&!match[2])){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}
 if(!match[1]){start=Math.max(0,info.size-Number(match[2]));}else{start=Number(match[1]);if(match[2])end=Math.min(Number(match[2]),end);}
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}
 status=206;headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;}
 headers['Content-Length']=Math.max(0,end-start+1);res.writeHead(status,headers);if(req.method==='HEAD'||info.size===0){res.end();return;}const stream=createReadStream(path,{start,end});stream.on('error',()=>res.destroy());stream.pipe(res);
 }catch(error){if(error.code==='ENOENT'||error.code==='ENOTDIR'){res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(req.method==='HEAD'?undefined:await readFile(join(root,'404.html')));}else{res.writeHead(500);res.end('Could not read local file.');}}
 });}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT||4173);const server=createLocalServer();server.listen(port,'127.0.0.1',()=>console.log(`Lockdowel Build local preview: http://127.0.0.1:${port}\nForeground server. Press Ctrl+C to stop.`));server.on('error',error=>{console.error(error.message);process.exitCode=1;});
}
