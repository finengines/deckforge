import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { WritableDraft as _WD } from 'immer' // ensure immer types are resolvable
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
  CardTemplate,
  Guide
} from '../types'

/** Max length for names/descriptions to prevent UI overflow */
const MAX_NAME_LENGTH = 200
const MAX_DESCRIPTION_LENGTH = 2000

function clampString(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) : s
}

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
  groupLayers: (ids: string[]) => void
  ungroupLayer: (groupId: string) => void
  sendBackward: (ids: string[]) => void
  bringForward: (ids: string[]) => void
  sendToBack: (ids: string[]) => void
  bringToFront: (ids: string[]) => void
  toggleLockLayers: (ids: string[]) => void

  // --- Alignment ---
  alignLayers: (alignment: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => void
  distributeLayers: (direction: 'horizontal' | 'vertical') => void

  // --- Canvas ---
  setZoom: (zoom: number) => void
  zoomIn: () => void
  zoomOut: () => void
  zoomToFit: () => void
  setPanOffset: (offset: Point) => void
  setEditingSide: (side: 'front' | 'back') => void
  toggleSnapToGrid: () => void
  toggleSnapToElements: () => void
  toggleSnapToCanvas: () => void
  setGridSize: (size: number) => void
  toggleRulers: () => void
  toggleGuides: () => void
  toggleGrid: () => void
  showGrid: boolean
  setShowLayoutGuides: (val: boolean) => void
  toggleLayoutGuides: () => void

  // --- Hover ---
  hoveredLayerId: string | null
  setHoveredLayerId: (id: string | null) => void

  // --- Guides ---
  addGuide: (axis: 'h' | 'v', position: number) => void
  updateGuide: (id: string, position: number) => void
  removeGuide: (id: string) => void

  // --- Nudge Settings ---
  setNudgeSettings: (small: number, large: number) => void

  // --- Alt Key (for measurements) ---
  setAltKeyHeld: (held: boolean) => void

  // --- Mouse Position ---
  setMousePositionMm: (pos: Point | null) => void
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
      lastSelectedLayerId: null,
      zoom: 1,
      panOffset: { x: 0, y: 0 },
      snapToGrid: true,
      snapToElements: true,
      snapToCanvas: true,
      gridSize: 10,
      showRulers: true,
      showGuides: true,
      showGrid: true,
      showLayoutGuides: false,
      hoveredLayerId: null,
      guides: [],
      nudgeSmall: 1,
      nudgeLarge: 10,
      altKeyHeld: false,
      mousePositionMm: null,

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
          s.lastSelectedLayerId = null
        }),

      loadDeck: (deck) =>
        set((s) => {
          s.currentDeck = deck
          s.selectedCardId = deck.cards[0]?.id ?? null
          s.selectedLayerIds = []
          s.lastSelectedLayerId = null
        }),

      closeDeck: () =>
        set((s) => {
          s.currentDeck = null
          s.selectedCardId = null
          s.selectedLayerIds = []
          s.lastSelectedLayerId = null
        }),

      updateDeckName: (name) =>
        set((s) => {
          if (s.currentDeck) s.currentDeck.name = clampString(name, MAX_NAME_LENGTH)
        }),

      updateDeckDescription: (desc) =>
        set((s) => {
          if (s.currentDeck) s.currentDeck.description = clampString(desc, MAX_DESCRIPTION_LENGTH)
        }),

      updateDimensions: (dims) =>
        set((s) => {
          if (!s.currentDeck) return
          const clamped: Partial<CardDimensions> = { ...dims }
          if (clamped.width !== undefined) clamped.width = Math.max(10, Math.min(500, clamped.width))
          if (clamped.height !== undefined) clamped.height = Math.max(10, Math.min(500, clamped.height))
          if (clamped.bleed !== undefined) clamped.bleed = Math.max(0, Math.min(20, clamped.bleed))
          if (clamped.cornerRadius !== undefined) clamped.cornerRadius = Math.max(0, Math.min(50, clamped.cornerRadius))
          if (clamped.dpi !== undefined) clamped.dpi = Math.max(72, Math.min(600, clamped.dpi))
          Object.assign(s.currentDeck.dimensions, clamped)
        }),

      updateTheme: (theme) =>
        set((s) => {
          if (s.currentDeck) Object.assign(s.currentDeck.theme, theme)
        }),

      // --- Categories ---
      addCategory: (cat) =>
        set((s) => {
          if (!s.currentDeck) return
          // Prevent duplicate category names
          const nameExists = s.currentDeck.categories.some(
            (c) => c.name.toLowerCase() === cat.name.toLowerCase()
          )
          if (nameExists) return
          s.currentDeck.categories.push({
            ...cat,
            id: uuid(),
            name: clampString(cat.name, MAX_NAME_LENGTH),
            min: Math.min(cat.min, cat.max),
            max: Math.max(cat.min, cat.max)
          })
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
          const rawName = partial?.name ?? 'New Card'
          const card: CardData = {
            id: uuid(),
            name: clampString(rawName || 'Untitled Card', MAX_NAME_LENGTH),
            image: partial?.image,
            description: clampString(partial?.description ?? '', MAX_DESCRIPTION_LENGTH),
            funFact: partial?.funFact ?? '',
            stats: partial?.stats ?? {},
            customFields: partial?.customFields ?? {},
            aiGenerated: partial?.aiGenerated ?? {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          // Clamp stat values to category bounds
          for (const cat of s.currentDeck.categories) {
            if (card.stats[cat.id] !== undefined) {
              card.stats[cat.id] = Math.max(cat.min, Math.min(cat.max, card.stats[cat.id]))
            }
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
          const layers = s.editingSide === 'back' && template.backLayers !== null
            ? template.backLayers
            : template.frontLayers
          layers.push(layer)
          s.selectedLayerIds = [layer.id]
        }),

      updateLayer: (id, updates) =>
        set((s) => {
          if (!s.currentDeck) return
          const template =
            s.editingSide === 'front'
              ? s.currentDeck.frontTemplate
              : s.currentDeck.backTemplate
          const layers = s.editingSide === 'back' && template.backLayers !== null
            ? template.backLayers
            : template.frontLayers
          const findAndUpdate = (list: Layer[]): boolean => {
            for (const layer of list) {
              if (layer.id === id) {
                Object.assign(layer, updates)
                return true
              }
              if (layer.type === 'group' && findAndUpdate(layer.children)) return true
            }
            return false
          }
          findAndUpdate(layers)
        }),

      removeLayer: (id) =>
        set((s) => {
          if (!s.currentDeck) return
          const template =
            s.editingSide === 'front'
              ? s.currentDeck.frontTemplate
              : s.currentDeck.backTemplate
          const useBack = s.editingSide === 'back' && template.backLayers !== null
          const removeFromList = (list: Layer[]): Layer[] =>
            list
              .filter((l) => l.id !== id)
              .map((l) =>
                l.type === 'group' ? { ...l, children: removeFromList(l.children) } : l
              )
          if (useBack) {
            template.backLayers = removeFromList(template.backLayers!)
          } else {
            template.frontLayers = removeFromList(template.frontLayers)
          }
          s.selectedLayerIds = s.selectedLayerIds.filter((lid) => lid !== id)
        }),

      selectLayers: (ids) =>
        set((s) => {
          s.selectedLayerIds = ids
          if (ids.length > 0) s.lastSelectedLayerId = ids[0]
        }),

      reorderLayers: (ids) =>
        set((s) => {
          if (!s.currentDeck) return
          const template =
            s.editingSide === 'front'
              ? s.currentDeck.frontTemplate
              : s.currentDeck.backTemplate
          const useBack = s.editingSide === 'back' && template.backLayers !== null
          const layers = useBack ? template.backLayers! : template.frontLayers
          const map = new Map(layers.map((l) => [l.id, l]))
          const reordered = ids.map((id) => map.get(id)!).filter(Boolean)
          if (useBack) {
            template.backLayers = reordered
          } else {
            template.frontLayers = reordered
          }
        }),

      duplicateLayer: (id) =>
        set((s) => {
          if (!s.currentDeck) return
          const template =
            s.editingSide === 'front'
              ? s.currentDeck.frontTemplate
              : s.currentDeck.backTemplate
          const layers = s.editingSide === 'back' && template.backLayers !== null
            ? template.backLayers
            : template.frontLayers
          const layer = layers.find((l) => l.id === id)
          if (!layer) return
          const clone: Layer = {
            ...JSON.parse(JSON.stringify(layer)),
            id: uuid(),
            name: `${layer.name} (copy)`,
            x: layer.x + 10,
            y: layer.y + 10
          }
          layers.push(clone)
          s.selectedLayerIds = [clone.id]
        }),

      groupLayers: (ids) =>
        set((s) => {
          if (!s.currentDeck || ids.length < 2) return
          const template =
            s.editingSide === 'front'
              ? s.currentDeck.frontTemplate
              : s.currentDeck.backTemplate
          const useBack = s.editingSide === 'back' && template.backLayers !== null
          const layers = useBack ? template.backLayers! : template.frontLayers

          // Get layers to group (preserve order)
          const layersToGroup = layers.filter((l) => ids.includes(l.id))
          if (layersToGroup.length < 2) return

          // Calculate bounding box
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
          for (const layer of layersToGroup) {
            minX = Math.min(minX, layer.x)
            minY = Math.min(minY, layer.y)
            maxX = Math.max(maxX, layer.x + layer.width)
            maxY = Math.max(maxY, layer.y + layer.height)
          }

          // Create group
          const group: Layer = {
            id: uuid(),
            type: 'group',
            name: 'Group',
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            children: layersToGroup.map((l) => ({
              ...l,
              // Make children coordinates relative to group
              x: l.x - minX,
              y: l.y - minY
            }))
          } as any

          // Remove grouped layers and add group at the position of the first layer
          const firstIndex = layers.findIndex((l) => l.id === ids[0])
          const filtered = layers.filter((l) => !ids.includes(l.id))
          filtered.splice(firstIndex, 0, group)

          if (useBack) {
            template.backLayers = filtered
          } else {
            template.frontLayers = filtered
          }

          s.selectedLayerIds = [group.id]
        }),

      ungroupLayer: (groupId) =>
        set((s) => {
          if (!s.currentDeck) return
          const template =
            s.editingSide === 'front'
              ? s.currentDeck.frontTemplate
              : s.currentDeck.backTemplate
          const useBack = s.editingSide === 'back' && template.backLayers !== null
          const layers = useBack ? template.backLayers! : template.frontLayers

          const groupIndex = layers.findIndex((l) => l.id === groupId)
          if (groupIndex === -1) return
          const group = layers[groupIndex]
          if (group.type !== 'group') return

          // Convert children back to absolute coordinates
          const children = group.children.map((child: Layer) => ({
            ...child,
            x: child.x + group.x,
            y: child.y + group.y
          }))

          // Replace group with its children
          const newLayers = [
            ...layers.slice(0, groupIndex),
            ...children,
            ...layers.slice(groupIndex + 1)
          ]

          if (useBack) {
            template.backLayers = newLayers
          } else {
            template.frontLayers = newLayers
          }

          s.selectedLayerIds = children.map((c: Layer) => c.id)
        }),

      sendBackward: (ids) =>
        set((s) => {
          if (!s.currentDeck) return
          const template =
            s.editingSide === 'front'
              ? s.currentDeck.frontTemplate
              : s.currentDeck.backTemplate
          const useBack = s.editingSide === 'back' && template.backLayers !== null
          const layers = useBack ? template.backLayers! : template.frontLayers

          // Move each selected layer one position back (lower in z-order)
          const newLayers = [...layers]
          for (const id of ids) {
            const index = newLayers.findIndex((l) => l.id === id)
            if (index > 0) {
              ;[newLayers[index - 1], newLayers[index]] = [
                newLayers[index],
                newLayers[index - 1]
              ]
            }
          }

          if (useBack) {
            template.backLayers = newLayers
          } else {
            template.frontLayers = newLayers
          }
        }),

      bringForward: (ids) =>
        set((s) => {
          if (!s.currentDeck) return
          const template =
            s.editingSide === 'front'
              ? s.currentDeck.frontTemplate
              : s.currentDeck.backTemplate
          const useBack = s.editingSide === 'back' && template.backLayers !== null
          const layers = useBack ? template.backLayers! : template.frontLayers

          // Move each selected layer one position forward (higher in z-order)
          const newLayers = [...layers]
          for (let i = ids.length - 1; i >= 0; i--) {
            const id = ids[i]
            const index = newLayers.findIndex((l) => l.id === id)
            if (index < newLayers.length - 1) {
              ;[newLayers[index], newLayers[index + 1]] = [
                newLayers[index + 1],
                newLayers[index]
              ]
            }
          }

          if (useBack) {
            template.backLayers = newLayers
          } else {
            template.frontLayers = newLayers
          }
        }),

      sendToBack: (ids) =>
        set((s) => {
          if (!s.currentDeck) return
          const template =
            s.editingSide === 'front'
              ? s.currentDeck.frontTemplate
              : s.currentDeck.backTemplate
          const useBack = s.editingSide === 'back' && template.backLayers !== null
          const layers = useBack ? template.backLayers! : template.frontLayers

          const toMove = layers.filter((l) => ids.includes(l.id))
          const others = layers.filter((l) => !ids.includes(l.id))

          if (useBack) {
            template.backLayers = [...toMove, ...others]
          } else {
            template.frontLayers = [...toMove, ...others]
          }
        }),

      bringToFront: (ids) =>
        set((s) => {
          if (!s.currentDeck) return
          const template =
            s.editingSide === 'front'
              ? s.currentDeck.frontTemplate
              : s.currentDeck.backTemplate
          const useBack = s.editingSide === 'back' && template.backLayers !== null
          const layers = useBack ? template.backLayers! : template.frontLayers

          const toMove = layers.filter((l) => ids.includes(l.id))
          const others = layers.filter((l) => !ids.includes(l.id))

          if (useBack) {
            template.backLayers = [...others, ...toMove]
          } else {
            template.frontLayers = [...others, ...toMove]
          }
        }),

      toggleLockLayers: (ids) =>
        set((s) => {
          if (!s.currentDeck) return
          const template =
            s.editingSide === 'front'
              ? s.currentDeck.frontTemplate
              : s.currentDeck.backTemplate
          const layers = s.editingSide === 'back' && template.backLayers !== null
            ? template.backLayers
            : template.frontLayers

          // Find first selected layer's lock state and toggle all to that state
          const firstLayer = layers.find((l) => ids.includes(l.id))
          if (!firstLayer) return
          const newLockState = !firstLayer.locked

          const updateLock = (list: Layer[]): void => {
            for (const layer of list) {
              if (ids.includes(layer.id)) {
                layer.locked = newLockState
              }
              if (layer.type === 'group') {
                updateLock(layer.children)
              }
            }
          }
          updateLock(layers)
        }),

      // --- Alignment ---
      alignLayers: (alignment) =>
        set((s) => {
          if (!s.currentDeck || s.selectedLayerIds.length < 2) return
          const template =
            s.editingSide === 'front'
              ? s.currentDeck.frontTemplate
              : s.currentDeck.backTemplate
          const layers = s.editingSide === 'back' && template.backLayers !== null
            ? template.backLayers!
            : template.frontLayers

          // Get selected layers
          const selectedLayers = layers.filter((l) => s.selectedLayerIds.includes(l.id))
          if (selectedLayers.length < 2) return

          // Calculate bounding box of all selected layers
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
          for (const layer of selectedLayers) {
            minX = Math.min(minX, layer.x)
            minY = Math.min(minY, layer.y)
            maxX = Math.max(maxX, layer.x + layer.width)
            maxY = Math.max(maxY, layer.y + layer.height)
          }
          const centerX = (minX + maxX) / 2
          const centerY = (minY + maxY) / 2

          // Apply alignment
          for (const layer of selectedLayers) {
            switch (alignment) {
              case 'left':
                layer.x = minX
                break
              case 'center-h':
                layer.x = centerX - layer.width / 2
                break
              case 'right':
                layer.x = maxX - layer.width
                break
              case 'top':
                layer.y = minY
                break
              case 'center-v':
                layer.y = centerY - layer.height / 2
                break
              case 'bottom':
                layer.y = maxY - layer.height
                break
            }
          }
        }),

      distributeLayers: (direction) =>
        set((s) => {
          if (!s.currentDeck || s.selectedLayerIds.length < 3) return
          const template =
            s.editingSide === 'front'
              ? s.currentDeck.frontTemplate
              : s.currentDeck.backTemplate
          const layers = s.editingSide === 'back' && template.backLayers !== null
            ? template.backLayers!
            : template.frontLayers

          // Get selected layers
          const selectedLayers = layers.filter((l) => s.selectedLayerIds.includes(l.id))
          if (selectedLayers.length < 3) return

          if (direction === 'horizontal') {
            // Sort by x position
            const sorted = [...selectedLayers].sort((a, b) => a.x - b.x)
            const first = sorted[0]
            const last = sorted[sorted.length - 1]
            const totalSpace = last.x - (first.x + first.width)
            const gap = totalSpace / (sorted.length - 1)

            let currentX = first.x + first.width + gap
            for (let i = 1; i < sorted.length - 1; i++) {
              sorted[i].x = currentX
              currentX += sorted[i].width + gap
            }
          } else {
            // Sort by y position
            const sorted = [...selectedLayers].sort((a, b) => a.y - b.y)
            const first = sorted[0]
            const last = sorted[sorted.length - 1]
            const totalSpace = last.y - (first.y + first.height)
            const gap = totalSpace / (sorted.length - 1)

            let currentY = first.y + first.height + gap
            for (let i = 1; i < sorted.length - 1; i++) {
              sorted[i].y = currentY
              currentY += sorted[i].height + gap
            }
          }
        }),

      // --- Canvas ---
      setZoom: (zoom) =>
        set((s) => {
          s.zoom = Math.max(0.1, Math.min(5, zoom))
        }),

      zoomIn: () =>
        set((s) => {
          s.zoom = Math.min(5, s.zoom * 1.2)
        }),

      zoomOut: () =>
        set((s) => {
          s.zoom = Math.max(0.1, s.zoom / 1.2)
        }),

      zoomToFit: () =>
        set((s) => {
          // Reset to 1:1 zoom and center the card
          s.zoom = 1
          s.panOffset = { x: 0, y: 0 }
        }),

      setPanOffset: (offset) =>
        set((s) => {
          s.panOffset = {
            x: Math.max(-10000, Math.min(10000, offset.x)),
            y: Math.max(-10000, Math.min(10000, offset.y))
          }
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

      toggleSnapToElements: () =>
        set((s) => {
          s.snapToElements = !s.snapToElements
        }),

      toggleSnapToCanvas: () =>
        set((s) => {
          s.snapToCanvas = !s.snapToCanvas
        }),

      setGridSize: (size) =>
        set((s) => {
          s.gridSize = Math.max(1, Math.min(100, size))
        }),

      toggleRulers: () =>
        set((s) => {
          s.showRulers = !s.showRulers
        }),

      toggleGuides: () =>
        set((s) => {
          s.showGuides = !s.showGuides
        }),

      toggleGrid: () =>
        set((s) => {
          s.showGrid = !s.showGrid
        }),

      setShowLayoutGuides: (val: boolean) =>
        set((s) => {
          s.showLayoutGuides = val
        }),

      toggleLayoutGuides: () =>
        set((s) => {
          s.showLayoutGuides = !s.showLayoutGuides
        }),

      setHoveredLayerId: (id) =>
        set((s) => {
          s.hoveredLayerId = id
        }),

      // --- Guides ---
      addGuide: (axis, position) =>
        set((s) => {
          s.guides.push({
            id: uuid(),
            axis,
            position
          })
        }),

      updateGuide: (id, position) =>
        set((s) => {
          const guide = s.guides.find((g) => g.id === id)
          if (guide) guide.position = position
        }),

      removeGuide: (id) =>
        set((s) => {
          s.guides = s.guides.filter((g) => g.id !== id)
        }),

      // --- Nudge Settings ---
      setNudgeSettings: (small, large) =>
        set((s) => {
          s.nudgeSmall = Math.max(0.1, Math.min(100, small))
          s.nudgeLarge = Math.max(0.1, Math.min(100, large))
        }),

      // --- Alt Key (for measurements) ---
      setAltKeyHeld: (held) =>
        set((s) => {
          s.altKeyHeld = held
        }),

      // --- Mouse Position ---
      setMousePositionMm: (pos) =>
        set((s) => {
          s.mousePositionMm = pos
        })
    })),
    { limit: 100 }
  )
)
