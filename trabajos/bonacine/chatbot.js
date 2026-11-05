/* BonaCine: chatbot propio, compartido por la web y la landing.
   Funciona en el navegador: no envía nada a ningún servidor.
   Las preguntas, respuestas y palabras clave están en preguntas.js. */

const TEXTOS_CHAT = {
  saludo: "Hola, soy el asistente de BonaCine. ¿Sobre qué tienes dudas?",
  gracias: "De nada. Si necesitas algo más, aquí estoy.",
  noEntiendo: "No te he entendido bien. Prueba con otras palabras o elige un tema. También puedes escribirnos a Bonacine@gmail.com."
};

const sinTildes = (t) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const palabrasDe = (t) => sinTildes(t).match(/[a-z0-9ñ]+/g) || [];
const INTENCIONES = PREGUNTAS.flatMap((g) => g.intenciones);

// Elige la intención con más palabras clave en el mensaje. Una clave acepta variantes: «sesion» vale para «sesiones».
function buscarIntencion(mensaje) {
  const palabras = palabrasDe(mensaje);
  let mejor = null, nota = 0;
  INTENCIONES.forEach((i) => {
    const puntos = (i.claves || []).filter((c) => palabras.some((p) => p.startsWith(sinTildes(c)))).length;
    if (puntos > nota) { mejor = i; nota = puntos; }
  });
  return mejor;
}

const botonChat = document.createElement("button");
botonChat.id = "cb-abrir";
botonChat.type = "button";
botonChat.textContent = "💬";
botonChat.setAttribute("aria-label", "Abrir chat");
botonChat.setAttribute("aria-expanded", "false");

const panelChat = document.createElement("section");
panelChat.id = "cb-marco";
panelChat.hidden = true;
panelChat.setAttribute("aria-label", "Chat de BonaCine");
panelChat.innerHTML = `
  <header class="cb-cabeza"><span>BonaCine</span><button type="button" class="cb-cerrar" aria-label="Cerrar chat">×</button></header>
  <div class="cb-mensajes" id="cb-mensajes" role="log" aria-live="polite"></div>
  <form class="cb-escribir" id="cb-escribir">
    <input id="cb-texto" type="text" autocomplete="off" maxlength="200" aria-label="Escribe tu pregunta" placeholder="Escribe tu pregunta">
    <button type="submit" aria-label="Enviar"><svg class="icono" aria-hidden="true"><use href="#i-flecha"/></svg></button>
  </form>`;
document.body.append(botonChat, panelChat);

const mensajes = document.getElementById("cb-mensajes");
const textoChat = document.getElementById("cb-texto");

const alFinal = () => { mensajes.scrollTop = mensajes.scrollHeight; };

function burbuja(texto, quien) {
  const p = document.createElement("p");
  p.className = `cb-burbuja cb-${quien}`;
  p.textContent = texto;
  mensajes.append(p);
  alFinal();
  return p;
}

function opciones(lista) {
  mensajes.querySelectorAll(".cb-opciones").forEach((o) => o.remove());
  const caja = document.createElement("div");
  caja.className = "cb-opciones";
  lista.forEach(([texto, accion]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = texto;
    b.addEventListener("click", accion);
    caja.append(b);
  });
  mensajes.append(caja);
  alFinal();
}

const temas = () => opciones(PREGUNTAS.map((g) => [g.grupo, () => verTema(g)]));

function verTema(g) {
  burbuja(g.grupo, "yo");
  opciones([...g.intenciones.map((i) => [i.pregunta, () => { burbuja(i.pregunta, "yo"); contestar(i); }]), ["Otros temas", temas]]);
}

function contestar(i) {
  mensajes.querySelectorAll(".cb-opciones").forEach((o) => o.remove());
  setTimeout(() => {
    burbuja(respuesta(i), "bot");
    if (i.enlace) {
      const a = document.createElement("a");
      a.className = "cb-enlace";
      a.href = i.enlace;
      a.textContent = i.textoEnlace;
      mensajes.append(a);
    }
    opciones([["Otros temas", temas]]);
  }, 350);
}

function responderTexto(texto) {
  burbuja(texto, "yo");
  const i = buscarIntencion(texto);
  if (i) { contestar(i); return; }
  const palabras = palabrasDe(texto);
  mensajes.querySelectorAll(".cb-opciones").forEach((o) => o.remove());
  setTimeout(() => {
    burbuja(palabras.some((p) => p.startsWith("gracias")) ? TEXTOS_CHAT.gracias
      : palabras.some((p) => ["hola", "buenas", "buenos"].includes(p)) ? TEXTOS_CHAT.saludo
      : TEXTOS_CHAT.noEntiendo, "bot");
    temas();
  }, 350);
}

function alternarChat(abrir) {
  if (abrir && !mensajes.childElementCount) {
    burbuja(TEXTOS_CHAT.saludo, "bot");
    temas();
  }
  panelChat.hidden = !abrir;
  botonChat.setAttribute("aria-expanded", String(abrir));
  botonChat.setAttribute("aria-label", abrir ? "Cerrar chat" : "Abrir chat");
  if (abrir && matchMedia("(hover: hover)").matches) textoChat.focus();
}

botonChat.addEventListener("click", () => alternarChat(panelChat.hidden));
panelChat.querySelector(".cb-cerrar").addEventListener("click", () => { alternarChat(false); botonChat.focus(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !panelChat.hidden) {
    alternarChat(false);
    botonChat.focus();
  }
});
document.getElementById("cb-escribir").addEventListener("submit", (e) => {
  e.preventDefault();
  const texto = textoChat.value.trim();
  if (!texto) return;
  textoChat.value = "";
  responderTexto(texto);
});
