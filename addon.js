(function(){
  // --- MANTENEMOS TUS TABLAS DE DATOS IGUAL ---
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  const ISO_BY_PAIS={
    'España':'ES','Francia':'FR','Alemania':'DE','Italia':'IT','Portugal':'PT','Reino Unido':'GB','Irlanda':'IE','Países Bajos':'NL','Bélgica':'BE','Suiza':'CH','Austria':'AT','Polonia':'PL','República Checa':'CZ','Dinamarca':'DK','Suecia':'SE','Noruega':'NO','Finlandia':'FI','Estados Unidos':'US','Canadá':'CA','México':'MX','Brasil':'BR','Argentina':'AR','Chile':'CL','Perú':'PE','Colombia':'CO','Marruecos':'MA','Turquía':'TR','Rusia':'RU','China':'CN','Japón':'JP','Corea del Sur':'KR','India':'IN','Australia':'AU','Nueva Zelanda':'NZ','Panamá':'PA','Costa Rica':'CR','Hong Kong':'HK','Taiwán':'TW','Singapur':'SG','Malasia':'MY','Tailandia':'TH','Vietnam':'VN','Filipinas':'PH','Indonesia':'ID','Kazajistán':'KZ','Uruguay':'UY','Paraguay':'PY','Bolivia':'BO','Ecuador':'EC','Venezuela':'VE','Sudáfrica':'ZA','Nigeria':'NG','Senegal':'SN','Ghana':'GH','Kenia':'KE','Tanzania':'TZ','Etiopía':'ET','Arabia Saudita':'SA','Emiratos Árabes Unidos':'AE','Qatar':'QA','Israel':'IL','Jordania':'JO','Grecia':'GR','Rumanía':'RO','Bulgaria':'BG','Croacia':'HR','Serbia':'RS','Ucrania':'UA','Bielorrusia':'BY','Lituania':'LT','Letonia':'LV','Estonia':'EE','Hungría':'HU','Eslovaquia':'SK','Eslovenia':'SI','Chipre':'CY','Malta':'MT','Luxemburgo':'LU'};

  // --- TUS FUNCIONES DE ESTILO E INYECCIÓN ---
  function ensureStyles(){ if(document.getElementById('world-geo-styles')) return; const css=document.createElement('style'); css.id='world-geo-styles'; css.textContent=`
    .country{fill:#f2f2f2;stroke:#c9c9c9;stroke-width:.7;cursor:pointer;transition:.15s}
    .country:hover{stroke:#333}
    .visitado-1-3{fill:#C8E6C9}.visitado-4-9{fill:#81C784}.visitado-10p{fill:#2E7D32}
    #mapaSvgWrapper svg{width:100%;height:auto;max-width:920px;margin:0 auto;display:block}
  `; document.head.appendChild(css); }

  function injectUI(){ 
    if(document.getElementById('vistaMapa')) return; 
    const cont = document.querySelector('.container') || document.body; 
    const html=`
    <div class="viajes-container" id="vistaMapa" style="display:none;">
      <div class="viajes-header">
        <button class="volver-calendario" id="volverDesdeMapa">← Volver</button>
        <h2>🌍 Mapa mundial de viajes</h2><div></div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
        <button class="btn-nuevo-viaje" id="btnGestionHistorico" style="background:linear-gradient(135deg,#9C27B0 0%,#7B1FA2 100%);flex:1;min-width:220px;">📝 Gestionar histórico (antes de 2026)</button>
      </div>
      <div id="mapaContainer" style="width:100%;">
        <div id="mapaSvgWrapper" style="width:100%;"></div>
        <div style="text-align:center;color:#888;font-size:12px;margin-top:6px;">Toca un país para ver detalles</div>
      </div>
    </div>
    <div class="day-info-overlay" id="mapTooltip" style="display:none;">
      <div class="day-info-content">
        <div class="day-info-header"><div class="day-info-title" id="mapTooltipTitle">País</div><button class="close-day-info" id="mapTooltipClose">×</button></div>
        <div class="day-info-body" id="mapTooltipBody"></div>
        <div class="form-botones"><button class="btn-cancelar" id="mapTooltipCloseBtn">Cerrar</button></div>
      </div>
    </div>
    <div class="day-info-overlay" id="historicoOverlay" style="display:none;">
      <div class="day-info-content" style="max-width:520px;">
        <div class="day-info-header"><div class="day-info-title">📝 Histórico de viajes (antes de 2026)</div><button class="close-day-info" id="historicoClose">×</button></div>
        <div class="day-info-body">
          <div class="form-group"><label class="form-label" for="historicoPais">🌍 País</label><select class="form-select" id="historicoPais"></select></div>
          <div class="form-group"><label class="form-label" for="historicoDias">📆 Días totales (antes de 2026)</label><input type="number" min="0" class="form-input" id="historicoDias" placeholder="Ej: 12"></div>
          <div class="form-botones"><button class="btn-guardar" id="historicoGuardar">Guardar</button><button class="btn-cancelar" id="historicoCancelar">Cancelar</button></div>
          <h3 style="margin-top:18px;color:#333;">Listado</h3><div id="historicoLista" style="margin-top:10px;"></div>
        </div>
      </div>
    </div>`; 
    const anchor=document.getElementById('modalOverlay'); 
    if(anchor) anchor.insertAdjacentHTML('beforebegin',html); else cont.insertAdjacentHTML('beforeend',html); 
  }

  // --- LÓGICA DE DATOS ---
  function dias2026PorISO(app){ const out={}; (app.viajes||[]).forEach(v=>{ const iso=ISO_BY_PAIS[v.pais]; if(!iso) return; (out[iso]||(out[iso]=new Set())); (v.dias||[]).forEach(d=>out[iso].add(d)); }); return out; }
  function diasHistoricoPorISO(app){ const out={}; (app.historico||[]).forEach(h=>{ const iso=ISO_BY_PAIS[h.pais]; if(!iso) return; out[iso]=(out[iso]||0)+(parseInt(h.dias)||0); }); return out; }

  async function cargarMapa(){ 
    const wrap=document.getElementById('mapaSvgWrapper'); 
    if(!wrap||wrap.dataset.loaded==='1') return; 
    try{ 
      const txt=await fetch('./world/world-geo.svg').then(r=>r.text()); 
      wrap.innerHTML=txt; 
      wrap.dataset.loaded='1';
      wrap.querySelectorAll('[id]').forEach(el=>{ 
        if(el.tagName.toLowerCase()==='path' || el.tagName.toLowerCase()==='polygon' || el.tagName.toLowerCase()==='g'){ 
          el.classList.add('country'); 
          el.addEventListener('click', ()=> mostrarPopupPais(el.id.toUpperCase())); 
        } 
      }); 
    }catch(e){ wrap.innerHTML='<p style="color:#c00;text-align:center;">No se pudo cargar el SVG</p>'; } 
  }

  function pintarMapa(app){ 
    const wrap=document.getElementById('mapaSvgWrapper'); 
    if(!wrap||!wrap.dataset.loaded) return; 
    const d2026=dias2026PorISO(app); 
    const hist=diasHistoricoPorISO(app); 
    wrap.querySelectorAll('.country').forEach(el=>{ 
      const iso=el.id.toUpperCase(); 
      const total=(d2026[iso]?.size||0)+(hist[iso]||0); 
      el.classList.remove('visitado-1-3','visitado-4-9','visitado-10p'); 
      if(total>=1 && total<=3) el.classList.add('visitado-1-3'); 
      else if(total>=4 && total<=9) el.classList.add('visitado-4-9'); 
      else if(total>=10) el.classList.add('visitado-10p'); 
    }); 
  }

  function mostrarPopupPais(iso){ 
    const app=window.calendario || window.app; 
    if(!app) return; 
    const nombre=Object.entries(ISO_BY_PAIS).find(([k,v])=>v===iso)?.[0]||iso; 
    const d2026=dias2026PorISO(app); 
    const hist=diasHistoricoPorISO(app); 
    const total=(d2026[iso]?.size||0)+(hist[iso]||0); 
    const viajes=(app.viajes||[]).filter(v=>ISO_BY_PAIS[v.pais]===iso); 
    const resumen=viajes.map(v=>{ 
      const i=new Date(v.fechaInicio), f=new Date(v.fechaFin); 
      const dias=Math.floor((f-i)/(1000*60*60*24))+1; 
      const destino=v.ciudadDestino?`${v.ciudadDestino} (${v.pais})`:v.pais; 
      return `• ${destino} — ${app.formatearFechaVisual(i)} - ${app.formatearFechaVisual(f)} (${dias}d)`; 
    }).join('<br>'); 
    document.getElementById('mapTooltipTitle').textContent=nombre; 
    document.getElementById('mapTooltipBody').innerHTML = `<div class="info-item" style="background:#f0f7ff;border-left:4px solid #2196F3;"><div class="info-icon">📆</div><div class="info-text"><strong>Total días:</strong> ${total} (histórico ${hist[iso]||0} + 2026 ${d2026[iso]?.size||0})</div></div>` + (resumen? `<div class="info-item"><div class="info-icon">✈️</div><div class="info-text">${resumen}</div></div>`:''); 
    document.getElementById('mapTooltip').style.display='flex'; 
  }

  function cerrarTooltip(){ document.getElementById('mapTooltip').style.display='none'; }

  function pintarHistoricoLista(app){ 
    const cont=document.getElementById('historicoLista'); 
    if(!cont) return; 
    if(!app.historico||!app.historico.length){ cont.innerHTML='<p style="color:#666;">No hay registros</p>'; return;} 
    cont.innerHTML=''; 
    app.historico.sort((a,b)=>a.pais.localeCompare(b.pais)); 
    app.historico.forEach((h,idx)=>{ 
      const d=document.createElement('div'); 
      d.className='viaje-card'; d.style.marginBottom='8px'; 
      d.innerHTML=`<div class="viaje-card-header"><div class="viaje-destino-card">${h.pais}</div><div class="viaje-acciones"><button class="btn-editar" data-idx="${idx}">✏️ Editar</button><button class="btn-editar" data-del="${idx}" style="color:#e91e63">🗑️ Eliminar</button></div></div><div class="viaje-fechas">📆 Días previos: ${h.dias||0}</div>`; 
      d.querySelector('[data-idx]')?.addEventListener('click', (e)=>{ 
        const i=parseInt(e.currentTarget.getAttribute('data-idx')); 
        const item=app.historico[i]; 
        document.getElementById('historicoPais').value=item.pais; 
        document.getElementById('historicoDias').value=item.dias||0; 
      }); 
      d.querySelector('[data-del]')?.addEventListener('click', (e)=>{ 
        const i=parseInt(e.currentTarget.getAttribute('data-del')); 
        if(confirm('¿Eliminar este registro histórico?')){ app.historico.splice(i,1); localStorage.setItem(app.STORAGE_HISTORICO, JSON.stringify(app.historico)); pintarHistoricoLista(app); pintarMapa(app); } 
      }); 
      cont.appendChild(d); 
    }); 
  }

  // --- EL MOTOR QUE CONECTA TODO ---
  function wire(){ 
    const app = window.calendario || window.app;
    if(!app){ 
        console.log("Esperando a que el calendario arranque...");
        setTimeout(wire, 200); // Reintenta hasta que esté listo
        return; 
    }
    
    console.log("¡Conexión exitosa! Configurando mapa...");
    app.STORAGE_HISTORICO = 'historico-viajes';
    app.historico = app.historico || []; 
    try{ const s=localStorage.getItem(app.STORAGE_HISTORICO); if(s) app.historico=JSON.parse(s);}catch{}

    const sel=document.getElementById('historicoPais'); 
    if(sel){ 
      sel.innerHTML='<option value="">Selecciona un país</option>'; 
      (app.paises||[]).forEach(p=>{ const o=document.createElement('option'); o.value=p; o.textContent=p; sel.appendChild(o); }); 
    }

    // BOTÓN PARA ABRIR EL MAPA (Asegúrate de que este botón existe en tu HTML)
    document.getElementById('btnMapaMundial')?.addEventListener('click', ()=>{ 
        document.getElementById('vistaCalendario').style.display='none'; 
        if(document.getElementById('vistaViajes')) document.getElementById('vistaViajes').style.display='none';
        document.getElementById('vistaMapa').style.display='block'; 
        cargarMapa().then(()=> pintarMapa(app)); 
    });

    document.getElementById('volverDesdeMapa')?.addEventListener('click', ()=> app.mostrarVistaCalendario());
    document.getElementById('mapTooltipClose')?.addEventListener('click', cerrarTooltip);
    document.getElementById('mapTooltipCloseBtn')?.addEventListener('click', cerrarTooltip);
    document.getElementById('btnGestionHistorico')?.addEventListener('click', ()=>{ document.getElementById('historicoDias').value=''; document.getElementById('historicoOverlay').style.display='flex'; pintarHistoricoLista(app); });
    document.getElementById('historicoClose')?.addEventListener('click', ()=>{ document.getElementById('historicoOverlay').style.display='none'; });
    document.getElementById('historicoCancelar')?.addEventListener('click', ()=>{ document.getElementById('historicoOverlay').style.display='none'; });
    document.getElementById
