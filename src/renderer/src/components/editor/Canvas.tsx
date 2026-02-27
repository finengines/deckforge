import React from "react"
import { useRef, useCallback, useEffect, useState, type DragEvent as ReactDragEvent } from 'react'
import { v4 as uuid } from 'uuid'
import { Stage, Layer, Rect, Text, Line, Image as KonvaImage, Transformer, Group } from 'react-konva'
import Konva from 'konva'
import { useEditorStore } from '../../stores/editorStore'
import type { Layer as LayerType, TextLayer, ShapeLayer, ImageLayer, ComponentLayer as ComponentLayerType, GroupLayer, CardData, CardCategory } from '../../types'
import { ComponentLayerRenderer } from './ComponentLayerRenderer'
import { useImage } from '../../hooks/useImage'
import { snapToGrid, getSnapLines, type SnapLine, type SnapConfig } from '../../lib/snapping'
import { Rulers } from './Rulers'
import { LayoutGuides } from './LayoutGuides'
import { useContextMenu } from '../../hooks/useContextMenu'
import { ContextMenu } from '../ContextMenu'
import { ImageCropDialog, type CropParams } from '../ImageCropDialog'

/** Scale factor for canvas display: 3px per mm for comfortable editing */
const SCREEN_SCALE = 3

// ---------- Helper: Resolve bound layer data ----------
function resolveBindTo(layer: LayerType, card: CardData | null, categories: CardCategory[]): string | undefined {
  if (!layer.bindTo) return undefined
  if (!card) return `{{${layer.bindTo}}}`
  
  switch (layer.bindTo) {
    case 'name': return card.name
    case 'description': return card.description || ''
    case 'funFact': return card.funFact || ''
    case 'image': return card.image
    default:
      if (layer.bindTo.startsWith('stat:')) {
        const catId = layer.bindTo.slice(5)
        const cat = categories.find(c => c.id === catId)
        const val = card.stats[catId]
        return val !== undefined ? `${val}${cat?.unit ? ' ' + cat.unit : ''}` : '—'
      }
      return undefined
  }
}

// ---------- Image layer sub-component ----------
function ImageLayerNode({
  layer,
  commonProps,
  resolvedSrc
}: {
  layer: ImageLayer
  commonProps: Record<string, unknown>
  resolvedSrc?: string
}): React.JSX.Element {
  const [image, status] = useImage(resolvedSrc || layer.src)

  if (status === 'loaded' && image) {
    return <KonvaImage {...commonProps} image={image} />
  }
  // Placeholder while loading or on error
  return (
    <Rect
      {...commonProps}
      fill={status === 'error' ? '#4a2020' : '#333'}
      stroke="#555"
      strokeWidth={1}
    />
  )
}

