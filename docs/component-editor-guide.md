# Component Editor Guide

DeckForge lets you create reusable card components — stat bars, title sections, image frames, badges — that you can place on any card template. You can build components directly in DeckForge or import designs from external tools like Photoshop, Figma, or Affinity Designer.

---

## Built-In Component Presets

DeckForge ships with **21 component presets** across 6 categories:

| Category | Components | Description |
|----------|-----------|-------------|
| **Stat Displays** | Horizontal bar, vertical bar, circular gauge, mini stat, comparison | Visual stat representations |
| **Title Bars** | Classic banner, angled ribbon, rounded badge, minimal | Card name/title styling |
| **Image Frames** | Rounded rectangle, oval portrait, hexagonal, polaroid | Photo/artwork containers |
| **Badges** | Star rating, rank shield, category icon, corner flag | Decorative indicators |
| **Decorative** | Gradient divider, pattern stripe, corner ornament | Visual accents |
| **Dividers** | Simple line, dotted, double rule | Section separators |

### Using Presets

1. Open the **Design** view
2. Find the **Components** panel (right side)
3. Browse categories or search
4. **Click** any preset to add it to the canvas
5. Select and edit properties (colors, sizes, text)

---

## Creating Custom Components

### In DeckForge

1. **Design your component** using the canvas tools (shapes, text, images)
2. Select all layers that make up the component
3. Right-click → **Create Component**
4. Name your component and define **data slots**
5. Save — it appears in your Component Library

### Data Slots

Data slots let component layers bind to card data:

| Slot Type | Binds To | Example |
|-----------|----------|---------|
| `name` | Card name | Title text |
| `image` | Card image | Photo layer |
| `description` | Card description | Body text |
| `funFact` | Fun fact | Trivia text |
| `stat:0` – `stat:5` | Stat categories | Stat bars/values |

When you place a data-bound component on a template, it automatically updates for each card in your deck.

---

## Importing from External Design Software

### General Workflow

1. **Design** your component in Photoshop/Figma/Affinity
2. **Name layers** using DeckForge conventions (see below)
3. **Export as PSD** (Photoshop format — best compatibility)
4. **Import** in DeckForge: Components → New → Import PSD
5. **Map layers** to data slots
6. **Save** as reusable component

### Layer Naming Conventions

Name your layers to auto-map to data slots:

```
card-title       → binds to card name
card-image       → binds to card image
card-description → binds to card description
card-funfact     → binds to fun fact
stat-1           → binds to 1st stat category
stat-2           → binds to 2nd stat category
stat-3           → binds to 3rd stat category
stat-4           → binds to 4th stat category
stat-5           → binds to 5th stat category
stat-6           → binds to 6th stat category
background       → static background (no binding)
decoration       → static decoration (no binding)
```

Any layer not matching these names will be imported as a static (non-bound) layer.

---

## Photoshop Workflow

### Setup

1. **Create new document**: 62mm × 100mm at 300 DPI (or your card dimensions)
2. **Color mode**: RGB (DeckForge converts to CMYK on export if needed)
3. **Bleed**: Add 3mm bleed on all sides (total canvas: 68mm × 106mm)

### Design Tips

- Use **layer groups** to organize sections (title area, image area, stats area)
- Keep **text layers editable** — DeckForge can read text properties
- Use **smart objects** for complex graphics that should remain raster
- Set up **layer effects** (drop shadow, stroke) — these export to PSD
- Mark layers with the naming convention above for auto-mapping

### Export

1. **File → Save As → Photoshop (.psd)**
2. Keep layers intact (don't flatten!)
3. Import in DeckForge

---

## Figma Workflow

Figma doesn't export PSD natively, but you can work around this:

### Option A: Figma → PNG Layers

1. Design your component in Figma
2. Export each layer as individual PNG at 300 DPI
3. Import PNGs as image layers in DeckForge
4. Arrange and bind to data slots

### Option B: Figma → Photopea → PSD

1. Design in Figma
2. Copy frames to [Photopea](https://www.photopea.com) (free online Photoshop alternative)
3. Adjust layers and naming
4. Export as PSD
5. Import in DeckForge

### Option C: Direct Design in DeckForge

For simpler components, design directly in DeckForge using the built-in tools. The canvas editor supports:
- Text with fonts, sizes, colors, alignment
- Shapes (rectangles, rounded corners)
- Images with crop and resize
- Layer ordering and grouping

---

## Affinity Designer / Photo Workflow

1. **Design** at 62×100mm, 300 DPI
2. **Name layers** using the conventions above
3. **File → Export → PSD** (Photoshop format)
4. Ensure "Preserve editability" is checked
5. Import PSD in DeckForge

---

## Design Guidelines for Top Trumps Cards

### Card Anatomy (Zone Layout)

```
┌─────────────────────┐
│   TITLE (0-12%)     │  Card name, pack branding
├─────────────────────┤
│                     │
│   IMAGE (12-62%)    │  Main photo/artwork
│   (hero area)       │  50% of card height
│                     │
├─────────────────────┤
│   DESCRIPTION       │  2-3 sentence bio
│   (62-72%)          │
├─────────────────────┤
│   STATS (72-95%)    │  5-6 stat bars with values
│   ┌──── Speed ──89─┐│
│   ├──── Power ──75─┤│
│   ├──── Skill ──92─┤│
│   └──── Luck  ──61─┘│
├─────────────────────┤
│   FOOTER (95-100%)  │  Badge, category, pack logo
└─────────────────────┘
```

### Best Practices

- **Image dominance**: The hero image should be the visual centerpiece (50-60% of card)
- **Readable stats**: Use high-contrast colors for stat values
- **Consistent layout**: All cards in a pack should use the same template
- **Bleed area**: Always extend backgrounds 3mm past the trim line
- **Safe zone**: Keep important content 3mm inside the trim line
- **Font sizes**: Title ≥ 10pt, stats ≥ 7pt, footer ≥ 6pt (at print size)
- **Color palette**: Limit to 3-4 colors per template for visual harmony

### Print Resolution

| Element | Minimum DPI | Recommended |
|---------|------------|-------------|
| Card images | 150 DPI | 300 DPI |
| Text | 300 DPI | 300 DPI |
| Line art | 300 DPI | 600 DPI |
| Solid colors | Any | N/A |

---

## Troubleshooting

### PSD import shows blank layers
- Ensure layers are **not flattened** before export
- Check that layer visibility is **on** in Photoshop
- Try re-saving the PSD in Photoshop (not just exporting)

### Colors look different after import
- DeckForge works in **RGB** color space
- If your PSD was in CMYK, colors may shift
- Convert to RGB in Photoshop before exporting

### Text layers show as images
- ag-psd reads text properties but complex formatting may render as raster
- For best results, keep text simple (single font, no warping)
- You can always replace imported text with native DeckForge text layers

### Layer positions are wrong
- Check your canvas size matches DeckForge card dimensions
- Ensure no canvas resizing was done after designing
- Verify bleed settings match between design tool and DeckForge
