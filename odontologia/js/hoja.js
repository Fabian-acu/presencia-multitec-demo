/* Consultorio Abril (Demo): la hoja del mapa (<dialog>). Abajo en celular, al centro en compu.
   Se cierra con la X, Esc, clic afuera, arrastre hacia abajo (celular) o el boton Atras. Navegacion por hash: #mapa.
   El foco vuelve a "Como llegar" al cerrar. Nada se guarda. El arrastre corta la transicion en curso. */
(function () {
  "use strict";
  var A = window.Abril = window.Abril || {};
  var dialogo = document.getElementById("hoja-mapa");
  var abrirBtn = document.querySelector("[data-abrir-mapa]");
  if (!dialogo) return;

  var panel = dialogo.querySelector("[data-panel]");
  var figura = dialogo.querySelector("[data-mapa-foto]");
  var imagen = dialogo.querySelector("[data-mapa-img]");
  var error = dialogo.querySelector("[data-mapa-error]");
  var reintentar = dialogo.querySelector("[data-reintentar-mapa]");
  var HASH = "#mapa";
  var VELOCIDAD = 0.11;       /* px/ms: soltar mas rapido que esto cierra */
  var abierta = false;
  var disparador = null;      /* a quien vuelve el foco al cerrar */
  var empujado = false;       /* este hash lo puso el usuario: se deshace con history.back() */
  var raiz = document.documentElement;

  /* ---------- mapa que falla ---------- */
  function mostrarError(si) {
    figura.hidden = si;
    error.hidden = !si;
  }
  var fallo = false;           /* la foto ya fallo (la imagen es diferida: falla al abrir la hoja) */
  imagen.addEventListener("error", function () { fallo = true; mostrarError(true); });
  imagen.addEventListener("load", function () { fallo = false; if (raiz.getAttribute("data-estado") !== "mapa") mostrarError(false); });
  reintentar.addEventListener("click", function () {
    if (raiz.getAttribute("data-estado") === "mapa") raiz.removeAttribute("data-estado");   /* el estado de prueba se usa una vez */
    mostrarError(false);
    imagen.src = "fotos/mapa-gris.webp?r=" + Date.now();
    A.anunciar("Probando de nuevo.");
  });

  /* ---------- abrir y cerrar ---------- */
  function abrir() {
    if (abierta) return;
    if (!disparador || !document.contains(disparador)) disparador = abrirBtn;
    mostrarError(fallo || raiz.getAttribute("data-estado") === "mapa");
    dialogo.showModal();
    abierta = true;
    panel.style.transform = "";
    window.requestAnimationFrame(function () { window.requestAnimationFrame(function () { dialogo.classList.add("visible"); }); });
  }

  function volverFoco() {
    if (disparador && document.contains(disparador)) disparador.focus({ preventScroll: true });
    disparador = null;
  }

  function cerrarAnimado() {
    abierta = false;
    dialogo.classList.remove("visible");
    panel.style.transform = "";
    var listo = false;
    function fin() {
      if (listo) return;
      listo = true;
      panel.removeEventListener("transitionend", alTerminar);
      if (!dialogo.classList.contains("visible") && dialogo.open) dialogo.close();
      volverFoco();
    }
    function alTerminar(e) { if (e.target === panel && (e.propertyName === "transform" || e.propertyName === "opacity")) fin(); }
    panel.addEventListener("transitionend", alTerminar);
    window.setTimeout(fin, A.reducido() ? 180 : 460);
  }

  function sincronizar() {
    var quiere = window.location.hash === HASH;
    if (quiere && !abierta) abrir();
    else if (!quiere && abierta) cerrarAnimado();
    if (!quiere) empujado = false;
  }

  function ir(el) {
    if (el) disparador = el;
    else if (document.activeElement && document.activeElement !== document.body) disparador = document.activeElement;
    if (window.location.hash === HASH) { sincronizar(); return; }
    empujado = true;
    window.location.hash = HASH;
  }

  function cerrar() {
    if (!abierta) return;
    if (empujado) { empujado = false; window.history.back(); }
    else { window.history.replaceState(null, "", window.location.pathname + window.location.search); sincronizar(); }
  }

  window.addEventListener("hashchange", sincronizar);
  if (abrirBtn) abrirBtn.addEventListener("click", function () { ir(abrirBtn); });
  dialogo.addEventListener("cancel", function (e) { e.preventDefault(); cerrar(); });                                   /* Esc */
  dialogo.addEventListener("click", function (e) { if (e.target === dialogo && dialogo.classList.contains("visible")) cerrar(); });   /* clic afuera */
  Array.prototype.forEach.call(dialogo.querySelectorAll("[data-cerrar]"), function (b) {
    b.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); cerrar(); });
  });

  /* ---------- arrastre desde la cabecera, hacia abajo, solo en celular ---------- */
  var asa = dialogo.querySelector(".hoja__cabeza");
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
    if (v >= VELOCIDAD || dy > panel.offsetHeight / 3) cerrar();
    else panel.style.transform = "";
  }
  asa.addEventListener("pointerup", soltar);
  asa.addEventListener("pointercancel", soltar);

  /* al cargar con #mapa (enlace directo o recarga): los scripts con defer corren antes de DOMContentLoaded */
  window.addEventListener("DOMContentLoaded", sincronizar);
})();
