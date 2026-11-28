# Calendario Torres de Elorz — cómo trabajamos

App personal de Mikel: calendario laboral de MTorres, vacaciones (bolsa de horas), viajes de trabajo, documentos de viaje y horas de viaje. Léelo entero antes de tocar nada.

## 1. Cómo trabaja Mikel
- **Hablar antes de hacer.** Cuando pida algo, explica qué vas a cambiar y espera. Si es diseño, enséñale antes una maqueta.
- **No publicar sin su «adelante».** Junta varios cambios y sácalos en una sola versión, no una por cada petición. Si dudas, pregunta.
- **No hacer menos de lo que pidió.** Si se pide algo, se hace entero o se dice qué falta.
- **No inventar categorías ni datos.** Si no sabes qué es algo (p. ej. un nombre en un viaje), pregúntale.
- **Guiarle paso a paso**, de uno en uno, con los nombres exactos de botones y menús. No es programador.
- **Respuestas cortas, en castellano.** Sin repetir lo que ya está resuelto.
- **Nunca pedirle que pegue claves**, contraseñas ni tokens en el chat.
- **No mostrar euros ni su precio por hora** en la app: la enseña a otros. Solo horas.

## 2. Cómo se publica
- **Repo:** `mintilla/Calendario`, rama única `main`. Es público.
- **Web:** GitHub Pages, https://mintilla.github.io/Calendario/. Se sirve desde la raíz de `main`, sin compilación.
- **Datos:** Firebase, proyecto `calendario-torres` (Firestore + Authentication con email y contraseña). El SDK va empaquetado en `firebase.js`.
- **Archivos:**
  - `index.html` lleva toda la app: HTML, CSS y JS en un solo archivo.
  - `sw.js` es el service worker.
  - `version.json` guarda el identificador de la versión publicada.
  - `pdfjs/` es el visor de PDF.
- **Versión:** sube `const VERSION` en `index.html` (v11.1, v11.2…).
- **Publicar:** `./publicar.sh "mensaje"`. El script hace esto:
  - pone el mismo `BUILD`, que es la fecha y hora de Madrid, en `index.html`, `sw.js` y `version.json`;
  - hace el commit;
  - sube a `main`.

  Haz `git pull` antes, porque puede haber cambios de otros chats.
- **Antes de publicar:**
  1. Comprobar la sintaxis de los scripts de `index.html` con node `new Function(...)`.
  2. Probarlo en un servidor local (`python3 -m http.server`) con Chrome headless y puppeteer-core. Para no tocar Firebase, cambia el `<script type="module">` por datos de prueba.
  3. Mirar capturas en tamaño de móvil y de PC.

## 3. Decisiones que no hay que deshacer
**Plataforma**
- GitHub Pages y no Netlify: a Mikel le preocupaban los créditos del plan gratis. Además, github.io carga en el PC del trabajo, donde Zscaler sí bloquea la consola de Firebase.
- Firebase en vez de Google Sheets o un NAS: tiene que funcionar sin cobertura y desde el PC del trabajo, donde no hay Tailscale.
- Copia completa en el dispositivo y caché de Firestore: la app tiene que abrir siempre, con o sin conexión.
- Solo se suben a la nube los cambios, en cola si no hay conexión: así no se pisan datos entre el móvil y el PC.
- En el iPhone solo sincroniza con la app abierta. Por eso existe el aviso de «cambios pendientes de subir».

