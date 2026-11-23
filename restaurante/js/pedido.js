/* La Ajicera (Demo): pedido en memoria. Nada se guarda ni se envía. */
(function () {
  "use strict";
  var A = window.Ajicera;
  if (!A || !A.hoja) return;
  var MAX = 20;
  var ENVIO_INICIAL = 10000;
  var lineas = [];
  var envio = ENVIO_INICIAL;
  var oyentes = [];

  var barra = document.getElementById("barra-pedido");
  var abrirBtn = document.getElementById("abrir-pedido");
  var bpN = document.getElementById("bp-n");
  var bpTotal = document.getElementById("bp-total");
  var dialog = document.getElementById("hoja-pedido");
  var cuerpoLleno = document.getElementById("ped-lleno");
  var cuerpoVacio = document.getElementById("ped-vacio");
  var lista = document.getElementById("ped-lineas");
  var tSub = document.getElementById("ped-sub"), tEnv = document.getElementById("ped-env"), tTot = document.getElementById("ped-tot");
  var pieLleno = document.getElementById("ped-pie-lleno");

  function cantidad() { return lineas.reduce(function (s, l) { return s + l.cantidad; }, 0); }
  function subtotal() { return lineas.reduce(function (s, l) { return s + l.precio * l.cantidad; }, 0); }
  function total() { return lineas.length ? subtotal() + envio : 0; }

  A.pedido = {
    lineas: function () { return lineas; },
    cantidad: cantidad, subtotal: subtotal, total: total,
    envio: function () { return envio; },
    setEnvio: function (n) { envio = n; refrescar(); },
    vaciar: function () { lineas = []; envio = ENVIO_INICIAL; refrescar(); },
    alCambiar: function (f) { oyentes.push(f); }
  };

  function refrescar(foco) {
    var n = cantidad();
    var antes = bpN.textContent;
    bpN.textContent = String(n);
    bpTotal.textContent = A.gs(total());
    barra.hidden = n === 0;
    document.body.classList.toggle("con-barra", n > 0);
    if (String(n) !== antes && n > 0 && !A.reducido() && bpN.animate) {
      bpN.animate([{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }], { duration: 220, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
    }
    pintar(foco);
    oyentes.forEach(function (f) { f(); });
  }

  function pintar(foco) {
    var vacio = lineas.length === 0;
    cuerpoVacio.hidden = !vacio;
    cuerpoLleno.hidden = vacio;
    pieLleno.hidden = vacio;
    lista.textContent = "";
    lineas.forEach(function (l) {
      var li = A.el("li", "linea");
      li.setAttribute("data-clave", l.clave);
      var f = A.el("div", "linea__foto");
      if (l.foto) { var im = document.createElement("img"); im.src = l.foto; im.alt = ""; im.width = 56; im.height = 56; f.appendChild(im); }
      else { f.textContent = l.inicial; }
      f.setAttribute("aria-hidden", "true");
      var info = A.el("div", "linea__info");
      info.appendChild(A.el("p", "linea__nombre", l.nombre));
      var extra = [l.opcion, l.nota].filter(Boolean).join(" · ");
      if (extra) info.appendChild(A.el("p", "linea__extra", extra));
      var precio = A.el("p", "linea__precio num", "Gs. " + A.gs(l.precio * l.cantidad));
      var ctl = A.el("div", "linea__ctl");
      var menos = A.el("button", "cantidad__btn");
      menos.type = "button"; menos.setAttribute("aria-label", "Quitar uno de " + l.nombre); menos.setAttribute("data-accion", "menos");
      menos.appendChild(A.icono("minus")); menos.disabled = l.cantidad <= 1;
      var num = A.el("span", "linea__num num", "x" + l.cantidad);
      var mas = A.el("button", "cantidad__btn");
      mas.type = "button"; mas.setAttribute("aria-label", "Sumar uno de " + l.nombre); mas.setAttribute("data-accion", "mas");
      mas.appendChild(A.icono("plus")); mas.disabled = l.cantidad >= MAX;
      var quitar = A.el("button", "linea__quitar");
      quitar.type = "button"; quitar.setAttribute("data-accion", "quitar");
      quitar.setAttribute("aria-label", "Quitar " + l.nombre + " del pedido");
      quitar.appendChild(A.icono("trash")); quitar.appendChild(A.el("span", null, "Quitar"));
      ctl.appendChild(menos); ctl.appendChild(num); ctl.appendChild(mas);
      li.appendChild(f); li.appendChild(info); li.appendChild(precio); li.appendChild(ctl); li.appendChild(quitar);
      lista.appendChild(li);
    });
    tSub.textContent = "Gs. " + A.gs(subtotal());
    tEnv.textContent = "Gs. " + A.gs(envio);
    tTot.textContent = "Gs. " + A.gs(total());
    if (foco) {
      var b = lista.querySelector('[data-clave="' + foco.clave + '"] [data-accion="' + foco.accion + '"]');
      if (b && !b.disabled) b.focus();
      else {
        var otro = lista.querySelector('[data-clave="' + foco.clave + '"] [data-accion]:not([disabled])');
        if (otro) otro.focus();
      }
    }
  }

  function volar(origen, d) {
    var destino = abrirBtn.querySelector(".icono");
    if (!origen || !destino || A.reducido() || !origen.animate) return;
    var a = origen.getBoundingClientRect(), b = destino.getBoundingClientRect();
    if (!a.width || !b.width) return;
    var lado = 40;
    var nodo = A.el("div", "vuelo");
    nodo.setAttribute("aria-hidden", "true");
    if (d.foto) { var im = document.createElement("img"); im.src = d.foto; im.alt = ""; nodo.appendChild(im); }
    else { nodo.textContent = d.inicial; }
    nodo.style.left = (a.left + a.width / 2 - lado / 2) + "px";
    nodo.style.top = (a.top + a.height / 2 - lado / 2) + "px";
    document.body.appendChild(nodo);
    var dx = (b.left + b.width / 2) - (a.left + a.width / 2);
    var dy = (b.top + b.height / 2) - (a.top + a.height / 2);
    var anim = nodo.animate(
      [{ transform: "translate(0, 0) scale(1)", opacity: 1 }, { transform: "translate(" + dx + "px, " + dy + "px) scale(0.45)", opacity: 0.85 }],
      { duration: 350, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
    anim.onfinish = function () { nodo.remove(); };
    anim.oncancel = function () { nodo.remove(); };
  }

  document.addEventListener("ajicera:agregar", function (e) {
    var d = e.detail;
    var clave = [d.id, d.opcion, d.nota].join("|");
    var l = lineas.filter(function (x) { return x.clave === clave; })[0];
    var tope = false;
    if (l) {
      if (l.cantidad + d.cantidad > MAX) { l.cantidad = MAX; tope = true; } else { l.cantidad += d.cantidad; }
    } else {
      l = { clave: clave, id: d.id, nombre: d.nombre, precio: d.precio, cantidad: Math.min(d.cantidad, MAX), opcion: d.opcion, nota: d.nota, foto: d.foto, inicial: d.inicial };
      lineas.push(l);
    }
    refrescar();
    volar(d.origen || document.getElementById("det-agregar"), d);
    A.anunciar(tope ? "Máximo 20 por plato en esta demo." : "Agregaste " + d.nombre + ", " + l.cantidad + ".");
  });

  lista.addEventListener("click", function (e) {
    var b = e.target.closest("[data-accion]");
    if (!b) return;
    var clave = b.closest(".linea").getAttribute("data-clave");
    var l = lineas.filter(function (x) { return x.clave === clave; })[0];
    if (!l) return;
    var accion = b.getAttribute("data-accion");
    if (accion === "mas" && l.cantidad < MAX) l.cantidad++;
    else if (accion === "menos" && l.cantidad > 1) l.cantidad--;
    else if (accion === "quitar") {
      lineas = lineas.filter(function (x) { return x !== l; });
      A.anunciar("Quitaste " + l.nombre + ".");
      refrescar();
      if (!lineas.length) { var v = document.getElementById("ped-volver"); if (v) v.focus(); }
      return;
    }
    refrescar({ clave: clave, accion: accion });
  });

  abrirBtn.addEventListener("click", function () { A.hoja.ir("#pedido", abrirBtn); });
  document.getElementById("ped-continuar").addEventListener("click", function () { A.hoja.ir("#datos", abrirBtn); });
  document.getElementById("ped-volver").addEventListener("click", function () { A.hoja.cerrar(); });

  A.hoja.registrar({
    dialog: dialog,
    coincide: function (h) { return h === "#pedido"; },
    alAbrir: function () { pintar(); return true; }
  });

  refrescar();
})();
