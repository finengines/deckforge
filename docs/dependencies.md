# DeckForge Dependency Analysis

## Direct Dependencies

### Core / Runtime

| Package | Version | Purpose | Size Impact |
|---------|---------|---------|-------------|
| `electron` | 39.7.0 | Desktop app shell | ~200MB (bundled runtime, not in app bundle) |
| `react` | 19.2.4 | UI framework | ~7KB gzip |
| `react-dom` | 19.2.1 | React DOM renderer | ~40KB gzip |
| `uuid` | 13.0.0 | UUID generation for IDs | ~2KB gzip |

### Canvas / UI

| Package | Version | Purpose | Size Impact |
|---------|---------|---------|-------------|
| `konva` | 10.2.0 | 2D canvas rendering engine | ~70KB gzip |
| `react-konva` | 19.2.2 | React bindings for Konva | ~5KB gzip |
| `@dnd-kit/core` | 6.3.1 | Drag-and-drop framework | ~15KB gzip |
| `@dnd-kit/sortable` | 10.0.0 | Sortable lists (layers, cards) | ~5KB gzip |
| `@dnd-kit/utilities` | 3.2.2 | DnD utility functions | ~2KB gzip |
| `tailwindcss` | 4.2.1 | Utility-first CSS (build-time) | ~0KB runtime |

### State Management

| Package | Version | Purpose | Size Impact |
|---------|---------|---------|-------------|
| `zustand` | 5.0.11 | Lightweight state management | ~2KB gzip |
| `immer` | 11.1.4 | Immutable state via mutations | ~6KB gzip |
| `zundo` | 2.3.0 | Undo/redo middleware for Zustand | ~1KB gzip |

### Export / File Handling

| Package | Version | Purpose | Size Impact |
|---------|---------|---------|-------------|
| `pdf-lib` | 1.17.1 | PDF creation and manipulation | ~200KB gzip |
| `ag-psd` | 30.1.0 | PSD file import/export | ~100KB gzip |

### AI Integration

| Package | Version | Purpose | Size Impact |
|---------|---------|---------|-------------|
| `@google/genai` | 1.43.0 | Google Gemini + Imagen APIs | ~30KB gzip |
| `ollama` | 0.6.3 | Ollama local AI client | ~5KB gzip |

### Database

| Package | Version | Purpose | Size Impact |
|---------|---------|---------|-------------|
| `better-sqlite3` | 12.6.2 | SQLite bindings (native, main process) | ~2MB native binary |

### Electron Toolkit

| Package | Version | Purpose | Size Impact |
|---------|---------|---------|-------------|
| `@electron-toolkit/preload` | 3.0.2 | Preload script helpers | ~1KB |
| `@electron-toolkit/utils` | 4.0.0 | Electron utility functions | ~2KB |

---

## Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `electron-vite` | 5.0.0 | Vite-based Electron build system |
| `vite` | 7.3.1 | Module bundler |
| `@vitejs/plugin-react` | 5.1.4 | React Fast Refresh for Vite |
| `@tailwindcss/vite` | 4.2.1 | Tailwind CSS Vite plugin |
| `typescript` | 5.9.3 | Type system |
| `vitest` | 4.0.18 | Unit test runner |
| `@playwright/test` | 1.58.2 | E2E test framework |
| `electron-playwright-helpers` | 2.1.0 | Electron + Playwright bridge |
| `@testing-library/react` | 16.3.2 | React component testing |
| `@testing-library/jest-dom` | 6.9.1 | DOM assertion matchers |
| `jsdom` | 28.1.0 | DOM environment for tests |
| `eslint` | 9.39.3 | Linting |
| `prettier` | 3.8.1 | Code formatting |
| `electron-builder` | 26.8.1 | App packaging/distribution |
| `@electron-toolkit/tsconfig` | 2.0.0 | Shared TS config |
| `@electron-toolkit/eslint-config-*` | 3.x | Shared ESLint configs |
| `@types/*` | various | TypeScript type definitions |

---

## Bundle Size Summary

| Category | Estimated gzip | Notes |
|----------|---------------|-------|
| React + ReactDOM | ~47KB | Core framework |
| Konva + react-konva | ~75KB | Canvas engine — largest renderer dep |
| State (Zustand+Immer+Zundo) | ~9KB | Very lightweight |
| PDF (pdf-lib) | ~200KB | Significant but no lighter alternative |
| PSD (ag-psd) | ~100KB | Only loaded on PSD import |
| AI clients | ~35KB | Lazy-importable |
| DnD kit | ~22KB | Moderate |
| **Total renderer bundle** | **~490KB gzip** | Excluding Electron runtime |

---

## Optimization Opportunities

### Lightweight Alternatives

| Current | Alternative | Savings | Trade-off |
|---------|------------|---------|-----------|
| `ag-psd` (100KB) | Lazy dynamic import | Load only when user imports PSD | Already partially lazy — could code-split further |
| `@google/genai` (30KB) | Direct `fetch()` calls to Gemini REST API | ~28KB | Lose SDK type safety and convenience |
| `@dnd-kit/*` (22KB) | HTML5 drag-and-drop | ~20KB | Lose accessibility, touch support, smooth animations |
| `uuid` (2KB) | `crypto.randomUUID()` | ~2KB | Native API, available in all target environments |

### Code Splitting Opportunities

1. **AI modules** — `@google/genai` and `ollama` are already dynamically imported in `lib/ai.ts`. The AI panel components could be lazy-loaded.
2. **PSD import** — `ag-psd` is only needed for PSD import. Already a good candidate for dynamic import.
3. **PDF generation** — `pdf-lib` is only needed during export. Could be lazy-loaded when ExportView mounts.
4. **Export view** — Entire export view with pdf-lib could be a React.lazy() route.

### Native Replacements

- **`uuid`** → `crypto.randomUUID()` — Available in Electron's Chromium and Node.js. Zero-dep replacement, saves ~2KB.
- **`ollama` package** → Direct `fetch()` — The ollama npm package is a thin wrapper around REST calls. The codebase already uses direct fetch in `lib/ai.ts` for Ollama, making the `ollama` package potentially unused (verify actual usage).

### Heavy Dependencies to Watch

- **`better-sqlite3`** (~2MB native binary) — Required for native SQLite. No lighter alternative exists for synchronous SQLite in Node.js. The native addon is compiled per-platform by electron-builder.
- **`konva`** (~70KB) — Core to the entire canvas editor. No replacement makes sense.
- **`pdf-lib`** (~200KB) — Only pure-JS PDF library with the features needed (image embedding, trim marks, custom layout). jsPDF is larger and less capable for this use case.
