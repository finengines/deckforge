import { useRef, useCallback, useEffect } from 'react'
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer } from 'react-konva'
import type Konva from 'konva'
import { useEditorStore } from '../../stores/editorStore'
import type { Layer as LayerType, TextLayer, ShapeLayer, ImageLayer } from '../../types'

/** Convert mm to pixels at given DPI */
function mmToPx(mm: number, dpi: number): number {
  return (mm / 25.4) * dpi
}

/** Scale factor for canvas display (we work at screen DPI, export at print DPI) */
const SCREEN_SCALE = 3 // 3px per mm for comfortable editing

export function Canvas(): JSX.Element {
  const stageRef = useRef<Konva.Stage>(null)
  const transformerRef = useRef<Konva.Transformer>(null)

  const deck = useEditorStore((s) => s.currentDeck)
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds)
  const editingSide = useEditorStore((s) => s.editingSide)
  const zoom = useEditorStore((s) => s.zoom)
  const panOffset = useEditorStore((s) => s.panOffset)
  const mode = useEditorStore((s) => s.mode)
  const selectLayers = useEditorStore((s) => s.selectLayers)
  const updateLayer = useEditorStore((s) => s.updateLayer)
  const setPanOffset = useEditorStore((s) => s.setPanOffset)
  const setZoom = useEditorStore((s) => s.setZoom)

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

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target === e.target.getStage()) {
        selectLayers([])
        return
      }
      const id = e.target.id()
      if (id) {
        selectLayers([id])
      }
    },
    [selectLayers]
  )

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault()
      if (e.evt.ctrlKey || e.evt.metaKey) {
        // Zoom
        const delta = e.evt.deltaY > 0 ? -0.05 : 0.05
        setZoom(zoom + delta)
      } else {
        // Pan
        setPanOffset({
          x: panOffset.x - e.evt.deltaX,
          y: panOffset.y - e.evt.deltaY
        })
      }
    },
    [zoom, panOffset, setZoom, setPanOffset]
  )

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
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
        // Image loading handled separately
        return <Rect {...commonProps} fill="#333" stroke="#555" strokeWidth={1} />
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
    <div className="canvas-container">
      <Stage
        ref={stageRef}
        width={stageWidth}
        height={stageHeight}
        onClick={handleStageClick}
        onWheel={handleWheel}
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
        {layers.length} layers
      </div>
    </div>
  )
}
