# DeckForge Architecture

## Overview

DeckForge is an Electron desktop application for designing, creating, and printing custom card decks. It follows a classic Electron three-process model with a Zustand-based reactive state layer, SQLite persistence, and pluggable AI backends.

---

## 1. Process Communication

```mermaid
graph LR
    subgraph Main Process
        M[main/index.ts]
        IPC[ipc.ts — IPC Handlers]
        DB[database.ts — better-sqlite3]
        Menu[menu.ts — App Menu]
        FS[File System — images/]
    end

    subgraph Preload
        P[preload/index.ts]
        API["window.api (deck, image, export, psd)"]
        EAPI["window.electron (electronAPI)"]
    end

    subgraph Renderer Process
        App[App.tsx]
        Stores["Zustand Stores (editor, AI, print)"]
        Canvas[react-konva Canvas]
        Components[UI Components]
    end

    M --> IPC
    IPC --> DB
    IPC --> FS
    P -->|contextBridge| API
    P -->|contextBridge| EAPI
    App -->|ipcRenderer.invoke| P
    P -->|ipcMain.handle| IPC
```

### IPC Channels

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `deck:save` | Renderer → Main | Persist deck + cards to SQLite |
| `deck:load` | Renderer → Main | Load deck by ID from SQLite |
| `deck:list` | Renderer → Main | List all saved decks |
| `deck:delete` | Renderer → Main | Delete deck and cascade cards |
| `image:import` | Renderer → Main | Open file dialog, copy to images dir |
| `image:import-buffer` | Renderer → Main | Import drag-and-drop image buffer |
| `image:get-path` | Renderer → Main | Resolve image filename to full path |
| `export:save-file` | Renderer → Main | Show save dialog, write exported file |
| `psd:import` | Renderer → Main | Open PSD file, return base64 buffer |

---

## 2. Data Flow: User Action → Store → SQLite → Auto-save

```mermaid
sequenceDiagram
    participant User
    participant Component as React Component
    participant Store as editorStore (Zustand+Immer)
    participant Zundo as Undo History (Zundo)
    participant Hook as useDeckPersistence
    participant Preload as window.api
    participant Main as Main Process
    participant DB as SQLite (better-sqlite3)

    User->>Component: Edit card / layer / deck
    Component->>Store: store.updateCard() / addLayer() / etc.
    Store->>Zundo: Snapshot pushed (limit: 100)
    Store-->>Hook: useEffect triggers (currentDeck changed)
    Hook->>Hook: Debounce 2 seconds
    Hook->>Preload: window.api.deck.save(deck)
    Preload->>Main: ipcRenderer.invoke('deck:save', deck)
    Main->>DB: saveDeck() — transaction: upsert deck + delete/reinsert cards
    DB-->>Main: OK
    Main-->>Preload: { success: true }
    Preload-->>Hook: Result
    Hook-->>Component: saveStatus: 'saved'
```

### Key Details
- **Debounced auto-save**: 2-second debounce after any `currentDeck` state change
- **Transactional writes**: Deck + all cards saved in a single SQLite transaction
- **WAL mode**: `journal_mode = WAL` for concurrent read/write performance
- **Undo/Redo**: Zundo temporal middleware keeps 100 history snapshots in memory

---

## 3. Component Hierarchy

```mermaid
graph TD
    App[App.tsx]

    App -->|no deck| WS[WelcomeScreen]
    App -->|deck loaded| TB[Toolbar]
    App --> Body[app-body]

    Body -->|view=design| DP[DeckPanel]
    Body -->|view=design| CV[Canvas — react-konva]
    Body -->|view=design| RP[Right Panels]
    Body -->|view=data| DV[DataView]
    Body -->|view=export| EV[ExportView]
    Body -->|view=settings| SV[SettingsView]

    RP --> LP[LayerPanel]
    RP --> PP[PropertiesPanel]

    DP --> CardList[Card List + DnD]
    CV --> Stage[Konva Stage]
    Stage --> KLayer[Konva Layer]
    KLayer --> CLR[ComponentLayerRenderer]

    App --> TC[ToastContainer]

    SV --> AIP[AIPanel]
    AIP --> BGN[BatchGenerate]
    AIP --> IGD[ImageGenDialog]

    CV --> Rulers[Rulers]
    CV --> CE[ComponentEditor]
    CV --> CLib[ComponentLibrary]
```

### View Modes
| View | Components | Purpose |
|------|-----------|---------|
| `design` | DeckPanel + Canvas + LayerPanel + PropertiesPanel | Visual card template editor |
| `data` | DataView | Spreadsheet-like card data management |
| `export` | ExportView | PDF/PNG export with print settings |
| `settings` | SettingsView → AIPanel | AI provider configuration |

---

## 4. AI Integration Flow

```mermaid
sequenceDiagram
    participant User
    participant AIPanel as AIPanel / BatchGenerate
    participant AIStore as aiStore (Zustand+persist)
    participant AILib as lib/ai.ts Dispatcher
    participant Gemini as Google Gemini API
    participant Ollama as Ollama (localhost:11434)
    participant EditorStore as editorStore
    participant Canvas as Canvas

    User->>AIPanel: "Generate stats for card"
    AIPanel->>AIStore: Get provider config for task type
    AIStore-->>AIPanel: AIProviderConfig (apiKey, model, etc.)
    AIPanel->>AILib: generateCardStats(config, cardName, categories)
    
    alt provider = gemini
        AILib->>Gemini: GoogleGenAI.generateContent()
        Gemini-->>AILib: JSON response
    else provider = ollama
        AILib->>Ollama: POST /api/chat
        Ollama-->>AILib: JSON response
    end

    AILib-->>AIPanel: Parsed stats object
    AIPanel->>EditorStore: updateCard(id, { stats, aiGenerated })
    EditorStore-->>Canvas: Re-render (data bindings resolve new stats)
```

