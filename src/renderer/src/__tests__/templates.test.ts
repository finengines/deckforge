import { describe, it, expect } from 'vitest'
import { builtInTemplates, getTemplateById } from '../lib/templates'
import type { LayerType } from '../types'

const VALID_LAYER_TYPES: LayerType[] = ['text', 'image', 'shape', 'group', 'component']

describe('builtInTemplates', () => {
  it('returns exactly 5 templates', () => {
    expect(builtInTemplates).toHaveLength(5)
  })

  it.each([
    ['builtin-classic-top-trumps', 'Classic Top Trumps'],
    ['builtin-modern-minimal', 'Modern Minimal'],
    ['builtin-bold-stats', 'Bold Stats'],
    ['builtin-photo-card', 'Photo Card'],
    ['builtin-trading-card', 'Trading Card']
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

  it('backLayers is null for all built-in templates', () => {
    for (const t of builtInTemplates) {
      expect(t.backLayers).toBeNull()
    }
  })
})

describe('getTemplateById', () => {
  it('returns the correct template', () => {
    const t = getTemplateById('builtin-classic-top-trumps')
    expect(t).toBeDefined()
    expect(t!.name).toBe('Classic Top Trumps')
  })

  it('returns undefined for unknown id', () => {
    expect(getTemplateById('nonexistent')).toBeUndefined()
  })
})
