import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {productionBuild,siteOrigin} from '../src/seo.mjs';
import {guidePages} from '../src/guides.mjs';
const exec=promisify(execFile);
test('production indexing follows Vercel deployment context; previews cannot opt into indexing',()=>{
 assert.equal(productionBuild({VERCEL_ENV:'preview'},['--production']),false);assert.equal(productionBuild({VERCEL_ENV:'production'},[]),true);assert.equal(productionBuild({},[]),false);assert.equal(productionBuild({},['--production']),true);
 assert.equal(siteOrigin({SITE_URL:'https://build.example.com'}),'https://build.example.com');for(const SITE_URL of ['http://example.com','https://example.com/path','https://user:pass@example.com','https://example.com?token=abc'])assert.throws(()=>siteOrigin({SITE_URL}));
});
test('production build publishes the guide sitemap and metadata while retaining project exclusions',async()=>{
 const output=await mkdtemp(join(tmpdir(),'lockdowel-seo-'));
 try{
  await exec(process.execPath,['scripts/build.mjs','--out='+output],{env:{...process.env,VERCEL_ENV:'production',SITE_URL:'https://build.example.com',WEB_ANALYTICS_ENABLED:'true',WEB_ANALYTICS_EVENTS:'false',GOOGLE_SITE_VERIFICATION:'test-verification'}});
  const sitemap=await readFile(join(output,'sitemap.xml'),'utf8');assert.doesNotMatch(sitemap,/\/projects\//);
  for(const page of guidePages){assert.ok(sitemap.includes('https://build.example.com'+page.path));const html=await readFile(join(output,page.path,'index.html'),'utf8');assert.match(html,/content="index, follow"/);assert.ok(html.includes('rel="canonical" href="https://build.example.com'+page.path+'"'));assert.match(html,/name="google-site-verification" content="test-verification"/);assert.match(html,/"analytics":true/);const schemas=[...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m=>JSON.parse(m[1]));assert.ok(schemas.some(s=>s['@type']==='BreadcrumbList'));if(page.guide)assert.ok(schemas.some(s=>s['@type']==='Article'));}
  for(const path of ['projects/boat-table','projects/scr36'])assert.match(await readFile(join(output,path,'index.html'),'utf8'),/content="noindex, nofollow"/);
  const presentation=await readFile(join(output,'projects/scr36/preview/index.html'),'utf8');assert.match(presentation,/content="noindex, nofollow, noimageindex"/);assert.doesNotMatch(presentation,/measurement\.js|analytics/);
  const robots=await readFile(join(output,'robots.txt'),'utf8');assert.match(robots,/Allow: \//);assert.doesNotMatch(robots,/Disallow: \/projects/);assert.match(robots,/Sitemap: https:\/\/build.example.com\/sitemap.xml/);
  const home=await readFile(join(output,'index.html'),'utf8');assert.match(home,/href="\/guides\/"/);assert.match(home,/href="\/guides\/how-channel-lock-connectors-work\/"/);
 }finally{await rm(output,{recursive:true,force:true});}
});
