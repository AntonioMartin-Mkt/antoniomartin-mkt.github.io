# -*- coding: utf-8 -*-
"""Genera el Dossier de marca de Cruzcampo (.pptx). Ejecutar: python3 build.py"""
import os, qrcode
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.dml import MSO_LINE_DASH_STYLE

HERE = os.path.dirname(os.path.abspath(__file__))
QR_DIR = os.path.join(HERE, "qr")
os.makedirs(QR_DIR, exist_ok=True)

# ---------- Paleta inspirada en la identidad de Cruzcampo ----------
RED = RGBColor(0xC8, 0x10, 0x2E)      # rojo Cruzcampo
WINE = RGBColor(0x7A, 0x0E, 0x1E)     # rojo profundo
CREAM = RGBColor(0xF7, 0xF0, 0xE3)    # crema (fondo)
SAND = RGBColor(0xEC, 0xDF, 0xC6)     # crema oscuro (tarjetas)
GOLD = RGBColor(0xB8, 0x8A, 0x2E)     # dorado
INK = RGBColor(0x2B, 0x1B, 0x16)      # texto
MUTED = RGBColor(0x6E, 0x5A, 0x4E)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
GREEN = RGBColor(0x2F, 0x6B, 0x3A)

SERIF = "Cambria"
SANS = "Calibri"

# ---------- Datos de portada (rellenar) ----------
INTEGRANTES = "[Nombre Apellido] y [Nombre Apellido]"
CURSO = "[Curso / grupo]"
FECHA = "28 de octubre de 2026"
LIBRO = "[Título del libro], [Editorial], [año]"
PAGINAS = "págs. [__]–[__]"

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]
W, H = prs.slide_width, prs.slide_height


def rgb_fill(shape, color):
    shape.fill.solid()
    shape.fill.fore_color.rgb = color


def rect(slide, x, y, w, h, color, line=None, shape=MSO_SHAPE.RECTANGLE):
    s = slide.shapes.add_shape(shape, x, y, w, h)
    rgb_fill(s, color)
    if line is None:
        s.line.fill.background()
    else:
        s.line.color.rgb = line
        s.line.width = Pt(1)
    s.shadow.inherit = False
    return s


def text(slide, x, y, w, h, content, size=14, color=INK, font=SANS, bold=False,
         align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, italic=False, spacing=1.1):
    """content: str | list of paragraphs. A paragraph is str or list of runs (txt, {opts})."""
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    for m in ("margin_left", "margin_right", "margin_top", "margin_bottom"):
        setattr(tf, m, 0)
    paras = content if isinstance(content, list) else [content]
    for i, para in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = spacing
        runs = para if isinstance(para, list) else [(para, {})]
        for r in runs:
            if isinstance(r, str):
                r = (r, {})
            t, o = r
            run = p.add_run()
            run.text = t
            f = run.font
            f.name = o.get("font", font)
            f.size = Pt(o.get("size", size))
            f.bold = o.get("bold", bold)
            f.italic = o.get("italic", italic)
            f.color.rgb = o.get("color", color)
        if isinstance(para, list) and para and isinstance(para[0], tuple) and para[0][1].get("space"):
            p.space_before = Pt(para[0][1]["space"])
    return tb


def bullets(slide, x, y, w, h, items, size=13, color=INK, gap=5, marker="■"):
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    for m in ("margin_left", "margin_right", "margin_top", "margin_bottom"):
        setattr(tf, m, 0)
    for i, it in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_after = Pt(gap)
        p.line_spacing = 1.08
        r = p.add_run()
        r.text = marker + "  "
        r.font.size = Pt(size - 4)
        r.font.color.rgb = RED
        r.font.name = SANS
        parts = it if isinstance(it, list) else [it]
        for part in parts:
            t, o = (part, {}) if isinstance(part, str) else part
            rr = p.add_run()
            rr.text = t
            rr.font.name = SANS
            rr.font.size = Pt(o.get("size", size))
            rr.font.bold = o.get("bold", False)
            rr.font.italic = o.get("italic", False)
            rr.font.color.rgb = o.get("color", color)
    return tb


def placeholder(slide, x, y, w, h, label, dark=False):
    s = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, h)
    rgb_fill(s, WINE if dark else SAND)
    s.line.color.rgb = CREAM if dark else GOLD
    s.line.width = Pt(1.25)
    s.line.dash_style = MSO_LINE_DASH_STYLE.DASH
    s.shadow.inherit = False
    tf = s.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    for i, line in enumerate(["INSERTAR"] + label.split("\n")):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = PP_ALIGN.CENTER
        r = p.add_run()
        r.text = line
        r.font.size = Pt(11)
        r.font.bold = i == 0
        r.font.name = SANS
        r.font.color.rgb = CREAM if dark else MUTED
    return s


def qr(slide, url, name, x, y, size=Inches(1.15), caption=None, cap_color=MUTED):
    path = os.path.join(QR_DIR, name + ".png")
    img = qrcode.make(url, border=1)
    img.save(path)
    slide.shapes.add_picture(path, x, y, size, size)
    if caption:
        text(slide, x - Inches(0.2), y + size + Inches(0.05), size + Inches(0.4), Inches(0.4),
             caption, size=9, color=cap_color, align=PP_ALIGN.CENTER)


page_no = [0]


def base(section, title, subtitle=None):
    s = prs.slides.add_slide(BLANK)
    page_no[0] += 1
    rgb_fill_bg(s, CREAM)
    rect(s, 0, 0, W, Inches(0.12), RED)
    text(s, Inches(0.6), Inches(0.42), Inches(9), Inches(0.3), section.upper(),
         size=11, color=RED, bold=True)
    text(s, Inches(0.6), Inches(0.7), Inches(12.1), Inches(0.8), title,
         size=30, color=INK, font=SERIF, bold=True)
    if subtitle:
        text(s, Inches(0.6), Inches(1.38), Inches(12.1), Inches(0.4), subtitle,
             size=14, color=MUTED, italic=True)
    rect(s, Inches(0.6), Inches(7.0), Inches(12.13), Emu(9525), GOLD)
    text(s, Inches(0.6), Inches(7.08), Inches(8), Inches(0.3),
         "CRUZCAMPO · DOSSIER DE MARCA · DÍA DE LA EMPRESA ANDALUZA", size=9, color=MUTED)
    text(s, Inches(11.73), Inches(7.08), Inches(1), Inches(0.3), f"{page_no[0]:02d}",
         size=9, color=RED, bold=True, align=PP_ALIGN.RIGHT)
    return s


def rgb_fill_bg(slide, color):
    bg = slide.background.fill
    bg.solid()
    bg.fore_color.rgb = color


