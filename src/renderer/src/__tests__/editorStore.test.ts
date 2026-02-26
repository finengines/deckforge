import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore } from '../stores/editorStore'

describe('editorStore', () => {
  beforeEach(() => {
    // Reset store between tests
    useEditorStore.setState({
      view: 'design',
      mode: 'select',
      currentDeck: null,
      selectedCardId: null,
      editingSide: 'front',
      selectedLayerIds: [],
      zoom: 1,
      panOffset: { x: 0, y: 0 },
      snapToGrid: true,
      gridSize: 10,
      showRulers: true,
      showGuides: true
    })
  })

  describe('deck management', () => {
    it('creates a new deck with defaults', () => {
      useEditorStore.getState().createDeck('Test Deck', 'A test deck')
      const deck = useEditorStore.getState().currentDeck
      expect(deck).not.toBeNull()
      expect(deck!.name).toBe('Test Deck')
      expect(deck!.description).toBe('A test deck')
      expect(deck!.dimensions.width).toBe(62)
      expect(deck!.dimensions.height).toBe(100)
      expect(deck!.cards).toHaveLength(0)
      expect(deck!.categories).toHaveLength(0)
    })

    it('closes deck and resets selection', () => {
      useEditorStore.getState().createDeck('Test')
      useEditorStore.getState().closeDeck()
      expect(useEditorStore.getState().currentDeck).toBeNull()
      expect(useEditorStore.getState().selectedCardId).toBeNull()
    })
  })

  describe('card management', () => {
    beforeEach(() => {
      useEditorStore.getState().createDeck('Test Deck')
    })

    it('adds a card', () => {
      useEditorStore.getState().addCard({ name: 'Dragon' })
      const deck = useEditorStore.getState().currentDeck!
      expect(deck.cards).toHaveLength(1)
      expect(deck.cards[0].name).toBe('Dragon')
      expect(useEditorStore.getState().selectedCardId).toBe(deck.cards[0].id)
    })

    it('removes a card', () => {
      useEditorStore.getState().addCard({ name: 'Dragon' })
      const cardId = useEditorStore.getState().currentDeck!.cards[0].id
      useEditorStore.getState().removeCard(cardId)
      expect(useEditorStore.getState().currentDeck!.cards).toHaveLength(0)
    })

    it('duplicates a card', () => {
      useEditorStore.getState().addCard({ name: 'Dragon' })
      const cardId = useEditorStore.getState().currentDeck!.cards[0].id
      useEditorStore.getState().duplicateCard(cardId)
      const deck = useEditorStore.getState().currentDeck!
      expect(deck.cards).toHaveLength(2)
      expect(deck.cards[1].name).toBe('Dragon (copy)')
    })

    it('updates card data', () => {
      useEditorStore.getState().addCard({ name: 'Dragon' })
      const cardId = useEditorStore.getState().currentDeck!.cards[0].id
      useEditorStore.getState().updateCard(cardId, {
        name: 'Fire Dragon',
        description: 'A fierce dragon'
      })
      const card = useEditorStore.getState().currentDeck!.cards[0]
      expect(card.name).toBe('Fire Dragon')
      expect(card.description).toBe('A fierce dragon')
    })
  })

  describe('categories', () => {
    beforeEach(() => {
      useEditorStore.getState().createDeck('Test')
    })

    it('adds a category', () => {
      useEditorStore.getState().addCategory({
        name: 'Attack',
        min: 0,
        max: 100,
        higherIsBetter: true
      })
      expect(useEditorStore.getState().currentDeck!.categories).toHaveLength(1)
      expect(useEditorStore.getState().currentDeck!.categories[0].name).toBe('Attack')
    })

    it('removes category and cleans up card stats', () => {
      useEditorStore.getState().addCategory({
        name: 'Attack',
        min: 0,
        max: 100,
        higherIsBetter: true
      })
      const catId = useEditorStore.getState().currentDeck!.categories[0].id
      useEditorStore.getState().addCard({
        name: 'Dragon',
        stats: { [catId]: 85 }
      })
      useEditorStore.getState().removeCategory(catId)
      expect(useEditorStore.getState().currentDeck!.categories).toHaveLength(0)
      const card = useEditorStore.getState().currentDeck!.cards[0]
      expect(card.stats[catId]).toBeUndefined()
    })
  })

  describe('layers', () => {
    beforeEach(() => {
      useEditorStore.getState().createDeck('Test')
    })

    it('adds a text layer', () => {
      useEditorStore.getState().addLayer({
        id: 'layer-1',
        type: 'text',
        name: 'Title',
        x: 0,
        y: 0,
        width: 50,
        height: 10,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        text: 'Hello',
        fontSize: 5,
        fontFamily: 'Inter',
        fontWeight: '400',
        fontStyle: 'normal',
        fill: '#000',
        align: 'left',
        verticalAlign: 'top',
        lineHeight: 1.2,
        letterSpacing: 0,
        textDecoration: ''
      })
      const layers = useEditorStore.getState().currentDeck!.frontTemplate.frontLayers
      expect(layers).toHaveLength(1)
      expect(layers[0].name).toBe('Title')
    })

    it('selects layers', () => {
      useEditorStore.getState().selectLayers(['layer-1', 'layer-2'])
      expect(useEditorStore.getState().selectedLayerIds).toEqual(['layer-1', 'layer-2'])
    })
  })

  describe('edge cases', () => {
    beforeEach(() => {
      useEditorStore.getState().createDeck('Test')
    })

    it('deleting the last card sets selectedCardId to null', () => {
      useEditorStore.getState().addCard({ name: 'Only Card' })
      const cardId = useEditorStore.getState().currentDeck!.cards[0].id
      useEditorStore.getState().removeCard(cardId)
      expect(useEditorStore.getState().currentDeck!.cards).toHaveLength(0)
      expect(useEditorStore.getState().selectedCardId).toBeNull()
    })

    it('empty card name defaults to Untitled Card', () => {
      useEditorStore.getState().addCard({ name: '' })
      expect(useEditorStore.getState().currentDeck!.cards[0].name).toBe('Untitled Card')
    })

    it('very long deck name is truncated', () => {
      const longName = 'A'.repeat(1000)
      useEditorStore.getState().updateDeckName(longName)
      expect(useEditorStore.getState().currentDeck!.name.length).toBeLessThanOrEqual(200)
    })

    it('very long card name is truncated', () => {
      const longName = 'B'.repeat(1000)
      useEditorStore.getState().addCard({ name: longName })
      expect(useEditorStore.getState().currentDeck!.cards[0].name.length).toBeLessThanOrEqual(200)
    })

    it('stat value exceeding category max is clamped', () => {
      useEditorStore.getState().addCategory({
        name: 'Speed', min: 0, max: 100, higherIsBetter: true
      })
      const catId = useEditorStore.getState().currentDeck!.categories[0].id
      useEditorStore.getState().addCard({ name: 'Fast', stats: { [catId]: 999 } })
      expect(useEditorStore.getState().currentDeck!.cards[0].stats[catId]).toBe(100)
    })

    it('stat value below category min is clamped', () => {
      useEditorStore.getState().addCategory({
        name: 'Speed', min: 10, max: 100, higherIsBetter: true
      })
      const catId = useEditorStore.getState().currentDeck!.categories[0].id
      useEditorStore.getState().addCard({ name: 'Slow', stats: { [catId]: -5 } })
      expect(useEditorStore.getState().currentDeck!.cards[0].stats[catId]).toBe(10)
    })

    it('duplicate category names are rejected', () => {
      useEditorStore.getState().addCategory({
        name: 'Speed', min: 0, max: 100, higherIsBetter: true
      })
      useEditorStore.getState().addCategory({
        name: 'Speed', min: 0, max: 50, higherIsBetter: false
      })
      expect(useEditorStore.getState().currentDeck!.categories).toHaveLength(1)
    })

    it('duplicate category names are case-insensitive', () => {
      useEditorStore.getState().addCategory({
        name: 'Speed', min: 0, max: 100, higherIsBetter: true
      })
      useEditorStore.getState().addCategory({
        name: 'speed', min: 0, max: 50, higherIsBetter: false
      })
      expect(useEditorStore.getState().currentDeck!.categories).toHaveLength(1)
    })

    it('negative bleed is clamped to 0', () => {
      useEditorStore.getState().updateDimensions({ bleed: -5 })
      expect(useEditorStore.getState().currentDeck!.dimensions.bleed).toBe(0)
    })

    it('DPI is clamped to valid range', () => {
      useEditorStore.getState().updateDimensions({ dpi: 10 })
      expect(useEditorStore.getState().currentDeck!.dimensions.dpi).toBe(72)

      useEditorStore.getState().updateDimensions({ dpi: 1200 })
      expect(useEditorStore.getState().currentDeck!.dimensions.dpi).toBe(600)
    })

    it('gridSize is clamped to at least 1', () => {
      useEditorStore.getState().setGridSize(0)
      expect(useEditorStore.getState().gridSize).toBe(1)

      useEditorStore.getState().setGridSize(-10)
      expect(useEditorStore.getState().gridSize).toBe(1)
    })

    it('pan offset is clamped to reasonable bounds', () => {
      useEditorStore.getState().setPanOffset({ x: 99999, y: -99999 })
      const offset = useEditorStore.getState().panOffset
      expect(offset.x).toBeLessThanOrEqual(10000)
      expect(offset.y).toBeGreaterThanOrEqual(-10000)
    })
  })

  describe('canvas controls', () => {
    it('sets zoom with bounds', () => {
      useEditorStore.getState().setZoom(3)
      expect(useEditorStore.getState().zoom).toBe(3)

      useEditorStore.getState().setZoom(0.01)
      expect(useEditorStore.getState().zoom).toBe(0.1)

      useEditorStore.getState().setZoom(10)
      expect(useEditorStore.getState().zoom).toBe(5)
    })

    it('toggles features', () => {
      useEditorStore.getState().toggleSnapToGrid()
      expect(useEditorStore.getState().snapToGrid).toBe(false)

      useEditorStore.getState().toggleRulers()
      expect(useEditorStore.getState().showRulers).toBe(false)
    })
  })
})
