import React from "react"
import { useState, useCallback, useRef, useEffect } from 'react'

interface Props {
  color: string
  onChange: (color: string) => void
  label?: string
}

// Color conversion utilities
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : { r: 0, g: 0, b: 0 }
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  const s = max === 0 ? 0 : d / max
  const v = max

  let h = 0
  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return { h: h * 360, s: s * 100, v: v * 100 }
}

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  h /= 360
  s /= 100
  v /= 100

  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)

  let r = 0, g = 0, b = 0
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break
    case 1: r = q; g = v; b = p; break
    case 2: r = p; g = v; b = t; break
    case 3: r = p; g = q; b = v; break
    case 4: r = t; g = p; b = v; break
    case 5: r = v; g = p; b = q; break
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) {
    return { h: 0, s: 0, l: l * 100 }
  }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h = 0
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6
      break
    case g:
      h = ((b - r) / d + 2) / 6
      break
    case b:
      h = ((r - g) / d + 4) / 6
      break
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

const PRESET_COLORS = [
  '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#84cc16', '#f43f5e', '#6366f1',
  '#1a1a2e', '#16213e', '#0f3460', '#e94560', '#533483', '#2b2d42'
]

const RECENT_COLORS_KEY = 'deckforge-recent-colors'
const MAX_RECENT_COLORS = 12

