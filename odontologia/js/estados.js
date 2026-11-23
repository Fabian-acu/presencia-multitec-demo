/* Consultorio Abril (Demo): estados de la pagina. Aviso de local cerrado, sin conexion, fotos que fallan.
   Para probar: ?estado=cerrado | offline | sinfotos | mapa | cargando | wafalla  y  ?ahora=2026-11-25T10:00 (mueve el reloj).
   No cambia ningun boton de WhatsApp. Texto armado solo con textContent. */
(function () {
  "use strict";
  var A = window.Abril = window.Abril || {};
  var raiz = document.documentElement;
  var estado = raiz.getAttribute("data-estado");

  /* ---------- local cerrado: la linea ya esta reservada por arranque.js ---------- */
  var cuando = raiz.getAttribute("data-cerrado");
  var aviso = document.querySelector("p[data-cerrado]");
  if (cuando && aviso) aviso.textContent = "Ahora estamos cerrados. Abrimos " + cuando + " a las 08:30.";

  /* ---------- sin conexion ---------- */
  var red = document.querySelector("[data-red]");
  var reintentarRed = document.querySelector("[data-reintentar-red]");
  function sinRed() { return estado === "offline" || window.navigator.onLine === false; }
  function pintarRed() {
    var off = sinRed();
    var estabaOculto = red.hidden;
    red.hidden = !off;
    if (off && estabaOculto) A.anunciar("Sin conexión. Revisá tu internet y probá de nuevo.");
  }
  window.addEventListener("online", pintarRed);
  window.addEventListener("offline", pintarRed);
  reintentarRed.addEventListener("click", function () {
    if (estado === "offline") { raiz.removeAttribute("data-estado"); estado = null; }
    pintarRed();
    if (!red.hidden) A.anunciar("Todavía sin conexión.");
  });
  pintarRed();

  /* ---------- cargando (solo prueba): el CSS muestra seis filas vacias en lugar de los tratamientos ---------- */
  if (estado === "cargando") A.anunciar("Cargando tratamientos.");

  /* ---------- fotos que fallan: bloque con el nombre, nunca la foto de otro lugar ---------- */
  var msg = document.querySelector("[data-fotos-error]");
  var reintentarFotos = document.querySelector("[data-reintentar-fotos]");
  var info = Array.prototype.map.call(document.querySelectorAll("img[data-foto]"), function (img) {
    return { img: img, src: img.getAttribute("src"), vacio: null };
  });

  function fallo(o) {
    if (o.vacio || !o.img.parentNode) return;
    var s = document.createElement("span");
    s.className = "foto-vacia";
    s.textContent = o.img.getAttribute("data-foto");
    o.vacio = s;
    o.img.parentNode.replaceChild(s, o.img);
    if (msg.hidden) A.anunciar("No pudimos cargar las fotos. Probá de nuevo en un rato.");
    msg.hidden = false;
  }

  info.forEach(function (o) {
    o.img.addEventListener("error", function () { fallo(o); });
    if (estado === "sinfotos") { o.img.removeAttribute("srcset"); o.img.setAttribute("src", "fotos/no-existe-demo.webp"); }
    else if (o.img.complete && o.img.naturalWidth === 0 && o.img.currentSrc) fallo(o);   /* ya fallo antes de que corriera este script */
  });

  reintentarFotos.addEventListener("click", function () {
    if (estado === "sinfotos") { raiz.removeAttribute("data-estado"); estado = null; }
    msg.hidden = true;
    A.anunciar("Probando de nuevo.");
    info.forEach(function (o) {
      if (!o.vacio) return;
      o.vacio.parentNode.replaceChild(o.img, o.vacio);
      o.vacio = null;
      o.img.removeAttribute("srcset");
      o.img.setAttribute("src", o.src + "?r=" + Date.now());
    });
  });
})();
