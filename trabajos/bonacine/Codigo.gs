/**
 * BONACINE | Backend del registro (Google Apps Script)
 * Proyecto académico, CFGS Marketing y Publicidad
 *
 * Registro: guarda el alta en Google Sheets, crea un código de descuento
 * único y lo envía por correo.
 * Newsletter: guarda el correo en su propia pestaña.
 *
 * CÓMO CONECTARLO
 * 1. Crea una hoja de Google Sheets y copia su ID (lo que va entre /d/ y /edit en la URL).
 * 2. En la hoja: Extensiones → Apps Script. Pega este archivo y rellena SHEET_ID.
 * 3. Implementar → Nueva implementación → Aplicación web.
 *    Ejecutar como: Yo. Quién tiene acceso: Cualquier usuario.
 * 4. Copia la URL que te da y pégala en SHEETS_URL, arriba del todo en main.js.
 */
const CONFIG = {
  SHEET_ID: 'PEGA_AQUI_EL_ID_DE_TU_HOJA',
  PESTANA: 'Registros',
  MARCA: 'BonaCine',
};

const CABECERA = ['Fecha', 'Nombre', 'Email', 'Código', 'Privacidad', 'Estrenos por email'];

function hoja_(nombre, cabecera) {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sh = ss.getSheetByName(nombre) || ss.insertSheet(nombre);
  if (sh.getLastRow() === 0) {
    sh.appendRow(cabecera);
    sh.getRange(1, 1, 1, cabecera.length).setFontWeight('bold');
  }
  return sh;
}

function suscribir_(email) {
  const sh = hoja_('Newsletter', ['Fecha', 'Email']);
  const ya = sh.getDataRange().getValues().some((f) => f[1] === email);
  if (!ya) sh.appendRow([new Date(), email]);
  return respuesta_({ ok: true });
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    const email = String(d.email || '').trim().toLowerCase();
    // Quita los signos que Sheets interpretaría como fórmula.
    const nombre = String(d.nombre || '').trim().replace(/^[=+\-@]+/, '').slice(0, 80);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return respuesta_({ ok: false, error: 'email' });
    if (d.tipo === 'newsletter') return suscribir_(email);

    if (!nombre) return respuesta_({ ok: false, error: 'nombre' });
    if (d.privacidad !== true) return respuesta_({ ok: false, error: 'privacidad' });

    const sh = hoja_(CONFIG.PESTANA, CABECERA);
    // Un correo, un código: si ya está registrado, se le devuelve el suyo.
    const filas = sh.getDataRange().getValues();
    const previa = filas.find((f) => f[2] === email);
    if (previa) return respuesta_({ ok: true, codigo: previa[3], repetido: true });

    const codigo = crearCodigo_(filas);
    sh.appendRow([new Date(), nombre, email, codigo, 'Sí', d.ofertas === true ? 'Sí' : 'No']);
    enviarCodigo_(nombre, email, codigo);
    return respuesta_({ ok: true, codigo: codigo });
  } catch (err) {
    return respuesta_({ ok: false, error: 'servidor' });
  }
}

function crearCodigo_(filas) {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const usados = new Set(filas.map((f) => f[3]));
  let codigo;
  do {
    codigo = 'BONA-';
    for (let i = 0; i < 4; i++) codigo += letras[Math.floor(Math.random() * letras.length)];
  } while (usados.has(codigo));
  return codigo;
}

function enviarCodigo_(nombre, email, codigo) {
  MailApp.sendEmail({
    to: email,
    subject: 'Tu descuento de 2 € en ' + CONFIG.MARCA,
    name: CONFIG.MARCA,
    body:
      'Hola, ' + nombre + ':\n\n' +
      'Tu código es ' + codigo + '.\n' +
      'Enséñalo en taquilla y te descontamos 2 € en tu primera entrada.\n\n' +
      'Nos vemos en el cine.\n' + CONFIG.MARCA + ', Bonares (Huelva)',
  });
}

function respuesta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
