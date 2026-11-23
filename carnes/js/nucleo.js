/* El Filo (Demo): utilidades compartidas. Nada se guarda, nada sale a la red.
   Parametros de prueba: ?estado=cerrado|cargando|sinfotos|error|offline  y  ?hora=HH:MM (cambia el reloj del pedido). */
(function () {
  "use strict";
  var F = window.Filo = window.Filo || {};

  F.gs = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); };
  F.kg = function (n) { return (Math.round(n * 10) / 10).toFixed(1).replace(".", ","); };
  F.reducido = function () { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; };
  F.param = function (k) {
    try { return new URLSearchParams(window.location.search).get(k); } catch (e) { return null; }
  };
  F.estado = F.param("estado");
  if (F.estado && /^[a-z]+$/.test(F.estado)) document.documentElement.setAttribute("data-estado", F.estado);

  /* hora de ahora en minutos; con ?hora=07:40 se fija (para revisar la hora limite a cualquier hora) */
  F.ahora = function () {
    var q = F.param("hora");
    if (q && /^([01]?\d|2[0-3]):[0-5]\d$/.test(q)) { var p = q.split(":"); return (+p[0]) * 60 + (+p[1]); }
    var d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  };

  F.el = function (tag, clase, texto) {
    var e = document.createElement(tag);
    if (clase) e.className = clase;
    if (texto != null) e.textContent = texto;
    return e;
  };
  F.icono = function (nombre, clase) {
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
  F.anunciar = function (texto) {
    var r = document.getElementById("anuncio");
    if (!r) return;
    r.textContent = "";
    window.setTimeout(function () { r.textContent = texto; }, 30);
  };

  /* rodillo: el numero viejo sale y el nuevo entra (transform, 160 ms). Con reduced-motion cambia directo. */
  F.rodar = function (el, texto, sube) {
    if (el.__t === texto) return;
    var viejo = el.__t != null ? el.__t : el.textContent;
    el.__t = texto;
    if (el.__an) { el.__an.cancel(); el.__an = null; }
    if (F.reducido() || !el.animate || viejo === "" || viejo == null) { el.textContent = texto; return; }
    el.textContent = "";
    var rod = F.el("span", "rod");
    rod.setAttribute("aria-hidden", "true");
    var c = F.el("span", "rod__c");
    var a = F.el("span", null, viejo), b = F.el("span", null, texto);
    if (sube) { c.appendChild(a); c.appendChild(b); } else { c.appendChild(b); c.appendChild(a); }
    rod.appendChild(c);
    el.appendChild(rod);
    var an = c.animate(
      [{ transform: sube ? "translateY(0)" : "translateY(-50%)" }, { transform: sube ? "translateY(-50%)" : "translateY(0)" }],
      { duration: 160, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "forwards" }
    );
    el.__an = an;
    function fin() { if (el.__t === texto) el.textContent = texto; el.__an = null; }
    an.onfinish = fin;
    window.setTimeout(fin, 260);
  };
})();
