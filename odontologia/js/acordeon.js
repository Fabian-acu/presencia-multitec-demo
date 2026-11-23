/* Consultorio Abril (Demo): filas que se abren de a una (tratamientos y preguntas).
   Sin JavaScript las filas quedan abiertas como lista (el HTML ya trae todo). Con JavaScript, cada titulo se vuelve un boton. */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";

  Array.prototype.forEach.call(document.querySelectorAll("[data-acc]"), function (acc, n) {
    var tipo = acc.getAttribute("data-acc-tipo") || "acc";
    var items = Array.prototype.slice.call(acc.querySelectorAll(".acc__item"));
    var botones = [];

    function nombre(b, abierto) {
      var t = b.querySelector(".acc__txt").textContent;
      if (tipo === "preg") b.setAttribute("aria-label", abierto ? t + ", abierta" : "Abrir: " + t);
      else b.setAttribute("aria-label", abierto ? t + ", abierto" : "Abrir " + t);
    }

    function poner(item, abierto) {
      var b = item.querySelector(".acc__btn");
      if (abierto) item.setAttribute("data-abierto", ""); else item.removeAttribute("data-abierto");
      b.setAttribute("aria-expanded", abierto ? "true" : "false");
      nombre(b, abierto);
    }

    items.forEach(function (item, i) {
      var t = item.querySelector("[data-acc-t]");
      var panel = item.querySelector("[data-acc-panel]");
      var id = "acc-" + tipo + "-" + n + "-" + i;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "acc__btn";
      b.id = id + "-b";
      b.setAttribute("aria-controls", id + "-p");
      var txt = document.createElement("span");
      txt.className = "acc__txt";
      txt.textContent = t.textContent;
      var svg = document.createElementNS(NS, "svg");
      svg.setAttribute("class", "acc__ico");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");
      var uso = document.createElementNS(NS, "use");
      uso.setAttribute("href", "iconos.svg#i-plus");
      svg.appendChild(uso);
      b.appendChild(txt);
      b.appendChild(svg);
      t.textContent = "";
      t.appendChild(b);
      panel.id = id + "-p";
      panel.setAttribute("role", "region");
      panel.setAttribute("aria-labelledby", id + "-b");
      botones.push(b);
      poner(item, false);

      b.addEventListener("click", function () {
        var abre = !item.hasAttribute("data-abierto");
        items.forEach(function (o) { if (o !== item) poner(o, false); });
        poner(item, abre);
      });
      b.addEventListener("keydown", function (e) {
        var k = e.key, j = -1;
        if (k === "ArrowDown") j = (i + 1) % botones.length;
        else if (k === "ArrowUp") j = (i + botones.length - 1) % botones.length;
        else if (k === "Home") j = 0;
        else if (k === "End") j = botones.length - 1;
        if (j >= 0) { e.preventDefault(); botones[j].focus(); }
      });
    });
  });
})();
