/* =========================================================
   ESTE ES EL ÚNICO ARCHIVO QUE TIENES QUE TOCAR.
   - PERFIL: tus datos (se edita una vez).
   - PROYECTOS: añade un bloque { ... } por cada trabajo nuevo.
   Copia un proyecto, pégalo arriba del todo y cambia los textos.
   ========================================================= */

const PERFIL = {
  nombre: "Antonio José Martín",
  rol: "Marketing digital · Contenido · IA",
  // Tu propuesta de valor en UNA frase: qué haces + para quién + qué consigues.
  frase: "Creo contenido, webs y automatizaciones con IA que hacen crecer marcas y medios digitales.",
  ubicacion: "San Fernando, Cádiz",
  disponible: "Abierto a prácticas y primer empleo", // o "" para ocultarlo
  email: "antoniomartin.mkt@gmail.com",
  cv: "cv.pdf", // sube tu CV al repositorio con este nombre

  // FOTO DE PERFIL: sube tu foto a la carpeta img con este nombre (vertical, buena luz).
  foto: "img/foto.jpg",

  // BURBUJAS FLOTANTES: pega el enlace de cada perfil. Si "url" está vacío, la burbuja no aparece.
  // "web" es el dominio de la plataforma: de ahí sale su icono automáticamente.
  perfiles: [
    { nombre: "LinkedIn",  web: "linkedin.com",    url: "" },
    { nombre: "InfoJobs",  web: "infojobs.net",    url: "" },
    { nombre: "GitHub",    web: "github.com",      url: "https://github.com/AntonioMartin-Mkt" },
    { nombre: "Instagram", web: "instagram.com",   url: "" },
    { nombre: "TikTok",    web: "tiktok.com",      url: "" },
    { nombre: "Gmail",     web: "mail.google.com", url: "mailto:antoniomartin.mkt@gmail.com" }
  ],

  // SOBRE MÍ: un párrafo que cuenta tu trayectoria (estudios + experiencia).
  sobreMi: "Soy Antonio, estudiante de Marketing y Publicidad (Grado Superior) en San Fernando, Cádiz. Vengo del mundo comercial: tengo el Grado Medio en Actividades Comerciales y he trabajado de camarero en tres bares, donde aprendí lo que ninguna asignatura enseña: entender al cliente, trabajar bajo presión y en equipo. Durante tres meses de Erasmus en Italia creé publicaciones para redes sociales y trabajé como modelo, así que conozco la marca desde los dos lados de la cámara. Hoy gestiono el marketing digital de un medio de noticias en prácticas y estoy centrado en lo que viene: integrar la IA y las automatizaciones en el día a día del marketing.",

  // LO QUE SÉ HACER: lo primero que verá el reclutador después de tu nombre.
  habilidades: [
    { icono: "📱", titulo: "Gestión de redes sociales", texto: "Planificación, calendario editorial, publicación y análisis de métricas." },
    { icono: "✍️", titulo: "Creación de contenido", texto: "Copys, piezas gráficas y vídeo corto adaptados a cada red." },
    { icono: "🤖", titulo: "Automatizaciones con IA", texto: "Procesos que ahorran tiempo: flujos, integraciones y IA generativa." },
    { icono: "🔎", titulo: "SEO", texto: "Posicionamiento web: palabras clave, contenido optimizado y SEO técnico básico." },
    { icono: "🎯", titulo: "Google Ads", texto: "Campañas de búsqueda: estructura, anuncios y optimización." },
    { icono: "💻", titulo: "HTML y web", texto: "Maquetación de páginas y landing pages; esta web la he hecho yo." },
    { icono: "📧", titulo: "Email marketing", texto: "Newsletters y secuencias automáticas con Acumbamail." },
    { icono: "🎨", titulo: "Diseño y presentaciones", texto: "Piezas en Canva y presentaciones que se entienden de un vistazo." }
  ],

  // 3 cifras que un reclutador entienda en 2 segundos. Sustitúyelas por datos reales.
  cifras: [
    { valor: "+XX%", texto: "alcance en redes (prácticas en medio digital)" },
    { valor: "3 meses", texto: "Erasmus en Italia creando contenido" },
    { valor: "XX", texto: "proyectos de marketing" }
  ],
  herramientas: ["Canva", "HTML/CSS", "Acumbamail", "Google Ads", "Google Analytics", "Make / Zapier", "ChatGPT / Claude", "Meta Business Suite", "GitHub"]
};

