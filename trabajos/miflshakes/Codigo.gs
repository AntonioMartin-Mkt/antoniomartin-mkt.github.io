/**
 * SHAKE WEEK · Miflshakes | Backend (Google Apps Script)
 * Proyecto académico — CFGS Marketing y Publicidad
 *
 * Recibe dos tipos de evento desde la landing (index.html):
 *  - "registro": nombre, email y consentimientos  → pestaña "Registros"
 *  - "victoria": email, día superado y puntos     → pestaña "Victorias"
 * Cuando un email suma los 5 días, le envía su código 2x1.
 *
 * CÓMO CONECTARLO
 * 1. Crea una hoja de Google Sheets y copia su ID (lo que va entre /d/ y /edit en la URL).
 * 2. En la hoja: Extensiones → Apps Script. Pega este archivo y rellena SHEET_ID.
 * 3. Implementar → Nueva implementación → Aplicación web.
 *    Ejecutar como: Yo · Quién tiene acceso: Cualquier usuario.
 * 4. Copia la URL que te da y pégala en SHEETS_URL dentro de index.html.
 */
const CONFIG = {
  SHEET_ID: 'PEGA_AQUI_EL_ID_DE_TU_HOJA',
  MARCA: 'Miflshakes',
};

function hoja_(nombre, cabecera) {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sh = ss.getSheetByName(nombre) || ss.insertSheet(nombre);
  if (sh.getLastRow() === 0) {
    sh.appendRow(cabecera);
    sh.getRange(1, 1, 1, cabecera.length).setFontWeight('bold');
  }
  return sh;
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    const email = String(d.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return respuesta_({ ok: false, error: 'email' });

    if (d.tipo === 'registro') {
      if (d.privacidad !== true) return respuesta_({ ok: false, error: 'privacidad' });
      hoja_('Registros', ['Fecha', 'Nombre', 'Email', 'Privacidad y bases', 'Ofertas por email'])
        .appendRow([new Date(), String(d.nombre || '').slice(0, 80), email, 'Sí', d.ofertas === true ? 'Sí' : 'No']);
    }

    if (d.tipo === 'victoria') {
      const sh = hoja_('Victorias', ['Fecha', 'Email', 'Día', 'Puntos']);
      sh.appendRow([new Date(), email, Number(d.dia) || 0, Number(d.puntos) || 0]);
      if (Number(d.dia) === 5) enviarCodigo_(email);
    }
    return respuesta_({ ok: true });
  } catch (err) {
    return respuesta_({ ok: false, error: String(err) });
  }
}

/** Comprueba que tiene los 5 días y envía el código 2x1 */
function enviarCodigo_(email) {
  const filas = hoja_('Victorias', ['Fecha', 'Email', 'Día', 'Puntos']).getDataRange().getValues().slice(1);
  const dias = new Set(filas.filter(f => f[1] === email).map(f => f[2]));
  if (dias.size < 5) return;
  const codigo = 'SHAKE-' + Utilities.getUuid().slice(0, 5).toUpperCase();
  MailApp.sendEmail({
    to: email,
    subject: '🥤 ¡Has completado la Shake Week! Aquí tienes tu 2x1',
    htmlBody: '<p>¡Lo has conseguido! Has vencido al Alter Ego los 5 días seguidos.</p>' +
              '<p>Tu código 2x1 en batidos: <b style="font-size:20px">' + codigo + '</b></p>' +
              '<p>Enséñalo en caja en cualquier tienda ' + CONFIG.MARCA + '. Válido 15 días.</p>'
  });
}

function respuesta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
