/**
 * DeckForge PDF Generation
 * Creates print-ready PDFs with card layout, trim marks, and bleed support
 * pdf-lib is lazy-loaded for performance
 */

import type { PrintSettings, CardDimensions, Deck } from '../types'
import { renderCard } from './renderer'

type PdfLib = typeof import('pdf-lib')

let _pdfLib: PdfLib | null = null

async function loadPdfLib(): Promise<PdfLib> {
  if (!_pdfLib) {
    _pdfLib = await import('pdf-lib')
  }
  return _pdfLib
}

/** Convert mm to PDF points (1 point = 1/72 inch) */
function mmToPt(mm: number): number {
  return (mm / 25.4) * 72
}

/** Get paper dimensions in points [width, height] */
function getPaperSize(lib: PdfLib, settings: PrintSettings): [number, number] {
  let w: number, h: number
  switch (settings.paperSize) {
    case 'a4': [w, h] = lib.PageSizes.A4; break
    case 'a3': [w, h] = lib.PageSizes.A3; break
    case 'letter': [w, h] = lib.PageSizes.Letter; break
    case 'custom':
      w = mmToPt(settings.customPaperWidth ?? 210)
      h = mmToPt(settings.customPaperHeight ?? 297)
      break
    default: [w, h] = lib.PageSizes.A4
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
  lib: PdfLib, page: any, x: number, y: number, w: number, h: number, pageH: number
): void {
  const markLen = mmToPt(5)
  const markOffset = mmToPt(2)
  const color = lib.rgb(0, 0, 0)
  const thickness = 0.5

  const by = pageH - y
  const corners = [
    [x, by], [x + w, by], [x, by - h], [x + w, by - h]
  ]

  for (const [cx, cy] of corners) {
    const hDir = cx === x ? -1 : 1
    page.drawLine({
      start: { x: cx + hDir * markOffset, y: cy },
      end: { x: cx + hDir * (markOffset + markLen), y: cy },
      thickness, color
    })
    const vDir = cy === by ? 1 : -1
    page.drawLine({
      start: { x: cx, y: cy + vDir * markOffset },
      end: { x: cx, y: cy + vDir * (markOffset + markLen) },
      thickness, color
    })
  }
}

function drawRegistrationMarks(lib: PdfLib, page: any, paperW: number, paperH: number): void {
  const offset = mmToPt(5)
  const r = mmToPt(0.5)
  const color = lib.rgb(0, 0, 0)
  const thickness = 0.3
  const lineLen = mmToPt(2)
  const positions = [
    { x: offset, y: paperH - offset },
    { x: paperW - offset, y: paperH - offset },
    { x: offset, y: offset },
    { x: paperW - offset, y: offset }
  ]
  for (const { x, y } of positions) {
    page.drawCircle({ x, y, size: r, borderColor: color, borderWidth: thickness, color: undefined })
    page.drawLine({ start: { x: x - lineLen, y }, end: { x: x + lineLen, y }, thickness, color })
    page.drawLine({ start: { x, y: y - lineLen }, end: { x, y: y + lineLen }, thickness, color })
  }
}

function drawColorBars(lib: PdfLib, page: any): void {
  const barW = mmToPt(4)
  const barH = mmToPt(3)
  const startX = mmToPt(20)
  const y = mmToPt(3)
  const gap = mmToPt(1)
  const colors = [
    lib.rgb(0, 1, 1), lib.rgb(1, 0, 1), lib.rgb(1, 1, 0), lib.rgb(0, 0, 0),
    lib.rgb(1, 0, 0), lib.rgb(0, 1, 0), lib.rgb(0, 0, 1)
  ]
  colors.forEach((c, i) => {
    page.drawRectangle({ x: startX + i * (barW + gap), y, width: barW, height: barH, color: c })
  })
}

function drawFoldMarks(lib: PdfLib, page: any, paperW: number, paperH: number): void {
  const markLen = mmToPt(4)
  const color = lib.rgb(0.4, 0.4, 0.4)
  const thickness = 0.3
  const midX = paperW / 2
  const midY = paperH / 2
  page.drawLine({ start: { x: midX, y: paperH }, end: { x: midX, y: paperH - markLen }, thickness, color })
  page.drawLine({ start: { x: midX, y: 0 }, end: { x: midX, y: markLen }, thickness, color })
  page.drawLine({ start: { x: 0, y: midY }, end: { x: markLen, y: midY }, thickness, color })
  page.drawLine({ start: { x: paperW, y: midY }, end: { x: paperW - markLen, y: midY }, thickness, color })
}

function drawPageInfo(
  lib: PdfLib, page: any, font: any, deckName: string, pageNum: number, totalPages: number
): void {
  const date = new Date().toISOString().split('T')[0]
  const text = `DeckForge — ${deckName} — Page ${pageNum} of ${totalPages} — ${date}`
  page.drawText(text, { x: mmToPt(10), y: mmToPt(5), size: 6, font, color: lib.rgb(0.4, 0.4, 0.4) })
}

async function embedCardImage(pdfDoc: any, dataUrl: string): Promise<any> {
  const base64 = dataUrl.split(',')[1]
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  if (dataUrl.includes('image/png')) return pdfDoc.embedPng(bytes)
  return pdfDoc.embedJpg(bytes)
}

export interface GeneratePDFProgress {
  phase: 'rendering' | 'composing'
  current: number
  total: number
}

export async function generatePDF(
  deck: Deck,
  settings: PrintSettings,
  onProgress?: (p: GeneratePDFProgress) => void
): Promise<Uint8Array> {
  if (deck.cards.length === 0) throw new Error('Cannot generate PDF: deck has no cards')

  const lib = await loadPdfLib()
  const pdfDoc = await lib.PDFDocument.create()
  const helvetica = await pdfDoc.embedFont(lib.StandardFonts.Helvetica)
  const [paperW, paperH] = getPaperSize(lib, settings)
  const dims = deck.dimensions

  const bleed = Math.max(0, settings.showBleed ? dims.bleed * 2 : 0)
  const cardW = mmToPt(dims.width + bleed)
  const cardH = mmToPt(dims.height + bleed)

  if (cardW > paperW || cardH > paperH) {
    console.warn('DeckForge: Card dimensions exceed page size. Cards will be clipped.')
  }
  const spacing = mmToPt(settings.cardSpacing)
  const margin = mmToPt(10)

  const { cols, rows } = calculateGrid(paperW, paperH, cardW, cardH, spacing, margin)
  const cardsPerPage = cols * rows
  const totalCards = deck.cards.length
  const totalPages = Math.ceil(totalCards / cardsPerPage)

  const frontImages: string[] = []
  for (let i = 0; i < totalCards; i++) {
    onProgress?.({ phase: 'rendering', current: i, total: totalCards * 2 })
    frontImages.push(await renderCard(deck, deck.cards[i], 'front', settings.dpi))
  }

  const backImages: string[] = []
  for (let i = 0; i < totalCards; i++) {
    onProgress?.({ phase: 'rendering', current: totalCards + i, total: totalCards * 2 })
    backImages.push(await renderCard(deck, deck.cards[i], 'back', settings.dpi))
  }

  onProgress?.({ phase: 'composing', current: 0, total: totalPages * 2 })

  let pageCounter = 0
  const layoutPage = async (
    images: string[], pageIdx: number, offset: { x: number; y: number }, isBack: boolean
  ): Promise<void> => {
    pageCounter++
    const page = pdfDoc.addPage([paperW, paperH])
    const startIdx = pageIdx * cardsPerPage
    const gridW = cols * cardW + (cols - 1) * spacing
    const gridH = rows * cardH + (rows - 1) * spacing
    const startX = (paperW - gridW) / 2 + mmToPt(offset.x)
    const startY = (paperH - gridH) / 2 + mmToPt(offset.y)

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = startIdx + r * cols + (isBack ? (cols - 1 - c) : c)
        if (idx >= images.length) continue
        const x = startX + c * (cardW + spacing)
        const y = startY + r * (cardH + spacing)
        const pdfY = paperH - y - cardH
        const img = await embedCardImage(pdfDoc, images[idx])
        page.drawImage(img, { x, y: pdfY, width: cardW, height: cardH })
        if (settings.trimMarks) drawTrimMarks(lib, page, x, y, cardW, cardH, paperH)
      }
    }
    if (settings.trimMarks) {
      drawRegistrationMarks(lib, page, paperW, paperH)
      drawColorBars(lib, page)
      drawFoldMarks(lib, page, paperW, paperH)
      drawPageInfo(lib, page, helvetica, deck.name, pageCounter, totalPages * 2)
    }
  }

  for (let p = 0; p < totalPages; p++) {
    onProgress?.({ phase: 'composing', current: p, total: totalPages * 2 })
    await layoutPage(frontImages, p, settings.frontOffset, false)
  }
  for (let p = 0; p < totalPages; p++) {
    onProgress?.({ phase: 'composing', current: totalPages + p, total: totalPages * 2 })
    await layoutPage(backImages, p, settings.backOffset, true)
  }

  return pdfDoc.save()
}

