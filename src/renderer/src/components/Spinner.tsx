import React from 'react'

const spinnerKeyframes = `
@keyframes deckforge-spin {
  to { transform: rotate(360deg); }
}
`

export function Spinner({ size = 24, color = 'var(--accent)' }: { size?: number; color?: string }): React.JSX.Element {
  return (
    <>
      <style>{spinnerKeyframes}</style>
      <div style={{
        width: size,
        height: size,
        border: `${Math.max(2, size / 8)}px solid var(--bg-tertiary)`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'deckforge-spin 0.6s linear infinite',
        display: 'inline-block',
        flexShrink: 0
      }} />
    </>
  )
}

export function SpinnerOverlay({ message }: { message?: string }): React.JSX.Element {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 32, gap: 12, color: 'var(--text-muted)', fontSize: 12
    }}>
      <Spinner size={32} />
      {message && <span>{message}</span>}
    </div>
  )
}

export function CardSkeleton(): React.JSX.Element {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
      borderRadius: 'var(--radius)', background: 'var(--bg-tertiary)',
      marginBottom: 4, animation: 'deckforge-spin 1.5s ease-in-out infinite alternate',
      opacity: 0.5
    }}>
      <div style={{ width: 32, height: 40, borderRadius: 4, background: 'var(--border)' }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: '60%', height: 10, borderRadius: 2, background: 'var(--border)', marginBottom: 4 }} />
        <div style={{ width: '40%', height: 8, borderRadius: 2, background: 'var(--border)' }} />
      </div>
    </div>
  )
}
