/* BonaCine: calendario de sesiones y ocupación de las salas.
   Las salas y los horarios se cambian en peliculas.js.

   LA OCUPACIÓN ES SIMULADA. Con un sistema de reservas real, solo habría
   que cambiar estadoButacas() para que devuelva lo que diga ese sistema:
   una lista de "libre", "pendiente" u "ocupado" por butaca. */

const NOMBRE_DIA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const NOMBRE_MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const ESTADOS = { libre: "Libre", pendiente: "Sin confirmar", ocupado: "Ocupado" };
const DIAS_VISIBLES = 7;

const cajaDias = document.getElementById("cal-dias");
const cajaSesiones = document.getElementById("cal-sesiones");
const cajaMapa = document.getElementById("cal-mapa");

const claveFecha = (f) => `${f.getFullYear()}-${f.getMonth() + 1}-${f.getDate()}`;
const yaPaso = (fecha, hora) => {
  const [h, m] = hora.split(":").map(Number);
  const inicio = new Date(fecha);
  inicio.setHours(h, m, 0, 0);
  return inicio <= new Date();
};
const sesionesDe = (fecha) => SESIONES.filter((s) => !yaPaso(fecha, s.hora));

function proximosDias() {
  const dias = [];
  const f = new Date();
  f.setHours(0, 0, 0, 0);
  for (let i = 0; dias.length < DIAS_VISIBLES && i < 60; i++) {
    if (DIAS_APERTURA.includes(f.getDay()) && sesionesDe(f).length) dias.push(new Date(f));
    f.setDate(f.getDate() + 1);
  }
  return dias;
}

// Azar con semilla: la misma sesión sale igual cada vez que se abre la página.
function azarDesde(texto) {
  let h = 2166136261;
  for (const c of texto) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function estadoButacas(fecha, sesion, sala) {
  const azar = azarDesde(`${claveFecha(fecha)}|${sesion.sala}|${sesion.hora}`);
  const finde = [5, 6, 0].includes(fecha.getDay());
  const dias = Math.round((fecha - new Date().setHours(0, 0, 0, 0)) / 86400000);
  // Más llena en fin de semana, de noche y cuanto más cerca está la sesión
  const lleno = Math.max(0.12, (finde ? 0.68 : 0.36) + (sesion.hora >= "20:00" ? 0.14 : 0) - dias * 0.05 + azar() * 0.14 - 0.07);
  const butacas = [];
  for (let fila = 0; fila < sala.filas; fila++) {
    for (let col = 0; col < sala.columnas; col++) {
      const centro = 1 - Math.abs(col - (sala.columnas - 1) / 2) / sala.columnas;
      const r = azar();
      const p = lleno * (0.65 + centro * 0.55);
      butacas.push(r < p ? "ocupado" : r < p + 0.07 ? "pendiente" : "libre");
    }
  }
  return butacas;
}

function datosSesion(fecha, sesion) {
  const sala = SALAS.find((s) => s.nombre === sesion.sala);
  const butacas = estadoButacas(fecha, sesion, sala);
  const cuenta = { libre: 0, pendiente: 0, ocupado: 0 };
  butacas.forEach((b) => cuenta[b]++);
  return { sala, butacas, cuenta, total: butacas.length };
}

const textoCuenta = (c) => `${c.libre} libres, ${c.pendiente} sin confirmar, ${c.ocupado} ocupadas`;
const aviso = (d) => (d.cuenta.libre === 0 ? "Completa" : d.cuenta.libre <= d.total * 0.15 ? "Últimas butacas" : "");

function pintarMapa(fecha, sesion) {
  const d = datosSesion(fecha, sesion);
  cajaMapa.innerHTML = `
    <p class="mapa-titulo">${esc(sesion.pelicula)}</p>
    <p class="mapa-datos">${esc(sesion.sala)}, ${esc(NOMBRE_DIA[fecha.getDay()])} ${fecha.getDate()} ${esc(NOMBRE_MES[fecha.getMonth()])}, ${esc(sesion.hora)}</p>
    <div class="pantalla" aria-hidden="true">Pantalla</div>
    <div class="butacas" style="--columnas:${d.sala.columnas}" role="img" aria-label="Mapa de ${esc(sesion.sala)}: ${textoCuenta(d.cuenta)}">
      ${d.butacas.map((b, i) => `<span class="butaca ${b}" title="Fila ${Math.floor(i / d.sala.columnas) + 1}, butaca ${i % d.sala.columnas + 1}: ${ESTADOS[b]}"></span>`).join("")}
    </div>
    <ul class="leyenda">
      <li><span class="butaca libre"></span>Libre <strong>${d.cuenta.libre}</strong></li>
      <li><span class="butaca pendiente"></span>Sin confirmar <strong>${d.cuenta.pendiente}</strong></li>
      <li><span class="butaca ocupado"></span>Ocupado <strong>${d.cuenta.ocupado}</strong></li>
    </ul>`;
}

function pintarDia(fecha) {
  const lista = sesionesDe(fecha);
  cajaSesiones.innerHTML = lista.map((s, i) => {
    const d = datosSesion(fecha, s);
    const parte = (e) => `<span class="${e}" style="flex-grow:${d.cuenta[e]}"></span>`;
    const nota = aviso(d);
    return `
      <li><button type="button" class="sesion" data-i="${i}" aria-pressed="false">
        <span class="sesion-hora">${esc(s.hora)}</span>
        <span class="sesion-info">
          <strong>${esc(s.pelicula)}</strong>
          <span>${esc(s.sala)}. ${d.cuenta.libre} libres de ${d.total}${nota ? `. ${esc(nota)}` : ""}</span>
          <span class="barra" aria-hidden="true">${parte("ocupado")}${parte("pendiente")}${parte("libre")}</span>
        </span>
      </button></li>`;
  }).join("");

  const botones = [...cajaSesiones.querySelectorAll(".sesion")];
  const elegir = (i) => {
    botones.forEach((b, n) => b.setAttribute("aria-pressed", n === i ? "true" : "false"));
    pintarMapa(fecha, lista[i]);
  };
  botones.forEach((b, i) => b.addEventListener("click", () => {
    elegir(i);
    // En móvil el mapa queda debajo de la lista: lo acercamos al elegir sesión
    if (window.innerWidth <= 1000) {
      const suave = matchMedia("(prefers-reduced-motion: no-preference)").matches;
      cajaMapa.scrollIntoView({ behavior: suave ? "smooth" : "auto", block: "nearest" });
    }
  }));
  elegir(0);
}

const dias = proximosDias();
cajaDias.innerHTML = dias.map((f, i) => `
  <button type="button" class="dia" data-i="${i}" aria-pressed="false">
    <span>${claveFecha(f) === claveFecha(new Date()) ? "Hoy" : esc(NOMBRE_DIA[f.getDay()])}</span>
    <strong>${f.getDate()}</strong>
    <span>${esc(NOMBRE_MES[f.getMonth()])}</span>
  </button>`).join("");

const botonesDia = [...cajaDias.querySelectorAll(".dia")];
function elegirDia(i) {
  botonesDia.forEach((b, n) => b.setAttribute("aria-pressed", n === i ? "true" : "false"));
  pintarDia(dias[i]);
}
botonesDia.forEach((b, i) => b.addEventListener("click", () => elegirDia(i)));
elegirDia(0);
