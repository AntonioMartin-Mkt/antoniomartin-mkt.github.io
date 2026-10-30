/* =============================================================
   SHAKE WEEK · DÍA 2 — «LABERINTO GLITCH»
   Comecocos arcade: el vaso Miflshakes recorre un laberinto
   (diseño propio) comiéndose los toppings mientras cuatro clones
   glitch del Alter Ego lo persiguen.
   ============================================================= */
(() => {
  "use strict";
  const W = 640, H = 360, T = 16;
  const cv = document.getElementById("juego");
  const ctx = cv.getContext("2d");
  cv.width = W; cv.height = H; ctx.imageSmoothingEnabled = false;

  const PAL = {
    negro: "#0b0a0f", rojo: "#e3222e", rojoOsc: "#9c1420", crema: "#f3e6cf", blanco: "#fffaf0", rosa: "#ff5fa8",
    cian: "#2fe6ff", magenta: "#ff2fd0", verde: "#3dff7a", azul: "#3d5cff", oro: "#ffcf3a", gris: "#2a2433", grisC: "#5b5068", bsod: "#1a3cff"
  };
  const FUENTE = '"Press Start 2P", ui-monospace, monospace';

  /* ---------------- Laberinto (diseño propio, simétrico, sin callejones) ----------------
     #  pared · .  topping · o  batido de fresa (power) · G  casa de los clones
     -  puerta de la casa · P  salida del jugador · espacio  túnel / vacío            */
  const MAPA = [
    "###########################",
    "#o.......................o#",
    "#.###.#.#.#######.#.#.###.#",
    "#.#.....#....#....#.....#.#",
    "#.#.###.####.#.####.###.#.#",
    "#.........................#",
    "###.#.####.##-##.####.#.###",
    "###.#......#GGG#......#.###",
    "   .####.#.#GGG#.#.####.   ",
    "###.#....#.#####.#....#.###",
    "###.#.##.#.......#.##.#.###",
    "#.........###.###.........#",
    "#.#####.#.........#.#####.#",
    "#o..#.....#.#.#.#.....#..o#",
    "###.#.###.#.....#.###.#.###",
    "#.....#...#.#P#.#...#.....#",
    "#.###.#.###.#.#.###.#.###.#",
    "#.........................#",
    "###########################"
  ];
  const FIL = MAPA.length, COL = MAPA[0].length;
  const OX = Math.floor((W - COL * T) / 2), OY = Math.floor((H - FIL * T) / 2) + 8;
  const INICIO = { x: 13, y: 15 }, PUERTA = { x: 13, y: 5 }, CASA = { x: 13, y: 7 }, FRUTA = { x: 13, y: 10 };
  const envC = c => ((c % COL) + COL) % COL;
  const celda = (c, f) => (f < 0 || f >= FIL) ? "#" : MAPA[f][envC(c)];
  const muro = (c, f) => celda(c, f) === "#";
  const esCasa = (c, f) => { const ch = celda(c, f); return ch === "G" || ch === "-"; };
  const libreJug = (c, f) => !muro(c, f) && !esCasa(c, f);
  const DIRS = [{ dx: 0, dy: -1 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 1, dy: 0 }]; // arriba, izq, abajo, der (orden clásico de desempate)

  /* ---------------- Dificultad ---------------- */
  const DIFS = {
    facil: { nombre: "FÁCIL", vidas: 4, vJug: 7.4, vFant: 5.2, vMiedo: 3.4, miedo: 8, salidas: [0, 5, 12, 20], azar: 0.5, ciclo: [[9, 10]], consumible: 14 },
    normal: { nombre: "NORMAL", vidas: 3, vJug: 7.6, vFant: 6.8, vMiedo: 4.2, miedo: 6, salidas: [0, 3, 8, 14], azar: 0.15, ciclo: [[7, 20], [7, 20], [5, 9999]], consumible: 20 }
  };
  let dif = "facil";
  try { const g = JSON.parse(localStorage.getItem("shakeweek-dia2") || "{}"); if (DIFS[g.dif]) dif = g.dif; } catch (e) {}
  const D = () => DIFS[dif];

  // Los cuatro clones glitch, cada uno con su personalidad
  const CLONES = [
    { nombre: "GLITCHY", color: PAL.cian, desc: "te persigue", esquina: { x: 25, y: -2 } },
    { nombre: "PÍXEL", color: PAL.magenta, desc: "te corta el paso", esquina: { x: 1, y: -2 } },
    { nombre: "BUG", color: PAL.verde, desc: "va a su aire", esquina: { x: 25, y: 20 } },
    { nombre: "LAG", color: PAL.oro, desc: "se acerca y huye", esquina: { x: 1, y: 20 } }
  ];

  const CONSUMIBLES = {
    iman: { nombre: "IMÁN", color: PAL.rojo, dur: 7, desc: "atrae los toppings" },
    hielo: { nombre: "CONGELADOR", color: PAL.cian, dur: 4.5, desc: "congela a los clones" },
    escudo: { nombre: "ESCUDO DE NATA", color: PAL.blanco, dur: 0, desc: "aguanta un toque" },
    turbo: { nombre: "TURBO", color: PAL.rosa, dur: 6, desc: "corres más" }
  };
  const FRUTAS = [{ tipo: "cereza", pts: 300 }, { tipo: "fresa", pts: 500 }];

  /* ---------------- Recursos ---------------- */
  const A = {};
  function cargar(src) { return new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(i); i.src = src; }); }
  function tintar(img, color, alfa = 1) {
    const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
    const x = c.getContext("2d"); x.drawImage(img, 0, 0);
    x.globalCompositeOperation = "source-atop"; x.globalAlpha = alfa; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
    return c;
  }

  /* ---------------- Entrada ---------------- */
  let pedido = null; // dirección que quiere el jugador
  const TECLAS = { ArrowUp: 0, KeyW: 0, ArrowLeft: 1, KeyA: 1, ArrowDown: 2, KeyS: 2, ArrowRight: 3, KeyD: 3 };
  addEventListener("keydown", e => {
    if (e.code in TECLAS) { e.preventDefault(); pedido = DIRS[TECLAS[e.code]]; Sonido.iniciar(); }
    if (e.code === "Enter" || e.code === "Space") { e.preventDefault(); accionPrincipal(); }
    if (e.code === "Escape" || e.code === "KeyP") pausar();
    if (e.code === "KeyM") Sonido.alternar();
  });
  addEventListener("blur", () => { if (estado === "juego") pausar(); });
  document.querySelectorAll("[data-dir]").forEach(b => {
    b.addEventListener("pointerdown", e => { e.preventDefault(); Sonido.iniciar(); pedido = DIRS[+b.dataset.dir]; b.classList.add("on"); });
    const off = () => b.classList.remove("on");
    b.addEventListener("pointerup", off); b.addEventListener("pointerleave", off); b.addEventListener("pointercancel", off);
  });
  // Deslizar el dedo sobre la pantalla también cambia de dirección
  let toque = null;
  cv.addEventListener("pointerdown", e => { toque = { x: e.clientX, y: e.clientY }; });
  cv.addEventListener("pointermove", e => {
    if (!toque) return;
    const dx = e.clientX - toque.x, dy = e.clientY - toque.y;
    if (Math.hypot(dx, dy) > 24) { pedido = Math.abs(dx) > Math.abs(dy) ? DIRS[dx > 0 ? 3 : 1] : DIRS[dy > 0 ? 2 : 0]; toque = { x: e.clientX, y: e.clientY }; Sonido.iniciar(); }
  });
  addEventListener("pointerup", () => { toque = null; });

  /* ---------------- Sonido ---------------- */
  const Sonido = {
    ac: null, master: null, on: true, sirena: null, sirenaLfo: null,
    iniciar() {
      if (this.ac) { if (this.ac.state === "suspended") this.ac.resume(); return; }
      try {
        this.ac = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.ac.createGain(); this.master.gain.value = this.on ? 0.5 : 0; this.master.connect(this.ac.destination);
      } catch (e) { this.ac = null; }
    },
    alternar() { this.on = !this.on; if (this.master) this.master.gain.value = this.on ? 0.5 : 0; const b = document.getElementById("btnSonido"); if (b) b.textContent = this.on ? "🔊" : "🔇"; },
    tono(f1, f2, dur, tipo = "square", vol = 0.1, ret = 0) {
      if (!this.ac) return; const t = this.ac.currentTime + ret;
      const o = this.ac.createOscillator(), g = this.ac.createGain();
      o.type = tipo; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
    },
    ruido(dur, vol = 0.2, corte = 1500) {
      if (!this.ac) return; const t = this.ac.currentTime;
      const n = Math.floor(this.ac.sampleRate * dur), buf = this.ac.createBuffer(1, n, this.ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      const s = this.ac.createBufferSource(), f = this.ac.createBiquadFilter(), g = this.ac.createGain();
      s.buffer = buf; f.type = "lowpass"; f.frequency.value = corte;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(this.master); s.start(t);
    },
    // Sirena de fondo: sube de tono según quedan menos toppings; cambia cuando los clones tienen miedo
    sirenaOn(miedo = false) {
      if (!this.ac) return; this.sirenaOff();
      const o = this.ac.createOscillator(), g = this.ac.createGain(), lfo = this.ac.createOscillator(), lg = this.ac.createGain();
      o.type = miedo ? "square" : "triangle"; o.frequency.value = miedo ? 180 : 330;
      lfo.frequency.value = miedo ? 9 : 2.6; lg.gain.value = miedo ? 40 : 90;
      lfo.connect(lg); lg.connect(o.frequency); g.gain.value = miedo ? 0.025 : 0.035;
      o.connect(g); g.connect(this.master); o.start(); lfo.start();
      this.sirena = o; this.sirenaLfo = lfo; this.sirenaGan = g;
    },
    sirenaTono(k) { if (this.sirena && this.sirena.type === "triangle") this.sirena.frequency.value = 330 + k * 220; },
    sirenaOff() { try { this.sirena?.stop(); this.sirenaLfo?.stop(); } catch (e) {} this.sirena = null; }
  };
  let waka = 0;
  const sfx = {
    comer: () => { waka ^= 1; Sonido.tono(waka ? 520 : 380, waka ? 380 : 520, 0.06, "square", 0.04); },
    power: () => [392, 523, 659, 784].forEach((f, i) => Sonido.tono(f, f * 1.02, 0.1, "square", 0.07, i * 0.06)),
    fantasma: () => { Sonido.tono(200, 1600, 0.35, "square", 0.08); },
    fruta: () => { Sonido.tono(988, 988, 0.08, "square", 0.08); Sonido.tono(1319, 1319, 0.18, "square", 0.08, 0.08); },
    consumible: () => { Sonido.tono(660, 1320, 0.2, "triangle", 0.12); Sonido.tono(990, 1980, 0.2, "triangle", 0.08, 0.1); },
    muerte: () => { for (let i = 0; i < 8; i++) Sonido.tono(800 - i * 80, 600 - i * 70, 0.12, "square", 0.08, i * 0.11); Sonido.ruido(0.4, 0.15, 900); },
    vidaExtra: () => [523, 659, 784, 1047, 1319].forEach((f, i) => Sonido.tono(f, f, 0.08, "square", 0.08, i * 0.07)),
    escudo: () => { Sonido.tono(1320, 1320, 0.07, "triangle", 0.2); Sonido.tono(1980, 1980, 0.14, "triangle", 0.15, 0.06); },
    intro: () => {
      const m = [72, 79, 76, 72, 74, 0, 79, 74, 71, 74, 72, 0, 76, 79, 84, 83, 79, 0, 76, 74, 72];
      m.forEach((n, i) => { if (n) { const f = 440 * Math.pow(2, (n - 69) / 12); Sonido.tono(f, f, 0.11, "square", 0.06, i * 0.11); Sonido.tono(f / 4, f / 4, 0.11, "triangle", 0.12, i * 0.11); } });
    },
    victoria: () => [523, 659, 784, 659, 784, 1047].forEach((f, i) => Sonido.tono(f, f, 0.14, "square", 0.08, i * 0.12))
  };

  /* ---------------- Estado ---------------- */
  let estado = "cargando", reloj = 0, tiempoJuego = 0, banner = null, temblor = 0, pausaT = 0;
  let toppings, quedan, total, jug, fantasmas, puntos, vidas, record, fantasmasComidos, cadena, frutasComidas, fruta, frutasSalidas;
  let consumible, proxConsumible, activo, escudo, parts, textos, miedoT, modoIdx, modoT, modoActual, muerteT, completadoT, vidaExtraDada, comidosIman;
  try { record = +localStorage.getItem("shakeweek-dia2-record") || 0; } catch (e) { record = 0; }

  function nuevaPartida() {
    toppings = MAPA.map(f => f.split("").map(ch => ch === "." ? 1 : ch === "o" ? 2 : 0));
    total = quedan = toppings.flat().filter(Boolean).length;
    puntos = 0; vidas = D().vidas; fantasmasComidos = 0; frutasComidas = []; frutasSalidas = 0; tiempoJuego = 0; vidaExtraDada = false; comidosIman = 0;
    parts = []; textos = [];
    colocar();
    estado = "preparado"; pausaT = 2.6; mostrarBanner("¡PREPARADOS!", "", 2.4);
    ocultarMenu(); Sonido.sirenaOff(); sfx.intro();
  }

  // Coloca al jugador y a los clones en su sitio (al empezar y tras perder una vida)
  function colocar() {
    jug = { x: INICIO.x, y: INICIO.y, dx: -1, dy: 0, anim: 0, est: 1, mira: -1 };
    pedido = null;
    fantasmas = CLONES.map((c, i) => ({
      i, ...c, x: i === 0 ? PUERTA.x : 12 + (i - 1), y: i === 0 ? PUERTA.y : CASA.y + (i === 2 ? 1 : 0),
      dx: i === 0 ? -1 : 0, dy: i === 0 ? 0 : 1, modo: i === 0 ? "normal" : "casa", salida: D().salidas[i], miedo: false, congelado: 0, t: Math.random() * 5
    }));
    miedoT = 0; cadena = 0; modoIdx = 0; modoT = 0; modoActual = "disperso";
    fruta = null; consumible = null; proxConsumible = D().consumible; activo = null; escudo = escudo || false;
  }

  function mostrarBanner(texto, sub = "", dur = 1.4, alAcabar = null, color = PAL.crema) { banner = { texto, sub, t: 0, dur, alAcabar, color }; }

  /* ---------------- Movimiento sobre la cuadrícula ---------------- */
  // Avanza «dist» casillas; en cada centro de casilla llama a «decidir» para girar o parar
  function mover(e, dist, decidir) {
    let resto = dist;
    for (let n = 0; n < 6 && resto > 1e-9; n++) {
      const enCentro = Math.abs(e.x - Math.round(e.x)) < 1e-6 && Math.abs(e.y - Math.round(e.y)) < 1e-6;
      if (n === 0 && enCentro) decidir(e);
      if (!e.dx && !e.dy) { if (!enCentro || n > 0) decidir(e); if (!e.dx && !e.dy) return; }
      let d;
      if (e.dx) { const t = e.dx > 0 ? Math.floor(e.x + 1e-6) + 1 : Math.ceil(e.x - 1e-6) - 1; d = Math.abs(t - e.x); }
      else { const t = e.dy > 0 ? Math.floor(e.y + 1e-6) + 1 : Math.ceil(e.y - 1e-6) - 1; d = Math.abs(t - e.y); }
      if (resto < d) { e.x += e.dx * resto; e.y += e.dy * resto; resto = 0; }
      else {
        e.x = Math.round(e.x + e.dx * d); e.y = Math.round(e.y + e.dy * d); resto -= d;
        if (e.x < 0) e.x += COL; if (e.x >= COL) e.x -= COL; // túnel
        decidir(e);
      }
    }
  }

  function decidirJugador(e) {
    const cx = Math.round(e.x), cy = Math.round(e.y);
    comer(cx, cy);
    if (pedido && libreJug(cx + pedido.dx, cy + pedido.dy)) { e.dx = pedido.dx; e.dy = pedido.dy; }
    if (!libreJug(cx + e.dx, cy + e.dy)) { e.dx = 0; e.dy = 0; }
    if (e.dx) e.mira = e.dx;
  }

  function comer(cx, cy) {
    const f = toppings[cy], v = f && f[envC(cx)];
    if (!v) return;
    f[envC(cx)] = 0; quedan--;
    if (v === 1) { puntos += 10; sfx.comer(); jug.est = 0.85; }
    else { puntos += 50; asustar(); }
    const comidos = total - quedan;
    if ((comidos === 70 || comidos === 170) && frutasSalidas < 2) { fruta = { ...FRUTAS[frutasSalidas], t: 10 }; frutasSalidas++; }
    Sonido.sirenaTono(1 - quedan / total);
    if (!vidaExtraDada && puntos >= 10000) { vidaExtraDada = true; vidas++; sfx.vidaExtra(); flotar("¡VIDA EXTRA!", jug.x, jug.y - 1, PAL.verde); }
    if (quedan <= 0) completar();
  }

  function asustar() {
    sfx.power(); miedoT = D().miedo; cadena = 0;
    fantasmas.forEach(g => { if (g.modo === "normal") { g.miedo = true; g.dx = -g.dx; g.dy = -g.dy; } });
    Sonido.sirenaOn(true);
  }

  // Dónde quiere ir cada clon
  function objetivo(g) {
    if (g.modo === "ojos") return PUERTA;
    if (modoActual === "disperso") return g.esquina;
    const jx = Math.round(jug.x), jy = Math.round(jug.y);
    if (g.i === 0) return { x: jx, y: jy };
    if (g.i === 1) return { x: jx + jug.dx * 4, y: jy + jug.dy * 4 };
    if (g.i === 3) return Math.hypot(g.x - jx, g.y - jy) > 7 ? { x: jx, y: jy } : g.esquina;
    return null; // BUG: va a su aire
  }

  function decidirFantasma(g) {
    const cx = Math.round(g.x), cy = Math.round(g.y);
    if (g.modo === "ojos" && cx === PUERTA.x && cy === PUERTA.y) { g.modo = "entrando"; g.dx = 0; g.dy = 1; return; }
    const libre = (c, f) => !muro(c, f) && (!esCasa(c, f) || g.modo === "ojos");
    let ops = DIRS.filter(d => !(d.dx === -g.dx && d.dy === -g.dy) && libre(cx + d.dx, cy + d.dy));
    if (!ops.length) ops = DIRS.filter(d => libre(cx + d.dx, cy + d.dy));
    if (!ops.length) { g.dx = g.dy = 0; return; }
    const obj = objetivo(g);
    let elegida;
    const alAzar = g.miedo || !obj || (g.modo !== "ojos" && Math.random() < D().azar && g.i !== 0);
    if (alAzar) elegida = ops[Math.floor(Math.random() * ops.length)];
    else {
      let mejor = Infinity;
      for (const d of ops) { const dist = Math.hypot(cx + d.dx - obj.x, cy + d.dy - obj.y); if (dist < mejor - 1e-6) { mejor = dist; elegida = d; } }
    }
    g.dx = elegida.dx; g.dy = elegida.dy;
  }

  function actualizarFantasma(g, dt) {
    g.t += dt;
    if (g.congelado > 0) { g.congelado -= dt; return; }
    const enTunel = Math.round(g.y) === 8 && (g.x < 3 || g.x > COL - 4);
    let v = g.modo === "ojos" ? 13 : g.miedo ? D().vMiedo : D().vFant;
    if (enTunel && g.modo !== "ojos") v *= 0.55;
    if (g.modo === "casa") {
      // botan dentro de la casa hasta que les toca salir
      g.y += g.dy * 2.5 * dt;
      if (g.y < CASA.y - 0.3) { g.y = CASA.y - 0.3; g.dy = 1; } if (g.y > CASA.y + 1.2) { g.y = CASA.y + 1.2; g.dy = -1; }
      if (tiempoVivo >= g.salida) g.modo = "saliendo";
      return;
    }
    if (g.modo === "saliendo" || g.modo === "entrando") {
      const meta = g.modo === "saliendo" ? (Math.abs(g.x - PUERTA.x) > 0.05 ? { x: PUERTA.x, y: CASA.y } : PUERTA) : { x: CASA.x, y: CASA.y + 0.5 };
      const dx = meta.x - g.x, dy = meta.y - g.y, d = Math.hypot(dx, dy), paso = (g.modo === "entrando" ? 10 : 3.2) * dt;
      if (d <= paso) {
        g.x = meta.x; g.y = meta.y;
        if (g.modo === "saliendo" && meta === PUERTA) { g.modo = "normal"; g.dx = -1; g.dy = 0; g.miedo = false; }
        else if (g.modo === "entrando") { g.modo = "saliendo"; g.miedo = false; }
      } else { g.x += dx / d * paso; g.y += dy / d * paso; }
      return;
    }
    mover(g, v * dt, decidirFantasma);
  }

  let tiempoVivo = 0; // tiempo desde que empezó la vida actual (para soltar clones)

  /* ---------------- Bucle de juego ---------------- */
  function actualizar(dt) {
    reloj += dt;
    if (banner) { banner.t += dt; if (banner.t > banner.dur) { const f = banner.alAcabar; banner = null; if (f) f(); } }
    parts = parts.filter(q => (q.t -= dt) > 0); parts.forEach(q => { q.vy += (q.grav || 0) * dt; q.x += q.vx * dt; q.y += q.vy * dt; });
    textos = textos.filter(q => (q.vida -= dt) > 0); textos.forEach(q => q.y -= 1.6 * dt);
    temblor = Math.max(0, temblor - dt * 30);

    if (estado === "preparado") { pausaT -= dt; if (pausaT <= 0) { estado = "juego"; Sonido.sirenaOn(false); Sonido.sirenaTono(1 - quedan / total); } return; }
    if (estado === "muriendo") { muerteT += dt; if (muerteT > 2.2) trasMorir(); return; }
    if (estado === "completado") { completadoT += dt; if (completadoT > 2.4) mostrarResultados(); return; }
    if (estado !== "juego") return;

    tiempoJuego += dt; tiempoVivo += dt;

    // Ciclo disperso/persecución (los clones dan media vuelta al cambiar)
    if (miedoT <= 0) {
      modoT += dt;
      const ciclo = D().ciclo, fase = ciclo[Math.min(modoIdx, ciclo.length - 1)];
      const dur = modoActual === "disperso" ? fase[0] : fase[1];
      if (modoT > dur) {
        modoT = 0; if (modoActual === "persecucion") modoIdx++;
        modoActual = modoActual === "disperso" ? "persecucion" : "disperso";
        fantasmas.forEach(g => { if (g.modo === "normal") { g.dx = -g.dx; g.dy = -g.dy; } });
      }
    } else {
      miedoT -= dt;
      if (miedoT <= 0) { fantasmas.forEach(g => g.miedo = false); Sonido.sirenaOn(false); Sonido.sirenaTono(1 - quedan / total); }
    }

    // Jugador: puede dar media vuelta en cualquier momento
    if (pedido && pedido.dx === -jug.dx && pedido.dy === -jug.dy && (jug.dx || jug.dy)) { jug.dx = pedido.dx; jug.dy = pedido.dy; if (jug.dx) jug.mira = jug.dx; }
    const vJ = D().vJug * (activo?.tipo === "turbo" ? 1.35 : 1) * (Math.round(jug.y) === 8 && (jug.x < 3 || jug.x > COL - 4) ? 0.9 : 1);
    mover(jug, vJ * dt, decidirJugador);
    jug.anim += dt * (jug.dx || jug.dy ? 1 : 0); jug.est += (1 - jug.est) * Math.min(1, dt * 12);

    // Potenciadores activos
    if (activo) {
      activo.t -= dt;
      if (activo.tipo === "iman") {
        for (let f = 0; f < FIL; f++) for (let c = 0; c < COL; c++) {
          if (toppings[f][c] === 1 && Math.hypot(c - jug.x, f - jug.y) < 3.2) {
            parts.push({ x: c, y: f, vx: (jug.x - c) * 6, vy: (jug.y - f) * 6, t: 0.16, c: PAL.crema, s: 3, grav: 0 });
            comer(c, f); comidosIman++; if (estado !== "juego") return;
          }
        }
      }
      if (activo.t <= 0) activo = null;
    }

    // Clones
    for (const g of fantasmas) {
      actualizarFantasma(g, dt);
      const fuera = g.modo === "normal";
      if (fuera && Math.hypot(g.x - jug.x, g.y - jug.y) < 0.62) {
        if (g.miedo) comerFantasma(g);
        else if (escudo) { escudo = false; g.modo = "ojos"; g.miedo = false; sfx.escudo(); flotar("¡ESCUDO!", jug.x, jug.y - 1, PAL.blanco); particulas(jug.x, jug.y, [PAL.blanco, PAL.crema], 16); }
        else if (g.congelado <= 0) { morir(); return; } // los congelados no hacen daño
      }
    }

    // Fruta de bonus
    if (fruta) {
      fruta.t -= dt;
      if (Math.hypot(jug.x - FRUTA.x, jug.y - FRUTA.y) < 0.6) { puntos += fruta.pts; frutasComidas.push(fruta.tipo); sfx.fruta(); flotar(`+${fruta.pts}`, FRUTA.x, FRUTA.y, PAL.rosa); fruta = null; }
      else if (fruta.t <= 0) fruta = null;
    }

    // Consumibles: aparecen cada cierto tiempo en un pasillo lejos de ti
    proxConsumible -= dt;
    if (!consumible && proxConsumible <= 0) {
      const tipos = Object.keys(CONSUMIBLES), libres = [];
      for (let f = 0; f < FIL; f++) for (let c = 0; c < COL; c++) if (libreJug(c, f) && celda(c, f) !== " " && Math.hypot(c - jug.x, f - jug.y) > 7) libres.push({ c, f });
      const s = libres[Math.floor(Math.random() * libres.length)];
      consumible = { tipo: tipos[Math.floor(Math.random() * tipos.length)], x: s.c, y: s.f, t: 11 };
      proxConsumible = D().consumible;
    }
    if (consumible) {
      consumible.t -= dt;
      if (Math.hypot(jug.x - consumible.x, jug.y - consumible.y) < 0.65) usarConsumible(consumible);
      else if (consumible.t <= 0) consumible = null;
    }
    if (puntos > record) record = puntos;
  }

  function usarConsumible(c) {
    const def = CONSUMIBLES[c.tipo]; consumible = null; puntos += 100; sfx.consumible();
    particulas(c.x, c.y, [def.color, PAL.blanco, PAL.oro], 16);
    flotar(def.nombre, jug.x, jug.y - 1.2, def.color);
    if (c.tipo === "escudo") escudo = true;
    else if (c.tipo === "hielo") { fantasmas.forEach(g => { if (g.modo === "normal") g.congelado = def.dur; }); activo = { tipo: "hielo", t: def.dur }; }
    else activo = { tipo: c.tipo, t: def.dur };
  }

  function comerFantasma(g) {
    cadena++; const pts = 200 * Math.pow(2, Math.min(cadena, 4) - 1);
    puntos += pts; fantasmasComidos++; g.modo = "ojos"; g.miedo = false; g.congelado = 0;
    sfx.fantasma(); temblor = 4; flotar(`${pts}`, g.x, g.y, PAL.cian);
    particulas(g.x, g.y, [PAL.cian, PAL.magenta, PAL.verde, PAL.bsod], 20);
    pausaComer = 0.35;
  }
  let pausaComer = 0;

  function morir() {
    estado = "muriendo"; muerteT = 0; Sonido.sirenaOff(); sfx.muerte(); temblor = 6;
    particulas(jug.x, jug.y, [PAL.rojo, PAL.blanco], 22);
  }
  function trasMorir() {
    vidas--;
    if (vidas <= 0) { estado = "gameover"; guardarRecord(); mostrarMenu("gameover"); return; }
    const esc = escudo; colocar(); escudo = esc; tiempoVivo = 0;
    estado = "preparado"; pausaT = 1.8; mostrarBanner("¡OTRA VEZ!", `QUEDAN ${vidas} ${vidas === 1 ? "VIDA" : "VIDAS"}`, 1.7);
  }
  function completar() {
    estado = "completado"; completadoT = 0; Sonido.sirenaOff(); sfx.victoria();
    mostrarBanner("¡LABERINTO LIMPIO!", "", 2.2, null, PAL.verde);
  }

  function flotar(t, x, y, c) { textos.push({ t, x, y, vida: 1, c }); }
  function particulas(x, y, cols, n = 12) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = 3 + Math.random() * 6;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0.4 + Math.random() * 0.4, c: cols[i % cols.length], s: 2 + Math.floor(Math.random() * 2), grav: 8 });
    }
  }

  /* ---------------- Resultados y guardado ---------------- */
  function guardarRecord() { try { localStorage.setItem("shakeweek-dia2-record", String(record)); } catch (e) {} }
  function mostrarResultados() {
    guardarRecord();
    let pts = Math.min(40, puntos / 110) + Math.min(3, vidas) * 10 + Math.min(8, fantasmasComidos) * 2.5 + frutasComidas.length * 5;
    pts = Math.round(pts);
    if (dif === "facil" && pts > 88) pts = 88;
    const nota = pts >= 95 ? "A+" : pts >= 88 ? "A" : pts >= 80 ? "A-" : pts >= 72 ? "B+" : pts >= 64 ? "B" : pts >= 56 ? "B-" : pts >= 48 ? "C+" : pts >= 40 ? "C" : "D";
    try {
      const est = JSON.parse(localStorage.getItem("shakeweek-v1") || "{}");
      const modo = est.modo === "campana" ? "campana" : "demo";
      est.modo = est.modo || "demo"; est.demo = est.demo || {}; est.campana = est.campana || {}; est.mejores = est.mejores || {};
      const d = new Date(), hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!est[modo][2]) est[modo][2] = hoy;
      est.mejores[2] = Math.max(est.mejores[2] || 0, puntos);
      localStorage.setItem("shakeweek-v1", JSON.stringify(est));
    } catch (e) {}
    estado = "resultados";
    mostrarMenu("resultados", { nota });
  }

  /* ---------------- Menús ---------------- */
  const menu = document.getElementById("menu");
  function ocultarMenu() { menu.className = "menu"; menu.innerHTML = ""; }
  function mostrarMenu(tipo, datos = {}) {
    menu.className = "menu ver " + tipo;
    const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
    if (tipo === "titulo") {
      menu.innerHTML = `<div class="caja">
        <p class="pre">SHAKE WEEK · DÍA 2</p>
        <h1>LABERINTO<br><span>GLITCH</span></h1>
        <p class="hist">Los clones del Alter Ego se han colado en el almacén de toppings. Cómetelos todos sin que te pillen. Los <b class="rosa">batidos de fresa</b> los asustan: ¡entonces puedes comértelos a ellos!</p>
        <div class="clones">${CLONES.map(c => `<span style="color:${c.color}">■ ${c.nombre}<small>${c.desc}</small></span>`).join("")}</div>
        <div class="eleccion"><span class="et">DIFICULTAD</span>
          ${Object.entries(DIFS).map(([k, d]) => `<button class="op ${k === dif ? "sel" : ""}" data-dif="${k}">${d.nombre}${k === "facil" ? " ★" : ""}</button>`).join("")}
        </div>
        <button class="b principal" data-accion="empezar">▶ JUGAR</button>
        <div class="ctrls"><span><b>FLECHAS</b> / <b>WASD</b> moverte</span><span>En el móvil: <b>desliza</b> o usa la cruceta</span>
          <span>Consumibles: ${Object.values(CONSUMIBLES).map(c => `<b style="color:${c.color}">${c.nombre}</b>`).join(" · ")}</span></div>
      </div>`;
    } else if (tipo === "gameover") {
      menu.innerHTML = `<div class="caja">
        <h2 class="rojo">¡TE HAN PILLADO!</h2>
        <div class="progreso"><i style="width:${Math.round((1 - quedan / total) * 100)}%"></i></div>
        <p class="hist">Te has comido el ${Math.round((1 - quedan / total) * 100)} % de los toppings · ${puntos} puntos</p>
        <div class="fila"><button class="b principal" data-accion="empezar">↻ REINTENTAR</button><a class="b" href="index.html">SALIR</a></div></div>`;
    } else if (tipo === "resultados") {
      menu.innerHTML = `<div class="caja tarjeta">
        <h2>¡NIVEL SUPERADO!</h2>
        <ul class="filas">
          <li><span>PUNTOS</span><b>${puntos}</b></li>
          <li><span>TIEMPO</span><b>${fmt(tiempoJuego)}</b></li>
          <li><span>VIDAS</span><b>${"♥".repeat(Math.max(0, vidas))}</b></li>
          <li><span>CLONES COMIDOS</span><b>${fantasmasComidos}</b></li>
          <li><span>BONUS</span><b>${frutasComidas.length}/2</b></li>
          <li><span>DIFICULTAD</span><b>${D().nombre}</b></li>
        </ul>
        <div class="nota"><small>NOTA</small><b>${datos.nota}</b></div>
        <p class="sello">Sello del martes conseguido ✔ · Récord: ${record}</p>
        <div class="fila"><a class="b principal" href="index.html">VOLVER A SHAKE WEEK</a><button class="b" data-accion="empezar">↻ MEJORAR NOTA</button></div></div>`;
    } else if (tipo === "pausa") {
      menu.innerHTML = `<div class="caja"><h2>PAUSA</h2><div class="fila col">
        <button class="b principal" data-accion="continuar">▶ CONTINUAR</button>
        <button class="b" data-accion="empezar">↻ REINICIAR</button><a class="b" href="index.html">SALIR</a></div></div>`;
    }
    const primero = menu.querySelector(".principal"); if (primero) primero.focus();
  }
  menu.addEventListener("click", e => {
    const op = e.target.closest("[data-dif]");
    if (op) { dif = op.dataset.dif; try { localStorage.setItem("shakeweek-dia2", JSON.stringify({ dif })); } catch (er) {} Sonido.iniciar(); Sonido.tono(880, 880, 0.05); mostrarMenu("titulo"); return; }
    const b = e.target.closest("[data-accion]"); if (!b) return;
    Sonido.iniciar();
    if (b.dataset.accion === "empezar") { tiempoVivo = 0; escudo = false; nuevaPartida(); }
    if (b.dataset.accion === "continuar") pausar();
  });
  function accionPrincipal() {
    Sonido.iniciar();
    if (estado === "titulo" || estado === "gameover") { tiempoVivo = 0; escudo = false; nuevaPartida(); }
    else if (estado === "pausa") pausar();
    else if (estado === "resultados") location.href = "index.html";
  }
  let estadoPrevio = null;
  function pausar() {
    if (estado === "juego" || estado === "preparado") { estadoPrevio = estado; estado = "pausa"; Sonido.sirenaOff(); mostrarMenu("pausa"); }
    else if (estado === "pausa") { estado = estadoPrevio; ocultarMenu(); if (estado === "juego") { Sonido.sirenaOn(miedoT > 0); Sonido.sirenaTono(1 - quedan / total); } }
  }
  document.getElementById("btnPausa")?.addEventListener("click", pausar);
  document.getElementById("btnSonido")?.addEventListener("click", () => { Sonido.iniciar(); Sonido.alternar(); });

  /* ---------------- Dibujo ---------------- */
  const px = (c) => OX + c * T + T / 2, py = (f) => OY + f * T + T / 2;

  // Paredes: se dibujan una vez en un lienzo aparte (neón rojo de la marca)
  function prepararLaberinto(color = PAL.rojo, relleno = "#1a0710") {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
    for (let f = 0; f < FIL; f++) for (let k = 0; k < COL; k++) {
      if (MAPA[f][k] !== "#") continue;
      const X = OX + k * T, Y = OY + f * T;
      x.fillStyle = relleno; x.fillRect(X, Y, T, T);
      x.fillStyle = color;
      const abierto = (c2, f2) => f2 >= 0 && f2 < FIL && c2 >= 0 && c2 < COL && MAPA[f2][c2] !== "#";
      if (abierto(k, f - 1)) x.fillRect(X, Y + 2, T, 2);
      if (abierto(k, f + 1)) x.fillRect(X, Y + T - 4, T, 2);
      if (abierto(k - 1, f)) x.fillRect(X + 2, Y, 2, T);
      if (abierto(k + 1, f)) x.fillRect(X + T - 4, Y, 2, T);
      // esquinas interiores
      if (abierto(k - 1, f - 1) && !abierto(k - 1, f) && !abierto(k, f - 1)) x.fillRect(X, Y + 2, 4, 2);
      if (abierto(k + 1, f - 1) && !abierto(k + 1, f) && !abierto(k, f - 1)) x.fillRect(X + T - 4, Y + 2, 4, 2);
      if (abierto(k - 1, f + 1) && !abierto(k - 1, f) && !abierto(k, f + 1)) x.fillRect(X, Y + T - 4, 4, 2);
      if (abierto(k + 1, f + 1) && !abierto(k + 1, f) && !abierto(k, f + 1)) x.fillRect(X + T - 4, Y + T - 4, 4, 2);
    }
    // Puerta de la casa
    x.fillStyle = PAL.rosa; x.fillRect(OX + 13 * T, OY + 6 * T + 7, T, 3);
    return c;
  }

  const COLORES_SPRINKLE = [PAL.rojo, PAL.crema, PAL.rosa, PAL.cian, PAL.oro, PAL.verde];
  function dibujarToppings() {
    for (let f = 0; f < FIL; f++) for (let c = 0; c < COL; c++) {
      const v = toppings[f][c]; if (!v) continue;
      const X = px(c), Y = py(f);
      if (v === 1) {
        const h = (c * 7 + f * 13) % 6;
        ctx.fillStyle = COLORES_SPRINKLE[h];
        if ((c + f) % 2) ctx.fillRect(X - 2, Y - 1, 4, 2); else ctx.fillRect(X - 1, Y - 2, 2, 4);
      } else if (Math.floor(reloj * 4) % 2 || estado !== "juego") {
        // Batido de fresa (power)
        ctx.fillStyle = PAL.negro; ctx.fillRect(X - 6, Y - 7, 12, 14);
        ctx.fillStyle = PAL.rosa; ctx.fillRect(X - 5, Y - 3, 10, 9);
        ctx.fillStyle = PAL.blanco; ctx.fillRect(X - 5, Y - 6, 10, 3); ctx.fillRect(X - 3, Y - 1, 2, 2);
        ctx.fillStyle = PAL.rojo; ctx.fillRect(X + 1, Y - 10, 2, 5);
      }
    }
  }

  function dibujarFruta() {
    if (!fruta) return;
    if (fruta.t < 2.5 && Math.floor(reloj * 10) % 2) return;
    const X = px(FRUTA.x), Y = py(FRUTA.y) + Math.round(Math.sin(reloj * 4) * 1.5);
    if (fruta.tipo === "cereza") {
      ctx.fillStyle = PAL.negro; ctx.fillRect(X - 8, Y - 3, 16, 11);
      ctx.fillStyle = PAL.rojo; ctx.fillRect(X - 7, Y - 2, 6, 8); ctx.fillRect(X + 1, Y - 2, 6, 8);
      ctx.fillStyle = "#3fae48"; ctx.fillRect(X - 1, Y - 9, 2, 7); ctx.fillRect(X, Y - 10, 5, 2);
      ctx.fillStyle = PAL.blanco; ctx.fillRect(X - 6, Y - 1, 2, 2); ctx.fillRect(X + 2, Y - 1, 2, 2);
    } else {
      ctx.fillStyle = PAL.negro; ctx.fillRect(X - 7, Y - 6, 14, 14);
      ctx.fillStyle = PAL.rojo; ctx.fillRect(X - 6, Y - 4, 12, 8); ctx.fillRect(X - 4, Y + 4, 8, 3);
      ctx.fillStyle = "#3fae48"; ctx.fillRect(X - 5, Y - 7, 10, 3);
      ctx.fillStyle = PAL.oro; ctx.fillRect(X - 3, Y - 2, 1, 1); ctx.fillRect(X + 2, Y, 1, 1); ctx.fillRect(X - 1, Y + 3, 1, 1);
    }
  }

  function dibujarConsumible() {
    const c = consumible; if (!c) return;
    if (c.t < 3 && Math.floor(reloj * 10) % 2) return;
    const def = CONSUMIBLES[c.tipo], X = px(c.x), Y = py(c.y) + Math.round(Math.sin(reloj * 4) * 1.5);
    ctx.globalAlpha = 0.3 + Math.abs(Math.sin(reloj * 4)) * 0.3; ctx.fillStyle = def.color; ctx.fillRect(X - 9, Y - 9, 18, 18); ctx.globalAlpha = 1;
    ctx.fillStyle = PAL.negro; ctx.fillRect(X - 7, Y - 7, 14, 14);
    const f = (col, a, b, w, h) => { ctx.fillStyle = col; ctx.fillRect(X + a, Y + b, w, h); };
    if (c.tipo === "iman") { f(PAL.rojo, -5, -5, 3, 9); f(PAL.rojo, 2, -5, 3, 9); f(PAL.rojo, -5, -5, 10, 3); f(PAL.blanco, -5, 3, 3, 2); f(PAL.blanco, 2, 3, 3, 2); }
    if (c.tipo === "hielo") { f(PAL.cian, -1, -6, 2, 12); f(PAL.cian, -6, -1, 12, 2); f(PAL.blanco, -4, -4, 2, 2); f(PAL.blanco, 2, 2, 2, 2); f(PAL.blanco, 2, -4, 2, 2); f(PAL.blanco, -4, 2, 2, 2); }
    if (c.tipo === "escudo") { f(PAL.blanco, -5, 0, 10, 4); f(PAL.blanco, -3, -3, 6, 3); f(PAL.blanco, -1, -6, 2, 3); f(PAL.crema, -5, 4, 10, 1); }
    if (c.tipo === "turbo") { f(PAL.rosa, 0, -6, 3, 5); f(PAL.rosa, -3, -2, 7, 2); f(PAL.rosa, -3, 0, 3, 6); }
  }

  function dibujarJugador() {
    const X = px(jug.x), Y = py(jug.y);
    if (estado === "muriendo") {
      const k = Math.min(1, muerteT / 1.6);
      ctx.save(); ctx.translate(X, Y + 8); ctx.rotate(k * Math.PI * 4); ctx.scale(1 - k, 1 - k);
      ctx.drawImage(A.heroe, -Math.round(A.heroe.width / 2), -A.heroe.height + 6); ctx.restore();
      return;
    }
    if (escudo) { ctx.globalAlpha = 0.45 + Math.sin(reloj * 6) * 0.15; ctx.strokeStyle = PAL.blanco; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X, Y - 2, 15, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
    if (activo?.tipo === "iman") { ctx.globalAlpha = 0.15; ctx.fillStyle = PAL.rojo; ctx.beginPath(); ctx.arc(X, Y, 3.2 * T, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
    const moviendo = jug.dx || jug.dy;
    const bob = moviendo ? Math.round(Math.abs(Math.sin(jug.anim * 18)) * -2) : 0;
    const rot = (jug.dx ? jug.dx * 0.12 : 0) + (moviendo ? Math.sin(jug.anim * 18) * 0.08 : 0);
    ctx.save(); ctx.translate(X, Y + 9 + bob); ctx.rotate(rot); ctx.scale(1 / Math.sqrt(jug.est), jug.est);
    if (activo?.tipo === "turbo" && Math.floor(reloj * 20) % 2) ctx.globalAlpha = 0.8;
    ctx.drawImage(A.heroe, -Math.round(A.heroe.width / 2), -A.heroe.height); ctx.restore(); ctx.globalAlpha = 1;
    if (activo?.tipo === "turbo") { ctx.fillStyle = PAL.rosa; for (let i = 1; i <= 3; i++) ctx.fillRect(X - jug.dx * i * 6 - 1, Y - jug.dy * i * 6 + 2, 3, 3); }
  }

  function dibujarFantasma(g) {
    const X = px(g.x), Y = py(g.y);
    if (g.modo === "ojos") {
      // solo quedan los ojos del cursor volviendo a casa
      for (const s of [-1, 1]) {
        ctx.fillStyle = PAL.blanco; ctx.fillRect(X + s * 4 - 3, Y - 5, 6, 7);
        ctx.fillStyle = PAL.bsod; ctx.fillRect(X + s * 4 - 1 + g.dx * 2, Y - 3 + g.dy * 2, 3, 3);
      }
      if (Math.random() < 0.3) { ctx.fillStyle = g.color; ctx.fillRect(X - 8 + Math.random() * 16, Y - 8 + Math.random() * 16, 3, 2); }
      return;
    }
    const temb = g.congelado > 0 ? 0 : (Math.random() < 0.15 ? Math.round((Math.random() - 0.5) * 4) : 0);
    const bob = Math.round(Math.sin(g.t * 10) * 1);
    let img = A.clones[g.i];
    if (g.miedo) img = miedoT < 2 && Math.floor(reloj * 8) % 2 ? A.blanco : A.bsod;
    ctx.drawImage(img, Math.round(X - img.width / 2 + temb), Math.round(Y + 9 - img.height + bob));
    if (g.miedo) { ctx.font = `6px ${FUENTE}`; ctx.textAlign = "center"; ctx.fillStyle = PAL.blanco; ctx.fillText(":(", X + temb, Y - 6 + bob); }
    if (g.congelado > 0) { ctx.globalAlpha = 0.45; ctx.fillStyle = PAL.cian; ctx.fillRect(X - 10, Y - 14, 20, 24); ctx.globalAlpha = 1; ctx.fillStyle = PAL.blanco; ctx.fillRect(X - 8, Y - 12, 3, 3); }
    if (!g.miedo && !g.congelado && Math.random() < 0.2) {
      ctx.globalAlpha = 0.6; ctx.fillStyle = g.color; ctx.fillRect(X - 10 + Math.random() * 20, Y - 12 + Math.random() * 20, 4 + Math.random() * 6, 2); ctx.globalAlpha = 1;
    }
  }

  function txt(t, x, y, tam, color = PAL.crema, alinear = "left") {
    ctx.font = `${tam}px ${FUENTE}`; ctx.textAlign = alinear; ctx.textBaseline = "middle";
    ctx.fillStyle = PAL.negro; ctx.fillText(t, x + 1, y + 1); ctx.fillStyle = color; ctx.fillText(t, x, y);
  }
  function dibujarPaneles() {
    // Izquierda: marcador
    txt("DÍA 2", 10, 22, 8, PAL.rosa);
    txt("PUNTOS", 10, 56, 7, PAL.grisC); txt(String(puntos ?? 0).padStart(6, "0"), 10, 70, 9, PAL.crema);
    txt("RÉCORD", 10, 96, 7, PAL.grisC); txt(String(record).padStart(6, "0"), 10, 110, 9, PAL.oro);
    txt("TOPPINGS", 10, 136, 7, PAL.grisC); txt(`${quedan ?? 0}`, 10, 150, 9, PAL.crema);
    txt(D().nombre, 10, 176, 7, PAL.grisC);
    // leyenda de clones
    CLONES.forEach((c, i) => { ctx.fillStyle = c.color; ctx.fillRect(10, 206 + i * 16, 6, 6); txt(c.nombre, 20, 209 + i * 16, 6, c.color); });
    // Derecha: vidas, potenciador y bonus
    const RX = OX + COL * T + 10;
    txt("VIDAS", RX, 56, 7, PAL.grisC);
    for (let i = 0; i < Math.min(6, vidas - (estado === "muriendo" ? 0 : 0)); i++) ctx.drawImage(A.heroe, RX + i * 16 - (i > 2 ? 48 : 0), 64 + (i > 2 ? 28 : 0), 14, 17);
    txt("POTENCIADOR", RX, 136, 6, PAL.grisC);
    if (activo || escudo) {
      let y = 150;
      if (activo) {
        const def = CONSUMIBLES[activo.tipo];
        txt(def.nombre, RX, y, 6, def.color);
        ctx.fillStyle = PAL.gris; ctx.fillRect(RX, y + 8, 80, 5); ctx.fillStyle = def.color; ctx.fillRect(RX, y + 8, Math.round(80 * Math.max(0, activo.t / def.dur)), 5);
        y += 26;
      }
      if (escudo) txt("ESCUDO ACTIVO", RX, y, 6, PAL.blanco);
    } else txt("—", RX, 150, 7, PAL.grisC);
    txt("BONUS", RX, 210, 7, PAL.grisC);
    (frutasComidas || []).forEach((f, i) => { ctx.fillStyle = f === "cereza" ? PAL.rojo : "#ff3b3b"; ctx.fillRect(RX + i * 16, 222, 10, 10); ctx.fillStyle = "#3fae48"; ctx.fillRect(RX + i * 16 + 2, 219, 6, 3); });
    if (miedoT > 0 && estado === "juego") txt("¡A POR ELLOS!", RX, 260, 6, PAL.bsod);
  }

  function dibujarBanner() {
    if (!banner) return;
    const k = banner.t / banner.dur;
    const esc = k < 0.15 ? 0.4 + (k / 0.15) * 0.7 : k > 0.85 ? 1.1 - (k - 0.85) / 0.15 * 0.2 : 1.1 - (k - 0.15) * 0.1;
    ctx.save(); ctx.translate(W / 2, py(10) + 2); ctx.scale(esc, esc); ctx.globalAlpha = k > 0.85 ? 1 - (k - 0.85) / 0.15 : 1;
    const tam = banner.texto.length > 12 ? 16 : 22;
    ctx.font = `${tam}px ${FUENTE}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = PAL.negro; for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [3, 3]]) ctx.fillText(banner.texto, dx, dy);
    ctx.fillStyle = banner.color; ctx.fillText(banner.texto, 0, 0);
    if (banner.sub) { ctx.font = `9px ${FUENTE}`; ctx.fillStyle = PAL.negro; ctx.fillText(banner.sub, 1, 25); ctx.fillStyle = PAL.blanco; ctx.fillText(banner.sub, 0, 24); }
    ctx.restore();
  }

  // Post-proceso CRT (igual que el día 1)
  const granos = [];
  function prepararPost() {
    for (let n = 0; n < 4; n++) {
      const c = document.createElement("canvas"); c.width = W / 2; c.height = H / 2;
      const x = c.getContext("2d"), d = x.createImageData(c.width, c.height);
      for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() < 0.5 ? 0 : 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = Math.random() < 0.88 ? 0 : Math.random() * 30; }
      x.putImageData(d, 0, 0); granos.push(c);
    }
    const lin = document.createElement("canvas"); lin.width = W; lin.height = H; const lx = lin.getContext("2d");
    lx.fillStyle = "rgba(0,0,0,.16)"; for (let y = 0; y < H; y += 2) lx.fillRect(0, y, W, 1);
    const g = lx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.62);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.6)"); lx.fillStyle = g; lx.fillRect(0, 0, W, H);
    A.post = lin;
  }

  function dibujar() {
    ctx.fillStyle = PAL.negro; ctx.fillRect(0, 0, W, H);
    ctx.save();
    if (temblor > 0) ctx.translate(Math.round((Math.random() - 0.5) * temblor), Math.round((Math.random() - 0.5) * temblor));
    // Paredes (parpadean al limpiar el laberinto)
    const flash = estado === "completado" && Math.floor(completadoT * 6) % 2;
    ctx.drawImage(flash ? A.laberintoBlanco : A.laberinto, 0, 0);
    if (toppings) {
      dibujarToppings(); dibujarFruta(); dibujarConsumible();
      // Personajes recortados al área del laberinto (para el túnel)
      ctx.save(); ctx.beginPath(); ctx.rect(OX, OY - 14, COL * T, FIL * T + 14); ctx.clip();
      if (estado !== "muriendo" || muerteT < 0.5) fantasmas.forEach(dibujarFantasma);
      dibujarJugador();
      parts.forEach(q => { ctx.globalAlpha = Math.min(1, q.t * 3); ctx.fillStyle = q.c; ctx.fillRect(Math.round(px(q.x)), Math.round(py(q.y)), q.s, q.s); });
      ctx.globalAlpha = 1;
      ctx.restore();
      textos.forEach(q => { ctx.globalAlpha = Math.min(1, q.vida * 2); txt(q.t, px(q.x), py(q.y), 7, q.c, "center"); });
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    dibujarPaneles();
    dibujarBanner();
    ctx.drawImage(granos[Math.floor(reloj * 24) % granos.length], 0, 0, W, H);
    ctx.drawImage(A.post, 0, 0);
  }

  let previo = performance.now();
  function bucle(ahora) {
    const dt = Math.min(1 / 30, (ahora - previo) / 1000); previo = ahora;
    if (pausaComer > 0 && estado === "juego") { pausaComer -= dt; reloj += dt; textos.forEach(q => q.vida -= dt * 0.2); }
    else if (estado === "titulo") { reloj += dt; demoTitulo(dt); }
    else actualizar(dt);
    dibujar();
    requestAnimationFrame(bucle);
  }

  // En el título los personajes se mueven solos de fondo
  function demoTitulo(dt) {
    if (!toppings) { toppings = MAPA.map(f => f.split("").map(ch => ch === "." ? 1 : ch === "o" ? 2 : 0)); quedan = total = 0; puntos = 0; vidas = D().vidas; frutasComidas = []; parts = []; textos = []; colocar(); fantasmas.forEach(g => { g.modo = "normal"; g.x = 13; g.y = 5; }); }
    pedido = DIRS[Math.floor(reloj / 2) % 4];
    mover(jug, 5 * dt, e => { const cx = Math.round(e.x), cy = Math.round(e.y); const ops = DIRS.filter(d => libreJug(cx + d.dx, cy + d.dy) && !(d.dx === -e.dx && d.dy === -e.dy)); const d = ops[Math.floor(Math.random() * ops.length)] || DIRS[0]; e.dx = d.dx; e.dy = d.dy; });
    fantasmas.forEach(g => { g.t += dt; mover(g, 4 * dt, decidirFantasma); });
  }

  /* ---------------- Arranque ---------------- */
  Promise.all([cargar("sprites/heroe-26.png"), cargar("sprites/alter-ego-24.png")]).then(([h, m]) => {
    A.heroe = h;
    A.clones = CLONES.map(c => tintar(m, c.color, 0.5));
    A.bsod = tintar(m, PAL.bsod, 0.85); A.blanco = tintar(m, PAL.blanco, 0.9);
    A.laberinto = prepararLaberinto(); A.laberintoBlanco = prepararLaberinto(PAL.blanco, "#2a2433");
    prepararPost();
    estado = "titulo"; mostrarMenu("titulo");
    requestAnimationFrame(bucle);
  });
  window.__dia2 = { completar: () => { quedan = 0; completar(); }, get estado() { return estado; }, get jug() { return jug; }, get quedan() { return quedan; }, get fantasmas() { return fantasmas; },
    vaciar(n = 3) { let k = 0; for (let f = 0; f < FIL; f++) for (let c = 0; c < COL; c++) if (toppings[f][c] && k++ >= n) { toppings[f][c] = 0; quedan--; } } };
})();
