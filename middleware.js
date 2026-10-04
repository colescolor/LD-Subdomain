import {next} from '@vercel/functions';
import {projectAccess,isProtected,privateHeaders} from './server/project-access.js';
export const config={runtime:'nodejs'};
export default async function middleware(request){
 const denied=await projectAccess(request);
 if(denied)return denied;
 return next(isProtected(request.url)?{headers:privateHeaders}:undefined);
}
