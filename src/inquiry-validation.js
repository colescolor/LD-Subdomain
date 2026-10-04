export const MAX_ATTACHMENT_BYTES=2*1024*1024;
export const MAX_REQUEST_BYTES=3*1024*1024;
export const applications=['Cabinetry','Furniture','Closet systems','Wall panels','Another application'];
export function validateInquiry(body){
 if(!body||typeof body!=='object'||Array.isArray(body))throw new Error('Please complete the inquiry form.');
 const text=(key,max,required=false)=>{const value=body[key];if(value!==undefined&&typeof value!=='string')throw new Error('Invalid '+key+'.');const result=(value||'').trim();if((required&&!result)||result.length>max||/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(result))throw new Error('Please check '+key+'.');return result;};
 if(text('website',300))throw new Error('The inquiry could not be accepted.');
 const data={contactName:text('contactName',100,true),email:text('email',254,true),company:text('company',150),application:text('application',40,true),material:text('material',200,true),volume:text('volume',100),question:text('question',3000,true),source:text('source',160),product:text('product',50)};
 if(!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email))throw new Error('Enter a valid email address.');
 if(!applications.includes(data.application))throw new Error('Choose an application.');
 if(data.question.length<10)throw new Error('Please add a little more detail to your review question.');
 if(body.consent!==true)throw new Error('Please agree to share your inquiry with Lockdowel.');
 if(data.source&&!/^\/(?:guides\/(?:how-channel-lock-connectors-work|e3259bm-assembly-sequence|planning-cabinet-assembly-order)?\/?|how-to\/e3259bm\/|drawings\/(?:boat-table|open-cubby|angled-table)\/|savings\/|explore\/|start-project\/)?$/.test(data.source))data.source='';
 if(!['Channel lock','E3259BM','Cabinet assembly',''].includes(data.product))data.product='';
 data.consent=true;
 if(body.attachment!==undefined&&body.attachment!==null){const a=body.attachment;if(!a||typeof a!=='object'||typeof a.name!=='string'||a.name.length>150||/[\x00-\x1F\/\\]/.test(a.name)||typeof a.content!=='string'||!/^[A-Za-z0-9+/]+={0,2}$/.test(a.content))throw new Error('Choose a valid drawing file.');const rules={'application/pdf':/\.pdf$/i,'image/png':/\.png$/i,'image/jpeg':/\.jpe?g$/i};if(!rules[a.type]?.test(a.name))throw new Error('Choose a PDF, PNG, or JPEG drawing.');if(a.content.length>Math.ceil(MAX_ATTACHMENT_BYTES/3)*4)throw new Error('Drawing files must be 2 MB or smaller.');const bytes=Buffer.from(a.content,'base64');if(!bytes.length||bytes.length>MAX_ATTACHMENT_BYTES||bytes.toString('base64')!==a.content)throw new Error('Choose a valid drawing file, up to 2 MB.');const valid=a.type==='application/pdf'?bytes.subarray(0,5).toString()==='%PDF-':a.type==='image/png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):bytes[0]===255&&bytes[1]===216&&bytes[2]===255;if(!valid)throw new Error('The drawing content does not match its file type.');data.attachment={name:a.name,type:a.type,content:a.content};}
 return data;
}
