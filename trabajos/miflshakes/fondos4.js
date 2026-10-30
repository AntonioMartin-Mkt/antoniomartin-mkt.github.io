/* =============================================================
   SHAKE WEEK · DÍA 4 — Fondos de cada torre (pixel art en código)
   1) Prado con pista de baloncesto y gente volando en escoba
   2) Cafetería americana de los años 50
   3) El prado de noche con la nave nodriza del Alter Ego
   La parte fija se pinta una vez en un lienzo aparte; lo que se
   mueve (nubes, escobas, ventilador, neón, drones) en cada frame.
   ============================================================= */
(() => {
  "use strict";
  const W = 640, H = 360, G = 318;
  const cache = {};
  const lienzo = () => { const c = document.createElement("canvas"); c.width = W; c.height = H; return c; };
  const rect = (x, c, a, b, w, h) => { x.fillStyle = c; x.fillRect(Math.round(a), Math.round(b), Math.round(w), Math.round(h)); };

  /* ---------------- Piezas compartidas ---------------- */
  function colinas(x, base, amp, fase, color) {
    for (let i = 0; i < W; i += 4) {
      const h = amp * (0.55 + 0.25 * Math.sin(i / 70 + fase) + 0.2 * Math.sin(i / 23 + fase * 2));
      rect(x, color, i, base - h, 4, h + 80);
    }
  }
  function arbol(x, cx, cy, s, hoja, sombra) {
    rect(x, "#5a3a1e", cx - 3 * s, cy, 6 * s, 22 * s);
    for (const [dx, dy, r] of [[0, -6, 14], [-10, 2, 10], [10, 2, 10], [0, 6, 11]]) {
      x.fillStyle = hoja; x.beginPath(); x.arc(cx + dx * s, cy + dy * s, r * s, 0, Math.PI * 2); x.fill();
    }
    x.fillStyle = sombra; x.beginPath(); x.arc(cx + 6 * s, cy + 8 * s, 8 * s, 0, Math.PI * 2); x.fill();
  }
  // Pista de baloncesto al fondo, con valla y dos canastas
  function pista(x, noche) {
    // valla metálica
    rect(x, noche ? "#2a2a3a" : "#7d8a96", 196, 196, 410, 3);
    for (let i = 196; i <= 606; i += 41) rect(x, noche ? "#2a2a3a" : "#6a7682", i, 196, 3, 72);
    x.strokeStyle = noche ? "rgba(90,90,120,.45)" : "rgba(120,135,150,.55)"; x.lineWidth = 1;
    for (let i = 196; i < 606; i += 8) { x.beginPath(); x.moveTo(i, 199); x.lineTo(i + 8, 268); x.moveTo(i + 8, 199); x.lineTo(i, 268); x.stroke(); }
    // suelo de la pista en perspectiva
    const sup = noche ? "#7a3f2a" : "#d9733a", lin = noche ? "#b9b2c8" : "#fffaf0";
    x.fillStyle = sup; x.beginPath(); x.moveTo(250, 258); x.lineTo(552, 258); x.lineTo(600, 298); x.lineTo(204, 298); x.closePath(); x.fill();
    x.strokeStyle = lin; x.lineWidth = 2;
    x.beginPath(); x.moveTo(252, 260); x.lineTo(550, 260); x.lineTo(596, 296); x.lineTo(208, 296); x.closePath(); x.stroke();
    x.beginPath(); x.moveTo(401, 260); x.lineTo(402, 296); x.stroke();
    x.beginPath(); x.ellipse(401, 278, 24, 9, 0, 0, Math.PI * 2); x.stroke();
    x.beginPath(); x.ellipse(244, 278, 30, 12, 0, -Math.PI / 2, Math.PI / 2); x.stroke();
    x.beginPath(); x.ellipse(558, 278, 30, 12, 0, Math.PI / 2, Math.PI * 1.5); x.stroke();
    // canastas
    for (const [px, d] of [[226, 1], [578, -1]]) {
      rect(x, "#3a3a46", px - 2, 214, 5, 84);
      rect(x, "#3a3a46", px, 214, d * 20, 4);
      const bx = px + d * 20 - (d < 0 ? 4 : 0);
      rect(x, "#111", bx - 1, 200, 6, 26); rect(x, "#fffaf0", bx, 201, 4, 24); rect(x, "#e3222e", bx, 209, 4, 8);
      x.strokeStyle = "#ff7a1a"; x.lineWidth = 2; x.beginPath(); x.ellipse(bx + d * 10 + 2, 218, 7, 2, 0, 0, Math.PI * 2); x.stroke();
      x.strokeStyle = "#fffaf0"; x.lineWidth = 1;
      for (let k = -6; k <= 6; k += 3) { x.beginPath(); x.moveTo(bx + d * 10 + 2 + k, 219); x.lineTo(bx + d * 10 + 2 + k * 0.6, 229); x.stroke(); }
    }
    if (noche) { // focos
      for (const fx of [214, 590]) { rect(x, "#22222c", fx, 150, 4, 148); rect(x, "#fff3c4", fx - 8, 146, 20, 6); }
    }
  }
  function sueloPrado(x, noche) {
    rect(x, noche ? "#1f4a2a" : "#58b85a", 0, 296, W, G - 296);
    for (let i = 0; i < W; i += 7) { rect(x, noche ? "#2d6a3a" : "#7fd47a", i, 296 + (i * 13) % 18, 2, 3); }
    for (let i = 0; i < 26; i++) { const fx = (i * 97) % W, fy = 300 + (i * 31) % 14; rect(x, noche ? "#8a8ab0" : ["#fffaf0", "#ffe14a", "#ff5fa8"][i % 3], fx, fy, 3, 3); }
    rect(x, noche ? "#245a30" : "#4caf50", 0, G, W, 6);
    for (let i = 0; i < W; i += 4) rect(x, noche ? "#2f7a3e" : "#6fcf6a", i, G - 3 + ((i / 4) % 3), 2, 4);
    rect(x, noche ? "#3a2416" : "#6b4226", 0, G + 6, W, H - G);
    for (let i = 0; i < 60; i++) rect(x, noche ? "#2a1a10" : "#4e2f1a", (i * 53) % W, G + 10 + (i * 17) % (H - G - 12), 4, 3);
  }

  /* ---------------- 1) Prado de día ---------------- */
  function prado(noche) {
    const c = lienzo(), x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, 0, 260);
    if (noche) { g.addColorStop(0, "#07051a"); g.addColorStop(0.6, "#2a1450"); g.addColorStop(1, "#7a3a6e"); }
    else { g.addColorStop(0, "#5fb4ee"); g.addColorStop(1, "#d6f1ff"); }
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    if (!noche) {
      x.fillStyle = "#fff3a0"; x.beginPath(); x.arc(560, 58, 30, 0, Math.PI * 2); x.fill();
      x.fillStyle = "#ffe14a"; x.beginPath(); x.arc(560, 58, 24, 0, Math.PI * 2); x.fill();
    } else for (let i = 0; i < 90; i++) rect(x, "#fffaf0", (i * 137) % W, (i * 71) % 200, (i % 7 === 0) ? 2 : 1, (i % 7 === 0) ? 2 : 1);
    colinas(x, 236, 60, 0.5, noche ? "#1a2a3a" : "#8fd08a");
    colinas(x, 262, 40, 2.1, noche ? "#16302a" : "#5fb85f");
    arbol(x, 40, 236, 1.2, noche ? "#1d4a2a" : "#3e9e4a", noche ? "#163a22" : "#2f7f3a");
    arbol(x, 150, 244, 1, noche ? "#1d4a2a" : "#3e9e4a", noche ? "#163a22" : "#2f7f3a");
    arbol(x, 622, 240, 1.1, noche ? "#1d4a2a" : "#3e9e4a", noche ? "#163a22" : "#2f7f3a");
    pista(x, noche);
    sueloPrado(x, noche);
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

  /* ---------------- Partes animadas ---------------- */
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
  // Nave nodriza del Alter Ego: un vaso gigante corrupto que flota sobre el prado
  function nave(ctx, t) {
    const cx = 300, cy = 74 + Math.sin(t * 1.2) * 5;
    // haz tractor sobre la torre
    ctx.globalAlpha = 0.12 + Math.sin(t * 3) * 0.04; ctx.fillStyle = "#2fe6ff";
    ctx.beginPath(); ctx.moveTo(cx - 26, cy + 52); ctx.lineTo(cx + 26, cy + 52); ctx.lineTo(cx + 330, G); ctx.lineTo(cx + 120, G); ctx.fill(); ctx.globalAlpha = 1;
    // cuerpo (trapecio) con franja cian
    ctx.fillStyle = "#0b0a0f"; ctx.beginPath(); ctx.moveTo(cx - 62, cy - 34); ctx.lineTo(cx + 62, cy - 34); ctx.lineTo(cx + 44, cy + 56); ctx.lineTo(cx - 44, cy + 56); ctx.fill();
    ctx.fillStyle = "#24222e"; ctx.beginPath(); ctx.moveTo(cx - 58, cy - 30); ctx.lineTo(cx + 58, cy - 30); ctx.lineTo(cx + 41, cy + 52); ctx.lineTo(cx - 41, cy + 52); ctx.fill();
    ctx.fillStyle = "#2fe6ff"; ctx.fillRect(cx - 52, cy + 14, 104, 12);
    // tapa abovedada y pajita
    ctx.fillStyle = "#c1863a"; ctx.beginPath(); ctx.ellipse(cx, cy - 34, 66, 24, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = "#e0a85a"; ctx.fillRect(cx - 40, cy - 48, 30, 4);
    ctx.fillStyle = "#0b0a0f"; ctx.fillRect(cx - 68, cy - 36, 136, 5);
    for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? "#0b0a0f" : "#2fe6ff"; ctx.fillRect(cx + 14 + i * 3, cy - 92 + i * 7, 7, 8); }
    // ojos enfadados que brillan
    const parp = Math.floor(t * 2) % 9 === 0;
    for (const s of [-1, 1]) {
      ctx.fillStyle = "#fffaf0"; ctx.fillRect(cx + s * 22 - 10, cy - 18, 20, parp ? 3 : 14);
      if (!parp) { ctx.fillStyle = "#ff2fd0"; ctx.fillRect(cx + s * 22 - 4 + s * 2, cy - 13, 8, 8); }
      ctx.fillStyle = "#0b0a0f"; ctx.fillRect(cx + s * 22 - 12, cy - 22 + (s > 0 ? 0 : 0), 24, 3);
    }
    // luces de la base
    for (let i = 0; i < 5; i++) { ctx.fillStyle = (Math.floor(t * 6) + i) % 2 ? "#3dff7a" : "#ff2fd0"; ctx.fillRect(cx - 36 + i * 18, cy + 46, 6, 4); }
    // fallos de imagen
    if (Math.random() < 0.3) { const y = cy - 40 + Math.random() * 90; ctx.drawImage(ctx.canvas, cx - 70, y, 140, 5, cx - 70 + (Math.random() - 0.5) * 16, y, 140, 5); }
  }
  // Drones glitch (diseño propio: rombos con núcleo brillante)
  function dron(ctx, x, y, t) {
    x = Math.round(x); y = Math.round(y);
    ctx.fillStyle = "#0b0a0f"; ctx.fillRect(x - 9, y - 3, 18, 6); ctx.fillRect(x - 3, y - 9, 6, 18);
    ctx.fillStyle = "#2fe6ff"; ctx.fillRect(x - 7, y - 1, 14, 2); ctx.fillRect(x - 1, y - 7, 2, 14);
    ctx.fillStyle = Math.floor(t * 8) % 2 ? "#ff2fd0" : "#fffaf0"; ctx.fillRect(x - 2, y - 2, 4, 4);
  }

  /* ---------------- Dibujo de cada fondo ---------------- */
  function dibujar(ctx, nivel, t) {
    const clave = ["prado", "cafeteria", "noche"][nivel] || "prado";
    if (!cache[clave]) cache[clave] = clave === "prado" ? prado(false) : clave === "cafeteria" ? cafeteria() : prado(true);
    ctx.drawImage(cache[clave], 0, 0);

    if (clave === "prado") {
      for (const [x0, y, s, v] of [[60, 52, 1.2, 8], [300, 34, 0.9, 5], [520, 96, 1, 7], [800, 70, 1.3, 6]]) nube(ctx, ((x0 + t * v) % 760) - 60, y, s);
      // gente volando en escoba por el cielo
      const capas = ["#3a2a6e", "#7a1e2a", "#1e5a3a", "#2a2a2a"];
      for (let i = 0; i < 4; i++) {
        const vel = 38 + i * 9, d = i % 2 ? -1 : 1;
        let x = ((t * vel + i * 190) % (W + 160)) - 80; if (d < 0) x = W - x;
        const y = 50 + i * 30 + Math.sin(t * 1.6 + i) * 10;
        escoba(ctx, x, y, t + i, capas[i], d);
      }
    } else if (clave === "cafeteria") {
      // ventilador del techo girando
      ctx.save(); ctx.translate(250, 30); ctx.fillStyle = "#8a857e"; ctx.fillRect(-2, -18, 4, 14);
      ctx.rotate(t * 7); ctx.fillStyle = "#c9c4bc"; ctx.fillRect(-34, -3, 68, 6); ctx.fillRect(-3, -34 * 0.25, 6, 17); ctx.restore();
      ctx.fillStyle = "#6a655e"; ctx.fillRect(244, 26, 12, 8);
      // cartel de neón ovalado
      const on = Math.floor(t * 3) % 13 !== 0;
      ctx.lineWidth = 3; ctx.strokeStyle = on ? "#ff5fa8" : "#9a4a62";
      ctx.beginPath(); ctx.ellipse(110, 74, 62, 22, 0, 0, Math.PI * 2); ctx.stroke();
      if (on) { ctx.globalAlpha = 0.18; ctx.fillStyle = "#ff5fa8"; ctx.beginPath(); ctx.ellipse(110, 74, 72, 30, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
      ctx.font = '10px "Press Start 2P", monospace'; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = on ? "#2fe6ff" : "#2a6a72"; ctx.fillText("MIFLSHAKES", 110, 72);
      ctx.font = '6px "Press Start 2P", monospace'; ctx.fillStyle = on ? "#fffaf0" : "#9a9a9a"; ctx.fillText("DINER · DESDE 1955", 110, 86);
      // luces de la gramola y notas musicales
      for (let i = 0; i < 4; i++) { ctx.fillStyle = ["#ff5fa8", "#ffe14a", "#2fe6ff", "#3dff7a"][(i + Math.floor(t * 4)) % 4]; ctx.fillRect(160 + i * 8, 222, 6, 18); }
      for (let i = 0; i < 3; i++) {
        const k = (t * 0.6 + i / 3) % 1; ctx.globalAlpha = 1 - k; ctx.fillStyle = "#3a2a1e";
        const nx = 196 + k * 40 + Math.sin(k * 8 + i) * 6, ny = 210 - k * 70;
        ctx.fillRect(nx, ny, 5, 4); ctx.fillRect(nx + 4, ny - 9, 2, 10); ctx.fillRect(nx + 4, ny - 9, 5, 2);
      }
      ctx.globalAlpha = 1;
    } else {
      // estrellas que titilan
      for (let i = 0; i < 18; i++) if ((Math.floor(t * 3) + i) % 5 === 0) { ctx.fillStyle = "#fffaf0"; ctx.fillRect((i * 151) % W, (i * 43) % 190, 2, 2); }
      nube(ctx, ((140 + t * 6) % 760) - 60, 210, 1.6, "rgba(160,120,200,.5)");
      nave(ctx, t);
      // escuadrón de drones
      for (let i = 0; i < 5; i++) {
        const k = (t * 0.12 + i * 0.2) % 1;
        dron(ctx, 640 - k * 760 + Math.sin(t * 2 + i) * 6, 150 + i * 14 + Math.sin(t * 3 + i * 2) * 8, t + i);
      }
      // escobas huyendo
      escoba(ctx, ((t * 60) % (W + 160)) - 80, 46 + Math.sin(t * 2) * 6, t, "#3a2a6e", 1);
    }
  }

  // Suelo dibujado aparte: el de la torre (va por encima de los bloques que caen fuera)
  window.FONDOS4 = { dibujar };
})();
