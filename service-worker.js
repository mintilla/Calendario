
const CACHE_NAME = 'calendario-2026-v1';
const CORE_ASSETS = [
  './Calendario.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put('./Calendario.html', fresh.clone());
        return fresh;
      } catch (err) {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match('./Calendario.html')) || new Response('Offline', {status: 503});
      }
    })());
    return;
  }
  if (['style','script','image','font'].includes(req.destination)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (err) {
        return new Response('', {status: 404});
      }
    })());
  }
});
