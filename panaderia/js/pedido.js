/* La Primera Hornada (Demo): "Mi pedido". El pedido vive solo en memoria (no se guarda ni se envia nada).
   - "Sumar" se vuelve un contador en el mismo lugar (todos los botones del mismo producto se sincronizan).
   - Barra fija con el total desde el primer producto. Hoja "Mi pedido" con lineas, hora de retiro y chat de ejemplo.
   - Encargos (24 o 48 h) no pueden retirarse "Hoy"; los productos con horneada no se retiran antes de que salgan.
   El mensaje de WhatsApp es siempre el de la demo hacia Multitec: el resumen queda solo en pantalla. */
(function () {
  "use strict";
  var P = window.Primera;
  if (!P || !P.catalogo || !P.hoja) return;
  var MAX = 12;
  var HORAS_HOY = ["10:00", "12:00", "16:00", "18:00"];
  var DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

  var items = {};     /* id -> cantidad */
  var orden = [];     /* ids en el orden en que se sumaron */
  var retiro = null;  /* { off, min, etiqueta } */

  var barra = document.querySelector("[data-barra]");
  var dlg = document.getElementById("d-pedido");
  var q = function (s) { return dlg.querySelector(s); };
  var vacio = q("[data-p-vacio]"), lleno = q("[data-p-lleno]"), pie = q("[data-p-pie]"), lineas = q("[data-p-lineas]");
  var horas = q("[data-p-horas]"), errorHora = q("[data-p-error-hora]"), errorTxt = q("[data-p-error-txt]");
  var nota = document.getElementById("p-nota"), cont = q("[data-p-cont]"), totalBolsa = q("[data-p-total]");
  var cambio = q("[data-p-cambio]"), enviar = q("[data-p-enviar]");
  var contadores = [];   /* { id, boton, caja, num, mas, menos } */

  /* ---------- estado ---------- */
  function cantidad(id) { return items[id] || 0; }
  function unidades() { var n = 0; orden.forEach(function (id) { n += items[id]; }); return n; }
  function total() { var t = 0; orden.forEach(function (id) { t += items[id] * P.catalogo[id].precio; }); return t; }

  function toast(texto) {
    var t = document.querySelector("[data-toast]");
    if (!t) { t = P.el("p", "toast"); t.setAttribute("data-toast", ""); document.body.appendChild(t); }
    t.textContent = texto;
    t.classList.add("en");
    window.clearTimeout(toast.h);
    toast.h = window.setTimeout(function () { t.classList.remove("en"); }, 3200);
  }

  function agregar(id, n) {
    var p = P.catalogo[id];
    if (!p) return 0;
    var nuevo = cantidad(id) + n;
    if (nuevo > MAX) { nuevo = MAX; toast("Máximo " + MAX + " por producto en esta demo."); P.anunciar("Máximo " + MAX + " por producto en esta demo."); }
    if (nuevo <= 0) { quitar(id); return 0; }
    if (!items[id]) orden.push(id);
    items[id] = nuevo;
    cambiado();
    return nuevo;
  }
  function quitar(id) {
    delete items[id];
    orden = orden.filter(function (x) { return x !== id; });
    cambiado();
  }
  P.pedido = { agregar: agregar, quitar: quitar, cantidad: cantidad, total: total, unidades: unidades };

  /* ---------- barra fija y contadores ---------- */
  var anterior = 0;
  function cambiado() {
    var n = unidades();
    Array.prototype.forEach.call(document.querySelectorAll("[data-n]"), function (e) { e.textContent = String(n); });
    Array.prototype.forEach.call(document.querySelectorAll("[data-total]"), function (e) { e.textContent = P.gs(total()); });
    if (barra) {
      if (n > 0 && barra.hidden) {
        barra.hidden = false;
        window.requestAnimationFrame(function () { window.requestAnimationFrame(function () { barra.classList.add("en"); }); });
      } else if (n === 0 && !barra.hidden) {
        barra.classList.remove("en");
        window.setTimeout(function () { if (unidades() === 0) barra.hidden = true; }, P.reducido() ? 0 : 260);
      }
      if (n !== anterior && n > 0 && !P.reducido()) {
        var c = barra.querySelector(".bolsa-barra__txt");
        if (c && c.animate) c.animate([{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }], { duration: 220, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
      }
    }
    anterior = n;
    contadores.forEach(function (c) {
      var k = cantidad(c.id);
      c.boton.hidden = k > 0;
      c.caja.hidden = k === 0;
      c.num.textContent = String(k);
      c.mas.setAttribute("aria-disabled", k >= MAX ? "true" : "false");
    });
    if (dlg.open) pintarBolsa();
  }

  /* "Sumar" -> contador, en el mismo lugar */
  Array.prototype.forEach.call(document.querySelectorAll("[data-sumar]"), function (boton) {
    var id = boton.getAttribute("data-sumar");
    var p = P.catalogo[id];
    if (!p) return;
    var caja = P.el("span", "contador");
    caja.setAttribute("role", "group");
    caja.setAttribute("aria-label", p.nombre);
    caja.hidden = true;
    var menos = P.el("button", "contador__btn"); menos.type = "button"; menos.setAttribute("aria-label", "Quitar uno de " + p.nombre); menos.appendChild(P.icono("minus"));
    var num = P.el("output", "contador__num", "0");
    var mas = P.el("button", "contador__btn"); mas.type = "button"; mas.setAttribute("aria-label", "Sumar uno de " + p.nombre); mas.appendChild(P.icono("plus"));
    caja.appendChild(menos); caja.appendChild(num); caja.appendChild(mas);
    boton.parentNode.insertBefore(caja, boton.nextSibling);
    contadores.push({ id: id, boton: boton, caja: caja, num: num, mas: mas, menos: menos });

    boton.addEventListener("click", function () {
      if (boton.disabled) return;
      agregar(id, 1);
      P.anunciar("Sumaste " + p.nombre + ", " + cantidad(id) + ".");
      mas.focus({ preventScroll: true });
    });
    mas.addEventListener("click", function () {
      if (cantidad(id) >= MAX) { toast("Máximo " + MAX + " por producto en esta demo."); P.anunciar("Máximo " + MAX + " por producto en esta demo."); return; }
      agregar(id, 1);
      P.anunciar("Sumaste " + p.nombre + ", " + cantidad(id) + ".");
    });
    menos.addEventListener("click", function () {
      var k = cantidad(id) - 1;
      agregar(id, -1);
      P.anunciar(k > 0 ? "Quitaste uno de " + p.nombre + ", " + k + "." : "Quitaste " + p.nombre + ".");
      if (k <= 0) boton.focus({ preventScroll: true });
    });
  });

  /* ---------- hora de retiro ---------- */
  function etiquetaDia(off) {
    if (off === 0) return "hoy";
    if (off === 1) return "mañana";
    var d = new Date(); d.setDate(d.getDate() + off);
    return "el " + DIAS[d.getDay()] + " " + d.getDate();
  }
  function opciones() {
    var lista = [];
    HORAS_HOY.forEach(function (h) { if (P.min(h) > P.ahora()) lista.push({ off: 0, min: P.min(h), etiqueta: "Hoy " + h }); });
    lista.push({ off: 1, min: P.min("07:00"), etiqueta: "Mañana 07:00" });
    [2, 3].forEach(function (o) {
      var d = new Date(); d.setDate(d.getDate() + o);
      lista.push({ off: o, min: P.min("07:00"), etiqueta: DIAS[d.getDay()].charAt(0).toUpperCase() + DIAS[d.getDay()].slice(1) + " " + d.getDate() + ", 07:00" });
    });
    return lista;
  }
  /* el encargo mas exigente del pedido (24 o 48 h) */
  function encargoMayor() {
    var mejor = null;
    orden.forEach(function (id) { var p = P.catalogo[id]; if (p.enc && (!mejor || p.enc > mejor.enc)) mejor = p; });
    return mejor;
  }
  function permitida(o) {
    var e = encargoMayor();
    return !e || o.off * 1440 + o.min >= P.ahora() + e.enc * 60;
  }
  function textoEncargo(lista) {
    var e = encargoMayor();
    var primera = null;
    lista.forEach(function (o) { if (!primera && permitida(o)) primera = o; });
    return e.nombre + " se encarga con " + e.enc + " h. Elegí un retiro desde " + (primera ? etiquetaDia(primera.off) : "otro día") + ".";
  }
  /* una horneada que sale mas tarde que el retiro de hoy */
  function textoHorneada(o) {
    if (o.off !== 0) return "";
    var texto = "";
    orden.forEach(function (id) {
      var p = P.catalogo[id];
      if (!texto && p.hora && P.min(p.hora) > o.min) texto = p.nombre + " sale a las " + p.hora + ". Elegí un retiro después.";
    });
    return texto;
  }
  function mostrarErrorHora(texto) {
    errorTxt.textContent = texto;
    errorHora.hidden = !texto;
  }

  function pintarHoras() {
    horas.textContent = "";
    var todas = opciones();
    var lista = todas.filter(permitida);   /* regla de encargo: sin chips anteriores a la anticipacion */
    if (retiro && !lista.some(function (o) { return o.etiqueta === retiro.etiqueta; })) {
      retiro = null;
      if (encargoMayor()) mostrarErrorHora(textoEncargo(todas));
    }
    lista.forEach(function (o) {
      var b = P.el("button", "ficha-btn", o.etiqueta);
      b.type = "button";
      b.setAttribute("aria-pressed", retiro && retiro.etiqueta === o.etiqueta ? "true" : "false");
      b.addEventListener("click", function () {
        var h = textoHorneada(o);
        if (h) { mostrarErrorHora(h); return; }
        retiro = o;
        mostrarErrorHora("");
        Array.prototype.forEach.call(horas.children, function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      });
      horas.appendChild(b);
    });
  }

  /* ---------- hoja "Mi pedido" ---------- */
  function control(id) {
    var caja = P.el("div", "cantidad__control");
    var menos = P.el("button", "cantidad__btn"); menos.type = "button"; menos.setAttribute("aria-label", "Quitar uno de " + P.catalogo[id].nombre); menos.setAttribute("data-acc", "menos-" + id); menos.appendChild(P.icono("minus"));
    var num = P.el("output", "cantidad__num", String(items[id]));
    var mas = P.el("button", "cantidad__btn"); mas.type = "button"; mas.setAttribute("aria-label", "Sumar uno de " + P.catalogo[id].nombre); mas.setAttribute("data-acc", "mas-" + id); mas.appendChild(P.icono("plus"));
    menos.addEventListener("click", function () { cambio.hidden = false; agregar(id, -1); });
    mas.addEventListener("click", function () {
      if (cantidad(id) >= MAX) { toast("Máximo " + MAX + " por producto en esta demo."); return; }
      cambio.hidden = false; agregar(id, 1);
    });
    caja.appendChild(menos); caja.appendChild(num); caja.appendChild(mas);
    return caja;
  }

  function pintarBolsa() {
    var foco = document.activeElement && document.activeElement.getAttribute ? document.activeElement.getAttribute("data-acc") : null;
    var hay = orden.length > 0;
    vacio.hidden = hay; lleno.hidden = !hay; pie.hidden = !hay;
    lineas.textContent = "";
    orden.forEach(function (id) {
      var p = P.catalogo[id];
      var li = P.el("li", "linea");
      var info = P.el("div", "linea__info");
      info.appendChild(P.el("strong", "linea__nombre", p.nombre));
      if (p.enc) info.appendChild(P.el("span", "linea__nota", "Encargo: retiro con " + p.enc + " h"));
      li.appendChild(info);
      li.appendChild(P.el("span", "linea__precio", "Gs. " + P.gs(p.precio * items[id])));
      li.appendChild(control(id));
      var quitarB = P.el("button", "enlace", "Quitar");
      quitarB.type = "button";
      quitarB.setAttribute("aria-label", "Quitar " + p.nombre + " del pedido");
      quitarB.setAttribute("data-acc", "quitar-" + id);
      quitarB.addEventListener("click", function () { cambio.hidden = false; quitar(id); P.anunciar("Quitaste " + p.nombre + "."); });
      li.appendChild(quitarB);
      lineas.appendChild(li);
    });
    totalBolsa.textContent = P.gs(total());
    pintarHoras();
    if (foco) {
      var otro = lineas.querySelector('[data-acc="' + foco + '"]');
      if (otro) otro.focus({ preventScroll: true });
    }
  }

  P.hoja.registrar({
    dialog: dlg,
    coincide: function (h) { return h === "#pedido"; },
    alAbrir: function () { cambio.hidden = true; mostrarErrorHora(""); pintarBolsa(); return true; }
  });

  nota.addEventListener("input", function () { cont.textContent = String(nota.value.length); });

  /* enviar: pide hora de retiro; despues abre WhatsApp de Multitec con el texto fijo de la demo */
  enviar.addEventListener("click", function (e) {
    var lista = opciones();
    if (!retiro) {
      e.preventDefault();
      mostrarErrorHora("Elegí una hora de retiro.");
      var primero = horas.querySelector("button");
      if (primero) primero.focus();
      return;
    }
    var motivo = !permitida(retiro) ? textoEncargo(lista) : textoHorneada(retiro);
    if (motivo) { e.preventDefault(); retiro = null; pintarHoras(); mostrarErrorHora(motivo); }
  });

  cambiado();
})();
