import { describe, it, expect } from 'vitest'
import type { PrintSettings, CardDimensions } from '../types'

// Re-implement pure functions from pdf.ts to test them

function mmToPt(mm: number): number {
  return (mm / 25.4) * 72
}

function calculateGrid(
  paperW: number, paperH: number, cardW: number, cardH: number, spacing: number, margin: number
): { cols: number; rows: number } {
  const usableW = paperW - margin * 2
  const usableH = paperH - margin * 2
  const cols = Math.max(1, Math.floor((usableW + spacing) / (cardW + spacing)))
  const rows = Math.max(1, Math.floor((usableH + spacing) / (cardH + spacing)))
  return { cols, rows }
}

// A4 in points: 595.28 x 841.89
const A4_W = 595.28
const A4_H = 841.89

describe('mmToPt', () => {
  it('converts 25.4mm to 72pt (1 inch)', () => {
    expect(mmToPt(25.4)).toBeCloseTo(72, 1)
  })

  it('converts 0 to 0', () => {
    expect(mmToPt(0)).toBe(0)
  })

  it('converts 210mm (A4 width) correctly', () => {
    expect(mmToPt(210)).toBeCloseTo(595.28, 0)
  })
})

describe('calculateGrid', () => {
  it('calculates grid for standard poker cards on A4', () => {
    const cardW = mmToPt(63)
    const cardH = mmToPt(88)
    const spacing = mmToPt(2)
    const margin = mmToPt(10)
    const { cols, rows } = calculateGrid(A4_W, A4_H, cardW, cardH, spacing, margin)
    expect(cols).toBeGreaterThanOrEqual(2)
    expect(rows).toBeGreaterThanOrEqual(2)
  })

  it('returns at least 1x1', () => {
    const { cols, rows } = calculateGrid(100, 100, 500, 500, 0, 0)
    expect(cols).toBeGreaterThanOrEqual(1)
    expect(rows).toBeGreaterThanOrEqual(1)
  })

  it('handles zero spacing', () => {
    const cardW = mmToPt(63)
    const cardH = mmToPt(88)
    const margin = mmToPt(10)
    const { cols, rows } = calculateGrid(A4_W, A4_H, cardW, cardH, 0, margin)
    expect(cols).toBe(3)
    expect(rows).toBe(3)
  })
})

describe('generateTestSheet', () => {
  it('returns a Uint8Array', async () => {
    // Import the actual function - pdf-lib works in Node/jsdom
    const { generateTestSheet } = await import('../lib/pdf')
    const settings: PrintSettings = {
      paperSize: 'a4',
      orientation: 'portrait',
      trimMarks: false,
      showBleed: false,
      cardSpacing: 2,
      dpi: 300,
      frontOffset: { x: 0, y: 0 },
      backOffset: { x: 0, y: 0 },
      format: 'pdf',
      jpegQuality: 95,
      testSheet: true
    }
    const dims: CardDimensions = {
      width: 63, height: 88, bleed: 3, cornerRadius: 3, dpi: 300
    }
    const result = await generateTestSheet(settings, dims)
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBeGreaterThan(100)
  })

  it('generates valid PDF header', async () => {
    const { generateTestSheet } = await import('../lib/pdf')
    const settings: PrintSettings = {
      paperSize: 'a4', orientation: 'portrait', trimMarks: true,
      showBleed: false, cardSpacing: 2, dpi: 300,
      frontOffset: { x: 0, y: 0 }, backOffset: { x: 0, y: 0 },
      format: 'pdf', jpegQuality: 95, testSheet: true
    }
    const dims: CardDimensions = { width: 63, height: 88, bleed: 3, cornerRadius: 3, dpi: 300 }
    const result = await generateTestSheet(settings, dims)
    // PDF files start with %PDF
    const header = String.fromCharCode(...result.slice(0, 5))
    expect(header).toBe('%PDF-')
  })
})
