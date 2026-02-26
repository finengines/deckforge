import { useEditorStore } from '../../stores/editorStore'
import type { EditorView, EditorMode } from '../../types'

interface ToolbarProps {
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
}

const views: { id: EditorView; label: string; icon: string }[] = [
  { id: 'design', label: 'Design', icon: '🎨' },
  { id: 'data', label: 'Data', icon: '📊' },
  { id: 'export', label: 'Export', icon: '🖨️' },
  { id: 'settings', label: 'Settings', icon: '⚙️' }
]

const tools: { id: EditorMode; label: string; icon: string; shortcut: string }[] = [
  { id: 'select', label: 'Select', icon: '⬆', shortcut: 'V' },
  { id: 'text', label: 'Text', icon: 'T', shortcut: 'T' },
  { id: 'shape', label: 'Shape', icon: '◻', shortcut: 'R' },
  { id: 'image', label: 'Image', icon: '🖼', shortcut: 'I' },
  { id: 'pan', label: 'Pan', icon: '✋', shortcut: 'H' }
]

export function Toolbar({ saveStatus = 'idle' }: ToolbarProps): JSX.Element {
  const view = useEditorStore((s) => s.view)
  const mode = useEditorStore((s) => s.mode)
  const zoom = useEditorStore((s) => s.zoom)
  const deckName = useEditorStore((s) => s.currentDeck?.name ?? '')
  const editingSide = useEditorStore((s) => s.editingSide)
  const setView = useEditorStore((s) => s.setView)
  const setMode = useEditorStore((s) => s.setMode)
  const setZoom = useEditorStore((s) => s.setZoom)
  const setEditingSide = useEditorStore((s) => s.setEditingSide)

  return (
    <div className="toolbar">
      {/* Deck name */}
      <div className="toolbar-group">
        <span style={{ fontWeight: 600, fontSize: 14 }}>🃏 {deckName}</span>
      </div>

      <div className="toolbar-separator" />

      {/* View tabs */}
      <div className="toolbar-group">
        {views.map((v) => (
          <button
            key={v.id}
            className={`btn btn-ghost btn-sm ${view === v.id ? 'btn-active' : ''}`}
            onClick={() => setView(v.id)}
          >
            {v.icon} {v.label}
          </button>
        ))}
      </div>

      {view === 'design' && (
        <>
          <div className="toolbar-separator" />

          {/* Design tools */}
          <div className="toolbar-group">
            {tools.map((t) => (
              <button
                key={t.id}
                className={`btn btn-icon btn-sm tooltip ${mode === t.id ? 'btn-active' : ''}`}
                onClick={() => setMode(t.id)}
                data-tooltip={`${t.label} (${t.shortcut})`}
              >
                {t.icon}
              </button>
            ))}
          </div>

          <div className="toolbar-separator" />

          {/* Front/Back toggle */}
          <div className="toolbar-group">
            <button
              className={`btn btn-sm ${editingSide === 'front' ? 'btn-active' : ''}`}
              onClick={() => setEditingSide('front')}
            >
              Front
            </button>
            <button
              className={`btn btn-sm ${editingSide === 'back' ? 'btn-active' : ''}`}
              onClick={() => setEditingSide('back')}
            >
              Back
            </button>
          </div>

          <div className="toolbar-separator" />

          {/* Zoom */}
          <div className="toolbar-group">
            <button
              className="btn btn-icon btn-sm"
              onClick={() => setZoom(zoom - 0.1)}
            >
              −
            </button>
            <span style={{ fontSize: 11, minWidth: 40, textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              className="btn btn-icon btn-sm"
              onClick={() => setZoom(zoom + 0.1)}
            >
              +
            </button>
          </div>
        </>
      )}

      {/* Save status */}
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        {saveStatus === 'saving' && '💾 Saving...'}
        {saveStatus === 'saved' && '✅ Saved'}
        {saveStatus === 'error' && '❌ Save failed'}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Undo/Redo */}
      <div className="toolbar-group">
        <button
          className="btn btn-icon btn-sm btn-ghost tooltip"
          onClick={() => useEditorStore.temporal.getState().undo()}
          data-tooltip="Undo (⌘Z)"
        >
          ↩
        </button>
        <button
          className="btn btn-icon btn-sm btn-ghost tooltip"
          onClick={() => useEditorStore.temporal.getState().redo()}
          data-tooltip="Redo (⌘⇧Z)"
        >
          ↪
        </button>
      </div>
    </div>
  )
}
