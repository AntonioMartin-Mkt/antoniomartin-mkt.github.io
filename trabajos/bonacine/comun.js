/* BonaCine: lo que comparten la web y la landing de la tarjeta de residente.
   Carrusel de carteles, newsletter del pie y redes. */

// Pega aquí la URL de Apps Script (ver Codigo.gs). Vacía = modo demostración.
const SHEETS_URL = "";

const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function enviarDatos(datos) {
  const r = await fetch(SHEETS_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(datos) });
  return r.json();
}

/* ---------- Carrusel vertical: 3 columnas sin fin ---------- */
const COLUMNAS = 3;
document.getElementById("carrusel-carteles").innerHTML = Array.from({ length: COLUMNAS }, (_, c) => {
  const lista = CARTELES.filter((_, i) => i % COLUMNAS === c);
  const fila = (copia) => lista.map((p) => `<img src="${esc(p.imagen)}" alt="${copia ? "" : `Cartel de ${esc(p.titulo)}`}" width="480" height="720" decoding="async">`).join("");
  // La lista va duplicada para que el bucle no tenga salto
  return `<div class="columna"><div class="cinta">${fila(false)}${fila(true)}</div></div>`;
}).join("");

/* ---------- Newsletter del pie ---------- */
const news = document.getElementById("form-news");
const estadoNews = document.getElementById("estado-news");
news.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = news.elements["news-email"], acepta = news.elements["news-acepta"];
  const errEmail = document.getElementById("error-news-email"), errAcepta = document.getElementById("error-news-acepta");
  errEmail.textContent = REGEX_EMAIL.test(email.value.trim()) ? "" : "Revisa tu correo: falta algo, por ejemplo la @.";
  errAcepta.textContent = acepta.checked ? "" : "Necesitamos tu permiso para escribirte.";
  email.setAttribute("aria-invalid", errEmail.textContent ? "true" : "false");
  acepta.setAttribute("aria-invalid", errAcepta.textContent ? "true" : "false");
  if (errEmail.textContent) { email.focus(); return; }
  if (errAcepta.textContent) { acepta.focus(); return; }

  const boton = news.querySelector("button");
  boton.disabled = true;
  boton.textContent = "Enviando...";
  estadoNews.textContent = "";
  try {
    const res = SHEETS_URL
      ? await enviarDatos({ tipo: "newsletter", email: email.value.trim(), ofertas: true })
      : { ok: true, demo: true };
    if (!res.ok) throw new Error(res.error);
    news.hidden = true;
    estadoNews.textContent = res.demo
      ? "Modo demostración: la suscripción no se guarda."
      : "Listo. Ya estás en la newsletter de BonaCine.";
  } catch (err) {
    estadoNews.textContent = "No hemos podido apuntarte. Vuelve a intentarlo.";
    boton.disabled = false;
    boton.textContent = "Suscribirme";
  }
});

/* ---------- Redes: enlace real si está en peliculas.js; si no, aviso ---------- */
const avisoRedes = document.getElementById("aviso-redes");
document.querySelectorAll("[data-red]").forEach((a) => {
  const url = REDES[a.dataset.red];
  if (url) {
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
  } else {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      avisoRedes.textContent = "Perfil de ejemplo: BonaCine es un cine ficticio.";
    });
  }
});
