/* La Ajicera (Demo): riel de categorías con scrollspy (IntersectionObserver, sin evento scroll). */
(function () {
  "use strict";
  var riel = document.querySelector(".riel");
  if (!riel) return;
  var pista = riel.querySelector(".riel__pista");
  var indicador = riel.querySelector(".riel__indicador");
  var enlaces = Array.prototype.slice.call(riel.querySelectorAll(".riel__lista a"));
  var secciones = enlaces.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
  var movimiento = window.matchMedia("(prefers-reduced-motion: no-preference)");
  var visibles = {};
  var activo = -1;
  var primera = true;

  function marcar(i) {
    if (i === activo) return;
    activo = i;
    enlaces.forEach(function (a, k) {
      if (k === i) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
    posicionar();
  }

  function posicionar() {
    if (activo < 0) { indicador.style.opacity = "0"; return; }
    var a = enlaces[activo];
    var x = a.offsetLeft + 16; /* alinea con el texto: 16 px de relleno del enlace */
    var w = a.offsetWidth - 32;
    indicador.style.opacity = "1";
    if (primera) { indicador.style.transition = "none"; }
    else { indicador.style.transition = movimiento.matches ? "transform 280ms cubic-bezier(0.23, 1, 0.32, 1)" : "none"; }
    indicador.style.transform = "translateX(" + x + "px) scaleX(" + (w / 100) + ")";
    primera = false;
    var destino = a.offsetLeft - (pista.clientWidth - a.offsetWidth) / 2;
    pista.scrollTo({ left: Math.max(0, destino), behavior: movimiento.matches ? "smooth" : "auto" });
  }

  function elegir() {
    for (var i = 0; i < secciones.length; i++) { if (visibles[i]) { marcar(i); return; } }
    marcar(-1);
  }

  if ("IntersectionObserver" in window) {
    /* franja de lectura: desde debajo del riel hasta el 40 % de la pantalla */
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { visibles[secciones.indexOf(e.target)] = e.isIntersecting; });
      elegir();
    }, { rootMargin: "-72px 0px -60% 0px", threshold: 0 });
    secciones.forEach(function (s) { if (s) obs.observe(s); });
  }
  window.addEventListener("resize", posicionar);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(posicionar);
})();

