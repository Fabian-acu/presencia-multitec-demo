/* La Ajicera (Demo): datos y entrega. Valida en pantalla; no guarda ni envía nada (sin storage, sin red). */
(function () {
  "use strict";
  var A = window.Ajicera;
  if (!A || !A.hoja || !A.pedido) return;
  var dialog = document.getElementById("hoja-datos");
  var form = document.getElementById("form-datos");
  var resumen = document.getElementById("dat-resumen");
  var nombre = document.getElementById("dat-nombre"), tel = document.getElementById("dat-tel"), zona = document.getElementById("dat-zona");
  var entrega = document.getElementById("dat-entrega");
  var aviso = document.getElementById("dat-zona-aviso");
  var totalEl = document.getElementById("dat-total");
  var pin = dialog.querySelector(".mapa-sim__pin");
  var PUNTOS = { centro: [50, 50], norte: [60, 24], sur: [40, 76] };
  var zonaPrevia = "";

  function modo() { return form.querySelector('input[name="modo"]:checked').value; }

  function error(campo, texto) {
    var p = document.getElementById("dat-" + campo + "-error");
    var c = campo === "nombre" ? nombre : campo === "tel" ? tel : zona;
    if (texto) { p.querySelector("span").textContent = texto; p.hidden = false; c.setAttribute("aria-invalid", "true"); }
    else { p.hidden = true; c.removeAttribute("aria-invalid"); }
    resumenActual();
  }

  function validarNombre() {
    var ok = nombre.value.trim().length > 0;
    error("nombre", ok ? "" : "Falta tu nombre. Escribilo para seguir.");
    return ok;
  }
  function validarTel() {
    var v = tel.value.trim();
    var digitos = v.replace(/\s/g, "");
    var ok = /^[0-9]+$/.test(digitos) && digitos.length >= 9 && digitos.length <= 12;
    error("tel", ok ? "" : "Revisá el teléfono. Ponele solo números, por ejemplo 0981 123 456.");
    return ok;
  }
  function validarZona() {
    if (modo() === "retiro") { error("zona", ""); return true; }
    var ok = zona.value !== "";
    error("zona", ok ? "" : "Falta tu zona. Elegí una de la lista.");
    return ok;
  }

  /* el resumen de arriba cuenta los campos que siguen con error y se va cuando no queda ninguno */
  function resumenActual() {
    if (resumen.hidden) return;
    var n = form.querySelectorAll('[aria-invalid="true"]').length;
    if (n === 0) { resumen.hidden = true; return; }
    resumen.querySelector("span").textContent = "Faltan " + n + (n === 1 ? " dato" : " datos") + " para seguir.";
  }

  function actualizarTotales() {
    totalEl.textContent = "Gs. " + A.gs(A.pedido.total());
  }

  function aplicarModo() {
    var retiro = modo() === "retiro";
    entrega.hidden = retiro;
    if (retiro) { A.pedido.setEnvio(0); error("zona", ""); }
    else {
      var op = zona.options[zona.selectedIndex];
      A.pedido.setEnvio(op && op.getAttribute("data-envio") ? Number(op.getAttribute("data-envio")) : 10000);
    }
  }

  function moverPin() {
    var p = PUNTOS[zona.value];
    if (!p) { pin.classList.add("sin-zona"); return; }
    pin.classList.remove("sin-zona");
    pin.style.setProperty("--x", String(p[0]));
    pin.style.setProperty("--y", String(p[1]));
  }

  Array.prototype.forEach.call(form.querySelectorAll('input[name="modo"]'), function (r) { r.addEventListener("change", aplicarModo); });
  zona.addEventListener("change", function () {
    var op = zona.options[zona.selectedIndex];
    validarZona();
    moverPin();
    if (op.getAttribute("data-envio")) A.pedido.setEnvio(Number(op.getAttribute("data-envio")));
    aviso.textContent = zonaPrevia && zona.value && zona.value !== zonaPrevia ? "Cambió el envío. Revisá el total." : "";
    zonaPrevia = zona.value;
  });
  nombre.addEventListener("blur", function () { if (nombre.value) validarNombre(); });
  tel.addEventListener("blur", function () { if (tel.value) validarTel(); });
  nombre.addEventListener("input", function () { if (nombre.hasAttribute("aria-invalid")) validarNombre(); });
  tel.addEventListener("input", function () { if (tel.hasAttribute("aria-invalid")) validarTel(); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fallas = [];
    if (!validarNombre()) fallas.push(nombre);
    if (!validarTel()) fallas.push(tel);
    if (!validarZona()) fallas.push(zona);
    if (fallas.length) {
      resumen.querySelector("span").textContent = "Faltan " + fallas.length + (fallas.length === 1 ? " dato" : " datos") + " para seguir.";
      resumen.hidden = false;
      fallas[0].focus();
      return;
    }
    resumen.hidden = true;
    var op = zona.options[zona.selectedIndex];
    /* solo se guarda en memoria lo que necesita el seguimiento: nunca nombre ni teléfono */
    A.entrega = {
      modo: modo(),
      zona: modo() === "delivery" ? op.textContent.split(" · ")[0] : "",
      pago: form.querySelector('input[name="pago"]:checked').value === "efectivo" ? "Efectivo al recibir" : "Transferencia"
    };
    document.dispatchEvent(new CustomEvent("ajicera:enviado"));
    A.hoja.ir("#seguimiento", document.getElementById("abrir-pedido"));
  });

  A.checkout = {
    reiniciar: function () {
      form.reset();
      ["nombre", "tel", "zona"].forEach(function (c) { error(c, ""); });
      resumen.hidden = true; aviso.textContent = ""; zonaPrevia = "";
      entrega.hidden = false; moverPin();
    }
  };

  A.hoja.registrar({
    dialog: dialog,
    coincide: function (h) { return h === "#datos"; },
    alAbrir: function () {
      if (!A.pedido.lineas().length) return false;
      aplicarModo(); moverPin(); actualizarTotales();
      return true;
    }
  });
  A.pedido.alCambiar(actualizarTotales);
  moverPin();
})();