export async function generateTestSheet(
  settings: PrintSettings,
  dimensions: CardDimensions
): Promise<Uint8Array> {
  const lib = await loadPdfLib()
  const pdfDoc = await lib.PDFDocument.create()
  const [paperW, paperH] = getPaperSize(lib, settings)

  const cardW = mmToPt(dimensions.width + (settings.showBleed ? dimensions.bleed * 2 : 0))
  const cardH = mmToPt(dimensions.height + (settings.showBleed ? dimensions.bleed * 2 : 0))
  const spacing = mmToPt(settings.cardSpacing)
  const margin = mmToPt(10)
  const { cols, rows } = calculateGrid(paperW, paperH, cardW, cardH, spacing, margin)
  const page = pdfDoc.addPage([paperW, paperH])
  const gridW = cols * cardW + (cols - 1) * spacing
  const gridH = rows * cardH + (rows - 1) * spacing
  const startX = (paperW - gridW) / 2
  const startY = (paperH + gridH) / 2

  const dashLength = 4
  const gapLength = 4

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * (cardW + spacing)
      const y = startY - r * (cardH + spacing) - cardH
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
              color: lib.rgb(0.5, 0.5, 0.5)
            })
          }
          pos = end
          drawing = !drawing
        }
      }
      if (settings.trimMarks) drawTrimMarks(lib, page, x, paperH - (y + cardH), cardW, cardH, paperH)
    }
  }

  page.drawText(
    `Test Sheet — ${dimensions.width}×${dimensions.height}mm — ${cols}×${rows} grid`,
    { x: mmToPt(10), y: paperH - mmToPt(7), size: 8, color: lib.rgb(0.4, 0.4, 0.4) }
  )

  return pdfDoc.save()
}

