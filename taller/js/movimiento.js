/* Taller Aviso (Demo): movimiento de entrada. Solo clases; la animacion vive en css/movimiento.css.
   Todo lo visible lo esta por defecto: solo se esconde (rev-pre) lo que esta por debajo de la primera pantalla y se muestra al entrar.
   Sin eventos de scroll: IntersectionObserver. Con reduced-motion no se esconde nada. */
(function () {
  "use strict";
  var A = window.Aviso = window.Aviso || {};
  if (A.reducido() || !("IntersectionObserver" in window)) return;

  var io = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (!e.isIntersecting) return;
      var t = e.target;
      io.unobserve(t);
      t.classList.add("rev-ok");
      t.classList.remove("rev-pre");
      var hijos = t.querySelectorAll("[data-rev-hijo]");
      Array.prototype.forEach.call(hijos, function (h) { h.classList.add("rev-ok"); h.classList.remove("rev-pre"); });
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

  function preparar(el, demora) {
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.92 && r.bottom > 0) return;   /* ya esta a la vista: no se esconde */
    if (demora != null) el.style.setProperty("--d", demora + "ms");
    el.classList.add("rev-pre");
    io.observe(el);
  }

  /* detalles: cada foto se revela con un escalon corto segun su columna */
  var figuras = document.querySelectorAll("[data-mosaico] [data-rev]");
  Array.prototype.forEach.call(figuras, function (f, i) { preparar(f, (i % 3) * 70); });

  /* chat de ejemplo: los globos entran de a uno (450 ms entre uno y otro) cuando el chat entra en pantalla */
  var chats = document.querySelectorAll(".chat__lista");
  Array.prototype.forEach.call(chats, function (lista) {
    var globos = lista.querySelectorAll("[data-rev]");
    if (!globos.length) return;
    var r = lista.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.92 && r.bottom > 0) return;
    Array.prototype.forEach.call(globos, function (g, i) { g.setAttribute("data-rev-hijo", ""); g.style.setProperty("--d", i * 450 + "ms"); g.classList.add("rev-pre"); });
    io.observe(lista);
  });

  /* barra de 5 segmentos: se llena hasta el 4 al entrar en pantalla */
  var barras = document.querySelectorAll(".barra5");
  Array.prototype.forEach.call(barras, function (b) { preparar(b); });
})();
