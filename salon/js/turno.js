/* Tono Vivo (Demo): Arma tu turno (servicio, con quien, dia y hora) y la hoja "Revisa tu turno".
   El turno NO se guarda ni se envia: el unico boton que sale de la pagina abre WhatsApp de Multitec con servicio y tono.
   Dias y horas son de ejemplo (martes a sabado, 6 horarios; algunos "ocupados" parejos para el mismo dia, persona y hora).
   Compu: los 4 pasos juntos. Celular: de a uno, con "Paso N de 4". Texto del usuario solo con textContent. */
(function () {
  "use strict";
  var T = window.Tono = window.Tono || {};
  var doc = document;
  var form = doc.querySelector("[data-turno]");
  if (!form) return;

  var pasos = form.querySelectorAll(".paso");
  var contDias = form.querySelector("[data-dias]");
  var contHoras = form.querySelector("[data-horas]");
  var ayudaPro = form.querySelector("[data-pro-ayuda]");
  var ayudaHora = form.querySelector("[data-hora-ayuda]");
  var opcionesPro = form.querySelectorAll("[data-pro-opcion]");
  var estadoEl = form.querySelector("[data-turno-estado]");
  var avance = form.querySelector("[data-avance]");
  var txtPaso = form.querySelector("[data-paso-txt]");
  var barras = form.querySelectorAll(".turno__barras li");
  var btnAtras = form.querySelector("[data-atras]");
  var btnSig = form.querySelector("[data-siguiente]");
  var btnRev = form.querySelector("[data-revisar]");
  var errEls = {
    servicio: form.querySelector("[data-error='servicio']"),
    pro: form.querySelector("[data-error='pro']"),
    dia: form.querySelector("[data-error='dia']"),
    hora: form.querySelector("[data-error='hora']")
  };
  var PASO_DE = { servicio: 1, pro: 2, dia: 3, hora: 4 };
  var mq = window.matchMedia("(min-width: 900px)");
  var pasoActual = 1;
  var estadoSim = T.estadoPrueba;          /* cargando | error | offline | null */
  if (typeof navigator !== "undefined" && navigator.onLine === false) estadoSim = "offline";
  var avisoPro = null;
  var horaPerdida = false;
  var enCoherencia = false;

  /* ---------- errores ---------- */
  function mostrarError(campo, texto) {
    var el = errEls[campo];
    T.vaciar(el);
    if (!texto) return;
    el.appendChild(T.icono("warning-circle"));
    el.appendChild(T.el("span", null, texto));
  }

  /* ---------- quien hace que ---------- */
  function profesQueHacen(id) { return id && T.servicios[id] ? T.servicios[id].pro : Object.keys(T.profes); }
  function visibles() {
    if (T.sel.servicio) return T.servicios[T.sel.servicio].pro.concat([T.CUALQUIERA]);
    if (T.sel.pro && T.sel.pro !== T.CUALQUIERA) return [T.sel.pro, T.CUALQUIERA];
    return [];
  }
  /* si el servicio cambia y la persona elegida no lo hace, se suelta la persona y se avisa */
  function coherencia() {
    var v = visibles();
    if (T.sel.pro && v.indexOf(T.sel.pro) < 0) {
      avisoPro = T.TXT.cambioServicio;
      T.cambiar({ pro: null, hora: null }, "turno");
    }
  }

  /* ---------- pintar cada paso ---------- */
  function fantasmas(cont) {
    for (var i = 0; i < 6; i++) cont.appendChild(T.el("span", "fantasma"));
  }
  function sincronizarRadios(campo) {
    var rs = form.querySelectorAll("input[name='" + campo + "']");
    for (var i = 0; i < rs.length; i++) rs[i].checked = rs[i].value === T.sel[campo];
  }

  function renderPros() {
    var v = visibles();
    for (var i = 0; i < opcionesPro.length; i++) {
      var id = opcionesPro[i].getAttribute("data-pro-opcion");
      opcionesPro[i].hidden = v.indexOf(id) < 0;
      opcionesPro[i].querySelector("input").checked = T.sel.pro === id;
    }
    if (avisoPro) { ayudaPro.textContent = avisoPro; ayudaPro.hidden = false; }
    else { ayudaPro.textContent = T.TXT.elegiServicio; ayudaPro.hidden = !!T.sel.servicio; }
  }

  function renderDias() {
    T.vaciar(contDias);
    if (estadoSim === "cargando") { fantasmas(contDias); return; }
    if (estadoSim === "error" || estadoSim === "offline") return;
    var dias = T.diasProximos(T.ahora(), 6);
    var hay = false;
    for (var i = 0; i < dias.length; i++) {
      var iso = T.iso(dias[i]);
      var par = T.el("span", "opcion-par");
      var input = T.el("input", "sr");
      input.type = "radio";
      input.name = "dia";
      input.value = iso;
      input.id = "r-dia-" + iso;
      var label = T.el("label", "opcion", T.etiquetaDia(dias[i]));
      label.setAttribute("for", input.id);
      if (T.sel.dia === iso) { input.checked = true; hay = true; }
      par.appendChild(input);
      par.appendChild(label);
      contDias.appendChild(par);
    }
    if (T.sel.dia && !hay) T.cambiar({ dia: null, hora: null }, "turno");
  }

  function renderHoras() {
    T.vaciar(contHoras);
    ayudaHora.textContent = T.TXT.elegiDia;
    ayudaHora.hidden = false;
    if (estadoSim === "cargando") { fantasmas(contHoras); ayudaHora.hidden = true; return; }
    if (estadoSim === "error" || estadoSim === "offline") { ayudaHora.hidden = true; return; }
    if (!T.sel.dia) return;
    var cand = T.candidatos(T.sel.pro, profesQueHacen(T.sel.servicio));
    var horario = T.horario(T.sel.dia, T.ahora(), cand);
    var libres = 0;
    var vigente = false;
    for (var i = 0; i < horario.length; i++) {
      if (!horario[i].ocupado) libres++;
      if (T.sel.hora && horario[i].hora === T.sel.hora && !horario[i].ocupado) vigente = true;
    }
    if (!horario.length || !libres) ayudaHora.textContent = T.TXT.sinHoras;
    else ayudaHora.hidden = true;
    for (var j = 0; j < horario.length; j++) {
      var h = horario[j];
      var par = T.el("span", "opcion-par");
      var input = T.el("input", "sr");
      input.type = "radio";
      input.name = "hora";
      input.value = h.hora;
      input.id = "r-hora-" + h.hora.replace(":", "-");
      input.disabled = h.ocupado;
      var label = T.el("label", "opcion", h.hora);
      label.setAttribute("for", input.id);
      if (h.ocupado) label.appendChild(T.el("span", "sr", ", ocupado (ejemplo)"));
      if (T.sel.hora === h.hora && !h.ocupado) input.checked = true;
      par.appendChild(input);
      par.appendChild(label);
      contHoras.appendChild(par);
    }
    if (T.sel.hora && !vigente) {
      T.cambiar({ hora: null }, "turno");
      horaPerdida = true;
      mostrarError("hora", T.TXT.horaPerdida);
    }
  }

  function pintarEstado() {
    T.vaciar(estadoEl);
    var bloquear = false;
    if (estadoSim === "error" || estadoSim === "offline") {
      bloquear = true;
      var sinRed = estadoSim === "offline";
      estadoEl.appendChild(T.icono(sinRed ? "wifi-slash" : "warning-circle"));
      estadoEl.appendChild(T.el("span", null, sinRed ? "Sin conexión. Revisá tu internet y probá de nuevo." : "No pudimos cargar los horarios. Probá de nuevo en un rato."));
      var b = T.el("button", "btn-texto");
      b.type = "button";
      b.appendChild(T.icono("arrow-clockwise"));
      b.appendChild(T.el("span", null, "Reintentar"));
      b.addEventListener("click", function () { T.turno.estado(null); });
      estadoEl.appendChild(b);
    } else if (estadoSim === "cargando") {
      bloquear = true;
    }
    btnSig.disabled = bloquear;
    btnRev.disabled = bloquear;
  }

  function renderTodo() {
    renderDias();
    renderPros();
    renderHoras();
    pintarEstado();
  }

  /* ---------- pasos (celular) ---------- */
  function legendDe(n) { return pasos[n - 1].querySelector("legend"); }
  function actualizarPasos(enfocar) {
    var modo = mq.matches ? "todo" : "pasos";
    form.setAttribute("data-modo", modo);
    for (var i = 0; i < pasos.length; i++) {
      if (i + 1 === pasoActual) pasos[i].classList.add("paso--actual");
      else pasos[i].classList.remove("paso--actual");
      barras[i].className = i < pasoActual ? "hecho" : "";
    }
    avance.hidden = modo === "todo";
    txtPaso.textContent = "Paso " + pasoActual + " de 4";
    btnAtras.hidden = !(modo === "pasos" && pasoActual > 1);
    btnSig.hidden = !(modo === "pasos" && pasoActual < 4);
    btnRev.hidden = modo === "pasos" && pasoActual < 4;
    if (enfocar) legendDe(pasoActual).focus();
  }
  function irAPaso(n, enfocar) {
    pasoActual = Math.max(1, Math.min(4, n));
    actualizarPasos(enfocar);
  }
  if (mq.addEventListener) mq.addEventListener("change", function () { actualizarPasos(false); });
  else if (mq.addListener) mq.addListener(function () { actualizarPasos(false); });

  btnAtras.addEventListener("click", function () { irAPaso(pasoActual - 1, true); });
  btnSig.addEventListener("click", function () {
    var campo = T.ORDEN[pasoActual - 1];
    var err = T.errores(T.sel)[campo];
    if (err) { mostrarError(campo, err); legendDe(pasoActual).focus(); return; }
    irAPaso(pasoActual + 1, true);
  });

  /* ---------- cambios que hace la persona ---------- */
  form.addEventListener("change", function (e) {
    var t = e.target;
    if (!t || t.type !== "radio" || !errEls[t.name]) return;
    var campo = t.name;
    mostrarError(campo, "");
    if (campo === "pro") avisoPro = null;
    if (campo === "hora") horaPerdida = false;
    var cambios = {};
    cambios[campo] = t.value;
    T.cambiar(cambios, "turno");
  });

  T.alCambiar(function (cambios) {
    if (enCoherencia) return;
    if (cambios.servicio !== undefined) { sincronizarRadios("servicio"); mostrarError("servicio", ""); }
    if (cambios.servicio !== undefined || cambios.pro !== undefined) {
      enCoherencia = true;
      coherencia();
      enCoherencia = false;
      renderPros();
      renderHoras();
    }
    if (cambios.dia !== undefined) renderHoras();
  });

  /* ---------- Revisar mi turno ---------- */
  function revisar() {
    if (btnRev.disabled) return;
    renderHoras();                                   /* el reloj pudo dejar sin efecto la hora elegida */
    var err = T.errores(T.sel);
    for (var i = 0; i < T.ORDEN.length; i++) {
      var c = T.ORDEN[i];
      if (c === "hora" && horaPerdida && err.hora) continue;
      mostrarError(c, err[c] || "");
    }
    var primero = T.primerError(err);
    if (primero) {
      irAPaso(PASO_DE[primero], false);
      legendDe(PASO_DE[primero]).focus();
      return;
    }
    T.hoja.ir("#revisar", btnRev);
  }
  form.addEventListener("submit", function (e) { e.preventDefault(); revisar(); });

  /* ---------- hoja "Revisa tu turno" ---------- */
  var dlg = doc.getElementById("hoja-revision");
  var rev = {
    foto: dlg.querySelector("[data-rev-foto]"),
    servicio: dlg.querySelector("[data-rev='servicio']"),
    pro: dlg.querySelector("[data-rev='pro']"),
    cuando: dlg.querySelector("[data-rev='cuando']"),
    tono: dlg.querySelector("[data-rev='tono']"),
    alerta: dlg.querySelector("[data-rev-alerta]"),
    wa: dlg.querySelector("[data-rev-wa]"),
    nota: dlg.querySelector("[data-rev-nota]")
  };
  var NOTA_DEMO = "Es una demo: el turno no se guarda ni se envía al salón.";
  var reloj = null;

  function llenarRevision() {
    var s = T.servicios[T.sel.servicio];
    var grande = window.matchMedia("(min-width: 900px)").matches;      /* compu: la de 1000 px para que no se vea blanda */
    T.cargarFoto(rev.foto, "fotos/s-" + s.id + (grande ? "-1000" : "-520") + ".webp", s.alt);
    rev.servicio.textContent = s.nombre;
    rev.pro.textContent = T.sel.pro === T.CUALQUIERA ? "Cualquiera del equipo" : T.profes[T.sel.pro].nombre;
    rev.cuando.textContent = T.etiquetaLarga(T.desdeIso(T.sel.dia)) + ", " + T.sel.hora;
    rev.tono.textContent = T.tonoPorId(T.sel.tono).nombre;
    rev.alerta.textContent = "";
    rev.wa.removeAttribute("aria-disabled");
    rev.nota.textContent = NOTA_DEMO;
  }

  function vigilarReloj(si) {
    if (reloj) { window.clearInterval(reloj); reloj = null; }
    if (!si) return;
    reloj = window.setInterval(function () {
      if (!T.sel.dia || !T.sel.hora) return;
      if (T.horasDelDia(T.sel.dia, T.ahora()).indexOf(T.sel.hora) >= 0) return;
      /* la hora ya paso mientras mirabas la hoja */
      rev.alerta.appendChild(T.icono("warning-circle"));
      rev.alerta.appendChild(T.el("span", null, T.TXT.cambioHorario));
      rev.wa.setAttribute("aria-disabled", "true");
      T.cambiar({ hora: null }, "turno");
      renderHoras();
      mostrarError("hora", T.TXT.horaPerdida);
      horaPerdida = true;
      window.clearInterval(reloj);
      reloj = null;
    }, 20000);
  }

  T.hoja.registrar({
    dialog: dlg,
    coincide: function (h) { return h === "#revisar"; },
    alAbrir: function () {
      if (T.primerError(T.errores(T.sel))) return false;      /* enlace directo sin turno armado */
      llenarRevision();
      vigilarReloj(true);
    },
    alCerrar: function () { vigilarReloj(false); }
  });
  rev.wa.addEventListener("click", function (e) {
    if (rev.wa.getAttribute("aria-disabled") === "true") { e.preventDefault(); return; }
    rev.nota.textContent = "Abrimos WhatsApp. Es una demo: el salón no recibió tu turno.";
  });
  dlg.querySelector("[data-cambiar]").addEventListener("click", function () { T.hoja.cerrar(); });

  /* ---------- API para equipo y estados ---------- */
  T.turno = {
    irA: function (n) {
      pasoActual = n;
      actualizarPasos(false);
      var sec = doc.getElementById("turno");
      var rapido = T.reducido();
      sec.scrollIntoView({ behavior: rapido ? "auto" : "smooth", block: "start" });
      window.setTimeout(function () { legendDe(n).focus({ preventScroll: true }); }, rapido ? 0 : 400);
    },
    estado: function (tipo) {
      estadoSim = tipo;
      renderTodo();
    }
  };

  window.addEventListener("offline", function () { T.turno.estado("offline"); });
  window.addEventListener("online", function () { if (estadoSim === "offline") T.turno.estado(null); });

  renderTodo();
  actualizarPasos(false);
})();
