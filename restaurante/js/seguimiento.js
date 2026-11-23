/* La Ajicera (Demo): seguimiento del pedido de ejemplo (guion acelerado) y chat de ejemplo.
   Un solo conjunto de temporizadores: al salir o volver a entrar se limpia todo (sin duplicados). */
(function () {
  "use strict";
  var A = window.Ajicera;
  if (!A || !A.hoja || !A.pedido) return;
  var dialog = document.getElementById("hoja-seguimiento");
  var estepper = document.getElementById("estepper");
  var estadoEl = document.getElementById("seg-estado");
  var resumen = document.getElementById("seg-resumen"), totalEl = document.getElementById("seg-total");
  var ruta = document.getElementById("seg-ruta"), punto = document.getElementById("ruta-punto");
  var mensajes = document.getElementById("chat-mensajes");

  var PASOS_DELIVERY = [
    { nombre: "Recibido", icono: "receipt", texto: "Tu pedido llegó al local." },
    { nombre: "En cocina", icono: "cooking-pot", texto: "Lo están preparando." },
    { nombre: "En camino", icono: "motorcycle", texto: "Sale de la cocina y va hacia tu zona." },
    { nombre: "Entregado", icono: "check", texto: "Listo. ¡Buen provecho!" }
  ];
  var PASOS_RETIRO = [
    { nombre: "Recibido", icono: "receipt", texto: "Tu pedido llegó al local." },
    { nombre: "En cocina", icono: "cooking-pot", texto: "Lo están preparando." },
    { nombre: "Listo para retirar", icono: "storefront", texto: "Ya podés pasar a buscarlo." }
  ];
  /* ms desde que empieza el guion hasta cada estado (aceleradísimos; estimado) */
  var TIEMPOS_DELIVERY = [0, 4000, 8000, 18000];
  var TIEMPOS_RETIRO = [0, 4000, 8000];
  var CHAT = [
    { t: 1500, quien: "cliente", texto: "Hola, ¿hasta qué hora están hoy?" },
    { t: 3500, quien: "asistente", chip: "Contesta a cualquier hora", partes: ["¡Hola! Soy el asistente de La Ajicera y hoy abrimos ", { campo: "11:00 a 23:00" }, ". ¿Qué te gustaría saber del menú?"] },
    { t: 6000, quien: "cliente", texto: "¿Tienen algo sin gluten?" },
    { t: 8000, quien: "asistente", texto: "Eso lo confirma una persona del local. Se lo paso." },
    { t: 11000, quien: "asistente", chip: "Unos minutos después", texto: "Ahora hay mucho movimiento, en breve te atienden. Mientras, si tenés alguna consulta, contame." }
  ];
  var ruteo = [[14, 80], [14, 56], [44, 56], [44, 32], [78, 32]];
  var timers = [];
  var animPunto = null;
  var pasos = PASOS_DELIVERY;

  function limpiar() {
    timers.forEach(function (t) { window.clearTimeout(t); });
    timers = [];
    if (animPunto) { animPunto.cancel(); animPunto = null; }
  }
  function en(ms, fn) { timers.push(window.setTimeout(fn, ms)); }

  function armarEstepper() {
    estepper.textContent = "";
    var margen = 100 / (pasos.length * 2);
    estepper.style.setProperty("--margen", margen + "%");
    pasos.forEach(function (p) {
      var li = A.el("li", "estepper__paso");
      var ic = A.el("span", "estepper__icono");
      ic.setAttribute("aria-hidden", "true");
      ic.appendChild(A.icono(p.icono));
      li.appendChild(ic);
      li.appendChild(A.el("span", null, p.nombre));
      estepper.appendChild(li);
    });
    var av = A.el("span", "estepper__avance");
    av.setAttribute("aria-hidden", "true");
    estepper.appendChild(av);
  }

  function ir(i) {
    var items = estepper.querySelectorAll(".estepper__paso");
    Array.prototype.forEach.call(items, function (li, k) {
      li.classList.toggle("hecho", k < i);
      li.classList.toggle("activo", k === i);
      li.classList.remove("pulso");
      if (k === i) { li.setAttribute("aria-current", "step"); } else { li.removeAttribute("aria-current"); }
    });
    var activo = items[i];
    if (activo) { void activo.offsetWidth; activo.classList.add("pulso"); }
    var av = estepper.querySelector(".estepper__avance");
    if (av) av.style.transform = "scaleX(" + (pasos.length > 1 ? i / (pasos.length - 1) : 1) + ")";
    estadoEl.textContent = pasos[i].texto;
  }

  function recorrido() {
    var delivery = pasos === PASOS_DELIVERY;
    if (!delivery) return;
    if (A.reducido() || !punto.animate) { punto.classList.add("fin"); return; }
    /* el punto va por la ruta: solo transform, 10 s (desde "En camino" hasta "Entregado") */
    var largos = [], suma = 0;
    for (var k = 1; k < ruteo.length; k++) {
      var d = Math.abs(ruteo[k][0] - ruteo[k - 1][0]) + Math.abs(ruteo[k][1] - ruteo[k - 1][1]);
      largos.push(d); suma += d;
    }
    var acum = 0;
    var cuadros = ruteo.map(function (p, k) {
      if (k > 0) acum += largos[k - 1];
      return { transform: "translate(calc(" + p[0] + "cqw - 8px), calc(" + p[1] + "cqh - 8px))", offset: acum / suma };
    });
    animPunto = punto.animate(cuadros, { duration: 10000, easing: "linear", fill: "forwards" });
  }

  function burbuja(m) {
    var b = A.el("div", "burbuja burbuja--" + m.quien);
    if (m.chip) b.appendChild(A.el("span", "burbuja__chip", m.chip));
    var p = A.el("p");
    if (m.partes) {
      m.partes.forEach(function (x) {
        if (typeof x === "string") p.appendChild(document.createTextNode(x));
        else p.appendChild(A.el("span", "burbuja__campo", x.campo));
      });
    } else { p.textContent = m.texto; }
    b.appendChild(p);
    mensajes.appendChild(b);
  }

  function iniciar() {
    limpiar();
    var e = A.entrega || { modo: "delivery" };
    var delivery = e.modo !== "retiro";
    pasos = delivery ? PASOS_DELIVERY : PASOS_RETIRO;
    var tiempos = delivery ? TIEMPOS_DELIVERY : TIEMPOS_RETIRO;
    ruta.hidden = !delivery;
    punto.classList.remove("fin");
    mensajes.textContent = "";
    resumen.textContent = "";
    A.pedido.lineas().forEach(function (l) {
      var li = A.el("li");
      li.appendChild(A.el("span", null, l.nombre + (l.opcion ? " (" + l.opcion + ")" : "") + " x" + l.cantidad));
      li.appendChild(A.el("span", "num", "Gs. " + A.gs(l.precio * l.cantidad)));
      resumen.appendChild(li);
    });
    totalEl.textContent = "Gs. " + A.gs(A.pedido.total());
    armarEstepper();
    ir(0);
    tiempos.forEach(function (ms, i) {
      if (i === 0) return;
      en(ms, function () { ir(i); if (delivery && i === 2) recorrido(); });
    });
    if (A.reducido() && delivery) punto.classList.add("fin");
    CHAT.forEach(function (m) { en(m.t, function () { burbuja(m); }); });
  }

  document.getElementById("seg-otro").addEventListener("click", function () {
    limpiar();
    A.pedido.vaciar();
    if (A.checkout) A.checkout.reiniciar();
    A.entrega = null;
    A.hoja.cerrarTodo();
    A.anunciar("Pedido de ejemplo reiniciado. Volviste a la carta.");
  });

  A.hoja.registrar({
    dialog: dialog,
    coincide: function (h) { return h === "#seguimiento"; },
    alAbrir: function () {
      if (!A.pedido.lineas().length || !A.entrega) return false;
      iniciar();
      return true;
    },
    alCerrar: limpiar
  });
})();
