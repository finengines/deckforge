import React, { useState } from "react"
import { useEditorStore } from '../../stores/editorStore'
import { ColorPicker } from '../ColorPicker'
import type { Layer, TextLayer, ShapeLayer } from '../../types'

function PropSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }): React.JSX.Element {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="prop-section">
      <div className="prop-section-header" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span className={`prop-section-toggle${open ? '' : ' collapsed'}`}>▼</span>
      </div>
      {open && children}
    </div>
  )
}

export const PropertiesPanel = React.memo(function PropertiesPanel(): React.JSX.Element {
  const deck = useEditorStore((s) => s.currentDeck)
  const editingSide = useEditorStore((s) => s.editingSide)
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds)
  const lastSelectedLayerId = useEditorStore((s) => s.lastSelectedLayerId)
  const updateLayer = useEditorStore((s) => s.updateLayer)

  if (!deck) return <div className="panel" />

  const template = editingSide === 'front' ? deck.frontTemplate : deck.backTemplate
  const allLayers = editingSide === 'back' && template.backLayers !== null
    ? template.backLayers
    : template.frontLayers

  const findLayer = (layers: Layer[], id: string): Layer | undefined => {
    for (const l of layers) {
      if (l.id === id) return l
      if (l.type === 'group') {
        const found = findLayer(l.children, id)
        if (found) return found
      }
    }
    return undefined
  }

  const selectedLayer =
    selectedLayerIds.length === 1
      ? findLayer(allLayers, selectedLayerIds[0])
      : lastSelectedLayerId
        ? findLayer(allLayers, lastSelectedLayerId)
        : undefined

  if (!selectedLayer) {
    return (
      <div className="panel">
        <div className="panel-header">Properties</div>
        <div className="panel-content">
          <div style={{ color: 'var(--text-muted)', fontSize: 11, padding: 8 }}>
            Select a layer to edit its properties
          </div>
        </div>
      </div>
    )
  }

  const update = (updates: Partial<Layer>): void => {
    updateLayer(selectedLayer.id, updates)
  }

  return (
    <div className="panel">
      <div className="panel-header">Properties</div>
      <div className="panel-content">
        <PropSection title="General">
          <div className="form-group">
            <label className="input-label">Name</label>
            <input
              className="input"
              value={selectedLayer.name}
              onChange={(e) => update({ name: e.target.value })}
            />
          </div>
        </PropSection>

        <PropSection title="Transform">
          <div className="form-group">
            <label className="input-label">Position (mm)</label>
            <div className="form-row">
              <input
                className="input"
                type="number"
                value={selectedLayer.x}
                onChange={(e) => update({ x: parseFloat(e.target.value) || 0 })}
                style={{ width: '50%' }}
                placeholder="X"
              />
              <input
                className="input"
                type="number"
                value={selectedLayer.y}
                onChange={(e) => update({ y: parseFloat(e.target.value) || 0 })}
                style={{ width: '50%' }}
                placeholder="Y"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="input-label">Size (mm)</label>
            <div className="form-row">
              <input
                className="input"
                type="number"
                value={selectedLayer.width}
                onChange={(e) => update({ width: parseFloat(e.target.value) || 0 })}
                style={{ width: '50%' }}
                placeholder="W"
              />
              <input
                className="input"
                type="number"
                value={selectedLayer.height}
                onChange={(e) => update({ height: parseFloat(e.target.value) || 0 })}
                style={{ width: '50%' }}
                placeholder="H"
              />
            </div>
          </div>
          <div className="form-group">
            <div className="form-row">
              <div style={{ flex: 1 }}>
                <label className="input-label">Rotation</label>
                <input
                  className="input"
                  type="number"
                  value={selectedLayer.rotation}
                  onChange={(e) => update({ rotation: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="input-label">Opacity</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  max={1}
                  step={0.1}
                  value={selectedLayer.opacity}
                  onChange={(e) => update({ opacity: parseFloat(e.target.value) || 1 })}
                />
              </div>
            </div>
          </div>
        </PropSection>

        <PropSection title="Data Binding" defaultOpen={false}>
          <div className="form-group">
            <label className="input-label">Bind to card data</label>
            <select
              className="input"
              value={selectedLayer.bindTo ?? ''}
              onChange={(e) => update({ bindTo: e.target.value || undefined })}
            >
              <option value="">None</option>
              <option value="name">Card Name</option>
              <option value="description">Description</option>
              <option value="funFact">Fun Fact</option>
              <option value="image">Card Image</option>
              {deck.categories.map((cat) => (
                <option key={cat.id} value={`stat:${cat.id}`}>
                  Stat: {cat.name}
                </option>
              ))}
            </select>
          </div>
        </PropSection>

        {/* Type-specific properties */}
        {selectedLayer.type === 'text' && (
          <TextProperties layer={selectedLayer as TextLayer} onUpdate={update} />
        )}
        {selectedLayer.type === 'shape' && (
          <ShapeProperties layer={selectedLayer as ShapeLayer} onUpdate={update} />
        )}
      </div>
    </div>
  )
})

function TextProperties({
  layer,
  onUpdate
}: {
  layer: TextLayer
  onUpdate: (u: Partial<TextLayer>) => void
}): React.JSX.Element {
  return (
    <>
      <div className="form-group">
        <label className="input-label">Text</label>
        <textarea
          className="input"
          rows={3}
          value={layer.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          style={{ resize: 'vertical' }}
        />
      </div>
      <div className="form-group">
        <label className="input-label">Font</label>
        <input
          className="input"
          value={layer.fontFamily}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
        />
      </div>
      <div className="form-group">
        <div className="form-row">
          <div style={{ flex: 1 }}>
            <label className="input-label">Size (mm)</label>
            <input
              className="input"
              type="number"
              value={layer.fontSize}
              onChange={(e) => onUpdate({ fontSize: parseFloat(e.target.value) || 4 })}
            />
          </div>
          <div style={{ flex: 1 }}>
            <ColorPicker label="Color" color={layer.fill} onChange={(c) => onUpdate({ fill: c })} />
          </div>
        </div>
      </div>
      <div className="form-group">
        <label className="input-label">Align</label>
        <div className="form-row">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              className={`btn btn-sm ${layer.align === align ? 'btn-active' : ''}`}
              onClick={() => onUpdate({ align })}
              style={{ flex: 1 }}
            >
              {align === 'left' ? '⬅' : align === 'center' ? '⬛' : '➡'}
            </button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="input-label">Weight</label>
        <select
          className="input"
          value={layer.fontWeight}
          onChange={(e) => onUpdate({ fontWeight: e.target.value })}
        >
          <option value="300">Light</option>
          <option value="400">Regular</option>
          <option value="500">Medium</option>
          <option value="600">Semibold</option>
          <option value="700">Bold</option>
          <option value="800">Extra Bold</option>
        </select>
      </div>
    </>
  )
}

function ShapeProperties({
  layer,
  onUpdate
}: {
  layer: ShapeLayer
  onUpdate: (u: Partial<ShapeLayer>) => void
}): React.JSX.Element {
  return (
    <>
      <div className="form-group">
        <div className="form-row">
          <div style={{ flex: 1 }}>
            <ColorPicker label="Fill" color={layer.fill} onChange={(c) => onUpdate({ fill: c })} />
          </div>
          <div style={{ flex: 1 }}>
            <ColorPicker label="Stroke" color={layer.stroke} onChange={(c) => onUpdate({ stroke: c })} />
          </div>
        </div>
      </div>
      <div className="form-group">
        <label className="input-label">Stroke Width</label>
        <input
          className="input"
          type="number"
          min={0}
          value={layer.strokeWidth}
          onChange={(e) => onUpdate({ strokeWidth: parseFloat(e.target.value) || 0 })}
        />
      </div>
      <div className="form-group">
        <label className="input-label">Corner Radius</label>
        <input
          className="input"
          type="number"
          min={0}
          value={layer.cornerRadius ?? 0}
          onChange={(e) => onUpdate({ cornerRadius: parseFloat(e.target.value) || 0 })}
        />
      </div>
    </>
  )
}
