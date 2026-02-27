/**
 * AI Prompt Bank for generating card component assets.
 *
 * IMPORTANT: All prompts should produce images on a WHITE BACKGROUND
 * since most generators can't produce true alpha/transparency.
 * Users can remove the white background in Photoshop/GIMP after.
 *
 * Usage: Pick a prompt, optionally customize the theme/style keywords,
 * paste into your image generator (Midjourney, DALL-E, Stable Diffusion, etc.)
 */

export interface PromptTemplate {
  id: string
  name: string
  description: string
  prompt: string
  /** Keywords user can replace to customize */
  customizable: string[]
  /** Recommended image dimensions */
  dimensions: { width: number; height: number }
  /** What component type this produces */
  componentType: 'stat-bar' | 'title' | 'image-frame' | 'badge' | 'decoration' | 'background' | 'border' | 'texture'
}

export interface PromptCategory {
  id: string
  name: string
  icon: string
  description: string
  templates: PromptTemplate[]
}

const SUFFIX = ', isolated on plain white background, clean edges, PNG asset style, no text, no watermark'

export const PROMPT_BANK: PromptCategory[] = [
  {
    id: 'card-backgrounds',
    name: 'Card Backgrounds',
    icon: '🎴',
    description: 'Full card background designs with borders and framing',
    templates: [
      {
        id: 'bg-fantasy',
        name: 'Fantasy Card Frame',
        description: 'Ornate fantasy-themed card with decorative border',
        prompt: `Top Trumps style card frame, ornate fantasy medieval border, gold filigree corners, dark [THEME_COLOR] gradient center area, decorative header banner area at top, stat rows area at bottom, portrait orientation 63x88mm ratio${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 630, height: 880 },
        componentType: 'background'
      },
      {
        id: 'bg-scifi',
        name: 'Sci-Fi Card Frame',
        description: 'Futuristic HUD-style card frame',
        prompt: `Top Trumps style card frame, futuristic sci-fi HUD interface design, glowing [THEME_COLOR] neon edges, tech circuit patterns, holographic overlay style, dark metallic background, portrait 63x88mm ratio${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 630, height: 880 },
        componentType: 'background'
      },
      {
        id: 'bg-sports',
        name: 'Sports Card Frame',
        description: 'Dynamic sports-themed card with action lines',
        prompt: `Top Trumps style sports trading card frame, dynamic diagonal lines, bold [THEME_COLOR] and black color scheme, stadium spotlight effects, energetic design, portrait 63x88mm ratio${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 630, height: 880 },
        componentType: 'background'
      },
      {
        id: 'bg-nature',
        name: 'Nature Card Frame',
        description: 'Organic nature-themed card with botanical elements',
        prompt: `Top Trumps style card frame, botanical leaf and vine border decorations, earthy [THEME_COLOR] tones, watercolor texture, nature wildlife theme, organic shapes, portrait 63x88mm ratio${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 630, height: 880 },
        componentType: 'background'
      },
      {
        id: 'bg-retro',
        name: 'Retro / Vintage Card',
        description: 'Classic vintage trading card style',
        prompt: `Top Trumps style vintage retro trading card frame, aged paper texture, classic 1980s card game border, [THEME_COLOR] and cream colors, nostalgic design, portrait 63x88mm ratio${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 630, height: 880 },
        componentType: 'background'
      },
      {
        id: 'bg-comic',
        name: 'Comic Book Card',
        description: 'Bold comic book art style card',
        prompt: `Top Trumps style comic book trading card frame, halftone dots, bold black outlines, pow/zap star burst elements, [THEME_COLOR] and yellow, pop art style, portrait 63x88mm ratio${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 630, height: 880 },
        componentType: 'background'
      },
      {
        id: 'bg-minimalist',
        name: 'Modern Minimalist',
        description: 'Clean modern card with subtle accents',
        prompt: `Top Trumps style modern minimalist card frame, clean lines, subtle [THEME_COLOR] accent, large white space, geometric elements, premium luxury feel, portrait 63x88mm ratio${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 630, height: 880 },
        componentType: 'background'
      }
    ]
  },
  {
    id: 'stat-bars',
    name: 'Stat Bars',
    icon: '📊',
    description: 'Individual stat row backgrounds for stats display',
    templates: [
      {
        id: 'stat-gradient',
        name: 'Gradient Stat Bar',
        description: 'Sleek gradient bar with rounded ends',
        prompt: `Single horizontal stat bar element for card game, rounded pill shape, gradient from [THEME_COLOR] to darker shade, metallic sheen, 54x8mm ratio, game UI element${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 540, height: 80 },
        componentType: 'stat-bar'
      },
      {
        id: 'stat-tech',
        name: 'Tech HUD Stat Bar',
        description: 'Sci-fi styled stat bar with digital elements',
        prompt: `Single horizontal stat bar for sci-fi card game, digital HUD style, glowing [THEME_COLOR] fill, tech grid marks, progress bar look, 54x8mm ratio${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 540, height: 80 },
        componentType: 'stat-bar'
      },
      {
        id: 'stat-ornate',
        name: 'Ornate Stat Bar',
        description: 'Decorative medieval-style stat bar',
        prompt: `Single horizontal stat bar for fantasy card game, ornate medieval banner style, gold [THEME_COLOR] metallic, decorative end caps, scroll work, 54x8mm ratio${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 540, height: 80 },
        componentType: 'stat-bar'
      },
      {
        id: 'stat-comic',
        name: 'Comic Stat Bar',
        description: 'Bold comic-style stat bar',
        prompt: `Single horizontal stat bar for comic card game, bold [THEME_COLOR] with black outline, halftone shading, chunky rounded shape, 54x8mm ratio${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 540, height: 80 },
        componentType: 'stat-bar'
      }
    ]
  },
  {
    id: 'title-banners',
    name: 'Title Banners',
    icon: '🏷️',
    description: 'Decorative title/header banner elements',
    templates: [
      {
        id: 'title-ribbon',
        name: 'Ribbon Banner',
        description: 'Classic ribbon/scroll banner for card title',
        prompt: `Decorative ribbon banner scroll for card game title, [THEME_COLOR] silk ribbon with folded ends, 3D depth, elegant typography area, 54x12mm ratio${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 540, height: 120 },
        componentType: 'title'
      },
      {
        id: 'title-shield',
        name: 'Shield Banner',
        description: 'Heraldic shield-shaped title area',
        prompt: `Heraldic shield shape banner for card game name, [THEME_COLOR] metallic with gold trim, crest style, ornate frame, 40x15mm ratio${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 400, height: 150 },
        componentType: 'title'
      },
      {
        id: 'title-modern',
        name: 'Modern Title Bar',
        description: 'Clean modern header bar',
        prompt: `Modern sleek title bar for card game header, gradient [THEME_COLOR] to transparent, clean geometric shape, subtle glow, 54x10mm ratio${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 540, height: 100 },
        componentType: 'title'
      },
      {
        id: 'title-neon',
        name: 'Neon Title Bar',
        description: 'Glowing neon-style header',
        prompt: `Neon glowing title bar for card game, [THEME_COLOR] neon tube outline, dark background behind, retro 80s synthwave style, 54x10mm ratio${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 540, height: 100 },
        componentType: 'title'
      }
    ]
  },
  {
    id: 'image-frames',
    name: 'Image Frames',
    icon: '🖼️',
    description: 'Decorative frames for the card character/subject image',
    templates: [
      {
        id: 'frame-portal',
        name: 'Magic Portal Frame',
        description: 'Circular glowing portal frame',
        prompt: `Circular magical portal frame for card game character image, glowing [THEME_COLOR] energy ring, mystical runes around edge, ethereal glow, 40x40mm ratio${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 400, height: 400 },
        componentType: 'image-frame'
      },
      {
        id: 'frame-ornate-rect',
        name: 'Ornate Rectangle Frame',
        description: 'Decorative rectangular picture frame',
        prompt: `Ornate decorative rectangular picture frame for card game, [THEME_COLOR] and gold, baroque corner details, inner shadow, 50x35mm ratio${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 500, height: 350 },
        componentType: 'image-frame'
      },
      {
        id: 'frame-hexagon',
        name: 'Hexagon Frame',
        description: 'Modern hexagonal frame',
        prompt: `Hexagonal frame for card game character image, metallic [THEME_COLOR] edges, tech/modern style, clean geometric, 40x35mm ratio${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 400, height: 350 },
        componentType: 'image-frame'
      },
      {
        id: 'frame-torn',
        name: 'Torn Paper Frame',
        description: 'Ripped/torn paper edge frame',
        prompt: `Torn ripped paper edge frame for card game image area, rough organic edges, [THEME_COLOR] paper color, vintage worn texture, 50x35mm ratio${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 500, height: 350 },
        componentType: 'image-frame'
      }
    ]
  },
  {
    id: 'badges',
    name: 'Badges & Emblems',
    icon: '🏅',
    description: 'Circular badges, crests, and rank indicators',
    templates: [
      {
        id: 'badge-crest',
        name: 'Team Crest',
        description: 'Heraldic crest/shield badge',
        prompt: `Heraldic crest shield badge for card game, [THEME_COLOR] and gold, lion/eagle emblem, ornate border, 15x15mm ratio${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 150, height: 150 },
        componentType: 'badge'
      },
      {
        id: 'badge-rank',
        name: 'Rank Number Badge',
        description: 'Numbered rank/position badge',
        prompt: `Circular numbered rank badge for card game, [THEME_COLOR] metallic with gold number area, star/laurel decoration, 12x12mm ratio${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 120, height: 120 },
        componentType: 'badge'
      },
      {
        id: 'badge-star',
        name: 'Star Badge',
        description: 'Star-shaped quality/rating badge',
        prompt: `Star shaped badge for card game rating, [THEME_COLOR] gradient fill, metallic shine, 5-pointed star, clean design, 15x15mm ratio${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 150, height: 150 },
        componentType: 'badge'
      }
    ]
  },
  {
    id: 'decorations',
    name: 'Decorative Elements',
    icon: '✨',
    description: 'Dividers, corners, and accent pieces',
    templates: [
      {
        id: 'deco-divider',
        name: 'Ornate Divider',
        description: 'Horizontal decorative divider line',
        prompt: `Ornate horizontal decorative divider line for card game, [THEME_COLOR] and gold, scrollwork pattern, symmetrical, 50x5mm ratio${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 500, height: 50 },
        componentType: 'decoration'
      },
      {
        id: 'deco-corners',
        name: 'Corner Decorations',
        description: 'Ornamental corner piece (use 4x rotated)',
        prompt: `Single ornamental corner decoration for card game, [THEME_COLOR] and gold filigree, L-shaped design, baroque style, 10x10mm ratio${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 100, height: 100 },
        componentType: 'decoration'
      },
      {
        id: 'deco-info-bg',
        name: 'Info Box Background',
        description: 'Styled background for description/fact text',
        prompt: `Rectangular information box background for card game fact file section, [THEME_COLOR] tinted semi-transparent parchment style, subtle border, 50x20mm ratio${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 500, height: 200 },
        componentType: 'decoration'
      }
    ]
  },
  {
    id: 'textures',
    name: 'Textures & Patterns',
    icon: '🎨',
    description: 'Tileable textures and patterns for backgrounds',
    templates: [
      {
        id: 'tex-metal',
        name: 'Brushed Metal',
        description: 'Metallic brushed texture',
        prompt: `Seamless tileable brushed metal texture, [THEME_COLOR] tinted, subtle directional grain, premium finish${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 512, height: 512 },
        componentType: 'texture' as any
      },
      {
        id: 'tex-parchment',
        name: 'Parchment Paper',
        description: 'Aged paper/parchment texture',
        prompt: `Seamless tileable aged parchment paper texture, [THEME_COLOR] tinted, subtle stains and creases, vintage feel${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 512, height: 512 },
        componentType: 'texture' as any
      },
      {
        id: 'tex-carbon',
        name: 'Carbon Fiber',
        description: 'Carbon fiber weave pattern',
        prompt: `Seamless tileable carbon fiber weave texture, dark [THEME_COLOR] tint, reflective highlights, premium sports car feel${SUFFIX}`,
        customizable: ['THEME_COLOR'],
        dimensions: { width: 512, height: 512 },
        componentType: 'texture' as any
      }
    ]
  }
]

/**
 * Format a prompt template with user's theme color
 */
export function formatPrompt(template: PromptTemplate, replacements: Record<string, string>): string {
  let result = template.prompt
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`\\[${key}\\]`, 'g'), value)
  }
  return result
}

/**
 * Get all templates flat
 */
export function getAllTemplates(): PromptTemplate[] {
  return PROMPT_BANK.flatMap((cat) => cat.templates)
}

/**
 * Custom prompt builder — wraps user's description with all the
 * technical specs needed for DeckForge compatibility.
 */
export interface CustomPromptConfig {
  type: 'card-background' | 'stat-bar' | 'title-banner' | 'image-frame' | 'badge' | 'decoration' | 'texture'
  userPrompt: string
  themeColor: string
}

const TYPE_SPECS: Record<CustomPromptConfig['type'], {
  label: string
  dimensions: string
  extraSpecs: string
}> = {
  'card-background': {
    label: 'Full Card Background',
    dimensions: 'portrait orientation, 63x88mm ratio (630x880px recommended)',
    extraSpecs: 'Leave clear areas for: title text at top, large image area in upper half, stat rows in lower half, description text area'
  },
  'stat-bar': {
    label: 'Stat Bar Element',
    dimensions: 'horizontal rectangle, 54x8mm ratio (540x80px recommended)',
    extraSpecs: 'Leave clear areas at left for label text and right for value number. Bar shape with rounded or styled ends'
  },
  'title-banner': {
    label: 'Title Banner',
    dimensions: 'wide horizontal, 54x12mm ratio (540x120px recommended)',
    extraSpecs: 'Large clear center area for title text overlay. Decorative edges/ends allowed'
  },
  'image-frame': {
    label: 'Image Frame',
    dimensions: 'roughly square or 4:3, 50x35mm ratio (500x350px recommended)',
    extraSpecs: 'Clear EMPTY center area where the card photo will be placed. Only design the border/frame around the edges'
  },
  'badge': {
    label: 'Badge / Emblem',
    dimensions: 'square, 15x15mm ratio (150x150px recommended)',
    extraSpecs: 'Small area in center for a number or short text overlay'
  },
  'decoration': {
    label: 'Decorative Element',
    dimensions: 'varies — dividers: 50x5mm (500x50px), corners: 10x10mm (100x100px)',
    extraSpecs: 'Pure decorative element, no text areas needed'
  },
  'texture': {
    label: 'Tileable Texture',
    dimensions: 'square, 512x512px recommended',
    extraSpecs: 'MUST be seamless/tileable. Pattern should repeat cleanly at all edges'
  }
}

/**
 * Build a complete prompt from user's custom description + component type.
 * Wraps with all DeckForge-compatible specs.
 */
export function buildCustomPrompt(config: CustomPromptConfig): string {
  const spec = TYPE_SPECS[config.type]
  const parts = [
    // What the user wants
    config.userPrompt.trim(),

    // Component type context
    `This is a ${spec.label.toLowerCase()} element for a Top Trumps style card game`,

    // Color
    config.themeColor ? `Primary color theme: ${config.themeColor}` : '',

    // Dimensions
    spec.dimensions,

    // Component-specific requirements
    spec.extraSpecs,

    // Universal DeckForge requirements
    'IMPORTANT REQUIREMENTS:',
    '- Isolated on plain WHITE background (not transparent, not colored)',
    '- Clean sharp edges suitable for cutting/masking',
    '- No text, letters, numbers, or words in the image (text will be overlaid digitally)',
    '- No watermarks or signatures',
    '- High detail, game-quality asset',
    '- Flat/digital art style works best (avoid photorealistic unless specifically wanted)',
    '- PNG style output, single isolated element'
  ].filter(Boolean)

  return parts.join('. ')
}

/**
 * Get the recommended dimensions for a component type
 */
export function getRecommendedDimensions(type: CustomPromptConfig['type']): { width: number; height: number } {
  const dims: Record<CustomPromptConfig['type'], { width: number; height: number }> = {
    'card-background': { width: 630, height: 880 },
    'stat-bar': { width: 540, height: 80 },
    'title-banner': { width: 540, height: 120 },
    'image-frame': { width: 500, height: 350 },
    'badge': { width: 150, height: 150 },
    'decoration': { width: 500, height: 50 },
    'texture': { width: 512, height: 512 }
  }
  return dims[type]
}
