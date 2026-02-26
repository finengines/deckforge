import React from "react"
import { useState, useCallback, useRef, useEffect } from 'react'

interface Props {
  color: string
  onChange: (color: string) => void
  label?: string
}

const PRESET_COLORS = [
  '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#84cc16', '#f43f5e', '#6366f1',
  '#1a1a2e', '#16213e', '#0f3460', '#e94560', '#533483', '#2b2d42'
]

export function ColorPicker({ color, onChange, label }: Props): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [hexInput, setHexInput] = useState(color)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHexInput(color)
  }, [color])

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

  const handleHexChange = useCallback(
    (value: string) => {
      setHexInput(value)
      if (/^#[0-9a-fA-F]{6}$/.test(value)) {
        onChange(value)
      }
    },
    [onChange]
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
        {/* Hidden native picker for eyedropper */}
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 0, height: 0, padding: 0, border: 'none', opacity: 0, position: 'absolute' }}
          id={`native-picker-${label}`}
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
            padding: 8,
            zIndex: 100,
            width: 200,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, marginBottom: 8 }}>
            {PRESET_COLORS.map((c) => (
              <div
                key={c}
                style={{
                  width: 24,
                  height: 24,
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
          <button
            className="btn btn-sm btn-ghost"
            style={{ width: '100%' }}
            onClick={() => {
              const el = document.getElementById(`native-picker-${label}`) as HTMLInputElement
              el?.click()
              setOpen(false)
            }}
          >
            🎨 Eyedropper
          </button>
        </div>
      )}
    </div>
  )
}
