/**
 * DeckForge PDF Generation
 * Creates print-ready PDFs with card layout, trim marks, and bleed support
 */

import { PDFDocument, rgb, PageSizes } from 'pdf-lib'
import type { PrintSettings, CardDimensions, Deck } from '../types'
import { renderCard } from './renderer'

/** Convert mm to PDF points (1 point = 1/72 inch) */
function mmToPt(mm: number): number {
  return (mm / 25.4) * 72
}

/** Get paper dimensions in points [width, height] */
function getPaperSize(settings: PrintSettings): [number, number] {
  let w: number, h: number
  switch (settings.paperSize) {
    case 'a4': [w, h] = PageSizes.A4; break
    case 'a3': [w, h] = PageSizes.A3; break
    case 'letter': [w, h] = PageSizes.Letter; break
    case 'custom':
      w = mmToPt(settings.customPaperWidth ?? 210)
      h = mmToPt(settings.customPaperHeight ?? 297)
      break
    default: [w, h] = PageSizes.A4
  }
  if (settings.orientation === 'landscape') return [h, w]
  return [w, h]
}

/** Calculate grid layout: how many cards fit per page */
function calculateGrid(
  paperW: number, paperH: number, cardW: number, cardH: number, spacing: number, margin: number
): { cols: number; rows: number } {
  const usableW = paperW - margin * 2
  const usableH = paperH - margin * 2
  const cols = Math.max(1, Math.floor((usableW + spacing) / (cardW + spacing)))
  const rows = Math.max(1, Math.floor((usableH + spacing) / (cardH + spacing)))
  return { cols, rows }
}

/** Draw trim marks around a card position */
function drawTrimMarks(
  page: any, x: number, y: number, w: number, h: number, pageH: number
): void {
  const markLen = mmToPt(5)
  const markOffset = mmToPt(2)
  const color = rgb(0, 0, 0)
  const thickness = 0.5

  // PDF y-axis is bottom-up; our y is top-down
  const by = pageH - y
  const corners = [
    [x, by],               // top-left
    [x + w, by],           // top-right
    [x, by - h],           // bottom-left
    [x + w, by - h]        // bottom-right
  ]

  for (const [cx, cy] of corners) {
    // Horizontal marks
    const hDir = cx === x ? -1 : 1
    page.drawLine({
      start: { x: cx + hDir * markOffset, y: cy },
      end: { x: cx + hDir * (markOffset + markLen), y: cy },
      thickness, color
    })
    // Vertical marks
    const vDir = cy === by ? 1 : -1
    page.drawLine({
      start: { x: cx, y: cy + vDir * markOffset },
      end: { x: cx, y: cy + vDir * (markOffset + markLen) },
      thickness, color
    })
  }
}

/** Embed a rendered card image into a PDF page */
async function embedCardImage(
  pdfDoc: PDFDocument, dataUrl: string
): Promise<any> {
  const base64 = dataUrl.split(',')[1]
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  // PNG data URLs from canvas
  if (dataUrl.includes('image/png')) {
    return pdfDoc.embedPng(bytes)
  }
  return pdfDoc.embedJpg(bytes)
}

export interface GeneratePDFProgress {
  phase: 'rendering' | 'composing'
  current: number
  total: number
}

/**
 * Generate a print-ready PDF from a deck.
 */
