import React from "react"
import type { ContextMenuItem } from '../hooks/useContextMenu'

interface Props {
  visible: boolean
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
}

export function ContextMenu({ visible, x, y, items, onClose }: Props): React.JSX.Element | null {
  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: y,
        left: x,
        zIndex: 10000,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '4px 0',
        minWidth: 160,
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, i) =>
        item.separator ? (
          <div
            key={i}
            style={{ height: 1, background: 'var(--border)', margin: '4px 8px' }}
          />
        ) : (
          <button
            key={i}
            onClick={() => {
              if (!item.disabled) {
                item.action()
                onClose()
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '6px 12px',
              border: 'none',
              background: 'transparent',
              color: item.disabled ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: item.disabled ? 'default' : 'pointer',
              fontSize: 12,
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              if (!item.disabled) {
                ;(e.target as HTMLElement).style.background = 'var(--bg-hover)'
              }
            }}
            onMouseLeave={(e) => {
              ;(e.target as HTMLElement).style.background = 'transparent'
            }}
          >
            {item.icon && <span style={{ width: 16, textAlign: 'center' }}>{item.icon}</span>}
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.shortcut && (
              <span
                style={{
                  fontSize: 10,
                  opacity: 0.5,
                  fontFamily: 'monospace',
                  marginLeft: 16
                }}
              >
                {item.shortcut}
              </span>
            )}
          </button>
        )
      )}
    </div>
  )
}
