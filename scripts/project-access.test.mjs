import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {projectAccess,issueSession,validSession,isProtected,LANDING,ACCESS,COOKIE,SESSION_SECONDS} from '../server/project-access.js';
import middleware from '../middleware.js';
import {createLocalServer} from './serve.mjs';
const secret='test-session-secret-with-at-least-32-characters',origin='https://build.example.com';
const login=(password,options={})=>new Request(origin+ACCESS,{method:'POST',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({password}),...options});
test('password gate rejects incorrect passwords, forged sessions, expiry and cross-origin posts',async()=>{
 const opts={secret,rateLimit:()=>false,verifyPassword:password=>password==='test-password'};
 const wrong=await projectAccess(login('incorrect'),opts);assert.equal(wrong.status,401);assert.match(await wrong.text(),/password didn’t match/);assert.equal(wrong.headers.get('set-cookie'),null);
 const good=await projectAccess(login('test-password'),opts);assert.equal(good.status,303);assert.equal(good.headers.get('location'),LANDING);
 const cookie=good.headers.get('set-cookie');assert.match(cookie,/HttpOnly/);assert.match(cookie,/SameSite=Strict/);assert.match(cookie,/Secure/);assert.match(cookie,/Path=\/projects\/scr36/);
 const token=cookie.split(';')[0].slice(COOKIE.length+1);assert.ok(validSession(token,secret));assert.ok(!validSession(token.slice(0,-1)+'!',secret));assert.ok(!validSession(token,secret,Date.now()+(SESSION_SECONDS+1)*1000));
 assert.equal(await projectAccess(new Request(origin+LANDING,{headers:{Cookie:COOKIE+'='+token}}),opts),null);
 const forged=await projectAccess(new Request(origin+LANDING,{headers:{Cookie:COOKIE+'=lowes'}}),opts);assert.equal(forged.status,401);
 const csrf=await projectAccess(login('test-password',{headers:{Origin:'https://other.example','Content-Type':'application/x-www-form-urlencoded'}}),opts);assert.equal(csrf.status,403);
 const limit=await projectAccess(login('test-password'),{secret,rateLimit:()=>true});assert.equal(limit.status,429);
 const unavailable=await projectAccess(new Request(origin+LANDING),{secret:''});assert.equal(unavailable.status,503);
 const logout=await projectAccess(new Request(origin+ACCESS+'/logout',{method:'POST',headers:{Origin:origin,Cookie:COOKIE+'='+token}}),opts);assert.match(logout.headers.get('set-cookie'),/Max-Age=0/);
});
test('all SCR36 media and path variants require access; unrelated pages stay public',async()=>{
 for(const path of [LANDING,LANDING+'index.html',LANDING+'scr36-film.mp4','/projects/scr36/SCR36.pdf','/projects/scr36/SCR36-instruction-manual-2026-06-25.xlsx','/projects/%73cr36/preview/','/PROJECTS/SCR36/preview/','/projects//scr36/preview/','/projects/scr36./preview/']){
  assert.ok(isProtected(origin+path),path);const r=await projectAccess(new Request(origin+path),{secret});assert.equal(r.status,401,path);assert.match(r.headers.get('cache-control'),/no-store/);assert.match(r.headers.get('x-robots-tag'),/noindex/);assert.doesNotMatch(await r.text(),/Your drawing\.|scr36-film\.mp4|value="test-password"/);
 }
 for(const path of ['/','/parts/','/start-project/','/projects/boat-table/'])assert.equal(await projectAccess(new Request(origin+path),{secret}),null);
 assert.equal((await middleware(new Request(origin+LANDING))).status,503);
 assert.equal((await middleware(new Request(origin+'/'))).headers.get('x-middleware-next'),'1');
});
test('HTTP requests cannot bypass protection with HEAD, Range or a direct asset URL',async t=>{
 const server=createLocalServer({accessOptions:{verifyPassword:password=>password==='test-password'}});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));const base='http://127.0.0.1:'+server.address().port;
 for(const path of [LANDING,LANDING+'scr36-film.mp4','/projects/scr36/SCR36.pdf',LANDING+'finished-concept.jpg'])for(const method of ['GET','HEAD']){
  const r=await fetch(base+path,{method,headers:{Range:'bytes=0-99'}});assert.equal(r.status,401);if(method==='HEAD')assert.equal((await r.arrayBuffer()).byteLength,0);else assert.match(await r.text(),/Project password/);
 }
 const allowed=await fetch(base+ACCESS,{method:'POST',headers:{Origin:base,'Content-Type':'application/x-www-form-urlencoded'},body:'password=test-password',redirect:'manual'});assert.equal(allowed.status,303);const cookie=allowed.headers.get('set-cookie').split(';')[0];
 const movie=await fetch(base+LANDING+'scr36-film.mp4',{headers:{Cookie:cookie,Range:'bytes=0-99'}});assert.equal(movie.status,206);assert.equal((await movie.arrayBuffer()).byteLength,100);
 const html=await (await fetch(base+LANDING,{headers:{Cookie:cookie}})).text();assert.match(html,/Your drawing\./);assert.doesNotMatch(html,/test-password|PASSWORD_HASH|SCR36_SESSION_SECRET/);
 const browserCode=await readFile('public/projects/scr36/preview/presentation.js','utf8');assert.doesNotMatch(browserCode,/test-password|PASSWORD_HASH|SCR36_SESSION_SECRET/);
});
