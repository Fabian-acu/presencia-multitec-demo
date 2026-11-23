/* La Plomada (Demo): mi lista de obra. Todo en memoria: nada se guarda ni se envia. El boton final abre el WhatsApp de Multitec
   con el texto fijo de la demo; la lista queda solo en pantalla. */
(function () {
  "use strict";
  var P = window.Plomada = window.Plomada || {};
  var items = {};          /* codigo -> cantidad */
  var oyentes = [];
  var modo = "", zona = "", cuando = "";
  var tocado = false;      /* el usuario ya toco los datos de entrega: si despues cambia el total, se avisa */
  var totalPrevio = null;

  P.productos = {};
  P.orden = [];
  Array.prototype.forEach.call(document.querySelectorAll(".grupo .fila"), function (li) {
    var d = li.dataset;
    P.productos[d.codigo] = {
      codigo: d.codigo, rubro: d.rubro, rubroNombre: d.rubroNombre, nombre: d.nombre, medida: d.medida, u1: d.u1, un: d.un, uc: d.uc,
      precio: +d.precio, peso: +d.peso, disp: d.disp, foto: d.foto, alt: d.alt, paso: +d.paso, max: +d.max, uso: d.uso, para: d.para, con: d.con
    };
    P.orden.push(d.codigo);
  });
  P.maximoDe = function (prod) {
    var c = P.CONFIG;
    if (prod.rubro === "ladrillos") return c.MAX_LADRILLO;
    if (prod.rubro === "arena-piedra") return c.MAX_ARENA;
    return c.MAX_GENERAL;
  };

  /* ---------- estado ---------- */
  P.lista = {
    cantidad: function (c) { return items[c] || 0; },
    escuchar: function (fn) { oyentes.push(fn); },
    lineas: function () { return P.orden.filter(function (c) { return items[c] > 0; }); },
    /* pone la cantidad exacta; devuelve { cantidad, topado } */
    poner: function (c, q) {
      var prod = P.productos[c];
      if (!prod) return { cantidad: 0, topado: false };
      q = Math.round(q * 10) / 10;
      var tope = P.maximoDe(prod), topado = false;
      if (q > tope) { q = tope; topado = true; }
      var antes = items[c] || 0;
      if (q <= 0) delete items[c]; else items[c] = q;
      avisar(c, antes, items[c] || 0);
      return { cantidad: items[c] || 0, topado: topado };
    },
    sumar: function (c, dq) { return P.lista.poner(c, (items[c] || 0) + dq); },
    total: function () { var t = 0; for (var c in items) t += items[c] * P.productos[c].precio; return t; },
    peso: function () { var t = 0; for (var c in items) t += items[c] * P.productos[c].peso; return t; },
    flete: function () { return modo === "flete" && zona ? P.CONFIG.ZONAS[zona] : 0; }
  };
  function avisar(c, antes, ahora) { oyentes.forEach(function (fn) { fn(c, antes, ahora); }); }

  /* ---------- paso (cantidad) ---------- */
  P.mensajeTope = function (cods) {
    var m = P.textoMaximo();
    Array.prototype.forEach.call(document.querySelectorAll(".fila[data-codigo=\"" + cods + "\"] .fila__msg, .lin[data-codigo=\"" + cods + "\"] .lin__msg"), function (p) {
      p.textContent = m; p.hidden = false;
    });
    P.anunciar(m);
  };
  P.limpiarTope = function (c) {
    Array.prototype.forEach.call(document.querySelectorAll(".fila[data-codigo=\"" + c + "\"] .fila__msg, .lin[data-codigo=\"" + c + "\"] .lin__msg"), function (p) { p.hidden = true; });
  };
  function paso(prod, q) {
    var g = P.el("div", "paso");
    g.setAttribute("role", "group");
    g.setAttribute("aria-label", "Cantidad de " + prod.nombre + ", " + prod.medida);
    var menos = P.el("button", "paso__b");
    menos.type = "button"; menos.setAttribute("data-menos", "");
    menos.setAttribute("aria-label", "Quitar " + P.cantidad(prod.paso, prod) + " " + P.unidad(prod.paso, prod) + " de " + prod.nombre);
    menos.appendChild(P.icono("minus"));
    var v = P.el("span", "paso__v");
    var n = P.el("span", "paso__n mono", P.cantidad(q, prod)); n.__t = P.cantidad(q, prod);
    var u = P.el("span", "paso__u", P.unidad(q, prod));
    v.appendChild(n); v.appendChild(u);
    var mas = P.el("button", "paso__b");
    mas.type = "button"; mas.setAttribute("data-mas", "");
    mas.setAttribute("aria-label", "Sumar " + P.cantidad(prod.paso, prod) + " " + P.unidad(prod.paso, prod) + " de " + prod.nombre);
    mas.appendChild(P.icono("plus"));
    g.appendChild(menos); g.appendChild(v); g.appendChild(mas);
    return g;
  }
  P.paso = paso;
  function actualizarPaso(g, prod, q, sube) {
    P.rodar(g.querySelector(".paso__n"), P.cantidad(q, prod), sube, 160);
    g.querySelector(".paso__u").textContent = P.unidad(q, prod);
    g.querySelector("[data-mas]").disabled = q >= P.maximoDe(prod);
  }
  P.actualizarPaso = actualizarPaso;

  /* acciones por delegacion: filas, lista y calculadora */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-mas], [data-menos], [data-sumar], [data-quitar]");
    if (!b) return;
    var cont = b.closest("[data-codigo]");
    if (!cont || b.closest(".hoja__pie--detalle")) return;
    var c = cont.getAttribute("data-codigo"), prod = P.productos[c];
    if (!prod || b.disabled) return;
    P.limpiarTope(c);
    var q = P.lista.cantidad(c);
    var r;
    if (b.hasAttribute("data-quitar")) r = P.lista.poner(c, 0);
    else if (b.hasAttribute("data-menos")) r = P.lista.poner(c, q - prod.paso);
    else {
      r = P.lista.poner(c, q + prod.paso);
      if (!q && r.cantidad) { P.volar(cont.querySelector(".fila__foto") || b); P.anunciar("Sumaste " + prod.nombre + ", " + P.cantidad(r.cantidad, prod) + " " + P.unidad(r.cantidad, prod) + "."); }
    }
    if (r.topado) P.mensajeTope(c);
  });

  /* ---------- pintar filas (catalogo y mas pedido) ---------- */
  function pintarFilas(c, antes, ahora) {
    var prod = P.productos[c];
    Array.prototype.forEach.call(document.querySelectorAll(".fila[data-codigo=\"" + c + "\"]"), function (li) {
      var acc = li.querySelector("[data-acc]");
      var g = acc.querySelector(".paso");
      if (ahora > 0 && !g) {
        var tenia = acc.contains(document.activeElement);
        acc.textContent = "";
        g = paso(prod, ahora);
        acc.appendChild(g);
        g.querySelector("[data-mas]").disabled = ahora >= P.maximoDe(prod);
        if (tenia) g.querySelector("[data-mas]").focus();
      } else if (ahora > 0 && g) actualizarPaso(g, prod, ahora, ahora > antes);
      else if (ahora <= 0 && g) {
        var tuvo = acc.contains(document.activeElement);
        acc.textContent = "";
        var s = P.el("button", "btn btn--linea btn--fila");
        s.type = "button"; s.setAttribute("data-sumar", "");
        s.setAttribute("aria-label", "Sumar " + prod.nombre + ", " + prod.medida + " a la lista");
        s.appendChild(P.icono("plus"));
        s.appendChild(P.el("span", null, "Sumar a la lista"));
        acc.appendChild(s);
        if (tuvo) s.focus();
      }
    });
  }

  /* ---------- barra de la lista y contadores ---------- */
  var barraL = document.querySelector("[data-barralista]");
  function pintarBarra() {
    var lin = P.lista.lineas().length, total = P.lista.total();
    Array.prototype.forEach.call(document.querySelectorAll("[data-n]"), function (n) { P.rodar(n, "(" + lin + ")", true, 160); });
    if (barraL) {
      barraL.hidden = lin === 0;
      var t = barraL.querySelector("[data-total]");
      if (t) { t.textContent = ""; t.appendChild(document.createTextNode("Gs. " + P.gs(total))); t.appendChild(P.el("span", "barralista__demo", "de ejemplo (Demo)")); }
    }
    document.documentElement.classList.toggle("con-barralista", lin > 0);
  }

  /* ---------- panel de la lista ---------- */
  var dlg = document.getElementById("lista");
  var q = function (s) { return dlg.querySelector(s); };
  var gruposEl = q("[data-lista-grupos]"), vacia = q("[data-lista-vacia]"), llena = q("[data-lista-llena]");
  var cambioEl = q("[data-lista-cambio]"), form = q("[data-envio]");

  function pintarLista(c, antes, ahora) {
    var lin = P.lista.lineas();
    vacia.hidden = lin.length > 0; llena.hidden = lin.length === 0;
    /* grupos por rubro, en el orden del catalogo */
    var rubros = [];
    lin.forEach(function (cod) { var r = P.productos[cod].rubro; if (rubros.indexOf(r) < 0) rubros.push(r); });
    var foco = document.activeElement, focoClave = null;
    if (foco && gruposEl.contains(foco)) { var li = foco.closest(".lin"); if (li) focoClave = li.getAttribute("data-codigo") + "|" + (foco.hasAttribute("data-mas") ? "mas" : foco.hasAttribute("data-menos") ? "menos" : "quitar"); }
    gruposEl.textContent = "";
    rubros.forEach(function (r) {
      var sec = P.el("section", "lgrupo");
      var h = P.el("h3", "lgrupo__t", P.productos[lin.filter(function (cod) { return P.productos[cod].rubro === r; })[0]].rubroNombre);
      sec.appendChild(h);
      var ul = P.el("ul");
      lin.filter(function (cod) { return P.productos[cod].rubro === r; }).forEach(function (cod) {
        var prod = P.productos[cod], cant = items[cod];
        var li = P.el("li", "lin"); li.setAttribute("data-codigo", cod);
        var nom = P.el("p", "lin__nom", prod.nombre);
        nom.appendChild(P.el("span", "lin__med", prod.medida));
        li.appendChild(nom);
        li.appendChild(P.el("p", "lin__tot mono", "Gs. " + P.gs(cant * prod.precio)));
        li.appendChild(P.el("p", "lin__cod mono", cod));
        li.appendChild(paso(prod, cant));
        li.querySelector("[data-mas]").disabled = cant >= P.maximoDe(prod);
        var qb = P.el("button", "lin__quitar"); qb.type = "button"; qb.setAttribute("data-quitar", "");
        qb.setAttribute("aria-label", "Quitar " + prod.nombre + ", " + prod.medida + " de la lista");
        qb.appendChild(P.icono("trash")); qb.appendChild(P.el("span", null, "Quitar"));
        li.appendChild(qb);
        var m = P.el("p", "lin__msg"); m.setAttribute("role", "status"); m.hidden = true;
        li.appendChild(m);
        ul.appendChild(li);
      });
      sec.appendChild(ul);
      gruposEl.appendChild(sec);
    });
    if (focoClave) {
      var p = focoClave.split("|"), li2 = gruposEl.querySelector(".lin[data-codigo=\"" + p[0] + "\"]");
      var objetivo = li2 && li2.querySelector(p[1] === "mas" ? "[data-mas]" : p[1] === "menos" ? "[data-menos]" : "[data-quitar]");
      if (!objetivo && li2) objetivo = li2.querySelector("[data-mas]");
      if (!objetivo) objetivo = gruposEl.querySelector("[data-mas]") || q("[data-lista-volver]");
      if (objetivo && !objetivo.disabled) objetivo.focus();
    }
    q(".hoja__total").hidden = lin.length === 0;   /* sin productos no hay total que mostrar */
    totales();
    var total = P.lista.total();
    if (tocado && totalPrevio !== null && total !== totalPrevio && lin.length) cambioEl.hidden = false;
    totalPrevio = total;
  }
  function totales() {
    var sub = P.lista.total(), fl = P.lista.flete(), peso = P.lista.peso();
    q("[data-t-sub]").textContent = "Gs. " + P.gs(sub);
    q("[data-t-flete-fila]").hidden = !(modo === "flete" && zona);
    q("[data-t-flete]").textContent = "Gs. " + P.gs(fl);
    q("[data-t-total]").textContent = "Gs. " + P.gs(sub + fl);
    q("[data-t-peso]").textContent = (peso < 10 ? P.dec(peso) : P.gs(peso)) + " kg";
    q("[data-pie-total]").textContent = "Gs. " + P.gs(sub + fl);
  }

  P.lista.escuchar(function (c, antes, ahora) {
    pintarFilas(c, antes, ahora);
    pintarBarra();
    pintarLista(c, antes, ahora);
    if (P.detalleCambio) P.detalleCambio(c);
  });
  pintarBarra();

  /* ---------- hoja o panel fijo ---------- */
  var ancho = window.matchMedia("(min-width: 1100px)");
  var html = document.documentElement;
  function fijo() { return ancho.matches; }
  function modoPanel() {
    if (fijo()) {
      if (dlg.open && dlg.matches(":modal")) { dlg.classList.remove("visible"); dlg.close(); }
      html.classList.add("lista-fija");
      if (!dlg.open) dlg.show();
    } else {
      html.classList.remove("lista-fija");
      if (dlg.open && !dlg.matches(":modal")) dlg.close();
    }
  }
  if (ancho.addEventListener) ancho.addEventListener("change", modoPanel); else if (ancho.addListener) ancho.addListener(modoPanel);
  window.addEventListener("DOMContentLoaded", modoPanel);

  P.hoja.registrar({
    dialog: dlg,
    coincide: function (h) { return h === "#lista"; },
    alAbrir: function () { if (fijo()) { var t = document.getElementById("lista-t"); t.tabIndex = -1; t.focus(); return false; } return true; }
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-abrir-lista]"), function (b) {
    b.addEventListener("click", function () {
      if (fijo()) { var t = document.getElementById("lista-t"); t.tabIndex = -1; t.focus(); return; }
      P.hoja.ir("#lista", b);
    });
  });
  q("[data-lista-volver]").addEventListener("click", function () {
    if (!fijo()) P.hoja.cerrar();
    var c = document.getElementById("catalogo");
    window.setTimeout(function () { c.scrollIntoView({ behavior: P.reducido() ? "auto" : "smooth", block: "start" }); var t = document.getElementById("t-cat"); t.focus({ preventScroll: true }); }, fijo() ? 0 : 450);
  });

  /* ---------- datos de entrega ---------- */
  function err(nombre, texto, campo) {
    var p = q("[data-err=\"" + nombre + "\"]");
    if (!p) return;
    p.textContent = texto; p.hidden = !texto;
    if (campo) { if (texto) campo.setAttribute("aria-invalid", "true"); else campo.removeAttribute("aria-invalid"); }
  }
  var zonaCampo = q("[data-zona-campo]"), retiroLinea = q("[data-retiro-linea]"), pin = q("[data-pin]");
  var pinPos = null;
  function moverPin() {
    if (!pin) return;
    var pos = P.CONFIG.PIN[zona] || null;
    if (!pos) { pin.hidden = true; pinPos = null; return; }
    pin.hidden = false;
    var cont = pin.parentNode, antes = pinPos ? pin.getBoundingClientRect() : null;
    pin.style.left = pos[0] + "%"; pin.style.top = pos[1] + "%";
    if (antes && pin.animate && !P.reducido()) {
      var ahora = pin.getBoundingClientRect(), dx = antes.left - ahora.left, dy = antes.top - ahora.top;
      pin.animate([{ transform: "translate(" + dx + "px," + dy + "px) rotate(-45deg)" }, { transform: "translate(0,0) rotate(-45deg)" }], { duration: 350, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
    }
    pinPos = pos;
  }
  form.addEventListener("input", function () { tocado = true; });
  form.addEventListener("change", function (e) {
    tocado = true;
    var t = e.target;
    if (t.name === "modo") {
      modo = t.value; err("modo", "");
      zonaCampo.hidden = modo !== "flete"; retiroLinea.hidden = modo !== "retiro";
      if (modo === "flete") { q("[data-flete-val]").textContent = P.gs(zona ? P.CONFIG.ZONAS[zona] : 0); moverPin(); }
      totales();
    } else if (t.name === "zona") {
      zona = t.value; err("zona", "", t);
      q("[data-flete-val]").textContent = P.gs(zona ? P.CONFIG.ZONAS[zona] : 0);
      moverPin(); totales();
    } else if (t.name === "cuando") { cuando = t.value; err("cuando", ""); }
  });
  var nota = q("#nota"), notaN = q("[data-nota-n]");
  nota.addEventListener("input", function () { notaN.textContent = String(nota.value.length); });
  q("#nombre").addEventListener("input", function (e) { if (e.target.value.trim()) err("nombre", "", e.target); });
  q("#tel").addEventListener("input", function (e) { err("tel", "", e.target); });

  var enviar = q("[data-enviar]");
  enviar.addEventListener("click", function (e) {
    var primero = null;
    function falla(nombre, texto, campo, foco) { err(nombre, texto, campo); if (!primero) primero = foco || campo; }
    var piePrev = q("[data-err=\"lista\"]");
    if (!P.lista.lineas().length) {
      e.preventDefault();
      piePrev.textContent = "Sumá al menos un producto."; piePrev.hidden = false;
      var v = q("[data-lista-volver]"); if (v) v.focus();
      return;
    }
    piePrev.hidden = true;
    tocado = true;
    if (!modo) falla("modo", "Elegí retiro o flete.", null, form.querySelector("input[name=modo]")); else err("modo", "");
    if (modo === "flete" && !zona) falla("zona", "Falta tu zona. Elegí una de la lista.", q("#zona")); else err("zona", "", q("#zona"));
    if (!cuando) falla("cuando", "Elegí cuándo lo necesitás.", null, form.querySelector("input[name=cuando]")); else err("cuando", "");
    var nombre = q("#nombre");
    if (!nombre.value.trim()) falla("nombre", "Falta tu nombre.", nombre); else err("nombre", "", nombre);
    var tel = q("#tel"), tv = tel.value.trim();
    if (tv && !(/^\+?[\d\s]+$/.test(tv) && tv.replace(/\D/g, "").length >= 6)) falla("tel", "Revisá el teléfono: tiene que tener solo números.", tel); else err("tel", "", tel);
    if (primero) {
      e.preventDefault();
      primero.focus();
      var cont = primero.closest(".campo") || primero;
      if (cont.scrollIntoView) cont.scrollIntoView({ block: "center", behavior: "auto" });
      return;
    }
    P.anunciar("Te llevamos al WhatsApp de Multitec. Es una demo: la lista no se envía.");
  });

  /* ---------- chat de ejemplo: los globos llegan de a uno al entrar en pantalla ---------- */
  var chat = q("[data-chat]");
  if (chat && "IntersectionObserver" in window && !P.reducido()) {
    var visto = false;
    new IntersectionObserver(function (es, ob) {
      es.forEach(function (en) {
        if (!en.isIntersecting || visto) return;
        visto = true; ob.disconnect();
        Array.prototype.forEach.call(chat.children, function (g, i) {
          if (g.animate) g.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 220, delay: i * 450, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "backwards" });
        });
      });
    }, { threshold: 0.2 }).observe(chat);
  }
})();
