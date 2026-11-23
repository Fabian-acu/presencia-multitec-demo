/* La Ajicera (Demo): reservar mesa. Arma el mensaje de WhatsApp a Multitec; no reserva ni guarda nada. */
(function () {
  "use strict";
  var A = window.Ajicera;
  if (!A || !A.hoja) return;
  var NUMERO = "595981601211"; /* línea de Multitec (ficha del cliente) */
  var HORAS = ["12:00", "12:30", "13:00", "20:00", "20:30", "21:00"];
  var DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  var MAX = 12;
  var dialog = document.getElementById("hoja-reserva");
  var form = document.getElementById("form-reserva");
  var diasEl = document.getElementById("res-dias"), horasEl = document.getElementById("res-horas");
  var menos = document.getElementById("res-menos"), mas = document.getElementById("res-mas"), nEl = document.getElementById("res-n");
  var grupos = document.getElementById("res-grupos"), sinHoras = document.getElementById("res-sin-horas");
  var nombre = document.getElementById("res-nombre");
  var resumen = document.getElementById("res-resumen");
  var personas = 2;

  function campoError(id, mostrar) { document.getElementById(id).hidden = !mostrar; }

  function pintarDias() {
    diasEl.textContent = "";
    var hoy = new Date();
    for (var i = 0; i < 7; i++) {
      var d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i);
      var etiqueta = i === 0 ? "Hoy" : i === 1 ? "Mañana" : DIAS[d.getDay()] + " " + d.getDate();
      var l = A.el("label", "ficha"), r = document.createElement("input");
      r.type = "radio"; r.name = "dia"; r.value = etiqueta; r.setAttribute("data-offset", String(i));
      r.addEventListener("change", function () { campoError("res-dia-error", false); pintarHoras(); });
      l.appendChild(r); l.appendChild(A.el("span", null, etiqueta));
      diasEl.appendChild(l);
    }
  }

  function pintarHoras() {
    var elegido = form.querySelector('input[name="hora"]:checked');
    var previa = elegido ? elegido.value : "";
    var dia = form.querySelector('input[name="dia"]:checked');
    var esHoy = dia && dia.getAttribute("data-offset") === "0";
    var ahora = new Date();
    var minutos = ahora.getHours() * 60 + ahora.getMinutes();
    horasEl.textContent = "";
    var libres = 0;
    HORAS.forEach(function (h) {
      var m = Number(h.slice(0, 2)) * 60 + Number(h.slice(3));
      var pasada = esHoy && m <= minutos;
      var l = A.el("label", "ficha"), r = document.createElement("input");
      r.type = "radio"; r.name = "hora"; r.value = h; r.disabled = pasada;
      if (!pasada) libres++;
      if (h === previa && !pasada) r.checked = true;
      r.addEventListener("change", function () { campoError("res-hora-error", false); });
      l.appendChild(r); l.appendChild(A.el("span", null, h));
      horasEl.appendChild(l);
    });
    sinHoras.hidden = !(esHoy && libres === 0);
  }

  function pintarPersonas(dir) {
    var span = nEl.querySelector("span");
    span.textContent = String(personas);
    if (dir && !A.reducido() && span.animate) {
      span.animate([{ transform: "translateY(" + (dir * 14) + "px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }], { duration: 160, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
    }
    menos.disabled = personas <= 1;
  }
  menos.addEventListener("click", function () { if (personas > 1) { personas--; grupos.hidden = true; pintarPersonas(1); } });
  mas.addEventListener("click", function () {
    if (personas >= MAX) { grupos.hidden = false; return; }
    personas++; pintarPersonas(-1);
  });
  nombre.addEventListener("input", function () { if (nombre.value.trim()) { campoError("res-nombre-error", false); nombre.removeAttribute("aria-invalid"); } });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var dia = form.querySelector('input[name="dia"]:checked');
    var hora = form.querySelector('input[name="hora"]:checked');
    var quien = nombre.value.trim();
    var fallas = [];
    campoError("res-dia-error", !dia); if (!dia) fallas.push(diasEl.querySelector("input"));
    campoError("res-hora-error", !hora); if (!hora) fallas.push(horasEl.querySelector("input:not([disabled])") || horasEl.querySelector("input"));
    campoError("res-nombre-error", !quien);
    if (!quien) { nombre.setAttribute("aria-invalid", "true"); fallas.push(nombre); }
    if (fallas.length) {
      resumen.querySelector("span").textContent = "Faltan " + fallas.length + (fallas.length === 1 ? " dato" : " datos") + " para seguir.";
      resumen.hidden = false;
      fallas[0].focus();
      return;
    }
    resumen.hidden = true;
    var texto = "Hola, vi la demo de La Ajicera y quiero una web así. " + dia.value + ", " + hora.value + ", " +
      personas + (personas === 1 ? " persona" : " personas") + ", " + quien + ".";
    window.open("https://wa.me/" + NUMERO + "?text=" + encodeURIComponent(texto), "_blank", "noopener");
  });

  /* "Reservar mesa" del hero: abre la hoja por hash (Atrás la cierra) */
  Array.prototype.forEach.call(document.querySelectorAll('[data-accion="reservar"]'), function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); A.hoja.ir("#reserva", a); });
  });

  A.hoja.registrar({
    dialog: dialog,
    coincide: function (h) { return h === "#reserva"; },
    alAbrir: function () {
      pintarDias(); pintarHoras(); personas = 2; pintarPersonas(0);
      grupos.hidden = true; resumen.hidden = true; nombre.value = ""; nombre.removeAttribute("aria-invalid");
      ["res-dia-error", "res-hora-error", "res-nombre-error"].forEach(function (id) { campoError(id, false); });
      return true;
    }
  });
})();
