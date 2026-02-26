/**
 * DeckForge Card Rendering Engine
 * Renders cards to Canvas/data URL using Konva offscreen stages
 */

import Konva from 'konva'
import type { Deck, CardData, Layer, TextLayer, ShapeLayer, ImageLayer, CardDimensions } from '../types'

/** Convert mm to pixels at given DPI */
function mmToPx(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi)
}

/** Resolve data binding for a layer. Returns the text to display. */
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

/** Load an image source as an HTMLImageElement */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src.slice(0, 60)}…`))
    img.src = src
  })
}

/** Render a single layer to a Konva group */
async function renderLayer(
  layer: Layer, card: CardData, deck: Deck, dpi: number, parent: Konva.Group | Konva.Layer
): Promise<void> {
  if (!layer.visible) return

  const scale = dpi / 25.4 // mm → px at this DPI
  const x = layer.x * scale
  const y = layer.y * scale
  const w = layer.width * scale
  const h = layer.height * scale

  if (layer.type === 'text') {
    const tl = layer as TextLayer
    const boundText = resolveBinding(layer, card, deck)
    const text = boundText ?? tl.text
    const node = new Konva.Text({
      x, y, width: w, height: h,
      text,
      fontSize: tl.fontSize * (dpi / 72), // font size scales with DPI
      fontFamily: tl.fontFamily,
      fontStyle: `${tl.fontWeight} ${tl.fontStyle}`.trim(),
      fill: tl.fill,
      align: tl.align,
      verticalAlign: tl.verticalAlign,
      lineHeight: tl.lineHeight,
      letterSpacing: tl.letterSpacing,
      textDecoration: tl.textDecoration,
      rotation: layer.rotation,
      opacity: layer.opacity,
      stroke: tl.stroke,
      strokeWidth: tl.strokeWidth,
    })
    if (tl.shadowColor) {
      node.shadowColor(tl.shadowColor)
      node.shadowBlur(tl.shadowBlur ?? 0)
      node.shadowOffsetX(tl.shadowOffsetX ?? 0)
      node.shadowOffsetY(tl.shadowOffsetY ?? 0)
    }
    parent.add(node)
  } else if (layer.type === 'shape') {
    const sl = layer as ShapeLayer
    let node: Konva.Shape
    switch (sl.shapeKind) {
      case 'circle':
        node = new Konva.Circle({
          x: x + w / 2, y: y + h / 2, radius: Math.min(w, h) / 2,
          fill: sl.fill, stroke: sl.stroke, strokeWidth: sl.strokeWidth,
          rotation: layer.rotation, opacity: layer.opacity
        })
        break
      case 'ellipse':
        node = new Konva.Ellipse({
          x: x + w / 2, y: y + h / 2, radiusX: w / 2, radiusY: h / 2,
          fill: sl.fill, stroke: sl.stroke, strokeWidth: sl.strokeWidth,
          rotation: layer.rotation, opacity: layer.opacity
        })
        break
      case 'star':
        node = new Konva.Star({
          x: x + w / 2, y: y + h / 2,
          numPoints: sl.numPoints ?? 5,
          innerRadius: (sl.innerRadius ?? Math.min(w, h) / 4),
          outerRadius: Math.min(w, h) / 2,
          fill: sl.fill, stroke: sl.stroke, strokeWidth: sl.strokeWidth,
          rotation: layer.rotation, opacity: layer.opacity
        })
        break
      case 'line':
        node = new Konva.Line({
          points: [x, y, x + w, y + h],
          stroke: sl.stroke, strokeWidth: sl.strokeWidth,
          rotation: layer.rotation, opacity: layer.opacity
        })
        break
      default: // rect, polygon → rect
        node = new Konva.Rect({
          x, y, width: w, height: h,
          fill: sl.fill, stroke: sl.stroke, strokeWidth: sl.strokeWidth,
          cornerRadius: sl.cornerRadius ? sl.cornerRadius * scale : 0,
          rotation: layer.rotation, opacity: layer.opacity
        })
    }
    parent.add(node)
  } else if (layer.type === 'image') {
    const il = layer as ImageLayer
    const src = resolveBinding(layer, card, deck) ?? il.src
    if (!src) return
    try {
      const img = await loadImage(src)
      const node = new Konva.Image({
        x, y, width: w, height: h, image: img,
        rotation: layer.rotation, opacity: layer.opacity
      })
      parent.add(node)
    } catch {
      // Draw placeholder rect on image load failure
      parent.add(new Konva.Rect({
        x, y, width: w, height: h, fill: '#333', stroke: '#666', strokeWidth: 1
      }))
    }
  } else if (layer.type === 'group') {
    const group = new Konva.Group({ x, y, rotation: layer.rotation, opacity: layer.opacity })
    for (const child of layer.children) {
      await renderLayer(child, card, deck, dpi, group)
    }
    parent.add(group)
  }
}

/**
 * Render a card face to a data URL.
 * @returns data URL (image/png)
 */
export async function renderCard(
  deck: Deck, card: CardData, side: 'front' | 'back', dpi: number = 300
): Promise<string> {
  const dims = deck.dimensions
  const w = mmToPx(dims.width, dpi)
  const h = mmToPx(dims.height, dpi)

  // Create offscreen container
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '-9999px'
  document.body.appendChild(container)

  const stage = new Konva.Stage({ container, width: w, height: h })
  const layer = new Konva.Layer()
  stage.add(layer)

  // Background
  layer.add(new Konva.Rect({ x: 0, y: 0, width: w, height: h, fill: '#ffffff' }))

  // Get template layers
  const template = side === 'front' ? deck.frontTemplate : deck.backTemplate
  const layers = side === 'front' ? template.frontLayers : (template.backLayers ?? template.frontLayers)

  for (const l of layers) {
    await renderLayer(l, card, deck, dpi, layer)
  }

  layer.draw()
  const dataUrl = stage.toDataURL({ pixelRatio: 1 })

  // Cleanup
  stage.destroy()
  document.body.removeChild(container)

  return dataUrl
}

/**
 * Export a single card as an image Blob.
 */
export async function exportCardAsImage(
  deck: Deck, card: CardData, side: 'front' | 'back',
  format: 'png' | 'jpeg' = 'png', dpi: number = 300
): Promise<Blob> {
  const dataUrl = await renderCard(deck, card, side, dpi)
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'

  // Convert data URL to blob
  const res = await fetch(dataUrl)
  const blob = await res.blob()

  if (blob.type === mimeType) return blob
  // Convert if needed
  const canvas = document.createElement('canvas')
  const img = await loadImage(dataUrl)
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), mimeType, 0.95))
}

/**
 * Export all cards (fronts) as image blobs.
 */
export async function exportAllCards(
  deck: Deck, format: 'png' | 'jpeg' = 'png', dpi: number = 300,
  onProgress?: (current: number, total: number) => void
): Promise<Blob[]> {
  const blobs: Blob[] = []
  for (let i = 0; i < deck.cards.length; i++) {
    onProgress?.(i, deck.cards.length)
    blobs.push(await exportCardAsImage(deck, deck.cards[i], 'front', format, dpi))
  }
  onProgress?.(deck.cards.length, deck.cards.length)
  return blobs
}
