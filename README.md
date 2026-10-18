# Portfolio · Antonio José Martín

Portfolio de marketing digital y publicidad. Web estática publicada con GitHub Pages.

## Estructura
El repositorio tiene tres partes, todas desde la raíz:

```
── 1. DISEÑO DEL PORTFOLIO (la web) ──────────────────────────
index.html          → diseño de la web (no hace falta tocarlo)
proyectos.js        → TUS DATOS Y TRABAJOS (lo único que editas)
cv.pdf              → tu CV
img/                → foto de perfil e imágenes generales de la web

── 2. TRABAJOS ───────────────────────────────────────────────
trabajos/
  hemkansla/        → landing Family Club (portada.jpg + archivos)
  halloween/        → newsletter de Halloween (email.html + imágenes y GIFs)
  cruzcampo/        → dossier de marca (aún no publicado en la web)
  <nuevo-trabajo>/  → una carpeta por trabajo, con todo lo que necesita dentro

── 3. INFORMACIÓN (no se publica en la web) ──────────────────
_info/              → textos, datos del CV, cifras, notas y pendientes
```

### Reglas de orden
- **En la raíz solo va el diseño de la web**: `index.html`, `proyectos.js`, `cv.pdf`, `img/` y este README. Todo lo demás, en su carpeta.
- **Un trabajo = una carpeta** en `trabajos/`, nombre corto en minúsculas y sin espacios.
- Dentro siempre: `portada.jpg` (la imagen de la tarjeta) y **todo lo que el trabajo necesita para funcionar** (HTML, imágenes, GIFs, PDF, código). Los enlaces dentro del trabajo, relativos a su propia carpeta (`src="imagen.png"`, no rutas a otras carpetas).
- **`_info/` no aparece en la web** (GitHub Pages ignora las carpetas que empiezan por `_`), pero el repositorio es público: nada privado ahí.
- Nada de ramas sueltas: cuando un trabajo esté listo, se fusiona en `main` y se borra la rama.
- Las skills y herramientas de Claude no van en este repositorio.

## Publicarlo en GitHub Pages (una sola vez, ~10 min)
1. Crea una cuenta en github.com con un usuario profesional (p. ej. `antoniomartin-mkt`).
2. Crea un repositorio nuevo llamado **`tu-usuario.github.io`** (exactamente así) y márcalo como *Public*.
3. Pulsa **Add file → Upload files** y arrastra `index.html`, `proyectos.js`, `README.md` y `cv.pdf`. Pulsa **Commit changes**.
4. Ve a **Settings → Pages** → *Source: Deploy from a branch* → rama `main`, carpeta `/ (root)` → **Save**.
5. En 1–2 minutos tu portfolio estará en `https://tu-usuario.github.io`.

## Añadir un trabajo nuevo (2 minutos, desde el navegador)
1. Crea la carpeta del trabajo: **Add file → Upload files** y escribe `trabajos/nombre-corto/` delante del archivo. Sube ahí la portada como `portada.jpg` y el resto de archivos.
2. Abre `proyectos.js` → icono del lápiz ✏️.
3. Copia un bloque `{ ... },` de un proyecto, pégalo justo debajo de `const PROYECTOS = [` y cambia los textos.
4. **Commit changes**. La web se actualiza sola en un minuto.

## Fórmula para escribir cada proyecto (lo que mira un reclutador)
- **Reto:** qué encargo o problema había (1 frase).
- **Lo que hice:** decisiones concretas tuyas, no la lista de tareas.
- **Resultado:** un número siempre que se pueda (aperturas, clics, alcance, nota, tiempo ahorrado). Si no hay dato, qué aprendiste.
- `colores`: 1 a 3 colores "#RRGGBB" para la portada del trabajo; vacío `[]` usa el color de su categoría.
- Marca `destacado: true` solo en tus 1–2 mejores trabajos: salen arriba y más grandes.
- `corto`: nombre corto que sale en la barra de proyectos y en la portada.
- `objeto` (opcional): un PNG sin fondo del trabajo; flota en 3D en la portada. `extras`: hasta 4 PNG más que flotan desenfocados detrás.
- `vista`: cómo se ve el trabajo dentro de su ventana, con scroll, sin salir del portfolio: `"web"`, `"email"` (ventana estrecha) o `"documento"` (PDF). Si no lo pones, se deduce del `enlace`.

## Trabajos de Canva
En Canva: **Compartir → Más → Insertar / Enlace público de solo lectura**. Pega ese enlace en `enlace` y exporta una portada PNG para `imagen`.
