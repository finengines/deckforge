import { describe, it, expect } from 'vitest'
import { exportCSV, exportJSON } from '../lib/dataExport'
import type { Deck } from '../types'

function makeDeck(): Deck {
  return {
    id: '1',
    name: 'Test',
    description: '',
    dimensions: { width: 62, height: 100, bleed: 3, cornerRadius: 3, dpi: 300 },
    categories: [
      { id: 'c1', name: 'Speed', min: 0, max: 100, higherIsBetter: true }
    ],
    cards: [
      {
        id: 'card1',
        name: 'Dragon',
        description: 'A fire-breathing beast',
        funFact: 'Can fly',
        stats: { c1: 80 },
        customFields: {},
        aiGenerated: {},
        createdAt: '',
        updatedAt: ''
      }
    ],
    frontTemplate: { id: 't1', name: 'Front', description: '', frontLayers: [], backLayers: null, tags: [], builtIn: false, createdAt: '', updatedAt: '' },
    backTemplate: { id: 't2', name: 'Back', description: '', frontLayers: [], backLayers: null, tags: [], builtIn: false, createdAt: '', updatedAt: '' },
    components: [],
    theme: { primaryColor: '#000', secondaryColor: '#111', backgroundColor: '#222', textColor: '#fff', accentColor: '#f00', fontFamily: 'Inter', headingFontFamily: 'Inter' },
    createdAt: '',
    updatedAt: ''
  }
}

describe('exportCSV', () => {
  it('exports correct CSV', () => {
    const csv = exportCSV(makeDeck())
    const lines = csv.split('\n')
    expect(lines[0]).toBe('name,description,funFact,Speed')
    expect(lines[1]).toBe('Dragon,A fire-breathing beast,Can fly,80')
  })

  it('escapes commas in fields', () => {
    const deck = makeDeck()
    deck.cards[0].description = 'Big, scary'
    const csv = exportCSV(deck)
    expect(csv).toContain('"Big, scary"')
  })
})

describe('exportJSON', () => {
  it('produces valid JSON', () => {
    const json = exportJSON(makeDeck())
    const parsed = JSON.parse(json)
    expect(parsed.name).toBe('Test')
    expect(parsed.cards).toHaveLength(1)
  })
})
