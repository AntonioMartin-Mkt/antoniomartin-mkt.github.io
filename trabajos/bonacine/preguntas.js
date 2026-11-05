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
      { intencion: "consultar_precio", pregunta: "¿Cuánto cuesta la entrada?", respuesta: "Tienes el precio de cada sesión en taquilla, con IVA incluido. Si te registras, pagas 2 € menos en tu primera entrada y 1 € menos los miércoles." },
      { intencion: "reservar_butaca", pregunta: "¿Puedo reservar butaca?", respuesta: "Sí, si estás registrado: en los grandes estrenos puedes reservar antes que nadie." },
      { intencion: "cancelacion", pregunta: "¿Qué pasa si se cancela una sesión?", respuesta: "Te devolvemos el importe de la entrada o te la cambiamos por otra." }
    ]
  },
  {
    grupo: "Descuentos",
    intenciones: [
      { intencion: "conseguir_descuento", pregunta: "¿Cómo consigo el descuento?", respuesta: "Regístrate gratis en esta página con tu nombre y tu correo, y recibirás tu código al momento." },
      { intencion: "usar_descuento", pregunta: "¿Cómo uso el descuento?", respuesta: "Enseña tu código en taquilla, en papel o en el móvil, y te descontamos 2 € de la entrada." },
      { intencion: "caducidad_descuento", pregunta: "¿Cuándo caduca?", respuesta: "El código vale hasta el 31 de enero de 2027. El descuento de los miércoles sigue activo mientras estés registrado." }
    ]
  },
  {
    grupo: "El cine y tu cuenta",
    intenciones: [
      { intencion: "ubicacion", pregunta: "¿Dónde está BonaCine?", respuesta: "En el Teatro Cine Colón, Calle Cervantes, 2, 21830 Bonares (Huelva)." },
      { intencion: "contactar", pregunta: "¿Cómo hablo con el cine?", respuesta: "Pregúntanos en taquilla o escríbenos a Bonacine@gmail.com." },
      { intencion: "correos_comerciales", pregunta: "¿Me vais a llenar el correo?", respuesta: "No. Solo te escribimos con la cartelera si marcas esa casilla. El descuento es tuyo la marques o no." },
      { intencion: "darse_de_baja", pregunta: "¿Cómo me doy de baja?", respuesta: "Usa el enlace de baja de cualquier correo o escríbenos a Bonacine@gmail.com con el asunto «BAJA»." }
    ]
  }
];
