/* Tono Vivo (Demo): reglas puras, sin DOM ni red. Aca viven el mensaje de WhatsApp, el horario del salon, los dias que abrimos,
   los horarios ocupados de ejemplo y los textos de error. Nada se guarda ni se envia.
   Parametro de prueba (lo lee nucleo.js): ?ahora=2026-11-25T10:00 mueve el reloj de la demo. */
(function (raiz) {
  "use strict";
  var T = raiz.Tono = raiz.Tono || {};

  T.NUMERO = "595981601211";                 /* WhatsApp de Multitec, el unico numero de la pagina */
  T.HORAS = ["09:30", "11:00", "12:30", "15:00", "16:30", "18:00"];   /* horarios de ejemplo */
  T.ABRE = "09:30";
  T.CIERRA = "19:30";
  T.CUALQUIERA = "cualquiera";
  T.TONOS = [
    { id: "fucsia", nombre: "Fucsia" }, { id: "cereza", nombre: "Cereza" }, { id: "coral", nombre: "Coral" },
    { id: "oliva", nombre: "Oliva" }, { id: "petroleo", nombre: "Petróleo" }, { id: "nude", nombre: "Nude" },
    { id: "rosa", nombre: "Rosa empolvado" }, { id: "negro", nombre: "Negro" }
  ];
  T.TXT = {
    errServicio: "Elegí un servicio.",
    errPro: "Elegí con quién. Si te da igual, tocá Cualquiera del equipo.",
    errDia: "Elegí un día.",
    errHora: "Elegí una hora.",
    horaPerdida: "Esa hora ya no está. Elegí otra.",
    sinHoras: "No quedan horarios ese día (ejemplo). Probá otro día.",
    elegiServicio: "Elegí un servicio para ver quién lo hace.",
    elegiDia: "Elegí un día para ver los horarios.",
    cambioHorario: "Cambió el horario. Revisalo antes de seguir.",
    cambioServicio: "Cambió el servicio. Elegí con quién de nuevo."
  };
  var ORDEN_ERRORES = ["servicio", "pro", "dia", "hora"];
  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var DIAS_CORTO = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  function dos(n) { return n < 10 ? "0" + n : String(n); }
  function minutos(hhmm) { var p = hhmm.split(":"); return parseInt(p[0], 10) * 60 + parseInt(p[1], 10); }

  T.tonoPorId = function (id) {
    for (var i = 0; i < T.TONOS.length; i++) { if (T.TONOS[i].id === id) return T.TONOS[i]; }
    return null;
  };

  /* Mensaje a WhatsApp: siempre termina en "y quiero una web así." Lleva solo servicio y tono (sin persona, dia ni hora). */
  T.mensaje = function (servicio, tono) {
    var datos = [];
    if (servicio) datos.push("servicio: " + servicio);
    if (tono) datos.push("tono: " + tono);
    return "Hola, vi la demo de Tono Vivo" + (datos.length ? " (" + datos.join(", ") + ")" : "") + " y quiero una web así.";
  };
  T.urlWa = function (mensaje) { return "https://wa.me/" + T.NUMERO + "?text=" + encodeURIComponent(mensaje); };

  /* fechas */
  T.iso = function (d) { return d.getFullYear() + "-" + dos(d.getMonth() + 1) + "-" + dos(d.getDate()); };
  T.desdeIso = function (s) {
    var p = String(s).split("-");
    return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
  };
  T.parsearAhora = function (s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(String(s || ""));
    if (!m) return null;
    return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10), parseInt(m[4], 10), parseInt(m[5], 10));
  };
  T.etiquetaDia = function (d) { return DIAS_CORTO[d.getDay()] + " " + d.getDate(); };
  T.etiquetaLarga = function (d) { return DIAS[d.getDay()] + " " + d.getDate() + " de " + MESES[d.getMonth()]; };

  /* abrimos de martes a sabado; domingo y lunes cerramos */
  T.abre = function (d) { var n = d.getDay(); return n >= 2 && n <= 6; };

  /* Aviso de local cerrado, o null si estamos abiertos. No cambia ningun boton. */
  T.aviso = function (ahora) {
    var min = ahora.getHours() * 60 + ahora.getMinutes();
    var dia = ahora.getDay();
    if (T.abre(ahora) && min >= minutos(T.ABRE) && min < minutos(T.CIERRA)) return null;
    if (T.abre(ahora) && min < minutos(T.ABRE)) return "Ahora estamos cerrados. Abrimos hoy a las " + T.ABRE + ".";
    if (dia === 0 || dia === 1 || dia === 6) return "Ahora estamos cerrados. Abrimos el martes a las " + T.ABRE + ".";
    return "Ahora estamos cerrados. Abrimos mañana a las " + T.ABRE + ".";
  };

  /* Horas de ese dia que todavia no pasaron (hoy, solo las que faltan). */
  T.horasDelDia = function (iso, ahora) {
    var hoy = T.iso(ahora) === iso;
    var min = ahora.getHours() * 60 + ahora.getMinutes();
    var out = [];
    for (var i = 0; i < T.HORAS.length; i++) {
      if (!hoy || minutos(T.HORAS[i]) > min) out.push(T.HORAS[i]);
    }
    return out;
  };

  /* Proximos dias en que abrimos (hoy cuenta solo si quedan horarios). */
  T.diasProximos = function (ahora, cuantos) {
    var out = [];
    var base = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    for (var i = 0; i < 40 && out.length < cuantos; i++) {
      var d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
      if (!T.abre(d)) continue;
      if (i === 0 && T.horasDelDia(T.iso(d), ahora).length === 0) continue;
      out.push(d);
    }
    return out;
  };

  /* Ocupado de ejemplo: parejo para el mismo dia, persona y hora (no es una agenda real). */
  function hash(s) {
    var x = 7;
    for (var i = 0; i < s.length; i++) { x = (x * 31 + s.charCodeAt(i)) % 100003; }
    return x;
  }
  T.ocupado = function (iso, pro, hora) { return hash(iso + "|" + pro + "|" + hora) % 10 < 3; };

  /* Quienes cuentan para la hora: la persona elegida, o todas las que hacen ese servicio. */
  T.candidatos = function (pro, delServicio) {
    if (pro && pro !== T.CUALQUIERA) return [pro];
    return delServicio.slice(0);
  };

  /* Horarios de un dia: [{ hora, ocupado }]. Con "cualquiera" esta ocupado solo si todas las candidatas lo estan. */
  T.horario = function (iso, ahora, candidatas) {
    var horas = T.horasDelDia(iso, ahora);
    var out = [];
    for (var i = 0; i < horas.length; i++) {
      var ocupadas = 0;
      for (var j = 0; j < candidatas.length; j++) { if (T.ocupado(iso, candidatas[j], horas[i])) ocupadas++; }
      out.push({ hora: horas[i], ocupado: candidatas.length > 0 && ocupadas === candidatas.length });
    }
    return out;
  };

  /* Errores de "Revisar mi turno": un texto humano por campo faltante. */
  T.errores = function (sel) {
    var e = {};
    if (!sel.servicio) e.servicio = T.TXT.errServicio;
    if (!sel.pro) e.pro = T.TXT.errPro;
    if (!sel.dia) e.dia = T.TXT.errDia;
    if (!sel.hora) e.hora = T.TXT.errHora;
    return e;
  };
  T.primerError = function (e) {
    for (var i = 0; i < ORDEN_ERRORES.length; i++) { if (e[ORDEN_ERRORES[i]]) return ORDEN_ERRORES[i]; }
    return null;
  };
  T.ORDEN = ORDEN_ERRORES;
})(typeof window !== "undefined" ? window : this);
