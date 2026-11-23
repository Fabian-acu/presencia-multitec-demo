/* La Plomada (Demo): calculadora de pared. Cuentas de EJEMPLO (estimado, no sirven para comprar ni construir):
   por cada m2 de pared, 60 ladrillos, 0,25 bolsa de cemento, 0,03 m3 de arena. Se redondea hacia arriba (la arena, de a 0,5 m3).
   Los coeficientes estan en el HTML (data-coef); el tope de m2 esta en P.CONFIG.MAX_M2. */
(function () {
  "use strict";
  var P = window.Plomada = window.Plomada || {};

  /* devuelve { vacio } | { error } | { valor } */
  P.parseM2 = function (txt) {
    var t = String(txt || "").trim();
    if (!t) return { vacio: true };
    if (/^\d+\.\d+$/.test(t)) return { error: "Usá coma para los decimales. Ej: 12,5" };
    if (/^-\d+([,.]\d+)?$/.test(t)) return { error: "Los m² tienen que ser mayor que 0." };
    if (!/^\d+(,\d+)?$/.test(t)) return { error: "Poné solo números. Ej: 20" };
    var v = parseFloat(t.replace(",", "."));
    if (!(v > 0)) return { error: "Los m² tienen que ser mayor que 0." };
    if (v > P.CONFIG.MAX_M2) return { error: "En esta demo el máximo es " + P.CONFIG.MAX_M2 + " m²." };
    return { valor: v };
  };
  /* cantidad = m2 x coeficiente, redondeada hacia arriba al paso (1 o 0,5) */
  P.calcular = function (m2, coef, paso) {
    var v = Math.round(m2 * coef * 1e6) / 1e6;
    return Math.ceil(Math.round((v / paso) * 1e6) / 1e6) * paso;
  };

  var form = document.querySelector("[data-calc-form]");
  if (!form) return;
  var input = document.getElementById("m2"), err = document.getElementById("m2-err");
  var filas = Array.prototype.slice.call(document.querySelectorAll(".calc__fila"));
  var todo = document.querySelector("[data-calc-todo]"), conf = document.querySelector("[data-calc-conf]");
  var resultado = {};   /* codigo -> cantidad */

  function limpiarFilas() {
    resultado = {};
    filas.forEach(function (f) {
      var n = f.querySelector("[data-calc-n]");
      n.classList.add("calc__n--vacio");
      n.__t = "Poné los m² y calculá."; n.textContent = "Poné los m² y calculá.";
      f.querySelector("[data-calc-u]").textContent = "";
      f.querySelector("[data-calc-pasar]").disabled = true;
    });
    todo.disabled = true;
  }
  function mostrarFilas(m2) {
    var primero = !Object.keys(resultado).length;
    filas.forEach(function (f) {
      var c = f.getAttribute("data-calc-codigo"), prod = P.productos[c];
      var q = P.calcular(m2, parseFloat(f.getAttribute("data-coef")), parseFloat(f.getAttribute("data-redondeo")));
      var antes = resultado[c];
      resultado[c] = q;
      var n = f.querySelector("[data-calc-n]");
      n.classList.remove("calc__n--vacio");
      var txt = prod.paso < 1 ? P.dec(q) : P.gs(q);
      if (primero) { n.__t = txt; n.textContent = txt; } else P.rodar(n, txt, antes == null || q >= antes, 400);
      f.querySelector("[data-calc-u]").textContent = c === "CEM-001" ? (q === 1 ? "bolsa de 50 kg" : "bolsas de 50 kg") : (c === "LAD-001" ? (q === 1 ? "unidad" : "unidades") : "m³");
      f.querySelector("[data-calc-pasar]").disabled = false;
    });
    todo.disabled = false;
  }
  function validar(mostrarVacio) {
    var r = P.parseM2(input.value);
    conf.hidden = true;
    if (r.vacio) {
      limpiarFilas();
      if (mostrarVacio) { err.textContent = "Escribí los m² de la pared."; err.hidden = false; input.setAttribute("aria-invalid", "true"); input.focus(); }
      else { err.hidden = true; input.removeAttribute("aria-invalid"); }
      return;
    }
    if (r.error) { err.textContent = r.error; err.hidden = false; input.setAttribute("aria-invalid", "true"); limpiarFilas(); return; }
    err.hidden = true; input.removeAttribute("aria-invalid");
    mostrarFilas(r.valor);
  }
  input.addEventListener("input", function () { validar(false); });
  form.addEventListener("submit", function (e) { e.preventDefault(); validar(true); });

  function pasar(codigos) {
    var partes = [], topado = null;
    codigos.forEach(function (c) {
      var prod = P.productos[c], q = resultado[c];
      if (!prod || !q) return;
      var r = P.lista.sumar(c, q);
      if (r.topado) topado = c;
      partes.push(P.cantidad(q, prod) + " " + (prod.paso < 1 ? "m³" : P.unidad(q, prod)) + " de " + prod.nombre.toLowerCase());
    });
    if (!partes.length) return;
    conf.textContent = topado ? P.textoMaximo() : "Sumaste a tu lista: " + partes.join(", ") + ".";
    conf.hidden = false;
    P.anunciar(conf.textContent);
  }
  filas.forEach(function (f) {
    f.querySelector("[data-calc-pasar]").addEventListener("click", function () { pasar([f.getAttribute("data-calc-codigo")]); });
  });
  todo.addEventListener("click", function () { pasar(filas.map(function (f) { return f.getAttribute("data-calc-codigo"); })); });
  limpiarFilas();
})();
