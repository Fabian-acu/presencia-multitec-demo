/* Ceniza (Demo): filtros de la coleccion (sin recargar), contador, filtro sin prendas y la segunda foto de cada tarjeta.
   Los chips y las entradas de la portada son enlaces a anclas (sin JavaScript llevan a cada grupo). Nada se guarda. */
(function () {
  "use strict";
  var C = window.Ceniza;
  var grilla = document.querySelector("[data-grilla]");
  if (!grilla || !C) return;
  var items = Array.prototype.slice.call(grilla.children);
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip[data-filtro]"));
  var entradas = Array.prototype.slice.call(document.querySelectorAll(".entrada a[data-filtro]"));
  var contador = document.querySelector("[data-contador]");
  var vacio = document.querySelector("[data-vacio]");
  var verTodo = document.querySelector("[data-ver-todo]");
  var titulo = document.getElementById("col-t");
  var EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

  function aplicar(f, animar) {
    var visibles = [];
    items.forEach(function (li) {
      var ok = f === "todo" || li.getAttribute("data-cat") === f;
      li.hidden = !ok;
      if (ok) visibles.push(li);
    });
    grilla.classList.toggle("grilla--filtro", f !== "todo");
    chips.forEach(function (c) {
      var on = c.getAttribute("data-filtro") === f;
      if (on) c.setAttribute("aria-current", "true"); else c.removeAttribute("aria-current");
      c.setAttribute("aria-label", "Filtrar: " + c.textContent.trim() + (on ? ", activo" : ""));
    });
    var n = visibles.length;
    contador.textContent = n === 1 ? "1 prenda" : n + " prendas";
    vacio.hidden = n > 0;
    /* el filtro cambia al instante con reduced-motion; si no, las prendas que quedan aparecen en 220 ms */
    if (animar && !C.reducido() && grilla.animate) {
      visibles.forEach(function (li, i) {
        li.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 220, delay: Math.min(i, 5) * 30, easing: EASE, fill: "backwards" });
      });
    }
  }

  chips.forEach(function (c) {
    c.addEventListener("click", function (e) {
      e.preventDefault();
      aplicar(c.getAttribute("data-filtro"), true);
    });
  });
  entradas.forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      aplicar(a.getAttribute("data-filtro"), false);
      var seccion = document.getElementById("coleccion");
      if (seccion && seccion.scrollIntoView) seccion.scrollIntoView({ behavior: C.reducido() ? "auto" : "smooth", block: "start" });
      if (titulo) { titulo.setAttribute("tabindex", "-1"); titulo.focus({ preventScroll: true }); }
    });
  });
  if (verTodo) verTodo.addEventListener("click", function () {
    aplicar("todo", true);
    var todo = chips[0];
    if (todo) todo.focus();
  });

  /* segunda foto: solo se pide cuando alguien pasa el mouse o enfoca la tarjeta (en celular se ven las dos en la ficha) */
  if (window.matchMedia("(hover: hover)").matches) {
    items.forEach(function (li) {
      var a = li.querySelector("a.tarjeta");
      var img = li.querySelector("img[data-src]");
      if (!a || !img) return;
      function pedir() {
        if (img.getAttribute("src")) return;
        img.setAttribute("src", img.getAttribute("data-src"));
      }
      a.addEventListener("pointerenter", pedir);
      a.addEventListener("focus", pedir);
    });
  }

  var m = /^#cat-(remeras|pantalones|abrigos)$/.exec(window.location.hash);
  aplicar(m ? m[1] : "todo", false);
})();
