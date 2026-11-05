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
