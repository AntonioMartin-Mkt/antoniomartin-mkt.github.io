/* BonaCine, landing de la tarjeta de residente.
   Lo compartido con la web (carrusel, newsletter y redes) está en comun.js. */

/* ---------- Solicitud de la tarjeta ---------- */
const form = document.getElementById("form-tarjeta");
const boton = document.getElementById("enviar");
const errorGeneral = document.getElementById("error-general");

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

// El nombre y el correo aparecen en la tarjeta mientras se escriben
const rellenar = (campo, vacio) => {
  document.querySelectorAll(`[data-tarjeta="${campo}"]`).forEach((n) => { n.textContent = form[campo].value.trim() || vacio; });
};
form.nombre.addEventListener("input", () => rellenar("nombre", "Tu nombre aquí"));
form.email.addEventListener("input", () => rellenar("email", "tu@correo.com"));

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
    document.getElementById("td-numero").textContent = res.codigo;
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

/* ---------- Tarjeta 3D: se arrastra, sigue girando por inercia y vuelve a la cara más cercana ---------- */
const escena = document.getElementById("escena3d");
const tarjeta3d = document.getElementById("tarjeta3d");
const quieta = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Canto: varias capas entre las dos caras dan grosor de verdad
for (let i = -2; i <= 2; i++) {
  const capa = document.createElement("span");
  capa.className = "capa-canto";
  capa.style.transform = `translateZ(${i * 0.5}px)`;
  tarjeta3d.prepend(capa);
}

// Código de barras decorativo, siempre igual
document.getElementById("barras").innerHTML = "2131412213142312413123142213".split("")
  .map((n, i) => `<i style="width:${n * 0.28}cqw;margin-right:${i % 2 ? 0.42 : 0.28}cqw"></i>`).join("");

const giro = { x: -6, y: -16, vx: 0, vy: 0, inclinaX: 0, inclinaY: 0, arrastre: false, px: 0, py: 0, enPantalla: true };

function animar(t) {
  if (!giro.arrastre) {
    giro.y += giro.vy;
    giro.x += giro.vx;
    giro.vy *= 0.95;
    giro.vx *= 0.9;
    if (Math.abs(giro.vy) < 0.5) {
      // Sin impulso, busca la cara más cercana con un balanceo suave
      const cara = Math.round(giro.y / 180) * 180;
      const vaiven = quieta ? 0 : Math.sin(t / 1800) * 9;
      giro.y += (cara - 16 + vaiven + giro.inclinaY - giro.y) * 0.07;
      giro.x += (-6 + giro.inclinaX - giro.x) * 0.07;
    }
  }
  tarjeta3d.style.transform = `rotateX(${giro.x.toFixed(2)}deg) rotateY(${giro.y.toFixed(2)}deg)`;
  const luz = 50 + Math.sin((giro.y * Math.PI) / 90) * 60;
  tarjeta3d.style.setProperty("--luz", `${luz.toFixed(1)}%`);
  if (giro.enPantalla) requestAnimationFrame(animar);
}

new IntersectionObserver(([e]) => {
  const antes = giro.enPantalla;
  giro.enPantalla = e.isIntersecting;
  if (giro.enPantalla && !antes) requestAnimationFrame(animar);
}).observe(escena);
requestAnimationFrame(animar);

escena.addEventListener("pointerdown", (e) => {
  giro.arrastre = true;
  giro.px = e.clientX;
  giro.py = e.clientY;
  giro.vx = giro.vy = 0;
  escena.setPointerCapture(e.pointerId);
  escena.classList.add("agarrada");
});
escena.addEventListener("pointermove", (e) => {
  if (!giro.arrastre) {
    if (e.pointerType !== "mouse") return;
    // Con el ratón encima, la tarjeta se inclina hacia él
    const r = escena.getBoundingClientRect();
    giro.inclinaY = ((e.clientX - r.left) / r.width - 0.5) * 22;
    giro.inclinaX = -((e.clientY - r.top) / r.height - 0.5) * 16;
    return;
  }
  const dx = e.clientX - giro.px, dy = e.clientY - giro.py;
  giro.px = e.clientX;
  giro.py = e.clientY;
  giro.y += dx * 0.55;
  giro.x = Math.max(-55, Math.min(55, giro.x - dy * 0.4));
  giro.vy = dx * 0.55;
  giro.vx = -dy * 0.2;
});
const soltar = () => {
  giro.arrastre = false;
  escena.classList.remove("agarrada");
};
escena.addEventListener("pointerup", soltar);
escena.addEventListener("pointercancel", soltar);
escena.addEventListener("pointerleave", () => { giro.inclinaX = giro.inclinaY = 0; });

escena.addEventListener("keydown", (e) => {
  const paso = { ArrowLeft: [0, -8], ArrowRight: [0, 8], ArrowUp: [4, 0], ArrowDown: [-4, 0] }[e.key];
  if (!paso) return;
  e.preventDefault();
  giro.vx += paso[0];
  giro.vy += paso[1];
});

/* ---------- Reseñas ---------- */
// Son ejemplos y la página lo dice. Sustitúyelos por opiniones reales de personas reales.
const RESENAS_EJEMPLO = [
  { pelicula: "Interstellar", nota: 5, texto: "Hay que verla en pantalla grande. El final se queda contigo varios días." },
  { pelicula: "Torrente Presidente", nota: 4, texto: "Humor de Torrente de principio a fin. Para ir con amigos y sin complejos." },
  { pelicula: "Cisne negro", nota: 5, texto: "Tensa hasta el último minuto. Sales del cine sin saber muy bien qué has visto." },
  { pelicula: "El caballero oscuro", nota: 5, texto: "El villano se come la película. Dos horas y media que se pasan volando." },
  { pelicula: "The Last: Naruto the Movie", nota: 4, texto: "Cierra muy bien la historia de Naruto y Hinata. Si has seguido la serie, te llega." },
  { pelicula: "El sexto sentido", nota: 5, texto: "Aunque conozcas el giro final, sigue funcionando. Un clásico para ver con la luz apagada." },
  { pelicula: "Scary Movie 2", nota: 3, texto: "Humor sin filtro y parodias a montones. Mejor verla con un grupo de amigos." },
  { pelicula: "Tenet", nota: 4, texto: "Hay que estar muy atento y aun así te pierdes, pero las escenas de acción son enormes." },
  { pelicula: "Breaking Bad", nota: 5, texto: "Empieza fuerte y cada temporada aprieta más. Imposible parar de ver." }
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