**Actualizaciones (v9.8–v9.9)**
- La app se actualiza sola, sin aviso ni botón. Comprueba `version.json` al abrir, al volver a la app y cada 15 min si lleva 2 min sin tocarse.
- No recarga con un modal, hoja o visor abiertos, con el cursor en un campo, en modo reservar, editando horas o con cambios sin subir.
- Antes de recargar comprueba que el `index.html` nuevo ya está publicado y lo mete en la caché del service worker. Si no lo hiciera, cargaría la versión vieja.
- El BUILD lo genera `publicar.sh` UNA vez y escribe ese mismo valor en los tres archivos. Nunca generarlo por separado ni con `Date.now()` en la app: en la app de la Sociedad salían distintos y recargaba sin parar.
- Seguro antibucle: `localStorage['ultima-recarga-auto']`; nunca dos recargas automáticas en menos de 5 min.
- Tras actualizarse sale arriba «✨ App actualizada · vX (dd/mm hh:mm)» si cambió el BUILD (aunque no cambie el número): sin él, la recarga parece un parpadeo sin motivo.
- El service worker nunca sirve `version.json` ni las peticiones con `?t=` desde la caché: si no, la comprobación del `index.html` nuevo recibía la copia vieja y al volver a la app no se actualizaba hasta cerrarla y abrirla.
- `HOY` es `let` y se recalcula al volver a la app, con el foco y cada minuto (`refrescarHoy`): la app puede quedarse abierta varios días (PC) o volver de segundo plano (iPhone).

