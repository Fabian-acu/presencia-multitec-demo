/* Consultorio Abril (Demo): utilidades, botones de WhatsApp y menu del celular. Nada se guarda ni se envia:
   los botones abren el chat de Multitec con un texto fijo; el consultorio no recibe nada. Texto del usuario: no hay campos. */
(function () {
  "use strict";
  var A = window.Abril = window.Abril || {};
  var raiz = document.documentElement;

  A.reducido = function () { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; };

  /* aviso para lectores de pantalla (region viva, sin robar el foco) */
  A.anunciar = function (texto) {
    var r = document.getElementById("anuncio");
    if (!r) return;
    r.textContent = "";
    window.setTimeout(function () { r.textContent = texto; }, 30);
  };

  /* ---------- WhatsApp: abrir, avisar, y si no se pudo abrir, copiar el mensaje ---------- */
  var TEXTO_OK = "Abrimos WhatsApp. Es una demo: el consultorio no recibió nada.";
  var TEXTO_FALLA = "No pudimos abrir WhatsApp. Probá de nuevo o copiá el mensaje.";

  function mensajeDe(href) {
    try { return new URL(href, window.location.href).searchParams.get("text") || ""; } catch (e) { return ""; }
  }

  function copiar(texto, estado) {
    function bien() { estado.textContent = "Mensaje copiado."; estado.classList.remove("wa__estado--error"); A.anunciar("Mensaje copiado."); }
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
    if (!estado) { A.anunciar(TEXTO_FALLA); return; }
    estado.textContent = TEXTO_FALLA + " ";
    estado.classList.add("wa__estado--error");
    var b = document.createElement("button");
    b.type = "button";
    b.className = "btn btn--linea btn--s";
    b.textContent = "Copiar mensaje";
    b.addEventListener("click", function () { copiar(mensajeDe(a.getAttribute("href")), estado); });
    estado.appendChild(document.createElement("br"));
    estado.appendChild(b);
    A.anunciar(TEXTO_FALLA);
  }

  Array.prototype.forEach.call(document.querySelectorAll("a[data-wa]"), function (a) {
    a.addEventListener("click", function (e) {
      var estado = a.closest(".wa") ? a.closest(".wa").querySelector("[data-wa-estado]") : null;
      var w = null;
      if (raiz.getAttribute("data-estado") !== "wafalla") {
        try { w = window.open(a.href, "_blank"); } catch (x) { w = null; }
      }
      e.preventDefault();
      if (w) {
        try { w.opener = null; } catch (x) { /* nada */ }
        if (estado) { estado.textContent = TEXTO_OK; estado.classList.remove("wa__estado--error"); }
        A.anunciar(TEXTO_OK);
      } else {
        falla(a, estado);
      }
    });
  });

  /* ---------- menu del celular (debajo de 1100 px) ---------- */
  var boton = document.querySelector("[data-menu]");
  var nav = document.querySelector("[data-menu-nav]");
  if (boton && nav) {
    var ancho = window.matchMedia("(min-width: 1100px)");
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
