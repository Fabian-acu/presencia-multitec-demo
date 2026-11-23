/* Ceniza (Demo): los 4 globos del chat de ejemplo llegan de a uno cuando la conversacion entra en pantalla.
   Todo esta visible desde el HTML; la animacion parte de lo visible (fill backwards). Con reduced-motion no se anima. */
(function () {
  "use strict";
  var C = window.Ceniza;
  var lista = document.querySelector(".chat__lista");
  if (!lista || !C || !lista.firstElementChild || !lista.firstElementChild.animate || !("IntersectionObserver" in window)) return;
  if (C.reducido()) return;
  var visto = false;
  var obs = new IntersectionObserver(function (entradas) {
    if (visto || !entradas[0].isIntersecting) return;
    visto = true;
    obs.disconnect();
    Array.prototype.forEach.call(lista.children, function (li, i) {
      li.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 220, delay: i * 450, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "backwards" });
    });
  }, { threshold: 0.35 });
  obs.observe(lista);
})();
