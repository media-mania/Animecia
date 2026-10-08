(()=>{try{
  const links=[['preconnect','https://bhgdjuwlxvbaeraaivmh.supabase.co'],['preconnect','https://cdn.jsdelivr.net']];
  for(const [rel,href] of links){
    if(!document.head.querySelector('link[rel="'+rel+'"][href="'+href+'"]')){
      const l=document.createElement('link');l.rel=rel;l.href=href;l.crossOrigin='anonymous';document.head.appendChild(l);
    }
  }
  if('serviceWorker' in navigator) window.addEventListener('load',()=>{
    const script=document.querySelector('script[src*="performance.js"]');
    const sw=new URL('sw.js',script?.src||document.baseURI);
    navigator.serviceWorker.register(sw,{scope:new URL('./',sw).pathname}).catch(()=>{});
  },{once:true});
}catch(e){}})();