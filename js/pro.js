/* Presencia Multitec (demos pro): comportamiento chico de las paginas por rubro. Sin librerias.
   Todo el contenido ya viene en el HTML: si este archivo falla, la pagina se ve completa. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Estado "Abierto / Cerrado" con la hora de Paraguay ---------- */
  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  function ahoraPY() {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Asuncion", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      var dow = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday];
      return { dow: dow, min: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
    } catch (e) {
      var d = new Date(); return { dow: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
  }
  function aMin(h) { var p = h.split(":"); return parseInt(p[0], 10) * 60 + parseInt(p[1], 10); }

  var filas = $$(".horarios li[data-dias]");
  var estado = $("#estado");
  if (filas.length) {
    var tabla = {}; // dow -> [abre, cierra]
    filas.forEach(function (li) {
      if (!li.getAttribute("data-abre")) { return; }
      li.getAttribute("data-dias").split(",").forEach(function (d) { tabla[d] = [li.getAttribute("data-abre"), li.getAttribute("data-cierra")]; });
    });
    var n = ahoraPY();
    filas.forEach(function (li) {
      if (li.getAttribute("data-dias").split(",").indexOf(String(n.dow)) > -1) { li.classList.add("hoy"); li.setAttribute("aria-current", "date"); }
    });
    var hoy = tabla[n.dow], txt = "";
    if (hoy && n.min >= aMin(hoy[0]) && n.min < aMin(hoy[1])) {
      txt = "Abierto, cierra " + hoy[1];
    } else {
      var k, prox = null;
      if (hoy && n.min < aMin(hoy[0])) { txt = "Cerrado, abre hoy " + hoy[0]; }
      else {
        for (k = 1; k <= 7 && !prox; k++) {
          var d = (n.dow + k) % 7;
          if (tabla[d]) { prox = { dia: k === 1 ? "mañana" : DIAS[d], h: tabla[d][0] }; }
        }
        txt = prox ? "Cerrado, abre " + prox.dia + " " + prox.h : "Cerrado";
      }
    }
    if (estado) { estado.textContent = txt; estado.classList.toggle("abierto", txt.indexOf("Abierto") === 0); }
    var chico = $("#estado-chico");
    if (chico) { chico.textContent = txt; }
  }

  /* ---------- Barra fija de WhatsApp (celular) ---------- */
  var barra = $(".barra-wa"), bPortada = $("#wa-portada"), bCierre = $("#wa-cierre");
  if (barra && bPortada && "IntersectionObserver" in window) {
    var pv = true, cv = false, chv = false;
    var pintar = function () {
      var mostrar = !pv && !cv && !chv;
      barra.classList.toggle("visible", mostrar);
      barra.setAttribute("aria-hidden", mostrar ? "false" : "true");
      if ("inert" in barra) { barra.inert = !mostrar; }
    };
    barra.classList.add("con-js");
    new IntersectionObserver(function (it) {
      var e = it[it.length - 1]; pv = e.isIntersecting || e.boundingClientRect.top > 0; pintar();
    }).observe(bPortada);
    if (bCierre) {
      new IntersectionObserver(function (it) { cv = it[it.length - 1].isIntersecting; pintar(); }).observe(bCierre);
    }
    var bChat = $(".chat-cta .btn");
    if (bChat) {
      new IntersectionObserver(function (it) { chv = it[it.length - 1].isIntersecting; pintar(); }).observe(bChat);
    }
    pintar();
  }

  /* ---------- Aparicion al scrollear (solo lo que esta debajo de la pantalla) ---------- */
  var quieto = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!quieto && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (items) {
      items.forEach(function (it) { if (it.isIntersecting) { it.target.classList.add("in"); io.unobserve(it.target); } });
    }, { rootMargin: "0px 0px 20% 0px" });
    var alto = window.innerHeight;
    $$("[data-rv]").forEach(function (nodo, i) {
      if (nodo.getBoundingClientRect().top > alto) {
        nodo.style.setProperty("--d", (Math.min(i % 4, 3) * 40) + "ms");
        nodo.classList.add("rv"); io.observe(nodo);
      }
    });
  }

  /* ---------- Filtro por categoria y buscador (menu y catalogo) ---------- */
  var lista = $("[data-filtrable]");
  if (lista) {
    var items = $$("[data-cat]", lista), caja = $("#buscar"), vacio = $("#sin-resultados");
    var chips = $$("[data-chip]"), catAct = "todo";
    var norm = function (s) { return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); };
    var filtrar = function () {
      var q = caja ? norm(caja.value.trim()) : "", vistos = 0;
      items.forEach(function (it) {
        var ok = (catAct === "todo" || it.getAttribute("data-cat") === catAct) && (!q || norm(it.getAttribute("data-texto")).indexOf(q) > -1);
        it.hidden = !ok; if (ok) { vistos++; }
      });
      if (vacio) { vacio.hidden = vistos > 0; }
      var cont = $("#contador"); if (cont) { cont.textContent = vistos + (vistos === 1 ? " producto" : " productos"); }
    };
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        catAct = c.getAttribute("data-chip");
        chips.forEach(function (x) { x.setAttribute("aria-pressed", x === c ? "true" : "false"); });
        filtrar();
      });
    });
    if (caja) { caja.addEventListener("input", filtrar); }
  }

  /* ---------- Hoja "Asi le llega a tu WhatsApp" ---------- */
  var hoja = $("#hoja");
  if (hoja && typeof hoja.showModal === "function") {
    $$("[data-consulta]").forEach(function (b) {
      b.addEventListener("click", function () {
        $("#hoja-msg", hoja).textContent = "Hola, " + b.getAttribute("data-consulta");
        hoja.showModal();
      });
    });
    $$("[data-cerrar]", hoja).forEach(function (b) { b.addEventListener("click", function () { hoja.close(); }); });
    hoja.addEventListener("click", function (e) { if (e.target === hoja) { hoja.close(); } });
  } else {
    // sin <dialog>: el boton lleva directo al WhatsApp de Multitec
    $$("[data-consulta]").forEach(function (b) { b.addEventListener("click", function () { var w = $("#wa-portada"); if (w) { location.href = w.href; } }); });
  }

  /* ---------- Mapa: se carga recien al tocar ---------- */
  var verMapa = $("#ver-mapa");
  if (verMapa) {
    verMapa.addEventListener("click", function () {
      var cont = verMapa.closest(".mapa-fachada");
      var f = document.createElement("iframe");
      f.src = cont.getAttribute("data-src");
      f.title = "Mapa de Ciudad del Este, ubicación de ejemplo";
      f.loading = "lazy"; f.referrerPolicy = "no-referrer";
      cont.textContent = ""; cont.classList.add("activo"); cont.appendChild(f);
    });
  }

  /* ---------- Pedido simulado (solo restaurante): se carga recien al primer toque ---------- */
  var pedidoCargado = false;
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-pedido]");
    if (!b || pedidoCargado) { return; }
    e.preventDefault(); pedidoCargado = true;
    var base = document.documentElement.getAttribute("data-base") || "../";
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = base + "css/pedido.css"; document.head.appendChild(l);
    var s = document.createElement("script"); s.src = base + "js/pedido.js";
    s.onload = function () { if (window.Pedido) { window.Pedido.alIniciar(b); } };
    document.body.appendChild(s);
  }, true);
})();
