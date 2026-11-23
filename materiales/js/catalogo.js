/* La Plomada (Demo): catalogo (rubros, busqueda, filtros), ficha de producto y mapa. Todo se lee del HTML; nada se guarda. */
(function () {
  "use strict";
  var P = window.Plomada = window.Plomada || {};
  var seccion = document.getElementById("catalogo");
  var grupos = Array.prototype.slice.call(seccion.querySelectorAll(".grupo"));
  var filas = Array.prototype.slice.call(seccion.querySelectorAll(".grupo .fila"));
  var chipsRubro = Array.prototype.slice.call(seccion.querySelectorAll("[data-rubro-f]"));
  var resumen = seccion.querySelector("[data-resumen]"), resumenT = resumen.querySelector(".catalogo__res"), quitarQ = resumen.querySelector("[data-quitar-q]");
  var vacio = seccion.querySelector("[data-vacio]"), vacioT = seccion.querySelector("[data-vacio-t]"), vacioS = seccion.querySelector("[data-vacio-s]"), vacioBtn = seccion.querySelector("[data-ver-todo]");
  var filtrosForm = seccion.querySelector("[data-filtros]"), medidasUl = seccion.querySelector("[data-medidas]"), medidaAyuda = seccion.querySelector("[data-medida-ayuda]");
  var verN = seccion.querySelector("[data-ver-n]");
  var inputQ = document.getElementById("q");
  var est = { rubro: "todos", q: "", medidas: [], usos: [], marcas: [] };

  /* palabras que la gente escribe para cada rubro (sin acentos) */
  var ALIAS = { "cemento": "cemento portland", "arena-piedra": "arena piedra ripio", "ladrillos": "ladrillo ladrillos bloque bloques", "hierro": "hierro fierro varilla varillas barra",
                "canos": "cano canos pvc tubo tubos desague agua", "pintura": "pintura latex pintar", "herramientas": "herramienta herramientas" };
  var vocab = {};
  function aprender(txt) { P.norm(txt).split(/[^a-z0-9]+/).forEach(function (w) { if (w.length >= 4) vocab[w] = true; }); }
  filas.forEach(function (li) { aprender(li.dataset.nombre + " " + li.dataset.rubroNombre + " " + (ALIAS[li.dataset.rubro] || "")); });
  function heno(li) { return P.norm([li.dataset.nombre, li.dataset.medida, li.dataset.codigo, li.dataset.rubroNombre, ALIAS[li.dataset.rubro] || ""].join(" ")); }

  function lev(a, b) {
    var m = a.length, n = b.length, d = [], i, j;
    for (i = 0; i <= m; i++) { d[i] = [i]; }
    for (j = 1; j <= n; j++) d[0][j] = j;
    for (i = 1; i <= m; i++) for (j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }
  function parecida(palabra) {
    var mejor = null, dm = 3;
    Object.keys(vocab).forEach(function (w) { var dist = lev(palabra, w); if (dist < dm && dist <= 2) { dm = dist; mejor = w; } });
    return mejor;
  }

  /* ---------- aplicar filtros ---------- */
  function aplicar() {
    var tokens = P.norm(est.q).split(/\s+/).filter(Boolean);
    var vis = 0;
    filas.forEach(function (li) {
      var d = li.dataset, ok = true;
      if (est.rubro !== "todos" && d.rubro !== est.rubro) ok = false;
      if (ok && tokens.length) { var h = heno(li); ok = tokens.every(function (t) { return h.indexOf(t) >= 0; }); }
      if (ok && est.medidas.length && est.medidas.indexOf(d.medida) < 0) ok = false;
      if (ok && est.usos.length && est.usos.indexOf(d.uso) < 0) ok = false;
      if (ok && est.marcas.length && est.marcas.indexOf("A") < 0) ok = false;   /* todos los productos de ejemplo son Marca A */
      li.hidden = !ok;
      if (ok) vis++;
    });
    grupos.forEach(function (g) { g.hidden = !g.querySelector(".fila:not([hidden])"); });
    chipsRubro.forEach(function (c) { c.setAttribute("aria-pressed", String(c.getAttribute("data-rubro-f") === est.rubro)); });
    var hayFiltro = est.rubro !== "todos" || est.q || est.medidas.length || est.usos.length || est.marcas.length;
    resumen.hidden = !hayFiltro;
    if (hayFiltro) {
      resumenT.textContent = vis + (vis === 1 ? " producto" : " productos") + (est.q ? " para \"" + est.q + "\"" : "");
      quitarQ.hidden = !est.q;
    }
    var vacioBool = vis === 0;
    vacio.hidden = !vacioBool;
    if (vacioBool) {
      vacioS.textContent = "";
      if (est.q) {
        vacioT.textContent = "No encontramos \"" + est.q + "\".";
        var sug = null;
        tokens.some(function (t) { var s = parecida(t); if (s && s !== t) { sug = s; return true; } return false; });
        if (sug) {
          vacioS.appendChild(document.createTextNode("¿Quisiste decir "));
          var b = P.el("button", "enlace", sug); b.type = "button"; b.setAttribute("data-sugerida", sug);
          vacioS.appendChild(b); vacioS.appendChild(document.createTextNode("?"));
        } else vacioS.textContent = "Probá con otra palabra o hablá con un asesor.";
        vacioBtn.textContent = "Ver todos los rubros";
      } else { vacioT.textContent = "No hay productos con esos filtros."; vacioBtn.textContent = "Ver todo"; }
    }
    if (verN) verN.textContent = "Ver " + vis + (vis === 1 ? " producto" : " productos");
    if (inputQ && inputQ.value !== est.q) inputQ.value = est.q;
  }

  function medidasDelRubro() {
    medidasUl.textContent = "";
    if (est.rubro === "todos") { medidaAyuda.hidden = false; return; }
    medidaAyuda.hidden = true;
    var vistos = [];
    filas.forEach(function (li) { if (li.dataset.rubro === est.rubro && vistos.indexOf(li.dataset.medida) < 0) vistos.push(li.dataset.medida); });
    vistos.forEach(function (m, i) {
      var li = P.el("li"), lab = P.el("label", "opcion"), inp = P.el("input");
      inp.type = "checkbox"; inp.name = "medida"; inp.value = m;
      lab.appendChild(inp); lab.appendChild(P.el("span", null, m)); li.appendChild(lab); medidasUl.appendChild(li);
    });
  }
  function leerFiltros() {
    est.medidas = Array.prototype.map.call(filtrosForm.querySelectorAll("input[name=medida]:checked"), function (i) { return i.value; });
    est.usos = Array.prototype.map.call(filtrosForm.querySelectorAll("input[name=uso]:checked"), function (i) { return i.value; });
    est.marcas = Array.prototype.map.call(filtrosForm.querySelectorAll("input[name=marca]:checked"), function (i) { return i.value; });
  }
  P.catalogo = {
    rubro: function (id) {
      est.rubro = id; est.medidas = []; medidasDelRubro(); aplicar();
      var chip = seccion.querySelector("[data-rubro-f=\"" + id + "\"]"), tira = chip && chip.closest(".chips--rubros");
      if (tira && tira.scrollTo) tira.scrollTo({ left: Math.max(0, chip.offsetLeft - (tira.clientWidth - chip.offsetWidth) / 2), behavior: P.reducido() ? "auto" : "smooth" });
    },
    buscar: function (t) { est.rubro = "todos"; est.medidas = []; medidasDelRubro(); est.q = (t || "").trim(); aplicar(); },
    limpiar: function () {
      est = { rubro: "todos", q: "", medidas: [], usos: [], marcas: [] };
      Array.prototype.forEach.call(filtrosForm.querySelectorAll("input[type=checkbox]"), function (i) { i.checked = false; });
      medidasDelRubro(); aplicar();
    },
    ir: function () {
      var h = document.getElementById("t-cat");
      seccion.scrollIntoView({ behavior: P.reducido() ? "auto" : "smooth", block: "start" });
      h.focus({ preventScroll: true });
    }
  };

  chipsRubro.forEach(function (c) { c.addEventListener("click", function () { P.catalogo.rubro(c.getAttribute("data-rubro-f")); }); });
  Array.prototype.forEach.call(document.querySelectorAll("[data-rubro-ir]"), function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); P.catalogo.rubro(a.getAttribute("data-rubro-ir")); P.catalogo.ir(); });
  });
  filtrosForm.addEventListener("change", function () { leerFiltros(); aplicar(); });
  filtrosForm.addEventListener("submit", function (e) { e.preventDefault(); });
  seccion.querySelector("[data-filtros-limpiar]").addEventListener("click", function () {
    est.medidas = []; est.usos = []; est.marcas = [];
    Array.prototype.forEach.call(filtrosForm.querySelectorAll("input[type=checkbox]"), function (i) { i.checked = false; });
    aplicar();
  });
  quitarQ.addEventListener("click", function () { est.q = ""; aplicar(); });
  vacioBtn.addEventListener("click", function () { P.catalogo.limpiar(); });
  vacioS.addEventListener("click", function (e) { var b = e.target.closest("[data-sugerida]"); if (b) { P.catalogo.buscar(b.getAttribute("data-sugerida")); } });

  /* a menos de 360 px el placeholder se acorta para que no se corte */
  var angosto = window.matchMedia("(max-width: 359px)");
  function placeholder() { if (inputQ) inputQ.placeholder = angosto.matches ? "Buscá cemento, hierro…" : "Buscá cemento, hierro, ladrillos..."; }
  placeholder();
  if (angosto.addEventListener) angosto.addEventListener("change", placeholder); else if (angosto.addListener) angosto.addListener(placeholder);

  /* buscador del inicio */
  var bus = document.querySelector("[data-buscador]");
  bus.addEventListener("submit", function (e) { e.preventDefault(); P.catalogo.buscar(inputQ.value); P.catalogo.ir(); });
  Array.prototype.forEach.call(bus.querySelectorAll("[data-q]"), function (b) {
    b.addEventListener("click", function () { inputQ.value = b.getAttribute("data-q"); P.catalogo.buscar(inputQ.value); P.catalogo.ir(); });
  });
  window.addEventListener("DOMContentLoaded", function () {
    var m = /^#rubro-([a-z-]+)$/.exec(window.location.hash);
    if (m && seccion.querySelector("[data-rubro-f=\"" + m[1] + "\"]")) { P.catalogo.rubro(m[1]); window.setTimeout(P.catalogo.ir, 0); }
  });

  /* ---------- hoja de filtros (celular) ---------- */
  var dlgF = document.getElementById("filtros");
  P.hoja.registrar({ dialog: dlgF, coincide: function (h) { return h === "#filtros"; }, alAbrir: function () { return !window.matchMedia("(min-width: 900px)").matches; } });
  seccion.querySelector("[data-abrir-filtros]").addEventListener("click", function (e) { P.hoja.ir("#filtros", e.currentTarget); });

  /* ---------- mapa ---------- */
  var dlgM = document.getElementById("mapa");
  P.hoja.registrar({ dialog: dlgM, coincide: function (h) { return h === "#mapa"; } });
  Array.prototype.forEach.call(document.querySelectorAll("[data-abrir-mapa]"), function (b) { b.addEventListener("click", function () { P.hoja.ir("#mapa", b); }); });

  /* ---------- ficha del producto ---------- */
  var dlg = document.getElementById("detalle");
  var $ = function (s) { return dlg.querySelector(s); };
  var actual = null, pendiente = 0;
  var CUANTO = {
    "CEM-001": { txt: "Una bolsa alcanza para unos 4 m² de pared (estimado, Demo).", coef: 0.25, red: 1 },
    "LAD-001": { txt: "Unos 60 ladrillos por m² de pared (estimado, Demo).", coef: 60, red: 1 },
    "ARE-001": { txt: "1 m³ alcanza para unos 33 m² de pared (estimado, Demo).", coef: 0.03, red: 0.5 }
  };
  /* "Unas 5 bolsas", "Un ladrillo", "Unos 0,5 m³": cada uno con su genero */
  function textoCuanto(codigo, n) {
    var t;
    if (codigo === "CEM-001") t = n === 1 ? "Una bolsa" : "Unas " + P.gs(n) + " bolsas";
    else if (codigo === "LAD-001") t = n === 1 ? "Un ladrillo" : "Unos " + P.gs(n) + " ladrillos";
    else t = "Unos " + P.dec(n) + " m³";
    return t + " (estimado, Demo).";
  }
  var pasoDet = $("[data-det-paso]"), btnSumar = $("[data-det-sumar]"), conf = $("[data-det-conf]");

  function disponibilidad(prod) {
    var t = prod.disp === "hay" ? "Hay en el local (ejemplo)" : prod.disp === "no" ? "No hay hoy (ejemplo). Preguntá cuándo vuelve." : "Consultar disponibilidad";
    var cont = $("[data-det-disp]");
    cont.textContent = "";
    var p = P.el("p", "disp " + (prod.disp === "hay" ? "disp--hay" : prod.disp === "no" ? "disp--no" : "disp--cons"));
    p.appendChild(P.icono(prod.disp === "hay" ? "check" : prod.disp === "no" ? "x" : "clock"));
    p.appendChild(P.el("span", null, t));
    cont.appendChild(p);
    if (prod.disp === "consultar") {
      var a = P.el("a", "btn-texto", ""); a.href = $("[data-wa]").href; a.target = "_blank"; a.rel = "noopener"; a.setAttribute("data-wa", "");
      a.appendChild(P.icono("whatsapp-logo")); a.appendChild(document.createTextNode("Hablar con un asesor"));
      cont.appendChild(a); cont.appendChild(P.el("small", "nota-wa", "(Demo) Te lleva al WhatsApp de Multitec"));
    }
  }
  function totalPend() { return "Sumar a la lista · Gs. " + P.gs(pendiente * actual.precio); }
  function pintarSumar() {
    btnSumar.textContent = "";
    btnSumar.appendChild(document.createTextNode(totalPend() + " "));
    btnSumar.appendChild(P.el("span", "btn__demo", "(Demo)"));
  }
  function pintarPaso() {
    pasoDet.textContent = "";
    var g = P.paso(actual, pendiente);
    g.querySelector(".paso__u").textContent = P.unidad(pendiente, actual);
    g.querySelector("[data-menos]").disabled = pendiente <= actual.paso;
    g.querySelector("[data-mas]").disabled = pendiente + P.lista.cantidad(actual.codigo) >= P.maximoDe(actual);
    pasoDet.appendChild(g);
  }
  P.detalleCambio = function (c) { if (actual && actual.codigo === c && dlg.open) pintarPaso(); };

  function llenar(prod) {
    actual = prod; pendiente = prod.paso;
    $("[data-det-rubro]").textContent = prod.rubroNombre;
    $("[data-det-nombre]").textContent = prod.nombre;
    $("[data-det-codigo]").textContent = prod.codigo;
    $("[data-det-codigo-foto]").textContent = prod.codigo;
    $("[data-det-medida]").textContent = prod.medida;
    $("[data-det-para]").textContent = prod.para;
    $("[data-det-con]").textContent = prod.con;
    $("[data-det-con-fila]").hidden = !prod.con;   /* sin dato, la fila no se muestra (nada de "Falta.") */
    $("[data-det-precio]").textContent = "Gs. " + P.gs(prod.precio) + " (Demo) / " + prod.u1;
    $("[data-det-peso]").textContent = (prod.peso % 1 ? P.dec(prod.peso) : P.gs(prod.peso)) + " kg por " + prod.u1;
    var foto = $(".det__foto"), img = $("[data-det-foto]");
    foto.classList.remove("det__foto--sinfoto");
    img.alt = prod.alt;
    img.src = "fotos/" + prod.foto + "-640.webp";
    if (P.estado === "sinfotos") foto.classList.add("det__foto--sinfoto");
    disponibilidad(prod);
    /* cuanto necesito */
    var cu = CUANTO[prod.codigo], sec = $("[data-det-cuanto]");
    sec.hidden = !cu;   /* solo 3 productos tienen cuenta: en el resto la seccion no se muestra */
    $("[data-det-cuanto-txt]").textContent = cu ? cu.txt : "";
    $("#det-m2").value = ""; $("[data-det-res]").textContent = ""; $("[data-det-m2-err]").hidden = true; $("#det-m2").removeAttribute("aria-invalid");
    var agotado = prod.disp === "no";
    btnSumar.disabled = agotado;
    btnSumar.setAttribute("aria-label", agotado ? "No disponible: " + prod.nombre : "Sumar " + prod.nombre + " a la lista");
    if (agotado) btnSumar.textContent = "Sumar a la lista"; else pintarSumar();
    pintarPaso();
    if (agotado) Array.prototype.forEach.call(pasoDet.querySelectorAll("button"), function (b) { b.disabled = true; });
    conf.hidden = true; conf.textContent = "";
    $(".hoja__scroll").scrollTop = 0;
  }
  $("[data-det-foto]").addEventListener("error", function () { $(".det__foto").classList.add("det__foto--sinfoto"); });

  pasoDet.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b || b.disabled) return;
    var inc = b.hasAttribute("data-mas") ? actual.paso : -actual.paso;
    pendiente = Math.max(actual.paso, Math.round((pendiente + inc) * 10) / 10);
    var libre = P.maximoDe(actual) - P.lista.cantidad(actual.codigo);
    if (pendiente > libre) pendiente = Math.max(actual.paso, libre);
    pintarPaso(); pintarSumar();
    var foco = pasoDet.querySelector(b.hasAttribute("data-mas") ? "[data-mas]" : "[data-menos]");
    if (foco && !foco.disabled) foco.focus();
  });
  btnSumar.addEventListener("click", function () {
    if (!actual || btnSumar.disabled) return;
    var antes = P.lista.cantidad(actual.codigo);
    var libre = P.maximoDe(actual) - antes;
    if (libre <= 0) { conf.textContent = P.textoMaximo(); conf.hidden = false; return; }
    var r = P.lista.sumar(actual.codigo, pendiente);
    var puesto = r.cantidad - antes;
    P.volar(btnSumar);
    conf.hidden = false;
    conf.textContent = r.topado ? P.textoMaximo() : "Sumaste " + actual.nombre + ", " + P.cantidad(puesto, actual) + " " + P.unidad(puesto, actual) + ".";
    P.anunciar(conf.textContent);
    pendiente = actual.paso;
    pintarPaso(); pintarSumar();
  });

  /* cuanto necesito (3 productos) */
  var m2 = $("#det-m2"), m2err = $("[data-det-m2-err]"), res = $("[data-det-res]");
  m2.addEventListener("input", function () {
    var cu = actual && CUANTO[actual.codigo];
    if (!cu) return;
    var r = P.parseM2(m2.value);
    if (r.vacio) { m2err.hidden = true; m2.removeAttribute("aria-invalid"); res.textContent = ""; return; }
    if (r.error) { m2err.textContent = r.error; m2err.hidden = false; m2.setAttribute("aria-invalid", "true"); res.textContent = ""; return; }
    m2err.hidden = true; m2.removeAttribute("aria-invalid");
    var n = P.calcular(r.valor, cu.coef, cu.red);
    res.textContent = textoCuanto(actual.codigo, n);
  });

  P.hoja.registrar({
    dialog: dlg,
    coincide: function (h) { return /^#producto-[A-Z]{3}-\d{3}$/.test(h); },
    alAbrir: function (h) { var prod = P.productos[h.slice(10)]; if (!prod) return false; llenar(prod); return true; }
  });
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-detalle]");
    if (!b) return;
    var li = b.closest("[data-codigo]");
    if (li) P.hoja.ir("#producto-" + li.getAttribute("data-codigo"), b);
  });

  aplicar();
  medidasDelRubro();
})();
