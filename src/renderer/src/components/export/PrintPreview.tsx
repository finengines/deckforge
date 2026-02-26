import React, { useState, useEffect, useRef, useCallback } from 'react'
import { PDFDocument } from 'pdf-lib'

interface PrintPreviewProps {
  pdfBytes: Uint8Array
  bleedMm: number
  trimWidthMm: number
  trimHeightMm: number
}

const ZOOM_LEVELS = [0.5, 1, 1.5, 2]

/**
 * Renders PDF pages to canvas for preview.
 * Uses pdf-lib to extract page dimensions and renders a simplified preview
 * with trim/bleed overlays.
 */
export function PrintPreview({
  pdfBytes,
  bleedMm,
  trimWidthMm: _trimWidthMm,
  trimHeightMm: _trimHeightMm
}: PrintPreviewProps): React.JSX.Element {
  const [pageImages, setPageImages] = useState<{ width: number; height: number }[]>([])
  const [zoom, setZoom] = useState(0.5)
  const [pageCount, setPageCount] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([])

  // Load PDF and extract page info
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const pdfDoc = await PDFDocument.load(pdfBytes)
        const pages = pdfDoc.getPages()
        if (cancelled) return
        setPageCount(pages.length)
        setPageImages(
          pages.map((p) => ({
            width: p.getWidth(),
            height: p.getHeight()
          }))
        )
      } catch {
        setPageCount(0)
        setPageImages([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [pdfBytes])

  // Render page placeholders with overlays
  useEffect(() => {
    pageImages.forEach((page, i) => {
      const canvas = canvasRefs.current[i]
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const w = page.width * zoom
      const h = page.height * zoom
      canvas.width = w
      canvas.height = h

      // White page background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)

      // Grid lines placeholder (grey)
      ctx.strokeStyle = '#ddd'
      ctx.lineWidth = 1
      const step = 50 * zoom
      for (let x = step; x < w; x += step) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = step; y < h; y += step) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      // Bleed area highlight (red semi-transparent border region)
      if (bleedMm > 0) {
        const bleedPt = (bleedMm / 25.4) * 72 * zoom
        ctx.fillStyle = 'rgba(255, 0, 0, 0.08)'
        // Top
        ctx.fillRect(0, 0, w, bleedPt)
        // Bottom
        ctx.fillRect(0, h - bleedPt, w, bleedPt)
        // Left
        ctx.fillRect(0, 0, bleedPt, h)
        // Right
        ctx.fillRect(w - bleedPt, 0, bleedPt, h)
      }

      // Page label
      ctx.fillStyle = '#666'
      ctx.font = `${12 * zoom}px sans-serif`
      ctx.fillText(`Page ${i + 1} of ${pageImages.length}`, 10 * zoom, 20 * zoom)
    })
  }, [pageImages, zoom, bleedMm])

  const setCanvasRef = useCallback(
    (el: HTMLCanvasElement | null, idx: number) => {
      canvasRefs.current[idx] = el
    },
    []
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Zoom controls */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          padding: '8px 12px',
          borderBottom: '1px solid var(--border)',
          alignItems: 'center',
          fontSize: 12
        }}
      >
        <span>Zoom:</span>
        {ZOOM_LEVELS.map((z) => (
          <button
            key={z}
            className={`btn btn-sm ${zoom === z ? 'btn-active' : ''}`}
            onClick={() => setZoom(z)}
          >
            {Math.round(z * 100)}%
          </button>
        ))}
        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
          {pageCount} page{pageCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Scrollable page list */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          background: '#333'
        }}
      >
        {pageImages.length === 0 && (
          <div style={{ color: 'var(--text-muted)', padding: 40 }}>Loading preview…</div>
        )}
        {pageImages.map((page, i) => (
          <div
            key={i}
            style={{
              boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <canvas
              ref={(el) => setCanvasRef(el, i)}
              width={page.width * zoom}
              height={page.height * zoom}
            />
          </div>
        ))}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          padding: '6px 12px',
          borderTop: '1px solid var(--border)',
          fontSize: 11,
          color: 'var(--text-muted)'
        }}
      >
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'rgba(255,0,0,0.15)', border: '1px solid rgba(255,0,0,0.3)', marginRight: 4, verticalAlign: 'middle' }} />
          Bleed area
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#fff', border: '1px solid #ccc', marginRight: 4, verticalAlign: 'middle' }} />
          Trim area
        </span>
      </div>
    </div>
  )
}
