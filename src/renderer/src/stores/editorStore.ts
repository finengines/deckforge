import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { temporal } from 'zundo'
import { v4 as uuid } from 'uuid'
import type {
  EditorState,
  EditorView,
  EditorMode,
  Deck,
  CardData,
  Layer,
  Point,
  CardCategory,
  CardDimensions,
  DeckTheme,
  CardTemplate
} from '../types'

// Default card dimensions (standard Top Trumps)
const DEFAULT_DIMENSIONS: CardDimensions = {
  width: 62,
  height: 100,
  bleed: 3,
  cornerRadius: 3,
  dpi: 300
}

const DEFAULT_THEME: DeckTheme = {
  primaryColor: '#1a1a2e',
  secondaryColor: '#16213e',
  backgroundColor: '#0f3460',
  textColor: '#ffffff',
  accentColor: '#e94560',
  fontFamily: 'Inter, sans-serif',
  headingFontFamily: 'Inter, sans-serif'
}

const createEmptyTemplate = (name: string): CardTemplate => ({
  id: uuid(),
  name,
  description: '',
  frontLayers: [],
  backLayers: null,
  tags: [],
  builtIn: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

interface EditorStore extends EditorState {
  // --- View ---
  setView: (view: EditorView) => void
  setMode: (mode: EditorMode) => void

  // --- Deck ---
  createDeck: (name: string, description?: string) => void
  loadDeck: (deck: Deck) => void
  closeDeck: () => void
  updateDeckName: (name: string) => void
  updateDeckDescription: (desc: string) => void
  updateDimensions: (dims: Partial<CardDimensions>) => void
  updateTheme: (theme: Partial<DeckTheme>) => void

  // --- Categories ---
  addCategory: (category: Omit<CardCategory, 'id'>) => void
  updateCategory: (id: string, updates: Partial<CardCategory>) => void
  removeCategory: (id: string) => void
  reorderCategories: (ids: string[]) => void

  // --- Cards ---
  addCard: (card?: Partial<CardData>) => void
  updateCard: (id: string, updates: Partial<CardData>) => void
  removeCard: (id: string) => void
  selectCard: (id: string | null) => void
  duplicateCard: (id: string) => void

  // --- Layers ---
  addLayer: (layer: Layer) => void
  updateLayer: (id: string, updates: Partial<Layer>) => void
  removeLayer: (id: string) => void
  selectLayers: (ids: string[]) => void
  reorderLayers: (ids: string[]) => void
  duplicateLayer: (id: string) => void

  // --- Canvas ---
  setZoom: (zoom: number) => void
  setPanOffset: (offset: Point) => void
  setEditingSide: (side: 'front' | 'back') => void
  toggleSnapToGrid: () => void
  setGridSize: (size: number) => void
  toggleRulers: () => void
  toggleGuides: () => void
}

export const useEditorStore = create<EditorStore>()(
  temporal(
    immer((set, _get) => ({
      // Initial state
      view: 'design' as EditorView,
      mode: 'select' as EditorMode,
      currentDeck: null,
      selectedCardId: null,
      editingSide: 'front' as const,
      selectedLayerIds: [],
      zoom: 1,
      panOffset: { x: 0, y: 0 },
      snapToGrid: true,
      gridSize: 10,
      showRulers: true,
      showGuides: true,

      // --- View ---
      setView: (view) =>
        set((s) => {
          s.view = view
        }),
      setMode: (mode) =>
        set((s) => {
          s.mode = mode
        }),

      // --- Deck ---
      createDeck: (name, description = '') =>
        set((s) => {
          s.currentDeck = {
            id: uuid(),
            name,
            description,
            dimensions: { ...DEFAULT_DIMENSIONS },
            categories: [],
            cards: [],
            frontTemplate: createEmptyTemplate('Front'),
            backTemplate: createEmptyTemplate('Back'),
            components: [],
            theme: { ...DEFAULT_THEME },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          s.selectedCardId = null
          s.selectedLayerIds = []
        }),

      loadDeck: (deck) =>
        set((s) => {
          s.currentDeck = deck
          s.selectedCardId = deck.cards[0]?.id ?? null
          s.selectedLayerIds = []
        }),

      closeDeck: () =>
        set((s) => {
          s.currentDeck = null
          s.selectedCardId = null
          s.selectedLayerIds = []
        }),

      updateDeckName: (name) =>
        set((s) => {
          if (s.currentDeck) s.currentDeck.name = name
        }),

      updateDeckDescription: (desc) =>
        set((s) => {
          if (s.currentDeck) s.currentDeck.description = desc
        }),

      updateDimensions: (dims) =>
        set((s) => {
          if (s.currentDeck) Object.assign(s.currentDeck.dimensions, dims)
        }),

      updateTheme: (theme) =>
        set((s) => {
          if (s.currentDeck) Object.assign(s.currentDeck.theme, theme)
        }),

      // --- Categories ---
      addCategory: (cat) =>
        set((s) => {
          if (!s.currentDeck) return
          s.currentDeck.categories.push({ ...cat, id: uuid() })
        }),

      updateCategory: (id, updates) =>
        set((s) => {
          if (!s.currentDeck) return
          const cat = s.currentDeck.categories.find((c) => c.id === id)
          if (cat) Object.assign(cat, updates)
        }),

      removeCategory: (id) =>
        set((s) => {
          if (!s.currentDeck) return
          s.currentDeck.categories = s.currentDeck.categories.filter((c) => c.id !== id)
          // Also remove from all cards
          for (const card of s.currentDeck.cards) {
            delete card.stats[id]
          }
        }),

      reorderCategories: (ids) =>
        set((s) => {
          if (!s.currentDeck) return
          const map = new Map(s.currentDeck.categories.map((c) => [c.id, c]))
          s.currentDeck.categories = ids.map((id) => map.get(id)!).filter(Boolean)
        }),

      // --- Cards ---
      addCard: (partial) =>
        set((s) => {
          if (!s.currentDeck) return
          const card: CardData = {
            id: uuid(),
            name: partial?.name ?? 'New Card',
            image: partial?.image,
            description: partial?.description ?? '',
            funFact: partial?.funFact ?? '',
            stats: partial?.stats ?? {},
            customFields: partial?.customFields ?? {},
            aiGenerated: partial?.aiGenerated ?? {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          s.currentDeck.cards.push(card)
          s.selectedCardId = card.id
        }),

      updateCard: (id, updates) =>
        set((s) => {
          if (!s.currentDeck) return
          const card = s.currentDeck.cards.find((c) => c.id === id)
          if (card) {
            Object.assign(card, updates, { updatedAt: new Date().toISOString() })
          }
        }),

      removeCard: (id) =>
        set((s) => {
          if (!s.currentDeck) return
          s.currentDeck.cards = s.currentDeck.cards.filter((c) => c.id !== id)
          if (s.selectedCardId === id) {
            s.selectedCardId = s.currentDeck.cards[0]?.id ?? null
          }
        }),

      selectCard: (id) =>
        set((s) => {
          s.selectedCardId = id
        }),

      duplicateCard: (id) =>
        set((s) => {
          if (!s.currentDeck) return
          const card = s.currentDeck.cards.find((c) => c.id === id)
          if (!card) return
          const clone: CardData = {
            ...JSON.parse(JSON.stringify(card)),
            id: uuid(),
            name: `${card.name} (copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          s.currentDeck.cards.push(clone)
          s.selectedCardId = clone.id
        }),

      // --- Layers ---
      addLayer: (layer) =>
        set((s) => {
          if (!s.currentDeck) return
          const template =
            s.editingSide === 'front'
              ? s.currentDeck.frontTemplate
              : s.currentDeck.backTemplate
          template.frontLayers.push(layer)
          s.selectedLayerIds = [layer.id]
        }),

      updateLayer: (id, updates) =>
        set((s) => {
          if (!s.currentDeck) return
          const template =
            s.editingSide === 'front'
              ? s.currentDeck.frontTemplate
              : s.currentDeck.backTemplate
          const findAndUpdate = (layers: Layer[]): boolean => {
            for (const layer of layers) {
              if (layer.id === id) {
                Object.assign(layer, updates)
                return true
              }
              if (layer.type === 'group' && findAndUpdate(layer.children)) return true
            }
            return false
          }
          findAndUpdate(template.frontLayers)
        }),

      removeLayer: (id) =>
        set((s) => {
          if (!s.currentDeck) return
          const template =
            s.editingSide === 'front'
              ? s.currentDeck.frontTemplate
              : s.currentDeck.backTemplate
          const removeFromList = (layers: Layer[]): Layer[] =>
            layers
              .filter((l) => l.id !== id)
              .map((l) =>
                l.type === 'group' ? { ...l, children: removeFromList(l.children) } : l
              )
          template.frontLayers = removeFromList(template.frontLayers)
          s.selectedLayerIds = s.selectedLayerIds.filter((lid) => lid !== id)
        }),

      selectLayers: (ids) =>
        set((s) => {
          s.selectedLayerIds = ids
        }),

      reorderLayers: (ids) =>
        set((s) => {
          if (!s.currentDeck) return
          const template =
            s.editingSide === 'front'
              ? s.currentDeck.frontTemplate
              : s.currentDeck.backTemplate
          const map = new Map(template.frontLayers.map((l) => [l.id, l]))
          template.frontLayers = ids.map((id) => map.get(id)!).filter(Boolean)
        }),

      duplicateLayer: (id) =>
        set((s) => {
          if (!s.currentDeck) return
          const template =
            s.editingSide === 'front'
              ? s.currentDeck.frontTemplate
              : s.currentDeck.backTemplate
          const layer = template.frontLayers.find((l) => l.id === id)
          if (!layer) return
          const clone: Layer = {
            ...JSON.parse(JSON.stringify(layer)),
            id: uuid(),
            name: `${layer.name} (copy)`,
            x: layer.x + 10,
            y: layer.y + 10
          }
          template.frontLayers.push(clone)
          s.selectedLayerIds = [clone.id]
        }),

      // --- Canvas ---
      setZoom: (zoom) =>
        set((s) => {
          s.zoom = Math.max(0.1, Math.min(5, zoom))
        }),

      setPanOffset: (offset) =>
        set((s) => {
          s.panOffset = offset
        }),

      setEditingSide: (side) =>
        set((s) => {
          s.editingSide = side
          s.selectedLayerIds = []
        }),

      toggleSnapToGrid: () =>
        set((s) => {
          s.snapToGrid = !s.snapToGrid
        }),

      setGridSize: (size) =>
        set((s) => {
          s.gridSize = size
        }),

      toggleRulers: () =>
        set((s) => {
          s.showRulers = !s.showRulers
        }),

      toggleGuides: () =>
        set((s) => {
          s.showGuides = !s.showGuides
        })
    })),
    { limit: 100 }
  )
)
