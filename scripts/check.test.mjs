import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pages,shell} from '../src/pages.mjs';
import {calculateSavings} from '../src/calculator.js';
import {createLocalServer} from './serve.mjs';
test('calculator handles positive, negative, zero and invalid scenarios',()=>{
 const s=calculateSavings({units:500,before:20,after:12,rate:35});assert.ok(Math.abs(s.money-2333.333333)<.001);assert.equal(s.percent,40);
 assert.equal(calculateSavings({units:60,before:2,after:4,rate:30}).money,-60);
 assert.equal(calculateSavings({units:0,before:0,after:0,rate:0}).money,0);
 assert.equal(calculateSavings({units:2,before:0,after:1,rate:1}).percent,null);
 for(const value of [-1,NaN,Infinity,10000001,.5])assert.equal(calculateSavings({units:value,before:20,after:12,rate:35}),null);
});
test('every local link and media reference resolves; metadata is unique and local pages noindex',async()=>{
 const titles=new Set();for(const page of pages){const html=await readFile(join('dist',page.path,'index.html'),'utf8');assert.match(html,/<meta name="robots" content="noindex, nofollow">/);assert.equal((html.match(/<h1[ >]/g)||[]).length,1);assert.ok(!titles.has(page.title));titles.add(page.title);
 for(const [,url]of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)){const file=url.endsWith('/')?url+'index.html':url;assert.ok((await stat(join('dist',file))).isFile(),`Missing ${url} on ${page.path}`);}
 const json=html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);assert.equal(JSON.parse(json[1])['@type'],'WebPage');
 }
 assert.match(shell(pages[0],true),/content="index, follow"/);assert.match(shell(pages.find(p=>p.private),true),/content="noindex, nofollow"/);
 assert.match(await readFile('dist/robots.txt','utf8'),/Disallow: \//);
});
test('local server returns pages, safe paths, video ranges and actual 404s',async(t)=>{
 const server=createLocalServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));const base=`http://127.0.0.1:${server.address().port}`;
 for(const page of pages){const r=await fetch(base+page.path);assert.equal(r.status,200);assert.equal(r.headers.get('x-robots-tag'),'noindex, nofollow');await r.text();}
 const partial=await fetch(base+'/assets/e3259bm-align-seat-slide.mp4',{headers:{Range:'bytes=100-199'}});assert.equal(partial.status,206);assert.equal((await partial.arrayBuffer()).byteLength,100);assert.equal(partial.headers.get('content-type'),'video/mp4');
 const suffix=await fetch(base+'/assets/e3259bm-align-seat-slide.mp4',{headers:{Range:'bytes=-32'}});assert.equal((await suffix.arrayBuffer()).byteLength,32);
 const invalid=await fetch(base+'/assets/e3259bm-align-seat-slide.mp4',{headers:{Range:'bytes=999999999-'}});assert.equal(invalid.status,416);await invalid.text();
 const missing=await fetch(base+'/missing/');assert.equal(missing.status,404);await missing.text();
 const method=await fetch(base+'/',{method:'POST'});assert.equal(method.status,405);await method.text();
 const escape=await fetch(base+'/%2e%2e%5cpackage.json');assert.equal(escape.status,400);await escape.text();
 const head=await fetch(base+'/assets/boat-table-drawing.pdf',{method:'HEAD'});assert.equal(head.status,200);assert.equal(head.headers.get('content-type'),'application/pdf');
});
