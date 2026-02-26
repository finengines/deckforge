import React, { useEffect, useState } from 'react'

interface ShortcutEntry {
  action: string
  mac: string
  win: string
}

interface ShortcutCategory {
  name: string
  shortcuts: ShortcutEntry[]
}

const categories: ShortcutCategory[] = [
  {
    name: 'General',
    shortcuts: [
      { action: 'Undo', mac: '⌘Z', win: 'Ctrl+Z' },
      { action: 'Redo', mac: '⌘⇧Z', win: 'Ctrl+Shift+Z' },
      { action: 'Copy', mac: '⌘C', win: 'Ctrl+C' },
      { action: 'Paste', mac: '⌘V', win: 'Ctrl+V' },
      { action: 'Duplicate', mac: '⌘D', win: 'Ctrl+D' },
      { action: 'Delete', mac: 'Delete', win: 'Delete / Backspace' },
      { action: 'Keyboard Shortcuts', mac: '?', win: '?' }
    ]
  },
  {
    name: 'Canvas',
    shortcuts: [
      { action: 'Zoom In', mac: '⌘+', win: 'Ctrl+=' },
      { action: 'Zoom Out', mac: '⌘−', win: 'Ctrl+−' },
      { action: 'Zoom to Fit', mac: '⌘0', win: 'Ctrl+0' },
      { action: 'Toggle Grid', mac: '⌘G', win: 'Ctrl+G' },
      { action: 'Nudge 1mm', mac: '← → ↑ ↓', win: '← → ↑ ↓' },
      { action: 'Nudge 10mm', mac: '⇧ + Arrow', win: 'Shift + Arrow' }
    ]
  },
  {
    name: 'Views',
    shortcuts: [
      { action: 'Design View', mac: '⌘1', win: 'Ctrl+1' },
      { action: 'Data View', mac: '⌘2', win: 'Ctrl+2' },
      { action: 'Export View', mac: '⌘3', win: 'Ctrl+3' },
      { action: 'Settings', mac: '⌘,', win: 'Ctrl+,' }
    ]
  },
  {
    name: 'Tools',
    shortcuts: [
      { action: 'Select Tool', mac: 'V', win: 'V' },
      { action: 'Text Tool', mac: 'T', win: 'T' },
      { action: 'Shape Tool', mac: 'R', win: 'R' },
      { action: 'Image Tool', mac: 'I', win: 'I' },
      { action: 'Pan Tool', mac: 'H', win: 'H' }
    ]
  }
]

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
  padding: 24,
  maxWidth: 560,
  width: '90%',
  maxHeight: '80vh',
  overflow: 'auto',
  boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20
}

const catStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: 'var(--accent)',
  marginTop: 16,
  marginBottom: 8
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '4px 0',
  fontSize: 12,
  borderBottom: '1px solid var(--border)'
}

const kbdStyle: React.CSSProperties = {
  padding: '2px 6px',
  background: 'var(--bg-tertiary)',
  border: '1px solid var(--border-light)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 11,
  fontFamily: 'monospace'
}

export function KeyboardShortcuts(): React.JSX.Element | null {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  // Listen for menu event
  useEffect(() => {
    const api = (window as any).api
    if (api?.on) {
      const unsub = api.on('menu:keyboard-shortcuts', () => setOpen(true))
      return () => { if (typeof unsub === 'function') unsub() }
    }
    return undefined
  }, [])

  if (!open) return null

  return (
    <div style={overlayStyle} onClick={() => setOpen(false)}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>⌨️ Keyboard Shortcuts</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 110px', gap: 0, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
          <span>Action</span>
          <span>macOS</span>
          <span>Windows</span>
        </div>

        {categories.map((cat) => (
          <div key={cat.name}>
            <div style={catStyle}>{cat.name}</div>
            {cat.shortcuts.map((s) => (
              <div key={s.action} style={rowStyle}>
                <span style={{ flex: 1 }}>{s.action}</span>
                <span style={{ width: 90 }}><kbd style={kbdStyle}>{s.mac}</kbd></span>
                <span style={{ width: 110 }}><kbd style={kbdStyle}>{s.win}</kbd></span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
