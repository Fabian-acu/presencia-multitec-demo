/* El Filo (Demo): estados de revision (?estado=...), fotos que fallan, sin conexion y la conversacion de ejemplo. */
(function () {
  "use strict";
  var F = window.Filo = window.Filo || {};

  /* local cerrado: solo con ?estado=cerrado (el reloj real nunca cierra la demo) */
  if (F.estado === "cerrado") {
    var av = document.querySelector("[data-cerrado]");
    var cuando = F.ahora() < 7 * 60 ? "hoy" : "mañana";
    av.textContent = "Ahora estamos cerrados. Abrimos " + cuando + " a las 07:00.";
    av.hidden = false;
    var p = document.querySelector("[data-principal]");
    if (p) { p.textContent = "Ver los cortes"; p.setAttribute("href", "#cortes"); }
  }

  /* falla al cargar los cortes */
  if (F.estado === "error") {
    var e1 = document.querySelector("[data-error]");
    var l = document.querySelector("[data-lista]");
    if (e1) e1.hidden = false;
    if (l) l.hidden = true;
  }

  /* sin conexion */
  var red = document.querySelector("[data-red]");
  function mostrarRed(si) { if (red) red.hidden = !si; }
  if (F.estado === "offline" || navigator.onLine === false) mostrarRed(true);
  window.addEventListener("offline", function () { mostrarRed(true); });
  window.addEventListener("online", function () { mostrarRed(false); });
  Array.prototype.forEach.call(document.querySelectorAll("[data-reintentar]"), function (b) {
    b.addEventListener("click", function () {
      if (navigator.onLine === false) { F.anunciar("Sigue sin conexión."); return; }
      window.location.href = window.location.pathname;
    });
  });

  /* foto que falla: bloque de mesa con el nombre en letra de ticket (nunca la foto de otro corte) */
  document.addEventListener("error", function (e) {
    var t = e.target;
    if (!t || t.tagName !== "IMG") return;
    var f = t.closest(".foto, .banda__foto, .det__foto, .hero__foto");
    if (f) f.classList.add("foto--rota");
  }, true);
  Array.prototype.forEach.call(document.querySelectorAll(".corte__foto, .fila__foto"), function (b) {
    var li = b.closest("li");
    if (li) b.setAttribute("data-nombre", li.getAttribute("data-nombre") || "");
  });

  /* conversacion de ejemplo: los globos aparecen uno por uno al llegar a la seccion (todos visibles si algo falla) */
  var g = document.querySelector("[data-globos]");
  if (g && "IntersectionObserver" in window && !F.reducido()) {
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      Array.prototype.forEach.call(g.children, function (x, i) { x.style.setProperty("--i", String(i)); });
      g.classList.add("anim");
    }, { threshold: 0.35 });
    io.observe(g);
  }
})();