def card(slide, x, y, w, h, head, body, head_color=RED, fill=SAND, size=12):
    rect(slide, x, y, w, h, fill)
    rect(slide, x, y, Inches(0.07), h, head_color)
    text(slide, x + Inches(0.25), y + Inches(0.15), w - Inches(0.4), Inches(0.4), head,
         size=14, bold=True, color=head_color, font=SERIF)
    if isinstance(body, list) and body and not isinstance(body[0], tuple):
        bullets(slide, x + Inches(0.25), y + Inches(0.6), w - Inches(0.4), h - Inches(0.7),
                body, size=size, gap=3, marker="•")
    else:
        text(slide, x + Inches(0.25), y + Inches(0.6), w - Inches(0.4), h - Inches(0.7), body,
             size=size)


def table(slide, x, y, w, rows, col_w, row_h=Inches(0.42), size=11, head_fill=WINE):
    nrows, ncols = len(rows), len(rows[0])
    gt = slide.shapes.add_table(nrows, ncols, x, y, w, row_h * nrows)
    t = gt.table
    for i, cw in enumerate(col_w):
        t.columns[i].width = cw
    for r in range(nrows):
        for c in range(ncols):
            cell = t.cell(r, c)
            cell.margin_left = cell.margin_right = Inches(0.08)
            cell.margin_top = cell.margin_bottom = Inches(0.04)
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            val = rows[r][c]
            tf = cell.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            run = p.add_run()
            run.text = val
            run.font.name = SANS
            run.font.size = Pt(size)
            if r == 0:
                cell.fill.solid(); cell.fill.fore_color.rgb = head_fill
                run.font.bold = True; run.font.color.rgb = WHITE
            else:
                cell.fill.solid()
                cell.fill.fore_color.rgb = SAND if r % 2 else CREAM
                run.font.color.rgb = INK
                if c == 0:
                    run.font.bold = True
                    run.font.color.rgb = WINE
    return gt


# =====================================================================
# 1 · PORTADA
# =====================================================================
s = prs.slides.add_slide(BLANK)
page_no[0] += 1
rgb_fill_bg(s, RED)
rect(s, Inches(8.6), 0, Inches(4.733), H, WINE)
placeholder(s, Inches(9.35), Inches(1.6), Inches(3.2), Inches(3.2),
            "Logotipo oficial de Cruzcampo\n(Gambrinus + logotipo)\nDescárgalo de cruzcampo.es\no del kit de prensa de Heineken", dark=True)
text(s, Inches(0.8), Inches(1.0), Inches(7.5), Inches(0.4), "DOSSIER DE MARCA · 2026",
     size=14, color=SAND, bold=True)
text(s, Inches(0.8), Inches(1.55), Inches(7.6), Inches(1.6), "Cruzcampo",
     size=80, color=CREAM, font=SERIF, bold=True)
text(s, Inches(0.8), Inches(3.05), Inches(7.4), Inches(1.4),
     "Investigación de identidad, medios y campañas publicitarias de una marca andaluza",
     size=22, color=CREAM, font=SERIF, italic=True)
rect(s, Inches(0.8), Inches(4.75), Inches(1.2), Inches(0.05), GOLD)
text(s, Inches(0.8), Inches(5.0), Inches(7.4), Inches(1.6), [
    [("Integrantes  ", {"bold": True, "color": SAND}), (INTEGRANTES, {"color": CREAM})],
    [("Curso / grupo  ", {"bold": True, "color": SAND}), (CURSO, {"color": CREAM})],
    [("Entrega  ", {"bold": True, "color": SAND}), (FECHA, {"color": CREAM})],
], size=15, spacing=1.35)
text(s, Inches(9.0), Inches(6.7), Inches(4), Inches(0.4), "Día de la Empresa Andaluza · 28 de octubre",
     size=11, color=SAND, align=PP_ALIGN.CENTER)

# =====================================================================
# 2 · ÍNDICE + OBJETIVO
# =====================================================================
s = base("Índice", "Qué vas a encontrar en este dossier")
items = [
    ("01", "La marca", "Identidad, productos y contexto", "03"),
    ("02", "Fase 1 · El libro", "Medios de masas y formas publicitarias", "05"),
    ("03", "Fase 2 · Investigación", "Mapa de medios y evidencias reales", "08"),
    ("04", "Fase 3 · Dos anuncios", "Spot «Lola» (TV) y lonas «Tú tan de Berlín» (exterior)", "12"),
    ("05", "Conclusiones", "Comparación y recomendación de medio", "16"),
    ("06", "Fuentes", "Bibliografía, webgrafía y créditos", "18"),
]
y = Inches(1.75)
for n, t1, t2, pg in items:
    text(s, Inches(0.6), y, Inches(0.9), Inches(0.6), n, size=30, font=SERIF, bold=True, color=RED)
    text(s, Inches(1.5), y + Inches(0.02), Inches(5), Inches(0.35), t1, size=17, bold=True, font=SERIF)
    text(s, Inches(1.5), y + Inches(0.38), Inches(5.3), Inches(0.3), t2, size=12, color=MUTED)
    text(s, Inches(6.5), y + Inches(0.05), Inches(0.5), Inches(0.3), pg, size=12, color=GOLD, bold=True,
         align=PP_ALIGN.RIGHT)
    y += Inches(0.84)
rect(s, Inches(7.55), Inches(1.75), Inches(5.18), Inches(4.95), WINE)
text(s, Inches(7.9), Inches(2.0), Inches(4.6), Inches(0.4), "OBJETIVO DEL DOSSIER", size=12, bold=True, color=SAND)
text(s, Inches(7.9), Inches(2.45), Inches(4.6), Inches(2.0),
     "Descubrir cómo se comunica realmente Cruzcampo, en qué medios aparece y qué formas publicitarias "
     "utiliza, para analizar dos anuncios reales y recomendar a la marca qué medio debería priorizar.",
     size=15, color=CREAM, font=SERIF, spacing=1.2)
text(s, Inches(7.9), Inches(4.6), Inches(4.6), Inches(1.9), [
    [("Por qué Cruzcampo: ", {"bold": True, "color": SAND}),
     ("es la cerveza andaluza más reconocida, nacida en Sevilla en 1904, y en los últimos años ha "
      "construido toda su publicidad sobre el orgullo andaluz con la plataforma «Con mucho acento».",
      {"color": CREAM})]], size=12.5, spacing=1.15)

# =====================================================================
# 3 · LA EMPRESA: IDENTIDAD
# =====================================================================
s = base("01 · La marca", "Una cervecera sevillana desde 1904",
         "Quién es Cruzcampo y cómo se presenta")
