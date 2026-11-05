/* =========================================================
   CARTELERA DE BONACINE
   Es el único archivo que hay que tocar para cambiar películas.
   Copia un bloque { ... }, cambia los textos y guarda.

   titulo:    nombre de la película.
   imagen:    cartel dentro de la carpeta img/.
   ancho/alto: tamaño del cartel en píxeles, para que no salte al cargar.
   ano:       año de la película.
   genero:    uno o dos géneros.
   direccion: quien dirige.
   sinopsis:  máximo 25 palabras.
   principal: true en la película de la portada (solo una).
   ========================================================= */

const PELICULAS = [
  {
    titulo: "Interstellar",
    imagen: "img/interstellar.jpg",
    ancho: 600, alto: 900,
    ano: 2014,
    genero: "Ciencia ficción",
    direccion: "Christopher Nolan",
    sinopsis: "Un grupo de exploradores cruza un agujero de gusano para buscar un nuevo hogar a la humanidad.",
    principal: true
  },
  {
    titulo: "Torrente Presidente",
    imagen: "img/torrente-presidente.jpg",
    ancho: 399, alto: 501,
    ano: 2026,
    genero: "Comedia",
    direccion: "Santiago Segura",
    sinopsis: "Sexta entrega de la saga. El brazo tonto de la ley vuelve, y esta vez apunta a la presidencia."
  },
  {
    titulo: "Scary Movie 2",
    imagen: "img/scary-movie-2.jpg",
    ancho: 705, alto: 1000,
    ano: 2001,
    genero: "Comedia, parodia de terror",
    direccion: "Keenen Ivory Wayans",
    sinopsis: "Un profesor excéntrico reúne a Cindy y a sus amigos para un supuesto experimento. Nada sale como estaba previsto."
  }
];

/* PRÓXIMAS PELÍCULAS DEL CARRUSEL
   titulo: nombre completo. corto: texto grande si aún no hay cartel.
   imagen: ruta del cartel, por ejemplo "img/cisne-negro.jpg".
   Mientras esté vacía, sale un cartel con el título en los colores del cine. */
const PROXIMAS = [
  {
    titulo: "The Last: Naruto the Movie",
    corto: "Naruto The Last",
    imagen: "",
    ano: 2014,
    genero: "Animación, acción",
    direccion: "Tsuneo Kobayashi",
    sinopsis: "La Luna se acerca a la Tierra y Naruto debe rescatar a Hanabi mientras descubre lo que siente por Hinata."
  },
  {
    titulo: "Guardianes de la noche: Kimetsu no Yaiba - La fortaleza infinita",
    corto: "Demon Slayer",
    imagen: "",
    ano: 2025,
    genero: "Animación, acción",
    direccion: "Haruo Sotozaki",
    sinopsis: "Tanjiro y los cazadores de demonios caen en la fortaleza de Muzan. Empieza la batalla final."
  },
  {
    titulo: "El sexto sentido",
    corto: "El sexto sentido",
    imagen: "",
    ano: 1999,
    genero: "Suspense, drama",
    direccion: "M. Night Shyamalan",
    sinopsis: "Un psicólogo infantil intenta ayudar a un niño que asegura ver a personas muertas."
  },
  {
    titulo: "Cisne negro",
    corto: "Cisne negro",
    imagen: "",
    ano: 2010,
    genero: "Drama, suspense",
    direccion: "Darren Aronofsky",
    sinopsis: "Una bailarina obsesionada con la perfección se rompe por dentro al preparar El lago de los cisnes."
  },
  {
    titulo: "A todo gas",
    corto: "A todo gas",
    imagen: "",
    ano: 2001,
    genero: "Acción",
    direccion: "Rob Cohen",
    sinopsis: "Un policía se infiltra en las carreras ilegales de Los Ángeles y acaba dudando de qué lado está."
  }
];

/* REDES DEL CINE: pega aquí cada enlace. Mientras esté vacío, el icono
   avisa de que es un perfil de ejemplo en vez de llevar a una web ajena. */
const REDES = {
  instagram: "",
  tiktok: "",
  facebook: "",
  youtube: ""
};

/* SALAS Y SESIONES DEL CALENDARIO
   Cada sala: nombre, filas y butacas por fila.
   Cada sesión se repite todos los días de apertura.
   "pelicula" debe coincidir con un "titulo" de arriba. */
const SALAS = [
  { nombre: "Sala 1", filas: 5, columnas: 8 },
  { nombre: "Sala 2", filas: 5, columnas: 8 }
];

const SESIONES = [
  { pelicula: "Torrente Presidente", sala: "Sala 2", hora: "17:30" },
  { pelicula: "Interstellar", sala: "Sala 1", hora: "18:00" },
  { pelicula: "Scary Movie 2", sala: "Sala 2", hora: "20:00" },
  { pelicula: "Torrente Presidente", sala: "Sala 1", hora: "21:30" }
];

// Días con sesión: 0 domingo, 1 lunes... 6 sábado
const DIAS_APERTURA = [3, 4, 5, 6, 0];
