/* Ceniza (Demo): corre antes de pintar. Marca que hay JavaScript, lee ?estado= y ?ahora= (solo para probar) y decide si
   el local esta cerrado ahora, para reservar la linea del aviso desde el primer cuadro (sin saltos).
   Horario de ejemplo: lunes a viernes 10:00 a 19:30; sabados 10:00 a 17:00; domingos cerrado. */
(function () {
  "use strict";
  var h = document.documentElement;
  h.classList.add("js");
  var q = window.location.search;
  var m = /[?&]estado=([a-z]+)/.exec(q);
  if (m) h.setAttribute("data-estado", m[1]);

  var ahora = new Date();
  var t = /[?&]ahora=(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(q);
  if (t) ahora = new Date(+t[1], +t[2] - 1, +t[3], +t[4], +t[5]);

  /* null si esta abierto; si no, cuando abre: "hoy", "mañana" o "el lunes" */
  function cuandoAbre(d) {
    var dia = d.getDay();
    var min = d.getHours() * 60 + d.getMinutes();
    var abre = 10 * 60;
    var cierra = dia === 0 ? 0 : (dia === 6 ? 17 * 60 : 19 * 60 + 30);
    if (cierra && min >= abre && min < cierra) return null;
    if (cierra && min < abre) return "hoy";
    return dia === 6 ? "el lunes" : "mañana";
  }
  var cuando = h.getAttribute("data-estado") === "cerrado" && !t ? "mañana" : cuandoAbre(ahora);
  if (cuando) h.setAttribute("data-cerrado", cuando);
  window.Ceniza = { cuandoAbre: cuandoAbre };
})();
