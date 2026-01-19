
(function(){
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function(){
    const btn=document.getElementById('btnMapaMundial');
    if(!btn) return;
    btn.addEventListener('click',()=>alert('Mapa mundial todavía en instalación, pero el botón funciona.'));
  });
})();
