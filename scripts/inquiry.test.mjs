import test from 'node:test';
import assert from 'node:assert/strict';
import {handleInquiry} from '../api/inquiries.js';
import {validateInquiry,MAX_REQUEST_BYTES} from '../src/inquiry-validation.js';
const env={VERCEL_ENV:'production',SITE_URL:'https://build.lockdowel.com',INQUIRY_WEBHOOK_URL:'https://receiver.example.test/inquiries',INQUIRY_WEBHOOK_TOKEN:'test-only-token'};
const good={contactName:'Sample Customer',email:'customer@example.test',company:'Example Shop',application:'Cabinetry',material:'18 mm plywood',volume:'100 per month',question:'Can the shelf complete the sliding movement after the back is installed?',consent:true,source:'/guides/planning-cabinet-assembly-order/',product:'Cabinet assembly'};
const request=(body=good,extra={})=>new Request('https://build.lockdowel.com/api/inquiries',{method:'POST',headers:{Origin:'https://build.lockdowel.com','Content-Type':'application/json',...extra},body:typeof body==='string'?body:JSON.stringify(body)});
test('unconfigured and preview inquiries fail visibly without outbound delivery',async()=>{
 let calls=0;for(const config of [{},{...env,VERCEL_ENV:'preview'},{...env,INQUIRY_WEBHOOK_URL:''}]){const status=await handleInquiry(new Request('https://build.lockdowel.com/api/inquiries'),{env:config});assert.equal((await status.json()).available,false);const result=await handleInquiry(request(),{env:config,send:async()=>{calls++;}});assert.equal(result.status,503);}assert.equal(calls,0);
});
test('accepted inquiries reach the configured service with source context and private attachment',async()=>{
 const content=Buffer.from('%PDF-1.7\nTest fixture').toString('base64');let sent;
 const response=await handleInquiry(request({...good,attachment:{name:'drawing.pdf',type:'application/pdf',content}}),{env,rateLimit:()=>false,send:async(url,options)=>{sent={url,options,body:JSON.parse(options.body)};return new Response(null,{status:202});}});
 assert.equal(response.status,200);const result=await response.json();assert.equal(result.accepted,true);assert.equal(sent.url,env.INQUIRY_WEBHOOK_URL);assert.equal(sent.body.source,good.source);assert.equal(sent.body.attachment.content,content);assert.equal(sent.body.reference,result.reference);assert.equal(sent.options.redirect,'error');assert.equal(sent.options.headers.Authorization,'Bearer test-only-token');assert.ok(!('email'in result));assert.equal(response.headers.get('cache-control'),'no-store');
});
test('invalid input, forged origins, and unsupported attachments cannot reach the receiving service',async()=>{
 let calls=0;const options={env,rateLimit:()=>false,send:async()=>{calls++;return new Response(null,{status:200});}};
 for(const body of [{...good,email:'bad'},{...good,consent:false},{...good,website:'https://spam.test'},{...good,application:'Invalid'}, {...good,question:'short'}, {...good,contactName:['array']},{...good,attachment:{name:'drawing.pdf',type:'application/pdf',content:Buffer.from('<script>bad</script>').toString('base64')}},{...good,attachment:{name:'../drawing.pdf',type:'application/pdf',content:'JVBERi0='}}]){assert.equal((await handleInquiry(request(body),options)).status,400);}
 assert.equal((await handleInquiry(request(good,{Origin:'https://attacker.test'}),options)).status,403);assert.equal((await handleInquiry(request(good,{'Content-Type':'text/plain'}),options)).status,415);assert.equal((await handleInquiry(request('{bad'),options)).status,400);assert.equal((await handleInquiry(request(good,{'Content-Length':String(MAX_REQUEST_BYTES+1)}),options)).status,413);assert.equal((await handleInquiry(request(),{...options,rateLimit:()=>true})).status,429);assert.equal(calls,0);
 const sanitized=validateInquiry({...good,source:'https://attacker.test/?email=secret',product:'arbitrary'});assert.equal(sanitized.source,'');assert.equal(sanitized.product,'');
});
test('upstream failures never report an accepted inquiry',async()=>{
 for(const send of [async()=>new Response('provider secret error',{status:500}),async()=>{throw new Error('timeout');}]){const response=await handleInquiry(request(),{env,send,rateLimit:()=>false});assert.equal(response.status,502);const result=await response.json();assert.notEqual(result.accepted,true);assert.doesNotMatch(JSON.stringify(result),/provider secret/);}
});
