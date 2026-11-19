// Guarda la app en el dispositivo para que abra sin conexión.
// Estrategia: responde desde la copia guardada y la actualiza en segundo plano.
const CACHE = 'calendario-v8.2';
const ARCHIVOS = ['./', './index.html', './firebase.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './pdfjs/pdf.min.mjs', './pdfjs/pdf.worker.min.mjs'];

self.addEventListener('install', e => {
  // cache:'reload' evita la caché HTTP de GitHub Pages (10 min) al instalar una versión nueva
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
// Solo borra versiones viejas de la app; nunca la caché de documentos (docs-v1)
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k.startsWith('calendario-')).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.endsWith('/sw.js')) return;
  const clave = req.mode === 'navigate' ? './index.html' : req;
  e.respondWith(caches.open(CACHE).then(async c => {
    const guardada = await c.match(clave, { ignoreSearch: true });
    const red = fetch(req.url, { cache: 'no-cache' }).then(r => { if (r.ok) c.put(clave, r.clone()); return r; }).catch(() => guardada);
    return guardada || red;
  }));
});
