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
  { titulo: "Tenet", imagen: "img/carteles/tenet.jpg" },
  { titulo: "Precious", imagen: "img/carteles/precious.jpg" },
  { titulo: "Rocky", imagen: "img/carteles/rocky.jpg" },
  { titulo: "El señor de la guerra", imagen: "img/carteles/el-senor-de-la-guerra.jpg" },
  { titulo: "La bola negra", imagen: "img/carteles/la-bola-negra.jpg" },
  { titulo: "Pulp Fiction", imagen: "img/carteles/pulp-fiction.jpg" },
  { titulo: "El club de la lucha", imagen: "img/carteles/el-club-de-la-lucha.jpg" },
  { titulo: "Voices Unheard", imagen: "img/carteles/voices-unheard.jpg" },
  { titulo: "Shrek", imagen: "img/carteles/shrek.jpg" },
  { titulo: "El corredor del laberinto: La cura mortal", imagen: "img/carteles/el-corredor-del-laberinto.jpg" }
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
   Cada sesión lleva sus días: "semana" (miércoles a viernes) o "finde" (sábado y domingo).
   "pelicula" debe coincidir con un "titulo" de CARTELES. */
const SALAS = [
  { nombre: "Sala 1", filas: 5, columnas: 8 },
  { nombre: "Sala 2", filas: 5, columnas: 8 }
];

const SESIONES = [
  { dias: "semana", pelicula: "Interstellar", sala: "Sala 1", hora: "17:15" },
  { dias: "semana", pelicula: "Interstellar", sala: "Sala 1", hora: "20:45" },
  { dias: "semana", pelicula: "Scary Movie 2", sala: "Sala 2", hora: "17:00" },
  { dias: "semana", pelicula: "Scary Movie 2", sala: "Sala 2", hora: "20:40" },
  { dias: "semana", pelicula: "Torrente Presidente", sala: "Sala 2", hora: "18:40" },
  { dias: "semana", pelicula: "Torrente Presidente", sala: "Sala 2", hora: "22:15" },
  { dias: "finde", pelicula: "Interstellar", sala: "Sala 1", hora: "14:30" },
  { dias: "finde", pelicula: "Interstellar", sala: "Sala 1", hora: "17:45" },
  { dias: "finde", pelicula: "Interstellar", sala: "Sala 1", hora: "21:00" },
  { dias: "finde", pelicula: "Torrente Presidente", sala: "Sala 2", hora: "14:00" },
  { dias: "finde", pelicula: "Torrente Presidente", sala: "Sala 2", hora: "17:45" },
  { dias: "finde", pelicula: "Torrente Presidente", sala: "Sala 2", hora: "21:30" },
  { dias: "finde", pelicula: "Scary Movie 2", sala: "Sala 2", hora: "16:00" },
  { dias: "finde", pelicula: "Scary Movie 2", sala: "Sala 2", hora: "19:45" }
];

// Días con sesión: 0 domingo, 1 lunes... 6 sábado
const DIAS_APERTURA = [3, 4, 5, 6, 0];
