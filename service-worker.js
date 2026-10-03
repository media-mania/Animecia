const CACHE="animecia-shell-v2";const CORE=["./","./index.html","./anime.html","./ranking.html","./discover.html","./season.html","./memo.html","./offline.html","./site-theme.css","./header.css","./animecia-enhancements.js","./manifest.webmanifest","./icons/icon-192.svg","./icons/icon-512.svg"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET")return;
 const u=new URL(e.request.url);if(u.origin!==location.origin)return;
 const isHtml=e.request.mode==="navigate"||e.request.headers.get("accept")?.includes("text/html");
 if(isHtml){
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("./offline.html"))));
 }else{
  e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(x=>x.put(e.request,cp))}return r}).catch(()=>caches.match("./offline.html"))));
 }
});