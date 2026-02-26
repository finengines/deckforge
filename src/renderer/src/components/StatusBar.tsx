import React from 'react'
import { useEditorStore } from '../stores/editorStore'

interface StatusBarProps {
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
}

const barStyle: React.CSSProperties = {
  height: 24,
  background: 'var(--bg-secondary)',
  borderTop: '1px solid var(--border)',
  display: 'flex',
  alignItems: 'center',
  padding: '0 12px',
  gap: 16,
  fontSize: 11,
  color: 'var(--text-muted)',
  flexShrink: 0
}

const dotStyle = (color: string): React.CSSProperties => ({
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: color,
  display: 'inline-block',
  marginRight: 4
})

export function StatusBar({ saveStatus = 'idle' }: StatusBarProps): React.JSX.Element {
  const zoom = useEditorStore((s) => s.zoom)
  const deck = useEditorStore((s) => s.currentDeck)

  const cardCount = deck?.cards.length ?? 0
  const deckName = deck?.name ?? ''

  const saveInfo = {
    idle: { color: 'var(--text-muted)', text: '' },
    saving: { color: 'var(--warning)', text: 'Saving…' },
    saved: { color: 'var(--success)', text: 'Saved' },
    error: { color: 'var(--danger)', text: 'Save failed' }
  }[saveStatus]

  return (
    <div style={barStyle}>
      <span>{Math.round(zoom * 100)}%</span>
      <span>{cardCount} card{cardCount !== 1 ? 's' : ''}</span>
      <span style={{ flex: 1 }}>{deckName}</span>
      {saveInfo.text && (
        <span>
          <span style={dotStyle(saveInfo.color)} />
          {saveInfo.text}
        </span>
      )}
    </div>
  )
}
