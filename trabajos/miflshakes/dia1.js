/* =============================================================
   SHAKE WEEK · DÍA 1 — «LA FÁBRICA GLITCH»
   Run 'n gun arcade inspirado en los niveles de corre y dispara
   de los años 30: tramo de plataformas + jefe final con 3 fases.
   Héroe: Miflshakes · Villano: Alter Ego (versión glitch)
   ============================================================= */
(() => {
  "use strict";
  const W = 640, H = 360, SUELO = 300, AX = 2800, AW = 640;
  const cv = document.getElementById("juego");
  const ctx = cv.getContext("2d");
  cv.width = W; cv.height = H; ctx.imageSmoothingEnabled = false;

  const PAL = {
    negro: "#0b0a0f", noche: "#160d1c", granate: "#4a0d18", rojo: "#e3222e", rojoOsc: "#9c1420",
    crema: "#f3e6cf", blanco: "#fffaf0", rosa: "#ff5fa8", cian: "#2fe6ff", magenta: "#ff2fd0",
    verde: "#3dff7a", azul: "#3d5cff", oro: "#ffcf3a", gris: "#2a2433", grisC: "#5b5068"
  };
  const FUENTE = '"Press Start 2P", ui-monospace, monospace';

  /* ---------------- Recursos ---------------- */
  function cargar(src) { return new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(i); i.src = src; }); }
  function tintar(img, color) {
    const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
    const x = c.getContext("2d"); x.drawImage(img, 0, 0);
    x.globalCompositeOperation = "source-in"; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
    return c;
  }
  const A = {};

  /* ---------------- Entrada ---------------- */
  const K = { izq: 0, der: 0, arr: 0, salto: 0, disparo: 0, dash: 0, ex: 0 };
  let P = {};
  const MAPA = {
    ArrowLeft: "izq", KeyA: "izq", ArrowRight: "der", KeyD: "der", ArrowUp: "arr", KeyW: "arr",
    KeyZ: "salto", Space: "salto", KeyK: "salto", KeyX: "disparo", KeyJ: "disparo",
    KeyC: "dash", ShiftLeft: "dash", ShiftRight: "dash", KeyL: "dash", KeyV: "ex", KeyE: "ex", KeyI: "ex"
  };
  addEventListener("keydown", e => {
    const k = MAPA[e.code];
    if (k) { e.preventDefault(); if (!K[k]) P[k] = 1; K[k] = 1; }
    if (e.code === "Enter") { e.preventDefault(); accionPrincipal(); }
    if (e.code === "Escape" || e.code === "KeyP") pausar();
    if (e.code === "KeyM") Sonido.alternar();
    if (e.code === "KeyR" && (estado === "muerto" || estado === "resultados" || estado === "pausa")) reiniciar(estado === "muerto" ? (enJefe ? "jefe" : puntoControl ? "control" : "inicio") : "inicio");
  });
  addEventListener("keyup", e => { const k = MAPA[e.code]; if (k) K[k] = 0; });
  addEventListener("blur", () => { for (const k in K) K[k] = 0; if (estado === "juego") pausar(); });
  const pul = k => { if (P[k]) { P[k] = 0; return true; } return false; };

  document.querySelectorAll("[data-k]").forEach(b => {
    const k = b.dataset.k, alterna = b.hasAttribute("data-alterna");
    const on = e => {
      e.preventDefault(); Sonido.iniciar();
      if (alterna) { K[k] = K[k] ? 0 : 1; b.classList.toggle("on", !!K[k]); return; }
      if (!K[k]) P[k] = 1; K[k] = 1; b.classList.add("on");
    };
    const off = e => { if (alterna) return; e.preventDefault(); K[k] = 0; b.classList.remove("on"); };
    b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off);
    b.addEventListener("pointerleave", off); b.addEventListener("pointercancel", off);
  });

  /* ---------------- Sonido (chiptune con WebAudio) ---------------- */
  const Sonido = {
    ac: null, master: null, on: true, musica: null, paso: 0, prox: 0, tempo: 150, jefe: false,
    iniciar() {
      if (this.ac) { if (this.ac.state === "suspended") this.ac.resume(); return; }
      try {
        this.ac = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.ac.createGain(); this.master.gain.value = this.on ? 0.55 : 0; this.master.connect(this.ac.destination);
      } catch (e) { this.ac = null; }
    },
    alternar() {
      this.on = !this.on; if (this.master) this.master.gain.value = this.on ? 0.55 : 0;
      const b = document.getElementById("btnSonido"); if (b) b.textContent = this.on ? "🔊" : "🔇";
    },
    tono(f1, f2, dur, tipo = "square", vol = 0.12, ret = 0) {
      if (!this.ac) return; const t = this.ac.currentTime + ret;
      const o = this.ac.createOscillator(), g = this.ac.createGain();
      o.type = tipo; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
    },
    ruido(dur, vol = 0.2, corte = 1500, ret = 0) {
      if (!this.ac) return; const t = this.ac.currentTime + ret;
      const n = Math.floor(this.ac.sampleRate * dur), buf = this.ac.createBuffer(1, n, this.ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      const s = this.ac.createBufferSource(), f = this.ac.createBiquadFilter(), g = this.ac.createGain();
      s.buffer = buf; f.type = "lowpass"; f.frequency.value = corte;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(this.master); s.start(t);
    },
    nota(m, t, dur, tipo, vol) {
      const o = this.ac.createOscillator(), g = this.ac.createGain();
      o.type = tipo; o.frequency.value = 440 * Math.pow(2, (m - 69) / 12);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
    },
    // Swing de big band en 8 bits: F · D7 · Gm · C7
    BAJO: [[41, 48, 41, 48], [38, 45, 38, 45], [43, 50, 43, 50], [36, 43, 36, 43]],
    ACORDES: [[65, 69, 72], [66, 69, 72], [67, 70, 74], [64, 67, 70]],
    MELODIA: [72, 0, 69, 72, 74, 72, 69, 65, 66, 69, 72, 74, 72, 0, 69, 0, 70, 74, 77, 74, 72, 70, 67, 0, 64, 67, 70, 72, 76, 0, 72, 0],
    MELODIA_JEFE: [77, 0, 76, 74, 72, 0, 69, 72, 74, 0, 72, 69, 66, 69, 72, 0, 79, 77, 74, 0, 70, 74, 77, 79, 76, 0, 72, 70, 67, 64, 67, 0],
    empezarMusica(jefe = false) {
      if (!this.ac) return; this.pararMusica();
      this.jefe = jefe; this.tempo = jefe ? 178 : 152; this.paso = 0; this.prox = this.ac.currentTime + 0.08;
      this.musica = setInterval(() => this.programar(), 25);
    },
    pararMusica() { clearInterval(this.musica); this.musica = null; },
    programar() {
      const ac = this.ac, negra = 60 / this.tempo;
      while (this.prox < ac.currentTime + 0.12) {
        const i = this.paso % 32, comp = Math.floor(i / 8), corchea = i % 8;
        // swing: corcheas largas-cortas
        const dur = (corchea % 2 === 0 ? 2 / 3 : 1 / 3) * negra;
        const t = this.prox, tr = this.jefe ? -2 : 0;
        if (corchea % 2 === 0) {
          const pulso = corchea / 2;
          this.nota(this.BAJO[comp][pulso] + tr, t, negra * 0.9, "triangle", 0.22);
          if (pulso % 2 === 1) this.ACORDES[comp].forEach(n => this.nota(n + tr - 12, t, 0.09, "square", 0.025));
        }
        const mel = (this.jefe ? this.MELODIA_JEFE : this.MELODIA)[i];
        if (mel) this.nota(mel + tr, t, Math.min(0.16, dur * 0.9), "square", 0.045);
        if (this.jefe || corchea % 2 === 1) this.ruido(0.03, 0.03, 7000, t - ac.currentTime);
        this.prox += dur; this.paso++;
      }
    }
  };
  const sfx = {
    disparo: () => Sonido.tono(1000, 520, 0.045, "square", 0.025),
    salto: () => Sonido.tono(260, 640, 0.12, "square", 0.07),
    dash: () => Sonido.ruido(0.14, 0.12, 3500),
    parry: () => { Sonido.tono(1320, 1320, 0.07, "triangle", 0.25); Sonido.tono(1980, 1980, 0.14, "triangle", 0.2, 0.06); },
    impacto: () => Sonido.tono(240, 120, 0.035, "square", 0.04),
    golpe: () => { Sonido.ruido(0.25, 0.3, 900); Sonido.tono(220, 60, 0.3, "sawtooth", 0.15); },
    moneda: () => { Sonido.tono(988, 988, 0.07, "square", 0.08); Sonido.tono(1319, 1319, 0.16, "square", 0.08, 0.07); },
    boom: () => { Sonido.ruido(0.55, 0.35, 500); Sonido.tono(130, 35, 0.55, "sine", 0.4); },
    ex: () => { Sonido.tono(180, 1400, 0.28, "sawtooth", 0.14); Sonido.ruido(0.2, 0.15, 2500); },
    muerte: () => { Sonido.tono(500, 60, 0.9, "square", 0.12); },
    glitch: () => { for (let i = 0; i < 5; i++) Sonido.tono(200 + Math.random() * 1800, 100 + Math.random() * 900, 0.06, "sawtooth", 0.05, i * 0.05); },
    aviso: () => Sonido.tono(880, 880, 0.06, "square", 0.05),
    ko: () => { Sonido.ruido(1, 0.4, 700); [523, 659, 784, 1047].forEach((f, i) => Sonido.tono(f, f, 0.25, "square", 0.1, 0.3 + i * 0.12)); }
  };

  /* ---------------- Nivel ---------------- */
  const SUELOS = [[0, 760], [830, 1460], [1540, 2200], [2270, AX + AW]].map(([a, b]) => ({ x: a, w: b - a }));
  const PLATS = [[430, 236, 90], [600, 196, 80], [1000, 228, 110], [1180, 180, 90], [1650, 230, 100], [1820, 172, 100], [1990, 230, 90], [2420, 220, 120]]
    .map(([x, y, w]) => ({ x, y, w }));
  const sueloEn = x => SUELOS.some(s => x > s.x - 4 && x < s.x + s.w + 4);
  // Carteles de ayuda (tutorial dentro del propio nivel)
  const CARTELES = [[170, "X  =  DISPARAR", "↑ = APUNTAR ARRIBA"], [560, "SALTA OTRA VEZ", "SOBRE LO ROSA = PARRY"], [1380, "PARRY + SÚPER", "V = DISPARO SÚPER"]];

  // Elementos de fondo (decorado)
  const DECO = [];
  for (let i = 0; i < 18; i++) DECO.push({ tipo: i % 3 === 0 ? "tanque" : i % 3 === 1 ? "chimenea" : "nave", x: i * 230 + (i * 71) % 90, h: 90 + (i * 47) % 80 });

  /* ---------------- Estado de la partida ---------------- */
  let estado = "cargando", enJefe = false, reloj = 0, tiempoJuego = 0, hitstop = 0, temblor = 0, flashPantalla = 0;
  let camX = 0, p, balas, enemigos, proys, rosquillas, monedas, parts, textos, disparadores, jefe, peligros, banner, menuSel = 0;
  let pausaPrevia = null, resultado = null;

  /* ---------------- Dificultad y amuletos ---------------- */
  // FÁCIL: más vida, ataques más lentos y avisos más largos. Es la opción por defecto.
  const DIFS = {
    facil: { nombre: "FÁCIL", hp: 4, jefeHp: 200, vel: 0.78, pausa: 1.4, aviso: 1.4, drop: 0.3, enemVel: 0.75 },
    normal: { nombre: "NORMAL", hp: 3, jefeHp: 260, vel: 0.95, pausa: 1.05, aviso: 1.1, drop: 0.15, enemVel: 0.9 }
  };
  const AMULETOS = {
    corazon: { nombre: "Corazón extra", desc: "Empiezas con +1 de vida", icono: "♥" },
    humo: { nombre: "Dash de humo", desc: "Eres invencible mientras haces dash", icono: "≈" },
    parry: { nombre: "Parry automático", desc: "Tocar algo rosa en el aire hace parry solo", icono: "✦" }
  };
  let dif = "facil", amuleto = "corazon";
  try { const g = JSON.parse(localStorage.getItem("shakeweek-dia1") || "{}"); if (DIFS[g.dif]) dif = g.dif; if (AMULETOS[g.amuleto]) amuleto = g.amuleto; } catch (e) {}
  const D = () => DIFS[dif];
  const hpMax = () => D().hp + (amuleto === "corazon" ? 1 : 0) + 2;

  /* ---------------- Consumibles ---------------- */
  // Se recogen tocándolos. Algunos están en el nivel, otros caen de los enemigos y del jefe.
  const CONSUMIBLES = {
    vida:    { nombre: "+1 VIDA",          color: "#e3222e", dur: 0 },
    escudo:  { nombre: "ESCUDO DE NATA",   color: "#fffaf0", dur: 0 },
    triple:  { nombre: "TRIPLE PAJITA",    color: "#ffcf3a", dur: 14 },
    tele:    { nombre: "PAJITA TELEDIRIGIDA", color: "#2fe6ff", dur: 14 },
    turbo:   { nombre: "TURBO BATIDO",     color: "#ff5fa8", dur: 12 },
    super:   { nombre: "+1 CARTA SÚPER",   color: "#ff2fd0", dur: 0 }
  };
  let consumibles = [], puntoControl = null, recogidos = 0;
  const CONTROL_X = 1580;

  function nuevoJugador(x = 80) {
    return { x, y: SUELO, vx: 0, vy: 0, suelo: true, mira: 1, hp: D().hp + (amuleto === "corazon" ? 1 : 0), inv: 0, dash: 0, dashCd: 0, dashAire: true,
      parryVent: 0, parryUsado: false, cartas: 0, cad: 0, anim: 0, est: 1, ultimoSeguro: x, parries: 0, ex: 0, flash: 0,
      arma: null, armaT: 0, escudo: 0 };
  }

  function soltarConsumible(x, y, tipo = null, caer = true) {
    const pool = ["vida", "vida", "escudo", "triple", "tele", "turbo", "super"];
    if (!tipo) tipo = p.hp < 2 ? "vida" : pool[Math.floor(Math.random() * pool.length)];
    consumibles.push({ tipo, x, y, vy: caer ? -220 : 0, cae: caer, t: 0, vida: caer ? 12 : Infinity });
  }

  function reiniciar(modo = false) {
    if (modo === true) modo = "jefe"; if (modo === false) modo = "inicio";
    const desdeJefe = modo === "jefe", desdeControl = modo === "control" && puntoControl;
    if (modo === "inicio") puntoControl = null;
    p = nuevoJugador(desdeJefe ? AX + 120 : desdeControl ? CONTROL_X : 80);
    balas = []; enemigos = []; proys = []; parts = []; textos = []; peligros = []; consumibles = []; recogidos = 0;
    rosquillas = [[795, 214], [1500, 200], [2235, 214], [1880, 104]].map(([x, y]) => ({ x, y, cd: 0 }));
    monedas = [[640, 150], [1500, 116], [2480, 166]].map(([x, y], i) => ({ x, y, ok: desdeJefe || (desdeControl && puntoControl.monedas[i]) }));
    // Consumibles colocados en el nivel
    if (!desdeJefe) [["turbo", 330, SUELO - 22], ["vida", 1055, 200], ["escudo", 1720, SUELO - 22], ["escudo", 1250, SUELO - 22], ["triple", 2000, 200], ["vida", 2320, SUELO - 22], ["tele", 2720, SUELO - 22]]
      .filter(([, x]) => !desdeControl || x > CONTROL_X).forEach(([t, x, y]) => soltarConsumible(x, y, t, false));
    disparadores = [
      { g: 120, t: "mini", x: 700 }, { g: 300, t: "cereza", dy: 0 }, { g: 430, t: "mini", x: 900 },
      { g: 600, t: "cereza", dy: 0 }, { g: 640, t: "cereza", dy: 70 },
      { g: 950, t: "mini", x: 1400 }, { g: 1010, t: "mini", x: 1440 }, { g: 1150, t: "cereza", dy: 30 }, { g: 1310, t: "cereza", dy: 0 },
      { g: 1560, t: "mini", x: 2060 }, { g: 1660, t: "cereza", dy: 40 }, { g: 1760, t: "mini", x: 2150 },
      { g: 1900, t: "cereza", dy: 0 }, { g: 1960, t: "cereza", dy: 60 },
      { g: 2280, t: "mini", x: 2700 }, { g: 2360, t: "mini", x: 2740 }, { g: 2460, t: "cereza", dy: 20 }, { g: 2560, t: "cereza", dy: 70 }
    ].filter(d => !desdeJefe && (!desdeControl || d.g > CONTROL_X));
    jefe = null; enJefe = false;
    camX = desdeJefe ? AX : desdeControl ? CONTROL_X - 230 : 0;
    tiempoJuego = desdeJefe ? (resultado?.tiempoJefe || 0) : desdeControl ? puntoControl.tiempo : 0;
    hitstop = 0; temblor = 0; reloj = 0;
    estado = "juego"; ocultarMenu();
    if (desdeJefe) empezarJefe();
    else {
      mostrarBanner(desdeControl ? "¡SEGUIMOS!" : "¡PREPARADOS!", "", 1.1, () => mostrarBanner("¡A POR ELLOS!", "", 1.0));
      Sonido.empezarMusica(false);
    }
  }

  function mostrarBanner(texto, sub = "", dur = 1.4, alAcabar = null, color = PAL.crema) { banner = { texto, sub, t: 0, dur, alAcabar, color }; }

  /* ---------------- Utilidades ---------------- */
  const choca = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const cajaJug = () => ({ x: p.x - 10, y: p.y - 48, w: 20, h: 46 }); // caja de daño algo menor que el dibujo (más justo)
  function particulas(x, y, colores, n = 12, vel = 180, grav = 500) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = vel * (0.3 + Math.random() * 0.9);
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, t: 0.4 + Math.random() * 0.5, c: colores[i % colores.length], s: 2 + Math.floor(Math.random() * 3), grav });
    }
  }
  function texto(t, x, y, tam, color = PAL.crema, alinear = "center", borde = PAL.negro) {
    ctx.font = `${tam}px ${FUENTE}`; ctx.textAlign = alinear; ctx.textBaseline = "middle";
    ctx.fillStyle = borde;
    for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [2, 2], [-2, 2], [2, -2], [-2, -2], [3, 3]]) ctx.fillText(t, Math.round(x + dx), Math.round(y + dy));
    ctx.fillStyle = color; ctx.fillText(t, Math.round(x), Math.round(y));
  }
  function sprite(img, x, y, girar = false, estirar = 1, rot = 0, alfa = 1) {
    // (x, y) = centro de los pies
    if (!img) return;
    const w = img.width, h = img.height;
    ctx.save(); ctx.globalAlpha = alfa; ctx.translate(Math.round(x), Math.round(y)); if (rot) ctx.rotate(rot);
    ctx.scale(1 / Math.sqrt(estirar), estirar); // de frente: no se voltea para que el logo se lea bien
    ctx.drawImage(img, -Math.round(w / 2), -h); ctx.restore();
  }
  // Alter Ego con efecto glitch: capas cian/magenta desplazadas y franjas rotas
  function spriteGlitch(img, x, y, girar, intensidad, alfa = 1, est = 1, blanco = null) {
    const w = img.width, h = img.height;
    if (intensidad > 0) {
      const off = 2 + Math.floor(intensidad * 4 + Math.random() * 2);
      sprite(A[img === A.jefe ? "jefeCian" : "miniCian"], x - off, y, girar, est, 0, alfa * 0.55);
      sprite(A[img === A.jefe ? "jefeMag" : "miniMag"], x + off, y, girar, est, 0, alfa * 0.55);
    }
    sprite(blanco || img, x, y, girar, est, 0, alfa);
    if (Math.random() < intensidad * 0.6) {
      for (let i = 0; i < 2 + intensidad * 3; i++) {
        const sy = Math.floor(Math.random() * h), sh = 2 + Math.floor(Math.random() * 8), dx = (Math.random() - 0.5) * 30 * intensidad;
        ctx.save(); ctx.globalAlpha = alfa; ctx.translate(Math.round(x + dx), Math.round(y));
        ctx.drawImage(img, 0, sy, w, sh, -Math.round(w / 2), -h + sy, w, sh); ctx.restore();
      }
    }
  }

  /* ---------------- Jugador ---------------- */
  function actualizarJugador(dt) {
    p.inv -= dt; p.dashCd -= dt; p.cad -= dt; p.parryVent -= dt; p.flash -= dt;
    if (p.arma) { p.armaT -= dt; if (p.armaT <= 0) { p.arma = null; textos.push({ t: "SE ACABÓ EL POTENCIADOR", x: p.x, y: p.y - 90, vida: 1, c: PAL.grisC }); } }
    const cayendoAntes = p.y;

    // Dash
    if (pul("dash") && p.dashCd <= 0 && (p.suelo || p.dashAire)) {
      p.dash = 0.2; p.dashCd = 0.45; if (!p.suelo) p.dashAire = false; p.vy = 0; sfx.dash();
      particulas(p.x - p.mira * 10, p.y - 24, [PAL.blanco, PAL.rojo], 8, 90, 0);
    }
    if (p.dash > 0) {
      p.dash -= dt; p.vx = p.mira * 380; p.vy = 0;
      if (Math.random() < 0.6) parts.push({ x: p.x, y: p.y - 30 + (Math.random() - 0.5) * 30, vx: -p.mira * 40, vy: 0, t: 0.25, c: PAL.rojo, s: 3, grav: 0 });
    } else {
      const v = 165;
      if (K.izq && !K.der) { p.vx = -v; p.mira = -1; } else if (K.der && !K.izq) { p.vx = v; p.mira = 1; } else p.vx = 0;
      // Salto / parry
      if (pul("salto")) {
        if (p.suelo) { p.vy = -470; p.suelo = false; p.est = 1.25; sfx.salto(); }
        else if (!p.parryUsado) { p.parryVent = 0.2; p.parryUsado = true; }
      }
      if (!K.salto && p.vy < -200) p.vy = -200;
      p.vy = Math.min(p.vy + 1400 * dt, 900);
    }

    // Movimiento con colisiones
    p.x += p.vx * dt;
    if (p.empuje) { p.x += p.empuje * dt; p.empuje *= Math.pow(0.02, dt); if (Math.abs(p.empuje) < 10) p.empuje = 0; }
    if (enJefe) p.x = Math.max(AX + 16, Math.min(AX + AW - 16, p.x)); else p.x = Math.max(camX + 14, Math.min(AX + AW - 16, p.x));
    const antes = p.y; p.y += p.vy * dt;
    const estabaSuelo = p.suelo; p.suelo = false;
    if (p.vy >= 0) {
      if (sueloEn(p.x) && antes <= SUELO + 1 && p.y >= SUELO) { p.y = SUELO; p.vy = 0; p.suelo = true; }
      for (const s of PLATS) if (!enJefe && p.x > s.x - 6 && p.x < s.x + s.w + 6 && antes <= s.y + 1 && p.y >= s.y) { p.y = s.y; p.vy = 0; p.suelo = true; }
    }
    if (p.suelo) { p.dashAire = true; p.parryUsado = false; if (!estabaSuelo) { p.est = 0.8; particulas(p.x, p.y, [PAL.crema], 4, 50, 0); } if (sueloEn(p.x) && p.y === SUELO) p.ultimoSeguro = p.x; }
    p.est += (1 - p.est) * Math.min(1, dt * 12);
    p.anim += dt * (p.vx ? 1 : 0.3);

    // Caída a un foso: ya no quita vida, solo te devuelve a la orilla segura
    if (p.y > H + 40) {
      p.x = p.ultimoSeguro - p.mira * 30; p.y = SUELO - 120; p.vy = -200; p.vx = 0; p.inv = 1.2;
      sfx.salto(); textos.push({ t: "¡UPS!", x: p.x, y: SUELO - 140, vida: 0.9, c: PAL.rosa });
    }

    // Disparo (cambia según el potenciador activo)
    if (K.disparo && p.cad <= 0 && p.dash <= 0) {
      let dx = p.mira, dy = 0;
      if (K.arr) { if (K.izq || K.der) { dx = p.mira * 0.707; dy = -0.707; } else { dx = 0; dy = -1; } }
      const ox = dx === 0 ? p.x + p.mira * 4 : p.x + p.mira * 24, oy = dy === -1 ? p.y - 80 : dy ? p.y - 60 : p.y - 36;
      const base = Math.atan2(dy, dx), vel = p.arma === "tele" ? 430 : 560;
      const angulos = p.arma === "triple" ? [-0.2, 0, 0.2] : [0];
      for (const da of angulos) {
        balas.push({ x: ox, y: oy + (Math.random() * 4 - 2), vx: Math.cos(base + da) * vel, vy: Math.sin(base + da) * vel,
          dmg: p.arma === "triple" ? 0.75 : 1, vida: p.arma === "tele" ? 1.4 : 0.9, ex: false, tele: p.arma === "tele", color: p.arma });
      }
      p.cad = p.arma === "turbo" ? 0.06 : 0.1; sfx.disparo();
    }
    // EX (super disparo)
    if (pul("ex") && p.cartas >= 1 && p.dash <= 0) {
      p.cartas -= 1; p.ex++;
      let dx = p.mira, dy = 0; if (K.arr) { if (K.izq || K.der) { dx = p.mira * 0.707; dy = -0.707; } else { dx = 0; dy = -1; } }
      balas.push({ x: p.x + dx * 26, y: p.y - 40 + dy * 30, vx: dx * 400, vy: dy * 400, dmg: 9, vida: 1.6, ex: true, golpeados: new Set() });
      p.vx -= p.mira * 60; temblor = Math.max(temblor, 5); flashPantalla = 0.08; sfx.ex();
    }

    // Parry: si saltas otra vez en el aire tocando algo ROSA, rebotas y ganas una carta
    const autoParry = amuleto === "parry" && !p.suelo;
    if (p.parryVent > 0 || autoParry) {
      const c = cajaJug(); c.x -= 12; c.y -= 14; c.w += 24; c.h += 28;
      let objetivo = null;
      for (const r of rosquillas) if (r.cd <= 0 && choca(c, { x: r.x - 12, y: r.y - 12, w: 24, h: 24 })) objetivo = r;
      for (const pr of proys) if (pr.rosa && !pr.fuera && choca(c, { x: pr.x - pr.r, y: pr.y - pr.r, w: pr.r * 2, h: pr.r * 2 })) objetivo = pr;
      if (objetivo) {
        if (objetivo.cd !== undefined) objetivo.cd = 1.2; else objetivo.fuera = true;
        p.vy = -430; p.parryVent = 0; p.parryUsado = false; p.dashAire = true; p.cartas = Math.min(5, p.cartas + 1); p.parries++;
        hitstop = 0.11; flashPantalla = 0.06; sfx.parry();
        particulas(objetivo.x, objetivo.y, [PAL.rosa, PAL.blanco, PAL.oro], 14, 200, 200);
        textos.push({ t: "¡PARRY!", x: p.x, y: p.y - 92, vida: 0.8, c: PAL.rosa });
      }
    }

    // Monedas
    for (const m of monedas) if (!m.ok && Math.abs(m.x - p.x) < 20 && Math.abs(m.y - (p.y - 30)) < 36) {
      m.ok = true; sfx.moneda(); particulas(m.x, m.y, [PAL.oro, PAL.blanco], 12, 140, 300);
      textos.push({ t: "MONEDA", x: m.x, y: m.y - 22, vida: 0.9, c: PAL.oro });
    }
    // Consumibles
    for (const c of consumibles) if (!c.ok && Math.abs(c.x - p.x) < 22 && Math.abs(c.y - (p.y - 28)) < 38) recoger(c);
    void cayendoAntes;
  }

  function recoger(c) {
    c.ok = true; recogidos++;
    const def = CONSUMIBLES[c.tipo];
    if (c.tipo === "vida") { if (p.hp < hpMax()) p.hp++; else sumarSuper(1); }
    else if (c.tipo === "escudo") p.escudo = 1;
    else if (c.tipo === "super") sumarSuper(1);
    else { p.arma = c.tipo; p.armaT = def.dur; }
    sfx.moneda(); Sonido.tono(660, 1320, 0.18, "triangle", 0.12, 0.1);
    particulas(c.x, c.y, [def.color, PAL.blanco, PAL.oro], 16, 170, 200);
    textos.push({ t: def.nombre, x: p.x, y: p.y - 96, vida: 1.2, c: def.color });
  }

  function recibirDano(foso = false) {
    if (p.inv > 0 && !foso) return;
    if (amuleto === "humo" && p.dash > 0 && !foso) return;
    if (p.escudo > 0 && !foso) {
      p.escudo = 0; p.inv = 1.2; hitstop = 0.08; temblor = 4; sfx.parry();
      particulas(p.x, p.y - 30, [PAL.blanco, PAL.crema], 18, 200, 0);
      textos.push({ t: "¡ESCUDO ROTO!", x: p.x, y: p.y - 92, vida: 0.9, c: PAL.blanco });
      return;
    }
    p.hp--; p.inv = 2; p.flash = 0.12; hitstop = 0.14; temblor = 7; sfx.golpe();
    particulas(p.x, p.y - 30, [PAL.rojo, PAL.blanco, PAL.negro], 16, 220);
    if (!foso) { p.vy = -280; p.dash = 0; }
    if (p.hp <= 0) morir();
  }

  function sumarSuper(n) { p.cartas = Math.min(5, p.cartas + n); }

  /* ---------------- Enemigos del tramo ---------------- */
  function actualizarEnemigos(dt) {
    // Disparadores de oleadas
    disparadores = disparadores.filter(d => {
      if (p.x < d.g) return true;
      if (d.t === "mini") enemigos.push({ tipo: "mini", x: d.x, y: SUELO, vy: 0, hp: 3, t: Math.random() * 2, salto: 1 + Math.random(), flash: 0, mira: -1 });
      if (d.t === "cereza") enemigos.push({ tipo: "cereza", x: camX + W + 30, base: 100 + d.dy * 0.8, y: 100 + d.dy * 0.8, hp: 1, t: Math.random() * 6, flash: 0, picado: false, vy: 0 });
      return false;
    });

    for (const e of enemigos) {
      e.flash -= dt; e.t += dt;
      if (e.tipo === "mini") {
        // Deambulan al azar por su zona: andan, se paran, cambian de sentido y a veces saltan
        if (e.x0 === undefined) { e.x0 = e.x; e.dir = Math.random() < 0.5 ? -1 : 1; e.cambio = 0; }
        e.cambio -= dt;
        if (e.cambio <= 0) {
          const r = Math.random();
          e.dir = r < 0.3 ? 0 : r < 0.65 ? -1 : 1;           // 30 % de las veces se queda quieto
          e.cambio = 0.8 + Math.random() * 1.6;
        }
        const enSuelo = e.y >= SUELO && sueloEn(e.x);
        const minX = enJefe ? AX + 30 : e.x0 - 150, maxX = enJefe ? AX + AW - 30 : e.x0 + 150;
        const sig = e.x + e.dir * 22;
        if (e.dir && (sig < minX || sig > maxX || (enSuelo && !sueloEn(sig)))) e.dir *= -1; // no se tira a los fosos
        if (e.dir) e.mira = e.dir;
        e.x += e.dir * 55 * D().enemVel * dt;
        e.salto -= dt;
        if (enSuelo && e.salto <= 0) { e.vy = -260; e.salto = 2.5 + Math.random() * 2.5; }
        e.vy += 1300 * dt; e.y += e.vy * dt;
        if (e.y >= SUELO && sueloEn(e.x) && e.y - e.vy * dt <= SUELO + 2) { e.y = SUELO; e.vy = 0; }
        if (e.y > H + 60) e.muerto = true;
        if (choca(cajaJug(), { x: e.x - 14, y: e.y - 44, w: 28, h: 42 })) recibirDano();
      } else if (e.tipo === "cereza") {
        // Vuelan en línea ondulada por encima de tu cabeza: solo te dan si saltas contra ellas
        e.x -= 75 * dt; e.y = e.base + Math.sin(e.t * 2) * 22;
        if (e.x < camX - 60) e.muerto = true;
        if (choca(cajaJug(), { x: e.x - 12, y: e.y - 12, w: 24, h: 24 })) recibirDano();
      } else if (e.tipo === "batidora") {
        const visible = e.x > camX - 20 && e.x < camX + W + 20;
        if (visible) {
          e.disp -= dt;
          if (e.disp <= 0) {
            e.n = (e.n || 0) + 1;
            const tVuelo = 1.1, dx = p.x - e.x;
            proys.push({ x: e.x, y: e.y - 60, vx: dx / tVuelo, vy: -340, grav: 560, r: 6, rosa: e.n % 2 === 0, tipo: "sirope" });
            e.disp = 2.6; e.boca = 0.2;
          }
          e.boca = (e.boca || 0) - dt;
        }
        if (choca(cajaJug(), { x: e.x - 20, y: e.y - 52, w: 40, h: 52 })) recibirDano();
      }
    }
    enemigos = enemigos.filter(e => !e.muerto);
  }

  function cajaEnemigo(e) {
    if (e.tipo === "mini") return { x: e.x - 15, y: e.y - 46, w: 30, h: 46 };
    if (e.tipo === "cereza") return { x: e.x - 13, y: e.y - 14, w: 26, h: 28 };
    if (e.tipo === "batidora") return { x: e.x - 22, y: e.y - 56, w: 44, h: 56 };
    return { x: 0, y: 0, w: 0, h: 0 };
  }

  function matarEnemigo(e) {
    e.muerto = true; sfx.boom();
    const cols = e.tipo === "cereza" ? [PAL.rojo, PAL.verde, PAL.blanco] : [PAL.cian, PAL.magenta, PAL.verde, PAL.blanco];
    particulas(e.x, e.y - 20, cols, 22, 240);
    if (e.tipo === "batidora") { temblor = 5; soltarConsumible(e.x, e.y - 60); }
    else if (Math.random() < D().drop) soltarConsumible(e.x, Math.min(e.y - 20, SUELO - 30));
  }

  /* ---------------- Balas ---------------- */
  function actualizarBalas(dt) {
    for (const b of balas) {
      if (b.tele) {
        // Pajita teledirigida: gira poco a poco hacia el objetivo más cercano
        let obj = null, mejor = 1e9;
        for (const e of enemigos) { const c = cajaEnemigo(e), d = Math.hypot(c.x + c.w / 2 - b.x, c.y + c.h / 2 - b.y); if (d < mejor) { mejor = d; obj = { x: c.x + c.w / 2, y: c.y + c.h / 2 }; } }
        if (jefe && jefe.vivo && jefe.visible) { const c = cajaJefe(), d = Math.hypot(c.x + c.w / 2 - b.x, c.y + c.h / 2 - b.y); if (d < mejor) obj = { x: c.x + c.w / 2, y: c.y + c.h / 2 }; }
        if (obj) {
          const v = Math.hypot(b.vx, b.vy), a = Math.atan2(b.vy, b.vx), objA = Math.atan2(obj.y - b.y, obj.x - b.x);
          let da = objA - a; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
          const na = a + Math.max(-7 * dt, Math.min(7 * dt, da)); b.vx = Math.cos(na) * v; b.vy = Math.sin(na) * v;
        }
      }
      b.x += b.vx * dt; b.y += b.vy * dt; b.vida -= dt;
      const cb = b.ex ? { x: b.x - 14, y: b.y - 14, w: 28, h: 28 } : { x: b.x - 5, y: b.y - 3, w: 10, h: 6 };
      for (const e of enemigos) {
        if (e.muerto || (b.ex && b.golpeados.has(e))) continue;
        if (choca(cb, cajaEnemigo(e))) {
          e.hp -= b.dmg; e.flash = 0.06; sumarSuper(b.ex ? 0 : 0.035); sfx.impacto();
          if (b.ex) b.golpeados.add(e); else b.vida = 0;
          particulas(b.x, b.y, [PAL.blanco, PAL.rosa], 3, 80, 0);
          if (e.hp <= 0) matarEnemigo(e);
          if (!b.ex) break;
        }
      }
      if (jefe && jefe.vivo && jefe.visible && b.vida > 0 && !(b.ex && b.golpeados.has(jefe)) && choca(cb, cajaJefe())) {
        jefe.hp -= b.dmg; jefe.flash = 0.05; sumarSuper(b.ex ? 0 : 0.03); sfx.impacto();
        particulas(b.x, b.y, [PAL.blanco, PAL.cian], 3, 80, 0);
        if (b.ex) { b.golpeados.add(jefe); temblor = 4; } else b.vida = 0;
      }
      if (b.x < camX - 30 || b.x > camX + W + 30 || b.y < -30) b.vida = 0;
    }
    balas = balas.filter(b => b.vida > 0);
  }

  function actualizarProyectiles(dt) {
    const cj = cajaJug();
    for (const pr of proys) {
      pr.vy += (pr.grav || 0) * dt; pr.x += pr.vx * dt; pr.y += pr.vy * dt; pr.t = (pr.t || 0) + dt;
      if (pr.y > SUELO + 4 && pr.grav && sueloEn(pr.x)) { pr.fuera = true; particulas(pr.x, SUELO, [pr.rosa ? PAL.rosa : PAL.cian, PAL.blanco], 6, 90); }
      if (pr.x < camX - 40 || pr.x > camX + W + 40 || pr.y > H + 30 || pr.y < -60) pr.fuera = true;
      if (!pr.fuera && choca(cj, { x: pr.x - pr.r + 2, y: pr.y - pr.r + 2, w: pr.r * 2 - 4, h: pr.r * 2 - 4 })) {
        if ((p.parryVent > 0 || (amuleto === "parry" && !p.suelo)) && pr.rosa) continue; // lo resuelve el parry
        if (p.inv <= 0) { recibirDano(); pr.fuera = true; }
      }
    }
    proys = proys.filter(pr => !pr.fuera);
    for (const r of rosquillas) r.cd -= dt;
  }

  function actualizarConsumibles(dt) {
    for (const c of consumibles) {
      c.t += dt; c.vida -= dt;
      if (c.cae) {
        c.vy += 700 * dt; c.y += c.vy * dt;
        const suelo = (enJefe || sueloEn(c.x)) ? SUELO - 16 : H + 100;
        if (c.y >= suelo) { c.y = suelo; c.vy = 0; c.cae = false; }
        if (c.y > H + 40) c.ok = true;
      }
    }
    consumibles = consumibles.filter(c => !c.ok && c.vida > 0);
  }

  /* ---------------- JEFE: ALTER EGO ---------------- */
  function cajaJefe() { return { x: jefe.x - 40, y: jefe.y - 136, w: 80, h: 128 }; }

  function empezarJefe() {
    enJefe = true;
    jefe = { x: AX + 470, y: SUELO, vy: 0, vx: 0, hp: D().jefeHp, max: D().jefeHp, est: "entrada", t: 0, sub: 0, vivo: true, visible: true, alfa: 0,
      flash: 0, mira: -1, glitch: 1, ciclo: 0, fase: 1, faseVista: 1, aire: false, squash: 1 };
    peligros = []; proys = []; enemigos = enemigos.filter(e => e.tipo === "mini" && e.x > AX);
    sfx.glitch(); Sonido.pararMusica();
    resultado = { tiempoJefe: tiempoJuego };
  }

  function faseDe(j) { const r = j.hp / j.max; return r > 0.66 ? 1 : r > 0.33 ? 2 : 3; }

  function actualizarJefe(dt) {
    const j = jefe; if (!j) return;
    j.t += dt; j.sub += dt; j.flash -= dt;
    j.glitch = Math.max(0.15 * j.fase, j.glitch - dt * 1.5);
    const fase = faseDe(j);
    if (fase !== j.fase && j.vivo) {
      j.fase = fase; j.glitch = 1.5; sfx.glitch(); temblor = 10; flashPantalla = 0.12;
      j.est = "transicion"; j.sub = 0; j.aire = false;
      textos.push({ t: fase === 2 ? "¡GLITCH!" : "¡ERROR FATAL!", x: j.x, y: j.y - 190, vida: 1.2, c: PAL.cian });
      // Ayuda entre fases: cae una vida y un potenciador (en la 3.ª, la teledirigida, que apunta sola)
      const lado = p.x > AX + AW / 2 ? AX + 140 : AX + AW - 140;
      soltarConsumible(lado, 40, "vida"); soltarConsumible(lado + (lado < AX + AW / 2 ? 70 : -70), 40, fase === 3 ? "tele" : "triple");
      if (fase === 3) mostrarBanner("¡VUELA ALTO!", "MANTÉN ↑ PARA APUNTAR ARRIBA", 2.2, null, PAL.cian);
    }
    if (!j.vivo) return;

    // Contacto con el cuerpo
    if (j.visible && j.alfa > 0.6 && p.inv <= 0 && choca(cajaJug(), { x: j.x - 26, y: j.y - 112, w: 52, h: 100 })) {
      recibirDano(); p.empuje = (p.x < j.x ? -1 : 1) * 320; // te aparta del jefe para no encadenar golpes
    }

    const cambiar = (est) => { j.est = est; j.sub = 0; };
    switch (j.est) {
      case "entrada":
        j.alfa = Math.min(1, j.sub / 1.4) * (Math.random() < 0.8 ? 1 : 0.2); j.glitch = 1.6;
        if (j.sub > 1.5) { j.alfa = 1; cambiar("espera"); mostrarBanner("ALTER EGO", "¡A POR ÉL!", 1.6, null, PAL.cian); Sonido.empezarMusica(true); }
        break;
      case "transicion":
        j.alfa = Math.random() < 0.7 ? 1 : 0.3;
        if (j.fase === 3) { j.y += (170 - j.y) * Math.min(1, dt * 3); }
        else j.y = Math.min(SUELO, j.y + 400 * dt);
        if (j.sub > 1.1) { j.alfa = 1; cambiar("espera"); }
        break;
      case "espera": {
        if (j.fase < 3) { j.y = Math.min(SUELO, j.y + 500 * dt); j.mira = Math.sign(p.x - j.x) || -1; }
        else flotar(dt);
        const pausa = (j.fase === 1 ? 0.8 : j.fase === 2 ? 0.7 : 0.6) * D().pausa;
        if (j.sub > pausa) {
          j.ciclo++;
          if (j.fase === 1) cambiar(j.ciclo % 2 ? "salto" : "rafaga");
          else if (j.fase === 2) cambiar(j.ciclo % 3 === 0 ? "invocar" : "rayo");
          else cambiar(j.ciclo % 2 ? "lluvia" : "rafaga");
        }
        break;
      }
      case "salto":
        if (!j.aire) {
          j.squash = 0.8 + Math.sin(j.sub * 30) * 0.03;
          if (j.sub > 0.55 * D().aviso) {
            // En fácil cae a tu lado (no encima): esquivas las ondas saltando
            const lado = dif === "facil" ? (j.x < p.x ? -95 : 95) : 0;
            j.aire = true; j.vy = -600; const destino = Math.max(AX + 80, Math.min(AX + AW - 80, p.x + lado));
            j.vx = (destino - j.x) / 0.86; j.squash = 1.2; sfx.salto();
          }
        } else {
          j.vy += 1400 * dt; j.x += j.vx * dt; j.y += j.vy * dt;
          j.x = Math.max(AX + 70, Math.min(AX + AW - 70, j.x));
          if (j.y >= SUELO && j.vy > 0) {
            j.y = SUELO; j.aire = false; j.squash = 0.75; temblor = 9; sfx.boom();
            particulas(j.x, SUELO, [PAL.crema, PAL.cian, PAL.magenta], 18, 200);
            [-1, 1].forEach(d => peligros.push({ tipo: "onda", x: j.x + d * 40, dir: d, v: 270 * D().vel }));
            cambiar("espera");
          }
        }
        break;
      case "rafaga": {
        const n = j.fase === 3 ? (dif === "facil" ? 3 : 5) : 3, volleys = 2, cada = 0.6;
        if (j.fase === 3) flotar(dt);
        const hechas = Math.floor(j.sub / cada);
        if (hechas > (j.hechas || 0) - 0 && hechas <= volleys && j.ultimaVolea !== hechas) {
          j.ultimaVolea = hechas;
          const ox = j.x + j.mira * 30, oy = j.y - 90, base = Math.atan2(p.y - 40 - oy, p.x - ox);
          for (let i = 0; i < n; i++) {
            const a = base + (i - (n - 1) / 2) * 0.26, v = (j.fase === 3 ? 230 : 200) * D().vel;
            proys.push({ x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 7, rosa: hechas === 2 && i === Math.floor(n / 2), tipo: "pixel" });
          }
          j.glitch = 0.9; sfx.glitch();
        }
        if (j.sub > cada * volleys + 0.3) { j.ultimaVolea = 0; cambiar("espera"); }
        break;
      }
      case "rayo": {
        // 1) se desvanece  2) reaparece en un lado  3) aviso  4) rayo
        if (j.sub < 0.3) j.alfa = 1 - j.sub / 0.3;
        else if (!j.colocado) {
          j.colocado = true; j.x = p.x > AX + AW / 2 ? AX + 60 : AX + AW - 60; j.y = SUELO; j.mira = p.x > j.x ? 1 : -1;
          sfx.glitch(); j.glitch = 1.4;
          const altos = j.ciclo % 2 ? ["bajo", "alto"] : ["alto", "bajo"];
          j.rayos = altos.map((a, i) => ({ altura: a, inicio: 0.75 + i * 1.6 }));
        } else {
          j.alfa = Math.min(1, (j.sub - 0.3) / 0.25);
          for (const r of j.rayos) {
            if (!r.lanzado && j.sub > r.inicio) {
              r.lanzado = true;
              peligros.push({ tipo: "rayo", y: r.altura === "bajo" ? SUELO - 16 : SUELO - 78, desde: j.x, dir: j.mira, aviso: 0.8 * D().aviso, activo: 0.45 });
              sfx.aviso();
            }
          }
          if (j.sub > j.rayos[j.rayos.length - 1].inicio + 2.0) { j.colocado = false; cambiar("espera"); }
        }
        break;
      }
      case "invocar":
        if (j.sub > 0.2 && !j.invocado) {
          j.invocado = true; j.glitch = 1.3; sfx.glitch();
          [-1, 1].forEach(d => enemigos.push({ tipo: "mini", x: Math.max(AX + 30, Math.min(AX + AW - 30, j.x + d * 70)), y: SUELO, vy: -250, hp: 4, t: 0, salto: 0.8, flash: 0, mira: d }));
          proys.push({ x: j.x, y: j.y - 150, vx: (p.x > j.x ? 1 : -1) * 60, vy: 0, r: 9, rosa: true, tipo: "corazon", flota: true });
        }
        if (j.sub > 1.3) { j.invocado = false; cambiar("espera"); }
        break;
      case "lluvia":
        flotar(dt);
        if (!j.columnas) {
          const xs = [p.x];
          while (xs.length < (dif === "facil" ? 3 : 4)) { const x = AX + 40 + Math.random() * (AW - 80); if (xs.every(o => Math.abs(o - x) > 70)) xs.push(x); }
          j.columnas = xs.map((x, i) => ({ x, t: -i * 0.18 }));
          j.columnas.forEach(c => peligros.push({ tipo: "columna", x: c.x, aviso: (0.75 - c.t) * D().aviso, y: -40, vy: 0 }));
          sfx.aviso();
        }
        if (j.sub > 2.4) { j.columnas = null; cambiar("espera"); }
        break;
      case "ko":
        break;
    }
    function flotar(dt2) {
      const objetivoX = AX + AW / 2 + Math.sin(j.t * 0.9) * 210;
      j.x += (objetivoX - j.x) * Math.min(1, dt2 * 2); j.y += (170 + Math.sin(j.t * 2.3) * 12 - j.y) * Math.min(1, dt2 * 3);
      j.mira = Math.sign(p.x - j.x) || -1;
    }
    j.squash += (1 - j.squash) * Math.min(1, dt * 8);

    if (j.hp <= 0 && j.vivo) noquear();
  }

  function actualizarPeligros(dt) {
    const cj = cajaJug();
    for (const h of peligros) {
      if (h.tipo === "onda") {
        h.x += h.dir * h.v * dt;
        if (h.x < AX - 20 || h.x > AX + AW + 20) h.fuera = true;
        if (choca(cj, { x: h.x - 10, y: SUELO - 20, w: 20, h: 20 })) recibirDano();
      } else if (h.tipo === "rayo") {
        if (h.aviso > 0) { h.aviso -= dt; if (h.aviso <= 0) { temblor = 4; sfx.boom(); } }
        else {
          h.activo -= dt; if (h.activo <= 0) h.fuera = true;
          const x0 = h.dir > 0 ? h.desde : AX, x1 = h.dir > 0 ? AX + AW : h.desde;
          if (choca(cj, { x: x0, y: h.y - 9, w: x1 - x0, h: 18 })) recibirDano();
        }
      } else if (h.tipo === "columna") {
        if (h.aviso > 0) h.aviso -= dt;
        else {
          h.vy += 2200 * dt; h.y += h.vy * dt;
          if (choca(cj, { x: h.x - 16, y: h.y - 16, w: 32, h: 32 })) recibirDano();
          if (h.y >= SUELO - 16) { h.fuera = true; temblor = Math.max(temblor, 3); particulas(h.x, SUELO - 4, [PAL.cian, PAL.magenta, PAL.verde], 10, 160); }
        }
      }
    }
    peligros = peligros.filter(h => !h.fuera);
    // corazones rosas que flotan hacia ti
    for (const pr of proys) if (pr.flota) { pr.vx += (Math.sign(p.x - pr.x) * 20 - pr.vx * 0.3) * dt; pr.vy = Math.sin((pr.t || 0) * 3) * 30; }
  }

  function noquear() {
    const j = jefe; j.vivo = false; j.est = "ko"; peligros = []; proys = [];
    enemigos.forEach(e => { e.muerto = true; particulas(e.x, e.y - 20, [PAL.cian, PAL.magenta], 10, 160); });
    hitstop = 0.4; temblor = 14; flashPantalla = 0.2; Sonido.pararMusica(); sfx.ko();
    estado = "ko";
    mostrarBanner("¡K.O.!", "", 2.6, mostrarResultados, PAL.crema);
    let n = 0; const id = setInterval(() => { particulas(j.x + (Math.random() - 0.5) * 100, j.y - 40 - Math.random() * 100, [PAL.cian, PAL.magenta, PAL.verde, PAL.blanco, PAL.azul], 18, 260); sfx.boom(); if (++n > 7) clearInterval(id); }, 220);
  }

  function morir() {
    estado = "muerto"; Sonido.pararMusica(); sfx.muerte(); temblor = 10;
    const progreso = enJefe ? 0.8 + 0.2 * (1 - Math.max(0, jefe.hp) / jefe.max) : Math.min(0.8, p.x / AX * 0.8);
    setTimeout(() => mostrarMenu("muerto", { progreso }), 900);
  }

  /* ---------------- Resultados (tarjeta de puntuación) ---------------- */
  function mostrarResultados() {
    const t = tiempoJuego, mon = monedas.filter(m => m.ok).length;
    let pts = (t <= 110 ? 30 : t <= 160 ? 22 : t <= 220 ? 14 : 6) + Math.min(3, p.hp) * 10 + Math.min(3, p.parries) * 5 + Math.min(2, p.ex) * 5 + mon * 5;
    const nota = pts >= 95 ? "A+" : pts >= 88 ? "A" : pts >= 80 ? "A-" : pts >= 72 ? "B+" : pts >= 64 ? "B" : pts >= 56 ? "B-" : pts >= 48 ? "C+" : pts >= 40 ? "C" : "D";
    if (dif === "facil" && pts > 88) pts = 88; // en fácil la nota máxima es A
    const nota2 = pts >= 95 ? "A+" : pts >= 88 ? "A" : pts >= 80 ? "A-" : pts >= 72 ? "B+" : pts >= 64 ? "B" : pts >= 56 ? "B-" : pts >= 48 ? "C+" : pts >= 40 ? "C" : "D";
    resultado = { tiempo: t, hp: p.hp, parries: p.parries, ex: p.ex, monedas: mon, pts, nota: nota2, recogidos };
    guardarProgreso(pts * 10);
    estado = "resultados";
    mostrarMenu("resultados", resultado);
  }

  function guardarProgreso(puntos) {
    try {
      const est = JSON.parse(localStorage.getItem("shakeweek-v1") || "{}");
      const modo = est.modo === "campana" ? "campana" : "demo";
      est.modo = est.modo || "demo"; est.demo = est.demo || {}; est.campana = est.campana || {}; est.mejores = est.mejores || {};
      const d = new Date(), hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!est[modo][1]) est[modo][1] = hoy;
      est.mejores[1] = Math.max(est.mejores[1] || 0, puntos);
      localStorage.setItem("shakeweek-v1", JSON.stringify(est));
    } catch (e) { /* sin almacenamiento: no pasa nada */ }
  }

  /* ---------------- Menús HTML ---------------- */
  const menu = document.getElementById("menu");
  function ocultarMenu() { menu.className = "menu"; menu.innerHTML = ""; }
  function mostrarMenu(tipo, datos = {}) {
    menu.className = "menu ver " + tipo;
    const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
    if (tipo === "titulo") {
      menu.innerHTML = `<div class="caja">
        <p class="pre">SHAKE WEEK · DÍA 1</p>
        <h1>LA FÁBRICA<br><span>GLITCH</span></h1>
        <p class="hist">El Alter Ego ha corrompido la fábrica de Miflshakes. Crúzala disparando y derrótalo en su guarida.</p>
        <div class="eleccion"><span class="et">DIFICULTAD</span>
          ${Object.entries(DIFS).map(([k, d]) => `<button class="op ${k === dif ? "sel" : ""}" data-dif="${k}">${d.nombre}${k === "facil" ? " ★" : ""}</button>`).join("")}
        </div>
        <div class="eleccion"><span class="et">AMULETO</span>
          ${Object.entries(AMULETOS).map(([k, a]) => `<button class="op ${k === amuleto ? "sel" : ""}" data-amuleto="${k}" title="${a.desc}">${a.icono} ${a.nombre}</button>`).join("")}
        </div>
        <p class="desc">${AMULETOS[amuleto].desc}</p>
        <button class="b principal" data-accion="empezar">▶ JUGAR</button>
        <div class="ctrls">
          <span><b>← →</b> mover</span><span><b>Z</b> / <b>ESPACIO</b> saltar</span><span><b>X</b> disparar</span>
          <span><b>↑</b> apuntar arriba</span><span><b>C</b> / <b>SHIFT</b> dash</span><span><b>V</b> súper (EX)</span>
          <span class="rosa"><b>Salta otra vez</b> sobre algo <b>ROSA</b> = PARRY</span>
          <span>Recoge los <b>consumibles</b>: vida, escudo y pajitas especiales</span>
        </div></div>`;
    } else if (tipo === "muerto") {
      menu.innerHTML = `<div class="caja">
        <h2 class="rojo">¡ELIMINADO!</h2>
        <div class="progreso"><i style="width:${Math.round(datos.progreso * 100)}%"></i><span class="hito" style="left:80%">👾</span><span class="yo" style="left:${Math.round(datos.progreso * 100)}%">🥤</span></div>
        <p class="hist">${enJefe ? "El Alter Ego sigue en pie." : "Te has quedado a medio camino de la guarida."}</p>
        <div class="fila">
          ${enJefe ? `<button class="b principal" data-accion="jefe">↻ REINTENTAR JEFE</button>` : ""}
          ${!enJefe && puntoControl ? `<button class="b principal" data-accion="control">↻ DESDE EL PUNTO DE CONTROL</button>` : ""}
          <button class="b ${enJefe || puntoControl ? "" : "principal"}" data-accion="reiniciar">↻ DESDE EL PRINCIPIO</button>
          <a class="b" href="index.html">SALIR</a>
        </div></div>`;
    } else if (tipo === "resultados") {
      menu.innerHTML = `<div class="caja tarjeta">
        <h2>¡NIVEL SUPERADO!</h2>
        <ul class="filas">
          <li><span>TIEMPO</span><b>${fmt(datos.tiempo)}</b></li>
          <li><span>VIDA</span><b>${"♥".repeat(Math.max(0, datos.hp))}</b></li>
          <li><span>PARRIES</span><b>${Math.min(3, datos.parries)}/3</b></li>
          <li><span>SÚPER (EX)</span><b>${Math.min(2, datos.ex)}/2</b></li>
          <li><span>MONEDAS</span><b>${datos.monedas}/3</b></li>
          <li><span>CONSUMIBLES</span><b>${datos.recogidos}</b></li>
          <li><span>DIFICULTAD</span><b>${DIFS[dif].nombre}</b></li>
        </ul>
        <div class="nota"><small>NOTA</small><b>${datos.nota}</b></div>
        <p class="sello">Sello del lunes conseguido ✔</p>
        <div class="fila">
          <a class="b principal" href="index.html">VOLVER A SHAKE WEEK</a>
          <button class="b" data-accion="reiniciar">↻ MEJORAR NOTA</button>
        </div></div>`;
    } else if (tipo === "pausa") {
      menu.innerHTML = `<div class="caja"><h2>PAUSA</h2><div class="fila col">
        <button class="b principal" data-accion="continuar">▶ CONTINUAR</button>
        <button class="b" data-accion="reiniciar">↻ REINICIAR NIVEL</button>
        <a class="b" href="index.html">SALIR</a></div></div>`;
    }
    const primero = menu.querySelector(".principal, .b"); if (primero) primero.focus();
  }
  menu.addEventListener("click", e => {
    const op = e.target.closest("[data-dif],[data-amuleto]");
    if (op) {
      if (op.dataset.dif) dif = op.dataset.dif; else amuleto = op.dataset.amuleto;
      try { localStorage.setItem("shakeweek-dia1", JSON.stringify({ dif, amuleto })); } catch (er) {}
      Sonido.iniciar(); Sonido.tono(880, 880, 0.05, "square", 0.05); mostrarMenu("titulo"); return;
    }
    const b = e.target.closest("[data-accion]"); if (!b) return;
    Sonido.iniciar();
    const a = b.dataset.accion;
    if (a === "empezar" || a === "reiniciar") reiniciar("inicio");
    if (a === "jefe") reiniciar("jefe");
    if (a === "control") reiniciar("control");
    if (a === "continuar") pausar();
  });
  function accionPrincipal() {
    Sonido.iniciar();
    if (estado === "titulo") reiniciar(false);
    else if (estado === "muerto") reiniciar(enJefe ? "jefe" : puntoControl ? "control" : "inicio");
    else if (estado === "pausa") pausar();
    else if (estado === "resultados") location.href = "index.html";
  }
  function pausar() {
    if (estado === "juego") { estado = "pausa"; Sonido.pararMusica(); mostrarMenu("pausa"); }
    else if (estado === "pausa") { estado = "juego"; ocultarMenu(); Sonido.empezarMusica(enJefe && jefe && jefe.vivo); }
  }
  document.getElementById("btnPausa")?.addEventListener("click", pausar);
  document.getElementById("btnSonido")?.addEventListener("click", () => { Sonido.iniciar(); Sonido.alternar(); });

  /* ---------------- Bucle ---------------- */
  function actualizar(dt) {
    reloj += dt;
    if (banner) { banner.t += dt; if (banner.t > banner.dur) { const f = banner.alAcabar; banner = null; if (f) f(); } }
    parts = parts.filter(q => (q.t -= dt) > 0);
    for (const q of parts) { q.vy += q.grav * dt; q.x += q.vx * dt; q.y += q.vy * dt; }
    textos = textos.filter(q => (q.vida -= dt) > 0); textos.forEach(q => q.y -= 30 * dt);
    temblor = Math.max(0, temblor - dt * 30); flashPantalla -= dt;

    if (estado === "ko") { if (jefe) { jefe.alfa = Math.random() < 0.5 ? 1 : 0.2; jefe.glitch = 2; jefe.y += 20 * dt; } return; }
    if (estado !== "juego") return;
    if (hitstop > 0) { hitstop -= dt; return; }
    tiempoJuego += dt;

    actualizarJugador(dt);
    if (estado !== "juego") return;
    actualizarEnemigos(dt);
    actualizarBalas(dt);
    actualizarProyectiles(dt);
    actualizarConsumibles(dt);
    if (!enJefe && !puntoControl && p.x > CONTROL_X) {
      puntoControl = { tiempo: tiempoJuego, monedas: monedas.map(m => m.ok) };
      sfx.moneda(); textos.push({ t: "¡PUNTO DE CONTROL!", x: p.x, y: p.y - 100, vida: 1.6, c: PAL.verde });
    }
    if (enJefe) { actualizarJefe(dt); actualizarPeligros(dt); }

    // Cámara
    const objetivo = enJefe ? AX : Math.max(0, Math.min(AX, p.x - 230));
    camX += (objetivo - camX) * Math.min(1, dt * (enJefe ? 4 : 7));
    if (!enJefe) camX = Math.max(camX, objetivo - 260);
    // Entrada a la guarida
    if (!enJefe && p.x > AX + 60) empezarJefe();
  }

  /* ---------------- Dibujo ---------------- */
  function dibujarFondo() {
    const glitchFondo = enJefe && jefe ? (jefe.fase - 1) * 0.5 + (jefe.vivo ? 0 : 1) : 0;
    // Cielo nocturno de fábrica
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, enJefe ? "#0d0a1a" : "#1d0c18"); g.addColorStop(1, enJefe ? "#241036" : "#4a1220");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // Luna-reloj
    const lx = 470 - camX * 0.03;
    ctx.fillStyle = "#3a1a2a"; ctx.beginPath(); ctx.arc(lx, 70, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PAL.crema; ctx.beginPath(); ctx.arc(lx, 70, 28, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#e9d7b8"; ctx.fillRect(lx - 10, 60, 6, 6); ctx.fillRect(lx + 8, 76, 8, 6);
    // Capa lejana: siluetas de fábrica (parallax 0.2)
    for (const d of DECO) {
      const x = Math.round(((d.x - camX * 0.2) % 4200 + 4200) % 4200 - 300);
      if (x < -160 || x > W + 40) continue;
      ctx.fillStyle = "#2a0f22";
      if (d.tipo === "chimenea") {
        ctx.fillRect(x, SUELO - d.h - 60, 26, d.h + 60); ctx.fillRect(x - 4, SUELO - d.h - 68, 34, 10);
        // humo pixelado
        for (let k = 0; k < 4; k++) {
          const hy = SUELO - d.h - 84 - k * 18 - ((reloj * 14) % 18), hx = x + 12 + Math.sin(reloj + k + d.x) * 6;
          ctx.fillStyle = `rgba(90,60,90,${0.5 - k * 0.1})`; ctx.fillRect(Math.round(hx - 8 - k * 2), Math.round(hy), 16 + k * 4, 12);
        }
      } else if (d.tipo === "tanque") {
        ctx.fillRect(x, SUELO - d.h, 70, d.h); ctx.beginPath(); ctx.arc(x + 35, SUELO - d.h, 35, Math.PI, 0); ctx.fill();
        ctx.fillStyle = "#3d1530"; ctx.fillRect(x + 8, SUELO - d.h + 10, 54, 8);
      } else {
        ctx.fillRect(x, SUELO - d.h * 0.7, 120, d.h);
        for (let k = 0; k < 4; k++) { ctx.fillRect(x + k * 30, SUELO - d.h * 0.7 - 16, 30, 16); }
        ctx.fillStyle = (Math.floor(reloj * 2 + d.x) % 5) ? "#ffcf3a55" : "#ffcf3a22";
        ctx.fillRect(x + 14, SUELO - d.h * 0.7 + 14, 12, 12); ctx.fillRect(x + 54, SUELO - d.h * 0.7 + 14, 12, 12);
      }
    }
    // Capa media: tuberías y cartel (parallax 0.5)
    ctx.fillStyle = "#3a1226";
    const off = -((camX * 0.5) % 160);
    for (let x = off; x < W + 160; x += 160) {
      ctx.fillRect(Math.round(x), 120, 160, 10); ctx.fillRect(Math.round(x + 40), 120, 10, SUELO - 120);
      ctx.fillStyle = "#541a33"; ctx.fillRect(Math.round(x + 36), 116, 18, 18); ctx.fillStyle = "#3a1226";
    }
    // Cartel luminoso de la marca
    const cx = Math.round(900 - camX * 0.5);
    if (cx > -220 && cx < W + 20) {
      ctx.fillStyle = "#1a0710"; ctx.fillRect(cx, 60, 200, 46);
      ctx.strokeStyle = (Math.floor(reloj * 3) % 7) ? PAL.rojo : "#5a0f1c"; ctx.lineWidth = 3; ctx.strokeRect(cx + 2, 62, 196, 42);
      texto("MIFLSHAKES", cx + 100, 84, 12, (Math.floor(reloj * 3) % 7) ? PAL.rojo : "#5a0f1c", "center", "#1a0710");
    }

    if (glitchFondo > 0) {
      for (let i = 0; i < 6 * glitchFondo; i++) {
        ctx.fillStyle = [PAL.cian, PAL.magenta, PAL.verde, PAL.azul][i % 4] + "33";
        ctx.fillRect(Math.random() * W, Math.random() * SUELO, 20 + Math.random() * 120, 2 + Math.random() * 6);
      }
    }
  }

  function dibujarMundo() {
    ctx.save(); ctx.translate(-Math.round(camX), 0);
    // Suelo: baldosas de ajedrez rojas y negras
    for (const s of SUELOS) {
      if (s.x > camX + W || s.x + s.w < camX) continue;
      ctx.fillStyle = PAL.negro; ctx.fillRect(s.x, SUELO, s.w, H - SUELO);
      const T = 20;
      for (let x = Math.floor(Math.max(s.x, camX) / T) * T; x < Math.min(s.x + s.w, camX + W + T); x += T) {
        const x0 = Math.max(x, s.x), x1 = Math.min(x + T, s.x + s.w);
        if (x1 <= x0) continue;
        for (let y = SUELO + 8; y < H; y += T) {
          if ((x / T + (y - SUELO - 8) / T) % 2 === 0) { ctx.fillStyle = "#5a0f1c"; ctx.fillRect(x0, y, x1 - x0, T); }
        }
      }
      ctx.fillStyle = PAL.rojo; ctx.fillRect(s.x, SUELO, s.w, 6);
      ctx.fillStyle = PAL.crema; ctx.fillRect(s.x, SUELO + 6, s.w, 2);
      ctx.fillStyle = PAL.rojoOsc; ctx.fillRect(s.x, SUELO, 4, H); ctx.fillRect(s.x + s.w - 4, SUELO, 4, H);
    }
    // Fosos con batido de fresa burbujeante
    for (let i = 0; i < SUELOS.length - 1; i++) {
      const a = SUELOS[i].x + SUELOS[i].w, b = SUELOS[i + 1].x;
      ctx.fillStyle = PAL.rosa; ctx.fillRect(a, H - 26, b - a, 26);
      ctx.fillStyle = "#ff9ac6"; for (let x = a; x < b; x += 8) ctx.fillRect(x, H - 28 + Math.round(Math.sin(reloj * 4 + x) * 2), 6, 3);
    }
    // Plataformas: cintas transportadoras
    if (!enJefe || camX < AX) for (const s of PLATS) {
      ctx.fillStyle = PAL.gris; ctx.fillRect(s.x, s.y, s.w, 12);
      ctx.fillStyle = PAL.grisC; for (let x = s.x + ((reloj * 30) % 10); x < s.x + s.w - 4; x += 10) ctx.fillRect(Math.round(x), s.y + 2, 4, 3);
      ctx.fillStyle = PAL.negro; ctx.fillRect(s.x, s.y + 12, s.w, 3);
      ctx.fillStyle = PAL.rojo; ctx.fillRect(s.x, s.y - 2, s.w, 2);
      ctx.fillStyle = "#3d3447"; ctx.fillRect(s.x + 6, s.y + 15, 4, 20); ctx.fillRect(s.x + s.w - 10, s.y + 15, 4, 20);
    }
    // Puerta de la guarida
    if (!enJefe) {
      const gx = AX + 40;
      for (let y = 40; y < SUELO; y += 6) {
        ctx.fillStyle = [PAL.cian, PAL.magenta, PAL.verde, PAL.azul][(Math.floor(y / 6) + Math.floor(reloj * 10)) % 4];
        ctx.globalAlpha = 0.35; ctx.fillRect(gx + Math.round(Math.sin(reloj * 9 + y) * 5), y, 14, 5);
      }
      ctx.globalAlpha = 1;
      texto("GUARIDA", gx + 7, 26, 10, PAL.cian);
    }
    // Rosquillas rosas (parry)
    for (const r of rosquillas) {
      const y = Math.round(r.y + Math.sin(reloj * 3 + r.x) * 4), a = r.cd > 0 ? 0.25 : 1;
      ctx.globalAlpha = a;
      ctx.fillStyle = PAL.negro; ctx.fillRect(r.x - 12, y - 10, 24, 20); ctx.fillRect(r.x - 10, y - 12, 20, 24);
      ctx.fillStyle = PAL.rosa; ctx.fillRect(r.x - 10, y - 8, 20, 16); ctx.fillRect(r.x - 8, y - 10, 16, 20);
      ctx.fillStyle = PAL.negro; ctx.fillRect(r.x - 3, y - 3, 6, 6);
      ctx.fillStyle = PAL.blanco; ctx.fillRect(r.x - 6, y - 7, 2, 2); ctx.fillRect(r.x + 4, y - 4, 2, 2); ctx.fillStyle = PAL.cian; ctx.fillRect(r.x - 7, y + 3, 2, 2);
      ctx.globalAlpha = 1;
    }
    // Carteles de ayuda y bandera del punto de control
    for (const [cx, l1, l2] of CARTELES) {
      if (cx < camX - 120 || cx > camX + W + 120) continue;
      ctx.fillStyle = "#3d2a1e"; ctx.fillRect(cx - 3, SUELO - 50, 6, 50);
      ctx.fillStyle = PAL.negro; ctx.fillRect(cx - 62, SUELO - 86, 124, 40);
      ctx.fillStyle = "#e9d7b8"; ctx.fillRect(cx - 60, SUELO - 84, 120, 36);
      ctx.font = `7px ${FUENTE}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = PAL.negro;
      ctx.fillText(l1, cx, SUELO - 72); ctx.fillStyle = PAL.rojoOsc; ctx.fillText(l2, cx, SUELO - 60);
    }
    {
      const fx = CONTROL_X, ok = !!puntoControl;
      ctx.fillStyle = PAL.crema; ctx.fillRect(fx, SUELO - 90, 4, 90);
      ctx.fillStyle = ok ? PAL.verde : PAL.grisC; const ond = Math.round(Math.sin(reloj * 6) * 2);
      ctx.fillRect(fx + 4, SUELO - 90 + ond, 30, 8); ctx.fillRect(fx + 4, SUELO - 82 - ond, 24, 8);
    }
    // Consumibles
    for (const c of consumibles) dibujarConsumible(c);
    // Monedas
    for (const m of monedas) if (!m.ok) {
      const an = Math.max(2, Math.round(Math.abs(Math.cos(reloj * 4 + m.x)) * 12));
      ctx.fillStyle = PAL.negro; ctx.fillRect(m.x - an / 2 - 2, m.y - 10, an + 4, 20);
      ctx.fillStyle = PAL.oro; ctx.fillRect(m.x - an / 2, m.y - 8, an, 16);
      ctx.fillStyle = PAL.blanco; if (an > 6) ctx.fillRect(m.x - an / 2 + 2, m.y - 6, 2, 6);
    }
    // Enemigos
    for (const e of enemigos) {
      if (e.tipo === "mini") {
        const bl = e.flash > 0 ? A.miniBlanco : null;
        spriteGlitch(A.mini, e.x, e.y + 2, e.mira > 0, 0.3, 1, 1 + Math.sin(e.t * 14) * 0.05, bl);
      } else if (e.tipo === "cereza") dibujarCereza(e);
      else if (e.tipo === "batidora") dibujarBatidora(e);
    }
    // Jefe
    if (jefe) {
      const j = jefe;
      if (j.visible) spriteGlitch(A.jefe, j.x, j.y + 4, j.mira > 0, j.glitch, j.alfa, j.squash, j.flash > 0 ? A.jefeBlanco : null);
      if (j.est === "salto" && !j.aire) texto("!", j.x, j.y - 190, 18, PAL.cian);
    }
    // Peligros del jefe
    for (const h of peligros) {
      if (h.tipo === "onda") {
        ctx.fillStyle = PAL.cian; ctx.fillRect(Math.round(h.x - 10), SUELO - 18, 20, 18);
        ctx.fillStyle = PAL.magenta; ctx.fillRect(Math.round(h.x - 10 - h.dir * 6), SUELO - 12, 8, 12);
        ctx.fillStyle = PAL.blanco; ctx.fillRect(Math.round(h.x - 4), SUELO - 18, 8, 4);
      } else if (h.tipo === "rayo") {
        const x0 = h.dir > 0 ? h.desde : AX, x1 = h.dir > 0 ? AX + AW : h.desde;
        if (h.aviso > 0) {
          if (Math.floor(h.aviso * 12) % 2) { ctx.fillStyle = PAL.magenta; ctx.fillRect(x0, h.y - 1, x1 - x0, 2); }
          texto("⚠", h.dir > 0 ? AX + AW - 24 : AX + 24, h.y, 12, PAL.magenta);
        } else {
          for (let k = 0; k < 4; k++) {
            ctx.fillStyle = [PAL.blanco, PAL.cian, PAL.magenta, PAL.verde][(k + Math.floor(reloj * 30)) % 4];
            ctx.fillRect(x0, h.y - 9 + k * 4 + (Math.random() < 0.3 ? 2 : 0), x1 - x0, 4);
          }
        }
      } else if (h.tipo === "columna") {
        if (h.aviso > 0) {
          ctx.globalAlpha = 0.25 + (Math.floor(h.aviso * 10) % 2) * 0.25; ctx.fillStyle = PAL.cian; ctx.fillRect(h.x - 16, 0, 32, SUELO);
          ctx.globalAlpha = 1; ctx.fillStyle = PAL.magenta; ctx.fillRect(h.x - 16, SUELO - 3, 32, 3);
        } else {
          ctx.fillStyle = PAL.negro; ctx.fillRect(h.x - 18, h.y - 18, 36, 36);
          ctx.fillStyle = [PAL.cian, PAL.magenta, PAL.verde][Math.floor(h.x) % 3]; ctx.fillRect(h.x - 16, h.y - 16, 32, 32);
          ctx.fillStyle = PAL.blanco; ctx.fillRect(h.x - 12, h.y - 12, 8, 8);
        }
      }
    }
    // Proyectiles enemigos
    for (const pr of proys) {
      const x = Math.round(pr.x), y = Math.round(pr.y), r = pr.r;
      if (pr.tipo === "corazon") {
        ctx.fillStyle = PAL.negro; ctx.fillRect(x - 10, y - 8, 20, 14); ctx.fillRect(x - 6, y + 4, 12, 6);
        ctx.fillStyle = PAL.rosa; ctx.fillRect(x - 8, y - 6, 7, 8); ctx.fillRect(x + 1, y - 6, 7, 8); ctx.fillRect(x - 6, y + 1, 12, 5); ctx.fillRect(x - 3, y + 5, 6, 3);
        ctx.fillStyle = PAL.blanco; ctx.fillRect(x - 6, y - 4, 2, 2);
        continue;
      }
      ctx.fillStyle = PAL.negro; ctx.fillRect(x - r - 1, y - r - 1, r * 2 + 2, r * 2 + 2);
      ctx.fillStyle = pr.rosa ? PAL.rosa : pr.tipo === "pixel" ? [PAL.cian, PAL.magenta, PAL.verde][Math.floor((pr.t || 0) * 12) % 3] : "#8a5a3a";
      ctx.fillRect(x - r + 1, y - r + 1, r * 2 - 2, r * 2 - 2);
      ctx.fillStyle = PAL.blanco; ctx.fillRect(x - r + 2, y - r + 2, 2, 2);
    }
    // Jugador
    if (p) {
      const parpadea = p.inv > 0 && Math.floor(reloj * 14) % 2;
      if (!parpadea || estado !== "juego") {
        const bob = p.suelo && p.vx ? Math.abs(Math.sin(p.anim * 14)) * -2 : 0;
        const rot = p.dash > 0 ? p.mira * 0.25 : (p.suelo && p.vx ? Math.sin(p.anim * 14) * 0.06 : 0) + p.mira * 0.04;
        if (p.suelo) { ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(Math.round(p.x - 16), Math.round(p.y - 1), 32, 3); }
        sprite(p.flash > 0 ? A.heroeBlanco : A.heroe, p.x, p.y + 2 + bob, p.mira < 0, p.est, rot);
        if (p.escudo) {
          ctx.globalAlpha = 0.35 + Math.sin(reloj * 6) * 0.1; ctx.strokeStyle = PAL.blanco; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.ellipse(Math.round(p.x), Math.round(p.y - 36), 30, 42, 0, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
        }
        if (p.parryVent > 0) { ctx.strokeStyle = PAL.rosa; ctx.lineWidth = 2; ctx.strokeRect(Math.round(p.x - 22), Math.round(p.y - 70), 44, 70); }
        if (K.disparo && p.cad > 0.06 && estado === "juego" && p.dash <= 0) {
          const fx = K.arr && !(K.izq || K.der) ? p.x + p.mira * 4 : p.x + p.mira * 26, fy = K.arr ? (K.izq || K.der ? p.y - 62 : p.y - 82) : p.y - 36;
          ctx.fillStyle = PAL.blanco; ctx.fillRect(Math.round(fx - 4), Math.round(fy - 4), 8, 8);
          ctx.fillStyle = PAL.rosa; ctx.fillRect(Math.round(fx - 2), Math.round(fy - 2), 4, 4);
        }
      }
    }
    // Balas del jugador: gotas de batido
    for (const b of balas) {
      const x = Math.round(b.x), y = Math.round(b.y);
      if (b.ex) {
        const s = 14 + Math.round(Math.sin(reloj * 30) * 2);
        ctx.fillStyle = PAL.negro; ctx.fillRect(x - s - 2, y - s - 2, s * 2 + 4, s * 2 + 4);
        ctx.fillStyle = PAL.rojo; ctx.fillRect(x - s, y - s, s * 2, s * 2);
        ctx.fillStyle = PAL.blanco; ctx.fillRect(x - s + 4, y - s + 4, s * 2 - 8, s * 2 - 8);
        ctx.fillStyle = PAL.rosa; ctx.fillRect(x - 4, y - 4, 8, 8);
        parts.push({ x: b.x - b.vx * 0.02, y: b.y + (Math.random() - 0.5) * 16, vx: 0, vy: 0, t: 0.2, c: PAL.rojo, s: 4, grav: 0 });
      } else {
        const hor = Math.abs(b.vx) > Math.abs(b.vy);
        const w = hor ? 12 : 4, h = hor ? 4 : 12;
        ctx.fillStyle = b.color === "tele" ? PAL.cian : b.color === "triple" ? PAL.oro : b.color === "turbo" ? PAL.rosa : PAL.rojo;
        ctx.fillRect(x - w / 2 - 1, y - h / 2 - 1, w + 2, h + 2);
        ctx.fillStyle = PAL.blanco; ctx.fillRect(x - w / 2, y - h / 2, w, h);
        ctx.fillStyle = PAL.rosa; ctx.fillRect(hor ? x + (b.vx > 0 ? 2 : -6) : x - 2, hor ? y - 2 : y + (b.vy > 0 ? 2 : -6), 4, 4);
      }
    }
    // Partículas y textos
    for (const q of parts) { ctx.globalAlpha = Math.min(1, q.t * 3); ctx.fillStyle = q.c; ctx.fillRect(Math.round(q.x), Math.round(q.y), q.s, q.s); }
    ctx.globalAlpha = 1;
    for (const q of textos) texto(q.t, q.x, q.y, 10, q.c);
    ctx.restore();
  }

  function dibujarCereza(e) {
    const x = Math.round(e.x), y = Math.round(e.y), f = e.flash > 0;
    ctx.fillStyle = PAL.negro; ctx.fillRect(x - 14, y - 6, 28, 18); ctx.fillRect(x - 2, y - 22, 4, 18);
    ctx.fillStyle = f ? PAL.blanco : "#3fae48"; ctx.fillRect(x - 1, y - 20, 2, 14); ctx.fillRect(x + 1, y - 22, 8, 4);
    ctx.fillStyle = f ? PAL.blanco : PAL.rojo; ctx.fillRect(x - 12, y - 4, 11, 14); ctx.fillRect(x + 1, y - 4, 11, 14);
    ctx.fillStyle = PAL.blanco; ctx.fillRect(x - 10, y - 2, 3, 3); ctx.fillRect(x + 3, y - 2, 3, 3);
    // ojos enfadados
    ctx.fillStyle = PAL.negro; ctx.fillRect(x - 8, y + 2, 2, 3); ctx.fillRect(x - 4, y + 2, 2, 3); ctx.fillRect(x + 5, y + 2, 2, 3); ctx.fillRect(x + 9, y + 2, 2, 3);
    // alas de glitch
    const a = Math.floor(reloj * 16) % 2 ? 4 : 0;
    ctx.fillStyle = PAL.cian; ctx.fillRect(x - 20, y - 8 + a, 7, 4); ctx.fillStyle = PAL.magenta; ctx.fillRect(x + 13, y - 8 + a, 7, 4);
  }
  function dibujarBatidora(e) {
    const x = Math.round(e.x), y = Math.round(e.y), f = e.flash > 0, b = (e.boca || 0) > 0 ? 3 : 0;
    ctx.fillStyle = PAL.negro; ctx.fillRect(x - 24, y - 58, 48, 58);
    ctx.fillStyle = f ? PAL.blanco : PAL.gris; ctx.fillRect(x - 22, y - 30, 44, 30);
    ctx.fillStyle = f ? PAL.blanco : "#c9e9f2"; ctx.fillRect(x - 18, y - 56, 36, 26);
    ctx.fillStyle = "#8a5a3a"; ctx.fillRect(x - 16, y - 46 + b, 32, 16 - b);
    ctx.fillStyle = PAL.rojo; ctx.fillRect(x - 22, y - 60 - b, 44, 6);
    ctx.fillStyle = PAL.cian; ctx.fillRect(x - 14, y - 20, 6, 6); ctx.fillStyle = PAL.magenta; ctx.fillRect(x + 8, y - 20, 6, 6);
    ctx.fillStyle = PAL.crema; ctx.fillRect(x - 4, y - 66 - b, 8, 6);
  }

  function dibujarConsumible(c) {
    if (c.vida < 3 && Math.floor(reloj * 10) % 2) return; // parpadea antes de desaparecer
    const def = CONSUMIBLES[c.tipo], x = Math.round(c.x), y = Math.round(c.y + (c.cae ? 0 : Math.sin(reloj * 3 + c.x) * 4));
    // burbuja con brillo
    ctx.globalAlpha = 0.25 + Math.abs(Math.sin(reloj * 4)) * 0.2; ctx.fillStyle = def.color; ctx.fillRect(x - 15, y - 15, 30, 30); ctx.globalAlpha = 1;
    ctx.fillStyle = PAL.negro; ctx.fillRect(x - 13, y - 12, 26, 24); ctx.fillRect(x - 12, y - 13, 24, 26);
    ctx.fillStyle = def.color; ctx.fillRect(x - 11, y - 11, 22, 22);
    ctx.fillStyle = PAL.negro; ctx.fillRect(x - 9, y - 9, 18, 18);
    const f = (c2, a, b, w, h) => { ctx.fillStyle = c2; ctx.fillRect(x + a, y + b, w, h); };
    switch (c.tipo) {
      case "vida": f(PAL.blanco, -5, -4, 10, 10); f(PAL.rojo, -5, -1, 10, 3); f(PAL.rojo, -6, -6, 12, 3); f(PAL.blanco, 1, -9, 2, 4); break;
      case "escudo": f(PAL.blanco, -6, 0, 12, 5); f(PAL.blanco, -4, -4, 8, 4); f(PAL.blanco, -2, -7, 4, 3); f(PAL.crema, -6, 4, 12, 2); break;
      case "triple": f(PAL.oro, -7, -6, 3, 12); f(PAL.oro, -1, -7, 3, 14); f(PAL.oro, 5, -6, 3, 12); f(PAL.rojo, -1, -3, 3, 2); break;
      case "tele": f(PAL.cian, -7, -1, 14, 2); f(PAL.cian, -1, -7, 2, 14); f(PAL.blanco, -2, -2, 4, 4); f(PAL.cian, -6, -6, 3, 3); f(PAL.cian, 3, 3, 3, 3); break;
      case "turbo": f(PAL.rosa, 0, -8, 4, 6); f(PAL.rosa, -3, -3, 8, 3); f(PAL.rosa, -4, 0, 4, 7); break;
      case "super": f(PAL.magenta, -5, -7, 10, 14); f(PAL.blanco, -3, -5, 6, 2); f(PAL.rosa, -3, 1, 6, 4); break;
    }
  }

  function dibujarHUD() {
    if (!p || estado === "titulo") return;
    // HP al estilo cartucho
    const hpCol = p.hp <= 1 ? (Math.floor(reloj * 6) % 2 ? PAL.rojo : PAL.blanco) : PAL.crema;
    ctx.fillStyle = PAL.negro; ctx.fillRect(12, H - 34, 64, 24);
    ctx.fillStyle = hpCol; ctx.fillRect(14, H - 32, 60, 20);
    ctx.font = `10px ${FUENTE}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = PAL.negro;
    ctx.fillText(p.hp > 0 ? `HP ${p.hp}` : "MUERTO", 44, H - 21);
    if (p.escudo) { ctx.strokeStyle = PAL.blanco; ctx.lineWidth = 2; ctx.strokeRect(11, H - 35, 66, 26); }
    // Cartas de súper
    for (let i = 0; i < 5; i++) {
      const lleno = Math.max(0, Math.min(1, p.cartas - i)), x = 86 + i * 14, y = H - 32;
      ctx.fillStyle = PAL.negro; ctx.fillRect(x - 1, y - 1, 12, 22);
      ctx.fillStyle = "#3a3446"; ctx.fillRect(x, y, 10, 20);
      ctx.fillStyle = lleno >= 1 ? (Math.floor(reloj * 4 + i) % 2 ? PAL.rosa : PAL.rojo) : PAL.rojo;
      const hh = Math.round(20 * lleno); ctx.fillRect(x, y + 20 - hh, 10, hh);
    }
    if (p.cartas >= 1) texto("V = SÚPER", 120, H - 44, 8, PAL.rosa);
    // Escudo y potenciador activo
    if (p.escudo) { ctx.fillStyle = PAL.negro; ctx.fillRect(160, H - 34, 24, 24); ctx.fillStyle = PAL.blanco; ctx.fillRect(162, H - 32, 20, 20); ctx.fillStyle = PAL.negro; ctx.fillRect(166, H - 24, 12, 8); }
    if (p.arma) {
      const def = CONSUMIBLES[p.arma], x = p.escudo ? 192 : 162, k = p.armaT / def.dur;
      ctx.fillStyle = PAL.negro; ctx.fillRect(x, H - 34, 124, 24);
      ctx.fillStyle = "#2a2433"; ctx.fillRect(x + 2, H - 32, 120, 20);
      ctx.fillStyle = def.color; ctx.fillRect(x + 2, H - 32, Math.round(120 * k), 20);
      ctx.font = `7px ${FUENTE}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = PAL.negro;
      ctx.fillText(def.nombre.replace("PAJITA ", ""), x + 62, H - 21);
    }
    texto(DIFS[dif].nombre, W - 14, H - 20, 8, PAL.grisC, "right");
    texto(`${monedas.filter(m => m.ok).length}/3 ◉`, W - 14, 18, 10, PAL.oro, "right");
  }

  function dibujarBanner() {
    if (!banner) return;
    const k = banner.t / banner.dur;
    const esc = k < 0.15 ? 0.4 + (k / 0.15) * 0.7 : k > 0.85 ? 1.1 - (k - 0.85) / 0.15 * 0.2 : 1.1 - (k - 0.15) * 0.1;
    ctx.save(); ctx.translate(W / 2, H / 2 - 20); ctx.scale(esc, esc);
    ctx.globalAlpha = k > 0.85 ? 1 - (k - 0.85) / 0.15 : 1;
    texto(banner.texto, 0, 0, banner.texto.length > 10 ? 26 : 38, banner.color);
    if (banner.sub) texto(banner.sub, 0, 46, 16, PAL.blanco);
    ctx.restore();
  }

  // Post-proceso: grano de película, líneas CRT, viñeta y parpadeo
  const granos = [];
  function prepararPost() {
    for (let n = 0; n < 4; n++) {
      const c = document.createElement("canvas"); c.width = W / 2; c.height = H / 2;
      const x = c.getContext("2d"), d = x.createImageData(c.width, c.height);
      for (let i = 0; i < d.data.length; i += 4) {
        const v = Math.random() < 0.5 ? 0 : 255, a = Math.random() < 0.85 ? 0 : Math.random() * 38;
        d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = a;
      }
      x.putImageData(d, 0, 0);
      // rayas verticales de película
      x.fillStyle = "rgba(255,255,255,.08)"; x.fillRect(Math.random() * c.width, 0, 1, c.height);
      granos.push(c);
    }
    const lin = document.createElement("canvas"); lin.width = W; lin.height = H; const lx = lin.getContext("2d");
    lx.fillStyle = "rgba(0,0,0,.16)"; for (let y = 0; y < H; y += 2) lx.fillRect(0, y, W, 1);
    const g = lx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.62);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.65)"); lx.fillStyle = g; lx.fillRect(0, 0, W, H);
    A.post = lin;
  }
  function dibujarPost() {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(granos[Math.floor(reloj * 24) % granos.length], 0, 0, W, H);
    ctx.drawImage(A.post, 0, 0);
    ctx.fillStyle = `rgba(30,15,10,${0.04 + Math.random() * 0.04})`; ctx.fillRect(0, 0, W, H);
    if (flashPantalla > 0) { ctx.fillStyle = `rgba(255,250,240,${Math.min(0.6, flashPantalla * 5)})`; ctx.fillRect(0, 0, W, H); }
  }

  function dibujarTitulo() {
    dibujarFondo();
    ctx.fillStyle = PAL.negro; ctx.fillRect(0, SUELO, W, H - SUELO);
    ctx.fillStyle = PAL.rojo; ctx.fillRect(0, SUELO, W, 6);
    sprite(A.heroe, 120, SUELO + 2 + Math.round(Math.sin(reloj * 4) * 2), false, 1);
    spriteGlitch(A.jefe, 530, SUELO + 4, true, 0.6, 1, 1);
  }

  let previo = performance.now();
  function bucle(ahora) {
    const dt = Math.min(1 / 30, (ahora - previo) / 1000); previo = ahora;
    if (estado === "titulo") { reloj += dt; }
    else actualizar(dt);
    ctx.save();
    if (temblor > 0) ctx.translate(Math.round((Math.random() - 0.5) * temblor), Math.round((Math.random() - 0.5) * temblor));
    if (estado === "titulo") dibujarTitulo();
    else { dibujarFondo(); dibujarMundo(); }
    ctx.restore();
    dibujarHUD(); dibujarBanner(); dibujarPost();
    P = {};
    requestAnimationFrame(bucle);
  }

  /* ---------------- Arranque ---------------- */
  Promise.all([cargar("sprites/heroe.png"), cargar("sprites/alter-ego.png"), cargar("sprites/alter-ego-mini.png")]).then(([h, j, m]) => {
    A.heroe = h; A.jefe = j; A.mini = m;
    A.heroeBlanco = tintar(h, PAL.blanco); A.jefeBlanco = tintar(j, PAL.blanco); A.miniBlanco = tintar(m, PAL.blanco);
    A.jefeCian = tintar(j, PAL.cian); A.jefeMag = tintar(j, PAL.magenta); A.miniCian = tintar(m, PAL.cian); A.miniMag = tintar(m, PAL.magenta);
    prepararPost();
    estado = "titulo"; mostrarMenu("titulo");
    requestAnimationFrame(bucle);
  });
  // Ganchos para pruebas
  window.__dia1 = { get estado() { return estado; }, get p() { return p; }, get jefe() { return jefe; }, reiniciar, empezarJefe: () => { p.x = AX + 120; empezarJefe(); } };
})();
