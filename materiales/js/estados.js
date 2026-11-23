/* La Plomada (Demo): estados de prueba (?estado=cerrado|cargando|sinfotos|error|offline) y foto que falla.
   El reloj real NUNCA cierra la demo: el aviso de cerrado solo sale con ?estado=cerrado. */
(function () {
  "use strict";
  var P = window.Plomada = window.Plomada || {};
  var e = P.estado;

  function fantasmas(n) {
    var ol = P.el("ol", "filas");
    ol.setAttribute("aria-hidden", "true");
    for (var i = 0; i < n; i++) {
      var li = P.el("li", "fila--fantasma");
      li.appendChild(P.el("span", "fantasma fantasma--foto"));
      li.appendChild(P.el("span", "fantasma fantasma--t"));
      li.appendChild(P.el("span", "fantasma fantasma--s"));
      li.appendChild(P.el("span", "fantasma fantasma--b"));
      ol.appendChild(li);
    }
    return ol;
  }

  if (e === "cerrado") {
    var av = document.querySelector("[data-cerrado]");
    var h = new Date().getHours();
    av.textContent = "Ahora estamos cerrados. Abrimos " + (h < 7 ? "hoy" : "mañana") + " a las 07:00.";
    av.hidden = false;
  }
  if (e === "cargando") {
    var grupos = document.querySelector("[data-grupos]");
    grupos.hidden = true;
    grupos.parentNode.insertBefore(fantasmas(6), grupos);
    var comp = document.querySelector(".filas--compactas");
    if (comp) { comp.hidden = true; comp.parentNode.insertBefore(fantasmas(3), comp); }
    document.getElementById("catalogo").setAttribute("aria-busy", "true");
  }
  if (e === "sinfotos") {
    Array.prototype.forEach.call(document.querySelectorAll(".fila"), function (li) { li.classList.add("fila--sinfoto"); });
    Array.prototype.forEach.call(document.querySelectorAll(".celda"), function (li) { li.classList.add("celda--sinfoto"); });
  }
  if (e === "error") {
    document.querySelector("[data-grupos]").hidden = true;
    document.querySelector("[data-error]").hidden = false;
    document.querySelector("[data-resumen]").hidden = true;
  }
  var red = document.querySelector("[data-red]");
  if (e === "offline") red.hidden = false;
  window.addEventListener("offline", function () { red.hidden = false; });
  window.addEventListener("online", function () { if (e !== "offline") red.hidden = true; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-reintentar]"), function (b) {
    b.addEventListener("click", function () { window.location.assign(window.location.pathname); });
  });

  /* una foto que no carga se vuelve un bloque con el codigo (nunca la foto de otro producto) */
  document.addEventListener("error", function (ev) {
    var im = ev.target;
    if (!im || im.tagName !== "IMG") return;
    var fila = im.closest(".fila"), celda = im.closest(".celda");
    if (fila) fila.classList.add("fila--sinfoto");
    else if (celda) celda.classList.add("celda--sinfoto");
  }, true);

  /* celdas del bento: "clip-path" de abajo hacia arriba al entrar en pantalla (visibles por defecto; si falla, no pasa nada) */
  if ("IntersectionObserver" in window && !P.reducido() && document.documentElement.animate) {
    var celdas = Array.prototype.slice.call(document.querySelectorAll(".celda"));
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en, i) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var idx = celdas.indexOf(en.target) % 3;
        en.target.animate([{ clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0 0 0 0)" }], { duration: 420, delay: idx * 40, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "backwards" });
      });
    }, { threshold: 0.15 });
    celdas.forEach(function (c) { io.observe(c); });
  }
})();
