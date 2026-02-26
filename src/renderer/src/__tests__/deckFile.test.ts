import { describe, it, expect } from 'vitest'
import { serializeDeck, deserializeDeck } from '../lib/deckFile'
import type { Deck } from '../types'

function makeDeck(): Deck {
  return {
    id: '1', name: 'Test', description: '',
    dimensions: { width: 62, height: 100, bleed: 3, cornerRadius: 3, dpi: 300 },
    categories: [],
    cards: [
      { id: 'c1', name: 'Card 1', stats: {}, customFields: {}, aiGenerated: {}, createdAt: '', updatedAt: '' }
    ],
    frontTemplate: { id: 't1', name: 'F', description: '', frontLayers: [], backLayers: null, tags: [], builtIn: false, createdAt: '', updatedAt: '' },
    backTemplate: { id: 't2', name: 'B', description: '', frontLayers: [], backLayers: null, tags: [], builtIn: false, createdAt: '', updatedAt: '' },
    components: [],
    theme: { primaryColor: '#000', secondaryColor: '#111', backgroundColor: '#222', textColor: '#fff', accentColor: '#f00', fontFamily: 'Inter', headingFontFamily: 'Inter' },
    createdAt: '', updatedAt: ''
  }
}

describe('deckFile', () => {
  it('round-trips serialize/deserialize', () => {
    const deck = makeDeck()
    const json = serializeDeck(deck)
    const restored = deserializeDeck(json)
    expect(restored.name).toBe('Test')
    expect(restored.cards).toHaveLength(1)
    expect(restored.cards[0].name).toBe('Card 1')
  })

  it('rejects unsupported version', () => {
    const bad = JSON.stringify({ version: 99, deck: {}, images: {} })
    expect(() => deserializeDeck(bad)).toThrow('Unsupported')
  })
})
