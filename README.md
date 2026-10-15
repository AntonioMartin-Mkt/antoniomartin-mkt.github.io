# Portfolio · Antonio José Martín

Portfolio de marketing digital y publicidad. Web estática publicada con GitHub Pages.

## Estructura
```
index.html          → diseño de la web (no hace falta tocarlo)
proyectos.js        → TUS DATOS Y TRABAJOS (lo único que editas)
cv.pdf              → tu CV
img/                → foto de perfil e imágenes generales de la web
trabajos/
  hemkansla/        → landing Family Club (portada.jpg + archivos)
  cruzcampo/        → dossier de marca (en curso, aún no publicado en la web)
  <nuevo-trabajo>/  → una carpeta por trabajo, con portada.jpg dentro
assets/halloween/   → newsletter de Halloween (se mueve a trabajos/ cuando
                      termine la campaña, para no romper las imágenes del email)
```

### Reglas de orden
- **Un trabajo = una carpeta** en `trabajos/`, nombre corto en minúsculas y sin espacios.
- Dentro siempre: `portada.jpg` (la imagen de la tarjeta) y los archivos del trabajo.
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

## Trabajos de Canva
En Canva: **Compartir → Más → Insertar / Enlace público de solo lectura**. Pega ese enlace en `enlace` y exporta una portada PNG para `imagen`.
