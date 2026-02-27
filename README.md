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

## 🃏 Top Trumps Mode

DeckForge is optimized for creating Top Trumps-style card packs:

- **12 Built-In Templates** — Pre-designed themes (Classic, Sports, Animals, Supercars, Space, Superheroes, Food, Music, History, Kids Cartoon, Photo Minimal, Premium Gold)
- **21 Component Presets** — Stat bars, title bars, image frames, badges, decorative elements, dividers
- **Score Entry View** — Tinder-style swipe interface for entering card stats with your deck-building partner
- **Layout Guides** — Visual zone overlays (Title 0-12%, Image 12-62%, Description 62-72%, Stats 72-95%, Footer 95-100%)
- **Stat Balancing** — AI-powered deck balance analysis to avoid quick wins and ensure fun gameplay
- **CSV Import** — Bulk import card data with automatic column mapping
- **Standard Dimensions** — Default 62×100mm cards (official Top Trumps size)

### Creating Your First Top Trumps Pack

1. **Design → Templates** → Pick a theme (e.g., "Sports Star")
2. **Data → Add Cards** → Enter names and stats
3. **Score → Enter stats** → Use the swipe interface to set values
4. **AI → Batch Generate** → Auto-generate descriptions and fun facts
5. **Export → PDF** → Print-ready with cut marks

📖 **[Full Top Trumps workflow guide →](docs/top-trumps-guide.md)** *(coming soon)*

---

## ⌨️ Keyboard Shortcuts

| Action | Shortcut | Notes |
|--------|----------|-------|
| **Undo** | `Cmd/Ctrl + Z` | 100-step history |
| **Redo** | `Cmd/Ctrl + Shift + Z` | |
| **Select Tool** | `V` | Default selection mode |
| **Text Tool** | `T` | Click canvas to add text |
| **Shape Tool** | `R` | Click canvas to add rectangle |
| **Image Tool** | `I` | Opens file picker |
| **Pan Tool** | `H` | Or middle-mouse drag |
| **Delete Layer** | `Delete / Backspace` | Selected layers |
| **Duplicate Layer** | `Cmd/Ctrl + D` | |
| **Zoom In** | `Cmd/Ctrl + +` | |
| **Zoom Out** | `Cmd/Ctrl + -` | |
| **Shortcuts Reference** | `?` | Opens shortcuts modal |

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

## 🎨 Component Editor Workflow

DeckForge supports importing custom components designed in Photoshop, Figma, or Affinity Designer:

1. **Design in your tool of choice** at print resolution (300 DPI)
2. **Export as PSD** with named layers
3. **Import → PSD** in DeckForge
4. **Map layers to data slots** (e.g., layer "stat_1" → category "Speed")
5. **Save as reusable component**

📖 **[Component Editor Guide →](docs/component-editor-guide.md)** *(coming soon)*

---

## 🐛 Troubleshooting

### App won't launch / white screen
- **macOS:** Right-click app → Open (to bypass Gatekeeper)
- **Check logs:** `~/Library/Logs/DeckForge/` (macOS) or `%APPDATA%/DeckForge/logs/` (Windows)
- **Clear cache:** Delete `~/Library/Application Support/DeckForge/` and restart

### AI features not working
- **Check API keys** in Settings → AI Providers
- **Gemini:** Get free API key at [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- **Ollama:** Ensure Ollama is running (`ollama serve`)
- **Rate limits:** Add delay in Batch Generate settings (default 1000ms)

### PDF export issues
- **Large files:** Reduce DPI in Export settings (300 → 150 DPI)
- **Blurry images:** Increase source image resolution
- **Misaligned printing:** Generate test sheet in Export → Test Sheets

### Performance
- **Slow canvas:** Reduce zoom level or hide unnecessary layers
- **High RAM usage:** Close unused decks (File → Close Deck)
- **Sluggish UI:** Disable gradients in Settings → App Theme

### Data loss
- **Auto-save enabled by default** (2s debounce to SQLite)
- **Manual save:** Deck → Save (or export .deckforge file)
- **Database location:** `~/Library/Application Support/DeckForge/decks.db`

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
