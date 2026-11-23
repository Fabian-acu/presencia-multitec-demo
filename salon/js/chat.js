/* Tono Vivo (Demo): chat del agente (conversacion de ejemplo, sin caja para escribir). El primer mensaje del cliente usa el tono
   activo. Los globos aparecen de a uno (opacity + translateY 8 px, 220 ms, 450 ms entre uno y otro) cuando el chat entra en
   pantalla. Parte de lo ya visible: si la animacion no corre, se leen todos. Con reduced-motion no se anima. */
(function () {
  "use strict";
  var T = window.Tono = window.Tono || {};
  var doc = document;
  var chat = doc.querySelector("[data-chat]");
  if (!chat) return;
  var tonoEl = chat.querySelector("[data-chat-tono]");
  var globos = chat.querySelectorAll(".globo");

  function pintarTono() {
    var t = T.tonoPorId(T.sel.tono);
    tonoEl.textContent = t ? t.nombre.toLowerCase() : "fucsia";
  }
  pintarTono();
  T.alCambiar(function (cambios) { if (cambios.tono !== undefined) pintarTono(); });

  if (T.reducido() || !Element.prototype.animate) return;
  var corrio = false;
  function reproducir() {
    if (corrio) return;
    corrio = true;
    for (var i = 0; i < globos.length; i++) {
      globos[i].animate(
        [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
        { duration: 220, delay: i * 450, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "backwards" }
      );
    }
  }
  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (ents) {
      for (var k = 0; k < ents.length; k++) {
        if (ents[k].isIntersecting) { reproducir(); obs.disconnect(); }
      }
    }, { threshold: 0.4 });
    obs.observe(chat);
  }
})();
