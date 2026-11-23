/* Tono Vivo (Demo): las 8 muestras de esmalte. Al tocar una, la pagina se tine (View Transitions con revelado circular
   desde la muestra, 450 ms, salida fuerte). Sin soporte, o con reduced-motion, o con teclado: cambio directo (200 ms por @property).
   El tono viaja en el mensaje de WhatsApp. Nada se guarda. */
(function () {
  "use strict";
  var T = window.Tono = window.Tono || {};
  var doc = document;
  var html = doc.documentElement;
  var radios = doc.querySelectorAll("input[name='tono']");
  var nombreEl = doc.querySelector("[data-tono-nombre]");
  var ultimoToque = null;   /* ultimo puntero sobre una muestra: solo el toque o el clic animan, no el teclado */

  function pintarNombres(id) {
    nombreEl.textContent = T.tonoPorId(id).nombre;
    var srs = doc.querySelectorAll("[data-sr-tono]");
    for (var i = 0; i < srs.length; i++) {
      var tid = srs[i].parentNode.getAttribute("data-tono");
      srs[i].textContent = "Tono " + T.tonoPorId(tid).nombre + (tid === id ? ", elegido" : "");
    }
  }

  function aplicar(id, avisar) {
    html.setAttribute("data-tono", id);
    pintarNombres(id);
    T.cambiar({ tono: id }, "tono");
    if (avisar) T.anunciar("Tono elegido: " + T.tonoPorId(id).nombre + ".");
  }

  function elegir(id, centro) {
    if (id === T.sel.tono) return;
    if (!centro || !doc.startViewTransition || T.reducido()) { aplicar(id, true); return; }
    var x = centro.x, y = centro.y;
    var radio = Math.sqrt(Math.pow(Math.max(x, window.innerWidth - x), 2) + Math.pow(Math.max(y, window.innerHeight - y), 2));
    html.style.setProperty("--vx", Math.round(x) + "px");
    html.style.setProperty("--vy", Math.round(y) + "px");
    html.style.setProperty("--vr", Math.ceil(radio) + "px");
    html.classList.add("vt");
    var vt = doc.startViewTransition(function () { aplicar(id, true); });
    var fin = function () { html.classList.remove("vt"); };
    vt.finished.then(fin, fin);
  }

  var muestras = doc.querySelectorAll(".muestra");
  for (var i = 0; i < muestras.length; i++) {
    muestras[i].addEventListener("pointerdown", function (e) { ultimoToque = { t: e.timeStamp, x: e.clientX, y: e.clientY }; });
  }
  for (var j = 0; j < radios.length; j++) {
    radios[j].addEventListener("change", function (e) {
      var r = e.target;
      if (!r.checked) return;
      var centro = null;
      if (ultimoToque && e.timeStamp - ultimoToque.t < 1000) {
        var caja = doc.querySelector(".muestra[data-tono='" + r.value + "']").getBoundingClientRect();
        centro = { x: caja.left + caja.width / 2, y: caja.top + caja.height / 2 };
      }
      ultimoToque = null;
      elegir(r.value, centro);
    });
  }

  /* arranque: fucsia, o el que el navegador dejo marcado al recargar (sin animar ni avisar) */
  var marcado = doc.querySelector("input[name='tono']:checked");
  var inicial = marcado && T.tonoPorId(marcado.value) ? marcado.value : "fucsia";
  html.setAttribute("data-tono", inicial);
  pintarNombres(inicial);
  if (inicial !== T.sel.tono) T.cambiar({ tono: inicial }, "tono");
})();
