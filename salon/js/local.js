/* Tono Vivo (Demo): "Como llegar" abre la hoja #mapa (mapa de ejemplo en grises, sin direccion real). Nada sale a la red. */
(function () {
  "use strict";
  var T = window.Tono = window.Tono || {};
  var dlg = document.getElementById("hoja-mapa");
  var boton = document.querySelector("[data-abrir-mapa]");
  if (!dlg || !boton) return;
  T.hoja.registrar({ dialog: dlg, coincide: function (h) { return h === "#mapa"; } });
  boton.addEventListener("click", function () { T.hoja.ir("#mapa", boton); });
})();
