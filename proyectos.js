/* =========================================================
   ESTE ES EL ÚNICO ARCHIVO QUE TIENES QUE TOCAR.
   - PERFIL: tus datos (se edita una vez).
   - PROYECTOS: añade un bloque { ... } por cada trabajo nuevo.
   Copia un proyecto, pégalo arriba del todo y cambia los textos.
   ========================================================= */

const PERFIL = {
  nombre: "Antonio José Martín",
  rol: "Marketing digital & publicidad",
  // Tu propuesta de valor en UNA frase: qué haces + para quién + qué consigues.
  frase: "Creo contenido, campañas y automatizaciones que hacen crecer marcas y medios digitales.",
  ubicacion: "San Fernando, Cádiz",
  disponible: "Abierto a prácticas y primer empleo", // o "" para ocultarlo
  email: "tu-email@ejemplo.com",
  linkedin: "https://www.linkedin.com/in/tu-perfil",
  cv: "cv.pdf", // sube tu CV al repositorio con este nombre
  // 3 cifras que un reclutador entienda en 2 segundos. Sustitúyelas por datos reales.
  cifras: [
    { valor: "XX", texto: "proyectos de marketing" },
    { valor: "+XX%", texto: "alcance en redes (prácticas)" },
    { valor: "XX", texto: "herramientas que domino" }
  ],
  herramientas: ["Canva", "HTML/CSS", "Acumbamail", "Make / Zapier", "Meta Business Suite", "Google Analytics", "IA generativa", "Presentaciones"]
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
