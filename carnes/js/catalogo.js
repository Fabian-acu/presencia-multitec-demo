/* El Filo (Demo): catalogo (se lee del HTML), controles de kilos, bandas, filtros y detalle del corte. */
(function () {
  "use strict";
  var F = window.Filo = window.Filo || {};
  var el = F.el;

  /* ---------- catalogo: la fuente de verdad es la lista de Cortes del HTML ---------- */
  F.cat = {};
  F.orden = [];
  Array.prototype.forEach.call(document.querySelectorAll(".lista-cortes > li[data-id]"), function (li) {
    var d = li.dataset;
    F.cat[d.id] = {
      id: d.id, nombre: d.nombre, titulo: d.titulo, esp: d.esp, hueso: d.hueso, uso: d.uso, linea: d.linea, peso: d.peso,
      precio: +d.precio, como: d.como, chips: d.chips ? d.chips.split("|") : [], foto: d.foto, agotado: li.hasAttribute("data-agotado"), li: li
    };
    F.orden.push(d.id);
  });

  /* ---------- controles de kilos: Sumar se vuelve contador en el mismo lugar ---------- */
  function boton(clase, aria, hijo, rol) {
    var b = el("button", clase);
    b.type = "button";
    b.setAttribute("aria-label", aria);
    b.setAttribute("data-r", rol);
    if (hijo) b.appendChild(hijo);
    return b;
  }

  function pintar(ctl) {
    var id = ctl.getAttribute("data-ctl");
    var c = F.cat[id];
    if (!c) return;
    var kg = F.carro.kgDe(id);
    var tenia = ctl.contains(document.activeElement) ? document.activeElement.getAttribute("data-r") : null;
    var paso = ctl.querySelector(".paso");

    if (c.agotado) {
      if (!ctl.firstChild) {
        var n = el("button", "btn btn--linea", "Sumar");
        n.type = "button";
        n.setAttribute("aria-disabled", "true");
        n.setAttribute("aria-label", "No disponible: " + c.nombre);
        n.addEventListener("click", function (e) { e.preventDefault(); });
        ctl.appendChild(n);
      }
      return;
    }

    if (kg <= 0) {
      if (paso || !ctl.firstChild) {
        ctl.textContent = "";
        var s = el("button", "btn btn--linea", "Sumar");
        s.type = "button";
        s.setAttribute("data-r", "sumar");
        s.setAttribute("aria-label", "Sumar " + c.nombre + " al ticket");
        s.addEventListener("click", function () {
          F.carro.sumar(id, F.carro.PASO);
          F.anunciar("Sumaste " + c.nombre + ", " + F.kg(F.carro.kgDe(id)) + " kg.");
          var m = ctl.querySelector('[data-r="mas"]');
          if (m) m.focus();
        });
        ctl.appendChild(s);
        if (tenia) s.focus();
      }
      return;
    }

    var tope = kg >= F.carro.MAX;
    if (!paso) {
      ctl.textContent = "";
      paso = el("div", "paso");
      paso.setAttribute("role", "group");
      paso.setAttribute("aria-label", "Kilos de " + c.nombre);
      var menos = boton("paso__b", "Quitar 0,5 kg de " + c.nombre, F.icono("minus"), "menos");
      var val = el("span", "paso__v");
      var mas = boton("paso__b", "Sumar 0,5 kg de " + c.nombre, F.icono("plus"), "mas");
      menos.addEventListener("click", function () { F.carro.sumar(id, -F.carro.PASO); F.anunciar(c.nombre + ", " + F.kg(F.carro.kgDe(id)) + " kg."); });
      mas.addEventListener("click", function () {
        if (F.carro.kgDe(id) >= F.carro.MAX) { F.anunciar("Máximo 20 kg por corte en esta demo."); return; }
        F.carro.sumar(id, F.carro.PASO);
        F.anunciar(c.nombre + ", " + F.kg(F.carro.kgDe(id)) + " kg.");
      });
      paso.appendChild(menos); paso.appendChild(val); paso.appendChild(mas);
      ctl.appendChild(paso);
      val.textContent = F.kg(kg) + " kg";
      val.__t = val.textContent;
    } else {
      var v = paso.querySelector(".paso__v");
      F.rodar(v, F.kg(kg) + " kg", kg > (ctl.__kg || 0));
    }
    ctl.__kg = kg;
    var masB = ctl.querySelector('[data-r="mas"]');
    if (tope) masB.setAttribute("aria-disabled", "true"); else masB.removeAttribute("aria-disabled");
    var av = ctl.querySelector(".ctl__aviso");
    if (tope && !av) { av = el("p", "ctl__aviso", "Máximo 20 kg por corte en esta demo."); ctl.appendChild(av); }
    else if (!tope && av) av.remove();
    if (tenia) { var f = ctl.querySelector('[data-r="' + tenia + '"]'); if (f) f.focus(); }
  }

  var controles = Array.prototype.slice.call(document.querySelectorAll("[data-ctl]"));
  controles.forEach(pintar);
  F.carro.alCambiar(function (id) {
    controles.forEach(function (c) { if (c.getAttribute("data-ctl") === id) pintar(c); });
  });

  /* ---------- bandas: una abierta por vez ---------- */
  var bandas = Array.prototype.slice.call(document.querySelectorAll(".banda"));
  bandas.forEach(function (b) {
    var cab = b.querySelector(".banda__cab");
    cab.addEventListener("click", function () {
      var abrir = !b.classList.contains("abierta");
      bandas.forEach(function (o) {
        var si = o === b && abrir;
        o.classList.toggle("abierta", si);
        o.querySelector(".banda__cab").setAttribute("aria-expanded", si ? "true" : "false");
      });
    });
  });

  /* ---------- filtros ---------- */
  var lista = document.querySelector("[data-lista]");
  var sin = document.querySelector("[data-sin]");
  var verN = document.querySelector("[data-ver-n]");
  var filtros = document.querySelector("[data-filtros]");
  var lugar = document.querySelector("[data-filtros-lugar]");
  var enHoja = document.querySelector("[data-filtros-hoja]");
  var sel = { esp: "", uso: "", hueso: "" };

  function aplicar() {
    var n = 0;
    F.orden.forEach(function (id) {
      var c = F.cat[id];
      var ok = (!sel.esp || c.esp === sel.esp) && (!sel.uso || c.uso === sel.uso) && (!sel.hueso || c.hueso === sel.hueso);
      c.li.hidden = !ok;
      if (ok) n++;
    });
    if (sin) sin.hidden = n !== 0;
    if (verN) verN.textContent = n === 1 ? "Ver 1 corte" : "Ver " + n + " cortes";
    return n;
  }
  function marcar() {
    Array.prototype.forEach.call(filtros.querySelectorAll(".chip"), function (b) {
      var g = b.getAttribute("data-f");
      b.setAttribute("aria-pressed", sel[g] === b.getAttribute("data-v") ? "true" : "false");
    });
  }
  if (filtros) {
    filtros.addEventListener("click", function (e) {
      var b = e.target.closest(".chip");
      if (!b) return;
      var g = b.getAttribute("data-f"), v = b.getAttribute("data-v");
      sel[g] = (g === "esp") ? v : (sel[g] === v ? "" : v);
      marcar();
      var n = aplicar();
      F.anunciar(n === 0 ? "No hay cortes con esos filtros." : n + (n === 1 ? " corte." : " cortes."));
    });
    var mq = window.matchMedia("(min-width: 900px)");
    var colocar = function () {
      var destino = mq.matches ? lugar : enHoja;
      if (destino && filtros.parentNode !== destino) destino.appendChild(filtros);
    };
    colocar();
    if (mq.addEventListener) mq.addEventListener("change", colocar);
  }
  var verTodo = document.querySelector("[data-ver-todo]");
  if (verTodo) verTodo.addEventListener("click", function () { sel = { esp: "", uso: "", hueso: "" }; marcar(); aplicar(); });
  var abrirF = document.querySelector("[data-abrir-filtros]");
  if (abrirF) abrirF.addEventListener("click", function () { F.hoja.ir("#filtros", abrirF); });
  var dF = document.getElementById("d-filtros");
  if (dF) F.hoja.registrar({ dialog: dF, coincide: function (h) { return h === "#filtros"; }, alAbrir: function () { aplicar(); return true; } });
  aplicar();

  /* ---------- detalle del corte ---------- */
  var dC = document.getElementById("d-corte");
  var cur = null;       /* { id, kg, chip } */
  var dPaso = dC.querySelector("[data-d-paso]");
  var dSumar = dC.querySelector("[data-d-sumar]");
  var dVal = el("span", "paso__v");
  var dMenos = boton("paso__b", "Quitar 0,5 kg", F.icono("minus"), "d-menos");
  var dMas = boton("paso__b", "Sumar 0,5 kg", F.icono("plus"), "d-mas");
  dPaso.appendChild(dMenos); dPaso.appendChild(dVal); dPaso.appendChild(dMas);

  function precioDetalle() {
    var c = F.cat[cur.id];
    dSumar.textContent = "Sumar al ticket · Gs. " + F.gs(cur.kg * c.precio);
  }
  function pintarCant() {
    dVal.textContent = F.kg(cur.kg) + " kg";
    if (cur.kg >= F.carro.MAX) dMas.setAttribute("aria-disabled", "true"); else dMas.removeAttribute("aria-disabled");
    if (cur.kg <= F.carro.PASO) dMenos.setAttribute("aria-disabled", "true"); else dMenos.removeAttribute("aria-disabled");
    precioDetalle();
  }
  dMenos.addEventListener("click", function () { if (cur && cur.kg > F.carro.PASO) { cur.kg -= F.carro.PASO; pintarCant(); } });
  dMas.addEventListener("click", function () {
    if (!cur) return;
    if (cur.kg >= F.carro.MAX) { F.anunciar("Máximo 20 kg por corte en esta demo."); return; }
    cur.kg += F.carro.PASO; pintarCant();
  });
  dSumar.addEventListener("click", function () {
    if (!cur) return;
    var c = F.cat[cur.id];
    if (c.agotado) return;
    var antes = F.carro.kgDe(cur.id);
    F.carro.fijar(cur.id, antes + cur.kg, cur.chip);
    F.anunciar("Sumaste " + c.nombre + ", " + F.kg(F.carro.kgDe(cur.id)) + " kg.");
    F.hoja.cerrar();
  });

  F.hoja.registrar({
    dialog: dC,
    coincide: function (h) { return /^#corte-[a-z0-9-]+$/.test(h) && !!F.cat[h.slice(7)]; },
    alAbrir: function (h) {
      var id = h.slice(7), c = F.cat[id];
      if (!c) return false;
      cur = { id: id, kg: F.carro.PASO, chip: c.chips.length ? (F.carro.corteDe(id) || c.chips[0]) : null };
      var fo = dC.querySelector("[data-d-foto]");
      fo.textContent = "";
      fo.setAttribute("data-nombre", c.nombre);
      if (c.foto) {
        var im = el("img");
        im.src = "fotos/" + c.foto + "-720.webp";
        im.srcset = "fotos/" + c.foto + "-480.webp 480w, fotos/" + c.foto + "-720.webp 720w";
        im.sizes = "(min-width: 900px) 428px, 90vw";
        im.width = 720; im.height = 720; im.alt = "";
        fo.appendChild(im);
      } else {
        var f = el("span", "falta falta--grande");
        f.setAttribute("aria-hidden", "true");
        f.appendChild(el("span", "falta__n", c.nombre));
        f.appendChild(el("span", "falta__t mono", "Falta foto"));
        fo.appendChild(f);
      }
      fo.classList.remove("foto--rota");
      dC.querySelector("[data-d-titulo]").textContent = c.titulo;
      dC.querySelector("[data-d-linea]").textContent = c.linea;
      dC.querySelector("[data-d-como]").textContent = c.como;
      dC.querySelector("[data-d-precio]").textContent = "Gs. " + F.gs(c.precio) + " / kg";
      dC.querySelector("[data-d-peso]").textContent = c.peso + " (estimado)";
      var bloque = dC.querySelector("[data-d-chips-bloque]");
      var cont = dC.querySelector("[data-d-chips]");
      cont.textContent = "";
      bloque.hidden = !c.chips.length;
      c.chips.forEach(function (t) {
        var b = el("button", "chip", t);
        b.type = "button";
        b.setAttribute("aria-pressed", t === cur.chip ? "true" : "false");
        b.addEventListener("click", function () {
          cur.chip = t;
          Array.prototype.forEach.call(cont.children, function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
        });
        cont.appendChild(b);
      });
      dMenos.setAttribute("aria-label", "Quitar 0,5 kg de " + c.nombre);
      dMas.setAttribute("aria-label", "Sumar 0,5 kg de " + c.nombre);
      if (c.agotado) {
        dSumar.textContent = "No disponible";
        dSumar.setAttribute("aria-disabled", "true");
        dSumar.setAttribute("aria-label", "No disponible: " + c.nombre);
      } else {
        dSumar.removeAttribute("aria-disabled");
        dSumar.removeAttribute("aria-label");
        pintarCant();
      }
      return true;
    }
  });

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-detalle]");
    if (!b) return;
    e.preventDefault();
    var origen = (b.classList.contains("corte__foto") || b.classList.contains("fila__foto")) ? b.closest("li").querySelector(".nombre") : b;
    F.hoja.ir("#corte-" + b.getAttribute("data-detalle"), origen);
  });

  /* ---------- corte de la semana ---------- */
  var sem = document.querySelector("[data-semana]");
  if (sem) sem.addEventListener("click", function () {
    var id = sem.getAttribute("data-semana");
    F.carro.sumar(id, F.carro.PASO);
    F.anunciar("Sumaste " + F.cat[id].nombre + ", " + F.kg(F.carro.kgDe(id)) + " kg.");
  });

  /* ---------- mapa ---------- */
  var dM = document.getElementById("d-mapa");
  if (dM) F.hoja.registrar({ dialog: dM, coincide: function (h) { return h === "#mapa"; } });
  var abM = document.querySelector("[data-abrir-mapa]");
  if (abM) abM.addEventListener("click", function () { F.hoja.ir("#mapa", abM); });
})();
