import React from "react"
import { useEditorStore } from '../../stores/editorStore'
import type { Layer } from '../../types'

const layerIcons: Record<string, string> = {
  text: 'T',
  image: '🖼',
  shape: '◻',
  group: '📁',
  component: '🧩'
}

export function LayerPanel(): React.JSX.Element {
  const deck = useEditorStore((s) => s.currentDeck)
  const editingSide = useEditorStore((s) => s.editingSide)
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds)
  const selectLayers = useEditorStore((s) => s.selectLayers)
  const updateLayer = useEditorStore((s) => s.updateLayer)
  const removeLayer = useEditorStore((s) => s.removeLayer)
  const addLayer = useEditorStore((s) => s.addLayer)

  if (!deck) return <div className="panel" />

  const template = editingSide === 'front' ? deck.frontTemplate : deck.backTemplate
  const srcLayers = editingSide === 'back' && template.backLayers !== null
    ? template.backLayers
    : template.frontLayers
  const layers = [...srcLayers].reverse() // Show top layers first

  const handleAddText = (): void => {
    addLayer({
      id: crypto.randomUUID(),
      type: 'text',
      name: 'Text',
      x: 10,
      y: 10,
      width: 40,
      height: 10,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      text: 'New Text',
      fontSize: 4,
      fontFamily: 'Inter',
      fontWeight: '400',
      fontStyle: 'normal',
      fill: '#000000',
      align: 'left',
      verticalAlign: 'top',
      lineHeight: 1.2,
      letterSpacing: 0,
      textDecoration: ''
    })
  }

  const handleAddShape = (): void => {
    addLayer({
      id: crypto.randomUUID(),
      type: 'shape',
      name: 'Rectangle',
      x: 10,
      y: 10,
      width: 30,
      height: 20,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      shapeKind: 'rect',
      fill: '#6366f1',
      stroke: '#4f46e5',
      strokeWidth: 0,
      cornerRadius: 0
    })
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Layers</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn btn-sm btn-ghost" onClick={handleAddText} title="Add text">
            T
          </button>
          <button className="btn btn-sm btn-ghost" onClick={handleAddShape} title="Add shape">
            ◻
          </button>
        </div>
      </div>
      <div className="panel-content">
        {layers.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: 11, padding: 8 }}>
            No layers yet. Add elements using the toolbar or buttons above.
          </div>
        )}
        {layers.map((layer: Layer) => (
          <div
            key={layer.id}
            className={`layer-item ${selectedLayerIds.includes(layer.id) ? 'selected' : ''}`}
            onClick={() => selectLayers([layer.id])}
          >
            <span className="layer-item-icon">{layerIcons[layer.type] ?? '?'}</span>
            <span className="layer-item-name">{layer.name}</span>
            <button
              className="btn btn-ghost btn-sm"
              style={{ padding: 2, fontSize: 10, opacity: 0.5 }}
              onClick={(e) => {
                e.stopPropagation()
                updateLayer(layer.id, { visible: !layer.visible })
              }}
            >
              {layer.visible ? '👁' : '🚫'}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              style={{ padding: 2, fontSize: 10, opacity: 0.5 }}
              onClick={(e) => {
                e.stopPropagation()
                removeLayer(layer.id)
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
