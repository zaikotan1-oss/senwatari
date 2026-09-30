// オフラインで遊べるようにする。版を上げると古い写しを捨てて取り直す。
const VER="senwatari-v12";
const FILES=["./","index.html","matter.min.js","gen.js","gen_table.js","looks.js","modes.js","stages.js","manifest.webmanifest",
  "icons/icon-180.png","icons/icon-192.png","icons/icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(VER).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VER).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
// 通信できる時は新しい物を取りに行き、だめなら写しを出す（直した版がすぐ届くように）
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(VER).then(ca=>ca.put(e.request,c));return r;})
    .catch(()=>caches.match(e.request,{ignoreSearch:true})));
});
