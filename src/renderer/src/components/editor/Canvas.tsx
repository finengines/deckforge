import { useRef, useCallback, useEffect, useState } from 'react'
import { Stage, Layer, Rect, Text, Line, Image as KonvaImage, Transformer } from 'react-konva'
import type Konva from 'konva'
import { useEditorStore } from '../../stores/editorStore'
import type { Layer as LayerType, TextLayer, ShapeLayer, ImageLayer } from '../../types'
import { useImage } from '../../hooks/useImage'
import { snapToGrid, getSnapLines, type SnapLine } from '../../lib/snapping'
import { Rulers } from './Rulers'

/** Scale factor for canvas display: 3px per mm for comfortable editing */
const SCREEN_SCALE = 3

// ---------- Image layer sub-component ----------
function ImageLayerNode({
  layer,
  commonProps
}: {
  layer: ImageLayer
  commonProps: Record<string, unknown>
}): JSX.Element {
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

export function Canvas(): JSX.Element {
  const stageRef = useRef<Konva.Stage>(null)
  const transformerRef = useRef<Konva.Transformer>(null)

  const deck = useEditorStore((s) => s.currentDeck)
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

  const [snapLines, setSnapLines] = useState<SnapLine[]>([])

  if (!deck) return <div className="canvas-container" />

  const dims = deck.dimensions
  const cardW = dims.width * SCREEN_SCALE
  const cardH = dims.height * SCREEN_SCALE
  const bleed = dims.bleed * SCREEN_SCALE

  const template = editingSide === 'front' ? deck.frontTemplate : deck.backTemplate
  const layers = template.frontLayers

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
      if (e.target === e.target.getStage()) {
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
    [selectLayers]
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

  const renderLayer = (layer: LayerType): JSX.Element | null => {
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
      default:
        return null
    }
  }

  // Center card on canvas
  const stageWidth = typeof window !== 'undefined' ? window.innerWidth - 260 * 2 : 800
  const stageHeight = typeof window !== 'undefined' ? window.innerHeight - 44 : 600
  const offsetX = (stageWidth - cardW * zoom) / 2 + panOffset.x
  const offsetY = (stageHeight - cardH * zoom) / 2 + panOffset.y

  return (
    <div className="canvas-container" style={{ position: 'relative', overflow: 'hidden' }}>
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
}