text(s, Inches(0.6), Inches(1.95), Inches(6.2), Inches(2.4), [
    "Cruzcampo nace en 1904 en Sevilla, cuando los hermanos Osborne fundan la fábrica de cervezas "
    "«La Cruz del Campo», bautizada por el humilladero del mismo nombre. Fue la primera gran cervecera "
    "del sur de España.",
    [("Desde el año 2000 forma parte del ", {"space": 8}), ("Grupo Heineken", {"bold": True}),
     (" (hoy Heineken España), pero conserva su sede histórica en Sevilla y su identidad andaluza: "
      "la antigua fábrica se ha rehabilitado como la «Factoría Cruzcampo», un centro de cultura cervecera.", {})],
], size=13.5, spacing=1.18)
# timeline
tl = [("1904", "Fundación en Sevilla"), ("Años 20", "Aparece Gambrinus,\nobra de L. Cappiello"),
      ("1976", "Primera cerveza sin\nalcohol española*"), ("2000", "Integración en\nHeineken"),
      ("2021", "Plataforma\n«Con mucho acento»")]
x0, yline = Inches(0.6), Inches(5.05)
rect(s, x0, yline, Inches(5.7), Emu(19050), GOLD)
for i, (yr, lab) in enumerate(tl):
    cx = x0 + Inches(1.38) * i
    rect(s, cx, yline - Inches(0.08), Inches(0.18), Inches(0.18), RED, shape=MSO_SHAPE.OVAL)
    text(s, cx - Inches(0.05), yline - Inches(0.5), Inches(1.3), Inches(0.35), yr, size=14, bold=True,
         font=SERIF, color=RED)
    text(s, cx - Inches(0.05), yline + Inches(0.22), Inches(1.3), Inches(0.8), lab, size=10.5, color=INK)
text(s, Inches(0.6), Inches(6.5), Inches(6.3), Inches(0.4),
     "* Dato según fuente divulgativa; no lo hemos podido contrastar con una fuente oficial.",
     size=9, color=MUTED, italic=True)
card(s, Inches(7.3), Inches(1.95), Inches(5.43), Inches(2.25), "Su símbolo: Gambrinus", [
    "Rey legendario de Flandes al que se atribuye la invención de la cerveza.",
    "Dibujado en los años 20 por el cartelista Leonetto Cappiello.",
    "En su último rediseño recupera el estilo de los azulejos de la primera fábrica, elegido por los consumidores (68,1 % de los votos).",
], size=11.5)
card(s, Inches(7.3), Inches(4.35), Inches(5.43), Inches(2.45), "Su identidad visual", [
    "Rojo intenso como color dominante, acompañado de crema y dorado.",
    "Logotipo dibujado a mano con aire de rótulo antiguo.",
    "Tono de comunicación cercano, con humor y orgullo andaluz.",
    "Por eso este dossier usa la misma paleta: rojo, crema y dorado.",
], size=11.5)

# =====================================================================
# 4 · PRODUCTOS Y CONTEXTO
# =====================================================================
s = base("01 · La marca", "Qué ofrece y en qué contexto se comunica")
cols = [
    ("Cruzcampo Pilsen", "La cerveza clásica, la «de toda la vida» en bares andaluces."),
    ("Cruzcampo Especial", "Lager con más cuerpo, lanzada en 2018 con «Libera lo que sientes»."),
    ("Gran Reserva", "Gama premium para ocasiones especiales."),
    ("Sin alcohol y otras", "Variedades sin alcohol, ediciones limitadas «Con mucho acento»."),
]
x = Inches(0.6)
for t1, t2 in cols:
    rect(s, x, Inches(1.75), Inches(2.9), Inches(1.75), SAND)
    rect(s, x, Inches(1.75), Inches(2.9), Inches(0.07), RED)
    text(s, x + Inches(0.2), Inches(1.95), Inches(2.5), Inches(0.4), t1, size=15, bold=True, font=SERIF, color=WINE)
    text(s, x + Inches(0.2), Inches(2.4), Inches(2.5), Inches(1.0), t2, size=11.5)
    x += Inches(3.08)
text(s, Inches(0.6), Inches(3.75), Inches(6), Inches(0.4), "Contexto de la marca", size=18, bold=True, font=SERIF, color=RED)
bullets(s, Inches(0.6), Inches(4.2), Inches(6.1), Inches(2.7), [
    [("Mercado: ", {"bold": True}), "compite con Mahou-San Miguel, Estrella Galicia o Damm. En Andalucía es la marca de referencia en hostelería."],
    [("Expansión: ", {"bold": True}), "también se vende en Reino Unido, donde llegó a casi 10.000 bares y pubs en su primer año."],
    [("Sector regulado: ", {"bold": True}), "al ser una bebida alcohólica, su publicidad no puede dirigirse a menores y en TV solo se emite en franjas horarias limitadas."],
], size=12.5)
rect(s, Inches(7.1), Inches(3.75), Inches(5.63), Inches(3.05), RED)
text(s, Inches(7.45), Inches(3.95), Inches(5), Inches(0.4), "LA IDEA QUE LO UNE TODO", size=12, bold=True, color=SAND)
text(s, Inches(7.45), Inches(4.35), Inches(5), Inches(0.9), "«Con mucho acento»", size=32, bold=True, font=SERIF, color=CREAM)
text(s, Inches(7.45), Inches(5.25), Inches(5), Inches(1.5),
     "Plataforma creativa lanzada en 2021 con la agencia Ogilvy. Defiende que el acento andaluz "
     "(y cualquier acento) es un tesoro y no algo que esconder. Desde entonces, casi todos sus "
     "anuncios parten de esta idea.", size=13, color=CREAM, spacing=1.15)

# =====================================================================
# 5 · FASE 1 · MEDIOS DE MASAS
# =====================================================================
s = base("02 · Fase 1 · Libro", "Los medios de comunicación de masas",
         f"Fuente: {LIBRO}, apartado 1.12, {PAGINAS}")
text(s, Inches(0.6), Inches(1.9), Inches(12.1), Inches(0.6),
     "Con nuestras palabras: un medio de masas es un canal que hace llegar el mismo mensaje a muchísimas "
     "personas a la vez, sin conocerlas una a una. La marca paga por un espacio (página, minutos, segundos) "
     "dentro de ese medio.", size=13, spacing=1.15)
