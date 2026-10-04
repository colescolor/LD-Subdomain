import {measure} from './measurement.js';
const form=document.querySelector('#project-inquiry');
if(form){
 const status=document.querySelector('#inquiry-status'),send=document.querySelector('#inquiry-send');let available=false,busy=false,started=false;
 const settings=JSON.parse(document.querySelector('#site-settings')?.textContent||'{}');const allowed=new Set(settings.publicPaths||[]);const params=new URLSearchParams(location.search);let source=params.get('source')||'';if(!allowed.has(source))source='';const products=['Channel lock','E3259BM','Cabinet assembly'];const product=products.includes(params.get('product'))?params.get('product'):'';
 if(source||product){const context=document.querySelector('#inquiry-context');context.hidden=false;context.textContent=product?'Your inquiry is about '+product+'.':'You arrived from a Lockdowel Build guide or study.';}
 const message=(text,error=false)=>{status.textContent=text;status.dataset.error=String(error);};
 fetch('/api/inquiries',{headers:{Accept:'application/json'},cache:'no-store'}).then(r=>{if(!r.ok)throw new Error();return r.json();}).then(data=>{available=data.available===true;send.disabled=!available;message(available?'Your inquiry will be sent to the Lockdowel team.':'Online submissions are not available yet. You can prepare and save your brief, then contact Lockdowel directly.');}).catch(()=>message('Online submissions are unavailable in this preview. Save your brief or use the direct contact link.'));
 form.addEventListener('input',()=>{if(!started){started=true;measure('inquiry_started');}});
 const values=()=>({contactName:form.elements.contactName.value.trim(),email:form.elements.email.value.trim(),company:form.elements.company.value.trim(),application:form.elements.application.value,material:form.elements.material.value.trim(),volume:form.elements.volume.value.trim(),question:form.elements.question.value.trim(),website:form.elements.website.value,consent:form.elements.consent.checked,source,product});
 document.querySelector('#download-brief').addEventListener('click',()=>{const data=values();const text=['LOCKDOWEL PROJECT INQUIRY','',...Object.entries(data).filter(([k])=>!['website','consent'].includes(k)).map(([k,v])=>k+': '+(v||'Not provided')),'','Saved locally. This download does not submit the inquiry.','Any selected drawing must be attached separately.'].join('\n');const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='lockdowel-project-inquiry.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);measure('brief_downloaded');message('A copy was saved to your downloads. This does not submit the inquiry.');});
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;if(!available){message('Online submissions are unavailable. Save your brief and contact the team directly.',true);return;}
  if(!form.reportValidity())return;const data=values();const file=form.elements.drawing.files[0];
  if(file){if(!['application/pdf','image/png','image/jpeg'].includes(file.type)||file.size>2*1024*1024||!file.size){message('Choose a PDF, PNG, or JPEG drawing up to 2 MB.',true);form.elements.drawing.focus();return;}}
  busy=true;send.disabled=true;send.textContent='Sending…';message('Sending your project inquiry…');
  try{
   if(file){const content=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=reject;reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(file);});data.attachment={name:file.name,type:file.type,content};}
   const response=await fetch('/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(18000)});const result=await response.json();if(!response.ok||result.accepted!==true||typeof result.reference!=='string')throw new Error(result.error||'We could not confirm delivery. Please save your brief and contact the team directly.');
   measure('inquiry_submitted');message('Your project inquiry was submitted. Reference: '+result.reference);form.reset();send.textContent='Inquiry submitted';available=false;
  }catch(error){message(error.name==='TimeoutError'?'We could not confirm delivery. Save your brief and contact the team directly before resubmitting.':error.message||'The inquiry could not be sent. Save your brief and try again later.',true);send.textContent='Send project inquiry ↗';}finally{busy=false;send.disabled=!available;}
 });
}
