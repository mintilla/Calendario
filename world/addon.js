
(function(){
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  function ensureStyles(){
    if(document.getElementById('addon-world-styles')) return;
    const css=document.createElement('style'); css.id='addon-world-styles'; css.textContent = `
      .botones-principales{display:grid;grid-template-columns:1fr;gap:10px}
      @media(min-width:560px){.botones-principales{grid-template-columns:1fr 1fr}}
      /* mapa */
      .tile{fill:#f2f2f2;stroke:#c9c9c9;stroke-width:1;cursor:pointer;transition:.2s}
      .tile:hover{stroke:#333;transform:scale(1.03)}
      .visitado-1-3{fill:#C8E6C9}.visitado-4-9{fill:#81C784}.visitado-10p{fill:#388E3C}
      #mapaSvgWrapper svg{width:100%;height:auto;max-width:820px;margin:0 auto;display:block}
      .country-label{font-size:8px;fill:#333;pointer-events:none;user-select:none}
      @media (max-width:420px){ .country-label{display:none} }
    `; document.head.appendChild(css);
  }
  function injectMapView(){
    if(document.getElementById('vistaMapa')) return;
    const cont = document.querySelector('.container'); if(!cont) return;
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="viajes-container" id="vistaMapa" style="display:none;">
        <div class="viajes-header">
          <button class="volver-calendario" id="volverDesdeMapa">← Volver</button>
          <h2>🌍 Mapa mundial de viajes</h2>
          <div></div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
          <button class="btn-nuevo-viaje" id="btnGestionHistorico" style="background:linear-gradient(135deg,#9C27B0 0%, #7B1FA2 100%);flex:1;min-width:220px;">📝 Gestionar histórico (antes de 2026)</button>
        </div>
        <div id="mapaContainer" style="width:100%;">
          <div id="mapaSvgWrapper" style="width:100%;"></div>
          <div style="text-align:center;color:#888;font-size:12px;margin-top:6px;">Toca un país para ver detalles</div>
        </div>
      </div>
      <!-- Popup mapa -->
      <div class="day-info-overlay" id="mapTooltip" style="display:none;">
        <div class="day-info-content">
          <div class="day-info-header">
            <div class="day-info-title" id="mapTooltipTitle">País</div>
            <button class="close-day-info" id="mapTooltipClose">&times;</button>
          </div>
          <div class="day-info-body" id="mapTooltipBody"></div>
          <div class="form-botones"><button class="btn-cancelar" id="mapTooltipCloseBtn">Cerrar</button></div>
        </div>
      </div>
      <!-- Modal histórico -->
      <div class="day-info-overlay" id="historicoOverlay" style="display:none;">
        <div class="day-info-content" style="max-width:520px;">
          <div class="day-info-header">
            <div class="day-info-title">📝 Histórico de viajes (antes de 2026)</div>
            <button class="close-day-info" id="historicoClose">&times;</button>
          </div>
          <div class="day-info-body">
            <div class="form-group">
              <label class="form-label" for="historicoPais">🌍 País</label>
              <select class="form-select" id="historicoPais"></select>
            </div>
            <div class="form-group">
              <label class="form-label" for="historicoDias">📆 Días totales (antes de 2026)</label>
              <input type="number" min="0" class="form-input" id="historicoDias" placeholder="Ej: 12">
            </div>
            <div class="form-botones">
              <button class="btn-guardar" id="historicoGuardar">Guardar</button>
              <button class="btn-cancelar" id="historicoCancelar">Cancelar</button>
            </div>
            <h3 style="margin-top:18px;color:#333;">Listado</h3>
            <div id="historicoLista" style="margin-top:10px;"></div>
          </div>
        </div>
      </div>
    `;
    // Inserta justo antes del modal de mes si existe, o al final del contenedor
    const modalIdx = cont.querySelector('#modalOverlay');
    if(modalIdx) cont.insertBefore(div.firstElementChild, modalIdx);
    else cont.appendChild(div.firstElementChild);
    document.body.appendChild(div.children[0]); // tooltip
    document.body.appendChild(div.children[0]); // historico
  }

  function injectSecondButton(){
    const btn = document.getElementById('btnMisViajes'); if(!btn) return;
    let wrap = btn.closest('.botones-principales');
    if(!wrap){ wrap=document.createElement('div'); wrap.className='botones-principales'; btn.parentNode.insertBefore(wrap, btn); wrap.appendChild(btn); }
    // no renombramos el texto del botón original para no romper expectativas
    if(!document.getElementById('btnMapaMundial')){
      const b=document.createElement('button'); b.id='btnMapaMundial'; b.className='boton-principal'; b.textContent='🌍 MAPA MUNDIAL'; wrap.appendChild(b);
    }
  }

  function attachEventsWhenReady(){
    let tries=0; const max=50;
    (function loop(){
      tries++;
      const app = window.calendario; // tu instancia global
      if(!app){ if(tries<max) return setTimeout(loop,100); else return; }
      // Historico storage
      app.STORAGE_HISTORICO = app.STORAGE_HISTORICO||'historico-viajes';
      app.historico = app.historico||[];
      try{ const s=localStorage.getItem(app.STORAGE_HISTORICO); if(s) app.historico=JSON.parse(s); }catch{}
      // Países en selector histórico
      const sel = document.getElementById('historicoPais'); if(sel){ sel.innerHTML='<option value="">Selecciona un país</option>'; (app.paises||[]).forEach(p=>{const o=document.createElement('option'); o.value=p; o.textContent=p; sel.appendChild(o);}); }
      // Eventos UI
      document.getElementById('btnMapaMundial')?.addEventListener('click', ()=> mostrarVistaMapa(app));
      document.getElementById('volverDesdeMapa')?.addEventListener('click', ()=> app.mostrarVistaCalendario());
      document.getElementById('mapTooltipClose')?.addEventListener('click', ()=> cerrarTooltip());
      document.getElementById('mapTooltipCloseBtn')?.addEventListener('click', ()=> cerrarTooltip());
      document.getElementById('btnGestionHistorico')?.addEventListener('click', ()=>{
        document.getElementById('historicoDias').value='';
        document.getElementById('historicoOverlay').style.display='flex';
        pintarHistoricoLista(app);
      });
      document.getElementById('historicoClose')?.addEventListener('click', ()=>{ document.getElementById('historicoOverlay').style.display='none'; });
      document.getElementById('historicoCancelar')?.addEventListener('click', ()=>{ document.getElementById('historicoOverlay').style.display='none'; });
      document.getElementById('historicoGuardar')?.addEventListener('click', ()=>{
        const pais=document.getElementById('historicoPais').value; const dias=parseInt(document.getElementById('historicoDias').value||'0');
        if(!pais) return alert('Selecciona un país'); if(isNaN(dias)||dias<0) return alert('Introduce días válidos');
        const idx=(app.historico||[]).findIndex(x=>x.pais===pais); if(idx===-1) app.historico.push({pais,dias}); else app.historico[idx].dias=dias;
        try{ localStorage.setItem(app.STORAGE_HISTORICO, JSON.stringify(app.historico)); }catch{}
        pintarHistoricoLista(app); pintarMapa(app);
      });
    })();
  }

  // Helpers de mapa
  const ISO_BY_PAIS = {
    'España':'ES','Francia':'FR','Alemania':'DE','Italia':'IT','Portugal':'PT','Reino Unido':'GB','Irlanda':'IE','Países Bajos':'NL','Bélgica':'BE','Suiza':'CH','Austria':'AT','Polonia':'PL','República Checa':'CZ','Dinamarca':'DK','Suecia':'SE','Noruega':'NO','Finlandia':'FI','Estados Unidos':'US','Canadá':'CA','México':'MX','Brasil':'BR','Argentina':'AR','Chile':'CL','Perú':'PE','Colombia':'CO','Marruecos':'MA','Turquía':'TR','Rusia':'RU','China':'CN','Japón':'JP','Corea del Sur':'KR','India':'IN','Australia':'AU','Nueva Zelanda':'NZ'
  };

  function dias2026PorISO(app){ const out={}; (app.viajes||[]).forEach(v=>{ const iso=ISO_BY_PAIS[v.pais]; if(!iso) return; (out[iso]||(out[iso]=new Set())); (v.dias||[]).forEach(d=>out[iso].add(d)); }); return out; }
  function diasHistoricoPorISO(app){ const out={}; (app.historico||[]).forEach(h=>{ const iso=ISO_BY_PAIS[h.pais]; if(!iso) return; out[iso]=(out[iso]||0)+(parseInt(h.dias)||0); }); return out; }

  function mostrarVistaMapa(app){
    document.getElementById('vistaCalendario').style.display='none';
    document.getElementById('vistaViajes').style.display='none';
    document.getElementById('formularioViaje').style.display='none';
    document.getElementById('vistaMapa').style.display='block';
    cargarMapa().then(()=> pintarMapa(app));
  }

  async function cargarMapa(){
    const wrap=document.getElementById('mapaSvgWrapper'); if(!wrap||wrap.dataset.loaded==='1') return; try{
      const resp=await fetch('./world/world.svg'); const txt=await resp.text(); wrap.innerHTML=txt; wrap.dataset.loaded='1';
      wrap.querySelectorAll('.tile').forEach(el=> el.addEventListener('click', ()=> mostrarPopupPais(el.id)));
    }catch(e){ wrap.innerHTML='<p style="color:#c00;text-align:center;">No se pudo cargar el mapa</p>'; }
  }

  function pintarMapa(app){ const wrap=document.getElementById('mapaSvgWrapper'); if(!wrap||!wrap.dataset.loaded) return; const d2026=dias2026PorISO(app); const hist=diasHistoricoPorISO(app); wrap.querySelectorAll('.tile').forEach(el=>{ const iso=el.id; const total=(d2026[iso]?.size||0)+(hist[iso]||0); el.setAttribute('class','tile'); if(total>=1 && total<=3) el.classList.add('visitado-1-3'); else if(total>=4 && total<=9) el.classList.add('visitado-4-9'); else if(total>=10) el.classList.add('visitado-10p'); }); }

  function mostrarPopupPais(iso){
    const app=window.calendario; if(!app) return;
    const nombre=Object.entries(ISO_BY_PAIS).find(([k,v])=>v===iso)?.[0]||iso; const d2026=dias2026PorISO(app); const hist=diasHistoricoPorISO(app); const total=(d2026[iso]?.size||0)+(hist[iso]||0); const viajes=(app.viajes||[]).filter(v=>ISO_BY_PAIS[v.pais]===iso); const resumen=viajes.map(v=>{ const i=new Date(v.fechaInicio), f=new Date(v.fechaFin); const dias=Math.floor((f-i)/(1000*60*60*24))+1; const destino=v.ciudadDestino?`${v.ciudadDestino} (${v.pais})`:v.pais; return `• ${destino} — ${app.formatearFechaVisual(i)} - ${app.formatearFechaVisual(f)} (${dias}d)`; }).join('<br>');
    document.getElementById('mapTooltipTitle').textContent=nombre; document.getElementById('mapTooltipBody').innerHTML = `<div class="info-item" style="background:#f0f7ff;border-left:4px solid #2196F3;"><div class="info-icon">📆</div><div class="info-text"><strong>Total días:</strong> ${total} (histórico ${hist[iso]||0} + 2026 ${d2026[iso]?.size||0})</div></div>` + (resumen? `<div class="info-item"><div class="info-icon">✈️</div><div class="info-text">${resumen}</div></div>`:''); document.getElementById('mapTooltip').style.display='flex';
  }
  function cerrarTooltip(){ const o=document.getElementById('mapTooltip'); if(o) o.style.display='none'; }

  ready(function(){ ensureStyles(); injectSecondButton(); injectMapView(); attachEventsWhenReady(); });
})();
