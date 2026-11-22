/* Presencia Multitec (demos pro): reproduce el chat de ejemplo. Sin librerias.
   La conversacion completa ya viene en el HTML: si este archivo falla o el visitante pide menos movimiento, se ve entera y quieta.
   Solo mueve opacity y transform (en el CSS). Textos: _fuente/chats.json. */
(function () {
  "use strict";
  var quieto = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (quieto || !("IntersectionObserver" in window)) { return; }
  var chats = document.querySelectorAll("[data-chat]");
  var ENTRA = 220, ESCRIBE = 1000, ARRANCA = 500, TOPE = 15000;

  Array.prototype.forEach.call(chats, function (fig) {
    var items = Array.prototype.slice.call(fig.querySelectorAll(".g"));
    var timers = [], corriendo = false;

    // "escribiendo": 3 puntos dentro del lugar del globo del asistente (aria-hidden, no cambia el alto)
    items.forEach(function (it) {
      if (!it.classList.contains("g-a")) { return; }
      var t = document.createElement("span");
      t.className = "g-typing"; t.setAttribute("aria-hidden", "true");
      for (var k = 0; k < 3; k++) { t.appendChild(document.createElement("i")); }
      it.appendChild(t);
    });

    // "Ver de nuevo": su lugar queda reservado (invisible) para que no se mueva nada al aparecer
    var pie = document.createElement("div"); pie.className = "chat-pie";
    var otra = document.createElement("button");
    otra.type = "button"; otra.className = "chat-otra"; otra.textContent = "Ver de nuevo";
    pie.appendChild(otra); fig.appendChild(pie);
    fig.setAttribute("tabindex", "-1");

    function en(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function limpiar() { timers.forEach(clearTimeout); timers = []; }
    function fin() { corriendo = false; pie.classList.add("lista"); }
    function mostrarTodo() {
      limpiar();
      items.forEach(function (it) { it.classList.remove("escribiendo"); it.classList.add("in"); });
      fin();
    }
    function empezar() {
      corriendo = true;
      var t = ARRANCA;
      items.forEach(function (it, k) {
        if (k === 0) { t += 500; return; } // el primer globo ya se ve desde el inicio
        var asistente = it.classList.contains("g-a");
        var lectura = it.classList.contains("g-sep") || it.classList.contains("g-chips") ? 300 : Math.min(2000, 700 + it.textContent.length * 14);
        if (asistente) {
          en(t, function () { it.classList.add("escribiendo"); });
          t += ESCRIBE;
        }
        en(t, function () { it.classList.remove("escribiendo"); it.classList.add("in"); });
        t += ENTRA + lectura;
      });
      en(t, fin);
      en(TOPE, mostrarTodo); // red de seguridad: pase lo que pase, a los 15 s se ve todo
    }
    function reiniciar() {
      limpiar();
      items.forEach(function (it, k) { if (k > 0) { it.classList.remove("in", "escribiendo"); } });
      pie.classList.remove("lista");
      fig.focus({ preventScroll: true });
      empezar();
    }

    // Se prepara oculto (solo con JS), con el primer globo ya visible, y arranca una vez cuando el principio de la lista entra en el 80% de abajo de la pantalla.
    fig.classList.add("anim");
    if (items[0]) { items[0].classList.add("in"); }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); empezar(); } });
    }, { rootMargin: "0px 0px -20% 0px", threshold: 0 });
    io.observe(fig.querySelector(".chat-lista"));

    fig.addEventListener("click", function (e) {
      if (corriendo && !(e.target.closest && e.target.closest("a, button"))) { mostrarTodo(); }
    });
    otra.addEventListener("click", reiniciar);
    document.addEventListener("visibilitychange", function () { if (document.hidden && corriendo) { mostrarTodo(); } });
    window.addEventListener("beforeprint", mostrarTodo);
  });
})();