media = [
    ("Prensa", "Diarios nacionales, regionales y locales.",
     ["Credibilidad y actualidad", "Muy segmentada por zona", "Vida corta (un día)", "Calidad de imagen baja"]),
    ("Revistas", "Publicaciones semanales o mensuales por temas.",
     ["Público por intereses", "Impresión de alta calidad", "Se leen varias veces", "Poca inmediatez"]),
    ("Radio", "Emisoras generalistas, musicales y locales.",
     ["Barata y muy rápida", "Acompaña (coche, trabajo)", "Mucha repetición", "Solo sonido, poca atención"]),
    ("Televisión", "Cadenas nacionales, autonómicas y de pago.",
     ["Imagen + sonido + movimiento", "Cobertura masiva", "Genera notoriedad", "Muy cara y saturada"]),
]
x = Inches(0.6)
for name, sub, pts in media:
    rect(s, x, Inches(2.75), Inches(2.9), Inches(4.0), SAND)
    rect(s, x, Inches(2.75), Inches(2.9), Inches(0.62), WINE)
    text(s, x + Inches(0.2), Inches(2.84), Inches(2.5), Inches(0.45), name, size=18, bold=True, font=SERIF, color=CREAM)
    text(s, x + Inches(0.2), Inches(3.5), Inches(2.55), Inches(0.6), sub, size=11, italic=True, color=MUTED)
    bullets(s, x + Inches(0.2), Inches(4.15), Inches(2.6), Inches(2.5),
            [[("+ " if i < 2 else "– ", {"bold": True, "color": GREEN if i < 2 else RED}), p] for i, p in enumerate(pts)],
            size=12, marker="", gap=6)
    x += Inches(3.08)

# =====================================================================
# 6 · FASE 1 · FORMAS PUBLICITARIAS
# =====================================================================
s = base("02 · Fase 1 · Libro", "Las formas publicitarias que usaremos para clasificar",
         "Cada medio tiene sus propios formatos. Estos son los que nos sirven para la Fase 3.")
rows = [
    ["Medio", "Forma publicitaria", "Cómo la reconocemos (rasgos)"],
    ["Televisión", "Spot", "Pieza audiovisual corta (20–60 s) emitida en los bloques de anuncios; cuenta una historia y cierra con la marca."],
    ["Televisión", "Patrocinio / product placement", "La marca aparece dentro de un programa o evento, no en el bloque de anuncios."],
    ["Radio", "Cuña y mención", "Cuña: anuncio grabado de 20–30 s. Mención: el locutor nombra la marca en directo."],
    ["Prensa y revistas", "Anuncio a página / faldón / encarte", "Espacio comprado en la publicación; se mide por tamaño y posición (portada, contraportada…)."],
    ["Prensa y revistas", "Publirreportaje", "Parece un artículo pero lo paga la marca; debe indicarse «publicidad»."],
    ["Exterior", "Valla, lona, mupi, marquesina", "Soporte fijo en la calle; mensaje muy breve y visual porque se ve de pasada."],
    ["Exterior / no convencional", "Street o guerrilla marketing", "Acción sorprendente en la calle, de bajo coste, pensada para que la gente la comparta."],
    ["Digital", "Vídeo online, post en redes, earned media", "Lo que la marca publica en sus redes y lo que medios y usuarios difunden gratis."],
]
table(s, Inches(0.6), Inches(1.95), Inches(12.13), rows,
      [Inches(2.2), Inches(3.1), Inches(6.83)], row_h=Inches(0.53), size=11.5)

# =====================================================================
# 7 · FASE 1 · ESQUEMA PROPIO
# =====================================================================
s = base("02 · Fase 1 · Libro", "Nuestro esquema: dónde se coloca cada anuncio",
         "Elaboración propia a partir del apartado 1.12")
# three columns: paid / owned / earned + convencional vs no
rect(s, Inches(0.6), Inches(1.95), Inches(5.9), Inches(4.85), WINE)
text(s, Inches(0.9), Inches(2.15), Inches(5.3), Inches(0.4), "MEDIOS CONVENCIONALES («above the line»)", size=12, bold=True, color=SAND)
text(s, Inches(0.9), Inches(2.6), Inches(5.3), Inches(0.9), "Prensa · Revistas · Radio · Televisión · Exterior",
     size=20, bold=True, font=SERIF, color=CREAM)
bullets(s, Inches(0.9), Inches(3.55), Inches(5.3), Inches(3.1), [
    "La marca compra espacio en un medio que no es suyo.",
    "Llegan a mucha gente a la vez → sirven para dar notoriedad.",
    "Comunicación en una sola dirección: el público solo recibe.",
    [("Ejemplo en Cruzcampo: ", {"bold": True, "color": SAND}), ("el spot «Lola» (TV, 2021).", {"color": CREAM})],
], size=13, color=CREAM)
rect(s, Inches(6.83), Inches(1.95), Inches(5.9), Inches(4.85), SAND)
text(s, Inches(7.13), Inches(2.15), Inches(5.3), Inches(0.4), "MEDIOS NO CONVENCIONALES («below the line»)", size=12, bold=True, color=RED)
text(s, Inches(7.13), Inches(2.6), Inches(5.3), Inches(0.9), "Guerrilla · Eventos · Patrocinio · Redes",
     size=20, bold=True, font=SERIF, color=WINE)
bullets(s, Inches(7.13), Inches(3.55), Inches(5.3), Inches(3.1), [
    "Acciones más directas, creativas y, a menudo, más baratas.",
    "Buscan que el público participe y lo comparta.",
    "Lo que la gente y los medios difunden gratis se llama earned media.",
    [("Ejemplo en Cruzcampo: ", {"bold": True, "color": RED}), "las lonas «Tú tan de Berlín» en balcones de Sevilla (2026)."],
], size=13)

# =====================================================================
# 8 · FASE 2 · MAPA DE MEDIOS
# =====================================================================
s = base("03 · Fase 2 · Investigación", "Mapa de medios: dónde aparece Cruzcampo",
         "Verde = lo hemos verificado con una fuente. Gris = no hemos encontrado pieza concreta.")
mp = [
    ("Televisión", True, "Spots «Lola» (2021), «Gitana» (2024) y «Libera lo que sientes» (2018)."),
    ("Exterior", True, "Lonas en balcones de Sevilla (2026); muñeca gigante en Callao, Madrid (2024); lona en la Plaza de la Hispanidad, Cádiz (2025)."),
    ("Redes sociales", True, "Respuesta «Tú tan de Berlín. Yo tan de Sevilla» (2026); difusión de sus spots."),
    ("Patrocinio y eventos", True, "Patrocinador del Carnaval de Cádiz: 1 km de mostradores (2023)."),
    ("Prensa", None, "Citada en la campaña «Libera lo que sientes» (2018), pero no hemos localizado el anuncio concreto."),
    ("Radio", None, "Citada en Carnaval 2015 y en «Libera lo que sientes», sin cuña concreta localizada."),
    ("Revistas", False, "No hemos encontrado anuncios recientes en revistas."),
]
y = Inches(1.95)
for name, ok, desc in mp:
    col = GREEN if ok else MUTED
    rect(s, Inches(0.6), y, Inches(12.13), Inches(0.62), SAND if ok else CREAM, line=None if ok else SAND)
    rect(s, Inches(0.6), y, Inches(0.12), Inches(0.62), col)
    text(s, Inches(0.95), y, Inches(2.5), Inches(0.62), name, size=15, bold=True, font=SERIF,
         color=WINE if ok else MUTED, anchor=MSO_ANCHOR.MIDDLE)
    tag = "VERIFICADO" if ok else ("CITADO, SIN PIEZA" if ok is None else "NO ENCONTRADO")
    text(s, Inches(3.3), y, Inches(1.8), Inches(0.62), tag, size=9.5, bold=True, color=col, anchor=MSO_ANCHOR.MIDDLE)
    text(s, Inches(5.1), y, Inches(7.5), Inches(0.62), desc, size=11.5, anchor=MSO_ANCHOR.MIDDLE)
    y += Inches(0.7)

