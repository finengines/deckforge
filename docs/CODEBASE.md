# DeckForge Codebase Guide

## Directory Structure

```
deckforge/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── index.ts             # App lifecycle, window creation
│   │   ├── database.ts          # SQLite (better-sqlite3) — decks, cards, images
│   │   ├── ipc.ts               # IPC handlers (deck CRUD, image management)
│   │   └── menu.ts              # Native macOS/Windows menu bar
│   │
│   ├── preload/                 # Context bridge (main ↔ renderer)
│   │   ├── index.ts             # Exposed APIs: deck, image, dialog, app
│   │   └── index.d.ts           # TypeScript declarations for window.api
│   │
│   └── renderer/src/            # React UI (Vite-bundled)
│       ├── App.tsx              # Root — routes between Welcome/Editor
│       ├── assets/app.css       # All styles (CSS variables, dark theme)
│       │
│       ├── types/index.ts       # Core types: Deck, Card, Layer, Template, etc.
│       │
│       ├── stores/              # Zustand state management
│       │   ├── editorStore.ts   # Main store — deck, canvas, layers (with undo/redo)
│       │   ├── aiStore.ts       # AI provider config (persisted)
│       │   └── printStore.ts    # Print/export settings
│       │
│       ├── hooks/               # React hooks
│       │   ├── useAutoSave.ts   # Debounced save to SQLite
│       │   ├── useKeyboardShortcuts.ts  # Global hotkeys
│       │   ├── useContextMenu.ts        # Right-click menus
│       │   └── useToast.ts      # Toast notification system
│       │
│       ├── lib/                 # Pure logic modules
│       │   ├── ai.ts            # Gemini, Ollama, Imagen 3 integration
│       │   ├── pdf.ts           # PDF generation (pdf-lib)
│       │   ├── renderer.ts      # Offscreen Konva → image export
│       │   ├── psd.ts           # PSD import (ag-psd)
│       │   ├── snapping.ts      # Grid + element snapping math
│       │   ├── templates.ts     # 5 built-in card templates
│       │   └── sampleDeck.ts    # Demo "Mythical Creatures" deck
│       │
│       └── components/          # React components
│           ├── WelcomeScreen.tsx # Start screen, recent decks
│           ├── Toast.tsx         # Toast notifications
│           ├── ColorPicker.tsx   # Color picker with presets
│           ├── ContextMenu.tsx   # Right-click context menu
│           │
│           ├── editor/          # Canvas design view
│           │   ├── Canvas.tsx   # react-konva stage, layers, drag-drop
│           │   ├── Toolbar.tsx  # View tabs + tools
│           │   ├── LayerPanel.tsx       # Layer list, reorder, visibility
│           │   ├── PropertiesPanel.tsx  # Selected layer properties
│           │   ├── Rulers.tsx   # Horizontal/vertical rulers
│           │   └── ComponentEditor.tsx  # PSD component editor
│           │
│           ├── deck/            # Card data management
│           │   ├── DeckPanel.tsx        # Card list sidebar
│           │   └── DataView.tsx         # Spreadsheet-style card editing
│           │
│           ├── ai/              # AI features
│           │   ├── AIPanel.tsx          # Text/image/stats generation
│           │   ├── BatchGenerate.tsx    # Bulk AI card generation
│           │   └── ImageGenDialog.tsx   # AI image generation dialog
│           │
│           ├── export/          # Export & print
│           │   └── ExportView.tsx       # PDF/PNG export settings
│           │
│           ├── settings/        # App settings
│           │   └── SettingsView.tsx     # Dimensions, AI config, theme
│           │
│           └── library/         # Component library
│               ├── ComponentLibrary.tsx # Saved component browser
│               └── TemplatePicker.tsx   # Built-in template selector
```

## Key Data Flow

1. **User creates deck** → `editorStore.createDeck()` → SQLite via IPC
2. **User edits canvas** → Konva events → `editorStore.updateLayer()` → Zustand → auto-save
3. **AI generates content** → `aiStore` config → `lib/ai.ts` → API call → store update
4. **Export** → `lib/renderer.ts` renders cards → `lib/pdf.ts` arranges on pages → download

## Testing

- **Unit tests**: `src/renderer/src/__tests__/` (9 suites, 79+ tests)
- **E2E tests**: `e2e/app.spec.ts` (Playwright, 32 test cases)
- Run: `npm test` (unit), `npx playwright test` (E2E, requires display)