/* ---------------------------------------------------------
   CATEGORÍAS DISPONIBLES (usa exactamente estos nombres):
   "Diseño", "Presentaciones", "Web", "Email marketing",
   "Automatización", "Redes sociales", "Estrategia"
   CONTEXTO: "Clase", "Prácticas" o "Personal"
   FECHA: "AAAA-MM" (sirve para ordenarlos)
   COLORES: la paleta del proyecto, de 1 a 3 colores en formato "#RRGGBB".
            El 1º es el fondo de la portada, el 2º el círculo y el 3º la franja inferior.
            Déjalo vacío [] y se usa el color de su categoría.
            Busca paletas en coolors.co o con el cuentagotas de Canva.
   CARPETA: cada trabajo vive en trabajos/<nombre-corto>/ con sus archivos dentro.
   IMAGEN: "trabajos/<nombre>/portada.jpg" (o "" y se genera portada automática)
   ENLACE: "trabajos/<nombre>/" o un link externo (Canva, PDF...) o ""
   --------------------------------------------------------- */

const PROYECTOS = [
  {
    titulo: "Gestión de marketing digital de un medio de noticias",
    categoria: "Redes sociales",
    contexto: "Prácticas",
    fecha: "2026-10",
    destacado: true,
    colores: [],
    resumen: "Planificación y publicación de contenido para un periódico digital.",
    reto: "Aumentar el alcance de las noticias en redes y llevar tráfico a la web.",
    solucion: "Calendario editorial, piezas en Canva adaptadas a cada red y seguimiento semanal de métricas.",
    resultado: "EJEMPLO → sustituye por un dato real: +XX% alcance en X semanas.",
    herramientas: ["Canva", "Meta Business Suite", "Google Analytics"],
    imagen: "",
    enlace: ""
  },
  {
    titulo: "Newsletter de Halloween para El Corte Inglés",
    categoria: "Email marketing",
    contexto: "Clase",
    fecha: "2026-10",
    destacado: true,
    colores: ["#F08A3C", "#3A2850", "#16141A"],
    resumen: "Newsletter de temporada programada en HTML y cargada en MailerLite: cabecera animada, pegatinas que llevan a cada producto y un código de descuento. Concepto académico, no es una comunicación oficial.",
    reto: "Anunciar la llegada de Halloween con un email que destaque en la bandeja de entrada, lleve a comprar disfraces y decoración y se vea bien en Gmail, Outlook y el móvil.",
    solucion: "Programé la plantilla en HTML para email (tablas, estilos en línea y botones compatibles con Outlook). Diseñé una cabecera animada con un castillo y el logo iluminado, titulares con tipografía de Halloween, murciélagos animados, pegatinas que enlazan a cada producto y un bloque «¿Truco o trato?» con código de descuento. Alojé las imágenes en GitHub Pages y monté la campaña en MailerLite.",
    resultado: "Campaña lista en MailerLite, adaptada al móvil y con 8 productos enlazados. Al ser un concepto de clase, todavía no tiene datos de envío.",
    herramientas: ["HTML", "CSS", "MailerLite", "GitHub Pages"],
    imagen: "trabajos/halloween/portada.jpg",
    enlace: "trabajos/halloween/email.html"
  },
  {
    titulo: "Newsletter de bienvenida con Acumbamail",
    categoria: "Email marketing",
    contexto: "Clase",
    fecha: "2026-10",
    destacado: false,
    colores: [],
    resumen: "EJEMPLO: secuencia de bienvenida para nuevos suscriptores.",
    reto: "Qué problema o encargo había.",
    solucion: "Qué hiciste tú, con decisiones concretas.",
    resultado: "Qué se consiguió o qué aprendiste (aperturas, clics, nota...).",
    herramientas: ["Acumbamail", "Canva"],
    imagen: "",
    enlace: ""
  },
  {
    titulo: "Landing de captación «Family Club» con altas automáticas",
    categoria: "Web",
    contexto: "Clase",
    fecha: "2026-10",
    destacado: true,
    colores: ["#0058A3", "#FFDA1A", "#111418"],
    resumen: "Landing page para el club de fidelización de HEMKÄNSLA, una marca ficticia de hogar de estilo nórdico. Programada desde cero y conectada a una automatización real.",
    reto: "Conseguir altas en el club de socios y suscriptores a ofertas, con consentimiento claro y cumpliendo el RGPD.",
    solucion: "Diseñé la página con un formulario en la cabecera y otro al final, tarjetas de beneficios con ventanas emergentes, un carrusel de reseñas y textos legales. Con Apps Script, cada alta se guarda en Google Sheets y recibe un email de bienvenida distinto según la opción que marque.",
    resultado: "Un embudo de captación completo, de la visita al email de bienvenida, sin herramientas de pago. Aprendí a separar los consentimientos y a automatizar el seguimiento de leads.",
    herramientas: ["HTML", "CSS", "JavaScript", "Google Apps Script", "Google Sheets"],
    imagen: "trabajos/hemkansla/portada.jpg",
    enlace: "trabajos/hemkansla/"
  }
];
