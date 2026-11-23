/* Taller Aviso (Demo): ficha de seguimiento. Tocar una etapa muestra su aviso (no abre WhatsApp).
   Desde 700 px: el aviso aparece en el chat de al lado (avisos 1 a k; la 5 como "Aviso de ejemplo, todavia no enviado").
   En celular: el aviso se abre debajo de su propia etapa, una por vez, y el chat de abajo muestra fijo el estado de la orden.
   La orden de ejemplo esta en la etapa 4 de 5. Nada se guarda ni se envia. Los textos salen del HTML (una sola fuente). */
(function () {
  "use strict";
  var A = window.Aviso = window.Aviso || {};
  var lista = document.querySelector("[data-etapas]");
  var chat = document.querySelector("[data-chat-avisos]");
  if (!lista || !chat) return;

  var botones = Array.prototype.slice.call(lista.querySelectorAll("[data-etapa]"));
  var globos = Array.prototype.slice.call(chat.querySelectorAll("[data-aviso]"));
  var celular = window.matchMedia("(max-width: 699px)");
  var ACTUAL = 4;   /* la etapa de la orden de ejemplo */

  function soloTexto(nodo) {
    var t = "";
    Array.prototype.forEach.call(nodo.childNodes, function (n) { if (n.nodeType === 3) t += n.nodeValue; });
    return t.trim();
  }
  function avisoDe(b) { return document.getElementById(b.getAttribute("aria-controls")); }

  /* escritorio: chat al costado */
  function mostrar(n, avisar) {
    botones.forEach(function (b) {
      b.setAttribute("aria-pressed", Number(b.getAttribute("data-etapa")) === n ? "true" : "false");
    });
    globos.forEach(function (g) {
      var k = Number(g.getAttribute("data-aviso"));
      var ver = k <= n;
      g.classList.toggle("oculto", !ver);
      if (ver) g.removeAttribute("aria-hidden"); else g.setAttribute("aria-hidden", "true");
      g.classList.remove("entra");
      if (ver && k === n && avisar) {
        void g.offsetWidth;              /* reinicia la animacion de entrada */
        g.classList.add("entra");
      }
    });
    if (!avisar) return;
    var nombre = botones[n - 1].querySelector(".etapa__n").textContent;
    var g5 = globos[n - 1];
    A.anunciar("Aviso de " + nombre + ": " + (n === 5 ? "Aviso de ejemplo, todavía no enviado. " : "") + soloTexto(g5));
  }

  /* celular: una etapa abierta por vez, el aviso queda pegado a lo que se toco */
  function abrir(b) {
    var estaba = b.getAttribute("aria-expanded") === "true";
    botones.forEach(function (o) {
      var abierto = o === b && !estaba;
      o.setAttribute("aria-expanded", abierto ? "true" : "false");
      avisoDe(o).classList.toggle("abierto", abierto);
    });
    if (!estaba) {
      var g = avisoDe(b).querySelector(".burbuja");
      var n = Number(b.getAttribute("data-etapa"));
      A.anunciar("Aviso de " + b.querySelector(".etapa__n").textContent + ": " + (n === 5 ? "Aviso de ejemplo, todavía no enviado. " : "") + soloTexto(g));
    }
  }

  function aplicarModo() {
    botones.forEach(function (b) {
      b.removeAttribute("aria-pressed");
      b.removeAttribute("aria-expanded");
      avisoDe(b).classList.remove("abierto");
    });
    if (celular.matches) {
      globos.forEach(function (g) { g.classList.remove("oculto", "entra"); g.removeAttribute("aria-hidden"); });
      botones.forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
    } else {
      mostrar(ACTUAL, false);
    }
  }

  botones.forEach(function (b) {
    b.setAttribute("aria-controls", "aviso-etapa-" + b.getAttribute("data-etapa"));
    b.addEventListener("click", function () {
      if (celular.matches) abrir(b); else mostrar(Number(b.getAttribute("data-etapa")), true);
    });
  });
  if (celular.addEventListener) celular.addEventListener("change", aplicarModo);
  aplicarModo();
})();
