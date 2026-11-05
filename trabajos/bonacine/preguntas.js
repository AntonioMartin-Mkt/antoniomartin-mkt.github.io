/* =========================================================
   PREGUNTAS FRECUENTES
   Salen de las intenciones del chatbot de BonaCine.
   Cada bloque es una intención: "intencion" es su nombre interno,
   "pregunta" y "respuesta" son lo que se ve en la web y en el chat,
   y "claves" son las palabras con las que el chat la reconoce.
   {cartelera} se sustituye por las películas de peliculas.js.
   ========================================================= */

const PREGUNTAS = [
  {
    grupo: "Cartelera y sesiones",
    intenciones: [
      { intencion: "ver_cartelera", claves: ["pelicula", "peli", "cartelera", "cartel", "ponen", "proyectais", "echan"], pregunta: "¿Qué películas hay en cartel?", respuesta: "Ahora proyectamos {cartelera}." },
      { intencion: "consultar_horarios", claves: ["horario", "hora", "sesion", "dia", "abris", "abierto", "cuando"], pregunta: "¿Qué días hay sesiones?", respuesta: "De miércoles a domingo. Tienes los horarios en el calendario de esta página, en taquilla y en la cartelera que enviamos por correo." },
      { intencion: "ver_disponibilidad", claves: ["butaca", "asiento", "sitio", "lleno", "llena", "libre", "ocupacion", "quedan"], pregunta: "¿Cómo sé si quedan butacas?", respuesta: "En el calendario de esta página. Verde es libre, amarillo es una reserva sin confirmar y rojo es ocupado." },
      { intencion: "edad_minima", claves: ["menor", "nino", "edad", "hijo", "calificacion"], pregunta: "¿Pueden entrar menores?", respuesta: "Depende de la película, porque cada una tiene su calificación por edades. Consúltala antes de comprar tu entrada." }
    ]
  },
  {
    grupo: "Entradas",
    intenciones: [
      { intencion: "comprar_entrada", claves: ["compr", "taquilla", "adquirir"], pregunta: "¿Dónde compro la entrada?", respuesta: "En la taquilla del cine, los días que hay sesión." },
      { intencion: "consultar_precio", claves: ["precio", "cuesta", "cuanto", "vale", "pagar", "euro"], pregunta: "¿Cuánto cuesta la entrada?", respuesta: "Tienes el precio de cada sesión en taquilla, con IVA incluido. Con la tarjeta de residente pagas 2 € menos en cada entrada." },
      { intencion: "reservar_butaca", claves: ["reserv"], pregunta: "¿Puedo reservar butaca?", respuesta: "Sí, en taquilla. En el calendario de esta página ves qué butacas quedan libres." },
      { intencion: "cancelacion", claves: ["cancela", "devolucion", "devolv", "devuelv", "reembolso", "cambiar", "dinero"], pregunta: "¿Qué pasa si se cancela una sesión?", respuesta: "Te devolvemos el importe de la entrada o te la cambiamos por otra." }
    ]
  },
  {
    grupo: "Descuentos",
    intenciones: [
      { intencion: "conseguir_descuento", enlace: "tarjeta.html", textoEnlace: "Quiero mi tarjeta", claves: ["tarjeta", "residente", "descuento", "conseguir", "pedir", "apuntar", "oferta"], pregunta: "¿Cómo consigo el descuento?", respuesta: "Si vives en Bonares, pide gratis la tarjeta de residente desde el botón «Quiero mi tarjeta» y recógela en taquilla con un justificante de residencia." },
      { intencion: "usar_descuento", claves: ["usar", "uso", "aplicar", "enseñar", "canjear"], pregunta: "¿Cómo uso el descuento?", respuesta: "Enseña tu tarjeta de residente en taquilla y te descontamos 2 € de cada entrada." },
      { intencion: "caducidad_descuento", claves: ["caduca", "caducidad", "validez", "dura"], pregunta: "¿Cuándo caduca la tarjeta?", respuesta: "Vale durante todo el año natural." }
    ]
  },
  {
    grupo: "El cine y tu cuenta",
    intenciones: [
      { intencion: "ubicacion", claves: ["donde", "direccion", "ubicacion", "ubicado", "llegar", "calle", "mapa", "teatro"], pregunta: "¿Dónde está BonaCine?", respuesta: "En el Teatro Cine Colón, Calle Cervantes, 2, 21830 Bonares (Huelva)." },
      { intencion: "contactar", claves: ["contacto", "contactar", "telefono", "correo", "email", "hablar", "persona", "llamar"], pregunta: "¿Cómo hablo con el cine?", respuesta: "Pregúntanos en taquilla o escríbenos a Bonacine@gmail.com." },
      { intencion: "correos_comerciales", claves: ["newsletter", "spam", "publicidad", "boletin"], pregunta: "¿Me vais a llenar el correo?", respuesta: "No. Solo te escribimos con la cartelera si te apuntas a la newsletter." },
      { intencion: "darse_de_baja", claves: ["baja", "cancelar", "borrar", "eliminar"], pregunta: "¿Cómo me doy de baja?", respuesta: "Usa el enlace de baja de cualquier correo o escríbenos a Bonacine@gmail.com con el asunto «BAJA»." }
    ]
  }
];

/* Respuesta final de cada intención, con la cartelera actual ya puesta */
const nombres = PELICULAS.map((p) => p.titulo);
const cartelera = nombres.length > 1 ? `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}` : nombres[0];
const respuesta = (i) => i.respuesta.replace("{cartelera}", cartelera);