# =====================================================================
# 9 · FASE 2 · EVIDENCIAS (medios de masas)
# =====================================================================
s = base("03 · Fase 2 · Investigación", "Evidencias en medios de masas: televisión")
ev = [
    ("«Lola»", "Enero 2021 · Ogilvy", "Recrea a Lola Flores con deepfake para defender el acento. Lanzado el 21 de enero, día en que habría cumplido 98 años.",
     "https://spainaudiovisualhub.digital.gob.es/en/panorama/publicidad/con-mucho-acento", "q_lola_hub", "Ficha (gob.es)"),
    ("«Gitana»", "Enero 2024 · Ogilvy", "Una muñeca flamenca cobra vida al ritmo de una bulería inédita de Camarón dedicada a la cerveza (grabada en 1989).",
     "https://ogilvy.com/es/ideas/cruzcampo-lanza-gitana-una-fabula-conmuchoacento", "q_gitana", "Nota de Ogilvy"),
    ("«Libera lo que sientes»", "Abril 2018 · Ogilvy & Mather", "Tres spots irónicos para lanzar Cruzcampo Especial. Campaña con TV, prensa, radio, exterior y redes.",
     "https://www.reasonwhy.es/actualidad/campanas/cruzcampo-presume-de-naturalidad-en-su-ultima-campana-2018-04-25", "q_libera", "Reason Why"),
]
x = Inches(0.6)
for t1, meta, desc, url, qn, cap in ev:
    rect(s, x, Inches(1.75), Inches(3.9), Inches(5.05), SAND)
    placeholder(s, x + Inches(0.2), Inches(1.95), Inches(3.5), Inches(1.75), f"Fotograma del spot {t1}")
    text(s, x + Inches(0.2), Inches(3.85), Inches(3.5), Inches(0.4), t1, size=17, bold=True, font=SERIF, color=WINE)
    text(s, x + Inches(0.2), Inches(4.25), Inches(3.5), Inches(0.3), meta, size=10.5, bold=True, color=RED)
    text(s, x + Inches(0.2), Inches(4.6), Inches(2.2), Inches(2.0), desc, size=10.5, spacing=1.1)
    qr(s, url, qn, x + Inches(2.55), Inches(4.75), size=Inches(1.05), caption=cap)
    x += Inches(4.115)

# =====================================================================
# 10 · FASE 2 · EVIDENCIAS (exterior, patrocinio, redes)
# =====================================================================
s = base("03 · Fase 2 · Investigación", "Evidencias fuera de los medios convencionales")
ev2 = [
    ("Lonas «Tú tan de Berlín»", "Mayo 2026 · Sevilla", "Respuesta a la lona de Estrella Galicia en Plaza de Cuba. Vecinos de Los Remedios cuelgan banderolas de Cruzcampo.",
     "https://www.reasonwhy.es/actualidad/estrella-galicia-lona-berlin-cruzcampo", "q_berlin_rw", "Reason Why"),
    ("Carnaval de Cádiz", "Patrocinio oficial", "Mostradores de barra por toda la ciudad (1 km en 2023) y una muestra con 15 años de campañas de Carnaval («Con C de Carnaval»).",
     "https://diariobahiadecadiz.com/cadiz/con-c-de-carnaval-muestra-retrospectiva-de-las-campanas-de-cruzcampo-en-los-carnavales-de-cadiz-en-la-casa-de-iberoamerica", "q_carnaval", "Diario Bahía de Cádiz"),
    ("Sociedad Latera", "Campaña de verano · Ogilvy", "Homenaje a los lateros reales de las playas andaluzas con ropa y carro diseñados por la marca.",
     "https://www.reasonwhy.es/actualidad/cruzcampo-homenaje-lateros-andaluces-campana-verano", "q_lateros", "Reason Why"),
]
x = Inches(0.6)
for t1, meta, desc, url, qn, cap in ev2:
    rect(s, x, Inches(1.75), Inches(3.9), Inches(5.05), SAND)
    placeholder(s, x + Inches(0.2), Inches(1.95), Inches(3.5), Inches(1.75), f"Imagen de {t1}")
    text(s, x + Inches(0.2), Inches(3.85), Inches(3.5), Inches(0.4), t1, size=17, bold=True, font=SERIF, color=WINE)
    text(s, x + Inches(0.2), Inches(4.25), Inches(3.5), Inches(0.3), meta, size=10.5, bold=True, color=RED)
    text(s, x + Inches(0.2), Inches(4.6), Inches(2.2), Inches(2.0), desc, size=10.5, spacing=1.1)
    qr(s, url, qn, x + Inches(2.55), Inches(4.75), size=Inches(1.05), caption=cap)
    x += Inches(4.115)

# =====================================================================
# 11 · FASE 2 · LO NO VERIFICADO + ELECCIÓN
# =====================================================================
s = base("03 · Fase 2 · Investigación", "Lo que no hemos podido verificar y nuestra elección")
card(s, Inches(0.6), Inches(1.75), Inches(5.9), Inches(5.05), "Cómo hemos buscado", [
    "Web y notas de prensa de Heineken, fichas de las agencias (Ogilvy, dentsu), prensa especializada (Reason Why) y prensa andaluza.",
    [("Prensa y radio: ", {"bold": True}), "varias fuentes dicen que «Libera lo que sientes» (2018) y el Carnaval 2015 usaron prensa y radio, pero no hemos encontrado ninguna página ni cuña concreta con fecha."],
    [("Revistas: ", {"bold": True}), "sin resultados recientes."],
    "Por eso no presentamos como reales anuncios de prensa o radio que no podemos enseñar.",
], size=12)
rect(s, Inches(6.83), Inches(1.75), Inches(5.9), Inches(5.05), RED)
text(s, Inches(7.13), Inches(1.95), Inches(5.3), Inches(0.4), "LOS DOS ANUNCIOS ELEGIDOS", size=12, bold=True, color=SAND)
text(s, Inches(7.13), Inches(2.4), Inches(5.3), Inches(0.5), "1 · Spot «Lola»", size=22, bold=True, font=SERIF, color=CREAM)
text(s, Inches(7.13), Inches(2.9), Inches(5.3), Inches(0.4), "Televisión · enero 2021 · medio de masas", size=12, color=SAND)
text(s, Inches(7.13), Inches(3.5), Inches(5.3), Inches(0.5), "2 · Lonas «Tú tan de Berlín»", size=22, bold=True, font=SERIF, color=CREAM)
text(s, Inches(7.13), Inches(4.0), Inches(5.3), Inches(0.4), "Exterior / guerrilla · mayo 2026 · Sevilla", size=12, color=SAND)
rect(s, Inches(7.13), Inches(4.6), Inches(1), Inches(0.04), GOLD)
text(s, Inches(7.13), Inches(4.8), Inches(5.3), Inches(1.9), [
    [("Por qué compararlos: ", {"bold": True, "color": SAND}),
     ("transmiten la misma idea («Con mucho acento») con dos formatos opuestos: una gran producción para toda España "
      "frente a una acción barata, rápida y local que se hizo viral.", {"color": CREAM})]],
    size=13.5, spacing=1.15)

