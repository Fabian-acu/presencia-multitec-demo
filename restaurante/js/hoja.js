/* La Ajicera (Demo): hojas (<dialog>) genéricas + utilidades compartidas.
   Hoja inferior en celular, panel lateral en compu. Se cierra con X, Esc, arrastre hacia abajo o el botón Atrás.
   La navegación va por hash (#plato-id, #pedido, #datos, #seguimiento, #reserva). Nada se guarda. */
(function () {
  "use strict";
  var A = window.Ajicera = window.Ajicera || {};

  /* ---- utilidades compartidas ---- */
  A.gs = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); };
  A.reducido = function () { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; };
  A.anunciar = function (texto) {
    var r = document.getElementById("anuncio");
    if (!r) return;
    r.textContent = "";
    window.setTimeout(function () { r.textContent = texto; }, 30);
  };
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
    var u = document.createElementNS(ns, "use");
    u.setAttribute("href", "iconos.svg#i-" + nombre);
    s.appendChild(u);
    return s;
  };

  /* ---- hojas ---- */
  var registro = [];
  var abierta = null;      /* { dialog, reg } */
  var disparador = null;
  var empujado = false;    /* este hash lo puso una acción del usuario (se puede deshacer con history.back) */
  var VELOCIDAD = 0.11;    /* px/ms */

  A.hoja = {
    registrar: function (reg) { registro.push(reg); },
    abierta: function () { return abierta; },
    ir: function (hash, el) {
      /* quien disparó la acción: a él vuelve el foco al cerrar */
      if (el) disparador = el;
      else if (document.activeElement && document.activeElement !== document.body) disparador = document.activeElement;
      if (location.hash === hash) { sincronizar(); return; }
      empujado = true;
      location.hash = hash;
    },
    cerrarTodo: function () {
      empujado = false;
      history.replaceState(null, "", location.pathname + location.search);
      sincronizar();
    },
    cerrar: function () {
      if (!abierta) return;
      if (empujado) { empujado = false; history.back(); }
      else { history.replaceState(null, "", location.pathname + location.search); sincronizar(); }
    }
  };

  function abrir(reg) {
    var d = reg.dialog;
    if (reg.alAbrir && reg.alAbrir(location.hash) === false) {
      history.replaceState(null, "", location.pathname + location.search);
      return;
    }
    if (!disparador || !document.contains(disparador)) disparador = document.activeElement;
    d.showModal();
    abierta = { dialog: d, reg: reg };
    var panel = d.querySelector(".hoja__panel");
    panel.style.transform = "";
    window.requestAnimationFrame(function () { window.requestAnimationFrame(function () { d.classList.add("visible"); }); });
  }

  function cerrarYa(d) {
    d.classList.remove("visible");
    if (d.open) d.close();
  }

  function cerrarAnimado(a) {
    var d = a.dialog;
    var panel = d.querySelector(".hoja__panel");
    d.classList.remove("visible");
    panel.style.transform = "";
    var listo = false;
    function fin() {
      if (listo) return;
      listo = true;
      panel.removeEventListener("transitionend", alTerminar);
      if (!d.classList.contains("visible") && d.open) d.close();
      if (a.reg.alCerrar) a.reg.alCerrar();
      if (disparador && document.contains(disparador)) disparador.focus({ preventScroll: true });
      disparador = null;
    }
    function alTerminar(e) { if (e.target === panel) fin(); }
    panel.addEventListener("transitionend", alTerminar);
    window.setTimeout(fin, A.reducido() ? 180 : 450);
  }

  function sincronizar() {
    var h = location.hash;
    var objetivo = null;
    for (var i = 0; i < registro.length; i++) { if (registro[i].coincide(h)) { objetivo = registro[i]; break; } }
    if (abierta && (!objetivo || abierta.reg !== objetivo)) {
      var previa = abierta;
      abierta = null;
      if (objetivo) { cerrarYa(previa.dialog); if (previa.reg.alCerrar) previa.reg.alCerrar(); }
      else cerrarAnimado(previa);
    }
    if (objetivo && !abierta) abrir(objetivo);
    if (!objetivo) empujado = false;
  }

  window.addEventListener("hashchange", sincronizar);

  /* ---- cableado de cada <dialog class="hoja"> ---- */
  Array.prototype.forEach.call(document.querySelectorAll("dialog.hoja"), function (d) {
    var panel = d.querySelector(".hoja__panel");
    d.addEventListener("cancel", function (e) { e.preventDefault(); A.hoja.cerrar(); });          /* Esc */
    d.addEventListener("click", function (e) { if (e.target === d) A.hoja.cerrar(); });           /* fuera del panel */
    Array.prototype.forEach.call(d.querySelectorAll("[data-cerrar]"), function (b) {
      b.addEventListener("click", function () { A.hoja.cerrar(); });
    });

    /* arrastre hacia abajo (solo celular), desde la cabecera de la hoja */
    var cabeza = d.querySelector(".hoja__cabeza");
    if (!cabeza) return;
    var y0 = 0, t0 = 0, yPrev = 0, tPrev = 0, dy = 0, activo = false;
    cabeza.addEventListener("pointerdown", function (e) {
      if (window.matchMedia("(min-width: 900px)").matches) return;
      if (e.target.closest("button")) return;
      activo = true; y0 = yPrev = e.clientY; t0 = tPrev = e.timeStamp; dy = 0;
      cabeza.setPointerCapture(e.pointerId);
      panel.style.transition = "none";
    });
    cabeza.addEventListener("pointermove", function (e) {
      if (!activo) return;
      dy = Math.max(0, e.clientY - y0);
      yPrev = e.clientY; tPrev = e.timeStamp;
      panel.style.transform = "translateY(" + dy + "px)";
    });
    function soltar(e) {
      if (!activo) return;
      activo = false;
      var dt = Math.max(1, e.timeStamp - t0);
      var v = (e.clientY - y0) / dt;
      panel.style.transition = "";
      if (v >= VELOCIDAD || dy > panel.offsetHeight / 3) { A.hoja.cerrar(); }
      else { panel.style.transform = ""; }
    }
    cabeza.addEventListener("pointerup", soltar);
    cabeza.addEventListener("pointercancel", soltar);
  });

  /* al cargar con un hash de hoja (enlace directo o recarga); los scripts con defer corren antes de DOMContentLoaded */
  window.addEventListener("DOMContentLoaded", sincronizar);
})();
