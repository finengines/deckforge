import { describe, it, expect, vi } from 'vitest'

// Mock ag-psd before importing psd.ts
vi.mock('ag-psd', () => ({ readPsd: vi.fn() }))
vi.mock('ag-psd/initialize-canvas', () => ({}))

import { psdToComponentDefinition, type PsdLayerInfo } from '../lib/psd'

function makePsdData(layers: PsdLayerInfo[]) {
  return { width: 1000, height: 1400, layers }
}

function makeLayer(overrides: Partial<PsdLayerInfo> = {}): PsdLayerInfo {
  return {
    name: 'Layer 1',
    visible: true,
    bounds: { x: 100, y: 200, width: 400, height: 300 },
    hasImage: false,
    hasText: false,
    ...overrides
  }
}

describe('psdToComponentDefinition', () => {
  it('creates a component with correct name and dimensions', () => {
    const data = makePsdData([makeLayer({ hasImage: true, imageDataUrl: 'data:image/png;base64,abc' })])
    const comp = psdToComponentDefinition('Test Card', data, 63, 88, {})
    expect(comp.name).toBe('Test Card')
    expect(comp.width).toBe(63)
    expect(comp.height).toBe(88)
    expect(comp.description).toContain('1000×1400')
  })

  it('converts text layers', () => {
    const data = makePsdData([makeLayer({ hasText: true, textContent: 'Hello World' })])
    const comp = psdToComponentDefinition('Test', data, 63, 88, {})
    expect(comp.layers).toHaveLength(1)
    expect(comp.layers[0].type).toBe('text')
    expect((comp.layers[0] as any).text).toBe('Hello World')
  })

  it('converts image layers', () => {
    const data = makePsdData([makeLayer({ hasImage: true, imageDataUrl: 'data:image/png;base64,abc' })])
    const comp = psdToComponentDefinition('Test', data, 63, 88, {})
    expect(comp.layers).toHaveLength(1)
    expect(comp.layers[0].type).toBe('image')
  })

  it('converts plain layers to shapes', () => {
    const data = makePsdData([makeLayer()])
    const comp = psdToComponentDefinition('Test', data, 63, 88, {})
    expect(comp.layers).toHaveLength(1)
    expect(comp.layers[0].type).toBe('shape')
  })

  it('creates slots from slotMappings', () => {
    const data = makePsdData([makeLayer({ name: 'Title', hasText: true, textContent: 'Card Name' })])
    const comp = psdToComponentDefinition('Test', data, 63, 88, {
      Title: { type: 'text', slotName: 'cardTitle' }
    })
    expect(comp.slots).toHaveLength(1)
    expect(comp.slots[0].name).toBe('cardTitle')
    expect(comp.slots[0].type).toBe('text')
    // Layer should have bindTo set
    expect(comp.layers[0].bindTo).toBe('cardTitle')
  })

  it('converts pixel coordinates to mm proportionally', () => {
    const data = makePsdData([makeLayer({
      bounds: { x: 500, y: 700, width: 100, height: 140 },
      hasImage: true, imageDataUrl: 'data:image/png;base64,abc'
    })])
    const comp = psdToComponentDefinition('Test', data, 100, 140, {})
    const layer = comp.layers[0]
    // 500/1000 * 100 = 50mm
    expect(layer.x).toBeCloseTo(50)
    // 700/1400 * 140 = 70mm
    expect(layer.y).toBeCloseTo(70)
    // 100/1000 * 100 = 10mm
    expect(layer.width).toBeCloseTo(10)
    // 140/1400 * 140 = 14mm
    expect(layer.height).toBeCloseTo(14)
  })

  it('handles nested children', () => {
    const child = makeLayer({ name: 'Child', hasText: true, textContent: 'Nested' })
    const parent = makeLayer({ name: 'Group', children: [child] })
    const data = makePsdData([parent])
    const comp = psdToComponentDefinition('Test', data, 63, 88, {})
    // Parent (shape) + child (text)
    expect(comp.layers.length).toBe(2)
  })

  it('sets opacity to 0 for invisible layers', () => {
    const data = makePsdData([makeLayer({ visible: false, hasImage: true, imageDataUrl: 'data:image/png;base64,abc' })])
    const comp = psdToComponentDefinition('Test', data, 63, 88, {})
    expect(comp.layers[0].opacity).toBe(0)
  })
})