# =====================================================================
# 12–13 · FASE 3 · ANUNCIO 1
# =====================================================================
s = base("04 · Fase 3 · Anuncio 1", "Spot «Lola» · Con mucho acento (2021)", "Ficha analítica")
placeholder(s, Inches(0.6), Inches(1.95), Inches(5.4), Inches(3.05),
            "Fotograma del spot «Lola» (Lola Flores sobre fondo negro)\nFuente: canal de YouTube de Cruzcampo\no Spain Audiovisual Hub (gob.es)")
qr(s, "https://spainaudiovisualhub.digital.gob.es/en/panorama/publicidad/con-mucho-acento", "q_lola_hub2",
   Inches(0.6), Inches(5.25), size=Inches(1.15), caption="Ficha del anuncio")
qr(s, "https://www.ogilvy.com/es/work/con-mucho-acento", "q_lola_ogilvy",
   Inches(2.25), Inches(5.25), size=Inches(1.15), caption="Caso de Ogilvy")
text(s, Inches(3.75), Inches(5.3), Inches(2.3), Inches(1.4), [
    [("Fecha: ", {"bold": True}), "21-01-2021"],
    [("Agencia: ", {"bold": True}), "Ogilvy"],
    [("Medios: ", {"bold": True}), "dentsu X"],
    [("Productora: ", {"bold": True}), "Primo"],
], size=11, spacing=1.2)
rows = [
    ["Campo", "Análisis"],
    ["Medio y soporte", "Televisión: emisión en cadenas nacionales en el bloque publicitario, más difusión en YouTube y redes de la marca."],
    ["Marca y producto", "Cruzcampo (Heineken España). Anuncia la marca en general, no un producto concreto: es una campaña de imagen."],
    ["Forma publicitaria", "Spot. Lo reconocemos porque es una pieza audiovisual cerrada, con historia propia, que se emite en el corte publicitario y termina con el logo y el claim."],
    ["Público objetivo", "Adultos de 25 a 55 años, sobre todo andaluces y del resto de España con raíces o cariño por el sur. Lola Flores atrae a quien la vio en vida (40+) y la tecnología deepfake atrae a jóvenes activos en redes."],
]
table(s, Inches(6.3), Inches(1.95), Inches(6.43), rows, [Inches(1.65), Inches(4.78)], row_h=Inches(0.95), size=11)

s = base("04 · Fase 3 · Anuncio 1", "Spot «Lola»: mensaje, recursos y elección del medio")
card(s, Inches(0.6), Inches(1.75), Inches(5.9), Inches(2.45), "Qué comunica", [
    [("Mensaje: ", {"bold": True}), "«el acento es tu tesoro»: hay que sentirse orgulloso de las raíces y no esconder el acento."],
    [("Tono: ", {"bold": True}), "emocional, nostálgico y reivindicativo."],
    [("Llamada a la acción: ", {"bold": True}), "implícita: identificarse con la marca y compartir el orgullo (#ConMuchoAcento)."],
], size=12)
card(s, Inches(0.6), Inches(4.35), Inches(5.9), Inches(2.45), "Recursos que destacan", [
    "Lola Flores recreada con deepfake: más de 5.000 imágenes y 3 días de rodaje en Málaga.",
    "Su voz, sus gestos y el fondo negro convierten el spot en un acontecimiento.",
    "La familia (Lolita y Rosario) participó, lo que le da autenticidad.",
], size=12)
rect(s, Inches(6.83), Inches(1.75), Inches(5.9), Inches(5.05), WINE)
text(s, Inches(7.13), Inches(1.95), Inches(5.3), Inches(0.4), "¿POR QUÉ TELEVISIÓN Y SPOT?", size=12, bold=True, color=SAND)
bullets(s, Inches(7.13), Inches(2.4), Inches(5.3), Inches(3.0), [
    [("Objetivo: ", {"bold": True, "color": SAND}), ("lanzar una plataforma nueva y llegar a toda España, no solo a Andalucía. La TV da cobertura masiva.", {"color": CREAM})],
    [("Formato: ", {"bold": True, "color": SAND}), ("el mensaje depende de ver y oír a Lola Flores. Solo el audiovisual permite ese impacto (la radio o la prensa no podrían).", {"color": CREAM})],
    [("Público: ", {"bold": True, "color": SAND}), ("los adultos de 25 a 55 años siguen viendo TV, y el spot se pensó para saltar a redes.", {"color": CREAM})],
], size=12.5, color=CREAM)
rect(s, Inches(7.13), Inches(5.45), Inches(5.3), Inches(1.15), RED)
text(s, Inches(7.33), Inches(5.53), Inches(5), Inches(1.0), [
    [("614 millones", {"bold": True, "size": 22, "font": SERIF, "color": CREAM})],
    [("de visualizaciones y Gran Premio a la Eficacia 2021 (Noticias de Navarra / Reason Why).", {"color": SAND, "size": 11})],
], spacing=1.05)

# =====================================================================
# 14–15 · FASE 3 · ANUNCIO 2
# =====================================================================
s = base("04 · Fase 3 · Anuncio 2", "Lonas «Tú tan de Berlín» (2026)", "Ficha analítica")
placeholder(s, Inches(0.6), Inches(1.95), Inches(5.4), Inches(3.05),
            "Foto de los balcones de Los Remedios con las lonas\nde Cruzcampo junto a la lona de Estrella Galicia\nFuente: Reason Why / elEconomista (mayo 2026)")
qr(s, "https://www.reasonwhy.es/actualidad/estrella-galicia-lona-berlin-cruzcampo", "q_berlin_rw2",
   Inches(0.6), Inches(5.25), size=Inches(1.15), caption="Reason Why")
qr(s, "https://www.youtube.com/shorts/7k8J6qodOzA", "q_berlin_yt",
   Inches(2.25), Inches(5.25), size=Inches(1.15), caption="Vídeo (YouTube)")
