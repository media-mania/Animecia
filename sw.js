const CACHE="animecia-static-v5";
const STATIC=/\.(?:css|js|woff2?|png|jpe?g|webp|gif|svg)(?:\?.*)?$/i;
const STATIC_HTML=/^\/Animecia\/(?:anime\/[^/]+\/|genre\/[^/]+\/)/i;
self.addEventListener("install",e=>e.waitUntil(self.skipWaiting()));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  const r=e.request;
  if(r.method!=="GET") return;
  const u=new URL(r.url);
  if(u.origin!==location.origin) return;
  if(STATIC.test(u.pathname)){
    e.respondWith(caches.open(CACHE).then(async c=>{
      const hit=await c.match(r);
      if(hit) return hit;
      try{
        const net=await fetch(r);
        if(net.ok) c.put(r,net.clone());
        return net;
      }catch(e){
        return hit;
      }
    }));
    return;
  }
  if(r.mode==="navigate"&&STATIC_HTML.test(u.pathname)){
    e.respondWith(caches.open(CACHE).then(async c=>{
      const hit=await c.match(r);
      const net=fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res}).catch(()=>hit);
      return hit||net;
    }));
  }
});
