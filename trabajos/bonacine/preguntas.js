/* =========================================================
   INTENCIONES DEL CHATBOT DE BONACINE
   Alimentan el chat y las preguntas frecuentes. No usa IA: responde con
   textos ya definidos cuando reconoce una palabra clave.

   titulo:    nombre de la intención (y pregunta en el FAQ).
   boton:     texto del botón del chat.
   claves:    con * vale cualquier final («peli*» acepta «pelis»);
              sin * tiene que coincidir entera («abre», «silla de ruedas»).
   respuesta: lo que contesta. Para varias líneas, usa \n.
   ========================================================= */

const PREGUNTAS = [
  {
    titulo: "Ubicación y contacto",
    boton: "Ubicación y contacto",
    claves: ["direccion*", "ubicacion*", "donde*", "calle*", "llegar*", "mapa*", "contacto*", "telefono*", "correo*", "redes*", "teatro*"],
    respuesta: "📍 Estamos en el Teatro Cine Colón, C/ Cervantes, 2, Bonares (Huelva). 📞 969 50 65 80 · ✉️ Bonacine@gmail.com · 📱 Instagram @BonaCines, Facebook @Bonacines_Bonares y TikTok @Bonacines_"
  },
  {
    titulo: "Horario del cine",
    boton: "Horario del cine",
    claves: ["abierto*", "apertura*", "cierra*", "cerrado*", "lunes*", "martes*", "festivo*", "abris*", "abre"],
    respuesta: "De miércoles a viernes abrimos de 17:00 a 24:00, y sábados y domingos de 14:00 a 24:00. Lunes y martes cerramos."
  },
  {
    titulo: "Cartelera",
    boton: "Cartelera",
    claves: ["cartelera*", "pelicula*", "peli*", "estreno*", "echan*", "dura*", "edad*", "niño*", "menor*"],
    respuesta: "🎬 En cartelera: Interstellar (+12, 169 min), Torrente Presidente (+16, 103 min) y Scary Movie 2 (+16, 83 min). ¿Quieres ver los horarios?"
  },
  {
    titulo: "Horarios de sesiones",
    boton: "Horarios de sesiones",
    claves: ["sesion*", "pase*", "funcion*", "empieza*", "interstellar*", "torrente*", "scary*"],
    respuesta: "🎞️ Miércoles a viernes:\nSala 1, Interstellar: 17:15 / 20:45\nSala 2, Scary Movie 2: 17:00 / 20:40\nSala 2, Torrente Presidente: 18:40 / 22:15\nSábados y domingos:\nSala 1, Interstellar: 14:30 / 17:45 / 21:00\nSala 2, Torrente Presidente: 14:00 / 17:45 / 21:30\nSala 2, Scary Movie 2: 16:00 / 19:45"
  },
  {
    titulo: "Entradas y descuentos",
    boton: "Entradas y descuentos",
    claves: ["entrada*", "ticket*", "espectador*", "miercoles*", "descuento*", "oferta*", "promocion*", "tarjeta*", "residente*"],
    respuesta: "🎟️ La entrada cuesta 6 €. Los miércoles, Día del Espectador, solo 4 €. Si vives en Bonares, con la tarjeta de residente pagas 2 € menos en cada entrada. Pídela gratis con el botón «Quiero mi tarjeta»."
  },
  {
    titulo: "Palomitas",
    boton: "Palomitas",
    claves: ["palomita*", "topping*", "caramelo*", "chocolate*"],
    respuesta: "🍿 Palomitas: pequeñas 5 €, medianas 8 € y grandes 10 €. Topping de caramelo o chocolate: +2 €."
  },
  {
    titulo: "Alquilar una sala",
    boton: "Alquilar una sala",
    claves: ["alquil*", "reserva*", "privada*", "cumpleaños*", "evento*", "fiesta*", "grupo*", "butaca*"],
    respuesta: "🎉 Puedes alquilar una sala completa (40 butacas) por 220 €, o 200 € los miércoles. Ideal para cumpleaños y grupos."
  },
  {
    titulo: "Normas del cine",
    boton: "Normas del cine",
    claves: ["norma*", "devolución*", "reembolso*", "cancel*", "cancela", "cancelada*", "cancelado*", "traer*", "fuera*", "accesible*", "silla*", "movilidad*", "adaptado*", "silla de ruedas", "invalido", "no puede andar"],
    respuesta: "📋 Normas de BonaCine: no se admiten devoluciones, salvo si se cancela una sesión: entonces te devolvemos el importe o te cambiamos la entrada · no se permite comida de fuera · la cerveza solo se vende a mayores de 18 · el cine está adaptado para personas con movilidad reducida ♿"
  },
  {
    titulo: "Comida y bebida",
    boton: "Comida y bebida",
    claves: ["comida*", "comer*", "carta*", "menu*", "vende*", "bebida*", "refresco*", "agua*", "cerveza*", "alcohol*", "beber*"],
    respuesta: "🍽️ En nuestro bar tienes:\n🍿 Palomitas: 5 / 8 / 10 € (+2 € con topping de caramelo o chocolate)\n🥤 Refrescos: 4 / 6 / 7 €\n🍺 Cerveza en vaso: 2 / 3 / 4 € · en bote: 3 / 4 / 6 € (solo mayores de 18)"
  }
];
