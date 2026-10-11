---
name: elegir-skill
description: Enrutador de skills de Antonio. Úsala al empezar cualquier petición de diseño, web, portfolio, animación, marca, contenido o documentos, y siempre que el usuario pregunte "qué skill uso", "qué skill es mejor para esto" o describa lo que quiere sin nombrar una skill. Analiza la petición y elige la skill (o combinación) más adecuada antes de trabajar.
---

# Elegir skill

Antonio describe lo que quiere; tú decides qué skill(s) usar, lo dices en una línea y continúas.

## Cómo responder
1. Resume la petición en una frase (qué quiere y sobre qué).
2. Elige **una skill principal** y, como mucho, **una o dos de apoyo**, con la tabla de abajo.
3. Dilo en una línea, en español: `Skill: <principal> (+ <apoyo>) · Por qué: <motivo breve>`.
4. Si alguna skill cuesta dinero o hace cambios grandes, **pregunta antes** de seguir. Si no, cárgala y haz el trabajo.
5. Si la skill elegida no está instalada en este entorno, dilo y usa la mejor alternativa disponible.

## Reglas fijas
- Cualquier cosa para la marca personal o el portfolio de Antonio → añade siempre **marca-personal** (colores, tipografía, tono).
- Para una empresa cliente con su propia skill de marca → usa esa skill de marca en lugar de marca-personal.
- No mezcles skills que hacen lo mismo: elige una de diseño general (impeccable **o** design-taste-frontend), no las dos.
- Peticiones pequeñas y obvias (cambiar un texto, añadir un proyecto a `proyectos.js`) → ninguna skill; hazlo directamente.

## Tabla de decisión

### Diseño web
| Lo que pide | Principal | Apoyo |
|---|---|---|
| Web, landing o portfolio **nuevo** / rediseño completo que no parezca hecho con IA | design-taste-frontend | marca-personal |
| Revisar, auditar o criticar un diseño existente | impeccable (`audit` / `critique`) | — |
| Pulir detalles: tipografía, color, espaciado, jerarquía | impeccable (`polish`, `typeset`, `colorize`, `layout`) | marca-personal |
| Diseño demasiado soso → más impacto / demasiado cargado → más calmado | impeccable (`bolder` / `quieter`) | — |
| Que la web "se sienta bien": microinteracciones, sensación premium | emil-design-eng | animate |
| Que funcione y se sienta nativa en el móvil | mobile-native | — |
| Probar la web con datos extremos (textos largos, vacíos…) | break-ui | — |
| Ver varias versiones de un componente y elegir | prototype | — |

### Animación
| Lo que pide | Principal | Apoyo |
|---|---|---|
| Crear una animación concreta | animate | emil-design-eng |
| Animación con intención emocional, coreografía de varios elementos, principios Disney | motion-design | animate |
| ¿Qué se podría animar aquí? | find-animation-opportunities | — |
| Revisar animaciones existentes | review-animations | — |
| Plan de mejora de todas las animaciones | improve-animations | — |
| La animación va a tirones / lenta | animation-performance | — |
| Gestos, arrastrar, muelles, estilo Apple | apple-design | animate |
| "¿Cómo se llama el efecto que…?" | animation-vocabulary | — |
| Landing 3D cinematográfica que se recorre con el scroll | scroll-world ⚠️ **cuesta dinero** (Higgsfield + Monid): confirmar antes | marca-personal |

### Contenido, documentos y datos
| Lo que pide | Principal |
|---|---|
| Identidad de marca de Antonio (colores, tono, público) | marca-personal |
| Documento, informe, propuesta, CV para compartir | docs |
| Archivo Word (.docx) | docx |
| PDF | pdf |
| Presentación PowerPoint (.pptx) | pptx |
| Hoja de cálculo (.xlsx / .csv) | xlsx |
| Archivo de Google Docs / Sheets / Slides | google-workspace |
| Gráfico, dashboard o visualización de datos | dataviz |
| Investigar un tema con varias fuentes e informe | deep-research |
| Crear o mejorar una skill | skill-creator |
| Que un texto (post, copy, CV, email) no suene a IA | humanizer (+ marca-personal si es para Antonio) |

### Forma de trabajar
| Lo que pide | Principal |
|---|---|
| Respuestas ultracortas, "modo cavernícola", ahorrar tokens | caveman (solo si lo pide; se quita con "stop caveman" o "normal mode") |
| Que Claude recuerde errores y aprendizajes de este repo entre sesiones | napkin |

### Código y repositorio
| Lo que pide | Principal |
|---|---|
| Revisar cambios en busca de errores | code-review |
| Limpiar / simplificar código | simplify |
| Revisión de seguridad | security-review |
| Ver la web funcionando / hacer captura | run |
| Hooks, permisos o configuración de Claude Code | update-config |

## Ejemplos
- "Quiero que mi portfolio parezca más profesional y menos plantilla" → `Skill: design-taste-frontend (+ marca-personal) · Por qué: rediseño completo anti-plantilla con mi identidad.`
- "Mira si los colores y la letra de la web están bien" → `Skill: impeccable (audit) (+ marca-personal) · Por qué: revisión de diseño existente.`
- "Que los botones se sientan mejor al pulsar" → `Skill: emil-design-eng · Por qué: microinteracciones.`
- "Hazme una web 3D tipo vuelo para una cafetería" → `Skill: scroll-world · Por qué: landing cinematográfica con scroll. ⚠️ Genera vídeos de pago, ¿seguimos?`
- "Cambia mi frase de presentación" → `Sin skill · Por qué: cambio directo en proyectos.js.`
