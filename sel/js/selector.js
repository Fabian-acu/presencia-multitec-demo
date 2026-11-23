/* Selector "Elegí tu rubro". ES5, sin dependencias, sin guardar nada, sin escuchar el scroll.
   Modo fino (compu): al pasar el puntero o enfocar una fila con teclado, la pantalla se baña del color de esa demo
   (capas fijas que cambian opacity), las demás filas bajan a --on-2 y la foto de la demo sigue al puntero con un
   resorte propio (rigidez 120, amortiguación 20, masa 1; requestAnimationFrame, sin tocar el DOM salvo transform).
   Modo toque (celular): un toque abre la fila y "Abrir demo" abre la demo (más abajo).
   Con prefers-reduced-motion no hay seguimiento: la foto queda fija junto a la fila y todo cambia al instante. */
(function () {
  "use strict";
  var h = document.documentElement;
  var lista = document.getElementById("lista");
  if (!lista || !h.classList.contains("js")) return;

  var filas = [].slice.call(lista.querySelectorAll(".fila"));
  var capas = [].slice.call(document.querySelectorAll(".mar .capa"));
  var vista = document.querySelector(".vista");
  var fotos = [].slice.call(document.querySelectorAll(".vista .foto"));
  var sinFotos = h.getAttribute("data-estado") === "sinfotos";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!vista || capas.length !== filas.length || fotos.length !== filas.length) return;

  function fino() { return h.classList.contains("modo-fino"); }
  function limitar(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function cercano(el, sel) { return el && el.closest ? el.closest(sel) : null; }

  /* ---- Imágenes: se piden recién cuando hacen falta; si faltan queda un bloque con el nombre ---- */
  function falta(img) { if (img.parentNode) img.parentNode.classList.add("sinfoto"); }
  function cargar(img) {
    if (!img || !img.hasAttribute("data-src")) return;
    var origen = img.getAttribute("data-src");
    img.removeAttribute("data-src");
    if (sinFotos) { falta(img); return; }
    img.addEventListener("error", function () { falta(img); });
    if (img.hasAttribute("data-srcset")) {
      img.sizes = img.getAttribute("data-sizes") || "100vw";
      img.srcset = img.getAttribute("data-srcset");
      img.removeAttribute("data-srcset");
    }
    img.src = origen;
  }

  /* ---- Modo fino: baño de color ---- */
  var activa = -1;
  var enFoco = false;

  function activar(i) {
    if (i === activa) return false;
    var primera = activa < 0;
    activa = i;
    h.setAttribute("data-c", filas[i].getAttribute("data-c"));
    for (var k = 0; k < filas.length; k++) {
      filas[k].classList.toggle("activa", k === i);
      capas[k].classList.toggle("on", k === i);
      fotos[k].classList.toggle("visible", k === i);
    }
    cargar(fotos[i].querySelector("img"));
    cargar(capas[i].querySelector("img"));
    vista.classList.add("visible");
    medir();
    return primera;
  }

  function desactivar() {
    if (activa < 0) return;
    activa = -1;
    h.removeAttribute("data-c");
    for (var k = 0; k < filas.length; k++) {
      filas[k].classList.remove("activa");
      capas[k].classList.remove("on");
      fotos[k].classList.remove("visible");
    }
    vista.classList.remove("visible");
  }

  /* ---- Modo fino: foto con resorte ---- */
  var RIGIDEZ = 120;
  var AMORTIGUACION = 20;
  var px = 0, py = 0, vx = 0, vy = 0, tx = 0, ty = 0, rot = 0;
  var ancho = 0, alto = 0, raf = 0, antes = 0;

  function medir() {
    ancho = vista.offsetWidth;
    alto = vista.offsetHeight;
  }
  function pintar() {
    vista.style.transform = "translate3d(" + px.toFixed(1) + "px," + py.toFixed(1) + "px,0) rotate(" + rot.toFixed(2) + "deg)";
  }
  function saltar() {
    px = tx; py = ty; vx = 0; vy = 0; rot = 0;
    pintar();
  }
  function paso(t) {
    raf = 0;
    var dt = (t - antes) / 1000;
    antes = t;
    if (!(dt > 0)) dt = 1 / 60;
    if (dt > 0.05) dt = 0.05;
    var n = Math.ceil(dt / 0.004);
    var d = dt / n;
    for (var i = 0; i < n; i++) {
      vx += (-RIGIDEZ * (px - tx) - AMORTIGUACION * vx) * d;
      px += vx * d;
      vy += (-RIGIDEZ * (py - ty) - AMORTIGUACION * vy) * d;
      py += vy * d;
    }
    rot = limitar(vx * 0.004, -6, 6);
    if (Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05 && Math.abs(px - tx) < 0.2 && Math.abs(py - ty) < 0.2) {
      saltar();
    } else {
      pintar();
      raf = window.requestAnimationFrame(paso);
    }
  }
  function seguir() {
    if (raf) return;
    antes = window.performance.now();
    raf = window.requestAnimationFrame(paso);
  }
  /* La foto vive dentro de la lista: no baja del último filete (no tapa el pie) ni pisa la columna de los números */
  function limites() {
    var r = lista.getBoundingClientRect();
    var n = filas[0].querySelector(".num").getBoundingClientRect();
    var m = 12;
    return {
      izq: m,
      der: Math.max(m + ancho, Math.min(window.innerWidth - m, n.left - m)),
      arriba: Math.max(m, r.top),
      abajo: Math.max(m + alto, Math.min(window.innerHeight - m, r.bottom))
    };
  }
  function objetivoPuntero(cx, cy) {
    var b = limites(), sep = 28;
    var x = cx + sep;
    if (x + ancho > b.der) x = cx - sep - ancho;
    tx = limitar(x, b.izq, Math.max(b.izq, b.der - ancho));
    ty = limitar(cy - alto / 2, b.arriba, Math.max(b.arriba, b.abajo - alto));
  }
  /* Teclado y reduced-motion: la foto queda fija a la derecha del nombre, a la altura de la fila */
  function objetivoFila(a) {
    var r = a.getBoundingClientRect(), b = limites();
    tx = limitar(window.innerWidth * 0.6, b.izq, Math.max(b.izq, b.der - ancho));
    ty = limitar(r.top + r.height / 2 - alto / 2, b.arriba, Math.max(b.arriba, b.abajo - alto));
  }

  function sobre(e) {
    if (!fino() || e.pointerType === "touch") return;
    var li = cercano(e.target, ".fila");
    if (!li) return;
    var primera = activar(filas.indexOf(li));
    if (reduce.matches) {
      objetivoFila(li);
      saltar();
      return;
    }
    objetivoPuntero(e.clientX, e.clientY);
    if (primera) saltar(); else seguir();
  }
  lista.addEventListener("pointerover", sobre);
  lista.addEventListener("pointermove", sobre);
  lista.addEventListener("pointerleave", function (e) {
    if (!fino() || e.pointerType === "touch" || enFoco) return;
    desactivar();
  });

  lista.addEventListener("focusin", function (e) {
    if (!fino()) return;
    var a = cercano(e.target, ".fila-a");
    if (!a || !a.matches(":focus-visible")) return;
    enFoco = true;
    var primera = activar(filas.indexOf(a.parentNode));
    window.requestAnimationFrame(function () {
      objetivoFila(a);
      if (primera || reduce.matches) saltar(); else seguir();
    });
  });
  lista.addEventListener("focusout", function (e) {
    enFoco = false;
    if (!e.relatedTarget || !lista.contains(e.relatedTarget)) desactivar();
  });

  /* ---- Modo toque: un toque abre la fila, "Abrir demo" abre la demo (un solo toque, sin doble toque) ---- */
  var abierta = -1;

  function cerrar(i) {
    filas[i].classList.remove("abierta");
    filas[i].querySelector(".fila-a").setAttribute("aria-expanded", "false");
    if (abierta === i) abierta = -1;
  }
  /* Cuando termina de abrirse, la fila queda a la vista aunque haya otra cerrándose arriba */
  function mostrar(li) {
    function ver() {
      var r = li.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight - 8) {
        li.scrollIntoView({ block: "nearest", behavior: reduce.matches ? "auto" : "smooth" });
      }
    }
    if (reduce.matches) ver(); else window.setTimeout(ver, 300);
  }
  function abrir(i) {
    if (abierta >= 0 && abierta !== i) cerrar(abierta);
    var li = filas[i];
    li.classList.add("abierta");
    li.querySelector(".fila-a").setAttribute("aria-expanded", "true");
    abierta = i;
    cargar(li.querySelector(".detalle .foto img"));
    mostrar(li);
  }
  /* La fila pasa a ser un botón que abre y cierra; en modo fino vuelve a ser un enlace común */
  function aplicarModo() {
    var toque = !fino();
    for (var k = 0; k < filas.length; k++) {
      var a = filas[k].querySelector(".fila-a");
      if (toque) {
        a.setAttribute("role", "button");
        a.setAttribute("aria-expanded", filas[k].classList.contains("abierta") ? "true" : "false");
        a.setAttribute("aria-controls", filas[k].querySelector(".detalle").id);
        cargar(filas[k].querySelector(".mini img"));
      } else {
        a.removeAttribute("role");
        a.removeAttribute("aria-expanded");
        a.removeAttribute("aria-controls");
        filas[k].classList.remove("abierta");
      }
    }
    abierta = -1;
    for (var j = 0; j < filas.length; j++) { if (filas[j].classList.contains("abierta")) abierta = j; }
    if (toque) desactivar();
  }
  lista.addEventListener("click", function (e) {
    if (fino()) return;
    var a = cercano(e.target, ".fila-a");
    if (!a) return;
    e.preventDefault();
    var i = filas.indexOf(a.parentNode);
    if (filas[i].classList.contains("abierta")) cerrar(i); else abrir(i);
  });
  lista.addEventListener("keydown", function (e) {
    if (fino()) return;
    if ((e.key === " " || e.key === "Spacebar") && e.target.classList && e.target.classList.contains("fila-a")) {
      e.preventDefault();
      e.target.click();
    } else if (e.key === "Escape" && abierta >= 0) {
      var a = filas[abierta].querySelector(".fila-a");
      cerrar(abierta);
      a.focus();
    }
  });
  aplicarModo();
  var mqFino = window.matchMedia("(hover: hover) and (pointer: fine)");
  function cambioDeModo() { window.setTimeout(aplicarModo, 0); }
  if (mqFino.addEventListener) mqFino.addEventListener("change", cambioDeModo);
  else if (mqFino.addListener) mqFino.addListener(cambioDeModo);

  window.addEventListener("resize", medir);
  window.addEventListener("pageshow", function (e) { if (e.persisted) desactivar(); });
})();
