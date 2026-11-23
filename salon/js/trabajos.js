/* Tono Vivo (Demo): Trabajos. Mosaico de 6 fotos de ejemplo; tocar una la abre grande (hoja #foto-N) con "Foto anterior",
   "Foto siguiente", contador "Foto 3 de 6", Cerrar, Esc, flechas del teclado y deslizar. El foco vuelve a la foto que abriste.
   La entrada del mosaico (opacity + translateY 12 px, 40 ms entre fotos, una vez) parte de lo ya visible: si no corre, se ve todo. */
(function () {
  "use strict";
  var T = window.Tono = window.Tono || {};
  var doc = document;
  var botones = doc.querySelectorAll("[data-foto]");
  var dlg = doc.getElementById("hoja-visor");
  if (!dlg || !botones.length) return;
  var caja = dlg.querySelector("[data-visor-caja]");
  var img = dlg.querySelector("[data-visor-img]");
  var cuenta = dlg.querySelector("[data-cuenta]");
  var fotos = [];
  var actual = 0;
  var cambiando = null;

  for (var i = 0; i < botones.length; i++) {
    fotos.push({
      id: botones[i].getAttribute("data-foto"),
      w: parseInt(botones[i].getAttribute("data-w"), 10),
      h: parseInt(botones[i].getAttribute("data-h"), 10),
      alt: botones[i].querySelector("img").alt
    });
    botones[i].addEventListener("click", function (e) {
      var n = parseInt(e.currentTarget.getAttribute("data-n"), 10);
      T.hoja.ir("#foto-" + n, e.currentTarget);
    });
  }

  function poner(n) {
    actual = ((n % fotos.length) + fotos.length) % fotos.length;
    var f = fotos[actual];
    img.setAttribute("width", String(f.w));
    img.setAttribute("height", String(f.h));
    T.cargarFoto(img, "fotos/g-" + f.id + "-1000.webp", f.alt);
    cuenta.textContent = "Foto " + (actual + 1) + " de " + fotos.length;
    caja.classList.remove("cambia");
  }
  function mostrar(n, animar) {
    if (cambiando) { window.clearTimeout(cambiando); cambiando = null; }
    if (!animar || T.reducido()) { poner(n); return; }
    caja.classList.add("cambia");                       /* fundido de 160 ms (opacity) y se cambia la foto */
    cambiando = window.setTimeout(function () { cambiando = null; poner(n); }, 160);
  }
  function numeroDe(h) {
    var m = /^#foto-([1-9][0-9]*)$/.exec(h);
    return m && parseInt(m[1], 10) <= fotos.length ? parseInt(m[1], 10) : 0;
  }
  function ir(delta) { T.hoja.reemplazar("#foto-" + (((actual + delta + fotos.length) % fotos.length) + 1)); }

  T.hoja.registrar({
    dialog: dlg,
    coincide: function (h) { return /^#foto-/.test(h); },
    alAbrir: function (h) {
      var n = numeroDe(h);
      if (!n) return false;
      poner(n - 1);
    },
    alCambiarHash: function (h) { var n = numeroDe(h); if (n) mostrar(n - 1, true); },
    alCerrar: function () { if (cambiando) { window.clearTimeout(cambiando); cambiando = null; } }
  });

  dlg.querySelector("[data-anterior]").addEventListener("click", function () { ir(-1); });
  dlg.querySelector("[data-siguiente-foto]").addEventListener("click", function () { ir(1); });
  dlg.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { e.preventDefault(); ir(-1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); ir(1); }
  });

  /* deslizar de lado: distancia o velocidad (0,11 px/ms), sin confundir con el scroll vertical */
  var x0 = null, y0 = 0, t0 = 0;
  caja.addEventListener("pointerdown", function (e) { x0 = e.clientX; y0 = e.clientY; t0 = e.timeStamp; });
  caja.addEventListener("pointercancel", function () { x0 = null; });
  caja.addEventListener("pointerup", function (e) {
    if (x0 === null) return;
    var dx = e.clientX - x0, dy = e.clientY - y0;
    var v = Math.abs(dx) / Math.max(1, e.timeStamp - t0);
    x0 = null;
    if (Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (Math.abs(dx) > 50 || (Math.abs(dx) > 24 && v >= 0.11)) ir(dx < 0 ? 1 : -1);
  });

  /* entrada del mosaico: al aparecer en pantalla cada foto sube y se aclara (una vez) */
  var mos = doc.querySelector("[data-mosaico]");
  if (mos && "IntersectionObserver" in window && !T.reducido() && Element.prototype.animate) {
    var tiles = mos.querySelectorAll(".tile");
    var cola = 0;
    var obs = new IntersectionObserver(function (ents) {
      for (var k = 0; k < ents.length; k++) {
        if (!ents[k].isIntersecting) continue;
        ents[k].target.animate(
          [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }],
          { duration: 320, delay: (cola % 3) * 40, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "backwards" }
        );
        cola++;
        obs.unobserve(ents[k].target);
      }
    }, { threshold: 0.15 });
    for (var t = 0; t < tiles.length; t++) obs.observe(tiles[t]);
  }
})();
