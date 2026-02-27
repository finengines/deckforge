# 🚀 Quick Start: Your First Top Trumps Pack

This guide walks you through creating a complete Top Trumps pack in DeckForge — from blank deck to printed cards.

**Time needed:** ~15 minutes for a basic pack

---

## Step 1: Create a New Deck

1. Launch DeckForge
2. On the Welcome Screen, click **"Create New Deck"**
3. Enter a name (e.g., "World's Best Dogs")
4. Click **Create**

Your new deck opens in the **Design** view.

---

## Step 2: Choose a Template

1. In the toolbar, make sure you're on the **Design** tab
2. Look at the **Templates** section (or press the template picker button)
3. Browse the 12 built-in themes:
   - **Classic TT** — Traditional red/blue Top Trumps look
   - **Sports Star** — Green gradient, athletic vibe
   - **Animals** — Nature tones, organic feel
   - **Speed Machines** — Dark with racing accents
   - **Superheroes** — Bold, comic-book style
   - **Space** — Deep blue with star accents
   - **History** — Parchment/vintage style
   - **Food** — Warm, appetizing colors
   - **Music** — Purple/neon, modern
   - **Kids Cartoon** — Bright, playful
   - **Photo Minimal** — Clean white, photo-focused
   - **Premium Gold** — Black and gold, luxury
4. Click a template to apply it

The template sets up the card layout with pre-configured zones for title, image, stats, and more.

---

## Step 3: Add Your Cards

1. Switch to the **Data** tab in the toolbar
2. Click **"+ Add Card"** to add a new card
3. Fill in the card name (e.g., "Golden Retriever")
4. Repeat for all cards in your pack (aim for 30-32 for a standard pack)

**Pro tip:** Use **📥 Import** to bulk-add cards from a CSV file!

### CSV Format

```csv
Name,Description,Fun Fact
Golden Retriever,The ultimate family companion,Can carry an egg in their mouth without breaking it
German Shepherd,Intelligent and versatile working dog,Can learn a new command in under 5 repetitions
Husky,Born to run in the coldest conditions,Can run 150 miles per day
```

---

## Step 4: Set Up Stat Categories

Still in the **Data** tab:

1. Click **"+ Add Stat Category"**
2. Name it (e.g., "Friendliness")
3. Set min/max range (e.g., 0-100)
4. Add a unit if needed (e.g., "/100")
5. Repeat for 5-6 categories

**Example categories for a Dogs pack:**
| Category | Min | Max | Higher is Better |
|----------|-----|-----|-----------------|
| Friendliness | 0 | 100 | ✅ |
| Intelligence | 0 | 100 | ✅ |
| Energy Level | 0 | 100 | ✅ |
| Size | 0 | 100 | ❌ (varies!) |
| Grooming Need | 0 | 100 | ❌ |

---

## Step 5: Enter Stats (The Fun Part!)

Switch to the **Score** tab for the tinder-style stat entry:

1. Each card appears one at a time with its name and image
2. Use the **sliders** to set stat values (red → yellow → green)
3. Use **keyboard arrows** to navigate between cards
4. The **balance chart** shows if your stats are well-distributed
5. **Shuffle** to randomize card order for fresh perspective

💡 **This is designed to do with a friend!** Great for when you and your brother are building a pack together.

---

## Step 6: AI Content (Optional)

Switch back to **Design** and open the **AI Panel**:

### Generate Descriptions
1. Select a card
2. Click **"Generate Description"** — AI writes a 2-3 sentence bio
3. Click **"Generate Fun Fact"** — AI writes a surprising fact
4. Review and edit if needed

### Batch Generate
1. Click **"🤖 Batch AI Generation"**
2. Check what to generate (descriptions, fun facts, stats)
3. Set rate limiting delay (1000ms is safe)
4. Click **"Generate for All Cards"**
5. AI processes each card — watch the progress bar!

### Image-Based Descriptions
If your cards have images:
1. Select a card with an image
2. Click **"Describe from Image"**
3. AI analyzes the photo and generates contextual name, description, stats

**Setup:** Add your API key in Settings → AI Providers → Gemini

---

## Step 7: Customize Your Design

Back in the **Design** tab:

### Using Components
1. Open the **Components** panel (right side)
2. Browse presets by category (stat bars, title bars, frames, badges)
3. Click any preset to add it to the canvas
4. Select and customize (colors, sizes, fonts)

### Manual Design
- **Text tool (T):** Click canvas to add text
- **Shape tool (R):** Click canvas to add rectangles
- **Image tool (I):** Click canvas to add images from file
- **Select tool (V):** Click layers to select and move/resize

### Layout Guides
- Click **📐 Guides** in the toolbar to toggle zone overlays
- Shows the 5 standard Top Trumps zones (title, image, description, stats, footer)
- Includes safe zone, center crosshair, and rule of thirds

---

## Step 8: Export & Print

Switch to the **Export** tab:

### PDF Export (Recommended for Printing)
1. Choose paper size (A4 recommended)
2. Set DPI (300 for professional quality)
3. Toggle options:
   - ✅ **Trim marks** — Shows where to cut
   - ✅ **Bleed** — Extends colors past trim line
   - ✅ **Double-sided** — Generates back sides on alternating pages
4. Click **"Export PDF"**

### Test Sheet
Before printing your final deck:
1. Click **"Generate Test Sheet"**
2. Print the test sheet
3. Check alignment and colors
4. Adjust offset if needed (for double-sided alignment)

### Image Export
- Export individual cards as PNG or JPEG
- Great for sharing digitally or social media

### Cut Guide
- Generate a dedicated cut guide PDF
- Shows outlines only for easy cutting reference

---

## Tips for Great Packs

### Balance Your Stats
- Use **⚖️ Balance Stats** in the Data tab
- AI analyzes your deck and suggests adjustments
- Aim for: no card dominates ALL categories
- Every card should be "best at" at least one thing
- This makes gameplay more fun and unpredictable

### Card Count
- **30-32 cards** is the standard Top Trumps pack size
- Minimum 20 for a good game
- Maximum ~50 before it gets unwieldy

### Stat Design
- **5-6 categories** is the sweet spot
- Mix "higher is better" and "lower is better" categories for variety
- Use real data where possible (makes learning fun!)
- Add units for context (km/h, kg, years, etc.)

### Image Quality
- Use high-resolution images (at least 600×900px)
- Consistent style across all cards looks best
- AI image generation can create artwork if you don't have photos

### Have Fun!
Remember — Top Trumps is about **fun**. Don't stress about perfection. The best packs are the ones you enjoy making and playing with!

---

## What's Next?

- **Share your pack:** Export as `.deckforge` file to share with friends
- **Print professionally:** Use the PDF export with a local print shop
- **Create variations:** Duplicate your deck and try different themes
- **Custom components:** Import designs from Photoshop — see [Component Editor Guide](component-editor-guide.md)
