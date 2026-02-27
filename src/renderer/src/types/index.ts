// ============================================================
// DeckForge Core Types
// ============================================================

// --- Units & Geometry ---

export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Rect extends Point, Size {}

export interface CardDimensions {
  /** Width in mm */
  width: number
  /** Height in mm */
  height: number
  /** Bleed area in mm (extends beyond trim) */
  bleed: number
  /** Corner radius in mm */
  cornerRadius: number
  /** DPI for export */
  dpi: number
}

// --- Layers (Canvas Elements) ---

export type LayerType = 'text' | 'image' | 'shape' | 'group' | 'component'

export interface BaseLayer {
  id: string
  type: LayerType
  name: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  visible: boolean
  locked: boolean
  /** If set, this layer's content is bound to a card data field */
  bindTo?: string
}

export interface TextLayer extends BaseLayer {
  type: 'text'
  text: string
  fontSize: number
  fontFamily: string
  fontWeight: string
  fontStyle: string
  fill: string
  align: 'left' | 'center' | 'right'
  verticalAlign: 'top' | 'middle' | 'bottom'
  lineHeight: number
  letterSpacing: number
  textDecoration: string
  stroke?: string
  strokeWidth?: number
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
}

export interface ImageLayer extends BaseLayer {
  type: 'image'
  /** Path to local image file or data URL */
  src: string
  /** How the image fits within bounds */
  fit: 'cover' | 'contain' | 'fill' | 'none'
  /** Image filters */
  filters: ImageFilters
}

export interface ImageFilters {
  brightness: number
  contrast: number
  saturation: number
  blur: number
  grayscale: boolean
}

export type ShapeKind = 'rect' | 'circle' | 'ellipse' | 'line' | 'polygon' | 'star'

export interface ShapeLayer extends BaseLayer {
  type: 'shape'
  shapeKind: ShapeKind
  fill: string
  stroke: string
  strokeWidth: number
  cornerRadius?: number
  /** For star/polygon */
  numPoints?: number
  innerRadius?: number
}

export interface GroupLayer extends BaseLayer {
  type: 'group'
  children: Layer[]
}

export interface ComponentLayer extends BaseLayer {
  type: 'component'
  /** Reference to a reusable component definition */
  componentId: string
  /** Override values for component slots */
  overrides: Record<string, unknown>
}

export type Layer = TextLayer | ImageLayer | ShapeLayer | GroupLayer | ComponentLayer

// --- Components (Reusable Elements) ---

export interface ComponentSlot {
  id: string
  name: string
  type: 'text' | 'image' | 'number'
  /** Position within the component (relative coords) */
  bounds: Rect
  /** Default value */
  defaultValue?: string | number
  /** Style overrides for text slots */
  style?: Partial<TextLayer>
}

export interface ComponentDefinition {
  id: string
  name: string
  description: string
  /** Size of the component in mm */
  width: number
  height: number
  /** Visual layers (the static design) */
  layers: Layer[]
  /** Dynamic data slots that can be bound to card data */
  slots: ComponentSlot[]
  /** Optional PSD source file path */
  psdSource?: string
  /** Thumbnail for the component library */
  thumbnail?: string
  createdAt: string
  updatedAt: string
}

// --- Card Data ---

export interface CardCategory {
  id: string
  name: string
  /** Min value for this stat */
  min: number
  /** Max value for this stat */
  max: number
  /** Unit label (e.g. "mph", "kg", "%") */
  unit?: string
  /** Higher is better? (for Top Trumps comparison) */
  higherIsBetter: boolean
}

export interface CardData {
  id: string
  /** Card name/title */
  name: string
  /** Card image path (local file or data URL) */
  image?: string
  /** Description / flavor text */
  description?: string
  /** Fun fact */
  funFact?: string
  /** Stat values keyed by category ID */
  stats: Record<string, number>
  /** Any extra custom fields */
  customFields: Record<string, string | number | boolean>
  /** AI-generated flag per field */
  aiGenerated: Record<string, boolean>
  createdAt: string
  updatedAt: string
}

