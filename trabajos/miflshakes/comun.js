/* =============================================================
   SHAKE WEEK · utilidades comunes de los juegos (días 4 y 5)
   Sonido chiptune, post-proceso CRT, texto pixelado, guardado.
   ============================================================= */
(() => {
  "use strict";
  const W = 640, H = 360;
  const PAL = {
    negro: "#0b0a0f", rojo: "#e3222e", rojoOsc: "#9c1420", crema: "#f3e6cf", blanco: "#fffaf0", rosa: "#ff5fa8",
    cian: "#2fe6ff", magenta: "#ff2fd0", verde: "#3dff7a", azul: "#3d5cff", oro: "#ffcf3a", gris: "#2a2433", grisC: "#5b5068",
    marron: "#7a4a2a", amarillo: "#ffe14a", menta: "#7dffb8", arandano: "#4b5cff"
  };
  const FUENTE = '"Press Start 2P", ui-monospace, monospace';

  function cargar(src) { return new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(i); i.src = src; }); }
  function tintar(img, color, alfa = 1) {
    const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
    const x = c.getContext("2d"); x.drawImage(img, 0, 0);
    x.globalCompositeOperation = "source-atop"; x.globalAlpha = alfa; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
    return c;
  }

  /* ---------- Sonido ---------- */
  const Sonido = {
    ac: null, master: null, on: true, musica: null, paso: 0, prox: 0, tempo: 150, cancion: null,
    iniciar() {
      if (this.ac) { if (this.ac.state === "suspended") this.ac.resume(); return; }
      try {
        this.ac = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.ac.createGain(); this.master.gain.value = this.on ? 0.5 : 0; this.master.connect(this.ac.destination);
      } catch (e) { this.ac = null; }
    },
    alternar() {
      this.on = !this.on; if (this.master) this.master.gain.value = this.on ? 0.5 : 0;
      const b = document.getElementById("btnSonido"); if (b) b.textContent = this.on ? "🔊" : "🔇";
    },
    tono(f1, f2, dur, tipo = "square", vol = 0.1, ret = 0) {
      if (!this.ac) return; const t = this.ac.currentTime + ret;
      const o = this.ac.createOscillator(), g = this.ac.createGain();
      o.type = tipo; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
    },
    ruido(dur, vol = 0.2, corte = 1500, ret = 0) {
      if (!this.ac) return; const t = this.ac.currentTime + Math.max(0, ret);
      const n = Math.max(1, Math.floor(this.ac.sampleRate * dur)), buf = this.ac.createBuffer(1, n, this.ac.sampleRate), d = buf.getChannelData(0);
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
    // cancion = { tempo, bajo: [[4 notas] x 4 compases], acordes: [[3 notas] x 4], melodia: [32 corcheas], swing, bateria }
    empezarMusica(cancion) {
      if (!this.ac) return; this.pararMusica();
      this.cancion = cancion; this.tempo = cancion.tempo; this.paso = 0; this.prox = this.ac.currentTime + 0.08;
      this.musica = setInterval(() => this.programar(), 25);
    },
    pararMusica() { clearInterval(this.musica); this.musica = null; },
    programar() {
      const ac = this.ac, c = this.cancion, negra = 60 / this.tempo;
      while (this.prox < ac.currentTime + 0.12) {
        const i = this.paso % 32, comp = Math.floor(i / 8), corchea = i % 8;
        const dur = c.swing ? (corchea % 2 === 0 ? 2 / 3 : 1 / 3) * negra : negra / 2;
        const t = this.prox;
        if (corchea % 2 === 0) {
          const pulso = corchea / 2;
          this.nota(c.bajo[comp][pulso], t, negra * 0.85, "triangle", 0.22);
          if (pulso % 2 === 1) c.acordes[comp].forEach(n => this.nota(n - 12, t, 0.09, "square", 0.022));
          if (c.bateria && pulso % 2 === 0) this.tonoEn(t, 150, 50, 0.12, "sine", 0.3);
        }
        const mel = c.melodia[i]; if (mel) this.nota(mel, t, Math.min(0.16, dur * 0.9), "square", 0.04);
        if (c.bateria || corchea % 2 === 1) this.ruido(0.03, 0.025, 7000, t - ac.currentTime);
        this.prox += dur; this.paso++;
      }
    },
    tonoEn(t, f1, f2, dur, tipo, vol) {
      const o = this.ac.createOscillator(), g = this.ac.createGain();
      o.type = tipo; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
    }
  };

  /* ---------- Texto pixelado con borde ---------- */
  function texto(ctx, t, x, y, tam, color = PAL.crema, alinear = "center", borde = PAL.negro, grosor = 2) {
    ctx.font = `${tam}px ${FUENTE}`; ctx.textAlign = alinear; ctx.textBaseline = "middle";
    if (borde) {
      ctx.fillStyle = borde;
      for (const [dx, dy] of [[-grosor, 0], [grosor, 0], [0, -grosor], [0, grosor], [grosor, grosor], [-grosor, grosor], [grosor, -grosor], [-grosor, -grosor], [grosor + 1, grosor + 1]])
        ctx.fillText(t, Math.round(x + dx), Math.round(y + dy));
    }
    ctx.fillStyle = color; ctx.fillText(t, Math.round(x), Math.round(y));
  }

  /* ---------- Post-proceso CRT: grano, líneas, viñeta ---------- */
  function crearPost() {
    const granos = [];
    for (let n = 0; n < 4; n++) {
      const c = document.createElement("canvas"); c.width = W / 2; c.height = H / 2;
      const x = c.getContext("2d"), d = x.createImageData(c.width, c.height);
      for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() < 0.5 ? 0 : 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = Math.random() < 0.87 ? 0 : Math.random() * 34; }
      x.putImageData(d, 0, 0); x.fillStyle = "rgba(255,255,255,.07)"; x.fillRect(Math.random() * c.width, 0, 1, c.height); granos.push(c);
    }
    const lin = document.createElement("canvas"); lin.width = W; lin.height = H; const lx = lin.getContext("2d");
    lx.fillStyle = "rgba(0,0,0,.15)"; for (let y = 0; y < H; y += 2) lx.fillRect(0, y, W, 1);
    const g = lx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.62);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.6)"); lx.fillStyle = g; lx.fillRect(0, 0, W, H);
    return (ctx, reloj, flash = 0) => {
      ctx.drawImage(granos[Math.floor(reloj * 24) % granos.length], 0, 0, W, H);
      ctx.drawImage(lin, 0, 0);
      ctx.fillStyle = `rgba(30,15,10,${0.03 + Math.random() * 0.03})`; ctx.fillRect(0, 0, W, H);
      if (flash > 0) { ctx.fillStyle = `rgba(255,250,240,${Math.min(0.6, flash * 5)})`; ctx.fillRect(0, 0, W, H); }
    };
  }

  /* ---------- Cartel animado (¡PREPARADOS!, K.O., etc.) ---------- */
  function dibujarCartel(ctx, b, y = H / 2 - 20) {
    if (!b) return;
    const k = b.t / b.dur;
    const esc = k < 0.15 ? 0.4 + (k / 0.15) * 0.7 : k > 0.85 ? 1.1 - (k - 0.85) / 0.15 * 0.2 : 1.1 - (k - 0.15) * 0.1;
    ctx.save(); ctx.translate(W / 2, y); ctx.scale(esc, esc); ctx.globalAlpha = k > 0.85 ? 1 - (k - 0.85) / 0.15 : 1;
    texto(ctx, b.texto, 0, 0, b.tam || (b.texto.length > 12 ? 24 : 36), b.color || PAL.crema);
    if (b.sub) texto(ctx, b.sub, 0, 42, 13, PAL.blanco);
    ctx.restore();
  }

  /* ---------- Guardar el sello del día en la Shake Week ---------- */
  function guardarDia(dia, puntos) {
    try {
      const est = JSON.parse(localStorage.getItem("shakeweek-v1") || "{}");
      const modo = est.modo === "campana" ? "campana" : "demo";
      est.modo = est.modo || "demo"; est.demo = est.demo || {}; est.campana = est.campana || {}; est.mejores = est.mejores || {};
      const d = new Date(), hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!est[modo][dia]) est[modo][dia] = hoy;
      est.mejores[dia] = Math.max(est.mejores[dia] || 0, puntos);
      localStorage.setItem("shakeweek-v1", JSON.stringify(est));
    } catch (e) {}
  }
  const leerPref = (k, def) => { try { return JSON.parse(localStorage.getItem(k) || "null") ?? def; } catch (e) { return def; } };
  const guardarPref = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const nota = pts => pts >= 95 ? "A+" : pts >= 88 ? "A" : pts >= 80 ? "A-" : pts >= 72 ? "B+" : pts >= 64 ? "B" : pts >= 56 ? "B-" : pts >= 48 ? "C+" : pts >= 40 ? "C" : "D";

  window.SW = { W, H, PAL, FUENTE, cargar, tintar, Sonido, texto, crearPost, dibujarCartel, guardarDia, leerPref, guardarPref, nota };
})();
