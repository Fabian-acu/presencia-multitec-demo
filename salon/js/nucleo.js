/* Tono Vivo (Demo): utilidades, la eleccion actual (servicio, persona, dia, hora y tono) y los enlaces a WhatsApp.
   Nada se guarda, nada sale a la red. Todo texto del usuario o de la pagina entra con textContent. */
(function () {
  "use strict";
  var T = window.Tono = window.Tono || {};
  var doc = document;

  T.reducido = function () { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; };
  T.param = function (k) {
    try { return new URLSearchParams(window.location.search).get(k); } catch (e) { return null; }
  };
  T.estadoPrueba = doc.documentElement.getAttribute("data-estado");

  /* el reloj de la demo: el real, o ?ahora=AAAA-MM-DDTHH:MM (o ?estado=cerrado, que cae un domingo) para probar */
  T.ahora = function () {
    var p = T.parsearAhora(T.param("ahora"));
    if (p) return p;
    if (T.estadoPrueba === "cerrado") {
      var d = new Date();
      d.setDate(d.getDate() + ((7 - d.getDay()) % 7));      /* proximo domingo (o hoy si es domingo) */
      d.setHours(11, 0, 0, 0);
      return d;
    }
    return new Date();
  };

  T.el = function (tag, clase, texto) {
    var e = doc.createElement(tag);
    if (clase) e.className = clase;
    if (texto != null) e.textContent = texto;
    return e;
  };
  T.icono = function (nombre, clase) {
    var ns = "http://www.w3.org/2000/svg";
    var s = doc.createElementNS(ns, "svg");
    s.setAttribute("class", "icono" + (clase ? " " + clase : ""));
    s.setAttribute("aria-hidden", "true");
    s.setAttribute("focusable", "false");
    var u = doc.createElementNS(ns, "use");
    u.setAttribute("href", "iconos.svg#i-" + nombre);
    s.appendChild(u);
    return s;
  };
  T.anunciar = function (texto) {
    var r = doc.getElementById("anuncio");
    if (!r) return;
    r.textContent = "";
    window.setTimeout(function () { r.textContent = texto; }, 30);
  };
  T.vaciar = function (nodo) { while (nodo.firstChild) nodo.removeChild(nodo.firstChild); };

  /* modelo: servicios y equipo salen del HTML (una sola fuente) */
  T.servicios = {};
  T.listaServicios = [];
  T.profes = {};
  T.leerModelo = function () {
    var filas = doc.querySelectorAll(".fila[data-servicio]");
    for (var i = 0; i < filas.length; i++) {
      var f = filas[i];
      var id = f.getAttribute("data-servicio");
      var s = {
        id: id,
        nombre: f.querySelector(".fila__nombre").textContent,
        grupo: f.getAttribute("data-grupo"),
        pro: (f.getAttribute("data-pro") || "").split(" "),
        alt: f.getAttribute("data-alt") || ""
      };
      T.servicios[id] = s;
      T.listaServicios.push(s);
    }
    var ps = doc.querySelectorAll("[data-persona]");
    for (var j = 0; j < ps.length; j++) {
      var pid = ps[j].getAttribute("data-persona");
      T.profes[pid] = { id: pid, nombre: ps[j].querySelector(".persona__nombre").textContent };
    }
  };
  T.leerModelo();

  /* la eleccion actual: servicio, persona, dia, hora y tono. Quien la cambia avisa con T.cambiar. */
  T.sel = { servicio: null, pro: null, dia: null, hora: null, tono: "fucsia" };
  var oyentes = [];
  T.alCambiar = function (fn) { oyentes.push(fn); };
  T.cambiar = function (cambios, origen) {
    var hubo = false;
    for (var k in cambios) {
      if (Object.prototype.hasOwnProperty.call(cambios, k) && T.sel[k] !== cambios[k]) { T.sel[k] = cambios[k]; hubo = true; }
    }
    if (!hubo) return;
    for (var i = 0; i < oyentes.length; i++) oyentes[i](cambios, origen);
    T.enlaces();
  };

  /* Todos los botones de WhatsApp van a Multitec. El mensaje lleva solo servicio y tono. */
  T.enlaces = function () {
    var tono = T.tonoPorId(T.sel.tono);
    var nodos = doc.querySelectorAll("a[data-wa]");
    for (var i = 0; i < nodos.length; i++) {
      var a = nodos[i];
      var sid = a.getAttribute("data-wa") === "servicio" ? a.getAttribute("data-servicio") : T.sel.servicio;
      var nombre = sid && T.servicios[sid] ? T.servicios[sid].nombre : null;
      a.setAttribute("href", T.urlWa(T.mensaje(nombre, tono ? tono.nombre : null)));
    }
  };
  T.enlaces();

  /* foto que no carga: bloque del tono al 10% con "Falta foto" (nunca la foto de otro trabajo) */
  T.fotoFalta = function (img) {
    var caja = img.closest("[data-foto-caja]");
    if (caja) caja.classList.add("foto--falta");
  };
  /* pone otra foto en una imagen que ya esta en la pagina: limpia "Falta foto" y respeta ?estado=sinfotos */
  T.cargarFoto = function (img, src, alt) {
    var caja = img.closest("[data-foto-caja]");
    if (caja) caja.classList.remove("foto--falta");
    img.alt = alt;
    img.src = src;
    if (T.estadoPrueba === "sinfotos") T.fotoFalta(img);
  };
  var imgs = doc.querySelectorAll("img[data-foto-img]");
  for (var n = 0; n < imgs.length; n++) {
    if (T.estadoPrueba === "sinfotos") T.fotoFalta(imgs[n]);
    /* "error" solo cuenta si la imagen de verdad no cargo: al cambiar de src/srcset (tira a ventana) el pedido viejo se corta y avisa "error"
       aunque la nueva ya cargo; cualquier "load" posterior saca la marca (salvo en ?estado=sinfotos) */
    imgs[n].addEventListener("error", function (e) {
      var im = e.target;
      if (im.complete && im.naturalWidth > 0) return;
      T.fotoFalta(im);
    });
    imgs[n].addEventListener("load", function (e) {
      if (T.estadoPrueba === "sinfotos") return;
      var caja = e.target.closest("[data-foto-caja]");
      if (caja) caja.classList.remove("foto--falta");
    });
    /* una imagen no diferida que ya fallo antes de que corra este script (las diferidas avisan con "error" cuando se piden) */
    if (imgs[n].getAttribute("loading") !== "lazy" && imgs[n].complete && imgs[n].naturalWidth === 0 && imgs[n].getAttribute("src")) T.fotoFalta(imgs[n]);
  }
})();
