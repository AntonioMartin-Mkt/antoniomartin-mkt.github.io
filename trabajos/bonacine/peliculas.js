/* =========================================================
   DATOS DE BONACINE
   Es el único archivo que hay que tocar para cambiar la cartelera.

   CARTELES: pósteres del carrusel vertical. Se reparten solos en las
   3 columnas. "titulo" no se ve en la web: describe la imagen.
   ========================================================= */

const CARTELES = [
  { titulo: "Interstellar", imagen: "img/carteles/interstellar.jpg" },
  { titulo: "Torrente Presidente", imagen: "img/carteles/torrente-presidente.jpg" },
  { titulo: "The Last: Naruto the Movie", imagen: "img/carteles/naruto-the-last.jpg" },
  { titulo: "Scary Movie 2", imagen: "img/carteles/scary-movie-2.jpg" },
  { titulo: "El sexto sentido", imagen: "img/carteles/el-sexto-sentido.jpg" },
  { titulo: "Cisne negro", imagen: "img/carteles/cisne-negro.jpg" },
  { titulo: "Breaking Bad", imagen: "img/carteles/breaking-bad.jpg" },
  { titulo: "El caballero oscuro", imagen: "img/carteles/el-caballero-oscuro.jpg" },
  { titulo: "Tenet", imagen: "img/carteles/tenet.jpg" }
];

/* PELÍCULAS EN CARTEL: las que nombra la pregunta «¿Qué películas hay?». */
const PELICULAS = [
  { titulo: "Interstellar" },
  { titulo: "Torrente Presidente" },
  { titulo: "Scary Movie 2" }
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