/* ---- Detalle del plato (hoja) ---- */
(function () {
  "use strict";
  var A = window.Ajicera;
  if (!A || !A.hoja) return;
  var OPCIONES = {
    coccion: { titulo: "Punto de cocción", valores: ["Jugoso", "A punto", "Bien cocido"], error: "Elegí un punto de cocción para seguir." },
    guarnicion: { titulo: "Guarnición", valores: ["Papas fritas", "Puré", "Ensalada"], defecto: "Papas fritas" }
  };
  var MAX = 20;
  var dialog = document.getElementById("hoja-detalle");
  var q = function (id) { return document.getElementById(id); };
  var foto = q("det-foto"), titulo = q("det-titulo"), precioEl = q("det-precio"), desc = q("det-desc");
  var bloqueOp = q("det-opciones"), tituloOp = q("det-opciones-titulo"), fichas = q("det-fichas"), errorOp = q("det-error");
  var nota = q("det-nota"), contador = q("det-contador"), cantEl = q("det-cant"), menos = q("det-menos"), mas = q("det-mas");
  var maxEl = q("det-max"), total = q("det-total"), agregar = q("det-agregar");
  var plato = null, cantidad = 1;

  function datos(li) {
    var img = li.querySelector(".plato__foto img");
    return {
      id: li.getAttribute("data-id"),
      nombre: li.getAttribute("data-nombre"),
      precio: Number(li.getAttribute("data-precio")),
      opciones: li.getAttribute("data-opciones"),
      desc: li.querySelector(".plato__desc").textContent,
      foto: img ? img.getAttribute("src") : null,
      grande: img ? (img.getAttribute("data-grande") || img.getAttribute("src")) : null,
      alt: img ? img.getAttribute("alt") : "",
      agotado: li.classList.contains("plato--agotado"),
      inicial: li.getAttribute("data-nombre").charAt(0)
    };
  }

  function pintarCantidad(dir) {
    var span = cantEl.querySelector("span");
    span.textContent = String(cantidad);
    if (dir && !A.reducido() && span.animate) {
      span.animate([{ transform: "translateY(" + (dir * 14) + "px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }],
        { duration: 160, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
    }
    menos.disabled = cantidad <= 1;
    mas.disabled = cantidad >= MAX;
    total.textContent = A.gs(plato.precio * cantidad);
  }

  function abrir(hash) {
    var id = hash.slice(7);
    var li = document.getElementById("plato-" + id);
    if (!li || !li.hasAttribute("data-id")) return false;
    plato = datos(li);
    if (plato.agotado) return false;
    foto.textContent = "";
    if (plato.foto) {
      var im = document.createElement("img");
      im.src = plato.grande; im.alt = plato.alt; im.width = 520; im.height = 520;
      foto.appendChild(im);
      foto.removeAttribute("aria-hidden");
    } else {
      foto.textContent = plato.inicial;
      foto.setAttribute("aria-hidden", "true");
    }
    titulo.textContent = plato.nombre;
    precioEl.textContent = "Gs. " + A.gs(plato.precio);
    desc.textContent = plato.desc;
    fichas.textContent = "";
    errorOp.hidden = true;
    var op = plato.opciones ? OPCIONES[plato.opciones] : null;
    bloqueOp.hidden = !op;
    if (op) {
      tituloOp.textContent = op.titulo;
      op.valores.forEach(function (v) {
        var l = A.el("label", "ficha"), i = document.createElement("input");
        i.type = "radio"; i.name = "det-opcion"; i.value = v;
        if (op.defecto === v) i.checked = true; /* la milanesa viene con papas: no hace falta elegir */
        i.addEventListener("change", function () { errorOp.hidden = true; });
        l.appendChild(i); l.appendChild(A.el("span", null, v));
        fichas.appendChild(l);
      });
    }
    nota.value = ""; contador.textContent = "0/80";
    cantidad = 1; maxEl.hidden = true;
    pintarCantidad(0);
    return true;
  }

  menos.addEventListener("click", function () { if (cantidad > 1) { cantidad--; maxEl.hidden = true; pintarCantidad(1); } });
  mas.addEventListener("click", function () {
    if (cantidad < MAX) { cantidad++; pintarCantidad(-1); }
    if (cantidad >= MAX) maxEl.hidden = false;
  });
  nota.addEventListener("input", function () { contador.textContent = nota.value.length + "/80"; });

  agregar.addEventListener("click", function () {
    var op = plato.opciones ? OPCIONES[plato.opciones] : null;
    var elegida = fichas.querySelector("input:checked");
    if (op && !elegida) {
      errorOp.querySelector("span").textContent = op.error;
      errorOp.hidden = false;
      var primera = fichas.querySelector("input");
      if (primera) primera.focus();
      return;
    }
    document.dispatchEvent(new CustomEvent("ajicera:agregar", { detail: {
      id: plato.id, nombre: plato.nombre, precio: plato.precio, cantidad: cantidad,
      opcion: elegida ? elegida.value : "", nota: nota.value.slice(0, 80), foto: plato.foto, inicial: plato.inicial, origen: agregar
    } }));
    A.hoja.cerrar();
  });

  A.hoja.registrar({
    dialog: dialog,
    coincide: function (h) { return h.indexOf("#plato-") === 0; },
    alAbrir: abrir
  });

  /* "+" de cada fila: suma 1 directo; si el plato tiene opciones, abre el detalle. La fila abre el detalle. */
  Array.prototype.forEach.call(document.querySelectorAll(".plato"), function (li) {
    var b = li.querySelector(".mas");
    var enlace = li.querySelector(".plato__nombre a");
    enlace.addEventListener("click", function (e) { e.preventDefault(); A.hoja.ir("#plato-" + li.getAttribute("data-id"), enlace); });
    b.addEventListener("click", function (e) {
      e.stopPropagation(); /* el + es su propia zona: nunca abre la fila */
      if (li.classList.contains("plato--agotado")) return;
      if (li.hasAttribute("data-opciones")) { A.hoja.ir("#plato-" + li.getAttribute("data-id"), b); return; }
      var d = datos(li);
      document.dispatchEvent(new CustomEvent("ajicera:agregar", { detail: {
        id: d.id, nombre: d.nombre, precio: d.precio, cantidad: 1, opcion: "", nota: "", foto: d.foto, inicial: d.inicial, origen: b
      } }));
    });
  });
})();

/* ---- Estados: foto que falla y estados de revisión (?estado=cargando|sinfotos|agotado|cerrado|error) ---- */
(function () {
  "use strict";
  var A = window.Ajicera || {};
  var estado = new URLSearchParams(location.search).get("estado");

  function platoSinFoto(cont) {
    var li = cont.closest(".plato");
    cont.textContent = li.getAttribute("data-nombre").charAt(0);
    cont.classList.add("plato__foto--vacia");
    cont.setAttribute("aria-hidden", "true");
  }
  function heroSinFoto() {
    var fig = document.querySelector(".hero__foto");
    if (!fig || fig.classList.contains("hero__foto--sin")) return;
    fig.classList.add("hero__foto--sin");
    var d = document.createElement("div");
    d.className = "hero__inicial";
    d.setAttribute("aria-hidden", "true");
    d.textContent = "A";
    fig.insertBefore(d, fig.firstChild);
  }
  Array.prototype.forEach.call(document.querySelectorAll(".plato__foto img"), function (img) {
    img.addEventListener("error", function () { platoSinFoto(img.parentNode); });
  });
  var heroImg = document.querySelector(".hero__foto img");
  if (heroImg) heroImg.addEventListener("error", heroSinFoto);

  if (estado === "sinfotos") {
    Array.prototype.forEach.call(document.querySelectorAll(".plato__foto"), function (c) { if (c.querySelector("img")) platoSinFoto(c); });
    heroSinFoto();
  } else if (estado === "cargando") {
    document.body.classList.add("estado-cargando");
    var carta = document.getElementById("carta");
    carta.setAttribute("aria-busy", "true");
    if (A.anunciar) A.anunciar("Cargando la carta");
  } else if (estado === "agotado") {
    ["vacio", "locro"].forEach(function (id) {
      var li = document.getElementById("plato-" + id);
      if (!li) return;
      li.classList.add("plato--agotado");
      var b = li.querySelector(".mas");
      b.disabled = true;
      b.setAttribute("aria-label", "No disponible: " + li.getAttribute("data-nombre"));
      var p = document.createElement("p");
      p.className = "plato__agotado";
      p.textContent = "Agotado";
      li.querySelector(".plato__texto").appendChild(p);
    });
  } else if (estado === "cerrado") {
    var aviso = document.getElementById("aviso-cerrado");
    var h = new Date().getHours();
    aviso.querySelector("[data-abre]").textContent = h < 11 ? "hoy" : "mañana";
    aviso.hidden = false;
    var principal = document.querySelector('[data-accion="armar"]');
    if (principal) principal.textContent = "Ver la carta";
  } else if (estado === "error") {
    document.body.classList.add("estado-error");
    document.getElementById("carta-error").hidden = false;
    document.getElementById("reintentar").addEventListener("click", function () { location.href = location.pathname; });
  }
})();

/* ---- Movimiento al entrar: la foto del hero se asienta y las fotos de la carta aparecen al bajar ----
   Todo es visible por defecto: sin JS o con movimiento reducido no se oculta nada. */
(function () {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var fotos = Array.prototype.slice.call(document.querySelectorAll(".plato__foto"));
  if (!fotos.length || !("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("con-reveal");
  var cola = 0;
  var obs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (!e.isIntersecting) return;
      var f = e.target;
      obs.unobserve(f);
      f.style.transitionDelay = Math.min(cola, 5) * 40 + "ms";
      cola++;
      f.classList.add("vista");
      window.setTimeout(function () { f.style.transitionDelay = ""; cola = Math.max(0, cola - 1); }, 600);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  fotos.forEach(function (f) { obs.observe(f); });
  /* red de seguridad: pasados unos segundos todo queda visible (capturas, pestañas ocultas) */
  window.setTimeout(function () { fotos.forEach(function (f) { f.classList.add("vista"); }); }, 6000);
})();

/* ---- Hero con video de brasas (listo para cuando llegue el archivo) ----
   Para activarlo: poner media/hero.webm y media/hero.mp4 y agregar data-video="media/hero" al <figure class="hero__foto">.
   La foto queda de póster; sin movimiento reducido el video se muestra encima cuando empieza a reproducir. */
(function () {
  "use strict";
  var fig = document.querySelector(".hero__foto[data-video]");
  if (!fig || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var base = fig.getAttribute("data-video");
  var v = document.createElement("video");
  v.className = "hero__video";
  v.muted = true; v.loop = true; v.playsInline = true; v.preload = "metadata";
  v.setAttribute("aria-hidden", "true");
  v.setAttribute("tabindex", "-1");
  var img = fig.querySelector("img");
  if (img) v.poster = img.currentSrc || img.src;
  ["webm:video/webm", "mp4:video/mp4"].forEach(function (x) {
    var s = document.createElement("source");
    s.src = base + "." + x.split(":")[0]; s.type = x.split(":")[1];
    v.appendChild(s);
  });
  v.addEventListener("playing", function () { fig.classList.add("con-video"); });
  v.addEventListener("error", function () { v.remove(); }, true);
  fig.insertBefore(v, fig.firstChild);
  var p = v.play(); if (p && p.catch) p.catch(function () {});
})();