**Icono y nombre (v10.2)**
- Icono elegido tras muchas pruebas: fondo gris medio (#6B7280), hoja de calendario blanca **centrada** con cabecera naranja (#F97316), días como puntos grises y un día marcado en naranja con un avión blanco dentro. Nada sobresale de la hoja: le molestaba que el dibujo quedara descentrado. Descartó el «17» morado y rosa, fondos azules y verdes, y el avión saliendo fuera.
- La app se llama **«Mis viajes»** en todas partes: bajo el icono, título, pestaña del navegador, pantallas de carga y entrada, barra lateral del PC, Face ID y evento .ics. Mikel quiere un solo nombre, coherente en toda la app. Lo interno (proyecto de Firebase, repo, `tipo` del backup) no se cambia.
- `apple-touch-icon.png` e `icon-maskable-512.png` van a sangre (sin esquinas redondeadas): el sistema las recorta.

**Estructura (v11.0)**
- Pestañas, en este orden: **Calendario · Viajes · Vacaciones · Estadísticas · Más**. Viajes va antes que Vacaciones porque entra más a los viajes.
- El **Calendario es la pantalla principal** y en el móvil el año tiene que verse **entero sin hacer scroll** (le pone muy nervioso). Nada encima del calendario: ni la tarjeta de Hoy ni una franja (se probó en v11.0 y lo descartó). Hoy es un botón «Hoy ›» junto al título, que abre una hoja; en el PC la tarjeta va a la derecha. No hay pestaña «Hoy».
- La tarjeta de Hoy lleva **solo lo útil**: próximo vuelo, «Antes de irte», horas de hoy, ID/OS para copiar y la ficha (sin viaje: el próximo viaje). Fuera, porque no le aportan nada: «Vuelves en X días», «Próximo descanso largo», «Vacaciones: te quedan…».
- **Viajes**: solo la lista del año, un único ＋ y un buscador que busca en todos los años.
- **Estadísticas**: «Por año», «Histórico» y «Mapa» juntos (antes estaban repartidos entre Viajes y Mapa).
- **Más**: menú en bloques (Mis cosas: Mis documentos · Gestión: Calendario de empresa, Clientes, Antes de irme · App: Ajustes, Copia de seguridad, Ayuda), cada cosa en su pantalla. Ajustes era un cajón de sastre.
- El calendario de empresa también se edita desde el Calendario: tocando el año («✏️ Editar festivos y puentes») o con el aviso de un año sin calendario («Marcar festivos y puentes»). Le costó encontrarlo.
- **Una sola forma de editar un viaje**: «✏️ Editar» en la ficha abre el formulario con todo (país, fechas, cliente, OS, ID, nota corta y los datos del viaje: dirección, eTA, SAP, contactos, notas). El correo se mete con «📥 Importar correo», que deja elegir archivo o pegar el texto.
- Pantalla de entrada con el último email usado en ese dispositivo: se equivocó de email (entra con el de Gmail, no con el de Hotmail).
- Horas en 24 h (la hora del aviso es un desplegable, no `type=time`, que en algunos sitios sale con AM/PM).
- Importar correo: un adjunto ya guardado se reconoce por la **huella** (también en el mismo viaje, porque las fotos se guardan reducidas y el tamaño cambia) y, en los antiguos sin huella, por el nombre o el nombre original (`original`, que se conserva al renombrar). Lo ya guardado en ese viaje no se propone; lo de otro viaje o Mis documentos sale desmarcado diciendo «ya lo tienes … como «nombre»». Lo que desmarca se recuerda en la nube (`S.aju.descartados`), para el móvil y el PC.

**iPhone**
- Los PDF se dibujan con PDF.js porque el visor del iPhone solo enseña la primera página.
- Las fotos se reducen a 2000 px: un QR o un pasaporte se siguen leyendo.
- Los documentos se guardan troceados en Firestore, sin Firebase Storage. Se sube primero los trozos y al final la ficha, para que no aparezca un documento a medias.
- Solo se guardan en el dispositivo los documentos de los viajes en curso y de los próximos 30 días.
- El bloqueo de Mis documentos usa Face ID o Windows Hello (WebAuthn) y es solo de ese dispositivo.
- Arrastrar desde el iPhone a veces da una URL `message:` en vez del archivo. Por eso también se puede importar el .eml o .msg, o pegar el texto.

**Calendario laboral de MTorres**
- Los festivos, puentes, vacacionales y previos de cada año están en `CALENDARIOS`. También se pueden editar desde la app (`S.emp`).
- El «vacacional» de empresa es solo un periodo recomendado: cuenta como laborable, y si coge vacaciones ahí se descuentan.
- Las vacaciones se cuentan **por horas**: jornada continua de 8 h y días parciales posibles (p. ej. 2,5 h). No hay ajuste de «días de vacaciones al año».
- La bolsa es por año: conceptos que fija la empresa más el pendiente del año anterior. Ese pendiente es automático, pero se puede corregir a mano.
- Al marcar vacaciones se marcan **exactamente** los días que él elige, sin añadir fines de semana, festivos ni puentes pegados.
- Tocar un día en el calendario solo muestra información. Las vacaciones se marcan con «Reservar vacaciones» o desde la pestaña Vacaciones.
- No hay pestaña de sugerencias de puentes: él los localiza mirando el año entero con colores.

**Viajes y clientes**
- El cliente es **Grupo + Planta** (p. ej. Tetra Pak / Limburg), elegido de la lista con buscador para no crear duplicados.
- Agrupaciones decididas:
  - Smurfit, Smurfit Socar y Kappa van en el grupo Smurfit.
  - VG Extrusion es VG Nicolaus.
  - Bielomatik se queda como cliente.
- Fosber es el proyecto, no un cliente: aquel viaje fue a VPK Packaging Polonia, con «Proyecto Fosber» en notas. No existe el tipo «otro».
- Tipos de viaje: cliente (por defecto), feria, comercial o interno.
- Dos registros pegados (que se solapan o van seguidos) cuentan como un mismo viaje en récords y estadísticas.
- Países visitados incluye todos: los de los viajes, los de ocio y España.
- Continentes: 7, con Norteamérica y Sudamérica separadas.
- Imputar: siempre **el ID del viaje antes que la OS**, en todas partes.
  - La OS tiene unas 7 cifras y en Captio se llama «proyecto».
  - La clase de actividad es ZTTAI.
  - La orden SAP no se usa.
  - Si falta la OS, se mete a mano: hay correos que solo traen el ID y la fecha.

**Horas de viaje (convenio del metal de Navarra, art. 21.2)**
- Cada desplazamiento es un bloque continuo:
  - las 8 primeras horas cuentan como trabajo;
  - de la 9.ª a la 16.ª no cuentan;
  - desde la 17.ª cuentan al 50 %.
- Cada hora va al día en que ocurre, con el reloj del país de salida.
- Desde la hora 17 siempre es extra. Las 8 primeras son extra si el día es fin de semana o festivo, o si con el trabajo de ese día se pasa de 8 h.
- Zona horaria del destino: la que él elija (`v.horas.tz`), si no la del **aeropuerto de llegada de la ida** (`TZ_AERO`, sobre todo EE. UU., Canadá, México, Brasil, Australia: viaja mucho a EE. UU. y no todo es hora de Nueva York), y si no la del país (`TZ_PAIS`, todos los países de la lista tienen zona).
- El trabajo en destino va en hora local. Los días en destino se apuntan **en horas trabajadas** (−½, +½, atajos y una casilla para escribir el número exacto: 6,5 o 6:20), no con inicio y fin.
- La ida y la vuelta propuestas desde los vuelos son solo una propuesta: cada tarjeta lleva un botón visible «✏️ Cambiar horas» para poner las reales (p. ej. vuelo a las 02:10 y él sale 2 h antes, no 3).
- La ida y la vuelta se proponen desde los vuelos con márgenes editables en Ajustes. Él sale de casa mucho antes, normalmente vuela desde Bilbao.
- No se ficha en la app: ya ficha en SAP.
- Solo cuentan los vuelos vigentes que **cuadran con las fechas del viaje**: el primer vuelo de ida a ±1 día del inicio y la llegada del último de vuelta a ±1 día del final. Si cambia la fecha del viaje y el vuelo viejo ya no cuadra, no se usa: los días en destino llegan hasta la nueva fecha y la Vuelta sale «pendiente del vuelo nuevo». El vuelo viejo tampoco sale como «próximo vuelo».
- Un vuelo cambiado no se borra: se marca `cambiado` (fecha) y sale **tachado** en Reservas. Al importar el correo con el vuelo nuevo, la lista para confirmar propone «Sustituye al vuelo de vuelta del …» (marcado). También hay «✂️ Marcar como cambiado» a mano en cada vuelo. Mikel quiere ver el viejo tachado, no que desaparezca.

**Antes de irme (v10.0)**
- Lista de cosas que recoger el último día en fábrica (router del PLC, ordenador, cable, herramientas…). Lista fija en Ajustes (`S.aju.antes`) y cosas sueltas por viaje (`v.antes.extra`); lo marcado va en `v.antes.hechos`.
- El último día en fábrica es el último día con trabajo del parte de horas, o el que él ponga (`v.antes.ultimo`): cambia mucho (cambios de vuelo), por eso es editable.
- Ese día la lista sale arriba en la tarjeta de Hoy. Una web en el iPhone no puede mandar notificaciones a una hora sin servidor de pago, por eso el aviso es un evento .ics con alarma (botón «Avisarme el último día», hora en Ajustes, por defecto 14:00 hora del país).

## 4. Pendiente
- Del repaso de nov 2026, sin hacer: si la nube rechaza un cambio, reintentarlo en vez de darlo por subido; guardar Ajustes por campos (ahora se guardan enteros y en dos dispositivos sin conexión gana el último); «próximo vuelo» compara la hora del aeropuerto con la del dispositivo; quitar el importador viejo sin usar (`importarEml`, `importarIcs`). Exportar no incluye documentos (informado).
- Probar en su iPhone el botón «📅 Avisarme el último día» (.ics por data: URL).
- PIN propio de la app, a nivel de cuenta, para Mis documentos en cualquier dispositivo. En el PC del trabajo seguramente no hay Windows Hello.
- Exportar viajes, horas y estadísticas a Excel.
- En la pestaña Horas, comparar con otros criterios, como el de la empresa.
- Más adelante, si él lo pide: calcular euros cuando sepa su precio real.
- Descartado por ahora: el interruptor para meter horas en hora española para Fiori.
