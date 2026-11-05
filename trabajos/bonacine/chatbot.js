/* BonaCine: chatbot por palabras clave, sin IA, compartido por la web y la landing.
   Las intenciones están en preguntas.js. Funciona en el navegador: no envía
   nada a ningún servidor. */

const TEXTOS_CHAT = {
  saludo: "Hola, soy el asistente de BonaCine. ¿En qué puedo ayudarte?",
  noEntiendo: "No te he entendido bien. Prueba con otras palabras o elige una opción."
};

// Sin mayúsculas ni tildes, para que «Dirección» y «direccion» sean lo mismo
const normalizar = (t) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

function coincide(clave, mensaje) {
  const prefijo = clave.endsWith("*");
  const limpia = normalizar(clave);
  return (` ${mensaje} `).includes(` ${limpia}${prefijo ? "" : " "}`);
}

// Gana la intención con más palabras clave en el mensaje; si empatan, la primera de la lista.
function buscarIntencion(texto) {
  const mensaje = normalizar(texto);
  let mejor = null, nota = 0;
  PREGUNTAS.forEach((p) => {
    const puntos = p.claves.filter((c) => coincide(c, mensaje)).length;
    if (puntos > nota) { mejor = p; nota = puntos; }
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

function burbuja(texto, quien) {
  const p = document.createElement("p");
  p.className = `cb-burbuja cb-${quien}`;
  p.textContent = texto;
  mensajes.append(p);
  mensajes.scrollTop = mensajes.scrollHeight;
}

const quitarBotones = () => mensajes.querySelectorAll(".cb-opciones").forEach((o) => o.remove());

function botones() {
  quitarBotones();
  const caja = document.createElement("div");
  caja.className = "cb-opciones";
  PREGUNTAS.filter((p) => p.boton).forEach((p) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = p.boton;
    b.addEventListener("click", () => { burbuja(p.boton, "yo"); contestar(p.respuesta); });
    caja.append(b);
  });
  mensajes.append(caja);
  mensajes.scrollTop = mensajes.scrollHeight;
}

function contestar(texto) {
  quitarBotones();
  setTimeout(() => { burbuja(texto, "bot"); botones(); }, 350);
}

function alternarChat(abrir) {
  if (abrir && !mensajes.childElementCount) {
    burbuja(TEXTOS_CHAT.saludo, "bot");
    botones();
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
  burbuja(texto, "yo");
  const intencion = buscarIntencion(texto);
  contestar(intencion ? intencion.respuesta : TEXTOS_CHAT.noEntiendo);
});
