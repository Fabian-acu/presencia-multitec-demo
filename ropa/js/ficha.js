/* Ceniza (Demo): la ficha de la prenda en una hoja. La ficha es un <article> que ya esta en el HTML (sin JavaScript se lee en la
   pagina); con JavaScript se mueve a la hoja al abrirla y vuelve a su lugar al cerrar. Talles de una lista fija: el mensaje de
   WhatsApp lleva solo la prenda y el talle elegido. Texto armado solo con textContent. Nada se guarda ni se envia. */
(function () {
  "use strict";
  var C = window.Ceniza;
  var dialogo = document.getElementById("hoja-ficha");
  if (!dialogo || !C || !C.crearHoja) return;
  var cuerpo = dialogo.querySelector("[data-cuerpo]");
  var almacen = document.querySelector("[data-fichas-almacen]");
  var resumen = dialogo.querySelector("[data-resumen]");
  var wa = dialogo.querySelector("[data-ficha-wa]");
  var rotulo = wa.querySelector("[data-rotulo]");
  var estadoWa = dialogo.querySelector("[data-wa-estado]");
  var actual = null;
  var talle = null;

  function articulo(hash) {
    var m = /^#prenda-(\d+)$/.exec(hash);
    return m ? document.getElementById("prenda-" + m[1]) : null;
  }

  function botones(art) { return art.querySelectorAll("button.talle[data-talle]"); }

  function pintar() {
    var nombre = actual.getAttribute("data-nombre");
    var sinDatos = actual.hasAttribute("data-sin-datos");
    var t = sinDatos ? null : talle;
    resumen.textContent = nombre + (t ? " · talle " + t : "");
    wa.setAttribute("href", C.enlaceWa(C.mensaje(nombre, t)));
    var msg = actual.querySelector("[data-msg-talle]");
    if (msg) msg.textContent = t ? "Talle " + t + " elegido." : "Elegí un talle.";
  }

  function conectar(art) {
    if (art.hasAttribute("data-listo")) return;
    art.setAttribute("data-listo", "");
    Array.prototype.forEach.call(botones(art), function (b) {
      b.addEventListener("click", function () {
        var t = b.getAttribute("data-talle");
        var yaEra = talle === t;
        Array.prototype.forEach.call(botones(art), function (o) { o.setAttribute("aria-pressed", "false"); });
        talle = yaEra ? null : t;
        if (talle) b.setAttribute("aria-pressed", "true");
        pintar();
      });
    });
  }

  function devolver() {
    if (actual && almacen && actual.parentNode === cuerpo) almacen.appendChild(actual);
    Array.prototype.forEach.call(actual ? botones(actual) : [], function (o) { o.setAttribute("aria-pressed", "false"); });
    actual = null;
    talle = null;
  }

  var hoja = C.crearHoja(dialogo, {
    coincide: function (h) { return /^#prenda-\d+$/.test(h); },
    alAbrir: function (h) {
      var art = articulo(h);
      if (!art) return false;
      if (actual && actual !== art) devolver();
      actual = art;
      talle = null;
      cuerpo.appendChild(art);
      conectar(art);
      Array.prototype.forEach.call(botones(art), function (o) { o.setAttribute("aria-pressed", "false"); });
      rotulo.textContent = art.getAttribute("data-rotulo") || "Pedir por WhatsApp";
      estadoWa.textContent = "";
      estadoWa.classList.remove("wa__estado--error");
      dialogo.setAttribute("aria-label", art.getAttribute("data-nombre"));
      cuerpo.scrollTop = 0;
      window.requestAnimationFrame(function () { cuerpo.scrollTop = 0; });   /* ya con la hoja a la vista */
      pintar();
      return true;
    },
    alCerrar: devolver
  });

  /* tarjetas, entradas y conjuntos: abren la ficha de su prenda (con Ctrl o Cmd siguen siendo enlaces) */
  Array.prototype.forEach.call(document.querySelectorAll("a[data-ficha]"), function (a) {
    var n = a.getAttribute("data-ficha");
    a.setAttribute("aria-haspopup", "dialog");
    a.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      hoja.ir("#prenda-" + n, a);
    });
    /* las fotos de la ficha se piden cuando la persona se acerca, no antes (primera carga liviana) */
    var pedido = false;
    function precargar() {
      if (pedido) return;
      pedido = true;
      var art = document.getElementById("prenda-" + n);
      if (!art) return;
      Array.prototype.forEach.call(art.querySelectorAll("img[src]"), function (img) { var p = new Image(); p.src = img.getAttribute("src"); });
    }
    a.addEventListener("pointerenter", precargar);
    a.addEventListener("focus", precargar);
    a.addEventListener("touchstart", precargar, { passive: true });
  });
})();
