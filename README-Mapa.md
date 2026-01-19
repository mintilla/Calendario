
# Add-on Mapa Mundial (PWA 2026)

## Qué incluye
- `Calendario.html` (tu HTML con 2 cambios mínimos):
  - Botones en paralelo: **Mis viajes** y **Mapa mundial**.
  - Nueva vista `#vistaMapa` + popup.
  - Ventana de **gestión de histórico** (días antes de 2026).
- `/world/world.svg` → Mapa **tile-map** (cuadrículas ISO) ligero y offline.
- `/world/mapa.css`, `/world/mapa.js` → estilos y lógica del mapa.
- `service-worker.js` → `CACHE_NAME` subido a **v4** y assets nuevos en caché.

> Nota: este SVG es una versión *tile map* (tipo cartograma) simplificada para móvil. Si prefieres fronteras reales por país, puedo sustituir `world.svg` por un mapa detallado sin cambiar el resto del código.

## Cómo instalar
1. Sube el **contenido** de esta carpeta al **root** de tu repo (no la carpeta en sí).
2. Acepta **sustituir** `Calendario.html` y `service-worker.js` cuando te lo pida.
3. Commit changes y espera 1–2 minutos a que GitHub Pages despliegue.
4. Abre la URL en Safari. Si no ves el mapa a la primera: recarga o reinstala la PWA.

## Gestión del histórico
- Botón **📝 Gestionar histórico** en la vista del mapa.
- Guarda en `localStorage` (`historico-viajes`).
- **Exportar/Importar**: el JSON añade el bloque `historico` automáticamente.

## Personalizar colores
En `world/mapa.css` puedes ajustar las clases:
```
.visitado-1-3  { fill:#C8E6C9; }
.visitado-4-9  { fill:#81C784; }
.visitado-10p  { fill:#388E3C; }
```

## Siguientes pasos (opcionales)
- Sustituir `world.svg` por un mapa mundial con fronteras reales (ISO-2 por `id`).
- Añadir zoom/pan y leyenda de colores.
- Completar el diccionario `ISO_BY_PAIS` si incluyes más países.
