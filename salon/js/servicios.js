/* Tono Vivo (Demo): servicios (pestanas Pelo y Unas, "Elegir" con tilde) y equipo ("Elegir a ..."). Sin precios: cada fila
   dice "Consulta el valor" y abre WhatsApp de Multitec con el servicio en el mensaje (eso lo arma nucleo.js).
   En compu la foto de la derecha es la del servicio que miras o elegis. Nada se guarda. */
(function () {
  "use strict";
  var T = window.Tono = window.Tono || {};
  var doc = document;
  var tabs = doc.querySelectorAll(".segmentado__tab");
  var paneles = doc.querySelectorAll(".grupo");
  var vacio = doc.querySelector("[data-vacio]");
  var seguir = doc.querySelector("[data-seguir]");
  var seguirNombre = doc.querySelector("[data-seguir-nombre]");
  var fotoFig = doc.querySelector("[data-servicio-foto]");
  var fotoImg = fotoFig ? fotoFig.querySelector("img") : null;
  var fotoLeyenda = fotoFig ? fotoFig.querySelector("[data-foto-leyenda]") : null;
  var grupoActual = "pelo";
  var verTodo = false;

  function filaDe(id) { return doc.querySelector(".fila[data-servicio='" + id + "']"); }

  function mostrarFoto(id) {
    if (!fotoImg || !T.servicios[id]) return;
    if (fotoImg.getAttribute("data-id") === id) return;
    fotoImg.setAttribute("data-id", id);
    T.cargarFoto(fotoImg, "fotos/s-" + id + "-520.webp", T.servicios[id].alt);
    fotoLeyenda.textContent = T.servicios[id].nombre;
  }

  function mostrarGrupo(id, enfocar) {
    grupoActual = id;
    for (var i = 0; i < tabs.length; i++) {
      var activa = tabs[i].getAttribute("data-grupo") === id;
      tabs[i].setAttribute("aria-selected", activa ? "true" : "false");
      tabs[i].tabIndex = activa ? 0 : -1;
      if (activa && enfocar) tabs[i].focus();
    }
    for (var j = 0; j < paneles.length; j++) {
      paneles[j].hidden = !verTodo && paneles[j].getAttribute("data-grupo") !== id;
    }
    if (vacio) vacio.hidden = true;
    var primero = null;
    for (var k = 0; k < T.listaServicios.length; k++) { if (T.listaServicios[k].grupo === id) { primero = T.listaServicios[k]; break; } }
    if (primero && !(T.sel.servicio && T.servicios[T.sel.servicio].grupo === id)) mostrarFoto(primero.id);
    else if (T.sel.servicio) mostrarFoto(T.sel.servicio);
  }

  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener("click", function (e) { verTodo = false; mostrarGrupo(e.currentTarget.getAttribute("data-grupo"), false); });
    tabs[i].addEventListener("keydown", function (e) {
      var orden = ["pelo", "unas"];
      var pos = orden.indexOf(grupoActual);
      var nuevo = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") nuevo = orden[(pos + 1) % orden.length];
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") nuevo = orden[(pos + orden.length - 1) % orden.length];
      else if (e.key === "Home") nuevo = orden[0];
      else if (e.key === "End") nuevo = orden[orden.length - 1];
      if (nuevo) { e.preventDefault(); verTodo = false; mostrarGrupo(nuevo, true); }
    });
  }

  /* "Elegir": uno solo a la vez; tocarlo de nuevo lo suelta */
  var botones = doc.querySelectorAll("[data-elegir]");
  for (var b = 0; b < botones.length; b++) {
    botones[b].addEventListener("click", function (e) {
      var id = e.currentTarget.closest(".fila").getAttribute("data-servicio");
      var antes = T.sel.servicio;
      T.cambiar({ servicio: antes === id ? null : id }, "servicios");
      if (T.sel.servicio) T.anunciar("Elegido: " + T.servicios[id].nombre + ".");
    });
  }

  /* la foto sigue a la fila que miras (puntero fino o foco) */
  var filas = doc.querySelectorAll(".fila[data-servicio]");
  for (var f = 0; f < filas.length; f++) {
    filas[f].addEventListener("mouseenter", function (e) {
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) mostrarFoto(e.currentTarget.getAttribute("data-servicio"));
    });
    filas[f].addEventListener("focusin", function (e) { mostrarFoto(e.currentTarget.getAttribute("data-servicio")); });
  }

  function pintarEleccion() {
    for (var i = 0; i < botones.length; i++) {
      var id = botones[i].closest(".fila").getAttribute("data-servicio");
      var elegido = T.sel.servicio === id;
      botones[i].setAttribute("aria-pressed", elegido ? "true" : "false");
      botones[i].querySelector("[data-etiqueta]").textContent = elegido ? "Elegido" : "Elegir";
    }
    if (seguir) {
      seguir.hidden = !T.sel.servicio;
      if (T.sel.servicio) seguirNombre.textContent = T.servicios[T.sel.servicio].nombre;
    }
    if (T.sel.servicio) mostrarFoto(T.sel.servicio);
  }
  T.alCambiar(function (cambios) { if (cambios.servicio !== undefined) pintarEleccion(); });

  /* equipo: "Elegir a ..." lleva al paso 2 del turno con esa persona elegida (no abre WhatsApp) */
  var pers = doc.querySelectorAll("[data-elegir-pro]");
  for (var p = 0; p < pers.length; p++) {
    pers[p].addEventListener("click", function (e) {
      var id = e.currentTarget.getAttribute("data-elegir-pro");
      var cambios = { pro: id, hora: null };
      if (T.sel.servicio && T.servicios[T.sel.servicio].pro.indexOf(id) < 0) cambios.servicio = null;   /* ese servicio no lo hace esa persona */
      T.cambiar(cambios, "equipo");
      T.anunciar("Elegiste a " + T.profes[id].nombre + ".");
      if (T.turno) T.turno.irA(2);
    });
  }

  /* estado vacio (?estado=vacio): "No hay servicios en este grupo." con "Ver todo" */
  T.serviciosVista = {
    vacio: function () {
      for (var i = 0; i < paneles.length; i++) paneles[i].hidden = true;
      if (vacio) vacio.hidden = false;
    },
    verTodo: function () {
      verTodo = true;
      for (var i = 0; i < paneles.length; i++) paneles[i].hidden = false;
      if (vacio) vacio.hidden = true;
    }
  };
  var vt = doc.querySelector("[data-ver-todo]");
  if (vt) vt.addEventListener("click", function () { T.serviciosVista.verTodo(); });

  mostrarGrupo("pelo", false);
  pintarEleccion();
})();
