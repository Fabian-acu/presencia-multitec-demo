/* Tono Vivo (Demo): hojas (<dialog>). Celular: suben desde abajo a pagina completa. Compu: al centro.
   Se cierran con la X, Esc, clic afuera, arrastre hacia abajo (celular) o el boton Atras. Navegacion por hash:
   #revisar, #mapa, #foto-<n>. Nada se guarda. El arrastre corta la transicion en curso y el foco vuelve a quien abrio. */
(function () {
  "use strict";
  var T = window.Tono = window.Tono || {};
  var registro = [];
  var abierta = null;      /* { dialog, reg } */
  var disparador = null;   /* a quien vuelve el foco al cerrar */
  var empujado = false;    /* este hash lo puso una accion del usuario: se deshace con history.back() */
  var VELOCIDAD = 0.11;    /* px/ms: soltar mas rapido que esto cierra */

  T.hoja = {
    registrar: function (reg) { registro.push(reg); },
    abierta: function () { return abierta; },
    ir: function (hash, el) {
      if (el) disparador = el;
      else if (document.activeElement && document.activeElement !== document.body) disparador = document.activeElement;
      if (window.location.hash === hash) { sincronizar(); return; }
      empujado = true;
      window.location.hash = hash;
    },
    /* cambia de foto dentro del visor sin apilar historia */
    reemplazar: function (hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search + hash);
      sincronizar();
    },
    cerrar: function () {
      if (!abierta) return;
      if (empujado) { empujado = false; window.history.back(); }
      else { window.history.replaceState(null, "", window.location.pathname + window.location.search); sincronizar(); }
    }
  };

  function abrir(reg) {
    var d = reg.dialog;
    if (reg.alAbrir && reg.alAbrir(window.location.hash) === false) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      return;
    }
    if (!disparador || !document.contains(disparador)) disparador = document.activeElement;
    d.showModal();
    abierta = { dialog: d, reg: reg };
    var panel = d.querySelector("[data-panel]");
    panel.style.transform = "";
    window.requestAnimationFrame(function () { window.requestAnimationFrame(function () { d.classList.add("visible"); }); });
  }

  function cerrarYa(d) {
    d.classList.remove("visible");
    if (d.open) d.close();
  }

  function cerrarAnimado(a) {
    var d = a.dialog;
    var panel = d.querySelector("[data-panel]");
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
    function alTerminar(e) { if (e.target === panel && e.propertyName === "transform") fin(); }
    panel.addEventListener("transitionend", alTerminar);
    window.setTimeout(fin, T.reducido() ? 180 : 460);
  }

  function sincronizar() {
    var h = window.location.hash;
    var objetivo = null;
    for (var i = 0; i < registro.length; i++) { if (registro[i].coincide(h)) { objetivo = registro[i]; break; } }
    if (abierta && (!objetivo || abierta.reg !== objetivo)) {
      var previa = abierta;
      abierta = null;
      if (objetivo) { cerrarYa(previa.dialog); if (previa.reg.alCerrar) previa.reg.alCerrar(); }
      else cerrarAnimado(previa);
    }
    if (objetivo && !abierta) abrir(objetivo);
    else if (objetivo && abierta && abierta.reg === objetivo && objetivo.alCambiarHash) objetivo.alCambiarHash(h);
    if (!objetivo) empujado = false;
  }
  window.addEventListener("hashchange", sincronizar);

  /* cableado de cada <dialog class="hoja"> */
  Array.prototype.forEach.call(document.querySelectorAll("dialog.hoja"), function (d) {
    var panel = d.querySelector("[data-panel]");
    d.addEventListener("cancel", function (e) { e.preventDefault(); T.hoja.cerrar(); });          /* Esc */
    d.addEventListener("click", function (e) { if (e.target === d && d.classList.contains("visible")) T.hoja.cerrar(); });  /* clic afuera */
    Array.prototype.forEach.call(d.querySelectorAll("[data-cerrar]"), function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); T.hoja.cerrar(); });
    });

    /* arrastre desde la cabecera, hacia abajo, solo en celular */
    var asa = d.querySelector(".hoja__cabeza");
    if (!asa) return;
    var y0 = 0, t0 = 0, dy = 0, activo = false;
    asa.addEventListener("pointerdown", function (e) {
      if (window.matchMedia("(min-width: 900px)").matches) return;
      if (e.target.closest("button, a")) return;
      activo = true; y0 = e.clientY; t0 = e.timeStamp; dy = 0;
      asa.setPointerCapture(e.pointerId);
      panel.style.transition = "none";
    });
    asa.addEventListener("pointermove", function (e) {
      if (!activo) return;
      dy = Math.max(0, e.clientY - y0);
      panel.style.transform = "translateY(" + dy + "px)";
    });
    function soltar(e) {
      if (!activo) return;
      activo = false;
      var v = (e.clientY - y0) / Math.max(1, e.timeStamp - t0);
      panel.style.transition = "";
      if (v >= VELOCIDAD || dy > panel.offsetHeight / 3) T.hoja.cerrar();
      else panel.style.transform = "";
    }
    asa.addEventListener("pointerup", soltar);
    asa.addEventListener("pointercancel", soltar);
  });

  /* al cargar con un hash de hoja (enlace directo o recarga); los scripts con defer corren antes de DOMContentLoaded */
  window.addEventListener("DOMContentLoaded", sincronizar);
})();