export const Canvas = React.memo(function Canvas(): React.JSX.Element {
  const stageRef = useRef<Konva.Stage>(null)
  const transformerRef = useRef<Konva.Transformer>(null)

  const deck = useEditorStore((s) => s.currentDeck)
  const selectedCardId = useEditorStore((s) => s.selectedCardId)
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds)
  const editingSide = useEditorStore((s) => s.editingSide)
  const zoom = useEditorStore((s) => s.zoom)
  const panOffset = useEditorStore((s) => s.panOffset)
  const mode = useEditorStore((s) => s.mode)
  const snapToGridEnabled = useEditorStore((s) => s.snapToGrid)
  const snapToElements = useEditorStore((s) => s.snapToElements)
  const snapToCanvas = useEditorStore((s) => s.snapToCanvas)
  const gridSize = useEditorStore((s) => s.gridSize)
  const showRulers = useEditorStore((s) => s.showRulers)
  const showGrid = useEditorStore((s) => s.showGrid)
  const showLayoutGuides = useEditorStore((s) => s.showLayoutGuides)
  const hoveredLayerId = useEditorStore((s) => s.hoveredLayerId)
  const setHoveredLayerId = useEditorStore((s) => s.setHoveredLayerId)
  const selectLayers = useEditorStore((s) => s.selectLayers)
  const altKeyHeld = useEditorStore((s) => s.altKeyHeld)
  const setAltKeyHeld = useEditorStore((s) => s.setAltKeyHeld)
  const setMousePositionMm = useEditorStore((s) => s.setMousePositionMm)
  const updateLayer = useEditorStore((s) => s.updateLayer)
  const setPanOffset = useEditorStore((s) => s.setPanOffset)
  const setZoom = useEditorStore((s) => s.setZoom)

  const addLayer = useEditorStore((s) => s.addLayer)

  const [snapLines, setSnapLines] = useState<SnapLine[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [selectionBox, setSelectionBox] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null)
  const [distanceIndicators, setDistanceIndicators] = useState<Array<{
    id: string
    x1: number
    y1: number
    x2: number
    y2: number
    distance: number
    axis: 'h' | 'v'
  }>>([])

  const panStartRef = useRef<{ x: number; y: number } | null>(null)
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null)
  const { menu, showMenu, hideMenu } = useContextMenu()
  const [cropTarget, setCropTarget] = useState<{ src: string; width: number; height: number; layerId: string } | null>(null)

  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']

  const isImageFile = useCallback((file: File): boolean => {
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) return true
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    return ALLOWED_EXTENSIONS.includes(ext)
  }, [])

  // Alt key handling for measurements
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && !altKeyHeld) {
        setAltKeyHeld(true)
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.altKey && altKeyHeld) {
        setAltKeyHeld(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', () => setAltKeyHeld(false))
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', () => setAltKeyHeld(false))
    }
  }, [altKeyHeld, setAltKeyHeld])

  const handleCanvasDragOver = useCallback((e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes('Files')) {
      e.dataTransfer.dropEffect = 'copy'
      setIsDragOver(true)
    }
  }, [])

  const handleCanvasDragLeave = useCallback((e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleCanvasDrop = useCallback(async (e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files).filter(isImageFile)
    if (files.length === 0) return

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Array.from(new Uint8Array(arrayBuffer))
      // Convert to data URL so it renders regardless of Electron security settings
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
      // Also save to disk for persistence
      const result = await window.api.image.importBuffer({ buffer, filename: file.name })
      if (result.success && result.data) {
        const newLayer: ImageLayer = {
          id: uuid(),
          type: 'image',
          name: file.name,
          x: 5,
          y: 5,
          width: 50,
          height: 50,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          src: dataUrl,
          fit: 'contain',
          filters: { brightness: 0, contrast: 0, saturation: 0, blur: 0, grayscale: false }
        }
        addLayer(newLayer)
      }
    }
  }, [isImageFile, addLayer])

  if (!deck) return <div className="canvas-container" />

  const dims = deck.dimensions
  const cardW = dims.width * SCREEN_SCALE
  const cardH = dims.height * SCREEN_SCALE
  const bleed = dims.bleed * SCREEN_SCALE

  const template = editingSide === 'front' ? deck.frontTemplate : deck.backTemplate
  const layers = editingSide === 'back' && template.backLayers !== null
    ? template.backLayers
    : template.frontLayers

  // Update transformer when selection changes
  useEffect(() => {
    const transformer = transformerRef.current
    const stage = stageRef.current
    if (!transformer || !stage) return

    const nodes = selectedLayerIds
      .map((id) => stage.findOne(`#${id}`))
      .filter(Boolean) as Konva.Node[]

    transformer.nodes(nodes)
    transformer.getLayer()?.batchDraw()
  }, [selectedLayerIds])

  // --- Click handling (multi-select with shift) ---
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const currentMode = useEditorStore.getState().mode

      if (e.target === e.target.getStage()) {
        // Clicking on empty canvas area
        if (currentMode === 'text') {
          // Create a text layer at click position
          const stage = e.target.getStage()!
          const pointer = stage.getPointerPosition()!
          const x = (pointer.x - panOffset.x) / zoom / SCREEN_SCALE
          const y = (pointer.y - panOffset.y) / zoom / SCREEN_SCALE
          const newLayer: TextLayer = {
            id: uuid(),
            type: 'text',
            name: 'Text',
            x,
            y,
            width: 40,
            height: 10,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            text: 'New Text',
            fontSize: 4,
            fontFamily: 'Inter',
            fontWeight: '400',
            fontStyle: 'normal',
            fill: '#000000',
            align: 'left',
            verticalAlign: 'top',
            lineHeight: 1.2,
            letterSpacing: 0,
            textDecoration: ''
          }
          addLayer(newLayer)
          useEditorStore.getState().setMode('select')
          return
        }

        if (currentMode === 'image') {
          // Open file picker for image
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml'
          input.onchange = async (): Promise<void> => {
            const file = input.files?.[0]
            if (!file) return
            const dataUrl2 = await new Promise<string>((resolve) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.readAsDataURL(file)
            })
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Array.from(new Uint8Array(arrayBuffer))
            const result = await window.api.image.importBuffer({ buffer, filename: file.name })
            if (result.success && result.data) {
              const stage = stageRef.current
              const pointer = stage?.getPointerPosition()
              const x = pointer ? (pointer.x - panOffset.x) / zoom / SCREEN_SCALE : 5
              const y = pointer ? (pointer.y - panOffset.y) / zoom / SCREEN_SCALE : 5
              const newLayer: ImageLayer = {
                id: uuid(),
                type: 'image',
                name: file.name,
                x,
                y,
                width: 50,
                height: 50,
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false,
                src: dataUrl2,
                fit: 'contain',
                filters: { brightness: 0, contrast: 0, saturation: 0, blur: 0, grayscale: false }
              }
              addLayer(newLayer)
            }
            useEditorStore.getState().setMode('select')
          }
          input.click()
          return
        }

        if (currentMode === 'shape') {
          // Create a rectangle at click position
          const stage = e.target.getStage()!
          const pointer = stage.getPointerPosition()!
          const x = (pointer.x - panOffset.x) / zoom / SCREEN_SCALE
          const y = (pointer.y - panOffset.y) / zoom / SCREEN_SCALE
          const newLayer: ShapeLayer = {
            id: uuid(),
            type: 'shape',
            name: 'Rectangle',
            x,
            y,
            width: 30,
            height: 20,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            shapeKind: 'rect',
            fill: '#4a9eff',
            stroke: '#000000',
            strokeWidth: 0.5,
            cornerRadius: 1
          }
          addLayer(newLayer)
          useEditorStore.getState().setMode('select')
          return
        }

        if (currentMode === 'pan') {
          // Pan mode: clicking empty area does nothing (drag handled separately)
          return
        }

        selectLayers([])
        return
      }
      const id = e.target.id()
      if (!id) return

      if (e.evt.shiftKey) {
        // Toggle selection
        const current = useEditorStore.getState().selectedLayerIds
        if (current.includes(id)) {
          selectLayers(current.filter((lid) => lid !== id))
        } else {
          selectLayers([...current, id])
        }
      } else {
        selectLayers([id])
      }
    },
    [selectLayers, addLayer, zoom, panOffset]
  )

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault()
      if (e.evt.ctrlKey || e.evt.metaKey) {
        const delta = e.evt.deltaY > 0 ? -0.05 : 0.05
        setZoom(zoom + delta)
      } else {
        setPanOffset({
          x: panOffset.x - e.evt.deltaX,
          y: panOffset.y - e.evt.deltaY
        })
      }
    },
    [zoom, panOffset, setZoom, setPanOffset]
  )

  // --- Drag with snapping ---
  const handleDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target
      if (!snapToGridEnabled && !snapToElements && !snapToCanvas) {
        setSnapLines([])
        setDistanceIndicators([])
        return
      }

      const stage = stageRef.current
      if (!stage) return

      // Collect other layer nodes
      const allNodes = layers
        .filter((l) => l.id !== node.id())
        .map((l) => stage.findOne(`#${l.id}`))
        .filter(Boolean) as Konva.Node[]

      const gridPx = gridSize * SCREEN_SCALE
      let newX = node.x()
      let newY = node.y()

      // Build snap config
      const snapConfig: SnapConfig = {
        snapToGrid: snapToGridEnabled,
        snapToElements,
        snapToCanvas,
        gridSize: gridPx,
        zoom,
        canvasWidth: cardW,
        canvasHeight: cardH
      }

      // Element-to-element snapping
      const snap = getSnapLines(node, allNodes, snapConfig)
      if (snap.x !== null) newX = snap.x
      else if (snapToGridEnabled) newX = snapToGrid(newX, gridPx)

      if (snap.y !== null) newY = snap.y
      else if (snapToGridEnabled) newY = snapToGrid(newY, gridPx)

      node.x(newX)
      node.y(newY)
      setSnapLines(snap.lines)

      // Calculate distance indicators
      const indicators: typeof distanceIndicators = []
      const nodeBox = {
        x: newX,
        y: newY,
        width: node.width(),
        height: node.height()
      }

      const DISTANCE_THRESHOLD_MM = 50
      const DISTANCE_THRESHOLD_PX = DISTANCE_THRESHOLD_MM * SCREEN_SCALE

      // Check horizontal distances
      for (const otherNode of allNodes) {
        const otherBox = {
          x: otherNode.x(),
          y: otherNode.y(),
          width: otherNode.width(),
          height: otherNode.height()
        }

        // Check if they overlap vertically (so horizontal distance makes sense)
        const vOverlap = !(nodeBox.y + nodeBox.height < otherBox.y || nodeBox.y > otherBox.y + otherBox.height)
        
        if (vOverlap) {
          let distance = 0
          let x1 = 0
          let x2 = 0

          if (nodeBox.x + nodeBox.width < otherBox.x) {
            // Node is to the left of other
            distance = otherBox.x - (nodeBox.x + nodeBox.width)
            x1 = nodeBox.x + nodeBox.width
            x2 = otherBox.x
          } else if (otherBox.x + otherBox.width < nodeBox.x) {
            // Node is to the right of other
            distance = nodeBox.x - (otherBox.x + otherBox.width)
            x1 = otherBox.x + otherBox.width
            x2 = nodeBox.x
          }

          if (distance > 0 && distance < DISTANCE_THRESHOLD_PX) {
            const midY = Math.max(nodeBox.y, otherBox.y) + Math.min(nodeBox.y + nodeBox.height, otherBox.y + otherBox.height - Math.max(nodeBox.y, otherBox.y)) / 2
            indicators.push({
              id: `h-${node.id()}-${otherNode.id()}`,
              x1,
              y1: midY,
              x2,
              y2: midY,
              distance,
              axis: 'h'
            })
          }
        }

        // Check vertical distances
        const hOverlap = !(nodeBox.x + nodeBox.width < otherBox.x || nodeBox.x > otherBox.x + otherBox.width)
        
        if (hOverlap) {
          let distance = 0
          let y1 = 0
          let y2 = 0

          if (nodeBox.y + nodeBox.height < otherBox.y) {
            // Node is above other
            distance = otherBox.y - (nodeBox.y + nodeBox.height)
            y1 = nodeBox.y + nodeBox.height
            y2 = otherBox.y
          } else if (otherBox.y + otherBox.height < nodeBox.y) {
            // Node is below other
            distance = nodeBox.y - (otherBox.y + otherBox.height)
            y1 = otherBox.y + otherBox.height
            y2 = nodeBox.y
          }

          if (distance > 0 && distance < DISTANCE_THRESHOLD_PX) {
            const midX = Math.max(nodeBox.x, otherBox.x) + Math.min(nodeBox.x + nodeBox.width, otherBox.x + otherBox.width - Math.max(nodeBox.x, otherBox.x)) / 2
            indicators.push({
              id: `v-${node.id()}-${otherNode.id()}`,
              x1: midX,
              y1,
              x2: midX,
              y2,
              distance,
              axis: 'v'
            })
          }
        }
      }

      setDistanceIndicators(indicators)
    },
    [snapToGridEnabled, snapToElements, snapToCanvas, gridSize, zoom, layers, cardW, cardH]
  )

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      setSnapLines([])
      setDistanceIndicators([])
      const id = e.target.id()
      if (id) {
        updateLayer(id, {
          x: e.target.x() / SCREEN_SCALE,
          y: e.target.y() / SCREEN_SCALE
        })
      }
    },
    [updateLayer]
  )

  const handleTransformEnd = useCallback(
    (e: Konva.KonvaEventObject<Event>) => {
      const node = e.target
      const id = node.id()
      if (id) {
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()
        node.scaleX(1)
        node.scaleY(1)
        updateLayer(id, {
          x: node.x() / SCREEN_SCALE,
          y: node.y() / SCREEN_SCALE,
          width: (node.width() * scaleX) / SCREEN_SCALE,
          height: (node.height() * scaleY) / SCREEN_SCALE,
          rotation: node.rotation()
        })
      }
    },
    [updateLayer]
  )

  // Helper functions for alt-hold measurements
  const isBetween = (x: number, start: number, end: number): boolean => {
    return (start <= x && x <= end) || (end <= x && x <= start)
  }

  const getAltMeasurements = useCallback(() => {
    if (!altKeyHeld || selectedLayerIds.length !== 1 || !hoveredLayerId || selectedLayerIds[0] === hoveredLayerId) {
      return []
    }

    const selectedLayer = layers.find(l => l.id === selectedLayerIds[0])
    const hoveredLayer = layers.find(l => l.id === hoveredLayerId)
    if (!selectedLayer || !hoveredLayer) return []

    const s = {
      x: selectedLayer.x * SCREEN_SCALE,
      y: selectedLayer.y * SCREEN_SCALE,
      width: selectedLayer.width * SCREEN_SCALE,
      height: selectedLayer.height * SCREEN_SCALE,
      right: (selectedLayer.x + selectedLayer.width) * SCREEN_SCALE,
      bottom: (selectedLayer.y + selectedLayer.height) * SCREEN_SCALE
    }

    const h = {
      x: hoveredLayer.x * SCREEN_SCALE,
      y: hoveredLayer.y * SCREEN_SCALE,
      width: hoveredLayer.width * SCREEN_SCALE,
      height: hoveredLayer.height * SCREEN_SCALE,
      right: (hoveredLayer.x + hoveredLayer.width) * SCREEN_SCALE,
      bottom: (hoveredLayer.y + hoveredLayer.height) * SCREEN_SCALE
    }

    const measurements: Array<{
      x1: number
      y1: number
      x2: number
      y2: number
      distance: number
      supportLine?: { x1: number; y1: number; x2: number; y2: number }
    }> = []

    // Horizontal distance
    const midY = s.y + s.height / 2
    if (s.x > h.right) {
      // Selected is to the right
      measurements.push({
        x1: h.right,
        y1: midY,
        x2: s.x,
        y2: midY,
        distance: (s.x - h.right) / SCREEN_SCALE,
        supportLine: !isBetween(midY, h.y, h.bottom) ? { x1: h.right, y1: h.y, x2: h.right, y2: midY } : undefined
      })
    } else if (s.right < h.x) {
      // Selected is to the left
      measurements.push({
        x1: s.right,
        y1: midY,
        x2: h.x,
        y2: midY,
        distance: (h.x - s.right) / SCREEN_SCALE,
        supportLine: !isBetween(midY, h.y, h.bottom) ? { x1: h.x, y1: h.y, x2: h.x, y2: midY } : undefined
      })
    }

    // Vertical distance
    const midX = s.x + s.width / 2
    if (s.y > h.bottom) {
      // Selected is below
      measurements.push({
        x1: midX,
        y1: h.bottom,
        x2: midX,
        y2: s.y,
        distance: (s.y - h.bottom) / SCREEN_SCALE,
        supportLine: !isBetween(midX, h.x, h.right) ? { x1: h.x, y1: h.bottom, x2: midX, y2: h.bottom } : undefined
      })
    } else if (s.bottom < h.y) {
      // Selected is above
      measurements.push({
        x1: midX,
        y1: s.bottom,
        x2: midX,
        y2: h.y,
        distance: (h.y - s.bottom) / SCREEN_SCALE,
        supportLine: !isBetween(midX, h.x, h.right) ? { x1: h.x, y1: h.y, x2: midX, y2: h.y } : undefined
      })
    }

    return measurements
  }, [altKeyHeld, selectedLayerIds, hoveredLayerId, layers])

  const renderLayer = (layer: LayerType): React.JSX.Element | null => {
    if (!layer.visible) return null

    const currentCard = deck.cards.find((c) => c.id === selectedCardId) ?? null
    const resolvedValue = resolveBindTo(layer, currentCard, deck.categories)

    const commonProps = {
      id: layer.id,
      key: layer.id,
      x: layer.x * SCREEN_SCALE,
      y: layer.y * SCREEN_SCALE,
      width: layer.width * SCREEN_SCALE,
      height: layer.height * SCREEN_SCALE,
      rotation: layer.rotation,
      opacity: layer.opacity,
      draggable: !layer.locked && mode === 'select',
      onDragMove: handleDragMove,
      onDragEnd: handleDragEnd,
      onTransformEnd: handleTransformEnd,
      onMouseEnter: () => setHoveredLayerId(layer.id),
      onMouseLeave: () => setHoveredLayerId(null)
    }

    // Helper to get active fill/stroke/shadow
    const activeFill = layer.fills?.find(f => !f.hidden)
    const activeStroke = layer.strokes?.find(s => !s.hidden)
    const activeShadow = layer.shadows?.find(s => !s.hidden)
    const activeBlur = layer.blur && !layer.blur.hidden ? layer.blur : null

    // Apply filters if blur is active
    const filters = activeBlur ? [Konva.Filters.Blur] : undefined

    switch (layer.type) {
      case 'text': {
        const tl = layer as TextLayer
        const displayText = resolvedValue !== undefined ? resolvedValue : tl.text
        
        // Apply stroke style
        const strokeDash = activeStroke?.style === 'dashed' 
          ? [8, 4] 
          : activeStroke?.style === 'dotted' 
          ? [2, 2] 
          : undefined

        return (
          <Text
            {...commonProps}
            text={displayText}
            fontSize={tl.fontSize * SCREEN_SCALE}
            fontFamily={tl.fontFamily}
            fontStyle={`${tl.fontWeight} ${tl.fontStyle}`}
            fill={activeFill ? activeFill.color : tl.fill}
            opacity={(activeFill ? activeFill.opacity : 1) * layer.opacity}
            align={tl.align}
            verticalAlign={tl.verticalAlign}
            lineHeight={tl.lineHeight}
            letterSpacing={tl.letterSpacing}
            stroke={activeStroke ? activeStroke.color : tl.stroke}
            strokeWidth={activeStroke ? activeStroke.width * SCREEN_SCALE : tl.strokeWidth}
            dash={strokeDash}
            shadowColor={activeShadow?.color}
            shadowBlur={activeShadow ? activeShadow.blur * SCREEN_SCALE : undefined}
            shadowOffsetX={activeShadow ? activeShadow.offsetX * SCREEN_SCALE : undefined}
            shadowOffsetY={activeShadow ? activeShadow.offsetY * SCREEN_SCALE : undefined}
            shadowOpacity={activeShadow?.opacity}
            filters={filters}
            blurRadius={activeBlur ? activeBlur.value : undefined}
          />
        )
      }
      case 'shape': {
        const sl = layer as ShapeLayer
        
        // Apply stroke style
        const strokeDash = activeStroke?.style === 'dashed' 
          ? [8, 4] 
          : activeStroke?.style === 'dotted' 
          ? [2, 2] 
          : undefined

        return (
          <Rect
            {...commonProps}
            fill={activeFill ? activeFill.color : sl.fill}
            opacity={(activeFill ? activeFill.opacity : 1) * layer.opacity}
            stroke={activeStroke ? activeStroke.color : sl.stroke}
            strokeWidth={activeStroke ? activeStroke.width * SCREEN_SCALE : sl.strokeWidth}
            dash={strokeDash}
            cornerRadius={(sl.cornerRadius ?? 0) * SCREEN_SCALE}
            shadowColor={activeShadow?.color}
            shadowBlur={activeShadow ? activeShadow.blur * SCREEN_SCALE : undefined}
            shadowOffsetX={activeShadow ? activeShadow.offsetX * SCREEN_SCALE : undefined}
            shadowOffsetY={activeShadow ? activeShadow.offsetY * SCREEN_SCALE : undefined}
            shadowOpacity={activeShadow?.opacity}
            filters={filters}
            blurRadius={activeBlur ? activeBlur.value : undefined}
          />
        )
      }
      case 'image': {
        const imgLayer = layer as ImageLayer
        const resolvedImageSrc = layer.bindTo === 'image' && resolvedValue ? resolvedValue : undefined
        return <ImageLayerNode layer={imgLayer} commonProps={commonProps} resolvedSrc={resolvedImageSrc} />
      }
      case 'component': {
        const cl = layer as ComponentLayerType
        return (
          <ComponentLayerRenderer
            key={layer.id}
            layer={cl}
            cardData={currentCard}
          />
        )
      }
      case 'group': {
        const gl = layer as GroupLayer
        return (
          <Group
            {...commonProps}
          >
            {gl.children.map((child) => {
              // Render children with adjusted positions (already relative to group)
              const childElement = renderLayer(child)
              return childElement
            })}
          </Group>
        )
      }
      default:
        return null
    }
  }

  // --- Right-click context menu ---
  const handleContextMenu = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>) => {
      e.evt.preventDefault()
      const store = useEditorStore.getState()
      const id = e.target.id()
      
      if (!id) {
        // Context menu on empty canvas
        showMenu(e.evt.clientX, e.evt.clientY, [
          {
            label: 'Paste',
            icon: '📋',
            shortcut: '⌘V',
            action: () => {
              // Paste will be handled by keyboard shortcut
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'v', metaKey: true }))
            },
            disabled: true // Paste from clipboard not implemented yet
          }
        ])
        return
      }

      const layer = layers.find((l) => l.id === id)
      if (!layer) return

      const menuItems: Array<{ label: string; icon?: string; shortcut?: string; action: () => void; disabled?: boolean; separator?: boolean }> = []

      // Cut/Copy/Paste/Duplicate
      menuItems.push(
        {
          label: 'Cut',
          icon: '✂️',
          shortcut: '⌘X',
          action: () => {
            // Copy then delete
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', metaKey: true }))
            store.removeLayer(id)
          }
        },
        {
          label: 'Copy',
          icon: '📋',
          shortcut: '⌘C',
          action: () => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', metaKey: true }))
          }
        },
        {
          label: 'Duplicate',
          icon: '⎘',
          shortcut: '⌘D',
          action: () => store.duplicateLayer(id)
        },
        { separator: true } as any
      )

      // Delete
      menuItems.push(
        {
          label: 'Delete',
          icon: '🗑',
          shortcut: 'Del',
          action: () => store.removeLayer(id)
        },
        { separator: true } as any
      )

      // Group/Ungroup
      if (selectedLayerIds.length > 1) {
        menuItems.push({
          label: 'Group',
          icon: '📁',
          shortcut: '⌘G',
          action: () => store.groupLayers(selectedLayerIds)
        })
      }
      if (layer.type === 'group') {
        menuItems.push({
          label: 'Ungroup',
          icon: '📂',
          shortcut: '⌘⇧G',
          action: () => store.ungroupLayer(id)
        })
      }

      // Lock/Unlock
      menuItems.push(
        { separator: true } as any,
        {
          label: layer.locked ? 'Unlock' : 'Lock',
          icon: layer.locked ? '🔓' : '🔒',
          shortcut: '⌘L',
          action: () => store.updateLayer(id, { locked: !layer.locked })
        },
        { separator: true } as any
      )

      // Arrange
      menuItems.push(
        {
          label: 'Bring to Front',
          icon: '⤊',
          shortcut: '⌘]',
          action: () => store.bringToFront([id])
        },
        {
          label: 'Bring Forward',
          icon: '↑',
          shortcut: ']',
          action: () => store.bringForward([id])
        },
        {
          label: 'Send Backward',
          icon: '↓',
          shortcut: '[',
          action: () => store.sendBackward([id])
        },
        {
          label: 'Send to Back',
          icon: '⤋',
          shortcut: '⌘[',
          action: () => store.sendToBack([id])
        }
      )

      // Flip (if applicable)
      if (layer.type !== 'group') {
        menuItems.push(
          { separator: true } as any,
          {
            label: 'Flip Horizontal',
            icon: '⇄',
            action: () => {
              // Flip by negating scale (would need to add scaleX/scaleY to layer type)
              // For now, just rotate 180
              store.updateLayer(id, { rotation: (layer.rotation + 180) % 360 })
            }
          },
          {
            label: 'Flip Vertical',
            icon: '⇅',
            action: () => {
              // Similar to horizontal
              store.updateLayer(id, { rotation: (layer.rotation + 180) % 360 })
            }
          }
        )
      }

      // Image-specific: Crop
      if (layer.type === 'image') {
        const imgLayer = layer as ImageLayer
        menuItems.push(
          { separator: true } as any,
          {
            label: 'Crop / Resize',
            icon: '✂️',
            action: () => {
              const img = new Image()
              img.onload = () => {
                setCropTarget({ src: imgLayer.src, width: img.naturalWidth, height: img.naturalHeight, layerId: imgLayer.id })
              }
              img.onerror = () => {
                setCropTarget({ src: imgLayer.src, width: Math.round(imgLayer.width * 10), height: Math.round(imgLayer.height * 10), layerId: imgLayer.id })
              }
              img.src = imgLayer.src
            }
          }
        )
      }

      showMenu(e.evt.clientX, e.evt.clientY, menuItems)
    },
    [layers, showMenu, selectedLayerIds]
  )

  const handleCropApply = useCallback(
    async (crop: CropParams, resize?: { width: number; height: number }) => {
      if (!cropTarget) return
      const result = await window.api.image.crop({
        inputPath: cropTarget.src,
        crop,
        resize
      })
      if (result.success && result.data) {
        updateLayer(cropTarget.layerId, { src: result.data.path } as any)
      }
      setCropTarget(null)
    },
    [cropTarget, updateLayer]
  )

  // Center card on canvas
  const stageWidth = typeof window !== 'undefined' ? window.innerWidth - 260 * 2 : 800
  const stageHeight = typeof window !== 'undefined' ? window.innerHeight - 44 : 600
  const offsetX = (stageWidth - cardW * zoom) / 2 + panOffset.x
  const offsetY = (stageHeight - cardH * zoom) / 2 + panOffset.y

  return (
    <div
      className={`canvas-container${isDragOver ? ' drop-zone-active' : ''}`}
      style={{ position: 'relative', overflow: 'hidden' }}
      onDragOver={handleCanvasDragOver}
      onDragLeave={handleCanvasDragLeave}
      onDrop={handleCanvasDrop}
    >
      {showRulers && (
        <Rulers
          cardWidth={dims.width}
          cardHeight={dims.height}
          zoom={zoom}
          panOffsetX={panOffset.x}
          panOffsetY={panOffset.y}
          screenScale={SCREEN_SCALE}
          stageWidth={stageWidth}
          stageHeight={stageHeight}
        />
      )}

      <Stage
        ref={stageRef}
        width={stageWidth}
        height={stageHeight}
        onClick={handleStageClick}
        onContextMenu={handleContextMenu}
        onWheel={handleWheel}
        onMouseDown={(e) => {
          const currentMode = useEditorStore.getState().mode
          if (currentMode === 'pan' || e.evt.button === 1) {
            setIsPanning(true)
            panStartRef.current = { x: e.evt.clientX, y: e.evt.clientY }
            e.evt.preventDefault()
            return
          }
          // Selection box: start if clicking on empty stage
          if (currentMode === 'select' && e.target === e.target.getStage()) {
            const stage = e.target.getStage()!
            const pointer = stage.getPointerPosition()!
            selectionStartRef.current = { x: pointer.x, y: pointer.y }
            setSelectionBox({ x1: pointer.x, y1: pointer.y, x2: pointer.x, y2: pointer.y })
          }
        }}
        onMouseMove={(e) => {
          // Update mouse position in mm (relative to card origin)
          const stage = e.target.getStage()
          if (stage) {
            const pointer = stage.getPointerPosition()
            if (pointer) {
              const x = (pointer.x - offsetX) / (zoom * SCREEN_SCALE)
              const y = (pointer.y - offsetY) / (zoom * SCREEN_SCALE)
              if (x >= 0 && x <= dims.width && y >= 0 && y <= dims.height) {
                setMousePositionMm({ x, y })
              } else {
                setMousePositionMm(null)
              }
            }
          }

          if (isPanning && panStartRef.current) {
            const dx = e.evt.clientX - panStartRef.current.x
            const dy = e.evt.clientY - panStartRef.current.y
            panStartRef.current = { x: e.evt.clientX, y: e.evt.clientY }
            setPanOffset({ x: panOffset.x + dx, y: panOffset.y + dy })
          }
          // Selection box: update if dragging
          if (selectionStartRef.current && selectionBox) {
            const stage = e.target.getStage()!
            const pointer = stage.getPointerPosition()!
            setSelectionBox({ ...selectionBox, x2: pointer.x, y2: pointer.y })
          }
        }}
        onMouseUp={(e) => {
          setIsPanning(false)
          panStartRef.current = null

          // Selection box: finalize
          if (selectionStartRef.current && selectionBox) {
            const box = {
              x: Math.min(selectionBox.x1, selectionBox.x2),
              y: Math.min(selectionBox.y1, selectionBox.y2),
              width: Math.abs(selectionBox.x2 - selectionBox.x1),
              height: Math.abs(selectionBox.y2 - selectionBox.y1)
            }

            // Find layers within selection box
            const selectedIds: string[] = []
            for (const layer of layers) {
              const layerBox = {
                x: (layer.x * SCREEN_SCALE * zoom) + offsetX,
                y: (layer.y * SCREEN_SCALE * zoom) + offsetY,
                width: layer.width * SCREEN_SCALE * zoom,
                height: layer.height * SCREEN_SCALE * zoom
              }
              // Simple intersection test
              if (
                layerBox.x < box.x + box.width &&
                layerBox.x + layerBox.width > box.x &&
                layerBox.y < box.y + box.height &&
                layerBox.y + layerBox.height > box.y
              ) {
                selectedIds.push(layer.id)
              }
            }

            if (selectedIds.length > 0) {
              selectLayers(selectedIds)
            }

            selectionStartRef.current = null
            setSelectionBox(null)
          }
        }}
        style={{
          marginLeft: showRulers ? 24 : 0,
          marginTop: showRulers ? 24 : 0,
          cursor: mode === 'pan' ? (isPanning ? 'grabbing' : 'grab') : 'default'
        }}
      >
        <Layer x={offsetX} y={offsetY} scaleX={zoom} scaleY={zoom}>
          {/* Grid */}
          {showGrid && (() => {
            const gridLines: React.JSX.Element[] = []
            const gridSpacing = gridSize * SCREEN_SCALE / 3 // Convert grid size from px to mm equivalent
            const cols = Math.ceil(cardW / gridSpacing) + 1
            const rows = Math.ceil(cardH / gridSpacing) + 1

            // Vertical lines
            for (let i = 0; i <= cols; i++) {
              const x = i * gridSpacing
              gridLines.push(
                <Line
                  key={`v-${i}`}
                  points={[x, 0, x, cardH]}
                  stroke="#333"
                  strokeWidth={0.5 / zoom}
                  listening={false}
                  opacity={0.3}
                />
              )
            }

            // Horizontal lines
            for (let j = 0; j <= rows; j++) {
              const y = j * gridSpacing
              gridLines.push(
                <Line
                  key={`h-${j}`}
                  points={[0, y, cardW, y]}
                  stroke="#333"
                  strokeWidth={0.5 / zoom}
                  listening={false}
                  opacity={0.3}
                />
              )
            }

            return gridLines
          })()}

          {/* Bleed area */}
          <Rect
            x={-bleed}
            y={-bleed}
            width={cardW + bleed * 2}
            height={cardH + bleed * 2}
            fill="#222"
            stroke="#444"
            strokeWidth={1}
            dash={[4, 4]}
            listening={false}
          />

          {/* Card background */}
          <Rect
            x={0}
            y={0}
            width={cardW}
            height={cardH}
            fill="#ffffff"
            cornerRadius={dims.cornerRadius * SCREEN_SCALE}
            listening={false}
          />

          {/* User layers (clipped to card bounds) */}
          <Group clipX={0} clipY={0} clipWidth={cardW} clipHeight={cardH}>
            {layers.map(renderLayer)}

            {/* Bound layer indicators */}
            {layers.filter(l => l.bindTo && l.visible).map(layer => (
              <Text
                key={`bind-${layer.id}`}
                x={layer.x * SCREEN_SCALE + layer.width * SCREEN_SCALE - 8}
                y={layer.y * SCREEN_SCALE - 8}
                text="🔗"
                fontSize={10}
                listening={false}
                opacity={0.7}
              />
            ))}
          </Group>

          {/* Hover highlight */}
          {hoveredLayerId && !selectedLayerIds.includes(hoveredLayerId) && (() => {
            const hoveredLayer = layers.find((l) => l.id === hoveredLayerId)
            if (!hoveredLayer) return null
            return (
              <Rect
                x={hoveredLayer.x * SCREEN_SCALE}
                y={hoveredLayer.y * SCREEN_SCALE}
                width={hoveredLayer.width * SCREEN_SCALE}
                height={hoveredLayer.height * SCREEN_SCALE}
                rotation={hoveredLayer.rotation}
                stroke="#00ccff"
                strokeWidth={2 / zoom}
                dash={[4, 2]}
                listening={false}
                opacity={0.6}
              />
            )
          })()}

          {/* Snap guide lines */}
          {snapLines.map((line) => {
            // Different colors for different snap types
            const strokeColor = line.type === 'center' ? '#ff00ff' : '#00aaff'
            const strokeWidth = line.type === 'center' ? 2 : 1
            const dash = line.type === 'center' ? [8, 4] : [4, 4]

            return line.direction === 'vertical' ? (
              <Line
                key={line.id}
                points={[line.position, line.start, line.position, line.end]}
                stroke={strokeColor}
                strokeWidth={strokeWidth / zoom}
                dash={dash}
                listening={false}
                shadowColor={strokeColor}
                shadowBlur={4 / zoom}
                shadowOpacity={0.6}
              />
            ) : (
              <Line
                key={line.id}
                points={[line.start, line.position, line.end, line.position]}
                stroke={strokeColor}
                strokeWidth={strokeWidth / zoom}
                dash={dash}
                listening={false}
                shadowColor={strokeColor}
                shadowBlur={4 / zoom}
                shadowOpacity={0.6}
              />
            )
          })}

          {/* Distance indicators */}
          {distanceIndicators.map((indicator) => {
            const distanceMm = indicator.distance / SCREEN_SCALE
            const distanceStr = distanceMm.toFixed(1) + ' mm'
            const midX = (indicator.x1 + indicator.x2) / 2
            const midY = (indicator.y1 + indicator.y2) / 2
            const textWidth = distanceStr.length * 5 / zoom
            const textHeight = 16 / zoom

            return (
              <React.Fragment key={indicator.id}>
                {/* Line */}
                <Line
                  points={[indicator.x1, indicator.y1, indicator.x2, indicator.y2]}
                  stroke="var(--accent)"
                  strokeWidth={1 / zoom}
                  listening={false}
                />
                {/* Tick marks */}
                {indicator.axis === 'h' ? (
                  <>
                    <Line
                      points={[indicator.x1, indicator.y1 - 3 / zoom, indicator.x1, indicator.y1 + 3 / zoom]}
                      stroke="var(--accent)"
                      strokeWidth={1 / zoom}
                      listening={false}
                    />
                    <Line
                      points={[indicator.x2, indicator.y2 - 3 / zoom, indicator.x2, indicator.y2 + 3 / zoom]}
                      stroke="var(--accent)"
                      strokeWidth={1 / zoom}
                      listening={false}
                    />
                  </>
                ) : (
                  <>
                    <Line
                      points={[indicator.x1 - 3 / zoom, indicator.y1, indicator.x1 + 3 / zoom, indicator.y1]}
                      stroke="var(--accent)"
                      strokeWidth={1 / zoom}
                      listening={false}
                    />
                    <Line
                      points={[indicator.x2 - 3 / zoom, indicator.y2, indicator.x2 + 3 / zoom, indicator.y2]}
                      stroke="var(--accent)"
                      strokeWidth={1 / zoom}
                      listening={false}
                    />
                  </>
                )}
                {/* Pill background */}
                <Rect
                  x={midX - textWidth / 2}
                  y={midY - textHeight / 2}
                  width={textWidth}
                  height={textHeight}
                  fill="var(--accent)"
                  cornerRadius={3 / zoom}
                  listening={false}
                />
                {/* Distance text */}
                <Text
                  x={midX}
                  y={midY}
                  text={distanceStr}
                  fontSize={10 / zoom}
                  fill="white"
                  align="center"
                  verticalAlign="middle"
                  offsetX={textWidth / 2}
                  offsetY={5 / zoom}
                  listening={false}
                />
              </React.Fragment>
            )
          })}

          {/* Alt-hold measurements */}
          {getAltMeasurements().map((measurement, idx) => {
            const distanceStr = measurement.distance.toFixed(1) + ' mm'
            const midX = (measurement.x1 + measurement.x2) / 2
            const midY = (measurement.y1 + measurement.y2) / 2
            const textWidth = distanceStr.length * 5 / zoom
            const textHeight = 16 / zoom

            return (
              <React.Fragment key={`alt-measure-${idx}`}>
                {/* Support line (dashed) */}
                {measurement.supportLine && (
                  <Line
                    points={[
                      measurement.supportLine.x1,
                      measurement.supportLine.y1,
                      measurement.supportLine.x2,
                      measurement.supportLine.y2
                    ]}
                    stroke="#ef4444"
                    strokeWidth={1 / zoom}
                    dash={[4, 4]}
                    listening={false}
                  />
                )}
                {/* Main measurement line */}
                <Line
                  points={[measurement.x1, measurement.y1, measurement.x2, measurement.y2]}
                  stroke="#ef4444"
                  strokeWidth={1.5 / zoom}
                  listening={false}
                />
                {/* Pill background */}
                <Rect
                  x={midX - textWidth / 2}
                  y={midY - textHeight / 2}
                  width={textWidth}
                  height={textHeight}
                  fill="#ef4444"
                  cornerRadius={3 / zoom}
                  listening={false}
                />
                {/* Distance text */}
                <Text
                  x={midX}
                  y={midY}
                  text={distanceStr}
                  fontSize={10 / zoom}
                  fill="white"
                  align="center"
                  verticalAlign="middle"
                  offsetX={textWidth / 2}
                  offsetY={5 / zoom}
                  listening={false}
                />
              </React.Fragment>
            )
          })}

          {/* Transformer */}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) return oldBox
              return newBox
            }}
          />
        </Layer>

        {/* Selection Box */}
        {selectionBox && (
          <Layer>
            <Rect
              x={Math.min(selectionBox.x1, selectionBox.x2)}
              y={Math.min(selectionBox.y1, selectionBox.y2)}
              width={Math.abs(selectionBox.x2 - selectionBox.x1)}
              height={Math.abs(selectionBox.y2 - selectionBox.y1)}
              fill="rgba(0, 150, 255, 0.1)"
              stroke="#0096ff"
              strokeWidth={1}
              listening={false}
            />
          </Layer>
        )}

        {showLayoutGuides && (
          <LayoutGuides
            cardWidth={dims.width}
            cardHeight={dims.height}
            bleed={dims.bleed}
            screenScale={SCREEN_SCALE}
            offsetX={offsetX}
            offsetY={offsetY}
            zoom={zoom}
          />
        )}
      </Stage>

      <ContextMenu visible={menu.visible} x={menu.x} y={menu.y} items={menu.items} onClose={hideMenu} />

      {cropTarget && (
        <ImageCropDialog
          imageSrc={cropTarget.src}
          imageWidth={cropTarget.width}
          imageHeight={cropTarget.height}
          onApply={handleCropApply}
          onClose={() => setCropTarget(null)}
        />
      )}

      {/* Canvas info bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '3px 10px',
          fontSize: 11,
          color: 'var(--text-muted)'
        }}
      >
        {dims.width}×{dims.height}mm • {editingSide === 'front' ? 'Front' : 'Back'} •{' '}
        {layers.length} layers • {Math.round(zoom * 100)}%
      </div>
    </div>
  )
})
