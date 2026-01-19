
# Calendario Torres de Elorz 2026 (PWA)

Este paquete contiene tu `Calendario.html` (parcheado con 2 bloques **mínimos** para PWA) más los ficheros necesarios para instalar en iOS/Android y funcionar **offline**.

## Contenido
```
Calendario-PWA-GitHub/
├─ Calendario.html              # TU archivo (idéntico + 2 inyecciones PWA)
├─ Calendario.original.html     # Copia exacta del original que nos pasaste
├─ index.html                   # Redirige a Calendario.html (útil en GitHub Pages)
├─ manifest.json
├─ service-worker.js
├─ pwa-init.js
├─ icons/
│  ├─ icon-192.png
│  └─ icon-512.png
└─ .nojekyll
```

## Despliegue en GitHub Pages
1. Sube esta carpeta a un repositorio (root del repo).
2. En el repo: **Settings → Pages → Build and deployment → Deploy from branch**.
   - **Branch**: `main` (o la que uses)
   - **Folder**: `/ (root)`
3. Abre la URL pública de Pages. Se cargará `index.html` y te redirigirá a `Calendario.html`.
4. En iPhone (Safari): **Compartir → Añadir a pantalla de inicio**.
   - El primer acceso con conexión instala el **service worker** y ya funciona **offline**.

## Notas
- Si prefieres NO tocar `Calendario.html`, puedes reemplazarlo por `Calendario.original.html` y mantener la PWA gracias a `index.html` + `pwa-init.js` (la instalación se haría desde `index.html`).
- Si cambias el nombre del archivo principal, ajusta `start_url` en `manifest.json` y, si quieres, la lista `CORE_ASSETS` del `service-worker.js`.
- Sustituye los iconos por los de tu marca cuando quieras.
```
