import React, { useState } from "react"
import { v4 as uuid } from 'uuid'
import { useEditorStore } from '../../stores/editorStore'
import { ColorPicker } from '../ColorPicker'
import type { Layer, TextLayer, ShapeLayer, Fill, Stroke, Shadow } from '../../types'

// Common system fonts + popular web fonts (Google Fonts compatible)
const AVAILABLE_FONTS = [
  // Sans-serif - Modern
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Raleway',
  'Source Sans Pro',
  'Nunito',
  'Ubuntu',
  'Rubik',
  'Work Sans',
  'DM Sans',
  'Outfit',
  'Space Grotesko',
  'Manrope',
  'Plus Jakarta Sans',
  
  // Sans-serif - Display/Headings
  'Oswald',
  'Bebas Neue',
  'Anton',
  'Barlow',
  'Archivo',
  'Quicksand',
  'Exo 2',
  'Orbitron',
  'Audiowide',
  
  // Serif
  'Playfair Display',
  'Merriweather',
  'Lora',
  'PT Serif',
  'Crimson Text',
  'Libre Baskerville',
  'Bitter',
  'Cardo',
  'Spectral',
  'Georgia',
  'Garamond',
  'Times New Roman',
  'Palatino Linotype',
  'Bookman Old Style',
  
  // Monospace
  'Fira Code',
  'JetBrains Mono',
  'Roboto Mono',
  'Source Code Pro',
  'Space Mono',
  'Courier New',
  'Lucida Console',
  
  // Display/Decorative
  'Righteous',
  'Pacifico',
  'Bangers',
  'Lobster',
  'Press Start 2P',
  'Fredoka One',
  'Permanent Marker',
  'Special Elite',
  
  // System fallbacks
  'system-ui',
  'Arial',
  'Verdana',
  'Trebuchet MS',
  'Tahoma',
  'Segoe UI',
  'Helvetica Neue',
  'Gill Sans',
  'Futura',
  'Impact',
  'Comic Sans MS'
]

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

  if (!deck) return <div />

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
      <div>
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
    <div>
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
            <label className="input-label">Position</label>
            <div className="form-row" style={{ gap: 4 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, opacity: 0.6, marginBottom: 2 }}>X (mm)</div>
                <input
                  className="input"
                  type="number"
                  step="0.1"
                  value={selectedLayer.x.toFixed(2)}
                  onChange={(e) => update({ x: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, opacity: 0.6, marginBottom: 2 }}>Y (mm)</div>
                <input
                  className="input"
                  type="number"
                  step="0.1"
                  value={selectedLayer.y.toFixed(2)}
                  onChange={(e) => update({ y: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="input-label">Size</label>
            <div className="form-row" style={{ gap: 4 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, opacity: 0.6, marginBottom: 2 }}>W (mm)</div>
                <input
                  className="input"
                  type="number"
                  step="0.1"
                  value={selectedLayer.width.toFixed(2)}
                  onChange={(e) => update({ width: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, opacity: 0.6, marginBottom: 2 }}>H (mm)</div>
                <input
                  className="input"
                  type="number"
                  step="0.1"
                  value={selectedLayer.height.toFixed(2)}
                  onChange={(e) => update({ height: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="input-label">Rotation (°)</label>
            <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
              {[0, 45, 90, 180, 270].map((angle) => (
                <button
                  key={angle}
                  className="btn btn-sm btn-ghost"
                  style={{
                    flex: 1,
                    fontSize: 10,
                    padding: '2px 4px',
                    background: Math.abs(selectedLayer.rotation - angle) < 0.1 ? 'var(--accent)' : undefined,
                    color: Math.abs(selectedLayer.rotation - angle) < 0.1 ? 'white' : undefined
                  }}
                  onClick={() => update({ rotation: angle })}
                >
                  {angle}°
                </button>
              ))}
            </div>
            <input
              className="input"
              type="number"
              step="1"
              value={Math.round(selectedLayer.rotation)}
              onChange={(e) => update({ rotation: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label className="input-label">Opacity: {Math.round(selectedLayer.opacity * 100)}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(selectedLayer.opacity * 100)}
              onChange={(e) => update({ opacity: parseInt(e.target.value, 10) / 100 })}
              style={{ width: '100%' }}
            />
          </div>
        </PropSection>

        {/* Fill/Stroke/Shadow/Blur for all layer types except groups */}
        {selectedLayer.type !== 'group' && (
          <>
            <PropSection title="Fill" defaultOpen={false}>
              <div className="form-group">
                {(selectedLayer.fills || []).map((fill, idx) => (
                  <div key={fill.id} style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: 2, fontSize: 10 }}
                      onClick={() => {
                        const fills = [...(selectedLayer.fills || [])]
                        fills[idx].hidden = !fills[idx].hidden
                        update({ fills })
                      }}
                      title={fill.hidden ? 'Show' : 'Hide'}
                    >
                      {fill.hidden ? '🚫' : '👁'}
                    </button>
                    <div style={{ flex: 1 }}>
                      <input
                        type="color"
                        value={fill.color}
                        onChange={(e) => {
                          const fills = [...(selectedLayer.fills || [])]
                          fills[idx].color = e.target.value
                          update({ fills })
                        }}
                        style={{ width: 30, height: 20, border: 'none', borderRadius: 3, cursor: 'pointer' }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={fill.opacity * 100}
                      onChange={(e) => {
                        const fills = [...(selectedLayer.fills || [])]
                        fills[idx].opacity = parseInt(e.target.value) / 100
                        update({ fills })
                      }}
                      style={{ flex: 2 }}
                    />
                    <span style={{ fontSize: 10, minWidth: 30 }}>{Math.round(fill.opacity * 100)}%</span>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: 2, fontSize: 10 }}
                      onClick={() => {
                        const fills = (selectedLayer.fills || []).filter((_, i) => i !== idx)
                        update({ fills })
                      }}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => {
                    const fills = [...(selectedLayer.fills || []), {
                      id: uuid(),
                      color: '#000000',
                      opacity: 1,
                      hidden: false
                    } as Fill]
                    update({ fills })
                  }}
                  style={{ width: '100%', marginTop: 4 }}
                >
                  + Add Fill
                </button>
              </div>
            </PropSection>

            <PropSection title="Stroke" defaultOpen={false}>
              <div className="form-group">
                {(selectedLayer.strokes || []).map((stroke, idx) => (
                  <div key={stroke.id} style={{ marginBottom: 8, padding: 6, background: 'var(--bg-tertiary)', borderRadius: 4 }}>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: 2, fontSize: 10 }}
                        onClick={() => {
                          const strokes = [...(selectedLayer.strokes || [])]
                          strokes[idx].hidden = !strokes[idx].hidden
                          update({ strokes })
                        }}
                        title={stroke.hidden ? 'Show' : 'Hide'}
                      >
                        {stroke.hidden ? '🚫' : '👁'}
                      </button>
                      <input
                        type="color"
                        value={stroke.color}
                        onChange={(e) => {
                          const strokes = [...(selectedLayer.strokes || [])]
                          strokes[idx].color = e.target.value
                          update({ strokes })
                        }}
                        style={{ width: 30, height: 20, border: 'none', borderRadius: 3, cursor: 'pointer' }}
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={stroke.width}
                        onChange={(e) => {
                          const strokes = [...(selectedLayer.strokes || [])]
                          strokes[idx].width = parseFloat(e.target.value) || 0
                          update({ strokes })
                        }}
                        placeholder="Width"
                        className="input"
                        style={{ flex: 1, fontSize: 10 }}
                      />
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: 2, fontSize: 10 }}
                        onClick={() => {
                          const strokes = (selectedLayer.strokes || []).filter((_, i) => i !== idx)
                          update({ strokes })
                        }}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <select
                        value={stroke.style}
                        onChange={(e) => {
                          const strokes = [...(selectedLayer.strokes || [])]
                          strokes[idx].style = e.target.value as 'solid' | 'dashed' | 'dotted'
                          update({ strokes })
                        }}
                        className="input"
                        style={{ flex: 1, fontSize: 10 }}
                      >
                        <option value="solid">Solid</option>
                        <option value="dashed">Dashed</option>
                        <option value="dotted">Dotted</option>
                      </select>
                      <select
                        value={stroke.alignment}
                        onChange={(e) => {
                          const strokes = [...(selectedLayer.strokes || [])]
                          strokes[idx].alignment = e.target.value as 'inside' | 'center' | 'outside'
                          update({ strokes })
                        }}
                        className="input"
                        style={{ flex: 1, fontSize: 10 }}
                      >
                        <option value="inside">Inside</option>
                        <option value="center">Center</option>
                        <option value="outside">Outside</option>
                      </select>
                    </div>
                  </div>
                ))}
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => {
                    const strokes = [...(selectedLayer.strokes || []), {
                      id: uuid(),
                      color: '#000000',
                      width: 1,
                      style: 'solid',
                      alignment: 'center',
                      opacity: 1,
                      hidden: false
                    } as Stroke]
                    update({ strokes })
                  }}
                  style={{ width: '100%', marginTop: 4 }}
                >
                  + Add Stroke
                </button>
              </div>
            </PropSection>

            <PropSection title="Shadow" defaultOpen={false}>
              <div className="form-group">
                {(selectedLayer.shadows || []).map((shadow, idx) => (
                  <div key={shadow.id} style={{ marginBottom: 8, padding: 6, background: 'var(--bg-tertiary)', borderRadius: 4 }}>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: 2, fontSize: 10 }}
                        onClick={() => {
                          const shadows = [...(selectedLayer.shadows || [])]
                          shadows[idx].hidden = !shadows[idx].hidden
                          update({ shadows })
                        }}
                        title={shadow.hidden ? 'Show' : 'Hide'}
                      >
                        {shadow.hidden ? '🚫' : '👁'}
                      </button>
                      <select
                        value={shadow.style}
                        onChange={(e) => {
                          const shadows = [...(selectedLayer.shadows || [])]
                          shadows[idx].style = e.target.value as 'drop' | 'inner'
                          update({ shadows })
                        }}
                        className="input"
                        style={{ flex: 1, fontSize: 10 }}
                      >
                        <option value="drop">Drop</option>
                        <option value="inner">Inner</option>
                      </select>
                      <input
                        type="color"
                        value={shadow.color}
                        onChange={(e) => {
                          const shadows = [...(selectedLayer.shadows || [])]
                          shadows[idx].color = e.target.value
                          update({ shadows })
                        }}
                        style={{ width: 30, height: 20, border: 'none', borderRadius: 3, cursor: 'pointer' }}
                      />
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: 2, fontSize: 10 }}
                        onClick={() => {
                          const shadows = (selectedLayer.shadows || []).filter((_, i) => i !== idx)
                          update({ shadows })
                        }}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 10 }}>
                      <input
                        type="number"
                        value={shadow.offsetX}
                        onChange={(e) => {
                          const shadows = [...(selectedLayer.shadows || [])]
                          shadows[idx].offsetX = parseFloat(e.target.value) || 0
                          update({ shadows })
                        }}
                        placeholder="X"
                        className="input"
                      />
                      <input
                        type="number"
                        value={shadow.offsetY}
                        onChange={(e) => {
                          const shadows = [...(selectedLayer.shadows || [])]
                          shadows[idx].offsetY = parseFloat(e.target.value) || 0
                          update({ shadows })
                        }}
                        placeholder="Y"
                        className="input"
                      />
                      <input
                        type="number"
                        min="0"
                        value={shadow.blur}
                        onChange={(e) => {
                          const shadows = [...(selectedLayer.shadows || [])]
                          shadows[idx].blur = parseFloat(e.target.value) || 0
                          update({ shadows })
                        }}
                        placeholder="Blur"
                        className="input"
                      />
                      <input
                        type="number"
                        value={shadow.spread}
                        onChange={(e) => {
                          const shadows = [...(selectedLayer.shadows || [])]
                          shadows[idx].spread = parseFloat(e.target.value) || 0
                          update({ shadows })
                        }}
                        placeholder="Spread"
                        className="input"
                      />
                    </div>
                  </div>
                ))}
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => {
                    const shadows = [...(selectedLayer.shadows || []), {
                      id: uuid(),
                      style: 'drop',
                      color: '#000000',
                      opacity: 0.5,
                      offsetX: 0,
                      offsetY: 2,
                      blur: 4,
                      spread: 0,
                      hidden: false
                    } as Shadow]
                    update({ shadows })
                  }}
                  style={{ width: '100%', marginTop: 4 }}
                >
                  + Add Shadow
                </button>
              </div>
            </PropSection>

            <PropSection title="Blur" defaultOpen={false}>
              <div className="form-group">
                <label className="input-label">
                  <input
                    type="checkbox"
                    checked={!(selectedLayer.blur?.hidden ?? true)}
                    onChange={(e) => {
                      update({
                        blur: {
                          value: selectedLayer.blur?.value ?? 5,
                          hidden: !e.target.checked
                        }
                      })
                    }}
                    style={{ marginRight: 6 }}
                  />
                  Enable Blur
                </label>
                {selectedLayer.blur && !selectedLayer.blur.hidden && (
                  <>
                    <label className="input-label" style={{ marginTop: 8 }}>
                      Blur: {selectedLayer.blur.value.toFixed(1)} px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="0.5"
                      value={selectedLayer.blur.value}
                      onChange={(e) => {
                        update({
                          blur: {
                            ...selectedLayer.blur!,
                            value: parseFloat(e.target.value)
                          }
                        })
                      }}
                      style={{ width: '100%' }}
                    />
                  </>
                )}
              </div>
            </PropSection>
          </>
        )}

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
        <select
          className="input"
          value={AVAILABLE_FONTS.includes(layer.fontFamily) ? layer.fontFamily : '__custom__'}
          onChange={(e) => {
            if (e.target.value !== '__custom__') {
              onUpdate({ fontFamily: e.target.value })
            }
          }}
        >
          {AVAILABLE_FONTS.map((f) => (
            <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
          ))}
          <option value="__custom__">Custom font...</option>
        </select>
      </div>
      {!AVAILABLE_FONTS.includes(layer.fontFamily) && (
        <div className="form-group">
          <label className="input-label">Custom Font Name</label>
          <input
            className="input"
            type="text"
            value={layer.fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            placeholder="e.g., MyCustomFont"
          />
        </div>
      )}
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
