/* Taller Aviso (Demo): estados. Para revisar sin tocar el reloj ni la red:
   ?estado=cerrado  aviso de local cerrado (el reloj real NUNCA cierra la demo)
   ?estado=cargando filas y bloques fantasma, sin texto ni foto
   ?estado=sinfotos bloque chapa con el nombre de cada foto
   ?estado=error    como sinfotos + aviso "No pudimos cargar las fotos"
   ?estado=offline  aviso "Sin conexion"
   ?estado=bloqueado (lo lee orden.js) simula que el navegador bloquea la ventana de WhatsApp
   Tambien se activan solos: una foto que falla, y los eventos offline/online del navegador. */
(function () {
  "use strict";
  var A = window.Aviso = window.Aviso || {};
  var estado = A.estado;
  var avisoRed = document.querySelector("[data-red]");
  var avisoFotos = document.querySelector("[data-fotos-error]");

  /* ---- local cerrado: la hora de la proxima apertura sale del reloj, pero SOLO se muestra con ?estado=cerrado ---- */
  function textoCerrado() {
    var ahora = new Date();
    var dia = ahora.getDay();                                   /* 0 = domingo */
    var min = ahora.getHours() * 60 + ahora.getMinutes();
    var cuando = "mañana";
    if (dia >= 1 && dia <= 6 && min < 8 * 60) cuando = "hoy";   /* antes de las 08:00 de un dia que abre */
    else if (dia === 6 || dia === 0) cuando = "el lunes";       /* sabado ya abierto o domingo */
    return "Ahora estamos cerrados. Abrimos " + cuando + " a las 08:00.";
  }
  if (estado === "cerrado") {
    var cerrado = document.querySelector("[data-cerrado]");
    if (cerrado) { cerrado.textContent = textoCerrado(); cerrado.hidden = false; }
  }

  /* ---- fotos que faltan: bloque chapa con el nombre, nunca la foto de otro lugar ---- */
  var marcos = Array.prototype.slice.call(document.querySelectorAll("[data-foto]"));
  function sinFoto(marco) {
    if (marco.classList.contains("es-vacia")) return;
    var img = marco.querySelector("img");
    var w = img ? Number(img.getAttribute("width")) : 0;
    var h = img ? Number(img.getAttribute("height")) : 0;
    marco.style.setProperty("--rel", w && h ? String(w / h) : "1");
    marco.classList.add("es-vacia");
    if (img) img.hidden = true;
    marco.appendChild(A.el("span", "foto-vacia", marco.getAttribute("data-nombre") || "Foto"));
  }
  function avisarFotos() { if (avisoFotos) avisoFotos.hidden = false; }

  marcos.forEach(function (marco) {
    var img = marco.querySelector("img");
    if (!img) return;
    img.addEventListener("error", function () { sinFoto(marco); avisarFotos(); });
    /* una foto de las que cargan al arrancar pudo fallar antes de que corriera este archivo */
    if (img.getAttribute("loading") !== "lazy" && img.complete && img.naturalWidth === 0) { sinFoto(marco); avisarFotos(); }
  });
  if (estado === "sinfotos" || estado === "error") {
    marcos.forEach(sinFoto);
    if (estado === "error") avisarFotos();
  }

  /* ---- sin conexion ---- */
  function red(sinRed) { if (avisoRed) avisoRed.hidden = !(sinRed || estado === "offline"); }
  if (navigator.onLine === false || estado === "offline") red(true);
  window.addEventListener("offline", function () { red(true); });
  window.addEventListener("online", function () { red(false); });

  /* ---- reintentar: vuelve a pedir la pagina ---- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-reintentar]"), function (b) {
    b.addEventListener("click", function () { window.location.reload(); });
  });
})();
