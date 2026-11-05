/* =========================================================
   PREGUNTAS FRECUENTES
   Salen de las intenciones del chatbot de BonaCine.
   Cada bloque es una intención: "intencion" es su nombre interno,
   "pregunta" y "respuesta" son lo que se ve en la web.
   {cartelera} se sustituye por las películas de peliculas.js.
   ========================================================= */

const PREGUNTAS = [
  {
    grupo: "Cartelera y sesiones",
    intenciones: [
      { intencion: "ver_cartelera", pregunta: "¿Qué películas hay en cartel?", respuesta: "Ahora proyectamos {cartelera}." },
      { intencion: "consultar_horarios", pregunta: "¿Qué días hay sesiones?", respuesta: "De miércoles a domingo. Tienes los horarios en el calendario de esta página, en taquilla y en la cartelera que enviamos por correo." },
      { intencion: "ver_disponibilidad", pregunta: "¿Cómo sé si quedan butacas?", respuesta: "En el calendario de esta página. Verde es libre, amarillo es una reserva sin confirmar y rojo es ocupado." },
      { intencion: "edad_minima", pregunta: "¿Pueden entrar menores?", respuesta: "Depende de la película, porque cada una tiene su calificación por edades. Consúltala antes de comprar tu entrada." }
    ]
  },
  {
    grupo: "Entradas",
    intenciones: [
      { intencion: "comprar_entrada", pregunta: "¿Dónde compro la entrada?", respuesta: "En la taquilla del cine, los días que hay sesión." },
      { intencion: "consultar_precio", pregunta: "¿Cuánto cuesta la entrada?", respuesta: "Tienes el precio de cada sesión en taquilla, con IVA incluido. Con la tarjeta de residente pagas 2 € menos en cada entrada." },
      { intencion: "reservar_butaca", pregunta: "¿Puedo reservar butaca?", respuesta: "Sí, en taquilla. En el calendario de esta página ves qué butacas quedan libres." },
      { intencion: "cancelacion", pregunta: "¿Qué pasa si se cancela una sesión?", respuesta: "Te devolvemos el importe de la entrada o te la cambiamos por otra." }
    ]
  },
  {
    grupo: "Descuentos",
    intenciones: [
      { intencion: "conseguir_descuento", pregunta: "¿Cómo consigo el descuento?", respuesta: "Si vives en Bonares, pide gratis la tarjeta de residente desde el botón «Quiero mi tarjeta» y recógela en taquilla con un justificante de residencia." },
      { intencion: "usar_descuento", pregunta: "¿Cómo uso el descuento?", respuesta: "Enseña tu tarjeta de residente en taquilla y te descontamos 2 € de cada entrada." },
      { intencion: "caducidad_descuento", pregunta: "¿Cuándo caduca la tarjeta?", respuesta: "Vale durante todo el año natural." }
    ]
  },
  {
    grupo: "El cine y tu cuenta",
    intenciones: [
      { intencion: "ubicacion", pregunta: "¿Dónde está BonaCine?", respuesta: "En el Teatro Cine Colón, Calle Cervantes, 2, 21830 Bonares (Huelva)." },
      { intencion: "contactar", pregunta: "¿Cómo hablo con el cine?", respuesta: "Pregúntanos en taquilla o escríbenos a Bonacine@gmail.com." },
      { intencion: "correos_comerciales", pregunta: "¿Me vais a llenar el correo?", respuesta: "No. Solo te escribimos con la cartelera si te apuntas a la newsletter." },
      { intencion: "darse_de_baja", pregunta: "¿Cómo me doy de baja?", respuesta: "Usa el enlace de baja de cualquier correo o escríbenos a Bonacine@gmail.com con el asunto «BAJA»." }
    ]
  }
];
