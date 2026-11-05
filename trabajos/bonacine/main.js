/* BonaCine, página principal: preguntas frecuentes y barra del móvil.
   Lo compartido con la landing está en comun.js. */

/* ---------- Preguntas frecuentes ---------- */

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
