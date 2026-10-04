export function siteOrigin(env=process.env){
 const url=new URL(env.SITE_URL||'https://build.lockdowel.com');
 if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw new Error('SITE_URL must be an HTTPS origin without a path or credentials.');
 return url.origin;
}
export function productionBuild(env=process.env,args=process.argv){return env.VERCEL_ENV?env.VERCEL_ENV==='production':args.includes('--production');}
export const htmlEscape=(value)=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function jsonLd(value){return JSON.stringify(value).replaceAll('<','\\u003c');}
export function extraSeo(page,domain,production){
 const schemas=[];
 if(page.guide){schemas.push({'@context':'https://schema.org','@type':'Article',headline:page.guide.title,description:page.description,mainEntityOfPage:domain+page.path,image:domain+'/assets/'+page.guide.image,dateModified:'2026-10-04',author:{'@type':'Organization',name:'Lockdowel Build',url:domain},publisher:{'@type':'Organization',name:'Lockdowel',url:'https://lockdowel.com'}});}
 if(page.path!=='/'&&page.path!=='/404/')schemas.push({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Lockdowel Build',item:domain+'/'},...(page.guide?[{'@type':'ListItem',position:2,name:'Technical guides',item:domain+'/guides/'}]:[]),{'@type':'ListItem',position:page.guide?3:2,name:page.guide?.title||page.title.split(' | ')[0],item:domain+page.path}]});
 const token=process.env.GOOGLE_SITE_VERIFICATION;const verification=production&&token?`<meta name="google-site-verification" content="${htmlEscape(token)}">`:'';
 return verification+schemas.map(schema=>`<script type="application/ld+json">${jsonLd(schema)}</script>`).join('');
}
