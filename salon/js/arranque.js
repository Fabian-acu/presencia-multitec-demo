/* Tono Vivo (Demo): corre antes de pintar. Marca que hay JavaScript (para esconder lo que solo anda con JS) y
   lee ?estado= para probar los estados (cargando, error, offline, sinfotos, vacio, cerrado). No guarda nada. */
(function () {
  "use strict";
  var h = document.documentElement;
  h.className = (h.className ? h.className + " " : "") + "js";
  try {
    var e = new URLSearchParams(window.location.search).get("estado");
    if (e && /^[a-z]+$/.test(e)) h.setAttribute("data-estado", e);
  } catch (x) { /* sin URLSearchParams: se ve el estado normal */ }
})();
