/* =============================================================
   SHAKE WEEK · DÍA 4 — Fondos de cada torre (pixel art en código)
   1) Prado con un castillo-escuela gótico y estudiantes volando en escoba
   2) Cafetería americana de los años 50
   3) El mismo prado de noche con la nave nodriza del Alter Ego
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
  // Castillo-escuela gótico gigante (diseño propio): torres, tejados, ventanas ojivales,
  // terrazas, contrafuertes, gárgolas, puente cubierto, reloj y banderas.
  const banderas = { dia: [], noche: [] };
  function castillo(x, noche) {
    const c = lienzo(), k = c.getContext("2d");
    const piedra = noche ? "#4b4959" : "#aaa598", sombra = noche ? "#34323f" : "#807b71", oscura = noche ? "#211f2b" : "#57534c";
    const tejado = noche ? "#1c2440" : "#3c4a6c", tejadoC = noche ? "#2a3658" : "#566898";
    const lista = noche ? banderas.noche : banderas.dia; lista.length = 0;
    const R = (col, a, b, w, h) => { k.fillStyle = col; k.fillRect(Math.round(a), Math.round(b), Math.round(w), Math.round(h)); };
    const ventana = (vx, vy, w, h, luz) => {
      k.fillStyle = oscura; k.fillRect(vx - 1, vy - 1, w + 2, h + 2); k.beginPath(); k.arc(vx + w / 2, vy, w / 2 + 1, Math.PI, 0); k.fill();
      k.fillStyle = luz ? (noche ? "#ffcf5a" : "#ffe7a6") : (noche ? "#15152a" : "#3a4762");
      k.fillRect(vx, vy, w, h); k.beginPath(); k.arc(vx + w / 2, vy, w / 2, Math.PI, 0); k.fill();
      if (w >= 6) R(oscura, vx + w / 2 - 0.5, vy - w / 2, 1, h + w / 2);
    };
    const piedras = (px, py, w, h) => { k.fillStyle = sombra; for (let yy = py + 4; yy < py + h; yy += 6) for (let xx = px + ((yy / 6) % 2) * 5; xx < px + w - 3; xx += 10) k.fillRect(Math.round(xx), Math.round(yy), 6, 1); };
    const almenas = (px, py, w) => { for (let xx = px; xx < px + w - 2; xx += 8) R(piedra, xx, py - 5, 5, 5); };
    const gargola = (gx, gy, d) => { // figura de piedra agazapada con alas
      R(oscura, gx, gy, 6 * d, 4); R(oscura, gx + 5 * d, gy - 2, 3 * d, 3); R(oscura, gx + 7 * d, gy - 1, 2 * d, 1);
      R(oscura, gx + 1 * d, gy - 4, 2 * d, 4); R(oscura, gx, gy - 5, 2 * d, 2); R(oscura, gx + 1, gy + 4, 1, 2);
      R(noche ? "#ff3a3a" : "#2a2622", gx + 6 * d, gy - 2, 1, 1);
    };
    const torre = (cx, top, w, base, alto, nv = 3, bandera = true) => {
      R(piedra, cx - w / 2, top, w, base - top);
      R(sombra, cx + w / 2 - Math.round(w * 0.32), top, Math.round(w * 0.32), base - top);
      R("rgba(255,255,255,.12)", cx - w / 2 + 2, top, 2, base - top);
      piedras(cx - w / 2, top, w, base - top);
      R(sombra, cx - w / 2 - 3, top - 4, w + 6, 4); almenas(cx - w / 2 - 3, top - 4, w + 6);
      if (alto) {
        k.fillStyle = tejado; k.beginPath(); k.moveTo(cx - w / 2 - 4, top - 6); k.lineTo(cx, top - 6 - alto); k.lineTo(cx + w / 2 + 4, top - 6); k.fill();
        k.fillStyle = tejadoC; k.beginPath(); k.moveTo(cx - w / 2 - 4, top - 6); k.lineTo(cx, top - 6 - alto); k.lineTo(cx - 3, top - 6); k.fill();
        if (bandera) { R(oscura, cx, top - 16 - alto, 1, 11); lista.push({ x: cx + 1, y: top - 16 - alto }); }
      }
      for (let i = 0; i < nv; i++) ventana(cx - 2, top + 12 + i * 20, 4, 8, (i * 7 + cx) % 3 === 0);
    };
    // risco de roca y lago
    k.fillStyle = noche ? "#2c2a34" : "#6e6a60";
    k.beginPath(); k.moveTo(178, 266); k.lineTo(204, 246); k.lineTo(250, 242); k.lineTo(640, 238); k.lineTo(640, 270); k.closePath(); k.fill();
    for (let i = 0; i < 9; i++) R(noche ? "#24222c" : "#5a564e", 200 + i * 48, 250 + (i % 3) * 5, 30, 2);
    R(noche ? "#141a3a" : "#5f9fd0", 140, 258, 120, 12);
    for (let i = 0; i < 8; i++) R(noche ? "#2a3a6a" : "#9fd0f0", 150 + i * 13, 261 + (i % 2) * 4, 7, 1);
    // torres del fondo (más lejanas)
    k.globalAlpha = 0.75; torre(244, 150, 16, 246, 30, 2); torre(624, 132, 18, 246, 34, 3); k.globalAlpha = 1;
    // muralla con almenas y puerta
    R(piedra, 226, 214, 404, 32); piedras(226, 214, 404, 32); almenas(226, 214, 404);
    for (let i = 0; i < 12; i++) ventana(240 + i * 32, 224, 3, 6, (i % 4) === 1);
    R(oscura, 412, 228, 22, 18); k.fillStyle = oscura; k.beginPath(); k.arc(423, 228, 11, Math.PI, 0); k.fill();
    R(noche ? "#3a2a1e" : "#5a3a1e", 414, 230, 18, 16);
    // torres de la izquierda y terraza con balaustrada
    torre(262, 168, 26, 246, 36);
    R(sombra, 282, 198, 40, 4); for (let i = 284; i < 322; i += 5) R(piedra, i, 191, 2, 7); R(piedra, 282, 190, 40, 2);
    torre(304, 138, 22, 214, 42, 3);
    // gran salón: tejado a dos aguas, ventanales y contrafuertes
    R(piedra, 330, 160, 140, 54); piedras(330, 160, 140, 54); R(sombra, 330, 206, 140, 8);
    for (let i = 0; i < 6; i++) ventana(338 + i * 22, 174, 8, 24, i % 2 === 0);
    for (let i = 0; i < 7; i++) { k.strokeStyle = sombra; k.lineWidth = 3; k.beginPath(); k.moveTo(332 + i * 22, 214); k.lineTo(326 + i * 22, 188); k.stroke(); }
    k.fillStyle = tejado; k.beginPath(); k.moveTo(326, 162); k.lineTo(474, 162); k.lineTo(456, 122); k.lineTo(344, 122); k.closePath(); k.fill();
    k.fillStyle = tejadoC; for (let i = 0; i < 5; i++) k.fillRect(352 + i * 22, 132, 10, 2);
    for (let i = 0; i < 3; i++) { R(piedra, 362 + i * 36, 132, 10, 14); k.fillStyle = tejado; k.beginPath(); k.moveTo(360 + i * 36, 132); k.lineTo(367 + i * 36, 122); k.lineTo(374 + i * 36, 132); k.fill(); ventana(365 + i * 36, 137, 4, 6, true); }
    torre(344, 150, 10, 164, 18, 0, false); torre(456, 146, 10, 164, 18, 0, false);
    gargola(326, 160, -1); gargola(474, 160, 1);
    // gran torre del reloj con balcón
    torre(490, 84, 32, 246, 56, 0);
    for (let i = 0; i < 3; i++) ventana(486, 150 + i * 26, 8, 14, i !== 1);
    R(sombra, 470, 130, 40, 4); for (let i = 472; i < 508; i += 5) R(piedra, i, 123, 2, 7); R(piedra, 470, 122, 40, 2);
    gargola(470, 120, -1); gargola(510, 120, 1);
    k.fillStyle = noche ? "#d9cfa8" : "#f3e6cf"; k.beginPath(); k.arc(490, 104, 10, 0, Math.PI * 2); k.fill();
    k.strokeStyle = oscura; k.lineWidth = 2; k.beginPath(); k.arc(490, 104, 10, 0, Math.PI * 2); k.stroke();
    k.lineWidth = 1.5; k.beginPath(); k.moveTo(490, 104); k.lineTo(490, 97); k.moveTo(490, 104); k.lineTo(495, 106); k.stroke();
    // puente cubierto hacia la torre de la derecha
    R(piedra, 506, 186, 50, 12); R(tejado, 504, 180, 54, 6);
    for (let i = 0; i < 3; i++) { k.fillStyle = oscura; k.beginPath(); k.arc(516 + i * 15, 198, 5, 0, Math.PI); k.fill(); ventana(513 + i * 15, 189, 4, 5, true); }
    torre(570, 128, 28, 246, 46, 4);
    gargola(553, 124, -1); gargola(587, 124, 1);
    // terraza de la derecha
    R(sombra, 590, 208, 36, 4); for (let i = 592; i < 624; i += 5) R(piedra, i, 201, 2, 7); R(piedra, 590, 200, 36, 2);
    // hiedra
    if (!noche) for (let i = 0; i < 40; i++) R(i % 2 ? "#4f8a3e" : "#3e7a34", 228 + (i * 23) % 130, 226 + (i * 7) % 20, 3, 3);
    // perspectiva aérea: el castillo queda lejos, más claro (de día) o más azulado (de noche)
    k.globalCompositeOperation = "source-atop";
    k.fillStyle = noche ? "rgba(40,30,90,.22)" : "rgba(200,232,250,.34)"; k.fillRect(0, 0, W, H);
    x.drawImage(c, 0, 0);
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
    colinas(x, 290, 26, 2.1, noche ? "#16302a" : "#5fb85f");
    arbol(x, 40, 236, 1.2, noche ? "#1d4a2a" : "#3e9e4a", noche ? "#163a22" : "#2f7f3a");
    arbol(x, 112, 248, 1, noche ? "#1d4a2a" : "#3e9e4a", noche ? "#163a22" : "#2f7f3a");
    castillo(x, noche);
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
    const cx = 150, cy = 70 + Math.sin(t * 1.2) * 5;
    // haz tractor sobre la torre
    ctx.globalAlpha = 0.12 + Math.sin(t * 3) * 0.04; ctx.fillStyle = "#2fe6ff";
    ctx.beginPath(); ctx.moveTo(cx - 26, cy + 52); ctx.lineTo(cx + 26, cy + 52); ctx.lineTo(cx + 420, G); ctx.lineTo(cx + 230, G); ctx.fill(); ctx.globalAlpha = 1;
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
    // Profundidad: el fondo se dibuja algo desenfocado y con bruma para que se separe del
    // escenario de juego (el suelo donde están la honda y la torre queda nítido)
    const corte = clave === "cafeteria" ? 300 : 296;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, corte); ctx.clip();
    ctx.filter = "blur(1.2px)"; ctx.drawImage(cache[clave], 0, 0); ctx.filter = "none";
    ctx.restore();
    ctx.drawImage(cache[clave], 0, corte, W, H - corte, 0, corte, W, H - corte);

    if (clave === "prado" || clave === "noche") ondearBanderas(ctx, clave === "noche" ? banderas.noche : banderas.dia, t);
    if (clave === "prado") {
      for (const [x0, y, s, v] of [[60, 52, 1.2, 8], [300, 34, 0.9, 5], [520, 96, 1, 7], [800, 70, 1.3, 6]]) nube(ctx, ((x0 + t * v) % 760) - 60, y, s);
      // estudiantes dando vueltas al castillo en escoba (pequeños: están lejos)
      const capas = ["#3a2a6e", "#7a1e2a", "#1e5a3a", "#2a2a2a", "#5a3a1e", "#1e3a5a", "#6a1e5a"];
      for (let i = 0; i < 7; i++) {
        const a = t * (0.35 + i * 0.05) + i * 0.9, ox = 430 + (i % 3 - 1) * 70, oy = 120 + (i % 2) * 40;
        const x = ox + Math.cos(a) * (150 + i * 6), y = oy + Math.sin(a) * 30;
        ctx.save(); ctx.globalAlpha = Math.sin(a) < 0 ? 0.55 : 0.9; ctx.translate(x, y); ctx.scale(0.55, 0.55);
        escoba(ctx, 0, 0, t + i, capas[i], -Math.sin(a) >= 0 ? -1 : 1); ctx.restore();
      }
      // y un par que pasan más cerca
      for (let i = 0; i < 2; i++) {
        const d = i ? -1 : 1; let x = ((t * (42 + i * 12) + i * 300) % (W + 160)) - 80; if (d < 0) x = W - x;
        escoba(ctx, x, 46 + i * 36 + Math.sin(t * 1.6 + i) * 8, t + i, i ? "#7a1e2a" : "#3a2a6e", d);
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

  function ondearBanderas(ctx, lista, t) {
    const cols = ["#c4161f", "#ffcf3a", "#2a4aa8", "#2f7f3a"];
    lista.forEach((b, i) => {
      ctx.globalAlpha = 0.85;
      for (let s = 0; s < 4; s++) { ctx.fillStyle = cols[i % 4]; ctx.fillRect(b.x + s * 3, b.y + Math.round(Math.sin(t * 6 + s + i) * 1.5), 3, 5); }
      ctx.globalAlpha = 1;
    });
  }

  // Suelo dibujado aparte: el de la torre (va por encima de los bloques que caen fuera)
  window.FONDOS4 = { dibujar };
})();
