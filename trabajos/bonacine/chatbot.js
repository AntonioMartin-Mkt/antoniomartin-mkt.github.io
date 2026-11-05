/* BonaCine: chatbot, compartido por la web y la landing.
   Para cambiarlo, sustituye CHATBOT_URL por la URL de tu aplicación web. */

const CHATBOT_URL = "https://script.google.com/a/lassalinassf.es/macros/s/AKfycbxti7MHnhAAF6JPsLhgpGILJUq_7toml1NE-fr_T-tQK8mOMbvl4OwqqIeE59CT_NPe/exec?vista=chat";

const botonChat = document.createElement("button");
botonChat.id = "cb-abrir";
botonChat.type = "button";
botonChat.textContent = "💬";
botonChat.setAttribute("aria-label", "Abrir chat");
botonChat.setAttribute("aria-expanded", "false");

const marcoChat = document.createElement("iframe");
marcoChat.id = "cb-marco";
marcoChat.title = "Chat de BonaCine";
marcoChat.hidden = true;

document.body.append(botonChat, marcoChat);

function alternarChat(abrir) {
  // El chat de Google solo se carga si alguien lo abre
  if (abrir && !marcoChat.src) marcoChat.src = CHATBOT_URL;
  marcoChat.hidden = !abrir;
  botonChat.setAttribute("aria-expanded", String(abrir));
  botonChat.setAttribute("aria-label", abrir ? "Cerrar chat" : "Abrir chat");
}

botonChat.addEventListener("click", () => alternarChat(marcoChat.hidden));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !marcoChat.hidden) {
    alternarChat(false);
    botonChat.focus();
  }
});
