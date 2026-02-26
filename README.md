# 🃏 DeckForge

**Design, create, and print custom card decks — from Top Trumps to trading cards and beyond.**

DeckForge is a desktop application that gives you a full visual editor for designing card templates, managing card data, generating content with AI, and exporting print-ready PDFs. Everything runs locally — your data never leaves your machine.

---

## Screenshots

> 📸 *Coming soon — screenshots of the design editor, data view, and export panel.*

---

## ✅ Features

- [x] **Full Canvas Design Editor** — Drag-and-drop card designer with layers, text, images, shapes, and groups
- [x] **Front & Back Templates** — Design both sides of your cards with shared or independent layouts
- [x] **Data Binding** — Bind template layers to card data fields (name, stats, description, custom fields)
- [x] **Component Library** — Create reusable card components with dynamic data slots
- [x] **AI Content Generation** — Google Gemini and Ollama for text, stats, fun facts, and image generation
- [x] **AI Image Generation** — Google Imagen 3 for card artwork, batch generation support
- [x] **PSD Import** — Import Photoshop designs and map layers to data slots
- [x] **Print-Ready PDF Export** — Multi-card layout with trim marks, bleed, and double-sided printing support
- [x] **Test Sheets** — Generate alignment test sheets for printer calibration
- [x] **Image Export** — Export individual cards as PNG or JPEG at configurable DPI
- [x] **Configurable Card Sizes** — Standard Top Trumps (62×100mm) default, fully customizable
- [x] **Undo/Redo** — Full 100-step history with keyboard shortcuts
- [x] **Auto-Save** — Debounced auto-save to local SQLite database
- [x] **Drag & Drop** — Reorder cards and layers with @dnd-kit
- [x] **Local-First** — All data stored locally in SQLite, no cloud required

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (recommend 22+)
- **npm** 9+

### Install & Run

```bash
git clone https://github.com/finengines/deckforge.git
cd deckforge
npm install
npm run dev
```

### Build for Distribution

```bash
npm run build:mac    # macOS (.dmg)
npm run build:win    # Windows (.exe)
npm run build:linux  # Linux (.AppImage)
```

### Run Tests

```bash
npm test             # Unit tests (Vitest)
npm run typecheck    # TypeScript checks
npm run lint         # ESLint
```

---

## 🏗️ Architecture

DeckForge is an **Electron** app with three processes:

| Process | Technology | Purpose |
|---------|-----------|---------|
| **Main** | Node.js + better-sqlite3 | SQLite database, file I/O, IPC handlers |
| **Preload** | Electron contextBridge | Secure API bridge (`window.api`) |
| **Renderer** | React 19 + Konva + Zustand | UI, canvas editor, AI integration, PDF export |

### State Management

Three independent Zustand stores with Immer middleware:
- **editorStore** — Deck, cards, layers, canvas state + Zundo undo/redo
- **aiStore** — AI provider configs, persisted to localStorage
- **printStore** — Export/print settings

### Data Flow

```
User Edit → Zustand Store (Immer) → React Re-render
                ↓ (2s debounce)
        Auto-save via IPC → Main Process → SQLite
```

📖 **[Full architecture docs →](docs/architecture.md)**
📦 **[Dependency analysis →](docs/dependencies.md)**
📋 **[Architecture Decision Records →](docs/adr/)**

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Runtime | Electron 39, Node.js |
| UI | React 19, Tailwind CSS 4 |
| Canvas | Konva.js + react-konva |
| State | Zustand + Immer + Zundo |
| Database | SQLite (better-sqlite3) |
| PDF Export | pdf-lib |
| PSD Import | ag-psd |
| AI | Google Gemini (@google/genai), Ollama |
| Build | electron-vite, Vite 7 |
| Testing | Vitest, Playwright |
| Packaging | electron-builder |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/my-feature`
3. **Make changes** and add tests if applicable
4. **Run checks**: `npm test && npm run typecheck && npm run lint`
5. **Commit**: `git commit -m "feat: add my feature"`
6. **Push**: `git push origin feature/my-feature`
7. **Open a Pull Request**

### Project Structure

```
src/
├── main/              # Electron main process
│   ├── index.ts       # App entry, window creation
│   ├── database.ts    # SQLite schema & operations
│   ├── ipc.ts         # IPC handler registration
│   └── menu.ts        # Application menu
├── preload/           # Context bridge
│   └── index.ts       # window.api definition
└── renderer/src/      # React application
    ├── App.tsx         # Root component & view router
    ├── stores/         # Zustand stores
    ├── components/     # UI components
    │   ├── editor/     # Canvas, toolbar, layers, properties
    │   ├── deck/       # Card list, data view
    │   ├── export/     # Export settings
    │   ├── ai/         # AI panel, batch generate
    │   └── settings/   # Settings view
    ├── hooks/          # Custom React hooks
    ├── lib/            # Core logic (ai, pdf, renderer, psd, snapping)
    └── types/          # TypeScript type definitions
```

---

## 📄 License

[MIT](LICENSE) © [Fin Spenceley](mailto:finlay@fin-engineering.com)
