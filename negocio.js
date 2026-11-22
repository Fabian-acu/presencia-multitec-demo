/*
  PRESENCIA MULTITEC - archivo de datos del negocio.
  Para un cliente nuevo: se cambia SOLO este archivo y las fotos de la carpeta /fotos.
  Esto es una DEMO con datos ficticios. Nada de lo que sigue es un negocio real.
*/
// Solo demo: arma la URL de una foto de Pexels por su numero. Con un cliente real se usan rutas como "fotos/portada.jpg".
var px = function (id, w) { return "https://images.pexels.com/photos/" + id + "/pexels-photo-" + id + ".jpeg?auto=compress&cs=tinysrgb&w=" + (w || 1000); };

window.NEGOCIO = {
  // true muestra la franja "Demo" y los textos de las fotos vacias. Poner false con un cliente real.
  demo: true,

  // Tema visual: "estetica" | "comida" | "comercio"
  tema: "estetica",
  // Color de acento opcional (hex, ej. "#b3274f"). Vacio = el del tema. Debe tener buen contraste con blanco u oscuro.
  acento: "",

  nombre: "Estudio Araucaria",
  rubro: "Peluquería y color",
  frase: "Tu corte, a tu medida y sin apuros.",
  // Una o dos frases. Se usa de subtitulo y de descripcion para Google (maximo 20 palabras en pantalla).
  descripcion: "Corte, color y tratamientos con turno por WhatsApp. Atención de martes a sábado.",
  // Tipo schema.org: LocalBusiness, HairSalon, BeautySalon, Restaurant, Store, AutoPartsStore, etc.
  schema_tipo: "HairSalon",

  // Con un cliente real: rutas propias, por ejemplo "fotos/portada.jpg". La demo usa fotos de Pexels (ver "creditos" abajo).
  hero: { foto: px(7195805, 1400), alt: "Interior de un salón de belleza moderno" },

  // Titulos de seccion (opcionales)
  textos: {
    servicios: "Lo que hacemos",
    galeria: "Algunos trabajos",
    horarios: "Horarios",
    ubicacion: "Dónde estamos",
    cierre: "¿Te reservamos un turno?"
  },

  // De 3 a 6 items (la grilla se adapta sin huecos). precio es opcional: vacio = no se muestra.
  servicios: [
    { nombre: "Corte", descripcion: "Corte a tu medida, con lavado y peinado.", precio: "", foto: px(7195803), alt: "Sillón negro frente al espejo" },
    { nombre: "Color", descripcion: "Tinte, mechas y retoque de raíz. Se define en una consulta previa.", precio: "A consultar", foto: px(7195812), alt: "Estudio de belleza con piletas de lavado" },
    { nombre: "Peinados", descripcion: "Para eventos, con prueba previa si la querés.", precio: "", foto: px(7750124), alt: "Sillones frente a espejos redondos" },
    { nombre: "Barbería", descripcion: "Corte masculino y arreglo de barba.", precio: "", foto: px(9146943), alt: "Interior de una barbería" }
  ],

  // Texto corto sobre el negocio (opcional, hasta 40 palabras). Vacio = no aparece la franja.
  sobre: "Somos un equipo chico que trabaja con turno, para dedicarle tiempo a cada persona. Primero te escuchamos, después cortamos.",

  // Fotos de trabajos (opcional). Vacio = no aparece la galeria.
  galeria: [
    { foto: px(7195807), alt: "Salón luminoso" },
    { foto: px(7195811), alt: "Piletas de lavado junto a la ventana" },
    { foto: px(7750144), alt: "Espejo con aro de luz y sillón negro" }
  ],

  // dow: 1=lunes ... 7=domingo (sirve para Google). cerrado:true para dias sin atencion.
  horarios: [
    { dias: "Martes a viernes", abre: "09:00", cierra: "19:00", dow: [2, 3, 4, 5] },
    { dias: "Sábado", abre: "09:00", cierra: "14:00", dow: [6] },
    { dias: "Domingo y lunes", cerrado: true }
  ],

  contacto: {
    // Solo numeros, con codigo de pais y sin +. En la DEMO va a la linea de Multitec; con un cliente real, su numero.
    whatsapp: "595981601211",
    // Como se ve en pantalla (opcional)
    telefono_visible: "+595 9XX 000 000 (demo)",
    mensaje: "Hola, vi la demo de Presencia Multitec y quiero una para mi negocio",
    direccion: "Av. Ejemplo 000, Barrio Demo",
    ciudad: "Ciudad del Este",
    pais: "PY",
    // Mapa incrustado: en Google Maps, Compartir > Incorporar un mapa > copiar SOLO la URL del src. Vacio = solo boton.
    mapa_embed: "",
    // Link para "Cómo llegar". Vacio = se arma buscando la direccion.
    mapa_link: ""
  },

  redes: [
    { nombre: "Instagram", url: "https://www.instagram.com/" },
    { nombre: "Facebook", url: "https://www.facebook.com/" }
  ],

  seo: {
    titulo: "Estudio Araucaria | Peluquería en Ciudad del Este",
    descripcion: "Peluquería con turno por WhatsApp en Ciudad del Este: corte, color y tratamientos. Mirá los servicios y los horarios.",
    // URL final publicada (sin barra al final). Vacio mientras no haya dominio.
    url: "",
    // Imagen para compartir (ruta o URL, 1200x630 ideal). Vacio = usa la foto de portada.
    imagen: ""
  },

  // Credito de las fotos de stock (solo demo). Con fotos propias del cliente, dejar vacio: [].
  creditos: [
    { autor: "artbovich", pagina: "https://www.pexels.com/photo/backwash-chairs-in-modern-beauty-salon-7195805/" },
    { autor: "gromakova", pagina: "https://www.pexels.com/photo/interior-of-hairdresser-saloon-9146943/" }
  ]
};
