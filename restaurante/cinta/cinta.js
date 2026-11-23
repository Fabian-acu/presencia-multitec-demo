/* Cinta de Multitec: arma el enlace de WhatsApp desde data-rubro y maneja cerrar/reabrir.
   Sin dependencias. Sin guardar nada (ni cookies ni storage): al recargar vuelve la franja. */
(function () {
  "use strict";
  var cinta = document.querySelector("[data-cinta]");
  if (!cinta) return;
  var flotante = document.querySelector("[data-cinta-flotante]");
  var cerrar = cinta.querySelector("[data-cinta-cerrar]");
  var NUMERO = "595981601211"; // Multitec (ficha del cliente)
  var rubro = cinta.getAttribute("data-rubro") || "negocio";
  var mensaje = "Hola, vi la demo de " + rubro + " y quiero una web así.";
  var url = "https://wa.me/" + NUMERO + "?text=" + encodeURIComponent(mensaje);
  var enlaces = document.querySelectorAll("[data-cinta-wa]");
  for (var i = 0; i < enlaces.length; i++) enlaces[i].setAttribute("href", url);

  if (cerrar) cerrar.hidden = false;
  function cerrarCinta() {
    cinta.hidden = true;
    if (flotante) { flotante.hidden = false; flotante.focus(); }
  }
  if (cerrar) cerrar.addEventListener("click", cerrarCinta);
})();