text(s, Inches(3.75), Inches(5.3), Inches(2.3), Inches(1.4), [
    [("Fecha: ", {"bold": True}), "4–6 mayo 2026"],
    [("Lugar: ", {"bold": True}), "Plaza de Cuba y Los Remedios, Sevilla"],
], size=11, spacing=1.2)
rows = [
    ["Campo", "Análisis"],
    ["Medio y soporte", "Exterior: lonas y banderolas colgadas en balcones de viviendas de Los Remedios, junto a la lona de Estrella Galicia en Plaza de Cuba. Se amplificó en redes y en prensa."],
    ["Marca y producto", "Cruzcampo, de nuevo como marca («Con mucho acento»), no un producto concreto."],
    ["Forma publicitaria", "Publicidad exterior con lona, usada como guerrilla marketing: responde en el mismo lugar a un competidor, con humor, poco coste y participación de los vecinos."],
    ["Público objetivo", "Sevillanos y andaluces de 20 a 45 años, activos en redes y con sentimiento de barrio. Lo deducimos del humor local y de que la acción buscaba ser fotografiada y compartida."],
]
table(s, Inches(6.3), Inches(1.95), Inches(6.43), rows, [Inches(1.65), Inches(4.78)], row_h=Inches(0.95), size=11)

s = base("04 · Fase 3 · Anuncio 2", "Lonas «Tú tan de Berlín»: mensaje, recursos y elección del medio")
card(s, Inches(0.6), Inches(1.75), Inches(5.9), Inches(2.45), "Qué comunica", [
    [("Mensaje: ", {"bold": True}), "«Tú tan de Berlín. Yo tan de Sevilla»: Sevilla es de Cruzcampo, y la marca no deja que otra «ocupe» su casa."],
    [("Tono: ", {"bold": True}), "humor, pique sano y orgullo de barrio."],
    [("Llamada a la acción: ", {"bold": True}), "fotografiar, compartir y ponerse del lado de «la de aquí»."],
], size=12)
card(s, Inches(0.6), Inches(4.35), Inches(5.9), Inches(2.45), "Recursos que destacan", [
    "Imita el juego de palabras del rival y le da la vuelta («Tú tan de Berlín, yo tan de los Remedios»).",
    "Los vecinos actúan como soporte: la marca les da las lonas y ellos las cuelgan.",
    "Reacción en menos de 48 h: la rapidez forma parte del mensaje.",
], size=12)
rect(s, Inches(6.83), Inches(1.75), Inches(5.9), Inches(5.05), WINE)
text(s, Inches(7.13), Inches(1.95), Inches(5.3), Inches(0.4), "¿POR QUÉ EXTERIOR Y GUERRILLA?", size=12, bold=True, color=SAND)
bullets(s, Inches(7.13), Inches(2.4), Inches(5.3), Inches(3.0), [
    [("Objetivo: ", {"bold": True, "color": SAND}), ("defender su territorio frente a Estrella Galicia justo donde atacó, sin dar tiempo a que se olvide.", {"color": CREAM})],
    [("Formato: ", {"bold": True, "color": SAND}), ("una lona se monta en horas y cuesta muy poco; un spot de TV tarda semanas.", {"color": CREAM})],
    [("Público: ", {"bold": True, "color": SAND}), ("el público joven y local lo fotografía y lo sube a redes, y así la acción llega a toda España gratis (earned media).", {"color": CREAM})],
], size=12.5, color=CREAM)
rect(s, Inches(7.13), Inches(5.45), Inches(5.3), Inches(1.15), RED)
text(s, Inches(7.33), Inches(5.53), Inches(5), Inches(1.0), [
    [("Viral en 48 h", {"bold": True, "size": 22, "font": SERIF, "color": CREAM})],
    [("Recogido por elEconomista, Reason Why, La Voz del Sur o Retail Actual. No hay cifras oficiales de alcance.", {"color": SAND, "size": 11})],
], spacing=1.05)

# =====================================================================
# 16 · COMPARACIÓN
# =====================================================================
s = base("05 · Conclusiones", "Comparación de los dos anuncios")
rows = [
    ["Criterio", "Spot «Lola» · Televisión", "Lonas «Berlín» · Exterior / guerrilla"],
    ["Eficacia", "Muy alta y medida: Gran Premio a la Eficacia 2021 y Gran Premio Film en El Sol.", "Alta en conversación, pero sin datos oficiales. Su éxito se mide por la cobertura en prensa y redes."],
    ["Coste", "Muy alto: producción con deepfake, tres días de rodaje, más la compra de espacios en TV.", "Muy bajo: unas lonas impresas y la colaboración de los vecinos."],
    ["Alcance", "Nacional y masivo: 614 millones de visualizaciones (TV + digital + medios).", "Físicamente local (un barrio), pero las redes y la prensa lo llevaron a toda España."],
    ["Interactividad", "Baja: el público mira; la conversación llega después en redes.", "Alta: los vecinos participan y la gente fotografía y comparte."],
    ["Público", "Amplio, de 25 a 55 años, en toda España.", "Más joven (20–45) y local, muy activo en redes."],
    ["Rapidez", "Meses de preparación.", "Respuesta en menos de 48 horas."],
]
table(s, Inches(0.6), Inches(1.75), Inches(12.13), rows,
      [Inches(1.9), Inches(5.115), Inches(5.115)], row_h=Inches(0.7), size=11.5)

# =====================================================================
# 17 · RECOMENDACIÓN
# =====================================================================
s = base("05 · Conclusiones", "Nuestra recomendación para Cruzcampo")
rect(s, Inches(0.6), Inches(1.75), Inches(12.13), Inches(1.55), RED)
text(s, Inches(0.95), Inches(1.9), Inches(11.5), Inches(0.35), "MEDIO PRIORITARIO", size=12, bold=True, color=SAND)
text(s, Inches(0.95), Inches(2.25), Inches(11.5), Inches(0.95),
     "Televisión (spot) como eje de cada gran campaña, amplificada en vídeo online y redes, "
     "y apoyada con acciones de exterior y guerrilla en Andalucía.",
     size=19, bold=True, font=SERIF, color=CREAM, spacing=1.1)
card(s, Inches(0.6), Inches(3.5), Inches(3.9), Inches(3.3), "1 · Por qué TV", [
    "Es el único caso con eficacia demostrada con premios y cifras.",
    "La marca necesita llegar a toda España y al Reino Unido, no solo a Andalucía.",
    "Su plataforma se basa en emoción, música y voz, que piden imagen y sonido.",
], size=11.5)
card(s, Inches(4.72), Inches(3.5), Inches(3.9), Inches(3.3), "2 · Por qué no solo TV", [
    "Es muy cara y el público joven ve menos televisión.",
    "Las acciones de guerrilla dan cercanía y conversación a muy bajo coste.",
    "Funcionan mejor en su territorio: Sevilla, Cádiz, Carnaval, Feria…",
], size=11.5)
card(s, Inches(8.84), Inches(3.5), Inches(3.89), Inches(3.3), "3 · Cómo combinarlo", [
    "Un gran spot al año (como «Lola» o «Gitana»).",
    "Acciones exteriores rápidas para responder a la competencia y a la actualidad.",
    "Todo bajo «Con mucho acento», respetando las normas de publicidad del alcohol.",
], size=11.5)