// --- Templates ---

export interface CardTemplate {
  id: string
  name: string
  description: string
  /** Card face design layers */
  frontLayers: Layer[]
  /** Card back design layers (null = use deck default back) */
  backLayers: Layer[] | null
  /** Thumbnail preview */
  thumbnail?: string
  /** Tags for categorisation */
  tags: string[]
  /** Is this a built-in template? */
  builtIn: boolean
  createdAt: string
  updatedAt: string
}

// --- Deck ---

export interface Deck {
  id: string
  name: string
  description: string
  /** Card dimensions for this deck */
  dimensions: CardDimensions
  /** The stat categories for this deck */
  categories: CardCategory[]
  /** All cards in the deck */
  cards: CardData[]
  /** The card face template */
  frontTemplate: CardTemplate
  /** The card back template (shared across all cards) */
  backTemplate: CardTemplate
  /** Reusable components used in this deck */
  components: ComponentDefinition[]
  /** Deck-level custom CSS variables / theme */
  theme: DeckTheme
  createdAt: string
  updatedAt: string
}

export interface DeckTheme {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  accentColor: string
  fontFamily: string
  headingFontFamily: string
}

// --- Export / Print ---

export interface PrintSettings {
  /** Paper size */
  paperSize: 'a4' | 'a3' | 'letter' | 'custom'
  customPaperWidth?: number  // mm
  customPaperHeight?: number // mm
  /** Orientation */
  orientation: 'portrait' | 'landscape'
  /** Show trim marks */
  trimMarks: boolean
  /** Show bleed area */
  showBleed: boolean
  /** Cards per page (auto-calculated or override) */
  cardsPerPage?: number
  /** Spacing between cards in mm */
  cardSpacing: number
  /** Export DPI */
  dpi: number
  /** Front/back alignment offset for double-sided printing */
  frontOffset: Point
  backOffset: Point
  /** Export format */
  format: 'pdf' | 'png' | 'jpeg'
  /** JPEG quality (0-100) */
  jpegQuality: number
  /** Generate test sheet with card outlines only */
  testSheet: boolean
}

// --- AI Settings ---

export type AIProvider = 'gemini' | 'ollama' | 'openai' | 'custom'
export type AITask = 'text' | 'image' | 'vision' | 'stats'

export interface AIProviderConfig {
  id: string
  provider: AIProvider
  name: string
  enabled: boolean
  /** API key (for cloud providers) */
  apiKey?: string
  /** Base URL (for Ollama/custom) */
  baseUrl?: string
  /** Model name for text generation */
  textModel: string
  /** Model name for image generation */
  imageModel?: string
  /** Model name for vision tasks */
  visionModel?: string
}

export interface AISettings {
  providers: AIProviderConfig[]
  /** Default provider for each task type */
  defaults: Record<AITask, string>  // provider config ID
}

// --- App State ---

export type EditorMode = 'select' | 'text' | 'shape' | 'image' | 'pan' | 'zoom'
export type EditorView = 'design' | 'data' | 'score' | 'export' | 'settings'

export interface EditorState {
  /** Current view/tab */
  view: EditorView
  /** Current editor mode/tool */
  mode: EditorMode
  /** Currently open deck */
  currentDeck: Deck | null
  /** Currently selected card (for data editing) */
  selectedCardId: string | null
  /** Which side is being edited */
  editingSide: 'front' | 'back'
  /** Selected layer IDs */
  selectedLayerIds: string[]
  /** Last selected layer (for persistent properties panel) */
  lastSelectedLayerId: string | null
  /** Zoom level (1 = 100%) */
  zoom: number
  /** Canvas pan offset */
  panOffset: Point
  /** Snap to grid */
  snapToGrid: boolean
  /** Snap to other elements */
  snapToElements: boolean
  /** Snap to canvas center and edges */
  snapToCanvas: boolean
  /** Grid size in px */
  gridSize: number
  /** Show rulers */
  showRulers: boolean
  /** Show guides */
  showGuides: boolean
  /** Show layout guides overlay */
  showLayoutGuides: boolean
}
