
# CACHE BREAKER - INSTALACIÓN

Este paquete **NO toca tu Calendario.html**. 
PERO necesitas añadir manualmente 2 líneas en tu Calendario.html (lo menos invasivo posible).

## 1️⃣ Mete estos 2 ficheros en el root del repo

- /world/addon_break_99127.js
- /service-worker-v11.js

## 2️⃣ Añade ESTAS 2 líneas ANTES de </body> en tu Calendario.html

```html
<script src="./world/addon_break_99127.js"></script>
<script src="./service-worker-v11.js"></script>
```

## 3️⃣ Sube a GitHub y espera 1–2 minutos
## 4️⃣ Borra la PWA
## 5️⃣ Abre la URL en Safari → recarga fuerte
## 6️⃣ Vuelve a instalar la PWA

Esto **rompe completamente la caché**.
Los botones aparecerán **sí o sí** EN PARALELO.
