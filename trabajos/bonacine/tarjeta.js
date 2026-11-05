/* BonaCine, landing de la tarjeta de residente.
   Lo compartido con la web (carrusel, newsletter y redes) está en comun.js. */

/* ---------- Solicitud de la tarjeta ---------- */
const form = document.getElementById("form-tarjeta");
const boton = document.getElementById("enviar");
const errorGeneral = document.getElementById("error-general");
const nombreTarjeta = document.getElementById("tv-nombre");

const CAMPOS = {
  nombre: { el: form.nombre, msg: () => (form.nombre.value.trim().split(/\s+/).length >= 2 ? "" : "Escribe tu nombre y tus apellidos.") },
  email: { el: form.email, msg: () => (REGEX_EMAIL.test(form.email.value.trim()) ? "" : "Revisa tu correo: falta algo, por ejemplo la @.") },
  terminos: { el: form.terminos, msg: () => (form.terminos.checked ? "" : "Debes aceptar los términos y condiciones.") },
  privacidad: { el: form.privacidad, msg: () => (form.privacidad.checked ? "" : "Debes aceptar la política de privacidad.") }
};

function marcar(n) {
  const c = CAMPOS[n], msg = c.msg();
  document.getElementById("error-" + n).textContent = msg;
  c.el.setAttribute("aria-invalid", msg ? "true" : "false");
  return !msg;
}
Object.keys(CAMPOS).forEach((n) => {
  const el = CAMPOS[n].el;
  el.addEventListener("blur", () => { if (el.value && el.type !== "checkbox") marcar(n); });
  el.addEventListener("change", () => { if (el.getAttribute("aria-invalid") === "true") marcar(n); });
});

// El nombre aparece en la tarjeta mientras se escribe
form.nombre.addEventListener("input", () => {
  nombreTarjeta.textContent = form.nombre.value.trim() || "Tu nombre aquí";
});

function codigoDemo() {
  const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "RES-";
  for (let i = 0; i < 4; i++) c += letras[Math.floor(Math.random() * letras.length)];
  return c;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorGeneral.textContent = "";
  const fallos = Object.keys(CAMPOS).filter((n) => !marcar(n));
  if (fallos.length) { CAMPOS[fallos[0]].el.focus(); return; }

  boton.disabled = true;
  boton.querySelector("span").textContent = "Enviando...";
  try {
    const res = SHEETS_URL
      ? await enviarDatos({ tipo: "tarjeta", nombre: form.nombre.value.trim(), email: form.email.value.trim(), terminos: true, privacidad: true })
      : await new Promise((r) => setTimeout(() => r({ ok: true, codigo: codigoDemo(), demo: true }), 500));
    if (!res.ok) throw new Error(res.error);

    document.getElementById("codigo").textContent = res.codigo;
    document.getElementById("nota-exito").textContent = res.demo
      ? "Modo demostración: esta solicitud no se guarda ni se envía ningún correo."
      : res.repetido
        ? "Este correo ya tenía una solicitud: este es tu código."
        : "También te lo hemos enviado al correo.";
    form.hidden = true;
    const exito = document.getElementById("exito");
    exito.hidden = false;
    exito.querySelector("h3").focus();
  } catch (err) {
    errorGeneral.textContent = "No hemos podido enviar tu solicitud. Comprueba tu conexión y vuelve a intentarlo.";
    boton.disabled = false;
    boton.querySelector("span").textContent = "Quiero mi tarjeta";
  }
});

/* ---------- Reseñas ---------- */
// Son ejemplos y la página lo dice. Sustitúyelos por opiniones reales de personas reales.
const RESENAS_EJEMPLO = [
  { pelicula: "Interstellar", nota: 5, texto: "Hay que verla en pantalla grande. El final se queda contigo varios días." },
  { pelicula: "Torrente Presidente", nota: 4, texto: "Humor de Torrente de principio a fin. Para ir con amigos y sin complejos." },
  { pelicula: "Cisne negro", nota: 5, texto: "Tensa hasta el último minuto. Sales del cine sin saber muy bien qué has visto." }
];

const listaResenas = document.getElementById("lista-resenas");
const cartelDe = (titulo) => CARTELES.find((c) => c.titulo === titulo);
const estrellasTexto = (n) => `<span class="nota" role="img" aria-label="${n} de 5 estrellas">${"★".repeat(n)}<span class="nota-vacia">${"★".repeat(5 - n)}</span></span>`;

const tarjetaResena = (r, autor) => {
  const c = cartelDe(r.pelicula);
  return `
  <li class="resena">
    ${c ? `<img src="${esc(c.imagen)}" alt="" width="480" height="720" loading="lazy">` : ""}
    <div>
      <h3>${esc(r.pelicula)}</h3>
      ${estrellasTexto(r.nota)}
      <p>${esc(r.texto)}</p>
      <p class="resena-autor">${esc(autor)}</p>
    </div>
  </li>`;
};
listaResenas.innerHTML = RESENAS_EJEMPLO.map((r) => tarjetaResena(r, "Reseña de ejemplo")).join("");

const formResena = document.getElementById("form-resena");
const estadoResena = document.getElementById("estado-resena");
formResena.elements["r-pelicula"].innerHTML = CARTELES.map((c) => `<option>${esc(c.titulo)}</option>`).join("");

// Estrellas: 5 botones de opción de verdad, para que funcionen con teclado
const filaEstrellas = document.querySelector(".estrellas-fila");
filaEstrellas.innerHTML = [1, 2, 3, 4, 5].map((n) => `
  <label><input type="radio" name="r-nota" value="${n}"><span aria-hidden="true">★</span><span class="oculto">${n} ${n === 1 ? "estrella" : "estrellas"}</span></label>`).join("");
const pintarEstrellas = () => {
  const v = Number(formResena.elements["r-nota"].value) || 0;
  filaEstrellas.querySelectorAll("label").forEach((l, i) => l.classList.toggle("activa", i < v));
};
filaEstrellas.addEventListener("change", pintarEstrellas);

formResena.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = formResena.elements;
  const nombre = f["r-nombre"].value.trim(), texto = f["r-texto"].value.trim(), nota = Number(f["r-nota"].value);
  const errores = {
    "error-r-nombre": nombre ? "" : "Escribe tu nombre.",
    "error-r-nota": nota ? "" : "Elige una nota.",
    "error-r-texto": texto ? "" : "Cuéntanos qué te ha parecido.",
    "error-r-acepta": f["r-acepta"].checked ? "" : "Necesitamos tu permiso para publicarla."
  };
  Object.entries(errores).forEach(([id, msg]) => { document.getElementById(id).textContent = msg; });
  estadoResena.textContent = "";
  if (Object.values(errores).some(Boolean)) return;

  const envio = formResena.querySelector("button");
  envio.disabled = true;
  try {
    const res = SHEETS_URL
      ? await enviarDatos({ tipo: "resena", nombre, pelicula: f["r-pelicula"].value, nota, texto, acepta: true })
      : { ok: true, demo: true };
    if (!res.ok) throw new Error(res.error);
    listaResenas.insertAdjacentHTML("afterbegin", tarjetaResena({ pelicula: f["r-pelicula"].value, nota, texto }, `${nombre}, tu reseña`));
    formResena.reset();
    pintarEstrellas();
    estadoResena.textContent = res.demo
      ? "Modo demostración: tu reseña solo se ve en esta visita."
      : "Gracias. La publicaremos cuando la revisemos.";
  } catch (err) {
    estadoResena.textContent = "No hemos podido enviarla. Vuelve a intentarlo.";
  }
  envio.disabled = false;
});
