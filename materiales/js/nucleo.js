/* La Plomada (Demo): utilidades y topes. Nada se guarda, nada sale a la red.
   Parametros de prueba: ?estado=cerrado|cargando|sinfotos|error|offline (el reloj real nunca cierra la demo). */
(function () {
  "use strict";
  var P = window.Plomada = window.Plomada || {};

  /* ---- TOPES DE LA DEMO: lo unico que hay que tocar para cambiarlos (el HTML trae el mismo texto por defecto) ---- */
  P.CONFIG = {
    MAX_M2: 150,          /* calculadora: pared maxima en m2 */
    MAX_GENERAL: 99,      /* lista: unidades maximas por producto */
    MAX_LADRILLO: 10000,  /* lista: ladrillos y bloques */
    MAX_ARENA: 30,        /* lista: arena y piedra, en m3 */
    ZONAS: { centro: 120000, norte: 150000, sur: 180000 },   /* flete de ejemplo (Demo), en Gs. */
    PIN: { centro: [48, 52], norte: [40, 28], sur: [56, 80] } /* posicion del pin en el mapa de ejemplo, en % */
  };

  P.gs = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); };
  P.dec = function (n) { return (Math.round(n * 10) / 10).toFixed(1).replace(".", ","); };
  P.reducido = function () { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; };
  P.param = function (k) {
    try { return new URLSearchParams(window.location.search).get(k); } catch (e) { return null; }
  };
  P.estado = P.param("estado");
  if (P.estado && /^[a-z]+$/.test(P.estado)) document.documentElement.setAttribute("data-estado", P.estado);

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
    s.setAttribute("focusable", "false");
    var u = document.createElementNS(ns, "use");
    u.setAttribute("href", "iconos.svg#i-" + nombre);
    s.appendChild(u);
    return s;
  };
  P.anunciar = function (texto) {
    var r = document.getElementById("anuncio");
    if (!r) return;
    r.textContent = "";
    window.setTimeout(function () { r.textContent = texto; }, 30);
  };
  P.norm = function (s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); };

  /* texto de los topes (se arma con CONFIG) */
  P.textoMaximo = function () {
    var c = P.CONFIG;
    return "Máximo en esta demo: " + c.MAX_GENERAL + " por producto (ladrillos y bloques, " + P.gs(c.MAX_LADRILLO) + "; arena y piedra, " + c.MAX_ARENA + " m³).";
  };

  /* cantidad con su unidad: ladrillos "1.200 un", arena "1,0 m³", el resto entero */
  P.cantidad = function (q, prod) { return prod.paso < 1 ? P.dec(q) : P.gs(q); };
  P.unidad = function (q, prod) { return q === 1 ? prod.u1 : prod.un; };

  /* rodillo: el numero viejo sale y el nuevo entra (transform). Con reduced-motion cambia directo. */
  P.rodar = function (el, texto, sube, dur) {
    if (el.__t === texto) return;
    var viejo = el.__t != null ? el.__t : el.textContent;
    if (viejo === texto) { el.__t = texto; return; }
    el.__t = texto;
    if (el.__an) { el.__an.cancel(); el.__an = null; }
    if (P.reducido() || !el.animate || viejo === "" || viejo == null) { el.textContent = texto; return; }
    el.textContent = "";
    var rod = P.el("span", "rod");
    rod.setAttribute("aria-hidden", "true");
    var c = P.el("span", "rod__c");
    var a = P.el("span", null, viejo), b = P.el("span", null, texto);
    if (sube) { c.appendChild(a); c.appendChild(b); } else { c.appendChild(b); c.appendChild(a); }
    rod.appendChild(c);
    el.appendChild(rod);
    var an = c.animate(
      [{ transform: sube ? "translateY(0)" : "translateY(-50%)" }, { transform: sube ? "translateY(-50%)" : "translateY(0)" }],
      { duration: dur || 160, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "forwards" }
    );
    el.__an = an;
    function fin() { if (el.__t === texto) el.textContent = texto; el.__an = null; }
    an.onfinish = fin;
    window.setTimeout(fin, (dur || 160) + 100);
  };

  /* una miniatura sale del producto hacia el contador de la lista (220 ms, salida fuerte) */
  P.volar = function (desde) {
    if (P.reducido() || !desde || !desde.animate) return;
    var metas = document.querySelectorAll(".barralista:not([hidden]) [data-n], .barra__lista [data-n]");
    var meta = null;
    for (var i = 0; i < metas.length; i++) { var r = metas[i].getBoundingClientRect(); if (r.width > 0 && r.height > 0) { meta = metas[i]; break; } }
    if (!meta) return;
    var a = desde.getBoundingClientRect(), b = meta.getBoundingClientRect();
    if (!a.width) return;
    var lado = 36;
    var punto = P.el("span", "vuelo");
    punto.setAttribute("aria-hidden", "true");
    var img = desde.querySelector ? desde.querySelector("img") : null;
    if (img && img.currentSrc) { var im = P.el("img"); im.src = img.currentSrc; im.alt = ""; punto.appendChild(im); }
    punto.style.left = (a.left + a.width / 2 - lado / 2) + "px";
    punto.style.top = (a.top + a.height / 2 - lado / 2) + "px";
    document.body.appendChild(punto);
    var dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    var an = punto.animate([{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: "translate(" + dx + "px," + dy + "px) scale(.35)", opacity: .2 }],
      { duration: 220, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "forwards" });
    function fin() { if (punto.parentNode) punto.parentNode.removeChild(punto); }
    an.onfinish = fin;
    window.setTimeout(fin, 400);
  };
})();
