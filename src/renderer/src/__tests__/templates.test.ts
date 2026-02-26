import { describe, it, expect } from 'vitest'
import { builtInTemplates, getTemplateById } from '../lib/templates'
import type { LayerType } from '../types'

const VALID_LAYER_TYPES: LayerType[] = ['text', 'image', 'shape', 'group', 'component']

describe('builtInTemplates', () => {
  it('returns exactly 12 templates', () => {
    expect(builtInTemplates).toHaveLength(12)
  })

  it.each([
    ['tt-classic', 'Classic TT'],
    ['tt-sports-star', 'Sports Star'],
    ['tt-animals-nature', 'Animals & Nature'],
    ['tt-speed-machines', 'Speed Machines'],
    ['tt-superheroes', 'Superheroes'],
    ['tt-space-explorer', 'Space Explorer'],
    ['tt-history-legends', 'History Legends'],
    ['tt-food-cooking', 'Food & Cooking'],
    ['tt-music-culture', 'Music & Culture'],
    ['tt-kids-cartoon', 'Kids Cartoon'],
    ['tt-photo-minimal', 'Photo Minimal'],
    ['tt-premium-gold', 'Premium Gold']
  ])('has template %s named %s', (id, name) => {
    const t = builtInTemplates.find((t) => t.id === id)
    expect(t).toBeDefined()
    expect(t!.name).toBe(name)
  })

  it('all templates have valid structure', () => {
    for (const t of builtInTemplates) {
      expect(t.id).toBeTruthy()
      expect(t.name).toBeTruthy()
      expect(t.description).toBeTruthy()
      expect(t.builtIn).toBe(true)
      expect(t.createdAt).toBeTruthy()
      expect(t.updatedAt).toBeTruthy()
      expect(t.tags).toBeInstanceOf(Array)
      expect(t.tags.length).toBeGreaterThan(0)
      expect(t.frontLayers).toBeInstanceOf(Array)
      expect(t.frontLayers.length).toBeGreaterThan(0)
    }
  })

  it('all layers have valid types', () => {
    for (const t of builtInTemplates) {
      for (const layer of t.frontLayers) {
        expect(VALID_LAYER_TYPES).toContain(layer.type)
      }
    }
  })

  it('all layers have required base properties', () => {
    for (const t of builtInTemplates) {
      for (const layer of t.frontLayers) {
        expect(layer.id).toBeTruthy()
        expect(layer.name).toBeTruthy()
        expect(typeof layer.x).toBe('number')
        expect(typeof layer.y).toBe('number')
        expect(typeof layer.width).toBe('number')
        expect(typeof layer.height).toBe('number')
        expect(typeof layer.rotation).toBe('number')
        expect(typeof layer.opacity).toBe('number')
        expect(typeof layer.visible).toBe('boolean')
        expect(typeof layer.locked).toBe('boolean')
      }
    }
  })

  it('each template has at least one layer with bindTo', () => {
    for (const t of builtInTemplates) {
      const bound = t.frontLayers.filter((l) => l.bindTo)
      expect(bound.length).toBeGreaterThan(0)
    }
  })

  it('all templates bind to "name"', () => {
    for (const t of builtInTemplates) {
      const nameLayer = t.frontLayers.find((l) => l.bindTo === 'name')
      expect(nameLayer).toBeDefined()
    }
  })

  it('all templates bind to "image"', () => {
    for (const t of builtInTemplates) {
      const imageLayer = t.frontLayers.find((l) => l.bindTo === 'image')
      expect(imageLayer).toBeDefined()
    }
  })

  it('all templates bind to "description"', () => {
    for (const t of builtInTemplates) {
      const descLayer = t.frontLayers.find((l) => l.bindTo === 'description')
      expect(descLayer).toBeDefined()
    }
  })

  it('all templates bind to "funFact"', () => {
    for (const t of builtInTemplates) {
      const funFactLayer = t.frontLayers.find((l) => l.bindTo === 'funFact')
      expect(funFactLayer).toBeDefined()
    }
  })

  it('all templates have 5 stat bindings (stat:0 through stat:4)', () => {
    for (const t of builtInTemplates) {
      for (let i = 0; i < 5; i++) {
        const statLayer = t.frontLayers.find((l) => l.bindTo === `stat:${i}`)
        expect(statLayer, `Template "${t.name}" missing stat:${i}`).toBeDefined()
      }
    }
  })

  it('all templates have at least 8 layers', () => {
    for (const t of builtInTemplates) {
      expect(t.frontLayers.length, `Template "${t.name}" has too few layers`).toBeGreaterThanOrEqual(8)
    }
  })

  it('backLayers is null for all built-in templates', () => {
    for (const t of builtInTemplates) {
      expect(t.backLayers).toBeNull()
    }
  })
})

describe('getTemplateById', () => {
  it('returns the correct template', () => {
    const t = getTemplateById('tt-classic')
    expect(t).toBeDefined()
    expect(t!.name).toBe('Classic TT')
  })

  it('returns undefined for unknown id', () => {
    expect(getTemplateById('nonexistent')).toBeUndefined()
  })
})
