
const CACHE_NAME = 'calendario-2026-v4';
const CORE_ASSETS = [
  './Calendario.html',
  './manifest.json',
  './icons/icon-192.png','./icons/icon-512.png',
  './world/world.svg','./world/mapa.css','./world/mapa.js'
];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(CORE_ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil((async()=>{const keys=await caches.keys(); await Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))); await self.clients.claim();})());
});
self.addEventListener('fetch', (event) => {
  const r = event.request;
  if (r.mode === 'navigate' || r.destination === 'document') {
    event.respondWith((async()=>{try{const fresh=await fetch(r); const c=await caches.open(CACHE_NAME); c.put('./Calendario.html', fresh.clone()); return fresh;}catch{const c=await caches.open(CACHE_NAME); return (await c.match('./Calendario.html')) || new Response('Offline',{status:503});}})());
    return;
  }
  if(['style','script','image','font'].includes(r.destination)){
    event.respondWith((async()=>{const c=await caches.open(CACHE_NAME); const cached=await c.match(r); if(cached) return cached; try{const fresh=await fetch(r); c.put(r,fresh.clone()); return fresh;}catch{return new Response('',{status:404});}})());
  }
});
