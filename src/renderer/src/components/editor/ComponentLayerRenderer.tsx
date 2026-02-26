import React from "react"
import { Group, Rect, Text } from 'react-konva'
import { useEditorStore } from '../../stores/editorStore'
import type { ComponentLayer, ComponentSlot, CardData, TextLayer } from '../../types'

const SCREEN_SCALE = 3

interface Props {
  layer: ComponentLayer
  cardData?: CardData | null
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

  // Resolve slot values: overrides > card data binding > default
  const resolveSlotValue = (slot: ComponentSlot): string | number => {
    if (layer.overrides[slot.id] !== undefined) return layer.overrides[slot.id] as string | number
    if (layer.overrides[slot.name] !== undefined) return layer.overrides[slot.name] as string | number

    if (cardData) {
      // Try matching slot name to card fields
      const key = slot.name.toLowerCase()
      if (key === 'name') return cardData.name
      if (key === 'description') return cardData.description ?? ''
      if (key === 'image') return cardData.image ?? ''
      if (key === 'funfact' || key === 'fun fact') return cardData.funFact ?? ''
      // Check stats
      if (cardData.stats[slot.name] !== undefined) return cardData.stats[slot.name]
      // Check custom fields
      if (cardData.customFields[slot.name] !== undefined) return String(cardData.customFields[slot.name])
    }

    return slot.defaultValue ?? ''
  }

  // Scale factor: component def size → layer placed size
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
      {/* Render component's static layers */}
      {compDef.layers.map((cl) => {
        if (!cl.visible) return null
        const props = {
          key: cl.id,
          x: cl.x * SCREEN_SCALE,
          y: cl.y * SCREEN_SCALE,
          width: cl.width * SCREEN_SCALE,
          height: cl.height * SCREEN_SCALE,
          opacity: cl.opacity,
          rotation: cl.rotation
        }

        switch (cl.type) {
          case 'text': {
            const tl = cl as TextLayer
            // Check if bound to a slot
            const boundSlot = compDef.slots.find((s) => s.name === tl.bindTo || s.id === tl.bindTo)
            const displayText = boundSlot ? String(resolveSlotValue(boundSlot)) : tl.text
            return (
              <Text
                {...props}
                text={displayText}
                fontSize={tl.fontSize * SCREEN_SCALE}
                fontFamily={tl.fontFamily}
                fontStyle={`${tl.fontWeight} ${tl.fontStyle}`}
                fill={tl.fill}
                align={tl.align}
                verticalAlign={tl.verticalAlign}
                lineHeight={tl.lineHeight}
                letterSpacing={tl.letterSpacing}
              />
            )
          }
          case 'shape':
            return (
              <Rect
                {...props}
                fill={(cl as any).fill}
                stroke={(cl as any).stroke}
                strokeWidth={(cl as any).strokeWidth}
                cornerRadius={((cl as any).cornerRadius ?? 0) * SCREEN_SCALE}
              />
            )
          case 'image':
            return (
              <Rect
                {...props}
                fill="#444"
                stroke="#555"
                strokeWidth={0.5}
              />
            )
          default:
            return null
        }
      })}

      {/* Render slot regions (subtle overlay for slots without matching layers) */}
      {compDef.slots.map((slot) => {
        const value = resolveSlotValue(slot)
        // Only render text/number slots as overlays if no layer is bound to them
        const hasBoundLayer = compDef.layers.some(
          (l) => l.type === 'text' && (l.bindTo === slot.name || l.bindTo === slot.id)
        )
        if (hasBoundLayer) return null
        if (slot.type === 'image') return null

        return (
          <Text
            key={`slot-${slot.id}`}
            x={slot.bounds.x * SCREEN_SCALE}
            y={slot.bounds.y * SCREEN_SCALE}
            width={slot.bounds.width * SCREEN_SCALE}
            height={slot.bounds.height * SCREEN_SCALE}
            text={String(value)}
            fontSize={3 * SCREEN_SCALE}
            fill="#333"
            align="center"
            verticalAlign="middle"
          />
        )
      })}
    </Group>
  )
}
