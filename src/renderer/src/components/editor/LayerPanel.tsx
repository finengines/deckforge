import React from "react"
import { useEditorStore } from '../../stores/editorStore'
import type { Layer, GroupLayer } from '../../types'

const layerIcons: Record<string, string> = {
  text: 'T',
  image: '🖼',
  shape: '◻',
  group: '📁',
  component: '🧩'
}

interface LayerTreeItemProps {
  layer: Layer
  depth: number
  isSelected: boolean
  onSelect: (id: string, multi: boolean) => void
  onToggleVisibility: (e: React.MouseEvent, id: string, visible: boolean) => void
  onRemove: (e: React.MouseEvent, id: string) => void
  onToggleExpand?: (e: React.MouseEvent) => void
  isExpanded?: boolean
}

function LayerTreeItem({
  layer,
  depth,
  isSelected,
  onSelect,
  onToggleVisibility,
  onRemove,
  onToggleExpand,
  isExpanded
}: LayerTreeItemProps): React.JSX.Element {
  return (
    <>
      <div
        className={`layer-item ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: depth * 12 + 8 }}
        onClick={(e) => onSelect(layer.id, e.shiftKey)}
      >
        {layer.type === 'group' && (
          <span
            onClick={onToggleExpand}
            style={{
              cursor: 'pointer',
              marginRight: 4,
              fontSize: 10,
              display: 'inline-block',
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s'
            }}
          >
            ▶
          </span>
        )}
        <span className="layer-item-icon">{layerIcons[layer.type] ?? '?'}</span>
        <span className="layer-item-name">{layer.name}</span>
        {layer.bindTo && (
          <span style={{ fontSize: 9, opacity: 0.6, marginLeft: 4 }} title={`Bound to: ${layer.bindTo}`}>
            🔗
          </span>
        )}
        <button
          className="btn btn-ghost btn-sm"
          style={{ padding: 2, fontSize: 10, opacity: 0.5 }}
          onClick={(e) => onToggleVisibility(e, layer.id, !layer.visible)}
          title={layer.visible ? 'Hide layer' : 'Show layer'}
        >
          {layer.visible ? '👁' : '🚫'}
        </button>
        <button
          className="btn btn-ghost btn-sm"
          style={{ padding: 2, fontSize: 10, opacity: layer.locked ? 0.8 : 0.3 }}
          onClick={(e) => {
            e.stopPropagation()
            const updateLayer = useEditorStore.getState().updateLayer
            updateLayer(layer.id, { locked: !layer.locked })
          }}
          title={layer.locked ? 'Unlock layer (Ctrl+L)' : 'Lock layer (Ctrl+L)'}
        >
          {layer.locked ? '🔒' : '🔓'}
        </button>
        <button
          className="btn btn-ghost btn-sm"
          style={{ padding: 2, fontSize: 10, opacity: 0.5 }}
          onClick={(e) => onRemove(e, layer.id)}
        >
          ✕
        </button>
      </div>

      {/* Render children if group is expanded */}
      {layer.type === 'group' && isExpanded && (layer as GroupLayer).children.map((child) => (
        <LayerTreeItemWithState key={child.id} layer={child} depth={depth + 1} />
      ))}
    </>
  )
}

// Wrapper component to manage expand state per group
function LayerTreeItemWithState({ layer, depth }: { layer: Layer; depth: number }): React.JSX.Element {
  const [isExpanded, setIsExpanded] = React.useState(true)
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds)
  const selectLayers = useEditorStore((s) => s.selectLayers)
  const updateLayer = useEditorStore((s) => s.updateLayer)
  const removeLayer = useEditorStore((s) => s.removeLayer)

  const isSelected = selectedLayerIds.includes(layer.id)

  const handleSelect = (id: string, multi: boolean): void => {
    if (multi) {
      // Multi-select: toggle this layer
      if (selectedLayerIds.includes(id)) {
        selectLayers(selectedLayerIds.filter((lid) => lid !== id))
      } else {
        selectLayers([...selectedLayerIds, id])
      }
    } else {
      selectLayers([id])
    }
  }

  const handleToggleVisibility = (e: React.MouseEvent, id: string, visible: boolean): void => {
    e.stopPropagation()
    updateLayer(id, { visible })
  }

  const handleRemove = (e: React.MouseEvent, id: string): void => {
    e.stopPropagation()
    removeLayer(id)
  }

  const handleToggleExpand = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <LayerTreeItem
      layer={layer}
      depth={depth}
      isSelected={isSelected}
      onSelect={handleSelect}
      onToggleVisibility={handleToggleVisibility}
      onRemove={handleRemove}
      onToggleExpand={layer.type === 'group' ? handleToggleExpand : undefined}
      isExpanded={layer.type === 'group' ? isExpanded : undefined}
    />
  )
}

export const LayerPanel = React.memo(function LayerPanel(): React.JSX.Element {
  const deck = useEditorStore((s) => s.currentDeck)
  const editingSide = useEditorStore((s) => s.editingSide)
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds)
  const groupLayers = useEditorStore((s) => s.groupLayers)
  const ungroupLayer = useEditorStore((s) => s.ungroupLayer)
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

  const handleGroupSelected = (): void => {
    if (selectedLayerIds.length >= 2) {
      groupLayers(selectedLayerIds)
    }
  }

  const handleUngroupSelected = (): void => {
    if (selectedLayerIds.length === 1) {
      ungroupLayer(selectedLayerIds[0])
    }
  }

  // Check if selection contains a group
  const selectedIsGroup = selectedLayerIds.length === 1 &&
    srcLayers.find((l) => l.id === selectedLayerIds[0])?.type === 'group'

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Layers</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn btn-sm btn-ghost" onClick={handleAddText} title="Add text layer">
            T
          </button>
          <button className="btn btn-sm btn-ghost" onClick={handleAddShape} title="Add shape layer">
            ◻
          </button>
          <button className="btn btn-sm btn-ghost" onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml'
            input.onchange = async () => {
              const file = input.files?.[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = () => {
                addLayer({
                  id: crypto.randomUUID(),
                  type: 'image',
                  name: file.name.substring(0, 30),
                  x: 5,
                  y: 12,
                  width: 52,
                  height: 50,
                  rotation: 0,
                  opacity: 1,
                  visible: true,
                  locked: false,
                  src: reader.result as string,
                  fit: 'cover',
                  filters: { brightness: 0, contrast: 0, saturation: 0, blur: 0, grayscale: false }
                })
              }
              reader.readAsDataURL(file)
            }
            input.click()
          }} title="Add image layer">
            🖼
          </button>
        </div>
      </div>

      {/* Group/Ungroup controls */}
      {selectedLayerIds.length > 0 && (
        <div style={{
          padding: 4,
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          gap: 4
        }}>
          {selectedLayerIds.length >= 2 && (
            <button
              className="btn btn-sm"
              onClick={handleGroupSelected}
              title="Group selected layers (Ctrl/Cmd+G)"
            >
              📁 Group
            </button>
          )}
          {selectedIsGroup && (
            <button
              className="btn btn-sm"
              onClick={handleUngroupSelected}
              title="Ungroup (Ctrl/Cmd+Shift+G)"
            >
              📂 Ungroup
            </button>
          )}
        </div>
      )}

      <div className="panel-content">
        {layers.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: 16, textAlign: 'center', lineHeight: 1.6 }}>
            <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>◇</div>
            <div>Drag layers here or click <strong>+</strong> to add</div>
            <div style={{ fontSize: 10, marginTop: 6 }}>
              Use <kbd style={{ padding: '1px 4px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 3, fontSize: 10 }}>T</kbd> for text, <kbd style={{ padding: '1px 4px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 3, fontSize: 10 }}>R</kbd> for shapes
            </div>
          </div>
        )}
        {layers.map((layer: Layer) => (
          <LayerTreeItemWithState key={layer.id} layer={layer} depth={0} />
        ))}
      </div>
    </div>
  )
})
