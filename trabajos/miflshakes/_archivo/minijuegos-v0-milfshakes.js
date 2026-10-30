/* =========================================================
   SHAKE WEEK · 5 minijuegos (uno por día)
   Motor común + 5 juegos en <canvas>. Sin librerías.
   ========================================================= */
(function () {
  const W = 960, H = 540;

  // ---------- Paleta ----------
  const C = {
    crema: "#F6EBD9", tinta: "#1B1712", azul: "#3E78C9", rojo: "#C4403D",
    naranja: "#C1863A", cian: "#5FCFCB", rosa: "#F4A6B8", blanco: "#FFFDF8"
  };

  // ---------- Imágenes ----------
  function cargar(src) { const i = new Image(); i.src = src; return i; }
  const IMG = { heroe: cargar("heroe.png"), villano: cargar("villano.png") };

  // ---------- Entrada (teclado + táctil) ----------
  const input = { izq: false, der: false, salto: false, saltoPulsado: false };
  const teclas = {
    ArrowLeft: "izq", KeyA: "izq", ArrowRight: "der", KeyD: "der",
    ArrowUp: "salto", KeyW: "salto", Space: "salto"
  };
  addEventListener("keydown", e => {
    const k = teclas[e.code]; if (!k || !motor.activo) return;
    e.preventDefault();
    if (k === "salto" && !input.salto) input.saltoPulsado = true;
    input[k] = true;
  });
  addEventListener("keyup", e => { const k = teclas[e.code]; if (k) input[k] = false; });
  function enlazarTactil(raiz) {
    raiz.querySelectorAll("[data-k]").forEach(b => {
      const k = b.dataset.k;
      const on = e => { e.preventDefault(); if (k === "salto" && !input.salto) input.saltoPulsado = true; input[k] = true; b.classList.add("on"); };
      const off = e => { e.preventDefault(); input[k] = false; b.classList.remove("on"); };
      b.addEventListener("pointerdown", on);
      b.addEventListener("pointerup", off);
      b.addEventListener("pointerleave", off);
      b.addEventListener("pointercancel", off);
    });
  }

  // ---------- Utilidades de dibujo ----------
  const ratioH = () => (IMG.heroe.naturalWidth || 191) / (IMG.heroe.naturalHeight || 322);
  function personaje(ctx, img, x, y, alto, girar = false, estirar = 1, rot = 0, alfa = 1) {
    // (x, y) = centro de los pies
    const an = alto * ratioH();
    ctx.save();
    ctx.globalAlpha = alfa;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale((girar ? -1 : 1) / Math.sqrt(estirar), estirar);
    if (img.complete && img.naturalWidth) ctx.drawImage(img, -an / 2, -alto, an, alto);
    else { ctx.fillStyle = C.azul; ctx.fillRect(-an / 2, -alto, an, alto); }
    ctx.restore();
  }
  function sombra(ctx, x, y, an) {
    ctx.save(); ctx.fillStyle = "rgba(27,23,18,.22)";
    ctx.beginPath(); ctx.ellipse(x, y, an, an * 0.22, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  function texto(ctx, t, x, y, tam, color = C.blanco, alinear = "center") {
    ctx.save();
    ctx.font = `${tam}px "Luckiest Guy", "Arial Black", sans-serif`;
    ctx.textAlign = alinear; ctx.textBaseline = "middle";
    ctx.lineJoin = "round"; ctx.lineWidth = Math.max(4, tam / 5); ctx.strokeStyle = C.tinta;
    ctx.strokeText(t, x, y); ctx.fillStyle = color; ctx.fillText(t, x, y);
    ctx.restore();
  }
  function emoji(ctx, e, x, y, tam, rot = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.font = `${tam}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(e, 0, 0); ctx.restore();
  }
  function choca(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
  function vidas(ctx, n, max = 3) {
    for (let i = 0; i < max; i++) {
      ctx.globalAlpha = i < n ? 1 : 0.25; emoji(ctx, "🥤", 34 + i * 38, 34, 28);
    }
    ctx.globalAlpha = 1;
  }
  // Fondo retro: rayos de sol + suelo de cuadros
  function fondoRayos(ctx, t, c1, c2, cx = W / 2, cy = H * 0.55) {
    ctx.fillStyle = c1; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.05); ctx.fillStyle = c2;
    for (let i = 0; i < 16; i++) {
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.arc(0, 0, 1200, (i * 2) * Math.PI / 16, (i * 2 + 1) * Math.PI / 16); ctx.fill();
    }
    ctx.restore();
  }
  function suelo(ctx, y, desp = 0, c1 = C.tinta, c2 = C.crema, lado = 40) {
    const off = ((desp % lado) + lado) % lado;
    for (let fila = 0; fila * lado < H - y; fila++) {
      for (let sx = -off; sx < W; sx += lado) {
        const col = Math.round((sx + desp) / lado) + fila;
        ctx.fillStyle = ((col % 2) + 2) % 2 ? c1 : c2;
        ctx.fillRect(sx, y + fila * lado, lado, lado);
      }
    }
    ctx.fillStyle = C.rojo; ctx.fillRect(0, y - 8, W, 10);
  }
  function nube(ctx, x, y, s) {
    ctx.save(); ctx.fillStyle = C.blanco; ctx.strokeStyle = C.tinta; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 26 * s, Math.PI * 0.5, Math.PI * 1.5);
    ctx.arc(x + 30 * s, y - 22 * s, 30 * s, Math.PI, Math.PI * 2);
    ctx.arc(x + 66 * s, y - 8 * s, 24 * s, Math.PI * 1.2, Math.PI * 0.5);
    ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }

  // Partículas
  function particulas(g, x, y, colores, n = 14, vel = 260) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = vel * (0.4 + Math.random() * 0.8);
      g.part.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, t: 0.7 + Math.random() * 0.4, c: colores[i % colores.length], r: 4 + Math.random() * 5 });
    }
  }
  function actualizarParticulas(g, dt) {
    g.part = g.part.filter(p => (p.t -= dt) > 0);
    g.part.forEach(p => { p.vy += 700 * dt; p.x += p.vx * dt; p.y += p.vy * dt; });
  }
  function dibujarParticulas(ctx, g, camX = 0) {
    g.part.forEach(p => {
      ctx.globalAlpha = Math.min(1, p.t * 2); ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x - camX, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
  function flotante(g, t, x, y, color = C.blanco) { g.flot.push({ t, x, y, vida: 0.9, color }); }
  function dibujarFlotantes(ctx, g, dt, camX = 0) {
    g.flot = g.flot.filter(f => (f.vida -= dt) > 0);
    g.flot.forEach(f => { f.y -= 60 * dt; ctx.globalAlpha = Math.min(1, f.vida * 2); texto(ctx, f.t, f.x - camX, f.y, 26, f.color); });
    ctx.globalAlpha = 1;
  }

  /* =========================================================
     DÍA 1 · LUNES — «Huida de la cocina» (plataformas)
     ========================================================= */
  const plataformas = {
    id: 1, dia: "Lunes", titulo: "Huida de la cocina",
    historia: "Contrashake ha invadido la cocina. Cruza la encimera, salta sobre sus secuaces y llega al mostrador.",
    controles: "← → para moverte · Espacio / ↑ para saltar · Pisa a los secuaces para eliminarlos",
    objetivo: "Llega al mostrador",
    iniciar(g) {
      const SUELO = 460;
      g.SUELO = SUELO;
      g.suelos = [[0, 900], [1040, 1800], [1960, 2700], [2860, 3520], [3680, 4500]].map(([a, b]) => ({ x: a, y: SUELO, w: b - a, h: 200 }));
      g.plats = [[480, 350, 150], [1120, 340, 160], [1360, 250, 140], [1600, 350, 130], [2120, 330, 160], [2380, 240, 160], [2960, 350, 140], [3200, 270, 150], [3440, 190, 120], [3800, 340, 170]]
        .map(([x, y, w]) => ({ x, y, w, h: 22 }));
      g.enem = [[600, 860], [1250, 1750], [2000, 2650], [2400, 2520, 240], [2950, 3480], [3700, 4100], [3820, 3950, 340]]
        .map(([a, b, y]) => ({ a, b, x: a, y: (y || SUELO), dir: 1, vivo: true, w: 34, h: 48 }));
      g.items = [];
      [[560, 300], [640, 300], [1180, 290], [1420, 200], [1480, 200], [1660, 300], [2180, 280], [2440, 190], [2500, 190], [3020, 300], [3260, 220], [3480, 140], [3860, 290], [3920, 290], [970, 380], [1880, 380], [2780, 380], [3600, 380]]
        .forEach(([x, y], i) => g.items.push({ x, y, e: ["🍓", "🍫", "🍪", "🍒", "🍌"][i % 5], ok: false }));
      g.meta = 4320;
      g.p = { x: 80, y: SUELO - 64, w: 38, h: 64, vx: 0, vy: 0, suelo: false, coyote: 0, buffer: 0, mira: 1, inv: 0, est: 1 };
      g.control = 80; g.vidas = 3; g.recogidos = 0; g.cam = 0; g.tiempo = 0;
    },
    actualizar(g, dt) {
      const p = g.p; g.tiempo += dt;
      const acel = p.suelo ? 2600 : 1600, max = 310;
      if (input.izq) { p.vx = Math.max(-max, p.vx - acel * dt); p.mira = -1; }
      else if (input.der) { p.vx = Math.min(max, p.vx + acel * dt); p.mira = 1; }
      else p.vx *= p.suelo ? 0.78 : 0.95;
      if (input.saltoPulsado) p.buffer = 0.12;
      p.buffer -= dt; p.coyote -= dt;
      if (p.buffer > 0 && p.coyote > 0) { p.vy = -820; p.buffer = 0; p.coyote = 0; p.est = 1.25; }
      if (!input.salto && p.vy < -300) p.vy = -300; // salto variable
      p.vy = Math.min(p.vy + 2200 * dt, 1100);

      // Movimiento horizontal + paredes de los suelos
      p.x += p.vx * dt; p.x = Math.max(0, p.x);
      g.suelos.forEach(s => {
        if (choca(p, s) && p.y + p.h > s.y + 6) { if (p.vx > 0) p.x = s.x - p.w; else p.x = s.x + s.w; p.vx = 0; }
      });
      // Movimiento vertical
      const antes = p.y + p.h; p.y += p.vy * dt; p.suelo = false;
      [...g.suelos, ...g.plats].forEach(s => {
        if (p.vy >= 0 && antes <= s.y + 2 && p.y + p.h >= s.y && p.x + p.w > s.x + 4 && p.x < s.x + s.w - 4) {
          p.y = s.y - p.h; p.vy = 0; p.suelo = true; p.coyote = 0.1;
          if (s.h > 100) g.control = Math.max(g.control, Math.min(p.x, s.x + s.w - 80));
        }
      });
      p.est += (1 - p.est) * Math.min(1, dt * 10);
      if (p.suelo && Math.abs(p.vy) < 1 && antes < p.y + p.h - 1) p.est = 0.8;
      p.inv -= dt;

      // Caída al vacío
      if (p.y > H + 60) dano(g, true);

      // Enemigos
      g.enem.forEach(e => {
        if (!e.vivo) { e.muerto = (e.muerto || 0) + dt; return; }
        e.x += e.dir * 90 * dt;
        if (e.x < e.a) { e.x = e.a; e.dir = 1; } if (e.x > e.b) { e.x = e.b; e.dir = -1; }
        const caja = { x: e.x - e.w / 2, y: e.y - e.h, w: e.w, h: e.h };
        if (choca(p, caja)) {
          if (p.vy > 0 && antes <= caja.y + 14) {
            e.vivo = false; p.vy = -560; p.est = 1.3; g.puntos += 50;
            particulas(g, e.x, e.y - 24, [C.cian, C.tinta, C.naranja]); flotante(g, "+50", e.x, e.y - 60);
          } else if (p.inv <= 0) dano(g, false, e.x);
        }
      });
      // Toppings
      g.items.forEach(it => {
        if (!it.ok && Math.abs(p.x + p.w / 2 - it.x) < 32 && Math.abs(p.y + p.h / 2 - it.y) < 40) {
          it.ok = true; g.recogidos++; g.puntos += 10; particulas(g, it.x, it.y, [C.rosa, C.rojo, C.blanco], 8, 160);
        }
      });
      g.cam += (Math.max(0, Math.min(p.x - W * 0.38, g.meta + 300 - W)) - g.cam) * Math.min(1, dt * 8);
      if (p.x > g.meta) g.fin(true, g.puntos + Math.max(0, 300 - Math.floor(g.tiempo) * 3), `${g.recogidos}/${g.items.length} toppings`);

      function dano(g, caida, ex) {
        g.vidas--; particulas(g, p.x + p.w / 2, Math.min(p.y, H - 40), [C.azul, C.blanco, C.rojo]);
        if (g.vidas <= 0) return g.fin(false, g.puntos);
        if (caida) { p.x = g.control; p.y = 100; p.vx = 0; p.vy = 0; }
        else { p.vy = -420; p.vx = (p.x < ex ? -1 : 1) * 300; }
        p.inv = 1.6;
      }
    },
    dibujar(ctx, g) {
      const t = g.reloj, cam = g.cam;
      fondoRayos(ctx, t, C.azul, "#5689D2", W / 2, H);
      // Azulejos de cocina al fondo (parallax)
      ctx.save(); ctx.globalAlpha = 0.18; ctx.strokeStyle = C.blanco; ctx.lineWidth = 2;
      const off = -(cam * 0.3) % 60;
      for (let x = off; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 300); ctx.stroke(); }
      for (let y = 0; y < 300; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.restore();
      [[100, 90, 1], [520, 60, 0.8], [900, 120, 1.1], [1400, 80, 0.9]].forEach(([x, y, s]) => nube(ctx, ((x - cam * 0.2) % 1600 + 1600) % 1600 - 200, y, s));

      // Suelos (encimera)
      g.suelos.forEach(s => {
        const x = s.x - cam; if (x > W || x + s.w < 0) return;
        ctx.fillStyle = C.crema; ctx.fillRect(x, s.y, s.w, s.h);
        for (let i = 0; i < s.w; i += 40) for (let j = 0; j < 4; j++) { if ((i / 40 + j) % 2) { ctx.fillStyle = C.tinta; ctx.fillRect(x + i, s.y + 14 + j * 40, 40, 40); } }
        ctx.fillStyle = C.rojo; ctx.fillRect(x, s.y, s.w, 14);
        ctx.strokeStyle = C.tinta; ctx.lineWidth = 4; ctx.strokeRect(x, s.y, s.w, s.h + 10);
      });
      // Plataformas (estantes)
      g.plats.forEach(s => {
        const x = s.x - cam; if (x > W || x + s.w < 0) return;
        ctx.fillStyle = C.blanco; ctx.strokeStyle = C.tinta; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.roundRect(x, s.y, s.w, s.h, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = C.rojo; for (let i = 8; i < s.w - 8; i += 24) ctx.fillRect(x + i, s.y + 6, 12, 10);
      });
      // Meta: mostrador
      const mx = g.meta - cam;
      ctx.fillStyle = C.rojo; ctx.strokeStyle = C.tinta; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.roundRect(mx, g.SUELO - 150, 160, 150, 10); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.blanco; ctx.fillRect(mx + 10, g.SUELO - 110, 140, 18);
      texto(ctx, "MOSTRADOR", mx + 80, g.SUELO - 175, 26, C.crema);
      emoji(ctx, "🥤", mx + 80, g.SUELO - 60, 54 + Math.sin(t * 4) * 4);

      // Toppings
      g.items.forEach(it => { if (!it.ok) emoji(ctx, it.e, it.x - cam, it.y + Math.sin(t * 3 + it.x) * 5, 30); });
      // Enemigos (mini Contrashake)
      g.enem.forEach(e => {
        if (!e.vivo) { if (e.muerto < 0.4) personaje(ctx, IMG.villano, e.x - cam, e.y, 50, e.dir < 0, 0.3, 0, 1 - e.muerto * 2.5); return; }
        sombra(ctx, e.x - cam, e.y, 18);
        personaje(ctx, IMG.villano, e.x - cam, e.y, 52, e.dir > 0, 1 + Math.sin(t * 12 + e.a) * 0.05);
      });
      // Héroe
      const p = g.p;
      if (!(p.inv > 0 && Math.floor(t * 12) % 2)) {
        if (p.suelo) sombra(ctx, p.x + p.w / 2 - cam, p.y + p.h, 20);
        personaje(ctx, IMG.heroe, p.x + p.w / 2 - cam, p.y + p.h + 2, 72, p.mira < 0, p.est, p.vx / 2000);
      }
      dibujarParticulas(ctx, g, cam);
      dibujarFlotantes(ctx, g, g.dt, cam);
      // HUD
      vidas(ctx, g.vidas);
      texto(ctx, `🍓 ${g.recogidos}`, W / 2 - 80, 34, 28);
      texto(ctx, `${g.puntos} pts`, W - 24, 34, 28, C.crema, "right");
      const prog = Math.min(1, g.p.x / g.meta);
      ctx.fillStyle = "rgba(27,23,18,.35)"; ctx.fillRect(W / 2 - 10, 26, 200, 14);
      ctx.fillStyle = C.crema; ctx.fillRect(W / 2 - 10, 26, 200 * prog, 14);
    }
  };

  /* =========================================================
     DÍA 2 · MARTES — «Lluvia de toppings» (atrapar)
     ========================================================= */
  const lluvia = {
    id: 2, dia: "Martes", titulo: "Lluvia de toppings",
    historia: "Contrashake lanza ingredientes desde el techo, pero mezcla guindillas, sal y cebolla. Atrapa solo lo dulce.",
    controles: "← → para moverte · Atrapa 25 toppings dulces en 40 segundos · Esquiva 🌶️ 🧂 🧅",
    objetivo: "Atrapa 25 toppings",
    iniciar(g) {
      g.p = { x: W / 2, vx: 0, mira: 1, inv: 0, est: 1 };
      g.cosas = []; g.prox = 0.6; g.vidas = 3; g.atrapados = 0; g.meta = 25; g.resto = 40; g.combo = 0;
      g.v = { x: W / 2, dir: 1, lanza: 0 };
    },
    actualizar(g, dt) {
      const p = g.p; g.resto -= dt;
      if (input.izq) { p.vx = Math.max(-560, p.vx - 4000 * dt); p.mira = -1; }
      else if (input.der) { p.vx = Math.min(560, p.vx + 4000 * dt); p.mira = 1; }
      else p.vx *= 0.8;
      p.x = Math.max(40, Math.min(W - 40, p.x + p.vx * dt)); p.inv -= dt;
      p.est += (1 - p.est) * Math.min(1, dt * 10);

      const v = g.v; v.x += v.dir * (170 + g.atrapados * 6) * dt;
      if (v.x < 80 || v.x > W - 80) v.dir *= -1;
      if (Math.random() < dt * 0.5) v.dir *= -1;
      v.lanza -= dt;
      g.prox -= dt;
      if (g.prox <= 0) {
        const malo = Math.random() < 0.28 + g.atrapados * 0.006;
        const desde = Math.random() < 0.55 ? v.x : 60 + Math.random() * (W - 120);
        g.cosas.push({ x: desde, y: 130, vy: 120 + Math.random() * 80 + g.atrapados * 5, malo, e: malo ? ["🌶️", "🧂", "🧅"][Math.floor(Math.random() * 3)] : ["🍓", "🍫", "🍪", "🍌", "🍒", "🍩"][Math.floor(Math.random() * 6)], rot: 0, vr: (Math.random() - 0.5) * 4 });
        g.prox = Math.max(0.28, 0.75 - g.atrapados * 0.016) * (0.7 + Math.random() * 0.6);
        v.lanza = 0.25;
      }
      g.cosas.forEach(c => {
        c.vy += 380 * dt; c.y += c.vy * dt; c.rot += c.vr * dt;
        if (!c.fuera && c.y > 400 && c.y < 470 && Math.abs(c.x - p.x) < 52) {
          c.fuera = true;
          if (c.malo) {
            if (p.inv <= 0) { g.vidas--; p.inv = 1.2; g.combo = 0; particulas(g, c.x, c.y, [C.rojo, C.naranja, C.tinta]); flotante(g, "¡Puaj!", p.x, 360, C.rojo); }
          } else {
            g.atrapados++; g.combo++; const pts = 10 + Math.min(g.combo, 10) * 2; g.puntos += pts;
            p.est = 0.75; particulas(g, c.x, c.y, [C.rosa, C.blanco, C.azul], 8, 160);
            flotante(g, g.combo > 2 ? `x${g.combo}` : `+${pts}`, p.x, 360);
          }
        }
      });
      g.cosas = g.cosas.filter(c => !c.fuera && c.y < H + 40);
      if (g.vidas <= 0) g.fin(false, g.puntos, `${g.atrapados}/${g.meta} toppings`);
      else if (g.atrapados >= g.meta) g.fin(true, g.puntos + Math.floor(g.resto) * 10, `Con ${Math.ceil(g.resto)} s de sobra`);
      else if (g.resto <= 0) g.fin(false, g.puntos, `${g.atrapados}/${g.meta} toppings`);
    },
    dibujar(ctx, g) {
      const t = g.reloj;
      fondoRayos(ctx, t, C.rosa, "#F7B9C7", W / 2, 120);
      // Toldo de heladería
      for (let i = 0; i < W; i += 60) {
        ctx.fillStyle = (i / 60) % 2 ? C.blanco : C.rojo;
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 60, 0); ctx.lineTo(i + 60, 70);
        ctx.arc(i + 30, 70, 30, 0, Math.PI); ctx.closePath(); ctx.fill();
      }
      ctx.strokeStyle = C.tinta; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(W, 2); ctx.stroke();
      suelo(ctx, 470, 0);
      // Villano arriba
      personaje(ctx, IMG.villano, g.v.x, 150 + Math.sin(t * 6) * 4, 104, g.v.dir > 0, g.v.lanza > 0 ? 0.85 : 1);
      g.cosas.forEach(c => emoji(ctx, c.e, c.x, c.y, 40, c.rot));
      const p = g.p;
      sombra(ctx, p.x, 472, 26);
      if (!(p.inv > 0 && Math.floor(t * 12) % 2)) personaje(ctx, IMG.heroe, p.x, 474, 96, p.mira < 0, p.est, p.vx / 3000);
      dibujarParticulas(ctx, g); dibujarFlotantes(ctx, g, g.dt);
      vidas(ctx, g.vidas);
      texto(ctx, `${g.atrapados} / ${g.meta}`, W / 2, 34, 34, C.crema);
      texto(ctx, `⏱ ${Math.max(0, Math.ceil(g.resto))}`, W - 24, 34, 30, g.resto < 10 ? C.rojo : C.crema, "right");
    }
  };

  /* =========================================================
     DÍA 3 · MIÉRCOLES — «Vuelo de pajita» (tipo Flappy)
     ========================================================= */
  const vuelo = {
    id: 3, dia: "Miércoles", titulo: "Vuelo de pajita",
    historia: "Contrashake ha levantado un muro de pajitas gigantes. Sopla por la tuya para volar y cruza 12 huecos.",
    controles: "Espacio / ↑ / toca el botón para impulsarte · No toques las pajitas ni el suelo",
    objetivo: "Cruza 12 pajitas",
    iniciar(g) {
      g.p = { y: H / 2, vy: 0 }; g.tubos = []; g.prox = 0.4; g.pasados = 0; g.meta = 12; g.desp = 0;
      g.vidas = 3; g.inv = 0;
    },
    actualizar(g, dt) {
      const p = g.p; g.desp += 230 * dt; g.inv -= dt;
      if (input.saltoPulsado) { p.vy = -470; particulas(g, 210, p.y + 20, [C.blanco, C.crema], 4, 80); }
      p.vy = Math.min(p.vy + 1500 * dt, 700); p.y += p.vy * dt;
      g.prox -= dt;
      if (g.prox <= 0 && g.tubos.length + g.pasados < g.meta) {
        const hueco = Math.max(160, 210 - g.pasados * 4);
        const cy = 140 + Math.random() * (H - 320);
        g.tubos.push({ x: W + 40, cy, hueco, ok: false });
        g.prox = 1.35;
      }
      const caja = { x: 222 - 22, y: p.y - 48, w: 44, h: 50 };
      g.tubos.forEach(tb => {
        tb.x -= 230 * dt;
        const arriba = { x: tb.x - 38, y: -20, w: 76, h: tb.cy - tb.hueco / 2 + 20 };
        const abajo = { x: tb.x - 38, y: tb.cy + tb.hueco / 2, w: 76, h: H };
        if (g.inv <= 0 && (choca(caja, arriba) || choca(caja, abajo))) golpe();
        if (!tb.ok && tb.x < 200) { tb.ok = true; g.pasados++; g.puntos += 25; flotante(g, "+25", 222, p.y - 80); }
      });
      g.tubos = g.tubos.filter(tb => tb.x > -80);
      if (p.y < 60) { p.y = 60; p.vy = Math.max(p.vy, 60); }
      if (p.y > 470) { if (g.inv <= 0) golpe(); p.y = 470; p.vy = -520; }
      if (g.pasados >= g.meta && g.tubos.length === 0) g.fin(true, g.puntos + g.vidas * 50, `${g.vidas} vida(s) de sobra`);
      function golpe() {
        g.vidas--; g.inv = 1.4; particulas(g, 222, p.y - 24, [C.azul, C.rojo, C.blanco]);
        if (g.vidas <= 0) g.fin(false, g.puntos, `${g.pasados}/${g.meta} pajitas`);
      }
    },
    dibujar(ctx, g) {
      const t = g.reloj;
      const grad = ctx.createLinearGradient(0, 0, 0, H); grad.addColorStop(0, "#9FD3F0"); grad.addColorStop(1, "#E9F6F1");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
      [[80, 110, 1], [420, 70, 0.8], [760, 140, 1.2], [1100, 90, 0.9]].forEach(([x, y, s]) => nube(ctx, ((x - g.desp * 0.25) % 1300 + 1300) % 1300 - 150, y, s));
      // Ciudad lejana
      ctx.fillStyle = "#B6DCEB";
      for (let i = 0; i < 14; i++) { const bx = ((i * 110 - g.desp * 0.5) % 1540 + 1540) % 1540 - 120; ctx.fillRect(bx, 470 - (60 + (i * 37) % 120), 80, 200); }
      // Pajitas
      g.tubos.forEach(tb => {
        const dib = (y, h, tapa) => {
          ctx.save(); ctx.beginPath(); ctx.rect(tb.x - 34, y, 68, h); ctx.clip();
          ctx.fillStyle = C.tinta; ctx.fillRect(tb.x - 34, y, 68, h);
          ctx.fillStyle = C.cian; for (let k = -80; k < H + 80; k += 40) { ctx.beginPath(); ctx.moveTo(tb.x - 34, k); ctx.lineTo(tb.x + 34, k - 30); ctx.lineTo(tb.x + 34, k - 12); ctx.lineTo(tb.x - 34, k + 18); ctx.fill(); }
          ctx.restore();
          ctx.strokeStyle = C.tinta; ctx.lineWidth = 4; ctx.strokeRect(tb.x - 34, y, 68, h);
          ctx.fillStyle = C.naranja; ctx.beginPath(); ctx.roundRect(tb.x - 42, tapa - 12, 84, 24, 8); ctx.fill(); ctx.stroke();
        };
        dib(-10, tb.cy - tb.hueco / 2 + 10, tb.cy - tb.hueco / 2);
        dib(tb.cy + tb.hueco / 2, H, tb.cy + tb.hueco / 2);
      });
      suelo(ctx, 480, g.desp, C.tinta, C.crema, 30);
      const p = g.p;
      if (!(g.inv > 0 && Math.floor(t * 12) % 2)) personaje(ctx, IMG.heroe, 222, p.y + 14, 70, false, 1, Math.max(-0.4, Math.min(0.6, p.vy / 900)));
      // Villano que observa
      personaje(ctx, IMG.villano, W - 70, 474 + Math.sin(t * 3) * 3, 80, false, 1);
      dibujarParticulas(ctx, g); dibujarFlotantes(ctx, g, g.dt);
      vidas(ctx, g.vidas);
      texto(ctx, `${g.pasados} / ${g.meta}`, W / 2, 40, 40, C.blanco);
    }
  };

  /* =========================================================
     DÍA 4 · JUEVES — «Carrera al mostrador» (runner)
     ========================================================= */
  const carrera = {
    id: 4, dia: "Jueves", titulo: "Carrera al mostrador",
    historia: "Contrashake te persigue por la calle lanzando cubitos y vasos. Corre 1.000 metros sin que te alcance.",
    controles: "Espacio / ↑ para saltar · Pulsa otra vez en el aire para doble salto",
    objetivo: "Corre 1.000 m",
    iniciar(g) {
      g.p = { y: 460, vy: 0, saltos: 0, est: 1 }; g.obs = []; g.items = []; g.prox = 1.4; g.dist = 0; g.meta = 1000;
      g.vel = 360; g.vidas = 3; g.inv = 0; g.desp = 0;
    },
    actualizar(g, dt) {
      const p = g.p; g.vel = Math.min(640, 360 + g.dist * 0.32); g.desp += g.vel * dt; g.dist += g.vel * dt / 12; g.inv -= dt;
      if (input.saltoPulsado && p.saltos < 2) { p.vy = p.saltos ? -680 : -780; p.saltos++; p.est = 1.25; if (p.saltos === 2) particulas(g, 180, p.y, [C.blanco], 6, 120); }
      if (!input.salto && p.vy < -260 && p.saltos === 1) p.vy = -260;
      p.vy += 2300 * dt; p.y += p.vy * dt;
      if (p.y >= 460) { if (p.vy > 400) p.est = 0.78; p.y = 460; p.vy = 0; p.saltos = 0; }
      p.est += (1 - p.est) * Math.min(1, dt * 10);
      g.prox -= dt;
      if (g.prox <= 0 && g.dist < g.meta - 40) {
        const tipo = Math.random(); let o;
        if (tipo < 0.4) o = { tipo: "cubo", w: 44, h: 44 };
        else if (tipo < 0.75) o = { tipo: "secuaz", w: 40, h: 58 };
        else o = { tipo: "pila", w: 44, h: 88 };
        o.x = W + 40; g.obs.push(o);
        if (Math.random() < 0.6) g.items.push({ x: W + 40 + (Math.random() < 0.5 ? 0 : 150), y: 260 + Math.random() * 90, e: ["🍓", "🍫", "🍪", "🍒"][Math.floor(Math.random() * 4)] });
        g.prox = (0.75 + Math.random() * 0.9) * 360 / g.vel + 0.25;
      }
      const caja = { x: 180 - 18, y: p.y - 60, w: 36, h: 58 };
      g.obs.forEach(o => {
        o.x -= g.vel * dt; if (o.tipo === "secuaz") o.x -= 60 * dt;
        const c = { x: o.x - o.w / 2 + 4, y: 460 - o.h + 4, w: o.w - 8, h: o.h - 4 };
        if (!o.golpe && g.inv <= 0 && choca(caja, c)) {
          o.golpe = true; g.vidas--; g.inv = 1.5; particulas(g, 180, p.y - 30, [C.azul, C.rojo, C.blanco]);
          flotante(g, "¡Ay!", 180, p.y - 90, C.rojo);
          if (g.vidas <= 0) g.fin(false, g.puntos + Math.floor(g.dist), `${Math.floor(g.dist)} m recorridos`);
        }
      });
      g.items.forEach(it => {
        it.x -= g.vel * dt;
        if (!it.ok && Math.abs(it.x - 180) < 34 && Math.abs(it.y - (p.y - 32)) < 44) { it.ok = true; g.puntos += 20; flotante(g, "+20", it.x, it.y - 30); particulas(g, it.x, it.y, [C.rosa, C.blanco], 6, 120); }
      });
      g.obs = g.obs.filter(o => o.x > -80); g.items = g.items.filter(i => i.x > -60 && !i.ok);
      if (g.dist >= g.meta) g.fin(true, g.puntos + 1000 + g.vidas * 100, `${g.vidas} vida(s) de sobra`);
    },
    dibujar(ctx, g) {
      const t = g.reloj;
      fondoRayos(ctx, t, C.naranja, "#CF9650", W * 0.8, H);
      // Fachadas
      for (let i = 0; i < 10; i++) {
        const bx = ((i * 190 - g.desp * 0.4) % 1900 + 1900) % 1900 - 190, bh = 160 + (i * 53) % 110;
        ctx.fillStyle = i % 2 ? C.crema : "#EBD9BD"; ctx.strokeStyle = C.tinta; ctx.lineWidth = 4;
        ctx.fillRect(bx, 460 - bh, 170, bh); ctx.strokeRect(bx, 460 - bh, 170, bh);
        ctx.fillStyle = i % 3 ? C.azul : C.rojo;
        for (let w = 0; w < 3; w++) ctx.fillRect(bx + 18 + w * 50, 460 - bh + 24, 30, 36);
      }
      suelo(ctx, 460, g.desp, C.tinta, C.crema, 40);
      // Obstáculos
      g.obs.forEach(o => {
        if (o.tipo === "secuaz") { sombra(ctx, o.x, 460, 18); personaje(ctx, IMG.villano, o.x, 462, 60, false, 1 + Math.sin(t * 16) * 0.06); return; }
        const n = o.tipo === "pila" ? 2 : 1;
        for (let k = 0; k < n; k++) {
          const y = 460 - 44 * (k + 1);
          ctx.fillStyle = "rgba(160,225,240,.85)"; ctx.strokeStyle = C.tinta; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.roundRect(o.x - 22, y, 44, 44, 8); ctx.fill(); ctx.stroke();
          ctx.fillStyle = C.blanco; ctx.fillRect(o.x - 12, y + 8, 10, 6);
        }
      });
      g.items.forEach(it => emoji(ctx, it.e, it.x, it.y + Math.sin(t * 4 + it.x) * 6, 32));
      const p = g.p;
      sombra(ctx, 180, 462, 20 * Math.max(0.4, 1 - (460 - p.y) / 300));
      if (!(g.inv > 0 && Math.floor(t * 12) % 2)) {
        const paso = p.y >= 460 ? Math.sin(t * 22) * 0.12 : 0;
        personaje(ctx, IMG.heroe, 180, p.y + 2, 74, false, p.est, paso + (p.saltos === 2 ? (t * 12) % (Math.PI * 2) : 0));
      }
      // Villano persiguiendo
      personaje(ctx, IMG.villano, 60, 462 + Math.abs(Math.sin(t * 10)) * -10, 86, true, 1);
      dibujarParticulas(ctx, g); dibujarFlotantes(ctx, g, g.dt);
      vidas(ctx, g.vidas);
      texto(ctx, `${Math.floor(g.dist)} / ${g.meta} m`, W / 2, 36, 34, C.crema);
      texto(ctx, `${g.puntos} pts`, W - 24, 36, 28, C.crema, "right");
    }
  };

  /* =========================================================
     DÍA 5 · VIERNES — «El gran duelo» (jefe final)
     ========================================================= */
  const duelo = {
    id: 5, dia: "Viernes", titulo: "El gran duelo",
    historia: "Cara a cara con Contrashake. Dispárale nata montada hasta vaciarle el vaso y recupera las recetas.",
    controles: "← → para moverte · Disparas solo · Espacio / ↑ para un salto rápido que esquiva",
    objetivo: "Derrota a Contrashake",
    iniciar(g) {
      g.p = { x: W / 2, y: 470, vy: 0, mira: 1, est: 1 };
      g.b = { x: W / 2, y: 210, vida: 70, max: 70, t: 0, ataque: 1.6, golpe: 0 };
      g.balas = []; g.enemigas = []; g.cad = 0; g.vidas = 3; g.inv = 0;
    },
    actualizar(g, dt) {
      const p = g.p, b = g.b; g.inv -= dt;
      if (input.izq) { p.x -= 430 * dt; p.mira = -1; } if (input.der) { p.x += 430 * dt; p.mira = 1; }
      p.x = Math.max(40, Math.min(W - 40, p.x));
      if (input.saltoPulsado && p.y >= 470) { p.vy = -760; p.est = 1.25; }
      p.vy += 2400 * dt; p.y = Math.min(470, p.y + p.vy * dt); if (p.y >= 470) p.vy = 0;
      p.est += (1 - p.est) * Math.min(1, dt * 10);
      // Disparo automático
      g.cad -= dt;
      if (g.cad <= 0) { g.balas.push({ x: p.x, y: p.y - 80 }); g.cad = 0.17; }
      g.balas.forEach(bl => {
        bl.y -= 720 * dt;
        if (!bl.ok && Math.abs(bl.x - b.x) < 62 && bl.y < b.y + 10 && bl.y > b.y - 170) {
          bl.ok = true; b.vida--; b.golpe = 0.08; g.puntos += 10;
          particulas(g, bl.x, bl.y, [C.blanco, C.crema], 4, 120);
        }
      });
      g.balas = g.balas.filter(bl => bl.y > -20 && !bl.ok);
      // Jefe
      const fase = b.vida > 46 ? 1 : b.vida > 22 ? 2 : 3;
      b.t += dt; b.golpe -= dt;
      b.x = W / 2 + Math.sin(b.t * (0.7 + fase * 0.25)) * 340;
      b.y = 210 + Math.sin(b.t * 1.7) * 18;
      b.ataque -= dt;
      if (b.ataque <= 0) {
        const n = fase === 1 ? 1 : fase === 2 ? 3 : 5;
        const ang0 = Math.atan2(p.y - 40 - b.y, p.x - b.x);
        for (let i = 0; i < n; i++) {
          const a = ang0 + (i - (n - 1) / 2) * 0.28, v = 250 + fase * 50;
          g.enemigas.push({ x: b.x, y: b.y - 40, vx: Math.cos(a) * v, vy: Math.sin(a) * v });
        }
        b.ataque = fase === 1 ? 1.2 : fase === 2 ? 1.05 : 0.85;
      }
      const caja = { x: p.x - 16, y: p.y - 56, w: 32, h: 50 };
      g.enemigas.forEach(e => {
        e.x += e.vx * dt; e.y += e.vy * dt;
        if (!e.ok && g.inv <= 0 && choca(caja, { x: e.x - 10, y: e.y - 10, w: 20, h: 20 })) {
          e.ok = true; g.vidas--; g.inv = 1.5; particulas(g, p.x, p.y - 30, [C.azul, C.rojo, C.blanco]);
          if (g.vidas <= 0) g.fin(false, g.puntos, `A Contrashake le quedaba un ${Math.round(b.vida / b.max * 100)} %`);
        }
      });
      g.enemigas = g.enemigas.filter(e => !e.ok && e.y < H + 20 && e.x > -20 && e.x < W + 20);
      if (b.vida <= 0) {
        particulas(g, b.x, b.y - 80, [C.cian, C.tinta, C.naranja, C.blanco], 60, 520);
        g.fin(true, g.puntos + g.vidas * 300, `${g.vidas} vida(s) de sobra`);
      }
    },
    dibujar(ctx, g) {
      const t = g.reloj, b = g.b;
      const fase = b.vida > 46 ? 1 : b.vida > 22 ? 2 : 3;
      fondoRayos(ctx, t * (fase), fase === 3 ? "#3A2A3E" : C.tinta, fase === 3 ? "#4E3752" : "#2C2620", W / 2, 220);
      // Escenario de cine antiguo
      ctx.fillStyle = C.rojo;
      for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(i * 120 + 60, 0, 70, 40, 0, 0, Math.PI); ctx.fill(); }
      ctx.fillRect(0, 0, 40, H); ctx.fillRect(W - 40, 0, 40, H);
      suelo(ctx, 470, 0, C.tinta, C.crema, 48);
      // Jefe
      const temblor = b.golpe > 0 ? (Math.random() - 0.5) * 8 : 0;
      personaje(ctx, IMG.villano, b.x + temblor, b.y, 190, Math.cos(b.t) > 0, 1 + Math.sin(t * 5) * 0.03, Math.sin(b.t * 2) * 0.06, b.golpe > 0 ? 0.6 : 1);
      // Disparos
      g.balas.forEach(bl => {
        ctx.fillStyle = C.blanco; ctx.strokeStyle = C.azul; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(bl.x, bl.y, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });
      g.enemigas.forEach(e => {
        ctx.fillStyle = C.cian; ctx.strokeStyle = C.tinta; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(e.x, e.y, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = C.tinta; ctx.beginPath(); ctx.arc(e.x - 3, e.y - 3, 3, 0, Math.PI * 2); ctx.fill();
      });
      const p = g.p;
      sombra(ctx, p.x, 472, 22);
      if (!(g.inv > 0 && Math.floor(t * 12) % 2)) personaje(ctx, IMG.heroe, p.x, p.y + 2, 78, p.mira < 0, p.est);
      dibujarParticulas(ctx, g); dibujarFlotantes(ctx, g, g.dt);
      // Barra de vida del jefe
      ctx.fillStyle = C.tinta; ctx.fillRect(W / 2 - 204, 22, 408, 26);
      ctx.fillStyle = C.cian; ctx.fillRect(W / 2 - 200, 26, 400 * Math.max(0, b.vida / b.max), 18);
      texto(ctx, "CONTRASHAKE", W / 2, 66, 22, C.crema);
      vidas(ctx, g.vidas);
    }
  };

  const JUEGOS = [plataformas, lluvia, vuelo, carrera, duelo];

  /* =========================================================
     MOTOR
     ========================================================= */
  const motor = { activo: false };
  function jugar(id, canvas, alTerminar) {
    const def = JUEGOS.find(j => j.id === id);
    const ctx = canvas.getContext("2d");
    canvas.width = W; canvas.height = H;
    let terminado = false, previo = performance.now(), cuenta = 3.2, idRaf = 0, fin = 0, resultado = null;
    const g = {
      part: [], flot: [], puntos: 0, reloj: 0, dt: 0,
      fin(gana, puntos, detalle = "") { if (terminado) return; terminado = true; resultado = { gana, puntos: Math.max(0, Math.round(puntos)), detalle }; }
    };
    def.iniciar(g);
    Object.keys(input).forEach(k => input[k] = false);
    motor.activo = true;

    function paso(ahora) {
      const dt = Math.min(1 / 30, (ahora - previo) / 1000); previo = ahora;
      g.dt = dt; g.reloj += dt;
      if (cuenta > 0) cuenta -= dt;
      else if (!terminado) def.actualizar(g, dt);
      else fin += dt;
      actualizarParticulas(g, dt);
      input.saltoPulsado = false;
      ctx.clearRect(0, 0, W, H);
      def.dibujar(ctx, g);
      if (cuenta > 0) {
        ctx.fillStyle = "rgba(27,23,18,.35)"; ctx.fillRect(0, 0, W, H);
        const n = Math.ceil(cuenta - 0.2);
        texto(ctx, n > 0 ? String(n) : "¡YA!", W / 2, H / 2, 120 + (cuenta % 1) * 40, C.crema);
        texto(ctx, def.objetivo.toUpperCase(), W / 2, H / 2 + 100, 34, C.blanco);
      }
      if (terminado) {
        ctx.fillStyle = `rgba(27,23,18,${Math.min(0.55, fin)})`; ctx.fillRect(0, 0, W, H);
        texto(ctx, resultado.gana ? "¡CONSEGUIDO!" : "¡CASI!", W / 2, H / 2, 90, resultado.gana ? C.crema : C.rojo);
        if (fin > 1.2) { parar(); alTerminar(resultado); return; }
      }
      idRaf = requestAnimationFrame(paso);
    }
    function parar() { cancelAnimationFrame(idRaf); motor.activo = false; }
    idRaf = requestAnimationFrame(paso);
    return { parar };
  }

  window.SHAKE = { JUEGOS, jugar, enlazarTactil };
})();
