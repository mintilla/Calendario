
(function(){
  function ready(fn){if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded',fn);}  

  function ensureStyles(){
    if(document.getElementById('fix-buttons-styles')) return;
    const css=document.createElement('style'); css.id='fix-buttons-styles';
    css.textContent=`
      .botones-principales{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    `;
    document.head.appendChild(css);
  }

  function inject(){
    let btn=document.getElementById('btnMisViajes');
    if(!btn){ btn=document.querySelector('button'); }
    if(!btn) return;

    let wrap=btn.closest('.botones-principales');
    if(!wrap){ wrap=document.createElement('div'); wrap.className='botones-principales'; btn.parentNode.insertBefore(wrap,btn); wrap.appendChild(btn); }

    if(!document.getElementById('btnMapaMundial')){
      const b=document.createElement('button');
      b.id='btnMapaMundial'; b.className='boton-principal'; b.textContent='🌍 MAPA MUNDIAL';
      wrap.appendChild(b);
      b.onclick=()=>alert('Mapa listo cuando carguemos el paquete GEO. Botón funcionando.');
    }
  }

  ready(()=>{ensureStyles(); inject();});
})();
