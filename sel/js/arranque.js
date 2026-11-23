/* Selector "Elegí tu rubro": corre antes de pintar. Marca que hay JavaScript y decide el modo de la página:
   - modo-fino: puntero preciso con hover (compu): baño de color, foto que sigue al puntero.
   - modo-toque: sin hover o puntero grueso (celular, tablet): filas que se abren con un toque.
   Parámetros solo para probar: ?modo=fino, ?modo=toque, ?estado=sinfotos. No cambian ningún texto ni enlace. */
(function () {
  "use strict";
  var h = document.documentElement;
  /* Links viejos (conservados del selector anterior): ?tema=comida va al restaurante y ?tema=comercio a la tienda de ropa.
     Cualquier otro valor muestra el selector. Mapa fijo: nunca se arma una dirección con lo que viene en la URL. */
  var tema = /[?&]tema=([a-z]+)/.exec(window.location.search);
  var destinos = { comida: "restaurante/", comercio: "ropa/" };
  if (tema && Object.prototype.hasOwnProperty.call(destinos, tema[1])) {
    window.location.replace(destinos[tema[1]]);
    return;
  }
  h.classList.add("js");
  var q = window.location.search;
  var e = /[?&]estado=([a-z]+)/.exec(q);
  if (e) h.setAttribute("data-estado", e[1]);
  var forzado = /[?&]modo=(fino|toque)/.exec(q);
  var mq = window.matchMedia ? window.matchMedia("(hover: hover) and (pointer: fine)") : null;
  function modo() {
    var fino = forzado ? forzado[1] === "fino" : !!(mq && mq.matches);
    h.classList.toggle("modo-fino", fino);
    h.classList.toggle("modo-toque", !fino);
  }
  modo();
  if (mq && !forzado) {
    if (mq.addEventListener) mq.addEventListener("change", modo);
    else if (mq.addListener) mq.addListener(modo);
  }
})();
