import React from "react"
import { useState, useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { useEditorStore } from '../../stores/editorStore'
import { ComponentEditor } from './ComponentEditor'
import type { ComponentDefinition, ComponentLayer } from '../../types'

export function ComponentLibrary(): React.JSX.Element {
  const deck = useEditorStore((s) => s.currentDeck)
  const addLayer = useEditorStore((s) => s.addLayer)
  const [editingComponent, setEditingComponent] = useState<ComponentDefinition | null | undefined>(undefined)
  // undefined = closed, null = new, ComponentDefinition = editing

  const components = deck?.components ?? []

  const handlePlaceOnCanvas = useCallback(
    (comp: ComponentDefinition) => {
      const layer: ComponentLayer = {
        id: uuid(),
        type: 'component',
        name: comp.name,
        x: 5,
        y: 5,
        width: comp.width,
        height: comp.height,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        componentId: comp.id,
        overrides: {}
      }
      addLayer(layer)
    },
    [addLayer]
  )

  const handleSave = useCallback(
    (comp: ComponentDefinition) => {
      if (!deck) return
      const store = useEditorStore.getState()
      const existing = deck.components.findIndex((c) => c.id === comp.id)
      const updated = [...deck.components]
      if (existing >= 0) {
        updated[existing] = comp
      } else {
        updated.push(comp)
      }
      // Update deck components via the store (use loadDeck to replace)
      store.loadDeck({ ...deck, components: updated })
      setEditingComponent(undefined)
    },
    [deck]
  )

  const handleDelete = useCallback(
    (id: string) => {
      if (!deck) return
      const store = useEditorStore.getState()
      store.loadDeck({ ...deck, components: deck.components.filter((c) => c.id !== id) })
    },
    [deck]
  )

  if (!deck) return <div />

  return (
    <div style={{ padding: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 13, color: 'var(--text-primary, #fff)' }}>Components</h3>
        <button
          onClick={() => setEditingComponent(null)}
          style={{
            background: 'var(--accent, #e94560)',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '4px 8px',
            fontSize: 11,
            cursor: 'pointer'
          }}
        >
          + New
        </button>
      </div>

      {components.length === 0 && (
        <p style={{ color: 'var(--text-muted, #666)', fontSize: 11, textAlign: 'center', padding: '16px 0' }}>
          No components yet. Create one or import from PSD.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {components.map((comp) => (
          <div
            key={comp.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 8px',
              background: 'var(--bg-secondary, #16213e)',
              borderRadius: 4,
              border: '1px solid var(--border, #333)',
              cursor: 'pointer'
            }}
            onClick={() => handlePlaceOnCanvas(comp)}
            title="Click to place on canvas"
          >
            {/* Thumbnail */}
            <div
              style={{
                width: 32,
                height: 40,
                background: '#fff',
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0,
                border: '1px solid #444'
              }}
            >
              {comp.slots.slice(0, 3).map((slot, i) => (
                <div
                  key={slot.id}
                  style={{
                    position: 'absolute',
                    left: `${(slot.bounds.x / comp.width) * 100}%`,
                    top: `${(slot.bounds.y / comp.height) * 100}%`,
                    width: `${(slot.bounds.width / comp.width) * 100}%`,
                    height: `${(slot.bounds.height / comp.height) * 100}%`,
                    background: ['#e9456044', '#2196F344', '#4CAF5044'][i % 3],
                    border: `1px solid ${['#e94560', '#2196F3', '#4CAF50'][i % 3]}`
                  }}
                />
              ))}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: 'var(--text-primary, #fff)', fontWeight: 500 }}>{comp.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted, #999)' }}>
                {comp.slots.length} slots · {comp.width}×{comp.height}mm
              </div>
            </div>

            <div style={{ display: 'flex', gap: 2 }}>
              <button
                onClick={(e) => { e.stopPropagation(); setEditingComponent(comp) }}
                style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 12 }}
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(comp.id) }}
                style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 12 }}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingComponent !== undefined && (
        <ComponentEditor
          component={editingComponent}
          onClose={() => setEditingComponent(undefined)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
