import React from "react"
import { useEditorStore } from '../../stores/editorStore'
import type { EditorView, EditorMode } from '../../types'
import { Tooltip } from '../Tooltip'

interface ToolbarProps {
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
}

const views: { id: EditorView; label: string; icon: string }[] = [
  { id: 'design', label: 'Design', icon: '◆' },
  { id: 'data', label: 'Data', icon: '☰' },
  { id: 'score', label: 'Score', icon: '🎯' },
  { id: 'export', label: 'Export', icon: '⎙' },
  { id: 'settings', label: 'Settings', icon: '⚙' }
]

const tools: { id: EditorMode; label: string; icon: string; shortcut: string }[] = [
  { id: 'select', label: 'Select', icon: '↖', shortcut: 'V' },
  { id: 'text', label: 'Text', icon: 'T', shortcut: 'T' },
  { id: 'shape', label: 'Shape', icon: '▭', shortcut: 'R' },
  { id: 'image', label: 'Image', icon: '▣', shortcut: 'I' },
  { id: 'pan', label: 'Pan', icon: '☐', shortcut: 'H' }
]

export function Toolbar({ saveStatus = 'idle' }: ToolbarProps): React.JSX.Element {
  const view = useEditorStore((s) => s.view)
  const mode = useEditorStore((s) => s.mode)
  const zoom = useEditorStore((s) => s.zoom)
  const deckName = useEditorStore((s) => s.currentDeck?.name ?? '')
  const editingSide = useEditorStore((s) => s.editingSide)
  const showLayoutGuides = useEditorStore((s) => s.showLayoutGuides)
  const showGrid = useEditorStore((s) => s.showGrid)
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds)
  const setView = useEditorStore((s) => s.setView)
  const setMode = useEditorStore((s) => s.setMode)
  const setZoom = useEditorStore((s) => s.setZoom)
  const setEditingSide = useEditorStore((s) => s.setEditingSide)
  const toggleLayoutGuides = useEditorStore((s) => s.toggleLayoutGuides)
  const toggleGrid = useEditorStore((s) => s.toggleGrid)
  const alignLayers = useEditorStore((s) => s.alignLayers)
  const distributeLayers = useEditorStore((s) => s.distributeLayers)

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
            style={view === v.id ? { borderBottom: '2px solid var(--accent)', borderRadius: '4px 4px 0 0' } : undefined}
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
              <Tooltip key={t.id} text={`${t.label} (${t.shortcut})`} position="bottom">
                <button
                  className={`btn btn-icon btn-sm ${mode === t.id ? 'btn-active' : ''}`}
                  onClick={() => setMode(t.id)}
                >
                  {t.icon}
                </button>
              </Tooltip>
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

          <div className="toolbar-separator" />

          {/* Alignment (show when 2+ layers selected) */}
          {selectedLayerIds.length >= 2 && (
            <>
              <div className="toolbar-group">
                <Tooltip text="Align left" position="bottom">
                  <button className="btn btn-icon btn-sm" onClick={() => alignLayers('left')}>⫣</button>
                </Tooltip>
                <Tooltip text="Align center horizontally" position="bottom">
                  <button className="btn btn-icon btn-sm" onClick={() => alignLayers('center-h')}>⫤</button>
                </Tooltip>
                <Tooltip text="Align right" position="bottom">
                  <button className="btn btn-icon btn-sm" onClick={() => alignLayers('right')}>⫢</button>
                </Tooltip>
                <span style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 4px' }} />
                <Tooltip text="Align top" position="bottom">
                  <button className="btn btn-icon btn-sm" onClick={() => alignLayers('top')}>⫪</button>
                </Tooltip>
                <Tooltip text="Align center vertically" position="bottom">
                  <button className="btn btn-icon btn-sm" onClick={() => alignLayers('center-v')}>⫫</button>
                </Tooltip>
                <Tooltip text="Align bottom" position="bottom">
                  <button className="btn btn-icon btn-sm" onClick={() => alignLayers('bottom')}>⫬</button>
                </Tooltip>
              </div>
              <div className="toolbar-separator" />
            </>
          )}

          {/* Distribute (show when 3+ layers selected) */}
          {selectedLayerIds.length >= 3 && (
            <>
              <div className="toolbar-group">
                <Tooltip text="Distribute horizontally" position="bottom">
                  <button className="btn btn-sm btn-ghost" onClick={() => distributeLayers('horizontal')}>⟷</button>
                </Tooltip>
                <Tooltip text="Distribute vertically" position="bottom">
                  <button className="btn btn-sm btn-ghost" onClick={() => distributeLayers('vertical')}>⟼</button>
                </Tooltip>
              </div>
              <div className="toolbar-separator" />
            </>
          )}

          {/* Grid & Guides */}
          <div className="toolbar-group">
            <Tooltip text="Toggle grid" position="bottom">
              <button
                className={`btn btn-sm ${showGrid ? 'btn-active' : 'btn-ghost'}`}
                onClick={toggleGrid}
              >
                # Grid
              </button>
            </Tooltip>
            <Tooltip text="Toggle layout guides" position="bottom">
              <button
                className={`btn btn-sm ${showLayoutGuides ? 'btn-active' : 'btn-ghost'}`}
                onClick={toggleLayoutGuides}
              >
                📐 Guides
              </button>
            </Tooltip>
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
        <Tooltip text="Undo (⌘Z)" position="bottom">
          <button
            className="btn btn-icon btn-sm btn-ghost"
            onClick={() => useEditorStore.temporal.getState().undo()}
          >
            ↩
          </button>
        </Tooltip>
        <Tooltip text="Redo (⌘⇧Z)" position="bottom">
          <button
            className="btn btn-icon btn-sm btn-ghost"
            onClick={() => useEditorStore.temporal.getState().redo()}
          >
            ↪
          </button>
        </Tooltip>
      </div>
    </div>
  )
}
