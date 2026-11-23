/* Consultorio Abril (Demo): los globos de la conversacion de ejemplo llegan de a uno cuando el chat entra en pantalla.
   Parten de lo ya visible (fill backwards): si esto no corre, se ve todo. Con movimiento reducido no se anima. */
(function () {
  "use strict";
  var A = window.Abril || {};
  var lista = document.querySelector("[data-chat]");
  if (!lista || !("IntersectionObserver" in window) || !lista.animate) return;
  if (A.reducido && A.reducido()) return;
  var globos = lista.querySelectorAll(".globo");
  var io = new IntersectionObserver(function (entradas) {
    for (var i = 0; i < entradas.length; i++) {
      if (!entradas[i].isIntersecting) continue;
      io.disconnect();
      Array.prototype.forEach.call(globos, function (g, n) {
        g.animate(
          [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
          { duration: 220, delay: n * 450, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "backwards" }
        );
      });
      break;
    }
  }, { threshold: 0.35 });
  io.observe(lista);
})();
