/* Ceniza (Demo): utilidades, botones de WhatsApp y menu del celular. Nada se guarda ni se envia:
   los botones abren el chat de Multitec con un texto fijo; la tienda no recibe nada. No hay campos de texto. */
(function () {
  "use strict";
  var C = window.Ceniza = window.Ceniza || {};
  var raiz = document.documentElement;

  C.reducido = function () { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; };

  /* aviso para lectores de pantalla (region viva, sin robar el foco) */
  C.anunciar = function (texto) {
    var r = document.getElementById("anuncio");
    if (!r) return;
    r.textContent = "";
    window.setTimeout(function () { r.textContent = texto; }, 30);
  };

  /* mensaje prellenado: solo con lo elegido de listas fijas (prenda y talle), nunca texto escrito por la persona */
  C.mensaje = function (prenda, talle) {
    if (!prenda) return "Hola, vi la demo de Ceniza y quiero una web así.";
    var dato = "prenda: " + prenda + (talle ? ", talle: " + talle : "");
    return "Hola, vi la demo de Ceniza (" + dato + ") y quiero una web así.";
  };
  C.enlaceWa = function (texto) { return "https://wa.me/595981601211?text=" + encodeURIComponent(texto); };

  /* ---------- WhatsApp: abrir, avisar, y si no se pudo abrir, copiar el mensaje ---------- */
  var TEXTO_OK = "Abrimos WhatsApp. Es una demo: la tienda no recibió nada.";
  var TEXTO_FALLA = "No pudimos abrir WhatsApp. Probá de nuevo o copiá el mensaje.";

  function mensajeDe(href) {
    try { return new URL(href, window.location.href).searchParams.get("text") || ""; } catch (e) { return ""; }
  }

  function copiar(texto, estado) {
    function bien() { estado.textContent = "Mensaje copiado."; estado.classList.remove("wa__estado--error"); C.anunciar("Mensaje copiado."); }
    function aMano() {
      var t = document.createElement("textarea");
      t.className = "sr";
      t.value = texto;
      t.setAttribute("readonly", "");
      document.body.appendChild(t);
      t.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(t);
      if (ok) bien();
      else estado.textContent = "No pudimos copiar. El mensaje es: " + texto;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texto).then(bien, aMano);
    else aMano();
  }

  function falla(a, estado) {
    if (!estado) { C.anunciar(TEXTO_FALLA); return; }
    estado.textContent = TEXTO_FALLA + " ";
    estado.classList.add("wa__estado--error");
    var b = document.createElement("button");
    b.type = "button";
    b.className = "btn btn--linea btn--s";
    b.textContent = "Copiar mensaje";
    b.addEventListener("click", function () { copiar(mensajeDe(a.getAttribute("href")), estado); });
    estado.appendChild(document.createElement("br"));
    estado.appendChild(b);
    C.anunciar(TEXTO_FALLA);
  }

  Array.prototype.forEach.call(document.querySelectorAll("a[data-wa]"), function (a) {
    a.addEventListener("click", function (e) {
      var grupo = a.closest(".wa");
      var estado = grupo ? grupo.querySelector("[data-wa-estado]") : null;
      var w = null;
      if (raiz.getAttribute("data-estado") !== "wafalla") {
        try { w = window.open(a.href, "_blank"); } catch (x) { w = null; }
      }
      e.preventDefault();
      if (w) {
        try { w.opener = null; } catch (x) { /* nada */ }
        if (estado) { estado.textContent = TEXTO_OK; estado.classList.remove("wa__estado--error"); }
        C.anunciar(TEXTO_OK);
      } else {
        falla(a, estado);
      }
    });
  });

  /* ---------- alto real de la franja de Multitec: la portada y el aviso de sin conexion cuentan con el ---------- */
  var cinta = document.querySelector("[data-cinta]");
  if (cinta) {
    var medir = function () {
      var h = Math.round(cinta.getBoundingClientRect().height) + "px";
      if (raiz.style.getPropertyValue("--alto-cinta") !== h) raiz.style.setProperty("--alto-cinta", h);
      /* con la cinta cerrada aparece el boton flotante: la portada sube su texto (carta.css) */
      if (h === "0px") raiz.setAttribute("data-cinta-cerrada", ""); else raiz.removeAttribute("data-cinta-cerrada");
    };
    medir();
    if (window.ResizeObserver) new ResizeObserver(medir).observe(cinta);
    else window.addEventListener("resize", medir);
  }

  /* ---------- menu del celular (debajo de 640 px) ---------- */
  var boton = document.querySelector("[data-menu]");
  var nav = document.querySelector("[data-menu-nav]");
  if (boton && nav) {
    var ancho = window.matchMedia("(min-width: 640px)");
    var cerrar = function (devolverFoco) {
      if (!nav.hasAttribute("data-abierto")) return;
      nav.removeAttribute("data-abierto");
      boton.setAttribute("aria-expanded", "false");
      if (devolverFoco) boton.focus();
    };
    boton.addEventListener("click", function () {
      var abre = !nav.hasAttribute("data-abierto");
      if (abre) { nav.setAttribute("data-abierto", ""); boton.setAttribute("aria-expanded", "true"); }
      else cerrar(false);
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) cerrar(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") cerrar(true); });
    document.addEventListener("click", function (e) { if (!e.target.closest("[data-barra]")) cerrar(false); });
    if (ancho.addEventListener) ancho.addEventListener("change", function () { cerrar(false); });
  }
})();
