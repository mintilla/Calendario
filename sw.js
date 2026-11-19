// Guarda la app en el dispositivo para que abra sin conexión.
// Estrategia: responde desde la copia guardada y la actualiza en segundo plano.
const CACHE = 'calendario-v7.1';
const ARCHIVOS = ['./', './index.html', './firebase.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './pdfjs/pdf.min.mjs', './pdfjs/pdf.worker.min.mjs'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
// Solo borra versiones viejas de la app; nunca la caché de documentos (docs-v1)
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k.startsWith('calendario-')).map(k => caches.delete(k)))).then(() => self.clients.claim()));
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
