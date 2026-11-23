/* El Filo (Demo): "Armar asado para". Cantidades estimadas de la ficha (no se calculan distinto). La mezcla pasa al ticket. */
(function () {
  "use strict";
  var F = window.Filo = window.Filo || {};
  var el = F.el;
  var MEZ = {
    4: [1.0, 0.5, 0.5, 0.5],
    8: [2.0, 1.5, 1.0, 0.5],
    12: [3.0, 2.0, 1.5, 1.0],
    20: [5.0, 3.5, 2.5, 1.5]
  };
  var CORTES = ["costilla", "vacio", "chorizo-parrillero", "entrana"];
  var texto = document.querySelector("[data-asado-texto]");
  var kgGrande = document.querySelector("[data-asado-kg]");
  var barra = document.querySelector("[data-barra]");
  var tabla = document.querySelector("[data-mezcla] tbody");
  var pasar = document.querySelector("[data-pasar]");
  var ayuda = document.querySelector("[data-pasar-ayuda]");
  var chips = document.querySelector("[data-personas]");
  if (!texto || !chips) return;
  texto.setAttribute("aria-live", "polite");
  var elegido = 8;

  function mostrar(p) {
    var kgs = MEZ[p];
    var total = 0;
    kgs.forEach(function (k) { total += k; });
    texto.textContent = "Para " + p + " personas, unos 625 g por persona, hueso incluido (estimado).";
    if (kgGrande) F.rodar(kgGrande, F.kg(total) + " kg", total >= (mostrar.ult || 0));
    mostrar.ult = total;
    var segs = barra.querySelectorAll(".seg");
    var x = 0;
    kgs.forEach(function (k, i) {
      var w = k / total * 100;
      segs[i].style.setProperty("--x", x.toFixed(2));
      segs[i].style.setProperty("--w", w.toFixed(2));
      x += w;
    });
    tabla.textContent = "";
    kgs.forEach(function (k, i) {
      var tr = el("tr");
      var a = el("td");
      var sw = el("span", "sw sw" + (i + 1));
      sw.setAttribute("aria-hidden", "true");
      a.appendChild(sw);
      a.appendChild(document.createTextNode(F.cat[CORTES[i]].nombre.toUpperCase()));
      tr.appendChild(a);
      tr.appendChild(el("td", null, F.kg(k) + " kg"));
      tabla.appendChild(tr);
    });
    var t = el("tr", "tot");
    t.appendChild(el("td", null, "TOTAL (ESTIMADO)"));
    t.appendChild(el("td", null, F.kg(total) + " kg"));
    tabla.appendChild(t);
    pasar.disabled = false;
    ayuda.textContent = "Después podés cambiar los kilos.";
  }

  chips.addEventListener("click", function (e) {
    var b = e.target.closest("[data-p]");
    if (!b) return;
    elegido = +b.getAttribute("data-p");
    Array.prototype.forEach.call(chips.querySelectorAll("[data-p]"), function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
    mostrar(elegido);
  });

  if (kgGrande) kgGrande.__t = kgGrande.textContent;
  mostrar(8);

  pasar.addEventListener("click", function () {
    if (!elegido) return;
    F.pendienteImprimir = [];
    MEZ[elegido].forEach(function (k, i) {
      F.carro.fijar(CORTES[i], k);
      F.pendienteImprimir.push(CORTES[i]);
    });
    F.anunciar("Pasaste la mezcla para " + elegido + " personas al ticket.");
    F.hoja.ir("#ticket", pasar);
  });
})();
