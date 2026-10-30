/* =============================================================
   SHAKE WEEK · DÍA 4 «LA BATITORRE» — Fondos de cada torre
   1) El Batidín: castillo sobre la montaña (imagen fija de día) y magos en escoba
   2) Bum Galletón: cafetería americana de los años 50
   3) El M***halla: ciudad en guerra, en llamas, con aviones, helicópteros
      y una nave negra con forma de calamar sobre la montaña
   La parte fija se pinta una vez en un lienzo aparte; lo que se mueve
   (escobas, ventilador, neón, fuego, humo, aviones) en cada frame.
   ============================================================= */
(() => {
  "use strict";
  const W = 640, H = 360, G = 318;
  const cache = {};
  const lienzo = () => { const c = document.createElement("canvas"); c.width = W; c.height = H; return c; };
  const rect = (x, c, a, b, w, h) => { x.fillStyle = c; x.fillRect(Math.round(a), Math.round(b), Math.round(w), Math.round(h)); };
  const imgCastillo = new Image(); imgCastillo.src = "fondos/castillo.jpg";

  /* ---------------- 1) El Batidín: castillo (imagen fija) ---------------- */
  function castillo() {
    const c = lienzo(), x = c.getContext("2d");
    x.fillStyle = "#a9d4e6"; x.fillRect(0, 0, W, H);
    x.imageSmoothingEnabled = false;
    x.drawImage(imgCastillo, 0, -46, 640, 359);
    // franja de prado delante, donde está la honda
    rect(x, "#58b85a", 0, 292, W, G - 292);
    for (let i = 0; i < W; i += 6) rect(x, "#7fd47a", i, 292 + (i * 13) % 16, 2, 3);
    for (let i = 0; i < 24; i++) rect(x, ["#fffaf0", "#ffe14a", "#ff5fa8"][i % 3], (i * 97) % W, 298 + (i * 31) % 12, 3, 3);
    rect(x, "#4caf50", 0, G, W, 6);
    for (let i = 0; i < W; i += 4) rect(x, "#6fcf6a", i, G - 3 + ((i / 4) % 3), 2, 4);
    rect(x, "#6b4226", 0, G + 6, W, H - G);
    for (let i = 0; i < 60; i++) rect(x, "#4e2f1a", (i * 53) % W, G + 10 + (i * 17) % (H - G - 12), 4, 3);
    return c;
  }

  /* ---------------- 2) Cafetería americana ---------------- */
  function cafeteria() {
    const c = lienzo(), x = c.getContext("2d");
    // techo con focos y rejilla de aire
    rect(x, "#f4f1ec", 0, 0, W, 44);
    rect(x, "#d9d4cc", 0, 42, W, 3);
    for (let i = 40; i < W; i += 110) { rect(x, "#fff9d6", i, 14, 12, 6); rect(x, "#ece6da", i - 2, 12, 16, 2); }
    rect(x, "#2a2a30", 430, 6, 56, 22); rect(x, "#c9c4bc", 434, 10, 48, 14); for (let i = 0; i < 6; i++) rect(x, "#8a857e", 437 + i * 8, 12, 2, 10);
    // paredes: rosa a la izquierda, menta a la derecha
    rect(x, "#f4b0bf", 0, 45, 300, 256);
    rect(x, "#a6e4da", 300, 45, 340, 256);
    rect(x, "#e89aab", 296, 45, 8, 256);
    // franja de ajedrez y rayas rojas
    for (let i = 0; i < W; i += 8) { rect(x, "#111", i, 110, 4, 4); rect(x, "#fffaf0", i + 4, 110, 4, 4); rect(x, "#fffaf0", i, 114, 4, 4); rect(x, "#111", i + 4, 114, 4, 4); }
    for (let i = 0; i < W; i += 10) rect(x, i % 20 ? "#fffaf0" : "#d42a35", i, 118, 10, 6);
    // cuadros con batidos
    for (const [px, py, col] of [[352, 58, "#ff5fa8"], [560, 60, "#ffe14a"], [210, 140, "#2fe6ff"]]) {
      rect(x, "#6a4a2a", px - 2, py - 2, 34, 42); rect(x, "#fffaf0", px, py, 30, 38);
      rect(x, col, px + 9, py + 12, 12, 16); rect(x, "#fffaf0", px + 8, py + 9, 14, 4); rect(x, "#e3222e", px + 16, py + 3, 2, 7);
    }
    // puerta
    rect(x, "#d9d4cc", 236, 150, 52, 150); rect(x, "#fffaf0", 240, 154, 44, 146); rect(x, "#c9c4bc", 276, 220, 4, 10);
    // reservados: respaldos rojos con rayas blancas, mesas cromadas
    const reservado = (bx, w) => {
      x.fillStyle = "#c4161f"; x.beginPath(); x.moveTo(bx, 300); x.lineTo(bx, 236); x.quadraticCurveTo(bx + w / 2, 222, bx + w, 236); x.lineTo(bx + w, 300); x.fill();
      for (let i = bx + 6; i < bx + w - 4; i += 12) rect(x, "#fffaf0", i, 234, 5, 50);
      rect(x, "#fffaf0", bx, 284, w, 16); rect(x, "#e5e0d8", bx, 296, w, 4);
      rect(x, "#e3222e", bx - 2, 278, w + 4, 8);
    };
    reservado(310, 70); reservado(420, 70); reservado(530, 70); reservado(20, 70);
    for (const tx of [395, 505, 105]) {
      rect(x, "#b8bcc6", tx - 24, 254, 48, 5); rect(x, "#f4f4f8", tx - 22, 252, 44, 3); rect(x, "#8a8e98", tx - 2, 259, 4, 40); rect(x, "#8a8e98", tx - 10, 296, 20, 3);
      rect(x, "#e3222e", tx - 12, 240, 5, 12); rect(x, "#ffcf3a", tx - 5, 242, 5, 10); rect(x, "#c9cdd6", tx + 4, 244, 10, 8); rect(x, "#fffaf0", tx + 6, 242, 6, 4);
    }
    // gramola (la parte iluminada se anima)
    x.fillStyle = "#7a3a1e"; x.beginPath(); x.moveTo(150, 300); x.lineTo(150, 214); x.quadraticCurveTo(175, 186, 200, 214); x.lineTo(200, 300); x.fill();
    rect(x, "#c9cdd6", 158, 246, 34, 20); rect(x, "#3a2a1e", 160, 270, 30, 26);
    // suelo de ajedrez blanco y negro
    rect(x, "#111", 0, 300, W, H - 300);
    for (let yy = 300, fila = 0; yy < H; fila++) {
      const t = yy < G ? 9 : 20; // baldosas más pequeñas al fondo (perspectiva)
      for (let xx = 0, col = 0; xx < W; xx += t * 1.6, col++) if ((col + fila) % 2 === 0) rect(x, "#f2efe8", xx, yy, t * 1.6, t);
      yy += t;
    }
    rect(x, "#c4161f", 0, G, W, 3); rect(x, "rgba(0,0,0,.18)", 0, G + 3, W, 4);
    return c;
  }

  /* ---------------- 3) El M***halla: ciudad en guerra ---------------- */
  // Edificios en ruinas: el tejado roto se dibuja como una línea dentada
  function ruina(x, bx, by, w, h, color, sombra, ventanas, roto = 0.5, semilla = 1) {
    x.fillStyle = color; x.beginPath(); x.moveTo(bx, G);
    x.lineTo(bx, by);
    const pasos = Math.max(3, Math.floor(w / 8));
    for (let i = 0; i <= pasos; i++) { const px = bx + (w * i) / pasos, caida = ((i * 37 + semilla * 13) % 11) / 10 * h * roto * (i > pasos * 0.4 ? 1 : 0.2); x.lineTo(px, by + caida); }
    x.lineTo(bx + w, G); x.closePath(); x.fill();
    rect(x, sombra, bx + w - 6, by + h * 0.15, 6, G - by);
    for (let fy = by + 10; fy < G - 16; fy += 14) for (let fx = bx + 5; fx < bx + w - 9; fx += 11) {
      const n = (fx * 7 + fy * 3 + semilla) % 9;
      const col = n === 0 ? "#ffb02a" : n === 1 ? "#ff6a1a" : n < 5 ? "#120a0c" : ventanas;
      if (fy > by + h * roto * 0.55 || fx < bx + w * 0.4) rect(x, col, fx, fy, 6, 8);
    }
    // agujeros de impacto
    for (let i = 0; i < 2; i++) { x.fillStyle = "#0a0608"; x.beginPath(); x.arc(bx + w * (0.3 + i * 0.35), by + h * (0.45 + i * 0.2), 6 + i * 3, 0, Math.PI * 2); x.fill(); }
  }
  function semaforo(x, sx, inclinado = 0) {
    x.save(); x.translate(sx, 296); x.rotate(inclinado);
    rect(x, "#2a2a30", -1, -42, 3, 42); rect(x, "#111", -4, -54, 9, 16);
    rect(x, "#3a0a0a", -2, -52, 5, 4); rect(x, "#3a3008", -2, -47, 5, 4); rect(x, "#0a3a14", -2, -42, 5, 4);
    x.restore();
  }
  function farola(x, fx) { rect(x, "#22222a", fx, 250, 2, 46); rect(x, "#22222a", fx, 250, 10, 2); rect(x, "#ffcf6a", fx + 8, 252, 4, 2); }
  function coche(x, cx, color) {
    rect(x, "#0a0608", cx - 1, 282, 30, 12); rect(x, color, cx, 283, 28, 8); rect(x, color, cx + 6, 278, 15, 6);
    rect(x, "#1a1416", cx + 8, 279, 5, 4); rect(x, "#1a1416", cx + 14, 279, 5, 4);
    rect(x, "#0a0608", cx + 3, 290, 6, 5); rect(x, "#0a0608", cx + 19, 290, 6, 5);
  }
  // Nave con forma de calamar, toda negra, sobre la montaña (diseño propio)
  function calamar(x, cx, cy) {
    x.fillStyle = "#050407";
    x.beginPath(); x.moveTo(cx, cy); // punta de arriba
    x.lineTo(cx + 9, cy + 18); x.lineTo(cx + 22, cy + 28); x.lineTo(cx + 15, cy + 34); // aleta derecha
    x.lineTo(cx + 18, cy + 72); x.lineTo(cx + 14, cy + 84);
    x.lineTo(cx - 14, cy + 84); x.lineTo(cx - 18, cy + 72);
    x.lineTo(cx - 15, cy + 34); x.lineTo(cx - 22, cy + 28); x.lineTo(cx - 9, cy + 18); x.closePath(); x.fill();
    // tentáculos colgando
    const tent = [[-14, 28, -30], [-8, 40, -14], [-3, 46, -4], [3, 44, 6], [8, 40, 16], [14, 30, 30]];
    for (const [dx, largo, abre] of tent) {
      x.strokeStyle = "#050407"; x.lineWidth = 4; x.lineCap = "round";
      x.beginPath(); x.moveTo(cx + dx, cy + 82); x.quadraticCurveTo(cx + dx + abre * 0.4, cy + 82 + largo * 0.6, cx + dx + abre, cy + 82 + largo); x.stroke();
    }
    // brillo sutil en el borde
    x.strokeStyle = "rgba(255,120,60,.25)"; x.lineWidth = 1; x.beginPath(); x.moveTo(cx + 1, cy + 2); x.lineTo(cx + 17, cy + 72); x.stroke();
  }
  function ciudad() {
    const c = lienzo(), x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, 0, 290);
    g.addColorStop(0, "#120709"); g.addColorStop(0.45, "#3e1210"); g.addColorStop(0.8, "#a33a16"); g.addColorStop(1, "#e0661e");
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    // montaña del fondo con la nave calamar
    x.fillStyle = "#24141a"; x.beginPath(); x.moveTo(330, 260); x.lineTo(430, 150); x.lineTo(470, 166); x.lineTo(520, 104); x.lineTo(560, 140); x.lineTo(600, 128); x.lineTo(660, 210); x.lineTo(660, 260); x.fill();
    x.fillStyle = "#1c1016"; x.beginPath(); x.moveTo(520, 104); x.lineTo(560, 140); x.lineTo(600, 128); x.lineTo(660, 210); x.lineTo(520, 210); x.fill();
    calamar(x, 520, 10);
    // horizonte de ciudad lejana
    for (let i = 0; i < 26; i++) { const bx = i * 26 - 6, h = 30 + (i * 41) % 70; rect(x, "#2c1418", bx, 250 - h, 24, h + 10); if (i % 3 === 0) rect(x, "#ff7a2a", bx + 6, 250 - h + 10, 4, 4); }
    // edificios en primer plano del fondo
    ruina(x, 0, 150, 70, 120, "#3a2224", "#2a1618", "#4a2e2a", 0.6, 1);                 // bloque de pisos
    // hospital
    x.fillStyle = "#7d736c"; x.fillRect(74, 162, 112, 134); rect(x, "#5e5550", 176, 162, 10, 134);
    for (let fy = 182; fy < 280; fy += 16) for (let fx = 82; fx < 172; fx += 14) rect(x, (fx + fy) % 5 ? "#2a2a34" : "#ff8a2a", fx, fy, 8, 10);
    rect(x, "#e8e0d6", 98, 166, 64, 12); x.font = '8px "Press Start 2P", monospace'; x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = "#1a3a8a"; x.fillText("HOSPITAL", 130, 172);
    rect(x, "#1a3a8a", 118, 140, 24, 22); x.fillStyle = "#fffaf0"; x.font = '14px "Press Start 2P", monospace'; x.fillText("H", 130, 152);
    x.fillStyle = "#0a0608"; x.beginPath(); x.moveTo(150, 162); x.lineTo(186, 162); x.lineTo(186, 200); x.lineTo(170, 186); x.closePath(); x.fill(); // esquina derrumbada
    // colegio de ladrillo con reloj
    rect(x, "#6e2e22", 196, 196, 104, 100); rect(x, "#5a241a", 290, 196, 10, 100);
    for (let fy = 202; fy < 296; fy += 6) for (let fx = 196 + ((fy / 6) % 2) * 6; fx < 300; fx += 12) rect(x, "#5a2418", fx, fy, 8, 1);
    x.fillStyle = "#6e2e22"; x.beginPath(); x.moveTo(190, 198); x.lineTo(248, 168); x.lineTo(306, 198); x.fill();
    rect(x, "#e8e0d6", 218, 204, 60, 11); x.font = '7px "Press Start 2P", monospace'; x.fillStyle = "#3a1a10"; x.fillText("COLEGIO", 248, 210);
    x.fillStyle = "#e8e0d6"; x.beginPath(); x.arc(248, 186, 7, 0, Math.PI * 2); x.fill(); rect(x, "#1a1416", 247, 181, 1, 5); rect(x, "#1a1416", 248, 186, 4, 1);
    for (let i = 0; i < 5; i++) rect(x, i === 2 ? "#ff9a2a" : "#1a1016", 204 + i * 18, 226, 10, 14);
    for (let i = 0; i < 5; i++) rect(x, i % 2 ? "#120a0c" : "#1a1016", 204 + i * 18, 254, 10, 14);
    rect(x, "#0a0608", 238, 270, 20, 26);
    rect(x, "#2a2a30", 306, 150, 2, 50); rect(x, "#8a2a2a", 308, 152, 14, 8);           // mástil con bandera rota
    // torre de oficinas partida
    ruina(x, 324, 96, 58, 200, "#2e2a36", "#211e28", "#3a3644", 0.7, 3);
    // tiendas con toldos
    rect(x, "#4a3a34", 386, 236, 80, 60); rect(x, "#2a7a3a", 390, 230, 34, 8); rect(x, "#9a2a2a", 428, 230, 34, 8);
    for (let i = 390; i < 424; i += 6) rect(x, "#e8e0d6", i, 230, 3, 8);
    rect(x, "#120a0c", 394, 248, 26, 30); rect(x, "#ff8a2a", 432, 250, 26, 26);
    rect(x, "#2a9a4a", 446, 220, 10, 3); rect(x, "#2a9a4a", 449, 217, 4, 9);              // cruz verde de farmacia
    ruina(x, 470, 180, 64, 116, "#3a2224", "#2a1618", "#4a2e2a", 0.5, 5);
    ruina(x, 538, 206, 52, 90, "#2e1e22", "#22151a", "#3a2a2a", 0.4, 7);
    ruina(x, 594, 170, 50, 126, "#3a2428", "#2a181c", "#4a2e30", 0.65, 9);
    // calle: acera, asfalto con líneas, semáforos, farolas, coches quemados y escombros
    rect(x, "#3a3438", 0, 278, W, 4); rect(x, "#1e1a1e", 0, 282, W, 14);
    for (let i = 0; i < W; i += 30) rect(x, "#c9a23a", i, 288, 14, 2);
    semaforo(x, 66, 0); semaforo(x, 316, 0.5); semaforo(x, 560, 0);
    farola(x, 150); farola(x, 470); farola(x, 610);
    coche(x, 186, "#2a1a14"); coche(x, 520, "#3a1a10");
    for (let i = 0; i < 18; i++) rect(x, ["#3a2e2a", "#2a2224", "#4a3a34"][i % 3], (i * 71) % W, 286 + (i % 4) * 2, 6 + (i % 3) * 4, 4);
    // suelo del juego: asfalto roto
    rect(x, "#2a2428", 0, 296, W, G - 296);
    rect(x, "#3a3036", 0, G, W, 6); rect(x, "#1c171b", 0, G + 6, W, H - G);
    for (let i = 0; i < 40; i++) rect(x, "#0e0b0d", (i * 83) % W, G + 8 + (i * 13) % (H - G - 10), 10 + (i % 4) * 6, 1);
    for (let i = 0; i < 20; i++) rect(x, "#4a3e44", (i * 113) % W, 300 + (i * 7) % 14, 5, 3);
    return c;
  }
  // Puntos de fuego (sobre edificios del fondo) y columnas de humo
  const FUEGOS = [[30, 160], [140, 168], [170, 200], [262, 196], [346, 110], [372, 140], [500, 196], [616, 184], [440, 236], [80, 250], [560, 214]];

  function nube(ctx, cx, cy, s, color = "#ffffff") {
    ctx.fillStyle = color;
    for (const [dx, dy, w, h] of [[-20, 0, 40, 10], [-14, -6, 28, 8], [-6, -11, 14, 6], [-26, 4, 52, 6]]) ctx.fillRect(Math.round(cx + dx * s), Math.round(cy + dy * s), Math.round(w * s), Math.round(h * s));
  }
  // Persona volando en escoba (pixel art propio)
  function escoba(ctx, x, y, t, capa, d = 1) {
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(d, 1);
    const ondea = Math.floor(t * 10) % 2;
    ctx.fillStyle = "#6b3e1e"; ctx.fillRect(-18, 2, 34, 3);                         // palo
    ctx.fillStyle = "#e0b14a"; ctx.fillRect(-28, -1, 11, 9); ctx.fillStyle = "#b9862e"; ctx.fillRect(-28, 2, 11, 2); // ramas
    ctx.fillStyle = capa; ctx.fillRect(-6, -10, 12, 12);                                // túnica
    ctx.fillRect(-14 - ondea * 2, -8 + ondea, 9, 5);                                    // capa al viento
    ctx.fillStyle = "#f2c9a0"; ctx.fillRect(-3, -17, 7, 7);                             // cara
    ctx.fillStyle = "#3a2416"; ctx.fillRect(-4, -19, 9, 3);                             // pelo
    ctx.fillStyle = "#f2c9a0"; ctx.fillRect(6, -4, 5, 3);                               // mano al palo
    ctx.fillStyle = "#222"; ctx.fillRect(-2, 2, 4, 6);                                  // pierna
    ctx.restore();
  }
  function avion(ctx, x, y, d) {
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(d, 1);
    ctx.fillStyle = "#0e0a0c"; ctx.fillRect(-16, -2, 30, 4); ctx.fillRect(10, -1, 6, 2);
    ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(-12, 9); ctx.lineTo(-6, 9); ctx.lineTo(6, 0); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(-10, -7); ctx.lineTo(-5, -7); ctx.lineTo(4, 0); ctx.fill();
    ctx.fillRect(-16, -6, 4, 6);
    ctx.fillStyle = "#ffb02a"; ctx.fillRect(-20 + Math.random() * 2, -1, 4, 2);
    ctx.restore();
  }
  function helicoptero(ctx, x, y, d, t) {
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(d, 1);
    ctx.fillStyle = "#0e0a0c";
    ctx.beginPath(); ctx.ellipse(0, 0, 11, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-26, -2, 18, 3); ctx.fillRect(-28, -6, 3, 7); ctx.fillRect(-4, 6, 2, 3); ctx.fillRect(-8, 9, 14, 1);
    ctx.fillRect(-1, -9, 2, 4);
    const a = Math.abs(Math.sin(t * 40)) * 18; ctx.fillRect(-a, -10, a * 2, 1);
    ctx.fillStyle = "#3a4a5a"; ctx.fillRect(3, -3, 6, 4);
    ctx.fillStyle = Math.floor(t * 4) % 2 ? "#ff2a2a" : "#2a0a0a"; ctx.fillRect(-28, -7, 2, 2);
    ctx.restore();
  }

  /* ---------------- Dibujo de cada fondo ---------------- */
  function dibujar(ctx, nivel, t) {
    const clave = ["castillo", "cafeteria", "ciudad"][nivel] || "castillo";
    if (clave === "castillo" && !imgCastillo.complete) { ctx.fillStyle = "#a9d4e6"; ctx.fillRect(0, 0, W, H); return; }
    if (!cache[clave]) cache[clave] = clave === "castillo" ? castillo() : clave === "cafeteria" ? cafeteria() : ciudad();
    const corte = clave === "cafeteria" ? 300 : clave === "ciudad" ? 296 : 292;
    if (clave === "castillo") ctx.drawImage(cache[clave], 0, 0); // la imagen del castillo va fija y nítida
    else {
      // profundidad: el fondo algo desenfocado, el suelo de juego nítido
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, corte); ctx.clip();
      ctx.filter = "blur(1px)"; ctx.drawImage(cache[clave], 0, 0); ctx.filter = "none"; ctx.restore();
      ctx.drawImage(cache[clave], 0, corte, W, H - corte, 0, corte, W, H - corte);
    }

    if (clave === "castillo") {
      // magos en escoba pasando por delante del castillo
      const capas = ["#3a2a6e", "#7a1e2a", "#1e5a3a", "#2a2a2a", "#5a3a1e"];
      for (let i = 0; i < 5; i++) {
        const d = i % 2 ? -1 : 1, vel = 34 + i * 8;
        let x = ((t * vel + i * 170) % (W + 160)) - 80; if (d < 0) x = W - x;
        const y = 70 + i * 34 + Math.sin(t * 1.5 + i * 2) * 10, esc = 0.7 + (i % 3) * 0.2;
        ctx.save(); ctx.translate(x, y); ctx.scale(esc, esc); escoba(ctx, 0, 0, t + i, capas[i], d); ctx.restore();
      }
    } else if (clave === "cafeteria") {
      ctx.save(); ctx.translate(250, 30); ctx.fillStyle = "#8a857e"; ctx.fillRect(-2, -18, 4, 14);
      ctx.rotate(t * 7); ctx.fillStyle = "#c9c4bc"; ctx.fillRect(-34, -3, 68, 6); ctx.fillRect(-3, -8, 6, 17); ctx.restore();
      ctx.fillStyle = "#6a655e"; ctx.fillRect(244, 26, 12, 8);
      // cartel de neón: placa oscura detrás para que se lea bien
      const on = Math.floor(t * 2) % 17 !== 0;
      ctx.fillStyle = "#2a1424"; ctx.beginPath(); ctx.ellipse(110, 76, 74, 28, 0, 0, Math.PI * 2); ctx.fill();
      if (on) { ctx.globalAlpha = 0.25; ctx.fillStyle = "#ff5fa8"; ctx.beginPath(); ctx.ellipse(110, 76, 80, 33, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
      ctx.lineWidth = 3; ctx.strokeStyle = on ? "#ff8ac4" : "#7a3a5a"; ctx.beginPath(); ctx.ellipse(110, 76, 70, 25, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = '12px "Press Start 2P", monospace'; ctx.fillStyle = "#000"; ctx.fillText("MIFLSHAKES", 111, 72); ctx.fillStyle = on ? "#7ff4ff" : "#2a6a72"; ctx.fillText("MIFLSHAKES", 110, 71);
      ctx.font = '7px "Press Start 2P", monospace'; ctx.fillStyle = on ? "#fffaf0" : "#8a8a8a"; ctx.fillText("DINER · DESDE 1955", 110, 88);
      for (let i = 0; i < 4; i++) { ctx.fillStyle = ["#ff5fa8", "#ffe14a", "#2fe6ff", "#3dff7a"][(i + Math.floor(t * 4)) % 4]; ctx.fillRect(160 + i * 8, 222, 6, 18); }
      for (let i = 0; i < 3; i++) {
        const k = (t * 0.6 + i / 3) % 1; ctx.globalAlpha = 1 - k; ctx.fillStyle = "#3a2a1e";
        const nx = 196 + k * 40 + Math.sin(k * 8 + i) * 6, ny = 210 - k * 70;
        ctx.fillRect(nx, ny, 5, 4); ctx.fillRect(nx + 4, ny - 9, 2, 10); ctx.fillRect(nx + 4, ny - 9, 5, 2);
      }
      ctx.globalAlpha = 1;
    } else {
      // luz blanca en la punta de la nave calamar
      const pulso = 0.6 + Math.sin(t * 2.5) * 0.4;
      ctx.globalAlpha = 0.25 * pulso; ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(520, 10, 22, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.6 * pulso; ctx.beginPath(); ctx.arc(520, 10, 9, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1; ctx.fillRect(518, 8, 4, 4);
      // fuego y humo
      for (const [i, [fx, fy]] of FUEGOS.entries()) {
        for (let k = 0; k < 5; k++) { // humo que sube
          const f = (t * 0.25 + k / 5 + i * 0.13) % 1;
          ctx.globalAlpha = 0.35 * (1 - f); ctx.fillStyle = "#2a1a1c";
          const r = 6 + f * 18; ctx.fillRect(Math.round(fx - r / 2 + Math.sin(f * 6 + i) * 8 + f * 20), Math.round(fy - 10 - f * 90), Math.round(r), Math.round(r * 0.7));
        }
        ctx.globalAlpha = 1;
        for (let k = 0; k < 6; k++) { // llamas
          const h = 5 + ((Math.floor(t * 12) + k * 3 + i) % 5) * 2;
          ctx.fillStyle = k % 3 === 0 ? "#ffe14a" : k % 3 === 1 ? "#ff8a1a" : "#e3222e";
          ctx.fillRect(fx - 7 + k * 2.5, fy - h, 3, h);
        }
        ctx.globalAlpha = 0.18; ctx.fillStyle = "#ff8a1a"; ctx.beginPath(); ctx.arc(fx, fy - 4, 14, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      }
      // aviones y helicópteros cruzando
      for (let i = 0; i < 2; i++) {
        const d = i ? -1 : 1; let x = ((t * 150 + i * 400) % (W + 300)) - 150; if (d < 0) x = W - x;
        const y = 40 + i * 34; avion(ctx, x, y, d);
        ctx.globalAlpha = 0.3; ctx.fillStyle = "#c9b8b0"; ctx.fillRect(d > 0 ? x - 80 : x + 16, y - 1, 64, 2); ctx.globalAlpha = 1;
      }
      for (let i = 0; i < 2; i++) {
        const d = i ? 1 : -1; let x = ((t * 28 + i * 330) % (W + 120)) - 60; if (d < 0) x = W - x;
        const y = 92 + i * 40 + Math.sin(t * 1.3 + i) * 6;
        helicoptero(ctx, x, y, d, t + i);
        ctx.globalAlpha = 0.1; ctx.fillStyle = "#fffbe0"; ctx.beginPath(); ctx.moveTo(x, y + 4); ctx.lineTo(x - 30 + Math.sin(t + i) * 30, 290); ctx.lineTo(x + 30 + Math.sin(t + i) * 30, 290); ctx.fill(); ctx.globalAlpha = 1;
      }
      // fogonazos lejanos
      if (Math.floor(t * 1.7) % 7 === 0 && (t * 1.7) % 1 < 0.15) { ctx.globalAlpha = 0.25; ctx.fillStyle = "#ffcf6a"; ctx.fillRect(0, 0, W, 290); ctx.globalAlpha = 1; }
    }
  }

  window.FONDOS4 = { dibujar };
})();
