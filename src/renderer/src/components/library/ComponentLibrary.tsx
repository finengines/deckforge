import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import {
  componentPresets,
  presetCategories,
  getPresetsByCategory,
  type ComponentPreset
} from '../../lib/componentPresets'
import type { Layer } from '../../types'

interface ComponentLibraryProps {
  onAddLayers: (layers: Layer[]) => void
}

export default function ComponentLibrary({ onAddLayers }: ComponentLibraryProps): React.JSX.Element {
  const [activeCategory, setActiveCategory] = useState<ComponentPreset['category']>('stat-display')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPresets = searchQuery
    ? componentPresets.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : getPresetsByCategory(activeCategory)

  function handleAddPreset(preset: ComponentPreset): void {
    // Clone layers with fresh IDs so multiple instances don't conflict
    const clonedLayers = preset.layers.map((layer) => ({
      ...layer,
      id: uuid(),
      name: `${preset.name} - ${layer.name}`
    }))
    onAddLayers(clonedLayers)
  }

  return (
    <div className="component-library" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search */}
      <div style={{ padding: '8px' }}>
        <input
          type="text"
          placeholder="Search components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 10px',
            fontSize: '12px',
            border: '1px solid #3a3a3a',
            borderRadius: '4px',
            backgroundColor: '#2a2a2a',
            color: '#e0e0e0',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Category tabs */}
      {!searchQuery && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            padding: '0 8px 8px',
            borderBottom: '1px solid #3a3a3a'
          }}
        >
          {presetCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                border: activeCategory === cat.key ? '1px solid #5c9ce6' : '1px solid #3a3a3a',
                borderRadius: '4px',
                backgroundColor: activeCategory === cat.key ? '#1a3a5c' : '#2a2a2a',
                color: activeCategory === cat.key ? '#8cc4ff' : '#999',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              title={cat.label}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Preset list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {filteredPresets.length === 0 ? (
          <div style={{ color: '#666', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
            No components found
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filteredPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleAddPreset(preset)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '2px',
                  padding: '8px 10px',
                  border: '1px solid #3a3a3a',
                  borderRadius: '6px',
                  backgroundColor: '#2a2a2a',
                  color: '#e0e0e0',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'border-color 0.15s'
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#5c9ce6'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#3a3a3a'
                }}
                title={`Click to add "${preset.name}" to canvas`}
              >
                <div style={{ fontSize: '12px', fontWeight: 600 }}>{preset.name}</div>
                <div style={{ fontSize: '10px', color: '#888', lineHeight: 1.3 }}>
                  {preset.description}
                </div>
                <div style={{ fontSize: '9px', color: '#555', marginTop: '2px' }}>
                  {preset.layers.length} layer{preset.layers.length !== 1 ? 's' : ''} · {preset.width}×{preset.height}mm
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
