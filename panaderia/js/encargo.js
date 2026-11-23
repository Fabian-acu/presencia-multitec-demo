/* La Primera Hornada (Demo): "Encargar una torta", 3 pasos en una sola pantalla con resumen en vivo.
   Los dias se calculan con la fecha del celular, desde 48 h adelante. Nada se guarda ni se envia: el boton abre WhatsApp de Multitec. */
(function () {
  "use strict";
  var P = window.Primera;
  if (!P || !P.hoja) return;
  var dlg = document.getElementById("d-encargo");
  if (!dlg) return;
  var DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  var q = function (s) { return dlg.querySelector(s); };
  var diasCaja = q("[data-e-dias]"), desde = q("[data-e-desde]"), resumen = q("[data-e-resumen]");
  var algo = document.getElementById("e-algo"), cont = q("[data-e-cont]"), enviar = q("[data-e-enviar]");
  var INICIAL = resumen.textContent;
  var etiqueta = {};   /* desplazamiento en dias -> "vie 25" */
  var HORAS = ["10:00", "12:00", "16:00", "18:00"];
  var ANTICIPO = 48 * 60;

  /* una combinacion dia + hora vale si queda al menos 48 h desde ahora (reloj real o ?hora=) */
  function valida(off, hhmm) { return off * 1440 + P.min(hhmm) >= P.ahora() + ANTICIPO; }

  function construirDias() {
    var previo = marcado("dia") ? +marcado("dia").value : null;
    diasCaja.textContent = "";
    var hoy = new Date(), primero = null;
    for (var off = 2; off <= 10; off++) {
      var hayHora = HORAS.some(function (h) { return valida(off, h); });
      if (!hayHora) continue;
      var d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + off);
      var texto = DIAS[d.getDay()] + " " + d.getDate();
      etiqueta[off] = texto;
      if (primero === null) primero = texto;
      if (diasCaja.children.length >= 7) continue;
      var l = P.el("label", "ficha");
      var r = document.createElement("input");
      r.type = "radio"; r.name = "dia"; r.value = String(off);
      if (previo === off) r.checked = true;
      l.appendChild(r); l.appendChild(P.el("span", null, texto.charAt(0).toUpperCase() + texto.slice(1)));
      diasCaja.appendChild(l);
    }
    desde.textContent = primero || "--";
    pintarHoras();
  }

  /* las horas que no cumplen las 48 h con el dia elegido se desactivan (y se desmarcan) */
  function pintarHoras() {
    var dia = marcado("dia");
    Array.prototype.forEach.call(dlg.querySelectorAll('input[name="hora"]'), function (r) {
      var ok = !dia || valida(+dia.value, r.value);
      r.disabled = !ok;
      if (!ok && r.checked) r.checked = false;
    });
  }

  /* precios por sabor: la de chocolate parte de un precio menor (el de su ficha) */
  function pintarPrecios() {
    var sab = marcado("sabor"), choco = sab && sab.value === "Chocolate";
    Array.prototype.forEach.call(dlg.querySelectorAll('input[name="porciones"]'), function (r) {
      var precio = choco ? +r.getAttribute("data-pc") : +r.getAttribute("data-precio");
      r.setAttribute("data-actual", String(precio));
      r.nextElementSibling.textContent = r.value + " · Gs. " + P.gs(precio);
    });
  }

  function marcado(nombre) { return dlg.querySelector('input[name="' + nombre + '"]:checked'); }
  function error(clave, mostrar) {
    var e = dlg.querySelector('[data-e-error="' + clave + '"]');
    if (e) e.hidden = !mostrar;
  }

  function pintarResumen() {
    var por = marcado("porciones"), sab = marcado("sabor"), dia = marcado("dia"), hora = marcado("hora");
    if (!por && !sab && !dia && !hora) { resumen.textContent = INICIAL; return; }
    var t = "Torta";
    if (por) t += " de " + por.value + " porciones";
    if (sab) t += (por ? ", " : ", ") + sab.value.charAt(0).toLowerCase() + sab.value.slice(1);
    t += ".";
    if (dia || hora) {
      t += " Retiro" + (dia ? " el " + etiqueta[+dia.value] : "") + (hora ? " a las " + hora.value : "") + ".";
    }
    if (por) t += " Total de ejemplo: Gs. " + P.gs(+por.getAttribute("data-actual")) + ".";
    resumen.textContent = t;
  }

  dlg.addEventListener("change", function (e) {
    var n = e.target && e.target.name;
    if (n === "porciones") error("porciones", false);
    else if (n === "sabor") error("sabor", false);
    else if (n === "dia") error("dia", false);
    else if (n === "hora") error("hora", false);
    if (n === "dia") pintarHoras();
    if (n === "sabor") pintarPrecios();
    pintarResumen();
  });
  algo.addEventListener("input", function () { cont.textContent = String(algo.value.length); });

  /* consultar: si falta algo, errores bajo cada campo y el foco al primero; si no, abre WhatsApp de Multitec */
  enviar.addEventListener("click", function (e) {
    var faltan = [];
    if (!marcado("porciones")) faltan.push(["porciones", 'input[name="porciones"]']);
    if (!marcado("sabor")) faltan.push(["sabor", 'input[name="sabor"]']);
    if (!marcado("dia")) faltan.push(["dia", 'input[name="dia"]']);
    if (!marcado("hora")) faltan.push(["hora", 'input[name="hora"]']);
    ["porciones", "sabor", "dia", "hora"].forEach(function (k) { error(k, false); });
    if (!faltan.length) return;
    e.preventDefault();
    faltan.forEach(function (f) { error(f[0], true); });
    var primero = dlg.querySelector(faltan[0][1]);
    if (primero) primero.focus();
    P.anunciar("Falta elegir: " + faltan.map(function (f) { return f[0] === "dia" ? "día" : f[0]; }).join(", ") + ".");
  });

  construirDias();
  pintarPrecios();

  P.hoja.registrar({
    dialog: dlg,
    coincide: function (h) { return h === "#encargo"; },
    alAbrir: function () {
      construirDias();
      pintarPrecios();
      /* desde "Torta de chocolate" llega con el sabor elegido (se puede cambiar) */
      if (P.sabor) {
        var r = dlg.querySelector('input[name="sabor"][value="' + P.sabor + '"]');
        if (r) { r.checked = true; error("sabor", false); pintarPrecios(); pintarResumen(); }
        P.sabor = null;
      }
      return true;
    }
  });
})();
