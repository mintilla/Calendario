
(function(){
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  function ensureStyles(){
    if(document.getElementById('fix-buttons-styles')) return;
    const css=document.createElement('style');
    css.id='fix-buttons-styles';
    css.textContent = `
      .botones-principales{display:grid;grid-template-columns:1fr;gap:10px}
      @media(min-width:560px){.botones-principales{grid-template-columns:1fr 1fr}}
    `;
    document.head.appendChild(css);
  }

  function findMainButton(){
    // 1) Por id
    let b = document.getElementById('btnMisViajes');
    if (b) return b;
    // 2) Por clase + texto aproximado
    const candidates = Array.from(document.querySelectorAll('button.boton-principal, .boton-principal'));
    const hit = candidates.find(x => /viaje/i.test(x.textContent||''));
    if (hit) return hit;
    // 3) Primer botón de portada como fallback
    return document.querySelector('button');
  }

  function injectSecondButton(){
    const btn = findMainButton();
    if(!btn) return;
    // Si ya existe el nuevo, no repetir
    if(document.getElementById('btnMapaMundial')) return;

    // Crear wrapper de dos columnas si no existe
    let wrap = btn.closest('.botones-principales');
    if(!wrap){
      wrap = document.createElement('div');
      wrap.className = 'botones-principales';
      btn.parentNode.insertBefore(wrap, btn);
      wrap.appendChild(btn);
    }

    // Normalizar texto del botón original (no cambia su id/lógica interna)
    if(!/VIAJES/i.test(btn.textContent||'')) btn.textContent = '✈️ MIS VIAJES';

    // Crear el nuevo
    const nuevo = document.createElement('button');
    nuevo.id = 'btnMapaMundial';
    nuevo.className = btn.className || 'boton-principal';
    nuevo.textContent = '🌍 MAPA MUNDIAL';
    wrap.appendChild(nuevo);

    // Conectar evento sin romper la app
    nuevo.addEventListener('click', function(){
      const app = window.calendario;
      // Si la app expone mostrarVistaCalendario, asumimos vistas por ids ya existen.
      // Aquí solo mostramos un aviso si aún no está el add-on del mapa.
      if (!document.getElementById('vistaMapa')) {
        alert('El mapa aún no está cargado. Sube el paquete GEO y vuelve a intentarlo.');
        return;
      }
      if (app) {
        // Oculta vistas base
        const ids=['vistaCalendario','vistaViajes','formularioViaje'];
        ids.forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display='none'; });
        const vm = document.getElementById('vistaMapa'); if(vm) vm.style.display='block';
      } else {
        alert('Inicializa primero la app y vuelve a pulsar.');
      }
    });
  }

  ready(function(){ ensureStyles(); injectSecondButton(); });
})();
