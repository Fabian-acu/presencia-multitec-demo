/* El Filo (Demo): el ticket (lineas, total, retiro o envio, validacion). Nada se guarda ni se envia:
   el boton abre el WhatsApp de Multitec con un texto fijo; el ticket queda solo en pantalla. */
(function () {
  "use strict";
  var F = window.Filo = window.Filo || {};
  var el = F.el;
  var ENVIO = 15000;
  var ZONAS = { centro: [50, 50], norte: [58, 24], sur: [40, 78] };

  var d = document.getElementById("d-ticket");
  var lis = d.querySelector("[data-lineas]");
  var vacio = d.querySelector("[data-vacio]");
  var lleno = d.querySelector("[data-lleno]");
  var tKg = d.querySelector("[data-t-kg]");
  var tGs = d.querySelector("[data-t-gs]");
  var tFin = d.querySelector("[data-t-fin]");
  var modoLinea = d.querySelector("[data-modo-linea]");
  var cambio = d.querySelector("[data-cambio]");
  var form = d.querySelector("[data-form]");
  var nota = document.getElementById("f-nota");
  var cont = d.querySelector("[data-cont]");
  var zona = document.getElementById("f-zona");
  var nombre = document.getElementById("f-nombre");
  var tel = document.getElementById("f-tel");
  var bRetiro = d.querySelector("[data-bloque-retiro]");
  var bEnvio = d.querySelector("[data-bloque-envio]");
  var horas = d.querySelector("[data-horas]");
  var limite = d.querySelector("[data-limite]");
  var mini = d.querySelector("[data-minimapa]");
  var pin = d.querySelector(".pin--m");
  var enviar = d.querySelector("[data-enviar]");
  var barraBtn = document.querySelector("[data-abrir-ticket]");
  var bN = barraBtn.querySelector("[data-n]");
  var bTotal = barraBtn.querySelector("[data-total]");
  var nodos = {};          /* id -> { li, k, g, c } */
  var tocado = false;      /* el usuario ya empezo a completar datos */
  var volverACortes = false;

  function modo() { var r = d.querySelector('input[name="modo"]:checked'); return r ? r.value : ""; }
  function envioGs() { return modo() === "envio" ? ENVIO : 0; }

  /* ---------- barra ---------- */
  function barra(antes) {
    var n = F.carro.cuenta();
    var t = F.carro.total();
    barraBtn.classList.toggle("lleno", n > 0);
    bN.hidden = n === 0;
    bTotal.hidden = n === 0;
    if (n > 0) {
      bN.textContent = "(" + n + ")";
      F.rodar(bTotal, "Gs. " + F.gs(t), t >= (barra.ult || 0));
    }
    barra.ult = t;
    barraBtn.setAttribute("aria-label", n > 0 ? "Ver ticket, " + n + (n === 1 ? " corte" : " cortes") + ", Gs. " + F.gs(t) : "Ver ticket");
  }

  /* ---------- lineas ---------- */
  function crearLinea(id, i) {
    var c = F.cat[id];
    var li = el("li", "l imprime");
    li.style.setProperty("--i", String(i || 0));
    var n = el("span", "l__n", c.nombre.toUpperCase());
    var k = el("span", "l__k");
    var g = el("span", "l__g");
    li.appendChild(n); li.appendChild(k); li.appendChild(g);
    var cc = el("span", "l__c");
    li.appendChild(cc);
    var acc = el("div", "l__acc");
    var menos = el("button", "l__b");
    menos.type = "button"; menos.setAttribute("aria-label", "Quitar 0,5 kg de " + c.nombre);
    menos.appendChild(F.icono("minus"));
    menos.addEventListener("click", function () { F.carro.sumar(id, -F.carro.PASO); });
    var mas = el("button", "l__b");
    mas.type = "button"; mas.setAttribute("aria-label", "Sumar 0,5 kg de " + c.nombre);
    mas.appendChild(F.icono("plus"));
    mas.addEventListener("click", function () {
      if (F.carro.kgDe(id) >= F.carro.MAX) { F.anunciar("Máximo 20 kg por corte en esta demo."); return; }
      F.carro.sumar(id, F.carro.PASO);
    });
    var q = el("button", "l__b l__b--q", "Quitar");
    q.type = "button"; q.setAttribute("aria-label", "Quitar " + c.nombre + " del ticket");
    q.addEventListener("click", function () { F.carro.fijar(id, 0); F.anunciar(c.nombre + " salió del ticket."); });
    acc.appendChild(menos); acc.appendChild(mas); acc.appendChild(q);
    li.appendChild(acc);
    li.addEventListener("animationend", function () { li.classList.remove("imprime"); });
    nodos[id] = { li: li, k: k, g: g, c: cc, mas: mas };
    return nodos[id];
  }

  function pintarLinea(id, sube) {
    var o = nodos[id];
    var kg = F.carro.kgDe(id);
    F.rodar(o.k, F.kg(kg) + " kg", sube !== false);
    F.rodar(o.g, F.gs(F.carro.subtotal(id)), sube !== false);
    var corte = F.carro.corteDe(id);
    o.c.textContent = corte ? "Cortado: " + corte : "";
    o.c.hidden = !corte;
    if (kg >= F.carro.MAX) o.mas.setAttribute("aria-disabled", "true"); else o.mas.removeAttribute("aria-disabled");
  }

  function totales() {
    var n = F.carro.cuenta();
    vacio.hidden = n > 0;
    lleno.hidden = n === 0;
    F.rodar(tKg, F.kg(F.carro.kgTotal()) + " kg", true);
    F.rodar(tGs, F.gs(F.carro.total()), true);
    F.rodar(tFin, "Gs. " + F.gs(F.carro.total() + envioGs()), true);
    modoLinea.textContent = modo() === "envio" ? "Envío (Demo): Gs. 15.000" : modo() === "retiro" ? "Retiro en el local" : "";
    modoLinea.hidden = !modo();
  }

  F.carro.alCambiar(function (id, antes) {
    var kg = F.carro.kgDe(id);
    var o = nodos[id];
    if (kg <= 0) {
      if (o) { o.li.remove(); delete nodos[id]; }
    } else {
      if (!o) {
        o = crearLinea(id, 0);
        lis.appendChild(o.li);
        o.k.textContent = ""; o.g.textContent = "";
      }
      pintarLinea(id, kg > antes);
    }
    totales();
    barra(antes);
    if (tocado && d.open) { cambio.hidden = false; }
  });

  /* ---------- horas de retiro (la hora limite se calcula con el reloj o con ?hora=) ---------- */
  function armarHoras() {
    var ahora = F.ahora();
    var lista = [];
    if (ahora < 17 * 60) lista.push("Hoy 17:00");
    lista.push("Mañana 08:00", "Mañana 10:00", "Mañana 12:00");
    horas.textContent = "";
    lista.forEach(function (t) {
      var l = el("label", "chip-r");
      var i = el("input");
      i.type = "radio"; i.name = "hora"; i.value = t;
      l.appendChild(i); l.appendChild(el("span", null, t));
      horas.appendChild(l);
    });
    limite.hidden = ahora < 18 * 60;
  }

  function fecha() {
    var n = new Date();
    function z(x) { return (x < 10 ? "0" : "") + x; }
    return z(n.getDate()) + "/" + z(n.getMonth() + 1) + "/" + n.getFullYear() + " " + z(n.getHours()) + ":" + z(n.getMinutes());
  }

  /* ---------- formulario ---------- */
  function errorDe(sufijo, hay, campo) {
    var p = d.querySelector("[data-error-" + sufijo + "]");
    p.hidden = !hay;
    if (campo) { if (hay) campo.setAttribute("aria-invalid", "true"); else campo.removeAttribute("aria-invalid"); }
    return hay;
  }
  function validar() {
    var primero = null;
    function marcar(hay, campo) { if (hay && !primero) primero = campo; }
    var m = modo();
    var sinModo = errorDe("modo", !m);
    marcar(sinModo, d.querySelector('input[name="modo"]'));
    var sinHora = errorDe("hora", m === "retiro" && !d.querySelector('input[name="hora"]:checked'));
    marcar(sinHora, d.querySelector('input[name="hora"]'));
    var sinZona = errorDe("zona", m === "envio" && !zona.value, zona);
    marcar(sinZona, zona);
    var sinNombre = errorDe("nombre", !nombre.value.trim(), nombre);
    marcar(sinNombre, nombre);
    var t = tel.value.replace(/[\s-]/g, "");
    var malTel = errorDe("tel", !/^\+?\d{6,15}$/.test(t), tel);
    marcar(malTel, tel);
    return primero;
  }

  Array.prototype.forEach.call(d.querySelectorAll('input[name="modo"]'), function (r) {
    r.addEventListener("change", function () {
      tocado = true;
      bRetiro.hidden = modo() !== "retiro";
      bEnvio.hidden = modo() !== "envio";
      errorDe("modo", false);
      totales();
    });
  });
  horas.addEventListener("change", function () { tocado = true; errorDe("hora", false); });
  zona.addEventListener("change", function () {
    tocado = true;
    var p = ZONAS[zona.value];
    if (p) { mini.style.setProperty("--px", String(p[0])); mini.style.setProperty("--py", String(p[1])); }
    errorDe("zona", false, zona);
  });
  nombre.addEventListener("input", function () { tocado = true; if (nombre.value.trim()) errorDe("nombre", false, nombre); });
  tel.addEventListener("input", function () { tocado = true; });
  nota.addEventListener("input", function () { tocado = true; cont.textContent = nota.value.length + "/80"; });
  form.addEventListener("submit", function (e) { e.preventDefault(); });
  enviar.addEventListener("click", function (e) {
    var primero = validar();
    if (primero) {
      e.preventDefault();
      primero.focus();
      F.anunciar("Faltan datos en el ticket. Revisá los campos marcados.");
      return;
    }
    F.anunciar("Se abre el WhatsApp de Multitec. Es una demo: el pedido no se envía al local.");
  });
  d.querySelector("[data-volver]").addEventListener("click", function () { volverACortes = true; F.hoja.cerrar(); });
  barraBtn.addEventListener("click", function () { F.hoja.ir("#ticket", barraBtn); });

  /* ---------- hoja ---------- */
  F.hoja.registrar({
    dialog: d,
    coincide: function (h) { return h === "#ticket"; },
    alAbrir: function () {
      d.querySelector("[data-fecha]").textContent = fecha();
      armarHoras();
      tocado = false;
      cambio.hidden = true;
      /* el ticket se imprime linea por linea cuando llega la mezcla de "Armar asado" */
      var pend = F.pendienteImprimir || [];
      F.pendienteImprimir = null;
      var i = 0;
      Object.keys(nodos).forEach(function (id) {
        var l = nodos[id].li;
        if (pend.indexOf(id) >= 0) { l.style.setProperty("--i", String(i++)); l.classList.add("imprime"); }
        else l.classList.remove("imprime");
      });
      return true;
    },
    alCerrar: function () {
      if (volverACortes) {
        volverACortes = false;
        var t = document.getElementById("cocinar");
        if (t) { t.scrollIntoView({ block: "start" }); var h = t.querySelector("h2"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); } }
      }
    }
  });

  totales();
  barra();
})();