export async function generateCutGuide(
  deck: Deck,
  settings: PrintSettings
): Promise<Uint8Array> {
  if (deck.cards.length === 0) throw new Error('Cannot generate cut guide: deck has no cards')

  const lib = await loadPdfLib()
  const pdfDoc = await lib.PDFDocument.create()
  const font = await pdfDoc.embedFont(lib.StandardFonts.Helvetica)
  const [paperW, paperH] = getPaperSize(lib, settings)
  const dims = deck.dimensions

  const bleed = Math.max(0, settings.showBleed ? dims.bleed * 2 : 0)
  const cardW = mmToPt(dims.width + bleed)
  const cardH = mmToPt(dims.height + bleed)
  const spacing = mmToPt(settings.cardSpacing)
  const margin = mmToPt(10)
  const { cols, rows } = calculateGrid(paperW, paperH, cardW, cardH, spacing, margin)
  const cardsPerPage = cols * rows
  const totalCards = deck.cards.length
  const totalPages = Math.ceil(totalCards / cardsPerPage)

  for (let p = 0; p < totalPages; p++) {
    const page = pdfDoc.addPage([paperW, paperH])
    const startIdx = p * cardsPerPage
    const gridW = cols * cardW + (cols - 1) * spacing
    const gridH = rows * cardH + (rows - 1) * spacing
    const startX = (paperW - gridW) / 2
    const startY = (paperH + gridH) / 2

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = startIdx + r * cols + c
        if (idx >= totalCards) continue
        const x = startX + c * (cardW + spacing)
        const y = startY - r * (cardH + spacing) - cardH

        page.drawRectangle({
          x, y, width: cardW, height: cardH,
          borderColor: lib.rgb(0, 0, 0), borderWidth: 0.5, color: undefined
        })

        const card = deck.cards[idx]
        const label = `#${idx + 1}`
        const name = card.name.length > 20 ? card.name.slice(0, 20) + '…' : card.name
        const labelWidth = font.widthOfTextAtSize(label, 10)
        const nameWidth = font.widthOfTextAtSize(name, 7)

        page.drawText(label, {
          x: x + (cardW - labelWidth) / 2, y: y + cardH / 2 + 4,
          size: 10, font, color: lib.rgb(0, 0, 0)
        })
        page.drawText(name, {
          x: x + (cardW - nameWidth) / 2, y: y + cardH / 2 - 10,
          size: 7, font, color: lib.rgb(0.3, 0.3, 0.3)
        })

        if (settings.trimMarks) drawTrimMarks(lib, page, x, paperH - (y + cardH), cardW, cardH, paperH)
      }
    }

    drawPageInfo(lib, page, font, deck.name + ' — Cut Guide', p + 1, totalPages)
    if (settings.trimMarks) drawRegistrationMarks(lib, page, paperW, paperH)
  }

  return pdfDoc.save()
}
