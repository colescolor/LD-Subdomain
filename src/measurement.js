import {inject,track} from '/vendor/vercel-analytics.js';
const settings=JSON.parse(document.querySelector('#site-settings')?.textContent||'{}');
const publicPaths=new Set(settings.publicPaths||[]);
const cleanPath=(value)=>{try{const path=new URL(value,location.origin).pathname;return publicPaths.has(path)?path:'other';}catch{return 'other';}};
const enabled=settings.analytics===true&&location.hostname!=='localhost'&&location.hostname!=='127.0.0.1'&&navigator.doNotTrack!=='1'&&!navigator.globalPrivacyControl;
if(enabled)inject({mode:'production',beforeSend:event=>{const url=new URL(event.url);url.search='';url.hash='';if(!publicPaths.has(url.pathname))return null;return {...event,url:url.href};}});
const names=new Set(['guide_read','inquiry_started','inquiry_submitted','evaluation_kit_clicked','product_clicked','drawing_downloaded','brief_downloaded','savings_exported','video_started']);
export function measure(name,properties={}){
 if(!names.has(name))return;
 const data={page:cleanPath(location.pathname)};
 if(properties.target)data.target=cleanPath(properties.target);
 // Never pass names, email addresses, free text, file names, or query strings.
 document.dispatchEvent(new CustomEvent('lockdowel:measurement',{detail:{name,properties:data}}));
 if(enabled&&settings.analyticsEvents===true)track(name,data);
}
document.addEventListener('click',event=>{const link=event.target.closest('a');if(!link)return;const url=new URL(link.href,location.origin);if(url.hostname==='lockdowel.com'&&url.pathname==='/evaluation-kits/')measure('evaluation_kit_clicked');else if(url.hostname==='lockdowel.com'&&['/product-list/','/elementor-37341/'].includes(url.pathname))measure('product_clicked');else if(link.hasAttribute('download')&&url.pathname.endsWith('.pdf'))measure('drawing_downloaded');});
document.addEventListener('click',event=>{if(event.target.closest('[data-export-savings]')&&!document.querySelector('[data-export-savings]').disabled)measure('savings_exported');});
document.querySelector('video')?.addEventListener('play',()=>measure('video_started'),{once:true});
if(document.querySelector('.guide-article')){const end=document.querySelector('.guide-review');if(end&&'IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){measure('guide_read');observer.disconnect();}},{threshold:.3});observer.observe(end);}}
