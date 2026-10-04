import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
const folder=new URL('../.local/',import.meta.url),file=new URL('scr36-session.json',folder);
export function localProjectSecret(){
 if(process.env.SCR36_SESSION_SECRET)return process.env.SCR36_SESSION_SECRET;
 mkdirSync(folder,{recursive:true});
 try{return JSON.parse(readFileSync(file,'utf8')).secret;}catch(error){
  if(error.code!=='ENOENT')throw error;
  const secret=randomBytes(32).toString('hex');try{writeFileSync(file,JSON.stringify({secret}),{flag:'wx',mode:0o600});return secret;}catch(race){if(race.code==='EEXIST')return JSON.parse(readFileSync(file,'utf8')).secret;throw race;}
 }
}
