/* =============================================================
   SHAKE WEEK · DÍA 4 — «LA BATITORRE»
   Lanza la munición con la pajita-tirachinas para derribar las torres
   donde se esconden los clones del Alter Ego. Cada sabor tiene un
   poder distinto. Física con Matter.js (lib/matter.min.js).
   ============================================================= */
(() => {
  "use strict";
  const { W, H, PAL, FUENTE, cargar, Sonido, texto, crearPost, dibujarCartel, guardarDia, leerPref, guardarPref, nota } = window.SW;
  const { Engine, Bodies, Body, Composite, Events, Sleeping } = window.Matter;
  const cv = document.getElementById("juego"), ctx = cv.getContext("2d");
  cv.width = W; cv.height = H; ctx.imageSmoothingEnabled = false;

  const G = 318;                       // altura del suelo
  const HONDA = { x: 104, y: 246 };    // punto de la honda
  const RMAX = 72, VMAX = 14;        // estiramiento máximo y velocidad máxima de lanzamiento

  /* ---------------- Batidos: cada color tiene un poder ---------------- */
  const BATIDOS = {
    fresa:    { nombre: "FRESA Y NATA",    color: "#ff5fa8", radio: 11, densidad: 0.004,  poder: "Golpe normal y fiable" },
    platano:  { nombre: "AZUQUITA",        color: "#f3e6cf", radio: 10, densidad: 0.0035, poder: "Toca en el aire: ¡acelerón! (la bolsa sale y el azúcar sigue)" },
    arandano: { nombre: "M&MS",            color: "#c9ccd6", radio: 9,  densidad: 0.004,  poder: "Toca en el aire: se abre en 3 bolitas" },
    chocolate:{ nombre: "PUCHERO CALIENTE",color: "#e3222e", radio: 13, densidad: 0.007,  poder: "Toca: ¡revienta! (o al rato de chocar)" },
    menta:    { nombre: "MENTA",    color: "#7dffb8", radio: 11, densidad: 0.004,  poder: "Toca: congela y vuelve frágil todo lo cercano" }
  };
  // Materiales de la torre
  const MATS = {
    galleta: { hp: 15, densidad: 0.0016, color: "#c98a4b", oscuro: "#8a5a2b", pts: 500 },
    hielo:   { hp: 7,  densidad: 0.0012, color: "#bff3ff", oscuro: "#6fc8e0", pts: 300 },
    lata:    { hp: 36, densidad: 0.005,  color: "#a9a6b8", oscuro: "#5b5068", pts: 800 },
    hormigon:{ hp: 60, densidad: 0.0065, color: "#8f8b84", oscuro: "#5e5a54", pts: 1000 },
    tnt:     { hp: 3,  densidad: 0.002,  color: "#e3222e", oscuro: "#2fe6ff", pts: 300 }
  };

  /* ---------------- Torres (3 niveles) ---------------- */
  // b(x, y, w, h, material) · c(x, y, rey)  — y = centro; G = suelo
  const NIVELES = [
    {
      nombre: "EL BATIDÍN", municion: ["fresa", "fresa", "platano"],
      montar: (b, c) => {
        b(420, G - 30, 16, 60, "hormigon"); b(500, G - 30, 16, 60, "hormigon"); b(460, G - 67, 112, 14, "galleta");
        c(460, G - 15);
        b(432, G - 94, 12, 40, "hielo"); b(488, G - 94, 12, 40, "hielo"); b(460, G - 121, 92, 14, "hielo");
        c(460, G - 89);
        c(460, G - 143);
      }
    },
    {
      nombre: "BUM GALLETÓN", municion: ["fresa", "arandano", "platano", "chocolate"],
      montar: (b, c) => {
        b(382, G - 8, 52, 16, "hormigon"); b(368, G - 52, 12, 72, "hielo"); b(396, G - 52, 12, 72, "hielo"); b(382, G - 95, 52, 14, "hielo"); c(382, G - 117);
        b(446, G - 13, 26, 26, "tnt");
        b(476, G - 35, 16, 70, "hormigon"); b(576, G - 35, 16, 70, "hormigon"); b(526, G - 77, 122, 14, "galleta"); c(526, G - 15);
        b(496, G - 109, 12, 50, "hielo"); b(556, G - 109, 12, 50, "hielo"); b(526, G - 141, 82, 14, "hielo"); c(526, G - 99);
        c(526, G - 163);
      }
    },
    {
      nombre: "EL M***HALLA", municion: ["fresa", "menta", "arandano", "chocolate", "platano"],
      montar: (b, c) => {
        b(374, G - 13, 26, 26, "tnt");
        b(430, G - 30, 18, 60, "hormigon"); b(520, G - 30, 16, 60, "hormigon"); b(610, G - 30, 18, 60, "hormigon"); b(520, G - 67, 200, 14, "lata");
        c(475, G - 15); c(565, G - 15);
        b(446, G - 99, 12, 50, "hielo"); b(520, G - 99, 14, 50, "galleta"); b(594, G - 99, 12, 50, "hielo"); b(520, G - 131, 172, 14, "galleta");
        c(483, G - 89); c(557, G - 89);
        b(472, G - 158, 12, 40, "galleta"); b(568, G - 158, 12, 40, "galleta"); b(520, G - 185, 120, 14, "hielo");
        c(520, G - 158, true);
      }
    }
  ];

  const DIFS = {
    facil: { nombre: "FÁCIL", dano: 1.25, puntosGuia: 46, extra: true },
    normal: { nombre: "NORMAL", dano: 1.0, puntosGuia: 14, extra: false }
  };
  let dif = leerPref("shakeweek-dia4", "facil"); if (!DIFS[dif]) dif = "facil";
  const D = () => DIFS[dif];

  /* ---------------- Estado ---------------- */
  const A = {};
  let engine, estado = "cargando", nivelIdx = 0, municion = [], actual = null, proyectiles = [], cuerpos = [], clones = [];
  let parts = [], textos = [], banner = null, reloj = 0, tiempoNivel = 0, temblor = 0, flash = 0, quieto = 0, esperaTurno = 0;
  let puntos = 0, puntosNivel = 0, estrellas = [], arrastre = null, apuntadoTeclado = { ang: -0.6, fuerza: 0.75, usado: false };
  let post;

  /* ---------------- Construcción del nivel ---------------- */
  function montarNivel(i) {
    nivelIdx = i;
    engine = Engine.create({ enableSleeping: true });
    engine.gravity.y = 1.15;
    cuerpos = []; clones = []; proyectiles = []; parts = []; textos = []; puntosNivel = 0; tiempoNivel = 0; quieto = 0;
    const suelo = Bodies.rectangle(W / 2, G + 40, 3000, 80, { isStatic: true, friction: 1, label: "suelo" });
    Composite.add(engine.world, suelo);
    const b = (x, y, w, h, mat) => {
      const m = MATS[mat];
      const cu = Bodies.rectangle(x, y, w, h, { density: m.densidad, friction: 0.85, frictionStatic: 1.2, restitution: 0.05, label: "bloque", sleepThreshold: 40 });
      cu.plugin = { tipo: "bloque", mat, w, h, hp: m.hp, max: m.hp, flash: 0 };
      cuerpos.push(cu); Composite.add(engine.world, cu);
    };
    const c = (x, y, rey = false) => {
      const r = rey ? 19 : 14;
      const cu = Bodies.circle(x, y, r, { density: 0.0016, friction: 0.8, restitution: 0.1, label: "clon", sleepThreshold: 40 });
      cu.plugin = { tipo: "clon", rey, r, hp: rey ? 16 : 6.5, max: rey ? 16 : 6.5, flash: 0 };
      clones.push(cu); Composite.add(engine.world, cu);
    };
    NIVELES[i].montar(b, c);
    municion = [...NIVELES[i].municion]; if (D().extra) municion.push("fresa");
    Events.on(engine, "collisionStart", alChocar);
    cargarSiguiente();
    estado = "juego"; ocultarMenu();
    mostrarCartel(`TORRE ${i + 1}`, NIVELES[i].nombre, 1.8);
  }

  function cargarSiguiente() {
    actual = municion.length ? { tipo: municion.shift(), x: HONDA.x, y: HONDA.y, salto: 0.35 } : null;
    apuntadoTeclado.usado = false;
  }

  /* ---------------- Daño por choques ---------------- */
  function alChocar(ev) {
    if (tiempoNivel < 1.2) return; // dejamos que la torre se asiente
    for (const par of ev.pairs) {
      const a = par.bodyA, bb = par.bodyB;
      const va = a._v || a.velocity, vb = bb._v || bb.velocity;
      const rel = Math.hypot(va.x - vb.x, va.y - vb.y);
      if (rel < 1.6) continue;
      dañar(a, bb, rel); dañar(bb, a, rel);
      if (rel > 4 && (a.label === "proyectil" || bb.label === "proyectil")) {
        sfx.golpe(Math.min(1, rel / 12));
        const pr = a.label === "proyectil" ? a : bb; if (pr.plugin.tipo === "chocolate" && !pr.plugin.mecha) pr.plugin.mecha = 1.4;
      }
    }
  }
  function dañar(cu, otro, rel) {
    const p = cu.plugin; if (!p || p.hp === undefined || p.muerto) return;
    const mOtro = otro.isStatic ? cu.mass : otro.mass; // caer al suelo daña, pero no lo pulveriza todo
    const factor = Math.min(2.2, Math.max(0.35, Math.sqrt(mOtro / cu.mass)));
    let d = (rel - 1.6) * factor * D().dano;
    if (p.congelado) d *= 2;
    p.hp -= d; p.flash = 0.08;
    if (p.hp <= 0) destruir(cu);
  }
  function destruir(cu) {
    const p = cu.plugin; if (p.muerto) return; p.muerto = true;
    Composite.remove(engine.world, cu);
    despertarTodo(); // lo que estaba apoyado encima vuelve a sentir la gravedad y se cae
    const x = cu.position.x, y = cu.position.y;
    if (p.tipo === "clon") {
      clones = clones.filter(k => k !== cu);
      const pts = p.rey ? 10000 : 5000; sumar(pts, x, y - 20, PAL.cian);
      particulas(x, y, [PAL.cian, PAL.magenta, PAL.verde, PAL.blanco], 26, 4); sfx.clon();
    } else {
      cuerpos = cuerpos.filter(k => k !== cu);
      const m = MATS[p.mat]; sumar(m.pts, x, y, PAL.crema, false);
      particulas(x, y, [m.color, m.oscuro, PAL.blanco], p.mat === "hielo" ? 16 : 12, 3);
      sfx.rotura(p.mat);
      if (p.mat === "tnt") explotar(x, y, 92, 16);
    }
  }
  // Matter.js «duerme» los cuerpos quietos para que la torre no tiemble; al romper una pieza
  // hay que despertarlos a todos o se quedarían flotando sin apoyo
  function despertarTodo() { for (const cu of [...cuerpos, ...clones]) Sleeping.set(cu, false); }
  function explotar(x, y, r, dano) {
    sfx.explosion(); temblor = 9; flash = 0.08;
    particulas(x, y, [PAL.oro, PAL.rojo, PAL.blanco, PAL.negro], 40, 6);
    for (const cu of [...cuerpos, ...clones]) {
      const dx = cu.position.x - x, dy = cu.position.y - y, d = Math.hypot(dx, dy);
      if (d > r) continue;
      Sleeping.set(cu, false);
      const k = 1 - d / r;
      Body.applyForce(cu, cu.position, { x: dx / (d || 1) * 0.06 * k * cu.mass, y: (dy / (d || 1) - 0.6) * 0.06 * k * cu.mass });
      cu.plugin.hp -= dano * k * D().dano; cu.plugin.flash = 0.1;
      if (cu.plugin.hp <= 0) destruir(cu);
    }
  }
  function congelarZona(x, y, r) {
    sfx.hielo(); flash = 0.05;
    particulas(x, y, [PAL.cian, PAL.blanco, PAL.menta], 30, 4);
    for (const cu of [...cuerpos, ...clones]) {
      const d = Math.hypot(cu.position.x - x, cu.position.y - y); if (d > r) continue;
      const p = cu.plugin; p.congelado = true; p.hp = Math.min(p.hp, p.max * 0.4); p.flash = 0.1; Sleeping.set(cu, false);
    }
    anillos.push({ x, y, r: 0, max: r, t: 0.5, c: PAL.cian });
  }
  let anillos = [], bolsas = [];

  /* ---------------- Lanzar y poderes ---------------- */
  function lanzar(vx, vy) {
    if (!actual) return;
    const def = BATIDOS[actual.tipo];
    const pr = Bodies.circle(HONDA.x, HONDA.y, def.radio, { density: def.densidad, friction: 0.6, restitution: 0.25, frictionAir: 0.004, label: "proyectil" });
    pr.plugin = { tipo: actual.tipo, poderUsado: false, t: 0, quieto: 0 };
    Body.setVelocity(pr, { x: vx, y: vy });
    Composite.add(engine.world, pr); proyectiles.push(pr);
    actual = null; esperaTurno = 0; sfx.lanzar();
    particulas(HONDA.x, HONDA.y, [PAL.crema, PAL.blanco], 8, 2);
  }

  function usarPoder() {
    const pr = proyectiles.find(p => !p.plugin.poderUsado && !p.plugin.hijo && p.plugin.t < 6);
    if (!pr) return;
    const t = pr.plugin.tipo, v = pr.velocity, sp = Math.hypot(v.x, v.y) || 1;
    pr.plugin.poderUsado = true;
    if (t === "platano") {
      // la bolsita sale volando hacia atrás y el azúcar sigue disparado
      bolsas.push({ x: pr.position.x, y: pr.position.y, vx: -v.x / sp * 2.5, vy: -3.5, rot: 0, vr: -0.3 * Math.sign(v.x || 1), t: 1.6 });
      pr.plugin.sinBolsa = true;
      Body.setVelocity(pr, { x: v.x / sp * 18, y: v.y / sp * 18 }); sfx.acelerar();
      for (let i = 0; i < 14; i++) parts.push({ x: pr.position.x, y: pr.position.y, vx: -v.x / sp * (1 + i * 0.3) + (Math.random() - 0.5) * 2, vy: -v.y / sp * (1 + i * 0.3) + (Math.random() - 0.5) * 2, t: 0.5, c: i % 3 ? PAL.blanco : PAL.crema, s: 2 });
    } else if (t === "arandano") {
      // el paquete se rompe: salen 3 bolitas de colores
      sfx.dividir(); particulas(pr.position.x, pr.position.y, ["#c9ccd6", PAL.blanco, "#8a8e98"], 14, 3);
      const cols = ["#e3222e", "#ffcf3a", "#3dbb5a", "#3d6cff", "#ff8a1a", "#7a4a2a"].sort(() => Math.random() - 0.5);
      pr.plugin.bola = cols[0];
      for (const [i, da] of [[1, -0.22], [2, 0.22]]) {
        const ang = Math.atan2(v.y, v.x) + da;
        const h = Bodies.circle(pr.position.x, pr.position.y, 8, { density: 0.004, friction: 0.6, restitution: 0.25, frictionAir: 0.004, label: "proyectil" });
        h.plugin = { tipo: "arandano", poderUsado: true, hijo: true, t: pr.plugin.t, quieto: 0, bola: cols[i] };
        Body.setVelocity(h, { x: Math.cos(ang) * sp, y: Math.sin(ang) * sp });
        Composite.add(engine.world, h); proyectiles.push(h);
      }
    } else if (t === "chocolate") {
      pr.plugin.revienta = 0.3; sfx.hervir(); // se hincha, se pone rojo y revienta
    } else if (t === "menta") {
      congelarZona(pr.position.x, pr.position.y, 86);
    } else pr.plugin.poderUsado = true;
  }
  function quitarProyectil(pr) { Composite.remove(engine.world, pr); proyectiles = proyectiles.filter(k => k !== pr); }

  /* ---------------- Entrada ---------------- */
  function aJuego(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; }
  cv.addEventListener("pointerdown", e => {
    if (estado !== "juego") return;
    Sonido.iniciar();
    const p = aJuego(e);
    if (actual && !proyectiles.length && Math.hypot(p.x - HONDA.x, p.y - HONDA.y) < 60) { arrastre = { x: HONDA.x, y: HONDA.y }; cv.setPointerCapture(e.pointerId); moverArrastre(p); }
    else if (proyectiles.length) usarPoder();
  });
  cv.addEventListener("pointermove", e => { if (arrastre) moverArrastre(aJuego(e)); });
  cv.addEventListener("pointerup", () => soltar());
  cv.addEventListener("pointercancel", () => { arrastre = null; });
  function moverArrastre(p) {
    let dx = p.x - HONDA.x, dy = p.y - HONDA.y; const d = Math.hypot(dx, dy);
    if (d > RMAX) { dx = dx / d * RMAX; dy = dy / d * RMAX; }
    if (HONDA.y + dy > G - 6) dy = G - 6 - HONDA.y;
    arrastre = { x: HONDA.x + dx, y: HONDA.y + dy };
    if (Math.random() < 0.15) sfx.tensar();
  }
  function velocidadDesde(px, py) {
    const dx = HONDA.x - px, dy = HONDA.y - py, d = Math.hypot(dx, dy);
    const k = Math.min(1, d / RMAX) * VMAX;
    return { vx: dx / (d || 1) * k, vy: dy / (d || 1) * k, d };
  }
  function soltar() {
    if (!arrastre) return;
    const v = velocidadDesde(arrastre.x, arrastre.y); arrastre = null;
    if (v.d > 14) lanzar(v.vx, v.vy);
  }
  // Teclado: ↑↓ ángulo, ←→ fuerza, ESPACIO lanza / usa el poder
  addEventListener("keydown", e => {
    if (e.code === "Enter") { e.preventDefault(); accionPrincipal(); return; }
    if (e.code === "Escape" || e.code === "KeyP") { pausar(); return; }
    if (e.code === "KeyM") { Sonido.alternar(); return; }
    if (estado !== "juego") return;
    const a = apuntadoTeclado;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) { e.preventDefault(); Sonido.iniciar(); }
    if (e.code === "ArrowUp") { a.ang = Math.max(-1.45, a.ang - 0.05); a.usado = true; }
    if (e.code === "ArrowDown") { a.ang = Math.min(0.35, a.ang + 0.05); a.usado = true; }
    if (e.code === "ArrowRight") { a.fuerza = Math.min(1, a.fuerza + 0.04); a.usado = true; }
    if (e.code === "ArrowLeft") { a.fuerza = Math.max(0.25, a.fuerza - 0.04); a.usado = true; }
    if (e.code === "Space") {
      if (actual && !proyectiles.length) { const v = VMAX * a.fuerza; lanzar(Math.cos(a.ang) * v, Math.sin(a.ang) * v); }
      else usarPoder();
    }
  });
  document.getElementById("btnPoder")?.addEventListener("pointerdown", e => { e.preventDefault(); usarPoder(); });

  /* ---------------- Sonido ---------------- */
  const sfx = {
    tensar: () => Sonido.tono(200 + Math.random() * 60, 260, 0.04, "sawtooth", 0.03),
    lanzar: () => { Sonido.tono(300, 900, 0.18, "square", 0.08); Sonido.ruido(0.12, 0.08, 3000); },
    golpe: k => { Sonido.ruido(0.12, 0.08 + k * 0.15, 900); Sonido.tono(180, 80, 0.1, "square", 0.05 * k); },
    rotura: mat => mat === "hielo" ? Sonido.tono(2400, 900, 0.18, "triangle", 0.08) : mat === "lata" ? Sonido.tono(500, 160, 0.2, "square", 0.08) : Sonido.ruido(0.2, 0.14, 1200),
    clon: () => { for (let i = 0; i < 5; i++) Sonido.tono(300 + Math.random() * 1500, 120 + Math.random() * 600, 0.07, "sawtooth", 0.05, i * 0.04); Sonido.tono(880, 1760, 0.2, "square", 0.06, 0.2); },
    explosion: () => { Sonido.ruido(0.6, 0.4, 600); Sonido.tono(140, 30, 0.6, "sine", 0.4); },
    hielo: () => { [1800, 2400, 3000].forEach((f, i) => Sonido.tono(f, f * 0.7, 0.2, "triangle", 0.07, i * 0.05)); },
    acelerar: () => Sonido.tono(400, 1600, 0.2, "sawtooth", 0.08),
    hervir: () => { for (let i = 0; i < 4; i++) Sonido.tono(300 + i * 120, 500 + i * 160, 0.07, "square", 0.06, i * 0.06); },
    dividir: () => [880, 1100, 1320].forEach((f, i) => Sonido.tono(f, f, 0.06, "square", 0.06, i * 0.04)),
    estrella: i => Sonido.tono(880 + i * 220, 880 + i * 220, 0.18, "square", 0.08),
    victoria: () => [523, 659, 784, 1047].forEach((f, i) => Sonido.tono(f, f, 0.16, "square", 0.08, i * 0.12)),
    derrota: () => [392, 330, 262, 196].forEach((f, i) => Sonido.tono(f, f * 0.98, 0.2, "triangle", 0.1, i * 0.16))
  };
  const CANCION = {
    tempo: 128, swing: true,
    bajo: [[48, 55, 48, 55], [45, 52, 45, 52], [41, 48, 41, 48], [43, 50, 43, 50]],
    acordes: [[72, 76, 79], [69, 72, 76], [65, 69, 72], [67, 71, 74]],
    melodia: [76, 0, 79, 76, 72, 0, 74, 76, 72, 0, 69, 72, 76, 0, 74, 0, 77, 76, 74, 72, 69, 0, 72, 0, 74, 0, 71, 74, 79, 0, 0, 0]
  };

  /* ---------------- Actualización ---------------- */
  function sumar(pts, x, y, c = PAL.crema, grande = true) { puntos += pts; puntosNivel += pts; textos.push({ t: `+${pts}`, x, y, vida: 1, c, tam: grande ? 10 : 7 }); }
  function particulas(x, y, cols, n = 12, vel = 3) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = vel * (0.3 + Math.random());
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.5, t: 0.5 + Math.random() * 0.5, c: cols[i % cols.length], s: 2 + Math.floor(Math.random() * 3), grav: 0.18 });
    }
  }
  function mostrarCartel(texto2, sub = "", dur = 1.4, alAcabar = null, color = PAL.crema) { banner = { texto: texto2, sub, t: 0, dur, alAcabar, color }; }

  function actualizar(dt) {
    reloj += dt;
    if (banner) { banner.t += dt; if (banner.t > banner.dur) { const f = banner.alAcabar; banner = null; if (f) f(); } }
    parts = parts.filter(q => (q.t -= dt) > 0); parts.forEach(q => { q.vy += (q.grav || 0); q.x += q.vx; q.y += q.vy; });
    textos = textos.filter(q => (q.vida -= dt) > 0); textos.forEach(q => q.y -= 25 * dt);
    anillos = anillos.filter(a => (a.t -= dt) > 0); anillos.forEach(a => a.r += (a.max - a.r) * Math.min(1, dt * 12));
    temblor = Math.max(0, temblor - dt * 30); flash -= dt;
    if (estado !== "juego" && estado !== "fin_nivel") return;
    if (!engine) return;
    tiempoNivel += dt;
    // guardamos la velocidad de cada cuerpo antes del paso (para calcular el daño de los choques)
    for (const cu of Composite.allBodies(engine.world)) cu._v = { x: cu.velocity.x, y: cu.velocity.y };
    Engine.update(engine, 1000 / 60);
    for (const cu of [...cuerpos, ...clones]) { cu.plugin.flash -= dt; if (cu.position.y > H + 60 || cu.position.x < -80 || cu.position.x > W + 80) destruir(cu); }
    if (actual && actual.salto > 0) actual.salto -= dt;

    // Proyectiles: mecha del chocolate, fin de vuelo
    for (const pr of [...proyectiles]) {
      const p = pr.plugin; p.t += dt;
      if (Math.random() < 0.5 && pr.speed > 3) parts.push({ x: pr.position.x, y: pr.position.y, vx: 0, vy: 0, t: 0.25, c: BATIDOS[p.tipo].color, s: 2 });
      if (p.mecha !== undefined && !p.poderUsado) { p.mecha -= dt; if (p.mecha <= 0) { p.poderUsado = true; explotar(pr.position.x, pr.position.y, 90, 18); quitarProyectil(pr); continue; } }
      if (p.revienta !== undefined) { p.revienta -= dt; if (p.revienta <= 0) { explotar(pr.position.x, pr.position.y, 96, 20); quitarProyectil(pr); continue; } }
      if (pr.speed < 0.25) p.quieto += dt; else p.quieto = 0;
      if (p.quieto > 1.2 || p.t > 9 || pr.position.x > W + 60 || pr.position.x < -60 || pr.position.y > H + 60) {
        particulas(pr.position.x, pr.position.y, [BATIDOS[p.tipo].color, PAL.blanco], 8, 2); quitarProyectil(pr);
      }
    }
    // Turno: cuando no queda nada volando y la torre está casi quieta
    if (estado === "juego" && !actual && !proyectiles.length) {
      esperaTurno += dt;
      const movimiento = [...cuerpos, ...clones].some(cu => cu.speed > 0.35);
      if (!clones.length && (esperaTurno > 0.6)) return terminarNivel(true);
      if (esperaTurno > 3.5 || (!movimiento && esperaTurno > 0.8)) {
        if (municion.length) cargarSiguiente();
        else if (clones.length) return terminarNivel(false);
      }
    }
  }

  function terminarNivel(gana) {
    estado = "fin_nivel";
    if (gana) {
      const sobra = municion.length + (actual ? 1 : 0);
      for (let i = 0; i < sobra; i++) sumar(10000, 40 + i * 22, G - 20, PAL.oro);
      const n = 1 + (sobra >= 1 ? 1 : 0) + (sobra >= 2 ? 1 : 0);
      estrellas[nivelIdx] = Math.max(estrellas[nivelIdx] || 0, n);
      sfx.victoria(); mostrarCartel("¡TORRE DERRIBADA!", "", 1.8, () => { mostrarMenu("nivel", { estrellas: n, sobra }); }, PAL.verde);
    } else {
      sfx.derrota(); mostrarCartel("¡SIN BATIDOS!", "", 1.6, () => mostrarMenu("fallo"), PAL.rojo);
    }
  }

  /* ---------------- Dibujo ---------------- */
  // Cada torre tiene su escenario (ver fondos4.js)
  function dibujarFondo() { window.FONDOS4.dibujar(ctx, nivelIdx, reloj); }

  // Dibujo de cada munición (pl = estado del proyectil en vuelo, si lo hay)
  function dibujarBatido(x, y, tipo, ang = 0, esc = 1, pl = null) {
    const def = BATIDOS[tipo], r = def.radio * esc;
    ctx.save(); ctx.translate(Math.round(x), Math.round(y));
    const R = (c, a, b, w, h) => { ctx.fillStyle = c; ctx.fillRect(Math.round(a), Math.round(b), Math.round(w), Math.round(h)); };
    if (tipo === "fresa") {
      // Fresa y nata: bola rosa con una espiral de nata que gira
      ctx.rotate(ang);
      ctx.fillStyle = PAL.negro; ctx.beginPath(); ctx.arc(0, 0, r + 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ff5fa8"; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#fff4f8"; ctx.lineWidth = Math.max(2, r * 0.28); ctx.lineCap = "round"; ctx.beginPath();
      for (let k = 0; k <= 1; k += 0.05) { const a = k * Math.PI * 3.2, rr = k * r * 0.85; k ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(0, 0); }
      ctx.stroke(); ctx.globalAlpha = 0.45; ctx.strokeStyle = "#ffb3d1"; ctx.lineWidth = 1; ctx.stroke(); ctx.globalAlpha = 1;
      R("rgba(255,255,255,.7)", -r * 0.5, -r * 0.6, 2, 2);
    } else if (tipo === "platano") {
      if (pl?.sinBolsa) {
        // solo el azúcar disparado
        for (let i = 0; i < 9; i++) { const a = i * 2.4 + reloj * 9, d = (i % 3) * 3; R(i % 2 ? PAL.blanco : PAL.crema, Math.cos(a) * d - 1.5, Math.sin(a) * d - 1.5, 3, 3); }
        R(PAL.blanco, -1, -1, 2, 2);
      } else {
        // Azuquita: bolsita de papel con lazo rosa y azúcar asomando
        ctx.rotate(ang * 0.5);
        const w = r * 1.6, h = r * 1.5;
        R(PAL.negro, -w / 2 - 1, -h / 2 + 1, w + 2, h + 1);
        R("#d9b77a", -w / 2, -h / 2 + 2, w, h - 1); R("#c09a5a", w / 2 - 3, -h / 2 + 2, 3, h - 1);
        R(PAL.negro, -w / 3 - 1, -h / 2 - 4, w * 0.66 + 2, 7); R("#e8cf9a", -w / 3, -h / 2 - 3, w * 0.66, 5);
        R(PAL.blanco, -w / 3 + 1, -h / 2 - 6, 3, 3); R(PAL.blanco, 1, -h / 2 - 7, 3, 4); R(PAL.crema, -2, -h / 2 - 5, 2, 2);
        R("#ff5fa8", -w / 3 - 2, -h / 2 + 1, w * 0.66 + 4, 2); R("#ff5fa8", -5, -h / 2 - 2, 4, 3); R("#ff5fa8", 1, -h / 2 - 2, 4, 3); R("#c43a7a", -1, -h / 2, 2, 2);
        R("#8a6a3a", -3, 1, 6, 1);
      }
    } else if (tipo === "arandano") {
      if (pl?.bola) {
        // bolita de chocolate de color
        ctx.fillStyle = PAL.negro; ctx.beginPath(); ctx.arc(0, 0, r * 0.85 + 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = pl.bola; ctx.beginPath(); ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2); ctx.fill();
        R("rgba(255,255,255,.75)", -r * 0.4, -r * 0.45, 3, 2);
      } else {
        // paquete plateado rectangular con forma redondeada
        ctx.rotate(ang);
        const w = r * 2.2, h = r * 1.7;
        ctx.fillStyle = PAL.negro; ctx.beginPath(); ctx.roundRect(-w / 2 - 1.5, -h / 2 - 1.5, w + 3, h + 3, h / 2); ctx.fill();
        ctx.fillStyle = "#c9ccd6"; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2); ctx.fill();
        R("#eef0f6", -w / 2 + 3, -h / 2 + 2, w - 8, 2); R("#8a8e98", -w / 2 + 3, h / 2 - 3, w - 6, 1);
        for (const s of [-1, 1]) for (let i = -2; i <= 2; i += 2) R("#8a8e98", s * (w / 2 - 1), i, s * 2, 1); // bordes rizados
        for (const [c, dx] of [["#e3222e", -5], ["#ffcf3a", 0], ["#3d6cff", 5]]) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(dx, 1, 2.2, 0, Math.PI * 2); ctx.fill(); }
      }
    } else if (tipo === "chocolate") {
      const k = pl?.revienta !== undefined ? 1 - pl.revienta / 0.3 : pl?.mecha !== undefined && pl.mecha < 0.8 ? 1 - pl.mecha / 0.8 : -1;
      if (k >= 0) {
        // a punto de reventar: se vuelve una bola roja que se hincha y parpadea
        const rr = r * (1 + k * 0.6) + Math.sin(reloj * 40) * 1.5;
        ctx.fillStyle = PAL.negro; ctx.beginPath(); ctx.arc(0, 0, rr + 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = Math.floor(reloj * 16) % 2 ? "#ff3a2a" : "#c4161f"; ctx.beginPath(); ctx.arc(0, 0, rr, 0, Math.PI * 2); ctx.fill();
        R("#ffcf3a", -rr * 0.4, -rr * 0.5, 4, 3); R(PAL.blanco, -rr * 0.45, -rr * 0.55, 2, 2);
      } else {
        // Puchero caliente: olla rectangular con asas, tapa y vapor
        ctx.rotate(ang);
        const w = r * 2, h = r * 1.4;
        R(PAL.negro, -w / 2 - 4, -h / 2 + 1, w + 8, 5); R("#3a3640", -w / 2 - 3, -h / 2 + 2, 3, 3); R("#3a3640", w / 2, -h / 2 + 2, 3, 3);
        R(PAL.negro, -w / 2 - 1, -h / 2 - 1, w + 2, h + 2);
        R("#5a5462", -w / 2, -h / 2, w, h); R("#7a7484", -w / 2 + 2, -h / 2 + 2, 3, h - 4); R("#3a3640", w / 2 - 4, -h / 2, 4, h);
        R(PAL.negro, -w / 2 - 2, -h / 2 - 4, w + 4, 5); R("#8a8494", -w / 2 - 1, -h / 2 - 3, w + 2, 3); R(PAL.negro, -2, -h / 2 - 7, 4, 3);
        R("#c4161f", -w / 2 + 3, -2, w - 6, 3);
        if (pl || Math.floor(reloj * 3) % 2) { ctx.globalAlpha = 0.6; R(PAL.blanco, -4 + Math.sin(reloj * 6) * 2, -h / 2 - 12, 2, 4); R(PAL.blanco, 3 + Math.sin(reloj * 5) * 2, -h / 2 - 14, 2, 5); ctx.globalAlpha = 1; }
      }
    } else {
      // Menta: el vasito de siempre
      ctx.rotate(ang);
      const w = Math.round(r * 1.5), h = Math.round(r * 1.7);
      R(PAL.negro, -w / 2 - 2, -h / 2 - 2, w + 4, h + 4);
      R(def.color, -w / 2, -h / 2 + 3, w, h - 3);
      R(PAL.blanco, -w / 2, -h / 2 + Math.round(h * 0.45), w, 3);
      R(PAL.blanco, -w / 2 - 1, -h / 2 - 1, w + 2, 4); R(PAL.blanco, -w / 2 + 2, -h / 2 - 4, w - 4, 3);
      R(PAL.rojo, 2, -h / 2 - 10, 3, 7); R(PAL.blanco, 2, -h / 2 - 8, 3, 2);
      R(PAL.negro, -4, -1, 2, 3); R(PAL.negro, 2, -1, 2, 3);
    }
    ctx.restore();
  }
  function dibujarBolsas() {
    bolsas = bolsas.filter(b => (b.t -= 1 / 60) > 0);
    for (const b of bolsas) {
      b.vy += 0.25; b.x += b.vx; b.y += b.vy; b.rot += b.vr;
      ctx.save(); ctx.globalAlpha = Math.min(1, b.t * 2); ctx.translate(b.x, b.y); ctx.rotate(b.rot);
      ctx.fillStyle = PAL.negro; ctx.fillRect(-9, -7, 18, 15); ctx.fillStyle = "#d9b77a"; ctx.fillRect(-8, -6, 16, 13);
      ctx.fillStyle = "#ff5fa8"; ctx.fillRect(-8, -6, 16, 2); ctx.fillRect(-3, -9, 6, 3);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function dibujarBloque(cu) {
    const p = cu.plugin, m = MATS[p.mat];
    ctx.save(); ctx.translate(cu.position.x, cu.position.y); ctx.rotate(cu.angle);
    const w = p.w, h = p.h;
    ctx.fillStyle = PAL.negro; ctx.fillRect(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2);
    ctx.fillStyle = p.flash > 0 ? PAL.blanco : p.congelado && p.mat !== "hielo" ? "#9fe6ff" : m.color; ctx.fillRect(-w / 2, -h / 2, w, h);
    if (p.mat === "galleta") { ctx.fillStyle = m.oscuro; for (let i = -w / 2 + 3; i < w / 2 - 2; i += 7) for (let j = -h / 2 + 3; j < h / 2 - 2; j += 8) ctx.fillRect(Math.round(i + ((j / 8) % 2) * 3), Math.round(j), 2, 2); }
    if (p.mat === "hielo") { ctx.fillStyle = PAL.blanco; ctx.fillRect(-w / 2 + 2, -h / 2 + 2, 2, Math.max(2, h - 6)); ctx.globalAlpha = 0.5; ctx.fillRect(-w / 2 + 5, -h / 2 + 2, 1, h / 2); ctx.globalAlpha = 1; }
    if (p.mat === "lata") { ctx.fillStyle = m.oscuro; ctx.fillRect(-w / 2, -h / 2, w, 2); ctx.fillRect(-w / 2, h / 2 - 2, w, 2); ctx.fillStyle = PAL.blanco; ctx.fillRect(-w / 2 + 3, -h / 2 + 3, 2, 2); ctx.fillRect(w / 2 - 5, h / 2 - 5, 2, 2); }
    if (p.mat === "hormigon") {
      ctx.fillStyle = m.oscuro; for (let i = -w / 2 + 2; i < w / 2 - 2; i += 5) for (let j = -h / 2 + 2; j < h / 2 - 2; j += 6) ctx.fillRect(Math.round(i + (j * 7) % 3), Math.round(j), 2, 1);
      ctx.fillStyle = "#b3afa7"; ctx.fillRect(-w / 2, -h / 2, w, 2); ctx.fillStyle = "#4a4741"; ctx.fillRect(-w / 2, h / 2 - 2, w, 2);
    }
    if (p.mat === "tnt") {
      ctx.fillStyle = Math.floor(reloj * 6) % 2 ? PAL.cian : PAL.magenta; ctx.fillRect(-w / 2 + 3, -3, w - 6, 6);
      ctx.font = `6px ${FUENTE}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = PAL.blanco; ctx.fillText("ERR", 0, 0);
    }
    // grietas según el daño
    const k = p.hp / p.max;
    if (k < 0.66) { ctx.fillStyle = "rgba(0,0,0,.55)"; ctx.fillRect(-w / 4, -h / 4, 2, h / 3); ctx.fillRect(-w / 4, -h / 4 + h / 3, w / 3, 2); }
    if (k < 0.33) { ctx.fillRect(w / 6, 0, 2, h / 3); ctx.fillRect(-w / 3, h / 6, w / 2, 2); }
    if (p.congelado) { ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(-w / 2, -h / 2, w, 3); }
    ctx.restore();
  }

  function dibujarClon(cu) {
    const p = cu.plugin, img = p.rey ? A.clonRey : A.clon;
    ctx.save(); ctx.translate(cu.position.x, cu.position.y); ctx.rotate(cu.angle);
    const temb = Math.random() < 0.12 ? (Math.random() - 0.5) * 3 : 0;
    ctx.drawImage(p.flash > 0 ? (p.rey ? A.clonReyBlanco : A.clonBlanco) : img, Math.round(-img.width / 2 + temb), Math.round(-img.height / 2 - 2));
    if (p.congelado) { ctx.globalAlpha = 0.4; ctx.fillStyle = PAL.cian; ctx.fillRect(-p.r, -p.r - 4, p.r * 2, p.r * 2 + 4); ctx.globalAlpha = 1; }
    if (p.rey) { // corona glitch
      const y = -img.height / 2 - 8;
      ctx.fillStyle = PAL.negro; ctx.fillRect(-10, y - 1, 20, 9);
      ctx.fillStyle = PAL.oro; ctx.fillRect(-9, y + 2, 18, 5); ctx.fillRect(-9, y, 3, 3); ctx.fillRect(-2, y - 1, 4, 4); ctx.fillRect(6, y, 3, 3);
      ctx.fillStyle = PAL.magenta; ctx.fillRect(-1, y + 3, 2, 2);
    }
    ctx.restore();
    if (Math.random() < 0.15) { ctx.fillStyle = [PAL.cian, PAL.magenta, PAL.verde][Math.floor(Math.random() * 3)]; ctx.fillRect(cu.position.x - 14 + Math.random() * 28, cu.position.y - 14 + Math.random() * 28, 5, 2); }
  }

  function dibujarHonda() {
    const { x, y } = HONDA;
    // pajita-tirachinas: dos pajitas rayadas y un tronco
    const pajita = (px, py, h) => { for (let i = 0; i < h; i += 6) { ctx.fillStyle = (i / 6) % 2 ? PAL.blanco : PAL.rojo; ctx.fillRect(px, py + i, 6, Math.min(6, h - i)); } ctx.fillStyle = PAL.negro; ctx.fillRect(px - 1, py, 1, h); ctx.fillRect(px + 6, py, 1, h); };
    pajita(x - 14, y - 12, 26); pajita(x + 8, y - 12, 26);
    ctx.fillStyle = "#3a1e10"; ctx.fillRect(x - 6, y + 10, 12, G - y - 10);
    ctx.fillStyle = "#5a2e18"; ctx.fillRect(x - 14, y + 10, 28, 8);
    const pos = arrastre || (actual ? { x: actual.x, y: actual.y - Math.max(0, Math.sin(actual.salto * 9) * 12) } : null);
    if (arrastre) { ctx.strokeStyle = "#2a1408"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 11, y - 8); ctx.lineTo(pos.x, pos.y); ctx.lineTo(x + 11, y - 8); ctx.stroke(); }
    if (pos && actual) dibujarBatido(pos.x, pos.y, actual.tipo, arrastre ? Math.atan2(HONDA.y - pos.y, HONDA.x - pos.x) * 0.3 : 0);
    if (!arrastre) { ctx.strokeStyle = "#2a1408"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 11, y - 8); ctx.lineTo(x, y + 2); ctx.lineTo(x + 11, y - 8); ctx.stroke(); }
  }

  function dibujarGuia() {
    let vx, vy;
    if (arrastre) { const v = velocidadDesde(arrastre.x, arrastre.y); if (v.d < 8) return; vx = v.vx; vy = v.vy; }
    else if (apuntadoTeclado.usado && actual && !proyectiles.length) { const v = VMAX * apuntadoTeclado.fuerza; vx = Math.cos(apuntadoTeclado.ang) * v; vy = Math.sin(apuntadoTeclado.ang) * v; }
    else return;
    let x = HONDA.x, y = HONDA.y; const g = engine.gravity.y * 0.001 * (1000 / 60) * (1000 / 60);
    const n = D().puntosGuia;
    for (let i = 0; i < n * 3; i++) {
      vy += g; vx *= 0.996; vy *= 0.996; x += vx; y += vy;
      if (y > G || x > W) break;
      if (i % 3 === 0) { ctx.globalAlpha = 1 - i / (n * 3); ctx.fillStyle = PAL.blanco; ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3); }
    }
    ctx.globalAlpha = 1;
  }

  function dibujarHUD() {
    texto(ctx, `TORRE ${nivelIdx + 1}/3 · ${NIVELES[nivelIdx].nombre}`, 12, 16, 8, PAL.crema, "left");
    texto(ctx, String(puntos).padStart(7, "0"), W - 12, 16, 10, PAL.oro, "right");
    texto(ctx, `CLONES: ${clones.length}`, W - 12, 32, 7, PAL.cian, "right");
    // cola de munición
    municion.forEach((t, i) => dibujarBatido(70 - i * 20, G - 12, t, 0, 0.8));
    // pista del poder
    const pr = proyectiles.find(p => !p.plugin.poderUsado && !p.plugin.hijo && p.plugin.t < 6);
    if (pr && pr.plugin.tipo !== "fresa") texto(ctx, `¡TOCA! · ${BATIDOS[pr.plugin.tipo].nombre}`, W / 2, 34, 9, BATIDOS[pr.plugin.tipo].color);
    else if (actual && !proyectiles.length && !arrastre) {
      const def = BATIDOS[actual.tipo];
      texto(ctx, `${def.nombre}: ${def.poder}`, W / 2, 34, 7, def.color);
    }
    const bp = document.getElementById("btnPoder"); if (bp) bp.classList.toggle("activo", !!(pr && pr.plugin.tipo !== "fresa"));
  }

  function dibujar() {
    ctx.save();
    if (temblor > 0) ctx.translate(Math.round((Math.random() - 0.5) * temblor), Math.round((Math.random() - 0.5) * temblor));
    dibujarFondo();
    if (engine) {
      ctx.drawImage(A.heroe, 150 - A.heroe.width / 2, G - A.heroe.height + 2 - (estado === "fin_nivel" && clones.length === 0 ? Math.abs(Math.sin(reloj * 10)) * 8 : 0));
      cuerpos.forEach(dibujarBloque); clones.forEach(dibujarClon);
      dibujarHonda(); dibujarGuia();
      proyectiles.forEach(pr => dibujarBatido(pr.position.x, pr.position.y, pr.plugin.tipo, pr.angle, pr.plugin.hijo ? 0.75 : 1, pr.plugin)); dibujarBolsas();
      anillos.forEach(a => { ctx.globalAlpha = Math.min(1, a.t * 3); ctx.strokeStyle = a.c; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; });
      parts.forEach(q => { ctx.globalAlpha = Math.min(1, q.t * 3); ctx.fillStyle = q.c; ctx.fillRect(Math.round(q.x), Math.round(q.y), q.s, q.s); });
      ctx.globalAlpha = 1;
      textos.forEach(q => texto(ctx, q.t, q.x, q.y, q.tam, q.c));
    }
    ctx.restore();
    if (engine && estado !== "titulo") dibujarHUD();
    dibujarCartel(ctx, banner);
    post(ctx, reloj, flash);
  }

  /* ---------------- Menús ---------------- */
  const menu = document.getElementById("menu");
  function ocultarMenu() { menu.className = "menu"; menu.innerHTML = ""; }
  function mostrarMenu(tipo, datos = {}) {
    menu.className = "menu ver " + tipo;
    const est = n => `<span class="estrellas">${[0, 1, 2].map(i => `<i class="${i < n ? "on" : ""}" style="animation-delay:${i * 0.25}s">★</i>`).join("")}</span>`;
    if (tipo === "titulo") {
      menu.innerHTML = `<div class="caja">
        <p class="pre">SHAKE WEEK · DÍA 4</p>
        <h1>LA BATI<br><span>TORRE</span></h1>
        <p class="hist">Los clones del Alter Ego se han atrincherado en tres torres. Tira de la pajita-tirachinas y lánzales fresa y nata, azuquita, M&Ms y pucheros calientes hasta derribarlas.</p>
        <div class="batidos">${Object.entries(BATIDOS).map(([, b]) => `<span><i style="background:${b.color}"></i><b style="color:${b.color}">${b.nombre}</b><small>${b.poder}</small></span>`).join("")}</div>
        <div class="eleccion"><span class="et">DIFICULTAD</span>
          ${Object.entries(DIFS).map(([k, d]) => `<button class="op ${k === dif ? "sel" : ""}" data-dif="${k}">${d.nombre}${k === "facil" ? " ★" : ""}</button>`).join("")}
        </div>
        <p class="desc">${dif === "facil" ? "Fácil: guía de tiro completa, un batido extra y golpes más fuertes" : "Normal: guía de tiro corta y munición justa"}</p>
        <button class="b principal" data-accion="empezar">▶ JUGAR</button>
        <div class="ctrls"><span><b>Arrastra</b> el batido hacia atrás y suelta</span><span><b>Toca</b> en el aire para usar el poder</span><span>Teclado: <b>↑↓</b> ángulo · <b>←→</b> fuerza · <b>ESPACIO</b></span></div>
      </div>`;
    } else if (tipo === "nivel") {
      const ultimo = nivelIdx === NIVELES.length - 1;
      menu.innerHTML = `<div class="caja">
        <h2>¡TORRE ${nivelIdx + 1} DERRIBADA!</h2>${est(datos.estrellas)}
        <p class="hist">${datos.sobra ? `Te sobraron ${datos.sobra} batido(s): +${datos.sobra * 10000}` : "¡Justo con el último batido!"}<br>Puntos de la torre: ${puntosNivel}</p>
        <div class="fila">${ultimo ? `<button class="b principal" data-accion="resultados">VER RESULTADOS</button>` : `<button class="b principal" data-accion="siguiente">SIGUIENTE TORRE ▶</button>`}
        <button class="b" data-accion="repetir">↻ REPETIR TORRE</button></div></div>`;
      estrellasSonido(datos.estrellas);
    } else if (tipo === "fallo") {
      menu.innerHTML = `<div class="caja"><h2 class="rojo">¡SIN BATIDOS!</h2>
        <p class="hist">Quedan ${clones.length} clon(es) en pie. Prueba otro ángulo o guarda el chocolate para el final.</p>
        <div class="fila"><button class="b principal" data-accion="repetir">↻ REINTENTAR TORRE</button><a class="b" href="index.html">SALIR</a></div></div>`;
    } else if (tipo === "resultados") {
      const total = estrellas.reduce((a, b) => a + (b || 0), 0);
      let pts = Math.round(total / 9 * 70 + Math.min(30, puntos / 5000));
      if (dif === "facil" && pts > 88) pts = 88;
      const n = nota(pts); guardarDia(4, puntos);
      menu.innerHTML = `<div class="caja tarjeta"><h2>¡NIVEL SUPERADO!</h2>
        <ul class="filas">${NIVELES.map((nv, i) => `<li><span>${nv.nombre}</span><b>${"★".repeat(estrellas[i] || 0)}${"☆".repeat(3 - (estrellas[i] || 0))}</b></li>`).join("")}
          <li><span>PUNTOS</span><b>${puntos}</b></li><li><span>DIFICULTAD</span><b>${D().nombre}</b></li></ul>
        <div class="nota"><small>NOTA</small><b>${n}</b></div>
        <p class="sello">Sello del jueves conseguido ✔</p>
        <div class="fila"><a class="b principal" href="index.html">VOLVER A SHAKE WEEK</a><button class="b" data-accion="empezar">↻ MEJORAR NOTA</button></div></div>`;
      estado = "resultados";
    } else if (tipo === "pausa") {
      menu.innerHTML = `<div class="caja"><h2>PAUSA</h2><div class="fila col">
        <button class="b principal" data-accion="continuar">▶ CONTINUAR</button><button class="b" data-accion="repetir">↻ REPETIR TORRE</button><a class="b" href="index.html">SALIR</a></div></div>`;
    }
    const p = menu.querySelector(".principal"); if (p) p.focus();
  }
  function estrellasSonido(n) { for (let i = 0; i < n; i++) setTimeout(() => sfx.estrella(i), 250 * i + 150); }
  menu.addEventListener("click", e => {
    const op = e.target.closest("[data-dif]");
    if (op) { dif = op.dataset.dif; guardarPref("shakeweek-dia4", dif); Sonido.iniciar(); Sonido.tono(880, 880, 0.05); mostrarMenu("titulo"); return; }
    const b = e.target.closest("[data-accion]"); if (!b) return;
    Sonido.iniciar(); const a = b.dataset.accion;
    if (a === "empezar") { puntos = 0; estrellas = []; Sonido.empezarMusica(CANCION); montarNivel(0); }
    if (a === "siguiente") montarNivel(nivelIdx + 1);
    if (a === "repetir") { puntos -= puntosNivel; montarNivel(nivelIdx); }
    if (a === "resultados") mostrarMenu("resultados");
    if (a === "continuar") pausar();
  });
  function accionPrincipal() { const p = menu.querySelector(".principal"); if (p) p.click(); }
  let previoEstado = null;
  function pausar() {
    if (estado === "juego") { previoEstado = estado; estado = "pausa"; Sonido.pararMusica(); mostrarMenu("pausa"); }
    else if (estado === "pausa") { estado = previoEstado; ocultarMenu(); Sonido.empezarMusica(CANCION); }
  }
  document.getElementById("btnPausa")?.addEventListener("click", pausar);
  document.getElementById("btnSonido")?.addEventListener("click", () => { Sonido.iniciar(); Sonido.alternar(); });

  /* ---------------- Bucle ---------------- */
  let previo = performance.now();
  function bucle(ahora) {
    const dt = Math.min(1 / 30, (ahora - previo) / 1000); previo = ahora;
    if (estado === "titulo") reloj += dt; else actualizar(dt);
    dibujar();
    requestAnimationFrame(bucle);
  }

  Promise.all([cargar("sprites/heroe-44.png"), cargar("sprites/alter-ego-36.png"), cargar("sprites/alter-ego-mini.png")]).then(([h, c, r]) => {
    A.heroe = h; A.clon = c; A.clonRey = r;
    A.clonBlanco = SW.tintar(c, PAL.blanco); A.clonReyBlanco = SW.tintar(r, PAL.blanco);
    post = crearPost();
    estado = "titulo"; mostrarMenu("titulo");
    requestAnimationFrame(bucle);
  });
  window.__dia4 = { destruir, get estado() { return estado; }, get clones() { return clones; }, get municion() { return municion; }, lanzar, usarPoder, montarNivel, terminarNivel, get proyectiles() { return proyectiles; }, get cuerpos() { return cuerpos; } };
})();
