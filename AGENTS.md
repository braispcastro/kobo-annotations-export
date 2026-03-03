# AGENTS.md - Kobo Annotations Export

This is a personal reading analytics tool that exports annotations from Kobo e-readers into a browsable web interface.

## Project Overview

- **Framework:** Astro 5 in SSR-only mode (server-side rendering, never static)
- **Runtime:** Bun (not Node.js) — bun:sqlite native module is used for database access
- **Database:** SQLite read-only from `data/<backupName>/KoboReader.sqlite`
- **Styling:** Vanilla CSS only; light/dark theme via CSS custom properties
- **Deployment:** Docker (Alpine) on Raspberry Pi (ARM-based)
- **No testing framework, no linter, no formatter configured**

---

## Build & Run Commands

```bash
bun run dev      # Start dev server with HMR
bun run build    # Build for production → dist/
bun run preview  # Preview production build locally
```

**CRITICAL:** Always run with the `--bun` flag at dev time:
```bash
bun --bun dev    # Ensures bun:sqlite native module is used
```

Without `--bun`, the SQLite driver fails silently or falls back to Node, causing runtime errors.

**Note:** There is no test runner configured. Testing must be manual via `bun run dev`.

---

## Runtime & Environment

- **Bun is mandatory** — Not compatible with Node.js due to bun:sqlite
- **bun:sqlite** — Native Bun SQLite module used directly in `src/db.ts`; always open connections as `readonly: true`
- **data/ directory**
  - GITIGNORED — contains real user Kobo backups with personal annotations
  - Expected structure: `data/<backupName>/KoboReader.sqlite` and `data/<backupName>/markups/`
  - **Never create, modify, or query this directory programmatically** — it is sacred user data
  - At runtime, app scans `data/` for valid backup folders via `getDatabases()`

---

## Architecture & Constraints

- **SSR-only:** All pages are server-rendered. `output: 'server'` in astro.config.mjs is intentional
  - **NEVER add `export const prerender = true`** — app reads SQLite at request time
  - Static generation would break all functionality
- **Minimal dependencies:** Only Astro and @astrojs/node (2 total)
  - **Do not add component libraries, Tailwind, CSS-in-JS, ORMs, or other frameworks without explicit justification**
  - Project is deliberately lean to run efficiently on Raspberry Pi
- **Compatibility:** Any native dependencies must support ARM64 (Raspberry Pi architecture)

---

## TypeScript Style

- **Strict mode:** Extends `astro/tsconfigs/strict` via tsconfig.json
- **Named exports** from all modules (no default exports from .ts files)
- **Interfaces:** PascalCase with field names matching SQLite column names
  - Example: `interface Annotation { BookmarkID: number; BookTitle: string; ... }`
- **Functions:** camelCase (`getDatabases`, `getAuthors`, `getAnnotationsByBook`)
- **Constants:** UPPER_SNAKE_CASE at module level (e.g., `const DATA_DIR = "data"`)
- **Raw query results:** Typed as `as any[]` before manual mapping to typed objects

---

## Imports & Exports

- **Node builtins:** Use `node:` prefix (`node:fs`, `node:path`)
- **Bun modules:** `bun:sqlite` for database access
- **Astro:** Import types with `type { APIRoute } from 'astro'`
- **Components:** Relative paths to `.astro` files (`../../layouts/Layout.astro`)
- **Functions:** Direct imports (e.g., `import { getDatabases } from '../../db'`)

---

## Astro Page & Component Patterns

- **Frontmatter:** Code between `---` fences runs server-side synchronously (no async/await needed)
- **Props:** Define with `interface Props { ... }` and destructure from `Astro.props`
- **Dynamic routes:** Use bracket notation (`[dbName]`, `[...filename]`)
- **Slots:** Named slots for layout composition (`slot="back-button"`, `slot="header-title"`)
- **Inline scripts:** Use `is:inline` directive to opt out of Astro bundling
- **Styling:** Scoped `<style>` tags at bottom of each .astro file; global styles in `src/styles/global.css`

---

## Database Access (src/db.ts)

- **All functions are sync** — open connection, query, close immediately
- **Connection pattern:**
  ```typescript
  try {
    const db = new Database(sqlitePath, { readonly: true });
    const result = db.query(...).all();
    return result; // mapped to typed objects
  } finally {
    db.close();
  }
  ```
- **Parameterized queries only** — never string interpolation
  - ✅ `db.query(sql, param1, param2).all()`
  - ❌ `db.query(`SELECT * FROM x WHERE id = ${param}`)`
- **Row mapping:** SQLite returns `any[]`; manually map each row to typed interfaces

---

## Error Handling

- **Database layer:** `throw new Error('descriptive message')`
- **Page routes:** `return Astro.redirect('/path')` for invalid params or empty results
- **API routes:** `return new Response('Not Found', { status: 404 })` for missing files/params
- **No custom error classes** — use built-in Error with descriptive messages
- **No global error boundary** — errors bubble to Astro's default error handling

---

## CSS & Styling

- **Vanilla CSS only** — no Tailwind, no CSS-in-JS, no SASS
- **CSS custom properties** for theming:
  - Light mode: `:root { --color-bg: ...; --color-text: ...; }`
  - Dark mode: `[data-theme="dark"] { --color-bg: ...; }`
- **Naming:** All classes and variables use `kebab-case`
- **Organization:**
  - Global styles: `src/styles/global.css` (358 lines, shared utilities, theme variables, Kobo highlight colors)
  - Component styles: `<style>` tag at bottom of each .astro file (scoped to that component)
- **Responsive breakpoints:** 600px, 480px (mobile-first design not used; breakpoints are breakdowns)

---

## Deployment

- **Build output:** `bun run build` generates `dist/` (standalone directory)
- **Container:** Dockerfile uses `oven/bun:1.1-alpine`
- **Target environment:** Raspberry Pi (ARM64, limited RAM/CPU)
  - Any native dependencies must be ARM-compatible
  - Test Docker builds locally before pushing to Pi
- **Startup:** `start-server.sh` runs the docker container

---

## File Structure Reference

```
src/
├── db.ts                              # All database functions (sync, readonly)
├── layouts/Layout.astro               # Shared HTML shell + theme toggle
├── pages/
│   ├── index.astro                    # "/" — DB selector
│   ├── [dbName]/
│   │   ├── index.astro                # "/:dbName/" — Authors list
│   │   ├── stats.astro                # "/:dbName/stats/" — Stats dashboard
│   │   └── [author]/
│   │       ├── index.astro            # "/:dbName/:author/" — Books list
│   │       └── [book].astro           # "/:dbName/:author/:book" — Annotations viewer
│   └── api/markups/[dbName]/[...filename].ts  # GET /api/markups/:dbName/:file
└── styles/global.css                  # Global theme, utilities, Kobo colors
```

---

## Key Exports from src/db.ts

```typescript
interface Annotation { /* full annotation record */ }
interface KoboStats { /* reading stats aggregation */ }

function getDatabases(): string[]                           // Scan data/ for backups
function getAuthors(dbName: string): { name, bookCount }[] // Books per author
function getBooksByAuthor(dbName, author): { title, annotationCount }[]
function getAnnotationsByBook(dbName, author, book): Annotation[]
function getKoboStats(dbName): KoboStats                   // Reading insights
```

All are synchronous, readonly, and always close the DB connection in a `finally` block.