export function ColorPicker({ color, onChange, label }: Props): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [hexInput, setHexInput] = useState(color)
  const [recentColors, setRecentColors] = useState<string[]>([])
  const ref = useRef<HTMLDivElement>(null)
  const svRef = useRef<HTMLDivElement>(null)
  const hueRef = useRef<HTMLDivElement>(null)
  const alphaRef = useRef<HTMLDivElement>(null)

  const rgb = hexToRgb(color)
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)

  const [h, setH] = useState(hsv.h)
  const [s, setS] = useState(hsv.s)
  const [v, setV] = useState(hsv.v)
  const [a, setA] = useState(1)

  useEffect(() => {
    const rgb = hexToRgb(color)
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
    setH(hsv.h)
    setS(hsv.s)
    setV(hsv.v)
    setHexInput(color)
  }, [color])

  useEffect(() => {
    // Load recent colors from localStorage
    const stored = localStorage.getItem(RECENT_COLORS_KEY)
    if (stored) {
      try {
        setRecentColors(JSON.parse(stored))
      } catch (e) {
        // Ignore
      }
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const updateFromHsv = useCallback(
    (h: number, s: number, v: number) => {
      const rgb = hsvToRgb(h, s, v)
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
      onChange(hex)
      // Add to recent colors
      const updated = [hex, ...recentColors.filter((c) => c !== hex)].slice(0, MAX_RECENT_COLORS)
      setRecentColors(updated)
      localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(updated))
    },
    [onChange, recentColors]
  )

  const handleHexChange = useCallback(
    (value: string) => {
      setHexInput(value)
      if (/^#[0-9a-fA-F]{6}$/.test(value)) {
        onChange(value)
      }
    },
    [onChange]
  )

  const handleSvChange = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!svRef.current) return
      const rect = svRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
      const newS = x * 100
      const newV = (1 - y) * 100
      setS(newS)
      setV(newV)
      updateFromHsv(h, newS, newV)
    },
    [h, updateFromHsv]
  )

  const handleHueChange = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hueRef.current) return
      const rect = hueRef.current.getBoundingClientRect()
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
      const newH = y * 360
      setH(newH)
      updateFromHsv(newH, s, v)
    },
    [s, v, updateFromHsv]
  )

  const handleMouseDownSv = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      handleSvChange(e)
      const handleMove = (e: MouseEvent) => {
        handleSvChange(e as unknown as React.MouseEvent<HTMLDivElement>)
      }
      const handleUp = () => {
        document.removeEventListener('mousemove', handleMove)
        document.removeEventListener('mouseup', handleUp)
      }
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleUp)
    },
    [handleSvChange]
  )

  const handleMouseDownHue = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      handleHueChange(e)
      const handleMove = (e: MouseEvent) => {
        handleHueChange(e as unknown as React.MouseEvent<HTMLDivElement>)
      }
      const handleUp = () => {
        document.removeEventListener('mousemove', handleMove)
        document.removeEventListener('mouseup', handleUp)
      }
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleUp)
    },
    [handleHueChange]
  )

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {label && <label className="input-label">{label}</label>}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <div
          className="color-swatch"
          style={{ backgroundColor: color }}
          onClick={() => setOpen(!open)}
        />
        <input
          className="input"
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value)}
          style={{ flex: 1 }}
          placeholder="#000000"
        />
      </div>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 4,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: 12,
            zIndex: 100,
            width: 280,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
          }}
        >
          {/* HSV Saturation-Value area */}
          <div
            ref={svRef}
            onMouseDown={handleMouseDownSv}
            style={{
              width: '100%',
              height: 160,
              background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${h}, 100%, 50%))`,
              borderRadius: 4,
              position: 'relative',
              cursor: 'crosshair',
              marginBottom: 8
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: `${s}%`,
                top: `${100 - v}%`,
                width: 12,
                height: 12,
                border: '2px solid white',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 2px rgba(0,0,0,0.5)',
                pointerEvents: 'none'
              }}
            />
          </div>

          {/* Hue strip */}
          <div
            ref={hueRef}
            onMouseDown={handleMouseDownHue}
            style={{
              width: '100%',
              height: 16,
              background: 'linear-gradient(to bottom, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
              borderRadius: 4,
              position: 'relative',
              cursor: 'pointer',
              marginBottom: 12
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: `${(h / 360) * 100}%`,
                left: 0,
                right: 0,
                height: 3,
                background: 'white',
                transform: 'translateY(-50%)',
                boxShadow: '0 0 2px rgba(0,0,0,0.5)',
                pointerEvents: 'none'
              }}
            />
          </div>

          {/* Color inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 9, opacity: 0.6, marginBottom: 2 }}>R</div>
              <input
                type="number"
                className="input"
                style={{ width: '100%', padding: '4px 6px', fontSize: 11 }}
                min={0}
                max={255}
                value={Math.round(rgb.r)}
                onChange={(e) => {
                  const r = Math.max(0, Math.min(255, parseInt(e.target.value) || 0))
                  const hex = rgbToHex(r, rgb.g, rgb.b)
                  onChange(hex)
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: 9, opacity: 0.6, marginBottom: 2 }}>G</div>
              <input
                type="number"
                className="input"
                style={{ width: '100%', padding: '4px 6px', fontSize: 11 }}
                min={0}
                max={255}
                value={Math.round(rgb.g)}
                onChange={(e) => {
                  const g = Math.max(0, Math.min(255, parseInt(e.target.value) || 0))
                  const hex = rgbToHex(rgb.r, g, rgb.b)
                  onChange(hex)
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: 9, opacity: 0.6, marginBottom: 2 }}>B</div>
              <input
                type="number"
                className="input"
                style={{ width: '100%', padding: '4px 6px', fontSize: 11 }}
                min={0}
                max={255}
                value={Math.round(rgb.b)}
                onChange={(e) => {
                  const b = Math.max(0, Math.min(255, parseInt(e.target.value) || 0))
                  const hex = rgbToHex(rgb.r, rgb.g, b)
                  onChange(hex)
                }}
              />
            </div>
          </div>

          {/* HSL inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 9, opacity: 0.6, marginBottom: 2 }}>H</div>
              <input
                type="number"
                className="input"
                style={{ width: '100%', padding: '4px 6px', fontSize: 11 }}
                min={0}
                max={360}
                value={Math.round(hsl.h)}
                onChange={(e) => {
                  const newH = Math.max(0, Math.min(360, parseInt(e.target.value) || 0))
                  setH(newH)
                  updateFromHsv(newH, s, v)
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: 9, opacity: 0.6, marginBottom: 2 }}>S%</div>
              <input
                type="number"
                className="input"
                style={{ width: '100%', padding: '4px 6px', fontSize: 11 }}
                min={0}
                max={100}
                value={Math.round(hsl.s)}
                readOnly
              />
            </div>
            <div>
              <div style={{ fontSize: 9, opacity: 0.6, marginBottom: 2 }}>L%</div>
              <input
                type="number"
                className="input"
                style={{ width: '100%', padding: '4px 6px', fontSize: 11 }}
                min={0}
                max={100}
                value={Math.round(hsl.l)}
                readOnly
              />
            </div>
          </div>

          {/* Recent colors */}
          {recentColors.length > 0 && (
            <>
              <div style={{ fontSize: 9, opacity: 0.6, marginBottom: 6 }}>Recent</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, marginBottom: 12 }}>
                {recentColors.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: 3,
                      backgroundColor: c,
                      cursor: 'pointer',
                      border: c === color ? '2px solid var(--accent)' : '1px solid var(--border)',
                      transition: 'transform 0.1s'
                    }}
                    onClick={() => {
                      onChange(c)
                      setOpen(false)
                    }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.transform = 'scale(1.15)')}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = 'scale(1)')}
                  />
                ))}
              </div>
            </>
          )}

          {/* Preset colors */}
          <div style={{ fontSize: 9, opacity: 0.6, marginBottom: 6 }}>Presets</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
            {PRESET_COLORS.map((c) => (
              <div
                key={c}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: 3,
                  backgroundColor: c,
                  cursor: 'pointer',
                  border: c === color ? '2px solid var(--accent)' : '1px solid var(--border)',
                  transition: 'transform 0.1s'
                }}
                onClick={() => {
                  onChange(c)
                  setOpen(false)
                }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.transform = 'scale(1.15)')}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = 'scale(1)')}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
