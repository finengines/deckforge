# Top Trumps Design Research

> Compiled: 2026-02-26 | Purpose: DeckForge product overhaul reference

---

## Table of Contents

1. [Card Anatomy](#1-top-trumps-card-anatomy)
2. [Popular Packs Analysis](#2-popular-top-trumps-packs)
3. [Custom Creators & Services](#3-custom-top-trumps-creators)
4. [Card Design Best Practices](#4-card-design-best-practices)
5. [Component Patterns](#5-component-patterns)
6. [Competitive Features for DeckForge](#6-competitive-features-for-deckforge)

---

## 1. Top Trumps Card Anatomy

### Standard Card Dimensions

- **Card size**: 62mm × 100mm (2.44" × 3.94") — larger than poker cards (63.5 × 89mm), smaller than tarot
- **Standard deck**: 30–36 cards per pack (some packs go to 54)
- **Orientation**: Portrait (always)

### Card Front Layout — ASCII Diagram

```
┌─────────────────────────────┐
│  ┌─────────────────────┐    │ ← ~8% - Title Bar (colored)
│  │  CARD TITLE / NAME  │    │   White/light text, bold sans-serif
│  └─────────────────────┘    │   May include card number (e.g., "12/30")
│                             │
│  ┌─────────────────────┐    │
│  │                     │    │ ← ~40-45% - Main Image
│  │    PHOTOGRAPH or    │    │   Full-color photo or illustration
│  │    ILLUSTRATION     │    │   Framed with rounded corners or
│  │                     │    │   themed border
│  │                     │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │ ← ~5% - Category/Set Badge
│  │  SET LOGO / ICON    │    │   Small pack identifier
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ STAT 1 ··········XX │    │ ← ~35-40% - Stats Area
│  │ STAT 2 ··········XX │    │   5–8 rows of category/value pairs
│  │ STAT 3 ··········XX │    │   Alternating row background colors
│  │ STAT 4 ··········XX │    │   Left-aligned labels, right-aligned values
│  │ STAT 5 ··········XX │    │   Consistent font size across all cards
│  │ STAT 6 ··········XX │    │
│  └─────────────────────┘    │
│                             │
│  TOP TRUMPS™ LOGO           │ ← ~5% - Footer / Branding
│  © Winning Moves             │
└─────────────────────────────┘
```

### Approximate Proportions (Top to Bottom)

| Zone | Height % | Contents |
|------|----------|----------|
| Title Bar | 8–10% | Card name, card number |
| Main Image | 40–45% | Photo/illustration in themed frame |
| Category Badge | 3–5% | Pack icon, sub-category label |
| Stats Area | 35–40% | 5–8 stat rows with labels + values |
| Footer | 3–5% | Top Trumps logo, copyright, set branding |

### Element Details

#### Title Bar
- **Position**: Top of card, full width
- **Style**: Solid colored background matching pack theme
- **Text**: White or contrasting bold text, usually ALL CAPS or Title Case
- **Font**: Bold sans-serif (condensed variants common for long names)
- **Typical height**: 8–10mm
- **Variations**: Some packs use gradient backgrounds, some include a small card number in the corner

#### Main Image
- **Position**: Center-upper portion, below title bar
- **Aspect ratio**: Roughly 4:3 or 3:2 landscape within portrait card
- **Frame styles**: 
  - Sharp rectangular (classic)
  - Rounded corners (modern packs)
  - Themed borders (e.g., stone effect for dinosaurs, metallic for cars)
  - Some packs bleed image to card edges
- **Content**: High-quality photographs for real subjects (animals, cars, football); illustrations/renders for fictional (Marvel, Harry Potter, dinosaurs)

#### Stats Area
- **Position**: Lower half of card
- **Layout**: Table-like rows, always the same number of stats per card within a pack
- **Row styling**: 
  - Alternating colored/white backgrounds for readability
  - Horizontal separator lines between rows
  - Some packs use subtle gradient or themed textures
- **Label**: Left-aligned, regular weight
- **Value**: Right-aligned, bold weight, sometimes larger font
- **Number of stats**: Typically 5–8 (6 is most common in modern packs)
- **Value formats**: Integers, decimals, percentages, text ratings (1-100 scale common)

#### Card Number
- **Position**: Usually top-right of title bar, or bottom of card
- **Format**: "1/30", "Card 12 of 30", or just "12"

#### Set Logo / Pack Branding
- **Position**: Between image and stats area, or bottom of card
- **Size**: Small, non-intrusive
- **Content**: Pack theme icon + Top Trumps wordmark

#### Footer
- **Position**: Bottom edge
- **Content**: Top Trumps™ logo, copyright notice, sometimes a URL
- **Height**: Minimal, ~3–5mm

### Card Back Design

```
┌─────────────────────────────┐
│                             │
│                             │
│      ┌───────────────┐      │
│      │               │      │
│      │   TOP TRUMPS  │      │
│      │     LOGO      │      │
│      │               │      │
│      │  PACK THEME   │      │
│      │   GRAPHIC     │      │
│      │               │      │
│      └───────────────┘      │
│                             │
│      PACK NAME / SERIES     │
│                             │
│                             │
└─────────────────────────────┘
```

- **All cards in a pack share the same back** (essential for gameplay — you can't identify cards from behind)
- **Style**: Usually a bold, themed pattern or graphic
- **Elements**: Top Trumps logo (prominent), pack name, theme-colored background, often a repeating pattern or collage of related imagery
- **Modern packs**: Full-bleed themed artwork or dynamic patterns

---

## 2. Popular Top Trumps Packs

### Pack Survey (20 Packs Analyzed)

| # | Pack | Stats Count | Color Scheme | Image Style | Notable Design Features |
|---|------|-------------|-------------|-------------|------------------------|
| 1 | **Dinosaurs** | 6 | Green/brown earth tones | Illustrated/CG renders | Stone-textured frames, prehistoric font for title |
| 2 | **Supercars** | 6 | Silver/red metallic | Photography | Metallic title bar, speed-themed stat icons |
| 3 | **Football Stars** | 6 | Green pitch/team colors | Photography | Player photo on pitch background, jersey number integration |
| 4 | **Marvel Cinematic Universe** | 6 | Character-specific colors | Movie stills/artwork | Comic-style stat bars, character power levels 1-100 |
| 5 | **Harry Potter** | 6 | Hogwarts house colors | Movie stills | Parchment-textured stat area, wizarding fonts |
| 6 | **Harry Potter Dark Arts** | 6 | Dark purple/black | Movie stills | Dark theme variant, same layout as HP base |
| 7 | **Cats** | 6 | Warm pastels, pink/cream | Photography | Soft rounded frames, paw print decorations |
| 8 | **Dogs** | 6 | Blue/warm tones | Photography | Similar to Cats pack but blue-shifted palette |
| 9 | **Creatures of the Deep** | 6 | Ocean blue/dark blue | Photography/illustration | Wave-themed borders, depth-pressure stat |
| 10 | **Military Jets** | 6 | Dark grey/navy | Photography | Technical feel, angular frames, spec-sheet aesthetic |
| 11 | **Sports Cars** | 6 | Red/black premium | Photography | Showroom-style photos, speedometer-inspired stats |
| 12 | **Stranger Things** (Limited) | 6 | Red/dark, 80s neon | Show stills | Retro typography, VHS-inspired back design |
| 13 | **DC Comics** | 6 | Character-themed | Artwork | Bold comic colors, power-ranking stats |
| 14 | **Star Wars** | 6 | Black/blue space theme | Movie stills | Sci-fi fonts, force rating stat |
| 15 | **Minecraft** | 6 | Pixelated green/brown | Game screenshots/pixel art | Pixel-style fonts and frames |
| 16 | **Baby Animals** | 6 | Soft pastels | Photography | Cute rounded design, child-friendly fonts |
| 17 | **Horses, Ponies & Unicorns** | 6 | Purple/pink | Photography/illustration | Fantasy-themed borders for unicorn cards |
| 18 | **Countries** | 6-8 | Flag colors per card | Photography | Geographic stats (population, area), flag integration |
| 19 | **Volcanoes** | 6 | Orange/red/black | Photography | Lava-textured borders, eruption stats |
| 20 | **England Women's Football** | 6 | White/red (England) | Photography | Player bios, career stats focus |

### Key Design Observations

#### Consistency Within Packs
- **Every card in a pack uses identical layout** — only the content changes
- **Same number of stat categories** throughout (never varies within a pack)
- **Same stat labels** on every card (e.g., every dinosaur card has: Length, Weight, Killer Rating, Intelligence, Age, Ferocity)
- **Same color scheme** throughout — pack identity is color-driven

#### Variations Between Packs
- **Title bar color** changes per pack (green for dinosaurs, red for cars, etc.)
- **Image frame style** matches theme (stone for ancient, metallic for tech, soft for animals)
- **Font personality** varies: technical/angular for vehicles/military, rounded for animals/kids, decorative for fantasy/fiction
- **Stat row backgrounds** use pack accent colors at low opacity

#### Common Stat Category Patterns
- **Animals**: Size, Weight, Speed, Lifespan, Danger Rating, Cuteness/Rarity
- **Vehicles**: Top Speed, 0-60, BHP/Power, Engine Size, Weight, Price
- **Sports**: Goals/Points, Appearances, Trophies, Speed, Skill Rating, Age
- **Superheroes**: Strength, Speed, Intelligence, Fighting Skills, Powers, Bravery
- **Countries**: Population, Area, GDP, Life Expectancy, Tourism

#### Typography Patterns by Genre
| Genre | Title Font Style | Stat Font Style | Personality |
|-------|-----------------|-----------------|-------------|
| Animals | Rounded sans-serif | Clean sans-serif | Friendly, approachable |
| Vehicles | Condensed bold | Monospace/tabular | Technical, precise |
| Fantasy/Sci-fi | Decorative/custom | Clean serif/sans | Immersive, themed |
| Sports | Bold italic/condensed | Bold sans-serif | Dynamic, energetic |
| Educational | Standard sans-serif | Clean sans-serif | Clear, informative |

---

## 3. Custom Top Trumps Creators

### Official: My Top Trumps (mytoptrumps.com)
- **Status**: Currently OFFLINE ("We're Taking a Break" — reviewing next chapter of brand)
- **Was**: The official Winning Moves personalized Top Trumps service
- **Features** (when active):
  - Multiple themed templates to choose from
  - Upload your own photos
  - Custom categories and values
  - Quick-flick preview of entire deck
  - Front/back card flip preview
  - Saved projects / returning customer data load
  - Multiple quantity ordering (wedding tables, party favors)
  - Standard 30-card decks
- **Pricing** (historical): £15-25 per pack
- **Limitations**: Fixed template layouts, couldn't modify stat count, limited design control
- **Key insight**: The OFFICIAL service is offline — massive market opportunity for DeckForge

### Personalised Playing Cards (cardcreator.personalisedplayingcards.com)
- **Status**: Active
- **Features**:
  - Online card creator with live preview
  - Custom back image upload
  - Custom face image, title, categories, and values per card
  - Card-by-card editing (prev/next navigation)
  - Lock categories across deck
- **Pricing**: £9.98 for 1 pack, bulk discounts (£4.50/pack at 100)
- **Limitations**: Basic web UI, no theme templates, manual per-card editing only
- **Target**: Personal gifts, children aged 5-15

### Ivory Graphics (ivory.co.uk/custom-trumps)
- **Status**: Active, UK-based manufacturer
- **Card size**: Standard 62mm × 100mm (custom sizes available)
- **Features**:
  - Full custom design service (they create artwork for you)
  - Smooth or linen card stock
  - Custom printed boxes
  - 5 categories standard (flexible)
  - 36 cards standard (flexible)
  - Worksheet-based ordering (not self-service online)
  - Foiling and premium finishes available
- **Pricing**: Quote-based, premium
- **Best for**: Professional/corporate custom packs
- **Limitations**: Not self-service; must work with their design team

### Print From Your Sofa (printfromyoursofa.co.uk)
- **Status**: Active
- **Card size**: 62mm × 100mm standard
- **Features**:
  - Trump cards with custom categories
  - Smooth casino-grade card stock or linen finish
  - Custom printed boxes
  - PDF templates available for all sizes
- **Pricing**: £42/pack (1 pack) down to £2.75/pack (1000 packs)
- **Deck sizes**: 36 or 54 cards standard, custom counts available
- **Limitations**: Template-based, upload-your-own-design (no online editor)

### MakePlayingCards.com (makeplayingcards.com)
- **Status**: Active, international
- **Features**:
  - Online trump card maker (drag-and-drop)
  - Up to 440 cards per deck
  - Multiple card stock options (smooth, linen)
  - Gloss or matte finishing
  - Optional custom box
  - No minimum order (1 deck)
  - Worldwide shipping
- **Pricing**: Competitive, volume-based
- **Limitations**: Generic card maker, not Top Trumps-specific templates

### Twinkl (twinkl.com)
- **Status**: Active (educational resource)
- **Features**: Free downloadable blank Top Trumps templates (Word/PDF)
- **Format**: Printable A4 sheets with card outlines
- **Limitations**: DIY paper cards only, no print service, educational focus

### ChatGPT GPT: "Top Trump Card Creator"
- **Status**: Active GPT by Brink Publishing & Design
- **Features**: AI-generated Trump cards with stats and images for any subject
- **Limitations**: Digital only, no print output, image quality varies

### Competitive Landscape Summary

| Service | Online Editor | Templates | Print Quality | Custom Stats | Price Point | Self-Service |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|
| My Top Trumps (offline) | ✅ | ✅ | ✅ | Limited | £15-25 | ✅ |
| PersonalisedPlayingCards | ✅ | ❌ | ✅ | ✅ | £10-45 | ✅ |
| Ivory Graphics | ❌ | ❌ | ⭐⭐⭐ | ✅ | Premium | ❌ |
| Print From Your Sofa | ❌ | Templates | ⭐⭐⭐ | ✅ | £3-42 | Partial |
| MakePlayingCards | ✅ | Basic | ⭐⭐⭐ | ✅ | Budget | ✅ |
| Twinkl | ❌ | ✅ | DIY | ✅ | Free | ✅ |
| **Gap for DeckForge** | **✅** | **✅✅✅** | **Digital+Print** | **✅** | **Free+Premium** | **✅** |

---

## 4. Card Design Best Practices

### Typography

#### Title Text
- **Font family**: Bold sans-serif (e.g., Futura Bold, Montserrat Bold, Bebas Neue)
- **Size**: 14–18pt equivalent at print (largest text on card)
- **Case**: ALL CAPS or Title Case
- **Color**: White on colored background, or dark on light
- **Tracking**: Slightly expanded for readability at distance
- **Key rule**: Must be readable from 2–3 feet away in a fan of cards

#### Stat Labels
- **Font family**: Regular weight sans-serif (same family as title or complementary)
- **Size**: 8–10pt equivalent at print
- **Case**: Title Case
- **Color**: Dark on light background
- **Alignment**: Left-aligned, with consistent left margin

#### Stat Values
- **Font family**: Bold sans-serif or monospaced/tabular figures
- **Size**: 10–12pt equivalent (slightly larger than labels)
- **Alignment**: Right-aligned for numerical comparison
- **Key rule**: USE TABULAR FIGURES (not proportional) — numbers must align vertically across cards for quick comparison
- **Color**: Often in accent/theme color or bold black

#### Font Recommendations for Card Games
| Use | Recommended | Why |
|-----|------------|-----|
| Titles | Montserrat Bold, Oswald, Bebas Neue | High impact, readable at small sizes |
| Stats labels | Inter, Roboto, Source Sans Pro | Clean, neutral, high x-height |
| Stat values | Roboto Mono, Tabular figures of Inter | Consistent number widths |
| Themed titles | Custom per theme (fantasy, sci-fi, etc.) | Immersion |

### Color Theory for Card Categories

#### Pack-Level Color Identity
- Each pack needs a **dominant color** (2-3 colors max)
- Color should evoke the theme:
  - 🟢 Nature/animals → greens, earthy browns
  - 🔴 Sports/action → reds, energetic warm tones
  - 🔵 Technology/science → blues, cool grays
  - 🟡 Fun/children → bright yellows, playful primaries
  - 🟣 Fantasy/magic → purples, deep blues
  - ⚫ Premium/dark themes → black, gold, silver

#### Stat Row Color Coding
- Alternating rows: Use pack accent color at 10-20% opacity vs white
- Avoid: Using different colors per stat row (confusing; saves this for indicating value ranges)
- Consider: Subtle color temperature shift (cool to warm) across stats for visual flow

#### Accessibility
- Minimum contrast ratio: 4.5:1 for stat text (WCAG AA)
- Don't rely solely on color to distinguish elements — use shape/icon + color
- Test designs for color blindness (protanopia, deuteranopia)

### Image Framing & Cropping

#### Best Practices
- **Subject should fill 60-80%** of the image area
- **Consistent framing** across all cards in a pack (e.g., all headshots, or all full-body)
- **Background removal or standardization** helps visual consistency
- **Rule of thirds** for dynamic compositions
- **Face/subject centered** for portrait-style shots (most common in Top Trumps)
- **Action shots** work well for sports and vehicles
- **Minimum resolution**: 300 DPI at print size (approx 740 × 1200px for a full card at 62×100mm)

#### Image Frame Styles
- **Hard rectangle**: Classic, clean, works with any theme
- **Rounded rectangle**: Modern, friendly, good for animals/people
- **Themed border**: Custom frame matching pack theme (e.g., circuit board for tech)
- **Full bleed**: Image extends to card edges (modern premium look)
- **Vignette**: Fade to color at edges (subtle, cinematic)

### Print Specifications

#### Card Dimensions with Bleed
```
┌─────── Bleed Line (65mm × 103mm) ─────────┐
│  ┌──── Trim Line (62mm × 100mm) ────────┐  │
│  │  ┌── Safe Zone (56mm × 94mm) ──────┐ │  │
│  │  │                                  │ │  │
│  │  │   All critical content within    │ │  │
│  │  │   this area                      │ │  │
│  │  │                                  │ │  │
│  │  └──────────────────────────────────┘ │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘

Bleed: 1.5mm on each side (some printers require 3mm)
Safe zone: 3mm inset from trim on each side
```

| Specification | Value |
|--------------|-------|
| **Trim size** | 62mm × 100mm |
| **Bleed** | 1.5–3mm per side |
| **Safe zone** | 3mm inset from trim |
| **Resolution** | 300 DPI minimum |
| **Color mode** | CMYK for print, RGB for digital |
| **File format** | PDF/X-1a (print), PNG/SVG (digital) |
| **Card stock** | 300–350gsm coated card |
| **Finish** | Gloss, matte, or linen texture |
| **Corner radius** | 3–3.5mm (standard playing card radius) |

#### Card Stock Options
| Stock | Weight | Feel | Best For |
|-------|--------|------|----------|
| Smooth coated | 300gsm | Slick, professional | Standard packs |
| Linen texture | 300gsm | Premium, tactile | Premium editions |
| Casino-grade | 310-330gsm | Stiff, durable | Heavy use |
| Blue/black core | 310gsm | Opaque, no show-through | Competitive play |

---

## 5. Component Patterns

### Stat Bar Styles

#### Style A: Simple Label–Value Rows (Most Common)
```
┌─────────────────────────────┐
│ Speed          ·········  87│
│ Strength       ·········  62│
│ Intelligence   ·········  94│
└─────────────────────────────┘
```
- Clean, classic, highest information density
- Left label, right value, dots/space between
- Used by ~80% of Top Trumps packs

#### Style B: Bar Chart / Progress Bar
```
┌─────────────────────────────┐
│ Speed     ████████████░░  87│
│ Strength  ████████░░░░░░  62│
│ Intelligence ██████████████ 94│
└─────────────────────────────┘
```
- Visual representation of relative values
- Great for 1-100 scales
- Used in some Marvel/superhero packs
- More visually exciting but takes more horizontal space

#### Style C: Icon + Value
```
┌─────────────────────────────┐
│ ⚡ Speed              87    │
│ 💪 Strength           62    │
│ 🧠 Intelligence       94    │
└─────────────────────────────┘
```
- Themed icons per stat
- Good for younger audiences / thematic immersion
- Requires consistent iconography set

#### Style D: Circular/Radial Badges
- Each stat in its own circle/badge
- Arranged in a grid (2×3 or 3×2)
- Premium, modern feel
- Less common in classic Top Trumps but seen in modern card games

### Title Bar Variations

| Style | Description | Best For |
|-------|-------------|----------|
| **Solid color** | Flat colored bar, full width | Classic, any theme |
| **Gradient** | Two-tone gradient left-to-right or top-to-bottom | Modern, premium |
| **Textured** | Pattern/texture overlay (stone, metal, wood) | Themed packs |
| **Transparent overlay** | Semi-transparent bar over image top | Full-bleed image designs |
| **Banner/ribbon** | Shaped like a banner or ribbon | Fantasy, medieval themes |
| **Tab** | Small tab extending from image frame | Minimalist designs |

### Image Frame Styles

| Style | Description | Packs Using |
|-------|-------------|-------------|
| **Simple rectangle** | Sharp corners, thin border | Classic packs |
| **Rounded rectangle** | 4-8px radius, modern feel | Animal packs, modern editions |
| **Double border** | Outer thin + inner thick frame | Premium/collector editions |
| **Themed frame** | Custom shape matching theme | Dinosaurs (stone), Cars (chrome) |
| **Full bleed** | No frame, image to card edges | Limited/special editions |
| **Polaroid** | Extra space below image for text | Retro/nostalgia packs |
| **Hexagonal/custom shape** | Non-rectangular image mask | Sci-fi, modern packs |

### Category Badges / Icons

- **Position**: Usually between image and stats, or overlapping image bottom
- **Shape**: Circle, rounded rectangle, shield, or themed shape
- **Content**: Category name (e.g., "PREDATOR", "SUPERCAR") or icon
- **Color**: Accent color from pack palette
- **Size**: Small (10-15% of card width)
- Common in licensed packs to indicate sub-categories within a set

### Card Numbering Systems

| System | Format | Example |
|--------|--------|---------|
| **X of Y** | "12 of 30" | Most common |
| **Hash number** | "#12" | Clean, minimal |
| **Fraction** | "12/30" | Compact |
| **None** | — | Some modern packs |
| **Sequential only** | "12" | When total is known |

- Position: Top-right corner of title bar, or bottom-left footer

### Back Designs — Common Patterns

| Pattern | Description |
|---------|-------------|
| **Centered logo** | Top Trumps + pack logo centered, solid/gradient background |
| **Tiled pattern** | Repeating themed icons/symbols across entire back |
| **Collage** | Small images of all cards arranged in mosaic |
| **Dynamic artwork** | Full-bleed themed illustration |
| **Geometric pattern** | Abstract shapes in pack colors |
| **Textured solid** | Single color with texture (carbon fiber, leather, etc.) |

---

## 6. Competitive Features for DeckForge

### Market Gap Analysis

The official My Top Trumps service is **currently offline**. Existing alternatives are either:
- **Too basic** (PersonalisedPlayingCards — clunky UI, card-by-card only)
- **Not self-service** (Ivory — must work with their team)
- **Generic** (MakePlayingCards — not Top Trumps-specific)
- **Paper-only** (Twinkl — educational templates)

**DeckForge has a clear opportunity to become THE Top Trumps creator.**

### Must-Have Features

#### 1. Theme Generator / Template System
- **Pre-built themes**: 15-20 curated themes (Animals, Sports, Vehicles, Fantasy, Sci-Fi, Historical, etc.)
- **Each theme includes**: Color palette, title bar style, image frame, stat bar style, font pairing, back design
- **One-click theme switching**: Change entire deck appearance without losing content
- **Custom theme builder**: Power users can create their own themes from components

#### 2. Smart Layout Engine
- **Auto-layout**: Automatically adjusts for 4-8 stat categories
- **Dynamic text sizing**: Title auto-scales based on name length
- **Image auto-framing**: Smart crop suggestions based on subject detection
- **Responsive stat area**: Adjusts row height based on number of stats

#### 3. Batch Operations
- **CSV/spreadsheet import**: Upload all card data at once (name, image URL, stat values)
- **Bulk image upload**: Drag-drop folder of images, auto-assign to cards
- **Batch stat editing**: Modify a category name across all cards at once
- **Duplicate card**: Clone and modify
- **Reorder deck**: Drag-and-drop card ordering
- **Bulk theme change**: Apply new theme to entire deck instantly

#### 4. Print-Ready Output
- **PDF export**: 300 DPI, CMYK, with bleed marks and crop marks
- **Cut sheet layouts**: Multiple cards per A4/Letter sheet with registration marks
- **Individual card export**: PNG/SVG per card for digital use
- **Print-on-demand integration**: Direct ordering through partner printers
- **Card size options**: Standard 62×100mm, poker size, custom sizes

#### 5. Digital-First Features
- **Live preview**: Real-time card preview as you edit
- **Card flip animation**: Preview front and back
- **Deck slideshow**: Flip through entire deck
- **Share link**: Public URL to view deck (read-only)
- **Embed widget**: Embed interactive deck viewer on websites
- **Play mode**: Browser-based Top Trumps gameplay with your custom deck

#### 6. Collaboration
- **Shared decks**: Multiple editors on one deck
- **Comment/feedback**: Leave notes on specific cards
- **Version history**: Undo/compare previous versions
- **Fork/remix**: Clone someone's public deck and customize

#### 7. AI-Powered Features
- **Auto-stat generation**: Given a topic, AI suggests appropriate categories and values
- **Image generation**: AI-generated illustrations for cards
- **Stat balancing**: AI analyzes deck balance (no single overpowered card)
- **Theme suggestion**: AI recommends theme based on card content
- **Description generation**: Auto-generate card flavor text/bios

#### 8. Quality-of-Life
- **Undo/redo**: Full history
- **Autosave**: Never lose work
- **Templates gallery**: Community-shared templates
- **Card preview grid**: See all cards at once (thumbnail view)
- **Stat comparison view**: Table/spreadsheet view of all stats across all cards
- **Accessibility**: Color blind safe themes, screen reader compatible

### Feature Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Theme system (pre-built) | ⭐⭐⭐⭐⭐ | Medium | P0 |
| CSV import / batch data | ⭐⭐⭐⭐⭐ | Low | P0 |
| Live card preview | ⭐⭐⭐⭐⭐ | Medium | P0 |
| Print-ready PDF export | ⭐⭐⭐⭐ | Medium | P0 |
| Auto-layout engine | ⭐⭐⭐⭐ | High | P1 |
| Share/embed deck | ⭐⭐⭐⭐ | Medium | P1 |
| AI stat generation | ⭐⭐⭐ | Medium | P1 |
| Collaboration | ⭐⭐⭐ | High | P2 |
| Play mode | ⭐⭐⭐⭐ | High | P2 |
| Print-on-demand integration | ⭐⭐⭐⭐ | High | P2 |
| AI image generation | ⭐⭐⭐ | Medium | P2 |
| Stat balancing AI | ⭐⭐ | Medium | P3 |
| Community templates | ⭐⭐⭐ | Medium | P3 |

### Monetization Opportunities

| Tier | Price | Includes |
|------|-------|----------|
| **Free** | $0 | 1 deck, basic themes, watermarked export |
| **Pro** | $8/mo | Unlimited decks, all themes, unwatermarked PDF, CSV import |
| **Print** | Per-order | Physical print-on-demand fulfillment |
| **Team** | $20/mo | Collaboration, shared workspace |
| **Enterprise** | Custom | Branded templates, API access, bulk printing |

---

## Appendix A: Resource Links

- Card anatomy (general): https://fantastic-factories.medium.com/anatomy-of-a-card-840cdc2404c1
- Trump card sizing: https://www.playingcardspersonalised.co.uk/custom-trump-cards (62mm × 100mm confirmed)
- Playing card size guide: https://spingold.co.uk/the-ultimate-guide-to-playing-card-sizes/
- Ivory Graphics custom trumps: https://www.ivory.co.uk/custom-trumps
- PersonalisedPlayingCards creator: https://cardcreator.personalisedplayingcards.com/trump-creator/
- MakePlayingCards trumps: https://www.makeplayingcards.com/promotional/personalised-trump-cards.html
- Top Trumps USA (all packs): https://us.toptrumps.com/collections/top-trumps-all-packs
- Print specs (bleed/safe zone): https://www.butterflygp.com/magazine/essential-print-design-terminology-safe-zone-trim-and-bleed-lines-explained/

## Appendix B: Standard Top Trumps Stat Scales

| Scale Type | Range | Used In |
|-----------|-------|---------|
| 1-100 | Integer | Superheroes, general ratings |
| 1-10 | Integer or decimal | Smaller scales, subjective ratings |
| Real units | Varies | Vehicles (mph, kg, cc), Animals (cm, kg, years) |
| Percentage | 0-100% | Comparative stats |
| Year | e.g., 1990-2025 | Historical, debut year |
| Currency | e.g., £50,000 | Price, value, salary |
| Custom text | "Legendary", "S-Tier" | Narrative/descriptive (rare, hard to compare) |

---

*Research compiled for DeckForge product overhaul. Last updated: 2026-02-26.*
