import React from "react"
import { Group, Rect, Text, Image as KonvaImage } from 'react-konva'
import { useEditorStore } from '../../stores/editorStore'
import { useImage } from '../../hooks/useImage'
import type { ComponentLayer, ComponentSlot, CardData, CardCategory } from '../../types'

const SCREEN_SCALE = 3

interface Props {
  layer: ComponentLayer
  cardData?: CardData | null
}

/**
 * Sub-component for rendering image slots (allows hook usage)
 */
function SlotImageRenderer({
  src,
  x,
  y,
  width,
  height
}: {
  src: string
  x: number
  y: number
  width: number
  height: number
}): React.JSX.Element {
  const [image] = useImage(src)

  if (image) {
    return <KonvaImage image={image} x={x} y={y} width={width} height={height} />
  }

  // Placeholder while loading
  return <Rect x={x} y={y} width={width} height={height} fill="#444" stroke="#555" strokeWidth={0.5} />
}

/**
 * Renders a ComponentLayer on the Konva canvas.
 * Resolves slot values from current card data and component overrides.
 */
export function ComponentLayerRenderer({ layer, cardData }: Props): React.JSX.Element | null {
  const deck = useEditorStore((s) => s.currentDeck)
  if (!deck) return null

  const compDef = deck.components.find((c) => c.id === layer.componentId)
  if (!compDef) {
    // Component not found — render placeholder
    return (
      <Group
        id={layer.id}
        x={layer.x * SCREEN_SCALE}
        y={layer.y * SCREEN_SCALE}
        opacity={layer.opacity}
        rotation={layer.rotation}
      >
        <Rect
          width={layer.width * SCREEN_SCALE}
          height={layer.height * SCREEN_SCALE}
          fill="#333"
          stroke="#e94560"
          strokeWidth={1}
          dash={[4, 4]}
        />
        <Text
          text={`Missing: ${layer.componentId.slice(0, 8)}…`}
          fontSize={10}
          fill="#e94560"
          width={layer.width * SCREEN_SCALE}
          height={layer.height * SCREEN_SCALE}
          align="center"
          verticalAlign="middle"
        />
      </Group>
    )
  }

  // Helper: resolve slot value from card data
  const resolveSlotValue = (slot: ComponentSlot): { value: string | number; category?: CardCategory } => {
    // Check overrides first
    if (layer.overrides[slot.id] !== undefined) {
      return { value: layer.overrides[slot.id] as string | number }
    }

    if (!cardData) {
      return { value: slot.defaultValue ?? '' }
    }

    // Handle data binding
    if (slot.bindTo) {
      const binding = slot.bindTo

      // Direct card fields
      if (binding === 'name') return { value: cardData.name }
      if (binding === 'description') return { value: cardData.description ?? '' }
      if (binding === 'funFact') return { value: cardData.funFact ?? '' }
      if (binding === 'image') return { value: cardData.image ?? '' }

      // Stat values: 'stat:categoryId'
      if (binding.startsWith('stat:')) {
        const catId = binding.slice(5)
        const category = deck.categories.find((c) => c.id === catId)
        const value = cardData.stats[catId]
        return { value: value !== undefined ? value : 0, category }
      }

      // Stat labels: 'stat-label:categoryId'
      if (binding.startsWith('stat-label:')) {
        const catId = binding.slice(11)
        const category = deck.categories.find((c) => c.id === catId)
        return { value: category?.name ?? '', category }
      }
    }

    return { value: slot.defaultValue ?? '' }
  }

  // Load background image
  const [bgImage] = useImage(compDef.backgroundImage)

  // Scale factors
  const scaleX = layer.width / compDef.width
  const scaleY = layer.height / compDef.height

  return (
    <Group
      id={layer.id}
      x={layer.x * SCREEN_SCALE}
      y={layer.y * SCREEN_SCALE}
      scaleX={scaleX}
      scaleY={scaleY}
      opacity={layer.opacity}
      rotation={layer.rotation}
    >
      {/* Background Image */}
      {bgImage && (
        <KonvaImage
          image={bgImage}
          x={0}
          y={0}
          width={compDef.width * SCREEN_SCALE}
          height={compDef.height * SCREEN_SCALE}
        />
      )}

      {/* Render static layers (if any) */}
      {compDef.layers.map((cl) => {
        if (!cl.visible) return null
        // TODO: render static layers if needed
        return null
      })}

      {/* Render Slots */}
      {compDef.slots.map((slot) => {
        const resolved = resolveSlotValue(slot)
        const value = resolved.value
        const category = resolved.category

        const x = slot.bounds.x * SCREEN_SCALE
        const y = slot.bounds.y * SCREEN_SCALE
        let width = slot.bounds.width * SCREEN_SCALE
        const height = slot.bounds.height * SCREEN_SCALE

        // Handle stat-bar-fill: adjust width based on value
        if (slot.type === 'stat-bar-fill' && typeof value === 'number') {
          const min = slot.minValue ?? category?.min ?? 0
          const max = slot.maxValue ?? category?.max ?? 100
          const normalizedValue = Math.max(min, Math.min(max, value))
          const percentage = (normalizedValue - min) / (max - min)
          
          if (slot.barDirection === 'vertical') {
            // For vertical bars, adjust height instead
            const newHeight = height * percentage
            return (
              <Rect
                key={slot.id}
                x={x}
                y={y + (height - newHeight)}
                width={width}
                height={newHeight}
                fill={slot.textStyle?.fill ?? '#3b82f6'}
                opacity={0.8}
              />
            )
          } else {
            // Horizontal bar
            width = width * percentage
            return (
              <Rect
                key={slot.id}
                x={x}
                y={y}
                width={width}
                height={height}
                fill={slot.textStyle?.fill ?? '#3b82f6'}
                opacity={0.8}
              />
            )
          }
        }

        // Handle image slots
        if (slot.type === 'image' && typeof value === 'string' && value) {
          return (
            <SlotImageRenderer
              key={slot.id}
              src={value}
              x={x}
              y={y}
              width={width}
              height={height}
            />
          )
        }

        // Handle text slots (text, stat-label, stat-value)
        if (slot.type === 'text' || slot.type === 'stat-label' || slot.type === 'stat-value') {
          const style = slot.textStyle || {}
          return (
            <Text
              key={slot.id}
              x={x}
              y={y}
              width={width}
              height={height}
              text={String(value)}
              fontSize={(style.fontSize ?? 3) * SCREEN_SCALE}
              fontFamily={style.fontFamily ?? 'Inter'}
              fontStyle={`${style.fontWeight ?? 'normal'} ${style.fontStyle ?? 'normal'}`}
              fill={style.fill ?? '#000000'}
              align={style.align ?? 'left'}
              verticalAlign={style.verticalAlign ?? 'middle'}
            />
          )
        }

        return null
      })}
    </Group>
  )
}
