/* BonaCine: pinta la cartelera y gestiona el registro.
   Las películas se cambian en peliculas.js, no aquí. */

// Pega aquí la URL de Apps Script (ver Codigo.gs). Vacía = modo demostración.
const SHEETS_URL = "";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const hoy = new Date();
hoy.setHours(0, 0, 0, 0);

const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fechaDe = (p) => new Date(p.fecha + "T00:00:00");
const diaMes = (p) => { const f = fechaDe(p); return `${f.getDate()} ${MESES[f.getMonth()]}`; };
const enCartel = (p) => fechaDe(p) <= hoy;

/* ---------- Carteles ---------- */
function cartel(p) {
  const titulo = p.cartel.map((l) => `<span class="linea">${esc(l)}</span>`).join("");
  const capa = (extra) => `<div class="capa ${extra}"><p class="firma">BonaCine presenta</p><div class="titulo">${titulo}</div>${extra === "capa-bloque" ? `<span class="ovalo"></span><p class="fecha-cartel">${esc(diaMes(p))}</p>` : ""}</div>`;
  return `<div class="cartel tono-${esc(p.tono)}" style="--corte:${Number(p.corte) || 40}%" aria-hidden="true">${capa("capa-base")}${capa("capa-bloque")}</div>`;
}

const proximo = PELICULAS.find((p) => !enCartel(p)) || PELICULAS[PELICULAS.length - 1];
document.getElementById("cartel-heroe").innerHTML = cartel(proximo);
document.getElementById("pie-heroe").textContent = `${enCartel(proximo) ? "En cartel" : "Próximo estreno, " + diaMes(proximo)}: ${proximo.titulo}`;

document.getElementById("lista-estrenos").innerHTML = PELICULAS.map((p) => `
  <li class="peli">
    ${cartel(p)}
    <p class="cuando">${enCartel(p) ? "En cartel" : "Estreno " + esc(diaMes(p))}</p>
    <h3>${esc(p.titulo)}</h3>
    <p class="ficha">${esc(p.genero)}. Dirige ${esc(p.direccion)}.</p>
    <p class="sinopsis">${esc(p.sinopsis)}</p>
  </li>`).join("");

/* Ajusta cada línea al ancho del cartel y coloca el bloque rojo sobre la última.
   Todo va en unidades de contenedor, así que el cartel escala sin recalcular. */
function ajustarCarteles() {
  document.querySelectorAll(".cartel").forEach((c) => {
    const base = c.querySelector(".capa-base");
    const lineas = [...base.querySelectorAll(".linea")];
    const medidas = lineas.map((l) => {
      l.style.fontSize = "100px";
      const ancho = l.getBoundingClientRect().width;
      return 8800 / ancho; // tamaño en cqw para ocupar el 88 % del ancho
    });
    c.style.setProperty("--pisa", `${(medidas[medidas.length - 1] * 0.92 + 0.8).toFixed(2)}cqw`);
    c.querySelectorAll(".titulo").forEach((t) => {
      t.querySelectorAll(".linea").forEach((l, i) => {
        l.style.fontSize = "";
        l.style.setProperty("--k", medidas[i].toFixed(2));
      });
    });
    c.classList.add("listo");
  });
}
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(ajustarCarteles);

/* ---------- Aparición de los carteles: el bloque entra al llegar al cartel ---------- */
const vigia = new IntersectionObserver((entradas) => {
  entradas.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("visto"); vigia.unobserve(e.target); }
  });
}, { threshold: 0.3 });
document.querySelectorAll(".cartel").forEach((c) => vigia.observe(c));

/* ---------- CTA fija en móvil: se esconde en la portada y junto al formulario ---------- */
const barra = document.getElementById("barra-cta");
const ocultan = new Set();
const vigiaBarra = new IntersectionObserver((entradas) => {
  entradas.forEach((e) => (e.isIntersecting ? ocultan.add(e.target) : ocultan.delete(e.target)));
  barra.classList.toggle("activa", ocultan.size === 0);
}, { rootMargin: "-90px 0px 0px 0px" }); // descuenta la cabecera fija
vigiaBarra.observe(document.getElementById("portada"));
vigiaBarra.observe(document.getElementById("registro"));

/* ---------- Formulario ---------- */
const form = document.getElementById("form-registro");
const boton = document.getElementById("enviar");
const errorGeneral = document.getElementById("error-general");
const CAMPOS = {
  nombre: { el: form.nombre, msg: () => (form.nombre.value.trim() ? "" : "Escribe tu nombre.") },
  email: { el: form.email, msg: () => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value.trim()) ? "" : "Revisa tu correo: falta algo, por ejemplo la @.") },
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
  const r = await fetch(SHEETS_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(datos) });
  return r.json();
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
