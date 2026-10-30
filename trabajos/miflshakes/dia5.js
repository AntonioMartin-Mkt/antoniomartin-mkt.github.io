/* =============================================================
   SHAKE WEEK · DÍA 5 — «DUELO FINAL»
   Juego de lucha 1 vs 1 al estilo de los arcades de los 90:
   Miflshakes contra el Alter Ego. Al mejor de 3 rondas.
   ============================================================= */
(() => {
  "use strict";
  const { W, H, PAL, FUENTE, cargar, tintar, Sonido, texto, crearPost, dibujarCartel, guardarDia, leerPref, guardarPref, nota } = window.SW;
  const cv = document.getElementById("juego"), ctx = cv.getContext("2d");
  cv.width = W; cv.height = H; ctx.imageSmoothingEnabled = false;
  const SUELO = 304, MIN_X = 46, MAX_X = W - 46, TIEMPO_RONDA = 60;

  /* ---------------- Golpes ----------------
     arranque → activo → recuperación (segundos) · dmg = daño · alc = alcance desde el centro
     y = altura del golpe sobre los pies · alto: false = se esquiva agachado                    */
  const GOLPES = {
    puno:     { nombre: "PUÑO",     arr: 0.06, act: 0.08, rec: 0.14, dmg: 5,  alc: 64, y: 72, h: 22, stun: 0.28, emp: 140, tipo: "puno" },
    patada:   { nombre: "PATADA",   arr: 0.12, act: 0.10, rec: 0.22, dmg: 8,  alc: 82, y: 40, h: 26, stun: 0.34, emp: 200, tipo: "patada" },
    barrida:  { nombre: "BARRIDA",  arr: 0.12, act: 0.12, rec: 0.30, dmg: 7,  alc: 86, y: 10, h: 18, stun: 0.5,  emp: 120, tipo: "barrida", derriba: true },
    aerea:    { nombre: "PATADA AÉREA", arr: 0.06, act: 0.30, rec: 0.05, dmg: 9, alc: 66, y: 34, h: 40, stun: 0.36, emp: 160, tipo: "aerea" },
    gancho:   { nombre: "PAJITAZO", arr: 0.08, act: 0.22, rec: 0.32, dmg: 12, alc: 50, y: 110, h: 90, stun: 0.6, emp: 160, tipo: "gancho", derriba: true, invencible: 0.16 },
    especial: { nombre: "SHAKE-KEN", arr: 0.22, act: 0.02, rec: 0.32, dmg: 10, tipo: "proyectil" },
    super:    { nombre: "SÚPER",    arr: 0.5,  act: 0.6,  rec: 0.4,  dmg: 30, tipo: "super" }
  };
  const DIFS = {
    facil:  { nombre: "FÁCIL",  reaccion: 0.45, bloqueo: 0.3, danoIA: 0.75, danoJug: 1.1, agresion: 0.7 },
    normal: { nombre: "NORMAL", reaccion: 0.26, bloqueo: 0.55, danoIA: 1.0, danoJug: 1.0,  agresion: 0.95 }
  };
  let dif = leerPref("shakeweek-dia5", "facil"); if (!DIFS[dif]) dif = "facil";
  const D = () => DIFS[dif];

  /* ---------------- Entrada ---------------- */
  const K = { izq: 0, der: 0, arr: 0, abj: 0, puno: 0, patada: 0, especial: 0, super: 0 };
  let P = {};
  const MAPA = {
    ArrowLeft: "izq", KeyA: "izq", ArrowRight: "der", KeyD: "der", ArrowUp: "arr", KeyW: "arr", ArrowDown: "abj", KeyS: "abj",
    KeyZ: "puno", KeyJ: "puno", KeyX: "patada", KeyK: "patada", KeyC: "especial", KeyL: "especial", KeyV: "super", KeyE: "super", Space: "super"
  };
  addEventListener("keydown", e => {
    const k = MAPA[e.code];
    if (k) { e.preventDefault(); if (!K[k]) P[k] = 1; K[k] = 1; Sonido.iniciar(); }
    if (e.code === "Enter") { e.preventDefault(); const p = menu.querySelector(".principal"); if (p) p.click(); }
    if (e.code === "Escape" || e.code === "KeyP") pausar();
    if (e.code === "KeyM") Sonido.alternar();
  });
  addEventListener("keyup", e => { const k = MAPA[e.code]; if (k) K[k] = 0; });
  addEventListener("blur", () => { for (const k in K) K[k] = 0; if (estado === "pelea") pausar(); });
  document.querySelectorAll("[data-k]").forEach(b => {
    const k = b.dataset.k;
    const on = e => { e.preventDefault(); Sonido.iniciar(); if (!K[k]) P[k] = 1; K[k] = 1; b.classList.add("on"); };
    const off = e => { e.preventDefault(); K[k] = 0; b.classList.remove("on"); };
    b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointerleave", off); b.addEventListener("pointercancel", off);
  });
  const pul = k => { if (P[k]) { P[k] = 0; return true; } return false; };

  /* ---------------- Sonido ---------------- */
  const sfx = {
    aire: () => Sonido.ruido(0.06, 0.05, 2500),
    golpe: f => { Sonido.ruido(0.12, 0.2 + f * 0.1, 1400); Sonido.tono(220, 90, 0.12, "square", 0.08 + f * 0.04); },
    fuerte: () => { Sonido.ruido(0.25, 0.35, 900); Sonido.tono(160, 40, 0.3, "sawtooth", 0.15); },
    bloqueo: () => Sonido.tono(1400, 900, 0.06, "triangle", 0.1),
    especial: () => { Sonido.tono(300, 1200, 0.25, "square", 0.1); Sonido.ruido(0.25, 0.1, 4000); },
    glitch: () => { for (let i = 0; i < 6; i++) Sonido.tono(200 + Math.random() * 1800, 90 + Math.random() * 900, 0.06, "sawtooth", 0.05, i * 0.04); },
    salto: () => Sonido.tono(260, 520, 0.1, "square", 0.05),
    suelo: () => { Sonido.ruido(0.3, 0.3, 500); Sonido.tono(100, 40, 0.3, "sine", 0.3); },
    super: () => { [262, 330, 392, 523, 659, 784].forEach((f, i) => Sonido.tono(f, f, 0.1, "square", 0.08, i * 0.05)); Sonido.ruido(0.9, 0.25, 3000); },
    ko: () => { Sonido.ruido(1.2, 0.4, 700); [392, 311, 262, 196].forEach((f, i) => Sonido.tono(f, f, 0.3, "square", 0.1, 0.3 + i * 0.18)); },
    anuncio: () => [523, 659, 784].forEach((f, i) => Sonido.tono(f, f, 0.12, "square", 0.08, i * 0.1)),
    victoria: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => Sonido.tono(f, f, 0.16, "square", 0.08, i * 0.13))
  };
  const CANCION = {
    tempo: 168, swing: false, bateria: true,
    bajo: [[45, 45, 57, 45], [45, 45, 55, 45], [41, 41, 53, 41], [43, 43, 55, 52]],
    acordes: [[69, 72, 76], [67, 71, 74], [65, 69, 72], [64, 68, 71]],
    melodia: [81, 0, 79, 81, 0, 76, 74, 76, 79, 0, 76, 74, 72, 0, 71, 72, 77, 0, 76, 74, 72, 74, 76, 77, 76, 0, 74, 72, 71, 0, 68, 0]
  };

  /* ---------------- Luchadores ---------------- */
  const A = {};
  function nuevoLuchador(esIA) {
    return {
      ia: esIA, nombre: esIA ? "ALTER EGO" : "MIFLSHAKES", x: esIA ? 460 : 180, y: SUELO, vx: 0, vy: 0, lado: esIA ? -1 : 1,
      hp: 100, hpVis: 100, meter: 0, estado: "quieto", t: 0, golpe: null, stun: 0, inv: 0, flash: 0, agachado: false,
      bloqueando: false, golpeYaDado: false, combo: 0, comboMax: 0, decision: 0, plan: null, anim: Math.random() * 5, enAire: false
    };
  }
  let jug, ia, proys = [], parts = [], chispas = [], textos = [], banner = null, rayo = null;
  let estado = "cargando", reloj = 0, tiempo = TIEMPO_RONDA, ronda = 1, victorias = [0, 0], hitstop = 0, temblor = 0, flash = 0, oscuro = 0;
  let stats = { perfectos: 0, comboMax: 0, golpes: 0, tiempoTotal: 0 }, transicion = 0;
  let post;

  const oponente = f => f === jug ? ia : jug;
  const enSuelo = f => f.y >= SUELO - 0.5;
  const libre = f => (f.estado === "quieto" || f.estado === "andar" || f.estado === "agachado" || f.estado === "salto") && f.stun <= 0;

  function empezarAtaque(f, nombre) {
    const g = GOLPES[nombre];
    if (nombre === "super") { if (f.meter < 100) return false; f.meter = 0; }
    if (nombre === "especial" && proys.some(p => p.duenio === f)) return false;
    f.estado = "ataque"; f.golpe = { ...g, clave: nombre, t: 0 }; f.golpeYaDado = false; f.agachado = nombre === "barrida";
    if (nombre === "gancho") { f.vy = -560; f.vx = f.lado * 60; f.inv = g.invencible; }
    if (nombre === "super") { oscuro = 1.2; sfx.super(); banner = { texto: f.ia ? "¡PANTALLAZO AZUL!" : "¡BATIDO SUPREMO!", t: 0, dur: 1.1, tam: 18, color: f.ia ? PAL.cian : PAL.rosa }; hitstop = 0.35; }
    else if (nombre === "especial") sfx.especial(); else sfx.aire();
    return true;
  }

  // Mueve a un luchador (jugador o IA) a partir de unas «intenciones»
  function controlar(f, int, dt) {
    const op = oponente(f);
    if (enSuelo(f) && f.estado !== "ataque" && f.estado !== "caido") f.lado = op.x > f.x ? 1 : -1;
    const atras = (f.lado > 0 && int.izq) || (f.lado < 0 && int.der);
    // se bloquea manteniendo «atrás» en el suelo (también mientras dura el aturdimiento del bloqueo)
    f.bloqueando = atras && enSuelo(f) && (libre(f) || f.estado === "bloqueo") && !int.puno && !int.patada && !int.especial;
    if (f.estado === "bloqueo") f.agachado = !!int.abj;
    if (!libre(f)) return;
    if (enSuelo(f)) {
      f.agachado = !!int.abj;
      if (int.super && f.meter >= 100) return empezarAtaque(f, "super");
      if (int.especial) return empezarAtaque(f, int.arr ? "gancho" : "especial");
      if (int.patada) return empezarAtaque(f, f.agachado ? "barrida" : "patada");
      if (int.puno) return empezarAtaque(f, "puno");
      if (int.arr) { f.vy = -640; f.vx = (int.der ? 1 : int.izq ? -1 : 0) * 175; f.estado = "salto"; f.agachado = false; sfx.salto(); return; }
      if (f.agachado) { f.vx = 0; f.estado = "agachado"; return; }
      const dir = (int.der ? 1 : 0) - (int.izq ? 1 : 0);
      f.vx = dir * (dir === f.lado ? 155 : 120); f.estado = dir ? "andar" : "quieto";
    } else if (int.patada || int.puno) empezarAtaque(f, "aerea");
  }

  function actualizarLuchador(f, dt) {
    const op = oponente(f);
    f.t += dt; f.anim += dt; f.stun -= dt; f.inv -= dt; f.flash -= dt;
    f.hpVis += (f.hp - f.hpVis) * Math.min(1, dt * (f.hpVis > f.hp + 0.5 ? 2.2 : 10));
    // Gravedad y movimiento
    if (!enSuelo(f) || f.vy < 0) { f.vy += 1900 * dt; f.y += f.vy * dt; }
    if (f.y >= SUELO) {
      if (f.vy > 600 && (f.estado === "caido" || f.estado === "ko")) { sfx.suelo(); temblor = 5; particulas(f.x, SUELO, [PAL.crema], 10, 140); }
      f.y = SUELO; f.vy = 0;
      if (f.estado === "salto") f.estado = "quieto";
      if (f.estado === "ataque" && f.golpe.clave === "aerea") { f.estado = "quieto"; f.golpe = null; }
    }
    f.x += f.vx * dt;
    if (f.estado === "golpe" || f.estado === "caido" || f.estado === "ko") f.vx *= Math.pow(0.02, dt);
    else if (f.estado === "ataque" && enSuelo(f) && f.golpe?.clave !== "gancho") f.vx *= Math.pow(0.001, dt);
    f.x = Math.max(MIN_X, Math.min(MAX_X, f.x));

    // Estados con tiempo
    if (f.estado === "golpe" && f.stun <= 0) f.estado = "quieto";
    if (f.estado === "bloqueo" && f.stun <= 0) f.estado = "quieto";
    if (f.estado === "caido" && f.stun <= 0 && enSuelo(f)) { f.estado = "quieto"; f.inv = 0.5; }
    if (f.estado === "ataque") {
      const g = f.golpe; g.t += dt;
      const fin = g.arr + g.act + g.rec;
      if (g.t >= g.arr && g.t < g.arr + g.act && !f.golpeYaDado) golpear(f, op, g);
      if (g.t >= fin && (enSuelo(f) || g.clave !== "aerea")) { f.estado = "quieto"; f.golpe = null; f.agachado = false; }
    }
  }

  function cajaCuerpo(f) {
    if (f.estado === "caido" || f.estado === "ko") return { x: f.x - 50, y: f.y - 30, w: 100, h: 30 };
    const alto = f.agachado ? 66 : 100;
    return { x: f.x - 24, y: f.y - alto, w: 48, h: alto };
  }
  const choca = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  function golpear(f, op, g) {
    if (g.tipo === "proyectil") {
      f.golpeYaDado = true;
      proys.push({ duenio: f, x: f.x + f.lado * 40, y: f.y - 66, vx: f.lado * 330, t: 0, dmg: g.dmg });
      return;
    }
    if (g.tipo === "super") {
      f.golpeYaDado = true;
      rayo = { duenio: f, t: 0.6, y: f.y - 60, dir: f.lado, x: f.x };
      temblor = 12; flash = 0.15;
      if (op.inv <= 0 && !(op.estado === "caido")) recibir(op, f, { ...g, emp: 420, stun: 0.8, derriba: true }, 1.4);
      return;
    }
    const caja = { x: g.alc > 0 ? Math.min(f.x, f.x + f.lado * g.alc) : f.x - 20, y: f.y - g.y - g.h / 2, w: Math.abs(g.alc), h: g.h };
    if (g.tipo === "gancho") { caja.x = f.x + (f.lado > 0 ? 0 : -50); caja.w = 50; caja.y = f.y - 140; caja.h = 140; }
    if (op.inv > 0 || op.estado === "caido" || op.estado === "ko") return;
    if (!choca(caja, cajaCuerpo(op))) return;
    f.golpeYaDado = true;
    recibir(op, f, g, 1);
  }

  function recibir(op, f, g, mult) {
    if (estado !== "pelea") return;
    const bloquea = op.bloqueando && enSuelo(op) && (g.tipo !== "barrida" || op.agachado);
    const multDif = f.ia ? D().danoIA : D().danoJug;
    const yImpacto = op.y - (op.agachado ? 45 : 70);
    if (bloquea) {
      const chip = g.tipo === "proyectil" || g.tipo === "super" ? g.dmg * 0.18 * multDif : 0;
      op.hp = Math.max(1, op.hp - chip); op.estado = "bloqueo"; op.stun = 0.18; op.vx = f.lado * g.emp * 0.6 || f.lado * 120;
      hitstop = 0.05; sfx.bloqueo(); chispas.push({ x: op.x - f.lado * 22, y: yImpacto, t: 0.18, c: PAL.cian, bloqueo: true });
      f.meter = Math.min(100, f.meter + 3); op.meter = Math.min(100, op.meter + 4);
      return;
    }
    const enCombo = op.estado === "golpe" || op.estado === "caido";
    op.combo = enCombo ? op.combo + 1 : 1;
    const dmg = g.dmg * mult * multDif * (op.combo > 1 ? 0.85 : 1);
    op.hp = Math.max(0, op.hp - dmg);
    op.flash = 0.1; op.vx = f.lado * (g.emp || 160);
    f.meter = Math.min(100, f.meter + dmg * 1.4); op.meter = Math.min(100, op.meter + dmg * 0.7);
    if (!f.ia) { stats.golpes++; if (op.combo > stats.comboMax) stats.comboMax = op.combo; }
    if (op.combo >= 2) textos.push({ t: `${op.combo} GOLPES`, x: f.ia ? W - 100 : 100, y: 110, vida: 1, c: f.ia ? PAL.cian : PAL.oro });
    const fuerte = g.derriba || dmg >= 9;
    hitstop = fuerte ? 0.13 : 0.07; temblor = fuerte ? 8 : 4;
    fuerte ? sfx.fuerte() : sfx.golpe(dmg / 10);
    chispas.push({ x: op.x - f.lado * 18, y: g.tipo === "barrida" ? op.y - 12 : yImpacto, t: 0.2, c: f.ia ? PAL.magenta : PAL.oro });
    particulas(op.x - f.lado * 14, yImpacto, f.ia ? [PAL.cian, PAL.magenta, PAL.blanco] : [PAL.rosa, PAL.blanco, PAL.rojo], 10, 220);
    if (op.hp <= 0) { op.estado = "ko"; op.vy = -420; op.vx = f.lado * 260; op.agachado = false; noquear(f, op); return; }
    if (g.derriba || !enSuelo(op)) { op.estado = "caido"; op.stun = 1.0; op.vy = -380; op.agachado = false; op.golpe = null; }
    else { op.estado = "golpe"; op.stun = g.stun; op.golpe = null; }
  }

  function actualizarProyectiles(dt) {
    for (const p of proys) {
      p.t += dt; p.x += p.vx * dt;
      const op = oponente(p.duenio);
      const caja = { x: p.x - 14, y: p.y - 14, w: 28, h: 28 };
      if (op.inv <= 0 && op.estado !== "caido" && op.estado !== "ko" && choca(caja, cajaCuerpo(op))) {
        p.fuera = true; recibir(op, p.duenio, { ...GOLPES.especial, emp: 220, stun: 0.4 }, 1);
      }
      for (const q of proys) if (q !== p && q.duenio !== p.duenio && Math.abs(q.x - p.x) < 24) { p.fuera = q.fuera = true; particulas(p.x, p.y, [PAL.rosa, PAL.cian, PAL.blanco], 18, 200); sfx.bloqueo(); }
      if (p.x < -40 || p.x > W + 40) p.fuera = true;
    }
    proys = proys.filter(p => !p.fuera);
  }

  /* ---------------- IA del Alter Ego ---------------- */
  function pensarIA(dt) {
    const f = ia, op = jug, d = Math.abs(op.x - f.x), dif2 = D();
    f.decision -= dt;
    const int = { izq: 0, der: 0, arr: 0, abj: 0, puno: 0, patada: 0, especial: 0, super: 0 };
    const haciaJug = op.x > f.x ? "der" : "izq", lejos = op.x > f.x ? "izq" : "der";
    // Reacción defensiva: bloquear si le van a pegar (con retraso según dificultad)
    const amenaza = (op.estado === "ataque" && d < 110) || proys.some(p => p.duenio === op && Math.abs(p.x - f.x) < 140 && Math.sign(p.vx) === Math.sign(f.x - p.x));
    if (amenaza && f.plan?.tipo !== "bloquear" && f.decision <= dif2.reaccion * 0.5) {
      const r = Math.random();
      if (r < dif2.bloqueo) f.plan = { tipo: "bloquear", t: 0.45 };
      else if (r < dif2.bloqueo + 0.15 && proys.some(p => p.duenio === op)) f.plan = { tipo: "saltar" };
      f.decision = dif2.reaccion;
    }
    if (f.decision <= 0 && (!f.plan || f.plan.t <= 0)) {
      f.decision = dif2.reaccion * (0.7 + Math.random() * 0.6);
      const r = Math.random();
      if (f.meter >= 100 && d < 320 && r < 0.35) f.plan = { tipo: "super" };
      else if (d > 230) f.plan = r < 0.3 ? { tipo: "especial" } : r < 0.45 ? { tipo: "teleport" } : { tipo: "avanzar", t: 0.5 };
      else if (d > 100) f.plan = r < 0.4 * dif2.agresion ? { tipo: "saltoAtaque", t: 1.4 } : r < 0.6 ? { tipo: "avanzar", t: 0.35 } : r < 0.75 ? { tipo: "patada" } : r < 0.85 ? { tipo: "especial" } : { tipo: "esperar", t: 0.3 };
      else f.plan = r < 0.35 * dif2.agresion + 0.1 ? { tipo: "puno" } : r < 0.55 ? { tipo: "patada" } : r < 0.67 ? { tipo: "barrida" } : r < 0.75 && op.estado === "salto" ? { tipo: "gancho" } : r < 0.88 ? { tipo: "retroceder", t: 0.3 } : { tipo: "bloquear", t: 0.4 };
    }
    const pl = f.plan;
    if (pl) {
      if (pl.t !== undefined) pl.t -= dt;
      switch (pl.tipo) {
        case "avanzar": int[haciaJug] = 1; break;
        case "retroceder": int[lejos] = 1; break;
        case "bloquear": int[lejos] = 1; if (op.estado === "ataque" && op.golpe?.clave === "barrida") int.abj = 1; break;
        case "puno": int.puno = 1; f.plan = null; break;
        case "patada": int.patada = 1; f.plan = null; break;
        case "barrida": int.abj = 1; int.patada = 1; f.plan = null; break;
        case "especial": int.especial = 1; f.plan = null; break;
        case "gancho": int.especial = 1; int.arr = 1; f.plan = null; break;
        case "super": int.super = 1; f.plan = null; break;
        case "saltar": int.arr = 1; int[haciaJug] = 1; f.plan = null; break;
        case "saltoAtaque":
          if (enSuelo(f) && libre(f)) { int.arr = 1; int[haciaJug] = 1; pl.saltado = true; }
          else if (!enSuelo(f) && Math.abs(op.x - f.x) < 90 && f.vy > -200) { int.patada = 1; f.plan = null; }
          if (pl.saltado && enSuelo(f) && f.t > 0.5) f.plan = null;
          break;
        case "teleport":
          if (libre(f) && enSuelo(f)) {
            sfx.glitch(); particulas(f.x, f.y - 50, [PAL.cian, PAL.magenta, PAL.verde], 20, 200);
            f.x = Math.max(MIN_X, Math.min(MAX_X, op.x + (op.x > W / 2 ? -110 : 110))); f.flash = 0.2; f.glitchT = 0.4;
            particulas(f.x, f.y - 50, [PAL.cian, PAL.magenta, PAL.verde], 20, 200);
          }
          f.plan = { tipo: "esperar", t: 0.25 }; break;
        case "esperar": break;
      }
      if (pl.t !== undefined && pl.t <= 0 && f.plan === pl) f.plan = null;
    }
    return int;
  }

  /* ---------------- Rondas ---------------- */
  function empezarCombate() {
    victorias = [0, 0]; ronda = 1; stats = { perfectos: 0, comboMax: 0, golpes: 0, tiempoTotal: 0 };
    empezarRonda(); Sonido.empezarMusica(CANCION);
  }
  function empezarRonda() {
    jug = nuevoLuchador(false); ia = nuevoLuchador(true);
    proys = []; parts = []; chispas = []; textos = []; rayo = null; tiempo = TIEMPO_RONDA;
    estado = "presentacion"; transicion = 0; ocultarMenu();
    banner = { texto: ronda === 3 ? "RONDA FINAL" : `RONDA ${ronda}`, t: 0, dur: 1.3, alAcabar: () => { banner = { texto: "¡LUCHA!", t: 0, dur: 0.9, color: PAL.rosa }; sfx.anuncio(); estado = "pelea"; } };
    sfx.anuncio();
  }
  function noquear(ganador, perdedor) {
    estado = "ko"; transicion = 0; hitstop = 0.5; flash = 0.2; sfx.ko();
    victorias[ganador === jug ? 0 : 1]++;
    if (ganador.hp >= 100) { if (ganador === jug) stats.perfectos++; banner = { texto: "¡PERFECTO!", sub: "K.O.", t: 0, dur: 2.2, color: PAL.oro }; }
    else banner = { texto: "K.O.", t: 0, dur: 2.2, color: PAL.rojo, tam: 54 };
    stats.tiempoTotal += TIEMPO_RONDA - tiempo;
  }
  function finTiempo() {
    estado = "ko"; transicion = 0; sfx.ko();
    const gana = jug.hp >= ia.hp ? jug : ia;
    victorias[gana === jug ? 0 : 1]++;
    banner = { texto: "¡TIEMPO!", sub: gana === jug ? "GANAS POR VIDA" : "GANA EL ALTER EGO", t: 0, dur: 2.2, color: PAL.oro };
    stats.tiempoTotal += TIEMPO_RONDA;
  }
  function trasKO() {
    if (victorias[0] >= 2 || victorias[1] >= 2) {
      Sonido.pararMusica();
      if (victorias[0] >= 2) { sfx.victoria(); mostrarResultados(); } else mostrarMenu("derrota");
      estado = "fin";
    } else { ronda++; empezarRonda(); }
  }

  /* ---------------- Bucle ---------------- */
  function particulas(x, y, cols, n = 10, vel = 180) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = vel * (0.3 + Math.random() * 0.9);
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, t: 0.35 + Math.random() * 0.4, c: cols[i % cols.length], s: 2 + Math.floor(Math.random() * 3) });
    }
  }

  function actualizar(dt) {
    reloj += dt;
    if (banner) { banner.t += dt; if (banner.t > banner.dur) { const f = banner.alAcabar; banner = null; if (f) f(); } }
    parts = parts.filter(q => (q.t -= dt) > 0); parts.forEach(q => { q.vy += 500 * dt; q.x += q.vx * dt; q.y += q.vy * dt; });
    chispas = chispas.filter(c => (c.t -= dt) > 0);
    textos = textos.filter(q => (q.vida -= dt) > 0);
    temblor = Math.max(0, temblor - dt * 30); flash -= dt; oscuro -= dt;
    if (rayo) { rayo.t -= dt; if (rayo.t <= 0) rayo = null; }
    if (!jug) return;
    if (estado === "ko") {
      transicion += dt;
      const lento = transicion < 1.2 ? 0.3 : 1;
      actualizarLuchador(jug, dt * lento); actualizarLuchador(ia, dt * lento);
      const ganador = jug.estado === "ko" ? ia : jug;
      if (transicion > 1.4 && ganador.estado !== "ko") { ganador.estado = "victoria"; }
      if (transicion > 3.2) trasKO();
      return;
    }
    if (estado === "presentacion") { jug.anim += dt; ia.anim += dt; return; }
    if (estado !== "pelea") return;
    if (hitstop > 0) { hitstop -= dt; return; }
    tiempo -= dt; if (tiempo <= 0) { tiempo = 0; return finTiempo(); }

    const intJug = { izq: K.izq, der: K.der, arr: K.arr, abj: K.abj, puno: pul("puno"), patada: pul("patada"), especial: pul("especial"), super: pul("super") };
    controlar(jug, intJug, dt);
    controlar(ia, pensarIA(dt), dt);
    actualizarLuchador(jug, dt); actualizarLuchador(ia, dt);
    if (estado !== "pelea") return;
    // No se pueden atravesar
    const sep = 44, d = ia.x - jug.x;
    if (Math.abs(d) < sep && Math.abs(jug.y - ia.y) < 70 && jug.estado !== "caido" && ia.estado !== "caido") {
      const emp = (sep - Math.abs(d)) / 2 * (d >= 0 ? 1 : -1);
      jug.x -= emp; ia.x += emp;
      if (jug.x < MIN_X) { ia.x += MIN_X - jug.x; jug.x = MIN_X; } if (ia.x > MAX_X) { jug.x -= ia.x - MAX_X; ia.x = MAX_X; }
      if (ia.x < MIN_X) { jug.x += MIN_X - ia.x; ia.x = MIN_X; } if (jug.x > MAX_X) { ia.x -= jug.x - MAX_X; jug.x = MAX_X; }
    }
    actualizarProyectiles(dt);
    // el súper se carga poco a poco con el tiempo
    jug.meter = Math.min(100, jug.meter + dt * 1.5); ia.meter = Math.min(100, ia.meter + dt * 1.2);
  }

  /* ---------------- Dibujo ---------------- */
  function dibujarEscenario() {
    // Azotea de la fábrica Miflshakes de noche
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0e0a1e"); g.addColorStop(1, "#3a0f22");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = PAL.crema; ctx.beginPath(); ctx.arc(320, 96, 46, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#e9d7b8"; ctx.fillRect(300, 80, 10, 8); ctx.fillRect(334, 108, 12, 8);
    for (let i = 0; i < 14; i++) {
      const x = i * 48 - 8, h = 80 + (i * 53) % 90;
      ctx.fillStyle = "#1c0d22"; ctx.fillRect(x, SUELO - 40 - h, 44, h + 40);
      ctx.fillStyle = (Math.floor(reloj * 1.3 + i * 3) % 5) ? "#ffcf3a2a" : "#ffcf3a0c";
      for (let k = 0; k < 3; k++) for (let j = 0; j < 3; j++) ctx.fillRect(x + 6 + k * 13, SUELO - 30 - h + j * 18, 6, 8);
    }
    // público: clones y vasos mirando, en silueta
    for (let i = 0; i < 22; i++) {
      const x = 10 + i * 30, bote = Math.abs(Math.sin(reloj * 6 + i)) * (estado === "ko" ? 6 : 2);
      ctx.fillStyle = i % 3 === 0 ? "#2a1430" : "#22102a";
      ctx.fillRect(x, SUELO - 34 - bote, 18, 24); ctx.fillRect(x + 2, SUELO - 40 - bote, 14, 6); ctx.fillRect(x + 10, SUELO - 48 - bote, 2, 8);
    }
    // valla y cartel
    ctx.fillStyle = "#3a1226"; ctx.fillRect(0, SUELO - 14, W, 14);
    for (let x = 0; x < W; x += 24) { ctx.fillStyle = "#541a33"; ctx.fillRect(x, SUELO - 26, 4, 26); }
    const on = Math.floor(reloj * 2) % 11;
    ctx.fillStyle = "#1a0710"; ctx.fillRect(210, 160, 220, 34);
    ctx.strokeStyle = on ? PAL.rojo : "#5a0f1c"; ctx.lineWidth = 3; ctx.strokeRect(212, 162, 216, 30);
    texto(ctx, "MIFLSHAKES", 320, 178, 12, on ? PAL.rojo : "#5a0f1c", "center", "#1a0710");
    // suelo
    ctx.fillStyle = PAL.negro; ctx.fillRect(0, SUELO, W, H - SUELO);
    for (let x = 0; x < W; x += 24) for (let y = SUELO + 6; y < H; y += 24) if ((x / 24 + (y - SUELO - 6) / 24) % 2 === 0) { ctx.fillStyle = "#5a0f1c"; ctx.fillRect(x, y, 24, 24); }
    ctx.fillStyle = PAL.rojo; ctx.fillRect(0, SUELO, W, 5); ctx.fillStyle = PAL.crema; ctx.fillRect(0, SUELO + 5, W, 1);
  }

  function puño(x, y, f, grande = 1) {
    const s = Math.round(9 * grande);
    ctx.fillStyle = PAL.negro; ctx.fillRect(x - s - 1, y - s - 1, s * 2 + 2, s * 2 + 2);
    ctx.fillStyle = f.ia ? "#e8f8ff" : PAL.blanco; ctx.fillRect(x - s, y - s, s * 2, s * 2);
    ctx.fillStyle = f.ia ? PAL.cian : PAL.rojo; ctx.fillRect(x - s - (f.lado > 0 ? 4 : -2 * s), y - s, 4, s * 2);
    ctx.fillStyle = "#c9c2b6"; for (let i = 0; i < 3; i++) ctx.fillRect(x + f.lado * (s - 3), y - s + 3 + i * 5, 2, 3);
    if (f.ia) { ctx.fillStyle = PAL.magenta; ctx.fillRect(x - s + 2, y + s - 4, 4, 2); }
  }
  function zapatilla(x, y, f) {
    ctx.fillStyle = PAL.negro; ctx.fillRect(x - 15, y - 9, 30, 16);
    ctx.fillStyle = f.ia ? PAL.cian : PAL.rojo; ctx.fillRect(x - 13, y - 7, 26, 9);
    ctx.fillStyle = PAL.blanco; ctx.fillRect(x - 13, y + 2, 26, 4); ctx.fillRect(x - 6, y - 7, 4, 3);
    if (f.ia) { ctx.fillStyle = PAL.verde; ctx.fillRect(x + 4, y - 5, 4, 2); }
  }

  function dibujarLuchador(f) {
    let img = f.ia ? A.villano : A.heroe;
    if (f.flash > 0) img = f.ia ? A.villanoBlanco : A.heroeBlanco;
    const g = f.golpe, k = g ? g.t : 0;
    let sx = 1, sy = 1, rot = 0, dx = 0, dy = 0;
    const respira = Math.sin(f.anim * 4) * 0.02;
    switch (f.estado) {
      case "quieto": sy = 1 + respira; sx = 1 - respira; dy = 0; break;
      case "andar": dy = -Math.abs(Math.sin(f.anim * 12)) * 4; rot = f.vx / 2000; break;
      case "agachado": sy = 0.68; sx = 1.12; break;
      case "salto": rot = -f.lado * 0.12 + (f.vy > 0 ? f.lado * 0.1 : 0); sy = f.vy < 0 ? 1.08 : 0.96; break;
      case "golpe": rot = -f.lado * 0.18; dx = (Math.random() - 0.5) * 4; break;
      case "bloqueo": rot = -f.lado * 0.1; sx = 0.94; break;
      case "caido": case "ko": rot = -f.lado * (enSuelo(f) ? 1.45 : 0.9); dy = enSuelo(f) ? 14 : 0; break;
      case "victoria": dy = -Math.abs(Math.sin(f.anim * 6)) * 14; sy = 1 + Math.abs(Math.sin(f.anim * 6)) * 0.06; break;
      case "ataque":
        if (g.clave === "puno") { rot = f.lado * 0.14; dx = f.lado * 6; }
        if (g.clave === "patada") { rot = -f.lado * 0.22; }
        if (g.clave === "barrida") { sy = 0.62; sx = 1.15; rot = -f.lado * 0.12; }
        if (g.clave === "aerea") { rot = f.lado * 0.35; }
        if (g.clave === "gancho") { rot = f.lado * 0.1; sy = 1.1; }
        if (g.clave === "especial") { rot = f.lado * (k < g.arr ? -0.1 : 0.16); dx = f.lado * (k < g.arr ? -4 : 6); }
        if (g.clave === "super") { dy = -Math.sin(Math.min(1, k / g.arr) * Math.PI) * 10; sy = 1.05; }
        break;
    }
    if (f.agachado && f.estado !== "ataque") { sy = 0.68; sx = 1.12; }
    // sombra
    ctx.fillStyle = "rgba(0,0,0,.4)"; ctx.fillRect(Math.round(f.x - 34), SUELO - 2, 68, 4);
    ctx.save(); ctx.translate(Math.round(f.x + dx), Math.round(f.y + dy)); ctx.rotate(rot); ctx.scale(sx, sy);
    if (f.ia) { // efecto glitch del Alter Ego
      const off = 2 + (f.glitchT > 0 ? 6 : 0);
      ctx.globalAlpha = 0.45; ctx.drawImage(A.villanoCian, -img.width / 2 - off, -img.height); ctx.drawImage(A.villanoMag, -img.width / 2 + off, -img.height); ctx.globalAlpha = 1;
    }
    ctx.drawImage(img, -Math.round(img.width / 2), -img.height);
    if (f.ia && Math.random() < 0.25) { const sy2 = Math.random() * img.height, sh = 3 + Math.random() * 8; ctx.drawImage(img, 0, sy2, img.width, sh, -img.width / 2 + (Math.random() - 0.5) * 16, -img.height + sy2, img.width, sh); }
    ctx.restore();
    if (f.ia && f.glitchT > 0) f.glitchT -= 1 / 60;
    // brazos y piernas de los golpes
    if (f.estado === "ataque") {
      const activo = k >= g.arr && k < g.arr + g.act, ext = activo ? 1 : k < g.arr ? k / g.arr * 0.4 : Math.max(0, 1 - (k - g.arr - g.act) / g.rec) * 0.6;
      if (g.clave === "puno") puño(f.x + f.lado * (28 + ext * 34), f.y - 72, f);
      if (g.clave === "patada") zapatilla(f.x + f.lado * (26 + ext * 52), f.y - 40, f);
      if (g.clave === "barrida") zapatilla(f.x + f.lado * (30 + ext * 54), f.y - 8, f);
      if (g.clave === "aerea") zapatilla(f.x + f.lado * 40, f.y - 30, f);
      if (g.clave === "gancho") { puño(f.x + f.lado * 22, f.y - 100 - ext * 30, f, 1.15); if (activo) particulas(f.x + f.lado * 22, f.y - 110, f.ia ? [PAL.cian] : [PAL.rosa, PAL.blanco], 2, 80); }
      if (g.clave === "especial" && k < g.arr) { const r = 6 + k / g.arr * 10; ctx.fillStyle = f.ia ? PAL.cian : PAL.rosa; ctx.globalAlpha = 0.6; ctx.fillRect(f.x + f.lado * 40 - r, f.y - 66 - r, r * 2, r * 2); ctx.globalAlpha = 1; }
    }
    if (f.estado === "bloqueo" || (f.bloqueando && libre(f))) {
      ctx.globalAlpha = f.estado === "bloqueo" ? 0.8 : 0.25; ctx.fillStyle = PAL.cian;
      ctx.fillRect(f.x + f.lado * 26 - 2, f.y - (f.agachado ? 70 : 100), 4, f.agachado ? 66 : 96); ctx.globalAlpha = 1;
    }
  }

  function dibujarProyectil(p) {
    const x = Math.round(p.x), y = Math.round(p.y), ia2 = p.duenio.ia, gir = p.t * 18;
    for (let i = 1; i <= 4; i++) { ctx.globalAlpha = 0.5 - i * 0.1; ctx.fillStyle = ia2 ? PAL.cian : PAL.rosa; ctx.fillRect(x - Math.sign(p.vx) * i * 10 - 6, y - 6, 12, 12); }
    ctx.globalAlpha = 1;
    if (ia2) {
      for (let i = 0; i < 6; i++) { ctx.fillStyle = [PAL.cian, PAL.magenta, PAL.verde][i % 3]; ctx.fillRect(x - 12 + ((i * 7 + Math.floor(gir)) % 20), y - 12 + ((i * 11 + Math.floor(gir * 1.3)) % 20), 6, 6); }
      ctx.fillStyle = PAL.blanco; ctx.fillRect(x - 3, y - 3, 6, 6);
    } else {
      ctx.fillStyle = PAL.negro; ctx.fillRect(x - 14, y - 12, 28, 24);
      ctx.fillStyle = PAL.rosa; ctx.fillRect(x - 12, y - 10, 24, 20);
      ctx.fillStyle = PAL.blanco; ctx.fillRect(x - 12 + (Math.floor(gir) % 3) * 4, y - 4, 10, 4); ctx.fillRect(x - 4, y - 10 + (Math.floor(gir) % 3) * 3, 4, 8);
    }
  }

  function dibujarRayo() {
    if (!rayo) return;
    const ia2 = rayo.duenio.ia, x0 = rayo.dir > 0 ? rayo.x + 30 : 0, x1 = rayo.dir > 0 ? W : rayo.x - 30;
    for (let k = 0; k < 6; k++) {
      ctx.fillStyle = ia2 ? [PAL.azul, PAL.cian, PAL.blanco, "#1a3cff"][(k + Math.floor(reloj * 30)) % 4] : [PAL.rosa, PAL.blanco, PAL.rojo, PAL.crema][(k + Math.floor(reloj * 30)) % 4];
      ctx.fillRect(x0, rayo.y - 24 + k * 8 + (Math.random() < 0.3 ? 2 : 0), x1 - x0, 8);
    }
    if (ia2) for (let i = 0; i < 5; i++) texto(ctx, ":(", x0 + (x1 - x0) * (i + 0.5) / 5, rayo.y, 12, PAL.blanco, "center", PAL.azul);
  }

  function barraVida(f, x, alinear) {
    const w = 236, y = 18, h = 14;
    ctx.fillStyle = PAL.negro; ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    ctx.fillStyle = "#3a0f1c"; ctx.fillRect(x, y, w, h);
    const vis = Math.max(0, f.hpVis) / 100 * w, real = Math.max(0, f.hp) / 100 * w;
    const col = f.hp < 25 ? (Math.floor(reloj * 6) % 2 ? PAL.rojo : PAL.oro) : f.ia ? PAL.cian : PAL.oro;
    if (alinear === "izq") { ctx.fillStyle = PAL.rojo; ctx.fillRect(x + w - vis, y, vis, h); ctx.fillStyle = col; ctx.fillRect(x + w - real, y, real, h); }
    else { ctx.fillStyle = PAL.rojo; ctx.fillRect(x, y, vis, h); ctx.fillStyle = col; ctx.fillRect(x, y, real, h); }
    ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(x, y + 2, w, 2);
    texto(ctx, f.nombre, alinear === "izq" ? x : x + w, y + h + 11, 8, f.ia ? PAL.cian : PAL.crema, alinear === "izq" ? "left" : "right");
    // rondas ganadas
    const gan = victorias[f.ia ? 1 : 0];
    for (let i = 0; i < 2; i++) {
      const cx = alinear === "izq" ? x + w - 10 - i * 16 : x + 10 + i * 16;
      ctx.fillStyle = PAL.negro; ctx.fillRect(cx - 6, y + h + 5, 12, 12);
      ctx.fillStyle = i < gan ? PAL.oro : "#3a3446"; ctx.fillRect(cx - 4, y + h + 7, 8, 8);
    }
    // súper
    const sy = H - 22, sw = 150, sx = alinear === "izq" ? 14 : W - 14 - sw;
    ctx.fillStyle = PAL.negro; ctx.fillRect(sx - 2, sy - 2, sw + 4, 12);
    ctx.fillStyle = "#2a2433"; ctx.fillRect(sx, sy, sw, 8);
    const lleno = f.meter >= 100;
    ctx.fillStyle = lleno ? (Math.floor(reloj * 8) % 2 ? PAL.rosa : PAL.oro) : f.ia ? PAL.azul : PAL.rojo;
    ctx.fillRect(alinear === "izq" ? sx : sx + sw - sw * f.meter / 100, sy, sw * f.meter / 100, 8);
    texto(ctx, lleno ? (f.ia ? "SÚPER LISTO" : "SÚPER · V") : "SÚPER", alinear === "izq" ? sx : sx + sw, sy - 9, 7, lleno ? PAL.oro : PAL.grisC, alinear === "izq" ? "left" : "right");
  }

  function dibujarHUD() {
    barraVida(jug, 14, "izq"); barraVida(ia, W - 14 - 236, "der");
    ctx.fillStyle = PAL.negro; ctx.fillRect(W / 2 - 24, 10, 48, 34);
    ctx.strokeStyle = PAL.crema; ctx.lineWidth = 2; ctx.strokeRect(W / 2 - 23, 11, 46, 32);
    texto(ctx, String(Math.ceil(tiempo)).padStart(2, "0"), W / 2, 28, 16, tiempo < 10 ? PAL.rojo : PAL.crema, "center", null);
    textos.forEach(q => { ctx.globalAlpha = Math.min(1, q.vida * 2); texto(ctx, q.t, q.x, q.y, 10, q.c); ctx.globalAlpha = 1; });
  }

  function dibujar() {
    ctx.save();
    if (temblor > 0) ctx.translate(Math.round((Math.random() - 0.5) * temblor), Math.round((Math.random() - 0.5) * temblor));
    dibujarEscenario();
    if (oscuro > 0) { ctx.fillStyle = `rgba(0,0,0,${Math.min(0.65, oscuro)})`; ctx.fillRect(0, 0, W, H); }
    if (jug) {
      // el que ataca se dibuja delante
      const orden = jug.estado === "ataque" ? [ia, jug] : [jug, ia];
      orden.forEach(dibujarLuchador);
      proys.forEach(dibujarProyectil);
      dibujarRayo();
      chispas.forEach(c => {
        const s = c.bloqueo ? 10 : 16 * (1 - c.t / 0.2) + 6;
        ctx.fillStyle = c.c; ctx.fillRect(c.x - s, c.y - 2, s * 2, 4); ctx.fillRect(c.x - 2, c.y - s, 4, s * 2);
        ctx.fillStyle = PAL.blanco; ctx.fillRect(c.x - s / 2, c.y - s / 2, 4, 4); ctx.fillRect(c.x + s / 2 - 4, c.y + s / 2 - 4, 4, 4); ctx.fillRect(c.x - 3, c.y - 3, 6, 6);
      });
      parts.forEach(q => { ctx.globalAlpha = Math.min(1, q.t * 3); ctx.fillStyle = q.c; ctx.fillRect(Math.round(q.x), Math.round(q.y), q.s, q.s); });
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    if (jug && estado !== "titulo") dibujarHUD();
    dibujarCartel(ctx, banner, H / 2 - 30);
    post(ctx, reloj, flash);
  }

  /* ---------------- Menús ---------------- */
  const menu = document.getElementById("menu");
  function ocultarMenu() { menu.className = "menu"; menu.innerHTML = ""; }
  function mostrarMenu(tipo, datos = {}) {
    menu.className = "menu ver " + tipo;
    const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
    if (tipo === "titulo") {
      menu.innerHTML = `<div class="caja">
        <p class="pre">SHAKE WEEK · DÍA 5 · COMBATE FINAL</p>
        <h1>DUELO<br><span>FINAL</span></h1>
        <p class="hist">Se acabó esconderse. En la azotea de la fábrica, Miflshakes y el Alter Ego se enfrentan cara a cara. Gana 2 rondas y la Shake Week es tuya.</p>
        <div class="movs">
          <span><b>Z</b> puño</span><span><b>X</b> patada</span><span><b>↓ + X</b> barrida</span><span><b>X</b> en el aire: patada aérea</span>
          <span><b>C</b> Shake-ken (proyectil)</span><span><b>↑ + C</b> Pajitazo (gancho)</span><span><b>V</b> SÚPER: Batido Supremo</span><span><b>← atrás</b> bloquear</span>
        </div>
        <div class="eleccion"><span class="et">DIFICULTAD</span>
          ${Object.entries(DIFS).map(([k, d]) => `<button class="op ${k === dif ? "sel" : ""}" data-dif="${k}">${d.nombre}${k === "facil" ? " ★" : ""}</button>`).join("")}
        </div>
        <button class="b principal" data-accion="empezar">▶ ¡A LUCHAR!</button>
      </div>`;
    } else if (tipo === "derrota") {
      menu.innerHTML = `<div class="caja"><h2 class="rojo">¡EL ALTER EGO GANA!</h2>
        <p class="hist">Rondas: ${victorias[0]} - ${victorias[1]} · Combo máximo: ${stats.comboMax}<br>Consejo: bloquea yendo hacia atrás y castiga con el Pajitazo cuando salte.</p>
        <div class="fila"><button class="b principal" data-accion="empezar">↻ REVANCHA</button><a class="b" href="index.html">SALIR</a></div></div>`;
    } else if (tipo === "resultados") {
      menu.innerHTML = `<div class="caja tarjeta"><h2>¡HAS GANADO!</h2>
        <ul class="filas">
          <li><span>RONDAS</span><b>${victorias[0]} - ${victorias[1]}</b></li>
          <li><span>PERFECTOS</span><b>${stats.perfectos}</b></li>
          <li><span>COMBO MÁXIMO</span><b>${stats.comboMax}</b></li>
          <li><span>TIEMPO</span><b>${fmt(stats.tiempoTotal)}</b></li>
          <li><span>DIFICULTAD</span><b>${D().nombre}</b></li>
        </ul>
        <div class="nota"><small>NOTA</small><b>${datos.nota}</b></div>
        <p class="sello">${datos.semana ? "¡SEMANA COMPLETADA! Tu 2x1 te espera en la Shake Week 🥤" : "Sello del viernes conseguido ✔"}</p>
        <div class="fila"><a class="b principal" href="index.html#registro">VOLVER A SHAKE WEEK</a><button class="b" data-accion="empezar">↻ MEJORAR NOTA</button></div></div>`;
    } else if (tipo === "pausa") {
      menu.innerHTML = `<div class="caja"><h2>PAUSA</h2><div class="fila col">
        <button class="b principal" data-accion="continuar">▶ CONTINUAR</button><button class="b" data-accion="empezar">↻ REINICIAR COMBATE</button><a class="b" href="index.html">SALIR</a></div></div>`;
    }
    const p = menu.querySelector(".principal"); if (p) p.focus();
  }
  function mostrarResultados() {
    let pts = (victorias[1] === 0 ? 40 : 25) + Math.min(2, stats.perfectos) * 10 + Math.min(10, stats.comboMax) * 2 + Math.max(0, Math.min(20, (180 - stats.tiempoTotal) / 4));
    pts = Math.round(pts); if (dif === "facil" && pts > 88) pts = 88;
    guardarDia(5, pts * 100);
    let semana = false;
    try { const est = JSON.parse(localStorage.getItem("shakeweek-v1") || "{}"); const v = est[est.modo === "campana" ? "campana" : "demo"] || {}; semana = [1, 2, 3, 4, 5].every(i => v[i]); } catch (e) {}
    mostrarMenu("resultados", { nota: nota(pts), semana });
  }
  menu.addEventListener("click", e => {
    const op = e.target.closest("[data-dif]");
    if (op) { dif = op.dataset.dif; guardarPref("shakeweek-dia5", dif); Sonido.iniciar(); Sonido.tono(880, 880, 0.05); mostrarMenu("titulo"); return; }
    const b = e.target.closest("[data-accion]"); if (!b) return;
    Sonido.iniciar();
    if (b.dataset.accion === "empezar") empezarCombate();
    if (b.dataset.accion === "continuar") pausar();
  });
  let previo2 = null;
  function pausar() {
    if (estado === "pelea" || estado === "presentacion") { previo2 = estado; estado = "pausa"; Sonido.pararMusica(); mostrarMenu("pausa"); }
    else if (estado === "pausa") { estado = previo2; ocultarMenu(); Sonido.empezarMusica(CANCION); }
  }
  document.getElementById("btnPausa")?.addEventListener("click", pausar);
  document.getElementById("btnSonido")?.addEventListener("click", () => { Sonido.iniciar(); Sonido.alternar(); });

  let previo = performance.now();
  function bucle(ahora) {
    const dt = Math.min(1 / 30, (ahora - previo) / 1000); previo = ahora;
    if (estado === "titulo") { reloj += dt; if (jug) { jug.anim += dt; ia.anim += dt; } }
    else actualizar(dt);
    dibujar(); P = {};
    requestAnimationFrame(bucle);
  }

  Promise.all([cargar("sprites/heroe-112.png"), cargar("sprites/alter-ego-120.png")]).then(([h, v]) => {
    A.heroe = h; A.villano = v; A.heroeBlanco = tintar(h, PAL.blanco); A.villanoBlanco = tintar(v, PAL.blanco);
    A.villanoCian = tintar(v, PAL.cian); A.villanoMag = tintar(v, PAL.magenta);
    post = crearPost();
    jug = nuevoLuchador(false); ia = nuevoLuchador(true);
    estado = "titulo"; mostrarMenu("titulo");
    requestAnimationFrame(bucle);
  });
  window.__dia5 = { get estado() { return estado; }, get jug() { return jug; }, get ia() { return ia; }, get victorias() { return victorias; } };
})();
