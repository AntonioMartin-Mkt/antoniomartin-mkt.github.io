/* BonaCine, página principal: preguntas frecuentes y registro.
   Lo compartido con la landing está en comun.js. */

/* ---------- Preguntas frecuentes ---------- */
const nombres = PELICULAS.map((p) => p.titulo);
const cartelera = nombres.length > 1 ? `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}` : nombres[0];
const respuesta = (i) => i.respuesta.replace("{cartelera}", cartelera);

document.getElementById("lista-preguntas").innerHTML = PREGUNTAS.map((g) => `
  <div class="faq-grupo">
    <h3>${esc(g.grupo)}</h3>
    ${g.intenciones.map((i) => `
      <details>
        <summary>${esc(i.pregunta)}</summary>
        <p>${esc(respuesta(i))}</p>
      </details>`).join("")}
  </div>`).join("");

// Datos estructurados para que Google entienda las preguntas
const datosFaq = document.createElement("script");
datosFaq.type = "application/ld+json";
datosFaq.textContent = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: PREGUNTAS.flatMap((g) => g.intenciones).map((i) => ({
    "@type": "Question",
    name: i.pregunta,
    acceptedAnswer: { "@type": "Answer", text: respuesta(i) }
  }))
});
document.head.appendChild(datosFaq);

/* ---------- CTA fija en móvil: se esconde donde ya hay otro botón a la vista ---------- */
const barra = document.getElementById("barra-cta");
const ocultan = new Set();
const vigiaBarra = new IntersectionObserver((entradas) => {
  entradas.forEach((e) => (e.isIntersecting ? ocultan.add(e.target) : ocultan.delete(e.target)));
  barra.classList.toggle("activa", ocultan.size === 0);
}, { rootMargin: "-90px 0px 0px 0px" }); // descuenta la cabecera fija
vigiaBarra.observe(document.getElementById("portada"));
vigiaBarra.observe(document.getElementById("franja"));
vigiaBarra.observe(document.getElementById("registro"));

/* ---------- Formulario ---------- */
const form = document.getElementById("form-registro");
const boton = document.getElementById("enviar");
const errorGeneral = document.getElementById("error-general");
const CAMPOS = {
  nombre: { el: form.nombre, msg: () => (form.nombre.value.trim() ? "" : "Escribe tu nombre.") },
  email: { el: form.email, msg: () => (REGEX_EMAIL.test(form.email.value.trim()) ? "" : "Revisa tu correo: falta algo, por ejemplo la @.") },
  privacidad: { el: form.privacidad, msg: () => (form.privacidad.checked ? "" : "Necesitamos que aceptes la privacidad para darte el descuento.") }
};

function marcar(nombre) {
  const c = CAMPOS[nombre], msg = c.msg(), caja = document.getElementById("error-" + nombre);
  caja.textContent = msg;
  c.el.setAttribute("aria-invalid", msg ? "true" : "false");
  return !msg;
}
Object.keys(CAMPOS).forEach((n) => {
  const el = CAMPOS[n].el;
  el.addEventListener("blur", () => { if (el.value || el.getAttribute("aria-invalid") === "true") marcar(n); });
  el.addEventListener("change", () => { if (el.getAttribute("aria-invalid") === "true") marcar(n); });
});

function codigoDemo() {
  const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "BONA-";
  for (let i = 0; i < 4; i++) c += letras[Math.floor(Math.random() * letras.length)];
  return c;
}

async function registrar(datos) {
  if (!SHEETS_URL) {
    await new Promise((r) => setTimeout(r, 500));
    return { ok: true, codigo: codigoDemo(), demo: true };
  }
  return enviarDatos(datos);
}

function mostrarExito(res) {
  document.getElementById("codigo").textContent = res.codigo;
  document.getElementById("nota-exito").textContent = res.demo
    ? "Modo demostración: este registro no se guarda ni se envía ningún correo."
    : res.repetido
      ? "Este correo ya estaba registrado: este es tu código."
      : "También te lo hemos enviado al correo.";
  form.hidden = true;
  const exito = document.getElementById("exito");
  exito.hidden = false;
  exito.querySelector("h3").focus();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorGeneral.textContent = "";
  const fallos = Object.keys(CAMPOS).filter((n) => !marcar(n));
  if (fallos.length) { CAMPOS[fallos[0]].el.focus(); return; }

  boton.disabled = true;
  boton.querySelector("span").textContent = "Enviando...";
  try {
    const res = await registrar({
      tipo: "registro",
      nombre: form.nombre.value.trim(),
      email: form.email.value.trim(),
      privacidad: true,
      ofertas: form.ofertas.checked
    });
    if (!res.ok) throw new Error(res.error);
    mostrarExito(res);
  } catch (err) {
    errorGeneral.textContent = "No hemos podido registrarte. Comprueba tu conexión y vuelve a intentarlo.";
    boton.disabled = false;
    boton.querySelector("span").textContent = "Quiero mi descuento";
  }
});

document.getElementById("copiar").addEventListener("click", async (e) => {
  const texto = e.currentTarget.querySelector("span");
  try {
    await navigator.clipboard.writeText(document.getElementById("codigo").textContent);
    texto.textContent = "Copiado";
  } catch (err) {
    texto.textContent = "Selecciónalo y cópialo";
  }
  setTimeout(() => { texto.textContent = "Copiar código"; }, 2200);
});
