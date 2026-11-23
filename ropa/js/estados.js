/* Ceniza (Demo): estados de la pagina. Aviso de local cerrado, sin conexion, fotos que fallan.
   Para probar: ?estado=cerrado | offline | sinfotos | mapa | cargando | wafalla  y  ?ahora=2026-11-25T10:00 (mueve el reloj).
   No cambia ningun boton de WhatsApp. Texto armado solo con textContent. */
(function () {
  "use strict";
  var C = window.Ceniza;
  if (!C) return;
  var raiz = document.documentElement;
  var estado = raiz.getAttribute("data-estado");

  /* ---------- local cerrado: la linea ya esta reservada por arranque.js ---------- */
  var cuando = raiz.getAttribute("data-cerrado");
  var aviso = document.querySelector("p[data-cerrado]");
  if (cuando && aviso) aviso.textContent = "Ahora estamos cerrados. Abrimos " + cuando + " a las 10:00.";

  /* ---------- sin conexion ---------- */
  var red = document.querySelector("[data-red]");
  var reintentarRed = document.querySelector("[data-reintentar-red]");
  function sinRed() { return estado === "offline" || window.navigator.onLine === false; }
  function pintarRed() {
    var off = sinRed();
    var estabaOculto = red.hidden;
    red.hidden = !off;
    if (off && estabaOculto) C.anunciar("Sin conexión. Revisá tu internet y probá de nuevo.");
  }
  window.addEventListener("online", pintarRed);
  window.addEventListener("offline", pintarRed);
  reintentarRed.addEventListener("click", function () {
    if (estado === "offline") { raiz.removeAttribute("data-estado"); estado = null; }
    pintarRed();
    if (!red.hidden) C.anunciar("Todavía sin conexión.");
  });
  pintarRed();

  /* ---------- cargando (solo prueba): el CSS muestra tarjetas vacias en lugar de las prendas ---------- */
  if (estado === "cargando") C.anunciar("Cargando prendas.");

  /* ---------- fotos que fallan: bloque con el nombre, nunca la foto de otra prenda ---------- */
  var msg = document.querySelector("[data-fotos-error]");
  var reintentarFotos = document.querySelector("[data-reintentar-fotos]");
  var info = Array.prototype.map.call(document.querySelectorAll("img[data-foto]"), function (img) {
    var pic = img.parentNode && img.parentNode.nodeName === "PICTURE" ? img.parentNode : null;
    return { img: img, src: img.getAttribute("src"), srcset: img.getAttribute("srcset"), pic: pic, vacio: null };
  });

  function fallo(o) {
    if (o.vacio || !o.img.parentNode) return;
    var s = document.createElement("span");
    s.className = "foto-vacia";
    s.textContent = o.img.getAttribute("data-foto");
    o.vacio = s;
    o.img.parentNode.replaceChild(s, o.img);
    if (msg.hidden) C.anunciar("No pudimos cargar las fotos. Probá de nuevo en un rato.");
    msg.hidden = false;
  }
  function fuentes(pic, roto) {
    if (!pic) return;
    Array.prototype.forEach.call(pic.querySelectorAll("source"), function (s) {
      if (roto) { s.setAttribute("data-srcset", s.getAttribute("srcset")); s.setAttribute("srcset", "fotos/no-existe-demo.webp"); }
      else if (s.hasAttribute("data-srcset")) { s.setAttribute("srcset", s.getAttribute("data-srcset")); s.removeAttribute("data-srcset"); }
    });
  }

  info.forEach(function (o) {
    o.img.addEventListener("error", function () { fallo(o); });
    if (estado === "sinfotos") { fuentes(o.pic, true); o.img.removeAttribute("srcset"); o.img.setAttribute("src", "fotos/no-existe-demo.webp"); }
    else if (o.img.complete && o.img.naturalWidth === 0 && o.img.currentSrc) fallo(o);   /* ya fallo antes de que corriera este script */
  });

  reintentarFotos.addEventListener("click", function () {
    if (estado === "sinfotos") { raiz.removeAttribute("data-estado"); estado = null; }
    msg.hidden = true;
    C.anunciar("Probando de nuevo.");
    info.forEach(function (o) {
      fuentes(o.pic, false);
      if (o.srcset) o.img.setAttribute("srcset", o.srcset);
      if (o.vacio) { o.vacio.parentNode.replaceChild(o.img, o.vacio); o.vacio = null; }
      o.img.setAttribute("src", o.src + "?r=" + Date.now());
    });
  });
})();
