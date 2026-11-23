/* La Primera Hornada (Demo): catalogo (leido del HTML), filtros de "Todo el pan" y ficha del producto.
   El texto sale de los atributos data-* del HTML y se escribe con textContent (nunca HTML en crudo). */
(function () {
  "use strict";
  var P = window.Primera;
  if (!P) return;
  var MAX = 12; /* maximo por producto en esta demo */

  /* ---- catalogo: primero la grilla (datos completos), despues las piezas de encargo ---- */
  P.catalogo = {};
  function leer(el) {
    var id = el.getAttribute("data-id");
    if (!id || P.catalogo[id]) return;
    var img = el.querySelector("img");
    P.catalogo[id] = {
      id: id,
      nombre: el.getAttribute("data-nombre") || "",
      precio: +el.getAttribute("data-precio") || 0,
      cat: el.getAttribute("data-cat") || "",
      hora: el.getAttribute("data-hora") || "",
      enc: +el.getAttribute("data-enc") || 0,
      foto: el.getAttribute("data-foto") || "",
      desc: el.getAttribute("data-desc") || "",
      ing: el.getAttribute("data-ing") || "",
      alerg: el.getAttribute("data-alerg") || "",
      alt: img ? img.getAttribute("alt") : ""
    };
  }
  Array.prototype.forEach.call(document.querySelectorAll("[data-grilla] [data-producto]"), leer);
  Array.prototype.forEach.call(document.querySelectorAll("[data-producto]"), leer);

  /* ---- filtros: el primero que se ve es el grande; en "Todo" vale el ritmo del HTML ---- */
  var grilla = document.querySelector("[data-grilla]");
  var vacio = document.querySelector("[data-vacio]");
  var chips = Array.prototype.slice.call(document.querySelectorAll("[data-chips] [data-filtro]"));
  var items = grilla ? Array.prototype.slice.call(grilla.children) : [];

  function filtrar(f) {
    var visibles = [];
    items.forEach(function (li) {
      var ok = f === "todo" || li.getAttribute("data-cat") === f;
      li.hidden = !ok;
      li.classList.remove("prod--grande");
      if (ok) visibles.push(li);
    });
    if (f === "todo") {
      items.forEach(function (li) { if (li.hasAttribute("data-grande")) li.classList.add("prod--grande"); });
    } else if (visibles[0]) {
      visibles[0].classList.add("prod--grande");
    }
    chips.forEach(function (c) { c.setAttribute("aria-pressed", c.getAttribute("data-filtro") === f ? "true" : "false"); });
    if (vacio) vacio.hidden = visibles.length > 0;
    if (grilla && !P.reducido()) {
      grilla.classList.remove("cambia");
      void grilla.offsetWidth;
      grilla.classList.add("cambia");
    }
    P.anunciar(visibles.length + (visibles.length === 1 ? " producto" : " productos"));
  }

  document.addEventListener("click", function (e) {
    var c = e.target.closest("[data-filtro]");
    if (c) { filtrar(c.getAttribute("data-filtro")); return; }
    var a = e.target.closest(".prod__abrir");
    if (a && a.getAttribute("href")) { e.preventDefault(); P.hoja.ir(a.getAttribute("href"), a); }
  });

  /* ---- ficha del producto ---- */
  var dlg = document.getElementById("d-ficha");
  if (!dlg) return;
  var q = function (s) { return dlg.querySelector(s); };
  var foto = q("[data-f-foto]"), nombre = q("[data-f-nombre]"), precio = q("[data-f-precio]"), desc = q("[data-f-desc]");
  var hora = q("[data-f-hora]"), ing = q("[data-f-ing]"), alerg = q("[data-f-alerg]");
  var num = q("[data-f-cant]"), total = q("[data-f-total]"), boton = q("[data-f-sumar]"), rotulo = q("[data-f-boton]");
  var error = q("[data-f-error]"), menos = q("[data-f-menos]"), mas = q("[data-f-mas]");
  var actual = null, cant = 1;

  function yaEnPedido(id) { return P.pedido ? P.pedido.cantidad(id) : 0; }

  function pintarCantidad(animar) {
    num.textContent = String(cant);
    total.textContent = P.gs(actual.precio * cant);
    menos.disabled = cant <= 1;
    if (animar && !P.reducido() && num.animate) {
      num.animate([{ transform: "translateY(40%)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 160, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
    }
  }

  function llenar(p) {
    actual = p; cant = 1;
    foto.textContent = "";
    if (p.foto) {
      var im = document.createElement("img");
      im.src = "fotos/" + p.foto + "-480.webp";
      im.srcset = "fotos/" + p.foto + "-480.webp 480w, fotos/" + p.foto + "-720.webp 720w";
      im.sizes = "(min-width: 900px) 440px, 100vw";
      im.width = 480; im.height = 600; im.alt = p.alt || "";
      foto.appendChild(im);
    } else {
      var s = P.el("div", "sinfoto", null);
      s.appendChild(P.el("span", null, p.nombre));
      s.setAttribute("aria-hidden", "true");
      foto.appendChild(s);
    }
    nombre.textContent = p.nombre;
    precio.textContent = "Gs. " + P.gs(p.precio);
    desc.textContent = p.desc;
    hora.hidden = !p.hora;
    if (p.hora) {
      /* mismo texto que el tablero (incluye "Sale mañana", "Quedan pocas (ejemplo)" y "Se terminó (ejemplo)...") */
      var fase = P.faseHorneada(p.hora);
      hora.textContent = (P.estadosFila && P.estadosFila[p.id]) || (fase === "futura" ? "Sale a las " + p.hora : fase === "recien" ? "Recién salido" : "Ya salió");
    }
    var falta = "Falta. Consultá con el local antes de pedir.";
    ing.textContent = p.ing || falta;
    alerg.textContent = p.alerg || falta;
    rotulo.textContent = p.enc ? "Encargar" : "Sumar al pedido";
    error.hidden = true;
    pintarCantidad(false);
  }

  P.hoja.registrar({
    dialog: dlg,
    coincide: function (h) { return h.indexOf("#pan-") === 0; },
    alAbrir: function (h) {
      var p = P.catalogo[h.slice(5)];
      if (!p) return false;
      llenar(p);
      return true;
    }
  });

  menos.addEventListener("click", function () {
    if (cant > 1) { cant--; error.hidden = true; pintarCantidad(true); }
  });
  mas.addEventListener("click", function () {
    if (yaEnPedido(actual.id) + cant >= MAX) { error.hidden = false; return; }
    cant++; pintarCantidad(true);
  });
  boton.addEventListener("click", function () {
    if (!actual) return;
    if (actual.id === "torta-cumple" || actual.id === "torta-chocolate") { P.sabor = actual.id === "torta-chocolate" ? "Chocolate" : null; P.hoja.ir("#encargo", boton); return; }
    if (yaEnPedido(actual.id) + cant > MAX) { error.hidden = false; return; }
    if (P.pedido) P.pedido.agregar(actual.id, cant);
    P.anunciar("Sumaste " + actual.nombre + ", " + cant + ".");
    P.hoja.cerrar();
  });
})();
