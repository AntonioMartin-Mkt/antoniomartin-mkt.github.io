/* =========================================================
   CARTELERA DE BONACINE
   Es el único archivo que hay que tocar para cambiar películas.
   Copia un bloque { ... }, cambia los textos y guarda.

   titulo:   nombre completo de la película.
   cartel:   líneas del cartel. La primera suele ser la palabra grande.
   fecha:    "AAAA-MM-DD". A partir de ese día sale como «En cartel».
   genero:   uno o dos géneros.
   direccion: quien dirige.
   sinopsis: máximo 25 palabras.
   tono:     color del cartel: "claro", "oscuro" o "rojo".
   corte:    dónde empieza el bloque del cartel, de 20 a 60 (% desde la izquierda).

   Fechas de estreno en España comprobadas el 5/11/2026 en
   eCartelera y SensaCine. Conviene revisarlas: pueden cambiar.
   ========================================================= */

const PELICULAS = [
  {
    titulo: "Godzilla Minus Zero",
    cartel: ["Godzilla", "Minus Zero"],
    fecha: "2026-11-06",
    genero: "Acción, monstruos",
    direccion: "Takashi Yamazaki",
    sinopsis: "Secuela de Godzilla Minus One. Japón intenta levantarse tras la guerra cuando el monstruo vuelve con una amenaza nueva.",
    tono: "oscuro",
    corte: 34
  },
  {
    titulo: "Scrooge y los fantasmas de la Navidad",
    cartel: ["Scrooge", "y los fantasmas", "de la Navidad"],
    fecha: "2026-11-13",
    genero: "Fantasía, drama",
    direccion: "Ti West",
    sinopsis: "Johnny Depp es Ebenezer Scrooge en esta nueva versión del cuento de Dickens, con Rupert Grint y Andrea Riseborough.",
    tono: "claro",
    corte: 48
  },
  {
    titulo: "Los Juegos del Hambre: Amanecer en la cosecha",
    cartel: ["Los Juegos", "del Hambre", "Amanecer en la cosecha"],
    fecha: "2026-11-20",
    genero: "Acción, aventura",
    direccion: "Francis Lawrence",
    sinopsis: "Un joven Haymitch, de 16 años, entra en los 50.º Juegos, 24 años antes de la historia de Katniss.",
    tono: "rojo",
    corte: 28
  },
  {
    titulo: "Hechizo: Bienvenidos a Hexe",
    cartel: ["Hechizo", "Bienvenidos", "a Hexe"],
    fecha: "2026-11-27",
    genero: "Animación, familiar",
    direccion: "Fawn Veerasunthorn y Jason Hand",
    sinopsis: "Billie, de 16 años, descubre que tiene poderes y llega a un mundo mágico. Lo nuevo de Disney para ir en familia.",
    tono: "claro",
    corte: 40
  },
  {
    titulo: "Dune: Parte tres",
    cartel: ["Dune", "Parte tres"],
    fecha: "2026-12-18",
    genero: "Ciencia ficción, aventura",
    direccion: "Denis Villeneuve",
    sinopsis: "Doce años después de su victoria, Paul Atreides se enfrenta a una conspiración para derrocarlo. Basada en El mesías de Dune.",
    tono: "oscuro",
    corte: 52
  },
  {
    titulo: "Jumanji: Mundo abierto",
    cartel: ["Jumanji", "Mundo abierto"],
    fecha: "2026-12-25",
    genero: "Aventura, comedia",
    direccion: "Jake Kasdan",
    sinopsis: "Dwayne Johnson, Jack Black, Kevin Hart y Karen Gillan vuelven al juego. El plan de Navidad para toda la familia.",
    tono: "rojo",
    corte: 30
  }
];
