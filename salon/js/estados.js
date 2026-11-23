/* Tono Vivo (Demo): estados. Aviso de local cerrado (reloj real, o ?ahora= / ?estado=cerrado para probar) y los estados de prueba
   de ?estado=cargando | error | offline | sinfotos | vacio (el turno y las fotos los resuelven turno.js y nucleo.js).
   Ningun estado cambia un boton de WhatsApp. */
(function () {
  "use strict";
  var T = window.Tono = window.Tono || {};
  var doc = document;
  var aviso = doc.querySelector("[data-aviso]");

  function pintarAviso() {
    if (!aviso) return;
    var texto = T.aviso(T.ahora());
    var actual = aviso.getAttribute("data-texto") || "";
    if ((texto || "") === actual) return;
    aviso.setAttribute("data-texto", texto || "");
    T.vaciar(aviso);
    if (!texto) return;
    aviso.appendChild(T.icono("clock"));
    aviso.appendChild(T.el("span", null, texto));
  }
  pintarAviso();
  window.setInterval(pintarAviso, 60000);

  if (T.estadoPrueba === "vacio" && T.serviciosVista) T.serviciosVista.vacio();
})();
