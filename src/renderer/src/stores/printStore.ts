import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { PrintSettings, Point } from '../types'

interface PrintStore extends PrintSettings {
  updateSettings: (updates: Partial<PrintSettings>) => void
  setFrontOffset: (offset: Point) => void
  setBackOffset: (offset: Point) => void
  resetOffsets: () => void
  resetToDefaults: () => void
}

const DEFAULTS: PrintSettings = {
  paperSize: 'a4',
  orientation: 'portrait',
  trimMarks: true,
  showBleed: true,
  cardSpacing: 5,
  dpi: 300,
  frontOffset: { x: 0, y: 0 },
  backOffset: { x: 0, y: 0 },
  format: 'pdf',
  jpegQuality: 95,
  testSheet: false
}

export const usePrintStore = create<PrintStore>()(
  immer((set) => ({
    ...DEFAULTS,

    updateSettings: (updates) =>
      set((s) => {
        Object.assign(s, updates)
      }),

    setFrontOffset: (offset) =>
      set((s) => {
        s.frontOffset = offset
      }),

    setBackOffset: (offset) =>
      set((s) => {
        s.backOffset = offset
      }),

    resetOffsets: () =>
      set((s) => {
        s.frontOffset = { x: 0, y: 0 }
        s.backOffset = { x: 0, y: 0 }
      }),

    resetToDefaults: () =>
      set((s) => {
        Object.assign(s, DEFAULTS)
      })
  }))
)
