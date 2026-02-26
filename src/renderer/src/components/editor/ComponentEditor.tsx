import { useState, useCallback, useRef } from 'react'
import { v4 as uuid } from 'uuid'
import { useEditorStore } from '../../stores/editorStore'
import { importPsdFile, psdToComponentDefinition, type PsdLayerInfo } from '../../lib/psd'
import type { ComponentDefinition, ComponentSlot, Rect } from '../../types'

interface Props {
  /** Existing component to edit, or null for new */
  component?: ComponentDefinition | null
  onClose: () => void
  onSave: (component: ComponentDefinition) => void
}

const SLOT_COLORS = ['#e94560', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4']

export function ComponentEditor({ component, onClose, onSave }: Props): JSX.Element {
  const deck = useEditorStore((s) => s.currentDeck)

  const [name, setName] = useState(component?.name ?? '')
  const [description, setDescription] = useState(component?.description ?? '')
  const [width, setWidth] = useState(component?.width ?? (deck?.dimensions.width ?? 62))
  const [height, setHeight] = useState(component?.height ?? (deck?.dimensions.height ?? 100))
  const [slots, setSlots] = useState<ComponentSlot[]>(component?.slots ?? [])
  const [psdLayers, setPsdLayers] = useState<PsdLayerInfo[] | null>(null)
  const [psdSize, setPsdSize] = useState<{ width: number; height: number } | null>(null)
  const [slotMappings, setSlotMappings] = useState<
    Record<string, { type: 'text' | 'image' | 'number'; slotName: string }>
  >({})

  const fileInputRef = useRef<HTMLInputElement>(null)

  const addSlot = useCallback(() => {
    const slot: ComponentSlot = {
      id: uuid(),
      name: `Slot ${slots.length + 1}`,
      type: 'text',
      bounds: { x: 5, y: 5 + slots.length * 12, width: width - 10, height: 10 },
      defaultValue: ''
    }
    setSlots([...slots, slot])
  }, [slots, width])

  const updateSlot = useCallback(
    (id: string, updates: Partial<ComponentSlot>) => {
      setSlots(slots.map((s) => (s.id === id ? { ...s, ...updates } : s)))
    },
    [slots]
  )

  const removeSlot = useCallback(
    (id: string) => {
      setSlots(slots.filter((s) => s.id !== id))
    },
    [slots]
  )

  const updateSlotBounds = useCallback(
    (id: string, key: keyof Rect, value: number) => {
      setSlots(
        slots.map((s) => (s.id === id ? { ...s, bounds: { ...s.bounds, [key]: value } } : s))
      )
    },
    [slots]
  )

  const handlePsdImport = useCallback(async () => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      try {
        const result = await importPsdFile(file)
        setPsdLayers(result.layers)
        setPsdSize({ width: result.width, height: result.height })
      } catch (err) {
        console.error('PSD import failed:', err)
      }
    },
    []
  )

  const handlePsdMapping = useCallback(
    (layerName: string, type: 'text' | 'image' | 'number', slotName: string) => {
      setSlotMappings({ ...slotMappings, [layerName]: { type, slotName } })
    },
    [slotMappings]
  )

  const handleCreateFromPsd = useCallback(() => {
    if (!psdLayers || !psdSize) return
    const comp = psdToComponentDefinition(
      name || 'PSD Component',
      { ...psdSize, layers: psdLayers },
      width,
      height,
      slotMappings
    )
    onSave(comp)
  }, [psdLayers, psdSize, name, width, height, slotMappings, onSave])

  const handleSave = useCallback(() => {
    const now = new Date().toISOString()
    const comp: ComponentDefinition = {
      id: component?.id ?? uuid(),
      name: name || 'Untitled Component',
      description,
      width,
      height,
      layers: component?.layers ?? [],
      slots,
      createdAt: component?.createdAt ?? now,
      updatedAt: now
    }
    onSave(comp)
  }, [component, name, description, width, height, slots, onSave])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: 'var(--bg-primary, #1a1a2e)',
          border: '1px solid var(--border, #333)',
          borderRadius: 8,
          width: 720,
          maxHeight: '85vh',
          overflow: 'auto',
          padding: 24
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary, #fff)' }}>
            {component ? 'Edit Component' : 'New Component'}
          </h2>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        {/* Basic info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <label style={labelStyle}>
            Name
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Component name" />
          </label>
          <label style={labelStyle}>
            Description
            <input style={inputStyle} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
          </label>
          <label style={labelStyle}>
            Width (mm)
            <input style={inputStyle} type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} />
          </label>
          <label style={labelStyle}>
            Height (mm)
            <input style={inputStyle} type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
          </label>
        </div>

        {/* Visual Preview */}
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ color: 'var(--text-primary, #fff)', marginBottom: 8, fontSize: 14 }}>Preview</h3>
          <div
            style={{
              position: 'relative',
              width: width * 3,
              height: height * 3,
              background: '#fff',
              border: '1px solid var(--border, #333)',
              borderRadius: 4,
              overflow: 'hidden'
            }}
          >
            {slots.map((slot, i) => (
              <div
                key={slot.id}
                style={{
                  position: 'absolute',
                  left: slot.bounds.x * 3,
                  top: slot.bounds.y * 3,
                  width: slot.bounds.width * 3,
                  height: slot.bounds.height * 3,
                  border: `2px dashed ${SLOT_COLORS[i % SLOT_COLORS.length]}`,
                  background: `${SLOT_COLORS[i % SLOT_COLORS.length]}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  color: SLOT_COLORS[i % SLOT_COLORS.length],
                  fontWeight: 600,
                  pointerEvents: 'none'
                }}
              >
                {slot.name} ({slot.type})
              </div>
            ))}
          </div>
        </div>

        {/* Slots */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ color: 'var(--text-primary, #fff)', margin: 0, fontSize: 14 }}>Slots</h3>
            <button onClick={addSlot} style={btnStyle}>+ Add Slot</button>
          </div>

          {slots.map((slot, i) => (
            <div
              key={slot.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr auto',
                gap: 6,
                marginBottom: 6,
                alignItems: 'center'
              }}
            >
              <input
                style={inputStyle}
                value={slot.name}
                onChange={(e) => updateSlot(slot.id, { name: e.target.value })}
                placeholder="Slot name"
              />
              <select
                style={inputStyle}
                value={slot.type}
                onChange={(e) => updateSlot(slot.id, { type: e.target.value as 'text' | 'image' | 'number' })}
              >
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="number">Number</option>
              </select>
              <input style={inputStyle} type="number" value={slot.bounds.x} onChange={(e) => updateSlotBounds(slot.id, 'x', Number(e.target.value))} title="X" />
              <input style={inputStyle} type="number" value={slot.bounds.y} onChange={(e) => updateSlotBounds(slot.id, 'y', Number(e.target.value))} title="Y" />
              <input style={inputStyle} type="number" value={slot.bounds.width} onChange={(e) => updateSlotBounds(slot.id, 'width', Number(e.target.value))} title="W" />
              <input style={inputStyle} type="number" value={slot.bounds.height} onChange={(e) => updateSlotBounds(slot.id, 'height', Number(e.target.value))} title="H" />
              <button onClick={() => removeSlot(slot.id)} style={{ ...closeBtnStyle, fontSize: 14 }}>✕</button>
            </div>
          ))}
        </div>

        {/* PSD Import */}
        <div style={{ marginBottom: 16, padding: 12, background: 'var(--bg-secondary, #16213e)', borderRadius: 6 }}>
          <h3 style={{ color: 'var(--text-primary, #fff)', margin: '0 0 8px', fontSize: 14 }}>Import from PSD</h3>
          <input ref={fileInputRef} type="file" accept=".psd" style={{ display: 'none' }} onChange={handleFileChange} />
          <button onClick={handlePsdImport} style={btnStyle}>Choose PSD File</button>

          {psdLayers && (
            <div style={{ marginTop: 12 }}>
              <p style={{ color: 'var(--text-muted, #999)', fontSize: 12, marginBottom: 8 }}>
                {psdSize?.width}×{psdSize?.height}px — {psdLayers.length} layers found. Map layers to slots:
              </p>
              {psdLayers.map((layer) => (
                <PsdLayerMapping key={layer.name} layer={layer} onMap={handlePsdMapping} mappings={slotMappings} />
              ))}
              <button onClick={handleCreateFromPsd} style={{ ...btnStyle, marginTop: 8, background: '#4CAF50' }}>
                Create Component from PSD
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ ...btnStyle, background: '#555' }}>Cancel</button>
          <button onClick={handleSave} style={{ ...btnStyle, background: '#2196F3' }}>Save Component</button>
        </div>
      </div>
    </div>
  )
}

function PsdLayerMapping({
  layer,
  onMap,
  mappings
}: {
  layer: PsdLayerInfo
  onMap: (name: string, type: 'text' | 'image' | 'number', slotName: string) => void
  mappings: Record<string, { type: 'text' | 'image' | 'number'; slotName: string }>
}): JSX.Element {
  const mapping = mappings[layer.name]
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4, fontSize: 12 }}>
      <span style={{ color: '#ccc', width: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {layer.hasText ? '📝' : layer.hasImage ? '🖼️' : '📦'} {layer.name}
      </span>
      <select
        style={{ ...inputStyle, fontSize: 11, padding: '2px 4px' }}
        value={mapping?.type ?? ''}
        onChange={(e) => {
          if (e.target.value) onMap(layer.name, e.target.value as any, mapping?.slotName ?? layer.name)
        }}
      >
        <option value="">— skip —</option>
        <option value="text">Text slot</option>
        <option value="image">Image slot</option>
        <option value="number">Number slot</option>
      </select>
      {mapping && (
        <input
          style={{ ...inputStyle, fontSize: 11, padding: '2px 4px', width: 100 }}
          value={mapping.slotName}
          onChange={(e) => onMap(layer.name, mapping.type, e.target.value)}
          placeholder="Slot name"
        />
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'var(--bg-tertiary, #0f3460)',
  border: '1px solid var(--border, #333)',
  borderRadius: 4,
  color: 'var(--text-primary, #fff)',
  padding: '4px 8px',
  fontSize: 12,
  width: '100%'
}

const labelStyle: React.CSSProperties = {
  color: 'var(--text-muted, #999)',
  fontSize: 11,
  display: 'flex',
  flexDirection: 'column',
  gap: 4
}

const btnStyle: React.CSSProperties = {
  background: 'var(--accent, #e94560)',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  padding: '6px 12px',
  fontSize: 12,
  cursor: 'pointer',
  fontWeight: 600
}

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted, #999)',
  cursor: 'pointer',
  fontSize: 18
}
