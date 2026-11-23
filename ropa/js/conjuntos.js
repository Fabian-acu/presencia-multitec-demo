/* Ceniza (Demo): la tira de conjuntos. Anterior y Siguiente mueven una foto (en compu); la tira tambien se mueve con las
   flechas del teclado (tiene foco) y con el dedo. Los botones se apagan en los extremos (IntersectionObserver, sin escuchar el scroll). */
(function () {
  "use strict";
  var C = window.Ceniza;
  var tira = document.querySelector("[data-tira]");
  var ant = document.querySelector("[data-tira-ant]");
  var sig = document.querySelector("[data-tira-sig]");
  if (!tira || !ant || !sig || !C) return;
  var items = tira.querySelectorAll(".tira__item");

  function paso() {
    var li = items[0];
    var gap = parseFloat(window.getComputedStyle(tira).columnGap) || 16;
    return li.getBoundingClientRect().width + gap;
  }
  function mover(dir) {
    tira.scrollBy({ left: dir * paso(), behavior: C.reducido() ? "auto" : "smooth" });
  }
  function apagar(b, si) {
    if (si) b.setAttribute("aria-disabled", "true"); else b.removeAttribute("aria-disabled");
  }
  ant.addEventListener("click", function () { if (ant.getAttribute("aria-disabled") !== "true") mover(-1); });
  sig.addEventListener("click", function () { if (sig.getAttribute("aria-disabled") !== "true") mover(1); });

  if ("IntersectionObserver" in window) {
    var primero = false, ultimo = false;
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.target === items[0]) primero = en.intersectionRatio > 0.9;
        if (en.target === items[items.length - 1]) ultimo = en.intersectionRatio > 0.9;
      });
      apagar(ant, primero);
      apagar(sig, ultimo);
    }, { root: tira, threshold: [0, 0.9, 1] });
    obs.observe(items[0]);
    obs.observe(items[items.length - 1]);
  }
})();
