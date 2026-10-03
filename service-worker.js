const CACHE="animecia-shell-v1";const CORE=["./","./index.html","./anime.html","./ranking.html","./discover.html","./season.html","./memo.html","./offline.html","./site-theme.css","./header.css","./animecia-enhancements.js","./manifest.webmanifest"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET")return;
 const u=new URL(e.request.url);if(u.origin!==location.origin)return;
 e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(x=>x.put(e.request,cp))}return r}).catch(()=>caches.match("./offline.html"))));
});