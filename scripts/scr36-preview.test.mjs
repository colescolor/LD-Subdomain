import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {pages,shell} from '../src/pages.mjs';
import {createLocalServer} from './serve.mjs';
const route='/projects/scr36/preview/';
test('SCR36 sales presentation remains unlisted and its local resources resolve',async()=>{
 const html=await readFile(join('dist',route,'index.html'),'utf8');
 assert.match(html,/<meta name="robots" content="noindex, nofollow, noimageindex">/);
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
 assert.doesNotMatch(html,/autoplay|measurement\.js|analytics/);
 for(const page of pages.filter(p=>!p.private))assert.ok(!shell(page,true).includes(route),'Public page must not expose the sales route');
 assert.ok(!(await readFile('dist/sitemap.xml','utf8')).includes(route));
 for(const [,raw]of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const url=new URL(raw.replaceAll('&amp;','&'),'https://build.lockdowel.com'+route);if(url.origin!=='https://build.lockdowel.com')continue;
  const file=url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname;
  assert.ok((await stat(join('dist',file))).isFile(),'Missing sales page asset: '+url.pathname);
 }
 const config=JSON.parse(await readFile('vercel.json','utf8'));
 assert.ok(config.headers.some(rule=>rule.source==='/projects/:path*'&&rule.headers.some(h=>h.key==='X-Robots-Tag'&&h.value.includes('noindex'))),'Production noindex must cover page and its media');
});
test('SCR36 film is available with byte ranges and download files are unchanged',async(t)=>{
 const server=createLocalServer({accessOptions:{verifyPassword:password=>password==='test-password'}});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));
 const base='http://127.0.0.1:'+server.address().port;
 const access=await fetch(base+route+'_access',{method:'POST',headers:{Origin:base,'Content-Type':'application/x-www-form-urlencoded'},body:'password=test-password',redirect:'manual'});assert.equal(access.status,303);const cookie=access.headers.get('set-cookie').split(';')[0];
 const page=await fetch(base+route,{headers:{Cookie:cookie}});assert.equal(page.status,200);assert.match(page.headers.get('x-robots-tag'),/noindex/);await page.text();
 const range=await fetch(base+route+'scr36-film.mp4',{headers:{Range:'bytes=100-199',Cookie:cookie}});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,100);assert.equal(range.headers.get('content-type'),'video/mp4');
 for(const name of ['scr36-film.mp4','finished-concept.jpg','film-poster.png']){
  const hash=async folder=>createHash('sha256').update(await readFile(join(folder,route,name))).digest('hex');
  assert.equal(await hash('public'),await hash('dist'));
 }
 const drawing=await fetch(base+'/projects/scr36/SCR36.pdf',{method:'HEAD',headers:{Cookie:cookie}});assert.equal(drawing.status,200);assert.equal(drawing.headers.get('content-type'),'application/pdf');
});
