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
  { nombre: "Sala 1", filas: 8, columnas: 12 },
  { nombre: "Sala 2", filas: 6, columnas: 8 }
];

const SESIONES = [
  { pelicula: "Torrente Presidente", sala: "Sala 2", hora: "17:30" },
  { pelicula: "Interstellar", sala: "Sala 1", hora: "18:00" },
  { pelicula: "Scary Movie 2", sala: "Sala 2", hora: "20:00" },
  { pelicula: "Torrente Presidente", sala: "Sala 1", hora: "21:30" }
];

// Días con sesión: 0 domingo, 1 lunes... 6 sábado
const DIAS_APERTURA = [3, 4, 5, 6, 0];
