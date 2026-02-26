import { describe, it, expect, beforeEach } from 'vitest'
import { usePrintStore } from '../stores/printStore'

describe('printStore', () => {
  beforeEach(() => {
    usePrintStore.getState().resetToDefaults()
  })

  it('has sensible defaults', () => {
    const s = usePrintStore.getState()
    expect(s.paperSize).toBe('a4')
    expect(s.dpi).toBe(300)
    expect(s.trimMarks).toBe(true)
    expect(s.format).toBe('pdf')
    expect(s.frontOffset).toEqual({ x: 0, y: 0 })
    expect(s.backOffset).toEqual({ x: 0, y: 0 })
  })

  it('updates settings', () => {
    usePrintStore.getState().updateSettings({ paperSize: 'a3', dpi: 600 })
    expect(usePrintStore.getState().paperSize).toBe('a3')
    expect(usePrintStore.getState().dpi).toBe(600)
  })

  it('sets front/back offsets independently', () => {
    usePrintStore.getState().setFrontOffset({ x: 1.5, y: -0.5 })
    usePrintStore.getState().setBackOffset({ x: -1, y: 2 })
    expect(usePrintStore.getState().frontOffset).toEqual({ x: 1.5, y: -0.5 })
    expect(usePrintStore.getState().backOffset).toEqual({ x: -1, y: 2 })
  })

  it('resets offsets', () => {
    usePrintStore.getState().setFrontOffset({ x: 5, y: 5 })
    usePrintStore.getState().resetOffsets()
    expect(usePrintStore.getState().frontOffset).toEqual({ x: 0, y: 0 })
    expect(usePrintStore.getState().backOffset).toEqual({ x: 0, y: 0 })
  })

  it('resets to full defaults', () => {
    usePrintStore.getState().updateSettings({ paperSize: 'letter', dpi: 150, trimMarks: false })
    usePrintStore.getState().resetToDefaults()
    expect(usePrintStore.getState().paperSize).toBe('a4')
    expect(usePrintStore.getState().dpi).toBe(300)
    expect(usePrintStore.getState().trimMarks).toBe(true)
  })
})
