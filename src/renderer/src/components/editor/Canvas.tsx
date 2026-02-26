import React from "react"
import { useRef, useCallback, useEffect, useState, type DragEvent as ReactDragEvent } from 'react'
import { v4 as uuid } from 'uuid'
import { Stage, Layer, Rect, Text, Line, Image as KonvaImage, Transformer } from 'react-konva'
import type Konva from 'konva'
import { useEditorStore } from '../../stores/editorStore'
import type { Layer as LayerType, TextLayer, ShapeLayer, ImageLayer, ComponentLayer as ComponentLayerType } from '../../types'
import { ComponentLayerRenderer } from './ComponentLayerRenderer'
import { useImage } from '../../hooks/useImage'
import { snapToGrid, getSnapLines, type SnapLine } from '../../lib/snapping'
import { Rulers } from './Rulers'
import { useContextMenu } from '../../hooks/useContextMenu'
import { ContextMenu } from '../ContextMenu'
import { ImageCropDialog, type CropParams } from '../ImageCropDialog'

/** Scale factor for canvas display: 3px per mm for comfortable editing */
const SCREEN_SCALE = 3

// ---------- Image layer sub-component ----------
function ImageLayerNode({
  layer,
  commonProps
}: {
  layer: ImageLayer
  commonProps: Record<string, unknown>
}): React.JSX.Element {
  const [image, status] = useImage(layer.src)

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
  const snapEnabled = useEditorStore((s) => s.snapToGrid)
  const gridSize = useEditorStore((s) => s.gridSize)
  const showRulers = useEditorStore((s) => s.showRulers)
  const selectLayers = useEditorStore((s) => s.selectLayers)
  const updateLayer = useEditorStore((s) => s.updateLayer)
  const setPanOffset = useEditorStore((s) => s.setPanOffset)
  const setZoom = useEditorStore((s) => s.setZoom)

  const addLayer = useEditorStore((s) => s.addLayer)

  const [snapLines, setSnapLines] = useState<SnapLine[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const { menu, showMenu, hideMenu } = useContextMenu()
  const [cropTarget, setCropTarget] = useState<{ src: string; width: number; height: number; layerId: string } | null>(null)

  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']

  const isImageFile = useCallback((file: File): boolean => {
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) return true
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    return ALLOWED_EXTENSIONS.includes(ext)
  }, [])

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
      const result = await window.api.image.importBuffer({ buffer, filename: file.name })
      if (result.success && result.data) {
        const imgPath = result.data.filePath
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
          src: imgPath,
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
                src: result.data.filePath,
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
      if (!snapEnabled) {
        setSnapLines([])
        return
      }

      const stage = stageRef.current
      if (!stage) return

      // Collect other layer nodes
      const allNodes = layers
        .filter((l) => l.id !== node.id())
        .map((l) => stage.findOne(`#${l.id}`))
        .filter(Boolean) as Konva.Node[]

      // Grid snapping
      const gridPx = gridSize * SCREEN_SCALE
      let newX = node.x()
      let newY = node.y()

      // Element-to-element snapping
      const snap = getSnapLines(node, allNodes)
      if (snap.x !== null) newX = snap.x
      else newX = snapToGrid(newX, gridPx)

      if (snap.y !== null) newY = snap.y
      else newY = snapToGrid(newY, gridPx)

      node.x(newX)
      node.y(newY)
      setSnapLines(snap.lines)
    },
    [snapEnabled, gridSize, layers]
  )

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      setSnapLines([])
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

  const renderLayer = (layer: LayerType): React.JSX.Element | null => {
    if (!layer.visible) return null

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
      onTransformEnd: handleTransformEnd
    }

    switch (layer.type) {
      case 'text': {
        const tl = layer as TextLayer
        return (
          <Text
            {...commonProps}
            text={tl.text}
            fontSize={tl.fontSize * SCREEN_SCALE}
            fontFamily={tl.fontFamily}
            fontStyle={`${tl.fontWeight} ${tl.fontStyle}`}
            fill={tl.fill}
            align={tl.align}
            verticalAlign={tl.verticalAlign}
            lineHeight={tl.lineHeight}
            letterSpacing={tl.letterSpacing}
            stroke={tl.stroke}
            strokeWidth={tl.strokeWidth}
          />
        )
      }
      case 'shape': {
        const sl = layer as ShapeLayer
        return (
          <Rect
            {...commonProps}
            fill={sl.fill}
            stroke={sl.stroke}
            strokeWidth={sl.strokeWidth}
            cornerRadius={(sl.cornerRadius ?? 0) * SCREEN_SCALE}
          />
        )
      }
      case 'image': {
        return <ImageLayerNode layer={layer as ImageLayer} commonProps={commonProps} />
      }
      case 'component': {
        const cl = layer as ComponentLayerType
        const currentCard = deck.cards.find((c) => c.id === selectedCardId) ?? null
        return (
          <ComponentLayerRenderer
            key={layer.id}
            layer={cl}
            cardData={currentCard}
          />
        )
      }
      default:
        return null
    }
  }

  // --- Right-click context menu for image layers ---
  const handleContextMenu = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>) => {
      e.evt.preventDefault()
      const id = e.target.id()
      if (!id) return
      const layer = layers.find((l) => l.id === id)
      if (!layer || layer.type !== 'image') return
      const imgLayer = layer as ImageLayer
      showMenu(e.evt.clientX, e.evt.clientY, [
        {
          label: '✂️ Crop / Resize',
          action: () => {
            // Load actual image dimensions
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
      ])
    },
    [layers, showMenu]
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
        style={{ marginLeft: showRulers ? 24 : 0, marginTop: showRulers ? 24 : 0 }}
      >
        <Layer x={offsetX} y={offsetY} scaleX={zoom} scaleY={zoom}>
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

          {/* User layers */}
          {layers.map(renderLayer)}

          {/* Snap guide lines */}
          {snapLines.map((line, i) =>
            line.direction === 'vertical' ? (
              <Line
                key={`snap-${i}`}
                points={[line.position, -bleed, line.position, cardH + bleed]}
                stroke="#00aaff"
                strokeWidth={1}
                dash={[4, 4]}
                listening={false}
              />
            ) : (
              <Line
                key={`snap-${i}`}
                points={[-bleed, line.position, cardW + bleed, line.position]}
                stroke="#00aaff"
                strokeWidth={1}
                dash={[4, 4]}
                listening={false}
              />
            )
          )}

          {/* Transformer */}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) return oldBox
              return newBox
            }}
          />
        </Layer>
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
