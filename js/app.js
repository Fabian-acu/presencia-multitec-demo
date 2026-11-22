/* Presencia Multitec - arma la pagina a partir de negocio.js. Sin dependencias. */
(function () {
  "use strict";
  // Demos por tema (demos/*.js): solo se usan con ?tema=... y si el archivo esta incluido en index.html.
  var temaUrl = new URLSearchParams(location.search).get("tema");
  var N = (window.DEMOS && window.DEMOS[temaUrl]) || window.NEGOCIO;
  var app = document.getElementById("app");
  if (!N || !app) { return; }

  var C = N.contacto || {};
  // En la demo el nombre inventado siempre se ve con "(Demo)"
  var nombreVer = N.demo && !/(demo)/i.test(N.nombre) ? N.nombre + " (Demo)" : N.nombre;
  var T = Object.assign({
    servicios: "Servicios", galeria: "Trabajos", horarios: "Horarios",
    ubicacion: "Dónde estamos", cierre: "¿Hablamos?"
  }, N.textos || {});
  var LABEL_WA = "Escribinos por WhatsApp";
  var TEMAS = { estetica: 1, comida: 1, comercio: 1 };

  /* ---------- utilidades ---------- */
  function el(tag, props) {
    var node = document.createElement(tag);
    var p = props || {};
    Object.keys(p).forEach(function (k) {
      if (k === "class") { node.className = p[k]; }
      else if (k === "text") { node.textContent = p[k]; }
      else { node.setAttribute(k, p[k]); }
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c) { node.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }
    }
    return node;
  }

  // Solo se aceptan rutas relativas o http(s)/tel/mailto.
  function seguro(u) {
    return /^(https?:\/\/|tel:|mailto:|\.?\/?[\w\-./%]+$)/i.test(u || "") ? u : "#";
  }

  function waLink(mensaje) {
    var num = String(C.whatsapp || "").replace(/\D/g, "");
    var txt = mensaje || C.mensaje || "";
    return "https://wa.me/" + num + (txt ? "?text=" + encodeURIComponent(txt) : "");
  }

  function mapaLink() {
    if (C.mapa_link) { return seguro(C.mapa_link); }
    var q = [C.direccion, C.ciudad].filter(Boolean).join(", ");
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
  }

  // Foto con respaldo. Si el archivo falta:
  //  - demo: queda un fondo sobrio del tema con el rotulo "Foto del negocio";
  //  - cliente real (demo:false): se llama a o.alFallar y quien la usa oculta el bloque.
  function foto(src, alt, opts) {
    var o = opts || {};
    var box = el("div", { class: "foto" + (o.clase ? " " + o.clase : "") });
    var img = el("img", { alt: alt || "", decoding: "async" });
    var cerrada = false;
    var vacia = function () {
      if (cerrada) { return; }
      cerrada = true;
      box.classList.add("vacia");
      if (img.parentNode) { box.removeChild(img); }
      if (N.demo) { box.appendChild(el("span", { class: "foto-nota", text: "Foto del negocio" })); }
      if (o.alFallar && !N.demo) { o.alFallar(box); }
    };
    if (o.prioridad) { img.setAttribute("fetchpriority", "high"); } else { img.setAttribute("loading", "lazy"); }
    if (src) {
      img.setAttribute("src", seguro(src));
      box.appendChild(img);
      // Sonda: avisa si el archivo no existe aunque la imagen sea lazy y todavia no se haya pedido
      var sonda = new Image();
      sonda.onerror = vacia;
      sonda.onload = function () { if (o.alCargar) { o.alCargar(box); } };
      sonda.src = seguro(src);
    } else {
      setTimeout(vacia, 0); // sin ruta: ya esta armada la pagina cuando se ejecuta
    }
    return box;
  }

  // Glifo de WhatsApp (marca de Meta; trazo de Simple Icons, CC0). Hereda el color del boton.
  var WA_PATH = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z";
  function iconoWA() {
    var ns = "http://www.w3.org/2000/svg";
    var s = document.createElementNS(ns, "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("class", "ico");
    s.setAttribute("aria-hidden", "true");
    s.setAttribute("focusable", "false");
    var p = document.createElementNS(ns, "path");
    p.setAttribute("d", WA_PATH);
    p.setAttribute("fill", "currentColor");
    s.appendChild(p);
    return s;
  }
  function btnWA(clase, label) {
    return el("a", { class: "btn " + (clase || ""), href: waLink(), rel: "noopener" },
      iconoWA(), el("span", { text: label || LABEL_WA }));
  }

  function titulo(txt, id) {
    return el("h2", { class: "titulo", id: id, text: txt });
  }

  /* ---------- tema y color ---------- */
  var params = new URLSearchParams(location.search);
  var tema = TEMAS[params.get("tema")] ? params.get("tema") : (TEMAS[N.tema] ? N.tema : "estetica");
  document.documentElement.setAttribute("data-tema", tema);

  // Letra libre (SIL OFL) de Google Fonts, solo la del tema elegido. Si no carga, queda la del sistema.
  var FUENTES = {
    estetica: "family=Hanken+Grotesk:wght@400;600;700",
    comida: "family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;600",
    comercio: "family=Archivo:wght@400;600;800"
  };
  [["https://fonts.googleapis.com", false], ["https://fonts.gstatic.com", true]].forEach(function (p) {
    var l = el("link", { rel: "preconnect", href: p[0] });
    if (p[1]) { l.setAttribute("crossorigin", ""); }
    document.head.appendChild(l);
  });
  document.head.appendChild(el("link", { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?" + FUENTES[tema] + "&display=swap" }));
  if (N.demo) { document.body.classList.add("demo"); }

  function luz(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
    if (!m) { return null; }
    var v = [0, 2, 4].map(function (i) {
      var c = parseInt(m[1].substr(i, 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }
  if (N.acento && luz(N.acento) !== null) {
    var L = luz(N.acento);
    var st = document.documentElement.style;
    st.setProperty("--acento", N.acento);
    // Texto sobre el acento: el que de mas contraste
    st.setProperty("--acento-ink", (L + 0.05) / 0.058 > 1.05 / (L + 0.05) ? "#15171a" : "#ffffff");
  }

  // Credito de fotos de stock (Pexels): "Fotos: autor, autor / Pexels", cada autor con link a su foto.
  function creditosFotos() {
    if (!N.creditos || !N.creditos.length) { return null; }
    var p = el("p", { class: "creditos-fotos" }, "Fotos: ");
    N.creditos.forEach(function (c, i) {
      if (i) { p.appendChild(document.createTextNode(", ")); }
      p.appendChild(el("a", { href: seguro(c.pagina), rel: "noopener", target: "_blank", text: c.autor }));
    });
    p.appendChild(document.createTextNode(" / " + (N.creditos_fuente || "Pexels")));
    return p;
  }

  /* ---------- secciones ---------- */
  var frag = document.createDocumentFragment();

  if (N.demo) {
    frag.appendChild(el("div", { class: "demo-franja", role: "note", text: "Demo: negocio y datos ficticios. Molde Presencia Multitec." }));
  }

  // Cabecera
  frag.appendChild(el("header", { class: "cabecera" },
    el("div", { class: "ancho cabecera-in" },
      el("a", { class: "marca", href: "#inicio", text: nombreVer }),
      btnWA("btn-chico cab-wa", "WhatsApp") // solo en pantalla ancha; en celular la barra fija lo reemplaza
    )
  ));

  var main = el("main", { id: "inicio" });

  var btnPortada = btnWA("btn-grande");
  var btnCierre = btnWA("btn-grande");

  // Portada
  var secPortada = el("section", { class: "portada ancho", "aria-labelledby": "h-portada" },
    el("div", { class: "portada-texto" },
      el("p", { class: "rubro", text: N.rubro }),
      el("h1", { id: "h-portada", text: N.frase }),
      el("p", { class: "sub", text: N.descripcion }),
      el("div", { class: "acciones" },
        btnPortada,
        el("a", { class: "enlace", href: mapaLink(), rel: "noopener", target: "_blank", text: "Cómo llegar" })
      )
    ),
    foto(N.hero && N.hero.foto, N.hero && N.hero.alt, {
      clase: "portada-foto", prioridad: true,
      // cliente real sin foto de portada: portada de solo texto, sin bloque
      alFallar: function (box) { secPortada.classList.add("sin-foto"); if (box.parentNode) { box.parentNode.removeChild(box); } }
    })
  );
  main.appendChild(secPortada);

  // Servicios
  if (N.servicios && N.servicios.length) {
    // La grilla se adapta a la cantidad (3 a 6 recomendado): clases n-1 ... n-6
    var lista = el("ul", { class: "servicios n-" + Math.min(N.servicios.length, 6) });
    N.servicios.forEach(function (s) {
      var li = el("li", { class: "servicio" });
      li.appendChild(foto(s.foto, s.alt || s.nombre, {
        // cliente real sin foto del servicio: fila de texto, sin miniatura
        alFallar: function (box) { li.classList.add("sin-foto"); if (box.parentNode) { box.parentNode.removeChild(box); } }
      }));
      li.appendChild(el("div", { class: "servicio-txt" },
        el("h3", { text: s.nombre }),
        s.descripcion ? el("p", { text: s.descripcion }) : null,
        s.precio ? el("p", { class: "precio", text: s.precio }) : null
      ));
      lista.appendChild(li);
    });
    main.appendChild(el("section", { class: "seccion ancho", id: "servicios", "aria-labelledby": "h-serv" },
      titulo(T.servicios, "h-serv"), lista));
  }

  // Sobre el negocio
  if (N.sobre) {
    main.appendChild(el("section", { class: "franja" },
      el("div", { class: "ancho" }, el("p", { class: "franja-txt", text: N.sobre }))));
  }

  // Galeria
  if (N.galeria && N.galeria.length) {
    // Celular: tira deslizable. Desde 900 px: grilla (clases g-1 ... g-6, maximo 6 fotos a la vista)
    var tira = el("ul", { class: "tira g-" + Math.min(N.galeria.length, 6), role: "list", "aria-label": T.galeria });
    var secGaleria = el("section", { class: "seccion", id: "galeria", "aria-labelledby": "h-gal" },
      el("div", { class: "ancho" }, titulo(T.galeria, "h-gal")), tira);
    var restantes = N.galeria.length;
    N.galeria.forEach(function (g) {
      var item = el("li");
      item.appendChild(foto(g.foto, g.alt, {
        // cliente real: se sacan las fotos que faltan y, si quedan menos de 3, no hay galeria
        alFallar: function () {
          restantes -= 1;
          if (item.parentNode) { item.parentNode.removeChild(item); }
          if (restantes < 3) { secGaleria.hidden = true; }
          else { tira.className = "tira g-" + Math.min(restantes, 6); }
        }
      }));
      tira.appendChild(item);
    });
    main.appendChild(secGaleria);
  }

  // Horarios y ubicacion
  var hor = el("ul", { class: "horarios" });
  (N.horarios || []).forEach(function (h) {
    hor.appendChild(el("li", {},
      el("span", { text: h.dias }),
      el("span", { class: "hora", text: h.cerrado ? "Cerrado" : (h.abre + " a " + h.cierra) })
    ));
  });

  var redes = el("ul", { class: "redes" });
  (N.redes || []).forEach(function (r) {
    redes.appendChild(el("li", {}, el("a", { href: seguro(r.url), rel: "noopener", target: "_blank", text: r.nombre })));
  });

  var dir = [C.direccion, C.ciudad].filter(Boolean).join(", ");
  var lugar = el("div", { class: "lugar" },
    el("h2", { text: T.ubicacion }),
    el("p", { class: "direccion", text: dir }),
    C.telefono_visible ? el("p", { class: "tel", text: C.telefono_visible }) : null,
    C.mapa_embed && /^https:\/\/www\.google\.com\/maps\/embed/i.test(C.mapa_embed)
      ? el("iframe", { class: "mapa", src: C.mapa_embed, title: "Mapa de " + N.nombre, loading: "lazy", referrerpolicy: "no-referrer-when-downgrade", allowfullscreen: "" })
      : null,
    el("a", { class: "btn btn-borde", href: mapaLink(), rel: "noopener", target: "_blank", text: "Cómo llegar" }),
    redes.childNodes.length ? redes : null
  );

  main.appendChild(el("section", { class: "seccion ancho dos", id: "ubicacion", "aria-labelledby": "h-hor" },
    el("div", { class: "horarios-bloque" }, titulo(T.horarios, "h-hor"), hor),
    lugar
  ));

  // Cierre
  main.appendChild(el("section", { class: "cierre" },
    el("div", { class: "ancho" },
      el("h2", { class: "cierre-titulo", text: T.cierre }),
      btnCierre
    )));

  frag.appendChild(main);

  frag.appendChild(el("footer", { class: "pie" },
    el("div", { class: "ancho" },
      el("p", { text: "© " + new Date().getFullYear() + " " + nombreVer }),
      creditosFotos(),
      el("p", { class: "credito", text: "Web hecha con Presencia Multitec" })
    )));

  // Barra fija de WhatsApp (solo celular)
  var barra = el("div", { class: "barra-wa" }, btnWA("btn-grande"));
  frag.appendChild(barra);

  app.appendChild(frag);

  // La barra aparece cuando el boton de la portada sale de pantalla y se esconde al ver el del cierre.
  if ("IntersectionObserver" in window) {
    var portadaVisible = true, cierreVisible = false;
    var pintarBarra = function () {
      var mostrar = !portadaVisible && !cierreVisible;
      barra.classList.toggle("visible", mostrar);
      barra.setAttribute("aria-hidden", mostrar ? "false" : "true");
      if ("inert" in barra) { barra.inert = !mostrar; }
    };
    barra.classList.add("con-js");
    new IntersectionObserver(function (it) {
      var e = it[it.length - 1];
      portadaVisible = e.isIntersecting || e.boundingClientRect.top > 0;
      pintarBarra();
    }).observe(btnPortada);
    new IntersectionObserver(function (it) {
      cierreVisible = it[it.length - 1].isIntersecting;
      pintarBarra();
    }).observe(btnCierre);
    pintarBarra();
  }

  // La tira de la galeria solo recibe foco de teclado si de verdad se desliza
  var tiraEl = app.querySelector(".tira");
  if (tiraEl && tiraEl.scrollWidth > tiraEl.clientWidth) { tiraEl.setAttribute("tabindex", "0"); }

  /* ---------- aparicion al hacer scroll (el contenido ya es visible por defecto) ---------- */
  var quieto = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!quieto && "IntersectionObserver" in window) {
    var objetivos = app.querySelectorAll(".seccion .titulo, .servicio, .franja-txt, .tira li, .horarios-bloque, .lugar, .cierre .ancho");
    var io = new IntersectionObserver(function (items) {
      items.forEach(function (it) {
        if (it.isIntersecting) { it.target.classList.add("in"); io.unobserve(it.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    var alto = window.innerHeight;
    objetivos.forEach(function (n) {
      if (n.getBoundingClientRect().top > alto) { n.classList.add("rv"); io.observe(n); }
    });
  }

  /* ---------- SEO: titulo, descripcion, Open Graph y JSON-LD ---------- */
  var S = N.seo || {};
  var titulo_seo = (S.titulo || N.nombre) + (N.demo && !/(demo)/i.test(S.titulo || "") ? " (Demo)" : "");
  var desc_seo = S.descripcion || N.descripcion || "";
  var imagen = S.imagen || (N.hero && N.hero.foto) || "";
  var base = S.url ? S.url.replace(/\/$/, "") + "/" : "";

  function absoluta(u) {
    if (!u) { return ""; }
    if (/^https?:\/\//i.test(u)) { return u; }
    return base ? base + u.replace(/^\.?\//, "") : u;
  }
  function meta(attr, nombre, valor) {
    if (!valor) { return; }
    var m = document.head.querySelector("meta[" + attr + "=\"" + nombre + "\"]");
    if (!m) { m = el("meta"); m.setAttribute(attr, nombre); document.head.appendChild(m); }
    m.setAttribute("content", valor);
  }
  document.title = titulo_seo;
  meta("name", "description", desc_seo);
  meta("property", "og:title", titulo_seo);
  meta("property", "og:description", desc_seo);
  meta("property", "og:image", absoluta(imagen));
  meta("property", "og:url", base);
  meta("property", "og:site_name", nombreVer);
  meta("name", "twitter:card", "summary_large_image");
  if (base && !document.head.querySelector("link[rel=canonical]")) {
    document.head.appendChild(el("link", { rel: "canonical", href: base }));
  }
  var color = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
  if (color) { meta("name", "theme-color", color); }

  var DIAS = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  var horas = [];
  (N.horarios || []).forEach(function (h) {
    if (h.cerrado || !h.dow) { return; }
    horas.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.dow.map(function (d) { return DIAS[d]; }),
      opens: h.abre, closes: h.cierra
    });
  });
  var ld = {
    "@context": "https://schema.org",
    "@type": N.schema_tipo || "LocalBusiness",
    name: N.nombre,
    description: desc_seo,
    address: {
      "@type": "PostalAddress",
      streetAddress: C.direccion || "",
      addressLocality: C.ciudad || "",
      addressCountry: C.pais || ""
    }
  };
  if (base) { ld.url = base; }
  if (imagen) { ld.image = absoluta(imagen); }
  if (C.telefono_visible) { ld.telephone = C.telefono_visible; }
  if (horas.length) { ld.openingHoursSpecification = horas; }
  if ((N.redes || []).length) { ld.sameAs = N.redes.map(function (r) { return r.url; }); }
  // En la demo no se publica JSON-LD (el negocio es ficticio)
  if (!N.demo) {
  var sc = el("script", { type: "application/ld+json" });
  sc.textContent = JSON.stringify(ld);
  document.head.appendChild(sc);
  }
})();
