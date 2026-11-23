/* El Filo (Demo): el ticket en memoria. Vive solo mientras la pagina esta abierta; no se guarda nada. */
(function () {
  "use strict";
  var F = window.Filo = window.Filo || {};
  var PASO = 0.5, MAX = 20;
  var lineas = {};      /* id -> { kg, corte } */
  var orden = [];       /* ids en el orden en que se agregaron */
  var oyentes = [];

  function emitir(id, antes) { oyentes.forEach(function (f) { f(id, antes); }); }
  function entre(kg) { return Math.max(0, Math.min(MAX, Math.round(kg / PASO) * PASO)); }

  F.carro = {
    MAX: MAX, PASO: PASO,
    alCambiar: function (f) { oyentes.push(f); },
    kgDe: function (id) { return lineas[id] ? lineas[id].kg : 0; },
    corteDe: function (id) { return lineas[id] ? lineas[id].corte : null; },
    ids: function () { return orden.slice(); },
    cuenta: function () { return orden.length; },
    kgTotal: function () { var t = 0; orden.forEach(function (id) { t += lineas[id].kg; }); return t; },
    subtotal: function (id) { return lineas[id] ? lineas[id].kg * F.cat[id].precio : 0; },
    total: function () { var t = 0; orden.forEach(function (id) { t += lineas[id].kg * F.cat[id].precio; }); return t; },
    /* fija los kilos (0 quita la linea); devuelve false si ya estaba en el tope */
    fijar: function (id, kg, corte) {
      if (!F.cat[id] || F.cat[id].agotado) return false;
      var antes = F.carro.kgDe(id);
      var nuevo = entre(kg);
      if (nuevo === antes && corte === undefined) return false;
      if (nuevo <= 0) { delete lineas[id]; orden = orden.filter(function (x) { return x !== id; }); }
      else {
        if (!lineas[id]) { lineas[id] = { kg: nuevo, corte: null }; orden.push(id); }
        lineas[id].kg = nuevo;
        if (corte !== undefined) lineas[id].corte = corte;
      }
      emitir(id, antes);
      return true;
    },
    sumar: function (id, delta, corte) { return F.carro.fijar(id, F.carro.kgDe(id) + delta, corte); }
  };
})();
