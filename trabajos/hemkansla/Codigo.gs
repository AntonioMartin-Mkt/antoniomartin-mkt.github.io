/**
 * HEMKÄNSLA — Family Club | Backend (Apps Script)
 * Proyecto académico — CFGS Marketing y Publicidad
 *
 * Funciones:
 *  - Sirve la landing (Index.html)
 *  - Guarda nombre, correo y opt-ins en Google Sheets (base de datos)
 *  - Envía correo de confirmación de alta en el Family Club
 *  - Envía correo de confirmación de alta en comunicaciones de ofertas
 *
 * ---------------------------------------------------------------
 * CONFIGURA ESTO ANTES DE DESPLEGAR:
 * ---------------------------------------------------------------
 */
const CONFIG = {
  SHEET_ID: 'PEGA_AQUI_EL_ID_DE_TU_HOJA',   // <-- ID de la hoja de Google Sheets
  SHEET_NAME: 'Suscripciones',               // pestaña donde se guardan los datos
  MARCA: 'HEMKÄNSLA',
  CORREO_RESPUESTA: '',                      // opcional: deja '' para usar tu cuenta por defecto
};

/** Punto de entrada: muestra la landing */
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('HEMKÄNSLA — Family Club')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Permite incluir archivos (no imprescindible, útil si separas CSS/JS) */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/** Devuelve la hoja, creando cabeceras si hace falta */
function getSheet_() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Nombre', 'Correo electrónico', 'Family Club', 'Ofertas']);
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
  }
  return sheet;
}

/**
 * Recibe los datos del formulario desde el HTML.
 * data = { nombre, correo, familyClub (bool), ofertas (bool), origen }
 */
function registrar(data) {
  try {
    // Validación básica
    const nombre = (data.nombre || '').toString().trim();
    const correo = (data.correo || '').toString().trim();
    const familyClub = data.familyClub === true;
    const ofertas = data.ofertas === true;

    if (!correo || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) {
      return { ok: false, msg: 'Introduce un correo electrónico válido.' };
    }
    if (!familyClub && !ofertas) {
      return { ok: false, msg: 'Marca al menos una opción para continuar.' };
    }

    // Guardar en la hoja: Nombre · Correo electrónico · Family Club · Ofertas
    const sheet = getSheet_();
    sheet.appendRow([
      nombre,
      correo,
      familyClub ? 'Sí' : 'No',
      ofertas ? 'Sí' : 'No'
    ]);

    // Enviar correos según opt-ins
    if (familyClub) enviarCorreoFamily_(nombre, correo);
    if (ofertas)    enviarCorreoOfertas_(nombre, correo);

    return { ok: true, msg: '¡Listo! Revisa tu correo para confirmar.' };
  } catch (err) {
    return { ok: false, msg: 'Ha ocurrido un error. Inténtalo de nuevo.' };
  }
}

/** Correo 1: confirmación de alta en el Family Club */
function enviarCorreoFamily_(nombre, correo) {
  const saludo = nombre ? `Hola ${nombre},` : 'Hola,';
  const asunto = `Bienvenido/a al ${CONFIG.MARCA} Family Club`;
  const cuerpoHtml = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#111;">
      <div style="background:#0058A3;color:#FFDA1A;padding:24px;text-align:center;font-size:22px;font-weight:bold;letter-spacing:1px;">
        ${CONFIG.MARCA}
      </div>
      <div style="padding:28px 24px;line-height:1.6;">
        <h2 style="margin-top:0;">${saludo}</h2>
        <p>Tu alta en el <strong>${CONFIG.MARCA} Family Club</strong> se ha confirmado correctamente.</p>
        <p>A partir de ahora tendrás acceso a precios para socios, ideas para tu hogar y ventajas exclusivas.</p>
        <p style="color:#666;font-size:13px;margin-top:28px;">
          Proyecto académico — CFGS Marketing y Publicidad. Marca ficticia, sin fines comerciales.
        </p>
      </div>
    </div>`;
  MailApp.sendEmail({
    to: correo,
    subject: asunto,
    htmlBody: cuerpoHtml,
    name: `${CONFIG.MARCA} Family Club`,
    replyTo: CONFIG.CORREO_RESPUESTA || undefined
  });
}

/** Correo 2: confirmación de alta en comunicaciones de ofertas */
function enviarCorreoOfertas_(nombre, correo) {
  const saludo = nombre ? `Hola ${nombre},` : 'Hola,';
  const asunto = `Ya recibirás nuestras ofertas y promociones`;
  const cuerpoHtml = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#111;">
      <div style="background:#FFDA1A;color:#0058A3;padding:24px;text-align:center;font-size:22px;font-weight:bold;letter-spacing:1px;">
        ${CONFIG.MARCA}
      </div>
      <div style="padding:28px 24px;line-height:1.6;">
        <h2 style="margin-top:0;">${saludo}</h2>
        <p>Has aceptado recibir <strong>ofertas, promociones y novedades</strong> de ${CONFIG.MARCA}.</p>
        <p>Te escribiremos solo cuando merezca la pena. Podrás darte de baja cuando quieras.</p>
        <p style="color:#666;font-size:13px;margin-top:28px;">
          Proyecto académico — CFGS Marketing y Publicidad. Marca ficticia, sin fines comerciales.
        </p>
      </div>
    </div>`;
  MailApp.sendEmail({
    to: correo,
    subject: asunto,
    htmlBody: cuerpoHtml,
    name: `${CONFIG.MARCA} Ofertas`,
    replyTo: CONFIG.CORREO_RESPUESTA || undefined
  });
}