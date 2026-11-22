/* DEMO tema "comercio": casa de repuestos ficticia. Datos inventados. Fotos de Pexels (licencia Pexels, uso comercial gratis).
   Para un cliente real este archivo no se usa: se borra su linea en index.html. */
(function () {
  var px = function (id, w) { return "https://images.pexels.com/photos/" + id + "/pexels-photo-" + id + ".jpeg?auto=compress&cs=tinysrgb&w=" + (w || 1000); };
  window.DEMOS = window.DEMOS || {};
  window.DEMOS.comercio = {
    demo: true, tema: "comercio", acento: "",
    nombre: "Repuestos Don Ejemplo", rubro: "Repuestos para autos", schema_tipo: "AutoPartsStore",
    frase: "El repuesto que buscás, sin vueltas.",
    descripcion: "Consultá por WhatsApp si tenemos tu repuesto. Atención de lunes a sábado.",
    hero: { foto: px(34133277, 1400), alt: "Caños de escape variados en una pared de rejilla" },
    textos: { servicios: "Qué tenemos", horarios: "Horarios", ubicacion: "Dónde estamos", cierre: "¿Buscás un repuesto?" },
    servicios: [
      { nombre: "Escapes y catalizadores", descripcion: "Consultanos con la marca, el modelo y el año de tu auto.", precio: "A consultar", foto: px(34133278), alt: "Escapes y catalizadores colgados en la pared" },
      { nombre: "Tornillería y fijaciones", descripcion: "Tornillos, tuercas y piezas chicas para reparaciones.", precio: "", foto: px(7568430), alt: "Pila de tornillos y piezas metálicas" },
      { nombre: "Motor y distribución", descripcion: "Piezas para motor. Traé el dato del auto y buscamos.", precio: "", foto: px(35531283), alt: "Motor de auto en primer plano" }
    ],
    sobre: "Escribinos con el modelo y el año de tu auto y te decimos si tenemos la pieza. Te respondemos por WhatsApp.",
    galeria: [],
    horarios: [
      { dias: "Lunes a viernes", abre: "08:00", cierra: "18:00", dow: [1, 2, 3, 4, 5] },
      { dias: "Sábado", abre: "08:00", cierra: "13:00", dow: [6] },
      { dias: "Domingo", cerrado: true }
    ],
    contacto: {
      whatsapp: "595981601211", telefono_visible: "+595 9XX 000 000 (demo)",
      mensaje: "Hola, vi la demo de Presencia Multitec y quiero una para mi negocio",
      direccion: "Av. Ejemplo 000, Barrio Demo", ciudad: "Ciudad del Este", pais: "PY", mapa_embed: "", mapa_link: ""
    },
    redes: [{ nombre: "Facebook", url: "https://www.facebook.com/" }],
    seo: { titulo: "Repuestos Don Ejemplo | Repuestos para autos en Ciudad del Este", descripcion: "Repuestos para autos con consulta por WhatsApp. Mirá qué tenemos, los horarios y cómo llegar.", url: "", imagen: "" },
    creditos: [
      { autor: "enginakyurt", pagina: "https://www.pexels.com/photo/assorted-car-exhaust-parts-in-industrial-workshop-34133277/" },
      { autor: "cottonbro", pagina: "https://www.pexels.com/photo/a-pile-of-metal-spare-parts-7568430/" },
      { autor: "adempercem", pagina: "https://www.pexels.com/photo/close-up-view-of-a-modern-car-engine-35531283/" }
    ]
  };
})();
