import React from 'react'
import { Layer, Rect, Line, Text } from 'react-konva'

interface LayoutGuidesProps {
  cardWidth: number
  cardHeight: number
  bleed: number
  screenScale: number
  offsetX?: number
  offsetY?: number
  zoom?: number
}

interface Zone {
  label: string
  startPct: number
  endPct: number
  color: string
}

const ZONES: Zone[] = [
  { label: 'Title', startPct: 0, endPct: 12, color: 'rgba(233,69,96,0.15)' },
  { label: 'Image', startPct: 12, endPct: 62, color: 'rgba(74,158,255,0.12)' },
  { label: 'Description', startPct: 62, endPct: 72, color: 'rgba(255,193,7,0.15)' },
  { label: 'Stats', startPct: 72, endPct: 95, color: 'rgba(76,175,80,0.15)' },
  { label: 'Footer', startPct: 95, endPct: 100, color: 'rgba(156,39,176,0.15)' }
]

export function LayoutGuides({
  cardWidth,
  cardHeight,
  bleed: _bleed,
  screenScale,
  offsetX = 0,
  offsetY = 0,
  zoom = 1
}: LayoutGuidesProps): React.JSX.Element {
  const w = cardWidth * screenScale
  const h = cardHeight * screenScale
  // Safe zone: 3mm inside from edges
  const safe = 3 * screenScale

  return (
    <Layer listening={false} x={offsetX} y={offsetY} scaleX={zoom} scaleY={zoom}>
      {/* Zone overlays */}
      {ZONES.map((zone) => {
        const y = (zone.startPct / 100) * h
        const zoneH = ((zone.endPct - zone.startPct) / 100) * h
        return (
          <React.Fragment key={zone.label}>
            <Rect x={0} y={y} width={w} height={zoneH} fill={zone.color} />
            <Text
              x={4}
              y={y + 2}
              text={zone.label}
              fontSize={9}
              fill="rgba(255,255,255,0.6)"
              listening={false}
            />
            {/* Zone boundary line */}
            {zone.startPct > 0 && (
              <Line
                points={[0, y, w, y]}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={1}
                dash={[4, 4]}
              />
            )}
          </React.Fragment>
        )
      })}

      {/* Safe zone (3mm inset) */}
      <Rect
        x={safe}
        y={safe}
        width={w - safe * 2}
        height={h - safe * 2}
        stroke="rgba(0,200,255,0.4)"
        strokeWidth={1}
        dash={[6, 3]}
      />

      {/* Center guides - crosshair */}
      <Line
        points={[w / 2, 0, w / 2, h]}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1}
        dash={[8, 4]}
      />
      <Line
        points={[0, h / 2, w, h / 2]}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1}
        dash={[8, 4]}
      />

      {/* Rule of thirds */}
      <Line points={[w / 3, 0, w / 3, h]} stroke="rgba(255,200,0,0.15)" strokeWidth={1} dash={[4, 8]} />
      <Line points={[(w * 2) / 3, 0, (w * 2) / 3, h]} stroke="rgba(255,200,0,0.15)" strokeWidth={1} dash={[4, 8]} />
      <Line points={[0, h / 3, w, h / 3]} stroke="rgba(255,200,0,0.15)" strokeWidth={1} dash={[4, 8]} />
      <Line points={[0, (h * 2) / 3, w, (h * 2) / 3]} stroke="rgba(255,200,0,0.15)" strokeWidth={1} dash={[4, 8]} />
    </Layer>
  )
}
