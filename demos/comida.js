/* DEMO tema "comida": restaurante ficticio. Datos inventados. Fotos de Pexels (licencia Pexels, uso comercial gratis).
   Para un cliente real este archivo no se usa: se borra su linea en index.html. */
(function () {
  var px = function (id, w) { return "https://images.pexels.com/photos/" + id + "/pexels-photo-" + id + ".jpeg?auto=compress&cs=tinysrgb&w=" + (w || 1000); };
  window.DEMOS = window.DEMOS || {};
  window.DEMOS.comida = {
    demo: true, tema: "comida", acento: "",
    nombre: "Fogón del Parque", rubro: "Restaurante", schema_tipo: "Restaurant",
    frase: "Cocina de la casa, mesa para compartir.",
    descripcion: "Almuerzo y cena con reserva por WhatsApp. Abierto de martes a domingo.",
    hero: { foto: px(8753782, 1400), alt: "Salón del restaurante con mesas y sillas de madera" },
    textos: { servicios: "Nuestra cocina", galeria: "El salón", horarios: "Horarios", ubicacion: "Dónde estamos", cierre: "¿Reservamos tu mesa?" },
    servicios: [
      { nombre: "Para empezar", descripcion: "Entradas livianas para compartir en la mesa.", precio: "", foto: px(12018270), alt: "Platos de entrada sobre una mesada de mármol" },
      { nombre: "Platos de la casa", descripcion: "El menú cambia según el día. Consultá cuál es el de hoy.", precio: "A consultar", foto: px(5865244), alt: "Plato servido en vajilla oscura" },
      { nombre: "Platos de autor", descripcion: "Preparaciones para una ocasión especial.", precio: "", foto: px(4870431), alt: "Plato con flores comestibles" },
      { nombre: "Pescados", descripcion: "Cocidos al momento, con guarnición de estación.", precio: "", foto: px(12266289), alt: "Filete de pescado con vegetales" }
    ],
    sobre: "Cocinamos con tiempo y servimos sin apuro. Reservá tu mesa por WhatsApp y te la dejamos lista.",
    galeria: [
      { foto: px(36964673), alt: "Salón luminoso con mesas puestas y flores" },
      { foto: px(36964675), alt: "Mesas junto a los ventanales" },
      { foto: px(7934522), alt: "Mesas redondas blancas y lámparas colgantes" }
    ],
    horarios: [
      { dias: "Martes a domingo", abre: "11:30", cierra: "23:00", dow: [2, 3, 4, 5, 6, 7] },
      { dias: "Lunes", cerrado: true }
    ],
    contacto: {
      whatsapp: "595981601211", telefono_visible: "+595 9XX 000 000 (demo)",
      mensaje: "Hola, vi la demo de Presencia Multitec y quiero una para mi negocio",
      direccion: "Av. Ejemplo 000, Barrio Demo", ciudad: "Ciudad del Este", pais: "PY", mapa_embed: "", mapa_link: ""
    },
    redes: [{ nombre: "Instagram", url: "https://www.instagram.com/" }],
    seo: { titulo: "Fogón del Parque | Restaurante en Ciudad del Este", descripcion: "Restaurante con reserva por WhatsApp. Mirá la cocina, los horarios y cómo llegar.", url: "", imagen: "" },
    creditos: [
      { autor: "picsfast", pagina: "https://www.pexels.com/photo/tables-and-chairs-in-cafeteria-8753782/" },
      { autor: "arif-hakuba", pagina: "https://www.pexels.com/photo/gourmet-dishes-on-a-marble-counter-12018270/" },
      { autor: "rachel-claire", pagina: "https://www.pexels.com/photo/gourmet-on-a-black-earthenware-5865244/" },
      { autor: "roman-odintsov", pagina: "https://www.pexels.com/photo/close-up-photo-of-a-gourmet-dish-4870431/" },
      { autor: "nadin-sh", pagina: "https://www.pexels.com/photo/overhead-shot-of-a-dish-with-fish-12266289/" },
      { autor: "mingyang-liu", pagina: "https://www.pexels.com/photo/bright-modern-restaurant-with-elegant-table-settings-36964673/" },
      { autor: "larissafarber", pagina: "https://www.pexels.com/photo/interior-of-modern-cafe-with-white-round-tables-and-chairs-7934522/" }
    ]
  };
})();
