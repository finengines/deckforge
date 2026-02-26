import React, { useState, useCallback, useRef, useEffect } from 'react'

export interface CropParams {
  left: number
  top: number
  width: number
  height: number
}

interface ImageCropDialogProps {
  imageSrc: string
  imageWidth: number
  imageHeight: number
  onApply: (crop: CropParams, resize?: { width: number; height: number }) => void
  onClose: () => void
}

export function ImageCropDialog({
  imageSrc,
  imageWidth,
  imageHeight,
  onApply,
  onClose
}: ImageCropDialogProps): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cropX, setCropX] = useState(0)
  const [cropY, setCropY] = useState(0)
  const [cropW, setCropW] = useState(imageWidth)
  const [cropH, setCropH] = useState(imageHeight)
  const [lockAspect, setLockAspect] = useState(false)
  const [aspectRatio, setAspectRatio] = useState(imageWidth / imageHeight)
  const [resizeW, setResizeW] = useState<number | ''>('')
  const [resizeH, setResizeH] = useState<number | ''>('')
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Display scale to fit preview
  const maxPreview = 400
  const scale = Math.min(maxPreview / imageWidth, maxPreview / imageHeight, 1)
  const displayW = imageWidth * scale
  const displayH = imageHeight * scale

  useEffect(() => {
    if (lockAspect) {
      setAspectRatio(cropW / cropH)
    }
  }, [lockAspect])

  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, displayW, displayH)
      ctx.drawImage(img, 0, 0, displayW, displayH)

      // Dim outside crop area
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(0, 0, displayW, displayH)

      // Clear crop area
      const sx = cropX * scale
      const sy = cropY * scale
      const sw = cropW * scale
      const sh = cropH * scale
      ctx.clearRect(sx, sy, sw, sh)
      ctx.drawImage(img, cropX, cropY, cropW, cropH, sx, sy, sw, sh)

      // Crop border
      ctx.strokeStyle = '#00aaff'
      ctx.lineWidth = 2
      ctx.strokeRect(sx, sy, sw, sh)
    }
    img.src = imageSrc
  }, [imageSrc, cropX, cropY, cropW, cropH, scale, displayW, displayH])

  useEffect(() => {
    drawPreview()
  }, [drawPreview])

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      setDragging(true)
      const x = (e.clientX - rect.left) / scale
      const y = (e.clientY - rect.top) / scale
      setDragStart({ x, y })
      setCropX(Math.max(0, Math.min(x, imageWidth)))
      setCropY(Math.max(0, Math.min(y, imageHeight)))
      setCropW(0)
      setCropH(0)
    },
    [scale, imageWidth, imageHeight]
  )

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!dragging) return
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = (e.clientX - rect.left) / scale
      const y = (e.clientY - rect.top) / scale
      let w = Math.max(1, Math.min(x - dragStart.x, imageWidth - dragStart.x))
      let h = Math.max(1, Math.min(y - dragStart.y, imageHeight - dragStart.y))
      if (lockAspect) {
        h = w / aspectRatio
      }
      setCropW(Math.round(w))
      setCropH(Math.round(h))
    },
    [dragging, dragStart, scale, imageWidth, imageHeight, lockAspect, aspectRatio]
  )

  const handleCanvasMouseUp = useCallback(() => {
    setDragging(false)
  }, [])

  const handleWidthChange = useCallback(
    (val: number) => {
      setCropW(Math.min(val, imageWidth - cropX))
      if (lockAspect) {
        setCropH(Math.round(Math.min(val, imageWidth - cropX) / aspectRatio))
      }
    },
    [imageWidth, cropX, lockAspect, aspectRatio]
  )

  const handleHeightChange = useCallback(
    (val: number) => {
      setCropH(Math.min(val, imageHeight - cropY))
      if (lockAspect) {
        setCropW(Math.round(Math.min(val, imageHeight - cropY) * aspectRatio))
      }
    },
    [imageHeight, cropY, lockAspect, aspectRatio]
  )

  const handleApply = useCallback(() => {
    const crop: CropParams = {
      left: Math.max(0, cropX),
      top: Math.max(0, cropY),
      width: Math.max(1, cropW),
      height: Math.max(1, cropH)
    }
    const resize =
      resizeW && resizeH ? { width: Number(resizeW), height: Number(resizeH) } : undefined
    onApply(crop, resize)
  }, [cropX, cropY, cropW, cropH, resizeW, resizeH, onApply])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: 'var(--bg-primary, #1a1a2e)',
          borderRadius: 8,
          padding: 20,
          minWidth: 460,
          maxWidth: '90vw'
        }}
      >
        <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>Crop / Resize Image</h3>

        <div style={{ display: 'flex', gap: 16 }}>
          {/* Preview canvas */}
          <canvas
            ref={canvasRef}
            width={displayW}
            height={displayH}
            style={{ border: '1px solid #444', cursor: 'crosshair', borderRadius: 4 }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          />

          {/* Controls */}
          <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
            <div>
              <strong>Crop Area</strong>
            </div>
            <label>
              X: <input className="input" type="number" min={0} max={imageWidth} value={cropX} onChange={(e) => setCropX(Number(e.target.value))} style={{ width: 70 }} />
            </label>
            <label>
              Y: <input className="input" type="number" min={0} max={imageHeight} value={cropY} onChange={(e) => setCropY(Number(e.target.value))} style={{ width: 70 }} />
            </label>
            <label>
              W: <input className="input" type="number" min={1} max={imageWidth} value={cropW} onChange={(e) => handleWidthChange(Number(e.target.value))} style={{ width: 70 }} />
            </label>
            <label>
              H: <input className="input" type="number" min={1} max={imageHeight} value={cropH} onChange={(e) => handleHeightChange(Number(e.target.value))} style={{ width: 70 }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <input type="checkbox" checked={lockAspect} onChange={(e) => setLockAspect(e.target.checked)} />
              Lock aspect ratio
            </label>

            <div style={{ borderTop: '1px solid #444', paddingTop: 8, marginTop: 4 }}>
              <strong>Resize (optional)</strong>
            </div>
            <label>
              Width: <input className="input" type="number" min={1} value={resizeW} onChange={(e) => setResizeW(e.target.value ? Number(e.target.value) : '')} style={{ width: 70 }} placeholder="—" />
            </label>
            <label>
              Height: <input className="input" type="number" min={1} value={resizeH} onChange={(e) => setResizeH(e.target.value ? Number(e.target.value) : '')} style={{ width: 70 }} placeholder="—" />
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleApply}>Apply Crop</button>
        </div>
      </div>
    </div>
  )
}