### AI Capabilities
| Task | Gemini | Ollama | Function |
|------|--------|--------|----------|
| Text generation | ✅ gemini-2.0-flash | ✅ llama3.2 | `generateText()` |
| Image generation | ✅ imagen-3.0 | ❌ | `generateImage()` |
| Vision/analysis | ✅ gemini-2.0-flash | ✅ llava | `analyzeImage()` |
| Card descriptions | ✅ | ✅ | `generateCardDescription()` |
| Stat generation | ✅ | ✅ | `generateCardStats()` |
| Fun facts | ✅ | ✅ | `generateFunFact()` |

### AI Settings Persistence
The `aiStore` uses Zustand's `persist` middleware with `localStorage` key `deckforge-ai-settings`, storing provider configs and default assignments separately from the main SQLite database.

---

## 5. Export Pipeline

```mermaid
graph TD
    subgraph Input
        Deck[Deck Object]
        Cards[Card Data Array]
        FT[Front Template — Layers]
        BT[Back Template — Layers]
        PS[PrintSettings]
    end

    subgraph Rendering ["lib/renderer.ts"]
        RC[renderCard]
        OC[Offscreen Konva Stage]
        RL[renderLayer — recursive]
        DB[Data Binding Resolution]
        DU[stage.toDataURL → PNG data URL]
    end

    subgraph PDF ["lib/pdf.ts"]
        GP[generatePDF]
        GTS[generateTestSheet]
        Grid[calculateGrid — cards per page]
        TM[drawTrimMarks]
        Embed[embedCardImage → PDFDocument]
        Layout[layoutPage — front + mirrored back]
    end

    subgraph Output
        PDFFile[PDF Uint8Array]
        PNGBlob[PNG/JPEG Blob]
    end

    Deck --> RC
    Cards --> RC
    FT --> RC
    BT --> RC
    RC --> OC
    OC --> RL
    RL --> DB
    DB --> DU

    DU --> GP
    PS --> GP
    GP --> Grid
    GP --> TM
    GP --> Embed
    GP --> Layout
    Layout --> PDFFile

    RC --> |exportCardAsImage| PNGBlob
```

### Rendering Pipeline Details

1. **Card Rendering** (`renderCard`):
   - Creates offscreen Konva Stage at target DPI
   - Recursively renders each layer (text, shape, image, group)
   - Resolves data bindings: `bindTo` field maps layer content to card data (`name`, `description`, `stat:categoryId`, `custom:key`)
   - Returns PNG data URL

2. **PDF Generation** (`generatePDF`):
   - Creates PDFDocument via pdf-lib
   - Calculates grid layout (cards per page based on paper size)
   - Renders all card fronts, then all card backs
   - Lays out with centered grid, configurable spacing
   - Back pages mirror column order for double-sided printing
   - Adds trim marks at card corners
   - Supports front/back offset adjustment for printer alignment

3. **Image Export** (`exportCardAsImage` / `exportAllCards`):
   - Renders individual cards to data URL
   - Converts to Blob with format conversion if needed (PNG/JPEG)
   - Progress callback for batch operations

---

## 6. Database Schema

```mermaid
erDiagram
    DECKS {
        TEXT id PK
        TEXT name
        TEXT description
        JSON dimensions
        JSON categories
        JSON theme
        JSON front_template
        JSON back_template
        JSON components
        TEXT created_at
        TEXT updated_at
    }

    CARDS {
        TEXT id PK
        TEXT deck_id FK
        TEXT name
        TEXT image
        TEXT description
        TEXT fun_fact
        JSON stats
        JSON custom_fields
        JSON ai_generated
        INT sort_order
        TEXT created_at
        TEXT updated_at
    }

    IMAGES {
        TEXT id PK
        TEXT deck_id FK
        TEXT filename
        TEXT original_name
        TEXT mime_type
        INT width
        INT height
        TEXT file_path
        TEXT created_at
    }

    DECKS ||--o{ CARDS : "has many"
    DECKS ||--o{ IMAGES : "has many"
```

### Storage Locations
- **SQLite DB**: `{userData}/deckforge.db` (WAL mode)
- **Images**: `{userData}/images/` (content-addressed by SHA-256 hash prefix)
- **AI Settings**: `localStorage` key `deckforge-ai-settings`

---

## 7. State Management Architecture

```mermaid
graph TD
    subgraph Stores
        ES["editorStore<br/>(Zustand + Immer + Zundo)"]
        AS["aiStore<br/>(Zustand + Immer + persist)"]
        PS["printStore<br/>(Zustand + Immer)"]
    end

    subgraph Middleware
        IM[Immer — immutable updates via mutation syntax]
        ZU[Zundo temporal — undo/redo history]
        PE[persist — localStorage sync]
    end

    ES --- IM
    ES --- ZU
    AS --- IM
    AS --- PE
    PS --- IM

    subgraph Consumers
        C1[Canvas]
        C2[DeckPanel]
        C3[PropertiesPanel]
        C4[AIPanel]
        C5[ExportView]
    end

    ES --> C1
    ES --> C2
    ES --> C3
    AS --> C4
    PS --> C5
```

Each store is independent with fine-grained selectors for minimal re-renders.
