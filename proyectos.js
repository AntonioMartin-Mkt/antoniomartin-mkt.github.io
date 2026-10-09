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

  // BURBUJAS FLOTANTES: pega el enlace de cada perfil. Si "url" está vacío, la burbuja no aparece.
  perfiles: [
    { nombre: "LinkedIn",  corto: "in",  color: "#0a66c2", url: "" },
    { nombre: "InfoJobs",  corto: "IJ",  color: "#167db7", url: "" },
    { nombre: "GitHub",    corto: "GH",  color: "#24292f", url: "https://github.com/AntonioMartin-Mkt" },
    { nombre: "Instagram", corto: "IG",  color: "#e1306c", url: "" },
    { nombre: "TikTok",    corto: "TT",  color: "#111111", url: "" },
    { nombre: "Email",     corto: "@",   color: "#ff5a36", url: "mailto:antoniomartin.mkt@gmail.com" }
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
   IMAGEN: ruta a una captura, p. ej. "img/newsletter.png" (o "" y se genera portada automática)
   ENLACE: link al trabajo (Canva, web, PDF...) o ""
   --------------------------------------------------------- */

const PROYECTOS = [
  {
    titulo: "Gestión de marketing digital de un medio de noticias",
    categoria: "Redes sociales",
    contexto: "Prácticas",
    fecha: "2026-10",
    destacado: true,
    resumen: "Planificación y publicación de contenido para un periódico digital.",
    reto: "Aumentar el alcance de las noticias en redes y llevar tráfico a la web.",
    solucion: "Calendario editorial, piezas en Canva adaptadas a cada red y seguimiento semanal de métricas.",
    resultado: "EJEMPLO → sustituye por un dato real: +XX% alcance en X semanas.",
    herramientas: ["Canva", "Meta Business Suite", "Google Analytics"],
    imagen: "",
    enlace: ""
  },
  {
    titulo: "Newsletter de bienvenida con Acumbamail",
    categoria: "Email marketing",
    contexto: "Clase",
    fecha: "2026-10",
    destacado: false,
    resumen: "EJEMPLO: secuencia de bienvenida para nuevos suscriptores.",
    reto: "Qué problema o encargo había.",
    solucion: "Qué hiciste tú, con decisiones concretas.",
    resultado: "Qué se consiguió o qué aprendiste (aperturas, clics, nota...).",
    herramientas: ["Acumbamail", "Canva"],
    imagen: "",
    enlace: ""
  },
  {
    titulo: "Landing page en HTML para campaña",
    categoria: "Web",
    contexto: "Clase",
    fecha: "2026-09",
    destacado: false,
    resumen: "EJEMPLO: página de captación programada desde cero.",
    reto: "",
    solucion: "",
    resultado: "",
    herramientas: ["HTML", "CSS"],
    imagen: "",
    enlace: ""
  }
];
