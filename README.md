# DeckForge 🃏

A powerful desktop application for designing, creating, and printing custom card decks — from Top Trumps to trading cards and beyond.

## Features

- 🎨 **Full Canvas Design Editor** — Drag-and-drop card designer with layers, text, images, shapes
- 📐 **Template System** — Start from templates or design from scratch
- 🧩 **Component Editor** — Create reusable card components with data bindings
- 🤖 **AI Integration** — Gemini, Ollama, Google Imagen 3 for text, stats, and image generation
- 📁 **PSD Import** — Import Photoshop designs and map dynamic data slots
- 🖨️ **Print-Ready Export** — PDF with trim marks, bleed, test sheets, and alignment tools
- 📏 **Configurable Card Sizes** — Standard Top Trumps (62×100mm) default, fully customizable
- ↩️ **Undo/Redo** — Full history with keyboard shortcuts
- 💾 **Local-First** — All data stored locally, no cloud required

## Tech Stack

- **Electron** + **React 19** + **TypeScript**
- **Konva.js** (react-konva) for canvas rendering
- **Zustand** + Immer for state management
- **pdf-lib** for print export
- **ag-psd** for PSD import/export
- **@google/genai** for Gemini + Imagen
- **Ollama** for local AI
- **SQLite** (better-sqlite3) for local database
- **Vitest** + **Playwright** for testing

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build:mac    # macOS
npm run build:win    # Windows
npm run build:linux  # Linux
```

## License

MIT
