// Guarda la app en el dispositivo para que abra sin conexión.
// Estrategia: responde desde la copia guardada y la actualiza en segundo plano.
const CACHE = 'calendario-v4.3';
const ARCHIVOS = ['./', './index.html', './firebase.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const clave = req.mode === 'navigate' ? './index.html' : req;
  e.respondWith(caches.open(CACHE).then(async c => {
    const guardada = await c.match(clave, { ignoreSearch: true });
    const red = fetch(req).then(r => { if (r.ok) c.put(clave, r.clone()); return r; }).catch(() => guardada);
    return guardada || red;
  }));
});
