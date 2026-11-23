/* Taller Aviso (Demo): utilidades y topes. Nada se guarda, nada sale a la red.
   Parametros de prueba: ?estado=cerrado|cargando|sinfotos|error|offline|bloqueado (el reloj real nunca cierra la demo). */
(function () {
  "use strict";
  var A = window.Aviso = window.Aviso || {};

  /* ---- TOPES Y DATOS FIJOS DE LA DEMO: lo unico que hay que tocar para cambiarlos (el HTML trae los mismos textos por defecto) ---- */
  A.CONFIG = {
    NUMERO: "595981601211",   /* siempre Multitec: el taller de la demo no tiene numero */
    NEGOCIO: "Taller Aviso",
    MAX_AUTO: 60,             /* "Que auto es", caracteres */
    MAX_PASA: 240             /* "Que le pasa", caracteres */
  };

  A.reducido = function () { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; };
  A.param = function (k) {
    try { return new URLSearchParams(window.location.search).get(k); } catch (e) { return null; }
  };
  A.estado = A.param("estado");
  if (A.estado && /^[a-z]+$/.test(A.estado)) document.documentElement.setAttribute("data-estado", A.estado);

  A.el = function (tag, clase, texto) {
    var e = document.createElement(tag);
    if (clase) e.className = clase;
    if (texto != null) e.textContent = texto;
    return e;
  };
  A.icono = function (nombre, clase) {
    var ns = "http://www.w3.org/2000/svg";
    var s = document.createElementNS(ns, "svg");
    s.setAttribute("class", "icono" + (clase ? " " + clase : ""));
    s.setAttribute("aria-hidden", "true");
    s.setAttribute("focusable", "false");
    var u = document.createElementNS(ns, "use");
    u.setAttribute("href", "iconos.svg#i-" + nombre);
    s.appendChild(u);
    return s;
  };
  A.anunciar = function (texto) {
    var r = document.getElementById("anuncio");
    if (!r) return;
    r.textContent = "";
    window.setTimeout(function () { r.textContent = texto; }, 30);
  };

  /* "A", "A y B", "A, B y C" */
  A.unir = function (n) {
    if (n.length < 2) return n.join("");
    return n.slice(0, -1).join(", ") + " y " + n[n.length - 1];
  };
  /* El mensaje a Multitec lleva SOLO los servicios marcados. Lo que la persona escribe nunca viaja. */
  A.mensaje = function (servicios) {
    return "Hola, vi la demo de " + A.CONFIG.NEGOCIO + (servicios.length ? " (servicios: " + A.unir(servicios) + ")" : "") + " y quiero una web así.";
  };
  A.urlWa = function (servicios) {
    return "https://wa.me/" + A.CONFIG.NUMERO + "?text=" + encodeURIComponent(A.mensaje(servicios));
  };
})();
