/* La Primera Hornada (Demo): estados de la pagina, solo para revisar (por parametro, sin riesgo):
   ?estado=cerrado | cargando | sinfotos | agotado | error.  Tambien: foto que falla -> bloque manteca con el nombre; sin conexion -> aviso.
   El reloj real NO cierra la demo: "cerrado" se ve solo con ?estado=cerrado. */
(function () {
  "use strict";
  var P = window.Primera;
  if (!P) return;
  var E = P.estado;

  /* ---- bloque manteca con el nombre (sin foto / foto que falla) ---- */
  function sinFoto(img) {
    if (!img || !img.parentNode || img.getAttribute("data-sin")) return;
    var cont = img.closest("[data-nombre]");
    var nombre = cont ? cont.getAttribute("data-nombre") : "";
    if (!nombre && img.closest(".hero__foto")) nombre = "La Primera Hornada";
    var d = P.el("div", "sinfoto");
    d.setAttribute("data-sin", "1");
    d.setAttribute("aria-hidden", "true");
    if (nombre) d.appendChild(P.el("span", null, nombre));
    img.parentNode.replaceChild(d, img);
  }
  /* error de carga: el evento no burbujea, se escucha en captura */
  document.addEventListener("error", function (e) {
    if (e.target && e.target.tagName === "IMG" && e.target.closest("main, dialog")) sinFoto(e.target);
  }, true);
  Array.prototype.forEach.call(document.querySelectorAll("main img, dialog img"), function (img) {
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) sinFoto(img);
  });

  if (E === "sinfotos") {
    Object.keys(P.catalogo || {}).forEach(function (id) { P.catalogo[id].foto = ""; });
    Array.prototype.forEach.call(document.querySelectorAll("main img[src^='fotos/']"), sinFoto);
  }

  /* ---- local cerrado: aviso arriba y el boton principal pasa a "Ver el pan" ---- */
  if (E === "cerrado") {
    var aviso = document.getElementById("aviso-cerrado");
    if (aviso) {
      aviso.hidden = false;
      var abre = aviso.querySelector("[data-abre]");
      if (abre) abre.textContent = P.ahora() < P.min("06:00") ? "hoy" : "mañana";
    }
    var principal = document.querySelector("[data-principal]");
    if (principal) { principal.textContent = "Ver el pan"; principal.setAttribute("href", "#todo-el-pan"); }
  }

  /* ---- cargando: fantasmas con la forma final, sin spinner ---- */
  var grilla = document.querySelector("[data-grilla]");
  if (E === "cargando" && grilla) {
    document.body.setAttribute("data-cargando", "");
    for (var i = 0; i < 6; i++) {
      var f = P.el("li", "fantasma"); f.setAttribute("aria-hidden", "true"); grilla.appendChild(f);
    }
    var tab = document.querySelector("[data-tablero]");
    if (tab) for (var j = 0; j < 4; j++) { var r = P.el("li", "fantasma fantasma--fila"); r.setAttribute("aria-hidden", "true"); tab.appendChild(r); }
    P.anunciar("Cargando el pan.");
  }

  /* ---- error al cargar ---- */
  if (E === "error" && grilla) {
    document.body.setAttribute("data-cargando", "");
    var caja = P.el("li", "falla");
    caja.appendChild(P.el("p", "falla__txt", "No pudimos cargar el pan. Probá de nuevo en un rato."));
    var b = P.el("button", "boton boton--tinta", "Reintentar");
    b.type = "button";
    b.addEventListener("click", function () { window.location.href = window.location.pathname; });
    caja.appendChild(b);
    grilla.appendChild(caja);
  }

  /* ---- agotado: la chipa en la grilla (el tablero lo maneja tablero.js) ---- */
  if (E === "agotado") {
    var li = document.querySelector('[data-grilla] [data-id="chipa"]');
    if (li) {
      li.classList.add("prod--agotado");
      var linea = li.querySelector(".prod__linea");
      if (linea) linea.textContent = "Se terminó (ejemplo). Vuelve " + (P.ahora() < P.min("06:30") ? "hoy" : "mañana") + " 06:30.";
      var bt = li.querySelector("[data-sumar]");
      if (bt) { bt.disabled = true; bt.setAttribute("aria-label", "No disponible: Chipa"); }
    }
  }

  /* ---- sin conexion ---- */
  var red = null;
  window.addEventListener("offline", function () {
    if (red) { red.hidden = false; return; }
    red = P.el("div", "aviso-red");
    red.setAttribute("role", "alert");
    red.appendChild(P.el("p", null, "Sin conexión. Revisá tu internet y probá de nuevo."));
    var b2 = P.el("button", "boton boton--tinta", "Reintentar");
    b2.type = "button";
    b2.addEventListener("click", function () { window.location.reload(); });
    red.appendChild(b2);
    document.body.insertBefore(red, document.body.firstChild);
  });
  window.addEventListener("online", function () { if (red) red.hidden = true; });
})();
