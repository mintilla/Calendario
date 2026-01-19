
const CACHE_NAME='force-break-v11-'+Math.random();
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim());});
