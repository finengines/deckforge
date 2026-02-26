import React from "react"
import { useMemo } from 'react'

interface RulersProps {
  cardWidth: number   // mm
  cardHeight: number  // mm
  zoom: number
  panOffsetX: number
  panOffsetY: number
  screenScale: number // px per mm
  stageWidth: number
  stageHeight: number
}

const RULER_SIZE = 24 // px
const MAJOR_TICK = 10 // every 10mm
const MINOR_TICK = 5  // every 5mm

export function Rulers({
  cardWidth,
  cardHeight,
  zoom,
  panOffsetX,
  panOffsetY,
  screenScale,
  stageWidth,
  stageHeight
}: RulersProps): React.JSX.Element {
  // Card origin in stage pixels
  const originX = (stageWidth - cardWidth * screenScale * zoom) / 2 + panOffsetX
  const originY = (stageHeight - cardHeight * screenScale * zoom) / 2 + panOffsetY

  const pxPerMm = screenScale * zoom

  const hTicks = useMemo(() => {
    const ticks: { pos: number; mm: number; major: boolean }[] = []
    // Determine visible range in mm
    const startMm = Math.floor(-originX / pxPerMm)
    const endMm = Math.ceil((stageWidth - originX) / pxPerMm)
    for (let mm = startMm; mm <= endMm; mm++) {
      if (mm % MINOR_TICK !== 0) continue
      ticks.push({
        pos: originX + mm * pxPerMm,
        mm,
        major: mm % MAJOR_TICK === 0
      })
    }
    return ticks
  }, [originX, pxPerMm, stageWidth])

  const vTicks = useMemo(() => {
    const ticks: { pos: number; mm: number; major: boolean }[] = []
    const startMm = Math.floor(-originY / pxPerMm)
    const endMm = Math.ceil((stageHeight - originY) / pxPerMm)
    for (let mm = startMm; mm <= endMm; mm++) {
      if (mm % MINOR_TICK !== 0) continue
      ticks.push({
        pos: originY + mm * pxPerMm,
        mm,
        major: mm % MAJOR_TICK === 0
      })
    }
    return ticks
  }, [originY, pxPerMm, stageHeight])

  return (
    <>
      {/* Horizontal ruler */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: RULER_SIZE,
          right: 0,
          height: RULER_SIZE,
          background: 'var(--bg-secondary, #1e1e2e)',
          borderBottom: '1px solid var(--border, #333)',
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 10
        }}
      >
        {hTicks.map((t, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: t.pos,
              bottom: 0,
              width: 1,
              height: t.major ? RULER_SIZE * 0.6 : RULER_SIZE * 0.3,
              background: 'var(--text-muted, #888)'
            }}
          >
            {t.major && (
              <span
                style={{
                  position: 'absolute',
                  top: 1,
                  left: 3,
                  fontSize: 9,
                  color: 'var(--text-muted, #888)',
                  whiteSpace: 'nowrap'
                }}
              >
                {t.mm}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Vertical ruler */}
      <div
        style={{
          position: 'absolute',
          top: RULER_SIZE,
          left: 0,
          bottom: 0,
          width: RULER_SIZE,
          background: 'var(--bg-secondary, #1e1e2e)',
          borderRight: '1px solid var(--border, #333)',
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 10
        }}
      >
        {vTicks.map((t, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: t.pos,
              right: 0,
              height: 1,
              width: t.major ? RULER_SIZE * 0.6 : RULER_SIZE * 0.3,
              background: 'var(--text-muted, #888)'
            }}
          >
            {t.major && (
              <span
                style={{
                  position: 'absolute',
                  left: 1,
                  top: 3,
                  fontSize: 9,
                  color: 'var(--text-muted, #888)',
                  whiteSpace: 'nowrap',
                  writingMode: 'vertical-lr'
                }}
              >
                {t.mm}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Corner square */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: RULER_SIZE,
          height: RULER_SIZE,
          background: 'var(--bg-secondary, #1e1e2e)',
          borderRight: '1px solid var(--border, #333)',
          borderBottom: '1px solid var(--border, #333)',
          zIndex: 11
        }}
      />
    </>
  )
}