# =====================================================================
# 18–19 · FUENTES
# =====================================================================
src1 = [
    ("Libro / material curricular", [f"{LIBRO}. Apartado 1.12, {PAGINAS}."]),
    ("Identidad y empresa", [
        "Alimarket. «Cruzcampo recupera su imagen original». alimarket.es/alimentacion/noticia/251785",
        "Forbes España. «De Andalucía al mundo entero». forbes.es/empresas/53420/de-andalucia-al-mundo-entero",
        "Universidad Pablo de Olavide, Patio Colorado. «Somos de Cruzcampo». upo.es/patio-colorado/?p=990",
        "World Brand Design. Rediseño de Cruzcampo por Bulletproof. worldbranddesign.com/?p=51681",
        "Bolsamanía (2024). Cruzcampo alcanza casi 10.000 bares y pubs en Reino Unido. bolsamania.com",
        "Que.es (28-05-2021). La vieja planta de Cruzcampo renace como centro de cultura cervecera. que.es",
    ]),
    ("Anuncio 1 · «Lola» (TV, 2021)", [
        "Ogilvy. «Con mucho acento». ogilvy.com/es/work/con-mucho-acento",
        "Spain Audiovisual Hub (Gobierno de España). spainaudiovisualhub.digital.gob.es/en/panorama/publicidad/con-mucho-acento",
        "Reason Why. «Cruzcampo trae de vuelta a Lola Flores…». reasonwhy.es/actualidad/cruzcampo-campana-lola-flores-reivindicar-diversidad",
        "Reason Why. Gran Premio Film El Sol 2021. reasonwhy.es/actualidad/lola-flores-cruzcampo-gran-premio-film-el-sol-2021",
        "Noticias de Navarra (04-11-2021). Anuncio premiado, visto 614 millones de veces. noticiasdenavarra.com",
        "¡Hola! (22-01-2021). Lolita Flores habla tras el «regreso» de su madre. hola.com",
    ]),
]
src2 = [
    ("Anuncio 2 · Lonas «Tú tan de Berlín» (exterior, 2026)", [
        "Reason Why. «Estrella Galicia lleva su arte de la distracción a Sevilla…». reasonwhy.es/actualidad/estrella-galicia-lona-berlin-cruzcampo",
        "elEconomista (05-2026). «Berlín y Sevilla: … una batalla de ingenio entre cerveceras». eleconomista.es/actualidad/noticias/13909388",
        "Retail Actual (04-05-2026). retailactual.com/noticias/20260504/…",
        "La Voz del Sur. «El pique viral de Estrella Galicia y Cruzcampo en Sevilla». lavozdelsur.es",
        "Esdiario (06-05-2026) y El Pespunte (06-05-2026). Cobertura de la acción.",
        "Vídeo: youtube.com/shorts/7k8J6qodOzA",
    ]),
    ("Otras evidencias (Fase 2)", [
        "Ogilvy. «Cruzcampo lanza Gitana…» (2024). ogilvy.com/es/ideas/cruzcampo-lanza-gitana-una-fabula-conmuchoacento",
        "Epica / AdForum. Ficha de «Gitana». epica.adforum.com/agency/10323/creative-work/34690831",
        "Reason Why (25-04-2018). «Libera lo que sientes». reasonwhy.es/actualidad/campanas/…-2018-04-25",
        "Reason Why. Campaña de verano de los lateros. reasonwhy.es/actualidad/cruzcampo-homenaje-lateros-andaluces-campana-verano",
        "Reason Why. Ediciones limitadas «Con mucho acento». reasonwhy.es/actualidad/campana-cruzcampo-reivindica-cervezas-con-mucho-acento",
        "Diario Bahía de Cádiz. Muestra «Con C de Carnaval». diariobahiadecadiz.com",
        "Yumda. «Un kilómetro de mostradores de Cruzcampo para el Carnaval de Cádiz». yumda.com",
    ]),
    ("Créditos visuales", [
        "Logotipo e imágenes de anuncios: © Cruzcampo / Heineken España. Uso exclusivamente educativo.",
        "Fotografías de la acción de 2026: indicar el medio del que se toma cada imagen.",
        "Paleta y diseño del dossier: elaboración propia inspirada en la identidad de Cruzcampo.",
    ]),
]
for title, groups in (("Fuentes · Bibliografía y webgrafía (1/2)", src1), ("Fuentes · Bibliografía y webgrafía (2/2)", src2)):
    s = base("06 · Fuentes", title)
    y = Inches(1.65)
    for head, lst in groups:
        text(s, Inches(0.6), y, Inches(12), Inches(0.3), head, size=13, bold=True, color=RED, font=SERIF)
        y += Inches(0.34)
        bullets(s, Inches(0.6), y, Inches(12.13), Inches(0.21) * len(lst), lst, size=10.5, gap=1, marker="•")
        y += Inches(0.215) * len(lst) + Inches(0.2)
    if title.endswith("(2/2)"):
        text(s, Inches(0.6), Inches(6.62), Inches(12), Inches(0.3),
             "Todas las fuentes consultadas en octubre de 2026.", size=10, italic=True, color=MUTED)

# =====================================================================
# 20 · CIERRE
# =====================================================================
s = prs.slides.add_slide(BLANK)
page_no[0] += 1
rgb_fill_bg(s, RED)
placeholder(s, Inches(5.17), Inches(1.2), Inches(3.0), Inches(2.3), "Logotipo de Cruzcampo", dark=True)
text(s, Inches(1), Inches(3.9), Inches(11.33), Inches(1.0), "Gracias", size=60, bold=True, font=SERIF,
     color=CREAM, align=PP_ALIGN.CENTER)
text(s, Inches(1), Inches(5.0), Inches(11.33), Inches(0.6), "«El acento es tu tesoro»",
     size=22, italic=True, font=SERIF, color=SAND, align=PP_ALIGN.CENTER)
text(s, Inches(1), Inches(6.3), Inches(11.33), Inches(0.4), f"{INTEGRANTES} · {CURSO}",
     size=13, color=SAND, align=PP_ALIGN.CENTER)

out = os.path.join(HERE, "Dossier_Cruzcampo.pptx")
prs.save(out)
print("OK", out, len(prs.slides._sldIdLst), "diapositivas")
