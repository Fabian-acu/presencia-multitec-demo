/* Presencia Multitec (demo restaurante): pedido SIMULADO, todo en el navegador y sin servidor.
   No se envia ni se guarda nada. Se carga recien al primer toque en "Agregar" (ver pro.js).
   Mapa propio y liviano con teselas de OpenStreetMap (sin librerias de terceros). */
(function () {
  "use strict";
  var LOCAL = { lat: -25.5097, lon: -54.6111 };
  var CLIENTE0 = { lat: -25.5062, lon: -54.6085 };
  var ENVIO = 10000;
  var bloqueo = 0; // C) tras enviar el pedido, el doble toque no cierra la ventana
  var cart = {}, vista = "resumen", orden = null, timer = null;
  var form = { tipo: "delivery", nombre: "", pago: "efectivo", ref: "", pos: null };
  var quieto = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- utilidades ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function h(tag, props) {
    var n = document.createElement(tag), p = props || {};
    Object.keys(p).forEach(function (k) {
      if (k === "class") { n.className = p[k]; } else if (k === "text") { n.textContent = p[k]; } else { n.setAttribute(k, p[k]); }
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }
    }
    return n;
  }
  function gs(n) { return "Gs. " + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function total() { var t = 0; Object.keys(cart).forEach(function (k) { t += cart[k].precio * cart[k].cant; }); return t; }
  function cuenta() { var t = 0; Object.keys(cart).forEach(function (k) { t += cart[k].cant; }); return t; }
  function hora(minMas) {
    var d = new Date(Date.now() + minMas * 60000);
    try { return new Intl.DateTimeFormat("es-PY", { timeZone: "America/Asuncion", hour: "2-digit", minute: "2-digit", hour12: false }).format(d); }
    catch (e) { return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
  }
  function waLink() { var a = $("#wa-portada"); return a ? a.href : "https://wa.me/595981601211"; }

  /* ---------- mapa minimo con teselas de OpenStreetMap ---------- */
  function merc(lat, lon, z) {
    var s = 256 * Math.pow(2, z), sn = Math.sin(lat * Math.PI / 180);
    return { x: (lon + 180) / 360 * s, y: (0.5 - Math.log((1 + sn) / (1 - sn)) / (4 * Math.PI)) * s };
  }
  function inv(x, y, z) {
    var s = 256 * Math.pow(2, z), n = Math.PI - 2 * Math.PI * y / s;
    return { lat: 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))), lon: x / s * 360 - 180 };
  }
  function crearMapa(cont, o) {
    var z = o.zoom, c = merc(o.lat, o.lon, z), tiles = {}, marcas = [], w = 0, alto = 0;
    var capa = h("div", { class: "mp-capa" });
    cont.appendChild(capa);
    cont.appendChild(h("a", { class: "mp-attr", href: "https://www.openstreetmap.org/copyright", target: "_blank", rel: "noopener", text: "© OpenStreetMap" }));
    function render() {
      w = cont.clientWidth; alto = cont.clientHeight;
      var tlx = c.x - w / 2, tly = c.y - alto / 2, n = Math.pow(2, z), keep = {};
      for (var x = Math.floor(tlx / 256); x <= Math.floor((tlx + w) / 256); x++) {
        for (var y = Math.floor(tly / 256); y <= Math.floor((tly + alto) / 256); y++) {
          if (y < 0 || y >= n) { continue; }
          var xx = ((x % n) + n) % n, key = z + "/" + xx + "/" + y + "@" + x;
          keep[key] = true;
          if (!tiles[key]) {
            var im = h("img", { class: "mp-tesela", alt: "", width: "256", height: "256", draggable: "false", src: "https://tile.openstreetmap.org/" + z + "/" + xx + "/" + y + ".png" });
            tiles[key] = im; capa.appendChild(im);
          }
          tiles[key].style.transform = "translate(" + (x * 256 - tlx) + "px," + (y * 256 - tly) + "px)";
        }
      }
      Object.keys(tiles).forEach(function (k) { if (!keep[k]) { capa.removeChild(tiles[k]); delete tiles[k]; } });
      marcas.forEach(function (m) { ubicar(m, 0); });
    }
    function ubicar(m, seg) {
      var p = merc(m.lat, m.lon, z), tlx = c.x - w / 2, tly = c.y - alto / 2;
      m.el.style.transition = seg && !quieto ? "transform " + seg + "s linear" : "none";
      m.el.style.transform = "translate(" + (p.x - tlx) + "px," + (p.y - tly) + "px)";
    }
    var api = {
      centro: function () { return inv(c.x, c.y, z); },
      zoom: function (d) { var ce = inv(c.x, c.y, z); z = Math.max(13, Math.min(17, z + d)); c = merc(ce.lat, ce.lon, z); render(); },
      marca: function (el, lat, lon) { var m = { el: el, lat: lat, lon: lon }; cont.appendChild(el); marcas.push(m); ubicar(m, 0); return m; },
      mover: function (m, lat, lon, seg) { m.lat = lat; m.lon = lon; void m.el.offsetWidth; ubicar(m, seg); },
      ajustar: function (a, b) {
        for (var zz = 17; zz >= 12; zz--) {
          var pa = merc(a.lat, a.lon, zz), pb = merc(b.lat, b.lon, zz);
          if (Math.abs(pa.x - pb.x) < w - 110 && Math.abs(pa.y - pb.y) < alto - 110) { z = zz; break; }
          z = zz;
        }
        c = merc((a.lat + b.lat) / 2, (a.lon + b.lon) / 2, z); render();
      },
      render: render
    };
    if (o.arrastrable) {
      var d = null;
      cont.classList.add("mp-arrastra");
      cont.addEventListener("pointerdown", function (e) { if (e.target.closest("button, a")) { return; } d = { x: e.clientX, y: e.clientY }; cont.setPointerCapture(e.pointerId); });
      cont.addEventListener("pointermove", function (e) { if (!d) { return; } c.x -= e.clientX - d.x; c.y -= e.clientY - d.y; d = { x: e.clientX, y: e.clientY }; render(); });
      var fin = function () { if (d) { d = null; if (o.alMover) { o.alMover(api.centro()); } } };
      cont.addEventListener("pointerup", fin); cont.addEventListener("pointercancel", fin);
    }
    render();
    if (window.ResizeObserver) { new ResizeObserver(render).observe(cont); }
    return api;
  }

  /* ---------- botones de la carta ---------- */
  function agregar(btn, d) {
    var id = btn.getAttribute("data-id");
    if (!cart[id]) { cart[id] = { nombre: btn.getAttribute("data-nombre"), precio: +btn.getAttribute("data-precio"), cant: 0 }; }
    cart[id].cant = Math.max(0, cart[id].cant + d);
    if (cart[id].cant === 0) { delete cart[id]; }
    sync();
  }
  function stepper(btn) {
    var s = h("div", { class: "cant", role: "group", "aria-label": "Cantidad de " + btn.getAttribute("data-nombre") },
      h("button", { type: "button", class: "cant-b", "data-mas": "0", "aria-label": "Quitar uno", text: "−" }),
      h("output", { "aria-live": "polite" }),
      h("button", { type: "button", class: "cant-b", "data-mas": "1", "aria-label": "Agregar uno", text: "+" }));
    s.addEventListener("click", function (e) {
      var b = e.target.closest("[data-mas]");
      if (b) { agregar(btn, b.getAttribute("data-mas") === "1" ? 1 : -1); }
    });
    return s;
  }
  var barra = null;
  function sync() {
    $$("[data-pedido]").forEach(function (btn) {
      var it = cart[btn.getAttribute("data-id")], pie = btn.parentNode, st = $(".cant", pie);
      if (it) {
        btn.hidden = true;
        if (!st) { st = stepper(btn); pie.appendChild(st); }
        $("output", st).textContent = it.cant;
      } else { btn.hidden = false; if (st) { pie.removeChild(st); } }
    });
    if (!barra) {
      barra = h("button", { type: "button", class: "ped-bar btn btn-grande" });
      barra.addEventListener("click", abrir);
      document.body.appendChild(barra);
    }
    var n = cuenta();
    document.documentElement.classList.toggle("con-carrito", n > 0 || !!(orden && !orden.fin));
    if (orden && !orden.fin) { barra.textContent = "Ver seguimiento del pedido"; barra.hidden = false; }
    else if (n > 0) { barra.textContent = "Ver pedido: " + n + (n === 1 ? " plato" : " platos") + " · " + gs(total()); barra.hidden = false; }
    else { barra.hidden = true; }
    if (dlg && dlg.open && vista === "resumen") { pintar(); }
  }

  /* ---------- ventana del pedido ---------- */
  var dlg = null, cuerpo = null, pie = null, titulo = null;
  function abrir() {
    if (!dlg) {
      titulo = h("h2", { id: "ped-t", class: "ped-t" });
      cuerpo = h("div", { class: "ped-cuerpo" });
      pie = h("div", { class: "ped-pie" });
      var cerrar = h("button", { type: "button", class: "ped-x", "aria-label": "Cerrar", text: "×" });
      cerrar.addEventListener("click", function () { if (Date.now() > bloqueo) { dlg.close(); } });
      dlg = h("dialog", { class: "ped", "aria-labelledby": "ped-t" },
        h("div", { class: "ped-demo", role: "note", text: "Demostración: no se hace ningún pedido real." }),
        h("div", { class: "ped-cab" }, titulo, cerrar), cuerpo, pie);
      document.body.appendChild(dlg);
      dlg.addEventListener("close", function () { document.documentElement.classList.remove("ped-abierto"); });
    }
    // B) un pedido ya entregado no vuelve a mostrarse si el cliente empieza otro
    if (orden && orden.fin && cuenta() > 0) { clearTimeout(timer); orden = null; vista = "resumen"; }
    else if (orden) { vista = "seguimiento"; }
    else if (vista === "seguimiento") { vista = "resumen"; }
    // A) primero se abre la ventana (el mapa necesita medir), despues se pinta
    if (!dlg.open) { dlg.showModal(); document.documentElement.classList.add("ped-abierto"); }
    pintar();
  }
  function limpiar() { while (cuerpo.firstChild) { cuerpo.removeChild(cuerpo.firstChild); } while (pie.firstChild) { pie.removeChild(pie.firstChild); } mapaPick = null; mapaSeg = null; }
  function pintar() {
    limpiar();
    if (vista === "resumen") { vResumen(); } else if (vista === "datos") { vDatos(); } else { vSeguimiento(); }
  }

  function vResumen() {
    titulo.textContent = "Tu pedido";
    var ul = h("ul", { class: "ped-lista" });
    Object.keys(cart).forEach(function (id) {
      var it = cart[id];
      var s = h("div", { class: "cant", role: "group", "aria-label": "Cantidad de " + it.nombre },
        h("button", { type: "button", class: "cant-b", "aria-label": "Quitar uno", text: "−" }), h("output", { text: String(it.cant) }),
        h("button", { type: "button", class: "cant-b", "aria-label": "Agregar uno", text: "+" }));
      var bs = $$("button", s);
      bs[0].addEventListener("click", function () { cart[id].cant -= 1; if (cart[id].cant <= 0) { delete cart[id]; } sync(); if (!cuenta()) { dlg.close(); } else { pintar(); } });
      bs[1].addEventListener("click", function () { cart[id].cant += 1; sync(); pintar(); });
      ul.appendChild(h("li", {}, h("div", {}, h("strong", { text: it.nombre }), h("div", { class: "ped-sub", text: gs(it.precio) + " c/u" })), s, h("span", { class: "ped-monto", text: gs(it.precio * it.cant) })));
    });
    cuerpo.appendChild(ul);
    cuerpo.appendChild(h("p", { class: "ped-total" }, h("span", { text: "Subtotal" }), h("strong", { text: gs(total()) })));
    cuerpo.appendChild(h("p", { class: "ped-sub", text: "Precios de ejemplo. El envío (si elegís delivery) se suma en el siguiente paso." }));
    var sig = h("button", { type: "button", class: "btn btn-grande", text: "Continuar" });
    sig.addEventListener("click", function () { vista = "datos"; pintar(); });
    pie.appendChild(sig);
  }

  var mapaPick = null, mapaSeg = null;
  function radio(nombre, valor, etiqueta, marcado, alCambiar) {
    var i = h("input", { type: "radio", name: nombre, value: valor });
    if (marcado) { i.checked = true; }
    i.addEventListener("change", function () { alCambiar(valor); });
    return h("label", { class: "ped-op" }, i, h("span", { text: etiqueta }));
  }
  function vDatos() {
    titulo.textContent = "Cómo lo querés";
    var zonaMapa = h("div", { class: "ped-mapa-zona" });
    var fs1 = h("fieldset", { class: "ped-fs" }, h("legend", { text: "Tipo de servicio" }),
      radio("tipo", "delivery", "Delivery", form.tipo === "delivery", cambiaTipo),
      radio("tipo", "retiro", "Retiro en el local", form.tipo === "retiro", cambiaTipo),
      radio("tipo", "local", "Comer en el local", form.tipo === "local", cambiaTipo));
    cuerpo.appendChild(fs1);
    cuerpo.appendChild(zonaMapa);
    var nom = h("input", { id: "ped-nombre", type: "text", autocomplete: "off", maxlength: "40", value: form.nombre });
    nom.addEventListener("input", function () { form.nombre = nom.value; err.hidden = true; });
    var err = h("p", { class: "ped-err", role: "alert", hidden: "", text: "Escribí tu nombre para continuar." });
    cuerpo.appendChild(h("div", { class: "ped-campo" }, h("label", { for: "ped-nombre", text: "Tu nombre" }), nom, err));
    cuerpo.appendChild(h("fieldset", { class: "ped-fs" }, h("legend", { text: "Forma de pago" }),
      radio("pago", "efectivo", "Efectivo", form.pago === "efectivo", function (v) { form.pago = v; }),
      radio("pago", "transferencia", "Transferencia", form.pago === "transferencia", function (v) { form.pago = v; }),
      radio("pago", "tarjeta", "Tarjeta", form.pago === "tarjeta", function (v) { form.pago = v; })));
    var resumen = h("p", { class: "ped-total" });
    cuerpo.appendChild(resumen);
    cuerpo.appendChild(h("p", { class: "ped-sub", text: "Tus datos no se guardan ni se envían a ningún lado." }));

    function cambiaTipo(v) { form.tipo = v; pintarZona(); }
    function pintarZona() {
      while (zonaMapa.firstChild) { zonaMapa.removeChild(zonaMapa.firstChild); }
      mapaPick = null;
      var t = total() + (form.tipo === "delivery" ? ENVIO : 0);
      while (resumen.firstChild) { resumen.removeChild(resumen.firstChild); }
      resumen.appendChild(h("span", { text: form.tipo === "delivery" ? "Total con envío (" + gs(ENVIO) + ")" : "Total" }));
      resumen.appendChild(h("strong", { text: gs(t) }));
      if (form.tipo !== "delivery") { return; }
      var caja = h("div", { class: "mp", role: "group", "aria-label": "Mapa para elegir tu ubicación" });
      var ref = h("input", { id: "ped-ref", type: "text", maxlength: "60", autocomplete: "off", value: form.ref });
      ref.addEventListener("input", function () { form.ref = ref.value; });
      zonaMapa.appendChild(h("p", { class: "ped-ayuda", text: "Mové el mapa hasta que el pin quede sobre tu casa." }));
      zonaMapa.appendChild(caja);
      zonaMapa.appendChild(h("div", { class: "ped-campo" }, h("label", { for: "ped-ref", text: "Referencia (opcional)" }), ref));
      var p0 = form.pos || CLIENTE0;
      caja.appendChild(h("div", { class: "mp-pin", "aria-hidden": "true" }));
      mapaPick = crearMapa(caja, { lat: p0.lat, lon: p0.lon, zoom: 16, arrastrable: true, alMover: function (p) { form.pos = p; } });
      form.pos = p0;
      var bz = h("div", { class: "mp-zoom" }, h("button", { type: "button", "aria-label": "Acercar", text: "+" }), h("button", { type: "button", "aria-label": "Alejar", text: "−" }));
      var bb = $$("button", bz);
      bb[0].addEventListener("click", function () { mapaPick.zoom(1); form.pos = mapaPick.centro(); });
      bb[1].addEventListener("click", function () { mapaPick.zoom(-1); form.pos = mapaPick.centro(); });
      caja.appendChild(bz);
    }
    pintarZona();

    var atras = h("button", { type: "button", class: "btn btn-borde", text: "Volver" });
    atras.addEventListener("click", function () { vista = "resumen"; pintar(); });
    var env = h("button", { type: "button", class: "btn btn-grande", text: "Enviar pedido" });
    env.addEventListener("click", function () {
      if (form.nombre.trim().length < 2) { err.hidden = false; nom.focus(); return; }
      iniciarOrden();
    });
    pie.appendChild(atras); pie.appendChild(env);
  }

  /* ---------- seguimiento ---------- */
  var PASOS = {
    delivery: ["Recibido", "Verificando pago", "Preparando", "Casi listo", "En camino", "Entregado"],
    retiro: ["Recibido", "Verificando pago", "Preparando", "Casi listo", "Listo para retirar"],
    local: ["Recibido", "Verificando pago", "Preparando", "Casi listo", "Listo en tu mesa"]
  };
  var SEG = [3, 4, 6, 5, 10];
  // minutos simulados desde la hora del pedido (la demo avanza en segundos, los horarios se ven como en la vida real)
  var OFF = { delivery: [0, 3, 12, 22, 28, 38], retiro: [0, 3, 12, 22, 28], local: [0, 3, 12, 22, 28] };
  function iniciarOrden() {
    var pasos = PASOS[form.tipo].slice();
    if (form.pago === "efectivo") { pasos[1] = "Confirmando pedido"; }
    var tot = total() + (form.tipo === "delivery" ? ENVIO : 0);
    var off = OFF[form.tipo];
    orden = { paso: 0, pasos: pasos, tipo: form.tipo, nombre: form.nombre.trim(), total: tot, num: String(100 + Math.floor(Math.random() * 900)),
      eta: hora(off[off.length - 1]), cliente: form.tipo === "delivery" ? (form.pos || CLIENTE0) : null, horas: off.map(hora), fin: false, items: cuenta() };
    cart = {}; sync();
    bloqueo = Date.now() + 700;
    vista = "seguimiento"; pintar();
    programar();
  }
  function programar() {
    clearTimeout(timer);
    if (!orden || orden.fin) { return; }
    timer = setTimeout(function () {
      orden.paso += 1;
      if (orden.paso >= orden.pasos.length - 1) { orden.fin = true; }
      sync();
      if (dlg && dlg.open && vista === "seguimiento") { actualizar(); }
      programar();
    }, SEG[Math.min(orden.paso, SEG.length - 1)] * 1000);
  }
  var olEl = null, estadoEl = null, moto = null, otroEl = null;
  function motoSvg() {
    var ns = "http://www.w3.org/2000/svg", s = document.createElementNS(ns, "svg");
    s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("class", "mk-ico"); s.setAttribute("aria-hidden", "true");
    s.setAttribute("fill", "none"); s.setAttribute("stroke", "currentColor"); s.setAttribute("stroke-width", "2"); s.setAttribute("stroke-linecap", "round"); s.setAttribute("stroke-linejoin", "round");
    [["circle", { cx: 5.5, cy: 16.5, r: 3 }], ["circle", { cx: 18.5, cy: 16.5, r: 3 }], ["path", { d: "M5.5 16.5 9 9h4l2.5 7.5M9 9 7.5 7H5M13 9l2-3h2.5" }]].forEach(function (x) {
      var e = document.createElementNS(ns, x[0]); Object.keys(x[1]).forEach(function (k) { e.setAttribute(k, x[1][k]); }); s.appendChild(e);
    });
    return s;
  }
  function vSeguimiento() {
    titulo.textContent = "Seguimiento del pedido";
    var o = orden;
    cuerpo.appendChild(h("p", { class: "ped-sub", text: "Pedido de prueba N.º " + o.num + " de " + o.nombre + " · " + o.items + (o.items === 1 ? " plato" : " platos") + " · " + gs(o.total) }));
    estadoEl = h("p", { class: "ped-estado", "aria-live": "polite" });
    cuerpo.appendChild(estadoEl);
    cuerpo.appendChild(h("p", { class: "ped-eta", text: "Hora estimada: " + o.eta + " (ejemplo)" }));
    cuerpo.appendChild(h("p", { class: "ped-sub", text: "Simulación acelerada: los estados avanzan en segundos; las horas son las de un pedido real." }));
    var barraP = h("div", { class: "ped-prog", "aria-hidden": "true" }, h("div", { class: "ped-prog-in" }));
    cuerpo.appendChild(barraP);
    olEl = h("ol", { class: "ped-pasos" });
    o.pasos.forEach(function (p) { olEl.appendChild(h("li", {}, h("span", { class: "ped-punto" }), h("span", { class: "ped-nom", text: p }), h("span", { class: "ped-hora" }))); });
    cuerpo.appendChild(olEl);
    if (o.tipo === "delivery") {
      var caja = h("div", { class: "mp mp-seg", role: "img", "aria-label": "Mapa con el local y tu ubicación" });
      cuerpo.appendChild(caja);
      mapaSeg = crearMapa(caja, { lat: LOCAL.lat, lon: LOCAL.lon, zoom: 15 });
      mapaSeg.ajustar(LOCAL, o.cliente);
      mapaSeg.marca(h("div", { class: "mk mk-local" }, h("span", { text: "Local" })), LOCAL.lat, LOCAL.lon);
      mapaSeg.marca(h("div", { class: "mk mk-cli" }, h("span", { text: "Vos" })), o.cliente.lat, o.cliente.lon);
      moto = mapaSeg.marca(h("div", { class: "mk mk-moto", hidden: "" }, motoSvg()), LOCAL.lat, LOCAL.lon);
      moto.movido = false;
    }
    var icoWA = $("#wa-portada .ico");
    cuerpo.appendChild(h("a", { class: "btn btn-chico ped-wa", href: waLink(), rel: "noopener", target: "_blank" }, icoWA ? icoWA.cloneNode(true) : null, h("span", { text: "Hablar por WhatsApp" })));
    cuerpo.appendChild(h("p", { class: "ped-sub", text: "En esta demo, el botón te comunica con Multitec, no con el restaurante." }));
    otroEl = h("button", { type: "button", class: "ped-otro", text: "Hacer otro pedido" });
    otroEl.addEventListener("click", function () { if (!orden || !orden.fin) { return; } clearTimeout(timer); orden = null; vista = "resumen"; sync(); dlg.close(); });
    cuerpo.appendChild(otroEl);
    var cerrarB = h("button", { type: "button", class: "btn btn-borde", text: "Cerrar" });
    cerrarB.addEventListener("click", function () { if (Date.now() > bloqueo) { dlg.close(); } });
    pie.appendChild(cerrarB);
    actualizar();
  }
  function actualizar() {
    var o = orden; if (!olEl) { return; }
    $$("li", olEl).forEach(function (li, i) {
      li.classList.toggle("hecho", i < o.paso || (i === o.paso && o.fin));
      li.classList.toggle("actual", i === o.paso && !o.fin);
      if (i === o.paso) { li.setAttribute("aria-current", "step"); } else { li.removeAttribute("aria-current"); }
      $(".ped-hora", li).textContent = o.horas[i] || "";
    });
    var pr = $(".ped-prog-in", cuerpo); if (pr) { pr.style.transform = "scaleX(" + (o.paso / (o.pasos.length - 1)) + ")"; }
    estadoEl.textContent = o.pasos[o.paso];
    if (otroEl) { otroEl.disabled = !o.fin; }
    var fn = $(".ped-fin", cuerpo);
    if (o.fin && !fn) { estadoEl.parentNode.insertBefore(h("p", { class: "ped-sub ped-fin", text: "Fin de la demostración: así lo vería tu cliente." }), estadoEl.nextSibling); }
    if (mapaSeg && moto) {
      var enCamino = o.pasos[o.paso] === "En camino", fin = o.fin && o.tipo === "delivery";
      moto.el.hidden = !(enCamino || fin);
      if (enCamino && !moto.movido) { moto.movido = true; mapaSeg.mover(moto, o.cliente.lat, o.cliente.lon, SEG[4] - 1); var mz = $(".mp-seg", cuerpo); if (mz) { mz.scrollIntoView({ block: "nearest", behavior: quieto ? "auto" : "smooth" }); } }
      if (fin) { mapaSeg.mover(moto, o.cliente.lat, o.cliente.lon, 0); }
    }
  }

  /* ---------- arranque ---------- */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-pedido]");
    if (b) { agregar(b, 1); }
  });
  var estHdr = $("#estado");
  if (estHdr) { estHdr.textContent = "Pedidos de prueba activos"; estHdr.classList.add("abierto"); }
  window.Pedido = { alIniciar: function (b) { agregar(b, 1); } };
})();