export async function generatePDF(
  deck: Deck,
  settings: PrintSettings,
  onProgress?: (p: GeneratePDFProgress) => void
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const [paperW, paperH] = getPaperSize(settings)
  const dims = deck.dimensions

  const cardW = mmToPt(dims.width + (settings.showBleed ? dims.bleed * 2 : 0))
  const cardH = mmToPt(dims.height + (settings.showBleed ? dims.bleed * 2 : 0))
  const spacing = mmToPt(settings.cardSpacing)
  const margin = mmToPt(10) // 10mm page margin

  const { cols, rows } = calculateGrid(paperW, paperH, cardW, cardH, spacing, margin)
  const cardsPerPage = cols * rows
  const totalCards = deck.cards.length
  const totalPages = Math.ceil(totalCards / cardsPerPage)

  // Render all card fronts
  const frontImages: string[] = []
  for (let i = 0; i < totalCards; i++) {
    onProgress?.({ phase: 'rendering', current: i, total: totalCards * 2 })
    frontImages.push(await renderCard(deck, deck.cards[i], 'front', settings.dpi))
  }

  // Render all card backs
  const backImages: string[] = []
  for (let i = 0; i < totalCards; i++) {
    onProgress?.({ phase: 'rendering', current: totalCards + i, total: totalCards * 2 })
    backImages.push(await renderCard(deck, deck.cards[i], 'back', settings.dpi))
  }

  onProgress?.({ phase: 'composing', current: 0, total: totalPages * 2 })

  // Layout helper
  const layoutPage = async (
    images: string[], pageIdx: number, offset: { x: number; y: number }, isBack: boolean
  ) => {
    const page = pdfDoc.addPage([paperW, paperH])
    const startIdx = pageIdx * cardsPerPage

    // Center the grid
    const gridW = cols * cardW + (cols - 1) * spacing
    const gridH = rows * cardH + (rows - 1) * spacing
    const startX = (paperW - gridW) / 2 + mmToPt(offset.x)
    const startY = (paperH - gridH) / 2 + mmToPt(offset.y)

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = startIdx + r * cols + (isBack ? (cols - 1 - c) : c) // Mirror columns for back
        if (idx >= images.length) continue

        const x = startX + c * (cardW + spacing)
        const y = startY + r * (cardH + spacing) // top-down y
        const pdfY = paperH - y - cardH // convert to PDF bottom-up

        const img = await embedCardImage(pdfDoc, images[idx])
        page.drawImage(img, { x, y: pdfY, width: cardW, height: cardH })

        if (settings.trimMarks) {
          drawTrimMarks(page, x, y, cardW, cardH, paperH)
        }
      }
    }
  }

  // Front pages
  for (let p = 0; p < totalPages; p++) {
    onProgress?.({ phase: 'composing', current: p, total: totalPages * 2 })
    await layoutPage(frontImages, p, settings.frontOffset, false)
  }

  // Back pages (matching order for double-sided printing)
  for (let p = 0; p < totalPages; p++) {
    onProgress?.({ phase: 'composing', current: totalPages + p, total: totalPages * 2 })
    await layoutPage(backImages, p, settings.backOffset, true)
  }

  return pdfDoc.save()
}

/**
 * Generate a test sheet with card outlines only (no content).
 * For checking printer alignment.
 */
export async function generateTestSheet(
  settings: PrintSettings,
  dimensions: CardDimensions
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const [paperW, paperH] = getPaperSize(settings)

  const cardW = mmToPt(dimensions.width + (settings.showBleed ? dimensions.bleed * 2 : 0))
  const cardH = mmToPt(dimensions.height + (settings.showBleed ? dimensions.bleed * 2 : 0))
  const spacing = mmToPt(settings.cardSpacing)
  const margin = mmToPt(10)

  const { cols, rows } = calculateGrid(paperW, paperH, cardW, cardH, spacing, margin)

  const page = pdfDoc.addPage([paperW, paperH])

  const gridW = cols * cardW + (cols - 1) * spacing
  const gridH = rows * cardH + (rows - 1) * spacing
  const startX = (paperW - gridW) / 2
  const startY = (paperH + gridH) / 2 // PDF bottom-up

  const dashLength = 4
  const gapLength = 4

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * (cardW + spacing)
      const y = startY - r * (cardH + spacing) - cardH

      // Draw dashed rectangle
      const lines = [
        { sx: x, sy: y, ex: x + cardW, ey: y },
        { sx: x + cardW, sy: y, ex: x + cardW, ey: y + cardH },
        { sx: x + cardW, sy: y + cardH, ex: x, ey: y + cardH },
        { sx: x, sy: y + cardH, ex: x, ey: y }
      ]

      for (const { sx, sy, ex, ey } of lines) {
        const len = Math.hypot(ex - sx, ey - sy)
        const dx = (ex - sx) / len
        const dy = (ey - sy) / len
        let pos = 0
        let drawing = true
        while (pos < len) {
          const segLen = drawing ? dashLength : gapLength
          const end = Math.min(pos + segLen, len)
          if (drawing) {
            page.drawLine({
              start: { x: sx + dx * pos, y: sy + dy * pos },
              end: { x: sx + dx * end, y: sy + dy * end },
              thickness: 0.5,
              color: rgb(0.5, 0.5, 0.5)
            })
          }
          pos = end
          drawing = !drawing
        }
      }

      // Label
      if (settings.trimMarks) {
        drawTrimMarks(page, x, paperH - (y + cardH), cardW, cardH, paperH)
      }
    }
  }

  // Add info text
  page.drawText(
    `Test Sheet — ${dimensions.width}×${dimensions.height}mm — ${cols}×${rows} grid`,
    { x: mmToPt(10), y: paperH - mmToPt(7), size: 8, color: rgb(0.4, 0.4, 0.4) }
  )

  return pdfDoc.save()
}
