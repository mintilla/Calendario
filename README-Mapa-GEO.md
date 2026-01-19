
# Mapa Mundial (GEO) — PWA 2026

Este paquete añade la vista **Mapa mundial** con cómputo de días (histórico + 2026), popup por país y gestor de histórico.

## Archivos
- `Calendario.html`: carga `./world/addon.js`.
- `world/addon.js`: inyecta la UI del mapa y lo pinta usando `world-geo.svg`.
- `world/world-geo.svg`: **Sustituye este placeholder** por un SVG de fronteras reales con `id` ISO‑2.
- `service-worker.js`: `CACHE_NAME = calendario-2026-v9`.

## Sugerencia de SVG GEO con países (IDS ISO-2)
- **Simplemaps (MIT)**: “Free Blank World Map (SVG) con IDs ISO y licencia para uso comercial” (ver página). Copia el SVG y guárdalo como `world/world-geo.svg`.  
  Fuente: simplemaps.com/resources/svg-world  

- Alternativa: **flekschas/simple-world-map** (CC BY-SA 3.0) con IDs ISO (usa `world-map.svg`).

Tras reemplazar `world-geo.svg`, no hay que tocar nada más.
