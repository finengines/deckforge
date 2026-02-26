import React, { useEffect, useState } from 'react'

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000
}

const modalStyle: React.CSSProperties = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: 32,
  maxWidth: 380,
  width: '90%',
  textAlign: 'center',
  boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
}

export function AboutDialog(): React.JSX.Element | null {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const api = (window as any).api
    if (api?.on) {
      const unsub = api.on('menu:about', () => setOpen(true))
      return () => { if (typeof unsub === 'function') unsub() }
    }
    return undefined
  }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  if (!open) return null

  return (
    <div style={overlayStyle} onClick={() => setOpen(false)}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), #a78bfa, #ec4899)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, margin: '0 auto 16px',
          boxShadow: '0 0 40px var(--accent-muted)'
        }}>
          🃏
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>DeckForge</h2>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          Version 1.0.0
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Design, create, and print custom card decks
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
          Built by Fin Spenceley
        </p>
        <a
          href="https://github.com/finengines/deckforge"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}
          onClick={(e) => {
            e.preventDefault()
            window.open('https://github.com/finengines/deckforge', '_blank')
          }}
        >
          GitHub →
        </a>
        <div style={{ marginTop: 20 }}>
          <button className="btn btn-sm btn-ghost" onClick={() => setOpen(false)}>Close</button>
        </div>
      </div>
    </div>
  )
}
