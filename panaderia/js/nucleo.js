/* La Primera Hornada (Demo): utilidades compartidas. Nada se guarda, nada sale a la red.
   Parametros de prueba: ?estado=cerrado|cargando|sinfotos|agotado|error  y  ?hora=HH:MM (cambia el reloj del tablero). */
(function () {
  "use strict";
  var P = window.Primera = window.Primera || {};

  P.gs = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); };
  P.reducido = function () { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; };
  P.param = function (k) {
    try { return new URLSearchParams(window.location.search).get(k); } catch (e) { return null; }
  };
  P.estado = P.param("estado");

  /* minutos desde medianoche <-> "HH:MM" */
  P.min = function (hhmm) { var p = String(hhmm).split(":"); return (+p[0]) * 60 + (+p[1]); };
  P.hhmm = function (m) {
    m = ((m % 1440) + 1440) % 1440;
    var h = Math.floor(m / 60), n = m % 60;
    return (h < 10 ? "0" : "") + h + ":" + (n < 10 ? "0" : "") + n;
  };
  /* hora de ahora en minutos; con ?hora=07:40 se fija (para revisar el tablero a cualquier hora) */
  P.ahora = function () {
    var q = P.param("hora");
    if (q && /^([01]?\d|2[0-3]):[0-5]\d$/.test(q)) return P.min(q);
    var d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  };

  /* estado de una horneada segun la hora: "futura" | "recien" | "pasada" (ventana de 45 min) */
  P.faseHorneada = function (hhmm) {
    var h = P.min(hhmm), a = P.ahora();
    if (h > a) return "futura";
    return a - h < 45 ? "recien" : "pasada";
  };

  P.anunciar = function (texto) {
    var r = document.getElementById("anuncio");
    if (!r) return;
    r.textContent = "";
    window.setTimeout(function () { r.textContent = texto; }, 30);
  };
  P.el = function (tag, clase, texto) {
    var e = document.createElement(tag);
    if (clase) e.className = clase;
    if (texto != null) e.textContent = texto;
    return e;
  };
  P.icono = function (nombre, clase) {
    var ns = "http://www.w3.org/2000/svg";
    var s = document.createElementNS(ns, "svg");
    s.setAttribute("class", "icono" + (clase ? " " + clase : ""));
    s.setAttribute("aria-hidden", "true");
    var u = document.createElementNS(ns, "use");
    u.setAttribute("href", "iconos.svg#i-" + nombre);
    s.appendChild(u);
    return s;
  };
})();
