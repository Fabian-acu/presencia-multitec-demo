/* La Primera Hornada (Demo): tablero "Sale ahora".
   Estado de cada horneada segun la hora (real o ?hora=). Siempre muestra algo: si ya salieron todas, resalta la de manana.
   Movimiento: las horas caen como paletas de cartel de salidas al entrar el tablero en pantalla (IntersectionObserver). */
(function () {
  "use strict";
  var P = window.Primera;
  var tablero = document.querySelector("[data-tablero]");
  if (!tablero || !P) return;
  var filas = Array.prototype.slice.call(tablero.querySelectorAll(".fila"));
  var reloj = document.querySelector("[data-reloj]");
  var fin = document.querySelector("[data-fin]");
  P.estadosFila = {};   /* id -> texto del estado, para que la ficha diga lo mismo que el tablero */
  var VENTANA = 45; /* minutos que una horneada figura como "Recien salido" */

  function marcar(fila, atributo, si) {
    if (si) fila.setAttribute(atributo, ""); else fila.removeAttribute(atributo);
  }

  function pintar() {
    var ahora = P.ahora();
    var horas = filas.map(function (f) { return P.min(f.getAttribute("data-hora")); });
    var hayRecien = false, siguiente = -1, pasadas = 0;
    filas.forEach(function (f, i) {
      var h = horas[i];
      if (h > ahora && siguiente < 0) siguiente = i;
      if (h <= ahora - VENTANA) pasadas++;
      if (h <= ahora && ahora - h < VENTANA) hayRecien = true;
    });
    var todas = pasadas === filas.length;

    filas.forEach(function (f, i) {
      var h = horas[i];
      var est = f.querySelector("[data-estado]");
      var boton = f.querySelector("[data-sumar]");
      var nombre = f.querySelector(".fila__nombre").textContent;
      var agotado = P.estado === "agotado" && f.getAttribute("data-ref") === "chipa";
      var txt, pasada = false, actual = false;

      if (h > ahora) {
        txt = "Sale a las " + P.hhmm(h);
        actual = !hayRecien && i === siguiente;
      } else if (ahora - h < VENTANA) {
        txt = "Recién salido";
        actual = true;
      } else {
        txt = f.hasAttribute("data-pocas") ? "Quedan pocas (ejemplo)" : "Ya salió";
        pasada = true;
        if (todas && i === 0) { txt = "Sale mañana a las " + P.hhmm(h); actual = true; pasada = false; }
      }
      if (agotado) {
        txt = "Se terminó (ejemplo). Vuelve " + (ahora < P.min("06:30") ? "hoy" : "mañana") + " 06:30.";
        actual = false; pasada = false;
      }
      est.textContent = txt;
      P.estadosFila[f.getAttribute("data-ref")] = txt;
      marcar(f, "data-actual", actual);
      marcar(f, "data-pasada", pasada);
      marcar(f, "data-agotado", agotado);
      if (boton) {
        boton.disabled = agotado;
        boton.setAttribute("aria-label", agotado ? "No disponible: " + nombre : "Sumar " + nombre + " al pedido");
      }
    });
    if (fin) fin.hidden = !todas;
    if (reloj) { reloj.textContent = P.hhmm(ahora); reloj.setAttribute("datetime", P.hhmm(ahora)); }
  }

  pintar();
  window.setInterval(pintar, 20000);

  /* las horas caen una vez, cuando el tablero entra en pantalla (por defecto todo se ve: la clase solo se pone con JS) */
  if ("IntersectionObserver" in window && !P.reducido()) {
    tablero.classList.add("js-rodillo");
    var visto = false;
    var mostrar = function () { if (!visto) { visto = true; tablero.classList.add("en"); } };
    var io = new IntersectionObserver(function (es) {
      for (var i = 0; i < es.length; i++) { if (es[i].isIntersecting) { mostrar(); io.disconnect(); return; } }
    }, { threshold: 0.2 });
    io.observe(tablero);
    window.setTimeout(mostrar, 6000); /* red de seguridad: pestaña en segundo plano */
  }

  /* la barra de arriba pasa de manteca a blanca cuando el hero sale de pantalla (IntersectionObserver, sin escuchar scroll) */
  var barra = document.querySelector(".barra"), hero = document.querySelector(".hero");
  if (barra && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      barra.classList.toggle("blanca", !es[0].isIntersecting);
    }, { rootMargin: "-" + 60 + "px 0px 0px 0px" }).observe(hero);
  }

  /* el chat de ejemplo: los globos aparecen uno por uno cuando la seccion entra en pantalla (por defecto se ven todos) */
  var chat = document.querySelector("[data-chat]");
  if (chat && "IntersectionObserver" in window && !P.reducido()) {
    chat.classList.add("js-chat");
    var visto2 = false;
    var mostrar2 = function () { if (!visto2) { visto2 = true; chat.classList.add("en"); } };
    var io2 = new IntersectionObserver(function (es) {
      for (var k = 0; k < es.length; k++) { if (es[k].isIntersecting) { mostrar2(); io2.disconnect(); return; } }
    }, { threshold: 0.3 });
    io2.observe(chat);
    window.setTimeout(mostrar2, 6000);
  }
})();
