/* Taller Aviso (Demo): la orden de trabajo. Casillas, dos campos libres, panel "Tu orden" y el mensaje a Multitec.
   El mensaje lleva SOLO los servicios marcados ("(servicios: ...)"). Lo que la persona escribe en "Que auto es" y "Que le pasa"
   queda en pantalla y NUNCA viaja. Nada se guarda ni se envia. Texto del usuario siempre con textContent. */
(function () {
  "use strict";
  var A = window.Aviso = window.Aviso || {};
  var form = document.querySelector("[data-orden]");
  if (!form) return;

  var cajas = Array.prototype.slice.call(form.querySelectorAll("input[name=servicio]"));
  var fieldset = form.querySelector("fieldset.servicios");
  var contador = form.querySelector("[data-contador]");
  var errServ = form.querySelector("[data-error-serv]");
  var campoAuto = document.getElementById("auto");
  var campoPasa = document.getElementById("pasa");
  var errAuto = form.querySelector("[data-error-auto]");
  var errPasa = form.querySelector("[data-error-pasa]");
  var cuenta = form.querySelector("[data-cuenta]");
  var pAuto = document.querySelector("[data-p-auto]");
  var pServ = document.querySelector("[data-p-serv]");
  var pPasa = document.querySelector("[data-p-pasa]");
  var enviar = document.querySelector("[data-enviar]");
  var ayuda = document.querySelector("[data-ayuda]");
  var resultado = document.querySelector("[data-resultado]");
  var falla = document.querySelector("[data-falla]");
  var mensajeEl = document.querySelector("[data-mensaje]");
  var copiar = document.querySelector("[data-copiar]");
  var MAX_AUTO = A.CONFIG.MAX_AUTO, MAX_PASA = A.CONFIG.MAX_PASA;

  function marcados() {
    var n = [];
    cajas.forEach(function (c) { if (c.checked) n.push(c.value); });
    return n;
  }

  function textoContador(n) {
    if (n === 0) return "Todavía no marcaste ninguno.";
    return n === 1 ? "Marcaste 1 servicio." : "Marcaste " + n + " servicios.";
  }

  function limpiarResultado() {
    resultado.textContent = "";
    falla.hidden = true;
  }

  function pintarPanel() {
    var n = marcados();
    var a = campoAuto.value.trim();
    var p = campoPasa.value.trim();
    pAuto.textContent = a || "sin completar";
    pServ.textContent = n.length ? A.unir(n) : "ninguno marcado";
    pPasa.textContent = p || "sin completar";
  }

  /* el boton queda siempre a mano (aria-disabled, no disabled): sin servicio explica por que no avanza */
  function pintarBoton() {
    var hay = marcados().length > 0;
    if (hay) {
      enviar.removeAttribute("aria-disabled");
      enviar.setAttribute("href", A.urlWa(marcados()));
    } else {
      enviar.setAttribute("aria-disabled", "true");
      enviar.setAttribute("href", A.urlWa([]));
    }
    ayuda.hidden = hay;
  }

  function alCambiarServicio() {
    cajas.forEach(function (c) {
      var fila = c.closest(".casilla");
      var nombre = c.value;
      if (fila) fila.classList.toggle("casilla--marcada", c.checked);
      c.setAttribute("aria-label", c.checked ? nombre + ", marcado" : "Marcar " + nombre);
    });
    var n = marcados().length;
    contador.textContent = textoContador(n);
    if (n > 0) { errServ.hidden = true; fieldset.removeAttribute("aria-describedby"); }
    limpiarResultado();
    pintarPanel();
    pintarBoton();
  }

  function mostrarError(el, campo, texto) {
    var span = el.querySelector("span");
    if (texto) {
      span.textContent = texto;
      el.hidden = false;
      campo.setAttribute("aria-invalid", "true");
    } else {
      span.textContent = "";
      el.hidden = true;
      campo.removeAttribute("aria-invalid");
    }
  }

  /* final = al salir del campo o al enviar (los espacios solos se avisan recien ahi; el largo, apenas se pasa) */
  function validarAuto(final) {
    var largo = campoAuto.value.length;
    var vacio = campoAuto.value.trim() === "";
    if (largo > MAX_AUTO) { mostrarError(errAuto, campoAuto, "Escribí solo el auto. Máximo " + MAX_AUTO + " caracteres."); return false; }
    if (final && largo > 0 && vacio) { mostrarError(errAuto, campoAuto, "Escribí algo o dejalo vacío."); return false; }
    mostrarError(errAuto, campoAuto, "");
    return true;
  }
  function validarPasa(final) {
    var largo = campoPasa.value.length;
    var vacio = campoPasa.value.trim() === "";
    cuenta.textContent = largo + " de " + MAX_PASA;
    cuenta.classList.toggle("sobre", largo > MAX_PASA);
    if (largo > MAX_PASA) { var sobra = largo - MAX_PASA; mostrarError(errPasa, campoPasa, "Te pasaste por " + sobra + (sobra === 1 ? " carácter" : " caracteres") + ". Acortá un poco."); return false; }
    if (final && largo > 0 && vacio) { mostrarError(errPasa, campoPasa, "Escribí algo o dejalo vacío."); return false; }
    mostrarError(errPasa, campoPasa, "");
    return true;
  }

  cajas.forEach(function (c) { c.addEventListener("change", alCambiarServicio); });
  campoAuto.addEventListener("input", function () { validarAuto(false); pintarPanel(); limpiarResultado(); });
  campoAuto.addEventListener("blur", function () { validarAuto(true); });
  campoPasa.addEventListener("input", function () { validarPasa(false); pintarPanel(); limpiarResultado(); });
  campoPasa.addEventListener("blur", function () { validarPasa(true); });
  form.addEventListener("submit", function (e) { e.preventDefault(); });

  enviar.addEventListener("click", function (e) {
    e.preventDefault();
    var n = marcados();
    limpiarResultado();
    if (!n.length) {
      errServ.hidden = false;
      fieldset.setAttribute("aria-describedby", "error-serv");
      cajas[0].focus();
      A.anunciar("Marcá al menos un servicio.");
      return;
    }
    var okAuto = validarAuto(true);
    var okPasa = validarPasa(true);
    if (!okAuto) { campoAuto.focus(); return; }
    if (!okPasa) { campoPasa.focus(); return; }
    var ventana = null;
    if (A.estado !== "bloqueado") {   /* ?estado=bloqueado simula el bloqueo de ventanas para ver el error */
      try { ventana = window.open(A.urlWa(n), "_blank"); } catch (x) { ventana = null; }
    }
    if (ventana) {
      try { ventana.opener = null; } catch (x2) { /* nada: ya es otra pagina */ }
      resultado.textContent = "Abrimos WhatsApp. Es una demo: el taller no recibió tu orden.";
    } else {
      mensajeEl.textContent = A.mensaje(n);
      falla.hidden = false;
    }
  });

  function copiarTexto(texto) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(texto);
    }
    return new Promise(function (ok, no) {
      var t = A.el("textarea");
      t.value = texto;
      t.setAttribute("readonly", "");
      t.className = "sr";
      document.body.appendChild(t);
      t.select();
      var bien = false;
      try { bien = document.execCommand("copy"); } catch (x) { bien = false; }
      document.body.removeChild(t);
      if (bien) ok(); else no();
    });
  }
  copiar.addEventListener("click", function () {
    copiarTexto(mensajeEl.textContent).then(function () {
      resultado.textContent = "Mensaje copiado.";
    }, function () { /* sin permiso: el mensaje queda a la vista para copiarlo a mano */ });
  });

  /* el navegador puede devolver las casillas marcadas al recargar: se lee el estado real */
  alCambiarServicio();
  validarAuto(false);
  validarPasa(false);
})();
