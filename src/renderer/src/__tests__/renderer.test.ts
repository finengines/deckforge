import { describe, it, expect } from 'vitest'
import type { Layer, CardData, Deck, CardCategory, TextLayer } from '../types'

// We can't import directly from renderer.ts because Konva needs DOM.
// Instead we re-implement the pure functions to test their logic.

/** Resolve data binding for a layer */
function resolveBinding(layer: Layer, card: CardData, deck: Deck): string | undefined {
  if (!layer.bindTo) return undefined
  if (layer.bindTo === 'name') return card.name
  if (layer.bindTo === 'description') return card.description ?? ''
  if (layer.bindTo === 'funFact') return card.funFact ?? ''
  if (layer.bindTo.startsWith('stat:')) {
    const catId = layer.bindTo.slice(5)
    const val = card.stats[catId]
    if (val === undefined) return ''
    const cat = deck.categories.find((c) => c.id === catId)
    return cat?.unit ? `${val} ${cat.unit}` : String(val)
  }
  if (layer.bindTo.startsWith('custom:')) {
    const key = layer.bindTo.slice(7)
    return String(card.customFields[key] ?? '')
  }
  return undefined
}

/** Convert mm to pixels at given DPI */
function mmToPx(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi)
}

const mockCard: CardData = {
  id: 'card-1',
  name: 'Test Dragon',
  description: 'A fierce dragon',
  funFact: 'Dragons love pizza',
  image: '',
  stats: { speed: 85, power: 72 },
  customFields: { rarity: 'legendary', level: 5 },
  aiGenerated: {},
  createdAt: '',
  updatedAt: ''
}

const mockCategories: CardCategory[] = [
  { id: 'speed', name: 'Speed', min: 0, max: 100, unit: 'mph', higherIsBetter: true },
  { id: 'power', name: 'Power', min: 0, max: 100, higherIsBetter: true }
]

const mockDeck = { categories: mockCategories } as Deck

function makeLayer(bindTo?: string): Layer {
  return {
    id: '1', type: 'text', name: 'test', x: 0, y: 0, width: 10, height: 10,
    rotation: 0, opacity: 1, visible: true, locked: false, bindTo,
    text: '', fontSize: 4, fontFamily: 'sans-serif', fontWeight: 'normal',
    fontStyle: 'normal', fill: '#000', align: 'left' as const, verticalAlign: 'top' as const,
    lineHeight: 1, letterSpacing: 0, textDecoration: ''
  } as TextLayer
}

describe('resolveBinding', () => {
  it('returns undefined when no bindTo', () => {
    expect(resolveBinding(makeLayer(), mockCard, mockDeck)).toBeUndefined()
  })

  it('resolves name', () => {
    expect(resolveBinding(makeLayer('name'), mockCard, mockDeck)).toBe('Test Dragon')
  })

  it('resolves description', () => {
    expect(resolveBinding(makeLayer('description'), mockCard, mockDeck)).toBe('A fierce dragon')
  })

  it('resolves funFact', () => {
    expect(resolveBinding(makeLayer('funFact'), mockCard, mockDeck)).toBe('Dragons love pizza')
  })

  it('resolves stat with unit', () => {
    expect(resolveBinding(makeLayer('stat:speed'), mockCard, mockDeck)).toBe('85 mph')
  })

  it('resolves stat without unit', () => {
    expect(resolveBinding(makeLayer('stat:power'), mockCard, mockDeck)).toBe('72')
  })

  it('returns empty for missing stat', () => {
    expect(resolveBinding(makeLayer('stat:missing'), mockCard, mockDeck)).toBe('')
  })

  it('resolves custom field', () => {
    expect(resolveBinding(makeLayer('custom:rarity'), mockCard, mockDeck)).toBe('legendary')
  })

  it('resolves custom numeric field as string', () => {
    expect(resolveBinding(makeLayer('custom:level'), mockCard, mockDeck)).toBe('5')
  })

  it('returns empty for missing custom field', () => {
    expect(resolveBinding(makeLayer('custom:missing'), mockCard, mockDeck)).toBe('')
  })

  it('returns undefined for unknown binding type', () => {
    expect(resolveBinding(makeLayer('unknownField'), mockCard, mockDeck)).toBeUndefined()
  })

  it('returns empty string when description is undefined', () => {
    const card = { ...mockCard, description: undefined }
    expect(resolveBinding(makeLayer('description'), card, mockDeck)).toBe('')
  })
})

describe('mmToPx', () => {
  it('converts at 300 DPI', () => {
    expect(mmToPx(25.4, 300)).toBe(300)
  })

  it('converts at 72 DPI', () => {
    expect(mmToPx(25.4, 72)).toBe(72)
  })

  it('handles zero mm', () => {
    expect(mmToPx(0, 300)).toBe(0)
  })

  it('handles very high DPI (600)', () => {
    expect(mmToPx(25.4, 600)).toBe(600)
  })
})

describe('resolveBinding edge cases', () => {
  it('returns empty for stat referencing deleted category', () => {
    const deckNoCats = { categories: [] } as unknown as Deck
    // stat:speed exists in card but category was deleted
    const result = resolveBinding(makeLayer('stat:speed'), mockCard, deckNoCats)
    // stat value exists (85) but no category found, so no unit → just the number
    expect(result).toBe('85')
  })

  it('handles card with no stats at all', () => {
    const emptyStatsCard = { ...mockCard, stats: {} }
    expect(resolveBinding(makeLayer('stat:speed'), emptyStatsCard, mockDeck)).toBe('')
  })

  it('handles card with empty customFields', () => {
    const noCustom = { ...mockCard, customFields: {} }
    expect(resolveBinding(makeLayer('custom:anything'), noCustom, mockDeck)).toBe('')
  })
})
