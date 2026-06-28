# Spec: Vocabulario consultado del Kobo + fix plural "Books"

## Objetivo

1. **Feature principal:** Añadir una página web que liste las palabras consultadas en el diccionario desde los libros (tabla `WordList` de `KoboReader.sqlite`), con buscador en cliente. Las definiciones quedan aplazadas hasta encontrar una fuente fiable para español.
2. **Fix menor:** Corregir el plural "Book s" en el listado de autores (`src/pages/[dbName]/index.astro:36-39`).

## Contexto

- La tabla `WordList` almacena palabras consultadas: `Text`, `VolumeId`, `DictSuffix` (locale, p.ej. `-es`), `DateCreated`. **No guarda definiciones** — el diccionario instalado en el Kobo no se exporta.
- Las definiciones están **aplazadas** (pendiente de encontrar una fuente fiable para palabras en español; la Free Dictionary API no tiene cobertura real de español y el Wikcionario español requiere parseo complejo).
- Restricciones del proyecto: SSR-only (sin prerender), Bun + bun:sqlite, SQLite readonly, sin dependencias nuevas (vanilla CSS, sin frameworks), compatible ARM64/Raspberry Pi.

## Datos — `src/db.ts`

Nueva interface y función, mismo patrón sync/readonly/try-finally que el resto:

```typescript
export interface VocabWord {
  Text: string;
  BookTitle: string | null;
  Author: string | null;
  DictSuffix: string | null;
  DateCreated: string;
}

export function getVocab(dbName: string): VocabWord[]
```

**Query:**
```sql
SELECT w.Text, w.DictSuffix, w.DateCreated,
       c.BookTitle, m.Attribution AS AuthorName
FROM WordList w
LEFT JOIN content c ON w.VolumeId = c.ContentID AND c.ContentType = '6'
LEFT JOIN content m ON c.BookID = m.ContentID AND m.ContentType = '6'
ORDER BY w.DateCreated DESC
```

**Row mapping** a `VocabWord` (null → "Unknown book" / "Unknown author" en la vista, no en la capa de datos; la capa devuelve null y la vista decide).

## Ruta/Página — `src/pages/[dbName]/vocab.astro`

- Frontmatter: valida `dbName` contra `getDatabases()` → redirect `/` si inválido (igual que `[dbName]/index.astro`).
- Llama `getVocab(dbName)`.
- Usa `Layout` con `slot="back-button"` → `/${dbName}/` y `slot="header-title"` "Vocabulary".
- Cabecera: `<h1>Vocabulary</h1>` + contador (ej. "11 palabras consultadas").
- Buscador de texto: `<input id="vocab-search">` que filtra `.vocab-item` por `data-word` (case-insensitive) con script `is:inline`, sin recarga.
- Lista de `.vocab-item` (ordenada por fecha desc, ya viene así de la query):
  - `<h2>{entry.Text}</h2>`
  - Fecha formateada `DD/MM/YYYY` (parse de ISO → formato legible en JS del frontmatter).
  - Libro + autor (o "Unknown book" si null) en `--text-secondary`.
- Estado vacío: `<p>No words have been looked up in this backup.</p>`.

## Script de cliente (`is:inline` en `vocab.astro`)

- Un único listener `input` en `#vocab-search` que filtra `.vocab-item[data-word]` por substring case-insensitive, ocultando/mostrando items sin recarga.

## Navegación

En `src/pages/[dbName]/index.astro`, junto al `<a class="stats-btn">` actual, añadir:
```astro
<a href={`/${dbName}/vocab`} class="stats-btn">
  <span>📚</span> Vocabulary
</a>
```
(Sin tocar el botón de Stats existente.)

## Fix "Book s"

En `src/pages/[dbName]/index.astro:36-39`, reemplazar:
```astro
{author.bookCount} Book
{author.bookCount !== 1 ? "s" : ""}
```
por una sola expresión template literal:
```astro
{`${author.bookCount} Book${author.bookCount !== 1 ? "s" : ""}`}
```

## Estilos (scoped en `vocab.astro`)

- Reutiliza variables del tema: `--card-bg`, `--border-color`, `--accent`, `--text-primary/secondary`.
- `.vocab-item`: tarjeta con borde, padding `1rem`, separación vertical `0.5rem` (mismo look que `.card` del index de autores).
- Buscador: input full-width con estilo consistente (borde `--border-color`, radio `8px`, padding).
- Responsive: breakpoints 600/480px (lista en una sola columna en móvil).

## Casos límite / manejo de errores

| Caso | Comportamiento |
|---|---|
| `WordList` vacía | Estado vacío amigable |
| `VolumeId` no resuelve a content | "Unknown book" / "Unknown author" |

## Fuera de alcance (YAGNI)

- Sin definiciones (aplazado hasta encontrar fuente fiable para español).
- Sin persistir definiciones en disco/SQLite (no se toca el backup sagrado).
- Sin ruta de detalle por palabra.
- Sin paginación (listado personal pequeño).
- Sin integración en la vista de libro.

## Verificación

Sin test runner: verificación manual.
1. `bun --bun dev` → navegar a `/20260620-Kobo-Backup/vocab`.
   - Listado de 11 palabras, ordenadas por fecha desc, libro "Palabras Radiantes — Brandon Sanderson" en todas.
   - Buscar "so" → filtra solaz, sotavento, socaire (case-insensitive en substring).
   - Sin botón de definición.
2. `bun run build` → sin errores TS.
3. `/20260620-Kobo-Backup/` → botón "Vocabulary" visible y lleva a la nueva página.
4. Un autor con 3 libros → muestra "3 Books" (sin espacio antes de la `s`); un autor con 1 libro → "1 Book".
