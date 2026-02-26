import { readPsd } from 'ag-psd'
import 'ag-psd/initialize-canvas'
import { v4 as uuid } from 'uuid'
import type { ComponentDefinition, ComponentSlot, Layer, TextLayer, ImageLayer, ShapeLayer } from '../types'

export interface PsdLayerInfo {
  name: string
  visible: boolean
  bounds: { x: number; y: number; width: number; height: number }
  hasImage: boolean
  hasText: boolean
  textContent?: string
  imageDataUrl?: string
  children?: PsdLayerInfo[]
}

/** Parse a PSD file buffer and extract layer info */
export function parsePsd(buffer: ArrayBuffer): {
  width: number
  height: number
  layers: PsdLayerInfo[]
} {
  const psd = readPsd(buffer, {
    skipCompositeImageData: false,
    skipLayerImageData: false,
    skipThumbnail: false
  })

  const width = psd.width
  const height = psd.height

  function extractLayer(layer: any): PsdLayerInfo {
    const bounds = {
      x: layer.left ?? 0,
      y: layer.top ?? 0,
      width: (layer.right ?? layer.left ?? 0) - (layer.left ?? 0),
      height: (layer.bottom ?? layer.top ?? 0) - (layer.top ?? 0)
    }

    let imageDataUrl: string | undefined
    if (layer.canvas) {
      try {
        imageDataUrl = layer.canvas.toDataURL('image/png')
      } catch {
        // canvas may not be available in all environments
      }
    }

    const info: PsdLayerInfo = {
      name: layer.name ?? 'Untitled',
      visible: layer.hidden !== true,
      bounds,
      hasImage: !!layer.canvas,
      hasText: !!layer.text,
      textContent: layer.text?.text,
      imageDataUrl,
      children: layer.children?.map(extractLayer)
    }

    return info
  }

  const layers = (psd.children ?? []).map(extractLayer)

  return { width, height, layers }
}

/** Convert PSD pixel coords to mm given PSD dimensions and target mm size */
function pxToMm(px: number, totalPx: number, totalMm: number): number {
  return (px / totalPx) * totalMm
}

/** Create a ComponentDefinition from parsed PSD layers */
export function psdToComponentDefinition(
  name: string,
  psdData: { width: number; height: number; layers: PsdLayerInfo[] },
  targetWidthMm: number,
  targetHeightMm: number,
  slotMappings: Record<string, { type: 'text' | 'image' | 'number'; slotName: string }>
): ComponentDefinition {
  const now = new Date().toISOString()
  const compLayers: Layer[] = []
  const slots: ComponentSlot[] = []

  function processLayer(layer: PsdLayerInfo): void {
    const x = pxToMm(layer.bounds.x, psdData.width, targetWidthMm)
    const y = pxToMm(layer.bounds.y, psdData.height, targetHeightMm)
    const w = pxToMm(layer.bounds.width, psdData.width, targetWidthMm)
    const h = pxToMm(layer.bounds.height, psdData.height, targetHeightMm)

    const mapping = slotMappings[layer.name]

    if (mapping) {
      // This layer becomes a dynamic slot
      slots.push({
        id: uuid(),
        name: mapping.slotName,
        type: mapping.type,
        bounds: { x, y, width: w, height: h },
        defaultValue: layer.textContent ?? ''
      })
    }

    if (layer.hasText && layer.textContent) {
      const textLayer: TextLayer = {
        id: uuid(),
        type: 'text',
        name: layer.name,
        x, y, width: w, height: h,
        rotation: 0,
        opacity: layer.visible ? 1 : 0,
        visible: layer.visible,
        locked: false,
        bindTo: mapping ? mapping.slotName : undefined,
        text: layer.textContent,
        fontSize: 4,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'normal',
        fontStyle: 'normal',
        fill: '#000000',
        align: 'left',
        verticalAlign: 'top',
        lineHeight: 1.2,
        letterSpacing: 0,
        textDecoration: ''
      }
      compLayers.push(textLayer)
    } else if (layer.hasImage && layer.imageDataUrl) {
      const imgLayer: ImageLayer = {
        id: uuid(),
        type: 'image',
        name: layer.name,
        x, y, width: w, height: h,
        rotation: 0,
        opacity: layer.visible ? 1 : 0,
        visible: layer.visible,
        locked: false,
        bindTo: mapping ? mapping.slotName : undefined,
        src: layer.imageDataUrl,
        fit: 'cover',
        filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: false }
      }
      compLayers.push(imgLayer)
    } else if (layer.bounds.width > 0 && layer.bounds.height > 0) {
      const shapeLayer: ShapeLayer = {
        id: uuid(),
        type: 'shape',
        name: layer.name,
        x, y, width: w, height: h,
        rotation: 0,
        opacity: layer.visible ? 1 : 0,
        visible: layer.visible,
        locked: false,
        shapeKind: 'rect',
        fill: '#cccccc',
        stroke: '',
        strokeWidth: 0
      }
      compLayers.push(shapeLayer)
    }

    // Process children
    if (layer.children) {
      layer.children.forEach(processLayer)
    }
  }

  psdData.layers.forEach(processLayer)

  return {
    id: uuid(),
    name,
    description: `Imported from PSD (${psdData.width}×${psdData.height}px)`,
    width: targetWidthMm,
    height: targetHeightMm,
    layers: compLayers,
    slots,
    createdAt: now,
    updatedAt: now
  }
}

/** Read a File object as ArrayBuffer and parse as PSD */
export async function importPsdFile(file: File): Promise<{
  width: number
  height: number
  layers: PsdLayerInfo[]
}> {
  const buffer = await file.arrayBuffer()
  return parsePsd(buffer)
}
