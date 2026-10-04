const video=document.querySelector('#project-film');
const buttons=[...document.querySelectorAll('[data-time]')];
const status=document.querySelector('#player-status');
if(video){
 const report=text=>{status.textContent=text;};
 const jump=async(time)=>{
  try{
   if(video.readyState<1){
    await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{cleanup();reject(Error('The film is taking longer to load. Please use the video controls or save the film.'));},15000);const cleanup=()=>{clearTimeout(timer);video.removeEventListener('loadedmetadata',ready);video.removeEventListener('error',failed);};const ready=()=>{cleanup();resolve();};const failed=()=>{cleanup();reject(Error('The film could not load. Use Save the film to open it directly.'));};video.addEventListener('loadedmetadata',ready,{once:true});video.addEventListener('error',failed,{once:true});video.load();});
   }
   video.currentTime=time;await video.play();report('');
  }catch(error){report(error.name==='NotAllowedError'?'Press play in the video to continue.':error.message||'Use the video controls to continue.');}
 };
 buttons.forEach(button=>{button.disabled=false;button.addEventListener('click',()=>jump(Number(button.dataset.time)));});
 document.querySelectorAll('[data-watch]').forEach(link=>link.addEventListener('click',()=>{jump(0);}));
 const update=()=>{const t=video.currentTime;let active=0;buttons.forEach((button,index)=>{if(t>=Number(button.dataset.time))active=index;});buttons.forEach((button,index)=>button.setAttribute('aria-pressed',String(index===active)));};
 video.addEventListener('timeupdate',update);video.addEventListener('seeked',update);
 video.addEventListener('error',()=>report('The film could not load. Use Save the film to open it directly.'));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();});
}
